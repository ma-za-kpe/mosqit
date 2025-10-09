// Mosqit Background Service Worker
// DEBUG MODE: Set to false for production (silences all Mosqit console logs)
const DEBUG = false;

if (DEBUG) console.log('[Mosqit] Background service worker loaded at', new Date().toISOString());

// EPHEMERAL MODE: No persistence, just like native console
// Service workers may sleep after 30 seconds - that's OK, logs are ephemeral
// Port connections to DevTools will keep us alive while DevTools is open

// In-memory cache only (ephemeral, like native console)
const logCache = new Map();
const maxLogsPerTab = 100;

// DevTools connections (port connections keep service worker alive while connected)
const devToolsConnections = new Map();

// RELIABILITY FIX: Wake up service worker when needed
// This ensures we're ready to handle messages even after sleeping
chrome.runtime.onStartup.addListener(() => {
  if (DEBUG) console.log('[Mosqit] Service worker started (browser startup)');
});

chrome.runtime.onInstalled.addListener(() => {
  if (DEBUG) console.log('[Mosqit] Extension installed/updated');
});

// REMOVED: No IndexedDB recovery - ephemeral like native console

// Message handler
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (DEBUG) console.log('[Mosqit Background] Received message:', message.type, 'from tab:', sender.tab?.id);

  // CDP removed - not needed for native inspector

  if (message.type === 'MOSQIT_LOG') {
    const tabId = sender.tab?.id;
    if (DEBUG) console.log('[Mosqit Background] Processing log from tab:', tabId);

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

      if (DEBUG) console.log('[Mosqit Background] Processed log. Cache size:', logs.length);

      // Send to DevTools if connected
      const devToolsPort = devToolsConnections.get(tabId);
      if (devToolsPort) {
        if (DEBUG) console.log('[Mosqit Background] Forwarding to DevTools for tab:', tabId);
        devToolsPort.postMessage({ type: 'NEW_LOG', data: message.data });
      } else {
        if (DEBUG) console.log('[Mosqit Background] No DevTools connection for tab:', tabId);
        if (DEBUG) console.log('[Mosqit Background] Active connections:', Array.from(devToolsConnections.keys()));
      }

      sendResponse({ success: true });
    } else {
      if (DEBUG) console.warn('[Mosqit Background] No tab ID in sender');
      sendResponse({ success: false, error: 'No tab ID' });
    }
    return false; // Synchronous response
  } else if (message.type === 'MOSQIT_LOG_UPDATE') {
    // PERFORMANCE FIX: Handle log updates (when AI analysis completes)
    const tabId = sender.tab?.id;
    if (DEBUG) console.log('[Mosqit Background] Processing log update from tab:', tabId);

    if (tabId) {
      // Update the log in cache (find by timestamp)
      const logs = logCache.get(tabId);
      if (logs) {
        const logIndex = logs.findIndex(log => log.timestamp === message.data.timestamp);
        if (logIndex !== -1) {
          logs[logIndex] = message.data;
          if (DEBUG) console.log('[Mosqit Background] Updated log in cache');
        }
      }

      // Send update to DevTools if connected
      const devToolsPort = devToolsConnections.get(tabId);
      if (devToolsPort) {
        if (DEBUG) console.log('[Mosqit Background] Forwarding log update to DevTools for tab:', tabId);
        devToolsPort.postMessage({ type: 'LOG_UPDATE', data: message.data });
      }

      sendResponse({ success: true });
    } else {
      if (DEBUG) console.warn('[Mosqit Background] No tab ID in sender for log update');
      sendResponse({ success: false, error: 'No tab ID' });
    }
    return false; // Synchronous response
  } else if (message.type === 'GET_LOGS') {
    const tabId = sender.tab?.id || message.tabId;

    // Return in-memory cached logs only (ephemeral like native console)
    const cachedLogs = logCache.get(tabId) || [];
    sendResponse({ logs: cachedLogs });

    return false; // Synchronous response
  } else if (message.type === 'CLEAR_LOGS') {
    const tabId = sender.tab?.id || message.tabId;

    // Clear in-memory cache only
    if (tabId) {
      logCache.delete(tabId);
    } else {
      logCache.clear(); // Clear all tabs
    }

    if (DEBUG) console.log('[Mosqit Background] Logs cleared');
    sendResponse({ success: true });

    return false; // Synchronous response
  } else if (message.type === 'EXPORT_LOGS') {
    // Export from in-memory cache (ephemeral)
    const tabId = sender.tab?.id || message.tabId;
    const logs = tabId ? (logCache.get(tabId) || []) : Array.from(logCache.values()).flat();
    sendResponse({ success: true, data: logs });

    return false; // Synchronous response
  } else if (message.type === 'IMPORT_LOGS') {
    // Not supported in ephemeral mode
    sendResponse({ success: false, error: 'Import not supported in ephemeral mode' });

    return false; // Synchronous response
  } else if (message.type === 'CAPTURE_ELEMENT_SCREENSHOT') {
    // Capture screenshot for element
    const tabId = sender.tab?.id;
    if (!tabId) {
      sendResponse({ error: 'No tab ID' });
      return true;
    }

    chrome.tabs.captureVisibleTab(null, { format: 'png' }, (dataUrl) => {
      if (chrome.runtime.lastError) {
        if (DEBUG) console.error('[Mosqit Background] Screenshot failed:', chrome.runtime.lastError);
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
        if (DEBUG) console.error('[Mosqit Background] Screenshot failed:', chrome.runtime.lastError);
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
        if (DEBUG) console.log('[Mosqit Background] Forwarding bug capture to DevTools');
        devToolsPort.postMessage({
          type: 'VISUAL_BUG_CAPTURED',
          data: message.data
        });
        sendResponse({ success: true });
      } else {
        if (DEBUG) console.error('[Mosqit Background] No DevTools connection for tab:', tabId);
        sendResponse({ success: false, error: 'DevTools not connected' });
      }
    } else {
      sendResponse({ success: false, error: 'No tab ID' });
    }
    return false; // Synchronous response
  } else if (message.type === 'INJECT_CONTENT_BRIDGE') {
    const tabId = message.tabId;

    // Inject the content bridge for ISOLATED world communication
    chrome.scripting.executeScript({
      target: { tabId: tabId },
      files: ['content-bridge.js'],
      world: 'ISOLATED'
    }, () => {
      if (chrome.runtime.lastError) {
        if (DEBUG) console.error('[Mosqit Background] Failed to inject content bridge:', chrome.runtime.lastError);
        sendResponse({ success: false, error: chrome.runtime.lastError.message });
      } else {
        if (DEBUG) console.log('[Mosqit Background] Content bridge injected successfully');
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
        if (DEBUG) console.error('[Mosqit Background] Failed to check Native Inspector:', chrome.runtime.lastError);
        sendResponse({ success: false, error: chrome.runtime.lastError.message });
        return;
      }

      const isAlreadyInjected = results && results[0]?.result;

      if (isAlreadyInjected) {
        if (DEBUG) console.log('[Mosqit Background] Native Inspector already injected');
        sendResponse({ success: true, alreadyInjected: true });
      } else {
        // Inject the Native Inspector script into MAIN world
        chrome.scripting.executeScript({
          target: { tabId: tabId },
          files: ['content/native-inspector.js'],
          world: 'MAIN'
        }, () => {
          if (chrome.runtime.lastError) {
            if (DEBUG) console.error('[Mosqit Background] Failed to inject Native Inspector:', chrome.runtime.lastError);
            sendResponse({ success: false, error: chrome.runtime.lastError.message });
          } else {
            if (DEBUG) console.log('[Mosqit Background] Native Inspector injected successfully');
            sendResponse({ success: true });
          }
        });
      }
    });

    return true; // Keep channel open for async response
  // Visual Bug Reporter removed - using native-inspector.js instead
  }
  // RELIABILITY FIX: Don't return true by default - only async handlers should return true
  // Returning true here causes "message channel closed" errors for synchronous handlers
  return false;
});

// Handle DevTools connection
chrome.runtime.onConnect.addListener((port) => {
  if (DEBUG) console.log('[Mosqit Background] Port connected:', port.name);

  if (port.name === 'mosqit-devtools') {
    if (DEBUG) console.log('[Mosqit] DevTools connected');

    // Get the inspected tab ID from DevTools
    let devToolsTabId = null;

    // Listen for DevTools messages
    port.onMessage.addListener((message) => {
      if (DEBUG) console.log('[Mosqit Background] DevTools message:', message.type);

      if (message.type === 'INIT') {
        // DevTools sends the inspected tab ID
        devToolsTabId = message.tabId;
        if (DEBUG) console.log('[Mosqit Background] DevTools initialized for tab:', devToolsTabId);

        // Store the connection (this keeps service worker alive while DevTools is open)
        devToolsConnections.set(devToolsTabId, port);

        // Send in-memory cached logs only (ephemeral like native console)
        const cachedLogs = logCache.get(devToolsTabId) || [];
        if (DEBUG) console.log('[Mosqit Background] Sending', cachedLogs.length, 'cached logs to DevTools');
        port.postMessage({ type: 'LOGS_DATA', data: cachedLogs });

      } else if (message.type === 'GET_LOGS') {
        // Get in-memory logs only
        if (devToolsTabId) {
          const cachedLogs = logCache.get(devToolsTabId) || [];
          port.postMessage({ type: 'LOGS_DATA', data: cachedLogs });
        } else {
          chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs[0]) {
              const tabId = tabs[0].id;
              devToolsTabId = tabId;
              const cachedLogs = logCache.get(tabId) || [];
              port.postMessage({ type: 'LOGS_DATA', data: cachedLogs });

              // Store the connection for this tab
              devToolsConnections.set(tabId, port);
              if (DEBUG) console.log('[Mosqit Background] Connected DevTools to tab:', tabId);
            }
          });
        }
      } else if (message.type === 'CLEAR_LOGS') {
        if (devToolsTabId) {
          // Clear in-memory cache only
          logCache.set(devToolsTabId, []);
          if (DEBUG) console.log('[Mosqit Background] Cleared logs for tab:', devToolsTabId);
          port.postMessage({ type: 'LOGS_CLEARED', success: true });
        }
      }
    });

    // Clean up when DevTools disconnects
    port.onDisconnect.addListener(() => {
      if (DEBUG) console.log('[Mosqit] DevTools disconnected');
      // Remove the connection
      if (devToolsTabId) {
        devToolsConnections.delete(devToolsTabId);
        if (DEBUG) console.log('[Mosqit Background] Removed DevTools connection for tab:', devToolsTabId);
      }
    });
  }
});

// Clear logs when tab is closed
chrome.tabs.onRemoved.addListener((tabId) => {
  logCache.delete(tabId);
  devToolsConnections.delete(tabId);
  if (DEBUG) console.log('[Mosqit Background] Tab closed, cleared data for:', tabId);
});

chrome.runtime.onInstalled.addListener(() => {
  if (DEBUG) console.log('[Mosqit] Extension installed successfully');
});
