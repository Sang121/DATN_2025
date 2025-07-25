// Users Module - Main Export
// Centralized exports for the Users management module

// Main Components
export { default as UserManager } from './components/UserManager';
// export { default as UserDetails } from './UserDetails';

// Sub Components
// export { default as UserList } from './components/UserList';
// export { default as UserForm } from './components/UserForm';
// export { default as UserRoles } from './components/UserRoles';

// Module configuration
export const USERS_MODULE_CONFIG = {
  name: 'Users',
  version: '1.0.0',
  description: 'Admin users management module',
  routes: [
    {
      path: '/admin/users',
      component: 'UserManager',
      name: 'User Management'
    },
    {
      path: '/admin/users/:id',
      component: 'UserDetails',
      name: 'User Details'
    }
  ]
};

// Default export UserManager for now
export { default } from './components/UserManager';
