import type { DepartmentForecast } from "@/types/forecast";
import { AlertTriangle } from "lucide-react";

const formatCalendarDate = (dayOffset: number): string => {
  const d = new Date();
  d.setDate(d.getDate() + dayOffset - 1);
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
};

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
      <div className="mb-4 flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-alert" />
            <h2 className="text-lg font-semibold">Upcoming Alert Days</h2>
            {alerts.length > 0 && (
              <span className="rounded-full bg-alert px-2.5 py-0.5 text-xs font-semibold text-white">
                {alerts.length} Alerts
              </span>
            )}
          </div>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Forecast days exceeding safety thresholds
          </p>
        </div>
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
                <th className="py-2 pr-4 font-medium">LSTM CFU/g</th>
                <th className="py-2 pr-4 font-medium">GRU CFU/g</th>
                <th className="py-2 pr-4 font-medium">Threshold</th>
                <th className="py-2 pr-4 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {alerts.map((a, i) => (
                <tr
                  key={i}
                  className="border-b last:border-0 hover:bg-accent/40"
                >
                  <td className="py-3 pr-4 font-medium">
                    Day {a.day_offset}
                    <span className="ml-1 text-xs font-normal text-muted-foreground">
                      · {formatCalendarDate(a.day_offset)}
                    </span>
                  </td>
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
                  <td className="py-3 pr-4">
                    <span className="rounded-full bg-alert/10 px-2.5 py-0.5 text-xs font-semibold text-alert">
                      Alert
                    </span>
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
