import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Tabs,
  Tab,
  Grid,
  Chip,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  LinearProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
} from '@mui/material';
import {
  LocationOn,
  Business,
  CalendarToday,
  CheckCircle,
  Cancel,
  Warning,
  Assignment,
  Group,
  Download,
  Visibility,
  Map,
  Description,
  Image,
  Timeline,
  Flag,
  QrCode,
} from '@mui/icons-material';
import { blueCarbon } from '../../../theme/colors';

const ProjectDetailsView = ({ project, onUpdate }) => {
  const [activeTab, setActiveTab] = useState(0);
  const [actionDialog, setActionDialog] = useState(false);
  const [selectedAction, setSelectedAction] = useState('');
  const [actionNotes, setActionNotes] = useState('');
  const [assignedTeam, setAssignedTeam] = useState(project.verificationTeam || '');
  const [certificateDialog, setCertificateDialog] = useState(false);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleAction = (action) => {
    setSelectedAction(action);
    setActionDialog(true);
  };

  const executeAction = () => {
    const updatedProject = {
      ...project,
      status: selectedAction === 'approve' ? 'verified' : 
              selectedAction === 'reject' ? 'rejected' : 
              selectedAction === 'request-info' ? 'pending' : project.status,
      verificationTeam: assignedTeam,
      lastActivity: new Date()
    };
    
    onUpdate(updatedProject);
    setActionDialog(false);
    setSelectedAction('');
    setActionNotes('');

    // Show certificate dialog if approved
    if (selectedAction === 'approve') {
      setCertificateDialog(true);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
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

  // Mock data for different tabs
  const mockDocuments = [
    { name: 'Project Proposal.pdf', type: 'PDF', size: '2.4 MB', uploadDate: '2024-01-15' },
    { name: 'Environmental Assessment.pdf', type: 'PDF', size: '5.1 MB', uploadDate: '2024-01-15' },
    { name: 'Ownership Proof.pdf', type: 'PDF', size: '1.2 MB', uploadDate: '2024-01-15' },
    { name: 'Baseline Study.pdf', type: 'PDF', size: '8.7 MB', uploadDate: '2024-01-16' }
  ];

  const mockImages = [
    { name: 'Site Overview.jpg', type: 'Image', size: '3.2 MB', uploadDate: '2024-01-15' },
    { name: 'Mangrove Area 1.jpg', type: 'Image', size: '2.8 MB', uploadDate: '2024-01-15' },
    { name: 'Satellite View.jpg', type: 'Image', size: '4.1 MB', uploadDate: '2024-01-16' }
  ];

  const mockValidationResults = [
    { metric: 'Vegetation Index', value: '0.82', status: 'passed', threshold: '> 0.7' },
    { metric: 'CO2 Capture Rate', value: '45 tons/hectare', status: 'passed', threshold: '> 30 tons/hectare' },
    { metric: 'Satellite Analysis', value: '94% accuracy', status: 'passed', threshold: '> 85%' },
    { metric: 'Biodiversity Score', value: '0.76', status: 'warning', threshold: '> 0.8' }
  ];

  const mockAuditLogs = [
    { date: '2024-01-20', action: 'Project Submitted', user: 'Company Team', details: 'Initial project submission with all documents' },
    { date: '2024-01-21', action: 'AI Validation Started', user: 'System', details: 'Automated validation process initiated' },
    { date: '2024-01-22', action: 'Document Review', user: 'Admin User', details: 'All documents verified and approved' },
    { date: '2024-01-23', action: 'MRV Scan Completed', user: 'System', details: 'Satellite data analysis completed successfully' }
  ];

  const complianceItems = [
    { item: 'Environmental Impact Assessment', status: 'completed', required: true },
    { item: 'Land Ownership Documentation', status: 'completed', required: true },
    { item: 'Baseline Carbon Stock Measurement', status: 'completed', required: true },
    { item: 'Biodiversity Assessment', status: 'pending', required: true },
    { item: 'Community Consultation Report', status: 'completed', required: false },
    { item: 'Financial Sustainability Plan', status: 'in-progress', required: true }
  ];

  // Certificate data
  const certificateData = {
    id: `CERT-${project.id}-${Date.now()}`,
    projectId: project.id,
    carbonCredits: project.estimatedCredits,
    issueDate: new Date().toISOString().split('T')[0],
    expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 1 year from now
    digitalSignature: `0x${Math.random().toString(16).substr(2, 40)}`,
    blockchainTxId: `0x${Math.random().toString(16).substr(2, 64)}`
  };

  return (
    <Card sx={{ height: '80vh' }}>
      <CardContent sx={{ p: 0, height: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* Project Header */}
        <Box sx={{ p: 3, borderBottom: 1, borderColor: 'divider' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
            <Box sx={{ flex: 1 }}>
              <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
                {project.name}
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                <Chip
                  icon={<LocationOn />}
                  label={project.location}
                  size="small"
                  variant="outlined"
                />
                <Chip
                  icon={<Business />}
                  label={project.submittedBy}
                  size="small"
                  variant="outlined"
                />
                <Chip
                  icon={<CalendarToday />}
                  label={formatDate(project.submissionDate)}
                  size="small"
                  variant="outlined"
                />
              </Box>
            </Box>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Chip
                label={project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                sx={{
                  bgcolor: `${getStatusColor(project.status)}20`,
                  color: getStatusColor(project.status),
                  fontWeight: 500
                }}
              />
              {project.flaggedIssues > 0 && (
                <Chip
                  icon={<Flag />}
                  label={`${project.flaggedIssues} issues`}
                  color="error"
                  size="small"
                />
              )}
            </Box>
          </Box>

          {/* Quick Stats */}
          <Grid container spacing={2}>
            <Grid item xs={3}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h6" sx={{ fontWeight: 600, color: blueCarbon.aqua }}>
                  {project.area}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Project Area
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={3}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h6" sx={{ fontWeight: 600, color: blueCarbon.teal }}>
                  {(project.estimatedCredits / 1000).toFixed(0)}K
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Est. Credits
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={3}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h6" sx={{ fontWeight: 600, color: '#4caf50' }}>
                  {project.aiValidationScore}%
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  AI Score
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={3}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h6" sx={{ fontWeight: 600, color: '#ff9800' }}>
                  {project.complianceScore}%
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Compliance
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Box>

        {/* Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={activeTab} onChange={handleTabChange} variant="scrollable" scrollButtons="auto">
            <Tab icon={<Description />} label="Overview" />
            <Tab icon={<Image />} label="Documents & Images" />
            <Tab icon={<CheckCircle />} label="Compliance" />
            <Tab icon={<Timeline />} label="Validation Logs" />
            <Tab icon={<Assignment />} label="Verification Actions" />
            <Tab icon={<Group />} label="Team Assignment" />
          </Tabs>
        </Box>

        {/* Tab Content */}
        <Box sx={{ flexGrow: 1, overflow: 'auto', p: 3 }}>
          {/* Overview Tab */}
          {activeTab === 0 && (
            <Box>
              <Typography variant="h6" gutterBottom>Project Overview</Typography>
              <Typography variant="body1" paragraph>
                {project.description}
              </Typography>
              
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                    Project Details
                  </Typography>
                  <List dense>
                    <ListItem>
                      <ListItemText primary="Project Type" secondary={project.projectType} />
                    </ListItem>
                    <ListItem>
                      <ListItemText primary="Area Coverage" secondary={project.area} />
                    </ListItem>
                    <ListItem>
                      <ListItemText primary="Estimated Credits" secondary={`${project.estimatedCredits.toLocaleString()} tons CO2`} />
                    </ListItem>
                    <ListItem>
                      <ListItemText primary="Priority Level" secondary={project.priority.charAt(0).toUpperCase() + project.priority.slice(1)} />
                    </ListItem>
                  </List>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                    Validation Scores
                  </Typography>
                  <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2">AI Validation</Typography>
                      <Typography variant="body2">{project.aiValidationScore}%</Typography>
                    </Box>
                    <LinearProgress 
                      variant="determinate" 
                      value={project.aiValidationScore} 
                      sx={{ height: 8, borderRadius: 4 }}
                    />
                  </Box>
                  
                  <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2">Compliance Score</Typography>
                      <Typography variant="body2">{project.complianceScore}%</Typography>
                    </Box>
                    <LinearProgress 
                      variant="determinate" 
                      value={project.complianceScore} 
                      sx={{ height: 8, borderRadius: 4 }}
                    />
                  </Box>
                </Grid>
              </Grid>

              {/* Location Map Placeholder */}
              <Box sx={{ mt: 3 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                  Project Location
                </Typography>
                <Box 
                  sx={{ 
                    height: 200, 
                    bgcolor: 'grey.100', 
                    borderRadius: 2, 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    border: 1,
                    borderColor: 'divider'
                  }}
                >
                  <Box sx={{ textAlign: 'center' }}>
                    <Map sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
                    <Typography variant="body2" color="text.secondary">
                      Interactive Map View
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Lat: {project.coordinates.lat}, Lng: {project.coordinates.lng}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Box>
          )}

          {/* Documents & Images Tab */}
          {activeTab === 1 && (
            <Box>
              <Typography variant="h6" gutterBottom>Documents & Images</Typography>
              
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                    Uploaded Documents ({mockDocuments.length})
                  </Typography>
                  <List>
                    {mockDocuments.map((doc, index) => (
                      <ListItem key={index} sx={{ border: 1, borderColor: 'divider', borderRadius: 1, mb: 1 }}>
                        <ListItemIcon>
                          <Description color="primary" />
                        </ListItemIcon>
                        <ListItemText 
                          primary={doc.name}
                          secondary={`${doc.type} • ${doc.size} • ${doc.uploadDate}`}
                        />
                        <IconButton size="small">
                          <Visibility />
                        </IconButton>
                        <IconButton size="small">
                          <Download />
                        </IconButton>
                      </ListItem>
                    ))}
                  </List>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                    Project Images ({mockImages.length})
                  </Typography>
                  <List>
                    {mockImages.map((img, index) => (
                      <ListItem key={index} sx={{ border: 1, borderColor: 'divider', borderRadius: 1, mb: 1 }}>
                        <ListItemIcon>
                          <Image color="secondary" />
                        </ListItemIcon>
                        <ListItemText 
                          primary={img.name}
                          secondary={`${img.type} • ${img.size} • ${img.uploadDate}`}
                        />
                        <IconButton size="small">
                          <Visibility />
                        </IconButton>
                        <IconButton size="small">
                          <Download />
                        </IconButton>
                      </ListItem>
                    ))}
                  </List>
                </Grid>
              </Grid>
            </Box>
          )}

          {/* Compliance Tab */}
          {activeTab === 2 && (
            <Box>
              <Typography variant="h6" gutterBottom>Compliance Checklist</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Review all compliance requirements and their current status
              </Typography>
              
              <List>
                {complianceItems.map((item, index) => (
                  <React.Fragment key={index}>
                    <ListItem sx={{ py: 2 }}>
                      <ListItemIcon>
                        {item.status === 'completed' ? (
                          <CheckCircle sx={{ color: '#4caf50' }} />
                        ) : item.status === 'pending' ? (
                          <Warning sx={{ color: '#ff9800' }} />
                        ) : (
                          <Timeline sx={{ color: blueCarbon.oceanBlue }} />
                        )}
                      </ListItemIcon>
                      <ListItemText 
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="body1">
                              {item.item}
                            </Typography>
                            {item.required && (
                              <Chip label="Required" size="small" color="error" variant="outlined" />
                            )}
                          </Box>
                        }
                        secondary={`Status: ${item.status.charAt(0).toUpperCase() + item.status.slice(1).replace('-', ' ')}`}
                      />
                      <Chip
                        label={item.status.charAt(0).toUpperCase() + item.status.slice(1).replace('-', ' ')}
                        size="small"
                        sx={{
                          bgcolor: item.status === 'completed' ? '#4caf5020' : 
                                   item.status === 'pending' ? '#ff980020' : '#2196f320',
                          color: item.status === 'completed' ? '#4caf50' : 
                                 item.status === 'pending' ? '#ff9800' : '#2196f3'
                        }}
                      />
                    </ListItem>
                    {index < complianceItems.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
              
              <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                  Compliance Summary
                </Typography>
                <Typography variant="body2">
                  {complianceItems.filter(item => item.status === 'completed').length} of {complianceItems.length} items completed
                </Typography>
                <LinearProgress 
                  variant="determinate" 
                  value={(complianceItems.filter(item => item.status === 'completed').length / complianceItems.length) * 100}
                  sx={{ mt: 1, height: 6, borderRadius: 3 }}
                />
              </Box>
            </Box>
          )}

          {/* Validation Logs Tab */}
          {activeTab === 3 && (
            <Box>
              <Typography variant="h6" gutterBottom>MRV Validation Results</Typography>
              
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                    AI-Generated Metrics
                  </Typography>
                  <List>
                    {mockValidationResults.map((result, index) => (
                      <ListItem key={index} sx={{ border: 1, borderColor: 'divider', borderRadius: 1, mb: 1 }}>
                        <ListItemIcon>
                          {result.status === 'passed' ? (
                            <CheckCircle sx={{ color: '#4caf50' }} />
                          ) : (
                            <Warning sx={{ color: '#ff9800' }} />
                          )}
                        </ListItemIcon>
                        <ListItemText 
                          primary={result.metric}
                          secondary={`Value: ${result.value} | Threshold: ${result.threshold}`}
                        />
                        <Chip
                          label={result.status.charAt(0).toUpperCase() + result.status.slice(1)}
                          size="small"
                          sx={{
                            bgcolor: result.status === 'passed' ? '#4caf5020' : '#ff980020',
                            color: result.status === 'passed' ? '#4caf50' : '#ff9800'
                          }}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                    Audit Trail
                  </Typography>
                  <List>
                    {mockAuditLogs.map((log, index) => (
                      <ListItem key={index} alignItems="flex-start" sx={{ mb: 1 }}>
                        <ListItemIcon sx={{ mt: 1 }}>
                          <Timeline color="primary" />
                        </ListItemIcon>
                        <ListItemText 
                          primary={
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                {log.action}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {log.date}
                              </Typography>
                            </Box>
                          }
                          secondary={
                            <Box>
                              <Typography variant="caption" color="text.secondary">
                                by {log.user}
                              </Typography>
                              <Typography variant="body2" sx={{ mt: 0.5 }}>
                                {log.details}
                              </Typography>
                            </Box>
                          }
                        />
                      </ListItem>
                    ))}
                  </List>
                </Grid>
              </Grid>
            </Box>
          )}

          {/* Verification Actions Tab */}
          {activeTab === 4 && (
            <Box>
              <Typography variant="h6" gutterBottom>Verification Actions</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Take action on this project based on your review
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <Button
                    fullWidth
                    variant="contained"
                    color="success"
                    startIcon={<CheckCircle />}
                    onClick={() => handleAction('approve')}
                    sx={{ py: 2 }}
                  >
                    Approve Project
                    <Typography variant="caption" sx={{ display: 'block', mt: 0.5 }}>
                      Issues certificate
                    </Typography>
                  </Button>
                </Grid>
                
                <Grid item xs={12} md={4}>
                  <Button
                    fullWidth
                    variant="contained"
                    color="error"
                    startIcon={<Cancel />}
                    onClick={() => handleAction('reject')}
                    sx={{ py: 2 }}
                  >
                    Reject Project
                    <Typography variant="caption" sx={{ display: 'block', mt: 0.5 }}>
                      Requires revision
                    </Typography>
                  </Button>
                </Grid>
                
                <Grid item xs={12} md={4}>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<Warning />}
                    onClick={() => handleAction('request-info')}
                    sx={{ py: 2 }}
                  >
                    Request Additional Data
                    <Typography variant="caption" sx={{ display: 'block', mt: 0.5 }}>
                      Need more information
                    </Typography>
                  </Button>
                </Grid>
              </Grid>

              {project.status === 'verified' && (
                <Alert severity="success" sx={{ mt: 3 }}>
                  <Typography variant="subtitle2">Certificate Issued</Typography>
                  This project has been verified and a certificate has been generated. 
                  <Button size="small" startIcon={<Download />} sx={{ ml: 1 }}>
                    Download Certificate
                  </Button>
                </Alert>
              )}

              {project.status === 'rejected' && (
                <Alert severity="error" sx={{ mt: 3 }}>
                  <Typography variant="subtitle2">Project Rejected</Typography>
                  This project has been rejected and requires revision before resubmission.
                </Alert>
              )}
            </Box>
          )}

          {/* Team Assignment Tab */}
          {activeTab === 5 && (
            <Box>
              <Typography variant="h6" gutterBottom>Team Assignment</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Assign verification team members to this project
              </Typography>
              
              <FormControl fullWidth sx={{ mb: 3 }}>
                <InputLabel>Verification Team</InputLabel>
                <Select
                  value={assignedTeam}
                  label="Verification Team"
                  onChange={(e) => setAssignedTeam(e.target.value)}
                >
                  <MenuItem value="">No Team Assigned</MenuItem>
                  <MenuItem value="Field Team Alpha">Field Team Alpha</MenuItem>
                  <MenuItem value="Field Team Beta">Field Team Beta</MenuItem>
                  <MenuItem value="Remote Verification Team">Remote Verification Team</MenuItem>
                  <MenuItem value="Senior Review Panel">Senior Review Panel</MenuItem>
                </Select>
              </FormControl>

              {assignedTeam && (
                <Alert severity="info" sx={{ mb: 2 }}>
                  Team "{assignedTeam}" has been assigned to this project.
                </Alert>
              )}

              <Button
                variant="contained"
                onClick={() => {
                  const updatedProject = { ...project, verificationTeam: assignedTeam };
                  onUpdate(updatedProject);
                }}
                disabled={assignedTeam === project.verificationTeam}
              >
                Update Team Assignment
              </Button>
            </Box>
          )}
        </Box>
      </CardContent>

      {/* Action Dialog */}
      <Dialog open={actionDialog} onClose={() => setActionDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedAction === 'approve' ? 'Approve Project' :
           selectedAction === 'reject' ? 'Reject Project' :
           'Request Additional Information'}
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ mb: 2 }}>
            {selectedAction === 'approve' ? 
              'This will approve the project and generate a certificate. Are you sure?' :
             selectedAction === 'reject' ?
              'This will reject the project. Please provide a reason:' :
              'Request additional information from the project submitter:'}
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Notes/Comments"
            value={actionNotes}
            onChange={(e) => setActionNotes(e.target.value)}
            placeholder={selectedAction === 'approve' ? 'Optional approval notes...' :
                        selectedAction === 'reject' ? 'Reason for rejection...' :
                        'What additional information is needed?'}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setActionDialog(false)}>Cancel</Button>
          <Button 
            onClick={executeAction} 
            variant="contained"
            color={selectedAction === 'approve' ? 'success' : 
                   selectedAction === 'reject' ? 'error' : 'primary'}
          >
            {selectedAction === 'approve' ? 'Approve & Issue Certificate' :
             selectedAction === 'reject' ? 'Reject Project' :
             'Send Request'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Certificate Issuance Dialog */}
      <Dialog open={certificateDialog} onClose={() => setCertificateDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ textAlign: 'center', pb: 1 }}>
          <CheckCircle sx={{ fontSize: 48, color: '#4caf50', mb: 1 }} />
          <Typography variant="h5" sx={{ fontWeight: 600 }}>
            Certificate Issued Successfully
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Typography variant="body1" color="text.secondary">
              The project has been verified and a digital certificate has been generated and stored on the blockchain.
            </Typography>
          </Box>

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                Certificate Details
              </Typography>
              <List dense>
                <ListItem>
                  <ListItemText primary="Certificate ID" secondary={certificateData.id} />
                </ListItem>
                <ListItem>
                  <ListItemText primary="Project ID" secondary={certificateData.projectId} />
                </ListItem>
                <ListItem>
                  <ListItemText primary="Verified Carbon Credits" secondary={`${certificateData.carbonCredits.toLocaleString()} tons CO2`} />
                </ListItem>
                <ListItem>
                  <ListItemText primary="Issue Date" secondary={certificateData.issueDate} />
                </ListItem>
                <ListItem>
                  <ListItemText primary="Expiry Date" secondary={certificateData.expiryDate || 'No expiry'} />
                </ListItem>
              </List>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                Blockchain Record
              </Typography>
              <List dense>
                <ListItem>
                  <ListItemIcon>
                    <QrCode color="primary" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Digital Signature" 
                    secondary={certificateData.digitalSignature}
                    sx={{ '& .MuiListItemText-secondary': { wordBreak: 'break-all' } }}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <QrCode color="primary" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Blockchain Transaction ID" 
                    secondary={certificateData.blockchainTxId}
                    sx={{ '& .MuiListItemText-secondary': { wordBreak: 'break-all' } }}
                  />
                </ListItem>
              </List>
              
              <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 2, textAlign: 'center' }}>
                <QrCode sx={{ fontSize: 64, color: 'text.secondary', mb: 1 }} />
                <Typography variant="caption" color="text.secondary">
                  QR Code for blockchain verification
                </Typography>
              </Box>
            </Grid>
          </Grid>

          <Alert severity="info" sx={{ mt: 3 }}>
            <Typography variant="subtitle2">Storage Information</Typography>
            <Typography variant="body2">
              <strong>Stored in:</strong> Certification DB + Blockchain Transaction DB<br/>
              <strong>Linked with:</strong> Blockchain Transaction DB for immutable record keeping
            </Typography>
          </Alert>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', pb: 3 }}>
          <Button 
            variant="outlined" 
            startIcon={<Download />}
            sx={{ mr: 1 }}
          >
            Download Certificate (PDF)
          </Button>
          <Button 
            variant="contained" 
            onClick={() => setCertificateDialog(false)}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
};

export default ProjectDetailsView;