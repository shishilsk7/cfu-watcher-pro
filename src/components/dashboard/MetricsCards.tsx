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

  const gruWins = metrics.gru.RMSE < metrics.lstm.RMSE;
  const rmseDiff = Math.abs(metrics.lstm.RMSE - metrics.gru.RMSE).toFixed(0);
  const winner = gruWins ? "GRU" : "LSTM";

  const items = [
    {
      name: "LSTM",
      color: "hsl(var(--aiml))",
      borderColor: "border-blue-200 dark:border-blue-900",
      headerBg: "bg-blue-50 dark:bg-blue-950/40",
      m: metrics.lstm,
      isBest: !gruWins,
    },
    {
      name: "GRU",
      color: "hsl(var(--safe))",
      borderColor: "border-green-200 dark:border-green-900",
      headerBg: "bg-green-50 dark:bg-green-950/40",
      m: metrics.gru,
      isBest: gruWins,
    },
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
          <div
            key={it.name}
            className={`rounded-xl border p-4 ${it.borderColor}`}
          >
            <div className={`-mx-4 -mt-4 mb-3 rounded-t-xl px-4 py-2.5 ${it.headerBg}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ background: it.color }}
                  />
                  <div className="font-semibold">{it.name}</div>
                </div>
                {it.isBest && (
                  <span className="rounded-full bg-safe/15 px-2.5 py-0.5 text-xs font-semibold text-safe">
                    Best
                  </span>
                )}
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <Cell label="MAE" value={it.m.MAE.toFixed(0)} />
              <Cell label="RMSE" value={it.m.RMSE.toFixed(0)} />
              <Cell label="R²" value={it.m.R2.toFixed(3)} />
            </div>
          </div>
        ))}
      </div>
      <p className="mt-3 text-sm text-muted-foreground">
        {winner} shows lower prediction error with {rmseDiff} CFU/g better RMSE
      </p>
    </div>
  );
};
