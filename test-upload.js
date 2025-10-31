const fs = require('fs');
const FormData = require('form-data');
const axios = require('axios');

// Configuration
const API_URL = 'http://localhost:3000/api/uploads';
const JWT_TOKEN = 'YOUR_JWT_TOKEN'; // Replace with a valid token

// Sample files to test
const TEST_FILES = [
  { name: 'image', path: './test-files/test.jpg', type: 'image/jpeg' },
  { name: 'video', path: './test-files/test.mp4', type: 'video/mp4' },
  { name: 'audio', path: './test-files/test.mp3', type: 'audio/mpeg' },
  { name: 'pdf', path: './test-files/test.pdf', type: 'application/pdf' }
];

async function testUpload(file) {
  console.log(`\nTesting upload for ${file.name} (${file.type})...`);
  
  try {
    // Read the file
    const fileData = fs.readFileSync(file.path);
    
    // Create form data
    const form = new FormData();
    form.append('file', fileData, {
      filename: file.path.split('/').pop(),
      contentType: file.type
    });

    // Make the request
    const response = await axios.post(API_URL, form, {
      headers: {
        ...form.getHeaders(),
        'Authorization': `Bearer ${JWT_TOKEN}`,
      },
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
    });

    const { url, secure_url, publicId, resourceType } = response.data;
    
    console.log('✅ Upload successful!');
    console.log('Resource Type:', resourceType);
    console.log('Public ID:', publicId);
    console.log('URL:', url);
    
    // Verify the URL is accessible
    try {
      const check = await axios.head(secure_url || url);
      console.log(`🔗 URL is accessible (Status: ${check.status})`);
    } catch (error) {
      console.error('❌ URL verification failed:', error.message);
    }
    
    return { success: true, data: response.data };
  } catch (error) {
    console.error('❌ Upload failed:', error.response?.data || error.message);
    return { success: false, error };
  }
}

async function runTests() {
  console.log('🚀 Starting Cloudinary Upload Tests\n');
  
  // Create test files directory if it doesn't exist
  if (!fs.existsSync('./test-files')) {
    fs.mkdirSync('./test-files');
    console.log('⚠️  Please add test files to the test-files/ directory');
    return;
  }
  
  // Run tests for each file type
  let allPassed = true;
  const results = [];
  
  for (const file of TEST_FILES) {
    if (!fs.existsSync(file.path)) {
      console.log(`⚠️  Skipping ${file.name}: File not found at ${file.path}`);
      continue;
    }
    
    const result = await testUpload(file);
    results.push({ ...file, ...result });
    
    if (!result.success) {
      allPassed = false;
    }
    
    // Add a small delay between tests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  // Print summary
  console.log('\n📊 Test Summary:');
  console.log('='.repeat(50));
  results.forEach((test, index) => {
    console.log(`
${index + 1}. ${test.name.toUpperCase()}: ${test.success ? '✅ PASSED' : '❌ FAILED'}`);
    if (test.error) {
      console.log('   Error:', test.error.response?.data?.errors?.[0]?.msg || test.error.message);
    } else {
      console.log('   URL:', test.data.secure_url || test.data.url);
    }
  });
  
  console.log('\n' + '='.repeat(50));
  console.log(`\n🏁 ${allPassed ? 'ALL TESTS PASSED!' : 'SOME TESTS FAILED'}\n`);
  
  if (!allPassed) {
    process.exit(1); // Exit with error code if any test failed
  }
}

// Run the tests
runTests().catch(console.error);
