const http = require('http');

function testResumeUrls() {
  console.log('Testing resume URLs from API...');
  
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

  const req = http.request(options, (res) => {
    let data = '';
    
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      try {
        const jsonData = JSON.parse(data);
        
        console.log('Frontend Resume URL:', jsonData.data.frontendResumeUrl);
        console.log('Backend Resume URL:', jsonData.data.backendResumeUrl);
        console.log('General Resume URL:', jsonData.data.resumeUrl);
        
        // Test if URLs are accessible
        console.log('\nTesting URL accessibility...');
        testUrlAccessibility(jsonData.data.frontendResumeUrl, 'Frontend Resume');
        testUrlAccessibility(jsonData.data.backendResumeUrl, 'Backend Resume');
        testUrlAccessibility(jsonData.data.resumeUrl, 'General Resume');
        
      } catch (error) {
        console.log('Failed to parse JSON:', error.message);
      }
    });
  });

  req.on('error', (error) => {
    console.log('Request error:', error.message);
  });

  req.end();
}

function testUrlAccessibility(url, label) {
  if (!url) {
    console.log(`${label}: No URL available`);
    return;
  }
  
  const https = require('https');
  console.log(`Testing ${label}: ${url}`);
  
  https.get(url, (res) => {
    console.log(`${label} Status: ${res.statusCode}`);
    if (res.statusCode === 200) {
      console.log(`✅ ${label} is accessible!`);
    } else {
      console.log(`❌ ${label} returned status: ${res.statusCode}`);
    }
  }).on('error', (err) => {
    console.log(`❌ ${label} error: ${err.message}`);
  });
}

testResumeUrls();
