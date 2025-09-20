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

      this.init();
    }

    async init() {
      await this.checkChromeAI();
      this.overrideConsoleMethods();
      this.setupErrorListener();
      console.log('[Mosqit] ✅ Logger initialized');
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

          // Then capture and analyze
          const metadata = this.captureMetadata(method, args);

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
        };
      });
    }

    captureMetadata(level, args) {
      const message = args.map(arg => {
        if (typeof arg === 'object') {
          try {
            return JSON.stringify(arg, null, 2);
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

      return {
        message,
        level,
        timestamp: Date.now(),
        file: match ? match[1] : 'unknown',
        line: match ? parseInt(match[2]) : 0,
        column: match ? parseInt(match[3]) : 0,
        url: window.location.href
      };
    }

    async analyzeWithAI(metadata) {
      if (!this.writerSession) return this.analyzeWithPatterns(metadata);

      try {
        const prompt = `Error: ${metadata.message}\nLocation: ${metadata.file}:${metadata.line}\nProvide a brief fix suggestion in 1-2 sentences. No code examples.`;
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
        const metadata = {
          message: event.message,
          level: 'error',
          timestamp: Date.now(),
          file: event.filename,
          line: event.lineno,
          column: event.colno,
          stack: event.error?.stack,
          url: window.location.href
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
        const metadata = {
          message: `Unhandled Promise: ${event.reason}`,
          level: 'error',
          timestamp: Date.now(),
          url: window.location.href
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