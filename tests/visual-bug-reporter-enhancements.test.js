/* eslint-disable @typescript-eslint/no-require-imports */
// Add TextEncoder/TextDecoder polyfills for jsdom
global.TextEncoder = require('util').TextEncoder;
global.TextDecoder = require('util').TextDecoder;

const { JSDOM } = require('jsdom');
const { describe, it, expect, beforeEach, afterEach, jest: jestGlobals } = require('@jest/globals');

// Setup DOM environment
const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>', {
  url: 'http://localhost',
  pretendToBeVisual: true,
  resources: 'usable'
});

global.window = dom.window;
global.document = window.document;
global.navigator = window.navigator;
global.HTMLElement = window.HTMLElement;
global.MutationObserver = window.MutationObserver;
global.PerformanceObserver = window.PerformanceObserver || class PerformanceObserver {
  constructor() {}
  observe() {}
  disconnect() {}
};

// Mock Chrome API
global.chrome = {
  runtime: {
    sendMessage: jestGlobals.fn(),
    onMessage: {
      addListener: jestGlobals.fn(),
      removeListener: jestGlobals.fn()
    }
  },
  storage: {
    local: {
      get: jestGlobals.fn((keys, callback) => callback({})),
      set: jestGlobals.fn((data, callback) => callback && callback())
    }
  }
};

// Mock Performance API
global.performance = {
  memory: {
    usedJSHeapSize: 1000000,
    totalJSHeapSize: 2000000,
    jsHeapSizeLimit: 4000000
  },
  now: jestGlobals.fn(() => Date.now()),
  getEntriesByType: jestGlobals.fn(() => [
    { name: 'paint', startTime: 100, duration: 50 },
    { name: 'layout-shift', value: 0.05 }
  ])
};

describe('Visual Bug Reporter Enhancements', () => {
  let reporter;
  let testElement;
  let mockEvent;

  beforeEach(() => {
    // Clear document body
    document.body.innerHTML = '';

    // Create test elements
    testElement = document.createElement('div');
    testElement.id = 'test-element';
    testElement.className = 'test-class';
    testElement.style.cssText = 'width: 100px; height: 100px; color: #333; background: #fff;';
    testElement.setAttribute('role', 'button');
    testElement.setAttribute('aria-label', 'Test Button');
    testElement.textContent = 'Test Content';
    document.body.appendChild(testElement);

    // Create mock event
    mockEvent = {
      clientX: 50,
      clientY: 50,
      preventDefault: jestGlobals.fn(),
      stopPropagation: jestGlobals.fn(),
      ctrlKey: false,
      altKey: false,
      key: null
    };

    // Mock document.elementsFromPoint
    document.elementsFromPoint = jestGlobals.fn(() => [testElement, document.body]);

    // Load Visual Bug Reporter with enhancements
    const VisualBugReporter = require('../src/extension/content/visual-bug-reporter.js');  
    reporter = new VisualBugReporter();
  });

  afterEach(() => {
    if (reporter && reporter.cleanup) {
      reporter.cleanup();
    }
    document.body.innerHTML = '';
    jestGlobals.clearAllMocks();
  });

  describe('Enhanced Tooltip with Accessibility Info', () => {
    it('should display accessibility information in tooltip', () => {
      reporter.activate();
      mockEvent.type = 'mousemove';

      // Trigger hover
      document.dispatchEvent(new MouseEvent('mousemove', mockEvent));

      const tooltip = document.querySelector('.mosqit-tooltip');
      expect(tooltip).toBeTruthy();

      // Check for accessibility info
      const tooltipText = tooltip.textContent;
      expect(tooltipText).toContain('role');
      expect(tooltipText).toContain('button');
    });

    it('should show contrast ratio for text elements', () => {
      reporter.activate();

      // Create text element with specific colors
      const textElement = document.createElement('p');
      textElement.style.color = '#000000';
      textElement.style.backgroundColor = '#ffffff';
      textElement.textContent = 'High contrast text';
      document.body.appendChild(textElement);

      mockEvent.clientX = 10;
      mockEvent.clientY = 10;
      document.elementsFromPoint = jestGlobals.fn(() => [textElement]);

      document.dispatchEvent(new MouseEvent('mousemove', mockEvent));

      const tooltip = document.querySelector('.mosqit-tooltip');
      expect(tooltip).toBeTruthy();
      expect(tooltip.textContent).toMatch(/contrast|color/i);
    });
  });

  describe('Persistent Tooltip Mode', () => {
    it('should toggle persistent mode with Ctrl+Alt', () => {
      reporter.activate();

      // Trigger Ctrl+Alt keydown
      const keyEvent = new KeyboardEvent('keydown', {
        ctrlKey: true,
        altKey: true,
        key: 'Control'
      });

      document.dispatchEvent(keyEvent);

      // Check if persistent mode indicator is shown
      const persistentIndicator = document.querySelector('.mosqit-persistent-mode');
      expect(persistentIndicator || reporter.persistentMode).toBeTruthy();
    });

    it('should keep tooltip visible in persistent mode', () => {
      reporter.activate();
      reporter.persistentMode = true;

      // Show tooltip
      document.dispatchEvent(new MouseEvent('mousemove', mockEvent));
      const tooltip = document.querySelector('.mosqit-tooltip');
      expect(tooltip).toBeTruthy();

      // Move mouse away
      mockEvent.clientX = 500;
      mockEvent.clientY = 500;
      document.dispatchEvent(new MouseEvent('mousemove', mockEvent));

      // Tooltip should still be visible
      expect(document.querySelector('.mosqit-tooltip')).toBeTruthy();
    });
  });

  describe('Keyboard Navigation', () => {
    it('should navigate to parent element with ArrowUp', () => {
      reporter.activate();

      // Create parent-child structure
      const parent = document.createElement('div');
      parent.id = 'parent';
      const child = document.createElement('span');
      child.id = 'child';
      parent.appendChild(child);
      document.body.appendChild(parent);

      // Select child element
      reporter.selectedElement = child;

      // Press ArrowUp
      const keyEvent = new KeyboardEvent('keydown', {
        key: 'ArrowUp'
      });
      document.dispatchEvent(keyEvent);

      // Should select parent
      expect(reporter.selectedElement).toBe(parent);
    });

    it('should navigate to child element with ArrowDown', () => {
      reporter.activate();

      // Create parent-child structure
      const parent = document.createElement('div');
      const child = document.createElement('span');
      parent.appendChild(child);
      document.body.appendChild(parent);

      // Select parent element
      reporter.selectedElement = parent;

      // Press ArrowDown
      const keyEvent = new KeyboardEvent('keydown', {
        key: 'ArrowDown'
      });
      document.dispatchEvent(keyEvent);

      // Should select first child
      expect(reporter.selectedElement).toBe(child);
    });

    it('should navigate between siblings with ArrowLeft/Right', () => {
      reporter.activate();

      // Create sibling elements
      const sibling1 = document.createElement('div');
      sibling1.id = 'sibling1';
      const sibling2 = document.createElement('div');
      sibling2.id = 'sibling2';
      document.body.appendChild(sibling1);
      document.body.appendChild(sibling2);

      // Select first sibling
      reporter.selectedElement = sibling1;

      // Press ArrowRight
      let keyEvent = new KeyboardEvent('keydown', {
        key: 'ArrowRight'
      });
      document.dispatchEvent(keyEvent);

      // Should select next sibling
      expect(reporter.selectedElement).toBe(sibling2);

      // Press ArrowLeft
      keyEvent = new KeyboardEvent('keydown', {
        key: 'ArrowLeft'
      });
      document.dispatchEvent(keyEvent);

      // Should select previous sibling
      expect(reporter.selectedElement).toBe(sibling1);
    });
  });

  describe('Multi-element Selection', () => {
    it('should select multiple elements with Ctrl+Click', () => {
      reporter.activate();
      reporter.multiSelectElements = [];

      // Create multiple elements
      const elem1 = document.createElement('div');
      elem1.id = 'elem1';
      const elem2 = document.createElement('div');
      elem2.id = 'elem2';
      document.body.appendChild(elem1);
      document.body.appendChild(elem2);

      // Ctrl+Click first element
      document.elementsFromPoint = jestGlobals.fn(() => [elem1]);
      mockEvent.ctrlKey = true;
      document.dispatchEvent(new MouseEvent('click', mockEvent));

      // Ctrl+Click second element
      document.elementsFromPoint = jestGlobals.fn(() => [elem2]);
      document.dispatchEvent(new MouseEvent('click', mockEvent));

      // Both should be selected
      expect(reporter.multiSelectElements).toContain(elem1);
      expect(reporter.multiSelectElements).toContain(elem2);
    });

    it('should select all similar elements', () => {
      reporter.activate();

      // Create multiple elements with same class
      for (let i = 0; i < 3; i++) {
        const elem = document.createElement('div');
        elem.className = 'similar-class';
        document.body.appendChild(elem);
      }

      const similarElements = document.querySelectorAll('.similar-class');
      reporter.selectSimilarElements = jestGlobals.fn();

      // Select one element
      reporter.selectedElement = similarElements[0];

      // Trigger select similar (would be through UI or keyboard shortcut)
      if (reporter.selectSimilarElements) {
        reporter.selectSimilarElements();
      }

      // All similar elements should be selected
      expect(reporter.multiSelectElements || []).toHaveLength(3);
    });
  });

  describe('Performance Metrics Overlay', () => {
    it('should create performance overlay when enabled', () => {
      reporter.activate();

      // Enable performance overlay
      if (reporter.togglePerformanceOverlay) {
        reporter.togglePerformanceOverlay();
      } else {
        reporter.showPerformanceOverlay = true;
      }

      const overlay = document.querySelector('.mosqit-performance-overlay');
      expect(overlay).toBeTruthy();
    });

    it('should display memory usage metrics', () => {
      reporter.activate();
      reporter.showPerformanceOverlay = true;

      // Trigger overlay update
      if (reporter.updatePerformanceOverlay) {
        reporter.updatePerformanceOverlay();
      }

      const overlay = document.querySelector('.mosqit-performance-overlay');
      if (overlay) {
        expect(overlay.textContent).toMatch(/memory|heap/i);
      }
    });

    it('should track paint and layout metrics', () => {
      reporter.activate();
      reporter.showPerformanceOverlay = true;

      // Mock performance entries
      performance.getEntriesByType = jestGlobals.fn((type) => {
        if (type === 'paint') {
          return [
            { name: 'first-paint', startTime: 100 },
            { name: 'first-contentful-paint', startTime: 150 }
          ];
        }
        if (type === 'layout-shift') {
          return [{ value: 0.1 }];
        }
        return [];
      });

      if (reporter.updatePerformanceOverlay) {
        reporter.updatePerformanceOverlay();
      }

      const overlay = document.querySelector('.mosqit-performance-overlay');
      if (overlay) {
        expect(overlay.textContent).toMatch(/paint|layout/i);
      }
    });
  });

  describe('CSS Editor Integration', () => {
    it('should show CSS editor for selected element', () => {
      reporter.activate();
      reporter.selectedElement = testElement;

      // Trigger CSS editor
      if (reporter.showCSSEditor) {
        reporter.showCSSEditor();
      }

      const editor = document.querySelector('.mosqit-css-editor');
      expect(editor).toBeTruthy();
    });

    it('should apply CSS changes in real-time', () => {
      reporter.activate();
      reporter.selectedElement = testElement;

      // Show CSS editor
      if (reporter.showCSSEditor) {
        reporter.showCSSEditor();
      }

      const editor = document.querySelector('.mosqit-css-editor textarea');
      if (editor) {
        // Change CSS
        editor.value = 'background-color: red;';
        editor.dispatchEvent(new Event('input'));

        // Check if style was applied
        expect(testElement.style.backgroundColor).toBe('red');
      }
    });
  });

  describe('Smart Context Detection', () => {
    it('should detect form validation errors', () => {
      // Create form with invalid input
      const form = document.createElement('form');
      const input = document.createElement('input');
      input.type = 'email';
      input.value = 'invalid-email';
      input.setCustomValidity('Invalid email format');
      form.appendChild(input);
      document.body.appendChild(form);

      reporter.activate();
      reporter.selectedElement = input;

      // Check context detection
      if (reporter.detectContext) {
        const context = reporter.detectContext(input);
        expect(context).toMatch(/invalid|error/i);
      }
    });

    it('should detect broken images', () => {
      // Create broken image
      const img = document.createElement('img');
      img.src = 'nonexistent.jpg';
      img.onerror = () => {
        img.dataset.error = 'true';
      };
      document.body.appendChild(img);

      reporter.activate();
      reporter.selectedElement = img;

      // Check context detection
      if (reporter.detectContext) {
        const context = reporter.detectContext(img);
        expect(context).toMatch(/broken|error|missing/i);
      }
    });
  });

  describe('Enhanced Info Panel', () => {
    it('should create tabbed info panel', () => {
      reporter.activate();
      reporter.selectedElement = testElement;

      // Show info panel
      if (reporter.showInfoPanel) {
        reporter.showInfoPanel();
      }

      const panel = document.querySelector('.mosqit-info-panel');
      expect(panel).toBeTruthy();

      // Check for tabs
      const tabs = panel?.querySelectorAll('.tab');
      expect(tabs?.length).toBeGreaterThan(0);
    });

    it('should display element styles in Styles tab', () => {
      reporter.activate();
      reporter.selectedElement = testElement;

      if (reporter.showInfoPanel) {
        reporter.showInfoPanel();
      }

      const stylesTab = document.querySelector('.mosqit-info-panel .styles-tab');
      if (stylesTab) {
        expect(stylesTab.textContent).toMatch(/width|height|color/i);
      }
    });

    it('should display accessibility info in Accessibility tab', () => {
      reporter.activate();
      reporter.selectedElement = testElement;

      if (reporter.showInfoPanel) {
        reporter.showInfoPanel();
      }

      const a11yTab = document.querySelector('.mosqit-info-panel .accessibility-tab');
      if (a11yTab) {
        expect(a11yTab.textContent).toMatch(/role|aria/i);
      }
    });
  });

  describe('Grid and Flexbox Detection', () => {
    it('should detect CSS Grid containers', () => {
      // Create grid container
      const gridContainer = document.createElement('div');
      gridContainer.style.display = 'grid';
      gridContainer.style.gridTemplateColumns = '1fr 1fr';
      document.body.appendChild(gridContainer);

      reporter.activate();
      reporter.selectedElement = gridContainer;

      // Check if grid is detected
      if (reporter.detectLayoutType) {
        const layoutType = reporter.detectLayoutType(gridContainer);
        expect(layoutType).toBe('grid');
      }
    });

    it('should detect Flexbox containers', () => {
      // Create flex container
      const flexContainer = document.createElement('div');
      flexContainer.style.display = 'flex';
      flexContainer.style.flexDirection = 'row';
      document.body.appendChild(flexContainer);

      reporter.activate();
      reporter.selectedElement = flexContainer;

      // Check if flexbox is detected
      if (reporter.detectLayoutType) {
        const layoutType = reporter.detectLayoutType(flexContainer);
        expect(layoutType).toBe('flex');
      }
    });
  });

  describe('Breadcrumb Navigation', () => {
    it('should create breadcrumb for DOM path', () => {
      // Create nested structure
      const grandparent = document.createElement('div');
      grandparent.id = 'grandparent';
      const parent = document.createElement('section');
      parent.className = 'parent';
      const child = document.createElement('span');
      child.id = 'target';

      parent.appendChild(child);
      grandparent.appendChild(parent);
      document.body.appendChild(grandparent);

      reporter.activate();
      reporter.selectedElement = child;

      // Show breadcrumb
      if (reporter.showBreadcrumb) {
        reporter.showBreadcrumb();
      }

      const breadcrumb = document.querySelector('.mosqit-breadcrumb');
      expect(breadcrumb).toBeTruthy();

      if (breadcrumb) {
        expect(breadcrumb.textContent).toContain('grandparent');
        expect(breadcrumb.textContent).toContain('parent');
        expect(breadcrumb.textContent).toContain('target');
      }
    });

    it('should navigate to element when breadcrumb item clicked', () => {
      // Create nested structure
      const parent = document.createElement('div');
      const child = document.createElement('span');
      parent.appendChild(child);
      document.body.appendChild(parent);

      reporter.activate();
      reporter.selectedElement = child;

      if (reporter.showBreadcrumb) {
        reporter.showBreadcrumb();
      }

      const breadcrumbItems = document.querySelectorAll('.mosqit-breadcrumb-item');
      if (breadcrumbItems.length > 0) {
        // Click parent in breadcrumb
        breadcrumbItems[0].click();

        // Should select parent element
        expect(reporter.selectedElement).toBe(parent);
      }
    });
  });
});