/**
 * Content Bridge Script - Runs in ISOLATED world
 * Receives messages from MAIN world and forwards to background
 */

(function() {
  'use strict';

  // DEBUG MODE: Set to false for production (silences all Mosqit console logs)
  const DEBUG = false;

  if (DEBUG) console.log('[Mosqit Bridge] Initializing message bridge...');

  // Wake up service worker if needed
  chrome.runtime.sendMessage({ type: 'WAKE_UP' }, () => {
    if (chrome.runtime.lastError) {
      if (DEBUG) console.log('[Mosqit Bridge] Service worker was sleeping, waking up...');
      // Retry after a moment
      setTimeout(() => {
        chrome.runtime.sendMessage({ type: 'WAKE_UP' });
      }, 100);
    }
  });

  // Listen for messages from the MAIN world content script
  window.addEventListener('message', (event) => {
    // SECURITY: Validate message origin and source
    if (event.source !== window) return;
    if (event.origin !== window.location.origin) {
      if (DEBUG) console.warn('[Mosqit Bridge] Rejected message from invalid origin:', event.origin);
      return;
    }

    // Validate message structure to prevent malicious data
    if (!event.data || typeof event.data.type !== 'string') return;

    // Check if it's a Mosqit message
    if (event.data.type === 'MOSQIT_LOG_FROM_MAIN') {
      if (DEBUG) console.log('[Mosqit Bridge] Received log from MAIN world, forwarding to background...');

      // Forward to background script
      chrome.runtime.sendMessage({
        type: 'MOSQIT_LOG',
        data: event.data.data
      }, () => {
        // Optional: send response back to MAIN world if needed
        if (chrome.runtime.lastError) {
          if (DEBUG) console.warn('[Mosqit Bridge] Error sending to background:', chrome.runtime.lastError);
        } else {
          if (DEBUG) console.log('[Mosqit Bridge] Successfully sent to background');
        }
      });
    } else if (event.data.type === 'MOSQIT_LOG_UPDATE') {
      if (DEBUG) console.log('[Mosqit Bridge] Received log update from MAIN world, forwarding to background...');

      // Forward log update to background script
      chrome.runtime.sendMessage({
        type: 'MOSQIT_LOG_UPDATE',
        data: event.data.data
      }, () => {
        if (chrome.runtime.lastError) {
          if (DEBUG) console.warn('[Mosqit Bridge] Error sending log update to background:', chrome.runtime.lastError);
        } else {
          if (DEBUG) console.log('[Mosqit Bridge] Successfully sent log update to background');
        }
      });
    } else if (event.data && event.data.type === 'VISUAL_BUG_CAPTURED_FROM_MAIN') {
      if (DEBUG) console.log('[Mosqit Bridge] Received visual bug capture from MAIN world, forwarding to background...');

      // Forward to background script
      chrome.runtime.sendMessage({
        type: 'VISUAL_BUG_CAPTURED',
        data: event.data.data
      }, (response) => {
        if (chrome.runtime.lastError) {
          if (DEBUG) console.error('[Mosqit Bridge] Error sending bug capture to background:', chrome.runtime.lastError);
        } else {
          if (DEBUG) console.log('[Mosqit Bridge] Bug capture sent to background, response:', response);
        }
      });
    } else if (event.data && event.data.type === 'REQUEST_SCREENSHOT_FROM_MAIN') {
      if (DEBUG) console.log('[Mosqit Bridge] Received screenshot request from MAIN world, forwarding to background...');

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
        }, window.location.origin); // SECURITY: Use specific origin

        if (chrome.runtime.lastError) {
          if (DEBUG) console.error('[Mosqit Bridge] Error getting screenshot:', chrome.runtime.lastError);
        } else {
          if (DEBUG) console.log('[Mosqit Bridge] Screenshot captured and sent back to MAIN world');
        }
      });
    }
  });

  // CONSOLIDATED: Single message listener to avoid race conditions
  // Previously had two separate listeners that both fired for every message
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log('[Mosqit Bridge] Received message from extension:', message.type);

    // Handle all message types in one place
    switch (message.type) {
      case 'START_VISUAL_BUG_REPORT':
        if (DEBUG) console.log('[Mosqit Bridge] Forwarding START_VISUAL_BUG_REPORT to MAIN world');
        window.postMessage({
          type: 'START_VISUAL_BUG_REPORT',
          source: 'mosqit-bridge'
        }, window.location.origin); // SECURITY: Use specific origin, not '*'
        sendResponse({ success: true, bridged: true });
        return true;

      case 'STOP_VISUAL_BUG_REPORT':
        if (DEBUG) console.log('[Mosqit Bridge] Forwarding STOP_VISUAL_BUG_REPORT to MAIN world');
        window.postMessage({
          type: 'STOP_VISUAL_BUG_REPORT',
          source: 'mosqit-bridge'
        }, window.location.origin);
        sendResponse({ success: true, bridged: true });
        return true;

      case 'START_NATIVE_INSPECT':
        if (DEBUG) console.log('[Mosqit Bridge] Forwarding START_NATIVE_INSPECT to MAIN world');
        window.postMessage({
          source: 'mosqit-devtools',
          type: 'START_NATIVE_INSPECT',
          options: message.options
        }, window.location.origin);
        sendResponse({ success: true });
        return true;

      case 'STOP_NATIVE_INSPECT':
        if (DEBUG) console.log('[Mosqit Bridge] Forwarding STOP_NATIVE_INSPECT to MAIN world');
        window.postMessage({
          source: 'mosqit-devtools',
          type: 'STOP_NATIVE_INSPECT'
        }, window.location.origin);
        sendResponse({ success: true });
        return true;

      default:
        // Don't respond to unknown message types
        return false;
    }
  });

  // Notify MAIN world that bridge is ready
  window.postMessage({ type: 'MOSQIT_BRIDGE_READY' }, '*');

  console.log('[Mosqit Bridge] Bridge ready');
})();