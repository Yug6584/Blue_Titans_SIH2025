const fs = require('fs');
const path = require('path');

// Import nodemailer properly
let nodemailer;
try {
  nodemailer = require('nodemailer');
} catch (error) {
  console.error('❌ nodemailer not found. Installing...');
  process.exit(1);
}

// Test email configuration
const testEmailConfig = async (emailUser, emailPass) => {
  try {
    console.log('🧪 Testing email configuration...');
    
    const transporter = nodemailer.createTransporter({
      service: 'gmail',
      auth: {
        user: emailUser,
        pass: emailPass
      },
      tls: {
        rejectUnauthorized: false
      }
    });

    // Verify the connection
    await transporter.verify();
    console.log('✅ Email configuration is valid!');
    
    // Send a test email
    const testMailOptions = {
      from: emailUser,
      to: emailUser, // Send to self for testing
      subject: 'BlueCarbon Email Configuration Test',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #1976d2, #4caf50); padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">🌊 BlueCarbon Ledger</h1>
          </div>
          
          <div style="padding: 30px; background: #f9f9f9;">
            <h2 style="color: #333;">Email Configuration Test</h2>
            
            <p>Congratulations! Your email configuration is working correctly.</p>
            
            <div style="background: white; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
              <h3 style="color: #1976d2; margin: 0;">✅ Email Service Active</h3>
            </div>
            
            <p><strong>Configuration Details:</strong></p>
            <ul>
              <li>Email Service: Gmail</li>
              <li>Sender: ${emailUser}</li>
              <li>Status: Active and Ready</li>
              <li>Test Time: ${new Date().toISOString()}</li>
            </ul>
            
            <p>Your BlueCarbon application can now send verification emails for password changes and other notifications.</p>
            
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;">
            
            <p style="color: #666; font-size: 12px;">
              This is a test email from BlueCarbon Ledger Email Configuration Setup.
            </p>
          </div>
        </div>
      `
    };

    await transporter.sendMail(testMailOptions);
    console.log('✅ Test email sent successfully!');
    console.log(`   Check your inbox at ${emailUser}`);
    
    return true;
  } catch (error) {
    console.error('❌ Email configuration test failed:', error.message);
    
    if (error.code === 'EAUTH') {
      console.log('\n🔧 Authentication Error - Please check:');
      console.log('   1. Email address is correct');
      console.log('   2. App Password is correct (not your regular Gmail password)');
      console.log('   3. 2-Factor Authentication is enabled on Gmail');
      console.log('   4. App Password was generated specifically for this app');
    } else if (error.code === 'ENOTFOUND') {
      console.log('\n🔧 Network Error - Please check your internet connection');
    } else {
      console.log('\n🔧 Error Details:', error);
    }
    
    return false;
  }
};

// Update .env file with email configuration
const updateEnvFile = (emailUser, emailPass) => {
  try {
    const envPath = path.join(__dirname, '../.env');
    let envContent = fs.readFileSync(envPath, 'utf8');
    
    // Update EMAIL_USER
    if (envContent.includes('EMAIL_USER=')) {
      envContent = envContent.replace(/EMAIL_USER=.*/, `EMAIL_USER=${emailUser}`);
    } else {
      envContent += `\nEMAIL_USER=${emailUser}`;
    }
    
    // Update EMAIL_PASS
    if (envContent.includes('EMAIL_PASS=')) {
      envContent = envContent.replace(/EMAIL_PASS=.*/, `EMAIL_PASS=${emailPass}`);
    } else {
      envContent += `\nEMAIL_PASS=${emailPass}`;
    }
    
    // Set NODE_ENV to production for real emails
    if (envContent.includes('NODE_ENV=')) {
      envContent = envContent.replace(/NODE_ENV=.*/, 'NODE_ENV=production');
    } else {
      envContent += '\nNODE_ENV=production';
    }
    
    fs.writeFileSync(envPath, envContent);
    console.log('✅ .env file updated successfully');
    
  } catch (error) {
    console.error('❌ Failed to update .env file:', error.message);
  }
};

// Main setup function
const setupEmail = async () => {
  console.log('🚀 BlueCarbon Email Configuration Setup\n');
  
  const emailUser = 'mundliyayug@gmail.com';
  
  console.log('📧 Email Configuration:');
  console.log(`   Email: ${emailUser}`);
  console.log('   Service: Gmail');
  console.log('\n⚠️  IMPORTANT: You need to provide the Gmail App Password');
  console.log('   This is NOT your regular Gmail password!');
  console.log('\n📋 To get your Gmail App Password:');
  console.log('   1. Go to https://myaccount.google.com/');
  console.log('   2. Click "Security" in the left sidebar');
  console.log('   3. Enable "2-Step Verification" if not already enabled');
  console.log('   4. Click "App passwords"');
  console.log('   5. Select "Mail" and "Other (Custom name)"');
  console.log('   6. Enter "BlueCarbon Ledger" as the app name');
  console.log('   7. Copy the generated 16-character password');
  console.log('\n🔑 Please enter your Gmail App Password:');
  
  // In a real setup, you would prompt for the password
  // For now, we'll show instructions
  console.log('\n📝 Manual Setup Instructions:');
  console.log('   1. Get your Gmail App Password (see instructions above)');
  console.log('   2. Update backend/.env file:');
  console.log(`      EMAIL_USER=${emailUser}`);
  console.log('      EMAIL_PASS=your-16-character-app-password');
  console.log('      NODE_ENV=production');
  console.log('   3. Restart the backend server');
  console.log('   4. Test the password change feature');
  
  console.log('\n🧪 To test email configuration after setup:');
  console.log('   node scripts/test-email-config.js');
};

// Run setup if called directly
if (require.main === module) {
  setupEmail();
}

module.exports = { testEmailConfig, updateEnvFile, setupEmail };