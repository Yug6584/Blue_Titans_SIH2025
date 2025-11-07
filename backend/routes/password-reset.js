const express = require('express');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const { authenticateToken } = require('../middleware/auth');
const router = express.Router();

// In-memory storage for verification codes (in production, use Redis or database)
const verificationCodes = new Map();

// Email transporter configuration
const createEmailTransporter = () => {
  // Check if we have email credentials configured
  const hasEmailConfig = process.env.EMAIL_USER && process.env.EMAIL_PASS && process.env.EMAIL_PASS !== 'your-app-password-here';
  
  // For development or when no email config, use mock service
  if (process.env.NODE_ENV === 'development' || !hasEmailConfig) {
    console.log('📧 Using mock email service (development mode or no email config)');
    return {
      sendMail: async (mailOptions) => {
        console.log('📧 [MOCK EMAIL] Email Details:');
        console.log('   From:', mailOptions.from);
        console.log('   To:', mailOptions.to);
        console.log('   Subject:', mailOptions.subject);
        console.log('   Verification Code:', mailOptions.html.match(/(\d{6})/)?.[1] || 'Not found');
        console.log('   Time:', new Date().toISOString());
        console.log('   Note: This is a mock email - no actual email sent');
        return Promise.resolve({ messageId: 'mock-' + Date.now() });
      }
    };
  }
  
  console.log('📧 Using real email service with Gmail');
  try {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      },
      tls: {
        rejectUnauthorized: false
      }
    });
  } catch (error) {
    console.error('Error creating email transporter:', error);
    // Fallback to mock service if there's an issue
    return {
      sendMail: async (mailOptions) => {
        console.log('📧 [FALLBACK MOCK] Email Details:');
        console.log('   From:', mailOptions.from);
        console.log('   To:', mailOptions.to);
        console.log('   Subject:', mailOptions.subject);
        console.log('   Verification Code:', mailOptions.html.match(/(\d{6})/)?.[1] || 'Not found');
        console.log('   Error: Real email service failed, using mock');
        return Promise.resolve({ messageId: 'fallback-mock-' + Date.now() });
      }
    };
  }
};

// Generate 6-digit verification code
const generateVerificationCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send verification code to email
const sendVerificationEmail = async (email, code, userName) => {
  try {
    const transporter = createEmailTransporter();
    
    const mailOptions = {
      from: process.env.EMAIL_USER || 'noreply@bluecarbonledger.com',
      to: email,
      subject: 'BlueCarbon Ledger - Password Change Verification Code',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #1976d2, #4caf50); padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">🌊 BlueCarbon Ledger</h1>
          </div>
          
          <div style="padding: 30px; background: #f9f9f9;">
            <h2 style="color: #333;">Password Change Verification</h2>
            
            <p>Hello ${userName},</p>
            
            <p>You have requested to change your password. Please use the verification code below to proceed:</p>
            
            <div style="background: white; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
              <h1 style="color: #1976d2; font-size: 32px; letter-spacing: 5px; margin: 0;">${code}</h1>
            </div>
            
            <p><strong>Important:</strong></p>
            <ul>
              <li>This code is valid for 10 minutes only</li>
              <li>Do not share this code with anyone</li>
              <li>If you didn't request this change, please ignore this email</li>
            </ul>
            
            <p>For security reasons, you will be automatically logged out after changing your password.</p>
            
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;">
            
            <p style="color: #666; font-size: 12px;">
              This is an automated email from BlueCarbon Ledger. Please do not reply to this email.
            </p>
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Error sending verification email:', error);
    return false;
  }
};

// Request password change verification code
router.post('/request-verification', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const userEmail = req.user.email;
    const userName = req.user.name || 'User';

    // Generate verification code
    const verificationCode = generateVerificationCode();
    
    // Store verification code with expiration (10 minutes)
    const expirationTime = Date.now() + 10 * 60 * 1000; // 10 minutes
    verificationCodes.set(userId, {
      code: verificationCode,
      expires: expirationTime,
      email: userEmail
    });

    // Send verification email
    const emailSent = await sendVerificationEmail(userEmail, verificationCode, userName);

    if (emailSent) {
      // In development, also log the code for easy testing
      if (process.env.NODE_ENV === 'development') {
        console.log(`🔐 [DEV] Verification code for ${userEmail}: ${verificationCode}`);
      }
      
      res.json({
        success: true,
        message: 'Verification code sent to your registered email address',
        email: userEmail.replace(/(.{2})(.*)(@.*)/, '$1***$3'), // Mask email for security
        ...(process.env.NODE_ENV === 'development' && { devCode: verificationCode }) // Include code in dev mode
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to send verification email. Please try again.'
      });
    }

  } catch (error) {
    console.error('Error requesting verification code:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Verify code and change password
router.post('/change-password', authenticateToken, async (req, res) => {
  try {
    const { verificationCode, newPassword, confirmPassword } = req.body;
    const userId = req.user.userId;

    // Validation
    if (!verificationCode || !newPassword || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'New password and confirm password do not match'
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters long'
      });
    }

    // Check verification code
    const storedData = verificationCodes.get(userId);
    if (!storedData) {
      return res.status(400).json({
        success: false,
        message: 'No verification code found. Please request a new code.'
      });
    }

    if (Date.now() > storedData.expires) {
      verificationCodes.delete(userId);
      return res.status(400).json({
        success: false,
        message: 'Verification code has expired. Please request a new code.'
      });
    }

    if (storedData.code !== verificationCode) {
      return res.status(400).json({
        success: false,
        message: 'Invalid verification code'
      });
    }

    // Hash new password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update password in database
    const db = require('../database/init');
    
    await new Promise((resolve, reject) => {
      db.run(
        'UPDATE users SET password = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?',
        [hashedPassword, userId],
        function(err) {
          if (err) {
            console.error('Error updating password:', err);
            reject(err);
          } else if (this.changes === 0) {
            reject(new Error('User not found'));
          } else {
            resolve();
          }
        }
      );
    });

    // Clean up verification code
    verificationCodes.delete(userId);

    // Log the password change for security
    console.log(`Password changed for user ID: ${userId} at ${new Date().toISOString()}`);

    res.json({
      success: true,
      message: 'Password changed successfully. You will be logged out in 30 seconds.',
      autoLogout: true,
      logoutDelay: 30000 // 30 seconds
    });

  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to change password. Please try again.'
    });
  }
});

// Get verification status
router.get('/verification-status', authenticateToken, (req, res) => {
  const userId = req.user.userId;
  const storedData = verificationCodes.get(userId);

  if (!storedData) {
    return res.json({
      success: true,
      hasActiveCode: false
    });
  }

  const isExpired = Date.now() > storedData.expires;
  if (isExpired) {
    verificationCodes.delete(userId);
    return res.json({
      success: true,
      hasActiveCode: false
    });
  }

  const timeRemaining = Math.ceil((storedData.expires - Date.now()) / 1000);

  res.json({
    success: true,
    hasActiveCode: true,
    timeRemaining: timeRemaining,
    email: storedData.email.replace(/(.{2})(.*)(@.*)/, '$1***$3')
  });
});

module.exports = router;