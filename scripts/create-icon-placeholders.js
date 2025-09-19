const fs = require('fs');
const path = require('path');

// Create directories if they don't exist
const dirs = [
  'public',
  'dist/extension/icons',
  'src/extension/icons'
];

dirs.forEach(dir => {
  const fullPath = path.join(__dirname, '..', dir);
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true });
    console.log(`Created directory: ${fullPath}`);
  }
});

// Simple SVG with mosquito emoji
const createSVG = (size) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">
  <defs>
    <linearGradient id="bg${size}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#667eea;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#764ba2;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="${size}" height="${size}" fill="url(#bg${size})" rx="${size * 0.1}" />
  <circle cx="${size/2}" cy="${size/2}" r="${size * 0.4}" fill="rgba(255, 255, 255, 0.1)" />
  <text x="${size/2}" y="${size * 0.58}" font-family="Arial" font-size="${size * 0.5}" text-anchor="middle" fill="white">🦟</text>
</svg>`;

// Icon sizes needed
const iconSizes = [16, 32, 48, 96, 128, 192, 512];

// Generate SVG icons
iconSizes.forEach(size => {
  const svg = createSVG(size);

  // Save to public directory
  fs.writeFileSync(path.join(__dirname, '..', 'public', `icon-${size}.svg`), svg);
  console.log(`Created icon-${size}.svg`);

  // Also create specific named versions
  if (size === 16) {
    fs.writeFileSync(path.join(__dirname, '..', 'public', 'favicon-16x16.svg'), svg);
  }
  if (size === 32) {
    fs.writeFileSync(path.join(__dirname, '..', 'public', 'favicon-32x32.svg'), svg);
  }
  if (size === 192) {
    fs.writeFileSync(path.join(__dirname, '..', 'public', 'icon-192.svg'), svg);
  }
  if (size === 512) {
    fs.writeFileSync(path.join(__dirname, '..', 'public', 'icon-512.svg'), svg);
  }
});

// Create Apple Touch Icon
const appleSVG = createSVG(180);
fs.writeFileSync(path.join(__dirname, '..', 'public', 'apple-touch-icon.svg'), appleSVG);
console.log('Created apple-touch-icon.svg');

// Create OG Image (larger with text)
const ogSVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630" width="1200" height="630">
  <defs>
    <linearGradient id="ogBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#667eea;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#764ba2;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#ogBg)" />
  <rect x="50" y="50" width="1100" height="530" fill="none" stroke="rgba(255,255,255,0.2)" stroke-width="2" rx="20" />
  <text x="600" y="250" font-family="Arial" font-size="180" text-anchor="middle" fill="white">🦟</text>
  <text x="600" y="380" font-family="Arial, sans-serif" font-size="72" font-weight="bold" text-anchor="middle" fill="white">Mosqit</text>
  <text x="600" y="450" font-family="Arial, sans-serif" font-size="32" text-anchor="middle" fill="rgba(255,255,255,0.9)">AI-Powered Debugging Assistant for Chrome</text>
  <text x="600" y="510" font-family="Arial, sans-serif" font-size="24" text-anchor="middle" fill="rgba(255,255,255,0.7)">Debug Smarter with Chrome's Built-in AI</text>
</svg>`;

fs.writeFileSync(path.join(__dirname, '..', 'public', 'og-image.svg'), ogSVG);
fs.writeFileSync(path.join(__dirname, '..', 'public', 'twitter-image.svg'), ogSVG);
console.log('Created og-image.svg and twitter-image.svg');

// Copy to extension directories
const extensionSizes = [16, 48, 128];
extensionSizes.forEach(size => {
  const svg = createSVG(size);
  const distPath = path.join(__dirname, '..', 'dist', 'extension', 'icons', `icon${size}.svg`);
  fs.writeFileSync(distPath, svg);
  console.log(`Created extension icon: icon${size}.svg`);
});

console.log('\n✅ All SVG assets created successfully!');
console.log('Note: These are SVG files. For production, you may want to convert them to PNG.');
console.log('You can use online tools or Chrome DevTools to export them as PNG files.');