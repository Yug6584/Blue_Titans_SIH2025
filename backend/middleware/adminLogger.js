const { logAdminAction } = require('../database/admin-actions');

// Middleware to automatically log admin actions
function createAdminLogger(actionType, targetType, severity = 'medium') {
  return (req, res, next) => {
    // Store original res.json to intercept response
    const originalJson = res.json;
    
    res.json = function(data) {
      // Only log if the action was successful
      if (data && data.success) {
        const adminId = req.user.userId;
        const adminEmail = req.user.email;
        const targetId = req.params.id || req.body.id || null;
        const targetEmail = req.body.email || req.targetUser?.email || null;
        const ipAddress = req.ip || req.connection.remoteAddress || 'unknown';
        const userAgent = req.get('User-Agent') || 'unknown';
        
        // Create action details based on the request
        let actionDetails = `${actionType}`;
        if (targetEmail) {
          actionDetails += ` for user: ${targetEmail}`;
        }
        if (req.body) {
          const relevantFields = ['name', 'organization', 'panel', 'isActive'];
          const changes = relevantFields
            .filter(field => req.body[field] !== undefined)
            .map(field => `${field}: ${req.body[field]}`)
            .join(', ');
          if (changes) {
            actionDetails += ` (${changes})`;
          }
        }

        logAdminAction(
          adminId,
          adminEmail,
          actionType,
          targetType,
          targetId,
          targetEmail,
          actionDetails,
          severity,
          ipAddress,
          userAgent,
          (err) => {
            if (err) {
              console.error('Error logging admin action:', err);
            } else {
              console.log(`📝 Admin action logged: ${actionType} by ${adminEmail}`);
            }
          }
        );
      }
      
      // Call original res.json
      originalJson.call(this, data);
    };
    
    next();
  };
}

// Helper function to determine severity based on action type
function getSeverityForAction(actionType) {
  const severityMap = {
    'user_delete': 'high',
    'user_suspend': 'high',
    'user_activate': 'medium',
    'user_create': 'medium',
    'user_update': 'low',
    'password_reset': 'medium',
    'role_change': 'high',
    'kyc_approve': 'medium',
    'kyc_reject': 'medium',
    'system_backup': 'low',
    'system_restore': 'high',
    'security_settings_change': 'high'
  };
  
  return severityMap[actionType] || 'medium';
}

module.exports = {
  createAdminLogger,
  getSeverityForAction
};