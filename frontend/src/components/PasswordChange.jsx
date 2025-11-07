import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Box,
  Alert,
  CircularProgress,
  Stepper,
  Step,
  StepLabel,
  Paper,
  Divider,
  LinearProgress
} from '@mui/material';
import {
  Security,
  Email,
  Lock,
  CheckCircle,
  Timer,
  Logout
} from '@mui/icons-material';

const PasswordChange = ({ open, onClose, onLogout }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [countdown, setCountdown] = useState(0);
  
  // Form data
  const [verificationCode, setVerificationCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Verification status
  const [verificationStatus, setVerificationStatus] = useState({
    hasActiveCode: false,
    timeRemaining: 0,
    email: ''
  });

  const steps = ['Request Code', 'Verify & Change Password', 'Complete'];

  // Check verification status on component mount
  useEffect(() => {
    if (open) {
      checkVerificationStatus();
    }
  }, [open]);

  // Countdown timer for auto-logout
  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            onLogout();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [countdown, onLogout]);

  const checkVerificationStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/password/verification-status', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      if (data.success && data.hasActiveCode) {
        setVerificationStatus(data);
        setActiveStep(1); // Skip to verification step
      }
    } catch (error) {
      console.error('Error checking verification status:', error);
    }
  };

  const requestVerificationCode = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/password/request-verification', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (data.success) {
        let successMessage = `Verification code sent to ${data.email}`;
        
        // In development, show the code directly
        if (data.devCode) {
          successMessage += ` (Dev Code: ${data.devCode})`;
        }
        
        setSuccess(successMessage);
        setActiveStep(1);
        setVerificationStatus({
          hasActiveCode: true,
          timeRemaining: 600, // 10 minutes
          email: data.email,
          devCode: data.devCode // Store dev code for easy access
        });
      } else {
        setError(data.message || 'Failed to send verification code');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const changePassword = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    // Validation
    if (!verificationCode || !newPassword || !confirmPassword) {
      setError('All fields are required');
      setLoading(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('New password and confirm password do not match');
      setLoading(false);
      return;
    }

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters long');
      setLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/password/change-password', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          verificationCode,
          newPassword,
          confirmPassword
        })
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(data.message);
        setActiveStep(2);
        
        // Start countdown for auto-logout
        if (data.autoLogout) {
          setCountdown(Math.ceil(data.logoutDelay / 1000));
        }
      } else {
        setError(data.message || 'Failed to change password');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (activeStep === 2) {
      // Don't allow closing after successful password change
      return;
    }
    
    setActiveStep(0);
    setError('');
    setSuccess('');
    setVerificationCode('');
    setNewPassword('');
    setConfirmPassword('');
    setVerificationStatus({ hasActiveCode: false, timeRemaining: 0, email: '' });
    onClose();
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      maxWidth="sm" 
      fullWidth
      disableEscapeKeyDown={activeStep === 2}
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Security color="primary" />
          <Typography variant="h6">Change Password</Typography>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Box sx={{ mb: 3 }}>
          <Stepper activeStep={activeStep} alternativeLabel>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}

        {/* Step 1: Request Verification Code */}
        {activeStep === 0 && (
          <Box>
            <Paper sx={{ p: 3, mb: 2, bgcolor: 'primary.light', color: 'primary.contrastText' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <Email />
                <Typography variant="h6">Email Verification Required</Typography>
              </Box>
              <Typography variant="body2">
                For security purposes, we'll send a verification code to your registered email address. 
                This code will be valid for 10 minutes.
              </Typography>
            </Paper>

            <Typography variant="body1" sx={{ mb: 2 }}>
              Click the button below to receive a verification code via email.
            </Typography>
          </Box>
        )}

        {/* Step 2: Verify Code and Change Password */}
        {activeStep === 1 && (
          <Box>
            {verificationStatus.hasActiveCode && (
              <Alert severity="info" sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Timer />
                  <Typography variant="body2">
                    Code sent to {verificationStatus.email} • 
                    Time remaining: {formatTime(verificationStatus.timeRemaining)}
                  </Typography>
                </Box>
              </Alert>
            )}

            <TextField
              fullWidth
              label="Verification Code"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              placeholder="Enter 6-digit code"
              sx={{ mb: 2 }}
              inputProps={{ maxLength: 6 }}
            />
            
            {verificationStatus.devCode && (
              <Alert severity="info" sx={{ mb: 2 }}>
                <Typography variant="body2">
                  <strong>Development Mode:</strong> Your verification code is <strong>{verificationStatus.devCode}</strong>
                </Typography>
              </Alert>
            )}

            <Divider sx={{ my: 2 }}>
              <Typography variant="body2" color="text.secondary">
                New Password
              </Typography>
            </Divider>

            <TextField
              fullWidth
              type="password"
              label="New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              sx={{ mb: 2 }}
              helperText="Minimum 8 characters"
            />

            <TextField
              fullWidth
              type="password"
              label="Confirm New Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              sx={{ mb: 2 }}
            />
          </Box>
        )}

        {/* Step 3: Success and Auto-logout */}
        {activeStep === 2 && (
          <Box sx={{ textAlign: 'center' }}>
            <CheckCircle sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
            
            <Typography variant="h6" gutterBottom>
              Password Changed Successfully!
            </Typography>
            
            <Typography variant="body1" sx={{ mb: 3 }}>
              Your password has been updated. For security reasons, you will be automatically logged out.
            </Typography>

            {countdown > 0 && (
              <Paper sx={{ p: 2, bgcolor: 'warning.light' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mb: 1 }}>
                  <Logout />
                  <Typography variant="h6">
                    Auto-logout in {countdown} seconds
                  </Typography>
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={(30 - countdown) / 30 * 100}
                  sx={{ height: 8, borderRadius: 4 }}
                />
              </Paper>
            )}
          </Box>
        )}
      </DialogContent>

      <DialogActions>
        {activeStep === 0 && (
          <>
            <Button onClick={handleClose}>Cancel</Button>
            <Button 
              variant="contained" 
              onClick={requestVerificationCode}
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} /> : <Email />}
            >
              {loading ? 'Sending...' : 'Send Verification Code'}
            </Button>
          </>
        )}

        {activeStep === 1 && (
          <>
            <Button onClick={handleClose}>Cancel</Button>
            <Button 
              variant="contained" 
              onClick={changePassword}
              disabled={loading || !verificationCode || !newPassword || !confirmPassword}
              startIcon={loading ? <CircularProgress size={20} /> : <Lock />}
            >
              {loading ? 'Changing...' : 'Change Password'}
            </Button>
          </>
        )}

        {activeStep === 2 && (
          <Button 
            variant="contained" 
            onClick={onLogout}
            startIcon={<Logout />}
          >
            Logout Now
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default PasswordChange;