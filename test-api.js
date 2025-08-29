const http = require('http');

function testAPI(endpoint) {
  return new Promise((resolve, reject) => {
    const req = http.request(`http://localhost:8001${endpoint}`, (res) => {
      let data = '';
      
      console.log(`Testing ${endpoint}:`);
      console.log('Status:', res.statusCode);
      console.log('Content-Type:', res.headers['content-type']);
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          console.log('Response:', JSON.stringify(jsonData, null, 2));
          resolve(jsonData);
        } catch (error) {
          console.log('Raw response:', data);
          console.log('Error parsing JSON:', error.message);
          reject(error);
        }
      });
    });
    
    req.on('error', (error) => {
      console.log('Request error:', error.message);
      reject(error);
    });
    
    req.end();
  });
}

async function runTests() {
  try {
    console.log('Testing API endpoints...\n');
    
    // Test portfolio personal endpoint
    await testAPI('/api/portfolio/personal');
    console.log('\n' + '='.repeat(50) + '\n');
    
    // Test resume URLs endpoint
    await testAPI('/api/resume/urls');
    
  } catch (error) {
    console.error('Test failed:', error.message);
  }
}

runTests();
