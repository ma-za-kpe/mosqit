/**
 * Mosqit Native Inspector
 * Uses Chrome DevTools Protocol to leverage native inspect mode for element selection
 */

class NativeInspector {
  constructor() {
    this.isActive = false;
    this.debuggee = null;
    this.selectedElements = [];
    this.multiSelectMode = false;
    this.onElementSelected = null;
    this.onInspectionComplete = null;
    this.clickInterceptor = null;
  }

  /**
   * Initialize the native inspector
   */
  async init() {
    console.log('[Native Inspector] Initialized');

    // Listen for messages from DevTools panel via window messages
    this.messageListener = (event) => {
      if (event.source !== window) return;

      if (event.data && event.data.source === 'mosqit-devtools') {
        if (event.data.type === 'START_NATIVE_INSPECT') {
          console.log('[Native Inspector] Starting inspection mode');
          this.startInspection(event.data.options);
        } else if (event.data.type === 'STOP_NATIVE_INSPECT') {
          console.log('[Native Inspector] Stopping inspection mode');
          this.stopInspection();
        }
      }
    };
    window.addEventListener('message', this.messageListener);

    // Also listen for Chrome extension messages (from content script in ISOLATED world)
    // This won't work in MAIN world, but we'll add a bridge
    if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.onMessage) {
      chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        if (request.type === 'START_NATIVE_INSPECT') {
          console.log('[Native Inspector] Received START via chrome.runtime');
          this.startInspection(request.options);
          sendResponse({ success: true });
        } else if (request.type === 'STOP_NATIVE_INSPECT') {
          console.log('[Native Inspector] Received STOP via chrome.runtime');
          this.stopInspection();
          sendResponse({ success: true });
        }
        return true;
      });
    }

    // Since we're in MAIN world, we need to communicate via window.postMessage
    // Add a bridge to receive messages from the extension
    console.log('[Native Inspector] Setting up message bridge');

    // Announce that we're ready
    window.postMessage({
      source: 'mosqit-native-inspector',
      type: 'READY',
      timestamp: Date.now()
    }, '*');
  }

  /**
   * Start native inspection mode
   */
  async startInspection(options = {}) {
    if (this.isActive) {
      console.warn('[Native Inspector] Already active');
      return;
    }

    this.isActive = true;
    this.multiSelectMode = options.multiSelect || false;
    this.selectedElements = [];

    try {
      // Since we're in MAIN world, we can't reliably use chrome.runtime
      // Just use the fallback click interceptor which works great
      console.log('[Native Inspector] Using click interceptor (MAIN world compatible)');
      this.startClickInterception();

      // Notify that inspection has started
      this.sendMessage('INSPECTION_STARTED', { method: 'click-interceptor' });

    } catch (error) {
      console.error('[Native Inspector] Failed to start inspection:', error);
      this.isActive = false;
      this.sendMessage('INSPECTION_ERROR', { error: error.message });
    }
  }

  // CDP methods removed - not available in MAIN world
  // The CDP functionality is handled by the DevTools panel directly

  /**
   * Fallback method: Intercept clicks to select elements
   */
  startClickInterception() {
    // Create invisible overlay to intercept clicks
    this.clickInterceptor = document.createElement('div');
    this.clickInterceptor.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: 2147483647;
      cursor: crosshair;
      pointer-events: auto;
      background: transparent;
    `;

    // Visual highlight element with enhanced design
    this.highlightEl = document.createElement('div');
    this.highlightEl.style.cssText = `
      position: absolute;
      border: 3px solid #1a73e8;
      background: rgba(26, 115, 232, 0.15);
      box-shadow: 0 0 20px rgba(26, 115, 232, 0.5),
                  inset 0 0 20px rgba(26, 115, 232, 0.1),
                  0 4px 12px rgba(26, 115, 232, 0.3);
      pointer-events: none;
      z-index: 2147483646;
      transition: all 0.15s cubic-bezier(0.4, 0, 0.2, 1);
      display: none;
      border-radius: 4px;
    `;

    // Add a tooltip/label to show element info
    this.tooltipEl = document.createElement('div');
    this.tooltipEl.style.cssText = `
      position: absolute;
      background: linear-gradient(135deg, #1a73e8 0%, #1557b0 100%);
      color: white;
      padding: 6px 12px;
      border-radius: 6px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 12px;
      font-weight: 500;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15),
                  0 2px 4px rgba(0, 0, 0, 0.1);
      pointer-events: none;
      z-index: 2147483647;
      display: none;
      white-space: nowrap;
      max-width: 300px;
      overflow: hidden;
      text-overflow: ellipsis;
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.2);
    `;

    document.body.appendChild(this.highlightEl);
    document.body.appendChild(this.tooltipEl);
    document.body.appendChild(this.clickInterceptor);

    // Track mouse movement for highlighting
    this.clickInterceptor.addEventListener('mousemove', (e) => {
      const element = document.elementFromPoint(e.clientX, e.clientY);
      if (element && element !== this.clickInterceptor) {
        this.highlightElement(element);
      }
    });

    // Handle click to select element
    this.clickInterceptor.addEventListener('click', async (e) => {
      e.preventDefault();
      e.stopPropagation();

      // Remove interceptor temporarily to get element underneath
      this.clickInterceptor.style.pointerEvents = 'none';
      const element = document.elementFromPoint(e.clientX, e.clientY);
      this.clickInterceptor.style.pointerEvents = 'auto';

      if (element) {
        // Wait for element selection and screenshot
        await this.selectElement(element);

        if (!this.multiSelectMode) {
          // Small delay to ensure screenshot is captured with highlight
          setTimeout(() => this.stopInspection(), 100);
        }
      }

      return false;
    });

    // ESC to cancel
    this.escHandler = (e) => {
      if (e.key === 'Escape') {
        this.stopInspection();
      }
    };
    document.addEventListener('keydown', this.escHandler);
  }

  /**
   * Highlight an element visually with enhanced design
   */
  highlightElement(element) {
    const rect = element.getBoundingClientRect();
    const scrollX = window.pageXOffset || document.documentElement.scrollLeft;
    const scrollY = window.pageYOffset || document.documentElement.scrollTop;

    // Update highlight box position and size
    this.highlightEl.style.display = 'block';
    this.highlightEl.style.left = (rect.left + scrollX) + 'px';
    this.highlightEl.style.top = (rect.top + scrollY) + 'px';
    this.highlightEl.style.width = rect.width + 'px';
    this.highlightEl.style.height = rect.height + 'px';

    // Generate element info for tooltip
    const tagName = element.tagName.toLowerCase();
    const id = element.id ? `#${element.id}` : '';
    const classes = element.className ? `.${element.className.split(' ').filter(c => c).join('.')}` : '';
    const dimensions = `${Math.round(rect.width)} × ${Math.round(rect.height)}`;

    // Build tooltip text
    let tooltipText = tagName;
    if (id) tooltipText += id;
    else if (classes) tooltipText += classes.substring(0, 50); // Limit class length
    tooltipText += ` | ${dimensions}px`;

    // Update tooltip content and position
    this.tooltipEl.textContent = tooltipText;
    this.tooltipEl.style.display = 'block';

    // Position tooltip above the element if there's room, otherwise below
    const tooltipTop = rect.top > 40 ?
      (rect.top + scrollY - 35) + 'px' :
      (rect.bottom + scrollY + 5) + 'px';

    this.tooltipEl.style.left = (rect.left + scrollX) + 'px';
    this.tooltipEl.style.top = tooltipTop;
  }

  /**
   * Select an element and extract its data
   */
  async selectElement(element) {
    const elementData = this.extractElementData(element);
    this.selectedElements.push(elementData);

    console.log('[Native Inspector] Element selected:', elementData);

    // Keep highlight visible for screenshot
    this.highlightElement(element);

    // Request screenshot with highlight visible
    const screenshot = await this.captureScreenshot();

    // Send selected element data back to DevTools
    this.sendMessage('ELEMENT_SELECTED', elementData);

    // Send as VISUAL_BUG_CAPTURED for compatibility with existing flow
    const bugData = {
      element: elementData,
      screenshot: screenshot,
      page: {
        url: window.location.href,
        title: document.title
      },
      timestamp: Date.now()
    };

    // Send to bridge for forwarding to background/DevTools
    window.postMessage({
      type: 'VISUAL_BUG_CAPTURED_FROM_MAIN',
      data: bugData
    }, '*');
  }

  /**
   * Request screenshot from extension
   */
  async captureScreenshot() {
    return new Promise((resolve) => {
      const requestId = Date.now().toString();

      // Listen for screenshot response
      const listener = (event) => {
        if (event.data?.type === 'SCREENSHOT_RESPONSE' && event.data?.requestId === requestId) {
          window.removeEventListener('message', listener);
          resolve(event.data.screenshot);
        }
      };
      window.addEventListener('message', listener);

      // Request screenshot via bridge
      window.postMessage({
        type: 'REQUEST_SCREENSHOT_FROM_MAIN',
        requestId: requestId
      }, '*');

      // Timeout fallback
      setTimeout(() => {
        window.removeEventListener('message', listener);
        console.warn('[Native Inspector] Screenshot request timed out');
        resolve(null);
      }, 3000);
    });
  }

  /**
   * Extract comprehensive data from an element
   */
  extractElementData(element) {
    const rect = element.getBoundingClientRect();
    const styles = window.getComputedStyle(element);

    // Get unique selector
    const selector = this.getUniqueSelector(element);

    // Get XPath
    const xpath = this.getXPath(element);

    // Extract relevant attributes
    const attributes = {};
    for (const attr of element.attributes) {
      attributes[attr.name] = attr.value;
    }

    // Detect potential issues
    const issues = this.detectElementIssues(element, styles);

    return {
      // Basic info
      tagName: element.tagName.toLowerCase(),
      id: element.id || null,
      className: element.className || null,
      textContent: element.textContent?.substring(0, 100) || null,

      // Selectors
      selector: selector,
      xpath: xpath,

      // Position and dimensions
      position: {
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height,
        x: rect.x,
        y: rect.y
      },

      // Computed styles (relevant ones)
      styles: {
        display: styles.display,
        position: styles.position,
        color: styles.color,
        backgroundColor: styles.backgroundColor,
        fontSize: styles.fontSize,
        fontFamily: styles.fontFamily,
        zIndex: styles.zIndex,
        opacity: styles.opacity,
        visibility: styles.visibility,
        overflow: styles.overflow
      },

      // Attributes
      attributes: attributes,

      // Potential issues detected
      issues: issues,

      // Context
      parentTag: element.parentElement?.tagName.toLowerCase() || null,
      childrenCount: element.children.length,

      // For form elements
      type: element.type || null,
      value: element.value || null,
      checked: element.checked || null,
      disabled: element.disabled || null,
      required: element.required || null,

      // For images
      src: element.src || null,
      alt: element.alt || null,
      naturalWidth: element.naturalWidth || null,
      naturalHeight: element.naturalHeight || null,

      // For links
      href: element.href || null,
      target: element.target || null
    };
  }

  /**
   * Get unique CSS selector for element
   */
  getUniqueSelector(element) {
    if (element.id) {
      return `#${element.id}`;
    }

    const path = [];
    while (element && element.nodeType === Node.ELEMENT_NODE) {
      let selector = element.nodeName.toLowerCase();

      if (element.id) {
        selector = `#${element.id}`;
        path.unshift(selector);
        break;
      } else if (element.className) {
        selector += '.' + element.className.split(' ').join('.');
      }

      let sibling = element;
      let nth = 1;
      while (sibling = sibling.previousElementSibling) {
        if (sibling.nodeName.toLowerCase() === element.nodeName.toLowerCase()) {
          nth++;
        }
      }

      if (nth > 1) {
        selector += `:nth-of-type(${nth})`;
      }

      path.unshift(selector);
      element = element.parentNode;
    }

    return path.join(' > ');
  }

  /**
   * Get XPath for element
   */
  getXPath(element) {
    const segments = [];

    for (; element && element.nodeType === 1; element = element.parentNode) {
      let index = 1;

      for (let sibling = element.previousSibling; sibling; sibling = sibling.previousSibling) {
        if (sibling.nodeType === 1 && sibling.tagName === element.tagName) {
          index++;
        }
      }

      const tagName = element.tagName.toLowerCase();
      const segment = tagName + (index > 1 ? '[' + index + ']' : '');
      segments.unshift(segment);
    }

    return segments.length ? '/' + segments.join('/') : null;
  }

  /**
   * Detect potential issues with element
   */
  detectElementIssues(element, styles) {
    const issues = [];

    // Check visibility
    if (styles.display === 'none') {
      issues.push({ type: 'visibility', message: 'Element is hidden (display: none)' });
    }
    if (styles.visibility === 'hidden') {
      issues.push({ type: 'visibility', message: 'Element is invisible (visibility: hidden)' });
    }
    if (parseFloat(styles.opacity) === 0) {
      issues.push({ type: 'visibility', message: 'Element is transparent (opacity: 0)' });
    }

    // Check contrast for text elements
    if (element.textContent?.trim()) {
      const bgColor = styles.backgroundColor;
      const textColor = styles.color;
      // Simple contrast check (could be enhanced)
      if (bgColor === textColor) {
        issues.push({ type: 'contrast', message: 'Text and background colors are the same' });
      }
    }

    // Check broken images
    if (element.tagName.toLowerCase() === 'img') {
      if (!element.complete || element.naturalWidth === 0) {
        issues.push({ type: 'resource', message: 'Image failed to load' });
      }
      if (!element.alt) {
        issues.push({ type: 'accessibility', message: 'Image missing alt text' });
      }
    }

    // Check form validation
    if (element.tagName.toLowerCase() === 'input' || element.tagName.toLowerCase() === 'select') {
      if (element.required && !element.value) {
        issues.push({ type: 'validation', message: 'Required field is empty' });
      }
      if (element.validity && !element.validity.valid) {
        issues.push({ type: 'validation', message: 'Field has validation errors' });
      }
    }

    // Check for clickable elements with no handlers
    if (element.tagName.toLowerCase() === 'button' || element.getAttribute('onclick')) {
      const rect = element.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) {
        issues.push({ type: 'interaction', message: 'Clickable element has no size' });
      }
    }

    return issues;
  }

  /**
   * Stop inspection mode
   */
  stopInspection() {
    if (!this.isActive) return;

    this.isActive = false;

    // Clean up click interceptor if exists
    if (this.clickInterceptor) {
      this.clickInterceptor.remove();
      this.clickInterceptor = null;
    }

    if (this.highlightEl) {
      this.highlightEl.remove();
      this.highlightEl = null;
    }

    if (this.tooltipEl) {
      this.tooltipEl.remove();
      this.tooltipEl = null;
    }

    if (this.escHandler) {
      document.removeEventListener('keydown', this.escHandler);
      this.escHandler = null;
    }

    // CDP not used in MAIN world - removed

    // Send collected elements data
    if (this.selectedElements.length > 0) {
      this.sendMessage('INSPECTION_COMPLETE', {
        elements: this.selectedElements,
        timestamp: Date.now()
      });
    }

    console.log('[Native Inspector] Inspection stopped');
  }

  /**
   * Send message back to DevTools panel
   */
  sendMessage(type, data) {
    window.postMessage({
      source: 'mosqit-native-inspector',
      type: type,
      data: data
    }, '*');
  }

  /**
   * Clean up
   */
  destroy() {
    this.stopInspection();
    if (this.messageListener) {
      window.removeEventListener('message', this.messageListener);
    }
  }
}

// Initialize when loaded
if (typeof window !== 'undefined') {
  window.mosqitNativeInspector = new NativeInspector();
  window.mosqitNativeInspector.init();
  console.log('[Native Inspector] Ready');
}