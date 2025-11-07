import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  Switch,
  FormControlLabel,
  Alert,
  TextField,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
} from '@mui/material';
import {
  Build,
  Schedule,
  Warning,
  CheckCircle,
  Pause,
  PlayArrow,
} from '@mui/icons-material';
import { blueCarbon } from '../../../theme/colors';

const MaintenanceModes = ({ onNotification }) => {
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [scheduledMaintenance, setScheduledMaintenance] = useState({
    enabled: false,
    startTime: '',
    endTime: '',
    message: 'System maintenance in progress. Please try again later.'
  });

  const handleMaintenanceToggle = () => {
    setMaintenanceMode(!maintenanceMode);
    onNotification(
      maintenanceMode ? 'Maintenance mode disabled' : 'Maintenance mode enabled',
      maintenanceMode ? 'success' : 'warning'
    );
  };

  const handleScheduleChange = (key, value) => {
    setScheduledMaintenance(prev => ({ ...prev, [key]: value }));
    onNotification('Maintenance schedule updated', 'success');
  };

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" sx={{ fontWeight: 600, color: blueCarbon.deepOcean, mb: 1 }}>
          Maintenance Modes
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Configure system maintenance and scheduled downtime
        </Typography>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, display: 'flex', alignItems: 'center' }}>
                <Build sx={{ mr: 1 }} />
                Maintenance Mode
              </Typography>

              <Box sx={{ mb: 3 }}>
                <Chip
                  icon={maintenanceMode ? <Pause /> : <CheckCircle />}
                  label={maintenanceMode ? 'Maintenance Active' : 'System Online'}
                  color={maintenanceMode ? 'warning' : 'success'}
                  sx={{ mb: 2 }}
                />
              </Box>

              <Button
                variant="contained"
                startIcon={maintenanceMode ? <PlayArrow /> : <Pause />}
                onClick={handleMaintenanceToggle}
                color={maintenanceMode ? 'success' : 'warning'}
                fullWidth
                sx={{ mb: 2 }}
              >
                {maintenanceMode ? 'Disable Maintenance Mode' : 'Enable Maintenance Mode'}
              </Button>

              {maintenanceMode && (
                <Alert severity="warning">
                  Maintenance mode is active. Users will see a maintenance message and cannot access the system.
                </Alert>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, display: 'flex', alignItems: 'center' }}>
                <Schedule sx={{ mr: 1 }} />
                Scheduled Maintenance
              </Typography>

              <FormControlLabel
                control={
                  <Switch
                    checked={scheduledMaintenance.enabled}
                    onChange={(e) => handleScheduleChange('enabled', e.target.checked)}
                  />
                }
                label="Enable Scheduled Maintenance"
                sx={{ mb: 2 }}
              />

              {scheduledMaintenance.enabled && (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <TextField
                    label="Start Time"
                    type="datetime-local"
                    value={scheduledMaintenance.startTime}
                    onChange={(e) => handleScheduleChange('startTime', e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    fullWidth
                  />
                  <TextField
                    label="End Time"
                    type="datetime-local"
                    value={scheduledMaintenance.endTime}
                    onChange={(e) => handleScheduleChange('endTime', e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    fullWidth
                  />
                  <TextField
                    label="Maintenance Message"
                    multiline
                    rows={3}
                    value={scheduledMaintenance.message}
                    onChange={(e) => handleScheduleChange('message', e.target.value)}
                    fullWidth
                  />
                </Box>
              )}

              <Alert severity="info" sx={{ mt: 2 }}>
                Scheduled maintenance will automatically enable maintenance mode during the specified time window.
              </Alert>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default MaintenanceModes;