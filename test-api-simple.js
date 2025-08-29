async function testAPI() {
  try {
    console.log('Testing API endpoint...');
    const response = await fetch('http://localhost:8001/api/portfolio/personal');
    
    console.log('Status:', response.status);
    console.log('Headers:', Object.fromEntries([...response.headers]));
    
    const contentType = response.headers.get('content-type');
    console.log('Content-Type:', contentType);
    
    const text = await response.text();
    console.log('Response length:', text.length);
    console.log('First 200 chars:', text.substring(0, 200));
    
    try {
      const data = JSON.parse(text);
      console.log('JSON parsed successfully');
      console.log('Success:', data.success);
    } catch (parseError) {
      console.error('JSON parse failed:', parseError.message);
    }
  } catch (error) {
    console.error('Fetch error:', error.message);
  }
}

testAPI();
