#!/usr/bin/env node

/**
 * Generate all Chrome Web Store submission assets
 * Creates HTML files that render and download PNG images
 */

const fs = require('fs');
const path = require('path');

console.log('🎨 Generating Chrome Web Store Assets...\n');

const publicDir = path.join(__dirname, '..', 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Template for HTML generator
const createGeneratorHTML = (title, width, height, filename, svgContent) => {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${title}</title>
  <style>
    body {
      margin: 0;
      padding: 20px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #f0f0f0;
      display: flex;
      flex-direction: column;
      align-items: center;
      min-height: 100vh;
    }
    .container {
      max-width: ${Math.min(width + 100, 1200)}px;
      background: white;
      padding: 30px;
      border-radius: 12px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.1);
      margin-bottom: 20px;
    }
    h1 {
      color: #667eea;
      margin: 0 0 20px 0;
    }
    .preview {
      text-align: center;
      margin: 30px 0;
      padding: 20px;
      background: #f8f9fa;
      border-radius: 8px;
      overflow: auto;
    }
    canvas {
      border: 2px solid #667eea;
      border-radius: 8px;
      max-width: 100%;
      height: auto;
    }
    button {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      padding: 15px 30px;
      border-radius: 8px;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      margin: 10px;
      box-shadow: 0 2px 10px rgba(102, 126, 234, 0.3);
      transition: transform 0.2s;
    }
    button:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
    }
    button:active {
      transform: translateY(0);
    }
    .specs {
      background: #e8f4f8;
      padding: 20px;
      border-radius: 8px;
      margin: 20px 0;
      border-left: 4px solid #667eea;
    }
    .specs h3 {
      margin-top: 0;
      color: #667eea;
    }
    .specs p {
      margin: 8px 0;
      color: #2d3748;
    }
    .success {
      background: #d4edda;
      color: #155724;
      padding: 15px;
      border-radius: 8px;
      margin: 20px 0;
      display: none;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>🦟 ${title}</h1>

    <div class="specs">
      <h3>📏 Specifications</h3>
      <p><strong>Dimensions:</strong> ${width}x${height} pixels</p>
      <p><strong>Format:</strong> PNG (24-bit, no alpha for screenshots)</p>
      <p><strong>Filename:</strong> ${filename}</p>
      <p><strong>Use:</strong> Chrome Web Store submission</p>
    </div>

    <div class="preview">
      <canvas id="canvas" width="${width}" height="${height}"></canvas>
    </div>

    <div style="text-align: center;">
      <button onclick="downloadPNG()">📥 Download PNG</button>
      <button onclick="regenerate()">🔄 Regenerate</button>
    </div>

    <div id="success" class="success">
      ✅ Downloaded successfully! Upload this file to Chrome Web Store.
    </div>
  </div>

  <script>
    ${svgContent}

    function regenerate() {
      generateImage();
    }

    function downloadPNG() {
      const canvas = document.getElementById('canvas');
      canvas.toBlob(function(blob) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = '${filename}';
        a.click();
        URL.revokeObjectURL(url);

        // Show success message
        document.getElementById('success').style.display = 'block';
        setTimeout(() => {
          document.getElementById('success').style.display = 'none';
        }, 3000);
      }, 'image/png');
    }

    // Auto-generate on load
    window.onload = generateImage;
  </script>
</body>
</html>`;
};

// 1. STORE ICON (128x128)
const storeIconJS = `
function generateImage() {
  const canvas = document.getElementById('canvas');
  const ctx = canvas.getContext('2d');

  // Clear
  ctx.clearRect(0, 0, 128, 128);

  // Gradient background
  const gradient = ctx.createLinearGradient(0, 0, 128, 128);
  gradient.addColorStop(0, '#667eea');
  gradient.addColorStop(1, '#764ba2');

  // Draw rounded rectangle
  const radius = 12.8;
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.moveTo(radius, 0);
  ctx.lineTo(128 - radius, 0);
  ctx.quadraticCurveTo(128, 0, 128, radius);
  ctx.lineTo(128, 128 - radius);
  ctx.quadraticCurveTo(128, 128, 128 - radius, 128);
  ctx.lineTo(radius, 128);
  ctx.quadraticCurveTo(0, 128, 0, 128 - radius);
  ctx.lineTo(0, radius);
  ctx.quadraticCurveTo(0, 0, radius, 0);
  ctx.closePath();
  ctx.fill();

  // Subtle circle overlay
  ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
  ctx.beginPath();
  ctx.arc(64, 64, 51.2, 0, Math.PI * 2);
  ctx.fill();

  // Mosquito emoji
  ctx.font = '64px Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = 'white';
  ctx.fillText('🦟', 64, 68);
}`;

fs.writeFileSync(
  path.join(publicDir, 'chrome-store-icon-128.html'),
  createGeneratorHTML('Store Icon (128x128)', 128, 128, 'mosqit-icon-128x128.png', storeIconJS)
);
console.log('✅ Generated: chrome-store-icon-128.html');

// 2. SMALL PROMO TILE (440x280)
const smallPromoJS = `
function generateImage() {
  const canvas = document.getElementById('canvas');
  const ctx = canvas.getContext('2d');

  // Clear
  ctx.clearRect(0, 0, 440, 280);

  // Gradient background
  const gradient = ctx.createLinearGradient(0, 0, 440, 280);
  gradient.addColorStop(0, '#667eea');
  gradient.addColorStop(1, '#764ba2');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 440, 280);

  // Subtle pattern overlay
  for (let i = 0; i < 10; i++) {
    for (let j = 0; j < 6; j++) {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.03)';
      ctx.beginPath();
      ctx.arc(i * 50 + 25, j * 50 + 25, 15, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Logo
  ctx.font = '80px Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillStyle = 'white';
  ctx.fillText('🦟', 220, 100);

  // Title
  ctx.font = 'bold 36px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillStyle = 'white';
  ctx.fillText('Mosqit', 220, 155);

  // Tagline
  ctx.font = '16px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
  ctx.fillText('AI Console, Instant & Private', 220, 185);

  // Feature badges
  const badges = ['⚡ <100ms', '🔒 Private', '🌍 Offline'];
  const badgeY = 230;
  const badgeSpacing = 140;
  const startX = 80;

  badges.forEach((badge, i) => {
    const x = startX + (i * badgeSpacing);

    // Badge background
    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.roundRect(x - 50, badgeY - 15, 100, 30, 15);
    ctx.fill();

    // Badge text
    ctx.font = '14px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillStyle = 'white';
    ctx.textAlign = 'center';
    ctx.fillText(badge, x, badgeY + 3);
  });
}

// Polyfill for roundRect if not available
if (!CanvasRenderingContext2D.prototype.roundRect) {
  CanvasRenderingContext2D.prototype.roundRect = function(x, y, w, h, r) {
    if (w < 2 * r) r = w / 2;
    if (h < 2 * r) r = h / 2;
    this.beginPath();
    this.moveTo(x + r, y);
    this.arcTo(x + w, y, x + w, y + h, r);
    this.arcTo(x + w, y + h, x, y + h, r);
    this.arcTo(x, y + h, x, y, r);
    this.arcTo(x, y, x + w, y, r);
    this.closePath();
    return this;
  };
}`;

fs.writeFileSync(
  path.join(publicDir, 'chrome-store-promo-440x280.html'),
  createGeneratorHTML('Small Promo Tile (440x280)', 440, 280, 'mosqit-promo-440x280.png', smallPromoJS)
);
console.log('✅ Generated: chrome-store-promo-440x280.html');

// 3. MARQUEE PROMO TILE (1400x560)
const marqueePromoJS = `
function generateImage() {
  const canvas = document.getElementById('canvas');
  const ctx = canvas.getContext('2d');

  // Clear
  ctx.clearRect(0, 0, 1400, 560);

  // Gradient background
  const gradient = ctx.createLinearGradient(0, 0, 1400, 560);
  gradient.addColorStop(0, '#667eea');
  gradient.addColorStop(1, '#764ba2');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 1400, 560);

  // Pattern overlay
  for (let i = 0; i < 30; i++) {
    for (let j = 0; j < 12; j++) {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.02)';
      ctx.beginPath();
      ctx.arc(i * 50 + 25, j * 50 + 25, 20, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Container box
  ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
  ctx.roundRect(80, 80, 1240, 400, 20);
  ctx.fill();

  // Logo
  ctx.font = '120px Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillStyle = 'white';
  ctx.fillText('🦟', 700, 200);

  // Main title
  ctx.font = 'bold 56px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillStyle = 'white';
  ctx.fillText('Mosqit - AI-Powered Developer Console', 700, 280);

  // Subtitle
  ctx.font = '28px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
  ctx.fillText('Chrome DevTools Console Insights, but instant and private', 700, 320);

  // Feature badges (4 across)
  const badges = [
    { icon: '⚡', text: '<100ms Analysis' },
    { icon: '🔒', text: '100% Private' },
    { icon: '🌍', text: 'Works Offline' },
    { icon: '🌐', text: 'Global Access' }
  ];

  const badgeWidth = 250;
  const badgeHeight = 80;
  const badgeSpacing = 280;
  const startX = 190;
  const badgeY = 375;

  badges.forEach((badge, i) => {
    const x = startX + (i * badgeSpacing);

    // Badge background
    ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.roundRect(x, badgeY, badgeWidth, badgeHeight, 12);
    ctx.fill();

    // Icon
    ctx.font = '36px Arial, sans-serif';
    ctx.fillStyle = 'white';
    ctx.textAlign = 'center';
    ctx.fillText(badge.icon, x + badgeWidth / 2, badgeY + 35);

    // Text
    ctx.font = 'bold 18px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillStyle = 'white';
    ctx.fillText(badge.text, x + badgeWidth / 2, badgeY + 62);
  });

  // Call to action
  ctx.font = 'bold 24px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillStyle = 'white';
  ctx.textAlign = 'center';
  ctx.fillText('Install Free', 700, 530);
}

// Polyfill for roundRect
if (!CanvasRenderingContext2D.prototype.roundRect) {
  CanvasRenderingContext2D.prototype.roundRect = function(x, y, w, h, r) {
    if (w < 2 * r) r = w / 2;
    if (h < 2 * r) r = h / 2;
    this.beginPath();
    this.moveTo(x + r, y);
    this.arcTo(x + w, y, x + w, y + h, r);
    this.arcTo(x + w, y + h, x, y + h, r);
    this.arcTo(x, y + h, x, y, r);
    this.arcTo(x, y, x + w, y, r);
    this.closePath();
    return this;
  };
}`;

fs.writeFileSync(
  path.join(publicDir, 'chrome-store-marquee-1400x560.html'),
  createGeneratorHTML('Marquee Promo Tile (1400x560)', 1400, 560, 'mosqit-marquee-1400x560.png', marqueePromoJS)
);
console.log('✅ Generated: chrome-store-marquee-1400x560.html');

// 4. CREATE A MASTER INDEX FOR EASY ACCESS
const indexHTML = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Mosqit Chrome Store Asset Generator</title>
  <style>
    body {
      margin: 0;
      padding: 40px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
    }
    .container {
      max-width: 900px;
      margin: 0 auto;
      background: white;
      padding: 40px;
      border-radius: 16px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.2);
    }
    h1 {
      color: #667eea;
      margin: 0 0 10px 0;
      font-size: 42px;
    }
    .subtitle {
      color: #718096;
      margin: 0 0 40px 0;
      font-size: 18px;
    }
    .asset-grid {
      display: grid;
      gap: 20px;
    }
    .asset-card {
      border: 2px solid #e2e8f0;
      border-radius: 12px;
      padding: 24px;
      transition: all 0.3s;
    }
    .asset-card:hover {
      border-color: #667eea;
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.2);
      transform: translateY(-2px);
    }
    .asset-card h3 {
      color: #2d3748;
      margin: 0 0 10px 0;
      font-size: 20px;
    }
    .asset-card p {
      color: #718096;
      margin: 0 0 20px 0;
      font-size: 14px;
    }
    .asset-card a {
      display: inline-block;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      text-decoration: none;
      padding: 12px 24px;
      border-radius: 8px;
      font-weight: 600;
      transition: transform 0.2s;
    }
    .asset-card a:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
    }
    .status {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 600;
      margin-left: 10px;
    }
    .required {
      background: #fed7d7;
      color: #9b2c2c;
    }
    .recommended {
      background: #feebc8;
      color: #7c2d12;
    }
    .footer {
      margin-top: 40px;
      padding-top: 30px;
      border-top: 2px solid #e2e8f0;
      color: #718096;
      font-size: 14px;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>🦟 Mosqit Asset Generator</h1>
    <p class="subtitle">Generate all Chrome Web Store submission assets</p>

    <div class="asset-grid">
      <div class="asset-card">
        <h3>Store Icon <span class="status required">REQUIRED</span></h3>
        <p>128x128 pixels • PNG format • Main extension icon</p>
        <a href="chrome-store-icon-128.html">Generate Icon →</a>
      </div>

      <div class="asset-card">
        <h3>Small Promo Tile <span class="status required">REQUIRED</span></h3>
        <p>440x280 pixels • PNG format • Store listing promotional tile</p>
        <a href="chrome-store-promo-440x280.html">Generate Promo Tile →</a>
      </div>

      <div class="asset-card">
        <h3>Marquee Promo Tile <span class="status recommended">RECOMMENDED</span></h3>
        <p>1400x560 pixels • PNG format • Featured promotional banner</p>
        <a href="chrome-store-marquee-1400x560.html">Generate Marquee →</a>
      </div>
    </div>

    <div class="footer">
      <h4>📸 Screenshots (Up to 5 required)</h4>
      <p>You'll need to manually capture screenshots of the extension in action:</p>
      <ul>
        <li><strong>Dimensions:</strong> 1280x800 or 640x400 pixels</li>
        <li><strong>Format:</strong> JPEG or 24-bit PNG (no alpha transparency)</li>
        <li><strong>Content:</strong> Show actual extension functionality</li>
      </ul>
      <p>Refer to: <code>store/SCREENSHOTS_GUIDE.md</code> for detailed instructions</p>
    </div>
  </div>
</body>
</html>`;

fs.writeFileSync(
  path.join(publicDir, 'chrome-store-assets.html'),
  indexHTML
);
console.log('✅ Generated: chrome-store-assets.html (Master Index)');

console.log('\n✨ All generators created successfully!\n');
console.log('📋 Next Steps:');
console.log('1. Start your development server: npm run dev');
console.log('2. Open: http://localhost:3000/chrome-store-assets.html');
console.log('3. Generate and download each asset');
console.log('4. Upload to Chrome Web Store Developer Console\n');
console.log('📁 Files created:');
console.log('   - chrome-store-icon-128.html');
console.log('   - chrome-store-promo-440x280.html');
console.log('   - chrome-store-marquee-1400x560.html');
console.log('   - chrome-store-assets.html (master index)');
console.log('\n🎨 For screenshots, refer to: store/SCREENSHOTS_GUIDE.md');
