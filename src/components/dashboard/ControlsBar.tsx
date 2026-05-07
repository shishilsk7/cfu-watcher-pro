import { RefreshCw } from "lucide-react";
import type { DepartmentFilter } from "@/types/forecast";

const DEPTS: DepartmentFilter[] = ["AIML", "Biotech", "Both"];

export const ControlsBar = ({
  horizon,
  onHorizonChange,
  dept,
  onDeptChange,
  onRefresh,
}: {
  horizon: number;
  onHorizonChange: (n: number) => void;
  dept: DepartmentFilter;
  onDeptChange: (d: DepartmentFilter) => void;
  onRefresh: () => void;
}) => {
  return (
    <div className="flex flex-col gap-4 rounded-xl border bg-card p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-sm font-medium">Forecast Horizon</span>
        <input
          type="range"
          min={1}
          max={14}
          value={horizon}
          onChange={(e) => onHorizonChange(Number(e.target.value))}
          className="w-40 accent-primary"
        />
        <span className="min-w-[4rem] rounded-lg bg-primary/10 px-2.5 py-1 text-sm font-semibold text-primary">
          {horizon} days
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center rounded-lg border bg-secondary p-0.5">
          {DEPTS.map((d) => (
            <button
              key={d}
              onClick={() => onDeptChange(d)}
              className={`rounded-md px-3 py-1 text-sm font-medium transition ${
                dept === d
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {d}
            </button>
          ))}
        </div>
        <button
          onClick={onRefresh}
          className="flex items-center gap-1.5 rounded-lg border bg-secondary px-3 py-1.5 text-sm font-medium transition hover:bg-accent"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Refresh
        </button>
      </div>
    </div>
  );
};
