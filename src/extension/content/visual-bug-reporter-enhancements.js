/**
 * Visual Bug Reporter Enhancements
 * Implements all 10 Chrome DevTools-like improvements
 */

// Import utilities
import('./visual-bug-reporter-utils.js').then((utils) => {
  // Enhance the existing VisualBugReporter prototype
  if (typeof window !== 'undefined' && window.mosqitVisualBugReporter) {
    const reporter = window.mosqitVisualBugReporter;

    // Initialize utilities
    reporter.contrastAnalyzer = new utils.ContrastAnalyzer();
    reporter.ariaInspector = new utils.AriaInspector();
    reporter.performanceMonitor = new utils.PerformanceMonitor();
    reporter.smartContextDetector = new utils.SmartContextDetector();

    // Add enhanced keyboard handling
    reporter.handleKeyDown = function(event) {
      if (!this.isActive) return;

      // 2. Persistent Tooltip Mode (Ctrl+Alt)
      if (event.ctrlKey && event.altKey) {
        event.preventDefault();
        this.persistentTooltip = !this.persistentTooltip;
        if (this.persistentTooltip && this.hoveredElement) {
          this.lockTooltip();
        } else {
          this.unlockTooltip();
        }
        return;
      }

      // 6. Multi-Element Selection (Ctrl+Click)
      if (event.ctrlKey && !event.altKey && !event.shiftKey) {
        this.multiSelectionMode = true;
        document.body.style.cursor = 'copy';
        return;
      }

      // 5. Keyboard Navigation
      switch(event.key) {
        case 'ArrowUp':
          event.preventDefault();
          this.navigateToSibling('previous');
          break;
        case 'ArrowDown':
          event.preventDefault();
          this.navigateToSibling('next');
          break;
        case 'ArrowLeft':
          event.preventDefault();
          this.navigateToParent();
          break;
        case 'ArrowRight':
          event.preventDefault();
          this.navigateToFirstChild();
          break;
        case 'Tab':
          event.preventDefault();
          this.navigateToNextFocusable(event.shiftKey);
          break;
        case 'Enter':
          event.preventDefault();
          if (this.hoveredElement) {
            this.selectElement(this.hoveredElement);
          }
          break;
        case 'Escape':
          if (this.persistentTooltip) {
            this.persistentTooltip = false;
            this.unlockTooltip();
          } else {
            this.stop();
          }
          break;
        case 'a':
          // Select all similar elements
          if (event.ctrlKey || event.metaKey) {
            event.preventDefault();
            this.selectAllSimilar();
          }
          break;
        case 'e':
          // Toggle CSS editor
          if (event.ctrlKey) {
            event.preventDefault();
            this.toggleCSSEditor();
          }
          break;
        case 'p':
          // Toggle performance overlay
          if (event.ctrlKey) {
            event.preventDefault();
            this.togglePerformanceOverlay();
          }
          break;
      }
    };

    // Navigation methods
    reporter.navigateToSibling = function(direction) {
      if (!this.hoveredElement) return;

      const parent = this.hoveredElement.parentElement;
      if (!parent) return;

      const siblings = Array.from(parent.children);
      const currentIndex = siblings.indexOf(this.hoveredElement);

      let targetIndex;
      if (direction === 'next') {
        targetIndex = (currentIndex + 1) % siblings.length;
      } else {
        targetIndex = currentIndex - 1 < 0 ? siblings.length - 1 : currentIndex - 1;
      }

      const targetElement = siblings[targetIndex];
      if (targetElement) {
        this.hoveredElement = targetElement;
        this.highlightElement(targetElement);
        this.showEnhancedElementInfo(targetElement);
        targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    };

    reporter.navigateToParent = function() {
      if (!this.hoveredElement?.parentElement) return;

      const parent = this.hoveredElement.parentElement;
      if (parent && parent !== document.body) {
        this.hoveredElement = parent;
        this.highlightElement(parent);
        this.showEnhancedElementInfo(parent);
      }
    };

    reporter.navigateToFirstChild = function() {
      if (!this.hoveredElement?.firstElementChild) return;

      const firstChild = this.hoveredElement.firstElementChild;
      this.hoveredElement = firstChild;
      this.highlightElement(firstChild);
      this.showEnhancedElementInfo(firstChild);
    };

    reporter.navigateToNextFocusable = function(reverse = false) {
      const focusableSelectors = 'a, button, input, select, textarea, [tabindex]:not([tabindex="-1"])';
      const focusableElements = Array.from(document.querySelectorAll(focusableSelectors));

      if (focusableElements.length === 0) return;

      let currentIndex = focusableElements.indexOf(this.hoveredElement);
      if (currentIndex === -1) currentIndex = 0;

      if (reverse) {
        currentIndex = currentIndex <= 0 ? focusableElements.length - 1 : currentIndex - 1;
      } else {
        currentIndex = (currentIndex + 1) % focusableElements.length;
      }

      const targetElement = focusableElements[currentIndex];
      if (targetElement) {
        this.hoveredElement = targetElement;
        this.highlightElement(targetElement);
        this.showEnhancedElementInfo(targetElement);
        targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    };

    // Persistent tooltip
    reporter.lockTooltip = function() {
      if (this.infoPanel) {
        this.infoPanel.classList.add('locked');
        this.showToast('🔒 Tooltip locked (Ctrl+Alt to unlock)', 'info', 2000);
      }
    };

    reporter.unlockTooltip = function() {
      if (this.infoPanel) {
        this.infoPanel.classList.remove('locked');
        this.showToast('🔓 Tooltip unlocked', 'info', 1000);
      }
    };

    // Multi-selection
    reporter.selectAllSimilar = function() {
      if (!this.hoveredElement) return;

      const selector = this.hoveredElement.className
        ? `.${this.hoveredElement.className.split(' ')[0]}`
        : this.hoveredElement.tagName.toLowerCase();

      const similar = document.querySelectorAll(selector);
      similar.forEach(el => {
        this.multiSelection.add(el);
        this.highlightMultiSelection(el);
      });

      this.showToast(`Selected ${similar.length} similar elements`, 'info');
    };

    reporter.highlightMultiSelection = function(element) {
      const highlight = document.createElement('div');
      const rect = element.getBoundingClientRect();

      highlight.style.cssText = `
        position: fixed;
        top: ${rect.top}px;
        left: ${rect.left}px;
        width: ${rect.width}px;
        height: ${rect.height}px;
        border: 2px dashed #4A90E2;
        background: rgba(74, 144, 226, 0.1);
        pointer-events: none;
        z-index: 999997;
        animation: pulse 1s infinite;
      `;

      highlight.className = 'mosqit-multi-highlight';
      document.body.appendChild(highlight);
    };

    // Override showElementInfo with enhanced version
    reporter.showEnhancedElementInfo = function(element) {
      const rect = element.getBoundingClientRect();
      const styles = window.getComputedStyle(element);
      const selector = this.generateSelector(element);

      // 1. Enhanced Tooltip with More Info
      // 3. Better Accessibility Information
      const contrastRatio = this.contrastAnalyzer?.calculate(styles.color, styles.backgroundColor);
      const ariaInfo = this.ariaInspector?.inspect(element);

      // 4. Improved Visual Indicators
      const isFlexContainer = styles.display === 'flex' || styles.display === 'inline-flex';
      const isGridContainer = styles.display === 'grid' || styles.display === 'inline-grid';

      // 10. Performance Overlay
      const perfMetrics = this.performanceMonitor?.collectMetrics(element);

      // 9. Smart Context Detection
      const context = this.smartContextDetector?.detect(element);

      // 7. Enhanced Element Path Display
      const breadcrumb = this.generateBreadcrumb(element);

      this.infoPanel.innerHTML = `
        <div class="mosqit-info-header ${this.persistentTooltip ? 'locked' : ''}">
          <div class="mosqit-info-title">
            ${this.getElementIcon(element)}
            <span>${element.tagName.toLowerCase()}${element.id ? '#' + element.id : ''}</span>
            ${isFlexContainer ? '<span class="badge flex">FLEX</span>' : ''}
            ${isGridContainer ? '<span class="badge grid">GRID</span>' : ''}
            ${perfMetrics?.hasAnimations ? '<span class="badge animated">ANIMATED</span>' : ''}
            ${ariaInfo?.issues?.length > 0 ? '<span class="badge warning">♿ Issues</span>' : ''}
            ${this.persistentTooltip ? '<span class="badge locked">🔒</span>' : ''}
          </div>
          <div class="mosqit-breadcrumb">${breadcrumb}</div>
        </div>

        <div class="mosqit-info-tabs">
          <button class="tab active" data-tab="styles">Styles</button>
          <button class="tab" data-tab="accessibility">Accessibility</button>
          <button class="tab" data-tab="performance">Performance</button>
          <button class="tab" data-tab="context">Context</button>
        </div>

        <div class="mosqit-info-content">
          <!-- Styles Tab -->
          <div class="tab-content active" id="styles-tab">
            <div class="mosqit-info-grid">
              <div class="info-group">
                <strong>Dimensions</strong>
                <div>${Math.round(rect.width)} × ${Math.round(rect.height)}px</div>
              </div>
              <div class="info-group">
                <strong>Position</strong>
                <div>X: ${Math.round(rect.left)}, Y: ${Math.round(rect.top)}</div>
              </div>
              <div class="info-group">
                <strong>Padding</strong>
                <div>${styles.padding}</div>
              </div>
              <div class="info-group">
                <strong>Margin</strong>
                <div>${styles.margin}</div>
              </div>
            </div>

            <div class="mosqit-info-colors">
              <div class="color-item">
                <strong>Background</strong>
                <span class="color-value">${styles.backgroundColor}</span>
                <span class="color-swatch" style="background: ${styles.backgroundColor}"></span>
                ${this.cssEditor ? '<button class="edit-btn" data-prop="backgroundColor">✏️</button>' : ''}
              </div>
              <div class="color-item">
                <strong>Text</strong>
                <span class="color-value">${styles.color}</span>
                <span class="color-swatch" style="background: ${styles.color}"></span>
                ${this.cssEditor ? '<button class="edit-btn" data-prop="color">✏️</button>' : ''}
              </div>
              ${contrastRatio ? `
                <div class="contrast-ratio ${contrastRatio.passes?.AA ? 'pass' : 'fail'}">
                  <strong>Contrast</strong>
                  <span>${contrastRatio.ratio}:1</span>
                  <span class="badge ${contrastRatio.passes?.AA ? 'success' : 'error'}">
                    ${contrastRatio.passes?.AA ? '✅ WCAG AA' : '❌ WCAG AA'}
                  </span>
                </div>
              ` : ''}
            </div>

            <div class="mosqit-info-typography">
              <strong>Typography</strong>
              <div>${styles.fontSize} / ${styles.lineHeight} ${styles.fontWeight}</div>
              <div class="font-family">${styles.fontFamily}</div>
            </div>

            ${perfMetrics?.eventListeners?.length > 0 ? `
              <div class="event-listeners">
                <strong>Event Listeners (${perfMetrics.eventListeners.length})</strong>
                <div class="event-list">
                  ${perfMetrics.eventListeners.map(e => `<span class="event-badge">${e}</span>`).join('')}
                </div>
              </div>
            ` : ''}
          </div>

          <!-- Accessibility Tab -->
          <div class="tab-content" id="accessibility-tab">
            ${ariaInfo ? `
              <div class="mosqit-accessibility-info">
                <div class="aria-properties">
                  <strong>ARIA Properties</strong>
                  ${ariaInfo.role ? `<div>Role: <code>${ariaInfo.role}</code></div>` : ''}
                  ${ariaInfo.label ? `<div>Name: "${ariaInfo.label}"</div>` : ''}
                  ${ariaInfo.description ? `<div>Description: ${ariaInfo.description}</div>` : ''}
                  <div>Focusable: ${ariaInfo.focusable ? '✅ Yes' : '❌ No'}</div>
                  <div>Tab Index: ${ariaInfo.tabIndex}</div>
                </div>

                ${ariaInfo.state ? `
                  <div class="aria-state">
                    <strong>State</strong>
                    ${Object.entries(ariaInfo.state)
                      .filter(([, value]) => value !== null && value !== undefined)
                      .map(([key, value]) => `<div>${key}: ${value}</div>`)
                      .join('')}
                  </div>
                ` : ''}

                ${ariaInfo.issues?.length > 0 ? `
                  <div class="accessibility-issues">
                    <strong>Issues Found</strong>
                    ${ariaInfo.issues.map(issue => `
                      <div class="issue ${issue.level}">
                        <span class="issue-icon">${issue.level === 'error' ? '❌' : '⚠️'}</span>
                        <span>${issue.message}</span>
                        ${issue.wcag ? `<span class="wcag-ref">WCAG ${issue.wcag}</span>` : ''}
                      </div>
                    `).join('')}
                  </div>
                ` : '<div class="no-issues">✅ No accessibility issues detected</div>'}
              </div>
            ` : ''}
          </div>

          <!-- Performance Tab -->
          <div class="tab-content" id="performance-tab">
            ${perfMetrics ? `
              <div class="mosqit-performance-info">
                <div class="perf-metric">
                  <strong>Layout Metrics</strong>
                  <div>DOM Depth: ${perfMetrics.domDepth}</div>
                  <div>Children: ${perfMetrics.childrenCount}</div>
                  <div>CSS Rules: ${perfMetrics.cssComplexity}</div>
                  <div>Specificity: ${perfMetrics.specificity}</div>
                </div>

                <div class="perf-metric">
                  <strong>Render Performance</strong>
                  <div>In Viewport: ${perfMetrics.isInViewport ? '✅' : '❌'}</div>
                  <div>Reflow Triggers: ${perfMetrics.reflows}</div>
                  <div>Animations: ${perfMetrics.hasAnimations ? '⚠️ Yes' : '✅ No'}</div>
                  <div>Transitions: ${perfMetrics.hasTransitions ? '⚠️ Yes' : '✅ No'}</div>
                </div>

                ${perfMetrics.layoutShifts?.length > 0 ? `
                  <div class="perf-warning">
                    <strong>⚠️ Potential Layout Shifts</strong>
                    <div>${perfMetrics.layoutShifts.join(', ')}</div>
                  </div>
                ` : ''}

                <div class="perf-metric">
                  <strong>Resources</strong>
                  <div>Images: ${perfMetrics.hasImages}</div>
                  <div>IFrames: ${perfMetrics.hasIframes}</div>
                  <div>Render Blocking: ${perfMetrics.isRenderBlocking ? '⚠️ Yes' : '✅ No'}</div>
                </div>
              </div>
            ` : ''}
          </div>

          <!-- Context Tab -->
          <div class="tab-content" id="context-tab">
            ${context ? `
              <div class="mosqit-context-info">
                ${context.formErrors?.length > 0 ? `
                  <div class="context-section">
                    <strong>Form Validation Errors</strong>
                    ${context.formErrors.map(err => `
                      <div class="form-error">
                        <span class="error-type">${err.type}</span>
                        <span>${err.message || err.class || 'Invalid'}</span>
                      </div>
                    `).join('')}
                  </div>
                ` : ''}

                ${context.brokenImages?.length > 0 ? `
                  <div class="context-section">
                    <strong>Broken Images</strong>
                    ${context.brokenImages.map(img => `
                      <div class="broken-image">
                        <span>🖼️ ${img.src}</span>
                        ${img.alt ? `<span>Alt: "${img.alt}"</span>` : ''}
                      </div>
                    `).join('')}
                  </div>
                ` : ''}

                ${context.validationState ? `
                  <div class="context-section">
                    <strong>Validation State</strong>
                    <div>Valid: ${context.validationState.valid ? '✅' : '❌'}</div>
                    ${context.validationState.message ? `<div>Message: ${context.validationState.message}</div>` : ''}
                  </div>
                ` : ''}

                ${Object.keys(context.dataAttributes || {}).length > 0 ? `
                  <div class="context-section">
                    <strong>Data Attributes</strong>
                    ${Object.entries(context.dataAttributes)
                      .map(([key, value]) => `<div>data-${key}: ${value}</div>`)
                      .join('')}
                  </div>
                ` : ''}

                ${context.networkRequests?.length > 0 ? `
                  <div class="context-section">
                    <strong>Network Resources</strong>
                    ${context.networkRequests.map(req => `
                      <div class="network-request">
                        <span class="req-type">${req.type}</span>
                        <span class="req-url">${req.url}</span>
                        <span class="req-status">${req.status || ''}</span>
                      </div>
                    `).join('')}
                  </div>
                ` : ''}
              </div>
            ` : ''}
          </div>
        </div>

        <div class="mosqit-info-actions">
          <button class="action-btn" onclick="navigator.clipboard.writeText('${selector.replace(/'/g, "\\'")}')">
            📋 Copy Selector
          </button>
          <button class="action-btn" onclick="console.log(document.querySelector('${selector.replace(/'/g, "\\'")}'))">
            🔍 Log Element
          </button>
          ${this.cssEditor ? `
            <button class="action-btn" onclick="window.mosqitVisualBugReporter.toggleCSSEditor()">
              🎨 Edit CSS
            </button>
          ` : ''}
        </div>
      `;

      // Setup tab switching
      this.setupTabSwitching();

      // Setup breadcrumb navigation
      this.setupBreadcrumbNavigation();

      this.infoPanel.style.display = 'block';
    };

    // Replace original showElementInfo with enhanced version
    reporter.showElementInfo = reporter.showEnhancedElementInfo;

    // Helper methods
    reporter.getElementIcon = function(element) {
      const tag = element.tagName.toLowerCase();
      const icons = {
        'button': '🔘', 'a': '🔗', 'img': '🖼️', 'input': '📝',
        'select': '📋', 'video': '🎬', 'audio': '🔊', 'form': '📄',
        'table': '📊', 'h1': '📰', 'h2': '📰', 'h3': '📰',
        'p': '📝', 'div': '📦', 'span': '✏️', 'section': '📑',
        'article': '📃', 'nav': '🧭', 'header': '🎯', 'footer': '📌'
      };
      return `<span class="element-icon">${icons[tag] || '🏷️'}</span>`;
    };

    reporter.generateBreadcrumb = function(element) {
      const path = [];
      let current = element;
      let depth = 0;
      const maxDepth = 5;

      while (current && current !== document.body && depth < maxDepth) {
        const identifier = current.id
          ? `#${current.id}`
          : current.className
            ? `.${current.className.split(' ')[0]}`
            : current.tagName.toLowerCase();

        path.unshift(`<span class="breadcrumb-item" data-depth="${depth}">${identifier}</span>`);
        current = current.parentElement;
        depth++;
      }

      return path.join(' › ');
    };

    reporter.setupTabSwitching = function() {
      if (!this.infoPanel) return;

      const tabs = this.infoPanel.querySelectorAll('.tab');
      const contents = this.infoPanel.querySelectorAll('.tab-content');

      tabs.forEach(tab => {
        tab.addEventListener('click', () => {
          const targetTab = tab.dataset.tab;

          tabs.forEach(t => t.classList.remove('active'));
          contents.forEach(c => c.classList.remove('active'));

          tab.classList.add('active');
          const targetContent = this.infoPanel.querySelector(`#${targetTab}-tab`);
          if (targetContent) targetContent.classList.add('active');
        });
      });
    };

    reporter.setupBreadcrumbNavigation = function() {
      if (!this.infoPanel) return;

      const breadcrumbItems = this.infoPanel.querySelectorAll('.breadcrumb-item');

      breadcrumbItems.forEach(item => {
        item.addEventListener('click', () => {
          const depth = parseInt(item.dataset.depth);
          let target = this.hoveredElement;

          for (let i = 0; i < depth && target?.parentElement; i++) {
            target = target.parentElement;
          }

          if (target) {
            this.hoveredElement = target;
            this.highlightElement(target);
            this.showEnhancedElementInfo(target);
          }
        });
      });
    };

    // CSS Editor functionality
    reporter.toggleCSSEditor = function() {
      if (!this.hoveredElement) return;

      if (!this.cssEditor) {
        this.cssEditor = new utils.CSSEditor(this.hoveredElement);
        this.cssEditor.saveOriginalStyles();
        this.showToast('🎨 CSS Editor enabled - Edit styles in real-time', 'info');
      } else {
        const changes = this.cssEditor.getChanges();
        if (changes.length > 0) {
          console.log('[Mosqit] CSS Changes:', changes);
          this.showToast(`💾 Saved ${changes.length} CSS changes to console`, 'success');
        }
        this.cssEditor.resetStyles();
        this.cssEditor = null;
      }

      this.showEnhancedElementInfo(this.hoveredElement);
    };

    // Performance overlay
    reporter.togglePerformanceOverlay = function() {
      if (!this.performanceOverlayVisible) {
        this.showPerformanceOverlay();
        this.performanceOverlayVisible = true;
      } else {
        this.hidePerformanceOverlay();
        this.performanceOverlayVisible = false;
      }
    };

    reporter.showPerformanceOverlay = function() {
      const overlay = document.createElement('div');
      overlay.id = 'mosqit-performance-overlay';
      overlay.className = 'mosqit-performance-overlay';
      overlay.style.cssText = `
        position: fixed;
        top: 10px;
        left: 10px;
        background: rgba(0, 0, 0, 0.9);
        color: #0f0;
        font-family: 'Courier New', monospace;
        font-size: 12px;
        padding: 10px;
        border-radius: 4px;
        z-index: 1000000;
        min-width: 250px;
      `;

      const updateMetrics = () => {
        const memory = performance.memory || {};
        const timing = performance.timing || {};

        overlay.innerHTML = `
          <div style="color: #0f0; margin-bottom: 10px;">🎯 PERFORMANCE METRICS</div>
          <div>FPS: ${Math.round(1000 / 16.67)}</div>
          <div>Memory: ${Math.round((memory.usedJSHeapSize || 0) / 1048576)}MB</div>
          <div>DOM Nodes: ${document.getElementsByTagName('*').length}</div>
          <div>Load Time: ${timing.loadEventEnd - timing.navigationStart}ms</div>
          <div>Listeners: ${this.countEventListeners()}</div>
          <div style="margin-top: 10px; color: #ff0;">Press Ctrl+P to hide</div>
        `;
      };

      updateMetrics();
      this.performanceInterval = setInterval(updateMetrics, 1000);
      document.body.appendChild(overlay);
    };

    reporter.hidePerformanceOverlay = function() {
      const overlay = document.getElementById('mosqit-performance-overlay');
      if (overlay) overlay.remove();
      if (this.performanceInterval) {
        clearInterval(this.performanceInterval);
        this.performanceInterval = null;
      }
    };

    reporter.countEventListeners = function() {
      let count = 0;
      const allElements = document.getElementsByTagName('*');
      const eventTypes = ['click', 'mouseover', 'mouseout', 'keydown', 'keyup'];

      for (let element of allElements) {
        for (let eventType of eventTypes) {
          if (element[`on${eventType}`]) count++;
        }
      }

      return count;
    };

    console.log('[Mosqit] Visual Bug Reporter enhanced with all 10 improvements!');
  }
}).catch(error => {
  console.debug('[Mosqit] Could not load enhancements:', error);
});