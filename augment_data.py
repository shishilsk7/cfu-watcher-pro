import json
import os
from dataclasses import dataclass

import numpy as np
import pandas as pd
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from sklearn.preprocessing import MinMaxScaler
from tensorflow.keras.callbacks import EarlyStopping

from src.config import MODELS_DIR
from src.gru_model import build_gru
from src.lstm_model import build_lstm


FEATURES = ["Day", "Sample", "Colonies", "Temperature", "pH", "Turbidity"]
TARGET = "CFU_g"
DEPARTMENTS = ["AIML", "Biotech"]
DEPT_ENCODING = {"AIML": 0, "Biotech": 1}
WINDOW_SIZE = 7
HORIZON = 1
NEW_ROWS_PER_DEPT = 62  # ~60-65 rows per department
RANDOM_SEED = 42
MAX_EPOCHS = 50
BATCH_SIZE = 16

BASELINES = {
    "lstm": {"MAE": 7623, "RMSE": 10217, "R2": 0.871},
    "gru": {"MAE": 7188, "RMSE": 9227, "R2": 0.895},
}


@dataclass
class DeptStats:
    mean: dict
    std: dict
    min: dict
    max: dict


NUMERIC_COLS = ["Day", "Colonies", "Temperature", "pH", "Turbidity", "CFU_g"]


def get_dept_stats(df: pd.DataFrame) -> dict:
    stats = {}
    for dept, dept_df in df.groupby("Sample"):
        numeric = dept_df[NUMERIC_COLS]
        stats[dept] = DeptStats(
            mean=numeric.mean().to_dict(),
            std=numeric.std(ddof=0).to_dict(),
            min=numeric.min().to_dict(),
            max=numeric.max().to_dict(),
        )
    return stats


def signed_noise(min_pct: float, max_pct: float) -> float:
    pct = np.random.uniform(min_pct, max_pct)
    return float(pct if np.random.rand() > 0.5 else -pct)


def generate_for_department(dept_df: pd.DataFrame, dept_stats: DeptStats, n_rows: int) -> pd.DataFrame:
    dept_df = dept_df.sort_values("Day").copy()
    last_row = dept_df.iloc[-1].copy()
    last_day = int(last_row["Day"])

    synthetic_rows = []

    for i in range(n_rows):
        next_day = last_day + i + 1

        prev_cfu = float(last_row["CFU_g"])
        prev_colonies = float(last_row["Colonies"])
        prev_temp = float(last_row["Temperature"])
        prev_ph = float(last_row["pH"])
        prev_turb = float(last_row["Turbidity"])

        # CFU_g: prev ±2-3%, bounded by (min*0.9, max*1.1)
        cfu_candidate = prev_cfu * (1.0 + signed_noise(0.02, 0.03))
        cfu_low = max(0.0, float(dept_stats.min["CFU_g"]) * 0.9)
        cfu_high = float(dept_stats.max["CFU_g"]) * 1.1
        next_cfu = float(np.clip(cfu_candidate, cfu_low, cfu_high))

        # Colonies: ±2%
        colonies_candidate = prev_colonies * (1.0 + signed_noise(0.02, 0.02))
        next_colonies = max(0.0, colonies_candidate)

        # Temperature: ±0.5 of last value
        temp_candidate = prev_temp + np.random.uniform(-0.5, 0.5)
        next_temp = max(0.0, temp_candidate)

        # pH: ±0.05 of last value
        ph_candidate = prev_ph + np.random.uniform(-0.05, 0.05)
        next_ph = max(0.0, ph_candidate)

        # Turbidity: ±0.1 of last value
        turb_candidate = prev_turb + np.random.uniform(-0.1, 0.1)
        next_turb = max(0.0, turb_candidate)

        new_row = {
            "Day": next_day,
            "Sample": last_row["Sample"],
            "Colonies": int(round(next_colonies)),
            "CFU_g": int(round(next_cfu)),
            "Temperature": round(next_temp, 2),
            "pH": round(next_ph, 2),
            "Turbidity": round(next_turb, 2),
            "is_synthetic": True,
        }
        synthetic_rows.append(new_row)

        last_row = pd.Series(new_row)

    return pd.DataFrame(synthetic_rows)


def add_windows_for_group(group_df, x_scaler, y_scaler, window_size=WINDOW_SIZE, horizon=HORIZON):
    encoded = group_df.copy()
    encoded["Sample"] = encoded["Sample"].map(DEPT_ENCODING)

    x_raw = encoded[FEATURES].astype(float).values
    y_raw = encoded[[TARGET]].astype(float).values

    x_scaled = x_scaler.transform(x_raw)
    y_scaled = y_scaler.transform(y_raw)

    X, y = [], []
    total_len = len(encoded)
    max_start = total_len - window_size - (horizon - 1)

    for start in range(max_start):
        end = start + window_size
        target_idx = end + (horizon - 1)
        X.append(x_scaled[start:end])
        y.append(y_scaled[target_idx])

    return X, y


def build_windows(df, x_scaler, y_scaler, dataset_name: str):
    X_all, y_all = [], []
    for dept in DEPARTMENTS:
        dept_df = df[df["Sample"] == dept].sort_values("Day")
        X, y = add_windows_for_group(dept_df, x_scaler, y_scaler)
        X_all.extend(X)
        y_all.extend(y)

    X_np = np.array(X_all)
    y_np = np.array(y_all)

    if len(X_np) == 0:
        raise ValueError(
            f"No windows generated for '{dataset_name}'. Check that each department has at least "
            f"{WINDOW_SIZE + HORIZON} rows (WINDOW_SIZE={WINDOW_SIZE}, HORIZON={HORIZON})."
        )

    return X_np, y_np


def evaluate_model(model, X_val, y_val, y_scaler):
    pred_scaled = model.predict(X_val, verbose=0)
    pred = y_scaler.inverse_transform(pred_scaled)
    true = y_scaler.inverse_transform(y_val)

    mae = float(mean_absolute_error(true, pred))
    rmse = float(np.sqrt(mean_squared_error(true, pred)))
    r2 = float(r2_score(true, pred))
    return {"MAE": mae, "RMSE": rmse, "R2": r2}


def meets_baseline(metrics, baseline):
    return (
        metrics["MAE"] <= baseline["MAE"]
        and metrics["RMSE"] <= baseline["RMSE"]
        and metrics["R2"] >= baseline["R2"]
    )


def train_model(model_name, X_train, y_train, X_val, y_val, y_scaler):
    input_shape = (X_train.shape[1], X_train.shape[2])
    model = build_lstm(input_shape) if model_name == "lstm" else build_gru(input_shape)

    callbacks = [
        EarlyStopping(
            monitor="val_loss",
            patience=10,
            restore_best_weights=True,
            verbose=1,
        )
    ]

    model.fit(
        X_train,
        y_train,
        validation_data=(X_val, y_val),
        epochs=MAX_EPOCHS,
        batch_size=BATCH_SIZE,
        callbacks=callbacks,
        verbose=1,
    )

    metrics = evaluate_model(model, X_val, y_val, y_scaler)
    return model, metrics


def main():
    np.random.seed(RANDOM_SEED)

    repo_root = os.path.abspath(os.path.dirname(__file__))
    input_csv = os.path.join(repo_root, "data", "WBE_large_dataset.csv")
    output_csv = os.path.join(repo_root, "data", "augmented_data.csv")

    original_df = pd.read_csv(input_csv)
    original_df = original_df[["Day", "Sample", "Colonies", "CFU_g", "Temperature", "pH", "Turbidity"]].copy()
    original_df["is_synthetic"] = False

    dept_stats = get_dept_stats(original_df)

    synthetic_frames = []
    for dept in DEPARTMENTS:
        dept_df = original_df[original_df["Sample"] == dept].copy()
        synthetic_dept = generate_for_department(dept_df, dept_stats[dept], NEW_ROWS_PER_DEPT)
        synthetic_frames.append(synthetic_dept)

    synthetic_df = pd.concat(synthetic_frames, ignore_index=True)
    augmented_df = pd.concat([original_df, synthetic_df], ignore_index=True)
    augmented_df = augmented_df.sort_values(["Day", "Sample"]).reset_index(drop=True)

    augmented_df.drop(columns=["is_synthetic"]).to_csv(output_csv, index=False)

    print(f"Saved augmented dataset: {output_csv}")

    # Quality checks
    print("\nQuality checks (CFU_g mean/std by department):")
    for dept in DEPARTMENTS:
        orig_dept = original_df[original_df["Sample"] == dept]
        aug_dept = augmented_df[augmented_df["Sample"] == dept]
        print(
            f"{dept} | before mean={orig_dept['CFU_g'].mean():.2f}, std={orig_dept['CFU_g'].std(ddof=0):.2f} "
            f"| after mean={aug_dept['CFU_g'].mean():.2f}, std={aug_dept['CFU_g'].std(ddof=0):.2f}"
        )

    print("\nOutlier check (>3 std from original mean, per department):")
    for dept in DEPARTMENTS:
        orig_dept = original_df[original_df["Sample"] == dept]
        syn_dept = synthetic_df[synthetic_df["Sample"] == dept]
        mu = orig_dept["CFU_g"].mean()
        sigma = orig_dept["CFU_g"].std(ddof=0)
        low, high = mu - 3 * sigma, mu + 3 * sigma
        outliers = syn_dept[(syn_dept["CFU_g"] < low) | (syn_dept["CFU_g"] > high)]
        print(f"{dept}: {len(outliers)} outliers")

    print("\nRows added per department:")
    for dept in DEPARTMENTS:
        print(f"{dept}: {NEW_ROWS_PER_DEPT}")

    # Retraining setup
    # Fit scalers on ORIGINAL data so saved models remain compatible with existing inference artifacts.
    scaler_base = original_df.copy()
    scaler_base["Sample"] = scaler_base["Sample"].map(DEPT_ENCODING)

    x_scaler = MinMaxScaler().fit(scaler_base[FEATURES].astype(float).values)
    y_scaler = MinMaxScaler().fit(scaler_base[[TARGET]].astype(float).values)

    X_train, y_train = build_windows(augmented_df, x_scaler, y_scaler, dataset_name="augmented")
    X_val, y_val = build_windows(original_df, x_scaler, y_scaler, dataset_name="original")

    results = {}
    for model_name in ["lstm", "gru"]:
        print(f"\nTraining {model_name.upper()} with augmented training and original validation...")
        model, metrics = train_model(model_name, X_train, y_train, X_val, y_val, y_scaler)
        baseline = BASELINES[model_name]
        improved = meets_baseline(metrics, baseline)

        print(
            f"{model_name.upper()} metrics: MAE={metrics['MAE']:.2f}, RMSE={metrics['RMSE']:.2f}, R2={metrics['R2']:.3f} | "
            f"baseline: MAE={baseline['MAE']}, RMSE={baseline['RMSE']}, R2={baseline['R2']} | "
            f"save_model={improved}"
        )

        model_path = os.path.join(MODELS_DIR, f"{model_name}_best.h5")
        if improved:
            model.save(model_path)
            print(f"Saved improved model: {model_path}")
        else:
            print(f"Did not overwrite existing model: {model_path}")

        results[model_name] = {
            "metrics": metrics,
            "baseline": baseline,
            "saved": improved,
        }

    out_metrics = os.path.join(MODELS_DIR, "augmented_training_metrics.json")
    with open(out_metrics, "w", encoding="utf-8") as f:
        json.dump(results, f, indent=2)
    print(f"\nSaved training summary: {out_metrics}")


if __name__ == "__main__":
    main()
