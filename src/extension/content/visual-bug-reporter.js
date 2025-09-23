/**
 * Mosqit Visual Bug Reporter
 * Intuitive visual bug reporting for PMs, QA, and non-technical users
 */

class VisualBugReporter {
  constructor() {
    this.isActive = false;
    this.selectedElement = null;
    this.overlay = null;
    this.toolbar = null;
    this.sidePanel = null;
    this.annotations = [];
    this.screenshot = null;
    this.mode = 'select'; // select, annotate, review

    // Bind methods
    this.handleMouseMove = this.handleMouseMove.bind(this);
    this.handleClick = this.handleClick.bind(this);
    this.handleKeyPress = this.handleKeyPress.bind(this);
  }

  /**
   * Initialize the Visual Bug Reporter
   */
  async init() {
    // Visual Bug Reporter initialized

    // Listen for activation from extension
    this.messageListener = (message, sender, sendResponse) => {
      if (message.type === 'START_VISUAL_BUG_REPORT') {
        this.start();
        sendResponse({ success: true });
        return true; // Keep message channel open
      } else if (message.type === 'STOP_VISUAL_BUG_REPORT') {
        this.stop();
        sendResponse({ success: true });
        return true; // Keep message channel open
      }
    };
    chrome.runtime.onMessage.addListener(this.messageListener);
  }

  /**
   * Start visual bug reporting mode
   */
  start() {
    if (this.isActive) return;

    this.isActive = true;
    this.mode = 'select';

    // Create UI elements
    this.createOverlay();
    this.createToolbar();
    this.createInfoPanel();

    // Add event listeners
    document.addEventListener('mousemove', this.handleMouseMove);
    document.addEventListener('click', this.handleClick);
    document.addEventListener('keydown', this.handleKeyPress);

    // Change cursor
    document.body.style.cursor = 'crosshair';

    // Show instructions
    this.showToast('👆 Click on any element to report a visual bug', 'info');
  }

  /**
   * Stop visual bug reporting mode
   */
  stop() {
    if (!this.isActive) return;

    this.isActive = false;

    // Remove UI elements
    this.overlay?.remove();
    this.paddingOverlay?.remove();
    this.marginOverlay?.remove();
    this.toolbar?.remove();
    this.infoPanel?.remove();

    // Remove event listeners
    document.removeEventListener('mousemove', this.handleMouseMove);
    document.removeEventListener('click', this.handleClick);
    document.removeEventListener('keydown', this.handleKeyPress);

    // Reset cursor
    document.body.style.cursor = '';

    // Clear selection
    this.clearHighlight();
  }

  /**
   * Create overlay for element highlighting
   */
  createOverlay() {
    this.overlay = document.createElement('div');
    this.overlay.id = 'mosqit-overlay';
    this.overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 0;
      height: 0;
      border: 2px solid #FF6B6B;
      background: rgba(255, 107, 107, 0.1);
      pointer-events: none;
      z-index: 999998;
      transition: all 0.05s ease-out;
      box-shadow: 0 0 0 1px rgba(255, 107, 107, 0.5), inset 0 0 0 1px rgba(255, 107, 107, 0.3);
      display: none;
      will-change: transform;
    `;
    document.body.appendChild(this.overlay);

    // Create additional overlays for box model visualization
    this.createBoxModelOverlays();
  }

  /**
   * Create overlays for box model visualization (like DevTools)
   */
  createBoxModelOverlays() {
    // Padding overlay
    this.paddingOverlay = document.createElement('div');
    this.paddingOverlay.id = 'mosqit-padding-overlay';
    this.paddingOverlay.style.cssText = `
      position: fixed;
      background: rgba(147, 196, 125, 0.3);
      pointer-events: none;
      z-index: 999997;
      display: none;
    `;
    document.body.appendChild(this.paddingOverlay);

    // Margin overlay
    this.marginOverlay = document.createElement('div');
    this.marginOverlay.id = 'mosqit-margin-overlay';
    this.marginOverlay.style.cssText = `
      position: fixed;
      background: rgba(252, 176, 126, 0.3);
      pointer-events: none;
      z-index: 999996;
      display: none;
    `;
    document.body.appendChild(this.marginOverlay);
  }

  /**
   * Create floating toolbar
   */
  createToolbar() {
    this.toolbar = document.createElement('div');
    this.toolbar.id = 'mosqit-toolbar';
    this.toolbar.innerHTML = `
      <div class="mosqit-toolbar-inner">
        <button class="mosqit-tool active" data-tool="select" title="Select Element">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M3 3l7.07 16.97 2.51-7.39 7.39-2.51L3 3z"/>
          </svg>
        </button>
        <button class="mosqit-tool" data-tool="screenshot" title="Capture Screenshot">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <rect x="3" y="3" width="18" height="18" rx="2"/>
            <circle cx="12" cy="12" r="3"/>
          </svg>
        </button>
        <button class="mosqit-tool" data-tool="color" title="Color Picker">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M12 2a10 10 0 1 0 0 20 10 10 0 1 0 0-20z"/>
            <path d="M12 6a6 6 0 0 0 0 12"/>
          </svg>
        </button>
        <button class="mosqit-tool" data-tool="measure" title="Measure">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M5 12h14M5 12l-2-2m2 2l-2 2M19 12l2-2m-2 2l2 2"/>
          </svg>
        </button>
        <button class="mosqit-tool" data-tool="annotate" title="Annotate">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z"/>
            <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8"/>
          </svg>
        </button>
        <div class="mosqit-toolbar-separator"></div>
        <button class="mosqit-tool" data-tool="cancel" title="Cancel">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>
    `;

    this.toolbar.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      background: white;
      border-radius: 12px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
      padding: 8px;
      z-index: 999999;
      display: flex;
      gap: 4px;
      animation: slideUp 0.3s ease;
    `;

    // Add styles
    const style = document.createElement('style');
    style.textContent = `
      @keyframes slideUp {
        from { transform: translateY(100px); opacity: 0; }
        to { transform: translateY(0); opacity: 1; }
      }

      .mosqit-toolbar-inner {
        display: flex;
        gap: 4px;
        align-items: center;
      }

      .mosqit-tool {
        width: 40px;
        height: 40px;
        border: none;
        background: white;
        color: #666;
        border-radius: 8px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s;
      }

      .mosqit-tool:hover {
        background: #f5f5f5;
        color: #333;
      }

      .mosqit-tool.active {
        background: #FF6B6B;
        color: white;
      }

      .mosqit-toolbar-separator {
        width: 1px;
        height: 30px;
        background: #e0e0e0;
        margin: 0 4px;
      }

      .mosqit-info-panel {
        position: fixed;
        top: 20px;
        right: 20px;
        background: white;
        border-radius: 12px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
        padding: 16px;
        z-index: 999999;
        min-width: 300px;
        max-width: 400px;
        animation: slideDown 0.3s ease;
      }

      @keyframes slideDown {
        from { transform: translateY(-20px); opacity: 0; }
        to { transform: translateY(0); opacity: 1; }
      }

      .mosqit-info-title {
        font-size: 14px;
        font-weight: 600;
        color: #333;
        margin-bottom: 12px;
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .mosqit-info-item {
        display: flex;
        justify-content: space-between;
        padding: 6px 0;
        font-size: 13px;
        color: #666;
        border-bottom: 1px solid #f0f0f0;
      }

      .mosqit-info-item strong {
        color: #333;
      }

      .mosqit-color-preview {
        display: inline-block;
        width: 20px;
        height: 20px;
        border-radius: 4px;
        border: 1px solid #ddd;
        vertical-align: middle;
        margin-left: 8px;
      }

      .mosqit-toast {
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: rgba(0, 0, 0, 0.9);
        color: white;
        padding: 16px 24px;
        border-radius: 8px;
        font-size: 14px;
        z-index: 999999;
        animation: fadeIn 0.3s ease;
      }

      @keyframes fadeIn {
        from { opacity: 0; transform: translate(-50%, -40%); }
        to { opacity: 1; transform: translate(-50%, -50%); }
      }
    `;
    document.head.appendChild(style);

    // Add event listeners
    this.toolbar.querySelectorAll('.mosqit-tool').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.handleToolClick(btn.dataset.tool);
      });
    });

    document.body.appendChild(this.toolbar);
  }

  /**
   * Create info panel showing element details
   */
  createInfoPanel() {
    this.infoPanel = document.createElement('div');
    this.infoPanel.className = 'mosqit-info-panel';
    this.infoPanel.style.display = 'none';
    document.body.appendChild(this.infoPanel);
  }

  /**
   * Handle mouse movement for element highlighting
   */
  handleMouseMove(event) {
    if (!this.isActive || this.mode !== 'select') return;

    const element = this.getElementAtPoint(event.clientX, event.clientY);

    if (element !== this.hoveredElement) {
      // Clear previous highlight if hovering over nothing or a new element
      if (!element) {
        this.clearHighlight();
        if (this.infoPanel) {
          this.infoPanel.style.display = 'none';
        }
        this.hoveredElement = null;
      } else {
        // Highlight new element
        this.hoveredElement = element;
        this.highlightElement(element);
        this.showElementInfo(element);
      }
    }
  }

  /**
   * Handle element click for selection
   */
  async handleClick(event) {
    if (!this.isActive || this.mode !== 'select') return;

    event.preventDefault();
    event.stopPropagation();

    const element = this.getElementAtPoint(event.clientX, event.clientY);
    if (element) {
      this.selectedElement = element;
      await this.captureElement(element);
    }
  }

  /**
   * Handle keyboard shortcuts
   */
  handleKeyPress(event) {
    if (!this.isActive) return;

    if (event.key === 'Escape') {
      this.stop();
    }
  }

  /**
   * Get element at point with precise selection, excluding our UI
   */
  getElementAtPoint(x, y) {
    // Temporarily hide our UI elements to avoid interference
    const ourElements = document.querySelectorAll(
      '#mosqit-overlay, #mosqit-toolbar, .mosqit-info-panel, .mosqit-toast, #mosqit-padding-overlay, #mosqit-margin-overlay'
    );

    // Store original pointer-events values
    const originalPointerEvents = new Map();
    ourElements.forEach(el => {
      originalPointerEvents.set(el, el.style.pointerEvents);
      el.style.pointerEvents = 'none';
    });

    // Use elementsFromPoint for better precision with overlapping elements
    const elements = document.elementsFromPoint(x, y);

    // Restore pointer-events
    ourElements.forEach(el => {
      el.style.pointerEvents = originalPointerEvents.get(el) || '';
    });

    // Find the most appropriate element from the stack
    const selectedElement = this.selectBestElement(elements, x, y);

    return selectedElement;
  }

  /**
   * Select the best element from a stack of overlapping elements
   * Mimics Chrome DevTools' intelligent element selection
   */
  selectBestElement(elements, x, y) {
    if (!elements || elements.length === 0) return null;

    // Filter out unwanted elements
    const filteredElements = elements.filter(el => {
      // Skip our own UI elements
      if (el.id && el.id.startsWith('mosqit-')) return false;
      if (el.className && typeof el.className === 'string' &&
          el.className.includes('mosqit-')) return false;

      // Skip html and body unless they're the only options
      if (elements.length > 2) {
        if (el === document.documentElement || el === document.body) return false;
      }

      // Skip script and style elements
      const tagName = el.tagName.toLowerCase();
      if (['script', 'style', 'noscript'].includes(tagName)) return false;

      return true;
    });

    // Priority scoring system for element selection
    const scoredElements = filteredElements.map(element => {
      let score = 0;
      const rect = element.getBoundingClientRect();
      const styles = window.getComputedStyle(element);
      const tagName = element.tagName.toLowerCase();

      // Score based on how close the cursor is to the element's center
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const distance = Math.sqrt(Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2));
      const maxDistance = Math.sqrt(Math.pow(rect.width, 2) + Math.pow(rect.height, 2)) / 2;
      const proximityScore = maxDistance > 0 ? Math.max(0, 1 - (distance / maxDistance)) : 0;
      score += proximityScore * 10;

      // Prefer interactive elements
      const interactiveTags = ['button', 'a', 'input', 'textarea', 'select', 'label'];
      if (interactiveTags.includes(tagName)) {
        score += 15;
      }

      // Prefer elements with click handlers or role attributes
      if (element.onclick || element.getAttribute('role') ||
          element.hasAttribute('tabindex') || styles.cursor === 'pointer') {
        score += 10;
      }

      // Prefer visible text content
      const textContent = element.textContent || '';
      const hasText = textContent.trim().length > 0;
      if (hasText && element.children.length === 0) { // Leaf node with text
        score += 8;
      }

      // Prefer elements with semantic meaning
      const semanticTags = ['article', 'section', 'nav', 'header', 'footer', 'main', 'aside'];
      if (semanticTags.includes(tagName)) {
        score += 5;
      }

      // Prefer elements with IDs or specific classes
      if (element.id) score += 7;
      if (element.className && typeof element.className === 'string') {
        const hasComponentClass = ['card', 'btn', 'button', 'modal', 'dropdown',
                                  'menu', 'widget', 'component'].some(cls =>
          element.className.toLowerCase().includes(cls)
        );
        if (hasComponentClass) score += 6;
      }

      // Prefer elements with data attributes
      if (element.hasAttribute('data-testid') ||
          element.hasAttribute('data-component') ||
          Object.keys(element.dataset).length > 0) {
        score += 5;
      }

      // Consider element size (prefer smaller, more specific elements)
      const area = rect.width * rect.height;
      const viewportArea = window.innerWidth * window.innerHeight;
      const sizeRatio = area / viewportArea;
      if (sizeRatio < 0.5 && sizeRatio > 0) { // Not too large and not zero
        score += (1 - sizeRatio) * 5;
      }

      // Check if element has defined boundaries
      const hasBackground = styles.backgroundColor !== 'rgba(0, 0, 0, 0)' &&
                          styles.backgroundColor !== 'transparent';
      const hasBorder = styles.borderWidth !== '0px';
      const hasOutline = styles.outlineWidth !== '0px';
      if (hasBackground || hasBorder || hasOutline) {
        score += 3;
      }

      // Prefer elements that are not fully transparent
      const opacity = parseFloat(styles.opacity);
      if (opacity > 0.5) {
        score += opacity * 2;
      }

      // Check z-index
      const zIndex = parseInt(styles.zIndex, 10);
      if (!isNaN(zIndex) && zIndex > 0) {
        score += Math.min(zIndex / 100, 5);
      }

      return { element, score };
    });

    // Sort by score and select the best element
    scoredElements.sort((a, b) => b.score - a.score);

    const bestElement = scoredElements[0]?.element;
    if (bestElement) {
      return this.refineSemanticsSelection(bestElement);
    }

    return null;
  }

  /**
   * Refine element selection for better semantic meaning
   */
  refineSemanticsSelection(element) {
    if (!element) return null;

    const tagName = element.tagName.toLowerCase();

    // If we selected a text node container, try to get its meaningful parent
    const textContainers = ['span', 'em', 'strong', 'i', 'b', 'small', 'mark'];
    if (textContainers.includes(tagName)) {
      let parent = element.parentElement;
      let depth = 0;
      const maxDepth = 3;

      while (parent && depth < maxDepth) {
        const parentTag = parent.tagName.toLowerCase();

        // Found a more meaningful parent
        if (['a', 'button', 'li', 'td', 'th', 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
             'div', 'article', 'section'].includes(parentTag)) {
          // Check if parent has meaningful attributes
          if (parent.id || parent.className || parent.hasAttribute('role') ||
              parent.hasAttribute('data-testid')) {
            return parent;
          }
        }

        parent = parent.parentElement;
        depth++;
      }
    }

    // For images inside links, prefer the link
    if (tagName === 'img' && element.parentElement?.tagName.toLowerCase() === 'a') {
      return element.parentElement;
    }

    // For inputs inside labels, prefer the label
    if (tagName === 'input' && element.parentElement?.tagName.toLowerCase() === 'label') {
      return element.parentElement;
    }

    // For SVG elements, try to get the parent SVG or containing element
    if (element instanceof SVGElement && !(element instanceof SVGSVGElement)) {
      let parent = element.parentElement;
      while (parent && parent instanceof SVGElement && !(parent instanceof SVGSVGElement)) {
        parent = parent.parentElement;
      }
      if (parent) return parent;
    }

    return element;
  }


  /**
   * Highlight element with overlay (enhanced precision)
   */
  highlightElement(element) {
    const rect = element.getBoundingClientRect();
    const styles = window.getComputedStyle(element);

    // Show main overlay with sub-pixel precision
    this.overlay.style.display = 'block';
    this.overlay.style.left = `${rect.left}px`;
    this.overlay.style.top = `${rect.top}px`;
    this.overlay.style.width = `${rect.width}px`;
    this.overlay.style.height = `${rect.height}px`;

    // Match element's border radius for better visual accuracy
    this.overlay.style.borderRadius = styles.borderRadius;

    // Show padding overlay if element has padding
    const paddingTop = parseFloat(styles.paddingTop);
    const paddingRight = parseFloat(styles.paddingRight);
    const paddingBottom = parseFloat(styles.paddingBottom);
    const paddingLeft = parseFloat(styles.paddingLeft);

    if (paddingTop || paddingRight || paddingBottom || paddingLeft) {
      this.paddingOverlay.style.display = 'block';
      this.paddingOverlay.style.left = `${rect.left + paddingLeft}px`;
      this.paddingOverlay.style.top = `${rect.top + paddingTop}px`;
      this.paddingOverlay.style.width = `${rect.width - paddingLeft - paddingRight}px`;
      this.paddingOverlay.style.height = `${rect.height - paddingTop - paddingBottom}px`;
      this.paddingOverlay.style.borderRadius = styles.borderRadius;
    } else {
      this.paddingOverlay.style.display = 'none';
    }

    // Show margin overlay if element has margins
    const marginTop = parseFloat(styles.marginTop);
    const marginRight = parseFloat(styles.marginRight);
    const marginBottom = parseFloat(styles.marginBottom);
    const marginLeft = parseFloat(styles.marginLeft);

    if (marginTop || marginRight || marginBottom || marginLeft) {
      this.marginOverlay.style.display = 'block';
      this.marginOverlay.style.left = `${rect.left - marginLeft}px`;
      this.marginOverlay.style.top = `${rect.top - marginTop}px`;
      this.marginOverlay.style.width = `${rect.width + marginLeft + marginRight}px`;
      this.marginOverlay.style.height = `${rect.height + marginTop + marginBottom}px`;
    } else {
      this.marginOverlay.style.display = 'none';
    }
  }

  /**
   * Clear all highlights
   */
  clearHighlight() {
    if (this.overlay) {
      this.overlay.style.display = 'none';
      this.overlay.style.width = '0';
      this.overlay.style.height = '0';
    }
    if (this.paddingOverlay) {
      this.paddingOverlay.style.display = 'none';
    }
    if (this.marginOverlay) {
      this.marginOverlay.style.display = 'none';
    }
  }

  /**
   * Show element information
   */
  showElementInfo(element) {
    const rect = element.getBoundingClientRect();
    const styles = window.getComputedStyle(element);
    const selector = this.generateSelector(element);

    this.infoPanel.innerHTML = `
      <div class="mosqit-info-title">
        <span>🎯</span>
        <span>${element.tagName.toLowerCase()}${element.id ? '#' + element.id : ''}</span>
      </div>
      <div class="mosqit-info-item">
        <strong>Selector:</strong>
        <span>${selector}</span>
      </div>
      <div class="mosqit-info-item">
        <strong>Size:</strong>
        <span>${Math.round(rect.width)} × ${Math.round(rect.height)}px</span>
      </div>
      <div class="mosqit-info-item">
        <strong>Position:</strong>
        <span>${Math.round(rect.left)}, ${Math.round(rect.top)}</span>
      </div>
      <div class="mosqit-info-item">
        <strong>Background:</strong>
        <span>
          ${styles.backgroundColor}
          <span class="mosqit-color-preview" style="background: ${styles.backgroundColor}"></span>
        </span>
      </div>
      <div class="mosqit-info-item">
        <strong>Text Color:</strong>
        <span>
          ${styles.color}
          <span class="mosqit-color-preview" style="background: ${styles.color}"></span>
        </span>
      </div>
      <div class="mosqit-info-item">
        <strong>Font:</strong>
        <span>${styles.fontSize} ${styles.fontFamily.split(',')[0]}</span>
      </div>
    `;

    this.infoPanel.style.display = 'block';
  }

  /**
   * Generate CSS selector for element
   */
  generateSelector(element) {
    if (element.id) {
      return '#' + element.id;
    }

    const path = [];
    let current = element;

    while (current && current !== document.body) {
      let selector = current.tagName.toLowerCase();

      if (current.id) {
        selector = '#' + current.id;
        path.unshift(selector);
        break;
      } else if (current.className && typeof current.className === 'string') {
        const classes = current.className.trim().split(/\s+/).slice(0, 2);
        if (classes.length > 0 && classes[0]) {
          selector += '.' + classes.join('.');
        }
      }

      const siblings = current.parentElement ? Array.from(current.parentElement.children) : [];
      if (siblings.length > 1) {
        const index = siblings.indexOf(current) + 1;
        if (index > 1) {
          selector += `:nth-child(${index})`;
        }
      }

      path.unshift(selector);
      current = current.parentElement;
    }

    return path.join(' > ');
  }

  /**
   * Handle toolbar tool clicks
   */
  handleToolClick(tool) {
    if (tool === 'cancel') {
      this.stop();
      return;
    }

    // Update active tool
    this.toolbar.querySelectorAll('.mosqit-tool').forEach(btn => {
      btn.classList.remove('active');
    });
    this.toolbar.querySelector(`[data-tool="${tool}"]`).classList.add('active');

    // Handle tool actions
    switch (tool) {
      case 'select':
        this.mode = 'select';
        break;
      case 'screenshot':
        this.captureScreenshot();
        break;
      case 'color':
        this.startColorPicker();
        break;
      case 'measure':
        this.startMeasure();
        break;
      case 'annotate':
        if (this.selectedElement) {
          this.startAnnotation();
        } else {
          this.showToast('Please select an element first', 'warning');
        }
        break;
    }
  }

  /**
   * Capture element and open bug report
   */
  async captureElement(element) {
    this.showToast('📸 Capturing element...', 'info');

    // Collect element data
    const elementData = await this.collectElementData(element);
    const debugContext = await this.collectDebugContext(element);

    // Take screenshot
    const screenshot = await this.takeScreenshot(element);

    // Send to extension for processing
    chrome.runtime.sendMessage({
      type: 'VISUAL_BUG_CAPTURED',
      data: {
        element: elementData,
        screenshot: screenshot,
        page: {
          url: window.location.href,
          title: document.title,
          viewport: {
            width: window.innerWidth,
            height: window.innerHeight
          },
          userAgent: navigator.userAgent,
          referrer: document.referrer,
          cookieEnabled: navigator.cookieEnabled,
          language: navigator.language
        },
        debug: debugContext
      }
    }, (response) => {
      if (response?.success) {
        // Stop the visual bug reporter after successful capture
        this.showToast('✅ Bug captured! Check DevTools panel', 'success');
        setTimeout(() => {
          this.stop();
        }, 2000);
      } else {
        this.showToast('❌ Failed to capture bug', 'error');
      }
    });
  }

  /**
   * Collect comprehensive element data
   */
  async collectElementData(element) {
    const rect = element.getBoundingClientRect();
    const styles = window.getComputedStyle(element);

    // Get parent chain for context
    const parentChain = this.getParentChain(element);

    // Get event listeners if possible
    const eventListeners = this.getEventListeners(element);

    return {
      selector: this.generateSelector(element),
      xpath: this.getXPath(element),
      tagName: element.tagName.toLowerCase(),
      id: element.id,
      className: element.className,
      classList: Array.from(element.classList),
      innerHTML: element.innerHTML.substring(0, 500), // Truncate for size
      outerHTML: element.outerHTML.substring(0, 1000),
      text: element.textContent?.trim().substring(0, 200),
      attributes: this.getAttributes(element),
      dataset: {...element.dataset}, // Data attributes
      position: {
        x: rect.left + window.scrollX,
        y: rect.top + window.scrollY,
        width: rect.width,
        height: rect.height,
        viewport: {
          x: rect.left,
          y: rect.top
        }
      },
      styles: {
        backgroundColor: styles.backgroundColor,
        color: styles.color,
        fontSize: styles.fontSize,
        fontFamily: styles.fontFamily,
        padding: styles.padding,
        margin: styles.margin,
        border: styles.border,
        borderRadius: styles.borderRadius,
        display: styles.display,
        position: styles.position,
        opacity: styles.opacity,
        zIndex: styles.zIndex,
        boxShadow: styles.boxShadow,
        transform: styles.transform,
        transition: styles.transition
      },
      computed: {
        isVisible: this.isElementVisible(element),
        isInteractive: this.isElementInteractive(element),
        contrast: this.calculateContrast(styles.color, styles.backgroundColor),
        hasError: element.classList.contains('error') || element.classList.contains('invalid'),
        role: element.getAttribute('role') || element.getAttribute('aria-role'),
        ariaLabel: element.getAttribute('aria-label'),
        parentChain: parentChain,
        eventListeners: eventListeners
      }
    };
  }

  /**
   * Get element attributes
   */
  getAttributes(element) {
    const attrs = {};
    for (const attr of element.attributes) {
      attrs[attr.name] = attr.value;
    }
    return attrs;
  }

  /**
   * Check if element is visible
   */
  isElementVisible(element) {
    const rect = element.getBoundingClientRect();
    const style = window.getComputedStyle(element);

    return rect.width > 0 &&
           rect.height > 0 &&
           style.display !== 'none' &&
           style.visibility !== 'hidden' &&
           style.opacity !== '0';
  }

  /**
   * Check if element is interactive
   */
  isElementInteractive(element) {
    const interactiveTags = ['button', 'a', 'input', 'textarea', 'select'];
    const hasClickHandler = element.onclick !== null;
    const hasRole = element.hasAttribute('role');
    const isTabable = element.tabIndex >= 0;

    return interactiveTags.includes(element.tagName.toLowerCase()) ||
           hasClickHandler ||
           hasRole ||
           isTabable;
  }

  /**
   * Calculate color contrast ratio
   */
  calculateContrast() {
    // Simple contrast calculation (would need full implementation)
    return 'N/A'; // Placeholder
  }

  /**
   * Take screenshot of element
   */
  async takeScreenshot(element) {
    const rect = element.getBoundingClientRect();

    // Request screenshot from background script
    return new Promise((resolve) => {
      chrome.runtime.sendMessage({
        type: 'CAPTURE_ELEMENT_SCREENSHOT',
        area: {
          x: rect.left + window.scrollX,
          y: rect.top + window.scrollY,
          width: rect.width,
          height: rect.height,
          viewport: {
            x: rect.left,
            y: rect.top,
            width: window.innerWidth,
            height: window.innerHeight
          }
        }
      }, (response) => {
        resolve(response?.screenshot || null);
      });
    });
  }

  /**
   * Show toast notification
   */
  showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'mosqit-toast';
    toast.textContent = message;

    document.body.appendChild(toast);

    setTimeout(() => {
      toast.style.animation = 'fadeOut 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 2000);
  }

  /**
   * Start annotation mode
   */
  startAnnotation() {
    // This would open the annotation canvas
    // Implementation would include drawing tools, text, arrows, etc.
    // TODO: Implement annotation mode
  }

  /**
   * Start color picker mode
   */
  startColorPicker() {
    // TODO: Implement color picker
  }

  /**
   * Start measurement mode
   */
  startMeasure() {
    // TODO: Implement measurement tool
  }

  /**
   * Capture full screenshot
   */
  captureScreenshot() {
    chrome.runtime.sendMessage({
      type: 'CAPTURE_VISIBLE_TAB'
    });
  }

  /**
   * Collect debug context including console errors
   */
  async collectDebugContext(element) {
    // Capture recent console errors
    const errors = this.captureConsoleErrors();

    // Get JavaScript context
    const jsContext = this.getJavaScriptContext(element);

    // Get network activity
    const networkErrors = this.getRecentNetworkErrors();

    // Get performance metrics
    const performance = this.getPerformanceMetrics();

    return {
      consoleErrors: errors,
      javascriptContext: jsContext,
      networkErrors: networkErrors,
      performance: performance,
      elementStack: this.getElementSourceInfo(element),
      documentReadyState: document.readyState,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Capture recent console errors
   */
  captureConsoleErrors() {
    // This would need to be implemented with a console interceptor
    // For now, return placeholder
    return [
      {
        message: 'Console error capture needs to be implemented',
        type: 'info',
        timestamp: new Date().toISOString()
      }
    ];
  }

  /**
   * Get JavaScript context around element
   */
  getJavaScriptContext(element) {
    try {
      // Try to find React/Vue/Angular context
      const reactFiber = element._reactFiber || element.__reactFiber;
      const vueInstance = element.__vue__;
      const angularElement = window.angular?.element?.(element);

      return {
        hasReact: !!reactFiber,
        hasVue: !!vueInstance,
        hasAngular: !!angularElement,
        reactProps: reactFiber?.memoizedProps,
        vueData: vueInstance?.$data,
        framework: this.detectFramework()
      };
    } catch {
      return { error: 'Unable to get JS context' };
    }
  }

  /**
   * Detect JavaScript framework
   */
  detectFramework() {
    if (window.React || document.querySelector('[data-reactroot]')) return 'React';
    if (window.Vue || document.querySelector('[data-v-]')) return 'Vue';
    if (window.angular || document.querySelector('[ng-version]')) return 'Angular';
    if (window.jQuery) return 'jQuery';
    return 'Vanilla JS';
  }

  /**
   * Get recent network errors
   */
  getRecentNetworkErrors() {
    // This would need to be implemented with a network interceptor
    return [];
  }

  /**
   * Get performance metrics
   */
  getPerformanceMetrics() {
    try {
      const timing = performance.timing;
      return {
        pageLoadTime: timing.loadEventEnd - timing.navigationStart,
        domReadyTime: timing.domContentLoadedEventEnd - timing.navigationStart,
        resourceLoadTime: timing.responseEnd - timing.requestStart,
        firstPaint: performance.getEntriesByType?.('paint')?.[0]?.startTime,
        memoryUsage: performance.memory ? {
          used: Math.round(performance.memory.usedJSHeapSize / 1048576),
          total: Math.round(performance.memory.totalJSHeapSize / 1048576)
        } : null
      };
    } catch {
      return null;
    }
  }

  /**
   * Get element source information
   */
  getElementSourceInfo() {
    // Try to get source location from stack trace
    const stack = new Error().stack;
    const lines = stack?.split('\n') || [];

    // Parse source locations
    const sources = lines.slice(2, 5).map(line => {
      const match = line.match(/at\s+(.+?)\s+\((.+?):(\d+):(\d+)\)/);
      if (match) {
        return {
          function: match[1],
          file: match[2],
          line: parseInt(match[3], 10),
          column: parseInt(match[4], 10)
        };
      }
      return null;
    }).filter(Boolean);

    return sources;
  }

  /**
   * Get parent chain for context
   */
  getParentChain(element) {
    const chain = [];
    let current = element.parentElement;
    let depth = 0;

    while (current && depth < 5) {
      chain.push({
        tagName: current.tagName.toLowerCase(),
        id: current.id,
        className: current.className
      });
      current = current.parentElement;
      depth++;
    }

    return chain;
  }

  /**
   * Get element's XPath
   */
  getXPath(element) {
    if (element.id) {
      return `//*[@id="${element.id}"]`;
    }

    const parts = [];
    while (element && element.nodeType === Node.ELEMENT_NODE) {
      let index = 0;
      let sibling = element.previousSibling;

      while (sibling) {
        if (sibling.nodeType === Node.ELEMENT_NODE &&
            sibling.tagName === element.tagName) {
          index++;
        }
        sibling = sibling.previousSibling;
      }

      const tagName = element.tagName.toLowerCase();
      const xpathIndex = index > 0 ? `[${index + 1}]` : '';
      parts.unshift(`${tagName}${xpathIndex}`);
      element = element.parentElement;
    }

    return parts.length ? `/${parts.join('/')}` : null;
  }

  /**
   * Get event listeners attached to element
   */
  getEventListeners(element) {
    try {
      // Try to get event listeners (Chrome DevTools API)
      if (typeof window.getEventListeners === 'function') {
        return window.getEventListeners(element);
      }

      // Fallback: check common event properties
      const events = [];
      const eventTypes = ['click', 'change', 'input', 'submit', 'focus', 'blur'];

      eventTypes.forEach(type => {
        if (element[`on${type}`]) {
          events.push(type);
        }
      });

      return events;
    } catch {
      return [];
    }
  }
}

// Check if we're in a browser environment (not in tests)
if (typeof window !== 'undefined' && typeof document !== 'undefined' && typeof chrome !== 'undefined' && chrome.runtime) {
  // Check if Visual Bug Reporter is already initialized
  if (typeof window.mosqitVisualBugReporter === 'undefined') {
    // Initialize Visual Bug Reporter
    window.mosqitVisualBugReporter = new VisualBugReporter();
    window.mosqitVisualBugReporter.init();

    // Listen for messages from DevTools panel
    chrome.runtime.onMessage.addListener((message) => {
      if (message.type === 'OPEN_ANNOTATION_CANVAS' && message.screenshot) {
        // Dynamically import and initialize annotation canvas
        import('./annotation-canvas.js').then((module) => {
          const canvas = new module.AnnotationCanvas(message.screenshot);
          canvas.init();
        }).catch((error) => {
          console.error('[Mosqit] Failed to load annotation canvas:', error);
        });
      }
    });
  } else {
    // Visual Bug Reporter already initialized
  }
}

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports = VisualBugReporter;
}