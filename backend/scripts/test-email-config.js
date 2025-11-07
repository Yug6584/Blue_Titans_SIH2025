const { testEmailConfig } = require('./setup-email');
require('dotenv').config();

const testCurrentEmailConfig = async () => {
  console.log('🧪 Testing Current Email Configuration\n');
  
  const emailUser = process.env.EMAIL_USER;
  const emailPass = process.env.EMAIL_PASS;
  
  if (!emailUser || !emailPass || emailPass === 'your-app-password-here') {
    console.log('❌ Email configuration not found or incomplete');
    console.log('\n📋 Current .env values:');
    console.log(`   EMAIL_USER: ${emailUser || 'Not set'}`);
    console.log(`   EMAIL_PASS: ${emailPass ? '***configured***' : 'Not set'}`);
    console.log(`   NODE_ENV: ${process.env.NODE_ENV || 'Not set'}`);
    console.log('\n🔧 Please run: node scripts/setup-email.js');
    return;
  }
  
  console.log('📧 Testing email configuration...');
  console.log(`   Email: ${emailUser}`);
  console.log(`   Password: ${'*'.repeat(emailPass.length)} (hidden)`);
  console.log(`   Environment: ${process.env.NODE_ENV}`);
  console.log('');
  
  const success = await testEmailConfig(emailUser, emailPass);
  
  if (success) {
    console.log('\n🎉 Email configuration is working perfectly!');
    console.log('   You can now use the password change feature with real emails.');
  } else {
    console.log('\n❌ Email configuration needs to be fixed.');
    console.log('   Please check the error messages above and update your configuration.');
  }
};

// Run test if called directly
if (require.main === module) {
  testCurrentEmailConfig();
}

module.exports = { testCurrentEmailConfig };