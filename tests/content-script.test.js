/**
 * Content Script Integration Tests
 */

describe('Mosqit Content Script', () => {
  let logger;
  let originalConsole;
  let mockChrome;

  beforeEach(() => {
    // Clear any previous module cache
    jest.resetModules();

    // Save original console methods
    originalConsole = {
      log: console.log,
      error: console.error,
      warn: console.warn,
      info: console.info,
      debug: console.debug
    };

    // Mock Chrome runtime
    mockChrome = {
      runtime: {
        sendMessage: jest.fn()
      }
    };
    global.chrome = mockChrome;

    // Mock window.ai for Chrome AI APIs
    global.window = {
      ai: {
        assistant: {
          capabilities: jest.fn().mockResolvedValue({ available: 'readily' }),
          create: jest.fn().mockResolvedValue({
            prompt: jest.fn().mockResolvedValue('AI analysis result')
          })
        },
        writer: {
          capabilities: jest.fn().mockResolvedValue({ available: 'readily' }),
          create: jest.fn().mockResolvedValue({
            write: jest.fn().mockResolvedValue('Writer API response')
          })
        }
      },
      location: {
        href: 'http://test.com'
      },
      navigator: {
        userAgent: 'Test Browser'
      },
      postMessage: jest.fn()
    };

    // Mock global Writer API (legacy)
    global.Writer = {
      availability: jest.fn().mockResolvedValue('available'),
      create: jest.fn().mockResolvedValue({
        write: jest.fn().mockResolvedValue('This is an AI-generated debugging analysis.')
      })
    };

    // Mock document
    global.document = {
      activeElement: {
        tagName: 'BUTTON',
        id: 'test-button',
        className: 'btn-primary'
      },
      readyState: 'complete',
      title: 'Test Page',
      addEventListener: jest.fn()
    };
  });

  afterEach(() => {
    // Restore original console
    Object.assign(console, originalConsole);
  });

  describe('Console Method Interception', () => {
    test('should override all console methods', () => {
      const MosqitLogger = require('../src/extension/content/mosqit-content.js');
      logger = new MosqitLogger();

      // Check that logger has overridden console methods
      expect(logger.originalConsole.log).toBeDefined();
      expect(logger.originalConsole.error).toBeDefined();
      expect(logger.originalConsole.warn).toBeDefined();
      expect(logger.originalConsole.info).toBeDefined();
      expect(logger.originalConsole.debug).toBeDefined();
    });

    test('should capture console.log calls', () => {
      const MosqitLogger = require('../src/extension/content/mosqit-content.js');
      logger = new MosqitLogger();

      console.log('Test message');

      expect(logger.logs).toHaveLength(1);
      expect(logger.logs[0].message).toBe('Test message');
      expect(logger.logs[0].level).toBe('log');
    });

    test('should capture console.error with stack trace', () => {
      const MosqitLogger = require('../src/extension/content/mosqit-content.js');
      logger = new MosqitLogger();

      const error = new Error('Test error');
      console.error(error);

      expect(logger.logs).toHaveLength(1);
      expect(logger.logs[0].level).toBe('error');
      expect(logger.logs[0].stack).toContain('Error: Test error');
    });

    test('should still call original console methods', () => {
      const MosqitLogger = require('../src/extension/content/mosqit-content.js');
      logger = new MosqitLogger();

      const logSpy = jest.spyOn(originalConsole, 'log');
      console.log('Test');

      expect(logSpy).toHaveBeenCalledWith('Test');
    });
  });

  describe('Metadata Capture', () => {
    test('should extract file and line from stack trace', () => {
      const MosqitLogger = require('../src/extension/content/mosqit-content.js');
      logger = new MosqitLogger();

      const metadata = logger.captureMetadata();

      expect(metadata).toHaveProperty('file');
      expect(metadata).toHaveProperty('line');
      expect(metadata.url).toBe('http://test.com');
      expect(metadata.userAgent).toBe('Test Browser');
    });

    test('should capture DOM context', () => {
      const MosqitLogger = require('../src/extension/content/mosqit-content.js');
      logger = new MosqitLogger();

      const context = logger.captureDOMContext();

      expect(context.activeElement).toEqual({
        tagName: 'BUTTON',
        id: 'test-button',
        className: 'btn-primary'
      });
      expect(context.documentState.readyState).toBe('complete');
    });

    test('should detect framework dependencies', () => {
      global.window.React = { version: '18.2.0' };
      global.window.Vue = { version: '3.2.0' };

      const MosqitLogger = require('../src/extension/content/mosqit-content.js');
      logger = new MosqitLogger();

      const deps = logger.detectDependencies();

      expect(deps).toContain('React@18.2.0');
      expect(deps).toContain('Vue@3.2.0');
    });
  });

  describe('Chrome AI Integration', () => {
    test('should detect and initialize Chrome AI APIs', async () => {
      const MosqitLogger = require('../src/extension/content/mosqit-content.js');
      logger = new MosqitLogger();

      await logger.checkChromeAI();

      expect(logger.aiAvailable).toBe(true);
      expect(logger.aiCapabilities.prompt).toBe(true);
      expect(logger.aiCapabilities.writer).toBe(true);
    });

    test('should use Prompt API for error analysis', async () => {
      const MosqitLogger = require('../src/extension/content/mosqit-content.js');
      logger = new MosqitLogger();
      await logger.checkChromeAI();

      const metadata = {
        message: 'Cannot read property of null',
        file: 'test.js',
        line: 42
      };

      const analysis = await logger.analyzeError(metadata);

      expect(analysis).toContain('🤖');
      expect(window.ai.assistant.create).toHaveBeenCalled();
    });

    test('should fallback to Writer API when Prompt unavailable', async () => {
      // Make Prompt API unavailable
      window.ai.assistant.capabilities.mockResolvedValue({ available: 'no' });

      const MosqitLogger = require('../src/extension/content/mosqit-content.js');
      logger = new MosqitLogger();
      await logger.checkChromeAI();

      const metadata = {
        message: 'Test error',
        file: 'test.js',
        line: 10
      };

      const analysis = await logger.analyzeError(metadata);

      expect(window.ai.writer.create).toHaveBeenCalled();
    });

    test('should use legacy Writer API as fallback', async () => {
      // Make window.ai unavailable
      delete window.ai;

      const MosqitLogger = require('../src/extension/content/mosqit-content.js');
      logger = new MosqitLogger();
      await logger.checkChromeAI();

      expect(logger.aiCapabilities.legacyWriter).toBe(true);
      expect(Writer.create).toHaveBeenCalled();

      const metadata = {
        message: 'Test error',
        file: 'test.js',
        line: 10
      };

      const analysis = await logger.analyzeError(metadata);

      expect(analysis).toContain('🤖');
      expect(analysis).toContain('AI-generated debugging analysis');
    });

    test('should fallback to pattern matching when AI unavailable', async () => {
      // Make all AI unavailable
      delete window.ai;
      Writer.availability.mockResolvedValue('unavailable');

      const MosqitLogger = require('../src/extension/content/mosqit-content.js');
      logger = new MosqitLogger();
      await logger.checkChromeAI();

      const metadata = {
        message: 'Cannot read property "name" of null',
        file: 'test.js',
        line: 10
      };

      const analysis = await logger.analyzeError(metadata);

      expect(analysis).toContain('🔴');
      expect(analysis).toContain('Null reference error');
    });
  });

  describe('Pattern Detection', () => {
    test('should detect null reference patterns', () => {
      const MosqitLogger = require('../src/extension/content/mosqit-content.js');
      logger = new MosqitLogger();

      const analysis = logger.analyzeWithPatterns({
        message: 'Cannot read property "test" of null'
      });

      expect(analysis).toContain('Null reference error');
    });

    test('should detect network error patterns', () => {
      const MosqitLogger = require('../src/extension/content/mosqit-content.js');
      logger = new MosqitLogger();

      const analysis = logger.analyzeWithPatterns({
        message: 'Failed to fetch'
      });

      expect(analysis).toContain('Network request failed');
    });

    test('should track recurring errors', () => {
      const MosqitLogger = require('../src/extension/content/mosqit-content.js');
      logger = new MosqitLogger();

      const error = {
        message: 'Test error',
        file: 'app.js',
        line: 10
      };

      // Log same error multiple times
      logger.trackErrorPattern(error);
      logger.trackErrorPattern(error);
      logger.trackErrorPattern(error);

      const pattern = `${error.file}:${error.line}`;
      expect(logger.errorPatterns.get(pattern).count).toBe(3);
    });
  });

  describe('Message Passing', () => {
    test('should send logs to background via postMessage', () => {
      const MosqitLogger = require('../src/extension/content/mosqit-content.js');
      logger = new MosqitLogger();

      const testLog = {
        message: 'Test',
        level: 'info'
      };

      logger.sendToBackground(testLog);

      expect(window.postMessage).toHaveBeenCalledWith({
        type: 'MOSQIT_LOG_FROM_MAIN',
        data: testLog
      }, '*');
    });

    test('should handle unhandled promise rejections', () => {
      const MosqitLogger = require('../src/extension/content/mosqit-content.js');
      logger = new MosqitLogger();

      const unhandledHandler = window.addEventListener.mock.calls.find(
        call => call[0] === 'unhandledrejection'
      )?.[1];

      const event = {
        reason: 'Promise rejected',
        preventDefault: jest.fn()
      };

      unhandledHandler(event);

      expect(logger.logs).toHaveLength(1);
      expect(logger.logs[0].level).toBe('error');
      expect(logger.logs[0].message).toContain('Unhandled Promise Rejection');
    });

    test('should handle global errors', () => {
      const MosqitLogger = require('../src/extension/content/mosqit-content.js');
      logger = new MosqitLogger();

      const errorHandler = window.addEventListener.mock.calls.find(
        call => call[0] === 'error'
      )?.[1];

      const event = {
        error: new Error('Global error'),
        filename: 'test.js',
        lineno: 42,
        colno: 10
      };

      errorHandler(event);

      expect(logger.logs).toHaveLength(1);
      expect(logger.logs[0].level).toBe('error');
      expect(logger.logs[0].file).toBe('test.js');
      expect(logger.logs[0].line).toBe(42);
    });
  });

  describe('Performance', () => {
    test('should limit log storage to prevent memory issues', () => {
      const MosqitLogger = require('../src/extension/content/mosqit-content.js');
      logger = new MosqitLogger();

      // Add more than max logs
      for (let i = 0; i < 1100; i++) {
        logger.logs.push({ message: `Log ${i}` });
      }

      logger.checkLogLimit();

      expect(logger.logs.length).toBeLessThanOrEqual(1000);
    });

    test('should measure response time for operations', () => {
      const MosqitLogger = require('../src/extension/content/mosqit-content.js');
      logger = new MosqitLogger();

      const startTime = performance.now();
      logger.captureMetadata();
      const endTime = performance.now();

      expect(endTime - startTime).toBeLessThan(50);
    });
  });

  describe('AI Response Cleanup', () => {
    test('should clean up AI responses', async () => {
      Writer.create.mockResolvedValue({
        write: jest.fn().mockResolvedValue(`
          \`\`\`javascript
          // Some code
          \`\`\`
          The error occurs because the variable is null.
          Try adding a null check.
        `)
      });

      const MosqitLogger = require('../src/extension/content/mosqit-content.js');
      logger = new MosqitLogger();
      await logger.checkChromeAI();

      const analysis = await logger.analyzeError({
        message: 'Test error',
        file: 'test.js',
        line: 10
      });

      expect(analysis).not.toContain('```');
      expect(analysis).toContain('🤖');
      expect(analysis).toContain('error occurs because');
    });

    test('should limit AI response length', async () => {
      const longResponse = 'A'.repeat(500);
      Writer.create.mockResolvedValue({
        write: jest.fn().mockResolvedValue(longResponse)
      });

      const MosqitLogger = require('../src/extension/content/mosqit-content.js');
      logger = new MosqitLogger();
      await logger.checkChromeAI();

      const analysis = await logger.analyzeError({
        message: 'Test',
        file: 'test.js',
        line: 1
      });

      expect(analysis.length).toBeLessThanOrEqual(450); // 400 + emoji + padding
    });
  });
});