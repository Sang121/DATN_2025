// Orders Module - Main Export
// Centralized exports for the Orders management module

// Main Components
export { default as OrderManager } from './components/OrderManager';
export { default as AdminOrderDetail } from './components/AdminOrderDetail';
export { default as ReturnRequestManager } from './components/ReturnRequestManager';

// Sub Components
// export { default as OrderList } from './components/OrderList';
// export { default as OrderForm } from './components/OrderForm';
// export { default as OrderStatus } from './components/OrderStatus';

// Module configuration
export const ORDERS_MODULE_CONFIG = {
  name: 'Orders',
  version: '1.0.0',
  description: 'Admin orders management module',
  routes: [
    {
      path: '/admin/orders',
      component: 'OrderManager',
      name: 'Order Management'
    },
    {
      path: '/admin/orders/:id',
      component: 'AdminOrderDetail',
      name: 'Order Details'
    },
    {
      path: '/admin/return-requests',
      component: 'ReturnRequestManager',
      name: 'Return Request Management'
    }
  ]
};

// Default export OrderManager for now
export { default } from './components/OrderManager';
