import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  Avatar,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
  Paper,
  Tooltip,
  LinearProgress,
} from '@mui/material';
import {
  History,
  Search,
  FilterList,
  Download,
  Visibility,
  Security,
  Warning,
  CheckCircle,
  Error,
  Info,
  Block,
  Login,
  Logout,
  Edit,
  Delete,
  Add,
  Refresh,
} from '@mui/icons-material';
import { blueCarbon } from '../../../theme/colors';

const AuditTrailViewer = ({ users, onNotification, loading }) => {
  const [auditLogs, setAuditLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [filters, setFilters] = useState({
    action: 'all',
    user: 'all',
    status: 'all',
    dateRange: 'all'
  });
  const [selectedLog, setSelectedLog] = useState(null);
  const [detailsDialog, setDetailsDialog] = useState(false);

  // Mock audit log data
  React.useEffect(() => {
    const mockLogs = [
      {
        id: '1',
        timestamp: new Date(),
        userId: '1',
        userEmail: 'tata@company.com',
        action: 'User Login',
        resource: 'Authentication',
        details: 'Successful login from Chrome browser',
        ipAddress: '192.168.1.100',
        userAgent: 'Chrome/91.0.4472.124',
        status: 'success',
        sessionId: 'sess_123456'
      },
      // Add more mock data...
    ];
    setAuditLogs(mockLogs);
    setFilteredLogs(mockLogs);
  }, []);

  const getActionIcon = (action) => {
    const actionLower = action.toLowerCase();
    if (actionLower.includes('login')) return <Login />;
    if (actionLower.includes('logout')) return <Logout />;
    if (actionLower.includes('edit') || actionLower.includes('update')) return <Edit />;
    if (actionLower.includes('delete')) return <Delete />;
    if (actionLower.includes('create') || actionLower.includes('add')) return <Add />;
    if (actionLower.includes('block') || actionLower.includes('suspend')) return <Block />;
    return <History />;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'success': return '#4caf50';
      case 'warning': return '#ff9800';
      case 'error': return '#f44336';
      default: return blueCarbon.oceanBlue;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success': return <CheckCircle />;
      case 'warning': return <Warning />;
      case 'error': return <Error />;
      default: return <Info />;
    }
  };

  const formatDateTime = (date) => {
    return new Date(date).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const handleViewDetails = (log) => {
    setSelectedLog(log);
    setDetailsDialog(true);
  };

  const handleExportLogs = () => {
    onNotification('Exporting audit logs...', 'info');
    // In production, this would generate and download the audit report
    setTimeout(() => {
      onNotification('Audit logs exported successfully', 'success');
    }, 2000);
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 600, color: blueCarbon.deepOcean, mb: 1 }}>
          Activity & Audit Trail
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Monitor user activities and system events with comprehensive audit logging
        </Typography>
      </Box>

      {/* Controls */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                placeholder="Search audit logs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />,
                }}
              />
            </Grid>
            <Grid item xs={12} md={2}>
              <FormControl fullWidth>
                <InputLabel>Action</InputLabel>
                <Select
                  value={filters.action}
                  label="Action"
                  onChange={(e) => setFilters({ ...filters, action: e.target.value })}
                >
                  <MenuItem value="all">All Actions</MenuItem>
                  <MenuItem value="login">Login</MenuItem>
                  <MenuItem value="logout">Logout</MenuItem>
                  <MenuItem value="edit">Edit</MenuItem>
                  <MenuItem value="delete">Delete</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={filters.status}
                  label="Status"
                  onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                >
                  <MenuItem value="all">All Status</MenuItem>
                  <MenuItem value="success">Success</MenuItem>
                  <MenuItem value="warning">Warning</MenuItem>
                  <MenuItem value="error">Error</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  variant="outlined"
                  startIcon={<Download />}
                  onClick={handleExportLogs}
                  sx={{ borderColor: blueCarbon.oceanBlue, color: blueCarbon.oceanBlue }}
                >
                  Export
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<Refresh />}
                  onClick={() => onNotification('Refreshing audit logs...', 'info')}
                >
                  Refresh
                </Button>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Audit Logs Table */}
      <Card>
        <CardContent sx={{ p: 0 }}>
          {loading && <LinearProgress />}
          
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: 'grey.50' }}>
                  <TableCell><strong>Timestamp</strong></TableCell>
                  <TableCell><strong>User</strong></TableCell>
                  <TableCell><strong>Action</strong></TableCell>
                  <TableCell><strong>Resource</strong></TableCell>
                  <TableCell><strong>Status</strong></TableCell>
                  <TableCell><strong>IP Address</strong></TableCell>
                  <TableCell><strong>Actions</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredLogs.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((log) => (
                  <TableRow key={log.id} hover>
                    <TableCell>
                      <Typography variant="body2">
                        {formatDateTime(log.timestamp)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar sx={{ width: 32, height: 32, mr: 1, bgcolor: blueCarbon.oceanBlue }}>
                          {log.userEmail.charAt(0).toUpperCase()}
                        </Avatar>
                        <Typography variant="body2">
                          {log.userEmail}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        {getActionIcon(log.action)}
                        <Typography variant="body2" sx={{ ml: 1 }}>
                          {log.action}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {log.resource}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        icon={getStatusIcon(log.status)}
                        label={log.status.charAt(0).toUpperCase() + log.status.slice(1)}
                        size="small"
                        sx={{
                          bgcolor: `${getStatusColor(log.status)}20`,
                          color: getStatusColor(log.status),
                          fontWeight: 500
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                        {log.ipAddress}
                      </Typography>
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
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            rowsPerPageOptions={[5, 10, 25, 50]}
            component="div"
            count={filteredLogs.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={(e, newPage) => setPage(newPage)}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(parseInt(e.target.value, 10));
              setPage(0);
            }}
          />
        </CardContent>
      </Card>

      {/* Log Details Dialog */}
      <Dialog 
        open={detailsDialog} 
        onClose={() => setDetailsDialog(false)} 
        maxWidth="md" 
        fullWidth
      >
        <DialogTitle>
          Audit Log Details
        </DialogTitle>
        <DialogContent>
          {selectedLog && (
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Alert 
                  severity={selectedLog.status === 'success' ? 'success' : 
                           selectedLog.status === 'warning' ? 'warning' : 'error'}
                  sx={{ mb: 2 }}
                >
                  {selectedLog.action} - {selectedLog.status.toUpperCase()}
                </Alert>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" gutterBottom>
                  <strong>Timestamp:</strong>
                </Typography>
                <Typography variant="body2" sx={{ mb: 2 }}>
                  {formatDateTime(selectedLog.timestamp)}
                </Typography>

                <Typography variant="subtitle2" gutterBottom>
                  <strong>User:</strong>
                </Typography>
                <Typography variant="body2" sx={{ mb: 2 }}>
                  {selectedLog.userEmail}
                </Typography>

                <Typography variant="subtitle2" gutterBottom>
                  <strong>Action:</strong>
                </Typography>
                <Typography variant="body2" sx={{ mb: 2 }}>
                  {selectedLog.action}
                </Typography>
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" gutterBottom>
                  <strong>IP Address:</strong>
                </Typography>
                <Typography variant="body2" sx={{ mb: 2, fontFamily: 'monospace' }}>
                  {selectedLog.ipAddress}
                </Typography>

                <Typography variant="subtitle2" gutterBottom>
                  <strong>User Agent:</strong>
                </Typography>
                <Typography variant="body2" sx={{ mb: 2, fontSize: '0.8rem' }}>
                  {selectedLog.userAgent}
                </Typography>

                <Typography variant="subtitle2" gutterBottom>
                  <strong>Session ID:</strong>
                </Typography>
                <Typography variant="body2" sx={{ mb: 2, fontFamily: 'monospace' }}>
                  {selectedLog.sessionId}
                </Typography>
              </Grid>

              <Grid item xs={12}>
                <Typography variant="subtitle2" gutterBottom>
                  <strong>Details:</strong>
                </Typography>
                <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                  <Typography variant="body2">
                    {selectedLog.details}
                  </Typography>
                </Paper>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailsDialog(false)}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AuditTrailViewer;