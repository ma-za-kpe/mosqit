/**
 * Jest Setup File
 * Global configuration and mocks for all tests
 */

// Add custom matchers from jest-dom
import '@testing-library/jest-dom';

// Mock Chrome APIs globally
global.chrome = {
  runtime: {
    sendMessage: jest.fn(),
    onMessage: {
      addListener: jest.fn(),
      removeListener: jest.fn()
    },
    getURL: jest.fn(path => `chrome-extension://mock-id/${path}`),
    id: 'mock-extension-id'
  },
  storage: {
    local: {
      get: jest.fn((keys, callback) => {
        if (callback) callback({});
        return Promise.resolve({});
      }),
      set: jest.fn((items, callback) => {
        if (callback) callback();
        return Promise.resolve();
      }),
      clear: jest.fn()
    }
  },
  devtools: {
    inspectedWindow: {
      eval: jest.fn(),
      tabId: 1
    },
    panels: {
      create: jest.fn()
    }
  },
  tabs: {
    query: jest.fn(),
    sendMessage: jest.fn()
  }
};

// Mock window.ai for Chrome AI APIs
global.self = {
  ai: {
    languageModel: {
      create: jest.fn(),
      capabilities: jest.fn(() => Promise.resolve({ available: 'readily' }))
    },
    writer: {
      create: jest.fn(),
      capabilities: jest.fn(() => Promise.resolve({ available: 'readily' }))
    },
    summarizer: {
      create: jest.fn(),
      capabilities: jest.fn(() => Promise.resolve({ available: 'readily' }))
    }
  }
};

// Mock console methods to avoid noise in tests
const originalConsole = {
  log: console.log,
  error: console.error,
  warn: console.warn,
  info: console.info
};

global.console = {
  ...console,
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  info: jest.fn(),
  // Keep debug for test output
  debug: originalConsole.log
};

// Mock performance API
global.performance = {
  now: jest.fn(() => Date.now()),
  mark: jest.fn(),
  measure: jest.fn(),
  clearMarks: jest.fn(),
  clearMeasures: jest.fn()
};

// Mock fetch for API tests
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    status: 200,
    json: () => Promise.resolve({}),
    text: () => Promise.resolve(''),
    blob: () => Promise.resolve(new Blob())
  })
);

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn()
};
global.localStorage = localStorageMock;

// Mock sessionStorage
const sessionStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn()
};
global.sessionStorage = sessionStorageMock;

// Helper function to reset all mocks
global.resetAllMocks = () => {
  jest.clearAllMocks();
  localStorageMock.clear();
  sessionStorageMock.clear();
};

// Add custom test utilities
global.testUtils = {
  // Wait for async operations
  waitFor: (condition, timeout = 5000) => {
    return new Promise((resolve, reject) => {
      const interval = setInterval(() => {
        if (condition()) {
          clearInterval(interval);
          resolve();
        }
      }, 100);

      setTimeout(() => {
        clearInterval(interval);
        reject(new Error('Timeout waiting for condition'));
      }, timeout);
    });
  },

  // Create mock error
  createError: (message, file = 'test.js', line = 42) => ({
    message,
    stack: `Error: ${message}\n    at testFunction (${file}:${line}:15)`,
    file,
    line,
    column: 15
  }),

  // Create mock log entry
  createLog: (level, message, metadata = {}) => ({
    level,
    message,
    timestamp: Date.now(),
    ...metadata
  })
};

// Suppress specific warnings
const originalWarning = console.warn;
console.warn = (...args) => {
  if (
    args[0]?.includes?.('ReactDOM.render') ||
    args[0]?.includes?.('componentWillReceiveProps')
  ) {
    return;
  }
  originalWarning.apply(console, args);
};

// Clean up after each test
afterEach(() => {
  global.resetAllMocks();
});

// Export test utilities
module.exports = { testUtils };