import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { DepartmentForecast } from "@/types/forecast";

export const ForecastChart = ({ dept }: { dept: DepartmentForecast }) => {
  const data = dept.forecasts.map((f) => ({
    day: `Day ${f.day}`,
    LSTM: f.lstm,
    GRU: f.gru,
    threshold: f.threshold,
    status: f.status,
  }));

  const accentVar = dept.name === "AIML" ? "--aiml" : "--biotech";
  const accent = `hsl(var(${accentVar}))`;

  return (
    <div className="rounded-2xl border bg-card p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <div className="text-sm text-muted-foreground">Forecast</div>
          <div className="text-lg font-semibold">{dept.name} — CFU/g</div>
        </div>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{ background: accent }}
            />
            LSTM
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-foreground" />
            GRU
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-0.5 w-4 bg-alert" />
            Threshold
          </span>
        </div>
      </div>
      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 16, bottom: 0, left: -10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="day" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
            <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
            <Tooltip
              contentStyle={{
                background: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: 12,
              }}
              formatter={(v: number) => v.toLocaleString()}
            />
            <ReferenceLine
              y={dept.threshold}
              stroke="hsl(var(--alert))"
              strokeDasharray="6 4"
              label={{
                value: "Threshold",
                fill: "hsl(var(--alert))",
                fontSize: 11,
                position: "right",
              }}
            />
            <Line
              type="monotone"
              dataKey="LSTM"
              stroke={accent}
              strokeWidth={2.5}
              dot={{ r: 3 }}
              activeDot={{ r: 5 }}
            />
            <Line
              type="monotone"
              dataKey="GRU"
              stroke="hsl(var(--foreground))"
              strokeWidth={2.5}
              dot={(props: any) => {
                const { cx, cy, payload } = props;
                const alert = payload.GRU > payload.threshold;
                return (
                  <circle
                    cx={cx}
                    cy={cy}
                    r={alert ? 5 : 3}
                    fill={alert ? "hsl(var(--alert))" : "hsl(var(--foreground))"}
                    stroke="hsl(var(--card))"
                    strokeWidth={1.5}
                  />
                );
              }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
