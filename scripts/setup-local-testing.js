const fs = require('fs');
const path = require('path');

console.log('🚀 Setting up local testing environment...\n');

// Create a test MongoDB URI (using MongoDB Atlas free tier)
const testMongoURI = 'mongodb+srv://testuser:testpass123@cluster0.mongodb.net/inventory_test?retryWrites=true&w=majority';

// Create .env.test file
const envTestContent = `# Test Environment Configuration
MONGODB_URI=${testMongoURI}
PORT=5000
JWT_SECRET=test-jwt-secret-key-for-development
NODE_ENV=test
`;

// Create .env.local file for local testing
const envLocalContent = `# Local Testing Configuration
MONGODB_URI=mongodb://localhost:27017/inventory_management
PORT=5000
JWT_SECRET=local-jwt-secret-key-for-development
NODE_ENV=development
`;

try {
  // Write .env.test file
  fs.writeFileSync('.env.test', envTestContent);
  console.log('✅ Created .env.test file');
  
  // Write .env.local file
  fs.writeFileSync('.env.local', envLocalContent);
  console.log('✅ Created .env.local file');
  
  console.log('\n📋 Setup complete!');
  console.log('\nTo use local testing:');
  console.log('1. Install MongoDB locally or use MongoDB Atlas');
  console.log('2. Run: cp .env.local .env');
  console.log('3. Run: npm run dev');
  console.log('\nTo use test environment:');
  console.log('1. Run: cp .env.test .env');
  console.log('2. Run: npm run dev');
  
} catch (error) {
  console.error('❌ Error setting up environment:', error.message);
} 