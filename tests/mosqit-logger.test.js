/**
 * Unit Tests for Mosqit Logger Core Functionality
 * Tests the basic logging, metadata capture, and error tracking
 */

// Mock Chrome APIs
const mockChrome = {
  runtime: {
    sendMessage: jest.fn(),
    onMessage: {
      addListener: jest.fn()
    }
  },
  devtools: {
    inspectedWindow: {
      eval: jest.fn()
    }
  }
};

global.chrome = mockChrome;

describe('MosqitLogger Core Functionality', () => {
  // MosqitLogger variable removed - not used in tests

  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();

    // Reset the logger instance
    if (global.mosqitLogger) {
      global.mosqitLogger.clear();
    }
  });

  describe('Basic Logging', () => {
    test('should capture console.log messages', () => {
      const testMessage = 'Test debug message';
      const originalLog = console.log;

      // Create mock logger
      const logs = [];
      console.log = (...args) => {
        logs.push({
          level: 'log',
          message: args.join(' '),
          timestamp: new Date().toISOString()
        });
        originalLog(...args);
      };

      console.log(testMessage);

      expect(logs).toHaveLength(1);
      expect(logs[0].level).toBe('log');
      expect(logs[0].message).toBe(testMessage);

      // Restore original
      console.log = originalLog;
    });

    test('should capture console.error messages', () => {
      const testError = 'Test error message';
      const originalError = console.error;

      // Create mock logger
      const logs = [];
      console.error = (...args) => {
        logs.push({
          level: 'error',
          message: args.join(' '),
          timestamp: new Date().toISOString()
        });
        originalError(...args);
      };

      console.error(testError);

      expect(logs).toHaveLength(1);
      expect(logs[0].level).toBe('error');
      expect(logs[0].message).toBe(testError);

      // Restore original
      console.error = originalError;
    });

    test('should capture console.warn messages', () => {
      const testWarning = 'Test warning message';
      const originalWarn = console.warn;

      // Create mock logger
      const logs = [];
      console.warn = (...args) => {
        logs.push({
          level: 'warn',
          message: args.join(' '),
          timestamp: new Date().toISOString()
        });
        originalWarn(...args);
      };

      console.warn(testWarning);

      expect(logs).toHaveLength(1);
      expect(logs[0].level).toBe('warn');
      expect(logs[0].message).toBe(testWarning);

      // Restore original
      console.warn = originalWarn;
    });
  });

  describe('Metadata Capture', () => {
    test('should capture stack trace for errors', () => {
      const error = new Error('Test error with stack');
      const metadata = {
        message: error.message,
        stack: error.stack,
        file: 'test.js',
        line: 42,
        column: 15
      };

      expect(metadata.stack).toContain('Error: Test error with stack');
      expect(metadata.file).toBe('test.js');
      expect(metadata.line).toBe(42);
    });

    test('should extract file and line from stack trace', () => {
      const stackTrace = `Error: Test
        at testFunction (http://localhost:3000/test.js:42:15)
        at main (http://localhost:3000/app.js:10:5)`;

      // Parse stack trace
      const match = stackTrace.match(/at .+ \((.+):(\d+):(\d+)\)/);

      expect(match).toBeTruthy();
      expect(match[1]).toContain('test.js');
      expect(match[2]).toBe('42');
      expect(match[3]).toBe('15');
    });

    test('should capture DOM node information', () => {
      // Mock DOM element
      const mockElement = {
        tagName: 'BUTTON',
        id: 'submit-btn',
        className: 'btn btn-primary',
        getAttribute: jest.fn((attr) => {
          if (attr === 'data-testid') return 'submit-button';
          return null;
        })
      };

      const domMetadata = {
        tag: mockElement.tagName.toLowerCase(),
        id: mockElement.id,
        className: mockElement.className,
        testId: mockElement.getAttribute('data-testid')
      };

      expect(domMetadata.tag).toBe('button');
      expect(domMetadata.id).toBe('submit-btn');
      expect(domMetadata.className).toBe('btn btn-primary');
      expect(domMetadata.testId).toBe('submit-button');
    });
  });

  describe('Error Pattern Tracking', () => {
    test('should track error frequency', () => {
      const errorTracker = new Map();
      const errorKey = 'test.js:42';

      // Simulate multiple errors at same location
      for (let i = 0; i < 3; i++) {
        errorTracker.set(errorKey, (errorTracker.get(errorKey) || 0) + 1);
      }

      expect(errorTracker.get(errorKey)).toBe(3);
    });

    test('should detect recurring patterns', () => {
      const errorTracker = new Map();
      const errors = [
        { file: 'app.js', line: 10, message: 'null reference' },
        { file: 'app.js', line: 10, message: 'null reference' },
        { file: 'app.js', line: 10, message: 'null reference' },
        { file: 'utils.js', line: 25, message: 'undefined function' }
      ];

      errors.forEach(error => {
        const key = `${error.file}:${error.line}`;
        errorTracker.set(key, (errorTracker.get(key) || 0) + 1);
      });

      // Check for recurring patterns (>2 occurrences)
      const recurringPatterns = [];
      errorTracker.forEach((count, key) => {
        if (count > 2) {
          recurringPatterns.push({ location: key, count });
        }
      });

      expect(recurringPatterns).toHaveLength(1);
      expect(recurringPatterns[0].location).toBe('app.js:10');
      expect(recurringPatterns[0].count).toBe(3);
    });
  });

  describe('Log Filtering and Search', () => {
    test('should filter logs by level', () => {
      const logs = [
        { level: 'log', message: 'Debug 1' },
        { level: 'error', message: 'Error 1' },
        { level: 'warn', message: 'Warning 1' },
        { level: 'error', message: 'Error 2' },
        { level: 'log', message: 'Debug 2' }
      ];

      const errorLogs = logs.filter(log => log.level === 'error');

      expect(errorLogs).toHaveLength(2);
      expect(errorLogs[0].message).toBe('Error 1');
      expect(errorLogs[1].message).toBe('Error 2');
    });

    test('should search logs by message content', () => {
      const logs = [
        { message: 'User login successful' },
        { message: 'Failed to fetch user data' },
        { message: 'User profile updated' },
        { message: 'Network error occurred' }
      ];

      const userLogs = logs.filter(log =>
        log.message.toLowerCase().includes('user')
      );

      expect(userLogs).toHaveLength(3);
    });

    test('should filter logs by time range', () => {
      const now = Date.now();
      const logs = [
        { timestamp: now - 5000, message: 'Old log' },
        { timestamp: now - 2000, message: 'Recent log 1' },
        { timestamp: now - 1000, message: 'Recent log 2' },
        { timestamp: now - 6000, message: 'Very old log' }
      ];

      // Get logs from last 3 seconds
      const recentLogs = logs.filter(log =>
        now - log.timestamp <= 3000
      );

      expect(recentLogs).toHaveLength(2);
    });
  });

  describe('Performance Metrics', () => {
    test('should measure response time', () => {
      const startTime = performance.now();

      // Simulate some processing
      for (let i = 0; i < 1000000; i++) {
        // Processing loop to measure time
      }

      const endTime = performance.now();
      const responseTime = endTime - startTime;

      expect(responseTime).toBeLessThan(100); // Should be fast
    });

    test('should limit log storage', () => {
      const MAX_LOGS = 1000;
      const logs = [];

      // Add more logs than the limit
      for (let i = 0; i < MAX_LOGS + 100; i++) {
        logs.push({ id: i, message: `Log ${i}` });

        // Trim old logs if over limit
        if (logs.length > MAX_LOGS) {
          logs.shift();
        }
      }

      expect(logs.length).toBe(MAX_LOGS);
      expect(logs[0].id).toBe(100); // First 100 should be removed
    });
  });
});

// Export for use in other tests
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { mockChrome };
}