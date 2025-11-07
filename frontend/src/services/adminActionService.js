import api from '../utils/api';

class AdminActionService {
  async getAdminActions(queryParams = '') {
    try {
      const url = `/admin-actions${queryParams ? `?${queryParams}` : ''}`;
      const response = await api.get(url);
      return response.data;
    } catch (error) {
      console.error('Error fetching admin actions:', error);
      throw error;
    }
  }

  async getAdminActionStats() {
    try {
      const response = await api.get('/admin-actions/stats');
      return response.data;
    } catch (error) {
      console.error('Error fetching admin action stats:', error);
      throw error;
    }
  }

  async getActionTypes() {
    try {
      const response = await api.get('/admin-actions/types');
      return response.data;
    } catch (error) {
      console.error('Error fetching action types:', error);
      throw error;
    }
  }

  async exportReport(filters = {}) {
    try {
      const params = new URLSearchParams();
      
      Object.keys(filters).forEach(key => {
        if (filters[key]) {
          params.append(key, filters[key]);
        }
      });

      const response = await api.get(`/admin-actions/export?${params.toString()}`, {
        responseType: 'blob'
      });

      if (response.status === 200) {
        const blob = response.data;
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = `admin-actions-report-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        return { success: true };
      } else {
        return { success: false, message: 'Failed to export report' };
      }
    } catch (error) {
      console.error('Error exporting report:', error);
      throw error;
    }
  }
}

export const adminActionService = new AdminActionService();