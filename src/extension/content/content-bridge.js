/**
 * Content Bridge Script - Runs in ISOLATED world
 * Receives messages from MAIN world and forwards to background
 */

(function() {
  'use strict';

  console.log('[Mosqit Bridge] Initializing message bridge...');

  // Wake up service worker if needed
  chrome.runtime.sendMessage({ type: 'WAKE_UP' }, () => {
    if (chrome.runtime.lastError) {
      console.log('[Mosqit Bridge] Service worker was sleeping, waking up...');
      // Retry after a moment
      setTimeout(() => {
        chrome.runtime.sendMessage({ type: 'WAKE_UP' });
      }, 100);
    }
  });

  // Listen for messages from the MAIN world content script
  window.addEventListener('message', (event) => {
    // Only accept messages from our own window
    if (event.source !== window) return;

    // Check if it's a Mosqit message
    if (event.data && event.data.type === 'MOSQIT_LOG_FROM_MAIN') {
      console.log('[Mosqit Bridge] Received log from MAIN world, forwarding to background...');

      // Forward to background script
      chrome.runtime.sendMessage({
        type: 'MOSQIT_LOG',
        data: event.data.data
      }, () => {
        // Optional: send response back to MAIN world if needed
        if (chrome.runtime.lastError) {
          console.warn('[Mosqit Bridge] Error sending to background:', chrome.runtime.lastError);
        } else {
          console.log('[Mosqit Bridge] Successfully sent to background');
        }
      });
    } else if (event.data && event.data.type === 'VISUAL_BUG_CAPTURED_FROM_MAIN') {
      console.log('[Mosqit Bridge] Received visual bug capture from MAIN world, forwarding to background...');

      // Forward to background script
      chrome.runtime.sendMessage({
        type: 'VISUAL_BUG_CAPTURED',
        data: event.data.data
      }, (response) => {
        if (chrome.runtime.lastError) {
          console.error('[Mosqit Bridge] Error sending bug capture to background:', chrome.runtime.lastError);
        } else {
          console.log('[Mosqit Bridge] Bug capture sent to background, response:', response);
        }
      });
    } else if (event.data && event.data.type === 'REQUEST_SCREENSHOT_FROM_MAIN') {
      console.log('[Mosqit Bridge] Received screenshot request from MAIN world, forwarding to background...');

      // Forward screenshot request to background
      chrome.runtime.sendMessage({
        type: 'CAPTURE_ELEMENT_SCREENSHOT',
        area: event.data.area
      }, (response) => {
        // Send screenshot back to MAIN world
        window.postMessage({
          type: 'SCREENSHOT_RESPONSE',
          requestId: event.data.requestId,
          screenshot: response?.screenshot || null
        }, '*');

        if (chrome.runtime.lastError) {
          console.error('[Mosqit Bridge] Error getting screenshot:', chrome.runtime.lastError);
        } else {
          console.log('[Mosqit Bridge] Screenshot captured and sent back to MAIN world');
        }
      });
    }
  });

  // Listen for messages from the extension (background/popup/devtools)
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log('[Mosqit Bridge] Received message from extension:', message.type);

    // Forward Visual Bug Reporter commands to MAIN world
    if (message.type === 'START_VISUAL_BUG_REPORT') {
      console.log('[Mosqit Bridge] Forwarding START_VISUAL_BUG_REPORT to MAIN world');
      window.postMessage({
        type: 'START_VISUAL_BUG_REPORT',
        source: 'mosqit-bridge'
      }, '*');
      sendResponse({ success: true, bridged: true });
      return true;
    } else if (message.type === 'STOP_VISUAL_BUG_REPORT') {
      console.log('[Mosqit Bridge] Forwarding STOP_VISUAL_BUG_REPORT to MAIN world');
      window.postMessage({
        type: 'STOP_VISUAL_BUG_REPORT',
        source: 'mosqit-bridge'
      }, '*');
      sendResponse({ success: true, bridged: true });
      return true;
    }

    // Don't respond to other messages to avoid errors
  });

  // Listen for Chrome extension messages and forward to MAIN world
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log('[Mosqit Bridge] Received message from extension:', request.type);

    // Forward native inspector commands to MAIN world
    if (request.type === 'START_NATIVE_INSPECT') {
      console.log('[Mosqit Bridge] Forwarding START_NATIVE_INSPECT to MAIN world');
      window.postMessage({
        source: 'mosqit-devtools',
        type: 'START_NATIVE_INSPECT',
        options: request.options
      }, '*');
      sendResponse({ success: true });
      return true;
    } else if (request.type === 'STOP_NATIVE_INSPECT') {
      console.log('[Mosqit Bridge] Forwarding STOP_NATIVE_INSPECT to MAIN world');
      window.postMessage({
        source: 'mosqit-devtools',
        type: 'STOP_NATIVE_INSPECT'
      }, '*');
      sendResponse({ success: true });
      return true;
    }
  });

  // Notify MAIN world that bridge is ready
  window.postMessage({ type: 'MOSQIT_BRIDGE_READY' }, '*');

  console.log('[Mosqit Bridge] Bridge ready');
})();