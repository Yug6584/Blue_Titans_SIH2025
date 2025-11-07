import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Checkbox,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  Snackbar,
} from '@mui/material';
import {
  VerifiedUser,
  Search,
  FilterList,
  Visibility,
  CheckCircle,
  Assignment,
  Download,
  Assessment,
  Flag,
  Description,
  Refresh,
  BarChart,
  Link,
  Security,
  FileDownload,
  Settings,
  ExpandMore,
  ExpandLess,
} from '@mui/icons-material';
import { blueCarbon } from '../../theme/colors';

// Import sub-components
import ProjectDetailsView from './components/ProjectDetailsView';

const ProjectVerification = () => {
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [selectedProjects, setSelectedProjects] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [filters, setFilters] = useState({
    status: 'all',
    location: 'all',
    dateRange: 'all',
    priority: 'all'
  });
  const [loading, setLoading] = useState(false);
  const [bulkActionDialog, setBulkActionDialog] = useState(false);
  const [bulkAction, setBulkAction] = useState('');
  const [showOptionalFeatures, setShowOptionalFeatures] = useState(false);
  const [exportDialog, setExportDialog] = useState(false);
  const [monthlyStatsDialog, setMonthlyStatsDialog] = useState(false);
  const [dualVerificationDialog, setDualVerificationDialog] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [exportFormat, setExportFormat] = useState('csv');
  const [exportDateRange, setExportDateRange] = useState({
    startDate: '2024-01-01',
    endDate: new Date().toISOString().split('T')[0]
  });

  // Mock project data matching the specification
  useEffect(() => {
    const mockProjects = [
      {
        id: 'P-1021',
        name: 'Coastal Mangrove Regeneration',
        location: 'West Bengal, India',
        coordinates: { lat: 21.9497, lng: 88.9468 },
        submittedBy: 'GreenEarth Ltd',
        submissionDate: new Date('2025-10-21'),
        status: 'pending',
        priority: 'high',
        area: '1,200 hectares',
        projectType: 'Mangrove Restoration',
        estimatedCredits: 45000,
        aiValidationScore: 92,
        complianceScore: 85,
        flaggedIssues: 1,
        documents: 12,
        images: 8,
        mrvStatus: 'Validated',
        verificationStatus: 'Pending',
        description: 'Large-scale mangrove restoration project in the Sundarbans delta region focusing on biodiversity conservation and carbon sequestration.',
        verificationTeam: null,
        lastActivity: new Date('2025-10-21')
      },
      {
        id: 'P-1022',
        name: 'Solar Reforestation Drive',
        location: 'Odisha, India',
        coordinates: { lat: 19.7179, lng: 85.3206 },
        submittedBy: 'EcoPower Pvt Ltd',
        submissionDate: new Date('2025-10-19'),
        status: 'pending',
        priority: 'medium',
        area: '800 hectares',
        projectType: 'Reforestation',
        estimatedCredits: 28000,
        aiValidationScore: 96,
        complianceScore: 94,
        flaggedIssues: 0,
        documents: 15,
        images: 12,
        mrvStatus: 'AI Verified',
        verificationStatus: 'Pending',
        description: 'Solar-powered reforestation initiative combining renewable energy with forest restoration.',
        verificationTeam: 'Field Team Alpha',
        lastActivity: new Date('2025-10-19')
      },
      {
        id: 'P-1023',
        name: 'Kerala Backwater Salt Marsh Project',
        location: 'Kerala, India',
        coordinates: { lat: 9.9312, lng: 76.2673 },
        submittedBy: 'Mahindra Sustainability Solutions',
        submissionDate: new Date('2025-10-18'),
        status: 'rejected',
        priority: 'low',
        area: '450 hectares',
        projectType: 'Salt Marsh Restoration',
        estimatedCredits: 15000,
        aiValidationScore: 67,
        complianceScore: 58,
        flaggedIssues: 3,
        documents: 8,
        images: 5,
        mrvStatus: 'Failed Validation',
        verificationStatus: 'Rejected',
        description: 'Salt marsh restoration in Kerala backwaters with focus on coastal protection and carbon sequestration.',
        verificationTeam: null,
        lastActivity: new Date('2025-10-18')
      },
      {
        id: 'P-1024',
        name: 'Sundarbans Blue Carbon Initiative',
        location: 'West Bengal, India',
        coordinates: { lat: 21.8, lng: 88.8 },
        submittedBy: 'Blue Ocean Conservation',
        submissionDate: new Date('2025-10-17'),
        status: 'verified',
        priority: 'high',
        area: '2,000 hectares',
        projectType: 'Blue Carbon',
        estimatedCredits: 75000,
        aiValidationScore: 98,
        complianceScore: 96,
        flaggedIssues: 0,
        documents: 20,
        images: 15,
        mrvStatus: 'Validated',
        verificationStatus: 'Certified',
        description: 'Comprehensive blue carbon ecosystem restoration in the Sundarbans region.',
        verificationTeam: 'Senior Review Panel',
        lastActivity: new Date('2025-10-17')
      }
    ];
    setProjects(mockProjects);
    setFilteredProjects(mockProjects);
  }, []);

  // Filter and search logic
  useEffect(() => {
    let filtered = [...projects];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(project =>
        project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.submittedBy.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (filters.status !== 'all') {
      filtered = filtered.filter(project => project.status === filters.status);
    }

    // Apply priority filter
    if (filters.priority !== 'all') {
      filtered = filtered.filter(project => project.priority === filters.priority);
    }

    setFilteredProjects(filtered);
    setPage(0);
  }, [projects, searchTerm, filters]);

  const handleSelectProject = (project) => {
    setSelectedProject(project);
  };

  const handleSelectAll = (event) => {
    if (event.target.checked) {
      const newSelected = filteredProjects.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map(p => p.id);
      setSelectedProjects(newSelected);
    } else {
      setSelectedProjects([]);
    }
  };

  const handleSelectOne = (projectId) => {
    const selectedIndex = selectedProjects.indexOf(projectId);
    let newSelected = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selectedProjects, projectId);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selectedProjects.slice(1));
    } else if (selectedIndex === selectedProjects.length - 1) {
      newSelected = newSelected.concat(selectedProjects.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selectedProjects.slice(0, selectedIndex),
        selectedProjects.slice(selectedIndex + 1),
      );
    }

    setSelectedProjects(newSelected);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return '#ff9800';
      case 'verified': return '#4caf50';
      case 'rejected': return '#f44336';
      case 'in-review': return blueCarbon.oceanBlue;
      default: return '#666';
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleBulkAction = () => {
    if (selectedProjects.length === 0) return;
    setBulkActionDialog(true);
  };

  const executeBulkAction = () => {
    console.log(`Executing ${bulkAction} on ${selectedProjects.length} projects`);
    
    // Update projects based on bulk action
    const updatedProjects = projects.map(project => {
      if (selectedProjects.includes(project.id)) {
        switch (bulkAction) {
          case 'approve':
            return { ...project, status: 'verified', verificationStatus: 'Certified' };
          case 'reject':
            return { ...project, status: 'rejected', verificationStatus: 'Rejected' };
          case 'request-info':
            return { ...project, status: 'pending', verificationStatus: 'Pending' };
          case 'assign-team':
            return { ...project, verificationTeam: 'Field Team Alpha' };
          default:
            return project;
        }
      }
      return project;
    });
    
    setProjects(updatedProjects);
    setFilteredProjects(updatedProjects);
    setSnackbar({ 
      open: true, 
      message: `${bulkAction.charAt(0).toUpperCase() + bulkAction.slice(1)} applied to ${selectedProjects.length} projects`, 
      severity: 'success' 
    });
    
    setBulkActionDialog(false);
    setSelectedProjects([]);
    setBulkAction('');
  };

  const handleExportReport = () => {
    const projectsToExport = filteredProjects.filter(p => 
      new Date(p.submissionDate) >= new Date(exportDateRange.startDate) &&
      new Date(p.submissionDate) <= new Date(exportDateRange.endDate)
    );
    
    console.log(`Exporting ${projectsToExport.length} projects in ${exportFormat.toUpperCase()} format`);
    setSnackbar({ 
      open: true, 
      message: `Report exported successfully! ${projectsToExport.length} projects exported in ${exportFormat.toUpperCase()} format.`, 
      severity: 'success' 
    });
    setExportDialog(false);
  };

  const handleDualVerification = () => {
    setSnackbar({ 
      open: true, 
      message: 'Dual verification workflow activated. Two officers must now approve before certificate issuance.', 
      severity: 'info' 
    });
    setDualVerificationDialog(false);
  };

  const handleRefreshData = () => {
    setLoading(true);
    // Simulate data refresh
    setTimeout(() => {
      setLoading(false);
      setSnackbar({ 
        open: true, 
        message: 'Data refreshed successfully!', 
        severity: 'success' 
      });
    }, 2000);
  };

  const paginatedProjects = filteredProjects.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  const isSelected = (id) => selectedProjects.indexOf(id) !== -1;

  // Statistics
  const stats = {
    pending: projects.filter(p => p.status === 'pending').length,
    verified: projects.filter(p => p.status === 'verified').length,
    flagged: projects.filter(p => p.flaggedIssues > 0).length,
    totalCredits: projects.reduce((sum, p) => sum + (p.status === 'verified' ? p.estimatedCredits : 0), 0)
  };

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <VerifiedUser 
              sx={{ 
                fontSize: 40, 
                mr: 2, 
                color: blueCarbon.aqua 
              }} 
            />
            <Box>
              <Typography variant="h4" className="gradient-text" gutterBottom>
                Project Verification
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Review, validate, and approve blue carbon projects for credit issuance
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              startIcon={<Settings />}
              onClick={() => setShowOptionalFeatures(!showOptionalFeatures)}
            >
              Optional Features
              {showOptionalFeatures ? <ExpandLess /> : <ExpandMore />}
            </Button>
            <Button
              variant="outlined"
              startIcon={<Refresh />}
              onClick={handleRefreshData}
            >
              Refresh Data
            </Button>
          </Box>
        </Box>

        {/* Quick Stats */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ 
              background: `linear-gradient(135deg, #ff980015 0%, #ff980025 100%)`,
              border: `1px solid #ff980030`
            }}>
              <CardContent sx={{ py: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: '#ff9800' }}>
                      {stats.pending}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Pending Verification
                    </Typography>
                  </Box>
                  <Avatar sx={{ bgcolor: '#ff9800' }}>
                    <Assignment />
                  </Avatar>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ 
              background: `linear-gradient(135deg, #4caf5015 0%, #4caf5025 100%)`,
              border: `1px solid #4caf5030`
            }}>
              <CardContent sx={{ py: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: '#4caf50' }}>
                      {stats.verified}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Verified Projects
                    </Typography>
                  </Box>
                  <Avatar sx={{ bgcolor: '#4caf50' }}>
                    <CheckCircle />
                  </Avatar>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ 
              background: `linear-gradient(135deg, #f4433615 0%, #f4433625 100%)`,
              border: `1px solid #f4433630`
            }}>
              <CardContent sx={{ py: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: '#f44336' }}>
                      {stats.flagged}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Flagged Issues
                    </Typography>
                  </Box>
                  <Avatar sx={{ bgcolor: '#f44336' }}>
                    <Flag />
                  </Avatar>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ 
              background: `linear-gradient(135deg, ${blueCarbon.aqua}15 0%, ${blueCarbon.aqua}25 100%)`,
              border: `1px solid ${blueCarbon.aqua}30`
            }}>
              <CardContent sx={{ py: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: blueCarbon.aqua }}>
                      {(stats.totalCredits / 1000).toFixed(0)}K
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Credits Issued
                    </Typography>
                  </Box>
                  <Avatar sx={{ bgcolor: blueCarbon.aqua }}>
                    <Assessment />
                  </Avatar>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Optional Add-ons Panel */}
        {showOptionalFeatures && (
          <Card sx={{ mb: 3, bgcolor: 'grey.50' }}>
            <CardContent>
              <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Settings sx={{ mr: 1 }} />
                Optional Add-ons
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={3}>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<BarChart />}
                    onClick={() => setMonthlyStatsDialog(true)}
                    sx={{ py: 1.5 }}
                  >
                    Projects Verified per Month
                  </Button>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<Link />}
                    onClick={() => window.open('https://etherscan.io', '_blank')}
                    sx={{ py: 1.5 }}
                  >
                    Blockchain Verification Viewer
                  </Button>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<Security />}
                    onClick={() => setDualVerificationDialog(true)}
                    sx={{ py: 1.5 }}
                  >
                    Dual Verification Workflow
                  </Button>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<FileDownload />}
                    onClick={() => setExportDialog(true)}
                    sx={{ py: 1.5 }}
                  >
                    Export Reports (CSV, PDF)
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        )}
      </Box>

      {/* Main Content - Vertical Layout */}
      <Grid container spacing={3}>
        {/* Project List */}
        <Grid item xs={12}>
          <Card sx={{ height: '70vh' }}>
            <CardContent sx={{ p: 0, height: '100%', display: 'flex', flexDirection: 'column' }}>
              {/* Search and Filters */}
              <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      size="small"
                      placeholder="Search projects..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      InputProps={{
                        startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />,
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Status</InputLabel>
                      <Select
                        value={filters.status}
                        label="Status"
                        onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                      >
                        <MenuItem value="all">All Status</MenuItem>
                        <MenuItem value="pending">Pending</MenuItem>
                        <MenuItem value="verified">Verified</MenuItem>
                        <MenuItem value="rejected">Rejected</MenuItem>
                        <MenuItem value="in-review">In Review</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Priority</InputLabel>
                      <Select
                        value={filters.priority}
                        label="Priority"
                        onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
                      >
                        <MenuItem value="all">All Priority</MenuItem>
                        <MenuItem value="high">High</MenuItem>
                        <MenuItem value="medium">Medium</MenuItem>
                        <MenuItem value="low">Low</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>

                {selectedProjects.length > 0 && (
                  <Box sx={{ mt: 2 }}>
                    <Button
                      variant="outlined"
                      startIcon={<FilterList />}
                      onClick={handleBulkAction}
                      sx={{ mr: 1 }}
                    >
                      Bulk Actions ({selectedProjects.length})
                    </Button>
                  </Box>
                )}
              </Box>

              {/* Project Table */}
              <Box sx={{ flexGrow: 1, overflow: 'hidden' }}>
                {loading && <LinearProgress />}
                <TableContainer sx={{ height: '100%' }}>
                  <Table stickyHeader>
                    <TableHead>
                      <TableRow>
                        <TableCell padding="checkbox">
                          <Checkbox
                            indeterminate={selectedProjects.length > 0 && selectedProjects.length < paginatedProjects.length}
                            checked={paginatedProjects.length > 0 && selectedProjects.length === paginatedProjects.length}
                            onChange={handleSelectAll}
                          />
                        </TableCell>
                        <TableCell><strong>Project ID</strong></TableCell>
                        <TableCell><strong>Project Name</strong></TableCell>
                        <TableCell><strong>Company Name</strong></TableCell>
                        <TableCell><strong>Submitted On</strong></TableCell>
                        <TableCell><strong>MRV Status</strong></TableCell>
                        <TableCell><strong>Verification Status</strong></TableCell>
                        <TableCell><strong>Action</strong></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {paginatedProjects.map((project) => {
                        const isItemSelected = isSelected(project.id);
                        return (
                          <TableRow
                            key={project.id}
                            hover
                            selected={isItemSelected || selectedProject?.id === project.id}
                            sx={{ 
                              cursor: 'pointer',
                              '&:hover': { bgcolor: 'action.hover' },
                              ...(selectedProject?.id === project.id && {
                                bgcolor: `${blueCarbon.aqua}10`,
                                borderLeft: `4px solid ${blueCarbon.aqua}`
                              })
                            }}
                            onClick={() => handleSelectProject(project)}
                          >
                            <TableCell padding="checkbox">
                              <Checkbox
                                checked={isItemSelected}
                                onChange={() => handleSelectOne(project.id)}
                                onClick={(e) => e.stopPropagation()}
                              />
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" sx={{ fontWeight: 500, color: blueCarbon.oceanBlue }}>
                                {project.id}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Box>
                                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                  {project.name}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {project.location}
                                </Typography>
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2">
                                {project.submittedBy}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2">
                                {formatDate(project.submissionDate)}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={project.mrvStatus}
                                size="small"
                                sx={{
                                  bgcolor: project.mrvStatus === 'Validated' ? '#4caf5020' : 
                                           project.mrvStatus === 'AI Verified' ? '#2196f320' : '#f4433620',
                                  color: project.mrvStatus === 'Validated' ? '#4caf50' : 
                                         project.mrvStatus === 'AI Verified' ? '#2196f3' : '#f44336',
                                  fontWeight: 500
                                }}
                              />
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={project.verificationStatus}
                                size="small"
                                sx={{
                                  bgcolor: `${getStatusColor(project.status)}20`,
                                  color: getStatusColor(project.status),
                                  fontWeight: 500
                                }}
                              />
                            </TableCell>
                            <TableCell>
                              <Button
                                size="small"
                                variant="outlined"
                                startIcon={<Visibility />}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleSelectProject(project);
                                }}
                                sx={{ 
                                  color: blueCarbon.oceanBlue,
                                  borderColor: blueCarbon.oceanBlue,
                                  '&:hover': {
                                    bgcolor: `${blueCarbon.oceanBlue}10`,
                                    borderColor: blueCarbon.oceanBlue
                                  }
                                }}
                              >
                                Review
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>

              {/* Data Source Info */}
              <Box sx={{ p: 2, bgcolor: 'grey.50', borderTop: 1, borderColor: 'divider' }}>
                <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Assessment sx={{ fontSize: 16, mr: 1, color: '#ff9800' }} />
                  <strong>Data Source:</strong> Project Registry DB + MRV Data DB
                </Typography>
                <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center' }}>
                  <FilterList sx={{ fontSize: 16, mr: 1, color: '#4caf50' }} />
                  <strong>Filter Option:</strong> Verified / Pending / Rejected / Certified
                </Typography>
              </Box>

              {/* Pagination */}
              <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={filteredProjects.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={(e, newPage) => setPage(newPage)}
                onRowsPerPageChange={(e) => {
                  setRowsPerPage(parseInt(e.target.value, 10));
                  setPage(0);
                }}
              />
            </CardContent>
          </Card>
        </Grid>

        {/* Project Details */}
        <Grid item xs={12}>
          {selectedProject ? (
            <ProjectDetailsView 
              project={selectedProject}
              onUpdate={(updatedProject) => {
                setProjects(prev => prev.map(p => p.id === updatedProject.id ? updatedProject : p));
                setSelectedProject(updatedProject);
              }}
            />
          ) : (
            <Card sx={{ height: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Box sx={{ textAlign: 'center', color: 'text.secondary' }}>
                <VerifiedUser sx={{ fontSize: 64, mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  Select a Project to View Details
                </Typography>
                <Typography variant="body2">
                  Choose a project from the list to view detailed information, verification status, and take actions.
                </Typography>
              </Box>
            </Card>
          )}
        </Grid>
      </Grid>

      {/* Backend Logic & Database Connections Info */}
      {showOptionalFeatures && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Assessment sx={{ mr: 1, color: blueCarbon.oceanBlue }} />
              Backend Logic & Database Connections
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell><strong>Feature</strong></TableCell>
                    <TableCell><strong>Database(s) Used</strong></TableCell>
                    <TableCell><strong>Purpose</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    <TableCell>Project List</TableCell>
                    <TableCell>Project Registry DB</TableCell>
                    <TableCell>Retrieve all registered projects</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>MRV Data</TableCell>
                    <TableCell>MRV Data DB</TableCell>
                    <TableCell>Validate AI-based results</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Certificate Generation</TableCell>
                    <TableCell>Certification DB + Blockchain Transaction DB</TableCell>
                    <TableCell>Issue and record certificates</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Logs</TableCell>
                    <TableCell>Log DB</TableCell>
                    <TableCell>Record all verification actions</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Notifications</TableCell>
                    <TableCell>Notification DB</TableCell>
                    <TableCell>Send email/SMS to companies post-verification</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>

            <Box sx={{ mt: 3 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, display: 'flex', alignItems: 'center' }}>
                <Description sx={{ mr: 1, color: '#ff9800' }} />
                Suggested UI Components
              </Typography>
              <List dense>
                <ListItem>
                  <ListItemText primary="Search bar → by project ID, company name" />
                </ListItem>
                <ListItem>
                  <ListItemText primary="Filters → Pending, Verified, Rejected" />
                </ListItem>
                <ListItem>
                  <ListItemText primary="Table → sortable & paginated" />
                </ListItem>
                <ListItem>
                  <ListItemText primary="Review Modal → with document viewer + MRV map + action buttons" />
                </ListItem>
                <ListItem>
                  <ListItemText primary="Toast messages → 'Verification Successful', 'Certificate Issued'" />
                </ListItem>
                <ListItem>
                  <ListItemText primary="Download PDF button → for issued certificates" />
                </ListItem>
              </List>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Bulk Action Dialog */}
      <Dialog open={bulkActionDialog} onClose={() => setBulkActionDialog(false)}>
        <DialogTitle>Bulk Action</DialogTitle>
        <DialogContent>
          <Typography sx={{ mb: 2 }}>
            Select an action to apply to {selectedProjects.length} selected projects:
          </Typography>
          <FormControl fullWidth>
            <InputLabel>Action</InputLabel>
            <Select
              value={bulkAction}
              label="Action"
              onChange={(e) => setBulkAction(e.target.value)}
            >
              <MenuItem value="approve">Approve Projects</MenuItem>
              <MenuItem value="reject">Reject Projects</MenuItem>
              <MenuItem value="request-info">Request More Information</MenuItem>
              <MenuItem value="assign-team">Assign Verification Team</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBulkActionDialog(false)}>Cancel</Button>
          <Button 
            onClick={executeBulkAction} 
            variant="contained"
            disabled={!bulkAction}
          >
            Apply Action
          </Button>
        </DialogActions>
      </Dialog>

      {/* Monthly Stats Dialog */}
      <Dialog open={monthlyStatsDialog} onClose={() => setMonthlyStatsDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Projects Verified per Month</DialogTitle>
        <DialogContent>
          <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'grey.50', borderRadius: 2 }}>
            <Box sx={{ textAlign: 'center' }}>
              <BarChart sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary">
                Monthly Verification Statistics
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Interactive chart showing verification trends over time
              </Typography>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setMonthlyStatsDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Export Reports Dialog */}
      <Dialog open={exportDialog} onClose={() => setExportDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Export Verified Projects</DialogTitle>
        <DialogContent>
          <Typography sx={{ mb: 3 }}>
            Choose the format and date range for your export:
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Export Format</InputLabel>
                <Select 
                  value={exportFormat} 
                  label="Export Format"
                  onChange={(e) => setExportFormat(e.target.value)}
                >
                  <MenuItem value="csv">CSV Spreadsheet</MenuItem>
                  <MenuItem value="pdf">PDF Report</MenuItem>
                  <MenuItem value="excel">Excel Workbook</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Start Date"
                type="date"
                value={exportDateRange.startDate}
                onChange={(e) => setExportDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="End Date"
                type="date"
                value={exportDateRange.endDate}
                onChange={(e) => setExportDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setExportDialog(false)}>Cancel</Button>
          <Button 
            variant="contained" 
            startIcon={<Download />}
            onClick={handleExportReport}
          >
            Export Report
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dual Verification Dialog */}
      <Dialog open={dualVerificationDialog} onClose={() => setDualVerificationDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Dual Verification Workflow</DialogTitle>
        <DialogContent>
          <Typography sx={{ mb: 2 }}>
            Enable dual verification workflow where two officers must approve before certificate issuance?
          </Typography>
          <Alert severity="info" sx={{ mb: 2 }}>
            This will require approval from two different government officers before any certificate can be issued.
          </Alert>
          <Typography variant="body2" color="text.secondary">
            Current workflow: Single officer approval<br/>
            New workflow: Dual officer approval required
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDualVerificationDialog(false)}>Cancel</Button>
          <Button 
            onClick={handleDualVerification}
            variant="contained"
            startIcon={<Security />}
          >
            Enable Dual Verification
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default ProjectVerification;