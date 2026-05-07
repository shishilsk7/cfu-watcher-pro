import type { DepartmentFilter } from "@/types/forecast";

const HORIZONS = [3, 5, 7, 10, 14];
const DEPTS: DepartmentFilter[] = ["Both", "AIML", "Biotech"];

export const ControlsBar = ({
  horizon,
  onHorizonChange,
  dept,
  onDeptChange,
}: {
  horizon: number;
  onHorizonChange: (n: number) => void;
  dept: DepartmentFilter;
  onDeptChange: (d: DepartmentFilter) => void;
}) => {
  return (
    <div className="flex flex-col gap-4 rounded-xl border bg-card p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm font-medium text-muted-foreground">
          Horizon:
        </span>
        {HORIZONS.map((h) => (
          <button
            key={h}
            onClick={() => onHorizonChange(h)}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
              horizon === h
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-secondary text-secondary-foreground hover:bg-accent"
            }`}
          >
            {h}d
          </button>
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm font-medium text-muted-foreground">
          Department:
        </span>
        {DEPTS.map((d) => (
          <button
            key={d}
            onClick={() => onDeptChange(d)}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
              dept === d
                ? "bg-foreground text-background"
                : "bg-secondary text-secondary-foreground hover:bg-accent"
            }`}
          >
            {d}
          </button>
        ))}
      </div>
    </div>
  );
};
