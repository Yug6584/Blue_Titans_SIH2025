console.log('🔍 Debugging nodemailer import...\n');

try {
  console.log('1. Attempting to require nodemailer...');
  const nodemailer = require('nodemailer');
  
  console.log('2. Nodemailer object:', typeof nodemailer);
  console.log('3. Available methods:', Object.keys(nodemailer));
  
  if (nodemailer.createTransporter) {
    console.log('✅ createTransporter method exists');
  } else if (nodemailer.createTransport) {
    console.log('✅ createTransport method exists (correct method name)');
  } else {
    console.log('❌ Neither createTransporter nor createTransport found');
  }
  
  console.log('4. Full nodemailer object:', nodemailer);
  
} catch (error) {
  console.error('❌ Error importing nodemailer:', error);
}