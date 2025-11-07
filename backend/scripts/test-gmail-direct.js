const nodemailer = require('nodemailer');
require('dotenv').config();

const testGmailDirect = async () => {
  console.log('🧪 Testing Gmail Configuration Directly\n');
  
  const emailUser = process.env.EMAIL_USER;
  const emailPass = process.env.EMAIL_PASS;
  
  console.log('📧 Configuration:');
  console.log(`   Email: ${emailUser}`);
  console.log(`   Password: ${emailPass ? emailPass.replace(/./g, '*') : 'Not set'}`);
  console.log(`   Password Length: ${emailPass ? emailPass.length : 0} characters`);
  console.log('');
  
  try {
    console.log('🔧 Creating transporter...');
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: emailUser,
        pass: emailPass
      },
      debug: true, // Enable debug output
      logger: true // Enable logging
    });
    
    console.log('✅ Transporter created successfully');
    
    console.log('🔍 Verifying connection...');
    await transporter.verify();
    console.log('✅ Connection verified successfully');
    
    console.log('📤 Sending test email...');
    const info = await transporter.sendMail({
      from: emailUser,
      to: 'mundliyayug@gmail.com',
      subject: 'BlueCarbon Test Email',
      html: `
        <h2>🌊 BlueCarbon Email Test</h2>
        <p>This is a test email to verify Gmail configuration.</p>
        <p><strong>Test Code:</strong> 123456</p>
        <p>Time: ${new Date().toISOString()}</p>
      `
    });
    
    console.log('✅ Email sent successfully!');
    console.log('   Message ID:', info.messageId);
    console.log('   Response:', info.response);
    
  } catch (error) {
    console.error('❌ Gmail test failed:', error.message);
    
    if (error.code === 'EAUTH') {
      console.log('\n🔧 Authentication failed. Possible issues:');
      console.log('   1. App Password is incorrect');
      console.log('   2. 2-Factor Authentication not enabled');
      console.log('   3. App Password not generated properly');
      console.log('   4. Gmail account security settings');
    } else if (error.code === 'ENOTFOUND') {
      console.log('\n🔧 Network error - check internet connection');
    } else {
      console.log('\n🔧 Full error details:', error);
    }
  }
};

// Run test
testGmailDirect();