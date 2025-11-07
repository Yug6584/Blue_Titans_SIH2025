import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Avatar,
  Chip,
  Tabs,
  Tab,
  Grid,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  IconButton,
  TextField,
  Switch,
  FormControlLabel,
  Alert,

  Paper,
  Tooltip,
} from '@mui/material';
import {
  Close,
  Business,
  AccountBalance,
  AdminPanelSettings,
  Person,
  Verified,
  Security,
  AccountBalanceWallet,
  History,
  Edit,
  Save,
  Cancel,
  Email,
  Phone,
  LocationOn,
  CalendarToday,
  Login,
  Logout,
  CheckCircle,
  Warning,
  Error,
  Info,
} from '@mui/icons-material';
import { blueCarbon } from '../../../theme/colors';

const UserDetailsModal = ({ open, user, onClose, onUpdate }) => {
  const [activeTab, setActiveTab] = useState(0);
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState({});

  if (!user) return null;

  const handleEdit = () => {
    setEditData({ ...user });
    setEditing(true);
  };

  const handleSave = () => {
    onUpdate(editData);
    setEditing(false);
  };

  const handleCancel = () => {
    setEditData({});
    setEditing(false);
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'company': return <Business />;
      case 'government': return <AccountBalance />;
      case 'admin': return <AdminPanelSettings />;
      default: return <Person />;
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'company': return blueCarbon.forest;
      case 'government': return blueCarbon.aqua;
      case 'admin': return blueCarbon.oceanBlue;
      default: return '#666';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return '#4caf50';
      case 'suspended': return '#f44336';
      case 'pending': return '#ff9800';
      default: return '#666';
    }
  };

  const mockActivityLog = [
    {
      id: '1',
      action: 'User Login',
      timestamp: new Date(),
      details: 'Successful login from Chrome browser',
      type: 'success',
      ipAddress: '192.168.1.100'
    },
    {
      id: '2',
      action: 'Profile Updated',
      timestamp: new Date(Date.now() - 3600000),
      details: 'Updated company information',
      type: 'info',
      ipAddress: '192.168.1.100'
    },
    {
      id: '3',
      action: 'MRV Data Submitted',
      timestamp: new Date(Date.now() - 7200000),
      details: 'Submitted Q4 2024 MRV report',
      type: 'success',
      ipAddress: '192.168.1.100'
    },
    {
      id: '4',
      action: 'Failed Login Attempt',
      timestamp: new Date(Date.now() - 86400000),
      details: 'Invalid password attempt',
      type: 'warning',
      ipAddress: '192.168.1.105'
    }
  ];

  const getActivityIcon = (type) => {
    switch (type) {
      case 'success': return <CheckCircle sx={{ color: '#4caf50' }} />;
      case 'warning': return <Warning sx={{ color: '#ff9800' }} />;
      case 'error': return <Error sx={{ color: '#f44336' }} />;
      default: return <Info sx={{ color: blueCarbon.oceanBlue }} />;
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

  const TabPanel = ({ children, value, index }) => (
    <div hidden={value !== index}>
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="lg" 
      fullWidth
      PaperProps={{
        sx: { minHeight: '80vh' }
      }}
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Avatar 
              sx={{ 
                bgcolor: getRoleColor(user.role), 
                mr: 2, 
                width: 56, 
                height: 56 
              }}
            >
              {getRoleIcon(user.role)}
            </Avatar>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 600 }}>
                {user.name}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                <Chip
                  label={user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                  size="small"
                  sx={{
                    bgcolor: `${getRoleColor(user.role)}20`,
                    color: getRoleColor(user.role),
                    fontWeight: 500
                  }}
                />
                <Chip
                  label={user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                  size="small"
                  sx={{
                    bgcolor: `${getStatusColor(user.status)}20`,
                    color: getStatusColor(user.status),
                    fontWeight: 500
                  }}
                />
                {user.isVerified && (
                  <Chip
                    icon={<Verified />}
                    label="Verified"
                    size="small"
                    sx={{
                      bgcolor: '#4caf5020',
                      color: '#4caf50',
                      fontWeight: 500
                    }}
                  />
                )}
              </Box>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {!editing ? (
              <Button
                variant="outlined"
                startIcon={<Edit />}
                onClick={handleEdit}
                sx={{ mr: 1 }}
              >
                Edit
              </Button>
            ) : (
              <>
                <Button
                  variant="contained"
                  startIcon={<Save />}
                  onClick={handleSave}
                  sx={{ mr: 1 }}
                >
                  Save
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<Cancel />}
                  onClick={handleCancel}
                  sx={{ mr: 1 }}
                >
                  Cancel
                </Button>
              </>
            )}
            <IconButton onClick={onClose}>
              <Close />
            </IconButton>
          </Box>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Tabs
          value={activeTab}
          onChange={(e, newValue) => setActiveTab(newValue)}
          sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}
        >
          <Tab label="Profile Info" />
          <Tab label="Blockchain Identity" />
          <Tab label="Security Settings" />
          <Tab label="Activity Log" />
        </Tabs>

        {/* Profile Info Tab */}
        <TabPanel value={activeTab} index={0}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                    Basic Information
                  </Typography>
                  <List>
                    <ListItem>
                      <ListItemIcon><Email /></ListItemIcon>
                      <ListItemText
                        primary="Email"
                        secondary={
                          editing ? (
                            <TextField
                              size="small"
                              value={editData.email || user.email}
                              onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                              fullWidth
                            />
                          ) : user.email
                        }
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><Person /></ListItemIcon>
                      <ListItemText
                        primary="Full Name"
                        secondary={
                          editing ? (
                            <TextField
                              size="small"
                              value={editData.name || user.name}
                              onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                              fullWidth
                            />
                          ) : user.name
                        }
                      />
                    </ListItem>
                    {user.department && (
                      <ListItem>
                        <ListItemIcon><AccountBalance /></ListItemIcon>
                        <ListItemText
                          primary="Department"
                          secondary={user.department}
                        />
                      </ListItem>
                    )}
                    <ListItem>
                      <ListItemIcon><CalendarToday /></ListItemIcon>
                      <ListItemText
                        primary="Registration Date"
                        secondary={formatDateTime(user.registrationDate)}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><Login /></ListItemIcon>
                      <ListItemText
                        primary="Last Login"
                        secondary={formatDateTime(user.lastLogin)}
                      />
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                    Verification Status
                  </Typography>
                  <Box sx={{ mb: 2 }}>
                    <Alert 
                      severity={user.kycStatus === 'approved' ? 'success' : 'warning'}
                      sx={{ mb: 2 }}
                    >
                      KYC Status: {user.kycStatus?.charAt(0).toUpperCase() + user.kycStatus?.slice(1)}
                    </Alert>
                  </Box>
                  
                  <List>
                    <ListItem>
                      <ListItemText
                        primary="Email Verification"
                        secondary={
                          <Chip
                            label={user.isVerified ? 'Verified' : 'Pending'}
                            size="small"
                            color={user.isVerified ? 'success' : 'warning'}
                          />
                        }
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="Multi-Factor Authentication"
                        secondary={
                          <FormControlLabel
                            control={
                              <Switch
                                checked={user.mfaEnabled}
                                disabled={!editing}
                                onChange={(e) => setEditData({ 
                                  ...editData, 
                                  mfaEnabled: e.target.checked 
                                })}
                              />
                            }
                            label={user.mfaEnabled ? 'Enabled' : 'Disabled'}
                          />
                        }
                      />
                    </ListItem>
                    {user.permissions && (
                      <ListItem>
                        <ListItemText
                          primary="Permissions"
                          secondary={
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1 }}>
                              {user.permissions.map((permission) => (
                                <Chip
                                  key={permission}
                                  label={permission}
                                  size="small"
                                  variant="outlined"
                                />
                              ))}
                            </Box>
                          }
                        />
                      </ListItem>
                    )}
                  </List>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Blockchain Identity Tab */}
        <TabPanel value={activeTab} index={1}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                    Decentralized Identity (DID)
                  </Typography>
                  {user.blockchainDID ? (
                    <Box>
                      <Alert severity="success" sx={{ mb: 2 }}>
                        Blockchain identity is verified and active
                      </Alert>
                      <List>
                        <ListItem>
                          <ListItemIcon><Security /></ListItemIcon>
                          <ListItemText
                            primary="DID Address"
                            secondary={
                              <Typography 
                                variant="body2" 
                                sx={{ 
                                  fontFamily: 'monospace',
                                  wordBreak: 'break-all',
                                  bgcolor: 'grey.100',
                                  p: 1,
                                  borderRadius: 1,
                                  mt: 1
                                }}
                              >
                                {user.blockchainDID}
                              </Typography>
                            }
                          />
                        </ListItem>
                        {user.walletAddress && (
                          <ListItem>
                            <ListItemIcon><AccountBalanceWallet /></ListItemIcon>
                            <ListItemText
                              primary="Connected Wallet"
                              secondary={
                                <Typography 
                                  variant="body2" 
                                  sx={{ 
                                    fontFamily: 'monospace',
                                    wordBreak: 'break-all',
                                    bgcolor: 'grey.100',
                                    p: 1,
                                    borderRadius: 1,
                                    mt: 1
                                  }}
                                >
                                  {user.walletAddress}
                                </Typography>
                              }
                            />
                          </ListItem>
                        )}
                      </List>
                    </Box>
                  ) : (
                    <Alert severity="warning">
                      No blockchain identity found. User has not connected a wallet or created a DID.
                    </Alert>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Security Settings Tab */}
        <TabPanel value={activeTab} index={2}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                    Authentication Settings
                  </Typography>
                  <List>
                    <ListItem>
                      <ListItemText
                        primary="Password Security"
                        secondary="Last changed 30 days ago"
                      />
                      <Button size="small" variant="outlined">
                        Reset Password
                      </Button>
                    </ListItem>
                    <Divider />
                    <ListItem>
                      <ListItemText
                        primary="Two-Factor Authentication"
                        secondary={user.mfaEnabled ? 'Enabled via authenticator app' : 'Not enabled'}
                      />
                      <Switch checked={user.mfaEnabled} />
                    </ListItem>
                    <Divider />
                    <ListItem>
                      <ListItemText
                        primary="Session Management"
                        secondary="Force logout from all devices"
                      />
                      <Button size="small" variant="outlined" color="warning">
                        Force Logout
                      </Button>
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                    Account Actions
                  </Typography>
                  <List>
                    <ListItem>
                      <ListItemText
                        primary="Account Status"
                        secondary={`Currently ${user.status}`}
                      />
                      <Button 
                        size="small" 
                        variant="outlined"
                        color={user.status === 'active' ? 'warning' : 'success'}
                      >
                        {user.status === 'active' ? 'Suspend' : 'Activate'}
                      </Button>
                    </ListItem>
                    <Divider />
                    <ListItem>
                      <ListItemText
                        primary="Verification Status"
                        secondary={user.isVerified ? 'Account is verified' : 'Account needs verification'}
                      />
                      <Button 
                        size="small" 
                        variant="outlined"
                        color={user.isVerified ? 'warning' : 'success'}
                      >
                        {user.isVerified ? 'Unverify' : 'Verify'}
                      </Button>
                    </ListItem>
                    <Divider />
                    <ListItem>
                      <ListItemText
                        primary="Send Notification"
                        secondary="Send email notification to user"
                      />
                      <Button size="small" variant="outlined">
                        Send Email
                      </Button>
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Activity Log Tab */}
        <TabPanel value={activeTab} index={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Recent Activity
              </Typography>
              <Box>
                {mockActivityLog.map((activity, index) => (
                  <Paper key={activity.id} sx={{ p: 2, mb: 2, position: 'relative' }}>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                      <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        width: 40,
                        height: 40,
                        borderRadius: '50%',
                        bgcolor: activity.type === 'success' ? '#4caf5020' : 
                                activity.type === 'warning' ? '#ff980020' : 
                                activity.type === 'error' ? '#f4433620' : `${blueCarbon.oceanBlue}20`,
                        color: activity.type === 'success' ? '#4caf50' : 
                               activity.type === 'warning' ? '#ff9800' : 
                               activity.type === 'error' ? '#f44336' : blueCarbon.oceanBlue,
                        flexShrink: 0
                      }}>
                        {getActivityIcon(activity.type)}
                      </Box>
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                          {activity.action}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          {activity.details}
                        </Typography>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="caption" color="text.secondary">
                            {formatDateTime(activity.timestamp)}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            IP: {activity.ipAddress}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                    {index < mockActivityLog.length - 1 && (
                      <Box sx={{
                        position: 'absolute',
                        left: 19,
                        top: 50,
                        width: 2,
                        height: 20,
                        bgcolor: 'divider'
                      }} />
                    )}
                  </Paper>
                ))}
              </Box>
            </CardContent>
          </Card>
        </TabPanel>
      </DialogContent>

      <DialogActions sx={{ p: 3 }}>
        <Button onClick={onClose} variant="outlined">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default UserDetailsModal;