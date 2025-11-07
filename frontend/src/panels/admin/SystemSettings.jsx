import React, { useState, useEffect } from 'react';
import {
  Typography,
  Box,
  Tabs,
  Tab,
  Paper,
  Alert,
  Snackbar,
} from '@mui/material';
import {
  Settings,
  Security,
  Palette,
  Storage,
  Speed,
  Link,
  Assessment,
  Notifications,
  Build,
  SystemUpdate,
} from '@mui/icons-material';
import { blueCarbon } from '../../theme/colors';

// Import setting components (we'll create these)
import UserRolesPermissions from './settings/UserRolesPermissions';
import SecurityControls from './settings/SecurityControls';
import PlatformCustomization from './settings/PlatformCustomization';
import DataManagementSettings from './settings/DataManagementSettings';
import SystemPerformance from './settings/SystemPerformance';
import IntegrationManagement from './settings/IntegrationManagement';
import AuditCompliance from './settings/AuditCompliance';
import NotificationSettings from './settings/NotificationSettings';
import MaintenanceModes from './settings/MaintenanceModes';
import UpdateVersionControl from './settings/UpdateVersionControl';

const SystemSettings = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'info' });
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({});

  const tabs = [
    { 
      label: 'User Roles & Permissions', 
      icon: <Settings />, 
      component: UserRolesPermissions,
      description: 'Manage role definitions and access privileges'
    },
    { 
      label: 'Security Controls', 
      icon: <Security />, 
      component: SecurityControls,
      description: 'Authentication and security policies'
    },
    { 
      label: 'Platform Customization', 
      icon: <Palette />, 
      component: PlatformCustomization,
      description: 'Themes, branding, and announcements'
    },
    { 
      label: 'Data Management', 
      icon: <Storage />, 
      component: DataManagementSettings,
      description: 'Backup, sync, and archiving policies'
    },
    { 
      label: 'System Performance', 
      icon: <Speed />, 
      component: SystemPerformance,
      description: 'API limits, caching, and optimization'
    },
    { 
      label: 'Integration Management', 
      icon: <Link />, 
      component: IntegrationManagement,
      description: 'External APIs and webhook configuration'
    },
    { 
      label: 'Audit & Compliance', 
      icon: <Assessment />, 
      component: AuditCompliance,
      description: 'Audit reports and compliance settings'
    },
    { 
      label: 'Notification Settings', 
      icon: <Notifications />, 
      component: NotificationSettings,
      description: 'Email servers and notification templates'
    },
    { 
      label: 'Maintenance Modes', 
      icon: <Build />, 
      component: MaintenanceModes,
      description: 'Scheduled maintenance and downtime'
    },
    { 
      label: 'Updates & Version Control', 
      icon: <SystemUpdate />, 
      component: UpdateVersionControl,
      description: 'System updates and version management'
    },
  ];

  // Load settings data
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    try {
      // In production, this would be an actual API call
      const mockSettings = {
        userRoles: {
          company: { enabled: true, permissions: ['read', 'write', 'submit_mrv'] },
          government: { enabled: true, permissions: ['read', 'verify', 'approve'] },
          admin: { enabled: true, permissions: ['read', 'write', 'admin', 'super_admin'] }
        },
        security: {
          mfaRequired: true,
          passwordComplexity: 'high',
          sessionTimeout: 30,
          faceVerificationRequired: false
        },
        customization: {
          theme: 'ocean-forest',
          logo: 'default',
          announcementEnabled: false,
          announcementText: ''
        },
        dataManagement: {
          backupInterval: 'daily',
          retentionPeriod: 90,
          autoSync: true,
          gdprCompliance: true
        },
        performance: {
          apiRateLimit: 1000,
          cacheEnabled: true,
          logRetention: 30
        },
        integrations: {
          gisApiEnabled: true,
          emailServerConfigured: true,
          webhooksEnabled: false
        },
        audit: {
          autoReports: true,
          exportEnabled: true,
          privacyMode: false
        },
        notifications: {
          smtpConfigured: true,
          inAppEnabled: true,
          emailEnabled: true
        },
        maintenance: {
          scheduledMaintenance: false,
          maintenanceWindow: null
        },
        version: {
          current: '1.0.0',
          lastUpdate: new Date('2024-01-15'),
          updateAvailable: false
        }
      };
      setSettings(mockSettings);
    } catch (error) {
      showNotification('Failed to load system settings', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (message, severity = 'info') => {
    setNotification({ open: true, message, severity });
  };

  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleSettingUpdate = (category, updates) => {
    setSettings(prev => ({
      ...prev,
      [category]: { ...prev[category], ...updates }
    }));
    showNotification('Settings updated successfully', 'success');
  };

  const ActiveComponent = tabs[activeTab].component;

  return (
    <Box sx={{ 
      width: '100%', 
      maxWidth: '100vw', 
      minWidth: 0,
      overflow: 'hidden', 
      p: { xs: 0.5, sm: 1, md: 2 },
      boxSizing: 'border-box'
    }}>
      {/* Header */}
      <Box sx={{ mb: { xs: 1, md: 2 }, px: { xs: 1, sm: 0 } }}>
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          mb: 1, 
          flexDirection: { xs: 'column', sm: 'row' }, 
          textAlign: { xs: 'center', sm: 'left' },
          width: '100%',
          maxWidth: '100%'
        }}>
          <Settings 
            sx={{ 
              fontSize: { xs: 28, sm: 32, md: 40 }, 
              mr: { xs: 0, sm: 2 }, 
              mb: { xs: 0.5, sm: 0 },
              color: blueCarbon.oceanBlue 
            }} 
          />
          <Box sx={{ width: '100%', minWidth: 0 }}>
            <Typography 
              variant="h4" 
              className="gradient-text" 
              gutterBottom 
              sx={{ 
                fontSize: { xs: '1.25rem', sm: '1.5rem', md: '2.125rem' },
                wordBreak: 'break-word',
                hyphens: 'auto'
              }}
            >
              System Settings
            </Typography>
            <Typography 
              variant="body1" 
              color="text.secondary" 
              sx={{ 
                fontSize: { xs: '0.8rem', sm: '0.9rem', md: '1rem' },
                wordBreak: 'break-word',
                hyphens: 'auto'
              }}
            >
              Configure platform settings, security policies, and system behavior
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Navigation Tabs */}
      <Paper sx={{ 
        mb: { xs: 1, md: 2 }, 
        width: '100%', 
        maxWidth: '100%',
        overflow: 'hidden',
        mx: { xs: 0.5, sm: 0 }
      }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          allowScrollButtonsMobile
          sx={{
            borderBottom: 1,
            borderColor: 'divider',
            width: '100%',
            maxWidth: '100%',
            '& .MuiTab-root': {
              minHeight: { xs: 48, sm: 60, md: 72 },
              textTransform: 'none',
              fontSize: { xs: '0.7rem', sm: '0.8rem', md: '0.9rem' },
              fontWeight: 500,
              minWidth: { xs: 80, sm: 120, md: 160 },
              maxWidth: { xs: 120, sm: 180, md: 200 },
              padding: { xs: '6px 8px', sm: '8px 12px', md: '12px 16px' }
            },
            '& .MuiTabs-scrollButtons': {
              width: { xs: 32, md: 40 }
            }
          }}
        >
          {tabs.map((tab, index) => (
            <Tab
              key={index}
              label={
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  flexDirection: 'column', 
                  width: '100%',
                  minWidth: 0,
                  maxWidth: '100%'
                }}>
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    mb: { xs: 0, md: 0.5 },
                    width: '100%',
                    justifyContent: 'center'
                  }}>
                    <Box sx={{ 
                      fontSize: { xs: '1rem', sm: '1.1rem', md: '1.2rem' },
                      mr: { xs: 0.5, md: 1 },
                      display: 'flex',
                      alignItems: 'center'
                    }}>
                      {tab.icon}
                    </Box>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        fontSize: { xs: '0.65rem', sm: '0.75rem', md: '0.875rem' },
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        maxWidth: { xs: '60px', sm: '80px', md: '120px' },
                        lineHeight: 1.2
                      }}
                    >
                      {tab.label}
                    </Typography>
                  </Box>
                  <Typography 
                    variant="caption" 
                    color="text.secondary" 
                    sx={{ 
                      textAlign: 'center',
                      display: { xs: 'none', lg: 'block' },
                      fontSize: '0.65rem',
                      lineHeight: 1.1,
                      maxWidth: '120px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {tab.description}
                  </Typography>
                </Box>
              }
            />
          ))}
        </Tabs>
      </Paper>

      {/* Active Tab Content */}
      <Box sx={{ 
        mt: { xs: 1, md: 2 }, 
        width: '100%', 
        maxWidth: '100%', 
        minWidth: 0,
        overflow: 'hidden',
        px: { xs: 0.5, sm: 0 },
        '& .MuiCard-root': {
          maxWidth: '100%',
          minWidth: 0,
          overflow: 'hidden'
        },
        '& .MuiGrid-container': {
          maxWidth: '100%',
          minWidth: 0,
          margin: 0,
          width: '100%'
        },
        '& .MuiGrid-item': {
          maxWidth: '100%',
          minWidth: 0
        },
        '& .MuiTextField-root': {
          maxWidth: '100%',
          minWidth: 0
        },
        '& .MuiTable-root': {
          minWidth: 0
        },
        '& .MuiTableContainer-root': {
          maxWidth: '100%',
          overflow: 'auto'
        }
      }}>
        <ActiveComponent
          settings={settings[Object.keys(settings)[activeTab]] || {}}
          allSettings={settings}
          onUpdate={(updates) => handleSettingUpdate(Object.keys(settings)[activeTab] || 'general', updates)}
          onNotification={showNotification}
          loading={loading}
        />
      </Box>

      {/* Global Notifications */}
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseNotification} 
          severity={notification.severity}
          variant="filled"
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default SystemSettings;