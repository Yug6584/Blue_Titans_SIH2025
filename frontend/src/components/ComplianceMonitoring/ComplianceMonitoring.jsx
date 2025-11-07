// BlueCarbon Ledger - Compliance Monitoring Dashboard
// Government Panel - Post-verification compliance tracking

import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Snackbar,
  Paper,
  LinearProgress,
  Tooltip,
  Badge
} from '@mui/material';
import {
  Visibility,
  Refresh,
  Pause,
  Delete,
  PlayArrow,
  Warning,
  CheckCircle,
  Error,
  Schedule,
  TrendingDown,
  TrendingUp,
  Assessment,
  Security,
  Notifications
} from '@mui/icons-material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const ComplianceMonitoring = () => {
  const [complianceData, setComplianceData] = useState([]);
  const [summary, setSummary] = useState({});
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState(null);
  const [viewDialog, setViewDialog] = useState(false);
  const [actionDialog, setActionDialog] = useState(false);
  const [actionType, setActionType] = useState('');
  const [actionReason, setActionReason] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  
  // Filters
  const [statusFilter, setStatusFilter] = useState('all');
  const [riskFilter, setRiskFilter] = useState('all');
  const [companyFilter, setCompanyFilter] = useState('all');

  useEffect(() => {
    fetchComplianceData();
    fetchAlerts();
  }, [statusFilter, riskFilter, companyFilter]);

  const fetchComplianceData = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (riskFilter !== 'all') params.append('risk_level', riskFilter);
      if (companyFilter !== 'all') params.append('company_id', companyFilter);

      const response = await fetch(`/api/compliance/all?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const data = await response.json();
      if (data.success) {
        setComplianceData(data.data.compliance_records);
        setSummary(data.data.summary);
      }
    } catch (error) {
      console.error('Error fetching compliance data:', error);
      showSnackbar('Failed to fetch compliance data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchAlerts = async () => {
    try {
      const response = await fetch('/api/compliance/alerts', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const data = await response.json();
      if (data.success) {
        setAlerts(data.alerts);
      }
    } catch (error) {
      console.error('Error fetching alerts:', error);
    }
  };  const
 handleAction = async (project, action) => {
    setSelectedProject(project);
    setActionType(action);
    setActionReason('');
    setActionDialog(true);
  };

  const executeAction = async () => {
    try {
      const endpoint = `/api/compliance/${actionType.toLowerCase()}`;
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          project_id: selectedProject.project_id,
          reason: actionReason
        })
      });

      const data = await response.json();
      if (data.success) {
        showSnackbar(`Credits ${actionType.toLowerCase()}d successfully`, 'success');
        fetchComplianceData();
        setActionDialog(false);
      } else {
        showSnackbar(data.message || `Failed to ${actionType.toLowerCase()} credits`, 'error');
      }
    } catch (error) {
      console.error(`Error ${actionType.toLowerCase()}ing credits:`, error);
      showSnackbar(`Failed to ${actionType.toLowerCase()} credits`, 'error');
    }
  };

  const triggerReverification = async (projectId) => {
    try {
      const response = await fetch('/api/compliance/reverify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          project_id: projectId,
          reverification_type: 'MANUAL',
          priority: 3
        })
      });

      const data = await response.json();
      if (data.success) {
        showSnackbar('AI re-verification triggered successfully', 'success');
      } else {
        showSnackbar(data.message || 'Failed to trigger re-verification', 'error');
      }
    } catch (error) {
      console.error('Error triggering re-verification:', error);
      showSnackbar('Failed to trigger re-verification', 'error');
    }
  };

  const showSnackbar = (message, severity) => {
    setSnackbar({ open: true, message, severity });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Compliant': return 'success';
      case 'Review Needed': return 'warning';
      case 'Non-Compliant': return 'error';
      case 'Frozen': return 'info';
      case 'Revoked': return 'error';
      default: return 'default';
    }
  };

  const getRiskColor = (risk) => {
    switch (risk) {
      case 'Low': return '#4caf50';
      case 'Medium': return '#ff9800';
      case 'High': return '#f44336';
      case 'Critical': return '#d32f2f';
      default: return '#666';
    }
  };

  const formatChange = (value) => {
    if (!value) return 'N/A';
    const color = value < 0 ? '#f44336' : '#4caf50';
    const icon = value < 0 ? '↓' : '↑';
    return (
      <span style={{ color, fontWeight: 'bold' }}>
        {icon} {Math.abs(value).toFixed(1)}%
      </span>
    );
  };

  // Mock trend data for charts
  const generateTrendData = () => {
    const data = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      data.push({
        date: date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
        ndvi: 0.8 - (Math.random() * 0.1),
        compliance_score: 0.9 - (Math.random() * 0.2)
      });
    }
    return data;
  };

  const trendData = generateTrendData();

  const pieData = [
    { name: 'Compliant', value: summary.compliant_projects || 0, color: '#4caf50' },
    { name: 'Review Needed', value: summary.review_needed || 0, color: '#ff9800' },
    { name: 'Non-Compliant', value: summary.non_compliant || 0, color: '#f44336' },
    { name: 'Frozen', value: summary.frozen_credits || 0, color: '#2196f3' },
    { name: 'Revoked', value: summary.revoked_credits || 0, color: '#9c27b0' }
  ];

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Security sx={{ fontSize: 40, mr: 2, color: 'primary.main' }} />
            <Box>
              <Typography variant="h4" className="gradient-text" gutterBottom>
                Compliance Monitoring
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Post-verification compliance tracking with AI re-verification
              </Typography>
            </Box>
          </Box>
          <Button
            variant="contained"
            startIcon={<Refresh />}
            onClick={fetchComplianceData}
            disabled={loading}
          >
            Refresh Data
          </Button>
        </Box>
      </Box> 
     {/* Alerts Banner */}
      {alerts.length > 0 && (
        <Alert 
          severity="warning" 
          sx={{ mb: 3 }}
          action={
            <Badge badgeContent={alerts.length} color="error">
              <Notifications />
            </Badge>
          }
        >
          <Typography variant="body2">
            <strong>{alerts.length} active compliance alert{alerts.length > 1 ? 's' : ''}</strong>
            {alerts.slice(0, 2).map(alert => (
              <div key={alert.alert_id}>• {alert.title}</div>
            ))}
            {alerts.length > 2 && <div>• And {alerts.length - 2} more...</div>}
          </Typography>
        </Alert>
      )}

      {/* Overview Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <CheckCircle sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
              <Typography variant="h4" color="success.main">
                {summary.compliant_projects || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Compliant Projects ✅
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={2.4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Warning sx={{ fontSize: 40, color: 'warning.main', mb: 1 }} />
              <Typography variant="h4" color="warning.main">
                {summary.review_needed || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Under Review ⚠️
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={2.4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Error sx={{ fontSize: 40, color: 'error.main', mb: 1 }} />
              <Typography variant="h4" color="error.main">
                {summary.non_compliant || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Non-Compliant ❌
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={2.4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Pause sx={{ fontSize: 40, color: 'info.main', mb: 1 }} />
              <Typography variant="h4" color="info.main">
                {summary.frozen_credits || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Credits Frozen 🧊
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={2.4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Delete sx={{ fontSize: 40, color: 'secondary.main', mb: 1 }} />
              <Typography variant="h4" color="secondary.main">
                {summary.revoked_credits || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Credits Revoked ♻️
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Charts Section */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <TrendingDown sx={{ mr: 1, verticalAlign: 'middle' }} />
                NDVI & Compliance Trends
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <RechartsTooltip />
                  <Line 
                    type="monotone" 
                    dataKey="ndvi" 
                    stroke="#4caf50" 
                    strokeWidth={2}
                    name="Average NDVI"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="compliance_score" 
                    stroke="#2196f3" 
                    strokeWidth={2}
                    name="Compliance Score"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <Assessment sx={{ mr: 1, verticalAlign: 'middle' }} />
                Status Distribution
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>     
 {/* Filter Panel */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>Filters</Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Status</InputLabel>
                <Select
                  value={statusFilter}
                  label="Status"
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <MenuItem value="all">All Statuses</MenuItem>
                  <MenuItem value="Compliant">Compliant</MenuItem>
                  <MenuItem value="Review Needed">Review Needed</MenuItem>
                  <MenuItem value="Non-Compliant">Non-Compliant</MenuItem>
                  <MenuItem value="Frozen">Frozen</MenuItem>
                  <MenuItem value="Revoked">Revoked</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Risk Level</InputLabel>
                <Select
                  value={riskFilter}
                  label="Risk Level"
                  onChange={(e) => setRiskFilter(e.target.value)}
                >
                  <MenuItem value="all">All Risk Levels</MenuItem>
                  <MenuItem value="Low">Low</MenuItem>
                  <MenuItem value="Medium">Medium</MenuItem>
                  <MenuItem value="High">High</MenuItem>
                  <MenuItem value="Critical">Critical</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Company</InputLabel>
                <Select
                  value={companyFilter}
                  label="Company"
                  onChange={(e) => setCompanyFilter(e.target.value)}
                >
                  <MenuItem value="all">All Companies</MenuItem>
                  {/* Add company options dynamically */}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={3}>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Showing {complianceData.length} projects
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Compliance Table */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Compliance Records
          </Typography>
          
          {loading && <LinearProgress sx={{ mb: 2 }} />}
          
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell><strong>Project</strong></TableCell>
                  <TableCell><strong>Company</strong></TableCell>
                  <TableCell><strong>Credits</strong></TableCell>
                  <TableCell><strong>Last Inspection</strong></TableCell>
                  <TableCell><strong>NDVI Change</strong></TableCell>
                  <TableCell><strong>CO₂ Change</strong></TableCell>
                  <TableCell><strong>AI Score</strong></TableCell>
                  <TableCell><strong>Status</strong></TableCell>
                  <TableCell><strong>Risk</strong></TableCell>
                  <TableCell><strong>Actions</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {complianceData.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {record.project_title || `Project ${record.project_id}`}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          ID: {record.project_id}
                        </Typography>
                      </Box>
                    </TableCell>
                    
                    <TableCell>
                      <Typography variant="body2">
                        {record.company_name || 'Unknown Company'}
                      </Typography>
                    </TableCell>
                    
                    <TableCell>
                      <Box>
                        <Typography variant="body2">
                          {record.total_credits || 'N/A'} tons
                        </Typography>
                        {record.credits_frozen && (
                          <Chip label="Frozen" size="small" color="info" />
                        )}
                        {record.credits_revoked && (
                          <Chip label="Revoked" size="small" color="error" />
                        )}
                      </Box>
                    </TableCell>
                    
                    <TableCell>
                      <Typography variant="body2">
                        {record.last_inspection ? 
                          new Date(record.last_inspection).toLocaleDateString() : 
                          'Never'
                        }
                      </Typography>
                    </TableCell>
                    
                    <TableCell>{formatChange(record.ndvi_change_percent)}</TableCell>
                    <TableCell>{formatChange(record.co2_change_percent)}</TableCell>
                    
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Typography variant="body2" sx={{ mr: 1 }}>
                          {record.ai_confidence_score ? 
                            (record.ai_confidence_score * 100).toFixed(1) + '%' : 
                            'N/A'
                          }
                        </Typography>
                        {record.ai_confidence_score && (
                          <LinearProgress
                            variant="determinate"
                            value={record.ai_confidence_score * 100}
                            sx={{ width: 50, height: 4 }}
                          />
                        )}
                      </Box>
                    </TableCell>
                    
                    <TableCell>
                      <Chip
                        label={record.compliance_status}
                        color={getStatusColor(record.compliance_status)}
                        size="small"
                      />
                    </TableCell>
                    
                    <TableCell>
                      <Chip
                        label={record.risk_level}
                        size="small"
                        sx={{
                          bgcolor: `${getRiskColor(record.risk_level)}20`,
                          color: getRiskColor(record.risk_level),
                          fontWeight: 'bold'
                        }}
                      />
                    </TableCell>
                    
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 0.5 }}>
                        <Tooltip title="View Details">
                          <IconButton 
                            size="small"
                            onClick={() => {
                              setSelectedProject(record);
                              setViewDialog(true);
                            }}
                          >
                            <Visibility />
                          </IconButton>
                        </Tooltip>
                        
                        <Tooltip title="Reverify">
                          <IconButton 
                            size="small"
                            onClick={() => triggerReverification(record.project_id)}
                            color="primary"
                          >
                            <Refresh />
                          </IconButton>
                        </Tooltip>
                        
                        {!record.credits_frozen && !record.credits_revoked && (
                          <Tooltip title="Freeze Credits">
                            <IconButton 
                              size="small"
                              onClick={() => handleAction(record, 'FREEZE')}
                              color="info"
                            >
                              <Pause />
                            </IconButton>
                          </Tooltip>
                        )}
                        
                        {record.credits_frozen && !record.credits_revoked && (
                          <Tooltip title="Reactivate Credits">
                            <IconButton 
                              size="small"
                              onClick={() => handleAction(record, 'REACTIVATE')}
                              color="success"
                            >
                              <PlayArrow />
                            </IconButton>
                          </Tooltip>
                        )}
                        
                        {!record.credits_revoked && (
                          <Tooltip title="Revoke Credits">
                            <IconButton 
                              size="small"
                              onClick={() => handleAction(record, 'REVOKE')}
                              color="error"
                            >
                              <Delete />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          
          {complianceData.length === 0 && !loading && (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="body1" color="text.secondary">
                No compliance records found
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>  
    {/* View Project Details Dialog */}
      <Dialog open={viewDialog} onClose={() => setViewDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Typography variant="h6">
            Project Compliance Details
          </Typography>
        </DialogTitle>
        <DialogContent>
          {selectedProject && (
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle1" gutterBottom color="primary">
                      Project Information
                    </Typography>
                    <Typography><strong>ID:</strong> {selectedProject.project_id}</Typography>
                    <Typography><strong>Title:</strong> {selectedProject.project_title || 'N/A'}</Typography>
                    <Typography><strong>Company:</strong> {selectedProject.company_name || 'N/A'}</Typography>
                    <Typography><strong>Status:</strong> 
                      <Chip 
                        label={selectedProject.compliance_status} 
                        color={getStatusColor(selectedProject.compliance_status)}
                        size="small"
                        sx={{ ml: 1 }}
                      />
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle1" gutterBottom color="success.main">
                      Compliance Metrics
                    </Typography>
                    <Typography><strong>NDVI Change:</strong> {formatChange(selectedProject.ndvi_change_percent)}</Typography>
                    <Typography><strong>CO₂ Change:</strong> {formatChange(selectedProject.co2_change_percent)}</Typography>
                    <Typography><strong>Area Change:</strong> {formatChange(selectedProject.area_change_percent)}</Typography>
                    <Typography><strong>AI Confidence:</strong> {selectedProject.ai_confidence_score ? (selectedProject.ai_confidence_score * 100).toFixed(1) + '%' : 'N/A'}</Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle1" gutterBottom color="warning.main">
                      Inspection Schedule
                    </Typography>
                    <Typography><strong>Last Inspection:</strong> {selectedProject.last_inspection ? new Date(selectedProject.last_inspection).toLocaleString() : 'Never'}</Typography>
                    <Typography><strong>Next Due:</strong> {selectedProject.next_inspection_due ? new Date(selectedProject.next_inspection_due).toLocaleString() : 'Not scheduled'}</Typography>
                    <Typography><strong>Risk Level:</strong> 
                      <Chip 
                        label={selectedProject.risk_level}
                        size="small"
                        sx={{
                          bgcolor: `${getRiskColor(selectedProject.risk_level)}20`,
                          color: getRiskColor(selectedProject.risk_level),
                          ml: 1
                        }}
                      />
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              {selectedProject.flagged_reason && (
                <Grid item xs={12}>
                  <Alert severity="warning">
                    <Typography variant="body2">
                      <strong>Flagged Reason:</strong> {selectedProject.flagged_reason}
                    </Typography>
                  </Alert>
                </Grid>
              )}
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDialog(false)}>Close</Button>
          <Button 
            variant="contained" 
            onClick={() => triggerReverification(selectedProject?.project_id)}
          >
            Trigger Re-verification
          </Button>
        </DialogActions>
      </Dialog>

      {/* Action Confirmation Dialog */}
      <Dialog open={actionDialog} onClose={() => setActionDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          Confirm {actionType} Credits
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Are you sure you want to {actionType.toLowerCase()} credits for project {selectedProject?.project_id}?
          </Typography>
          <TextField
            fullWidth
            label="Reason (required)"
            value={actionReason}
            onChange={(e) => setActionReason(e.target.value)}
            multiline
            rows={3}
            required
            helperText="Please provide a detailed reason for this action"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setActionDialog(false)}>Cancel</Button>
          <Button 
            variant="contained"
            color={actionType === 'REVOKE' ? 'error' : actionType === 'FREEZE' ? 'info' : 'success'}
            onClick={executeAction}
            disabled={!actionReason.trim()}
          >
            {actionType} Credits
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default ComplianceMonitoring;