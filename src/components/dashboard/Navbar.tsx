import { Activity } from "lucide-react";
import { ApiStatusIndicator } from "./ApiStatusIndicator";

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
        <ApiStatusIndicator apiOnline={apiOnline} />
      </div>
    </nav>
  );
};
