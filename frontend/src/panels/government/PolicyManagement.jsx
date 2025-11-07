import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
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
  Alert,
  Snackbar,
  Grid,
} from '@mui/material';
import {
  Policy,
  Add,
  Edit,
  Delete,
  Visibility,
  Save,
  Cancel,
  Download,
  Upload,
  Refresh,
} from '@mui/icons-material';
import { blueCarbon } from '../../theme/colors';

const PolicyManagement = () => {
  const [policies, setPolicies] = useState([]);
  const [addDialog, setAddDialog] = useState(false);
  const [editDialog, setEditDialog] = useState(false);
  const [viewDialog, setViewDialog] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [selectedPolicy, setSelectedPolicy] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [filteredPolicies, setFilteredPolicies] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: 'draft',
    version: '1.0'
  });

  useEffect(() => {
    fetchPolicies();
  }, []);

  useEffect(() => {
    let filtered = policies;
    
    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(policy =>
        policy.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        policy.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        policy.ministry.toLowerCase().includes(searchQuery.toLowerCase()) ||
        policy.type.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(policy => policy.status === statusFilter);
    }
    
    setFilteredPolicies(filtered);
  }, [policies, searchQuery, statusFilter]);

  const fetchPolicies = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/policies');
      const data = await response.json();
      
      if (data.success) {
        setPolicies(data.data);
      } else {
        // Fallback to default policies if API fails
        const indianBlueCarbonPolicies = [
      {
        id: 'IND-BC-001',
        name: 'Coastal Regulation Zone (CRZ) Notification 2019',
        description: 'Comprehensive regulations for coastal zone management and protection of marine ecosystems',
        status: 'active',
        lastUpdated: '2019-01-18',
        version: '2019',
        ministry: 'Ministry of Environment, Forest and Climate Change',
        type: 'Regulation',
        scope: 'National',
        applicableStates: 'All coastal states and UTs',
        content: `The Coastal Regulation Zone (CRZ) Notification 2019 is a comprehensive framework for managing India's coastal areas and protecting marine ecosystems.

Key Provisions:
• CRZ-I: Ecologically Sensitive Areas including mangroves, coral reefs, sand dunes, and biologically active areas
• CRZ-II: Areas that have been developed up to or close to the shoreline
• CRZ-III: Areas that are relatively undisturbed and do not belong to CRZ-I or CRZ-II
• CRZ-IV: Water area from the low tide line to territorial waters

Blue Carbon Relevance:
• Strict protection of mangrove areas under CRZ-I
• Prohibition of activities that may damage marine ecosystems
• Mandatory Environmental Impact Assessment for coastal projects
• Restoration and conservation requirements for degraded coastal areas
• Buffer zones around ecologically sensitive areas

Implementation:
• State Coastal Zone Management Authorities (SCZMA) for implementation
• Clearance requirements for activities in CRZ areas
• Monitoring and compliance mechanisms
• Penalties for violations

Impact on Blue Carbon:
• Protects existing blue carbon ecosystems
• Provides framework for restoration projects
• Ensures sustainable coastal development
• Facilitates carbon sequestration in coastal areas`,
        legalBasis: 'Environment (Protection) Act, 1986',
        enforcementAgency: 'State Coastal Zone Management Authority (SCZMA)',
        penalties: 'Fine up to ₹1 lakh and/or imprisonment up to 5 years',
        relatedPolicies: ['IND-BC-002', 'IND-BC-003', 'IND-BC-007']
      },
      {
        id: 'IND-BC-002',
        name: 'National Action Plan on Climate Change (NAPCC) 2008',
        description: 'India\'s comprehensive strategy to address climate change challenges including coastal ecosystem protection',
        status: 'active',
        lastUpdated: '2008-06-30',
        version: '2008',
        ministry: 'Prime Minister\'s Office',
        type: 'Policy Framework',
        scope: 'National',
        applicableStates: 'All states and UTs',
        content: `The National Action Plan on Climate Change (NAPCC) outlines India's strategy to address climate change while maintaining economic growth.

Eight National Missions:
1. National Solar Mission
2. National Mission for Enhanced Energy Efficiency
3. National Mission on Sustainable Habitat
4. National Water Mission
5. National Mission for Sustaining the Himalayan Ecosystem
6. National Mission for a Green India
7. National Mission for Sustainable Agriculture
8. National Mission on Strategic Knowledge for Climate Change

Blue Carbon Components:
• Green India Mission includes coastal forest restoration
• Sustainable Habitat Mission covers coastal urban planning
• Strategic Knowledge Mission supports blue carbon research
• Water Mission addresses coastal water management

Key Blue Carbon Strategies:
• Afforestation and reforestation in coastal areas
• Mangrove restoration and conservation
• Sustainable coastal aquaculture
• Climate-resilient coastal infrastructure
• Research and development in blue carbon technologies

Implementation Framework:
• State Action Plans on Climate Change (SAPCC)
• Institutional mechanisms at national and state levels
• Monitoring and evaluation systems
• International cooperation and technology transfer

Funding Mechanisms:
• National Clean Energy Fund
• Compensatory Afforestation Fund
• Green Climate Fund access
• International climate finance`,
        legalBasis: 'Cabinet decision and subsequent notifications',
        enforcementAgency: 'Ministry of Environment, Forest and Climate Change',
        penalties: 'Varies by specific mission and implementing agency',
        relatedPolicies: ['IND-BC-001', 'IND-BC-004', 'IND-BC-008']
      },
      {
        id: 'IND-BC-003',
        name: 'Mangrove and Coral Reef Conservation Guidelines 2018',
        description: 'Specific guidelines for conservation and restoration of mangroves and coral reefs',
        status: 'active',
        lastUpdated: '2018-03-15',
        version: '2018',
        ministry: 'Ministry of Environment, Forest and Climate Change',
        type: 'Guidelines',
        scope: 'National',
        applicableStates: 'Coastal states with mangroves and coral reefs',
        content: `Comprehensive guidelines for the conservation and restoration of mangroves and coral reefs in India.

Mangrove Conservation:
• Identification and mapping of mangrove areas
• Protection of existing mangrove forests
• Restoration of degraded mangrove areas
• Community-based mangrove management
• Sustainable use of mangrove resources

Coral Reef Conservation:
• Marine Protected Areas for coral reefs
• Restoration of damaged coral reefs
• Monitoring of coral health
• Control of pollution and sedimentation
• Sustainable tourism practices

Blue Carbon Benefits:
• High carbon sequestration rates in mangroves (3-5 times higher than terrestrial forests)
• Long-term carbon storage in sediments
• Protection against coastal erosion and storm surge
• Biodiversity conservation
• Livelihood support for coastal communities

Implementation Strategies:
• Joint Forest Management Committees
• Community participation in conservation
• Scientific monitoring and research
• Capacity building programs
• Awareness and education campaigns

Restoration Techniques:
• Site selection based on ecological criteria
• Species selection appropriate to local conditions
• Planting techniques and timing
• Post-planting care and monitoring
• Success evaluation criteria

Funding Sources:
• CAMPA funds
• Green India Mission
• International climate finance
• Corporate social responsibility`,
        legalBasis: 'Forest Conservation Act, 1980 and Environment Protection Act, 1986',
        enforcementAgency: 'State Forest Departments and Marine Protected Area authorities',
        penalties: 'As per Forest Conservation Act and Wildlife Protection Act',
        relatedPolicies: ['IND-BC-001', 'IND-BC-005', 'IND-BC-006']
      },
      {
        id: 'IND-BC-004',
        name: 'National Biodiversity Action Plan (NBAP) 2008-2012',
        description: 'Comprehensive plan for biodiversity conservation including marine and coastal ecosystems',
        status: 'active',
        lastUpdated: '2008-11-01',
        version: '2008-2012',
        ministry: 'Ministry of Environment, Forest and Climate Change',
        type: 'Action Plan',
        scope: 'National',
        applicableStates: 'All states and UTs',
        content: `The National Biodiversity Action Plan provides a framework for conserving India's biological diversity including marine and coastal ecosystems.

Marine and Coastal Biodiversity:
• Conservation of marine protected areas
• Restoration of degraded coastal habitats
• Protection of endangered marine species
• Sustainable use of marine resources
• Community-based conservation initiatives

Blue Carbon Ecosystems Coverage:
• Mangrove forests and associated fauna
• Seagrass beds and their ecological functions
• Salt marshes and tidal flats
• Coral reefs and associated ecosystems
• Coastal wetlands and lagoons

Conservation Strategies:
• In-situ conservation through protected areas
• Ex-situ conservation in marine parks
• Habitat restoration and rehabilitation
• Species recovery programs
• Genetic resource conservation

Community Participation:
• Traditional knowledge integration
• Community-based management
• Benefit-sharing mechanisms
• Capacity building programs
• Awareness and education

Research and Monitoring:
• Biodiversity assessments and inventories
• Ecological monitoring programs
• Climate change impact studies
• Conservation effectiveness evaluation
• Technology development and transfer

Implementation Framework:
• National Biodiversity Authority
• State Biodiversity Boards
• Biodiversity Management Committees
• Research institutions and universities
• NGOs and community organizations`,
        legalBasis: 'Biological Diversity Act, 2002',
        enforcementAgency: 'National Biodiversity Authority and State Biodiversity Boards',
        penalties: 'As per Biological Diversity Act, 2002',
        relatedPolicies: ['IND-BC-002', 'IND-BC-003', 'IND-BC-005']
      },
      {
        id: 'IND-BC-005',
        name: 'Integrated Coastal Zone Management (ICZM) Project Guidelines',
        description: 'Guidelines for integrated management of coastal zones including blue carbon considerations',
        status: 'active',
        lastUpdated: '2010-04-01',
        version: '2010',
        ministry: 'Ministry of Environment, Forest and Climate Change',
        type: 'Project Guidelines',
        scope: 'National',
        applicableStates: 'All coastal states',
        content: `The Integrated Coastal Zone Management (ICZM) Project provides a framework for sustainable management of coastal areas.

ICZM Principles:
• Integrated approach to coastal management
• Ecosystem-based management
• Stakeholder participation
• Adaptive management
• Precautionary approach

Blue Carbon Integration:
• Assessment of blue carbon potential
• Protection of existing carbon stocks
• Restoration of degraded blue carbon ecosystems
• Monitoring of carbon sequestration
• Integration with climate change mitigation

Key Components:
• Coastal vulnerability assessment
• Hazard mapping and risk assessment
• Ecosystem service valuation
• Livelihood impact assessment
• Institutional capacity building

Management Strategies:
• Coastal protection and restoration
• Sustainable resource use
• Pollution control and prevention
• Climate change adaptation
• Disaster risk reduction

Implementation Approach:
• Multi-sectoral coordination
• Science-based decision making
• Community participation
• Capacity building
• Monitoring and evaluation

Pilot Projects:
• Gujarat - Coastal protection and mangrove restoration
• Odisha - Integrated coastal management
• West Bengal - Sundarbans management
• Tamil Nadu - Coastal erosion control
• Kerala - Backwater ecosystem management

Expected Outcomes:
• Reduced coastal vulnerability
• Enhanced ecosystem services
• Improved livelihoods
• Increased carbon sequestration
• Better disaster preparedness`,
        legalBasis: 'Environment Protection Act, 1986 and Coastal Regulation Zone notifications',
        enforcementAgency: 'State Coastal Zone Management Authorities',
        penalties: 'As per relevant environmental laws',
        relatedPolicies: ['IND-BC-001', 'IND-BC-003', 'IND-BC-007']
      },
      {
        id: 'IND-BC-006',
        name: 'National Forest Policy 2018 (Draft)',
        description: 'Updated forest policy including provisions for coastal and mangrove forests',
        status: 'draft',
        lastUpdated: '2018-03-05',
        version: 'Draft 2018',
        ministry: 'Ministry of Environment, Forest and Climate Change',
        type: 'Policy',
        scope: 'National',
        applicableStates: 'All states and UTs',
        content: `The Draft National Forest Policy 2018 updates India's forest management approach including coastal and mangrove forests.

Key Objectives:
• Increase forest and tree cover to 33% of geographical area
• Enhance ecosystem services from forests
• Improve forest governance and management
• Strengthen community participation
• Address climate change through forests

Coastal Forest Provisions:
• Special focus on mangrove conservation
• Restoration of degraded coastal forests
• Community-based coastal forest management
• Integration with coastal zone management
• Blue carbon potential recognition

Management Approaches:
• Ecosystem-based forest management
• Landscape-level planning
• Adaptive management practices
• Science-based decision making
• Technology integration

Community Participation:
• Joint Forest Management strengthening
• Community forest rights recognition
• Benefit-sharing mechanisms
• Capacity building programs
• Traditional knowledge integration

Climate Change Integration:
• Forest-based climate mitigation
• Adaptation through forest management
• REDD+ implementation
• Carbon sequestration enhancement
• Resilience building

Blue Carbon Specific Provisions:
• Mangrove restoration targets
• Blue carbon measurement and monitoring
• Integration with NDC commitments
• International cooperation
• Research and development support

Implementation Framework:
• National Forest Commission
• State Forest Development Agencies
• Community Forest Management Committees
• Research and academic institutions
• International partnerships`,
        legalBasis: 'Forest Conservation Act, 1980 and Indian Forest Act, 1927',
        enforcementAgency: 'Forest Departments at Central and State levels',
        penalties: 'As per Forest Conservation Act and Indian Forest Act',
        relatedPolicies: ['IND-BC-002', 'IND-BC-003', 'IND-BC-008']
      },
      {
        id: 'IND-BC-007',
        name: 'Island Development Policy 2020',
        description: 'Comprehensive policy for sustainable development of islands including blue carbon ecosystems',
        status: 'active',
        lastUpdated: '2020-01-15',
        version: '2020',
        ministry: 'Ministry of Home Affairs / NITI Aayog',
        type: 'Development Policy',
        scope: 'Island Territories',
        applicableStates: 'Andaman & Nicobar Islands, Lakshadweep',
        content: `The Island Development Policy 2020 provides a framework for sustainable development of India's island territories.

Policy Objectives:
• Sustainable economic development
• Environmental conservation
• Climate resilience building
• Community welfare improvement
• Strategic security considerations

Blue Carbon Focus Areas:
• Coral reef conservation and restoration
• Mangrove ecosystem protection
• Seagrass bed conservation
• Coastal wetland management
• Marine protected area expansion

Development Strategies:
• Eco-tourism development
• Sustainable fisheries
• Renewable energy promotion
• Waste management systems
• Climate-resilient infrastructure

Environmental Safeguards:
• Environmental Impact Assessment mandatory
• Carrying capacity-based development
• No-development zones identification
• Restoration of degraded areas
• Biodiversity conservation measures

Blue Carbon Opportunities:
• Carbon credit generation from restoration
• Payment for ecosystem services
• Blue carbon research and monitoring
• International climate finance access
• Community-based conservation incentives

Implementation Mechanisms:
• Island Development Authorities
• Multi-stakeholder coordination
• Community participation
• Scientific monitoring
• Adaptive management

Special Provisions:
• Tribal rights protection
• Traditional knowledge integration
• Livelihood diversification
• Capacity building programs
• Technology transfer

Climate Adaptation:
• Sea level rise preparedness
• Coastal protection measures
• Disaster risk reduction
• Early warning systems
• Ecosystem-based adaptation`,
        legalBasis: 'Island Development Authority Acts and environmental regulations',
        enforcementAgency: 'Island Development Authorities and UT administrations',
        penalties: 'As per relevant territorial and environmental laws',
        relatedPolicies: ['IND-BC-001', 'IND-BC-005', 'IND-BC-009']
      },
      {
        id: 'IND-BC-008',
        name: 'India\'s Nationally Determined Contribution (NDC) 2022',
        description: 'Updated climate commitments including blue carbon ecosystem contributions',
        status: 'active',
        lastUpdated: '2022-08-03',
        version: '2022 Update',
        ministry: 'Ministry of Environment, Forest and Climate Change',
        type: 'International Commitment',
        scope: 'National',
        applicableStates: 'All states and UTs',
        content: `India's updated Nationally Determined Contribution (NDC) under the Paris Agreement includes enhanced commitments for climate action.

Key Commitments:
• Reduce emissions intensity of GDP by 45% by 2030 (from 2005 levels)
• Achieve 50% cumulative electric power installed capacity from non-fossil fuel sources by 2030
• Create additional carbon sink of 2.5-3 billion tonnes CO2 equivalent through additional forest and tree cover by 2030
• Net-zero emissions by 2070

Blue Carbon Contributions:
• Mangrove restoration and conservation
• Coastal wetland restoration
• Seagrass bed conservation
• Integrated coastal zone management
• Marine protected area expansion

Forest and Land Use Sector:
• Afforestation and reforestation programs
• Forest degradation reduction
• Sustainable forest management
• Agroforestry promotion
• Coastal forest restoration

Implementation Strategies:
• National and state action plans
• Sectoral mitigation strategies
• Technology development and deployment
• International cooperation
• Climate finance mobilization

Blue Carbon Specific Actions:
• National mangrove restoration mission
• Blue carbon research and monitoring
• Community-based coastal conservation
• Integration with coastal development planning
• International blue carbon partnerships

Monitoring and Reporting:
• National greenhouse gas inventory
• Forest cover monitoring
• Blue carbon stock assessments
• Progress tracking and reporting
• Transparency framework implementation

Co-benefits:
• Biodiversity conservation
• Coastal protection
• Livelihood improvement
• Disaster risk reduction
• Sustainable development`,
        legalBasis: 'Paris Agreement ratification and national climate legislation',
        enforcementAgency: 'Ministry of Environment, Forest and Climate Change',
        penalties: 'International reporting obligations and domestic compliance measures',
        relatedPolicies: ['IND-BC-002', 'IND-BC-006', 'IND-BC-010']
      },
      {
        id: 'IND-BC-009',
        name: 'Marine Fisheries Policy 2017',
        description: 'Comprehensive policy for sustainable marine fisheries including ecosystem-based management',
        status: 'active',
        lastUpdated: '2017-05-09',
        version: '2017',
        ministry: 'Department of Animal Husbandry and Dairying',
        type: 'Sectoral Policy',
        scope: 'National',
        applicableStates: 'All coastal states and UTs',
        content: `The Marine Fisheries Policy 2017 provides a framework for sustainable management of marine fisheries resources.

Policy Objectives:
• Sustainable utilization of marine fisheries resources
• Ecosystem-based fisheries management
• Livelihood security for fishing communities
• Export promotion and value addition
• Conservation of marine biodiversity

Blue Carbon Relevance:
• Protection of fish nursery habitats (mangroves, seagrass beds)
• Ecosystem-based fisheries management
• Marine protected areas for fisheries conservation
• Sustainable aquaculture practices
• Coastal habitat restoration

Key Strategies:
• Stock assessment and management
• Fishing capacity management
• Habitat conservation and restoration
• Community-based fisheries management
• Technology upgradation and modernization

Ecosystem Approach:
• Integration with coastal zone management
• Protection of critical habitats
• Reduction of fishing impacts on ecosystems
• Restoration of degraded marine habitats
• Climate change adaptation

Blue Carbon Integration:
• Recognition of fisheries-ecosystem linkages
• Support for habitat restoration
• Community incentives for conservation
• Integration with blue carbon projects
• Sustainable coastal aquaculture

Implementation Framework:
• National Fisheries Development Board
• State fisheries departments
• Fishermen cooperatives and organizations
• Research institutions
• International cooperation

Conservation Measures:
• Marine protected areas
• Seasonal fishing restrictions
• Gear restrictions and regulations
• Habitat restoration programs
• Community-based conservation

Climate Considerations:
• Climate change impact assessment
• Adaptation strategies for fisheries
• Resilience building measures
• Early warning systems
• Disaster preparedness`,
        legalBasis: 'Marine Fishing Regulation Acts of coastal states',
        enforcementAgency: 'State Fisheries Departments and Coast Guard',
        penalties: 'As per state marine fishing regulation acts',
        relatedPolicies: ['IND-BC-001', 'IND-BC-004', 'IND-BC-005']
      },
      {
        id: 'IND-BC-010',
        name: 'National Mission for Clean Ganga (NMCG) Guidelines',
        description: 'Guidelines for river and coastal ecosystem restoration including delta management',
        status: 'active',
        lastUpdated: '2014-10-07',
        version: '2014',
        ministry: 'Ministry of Jal Shakti',
        type: 'Mission Guidelines',
        scope: 'Ganga Basin and Coastal Deltas',
        applicableStates: 'Ganga basin states and coastal states with major deltas',
        content: `The National Mission for Clean Ganga (NMCG) includes provisions for coastal delta ecosystem management and restoration.

Mission Objectives:
• Pollution abatement in river Ganga
• Conservation and rejuvenation of river Ganga
• Maintaining minimum ecological flows
• Development of river-front infrastructure
• Institutional development for river conservation

Coastal Delta Components:
• Sundarbans delta ecosystem management
• Coastal pollution control
• Mangrove restoration in delta areas
• Sustainable delta development
• Climate resilience building

Blue Carbon Relevance:
• Delta mangrove restoration
• Coastal wetland conservation
• Sediment management for carbon storage
• Community-based delta management
• Integration with coastal zone planning

Key Interventions:
• Sewage treatment infrastructure
• Industrial pollution control
• River surface cleaning
• Biodiversity conservation
• Afforestation in catchment areas

Delta-Specific Actions:
• Mangrove plantation programs
• Coastal erosion control
• Sustainable aquaculture promotion
• Community livelihood programs
• Disaster risk reduction

Implementation Approach:
• Basin-wide integrated planning
• Multi-stakeholder participation
• Technology-based solutions
• Community engagement
• International cooperation

Monitoring and Evaluation:
• Water quality monitoring
• Biodiversity assessments
• Ecosystem health indicators
• Socio-economic impact evaluation
• Progress tracking systems

Blue Carbon Benefits:
• Enhanced carbon sequestration in deltas
• Coastal protection services
• Biodiversity conservation
• Livelihood improvement
• Climate change mitigation`,
        legalBasis: 'National Mission for Clean Ganga Act, 2016',
        enforcementAgency: 'National Mission for Clean Ganga Authority',
        penalties: 'As per Water (Prevention and Control of Pollution) Act and Environment Protection Act',
        relatedPolicies: ['IND-BC-001', 'IND-BC-003', 'IND-BC-005']
      }
    ];
        setPolicies(indianBlueCarbonPolicies);
      }
    } catch (error) {
      console.error('Error fetching policies:', error);
      setSnackbar({ 
        open: true, 
        message: 'Failed to load policies from server', 
        severity: 'error' 
      });
    }
  };

  const handleAddPolicy = () => {
    setFormData({ name: '', description: '', status: 'draft', version: '1.0' });
    setAddDialog(true);
  };

  const handleEditPolicy = (policy) => {
    setSelectedPolicy(policy);
    setFormData({
      name: policy.name,
      description: policy.description,
      status: policy.status,
      version: policy.version
    });
    setEditDialog(true);
  };

  const handleViewPolicy = (policy) => {
    setSelectedPolicy(policy);
    setViewDialog(true);
  };

  const handleDeletePolicy = (policy) => {
    setSelectedPolicy(policy);
    setDeleteDialog(true);
  };

  const handleSavePolicy = async () => {
    try {
      if (selectedPolicy) {
        // Edit existing policy
        const response = await fetch(`http://localhost:8000/api/policies/${selectedPolicy.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        });
        
        const data = await response.json();
        
        if (data.success) {
          setPolicies(prev => prev.map(p => 
            p.id === selectedPolicy.id ? data.data : p
          ));
          setSnackbar({ open: true, message: 'Policy updated successfully!', severity: 'success' });
          setEditDialog(false);
        } else {
          setSnackbar({ open: true, message: data.message || 'Failed to update policy', severity: 'error' });
        }
      } else {
        // Add new policy
        const response = await fetch('http://localhost:8000/api/policies', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        });
        
        const data = await response.json();
        
        if (data.success) {
          setPolicies(prev => [...prev, data.data]);
          setSnackbar({ open: true, message: 'Policy added successfully!', severity: 'success' });
          setAddDialog(false);
        } else {
          setSnackbar({ open: true, message: data.message || 'Failed to add policy', severity: 'error' });
        }
      }
      setSelectedPolicy(null);
    } catch (error) {
      console.error('Error saving policy:', error);
      setSnackbar({ open: true, message: 'Network error occurred', severity: 'error' });
    }
  };

  const handleConfirmDelete = async () => {
    try {
      const response = await fetch(`http://localhost:8000/api/policies/${selectedPolicy.id}`, {
        method: 'DELETE',
      });
      
      const data = await response.json();
      
      if (data.success) {
        setPolicies(prev => prev.filter(p => p.id !== selectedPolicy.id));
        setSnackbar({ open: true, message: 'Policy deleted successfully!', severity: 'success' });
      } else {
        setSnackbar({ open: true, message: data.message || 'Failed to delete policy', severity: 'error' });
      }
    } catch (error) {
      console.error('Error deleting policy:', error);
      setSnackbar({ open: true, message: 'Network error occurred', severity: 'error' });
    }
    
    setDeleteDialog(false);
    setSelectedPolicy(null);
  };

  const handleFormChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleExportPolicies = () => {
    const dataStr = JSON.stringify(policies, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `blue-carbon-policies-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    setSnackbar({ 
      open: true, 
      message: 'Policies exported successfully!', 
      severity: 'success' 
    });
  };

  const handleRefreshPolicies = () => {
    fetchPolicies();
    setSnackbar({ 
      open: true, 
      message: 'Policies refreshed from server!', 
      severity: 'info' 
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return '#4caf50';
      case 'draft': return '#ff9800';
      case 'inactive': return '#f44336';
      default: return '#666';
    }
  };

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Policy 
              sx={{ 
                fontSize: 40, 
                mr: 2, 
                color: blueCarbon.aqua 
              }} 
            />
            <Box>
              <Typography variant="h4" className="gradient-text" gutterBottom>
                Policy Management
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Manage policies and regulations for blue carbon projects
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              startIcon={<Refresh />}
              onClick={handleRefreshPolicies}
              size="small"
            >
              Refresh
            </Button>
            <Button
              variant="outlined"
              startIcon={<Download />}
              onClick={handleExportPolicies}
              size="small"
            >
              Export
            </Button>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={handleAddPolicy}
              sx={{ bgcolor: blueCarbon.oceanBlue }}
            >
              Add Policy
            </Button>
          </Box>
        </Box>
      </Box>

      {/* Search and Filter Section */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                placeholder="Search policies by name, description, ministry, or type..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                variant="outlined"
                size="small"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  }
                }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Filter by Status</InputLabel>
                <Select
                  value={statusFilter}
                  label="Filter by Status"
                  onChange={(e) => setStatusFilter(e.target.value)}
                  sx={{ borderRadius: 2 }}
                >
                  <MenuItem value="all">All Statuses</MenuItem>
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="draft">Draft</MenuItem>
                  <MenuItem value="inactive">Inactive</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <Typography variant="body2" color="text.secondary">
                Showing {filteredPolicies.length} of {policies.length} policies
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell><strong>Policy ID</strong></TableCell>
                  <TableCell><strong>Name</strong></TableCell>
                  <TableCell><strong>Status</strong></TableCell>
                  <TableCell><strong>Version</strong></TableCell>
                  <TableCell><strong>Last Updated</strong></TableCell>
                  <TableCell><strong>Actions</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredPolicies.map((policy) => (
                  <TableRow key={policy.id}>
                    <TableCell>{policy.id}</TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {policy.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {policy.description}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={policy.status.charAt(0).toUpperCase() + policy.status.slice(1)}
                        size="small"
                        sx={{
                          bgcolor: `${getStatusColor(policy.status)}20`,
                          color: getStatusColor(policy.status),
                          fontWeight: 500
                        }}
                      />
                    </TableCell>
                    <TableCell>{policy.version}</TableCell>
                    <TableCell>{policy.lastUpdated}</TableCell>
                    <TableCell>
                      <IconButton 
                        size="small" 
                        sx={{ mr: 1 }}
                        onClick={() => handleViewPolicy(policy)}
                        title="View Policy"
                      >
                        <Visibility />
                      </IconButton>
                      <IconButton 
                        size="small" 
                        sx={{ mr: 1 }}
                        onClick={() => handleEditPolicy(policy)}
                        title="Edit Policy"
                      >
                        <Edit />
                      </IconButton>
                      <IconButton 
                        size="small"
                        onClick={() => handleDeletePolicy(policy)}
                        title="Delete Policy"
                        color="error"
                      >
                        <Delete />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Add Policy Dialog */}
      <Dialog open={addDialog} onClose={() => setAddDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Add New Policy</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Policy Name"
                value={formData.name}
                onChange={(e) => handleFormChange('name', e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                value={formData.description}
                onChange={(e) => handleFormChange('description', e.target.value)}
                multiline
                rows={3}
                required
              />
            </Grid>
            <Grid item xs={6}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={formData.status}
                  label="Status"
                  onChange={(e) => handleFormChange('status', e.target.value)}
                >
                  <MenuItem value="draft">Draft</MenuItem>
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="inactive">Inactive</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Version"
                value={formData.version}
                onChange={(e) => handleFormChange('version', e.target.value)}
                required
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddDialog(false)} startIcon={<Cancel />}>
            Cancel
          </Button>
          <Button 
            onClick={handleSavePolicy} 
            variant="contained"
            startIcon={<Save />}
            disabled={!formData.name || !formData.description}
          >
            Add Policy
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Policy Dialog */}
      <Dialog open={editDialog} onClose={() => setEditDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Edit Policy</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Policy Name"
                value={formData.name}
                onChange={(e) => handleFormChange('name', e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                value={formData.description}
                onChange={(e) => handleFormChange('description', e.target.value)}
                multiline
                rows={3}
                required
              />
            </Grid>
            <Grid item xs={6}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={formData.status}
                  label="Status"
                  onChange={(e) => handleFormChange('status', e.target.value)}
                >
                  <MenuItem value="draft">Draft</MenuItem>
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="inactive">Inactive</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Version"
                value={formData.version}
                onChange={(e) => handleFormChange('version', e.target.value)}
                required
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialog(false)} startIcon={<Cancel />}>
            Cancel
          </Button>
          <Button 
            onClick={handleSavePolicy} 
            variant="contained"
            startIcon={<Save />}
            disabled={!formData.name || !formData.description}
          >
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>

      {/* View Policy Dialog */}
      <Dialog open={viewDialog} onClose={() => setViewDialog(false)} maxWidth="lg" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="h5">📋 Policy Details</Typography>
            <Button onClick={() => setViewDialog(false)} size="small">
              ✕
            </Button>
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedPolicy && (
            <Box sx={{ mt: 2 }}>
              {/* Header Information */}
              <Card sx={{ mb: 3, bgcolor: 'primary.light', color: 'primary.contrastText' }}>
                <CardContent>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={8}>
                      <Typography variant="h6" gutterBottom>
                        {selectedPolicy.name}
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: 0.9 }}>
                        {selectedPolicy.description}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <Box sx={{ textAlign: 'right' }}>
                        <Chip
                          label={selectedPolicy.status.charAt(0).toUpperCase() + selectedPolicy.status.slice(1)}
                          sx={{
                            bgcolor: 'rgba(255,255,255,0.2)',
                            color: 'white',
                            fontWeight: 'bold',
                            mb: 1
                          }}
                        />
                        <Typography variant="body2" sx={{ opacity: 0.9 }}>
                          Version: {selectedPolicy.version}
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>

              {/* Policy Metadata */}
              <Grid container spacing={3} sx={{ mb: 3 }}>
                <Grid item xs={12} md={6}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h6" gutterBottom color="primary">
                        📊 Policy Information
                      </Typography>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        <Typography><strong>Policy ID:</strong> {selectedPolicy.id}</Typography>
                        <Typography><strong>Ministry:</strong> {selectedPolicy.ministry}</Typography>
                        <Typography><strong>Type:</strong> {selectedPolicy.type}</Typography>
                        <Typography><strong>Scope:</strong> {selectedPolicy.scope}</Typography>
                        <Typography><strong>Last Updated:</strong> {selectedPolicy.lastUpdated}</Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h6" gutterBottom color="success.main">
                        🏛️ Implementation Details
                      </Typography>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        <Typography><strong>Applicable States:</strong> {selectedPolicy.applicableStates}</Typography>
                        <Typography><strong>Legal Basis:</strong> {selectedPolicy.legalBasis}</Typography>
                        <Typography><strong>Enforcement Agency:</strong> {selectedPolicy.enforcementAgency}</Typography>
                        <Typography><strong>Penalties:</strong> {selectedPolicy.penalties}</Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>

              {/* Policy Content */}
              <Card variant="outlined" sx={{ mb: 3 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom color="primary">
                    📄 Policy Content & Context
                  </Typography>
                  <Box sx={{ 
                    maxHeight: '400px', 
                    overflow: 'auto', 
                    p: 2, 
                    bgcolor: 'grey.50', 
                    borderRadius: 1,
                    border: '1px solid',
                    borderColor: 'grey.200'
                  }}>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        whiteSpace: 'pre-line',
                        lineHeight: 1.6
                      }}
                    >
                      {selectedPolicy.content || 'No detailed content available.'}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>

              {/* Related Policies */}
              {selectedPolicy.relatedPolicies && selectedPolicy.relatedPolicies.length > 0 && (
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" gutterBottom color="info.main">
                      🔗 Related Policies
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {selectedPolicy.relatedPolicies.map((relatedId) => {
                        const relatedPolicy = policies.find(p => p.id === relatedId);
                        return relatedPolicy ? (
                          <Chip
                            key={relatedId}
                            label={`${relatedId}: ${relatedPolicy.name}`}
                            variant="outlined"
                            size="small"
                            onClick={() => {
                              setSelectedPolicy(relatedPolicy);
                            }}
                            sx={{ cursor: 'pointer' }}
                          />
                        ) : (
                          <Chip
                            key={relatedId}
                            label={relatedId}
                            variant="outlined"
                            size="small"
                          />
                        );
                      })}
                    </Box>
                  </CardContent>
                </Card>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDialog(false)} variant="outlined">
            Close
          </Button>
          <Button 
            onClick={() => {
              setViewDialog(false);
              handleEditPolicy(selectedPolicy);
            }}
            variant="contained"
            startIcon={<Edit />}
          >
            Edit Policy
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialog} onClose={() => setDeleteDialog(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete the policy "{selectedPolicy?.name}"? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog(false)}>Cancel</Button>
          <Button 
            onClick={handleConfirmDelete} 
            color="error" 
            variant="contained"
            startIcon={<Delete />}
          >
            Delete Policy
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

export default PolicyManagement;