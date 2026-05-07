import type { MetricsResponse } from "@/types/forecast";

const Cell = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded-lg bg-secondary/50 px-3 py-2">
    <div className="text-[10px] uppercase tracking-wide text-muted-foreground">
      {label}
    </div>
    <div className="font-semibold tabular-nums">{value}</div>
  </div>
);

export const MetricsCards = ({
  metrics,
  loading,
}: {
  metrics?: MetricsResponse;
  loading: boolean;
}) => {
  if (loading || !metrics) {
    return (
      <div className="rounded-2xl border bg-card p-5 shadow-sm">
        <div className="h-24 animate-pulse rounded-lg bg-muted" />
      </div>
    );
  }

  const items = [
    { name: "LSTM", color: "hsl(var(--aiml))", m: metrics.lstm },
    { name: "GRU", color: "hsl(var(--foreground))", m: metrics.gru },
  ];

  return (
    <div className="rounded-2xl border bg-card p-5 shadow-sm">
      <div className="mb-4">
        <h2 className="text-lg font-semibold">Model Performance</h2>
        <p className="text-sm text-muted-foreground">
          Held-out evaluation metrics for the trained models.
        </p>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {items.map((it) => (
          <div key={it.name} className="rounded-xl border p-4">
            <div className="mb-3 flex items-center gap-2">
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ background: it.color }}
              />
              <div className="font-semibold">{it.name}</div>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <Cell label="MAE" value={it.m.MAE.toFixed(0)} />
              <Cell label="RMSE" value={it.m.RMSE.toFixed(0)} />
              <Cell label="R²" value={it.m.R2.toFixed(3)} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
