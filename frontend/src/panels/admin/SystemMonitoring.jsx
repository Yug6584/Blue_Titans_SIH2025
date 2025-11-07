import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Paper,
  Chip,
  IconButton,
  Button,
  LinearProgress,
  CircularProgress,
  Alert,
  Snackbar,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  Divider,
  Switch,
  FormControlLabel,
  Tooltip,
  Badge,
  useTheme,
  useMediaQuery,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select
} from '@mui/material';
import {
  Monitor,
  Memory,
  Storage,
  NetworkCheck,
  Speed,
  Warning,
  CheckCircle,
  Error,
  Info,
  Refresh,
  Assessment,
  Computer,
  Security,
  NotificationsActive,
  Close,
  Check,
  Schedule,
  Visibility,
  DeviceHub,
  SystemUpdate
} from '@mui/icons-material';
import { blueCarbon } from '../../theme/colors';

// Add CSS animation for real-time indicator
const pulseAnimation = `
  @keyframes pulse {
    0% {
      opacity: 1;
    }
    50% {
      opacity: 0.5;
    }
    100% {
      opacity: 1;
    }
  }
`;

// Inject the animation styles
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = pulseAnimation;
  document.head.appendChild(style);
}

const SystemMonitoring = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [realTimeEnabled, setRealTimeEnabled] = useState(false);
  
  // Data states
  const [systemMetrics, setSystemMetrics] = useState({});
  const [healthStatus, setHealthStatus] = useState({});
  const [alerts, setAlerts] = useState([]);
  const [performance, setPerformance] = useState({});
  const [resources, setResources] = useState({});
  const [databaseMetrics, setDatabaseMetrics] = useState({});
  
  // UI states
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'info' });
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [alertDialog, setAlertDialog] = useState(false);
  const [timeframe, setTimeframe] = useState('1h');

  useEffect(() => {
    loadAllData();
  }, [timeframe]);

  useEffect(() => {
    let interval;
    if (autoRefresh) {
      interval = setInterval(() => {
        loadAllData(true);
      }, 30000); // Refresh every 30 seconds
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh, timeframe]);

  // Real-time updates via Server-Sent Events
  useEffect(() => {
    if (realTimeEnabled) {
      const token = localStorage.getItem('token');
      
      if (!token) {
        showNotification('Authentication token not found. Please login again.', 'error');
        setRealTimeEnabled(false);
        return;
      }

      console.log('🔄 Starting real-time monitoring stream...');
      const eventSource = new EventSource(`http://localhost:8000/api/monitoring/stream?token=${token}`);
      
      eventSource.onopen = () => {
        console.log('✅ Real-time monitoring stream connected');
        showNotification('Real-time monitoring connected', 'success');
      };

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('📡 Received real-time data:', data.type);
          
          if (data.type === 'connected') {
            console.log('🎯 Stream connection confirmed:', data.message);
          } else if (data.type === 'metrics_update' && data.metrics.length > 0) {
            console.log(`📊 Updating ${data.metrics.length} metrics`);
            updateMetricsFromStream(data.metrics);
            showNotification(`Updated ${data.metrics.length} real-time metrics`, 'info');
          } else if (data.type === 'new_alerts' && data.alerts.length > 0) {
            console.log(`🚨 Received ${data.alerts.length} new alerts`);
            setAlerts(prevAlerts => [...data.alerts, ...prevAlerts]);
            showNotification(`${data.alerts.length} new system alerts received`, 'warning');
          }
        } catch (error) {
          console.error('Error parsing real-time data:', error);
        }
      };

      eventSource.onerror = (error) => {
        console.error('❌ EventSource failed:', error);
        showNotification('Real-time connection lost. Retrying...', 'error');
        
        // Auto-retry after 5 seconds
        setTimeout(() => {
          if (realTimeEnabled) {
            console.log('🔄 Retrying real-time connection...');
            setRealTimeEnabled(false);
            setTimeout(() => setRealTimeEnabled(true), 1000);
          }
        }, 5000);
      };

      return () => {
        console.log('🔌 Closing real-time monitoring stream');
        eventSource.close();
      };
    }
  }, [realTimeEnabled]);

  const loadAllData = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      setRefreshing(true);

      const token = localStorage.getItem('token');
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      // Load all monitoring data in parallel
      const [metricsRes, healthRes, alertsRes, performanceRes, resourcesRes, databaseRes] = await Promise.all([
        fetch(`http://localhost:8000/api/monitoring/metrics?timeframe=${timeframe}`, { headers }),
        fetch(`http://localhost:8000/api/monitoring/health`, { headers }),
        fetch(`http://localhost:8000/api/monitoring/alerts?limit=50`, { headers }),
        fetch(`http://localhost:8000/api/monitoring/performance?timeframe=${timeframe}`, { headers }),
        fetch(`http://localhost:8000/api/monitoring/resources`, { headers }),
        fetch(`http://localhost:8000/api/monitoring/database`, { headers })
      ]);

      // Process responses
      if (metricsRes.ok) {
        const data = await metricsRes.json();
        if (data.success) setSystemMetrics(data);
      }

      if (healthRes.ok) {
        const data = await healthRes.json();
        if (data.success) setHealthStatus(data);
      }

      if (alertsRes.ok) {
        const data = await alertsRes.json();
        if (data.success) setAlerts(data.alerts);
      }

      if (performanceRes.ok) {
        const data = await performanceRes.json();
        if (data.success) setPerformance(data);
      }

      if (resourcesRes.ok) {
        const data = await resourcesRes.json();
        if (data.success) setResources(data);
      }

      if (databaseRes.ok) {
        const data = await databaseRes.json();
        if (data.success) setDatabaseMetrics(data);
      }

    } catch (error) {
      console.error('Error loading monitoring data:', error);
      showNotification('Failed to load monitoring data: ' + error.message, 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const updateMetricsFromStream = (newMetrics) => {
    console.log('🔄 Updating metrics from stream:', newMetrics);
    
    setSystemMetrics(prevMetrics => {
      const updated = { ...prevMetrics };
      
      // Initialize latest_metrics if it doesn't exist
      if (!updated.latest_metrics) {
        updated.latest_metrics = {};
      }
      
      newMetrics.forEach(metric => {
        // Initialize metric type array if it doesn't exist
        if (!updated.latest_metrics[metric.metric_type]) {
          updated.latest_metrics[metric.metric_type] = [];
        }
        
        // Find existing metric by name
        const existingIndex = updated.latest_metrics[metric.metric_type]
          .findIndex(m => m.metric_name === metric.metric_name);
        
        // Add timestamp and status indicators
        const enhancedMetric = {
          ...metric,
          timestamp: metric.created_at,
          is_warning: metric.metric_value >= (metric.threshold_warning || 0),
          is_critical: metric.metric_value >= (metric.threshold_critical || 0),
          updated_at: new Date().toISOString()
        };
        
        if (existingIndex >= 0) {
          // Update existing metric
          updated.latest_metrics[metric.metric_type][existingIndex] = enhancedMetric;
        } else {
          // Add new metric
          updated.latest_metrics[metric.metric_type].push(enhancedMetric);
        }
      });
      
      console.log('✅ Metrics updated successfully');
      return updated;
    });

    // Also update health status if we have health-related metrics
    const healthMetrics = newMetrics.filter(m => 
      m.metric_type === 'cpu' || m.metric_type === 'memory' || m.metric_type === 'disk'
    );
    
    if (healthMetrics.length > 0) {
      // Trigger a health status refresh
      setTimeout(() => {
        loadHealthStatus();
      }, 1000);
    }
  };

  const loadHealthStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8000/api/monitoring/health', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setHealthStatus(data);
        }
      }
    } catch (error) {
      console.error('Error loading health status:', error);
    }
  };

  const handleAcknowledgeAlert = async (alertId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8000/api/monitoring/alerts/${alertId}/acknowledge`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          acknowledged_by: 'System Administrator'
        })
      });

      if (response.ok) {
        setAlerts(prevAlerts => 
          prevAlerts.map(alert => 
            alert.id === alertId 
              ? { ...alert, status: 'acknowledged', acknowledged_by: 'System Administrator' }
              : alert
          )
        );
        showNotification('Alert acknowledged successfully', 'success');
      } else {
        throw new Error('Failed to acknowledge alert');
      }
    } catch (error) {
      showNotification('Failed to acknowledge alert: ' + error.message, 'error');
    }
  };

  const handleResolveAlert = async (alertId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8000/api/monitoring/alerts/${alertId}/resolve`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        setAlerts(prevAlerts => 
          prevAlerts.map(alert => 
            alert.id === alertId 
              ? { ...alert, status: 'resolved' }
              : alert
          )
        );
        showNotification('Alert resolved successfully', 'success');
      } else {
        throw new Error('Failed to resolve alert');
      }
    } catch (error) {
      showNotification('Failed to resolve alert: ' + error.message, 'error');
    }
  };

  const showNotification = (message, severity = 'info') => {
    setNotification({ open: true, message, severity });
  };

  const getStatusColor = (status) => {
    const colors = {
      healthy: 'success',
      normal: 'success',
      degraded: 'warning',
      warning: 'warning',
      unhealthy: 'error',
      critical: 'error'
    };
    return colors[status] || 'default';
  };

  const getStatusIcon = (status) => {
    const icons = {
      healthy: <CheckCircle />,
      normal: <CheckCircle />,
      degraded: <Warning />,
      warning: <Warning />,
      unhealthy: <Error />,
      critical: <Error />
    };
    return icons[status] || <Info />;
  };

  const getSeverityColor = (severity) => {
    const colors = {
      critical: 'error',
      high: 'warning',
      medium: 'info',
      low: 'default'
    };
    return colors[severity] || 'default';
  };

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatUptime = (seconds) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (days > 0) return `${days}d ${hours}h ${minutes}m`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const renderMetricCard = (title, value, unit, status, icon, threshold) => (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Avatar sx={{ bgcolor: `${getStatusColor(status)}.main`, mr: 2 }}>
            {icon}
          </Avatar>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" sx={{ fontSize: { xs: '1rem', md: '1.25rem' } }}>
              {title}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </Typography>
          </Box>
        </Box>
        
        <Typography variant="h4" sx={{ fontSize: { xs: '1.5rem', md: '2rem' }, mb: 1 }}>
          {typeof value === 'number' ? value.toFixed(1) : value}{unit}
        </Typography>
        
        {threshold && (
          <Box sx={{ mt: 2 }}>
            <LinearProgress
              variant="determinate"
              value={Math.min(100, (value / threshold) * 100)}
              color={getStatusColor(status)}
              sx={{ height: 8, borderRadius: 4 }}
            />
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
              Threshold: {threshold}{unit}
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );

  const renderSystemOverviewTab = () => (
    <Grid container spacing={3}>
      {/* System Health Overview */}
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6">System Health Overview</Typography>
              <Chip
                icon={getStatusIcon(healthStatus.overall_status)}
                label={`${healthStatus.overall_health_percentage || 0}% Healthy`}
                color={getStatusColor(healthStatus.overall_status)}
              />
            </Box>
            
            <Grid container spacing={2}>
              {healthStatus.services?.map((service) => (
                <Grid item xs={12} sm={6} md={3} key={service.service_name}>
                  <Paper sx={{ p: 2, textAlign: 'center' }}>
                    <Avatar sx={{ 
                      bgcolor: `${getStatusColor(service.status)}.main`, 
                      mx: 'auto', 
                      mb: 1 
                    }}>
                      {getStatusIcon(service.status)}
                    </Avatar>
                    <Typography variant="subtitle2" gutterBottom>
                      {service.service_name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {service.response_time}ms
                    </Typography>
                    <Typography variant="caption" display="block">
                      {service.uptime_percentage}% uptime
                    </Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>
      </Grid>

      {/* System Metrics */}
      {systemMetrics.latest_metrics && (
        <>
          {/* CPU Metrics */}
          {systemMetrics.latest_metrics.cpu && (
            <Grid item xs={12} sm={6} md={3}>
              {systemMetrics.latest_metrics.cpu.map((metric) => (
                <div key={metric.metric_name}>
                  {renderMetricCard(
                    'CPU Usage',
                    metric.metric_value,
                    '%',
                    metric.status,
                    <Speed />,
                    metric.threshold_warning
                  )}
                </div>
              ))}
            </Grid>
          )}

          {/* Memory Metrics */}
          {systemMetrics.latest_metrics.memory && (
            <Grid item xs={12} sm={6} md={3}>
              {systemMetrics.latest_metrics.memory
                .filter(m => m.metric_name === 'memory_usage_percent')
                .map((metric) => (
                <div key={metric.metric_name}>
                  {renderMetricCard(
                    'Memory Usage',
                    metric.metric_value,
                    '%',
                    metric.status,
                    <Memory />,
                    metric.threshold_warning
                  )}
                </div>
              ))}
            </Grid>
          )}

          {/* Disk Metrics */}
          {systemMetrics.latest_metrics.disk && (
            <Grid item xs={12} sm={6} md={3}>
              {systemMetrics.latest_metrics.disk.map((metric) => (
                <div key={metric.metric_name}>
                  {renderMetricCard(
                    'Disk Usage',
                    metric.metric_value,
                    '%',
                    metric.status,
                    <Storage />,
                    metric.threshold_warning
                  )}
                </div>
              ))}
            </Grid>
          )}

          {/* Network Metrics */}
          {systemMetrics.latest_metrics.network && (
            <Grid item xs={12} sm={6} md={3}>
              {systemMetrics.latest_metrics.network.map((metric) => (
                <div key={metric.metric_name}>
                  {renderMetricCard(
                    'Active Connections',
                    metric.metric_value,
                    '',
                    metric.status,
                    <NetworkCheck />,
                    metric.threshold_warning
                  )}
                </div>
              ))}
            </Grid>
          )}
        </>
      )}

      {/* System Information */}
      {resources.system_info && (
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                System Information
              </Typography>
              <List dense>
                <ListItem>
                  <ListItemIcon><Computer /></ListItemIcon>
                  <ListItemText
                    primary="Platform"
                    secondary={`${resources.system_info.platform} ${resources.system_info.architecture}`}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon><Memory /></ListItemIcon>
                  <ListItemText
                    primary="Total Memory"
                    secondary={formatBytes(resources.system_info.total_memory)}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon><Speed /></ListItemIcon>
                  <ListItemText
                    primary="CPU Cores"
                    secondary={`${resources.system_info.cpu_count} cores`}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon><Schedule /></ListItemIcon>
                  <ListItemText
                    primary="System Uptime"
                    secondary={formatUptime(resources.system_info.uptime)}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon><SystemUpdate /></ListItemIcon>
                  <ListItemText
                    primary="Node.js Version"
                    secondary={resources.system_info.node_version}
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>
      )}

      {/* Memory Usage Details */}
      {resources.memory_usage && (
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Memory Usage Details
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Used Memory</Typography>
                  <Typography variant="body2">
                    {resources.memory_usage.usage_percentage}%
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={parseFloat(resources.memory_usage.usage_percentage)}
                  color={parseFloat(resources.memory_usage.usage_percentage) > 80 ? 'warning' : 'primary'}
                  sx={{ height: 8, borderRadius: 4 }}
                />
              </Box>
              <List dense>
                <ListItem>
                  <ListItemText
                    primary="Total"
                    secondary={formatBytes(resources.memory_usage.total)}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Used"
                    secondary={formatBytes(resources.memory_usage.used)}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Free"
                    secondary={formatBytes(resources.memory_usage.free)}
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>
      )}
    </Grid>
  );

  const renderAlertsTab = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6">System Alerts</Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Chip
                  label={`${alerts.filter(a => a.status === 'active').length} Active`}
                  color="error"
                  size="small"
                />
                <Chip
                  label={`${alerts.filter(a => a.severity === 'critical').length} Critical`}
                  color="warning"
                  size="small"
                />
              </Box>
            </Box>

            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Severity</TableCell>
                    <TableCell>Title</TableCell>
                    <TableCell>Source</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Time</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {alerts.map((alert) => (
                    <TableRow key={alert.id}>
                      <TableCell>
                        <Chip
                          label={alert.severity.toUpperCase()}
                          color={getSeverityColor(alert.severity)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight="medium">
                          {alert.title}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {alert.description}
                        </Typography>
                      </TableCell>
                      <TableCell>{alert.source_service}</TableCell>
                      <TableCell>
                        <Chip
                          label={alert.status.toUpperCase()}
                          color={alert.status === 'active' ? 'error' : 'success'}
                          size="small"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {new Date(alert.created_at).toLocaleString()}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {alert.time_ago}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          {alert.status === 'active' && (
                            <Tooltip title="Acknowledge">
                              <IconButton
                                size="small"
                                onClick={() => handleAcknowledgeAlert(alert.id)}
                              >
                                <Check />
                              </IconButton>
                            </Tooltip>
                          )}
                          {alert.status !== 'resolved' && (
                            <Tooltip title="Resolve">
                              <IconButton
                                size="small"
                                onClick={() => handleResolveAlert(alert.id)}
                              >
                                <Close />
                              </IconButton>
                            </Tooltip>
                          )}
                          <Tooltip title="View Details">
                            <IconButton
                              size="small"
                              onClick={() => {
                                setSelectedAlert(alert);
                                setAlertDialog(true);
                              }}
                            >
                              <Visibility />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  const renderPerformanceTab = () => (
    <Grid container spacing={3}>
      {/* Performance Summary */}
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              API Performance Summary
            </Typography>
            {performance.summary && (
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={3}>
                  <Paper sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="h4" color="primary">
                      {performance.summary.total_requests}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Requests
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Paper sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="h4" color="success.main">
                      {performance.summary.avg_response_time}ms
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Avg Response Time
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Paper sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="h4" color="error.main">
                      {performance.summary.error_rate}%
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Error Rate
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Paper sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="h4" color="warning.main">
                      {performance.summary.total_errors}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Errors
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>
            )}
          </CardContent>
        </Card>
      </Grid>

      {/* Endpoint Performance */}
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Endpoint Performance
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Endpoint</TableCell>
                    <TableCell>Method</TableCell>
                    <TableCell>Requests</TableCell>
                    <TableCell>Avg Response Time</TableCell>
                    <TableCell>Error Rate</TableCell>
                    <TableCell>Success Rate</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {performance.performance_stats?.map((stat, index) => (
                    <TableRow key={index}>
                      <TableCell>{stat.endpoint}</TableCell>
                      <TableCell>
                        <Chip label={stat.method} size="small" />
                      </TableCell>
                      <TableCell>{stat.request_count}</TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Typography variant="body2">
                            {stat.avg_response_time.toFixed(0)}ms
                          </Typography>
                          {stat.avg_response_time > 1000 && (
                            <Warning color="warning" sx={{ ml: 1, fontSize: 16 }} />
                          )}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={`${stat.error_rate}%`}
                          color={parseFloat(stat.error_rate) > 5 ? 'error' : 'default'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={`${stat.success_rate}%`}
                          color={parseFloat(stat.success_rate) > 95 ? 'success' : 'warning'}
                          size="small"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  const renderResourcesTab = () => (
    <Grid container spacing={3}>
      {/* System Resources */}
      {resources.resources && Object.entries(resources.resources).map(([resourceType, resourceList]) => (
        <Grid item xs={12} md={6} key={resourceType}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ textTransform: 'capitalize' }}>
                {resourceType.replace('_', ' ')} Resources
              </Typography>
              <List>
                {resourceList.map((resource, index) => (
                  <ListItem key={index}>
                    <ListItemIcon>
                      {resourceType === 'process' && <Computer />}
                      {resourceType === 'connection' && <NetworkCheck />}
                      {resourceType === 'file_handle' && <Storage />}
                      {resourceType === 'thread' && <DeviceHub />}
                    </ListItemIcon>
                    <ListItemText
                      primary={resource.resource_name.replace('_', ' ').toUpperCase()}
                      secondary={
                        <Box>
                          <Typography variant="body2">
                            {resource.current_usage} / {resource.max_limit} ({resource.usage_percentage}%)
                          </Typography>
                          <LinearProgress
                            variant="determinate"
                            value={resource.usage_percentage}
                            color={resource.usage_percentage > 80 ? 'error' : 'primary'}
                            sx={{ mt: 1, height: 6, borderRadius: 3 }}
                          />
                        </Box>
                      }
                    />
                    <ListItemSecondaryAction>
                      <Chip
                        label={resource.status.toUpperCase()}
                        color={getStatusColor(resource.status)}
                        size="small"
                      />
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );

  const renderDatabaseTab = () => (
    <Grid container spacing={3}>
      {/* Database Summary */}
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Database Performance Summary
            </Typography>
            {databaseMetrics.summary && (
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={3}>
                  <Paper sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="h4" color="primary">
                      {databaseMetrics.summary.total_queries}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Queries
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Paper sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="h4" color="success.main">
                      {databaseMetrics.summary.avg_execution_time}ms
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Avg Execution Time
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Paper sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="h4" color="warning.main">
                      {databaseMetrics.summary.slow_query_percentage}%
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Slow Queries
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Paper sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="h4" color="error.main">
                      {databaseMetrics.summary.error_rate}%
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Error Rate
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>
            )}
          </CardContent>
        </Card>
      </Grid>

      {/* Database Details */}
      {databaseMetrics.databases?.map((database) => (
        <Grid item xs={12} key={database.database_name}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                {database.database_name}
              </Typography>
              
              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={12} sm={4}>
                  <Typography variant="body2" color="text.secondary">
                    Database Size: {formatBytes(database.total_size)}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Typography variant="body2" color="text.secondary">
                    Active Connections: {database.active_connections}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Typography variant="body2" color="text.secondary">
                    Total Connections: {database.total_connections}
                  </Typography>
                </Grid>
              </Grid>

              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Query Type</TableCell>
                      <TableCell>Count</TableCell>
                      <TableCell>Avg Time</TableCell>
                      <TableCell>Max Time</TableCell>
                      <TableCell>Slow Queries</TableCell>
                      <TableCell>Performance Score</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {database.query_types.map((queryType) => (
                      <TableRow key={queryType.query_type}>
                        <TableCell>
                          <Chip label={queryType.query_type} size="small" />
                        </TableCell>
                        <TableCell>{queryType.query_count}</TableCell>
                        <TableCell>{queryType.avg_execution_time.toFixed(2)}ms</TableCell>
                        <TableCell>{queryType.max_execution_time.toFixed(2)}ms</TableCell>
                        <TableCell>
                          <Chip
                            label={queryType.slow_queries}
                            color={queryType.slow_queries > 0 ? 'warning' : 'success'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Typography variant="body2" sx={{ mr: 1 }}>
                              {queryType.performance_score}/100
                            </Typography>
                            <LinearProgress
                              variant="determinate"
                              value={queryType.performance_score}
                              color={queryType.performance_score > 80 ? 'success' : 'warning'}
                              sx={{ width: 60, height: 6, borderRadius: 3 }}
                            />
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );  return (

    <Box sx={{ 
      width: '100%', 
      maxWidth: '100%', 
      minWidth: 0, 
      overflow: 'hidden',
      p: { xs: 1, sm: 2, md: 3 }
    }}>
      {/* Header */}
      <Box sx={{ 
        mb: 3, 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        flexDirection: { xs: 'column', sm: 'row' },
        gap: 2
      }}>
        <Box>
          <Typography 
            variant="h4" 
            sx={{ 
              fontWeight: 600, 
              color: blueCarbon.deepOcean,
              fontSize: { xs: '1.5rem', md: '2.125rem' },
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <Monitor sx={{ mr: 2, fontSize: { xs: '1.5rem', md: '2rem' } }} />
            System Monitoring
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Real-time system performance and health monitoring
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Timeframe</InputLabel>
            <Select
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value)}
              label="Timeframe"
            >
              <MenuItem value="5m">5 Minutes</MenuItem>
              <MenuItem value="15m">15 Minutes</MenuItem>
              <MenuItem value="1h">1 Hour</MenuItem>
              <MenuItem value="6h">6 Hours</MenuItem>
              <MenuItem value="24h">24 Hours</MenuItem>
            </Select>
          </FormControl>

          <FormControlLabel
            control={
              <Switch
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                size="small"
              />
            }
            label="Auto Refresh"
            sx={{ mr: 2 }}
          />
          
          <FormControlLabel
            control={
              <Switch
                checked={realTimeEnabled}
                onChange={(e) => setRealTimeEnabled(e.target.checked)}
                size="small"
              />
            }
            label={
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                Real-time
                {realTimeEnabled && (
                  <Box
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      bgcolor: 'success.main',
                      ml: 1,
                      animation: 'pulse 2s infinite'
                    }}
                  />
                )}
              </Box>
            }
            sx={{ mr: 2 }}
          />
          
          <Tooltip title="Refresh Data">
            <IconButton 
              onClick={() => loadAllData()} 
              disabled={refreshing}
              size={isMobile ? 'small' : 'medium'}
            >
              <Refresh />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* System Status Banner */}
      {healthStatus.overall_status && (
        <Alert 
          severity={getStatusColor(healthStatus.overall_status)} 
          sx={{ mb: 3 }}
          icon={getStatusIcon(healthStatus.overall_status)}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography>
              System Status: {healthStatus.overall_status.toUpperCase()} 
              ({healthStatus.overall_health_percentage}% healthy)
            </Typography>
            {alerts.filter(a => a.status === 'active').length > 0 && (
              <Badge 
                badgeContent={alerts.filter(a => a.status === 'active').length} 
                color="error"
              >
                <NotificationsActive />
              </Badge>
            )}
          </Box>
        </Alert>
      )}

      {/* Loading State */}
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {/* Tabs */}
      {!loading && (
        <>
          <Paper sx={{ mb: 3 }}>
            <Tabs
              value={activeTab}
              onChange={(e, newValue) => setActiveTab(newValue)}
              variant="scrollable"
              scrollButtons="auto"
            >
              <Tab label="System Overview" icon={<Monitor />} />
              <Tab 
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    Alerts
                    {alerts.filter(a => a.status === 'active').length > 0 && (
                      <Badge 
                        badgeContent={alerts.filter(a => a.status === 'active').length} 
                        color="error" 
                        sx={{ ml: 1 }}
                      >
                        <span />
                      </Badge>
                    )}
                  </Box>
                }
                icon={<Warning />} 
              />
              <Tab label="Performance" icon={<Assessment />} />
              <Tab label="Resources" icon={<Computer />} />
              <Tab label="Database" icon={<Storage />} />
            </Tabs>
          </Paper>

          {/* Tab Content */}
          {activeTab === 0 && renderSystemOverviewTab()}
          {activeTab === 1 && renderAlertsTab()}
          {activeTab === 2 && renderPerformanceTab()}
          {activeTab === 3 && renderResourcesTab()}
          {activeTab === 4 && renderDatabaseTab()}
        </>
      )}

      {/* Alert Detail Dialog */}
      <Dialog
        open={alertDialog}
        onClose={() => setAlertDialog(false)}
        maxWidth="md"
        fullWidth
        fullScreen={isMobile}
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">Alert Details</Typography>
            <IconButton onClick={() => setAlertDialog(false)}>
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedAlert && (
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" gutterBottom>Basic Information</Typography>
                <List dense>
                  <ListItem>
                    <ListItemText
                      primary="Alert Type"
                      secondary={selectedAlert.alert_type}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="Severity"
                      secondary={
                        <Chip
                          label={selectedAlert.severity.toUpperCase()}
                          color={getSeverityColor(selectedAlert.severity)}
                          size="small"
                        />
                      }
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="Source Service"
                      secondary={selectedAlert.source_service}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="Status"
                      secondary={
                        <Chip
                          label={selectedAlert.status.toUpperCase()}
                          color={selectedAlert.status === 'active' ? 'error' : 'success'}
                          size="small"
                        />
                      }
                    />
                  </ListItem>
                </List>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" gutterBottom>Metric Information</Typography>
                <List dense>
                  <ListItem>
                    <ListItemText
                      primary="Metric Name"
                      secondary={selectedAlert.metric_name || 'N/A'}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="Current Value"
                      secondary={selectedAlert.metric_value || 'N/A'}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="Threshold"
                      secondary={selectedAlert.threshold_value || 'N/A'}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="Created"
                      secondary={new Date(selectedAlert.created_at).toLocaleString()}
                    />
                  </ListItem>
                </List>
              </Grid>

              <Grid item xs={12}>
                <Typography variant="subtitle2" gutterBottom>Description</Typography>
                <Typography variant="body2" sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                  {selectedAlert.description}
                </Typography>
              </Grid>

              {selectedAlert.acknowledged_by && (
                <Grid item xs={12}>
                  <Typography variant="subtitle2" gutterBottom>Acknowledgment</Typography>
                  <Typography variant="body2">
                    Acknowledged by {selectedAlert.acknowledged_by} on{' '}
                    {new Date(selectedAlert.acknowledged_at).toLocaleString()}
                  </Typography>
                </Grid>
              )}
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          {selectedAlert?.status === 'active' && (
            <Button
              onClick={() => {
                handleAcknowledgeAlert(selectedAlert.id);
                setAlertDialog(false);
              }}
              color="primary"
            >
              Acknowledge
            </Button>
          )}
          {selectedAlert?.status !== 'resolved' && (
            <Button
              onClick={() => {
                handleResolveAlert(selectedAlert.id);
                setAlertDialog(false);
              }}
              color="success"
            >
              Resolve
            </Button>
          )}
          <Button onClick={() => setAlertDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Notification Snackbar */}
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={() => setNotification({ ...notification, open: false })}
      >
        <Alert
          onClose={() => setNotification({ ...notification, open: false })}
          severity={notification.severity}
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default SystemMonitoring;