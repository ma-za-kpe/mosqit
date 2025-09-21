// DevTools initialization script
console.log('[Mosqit DevTools] Loading DevTools page at', new Date().toISOString());

// Log the inspected tab ID
if (chrome.devtools && chrome.devtools.inspectedWindow) {
  console.log('[Mosqit DevTools] Inspected window tab ID:', chrome.devtools.inspectedWindow.tabId);
}

// Create Mosqit panel in Chrome DevTools
chrome.devtools.panels.create(
  "🦟 Mosqit",  // Add mosquito emoji to panel name
  "icons/icon48.png",  // Use larger icon
  "panel.html",
  (panel) => {
    console.log('[Mosqit DevTools] Panel created successfully');

    if (chrome.devtools && chrome.devtools.inspectedWindow) {
      console.log('[Mosqit DevTools] Panel will connect to tab:', chrome.devtools.inspectedWindow.tabId);
    }

    // Log when panel is shown
    if (panel.onShown) {
      panel.onShown.addListener((window) => {
        console.log('[Mosqit DevTools] Panel shown for tab:', chrome.devtools.inspectedWindow.tabId);
      });
    }

    if (panel.onHidden) {
      panel.onHidden.addListener(() => {
        console.log('[Mosqit DevTools] Panel hidden');
      });
    }
  }
);