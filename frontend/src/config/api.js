// API Configuration
export const apiConfig = {
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8000',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
};

// Remove /api from baseURL if it exists since our endpoints already include it
if (apiConfig.baseURL.endsWith('/api')) {
  apiConfig.baseURL = apiConfig.baseURL.slice(0, -4);
}

// API endpoints
export const endpoints = {
  auth: {
    login: '/api/auth/login',
    logout: '/api/auth/logout',
    refresh: '/api/auth/refresh'
  },
  users: {
    list: '/api/users',
    create: '/api/users',
    update: '/api/users',
    delete: '/api/users',
    suspend: '/api/users/:id/suspend',
    activate: '/api/users/:id/activate'
  },
  adminActions: {
    list: '/api/admin-actions',
    stats: '/api/admin-actions/stats',
    types: '/api/admin-actions/types',
    export: '/api/admin-actions/export'
  },
  stats: '/api/stats',
  system: '/api/system',
  security: '/api/security'
};