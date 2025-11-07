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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  FormControlLabel,
  FormGroup,
  Tooltip,
  Badge,
  useTheme,
  useMediaQuery,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import {
  Backup,
  Restore,
  CloudDownload,
  CloudUpload,
  Schedule,
  History,
  Settings,
  Delete,
  Download,
  Refresh,
  Add,
  PlayArrow,
  Stop,
  CheckCircle,
  Error,
  Warning,
  Info,
  Storage,
  Folder,
  Archive,
  Security,
  Timer,
  DataUsage,
  Notifications,
  ExpandMore,
  Close,
  Visibility,
  GetApp,
  RestoreFromTrash,
  VerifiedUser,
  Schedule as ScheduleIcon,
  Assessment
} from '@mui/icons-material';
import { blueCarbon } from '../../theme/colors';

const BackupRestore = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Data states
  const [backupJobs, setBackupJobs] = useState([]);
  const [backupHistory, setBackupHistory] = useState([]);
  const [restoreOperations, setRestoreOperations] = useState([]);
  const [backupStats, setBackupStats] = useState({});
  const [notifications, setNotifications] = useState([]);
  
  // UI states
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'info' });
  const [createBackupDialog, setCreateBackupDialog] = useState(false);
  const [restoreDialog, setRestoreDialog] = useState(false);
  const [selectedBackup, setSelectedBackup] = useState(null);
  const [backupDetailsDialog, setBackupDetailsDialog] = useState(false);
  
  // Pagination
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  });

  // Create backup form state
  const [backupForm, setBackupForm] = useState({
    backup_name: '',
    backup_type: 'full',
    databases: [],
    include_files: false,
    compression_enabled: true,
    encryption_enabled: false
  });

  // Restore form state
  const [restoreForm, setRestoreForm] = useState({
    restore_type: 'full',
    databases_to_restore: [],
    files_to_restore: false,
    overwrite_existing: false
  });

  const availableDatabases = [
    'bluecarbon_main',
    'bluecarbon_audit', 
    'bluecarbon_monitoring',
    'bluecarbon_backup'
  ];

  useEffect(() => {
    loadAllData();
  }, [pagination.page]);

  useEffect(() => {
    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      loadAllData(true);
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const loadAllData = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      setRefreshing(true);

      const token = localStorage.getItem('token');
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      // Load all backup data in parallel
      const [jobsRes, historyRes, restoresRes, statsRes, notificationsRes] = await Promise.all([
        fetch('http://localhost:8000/api/backup/jobs', { headers }),
        fetch(`http://localhost:8000/api/backup/history?page=${pagination.page}&limit=${pagination.limit}`, { headers }),
        fetch('http://localhost:8000/api/backup/restores?limit=20', { headers }),
        fetch('http://localhost:8000/api/backup/stats?timeframe=30d', { headers }),
        fetch('http://localhost:8000/api/backup/notifications?limit=10', { headers })
      ]);

      // Process responses
      if (jobsRes.ok) {
        const data = await jobsRes.json();
        if (data.success) setBackupJobs(data.jobs);
      }

      if (historyRes.ok) {
        const data = await historyRes.json();
        if (data.success) {
          setBackupHistory(data.backups);
          setPagination(prev => ({
            ...prev,
            total: data.pagination.total,
            pages: data.pagination.pages
          }));
        }
      }

      if (restoresRes.ok) {
        const data = await restoresRes.json();
        if (data.success) setRestoreOperations(data.restores);
      }

      if (statsRes.ok) {
        const data = await statsRes.json();
        if (data.success) setBackupStats(data.stats);
      }

      if (notificationsRes.ok) {
        const data = await notificationsRes.json();
        if (data.success) setNotifications(data.notifications);
      }

    } catch (error) {
      console.error('Error loading backup data:', error);
      showNotification('Failed to load backup data: ' + error.message, 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleCreateBackup = async () => {
    try {
      if (!backupForm.backup_name.trim()) {
        showNotification('Backup name is required', 'error');
        return;
      }

      if (backupForm.databases.length === 0) {
        showNotification('At least one database must be selected', 'error');
        return;
      }

      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8000/api/backup/create', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(backupForm)
      });

      const data = await response.json();
      
      if (data.success) {
        showNotification('Backup process started successfully', 'success');
        setCreateBackupDialog(false);
        setBackupForm({
          backup_name: '',
          backup_type: 'full',
          databases: [],
          include_files: false,
          compression_enabled: true,
          encryption_enabled: false
        });
        
        // Refresh data after a short delay
        setTimeout(() => loadAllData(true), 2000);
      } else {
        showNotification('Failed to start backup: ' + data.message, 'error');
      }
    } catch (error) {
      showNotification('Error creating backup: ' + error.message, 'error');
    }
  };

  const handleRestoreBackup = async () => {
    try {
      if (!selectedBackup) {
        showNotification('No backup selected', 'error');
        return;
      }

      if (restoreForm.databases_to_restore.length === 0 && !restoreForm.files_to_restore) {
        showNotification('Select at least one item to restore', 'error');
        return;
      }

      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8000/api/backup/restore/${selectedBackup.id}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(restoreForm)
      });

      const data = await response.json();
      
      if (data.success) {
        showNotification('Restore process started successfully', 'success');
        setRestoreDialog(false);
        setRestoreForm({
          restore_type: 'full',
          databases_to_restore: [],
          files_to_restore: false,
          overwrite_existing: false
        });
        
        // Refresh data after a short delay
        setTimeout(() => loadAllData(true), 2000);
      } else {
        showNotification('Failed to start restore: ' + data.message, 'error');
      }
    } catch (error) {
      showNotification('Error starting restore: ' + error.message, 'error');
    }
  };

  const handleDownloadBackup = async (backup) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8000/api/backup/download/${backup.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = backup.file_name;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        showNotification('Backup download started', 'success');
      } else {
        throw new Error('Download failed');
      }
    } catch (error) {
      showNotification('Failed to download backup: ' + error.message, 'error');
    }
  };

  const handleDeleteBackup = async (backupId) => {
    if (!window.confirm('Are you sure you want to delete this backup? This action cannot be undone.')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8000/api/backup/${backupId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      
      if (data.success) {
        showNotification('Backup deleted successfully', 'success');
        loadAllData(true);
      } else {
        showNotification('Failed to delete backup: ' + data.message, 'error');
      }
    } catch (error) {
      showNotification('Error deleting backup: ' + error.message, 'error');
    }
  };

  const showNotification = (message, severity = 'info') => {
    setNotification({ open: true, message, severity });
  };

  const getStatusColor = (status) => {
    const colors = {
      completed: 'success',
      running: 'info',
      failed: 'error',
      cancelled: 'warning'
    };
    return colors[status] || 'default';
  };

  const getStatusIcon = (status) => {
    const icons = {
      completed: <CheckCircle />,
      running: <Timer />,
      failed: <Error />,
      cancelled: <Warning />
    };
    return icons[status] || <Info />;
  };

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDuration = (seconds) => {
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    if (minutes < 60) return `${minutes}m ${remainingSeconds}s`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  };

  const renderStatsCard = (title, value, icon, color = 'primary', subtitle = '') => (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Avatar sx={{ bgcolor: `${color}.main`, mr: 2 }}>
            {icon}
          </Avatar>
          <Box>
            <Typography variant="h6" sx={{ fontSize: { xs: '1rem', md: '1.25rem' } }}>
              {title}
            </Typography>
            {subtitle && (
              <Typography variant="body2" color="text.secondary">
                {subtitle}
              </Typography>
            )}
          </Box>
        </Box>
        <Typography variant="h4" sx={{ fontSize: { xs: '1.5rem', md: '2rem' }, fontWeight: 'bold' }}>
          {value}
        </Typography>
      </CardContent>
    </Card>
  );

  const renderBackupJobsTab = () => (
    <Grid container spacing={3}>
      {/* Backup Jobs Overview */}
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6">Backup Jobs</Typography>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => setCreateBackupDialog(true)}
              >
                Create Backup
              </Button>
            </Box>

            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Job Name</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Databases</TableCell>
                    <TableCell>Schedule</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {backupJobs.map((job) => (
                    <TableRow key={job.id}>
                      <TableCell>
                        <Box>
                          <Typography variant="body2" fontWeight="medium">
                            {job.job_name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {job.backup_type} backup
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={job.job_type.toUpperCase()}
                          color={job.job_type === 'scheduled' ? 'primary' : 'default'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {job.databases.length} database(s)
                        </Typography>
                        {job.include_files && (
                          <Chip label="+ Files" size="small" sx={{ mt: 0.5 }} />
                        )}
                      </TableCell>
                      <TableCell>
                        {job.schedule_cron ? (
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <ScheduleIcon sx={{ fontSize: 16, mr: 0.5 }} />
                            <Typography variant="body2">
                              {job.schedule_cron}
                            </Typography>
                          </Box>
                        ) : (
                          <Typography variant="body2" color="text.secondary">
                            Manual
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={job.status.toUpperCase()}
                          color={job.status === 'active' ? 'success' : 'default'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          {job.job_type === 'manual' && (
                            <Tooltip title="Run Now">
                              <IconButton
                                size="small"
                                onClick={() => {
                                  setBackupForm({
                                    ...backupForm,
                                    backup_name: `${job.job_name}_${new Date().toISOString().split('T')[0]}`,
                                    backup_type: job.backup_type,
                                    databases: job.databases,
                                    include_files: job.include_files,
                                    compression_enabled: job.compression_enabled,
                                    encryption_enabled: job.encryption_enabled
                                  });
                                  setCreateBackupDialog(true);
                                }}
                              >
                                <PlayArrow />
                              </IconButton>
                            </Tooltip>
                          )}
                          <Tooltip title="View Details">
                            <IconButton size="small">
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

  const renderBackupHistoryTab = () => (
    <Grid container spacing={3}>
      {/* Statistics Cards */}
      {backupStats && (
        <Grid container spacing={2} sx={{ mb: 3, px: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            {renderStatsCard(
              'Total Backups',
              backupStats.totalBackups || 0,
              <Backup />,
              'primary',
              'Last 30 days'
            )}
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            {renderStatsCard(
              'Success Rate',
              `${backupStats.successRate || 100}%`,
              <CheckCircle />,
              'success',
              'Backup reliability'
            )}
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            {renderStatsCard(
              'Total Size',
              backupStats.formattedTotalSize || '0 Bytes',
              <Storage />,
              'info',
              'Storage used'
            )}
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            {renderStatsCard(
              'Avg Duration',
              backupStats.formattedAvgDuration || '0s',
              <Timer />,
              'warning',
              'Processing time'
            )}
          </Grid>
        </Grid>
      )}

      {/* Backup History Table */}
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Backup History
            </Typography>

            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Backup Name</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Size</TableCell>
                    <TableCell>Duration</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Created</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {backupHistory.map((backup) => (
                    <TableRow key={backup.id}>
                      <TableCell>
                        <Box>
                          <Typography variant="body2" fontWeight="medium">
                            {backup.backup_name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {backup.job_name || 'Manual backup'}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={backup.backup_type.toUpperCase()}
                          size="small"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {backup.formatted_size}
                        </Typography>
                        {backup.compression_ratio && (
                          <Typography variant="caption" color="text.secondary" display="block">
                            {(backup.compression_ratio * 100).toFixed(0)}% compressed
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {backup.formatted_duration}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          icon={getStatusIcon(backup.status)}
                          label={backup.status.toUpperCase()}
                          color={getStatusColor(backup.status)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {new Date(backup.created_at).toLocaleString()}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          {backup.success && backup.file_exists && (
                            <>
                              <Tooltip title="Download">
                                <IconButton
                                  size="small"
                                  onClick={() => handleDownloadBackup(backup)}
                                >
                                  <Download />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Restore">
                                <IconButton
                                  size="small"
                                  onClick={() => {
                                    setSelectedBackup(backup);
                                    setRestoreDialog(true);
                                  }}
                                >
                                  <Restore />
                                </IconButton>
                              </Tooltip>
                            </>
                          )}
                          <Tooltip title="View Details">
                            <IconButton
                              size="small"
                              onClick={() => {
                                setSelectedBackup(backup);
                                setBackupDetailsDialog(true);
                              }}
                            >
                              <Visibility />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete">
                            <IconButton
                              size="small"
                              onClick={() => handleDeleteBackup(backup.id)}
                              color="error"
                            >
                              <Delete />
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

  const renderRestoreOperationsTab = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Restore Operations
            </Typography>

            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Backup Source</TableCell>
                    <TableCell>Restore Type</TableCell>
                    <TableCell>Items Restored</TableCell>
                    <TableCell>Duration</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Started</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {restoreOperations.map((restore) => (
                    <TableRow key={restore.id}>
                      <TableCell>
                        <Box>
                          <Typography variant="body2" fontWeight="medium">
                            {restore.backup_name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {restore.backup_type} backup
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={restore.restore_type.toUpperCase()}
                          size="small"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {restore.restored_items_count} items
                        </Typography>
                        <Typography variant="caption" color="text.secondary" display="block">
                          {restore.databases_to_restore.length} DB(s)
                          {restore.files_to_restore && ' + Files'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {restore.formatted_duration}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          icon={getStatusIcon(restore.status)}
                          label={restore.status.toUpperCase()}
                          color={getStatusColor(restore.status)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {new Date(restore.created_at).toLocaleString()}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" display="block">
                          by {restore.created_by}
                        </Typography>
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

  const renderNotificationsTab = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Backup Notifications
            </Typography>

            <List>
              {notifications.map((notification) => (
                <ListItem key={notification.id}>
                  <ListItemIcon>
                    {notification.notification_type === 'success' && <CheckCircle color="success" />}
                    {notification.notification_type === 'failure' && <Error color="error" />}
                    {notification.notification_type === 'warning' && <Warning color="warning" />}
                    {notification.notification_type === 'info' && <Info color="info" />}
                  </ListItemIcon>
                  <ListItemText
                    primary={notification.title}
                    secondary={
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          {notification.message}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {notification.time_ago}
                        </Typography>
                      </Box>
                    }
                  />
                  {!notification.is_read && (
                    <ListItemSecondaryAction>
                      <Badge color="primary" variant="dot" />
                    </ListItemSecondaryAction>
                  )}
                </ListItem>
              ))}
            </List>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  return (
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
            <Backup sx={{ mr: 2, fontSize: { xs: '1.5rem', md: '2rem' } }} />
            Backup & Restore
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Comprehensive data backup and recovery management
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
          <Tooltip title="Refresh Data">
            <IconButton 
              onClick={() => loadAllData()} 
              disabled={refreshing}
              size={isMobile ? 'small' : 'medium'}
            >
              <Refresh />
            </IconButton>
          </Tooltip>
          
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setCreateBackupDialog(true)}
            size={isMobile ? 'small' : 'medium'}
          >
            Create Backup
          </Button>
        </Box>
      </Box>

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
              <Tab label="Backup Jobs" icon={<Schedule />} />
              <Tab label="Backup History" icon={<History />} />
              <Tab label="Restore Operations" icon={<Restore />} />
              <Tab label="Notifications" icon={<Notifications />} />
            </Tabs>
          </Paper>

          {/* Tab Content */}
          {activeTab === 0 && renderBackupJobsTab()}
          {activeTab === 1 && renderBackupHistoryTab()}
          {activeTab === 2 && renderRestoreOperationsTab()}
          {activeTab === 3 && renderNotificationsTab()}
        </>
      )}

      {/* Create Backup Dialog */}
      <Dialog
        open={createBackupDialog}
        onClose={() => setCreateBackupDialog(false)}
        maxWidth="md"
        fullWidth
        fullScreen={isMobile}
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">Create New Backup</Typography>
            <IconButton onClick={() => setCreateBackupDialog(false)}>
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Backup Name"
                value={backupForm.backup_name}
                onChange={(e) => setBackupForm({ ...backupForm, backup_name: e.target.value })}
                placeholder="Enter backup name"
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Backup Type</InputLabel>
                <Select
                  value={backupForm.backup_type}
                  onChange={(e) => setBackupForm({ ...backupForm, backup_type: e.target.value })}
                  label="Backup Type"
                >
                  <MenuItem value="full">Full Backup</MenuItem>
                  <MenuItem value="incremental">Incremental Backup</MenuItem>
                  <MenuItem value="differential">Differential Backup</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <Typography variant="subtitle2" gutterBottom>
                Select Databases to Backup
              </Typography>
              <FormGroup>
                {availableDatabases.map((db) => (
                  <FormControlLabel
                    key={db}
                    control={
                      <Checkbox
                        checked={backupForm.databases.includes(db)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setBackupForm({
                              ...backupForm,
                              databases: [...backupForm.databases, db]
                            });
                          } else {
                            setBackupForm({
                              ...backupForm,
                              databases: backupForm.databases.filter(d => d !== db)
                            });
                          }
                        }}
                      />
                    }
                    label={db}
                  />
                ))}
              </FormGroup>
            </Grid>

            <Grid item xs={12}>
              <Typography variant="subtitle2" gutterBottom>
                Backup Options
              </Typography>
              <FormGroup>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={backupForm.include_files}
                      onChange={(e) => setBackupForm({ ...backupForm, include_files: e.target.checked })}
                    />
                  }
                  label="Include Files (uploads, logs, config)"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={backupForm.compression_enabled}
                      onChange={(e) => setBackupForm({ ...backupForm, compression_enabled: e.target.checked })}
                    />
                  }
                  label="Enable Compression"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={backupForm.encryption_enabled}
                      onChange={(e) => setBackupForm({ ...backupForm, encryption_enabled: e.target.checked })}
                    />
                  }
                  label="Enable Encryption"
                />
              </FormGroup>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateBackupDialog(false)}>Cancel</Button>
          <Button 
            onClick={handleCreateBackup}
            variant="contained"
            startIcon={<Backup />}
          >
            Create Backup
          </Button>
        </DialogActions>
      </Dialog>

      {/* Restore Dialog */}
      <Dialog
        open={restoreDialog}
        onClose={() => setRestoreDialog(false)}
        maxWidth="md"
        fullWidth
        fullScreen={isMobile}
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">Restore from Backup</Typography>
            <IconButton onClick={() => setRestoreDialog(false)}>
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedBackup && (
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <Alert severity="info">
                  Restoring from: {selectedBackup.backup_name} ({selectedBackup.formatted_size})
                </Alert>
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Restore Type</InputLabel>
                  <Select
                    value={restoreForm.restore_type}
                    onChange={(e) => setRestoreForm({ ...restoreForm, restore_type: e.target.value })}
                    label="Restore Type"
                  >
                    <MenuItem value="full">Full Restore</MenuItem>
                    <MenuItem value="selective">Selective Restore</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <Typography variant="subtitle2" gutterBottom>
                  Select Items to Restore
                </Typography>
                <FormGroup>
                  {selectedBackup.databases_included?.map((db) => (
                    <FormControlLabel
                      key={db}
                      control={
                        <Checkbox
                          checked={restoreForm.databases_to_restore.includes(db)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setRestoreForm({
                                ...restoreForm,
                                databases_to_restore: [...restoreForm.databases_to_restore, db]
                              });
                            } else {
                              setRestoreForm({
                                ...restoreForm,
                                databases_to_restore: restoreForm.databases_to_restore.filter(d => d !== db)
                              });
                            }
                          }}
                        />
                      }
                      label={`Database: ${db}`}
                    />
                  ))}
                  
                  {selectedBackup.files_included && (
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={restoreForm.files_to_restore}
                          onChange={(e) => setRestoreForm({ ...restoreForm, files_to_restore: e.target.checked })}
                        />
                      }
                      label="Files (uploads, logs, config)"
                    />
                  )}
                </FormGroup>
              </Grid>

              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={restoreForm.overwrite_existing}
                      onChange={(e) => setRestoreForm({ ...restoreForm, overwrite_existing: e.target.checked })}
                    />
                  }
                  label="Overwrite existing data (creates backup of current data)"
                />
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRestoreDialog(false)}>Cancel</Button>
          <Button 
            onClick={handleRestoreBackup}
            variant="contained"
            startIcon={<Restore />}
            color="warning"
          >
            Start Restore
          </Button>
        </DialogActions>
      </Dialog>

      {/* Backup Details Dialog */}
      <Dialog
        open={backupDetailsDialog}
        onClose={() => setBackupDetailsDialog(false)}
        maxWidth="md"
        fullWidth
        fullScreen={isMobile}
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">Backup Details</Typography>
            <IconButton onClick={() => setBackupDetailsDialog(false)}>
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedBackup && (
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" gutterBottom>Basic Information</Typography>
                <List dense>
                  <ListItem>
                    <ListItemText
                      primary="Backup Name"
                      secondary={selectedBackup.backup_name}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="Type"
                      secondary={selectedBackup.backup_type}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="Size"
                      secondary={selectedBackup.formatted_size}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="Duration"
                      secondary={selectedBackup.formatted_duration}
                    />
                  </ListItem>
                </List>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" gutterBottom>Status & Timing</Typography>
                <List dense>
                  <ListItem>
                    <ListItemText
                      primary="Status"
                      secondary={
                        <Chip
                          icon={getStatusIcon(selectedBackup.status)}
                          label={selectedBackup.status.toUpperCase()}
                          color={getStatusColor(selectedBackup.status)}
                          size="small"
                        />
                      }
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="Created"
                      secondary={new Date(selectedBackup.created_at).toLocaleString()}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="Created By"
                      secondary={selectedBackup.created_by}
                    />
                  </ListItem>
                  {selectedBackup.checksum && (
                    <ListItem>
                      <ListItemText
                        primary="Checksum"
                        secondary={selectedBackup.checksum.substring(0, 20) + '...'}
                      />
                    </ListItem>
                  )}
                </List>
              </Grid>

              <Grid item xs={12}>
                <Typography variant="subtitle2" gutterBottom>Included Items</Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {selectedBackup.databases_included?.map((db) => (
                    <Chip key={db} label={db} size="small" />
                  ))}
                  {selectedBackup.files_included && (
                    <Chip label="Files" size="small" color="primary" />
                  )}
                </Box>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBackupDetailsDialog(false)}>Close</Button>
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

export default BackupRestore;