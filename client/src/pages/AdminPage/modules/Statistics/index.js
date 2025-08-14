// Statistics Module - Main Export
// Centralized exports for the Statistics module

// Main Components
export { default } from './OptimizedStatistics';
export { default as OptimizedStatistics } from './OptimizedStatistics';

// Sub Components
export { default as UnifiedStatistics } from './components/UnifiedStatistics';
export { default as OverviewCards } from './components/OverviewCards';
export { default as StatisticsErrorBoundary } from './components/StatisticsErrorBoundary';

// Providers
export { default as StatisticsQueryProvider } from './providers/StatisticsQueryProvider';

// Export services
export * from '../../../../services/statisticsService';
export * from '../../../../services/statisticsAdvancedService';

// Module configuration
export const STATISTICS_MODULE_CONFIG = {
  name: 'Statistics',
  version: '2.0.0',
  description: 'Admin unified statistics and analytics module',
  routes: [
    {
      path: '/admin/statistics',
      component: 'OptimizedStatistics',
      name: 'Statistics Dashboard'
    }
  ]
};
