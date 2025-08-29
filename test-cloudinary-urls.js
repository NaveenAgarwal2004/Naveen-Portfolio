// Test the Cloudinary URLs from the API response
const urls = {
  general: "https://res.cloudinary.com/dtor3nqkz/raw/upload/v1755793785/portfolio/resumes/naveen-general-resume-1755793785566",
  frontend: "", // This was empty in the response
  backend: ""    // This was empty in the response
};

console.log("Testing Cloudinary URLs:");
console.log("General Resume URL:", urls.general);
console.log("Frontend Resume URL:", urls.frontend || "Not available");
console.log("Backend Resume URL:", urls.backend || "Not available");

// Test if the general URL is accessible
if (urls.general) {
  console.log("\nTesting general resume URL accessibility...");
  const https = require('https');
  
  https.get(urls.general, (res) => {
    console.log(`General URL Status: ${res.statusCode}`);
    console.log(`Content-Type: ${res.headers['content-type']}`);
    
    if (res.statusCode === 200) {
      console.log("✅ General resume URL is accessible and working!");
    } else {
      console.log("❌ General resume URL returned non-200 status");
    }
  }).on('error', (err) => {
    console.log("❌ General resume URL error:", err.message);
  });
} else {
  console.log("\nNo general resume URL to test");
}
