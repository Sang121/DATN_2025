import React, { useState } from "react";

// Import components và providers
import UnifiedStatistics from "./components/UnifiedStatistics";
import StatisticsQueryProvider from "./providers/StatisticsQueryProvider";
import StatisticsErrorBoundary from "./components/StatisticsErrorBoundary";
import "./styles/Statistics.css";

const OptimizedStatistics = () => {
  const [refreshKey, setRefreshKey] = useState(0);

  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <div className="statistics-page">
      {/* Main Statistics Content */}
      <UnifiedStatistics refreshKey={refreshKey} onRefresh={handleRefresh} />
    </div>
  );
};

// Wrap component với QueryProvider và Error Boundary
const StatisticsPageWithProvider = () => {
  return (
    <StatisticsErrorBoundary>
      <StatisticsQueryProvider>
        <OptimizedStatistics />
      </StatisticsQueryProvider>
    </StatisticsErrorBoundary>
  );
};

export default StatisticsPageWithProvider;
