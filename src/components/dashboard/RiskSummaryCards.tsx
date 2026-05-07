import type { DepartmentForecast } from "@/types/forecast";
import { AlertTriangle, ShieldCheck, TrendingUp } from "lucide-react";

const fmt = (n: number) => n.toLocaleString();

export const RiskSummaryCards = ({
  departments,
}: {
  departments: DepartmentForecast[];
}) => {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      {departments.map((d) => {
        const alerts = d.forecasts.filter((f) => f.status === "alert").length;
        const peak = Math.max(...d.forecasts.map((f) => f.gru));
        const isAlert = alerts > 0;
        const accent = d.name === "AIML" ? "aiml" : "biotech";
        return (
          <div
            key={d.name}
            className="relative overflow-hidden rounded-2xl border bg-card p-5 shadow-sm"
          >
            <div
              className={`absolute inset-x-0 top-0 h-1 bg-${accent}`}
              style={{
                background: `hsl(var(--${accent}))`,
              }}
            />
            <div className="flex items-start justify-between">
              <div>
                <div className="text-sm text-muted-foreground">Department</div>
                <div className="text-xl font-semibold">{d.name}</div>
              </div>
              <div
                className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${
                  isAlert
                    ? "bg-alert/10 text-alert"
                    : "bg-safe/10 text-safe"
                }`}
              >
                {isAlert ? (
                  <AlertTriangle className="h-3.5 w-3.5" />
                ) : (
                  <ShieldCheck className="h-3.5 w-3.5" />
                )}
                {isAlert ? `${alerts} alert${alerts > 1 ? "s" : ""}` : "Safe"}
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div>
                <div className="text-xs text-muted-foreground">Peak (GRU)</div>
                <div className="text-2xl font-bold tabular-nums">
                  {fmt(peak)}
                </div>
                <div className="text-xs text-muted-foreground">CFU/g</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Threshold</div>
                <div className="text-2xl font-bold tabular-nums">
                  {fmt(d.threshold)}
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <TrendingUp className="h-3 w-3" /> safety limit
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
