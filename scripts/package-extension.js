#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-require-imports */
/* eslint-disable @typescript-eslint/no-unused-vars */

/**
 * Package script for Mosqit Chrome Extension
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

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

const zipFileName = `mosqit-extension-v${version}.zip`;
const zipFilePath = path.join(outputDir, zipFileName);

// Remove existing zip if it exists
if (fs.existsSync(zipFilePath)) {
  fs.unlinkSync(zipFilePath);
}

try {
  // Try to create actual ZIP file using available commands
  if (process.platform === 'win32') {
    // Windows: Try PowerShell
    try {
      execSync(`powershell -Command "Compress-Archive -Path '${extensionDir}\\*' -DestinationPath '${zipFilePath}' -Force"`, { stdio: 'pipe' });
      console.log('✅ Created ZIP using PowerShell');
    } catch (e) {
      // Fallback: Try tar (available on Windows 10+)
      execSync(`tar -a -cf "${zipFilePath}" -C "${extensionDir}" .`, { stdio: 'pipe' });
      console.log('✅ Created ZIP using tar');
    }
  } else {
    // Unix/Linux/Mac: Use zip or tar
    try {
      execSync(`cd "${extensionDir}" && zip -r "${zipFilePath}" .`, { stdio: 'pipe' });
      console.log('✅ Created ZIP using zip command');
    } catch (e) {
      // Fallback to tar
      execSync(`tar -czf "${zipFilePath}" -C "${extensionDir}" .`, { stdio: 'pipe' });
      console.log('✅ Created archive using tar');
    }
  }

  // Verify the file was created
  if (fs.existsSync(zipFilePath)) {
    const stats = fs.statSync(zipFilePath);
    console.log(`📦 Extension packaged successfully!`);
    console.log(`📁 Output: ${zipFilePath}`);
    console.log(`📏 Size: ${(stats.size / 1024).toFixed(2)} KB`);
    console.log(`📌 Version: ${version}`);
  } else {
    throw new Error('ZIP file was not created');
  }
} catch (error) {
  console.error('❌ Failed to create ZIP file:', error.message);
  console.log('💡 Creating a basic archive for CI/CD...');

  // Last resort: Create a tar file manually
  const archivePath = path.join(outputDir, `mosqit-extension-v${version}.tar`);
  try {
    execSync(`tar -cf "${archivePath}" -C "${extensionDir}" .`, { stdio: 'pipe' });
    console.log(`📦 Created tar archive: ${archivePath}`);
  } catch (e) {
    console.error('❌ Could not create any archive format');
    process.exit(1);
  }
}