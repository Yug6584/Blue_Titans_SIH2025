const express = require('express');
const router = express.Router();
const db = require('../database/init-audit');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const { createAuditLogger, logSecurityEvent, logLoginActivity } = require('../middleware/auditLogger');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const path = require('path');
const fs = require('fs');

// Apply audit logging to all routes
router.use(createAuditLogger('audit_access', 'audit_system', 'info'));

// Get audit logs with advanced filtering and pagination
router.get('/logs', authenticateToken, requireAdmin, (req, res) => {
  try {
    const {
      page = 1,
      limit = 50,
      startDate,
      endDate,
      userId,
      actionType,
      resourceType,
      severity,
      status,
      search
    } = req.query;

    const offset = (page - 1) * limit;
    let whereConditions = [];
    let params = [];

    // Build dynamic WHERE clause
    if (startDate) {
      whereConditions.push('created_at >= ?');
      params.push(startDate);
    }

    if (endDate) {
      whereConditions.push('created_at <= ?');
      params.push(endDate + ' 23:59:59');
    }

    if (userId) {
      whereConditions.push('user_id = ?');
      params.push(userId);
    }

    if (actionType) {
      whereConditions.push('action_type = ?');
      params.push(actionType);
    }

    if (resourceType) {
      whereConditions.push('resource_type = ?');
      params.push(resourceType);
    }

    if (severity) {
      whereConditions.push('severity = ?');
      params.push(severity);
    }

    if (status) {
      whereConditions.push('status = ?');
      params.push(status);
    }

    if (search) {
      whereConditions.push(`(
        user_email LIKE ? OR 
        user_name LIKE ? OR 
        action_type LIKE ? OR 
        resource_name LIKE ? OR
        resource_type LIKE ?
      )`);
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm, searchTerm, searchTerm);
    }

    const whereClause = whereConditions.length > 0 ? 
      'WHERE ' + whereConditions.join(' AND ') : '';

    // Get total count for pagination
    const countQuery = `SELECT COUNT(*) as total FROM audit_trail ${whereClause}`;
    
    db.get(countQuery, params, (err, countResult) => {
      if (err) {
        console.error('Error counting audit logs:', err);
        return res.status(500).json({
          success: false,
          message: 'Error retrieving audit logs count'
        });
      }

      const total = countResult.total;
      const pages = Math.ceil(total / limit);

      // Get paginated results
      const dataQuery = `
        SELECT 
          id,
          user_id,
          user_email,
          user_name,
          user_role,
          action_type,
          resource_type,
          resource_id,
          resource_name,
          old_values,
          new_values,
          severity,
          status,
          ip_address,
          user_agent,
          session_id,
          metadata,
          error_message,
          created_at
        FROM audit_trail 
        ${whereClause}
        ORDER BY created_at DESC 
        LIMIT ? OFFSET ?
      `;

      const dataParams = [...params, parseInt(limit), offset];

      db.all(dataQuery, dataParams, (err, logs) => {
        if (err) {
          console.error('Error fetching audit logs:', err);
          return res.status(500).json({
            success: false,
            message: 'Error retrieving audit logs'
          });
        }

        // Parse JSON fields and enhance data
        const enhancedLogs = logs.map(log => ({
          ...log,
          old_values: log.old_values ? JSON.parse(log.old_values) : null,
          new_values: log.new_values ? JSON.parse(log.new_values) : null,
          metadata: log.metadata ? JSON.parse(log.metadata) : null,
          formatted_timestamp: new Date(log.created_at).toLocaleString(),
          time_ago: getTimeAgo(log.created_at),
          risk_score: calculateRiskScore(log)
        }));

        res.json({
          success: true,
          logs: enhancedLogs,
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
    console.error('Error in audit logs endpoint:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get audit statistics with comprehensive metrics
router.get('/stats', authenticateToken, requireAdmin, (req, res) => {
  try {
    const { timeframe = '7d' } = req.query;
    
    // Calculate date range based on timeframe
    const now = new Date();
    let startDate = new Date();
    
    switch (timeframe) {
      case '24h':
        startDate.setHours(now.getHours() - 24);
        break;
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
        startDate.setDate(now.getDate() - 7);
    }

    const queries = {
      // Total events in timeframe
      totalEvents: `
        SELECT COUNT(*) as count 
        FROM audit_trail 
        WHERE created_at >= ?
      `,
      
      // Events by severity
      eventsBySeverity: `
        SELECT severity, COUNT(*) as count 
        FROM audit_trail 
        WHERE created_at >= ? 
        GROUP BY severity
      `,
      
      // Events by status
      eventsByStatus: `
        SELECT status, COUNT(*) as count 
        FROM audit_trail 
        WHERE created_at >= ? 
        GROUP BY status
      `,
      
      // Top users by activity
      topUsers: `
        SELECT user_email, user_name, COUNT(*) as activity_count 
        FROM audit_trail 
        WHERE created_at >= ? AND user_email IS NOT NULL 
        GROUP BY user_email, user_name 
        ORDER BY activity_count DESC 
        LIMIT 10
      `,
      
      // Top actions
      topActions: `
        SELECT action_type, COUNT(*) as count 
        FROM audit_trail 
        WHERE created_at >= ? 
        GROUP BY action_type 
        ORDER BY count DESC 
        LIMIT 10
      `,
      
      // Security events
      securityEvents: `
        SELECT COUNT(*) as count 
        FROM security_events 
        WHERE created_at >= ?
      `,
      
      // Critical events
      criticalEvents: `
        SELECT COUNT(*) as count 
        FROM audit_trail 
        WHERE created_at >= ? AND severity = 'critical'
      `,
      
      // Failed events
      failedEvents: `
        SELECT COUNT(*) as count 
        FROM audit_trail 
        WHERE created_at >= ? AND status = 'failed'
      `,
      
      // Login activities
      loginStats: `
        SELECT 
          login_status,
          COUNT(*) as count 
        FROM login_activities 
        WHERE login_timestamp >= ? 
        GROUP BY login_status
      `,
      
      // Hourly activity (last 24 hours)
      hourlyActivity: `
        SELECT 
          strftime('%H', created_at) as hour,
          COUNT(*) as count 
        FROM audit_trail 
        WHERE created_at >= datetime('now', '-24 hours') 
        GROUP BY strftime('%H', created_at) 
        ORDER BY hour
      `,
      
      // Daily activity (based on timeframe)
      dailyActivity: `
        SELECT 
          DATE(created_at) as date,
          COUNT(*) as count 
        FROM audit_trail 
        WHERE created_at >= ? 
        GROUP BY DATE(created_at) 
        ORDER BY date
      `
    };

    const stats = {};
    const startDateStr = startDate.toISOString();
    let completedQueries = 0;
    const totalQueries = Object.keys(queries).length;

    // Execute all queries
    Object.entries(queries).forEach(([key, query]) => {
      db.all(query, [startDateStr], (err, results) => {
        if (err) {
          console.error(`Error in ${key} query:`, err);
          stats[key] = key.includes('Events') || key.includes('count') ? 0 : [];
        } else {
          if (key === 'totalEvents' || key === 'securityEvents' || 
              key === 'criticalEvents' || key === 'failedEvents') {
            stats[key] = results[0]?.count || 0;
          } else {
            stats[key] = results;
          }
        }
        
        completedQueries++;
        if (completedQueries === totalQueries) {
          // Calculate additional metrics
          const totalEvents = stats.totalEvents || 0;
          const criticalEvents = stats.criticalEvents || 0;
          const failedEvents = stats.failedEvents || 0;
          
          stats.riskScore = calculateSystemRiskScore(stats);
          stats.successRate = totalEvents > 0 ? 
            ((totalEvents - failedEvents) / totalEvents * 100).toFixed(2) : 100;
          stats.criticalRate = totalEvents > 0 ? 
            (criticalEvents / totalEvents * 100).toFixed(2) : 0;
          
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
    console.error('Error generating audit statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating statistics'
    });
  }
});

// Get security events with threat analysis
router.get('/security', authenticateToken, requireAdmin, (req, res) => {
  try {
    const { limit = 50, severity, status, threatLevel } = req.query;
    
    let whereConditions = [];
    let params = [];

    // By default, only show active events (not resolved, blocked, or deleted)
    if (!status) {
      whereConditions.push('status = ?');
      params.push('active');
    } else if (status) {
      whereConditions.push('status = ?');
      params.push(status);
    }

    if (severity) {
      whereConditions.push('severity = ?');
      params.push(severity);
    }

    if (threatLevel) {
      whereConditions.push('threat_level >= ?');
      params.push(parseInt(threatLevel));
    }

    const whereClause = whereConditions.length > 0 ? 
      'WHERE ' + whereConditions.join(' AND ') : '';

    const query = `
      SELECT 
        id,
        event_type,
        user_id,
        user_email,
        ip_address,
        user_agent,
        event_data,
        severity,
        status,
        threat_level,
        created_at,
        resolved_at,
        resolved_by
      FROM security_events 
      ${whereClause}
      ORDER BY threat_level DESC, created_at DESC 
      LIMIT ?
    `;

    params.push(parseInt(limit));

    db.all(query, params, (err, events) => {
      if (err) {
        console.error('Error fetching security events:', err);
        return res.status(500).json({
          success: false,
          message: 'Error retrieving security events'
        });
      }

      // Enhance security events with analysis
      const enhancedEvents = events.map(event => ({
        ...event,
        event_data: event.event_data ? JSON.parse(event.event_data) : null,
        formatted_timestamp: new Date(event.created_at).toLocaleString(),
        time_ago: getTimeAgo(event.created_at),
        threat_category: getThreatCategory(event.threat_level),
        requires_immediate_action: event.threat_level >= 8 && event.status === 'active'
      }));

      res.json({
        success: true,
        events: enhancedEvents,
        summary: {
          total: events.length,
          active_threats: events.filter(e => e.status === 'active').length,
          critical_threats: events.filter(e => e.threat_level >= 8).length,
          avg_threat_level: events.length > 0 ? 
            (events.reduce((sum, e) => sum + e.threat_level, 0) / events.length).toFixed(1) : 0
        }
      });
    });

  } catch (error) {
    console.error('Error in security events endpoint:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get login activities with pattern analysis
router.get('/login-activities', authenticateToken, requireAdmin, (req, res) => {
  try {
    const { limit = 100, status, userId, startDate, endDate } = req.query;
    
    let whereConditions = [];
    let params = [];

    if (status) {
      whereConditions.push('login_status = ?');
      params.push(status);
    }

    if (userId) {
      whereConditions.push('user_id = ?');
      params.push(userId);
    }

    if (startDate) {
      whereConditions.push('login_timestamp >= ?');
      params.push(startDate);
    }

    if (endDate) {
      whereConditions.push('login_timestamp <= ?');
      params.push(endDate + ' 23:59:59');
    }

    const whereClause = whereConditions.length > 0 ? 
      'WHERE ' + whereConditions.join(' AND ') : '';

    const query = `
      SELECT 
        id,
        user_id,
        email,
        login_status,
        failure_reason,
        ip_address,
        user_agent,
        session_id,
        mfa_used,
        session_duration,
        login_timestamp
      FROM login_activities 
      ${whereClause}
      ORDER BY login_timestamp DESC 
      LIMIT ?
    `;

    params.push(parseInt(limit));

    db.all(query, params, (err, activities) => {
      if (err) {
        console.error('Error fetching login activities:', err);
        return res.status(500).json({
          success: false,
          message: 'Error retrieving login activities'
        });
      }

      // Enhance login activities with analysis
      const enhancedActivities = activities.map(activity => ({
        ...activity,
        formatted_timestamp: new Date(activity.login_timestamp).toLocaleString(),
        time_ago: getTimeAgo(activity.login_timestamp),
        session_duration_formatted: activity.session_duration ? 
          formatDuration(activity.session_duration) : null,
        mfa_used: Boolean(activity.mfa_used),
        risk_indicators: analyzeLoginRisk(activity)
      }));

      // Calculate patterns and statistics
      const patterns = analyzeLoginPatterns(activities);

      res.json({
        success: true,
        activities: enhancedActivities,
        patterns,
        summary: {
          total: activities.length,
          successful: activities.filter(a => a.login_status === 'success').length,
          failed: activities.filter(a => a.login_status === 'failed').length,
          mfa_usage: activities.filter(a => a.mfa_used).length,
          unique_ips: [...new Set(activities.map(a => a.ip_address))].length
        }
      });
    });

  } catch (error) {
    console.error('Error in login activities endpoint:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get filter options for the frontend
router.get('/filters', authenticateToken, requireAdmin, (req, res) => {
  try {
    const queries = {
      actionTypes: 'SELECT DISTINCT action_type FROM audit_trail ORDER BY action_type',
      resourceTypes: 'SELECT DISTINCT resource_type FROM audit_trail ORDER BY resource_type',
      severityLevels: 'SELECT DISTINCT severity FROM audit_trail ORDER BY severity',
      users: `
        SELECT DISTINCT user_id, user_email, user_name 
        FROM audit_trail 
        WHERE user_id IS NOT NULL 
        ORDER BY user_name
      `
    };

    const options = {};
    let completedQueries = 0;
    const totalQueries = Object.keys(queries).length;

    Object.entries(queries).forEach(([key, query]) => {
      db.all(query, [], (err, results) => {
        if (err) {
          console.error(`Error in ${key} filter query:`, err);
          options[key] = [];
        } else {
          if (key === 'users') {
            options[key] = results;
          } else {
            options[key] = results.map(row => Object.values(row)[0]);
          }
        }
        
        completedQueries++;
        if (completedQueries === totalQueries) {
          res.json({
            success: true,
            options
          });
        }
      });
    });

  } catch (error) {
    console.error('Error fetching filter options:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving filter options'
    });
  }
});

// Export audit logs in various formats
router.post('/export', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { format = 'csv', startDate, endDate, filters = {} } = req.body;
    
    // Build query with filters
    let whereConditions = [];
    let params = [];

    if (startDate) {
      whereConditions.push('created_at >= ?');
      params.push(startDate);
    }

    if (endDate) {
      whereConditions.push('created_at <= ?');
      params.push(endDate + ' 23:59:59');
    }

    Object.entries(filters).forEach(([key, value]) => {
      if (value && value !== '') {
        if (key === 'search') {
          whereConditions.push(`(
            user_email LIKE ? OR 
            user_name LIKE ? OR 
            action_type LIKE ? OR 
            resource_name LIKE ?
          )`);
          const searchTerm = `%${value}%`;
          params.push(searchTerm, searchTerm, searchTerm, searchTerm);
        } else {
          whereConditions.push(`${key} = ?`);
          params.push(value);
        }
      }
    });

    const whereClause = whereConditions.length > 0 ? 
      'WHERE ' + whereConditions.join(' AND ') : '';

    const query = `
      SELECT 
        id,
        user_email,
        user_name,
        user_role,
        action_type,
        resource_type,
        resource_name,
        severity,
        status,
        ip_address,
        created_at,
        old_values,
        new_values,
        metadata
      FROM audit_trail 
      ${whereClause}
      ORDER BY created_at DESC
    `;

    db.all(query, params, async (err, logs) => {
      if (err) {
        console.error('Error exporting audit logs:', err);
        return res.status(500).json({
          success: false,
          message: 'Error exporting audit logs'
        });
      }

      try {
        if (format === 'csv') {
          // Generate CSV
          const timestamp = new Date().toISOString().split('T')[0];
          const filename = `audit_logs_${timestamp}.csv`;
          const filepath = path.join(__dirname, '../exports', filename);
          
          // Ensure exports directory exists
          const exportsDir = path.dirname(filepath);
          if (!fs.existsSync(exportsDir)) {
            fs.mkdirSync(exportsDir, { recursive: true });
          }

          const csvWriter = createCsvWriter({
            path: filepath,
            header: [
              { id: 'id', title: 'ID' },
              { id: 'user_email', title: 'User Email' },
              { id: 'user_name', title: 'User Name' },
              { id: 'user_role', title: 'User Role' },
              { id: 'action_type', title: 'Action Type' },
              { id: 'resource_type', title: 'Resource Type' },
              { id: 'resource_name', title: 'Resource Name' },
              { id: 'severity', title: 'Severity' },
              { id: 'status', title: 'Status' },
              { id: 'ip_address', title: 'IP Address' },
              { id: 'created_at', title: 'Timestamp' },
              { id: 'old_values', title: 'Old Values' },
              { id: 'new_values', title: 'New Values' },
              { id: 'metadata', title: 'Metadata' }
            ]
          });

          await csvWriter.writeRecords(logs);
          
          // Send file
          res.download(filepath, filename, (err) => {
            if (err) {
              console.error('Error sending file:', err);
            }
            // Clean up file after sending
            fs.unlink(filepath, (unlinkErr) => {
              if (unlinkErr) console.error('Error cleaning up file:', unlinkErr);
            });
          });

        } else if (format === 'json') {
          // Send JSON
          const timestamp = new Date().toISOString();
          res.setHeader('Content-Type', 'application/json');
          res.setHeader('Content-Disposition', `attachment; filename="audit_logs_${timestamp.split('T')[0]}.json"`);
          
          res.json({
            export_info: {
              generated_at: timestamp,
              total_records: logs.length,
              filters_applied: filters,
              date_range: { startDate, endDate }
            },
            audit_logs: logs
          });

        } else {
          res.status(400).json({
            success: false,
            message: 'Unsupported export format'
          });
        }

      } catch (exportError) {
        console.error('Error processing export:', exportError);
        res.status(500).json({
          success: false,
          message: 'Error processing export'
        });
      }
    });

  } catch (error) {
    console.error('Error in export endpoint:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Real-time audit log streaming endpoint
router.get('/stream', authenticateToken, requireAdmin, (req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Cache-Control'
  });

  // Send initial connection message
  res.write(`data: ${JSON.stringify({ type: 'connected', timestamp: new Date().toISOString() })}\n\n`);

  // Set up periodic updates (every 10 seconds)
  const interval = setInterval(() => {
    // Get latest audit entries
    const query = `
      SELECT * FROM audit_trail 
      WHERE created_at > datetime('now', '-10 seconds') 
      ORDER BY created_at DESC
    `;
    
    db.all(query, [], (err, logs) => {
      if (!err && logs.length > 0) {
        res.write(`data: ${JSON.stringify({ 
          type: 'new_logs', 
          logs: logs.map(log => ({
            ...log,
            old_values: log.old_values ? JSON.parse(log.old_values) : null,
            new_values: log.new_values ? JSON.parse(log.new_values) : null,
            metadata: log.metadata ? JSON.parse(log.metadata) : null
          })),
          timestamp: new Date().toISOString() 
        })}\n\n`);
      }
    });
  }, 10000);

  // Clean up on client disconnect
  req.on('close', () => {
    clearInterval(interval);
  });
});

// Utility functions
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

function calculateRiskScore(log) {
  let score = 0;
  
  // Base score by severity
  const severityScores = { critical: 10, high: 7, medium: 5, low: 2, info: 1 };
  score += severityScores[log.severity] || 1;
  
  // Failed actions increase risk
  if (log.status === 'failed') score += 3;
  
  // Certain action types are riskier
  const riskyActions = ['user_delete', 'system_settings_change', 'privilege_escalation'];
  if (riskyActions.includes(log.action_type)) score += 2;
  
  return Math.min(score, 10);
}

function calculateSystemRiskScore(stats) {
  let riskScore = 0;
  
  const totalEvents = stats.totalEvents || 0;
  const criticalEvents = stats.criticalEvents || 0;
  const failedEvents = stats.failedEvents || 0;
  const securityEvents = stats.securityEvents || 0;
  
  if (totalEvents > 0) {
    // High failure rate increases risk
    const failureRate = failedEvents / totalEvents;
    if (failureRate > 0.1) riskScore += 3;
    else if (failureRate > 0.05) riskScore += 2;
    
    // High critical event rate increases risk
    const criticalRate = criticalEvents / totalEvents;
    if (criticalRate > 0.05) riskScore += 4;
    else if (criticalRate > 0.02) riskScore += 2;
  }
  
  // Security events significantly increase risk
  if (securityEvents > 5) riskScore += 5;
  else if (securityEvents > 0) riskScore += 2;
  
  return Math.min(riskScore, 10);
}

function getThreatCategory(threatLevel) {
  if (threatLevel >= 9) return 'Critical';
  if (threatLevel >= 7) return 'High';
  if (threatLevel >= 5) return 'Medium';
  if (threatLevel >= 3) return 'Low';
  return 'Minimal';
}

function formatDuration(seconds) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  if (hours > 0) return `${hours}h ${minutes}m`;
  if (minutes > 0) return `${minutes}m ${secs}s`;
  return `${secs}s`;
}

function analyzeLoginRisk(activity) {
  const risks = [];
  
  if (activity.login_status === 'failed') {
    risks.push('Failed login attempt');
  }
  
  if (!activity.mfa_used && activity.login_status === 'success') {
    risks.push('No MFA used');
  }
  
  // Check for suspicious IP patterns (simplified)
  if (activity.ip_address && !activity.ip_address.startsWith('192.168.')) {
    risks.push('External IP address');
  }
  
  if (activity.user_agent && activity.user_agent.includes('curl')) {
    risks.push('Automated tool detected');
  }
  
  return risks;
}

function analyzeLoginPatterns(activities) {
  const patterns = {
    failed_login_clusters: [],
    suspicious_ips: [],
    unusual_times: [],
    mfa_compliance: 0
  };
  
  // Analyze failed login clusters
  const failedLogins = activities.filter(a => a.login_status === 'failed');
  const ipCounts = {};
  
  failedLogins.forEach(login => {
    ipCounts[login.ip_address] = (ipCounts[login.ip_address] || 0) + 1;
  });
  
  Object.entries(ipCounts).forEach(([ip, count]) => {
    if (count >= 3) {
      patterns.failed_login_clusters.push({ ip, count });
    }
  });
  
  // Calculate MFA compliance
  const successfulLogins = activities.filter(a => a.login_status === 'success');
  if (successfulLogins.length > 0) {
    const mfaUsed = successfulLogins.filter(a => a.mfa_used).length;
    patterns.mfa_compliance = (mfaUsed / successfulLogins.length * 100).toFixed(1);
  }
  
  return patterns;
}

module.exports = router;