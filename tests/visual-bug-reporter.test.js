/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * Visual Bug Reporter Test Suite
 * Tests element selection, highlighting, and bug capture functionality
 */

describe('Visual Bug Reporter', () => {
  let reporter;
  let mockElement;
  let mockDocument;
  let mockWindow;
  let mockChrome;

  beforeEach(() => {
    // Setup DOM mocks
    mockElement = {
      getBoundingClientRect: jest.fn(() => ({
        top: 100,
        left: 200,
        width: 300,
        height: 150,
        right: 500,
        bottom: 250
      })),
      tagName: 'DIV',
      id: 'test-element',
      className: 'test-class',
      classList: ['test-class'],
      parentElement: null,
      textContent: 'Test content',
      innerHTML: '<span>Test</span>',
      outerHTML: '<div id="test-element">Test</div>',
      dataset: { testId: '123' },
      attributes: [],
      hasAttribute: jest.fn(),
      getAttribute: jest.fn(),
      style: {},
      addEventListener: jest.fn(),
      removeEventListener: jest.fn()
    };

    mockDocument = {
      createElement: jest.fn((tag) => ({
        tagName: tag.toUpperCase(),
        style: { cssText: '' },
        classList: {
          add: jest.fn(),
          remove: jest.fn(),
          toggle: jest.fn()
        },
        addEventListener: jest.fn(),
        remove: jest.fn(),
        appendChild: jest.fn(),
        innerHTML: '',
        id: ''
      })),
      body: {
        appendChild: jest.fn(),
        style: { cursor: '' }
      },
      elementsFromPoint: jest.fn(() => [mockElement]),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      querySelectorAll: jest.fn(() => [])
    };

    mockWindow = {
      getComputedStyle: jest.fn(() => ({
        backgroundColor: 'rgb(255, 255, 255)',
        color: 'rgb(0, 0, 0)',
        fontSize: '16px',
        fontFamily: 'Arial',
        padding: '10px',
        margin: '5px',
        opacity: '1',
        display: 'block',
        position: 'relative',
        zIndex: '1'
      })),
      innerWidth: 1920,
      innerHeight: 1080,
      scrollX: 0,
      scrollY: 0
    };

    mockChrome = {
      runtime: {
        onMessage: { addListener: jest.fn() },
        sendMessage: jest.fn((msg, callback) => {
          if (callback) callback({ success: true });
        })
      }
    };

    global.document = mockDocument;
    global.window = mockWindow;
    global.chrome = mockChrome;

    // Load the Visual Bug Reporter
    const VisualBugReporter = require('../src/extension/content/visual-bug-reporter.js');
    reporter = new VisualBugReporter();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Initialization', () => {
    test('should initialize with default state', () => {
      expect(reporter.isActive).toBe(false);
      expect(reporter.selectedElement).toBeNull();
      expect(reporter.mode).toBe('select');
      expect(reporter.annotations).toEqual([]);
    });

    test('should register message listener', async () => {
      await reporter.init();
      expect(chrome.runtime.onMessage.addListener).toHaveBeenCalled();
    });
  });

  describe('Activation', () => {
    test('should start visual bug reporting mode', () => {
      reporter.start();

      expect(reporter.isActive).toBe(true);
      expect(reporter.mode).toBe('select');
      expect(document.body.style.cursor).toBe('crosshair');
      expect(document.addEventListener).toHaveBeenCalledWith('mousemove', expect.any(Function));
      expect(document.addEventListener).toHaveBeenCalledWith('click', expect.any(Function));
      expect(document.addEventListener).toHaveBeenCalledWith('keydown', expect.any(Function));
    });

    test('should create UI overlays', () => {
      reporter.start();

      expect(document.createElement).toHaveBeenCalledWith('div');
      expect(document.body.appendChild).toHaveBeenCalled();
    });

    test('should not start if already active', () => {
      reporter.isActive = true;
      const appendSpy = jest.spyOn(document.body, 'appendChild');

      reporter.start();

      expect(appendSpy).not.toHaveBeenCalled();
    });
  });

  describe('Element Selection', () => {
    test('should get element at point', () => {
      const element = reporter.getElementAtPoint(100, 200);

      expect(document.elementsFromPoint).toHaveBeenCalledWith(100, 200);
      expect(element).toBeDefined();
    });

    test('should select best element from stack', () => {
      const elements = [
        { tagName: 'HTML' },
        { tagName: 'BODY' },
        mockElement
      ];

      const best = reporter.selectBestElement(elements, 100, 200);

      expect(best).toBeDefined();
      // Should prefer specific elements over html/body
      expect(best.tagName).not.toBe('HTML');
    });

    test('should score elements correctly', () => {
      // Element with ID should score higher
      const elementWithId = { ...mockElement, id: 'important' };
      const elementWithoutId = { ...mockElement, id: '' };

      const elements = [elementWithoutId, elementWithId];
      const best = reporter.selectBestElement(elements, 100, 200);

      expect(best.id).toBe('important');
    });

    test('should handle click to select element', () => {
      reporter.isActive = true;
      reporter.mode = 'select';

      const event = {
        clientX: 100,
        clientY: 200,
        preventDefault: jest.fn(),
        stopPropagation: jest.fn()
      };

      reporter.handleClick(event);

      expect(event.preventDefault).toHaveBeenCalled();
      expect(event.stopPropagation).toHaveBeenCalled();
    });
  });

  describe('Element Highlighting', () => {
    test('should highlight element on hover', () => {
      reporter.isActive = true;
      reporter.overlay = { style: { display: 'none' } };

      reporter.highlightElement(mockElement);

      expect(mockElement.getBoundingClientRect).toHaveBeenCalled();
      expect(reporter.overlay.style.display).toBe('block');
    });

    test('should show element info panel', () => {
      reporter.infoPanel = { innerHTML: '', style: { display: 'none' } };

      reporter.showElementInfo(mockElement);

      expect(reporter.infoPanel.innerHTML).toContain('test-element');
      expect(reporter.infoPanel.innerHTML).toContain('300 × 150px');
      expect(reporter.infoPanel.style.display).toBe('block');
    });

    test('should clear highlight when hovering nothing', () => {
      reporter.isActive = true;
      reporter.overlay = { style: { display: 'block' } };
      mockDocument.elementsFromPoint.mockReturnValue([]);

      const event = { clientX: 0, clientY: 0 };
      reporter.handleMouseMove(event);

      expect(reporter.hoveredElement).toBeNull();
    });
  });

  describe('Data Collection', () => {
    test('should collect comprehensive element data', async () => {
      const data = await reporter.collectElementData(mockElement);

      expect(data).toHaveProperty('selector');
      expect(data).toHaveProperty('tagName', 'div');
      expect(data).toHaveProperty('id', 'test-element');
      expect(data).toHaveProperty('position');
      expect(data).toHaveProperty('styles');
      expect(data).toHaveProperty('computed');
      expect(data.position.width).toBe(300);
      expect(data.position.height).toBe(150);
    });

    test('should generate CSS selector', () => {
      const selector = reporter.generateSelector(mockElement);

      expect(selector).toContain('#test-element');
    });

    test('should generate selector without ID', () => {
      const elementNoId = { ...mockElement, id: '', parentElement: document.body };
      const selector = reporter.generateSelector(elementNoId);

      expect(selector).toContain('div');
      expect(selector).not.toContain('#');
    });

    test('should check element visibility', () => {
      const visible = reporter.isElementVisible(mockElement);

      expect(visible).toBe(true);
    });

    test('should detect interactive elements', () => {
      const button = { ...mockElement, tagName: 'BUTTON' };
      const interactive = reporter.isElementInteractive(button);

      expect(interactive).toBe(true);
    });
  });

  describe('Keyboard Controls', () => {
    test('should stop on Escape key', () => {
      reporter.isActive = true;
      const stopSpy = jest.spyOn(reporter, 'stop');

      reporter.handleKeyPress({ key: 'Escape' });

      expect(stopSpy).toHaveBeenCalled();
    });

    test('should ignore keys when inactive', () => {
      reporter.isActive = false;
      const stopSpy = jest.spyOn(reporter, 'stop');

      reporter.handleKeyPress({ key: 'Escape' });

      expect(stopSpy).not.toHaveBeenCalled();
    });
  });

  describe('Cleanup', () => {
    test('should clean up on stop', () => {
      reporter.isActive = true;
      reporter.overlay = { remove: jest.fn() };
      reporter.toolbar = { remove: jest.fn() };
      reporter.infoPanel = { remove: jest.fn() };

      reporter.stop();

      expect(reporter.isActive).toBe(false);
      expect(reporter.overlay.remove).toHaveBeenCalled();
      expect(document.removeEventListener).toHaveBeenCalledWith('mousemove', expect.any(Function));
      expect(document.removeEventListener).toHaveBeenCalledWith('click', expect.any(Function));
      expect(document.body.style.cursor).toBe('');
    });
  });

  describe('Message Handling', () => {
    test('should handle START_VISUAL_BUG_REPORT message', () => {
      const startSpy = jest.spyOn(reporter, 'start');
      const messageHandler = chrome.runtime.onMessage.addListener.mock.calls[0]?.[0];
      const sendResponse = jest.fn();

      if (messageHandler) {
        messageHandler({ type: 'START_VISUAL_BUG_REPORT' }, {}, sendResponse);
        expect(startSpy).toHaveBeenCalled();
        expect(sendResponse).toHaveBeenCalledWith({ success: true });
      }
    });

    test('should handle STOP_VISUAL_BUG_REPORT message', () => {
      const stopSpy = jest.spyOn(reporter, 'stop');
      const messageHandler = chrome.runtime.onMessage.addListener.mock.calls[0]?.[0];
      const sendResponse = jest.fn();

      if (messageHandler) {
        messageHandler({ type: 'STOP_VISUAL_BUG_REPORT' }, {}, sendResponse);
        expect(stopSpy).toHaveBeenCalled();
        expect(sendResponse).toHaveBeenCalledWith({ success: true });
      }
    });
  });

  describe('Bug Capture', () => {
    test('should capture element and send to background', async () => {
      reporter.selectedElement = mockElement;

      await reporter.captureElement(mockElement);

      expect(chrome.runtime.sendMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'VISUAL_BUG_CAPTURED'
        }),
        expect.any(Function)
      );
    });

    test('should include element data in capture', async () => {
      await reporter.captureElement(mockElement);

      const captureCall = chrome.runtime.sendMessage.mock.calls[0];
      expect(captureCall[0].data).toHaveProperty('element');
      expect(captureCall[0].data.element).toHaveProperty('selector');
    });
  });
});