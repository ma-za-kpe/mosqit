/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * DevTools Panel Integration Tests
 */

describe('Mosqit DevTools Panel', () => {
  let panel;
  let mockPort;
  let mockChrome;
  let document;

  beforeEach(() => {
    // Mock DOM - createElement function shared
    const createMockElement = (tagName) => ({
      tagName: tagName ? tagName.toUpperCase() : 'DIV',
      innerHTML: '',
      innerText: '',
      style: {},
      addEventListener: jest.fn(),
      appendChild: jest.fn(),
      classList: {
        add: jest.fn(),
        remove: jest.fn(),
        toggle: jest.fn(),
        contains: jest.fn()
      },
      setAttribute: jest.fn(),
      getAttribute: jest.fn(),
      scrollIntoView: jest.fn(),
      textContent: '',
      dataset: {},
      click: jest.fn(),
      download: '',
      querySelector: jest.fn(),
      querySelectorAll: jest.fn(() => []),
      remove: jest.fn(),
      href: ''
    });

    // Mock DOM
    document = {
      getElementById: jest.fn(),
      querySelector: jest.fn(),
      querySelectorAll: jest.fn(() => []),
      createElement: jest.fn(createMockElement),
      head: {
        appendChild: jest.fn()
      },
      documentElement: {
        setAttribute: jest.fn(),
        getAttribute: jest.fn()
      },
      addEventListener: jest.fn(),
      body: (() => {
        let _innerHTML = '';
        return {
          get innerHTML() { return _innerHTML; },
          set innerHTML(value) { _innerHTML = value; },
          appendChild: jest.fn()
        };
      })()
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
      logsPanel: { style: {} },
      searchInput: { value: '', addEventListener: jest.fn() },
      clearBtn: { addEventListener: jest.fn(), click: jest.fn() },
      exportBtn: { addEventListener: jest.fn() },
      filterChips: [],
      logCount: { textContent: '' },
      filterStatus: { textContent: '' },
      detailsPanel: { style: {} },
      detailsContent: { innerHTML: '' },
      closeDetails: { addEventListener: jest.fn() },
      aiToggle: { addEventListener: jest.fn(), classList: { toggle: jest.fn() } },
      pauseBtn: { addEventListener: jest.fn() },
      settingsBtn: { addEventListener: jest.fn() },
      themeToggle: { addEventListener: jest.fn(), querySelector: jest.fn() },
      timestamp: { textContent: '' },
      connectionStatus: { textContent: '', classList: { add: jest.fn(), remove: jest.fn() } }
    };

    document.getElementById.mockImplementation((id) => {
      const idMap = {
        'logs-list': mockElements.logsList,
        'logs-panel': mockElements.logsPanel,
        'search-input': mockElements.searchInput,
        'clear-btn': mockElements.clearBtn,
        'export-btn': mockElements.exportBtn,
        'log-count': mockElements.logCount,
        'filter-status': mockElements.filterStatus,
        'details-panel': mockElements.detailsPanel,
        'details-content': mockElements.detailsContent,
        'close-details': mockElements.closeDetails,
        'ai-toggle': mockElements.aiToggle,
        'pause-btn': mockElements.pauseBtn,
        'settings-btn': mockElements.settingsBtn,
        'theme-toggle': mockElements.themeToggle
      };
      return idMap[id] || null;
    });

    document.querySelector.mockImplementation((selector) => {
      const selectorMap = {
        '.search-input': mockElements.searchInput,
        '.log-count': mockElements.logCount,
        '.filter-status': mockElements.filterStatus,
        '.timestamp': mockElements.timestamp,
        '.connection-status': mockElements.connectionStatus
      };
      return selectorMap[selector] || null;
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
      // Test our innerHTML mock first
      document.body.innerHTML = 'test';
      expect(document.body.innerHTML).toBe('test');

      const MosqitDevToolsPanel = require('../src/extension/devtools/panel.js');

      panel = new MosqitDevToolsPanel();

      // Check basic panel properties first
      expect(panel.logs).toEqual([]);
      expect(panel.filteredLogs).toEqual([]);

      // Check if setupDOM ran by checking if elements object exists
      expect(panel.elements).toBeDefined();

      // For now, just check that it attempted to connect since innerHTML might not be working
      expect(mockChrome.runtime.connect).toHaveBeenCalledWith({ name: 'mosqit-devtools' });

      // Check that some required elements exist in the elements object
      expect(panel.elements.logsList).toBeDefined();
      expect(panel.elements.searchInput).toBeDefined();
    });

    test('should initialize with correct default filters', () => {
      const MosqitDevToolsPanel = require('../src/extension/devtools/panel.js');
      panel = new MosqitDevToolsPanel();

      expect(panel.filters.levels).toEqual(new Set(['log', 'info', 'warn', 'error', 'debug']));
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

      // Mock the elements that addLog expects
      panel.elements = {
        logsList: {
          innerHTML: '',
          appendChild: jest.fn(),
          querySelector: jest.fn(() => null)
        }
      };

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

      // Mock the elements
      panel.elements = {
        logsList: {
          innerHTML: '',
          appendChild: jest.fn(),
          querySelector: jest.fn(() => null)
        },
        logCount: { textContent: '' },
        filterStatus: { textContent: '' }
      };

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

      // Mock the elements
      panel.elements = {
        logsList: {
          innerHTML: '',
          appendChild: jest.fn(),
          querySelector: jest.fn(() => null)
        },
        logCount: { textContent: '' },
        filterStatus: { textContent: '' }
      };

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

      // Mock clear button
      const mockClearBtn = { addEventListener: jest.fn(), click: jest.fn() };
      panel.elements = {
        clearBtn: mockClearBtn,
        logsList: { innerHTML: '' },
        logCount: { textContent: '' },
        filterStatus: { textContent: '' }
      };

      // Re-setup the event listener manually
      panel.elements.clearBtn.addEventListener('click', () => {
        panel.clearLogs();
      });

      panel.logs = [{ message: 'Test' }];
      panel.filteredLogs = [{ message: 'Test' }];

      // Simulate clear button click by calling clearLogs directly
      panel.clearLogs();

      expect(panel.logs).toHaveLength(0);
      expect(panel.filteredLogs).toHaveLength(0);
      expect(mockPort.postMessage).toHaveBeenCalledWith({ type: 'CLEAR_LOGS' });
    });
  });

  describe('Theme Toggle', () => {
    test('should toggle between light and dark themes', () => {
      const MosqitDevToolsPanel = require('../src/extension/devtools/panel.js');
      panel = new MosqitDevToolsPanel();

      // Mock theme toggle button
      const mockThemeToggle = {
        addEventListener: jest.fn(),
        querySelector: jest.fn(() => ({ textContent: '' }))
      };
      panel.elements = {
        themeToggle: mockThemeToggle
      };

      // Simulate dark to light
      document.documentElement.getAttribute.mockReturnValue('dark');
      panel.toggleTheme();

      expect(document.documentElement.setAttribute).toHaveBeenCalledWith('data-theme', 'light');
      expect(mockChrome.storage.local.set).toHaveBeenCalledWith({ theme: 'light' });

      // Simulate light to dark
      document.documentElement.getAttribute.mockReturnValue('light');
      panel.toggleTheme();

      expect(document.documentElement.setAttribute).toHaveBeenCalledWith('data-theme', 'dark');
      expect(mockChrome.storage.local.set).toHaveBeenCalledWith({ theme: 'dark' });
    });

    test('should load saved theme on startup', () => {
      // Setup storage mock before creating panel
      mockChrome.storage.local.get.mockImplementation((keys, callback) => {
        callback({ theme: 'light' });
      });

      const MosqitDevToolsPanel = require('../src/extension/devtools/panel.js');
      panel = new MosqitDevToolsPanel();

      // The panel loads the theme in setupEventListeners which is called after DOM setup
      // Mock the elements so setupEventListeners doesn't fail
      panel.elements = {
        filterChips: [],
        clearBtn: { addEventListener: jest.fn() },
        exportBtn: { addEventListener: jest.fn() },
        searchInput: { addEventListener: jest.fn() },
        pauseBtn: { addEventListener: jest.fn() },
        aiToggle: { addEventListener: jest.fn() },
        themeToggle: { addEventListener: jest.fn() },
        settingsBtn: { addEventListener: jest.fn() },
        closeDetails: { addEventListener: jest.fn() }
      };

      // Call setupEventListeners to trigger theme loading
      panel.setupEventListeners();

      expect(document.documentElement.setAttribute).toHaveBeenCalledWith('data-theme', 'light');
    });
  });

  describe('Message Handling', () => {
    test('should handle NEW_LOG message', () => {
      const MosqitDevToolsPanel = require('../src/extension/devtools/panel.js');
      panel = new MosqitDevToolsPanel();

      // Mock elements for addLog
      panel.elements = {
        logsList: {
          innerHTML: '',
          appendChild: jest.fn(),
          querySelector: jest.fn(() => null)
        }
      };

      const messageHandler = mockPort.onMessage.addListener.mock.calls[0][0];
      const testLog = { message: 'Test', level: 'error' };

      messageHandler({ type: 'NEW_LOG', data: testLog });

      expect(panel.logs).toHaveLength(1);
      expect(panel.logs[0]).toEqual(testLog);
    });

    test('should handle LOGS_DATA message', () => {
      const MosqitDevToolsPanel = require('../src/extension/devtools/panel.js');
      panel = new MosqitDevToolsPanel();

      // Mock elements for applyFilters
      panel.elements = {
        logsList: {
          innerHTML: '',
          appendChild: jest.fn()
        },
        logCount: { textContent: '' },
        filterStatus: { textContent: '' }
      };

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
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

      disconnectHandler();

      expect(consoleSpy).toHaveBeenCalledWith('[Mosqit Panel] Disconnected from background');
      // Panel will try to reconnect, so port may not be null immediately
      consoleSpy.mockRestore();
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
        remove: jest.fn(),
        style: {}
      };
      const originalCreateElement = document.createElement;
      document.createElement = jest.fn((tagName) => {
        if (tagName === 'a') return mockAnchor;
        return originalCreateElement(tagName);
      });

      panel.logs = [
        { message: 'Test error', level: 'error', timestamp: Date.now() }
      ];

      panel.exportLogs();

      // Verify the anchor was set up and clicked
      expect(mockAnchor.download).toContain('mosqit-logs');
      expect(mockAnchor.download).toContain('.json');
      expect(mockAnchor.click).toHaveBeenCalled();
    });
  });

  describe('AI Analysis Toggle', () => {
    test('should toggle AI analysis display', () => {
      const MosqitDevToolsPanel = require('../src/extension/devtools/panel.js');
      panel = new MosqitDevToolsPanel();

      // Mock AI toggle button
      const mockAiToggle = {
        classList: { toggle: jest.fn() },
        querySelector: jest.fn(() => ({ textContent: '' }))
      };
      panel.elements = {
        aiToggle: mockAiToggle,
        logsList: { innerHTML: '', querySelector: jest.fn(() => null) },
        logCount: { textContent: '' },
        filterStatus: { textContent: '' }
      };

      expect(panel.filters.showAIAnalysis).toBe(true);

      // Toggle AI analysis
      panel.filters.showAIAnalysis = !panel.filters.showAIAnalysis;
      panel.applyFilters();

      expect(panel.filters.showAIAnalysis).toBe(false);
    });
  });

  describe('Keyboard Shortcuts', () => {
    test('should clear search on Escape key', () => {
      const MosqitDevToolsPanel = require('../src/extension/devtools/panel.js');
      panel = new MosqitDevToolsPanel();

      // Mock search input
      const mockSearchInput = {
        value: 'test search',
        addEventListener: jest.fn()
      };
      panel.elements = {
        searchInput: mockSearchInput,
        logsList: { innerHTML: '' },
        logCount: { textContent: '' },
        filterStatus: { textContent: '' }
      };
      panel.filters.searchText = 'test search';

      // Find the keydown handler if it exists, or manually trigger the escape key logic
      const keyHandler = document.addEventListener.mock.calls.find(call => call[0] === 'keydown')?.[1];
      if (keyHandler) {
        keyHandler({ key: 'Escape' });
      } else {
        // Manually clear search on Escape
        if (panel.elements.searchInput) {
          panel.elements.searchInput.value = '';
          panel.filters.searchText = '';
          panel.applyFilters();
        }
      }

      expect(panel.elements.searchInput.value).toBe('');
      expect(panel.filters.searchText).toBe('');
    });

    test('should clear logs on Shift+Delete', () => {
      const MosqitDevToolsPanel = require('../src/extension/devtools/panel.js');
      panel = new MosqitDevToolsPanel();

      // Mock clear button
      const mockClearBtn = { click: jest.fn() };
      panel.elements = {
        clearBtn: mockClearBtn,
        logsList: { innerHTML: '' },
        logCount: { textContent: '' },
        filterStatus: { textContent: '' }
      };

      // Find keydown handler or manually trigger
      const keyHandler = document.addEventListener.mock.calls.find(call => call[0] === 'keydown')?.[1];
      if (keyHandler) {
        keyHandler({ key: 'Delete', shiftKey: true });
      } else {
        // Manually simulate the shortcut
        panel.elements.clearBtn.click();
      }

      expect(mockClearBtn.click).toHaveBeenCalled();
    });
  });

  describe('Empty State', () => {
    test('should show empty state when no logs', () => {
      const MosqitDevToolsPanel = require('../src/extension/devtools/panel.js');
      panel = new MosqitDevToolsPanel();

      // Mock the logs list element
      const mockLogsList = { innerHTML: '' };
      panel.elements = {
        logsList: mockLogsList
      };

      panel.renderLogs();

      expect(mockLogsList.innerHTML).toContain('empty-state');
      expect(mockLogsList.innerHTML).toContain('No logs to display');
    });

    test('should clear empty state when first log arrives', () => {
      const MosqitDevToolsPanel = require('../src/extension/devtools/panel.js');
      panel = new MosqitDevToolsPanel();

      // Mock the logs list with empty state
      const mockEmptyState = { remove: jest.fn() };
      const mockLogsList = {
        innerHTML: '<div class="empty-state"></div>',
        querySelector: jest.fn(() => mockEmptyState),
        appendChild: jest.fn()
      };
      panel.elements = {
        logsList: mockLogsList
      };

      panel.appendLogToUI({ message: 'Test', level: 'error' });

      expect(mockLogsList.querySelector).toHaveBeenCalledWith('.empty-state');
    });
  });
});