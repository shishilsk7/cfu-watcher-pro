import {
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

export const ForecastChart = ({
  departments,
  horizon,
}: {
  departments: DepartmentForecast[];
  horizon: number;
}) => {
  const days = Array.from({ length: horizon }, (_, i) => i);
  const data = days.map((i) => {
    const row: Record<string, number | string> = { day: `Day ${i + 1}` };
    departments.forEach((d) => {
      const f = d.forecasts[i];
      if (f) {
        row[`${d.name} LSTM`] = f.lstm;
        row[`${d.name} GRU`] = f.gru;
      }
    });
    return row;
  });

  const colorFor = (name: string) =>
    name === "AIML" ? "hsl(var(--aiml))" : "hsl(var(--biotech))";

  return (
    <div className="rounded-2xl border bg-card p-5 shadow-sm">
      <div className="mb-4 flex items-start justify-between">
        <div>
          <div className="text-sm text-muted-foreground">
            {horizon}-Day CFU/g Forecast
          </div>
          <div className="text-lg font-semibold">
            LSTM vs GRU Model Comparison
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-end gap-3 text-xs text-muted-foreground">
          {departments.map((d) => (
            <span key={d.name} className="flex items-center gap-1.5">
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ background: colorFor(d.name) }}
              />
              {d.name}
            </span>
          ))}
        </div>
      </div>
      <div className="h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{ top: 10, right: 24, bottom: 0, left: -10 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis
              dataKey="day"
              tick={{ fontSize: 12 }}
              stroke="hsl(var(--muted-foreground))"
            />
            <YAxis
              tick={{ fontSize: 12 }}
              stroke="hsl(var(--muted-foreground))"
              tickFormatter={(v: number) =>
                v >= 1000 ? `${(v / 1000).toFixed(0)}k` : `${v}`
              }
              label={{
                value: "CFU/g",
                angle: -90,
                position: "insideLeft",
                offset: 20,
                style: { fontSize: 12, fill: "hsl(var(--muted-foreground))" },
              }}
            />
            <Tooltip
              contentStyle={{
                background: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: 12,
              }}
              formatter={(v: number) => v.toLocaleString()}
            />
            <Legend wrapperStyle={{ fontSize: 12 }} iconType="line" />
            {departments.map((d) => (
              <ReferenceLine
                key={`${d.name}-th`}
                y={d.threshold}
                stroke={colorFor(d.name)}
                strokeDasharray="6 4"
                strokeOpacity={0.7}
                label={{
                  value: `${d.name} Threshold`,
                  fill: colorFor(d.name),
                  fontSize: 11,
                  position: "right",
                }}
              />
            ))}
            {departments.map((d) => [
              <Line
                key={`${d.name}-lstm`}
                type="monotone"
                dataKey={`${d.name} LSTM`}
                stroke={colorFor(d.name)}
                strokeWidth={2.5}
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
              />,
              <Line
                key={`${d.name}-gru`}
                type="monotone"
                dataKey={`${d.name} GRU`}
                stroke={colorFor(d.name)}
                strokeDasharray="5 4"
                strokeWidth={2.5}
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
              />,
            ])}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
