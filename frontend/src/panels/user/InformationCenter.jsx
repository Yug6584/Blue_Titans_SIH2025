import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  Tabs,
  Tab,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Button,
  Paper,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
} from '@mui/material';
import EcosystemImage from '../../components/EcosystemImage';
import {
  Nature,
  Waves,
  Forest,
  Business,
  Timeline,
  Event,
  Info,
  TrendingUp,
  Public,
  Verified,
  Article,
  Link as LinkIcon,
  Close,
  Assessment,
  LocationOn,
  CheckCircle,
} from '@mui/icons-material';

const InformationCenter = () => {
  const [tabValue, setTabValue] = useState(0);
  const [transparencyDialog, setTransparencyDialog] = useState({ open: false, company: null });

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleViewTransparency = (company) => {
    setTransparencyDialog({ open: true, company: company });
  };

  // Real Blue Carbon Data
  const blueCarbon = {
    basics: {
      carbonStorage: "Blue carbon ecosystems store up to 10 times more carbon per hectare than terrestrial forests",
      globalCoverage: "Blue carbon ecosystems cover less than 2% of ocean area but store 50% of carbon in marine sediments",
      indiaCoastline: "India has 7,516 km of coastline with significant blue carbon potential",
      mangroveArea: "India has approximately 4,975 km² of mangrove forests (2019 data)",
      seagrassArea: "India's seagrass beds cover approximately 568 km² across coastal states"
    },
    projects: {
      global: 156,
      india: 23,
      totalCredits: "2.4 million tCO2e",
      activeCompanies: 47
    },
    milestones: [
      { year: 2021, event: "India joins Blue Carbon Partnership", status: "completed" },
      { year: 2022, event: "National Blue Carbon Assessment launched", status: "completed" },
      { year: 2023, event: "First blue carbon credits issued in Sundarbans", status: "completed" },
      { year: 2024, event: "Target: 50 blue carbon projects", status: "in-progress" },
      { year: 2025, event: "Goal: 1 million tCO2e credits", status: "planned" }
    ]
  };

  const news = [
    {
      title: "India's Blue Carbon Potential Assessed at 8.5 Million Tonnes CO2",
      date: "2024-01-15",
      source: "Ministry of Environment, Forest and Climate Change",
      type: "policy"
    },
    {
      title: "Sundarbans Mangrove Project Issues First Blue Carbon Credits",
      date: "2024-01-10",
      source: "Verra Registry",
      type: "project"
    },
    {
      title: "Global Blue Carbon Market Reaches $1.2 Billion",
      date: "2024-01-05",
      source: "Blue Carbon Initiative",
      type: "market"
    }
  ];

  const events = [
    {
      title: "Blue Carbon Workshop - Chennai",
      date: "2024-02-15",
      type: "workshop",
      participants: 150
    },
    {
      title: "Mangrove Restoration Volunteer Drive",
      date: "2024-02-20",
      type: "volunteer",
      location: "Sundarbans, West Bengal"
    },
    {
      title: "World Wetlands Day",
      date: "2024-02-02",
      type: "awareness",
      theme: "Wetlands and Human Wellbeing"
    }
  ];

  const TabPanel = ({ children, value, index }) => (
    <div hidden={value !== index}>
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );

  const companies = [
    {
      name: "Tata Power",
      projects: 3,
      credits: 45000,
      focus: "Mangrove restoration in Gujarat",
      verified: true,
      transparency: {
        overview: {
          established: "2006",
          headquarters: "Mumbai, India",
          carbonNeutralTarget: "2045",
          totalInvestment: "₹850 crores"
        },
        projects: [
          {
            name: "Sundarbans Mangrove Restoration",
            location: "Gujarat Coast",
            area: "1,200 hectares",
            status: "Active",
            creditsGenerated: 18000,
            communityBeneficiaries: 450
          }
        ],
        impact: {
          carbonSequestered: "45,000 tCO₂",
          areaRestored: "2,500 hectares",
          jobsCreated: 1200,
          communitiesSupported: 15
        },
        certifications: [
          "Verra VCS Verified",
          "Gold Standard Certified",
          "UN Global Compact Signatory"
        ]
      }
    },
    {
      name: "Adani Green Energy",
      projects: 2,
      credits: 32000,
      focus: "Seagrass conservation in Tamil Nadu",
      verified: true,
      transparency: {
        overview: {
          established: "2015",
          headquarters: "Ahmedabad, India",
          carbonNeutralTarget: "2030",
          totalInvestment: "₹620 crores"
        },
        projects: [
          {
            name: "Palk Bay Seagrass Conservation",
            location: "Tamil Nadu Coast",
            area: "900 hectares",
            status: "Active",
            creditsGenerated: 20000,
            communityBeneficiaries: 380
          }
        ],
        impact: {
          carbonSequestered: "32,000 tCO₂",
          areaRestored: "1,550 hectares",
          jobsCreated: 850,
          communitiesSupported: 12
        },
        certifications: [
          "Verra VCS Verified",
          "Plan Vivo Certified",
          "ISO 14001 Environmental Management"
        ]
      }
    },
    {
      name: "Mahindra Group",
      projects: 4,
      credits: 58000,
      focus: "Coastal wetland protection",
      verified: true,
      transparency: {
        overview: {
          established: "1945",
          headquarters: "Mumbai, India",
          carbonNeutralTarget: "2040",
          totalInvestment: "₹950 crores"
        },
        projects: [
          {
            name: "Konkan Coast Restoration",
            location: "Maharashtra Coast",
            area: "1,500 hectares",
            status: "Active",
            creditsGenerated: 22000,
            communityBeneficiaries: 520
          }
        ],
        impact: {
          carbonSequestered: "58,000 tCO₂",
          areaRestored: "4,200 hectares",
          jobsCreated: 1850,
          communitiesSupported: 22
        },
        certifications: [
          "Verra VCS Verified",
          "Gold Standard Certified",
          "Climate Action 100+ Member"
        ]
      }
    },
    {
      name: "ITC Limited",
      projects: 2,
      credits: 28000,
      focus: "Mangrove afforestation in Odisha",
      verified: true,
      transparency: {
        overview: {
          established: "1910",
          headquarters: "Kolkata, India",
          carbonNeutralTarget: "2030",
          totalInvestment: "₹480 crores"
        },
        projects: [
          {
            name: "Chilika Lake Restoration",
            location: "Odisha Coast",
            area: "1,100 hectares",
            status: "Active",
            creditsGenerated: 18000,
            communityBeneficiaries: 450
          }
        ],
        impact: {
          carbonSequestered: "28,000 tCO₂",
          areaRestored: "1,700 hectares",
          jobsCreated: 950,
          communitiesSupported: 18
        },
        certifications: [
          "Verra VCS Verified",
          "FSC Forest Stewardship Council",
          "UN Global Compact Signatory"
        ]
      }
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
          🌊 Blue Carbon Information Center
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 800, mx: 'auto' }}>
          Discover the power of coastal ecosystems in fighting climate change. Learn how blue carbon 
          projects protect our planet and create sustainable opportunities for communities.
        </Typography>
      </Box>

      {/* Navigation Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label="Blue Carbon Basics" icon={<Info />} />
          <Tab label="How It Works" icon={<Timeline />} />
          <Tab label="Company Participation" icon={<Business />} />
          <Tab label="News & Events" icon={<Event />} />
        </Tabs>
      </Paper>

      {/* Tab 1: Blue Carbon Basics */}
      <TabPanel value={tabValue} index={0}>
        <Grid container spacing={3}>
          {/* What is Blue Carbon */}
          <Grid item xs={12}>
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Nature color="primary" />
                  What is Blue Carbon?
                </Typography>
                <Typography variant="body1" paragraph>
                  Blue carbon refers to the carbon captured and stored by coastal and marine ecosystems, 
                  particularly mangrove forests, seagrass beds, and salt marshes. These ecosystems are 
                  among the most effective carbon sinks on Earth.
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                  <Chip label="10x more carbon storage than forests" color="primary" variant="outlined" />
                  <Chip label="Stores carbon for centuries" color="secondary" variant="outlined" />
                  <Chip label="Protects coastlines" color="success" variant="outlined" />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Key Statistics */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  🌍 Global Impact
                </Typography>
                <List dense>
                  <ListItem>
                    <ListItemText 
                      primary="Carbon Storage Capacity"
                      secondary={blueCarbon.basics.carbonStorage}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary="Ocean Coverage"
                      secondary={blueCarbon.basics.globalCoverage}
                    />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  🇮🇳 India's Blue Carbon
                </Typography>
                <List dense>
                  <ListItem>
                    <ListItemText 
                      primary="Coastline Length"
                      secondary={blueCarbon.basics.indiaCoastline}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary="Mangrove Area"
                      secondary={blueCarbon.basics.mangroveArea}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary="Seagrass Coverage"
                      secondary={blueCarbon.basics.seagrassArea}
                    />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Grid>

          {/* Ecosystem Types */}
          <Grid item xs={12}>
            <Typography variant="h5" gutterBottom sx={{ mt: 2, mb: 2 }} className="gradient-text">
              Blue Carbon Ecosystems
            </Typography>
            <Alert severity="info" sx={{ mb: 3 }}>
              <Typography variant="body2">
                <strong>Visual Guide:</strong> Below are artistic representations of the three main blue carbon ecosystems. 
                Each ecosystem has unique characteristics that make them incredibly effective at capturing and storing carbon from the atmosphere.
              </Typography>
            </Alert>
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <Card sx={{ height: '100%' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Avatar sx={{ bgcolor: '#4caf50', mr: 2 }}>
                        <Forest />
                      </Avatar>
                      <Typography variant="h6">Mangrove Forests</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                      <Box className="floating">
                        <EcosystemImage type="mangrove" width={200} height={120} />
                      </Box>
                    </Box>
                    <Typography variant="body2" paragraph>
                      Tropical coastal forests that thrive in saltwater. These unique trees have specialized root systems and store carbon in both biomass and deep sediments.
                    </Typography>
                    <Typography variant="body2" sx={{ fontStyle: 'italic', mb: 1 }}>
                      Key Features: Salt-tolerant trees, aerial roots, tidal zones
                    </Typography>
                    <Chip label="55% of blue carbon storage" size="small" color="success" />
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={4}>
                <Card sx={{ height: '100%' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Avatar sx={{ bgcolor: '#2196f3', mr: 2 }}>
                        <Waves />
                      </Avatar>
                      <Typography variant="h6">Seagrass Meadows</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                      <Box className="floating" style={{ animationDelay: '1s' }}>
                        <EcosystemImage type="seagrass" width={200} height={120} />
                      </Box>
                    </Box>
                    <Typography variant="body2" paragraph>
                      Underwater flowering plants that form vast meadows in shallow coastal waters. Highly efficient at carbon sequestration and oxygen production.
                    </Typography>
                    <Typography variant="body2" sx={{ fontStyle: 'italic', mb: 1 }}>
                      Key Features: Underwater grasslands, flowering plants, shallow waters
                    </Typography>
                    <Chip label="35% of blue carbon storage" size="small" color="primary" />
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={4}>
                <Card sx={{ height: '100%' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Avatar sx={{ bgcolor: '#ff9800', mr: 2 }}>
                        <Nature />
                      </Avatar>
                      <Typography variant="h6">Salt Marshes</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                      <Box className="floating" style={{ animationDelay: '2s' }}>
                        <EcosystemImage type="saltmarsh" width={200} height={120} />
                      </Box>
                    </Box>
                    <Typography variant="body2" paragraph>
                      Coastal wetlands regularly flooded by tides. These grassy areas are crucial for coastal protection and long-term carbon storage in sediments.
                    </Typography>
                    <Typography variant="body2" sx={{ fontStyle: 'italic', mb: 1 }}>
                      Key Features: Tidal wetlands, salt-tolerant grasses, mudflats
                    </Typography>
                    <Chip label="10% of blue carbon storage" size="small" color="warning" />
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
            
            <Box sx={{ mt: 3, p: 2, bgcolor: 'rgba(33, 150, 243, 0.05)', borderRadius: 2 }}>
              <Typography variant="body2" sx={{ textAlign: 'center', fontStyle: 'italic', color: 'text.secondary' }}>
                💡 <strong>Tip:</strong> Hover over the ecosystem images above to learn more about each type. 
                These visual representations show the key characteristics that make each ecosystem unique in carbon storage.
              </Typography>
            </Box>
          </Grid>

          {/* India's Milestones */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  🎯 India's Blue Carbon Milestones
                </Typography>
                <Box sx={{ mt: 2 }}>
                  {blueCarbon.milestones.map((milestone, index) => (
                    <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Chip 
                        label={milestone.year}
                        color={milestone.status === 'completed' ? 'success' : milestone.status === 'in-progress' ? 'warning' : 'default'}
                        sx={{ mr: 2, minWidth: 60 }}
                      />
                      <Typography variant="body2" sx={{ flexGrow: 1 }}>
                        {milestone.event}
                      </Typography>
                      {milestone.status === 'completed' && <Verified color="success" />}
                    </Box>
                  ))}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      {/* Tab 2: How It Works */}
      <TabPanel value={tabValue} index={1}>
        <Grid container spacing={3}>
          {/* Project Lifecycle */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h5" gutterBottom>
                  🔄 Blue Carbon Project Lifecycle
                </Typography>
                <Box sx={{ mt: 3 }}>
                  {[
                    { step: 1, title: "Site Assessment", description: "Identify and evaluate potential blue carbon sites", icon: <Public /> },
                    { step: 2, title: "Project Design", description: "Develop restoration or conservation plans", icon: <Timeline /> },
                    { step: 3, title: "Implementation", description: "Execute restoration activities with local communities", icon: <Nature /> },
                    { step: 4, title: "Monitoring", description: "Track carbon sequestration and ecosystem health", icon: <TrendingUp /> },
                    { step: 5, title: "Verification", description: "Third-party validation of carbon credits", icon: <Verified /> },
                    { step: 6, title: "Credit Issuance", description: "Carbon credits issued and available for trading", icon: <Business /> }
                  ].map((phase, index) => (
                    <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 3, p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
                      <Avatar sx={{ bgcolor: 'primary.main', mr: 3 }}>
                        {phase.step}
                      </Avatar>
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="h6" gutterBottom>
                          {phase.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {phase.description}
                        </Typography>
                      </Box>
                      <Box sx={{ ml: 2 }}>
                        {phase.icon}
                      </Box>
                    </Box>
                  ))}
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* How Communities Benefit */}
          <Grid item xs={12} md={6}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  👥 Community Benefits
                </Typography>
                <List>
                  <ListItem>
                    <ListItemIcon><TrendingUp color="success" /></ListItemIcon>
                    <ListItemText 
                      primary="Economic Opportunities"
                      secondary="Jobs in restoration, monitoring, and eco-tourism"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon><Nature color="primary" /></ListItemIcon>
                    <ListItemText 
                      primary="Ecosystem Services"
                      secondary="Coastal protection, fisheries enhancement, water quality"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon><Public color="info" /></ListItemIcon>
                    <ListItemText 
                      primary="Climate Resilience"
                      secondary="Protection from storms, sea-level rise, and erosion"
                    />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Grid>

          {/* Carbon Credit Calculation */}
          <Grid item xs={12} md={6}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  📊 Carbon Credit Calculation
                </Typography>
                <Typography variant="body2" paragraph>
                  Blue carbon credits are calculated based on:
                </Typography>
                <List dense>
                  <ListItem>
                    <ListItemText 
                      primary="Biomass Carbon"
                      secondary="Above and below-ground plant material"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary="Sediment Carbon"
                      secondary="Long-term carbon storage in soils"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary="Avoided Emissions"
                      secondary="Prevented degradation and CO2 release"
                    />
                  </ListItem>
                </List>
                <Box sx={{ mt: 2, p: 2, bgcolor: 'primary.light', borderRadius: 1 }}>
                  <Typography variant="body2" color="primary.contrastText">
                    <strong>1 Credit = 1 tonne CO2 equivalent</strong>
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      {/* Tab 3: Company Participation */}
      <TabPanel value={tabValue} index={2}>
        <Grid container spacing={3}>
          {/* Overview Stats */}
          <Grid item xs={12}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={3}>
                <Card>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" color="primary" fontWeight="bold">
                      {blueCarbon.projects.activeCompanies}
                    </Typography>
                    <Typography variant="body2">Active Companies</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={3}>
                <Card>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" color="success.main" fontWeight="bold">
                      {blueCarbon.projects.india}
                    </Typography>
                    <Typography variant="body2">Projects in India</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={3}>
                <Card>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" color="info.main" fontWeight="bold">
                      {blueCarbon.projects.totalCredits}
                    </Typography>
                    <Typography variant="body2">Total Credits</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={3}>
                <Card>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" color="warning.main" fontWeight="bold">
                      {blueCarbon.projects.global}
                    </Typography>
                    <Typography variant="body2">Global Projects</Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Grid>

          {/* Company Profiles */}
          <Grid item xs={12}>
            <Typography variant="h5" gutterBottom>
              🏢 Leading Companies in Blue Carbon
            </Typography>
            <Grid container spacing={2}>
              {companies.map((company, index) => (
                <Grid item xs={12} md={6} key={index}>
                  <Card>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                          <Business />
                        </Avatar>
                        <Box sx={{ flexGrow: 1 }}>
                          <Typography variant="h6">{company.name}</Typography>
                          {company.verified && (
                            <Chip label="Verified" size="small" color="success" icon={<Verified />} />
                          )}
                        </Box>
                      </Box>
                      <Typography variant="body2" color="text.secondary" paragraph>
                        {company.focus}
                      </Typography>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                        <Box>
                          <Typography variant="body2" color="text.secondary">Projects</Typography>
                          <Typography variant="h6">{company.projects}</Typography>
                        </Box>
                        <Box>
                          <Typography variant="body2" color="text.secondary">Credits</Typography>
                          <Typography variant="h6">{company.credits.toLocaleString()}</Typography>
                        </Box>
                      </Box>
                      <Button 
                        variant="outlined" 
                        size="small" 
                        startIcon={<LinkIcon />}
                        sx={{ mt: 2 }}
                        fullWidth
                        onClick={() => handleViewTransparency(company)}
                      >
                        View Transparency Report
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Grid>
        </Grid>
      </TabPanel>

      {/* Tab 4: News & Events */}
      <TabPanel value={tabValue} index={3}>
        <Grid container spacing={3}>
          {/* Latest News */}
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  📰 Latest Blue Carbon News
                </Typography>
                {news.map((item, index) => (
                  <Box key={index}>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                      <Avatar sx={{ bgcolor: item.type === 'policy' ? 'warning.main' : item.type === 'project' ? 'success.main' : 'info.main', mr: 2, mt: 0.5 }}>
                        <Article />
                      </Avatar>
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="subtitle1" fontWeight="medium">
                          {item.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {item.source} • {new Date(item.date).toLocaleDateString()}
                        </Typography>
                        <Chip 
                          label={item.type} 
                          size="small" 
                          sx={{ mt: 1 }}
                          color={item.type === 'policy' ? 'warning' : item.type === 'project' ? 'success' : 'info'}
                        />
                      </Box>
                    </Box>
                    {index < news.length - 1 && <Divider sx={{ my: 2 }} />}
                  </Box>
                ))}
              </CardContent>
            </Card>
          </Grid>

          {/* Upcoming Events */}
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  📅 Upcoming Events
                </Typography>
                {events.map((event, index) => (
                  <Box key={index} sx={{ mb: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                    <Typography variant="subtitle2" fontWeight="medium">
                      {event.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {new Date(event.date).toLocaleDateString()}
                    </Typography>
                    {event.location && (
                      <Typography variant="caption" display="block">
                        📍 {event.location}
                      </Typography>
                    )}
                    <Chip 
                      label={event.type} 
                      size="small" 
                      sx={{ mt: 1 }}
                      color={event.type === 'workshop' ? 'primary' : event.type === 'volunteer' ? 'success' : 'info'}
                    />
                  </Box>
                ))}
                <Button variant="outlined" fullWidth sx={{ mt: 2 }}>
                  View All Events
                </Button>
              </CardContent>
            </Card>
          </Grid>

          {/* Environmental Calendar */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  🌍 Environmental Calendar 2024
                </Typography>
                <Grid container spacing={2}>
                  {[
                    { date: "Feb 2", event: "World Wetlands Day", theme: "Wetlands and Human Wellbeing" },
                    { date: "Mar 21", event: "International Day of Forests", theme: "Forests and Innovation" },
                    { date: "Apr 22", event: "Earth Day", theme: "Planet vs. Plastics" },
                    { date: "May 22", event: "International Day for Biological Diversity", theme: "Be part of the Plan" },
                    { date: "Jun 5", event: "World Environment Day", theme: "Land Restoration" },
                    { date: "Jun 8", event: "World Oceans Day", theme: "Awaken New Depths" }
                  ].map((day, index) => (
                    <Grid item xs={12} sm={6} md={4} key={index}>
                      <Paper sx={{ p: 2, textAlign: 'center' }}>
                        <Typography variant="h6" color="primary">
                          {day.date}
                        </Typography>
                        <Typography variant="subtitle2" fontWeight="medium">
                          {day.event}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {day.theme}
                        </Typography>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      {/* Transparency Dialog */}
      <Dialog 
        open={transparencyDialog.open} 
        onClose={() => setTransparencyDialog({ open: false, company: null })} 
        maxWidth="lg" 
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="h5" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Assessment color="primary" />
              {transparencyDialog.company?.name} - Transparency Report
            </Typography>
            <Button onClick={() => setTransparencyDialog({ open: false, company: null })}>
              <Close />
            </Button>
          </Box>
        </DialogTitle>
        <DialogContent>
          {transparencyDialog.company && (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom color="primary">
                      🏢 Company Overview
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={6} md={3}>
                        <Typography variant="body2" color="text.secondary">Established</Typography>
                        <Typography variant="h6">{transparencyDialog.company.transparency.overview.established}</Typography>
                      </Grid>
                      <Grid item xs={6} md={3}>
                        <Typography variant="body2" color="text.secondary">Headquarters</Typography>
                        <Typography variant="h6">{transparencyDialog.company.transparency.overview.headquarters}</Typography>
                      </Grid>
                      <Grid item xs={6} md={3}>
                        <Typography variant="body2" color="text.secondary">Carbon Target</Typography>
                        <Typography variant="h6">{transparencyDialog.company.transparency.overview.carbonNeutralTarget}</Typography>
                      </Grid>
                      <Grid item xs={6} md={3}>
                        <Typography variant="body2" color="text.secondary">Investment</Typography>
                        <Typography variant="h6" color="success.main">{transparencyDialog.company.transparency.overview.totalInvestment}</Typography>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom color="primary">
                      🚀 Active Projects
                    </Typography>
                    <TableContainer component={Paper} variant="outlined">
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell><strong>Project Name</strong></TableCell>
                            <TableCell><strong>Location</strong></TableCell>
                            <TableCell><strong>Area</strong></TableCell>
                            <TableCell><strong>Status</strong></TableCell>
                            <TableCell><strong>Credits</strong></TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {transparencyDialog.company.transparency.projects.map((project, index) => (
                            <TableRow key={index}>
                              <TableCell>{project.name}</TableCell>
                              <TableCell>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                  <LocationOn fontSize="small" color="action" />
                                  {project.location}
                                </Box>
                              </TableCell>
                              <TableCell>{project.area}</TableCell>
                              <TableCell>
                                <Chip label={project.status} color="success" size="small" />
                              </TableCell>
                              <TableCell>{project.creditsGenerated.toLocaleString()} tCO₂</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom color="success.main">
                      🌍 Environmental Impact
                    </Typography>
                    <List>
                      <ListItem>
                        <ListItemIcon><Nature color="success" /></ListItemIcon>
                        <ListItemText 
                          primary="Carbon Sequestered"
                          secondary={transparencyDialog.company.transparency.impact.carbonSequestered}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon><Public color="info" /></ListItemIcon>
                        <ListItemText 
                          primary="Area Restored"
                          secondary={transparencyDialog.company.transparency.impact.areaRestored}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon><Business color="warning" /></ListItemIcon>
                        <ListItemText 
                          primary="Jobs Created"
                          secondary={`${transparencyDialog.company.transparency.impact.jobsCreated.toLocaleString()} jobs`}
                        />
                      </ListItem>
                    </List>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom color="success.main">
                      🏆 Certifications
                    </Typography>
                    {transparencyDialog.company.transparency.certifications.map((cert, index) => (
                      <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <CheckCircle color="success" fontSize="small" />
                        <Typography variant="body2">{cert}</Typography>
                      </Box>
                    ))}
                    <Alert severity="success" sx={{ mt: 2 }}>
                      All projects are third-party verified and meet international standards.
                    </Alert>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTransparencyDialog({ open: false, company: null })}>
            Close
          </Button>
          <Button 
            variant="contained"
            startIcon={<Article />}
            onClick={() => {
              const company = transparencyDialog.company;
              const reportData = `TRANSPARENCY REPORT - ${company.name.toUpperCase()}

COMPANY OVERVIEW
- Established: ${company.transparency.overview.established}
- Headquarters: ${company.transparency.overview.headquarters}
- Carbon Neutral Target: ${company.transparency.overview.carbonNeutralTarget}
- Total Investment: ${company.transparency.overview.totalInvestment}

ENVIRONMENTAL IMPACT
- Carbon Sequestered: ${company.transparency.impact.carbonSequestered}
- Area Restored: ${company.transparency.impact.areaRestored}
- Jobs Created: ${company.transparency.impact.jobsCreated.toLocaleString()}
- Communities Supported: ${company.transparency.impact.communitiesSupported}

CERTIFICATIONS
${company.transparency.certifications.map(cert => `- ${cert}`).join('\n')}

Report Generated: ${new Date().toLocaleDateString()}
Source: GreenTrace Platform`;
              
              const blob = new Blob([reportData], { type: 'text/plain' });
              const url = window.URL.createObjectURL(blob);
              const link = document.createElement('a');
              link.href = url;
              link.download = `${company.name.replace(/\s+/g, '_')}_Transparency_Report.txt`;
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
              window.URL.revokeObjectURL(url);
            }}
          >
            Download Report
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default InformationCenter;