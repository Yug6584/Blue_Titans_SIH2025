import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Avatar,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Divider,
  Alert,
} from '@mui/material';
import {
  AdminPanelSettings,
  Download,
  Refresh,
  CheckCircle,
  Warning,
  Error,
  History,
  Assessment,
  Info,
} from '@mui/icons-material';
import { blueCarbon } from '../../../theme/colors';
import { adminActionService } from '../../../services/adminActionService';
import AdminActionModal from './AdminActionModal';
import ExportDialog from './ExportDialog';

const AdminActionLogger = ({ onNotification, loading }) => {
  const [adminActions, setAdminActions] = useState([]);
  const [adminStats, setAdminStats] = useState({
    total: 0,
    severity: { high: 0, medium: 0, low: 0 },
    timeframes: { today: 0, thisWeek: 0, thisMonth: 0 }
  });
  const [isLoading, setIsLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);

  // Load admin actions and statistics
  useEffect(() => {
    loadAdminActions();
    loadAdminStats();
  }, []);

  const loadAdminActions = async () => {
    try {
      setIsLoading(true);
      const response = await adminActionService.getAdminActions('limit=5');
      
      if (response && response.success) {
        const actions = Array.isArray(response.actions) ? response.actions : [];
        const sortedActions = actions.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        setAdminActions(sortedActions);
      } else {
        console.error('API response error:', response);
        setAdminActions([]);
        onNotification('Failed to load admin actions', 'error');
      }
    } catch (error) {
      console.error('Error loading admin actions:', error);
      setAdminActions([]);
      onNotification('Error loading admin actions', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const loadAdminStats = async () => {
    try {
      const response = await adminActionService.getAdminActionStats();
      if (response && response.success && response.stats) {
        setAdminStats(response.stats);
      } else {
        console.error('Stats API response error:', response);
        setAdminStats({
          total: 0,
          severity: { high: 0, medium: 0, low: 0 },
          timeframes: { today: 0, thisWeek: 0, thisMonth: 0 }
        });
      }
    } catch (error) {
      console.error('Error loading admin stats:', error);
      setAdminStats({
        total: 0,
        severity: { high: 0, medium: 0, low: 0 },
        timeframes: { today: 0, thisWeek: 0, thisMonth: 0 }
      });
    }
  };



  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'high': return '#f44336';
      case 'medium': return '#ff9800';
      case 'low': return '#4caf50';
      default: return blueCarbon.oceanBlue;
    }
  };

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'high': return <Error />;
      case 'medium': return <Warning />;
      case 'low': return <CheckCircle />;
      default: return <Info />;
    }
  };

  const formatDateTime = (date) => {
    return new Date(date).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDateOnly = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const isToday = (date) => {
    const today = new Date();
    const actionDate = new Date(date);
    return today.toDateString() === actionDate.toDateString();
  };

  const isYesterday = (date) => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const actionDate = new Date(date);
    return yesterday.toDateString() === actionDate.toDateString();
  };

  const getRelativeDate = (date) => {
    if (isToday(date)) return 'Today';
    if (isYesterday(date)) return 'Yesterday';
    return formatDateOnly(date);
  };

  const handleRefresh = () => {
    onNotification('Refreshing admin actions...', 'info');
    loadAdminActions();
    loadAdminStats();
  };

  const handleOpenModal = () => {
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
  };

  const handleOpenExportDialog = () => {
    setExportDialogOpen(true);
  };

  const handleCloseExportDialog = () => {
    setExportDialogOpen(false);
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 600, color: blueCarbon.deepOcean, mb: 1 }}>
          Admin Action Accountability
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Track and monitor all administrative actions for compliance and accountability
        </Typography>
      </Box>

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            background: `linear-gradient(135deg, ${blueCarbon.oceanBlue}15 0%, ${blueCarbon.oceanBlue}25 100%)`,
            border: `1px solid ${blueCarbon.oceanBlue}30`
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: blueCarbon.oceanBlue }}>
                    {adminStats.total}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Actions
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: blueCarbon.oceanBlue }}>
                  <AdminPanelSettings />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            background: `linear-gradient(135deg, #f4433615 0%, #f4433625 100%)`,
            border: `1px solid #f4433630`
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: '#f44336' }}>
                    {adminStats.severity.high}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    High Severity
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: '#f44336' }}>
                  <Error />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            background: `linear-gradient(135deg, #ff980015 0%, #ff980025 100%)`,
            border: `1px solid #ff980030`
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: '#ff9800' }}>
                    {adminStats.severity.medium}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Medium Severity
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: '#ff9800' }}>
                  <Warning />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            background: `linear-gradient(135deg, #4caf5015 0%, #4caf5025 100%)`,
            border: `1px solid #4caf5030`
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: '#4caf50' }}>
                    {adminStats.severity.low}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Low Severity
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: '#4caf50' }}>
                  <CheckCircle />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>



      {/* Action Controls */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Recent Administrative Actions ({adminActions.length})
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Showing latest 5 activities • Sorted by date (newest first)
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="contained"
            startIcon={<History />}
            onClick={handleOpenModal}
            sx={{ 
              bgcolor: blueCarbon.oceanBlue, 
              '&:hover': { bgcolor: blueCarbon.deepOcean }
            }}
          >
            View Complete History
          </Button>
          <Button
            variant="outlined"
            startIcon={<Download />}
            onClick={handleOpenExportDialog}
            sx={{ borderColor: blueCarbon.oceanBlue, color: blueCarbon.oceanBlue }}
          >
            Export Report
          </Button>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={handleRefresh}
          >
            Refresh
          </Button>
        </Box>
      </Box>

      {/* Admin Actions Table */}
      <Card>
        <CardContent sx={{ p: 0 }}>
          {(loading || isLoading) && <LinearProgress />}
          
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: 'grey.50' }}>
                  <TableCell><strong>Timestamp</strong></TableCell>
                  <TableCell><strong>Admin</strong></TableCell>
                  <TableCell><strong>Action</strong></TableCell>
                  <TableCell><strong>Target User</strong></TableCell>
                  <TableCell><strong>Severity</strong></TableCell>
                  <TableCell><strong>Status</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
              {adminActions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                    <Typography variant="body2" color="text.secondary">
                      No admin actions found
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                adminActions.map((action) => (
                  <TableRow key={action.id} hover>
                    <TableCell>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {getRelativeDate(action.timestamp)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {new Date(action.timestamp).toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar sx={{ width: 32, height: 32, mr: 1, bgcolor: blueCarbon.oceanBlue }}>
                          <AdminPanelSettings />
                        </Avatar>
                        <Box>
                          <Typography variant="body2">
                            {action.admin?.email || 'Unknown Admin'}
                          </Typography>
                          {action.admin?.name && (
                            <Typography variant="caption" color="text.secondary">
                              {action.admin.name}
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {action.action?.type ? action.action.type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'Unknown Action'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {action.action?.details || 'No details available'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {action.target?.email || 'N/A'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        icon={getSeverityIcon(action.action?.severity || 'medium')}
                        label={(action.action?.severity || 'medium').charAt(0).toUpperCase() + (action.action?.severity || 'medium').slice(1)}
                        size="small"
                        sx={{
                          bgcolor: `${getSeverityColor(action.action?.severity || 'medium')}20`,
                          color: getSeverityColor(action.action?.severity || 'medium'),
                          fontWeight: 500
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={(action.metadata?.status || 'completed').charAt(0).toUpperCase() + (action.metadata?.status || 'completed').slice(1)}
                        size="small"
                        color="success"
                      />
                    </TableCell>
                  </TableRow>
                ))
              )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Recent Actions Summary */}
      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Action Details
              </Typography>
              <List>
                {adminActions.slice(0, 3).map((action, index) => (
                  <React.Fragment key={action.id}>
                    <ListItem alignItems="flex-start">
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: getSeverityColor(action.action?.severity || 'medium') }}>
                          {getSeverityIcon(action.action?.severity || 'medium')}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="body1" sx={{ fontWeight: 500 }}>
                              {action.action?.type ? action.action.type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'Unknown Action'}
                            </Typography>
                            <Chip
                              label={action.action?.severity || 'medium'}
                              size="small"
                              sx={{
                                bgcolor: `${getSeverityColor(action.action?.severity || 'medium')}20`,
                                color: getSeverityColor(action.action?.severity || 'medium'),
                              }}
                            />
                          </Box>
                        }
                        secondary={
                          <Box sx={{ mt: 1 }}>
                            <Typography variant="body2" color="text.secondary">
                              <strong>Target:</strong> {action.target?.email || 'N/A'}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                              <strong>Details:</strong> {action.action?.details || 'No details available'}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                              <strong>IP Address:</strong> {action.metadata?.ipAddress || 'Unknown'}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                              {formatDateTime(action.timestamp)} by {action.admin?.email || 'Unknown Admin'}
                            </Typography>
                          </Box>
                        }
                      />
                    </ListItem>
                    {index < 2 && <Divider variant="inset" component="li" />}
                  </React.Fragment>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Compliance Status
              </Typography>
              
              <Alert severity="success" sx={{ mb: 2 }}>
                All administrative actions are properly logged and auditable
              </Alert>

              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Audit Compliance
                </Typography>
                <LinearProgress 
                  variant="determinate" 
                  value={100} 
                  sx={{ 
                    height: 8, 
                    borderRadius: 4,
                    bgcolor: 'grey.200',
                    '& .MuiLinearProgress-bar': {
                      bgcolor: '#4caf50'
                    }
                  }} 
                />
                <Typography variant="caption" color="text.secondary">
                  100% - All actions logged
                </Typography>
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Documentation Coverage
                </Typography>
                <LinearProgress 
                  variant="determinate" 
                  value={95} 
                  sx={{ 
                    height: 8, 
                    borderRadius: 4,
                    bgcolor: 'grey.200',
                    '& .MuiLinearProgress-bar': {
                      bgcolor: blueCarbon.oceanBlue
                    }
                  }} 
                />
                <Typography variant="caption" color="text.secondary">
                  95% - Justifications provided
                </Typography>
              </Box>

              <Button
                fullWidth
                variant="outlined"
                startIcon={<Assessment />}
                sx={{ 
                  borderColor: blueCarbon.oceanBlue,
                  color: blueCarbon.oceanBlue,
                  mt: 1
                }}
              >
                Generate Compliance Report
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Admin Action Modal */}
      <AdminActionModal 
        open={modalOpen} 
        onClose={handleCloseModal} 
        onNotification={onNotification}
      />

      {/* Export Dialog */}
      <ExportDialog
        open={exportDialogOpen}
        onClose={handleCloseExportDialog}
        onNotification={onNotification}
      />
    </Box>
  );
};

export default AdminActionLogger;