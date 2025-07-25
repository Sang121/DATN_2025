// Main entry point for Statistics Page
export { default } from './OptimizedStatistics';

// Export individual components for reuse
export { default as DashboardOverview } from './components/DashboardOverview';
export { default as AdvancedAnalytics } from './components/AdvancedAnalytics';
export { default as OverviewCards } from './components/OverviewCards';
export { default as StatisticsErrorBoundary } from './components/StatisticsErrorBoundary';
export { default as StatisticsFallback } from './components/StatisticsFallback';
export { default as StatisticsQueryProvider } from './providers/StatisticsQueryProvider';

// Export services
export * from '../../../../services/statisticsService';
export * from '../../../../services/statisticsAdvancedService';
