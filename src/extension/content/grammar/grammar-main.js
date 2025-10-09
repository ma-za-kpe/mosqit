/**
 * Grammar Main Coordinator
 * Initializes and coordinates all grammar modules
 * This file is loaded in MAIN world content script
 */

(function() {
  'use strict';

  console.log('[Grammar Main] Loading...');

  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initGrammar);
  } else {
    initGrammar();
  }

  async function initGrammar() {
    console.log('[Grammar Main] Initializing grammar system...');

    try {
      // Check if grammar is enabled
      const config = await loadConfig();

      if (!config || !config.enabled) {
        console.log('[Grammar Main] Grammar features disabled');
        return;
      }

      console.log('[Grammar Main] Grammar enabled, starting modules...');

      // Initialize UI
      if (typeof suggestionUI !== 'undefined') {
        suggestionUI.init();
        console.log('[Grammar Main] ✓ Suggestion UI initialized');
      }

      // Initialize detector
      if (typeof grammarDetector !== 'undefined') {
        grammarDetector.init();
        grammarDetector.enable();
        console.log('[Grammar Main] ✓ Grammar detector initialized');
      }

      // Listen for grammar check results from bridge
      window.addEventListener('message', handleGrammarMessage);

      // Listen for config changes
      listenForConfigChanges();

      console.log('[Grammar Main] ✅ Grammar system ready');

    } catch (error) {
      console.error('[Grammar Main] Initialization error:', error);
    }
  }

  /**
   * Load configuration from Chrome storage
   */
  function loadConfig() {
    return new Promise((resolve) => {
      if (typeof chrome !== 'undefined' && chrome.storage) {
        chrome.storage.sync.get(['grammarConfig'], (result) => {
          resolve(result.grammarConfig || null);
        });
      } else {
        resolve(null);
      }
    });
  }

  /**
   * Handle messages from grammar engine (via bridge)
   */
  function handleGrammarMessage(event) {
    // Validate message origin
    if (event.source !== window) return;
    if (event.origin !== window.location.origin) return;

    const { type, data } = event.data;

    switch (type) {
      case 'GRAMMAR_CHECK_RESULT':
        handleGrammarResult(data);
        break;

      case 'GRAMMAR_ENGINE_READY':
        console.log('[Grammar Main] Grammar engine ready');
        break;

      case 'GRAMMAR_ERROR':
        console.error('[Grammar Main] Grammar engine error:', data);
        break;
    }
  }

  /**
   * Handle grammar check results
   */
  function handleGrammarResult(data) {
    const { suggestions, elementId } = data;

    console.log('[Grammar Main] Received suggestions:', suggestions.length);

    // Find the element
    const element = findElement(elementId);
    if (!element) {
      console.warn('[Grammar Main] Element not found:', elementId);
      return;
    }

    // Display suggestions
    if (typeof suggestionUI !== 'undefined' && suggestions.length > 0) {
      suggestionUI.displaySuggestions(element, suggestions);
    }
  }

  /**
   * Find element by ID or attributes
   */
  function findElement(elementId) {
    // Try by ID first
    let element = document.getElementById(elementId);
    if (element) return element;

    // Try by data attribute
    element = document.querySelector(`[data-grammar-id="${elementId}"]`);
    if (element) return element;

    return null;
  }

  /**
   * Listen for configuration changes from DevTools
   */
  function listenForConfigChanges() {
    if (typeof chrome !== 'undefined' && chrome.runtime) {
      chrome.runtime.onMessage.addListener((message) => {
        if (message.type === 'GRAMMAR_CONFIG_CHANGED') {
          console.log('[Grammar Main] Config changed, reloading...');
          const config = message.config;

          if (config.enabled) {
            // Re-enable if it was disabled
            if (typeof grammarDetector !== 'undefined') {
              grammarDetector.enable();
            }
          } else {
            // Disable if enabled
            if (typeof grammarDetector !== 'undefined') {
              grammarDetector.disable();
            }
            if (typeof suggestionUI !== 'undefined') {
              suggestionUI.cleanup();
            }
          }
        }
      });
    }
  }

  console.log('[Grammar Main] Loaded');
})();
