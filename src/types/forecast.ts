export interface ForecastPoint {
  day_offset: number;
  day: number;
  department: string;
  lstm: number;
  gru: number;
  status: "alert" | "safe";
  threshold: number;
}

export interface DepartmentForecast {
  name: string;
  threshold: number;
  forecasts: ForecastPoint[];
}

export interface ForecastResponse {
  horizon: number;
  units: string;
  departments: DepartmentForecast[];
}

export interface ModelMetric {
  MAE: number;
  RMSE: number;
  R2: number;
}

export interface MetricsResponse {
  lstm: ModelMetric;
  gru: ModelMetric;
}

export type DepartmentFilter = "AIML" | "Biotech" | "Both";
