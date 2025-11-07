import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  ListItemSecondaryAction,
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
  LinearProgress,
  Tabs,
  Tab,
  Paper,
  Divider,
} from '@mui/material';
import {
  Security,
  VerifiedUser,
  Fingerprint,
  Email,
  Phone,
  CameraAlt,
  CheckCircle,
  Cancel,
  Pending,
  Visibility,
  Edit,
  Send,
  Warning,
  Shield,
  VpnKey,
  AccountBalance,
  Business,
  AdminPanelSettings,
} from '@mui/icons-material';
import { blueCarbon } from '../../../theme/colors';

const SecurityVerificationPanel = ({ users, onNotification }) => {
  const [activeTab, setActiveTab] = useState(0);
  const [selectedUser, setSelectedUser] = useState(null);
  const [verificationDialog, setVerificationDialog] = useState(false);
  const [biometricDialog, setBiometricDialog] = useState(false);
  const [verificationAction, setVerificationAction] = useState('');
  const [verificationReason, setVerificationReason] = useState('');

  // Filter users by verification needs
  const pendingKYC = users.filter(user => user.kycStatus === 'pending');
  const pendingVerification = users.filter(user => !user.isVerified);
  const mfaDisabled = users.filter(user => !user.mfaEnabled);
  const adminUsers = users.filter(user => user.role === 'admin');

  const handleVerificationAction = (user, action) => {
    setSelectedUser(user);
    setVerificationAction(action);
    setVerificationDialog(true);
  };

  const executeVerificationAction = () => {
    const actionMessages = {
      approve_kyc: `KYC approved for ${selectedUser.email}`,
      reject_kyc: `KYC rejected for ${selectedUser.email}`,
      verify_user: `User ${selectedUser.email} has been verified`,
      unverify_user: `User ${selectedUser.email} has been unverified`,
      enable_mfa: `MFA enabled for ${selectedUser.email}`,
      disable_mfa: `MFA disabled for ${selectedUser.email}`,
    };

    onNotification(actionMessages[verificationAction] || 'Action completed', 'success');
    setVerificationDialog(false);
    setSelectedUser(null);
    setVerificationAction('');
    setVerificationReason('');
  };

  const handleBiometricEnrollment = (user) => {
    setSelectedUser(user);
    setBiometricDialog(true);
  };

  const executeBiometricEnrollment = () => {
    onNotification(`Biometric enrollment initiated for ${selectedUser.email}`, 'info');
    setBiometricDialog(false);
    setSelectedUser(null);
  };

  const getVerificationStatusColor = (status) => {
    switch (status) {
      case 'approved': return '#4caf50';
      case 'rejected': return '#f44336';
      case 'pending': return '#ff9800';
      default: return '#666';
    }
  };

  const getVerificationStatusIcon = (status) => {
    switch (status) {
      case 'approved': return <CheckCircle />;
      case 'rejected': return <Cancel />;
      case 'pending': return <Pending />;
      default: return <Warning />;
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'company': return <Business />;
      case 'government': return <AccountBalance />;
      case 'admin': return <AdminPanelSettings />;
      default: return <VerifiedUser />;
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

  const TabPanel = ({ children, value, index }) => (
    <div hidden={value !== index}>
      {value === index && <Box sx={{ pt: 2 }}>{children}</Box>}
    </div>
  );

  const UserListItem = ({ user, actions }) => (
    <ListItem
      sx={{
        border: 1,
        borderColor: 'divider',
        borderRadius: 2,
        mb: 1,
        '&:hover': { bgcolor: 'action.hover' }
      }}
    >
      <ListItemAvatar>
        <Avatar sx={{ bgcolor: getRoleColor(user.role) }}>
          {getRoleIcon(user.role)}
        </Avatar>
      </ListItemAvatar>
      <ListItemText
        primary={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="body1" sx={{ fontWeight: 500 }}>
              {user.name}
            </Typography>
            <Chip
              label={user.role}
              size="small"
              sx={{
                bgcolor: `${getRoleColor(user.role)}20`,
                color: getRoleColor(user.role),
              }}
            />
          </Box>
        }
        secondary={
          <Box>
            <Typography variant="body2" color="text.secondary">
              {user.email}
            </Typography>
            {user.kycStatus && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                {getVerificationStatusIcon(user.kycStatus)}
                <Typography variant="caption">
                  KYC: {user.kycStatus.charAt(0).toUpperCase() + user.kycStatus.slice(1)}
                </Typography>
              </Box>
            )}
          </Box>
        }
      />
      <ListItemSecondaryAction>
        <Box sx={{ display: 'flex', gap: 1 }}>
          {actions.map((action, index) => (
            <Button
              key={index}
              size="small"
              variant={action.variant || 'outlined'}
              color={action.color || 'primary'}
              startIcon={action.icon}
              onClick={() => action.onClick(user)}
            >
              {action.label}
            </Button>
          ))}
        </Box>
      </ListItemSecondaryAction>
    </ListItem>
  );

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 600, color: blueCarbon.deepOcean, mb: 1 }}>
          Security & Verification Management
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage KYC verification, biometric authentication, and multi-factor authentication
        </Typography>
      </Box>

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            background: `linear-gradient(135deg, ${blueCarbon.forest}15 0%, ${blueCarbon.forest}25 100%)`,
            border: `1px solid ${blueCarbon.forest}30`
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: blueCarbon.forest }}>
                    {pendingKYC.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Pending KYC
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: blueCarbon.forest }}>
                  <VerifiedUser />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            background: `linear-gradient(135deg, ${blueCarbon.aqua}15 0%, ${blueCarbon.aqua}25 100%)`,
            border: `1px solid ${blueCarbon.aqua}30`
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: blueCarbon.aqua }}>
                    {pendingVerification.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Unverified Users
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: blueCarbon.aqua }}>
                  <Email />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            background: `linear-gradient(135deg, ${blueCarbon.oceanBlue}15 0%, ${blueCarbon.oceanBlue}25 100%)`,
            border: `1px solid ${blueCarbon.oceanBlue}30`
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: blueCarbon.oceanBlue }}>
                    {mfaDisabled.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    MFA Disabled
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: blueCarbon.oceanBlue }}>
                  <VpnKey />
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
                    {adminUsers.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Admin Users
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: '#ff9800' }}>
                  <Shield />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Verification Tabs */}
      <Card>
        <CardContent>
          <Tabs
            value={activeTab}
            onChange={(e, newValue) => setActiveTab(newValue)}
            sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}
          >
            <Tab 
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <VerifiedUser />
                  KYC Verification ({pendingKYC.length})
                </Box>
              } 
            />
            <Tab 
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Email />
                  User Verification ({pendingVerification.length})
                </Box>
              } 
            />
            <Tab 
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <VpnKey />
                  MFA Management ({mfaDisabled.length})
                </Box>
              } 
            />
            <Tab 
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Fingerprint />
                  Biometric Security ({adminUsers.length})
                </Box>
              } 
            />
          </Tabs>

          {/* KYC Verification Tab */}
          <TabPanel value={activeTab} index={0}>
            {pendingKYC.length === 0 ? (
              <Alert severity="success">
                No pending KYC verifications. All users have been processed.
              </Alert>
            ) : (
              <List>
                {pendingKYC.map((user) => (
                  <UserListItem
                    key={user.id}
                    user={user}
                    actions={[
                      {
                        label: 'View Documents',
                        icon: <Visibility />,
                        onClick: (user) => onNotification(`Viewing KYC documents for ${user.email}`, 'info')
                      },
                      {
                        label: 'Approve',
                        icon: <CheckCircle />,
                        color: 'success',
                        variant: 'contained',
                        onClick: (user) => handleVerificationAction(user, 'approve_kyc')
                      },
                      {
                        label: 'Reject',
                        icon: <Cancel />,
                        color: 'error',
                        onClick: (user) => handleVerificationAction(user, 'reject_kyc')
                      }
                    ]}
                  />
                ))}
              </List>
            )}
          </TabPanel>

          {/* User Verification Tab */}
          <TabPanel value={activeTab} index={1}>
            {pendingVerification.length === 0 ? (
              <Alert severity="success">
                All users have been verified.
              </Alert>
            ) : (
              <List>
                {pendingVerification.map((user) => (
                  <UserListItem
                    key={user.id}
                    user={user}
                    actions={[
                      {
                        label: 'Send Verification Email',
                        icon: <Send />,
                        onClick: (user) => onNotification(`Verification email sent to ${user.email}`, 'success')
                      },
                      {
                        label: 'Manual Verify',
                        icon: <CheckCircle />,
                        color: 'success',
                        variant: 'contained',
                        onClick: (user) => handleVerificationAction(user, 'verify_user')
                      }
                    ]}
                  />
                ))}
              </List>
            )}
          </TabPanel>

          {/* MFA Management Tab */}
          <TabPanel value={activeTab} index={2}>
            {mfaDisabled.length === 0 ? (
              <Alert severity="success">
                All users have MFA enabled.
              </Alert>
            ) : (
              <List>
                {mfaDisabled.map((user) => (
                  <UserListItem
                    key={user.id}
                    user={user}
                    actions={[
                      {
                        label: 'Enable MFA',
                        icon: <VpnKey />,
                        color: 'primary',
                        variant: 'contained',
                        onClick: (user) => handleVerificationAction(user, 'enable_mfa')
                      },
                      {
                        label: 'Send Setup Guide',
                        icon: <Send />,
                        onClick: (user) => onNotification(`MFA setup guide sent to ${user.email}`, 'info')
                      }
                    ]}
                  />
                ))}
              </List>
            )}
          </TabPanel>

          {/* Biometric Security Tab */}
          <TabPanel value={activeTab} index={3}>
            <Alert severity="info" sx={{ mb: 2 }}>
              Biometric authentication is available for admin users to enhance security.
            </Alert>
            <List>
              {adminUsers.map((user) => (
                <UserListItem
                  key={user.id}
                  user={user}
                  actions={[
                    {
                      label: 'Enroll Biometric',
                      icon: <Fingerprint />,
                      color: 'primary',
                      variant: 'contained',
                      onClick: (user) => handleBiometricEnrollment(user)
                    },
                    {
                      label: 'Test Recognition',
                      icon: <CameraAlt />,
                      onClick: (user) => onNotification(`Biometric test initiated for ${user.email}`, 'info')
                    }
                  ]}
                />
              ))}
            </List>
          </TabPanel>
        </CardContent>
      </Card>

      {/* Verification Action Dialog */}
      <Dialog open={verificationDialog} onClose={() => setVerificationDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          Verification Action
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ mb: 2 }}>
            {selectedUser && `Performing action on: ${selectedUser.email}`}
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Reason/Comments"
            value={verificationReason}
            onChange={(e) => setVerificationReason(e.target.value)}
            placeholder="Enter reason for this action..."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setVerificationDialog(false)}>
            Cancel
          </Button>
          <Button 
            onClick={executeVerificationAction} 
            variant="contained"
            disabled={!verificationReason.trim()}
          >
            Confirm Action
          </Button>
        </DialogActions>
      </Dialog>

      {/* Biometric Enrollment Dialog */}
      <Dialog open={biometricDialog} onClose={() => setBiometricDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          Biometric Enrollment
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ mb: 2 }}>
            {selectedUser && `Initiating biometric enrollment for: ${selectedUser.email}`}
          </Typography>
          <Alert severity="info" sx={{ mb: 2 }}>
            This will start the face recognition enrollment process. The user will need to complete the enrollment using their device camera.
          </Alert>
          <Box sx={{ textAlign: 'center', py: 3 }}>
            <Avatar sx={{ width: 80, height: 80, bgcolor: blueCarbon.oceanBlue, mx: 'auto', mb: 2 }}>
              <CameraAlt sx={{ fontSize: 40 }} />
            </Avatar>
            <Typography variant="body2" color="text.secondary">
              Face recognition enrollment will be initiated
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBiometricDialog(false)}>
            Cancel
          </Button>
          <Button 
            onClick={executeBiometricEnrollment} 
            variant="contained"
          >
            Start Enrollment
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SecurityVerificationPanel;