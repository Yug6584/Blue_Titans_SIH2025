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
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
  Chip,
} from '@mui/material';
import {
  Assessment,
  Security,
  Download,
  Visibility,
  Shield,
  CheckCircle,
} from '@mui/icons-material';
import { blueCarbon } from '../../../theme/colors';

const AuditCompliance = ({ onNotification }) => {
  const [settings, setSettings] = useState({
    enableLogging: true,
    exportEnabled: true,
    complianceMode: true,
    autoReports: true
  });

  const handleSettingChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    onNotification('Audit setting updated', 'success');
  };

  const handleGenerateReport = () => {
    onNotification('Compliance report generated successfully', 'success');
  };

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" sx={{ fontWeight: 600, color: blueCarbon.deepOcean, mb: 1 }}>
          Audit & Compliance
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Configure audit logging and compliance reporting
        </Typography>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, display: 'flex', alignItems: 'center' }}>
                <Security sx={{ mr: 1 }} />
                Audit Settings
              </Typography>

              <List>
                <ListItem>
                  <ListItemIcon>
                    <Visibility />
                  </ListItemIcon>
                  <ListItemText
                    primary="Enable Audit Logging"
                    secondary="Log all administrative actions"
                  />
                  <ListItemSecondaryAction>
                    <Switch
                      checked={settings.enableLogging}
                      onChange={(e) => handleSettingChange('enableLogging', e.target.checked)}
                      color="primary"
                    />
                  </ListItemSecondaryAction>
                </ListItem>
                <Divider />

                <ListItem>
                  <ListItemIcon>
                    <Download />
                  </ListItemIcon>
                  <ListItemText
                    primary="Export Enabled"
                    secondary="Allow audit log exports"
                  />
                  <ListItemSecondaryAction>
                    <Switch
                      checked={settings.exportEnabled}
                      onChange={(e) => handleSettingChange('exportEnabled', e.target.checked)}
                      color="primary"
                    />
                  </ListItemSecondaryAction>
                </ListItem>
                <Divider />

                <ListItem>
                  <ListItemIcon>
                    <Shield />
                  </ListItemIcon>
                  <ListItemText
                    primary="Compliance Mode"
                    secondary="Enhanced logging for compliance"
                  />
                  <ListItemSecondaryAction>
                    <Switch
                      checked={settings.complianceMode}
                      onChange={(e) => handleSettingChange('complianceMode', e.target.checked)}
                      color="primary"
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
                <Assessment sx={{ mr: 1 }} />
                Compliance Reports
              </Typography>

              <Alert severity="success" sx={{ mb: 3 }}>
                <Typography variant="body2">
                  All audit settings are properly configured for compliance requirements.
                </Typography>
              </Alert>

              <Button
                variant="contained"
                startIcon={<Download />}
                onClick={handleGenerateReport}
                fullWidth
                sx={{ bgcolor: blueCarbon.oceanBlue, mb: 2 }}
              >
                Generate Compliance Report
              </Button>

              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Chip
                  icon={<CheckCircle />}
                  label="Audit Logging Active"
                  color="success"
                  size="small"
                />
                <Chip
                  icon={<CheckCircle />}
                  label="Export Ready"
                  color="success"
                  size="small"
                />
                <Chip
                  icon={<CheckCircle />}
                  label="Compliance Mode"
                  color="success"
                  size="small"
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AuditCompliance;