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
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  Chip,
  LinearProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
  Avatar,
} from '@mui/material';
import {
  Security,
  Lock,
  VpnKey,
  Shield,
  Warning,
  CheckCircle,
  AccessTime,
  Block,
  Visibility,
  VisibilityOff,
  Key,
  Timer,
  Person,
  Email,
} from '@mui/icons-material';
import { blueCarbon } from '../../../theme/colors';
import api from '../../../utils/api';

const SecurityControls = ({ onNotification, loading }) => {
  const [securityStats, setSecurityStats] = useState({
    totalLogins: 0,
    successfulLogins: 0,
    failedLogins: 0,
    logins24h: 0,
    successRate: 100
  });
  const [settings, setSettings] = useState({
    mfaRequired: false,
    passwordComplexity: 'medium',
    sessionTimeout: 30,
    maxLoginAttempts: 5,
    lockoutDuration: 15,
    requireEmailVerification: true
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showPasswords, setShowPasswords] = useState(false);

  useEffect(() => {
    loadSecurityData();
  }, []);

  const loadSecurityData = async () => {
    try {
      setIsLoading(true);
      const [statsResponse, settingsResponse] = await Promise.all([
        api.get('/system-settings/stats'),
        api.get('/system-settings/settings')
      ]);
      
      if (statsResponse.data.success) {
        setSecurityStats(statsResponse.data.data.security);
      }
      
      if (settingsResponse.data.success) {
        setSettings(settingsResponse.data.settings.security);
      }
    } catch (error) {
      console.error('Error loading security data:', error);
      onNotification('Error loading security data', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSettingChange = async (key, value) => {
    try {
      const updatedSettings = { ...settings, [key]: value };
      setSettings(updatedSettings);
      
      // Save to backend
      await api.put('/system-settings/settings', {
        category: 'security',
        settings: updatedSettings
      });
      
      onNotification('Security setting updated successfully', 'success');
    } catch (error) {
      console.error('Error updating setting:', error);
      onNotification('Failed to update security setting', 'error');
    }
  };

  const getSecurityScore = () => {
    let score = 0;
    if (settings.mfaRequired) score += 25;
    if (settings.passwordComplexity === 'high') score += 20;
    else if (settings.passwordComplexity === 'medium') score += 15;
    if (settings.sessionTimeout <= 30) score += 15;
    if (settings.maxLoginAttempts <= 5) score += 15;
    if (settings.requireEmailVerification) score += 15;
    if (securityStats.successRate >= 95) score += 10;
    
    return Math.min(score, 100);
  };

  const getSecurityLevel = (score) => {
    if (score >= 90) return { level: 'Excellent', color: '#4caf50' };
    if (score >= 70) return { level: 'Good', color: '#ff9800' };
    if (score >= 50) return { level: 'Fair', color: '#ff5722' };
    return { level: 'Poor', color: '#f44336' };
  };

  const securityScore = getSecurityScore();
  const securityLevel = getSecurityLevel(securityScore);

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
          Security Controls
        </Typography>
        <Typography 
          variant="body1" 
          color="text.secondary"
          sx={{ 
            fontSize: { xs: '0.9rem', md: '1rem' },
            wordBreak: 'break-word'
          }}
        >
          Configure authentication policies and security measures
        </Typography>
      </Box>

      {isLoading && <LinearProgress sx={{ mb: 3 }} />}

      {/* Security Overview */}
      <Grid container spacing={{ xs: 2, md: 3 }} sx={{ mb: { xs: 2, md: 3 }, mx: { xs: 0.5, sm: 0 } }}>
        {/* Security Score */}
        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ 
            background: `linear-gradient(135deg, ${securityLevel.color}15 0%, ${securityLevel.color}25 100%)`,
            border: `1px solid ${securityLevel.color}30`
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: securityLevel.color, mr: 2 }}>
                  <Shield />
                </Avatar>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Security Score
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Overall security rating
                  </Typography>
                </Box>
              </Box>
              <Typography variant="h3" sx={{ fontWeight: 700, color: securityLevel.color, mb: 1 }}>
                {securityScore}%
              </Typography>
              <Chip 
                label={securityLevel.level} 
                sx={{ bgcolor: `${securityLevel.color}20`, color: securityLevel.color }}
              />
            </CardContent>
          </Card>
        </Grid>

        {/* Login Statistics */}
        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: blueCarbon.oceanBlue, mr: 2 }}>
                  <Person />
                </Avatar>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Login Activity
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Authentication statistics
                  </Typography>
                </Box>
              </Box>
              <Typography variant="h3" sx={{ fontWeight: 700, color: blueCarbon.oceanBlue, mb: 1 }}>
                {securityStats.successRate}%
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Success Rate
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Chip 
                  label={`${securityStats.successfulLogins} Success`} 
                  size="small" 
                  color="success"
                />
                <Chip 
                  label={`${securityStats.failedLogins} Failed`} 
                  size="small" 
                  color="error"
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Activity */}
        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: '#ff9800', mr: 2 }}>
                  <AccessTime />
                </Avatar>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Recent Activity
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Last 24 hours
                  </Typography>
                </Box>
              </Box>
              <Typography variant="h3" sx={{ fontWeight: 700, color: '#ff9800', mb: 1 }}>
                {securityStats.logins24h}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Login Attempts
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Security Settings */}
      <Grid container spacing={{ xs: 2, md: 3 }}>
        {/* Authentication Settings */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, display: 'flex', alignItems: 'center' }}>
                <VpnKey sx={{ mr: 1 }} />
                Authentication Settings
              </Typography>

              <List>
                <ListItem>
                  <ListItemIcon>
                    <Key />
                  </ListItemIcon>
                  <ListItemText
                    primary="Multi-Factor Authentication"
                    secondary="Require 2FA for all user accounts"
                  />
                  <ListItemSecondaryAction>
                    <Switch
                      checked={settings.mfaRequired}
                      onChange={(e) => handleSettingChange('mfaRequired', e.target.checked)}
                      color="primary"
                    />
                  </ListItemSecondaryAction>
                </ListItem>
                <Divider />

                <ListItem>
                  <ListItemIcon>
                    <Email />
                  </ListItemIcon>
                  <ListItemText
                    primary="Email Verification"
                    secondary="Require email verification for new accounts"
                  />
                  <ListItemSecondaryAction>
                    <Switch
                      checked={settings.requireEmailVerification}
                      onChange={(e) => handleSettingChange('requireEmailVerification', e.target.checked)}
                      color="primary"
                    />
                  </ListItemSecondaryAction>
                </ListItem>
                <Divider />

                <ListItem>
                  <ListItemIcon>
                    <Lock />
                  </ListItemIcon>
                  <ListItemText
                    primary="Password Complexity"
                    secondary="Minimum password requirements"
                  />
                  <ListItemSecondaryAction>
                    <FormControl size="small" sx={{ minWidth: 120 }}>
                      <Select
                        value={settings.passwordComplexity}
                        onChange={(e) => handleSettingChange('passwordComplexity', e.target.value)}
                      >
                        <MenuItem value="low">Low</MenuItem>
                        <MenuItem value="medium">Medium</MenuItem>
                        <MenuItem value="high">High</MenuItem>
                      </Select>
                    </FormControl>
                  </ListItemSecondaryAction>
                </ListItem>
                <Divider />

                <ListItem>
                  <ListItemIcon>
                    <Timer />
                  </ListItemIcon>
                  <ListItemText
                    primary="Session Timeout"
                    secondary="Automatic logout after inactivity (minutes)"
                  />
                  <ListItemSecondaryAction>
                    <TextField
                      size="small"
                      type="number"
                      value={settings.sessionTimeout}
                      onChange={(e) => handleSettingChange('sessionTimeout', parseInt(e.target.value))}
                      sx={{ width: { xs: 60, md: 80 } }}
                      inputProps={{ min: 5, max: 480 }}
                    />
                  </ListItemSecondaryAction>
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Security Policies */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, display: 'flex', alignItems: 'center' }}>
                <Security />
                Security Policies
              </Typography>

              <List>
                <ListItem>
                  <ListItemIcon>
                    <Block />
                  </ListItemIcon>
                  <ListItemText
                    primary="Max Login Attempts"
                    secondary="Lock account after failed attempts"
                  />
                  <ListItemSecondaryAction>
                    <TextField
                      size="small"
                      type="number"
                      value={settings.maxLoginAttempts}
                      onChange={(e) => handleSettingChange('maxLoginAttempts', parseInt(e.target.value))}
                      sx={{ width: { xs: 60, md: 80 } }}
                      inputProps={{ min: 3, max: 10 }}
                    />
                  </ListItemSecondaryAction>
                </ListItem>
                <Divider />

                <ListItem>
                  <ListItemIcon>
                    <AccessTime />
                  </ListItemIcon>
                  <ListItemText
                    primary="Lockout Duration"
                    secondary="Account lockout time (minutes)"
                  />
                  <ListItemSecondaryAction>
                    <TextField
                      size="small"
                      type="number"
                      value={settings.lockoutDuration}
                      onChange={(e) => handleSettingChange('lockoutDuration', parseInt(e.target.value))}
                      sx={{ width: { xs: 60, md: 80 } }}
                      inputProps={{ min: 5, max: 60 }}
                    />
                  </ListItemSecondaryAction>
                </ListItem>
              </List>

              {/* Security Recommendations */}
              <Box sx={{ mt: 3 }}>
                <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                  Security Recommendations
                </Typography>
                
                {!settings.mfaRequired && (
                  <Alert severity="warning" sx={{ mb: 2 }}>
                    <Typography variant="body2">
                      Enable Multi-Factor Authentication to improve security
                    </Typography>
                  </Alert>
                )}
                
                {settings.passwordComplexity === 'low' && (
                  <Alert severity="warning" sx={{ mb: 2 }}>
                    <Typography variant="body2">
                      Consider increasing password complexity requirements
                    </Typography>
                  </Alert>
                )}
                
                {securityStats.failedLogins > 10 && (
                  <Alert severity="error" sx={{ mb: 2 }}>
                    <Typography variant="body2">
                      High number of failed login attempts detected. Review security logs.
                    </Typography>
                  </Alert>
                )}
                
                {securityScore >= 90 && (
                  <Alert severity="success">
                    <Typography variant="body2">
                      Excellent security configuration! Your system is well protected.
                    </Typography>
                  </Alert>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default SecurityControls;