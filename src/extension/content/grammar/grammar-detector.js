/**
 * Grammar Detector
 * Detects text input fields and determines if grammar checking should be enabled
 * Runs in MAIN world (has access to page DOM)
 */

class GrammarDetector {
  constructor() {
    this.monitoredElements = new WeakMap();
    this.observer = null;
    this.debounceTimers = new WeakMap();
    this.enabled = false;
  }

  /**
   * Initialize the detector
   */
  init() {
    console.log('[Grammar Detector] Initializing...');
    this.detectPlatform();
    this.observeDOM();
    this.scanExistingInputs();
  }

  /**
   * Detect what platform/website we're on
   */
  detectPlatform() {
    const hostname = window.location.hostname;
    const platforms = {
      gmail: /mail\.google\.com/,
      github: /github\.com/,
      slack: /slack\.com/,
      twitter: /twitter\.com|x\.com/,
      linkedin: /linkedin\.com/,
      notion: /notion\.so/
    };

    this.currentPlatform = 'unknown';

    for (const [platform, pattern] of Object.entries(platforms)) {
      if (pattern.test(hostname)) {
        this.currentPlatform = platform;
        console.log(`[Grammar Detector] Detected platform: ${platform}`);
        break;
      }
    }

    return this.currentPlatform;
  }

  /**
   * Observe DOM for dynamically added text inputs
   */
  observeDOM() {
    this.observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        // Check added nodes
        mutation.addedNodes.forEach(node => {
          if (node.nodeType === 1) { // Element node
            this.checkElement(node);

            // Check descendants
            if (node.querySelectorAll) {
              const inputs = node.querySelectorAll(this.getInputSelector());
              inputs.forEach(input => this.attachToInput(input));
            }
          }
        });
      }
    });

    this.observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    console.log('[Grammar Detector] DOM observer started');
  }

  /**
   * Scan existing inputs on page
   */
  scanExistingInputs() {
    const selector = this.getInputSelector();
    const inputs = document.querySelectorAll(selector);

    console.log(`[Grammar Detector] Found ${inputs.length} existing inputs`);

    inputs.forEach(input => this.attachToInput(input));
  }

  /**
   * Get CSS selector for text inputs based on platform
   */
  getInputSelector() {
    const baseSelectors = [
      'textarea',
      'input[type="text"]',
      'input[type="email"]',
      '[contenteditable="true"]',
      '[role="textbox"]'
    ];

    // Platform-specific selectors
    const platformSelectors = {
      gmail: [
        'div[aria-label*="Message Body"]',
        'div[role="textbox"]',
        'div[contenteditable="true"][aria-label]'
      ],
      github: [
        'textarea[name="commit_message"]',
        'textarea[name="pull_request[body]"]',
        'textarea[name="issue[body]"]',
        'textarea.comment-form-textarea',
        '#new_comment_field'
      ],
      slack: [
        'div[role="textbox"][contenteditable="true"]',
        'div.ql-editor'
      ],
      twitter: [
        'div[role="textbox"][contenteditable="true"]',
        'div[data-testid="tweetTextarea_0"]'
      ],
      linkedin: [
        'div[role="textbox"][contenteditable="true"]'
      ]
    };

    const selectors = [...baseSelectors];

    if (this.currentPlatform && platformSelectors[this.currentPlatform]) {
      selectors.push(...platformSelectors[this.currentPlatform]);
    }

    return selectors.join(', ');
  }

  /**
   * Check if an element should have grammar checking
   */
  checkElement(element) {
    const selector = this.getInputSelector();
    if (element.matches && element.matches(selector)) {
      this.attachToInput(element);
    }
  }

  /**
   * Attach grammar checking to an input element
   */
  attachToInput(element) {
    // Skip if already monitoring
    if (this.monitoredElements.has(element)) {
      return;
    }

    // Skip if input is too small (e.g., search boxes)
    const rect = element.getBoundingClientRect();
    if (rect.width < 200 || rect.height < 40) {
      return;
    }

    // Detect context for this input
    const context = this.detectInputContext(element);

    console.log('[Grammar Detector] Attaching to:', {
      tagName: element.tagName,
      context: context.type,
      platform: this.currentPlatform
    });

    // Store monitoring info
    this.monitoredElements.set(element, {
      context,
      lastCheck: 0,
      lastText: ''
    });

    // Attach event listeners
    this.attachEventListeners(element);

    // Initial check
    this.checkText(element);
  }

  /**
   * Detect what type of writing context this input represents
   */
  detectInputContext(element) {
    const context = {
      type: 'generic',
      platform: this.currentPlatform,
      tone: 'casual',
      lengthExpectation: 'medium'
    };

    // Check element attributes and context
    const ariaLabel = element.getAttribute('aria-label') || '';
    const placeholder = element.getAttribute('placeholder') || '';
    const name = element.getAttribute('name') || '';
    const className = element.className || '';

    // Gmail contexts
    if (this.currentPlatform === 'gmail') {
      if (ariaLabel.includes('Subject')) {
        context.type = 'email_subject';
        context.tone = 'professional';
        context.lengthExpectation = 'short';
      } else {
        context.type = 'email_body';
        context.tone = 'professional';
        context.lengthExpectation = 'long';
      }
    }

    // GitHub contexts
    if (this.currentPlatform === 'github') {
      if (name.includes('commit_message') || ariaLabel.includes('commit')) {
        context.type = 'commit_message';
        context.tone = 'technical';
        context.lengthExpectation = 'short';
      } else if (name.includes('pull_request') || ariaLabel.includes('pull request')) {
        context.type = 'pr_description';
        context.tone = 'technical';
        context.lengthExpectation = 'long';
      } else if (name.includes('issue') || ariaLabel.includes('issue')) {
        context.type = 'issue_description';
        context.tone = 'technical';
        context.lengthExpectation = 'long';
      } else if (className.includes('comment')) {
        context.type = 'code_review';
        context.tone = 'professional';
        context.lengthExpectation = 'medium';
      }
    }

    // Slack contexts
    if (this.currentPlatform === 'slack') {
      context.type = 'chat_message';
      context.tone = 'casual';
      context.lengthExpectation = 'short';
    }

    // Twitter contexts
    if (this.currentPlatform === 'twitter') {
      context.type = 'tweet';
      context.tone = 'casual';
      context.lengthExpectation = 'short';
    }

    return context;
  }

  /**
   * Attach event listeners to input
   */
  attachEventListeners(element) {
    // Debounced input handler
    const handleInput = () => {
      this.debounceCheckText(element);
    };

    // Focus handler
    const handleFocus = () => {
      console.log('[Grammar Detector] Input focused:', element);
      this.onInputFocus(element);
    };

    // Blur handler
    const handleBlur = () => {
      console.log('[Grammar Detector] Input blurred');
      this.onInputBlur(element);
    };

    element.addEventListener('input', handleInput);
    element.addEventListener('focus', handleFocus);
    element.addEventListener('blur', handleBlur);

    // Store listeners for cleanup
    const info = this.monitoredElements.get(element);
    if (info) {
      info.listeners = { handleInput, handleFocus, handleBlur };
    }
  }

  /**
   * Debounce text checking to avoid excessive API calls
   */
  debounceCheckText(element, delay = 300) {
    // Clear existing timer
    const existingTimer = this.debounceTimers.get(element);
    if (existingTimer) {
      clearTimeout(existingTimer);
    }

    // Set new timer
    const timer = setTimeout(() => {
      this.checkText(element);
    }, delay);

    this.debounceTimers.set(element, timer);
  }

  /**
   * Check text in an input element
   */
  checkText(element) {
    const info = this.monitoredElements.get(element);
    if (!info) return;

    const text = this.getElementText(element);

    // Skip if text hasn't changed
    if (text === info.lastText) return;

    // Skip if text is too short
    if (text.length < 10) return;

    info.lastText = text;
    info.lastCheck = Date.now();

    console.log('[Grammar Detector] Checking text:', {
      length: text.length,
      context: info.context.type
    });

    // Send to grammar engine
    this.sendToGrammarEngine(element, text, info.context);
  }

  /**
   * Get text content from element (handle contenteditable and textareas)
   */
  getElementText(element) {
    if (element.tagName === 'TEXTAREA' || element.tagName === 'INPUT') {
      return element.value;
    } else if (element.isContentEditable) {
      return element.innerText || element.textContent;
    }
    return '';
  }

  /**
   * Send text to grammar engine for analysis
   */
  sendToGrammarEngine(element, text, context) {
    // Send message to grammar engine (via content bridge)
    window.postMessage({
      type: 'GRAMMAR_CHECK_REQUEST',
      source: 'grammar-detector',
      data: {
        text,
        context,
        elementId: this.getElementId(element),
        timestamp: Date.now()
      }
    }, window.location.origin);
  }

  /**
   * Generate unique ID for element
   */
  getElementId(element) {
    // Try to use existing ID
    if (element.id) return element.id;

    // Generate based on position and attributes
    const tagName = element.tagName;
    const className = element.className;
    const name = element.getAttribute('name');

    return `${tagName}-${className}-${name}-${Date.now()}`.replace(/\s+/g, '-');
  }

  /**
   * Handle input focus
   */
  onInputFocus(element) {
    const info = this.monitoredElements.get(element);
    if (!info) return;

    // Send focus event
    window.postMessage({
      type: 'GRAMMAR_INPUT_FOCUSED',
      source: 'grammar-detector',
      data: {
        elementId: this.getElementId(element),
        context: info.context
      }
    }, window.location.origin);
  }

  /**
   * Handle input blur
   */
  onInputBlur(element) {
    // Send blur event
    window.postMessage({
      type: 'GRAMMAR_INPUT_BLURRED',
      source: 'grammar-detector'
    }, window.location.origin);
  }

  /**
   * Enable grammar detection
   */
  enable() {
    this.enabled = true;
    this.scanExistingInputs();
  }

  /**
   * Disable grammar detection
   */
  disable() {
    this.enabled = false;
    this.cleanup();
  }

  /**
   * Cleanup and remove all listeners
   */
  cleanup() {
    // Stop observer
    if (this.observer) {
      this.observer.disconnect();
    }

    // Clear all timers
    this.debounceTimers = new WeakMap();

    // Remove all event listeners
    // (WeakMap cleanup happens automatically)

    this.monitoredElements = new WeakMap();
  }
}

// Create instance
const grammarDetector = new GrammarDetector();

// Export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = grammarDetector;
}
