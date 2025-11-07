import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Authentication API calls
export const authAPI = {
  login: (panelType, credentials) => {
    return api.post(`/auth/login`, credentials);
  },
  
  register: (panelType, userData) => {
    return api.post(`/register/${panelType}`, userData);
  },
  
  refreshToken: () => {
    return api.post('/auth/refresh');
  },
  
  logout: () => {
    return api.post('/auth/logout');
  },
};

// User Panel API calls
export const userAPI = {
  getDashboardData: () => {
    return api.get('/user/dashboard');
  },
  
  getProjects: () => {
    return api.get('/user/projects');
  },
  
  getGovernmentSchemes: () => {
    return api.get('/user/government-schemes');
  },
  
  getNewsUpdates: () => {
    return api.get('/user/news');
  },
  
  getCommunityPosts: () => {
    return api.get('/user/community');
  },
  
  createCommunityPost: (postData) => {
    return api.post('/user/community', postData);
  },
};

// Company Panel API calls
export const companyAPI = {
  getDashboardData: () => {
    return api.get('/company/dashboard');
  },
  
  getProjects: () => {
    return api.get('/company/projects');
  },
  
  uploadMRVProof: (formData) => {
    return api.post('/company/upload-proof', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  
  getCarbonTokens: () => {
    return api.get('/company/tokens');
  },
  
  getMarketplace: () => {
    return api.get('/company/marketplace');
  },
  
  buyCredits: (orderData) => {
    return api.post('/company/buy-credits', orderData);
  },
  
  sellCredits: (orderData) => {
    return api.post('/company/sell-credits', orderData);
  },
  
  getReports: () => {
    return api.get('/company/reports');
  },
  
  chatWithAI: (message) => {
    return api.post('/company/ai-chat', { message });
  },
};

// Government Panel API calls
export const governmentAPI = {
  getDashboardData: () => {
    return api.get('/government/dashboard');
  },
  
  getPendingVerifications: () => {
    return api.get('/government/verifications/pending');
  },
  
  approveProject: (projectId, approvalData) => {
    return api.post(`/government/approve/${projectId}`, approvalData);
  },
  
  rejectProject: (projectId, rejectionData) => {
    return api.post(`/government/reject/${projectId}`, rejectionData);
  },
  
  getCarbonWallet: () => {
    return api.get('/government/wallet');
  },
  
  generateReport: (reportType, filters) => {
    return api.post('/government/reports', { reportType, filters });
  },
  
  getComplianceData: () => {
    return api.get('/government/compliance');
  },
};

// Stats API calls
export const statsAPI = {
  getUserStats: () => {
    return api.get('/stats/users');
  },
  
  getDetailedUsers: () => {
    return api.get('/stats/users/detailed');
  },
  
  getLoginActivities: (limit = 10, offset = 0) => {
    return api.get(`/stats/login-activities?limit=${limit}&offset=${offset}`);
  },
};

// System API calls
export const systemAPI = {
  getSystemStats: () => {
    return api.get('/system/stats');
  },
  
  getPerformanceData: () => {
    return api.get('/system/performance');
  },
  
  getSystemAlerts: () => {
    return api.get('/system/alerts');
  },
  
  getSecurityRecommendations: () => {
    return api.get('/system/security-recommendations');
  },
};

// Admin Panel API calls
export const adminAPI = {
  getDashboardData: () => {
    return api.get('/admin/dashboard');
  },
  
  getCompanies: () => {
    return api.get('/admin/companies');
  },
  
  addCompany: (companyData) => {
    return api.post('/admin/companies', companyData);
  },
  
  updateCompany: (companyId, companyData) => {
    return api.put(`/admin/companies/${companyId}`, companyData);
  },
  
  suspendCompany: (companyId) => {
    return api.post(`/admin/companies/${companyId}/suspend`);
  },
  
  getMRVVerifications: () => {
    return api.get('/admin/mrv-verifications');
  },
  
  approveProject: (projectId, approvalData) => {
    return api.post(`/admin/projects/${projectId}/approve`, approvalData);
  },
  
  getAuditLogs: () => {
    return api.get('/admin/audit-logs');
  },
  
  generateAutomatedReport: (reportType) => {
    return api.post('/admin/automated-reports', { reportType });
  },
  
  getUsers: () => {
    return api.get('/admin/users');
  },
  
  updateUserRole: (userId, role) => {
    return api.put(`/admin/users/${userId}/role`, { role });
  },
  
  banUser: (userId, reason) => {
    return api.post(`/admin/users/${userId}/ban`, { reason });
  },
  
  // Admin Actions API calls
  getAdminActions: (queryParams = '') => {
    return api.get(`/admin-actions${queryParams ? `?${queryParams}` : ''}`);
  },
  
  getAdminActionStats: () => {
    return api.get('/admin-actions/stats');
  },
  
  getActionTypes: () => {
    return api.get('/admin-actions/types');
  },
  
  exportAdminActionsReport: (filters = {}) => {
    const params = new URLSearchParams();
    Object.keys(filters).forEach(key => {
      if (filters[key]) {
        params.append(key, filters[key]);
      }
    });
    return api.get(`/admin-actions/export?${params.toString()}`, {
      responseType: 'blob'
    });
  },
};

// Blockchain API calls (for backend integration)
export const blockchainAPI = {
  getContractData: (contractName) => {
    return api.get(`/blockchain/contract/${contractName}`);
  },
  
  callContractMethod: (contractName, method, params) => {
    return api.post(`/blockchain/contract/${contractName}/${method}`, { params });
  },
  
  getTransactionHistory: (address) => {
    return api.get(`/blockchain/transactions/${address}`);
  },
  
  getTokenBalance: (address, tokenContract) => {
    return api.get(`/blockchain/balance/${address}/${tokenContract}`);
  },
};

export default api;