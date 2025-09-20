#!/usr/bin/env node

/**
 * Bump version in both package.json and manifest.json
 * Usage: node scripts/bump-version.js [major|minor|patch]
 */

const fs = require('fs');
const path = require('path');

const type = process.argv[2] || 'patch';

// Read package.json
const packagePath = path.join(process.cwd(), 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));

// Read manifest.json
const manifestPath = path.join(process.cwd(), 'dist', 'extension', 'manifest.json');
const manifestJson = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

// Parse current version
const [major, minor, patch] = packageJson.version.split('.').map(Number);

// Calculate new version
let newVersion;
switch (type) {
  case 'major':
    newVersion = `${major + 1}.0.0`;
    break;
  case 'minor':
    newVersion = `${major}.${minor + 1}.0`;
    break;
  case 'patch':
  default:
    newVersion = `${major}.${minor}.${patch + 1}`;
    break;
}

console.log(`📦 Bumping version: ${packageJson.version} → ${newVersion}`);

// Update package.json
packageJson.version = newVersion;
fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2) + '\n');

// Update manifest.json
manifestJson.version = newVersion;
fs.writeFileSync(manifestPath, JSON.stringify(manifestJson, null, 2) + '\n');

console.log('✅ Version updated in:');
console.log('   - package.json');
console.log('   - manifest.json');
console.log('\n📋 Next steps:');
console.log(`   git add -A`);
console.log(`   git commit -m "Release v${newVersion}"`);
console.log(`   git tag v${newVersion}`);
console.log(`   git push origin main --tags`);
console.log('\nThis will trigger automatic publishing to Chrome Web Store!');