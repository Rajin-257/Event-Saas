/**
 * Initialization script for the Auth App
 * This script creates required directories and checks environment variables
 */

const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Define required directories
const requiredDirs = [
  'public/uploads',
  'public/uploads/avatars',
  'logs'
];

// Create directories if they don't exist
console.log('Initializing application directories...');
requiredDirs.forEach(dir => {
  const dirPath = path.join(__dirname, dir);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`Created directory: ${dir}`);
  } else {
    console.log(`Directory already exists: ${dir}`);
  }
});

// Check for required environment variables
console.log('\nChecking environment variables...');
const requiredEnvVars = [
  'DB_HOST',
  'DB_USER',
  'DB_PASSWORD',
  'DB_NAME',
  'JWT_SECRET'
];

let missingVars = false;
requiredEnvVars.forEach(varName => {
  if (!process.env[varName]) {
    console.error(`Missing required environment variable: ${varName}`);
    missingVars = true;
  }
});

if (missingVars) {
  console.error('\nPlease set all required environment variables in the .env file');
  console.error('See .env.example for a template');
} else {
  console.log('All required environment variables are set');
}

console.log('\nInitialization complete!');
console.log('Run "npm start" to start the application');