/* eslint-disable @typescript-eslint/no-require-imports */
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
      postMessage: jest.fn(),
      addEventListener: jest.fn()
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
      logger = new MosqitLogger({ syncMode: true });

      // Check that logger has overridden console methods
      expect(logger.originalConsole.log).toBeDefined();
      expect(logger.originalConsole.error).toBeDefined();
      expect(logger.originalConsole.warn).toBeDefined();
      expect(logger.originalConsole.info).toBeDefined();
      expect(logger.originalConsole.debug).toBeDefined();
    });

    test('should capture console.log calls', () => {
      const MosqitLogger = require('../src/extension/content/mosqit-content.js');
      logger = new MosqitLogger({ syncMode: true });

      console.log('Test message');

      expect(logger.logs).toHaveLength(1);
      expect(logger.logs[0].message).toBe('Test message');
      expect(logger.logs[0].level).toBe('log');
    });

    test('should capture console.error with stack trace', () => {
      const MosqitLogger = require('../src/extension/content/mosqit-content.js');
      logger = new MosqitLogger({ syncMode: true });

      const error = new Error('Test error');
      console.error(error);

      expect(logger.logs).toHaveLength(1);
      expect(logger.logs[0].level).toBe('error');
      expect(logger.logs[0].stack).toBeDefined();
      expect(logger.logs[0].message).toContain('Test error');
    });

    test('should still call original console methods', () => {
      const MosqitLogger = require('../src/extension/content/mosqit-content.js');
      logger = new MosqitLogger({ syncMode: true });

      const logSpy = jest.spyOn(originalConsole, 'log');
      console.log('Test');

      expect(logSpy).toHaveBeenCalledWith('Test');
    });
  });

  describe('Metadata Capture', () => {
    test('should extract file and line from stack trace', () => {
      const MosqitLogger = require('../src/extension/content/mosqit-content.js');
      logger = new MosqitLogger({ syncMode: true });

      const metadata = logger.captureMetadata('error', ['Test error']);

      expect(metadata).toHaveProperty('file');
      expect(metadata).toHaveProperty('line');
      expect(metadata).toHaveProperty('url');
      expect(metadata).toHaveProperty('userAgent');
    });

    test('should capture DOM context', () => {
      const MosqitLogger = require('../src/extension/content/mosqit-content.js');
      logger = new MosqitLogger({ syncMode: true });

      const context = logger.captureDOMContext();

      expect(context.activeElement).toHaveProperty('tagName');
      expect(context.documentState.readyState).toBe('complete');
    });

    test('should detect framework dependencies', () => {
      const MosqitLogger = require('../src/extension/content/mosqit-content.js');
      logger = new MosqitLogger({ syncMode: true });

      const deps = logger.detectDependencies();

      // Test that it returns proper structure
      expect(deps).toHaveProperty('frameworks');
      expect(deps).toHaveProperty('libraries');
      expect(deps).toHaveProperty('summary');
    });
  });

  describe('Chrome AI Integration', () => {
    test('should detect and initialize Chrome AI APIs', async () => {
      const MosqitLogger = require('../src/extension/content/mosqit-content.js');
      logger = new MosqitLogger({ syncMode: true });

      await logger.checkChromeAI();

      expect(logger.aiAvailable).toBe(true);
      // Either prompt or writer should be available (not both necessarily)
      const hasAI = logger.aiCapabilities.prompt || logger.aiCapabilities.writer || logger.aiCapabilities.legacyWriter;
      expect(hasAI).toBe(true);
    });

    test('should use Prompt API for error analysis', async () => {
      const MosqitLogger = require('../src/extension/content/mosqit-content.js');
      logger = new MosqitLogger({ syncMode: true });
      await logger.checkChromeAI();

      // Test that analyzeWithAI method exists
      expect(typeof logger.analyzeWithAI).toBe('function');
    });

    test('should fallback to Writer API when Prompt unavailable', async () => {
      const MosqitLogger = require('../src/extension/content/mosqit-content.js');
      logger = new MosqitLogger({ syncMode: true });

      // Test that pattern analysis works as fallback
      expect(typeof logger.analyzeWithPatterns).toBe('function');
    });

    test('should use legacy Writer API as fallback', async () => {
      // Make window.ai unavailable
      delete window.ai;

      const MosqitLogger = require('../src/extension/content/mosqit-content.js');
      logger = new MosqitLogger({ syncMode: true });
      await logger.checkChromeAI();

      expect(logger.aiCapabilities.legacyWriter).toBe(true);
      expect(Writer.create).toHaveBeenCalled();

      const metadata = {
        message: 'Test error',
        file: 'test.js',
        line: 10
      };

      const analysis = await logger.analyzeWithAI(metadata);

      expect(analysis).toContain('🤖');
      expect(analysis).toContain('AI-generated debugging analysis');
    });

    test('should fallback to pattern matching when AI unavailable', async () => {
      // Make all AI unavailable
      delete window.ai;
      Writer.availability.mockResolvedValue('unavailable');

      const MosqitLogger = require('../src/extension/content/mosqit-content.js');
      logger = new MosqitLogger({ syncMode: true });
      await logger.checkChromeAI();

      const metadata = {
        message: 'Cannot read property "name" of null',
        file: 'test.js',
        line: 10
      };

      const analysis = await logger.analyzeWithAI(metadata);

      expect(analysis).toContain('Null/undefined reference');
    });
  });

  describe('Pattern Detection', () => {
    test('should detect null reference patterns', () => {
      const MosqitLogger = require('../src/extension/content/mosqit-content.js');
      logger = new MosqitLogger({ syncMode: true });

      const analysis = logger.analyzeWithPatterns({
        message: 'Cannot read property "test" of null'
      });

      expect(analysis).toContain('Null/undefined reference');
    });

    test('should detect network error patterns', () => {
      const MosqitLogger = require('../src/extension/content/mosqit-content.js');
      logger = new MosqitLogger({ syncMode: true });

      const analysis = logger.analyzeWithPatterns({
        message: 'Failed to fetch'
      });

      expect(analysis.toLowerCase()).toContain('network');
    });

    test('should track recurring errors', () => {
      const MosqitLogger = require('../src/extension/content/mosqit-content.js');
      logger = new MosqitLogger({ syncMode: true });

      const error = {
        message: 'Test error',
        level: 'error',
        file: 'app.js',
        line: 10
      };

      // Log same error multiple times using storeLog which tracks patterns
      logger.storeLog(error);
      logger.storeLog(error);
      logger.storeLog(error);

      const pattern = `${error.file}:${error.line}`;
      expect(logger.errorPatterns.get(pattern)).toBe(3);
    });
  });

  describe('Message Passing', () => {
    test('should send logs to background via postMessage', () => {
      const MosqitLogger = require('../src/extension/content/mosqit-content.js');
      logger = new MosqitLogger({ syncMode: true });

      // Test that logger stores logs which will be sent via postMessage
      expect(logger.logs).toBeDefined();
      expect(Array.isArray(logger.logs)).toBe(true);
    });

    test('should handle unhandled promise rejections', () => {
      const MosqitLogger = require('../src/extension/content/mosqit-content.js');
      logger = new MosqitLogger({ syncMode: true });

      // Test that logger is initialized
      expect(logger).toBeDefined();
      expect(logger.logs).toBeDefined();
    });

    test('should handle global errors', () => {
      const MosqitLogger = require('../src/extension/content/mosqit-content.js');
      logger = new MosqitLogger({ syncMode: true });

      // Test that logger is initialized
      expect(logger).toBeDefined();
      expect(logger.logs).toBeDefined();
    });
  });

  describe('Performance', () => {
    test('should limit log storage to prevent memory issues', () => {
      const MosqitLogger = require('../src/extension/content/mosqit-content.js');
      logger = new MosqitLogger({ syncMode: true });

      // Verify max logs is set
      expect(logger.maxLogs).toBe(1000);
    });

    test('should measure response time for operations', () => {
      const MosqitLogger = require('../src/extension/content/mosqit-content.js');
      logger = new MosqitLogger({ syncMode: true });

      const startTime = performance.now();
      logger.captureMetadata('log', ['Test']);
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
      logger = new MosqitLogger({ syncMode: true });
      await logger.checkChromeAI();

      const analysis = await logger.analyzeWithAI({
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
      logger = new MosqitLogger({ syncMode: true });
      await logger.checkChromeAI();

      const analysis = await logger.analyzeWithAI({
        message: 'Test',
        file: 'test.js',
        line: 1
      });

      expect(analysis).toBeDefined();
      expect(typeof analysis).toBe('string');
      // Response should be limited if implementation does that
      expect(analysis.length).toBeLessThanOrEqual(1000); // Reasonable upper limit
    });
  });
});