const axios = require('axios');

const BASE_URL = 'http://localhost:8000';

// Test the password reset functionality
const testPasswordReset = async () => {
  try {
    console.log('🧪 Testing Password Reset API...\n');

    // First, we need to login to get a token
    console.log('1. Logging in to get authentication token...');
    const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
      email: 'yugadmin@gmail.com',
      password: '@Samyakadmin'
    });

    if (!loginResponse.data.success) {
      console.log('❌ Login failed:', loginResponse.data.message);
      return;
    }

    const token = loginResponse.data.token;
    console.log('✅ Login successful');

    // Test requesting verification code
    console.log('\n2. Requesting verification code...');
    const verificationResponse = await axios.post(
      `${BASE_URL}/api/password/request-verification`,
      {},
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (verificationResponse.data.success) {
      console.log('✅ Verification code request successful');
      console.log('   Email:', verificationResponse.data.email);
      
      if (verificationResponse.data.devCode) {
        console.log('   Dev Code:', verificationResponse.data.devCode);
        
        // Test changing password with the dev code
        console.log('\n3. Testing password change...');
        const passwordChangeResponse = await axios.post(
          `${BASE_URL}/api/password/change-password`,
          {
            verificationCode: verificationResponse.data.devCode,
            newPassword: 'newpassword123',
            confirmPassword: 'newpassword123'
          },
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );

        if (passwordChangeResponse.data.success) {
          console.log('✅ Password change successful');
          console.log('   Message:', passwordChangeResponse.data.message);
          
          // Change password back to original
          console.log('\n4. Reverting password back to original...');
          const revertResponse = await axios.post(
            `${BASE_URL}/api/password/request-verification`,
            {},
            {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            }
          );
          
          if (revertResponse.data.success && revertResponse.data.devCode) {
            await axios.post(
              `${BASE_URL}/api/password/change-password`,
              {
                verificationCode: revertResponse.data.devCode,
                newPassword: '@Samyakadmin',
                confirmPassword: '@Samyakadmin'
              },
              {
                headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json'
                }
              }
            );
            console.log('✅ Password reverted to original');
          }
        } else {
          console.log('❌ Password change failed:', passwordChangeResponse.data.message);
        }
      }
    } else {
      console.log('❌ Verification code request failed:', verificationResponse.data.message);
    }

    // Test verification status
    console.log('\n5. Checking verification status...');
    const statusResponse = await axios.get(
      `${BASE_URL}/api/password/verification-status`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (statusResponse.data.success) {
      console.log('✅ Verification status check successful');
      console.log('   Has Active Code:', statusResponse.data.hasActiveCode);
      if (statusResponse.data.hasActiveCode) {
        console.log('   Time Remaining:', statusResponse.data.timeRemaining, 'seconds');
        console.log('   Email:', statusResponse.data.email);
      }
    }

    console.log('\n🏁 Password Reset API Test Complete!');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data?.message || error.message);
  }
};

// Run test if called directly
if (require.main === module) {
  testPasswordReset();
}

module.exports = { testPasswordReset };