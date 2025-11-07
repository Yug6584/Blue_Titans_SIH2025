import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Avatar,
  IconButton,
  Button,
  LinearProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Divider,
} from '@mui/material';
import {
  Close,
  AdminPanelSettings,
  ExpandMore,
  CheckCircle,
  Warning,
  Error,
  CalendarToday,
} from '@mui/icons-material';
import { blueCarbon } from '../../../theme/colors';
import { adminActionService } from '../../../services/adminActionService';

const AdminActionModal = ({ open, onClose, onNotification }) => {
  const [adminActions, setAdminActions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [groupedActions, setGroupedActions] = useState({});
  const [totalStats, setTotalStats] = useState({ total: 0, success: 0, failed: 0 });

  useEffect(() => {
    if (open) {
      loadAdminActions();
    }
  }, [open]);

  const loadAdminActions = async () => {
    try {
      setIsLoading(true);
      const response = await adminActionService.getAdminActions('limit=100');
      
      if (response && response.success) {
        const actions = Array.isArray(response.actions) ? response.actions : [];
        const sortedActions = actions.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        
        setAdminActions(sortedActions);
        groupActionsByDate(sortedActions);
        calculateStats(sortedActions);
      } else {
        onNotification('Failed to load admin actions', 'error');
      }
    } catch (error) {
      console.error('Error loading admin actions:', error);
      onNotification('Error loading admin actions', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const groupActionsByDate = (actions) => {
    const grouped = {};
    
    actions.forEach(action => {
      const date = new Date(action.timestamp);
      const dateKey = date.toDateString();
      
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(action);
    });
    
    setGroupedActions(grouped);
  };

  const calculateStats = (actions) => {
    const total = actions.length;
    const success = actions.filter(action => action.metadata?.status === 'completed').length;
    const failed = total - success;
    
    setTotalStats({ total, success, failed });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    }
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
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
      default: return <CheckCircle />;
    }
  };

  const getActionTypeLabel = (actionType) => {
    return actionType ? actionType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'Unknown Action';
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          minHeight: '70vh',
          maxHeight: '90vh'
        }
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        pb: 1,
        borderBottom: '1px solid #e0e0e0'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <AdminPanelSettings sx={{ color: blueCarbon.oceanBlue }} />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Complete Admin Action History
          </Typography>
        </Box>
        <IconButton onClick={onClose} size="small">
          <Close />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 0 }}>
        {isLoading && <LinearProgress />}
        
        {/* Stats Header */}
        <Box sx={{ p: 2, bgcolor: 'grey.50', borderBottom: '1px solid #e0e0e0' }}>
          <Typography variant="body2" color="text.secondary">
            Total admin activities: {totalStats.total} | Organized by date
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
            <Chip 
              label={`${totalStats.total} total`} 
              size="small" 
              sx={{ bgcolor: blueCarbon.oceanBlue + '20', color: blueCarbon.oceanBlue }}
            />
            <Chip 
              label={`${totalStats.success} success`} 
              size="small" 
              sx={{ bgcolor: '#4caf5020', color: '#4caf50' }}
            />
            {totalStats.failed > 0 && (
              <Chip 
                label={`${totalStats.failed} failed`} 
                size="small" 
                sx={{ bgcolor: '#f4433620', color: '#f44336' }}
              />
            )}
          </Box>
        </Box>

        {/* Grouped Actions */}
        <Box sx={{ maxHeight: '60vh', overflow: 'auto' }}>
          {Object.entries(groupedActions).map(([dateKey, actions]) => (
            <Accordion key={dateKey} defaultExpanded sx={{ boxShadow: 'none', '&:before': { display: 'none' } }}>
              <AccordionSummary 
                expandIcon={<ExpandMore />}
                sx={{ 
                  bgcolor: 'grey.50',
                  borderBottom: '1px solid #e0e0e0',
                  minHeight: 56,
                  '&.Mui-expanded': { minHeight: 56 }
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                  <CalendarToday sx={{ fontSize: 20, color: blueCarbon.oceanBlue }} />
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    {formatDate(dateKey)}
                  </Typography>
                  <Chip 
                    label={`${actions.length} activities`} 
                    size="small" 
                    sx={{ ml: 'auto', bgcolor: blueCarbon.oceanBlue + '20', color: blueCarbon.oceanBlue }}
                  />
                </Box>
              </AccordionSummary>
              
              <AccordionDetails sx={{ p: 0 }}>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow sx={{ bgcolor: 'grey.25' }}>
                        <TableCell sx={{ fontWeight: 600, width: '100px' }}>Time</TableCell>
                        <TableCell sx={{ fontWeight: 600, width: '200px' }}>Admin</TableCell>
                        <TableCell sx={{ fontWeight: 600, width: '150px' }}>Action</TableCell>
                        <TableCell sx={{ fontWeight: 600, width: '200px' }}>Target</TableCell>
                        <TableCell sx={{ fontWeight: 600, width: '100px' }}>Severity</TableCell>
                        <TableCell sx={{ fontWeight: 600, width: '100px' }}>Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {actions.map((action) => (
                        <TableRow key={action.id} hover>
                          <TableCell>
                            <Typography variant="body2" sx={{ fontFamily: 'monospace', color: blueCarbon.oceanBlue }}>
                              {formatTime(action.timestamp)}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Avatar sx={{ width: 24, height: 24, bgcolor: blueCarbon.oceanBlue, fontSize: 12 }}>
                                <AdminPanelSettings sx={{ fontSize: 14 }} />
                              </Avatar>
                              <Box>
                                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                  {action.admin?.name || 'Admin'}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {action.admin?.email || 'Unknown'}
                                </Typography>
                              </Box>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={getActionTypeLabel(action.action?.type)}
                              size="small"
                              sx={{ 
                                bgcolor: blueCarbon.oceanBlue + '15',
                                color: blueCarbon.oceanBlue,
                                fontWeight: 500,
                                fontSize: '0.75rem'
                              }}
                            />
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {action.target?.email || 'N/A'}
                            </Typography>
                            {action.action?.details && (
                              <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                                {action.action.details.length > 50 
                                  ? action.action.details.substring(0, 50) + '...'
                                  : action.action.details
                                }
                              </Typography>
                            )}
                          </TableCell>
                          <TableCell>
                            <Chip
                              icon={getSeverityIcon(action.action?.severity)}
                              label={(action.action?.severity || 'medium').charAt(0).toUpperCase() + (action.action?.severity || 'medium').slice(1)}
                              size="small"
                              sx={{
                                bgcolor: `${getSeverityColor(action.action?.severity)}20`,
                                color: getSeverityColor(action.action?.severity),
                                fontWeight: 500
                              }}
                            />
                          </TableCell>
                          <TableCell>
                            <Chip
                              icon={<CheckCircle sx={{ fontSize: 14 }} />}
                              label="Success"
                              size="small"
                              sx={{ bgcolor: '#4caf5020', color: '#4caf50', fontWeight: 500 }}
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </AccordionDetails>
            </Accordion>
          ))}
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2, borderTop: '1px solid #e0e0e0' }}>
        <Button onClick={onClose} variant="contained" sx={{ bgcolor: blueCarbon.oceanBlue }}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AdminActionModal;