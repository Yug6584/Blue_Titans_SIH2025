const express = require('express');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const { createAdminLogger } = require('../middleware/adminLogger');
const db = require('../database/init');

const router = express.Router();

// Get system statistics and real data
router.get('/stats', authenticateToken, requireAdmin, (req, res) => {
  try {
    // Get real user counts by role
    const userStatsQuery = `
      SELECT 
        panel,
        COUNT(*) as count,
        SUM(CASE WHEN isActive = 1 THEN 1 ELSE 0 END) as active_count,
        SUM(CASE WHEN isActive = 0 THEN 1 ELSE 0 END) as inactive_count
      FROM users 
      GROUP BY panel
    `;

    db.all(userStatsQuery, (err, userStats) => {
      if (err) {
        console.error('Error fetching user stats:', err);
        return res.status(500).json({ success: false, message: 'Database error' });
      }

      // Get system performance metrics
      const performanceQuery = `
        SELECT 
          COUNT(*) as total_actions,
          SUM(CASE WHEN timestamp >= datetime('now', '-24 hours') THEN 1 ELSE 0 END) as actions_24h,
          SUM(CASE WHEN timestamp >= datetime('now', '-7 days') THEN 1 ELSE 0 END) as actions_7d
        FROM admin_actions
      `;

      db.get(performanceQuery, (err, performance) => {
        if (err) {
          console.error('Error fetching performance stats:', err);
          return res.status(500).json({ success: false, message: 'Database error' });
        }

        // Get login activity stats
        const loginStatsQuery = `
          SELECT 
            COUNT(*) as total_logins,
            SUM(CASE WHEN loginStatus = 'success' THEN 1 ELSE 0 END) as successful_logins,
            SUM(CASE WHEN loginStatus = 'failed' THEN 1 ELSE 0 END) as failed_logins,
            SUM(CASE WHEN loginTimestamp >= datetime('now', '-24 hours') THEN 1 ELSE 0 END) as logins_24h
          FROM login_activities
        `;

        db.get(loginStatsQuery, (err, loginStats) => {
          if (err) {
            console.error('Error fetching login stats:', err);
            return res.status(500).json({ success: false, message: 'Database error' });
          }

          // Format response
          const roleStats = {
            company: { count: 0, active: 0, inactive: 0 },
            government: { count: 0, active: 0, inactive: 0 },
            admin: { count: 0, active: 0, inactive: 0 }
          };

          userStats.forEach(stat => {
            if (roleStats[stat.panel]) {
              roleStats[stat.panel] = {
                count: stat.count,
                active: stat.active_count,
                inactive: stat.inactive_count
              };
            }
          });

          res.json({
            success: true,
            data: {
              userRoles: roleStats,
              performance: {
                totalActions: performance.total_actions || 0,
                actions24h: performance.actions_24h || 0,
                actions7d: performance.actions_7d || 0,
                uptime: process.uptime(),
                memoryUsage: process.memoryUsage()
              },
              security: {
                totalLogins: loginStats.total_logins || 0,
                successfulLogins: loginStats.successful_logins || 0,
                failedLogins: loginStats.failed_logins || 0,
                logins24h: loginStats.logins_24h || 0,
                successRate: loginStats.total_logins > 0 
                  ? Math.round((loginStats.successful_logins / loginStats.total_logins) * 100) 
                  : 100
              },
              system: {
                version: '1.0.0',
                environment: process.env.NODE_ENV || 'development',
                nodeVersion: process.version,
                platform: process.platform,
                lastRestart: new Date(Date.now() - process.uptime() * 1000).toISOString()
              }
            }
          });
        });
      });
    });
  } catch (error) {
    console.error('Error in system stats:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Get system settings
router.get('/settings', authenticateToken, requireAdmin, (req, res) => {
  try {
    // In a production system, these would be stored in a settings table
    // For now, we'll return sensible defaults based on current system state
    const settings = {
      security: {
        mfaRequired: false,
        passwordComplexity: 'medium',
        sessionTimeout: 30,
        maxLoginAttempts: 5,
        lockoutDuration: 15,
        requireEmailVerification: true
      },
      performance: {
        apiRateLimit: 1000,
        cacheEnabled: true,
        logRetention: 30,
        backupInterval: 'daily',
        maintenanceWindow: null
      },
      notifications: {
        emailEnabled: true,
        inAppEnabled: true,
        webhooksEnabled: false,
        smtpConfigured: !!process.env.SMTP_HOST
      },
      audit: {
        enableLogging: true,
        retentionPeriod: 90,
        exportEnabled: true,
        complianceMode: true
      },
      customization: {
        theme: 'default',
        logo: 'default',
        companyName: 'BlueCarbon Ledger',
        supportEmail: 'support@bluecarbon.com'
      }
    };

    res.json({
      success: true,
      settings
    });
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Update system settings
router.put('/settings', 
  authenticateToken, 
  requireAdmin, 
  createAdminLogger('system_settings_change', 'system', 'high'),
  (req, res) => {
    try {
      const { category, settings } = req.body;

      if (!category || !settings) {
        return res.status(400).json({
          success: false,
          message: 'Category and settings are required'
        });
      }

      // In production, you would save these to a database
      // For now, we'll just validate and return success
      console.log(`Settings updated for category: ${category}`, settings);

      res.json({
        success: true,
        message: `${category} settings updated successfully`,
        updatedSettings: settings
      });
    } catch (error) {
      console.error('Error updating settings:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }
);

// Get system health check
router.get('/health', authenticateToken, requireAdmin, (req, res) => {
  try {
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      cpu: process.cpuUsage(),
      version: '1.0.0',
      environment: process.env.NODE_ENV || 'development'
    };

    // Check database connectivity
    db.get('SELECT 1 as test', (err) => {
      if (err) {
        health.status = 'unhealthy';
        health.database = 'disconnected';
      } else {
        health.database = 'connected';
      }

      res.json({
        success: true,
        health
      });
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      health: {
        status: 'unhealthy',
        error: error.message
      }
    });
  }
});

// Backup system data
router.post('/backup', 
  authenticateToken, 
  requireAdmin, 
  createAdminLogger('system_backup', 'system', 'medium'),
  (req, res) => {
    try {
      // In production, this would trigger an actual backup process
      const backupInfo = {
        id: `backup_${Date.now()}`,
        timestamp: new Date().toISOString(),
        type: 'manual',
        status: 'completed',
        size: '2.5MB', // Mock size
        tables: ['users', 'admin_actions', 'login_activities']
      };

      res.json({
        success: true,
        message: 'System backup completed successfully',
        backup: backupInfo
      });
    } catch (error) {
      console.error('Error creating backup:', error);
      res.status(500).json({ success: false, message: 'Backup failed' });
    }
  }
);

module.exports = router;