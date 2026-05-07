import { Wifi, WifiOff, Loader2 } from "lucide-react";

export const ApiStatusIndicator = ({
  apiOnline,
}: {
  apiOnline: boolean | null;
}) => {
  return (
    <div
      className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium ${
        apiOnline
          ? "bg-safe/10 text-safe"
          : apiOnline === false
            ? "bg-destructive/10 text-destructive"
            : "bg-muted text-muted-foreground"
      }`}
    >
      {apiOnline === null ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : apiOnline ? (
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
  );
};
