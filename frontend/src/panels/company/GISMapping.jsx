import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Slider
} from '@mui/material';
import {
  Map,
  Satellite,
  Layers,
  Timeline,
  ZoomIn,
  ZoomOut,
  Fullscreen,
  Download,
  Share,
  Settings,
  Visibility,
  VisibilityOff
} from '@mui/icons-material';

const GISMapping = () => {
  const [selectedProject, setSelectedProject] = useState('1');
  const [mapLayers, setMapLayers] = useState({
    satellite: true,
    boundaries: true,
    vegetation: true,
    bathymetry: false,
    carbonStock: true,
    monitoring: true
  });
  const [timeSlider, setTimeSlider] = useState(75);
  const [openSettings, setOpenSettings] = useState(false);

  const projects = [
    { id: '1', name: 'Mangrove Restoration - Sundarbans', area: 500, coordinates: [22.4, 89.2] },
    { id: '2', name: 'Seagrass Conservation - Gulf Coast', area: 300, coordinates: [29.3, -94.8] },
    { id: '3', name: 'Salt Marsh Protection - Bay Area', area: 200, coordinates: [37.8, -122.4] }
  ];

  const layerInfo = [
    { key: 'satellite', name: 'Satellite Imagery', description: 'High-resolution satellite images', color: '#4CAF50' },
    { key: 'boundaries', name: 'Project Boundaries', description: 'Defined project area boundaries', color: '#2196F3' },
    { key: 'vegetation', name: 'Vegetation Cover', description: 'Vegetation density and health', color: '#8BC34A' },
    { key: 'bathymetry', name: 'Bathymetry', description: 'Water depth measurements', color: '#00BCD4' },
    { key: 'carbonStock', name: 'Carbon Stock', description: 'Estimated carbon storage areas', color: '#FF9800' },
    { key: 'monitoring', name: 'Monitoring Points', description: 'Field monitoring locations', color: '#F44336' }
  ];

  const handleLayerToggle = (layer) => {
    setMapLayers(prev => ({
      ...prev,
      [layer]: !prev[layer]
    }));
  };

  const handleTimeSliderChange = (event, newValue) => {
    setTimeSlider(newValue);
  };

  const getTimeLabel = (value) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthIndex = Math.floor((value / 100) * 11);
    return `${months[monthIndex]} 2024`;
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ mb: 3, fontWeight: 'bold' }}>
        GIS Mapping & Monitoring
      </Typography>

      <Grid container spacing={3}>
        {/* Map Controls */}
        <Grid item xs={12} md={3}>
          <Card sx={{ mb: 2 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Project Selection
              </Typography>
              <FormControl fullWidth>
                <InputLabel>Select Project</InputLabel>
                <Select
                  value={selectedProject}
                  onChange={(e) => setSelectedProject(e.target.value)}
                  label="Select Project"
                >
                  {projects.map((project) => (
                    <MenuItem key={project.id} value={project.id}>
                      {project.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Area: {projects.find(p => p.id === selectedProject)?.area} hectares
                </Typography>
              </Box>
            </CardContent>
          </Card>

          <Card sx={{ mb: 2 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Map Layers
              </Typography>
              <List dense>
                {layerInfo.map((layer) => (
                  <ListItem key={layer.key} sx={{ px: 0 }}>
                    <ListItemIcon>
                      <Box
                        sx={{
                          width: 16,
                          height: 16,
                          backgroundColor: layer.color,
                          borderRadius: '50%'
                        }}
                      />
                    </ListItemIcon>
                    <ListItemText
                      primary={layer.name}
                      secondary={layer.description}
                    />
                    <Switch
                      edge="end"
                      checked={mapLayers[layer.key]}
                      onChange={() => handleLayerToggle(layer.key)}
                      size="small"
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>

          <Card sx={{ mb: 2 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Time Series
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                View changes over time
              </Typography>
              <Box sx={{ px: 1, mt: 2 }}>
                <Slider
                  value={timeSlider}
                  onChange={handleTimeSliderChange}
                  valueLabelDisplay="auto"
                  valueLabelFormat={getTimeLabel}
                  marks={[
                    { value: 0, label: 'Jan' },
                    { value: 50, label: 'Jun' },
                    { value: 100, label: 'Dec' }
                  ]}
                />
              </Box>
              <Typography variant="caption" display="block" textAlign="center" sx={{ mt: 1 }}>
                Current: {getTimeLabel(timeSlider)}
              </Typography>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Map Tools
              </Typography>
              <Grid container spacing={1}>
                <Grid item xs={6}>
                  <Button
                    variant="outlined"
                    fullWidth
                    startIcon={<ZoomIn />}
                    size="small"
                  >
                    Zoom In
                  </Button>
                </Grid>
                <Grid item xs={6}>
                  <Button
                    variant="outlined"
                    fullWidth
                    startIcon={<ZoomOut />}
                    size="small"
                  >
                    Zoom Out
                  </Button>
                </Grid>
                <Grid item xs={6}>
                  <Button
                    variant="outlined"
                    fullWidth
                    startIcon={<Fullscreen />}
                    size="small"
                  >
                    Fullscreen
                  </Button>
                </Grid>
                <Grid item xs={6}>
                  <Button
                    variant="outlined"
                    fullWidth
                    startIcon={<Settings />}
                    size="small"
                    onClick={() => setOpenSettings(true)}
                  >
                    Settings
                  </Button>
                </Grid>
                <Grid item xs={6}>
                  <Button
                    variant="outlined"
                    fullWidth
                    startIcon={<Download />}
                    size="small"
                  >
                    Export
                  </Button>
                </Grid>
                <Grid item xs={6}>
                  <Button
                    variant="outlined"
                    fullWidth
                    startIcon={<Share />}
                    size="small"
                  >
                    Share
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Map Display */}
        <Grid item xs={12} md={9}>
          <Card sx={{ height: '80vh' }}>
            <CardContent sx={{ height: '100%', p: 0 }}>
              {/* Map Container - In a real app, this would contain the actual map */}
              <Box
                sx={{
                  height: '100%',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white'
                }}
              >
                {/* Map Placeholder */}
                <Box sx={{ textAlign: 'center' }}>
                  <Map sx={{ fontSize: 80, mb: 2, opacity: 0.7 }} />
                  <Typography variant="h5" gutterBottom>
                    Interactive GIS Map
                  </Typography>
                  <Typography variant="body1" sx={{ opacity: 0.8 }}>
                    {projects.find(p => p.id === selectedProject)?.name}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.6, mt: 1 }}>
                    Coordinates: {projects.find(p => p.id === selectedProject)?.coordinates.join(', ')}
                  </Typography>
                </Box>

                {/* Map Overlay Controls */}
                <Box sx={{ position: 'absolute', top: 16, right: 16 }}>
                  <Paper sx={{ p: 1 }}>
                    <Typography variant="caption" display="block">
                      Active Layers: {Object.values(mapLayers).filter(Boolean).length}
                    </Typography>
                  </Paper>
                </Box>

                {/* Legend */}
                <Box sx={{ position: 'absolute', bottom: 16, left: 16 }}>
                  <Paper sx={{ p: 2, maxWidth: 200 }}>
                    <Typography variant="subtitle2" gutterBottom color="text.primary">
                      Legend
                    </Typography>
                    {layerInfo
                      .filter(layer => mapLayers[layer.key])
                      .map((layer) => (
                        <Box key={layer.key} sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                          <Box
                            sx={{
                              width: 12,
                              height: 12,
                              backgroundColor: layer.color,
                              borderRadius: '50%',
                              mr: 1
                            }}
                          />
                          <Typography variant="caption" color="text.primary">
                            {layer.name}
                          </Typography>
                        </Box>
                      ))}
                  </Paper>
                </Box>

                {/* Scale Bar */}
                <Box sx={{ position: 'absolute', bottom: 16, right: 16 }}>
                  <Paper sx={{ p: 1 }}>
                    <Typography variant="caption" color="text.primary">
                      Scale: 1:50,000
                    </Typography>
                  </Paper>
                </Box>
              </Box>
            </CardContent>
          </Card>

          {/* Map Statistics */}
          <Grid container spacing={2} sx={{ mt: 2 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Satellite sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                  <Typography variant="h6">Latest Imagery</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Jan 15, 2024
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Layers sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
                  <Typography variant="h6">Coverage</Typography>
                  <Typography variant="body2" color="text.secondary">
                    98.5%
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Timeline sx={{ fontSize: 40, color: 'warning.main', mb: 1 }} />
                  <Typography variant="h6">Monitoring Points</Typography>
                  <Typography variant="body2" color="text.secondary">
                    24 Active
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Map sx={{ fontSize: 40, color: 'info.main', mb: 1 }} />
                  <Typography variant="h6">Resolution</Typography>
                  <Typography variant="body2" color="text.secondary">
                    0.5m/pixel
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Grid>
      </Grid>

      {/* Settings Dialog */}
      <Dialog open={openSettings} onClose={() => setOpenSettings(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Map Settings</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <Typography variant="subtitle2" gutterBottom>
                Display Options
              </Typography>
              <FormControlLabel
                control={<Switch defaultChecked />}
                label="Show coordinates"
              />
              <FormControlLabel
                control={<Switch defaultChecked />}
                label="Show scale bar"
              />
              <FormControlLabel
                control={<Switch />}
                label="Show grid lines"
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle2" gutterBottom>
                Data Quality
              </Typography>
              <FormControl fullWidth>
                <InputLabel>Image Resolution</InputLabel>
                <Select defaultValue="high" label="Image Resolution">
                  <MenuItem value="low">Low (2m/pixel)</MenuItem>
                  <MenuItem value="medium">Medium (1m/pixel)</MenuItem>
                  <MenuItem value="high">High (0.5m/pixel)</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle2" gutterBottom>
                Export Format
              </Typography>
              <FormControl fullWidth>
                <InputLabel>Default Export Format</InputLabel>
                <Select defaultValue="png" label="Default Export Format">
                  <MenuItem value="png">PNG</MenuItem>
                  <MenuItem value="jpg">JPEG</MenuItem>
                  <MenuItem value="pdf">PDF</MenuItem>
                  <MenuItem value="geotiff">GeoTIFF</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenSettings(false)}>Cancel</Button>
          <Button onClick={() => setOpenSettings(false)} variant="contained">
            Save Settings
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default GISMapping;