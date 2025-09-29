// Mosqit Background Service Worker
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
        const pattern = `${message.data.file}:${message.data.line}`;
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
