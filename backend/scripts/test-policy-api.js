const axios = require('axios');

const BASE_URL = 'http://localhost:8000/api/policies';

// Test functions
const testGetAllPolicies = async () => {
  try {
    console.log('🧪 Testing GET /api/policies...');
    const response = await axios.get(BASE_URL);
    console.log('✅ GET all policies:', response.data.success ? 'SUCCESS' : 'FAILED');
    console.log(`   Found ${response.data.count} policies`);
    return response.data.data;
  } catch (error) {
    console.log('❌ GET all policies: FAILED');
    console.log('   Error:', error.message);
    return [];
  }
};

const testGetSpecificPolicy = async (policyId) => {
  try {
    console.log(`🧪 Testing GET /api/policies/${policyId}...`);
    const response = await axios.get(`${BASE_URL}/${policyId}`);
    console.log('✅ GET specific policy:', response.data.success ? 'SUCCESS' : 'FAILED');
    console.log(`   Policy: ${response.data.data.name}`);
    return response.data.data;
  } catch (error) {
    console.log('❌ GET specific policy: FAILED');
    console.log('   Error:', error.message);
    return null;
  }
};

const testCreatePolicy = async () => {
  try {
    console.log('🧪 Testing POST /api/policies...');
    const newPolicy = {
      name: 'Test Blue Carbon Policy',
      description: 'A test policy for API validation',
      status: 'draft',
      version: '1.0',
      ministry: 'Test Ministry',
      type: 'Test Policy',
      scope: 'Test Scope',
      applicableStates: 'Test States',
      content: 'Test policy content for validation purposes.',
      legalBasis: 'Test Legal Basis',
      enforcementAgency: 'Test Agency',
      penalties: 'Test Penalties'
    };
    
    const response = await axios.post(BASE_URL, newPolicy);
    console.log('✅ POST create policy:', response.data.success ? 'SUCCESS' : 'FAILED');
    console.log(`   Created policy ID: ${response.data.data.id}`);
    return response.data.data;
  } catch (error) {
    console.log('❌ POST create policy: FAILED');
    console.log('   Error:', error.message);
    return null;
  }
};

const testUpdatePolicy = async (policyId) => {
  try {
    console.log(`🧪 Testing PUT /api/policies/${policyId}...`);
    const updateData = {
      name: 'Updated Test Blue Carbon Policy',
      description: 'An updated test policy for API validation',
      status: 'active'
    };
    
    const response = await axios.put(`${BASE_URL}/${policyId}`, updateData);
    console.log('✅ PUT update policy:', response.data.success ? 'SUCCESS' : 'FAILED');
    console.log(`   Updated policy: ${response.data.data.name}`);
    return response.data.data;
  } catch (error) {
    console.log('❌ PUT update policy: FAILED');
    console.log('   Error:', error.message);
    return null;
  }
};

const testSearchPolicies = async (query) => {
  try {
    console.log(`🧪 Testing GET /api/policies/search/${query}...`);
    const response = await axios.get(`${BASE_URL}/search/${query}`);
    console.log('✅ GET search policies:', response.data.success ? 'SUCCESS' : 'FAILED');
    console.log(`   Found ${response.data.count} policies matching "${query}"`);
    return response.data.data;
  } catch (error) {
    console.log('❌ GET search policies: FAILED');
    console.log('   Error:', error.message);
    return [];
  }
};

const testFilterPolicies = async (status) => {
  try {
    console.log(`🧪 Testing GET /api/policies/filter/status/${status}...`);
    const response = await axios.get(`${BASE_URL}/filter/status/${status}`);
    console.log('✅ GET filter policies:', response.data.success ? 'SUCCESS' : 'FAILED');
    console.log(`   Found ${response.data.count} policies with status "${status}"`);
    return response.data.data;
  } catch (error) {
    console.log('❌ GET filter policies: FAILED');
    console.log('   Error:', error.message);
    return [];
  }
};

const testDeletePolicy = async (policyId) => {
  try {
    console.log(`🧪 Testing DELETE /api/policies/${policyId}...`);
    const response = await axios.delete(`${BASE_URL}/${policyId}`);
    console.log('✅ DELETE policy:', response.data.success ? 'SUCCESS' : 'FAILED');
    console.log(`   Deleted policy: ${response.data.data.name}`);
    return true;
  } catch (error) {
    console.log('❌ DELETE policy: FAILED');
    console.log('   Error:', error.message);
    return false;
  }
};

// Main test runner
const runAllTests = async () => {
  console.log('🚀 Starting Policy Management API Tests...\n');
  
  // Test 1: Get all policies
  const policies = await testGetAllPolicies();
  console.log('');
  
  if (policies.length > 0) {
    // Test 2: Get specific policy
    await testGetSpecificPolicy(policies[0].id);
    console.log('');
    
    // Test 3: Search policies
    await testSearchPolicies('mangrove');
    console.log('');
    
    // Test 4: Filter policies by status
    await testFilterPolicies('active');
    console.log('');
  }
  
  // Test 5: Create new policy
  const newPolicy = await testCreatePolicy();
  console.log('');
  
  if (newPolicy) {
    // Test 6: Update the created policy
    await testUpdatePolicy(newPolicy.id);
    console.log('');
    
    // Test 7: Delete the created policy
    await testDeletePolicy(newPolicy.id);
    console.log('');
  }
  
  console.log('🏁 Policy Management API Tests Complete!');
};

// Run tests if called directly
if (require.main === module) {
  runAllTests().catch(error => {
    console.error('❌ Test runner failed:', error.message);
    process.exit(1);
  });
}

module.exports = { runAllTests };