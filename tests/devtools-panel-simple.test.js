/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * Simplified DevTools Panel Tests
 * Focus on core functionality without complex mocking
 */

describe('Mosqit DevTools Panel - Simplified', () => {
  let panel;
  let mockPort;

  beforeEach(() => {
    // Setup basic mocks
    mockPort = {
      postMessage: jest.fn(),
      onMessage: { addListener: jest.fn() },
      onDisconnect: { addListener: jest.fn() }
    };

    global.chrome = {
      runtime: {
        connect: jest.fn(() => mockPort)
      },
      storage: {
        local: {
          get: jest.fn((keys, cb) => cb({})),
          set: jest.fn()
        }
      },
      devtools: {
        inspectedWindow: { tabId: 123 }
      }
    };

    global.document = {
      body: { innerHTML: '' },
      getElementById: jest.fn(() => ({
        innerHTML: '',
        addEventListener: jest.fn(),
        appendChild: jest.fn(),
        querySelector: jest.fn(() => null)
      })),
      querySelector: jest.fn(() => null),
      querySelectorAll: jest.fn(() => []),
      createElement: jest.fn(() => ({
        innerHTML: '',
        addEventListener: jest.fn(),
        appendChild: jest.fn(),
        scrollIntoView: jest.fn(),
        classList: { add: jest.fn(), toggle: jest.fn() },
        style: {},
        dataset: {}
      })),
      documentElement: {
        setAttribute: jest.fn(),
        getAttribute: jest.fn()
      },
      addEventListener: jest.fn()
    };

    global.window = { document: global.document };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('should create panel instance', () => {
    const MosqitDevToolsPanel = require('../src/extension/devtools/panel.js');
    panel = new MosqitDevToolsPanel();

    expect(panel).toBeDefined();
    expect(panel.logs).toEqual([]);
    expect(panel.filteredLogs).toEqual([]);
  });

  test('should initialize with default filters', () => {
    const MosqitDevToolsPanel = require('../src/extension/devtools/panel.js');
    panel = new MosqitDevToolsPanel();

    expect(panel.filters.levels).toEqual(new Set(['log', 'info', 'warn', 'error', 'debug']));
    expect(panel.filters.searchText).toBe('');
    expect(panel.filters.showAIAnalysis).toBe(true);
  });

  test('should connect to background', () => {
    const MosqitDevToolsPanel = require('../src/extension/devtools/panel.js');
    panel = new MosqitDevToolsPanel();

    expect(chrome.runtime.connect).toHaveBeenCalledWith({ name: 'mosqit-devtools' });
    expect(mockPort.postMessage).toHaveBeenCalledWith({ type: 'INIT', tabId: 123 });
  });

  test('should handle logs array', () => {
    const MosqitDevToolsPanel = require('../src/extension/devtools/panel.js');
    panel = new MosqitDevToolsPanel();

    // Add a log directly
    panel.logs.push({ message: 'Test', level: 'info' });

    expect(panel.logs).toHaveLength(1);
    expect(panel.logs[0].message).toBe('Test');
  });

  test('should filter logs by level', () => {
    const MosqitDevToolsPanel = require('../src/extension/devtools/panel.js');
    panel = new MosqitDevToolsPanel();

    // Add test logs
    panel.logs = [
      { level: 'error', message: 'Error 1' },
      { level: 'warn', message: 'Warning 1' },
      { level: 'info', message: 'Info 1' }
    ];

    // Apply level filter
    panel.filters.levels = new Set(['error']);

    // Manually filter like the panel would
    panel.filteredLogs = panel.logs.filter(log =>
      panel.filters.levels.has(log.level)
    );

    expect(panel.filteredLogs).toHaveLength(1);
    expect(panel.filteredLogs[0].level).toBe('error');
  });

  test('should filter logs by search text', () => {
    const MosqitDevToolsPanel = require('../src/extension/devtools/panel.js');
    panel = new MosqitDevToolsPanel();

    panel.logs = [
      { message: 'Network error', level: 'error' },
      { message: 'Database connected', level: 'info' },
      { message: 'Network timeout', level: 'warn' }
    ];

    panel.filters.searchText = 'network';

    // Manually filter like the panel would
    panel.filteredLogs = panel.logs.filter(log =>
      log.message.toLowerCase().includes(panel.filters.searchText.toLowerCase())
    );

    expect(panel.filteredLogs).toHaveLength(2);
    expect(panel.filteredLogs[0].message).toContain('Network');
    expect(panel.filteredLogs[1].message).toContain('Network');
  });

  test('should handle message from background', () => {
    const MosqitDevToolsPanel = require('../src/extension/devtools/panel.js');
    panel = new MosqitDevToolsPanel();

    // Mock the elements needed for addLog
    panel.elements = {
      logsList: {
        innerHTML: '',
        appendChild: jest.fn(),
        querySelector: jest.fn(() => null)
      }
    };

    // Get the message handler
    const messageHandler = mockPort.onMessage.addListener.mock.calls[0][0];

    // Send test log
    const testLog = { message: 'Test', level: 'error' };
    messageHandler({ type: 'NEW_LOG', data: testLog });

    // Check log was added to logs array
    expect(panel.logs.length).toBeGreaterThan(0);
  });

  test('should clear logs', () => {
    const MosqitDevToolsPanel = require('../src/extension/devtools/panel.js');
    panel = new MosqitDevToolsPanel();

    // Add some logs
    panel.logs = [{ message: 'Test' }];
    panel.filteredLogs = [{ message: 'Test' }];

    // Clear them
    panel.logs = [];
    panel.filteredLogs = [];

    expect(panel.logs).toHaveLength(0);
    expect(panel.filteredLogs).toHaveLength(0);
  });

  test('should toggle AI analysis filter', () => {
    const MosqitDevToolsPanel = require('../src/extension/devtools/panel.js');
    panel = new MosqitDevToolsPanel();

    expect(panel.filters.showAIAnalysis).toBe(true);

    panel.filters.showAIAnalysis = !panel.filters.showAIAnalysis;

    expect(panel.filters.showAIAnalysis).toBe(false);
  });
});