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
            console.info('[Mosqit] 📥 Gemini Nano model needs download');
            // Optionally trigger download
            // await window.ai.assistant.create();
          }
        } catch (error) {
          console.debug('[Mosqit] Prompt API not available:', error);
        }
      }

      // Check for Writer API - uses window.ai
      if (typeof window.ai !== 'undefined' && window.ai?.writer) {
        try {
          const capabilities = await window.ai.writer.capabilities();
          if (capabilities.available === 'readily') {
            this.aiAvailable = true;
            this.aiCapabilities.writer = true;
            console.info('[Mosqit] ✅ Chrome AI Writer API ready!');
          }
        } catch (error) {
          console.debug('[Mosqit] Writer API not available:', error);
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
          console.debug('[Mosqit] Summarizer API not available:', error);
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
          console.debug('[Mosqit] Rewriter API not available:', error);
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
            console.debug('[Mosqit] Legacy Writer API error:', error);
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
            console.debug('[Mosqit] Legacy Summarizer check failed:', error);
          }
        }
      }

      if (!this.aiAvailable) {
        console.info('[Mosqit] ⚠️ Using pattern-based analysis (no AI)');
        console.info('[Mosqit] Enable Chrome AI flags:');
        console.info('[Mosqit] - chrome://flags/#prompt-api-for-gemini-nano');
        console.info('[Mosqit] - chrome://flags/#summarization-api-for-gemini-nano');
        console.info('[Mosqit] - chrome://flags/#optimization-guide-on-device-model');
      } else {
        console.info('[Mosqit] AI Capabilities:', this.aiCapabilities);
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

    async analyzeWithAI(metadata) {
      if (!this.aiAvailable) return this.analyzeWithPatterns(metadata);

      try {
        // Try Prompt API first (most powerful)
        if (this.aiCapabilities.prompt) {
          if (!this.promptSession) {
            this.promptSession = await window.ai.assistant.create({
              systemPrompt: 'You are Mosqit, a JavaScript debugging assistant. Provide concise, actionable solutions in 1-2 sentences.'
            });
          }
          const prompt = `Error: ${metadata.message}\nFile: ${metadata.file}:${metadata.line}\nAction: ${metadata.userAction || 'unknown'}\nProvide a specific fix.`;
          const response = await this.promptSession.prompt(prompt);
          return `🤖 ${response.substring(0, 400)}`;
        }

        // Fall back to Writer API if available
        if (!this.writerSession && (this.aiCapabilities.writer || this.aiCapabilities.legacyWriter)) {
          if (this.aiCapabilities.writer) {
            this.writerSession = await window.ai.writer.create({
              tone: 'formal',
              format: 'plain-text',
              length: 'short'
            });
          }
          // legacyWriter session already created in checkChromeAI
        }

        if (!this.writerSession) return this.analyzeWithPatterns(metadata);

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
        // Clean up failed sessions
        this.promptSession = null;
        this.writerSession = null;
        return this.analyzeWithPatterns(metadata);
      }
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

    detectDependencies() {
      try {
        const dependencies = {
          frameworks: [],
          libraries: [],
          analytics: [],
          cdns: []
        };

        // Detect common frameworks
        if (window.React) dependencies.frameworks.push('React ' + (window.React.version || ''));
        if (window.Vue) dependencies.frameworks.push('Vue ' + (window.Vue?.version || ''));
        if (window.angular) dependencies.frameworks.push('Angular');
        if (window.ng) dependencies.frameworks.push('Angular 2+');
        if (window.Ember) dependencies.frameworks.push('Ember');
        if (window.Backbone) dependencies.frameworks.push('Backbone');
        if (window.Svelte) dependencies.frameworks.push('Svelte');
        if (window.Alpine) dependencies.frameworks.push('Alpine.js');
        if (window.htmx) dependencies.frameworks.push('HTMX');
        if (window.Stimulus) dependencies.frameworks.push('Stimulus');

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
        }, '*');
      } catch (e) {
        // Failed to post message
        console.warn('[Mosqit] Failed to send log to extension:', e);
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