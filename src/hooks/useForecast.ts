import { useQuery } from "@tanstack/react-query";
import type { ForecastResponse, MetricsResponse } from "@/types/forecast";

const API_BASE =
  (import.meta as any).env?.VITE_API_BASE || "http://localhost:8000";

function mockForecast(horizon: number): ForecastResponse {
  const make = (dept: string, base: number, threshold: number) => {
    const forecasts = Array.from({ length: horizon }).map((_, i) => {
      const noise = Math.sin(i * 1.3) * 6000 + (Math.random() - 0.5) * 4000;
      const lstm = Math.round(base + noise);
      const gru = Math.round(base + noise * 1.15 + 2000);
      return {
        day_offset: i + 1,
        day: 120 + i + 1,
        department: dept,
        lstm,
        gru,
        status: (gru > threshold ? "alert" : "safe") as "alert" | "safe",
        threshold,
      };
    });
    return { name: dept, threshold, forecasts };
  };
  return {
    horizon,
    units: "CFU/g",
    departments: [
      make("AIML", 52000, 54100),
      make("Biotech", 96000, 108100),
    ],
  };
}

const mockMetrics: MetricsResponse = {
  lstm: { MAE: 7623.75, RMSE: 10217.28, R2: 0.871 },
  gru: { MAE: 7188.9, RMSE: 9227.85, R2: 0.895 },
};

export function useForecast(horizon: number) {
  return useQuery({
    queryKey: ["forecast", horizon],
    queryFn: async (): Promise<ForecastResponse> => {
      try {
        const r = await fetch(`${API_BASE}/forecast?horizon=${horizon}`);
        if (!r.ok) throw new Error("API error");
        return await r.json();
      } catch {
        return mockForecast(horizon);
      }
    },
  });
}

export function useMetrics() {
  return useQuery({
    queryKey: ["metrics"],
    queryFn: async (): Promise<MetricsResponse> => {
      try {
        const r = await fetch(`${API_BASE}/metrics`);
        if (!r.ok) throw new Error("API error");
        return await r.json();
      } catch {
        return mockMetrics;
      }
    },
  });
}

export async function pingApi(): Promise<boolean> {
  try {
    const r = await fetch(`${API_BASE}/`);
    return r.ok;
  } catch {
    return false;
  }
}
