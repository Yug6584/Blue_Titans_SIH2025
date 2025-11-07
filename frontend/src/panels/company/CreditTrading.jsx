import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
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
  LinearProgress,
  IconButton,
  Tooltip,
  CircularProgress
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  Assessment,
  ShoppingCart,
  Sell,
  Cancel,
  Refresh,
  Add
} from '@mui/icons-material';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip as ChartTooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  ChartTooltip,
  Legend
);

const CreditTrading = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [tradingData, setTradingData] = useState(null);
  const [openTradeDialog, setOpenTradeDialog] = useState(false);
  const [tradeType, setTradeType] = useState('buy');
  const [tradeData, setTradeData] = useState({
    credit_type: '',
    quantity: '',
    price_limit: '',
    order_type: 'market'
  });

  // Load real trading data from company's trading database
  const loadTradingData = async () => {
    try {
      setError(null);
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch('http://localhost:8000/api/trading/dashboard', {
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
        setTradingData(data.data);
        console.log('✅ Trading data loaded:', data.data);
      } else {
        throw new Error(data.message || 'Failed to load trading data');
      }
    } catch (error) {
      console.error('Error loading trading data:', error);
      setError(error.message);
      
      // Fallback to empty structure
      setTradingData({
        activeOrders: [],
        transactions: [],
        statistics: {
          total_trades: 0,
          total_volume: 0,
          total_credits_bought: 0,
          total_credits_sold: 0,
          average_buy_price: 0,
          average_sell_price: 0,
          profit_loss: 0
        }
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadTradingData();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadTradingData();
  };

  const handleCreateOrder = async () => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch('http://localhost:8000/api/trading/orders', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          order_type: tradeType,
          credit_type: tradeData.credit_type,
          quantity: parseInt(tradeData.quantity),
          price_limit: parseFloat(tradeData.price_limit)
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setOpenTradeDialog(false);
        setTradeData({
          credit_type: '',
          quantity: '',
          price_limit: '',
          order_type: 'market'
        });
        await loadTradingData(); // Refresh the data
      } else {
        throw new Error(data.message || 'Order creation failed');
      }
    } catch (error) {
      console.error('Order creation error:', error);
      setError(error.message);
    }
  };

  const handleCancelOrder = async (orderId) => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(`http://localhost:8000/api/trading/orders/${orderId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      
      if (data.success) {
        await loadTradingData(); // Refresh the data
      } else {
        throw new Error(data.message || 'Order cancellation failed');
      }
    } catch (error) {
      console.error('Order cancellation error:', error);
      setError(error.message);
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed': return 'success';
      case 'partial': return 'warning';
      case 'pending': return 'info';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed': return <Assessment />;
      case 'partial': return <TrendingUp />;
      case 'pending': return <ShoppingCart />;
      case 'cancelled': return <Cancel />;
      default: return <Assessment />;
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <Box sx={{ textAlign: 'center' }}>
          <CircularProgress size={60} sx={{ mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            Loading your trading data...
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Connecting to your trading database
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
          Credit Trading
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
            startIcon={<Add />}
            onClick={() => setOpenTradeDialog(true)}
          >
            New Order
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Trading Statistics */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="textSecondary" gutterBottom variant="overline">
                    Portfolio Value
                  </Typography>
                  <Typography variant="h4" component="h2">
                    ${(tradingData?.statistics?.total_volume || 0).toLocaleString()}
                  </Typography>
                </Box>
                <Assessment color="primary" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="textSecondary" gutterBottom variant="overline">
                    Total Trades
                  </Typography>
                  <Typography variant="h4" component="h2">
                    {tradingData?.statistics?.total_trades || 0}
                  </Typography>
                </Box>
                <TrendingUp color="success" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="textSecondary" gutterBottom variant="overline">
                    Credits Owned
                  </Typography>
                  <Typography variant="h4" component="h2">
                    {((tradingData?.statistics?.total_credits_bought || 0) - (tradingData?.statistics?.total_credits_sold || 0)).toLocaleString()}
                  </Typography>
                </Box>
                <ShoppingCart color="info" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="textSecondary" gutterBottom variant="overline">
                    Avg Buy Price
                  </Typography>
                  <Typography variant="h4" component="h2">
                    ${(tradingData?.statistics?.average_buy_price || 0).toFixed(2)}
                  </Typography>
                </Box>
                <TrendingDown color="warning" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Active Orders */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Active Orders
          </Typography>
          {tradingData?.activeOrders && tradingData.activeOrders.length > 0 ? (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Type</TableCell>
                    <TableCell>Credit Type</TableCell>
                    <TableCell>Quantity</TableCell>
                    <TableCell>Price Limit</TableCell>
                    <TableCell>Filled</TableCell>
                    <TableCell>Progress</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Order Date</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {tradingData.activeOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell>
                        <Chip 
                          label={order.order_type} 
                          color={order.order_type === 'buy' ? 'success' : 'error'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{order.credit_type}</TableCell>
                      <TableCell>{order.quantity?.toLocaleString()}</TableCell>
                      <TableCell>${order.price_limit}</TableCell>
                      <TableCell>{order.filled_quantity || 0}</TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <LinearProgress 
                            variant="determinate" 
                            value={((order.filled_quantity || 0) / order.quantity) * 100} 
                            sx={{ width: 60, height: 6 }}
                          />
                          <Typography variant="caption">
                            {Math.round(((order.filled_quantity || 0) / order.quantity) * 100)}%
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          icon={getStatusIcon(order.status)}
                          label={order.status} 
                          color={getStatusColor(order.status)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        {order.order_date ? new Date(order.order_date).toLocaleDateString() : 'Unknown'}
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <IconButton 
                            size="small" 
                            color="error"
                            onClick={() => handleCancelOrder(order.id)}
                            disabled={order.status === 'cancelled' || order.status === 'completed'}
                          >
                            <Cancel />
                          </IconButton>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <ShoppingCart sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary">
                No Active Orders
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Create your first trading order to get started
              </Typography>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => setOpenTradeDialog(true)}
              >
                Create First Order
              </Button>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Trade History */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Trade History
          </Typography>
          {tradingData?.transactions && tradingData.transactions.length > 0 ? (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Type</TableCell>
                    <TableCell>Credit Type</TableCell>
                    <TableCell>Quantity</TableCell>
                    <TableCell>Price</TableCell>
                    <TableCell>Total</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {tradingData.transactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell>
                        <Chip 
                          label={transaction.transaction_type} 
                          color={transaction.transaction_type === 'buy' ? 'success' : 'error'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{transaction.credit_type}</TableCell>
                      <TableCell>{transaction.quantity?.toLocaleString()}</TableCell>
                      <TableCell>${transaction.price_per_credit}</TableCell>
                      <TableCell>${transaction.total_value?.toLocaleString()}</TableCell>
                      <TableCell>
                        {transaction.transaction_date ? new Date(transaction.transaction_date).toLocaleDateString() : 'Unknown'}
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={transaction.status || 'completed'} 
                          color={getStatusColor(transaction.status)}
                          size="small"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Assessment sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary">
                No Transaction History
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Your completed trades will appear here
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Trade Dialog */}
      <Dialog open={openTradeDialog} onClose={() => setOpenTradeDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create New Order</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Order Type</InputLabel>
              <Select
                value={tradeType}
                onChange={(e) => setTradeType(e.target.value)}
              >
                <MenuItem value="buy">Buy</MenuItem>
                <MenuItem value="sell">Sell</MenuItem>
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="Credit Type"
              value={tradeData.credit_type}
              onChange={(e) => setTradeData({ ...tradeData, credit_type: e.target.value })}
              sx={{ mb: 2 }}
              placeholder="e.g., Blue Carbon - Mangrove"
            />
            <TextField
              fullWidth
              label="Quantity"
              type="number"
              value={tradeData.quantity}
              onChange={(e) => setTradeData({ ...tradeData, quantity: e.target.value })}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Price Limit ($)"
              type="number"
              step="0.01"
              value={tradeData.price_limit}
              onChange={(e) => setTradeData({ ...tradeData, price_limit: e.target.value })}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenTradeDialog(false)}>Cancel</Button>
          <Button 
            onClick={handleCreateOrder} 
            variant="contained"
            disabled={!tradeData.credit_type || !tradeData.quantity || !tradeData.price_limit}
          >
            Create Order
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CreditTrading;