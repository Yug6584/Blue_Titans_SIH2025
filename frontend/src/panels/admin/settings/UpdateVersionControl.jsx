import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  Alert,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  LinearProgress,
} from '@mui/material';
import {
  SystemUpdate,
  CheckCircle,
  NewReleases,
  History,
  Download,
  Security,
} from '@mui/icons-material';
import { blueCarbon } from '../../../theme/colors';

const UpdateVersionControl = ({ onNotification }) => {
  const [updateInProgress, setUpdateInProgress] = useState(false);
  const [systemInfo] = useState({
    currentVersion: '1.0.0',
    lastUpdate: '2024-01-15',
    updateAvailable: false,
    latestVersion: '1.0.0'
  });

  const handleCheckUpdates = () => {
    onNotification('Checking for updates...', 'info');
    setTimeout(() => {
      onNotification('System is up to date', 'success');
    }, 2000);
  };

  const handleUpdate = () => {
    setUpdateInProgress(true);
    onNotification('Update started...', 'info');
    setTimeout(() => {
      setUpdateInProgress(false);
      onNotification('System updated successfully', 'success');
    }, 5000);
  };

  const updateHistory = [
    { version: '1.0.0', date: '2024-01-15', type: 'Major Release', description: 'Initial production release' },
    { version: '0.9.5', date: '2024-01-10', type: 'Bug Fix', description: 'Security patches and bug fixes' },
    { version: '0.9.0', date: '2024-01-05', type: 'Feature Update', description: 'New admin features and improvements' }
  ];

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" sx={{ fontWeight: 600, color: blueCarbon.deepOcean, mb: 1 }}>
          Updates & Version Control
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage system updates and version history
        </Typography>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, display: 'flex', alignItems: 'center' }}>
                <SystemUpdate sx={{ mr: 1 }} />
                Current Version
              </Typography>

              <Box sx={{ mb: 3 }}>
                <Typography variant="h4" sx={{ fontWeight: 700, color: blueCarbon.oceanBlue, mb: 1 }}>
                  v{systemInfo.currentVersion}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Last updated: {new Date(systemInfo.lastUpdate).toLocaleDateString()}
                </Typography>
              </Box>

              <Box sx={{ mb: 3 }}>
                <Chip
                  icon={<CheckCircle />}
                  label="System Up to Date"
                  color="success"
                  sx={{ mb: 2 }}
                />
              </Box>

              <Button
                variant="outlined"
                startIcon={<NewReleases />}
                onClick={handleCheckUpdates}
                fullWidth
                sx={{ mb: 2, borderColor: blueCarbon.oceanBlue, color: blueCarbon.oceanBlue }}
              >
                Check for Updates
              </Button>

              {systemInfo.updateAvailable && (
                <Button
                  variant="contained"
                  startIcon={updateInProgress ? null : <Download />}
                  onClick={handleUpdate}
                  disabled={updateInProgress}
                  fullWidth
                  sx={{ bgcolor: blueCarbon.oceanBlue }}
                >
                  {updateInProgress ? (
                    <>
                      <LinearProgress sx={{ width: 100, mr: 2 }} />
                      Updating...
                    </>
                  ) : (
                    `Update to v${systemInfo.latestVersion}`
                  )}
                </Button>
              )}

              {!systemInfo.updateAvailable && (
                <Alert severity="success">
                  Your system is running the latest version.
                </Alert>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, display: 'flex', alignItems: 'center' }}>
                <History sx={{ mr: 1 }} />
                Update History
              </Typography>

              <List>
                {updateHistory.map((update, index) => (
                  <ListItem key={index} sx={{ px: 0 }}>
                    <ListItemIcon>
                      {update.type === 'Major Release' ? <NewReleases /> : 
                       update.type === 'Security Update' ? <Security /> : <CheckCircle />}
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="body1" sx={{ fontWeight: 600 }}>
                            v{update.version}
                          </Typography>
                          <Chip
                            label={update.type}
                            size="small"
                            color={update.type === 'Major Release' ? 'primary' : 'default'}
                          />
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            {update.description}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {new Date(update.date).toLocaleDateString()}
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                ))}
              </List>

              <Alert severity="info" sx={{ mt: 2 }}>
                System updates are automatically backed up before installation.
              </Alert>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default UpdateVersionControl;