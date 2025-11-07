const express = require('express');
const router = express.Router();
const db = require('../database/init-backup');
const BackupService = require('../services/backupService');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const { createAuditLogger } = require('../middleware/auditLogger');
const fs = require('fs');
const path = require('path');

// Initialize backup service
const backupService = new BackupService(db);

// Apply audit logging to backup routes
router.use(createAuditLogger('backup_access', 'backup_system', 'info'));

// Get backup jobs
router.get('/jobs', authenticateToken, requireAdmin, (req, res) => {
  try {
    const { status, job_type } = req.query;

    let whereConditions = [];
    let params = [];

    if (status) {
      whereConditions.push('status = ?');
      params.push(status);
    }

    if (job_type) {
      whereConditions.push('job_type = ?');
      params.push(job_type);
    }

    const whereClause = whereConditions.length > 0 ? 
      'WHERE ' + whereConditions.join(' AND ') : '';

    const query = `
      SELECT 
        id, job_name, job_type, backup_type, schedule_cron,
        databases, include_files, compression_enabled, encryption_enabled,
        retention_days, status, created_by, created_at, updated_at
      FROM backup_jobs 
      ${whereClause}
      ORDER BY created_at DESC
    `;

    db.all(query, params, (err, jobs) => {
      if (err) {
        console.error('Error fetching backup jobs:', err);
        return res.status(500).json({
          success: false,
          message: 'Error retrieving backup jobs'
        });
      }

      // Parse JSON fields and enhance data
      const enhancedJobs = jobs.map(job => ({
        ...job,
        databases: job.databases ? JSON.parse(job.databases) : [],
        include_files: Boolean(job.include_files),
        compression_enabled: Boolean(job.compression_enabled),
        encryption_enabled: Boolean(job.encryption_enabled),
        next_run: job.schedule_cron ? calculateNextRun(job.schedule_cron) : null
      }));

      res.json({
        success: true,
        jobs: enhancedJobs
      });
    });

  } catch (error) {
    console.error('Error in backup jobs endpoint:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get backup history
router.get('/history', authenticateToken, requireAdmin, (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 50, 
      status, 
      backup_type,
      start_date,
      end_date 
    } = req.query;

    const offset = (page - 1) * limit;
    let whereConditions = [];
    let params = [];

    if (status) {
      whereConditions.push('bh.status = ?');
      params.push(status);
    }

    if (backup_type) {
      whereConditions.push('bh.backup_type = ?');
      params.push(backup_type);
    }

    if (start_date) {
      whereConditions.push('bh.created_at >= ?');
      params.push(start_date);
    }

    if (end_date) {
      whereConditions.push('bh.created_at <= ?');
      params.push(end_date + ' 23:59:59');
    }

    const whereClause = whereConditions.length > 0 ? 
      'WHERE ' + whereConditions.join(' AND ') : '';

    // Get total count
    const countQuery = `
      SELECT COUNT(*) as total 
      FROM backup_history bh 
      ${whereClause}
    `;

    db.get(countQuery, params, (err, countResult) => {
      if (err) {
        console.error('Error counting backup history:', err);
        return res.status(500).json({
          success: false,
          message: 'Error retrieving backup history count'
        });
      }

      const total = countResult.total;
      const pages = Math.ceil(total / limit);

      // Get paginated results with job information
      const dataQuery = `
        SELECT 
          bh.*,
          bj.job_name,
          bj.job_type
        FROM backup_history bh
        LEFT JOIN backup_jobs bj ON bh.job_id = bj.id
        ${whereClause}
        ORDER BY bh.created_at DESC 
        LIMIT ? OFFSET ?
      `;

      const dataParams = [...params, parseInt(limit), offset];

      db.all(dataQuery, dataParams, (err, backups) => {
        if (err) {
          console.error('Error fetching backup history:', err);
          return res.status(500).json({
            success: false,
            message: 'Error retrieving backup history'
          });
        }

        // Parse JSON fields and enhance data
        const enhancedBackups = backups.map(backup => ({
          ...backup,
          databases_included: backup.databases_included ? 
            JSON.parse(backup.databases_included) : [],
          files_included: Boolean(backup.files_included),
          success: Boolean(backup.success),
          formatted_size: formatBytes(backup.backup_size || 0),
          formatted_duration: formatDuration(backup.duration || 0),
          file_exists: backup.file_path ? fs.existsSync(backup.file_path) : false
        }));

        res.json({
          success: true,
          backups: enhancedBackups,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            pages,
            hasNext: page < pages,
            hasPrev: page > 1
          }
        });
      });
    });

  } catch (error) {
    console.error('Error in backup history endpoint:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get restore operations
router.get('/restores', authenticateToken, requireAdmin, (req, res) => {
  try {
    const { limit = 50, status } = req.query;

    let whereConditions = [];
    let params = [];

    if (status) {
      whereConditions.push('ro.status = ?');
      params.push(status);
    }

    const whereClause = whereConditions.length > 0 ? 
      'WHERE ' + whereConditions.join(' AND ') : '';

    const query = `
      SELECT 
        ro.*,
        bh.backup_name,
        bh.backup_type,
        bh.file_name
      FROM restore_operations ro
      LEFT JOIN backup_history bh ON ro.backup_id = bh.id
      ${whereClause}
      ORDER BY ro.created_at DESC 
      LIMIT ?
    `;

    params.push(parseInt(limit));

    db.all(query, params, (err, restores) => {
      if (err) {
        console.error('Error fetching restore operations:', err);
        return res.status(500).json({
          success: false,
          message: 'Error retrieving restore operations'
        });
      }

      // Parse JSON fields and enhance data
      const enhancedRestores = restores.map(restore => ({
        ...restore,
        databases_to_restore: restore.databases_to_restore ? 
          JSON.parse(restore.databases_to_restore) : [],
        files_to_restore: Boolean(restore.files_to_restore),
        overwrite_existing: Boolean(restore.overwrite_existing),
        success: Boolean(restore.success),
        formatted_duration: formatDuration(restore.duration || 0)
      }));

      res.json({
        success: true,
        restores: enhancedRestores
      });
    });

  } catch (error) {
    console.error('Error in restore operations endpoint:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get backup statistics
router.get('/stats', authenticateToken, requireAdmin, (req, res) => {
  try {
    const { timeframe = '30d' } = req.query;

    // Calculate date range
    const now = new Date();
    let startDate = new Date();
    
    switch (timeframe) {
      case '7d':
        startDate.setDate(now.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(now.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(now.getDate() - 90);
        break;
      default:
        startDate.setDate(now.getDate() - 30);
    }

    const queries = {
      // Total backups
      totalBackups: `
        SELECT COUNT(*) as count 
        FROM backup_history 
        WHERE created_at >= ?
      `,
      
      // Successful backups
      successfulBackups: `
        SELECT COUNT(*) as count 
        FROM backup_history 
        WHERE created_at >= ? AND success = 1
      `,
      
      // Failed backups
      failedBackups: `
        SELECT COUNT(*) as count 
        FROM backup_history 
        WHERE created_at >= ? AND success = 0
      `,
      
      // Total backup size
      totalSize: `
        SELECT SUM(backup_size) as total_size 
        FROM backup_history 
        WHERE created_at >= ? AND success = 1
      `,
      
      // Average backup duration
      avgDuration: `
        SELECT AVG(duration) as avg_duration 
        FROM backup_history 
        WHERE created_at >= ? AND success = 1 AND duration > 0
      `,
      
      // Backup types distribution
      backupTypes: `
        SELECT backup_type, COUNT(*) as count 
        FROM backup_history 
        WHERE created_at >= ? 
        GROUP BY backup_type
      `,
      
      // Recent backup activity
      recentActivity: `
        SELECT 
          DATE(created_at) as date,
          COUNT(*) as backup_count,
          SUM(CASE WHEN success = 1 THEN 1 ELSE 0 END) as successful_count,
          SUM(backup_size) as total_size
        FROM backup_history 
        WHERE created_at >= ? 
        GROUP BY DATE(created_at) 
        ORDER BY date DESC
        LIMIT 30
      `,
      
      // Storage usage
      storageUsage: `
        SELECT 
          storage_name,
          storage_type,
          used_space,
          available_space
        FROM backup_storage 
        WHERE is_active = 1
      `,
      
      // Active jobs
      activeJobs: `
        SELECT COUNT(*) as count 
        FROM backup_jobs 
        WHERE status = 'active'
      `
    };

    const stats = {};
    const startDateStr = startDate.toISOString();
    let completedQueries = 0;
    const totalQueries = Object.keys(queries).length;

    // Execute all queries
    Object.entries(queries).forEach(([key, query]) => {
      const params = key === 'storageUsage' || key === 'activeJobs' ? [] : [startDateStr];
      
      db.all(query, params, (err, results) => {
        if (err) {
          console.error(`Error in ${key} query:`, err);
          stats[key] = key.includes('count') || key.includes('total') ? 0 : [];
        } else {
          if (key === 'totalBackups' || key === 'successfulBackups' || 
              key === 'failedBackups' || key === 'activeJobs') {
            stats[key] = results[0]?.count || 0;
          } else if (key === 'totalSize') {
            stats[key] = results[0]?.total_size || 0;
          } else if (key === 'avgDuration') {
            stats[key] = results[0]?.avg_duration || 0;
          } else {
            stats[key] = results;
          }
        }
        
        completedQueries++;
        if (completedQueries === totalQueries) {
          // Calculate additional metrics
          const totalBackups = stats.totalBackups || 0;
          const successfulBackups = stats.successfulBackups || 0;
          const failedBackups = stats.failedBackups || 0;
          
          stats.successRate = totalBackups > 0 ? 
            ((successfulBackups / totalBackups) * 100).toFixed(2) : 100;
          stats.failureRate = totalBackups > 0 ? 
            ((failedBackups / totalBackups) * 100).toFixed(2) : 0;
          stats.formattedTotalSize = formatBytes(stats.totalSize || 0);
          stats.formattedAvgDuration = formatDuration(stats.avgDuration || 0);
          
          // Format timeframe info
          stats.timeframe = {
            period: timeframe,
            startDate: startDateStr,
            endDate: now.toISOString(),
            totalDays: Math.ceil((now - startDate) / (1000 * 60 * 60 * 24))
          };

          res.json({
            success: true,
            stats,
            generated_at: new Date().toISOString()
          });
        }
      });
    });

  } catch (error) {
    console.error('Error generating backup statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating statistics'
    });
  }
});

// Create manual backup
router.post('/create', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const {
      backup_name,
      backup_type = 'full',
      databases = [],
      include_files = false,
      compression_enabled = true,
      encryption_enabled = false
    } = req.body;

    if (!backup_name) {
      return res.status(400).json({
        success: false,
        message: 'Backup name is required'
      });
    }

    const user = req.user;
    const jobConfig = {
      backup_name,
      backup_type,
      databases,
      include_files,
      compression_enabled,
      encryption_enabled
    };

    // Start backup process asynchronously
    backupService.createBackup(jobConfig, user.name)
      .then(result => {
        console.log('✅ Manual backup completed:', result);
      })
      .catch(error => {
        console.error('❌ Manual backup failed:', error);
      });

    res.json({
      success: true,
      message: 'Backup process started',
      backup_name
    });

  } catch (error) {
    console.error('Error starting backup:', error);
    res.status(500).json({
      success: false,
      message: 'Error starting backup process'
    });
  }
});

// Restore from backup
router.post('/restore/:backupId', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { backupId } = req.params;
    const {
      restore_type = 'full',
      databases_to_restore = [],
      files_to_restore = false,
      overwrite_existing = false
    } = req.body;

    const user = req.user;
    const restoreConfig = {
      restore_type,
      databases_to_restore,
      files_to_restore,
      overwrite_existing
    };

    // Start restore process asynchronously
    backupService.restoreBackup(parseInt(backupId), restoreConfig, user.name)
      .then(result => {
        console.log('✅ Restore completed:', result);
      })
      .catch(error => {
        console.error('❌ Restore failed:', error);
      });

    res.json({
      success: true,
      message: 'Restore process started',
      backup_id: backupId
    });

  } catch (error) {
    console.error('Error starting restore:', error);
    res.status(500).json({
      success: false,
      message: 'Error starting restore process'
    });
  }
});

// Download backup file
router.get('/download/:backupId', authenticateToken, requireAdmin, (req, res) => {
  try {
    const { backupId } = req.params;

    // Get backup information
    const query = 'SELECT * FROM backup_history WHERE id = ?';
    db.get(query, [backupId], (err, backup) => {
      if (err) {
        console.error('Error fetching backup:', err);
        return res.status(500).json({
          success: false,
          message: 'Error retrieving backup information'
        });
      }

      if (!backup) {
        return res.status(404).json({
          success: false,
          message: 'Backup not found'
        });
      }

      if (!fs.existsSync(backup.file_path)) {
        return res.status(404).json({
          success: false,
          message: 'Backup file not found'
        });
      }

      // Set headers for file download
      res.setHeader('Content-Type', 'application/zip');
      res.setHeader('Content-Disposition', `attachment; filename="${backup.file_name}"`);
      res.setHeader('Content-Length', backup.backup_size);

      // Stream the file
      const fileStream = fs.createReadStream(backup.file_path);
      fileStream.pipe(res);

      fileStream.on('error', (error) => {
        console.error('Error streaming backup file:', error);
        if (!res.headersSent) {
          res.status(500).json({
            success: false,
            message: 'Error downloading backup file'
          });
        }
      });
    });

  } catch (error) {
    console.error('Error in download endpoint:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Delete backup
router.delete('/:backupId', authenticateToken, requireAdmin, (req, res) => {
  try {
    const { backupId } = req.params;

    // Get backup information first
    const selectQuery = 'SELECT * FROM backup_history WHERE id = ?';
    db.get(selectQuery, [backupId], (err, backup) => {
      if (err) {
        console.error('Error fetching backup:', err);
        return res.status(500).json({
          success: false,
          message: 'Error retrieving backup information'
        });
      }

      if (!backup) {
        return res.status(404).json({
          success: false,
          message: 'Backup not found'
        });
      }

      // Delete the backup file if it exists
      if (backup.file_path && fs.existsSync(backup.file_path)) {
        try {
          fs.unlinkSync(backup.file_path);
          console.log(`🗑️ Backup file deleted: ${backup.file_path}`);
        } catch (fileError) {
          console.error('Error deleting backup file:', fileError);
        }
      }

      // Delete backup record from database
      const deleteQuery = 'DELETE FROM backup_history WHERE id = ?';
      db.run(deleteQuery, [backupId], function(err) {
        if (err) {
          console.error('Error deleting backup record:', err);
          return res.status(500).json({
            success: false,
            message: 'Error deleting backup record'
          });
        }

        if (this.changes === 0) {
          return res.status(404).json({
            success: false,
            message: 'Backup not found'
          });
        }

        res.json({
          success: true,
          message: 'Backup deleted successfully'
        });
      });
    });

  } catch (error) {
    console.error('Error in delete backup endpoint:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get notifications
router.get('/notifications', authenticateToken, requireAdmin, (req, res) => {
  try {
    const { limit = 50, unread_only = false } = req.query;

    let whereClause = '';
    let params = [];

    if (unread_only === 'true') {
      whereClause = 'WHERE is_read = 0';
    }

    const query = `
      SELECT * FROM backup_notifications 
      ${whereClause}
      ORDER BY created_at DESC 
      LIMIT ?
    `;

    params.push(parseInt(limit));

    db.all(query, params, (err, notifications) => {
      if (err) {
        console.error('Error fetching notifications:', err);
        return res.status(500).json({
          success: false,
          message: 'Error retrieving notifications'
        });
      }

      res.json({
        success: true,
        notifications: notifications.map(notification => ({
          ...notification,
          is_read: Boolean(notification.is_read),
          time_ago: getTimeAgo(notification.created_at)
        }))
      });
    });

  } catch (error) {
    console.error('Error in notifications endpoint:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Mark notification as read
router.put('/notifications/:id/read', authenticateToken, requireAdmin, (req, res) => {
  try {
    const { id } = req.params;

    const query = 'UPDATE backup_notifications SET is_read = 1 WHERE id = ?';
    db.run(query, [id], function(err) {
      if (err) {
        console.error('Error updating notification:', err);
        return res.status(500).json({
          success: false,
          message: 'Error updating notification'
        });
      }

      if (this.changes === 0) {
        return res.status(404).json({
          success: false,
          message: 'Notification not found'
        });
      }

      res.json({
        success: true,
        message: 'Notification marked as read'
      });
    });

  } catch (error) {
    console.error('Error in mark notification read endpoint:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Utility functions
function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function formatDuration(seconds) {
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  if (minutes < 60) return `${minutes}m ${remainingSeconds}s`;
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return `${hours}h ${remainingMinutes}m`;
}

function getTimeAgo(timestamp) {
  const now = new Date();
  const past = new Date(timestamp);
  const diffMs = now - past;
  
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffMinutes < 1) return 'Just now';
  if (diffMinutes < 60) return `${diffMinutes} minutes ago`;
  if (diffHours < 24) return `${diffHours} hours ago`;
  return `${diffDays} days ago`;
}

function calculateNextRun(cronExpression) {
  // Simple next run calculation (would use a proper cron library in production)
  const now = new Date();
  const nextRun = new Date(now.getTime() + 24 * 60 * 60 * 1000); // Next day for simplicity
  return nextRun.toISOString();
}

module.exports = router;