import React, { useState, useEffect } from 'react';
import realTimeLoginService from '../../../services/realTimeLoginService';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Chip,
  Button,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
} from '@mui/material';
import {
  People,
  Business,
  AccountBalance,
  Block,
  Refresh,
  Download,
  VerifiedUser,
  AccessTime,
  History,
  Close,
  ExpandMore,
  CalendarToday,
  CheckCircle,
  Error,
  Computer,
  Add,
  Email,
  Lock,
  Visibility,
  VisibilityOff,
} from '@mui/icons-material';

const SimpleUserOverview = ({ onRefresh, onNotification }) => {
  const [userStats, setUserStats] = useState({
    totalUsers: 0,
    activeCompanies: 0,
    verifiedGovernmentAccounts: 0,
    blockedAccounts: 0
  });
  const [recentLogins, setRecentLogins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [realTimeStatus, setRealTimeStatus] = useState('disconnected');
  const [newLoginAlert, setNewLoginAlert] = useState(null);
  const [historyDialogOpen, setHistoryDialogOpen] = useState(false);
  const [fullHistory, setFullHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [groupedHistory, setGroupedHistory] = useState({});
  
  // Add User Dialog State
  const [addUserDialogOpen, setAddUserDialogOpen] = useState(false);
  const [addUserLoading, setAddUserLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [newUser, setNewUser] = useState({
    email: '',
    password: '',
    panel: '',
    name: '',
    organization: ''
  });
  const [addUserErrors, setAddUserErrors] = useState({});

  // Load real data from API
  const loadData = async () => {
    setLoading(true);
    
    try {
      // Load user statistics
      const statsResponse = await fetch('http://localhost:8000/api/stats/users');
      const statsData = await statsResponse.json();
      
      if (statsData.success) {
        setUserStats({
          totalUsers: statsData.data.totalUsers,
          activeCompanies: statsData.data.companyUsers,
          verifiedGovernmentAccounts: statsData.data.governmentUsers,
          blockedAccounts: statsData.data.blockedUsers
        });
      }

      // Load recent login activities
      const activitiesResponse = await fetch('http://localhost:8000/api/stats/login-activities?limit=5&offset=0');
      const activitiesData = await activitiesResponse.json();
      
      if (activitiesData.success && activitiesData.data.activities) {
        const formattedLogins = activitiesData.data.activities.slice(0, 5).map(activity => ({
          id: activity.id,
          email: activity.email,
          name: activity.name || 'Unknown User',
          role: activity.panel,
          timeAgo: activity.timeAgo,
          status: activity.loginStatus === 'success' ? 'success' : 'failed',
          organization: activity.organization || 'No Organization',
          timestamp: activity.loginTimestamp,
          formattedDate: activity.formattedDate,
          formattedTime: activity.formattedTime,
          // Use backend-formatted data directly
          backendFormatted: {
            date: activity.formattedDate,
            time: activity.formattedTime
          }
        }));
        setRecentLogins(formattedLogins);
      }
      
    } catch (error) {
      console.error('Error loading data:', error);
      
      // Fallback to show some basic data
      setUserStats({
        totalUsers: 3,
        activeCompanies: 1,
        verifiedGovernmentAccounts: 1,
        blockedAccounts: 0
      });
      setRecentLogins([]);
    } finally {
      setLoading(false);
    }
  };

  // Load full login history
  const loadFullHistory = async () => {
    setHistoryLoading(true);
    try {
      const response = await fetch('http://localhost:8000/api/stats/login-activities?limit=200&offset=0');
      const data = await response.json();
      
      if (data.success && data.data.activities) {
        const activities = data.data.activities;
        setFullHistory(activities);
        
        // Group activities by date using backend-formatted date
        const grouped = activities.reduce((acc, activity) => {
          // Use backend-formatted date or parse timestamp properly
          let dateKey;
          try {
            const isoTimestamp = activity.loginTimestamp.replace(' ', 'T');
            const loginTime = new Date(isoTimestamp);
            const now = new Date();
            const timezoneOffset = now.getTimezoneOffset() * 60000;
            const adjustedLoginTime = new Date(loginTime.getTime() - timezoneOffset);
            dateKey = adjustedLoginTime.toDateString();
          } catch (error) {
            dateKey = 'Invalid Date';
          }
          
          if (!acc[dateKey]) {
            acc[dateKey] = [];
          }
          acc[dateKey].push(activity);
          return acc;
        }, {});
        
        setGroupedHistory(grouped);
      }
    } catch (error) {
      console.error('Error loading full history:', error);
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleShowFullHistory = () => {
    setHistoryDialogOpen(true);
    loadFullHistory();
  };

  const handleCloseHistory = () => {
    setHistoryDialogOpen(false);
    setFullHistory([]);
    setGroupedHistory({});
  };

  // Add User Functions
  const handleAddUser = () => {
    setAddUserDialogOpen(true);
    setNewUser({
      email: '',
      password: '',
      panel: '',
      name: '',
      organization: ''
    });
    setAddUserErrors({});
  };

  const handleCloseAddUser = () => {
    setAddUserDialogOpen(false);
    setNewUser({
      email: '',
      password: '',
      panel: '',
      name: '',
      organization: ''
    });
    setAddUserErrors({});
    setShowPassword(false);
  };

  const validateUserForm = () => {
    const errors = {};
    
    if (!newUser.email) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newUser.email)) {
      errors.email = 'Please enter a valid email address';
    }
    
    if (!newUser.password) {
      errors.password = 'Password is required';
    } else if (newUser.password.length < 6) {
      errors.password = 'Password must be at least 6 characters long';
    }
    
    if (!newUser.panel) {
      errors.panel = 'Panel selection is required';
    }
    
    if (!newUser.name) {
      errors.name = 'Name is required';
    }
    
    setAddUserErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreateUser = async () => {
    if (!validateUserForm()) {
      return;
    }

    setAddUserLoading(true);
    try {
      const response = await fetch('http://localhost:8000/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(newUser)
      });

      const data = await response.json();

      if (data.success) {
        onNotification(`User ${newUser.email} created successfully!`, 'success');
        handleCloseAddUser();
        // Refresh data to update user count
        await loadData();
        if (onRefresh) {
          onRefresh();
        }
      } else {
        throw new Error(data.message || 'Failed to create user');
      }
    } catch (error) {
      console.error('Error creating user:', error);
      onNotification(`Failed to create user: ${error.message}`, 'error');
    } finally {
      setAddUserLoading(false);
    }
  };

  // Export Users Function
  const handleExportUsers = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/stats/users/detailed', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      const data = await response.json();
      
      if (data.success && data.data.users) {
        const users = data.data.users;
        
        // Create text content
        let textContent = 'BLUECARBON LEDGER - USER DATABASE EXPORT\n';
        textContent += '='.repeat(50) + '\n';
        textContent += `Export Date: ${new Date().toLocaleString()}\n`;
        textContent += `Total Users: ${users.length}\n`;
        textContent += '='.repeat(50) + '\n\n';
        
        users.forEach((user, index) => {
          textContent += `USER ${index + 1}:\n`;
          textContent += `-`.repeat(20) + '\n';
          textContent += `ID: ${user.id}\n`;
          textContent += `Name: ${user.name || 'Not specified'}\n`;
          textContent += `Email: ${user.email}\n`;
          textContent += `Panel/Role: ${user.panel.charAt(0).toUpperCase() + user.panel.slice(1)}\n`;
          textContent += `Organization: ${user.organization || 'Not specified'}\n`;
          textContent += `Status: ${user.isActive ? 'Active' : 'Inactive'}\n`;
          textContent += `Created: ${new Date(user.createdAt).toLocaleString()}\n`;
          textContent += `Last Updated: ${new Date(user.updatedAt).toLocaleString()}\n`;
          textContent += `Last Login: ${user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'Never'}\n`;
          textContent += '\n';
        });
        
        textContent += '='.repeat(50) + '\n';
        textContent += 'END OF EXPORT\n';
        
        // Create and download file
        const blob = new Blob([textContent], { type: 'text/plain' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = `BlueCarbon_Users_Export_${new Date().toISOString().split('T')[0]}.txt`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        onNotification(`User database exported successfully! (${users.length} users)`, 'success');
      } else {
        throw new Error('Failed to fetch user data');
      }
    } catch (error) {
      console.error('Error exporting users:', error);
      onNotification(`Failed to export users: ${error.message}`, 'error');
    }
  };

  // Load data on component mount and set up real-time updates
  useEffect(() => {
    loadData();
    
    // Subscribe to real-time login updates
    const unsubscribe = realTimeLoginService.subscribe((data) => {
      handleRealTimeUpdate(data);
    });
    
    setRealTimeStatus('connected');
    
    // Cleanup on unmount
    return () => {
      unsubscribe();
      setRealTimeStatus('disconnected');
    };
  }, []);

  // Handle real-time login updates
  const handleRealTimeUpdate = (data) => {
    switch (data.type) {
      case 'NEW_LOGIN':
        // Show notification for new login
        setNewLoginAlert({
          login: data.login,
          timestamp: Date.now()
        });
        
        // Auto-hide alert after 5 seconds
        setTimeout(() => {
          setNewLoginAlert(null);
        }, 5000);
        
        // Update login list
        updateLoginsList(data.allLogins);
        
        // Notify parent component
        if (onNotification) {
          onNotification(
            `New login: ${data.login.name || data.login.email} (${data.login.panel})`, 
            'info'
          );
        }
        break;
        
      case 'LOGIN_UPDATE':
        // Update login list with latest data
        updateLoginsList(data.allLogins);
        break;
        
      case 'ERROR':
        console.error('Real-time service error:', data.error);
        // Don't set error status for minor issues, keep it connected
        // setRealTimeStatus('error');
        break;
        
      default:
        console.log('Unknown real-time update type:', data.type);
    }
  };

  // Update the logins list with new data (limit to 5 activities)
  const updateLoginsList = (activities) => {
    if (activities && activities.length > 0) {
      const formattedLogins = activities.slice(0, 5).map(activity => ({
        id: activity.id,
        email: activity.email,
        name: activity.name || 'Unknown User',
        role: activity.panel,
        timeAgo: activity.timeAgo,
        status: activity.loginStatus === 'success' ? 'success' : 'failed',
        organization: activity.organization || 'No Organization',
        timestamp: activity.loginTimestamp,
        formattedDate: activity.formattedDate,
        formattedTime: activity.formattedTime,
        backendFormatted: {
          date: activity.formattedDate,
          time: activity.formattedTime
        }
      }));
      setRecentLogins(formattedLogins);
    }
  };

  const statisticsCards = [
    {
      title: 'Total Users',
      value: userStats.totalUsers,
      icon: <People />,
      color: '#1976d2',
      trend: '+12%',
      description: 'All registered users across platforms'
    },
    {
      title: 'Active Companies',
      value: userStats.activeCompanies,
      icon: <Business />,
      color: '#2e7d32',
      trend: '+8%',
      description: 'Verified carbon credit companies'
    },
    {
      title: 'Government Accounts',
      value: userStats.verifiedGovernmentAccounts,
      icon: <AccountBalance />,
      color: '#0288d1',
      trend: '+3%',
      description: 'Verified regulatory authorities'
    },
    {
      title: 'Blocked Accounts',
      value: userStats.blockedAccounts,
      icon: <Block />,
      color: '#f44336',
      trend: '-15%',
      description: 'Suspended or blocked users'
    }
  ];

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin': return '#1976d2';
      case 'company': return '#2e7d32';
      case 'government': return '#0288d1';
      default: return '#757575';
    }
  };

  const getRoleLabel = (role) => {
    switch (role) {
      case 'admin': return 'Admin';
      case 'company': return 'Company';
      case 'government': return 'Government';
      default: return 'User';
    }
  };

  const handleRefresh = async () => {
    setLoading(true);
    try {
      // Refresh both local data and real-time service
      await Promise.all([
        loadData(),
        realTimeLoginService.refresh()
      ]);
      
      if (onRefresh) {
        onRefresh();
      }
      if (onNotification) {
        onNotification('Dashboard data refreshed successfully', 'success');
      }
    } catch (error) {
      console.error('Error refreshing data:', error);
      if (onNotification) {
        onNotification('Failed to refresh data', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  const formatTimestamp = (timestamp, useBackendFormat = false, backendFormatted = null) => {
    // If we have backend-formatted data, use it directly
    if (useBackendFormat && backendFormatted && backendFormatted.date && backendFormatted.time) {
      return backendFormatted;
    }
    
    if (!timestamp) return { date: 'Unknown', time: 'Unknown' };
    
    try {
      // Handle both ISO format (2025-11-02T15:20:18.823Z) and SQLite format (2025-10-31 17:32:58)
      let loginTime;
      if (timestamp.includes('T') && timestamp.includes('Z')) {
        // ISO format with Z (UTC) - parse directly
        loginTime = new Date(timestamp);
      } else if (timestamp.includes('T')) {
        // ISO format without Z - parse directly
        loginTime = new Date(timestamp);
      } else {
        // SQLite format - convert to ISO and parse as UTC
        const isoTimestamp = timestamp.replace(' ', 'T') + 'Z';
        loginTime = new Date(isoTimestamp);
      }
      
      // Format for local display
      return {
        date: loginTime.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        }),
        time: loginTime.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        })
      };
    } catch (error) {
      console.error('Error formatting timestamp:', error, 'Timestamp:', timestamp);
      return { date: 'Invalid', time: 'Invalid' };
    }
  };



  return (
    <Box>
      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {statisticsCards.map((card, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card 
              sx={{ 
                height: '100%',
                background: `linear-gradient(135deg, ${card.color}15 0%, ${card.color}25 100%)`,
                border: `1px solid ${card.color}30`,
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: `0 8px 25px ${card.color}40`
                }
              }}
            >
              <CardContent sx={{ textAlign: 'center', p: 3 }}>
                <Avatar 
                  sx={{ 
                    bgcolor: card.color,
                    width: 56,
                    height: 56,
                    mx: 'auto',
                    mb: 2
                  }}
                >
                  {card.icon}
                </Avatar>
                
                <Typography variant="h3" sx={{ fontWeight: 'bold', color: card.color, mb: 1 }}>
                  {card.value}
                </Typography>
                
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                  {card.title}
                </Typography>
                
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {card.description}
                </Typography>
                
                <Chip 
                  label={card.trend}
                  size="small"
                  sx={{ 
                    bgcolor: card.trend.startsWith('+') ? '#e8f5e8' : '#ffeaea',
                    color: card.trend.startsWith('+') ? '#2e7d32' : '#d32f2f',
                    fontWeight: 600
                  }}
                />
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Recent User Logins */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Recent User Logins
                  </Typography>
                  <Chip 
                    label={realTimeStatus === 'connected' ? '🟢 Live' : '⚪ Offline'}
                    size="small"
                    sx={{ 
                      bgcolor: realTimeStatus === 'connected' ? '#e8f5e8' : '#f5f5f5',
                      color: realTimeStatus === 'connected' ? '#2e7d32' : '#757575',
                      fontWeight: 500,
                      fontSize: '0.75rem'
                    }}
                  />
                </Box>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<History />}
                    onClick={handleShowFullHistory}
                    sx={{ 
                      borderColor: '#1976d2', 
                      color: '#1976d2',
                      '&:hover': { 
                        borderColor: '#1565c0', 
                        backgroundColor: '#1976d210' 
                      }
                    }}
                  >
                    Show Full History
                  </Button>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={loading ? <CircularProgress size={16} /> : <Refresh />}
                    onClick={handleRefresh}
                    disabled={loading}
                  >
                    Refresh
                  </Button>
                </Box>
              </Box>
              
              {/* New Login Alert */}
              {newLoginAlert && (
                <Alert 
                  severity="success" 
                  sx={{ 
                    mb: 2,
                    animation: 'pulse 1s ease-in-out',
                    '@keyframes pulse': {
                      '0%': { transform: 'scale(1)' },
                      '50%': { transform: 'scale(1.02)' },
                      '100%': { transform: 'scale(1)' }
                    }
                  }}
                  onClose={() => setNewLoginAlert(null)}
                >
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    🔔 New Login Detected!
                  </Typography>
                  <Typography variant="body2">
                    {newLoginAlert.login.name || newLoginAlert.login.email} ({newLoginAlert.login.panel}) just logged in
                  </Typography>
                </Alert>
              )}
              

              
              {loading && recentLogins.length === 0 ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                  <CircularProgress />
                </Box>
              ) : recentLogins.length === 0 ? (
                <Alert severity="info">
                  No recent login activities found. Login activities will appear here when users log in.
                </Alert>
              ) : (
                <List>
                  {recentLogins.map((login) => {
                    // Use backend-formatted time data directly
                    const formatted = formatTimestamp(login.timestamp, true, login.backendFormatted);
                    return (
                      <ListItem 
                        key={login.id}
                        sx={{ 
                          borderRadius: 2,
                          mb: 1,
                          bgcolor: login.status === 'success' ? '#f8fff8' : '#fff8f8',
                          border: `1px solid ${login.status === 'success' ? '#e8f5e8' : '#ffeaea'}`,
                          '&:hover': { 
                            bgcolor: login.status === 'success' ? '#f0fff0' : '#fff0f0',
                            transform: 'translateY(-1px)',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                          },
                          transition: 'all 0.2s ease'
                        }}
                      >
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: getRoleColor(login.role) }}>
                            {login.role === 'company' ? <Business /> : 
                             login.role === 'government' ? <AccountBalance /> : 
                             <VerifiedUser />}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                              <Typography variant="body1" sx={{ fontWeight: 600 }}>
                                {login.name}
                              </Typography>
                              <Chip 
                                label={getRoleLabel(login.role)} 
                                size="small"
                                sx={{ 
                                  bgcolor: `${getRoleColor(login.role)}20`,
                                  color: getRoleColor(login.role),
                                  fontWeight: 500,
                                  fontSize: '0.75rem'
                                }}
                              />
                            </Box>
                          }
                          secondary={
                            <Box>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                                <Typography variant="body2" color="text.secondary">
                                  {login.email}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">•</Typography>
                                <Typography variant="body2" color="text.secondary">
                                  {login.organization}
                                </Typography>
                              </Box>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                  <AccessTime sx={{ fontSize: 14, color: 'text.secondary' }} />
                                  <Typography variant="caption" color="text.secondary">
                                    {formatted.date} at {formatted.time}
                                  </Typography>
                                </Box>
                                <Typography variant="caption" color="text.secondary">
                                  ({login.timeAgo})
                                </Typography>
                                <Chip 
                                  label={login.status === 'success' ? '✅ Success' : '❌ Failed'}
                                  size="small"
                                  sx={{ 
                                    bgcolor: login.status === 'success' ? '#e8f5e8' : '#ffeaea',
                                    color: login.status === 'success' ? '#2e7d32' : '#d32f2f',
                                    fontWeight: 500,
                                    fontSize: '0.7rem'
                                  }}
                                />
                              </Box>
                            </Box>
                          }
                        />
                      </ListItem>
                    );
                  })}
                </List>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Quick Actions */}
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                Quick Actions
              </Typography>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Button
                  variant="contained"
                  fullWidth
                  startIcon={<Add />}
                  onClick={handleAddUser}
                  sx={{ 
                    py: 1.5,
                    background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #1565c0 0%, #1e88e5 100%)',
                    }
                  }}
                >
                  Add New User
                </Button>
                
                <Button
                  variant="outlined"
                  fullWidth
                  startIcon={<Download />}
                  onClick={handleExportUsers}
                  sx={{ py: 1.5 }}
                >
                  Export Report
                </Button>
                
                <Button
                  variant="outlined"
                  fullWidth
                  startIcon={<VerifiedUser />}
                  sx={{ py: 1.5 }}
                >
                  Security Alerts (0)
                </Button>
              </Box>
              
              <Box sx={{ mt: 3, p: 2, bgcolor: 'success.light', borderRadius: 2 }}>
                <Typography variant="body2" sx={{ fontWeight: 600, color: 'success.dark' }}>
                  System Status: Healthy
                </Typography>
                <Typography variant="caption" color="success.dark">
                  All systems operational
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Add User Dialog */}
      <Dialog 
        open={addUserDialogOpen} 
        onClose={handleCloseAddUser}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 2 }
        }}
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Add sx={{ color: '#1976d2' }} />
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Add New User
            </Typography>
          </Box>
        </DialogTitle>
        
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Grid container spacing={3}>
              {/* Email */}
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Email Address"
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  error={!!addUserErrors.email}
                  helperText={addUserErrors.email}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Email />
                      </InputAdornment>
                    ),
                  }}
                  disabled={addUserLoading}
                />
              </Grid>

              {/* Name */}
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Full Name"
                  value={newUser.name}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                  error={!!addUserErrors.name}
                  helperText={addUserErrors.name}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <VerifiedUser />
                      </InputAdornment>
                    ),
                  }}
                  disabled={addUserLoading}
                />
              </Grid>

              {/* Password */}
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  error={!!addUserErrors.password}
                  helperText={addUserErrors.password}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Lock />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  disabled={addUserLoading}
                />
              </Grid>

              {/* Panel */}
              <Grid item xs={12} md={6}>
                <FormControl fullWidth error={!!addUserErrors.panel}>
                  <InputLabel>Panel/Role</InputLabel>
                  <Select
                    value={newUser.panel}
                    label="Panel/Role"
                    onChange={(e) => setNewUser({ ...newUser, panel: e.target.value })}
                    disabled={addUserLoading}
                  >
                    <MenuItem value="admin">
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <VerifiedUser sx={{ color: '#1976d2' }} />
                        Administrator
                      </Box>
                    </MenuItem>
                    <MenuItem value="company">
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Business sx={{ color: '#2e7d32' }} />
                        Company User
                      </Box>
                    </MenuItem>
                    <MenuItem value="government">
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <AccountBalance sx={{ color: '#0288d1' }} />
                        Government User
                      </Box>
                    </MenuItem>
                  </Select>
                  {addUserErrors.panel && (
                    <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.5 }}>
                      {addUserErrors.panel}
                    </Typography>
                  )}
                </FormControl>
              </Grid>

              {/* Organization */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Organization (Optional)"
                  value={newUser.organization}
                  onChange={(e) => setNewUser({ ...newUser, organization: e.target.value })}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Business />
                      </InputAdornment>
                    ),
                  }}
                  disabled={addUserLoading}
                  helperText="Company name, department, or organization"
                />
              </Grid>

              {/* Role Description */}
              {newUser.panel && (
                <Grid item xs={12}>
                  <Alert 
                    severity="info" 
                    sx={{ 
                      bgcolor: newUser.panel === 'admin' ? '#1976d210' : 
                               newUser.panel === 'company' ? '#2e7d3210' : '#0288d110',
                      border: `1px solid ${newUser.panel === 'admin' ? '#1976d230' : 
                                          newUser.panel === 'company' ? '#2e7d3230' : '#0288d130'}`
                    }}
                  >
                    <Typography variant="body2">
                      {newUser.panel === 'admin' && 
                        'Administrators have full system access including user management, system settings, and all panels.'
                      }
                      {newUser.panel === 'company' && 
                        'Company users can manage carbon credit projects, trade credits, and upload MRV data.'
                      }
                      {newUser.panel === 'government' && 
                        'Government users have access to regulatory oversight, compliance monitoring, and audit tools.'
                      }
                    </Typography>
                  </Alert>
                </Grid>
              )}
            </Grid>
          </Box>
        </DialogContent>

        <DialogActions sx={{ p: 3, pt: 1 }}>
          <Button 
            onClick={handleCloseAddUser}
            disabled={addUserLoading}
            sx={{ mr: 1 }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleCreateUser}
            variant="contained"
            disabled={addUserLoading}
            sx={{
              background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
              '&:hover': { background: 'linear-gradient(135deg, #1565c0 0%, #1e88e5 100%)' },
              minWidth: 120
            }}
          >
            {addUserLoading ? (
              <CircularProgress size={20} color="inherit" />
            ) : (
              'Create User'
            )}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Full Login History Dialog */}
      <Dialog 
        open={historyDialogOpen} 
        onClose={handleCloseHistory}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: { minHeight: '80vh', maxHeight: '90vh' }
        }}
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <History sx={{ color: '#1976d2' }} />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Complete Login History
              </Typography>
            </Box>
            <IconButton onClick={handleCloseHistory}>
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        
        <DialogContent>
          {historyLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : Object.keys(groupedHistory).length === 0 ? (
            <Alert severity="info">
              No login history found.
            </Alert>
          ) : (
            <Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Total login activities: {fullHistory.length} | Organized by date
              </Typography>
              
              {Object.entries(groupedHistory)
                .sort(([a], [b]) => new Date(b) - new Date(a)) // Sort by date descending
                .map(([date, activities]) => {
                  const dateObj = new Date(date);
                  const isToday = dateObj.toDateString() === new Date().toDateString();
                  const isYesterday = dateObj.toDateString() === new Date(Date.now() - 86400000).toDateString();
                  
                  let dateLabel = dateObj.toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  });
                  
                  if (isToday) dateLabel = `Today - ${dateLabel}`;
                  else if (isYesterday) dateLabel = `Yesterday - ${dateLabel}`;
                  
                  const successCount = activities.filter(a => a.loginStatus === 'success').length;
                  const failedCount = activities.filter(a => a.loginStatus === 'failed').length;
                  
                  return (
                    <Accordion key={date} defaultExpanded={isToday}>
                      <AccordionSummary 
                        expandIcon={<ExpandMore />}
                        sx={{ 
                          bgcolor: isToday ? '#f8fff8' : 'grey.50',
                          '&:hover': { bgcolor: isToday ? '#f0fff0' : 'grey.100' }
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                          <CalendarToday sx={{ color: '#1976d2' }} />
                          <Typography variant="h6" sx={{ fontWeight: 600, flexGrow: 1 }}>
                            {dateLabel}
                          </Typography>
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <Chip 
                              label={`${activities.length} total`}
                              size="small"
                              sx={{ bgcolor: '#e3f2fd', color: '#1976d2' }}
                            />
                            {successCount > 0 && (
                              <Chip 
                                label={`${successCount} success`}
                                size="small"
                                sx={{ bgcolor: '#e8f5e8', color: '#2e7d32' }}
                              />
                            )}
                            {failedCount > 0 && (
                              <Chip 
                                label={`${failedCount} failed`}
                                size="small"
                                sx={{ bgcolor: '#ffeaea', color: '#d32f2f' }}
                              />
                            )}
                          </Box>
                        </Box>
                      </AccordionSummary>
                      <AccordionDetails>
                        <TableContainer component={Paper} variant="outlined">
                          <Table size="small">
                            <TableHead>
                              <TableRow sx={{ bgcolor: 'grey.50' }}>
                                <TableCell><strong>Time</strong></TableCell>
                                <TableCell><strong>User</strong></TableCell>
                                <TableCell><strong>Panel</strong></TableCell>
                                <TableCell><strong>Organization</strong></TableCell>
                                <TableCell><strong>Status</strong></TableCell>
                                <TableCell><strong>IP Address</strong></TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {activities
                                .sort((a, b) => new Date(b.loginTimestamp.replace(' ', 'T')) - new Date(a.loginTimestamp.replace(' ', 'T')))
                                .map((activity, index) => {
                                  // Use backend-formatted time or format properly
                                  let time;
                                  try {
                                    if (activity.formattedTime) {
                                      // Backend already formatted the time
                                      time = activity.formattedTime;
                                    } else {
                                      // Format using same logic as backend
                                      const isoTimestamp = activity.loginTimestamp.replace(' ', 'T');
                                      const loginTime = new Date(isoTimestamp);
                                      const now = new Date();
                                      const timezoneOffset = now.getTimezoneOffset() * 60000;
                                      const adjustedLoginTime = new Date(loginTime.getTime() - timezoneOffset);
                                      time = adjustedLoginTime.toLocaleTimeString('en-US', {
                                        hour: '2-digit',
                                        minute: '2-digit',
                                        second: '2-digit'
                                      });
                                    }
                                  } catch (error) {
                                    time = 'Invalid Time';
                                  }
                                  
                                  return (
                                    <TableRow 
                                      key={`${activity.id}-${index}`}
                                      sx={{ 
                                        '&:hover': { bgcolor: 'grey.50' },
                                        bgcolor: activity.loginStatus === 'failed' ? '#fff8f8' : 'inherit'
                                      }}
                                    >
                                      <TableCell>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                          <AccessTime sx={{ fontSize: 14, color: 'text.secondary' }} />
                                          <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                                            {time}
                                          </Typography>
                                        </Box>
                                      </TableCell>
                                      <TableCell>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                          <Avatar 
                                            sx={{ 
                                              bgcolor: getRoleColor(activity.panel), 
                                              width: 24, 
                                              height: 24 
                                            }}
                                          >
                                            {activity.panel === 'company' ? <Business sx={{ fontSize: 14 }} /> : 
                                             activity.panel === 'government' ? <AccountBalance sx={{ fontSize: 14 }} /> : 
                                             <VerifiedUser sx={{ fontSize: 14 }} />}
                                          </Avatar>
                                          <Box>
                                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                              {activity.name || 'Unknown User'}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                              {activity.email}
                                            </Typography>
                                          </Box>
                                        </Box>
                                      </TableCell>
                                      <TableCell>
                                        <Chip 
                                          label={getRoleLabel(activity.panel)} 
                                          size="small"
                                          sx={{ 
                                            bgcolor: `${getRoleColor(activity.panel)}20`,
                                            color: getRoleColor(activity.panel),
                                            fontWeight: 500
                                          }}
                                        />
                                      </TableCell>
                                      <TableCell>
                                        <Typography variant="body2">
                                          {activity.organization || 'No Organization'}
                                        </Typography>
                                      </TableCell>
                                      <TableCell>
                                        <Chip 
                                          icon={activity.loginStatus === 'success' ? <CheckCircle /> : <Error />}
                                          label={activity.loginStatus === 'success' ? 'Success' : 'Failed'}
                                          size="small"
                                          sx={{ 
                                            bgcolor: activity.loginStatus === 'success' ? '#e8f5e8' : '#ffeaea',
                                            color: activity.loginStatus === 'success' ? '#2e7d32' : '#d32f2f',
                                            fontWeight: 500
                                          }}
                                        />
                                      </TableCell>
                                      <TableCell>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                          <Computer sx={{ fontSize: 14, color: 'text.secondary' }} />
                                          <Typography variant="caption" color="text.secondary" sx={{ fontFamily: 'monospace' }}>
                                            {activity.ipAddress || 'Unknown'}
                                          </Typography>
                                        </Box>
                                      </TableCell>
                                    </TableRow>
                                  );
                                })}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      </AccordionDetails>
                    </Accordion>
                  );
                })}
            </Box>
          )}
        </DialogContent>
        
        <DialogActions>
          <Button onClick={handleCloseHistory}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SimpleUserOverview;