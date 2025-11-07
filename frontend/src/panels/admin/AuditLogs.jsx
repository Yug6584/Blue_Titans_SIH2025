import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Button,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Pagination,
  Tooltip,
  Alert,
  Snackbar,
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Badge,
  LinearProgress,
  Tabs,
  Tab,
  Switch,
  FormControlLabel,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Avatar,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  History,
  FilterList,
  Search,
  Download,
  Refresh,
  Visibility,
  ExpandMore,
  TrendingUp,
  Security,
  Person,
  Warning,
  CheckCircle,
  Error,
  Info,
  Clear,
  GetApp,
  Assessment,
  LocationOn,
  Computer,
  AccessTime,
  VpnKey,
  VerifiedUser,
  AdminPanelSettings,
  BusinessCenter,
  AccountBalance,
  Close,
  Block
} from '@mui/icons-material';
import { blueCarbon } from '../../theme/colors';

const AuditLogs = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState(null);
  const [securityEvents, setSecurityEvents] = useState([]);
  const [loginActivities, setLoginActivities] = useState([]);
  const [filterOptions, setFilterOptions] = useState({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  
  // Pagination
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 50,
    total: 0,
    pages: 0
  });

  // Filters
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    userId: '',
    actionType: '',
    resourceType: '',
    severity: '',
    status: '',
    search: ''
  });

  // UI State
  const [selectedLog, setSelectedLog] = useState(null);
  const [detailDialog, setDetailDialog] = useState(false);
  const [exportDialog, setExportDialog] = useState(false);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'info' });
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [filtersExpanded, setFiltersExpanded] = useState(false);
  const [realTimeEnabled, setRealTimeEnabled] = useState(false);
  
  // Security Event Management State
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [examineDialogOpen, setExamineDialogOpen] = useState(false);
  const [securityEventFilter, setSecurityEventFilter] = useState('active');

  useEffect(() => {
    loadAuditLogs();
    loadFilterOptions();
    loadAuditStats();
    loadSecurityEvents();
    loadLoginActivities();
  }, [pagination.page, pagination.limit, filters]);

  useEffect(() => {
    let interval;
    if (autoRefresh) {
      interval = setInterval(() => {
        loadAuditLogs(true);
        loadAuditStats();
        loadSecurityEvents();
        loadLoginActivities();
      }, 30000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh, filters]);

  const loadAuditLogs = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      setRefreshing(true);

      const queryParams = new URLSearchParams({
        page: pagination.page,
        limit: pagination.limit,
        ...Object.fromEntries(
          Object.entries(filters).filter(([_, value]) => value !== '')
        )
      });

      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8000/api/audit/logs?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch audit logs');
      }

      const data = await response.json();
      
      if (data.success) {
        setLogs(data.logs);
        setPagination(prev => ({
          ...prev,
          total: data.pagination.total,
          pages: data.pagination.pages
        }));
      } else {
        throw new Error(data.message || 'Failed to load audit logs');
      }
    } catch (error) {
      console.error('Error loading audit logs:', error);
      showNotification('Failed to load audit logs: ' + error.message, 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const loadAuditStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8000/api/audit/stats?timeframe=7d', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setStats(data.stats);
        }
      }
    } catch (error) {
      console.error('Error loading audit stats:', error);
    }
  };

  const loadSecurityEvents = async () => {
    await loadSecurityEventsWithFilter(securityEventFilter);
  };

  const loadLoginActivities = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8000/api/audit/login-activities?limit=20', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setLoginActivities(data.activities);
        }
      }
    } catch (error) {
      console.error('Error loading login activities:', error);
    }
  };

  const loadFilterOptions = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8000/api/audit/filters', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setFilterOptions(data.options);
        }
      }
    } catch (error) {
      console.error('Error loading filter options:', error);
    }
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  // Security Event Action Handlers
  const handleExamineEvent = (event) => {
    setSelectedEvent(event);
    setExamineDialogOpen(true);
  };

  const handleResolveEvent = async (event) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8000/api/audit/security-events/${event.id}/resolve`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          resolution_notes: 'Marked as resolved by administrator',
          resolved_by: 'admin'
        })
      });

      if (response.ok) {
        // Remove the resolved event from the display
        setSecurityEvents(prevEvents => 
          prevEvents.filter(e => e.id !== event.id)
        );
        showNotification('Security event resolved and removed from active list', 'success');
      } else {
        showNotification('Failed to resolve security event', 'error');
      }
    } catch (error) {
      console.error('Error resolving security event:', error);
      showNotification('Error resolving security event', 'error');
    }
  };

  const handleReopenEvent = async (event) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8000/api/audit/security-events/${event.id}/reopen`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          reopen_reason: 'Reopened for further investigation'
        })
      });

      if (response.ok) {
        showNotification('Security event reopened', 'info');
        loadSecurityEvents();
      } else {
        showNotification('Failed to reopen security event', 'error');
      }
    } catch (error) {
      console.error('Error reopening security event:', error);
      showNotification('Error reopening security event', 'error');
    }
  };

  const handleBlockSource = async (event) => {
    if (window.confirm(`Are you sure you want to block IP address ${event.ip_address}? This will also remove the event from the active list.`)) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:8000/api/audit/security-events/${event.id}/block-ip`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            ip_address: event.ip_address,
            block_reason: `Blocked due to security event: ${event.event_type}`
          })
        });

        if (response.ok) {
          // Remove the event from display after blocking IP
          setSecurityEvents(prevEvents => 
            prevEvents.filter(e => e.id !== event.id)
          );
          showNotification(`IP address ${event.ip_address} blocked and event removed from active list`, 'success');
        } else {
          showNotification('Failed to block IP address', 'error');
        }
      } catch (error) {
        console.error('Error blocking IP:', error);
        showNotification('Error blocking IP address', 'error');
      }
    }
  };

  const handleExportEvent = (event) => {
    const eventData = {
      id: event.id,
      event_type: event.event_type,
      user_email: event.user_email,
      ip_address: event.ip_address,
      threat_level: event.threat_level,
      severity: event.severity,
      status: event.status,
      event_data: event.event_data,
      created_at: event.created_at,
      user_agent: event.user_agent
    };

    const dataStr = JSON.stringify(eventData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `security_event_${event.id}_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    showNotification('Security event exported successfully', 'success');
  };

  const handleDeleteEvent = async (event) => {
    if (window.confirm('Are you sure you want to delete this security event? This action cannot be undone.')) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:8000/api/audit/security-events/${event.id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          // Remove the deleted event from display immediately
          setSecurityEvents(prevEvents => 
            prevEvents.filter(e => e.id !== event.id)
          );
          showNotification('Security event deleted successfully', 'success');
        } else {
          showNotification('Failed to delete security event', 'error');
        }
      } catch (error) {
        console.error('Error deleting security event:', error);
        showNotification('Error deleting security event', 'error');
      }
    }
  };



  const clearFilters = () => {
    setFilters({
      startDate: '',
      endDate: '',
      userId: '',
      actionType: '',
      resourceType: '',
      severity: '',
      status: '',
      search: ''
    });
  };

  const handlePageChange = (event, newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  const handleViewDetails = (log) => {
    setSelectedLog(log);
    setDetailDialog(true);
  };

  const handleExport = async (format) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8000/api/audit/export', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          format,
          startDate: filters.startDate,
          endDate: filters.endDate,
          filters: Object.fromEntries(
            Object.entries(filters).filter(([_, value]) => value !== '')
          )
        })
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `audit_logs_${new Date().toISOString().split('T')[0]}.${format}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        showNotification('Audit logs exported successfully', 'success');
        setExportDialog(false);
      } else {
        throw new Error('Export failed');
      }
    } catch (error) {
      showNotification('Failed to export audit logs: ' + error.message, 'error');
    }
  };

  const showNotification = (message, severity = 'info') => {
    setNotification({ open: true, message, severity });
  };

  const handleSecurityEventFilter = (filterType) => {
    setSecurityEventFilter(filterType);
    // Reload security events with new filter
    loadSecurityEventsWithFilter(filterType);
  };

  const loadSecurityEventsWithFilter = async (filterType = 'active') => {
    try {
      const token = localStorage.getItem('token');
      let url = 'http://localhost:8000/api/audit/security?limit=50';
      
      if (filterType === 'resolved') {
        url += '&status=resolved';
      } else if (filterType === 'blocked') {
        url += '&status=blocked';
      } else if (filterType === 'all') {
        // Don't add status filter to get all events
      } else {
        // Default to active only
        url += '&status=active';
      }

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setSecurityEvents(data.events);
        }
      }
    } catch (error) {
      console.error('Error loading security events:', error);
    }
  };

  const getSeverityColor = (severity) => {
    const colors = {
      critical: 'error',
      high: 'warning',
      medium: 'info',
      low: 'default',
      info: 'success'
    };
    return colors[severity] || 'default';
  };

  const getSeverityIcon = (severity) => {
    const icons = {
      critical: <Error />,
      high: <Warning />,
      medium: <Info />,
      low: <CheckCircle />,
      info: <CheckCircle />
    };
    return icons[severity] || <Info />;
  };

  const getActionIcon = (actionType) => {
    const icons = {
      user_login: <Person />,
      user_logout: <Person />,
      user_create: <Person />,
      user_update: <Person />,
      user_delete: <Person />,
      system_settings_change: <AdminPanelSettings />,
      data_export: <GetApp />,
      security_event: <Security />,
      failed_login_attempt: <Block />
    };
    return icons[actionType] || <History />;
  };

  const getUserRoleIcon = (role) => {
    const icons = {
      admin: <AdminPanelSettings />,
      company: <BusinessCenter />,
      government: <AccountBalance />
    };
    return icons[role] || <Person />;
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };

  const renderStatsCard = (title, value, icon, color = 'primary', subtitle = '') => (
    <Card sx={{ height: '100%', position: 'relative', overflow: 'visible' }}>
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

  const renderFilters = () => (
    <Accordion 
      expanded={filtersExpanded} 
      onChange={() => setFiltersExpanded(!filtersExpanded)}
      sx={{ mb: 2 }}
    >
      <AccordionSummary expandIcon={<ExpandMore />}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <FilterList sx={{ mr: 1 }} />
          <Typography>Advanced Filters</Typography>
          {Object.values(filters).some(v => v !== '') && (
            <Badge color="primary" variant="dot" sx={{ ml: 1 }} />
          )}
        </Box>
      </AccordionSummary>
      <AccordionDetails>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              size="small"
              label="Start Date"
              type="date"
              value={filters.startDate}
              onChange={(e) => handleFilterChange('startDate', e.target.value)}
              InputLabelProps={{
                shrink: true,
              }}
            />
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              size="small"
              label="End Date"
              type="date"
              value={filters.endDate}
              onChange={(e) => handleFilterChange('endDate', e.target.value)}
              InputLabelProps={{
                shrink: true,
              }}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Action Type</InputLabel>
              <Select
                value={filters.actionType}
                onChange={(e) => handleFilterChange('actionType', e.target.value)}
                label="Action Type"
              >
                <MenuItem value="">All</MenuItem>
                {filterOptions.actionTypes?.map(type => (
                  <MenuItem key={type} value={type}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      {getActionIcon(type)}
                      <Typography sx={{ ml: 1 }}>
                        {type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </Typography>
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Severity</InputLabel>
              <Select
                value={filters.severity}
                onChange={(e) => handleFilterChange('severity', e.target.value)}
                label="Severity"
              >
                <MenuItem value="">All</MenuItem>
                {filterOptions.severityLevels?.map(level => (
                  <MenuItem key={level} value={level}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      {getSeverityIcon(level)}
                      <Typography sx={{ ml: 1, textTransform: 'capitalize' }}>
                        {level}
                      </Typography>
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <TextField
              fullWidth
              size="small"
              label="Search"
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              InputProps={{
                startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />
              }}
              placeholder="Search users, actions, resources..."
            />
          </Grid>

          <Grid item xs={12} sm={6} md={2}>
            <Button
              fullWidth
              variant="outlined"
              onClick={clearFilters}
              startIcon={<Clear />}
              sx={{ height: '40px' }}
            >
              Clear Filters
            </Button>
          </Grid>
        </Grid>
      </AccordionDetails>
    </Accordion>
  );

  const renderAuditLogsTab = () => (
    <>
      {/* Statistics Cards */}
      {stats && (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            {renderStatsCard(
              'Total Events',
              stats.totalEvents || 0,
              <TrendingUp />,
              'primary',
              'Last 7 days'
            )}
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            {renderStatsCard(
              'Critical Events',
              stats.criticalEvents || 0,
              <Error />,
              'error',
              `${stats.criticalRate || 0}% of total`
            )}
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            {renderStatsCard(
              'Success Rate',
              `${stats.successRate || 100}%`,
              <CheckCircle />,
              'success',
              'System reliability'
            )}
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            {renderStatsCard(
              'Risk Score',
              `${stats.riskScore || 0}/10`,
              <Security />,
              stats.riskScore >= 7 ? 'error' : stats.riskScore >= 4 ? 'warning' : 'success',
              'System security'
            )}
          </Grid>
        </Grid>
      )}

      {/* Filters */}
      {renderFilters()}

      {/* Audit Logs Table */}
      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        {refreshing && <LinearProgress />}
        
        <TableContainer sx={{ maxHeight: 600 }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>Timestamp</TableCell>
                <TableCell>User</TableCell>
                <TableCell>Action</TableCell>
                <TableCell>Resource</TableCell>
                <TableCell>Severity</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>IP Address</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : logs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    <Typography variant="body1" color="text.secondary">
                      No audit logs found
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                logs.map((log) => (
                  <TableRow key={log.id} hover>
                    <TableCell>
                      <Box>
                        <Typography variant="body2">
                          {formatTimestamp(log.created_at)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {log.time_ago}
                        </Typography>
                      </Box>
                    </TableCell>
                    
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        {getUserRoleIcon(log.user_role)}
                        <Box sx={{ ml: 1 }}>
                          <Typography variant="body2">
                            {log.user_name || 'Unknown'}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {log.user_email}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        {getActionIcon(log.action_type)}
                        <Typography variant="body2" sx={{ ml: 1 }}>
                          {log.action_type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </Typography>
                      </Box>
                    </TableCell>
                    
                    <TableCell>
                      <Box>
                        <Typography variant="body2">
                          {log.resource_name || log.resource_type || 'N/A'}
                        </Typography>
                        {log.resource_id && (
                          <Typography variant="caption" color="text.secondary">
                            ID: {log.resource_id}
                          </Typography>
                        )}
                      </Box>
                    </TableCell>
                    
                    <TableCell>
                      <Chip
                        icon={getSeverityIcon(log.severity)}
                        label={log.severity.toUpperCase()}
                        color={getSeverityColor(log.severity)}
                        size="small"
                      />
                    </TableCell>
                    
                    <TableCell>
                      <Chip
                        label={log.status.toUpperCase()}
                        color={log.status === 'success' ? 'success' : 'error'}
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                    
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <LocationOn sx={{ fontSize: 16, mr: 0.5, color: 'text.secondary' }} />
                        <Typography variant="body2">
                          {log.ip_address}
                        </Typography>
                      </Box>
                    </TableCell>
                    
                    <TableCell>
                      <Tooltip title="View Details">
                        <IconButton
                          size="small"
                          onClick={() => handleViewDetails(log)}
                        >
                          <Visibility />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
            <Pagination
              count={pagination.pages}
              page={pagination.page}
              onChange={handlePageChange}
              color="primary"
              showFirstButton
              showLastButton
            />
          </Box>
        )}
      </Paper>
    </>
  );  const 
renderSecurityEventsTab = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">
            Security Events & Threat Analysis
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant={securityEventFilter === 'active' ? 'contained' : 'outlined'}
              size="small"
              onClick={() => handleSecurityEventFilter('active')}
              color="primary"
            >
              Active Only
            </Button>
            <Button
              variant={securityEventFilter === 'resolved' ? 'contained' : 'outlined'}
              size="small"
              onClick={() => handleSecurityEventFilter('resolved')}
              color="success"
            >
              Resolved
            </Button>
            <Button
              variant={securityEventFilter === 'all' ? 'contained' : 'outlined'}
              size="small"
              onClick={() => handleSecurityEventFilter('all')}
              color="info"
            >
              All Events
            </Button>
          </Box>
        </Box>
      </Grid>
      
      {securityEvents.map((event) => (
        <Grid item xs={12} key={event.id}>
          <Card sx={{ 
            border: event.threat_level >= 8 ? '2px solid' : '1px solid',
            borderColor: event.threat_level >= 8 ? 'error.main' : 'divider'
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Avatar sx={{ 
                    bgcolor: event.threat_level >= 8 ? 'error.main' : 'warning.main',
                    mr: 2 
                  }}>
                    <Security />
                  </Avatar>
                  <Box>
                    <Typography variant="h6">
                      {event.event_type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {formatTimestamp(event.created_at)} • {event.time_ago}
                    </Typography>
                  </Box>
                </Box>
                
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  <Chip
                    label={`Threat Level: ${event.threat_level}/10`}
                    color={event.threat_level >= 8 ? 'error' : event.threat_level >= 5 ? 'warning' : 'info'}
                    size="small"
                  />
                  <Chip
                    label={event.status.toUpperCase()}
                    color={event.status === 'active' ? 'error' : 'success'}
                    size="small"
                    variant="outlined"
                  />
                </Box>
              </Box>

              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" gutterBottom>
                    Event Details
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Person sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                    <Typography variant="body2">
                      {event.user_email || 'Unknown User'}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <LocationOn sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                    <Typography variant="body2">
                      {event.ip_address}
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" gutterBottom>
                    Event Data
                  </Typography>
                  <Box sx={{ 
                    bgcolor: 'grey.50', 
                    p: 1, 
                    borderRadius: 1,
                    maxHeight: 100,
                    overflow: 'auto'
                  }}>
                    <pre style={{ margin: 0, fontSize: '0.75rem' }}>
                      {JSON.stringify(event.event_data, null, 2)}
                    </pre>
                  </Box>
                </Grid>
              </Grid>

              {event.requires_immediate_action && (
                <Alert severity="error" sx={{ mt: 2 }}>
                  <strong>Immediate Action Required:</strong> This is a critical security threat that needs immediate attention.
                </Alert>
              )}

              {/* Security Event Action Buttons */}
              <Box sx={{ 
                display: 'flex', 
                gap: 1, 
                mt: 2, 
                pt: 2, 
                borderTop: '1px solid',
                borderColor: 'divider',
                flexWrap: 'wrap'
              }}>
                <Button
                  variant="contained"
                  size="small"
                  startIcon={<Visibility />}
                  onClick={() => handleExamineEvent(event)}
                  sx={{ 
                    bgcolor: 'primary.main',
                    '&:hover': { bgcolor: 'primary.dark' }
                  }}
                >
                  Examine
                </Button>
                
                {event.status === 'active' && (
                  <Button
                    variant="contained"
                    size="small"
                    startIcon={<CheckCircle />}
                    onClick={() => handleResolveEvent(event)}
                    sx={{ 
                      bgcolor: 'success.main',
                      '&:hover': { bgcolor: 'success.dark' }
                    }}
                  >
                    Mark Resolved
                  </Button>
                )}
                
                {event.status === 'resolved' && (
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<Warning />}
                    onClick={() => handleReopenEvent(event)}
                    sx={{ 
                      borderColor: 'warning.main',
                      color: 'warning.main',
                      '&:hover': { 
                        borderColor: 'warning.dark',
                        bgcolor: 'warning.light'
                      }
                    }}
                  >
                    Reopen
                  </Button>
                )}
                
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<Block />}
                  onClick={() => handleBlockSource(event)}
                  color="warning"
                >
                  Block IP
                </Button>
                
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<Download />}
                  onClick={() => handleExportEvent(event)}
                  color="info"
                >
                  Export
                </Button>
                
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<Clear />}
                  onClick={() => handleDeleteEvent(event)}
                  color="error"
                  sx={{ ml: 'auto' }}
                >
                  Delete
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      ))}
      
      {securityEvents.length === 0 && (
        <Grid item xs={12}>
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 4 }}>
              <Security sx={{ fontSize: 48, color: 'success.main', mb: 2 }} />
              <Typography variant="h6" color="success.main">
                No Active Security Threats
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                All security events have been resolved, blocked, or no threats detected.
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Resolved and blocked events are hidden from this view. Use filters to view historical events.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      )}
    </Grid>
  );

  const renderLoginActivitiesTab = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant="h6" gutterBottom>
          Login Activities & Authentication Patterns
        </Typography>
      </Grid>
      
      <Grid item xs={12}>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Timestamp</TableCell>
                <TableCell>User</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>IP Address</TableCell>
                <TableCell>MFA</TableCell>
                <TableCell>Session Duration</TableCell>
                <TableCell>Risk Indicators</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loginActivities.map((activity) => (
                <TableRow key={activity.id}>
                  <TableCell>
                    <Box>
                      <Typography variant="body2">
                        {formatTimestamp(activity.login_timestamp)}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {activity.time_ago}
                      </Typography>
                    </Box>
                  </TableCell>
                  
                  <TableCell>
                    <Typography variant="body2">
                      {activity.email}
                    </Typography>
                  </TableCell>
                  
                  <TableCell>
                    <Chip
                      label={activity.login_status.toUpperCase()}
                      color={activity.login_status === 'success' ? 'success' : 'error'}
                      size="small"
                    />
                    {activity.failure_reason && (
                      <Typography variant="caption" display="block" color="error">
                        {activity.failure_reason}
                      </Typography>
                    )}
                  </TableCell>
                  
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <LocationOn sx={{ fontSize: 16, mr: 0.5, color: 'text.secondary' }} />
                      <Typography variant="body2">
                        {activity.ip_address}
                      </Typography>
                    </Box>
                  </TableCell>
                  
                  <TableCell>
                    <Chip
                      icon={activity.mfa_used ? <VerifiedUser /> : <VpnKey />}
                      label={activity.mfa_used ? 'Used' : 'Not Used'}
                      color={activity.mfa_used ? 'success' : 'warning'}
                      size="small"
                      variant="outlined"
                    />
                  </TableCell>
                  
                  <TableCell>
                    {activity.session_duration_formatted ? (
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <AccessTime sx={{ fontSize: 16, mr: 0.5, color: 'text.secondary' }} />
                        <Typography variant="body2">
                          {activity.session_duration_formatted}
                        </Typography>
                      </Box>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        N/A
                      </Typography>
                    )}
                  </TableCell>
                  
                  <TableCell>
                    {activity.risk_indicators?.length > 0 ? (
                      <Box>
                        {activity.risk_indicators.map((risk, index) => (
                          <Chip
                            key={index}
                            label={risk}
                            color="warning"
                            size="small"
                            sx={{ mr: 0.5, mb: 0.5 }}
                          />
                        ))}
                      </Box>
                    ) : (
                      <Chip
                        label="Low Risk"
                        color="success"
                        size="small"
                        variant="outlined"
                      />
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
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
            <History sx={{ mr: 2, fontSize: { xs: '1.5rem', md: '2rem' } }} />
            Audit Logs
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Comprehensive system activity tracking and compliance monitoring
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
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
            label="Real-time"
            sx={{ mr: 2 }}
          />
          
          <Tooltip title="Refresh Data">
            <IconButton 
              onClick={() => loadAuditLogs()} 
              disabled={refreshing}
              size={isMobile ? 'small' : 'medium'}
            >
              <Refresh />
            </IconButton>
          </Tooltip>
          
          <Button
            variant="outlined"
            startIcon={<Download />}
            onClick={() => setExportDialog(true)}
            size={isMobile ? 'small' : 'medium'}
          >
            Export
          </Button>
        </Box>
      </Box>

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={(e, newValue) => setActiveTab(newValue)}
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label="Audit Logs" icon={<History />} />
          <Tab label="Statistics" icon={<Assessment />} />
          <Tab label="Security Events" icon={<Security />} />
          <Tab label="Login Activities" icon={<Person />} />
        </Tabs>
      </Paper>

      {/* Tab Content */}
      {activeTab === 0 && renderAuditLogsTab()}
      {activeTab === 1 && (
        <Grid container spacing={3}>
          {stats && (
            <>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  System Overview (Last 7 Days)
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                {renderStatsCard('Total Events', stats.totalEvents || 0, <Assessment />, 'primary')}
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                {renderStatsCard('Security Events', stats.securityEvents || 0, <Security />, 'warning')}
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                {renderStatsCard('Failed Events', stats.failedEvents || 0, <Error />, 'error')}
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                {renderStatsCard('Success Rate', `${stats.successRate || 100}%`, <CheckCircle />, 'success')}
              </Grid>

              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Events by Severity
                    </Typography>
                    <List>
                      {stats.eventsBySeverity?.map((item) => (
                        <ListItem key={item.severity}>
                          <ListItemIcon>
                            {getSeverityIcon(item.severity)}
                          </ListItemIcon>
                          <ListItemText
                            primary={item.severity.toUpperCase()}
                            secondary={`${item.count} events`}
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
                      Top Actions
                    </Typography>
                    <List>
                      {stats.topActions?.slice(0, 5).map((item) => (
                        <ListItem key={item.action_type}>
                          <ListItemIcon>
                            {getActionIcon(item.action_type)}
                          </ListItemIcon>
                          <ListItemText
                            primary={item.action_type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                            secondary={`${item.count} occurrences`}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </CardContent>
                </Card>
              </Grid>
            </>
          )}
        </Grid>
      )}
      {activeTab === 2 && renderSecurityEventsTab()}
      {activeTab === 3 && renderLoginActivitiesTab()}      {/* 
Detail Dialog */}
      <Dialog
        open={detailDialog}
        onClose={() => setDetailDialog(false)}
        maxWidth="md"
        fullWidth
        fullScreen={isMobile}
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">Audit Log Details</Typography>
            <IconButton onClick={() => setDetailDialog(false)}>
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedLog && (
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" gutterBottom>Basic Information</Typography>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2"><strong>ID:</strong> {selectedLog.id}</Typography>
                  <Typography variant="body2"><strong>Timestamp:</strong> {formatTimestamp(selectedLog.created_at)}</Typography>
                  <Typography variant="body2"><strong>User:</strong> {selectedLog.user_name} ({selectedLog.user_email})</Typography>
                  <Typography variant="body2"><strong>Role:</strong> {selectedLog.user_role}</Typography>
                  <Typography variant="body2"><strong>Action:</strong> {selectedLog.action_type}</Typography>
                  <Typography variant="body2"><strong>Resource:</strong> {selectedLog.resource_type}</Typography>
                  <Typography variant="body2"><strong>Status:</strong> {selectedLog.status}</Typography>
                  <Typography variant="body2"><strong>Severity:</strong> {selectedLog.severity}</Typography>
                </Box>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" gutterBottom>Technical Details</Typography>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2"><strong>IP Address:</strong> {selectedLog.ip_address}</Typography>
                  <Typography variant="body2"><strong>Session ID:</strong> {selectedLog.session_id || 'N/A'}</Typography>
                  <Typography variant="body2"><strong>Risk Score:</strong> {selectedLog.risk_score}/10</Typography>
                  {selectedLog.error_message && (
                    <Typography variant="body2" color="error">
                      <strong>Error:</strong> {selectedLog.error_message}
                    </Typography>
                  )}
                </Box>
              </Grid>

              {selectedLog.old_values && (
                <Grid item xs={12}>
                  <Typography variant="subtitle2" gutterBottom>Previous Values</Typography>
                  <Box sx={{ bgcolor: 'grey.50', p: 2, borderRadius: 1, mb: 2 }}>
                    <pre style={{ margin: 0, fontSize: '0.875rem' }}>
                      {JSON.stringify(selectedLog.old_values, null, 2)}
                    </pre>
                  </Box>
                </Grid>
              )}

              {selectedLog.new_values && (
                <Grid item xs={12}>
                  <Typography variant="subtitle2" gutterBottom>New Values</Typography>
                  <Box sx={{ bgcolor: 'grey.50', p: 2, borderRadius: 1, mb: 2 }}>
                    <pre style={{ margin: 0, fontSize: '0.875rem' }}>
                      {JSON.stringify(selectedLog.new_values, null, 2)}
                    </pre>
                  </Box>
                </Grid>
              )}

              {selectedLog.metadata && (
                <Grid item xs={12}>
                  <Typography variant="subtitle2" gutterBottom>Metadata</Typography>
                  <Box sx={{ bgcolor: 'grey.50', p: 2, borderRadius: 1 }}>
                    <pre style={{ margin: 0, fontSize: '0.875rem' }}>
                      {JSON.stringify(selectedLog.metadata, null, 2)}
                    </pre>
                  </Box>
                </Grid>
              )}
            </Grid>
          )}
        </DialogContent>
      </Dialog>

      {/* Security Event Examine Dialog */}
      <Dialog 
        open={examineDialogOpen} 
        onClose={() => setExamineDialogOpen(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">Security Event Analysis</Typography>
            <IconButton onClick={() => setExamineDialogOpen(false)}>
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedEvent && (
            <Grid container spacing={3}>
              {/* Event Overview */}
              <Grid item xs={12}>
                <Card variant="outlined">
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Avatar sx={{ 
                        bgcolor: selectedEvent.threat_level >= 8 ? 'error.main' : 'warning.main',
                        mr: 2 
                      }}>
                        <Security />
                      </Avatar>
                      <Box>
                        <Typography variant="h6">
                          {selectedEvent.event_type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Event ID: {selectedEvent.id} • {formatTimestamp(selectedEvent.created_at)}
                        </Typography>
                      </Box>
                    </Box>
                    
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="subtitle2" gutterBottom>Threat Assessment</Typography>
                        <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                          <Chip
                            label={`Threat Level: ${selectedEvent.threat_level}/10`}
                            color={selectedEvent.threat_level >= 8 ? 'error' : selectedEvent.threat_level >= 5 ? 'warning' : 'info'}
                            size="small"
                          />
                          <Chip
                            label={selectedEvent.severity.toUpperCase()}
                            color={selectedEvent.severity === 'critical' ? 'error' : selectedEvent.severity === 'high' ? 'warning' : 'info'}
                            size="small"
                          />
                        </Box>
                        <Chip
                          label={selectedEvent.status.toUpperCase()}
                          color={selectedEvent.status === 'active' ? 'error' : 'success'}
                          variant="outlined"
                          size="small"
                        />
                      </Grid>
                      
                      <Grid item xs={12} sm={6}>
                        <Typography variant="subtitle2" gutterBottom>Source Information</Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <Person sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                          <Typography variant="body2">
                            {selectedEvent.user_email || 'Unknown User'}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <LocationOn sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                          <Typography variant="body2">
                            {selectedEvent.ip_address}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Computer sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                          <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>
                            {selectedEvent.user_agent || 'Unknown User Agent'}
                          </Typography>
                        </Box>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>

              {/* Event Data */}
              <Grid item xs={12}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle2" gutterBottom>
                      Event Data & Analysis
                    </Typography>
                    <Box sx={{ 
                      bgcolor: 'grey.50', 
                      p: 2, 
                      borderRadius: 1,
                      maxHeight: 300,
                      overflow: 'auto'
                    }}>
                      <pre style={{ margin: 0, fontSize: '0.875rem', whiteSpace: 'pre-wrap' }}>
                        {JSON.stringify(selectedEvent.event_data, null, 2)}
                      </pre>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              {/* Recommended Actions */}
              <Grid item xs={12}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle2" gutterBottom>
                      Recommended Actions
                    </Typography>
                    <List dense>
                      {selectedEvent.threat_level >= 8 && (
                        <ListItem>
                          <ListItemIcon>
                            <Warning color="error" />
                          </ListItemIcon>
                          <ListItemText 
                            primary="Immediate Investigation Required"
                            secondary="This is a high-threat event that requires immediate attention"
                          />
                        </ListItem>
                      )}
                      <ListItem>
                        <ListItemIcon>
                          <Block color="warning" />
                        </ListItemIcon>
                        <ListItemText 
                          primary="Consider IP Blocking"
                          secondary={`Block IP address ${selectedEvent.ip_address} if malicious activity is confirmed`}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon>
                          <Assessment color="info" />
                        </ListItemIcon>
                        <ListItemText 
                          primary="Monitor Related Activity"
                          secondary="Check for similar events from the same source or user"
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon>
                          <CheckCircle color="success" />
                        </ListItemIcon>
                        <ListItemText 
                          primary="Mark as Resolved"
                          secondary="Once investigated and mitigated, mark this event as resolved"
                        />
                      </ListItem>
                    </List>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setExamineDialogOpen(false)}>
            Close
          </Button>
          {selectedEvent && selectedEvent.status === 'active' && (
            <Button 
              variant="contained" 
              onClick={() => {
                handleResolveEvent(selectedEvent);
                setExamineDialogOpen(false);
              }}
              startIcon={<CheckCircle />}
            >
              Mark Resolved
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Export Dialog */}
      <Dialog open={exportDialog} onClose={() => setExportDialog(false)}>
        <DialogTitle>Export Audit Logs</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Choose the format for exporting audit logs. Current filters will be applied.
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, flexDirection: 'column' }}>
            <Button
              variant="outlined"
              startIcon={<GetApp />}
              onClick={() => handleExport('csv')}
              fullWidth
            >
              Export as CSV
            </Button>
            <Button
              variant="outlined"
              startIcon={<GetApp />}
              onClick={() => handleExport('json')}
              fullWidth
            >
              Export as JSON
            </Button>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setExportDialog(false)}>Cancel</Button>
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

export default AuditLogs;