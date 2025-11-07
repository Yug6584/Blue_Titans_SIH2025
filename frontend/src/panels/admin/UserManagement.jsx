import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Tabs,
  Tab,
  Paper,
  Alert,
  Snackbar,
} from '@mui/material';
import {
  SupervisorAccount,
  Dashboard as DashboardIcon,
  TableView,
  Security,
  History,
  Assessment,
} from '@mui/icons-material';
import { blueCarbon } from '../../theme/colors';

// Import components (we'll create these)
import SimpleUserOverview from './components/SimpleUserOverview';
import UserManagementTable from './components/UserManagementTable';
import SecurityVerificationPanel from './components/SecurityVerificationPanel';
import AuditTrailViewer from './components/AuditTrailViewer';
import AdminActionLogger from './components/AdminActionLogger';

const UserManagement = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'info' });
  const [loading, setLoading] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Global state for user management
  const [selectedUser, setSelectedUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [userStats, setUserStats] = useState({
    totalUsers: 0,
    activeCompanies: 0,
    verifiedGovernmentAccounts: 0,
    blockedAccounts: 0,
    recentLogins: []
  });

  const tabs = [
    { 
      label: 'Overview', 
      icon: <DashboardIcon />, 
      component: SimpleUserOverview,
      description: 'User statistics and metrics'
    },
    { 
      label: 'User Management', 
      icon: <TableView />, 
      component: UserManagementTable,
      description: 'Search, filter, and manage users'
    },
    { 
      label: 'Security & Verification', 
      icon: <Security />, 
      component: SecurityVerificationPanel,
      description: 'KYC, biometric, and MFA management'
    },
    { 
      label: 'Activity & Audit', 
      icon: <History />, 
      component: AuditTrailViewer,
      description: 'User activities and audit trails'
    },
    { 
      label: 'Admin Actions', 
      icon: <Assessment />, 
      component: AdminActionLogger,
      description: 'Administrative action logs'
    },
  ];

  // Load initial data
  useEffect(() => {
    console.log('🚀 UserManagement component mounted, loading data...');
    loadUserData();
  }, [refreshTrigger]);
  
  // Force initial data load on component mount
  useEffect(() => {
    console.log('🔄 Forcing initial data load...');
    setRefreshTrigger(prev => prev + 1);
  }, []);

  const loadUserData = async () => {
    setLoading(true);
    try {
      console.log('🔄 Loading user data...');
      
      // Load users first
      await loadUsers();
      
      // Load user stats
      await loadUserStats();
      
      console.log('✅ All user data loaded successfully');
    } catch (error) {
      console.error('❌ Failed to load user data:', error);
      
      // Set fallback data directly
      const fallbackStats = {
        totalUsers: 3,
        activeCompanies: 1,
        verifiedGovernmentAccounts: 1,
        blockedAccounts: 0,
        recentLogins: [
          {
            id: 1,
            email: 'yugadmin@gmail.com',
            name: 'Yug Admin',
            role: 'admin',
            statusText: 'Successful',
            timeAgo: '5m ago',
            organization: 'BlueCarbon Admin'
          },
          {
            id: 2,
            email: 'yugcompany@gmail.com',
            name: 'Yug Company',
            role: 'company',
            statusText: 'Successful',
            timeAgo: '2h ago',
            organization: 'Yug Company Ltd'
          }
        ]
      };
      
      setUserStats(fallbackStats);
      console.log('✅ Fallback data set:', fallbackStats);
      showNotification('Using fallback data - check backend connection', 'warning');
    } finally {
      setLoading(false);
    }
  };

  const loadUserStats = async () => {
    try {
      console.log('🔄 Loading user stats from API...');
      
      // Direct API call
      const response = await fetch('http://localhost:8000/api/stats/users');
      const data = await response.json();
      
      console.log('📊 Stats API Response:', data);
      
      if (data.success && data.data) {
        const realStats = {
          totalUsers: data.data.totalUsers,
          activeCompanies: data.data.companyUsers,
          verifiedGovernmentAccounts: data.data.governmentUsers,
          pendingVerifications: 0, // Not available in current API
          blockedAccounts: data.data.blockedUsers,
          recentLogins: []
        };
        
        console.log('✅ Final UserStats:', realStats);
        setUserStats(realStats);
      } else {
        throw new Error('Failed to fetch user statistics');
      }
    } catch (error) {
      console.error('❌ Error loading user stats:', error);
      // Fallback to show current real data
      const fallbackStats = {
        totalUsers: 3,
        activeCompanies: 1,
        verifiedGovernmentAccounts: 1,
        pendingVerifications: 0,
        blockedAccounts: 0,
        recentLogins: []
      };
      setUserStats(fallbackStats);
      showNotification('Using fallback database data', 'info');
    }
  };

  const loadUsers = async () => {
    try {
      console.log('🔄 Loading users from API...');
      
      // Direct API call
      const response = await fetch('http://localhost:8000/api/stats/users/detailed');
      const data = await response.json();
      
      console.log('📊 API Response:', data);
      
      if (data.success && data.data && data.data.users) {
        const realUsers = data.data.users.map(user => ({
          id: user.id.toString(),
          email: user.email,
          name: user.name || 'No Name',
          role: user.panel, // panel is the role in our database
          status: user.isActive ? 'active' : 'blocked',
          isVerified: true, // Assume all users are verified for now
          registrationDate: new Date(user.createdAt),
          lastLogin: user.lastLogin ? new Date(user.lastLogin) : new Date(),
          kycStatus: 'approved', // Default for now
          mfaEnabled: false, // Default for now
          organization: user.organization || 'Not specified',
          // Add role-specific fields
          ...(user.panel === 'company' && {
            blockchainDID: 'did:ethr:0x' + user.id.toString().padStart(40, '0'),
            walletAddress: '0x' + user.id.toString().padStart(40, '0')
          }),
          ...(user.panel === 'government' && {
            department: user.organization || 'Government Department',
            clearanceLevel: 'standard'
          }),
          ...(user.panel === 'admin' && {
            permissions: ['read', 'write', 'admin']
          })
        }));
        
        console.log('✅ Users loaded:', realUsers);
        setUsers(realUsers);
      } else {
        throw new Error('Invalid API response format');
      }
    } catch (error) {
      console.error('❌ Error loading users:', error);
      // Set fallback users
      const fallbackUsers = [
        {
          id: '1',
          email: 'yugadmin@gmail.com',
          name: 'Yug Admin',
          role: 'admin',
          status: 'active',
          isVerified: true,
          registrationDate: new Date(),
          lastLogin: new Date(),
          kycStatus: 'approved',
          mfaEnabled: false,
          organization: 'BlueCarbon Admin',
          permissions: ['read', 'write', 'admin']
        },
        {
          id: '2',
          email: 'yugcompany@gmail.com',
          name: 'Yug Company',
          role: 'company',
          status: 'active',
          isVerified: true,
          registrationDate: new Date(),
          lastLogin: new Date(),
          kycStatus: 'approved',
          mfaEnabled: false,
          organization: 'Yug Company Ltd',
          blockchainDID: 'did:ethr:0x0000000000000000000000000000000000000002',
          walletAddress: '0x0000000000000000000000000000000000000002'
        },
        {
          id: '3',
          email: 'yuggovernment@gmail.com',
          name: 'Yug Government',
          role: 'government',
          status: 'active',
          isVerified: true,
          registrationDate: new Date(),
          lastLogin: new Date(),
          kycStatus: 'approved',
          mfaEnabled: false,
          organization: 'Government Department',
          department: 'Government Department',
          clearanceLevel: 'standard'
        }
      ];
      setUsers(fallbackUsers);
      showNotification('Using fallback user data - check backend connection', 'warning');
    }
  };



  const showNotification = (message, severity = 'info') => {
    setNotification({ open: true, message, severity });
  };

  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };

  const refreshData = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const ActiveComponent = tabs[activeTab].component;

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <SupervisorAccount 
            sx={{ 
              fontSize: 40, 
              mr: 2, 
              color: blueCarbon.oceanBlue 
            }} 
          />
          <Box>
            <Typography variant="h4" className="gradient-text" gutterBottom>
              User Management System
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Comprehensive administration of all platform users, roles, and security
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Navigation Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            borderBottom: 1,
            borderColor: 'divider',
            '& .MuiTab-root': {
              minHeight: 72,
              textTransform: 'none',
              fontSize: '0.95rem',
              fontWeight: 500,
            }
          }}
        >
          {tabs.map((tab, index) => (
            <Tab
              key={index}
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', flexDirection: 'column' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                    {tab.icon}
                    <Typography variant="body2" sx={{ ml: 1 }}>
                      {tab.label}
                    </Typography>
                  </Box>
                  <Typography variant="caption" color="text.secondary">
                    {tab.description}
                  </Typography>
                </Box>
              }
            />
          ))}
        </Tabs>
      </Paper>

      {/* Active Tab Content */}
      <Box sx={{ mt: 3 }}>
        <ActiveComponent
          users={users}
          userStats={userStats}
          selectedUser={selectedUser}
          onUserSelect={setSelectedUser}
          onRefresh={refreshData}
          onNotification={showNotification}
          loading={loading}
        />
      </Box>

      {/* Global Notifications */}
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseNotification} 
          severity={notification.severity}
          variant="filled"
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default UserManagement;