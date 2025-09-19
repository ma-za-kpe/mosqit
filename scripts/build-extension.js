#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-require-imports */
/* eslint-disable @typescript-eslint/no-unused-vars */

/**
 * Build script for Mosqit Chrome Extension
 */

const fs = require('fs');
const path = require('path');

console.log('🔨 Building Chrome Extension...');

// Create dist/extension directory if it doesn't exist
const distDir = path.join(process.cwd(), 'dist');
const extensionDir = path.join(distDir, 'extension');

if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir);
}

if (!fs.existsSync(extensionDir)) {
  fs.mkdirSync(extensionDir);
}

// Create a placeholder manifest.json for now
const manifest = {
  manifest_version: 3,
  name: 'Mosqit - AI Debugging Assistant',
  version: '1.0.0',
  description: 'AI-powered frontend debugging with Chrome built-in AI',
  permissions: [
    'storage',
    'tabs',
    'debugger'
  ],
  host_permissions: [
    'http://localhost:3000/*',
    'https://mosqit.vercel.app/*'
  ],
  background: {
    service_worker: 'background.js',
    type: 'module'
  },
  action: {
    default_popup: 'popup.html',
    default_icon: {
      '16': 'icons/icon16.png',
      '48': 'icons/icon48.png',
      '128': 'icons/icon128.png'
    }
  },
  icons: {
    '16': 'icons/icon16.png',
    '48': 'icons/icon48.png',
    '128': 'icons/icon128.png'
  }
};

// Write manifest.json
fs.writeFileSync(
  path.join(extensionDir, 'manifest.json'),
  JSON.stringify(manifest, null, 2)
);

// Create placeholder files
const placeholderHTML = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Mosqit</title>
  <style>
    body { width: 350px; padding: 20px; font-family: system-ui; }
    h1 { font-size: 18px; margin: 0 0 10px 0; }
    p { color: #666; font-size: 14px; }
  </style>
</head>
<body>
  <h1>🦟 Mosqit</h1>
  <p>AI-powered debugging assistant</p>
  <p style="color: #999; font-size: 12px;">Extension setup in progress...</p>
</body>
</html>`;

fs.writeFileSync(path.join(extensionDir, 'popup.html'), placeholderHTML);

// Create placeholder background.js
const backgroundJS = `// Mosqit Chrome Extension Background Script
console.log('Mosqit extension loaded');

chrome.runtime.onInstalled.addListener(() => {
  console.log('Mosqit extension installed');
});`;

fs.writeFileSync(path.join(extensionDir, 'background.js'), backgroundJS);

// Create icons directory
const iconsDir = path.join(extensionDir, 'icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir);
}

// Create placeholder icons (simple colored squares for now)
const createIcon = (size, color) => {
  // This is a simple SVG icon placeholder
  return `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${size}" height="${size}" fill="${color}"/>
  <text x="50%" y="50%" font-family="Arial" font-size="${size/3}" fill="white" text-anchor="middle" dy=".3em">M</text>
</svg>`;
};

// For now, we'll just create placeholder text files for icons
// In production, these would be actual PNG files
fs.writeFileSync(path.join(iconsDir, 'icon16.png'), 'Icon placeholder 16x16');
fs.writeFileSync(path.join(iconsDir, 'icon48.png'), 'Icon placeholder 48x48');
fs.writeFileSync(path.join(iconsDir, 'icon128.png'), 'Icon placeholder 128x128');

console.log('✅ Chrome Extension build complete!');
console.log(`📁 Output directory: ${extensionDir}`);