import React, { useState, useEffect } from 'react';
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
  ListItemSecondaryAction,
  IconButton,
  Chip,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  CloudUpload,
  Description,
  Image,
  VideoFile,
  Assessment,
  Delete,
  Download,
  Visibility,
  CheckCircle,
  Error,
  Schedule,
  Upload,
  Refresh
} from '@mui/icons-material';

const MRVUpload = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [uploads, setUploads] = useState([]);
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState('');
  const [uploadDialog, setUploadDialog] = useState(false);
  const [uploadData, setUploadData] = useState({
    filename: '',
    description: '',
    category: 'mrv',
    file_type: 'document',
    project_id: ''
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileError, setFileError] = useState('');

  // Helper function to get time ago
  const getTimeAgo = (timestamp) => {
    if (!timestamp) return 'Unknown';
    
    const now = new Date();
    const uploadTime = new Date(timestamp);
    const diffMs = now - uploadTime;
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  };

  // Handle dialog close
  const handleDialogClose = () => {
    setUploadDialog(false);
    setSelectedFile(null);
    setFileError('');
    setUploadData({
      filename: '',
      description: '',
      category: 'mrv',
      file_type: 'document',
      project_id: selectedProject || ''
    });
  };

  // File type validation mapping
  const fileTypeValidation = {
    document: {
      accept: '.pdf,.doc,.docx,.txt,.rtf,.odt',
      mimeTypes: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain', 'text/rtf', 'application/vnd.oasis.opendocument.text'],
      maxSize: 100 * 1024 * 1024, // 100MB
      description: 'PDF, DOC, DOCX, TXT, RTF, ODT files'
    },
    image: {
      accept: '.jpg,.jpeg,.png,.gif,.bmp,.tiff,.webp',
      mimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/bmp', 'image/tiff', 'image/webp'],
      maxSize: 50 * 1024 * 1024, // 50MB
      description: 'JPG, PNG, GIF, BMP, TIFF, WebP files'
    },
    video: {
      accept: '.mp4,.avi,.mov,.wmv,.flv,.webm,.mkv',
      mimeTypes: ['video/mp4', 'video/avi', 'video/quicktime', 'video/x-ms-wmv', 'video/x-flv', 'video/webm', 'video/x-matroska'],
      maxSize: 500 * 1024 * 1024, // 500MB
      description: 'MP4, AVI, MOV, WMV, FLV, WebM, MKV files'
    },
    report: {
      accept: '.pdf,.xlsx,.xls,.csv,.doc,.docx',
      mimeTypes: ['application/pdf', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel', 'text/csv', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
      maxSize: 100 * 1024 * 1024, // 100MB
      description: 'PDF, Excel, CSV, Word files'
    }
  };

  // Validate selected file
  const validateFile = (file, fileType) => {
    const validation = fileTypeValidation[fileType];
    
    if (!validation) {
      return 'Invalid file type selected';
    }

    // Check file size
    if (file.size > validation.maxSize) {
      const maxSizeMB = (validation.maxSize / 1024 / 1024).toFixed(0);
      return `File size exceeds ${maxSizeMB}MB limit`;
    }

    // Check MIME type
    if (!validation.mimeTypes.includes(file.type)) {
      return `Invalid file format. Please select: ${validation.description}`;
    }

    return null;
  };

  // Handle file selection
  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    setFileError('');
    
    if (!file) {
      setSelectedFile(null);
      setUploadData({ ...uploadData, filename: '' });
      return;
    }

    // Validate file against selected file type
    const error = validateFile(file, uploadData.file_type);
    
    if (error) {
      setFileError(error);
      setSelectedFile(null);
      setUploadData({ ...uploadData, filename: '' });
      event.target.value = ''; // Clear the input
      return;
    }

    // File is valid
    setSelectedFile(file);
    setUploadData({ 
      ...uploadData, 
      filename: file.name,
      file_size: file.size 
    });
  };

  // Handle file type change - clear selected file if it doesn't match new type
  const handleFileTypeChange = (newFileType) => {
    setUploadData({ ...uploadData, file_type: newFileType });
    setFileError('');
    
    // If there's a selected file, validate it against the new file type
    if (selectedFile) {
      const error = validateFile(selectedFile, newFileType);
      if (error) {
        setFileError(`Current file doesn't match new type. ${error}`);
        setSelectedFile(null);
        setUploadData({ ...uploadData, file_type: newFileType, filename: '' });
      }
    }
  };

  // Load projects for selection
  const loadProjects = async () => {
    try {
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

      const data = await response.json();
      
      if (data.success) {
        setProjects(data.projects || []);
      } else {
        throw new Error(data.message || 'Failed to load projects');
      }
    } catch (error) {
      console.error('Error loading projects:', error);
      setError(error.message);
    }
  };

  // Load real uploads from company database
  const loadUploads = async (projectId = null) => {
    try {
      setError(null);
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('No authentication token found');
      }

      const url = projectId 
        ? `http://localhost:8000/api/company-dashboard/files?project_id=${projectId}`
        : 'http://localhost:8000/api/company-dashboard/files';

      const response = await fetch(url, {
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
        setUploads(data.files || []);
        console.log('✅ Company files loaded:', data.files);
      } else {
        throw new Error(data.message || 'Failed to load files');
      }
    } catch (error) {
      console.error('Error loading files:', error);
      setError(error.message);
      setUploads([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadProjects();
    loadUploads();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadUploads();
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setFileError('Please select a file to upload');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('filename', uploadData.filename);
      formData.append('description', uploadData.description);
      formData.append('category', uploadData.category);
      formData.append('file_type', uploadData.file_type);
      formData.append('project_id', uploadData.project_id);
      formData.append('file_size', selectedFile.size);

      const response = await fetch('http://localhost:8000/api/company/files/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
          // Don't set Content-Type for FormData - browser will set it with boundary
        },
        body: formData
      });

      const data = await response.json();
      
      if (data.success) {
        setUploadDialog(false);
        setSelectedFile(null);
        setFileError('');
        setUploadData({
          filename: '',
          description: '',
          category: 'mrv',
          file_type: 'document',
          project_id: selectedProject || ''
        });
        await loadUploads(selectedProject || null); // Refresh the list
      } else {
        throw new Error(data.message || 'Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      setError(error.message);
    }
  };

  const handleDelete = async (fileId) => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(`http://localhost:8000/api/company-dashboard/files/${fileId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      
      if (data.success) {
        await loadUploads(); // Refresh the list
      } else {
        throw new Error(data.message || 'Delete failed');
      }
    } catch (error) {
      console.error('Delete error:', error);
      setError(error.message);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'verified': return 'success';
      case 'uploaded': return 'info';
      case 'under_review': return 'warning';
      case 'pending': return 'warning';
      case 'rejected': return 'error';
      default: return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'verified': return <CheckCircle />;
      case 'uploaded': return <CloudUpload />;
      case 'under_review': return <Schedule />;
      case 'pending': return <Schedule />;
      case 'rejected': return <Error />;
      default: return <Description />;
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'verified': return 'Verified';
      case 'uploaded': return 'Uploaded';
      case 'under_review': return 'Under Review';
      case 'pending': return 'Pending Review';
      case 'rejected': return 'Rejected';
      default: return 'Unknown';
    }
  };

  const getFileIcon = (fileType) => {
    switch (fileType) {
      case 'image': return <Image />;
      case 'video': return <VideoFile />;
      case 'report': return <Assessment />;
      default: return <Description />;
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <Box sx={{ textAlign: 'center' }}>
          <CircularProgress size={60} sx={{ mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            Loading your MRV uploads...
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
          MRV Upload & Management
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
            startIcon={<CloudUpload />}
            onClick={() => {
              setUploadData({
                filename: '',
                description: '',
                category: 'mrv',
                file_type: 'document',
                project_id: selectedProject || ''
              });
              setUploadDialog(true);
            }}
          >
            Upload MRV Data
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Project Filter */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="h6" sx={{ minWidth: 'fit-content' }}>
              Filter by Project:
            </Typography>
            <FormControl sx={{ minWidth: 300 }}>
              <InputLabel>Select Project</InputLabel>
              <Select
                value={selectedProject}
                onChange={(e) => {
                  setSelectedProject(e.target.value);
                  loadUploads(e.target.value || null);
                }}
              >
                <MenuItem value="">
                  <em>All Projects</em>
                </MenuItem>
                {projects.map((project) => (
                  <MenuItem key={project.id} value={project.id}>
                    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                      <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                        {project.project_name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {project.project_type} • {project.area_hectares} hectares
                      </Typography>
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            {selectedProject && (
              <Button
                variant="outlined"
                onClick={() => {
                  setSelectedProject('');
                  loadUploads(null);
                }}
              >
                Clear Filter
              </Button>
            )}
          </Box>
        </CardContent>
      </Card>

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
            <CardContent>
              <Typography variant="h6">Total Uploads</Typography>
              <Typography variant="h3" sx={{ fontWeight: 'bold' }}>
                {uploads.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', color: 'white' }}>
            <CardContent>
              <Typography variant="h6">Verified</Typography>
              <Typography variant="h3" sx={{ fontWeight: 'bold' }}>
                {uploads.filter(u => u.status === 'verified').length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: 'white' }}>
            <CardContent>
              <Typography variant="h6">Under Review</Typography>
              <Typography variant="h3" sx={{ fontWeight: 'bold' }}>
                {uploads.filter(u => u.status === 'under_review' || u.status === 'pending').length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', color: 'white' }}>
            <CardContent>
              <Typography variant="h6">Rejected</Typography>
              <Typography variant="h3" sx={{ fontWeight: 'bold' }}>
                {uploads.filter(u => u.status === 'rejected').length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* MRV Upload Guidelines */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            MRV Upload Guidelines
          </Typography>
          <Alert severity="info" sx={{ mb: 2 }}>
            Please ensure all MRV data follows the international standards for blue carbon monitoring, reporting, and verification.
          </Alert>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
                Required Documents:
              </Typography>
              <List dense>
                <ListItem>
                  <ListItemText primary="• Quarterly monitoring reports" />
                </ListItem>
                <ListItem>
                  <ListItemText primary="• Biomass measurement data" />
                </ListItem>
                <ListItem>
                  <ListItemText primary="• Satellite/drone imagery" />
                </ListItem>
                <ListItem>
                  <ListItemText primary="• Field survey photographs" />
                </ListItem>
              </List>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
                File Requirements:
              </Typography>
              <List dense>
                <ListItem>
                  <ListItemText primary="• Maximum file size: 100MB" />
                </ListItem>
                <ListItem>
                  <ListItemText primary="• Supported formats: PDF, XLSX, JPG, PNG, ZIP" />
                </ListItem>
                <ListItem>
                  <ListItemText primary="• Files must be clearly labeled" />
                </ListItem>
                <ListItem>
                  <ListItemText primary="• Include metadata when possible" />
                </ListItem>
              </List>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Recent Uploads */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Recent Uploads
          </Typography>
          {uploads.length > 0 ? (
            <List>
              {uploads.map((upload, index) => (
                <ListItem key={upload.id} divider={index < uploads.length - 1}>
                  <ListItemIcon>
                    {getFileIcon(upload.file_type)}
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                          {upload.filename}
                        </Typography>
                        {upload.project_name && (
                          <Chip
                            label={upload.project_name}
                            size="small"
                            color="primary"
                            variant="outlined"
                          />
                        )}
                      </Box>
                    }
                    secondary={
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          {upload.description || 'No description'}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                          <Chip
                            icon={getStatusIcon(upload.status)}
                            label={getStatusLabel(upload.status)}
                            color={getStatusColor(upload.status)}
                            size="small"
                          />
                          <Typography variant="caption" color="text.secondary">
                            Uploaded: {upload.created_at ? new Date(upload.created_at).toLocaleString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                              second: '2-digit',
                              hour12: true
                            }) : 'Unknown'} • {getTimeAgo(upload.created_at)}
                          </Typography>
                          {upload.file_size && (
                            <Typography variant="caption" color="text.secondary">
                              • Size: {(upload.file_size / 1024 / 1024).toFixed(1)} MB
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    }
                  />
                  <ListItemSecondaryAction>
                    <IconButton edge="end" onClick={() => handleDelete(upload.id)}>
                      <Delete />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          ) : (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <CloudUpload sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary">
                No MRV Data Uploaded Yet
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Upload your first MRV document to get started
              </Typography>
              <Button
                variant="contained"
                startIcon={<CloudUpload />}
                onClick={() => setUploadDialog(true)}
              >
                Upload First Document
              </Button>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Upload Dialog */}
      <Dialog open={uploadDialog} onClose={handleDialogClose} maxWidth="sm" fullWidth>
        <DialogTitle>Upload MRV Data</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Select Project</InputLabel>
              <Select
                value={uploadData.project_id}
                onChange={(e) => setUploadData({ ...uploadData, project_id: e.target.value })}
                required
              >
                {projects.map((project) => (
                  <MenuItem key={project.id} value={project.id}>
                    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                      <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                        {project.project_name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {project.project_type} • {project.area_hectares} hectares • {project.location}
                      </Typography>
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            {/* File Selection */}
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" sx={{ mb: 1, fontWeight: 'bold' }}>
                Select File from System
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Button
                  variant="outlined"
                  component="label"
                  startIcon={<CloudUpload />}
                  sx={{ minWidth: 150 }}
                >
                  Choose File
                  <input
                    type="file"
                    hidden
                    accept={fileTypeValidation[uploadData.file_type]?.accept || '*'}
                    onChange={handleFileSelect}
                  />
                </Button>
                <Box sx={{ flex: 1 }}>
                  {selectedFile ? (
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'success.main' }}>
                        ✓ {selectedFile.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Size: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                      </Typography>
                    </Box>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      No file selected
                    </Typography>
                  )}
                </Box>
              </Box>
              {fileError && (
                <Alert severity="error" sx={{ mt: 1 }}>
                  {fileError}
                </Alert>
              )}
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                Accepted formats: {fileTypeValidation[uploadData.file_type]?.description}
                <br />
                Maximum size: {(fileTypeValidation[uploadData.file_type]?.maxSize / 1024 / 1024).toFixed(0)}MB
              </Typography>
            </Box>
            <TextField
              fullWidth
              label="Description"
              multiline
              rows={3}
              value={uploadData.description}
              onChange={(e) => setUploadData({ ...uploadData, description: e.target.value })}
              sx={{ mb: 2 }}
            />
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Category</InputLabel>
              <Select
                value={uploadData.category}
                onChange={(e) => setUploadData({ ...uploadData, category: e.target.value })}
              >
                <MenuItem value="mrv">MRV Report</MenuItem>
                <MenuItem value="monitoring">Monitoring Data</MenuItem>
                <MenuItem value="verification">Verification Document</MenuItem>
                <MenuItem value="imagery">Satellite/Drone Imagery</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>File Type</InputLabel>
              <Select
                value={uploadData.file_type}
                onChange={(e) => handleFileTypeChange(e.target.value)}
              >
                <MenuItem value="document">Document</MenuItem>
                <MenuItem value="image">Image</MenuItem>
                <MenuItem value="video">Video</MenuItem>
                <MenuItem value="report">Report</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose}>Cancel</Button>
          <Button 
            onClick={handleUpload} 
            variant="contained" 
            disabled={!selectedFile || !uploadData.project_id || fileError}
          >
            Upload
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MRVUpload;