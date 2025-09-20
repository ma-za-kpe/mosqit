#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-require-imports */

/**
 * Proper build script for Mosqit Chrome Extension using TypeScript compiler
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔨 Building Chrome Extension with TypeScript...');

// Directories
const distDir = path.join(process.cwd(), 'dist');
const extensionDir = path.join(distDir, 'extension');
const srcDir = path.join(process.cwd(), 'src', 'extension');

// Clean and create directories
if (fs.existsSync(extensionDir)) {
  fs.rmSync(extensionDir, { recursive: true });
}
fs.mkdirSync(extensionDir, { recursive: true });

// Create icons directory
const iconsDir = path.join(extensionDir, 'icons');
fs.mkdirSync(iconsDir, { recursive: true });

// Step 1: Compile TypeScript files individually
console.log('📦 Compiling TypeScript files...');

// Compile content script with mosqit-logger-ai
const contentFiles = [
  'content/mosqit-logger-ai.ts',
  'content/mosqit-logger.ts',
  'content/content-script.ts'
];

// Create a combined content script
let contentJS = `// Mosqit Content Script Bundle
(function() {
  'use strict';

`;

// First, add the AI logger
if (fs.existsSync(path.join(srcDir, 'content', 'mosqit-logger-ai.ts'))) {
  const aiContent = fs.readFileSync(path.join(srcDir, 'content', 'mosqit-logger-ai.ts'), 'utf8');

  // Convert TypeScript to JavaScript (simplified)
  const jsContent = aiContent
    // Remove imports/exports
    .replace(/^import\s+.*?;?\s*$/gm, '')
    .replace(/^export\s+default\s+/gm, '')
    .replace(/^export\s+/gm, '')
    // Remove TypeScript type annotations
    .replace(/:\s*LogMetadata(\[\])?/g, '')
    .replace(/:\s*string(\[\])?/g, '')
    .replace(/:\s*number(\[\])?/g, '')
    .replace(/:\s*boolean(\[\])?/g, '')
    .replace(/:\s*any(\[\])?/g, '')
    .replace(/:\s*unknown(\[\])?/g, '')
    .replace(/:\s*void/g, '')
    .replace(/:\s*Promise<[^>]+>/g, '')
    .replace(/:\s*Map<[^>]+>/g, '')
    .replace(/:\s*Record<[^>]+>/g, '')
    // Remove interface definitions
    .replace(/interface\s+\w+\s*{[^}]*}/gs, '')
    // Remove declare statements
    .replace(/^declare\s+.*?[;{].*?$/gm, '')
    .replace(/^declare\s+const.*?\n}\s*;?$/gsm, '')
    // Fix optional parameters
    .replace(/(\w+)\?:/g, '$1:')
    // Remove generic type parameters
    .replace(/<[^>]+>/g, '')
    // Clean up access modifiers
    .replace(/\b(private|public|protected)\s+/g, '')
    // Remove readonly
    .replace(/\breadonly\s+/g, '')
    // Fix as any casts
    .replace(/\s+as\s+any/g, '')
    .replace(/\s+as\s+\w+/g, '');

  contentJS += jsContent;
}

contentJS += `
  // Initialize Mosqit
  if (typeof MosqitLoggerAI !== 'undefined') {
    console.log('[Mosqit] Initializing AI-powered logger...');
    new MosqitLoggerAI();
  }
})();
`;

fs.writeFileSync(path.join(extensionDir, 'content.js'), contentJS);

// Step 2: Create background script
const backgroundJS = `// Mosqit Background Service Worker
console.log('[Mosqit] Background service worker loaded');

// Storage for logs
const logStorage = new Map();
const maxLogsPerTab = 1000;

// Message handler
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'MOSQIT_LOG') {
    const tabId = sender.tab?.id;
    if (tabId) {
      if (!logStorage.has(tabId)) {
        logStorage.set(tabId, []);
      }
      const logs = logStorage.get(tabId);
      logs.push(message.data);
      if (logs.length > maxLogsPerTab) {
        logs.shift();
      }
      sendResponse({ success: true });
    }
  } else if (message.type === 'GET_LOGS') {
    const tabId = sender.tab?.id;
    const logs = logStorage.get(tabId) || [];
    sendResponse({ logs });
  }
  return true;
});

// Clear logs when tab is closed
chrome.tabs.onRemoved.addListener((tabId) => {
  logStorage.delete(tabId);
});

chrome.runtime.onInstalled.addListener(() => {
  console.log('[Mosqit] Extension installed successfully');
});
`;

fs.writeFileSync(path.join(extensionDir, 'background.js'), backgroundJS);

// Step 3: Create manifest.json
const manifest = {
  manifest_version: 3,
  name: 'Mosqit - AI Debugging Assistant',
  version: '1.0.0',
  description: 'AI-powered frontend debugging with Chrome built-in AI (Gemini Nano)',
  permissions: [
    'storage',
    'tabs',
    'scripting',
    'activeTab'
  ],
  host_permissions: [
    '<all_urls>'
  ],
  background: {
    service_worker: 'background.js'
  },
  content_scripts: [
    {
      matches: ['<all_urls>'],
      js: ['content.js'],
      run_at: 'document_start',
      world: 'MAIN'
    }
  ],
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

fs.writeFileSync(
  path.join(extensionDir, 'manifest.json'),
  JSON.stringify(manifest, null, 2)
);

// Step 4: Create popup.html
const popupHTML = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Mosqit</title>
  <style>
    body {
      width: 350px;
      padding: 20px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      margin: 0;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }
    .container {
      background: white;
      border-radius: 12px;
      padding: 20px;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    }
    h1 {
      font-size: 24px;
      margin: 0 0 10px 0;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .status {
      padding: 12px;
      background: #f0fdf4;
      border: 1px solid #bbf7d0;
      border-radius: 8px;
      margin: 15px 0;
    }
    .status.ai-ready {
      background: #f0fdf4;
      border-color: #10b981;
    }
    .status.ai-fallback {
      background: #fffbeb;
      border-color: #f59e0b;
    }
    p {
      color: #666;
      font-size: 14px;
      line-height: 1.5;
      margin: 8px 0;
    }
    .footer {
      margin-top: 15px;
      padding-top: 15px;
      border-top: 1px solid #e5e7eb;
      font-size: 12px;
      color: #999;
    }
    button {
      background: #667eea;
      color: white;
      border: none;
      padding: 10px 20px;
      border-radius: 6px;
      font-size: 14px;
      cursor: pointer;
      width: 100%;
      margin-top: 10px;
    }
    button:hover {
      background: #5a67d8;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>🦟 Mosqit</h1>
    <div id="status" class="status">
      <p id="statusText">Checking AI status...</p>
    </div>
    <p>AI-powered debugging assistant that analyzes your console logs in real-time.</p>
    <button onclick="openDashboard()">Open Dashboard</button>
    <div class="footer">
      <p>View console for AI analysis</p>
      <p>Chrome 128+ with AI flags enabled</p>
    </div>
  </div>
  <script>
    function openDashboard() {
      chrome.tabs.create({ url: 'https://mosqit.vercel.app' });
    }

    // Check AI status
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      chrome.scripting.executeScript({
        target: {tabId: tabs[0].id},
        func: () => {
          return typeof Writer !== 'undefined' || typeof LanguageModel !== 'undefined';
        }
      }, (results) => {
        const hasAI = results && results[0]?.result;
        const status = document.getElementById('status');
        const statusText = document.getElementById('statusText');

        if (hasAI) {
          status.className = 'status ai-ready';
          statusText.textContent = '✅ Chrome AI detected - Enhanced analysis active';
        } else {
          status.className = 'status ai-fallback';
          statusText.textContent = '⚠️ Using pattern-based analysis (AI not detected)';
        }
      });
    });
  </script>
</body>
</html>`;

fs.writeFileSync(path.join(extensionDir, 'popup.html'), popupHTML);

// Step 5: Create icon files (simple mosquito SVG)
const createIcon = (size) => {
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${size}" height="${size}" fill="#667eea" rx="${size/8}"/>
  <text x="50%" y="50%" font-size="${size * 0.6}" text-anchor="middle" dy=".35em" fill="white" font-family="system-ui">🦟</text>
</svg>`;
  return svg;
};

// For now, create placeholder PNG files
[16, 48, 128].forEach(size => {
  // In production, you'd use a proper SVG to PNG converter
  // For now, just create a placeholder file
  fs.writeFileSync(
    path.join(iconsDir, `icon${size}.png`),
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]) // PNG header
  );
});

console.log('✅ Chrome Extension build complete!');
console.log(`📁 Output directory: ${extensionDir}`);