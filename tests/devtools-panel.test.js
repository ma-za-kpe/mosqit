/**
 * DevTools Panel Integration Tests
 */

describe('Mosqit DevTools Panel', () => {
  let panel;
  let mockPort;
  let mockChrome;
  let document;

  beforeEach(() => {
    // Mock DOM
    document = {
      getElementById: jest.fn(),
      querySelector: jest.fn(),
      querySelectorAll: jest.fn(() => []),
      createElement: jest.fn(() => ({
        classList: { add: jest.fn(), remove: jest.fn(), toggle: jest.fn() },
        appendChild: jest.fn(),
        addEventListener: jest.fn(),
        querySelector: jest.fn(),
        querySelectorAll: jest.fn(() => []),
        style: {},
        innerHTML: ''
      })),
      head: {
        appendChild: jest.fn()
      },
      documentElement: {
        setAttribute: jest.fn(),
        getAttribute: jest.fn()
      },
      addEventListener: jest.fn()
    };
    global.document = document;
    global.window = { document };

    // Mock Chrome API
    mockPort = {
      postMessage: jest.fn(),
      onMessage: {
        addListener: jest.fn()
      },
      onDisconnect: {
        addListener: jest.fn()
      }
    };

    mockChrome = {
      runtime: {
        connect: jest.fn(() => mockPort)
      },
      storage: {
        local: {
          get: jest.fn((keys, callback) => callback({})),
          set: jest.fn()
        }
      },
      devtools: {
        inspectedWindow: {
          tabId: 123
        }
      }
    };
    global.chrome = mockChrome;

    // Create mock panel HTML structure
    const mockElements = {
      logsList: { innerHTML: '', appendChild: jest.fn(), querySelector: jest.fn() },
      searchInput: { value: '', addEventListener: jest.fn() },
      clearBtn: { addEventListener: jest.fn(), click: jest.fn() },
      exportBtn: { addEventListener: jest.fn() },
      filterChips: [],
      logCount: { textContent: '' },
      filterStatus: { textContent: '' },
      detailsPanel: { style: {} },
      closeDetails: { addEventListener: jest.fn() },
      aiToggle: { addEventListener: jest.fn(), classList: { toggle: jest.fn() } },
      themeToggle: { addEventListener: jest.fn(), querySelector: jest.fn() }
    };

    document.getElementById.mockImplementation((id) => {
      const idMap = {
        'logs-list': mockElements.logsList,
        'search-input': mockElements.searchInput,
        'clear-btn': mockElements.clearBtn,
        'export-btn': mockElements.exportBtn,
        'log-count': mockElements.logCount,
        'filter-status': mockElements.filterStatus,
        'details-panel': mockElements.detailsPanel,
        'close-details': mockElements.closeDetails,
        'ai-toggle': mockElements.aiToggle,
        'theme-toggle': mockElements.themeToggle
      };
      return idMap[id] || null;
    });

    document.querySelectorAll.mockImplementation((selector) => {
      if (selector === '.filter-chip') {
        return mockElements.filterChips;
      }
      return [];
    });
  });

  describe('Panel Initialization', () => {
    test('should create panel instance and setup DOM', () => {
      const MosqitDevToolsPanel = require('../src/extension/devtools/panel.js');
      panel = new MosqitDevToolsPanel();

      expect(document.getElementById).toHaveBeenCalledWith('logs-list');
      expect(document.getElementById).toHaveBeenCalledWith('search-input');
      expect(mockChrome.runtime.connect).toHaveBeenCalledWith({ name: 'mosqit-devtools' });
    });

    test('should initialize with correct default filters', () => {
      const MosqitDevToolsPanel = require('../src/extension/devtools/panel.js');
      panel = new MosqitDevToolsPanel();

      expect(panel.filters.levels).toEqual(new Set(['error', 'warn', 'info', 'log', 'debug', 'verbose']));
      expect(panel.filters.searchText).toBe('');
      expect(panel.filters.showAIAnalysis).toBe(true);
    });

    test('should send INIT message with tab ID', () => {
      const MosqitDevToolsPanel = require('../src/extension/devtools/panel.js');
      panel = new MosqitDevToolsPanel();

      expect(mockPort.postMessage).toHaveBeenCalledWith({
        type: 'INIT',
        tabId: 123
      });
    });
  });

  describe('Log Management', () => {
    test('should add new log and update UI', () => {
      const MosqitDevToolsPanel = require('../src/extension/devtools/panel.js');
      panel = new MosqitDevToolsPanel();

      const testLog = {
        message: 'Test error',
        level: 'error',
        timestamp: Date.now(),
        file: 'test.js',
        line: 42,
        analysis: 'AI analysis here'
      };

      panel.addLog(testLog);

      expect(panel.logs).toHaveLength(1);
      expect(panel.logs[0]).toEqual(testLog);
      expect(panel.filteredLogs).toHaveLength(1);
    });

    test('should filter logs by level', () => {
      const MosqitDevToolsPanel = require('../src/extension/devtools/panel.js');
      panel = new MosqitDevToolsPanel();

      panel.logs = [
        { level: 'error', message: 'Error 1' },
        { level: 'warn', message: 'Warning 1' },
        { level: 'info', message: 'Info 1' }
      ];

      panel.filters.levels = new Set(['error']);
      panel.applyFilters();

      expect(panel.filteredLogs).toHaveLength(1);
      expect(panel.filteredLogs[0].level).toBe('error');
    });

    test('should search logs by text', () => {
      const MosqitDevToolsPanel = require('../src/extension/devtools/panel.js');
      panel = new MosqitDevToolsPanel();

      panel.logs = [
        { message: 'Cannot read property', level: 'error' },
        { message: 'Network timeout', level: 'error' },
        { message: 'Success', level: 'info' }
      ];

      panel.filters.searchText = 'network';
      panel.applyFilters();

      expect(panel.filteredLogs).toHaveLength(1);
      expect(panel.filteredLogs[0].message).toContain('Network');
    });

    test('should clear logs when clear button clicked', () => {
      const MosqitDevToolsPanel = require('../src/extension/devtools/panel.js');
      panel = new MosqitDevToolsPanel();

      panel.logs = [{ message: 'Test' }];
      panel.filteredLogs = [{ message: 'Test' }];

      // Simulate clear button click
      const clearHandler = document.getElementById('clear-btn').addEventListener.mock.calls[0][1];
      clearHandler();

      expect(panel.logs).toHaveLength(0);
      expect(panel.filteredLogs).toHaveLength(0);
      expect(mockPort.postMessage).toHaveBeenCalledWith({ type: 'CLEAR_LOGS' });
    });
  });

  describe('Theme Toggle', () => {
    test('should toggle between light and dark themes', () => {
      const MosqitDevToolsPanel = require('../src/extension/devtools/panel.js');
      panel = new MosqitDevToolsPanel();

      // Get theme toggle handler
      const themeToggle = document.getElementById('theme-toggle');
      const themeHandler = themeToggle.addEventListener.mock.calls.find(call => call[0] === 'click')?.[1];

      // Simulate dark to light
      document.documentElement.getAttribute.mockReturnValue('dark');
      themeHandler();

      expect(document.documentElement.setAttribute).toHaveBeenCalledWith('data-theme', 'light');
      expect(mockChrome.storage.local.set).toHaveBeenCalledWith({ theme: 'light' });

      // Simulate light to dark
      document.documentElement.getAttribute.mockReturnValue('light');
      themeHandler();

      expect(document.documentElement.setAttribute).toHaveBeenCalledWith('data-theme', 'dark');
      expect(mockChrome.storage.local.set).toHaveBeenCalledWith({ theme: 'dark' });
    });

    test('should load saved theme on startup', () => {
      mockChrome.storage.local.get.mockImplementation((keys, callback) => {
        callback({ theme: 'light' });
      });

      const MosqitDevToolsPanel = require('../src/extension/devtools/panel.js');
      panel = new MosqitDevToolsPanel();

      expect(document.documentElement.setAttribute).toHaveBeenCalledWith('data-theme', 'light');
    });
  });

  describe('Message Handling', () => {
    test('should handle NEW_LOG message', () => {
      const MosqitDevToolsPanel = require('../src/extension/devtools/panel.js');
      panel = new MosqitDevToolsPanel();

      const messageHandler = mockPort.onMessage.addListener.mock.calls[0][0];
      const testLog = { message: 'Test', level: 'error' };

      messageHandler({ type: 'NEW_LOG', data: testLog });

      expect(panel.logs).toHaveLength(1);
      expect(panel.logs[0]).toEqual(testLog);
    });

    test('should handle LOGS_DATA message', () => {
      const MosqitDevToolsPanel = require('../src/extension/devtools/panel.js');
      panel = new MosqitDevToolsPanel();

      const messageHandler = mockPort.onMessage.addListener.mock.calls[0][0];
      const testLogs = [
        { message: 'Log 1', level: 'error' },
        { message: 'Log 2', level: 'warn' }
      ];

      messageHandler({ type: 'LOGS_DATA', data: testLogs });

      expect(panel.logs).toEqual(testLogs);
    });

    test('should handle port disconnect', () => {
      const MosqitDevToolsPanel = require('../src/extension/devtools/panel.js');
      panel = new MosqitDevToolsPanel();

      const disconnectHandler = mockPort.onDisconnect.addListener.mock.calls[0][0];
      const consoleSpy = jest.spyOn(console, 'warn');

      disconnectHandler();

      expect(consoleSpy).toHaveBeenCalledWith('[Mosqit Panel] Disconnected from background');
      expect(panel.port).toBeNull();
    });
  });

  describe('Export Functionality', () => {
    test('should export logs as JSON', () => {
      const MosqitDevToolsPanel = require('../src/extension/devtools/panel.js');
      panel = new MosqitDevToolsPanel();

      // Mock URL and document methods
      global.URL = {
        createObjectURL: jest.fn(() => 'blob:url'),
        revokeObjectURL: jest.fn()
      };
      global.Blob = jest.fn();

      const mockAnchor = {
        href: '',
        download: '',
        click: jest.fn(),
        remove: jest.fn()
      };
      document.createElement.mockReturnValue(mockAnchor);

      panel.logs = [
        { message: 'Test error', level: 'error', timestamp: Date.now() }
      ];

      panel.exportLogs();

      expect(global.Blob).toHaveBeenCalled();
      expect(mockAnchor.download).toContain('mosqit-logs');
      expect(mockAnchor.download).toContain('.json');
      expect(mockAnchor.click).toHaveBeenCalled();
    });
  });

  describe('AI Analysis Toggle', () => {
    test('should toggle AI analysis display', () => {
      const MosqitDevToolsPanel = require('../src/extension/devtools/panel.js');
      panel = new MosqitDevToolsPanel();

      const aiToggle = document.getElementById('ai-toggle');
      const aiHandler = aiToggle.addEventListener.mock.calls[0][1];

      expect(panel.filters.showAIAnalysis).toBe(true);

      const mockEvent = {
        currentTarget: {
          classList: { toggle: jest.fn() },
          querySelector: jest.fn(() => ({ textContent: '' }))
        }
      };

      aiHandler(mockEvent);

      expect(panel.filters.showAIAnalysis).toBe(false);
      expect(mockEvent.currentTarget.classList.toggle).toHaveBeenCalledWith('active', false);
    });
  });

  describe('Keyboard Shortcuts', () => {
    test('should clear search on Escape key', () => {
      const MosqitDevToolsPanel = require('../src/extension/devtools/panel.js');
      panel = new MosqitDevToolsPanel();

      const searchInput = document.getElementById('search-input');
      searchInput.value = 'test search';
      panel.filters.searchText = 'test search';

      const keyHandler = document.addEventListener.mock.calls.find(call => call[0] === 'keydown')[1];
      keyHandler({ key: 'Escape' });

      expect(searchInput.value).toBe('');
      expect(panel.filters.searchText).toBe('');
    });

    test('should clear logs on Shift+Delete', () => {
      const MosqitDevToolsPanel = require('../src/extension/devtools/panel.js');
      panel = new MosqitDevToolsPanel();

      const clearBtn = document.getElementById('clear-btn');
      const keyHandler = document.addEventListener.mock.calls.find(call => call[0] === 'keydown')[1];

      keyHandler({ key: 'Delete', shiftKey: true });

      expect(clearBtn.click).toHaveBeenCalled();
    });
  });

  describe('Empty State', () => {
    test('should show empty state when no logs', () => {
      const MosqitDevToolsPanel = require('../src/extension/devtools/panel.js');
      panel = new MosqitDevToolsPanel();

      panel.renderLogs();

      const logsList = document.getElementById('logs-list');
      expect(logsList.innerHTML).toContain('empty-state');
      expect(logsList.innerHTML).toContain('No logs to display');
    });

    test('should clear empty state when first log arrives', () => {
      const MosqitDevToolsPanel = require('../src/extension/devtools/panel.js');
      panel = new MosqitDevToolsPanel();

      const logsList = document.getElementById('logs-list');
      logsList.querySelector = jest.fn(() => ({ remove: jest.fn() }));

      panel.appendLogToUI({ message: 'Test', level: 'error' });

      expect(logsList.querySelector).toHaveBeenCalledWith('.empty-state');
    });
  });
});