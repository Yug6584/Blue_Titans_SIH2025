import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  LinearProgress,
  Alert,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  TextField,
  Switch,
  FormControlLabel,
  Divider,
} from '@mui/material';
import {
  Speed,
  Memory,
  Storage,
  Timer,
  TrendingUp,
  Computer,
  CloudQueue,
  Refresh,
  Settings,
  Warning,
  CheckCircle,
  Error,
} from '@mui/icons-material';
import { blueCarbon } from '../../../theme/colors';
import api from '../../../utils/api';

const SystemPerformance = ({ onNotification, loading }) => {
  const [performanceData, setPerformanceData] = useState({
    totalActions: 0,
    actions24h: 0,
    actions7d: 0,
    uptime: 0,
    memoryUsage: { used: 0, total: 0 }
  });
  const [systemInfo, setSystemInfo] = useState({
    version: '1.0.0',
    environment: 'development',
    nodeVersion: '',
    platform: '',
    lastRestart: ''
  });
  const [settings, setSettings] = useState({
    apiRateLimit: 1000,
    cacheEnabled: true,
    logRetention: 30,
    backupInterval: 'daily'
  });
  const [isLoading, setIsLoading] = useState(false);
  const [healthStatus, setHealthStatus] = useState('healthy');

  useEffect(() => {
    loadPerformanceData();
    loadSystemHealth();
    
    // Set up periodic refresh
    const interval = setInterval(() => {
      loadPerformanceData();
      loadSystemHealth();
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const loadPerformanceData = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/system-settings/stats');
      
      if (response.data.success) {
        setPerformanceData(response.data.data.performance);
        setSystemInfo(response.data.data.system);
      }
    } catch (error) {
      console.error('Error loading performance data:', error);
      onNotification('Error loading performance data', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const loadSystemHealth = async () => {
    try {
      const response = await api.get('/system-settings/health');
      
      if (response.data.success) {
        setHealthStatus(response.data.health.status);
      }
    } catch (error) {
      console.error('Error loading system health:', error);
      setHealthStatus('unhealthy');
    }
  };

  const handleSettingChange = async (key, value) => {
    try {
      const updatedSettings = { ...settings, [key]: value };
      setSettings(updatedSettings);
      
      await api.put('/system-settings/settings', {
        category: 'performance',
        settings: updatedSettings
      });
      
      onNotification('Performance setting updated successfully', 'success');
    } catch (error) {
      console.error('Error updating setting:', error);
      onNotification('Failed to update performance setting', 'error');
    }
  };

  const formatUptime = (seconds) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (days > 0) return `${days}d ${hours}h ${minutes}m`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const formatMemory = (bytes) => {
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(1)} MB`;
  };

  const getMemoryUsagePercentage = () => {
    if (!performanceData.memoryUsage || !performanceData.memoryUsage.heapTotal) return 0;
    return Math.round((performanceData.memoryUsage.heapUsed / performanceData.memoryUsage.heapTotal) * 100);
  };

  const getHealthColor = (status) => {
    switch (status) {
      case 'healthy': return '#4caf50';
      case 'warning': return '#ff9800';
      case 'unhealthy': return '#f44336';
      default: return '#9e9e9e';
    }
  };

  const getHealthIcon = (status) => {
    switch (status) {
      case 'healthy': return <CheckCircle />;
      case 'warning': return <Warning />;
      case 'unhealthy': return <Error />;
      default: return <Computer />;
    }
  };

  const memoryPercentage = getMemoryUsagePercentage();

  return (
    <Box sx={{ 
      width: '100%', 
      maxWidth: '100%', 
      minWidth: 0, 
      overflow: 'hidden',
      p: { xs: 0, sm: 1 }
    }}>
      {/* Header */}
      <Box sx={{ mb: { xs: 2, md: 3 }, px: { xs: 1, sm: 0 } }}>
        <Typography 
          variant="h5" 
          sx={{ 
            fontWeight: 600, 
            color: blueCarbon.deepOcean, 
            mb: 1,
            fontSize: { xs: '1.25rem', md: '1.5rem' },
            wordBreak: 'break-word'
          }}
        >
          System Performance
        </Typography>
        <Typography 
          variant="body1" 
          color="text.secondary"
          sx={{ 
            fontSize: { xs: '0.9rem', md: '1rem' },
            wordBreak: 'break-word'
          }}
        >
          Monitor system metrics and configure performance settings
        </Typography>
      </Box>

      {isLoading && <LinearProgress sx={{ mb: 3 }} />}

      {/* System Health Overview */}
      <Grid container spacing={{ xs: 2, md: 3 }} sx={{ mb: { xs: 2, md: 3 }, mx: { xs: 0.5, sm: 0 } }}>
        {/* System Health */}
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            background: `linear-gradient(135deg, ${getHealthColor(healthStatus)}15 0%, ${getHealthColor(healthStatus)}25 100%)`,
            border: `1px solid ${getHealthColor(healthStatus)}30`
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: getHealthColor(healthStatus), mr: 2 }}>
                  {getHealthIcon(healthStatus)}
                </Avatar>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    System Health
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Overall status
                  </Typography>
                </Box>
              </Box>
              <Chip 
                label={healthStatus.charAt(0).toUpperCase() + healthStatus.slice(1)} 
                sx={{ 
                  bgcolor: `${getHealthColor(healthStatus)}20`, 
                  color: getHealthColor(healthStatus),
                  fontWeight: 600
                }}
              />
            </CardContent>
          </Card>
        </Grid>

        {/* Uptime */}
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: blueCarbon.oceanBlue, mr: 2 }}>
                  <Timer />
                </Avatar>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Uptime
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    System running time
                  </Typography>
                </Box>
              </Box>
              <Typography variant="h5" sx={{ fontWeight: 700, color: blueCarbon.oceanBlue }}>
                {formatUptime(performanceData.uptime)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Memory Usage */}
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: '#ff9800', mr: 2 }}>
                  <Memory />
                </Avatar>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Memory Usage
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Heap memory
                  </Typography>
                </Box>
              </Box>
              <Typography variant="h5" sx={{ fontWeight: 700, color: '#ff9800', mb: 1 }}>
                {memoryPercentage}%
              </Typography>
              <LinearProgress
                variant="determinate"
                value={memoryPercentage}
                sx={{
                  height: 8,
                  borderRadius: 4,
                  bgcolor: 'grey.200',
                  '& .MuiLinearProgress-bar': {
                    bgcolor: memoryPercentage > 80 ? '#f44336' : '#ff9800',
                    borderRadius: 4
                  }
                }}
              />
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                {performanceData.memoryUsage?.heapUsed ? formatMemory(performanceData.memoryUsage.heapUsed) : '0 MB'} used
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* API Activity */}
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: '#4caf50', mr: 2 }}>
                  <TrendingUp />
                </Avatar>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    API Activity
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total requests
                  </Typography>
                </Box>
              </Box>
              <Typography variant="h5" sx={{ fontWeight: 700, color: '#4caf50', mb: 1 }}>
                {performanceData.totalActions}
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Chip 
                  label={`${performanceData.actions24h} today`} 
                  size="small" 
                  sx={{ bgcolor: '#4caf5020', color: '#4caf50' }}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Performance Settings */}
      <Grid container spacing={{ xs: 2, md: 3 }}>
        {/* API Configuration */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, display: 'flex', alignItems: 'center' }}>
                <Speed sx={{ mr: 1 }} />
                API Configuration
              </Typography>

              <List>
                <ListItem>
                  <ListItemIcon>
                    <Speed />
                  </ListItemIcon>
                  <ListItemText
                    primary="API Rate Limit"
                    secondary="Requests per hour per IP"
                  />
                  <ListItemSecondaryAction>
                    <TextField
                      size="small"
                      type="number"
                      value={settings.apiRateLimit}
                      onChange={(e) => handleSettingChange('apiRateLimit', parseInt(e.target.value))}
                      sx={{ width: { xs: 80, md: 100 } }}
                      inputProps={{ min: 100, max: 10000 }}
                    />
                  </ListItemSecondaryAction>
                </ListItem>
                <Divider />

                <ListItem>
                  <ListItemIcon>
                    <CloudQueue />
                  </ListItemIcon>
                  <ListItemText
                    primary="Enable Caching"
                    secondary="Cache API responses for better performance"
                  />
                  <ListItemSecondaryAction>
                    <Switch
                      checked={settings.cacheEnabled}
                      onChange={(e) => handleSettingChange('cacheEnabled', e.target.checked)}
                      color="primary"
                    />
                  </ListItemSecondaryAction>
                </ListItem>
                <Divider />

                <ListItem>
                  <ListItemIcon>
                    <Storage />
                  </ListItemIcon>
                  <ListItemText
                    primary="Log Retention"
                    secondary="Days to keep system logs"
                  />
                  <ListItemSecondaryAction>
                    <TextField
                      size="small"
                      type="number"
                      value={settings.logRetention}
                      onChange={(e) => handleSettingChange('logRetention', parseInt(e.target.value))}
                      sx={{ width: { xs: 60, md: 80 } }}
                      inputProps={{ min: 7, max: 365 }}
                    />
                  </ListItemSecondaryAction>
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* System Information */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, display: 'flex', alignItems: 'center' }}>
                  <Computer sx={{ mr: 1 }} />
                  System Information
                </Typography>
                <Button
                  size="small"
                  startIcon={<Refresh />}
                  onClick={loadPerformanceData}
                  disabled={isLoading}
                >
                  Refresh
                </Button>
              </Box>

              <List>
                <ListItem>
                  <ListItemText
                    primary="Application Version"
                    secondary={systemInfo.version}
                  />
                </ListItem>
                <Divider />

                <ListItem>
                  <ListItemText
                    primary="Environment"
                    secondary={systemInfo.environment}
                  />
                </ListItem>
                <Divider />

                <ListItem>
                  <ListItemText
                    primary="Node.js Version"
                    secondary={systemInfo.nodeVersion}
                  />
                </ListItem>
                <Divider />

                <ListItem>
                  <ListItemText
                    primary="Platform"
                    secondary={systemInfo.platform}
                  />
                </ListItem>
                <Divider />

                <ListItem>
                  <ListItemText
                    primary="Last Restart"
                    secondary={systemInfo.lastRestart ? new Date(systemInfo.lastRestart).toLocaleString() : 'Unknown'}
                  />
                </ListItem>
              </List>

              {/* Performance Alerts */}
              <Box sx={{ mt: 3 }}>
                {memoryPercentage > 80 && (
                  <Alert severity="warning" sx={{ mb: 2 }}>
                    High memory usage detected. Consider restarting the system.
                  </Alert>
                )}
                
                {performanceData.actions24h > 1000 && (
                  <Alert severity="info" sx={{ mb: 2 }}>
                    High API activity today. Monitor system performance.
                  </Alert>
                )}
                
                {healthStatus === 'healthy' && memoryPercentage < 70 && (
                  <Alert severity="success">
                    System is running optimally with good performance metrics.
                  </Alert>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default SystemPerformance;