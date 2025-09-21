#!/usr/bin/env node

/**
 * Simple build script for Mosqit Chrome Extension
 * Copies JavaScript files directly without compilation
 */

const fs = require('fs');
const path = require('path');

console.log('🦟 Building Mosqit Chrome Extension...');

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

// Step 1: Copy content scripts
const contentScript = path.join(srcDir, 'content', 'mosqit-content.js');
if (fs.existsSync(contentScript)) {
  fs.copyFileSync(contentScript, path.join(extensionDir, 'content.js'));
  console.log('✅ Main content script copied');
} else {
  console.warn('⚠️ Content script not found, creating minimal version');
  // Minimal content script as fallback
  const minimalContent = `
// Mosqit Content Script
console.log('[Mosqit] 🦟 Extension loaded');
`;
  fs.writeFileSync(path.join(extensionDir, 'content.js'), minimalContent);
}

// Copy bridge content script
const bridgeScript = path.join(srcDir, 'content', 'content-bridge.js');
if (fs.existsSync(bridgeScript)) {
  fs.copyFileSync(bridgeScript, path.join(extensionDir, 'content-bridge.js'));
  console.log('✅ Bridge content script copied');
} else {
  console.warn('⚠️ Bridge script not found, creating it');
  const bridgeContent = `
// Content Bridge - Forwards messages from MAIN to background
window.addEventListener('message', (event) => {
  if (event.source !== window) return;
  if (event.data && event.data.type === 'MOSQIT_LOG_FROM_MAIN') {
    chrome.runtime.sendMessage({
      type: 'MOSQIT_LOG',
      data: event.data.data
    });
  }
});
`;
  fs.writeFileSync(path.join(extensionDir, 'content-bridge.js'), bridgeContent);
}

// Step 2: Create background script
const backgroundJS = `// Mosqit Background Service Worker
console.log('[Mosqit] Background service worker loaded at', new Date().toISOString());

// Keep service worker alive
const keepAlive = () => {
  setTimeout(keepAlive, 20000); // Keep alive every 20 seconds
};
keepAlive();

// Storage for logs - persist in chrome.storage
const logStorage = new Map();
const maxLogsPerTab = 1000;

// DevTools connections
const devToolsConnections = new Map();

// Message handler
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('[Mosqit Background] Received message:', message.type, 'from tab:', sender.tab?.id);

  if (message.type === 'MOSQIT_LOG') {
    const tabId = sender.tab?.id;
    console.log('[Mosqit Background] Processing log from tab:', tabId);

    if (tabId) {
      if (!logStorage.has(tabId)) {
        logStorage.set(tabId, []);
      }
      const logs = logStorage.get(tabId);
      logs.push(message.data);
      if (logs.length > maxLogsPerTab) {
        logs.shift();
      }

      console.log('[Mosqit Background] Stored log. Total logs for tab', tabId, ':', logs.length);

      // Send to DevTools if connected
      const devToolsPort = devToolsConnections.get(tabId);
      if (devToolsPort) {
        console.log('[Mosqit Background] Forwarding to DevTools for tab:', tabId);
        devToolsPort.postMessage({ type: 'NEW_LOG', data: message.data });
      } else {
        console.log('[Mosqit Background] No DevTools connection for tab:', tabId);
        console.log('[Mosqit Background] Active connections:', Array.from(devToolsConnections.keys()));
      }

      sendResponse({ success: true });
    } else {
      console.warn('[Mosqit Background] No tab ID in sender');
    }
  } else if (message.type === 'GET_LOGS') {
    const tabId = sender.tab?.id;
    const logs = logStorage.get(tabId) || [];
    sendResponse({ logs });
  }
  return true;
});

// Handle DevTools connection
chrome.runtime.onConnect.addListener((port) => {
  console.log('[Mosqit Background] Port connected:', port.name);

  if (port.name === 'mosqit-devtools') {
    console.log('[Mosqit] DevTools connected');

    // Get the inspected tab ID from DevTools
    let devToolsTabId = null;

    // Listen for DevTools messages
    port.onMessage.addListener((message) => {
      console.log('[Mosqit Background] DevTools message:', message.type);

      if (message.type === 'INIT') {
        // DevTools sends the inspected tab ID
        devToolsTabId = message.tabId;
        console.log('[Mosqit Background] DevTools initialized for tab:', devToolsTabId);

        // Store the connection
        devToolsConnections.set(devToolsTabId, port);

        // Send existing logs
        const logs = logStorage.get(devToolsTabId) || [];
        console.log('[Mosqit Background] Sending', logs.length, 'existing logs to DevTools');
        port.postMessage({ type: 'LOGS_DATA', data: logs });

      } else if (message.type === 'GET_LOGS') {
        // Fallback: Get the tab ID from DevTools
        if (devToolsTabId) {
          const logs = logStorage.get(devToolsTabId) || [];
          port.postMessage({ type: 'LOGS_DATA', data: logs });
        } else {
          chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs[0]) {
              const tabId = tabs[0].id;
              devToolsTabId = tabId;
              const logs = logStorage.get(tabId) || [];
              port.postMessage({ type: 'LOGS_DATA', data: logs });

              // Store the connection for this tab
              devToolsConnections.set(tabId, port);
              console.log('[Mosqit Background] Connected DevTools to tab:', tabId);
            }
          });
        }
      } else if (message.type === 'CLEAR_LOGS') {
        if (devToolsTabId) {
          logStorage.set(devToolsTabId, []);
          console.log('[Mosqit Background] Cleared logs for tab:', devToolsTabId);
        }
      }
    });

    // Clean up when DevTools disconnects
    port.onDisconnect.addListener(() => {
      console.log('[Mosqit] DevTools disconnected');
      // Remove the connection
      if (devToolsTabId) {
        devToolsConnections.delete(devToolsTabId);
        console.log('[Mosqit Background] Removed DevTools connection for tab:', devToolsTabId);
      }
    });
  }
});

// Clear logs when tab is closed
chrome.tabs.onRemoved.addListener((tabId) => {
  logStorage.delete(tabId);
  devToolsConnections.delete(tabId);
  console.log('[Mosqit Background] Tab closed, cleared data for:', tabId);
});

chrome.runtime.onInstalled.addListener(() => {
  console.log('[Mosqit] Extension installed successfully');
});
`;

fs.writeFileSync(path.join(extensionDir, 'background.js'), backgroundJS);
console.log('✅ Background script created');

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
    },
    {
      matches: ['<all_urls>'],
      js: ['content-bridge.js'],
      run_at: 'document_start',
      world: 'ISOLATED'
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
  },
  devtools_page: 'devtools.html'
};

fs.writeFileSync(
  path.join(extensionDir, 'manifest.json'),
  JSON.stringify(manifest, null, 2)
);
console.log('✅ Manifest created');

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
    <button id="dashboardBtn">Open Dashboard</button>
    <button id="statusBtn">Check AI Status</button>
    <div class="footer">
      <p>View console for AI analysis</p>
      <p>Chrome 128+ with AI flags enabled</p>
    </div>
  </div>
  <script src="popup.js"></script>
</body>
</html>`;

fs.writeFileSync(path.join(extensionDir, 'popup.html'), popupHTML);
console.log('✅ Popup created');

// Step 4b: Create popup.js
const popupJS = `// Popup script for Mosqit Extension

function openDashboard() {
  chrome.tabs.create({ url: 'https://mosqit.vercel.app' });
}

function checkStatus() {
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    chrome.scripting.executeScript({
      target: {tabId: tabs[0].id},
      func: () => {
        return typeof Writer !== 'undefined' || typeof Summarizer !== 'undefined';
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
}

// Event listeners
document.getElementById('dashboardBtn').addEventListener('click', openDashboard);
document.getElementById('statusBtn').addEventListener('click', checkStatus);

// Check on load
window.addEventListener('load', checkStatus);
`;

fs.writeFileSync(path.join(extensionDir, 'popup.js'), popupJS);
console.log('✅ Popup script created');

// Step 5: Create placeholder icons
// In production, you'd use actual PNG files
const iconSizes = [16, 48, 128];
iconSizes.forEach(size => {
  // Create a simple placeholder file
  const iconData = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]); // PNG header
  fs.writeFileSync(path.join(iconsDir, `icon${size}.png`), iconData);
});
console.log('✅ Icons created');

// Step 6: Copy DevTools files
const devtoolsDir = path.join(srcDir, 'devtools');
if (fs.existsSync(devtoolsDir)) {
  // Copy devtools.html
  const devtoolsHTML = path.join(devtoolsDir, 'devtools.html');
  if (fs.existsSync(devtoolsHTML)) {
    fs.copyFileSync(devtoolsHTML, path.join(extensionDir, 'devtools.html'));
    console.log('✅ DevTools HTML copied');
  }

  // Copy devtools.js
  const devtoolsJS = path.join(devtoolsDir, 'devtools.js');
  if (fs.existsSync(devtoolsJS)) {
    fs.copyFileSync(devtoolsJS, path.join(extensionDir, 'devtools.js'));
    console.log('✅ DevTools JS copied');
  }

  // Copy panel.html
  const panelHTML = path.join(devtoolsDir, 'panel.html');
  if (fs.existsSync(panelHTML)) {
    fs.copyFileSync(panelHTML, path.join(extensionDir, 'panel.html'));
    console.log('✅ Panel HTML copied');
  }

  // Copy panel.js
  const panelJS = path.join(devtoolsDir, 'panel.js');
  if (fs.existsSync(panelJS)) {
    fs.copyFileSync(panelJS, path.join(extensionDir, 'panel.js'));
    console.log('✅ Panel JS copied');
  }

  // Copy devtools.css if exists
  const devtoolsCSS = path.join(devtoolsDir, 'devtools.css');
  if (fs.existsSync(devtoolsCSS)) {
    fs.copyFileSync(devtoolsCSS, path.join(extensionDir, 'devtools.css'));
    console.log('✅ DevTools CSS copied');
  }
} else {
  console.warn('⚠️ DevTools directory not found');
}

console.log('\n🎉 Build complete!');
console.log(`📁 Extension ready at: ${extensionDir}`);
console.log('\n📋 To install:');
console.log('1. Open chrome://extensions/');
console.log('2. Enable "Developer mode"');
console.log('3. Click "Load unpacked"');
console.log(`4. Select: ${extensionDir}`);