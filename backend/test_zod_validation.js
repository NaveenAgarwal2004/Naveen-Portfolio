// Quick test to verify Zod validation works
const { z } = require('zod');

// Test: Personal Schema
const { personalSchema } = require('./src/validators/personalValidator');

console.log('🧪 Testing Zod Validators...\n');

// Test 1: Valid data
console.log('✅ Test 1: Valid personal data');
try {
  const validData = {
    name: 'Naveen Agarwal',
    title: 'Full-Stack Developer',
    tagline: 'Building modern web applications',
    bio: 'Passionate developer with expertise in MERN stack',
    email: 'naveen@example.com',
    skills: [
      { name: 'React', level: 90 },
      { name: 'Node.js', level: 85 }
    ]
  };
  
  const result = personalSchema.parse(validData);
  console.log('   ✓ Validation passed!\n');
} catch (error) {
  console.log('   ✗ Validation failed:', error.issues || error.message);
}

// Test 2: Invalid email
console.log('✅ Test 2: Invalid email');
try {
  const invalidData = {
    name: 'Naveen Agarwal',
    title: 'Full-Stack Developer',
    tagline: 'Building modern web applications',
    bio: 'Passionate developer with expertise in MERN stack',
    email: 'not-an-email',
    skills: [{ name: 'React', level: 90 }]
  };
  
  personalSchema.parse(invalidData);
  console.log('   ✗ Should have failed!\n');
} catch (error) {
  if (error.issues && error.issues.length > 0) {
    console.log('   ✓ Correctly caught error:', error.issues[0].message, '\n');
  } else {
    console.log('   ✓ Error caught:', error.message, '\n');
  }
}

// Test 3: Missing required field
console.log('✅ Test 3: Missing required field (name)');
try {
  const missingData = {
    title: 'Developer',
    tagline: 'Building modern web applications',
    bio: 'Passionate developer with expertise in MERN stack',
    email: 'naveen@example.com',
    skills: [{ name: 'React', level: 90 }]
  };
  
  personalSchema.parse(missingData);
  console.log('   ✗ Should have failed!\n');
} catch (error) {
  if (error.issues && error.issues.length > 0) {
    console.log('   ✓ Correctly caught error:', error.issues[0].message, '\n');
  } else {
    console.log('   ✓ Error caught\n');
  }
}

// Test: Project Schema
const { createProjectSchema } = require('./src/validators/projectValidator');

console.log('✅ Test 4: Valid project data');
try {
  const validProject = {
    title: 'Awesome Project',
    description: 'This is a detailed description of the project',
    category: 'Web',
    techStack: ['React', 'Node.js', 'MongoDB'],
    featured: false
  };
  
  createProjectSchema.parse(validProject);
  console.log('   ✓ Validation passed!\n');
} catch (error) {
  console.log('   ✗ Validation failed:', error.issues || error.message);
}

console.log('🎉 All Zod validation tests completed!');
