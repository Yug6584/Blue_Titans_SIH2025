import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  LinearProgress,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Visibility,
  Assessment,
  Nature,
  LocationOn,
  CalendarToday,
  AttachMoney,
  Refresh
} from '@mui/icons-material';
import { formatDateYMD, formatDateReadable, formatDateTime, calculateDurationYears } from '../../utils/dateUtils';

const ProjectManagement = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [projects, setProjects] = useState([]);
  const [projectDialog, setProjectDialog] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [viewDialog, setViewDialog] = useState(false);
  const [viewingProject, setViewingProject] = useState(null);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [deletingProject, setDeletingProject] = useState(null);
  const [projectData, setProjectData] = useState({
    project_name: '',
    description: '',
    project_type: '',
    area_hectares: '',
    location: '',
    status: 'planning',
    start_date: '',
    end_date: '',
    budget: '',
    expected_credits: 0
  });

  // Blue Carbon Project Types with credit calculation factors
  const projectTypes = [
    {
      value: 'mangrove',
      label: 'Mangrove Restoration',
      description: 'Coastal mangrove forest restoration and conservation',
      creditFactor: 8.5, // Credits per hectare per year
      icon: '🌿'
    },
    {
      value: 'seagrass',
      label: 'Seagrass Restoration',
      description: 'Marine seagrass meadow restoration and protection',
      creditFactor: 6.2, // Credits per hectare per year
      icon: '🌊'
    },
    {
      value: 'saltmarsh',
      label: 'Salt Marsh Conservation',
      description: 'Tidal salt marsh ecosystem restoration',
      creditFactor: 4.8, // Credits per hectare per year
      icon: '🏞️'
    }
  ];

  // Calculate expected credits based on project type, area, and duration
  const calculateExpectedCredits = (type, area, startDate, endDate) => {
    if (!type || !area || !startDate || !endDate) return 0;
    
    const projectType = projectTypes.find(pt => pt.value === type);
    if (!projectType) return 0;
    
    const durationYears = calculateDurationYears(startDate, endDate);
    const areaNum = parseFloat(area);
    if (isNaN(areaNum) || areaNum <= 0) return 0;
    
    // Credits = Area (hectares) × Credit Factor (per hectare/year) × Duration (years)
    const totalCredits = Math.round(areaNum * projectType.creditFactor * durationYears);
    return Math.max(0, totalCredits);
  };

  // Update expected credits when relevant fields change
  const updateProjectData = (field, value) => {
    const newData = { ...projectData, [field]: value };
    
    // Recalculate expected credits if relevant fields changed
    if (['project_type', 'area_hectares', 'start_date', 'end_date'].includes(field)) {
      newData.expected_credits = calculateExpectedCredits(
        newData.project_type,
        newData.area_hectares,
        newData.start_date,
        newData.end_date
      );
    }
    
    setProjectData(newData);
  };

  // Load real projects from company database
  const loadProjects = async () => {
    try {
      setError(null);
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch('http://localhost:8000/api/company-dashboard/projects', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        setProjects(data.projects || []);
        console.log('✅ Company projects loaded:', data.projects);
      } else {
        throw new Error(data.message || 'Failed to load projects');
      }
    } catch (error) {
      console.error('Error loading projects:', error);
      setError(error.message);
      setProjects([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadProjects();
  };

  const handleCreateProject = async () => {
    try {
      const token = localStorage.getItem('token');
      
      const url = editingProject 
        ? `http://localhost:8000/api/company-dashboard/projects/${editingProject.id}`
        : 'http://localhost:8000/api/company-dashboard/projects';
      
      const method = editingProject ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method: method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...projectData,
          budget: projectData.budget ? parseFloat(projectData.budget) : null
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setProjectDialog(false);
        setEditingProject(null);
        setProjectData({
          project_name: '',
          description: '',
          project_type: '',
          area_hectares: '',
          location: '',
          status: 'planning',
          start_date: '',
          end_date: '',
          budget: '',
          expected_credits: 0
        });
        await loadProjects(); // Refresh the list
      } else {
        throw new Error(data.message || `Project ${editingProject ? 'update' : 'creation'} failed`);
      }
    } catch (error) {
      console.error(`Project ${editingProject ? 'update' : 'creation'} error:`, error);
      setError(error.message);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'success';
      case 'completed': return 'primary';
      case 'planning': return 'warning';
      case 'on-hold': return 'error';
      default: return 'default';
    }
  };



  const calculateTotalExpectedCredits = () => {
    return projects.reduce((total, project) => {
      // Use the actual expected_credits field from the project
      return total + (project.expected_credits || 0);
    }, 0);
  };

  // Handle view project
  const handleViewProject = (project) => {
    setViewingProject(project);
    setViewDialog(true);
  };

  // Handle edit project
  const handleEditProject = (project) => {
    setEditingProject(project);
    setProjectData({
      project_name: project.project_name || '',
      description: project.description || '',
      project_type: project.project_type || '',
      area_hectares: project.area_hectares || '',
      location: project.location || '',
      status: project.status || 'planning',
      start_date: project.start_date || '',
      end_date: project.end_date || '',
      budget: project.budget || '',
      expected_credits: project.expected_credits || 0
    });
    setProjectDialog(true);
  };

  // Handle delete project
  const handleDeleteProject = (project) => {
    setDeletingProject(project);
    setDeleteDialog(true);
  };

  // Confirm delete project
  const confirmDeleteProject = async () => {
    if (!deletingProject) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8000/api/company-dashboard/projects/${deletingProject.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (data.success) {
        setProjects(projects.filter(p => p.id !== deletingProject.id));
        setDeleteDialog(false);
        setDeletingProject(null);
      } else {
        setError(data.message || 'Failed to delete project');
      }
    } catch (error) {
      console.error('Error deleting project:', error);
      setError('Failed to delete project');
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <Box sx={{ textAlign: 'center' }}>
          <CircularProgress size={60} sx={{ mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            Loading your projects...
          </Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
          Project Management
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <IconButton onClick={handleRefresh} disabled={refreshing} color="primary">
            <Refresh sx={{ 
              animation: refreshing ? 'spin 1s linear infinite' : 'none',
              '@keyframes spin': {
                '0%': { transform: 'rotate(0deg)' },
                '100%': { transform: 'rotate(360deg)' }
              }
            }} />
          </IconButton>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setProjectDialog(true)}
          >
            New Project
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
            <CardContent>
              <Typography variant="h6">Total Projects</Typography>
              <Typography variant="h3" sx={{ fontWeight: 'bold' }}>
                {projects.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: 'white' }}>
            <CardContent>
              <Typography variant="h6">Active Projects</Typography>
              <Typography variant="h3" sx={{ fontWeight: 'bold' }}>
                {projects.filter(p => p.status === 'active').length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', color: 'white' }}>
            <CardContent>
              <Typography variant="h6">Total Budget</Typography>
              <Typography variant="h3" sx={{ fontWeight: 'bold' }}>
                ${projects.reduce((total, p) => total + (p.budget || 0), 0).toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', color: 'white' }}>
            <CardContent>
              <Typography variant="h6">Expected Credits</Typography>
              <Typography variant="h3" sx={{ fontWeight: 'bold' }}>
                {calculateTotalExpectedCredits().toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* All Projects */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            All Projects
          </Typography>
          {projects.length > 0 ? (
            <TableContainer component={Paper} sx={{ mt: 2 }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Project Name</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Start Date</TableCell>
                    <TableCell>Budget</TableCell>
                    <TableCell>Description</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {projects.map((project) => (
                    <TableRow key={project.id}>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Nature color="primary" />
                          <Box>
                            <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                              {project.project_name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              ID: {project.id}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={project.status || 'planning'}
                          color={getStatusColor(project.status)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        {formatDateYMD(project.start_date)}
                      </TableCell>
                      <TableCell>
                        {project.budget ? `$${project.budget.toLocaleString()}` : 'Not set'}
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {project.description || 'No description'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <IconButton 
                            size="small" 
                            color="primary"
                            onClick={() => handleViewProject(project)}
                            title="View Project Details"
                          >
                            <Visibility />
                          </IconButton>
                          <IconButton 
                            size="small" 
                            color="secondary"
                            onClick={() => handleEditProject(project)}
                            title="Edit Project"
                          >
                            <Edit />
                          </IconButton>
                          <IconButton 
                            size="small" 
                            color="error"
                            onClick={() => handleDeleteProject(project)}
                            title="Delete Project"
                          >
                            <Delete />
                          </IconButton>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Assessment sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary">
                No Projects Created Yet
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Create your first project to start managing your carbon credit initiatives
              </Typography>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => setProjectDialog(true)}
              >
                Create First Project
              </Button>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Create Project Dialog */}
      <Dialog open={projectDialog} onClose={() => setProjectDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>{editingProject ? 'Edit Project' : 'Create New Project'}</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Project Name"
                  value={projectData.project_name}
                  onChange={(e) => updateProjectData('project_name', e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Project Type</InputLabel>
                  <Select
                    value={projectData.project_type}
                    onChange={(e) => updateProjectData('project_type', e.target.value)}
                  >
                    {projectTypes.map((type) => (
                      <MenuItem key={type.value} value={type.value}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <span>{type.icon}</span>
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                              {type.label}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {type.description}
                            </Typography>
                          </Box>
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Project Area (Hectares)"
                  type="number"
                  value={projectData.area_hectares}
                  onChange={(e) => updateProjectData('area_hectares', e.target.value)}
                  inputProps={{ min: 0, step: 0.1 }}
                  helperText="Area of the project site in hectares"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Location"
                  value={projectData.location}
                  onChange={(e) => updateProjectData('location', e.target.value)}
                  placeholder="e.g., Sundarbans, West Bengal, India"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  multiline
                  rows={3}
                  value={projectData.description}
                  onChange={(e) => updateProjectData('description', e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Start Date"
                  type="date"
                  value={projectData.start_date}
                  onChange={(e) => updateProjectData('start_date', e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="End Date"
                  type="date"
                  value={projectData.end_date}
                  onChange={(e) => updateProjectData('end_date', e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Budget"
                  type="number"
                  value={projectData.budget}
                  onChange={(e) => updateProjectData('budget', e.target.value)}
                  InputProps={{
                    startAdornment: '$'
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={projectData.status}
                    onChange={(e) => updateProjectData('status', e.target.value)}
                  >
                    <MenuItem value="planning">Planning</MenuItem>
                    <MenuItem value="active">Active</MenuItem>
                    <MenuItem value="on-hold">On Hold</MenuItem>
                    <MenuItem value="completed">Completed</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              {/* Expected Credits Calculation Display */}
              <Grid item xs={12}>
                <Card variant="outlined" sx={{ p: 2, bgcolor: 'primary.50' }}>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Assessment color="primary" />
                    Expected Carbon Credits
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <Typography variant="h4" color="primary.main" sx={{ fontWeight: 'bold' }}>
                      {projectData.expected_credits.toLocaleString()}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      credits over project lifetime
                    </Typography>
                  </Box>
                  
                  {projectData.project_type && projectData.area_hectares && projectData.start_date && projectData.end_date && (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Calculation Details:
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, fontSize: '0.875rem' }}>
                        <Chip 
                          size="small" 
                          label={`${projectTypes.find(pt => pt.value === projectData.project_type)?.label}`}
                          color="primary"
                          variant="outlined"
                        />
                        <Chip 
                          size="small" 
                          label={`${projectData.area_hectares} hectares`}
                          color="secondary"
                          variant="outlined"
                        />
                        <Chip 
                          size="small" 
                          label={`${calculateDurationYears(projectData.start_date, projectData.end_date)} years`}
                          color="success"
                          variant="outlined"
                        />
                        <Chip 
                          size="small" 
                          label={`${projectTypes.find(pt => pt.value === projectData.project_type)?.creditFactor} credits/hectare/year`}
                          color="warning"
                          variant="outlined"
                        />
                      </Box>
                    </Box>
                  )}
                  
                  {(!projectData.project_type || !projectData.area_hectares || !projectData.start_date || !projectData.end_date) && (
                    <Alert severity="info" sx={{ mt: 2 }}>
                      Complete project type, area, start date, and end date to calculate expected credits.
                    </Alert>
                  )}
                </Card>
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setProjectDialog(false);
            setEditingProject(null);
            setProjectData({
              project_name: '',
              description: '',
              project_type: '',
              area_hectares: '',
              location: '',
              status: 'planning',
              start_date: '',
              end_date: '',
              budget: '',
              expected_credits: 0
            });
          }}>Cancel</Button>
          <Button 
            onClick={handleCreateProject} 
            variant="contained" 
            disabled={!projectData.project_name || !projectData.project_type || !projectData.area_hectares || !projectData.start_date || !projectData.end_date}
          >
            {editingProject ? 'Update Project' : 'Create Project'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* View Project Dialog */}
      <Dialog open={viewDialog} onClose={() => setViewDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Project Details</DialogTitle>
        <DialogContent>
          {viewingProject && (
            <Box sx={{ pt: 2 }}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                    {viewingProject.project_name}
                  </Typography>
                  <Chip 
                    label={viewingProject.status} 
                    color={getStatusColor(viewingProject.status)}
                    sx={{ mb: 2 }}
                  />
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Card variant="outlined" sx={{ p: 2, height: '100%' }}>
                    <Typography variant="h6" gutterBottom color="primary">
                      Project Information
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      <Typography><strong>Type:</strong> {projectTypes.find(pt => pt.value === viewingProject.project_type)?.label || viewingProject.project_type}</Typography>
                      <Typography><strong>Area:</strong> {viewingProject.area_hectares} hectares</Typography>
                      <Typography><strong>Location:</strong> {viewingProject.location || 'Not specified'}</Typography>
                      <Typography><strong>Budget:</strong> ${viewingProject.budget?.toLocaleString() || 'Not specified'}</Typography>
                    </Box>
                  </Card>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Card variant="outlined" sx={{ p: 2, height: '100%' }}>
                    <Typography variant="h6" gutterBottom color="primary">
                      Timeline & Credits
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      <Typography><strong>Start Date:</strong> {formatDateReadable(viewingProject.start_date)}</Typography>
                      <Typography><strong>End Date:</strong> {formatDateReadable(viewingProject.end_date)}</Typography>
                      <Typography><strong>Duration:</strong> {calculateDurationYears(viewingProject.start_date, viewingProject.end_date)} years</Typography>
                      <Typography><strong>Expected Credits:</strong> {viewingProject.expected_credits?.toLocaleString() || 0}</Typography>
                    </Box>
                  </Card>
                </Grid>
                
                <Grid item xs={12}>
                  <Card variant="outlined" sx={{ p: 2 }}>
                    <Typography variant="h6" gutterBottom color="primary">
                      Description
                    </Typography>
                    <Typography>
                      {viewingProject.description || 'No description provided'}
                    </Typography>
                  </Card>
                </Grid>
                
                <Grid item xs={12}>
                  <Card variant="outlined" sx={{ p: 2 }}>
                    <Typography variant="h6" gutterBottom color="primary">
                      Project Dates
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                      <Typography><strong>Created:</strong> {formatDateTime(viewingProject.created_at)}</Typography>
                      <Typography><strong>Last Updated:</strong> {formatDateTime(viewingProject.updated_at)}</Typography>
                    </Box>
                  </Card>
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDialog(false)}>Close</Button>
          <Button 
            onClick={() => {
              setViewDialog(false);
              handleEditProject(viewingProject);
            }} 
            variant="contained"
            startIcon={<Edit />}
          >
            Edit Project
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialog} onClose={() => setDeleteDialog(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete the project "{deletingProject?.project_name}"? 
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog(false)}>Cancel</Button>
          <Button 
            onClick={confirmDeleteProject} 
            variant="contained" 
            color="error"
            startIcon={<Delete />}
          >
            Delete Project
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProjectManagement;