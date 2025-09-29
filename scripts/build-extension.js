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

// Step 1.5: Copy storage service
const storageServicePath = path.join(__dirname, '..', 'src', 'extension', 'services', 'storage.js');
if (fs.existsSync(storageServicePath)) {
  fs.copyFileSync(storageServicePath, path.join(extensionDir, 'storage.js'));
  console.log('✅ Storage service copied');
}

// Step 2: Create background script
const backgroundJS = `// Mosqit Background Service Worker
console.log('[Mosqit] Background service worker loaded at', new Date().toISOString());

// Import storage service
importScripts('storage.js');

// Initialize storage
const storage = new MosqitStorage();

// Keep service worker alive
const keepAlive = () => {
  setTimeout(keepAlive, 20000); // Keep alive every 20 seconds
};
keepAlive();

// In-memory cache for quick access
const logCache = new Map();
const maxLogsPerTab = 100; // Smaller cache since we have IndexedDB

// DevTools connections
const devToolsConnections = new Map();

// Message handler
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('[Mosqit Background] Received message:', message.type, 'from tab:', sender.tab?.id);

  // CDP removed - not needed for native inspector

  if (message.type === 'MOSQIT_LOG') {
    const tabId = sender.tab?.id;
    console.log('[Mosqit Background] Processing log from tab:', tabId);

    if (tabId) {
      // Update cache
      if (!logCache.has(tabId)) {
        logCache.set(tabId, []);
      }
      const logs = logCache.get(tabId);
      logs.push(message.data);
      if (logs.length > maxLogsPerTab) {
        logs.shift();
      }

      // Save to IndexedDB
      storage.saveLog({
        ...message.data,
        tabId,
        tabUrl: sender.tab?.url || 'unknown'
      }).then(() => {
        console.log('[Mosqit Background] Log saved to IndexedDB');
      }).catch(error => {
        console.error('[Mosqit Background] Failed to save log:', error);
      });

      // Update pattern tracking for errors
      if (message.data.level === 'error' && message.data.file && message.data.line) {
        const pattern = \`\${message.data.file}:\${message.data.line}\`;
        storage.updatePattern(pattern, {
          message: message.data.message,
          level: message.data.level,
          url: sender.tab?.url
        }).catch(error => {
          console.error('[Mosqit Background] Failed to update pattern:', error);
        });
      }

      console.log('[Mosqit Background] Processed log. Cache size:', logs.length);

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
    const tabId = sender.tab?.id || message.tabId;

    // First return cached logs immediately
    const cachedLogs = logCache.get(tabId) || [];

    // Then load from IndexedDB
    storage.getLogs({
      tabId,
      limit: 1000,
      sortBy: 'timestamp',
      sortOrder: 'desc'
    }).then(dbLogs => {
      sendResponse({ logs: [...cachedLogs, ...dbLogs] });
    }).catch(error => {
      console.error('[Mosqit Background] Failed to get logs from DB:', error);
      sendResponse({ logs: cachedLogs });
    });

    return true; // Keep channel open for async response
  } else if (message.type === 'CLEAR_LOGS') {
    const tabId = sender.tab?.id || message.tabId;

    // Clear cache
    if (tabId) {
      logCache.delete(tabId);
    }

    // Clear from database
    storage.clearLogs().then(() => {
      console.log('[Mosqit Background] Logs cleared');
      sendResponse({ success: true });
    }).catch(error => {
      console.error('[Mosqit Background] Failed to clear logs:', error);
      sendResponse({ success: false, error: error.message });
    });

    return true; // Keep channel open for async response
  } else if (message.type === 'EXPORT_LOGS') {
    storage.exportLogs(message.options || {}).then(data => {
      sendResponse({ success: true, data });
    }).catch(error => {
      console.error('[Mosqit Background] Failed to export logs:', error);
      sendResponse({ success: false, error: error.message });
    });

    return true; // Keep channel open for async response
  } else if (message.type === 'IMPORT_LOGS') {
    storage.importLogs(message.data).then(result => {
      sendResponse({ success: true, result });
    }).catch(error => {
      console.error('[Mosqit Background] Failed to import logs:', error);
      sendResponse({ success: false, error: error.message });
    });

    return true; // Keep channel open for async response
  } else if (message.type === 'CAPTURE_ELEMENT_SCREENSHOT') {
    // Capture screenshot for element
    const tabId = sender.tab?.id;
    if (!tabId) {
      sendResponse({ error: 'No tab ID' });
      return true;
    }

    chrome.tabs.captureVisibleTab(null, { format: 'png' }, (dataUrl) => {
      if (chrome.runtime.lastError) {
        console.error('[Mosqit Background] Screenshot failed:', chrome.runtime.lastError);
        sendResponse({ error: chrome.runtime.lastError.message });
      } else {
        // In a real implementation, we would crop to the element area
        sendResponse({ screenshot: dataUrl });
      }
    });
    return true;
  } else if (message.type === 'CAPTURE_VISIBLE_TAB') {
    // Capture full visible tab
    chrome.tabs.captureVisibleTab(null, { format: 'png' }, (dataUrl) => {
      if (chrome.runtime.lastError) {
        console.error('[Mosqit Background] Screenshot failed:', chrome.runtime.lastError);
        sendResponse({ error: chrome.runtime.lastError.message });
      } else {
        sendResponse({ screenshot: dataUrl });
      }
    });
    return true;
  } else if (message.type === 'VISUAL_BUG_CAPTURED') {
    // Forward captured bug data to DevTools panel
    const tabId = sender.tab?.id;
    if (tabId) {
      const devToolsPort = devToolsConnections.get(tabId);
      if (devToolsPort) {
        console.log('[Mosqit Background] Forwarding bug capture to DevTools');
        devToolsPort.postMessage({
          type: 'VISUAL_BUG_CAPTURED',
          data: message.data
        });
        sendResponse({ success: true });
      } else {
        console.error('[Mosqit Background] No DevTools connection for tab:', tabId);
        sendResponse({ success: false, error: 'DevTools not connected' });
      }
    }
    return true;
  } else if (message.type === 'INJECT_CONTENT_BRIDGE') {
    const tabId = message.tabId;

    // Inject the content bridge for ISOLATED world communication
    chrome.scripting.executeScript({
      target: { tabId: tabId },
      files: ['content-bridge.js'],
      world: 'ISOLATED'
    }, () => {
      if (chrome.runtime.lastError) {
        console.error('[Mosqit Background] Failed to inject content bridge:', chrome.runtime.lastError);
        sendResponse({ success: false, error: chrome.runtime.lastError.message });
      } else {
        console.log('[Mosqit Background] Content bridge injected successfully');
        sendResponse({ success: true });
      }
    });

    return true; // Keep channel open for async response
  } else if (message.type === 'INJECT_NATIVE_INSPECTOR') {
    const tabId = message.tabId;

    // Check if native inspector is already injected
    chrome.scripting.executeScript({
      target: { tabId: tabId },
      func: () => {
        return typeof window.mosqitNativeInspector !== 'undefined';
      },
      world: 'MAIN'
    }, (results) => {
      if (chrome.runtime.lastError) {
        console.error('[Mosqit Background] Failed to check Native Inspector:', chrome.runtime.lastError);
        sendResponse({ success: false, error: chrome.runtime.lastError.message });
        return;
      }

      const isAlreadyInjected = results && results[0]?.result;

      if (isAlreadyInjected) {
        console.log('[Mosqit Background] Native Inspector already injected');
        sendResponse({ success: true, alreadyInjected: true });
      } else {
        // Inject the Native Inspector script into MAIN world
        chrome.scripting.executeScript({
          target: { tabId: tabId },
          files: ['content/native-inspector.js'],
          world: 'MAIN'
        }, () => {
          if (chrome.runtime.lastError) {
            console.error('[Mosqit Background] Failed to inject Native Inspector:', chrome.runtime.lastError);
            sendResponse({ success: false, error: chrome.runtime.lastError.message });
          } else {
            console.log('[Mosqit Background] Native Inspector injected successfully');
            sendResponse({ success: true });
          }
        });
      }
    });

    return true; // Keep channel open for async response
  // Visual Bug Reporter removed - using native-inspector.js instead
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

        // Send cached logs immediately
        const cachedLogs = logCache.get(devToolsTabId) || [];
        console.log('[Mosqit Background] Sending', cachedLogs.length, 'cached logs to DevTools');
        port.postMessage({ type: 'LOGS_DATA', data: cachedLogs });

        // Load and send historical logs from IndexedDB
        storage.getLogs({
          tabId: devToolsTabId,
          limit: 500,
          sortBy: 'timestamp',
          sortOrder: 'desc'
        }).then(dbLogs => {
          console.log('[Mosqit Background] Sending', dbLogs.length, 'historical logs from IndexedDB');
          port.postMessage({ type: 'LOGS_DATA', data: dbLogs });
        }).catch(error => {
          console.error('[Mosqit Background] Failed to load historical logs:', error);
        });

      } else if (message.type === 'GET_LOGS') {
        // Fallback: Get the tab ID from DevTools
        if (devToolsTabId) {
          const cachedLogs = logCache.get(devToolsTabId) || [];
          port.postMessage({ type: 'LOGS_DATA', data: cachedLogs });

          // Also load from IndexedDB
          storage.getLogs({
            tabId: devToolsTabId,
            limit: 500,
            sortBy: 'timestamp',
            sortOrder: 'desc'
          }).then(dbLogs => {
            port.postMessage({ type: 'LOGS_DATA', data: dbLogs });
          });
        } else {
          chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs[0]) {
              const tabId = tabs[0].id;
              devToolsTabId = tabId;
              const cachedLogs = logCache.get(tabId) || [];
              port.postMessage({ type: 'LOGS_DATA', data: cachedLogs });

              // Load from IndexedDB too
              storage.getLogs({
                tabId,
                limit: 500,
                sortBy: 'timestamp',
                sortOrder: 'desc'
              }).then(dbLogs => {
                port.postMessage({ type: 'LOGS_DATA', data: dbLogs });
              });

              // Store the connection for this tab
              devToolsConnections.set(tabId, port);
              console.log('[Mosqit Background] Connected DevTools to tab:', tabId);
            }
          });
        }
      } else if (message.type === 'CLEAR_LOGS') {
        if (devToolsTabId) {
          // Clear cache
          logCache.set(devToolsTabId, []);

          // Clear from database
          storage.clearLogs().then(() => {
            console.log('[Mosqit Background] Cleared logs for tab:', devToolsTabId);
            port.postMessage({ type: 'LOGS_CLEARED', success: true });
          }).catch(error => {
            console.error('[Mosqit Background] Failed to clear logs:', error);
            port.postMessage({ type: 'LOGS_CLEARED', success: false });
          });
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
  logCache.delete(tabId);
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

// Copy content files
const contentDir = path.join(srcDir, 'content');

// Keep annotation canvas for screenshot editing
const annotationCanvas = path.join(contentDir, 'annotation-canvas.js');
if (fs.existsSync(annotationCanvas)) {
  fs.copyFileSync(annotationCanvas, path.join(extensionDir, 'annotation-canvas.js'));
  console.log('✅ Annotation Canvas copied');
}

// Copy Native Inspector
const nativeInspector = path.join(contentDir, 'native-inspector.js');
if (fs.existsSync(nativeInspector)) {
  // Create content subdirectory in dist
  const distContentDir = path.join(extensionDir, 'content');
  if (!fs.existsSync(distContentDir)) {
    fs.mkdirSync(distContentDir, { recursive: true });
  }
  fs.copyFileSync(nativeInspector, path.join(distContentDir, 'native-inspector.js'));
  console.log('✅ Native Inspector copied');
}

// CDP Handler removed - not needed anymore

console.log('\n🎉 Build complete!');
console.log(`📁 Extension ready at: ${extensionDir}`);
console.log('\n📋 To install:');
console.log('1. Open chrome://extensions/');
console.log('2. Enable "Developer mode"');
console.log('3. Click "Load unpacked"');
console.log(`4. Select: ${extensionDir}`);