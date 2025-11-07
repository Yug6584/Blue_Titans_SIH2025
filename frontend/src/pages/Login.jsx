import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  Divider,
} from '@mui/material';
import {
  AccountBalance,
  Business,
  AdminPanelSettings,
} from '@mui/icons-material';
import Logo from '../components/Logo';
import { useAuth } from '../utils/auth';
import { authAPI } from '../utils/api';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  
  const [formData, setFormData] = useState({
    panelType: '',
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [loginAttempts, setLoginAttempts] = useState({
    attemptsRemaining: 5,
    totalAttempts: 0,
    maxAttempts: 5,
    locked: false,
    remainingTime: 0
  });

  // Countdown timer for locked accounts
  useEffect(() => {
    let timer;
    if (loginAttempts.locked && loginAttempts.remainingTime > 0) {
      timer = setInterval(() => {
        setLoginAttempts(prev => {
          const newRemainingTime = prev.remainingTime - 1;
          if (newRemainingTime <= 0) {
            return {
              ...prev,
              locked: false,
              remainingTime: 0,
              totalAttempts: 0,
              attemptsRemaining: prev.maxAttempts
            };
          }
          return {
            ...prev,
            remainingTime: newRemainingTime
          };
        });
      }, 60000); // Update every minute
    }
    return () => clearInterval(timer);
  }, [loginAttempts.locked, loginAttempts.remainingTime]);

  const panelTypes = [
    { value: 'company', label: 'Company Panel', icon: <Business />, description: 'Carbon Credit Project Companies' },
    { value: 'government', label: 'Government Panel', icon: <AccountBalance />, description: 'Regulatory & Verification Authority' },
    { value: 'admin', label: 'Admin Panel', icon: <AdminPanelSettings />, description: 'System Administration' },
  ];

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Only require email and password - panel type is determined by backend
    if (!formData.email || !formData.password) {
      setError('Please enter your email and password');
      return;
    }

    setLoading(true);
    setError('');

    try {
      console.log('🔐 Attempting login with:', { email: formData.email });
      
      const response = await fetch('http://localhost:8000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        mode: 'cors',
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();
      console.log('📥 Backend response:', data);

      // Update login attempts info if provided
      if (data.attemptsRemaining !== undefined) {
        setLoginAttempts({
          attemptsRemaining: data.attemptsRemaining || 0,
          totalAttempts: data.totalAttempts || 0,
          maxAttempts: data.maxAttempts || 5,
          locked: data.locked || false,
          remainingTime: data.remainingTime || 0
        });
      }

      if (!response.ok) {
        // Check if account is locked
        if (response.status === 429 && data.locked) {
          setError(`🔒 ${data.message}`);
          return;
        }
        
        // Check if user is suspended
        if (response.status === 403 && data.suspended) {
          setError(`⚠️ ${data.message || 'Your account has been suspended. Please contact the administrator for assistance.'}`);
          return;
        }
        
        // Handle invalid credentials
        if (response.status === 401) {
          const attemptsText = data.attemptsRemaining > 0 
            ? ` (${data.attemptsRemaining} attempts remaining)`
            : '';
          setError(`❌ ${data.message}${attemptsText}`);
          return;
        }
        
        // Generic error
        setError(`❌ ${data.message || 'Login failed'}`);
        return;
      }

      // Success case
      const { token, user } = data;
      
      // Verify we have the required data
      if (!token || !user || !user.panel) {
        setError('❌ Invalid response from server');
        return;
      }

      console.log('✅ Login successful, user panel:', user.panel);
      
      // Clear login attempts on success
      setLoginAttempts({
        attemptsRemaining: 5,
        totalAttempts: 0,
        maxAttempts: 5,
        locked: false,
        remainingTime: 0
      });
      
      // Store auth data using the panel from backend response
      login(token, {
        role: user.panel,
        email: user.email,
        id: user.id,
        name: user.name || user.email,
        organization: user.organization,
      });

      // Redirect to appropriate dashboard based on user's actual panel
      console.log('🔄 Redirecting to:', `/${user.panel}/dashboard`);
      navigate(`/${user.panel}/dashboard`);
      
    } catch (error) {
      console.error('❌ Network error:', error);
      setError(
        '❌ Cannot connect to server. Please check:\n' +
        '1. Backend server is running on port 8000\n' +
        '2. Your internet connection\n' +
        '3. Try refreshing the page'
      );
    } finally {
      setLoading(false);
    }
  };



  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 2,
      }}
    >
      <Container maxWidth="md">
        <Paper
          elevation={24}
          sx={{
            padding: 4,
            borderRadius: 3,
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
          }}
        >
          {/* Header */}
          <Box textAlign="center" mb={4}>
            <Box display="flex" alignItems="center" justifyContent="center" mb={2}>
              <Logo size="large" showText={true} />
            </Box>
            <Typography variant="h6" color="text.secondary">
              Blue Carbon Credit Management System
            </Typography>
            <Typography variant="body2" color="text.secondary" mt={1}>
              Blockchain-based tokenization and MRV platform
            </Typography>
          </Box>

          {/* Info Section */}
          <Box mb={4}>
            <Typography variant="h6" mb={2} textAlign="center">
              Available Panels
            </Typography>
            <Box display="grid" gridTemplateColumns="repeat(auto-fit, minmax(250px, 1fr))" gap={2}>
              {panelTypes.map((panel) => (
                <Card
                  key={panel.value}
                  sx={{
                    border: 1,
                    borderColor: 'divider',
                    opacity: 0.8,
                  }}
                >
                  <CardContent sx={{ textAlign: 'center', py: 2 }}>
                    <Box color="primary.main" mb={1}>
                      {panel.icon}
                    </Box>
                    <Typography variant="subtitle1" fontWeight="medium">
                      {panel.label}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {panel.description}
                    </Typography>
                  </CardContent>
                </Card>
              ))}
            </Box>
            <Typography variant="body2" color="text.secondary" textAlign="center" mt={2}>
              Your panel will be automatically determined based on your account
            </Typography>
          </Box>

          <Divider sx={{ my: 3 }} />

          {/* Login Form */}
          <form onSubmit={handleSubmit}>
            <Box display="flex" flexDirection="column" gap={3}>
              <TextField
                fullWidth
                required
                name="email"
                label="Email Address"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                variant="outlined"
                placeholder="Enter your email address"
              />

              <TextField
                fullWidth
                required
                name="password"
                label="Password"
                type="password"
                value={formData.password}
                onChange={handleInputChange}
                variant="outlined"
                placeholder="Enter your password"
              />

              {error && (
                <Alert 
                  severity={loginAttempts.locked ? "warning" : "error"} 
                  sx={{ mt: 2 }}
                >
                  {error}
                </Alert>
              )}

              {/* Login Attempts Status */}
              {(loginAttempts.totalAttempts > 0 || loginAttempts.locked) && (
                <Box sx={{ mt: 2 }}>
                  <Paper 
                    sx={{ 
                      p: 2, 
                      bgcolor: loginAttempts.locked ? 'warning.light' : 'info.light',
                      border: 1,
                      borderColor: loginAttempts.locked ? 'warning.main' : 'info.main'
                    }}
                  >
                    <Typography variant="subtitle2" gutterBottom>
                      🔐 Login Security Status
                    </Typography>
                    
                    {loginAttempts.locked ? (
                      <Box>
                        <Typography variant="body2" color="warning.dark">
                          ⚠️ Account temporarily locked due to multiple failed attempts
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Try again in {loginAttempts.remainingTime} minutes
                        </Typography>
                      </Box>
                    ) : (
                      <Box>
                        <Typography variant="body2">
                          Failed attempts: {loginAttempts.totalAttempts} / {loginAttempts.maxAttempts}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Remaining attempts: {loginAttempts.attemptsRemaining}
                        </Typography>
                        {loginAttempts.attemptsRemaining <= 2 && (
                          <Typography variant="caption" color="warning.main">
                            ⚠️ Account will be locked after {loginAttempts.attemptsRemaining} more failed attempts
                          </Typography>
                        )}
                      </Box>
                    )}
                  </Paper>
                </Box>
              )}

              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={loading || loginAttempts.locked}
                sx={{
                  py: 1.5,
                  fontSize: '1.1rem',
                  fontWeight: 'bold',
                  background: loginAttempts.locked 
                    ? 'linear-gradient(45deg, #f57c00, #ff9800)'
                    : 'linear-gradient(45deg, #1976d2, #42a5f5)',
                  '&:hover': {
                    background: loginAttempts.locked
                      ? 'linear-gradient(45deg, #f57c00, #ff9800)'
                      : 'linear-gradient(45deg, #1565c0, #1976d2)',
                  },
                }}
              >
                {loading ? (
                  <CircularProgress size={24} color="inherit" />
                ) : loginAttempts.locked ? (
                  `🔒 Locked (${loginAttempts.remainingTime}m remaining)`
                ) : (
                  'Login'
                )}
              </Button>
            </Box>
          </form>



          {/* Footer */}
          <Box textAlign="center" mt={4}>
            <Typography variant="caption" color="text.secondary">
              Built with ❤️ for a sustainable future 🌱
            </Typography>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default Login;