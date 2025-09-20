/**
 * Mosqit Content Script - Chrome AI Integration
 * Plain JavaScript version for Chrome Extension
 */

(function() {
  'use strict';

  console.log('[Mosqit] 🦟 Initializing debugging assistant...');

  class MosqitLogger {
    constructor() {
      this.logs = [];
      this.maxLogs = 1000;
      this.aiAvailable = false;
      this.writerSession = null;
      this.errorPatterns = new Map();

      // Context tracking
      this.recentLogs = []; // Last 10 logs before an error
      this.maxRecentLogs = 10;
      this.lastUserAction = null;
      this.lastErrorTime = 0;
      this.lastError = null;
      this.errorContext = new Map(); // Store context for each error
      this.userActionHistory = [];
      this.maxActionHistory = 5;

      this.init();
    }

    async init() {
      await this.checkChromeAI();
      this.overrideConsoleMethods();
      this.setupErrorListener();
      this.setupUserActionTracking();
      console.log('[Mosqit] ✅ Logger initialized');
    }

    setupUserActionTracking() {
      // Track clicks
      document.addEventListener('click', (e) => {
        const target = e.target;
        const identifier = target.id || target.className || target.tagName;
        const text = target.textContent?.substring(0, 30) || '';
        this.lastUserAction = `Clicked: ${identifier} "${text.trim()}"`;
        this.addToActionHistory(this.lastUserAction);
      }, true);

      // Track form submissions
      document.addEventListener('submit', (e) => {
        const form = e.target;
        const identifier = form.id || form.className || 'form';
        this.lastUserAction = `Submitted form: ${identifier}`;
        this.addToActionHistory(this.lastUserAction);
      }, true);

      // Track input changes
      document.addEventListener('change', (e) => {
        const target = e.target;
        if (target.tagName === 'INPUT' || target.tagName === 'SELECT') {
          const identifier = target.id || target.name || target.type;
          this.lastUserAction = `Changed input: ${identifier}`;
          this.addToActionHistory(this.lastUserAction);
        }
      }, true);

      // Track page navigation
      window.addEventListener('popstate', () => {
        this.lastUserAction = `Navigated to: ${window.location.pathname}`;
        this.addToActionHistory(this.lastUserAction);
      });
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
      // Check for Chrome Writer API (global object)
      if (typeof Writer !== 'undefined') {
        try {
          const availability = await Writer.availability();
          console.info('[Mosqit] Writer API status:', availability);

          if (availability === 'available') {
            this.writerSession = await Writer.create({
              tone: 'neutral',
              format: 'plain-text',
              length: 'short',
              sharedContext: 'You are Mosqit, a debugging assistant. Analyze JavaScript errors and provide concise fixes.',
              language: 'en'
            });
            this.aiAvailable = true;
            console.info('[Mosqit] ✅ Chrome AI ready!');
          } else if (availability === 'downloadable') {
            console.info('[Mosqit] 📥 AI model needs download (2GB)');
          }
        } catch (error) {
          console.warn('[Mosqit] Writer API error:', error);
        }
      }

      // Fallback check for Summarizer API
      if (!this.aiAvailable && typeof Summarizer !== 'undefined') {
        try {
          const availability = await Summarizer.availability();
          if (availability === 'available') {
            this.aiAvailable = true;
            console.info('[Mosqit] ✅ Summarizer API available as fallback');
          }
        } catch (error) {
          console.warn('[Mosqit] Summarizer check failed:', error);
        }
      }

      if (!this.aiAvailable) {
        console.info('[Mosqit] ⚠️ Using pattern-based analysis (no AI)');
        console.info('[Mosqit] Enable Chrome AI: chrome://flags → #optimization-guide-on-device-model');
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
        console[method] = async (...args) => {
          // Call original first
          originalConsole[method](...args);

          try {
            // Then capture and analyze
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

          if (this.aiAvailable && (method === 'error' || method === 'warn')) {
            metadata.analysis = await this.analyzeWithAI(metadata);
            // Print AI analysis immediately
            originalConsole.info(`[Mosqit AI Analysis] ${metadata.analysis}`);
          } else if (method === 'error' || method === 'warn') {
            metadata.analysis = this.analyzeWithPatterns(metadata);
            // Print pattern-based analysis
            originalConsole.info(`[Mosqit Analysis] ${metadata.analysis}`);
          }

          this.storeLog(metadata);
          } catch (error) {
            // If there's an error in our logging, don't break the console
            originalConsole.debug('[Mosqit] Error capturing log:', error);
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

      // Get stack trace for location
      const stack = new Error().stack || '';
      const lines = stack.split('\n');
      const callerLine = lines[3] || '';
      const match = callerLine.match(/\(([^:)]+):(\d+):(\d+)\)/);

      // Extract function name from stack
      const functionMatch = callerLine.match(/at\s+(\S+)\s+\(/);
      const functionName = functionMatch ? functionMatch[1] : 'anonymous';

      // Check if this error is related to recent errors
      const isRelatedError = this.lastErrorTime && (Date.now() - this.lastErrorTime < 2000);

      const metadata = {
        message,
        level,
        timestamp: Date.now(),
        file: match ? match[1] : 'unknown',
        line: match ? parseInt(match[2]) : 0,
        column: match ? parseInt(match[3]) : 0,
        url: window.location.href,
        functionName,
        stack: stack.substring(0, 500), // Include partial stack
        userAction: this.lastUserAction,
        actionHistory: this.userActionHistory.slice(0, 3), // Last 3 actions
        recentLogs: this.recentLogs.slice(-5), // Last 5 logs before error
        relatedToLastError: isRelatedError,
        previousError: isRelatedError ? this.lastError : null
      };

      // Update last error tracking
      if (level === 'error' || level === 'warn') {
        this.lastErrorTime = Date.now();
        this.lastError = message;
      }

      return metadata;
    }

    async analyzeWithAI(metadata) {
      if (!this.writerSession) return this.analyzeWithPatterns(metadata);

      try {
        // Build context-rich prompt
        let contextInfo = '';

        // Add user action context
        if (metadata.userAction) {
          contextInfo += `User Action: ${metadata.userAction}\n`;
        }

        // Add recent action history
        if (metadata.actionHistory && metadata.actionHistory.length > 0) {
          contextInfo += `Recent Actions: ${metadata.actionHistory.map(a => a.action).join(' → ')}\n`;
        }

        // Add recent logs context
        if (metadata.recentLogs && metadata.recentLogs.length > 0) {
          const recentMessages = metadata.recentLogs.map(log => `${log.level}: ${log.message.substring(0, 50)}`).join(' | ');
          contextInfo += `Recent Logs: ${recentMessages}\n`;
        }

        // Add related error info
        if (metadata.relatedToLastError && metadata.previousError) {
          contextInfo += `Previous Error (related): ${metadata.previousError.substring(0, 100)}\n`;
        }

        const prompt = `JavaScript ${metadata.level} in function "${metadata.functionName}":
"${metadata.message}"

Context:
${contextInfo}
File: ${metadata.file}:${metadata.line}
URL: ${metadata.url}

Based on the user action "${metadata.userAction || 'unknown'}" and the context above:
1. What specifically caused this error in this scenario?
2. What's the exact fix for this user's workflow?
3. Why did this happen after "${metadata.userAction || 'this action'}"?

Be specific to this exact scenario, not generic. Consider what the user was trying to do.`;

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
        return this.analyzeWithPatterns(metadata);
      }
    }

    analyzeWithPatterns(metadata) {
      const patterns = {
        'null|undefined': '🔴 Null/undefined reference. Use optional chaining (?.) or null checks.',
        'not defined': '🔴 Variable not defined. Check spelling and imports.',
        'SyntaxError': '🔴 Syntax error. Check brackets and semicolons.',
        'TypeError': '🔴 Type mismatch. Verify data types.',
        'network|fetch': '🟡 Network issue. Check API endpoint and CORS.',
        'timeout': '🟡 Timeout. Consider retry logic.',
        'async|await': '🔵 Async issue. Ensure proper await usage.'
      };

      for (const [pattern, analysis] of Object.entries(patterns)) {
        if (new RegExp(pattern, 'i').test(metadata.message)) {
          return analysis;
        }
      }

      return `🔵 ${metadata.level} at ${metadata.file}:${metadata.line}`;
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

        // Alert on recurring errors
        if (this.errorPatterns.get(key) === 3) {
          console.warn(`[Mosqit] 🔄 Recurring error detected at ${key}`);
        }
      }

      // Send to extension if available
      if (typeof chrome !== 'undefined' && chrome.runtime) {
        try {
          chrome.runtime.sendMessage({
            type: 'MOSQIT_LOG',
            data: metadata
          });
        } catch {
          // Extension not available
        }
      }
    }

    setupErrorListener() {
      const originalConsole = console.info.bind(console);

      window.addEventListener('error', async (event) => {
        // Extract function name from stack if available
        const stack = event.error?.stack || '';
        const functionMatch = stack.match(/at\s+(\S+)\s+\(/);
        const functionName = functionMatch ? functionMatch[1] : 'global';

        const metadata = {
          message: event.message,
          level: 'error',
          timestamp: Date.now(),
          file: event.filename || 'unknown',
          line: event.lineno || 0,
          column: event.colno || 0,
          stack: stack.substring(0, 500),
          url: window.location.href,
          functionName,
          userAction: this.lastUserAction,
          actionHistory: this.userActionHistory.slice(0, 3),
          recentLogs: this.recentLogs.slice(-5),
          relatedToLastError: this.lastErrorTime && (Date.now() - this.lastErrorTime < 2000),
          previousError: this.lastError
        };

        if (this.aiAvailable) {
          metadata.analysis = await this.analyzeWithAI(metadata);
          originalConsole(`[Mosqit AI Analysis - Runtime Error] ${metadata.analysis}`);
        } else {
          metadata.analysis = this.analyzeWithPatterns(metadata);
          originalConsole(`[Mosqit Analysis - Runtime Error] ${metadata.analysis}`);
        }

        this.storeLog(metadata);
      });

      window.addEventListener('unhandledrejection', async (event) => {
        const originalConsole = console.info.bind(console);

        // Extract more context from the promise rejection
        const errorMessage = event.reason?.message || event.reason || 'Unknown promise rejection';
        const stack = event.reason?.stack || '';

        // Try to extract function name from stack
        const functionMatch = stack.match(/at\s+(\S+)\s+\(/);
        const functionName = functionMatch ? functionMatch[1] : 'async function';

        // Extract file and line from stack if available
        const fileMatch = stack.match(/\(([^:)]+):(\d+):(\d+)\)/);

        const metadata = {
          message: `Unhandled Promise: ${errorMessage}`,
          level: 'error',
          timestamp: Date.now(),
          url: window.location.href,
          functionName,
          file: fileMatch ? fileMatch[1] : 'async context',
          line: fileMatch ? parseInt(fileMatch[2]) : 0,
          column: fileMatch ? parseInt(fileMatch[3]) : 0,
          stack: stack.substring(0, 500),
          userAction: this.lastUserAction,
          actionHistory: this.userActionHistory.slice(0, 3),
          recentLogs: this.recentLogs.slice(-5),
          relatedToLastError: this.lastErrorTime && (Date.now() - this.lastErrorTime < 2000),
          previousError: this.lastError
        };

        if (this.aiAvailable) {
          metadata.analysis = await this.analyzeWithAI(metadata);
          originalConsole(`[Mosqit AI Analysis - Promise] ${metadata.analysis}`);
        } else {
          metadata.analysis = this.analyzeWithPatterns(metadata);
          originalConsole(`[Mosqit Analysis - Promise] ${metadata.analysis}`);
        }

        this.storeLog(metadata);
      });
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

  // Initialize Mosqit
  window.mosqitLogger = new MosqitLogger();

  // Expose to page for testing
  window.mosqit = {
    getLogs: () => window.mosqitLogger.getLogs(),
    getErrorPatterns: () => window.mosqitLogger.getErrorPatterns(),
    clearLogs: () => window.mosqitLogger.clearLogs(),
    aiAvailable: () => window.mosqitLogger.aiAvailable
  };

})();