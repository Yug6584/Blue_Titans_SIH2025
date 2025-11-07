// BlueCarbon Ledger - Automated Project Submission Form
// Company Panel - Submit projects for automated AI verification

import React, { useState, useCallback } from 'react';
import {
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Box,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Stepper,
  Step,
  StepLabel,
  CircularProgress,
  Chip,
  Paper,
  Divider
} from '@mui/material';
import {
  CloudUpload,
  LocationOn,
  Nature,
  Assessment,
  AutoAwesome,
  Timeline
} from '@mui/icons-material';
import { MapContainer, TileLayer, FeatureGroup } from 'react-leaflet';
import { EditControl } from 'react-leaflet-draw';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';

const ProjectSubmissionForm = ({ onSubmissionSuccess }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    project_type: '',
    project_area_hectares: '',
    estimated_co2_tons: '',
    project_duration_years: '',
    coordinates: null,
    documents: []
  });

  const steps = [
    'Project Details',
    'Location & Area',
    'Documents',
    'Review & Submit'
  ];

  const projectTypes = [
    { value: 'mangrove_restoration', label: 'Mangrove Restoration', icon: '🌿' },
    { value: 'seagrass_conservation', label: 'Seagrass Conservation', icon: '🌊' },
    { value: 'salt_marsh_restoration', label: 'Salt Marsh Restoration', icon: '🌾' },
    { value: 'coastal_wetland_protection', label: 'Coastal Wetland Protection', icon: '🦆' },
    { value: 'blue_carbon_afforestation', label: 'Blue Carbon Afforestation', icon: '🌳' }
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError('');
  };

  const handleMapDrawn = useCallback((e) => {
    const { layerType, layer } = e;
    if (layerType === 'polygon') {
      const coordinates = layer.getLatLngs()[0].map(latlng => [latlng.lng, latlng.lat]);
      coordinates.push(coordinates[0]); // Close the polygon
      
      const geoJsonCoordinates = {
        type: 'Polygon',
        coordinates: [coordinates]
      };
      
      handleInputChange('coordinates', geoJsonCoordinates);
      
      // Calculate approximate area (simplified calculation)
      const area = calculatePolygonArea(coordinates);
      handleInputChange('project_area_hectares', Math.round(area * 100) / 100);
    }
  }, []);

  const calculatePolygonArea = (coordinates) => {
    // Simplified area calculation for demo
    // In production, use proper geospatial libraries
    let area = 0;
    const n = coordinates.length - 1;
    
    for (let i = 0; i < n; i++) {
      area += coordinates[i][0] * coordinates[i + 1][1];
      area -= coordinates[i + 1][0] * coordinates[i][1];
    }
    
    area = Math.abs(area) / 2;
    // Convert to hectares (very rough approximation)
    return area * 111320 * 111320 / 10000;
  };

  const handleFileUpload = (event) => {
    const files = Array.from(event.target.files);
    const newDocuments = files.map(file => ({
      id: Date.now() + Math.random(),
      name: file.name,
      type: file.type.includes('pdf') ? 'pdf' : 'document',
      file: file,
      uploadedAt: new Date()
    }));
    
    setFormData(prev => ({
      ...prev,
      documents: [...prev.documents, ...newDocuments]
    }));
  };

  const removeDocument = (docId) => {
    setFormData(prev => ({
      ...prev,
      documents: prev.documents.filter(doc => doc.id !== docId)
    }));
  };

  const validateStep = (step) => {
    switch (step) {
      case 0:
        return formData.title && formData.project_type && formData.description;
      case 1:
        return formData.coordinates && formData.project_area_hectares > 0;
      case 2:
        return true; // Documents are optional
      case 3:
        return true; // Review step
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (validateStep(activeStep)) {
      setActiveStep(prev => prev + 1);
      setError('');
    } else {
      setError('Please complete all required fields before proceeding.');
    }
  };

  const handleBack = () => {
    setActiveStep(prev => prev - 1);
    setError('');
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Upload documents first (mock implementation)
      const uploadedDocuments = await Promise.all(
        formData.documents.map(async (doc) => ({
          id: doc.id,
          name: doc.name,
          url: `https://storage.bluecarbon.com/documents/${doc.id}`,
          type: doc.type,
          uploadedAt: doc.uploadedAt
        }))
      );

      const submissionData = {
        ...formData,
        documents: uploadedDocuments,
        project_area_hectares: parseFloat(formData.project_area_hectares),
        estimated_co2_tons: formData.estimated_co2_tons ? parseFloat(formData.estimated_co2_tons) : undefined,
        project_duration_years: formData.project_duration_years ? parseInt(formData.project_duration_years) : undefined
      };

      const response = await fetch('/api/projects/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(submissionData)
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(`Project submitted successfully! Project ID: ${data.project_id}`);
        setActiveStep(4); // Success step
        
        if (onSubmissionSuccess) {
          onSubmissionSuccess(data);
        }
      } else {
        setError(data.message || 'Project submission failed');
      }

    } catch (error) {
      console.error('Submission error:', error);
      setError('Network error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Project Title"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                required
                helperText="Enter a descriptive title for your blue carbon project"
              />
            </Grid>
            
            <Grid item xs={12}>
              <FormControl fullWidth required>
                <InputLabel>Project Type</InputLabel>
                <Select
                  value={formData.project_type}
                  label="Project Type"
                  onChange={(e) => handleInputChange('project_type', e.target.value)}
                >
                  {projectTypes.map((type) => (
                    <MenuItem key={type.value} value={type.value}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <span>{type.icon}</span>
                        {type.label}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Project Description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                multiline
                rows={4}
                required
                helperText="Describe your project goals, methods, and expected outcomes"
              />
            </Grid>
            
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Estimated CO₂ Sequestration (tons/year)"
                type="number"
                value={formData.estimated_co2_tons}
                onChange={(e) => handleInputChange('estimated_co2_tons', e.target.value)}
                helperText="Optional: Your initial estimate"
              />
            </Grid>
            
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Project Duration (years)"
                type="number"
                value={formData.project_duration_years}
                onChange={(e) => handleInputChange('project_duration_years', e.target.value)}
                helperText="Expected project lifespan"
              />
            </Grid>
          </Grid>
        );

      case 1:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              <LocationOn sx={{ mr: 1, verticalAlign: 'middle' }} />
              Define Project Area
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Draw a polygon on the map to define your project boundaries. The AI will analyze this area using satellite imagery.
            </Typography>
            
            <Paper sx={{ height: 400, mb: 2 }}>
              <MapContainer
                center={[20.5937, 78.9629]} // Center of India
                zoom={5}
                style={{ height: '100%', width: '100%' }}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                <FeatureGroup>
                  <EditControl
                    position="topright"
                    onCreated={handleMapDrawn}
                    draw={{
                      rectangle: false,
                      circle: false,
                      circlemarker: false,
                      marker: false,
                      polyline: false,
                      polygon: {
                        allowIntersection: false,
                        drawError: {
                          color: '#e1e100',
                          message: '<strong>Error:</strong> Shape edges cannot cross!'
                        },
                        shapeOptions: {
                          color: '#2196f3'
                        }
                      }
                    }}
                  />
                </FeatureGroup>
              </MapContainer>
            </Paper>
            
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Project Area (hectares)"
                  type="number"
                  value={formData.project_area_hectares}
                  onChange={(e) => handleInputChange('project_area_hectares', e.target.value)}
                  required
                  helperText="Calculated from drawn polygon"
                />
              </Grid>
              <Grid item xs={6}>
                <Box sx={{ p: 2, bgcolor: 'info.light', borderRadius: 1 }}>
                  <Typography variant="body2">
                    <strong>Coordinates:</strong> {formData.coordinates ? 'Defined' : 'Not set'}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Area:</strong> {formData.project_area_hectares || 0} hectares
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Box>
        );

      case 2:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              <CloudUpload sx={{ mr: 1, verticalAlign: 'middle' }} />
              Supporting Documents
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Upload any supporting documents for your project (optional but recommended).
            </Typography>
            
            <Button
              variant="outlined"
              component="label"
              startIcon={<CloudUpload />}
              sx={{ mb: 2 }}
            >
              Upload Documents
              <input
                type="file"
                hidden
                multiple
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                onChange={handleFileUpload}
              />
            </Button>
            
            {formData.documents.length > 0 && (
              <Box>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  Uploaded Documents ({formData.documents.length})
                </Typography>
                {formData.documents.map((doc) => (
                  <Chip
                    key={doc.id}
                    label={doc.name}
                    onDelete={() => removeDocument(doc.id)}
                    sx={{ mr: 1, mb: 1 }}
                  />
                ))}
              </Box>
            )}
          </Box>
        );

      case 3:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              <Assessment sx={{ mr: 1, verticalAlign: 'middle' }} />
              Review & Submit
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle1" gutterBottom>Project Details</Typography>
                    <Typography><strong>Title:</strong> {formData.title}</Typography>
                    <Typography><strong>Type:</strong> {projectTypes.find(t => t.value === formData.project_type)?.label}</Typography>
                    <Typography><strong>Area:</strong> {formData.project_area_hectares} hectares</Typography>
                    {formData.estimated_co2_tons && (
                      <Typography><strong>Est. CO₂:</strong> {formData.estimated_co2_tons} tons/year</Typography>
                    )}
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle1" gutterBottom>What Happens Next</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <AutoAwesome sx={{ mr: 1, color: 'primary.main' }} />
                      <Typography variant="body2">AI verification begins automatically</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Timeline sx={{ mr: 1, color: 'primary.main' }} />
                      <Typography variant="body2">Processing takes 10-15 minutes</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Nature sx={{ mr: 1, color: 'primary.main' }} />
                      <Typography variant="body2">Auto-forwarded to government review</Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
            
            <Alert severity="info" sx={{ mt: 2 }}>
              <Typography variant="body2">
                By submitting this project, you confirm that all information is accurate and you have the necessary rights to the project area.
                The AI system will analyze satellite imagery of your defined area to verify carbon sequestration potential.
              </Typography>
            </Alert>
          </Box>
        );

      case 4:
        return (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <AutoAwesome sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
            <Typography variant="h5" gutterBottom>
              Project Submitted Successfully!
            </Typography>
            <Typography variant="body1" sx={{ mb: 3 }}>
              {success}
            </Typography>
            
            <Card sx={{ maxWidth: 600, mx: 'auto', mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>Next Steps</Typography>
                <Box sx={{ textAlign: 'left' }}>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    ✅ Project queued for AI verification
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    🤖 AI analysis will begin within 5 minutes
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    📊 You'll receive notifications about progress
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    🏛️ Automatic forwarding to government review
                  </Typography>
                  <Typography variant="body2">
                    📜 Certificate issued upon approval
                  </Typography>
                </Box>
              </CardContent>
            </Card>
            
            <Button
              variant="contained"
              onClick={() => window.location.reload()}
              sx={{ mr: 2 }}
            >
              Submit Another Project
            </Button>
            <Button
              variant="outlined"
              onClick={() => window.location.href = '/company/projects'}
            >
              View My Projects
            </Button>
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h5" gutterBottom>
          Submit New Blue Carbon Project
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Submit your project for automated AI verification and government approval
        </Typography>

        {activeStep < 4 && (
          <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {renderStepContent(activeStep)}

        {activeStep < 4 && (
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
            <Button
              disabled={activeStep === 0}
              onClick={handleBack}
            >
              Back
            </Button>
            
            <Box>
              {activeStep === steps.length - 1 ? (
                <Button
                  variant="contained"
                  onClick={handleSubmit}
                  disabled={loading || !validateStep(activeStep)}
                  startIcon={loading ? <CircularProgress size={20} /> : <AutoAwesome />}
                >
                  {loading ? 'Submitting...' : 'Submit Project'}
                </Button>
              ) : (
                <Button
                  variant="contained"
                  onClick={handleNext}
                  disabled={!validateStep(activeStep)}
                >
                  Next
                </Button>
              )}
            </Box>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default ProjectSubmissionForm;