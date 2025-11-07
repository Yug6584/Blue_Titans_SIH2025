import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Divider,
  Paper,
  Avatar
} from '@mui/material';
import {
  Settings,
  Lock,
  Person,
  Email,
  Business,
  Security,
  Close
} from '@mui/icons-material';
import PasswordChange from './PasswordChange';

const UserSettings = ({ open, onClose, user, onLogout }) => {
  const [passwordChangeOpen, setPasswordChangeOpen] = useState(false);

  const handlePasswordChangeClick = () => {
    setPasswordChangeOpen(true);
  };

  const handlePasswordChangeClose = () => {
    setPasswordChangeOpen(false);
  };

  const handlePasswordChangeLogout = () => {
    setPasswordChangeOpen(false);
    onClose();
    onLogout();
  };

  const getPanelTypeDisplay = (panel) => {
    switch (panel) {
      case 'admin': return 'Administrator';
      case 'company': return 'Company User';
      case 'government': return 'Government User';
      default: return 'User';
    }
  };

  const getPanelColor = (panel) => {
    switch (panel) {
      case 'admin': return 'error';
      case 'company': return 'primary';
      case 'government': return 'success';
      default: return 'default';
    }
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Settings color="primary" />
              <Typography variant="h6">User Settings</Typography>
            </Box>
            <Button onClick={onClose} size="small">
              <Close />
            </Button>
          </Box>
        </DialogTitle>

        <DialogContent>
          {/* User Profile Section */}
          <Paper sx={{ p: 3, mb: 3, bgcolor: 'primary.light', color: 'primary.contrastText' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar 
                sx={{ 
                  width: 60, 
                  height: 60, 
                  bgcolor: 'primary.main',
                  fontSize: '1.5rem'
                }}
              >
                {user?.name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || 'U'}
              </Avatar>
              <Box>
                <Typography variant="h6" gutterBottom>
                  {user?.name || 'User'}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  {user?.email}
                </Typography>
                <Typography 
                  variant="caption" 
                  sx={{ 
                    bgcolor: `${getPanelColor(user?.panel)}.main`,
                    color: 'white',
                    px: 1,
                    py: 0.5,
                    borderRadius: 1,
                    mt: 0.5,
                    display: 'inline-block'
                  }}
                >
                  {getPanelTypeDisplay(user?.panel)}
                </Typography>
              </Box>
            </Box>
          </Paper>

          {/* Account Information */}
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Person color="primary" />
            Account Information
          </Typography>

          <List>
            <ListItem>
              <ListItemIcon>
                <Email />
              </ListItemIcon>
              <ListItemText 
                primary="Email Address" 
                secondary={user?.email || 'Not available'}
              />
            </ListItem>

            <ListItem>
              <ListItemIcon>
                <Business />
              </ListItemIcon>
              <ListItemText 
                primary="Organization" 
                secondary={user?.organization || 'Not specified'}
              />
            </ListItem>

            <ListItem>
              <ListItemIcon>
                <Person />
              </ListItemIcon>
              <ListItemText 
                primary="Account Type" 
                secondary={getPanelTypeDisplay(user?.panel)}
              />
            </ListItem>
          </List>

          <Divider sx={{ my: 2 }} />

          {/* Security Settings */}
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Security color="primary" />
            Security Settings
          </Typography>

          <List>
            <ListItemButton onClick={handlePasswordChangeClick}>
              <ListItemIcon>
                <Lock />
              </ListItemIcon>
              <ListItemText 
                primary="Change Password" 
                secondary="Update your account password with email verification"
              />
            </ListItemButton>
          </List>

          <Paper sx={{ p: 2, mt: 2, bgcolor: 'info.light' }}>
            <Typography variant="body2" color="info.contrastText">
              <strong>Security Note:</strong> Changing your password will automatically log you out 
              from all devices for security purposes. You'll need to log in again with your new password.
            </Typography>
          </Paper>
        </DialogContent>

        <DialogActions>
          <Button onClick={onClose} variant="outlined">
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Password Change Dialog */}
      <PasswordChange
        open={passwordChangeOpen}
        onClose={handlePasswordChangeClose}
        onLogout={handlePasswordChangeLogout}
      />
    </>
  );
};

export default UserSettings;