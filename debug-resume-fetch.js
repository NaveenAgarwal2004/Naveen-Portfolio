// Simple test to debug what the frontend is receiving
const https = require('https');

function testFrontendFetch() {
  console.log('Testing frontend fetch simulation...');
  
  const options = {
    hostname: 'localhost',
    port: 8001,
    path: '/api/portfolio/personal',
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    }
  };

  const req = https.request(options, (res) => {
    console.log('Status Code:', res.statusCode);
    console.log('Headers:', JSON.stringify(res.headers, null, 2));
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      console.log('Response Body:', data);
      
      try {
        const jsonData = JSON.parse(data);
        console.log('Parsed JSON:', JSON.stringify(jsonData, null, 2));
        
        // Check what resume URLs are available
        console.log('\nResume URL Analysis:');
        console.log('frontendResumeUrl:', jsonData.data.frontendResumeUrl || 'NOT AVAILABLE');
        console.log('backendResumeUrl:', jsonData.data.backendResumeUrl || 'NOT AVAILABLE');
        console.log('resumeUrl:', jsonData.data.resumeUrl || 'NOT AVAILABLE');
        console.log('frontendResume.url:', jsonData.data.frontendResume?.url || 'NOT AVAILABLE');
        console.log('backendResume.url:', jsonData.data.backendResume?.url || 'NOT AVAILABLE');
        console.log('generalResume.url:', jsonData.data.generalResume?.url || 'NOT AVAILABLE');
        
      } catch (error) {
        console.log('Failed to parse JSON:', error.message);
        console.log('Raw response:', data);
      }
    });
  });

  req.on('error', (error) => {
    console.log('Request error:', error.message);
  });

  req.end();
}

testFrontendFetch();
