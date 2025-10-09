/**
 * Grammar Bridge
 * Runs in ISOLATED world - has access to Chrome APIs
 * Receives messages from MAIN world and processes with Chrome AI
 */

(function() {
  'use strict';

  console.log('[Grammar Bridge] Initializing...');

  let initialized = false;
  let aiManager = null;
  let textChunker = null;
  let grammarEngine = null;

  // Initialize when AI APIs are available
  initializeWhenReady();

  async function initializeWhenReady() {
    // Wait for AI to be available
    if (typeof ai === 'undefined') {
      console.log('[Grammar Bridge] Waiting for Chrome AI...');
      setTimeout(initializeWhenReady, 1000);
      return;
    }

    try {
      // Initialize AI manager
      if (typeof ChromeAIManager !== 'undefined') {
        aiManager = new ChromeAIManager();
      } else {
        console.error('[Grammar Bridge] ChromeAIManager not available');
        return;
      }

      // Initialize text chunker
      if (typeof TextChunker !== 'undefined') {
        textChunker = new TextChunker();
      } else {
        console.error('[Grammar Bridge] TextChunker not available');
        return;
      }

      // Initialize grammar engine
      if (typeof GrammarEngine !== 'undefined') {
        grammarEngine = new GrammarEngine();
        const ready = await grammarEngine.init(aiManager, textChunker);

        if (!ready) {
          console.error('[Grammar Bridge] Grammar engine failed to initialize');
          return;
        }
      } else {
        console.error('[Grammar Bridge] GrammarEngine not available');
        return;
      }

      initialized = true;
      console.log('[Grammar Bridge] ✅ Initialized successfully');

      // Notify MAIN world
      window.postMessage({
        type: 'GRAMMAR_ENGINE_READY',
        source: 'grammar-bridge'
      }, window.location.origin);

      // Start listening for check requests
      setupMessageListener();

    } catch (error) {
      console.error('[Grammar Bridge] Initialization error:', error);
    }
  }

  /**
   * Setup message listener for grammar check requests
   */
  function setupMessageListener() {
    window.addEventListener('message', async (event) => {
      // Validate message
      if (event.source !== window) return;
      if (event.origin !== window.location.origin) return;

      const { type, data, source } = event.data;

      // Only process messages from grammar detector
      if (source !== 'grammar-detector') return;

      if (type === 'GRAMMAR_CHECK_REQUEST') {
        await handleCheckRequest(data);
      }
    });

    console.log('[Grammar Bridge] Message listener ready');
  }

  /**
   * Handle grammar check request
   */
  async handleCheckRequest(data) {
    const { text, context, elementId } = data;

    console.log('[Grammar Bridge] Processing check request:', {
      textLength: text.length,
      context: context.type
    });

    try {
      // Check grammar using engine
      const result = await grammarEngine.checkGrammar(text, context);

      // Send result back to MAIN world
      window.postMessage({
        type: 'GRAMMAR_CHECK_RESULT',
        source: 'grammar-bridge',
        data: {
          elementId,
          suggestions: result.suggestions,
          stats: result.stats
        }
      }, window.location.origin);

      // Send stats to DevTools panel
      sendStatsToDevTools(grammarEngine.getStats());

    } catch (error) {
      console.error('[Grammar Bridge] Check error:', error);

      // Send error back to MAIN world
      window.postMessage({
        type: 'GRAMMAR_ERROR',
        source: 'grammar-bridge',
        data: {
          error: error.message,
          elementId
        }
      }, window.location.origin);
    }
  }

  /**
   * Send stats to DevTools panel
   */
  function sendStatsToDevTools(stats) {
    if (typeof chrome !== 'undefined' && chrome.runtime) {
      chrome.runtime.sendMessage({
        type: 'GRAMMAR_STATS_UPDATE',
        stats: stats
      }).catch(() => {
        // DevTools might not be open, that's ok
      });
    }
  }

  console.log('[Grammar Bridge] Loaded');
})();
