import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Avatar,
  Rating,
  Divider,
  Tab,
  Tabs,
  Badge,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  Store,
  ShoppingCart,
  Sell,
  TrendingUp,
  Nature,
  Verified,
  Star,
  LocalOffer,
  Timeline,
  Assessment,
  Refresh
} from '@mui/icons-material';

const Marketplace = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [marketplaceData, setMarketplaceData] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [openListingDialog, setOpenListingDialog] = useState(false);
  const [selectedCredit, setSelectedCredit] = useState(null);
  const [listingData, setListingData] = useState({
    project_id: '',
    credits: '',
    price_per_credit: '',
    description: ''
  });

  // Load real marketplace data from company database
  const loadMarketplaceData = async () => {
    try {
      setError(null);
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch('http://localhost:8000/api/company-dashboard/marketplace', {
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
        setMarketplaceData(data.data);
        console.log('✅ Marketplace data loaded:', data.data);
      } else {
        throw new Error(data.message || 'Failed to load marketplace data');
      }
    } catch (error) {
      console.error('Error loading marketplace data:', error);
      setError(error.message);
      
      // Fallback to empty structure
      setMarketplaceData({
        statistics: {
          marketPrice: 0,
          availableCredits: 0,
          myPortfolio: 0,
          totalVolume: 0,
          myListings: 0
        },
        marketListings: [],
        myListings: [],
        recentTransactions: []
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadMarketplaceData();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadMarketplaceData();
  };

  const handleListCredits = async () => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch('http://localhost:8000/api/company-dashboard/marketplace/list', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...listingData,
          credits: parseInt(listingData.credits),
          price_per_credit: parseFloat(listingData.price_per_credit)
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setOpenListingDialog(false);
        setListingData({
          project_id: '',
          credits: '',
          price_per_credit: '',
          description: ''
        });
        await loadMarketplaceData(); // Refresh the data
      } else {
        throw new Error(data.message || 'Listing failed');
      }
    } catch (error) {
      console.error('Listing error:', error);
      setError(error.message);
    }
  };

  const handleBuyCredits = async (creditId, quantity) => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch('http://localhost:8000/api/company-dashboard/marketplace/buy', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          credit_id: creditId,
          quantity: quantity
        })
      });

      const data = await response.json();
      
      if (data.success) {
        await loadMarketplaceData(); // Refresh the data
      } else {
        throw new Error(data.message || 'Purchase failed');
      }
    } catch (error) {
      console.error('Purchase error:', error);
      setError(error.message);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <Box sx={{ textAlign: 'center' }}>
          <CircularProgress size={60} sx={{ mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            Loading marketplace data...
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
          Carbon Credit Marketplace
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
            startIcon={<Sell />}
            onClick={() => setOpenListingDialog(true)}
          >
            List Credits
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
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h6">Market Price</Typography>
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    ${marketplaceData?.statistics?.marketPrice?.toFixed(2) || '0.00'}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>
                    per credit
                  </Typography>
                </Box>
                <TrendingUp sx={{ fontSize: 40, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', color: 'white' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h6">Available Credits</Typography>
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    {marketplaceData?.statistics?.availableCredits?.toLocaleString() || '0'}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>
                    in marketplace
                  </Typography>
                </Box>
                <Store sx={{ fontSize: 40, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: 'white' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h6">My Portfolio</Typography>
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    {marketplaceData?.statistics?.myPortfolio?.toLocaleString() || '0'}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>
                    credits owned
                  </Typography>
                </Box>
                <Assessment sx={{ fontSize: 40, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', color: 'white' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h6">Total Volume</Typography>
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    ${(marketplaceData?.statistics?.totalVolume || 0).toLocaleString()}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>
                    traded
                  </Typography>
                </Box>
                <Timeline sx={{ fontSize: 40, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Card>
        <CardContent>
          <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)} sx={{ mb: 3 }}>
            <Tab 
              label={
                <Badge badgeContent={marketplaceData?.marketListings?.length || 0} color="primary">
                  Browse Credits
                </Badge>
              } 
            />
            <Tab 
              label={
                <Badge badgeContent={marketplaceData?.myListings?.length || 0} color="secondary">
                  My Listings
                </Badge>
              } 
            />
            <Tab label="Transaction History" />
          </Tabs>

          {/* Browse Credits Tab */}
          {activeTab === 0 && (
            <Box>
              {marketplaceData?.marketListings && marketplaceData.marketListings.length > 0 ? (
                <Grid container spacing={3}>
                  {marketplaceData.marketListings.map((credit) => (
                    <Grid item xs={12} md={4} key={credit.id}>
                      <Card sx={{ height: '100%' }}>
                        <CardContent>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                              <Nature />
                            </Avatar>
                            <Box>
                              <Typography variant="h6">{credit.project_name || 'Carbon Credit'}</Typography>
                              <Rating value={4.5} size="small" readOnly />
                            </Box>
                          </Box>
                          
                          <Box sx={{ mb: 2 }}>
                            <Chip label="Verified" color="success" size="small" icon={<Verified />} />
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                              {credit.description || 'High-quality carbon credits'}
                            </Typography>
                          </Box>

                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                            <Typography variant="body2">
                              <strong>Quantity:</strong> {credit.credits?.toLocaleString()}
                            </Typography>
                            <Typography variant="body2">
                              <strong>Seller:</strong> {credit.seller_name || 'Anonymous'}
                            </Typography>
                          </Box>

                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="h6" color="primary">
                              ${credit.price_per_credit}/credit
                            </Typography>
                            <Button
                              variant="contained"
                              size="small"
                              startIcon={<ShoppingCart />}
                              onClick={() => handleBuyCredits(credit.id, credit.credits)}
                            >
                              Buy
                            </Button>
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              ) : (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Store sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="h6" color="text.secondary">
                    No Credits Available
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    No carbon credits are currently listed in the marketplace
                  </Typography>
                </Box>
              )}
            </Box>
          )}

          {/* My Listings Tab */}
          {activeTab === 1 && (
            <Box>
              {marketplaceData?.myListings && marketplaceData.myListings.length > 0 ? (
                <TableContainer component={Paper}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Project</TableCell>
                        <TableCell>Credits</TableCell>
                        <TableCell>Price per Credit</TableCell>
                        <TableCell>Total Value</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {marketplaceData.myListings.map((listing) => (
                        <TableRow key={listing.id}>
                          <TableCell>{listing.project_name || 'Unknown Project'}</TableCell>
                          <TableCell>{listing.credits?.toLocaleString()}</TableCell>
                          <TableCell>${listing.price_per_credit}</TableCell>
                          <TableCell>${(listing.credits * listing.price_per_credit).toLocaleString()}</TableCell>
                          <TableCell>
                            <Chip label={listing.status} color="primary" size="small" />
                          </TableCell>
                          <TableCell>
                            <Button size="small" color="error">Remove</Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Sell sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="h6" color="text.secondary">
                    No Active Listings
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    You haven't listed any carbon credits for sale yet
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<Sell />}
                    onClick={() => setOpenListingDialog(true)}
                  >
                    List Your First Credits
                  </Button>
                </Box>
              )}
            </Box>
          )}

          {/* Transaction History Tab */}
          {activeTab === 2 && (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Timeline sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary">
                No Transaction History
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Your marketplace transactions will appear here
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* List Credits Dialog */}
      <Dialog open={openListingDialog} onClose={() => setOpenListingDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>List Carbon Credits</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              fullWidth
              label="Project ID"
              type="number"
              value={listingData.project_id}
              onChange={(e) => setListingData({ ...listingData, project_id: e.target.value })}
              sx={{ mb: 2 }}
              helperText="Enter the ID of the project generating these credits"
            />
            <TextField
              fullWidth
              label="Number of Credits"
              type="number"
              value={listingData.credits}
              onChange={(e) => setListingData({ ...listingData, credits: e.target.value })}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Price per Credit ($)"
              type="number"
              step="0.01"
              value={listingData.price_per_credit}
              onChange={(e) => setListingData({ ...listingData, price_per_credit: e.target.value })}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Description"
              multiline
              rows={3}
              value={listingData.description}
              onChange={(e) => setListingData({ ...listingData, description: e.target.value })}
              helperText="Describe the carbon credits and their verification status"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenListingDialog(false)}>Cancel</Button>
          <Button 
            onClick={handleListCredits} 
            variant="contained" 
            disabled={!listingData.project_id || !listingData.credits || !listingData.price_per_credit}
          >
            List Credits
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Marketplace;