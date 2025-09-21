// Mosqit Background Service Worker
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
