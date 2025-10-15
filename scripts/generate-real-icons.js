#!/usr/bin/env node

/**
 * Generate real PNG icons for Mosqit extension
 * Uses Canvas to create actual icon files (not placeholders)
 */

const fs = require('fs');
const path = require('path');

// Try to require canvas, fallback to manual instructions
let Canvas, createCanvas;
try {
  const canvas = require('canvas');
  Canvas = canvas.Canvas;
  createCanvas = canvas.createCanvas;
  console.log('✅ Canvas library loaded');
} catch (err) {
  console.error('❌ Canvas library not found. Installing...');
  console.log('Run: npm install canvas');
  console.log('\nAlternative: Use the web-based generator instead:');
  console.log('1. Open: http://localhost:3000/generate-assets.html');
  console.log('2. Download: icon-16.png, icon-48.png, icon-128.png');
  console.log('3. Copy to: dist/extension/icons/');
  process.exit(1);
}

const iconsDir = path.join(process.cwd(), 'dist', 'extension', 'icons');

// Ensure icons directory exists
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true});
}

console.log('🦟 Generating Mosqit PNG icons...\n');

// Icon configuration
const BRAND_COLORS = {
  primary: '#667eea',
  secondary: '#764ba2',
  white: '#ffffff'
};

function generateIcon(size) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');

  // Create gradient background
  const gradient = ctx.createLinearGradient(0, 0, size, size);
  gradient.addColorStop(0, BRAND_COLORS.primary);
  gradient.addColorStop(1, BRAND_COLORS.secondary);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);

  // Add subtle circle background
  ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
  ctx.beginPath();
  ctx.arc(size / 2, size / 2, size * 0.4, 0, 2 * Math.PI);
  ctx.fill();

  // Draw "M" letter for Mosqit (better than emoji for small sizes)
  ctx.fillStyle = BRAND_COLORS.white;
  ctx.font = `bold ${size * 0.6}px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('M', size / 2, size / 2);

  // Save to file
  const buffer = canvas.toBuffer('image/png');
  const filename = `icon${size}.png`;
  const filepath = path.join(iconsDir, filename);

  fs.writeFileSync(filepath, buffer);

  // Verify file size
  const stats = fs.statSync(filepath);
  console.log(`✅ Generated ${filename} (${stats.size} bytes)`);

  return filepath;
}

// Generate all required icon sizes
const sizes = [16, 48, 128];

try {
  sizes.forEach(size => generateIcon(size));

  console.log('\n🎉 All icons generated successfully!');
  console.log(`📁 Location: ${iconsDir}`);
  console.log('\n📋 Next steps:');
  console.log('1. Rebuild extension: npm run build:extension');
  console.log('2. Create new ZIP: npm run zip:extension');
  console.log('3. Resubmit to Chrome Web Store');

} catch (error) {
  console.error('\n❌ Error generating icons:', error.message);
  console.log('\n💡 Alternative solution:');
  console.log('1. Start dev server: npm run dev');
  console.log('2. Open: http://localhost:3000/generate-assets.html');
  console.log('3. Download icons manually');
  console.log('4. Copy to: dist/extension/icons/');
  process.exit(1);
}
