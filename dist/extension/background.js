// Mosqit Background Service Worker
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
