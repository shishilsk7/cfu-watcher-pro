import { useEffect, useState, useCallback } from "react";
import { Navbar } from "@/components/dashboard/Navbar";
import { ControlsBar } from "@/components/dashboard/ControlsBar";
import { RiskSummaryCards } from "@/components/dashboard/RiskSummaryCards";
import { ForecastChart } from "@/components/dashboard/ForecastChart";
import { AlertsTable } from "@/components/dashboard/AlertsTable";
import { MetricsCards } from "@/components/dashboard/MetricsCards";
import { LoadingSkeleton } from "@/components/dashboard/LoadingSkeleton";
import { useForecast, useMetrics, pingApi } from "@/hooks/useForecast";
import type { DepartmentFilter } from "@/types/forecast";

const Index = () => {
  const [horizon, setHorizon] = useState(7);
  const [dept, setDept] = useState<DepartmentFilter>("Both");
  const [apiOnline, setApiOnline] = useState<boolean | null>(null);
  const [darkMode, setDarkMode] = useState(false);

  const forecastQ = useForecast(horizon);
  const metricsQ = useMetrics();

  useEffect(() => {
    pingApi().then(setApiOnline);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  const handleRefresh = useCallback(() => {
    forecastQ.refetch();
    metricsQ.refetch();
  }, [forecastQ, metricsQ]);

  const filteredDepts =
    forecastQ.data?.departments.filter(
      (d) => dept === "Both" || d.name === dept,
    ) ?? [];

  return (
    <div className="min-h-screen bg-background">
      <Navbar
        apiOnline={apiOnline}
        darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode((v) => !v)}
      />
      <main className="container mx-auto px-4 py-6 space-y-6">
        <ControlsBar
          horizon={horizon}
          onHorizonChange={setHorizon}
          dept={dept}
          onDeptChange={setDept}
          onRefresh={handleRefresh}
        />

        {forecastQ.isLoading ? (
          <LoadingSkeleton />
        ) : forecastQ.isError ? (
          <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-destructive">
            Failed to load forecast.
          </div>
        ) : (
          <>
            <RiskSummaryCards
              departments={filteredDepts}
              metrics={metricsQ.data}
            />
            <ForecastChart departments={filteredDepts} horizon={horizon} />
            <AlertsTable departments={filteredDepts} />
          </>
        )}

        <MetricsCards metrics={metricsQ.data} loading={metricsQ.isLoading} />
      </main>
    </div>
  );
};

export default Index;
