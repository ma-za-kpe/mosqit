const fs = require('fs');
const path = require('path');

// Create SVG for hackathon submission (1200x630 social media size)
const createSubmissionSVG = () => {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630" width="1200" height="630">
  <!-- Gradient Background -->
  <defs>
    <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#667eea;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#764ba2;stop-opacity:1" />
    </linearGradient>

    <!-- Subtle pattern overlay -->
    <pattern id="pattern" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
      <circle cx="50" cy="50" r="30" fill="white" fill-opacity="0.05" />
    </pattern>

    <!-- Shadow filter -->
    <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur in="SourceAlpha" stdDeviation="3"/>
      <feOffset dx="0" dy="2" result="offsetblur"/>
      <feComponentTransfer>
        <feFuncA type="linear" slope="0.3"/>
      </feComponentTransfer>
      <feMerge>
        <feMergeNode/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>

  <!-- Background -->
  <rect width="1200" height="630" fill="url(#bgGradient)" />
  <rect width="1200" height="630" fill="url(#pattern)" />

  <!-- Container -->
  <rect x="100" y="65" width="1000" height="500" fill="rgba(255, 255, 255, 0.1)" rx="20" />

  <!-- Logo -->
  <text x="600" y="220" font-family="Arial, sans-serif" font-size="150" text-anchor="middle" fill="white" filter="url(#shadow)">🦟</text>

  <!-- Title -->
  <text x="600" y="320" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="75" font-weight="bold" text-anchor="middle" fill="white">Mosqit</text>

  <!-- Tagline -->
  <text x="600" y="365" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="26" text-anchor="middle" fill="rgba(255, 255, 255, 0.95)">AI-Driven Frontend Debugging Chrome Extension</text>

  <!-- Sub-tagline -->
  <text x="600" y="400" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="22" text-anchor="middle" fill="rgba(255, 255, 255, 0.9)">Buzz through frontend bugs with Chrome's built-in AI</text>

  <!-- Challenge Badge -->
  <rect x="400" y="440" width="400" height="50" fill="#FFB800" rx="25" />
  <text x="600" y="471" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="20" font-weight="bold" text-anchor="middle" fill="white">🏆 Chrome Built-in AI Challenge 2025</text>

  <!-- Feature badges -->
  <g transform="translate(240, 530)">
    <!-- Badge 1 -->
    <rect x="0" y="0" width="180" height="40" fill="rgba(255, 255, 255, 0.2)" rx="20" />
    <text x="90" y="26" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="16" text-anchor="middle" fill="white">🚀 &lt;100ms Response</text>

    <!-- Badge 2 -->
    <rect x="240" y="0" width="180" height="40" fill="rgba(255, 255, 255, 0.2)" rx="20" />
    <text x="330" y="26" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="16" text-anchor="middle" fill="white">🔒 100% On-Device</text>

    <!-- Badge 3 -->
    <rect x="480" y="0" width="180" height="40" fill="rgba(255, 255, 255, 0.2)" rx="20" />
    <text x="570" y="26" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="16" text-anchor="middle" fill="white">🤖 Gemini Nano AI</text>
  </g>
</svg>`;
};

// Create feature showcase SVG
const createFeatureSVG = () => {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 1080" width="1920" height="1080">
  <defs>
    <linearGradient id="bgGradientLight" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#f7fafc;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#e2e8f0;stop-opacity:1" />
    </linearGradient>
  </defs>

  <!-- Background -->
  <rect width="1920" height="1080" fill="url(#bgGradientLight)" />

  <!-- Header -->
  <rect x="0" y="0" width="1920" height="160" fill="#667eea" />

  <!-- Logo and Title -->
  <text x="100" y="110" font-family="Arial, sans-serif" font-size="80" fill="white">🦟</text>
  <text x="220" y="105" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="60" font-weight="bold" fill="white">Mosqit</text>
  <text x="1820" y="105" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="26" text-anchor="end" fill="rgba(255, 255, 255, 0.9)">Chrome Built-in AI Challenge 2025</text>

  <!-- Main Title -->
  <text x="960" y="260" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="48" font-weight="bold" text-anchor="middle" fill="#2d3748">Revolutionary AI-Powered Debugging</text>

  <!-- Feature Cards -->
  <g transform="translate(150, 350)">
    <!-- Card 1 -->
    <rect x="0" y="0" width="500" height="250" fill="white" rx="15" filter="drop-shadow(0 4px 6px rgba(0,0,0,0.1))" />
    <text x="250" y="80" font-family="Arial" font-size="60" text-anchor="middle" fill="#667eea">🤖</text>
    <text x="250" y="140" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="28" font-weight="bold" text-anchor="middle" fill="#2d3748">Writer API</text>
    <text x="250" y="180" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="20" text-anchor="middle" fill="#718096">Structured bug reports</text>

    <!-- Card 2 -->
    <rect x="550" y="0" width="500" height="250" fill="white" rx="15" filter="drop-shadow(0 4px 6px rgba(0,0,0,0.1))" />
    <text x="800" y="80" font-family="Arial" font-size="60" text-anchor="middle" fill="#667eea">💡</text>
    <text x="800" y="140" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="28" font-weight="bold" text-anchor="middle" fill="#2d3748">Prompt API</text>
    <text x="800" y="180" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="20" text-anchor="middle" fill="#718096">Complex analysis</text>

    <!-- Card 3 -->
    <rect x="1100" y="0" width="500" height="250" fill="white" rx="15" filter="drop-shadow(0 4px 6px rgba(0,0,0,0.1))" />
    <text x="1350" y="80" font-family="Arial" font-size="60" text-anchor="middle" fill="#667eea">📊</text>
    <text x="1350" y="140" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="28" font-weight="bold" text-anchor="middle" fill="#2d3748">Summarizer API</text>
    <text x="1350" y="180" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="20" text-anchor="middle" fill="#718096">Pattern detection</text>
  </g>

  <!-- Second row of cards -->
  <g transform="translate(150, 650)">
    <!-- Card 4 -->
    <rect x="0" y="0" width="500" height="250" fill="white" rx="15" filter="drop-shadow(0 4px 6px rgba(0,0,0,0.1))" />
    <text x="250" y="80" font-family="Arial" font-size="60" text-anchor="middle" fill="#667eea">⚡</text>
    <text x="250" y="140" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="28" font-weight="bold" text-anchor="middle" fill="#2d3748">&lt;100ms Response</text>
    <text x="250" y="180" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="20" text-anchor="middle" fill="#718096">Real-time analysis</text>

    <!-- Card 5 -->
    <rect x="550" y="0" width="500" height="250" fill="white" rx="15" filter="drop-shadow(0 4px 6px rgba(0,0,0,0.1))" />
    <text x="800" y="80" font-family="Arial" font-size="60" text-anchor="middle" fill="#667eea">🔒</text>
    <text x="800" y="140" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="28" font-weight="bold" text-anchor="middle" fill="#2d3748">100% Private</text>
    <text x="800" y="180" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="20" text-anchor="middle" fill="#718096">On-device processing</text>

    <!-- Card 6 -->
    <rect x="1100" y="0" width="500" height="250" fill="white" rx="15" filter="drop-shadow(0 4px 6px rgba(0,0,0,0.1))" />
    <text x="1350" y="80" font-family="Arial" font-size="60" text-anchor="middle" fill="#667eea">🎯</text>
    <text x="1350" y="140" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="28" font-weight="bold" text-anchor="middle" fill="#2d3748">Smart Detection</text>
    <text x="1350" y="180" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="20" text-anchor="middle" fill="#718096">Framework-specific</text>
  </g>

  <!-- Footer -->
  <rect x="0" y="970" width="1920" height="110" fill="#667eea" />
  <text x="960" y="1035" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="26" text-anchor="middle" fill="white">🚀 Transform your debugging experience with AI-driven insights from DevTools</text>
</svg>`;
};

// Save SVG files
const publicDir = path.join(__dirname, '..', 'public');

// Create hackathon submission image (1200x630)
fs.writeFileSync(
  path.join(publicDir, 'mosqit-hackathon-submission.svg'),
  createSubmissionSVG()
);
console.log('✅ Created mosqit-hackathon-submission.svg (1200x630)');

// Create feature showcase image (1920x1080)
fs.writeFileSync(
  path.join(publicDir, 'mosqit-features-showcase.svg'),
  createFeatureSVG()
);
console.log('✅ Created mosqit-features-showcase.svg (1920x1080)');

console.log('\n📸 Hackathon submission images generated successfully!');
console.log('You can find them in the public folder:');
console.log('  - mosqit-hackathon-submission.svg (Social media size)');
console.log('  - mosqit-features-showcase.svg (Full HD presentation)');
console.log('\nTo convert to PNG, you can use online tools or Chrome DevTools.');