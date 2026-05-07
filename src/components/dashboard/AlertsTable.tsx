import type { DepartmentForecast } from "@/types/forecast";
import { AlertTriangle } from "lucide-react";

export const AlertsTable = ({
  departments,
}: {
  departments: DepartmentForecast[];
}) => {
  const alerts = departments.flatMap((d) =>
    d.forecasts
      .filter((f) => f.status === "alert")
      .map((f) => ({ ...f, dept: d.name })),
  );

  return (
    <div className="rounded-2xl border bg-card p-5 shadow-sm">
      <div className="mb-4 flex items-center gap-2">
        <AlertTriangle className="h-5 w-5 text-alert" />
        <h2 className="text-lg font-semibold">Risk Alerts</h2>
        <span className="ml-auto rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium">
          {alerts.length}
        </span>
      </div>

      {alerts.length === 0 ? (
        <div className="rounded-xl bg-safe/5 p-6 text-center text-sm text-safe">
          ✓ No threshold breaches predicted in the selected horizon.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-xs uppercase text-muted-foreground">
                <th className="py-2 pr-4 font-medium">Day</th>
                <th className="py-2 pr-4 font-medium">Department</th>
                <th className="py-2 pr-4 font-medium">LSTM</th>
                <th className="py-2 pr-4 font-medium">GRU</th>
                <th className="py-2 pr-4 font-medium">Threshold</th>
                <th className="py-2 pr-4 font-medium">Δ</th>
              </tr>
            </thead>
            <tbody>
              {alerts.map((a, i) => (
                <tr
                  key={i}
                  className="border-b last:border-0 hover:bg-accent/40"
                >
                  <td className="py-3 pr-4 font-medium">Day {a.day}</td>
                  <td className="py-3 pr-4">
                    <span
                      className="rounded-full px-2 py-0.5 text-xs font-medium"
                      style={{
                        background:
                          a.dept === "AIML"
                            ? "hsl(var(--aiml) / 0.12)"
                            : "hsl(var(--biotech) / 0.12)",
                        color:
                          a.dept === "AIML"
                            ? "hsl(var(--aiml))"
                            : "hsl(var(--biotech))",
                      }}
                    >
                      {a.dept}
                    </span>
                  </td>
                  <td className="py-3 pr-4 tabular-nums">
                    {a.lstm.toLocaleString()}
                  </td>
                  <td className="py-3 pr-4 font-semibold text-alert tabular-nums">
                    {a.gru.toLocaleString()}
                  </td>
                  <td className="py-3 pr-4 tabular-nums text-muted-foreground">
                    {a.threshold.toLocaleString()}
                  </td>
                  <td className="py-3 pr-4 font-medium text-alert tabular-nums">
                    +{(a.gru - a.threshold).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
