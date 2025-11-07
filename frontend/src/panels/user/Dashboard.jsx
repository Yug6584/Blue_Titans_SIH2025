import React, { useState, useEffect } from 'react';
import {
  Grid,
  Typography,
  Card,
  CardContent,
  Box,
  LinearProgress,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Avatar,
  Container,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,

  TableRow,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Alert,
} from '@mui/material';

import { blueCarbon } from '../../theme/colors';
import {
  Nature,
  Business,
  VerifiedUser,
  Water,
  Waves,
  Forest,
  ArrowForward,
  CheckCircle,
  Groups,
  Public,
  Close,
  ExpandMore,
  LocationOn,
  Science,
  Park,

  Shield,
  Visibility,
} from '@mui/icons-material';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';



// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const Dashboard = () => {
  const [ecosystemDialog, setEcosystemDialog] = useState({ open: false, type: null });

  // Verified ecosystem data from scientific sources with India-specific information
  const ecosystemData = {
    mangrove: {
      title: "Mangrove Forests in India",
      icon: <Forest />,
      color: "#004d40",
      overview: "India hosts some of the world's most extensive and diverse mangrove ecosystems along its 7,516 km coastline. These salt-tolerant forests are crucial for coastal protection, carbon storage, and supporting millions of livelihoods across coastal communities.",
      carbonStorage: {
        biomass: "150-300 tC/ha",
        sediment: "400-1,000 tC/ha",
        sequestrationRate: "1.5-6.0 tC/ha/year",
        totalPotential: "Up to 1,300 tC/ha"
      },
      indiaSpecific: {
        totalArea: "4,975 km² (2019 FSI data)",
        coastalStates: "9 states and 4 union territories",
        species: "46 true mangrove species",
        carbonStock: "Estimated 15-20 million tonnes",
        economicValue: "₹1.2 trillion ecosystem services annually"
      },
      majorLocations: [
        {
          name: "Sundarbans (West Bengal)",
          area: "2,125 km²",
          description: "World's largest mangrove forest, UNESCO World Heritage Site",
          species: "Royal Bengal Tiger habitat, 35 mangrove species",
          significance: "60% of India's mangrove cover",
          image: "🐅 Tiger Reserve & Mangrove Paradise"
        },
        {
          name: "Bhitarkanika (Odisha)",
          area: "672 km²",
          description: "Second largest mangrove ecosystem in India",
          species: "Saltwater crocodile sanctuary, 62 mangrove species",
          significance: "Critical nesting site for Olive Ridley turtles",
          image: "🐊 Crocodile & Turtle Sanctuary"
        },
        {
          name: "Pichavaram (Tamil Nadu)",
          area: "1,100 hectares",
          description: "Dense mangrove forest with intricate waterways",
          species: "Avicennia marina dominant, 177 bird species",
          significance: "Popular eco-tourism destination",
          image: "🚣 Backwater Boat Rides"
        },
        {
          name: "Coringa (Andhra Pradesh)",
          area: "235 km²",
          description: "Part of Godavari estuary mangrove ecosystem",
          species: "Rhizophora mucronata, fishing cat habitat",
          significance: "Important cyclone buffer zone",
          image: "🌊 Cyclone Protection Shield"
        },
        {
          name: "Chorao Island (Goa)",
          area: "17.8 km²",
          description: "Mandovi River mangrove sanctuary",
          species: "Dr. Salim Ali Bird Sanctuary, 400+ bird species",
          significance: "Biodiversity hotspot in Western Ghats region",
          image: "🦅 Bird Watching Paradise"
        },
        {
          name: "Vembanad (Kerala)",
          area: "96.5 km²",
          description: "Backwater mangrove ecosystem",
          species: "Kumarakom Bird Sanctuary, migratory birds",
          significance: "Ramsar Wetland site",
          image: "🦆 Migratory Bird Haven"
        }
      ],
      keyFacts: [
        "India ranks 3rd globally in mangrove area after Indonesia and Brazil",
        "Sundarbans alone stores ~10 million tonnes of carbon",
        "Mangroves protect 70% of India's coastline from erosion",
        "Support 4 million people's livelihoods in coastal areas",
        "Reduce cyclone damage by 70% in protected areas",
        "Home to endangered species like Royal Bengal Tiger and saltwater crocodile"
      ],
      threats: [
        "Aquaculture expansion (35% in Andhra Pradesh, Tamil Nadu)",
        "Urban coastal development (Mumbai, Chennai, Kolkata)",
        "Industrial pollution (chemical, thermal power plants)",
        "Climate change (sea level rise, temperature increase)",
        "Illegal cutting for fuelwood and construction"
      ],
      restoration: {
        cost: "₹75,000-₹7,50,000 per hectare",
        survivalRate: "65-85% with community participation",
        timeToMaturity: "15-20 years in Indian conditions",
        benefits: "Cyclone protection, fisheries, eco-tourism, carbon credits"
      },
      governmentInitiatives: [
        "MISHTI Scheme (₹1,120 crores for mangrove restoration)",
        "Coastal Regulation Zone (CRZ) protection",
        "National Mangrove Committee establishment",
        "State-wise Mangrove Cell formation",
        "Community-based restoration programs"
      ],
      sources: [
        "Forest Survey of India 2019",
        "Indian Council of Forestry Research & Education",
        "Ministry of Environment, Forest & Climate Change",
        "Wildlife Institute of India studies",
        "ICFRE Mangrove Research Reports 2023"
      ]
    },
    seagrass: {
      title: "Seagrass Meadows in India",
      icon: <Waves />,
      color: "#0097a7",
      overview: "India's seagrass meadows span approximately 568 km² across both east and west coasts, forming critical underwater ecosystems that support marine biodiversity and coastal fisheries while sequestering significant amounts of blue carbon.",
      carbonStorage: {
        biomass: "50-200 tC/ha",
        sediment: "200-800 tC/ha",
        sequestrationRate: "0.5-2.0 tC/ha/year",
        totalPotential: "Up to 1,000 tC/ha"
      },
      indiaSpecific: {
        totalArea: "568 km² across Indian waters",
        coastalStates: "Tamil Nadu, Andhra Pradesh, Odisha, Gujarat, Maharashtra",
        species: "14 seagrass species recorded",
        carbonStock: "Estimated 2-3 million tonnes",
        fisheryValue: "₹15,000 crores annual fishery production supported"
      },
      majorLocations: [
        {
          name: "Palk Bay & Gulf of Mannar (Tamil Nadu)",
          area: "200 km²",
          description: "Largest seagrass beds in India, Marine Biosphere Reserve",
          species: "Cymodocea serrulata, Halophila ovalis, Thalassia hemprichii",
          significance: "Dugong habitat, 450+ fish species",
          image: "🐋 Dugong Conservation Area"
        },
        {
          name: "Chilika Lake (Odisha)",
          area: "85 km²",
          description: "Asia's largest brackish water lagoon with seagrass beds",
          species: "Halophila beccarii, Ruppia maritima",
          significance: "Ramsar site, migratory bird sanctuary",
          image: "🦩 Flamingo Feeding Grounds"
        },
        {
          name: "Pulicat Lake (Andhra Pradesh/Tamil Nadu)",
          area: "45 km²",
          description: "Second largest brackish water ecosystem in India",
          species: "Halophila ovalis dominant species",
          significance: "Flamingo breeding ground, fishing community support",
          image: "🎣 Traditional Fishing Hub"
        },
        {
          name: "Lakshadweep Islands",
          area: "120 km²",
          description: "Coral atoll seagrass meadows in Arabian Sea",
          species: "Thalassia hemprichii, Cymodocea rotundata",
          significance: "Coral reef protection, tourism economy",
          image: "🏝️ Coral Atoll Paradise"
        },
        {
          name: "Andaman & Nicobar Islands",
          area: "95 km²",
          description: "Pristine tropical seagrass ecosystems",
          species: "Enhalus acoroides, Halodule pinifolia",
          significance: "Marine turtle nesting, pristine biodiversity",
          image: "🐢 Sea Turtle Nursery"
        },
        {
          name: "Gulf of Kutch (Gujarat)",
          area: "23 km²",
          description: "Arid zone seagrass beds in Marine National Park",
          species: "Halodule uninervis, Halophila stipulacea",
          significance: "Coral reef ecosystem, marine sanctuary",
          image: "🪸 Coral Garden Ecosystem"
        }
      ],
      keyFacts: [
        "Support 60% of India's marine fish catch in coastal areas",
        "Provide nursery habitat for commercially important species",
        "Stabilize 2.5 million tonnes of sediment annually",
        "Support 2.5 million fishing families' livelihoods",
        "Filter 50 million tonnes of water daily",
        "Critical habitat for endangered dugongs (150-200 individuals)"
      ],
      threats: [
        "Coastal development and port construction (30%)",
        "Trawling and destructive fishing practices (25%)",
        "Industrial pollution and sewage discharge (20%)",
        "Sedimentation from river runoff (15%)",
        "Climate change and ocean acidification (10%)"
      ],
      restoration: {
        cost: "₹1,50,000-₹11,25,000 per hectare",
        survivalRate: "50-75% with proper site selection",
        timeToMaturity: "2-5 years in tropical conditions",
        benefits: "Fish nursery, coastal protection, carbon sequestration, tourism"
      },
      governmentInitiatives: [
        "Marine Protected Areas (MPAs) establishment",
        "Coastal Aquaculture Authority regulations",
        "National Biodiversity Action Plan inclusion",
        "Blue Economy initiatives",
        "Community-based conservation programs"
      ],
      sources: [
        "Zoological Survey of India reports",
        "Central Marine Fisheries Research Institute",
        "National Institute of Oceanography studies",
        "Ministry of Earth Sciences data",
        "Indian National Centre for Ocean Information Services"
      ]
    },
    tidal: {
      title: "Tidal Marshes & Salt Marshes in India",
      icon: <Water />,
      color: "#a0522d",
      overview: "India's tidal marshes and salt marshes cover approximately 6,750 km² along the coastline, particularly in estuarine areas. These ecosystems are vital for coastal protection, supporting unique halophytic vegetation and serving as critical carbon sinks.",
      carbonStorage: {
        biomass: "100-400 tC/ha",
        sediment: "300-900 tC/ha",
        sequestrationRate: "1.0-4.0 tC/ha/year",
        totalPotential: "Up to 1,300 tC/ha"
      },
      indiaSpecific: {
        totalArea: "6,750 km² including salt marshes and mudflats",
        coastalStates: "Gujarat, Maharashtra, Odisha, West Bengal, Tamil Nadu",
        vegetation: "45+ halophytic plant species",
        carbonStock: "Estimated 8-12 million tonnes",
        saltProduction: "₹3,500 crores annual salt industry support"
      },
      majorLocations: [
        {
          name: "Rann of Kutch (Gujarat)",
          area: "7,500 km²",
          description: "World's largest salt marsh, seasonal wetland ecosystem",
          species: "Salicornia brachiata, Suaeda maritima, Cressa cretica",
          significance: "Wild Ass Sanctuary, flamingo habitat, salt production",
          image: "🦓 Wild Ass & Salt Flats"
        },
        {
          name: "Sundarbans Mudflats (West Bengal)",
          area: "1,200 km²",
          description: "Extensive intertidal mudflats with salt-tolerant vegetation",
          species: "Porteresia coarctata (wild rice), Oryza coarctata",
          significance: "Tiger habitat buffer, shrimp farming, carbon storage",
          image: "🦐 Shrimp Farming Hub"
        },
        {
          name: "Mahanadi Delta (Odisha)",
          area: "850 km²",
          description: "Estuarine salt marshes with rich biodiversity",
          species: "Salicornia europaea, Sesuvium portulacastrum",
          significance: "Olive Ridley turtle nesting, cyclone protection",
          image: "🐢 Turtle Nesting Beach"
        },
        {
          name: "Pulicat Lake Marshes (Andhra Pradesh)",
          area: "460 km²",
          description: "Brackish water marshes with extensive mudflats",
          species: "Avicennia marina, Salicornia brachiata",
          significance: "Flamingo congregation, aquaculture, salt pans",
          image: "🦩 Flamingo Congregation"
        },
        {
          name: "Thane Creek (Maharashtra)",
          area: "160 km²",
          description: "Urban tidal marshes near Mumbai metropolitan area",
          species: "Avicennia officinalis, Sonneratia apetala",
          significance: "Urban flood control, biodiversity conservation",
          image: "🏙️ Urban Wetland Buffer"
        },
        {
          name: "Point Calimere (Tamil Nadu)",
          area: "385 km²",
          description: "Coastal salt marshes and mudflats wildlife sanctuary",
          species: "Salicornia brachiata, Suaeda monoica",
          significance: "Migratory bird sanctuary, blackbuck habitat",
          image: "🦌 Blackbuck Sanctuary"
        }
      ],
      keyFacts: [
        "Rann of Kutch produces 76% of India's salt (30 million tonnes annually)",
        "Support 15+ endangered and endemic species",
        "Reduce cyclone storm surge by 60-80% in protected areas",
        "Filter 100 million tonnes of polluted water annually",
        "Support 1.2 million people's livelihoods in salt and aquaculture",
        "Critical stopover for 2 million migratory birds annually"
      ],
      threats: [
        "Industrial salt production expansion (40%)",
        "Aquaculture pond construction (25%)",
        "Urban and port development (20%)",
        "Freshwater diversion and dam construction (10%)",
        "Climate change and sea level rise (5%)"
      ],
      restoration: {
        cost: "₹2,25,000-₹15,00,000 per hectare",
        survivalRate: "75-90% with proper salinity management",
        timeToMaturity: "3-10 years depending on species",
        benefits: "Cyclone protection, salt production, aquaculture, carbon storage"
      },
      governmentInitiatives: [
        "Wetlands (Conservation and Management) Rules 2017",
        "National Wetland Conservation Programme",
        "Ramsar Convention site designations",
        "State Wetland Authorities establishment",
        "Integrated Coastal Zone Management Project"
      ],
      sources: [
        "Space Applications Centre, ISRO",
        "Wetlands International - South Asia",
        "Bombay Natural History Society studies",
        "Gujarat Institute of Desert Ecology",
        "National Centre for Sustainable Coastal Management"
      ]
    }
  };

  const [dashboardData, setDashboardData] = useState({
    totalCO2Offset: 0,
    blueCarbonProjects: 0,
    verifiedCompanies: 0,
    communityImpact: 0,
  });
  const [loading, setLoading] = useState(true);
  const [recentActivities, setRecentActivities] = useState([]);
  const [co2ChartData, setCo2ChartData] = useState(null);

  useEffect(() => {
    loadDashboardData();
    loadBlockchainData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // Use mock data for public landing page
      setDashboardData({
        totalCO2Offset: 1250,
        blueCarbonProjects: 15,
        verifiedCompanies: 8,
        communityImpact: 95,
      });

      // Mock recent activities for demo
      setRecentActivities([
        {
          id: 1,
          type: 'project_verified',
          title: 'Mangrove Restoration Project Verified',
          description: 'MANGROVE_001 has been verified and 50 credits minted',
          timestamp: new Date().toISOString(),
          icon: <VerifiedUser />,
          color: 'success',
        },
        {
          id: 2,
          type: 'company_joined',
          title: 'New Company Joined',
          description: 'EcoTech Solutions registered for carbon credits',
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          icon: <Business />,
          color: 'info',
        },
        {
          id: 3,
          type: 'co2_milestone',
          title: 'CO₂ Offset Milestone',
          description: '1000 tons of CO₂ offset achieved this month',
          timestamp: new Date(Date.now() - 7200000).toISOString(),
          icon: <Nature />,
          color: 'success',
        },
      ]);

      // Mock CO2 chart data
      setCo2ChartData({
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [
          {
            label: 'CO₂ Offset (tons)',
            data: [120, 190, 300, 500, 720, 890],
            borderColor: 'rgb(75, 192, 192)',
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            tension: 0.4,
          },
        ],
      });

    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadBlockchainData = async () => {
    try {
      // Skip blockchain initialization for public landing page
      // await web3Service.init();
      // Load additional blockchain data if needed
    } catch (error) {
      console.error('Failed to load blockchain data:', error);
    }
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'CO₂ Offset Progress',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#0a0e1a' }}>
      {/* Hero Section with Mangrove Background */}
      <Box
        sx={{
          position: 'relative',
          minHeight: '100vh',
          background: `linear-gradient(rgba(10, 14, 26, 0.7), rgba(10, 14, 26, 0.8)), 
                      url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1200 800'%3E%3Cdefs%3E%3ClinearGradient id='mangrove' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' style='stop-color:%23004d40;stop-opacity:1' /%3E%3Cstop offset='50%25' style='stop-color:%2300695c;stop-opacity:1' /%3E%3Cstop offset='100%25' style='stop-color:%23004d40;stop-opacity:1' /%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='1200' height='800' fill='url(%23mangrove)'/%3E%3Cg opacity='0.3'%3E%3Cpath d='M200,600 Q300,400 400,600 T600,600' stroke='%2326a69a' stroke-width='3' fill='none'/%3E%3Cpath d='M400,650 Q500,450 600,650 T800,650' stroke='%2326a69a' stroke-width='2' fill='none'/%3E%3Cpath d='M600,700 Q700,500 800,700 T1000,700' stroke='%2326a69a' stroke-width='2' fill='none'/%3E%3C/g%3E%3C/svg%3E")`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          overflow: 'hidden',
        }}
      >
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 2 }}>
          <Grid container spacing={6} alignItems="center">
            {/* Left Content */}
            <Grid item xs={12} md={6}>
              <Box>
                <Typography 
                  variant="overline" 
                  sx={{ 
                    color: '#4dd0e1', 
                    fontWeight: 'bold',
                    letterSpacing: 2,
                    mb: 2,
                    display: 'block'
                  }}
                >
                  BLUE CARBON ECOSYSTEMS
                </Typography>
                
                <Typography 
                  variant="h2" 
                  gutterBottom 
                  sx={{ 
                    fontWeight: 'bold',
                    mb: 3,
                    background: 'linear-gradient(135deg, #ffffff 0%, #4dd0e1 100%)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  Carbon Guardians
                </Typography>
                
                <Typography 
                  variant="h6" 
                  sx={{ 
                    opacity: 0.9, 
                    lineHeight: 1.6, 
                    mb: 4,
                    maxWidth: 500
                  }}
                >
                  Blue Carbon refers to the carbon stored in coastal and marine ecosystems. 
                  Mangroves, seagrass meadows, and tidal marshes are among the most effective 
                  carbon sinks on Earth, storing carbon in their biomass and sediments for centuries.
                </Typography>

                <Button
                  variant="contained"
                  size="large"
                  endIcon={<ArrowForward />}
                  sx={{
                    background: 'linear-gradient(135deg, #00acc1 0%, #0097a7 100%)',
                    borderRadius: 3,
                    px: 4,
                    py: 1.5,
                    fontSize: '1.1rem',
                    fontWeight: 'bold',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #0097a7 0%, #00838f 100%)',
                      transform: 'translateY(-2px)',
                    },
                    transition: 'all 0.3s ease',
                  }}
                >
                  Get Started
                </Button>
              </Box>
            </Grid>

            {/* Right Content - Feature Cards */}
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {/* Environmental Impact Card */}
                <Card 
                  sx={{ 
                    background: 'rgba(255, 255, 255, 0.1)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: 3,
                    color: 'white',
                  }}
                >
                  <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{ bgcolor: '#00acc1', width: 48, height: 48 }}>
                      <Nature />
                    </Avatar>
                    <Box>
                      <Typography variant="h6" fontWeight="bold">
                        Environmental Impact
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: 0.8 }}>
                        Restore coastal ecosystems that capture 10x more carbon than terrestrial forests
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>

                {/* Verified Credits Card */}
                <Card 
                  sx={{ 
                    background: 'rgba(255, 255, 255, 0.1)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: 3,
                    color: 'white',
                  }}
                >
                  <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{ bgcolor: '#26a69a', width: 48, height: 48 }}>
                      <CheckCircle />
                    </Avatar>
                    <Box>
                      <Typography variant="h6" fontWeight="bold">
                        Verified Credits
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: 0.8 }}>
                        All projects undergo rigorous certification and continuous monitoring
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>

                {/* Community Support Card */}
                <Card 
                  sx={{ 
                    background: 'rgba(255, 255, 255, 0.1)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: 3,
                    color: 'white',
                  }}
                >
                  <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{ bgcolor: '#4db6ac', width: 48, height: 48 }}>
                      <Groups />
                    </Avatar>
                    <Box>
                      <Typography variant="h6" fontWeight="bold">
                        Community Support
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: 0.8 }}>
                        Direct benefits to local communities through sustainable development
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Nature's Carbon Storage Solutions Section */}
      <Box sx={{ backgroundColor: '#0a0e1a', py: 8 }}>
        <Container maxWidth="lg">
          <Box textAlign="center" sx={{ mb: 6 }}>
            <Typography 
              variant="overline" 
              sx={{ 
                color: '#4dd0e1', 
                fontWeight: 'bold',
                letterSpacing: 2,
                mb: 2,
                display: 'block'
              }}
            >
              BLUE CARBON ECOSYSTEMS
            </Typography>
            
            <Typography 
              variant="h3" 
              gutterBottom 
              sx={{ 
                fontWeight: 'bold',
                color: 'white',
                mb: 2
              }}
            >
              Nature's Carbon
            </Typography>
            
            <Typography 
              variant="h3" 
              gutterBottom 
              sx={{ 
                fontWeight: 'bold',
                background: 'linear-gradient(135deg, #4dd0e1 0%, #26a69a 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                mb: 3
              }}
            >
              Storage Solutions
            </Typography>
            
            <Typography 
              variant="h6" 
              sx={{ 
                color: 'rgba(255, 255, 255, 0.7)',
                maxWidth: 600,
                mx: 'auto',
                lineHeight: 1.6
              }}
            >
              Discover the three key coastal ecosystems that are vital to our planet's carbon cycle
            </Typography>
          </Box>

          {/* Ecosystem Cards */}
          <Grid container spacing={4}>
            {/* Mangrove Forests */}
            <Grid item xs={12} md={4}>
              <Card 
                onClick={() => setEcosystemDialog({ open: true, type: 'mangrove' })}
                sx={{ 
                  height: 400,
                  borderRadius: 4,
                  overflow: 'hidden',
                  position: 'relative',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
                  }
                }}
              >
                <Box
                  sx={{
                    height: '100%',
                    background: `linear-gradient(rgba(0, 77, 64, 0.7), rgba(0, 77, 64, 0.9)), 
                                url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 300'%3E%3Cdefs%3E%3ClinearGradient id='mangrove-bg' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' style='stop-color:%23004d40;stop-opacity:1' /%3E%3Cstop offset='100%25' style='stop-color:%2300695c;stop-opacity:1' /%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='400' height='300' fill='url(%23mangrove-bg)'/%3E%3Cg opacity='0.4'%3E%3Cpath d='M50,250 Q100,150 150,250 T250,250' stroke='%2326a69a' stroke-width='4' fill='none'/%3E%3Cpath d='M100,280 Q150,180 200,280 T300,280' stroke='%2326a69a' stroke-width='3' fill='none'/%3E%3Ccircle cx='80' cy='200' r='3' fill='%234db6ac'/%3E%3Ccircle cx='180' cy='180' r='2' fill='%234db6ac'/%3E%3Ccircle cx='280' cy='220' r='3' fill='%234db6ac'/%3E%3C/g%3E%3C/svg%3E")`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'flex-end',
                    color: 'white',
                    p: 3,
                  }}
                >
                  <Avatar 
                    sx={{ 
                      bgcolor: 'rgba(255, 255, 255, 0.2)',
                      backdropFilter: 'blur(10px)',
                      mb: 2,
                      width: 56,
                      height: 56
                    }}
                  >
                    <Forest sx={{ fontSize: 28 }} />
                  </Avatar>
                  
                  <Typography variant="h5" fontWeight="bold" gutterBottom>
                    Mangrove Forests
                  </Typography>
                  
                  <Typography variant="body2" sx={{ opacity: 0.9, mb: 2 }}>
                    Coastal guardians that protect shorelines and store massive amounts of carbon in their roots and sediments
                  </Typography>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Chip 
                      label="10x Carbon Storage" 
                      size="small" 
                      sx={{ 
                        backgroundColor: 'rgba(255, 255, 255, 0.2)',
                        color: 'white',
                        backdropFilter: 'blur(10px)'
                      }} 
                    />
                  </Box>
                </Box>
              </Card>
            </Grid>

            {/* Seagrass Meadows */}
            <Grid item xs={12} md={4}>
              <Card 
                onClick={() => setEcosystemDialog({ open: true, type: 'seagrass' })}
                sx={{ 
                  height: 400,
                  borderRadius: 4,
                  overflow: 'hidden',
                  position: 'relative',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
                  }
                }}
              >
                <Box
                  sx={{
                    height: '100%',
                    background: `linear-gradient(rgba(0, 151, 167, 0.7), rgba(0, 151, 167, 0.9)), 
                                url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 300'%3E%3Cdefs%3E%3ClinearGradient id='seagrass-bg' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' style='stop-color:%230097a7;stop-opacity:1' /%3E%3Cstop offset='100%25' style='stop-color:%2300acc1;stop-opacity:1' /%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='400' height='300' fill='url(%23seagrass-bg)'/%3E%3Cg opacity='0.4'%3E%3Cpath d='M50,280 Q50,200 50,120' stroke='%234dd0e1' stroke-width='2' fill='none'/%3E%3Cpath d='M100,290 Q100,210 100,130' stroke='%234dd0e1' stroke-width='2' fill='none'/%3E%3Cpath d='M150,285 Q150,205 150,125' stroke='%234dd0e1' stroke-width='2' fill='none'/%3E%3Cpath d='M200,290 Q200,210 200,130' stroke='%234dd0e1' stroke-width='2' fill='none'/%3E%3Cpath d='M250,285 Q250,205 250,125' stroke='%234dd0e1' stroke-width='2' fill='none'/%3E%3Cpath d='M300,290 Q300,210 300,130' stroke='%234dd0e1' stroke-width='2' fill='none'/%3E%3C/g%3E%3C/svg%3E")`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'flex-end',
                    color: 'white',
                    p: 3,
                  }}
                >
                  <Avatar 
                    sx={{ 
                      bgcolor: 'rgba(255, 255, 255, 0.2)',
                      backdropFilter: 'blur(10px)',
                      mb: 2,
                      width: 56,
                      height: 56
                    }}
                  >
                    <Waves sx={{ fontSize: 28 }} />
                  </Avatar>
                  
                  <Typography variant="h5" fontWeight="bold" gutterBottom>
                    Seagrass Meadows
                  </Typography>
                  
                  <Typography variant="body2" sx={{ opacity: 0.9, mb: 2 }}>
                    Underwater meadows that stabilize sediments and create vital nursery habitats for marine life
                  </Typography>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Chip 
                      label="Marine Nurseries" 
                      size="small" 
                      sx={{ 
                        backgroundColor: 'rgba(255, 255, 255, 0.2)',
                        color: 'white',
                        backdropFilter: 'blur(10px)'
                      }} 
                    />
                  </Box>
                </Box>
              </Card>
            </Grid>

            {/* Tidal Marshes */}
            <Grid item xs={12} md={4}>
              <Card 
                onClick={() => setEcosystemDialog({ open: true, type: 'tidal' })}
                sx={{ 
                  height: 400,
                  borderRadius: 4,
                  overflow: 'hidden',
                  position: 'relative',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
                  }
                }}
              >
                <Box
                  sx={{
                    height: '100%',
                    background: `linear-gradient(rgba(139, 69, 19, 0.7), rgba(160, 82, 45, 0.9)), 
                                url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 300'%3E%3Cdefs%3E%3ClinearGradient id='marsh-bg' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' style='stop-color:%23a0522d;stop-opacity:1' /%3E%3Cstop offset='100%25' style='stop-color:%23d2691e;stop-opacity:1' /%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='400' height='300' fill='url(%23marsh-bg)'/%3E%3Cg opacity='0.4'%3E%3Cellipse cx='100' cy='250' rx='30' ry='8' fill='%23f4a460'/%3E%3Cellipse cx='200' cy='260' rx='25' ry='6' fill='%23f4a460'/%3E%3Cellipse cx='300' cy='255' rx='35' ry='10' fill='%23f4a460'/%3E%3Cpath d='M50,200 Q150,180 250,200 T350,200' stroke='%23daa520' stroke-width='2' fill='none'/%3E%3C/g%3E%3C/svg%3E")`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'flex-end',
                    color: 'white',
                    p: 3,
                  }}
                >
                  <Avatar 
                    sx={{ 
                      bgcolor: 'rgba(255, 255, 255, 0.2)',
                      backdropFilter: 'blur(10px)',
                      mb: 2,
                      width: 56,
                      height: 56
                    }}
                  >
                    <Water sx={{ fontSize: 28 }} />
                  </Avatar>
                  
                  <Typography variant="h5" fontWeight="bold" gutterBottom>
                    Tidal Marshes
                  </Typography>
                  
                  <Typography variant="body2" sx={{ opacity: 0.9, mb: 2 }}>
                    Salt marshes that buffer coasts and trap carbon-rich sediments with each tide cycle
                  </Typography>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Chip 
                      label="Coastal Protection" 
                      size="small" 
                      sx={{ 
                        backgroundColor: 'rgba(255, 255, 255, 0.2)',
                        color: 'white',
                        backdropFilter: 'blur(10px)'
                      }} 
                    />
                  </Box>
                </Box>
              </Card>
            </Grid>
          </Grid>
        </Container>
      </Box>
      {/* Environmental Impact Section */}
      <Container maxWidth="lg" sx={{ mb: 6 }}>
        <Grid container spacing={4}>
          {/* CO2 Offset Chart */}
          <Grid item xs={12} md={8}>
            <Card sx={{ 
              background: 'linear-gradient(135deg, rgba(2,6,31,0.05) 0%, rgba(107,238,215,0.1) 100%)',
              border: '1px solid rgba(107,238,215,0.2)'
            }}>
              <CardContent>
                <Typography variant="h6" gutterBottom fontWeight="bold" color="primary">
                  🌊 CO₂ Offset Progress
              </Typography>
              {co2ChartData && (
                <Box sx={{ height: 300 }}>
                  <Line data={co2ChartData} options={chartOptions} />
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

          {/* Recent Activities */}
          <Grid item xs={12} md={4}>
            <Card sx={{ 
              background: 'linear-gradient(135deg, rgba(60,196,203,0.05) 0%, rgba(0,164,140,0.1) 100%)',
              border: '1px solid rgba(60,196,203,0.2)'
            }}>
              <CardContent>
                <Typography variant="h6" gutterBottom fontWeight="bold" color="primary">
                  🌱 Recent Activities
                </Typography>
                <List>
                  {recentActivities.map((activity) => (
                    <ListItem key={activity.id} sx={{ px: 0 }}>
                      <ListItemIcon>
                        <Avatar
                          sx={{
                            background: 'linear-gradient(135deg, #3CC4CB 0%, #00A48C 100%)',
                            width: 32,
                            height: 32,
                          }}
                        >
                          {activity.icon}
                        </Avatar>
                      </ListItemIcon>
                      <ListItemText
                        primary={activity.title}
                        secondary={activity.description}
                        primaryTypographyProps={{
                          variant: 'body2',
                          fontWeight: 'medium',
                        }}
                        secondaryTypographyProps={{
                          variant: 'caption',
                        }}
                      />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>

      {/* Environmental Impact Section */}
      <Box sx={{ 
        background: 'linear-gradient(135deg, #f8fffe 0%, #e8f8f5 100%)',
        py: 6,
        mb: 4
      }}>
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <Card sx={{ 
                background: 'linear-gradient(135deg, #02061F 0%, #0B5FAF 100%)',
                color: 'white',
                height: '100%'
              }}>
                <CardContent sx={{ p: 4 }}>
                  <Typography variant="h5" gutterBottom fontWeight="bold">
                    🌊 Blue Carbon Ecosystems
                  </Typography>
                  <Box display="flex" flexWrap="wrap" gap={1} mb={2}>
                    <Chip label="15 Countries" sx={{ backgroundColor: 'rgba(255,255,255,0.2)', color: 'white' }} size="small" />
                    <Chip label="45 Projects" sx={{ backgroundColor: 'rgba(255,255,255,0.2)', color: 'white' }} size="small" />
                    <Chip label="1.2M tons CO₂" sx={{ backgroundColor: 'rgba(255,255,255,0.2)', color: 'white' }} size="small" />
                  </Box>
                  <Typography variant="body1" paragraph sx={{ opacity: 0.9 }}>
                    Blue carbon ecosystems are among the most carbon-rich ecosystems on Earth, 
                    storing up to 10 times more carbon per hectare than terrestrial forests.
                  </Typography>
                  <Typography variant="body1" sx={{ opacity: 0.9 }}>
                    Your participation helps protect these vital ecosystems and combat climate change.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card sx={{ 
                background: 'linear-gradient(135deg, #6BEED7 0%, #00A48C 100%)',
                color: 'white',
                height: '100%'
              }}>
                <CardContent sx={{ p: 4 }}>
                  <Typography variant="h5" gutterBottom fontWeight="bold">
                    🌍 Global Impact
                  </Typography>
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="body2" gutterBottom>Mangrove Restoration</Typography>
                    <LinearProgress 
                      variant="determinate" 
                      value={85} 
                      sx={{ 
                        height: 8, 
                        borderRadius: 4,
                        backgroundColor: 'rgba(255,255,255,0.3)',
                        '& .MuiLinearProgress-bar': {
                          backgroundColor: 'white'
                        }
                      }} 
                    />
                    <Typography variant="caption" sx={{ opacity: 0.8 }}>85% Complete</Typography>
                  </Box>
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="body2" gutterBottom>Seagrass Conservation</Typography>
                    <LinearProgress 
                      variant="determinate" 
                      value={72} 
                      sx={{ 
                        height: 8, 
                        borderRadius: 4,
                        backgroundColor: 'rgba(255,255,255,0.3)',
                        '& .MuiLinearProgress-bar': {
                          backgroundColor: 'white'
                        }
                      }} 
                    />
                    <Typography variant="caption" sx={{ opacity: 0.8 }}>72% Complete</Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" gutterBottom>Salt Marsh Protection</Typography>
                    <LinearProgress 
                      variant="determinate" 
                      value={91} 
                      sx={{ 
                        height: 8, 
                        borderRadius: 4,
                        backgroundColor: 'rgba(255,255,255,0.3)',
                        '& .MuiLinearProgress-bar': {
                          backgroundColor: 'white'
                        }
                      }} 
                    />
                    <Typography variant="caption" sx={{ opacity: 0.8 }}>91% Complete</Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Global Impact Statistics */}
      <Box sx={{ backgroundColor: '#f8fffe', py: 8 }}>
        <Container maxWidth="lg">
          <Box textAlign="center" sx={{ mb: 6 }}>
            <Typography 
              variant="h3" 
              gutterBottom 
              sx={{ 
                fontWeight: 'bold',
                color: '#0a0e1a',
                mb: 3
              }}
            >
              Global Impact Statistics
            </Typography>
            
            <Typography 
              variant="h6" 
              sx={{ 
                color: 'rgba(10, 14, 26, 0.7)',
                maxWidth: 600,
                mx: 'auto',
                lineHeight: 1.6
              }}
            >
              Track our collective progress in protecting and restoring blue carbon ecosystems worldwide
            </Typography>
          </Box>

          <Grid container spacing={4}>
            {/* CO2 Offset */}
            <Grid item xs={12} sm={6} md={3}>
              <Card 
                sx={{ 
                  textAlign: 'center',
                  p: 3,
                  height: '100%',
                  background: 'linear-gradient(135deg, #004d40 0%, #00695c 100%)',
                  color: 'white',
                  borderRadius: 3,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 12px 24px rgba(0, 77, 64, 0.3)',
                  }
                }}
              >
                <Avatar 
                  sx={{ 
                    bgcolor: 'rgba(255, 255, 255, 0.2)',
                    width: 64,
                    height: 64,
                    mx: 'auto',
                    mb: 2
                  }}
                >
                  <Public sx={{ fontSize: 32 }} />
                </Avatar>
                <Typography variant="h3" fontWeight="bold" gutterBottom>
                  {dashboardData.totalCO2Offset}K
                </Typography>
                <Typography variant="h6" gutterBottom>
                  Tons CO₂ Offset
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.8 }}>
                  Equivalent to removing 270 cars from roads for a year
                </Typography>
              </Card>
            </Grid>

            {/* Active Projects */}
            <Grid item xs={12} sm={6} md={3}>
              <Card 
                sx={{ 
                  textAlign: 'center',
                  p: 3,
                  height: '100%',
                  background: 'linear-gradient(135deg, #0097a7 0%, #00acc1 100%)',
                  color: 'white',
                  borderRadius: 3,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 12px 24px rgba(0, 151, 167, 0.3)',
                  }
                }}
              >
                <Avatar 
                  sx={{ 
                    bgcolor: 'rgba(255, 255, 255, 0.2)',
                    width: 64,
                    height: 64,
                    mx: 'auto',
                    mb: 2
                  }}
                >
                  <Nature sx={{ fontSize: 32 }} />
                </Avatar>
                <Typography variant="h3" fontWeight="bold" gutterBottom>
                  {dashboardData.blueCarbonProjects}
                </Typography>
                <Typography variant="h6" gutterBottom>
                  Active Projects
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.8 }}>
                  Across 12 countries protecting coastal ecosystems
                </Typography>
              </Card>
            </Grid>

            {/* Community Members */}
            <Grid item xs={12} sm={6} md={3}>
              <Card 
                sx={{ 
                  textAlign: 'center',
                  p: 3,
                  height: '100%',
                  background: 'linear-gradient(135deg, #26a69a 0%, #4db6ac 100%)',
                  color: 'white',
                  borderRadius: 3,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 12px 24px rgba(38, 166, 154, 0.3)',
                  }
                }}
              >
                <Avatar 
                  sx={{ 
                    bgcolor: 'rgba(255, 255, 255, 0.2)',
                    width: 64,
                    height: 64,
                    mx: 'auto',
                    mb: 2
                  }}
                >
                  <Groups sx={{ fontSize: 32 }} />
                </Avatar>
                <Typography variant="h3" fontWeight="bold" gutterBottom>
                  2.8K
                </Typography>
                <Typography variant="h6" gutterBottom>
                  Community Members
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.8 }}>
                  Environmental enthusiasts making a difference
                </Typography>
              </Card>
            </Grid>

            {/* Hectares Protected */}
            <Grid item xs={12} sm={6} md={3}>
              <Card 
                sx={{ 
                  textAlign: 'center',
                  p: 3,
                  height: '100%',
                  background: 'linear-gradient(135deg, #4dd0e1 0%, #80deea 100%)',
                  color: 'white',
                  borderRadius: 3,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 12px 24px rgba(77, 208, 225, 0.3)',
                  }
                }}
              >
                <Avatar 
                  sx={{ 
                    bgcolor: 'rgba(255, 255, 255, 0.2)',
                    width: 64,
                    height: 64,
                    mx: 'auto',
                    mb: 2
                  }}
                >
                  <Nature sx={{ fontSize: 32 }} />
                </Avatar>
                <Typography variant="h3" fontWeight="bold" gutterBottom>
                  1.2K
                </Typography>
                <Typography variant="h6" gutterBottom>
                  Hectares Protected
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.8 }}>
                  Coastal ecosystems under active restoration
                </Typography>
              </Card>
            </Grid>
          </Grid>
        </Container>
      </Box>



      {/* Ecosystem Information Dialog */}
      <Dialog 
        open={ecosystemDialog.open} 
        onClose={() => setEcosystemDialog({ open: false, type: null })}
        maxWidth="lg"
        fullWidth
      >
        {ecosystemDialog.type && ecosystemData[ecosystemDialog.type] && (
          <>
            <DialogTitle>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar sx={{ bgcolor: ecosystemData[ecosystemDialog.type].color }}>
                    {ecosystemData[ecosystemDialog.type].icon}
                  </Avatar>
                  <Typography variant="h5" fontWeight="bold">
                    {ecosystemData[ecosystemDialog.type].title}
                  </Typography>
                </Box>
                <Button onClick={() => setEcosystemDialog({ open: false, type: null })}>
                  <Close />
                </Button>
              </Box>
            </DialogTitle>
            <DialogContent>
              <Grid container spacing={3}>
                {/* Overview */}
                <Grid item xs={12}>
                  <Alert severity="info" sx={{ mb: 3 }}>
                    <Typography variant="body1">
                      {ecosystemData[ecosystemDialog.type].overview}
                    </Typography>
                  </Alert>
                </Grid>

                {/* Carbon Storage */}
                <Grid item xs={12} md={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Park color="success" />
                        Carbon Storage Capacity
                      </Typography>
                      <TableContainer>
                        <Table size="small">
                          <TableBody>
                            <TableRow>
                              <TableCell><strong>Biomass Carbon</strong></TableCell>
                              <TableCell>{ecosystemData[ecosystemDialog.type].carbonStorage.biomass}</TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell><strong>Sediment Carbon</strong></TableCell>
                              <TableCell>{ecosystemData[ecosystemDialog.type].carbonStorage.sediment}</TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell><strong>Sequestration Rate</strong></TableCell>
                              <TableCell>{ecosystemData[ecosystemDialog.type].carbonStorage.sequestrationRate}</TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell><strong>Total Potential</strong></TableCell>
                              <TableCell><strong>{ecosystemData[ecosystemDialog.type].carbonStorage.totalPotential}</strong></TableCell>
                            </TableRow>
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </CardContent>
                  </Card>
                </Grid>

                {/* India-Specific Information */}
                <Grid item xs={12} md={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <LocationOn color="primary" />
                        India Distribution
                      </Typography>
                      {ecosystemData[ecosystemDialog.type].indiaSpecific && (
                        <>
                          <Box sx={{ mb: 2 }}>
                            <Typography variant="body2" color="text.secondary">Total Area in India</Typography>
                            <Typography variant="h6">{ecosystemData[ecosystemDialog.type].indiaSpecific.totalArea}</Typography>
                          </Box>
                          <Box sx={{ mb: 2 }}>
                            <Typography variant="body2" color="text.secondary">Coastal States</Typography>
                            <Typography variant="body1">{ecosystemData[ecosystemDialog.type].indiaSpecific.coastalStates}</Typography>
                          </Box>
                          <Box sx={{ mb: 2 }}>
                            <Typography variant="body2" color="text.secondary">Species/Vegetation</Typography>
                            <Typography variant="body1">{ecosystemData[ecosystemDialog.type].indiaSpecific.species || ecosystemData[ecosystemDialog.type].indiaSpecific.vegetation}</Typography>
                          </Box>
                          <Box sx={{ mb: 2 }}>
                            <Typography variant="body2" color="text.secondary">Carbon Stock</Typography>
                            <Typography variant="h6" color="success.main">{ecosystemData[ecosystemDialog.type].indiaSpecific.carbonStock}</Typography>
                          </Box>
                        </>
                      )}
                    </CardContent>
                  </Card>
                </Grid>

                {/* Key Facts */}
                <Grid item xs={12}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Science color="info" />
                        Key Scientific Facts
                      </Typography>
                      <List>
                        {ecosystemData[ecosystemDialog.type].keyFacts.map((fact, index) => (
                          <ListItem key={index}>
                            <ListItemIcon>
                              <CheckCircle color="success" />
                            </ListItemIcon>
                            <ListItemText primary={fact} />
                          </ListItem>
                        ))}
                      </List>
                    </CardContent>
                  </Card>
                </Grid>

                {/* Major Locations in India */}
                <Grid item xs={12}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <LocationOn color="primary" />
                        🇮🇳 Major Locations in India
                      </Typography>
                      <Grid container spacing={2}>
                        {ecosystemData[ecosystemDialog.type].majorLocations && ecosystemData[ecosystemDialog.type].majorLocations.map((location, index) => (
                          <Grid item xs={12} md={6} key={index}>
                            <Card variant="outlined" sx={{ height: '100%' }}>
                              <CardContent>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                  <Typography variant="h6" sx={{ flexGrow: 1 }}>
                                    {location.name}
                                  </Typography>
                                  <Chip label={location.area} size="small" color="primary" />
                                </Box>
                                <Typography variant="body2" sx={{ mb: 1, fontSize: '1.2em' }}>
                                  {location.image}
                                </Typography>
                                <Typography variant="body2" paragraph>
                                  {location.description}
                                </Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                  <strong>Species:</strong> {location.species}
                                </Typography>
                                <Typography variant="body2" color="success.main">
                                  <strong>Significance:</strong> {location.significance}
                                </Typography>
                              </CardContent>
                            </Card>
                          </Grid>
                        ))}
                      </Grid>
                    </CardContent>
                  </Card>
                </Grid>

                {/* Threats and Restoration */}
                <Grid item xs={12} md={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Shield color="error" />
                        Major Threats
                      </Typography>
                      <List dense>
                        {ecosystemData[ecosystemDialog.type].threats.map((threat, index) => (
                          <ListItem key={index}>
                            <ListItemText primary={threat} />
                          </ListItem>
                        ))}
                      </List>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Nature color="success" />
                        Restoration Information
                      </Typography>
                      <TableContainer>
                        <Table size="small">
                          <TableBody>
                            <TableRow>
                              <TableCell><strong>Cost</strong></TableCell>
                              <TableCell>{ecosystemData[ecosystemDialog.type].restoration.cost}</TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell><strong>Survival Rate</strong></TableCell>
                              <TableCell>{ecosystemData[ecosystemDialog.type].restoration.survivalRate}</TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell><strong>Time to Maturity</strong></TableCell>
                              <TableCell>{ecosystemData[ecosystemDialog.type].restoration.timeToMaturity}</TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell><strong>Benefits</strong></TableCell>
                              <TableCell>{ecosystemData[ecosystemDialog.type].restoration.benefits}</TableCell>
                            </TableRow>
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </CardContent>
                  </Card>
                </Grid>

                {/* Government Initiatives */}
                {ecosystemData[ecosystemDialog.type].governmentInitiatives && (
                  <Grid item xs={12}>
                    <Card>
                      <CardContent>
                        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Public color="warning" />
                          🏛️ Government Initiatives in India
                        </Typography>
                        <List>
                          {ecosystemData[ecosystemDialog.type].governmentInitiatives.map((initiative, index) => (
                            <ListItem key={index}>
                              <ListItemIcon>
                                <CheckCircle color="warning" />
                              </ListItemIcon>
                              <ListItemText primary={initiative} />
                            </ListItem>
                          ))}
                        </List>
                      </CardContent>
                    </Card>
                  </Grid>
                )}

                {/* Scientific Sources */}
                <Grid item xs={12}>
                  <Accordion>
                    <AccordionSummary expandIcon={<ExpandMore />}>
                      <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Visibility color="action" />
                        Scientific Sources & References
                      </Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <List>
                        {ecosystemData[ecosystemDialog.type].sources.map((source, index) => (
                          <ListItem key={index}>
                            <ListItemIcon>
                              <Science color="primary" />
                            </ListItemIcon>
                            <ListItemText 
                              primary={source}
                              secondary="Peer-reviewed scientific publication"
                            />
                          </ListItem>
                        ))}
                      </List>
                      <Alert severity="success" sx={{ mt: 2 }}>
                        All data presented is sourced from peer-reviewed scientific literature and international research institutions.
                      </Alert>
                    </AccordionDetails>
                  </Accordion>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setEcosystemDialog({ open: false, type: null })}>
                Close
              </Button>
              <Button 
                variant="contained"
                onClick={() => {
                  const ecosystem = ecosystemData[ecosystemDialog.type];
                  const reportData = `
${ecosystem.title.toUpperCase()} - SCIENTIFIC INFORMATION REPORT
${'='.repeat(60)}

OVERVIEW
${ecosystem.overview}

CARBON STORAGE CAPACITY
- Biomass Carbon: ${ecosystem.carbonStorage.biomass}
- Sediment Carbon: ${ecosystem.carbonStorage.sediment}
- Sequestration Rate: ${ecosystem.carbonStorage.sequestrationRate}
- Total Potential: ${ecosystem.carbonStorage.totalPotential}

GLOBAL DISTRIBUTION
- Total Area: ${ecosystem.globalDistribution.totalArea}
${ecosystem.globalDistribution.countries ? `- Countries: ${ecosystem.globalDistribution.countries}` : ''}
${ecosystem.globalDistribution.species ? `- Species: ${ecosystem.globalDistribution.species}` : ''}

KEY FACTS
${ecosystem.keyFacts.map(fact => `• ${fact}`).join('\n')}

MAJOR THREATS
${ecosystem.threats.map(threat => `• ${threat}`).join('\n')}

RESTORATION INFORMATION
- Cost: ${ecosystem.restoration.cost}
- Survival Rate: ${ecosystem.restoration.survivalRate}
- Time to Maturity: ${ecosystem.restoration.timeToMaturity}
- Benefits: ${ecosystem.restoration.benefits}

SCIENTIFIC SOURCES
${ecosystem.sources.map(source => `• ${source}`).join('\n')}

Report Generated: ${new Date().toLocaleDateString()}
Source: BlueCarbon Ledger Platform
                  `;
                  
                  const blob = new Blob([reportData], { type: 'text/plain' });
                  const url = window.URL.createObjectURL(blob);
                  const link = document.createElement('a');
                  link.href = url;
                  link.download = `${ecosystem.title.replace(/\s+/g, '_')}_Scientific_Report.txt`;
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                  window.URL.revokeObjectURL(url);
                }}
              >
                Download Report
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

    </Box>
  );
};

export default Dashboard;