const fs = require('fs').promises;
const path = require('path');

// Ensure data directory exists
const ensureDataDirectory = async () => {
  const dataDir = path.join(__dirname, '../data');
  try {
    await fs.access(dataDir);
  } catch (error) {
    await fs.mkdir(dataDir, { recursive: true });
  }
};

// Complete Indian Blue Carbon Policies Dataset
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
    relatedPolicies: ['IND-BC-002', 'IND-BC-003', 'IND-BC-007'],
    createdAt: '2019-01-18T00:00:00.000Z',
    updatedAt: '2019-01-18T00:00:00.000Z'
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
    relatedPolicies: ['IND-BC-001', 'IND-BC-004', 'IND-BC-008'],
    createdAt: '2008-06-30T00:00:00.000Z',
    updatedAt: '2008-06-30T00:00:00.000Z'
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
    relatedPolicies: ['IND-BC-001', 'IND-BC-005', 'IND-BC-006'],
    createdAt: '2018-03-15T00:00:00.000Z',
    updatedAt: '2018-03-15T00:00:00.000Z'
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
    relatedPolicies: ['IND-BC-002', 'IND-BC-003', 'IND-BC-005'],
    createdAt: '2008-11-01T00:00:00.000Z',
    updatedAt: '2008-11-01T00:00:00.000Z'
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
    relatedPolicies: ['IND-BC-001', 'IND-BC-003', 'IND-BC-007'],
    createdAt: '2010-04-01T00:00:00.000Z',
    updatedAt: '2010-04-01T00:00:00.000Z'
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
    relatedPolicies: ['IND-BC-002', 'IND-BC-003', 'IND-BC-008'],
    createdAt: '2018-03-05T00:00:00.000Z',
    updatedAt: '2018-03-05T00:00:00.000Z'
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
    relatedPolicies: ['IND-BC-001', 'IND-BC-005', 'IND-BC-009'],
    createdAt: '2020-01-15T00:00:00.000Z',
    updatedAt: '2020-01-15T00:00:00.000Z'
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
    relatedPolicies: ['IND-BC-002', 'IND-BC-006', 'IND-BC-010'],
    createdAt: '2022-08-03T00:00:00.000Z',
    updatedAt: '2022-08-03T00:00:00.000Z'
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
    relatedPolicies: ['IND-BC-001', 'IND-BC-004', 'IND-BC-005'],
    createdAt: '2017-05-09T00:00:00.000Z',
    updatedAt: '2017-05-09T00:00:00.000Z'
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
    relatedPolicies: ['IND-BC-001', 'IND-BC-003', 'IND-BC-005'],
    createdAt: '2014-10-07T00:00:00.000Z',
    updatedAt: '2014-10-07T00:00:00.000Z'
  }
];

// Initialize policies data
const initializePolicies = async () => {
  try {
    await ensureDataDirectory();
    const policiesFile = path.join(__dirname, '../data/policies.json');
    
    // Check if file already exists
    try {
      await fs.access(policiesFile);
      console.log('✅ Policies file already exists');
      return;
    } catch (error) {
      // File doesn't exist, create it
    }
    
    await fs.writeFile(policiesFile, JSON.stringify(indianBlueCarbonPolicies, null, 2));
    console.log('✅ Successfully initialized policies data with', indianBlueCarbonPolicies.length, 'policies');
    
    // Log policy summary
    console.log('\n📋 Policy Summary:');
    indianBlueCarbonPolicies.forEach(policy => {
      console.log(`   ${policy.id}: ${policy.name} (${policy.status})`);
    });
    
  } catch (error) {
    console.error('❌ Error initializing policies:', error);
  }
};

// Run if called directly
if (require.main === module) {
  initializePolicies();
}

module.exports = { initializePolicies, indianBlueCarbonPolicies };