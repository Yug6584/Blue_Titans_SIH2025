import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  TextField,
  Switch,
  FormControlLabel,
  Alert,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
} from '@mui/material';
import {
  Image,
  Announcement,
  Email,
  Business,
} from '@mui/icons-material';
import { blueCarbon } from '../../../theme/colors';

const PlatformCustomization = ({ onNotification }) => {
  const [settings, setSettings] = useState({
    theme: 'default',
    logo: 'default',
    companyName: 'BlueCarbon Ledger',
    supportEmail: 'support@bluecarbon.com',
    announcementEnabled: false,
    announcementText: ''
  });

  const handleSettingChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    onNotification('Customization setting updated', 'success');
  };

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" sx={{ fontWeight: 600, color: blueCarbon.deepOcean, mb: 1 }}>
          Platform Customization
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Customize themes, branding, and platform appearance
        </Typography>
      </Box>

      <Grid container spacing={{ xs: 2, md: 3 }}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, display: 'flex', alignItems: 'center' }}>
                <Business sx={{ mr: 1 }} />
                Branding Settings
              </Typography>

              <List>
                <ListItem>
                  <ListItemIcon>
                    <Image />
                  </ListItemIcon>
                  <ListItemText
                    primary="Company Name"
                    secondary="Display name for the platform"
                  />
                  <ListItemSecondaryAction>
                    <TextField
                      size="small"
                      value={settings.companyName}
                      onChange={(e) => handleSettingChange('companyName', e.target.value)}
                      sx={{ width: { xs: 150, md: 200 } }}
                    />
                  </ListItemSecondaryAction>
                </ListItem>
                <Divider />

                <ListItem>
                  <ListItemIcon>
                    <Email />
                  </ListItemIcon>
                  <ListItemText
                    primary="Support Email"
                    secondary="Contact email for user support"
                  />
                  <ListItemSecondaryAction>
                    <TextField
                      size="small"
                      type="email"
                      value={settings.supportEmail}
                      onChange={(e) => handleSettingChange('supportEmail', e.target.value)}
                      sx={{ width: { xs: 150, md: 200 } }}
                    />
                  </ListItemSecondaryAction>
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, display: 'flex', alignItems: 'center' }}>
                <Announcement sx={{ mr: 1 }} />
                Announcements
              </Typography>

              <FormControlLabel
                control={
                  <Switch
                    checked={settings.announcementEnabled}
                    onChange={(e) => handleSettingChange('announcementEnabled', e.target.checked)}
                  />
                }
                label="Enable Platform Announcements"
                sx={{ mb: 2 }}
              />

              {settings.announcementEnabled && (
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label="Announcement Text"
                  value={settings.announcementText}
                  onChange={(e) => handleSettingChange('announcementText', e.target.value)}
                  placeholder="Enter announcement message..."
                />
              )}

              <Alert severity="info" sx={{ mt: 2 }}>
                Announcements will be displayed to all users on the platform.
              </Alert>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default PlatformCustomization;