import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
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
  Notifications,
  Email,
  Sms,
  NotificationsActive,
  CheckCircle,
  Error,
} from '@mui/icons-material';
import { blueCarbon } from '../../../theme/colors';

const NotificationSettings = ({ onNotification }) => {
  const [settings, setSettings] = useState({
    emailEnabled: true,
    inAppEnabled: true,
    smsEnabled: false,
    webhooksEnabled: false,
    smtpConfigured: true
  });

  const handleSettingChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    onNotification('Notification setting updated', 'success');
  };

  return (
    <Box sx={{ 
      width: '100%', 
      maxWidth: '100%', 
      minWidth: 0, 
      overflow: 'hidden',
      p: { xs: 0, sm: 1 }
    }}>
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
          Notification Settings
        </Typography>
        <Typography 
          variant="body1" 
          color="text.secondary"
          sx={{ 
            fontSize: { xs: '0.9rem', md: '1rem' },
            wordBreak: 'break-word'
          }}
        >
          Configure email servers and notification preferences
        </Typography>
      </Box>

      <Card sx={{ 
        width: '100%', 
        maxWidth: '100%', 
        minWidth: 0, 
        overflow: 'hidden',
        mx: { xs: 1, sm: 0 }
      }}>
        <CardContent sx={{ 
          p: { xs: 2, md: 3 },
          '&:last-child': { pb: { xs: 2, md: 3 } }
        }}>
          <Typography 
            variant="h6" 
            sx={{ 
              mb: { xs: 2, md: 3 }, 
              fontWeight: 600, 
              display: 'flex', 
              alignItems: 'center',
              fontSize: { xs: '1.1rem', md: '1.25rem' },
              wordBreak: 'break-word'
            }}
          >
            <Notifications sx={{ mr: 1, fontSize: { xs: '1.2rem', md: '1.5rem' } }} />
            Notification Channels
          </Typography>

          <List sx={{ 
            width: '100%', 
            maxWidth: '100%', 
            minWidth: 0,
            p: 0
          }}>
            <ListItem sx={{ 
              px: { xs: 1, md: 2 }, 
              py: { xs: 1, md: 1.5 },
              flexDirection: { xs: 'column', sm: 'row' },
              alignItems: { xs: 'flex-start', sm: 'center' },
              gap: { xs: 1, sm: 0 }
            }}>
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                width: { xs: '100%', sm: 'auto' },
                minWidth: 0
              }}>
                <ListItemIcon sx={{ minWidth: { xs: 32, md: 40 } }}>
                  <Email sx={{ fontSize: { xs: '1.2rem', md: '1.5rem' } }} />
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Typography sx={{ 
                      fontSize: { xs: '0.9rem', md: '1rem' },
                      fontWeight: 500,
                      wordBreak: 'break-word'
                    }}>
                      Email Notifications
                    </Typography>
                  }
                  secondary={
                    <Typography sx={{ 
                      fontSize: { xs: '0.8rem', md: '0.875rem' },
                      wordBreak: 'break-word'
                    }}>
                      Send notifications via email
                    </Typography>
                  }
                />
              </Box>
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: { xs: 1, md: 2 },
                ml: { xs: 0, sm: 'auto' },
                flexWrap: 'wrap',
                justifyContent: { xs: 'flex-start', sm: 'flex-end' }
              }}>
                <Chip
                  icon={settings.smtpConfigured ? <CheckCircle /> : <Error />}
                  label={settings.smtpConfigured ? 'SMTP Configured' : 'SMTP Not Configured'}
                  color={settings.smtpConfigured ? 'success' : 'error'}
                  size="small"
                  sx={{ 
                    fontSize: { xs: '0.7rem', md: '0.8rem' },
                    height: { xs: 24, md: 32 }
                  }}
                />
                <Switch
                  checked={settings.emailEnabled}
                  onChange={(e) => handleSettingChange('emailEnabled', e.target.checked)}
                  color="primary"
                  size={window.innerWidth < 600 ? 'small' : 'medium'}
                />
              </Box>
            </ListItem>
            <Divider />

            <ListItem sx={{ 
              px: { xs: 1, md: 2 }, 
              py: { xs: 1, md: 1.5 },
              flexDirection: { xs: 'column', sm: 'row' },
              alignItems: { xs: 'flex-start', sm: 'center' },
              gap: { xs: 1, sm: 0 }
            }}>
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                width: { xs: '100%', sm: 'auto' },
                minWidth: 0
              }}>
                <ListItemIcon sx={{ minWidth: { xs: 32, md: 40 } }}>
                  <NotificationsActive sx={{ fontSize: { xs: '1.2rem', md: '1.5rem' } }} />
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Typography sx={{ 
                      fontSize: { xs: '0.9rem', md: '1rem' },
                      fontWeight: 500,
                      wordBreak: 'break-word'
                    }}>
                      In-App Notifications
                    </Typography>
                  }
                  secondary={
                    <Typography sx={{ 
                      fontSize: { xs: '0.8rem', md: '0.875rem' },
                      wordBreak: 'break-word'
                    }}>
                      Show notifications within the application
                    </Typography>
                  }
                />
              </Box>
              <Box sx={{ 
                ml: { xs: 0, sm: 'auto' }
              }}>
                <Switch
                  checked={settings.inAppEnabled}
                  onChange={(e) => handleSettingChange('inAppEnabled', e.target.checked)}
                  color="primary"
                  size={window.innerWidth < 600 ? 'small' : 'medium'}
                />
              </Box>
            </ListItem>
            <Divider />

            <ListItem sx={{ 
              px: { xs: 1, md: 2 }, 
              py: { xs: 1, md: 1.5 },
              flexDirection: { xs: 'column', sm: 'row' },
              alignItems: { xs: 'flex-start', sm: 'center' },
              gap: { xs: 1, sm: 0 }
            }}>
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                width: { xs: '100%', sm: 'auto' },
                minWidth: 0
              }}>
                <ListItemIcon sx={{ minWidth: { xs: 32, md: 40 } }}>
                  <Sms sx={{ fontSize: { xs: '1.2rem', md: '1.5rem' } }} />
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Typography sx={{ 
                      fontSize: { xs: '0.9rem', md: '1rem' },
                      fontWeight: 500,
                      wordBreak: 'break-word'
                    }}>
                      SMS Notifications
                    </Typography>
                  }
                  secondary={
                    <Typography sx={{ 
                      fontSize: { xs: '0.8rem', md: '0.875rem' },
                      wordBreak: 'break-word'
                    }}>
                      Send notifications via SMS (requires SMS provider)
                    </Typography>
                  }
                />
              </Box>
              <Box sx={{ 
                ml: { xs: 0, sm: 'auto' }
              }}>
                <Switch
                  checked={settings.smsEnabled}
                  onChange={(e) => handleSettingChange('smsEnabled', e.target.checked)}
                  color="primary"
                  size={window.innerWidth < 600 ? 'small' : 'medium'}
                />
              </Box>
            </ListItem>
          </List>

          <Alert 
            severity="info" 
            sx={{ 
              mt: { xs: 2, md: 3 },
              fontSize: { xs: '0.8rem', md: '0.875rem' },
              '& .MuiAlert-message': {
                wordBreak: 'break-word',
                hyphens: 'auto'
              }
            }}
          >
            Email notifications require SMTP server configuration. SMS notifications require a third-party SMS provider.
          </Alert>
        </CardContent>
      </Card>
    </Box>
  );
};

export default NotificationSettings;