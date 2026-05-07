# main.py
import os
import json
from typing import List, Dict

import numpy as np
import pandas as pd
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from tensorflow.keras.models import load_model
import joblib

from src.config import DATA_PATH, MODELS_DIR, WINDOW_SIZE
from src.utils_io import load_data

# ----------------- FastAPI app -----------------

app = FastAPI(title="WBE 7-Day CFU Forecast API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],   # Lock down later
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ----------------- Paths -----------------

SCALER_X_PATH = os.path.join(MODELS_DIR, "scaler_x.joblib")
SCALER_Y_PATH = os.path.join(MODELS_DIR, "scaler_y.joblib")
LSTM_MODEL_PATH = os.path.join(MODELS_DIR, "lstm_best.h5")
GRU_MODEL_PATH  = os.path.join(MODELS_DIR, "gru_best.h5")
COMPARISON_PATH = os.path.join(MODELS_DIR, "comparison.json")

FEATURES = ["Day", "Sample", "Colonies", "Temperature", "pH", "Turbidity"]

# Encode departments
DEPT_CODES = {
    "AIML": 0,
    "Biotech": 1,
}

# UNIVERSAL SAFETY THRESHOLD
UNIVERSAL_THRESHOLD = 100000  # 100k CFU/g safe limit

# Forecast tuning constants
SMOOTH = 0.15
MIN_VARIATION_SCALE = 250.0
VARIATION_FACTOR = 0.005
LSTM_VARIATION_FREQUENCY = 0.7
GRU_VARIATION_FREQUENCY = 0.9
LSTM_VARIATION_SCALE = 0.6
GRU_VARIATION_SCALE = 1.0
MIN_LAST_CFU = 1.0
MIN_CFU = 0.0
MAX_CFU = 200000.0


# ----------------- Load all ML artifacts -----------------

x_scaler = joblib.load(SCALER_X_PATH)
y_scaler = joblib.load(SCALER_Y_PATH)

lstm_model = load_model(LSTM_MODEL_PATH, compile=False)
gru_model  = load_model(GRU_MODEL_PATH, compile=False)


# ----------------- API Endpoints -----------------

@app.get("/")
async def root():
    return {"status": "ok", "message": "WBE 7-Day CFU Forecast API running"}


@app.get("/metrics")
async def get_metrics():
    """Return LSTM/GRU model metrics."""
    if not os.path.exists(COMPARISON_PATH):
        raise HTTPException(status_code=404, detail="comparison.json not found")
    with open(COMPARISON_PATH, "r") as f:
        data = json.load(f)
    return data


@app.get("/forecast")
def forecast_endpoint(horizon: int = 7):

    DEPT_THRESHOLDS = {"AIML": 60000, "Biotech": 115000}  # Per-department safety thresholds

    # Load dataset
    df = pd.read_csv(DATA_PATH)

    # Identify departments from dataset
    departments = ["AIML", "Biotech"]
    results = []

    for dept in departments:
        dept_df = df[df["Sample"] == dept].copy()

        if dept_df.empty:
            continue  # No rows for this department

        # Apply per-department threshold
        threshold = DEPT_THRESHOLDS.get(dept, 60000)

        # Last WINDOW_SIZE rows for multi-step forecasting
        last_rows = dept_df.tail(WINDOW_SIZE)

        features = ["Day", "Sample", "Colonies", "Temperature", "pH", "Turbidity"]

        # Encode Sample → numeric
        dept_encoded = last_rows.copy()
        dept_encoded["Sample"] = dept_encoded["Sample"].map({"AIML": 0, "Biotech": 1})

        X_last = dept_encoded[features].values
        X_scaled = x_scaler.transform(X_last)
        X_input = X_scaled.reshape(1, WINDOW_SIZE, len(features))

        lstm_preds = []
        gru_preds = []

        X_current = X_input.copy()

        # Last real CFU (for optional smoothing)
        last_cfu = float(last_rows["CFU_g"].iloc[-1])

        # Build template row for future environmental values
        base_env = last_rows.iloc[-1].copy()
        base_env["Sample"] = 0 if dept == "AIML" else 1

        last_day = int(dept_df["Day"].max())
        for step in range(horizon):

            # Predict next CFU_g
            lstm_out = lstm_model.predict(X_current, verbose=0)[0][0]
            gru_out  = gru_model.predict(X_current, verbose=0)[0][0]

            lstm_val = float(y_scaler.inverse_transform([[lstm_out]])[0][0])
            gru_val  = float(y_scaler.inverse_transform([[gru_out]])[0][0])

            # Mild smoothing against latest measured value
            lstm_val = SMOOTH * lstm_val + (1 - SMOOTH) * last_cfu

            # Add slight deterministic variation so lines are not overly flat
            # Scale variation with CFU magnitude, but keep a small minimum oscillation.
            base_cfu = max(last_cfu, MIN_LAST_CFU)
            variation_scale = max(MIN_VARIATION_SCALE, VARIATION_FACTOR * base_cfu)
            lstm_val += LSTM_VARIATION_SCALE * variation_scale * np.sin((step + 1) * LSTM_VARIATION_FREQUENCY)
            gru_val += GRU_VARIATION_SCALE * variation_scale * np.sin((step + 1) * GRU_VARIATION_FREQUENCY)

            # Keep outputs in realistic bounds
            lstm_val = float(np.clip(lstm_val, MIN_CFU, MAX_CFU))
            gru_val = float(np.clip(gru_val, MIN_CFU, MAX_CFU))

            lstm_preds.append(lstm_val)
            gru_preds.append(gru_val)

            # Build next feature row (Day increases, env stays constant)
            next_row = base_env.copy()
            next_row["Day"] = last_day + step + 1

            next_scaled = x_scaler.transform(
                next_row[features].values.reshape(1, -1)
            )[0]

            # Roll window
            window_matrix = X_current.reshape(WINDOW_SIZE, len(features))
            window_matrix = np.vstack([window_matrix[1:], next_scaled])
            X_current = window_matrix.reshape(1, WINDOW_SIZE, len(features))

        # Build response for frontend
        forecast_list = []
        for i in range(horizon):
            day_num = last_day + i + 1

            # GRU-only alerting
            status = "alert" if gru_preds[i] > threshold else "safe"

            forecast_list.append({
                "day_offset": i + 1,
                "day": day_num,
                "department": dept,
                "lstm": round(lstm_preds[i]),
                "gru": round(gru_preds[i]),
                "status": status,
                "threshold": threshold
            })

        results.append({
            "name": dept,
            "threshold": threshold,
            "forecasts": forecast_list
        })

    return {
        "horizon": horizon,
        "units": "CFU/g",
        "departments": results
    }



# ----------------- Local Run -----------------
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
