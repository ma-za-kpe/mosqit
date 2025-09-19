#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-require-imports */
/* eslint-disable @typescript-eslint/no-unused-vars */

/**
 * Package script for Mosqit Chrome Extension
 */

const fs = require('fs');
const path = require('path');

console.log('📦 Packaging Chrome Extension...');

const extensionDir = path.join(process.cwd(), 'dist', 'extension');
const outputDir = path.join(process.cwd(), 'dist');

// Check if extension directory exists
if (!fs.existsSync(extensionDir)) {
  console.error('❌ Extension directory not found. Run "npm run build:extension" first.');
  process.exit(1);
}

// Get version from package.json
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const version = packageJson.version || '1.0.0';

console.log(`✅ Extension ready for packaging!`);
console.log(`📁 Extension directory: ${extensionDir}`);
console.log(`📌 Version: ${version}`);
console.log(`💡 To create a ZIP file, compress the contents of the extension directory.`);