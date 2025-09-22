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
    }
  });

  // Notify MAIN world that bridge is ready
  window.postMessage({ type: 'MOSQIT_BRIDGE_READY' }, '*');

  console.log('[Mosqit Bridge] Bridge ready');
})();