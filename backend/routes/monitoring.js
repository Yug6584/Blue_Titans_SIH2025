const express = require('express');
const router = express.Router();
const db = require('../database/init-monitoring');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const { createAuditLogger } = require('../middleware/auditLogger');
const os = require('os');
const fs = require('fs');
const path = require('path');

// Apply audit logging to monitoring routes
router.use(createAuditLogger('monitoring_access', 'system_monitoring', 'info'));

// Get real-time system metrics
router.get('/metrics', authenticateToken, requireAdmin, (req, res) => {
  try {
    const { timeframe = '1h', metric_type } = req.query;
    
    // Calculate time range
    const now = new Date();
    let startTime = new Date();
    
    switch (timeframe) {
      case '5m':
        startTime.setMinutes(now.getMinutes() - 5);
        break;
      case '15m':
        startTime.setMinutes(now.getMinutes() - 15);
        break;
      case '1h':
        startTime.setHours(now.getHours() - 1);
        break;
      case '6h':
        startTime.setHours(now.getHours() - 6);
        break;
      case '24h':
        startTime.setHours(now.getHours() - 24);
        break;
      default:
        startTime.setHours(now.getHours() - 1);
    }

    let whereClause = 'WHERE created_at >= ?';
    let params = [startTime.toISOString()];

    if (metric_type) {
      whereClause += ' AND metric_type = ?';
      params.push(metric_type);
    }

    const query = `
      SELECT 
        metric_type,
        metric_name,
        metric_value,
        metric_unit,
        threshold_warning,
        threshold_critical,
        status,
        created_at
      FROM system_metrics 
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT 1000
    `;

    db.all(query, params, (err, metrics) => {
      if (err) {
        console.error('Error fetching system metrics:', err);
        return res.status(500).json({
          success: false,
          message: 'Error retrieving system metrics'
        });
      }

      // Group metrics by type for easier frontend consumption
      const groupedMetrics = {};
      metrics.forEach(metric => {
        if (!groupedMetrics[metric.metric_type]) {
          groupedMetrics[metric.metric_type] = [];
        }
        groupedMetrics[metric.metric_type].push({
          ...metric,
          timestamp: metric.created_at,
          is_warning: metric.metric_value >= metric.threshold_warning,
          is_critical: metric.metric_value >= metric.threshold_critical
        });
      });

      // Get latest values for each metric type
      const latestMetrics = {};
      Object.keys(groupedMetrics).forEach(type => {
        const typeMetrics = groupedMetrics[type];
        const latestByName = {};
        
        typeMetrics.forEach(metric => {
          if (!latestByName[metric.metric_name] || 
              new Date(metric.created_at) > new Date(latestByName[metric.metric_name].created_at)) {
            latestByName[metric.metric_name] = metric;
          }
        });
        
        latestMetrics[type] = Object.values(latestByName);
      });

      res.json({
        success: true,
        metrics: groupedMetrics,
        latest_metrics: latestMetrics,
        timeframe: {
          start: startTime.toISOString(),
          end: now.toISOString(),
          duration: timeframe
        }
      });
    });

  } catch (error) {
    console.error('Error in metrics endpoint:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get system health status
router.get('/health', authenticateToken, requireAdmin, (req, res) => {
  try {
    const query = `
      SELECT 
        service_name,
        service_type,
        endpoint_url,
        status,
        response_time,
        status_code,
        uptime_percentage,
        last_success,
        last_failure,
        created_at
      FROM health_checks 
      WHERE id IN (
        SELECT MAX(id) 
        FROM health_checks 
        GROUP BY service_name
      )
      ORDER BY service_name
    `;

    db.all(query, [], (err, healthChecks) => {
      if (err) {
        console.error('Error fetching health checks:', err);
        return res.status(500).json({
          success: false,
          message: 'Error retrieving health status'
        });
      }

      // Calculate overall system health
      const totalServices = healthChecks.length;
      const healthyServices = healthChecks.filter(check => check.status === 'healthy').length;
      const degradedServices = healthChecks.filter(check => check.status === 'degraded').length;
      const unhealthyServices = healthChecks.filter(check => check.status === 'unhealthy').length;

      let overallStatus = 'healthy';
      if (unhealthyServices > 0) {
        overallStatus = 'unhealthy';
      } else if (degradedServices > 0) {
        overallStatus = 'degraded';
      }

      const overallHealth = (healthyServices / totalServices * 100).toFixed(1);

      res.json({
        success: true,
        overall_status: overallStatus,
        overall_health_percentage: parseFloat(overallHealth),
        services: healthChecks.map(check => ({
          ...check,
          last_check: check.created_at,
          is_healthy: check.status === 'healthy',
          is_degraded: check.status === 'degraded',
          is_unhealthy: check.status === 'unhealthy'
        })),
        summary: {
          total_services: totalServices,
          healthy_services: healthyServices,
          degraded_services: degradedServices,
          unhealthy_services: unhealthyServices
        }
      });
    });

  } catch (error) {
    console.error('Error in health endpoint:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get system alerts
router.get('/alerts', authenticateToken, requireAdmin, (req, res) => {
  try {
    const { status = 'active', severity, limit = 50 } = req.query;

    let whereConditions = [];
    let params = [];

    if (status !== 'all') {
      whereConditions.push('status = ?');
      params.push(status);
    }

    if (severity) {
      whereConditions.push('severity = ?');
      params.push(severity);
    }

    const whereClause = whereConditions.length > 0 ? 
      'WHERE ' + whereConditions.join(' AND ') : '';

    const query = `
      SELECT 
        id,
        alert_type,
        severity,
        title,
        description,
        source_service,
        metric_name,
        metric_value,
        threshold_value,
        status,
        acknowledged_by,
        acknowledged_at,
        resolved_at,
        created_at
      FROM system_alerts 
      ${whereClause}
      ORDER BY 
        CASE severity 
          WHEN 'critical' THEN 1 
          WHEN 'high' THEN 2 
          WHEN 'medium' THEN 3 
          WHEN 'low' THEN 4 
        END,
        created_at DESC
      LIMIT ?
    `;

    params.push(parseInt(limit));

    db.all(query, params, (err, alerts) => {
      if (err) {
        console.error('Error fetching alerts:', err);
        return res.status(500).json({
          success: false,
          message: 'Error retrieving alerts'
        });
      }

      // Calculate alert statistics
      const alertStats = {
        total: alerts.length,
        critical: alerts.filter(a => a.severity === 'critical').length,
        high: alerts.filter(a => a.severity === 'high').length,
        medium: alerts.filter(a => a.severity === 'medium').length,
        low: alerts.filter(a => a.severity === 'low').length,
        active: alerts.filter(a => a.status === 'active').length,
        acknowledged: alerts.filter(a => a.status === 'acknowledged').length,
        resolved: alerts.filter(a => a.status === 'resolved').length
      };

      res.json({
        success: true,
        alerts: alerts.map(alert => ({
          ...alert,
          time_ago: getTimeAgo(alert.created_at),
          is_critical: alert.severity === 'critical',
          is_active: alert.status === 'active',
          threshold_exceeded: alert.metric_value > alert.threshold_value
        })),
        statistics: alertStats
      });
    });

  } catch (error) {
    console.error('Error in alerts endpoint:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get performance analytics
router.get('/performance', authenticateToken, requireAdmin, (req, res) => {
  try {
    const { timeframe = '24h', endpoint } = req.query;

    // Calculate time range
    const now = new Date();
    let startTime = new Date();
    
    switch (timeframe) {
      case '1h':
        startTime.setHours(now.getHours() - 1);
        break;
      case '6h':
        startTime.setHours(now.getHours() - 6);
        break;
      case '24h':
        startTime.setHours(now.getHours() - 24);
        break;
      case '7d':
        startTime.setDate(now.getDate() - 7);
        break;
      default:
        startTime.setHours(now.getHours() - 24);
    }

    let whereClause = 'WHERE created_at >= ?';
    let params = [startTime.toISOString()];

    if (endpoint) {
      whereClause += ' AND endpoint = ?';
      params.push(endpoint);
    }

    // Get performance statistics
    const statsQuery = `
      SELECT 
        endpoint,
        method,
        COUNT(*) as request_count,
        AVG(response_time) as avg_response_time,
        MIN(response_time) as min_response_time,
        MAX(response_time) as max_response_time,
        AVG(request_size) as avg_request_size,
        AVG(response_size) as avg_response_size,
        COUNT(CASE WHEN status_code >= 400 THEN 1 END) as error_count,
        COUNT(CASE WHEN status_code < 400 THEN 1 END) as success_count
      FROM performance_logs 
      ${whereClause}
      GROUP BY endpoint, method
      ORDER BY request_count DESC
    `;

    db.all(statsQuery, params, (err, performanceStats) => {
      if (err) {
        console.error('Error fetching performance stats:', err);
        return res.status(500).json({
          success: false,
          message: 'Error retrieving performance data'
        });
      }

      // Get hourly performance trends
      const trendsQuery = `
        SELECT 
          strftime('%Y-%m-%d %H:00:00', created_at) as hour,
          COUNT(*) as request_count,
          AVG(response_time) as avg_response_time,
          COUNT(CASE WHEN status_code >= 400 THEN 1 END) as error_count
        FROM performance_logs 
        ${whereClause}
        GROUP BY strftime('%Y-%m-%d %H:00:00', created_at)
        ORDER BY hour
      `;

      db.all(trendsQuery, params, (err, trends) => {
        if (err) {
          console.error('Error fetching performance trends:', err);
          return res.status(500).json({
            success: false,
            message: 'Error retrieving performance trends'
          });
        }

        // Calculate overall metrics
        const totalRequests = performanceStats.reduce((sum, stat) => sum + stat.request_count, 0);
        const totalErrors = performanceStats.reduce((sum, stat) => sum + stat.error_count, 0);
        const avgResponseTime = performanceStats.reduce((sum, stat) => 
          sum + (stat.avg_response_time * stat.request_count), 0) / totalRequests || 0;

        res.json({
          success: true,
          performance_stats: performanceStats.map(stat => ({
            ...stat,
            error_rate: ((stat.error_count / stat.request_count) * 100).toFixed(2),
            success_rate: ((stat.success_count / stat.request_count) * 100).toFixed(2)
          })),
          trends: trends,
          summary: {
            total_requests: totalRequests,
            total_errors: totalErrors,
            error_rate: ((totalErrors / totalRequests) * 100).toFixed(2),
            avg_response_time: avgResponseTime.toFixed(2),
            timeframe: {
              start: startTime.toISOString(),
              end: now.toISOString(),
              duration: timeframe
            }
          }
        });
      });
    });

  } catch (error) {
    console.error('Error in performance endpoint:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get system resources
router.get('/resources', authenticateToken, requireAdmin, (req, res) => {
  try {
    const query = `
      SELECT 
        resource_type,
        resource_name,
        current_usage,
        max_limit,
        usage_percentage,
        status,
        process_id,
        created_at
      FROM system_resources 
      WHERE id IN (
        SELECT MAX(id) 
        FROM system_resources 
        GROUP BY resource_type, resource_name
      )
      ORDER BY usage_percentage DESC
    `;

    db.all(query, [], (err, resources) => {
      if (err) {
        console.error('Error fetching system resources:', err);
        return res.status(500).json({
          success: false,
          message: 'Error retrieving system resources'
        });
      }

      // Get real-time system information
      const systemInfo = {
        platform: os.platform(),
        architecture: os.arch(),
        cpu_count: os.cpus().length,
        total_memory: os.totalmem(),
        free_memory: os.freemem(),
        uptime: os.uptime(),
        load_average: os.loadavg(),
        node_version: process.version,
        process_id: process.pid,
        process_uptime: process.uptime()
      };

      // Group resources by type
      const groupedResources = {};
      resources.forEach(resource => {
        if (!groupedResources[resource.resource_type]) {
          groupedResources[resource.resource_type] = [];
        }
        groupedResources[resource.resource_type].push({
          ...resource,
          is_warning: resource.usage_percentage > 70,
          is_critical: resource.usage_percentage > 90
        });
      });

      res.json({
        success: true,
        resources: groupedResources,
        system_info: systemInfo,
        memory_usage: {
          total: systemInfo.total_memory,
          free: systemInfo.free_memory,
          used: systemInfo.total_memory - systemInfo.free_memory,
          usage_percentage: ((systemInfo.total_memory - systemInfo.free_memory) / systemInfo.total_memory * 100).toFixed(2)
        }
      });
    });

  } catch (error) {
    console.error('Error in resources endpoint:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get database performance metrics
router.get('/database', authenticateToken, requireAdmin, (req, res) => {
  try {
    const query = `
      SELECT 
        database_name,
        query_type,
        query_count,
        avg_execution_time,
        max_execution_time,
        slow_queries,
        failed_queries,
        connections_active,
        connections_total,
        database_size,
        created_at
      FROM database_performance 
      WHERE id IN (
        SELECT MAX(id) 
        FROM database_performance 
        GROUP BY database_name, query_type
      )
      ORDER BY database_name, query_type
    `;

    db.all(query, [], (err, dbMetrics) => {
      if (err) {
        console.error('Error fetching database metrics:', err);
        return res.status(500).json({
          success: false,
          message: 'Error retrieving database metrics'
        });
      }

      // Group by database name
      const groupedMetrics = {};
      dbMetrics.forEach(metric => {
        if (!groupedMetrics[metric.database_name]) {
          groupedMetrics[metric.database_name] = {
            database_name: metric.database_name,
            total_size: metric.database_size,
            total_connections: metric.connections_total,
            active_connections: metric.connections_active,
            query_types: []
          };
        }
        
        groupedMetrics[metric.database_name].query_types.push({
          query_type: metric.query_type,
          query_count: metric.query_count,
          avg_execution_time: metric.avg_execution_time,
          max_execution_time: metric.max_execution_time,
          slow_queries: metric.slow_queries,
          failed_queries: metric.failed_queries,
          performance_score: calculatePerformanceScore(metric)
        });
      });

      // Calculate overall database health
      const totalQueries = dbMetrics.reduce((sum, metric) => sum + metric.query_count, 0);
      const totalSlowQueries = dbMetrics.reduce((sum, metric) => sum + metric.slow_queries, 0);
      const totalFailedQueries = dbMetrics.reduce((sum, metric) => sum + metric.failed_queries, 0);
      const avgExecutionTime = dbMetrics.reduce((sum, metric) => 
        sum + (metric.avg_execution_time * metric.query_count), 0) / totalQueries || 0;

      res.json({
        success: true,
        databases: Object.values(groupedMetrics),
        summary: {
          total_queries: totalQueries,
          total_slow_queries: totalSlowQueries,
          total_failed_queries: totalFailedQueries,
          avg_execution_time: avgExecutionTime.toFixed(2),
          slow_query_percentage: ((totalSlowQueries / totalQueries) * 100).toFixed(2),
          error_rate: ((totalFailedQueries / totalQueries) * 100).toFixed(2)
        }
      });
    });

  } catch (error) {
    console.error('Error in database endpoint:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Acknowledge alert
router.post('/alerts/:id/acknowledge', authenticateToken, requireAdmin, (req, res) => {
  try {
    const { id } = req.params;
    const { acknowledged_by } = req.body;
    const user = req.user;

    const updateQuery = `
      UPDATE system_alerts 
      SET status = 'acknowledged', 
          acknowledged_by = ?, 
          acknowledged_at = CURRENT_TIMESTAMP 
      WHERE id = ? AND status = 'active'
    `;

    db.run(updateQuery, [acknowledged_by || user.name, id], function(err) {
      if (err) {
        console.error('Error acknowledging alert:', err);
        return res.status(500).json({
          success: false,
          message: 'Error acknowledging alert'
        });
      }

      if (this.changes === 0) {
        return res.status(404).json({
          success: false,
          message: 'Alert not found or already acknowledged'
        });
      }

      res.json({
        success: true,
        message: 'Alert acknowledged successfully'
      });
    });

  } catch (error) {
    console.error('Error in acknowledge alert endpoint:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Resolve alert
router.post('/alerts/:id/resolve', authenticateToken, requireAdmin, (req, res) => {
  try {
    const { id } = req.params;

    const updateQuery = `
      UPDATE system_alerts 
      SET status = 'resolved', 
          resolved_at = CURRENT_TIMESTAMP 
      WHERE id = ? AND status IN ('active', 'acknowledged')
    `;

    db.run(updateQuery, [id], function(err) {
      if (err) {
        console.error('Error resolving alert:', err);
        return res.status(500).json({
          success: false,
          message: 'Error resolving alert'
        });
      }

      if (this.changes === 0) {
        return res.status(404).json({
          success: false,
          message: 'Alert not found or already resolved'
        });
      }

      res.json({
        success: true,
        message: 'Alert resolved successfully'
      });
    });

  } catch (error) {
    console.error('Error in resolve alert endpoint:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Real-time monitoring stream
router.get('/stream', (req, res) => {
  // Extract token from query parameter for EventSource compatibility
  const token = req.query.token;
  
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Token required for streaming'
    });
  }

  // Verify token manually since EventSource can't send headers
  const jwt = require('jsonwebtoken');
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check if user is admin
    if (decoded.panel !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Cache-Control'
  });

  // Send initial connection message
  res.write(`data: ${JSON.stringify({ 
    type: 'connected', 
    timestamp: new Date().toISOString(),
    message: 'Monitoring stream connected'
  })}\n\n`);

  // Send system metrics every 10 seconds
  const interval = setInterval(() => {
    // Get latest metrics
    const metricsQuery = `
      SELECT * FROM system_metrics 
      WHERE created_at > datetime('now', '-30 seconds') 
      ORDER BY created_at DESC 
      LIMIT 10
    `;
    
    db.all(metricsQuery, [], (err, metrics) => {
      if (!err && metrics.length > 0) {
        res.write(`data: ${JSON.stringify({ 
          type: 'metrics_update', 
          metrics: metrics,
          timestamp: new Date().toISOString() 
        })}\n\n`);
      }
    });

    // Check for new alerts
    const alertsQuery = `
      SELECT * FROM system_alerts 
      WHERE created_at > datetime('now', '-30 seconds') 
      AND status = 'active'
      ORDER BY created_at DESC
    `;
    
    db.all(alertsQuery, [], (err, alerts) => {
      if (!err && alerts.length > 0) {
        res.write(`data: ${JSON.stringify({ 
          type: 'new_alerts', 
          alerts: alerts,
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

function calculatePerformanceScore(metric) {
  let score = 100;
  
  // Deduct points for slow queries
  if (metric.slow_queries > 0) {
    score -= (metric.slow_queries / metric.query_count) * 30;
  }
  
  // Deduct points for failed queries
  if (metric.failed_queries > 0) {
    score -= (metric.failed_queries / metric.query_count) * 50;
  }
  
  // Deduct points for high execution time
  if (metric.avg_execution_time > 100) {
    score -= Math.min(30, (metric.avg_execution_time - 100) / 10);
  }
  
  return Math.max(0, Math.round(score));
}

module.exports = router;