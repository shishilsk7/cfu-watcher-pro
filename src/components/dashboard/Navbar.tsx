import { Activity, Wifi, WifiOff } from "lucide-react";

export const Navbar = ({ apiOnline }: { apiOnline: boolean | null }) => {
  return (
    <nav className="sticky top-0 z-30 border-b bg-card/80 backdrop-blur">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Activity className="h-5 w-5" />
          </div>
          <div>
            <div className="font-semibold leading-tight">PathogenWatch</div>
            <div className="text-xs text-muted-foreground">
              Wastewater Risk Console
            </div>
          </div>
        </div>
        <div
          className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium ${
            apiOnline
              ? "bg-safe/10 text-safe"
              : apiOnline === false
                ? "bg-destructive/10 text-destructive"
                : "bg-muted text-muted-foreground"
          }`}
        >
          {apiOnline ? (
            <Wifi className="h-3.5 w-3.5" />
          ) : (
            <WifiOff className="h-3.5 w-3.5" />
          )}
          {apiOnline === null
            ? "Checking API…"
            : apiOnline
              ? "API Online"
              : "API Offline (mock data)"}
        </div>
      </div>
    </nav>
  );
};
