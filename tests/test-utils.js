/**
 * Test utilities for mocking DOM and Chrome APIs
 */

function createMockElement(tagName = 'div') {
  return {
    tagName: tagName ? tagName.toUpperCase() : 'DIV',
    innerHTML: '',
    textContent: '',
    style: {},
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    appendChild: jest.fn(),
    removeChild: jest.fn(),
    insertBefore: jest.fn(),
    classList: {
      add: jest.fn(),
      remove: jest.fn(),
      toggle: jest.fn(),
      contains: jest.fn(() => false)
    },
    setAttribute: jest.fn(),
    getAttribute: jest.fn(),
    hasAttribute: jest.fn(() => false),
    removeAttribute: jest.fn(),
    scrollIntoView: jest.fn(),
    querySelector: jest.fn(() => null),
    querySelectorAll: jest.fn(() => []),
    dataset: {},
    click: jest.fn(),
    focus: jest.fn(),
    blur: jest.fn(),
    remove: jest.fn(),
    // Form elements
    value: '',
    checked: false,
    disabled: false,
    // Link elements
    href: '',
    download: '',
    // Media elements
    play: jest.fn(),
    pause: jest.fn()
  };
}

function setupMockDOM() {
  const mockDocument = {
    getElementById: jest.fn(() => createMockElement()),
    querySelector: jest.fn(() => createMockElement()),
    querySelectorAll: jest.fn(() => []),
    createElement: jest.fn((tagName) => createMockElement(tagName)),
    createTextNode: jest.fn((text) => ({ textContent: text, nodeType: 3 })),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    body: createMockElement('body'),
    head: createMockElement('head'),
    documentElement: createMockElement('html'),
    readyState: 'complete',
    title: 'Test Document',
    URL: 'http://test.com',
    location: {
      href: 'http://test.com',
      hostname: 'test.com',
      pathname: '/',
      search: '',
      hash: ''
    }
  };

  // Setup circular references
  mockDocument.body.ownerDocument = mockDocument;
  mockDocument.head.ownerDocument = mockDocument;
  mockDocument.documentElement.ownerDocument = mockDocument;

  return mockDocument;
}

function setupMockChromeAPI() {
  return {
    runtime: {
      connect: jest.fn(() => ({
        postMessage: jest.fn(),
        onMessage: {
          addListener: jest.fn(),
          removeListener: jest.fn()
        },
        onDisconnect: {
          addListener: jest.fn(),
          removeListener: jest.fn()
        },
        disconnect: jest.fn()
      })),
      sendMessage: jest.fn((message, callback) => {
        if (callback) callback({ success: true });
      }),
      onMessage: {
        addListener: jest.fn(),
        removeListener: jest.fn()
      },
      lastError: null,
      getManifest: jest.fn(() => ({ version: '1.0.0' }))
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
        remove: jest.fn((keys, callback) => {
          if (callback) callback();
          return Promise.resolve();
        }),
        clear: jest.fn((callback) => {
          if (callback) callback();
          return Promise.resolve();
        })
      },
      sync: {
        get: jest.fn((keys, callback) => {
          if (callback) callback({});
          return Promise.resolve({});
        }),
        set: jest.fn((items, callback) => {
          if (callback) callback();
          return Promise.resolve();
        })
      }
    },
    tabs: {
      query: jest.fn((queryInfo, callback) => {
        if (callback) callback([{ id: 123, url: 'http://test.com' }]);
        return Promise.resolve([{ id: 123, url: 'http://test.com' }]);
      }),
      sendMessage: jest.fn(),
      captureVisibleTab: jest.fn((windowId, options, callback) => {
        if (callback) callback('data:image/png;base64,test');
        return Promise.resolve('data:image/png;base64,test');
      })
    },
    devtools: {
      inspectedWindow: {
        tabId: 123,
        eval: jest.fn((expression, callback) => {
          if (callback) callback(null, null);
        })
      },
      panels: {
        create: jest.fn((title, icon, page, callback) => {
          if (callback) callback({ onShown: { addListener: jest.fn() }});
        })
      }
    },
    scripting: {
      executeScript: jest.fn((details, callback) => {
        if (callback) callback([{ result: true }]);
        return Promise.resolve([{ result: true }]);
      })
    },
    windows: {
      getCurrent: jest.fn((callback) => {
        if (callback) callback({ id: 1 });
        return Promise.resolve({ id: 1 });
      })
    }
  };
}

function setupMockWindow() {
  return {
    location: {
      href: 'http://test.com',
      hostname: 'test.com',
      pathname: '/',
      search: '',
      hash: '',
      reload: jest.fn()
    },
    navigator: {
      userAgent: 'Test Browser',
      language: 'en-US',
      languages: ['en-US', 'en'],
      onLine: true
    },
    localStorage: {
      getItem: jest.fn(),
      setItem: jest.fn(),
      removeItem: jest.fn(),
      clear: jest.fn()
    },
    sessionStorage: {
      getItem: jest.fn(),
      setItem: jest.fn(),
      removeItem: jest.fn(),
      clear: jest.fn()
    },
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    postMessage: jest.fn(),
    alert: jest.fn(),
    confirm: jest.fn(() => true),
    prompt: jest.fn(() => 'test'),
    setTimeout: global.setTimeout,
    clearTimeout: global.clearTimeout,
    setInterval: global.setInterval,
    clearInterval: global.clearInterval,
    requestAnimationFrame: jest.fn((cb) => setTimeout(cb, 0)),
    cancelAnimationFrame: jest.fn(clearTimeout),
    performance: {
      now: jest.fn(() => Date.now()),
      mark: jest.fn(),
      measure: jest.fn()
    },
    console: global.console,
    Date: global.Date,
    Math: global.Math,
    JSON: global.JSON
  };
}

module.exports = {
  createMockElement,
  setupMockDOM,
  setupMockChromeAPI,
  setupMockWindow
};