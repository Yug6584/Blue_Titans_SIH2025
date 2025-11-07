import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Switch,
  FormControlLabel,
  Alert,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
  LinearProgress,
} from '@mui/material';
import {
  Storage,
  Backup,
  CloudSync,
  Archive,
  Security,
  Schedule,
  Download,
} from '@mui/icons-material';
import { blueCarbon } from '../../../theme/colors';
import api from '../../../utils/api';

const DataManagementSettings = ({ onNotification }) => {
  const [settings, setSettings] = useState({
    backupInterval: 'daily',
    retentionPeriod: 90,
    autoSync: true,
    gdprCompliance: true
  });
  const [backupInProgress, setBackupInProgress] = useState(false);

  const handleSettingChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    onNotification('Data management setting updated', 'success');
  };

  const handleManualBackup = async () => {
    try {
      setBackupInProgress(true);
      const response = await api.post('/system-settings/backup');
      
      if (response.data.success) {
        onNotification('Manual backup completed successfully', 'success');
      } else {
        onNotification('Backup failed', 'error');
      }
    } catch (error) {
      onNotification('Error creating backup', 'error');
    } finally {
      setBackupInProgress(false);
    }
  };

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" sx={{ fontWeight: 600, color: blueCarbon.deepOcean, mb: 1 }}>
          Data Management
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Configure backup, synchronization, and data retention policies
        </Typography>
      </Box>

      <Grid container spacing={{ xs: 2, md: 3 }}>
        <Grid item xs={12} lg={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, display: 'flex', alignItems: 'center' }}>
                <Backup sx={{ mr: 1 }} />
                Backup Settings
              </Typography>

              <List>
                <ListItem>
                  <ListItemIcon>
                    <Schedule />
                  </ListItemIcon>
                  <ListItemText
                    primary="Backup Interval"
                    secondary="Automatic backup frequency"
                  />
                  <ListItemSecondaryAction>
                    <FormControl size="small" sx={{ minWidth: 120 }}>
                      <Select
                        value={settings.backupInterval}
                        onChange={(e) => handleSettingChange('backupInterval', e.target.value)}
                      >
                        <MenuItem value="hourly">Hourly</MenuItem>
                        <MenuItem value="daily">Daily</MenuItem>
                        <MenuItem value="weekly">Weekly</MenuItem>
                        <MenuItem value="monthly">Monthly</MenuItem>
                      </Select>
                    </FormControl>
                  </ListItemSecondaryAction>
                </ListItem>
                <Divider />

                <ListItem>
                  <ListItemIcon>
                    <Archive />
                  </ListItemIcon>
                  <ListItemText
                    primary="Retention Period"
                    secondary="Days to keep backup files"
                  />
                  <ListItemSecondaryAction>
                    <FormControl size="small" sx={{ minWidth: 120 }}>
                      <Select
                        value={settings.retentionPeriod}
                        onChange={(e) => handleSettingChange('retentionPeriod', e.target.value)}
                      >
                        <MenuItem value={30}>30 Days</MenuItem>
                        <MenuItem value={90}>90 Days</MenuItem>
                        <MenuItem value={180}>180 Days</MenuItem>
                        <MenuItem value={365}>1 Year</MenuItem>
                      </Select>
                    </FormControl>
                  </ListItemSecondaryAction>
                </ListItem>
                <Divider />

                <ListItem>
                  <ListItemIcon>
                    <CloudSync />
                  </ListItemIcon>
                  <ListItemText
                    primary="Auto Sync"
                    secondary="Automatically sync data changes"
                  />
                  <ListItemSecondaryAction>
                    <Switch
                      checked={settings.autoSync}
                      onChange={(e) => handleSettingChange('autoSync', e.target.checked)}
                      color="primary"
                    />
                  </ListItemSecondaryAction>
                </ListItem>
              </List>

              <Box sx={{ mt: 3 }}>
                <Button
                  variant="contained"
                  startIcon={backupInProgress ? null : <Download />}
                  onClick={handleManualBackup}
                  disabled={backupInProgress}
                  fullWidth
                  sx={{ bgcolor: blueCarbon.oceanBlue }}
                >
                  {backupInProgress ? (
                    <>
                      <LinearProgress sx={{ width: 100, mr: 2 }} />
                      Creating Backup...
                    </>
                  ) : (
                    'Create Manual Backup'
                  )}
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} lg={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, display: 'flex', alignItems: 'center' }}>
                <Security sx={{ mr: 1 }} />
                Compliance Settings
              </Typography>

              <List>
                <ListItem>
                  <ListItemIcon>
                    <Security />
                  </ListItemIcon>
                  <ListItemText
                    primary="GDPR Compliance"
                    secondary="Enable data protection compliance"
                  />
                  <ListItemSecondaryAction>
                    <Switch
                      checked={settings.gdprCompliance}
                      onChange={(e) => handleSettingChange('gdprCompliance', e.target.checked)}
                      color="primary"
                    />
                  </ListItemSecondaryAction>
                </ListItem>
              </List>

              <Alert severity="info" sx={{ mt: 2 }}>
                GDPR compliance ensures user data is handled according to European data protection regulations.
              </Alert>

              <Alert severity="success" sx={{ mt: 2 }}>
                All data management settings are configured for optimal security and compliance.
              </Alert>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DataManagementSettings;