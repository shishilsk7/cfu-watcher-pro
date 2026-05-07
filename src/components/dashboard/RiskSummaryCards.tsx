import type { DepartmentForecast } from "@/types/forecast";
import type { MetricsResponse } from "@/types/forecast";
import { AlertTriangle, ShieldCheck, TrendingDown } from "lucide-react";

const fmt = (n: number) => n.toLocaleString();

function ModelComparisonCard({ metrics }: { metrics?: MetricsResponse }) {
  if (!metrics) return null;

  const gruWins = metrics.gru.RMSE < metrics.lstm.RMSE;
  const leader = gruWins ? "GRU" : "LSTM";
  const leaderMetrics = gruWins ? metrics.gru : metrics.lstm;
  const rmseDiff = Math.abs(metrics.lstm.RMSE - metrics.gru.RMSE).toFixed(0);

  return (
    <div className="relative overflow-hidden rounded-2xl border bg-card p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-sm text-muted-foreground">Model Comparison</div>
          <div className="mt-0.5 flex items-center gap-2">
            <div className="text-xl font-semibold">{leader} Leads</div>
            <span className="rounded-full bg-safe/10 px-2.5 py-0.5 text-xs font-medium text-safe">
              Best Model
            </span>
          </div>
        </div>
        <TrendingDown className="h-5 w-5 text-safe" />
      </div>
      <div className="mt-4 grid grid-cols-3 gap-3">
        {(["MAE", "RMSE", "R²"] as const).map((label) => {
          const key = label === "R²" ? "R2" : label;
          const val = leaderMetrics[key as keyof typeof leaderMetrics];
          return (
            <div key={label} className="rounded-lg bg-secondary/50 px-3 py-2">
              <div className="text-[10px] uppercase tracking-wide text-muted-foreground">
                {label}
              </div>
              <div className="font-semibold tabular-nums">
                {label === "R²" ? Number(val).toFixed(3) : Number(val).toFixed(0)}
              </div>
            </div>
          );
        })}
      </div>
      <p className="mt-3 text-xs text-muted-foreground">
        {leader} shows lower prediction error with {rmseDiff} CFU/g better RMSE
      </p>
    </div>
  );
}

export const RiskSummaryCards = ({
  departments,
  metrics,
}: {
  departments: DepartmentForecast[];
  metrics?: MetricsResponse;
}) => {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      {departments.map((d) => {
        const alertDays = d.forecasts.filter((f) => f.status === "alert").length;
        const maxPredicted = Math.max(...d.forecasts.map((f) => Math.max(f.lstm, f.gru)));
        const isHighRisk = alertDays > 0;

        return (
          <div
            key={d.name}
            className={`relative overflow-hidden rounded-2xl border p-5 shadow-sm transition ${
              isHighRisk
                ? "bg-alert/5 border-alert/20"
                : "bg-card"
            }`}
          >
            <div
              className="absolute inset-x-0 top-0 h-1"
              style={{
                background: isHighRisk
                  ? "hsl(var(--alert))"
                  : "hsl(var(--safe))",
              }}
            />
            <div className="flex items-start justify-between">
              <div>
                <div className="text-sm text-muted-foreground">Department</div>
                <div className="text-xl font-semibold">{d.name}</div>
              </div>
              <span
                className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
                  isHighRisk
                    ? "bg-alert/10 text-alert"
                    : "bg-safe/10 text-safe"
                }`}
              >
                {isHighRisk ? (
                  <AlertTriangle className="h-3.5 w-3.5" />
                ) : (
                  <ShieldCheck className="h-3.5 w-3.5" />
                )}
                {isHighRisk ? "High Risk" : "Safe"}
              </span>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-3">
              <div>
                <div className="text-xs text-muted-foreground">Threshold</div>
                <div className="text-lg font-bold tabular-nums">{fmt(d.threshold)}</div>
                <div className="text-xs text-muted-foreground">CFU/g</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Max Predicted</div>
                <div
                  className={`text-lg font-bold tabular-nums ${
                    isHighRisk ? "text-alert" : ""
                  }`}
                >
                  {fmt(maxPredicted)}
                </div>
                <div className="text-xs text-muted-foreground">CFU/g</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Alert Days</div>
                <div
                  className={`text-lg font-bold tabular-nums ${
                    alertDays > 0 ? "text-alert" : "text-safe"
                  }`}
                >
                  {alertDays}
                </div>
                <div className="text-xs text-muted-foreground">days</div>
              </div>
            </div>
          </div>
        );
      })}
      <ModelComparisonCard metrics={metrics} />
    </div>
  );
};
