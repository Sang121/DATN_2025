// Products Module - Main Export
// Centralized exports for the Products management module

// Main Components
export { default as ProductManager } from './components/ProductManager';
// export { default as ProductDetails } from './ProductDetails';

// Sub Components
// export { default as ProductList } from './components/ProductList';
// export { default as ProductForm } from './components/ProductForm';
// export { default as ProductCategories } from './components/ProductCategories';

// Module configuration
export const PRODUCTS_MODULE_CONFIG = {
  name: 'Products',
  version: '1.0.0',
  description: 'Admin products management module',
  routes: [
    {
      path: '/admin/products',
      component: 'ProductManager',
      name: 'Product Management'
    },
    {
      path: '/admin/products/new',
      component: 'ProductForm',
      name: 'Add Product'
    },
    {
      path: '/admin/products/:id',
      component: 'ProductDetails',
      name: 'Product Details'
    }
  ]
};

// Default export ProductManager for now
export { default } from './components/ProductManager';
