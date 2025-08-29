const axios = require('axios');

async function testResumeAPI() {
  try {
    console.log('Testing resume API endpoints...');
    
    // Test the portfolio personal endpoint
    console.log('\n1. Testing /api/portfolio/personal:');
    const portfolioResponse = await axios.get('http://localhost:8001/api/portfolio/personal');
    console.log('Status:', portfolioResponse.status);
    console.log('Data:', JSON.stringify(portfolioResponse.data, null, 2));
    
    // Test the resume URLs endpoint
    console.log('\n2. Testing /api/resume/urls:');
    const resumeResponse = await axios.get('http://localhost:8001/api/resume/urls');
    console.log('Status:', resumeResponse.status);
    console.log('Data:', JSON.stringify(resumeResponse.data, null, 2));
    
  } catch (error) {
    console.error('Error testing API:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

testResumeAPI();
