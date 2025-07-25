// Admin Modules - Central Export
// All admin modules are exported from here for easy access

// Import all modules
export * from './Statistics';
export * from './Orders';
export * from './Products';
export * from './Users';

// Module registry for dynamic loading
export const ADMIN_MODULES = {
  Statistics: {
    path: '/admin/statistics',
    component: () => import('./Statistics'),
    name: 'Thống kê',
    icon: 'BarChartOutlined',
    description: 'Thống kê doanh số và phân tích'
  },
  Orders: {
    path: '/admin/orders',
    component: () => import('./Orders'),
    name: 'Đơn hàng',
    icon: 'ShoppingCartOutlined',
    description: 'Quản lý đơn hàng'
  },
  Products: {
    path: '/admin/products',
    component: () => import('./Products'),
    name: 'Sản phẩm',
    icon: 'AppstoreOutlined',
    description: 'Quản lý sản phẩm'
  },
  Users: {
    path: '/admin/users',
    component: () => import('./Users'),
    name: 'Người dùng',
    icon: 'UserOutlined',
    description: 'Quản lý người dùng'
  }
};

// Helper function to get module list
export const getModuleList = () => Object.values(ADMIN_MODULES);

// Helper function to get module by name
export const getModule = (moduleName) => ADMIN_MODULES[moduleName];
