const express = require('express');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const { getAdminActions, getAdminActionStats } = require('../database/admin-actions');

const router = express.Router();

// Get admin actions with filtering and pagination
router.get('/', authenticateToken, requireAdmin, (req, res) => {
  const {
    severity,
    actionType,
    adminId,
    dateFrom,
    dateTo,
    limit = 50,
    offset = 0
  } = req.query;

  const filters = {
    severity,
    actionType,
    adminId: adminId ? parseInt(adminId) : null,
    dateFrom,
    dateTo,
    limit: parseInt(limit),
    offset: parseInt(offset)
  };

  // Remove undefined values
  Object.keys(filters).forEach(key => {
    if (filters[key] === undefined || filters[key] === null || filters[key] === '') {
      delete filters[key];
    }
  });

  getAdminActions(filters, (err, actions) => {
    if (err) {
      console.error('Error fetching admin actions:', err);
      return res.status(500).json({
        success: false,
        message: 'Error fetching admin actions'
      });
    }

    res.json({
      success: true,
      actions: actions.map(action => ({
        id: action.id,
        timestamp: action.timestamp,
        admin: {
          id: action.admin_id,
          email: action.admin_email,
          name: action.admin_name
        },
        action: {
          type: action.action_type,
          details: action.action_details,
          severity: action.severity
        },
        target: {
          type: action.target_type,
          id: action.target_id,
          email: action.target_email
        },
        metadata: {
          ipAddress: action.ip_address,
          userAgent: action.user_agent,
          status: action.status
        }
      })),
      pagination: {
        limit: parseInt(limit),
        offset: parseInt(offset)
      }
    });
  });
});

// Get admin action statistics
router.get('/stats', authenticateToken, requireAdmin, (req, res) => {
  getAdminActionStats((err, stats) => {
    if (err) {
      console.error('Error fetching admin action stats:', err);
      return res.status(500).json({
        success: false,
        message: 'Error fetching admin action statistics'
      });
    }

    res.json({
      success: true,
      stats: {
        total: stats.total || 0,
        severity: {
          high: stats.high || 0,
          medium: stats.medium || 0,
          low: stats.low || 0
        },
        timeframes: {
          today: stats.today || 0,
          thisWeek: stats.thisWeek || 0,
          thisMonth: stats.thisMonth || 0
        }
      }
    });
  });
});

// Get admin action types for filtering
router.get('/types', authenticateToken, requireAdmin, (req, res) => {
  const actionTypes = [
    { value: 'user_create', label: 'User Created', severity: 'medium' },
    { value: 'user_update', label: 'User Updated', severity: 'low' },
    { value: 'user_delete', label: 'User Deleted', severity: 'high' },
    { value: 'user_suspend', label: 'User Suspended', severity: 'high' },
    { value: 'user_activate', label: 'User Activated', severity: 'medium' },
    { value: 'password_reset', label: 'Password Reset', severity: 'medium' },
    { value: 'role_change', label: 'Role Changed', severity: 'high' },
    { value: 'kyc_approve', label: 'KYC Approved', severity: 'medium' },
    { value: 'kyc_reject', label: 'KYC Rejected', severity: 'medium' },
    { value: 'system_backup', label: 'System Backup', severity: 'low' },
    { value: 'system_restore', label: 'System Restore', severity: 'high' },
    { value: 'security_settings_change', label: 'Security Settings Changed', severity: 'high' }
  ];

  res.json({
    success: true,
    actionTypes
  });
});

module.exports = router;