/**
 * Mosqit Content Script - Chrome AI Integration
 * Plain JavaScript version for Chrome Extension
 */

(function() {
  'use strict';

  // DEBUG MODE: Set to false for production (silences all Mosqit console logs)
  const DEBUG = false;

  if (DEBUG) console.log('[Mosqit] 🦟 Initializing debugging assistant...');

  class MosqitLogger {
    constructor() {
      this.DEBUG = DEBUG;
      this.logs = [];
      this.maxLogs = 1000;
      this.aiAvailable = false;

      // Debug logger helpers
      this._log = (...args) => { if (this.DEBUG) console.log(...args); };
      this._warn = (...args) => { if (this.DEBUG) console.warn(...args); };
      this._debug = (...args) => { if (this.DEBUG) console.debug(...args); };
      this.writerSession = null;
      this.errorPatterns = new Map();
      this.maxErrorPatterns = 100; // MEMORY FIX: Limit pattern tracking

      // Context tracking
      this.recentLogs = []; // Last 10 logs before an error
      this.maxRecentLogs = 10;
      this.lastUserAction = null;
      this.lastErrorTime = 0;
      this.lastError = null;
      this.errorContext = new Map(); // Store context for each error
      this.userActionHistory = [];
      this.maxActionHistory = 5;

      // Track highlighted elements for cleanup
      this.highlightedElements = new WeakMap();
      this.highlightTimeouts = new Set();

      // MEMORY FIX: Track resources for cleanup
      this.eventListeners = []; // Store all event listeners for removal
      this.intervals = []; // Store all intervals for clearing
      this.timeouts = []; // Store all timeouts for clearing
      this.isDestroyed = false; // Track if logger has been destroyed

      // PERFORMANCE FIX: AI rate limiting to prevent quota exhaustion
      this.aiCallQueue = [];
      this.activeAICalls = 0;
      this.maxConcurrentAICalls = 2; // Max 2 AI calls at once
      this.aiCallsPerMinute = 0;
      this.maxAICallsPerMinute = 10; // Max 10 AI calls per minute
      this.aiCallTimestamps = [];
      this.lastAICallTime = 0;
      this.minAICallInterval = 100; // Minimum 100ms between AI calls

      this.init();
    }

    async init() {
      await this.checkChromeAI();
      this.overrideConsoleMethods();
      this.setupErrorListener();
      this.setupUserActionTracking();
      this.setupCleanupHandlers();
      this._log('[Mosqit] ✅ Logger initialized');
    }

    // MEMORY FIX: Helper to add tracked event listeners
    addTrackedEventListener(target, event, handler, options) {
      target.addEventListener(event, handler, options);
      this.eventListeners.push({ target, event, handler, options });
    }

    setupCleanupHandlers() {
      // MEMORY FIX: Track all event listeners and intervals for cleanup
      const beforeUnloadHandler = () => {
        this.destroy(); // Call full cleanup on unload
      };
      this.addTrackedEventListener(window, 'beforeunload', beforeUnloadHandler);

      // Clean up on page hide (for mobile/tab switching)
      const visibilityHandler = () => {
        if (document.hidden) {
          this.cleanupHighlights();
        }
      };
      this.addTrackedEventListener(document, 'visibilitychange', visibilityHandler);

      // Clean up on navigation (SPA)
      const popstateHandler = () => {
        this.cleanupHighlights();
      };
      this.addTrackedEventListener(window, 'popstate', popstateHandler);

      // MEMORY FIX: Run cleanup periodically but track the interval
      const cleanupIntervalId = setInterval(() => {
        if (!this.isDestroyed) {
          this.cleanupHighlights();
        }
      }, 10000); // Every 10 seconds
      this.intervals.push(cleanupIntervalId);
    }

    setupUserActionTracking() {
      // Store last interacted element
      this.lastInteractedElement = null;

      // MEMORY FIX: Track all event listeners for cleanup
      const clickHandler = (e) => {
        if (this.isDestroyed) return;
        const target = e.target;
        this.lastInteractedElement = target;
        const identifier = target.id || target.className || target.tagName;
        const text = target.textContent?.substring(0, 30) || '';
        this.lastUserAction = `Clicked: ${identifier} "${text.trim()}"`;
        this.addToActionHistory(this.lastUserAction);
      };
      this.addTrackedEventListener(document, 'click', clickHandler, true);

      const submitHandler = (e) => {
        if (this.isDestroyed) return;
        const form = e.target;
        const identifier = form.id || form.className || 'form';
        this.lastUserAction = `Submitted form: ${identifier}`;
        this.addToActionHistory(this.lastUserAction);
      };
      this.addTrackedEventListener(document, 'submit', submitHandler, true);

      const changeHandler = (e) => {
        if (this.isDestroyed) return;
        const target = e.target;
        if (target.tagName === 'INPUT' || target.tagName === 'SELECT') {
          const identifier = target.id || target.name || target.type;
          this.lastUserAction = `Changed input: ${identifier}`;
          this.addToActionHistory(this.lastUserAction);
        }
      };
      this.addTrackedEventListener(document, 'change', changeHandler, true);

      const navHandler = () => {
        if (this.isDestroyed) return;
        this.lastUserAction = `Navigated to: ${window.location.pathname}`;
        this.addToActionHistory(this.lastUserAction);
      };
      this.addTrackedEventListener(window, 'popstate', navHandler);
    }

    addToActionHistory(action) {
      this.userActionHistory.unshift({
        action,
        timestamp: Date.now()
      });
      if (this.userActionHistory.length > this.maxActionHistory) {
        this.userActionHistory.pop();
      }
    }

    async checkChromeAI() {
      this.aiCapabilities = {};

      // Check for Prompt API (newest and most powerful) - uses window.ai
      if (typeof window.ai !== 'undefined' && window.ai?.assistant) {
        try {
          const capabilities = await window.ai.assistant.capabilities();
          console.info('[Mosqit] Prompt API capabilities:', capabilities);

          if (capabilities.available === 'readily') {
            this.aiAvailable = true;
            this.aiCapabilities.prompt = true;
            console.info('[Mosqit] ✅ Chrome AI Prompt API (Gemini Nano) ready!');
          } else if (capabilities.available === 'after-download') {
            console.info('[Mosqit] 📥 Triggering Gemini Nano model download...');
            try {
              // Actually trigger the download by creating a session
              const testSession = await window.ai.assistant.create();
              await testSession.destroy();
              this.aiAvailable = true;
              this.aiCapabilities.prompt = true;
              console.info('[Mosqit] ✅ Chrome AI Prompt API model downloaded and ready!');
            } catch (downloadError) {
              if (this.DEBUG) console.warn('[Mosqit] Model download in progress or failed:', downloadError);
              // Still mark as available since it might work later
              this.aiAvailable = true;
              this.aiCapabilities.prompt = true;
            }
          }
        } catch (error) {
          this._debug('[Mosqit] Prompt API not available:', error);
        }
      }

      // Check for Writer API - uses window.ai
      if (!this.aiAvailable && typeof window.ai !== 'undefined' && window.ai?.writer) {
        try {
          const capabilities = await window.ai.writer.capabilities();
          console.info('[Mosqit] Writer API capabilities:', capabilities);

          if (capabilities.available === 'readily') {
            this.aiAvailable = true;
            this.aiCapabilities.writer = true;
            console.info('[Mosqit] ✅ Chrome AI Writer API ready!');
          } else if (capabilities.available === 'after-download') {
            console.info('[Mosqit] 📥 Triggering Writer model download...');
            try {
              const testWriter = await window.ai.writer.create();
              await testWriter.destroy();
              this.aiAvailable = true;
              this.aiCapabilities.writer = true;
              console.info('[Mosqit] ✅ Chrome AI Writer API model downloaded!');
            } catch (downloadError) {
              this._warn('[Mosqit] Writer model download in progress:', downloadError);
              this.aiAvailable = true;
              this.aiCapabilities.writer = true;
            }
          }
        } catch (error) {
          this._debug('[Mosqit] Writer API not available:', error);
        }
      }

      // Check for Summarizer API - uses window.ai
      if (typeof window.ai !== 'undefined' && window.ai?.summarizer) {
        try {
          const capabilities = await window.ai.summarizer.capabilities();
          if (capabilities.available === 'readily') {
            this.aiAvailable = true;
            this.aiCapabilities.summarizer = true;
            console.info('[Mosqit] ✅ Chrome AI Summarizer API ready!');
          }
        } catch (error) {
          this._debug('[Mosqit] Summarizer API not available:', error);
        }
      }

      // Check for Rewriter API - uses window.ai
      if (typeof window.ai !== 'undefined' && window.ai?.rewriter) {
        try {
          const capabilities = await window.ai.rewriter.capabilities();
          if (capabilities.available === 'readily') {
            this.aiAvailable = true;
            this.aiCapabilities.rewriter = true;
            console.info('[Mosqit] ✅ Chrome AI Rewriter API ready!');
          }
        } catch (error) {
          this._debug('[Mosqit] Rewriter API not available:', error);
        }
      }

      // Legacy API checks for backward compatibility (older Chrome versions)
      if (!this.aiAvailable) {
        // Try old Writer API (global object)
        if (typeof Writer !== 'undefined') {
          try {
            const availability = await Writer.availability();
            if (availability === 'available') {
              this.aiAvailable = true;
              this.aiCapabilities.legacyWriter = true;
              this.writerSession = await Writer.create({
                tone: 'neutral',
                format: 'plain-text',
                length: 'short',
                sharedContext: 'You are Mosqit, a debugging assistant.',
                language: 'en'
              });
              console.info('[Mosqit] ✅ Legacy Writer API available');
            }
          } catch (error) {
            this._debug('[Mosqit] Legacy Writer API error:', error);
          }
        }

        // Try old Summarizer API (global object)
        if (typeof Summarizer !== 'undefined') {
          try {
            const availability = await Summarizer.availability();
            if (availability === 'available') {
              this.aiAvailable = true;
              this.aiCapabilities.legacySummarizer = true;
              console.info('[Mosqit] ✅ Legacy Summarizer API available');
            }
          } catch (error) {
            this._debug('[Mosqit] Legacy Summarizer check failed:', error);
          }
        }
      }

      // Debug logging to see what's actually available
      if (this.DEBUG) {
        console.group('[Mosqit] 🔍 Chrome AI Detection Results');
        console.log('window.ai exists?', typeof window.ai !== 'undefined');
        if (window.ai) {
          console.log('window.ai.assistant?', !!window.ai.assistant);
          console.log('window.ai.writer?', !!window.ai.writer);
          console.log('window.ai.languageModel?', !!window.ai.languageModel);
          console.log('window.ai.summarizer?', !!window.ai.summarizer);
        }
        console.log('this.aiAvailable:', this.aiAvailable);
        console.log('this.aiCapabilities:', this.aiCapabilities);
        console.groupEnd();

        if (!this.aiAvailable) {
          console.warn('[Mosqit] ❌ Chrome AI NOT ACTIVE - Using fallback analysis');
          console.info('[Mosqit] To enable AI:');
          console.info('[Mosqit] 1. Go to chrome://flags');
          console.info('[Mosqit] 2. Enable: #prompt-api-for-gemini-nano');
          console.info('[Mosqit] 3. Enable: #optimization-guide-on-device-model');
          console.info('[Mosqit] 4. Restart Chrome completely');
        } else {
          console.info('[Mosqit] ✅ Chrome AI ACTIVE! Using real AI for analysis');
          console.info('[Mosqit] Available APIs:', this.aiCapabilities);
        }
      }

      // Retry detection after delay (if AI not available)
      if (!this.aiAvailable && !this.aiRetryAttempted) {
        this.aiRetryAttempted = true;
        setTimeout(() => {
          this._log('[Mosqit] 🔄 Retrying AI detection...');
          this.checkChromeAI();
        }, 3000);
      }
    }

    overrideConsoleMethods() {
      const originalConsole = {
        log: console.log.bind(console),
        error: console.error.bind(console),
        warn: console.warn.bind(console),
        info: console.info.bind(console),
        debug: console.debug.bind(console)
      };

      ['log', 'error', 'warn', 'info', 'debug'].forEach(method => {
        // CRITICAL FIX: Console methods MUST be synchronous
        // Defer heavy work (metadata capture, AI analysis) to avoid blocking
        console[method] = (...args) => {
          // 1. Call original console IMMEDIATELY - must be synchronous
          originalConsole[method](...args);

          // 2. Schedule heavy work for later using requestIdleCallback
          // This prevents blocking the main thread
          const scheduleWork = () => {
            try {
              // Capture metadata (this is the slow part: 140 lines, DOM queries, etc.)
              const metadata = this.captureMetadata(method, args);

              // Add to recent logs for context
              if (method !== 'error' && method !== 'warn') {
                this.recentLogs.push({
                  level: method,
                  message: metadata.message,
                  time: Date.now()
                });
                if (this.recentLogs.length > this.maxRecentLogs) {
                  this.recentLogs.shift();
                }
              }

              // For errors/warnings, provide immediate pattern analysis (fast)
              if (method === 'error' || method === 'warn') {
                metadata.analysis = this.analyzeWithPatterns(metadata);

                // UX: Mark as "AI thinking" if AI is available
                if (this.aiAvailable) {
                  metadata.aiThinking = true;
                }
              }

              // Store log immediately with pattern analysis (or no analysis for info/log)
              this.storeLog(metadata);

              // Schedule AI analysis for later (slow, async) for errors/warnings
              if ((method === 'error' || method === 'warn') && this.aiAvailable) {
                this.analyzeWithAI(metadata).then(aiAnalysis => {
                  if (aiAnalysis && aiAnalysis.trim()) {
                    // Update with AI analysis
                    metadata.analysis = aiAnalysis;
                    metadata.aiThinking = false;

                    // CRITICAL: Notify panel of the updated analysis
                    this.updateLog(metadata);
                  } else {
                    // AI returned empty, keep pattern analysis
                    metadata.aiThinking = false;
                    this.updateLog(metadata);
                  }
                }).catch(err => {
                  // AI analysis failed, keep pattern analysis
                  metadata.aiThinking = false;
                  this.updateLog(metadata);
                });
              }
            } catch (error) {
              // If there's an error in our logging, don't break the console
              originalConsole.debug('[Mosqit] Error capturing log:', error);
            }
          };

          // Use requestIdleCallback if available (better), otherwise setTimeout
          if (typeof requestIdleCallback !== 'undefined') {
            requestIdleCallback(scheduleWork, { timeout: 1000 });
          } else {
            setTimeout(scheduleWork, 0);
          }
        };
      });
    }

    captureMetadata(level, args) {
      const message = args.map(arg => {
        if (arg instanceof Error) {
          // Handle Error objects specially
          return arg.message || arg.toString();
        } else if (typeof arg === 'object' && arg !== null) {
          try {
            // Try to stringify, but handle circular references
            return JSON.stringify(arg, (key, value) => {
              // Handle circular references
              if (typeof value === 'object' && value !== null) {
                if (value instanceof Error) {
                  return value.toString();
                }
              }
              return value;
            }, 2);
          } catch {
            return String(arg);
          }
        }
        return String(arg);
      }).join(' ');

      // Get stack trace for location - improved parsing
      const stack = new Error().stack || '';
      const lines = stack.split('\n');

      // Try multiple patterns to extract location
      let file = 'unknown', line = 0, column = 0, functionName = 'anonymous';

      // Look for the first non-mosqit stack frame (skip our wrapper)
      for (let i = 2; i < lines.length; i++) {
        const callerLine = lines[i];
        if (callerLine.includes('mosqit') || callerLine.includes('captureMetadata')) {
          continue; // Skip our own functions
        }

        // Try multiple regex patterns for different stack formats
        const patterns = [
          /at\s+(\S+)\s+\((.+):(\d+):(\d+)\)/,  // Chrome: at functionName (file:line:col)
          /at\s+(.+):(\d+):(\d+)/,               // Chrome: at file:line:col
          /(\S+)@(.+):(\d+):(\d+)/,              // Firefox: functionName@file:line:col
          /\s+at\s+(.+)\s+\((.+):(\d+):(\d+)\)/, // Edge/Chrome with spaces
        ];

        for (const pattern of patterns) {
          const match = callerLine.match(pattern);
          if (match) {
            if (match.length === 5) {
              functionName = match[1] || 'anonymous';
              file = match[2];
              line = parseInt(match[3]) || 0;
              column = parseInt(match[4]) || 0;
            } else if (match.length === 4) {
              file = match[1];
              line = parseInt(match[2]) || 0;
              column = parseInt(match[3]) || 0;
            }

            // Clean up the file path
            if (file) {
              // Remove query strings and hashes
              file = file.split('?')[0].split('#')[0];
              // Get just the filename if it's a full URL
              if (file.includes('/')) {
                const parts = file.split('/');
                file = parts[parts.length - 1] || file;
              }
            }
            break;
          }
        }

        if (file !== 'unknown') break; // Found a valid location
      }

      // Extract function name from stack if not found
      if (functionName === 'anonymous') {
        const functionMatch = lines[3]?.match(/at\s+(\S+)\s+\(/);
        functionName = functionMatch ? functionMatch[1] : 'anonymous';
      }

      // Check if this error is related to recent errors
      const isRelatedError = this.lastErrorTime && (Date.now() - this.lastErrorTime < 2000);

      // Capture DOM context and dependencies
      const domContext = this.captureDOMContext();
      const dependencies = this.detectDependencies();

      const metadata = {
        message,
        level,
        timestamp: Date.now(),
        file: file || 'unknown',
        line: line || 0,
        column: column || 0,
        url: window.location.href,
        functionName,
        stack: stack.substring(0, 1000), // Include more stack trace
        userAction: this.lastUserAction,
        actionHistory: this.userActionHistory.slice(0, 3), // Last 3 actions
        recentLogs: this.recentLogs.slice(-5), // Last 5 logs before error
        relatedToLastError: isRelatedError,
        previousError: isRelatedError ? this.lastError : null,
        // DOM Context
        domContext,
        // DOM Snapshot for visual debugging
        domSnapshot: this.captureDOMSnapshot(),
        // Dependencies
        dependencies,
        // Additional metadata
        userAgent: navigator.userAgent,
        viewport: {
          width: window.innerWidth,
          height: window.innerHeight
        },
        performance: {
          memory: performance.memory ? {
            used: Math.round(performance.memory.usedJSHeapSize / 1048576) + ' MB',
            total: Math.round(performance.memory.totalJSHeapSize / 1048576) + ' MB'
          } : null,
          timing: performance.timing ? {
            loadTime: performance.timing.loadEventEnd - performance.timing.navigationStart,
            domReady: performance.timing.domContentLoadedEventEnd - performance.timing.navigationStart
          } : null
        },
        browser: {
          language: navigator.language,
          online: navigator.onLine,
          cookieEnabled: navigator.cookieEnabled
        }
      };

      // Update last error tracking
      if (level === 'error' || level === 'warn') {
        this.lastErrorTime = Date.now();
        this.lastError = message;
      }

      return metadata;
    }

    // PERFORMANCE FIX: Check if we can make an AI call (rate limiting)
    canMakeAICall() {
      // Check concurrent calls limit
      if (this.activeAICalls >= this.maxConcurrentAICalls) {
        return false;
      }

      // Check minimum interval between calls
      const now = Date.now();
      if (now - this.lastAICallTime < this.minAICallInterval) {
        return false;
      }

      // Check calls per minute limit
      const oneMinuteAgo = now - 60000;
      this.aiCallTimestamps = this.aiCallTimestamps.filter(t => t > oneMinuteAgo);
      if (this.aiCallTimestamps.length >= this.maxAICallsPerMinute) {
        return false;
      }

      return true;
    }

    // PERFORMANCE FIX: Rate-limited AI analysis
    async analyzeWithAI(metadata) {
      if (!this.aiAvailable) return this.analyzeWithPatterns(metadata);

      // PERFORMANCE FIX: Apply rate limiting
      if (!this.canMakeAICall()) {
        console.debug('[Mosqit] AI call rate limited, using pattern analysis');
        return this.analyzeWithPatterns(metadata);
      }

      // Track this AI call
      this.activeAICalls++;
      this.lastAICallTime = Date.now();
      this.aiCallTimestamps.push(this.lastAICallTime);

      try {
        // Try Prompt API first (most powerful)
        if (this.aiCapabilities.prompt && window.ai?.assistant) {
          this._log('[Mosqit] Using Prompt API for analysis');
          if (!this.promptSession) {
            try {
              this.promptSession = await window.ai.assistant.create();
              this._log('[Mosqit] Created assistant session');
            } catch (e) {
              this._warn('[Mosqit] Failed to create assistant session:', e);
              this.aiCapabilities.prompt = false;
            }
          }

          if (this.promptSession) {
            const errorType = this.getErrorType(metadata.message);
            const prompt = `Analyze this ${errorType}: ${metadata.message.substring(0, 200)}\nFile: ${metadata.file}\nProvide: 1) Root cause 2) Quick fix`;

            try {
              const response = await this.promptSession.prompt(prompt);
              this._log('[Mosqit] AI response received');
              return `🤖 ${response.substring(0, 300)}`;
            } catch (e) {
              this._warn('[Mosqit] Prompt failed:', e);
              this.promptSession = null;
            }
          }
        }

        // Fall back to Writer API if available
        if (!this.writerSession && this.aiCapabilities.writer && window.ai?.writer) {
          this._log('[Mosqit] Trying Writer API for analysis');
          try {
            this.writerSession = await window.ai.writer.create({
              tone: 'neutral',
              format: 'plain-text',
              length: 'medium',
              sharedContext: 'You are a debugging assistant analyzing JavaScript errors.'
            });
            this._log('[Mosqit] Created writer session');
          } catch (e) {
            console.warn('[Mosqit] Failed to create writer session:', e);
            this.aiCapabilities.writer = false;
          }
        }

        if (!this.writerSession && !this.promptSession) {
          this._log('[Mosqit] No AI sessions available, using patterns');
          return this.analyzeWithPatterns(metadata);
        }


        // Simplify prompt to avoid AI quality rejection
        const errorCore = metadata.message.substring(0, 150);
        const prompt = `Fix this error: ${errorCore}\nLocation: ${metadata.file}:${metadata.line}`;

        const response = await this.writerSession.write(prompt);

        // Clean up the response
        let cleanResponse = response
          .replace(/```[\s\S]*?```/g, '') // Remove any code blocks entirely
          .replace(/\/\/\s+/g, '') // Remove comment markers
          .replace(/\n\s*\n/g, '\n') // Remove extra blank lines
          .trim();

        // If response contains code snippets, extract just the explanation
        if (cleanResponse.includes('fetch(') || cleanResponse.includes('try {') || cleanResponse.includes('.then(')) {
          // Try to extract just the descriptive text
          const sentences = cleanResponse.match(/[^.!?]+[.!?]+/g) || [];
          cleanResponse = sentences.filter(s => !s.includes('{') && !s.includes('}') && !s.includes('=>')).join(' ').trim();
        }

        // Limit to reasonable length but keep complete
        const lines = cleanResponse.split('\n').slice(0, 3);
        let result = lines.join(' ').trim();

        // Ensure we don't cut off mid-sentence
        if (result.length > 400) {
          result = result.substring(0, 400);
          const lastSentence = result.match(/.*[.!?]/);
          if (lastSentence) {
            result = lastSentence[0];
          }
        }

        return `🤖 ${result}`;
      } catch (error) {
        console.debug('[Mosqit] AI analysis failed:', error);
        // Clean up failed sessions
        this.promptSession = null;
        this.writerSession = null;
        return this.analyzeWithPatterns(metadata);
      } finally {
        // PERFORMANCE FIX: Always decrement active calls counter
        this.activeAICalls = Math.max(0, this.activeAICalls - 1);
      }
    }

    getErrorType(message) {
      if (message.includes('not defined')) return 'Undefined variable';
      if (message.includes('null')) return 'Null reference';
      if (message.includes('undefined')) return 'Undefined reference';
      if (message.includes('TypeError')) return 'Type error';
      if (message.includes('SyntaxError')) return 'Syntax error';
      if (message.includes('fetch')) return 'Network error';
      if (message.includes('Promise')) return 'Promise rejection';
      return 'JavaScript error';
    }

    analyzeWithPatterns(metadata) {
      // Extended pattern matching with 40+ patterns
      const patterns = {
        // Null/Undefined errors
        'Cannot read propert(y|ies) of null': '🔴 Null reference error. Object is null when trying to access property.',
        'Cannot read propert(y|ies) of undefined': '🔴 Undefined reference. Check if object exists before accessing.',
        'null|undefined': '🔴 Null/undefined reference. Use optional chaining (?.) or null checks.',
        'is not defined': '🔴 Variable not defined. Check spelling, scope, and imports.',
        'undefined is not a function': '🔴 Calling undefined as function. Verify method exists.',
        'undefined is not an object': '🔴 Treating undefined as object. Add existence check.',

        // Type errors
        'TypeError': '🔴 Type mismatch. Verify data types match expected values.',
        'is not a function': '🔴 Not a function. Check if variable is actually a function.',
        'is not a constructor': '🔴 Not a constructor. Use `new` only with constructors.',
        'Cannot convert undefined or null': '🔴 Invalid conversion. Check for null/undefined.',

        // Syntax errors
        'SyntaxError': '🔴 Syntax error. Check brackets, quotes, and semicolons.',
        'Unexpected token': '🔴 Unexpected token. Check syntax near this location.',
        'Unexpected end of': '🔴 Incomplete code. Check for missing brackets or quotes.',
        'Missing': '🔴 Missing element. Check for required syntax components.',

        // Reference errors
        'ReferenceError': '🔴 Reference error. Variable or function not found.',
        'is not defined': '🔴 Not defined. Check variable declaration and scope.',
        'Can\'t find variable': '🔴 Variable not found. Ensure it\'s declared.',

        // Network/Fetch errors
        'Failed to fetch': '🟡 Fetch failed. Check network, URL, and CORS policy.',
        'NetworkError': '🟡 Network error. Verify internet connection and endpoint.',
        'CORS': '🟡 CORS blocked. Configure server for cross-origin requests.',
        'ERR_NETWORK': '🟡 Network issue. Check connectivity and server status.',
        'ERR_INTERNET_DISCONNECTED': '🟡 No internet. Check network connection.',
        '404': '🟡 Not found. Resource doesn\'t exist at specified URL.',
        '500': '🟡 Server error. Internal server error occurred.',
        '403': '🟡 Forbidden. Access denied to resource.',
        '401': '🟡 Unauthorized. Authentication required or failed.',
        'timeout': '🟡 Timeout. Request took too long, consider retry logic.',
        'fetch|xhr|ajax': '🟡 HTTP request issue. Check API endpoint and method.',

        // Async/Promise errors
        'UnhandledPromiseRejection': '🔵 Unhandled promise rejection. Add .catch() handler.',
        'async|await': '🔵 Async issue. Ensure proper await usage and error handling.',
        'Promise': '🔵 Promise error. Add proper rejection handling.',
        'regeneratorRuntime': '🔵 Async polyfill missing. Add regenerator-runtime.',

        // DOM errors
        'Cannot read property \'addEventListener\'': '🟠 DOM element missing. Element might not exist.',
        'getElementById.*null': '🟠 Element not found. Check element ID exists.',
        'querySelector.*null': '🟠 Selector found nothing. Verify selector syntax.',
        'is not a valid selector': '🟠 Invalid selector. Check CSS selector syntax.',
        'DOM': '🟠 DOM manipulation issue. Check element exists before use.',

        // Memory/Performance
        'Maximum call stack': '🔥 Stack overflow. Check for infinite recursion.',
        'out of memory': '🔥 Memory exhausted. Optimize memory usage.',
        'too much recursion': '🔥 Excessive recursion. Add base case to recursion.',

        // Module/Import errors
        'Cannot find module': '📦 Module not found. Check package installation.',
        'Module not found': '📦 Missing module. Run npm/yarn install.',
        'import|export': '📦 Module issue. Check import/export syntax.',
        'require is not defined': '📦 CommonJS in browser. Use ES6 imports or bundler.',

        // Security
        'Content Security Policy': '🔒 CSP violation. Adjust security policy settings.',
        'Refused to execute': '🔒 Security block. Check CSP headers.',
        'Insecure': '🔒 Security warning. Use HTTPS for secure context.',

        // Browser compatibility
        'is not supported': '⚠️ Not supported. Feature unavailable in this browser.',
        'deprecated': '⚠️ Deprecated feature. Use modern alternative.',

        // React/Vue/Angular specific
        'Cannot read property \'props\'': '⚛️ React props issue. Check component props.',
        'Cannot read property \'state\'': '⚛️ React state issue. Initialize state properly.',
        'Maximum update depth': '⚛️ React infinite loop. Check useEffect dependencies.',
        'Vue warn': '🟢 Vue warning. Check Vue component implementation.',
        'Angular': '🔺 Angular error. Check Angular module/component.',

        // Default
        'error': '❌ General error detected. Check console for details.',
        'warning': '⚠️ Warning detected. Review for potential issues.'
      };

      // Check each pattern
      for (const [pattern, analysis] of Object.entries(patterns)) {
        if (new RegExp(pattern, 'i').test(metadata.message)) {
          return analysis;
        }
      }

      // Fallback with location info
      return `🔵 ${metadata.level} at ${metadata.file}:${metadata.line}`;
    }

    captureDOMContext() {
      try {
        const activeElement = document.activeElement;
        const context = {
          // Active element info
          activeElement: activeElement ? {
            tagName: activeElement.tagName,
            id: activeElement.id || null,
            className: activeElement.className || null,
            type: activeElement.type || null,
            name: activeElement.name || null,
            value: activeElement.value ? '(has value)' : null,
            href: activeElement.href || null
          } : null,

          // Document state
          documentState: {
            readyState: document.readyState,
            title: document.title,
            domain: document.domain,
            referrer: document.referrer,
            characterSet: document.characterSet
          },

          // Viewport and scroll
          viewport: {
            scrollX: window.scrollX,
            scrollY: window.scrollY,
            innerWidth: window.innerWidth,
            innerHeight: window.innerHeight,
            documentHeight: document.documentElement.scrollHeight,
            documentWidth: document.documentElement.scrollWidth
          },

          // Forms, media, resources counts
          counts: {
            forms: document.forms.length,
            images: document.images.length,
            videos: document.getElementsByTagName('video').length,
            audios: document.getElementsByTagName('audio').length,
            scripts: document.scripts.length,
            stylesheets: document.styleSheets.length,
            iframes: document.getElementsByTagName('iframe').length
          },

          // Selection text if any
          selection: window.getSelection ? {
            text: window.getSelection().toString().substring(0, 100),
            rangeCount: window.getSelection().rangeCount
          } : null
        };

        return context;
      } catch (error) {
        console.debug('[Mosqit] Error capturing DOM context:', error);
        return null;
      }
    }

    captureDOMSnapshot() {
      try {
        const snapshot = {
          html: null,
          elementPath: null,
          boundingBox: null,
          computedStyles: null,
          screenshot: null
        };

        // Find the error-related element
        const element = this.findErrorElement();

        if (element) {
          // Capture element HTML (sanitized)
          snapshot.html = this.sanitizeHTML(element.outerHTML);

          // Get element path (CSS selector)
          snapshot.elementPath = this.getElementPath(element);

          // Get bounding box
          const rect = element.getBoundingClientRect();
          snapshot.boundingBox = {
            top: rect.top,
            left: rect.left,
            width: rect.width,
            height: rect.height,
            visible: rect.width > 0 && rect.height > 0
          };

          // Get key computed styles
          const styles = window.getComputedStyle(element);
          snapshot.computedStyles = {
            display: styles.display,
            position: styles.position,
            visibility: styles.visibility,
            opacity: styles.opacity,
            zIndex: styles.zIndex,
            backgroundColor: styles.backgroundColor,
            color: styles.color,
            fontSize: styles.fontSize,
            overflow: styles.overflow
          };

          // Highlight element for visual debugging - DISABLED due to persistence issues
          // this.highlightElement(element);
        }

        // Capture viewport screenshot context
        snapshot.viewport = {
          width: window.innerWidth,
          height: window.innerHeight,
          scrollX: window.scrollX,
          scrollY: window.scrollY
        };

        return snapshot;
      } catch (error) {
        console.debug('[Mosqit] Error capturing DOM snapshot:', error);
        return null;
      }
    }

    findErrorElement() {
      // Priority 1: Last interacted element
      if (this.lastInteractedElement && document.body.contains(this.lastInteractedElement)) {
        return this.lastInteractedElement;
      }

      // Priority 2: Active element
      if (document.activeElement && document.activeElement !== document.body) {
        return document.activeElement;
      }

      // Priority 3: Elements with error states
      const errorSelectors = [
        '.error', '.has-error', '[data-error]',
        '.invalid', '.is-invalid', '[aria-invalid="true"]',
        '.danger', '.alert-danger'
      ];

      for (const selector of errorSelectors) {
        const element = document.querySelector(selector);
        if (element) return element;
      }

      return null;
    }

    getElementPath(element) {
      const path = [];
      while (element && element.nodeType === Node.ELEMENT_NODE) {
        let selector = element.tagName.toLowerCase();

        if (element.id) {
          selector = `#${element.id}`;
          path.unshift(selector);
          break;
        } else if (element.className && typeof element.className === 'string') {
          selector += `.${element.className.split(' ').filter(c => c).join('.')}`;
        }

        path.unshift(selector);
        element = element.parentElement;
      }

      return path.join(' > ');
    }

    sanitizeHTML(html) {
      if (!html) return '';

      // Truncate if too long
      let sanitized = html.substring(0, 3000);

      // ENHANCED SANITIZATION for GDPR/HIPAA compliance

      // 1. Sensitive field attributes (name, id, class patterns)
      const sensitiveFieldPatterns = [
        /password/gi, /passwd/gi, /pwd/gi,
        /ssn/gi, /social[_-]?security/gi,
        /credit[_-]?card/gi, /card[_-]?number/gi, /cvv/gi, /cvc/gi,
        /bank[_-]?account/gi, /routing[_-]?number/gi,
        /api[_-]?key/gi, /secret/gi, /token/gi, /auth/gi,
        /pin/gi, /security[_-]?code/gi,
        /dob/gi, /birth[_-]?date/gi,
        /passport/gi, /license/gi, /driver/gi,
        /medical/gi, /diagnosis/gi, /patient/gi, /health/gi
      ];

      // 2. Replace value attributes in sensitive fields
      sanitized = sanitized.replace(/(<input[^>]*(password|ssn|credit|card|cvv|pin|secret|token|key)[^>]*)value="[^"]*"/gi, '$1value="[REDACTED]"');
      sanitized = sanitized.replace(/(<input[^>]*(password|ssn|credit|card|cvv|pin|secret|token|key)[^>]*)value='[^']*'/gi, "$1value='[REDACTED]'");

      // 3. Replace attribute values that look sensitive
      sanitized = sanitized.replace(/(password|passwd|pwd|token|secret|api[_-]?key|auth[_-]?token|bearer)="[^"]*"/gi, '$1="[REDACTED]"');
      sanitized = sanitized.replace(/(password|passwd|pwd|token|secret|api[_-]?key|auth[_-]?token|bearer)='[^']*'/gi, "$1='[REDACTED]'");

      // 4. Redact credit card numbers (various formats)
      sanitized = sanitized.replace(/\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g, '[CARD-REDACTED]');

      // 5. Redact SSN patterns (XXX-XX-XXXX or XXXXXXXXX)
      sanitized = sanitized.replace(/\b\d{3}-?\d{2}-?\d{4}\b/g, '[SSN-REDACTED]');

      // 6. Redact email addresses (privacy)
      sanitized = sanitized.replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, '[EMAIL-REDACTED]');

      // 7. Redact phone numbers (various formats)
      sanitized = sanitized.replace(/\b(\+\d{1,3}[\s-]?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}\b/g, '[PHONE-REDACTED]');

      // 8. Redact Bearer tokens in text content
      sanitized = sanitized.replace(/Bearer\s+[A-Za-z0-9_\-\.]+/gi, 'Bearer [TOKEN-REDACTED]');

      // 9. Redact JWT tokens (look like xxx.yyy.zzz)
      sanitized = sanitized.replace(/\beyJ[A-Za-z0-9_\-]+\.[A-Za-z0-9_\-]+\.[A-Za-z0-9_\-]+/g, '[JWT-REDACTED]');

      // 10. Redact API keys (common patterns: 32+ alphanumeric)
      sanitized = sanitized.replace(/\b[A-Za-z0-9]{32,}\b/g, (match) => {
        // Only redact if it looks like a key (no spaces, mixed case)
        return /[A-Z]/.test(match) && /[a-z]/.test(match) ? '[KEY-REDACTED]' : match;
      });

      // 11. Redact data: URIs with base64 (can contain sensitive screenshots/files)
      sanitized = sanitized.replace(/data:image\/[^;]+;base64,[A-Za-z0-9+\/=]+/g, 'data:image/[REDACTED];base64,[REDACTED]');

      // 12. Redact JSON values with sensitive keys
      sanitized = sanitized.replace(/"(password|token|secret|apiKey|api_key|accessToken|refreshToken|sessionId|authToken)"\s*:\s*"[^"]*"/gi, '"$1":"[REDACTED]"');

      return sanitized;
    }

    highlightElement(element) {
      if (!element) return;

      // Check if element is already highlighted
      if (this.highlightedElements.has(element)) {
        const existingTimeout = this.highlightedElements.get(element);
        clearTimeout(existingTimeout);
        this.highlightTimeouts.delete(existingTimeout);
      }

      // Store original styles more robustly
      const originalStyles = {
        outline: element.style.outline,
        boxShadow: element.style.boxShadow,
        transition: element.style.transition
      };

      // Create a unique class for this highlight to avoid conflicts
      const highlightClass = 'mosqit-error-highlight-' + Date.now();

      // Add styles via a temporary style element to avoid inline style conflicts
      const styleEl = document.createElement('style');
      styleEl.textContent = `
        .${highlightClass} {
          outline: 3px solid #ff4444 !important;
          box-shadow: 0 0 20px rgba(255, 68, 68, 0.5) !important;
          transition: all 0.3s ease !important;
        }
      `;
      document.head.appendChild(styleEl);
      element.classList.add(highlightClass);

      // Remove highlight after 3 seconds
      const timeoutId = setTimeout(() => {
        // Remove the highlight class
        if (element && document.body.contains(element)) {
          element.classList.remove(highlightClass);

          // Restore original inline styles if they existed
          element.style.outline = originalStyles.outline || '';
          element.style.boxShadow = originalStyles.boxShadow || '';
          element.style.transition = originalStyles.transition || '';
        }

        // Clean up the style element
        if (styleEl && styleEl.parentNode) {
          styleEl.parentNode.removeChild(styleEl);
        }

        // Clean up tracking
        this.highlightedElements.delete(element);
        this.highlightTimeouts.delete(timeoutId);
      }, 3000);

      // Track the timeout for cleanup
      this.highlightedElements.set(element, timeoutId);
      this.highlightTimeouts.add(timeoutId);
    }

    // Add cleanup method
    cleanupHighlights() {
      // Clear all pending timeouts
      for (const timeoutId of this.highlightTimeouts) {
        clearTimeout(timeoutId);
      }
      this.highlightTimeouts.clear();

      // Remove any lingering highlight classes
      const highlightedElements = document.querySelectorAll('[class*="mosqit-error-highlight-"]');
      highlightedElements.forEach(element => {
        const classes = Array.from(element.classList);
        classes.forEach(className => {
          if (className.startsWith('mosqit-error-highlight-')) {
            element.classList.remove(className);
          }
        });
      });

      // Remove any lingering style elements
      const styleElements = document.querySelectorAll('style');
      styleElements.forEach(style => {
        if (style.textContent && style.textContent.includes('mosqit-error-highlight-')) {
          style.parentNode?.removeChild(style);
        }
      });
    }

    detectDependencies() {
      try {
        const dependencies = {
          frameworks: [],
          libraries: [],
          analytics: [],
          cdns: []
        };

        // MODERNIZED: Detect frameworks using DOM introspection and DevTools hooks
        // PERFORMANCE: Single DOM scan for all frameworks to avoid multiple passes

        // Quick window-based checks (no DOM scan)
        const quickChecks = {
          react: window.__REACT_DEVTOOLS_GLOBAL_HOOK__,
          nextjs: window.__NEXT_DATA__,
          vue: window.__VUE_DEVTOOLS_GLOBAL_HOOK__,
          nuxt: window.$nuxt || window.__NUXT__,
          angular: window.ng || window.angular || typeof window.getAllAngularRootElements === 'function',
          svelte: window.__sveltekit__,
          preact: window.__PREACT_DEVTOOLS__,
          remix: window.__remixContext,
          gatsby: window.___gatsby,
          qwik: window.qwikloader$,
          ember: window.Ember,
          backbone: window.Backbone,
          alpine: window.Alpine,
          htmx: window.htmx,
          stimulus: window.Stimulus
        };

        // Single optimized DOM scan (limited to first 50 elements for performance)
        const domIndicators = {
          react: false,
          vue: false,
          angular: false,
          svelte: false,
          solid: false,
          preact: false
        };

        // Check special elements first (faster)
        if (document.querySelector('[data-reactroot], [data-reactid]')) domIndicators.react = true;
        if (document.querySelector('script[src*="/_next/"]')) quickChecks.nextjs = true;
        if (document.querySelector('[data-sveltekit]')) quickChecks.svelte = true;
        if (document.querySelector('#___gatsby')) quickChecks.gatsby = true;
        if (document.querySelector('astro-island')) domIndicators.astro = true;
        if (document.querySelector('[q\\:container]')) quickChecks.qwik = true;
        if (document.querySelector('script[src*="svelte"]')) domIndicators.svelte = true;

        // Efficient DOM scan for framework properties (sample first 50 elements)
        const elementsToCheck = Array.from(document.querySelectorAll('body, body > *, #app, #root, [id*="app"], [id*="root"]')).slice(0, 50);
        for (const el of elementsToCheck) {
          // React indicators
          if (!domIndicators.react && (
            el._reactRootContainer ||
            el._reactRoot ||
            Object.keys(el).some(key => key.startsWith('__reactContainer') || key.startsWith('__reactFiber'))
          )) {
            domIndicators.react = true;
          }

          // Vue indicators
          if (!domIndicators.vue && (el.__vue__ || el.__vueParentComponent || el.__vue_app__)) {
            domIndicators.vue = true;
          }

          // Angular indicators
          if (!domIndicators.angular && el.__ngContext__ !== undefined) {
            domIndicators.angular = true;
          }

          // Svelte indicators
          if (!domIndicators.svelte && el.__svelte_meta !== undefined) {
            domIndicators.svelte = true;
          }

          // Solid.js indicators
          if (!domIndicators.solid && el._$owner !== undefined) {
            domIndicators.solid = true;
          }

          // Preact indicators
          if (!domIndicators.preact && el.__preactattr_ !== undefined) {
            domIndicators.preact = true;
          }

          // Early exit if we found all frameworks
          if (domIndicators.react && domIndicators.vue && domIndicators.angular &&
              domIndicators.svelte && domIndicators.solid && domIndicators.preact) {
            break;
          }
        }

        // Build framework list from checks
        if (quickChecks.react || domIndicators.react) {
          const version = window.React?.version || 'detected';
          dependencies.frameworks.push('React ' + version);
        }

        if (quickChecks.nextjs) {
          dependencies.frameworks.push('Next.js');
        }

        if (quickChecks.vue || domIndicators.vue) {
          const version = window.Vue?.version || 'detected';
          dependencies.frameworks.push('Vue ' + version);
        }

        if (quickChecks.nuxt) {
          dependencies.frameworks.push('Nuxt.js');
        }

        if (quickChecks.angular || domIndicators.angular) {
          dependencies.frameworks.push('Angular');
        }

        if (quickChecks.svelte || domIndicators.svelte) {
          dependencies.frameworks.push('Svelte');
        }

        if (domIndicators.solid) {
          dependencies.frameworks.push('Solid.js');
        }

        if (quickChecks.preact || domIndicators.preact) {
          dependencies.frameworks.push('Preact');
        }

        if (quickChecks.remix) {
          dependencies.frameworks.push('Remix');
        }

        if (quickChecks.gatsby || domIndicators.astro) {
          if (quickChecks.gatsby) dependencies.frameworks.push('Gatsby');
          if (domIndicators.astro) dependencies.frameworks.push('Astro');
        }

        if (quickChecks.qwik) {
          dependencies.frameworks.push('Qwik');
        }

        // Legacy frameworks (simple window checks)
        if (quickChecks.ember) dependencies.frameworks.push('Ember');
        if (quickChecks.backbone) dependencies.frameworks.push('Backbone');
        if (quickChecks.alpine) dependencies.frameworks.push('Alpine.js');
        if (quickChecks.htmx) dependencies.frameworks.push('HTMX');
        if (quickChecks.stimulus) dependencies.frameworks.push('Stimulus');

        // Detect libraries
        if (window.jQuery || window.$) {
          const version = window.jQuery?.fn?.jquery || '';
          dependencies.libraries.push('jQuery ' + version);
        }
        if (window._) dependencies.libraries.push('Lodash/Underscore');
        if (window.axios) dependencies.libraries.push('Axios');
        if (window.moment) dependencies.libraries.push('Moment.js');
        if (window.dayjs) dependencies.libraries.push('Day.js');
        if (window.Chart) dependencies.libraries.push('Chart.js');
        if (window.D3 || window.d3) dependencies.libraries.push('D3.js');
        if (window.THREE) dependencies.libraries.push('Three.js');
        if (window.PIXI) dependencies.libraries.push('PixiJS');
        if (window.Phaser) dependencies.libraries.push('Phaser');
        if (window.io) dependencies.libraries.push('Socket.io');
        if (window.SignalR) dependencies.libraries.push('SignalR');
        if (window.Pusher) dependencies.libraries.push('Pusher');

        // Detect analytics and monitoring
        if (window.ga || window.gtag || window.google_tag_manager) {
          dependencies.analytics.push('Google Analytics');
        }
        if (window.fbq || window._fbq) dependencies.analytics.push('Facebook Pixel');
        if (window.mixpanel) dependencies.analytics.push('Mixpanel');
        if (window.amplitude) dependencies.analytics.push('Amplitude');
        if (window.heap) dependencies.analytics.push('Heap');
        if (window.Segment || window.analytics) dependencies.analytics.push('Segment');
        if (window.Sentry) dependencies.analytics.push('Sentry');
        if (window.Bugsnag) dependencies.analytics.push('Bugsnag');
        if (window.LogRocket) dependencies.analytics.push('LogRocket');
        if (window.FullStory) dependencies.analytics.push('FullStory');
        if (window.Hotjar) dependencies.analytics.push('Hotjar');
        if (window.Rollbar) dependencies.analytics.push('Rollbar');

        // Detect CDNs from script sources
        const scripts = Array.from(document.scripts);
        const cdnPatterns = {
          'cdn.jsdelivr.net': 'jsDelivr',
          'unpkg.com': 'UNPKG',
          'cdnjs.cloudflare.com': 'cdnjs',
          'ajax.googleapis.com': 'Google CDN',
          'cdn.bootcss.com': 'BootCDN',
          'cdn.staticfile.org': 'Staticfile CDN',
          'maxcdn.bootstrapcdn.com': 'Bootstrap CDN',
          'code.jquery.com': 'jQuery CDN'
        };

        scripts.forEach(script => {
          if (script.src) {
            for (const [pattern, cdnName] of Object.entries(cdnPatterns)) {
              if (script.src.includes(pattern) && !dependencies.cdns.includes(cdnName)) {
                dependencies.cdns.push(cdnName);
              }
            }
          }
        });

        // Remove duplicates
        Object.keys(dependencies).forEach(key => {
          dependencies[key] = [...new Set(dependencies[key])];
        });

        // Add summary
        dependencies.summary = {
          frameworksCount: dependencies.frameworks.length,
          librariesCount: dependencies.libraries.length,
          analyticsCount: dependencies.analytics.length,
          cdnsCount: dependencies.cdns.length,
          totalDependencies: dependencies.frameworks.length + dependencies.libraries.length
        };

        return dependencies;
      } catch (error) {
        console.debug('[Mosqit] Error detecting dependencies:', error);
        return {
          frameworks: [],
          libraries: [],
          analytics: [],
          cdns: [],
          summary: { error: 'Failed to detect dependencies' }
        };
      }
    }

    storeLog(metadata) {
      this.logs.push(metadata);
      if (this.logs.length > this.maxLogs) {
        this.logs.shift();
      }

      // Track error patterns
      if (metadata.level === 'error') {
        const key = `${metadata.file}:${metadata.line}`;
        this.errorPatterns.set(key, (this.errorPatterns.get(key) || 0) + 1);

        // MEMORY FIX: Limit errorPatterns map size to prevent unbounded growth
        if (this.errorPatterns.size > this.maxErrorPatterns) {
          // Remove oldest entry (first entry in Map)
          const firstKey = this.errorPatterns.keys().next().value;
          this.errorPatterns.delete(firstKey);
        }

        // Alert on recurring errors
        if (this.errorPatterns.get(key) === 3) {
          console.warn(`[Mosqit] 🔄 Recurring error detected at ${key}`);
        }
      }

      // Send to extension via bridge (MAIN world can't use chrome.runtime)
      // Use postMessage to communicate with ISOLATED world bridge
      try {
        window.postMessage({
          type: 'MOSQIT_LOG_FROM_MAIN',
          data: metadata
        }, window.location.origin); // SECURITY FIX: Use specific origin
      } catch (e) {
        // Failed to post message
        console.warn('[Mosqit] Failed to send log to extension:', e);
      }
    }

    // PERFORMANCE FIX: Update an existing log (when AI analysis completes)
    updateLog(metadata) {
      // The log is already updated in this.logs by reference
      // Just notify the panel about the update
      try {
        window.postMessage({
          type: 'MOSQIT_LOG_UPDATE',
          data: metadata
        }, window.location.origin);
      } catch (e) {
        console.warn('[Mosqit] Failed to send log update to extension:', e);
      }
    }

    setupErrorListener() {
      const originalConsole = console.info.bind(console);

      window.addEventListener('error', async (event) => {
        // Extract function name from stack if available
        const stack = event.error?.stack || '';
        const functionMatch = stack.match(/at\s+(\S+)\s+\(/);
        const functionName = functionMatch ? functionMatch[1] : 'global';

        // Clean up the file path
        let file = event.filename || 'unknown';
        if (file !== 'unknown' && file.includes('/')) {
          const parts = file.split('/');
          file = parts[parts.length - 1] || file;
        }

        const metadata = {
          message: event.message,
          level: 'error',
          timestamp: Date.now(),
          file: file,
          line: event.lineno || 0,
          column: event.colno || 0,
          stack: stack.substring(0, 1000),
          url: window.location.href,
          functionName,
          userAction: this.lastUserAction,
          actionHistory: this.userActionHistory.slice(0, 3),
          recentLogs: this.recentLogs.slice(-5),
          relatedToLastError: this.lastErrorTime && (Date.now() - this.lastErrorTime < 2000),
          previousError: this.lastError,
          // Additional metadata
          userAgent: navigator.userAgent,
          viewport: {
            width: window.innerWidth,
            height: window.innerHeight
          },
          performance: {
            memory: performance.memory ? {
              used: Math.round(performance.memory.usedJSHeapSize / 1048576) + ' MB',
              total: Math.round(performance.memory.totalJSHeapSize / 1048576) + ' MB'
            } : null
          },
          browser: {
            language: navigator.language,
            online: navigator.onLine,
            cookieEnabled: navigator.cookieEnabled
          }
        };

        // Pattern analysis first (fast)
        metadata.analysis = this.analyzeWithPatterns(metadata);

        // UX: Mark as "AI thinking" if AI is available
        if (this.aiAvailable) {
          metadata.aiThinking = true;
        }

        // Store log with pattern analysis
        this.storeLog(metadata);

        // PERFORMANCE FIX: Run AI analysis async without blocking
        if (this.aiAvailable) {
          this.analyzeWithAI(metadata).then(aiAnalysis => {
            if (aiAnalysis && aiAnalysis.trim()) {
              metadata.analysis = aiAnalysis;
              metadata.aiThinking = false;
              this.updateLog(metadata);
            } else {
              metadata.aiThinking = false;
              this.updateLog(metadata);
            }
          }).catch(err => {
            metadata.aiThinking = false;
            this.updateLog(metadata);
          });
        }
      });

      window.addEventListener('unhandledrejection', async (event) => {
        const originalConsole = console.info.bind(console);

        // Extract more context from the promise rejection
        const errorMessage = event.reason?.message || event.reason || 'Unknown promise rejection';
        const stack = event.reason?.stack || new Error().stack || '';

        // Parse location from stack with improved patterns
        let file = 'async context', line = 0, column = 0, functionName = 'Promise';
        const lines = stack.split('\n');

        for (let i = 1; i < lines.length; i++) {
          const callerLine = lines[i];
          if (callerLine.includes('mosqit')) continue;

          const patterns = [
            /at\s+(\S+)\s+\((.+):(\d+):(\d+)\)/,
            /at\s+(.+):(\d+):(\d+)/,
            /(\S+)@(.+):(\d+):(\d+)/
          ];

          for (const pattern of patterns) {
            const match = callerLine.match(pattern);
            if (match) {
              if (match.length === 5) {
                functionName = match[1] || 'Promise';
                file = match[2];
                line = parseInt(match[3]) || 0;
                column = parseInt(match[4]) || 0;
              } else if (match.length === 4) {
                file = match[1];
                line = parseInt(match[2]) || 0;
                column = parseInt(match[3]) || 0;
              }

              // Clean file path
              if (file && file.includes('/')) {
                const parts = file.split('/');
                file = parts[parts.length - 1];
              }
              break;
            }
          }

          if (file !== 'async context') break;
        }

        // File, line, column, and functionName were extracted above

        const metadata = {
          message: `Unhandled Promise: ${errorMessage}`,
          level: 'error',
          timestamp: Date.now(),
          url: window.location.href,
          functionName,
          file,
          line,
          column,
          stack: stack.substring(0, 500),
          userAction: this.lastUserAction,
          actionHistory: this.userActionHistory.slice(0, 3),
          recentLogs: this.recentLogs.slice(-5),
          relatedToLastError: this.lastErrorTime && (Date.now() - this.lastErrorTime < 2000),
          previousError: this.lastError
        };

        // Pattern analysis first (fast)
        metadata.analysis = this.analyzeWithPatterns(metadata);

        // UX: Mark as "AI thinking" if AI is available
        if (this.aiAvailable) {
          metadata.aiThinking = true;
        }

        // Store log with pattern analysis
        this.storeLog(metadata);

        // PERFORMANCE FIX: Run AI analysis async without blocking
        if (this.aiAvailable) {
          this.analyzeWithAI(metadata).then(aiAnalysis => {
            if (aiAnalysis && aiAnalysis.trim()) {
              metadata.analysis = aiAnalysis;
              metadata.aiThinking = false;
              this.updateLog(metadata);
            } else {
              metadata.aiThinking = false;
              this.updateLog(metadata);
            }
          }).catch(err => {
            metadata.aiThinking = false;
            this.updateLog(metadata);
          });
        }
      });
    }

    // MEMORY FIX: Complete cleanup/destroy method
    destroy() {
      if (this.isDestroyed) return;

      console.log('[Mosqit] Cleaning up and destroying logger...');
      this.isDestroyed = true;

      // Remove all tracked event listeners
      this.eventListeners.forEach(({ target, event, handler, options }) => {
        try {
          target.removeEventListener(event, handler, options);
        } catch (e) {
          this._debug('[Mosqit] Failed to remove event listener:', e);
        }
      });
      this.eventListeners = [];

      // Clear all intervals
      this.intervals.forEach(intervalId => {
        clearInterval(intervalId);
      });
      this.intervals = [];

      // Clear all timeouts
      this.timeouts.forEach(timeoutId => {
        clearTimeout(timeoutId);
      });
      this.timeouts = [];

      // Clean up highlight timeouts
      this.highlightTimeouts.forEach(timeoutId => {
        clearTimeout(timeoutId);
      });
      this.highlightTimeouts.clear();

      // Destroy AI sessions
      if (this.promptSession && typeof this.promptSession.destroy === 'function') {
        try {
          this.promptSession.destroy();
        } catch (e) {
          this._debug('[Mosqit] Failed to destroy prompt session:', e);
        }
      }
      if (this.writerSession && typeof this.writerSession.destroy === 'function') {
        try {
          this.writerSession.destroy();
        } catch (e) {
          this._debug('[Mosqit] Failed to destroy writer session:', e);
        }
      }

      // Clean up remaining highlights
      this.cleanupHighlights();

      // Clear data structures
      this.logs = [];
      this.recentLogs = [];
      this.userActionHistory = [];
      this.errorPatterns.clear();
      this.errorContext.clear();

      console.log('[Mosqit] ✅ Logger destroyed and cleaned up');
    }

    // Public API
    getLogs() {
      return this.logs;
    }

    getErrorPatterns() {
      return this.errorPatterns;
    }

    clearLogs() {
      this.logs = [];
      this.errorPatterns.clear();
    }
  }

  // Initialize Mosqit only in browser environment
  if (typeof window !== 'undefined') {
    // First, clean up any existing highlights from previous sessions
    const cleanupExistingHighlights = () => {
      // Remove any lingering highlight classes
      const highlightedElements = document.querySelectorAll('[class*="mosqit-error-highlight-"]');
      highlightedElements.forEach(element => {
        const classes = Array.from(element.classList);
        classes.forEach(className => {
          if (className.startsWith('mosqit-error-highlight-')) {
            element.classList.remove(className);
          }
        });
        // Also reset inline styles that might be stuck
        element.style.outline = '';
        element.style.boxShadow = '';
      });

      // Remove any lingering style elements
      const styleElements = document.querySelectorAll('style');
      styleElements.forEach(style => {
        if (style.textContent && style.textContent.includes('mosqit-error-highlight-')) {
          style.parentNode?.removeChild(style);
        }
      });

      // Also clean any elements that might have inline red borders
      const elementsWithRedBorder = document.querySelectorAll('[style*="ff4444"], [style*="255, 68, 68"]');
      elementsWithRedBorder.forEach(element => {
        element.style.outline = '';
        element.style.boxShadow = '';
      });
    };

    // Run cleanup immediately
    cleanupExistingHighlights();

    // Also run after DOM is fully loaded
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', cleanupExistingHighlights);
    } else {
      // DOM is already loaded, run again just in case
      setTimeout(cleanupExistingHighlights, 100);
    }

    window.mosqitLogger = new MosqitLogger();

    // Expose to page for testing
    window.mosqit = {
      getLogs: () => window.mosqitLogger.getLogs(),
      getErrorPatterns: () => window.mosqitLogger.getErrorPatterns(),
      clearLogs: () => window.mosqitLogger.clearLogs(),
      aiAvailable: () => window.mosqitLogger.aiAvailable,
      cleanupHighlights: () => window.mosqitLogger.cleanupHighlights()
    };
  }

  // Export for testing
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = MosqitLogger;
  }

})();