/**
 * Utility classes for Visual Bug Reporter
 * Provides accessibility analysis, performance metrics, and more
 */

/**
 * Contrast Analyzer for WCAG compliance
 */
class ContrastAnalyzer {
  /**
   * Calculate contrast ratio between two colors
   */
  calculate(fgColor, bgColor) {
    const fg = this.parseColor(fgColor);
    const bg = this.parseColor(bgColor);

    if (!fg || !bg) {
      return {
        ratio: 0,
        passes: { AA: false, AAA: false },
        required: { AA: 4.5, AAA: 7 },
        largeText: false
      };
    }

    const l1 = this.relativeLuminance(fg);
    const l2 = this.relativeLuminance(bg);
    const ratio = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);

    // Check text size
    const largeText = this.isLargeText(fgColor);

    // WCAG requirements
    const requirements = {
      AA: largeText ? 3 : 4.5,
      AAA: largeText ? 4.5 : 7
    };

    return {
      ratio: parseFloat(ratio.toFixed(2)),
      passes: {
        AA: ratio >= requirements.AA,
        AAA: ratio >= requirements.AAA
      },
      required: requirements,
      largeText
    };
  }

  parseColor(color) {
    if (!color) return null;

    // Handle rgb/rgba
    const rgbMatch = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
    if (rgbMatch) {
      return {
        r: parseInt(rgbMatch[1]) / 255,
        g: parseInt(rgbMatch[2]) / 255,
        b: parseInt(rgbMatch[3]) / 255
      };
    }

    // Handle hex colors
    const hexMatch = color.match(/^#([0-9a-f]{6})$/i);
    if (hexMatch) {
      const hex = hexMatch[1];
      return {
        r: parseInt(hex.substr(0, 2), 16) / 255,
        g: parseInt(hex.substr(2, 2), 16) / 255,
        b: parseInt(hex.substr(4, 2), 16) / 255
      };
    }

    return null;
  }

  relativeLuminance(color) {
    const { r, g, b } = color;
    const [rs, gs, bs] = [r, g, b].map(c =>
      c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
    );
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  }

  isLargeText(element) {
    const styles = window.getComputedStyle(element);
    const fontSize = parseFloat(styles.fontSize);
    const fontWeight = styles.fontWeight;

    // Large text: 18pt+ or 14pt+ bold
    return fontSize >= 24 || (fontSize >= 18.66 && fontWeight >= 700);
  }
}

/**
 * ARIA Inspector for accessibility properties
 */
class AriaInspector {
  inspect(element) {
    const ariaProps = {
      role: element.getAttribute('role') || this.getImplicitRole(element),
      label: this.getAccessibleName(element),
      description: element.getAttribute('aria-describedby'),
      state: this.getAriaState(element),
      properties: this.getAriaProperties(element),
      landmarks: this.getLandmarkInfo(element),
      live: element.getAttribute('aria-live'),
      hidden: element.getAttribute('aria-hidden') === 'true',
      focusable: this.isFocusable(element),
      tabIndex: element.tabIndex,
      keyboardShortcuts: element.getAttribute('accesskey')
    };

    return {
      ...ariaProps,
      issues: this.detectAccessibilityIssues(element, ariaProps)
    };
  }

  getImplicitRole(element) {
    const tag = element.tagName.toLowerCase();
    const type = element.type?.toLowerCase();

    const roles = {
      'a': element.href ? 'link' : null,
      'article': 'article',
      'aside': 'complementary',
      'button': 'button',
      'footer': 'contentinfo',
      'form': 'form',
      'h1': 'heading',
      'h2': 'heading',
      'h3': 'heading',
      'h4': 'heading',
      'h5': 'heading',
      'h6': 'heading',
      'header': 'banner',
      'img': element.alt !== '' ? 'img' : 'presentation',
      'input': {
        'checkbox': 'checkbox',
        'radio': 'radio',
        'range': 'slider',
        'search': 'searchbox',
        'email': 'textbox',
        'tel': 'textbox',
        'text': 'textbox',
        'url': 'textbox'
      }[type] || 'textbox',
      'main': 'main',
      'nav': 'navigation',
      'ol': 'list',
      'option': 'option',
      'output': 'status',
      'progress': 'progressbar',
      'section': 'region',
      'select': 'combobox',
      'table': 'table',
      'tbody': 'rowgroup',
      'td': 'cell',
      'textarea': 'textbox',
      'th': element.scope === 'col' ? 'columnheader' : 'rowheader',
      'thead': 'rowgroup',
      'tr': 'row',
      'ul': 'list'
    };

    return roles[tag] || null;
  }

  getAccessibleName(element) {
    // Priority order for accessible name
    // 1. aria-labelledby
    const labelledBy = element.getAttribute('aria-labelledby');
    if (labelledBy) {
      const labels = labelledBy.split(' ')
        .map(id => document.getElementById(id)?.textContent)
        .filter(Boolean)
        .join(' ');
      if (labels) return labels;
    }

    // 2. aria-label
    const ariaLabel = element.getAttribute('aria-label');
    if (ariaLabel) return ariaLabel;

    // 3. <label> element
    if (element.id) {
      const label = document.querySelector(`label[for="${element.id}"]`);
      if (label) return label.textContent;
    }

    // 4. title attribute
    const title = element.getAttribute('title');
    if (title) return title;

    // 5. Text content for certain elements
    const textElements = ['button', 'a', 'label', 'th', 'td'];
    if (textElements.includes(element.tagName.toLowerCase())) {
      return element.textContent?.trim();
    }

    // 6. Alt text for images
    if (element.tagName.toLowerCase() === 'img') {
      return element.alt;
    }

    // 7. Placeholder for inputs
    if (element.tagName.toLowerCase() === 'input') {
      return element.placeholder;
    }

    return null;
  }

  getAriaState(element) {
    return {
      checked: element.getAttribute('aria-checked'),
      selected: element.getAttribute('aria-selected'),
      expanded: element.getAttribute('aria-expanded'),
      pressed: element.getAttribute('aria-pressed'),
      disabled: element.getAttribute('aria-disabled') === 'true' || element.disabled,
      hidden: element.getAttribute('aria-hidden') === 'true',
      invalid: element.getAttribute('aria-invalid') === 'true',
      busy: element.getAttribute('aria-busy') === 'true',
      current: element.getAttribute('aria-current')
    };
  }

  getAriaProperties(element) {
    return {
      autocomplete: element.getAttribute('aria-autocomplete'),
      hasPopup: element.getAttribute('aria-haspopup'),
      level: element.getAttribute('aria-level'),
      multiLine: element.getAttribute('aria-multiline'),
      multiSelectable: element.getAttribute('aria-multiselectable'),
      orientation: element.getAttribute('aria-orientation'),
      readOnly: element.getAttribute('aria-readonly'),
      required: element.getAttribute('aria-required') === 'true' || element.required,
      sort: element.getAttribute('aria-sort'),
      valueMax: element.getAttribute('aria-valuemax'),
      valueMin: element.getAttribute('aria-valuemin'),
      valueNow: element.getAttribute('aria-valuenow'),
      valueText: element.getAttribute('aria-valuetext')
    };
  }

  getLandmarkInfo(element) {
    const landmarks = ['banner', 'complementary', 'contentinfo', 'form', 'main', 'navigation', 'region', 'search'];
    const role = element.getAttribute('role') || this.getImplicitRole(element);

    if (landmarks.includes(role)) {
      return {
        type: role,
        label: this.getAccessibleName(element)
      };
    }

    return null;
  }

  isFocusable(element) {
    const focusableElements = ['a', 'button', 'input', 'select', 'textarea', 'iframe', 'object', 'embed'];
    const tag = element.tagName.toLowerCase();

    // Check if naturally focusable
    if (focusableElements.includes(tag)) {
      return !element.disabled && element.getAttribute('aria-hidden') !== 'true';
    }

    // Check for tabindex
    const tabIndex = element.getAttribute('tabindex');
    if (tabIndex !== null && tabIndex !== '-1') {
      return true;
    }

    // Check for contenteditable
    if (element.contentEditable === 'true') {
      return true;
    }

    return false;
  }

  detectAccessibilityIssues(element, ariaProps) {
    const issues = [];

    // Check for missing alt text on images
    if (element.tagName.toLowerCase() === 'img' && !element.alt && ariaProps.role !== 'presentation') {
      issues.push({
        level: 'error',
        message: 'Image missing alt text',
        wcag: '1.1.1'
      });
    }

    // Check for empty links
    if (element.tagName.toLowerCase() === 'a' && !ariaProps.label) {
      issues.push({
        level: 'error',
        message: 'Link has no accessible name',
        wcag: '2.4.4'
      });
    }

    // Check for form inputs without labels
    const inputTypes = ['input', 'select', 'textarea'];
    if (inputTypes.includes(element.tagName.toLowerCase()) && !ariaProps.label) {
      issues.push({
        level: 'error',
        message: 'Form control missing label',
        wcag: '3.3.2'
      });
    }

    // Check for buttons without accessible name
    if (element.tagName.toLowerCase() === 'button' && !ariaProps.label) {
      issues.push({
        level: 'error',
        message: 'Button has no accessible name',
        wcag: '4.1.2'
      });
    }

    // Check for heading hierarchy issues
    if (element.tagName.match(/^h[1-6]$/i)) {
      const level = parseInt(element.tagName[1]);
      const prevHeading = this.findPreviousHeading(element);
      if (prevHeading) {
        const prevLevel = parseInt(prevHeading.tagName[1]);
        if (level - prevLevel > 1) {
          issues.push({
            level: 'warning',
            message: `Heading level skipped (h${prevLevel} to h${level})`,
            wcag: '1.3.1'
          });
        }
      }
    }

    // Check for color contrast (will be done separately)

    // Check for keyboard accessibility
    if (element.onclick && !ariaProps.focusable) {
      issues.push({
        level: 'error',
        message: 'Interactive element not keyboard accessible',
        wcag: '2.1.1'
      });
    }

    return issues;
  }

  findPreviousHeading(element) {
    let current = element.previousElementSibling;
    while (current) {
      if (current.tagName.match(/^h[1-6]$/i)) {
        return current;
      }
      current = current.previousElementSibling;
    }

    // Check parent's previous siblings
    if (element.parentElement) {
      return this.findPreviousHeading(element.parentElement);
    }

    return null;
  }
}

/**
 * Performance Monitor for element metrics
 */
class PerformanceMonitor {
  constructor() {
    this.observer = null;
    this.metrics = new Map();
  }

  startMonitoring(element) {
    // Use Performance Observer API if available
    if (typeof PerformanceObserver !== 'undefined') {
      try {
        this.observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            this.processEntry(entry, element);
          }
        });

        this.observer.observe({
          entryTypes: ['paint', 'layout-shift', 'largest-contentful-paint', 'element']
        });
      } catch {
        console.debug('[Mosqit] Performance Observer not fully supported');
      }
    }

    // Collect initial metrics
    return this.collectMetrics(element);
  }

  collectMetrics(element) {
    const rect = element.getBoundingClientRect();
    const styles = window.getComputedStyle(element);

    const metrics = {
      // Layout metrics
      reflows: this.detectReflows(element),
      layoutShifts: this.getLayoutShifts(element),

      // Paint metrics
      paintTime: performance.now(),
      isInViewport: this.isInViewport(rect),

      // CSS complexity
      cssComplexity: this.calculateCSSComplexity(element),
      specificity: this.calculateSpecificity(element),

      // Animation/Transition detection
      hasAnimations: this.hasAnimations(styles),
      hasTransitions: this.hasTransitions(styles),

      // Memory estimation (rough)
      domDepth: this.getDOMDepth(element),
      childrenCount: element.children.length,

      // Event listeners
      eventListeners: this.getEventListeners(element),

      // Network activity
      hasImages: element.querySelectorAll('img').length,
      hasIframes: element.querySelectorAll('iframe').length,

      // Render blocking
      isRenderBlocking: this.isRenderBlocking(element)
    };

    this.metrics.set(element, metrics);
    return metrics;
  }

  detectReflows(element) {
    // Check if element triggers reflows
    const reflowTriggers = [
      'offsetTop', 'offsetLeft', 'offsetWidth', 'offsetHeight',
      'scrollTop', 'scrollLeft', 'scrollWidth', 'scrollHeight',
      'clientTop', 'clientLeft', 'clientWidth', 'clientHeight'
    ];

    let reflows = 0;
    reflowTriggers.forEach(prop => {
      if (element[prop] !== undefined) reflows++;
    });

    return reflows;
  }

  getLayoutShifts(element) {
    // Check for potential layout shifts
    const styles = window.getComputedStyle(element);
    const shifts = [];

    if (styles.position === 'absolute' || styles.position === 'fixed') {
      shifts.push('positioned');
    }

    if (styles.transform !== 'none') {
      shifts.push('transformed');
    }

    if (styles.marginTop === 'auto' || styles.marginLeft === 'auto') {
      shifts.push('auto-margin');
    }

    return shifts;
  }

  isInViewport(rect) {
    return rect.top >= 0 &&
           rect.left >= 0 &&
           rect.bottom <= window.innerHeight &&
           rect.right <= window.innerWidth;
  }

  calculateCSSComplexity(element) {
    const styles = window.getComputedStyle(element);
    let complexity = 0;

    // Count non-default properties
    for (let i = 0; i < styles.length; i++) {
      const prop = styles[i];
      const value = styles.getPropertyValue(prop);
      if (value && value !== 'initial' && value !== 'inherit' && value !== 'unset') {
        complexity++;
      }
    }

    return complexity;
  }

  calculateSpecificity(element) {
    // Rough specificity calculation
    let specificity = { inline: 0, id: 0, class: 0, element: 0 };

    if (element.style.cssText) specificity.inline = 1;
    if (element.id) specificity.id = 1;
    if (element.className) specificity.class = element.classList.length;
    specificity.element = 1;

    return `${specificity.inline}${specificity.id}${specificity.class}${specificity.element}`;
  }

  hasAnimations(styles) {
    return styles.animation !== 'none' && styles.animation !== '';
  }

  hasTransitions(styles) {
    return styles.transition !== 'none' && styles.transition !== '';
  }

  getDOMDepth(element) {
    let depth = 0;
    let current = element;

    while (current.parentElement) {
      depth++;
      current = current.parentElement;
    }

    return depth;
  }

  getEventListeners(element) {
    const listeners = [];
    const eventTypes = [
      'click', 'dblclick', 'mousedown', 'mouseup', 'mousemove', 'mouseenter', 'mouseleave',
      'keydown', 'keyup', 'keypress', 'focus', 'blur', 'change', 'input', 'submit',
      'touchstart', 'touchend', 'touchmove', 'scroll', 'resize'
    ];

    eventTypes.forEach(type => {
      if (element[`on${type}`] !== null) {
        listeners.push(type);
      }
    });

    // Try to get listeners using Chrome DevTools protocol if available
    if (typeof chrome !== 'undefined' && chrome.devtools) {
      // This would require DevTools protocol access
    }

    return listeners;
  }

  isRenderBlocking(element) {
    const tag = element.tagName.toLowerCase();

    // Scripts in head are render-blocking
    if (tag === 'script' && !element.async && !element.defer && element.parentElement?.tagName.toLowerCase() === 'head') {
      return true;
    }

    // Stylesheets are render-blocking
    if (tag === 'link' && element.rel === 'stylesheet') {
      return true;
    }

    return false;
  }

  stopMonitoring() {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
  }

  processEntry(entry, element) {
    // Process performance entries
    if (entry.name === element.id || entry.name === element.className) {
      const metrics = this.metrics.get(element) || {};

      if (entry.entryType === 'paint') {
        metrics.paintTime = entry.startTime;
      } else if (entry.entryType === 'layout-shift') {
        metrics.layoutShiftScore = entry.value;
      }

      this.metrics.set(element, metrics);
    }
  }
}

/**
 * CSS Editor for real-time style changes
 */
class CSSEditor {
  constructor(element) {
    this.element = element;
    this.originalStyles = new Map();
    this.changes = new Map();
  }

  saveOriginalStyles() {
    const styles = window.getComputedStyle(this.element);
    const important = ['color', 'backgroundColor', 'fontSize', 'padding', 'margin', 'border', 'width', 'height', 'display', 'position'];

    important.forEach(prop => {
      this.originalStyles.set(prop, styles[prop]);
    });
  }

  applyStyle(property, value) {
    if (!this.originalStyles.has(property)) {
      this.originalStyles.set(property, this.element.style[property]);
    }

    this.element.style[property] = value;
    this.changes.set(property, value);

    return {
      property,
      original: this.originalStyles.get(property),
      new: value
    };
  }

  resetStyles() {
    this.changes.forEach((value, property) => {
      const original = this.originalStyles.get(property);
      if (original) {
        this.element.style[property] = original;
      } else {
        this.element.style[property] = '';
      }
    });

    this.changes.clear();
  }

  getChanges() {
    return Array.from(this.changes.entries()).map(([property, value]) => ({
      property,
      original: this.originalStyles.get(property),
      new: value
    }));
  }
}

/**
 * Smart Context Detector
 */
class SmartContextDetector {
  detect(element) {
    return {
      formErrors: this.detectFormErrors(element),
      brokenImages: this.detectBrokenImages(element),
      consoleErrors: this.getRelatedConsoleErrors(element),
      networkRequests: this.getRelatedNetworkRequests(element),
      validationState: this.getValidationState(element),
      dataAttributes: this.getDataAttributes(element),
      customElements: this.detectCustomElements(element)
    };
  }

  detectFormErrors(element) {
    const errors = [];

    // Check HTML5 validation
    if (element.validity && !element.validity.valid) {
      errors.push({
        type: 'validation',
        message: element.validationMessage,
        validity: element.validity
      });
    }

    // Check for error classes
    const errorClasses = ['error', 'invalid', 'has-error', 'is-invalid'];
    errorClasses.forEach(cls => {
      if (element.classList.contains(cls)) {
        errors.push({
          type: 'class',
          class: cls
        });
      }
    });

    // Check for aria-invalid
    if (element.getAttribute('aria-invalid') === 'true') {
      errors.push({
        type: 'aria',
        message: 'Element marked as invalid via ARIA'
      });
    }

    return errors;
  }

  detectBrokenImages(element) {
    const images = element.tagName.toLowerCase() === 'img'
      ? [element]
      : element.querySelectorAll('img');

    const broken = [];

    images.forEach(img => {
      if (!img.complete || img.naturalWidth === 0) {
        broken.push({
          src: img.src,
          alt: img.alt,
          element: img
        });
      }
    });

    return broken;
  }

  getRelatedConsoleErrors() {
    // This would need integration with console API
    // For now, return placeholder
    return [];
  }

  getRelatedNetworkRequests(element) {
    const requests = [];

    // Check for images
    if (element.tagName.toLowerCase() === 'img') {
      requests.push({
        type: 'image',
        url: element.src,
        status: element.complete ? 'loaded' : 'loading'
      });
    }

    // Check for scripts
    const scripts = element.querySelectorAll('script[src]');
    scripts.forEach(script => {
      requests.push({
        type: 'script',
        url: script.src,
        async: script.async,
        defer: script.defer
      });
    });

    // Check for stylesheets
    const links = element.querySelectorAll('link[rel="stylesheet"]');
    links.forEach(link => {
      requests.push({
        type: 'stylesheet',
        url: link.href
      });
    });

    return requests;
  }

  getValidationState(element) {
    if (!element.validity) return null;

    return {
      valid: element.validity.valid,
      badInput: element.validity.badInput,
      customError: element.validity.customError,
      patternMismatch: element.validity.patternMismatch,
      rangeOverflow: element.validity.rangeOverflow,
      rangeUnderflow: element.validity.rangeUnderflow,
      stepMismatch: element.validity.stepMismatch,
      tooLong: element.validity.tooLong,
      tooShort: element.validity.tooShort,
      typeMismatch: element.validity.typeMismatch,
      valueMissing: element.validity.valueMissing,
      message: element.validationMessage
    };
  }

  getDataAttributes(element) {
    const dataAttrs = {};

    for (const key in element.dataset) {
      dataAttrs[key] = element.dataset[key];
    }

    return dataAttrs;
  }

  detectCustomElements(element) {
    const customElements = [];

    // Check if element itself is custom
    if (element.tagName.includes('-')) {
      customElements.push({
        tag: element.tagName.toLowerCase(),
        defined: customElements.get(element.tagName.toLowerCase()) !== undefined
      });
    }

    // Check children
    const customs = element.querySelectorAll('*');
    customs.forEach(el => {
      if (el.tagName.includes('-')) {
        customElements.push({
          tag: el.tagName.toLowerCase(),
          defined: customElements.get(el.tagName.toLowerCase()) !== undefined
        });
      }
    });

    return customElements;
  }
}

// Export utilities
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    ContrastAnalyzer,
    AriaInspector,
    PerformanceMonitor,
    CSSEditor,
    SmartContextDetector
  };
}