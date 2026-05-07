import { Activity, Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { ApiStatusIndicator } from "./ApiStatusIndicator";

export const Navbar = ({
  apiOnline,
  darkMode,
  onToggleDarkMode,
}: {
  apiOnline: boolean | null;
  darkMode: boolean;
  onToggleDarkMode: () => void;
}) => {
  const [time, setTime] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const formatted = time.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  return (
    <nav className="sticky top-0 z-30 border-b bg-card/80 backdrop-blur">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Activity className="h-5 w-5" />
          </div>
          <div>
            <div className="font-semibold leading-tight">WBE Outbreak Forecast</div>
            <div className="text-xs text-muted-foreground">
              7-Day CFU/g Predictions &amp; Risk Monitoring
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden items-center gap-2 sm:flex">
            <span className="text-sm font-mono text-muted-foreground">{formatted}</span>
            <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
              AIML &amp; Research Department
            </span>
          </div>
          <ApiStatusIndicator apiOnline={apiOnline} />
          <button
            onClick={onToggleDarkMode}
            className="flex h-8 w-8 items-center justify-center rounded-lg border bg-secondary text-secondary-foreground transition hover:bg-accent"
            title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
        </div>
      </div>
    </nav>
  );
};
