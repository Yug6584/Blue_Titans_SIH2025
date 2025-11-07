import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Switch,
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
  Link,
  Api,
  Email,
  Http,
  Cloud,
  CheckCircle,
  Error,
} from '@mui/icons-material';
import { blueCarbon } from '../../../theme/colors';

const IntegrationManagement = ({ onNotification }) => {
  const [integrations, setIntegrations] = useState({
    gisApiEnabled: true,
    emailServerConfigured: true,
    webhooksEnabled: false,
    cloudStorageEnabled: false
  });

  const handleToggle = (key) => {
    setIntegrations(prev => ({ ...prev, [key]: !prev[key] }));
    onNotification('Integration setting updated', 'success');
  };

  const integrationList = [
    {
      key: 'gisApiEnabled',
      title: 'GIS API Integration',
      description: 'Geographic Information System API for location data',
      icon: <Api />,
      status: integrations.gisApiEnabled
    },
    {
      key: 'emailServerConfigured',
      title: 'Email Server',
      description: 'SMTP server for sending notifications',
      icon: <Email />,
      status: integrations.emailServerConfigured
    },
    {
      key: 'webhooksEnabled',
      title: 'Webhooks',
      description: 'HTTP callbacks for external integrations',
      icon: <Http />,
      status: integrations.webhooksEnabled
    },
    {
      key: 'cloudStorageEnabled',
      title: 'Cloud Storage',
      description: 'External cloud storage for file uploads',
      icon: <Cloud />,
      status: integrations.cloudStorageEnabled
    }
  ];

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" sx={{ fontWeight: 600, color: blueCarbon.deepOcean, mb: 1 }}>
          Integration Management
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Configure external APIs and service integrations
        </Typography>
      </Box>

      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, display: 'flex', alignItems: 'center' }}>
            <Link sx={{ mr: 1 }} />
            External Integrations
          </Typography>

          <List>
            {integrationList.map((integration, index) => (
              <React.Fragment key={integration.key}>
                <ListItem>
                  <ListItemIcon>
                    {integration.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={integration.title}
                    secondary={integration.description}
                  />
                  <ListItemSecondaryAction sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Chip
                      icon={integration.status ? <CheckCircle /> : <Error />}
                      label={integration.status ? 'Active' : 'Inactive'}
                      color={integration.status ? 'success' : 'default'}
                      size="small"
                    />
                    <Switch
                      checked={integration.status}
                      onChange={() => handleToggle(integration.key)}
                      color="primary"
                    />
                  </ListItemSecondaryAction>
                </ListItem>
                {index < integrationList.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>

          <Alert severity="info" sx={{ mt: 3 }}>
            Integration settings control external service connections. Ensure proper API keys and configurations are in place before enabling.
          </Alert>
        </CardContent>
      </Card>
    </Box>
  );
};

export default IntegrationManagement;