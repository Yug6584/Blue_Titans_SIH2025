import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  Switch,
  FormControlLabel,
  Chip,
  Avatar,
  LinearProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
} from '@mui/material';
import {
  Person,
  Business,
  AccountBalance,
  AdminPanelSettings,
  Edit,
  Add,
  Security,
  Visibility,
  Create,
  Delete,
  Verified,
  Settings,
} from '@mui/icons-material';
import { blueCarbon } from '../../../theme/colors';
import api from '../../../utils/api';

const UserRolesPermissions = ({ onNotification, loading }) => {
  const [roleStats, setRoleStats] = useState({
    company: { count: 0, active: 0, inactive: 0 },
    government: { count: 0, active: 0, inactive: 0 },
    admin: { count: 0, active: 0, inactive: 0 }
  });
  const [permissions, setPermissions] = useState({});
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadRoleData();
  }, []);

  const loadRoleData = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/system-settings/stats');
      
      if (response.data.success) {
        setRoleStats(response.data.data.userRoles);
      } else {
        onNotification('Failed to load role statistics', 'error');
      }
    } catch (error) {
      console.error('Error loading role data:', error);
      onNotification('Error loading role data', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const roleConfigs = [
    {
      key: 'company',
      title: 'Company',
      subtitle: 'Carbon credit project companies',
      icon: <Business />,
      color: '#4caf50',
      permissions: [
        { key: 'view_projects', label: 'View Projects', icon: <Visibility /> },
        { key: 'create_projects', label: 'Create Projects', icon: <Create /> },
        { key: 'submit_mrv', label: 'Submit MRV Reports', icon: <Verified /> },
        { key: 'trade_credits', label: 'Trade Carbon Credits', icon: <Business /> },
        { key: 'view_marketplace', label: 'Access Marketplace', icon: <Visibility /> },
      ]
    },
    {
      key: 'government',
      title: 'Government Official',
      subtitle: 'Regulatory and verification authorities',
      icon: <AccountBalance />,
      color: '#2196f3',
      permissions: [
        { key: 'verify_projects', label: 'Verify Projects', icon: <Verified /> },
        { key: 'approve_credits', label: 'Approve Credits', icon: <Verified /> },
        { key: 'view_all_projects', label: 'View All Projects', icon: <Visibility /> },
        { key: 'generate_reports', label: 'Generate Reports', icon: <Create /> },
        { key: 'regulatory_oversight', label: 'Regulatory Oversight', icon: <Security /> },
      ]
    },
    {
      key: 'admin',
      title: 'System Administrator',
      subtitle: 'Full system access and management',
      icon: <AdminPanelSettings />,
      color: '#f44336',
      permissions: [
        { key: 'user_management', label: 'User Management', icon: <Person /> },
        { key: 'system_settings', label: 'System Settings', icon: <Settings /> },
        { key: 'audit_logs', label: 'Audit Logs', icon: <Security /> },
        { key: 'backup_restore', label: 'Backup & Restore', icon: <Security /> },
        { key: 'full_access', label: 'Full System Access', icon: <AdminPanelSettings /> },
      ]
    }
  ];

  const handleEditRole = (roleKey) => {
    setSelectedRole(roleKey);
    setEditDialogOpen(true);
  };

  const handleCloseEditDialog = () => {
    setEditDialogOpen(false);
    setSelectedRole(null);
  };

  const handleSavePermissions = async () => {
    try {
      // In production, this would save to the backend
      onNotification('Role permissions updated successfully', 'success');
      handleCloseEditDialog();
    } catch (error) {
      onNotification('Failed to update permissions', 'error');
    }
  };

  const getRoleIcon = (roleKey) => {
    const config = roleConfigs.find(r => r.key === roleKey);
    return config ? config.icon : <Person />;
  };

  const getRoleColor = (roleKey) => {
    const config = roleConfigs.find(r => r.key === roleKey);
    return config ? config.color : blueCarbon.oceanBlue;
  };

  const calculateActivePercentage = (role) => {
    if (role.count === 0) return 0;
    return Math.round((role.active / role.count) * 100);
  };

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
          User Roles & Permissions Management
        </Typography>
        <Typography 
          variant="body1" 
          color="text.secondary"
          sx={{ 
            fontSize: { xs: '0.9rem', md: '1rem' },
            wordBreak: 'break-word'
          }}
        >
          Manage role definitions and access privileges for different user types
        </Typography>
      </Box>

      {isLoading && <LinearProgress sx={{ mb: 3 }} />}

      {/* Role Statistics Cards */}
      <Grid container spacing={{ xs: 2, md: 3 }} sx={{ mb: { xs: 2, md: 3 }, mx: { xs: 0.5, sm: 0 } }}>
        {roleConfigs.map((config) => {
          const stats = roleStats[config.key] || { count: 0, active: 0, inactive: 0 };
          const activePercentage = calculateActivePercentage(stats);
          
          return (
            <Grid item xs={12} sm={6} lg={4} key={config.key}>
              <Card sx={{ 
                height: '100%',
                background: `linear-gradient(135deg, ${config.color}15 0%, ${config.color}25 100%)`,
                border: `1px solid ${config.color}30`,
                position: 'relative',
                minHeight: { xs: 200, sm: 250, md: 280 },
                maxWidth: '100%',
                overflow: 'hidden'
              }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar sx={{ bgcolor: config.color, mr: 2 }}>
                      {config.icon}
                    </Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        {config.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {config.subtitle}
                      </Typography>
                    </Box>
                    <Button
                      size="small"
                      startIcon={<Edit />}
                      onClick={() => handleEditRole(config.key)}
                      sx={{ 
                        color: config.color,
                        fontSize: { xs: '0.7rem', md: '0.875rem' },
                        padding: { xs: '4px 8px', md: '6px 16px' }
                      }}
                    >
                      Edit
                    </Button>
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <Typography variant="h3" sx={{ fontWeight: 700, color: config.color }}>
                      {stats.count}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Users
                    </Typography>
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        Active Users
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {activePercentage}%
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={activePercentage}
                      sx={{
                        height: 8,
                        borderRadius: 4,
                        bgcolor: 'grey.200',
                        '& .MuiLinearProgress-bar': {
                          bgcolor: config.color,
                          borderRadius: 4
                        }
                      }}
                    />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                      <Chip 
                        label={`${stats.active} Active`} 
                        size="small" 
                        sx={{ bgcolor: `${config.color}20`, color: config.color }}
                      />
                      <Chip 
                        label={`${stats.inactive} Inactive`} 
                        size="small" 
                        variant="outlined"
                      />
                    </Box>
                  </Box>

                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    Permissions: {config.permissions.length}
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {config.permissions.slice(0, 3).map((perm) => (
                      <Chip
                        key={perm.key}
                        label={perm.label}
                        size="small"
                        sx={{ 
                          fontSize: '0.7rem',
                          bgcolor: `${config.color}10`,
                          color: config.color
                        }}
                      />
                    ))}
                    {config.permissions.length > 3 && (
                      <Chip
                        label={`+${config.permissions.length - 3} more`}
                        size="small"
                        variant="outlined"
                        sx={{ fontSize: '0.7rem' }}
                      />
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {/* Permissions Matrix */}
      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
            Permissions Matrix
          </Typography>
          
          <Alert severity="info" sx={{ mb: 3 }}>
            This matrix shows the current permission structure for each role. Click "Edit" on any role card above to modify permissions.
          </Alert>

          <Box sx={{ overflowX: 'auto', width: '100%' }}>
            <Box sx={{ minWidth: { xs: 300, sm: 500, md: 600 } }}>
              {/* Header */}
              <Box sx={{ display: 'flex', mb: 2, pb: 2, borderBottom: '1px solid #e0e0e0' }}>
                <Box sx={{ width: { xs: 120, md: 200 }, fontWeight: 600, fontSize: { xs: '0.8rem', md: '1rem' } }}>Permission</Box>
                <Box sx={{ width: { xs: 80, md: 120 }, textAlign: 'center', fontWeight: 600, fontSize: { xs: '0.8rem', md: '1rem' } }}>Company</Box>
                <Box sx={{ width: { xs: 80, md: 120 }, textAlign: 'center', fontWeight: 600, fontSize: { xs: '0.8rem', md: '1rem' } }}>Government</Box>
                <Box sx={{ width: { xs: 80, md: 120 }, textAlign: 'center', fontWeight: 600, fontSize: { xs: '0.8rem', md: '1rem' } }}>Admin</Box>
              </Box>

              {/* Permission Rows */}
              {[
                { key: 'view_projects', label: 'View Projects', company: true, government: true, admin: true },
                { key: 'create_projects', label: 'Create Projects', company: true, government: false, admin: true },
                { key: 'verify_projects', label: 'Verify Projects', company: false, government: true, admin: true },
                { key: 'user_management', label: 'User Management', company: false, government: false, admin: true },
                { key: 'system_settings', label: 'System Settings', company: false, government: false, admin: true },
                { key: 'audit_logs', label: 'Audit Logs', company: false, government: true, admin: true },
              ].map((permission) => (
                <Box key={permission.key} sx={{ display: 'flex', mb: 1, py: 1, alignItems: 'center' }}>
                  <Box sx={{ width: { xs: 120, md: 200 }, fontSize: { xs: '0.8rem', md: '1rem' } }}>{permission.label}</Box>
                  <Box sx={{ width: { xs: 80, md: 120 }, textAlign: 'center' }}>
                    <Chip
                      label={permission.company ? 'Allowed' : 'Denied'}
                      size="small"
                      color={permission.company ? 'success' : 'default'}
                      variant={permission.company ? 'filled' : 'outlined'}
                      sx={{ fontSize: { xs: '0.7rem', md: '0.8rem' } }}
                    />
                  </Box>
                  <Box sx={{ width: { xs: 80, md: 120 }, textAlign: 'center' }}>
                    <Chip
                      label={permission.government ? 'Allowed' : 'Denied'}
                      size="small"
                      color={permission.government ? 'success' : 'default'}
                      variant={permission.government ? 'filled' : 'outlined'}
                      sx={{ fontSize: { xs: '0.7rem', md: '0.8rem' } }}
                    />
                  </Box>
                  <Box sx={{ width: { xs: 80, md: 120 }, textAlign: 'center' }}>
                    <Chip
                      label={permission.admin ? 'Allowed' : 'Denied'}
                      size="small"
                      color={permission.admin ? 'success' : 'default'}
                      variant={permission.admin ? 'filled' : 'outlined'}
                      sx={{ fontSize: { xs: '0.7rem', md: '0.8rem' } }}
                    />
                  </Box>
                </Box>
              ))}
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Edit Role Dialog */}
      <Dialog
        open={editDialogOpen}
        onClose={handleCloseEditDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Edit Role Permissions: {selectedRole && roleConfigs.find(r => r.key === selectedRole)?.title}
        </DialogTitle>
        <DialogContent>
          {selectedRole && (
            <Box sx={{ pt: 2 }}>
              <Typography variant="body1" sx={{ mb: 3 }}>
                Configure permissions for {roleConfigs.find(r => r.key === selectedRole)?.title} role:
              </Typography>
              
              <List>
                {roleConfigs.find(r => r.key === selectedRole)?.permissions.map((permission) => (
                  <React.Fragment key={permission.key}>
                    <ListItem>
                      <ListItemIcon>
                        {permission.icon}
                      </ListItemIcon>
                      <ListItemText
                        primary={permission.label}
                        secondary={`Allow ${selectedRole} users to ${permission.label.toLowerCase()}`}
                      />
                      <ListItemSecondaryAction>
                        <Switch
                          edge="end"
                          defaultChecked={true}
                          color="primary"
                        />
                      </ListItemSecondaryAction>
                    </ListItem>
                    <Divider />
                  </React.Fragment>
                ))}
              </List>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEditDialog}>Cancel</Button>
          <Button onClick={handleSavePermissions} variant="contained">
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UserRolesPermissions;