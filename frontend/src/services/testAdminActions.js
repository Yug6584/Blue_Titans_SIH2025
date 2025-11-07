// Test file to debug admin actions service
import { adminActionService } from './adminActionService';

export const testAdminActionsService = async () => {
  try {
    console.log('🔍 Testing Admin Actions Service...');
    
    // Check if token exists
    const token = localStorage.getItem('token');
    console.log('Token exists:', !!token);
    
    if (!token) {
      console.error('❌ No authentication token found');
      return { error: 'No authentication token' };
    }

    // Test API connection
    console.log('Testing API connection...');
    
    // Test stats first (simpler endpoint)
    const statsResult = await adminActionService.getAdminActionStats();
    console.log('Stats result:', statsResult);
    
    // Test actions list
    const actionsResult = await adminActionService.getAdminActions('limit=5');
    console.log('Actions result:', actionsResult);
    
    // Test action types
    const typesResult = await adminActionService.getActionTypes();
    console.log('Types result:', typesResult);
    
    return {
      stats: statsResult,
      actions: actionsResult,
      types: typesResult
    };
    
  } catch (error) {
    console.error('❌ Admin Actions Service Test Failed:', error);
    return { error: error.message };
  }
};

// Auto-run test when imported (for debugging)
if (typeof window !== 'undefined') {
  window.testAdminActions = testAdminActionsService;
  console.log('Admin Actions test function available as window.testAdminActions()');
}