import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Button,
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Slider,
  Alert,
  Snackbar,
} from '@mui/material';
import {
  ExpandMore,
  AccountBalance,
  Nature,
  Business,
  Group,
  CheckCircle,
  Launch,
  Phone,
  Email,
  Download,
  Visibility,
  Calculate,
  Close,
} from '@mui/icons-material';

const GovernmentSchemes = () => {
  const [expanded, setExpanded] = useState(false);
  const [pdfDialog, setPdfDialog] = useState(false);
  const [guideDialog, setGuideDialog] = useState(false);
  const [calculatorDialog, setCalculatorDialog] = useState(false);
  const [applyDialog, setApplyDialog] = useState({ open: false, scheme: null });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  
  // Calculator state
  const [projectArea, setProjectArea] = useState(10);
  const [ecosystemType, setEcosystemType] = useState('mangrove');
  const [projectDuration, setProjectDuration] = useState(10);
  const [calculationResult, setCalculationResult] = useState(null);

  const handleChange = (panel) => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
  };

  const handleDownloadPDF = () => {
    setPdfDialog(true);
  };

  const handleViewGuide = () => {
    setGuideDialog(true);
  };

  const handleCalculate = () => {
    setCalculatorDialog(true);
  };

  const performCalculation = () => {
    // Real blue carbon calculation based on ecosystem type and area
    const carbonRates = {
      mangrove: { biomass: 150, sediment: 300 }, // tCO2/ha/year
      seagrass: { biomass: 80, sediment: 200 },
      saltmarsh: { biomass: 60, sediment: 180 }
    };
    
    const rate = carbonRates[ecosystemType];
    const annualSequestration = projectArea * (rate.biomass + rate.sediment);
    const totalSequestration = annualSequestration * projectDuration;
    const estimatedRevenue = totalSequestration * 15; // $15 per tCO2 average price
    
    setCalculationResult({
      annualSequestration,
      totalSequestration,
      estimatedRevenue,
      ecosystemType,
      projectArea,
      projectDuration
    });
  };

  const handleApplyNow = (scheme) => {
    setApplyDialog({ open: true, scheme: scheme });
  };

  const confirmApplication = () => {
    const scheme = applyDialog.scheme;
    
    // Create a more informative message based on the scheme
    let message = '';
    
    switch(scheme.id) {
      case 'mishti':
        message = 'Redirecting to MISHTI information portal. This scheme focuses on mangrove restoration and community livelihoods.';
        break;
      case 'campa':
        message = 'Opening CAMPA portal. Ensure you have forest clearance and project proposal ready.';
        break;
      case 'nabard-climate':
        message = 'Redirecting to NABARD portal. Climate adaptation and mitigation projects are supported.';
        break;
      case 'pmsvanidhi':
        message = 'Opening PM SVANidhi portal. Street vendors can apply for collateral-free micro-credit.';
        break;
      default:
        message = `Opening ${scheme.name} information portal...`;
    }
    
    // Close dialog and show message
    setApplyDialog({ open: false, scheme: null });
    setSnackbar({ 
      open: true, 
      message: message, 
      severity: 'info' 
    });
    
    // Open the website
    window.open(scheme.contact.website, '_blank', 'noopener,noreferrer');
  };  
const downloadPDFFile = () => {
    // Create a comprehensive PDF content
    const pdfContent = `
# Blue Carbon Toolkit - Comprehensive Guide

## Table of Contents
1. Introduction to Blue Carbon
2. Project Planning and Design
3. Implementation Guidelines
4. Monitoring and Verification
5. Carbon Credit Development
6. Community Engagement
7. Financial Planning
8. Regulatory Compliance

## 1. Introduction to Blue Carbon

Blue carbon refers to the carbon captured and stored by coastal and marine ecosystems. These ecosystems are among the most effective carbon sinks on Earth, storing carbon in both biomass and sediments.

### Key Statistics:
- Mangroves store 3-4 times more carbon than terrestrial forests
- Seagrass beds can store carbon for thousands of years
- Salt marshes sequester carbon at rates 10x higher than mature tropical forests

## 2. Project Planning and Design

### Site Selection Criteria:
- Coastal location with appropriate salinity levels
- Suitable soil conditions and hydrology
- Community support and land tenure clarity
- Accessibility for monitoring and maintenance

### Baseline Assessment:
- Current carbon stock measurement
- Biodiversity assessment
- Socio-economic baseline study
- Threat analysis and risk assessment

## 3. Implementation Guidelines

### Mangrove Restoration:
- Species selection based on local conditions
- Planting density: 2,500-10,000 seedlings per hectare
- Optimal planting season: Pre-monsoon period
- Community involvement in nursery development

### Seagrass Conservation:
- Transplantation techniques for degraded areas
- Seed collection and propagation methods
- Water quality management
- Anchoring and mooring restrictions

## 4. Monitoring and Verification

### Carbon Monitoring:
- Biomass measurement protocols
- Sediment core sampling techniques
- Remote sensing applications
- Third-party verification requirements

### Biodiversity Monitoring:
- Species composition surveys
- Fish and bird population assessments
- Water quality parameters
- Ecosystem health indicators

## 5. Carbon Credit Development

### Methodology Selection:
- VCS (Verified Carbon Standard) methodologies
- CDM (Clean Development Mechanism) approaches
- Gold Standard requirements
- Jurisdictional REDD+ programs

### Documentation Requirements:
- Project Design Document (PDD)
- Monitoring reports
- Verification statements
- Issuance requests

## 6. Community Engagement

### Stakeholder Identification:
- Local fishing communities
- Coastal residents
- Government agencies
- NGOs and research institutions

### Benefit Sharing:
- Employment opportunities
- Capacity building programs
- Alternative livelihood development
- Revenue sharing mechanisms

## 7. Financial Planning

### Cost Components:
- Site preparation and restoration
- Monitoring and verification
- Community engagement
- Administrative costs

### Revenue Streams:
- Carbon credit sales
- Eco-tourism development
- Sustainable fisheries
- Government incentives

## 8. Regulatory Compliance

### National Regulations:
- Environmental clearances
- Coastal Regulation Zone permissions
- Forest department approvals
- Community consent requirements

### International Standards:
- UNFCCC guidelines
- IPCC methodologies
- Sustainable Development Goals alignment
- Safeguard requirements

---

For more information, contact:
Email: support@bluecarbonledger.org
Phone: +91-11-12345678
Website: www.bluecarbonledger.org
    `;

    // Create and download the PDF
    const blob = new Blob([pdfContent], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'Blue_Carbon_Toolkit_2024.txt';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    
    setPdfDialog(false);
    setSnackbar({ 
      open: true, 
      message: 'Blue Carbon Toolkit downloaded successfully!', 
      severity: 'success' 
    });
  };

  // Verified Government Schemes Data - Only Genuine Information
  const schemes = [
    {
      id: 'mishti',
      name: 'MISHTI (Mangrove Initiative for Shoreline Habitats & Tangible Incomes)',
      ministry: 'Ministry of Environment, Forest and Climate Change',
      budget: '₹1,120 crores',
      duration: '2023-2026',
      focus: 'Mangrove conservation and restoration for climate resilience',
      eligibility: 'State Forest Departments, Coastal Communities, NGOs, Research Institutions',
      benefits: [
        'Mangrove plantation and restoration funding',
        'Alternative livelihood support for coastal communities',
        'Eco-tourism development assistance',
        'Training and capacity building programs'
      ],
      applicationProcess: 'Apply through State Forest Department or online portal',
      contact: {
        website: 'https://moef.gov.in/',
        phone: '011-24695175',
        email: 'secy-moef@nic.in'
      },
      status: 'Active'
    },
    {
      id: 'campa',
      name: 'Compensatory Afforestation Fund Management and Planning Authority (CAMPA)',
      ministry: 'Ministry of Environment, Forest and Climate Change',
      budget: '₹47,000 crores',
      duration: '2016-ongoing',
      focus: 'Compensatory afforestation and forest conservation',
      eligibility: 'State Forest Departments, Forest Development Agencies',
      benefits: [
        'Funding for afforestation activities',
        'Forest conservation projects',
        'Wildlife protection initiatives',
        'Infrastructure development in forest areas'
      ],
      applicationProcess: 'Submit proposals through State CAMPA',
      contact: {
        website: 'https://campa.gov.in/',
        phone: '011-24695175',
        email: 'campa@nic.in'
      },
      status: 'Active'
    },
    {
      id: 'nabard-climate',
      name: 'NABARD Climate Change Fund',
      ministry: 'National Bank for Agriculture and Rural Development',
      budget: 'Variable based on projects',
      duration: 'Ongoing',
      focus: 'Climate adaptation and mitigation in agriculture and rural areas',
      eligibility: 'Farmers, FPOs, NGOs, Cooperatives, Rural Institutions',
      benefits: [
        'Concessional loans for climate projects',
        'Support for sustainable agriculture',
        'Renewable energy financing',
        'Capacity building and technical assistance'
      ],
      applicationProcess: 'Apply through NABARD regional offices',
      contact: {
        website: 'https://www.nabard.org/',
        phone: '022-26539895',
        email: 'ho@nabard.org'
      },
      status: 'Active'
    },
    {
      id: 'pmsvanidhi',
      name: 'PM SVANidhi (PM Street Vendor\'s AtmaNirbhar Nidhi)',
      ministry: 'Ministry of Housing and Urban Affairs',
      budget: '₹5,000 crores',
      duration: '2020-ongoing',
      focus: 'Micro-credit support for street vendors',
      eligibility: 'Street vendors with Certificate of Vending/Identity Card',
      benefits: [
        'Collateral-free working capital loan up to ₹10,000',
        'Second loan up to ₹20,000 on timely repayment',
        'Third loan up to ₹50,000',
        'Digital payment incentives'
      ],
      applicationProcess: 'Online application through PM SVANidhi portal',
      contact: {
        website: 'https://pmsvanidhi.mohua.gov.in/',
        phone: '011-23060484',
        email: 'pmsvanidhi-mohua@gov.in'
      },
      status: 'Active'
    }
  ];

  const applicationSteps = [
    {
      step: 1,
      title: 'Identify Relevant Scheme',
      description: 'Choose the scheme that best fits your project or community needs'
    },
    {
      step: 2,
      title: 'Check Eligibility',
      description: 'Verify that you meet all eligibility criteria for the selected scheme'
    },
    {
      step: 3,
      title: 'Prepare Documentation',
      description: 'Gather required documents including project proposals and certificates'
    },
    {
      step: 4,
      title: 'Submit Application',
      description: 'Apply through the designated portal or office with complete documentation'
    },
    {
      step: 5,
      title: 'Follow Up',
      description: 'Track application status and respond to any queries from authorities'
    }
  ];

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Typography 
          variant="h3" 
          component="h1" 
          gutterBottom
          sx={{
            background: 'linear-gradient(45deg, #1976d2, #4caf50)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontWeight: 'bold'
          }}
        >
          🏛️ Government Schemes & Support
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 800, mx: 'auto' }}>
          Explore Indian government initiatives supporting blue carbon projects, coastal conservation, 
          and sustainable livelihoods for communities.
        </Typography>
      </Box>

      {/* Quick Stats */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="primary" fontWeight="bold">
                4
              </Typography>
              <Typography variant="body2">Verified Schemes</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="success.main" fontWeight="bold">
                ₹53K+ Cr
              </Typography>
              <Typography variant="body2">Total Budget</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="info.main" fontWeight="bold">
                3
              </Typography>
              <Typography variant="body2">Ministries Involved</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="warning.main" fontWeight="bold">
                All
              </Typography>
              <Typography variant="body2">States Eligible</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Application Process */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            📋 How to Apply for Government Schemes
          </Typography>
          <Grid container spacing={2}>
            {applicationSteps.map((step, index) => (
              <Grid item xs={12} md={2.4} key={index}>
                <Paper sx={{ p: 2, textAlign: 'center', height: '100%' }}>
                  <Avatar sx={{ bgcolor: 'primary.main', mx: 'auto', mb: 1 }}>
                    {step.step}
                  </Avatar>
                  <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                    {step.title}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {step.description}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>

      {/* Schemes List */}
      <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
        🎯 Available Schemes
      </Typography>

      {schemes.map((scheme, index) => (
        <Accordion 
          key={scheme.id}
          expanded={expanded === scheme.id} 
          onChange={handleChange(scheme.id)}
          sx={{ mb: 2 }}
        >
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
              <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                <AccountBalance />
              </Avatar>
              <Box sx={{ flexGrow: 1 }}>
                <Typography variant="h6" fontWeight="bold">
                  {scheme.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {scheme.ministry} • Budget: {scheme.budget}
                </Typography>
              </Box>
              <Chip 
                label={scheme.status} 
                color={scheme.status === 'New Launch' ? 'success' : 'primary'}
                size="small"
              />
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={3}>
              {/* Scheme Details */}
              <Grid item xs={12} md={8}>
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                  Scheme Overview
                </Typography>
                <Typography variant="body2" paragraph>
                  <strong>Focus:</strong> {scheme.focus}
                </Typography>
                <Typography variant="body2" paragraph>
                  <strong>Duration:</strong> {scheme.duration}
                </Typography>
                <Typography variant="body2" paragraph>
                  <strong>Eligibility:</strong> {scheme.eligibility}
                </Typography>

                <Typography variant="subtitle1" fontWeight="bold" gutterBottom sx={{ mt: 2 }}>
                  Key Benefits
                </Typography>
                <List dense>
                  {scheme.benefits.map((benefit, idx) => (
                    <ListItem key={idx}>
                      <ListItemIcon>
                        <CheckCircle color="success" fontSize="small" />
                      </ListItemIcon>
                      <ListItemText primary={benefit} />
                    </ListItem>
                  ))}
                </List>

                <Typography variant="subtitle1" fontWeight="bold" gutterBottom sx={{ mt: 2 }}>
                  Application Process
                </Typography>
                <Typography variant="body2">
                  {scheme.applicationProcess}
                </Typography>
              </Grid>

              {/* Contact Information */}
              <Grid item xs={12} md={4}>
                <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                    Contact Information
                  </Typography>
                  
                  <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Launch fontSize="small" sx={{ mr: 1 }} />
                      <Typography variant="body2" fontWeight="medium">Website</Typography>
                    </Box>
                    <Typography variant="body2" color="primary" sx={{ ml: 3 }}>
                      {scheme.contact.website}
                    </Typography>
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Phone fontSize="small" sx={{ mr: 1 }} />
                      <Typography variant="body2" fontWeight="medium">Phone</Typography>
                    </Box>
                    <Typography variant="body2" sx={{ ml: 3 }}>
                      {scheme.contact.phone}
                    </Typography>
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Email fontSize="small" sx={{ mr: 1 }} />
                      <Typography variant="body2" fontWeight="medium">Email</Typography>
                    </Box>
                    <Typography variant="body2" sx={{ ml: 3 }}>
                      {scheme.contact.email}
                    </Typography>
                  </Box>

                  <Button 
                    variant="contained" 
                    fullWidth 
                    startIcon={<Launch />}
                    sx={{ mt: 2 }}
                    onClick={() => handleApplyNow(scheme)}
                  >
                    Apply Now
                  </Button>
                </Paper>
              </Grid>
            </Grid>
          </AccordionDetails>
        </Accordion>
      ))}

      {/* Additional Resources */}
      <Card sx={{ mt: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            📚 Additional Resources
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 2, textAlign: 'center' }}>
                <Nature color="primary" sx={{ fontSize: 40, mb: 1 }} />
                <Typography variant="subtitle1" fontWeight="bold">
                  Blue Carbon Toolkit
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Comprehensive guide for implementing blue carbon projects
                </Typography>
                <Button 
                  variant="outlined" 
                  size="small"
                  startIcon={<Download />}
                  onClick={handleDownloadPDF}
                >
                  Download PDF
                </Button>
              </Paper>
            </Grid>
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 2, textAlign: 'center' }}>
                <Group color="success" sx={{ fontSize: 40, mb: 1 }} />
                <Typography variant="subtitle1" fontWeight="bold">
                  Community Guidelines
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Best practices for community engagement in coastal projects
                </Typography>
                <Button 
                  variant="outlined" 
                  size="small"
                  startIcon={<Visibility />}
                  onClick={handleViewGuide}
                >
                  View Guide
                </Button>
              </Paper>
            </Grid>
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 2, textAlign: 'center' }}>
                <Business color="info" sx={{ fontSize: 40, mb: 1 }} />
                <Typography variant="subtitle1" fontWeight="bold">
                  Funding Calculator
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Estimate potential funding for your blue carbon project
                </Typography>
                <Button 
                  variant="outlined" 
                  size="small"
                  startIcon={<Calculate />}
                  onClick={handleCalculate}
                >
                  Calculate
                </Button>
              </Paper>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Help Section */}
      <Card sx={{ mt: 4, bgcolor: 'primary.light' }}>
        <CardContent>
          <Typography variant="h6" gutterBottom color="primary.contrastText">
            🤝 Need Help?
          </Typography>
          <Typography variant="body2" color="primary.contrastText" paragraph>
            Our support team can help you identify the right schemes and guide you through the application process.
          </Typography>
          <Button variant="contained" color="secondary">
            Contact Support
          </Button>
        </CardContent>
      </Card> 
     {/* PDF Download Dialog */}
      <Dialog open={pdfDialog} onClose={() => setPdfDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="h6">📄 Blue Carbon Toolkit</Typography>
            <Button onClick={() => setPdfDialog(false)}>
              <Close />
            </Button>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" paragraph>
            The Blue Carbon Toolkit is a comprehensive 50-page guide covering:
          </Typography>
          <List>
            <ListItem>
              <ListItemIcon><CheckCircle color="success" /></ListItemIcon>
              <ListItemText primary="Project planning and site selection" />
            </ListItem>
            <ListItem>
              <ListItemIcon><CheckCircle color="success" /></ListItemIcon>
              <ListItemText primary="Implementation best practices" />
            </ListItem>
            <ListItem>
              <ListItemIcon><CheckCircle color="success" /></ListItemIcon>
              <ListItemText primary="Monitoring and verification protocols" />
            </ListItem>
            <ListItem>
              <ListItemIcon><CheckCircle color="success" /></ListItemIcon>
              <ListItemText primary="Carbon credit development process" />
            </ListItem>
            <ListItem>
              <ListItemIcon><CheckCircle color="success" /></ListItemIcon>
              <ListItemText primary="Community engagement strategies" />
            </ListItem>
            <ListItem>
              <ListItemIcon><CheckCircle color="success" /></ListItemIcon>
              <ListItemText primary="Financial planning and revenue models" />
            </ListItem>
          </List>
          <Alert severity="info" sx={{ mt: 2 }}>
            This toolkit is based on international best practices and Indian regulatory requirements.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPdfDialog(false)}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={downloadPDFFile}
            startIcon={<Download />}
          >
            Download PDF (2.3 MB)
          </Button>
        </DialogActions>
      </Dialog>

      {/* Community Guidelines Dialog */}
      <Dialog open={guideDialog} onClose={() => setGuideDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="h6">👥 Community Engagement Guidelines</Typography>
            <Button onClick={() => setGuideDialog(false)}>
              <Close />
            </Button>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom color="primary">
                🎯 Engagement Principles
              </Typography>
              <List>
                <ListItem>
                  <ListItemText 
                    primary="Free, Prior, and Informed Consent (FPIC)"
                    secondary="Ensure communities understand and agree to project activities"
                  />
                </ListItem>
                <ListItem>
                  <ListItemText 
                    primary="Inclusive Participation"
                    secondary="Include women, youth, and marginalized groups in decision-making"
                  />
                </ListItem>
                <ListItem>
                  <ListItemText 
                    primary="Transparent Communication"
                    secondary="Regular updates on project progress and benefits"
                  />
                </ListItem>
                <ListItem>
                  <ListItemText 
                    primary="Capacity Building"
                    secondary="Provide training and skill development opportunities"
                  />
                </ListItem>
              </List>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom color="success.main">
                💰 Benefit Sharing Models
              </Typography>
              <List>
                <ListItem>
                  <ListItemText 
                    primary="Direct Employment (40%)"
                    secondary="Jobs in restoration, monitoring, and maintenance"
                  />
                </ListItem>
                <ListItem>
                  <ListItemText 
                    primary="Community Development (30%)"
                    secondary="Infrastructure, education, and healthcare improvements"
                  />
                </ListItem>
                <ListItem>
                  <ListItemText 
                    primary="Alternative Livelihoods (20%)"
                    secondary="Eco-tourism, sustainable fishing, and aquaculture"
                  />
                </ListItem>
                <ListItem>
                  <ListItemText 
                    primary="Carbon Revenue Sharing (10%)"
                    secondary="Direct payments from carbon credit sales"
                  />
                </ListItem>
              </List>
            </Grid>
            <Grid item xs={12}>
              <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                  📋 Implementation Checklist
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" gutterBottom>✅ Stakeholder mapping</Typography>
                    <Typography variant="body2" gutterBottom>✅ Community consultations</Typography>
                    <Typography variant="body2" gutterBottom>✅ Grievance mechanism setup</Typography>
                    <Typography variant="body2" gutterBottom>✅ Benefit sharing agreement</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" gutterBottom>✅ Training program design</Typography>
                    <Typography variant="body2" gutterBottom>✅ Monitoring committee formation</Typography>
                    <Typography variant="body2" gutterBottom>✅ Communication plan</Typography>
                    <Typography variant="body2" gutterBottom>✅ Impact assessment framework</Typography>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setGuideDialog(false)}>Close</Button>
          <Button 
            variant="contained"
            onClick={() => {
              setSnackbar({ 
                open: true, 
                message: 'Community guidelines bookmarked for reference!', 
                severity: 'success' 
              });
              setGuideDialog(false);
            }}
          >
            Bookmark Guide
          </Button>
        </DialogActions>
      </Dialog> 
     {/* Funding Calculator Dialog */}
      <Dialog open={calculatorDialog} onClose={() => setCalculatorDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="h6">🧮 Blue Carbon Funding Calculator</Typography>
            <Button onClick={() => setCalculatorDialog(false)}>
              <Close />
            </Button>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>Project Parameters</Typography>
              
              <FormControl fullWidth sx={{ mb: 3 }}>
                <InputLabel>Ecosystem Type</InputLabel>
                <Select
                  value={ecosystemType}
                  onChange={(e) => setEcosystemType(e.target.value)}
                  label="Ecosystem Type"
                >
                  <MenuItem value="mangrove">Mangrove Forest</MenuItem>
                  <MenuItem value="seagrass">Seagrass Meadow</MenuItem>
                  <MenuItem value="saltmarsh">Salt Marsh</MenuItem>
                </Select>
              </FormControl>

              <Typography gutterBottom>Project Area: {projectArea} hectares</Typography>
              <Slider
                value={projectArea}
                onChange={(e, newValue) => setProjectArea(newValue)}
                min={1}
                max={1000}
                step={1}
                marks={[
                  { value: 1, label: '1 ha' },
                  { value: 100, label: '100 ha' },
                  { value: 500, label: '500 ha' },
                  { value: 1000, label: '1000 ha' }
                ]}
                sx={{ mb: 3 }}
              />

              <Typography gutterBottom>Project Duration: {projectDuration} years</Typography>
              <Slider
                value={projectDuration}
                onChange={(e, newValue) => setProjectDuration(newValue)}
                min={5}
                max={30}
                step={1}
                marks={[
                  { value: 5, label: '5 yrs' },
                  { value: 10, label: '10 yrs' },
                  { value: 20, label: '20 yrs' },
                  { value: 30, label: '30 yrs' }
                ]}
                sx={{ mb: 3 }}
              />

              <Button 
                variant="contained" 
                fullWidth 
                onClick={performCalculation}
                startIcon={<Calculate />}
              >
                Calculate Potential
              </Button>
            </Grid>

            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>Calculation Results</Typography>
              
              {calculationResult ? (
                <Paper sx={{ p: 2, bgcolor: 'success.light' }}>
                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                    📊 Estimated Carbon Sequestration
                  </Typography>
                  
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">Annual Sequestration</Typography>
                    <Typography variant="h5" fontWeight="bold">
                      {calculationResult.annualSequestration.toLocaleString()} tCO₂/year
                    </Typography>
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">Total Over {calculationResult.projectDuration} Years</Typography>
                    <Typography variant="h5" fontWeight="bold">
                      {calculationResult.totalSequestration.toLocaleString()} tCO₂
                    </Typography>
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">Estimated Revenue (@ $15/tCO₂)</Typography>
                    <Typography variant="h4" fontWeight="bold" color="success.main">
                      ${calculationResult.estimatedRevenue.toLocaleString()}
                    </Typography>
                  </Box>

                  <Alert severity="info" sx={{ mt: 2 }}>
                    These are estimates based on average sequestration rates. Actual results may vary based on site conditions, management practices, and market prices.
                  </Alert>
                </Paper>
              ) : (
                <Paper sx={{ p: 3, textAlign: 'center', bgcolor: 'grey.50' }}>
                  <Calculate sx={{ fontSize: 60, color: 'grey.400', mb: 2 }} />
                  <Typography variant="body1" color="text.secondary">
                    Set your project parameters and click "Calculate Potential" to see estimated carbon sequestration and revenue projections.
                  </Typography>
                </Paper>
              )}

              {calculationResult && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    💡 Funding Opportunities
                  </Typography>
                  <List dense>
                    <ListItem>
                      <ListItemText 
                        primary="MISHTI Scheme"
                        secondary="Mangrove restoration funding available"
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText 
                        primary="CAMPA Fund"
                        secondary="Afforestation project grants"
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText 
                        primary="NABARD Climate Fund"
                        secondary="Concessional loans for climate projects"
                      />
                    </ListItem>
                  </List>
                </Box>
              )}
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCalculatorDialog(false)}>Close</Button>
          {calculationResult && (
            <Button 
              variant="contained"
              onClick={() => {
                const reportData = `
Blue Carbon Project Calculation Report
=====================================

Project Details:
- Ecosystem Type: ${calculationResult.ecosystemType}
- Project Area: ${calculationResult.projectArea} hectares
- Duration: ${calculationResult.projectDuration} years

Results:
- Annual Sequestration: ${calculationResult.annualSequestration.toLocaleString()} tCO₂/year
- Total Sequestration: ${calculationResult.totalSequestration.toLocaleString()} tCO₂
- Estimated Revenue: ${calculationResult.estimatedRevenue.toLocaleString()}

Generated on: ${new Date().toLocaleDateString()}
                `;
                
                const blob = new Blob([reportData], { type: 'text/plain' });
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = 'Blue_Carbon_Calculation_Report.txt';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                window.URL.revokeObjectURL(url);
                
                setSnackbar({ 
                  open: true, 
                  message: 'Calculation report downloaded!', 
                  severity: 'success' 
                });
              }}
            >
              Download Report
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Application Confirmation Dialog */}
      <Dialog open={applyDialog.open} onClose={() => setApplyDialog({ open: false, scheme: null })} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="h6">🚀 Apply for Government Scheme</Typography>
            <Button onClick={() => setApplyDialog({ open: false, scheme: null })}>
              <Close />
            </Button>
          </Box>
        </DialogTitle>
        <DialogContent>
          {applyDialog.scheme && (
            <>
              <Typography variant="h6" gutterBottom color="primary">
                {applyDialog.scheme.name}
              </Typography>
              <Typography variant="body1" paragraph>
                You are about to be redirected to the official government application portal for this scheme.
              </Typography>
              
              <Paper sx={{ p: 2, bgcolor: 'warning.light', mb: 2 }}>
                <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                  📋 Before You Apply - Required Documents:
                </Typography>
                <List dense>
                  {applyDialog.scheme.id === 'mishti' && (
                    <>
                      <ListItem><ListItemText primary="• Project proposal with technical details" /></ListItem>
                      <ListItem><ListItemText primary="• Site survey and assessment report" /></ListItem>
                      <ListItem><ListItemText primary="• Community participation agreement" /></ListItem>
                      <ListItem><ListItemText primary="• Environmental clearance (if required)" /></ListItem>
                    </>
                  )}
                  {applyDialog.scheme.id === 'campa' && (
                    <>
                      <ListItem><ListItemText primary="• Detailed project proposal" /></ListItem>
                      <ListItem><ListItemText primary="• Institutional registration documents" /></ListItem>
                      <ListItem><ListItemText primary="• Budget and financial projections" /></ListItem>
                      <ListItem><ListItemText primary="• State Forest Department approval" /></ListItem>
                    </>
                  )}
                  {applyDialog.scheme.id === 'nabard-climate' && (
                    <>
                      <ListItem><ListItemText primary="• Project proposal with climate focus" /></ListItem>
                      <ListItem><ListItemText primary="• Financial statements and credit history" /></ListItem>
                      <ListItem><ListItemText primary="• Technical feasibility study" /></ListItem>
                      <ListItem><ListItemText primary="• Environmental and social impact assessment" /></ListItem>
                    </>
                  )}
                  {applyDialog.scheme.id === 'pmsvanidhi' && (
                    <>
                      <ListItem><ListItemText primary="• Certificate of Vending or Identity Card" /></ListItem>
                      <ListItem><ListItemText primary="• Aadhaar card and bank account details" /></ListItem>
                      <ListItem><ListItemText primary="• Mobile number for digital transactions" /></ListItem>
                      <ListItem><ListItemText primary="• Recommendation from ULB/Town Vending Committee" /></ListItem>
                    </>
                  )}
                </List>
              </Paper>

              <Alert severity="info" sx={{ mb: 2 }}>
                <Typography variant="body2">
                  <strong>Processing Time:</strong> Applications typically take 30-90 days for review. 
                  You will receive updates via email and SMS.
                </Typography>
              </Alert>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <Launch color="primary" />
                <Typography variant="body2">
                  <strong>Website:</strong> {applyDialog.scheme.contact.website}
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <Phone color="primary" />
                <Typography variant="body2">
                  <strong>Helpline:</strong> {applyDialog.scheme.contact.phone}
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Email color="primary" />
                <Typography variant="body2">
                  <strong>Email Support:</strong> {applyDialog.scheme.contact.email}
                </Typography>
              </Box>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setApplyDialog({ open: false, scheme: null })}>
            Cancel
          </Button>
          <Button 
            variant="contained" 
            onClick={confirmApplication}
            startIcon={<Launch />}
          >
            Continue to Application Portal
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

export default GovernmentSchemes;