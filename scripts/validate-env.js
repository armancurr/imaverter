#!/usr/bin/env node

// Environment validation script
const fs = require('fs');
const path = require('path');

console.log('🔍 Validating Imaverter Environment...\n');

// Check if .env.local exists
const envPath = path.join(process.cwd(), '.env.local');
const envExamplePath = path.join(process.cwd(), '.env.example');

if (!fs.existsSync(envPath)) {
  console.error('❌ Missing .env.local file');
  
  if (fs.existsSync(envExamplePath)) {
    console.log('💡 Found .env.example file. Copy it to .env.local and fill in your Cloudinary credentials:');
    console.log('   cp .env.example .env.local');
  } else {
    console.log('💡 Create a .env.local file with your Cloudinary credentials:');
    console.log(`
CLOUDINARY_CLOUD_NAME=your_cloud_name_here
CLOUDINARY_API_KEY=your_api_key_here
CLOUDINARY_API_SECRET=your_api_secret_here
`);
  }
  process.exit(1);
}

// Load environment variables manually
require('dotenv').config({ path: envPath });

const requiredVars = [
  'CLOUDINARY_CLOUD_NAME',
  'CLOUDINARY_API_KEY', 
  'CLOUDINARY_API_SECRET'
];

let allValid = true;

console.log('📋 Environment Variables Status:');
for (const varName of requiredVars) {
  const value = process.env[varName];
  if (value && value.trim() && value !== 'your_cloud_name_here' && value !== 'your_api_key_here' && value !== 'your_api_secret_here') {
    console.log(`✅ ${varName}: SET`);
  } else {
    console.log(`❌ ${varName}: NOT SET OR PLACEHOLDER`);
    allValid = false;
  }
}

if (!allValid) {
  console.log('\n🔗 Get your Cloudinary credentials from: https://cloudinary.com/console');
  console.log('📖 See SETUP.md for detailed instructions');
  process.exit(1);
}

console.log('\n✅ All environment variables are properly configured!');
console.log('🚀 You can now restart your development server.');