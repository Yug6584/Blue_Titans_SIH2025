import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  LinearProgress,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Tooltip,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemIcon
} from '@mui/material';
import {
  SupervisorAccount,
  Storage,
  Security,
  Speed,
  Warning,
  CheckCircle,
  Error,
  Info,
  TrendingUp,
  Computer,
  CloudQueue,
  Timeline
} from '@mui/icons-material';
import { Line, Doughnut, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip as ChartTooltip,
  Legend,
  ArcElement
} from 'chart.js';
import CardStats from '../../components/CardStats';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  ChartTooltip,
  Legend,
  ArcElement
);

const AdminDashboard = () => {
  const [systemAlerts, setSystemAlerts] = useState([]);
  const [systemStats, setSystemStats] = useState(null);
  const [performanceData, setPerformanceData] = useState(null);
  const [loading, setLoading] = useState(true);
  const lineChartRef = useRef(null);
  const doughnutChartRef = useRef(null);

  useEffect(() => {
    loadDashboardData();
    
    // Cleanup function to destroy charts
    return () => {
      if (lineChartRef.current) {
        lineChartRef.current.destroy();
      }
      if (doughnutChartRef.current) {
        doughnutChartRef.current.destroy();
      }
    };
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // Import the system API
      const { systemAPI } = await import('../../utils/api');
      
      // Load all system data
      const [statsResponse, performanceResponse, alertsResponse] = await Promise.all([
        systemAPI.getSystemStats(),
        systemAPI.getPerformanceData(),
        systemAPI.getSystemAlerts()
      ]);
      
      if (statsResponse.data.success) {
        setSystemStats(statsResponse.data.data);
      }
      
      if (performanceResponse.data.success) {
        setPerformanceData(performanceResponse.data.data);
      }
      
      if (alertsResponse.data.success) {
        setSystemAlerts(alertsResponse.data.data.alerts);
      }
      
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Generate user distribution data from real stats
  const getUserActivityData = () => {
    if (!systemStats) return null;
    
    return {
      labels: ['Company Users', 'Government Users', 'Admin Users'],
      datasets: [
        {
          data: [
            systemStats.users.company,
            systemStats.users.government,
            systemStats.users.admin
          ],
          backgroundColor: [
            '#4CAF50',
            '#2196F3',
            '#FF9800'
          ]
        }
      ]
    };
  };

  const getAlertIcon = (type) => {
    switch (type) {
      case 'error': return <Error color="error" />;
      case 'warning': return <Warning color="warning" />;
      case 'info': return <Info color="info" />;
      case 'success': return <CheckCircle color="success" />;
      default: return <Info />;
    }
  };

  const getAlertColor = (type) => {
    switch (type) {
      case 'error': return 'error';
      case 'warning': return 'warning';
      case 'info': return 'info';
      case 'success': return 'success';
      default: return 'default';
    }
  };

  if (loading) {
    return (
      <Box sx={{ width: '100%', mt: 2 }}>
        <LinearProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ mb: 3, fontWeight: 'bold' }}>
        System Administration Dashboard
      </Typography>

      {/* Critical Alerts */}
      {systemAlerts.filter(alert => alert.severity === 'Critical').length > 0 && (
        <Alert severity="error" sx={{ mb: 3 }}>
          <strong>Critical:</strong> {systemAlerts.find(alert => alert.severity === 'Critical')?.message}
        </Alert>
      )}
      
      {systemAlerts.filter(alert => alert.severity === 'High').length > 0 && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          <strong>Warning:</strong> {systemAlerts.filter(alert => alert.severity === 'High').length} high priority alerts require attention.
        </Alert>
      )}

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <CardStats
            title="Total Users"
            value={systemStats ? systemStats.users.total.toString() : "0"}
            icon={<SupervisorAccount />}
            trend={systemStats ? `${systemStats.users.active} active` : "Loading..."}
            color="primary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <CardStats
            title="System Uptime"
            value={systemStats ? `${systemStats.system.uptime.percentage}%` : "0%"}
            icon={<Speed />}
            trend={systemStats ? `${systemStats.system.uptime.days} days` : "Loading..."}
            color="success"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <CardStats
            title="Storage Used"
            value={systemStats ? `${systemStats.system.storage.databaseSizeMB} MB` : "0 MB"}
            icon={<Storage />}
            trend={systemStats ? `Memory: ${systemStats.system.memory.usagePercent}%` : "Loading..."}
            color="warning"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <CardStats
            title="Security Score"
            value={systemStats ? `${systemStats.security.score}/100` : "0/100"}
            icon={<Security />}
            trend={systemStats ? (systemStats.security.score > 90 ? "Excellent" : "Good") : "Loading..."}
            color="info"
          />
        </Grid>
      </Grid>

      {/* Charts */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                System Performance (24h)
              </Typography>
              <Box sx={{ height: 300 }}>
                {performanceData ? (
                  <Line 
                    key="performance-chart"
                    ref={lineChartRef}
                    data={performanceData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: 'top',
                        },
                      },
                      scales: {
                        y: {
                          beginAtZero: true,
                          max: 100,
                          title: {
                            display: true,
                            text: 'Usage (%)'
                          }
                        }
                      }
                    }}
                  />
                ) : (
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                    <LinearProgress sx={{ width: '50%' }} />
                  </Box>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                User Distribution
              </Typography>
              <Box sx={{ height: 300 }}>
                {getUserActivityData() ? (
                  <Doughnut 
                    key="user-distribution-chart"
                    ref={doughnutChartRef}
                    data={getUserActivityData()}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: 'bottom',
                        },
                      },
                    }}
                  />
                ) : (
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                    <LinearProgress sx={{ width: '50%' }} />
                  </Box>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                System Information
              </Typography>
              {systemStats ? (
                <Box>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    <strong>CPU Cores:</strong> {systemStats.system.cpu.count}
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    <strong>Memory Usage:</strong> {systemStats.system.memory.usagePercent}%
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    <strong>Database Size:</strong> {systemStats.system.storage.databaseSizeMB} MB
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    <strong>Uptime:</strong> {systemStats.system.uptime.days} days, {systemStats.system.uptime.hours % 24} hours
                  </Typography>
                  <Typography variant="body2">
                    <strong>Last Updated:</strong> {new Date(systemStats.lastUpdated).toLocaleString()}
                  </Typography>
                </Box>
              ) : (
                <LinearProgress />
              )}
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
                System Status
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Card variant="outlined" sx={{ textAlign: 'center', p: 2 }}>
                    <Computer sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
                    <Typography variant="h6">Web Server</Typography>
                    <Chip label="Online" color="success" size="small" />
                  </Card>
                </Grid>
                <Grid item xs={6}>
                  <Card variant="outlined" sx={{ textAlign: 'center', p: 2 }}>
                    <Storage sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
                    <Typography variant="h6">Database</Typography>
                    <Chip label="Online" color="success" size="small" />
                  </Card>
                </Grid>
                <Grid item xs={6}>
                  <Card variant="outlined" sx={{ textAlign: 'center', p: 2 }}>
                    <CloudQueue sx={{ fontSize: 40, color: 'warning.main', mb: 1 }} />
                    <Typography variant="h6">Blockchain</Typography>
                    <Chip label="Syncing" color="warning" size="small" />
                  </Card>
                </Grid>
                <Grid item xs={6}>
                  <Card variant="outlined" sx={{ textAlign: 'center', p: 2 }}>
                    <Security sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
                    <Typography variant="h6">Security</Typography>
                    <Chip label="Active" color="success" size="small" />
                  </Card>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* System Alerts and Recent Activity */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                System Alerts
              </Typography>
              <List>
                {systemAlerts.map((alert) => (
                  <ListItem key={alert.id} divider>
                    <ListItemIcon>
                      {getAlertIcon(alert.type)}
                    </ListItemIcon>
                    <ListItemText
                      primary={alert.message}
                      secondary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                          <Typography variant="caption">
                            {alert.timestamp}
                          </Typography>
                          <Chip 
                            label={alert.severity}
                            color={alert.severity === 'High' ? 'error' : 'warning'}
                            size="small"
                          />
                        </Box>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Quick Actions
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Button
                    variant="contained"
                    fullWidth
                    startIcon={<SupervisorAccount />}
                    sx={{ mb: 1 }}
                  >
                    User Management
                  </Button>
                </Grid>
                <Grid item xs={12}>
                  <Button
                    variant="contained"
                    fullWidth
                    startIcon={<Storage />}
                    sx={{ mb: 1 }}
                  >
                    Database Backup
                  </Button>
                </Grid>
                <Grid item xs={12}>
                  <Button
                    variant="outlined"
                    fullWidth
                    startIcon={<Security />}
                    sx={{ mb: 1 }}
                  >
                    Security Audit
                  </Button>
                </Grid>
                <Grid item xs={12}>
                  <Button
                    variant="outlined"
                    fullWidth
                    startIcon={<Timeline />}
                    sx={{ mb: 1 }}
                  >
                    System Logs
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AdminDashboard;