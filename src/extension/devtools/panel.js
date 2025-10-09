// Enhanced DevTools Panel for Mosqit with Logcat-style features
console.log('[Mosqit Panel] Script loaded at', new Date().toISOString());

// Check if we're in DevTools context
if (typeof chrome !== 'undefined' && chrome.devtools) {
  console.log('[Mosqit Panel] Running in DevTools context');
  console.log('[Mosqit Panel] Tab ID from inspectedWindow:', chrome.devtools.inspectedWindow.tabId);
} else {
  console.log('[Mosqit Panel] Not in DevTools context - debugging mode');
}

class MosqitDevToolsPanel {
  constructor() {
    this.logs = [];
    this.filteredLogs = [];
    this.filters = {
      levels: new Set(['log', 'info', 'warn', 'error', 'debug']),
      searchText: '',
      showAIAnalysis: true
    };
    this.selectedLogIndex = -1;
    this.port = null;

    // EPHEMERAL MODE: Session-only settings (not persisted)
    this.githubToken = '';
    this.githubRepo = '';

    this.init();
  }

  init() {
    console.log('[Mosqit Panel] Initializing panel...');
    this.setupDOM();
    console.log('[Mosqit Panel] DOM setup complete');
    this.connectToBackground();
    console.log('[Mosqit Panel] Connection attempt initiated');
    this.setupEventListeners();
    console.log('[Mosqit Panel] Event listeners attached');
    // Delay initial log request to ensure connection is established
    setTimeout(() => {
      console.log('[Mosqit Panel] Requesting initial logs...');
      this.requestLogs();
    }, 500);
  }

  setupDOM() {
    // Enhanced dark theme panel with responsive design
    const panelHTML = `
      <div class="mosqit-panel dark-theme">
        <!-- Header Bar -->
        <div class="header-bar">
          <div class="brand">
            <div class="brand-icon">🦟</div>
            <div class="brand-text">
              <div class="brand-name">MOSQIT</div>
              <div class="brand-tagline">AI Debug Assistant</div>
            </div>
          </div>
          <div class="header-actions">
            <button class="header-btn" id="theme-toggle" title="Toggle Theme">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="5"/>
                <path d="M12 1v6M12 17v6M4.22 4.22l4.24 4.24M15.54 15.54l4.24 4.24M1 12h6M17 12h6M4.22 19.78l4.24-4.24M15.54 8.46l4.24-4.24"/>
              </svg>
            </button>
            <button class="header-btn" id="settings-btn" title="Settings">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="3"/>
                <path d="M12 1v6M12 17v6M4.22 4.22l4.24 4.24M15.54 15.54l4.24 4.24M1 12h6M17 12h6M4.22 19.78l4.24-4.24M15.54 8.46l4.24-4.24"/>
              </svg>
            </button>
          </div>
        </div>

        <!-- Toolbar -->
        <div class="toolbar">
          <!-- Advanced Search/Filter Bar -->
          <div class="search-container">
            <div class="search-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="11" cy="11" r="8"/>
                <path d="m21 21-4.35-4.35"/>
              </svg>
            </div>
            <input type="text" class="search-input" placeholder="Search: message:error tag:API level:error -tag:verbose" />
            <div class="search-help" title="Search Help">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3M12 17h.01"/>
              </svg>
            </div>
          </div>

          <!-- Log Level Filters -->
          <div class="filter-group">
            <button class="filter-chip active" data-level="verbose" data-color="#6b7280">
              <span class="filter-indicator"></span>
              <span class="filter-label">VERBOSE</span>
              <span class="filter-count">0</span>
            </button>
            <button class="filter-chip active" data-level="debug" data-color="#8b5cf6">
              <span class="filter-indicator"></span>
              <span class="filter-label">DEBUG</span>
              <span class="filter-count">0</span>
            </button>
            <button class="filter-chip active" data-level="info" data-color="#3b82f6">
              <span class="filter-indicator"></span>
              <span class="filter-label">INFO</span>
              <span class="filter-count">0</span>
            </button>
            <button class="filter-chip active" data-level="warn" data-color="#eab308">
              <span class="filter-indicator"></span>
              <span class="filter-label">WARN</span>
              <span class="filter-count">0</span>
            </button>
            <button class="filter-chip active" data-level="error" data-color="#ef4444">
              <span class="filter-indicator"></span>
              <span class="filter-label">ERROR</span>
              <span class="filter-count">0</span>
            </button>
            <button class="filter-chip active" data-level="assert" data-color="#dc2626">
              <span class="filter-indicator"></span>
              <span class="filter-label">ASSERT</span>
              <span class="filter-count">0</span>
            </button>
          </div>

          <!-- Action Buttons -->
          <div class="action-group">
            <button class="action-btn" id="ai-toggle" title="AI Analysis">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
              </svg>
              <span class="btn-label">AI</span>
            </button>
            <button class="action-btn" id="pause-btn" title="Pause/Resume">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="6" y="4" width="4" height="16"/>
                <rect x="14" y="4" width="4" height="16"/>
              </svg>
            </button>
            <button class="action-btn" id="clear-btn" title="Clear Logs">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="3 6 5 6 21 6"/>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
              </svg>
            </button>
            <button class="action-btn" id="export-btn" title="Export">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/>
              </svg>
            </button>
            <button class="action-btn special" id="visual-bug-btn" title="Visual Bug Reporter">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
                <path d="M12 6v6l4 2"/>
              </svg>
              <span class="btn-label">🐛</span>
            </button>
          </div>
        </div>

        <!-- Main Content Area -->
        <div class="content-area">
          <!-- Logs List -->
          <div class="logs-panel" id="logs-panel">
            <div class="logs-list" id="logs-list"></div>
          </div>

          <!-- Details Panel (Collapsible) -->
          <div class="details-panel" id="details-panel" style="display: none;">
            <div class="details-header">
              <h3>Log Details</h3>
              <button class="close-details" id="close-details">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
            <div class="details-content" id="details-content"></div>
          </div>

          <!-- Visual Bug Reporter View (Initially Hidden) -->
          <div class="visual-bug-panel" id="visual-bug-panel" style="display: none;">
            <div class="vb-container">
              <div class="vb-header">
                <h2>🐛 Visual Bug Reporter</h2>
                <p>Report visual bugs with screenshots and annotations</p>
              </div>

              <div class="vb-capture-section" id="vb-capture-section">
                <button class="vb-capture-btn" id="start-capture">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <circle cx="12" cy="12" r="10"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                  Start Capture Mode
                </button>
                <p class="vb-help">Click to activate element selector on the page</p>
              </div>

              <div class="vb-content" id="vb-content" style="display: none;">
                <!-- Content will be populated when bug is captured -->
              </div>
            </div>
          </div>
        </div>

        <!-- Status Bar -->
        <div class="status-bar">
          <div class="status-left">
            <span class="status-item">
              <span class="status-icon">📊</span>
              <span class="log-count">0 logs</span>
            </span>
            <span class="status-item">
              <span class="status-icon">🔍</span>
              <span class="filter-status">All levels</span>
            </span>
          </div>
          <div class="status-right">
            <span class="status-item connection-status">
              <span class="status-indicator active"></span>
              <span>Connected</span>
            </span>
            <span class="status-item">
              <span class="timestamp"></span>
            </span>
            <a href="https://buymeacoffee.com/mosqit" target="_blank" rel="noopener noreferrer" class="coffee-support" title="Support Mosqit development">
              ☕
            </a>
          </div>
        </div>
      </div>
    `;

    document.body.innerHTML = panelHTML;

    // Cache DOM elements
    this.elements = {
      logsList: document.getElementById('logs-list'),
      logsPanel: document.getElementById('logs-panel'),
      detailsPanel: document.getElementById('details-panel'),
      detailsContent: document.getElementById('details-content'),
      searchInput: document.querySelector('.search-input'),
      clearBtn: document.getElementById('clear-btn'),
      exportBtn: document.getElementById('export-btn'),
      aiToggle: document.getElementById('ai-toggle'),
      pauseBtn: document.getElementById('pause-btn'),
      themeToggle: document.getElementById('theme-toggle'),
      settingsBtn: document.getElementById('settings-btn'),
      closeDetails: document.getElementById('close-details'),
      logCount: document.querySelector('.log-count'),
      filterStatus: document.querySelector('.filter-status'),
      filterChips: document.querySelectorAll('.filter-chip'),
      timestamp: document.querySelector('.timestamp'),
      connectionStatus: document.querySelector('.connection-status')
    };

    // Initialize theme
    this.isDarkTheme = true;
    this.isPaused = false;

    // Visual Bug Reporter mode
    this.visualBugMode = false;
    this.capturedBug = null;
  }

  connectToBackground() {
    try {
      // Check if chrome.runtime is available
      if (!chrome.runtime) {
        console.error('[Mosqit Panel] Chrome runtime not available');
        return;
      }

      console.log('[Mosqit Panel] Attempting to connect to background...');
      this.port = chrome.runtime.connect({ name: 'mosqit-devtools' });

      if (!this.port) {
        console.error('[Mosqit Panel] Failed to create port');
        return;
      }

      this.port.onMessage.addListener((message) => {
        console.log('[Mosqit Panel] Received message:', message.type);
        if (message.type === 'NEW_LOG') {
          this.addLog(message.data);
        } else if (message.type === 'LOG_UPDATE') {
          // UX FIX: Update existing log when AI analysis completes
          console.log('[Mosqit Panel] Received log update');
          this.updateLogAnalysis(message.data);
        } else if (message.type === 'LOGS_DATA') {
          console.log('[Mosqit Panel] Received', message.data?.length || 0, 'logs');
          this.logs = message.data || [];
          this.applyFilters();
        } else if (message.type === 'LOGS_CLEARED') {
          console.log('[Mosqit Panel] Logs cleared due to navigation');
          this.logs = [];
          this.filteredLogs = [];
          this.renderLogs();
          this.updateLogCount();
        } else if (message.type === 'VISUAL_BUG_CAPTURED') {
          console.log('[Mosqit Panel] Visual bug captured');
          this.handleCapturedBug(message.data);
        }
      });

      this.port.onDisconnect.addListener(() => {
        console.warn('[Mosqit Panel] Disconnected from background');

        // Check if it's a context invalidation error
        if (chrome.runtime.lastError) {
          console.error('[Mosqit Panel] Disconnect error:', chrome.runtime.lastError);

          // If context is invalidated, don't try to reconnect
          if (chrome.runtime.lastError.message?.includes('context invalidated')) {
            console.error('[Mosqit Panel] Context invalidated - stopping reconnection attempts');
            this.showContextInvalidatedMessage();
            return;
          }
        }

        // Try to reconnect after a delay
        this.reconnectAttempts = (this.reconnectAttempts || 0) + 1;
        if (this.reconnectAttempts < 5) {
          console.log('[Mosqit Panel] Reconnect attempt', this.reconnectAttempts, 'in 2 seconds...');
          setTimeout(() => this.connectToBackground(), 2000);
        } else {
          console.error('[Mosqit Panel] Max reconnection attempts reached');
          this.showConnectionErrorMessage();
        }
      });

      // Send INIT message with the inspected tab ID
      if (chrome.devtools && chrome.devtools.inspectedWindow) {
        const tabId = chrome.devtools.inspectedWindow.tabId;
        console.log('[Mosqit Panel] Sending INIT for tab:', tabId);
        this.port.postMessage({ type: 'INIT', tabId: tabId });

        // Reset reconnect attempts on successful connection
        this.reconnectAttempts = 0;
      } else {
        console.warn('[Mosqit Panel] DevTools context not available');
      }
    } catch (error) {
      console.error('[Mosqit Panel] Error connecting to background:', error);
      if (error.message?.includes('context invalidated')) {
        this.showContextInvalidatedMessage();
      } else {
        this.showConnectionErrorMessage();
      }
    }
  }

  showContextInvalidatedMessage() {
    if (this.elements?.logsList) {
      this.elements.logsList.innerHTML = `
        <div class="empty-state">
          <div style="font-size: 48px; margin-bottom: 16px;">⚠️</div>
          <div style="color: #ff6b6b; font-weight: bold;">Extension context invalidated</div>
          <div style="color: #aaa; font-size: 12px; margin-top: 8px;">
            Please close and reopen DevTools to reconnect
          </div>
        </div>
      `;
    }
  }

  showConnectionErrorMessage() {
    if (this.elements?.logsList) {
      this.elements.logsList.innerHTML = `
        <div class="empty-state">
          <div style="font-size: 48px; margin-bottom: 16px;">❌</div>
          <div style="color: #ff6b6b; font-weight: bold;">Connection failed</div>
          <div style="color: #aaa; font-size: 12px; margin-top: 8px;">
            Unable to connect to Mosqit background service
          </div>
        </div>
      `;
    }
  }

  setupEventListeners() {
    // Filter chips
    this.elements.filterChips.forEach(chip => {
      chip.addEventListener('click', (e) => {
        const level = e.currentTarget.dataset.level;
        const isActive = e.currentTarget.classList.toggle('active');

        if (isActive) {
          this.filters.levels.add(level);
        } else {
          this.filters.levels.delete(level);
        }

        this.applyFilters();
        this.updateFilterStatus();
      });
    });

    // Search input
    let searchTimeout;
    this.elements.searchInput.addEventListener('input', (e) => {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => {
        this.filters.searchText = e.target.value.toLowerCase();
        this.applyFilters();
      }, 300);
    });

    // Clear button
    this.elements.clearBtn.addEventListener('click', () => {
      this.logs = [];
      this.filteredLogs = [];
      this.renderLogs();
      if (this.port) {
        try {
          this.port.postMessage({ type: 'CLEAR_LOGS' });
        } catch (error) {
          console.error('[Mosqit Panel] Error clearing logs:', error);
        }
      }
    });

    // Export button
    this.elements.exportBtn.addEventListener('click', () => {
      this.exportLogs();
    });

    // Visual Bug Reporter button
    const visualBugBtn = document.getElementById('visual-bug-btn');
    if (visualBugBtn) {
      visualBugBtn.addEventListener('click', () => {
        this.toggleVisualBugReporter();
      });
    }

    // Start capture button
    const startCaptureBtn = document.getElementById('start-capture');
    if (startCaptureBtn) {
      startCaptureBtn.addEventListener('click', () => {
        this.startVisualCapture();
      });
    }

    // AI toggle
    this.elements.aiToggle.addEventListener('click', (e) => {
      this.filters.showAIAnalysis = !this.filters.showAIAnalysis;
      e.currentTarget.classList.toggle('active', this.filters.showAIAnalysis);
      const label = e.currentTarget.querySelector('.btn-label');
      if (label) label.textContent = this.filters.showAIAnalysis ? 'AI' : 'OFF';
      this.renderLogs();
    });

    // Theme toggle
    if (this.elements.themeToggle) {
      this.elements.themeToggle.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', newTheme);

        // Update panel class
        const panel = document.querySelector('.mosqit-panel');
        if (panel) {
          panel.classList.toggle('dark-theme', newTheme === 'dark');
          panel.classList.toggle('light-theme', newTheme === 'light');
        }

        // Ephemeral theme (session-only, not persisted)
      });

      // Default theme on startup
      const defaultTheme = 'dark';
      document.documentElement.setAttribute('data-theme', defaultTheme);

      const panel = document.querySelector('.mosqit-panel');
      if (panel) {
        panel.classList.toggle('dark-theme', defaultTheme === 'dark');
        panel.classList.toggle('light-theme', defaultTheme === 'light');
      }
    }

    // Close details button
    if (this.elements.closeDetails) {
      this.elements.closeDetails.addEventListener('click', () => {
        this.elements.detailsPanel.style.display = 'none';
      });
    }

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.elements.searchInput.value = '';
        this.filters.searchText = '';
        this.applyFilters();
      } else if (e.key === 'Delete' && e.shiftKey) {
        this.elements.clearBtn.click();
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        this.selectLog(this.selectedLogIndex - 1);
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        this.selectLog(this.selectedLogIndex + 1);
      }
    });
  }

  requestLogs() {
    if (this.port) {
      try {
        this.port.postMessage({ type: 'GET_LOGS' });
      } catch (error) {
        console.error('[Mosqit Panel] Error requesting logs:', error);
      }
    } else {
      console.warn('[Mosqit Panel] No port available for requesting logs');
    }
  }

  addLog(logData) {
    this.logs.push(logData);

    // Check if log passes filters
    if (this.shouldShowLog(logData)) {
      this.filteredLogs.push(logData);
      this.appendLogToUI(logData);
      this.updateLogCount();
    }
  }

  // UX FIX: Update log when AI analysis completes
  updateLogAnalysis(updatedLog) {
    // Find and update the log in our arrays
    const logIndex = this.logs.findIndex(log => log.timestamp === updatedLog.timestamp);
    if (logIndex !== -1) {
      this.logs[logIndex] = updatedLog;

      // Update filtered logs too
      const filteredIndex = this.filteredLogs.findIndex(log => log.timestamp === updatedLog.timestamp);
      if (filteredIndex !== -1) {
        this.filteredLogs[filteredIndex] = updatedLog;

        // Update the DOM element for this specific log
        const aiElement = this.elements.logsList.querySelector(
          `.ai-analysis[data-log-timestamp="${updatedLog.timestamp}"]`
        );

        if (aiElement) {
          // Update the AI analysis box
          aiElement.className = 'ai-analysis'; // Remove thinking class
          aiElement.innerHTML = `
            <span class="ai-icon">✨</span>
            <span class="ai-text">${this.escapeHtml(updatedLog.analysis)}</span>
          `;
        }
      }
    }
  }

  shouldShowLog(log) {
    const data = log.data || log;

    // Check level filter
    if (!this.filters.levels.has(data.level || 'log')) {
      return false;
    }

    // Check search filter
    if (this.filters.searchText) {
      const searchableText = [
        data.message,
        data.file,
        data.analysis,
        JSON.stringify(data.domNode)
      ].join(' ').toLowerCase();

      if (!searchableText.includes(this.filters.searchText)) {
        return false;
      }
    }

    return true;
  }

  applyFilters() {
    this.filteredLogs = this.logs.filter(log => this.shouldShowLog(log));
    this.renderLogs();
  }

  renderLogs() {
    if (this.filteredLogs.length === 0) {
      this.elements.logsList.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">🦟</div>
          <div class="empty-title">No logs to display</div>
          <div class="empty-subtitle">Waiting for console output...</div>
          <div class="empty-hint">Try refreshing the page or check your filters</div>
        </div>
      `;
    } else {
      this.elements.logsList.innerHTML = '';
      this.filteredLogs.forEach((log, index) => {
        this.appendLogToUI(log, index);
      });
    }

    this.updateLogCount();
    this.updateTimestamp();
  }

  updateFilterStatus() {
    const activeCount = this.filters.levels.size;
    if (activeCount === 6) {
      this.elements.filterStatus.textContent = 'All levels';
    } else if (activeCount === 0) {
      this.elements.filterStatus.textContent = 'No filters';
    } else {
      const levels = Array.from(this.filters.levels).map(l => l.toUpperCase()).join(', ');
      this.elements.filterStatus.textContent = levels;
    }
  }

  updateTimestamp() {
    const now = new Date();
    this.elements.timestamp.textContent = now.toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  }

  appendLogToUI(log, index = this.filteredLogs.length - 1) {
    // Clear empty state if it exists
    const emptyState = this.elements.logsList.querySelector('.empty-state');
    if (emptyState) {
      emptyState.remove();
    }

    const data = log.data || log;
    const timestamp = new Date(data.timestamp).toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      fractionalSecondDigits: 3
    });

    const logEntry = document.createElement('div');
    // Map log/console levels to our levels
    const level = data.level || 'info';
    const levelMap = {
      'log': 'info',
      'console': 'info',
      'trace': 'verbose'
    };
    const finalLevel = levelMap[level] || level;

    logEntry.className = `log-entry ${finalLevel} fade-in`;
    logEntry.dataset.index = index;

    // Build log entry HTML with dark theme styling
    let logHTML = `
      <span class="log-level"></span>
      <span class="log-time">${timestamp}</span>
      <span class="log-message">${this.escapeHtml(data.message)}</span>
    `;

    // Add location if available
    if (data.file) {
      logHTML += `<span class="log-location" title="${data.file}:${data.line || '?'}:${data.column || '?'}">${data.file.split('/').pop()}:${data.line || '?'}</span>`;
    }

    logEntry.innerHTML = logHTML;

    // Add AI analysis as a separate element if enabled
    if (this.filters.showAIAnalysis && data.analysis) {
      const aiElement = document.createElement('div');
      aiElement.className = 'ai-analysis' + (data.aiThinking ? ' ai-thinking' : '');
      aiElement.setAttribute('data-log-timestamp', data.timestamp); // For updates

      if (data.aiThinking) {
        // Show thinking animation
        aiElement.innerHTML = `
          <span class="ai-icon thinking-dots">🤔</span>
          <span class="ai-text thinking-text">AI is analyzing...</span>
        `;
      } else {
        // Show analysis
        aiElement.innerHTML = `
          <span class="ai-icon">✨</span>
          <span class="ai-text">${this.escapeHtml(data.analysis)}</span>
        `;
      }
      logEntry.appendChild(aiElement);
    }

    // Add click handler
    logEntry.addEventListener('click', () => {
      this.selectLog(index);
    });

    // Smooth scroll animation
    this.elements.logsList.appendChild(logEntry);
    logEntry.scrollIntoView({ behavior: 'smooth', block: 'end' });

    // Update filter chip counts
    this.updateFilterCounts();
  }

  updateFilterCounts() {
    const counts = {
      verbose: 0,
      debug: 0,
      info: 0,
      warn: 0,
      error: 0,
      assert: 0
    };

    this.logs.forEach(log => {
      const data = log.data || log;
      const level = data.level || 'info';
      const levelMap = {
        'log': 'info',
        'console': 'info',
        'trace': 'verbose'
      };
      const finalLevel = levelMap[level] || level;
      if (counts[finalLevel] !== undefined) {
        counts[finalLevel]++;
      }
    });

    // Update chip counts
    this.elements.filterChips.forEach(chip => {
      const level = chip.dataset.level;
      const countElement = chip.querySelector('.filter-count');
      if (countElement) {
        countElement.textContent = counts[level] || 0;
      }
    });
  }

  selectLog(index) {
    if (index < 0 || index >= this.filteredLogs.length) return;

    // Remove previous selection
    document.querySelectorAll('.log-entry.selected').forEach(el => {
      el.classList.remove('selected');
    });

    // Add new selection
    const logEntry = this.elements.logsList.children[index];
    if (logEntry) {
      logEntry.classList.add('selected');
      logEntry.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    this.selectedLogIndex = index;
    this.showLogDetails(this.filteredLogs[index]);
  }

  showLogDetails(log) {
    const data = log.data || log;
    this.elements.detailsPanel.style.display = 'block';

    let detailsHTML = '';

    // Basic info
    detailsHTML += `
      <div class="detail-section">
        <strong>Message</strong>
        <div class="detail-value">${this.escapeHtml(data.message)}</div>
      </div>
    `;

    // AI Analysis
    if (data.analysis) {
      detailsHTML += `
        <div class="detail-section">
          <strong>🤖 AI Analysis</strong>
          <div class="detail-value" style="background: #1a1b26; color: #a9b1d6; border: 1px solid #414868; padding: 12px; border-radius: 6px; font-family: 'Monaco', 'Menlo', monospace; line-height: 1.6;">
            ${this.escapeHtml(data.analysis)}
          </div>
        </div>
      `;
    }

    // Location
    if (data.file) {
      detailsHTML += `
        <div class="detail-section">
          <strong>Location</strong>
          <div class="detail-value">
            ${data.file}:${data.line || '?'}:${data.column || '?'}
          </div>
        </div>
      `;
    }

    // Stack trace
    if (data.stack) {
      detailsHTML += `
        <div class="detail-section">
          <strong>Stack Trace</strong>
          <pre class="stack-trace">${this.escapeHtml(data.stack)}</pre>
        </div>
      `;
    }

    // DOM Context
    if (data.domNode) {
      detailsHTML += `
        <div class="detail-section">
          <strong>DOM Context</strong>
          <div class="detail-value">
            &lt;${data.domNode.tag} ${data.domNode.id ? `id="${data.domNode.id}"` : ''} ${data.domNode.class ? `class="${data.domNode.class}"` : ''}&gt;
            ${data.domNode.xpath ? `<div class="xpath">XPath: ${data.domNode.xpath}</div>` : ''}
          </div>
        </div>
      `;
    }

    // DOM Snapshot for visual debugging
    if (data.domSnapshot) {
      const snapshot = data.domSnapshot;
      detailsHTML += `
        <div class="detail-section">
          <strong>🖼️ DOM Preview</strong>
          <div class="dom-preview" style="background: #1a1b26; border: 1px solid #414868; border-radius: 6px; padding: 12px; margin-top: 8px;">

            ${snapshot.elementPath ? `
              <div style="color: #7aa2f7; font-family: monospace; font-size: 12px; margin-bottom: 8px;">
                <strong>Element Path:</strong> ${this.escapeHtml(snapshot.elementPath)}
              </div>
            ` : ''}

            ${snapshot.boundingBox ? `
              <div style="color: #bb9af7; font-family: monospace; font-size: 12px; margin-bottom: 8px;">
                <strong>Position:</strong>
                ${Math.round(snapshot.boundingBox.x)}×${Math.round(snapshot.boundingBox.y)}
                • <strong>Size:</strong>
                ${Math.round(snapshot.boundingBox.width)}×${Math.round(snapshot.boundingBox.height)}
              </div>
            ` : ''}

            ${snapshot.html ? `
              <details style="margin-top: 8px;">
                <summary style="color: #9ece6a; cursor: pointer; user-select: none;">
                  HTML Preview (click to expand)
                </summary>
                <pre style="color: #a9b1d6; font-size: 11px; overflow-x: auto; white-space: pre-wrap; margin-top: 8px; padding: 8px; background: #16161e; border-radius: 4px;">
${this.escapeHtml(this.formatHTML(snapshot.html))}
                </pre>
              </details>
            ` : ''}

            ${snapshot.computedStyles && Object.keys(snapshot.computedStyles).length > 0 ? `
              <details style="margin-top: 8px;">
                <summary style="color: #f7768e; cursor: pointer; user-select: none;">
                  Computed Styles (click to expand)
                </summary>
                <div style="color: #a9b1d6; font-size: 11px; margin-top: 8px; padding: 8px; background: #16161e; border-radius: 4px;">
                  ${Object.entries(snapshot.computedStyles)
                    .map(([key, value]) => `<div><strong style="color: #7aa2f7;">${key}:</strong> ${this.escapeHtml(value)}</div>`)
                    .join('')}
                </div>
              </details>
            ` : ''}

            ${snapshot.screenshot ? `
              <div style="margin-top: 8px;">
                <strong style="color: #73daca;">Screenshot:</strong>
                <img src="${snapshot.screenshot}" alt="Element screenshot" style="max-width: 100%; border: 1px solid #414868; border-radius: 4px; margin-top: 4px;">
              </div>
            ` : ''}

            ${!snapshot.elementPath && !snapshot.html && !snapshot.boundingBox && !snapshot.computedStyles && !snapshot.screenshot ? `
              <div style="color: #f7768e; font-style: italic; text-align: center; padding: 16px;">
                ⚠️ No DOM element found for this error<br>
                <span style="font-size: 11px; color: #9aa5ce;">
                  The error may not be directly related to a specific DOM element.
                </span>
              </div>
            ` : ''}
          </div>
        </div>
      `;
    }

    // Dependencies
    if (data.dependencies && data.dependencies.length > 0) {
      detailsHTML += `
        <div class="detail-section">
          <strong>Dependencies</strong>
          <div class="detail-value">
            ${data.dependencies.join(', ')}
          </div>
        </div>
      `;
    }

    // Patterns
    if (data.patterns && data.patterns.length > 0) {
      detailsHTML += `
        <div class="detail-section">
          <strong>⚠️ Detected Patterns</strong>
          <div class="detail-value" style="background: #fff3e0;">
            ${data.patterns.join('<br>')}
          </div>
        </div>
      `;
    }

    // Metadata
    detailsHTML += `
      <div class="detail-section">
        <strong>Metadata</strong>
        <div class="detail-value">
          <div>URL: ${data.url || 'N/A'}</div>
          <div>Timestamp: ${new Date(data.timestamp).toLocaleString()}</div>
          <div>Level: ${data.level || 'log'}</div>
          <div>User Agent: ${(data.userAgent || '').substring(0, 50)}...</div>
        </div>
      </div>
    `;

    this.elements.detailsContent.innerHTML = detailsHTML;
  }

  updateLogCount() {
    const total = this.logs.length;
    const filtered = this.filteredLogs.length;

    if (total === filtered) {
      this.elements.logCount.textContent = `${total} logs`;
    } else {
      this.elements.logCount.textContent = `${filtered} of ${total} logs`;
    }
  }

  exportLogs() {
    const exportData = {
      timestamp: new Date().toISOString(),
      url: chrome.devtools.inspectedWindow.tabId,
      logs: this.filteredLogs,
      filters: {
        levels: Array.from(this.filters.levels),
        searchText: this.filters.searchText
      }
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);

    const link = document.createElement('a');
    link.setAttribute('href', dataUri);
    link.setAttribute('download', `mosqit-logs-${Date.now()}.json`);
    link.click();
  }

  escapeHtml(text) {
    const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    };
    return String(text).replace(/[&<>"']/g, m => map[m]);
  }

  formatHTML(html) {
    // Pretty format HTML with indentation
    let formatted = '';
    let indent = 0;
    const lines = html.replace(/></g, '>\n<').split('\n');

    lines.forEach(line => {
      const trimmed = line.trim();

      // Decrease indent for closing tags
      if (trimmed.startsWith('</')) {
        indent = Math.max(0, indent - 2);
      }

      // Add indentation
      if (trimmed) {
        formatted += ' '.repeat(indent) + trimmed + '\n';
      }

      // Increase indent for opening tags (not self-closing)
      if (trimmed.startsWith('<') && !trimmed.startsWith('</') &&
          !trimmed.endsWith('/>') && !trimmed.includes('</')) {
        indent += 2;
      }
    });

    return formatted.trim();
  }

  // Visual Bug Reporter Methods
  toggleVisualBugReporter() {
    this.visualBugMode = !this.visualBugMode;
    const logsPanel = document.getElementById('logs-panel');
    const visualBugPanel = document.getElementById('visual-bug-panel');
    const visualBugBtn = document.getElementById('visual-bug-btn');

    if (this.visualBugMode) {
      // Show Visual Bug Reporter
      logsPanel.style.display = 'none';
      visualBugPanel.style.display = 'block';
      visualBugBtn.classList.add('active');

      // Hide details panel if open
      this.elements.detailsPanel.style.display = 'none';
    } else {
      // Show Logs
      logsPanel.style.display = 'block';
      visualBugPanel.style.display = 'none';
      visualBugBtn.classList.remove('active');
    }
  }

  startVisualCapture() {
    console.log('[Mosqit] Starting element capture mode...');

    // Check if context is still valid
    try {
      // Get the inspected tab ID
      const tabId = chrome.devtools.inspectedWindow.tabId;

      // Use our native inspector (no CDP needed)
      this.startNativeInspector(tabId);
    } catch (error) {
      console.error('[Mosqit] Error in startVisualCapture:', error);
      this.updateCaptureStatus('Error: Extension context lost. Please reload DevTools.');
    }
  }

  startNativeInspector(tabId) {
    console.log('[Mosqit] Starting native inspector for tab:', tabId);

    // Inject the native inspector script
    chrome.runtime.sendMessage({
      type: 'INJECT_NATIVE_INSPECTOR',
      tabId: tabId
    }, (response) => {
      if (chrome.runtime.lastError) {
        console.error('[Mosqit] Failed to inject native inspector:', chrome.runtime.lastError);
        this.updateCaptureStatus('Error: Failed to inject inspector. Please refresh the page.');
        return;
      }

      if (response?.success) {
        // Wait a bit for the script to initialize
        setTimeout(() => {
          // Send start message to native inspector
          chrome.tabs.sendMessage(tabId, {
            type: 'START_NATIVE_INSPECT',
            source: 'mosqit-devtools',
            options: { multiSelect: false }
          }, (response) => {
            if (chrome.runtime.lastError) {
              console.error('[Mosqit] Failed to start native inspect:', chrome.runtime.lastError);
              console.error('[Mosqit] Error details:', chrome.runtime.lastError.message);

              // More specific error messages
              if (chrome.runtime.lastError.message.includes('Receiving end does not exist')) {
                this.updateCaptureStatus('Error: Content script not loaded. Please refresh the page and try again.');
              } else if (chrome.runtime.lastError.message.includes('context invalidated')) {
                this.updateCaptureStatus('Error: Extension was reloaded. Please close and reopen DevTools.');
              } else {
                this.updateCaptureStatus('Error: ' + chrome.runtime.lastError.message);
              }

              // No fallback - native inspector should work
            } else if (response?.success) {
              console.log('[Mosqit] Native inspect started successfully');
              this.updateCaptureStatus('Click an element on the page to capture');
            } else {
              console.log('[Mosqit] Native inspect response:', response);
              this.updateCaptureStatus('Inspect mode activated - click an element');
            }
          });
        }, 500); // Give the script time to initialize

        // Listen for element selection
        if (!this.nativeInspectorListener) {
          this.nativeInspectorListener = (event) => {
            if (event.source !== window) return;

            if (event.data?.source === 'mosqit-native-inspector') {
              if (event.data.type === 'ELEMENT_SELECTED') {
                console.log('[Mosqit] Element selected:', event.data.data);
                this.handleFallbackElementSelection(event.data.data);
              } else if (event.data.type === 'INSPECTION_COMPLETE') {
                console.log('[Mosqit] Inspection complete:', event.data.data);
                this.handleInspectionComplete(event.data.data);
              }
            }
          };
          window.addEventListener('message', this.nativeInspectorListener);
        }
      } else {
        this.updateCaptureStatus('Error: ' + (response?.error || 'Failed to inject inspector.'));
      }
    });
  }

  handleFallbackElementSelection(elementData) {
    console.log('[Mosqit] Processing fallback element selection:', elementData);

    // Transform to bug data format
    const bugData = {
      element: elementData,
      screenshot: null,
      page: {
        url: window.location.href,
        title: document.title
      },
      timestamp: Date.now()
    };

    this.handleCapturedBug(bugData);
  }

  handleInspectionComplete(data) {
    console.log('[Mosqit] Inspection completed with elements:', data.elements);

    if (data.elements && data.elements.length > 0) {
      // For now, use the first element
      // Could be extended to handle multiple elements
      this.handleFallbackElementSelection(data.elements[0]);
    }
  }


  updateCaptureStatus(message) {
    const captureSection = document.getElementById('vb-capture-section');
    const helpText = captureSection.querySelector('.vb-help');
    if (helpText) {
      helpText.textContent = message;
      helpText.style.color = '#667eea';
    }
  }

  handleCapturedBug(bugData) {
    console.log('[Mosqit] Bug captured:', bugData);
    this.capturedBug = bugData;

    // Hide capture section, show content
    document.getElementById('vb-capture-section').style.display = 'none';
    document.getElementById('vb-content').style.display = 'block';

    // Populate the bug report form
    this.populateBugReport(bugData);
  }

  populateBugReport(bugData) {
    const content = document.getElementById('vb-content');

    content.innerHTML = `
      <div class="vb-section">
        <h3>📸 Screenshot</h3>
        <div class="vb-screenshot">
          ${bugData.screenshot ?
            `<img src="${bugData.screenshot}" alt="Captured element">` :
            '<div class="vb-placeholder">Screenshot will appear here</div>'
          }
          <button class="vb-annotate-btn" id="vb-annotate">✏️ Annotate</button>
        </div>
      </div>

      <div class="vb-section">
        <h3>🎯 Element Details</h3>
        <div class="vb-info-grid">
          <div class="vb-info-item">
            <label>Selector:</label>
            <code>${bugData.element?.selector || 'N/A'}</code>
          </div>
          <div class="vb-info-item">
            <label>Size:</label>
            <span>${bugData.element?.position?.width || 0} × ${bugData.element?.position?.height || 0}px</span>
          </div>
          <div class="vb-info-item">
            <label>Background:</label>
            <span style="display: flex; align-items: center; gap: 8px;">
              ${bugData.element?.styles?.backgroundColor || 'transparent'}
              <span style="width: 20px; height: 20px; background: ${bugData.element?.styles?.backgroundColor}; border: 1px solid #ccc; border-radius: 4px;"></span>
            </span>
          </div>
          <div class="vb-info-item">
            <label>Position:</label>
            <span>${Math.round(bugData.element?.position?.x || 0)}, ${Math.round(bugData.element?.position?.y || 0)}</span>
          </div>
        </div>
      </div>

      <div class="vb-section">
        <h3>✏️ Describe the Issue</h3>
        <div class="vb-issue-types">
          <label><input type="checkbox" name="issue" value="color"> Color/Styling</label>
          <label><input type="checkbox" name="issue" value="alignment"> Alignment/Spacing</label>
          <label><input type="checkbox" name="issue" value="missing"> Missing element</label>
          <label><input type="checkbox" name="issue" value="text"> Wrong text</label>
          <label><input type="checkbox" name="issue" value="broken"> Not working</label>
        </div>
        <textarea id="vb-description" placeholder="What's wrong with this element?" rows="3"></textarea>
        <textarea id="vb-expected" placeholder="What should it look like/do?" rows="2"></textarea>
      </div>

      <div class="vb-section">
        <h3>⚠️ Impact</h3>
        <div class="vb-impact">
          <label><input type="radio" name="impact" value="critical"> 🔴 Critical</label>
          <label><input type="radio" name="impact" value="high"> 🟠 High</label>
          <label><input type="radio" name="impact" value="medium" checked> 🟡 Medium</label>
          <label><input type="radio" name="impact" value="low"> 🟢 Low</label>
        </div>
      </div>

      <div class="vb-actions">
        <button class="vb-btn secondary" id="vb-cancel">Cancel</button>
        <button class="vb-btn primary" id="vb-generate">🤖 Generate Issue</button>
        <button class="vb-btn success" id="vb-submit" disabled>📤 Submit to GitHub</button>
      </div>

      <div class="vb-preview" id="vb-preview" style="display: none;">
        <h3>📋 Generated Issue</h3>
        <div class="vb-issue-content" id="vb-issue-content"></div>
      </div>
    `;

    // Add event listeners for the new elements
    this.setupBugReportHandlers();
  }

  setupBugReportHandlers() {
    // Annotate button
    const annotateBtn = document.getElementById('vb-annotate');
    if (annotateBtn && this.capturedBug?.screenshot) {
      annotateBtn.addEventListener('click', () => {
        this.openAnnotationCanvas(this.capturedBug.screenshot);
      });
    }

    // Cancel button
    const cancelBtn = document.getElementById('vb-cancel');
    if (cancelBtn) {
      cancelBtn.addEventListener('click', () => {
        this.cancelBugReport();
      });
    }

    // Generate button
    const generateBtn = document.getElementById('vb-generate');
    if (generateBtn) {
      generateBtn.addEventListener('click', () => {
        this.generateGitHubIssue();
      });
    }

    // Submit button
    const submitBtn = document.getElementById('vb-submit');
    if (submitBtn) {
      submitBtn.addEventListener('click', () => {
        this.submitToGitHub();
      });
    }
  }

  openAnnotationCanvas() {
    // Send message to content script to open annotation canvas
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        chrome.tabs.sendMessage(tabs[0].id, {
          type: 'OPEN_ANNOTATION_CANVAS',
          screenshot: this.capturedBug?.screenshot
        });
      }
    });
  }

  cancelBugReport() {
    // Reset and go back to capture mode
    document.getElementById('vb-capture-section').style.display = 'block';
    document.getElementById('vb-content').style.display = 'none';
    this.capturedBug = null;
  }

  async generateGitHubIssue() {
    const description = document.getElementById('vb-description').value;
    const expected = document.getElementById('vb-expected').value;
    const issueTypes = Array.from(document.querySelectorAll('input[name="issue"]:checked'))
      .map(cb => cb.value);
    const impact = document.querySelector('input[name="impact"]:checked')?.value || 'medium';

    if (!description) {
      alert('Please describe the issue');
      return;
    }

    // Show loading state
    const generateBtn = document.getElementById('vb-generate');
    const originalText = generateBtn.textContent;
    generateBtn.disabled = true;
    generateBtn.innerHTML = '🤖 AI generating issue...';

    try {
      // Generate intelligent title and description using AI
      const aiContext = {
        userDescription: description,
        expected: expected,
        element: this.capturedBug?.element,
        errors: this.collectRecentErrors().slice(0, 2),
        issueTypes: issueTypes,
        impact: impact,
        url: this.capturedBug?.page?.url || window.location.href
      };

      const { title, enhancedDescription } = await this.generateAITitle(aiContext);

      // Create comprehensive issue content with AI insights
      const issue = await this.createIssueContent({
        ...this.capturedBug,
        description: enhancedDescription || description,
        expected,
        issueTypes,
        impact,
        aiGeneratedTitle: title
      });

      // Display the generated issue with AI title
      const preview = document.getElementById('vb-preview');
      const content = document.getElementById('vb-issue-content');

      content.innerHTML = `
        <div class="ai-generated-header">
          <h3>${title}</h3>
          <div class="header-actions">
            <span class="ai-badge">✨ AI Generated</span>
            <button class="copy-btn" onclick="window.mosqitPanel.copyIssueContent()" title="Copy issue content">📋 Copy</button>
          </div>
        </div>
        <div id="issue-content-text" class="markdown-content" data-original-markdown="${issue.replace(/"/g, '&quot;')}">${this.renderMarkdown(issue)}</div>
      `;
      preview.style.display = 'block';

      // Enable submit button
      document.getElementById('vb-submit').disabled = false;

    } catch (error) {
      console.error('[Mosqit] AI generation failed:', error);
      // Fallback to simple method
      const issue = await this.createIssueContent({
        ...this.capturedBug,
        description,
        expected,
        issueTypes,
        impact
      });

      const preview = document.getElementById('vb-preview');
      const content = document.getElementById('vb-issue-content');
      content.innerHTML = `
        <div class="ai-generated-header">
          <h3>[Bug]: ${description.substring(0, 60)}${description.length > 60 ? '...' : ''}</h3>
          <div class="header-actions">
            <button class="copy-btn" onclick="window.mosqitPanel.copyIssueContent()" title="Copy issue content">📋 Copy</button>
          </div>
        </div>
        <div id="issue-content-text" class="markdown-content" data-original-markdown="${issue.replace(/"/g, '&quot;')}">${this.renderMarkdown(issue)}</div>
      `;
      preview.style.display = 'block';
      document.getElementById('vb-submit').disabled = false;
    } finally {
      // Restore button
      generateBtn.disabled = false;
      generateBtn.innerHTML = originalText;
    }
  }

  async createIssueContent(bugData) {
    // Collect only relevant error data for debugging
    const recentErrors = this.collectRecentErrors().slice(0, 3); // Only top 3 errors
    const hasErrors = recentErrors.length > 0;

    // Get AI analysis - first check if we already have it from content script
    let aiAnalysis = null;

    // Check if recent errors already have AI analysis from content script
    if (recentErrors && recentErrors.length > 0 && recentErrors[0].analysis) {
      console.log('[Mosqit] Using existing AI analysis from content script');
      aiAnalysis = recentErrors[0].analysis;
    } else {
      // Try to generate new analysis (may fail in DevTools context)
      aiAnalysis = await this.getAIAnalysisForBug(bugData, recentErrors);
    }

    // Follow GitHub best practices for issue structure
    let body = `## Bug Description
${bugData.description}

## Expected Behavior
${bugData.expected || 'The element should respond correctly to user interaction.'}

## Steps to Reproduce
1. Navigate to \`${bugData.page?.url}\`
2. ${bugData.description.includes('click') ? 'Click on' : 'Interact with'} element: \`${bugData.element?.selector || 'the affected element'}\`
3. Observe the unexpected behavior

## Current Behavior
${bugData.description}

## Environment
- **URL**: ${bugData.page?.url || window.location.href}
- **Browser**: ${this.getBrowserInfo(bugData.page?.userAgent)}
- **Viewport**: ${bugData.page?.viewport?.width}×${bugData.page?.viewport?.height}
- **Element**: \`${bugData.element?.selector || 'No specific element selected'}\`
- **Position**: (${Math.round(bugData.element?.position?.x || 0)}, ${Math.round(bugData.element?.position?.y || 0)})
`;

    // Console errors section
    if (hasErrors) {
      body += `
## Console Errors
\`\`\`
${recentErrors.map(err => {
  const location = err.file ? `${err.file}:${err.line}:${err.column}` : 'unknown location';
  return `${err.message.substring(0, 200)}\n  at ${location}`;
}).join('\n\n')}
\`\`\`
`;

      // Add stack trace for the most relevant error
      const primaryError = recentErrors[0];
      if (primaryError.stack) {
        const stackLines = primaryError.stack.split('\n').slice(0, 8).join('\n');
        body += `
<details>
<summary>Stack Trace</summary>

\`\`\`
${stackLines}
\`\`\`
</details>
`;
      }
    } else {
      body += `
## Console Errors
_No JavaScript errors detected in the console during bug capture._

**Note**: This doesn't mean there's no bug - visual/UX issues often occur without console errors.
`;
    }

    // Screenshot is already displayed in the UI above, no need to duplicate it in the issue content
    // The screenshot will be uploaded and inserted when actually submitting to GitHub

    // AI Analysis section
    if (aiAnalysis && aiAnalysis.length > 0) {
      body += `
## AI Analysis
${aiAnalysis}
`;
    } else {
      body += `
## AI Analysis
🤖 **Visual/UX Bug Detected**

While no JavaScript errors were found, the reported issue appears to be related to:
• Visual rendering or styling
• User interaction behavior
• Element positioning or visibility

**Recommended debugging steps:**
1. Inspect element CSS for display/visibility issues
2. Check event listeners on the element
3. Verify responsive design breakpoints
4. Test browser compatibility
`;
    }

    // Code Context (if available)
    if (hasErrors) {
      const relevantFiles = [...new Set(recentErrors
        .filter(err => err.file)
        .map(err => err.file)
      )];

      if (relevantFiles.length > 0) {
        body += `
## Affected Files
${relevantFiles.map(file => `- \`${file}\``).join('\n')}
`;
      }
    }

    // Priority and classification
    body += `
## Priority & Impact
- **Impact Level**: ${bugData.impact.charAt(0).toUpperCase() + bugData.impact.slice(1)}
- **Issue Types**: ${bugData.issueTypes.join(', ')}
`;

    // Additional context for high priority issues
    if (bugData.impact === 'critical' || bugData.impact === 'high') {
      body += `- **Urgency**: This issue affects user functionality and should be prioritized
`;
    }

    // Developer Information and Next Steps
    body += `
## Developer Notes
**To reproduce this issue:**
1. Open the affected URL: \`${bugData.page?.url}\`
2. Open browser DevTools (F12)
3. Look for the element: \`${bugData.element?.selector}\`
4. Check console for errors related to the reported functionality

**Debugging checklist:**
- [ ] Verify element exists and is accessible
- [ ] Check for JavaScript errors in console
- [ ] Inspect network requests for failures
- [ ] Validate CSS styling and layout
- [ ] Test across different browsers/devices

## Additional Information
- **Captured at**: ${new Date().toLocaleString()}
- **User Agent**: ${this.getBrowserInfo(bugData.page?.userAgent)}
- **Page Title**: ${bugData.page?.title || document.title}
- **Reported via**: [Mosqit Visual Bug Reporter](https://github.com/your-org/mosqit)

<!--
This issue was automatically generated by Mosqit Visual Bug Reporter
Element selector: ${bugData.element?.selector || 'N/A'}
Page title: ${bugData.page?.title || document.title}
-->
`;

    return body;
  }

  getImpactDescription(impact) {
    const descriptions = {
      critical: 'Blocks critical user functionality',
      high: 'Major visual issue affecting user experience',
      medium: 'Noticeable issue that should be fixed',
      low: 'Minor polish needed'
    };
    return descriptions[impact] || 'Visual issue';
  }

  getBrowserInfo(userAgent) {
    const ua = userAgent || navigator.userAgent;

    // Extract browser name and version
    if (ua.includes('Chrome')) {
      const match = ua.match(/Chrome\/(\d+)/);
      return `Chrome ${match ? match[1] : 'Unknown'}`;
    } else if (ua.includes('Firefox')) {
      const match = ua.match(/Firefox\/(\d+)/);
      return `Firefox ${match ? match[1] : 'Unknown'}`;
    } else if (ua.includes('Safari') && !ua.includes('Chrome')) {
      const match = ua.match(/Version\/(\d+)/);
      return `Safari ${match ? match[1] : 'Unknown'}`;
    } else if (ua.includes('Edge')) {
      const match = ua.match(/Edge\/(\d+)/);
      return `Edge ${match ? match[1] : 'Unknown'}`;
    }

    return 'Unknown Browser';
  }

  async generateAITitle(context) {
    console.log('[Mosqit] Attempting to generate AI title...');
    try {
      // Build a comprehensive context for AI analysis
      this.buildAIContext(context);

      let session = null;
      let aiType = null;

      // Try Chrome AI Assistant first
      if (typeof window !== 'undefined' && window.ai?.assistant) {
        try {
          const capabilities = await window.ai.assistant.capabilities();
          if (capabilities.available === 'readily') {
            session = await window.ai.assistant.create();
            aiType = 'assistant';
            console.log('[Mosqit] Using Assistant for title generation');
          }
        } catch (e) {
          console.log('[Mosqit] Assistant not available for title:', e.message);
        }
      }

      // Try Language Model API
      if (!session && window.ai?.languageModel) {
        try {
          session = await window.ai.languageModel.create({
            systemPrompt: `You are a GitHub issue expert. Generate a concise, descriptive bug report title and enhanced description.

Rules:
- Title: 50-80 characters, specific and actionable
- Format: [Bug]: Clear description of the problem
- Include element type if UI-related
- Focus on the impact, not generic terms
- Use technical terms appropriately

Example good titles:
- [Bug]: Login button unresponsive on mobile viewport
- [Bug]: Form validation errors not clearing after correction
- [Bug]: Navigation menu overlaps content on scroll
- [Bug]: API timeout causes blank dashboard on load

Context will include: user description, element selector, console errors, page URL, impact level.`
          });
          aiType = 'languageModel';
          console.log('[Mosqit] Using Language Model for title generation');
        } catch (e) {
          console.log('[Mosqit] Language Model not available for title:', e.message);
        }
      }

      if (!session) {
        console.log('[Mosqit] No AI available for title generation');
        return this.generateFallbackTitle(context);
      }

      const prompt = `Generate a GitHub issue title and enhanced description for this bug:

User Description: "${context.userDescription}"
Expected: "${context.expected || 'Not specified'}"
Element: "${context.element?.selector || 'No specific element'}"
URL: "${context.url}"
Impact: ${context.impact}
Issue Types: ${context.issueTypes.join(', ')}
${context.errors.length > 0 ? 'Console Errors: ' + context.errors.map(e => e.message.substring(0, 100)).join('; ') : 'No console errors'}

Return JSON format:
{
  "title": "Generated title here",
  "enhancedDescription": "Enhanced description with technical details"
}`;

        let response;
        if (aiType === 'assistant' || aiType === 'languageModel') {
          response = await session.prompt(prompt);
          if (session.destroy) await session.destroy();
        } else {
          // Writer API doesn't support JSON format well, use fallback
          console.log('[Mosqit] Writer API not suitable for title generation');
          return this.generateFallbackTitle(context);
        }

      try {
        const result = JSON.parse(response);
        return {
          title: result.title || this.formatIssueTitle('Visual Bug Report', context),
          enhancedDescription: result.enhancedDescription || context.userDescription
        };
      } catch {
        console.warn('[Mosqit] Failed to parse AI response, using fallback');
        return this.generateFallbackTitle(context);
      }
    } catch (error) {
      console.error('[Mosqit] AI title generation failed:', error);
      return this.generateFallbackTitle(context);
    }
  }

  generateFallbackTitle(context) {
    // Smart fallback based on available context
    let title = context.userDescription;

    // Enhance with element info if available
    if (context.element?.selector) {
      const elementType = this.getElementType(context.element.selector);
      if (elementType) {
        title = `${elementType} issue: ${title}`;
      }
    }

    // Add impact context for high priority
    if (context.impact === 'critical') {
      title = `Critical: ${title}`;
    } else if (context.impact === 'high') {
      title = `High Priority: ${title}`;
    }

    // Clean and truncate
    title = title.substring(0, 80).trim();
    if (title.length === 80) title += '...';

    return {
      title: `[Bug]: ${title}`,
      enhancedDescription: context.userDescription
    };
  }

  getElementType(selector) {
    if (selector.includes('button')) return 'Button';
    if (selector.includes('input')) return 'Input field';
    if (selector.includes('form')) return 'Form';
    if (selector.includes('nav')) return 'Navigation';
    if (selector.includes('modal') || selector.includes('dialog')) return 'Modal/Dialog';
    if (selector.includes('dropdown') || selector.includes('select')) return 'Dropdown';
    if (selector.includes('menu')) return 'Menu';
    if (selector.includes('card')) return 'Card component';
    return null;
  }

  buildAIContext(context) {
    return {
      description: context.userDescription,
      element: context.element?.selector,
      errors: context.errors?.map(e => e.message.substring(0, 150)),
      url: context.url,
      impact: context.impact,
      issueTypes: context.issueTypes
    };
  }

  copyIssueContent() {
    // Get the raw markdown content stored when the issue was generated
    const issueContentElement = document.getElementById('issue-content-text');
    if (!issueContentElement) {
      console.warn('[Mosqit] Issue content element not found');
      return;
    }

    // Use the original markdown text stored in data attribute, or fallback to text content
    const textContent = issueContentElement.dataset.originalMarkdown ||
                       issueContentElement.textContent ||
                       issueContentElement.innerText;

    // Use the Clipboard API if available
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(textContent).then(() => {
        this.showCopyFeedback(true);
      }).catch(err => {
        console.error('[Mosqit] Failed to copy with Clipboard API:', err);
        this.fallbackCopyMethod(textContent);
      });
    } else {
      // Fallback method for older browsers
      this.fallbackCopyMethod(textContent);
    }
  }

  fallbackCopyMethod(text) {
    try {
      // Create a temporary textarea element
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.left = '-999999px';
      textarea.style.top = '-999999px';
      document.body.appendChild(textarea);

      // Select and copy the text
      textarea.focus();
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);

      this.showCopyFeedback(true);
    } catch (err) {
      console.error('[Mosqit] Fallback copy failed:', err);
      this.showCopyFeedback(false);
    }
  }

  showCopyFeedback(success) {
    const copyBtn = document.querySelector('.copy-btn');
    if (!copyBtn) return;

    const originalText = copyBtn.innerHTML;

    if (success) {
      copyBtn.innerHTML = '✅ Copied!';
      copyBtn.style.background = '#10b981';
    } else {
      copyBtn.innerHTML = '❌ Failed';
      copyBtn.style.background = '#ef4444';
    }

    // Reset after 2 seconds
    setTimeout(() => {
      copyBtn.innerHTML = originalText;
      copyBtn.style.background = '';
    }, 2000);
  }

  renderMarkdown(text) {
    if (!text) return '';

    // Simple markdown rendering - just display as formatted text
    return `<pre class="markdown-text">${text}</pre>`;
  }

  formatIssueTitle(rawTitle, bugData) {
    // Check if title already has [Bug]: prefix
    if (rawTitle.startsWith('[Bug]:')) {
      return rawTitle; // Already formatted, return as-is
    }

    // Follow GitHub best practices: [Bug]: Descriptive title
    const description = bugData?.description || rawTitle;

    // Extract key information for a descriptive title
    let title = description.length > 80 ?
      description.substring(0, 77) + '...' : // Leave room for [Bug]: prefix
      description;

    // Clean up title - remove line breaks and extra spaces
    title = title.replace(/\n/g, ' ').replace(/\s+/g, ' ').trim();

    // Only add element context if not already mentioned in the title
    const element = bugData?.element?.selector;
    if (element && element !== 'No specific element selected' && !title.toLowerCase().includes(element.toLowerCase())) {
      const shortElement = element.length > 20 ?
        element.substring(0, 20) + '...' :
        element;

      // Only add if there's room
      if (title.length + shortElement.length < 70) {
        title += ` (${shortElement})`;
      }
    }

    return `[Bug]: ${title}`;
  }

  async getAIAnalysisForBug(bugData, errors) {
    console.log('[Mosqit] Attempting AI analysis for bug...');

    // Try to analyze the complete bug context, not just errors
    try {
      // Check for available AI APIs - try multiple options
      let session = null;
      let aiType = null;

      // Try Chrome AI Assistant (Prompt API)
      if (typeof window !== 'undefined' && window.ai?.assistant) {
        console.log('[Mosqit] Trying Chrome AI Assistant...');
        try {
          const capabilities = await window.ai.assistant.capabilities();
          if (capabilities.available === 'readily') {
            session = await window.ai.assistant.create();
            aiType = 'assistant';
            console.log('[Mosqit] Using Chrome AI Assistant');
          }
        } catch (e) {
          console.log('[Mosqit] Assistant not available:', e.message);
        }
      }

      // Try Language Model API (newer name)
      if (!session && window.ai?.languageModel) {
        console.log('[Mosqit] Trying Language Model API...');
        try {
          session = await window.ai.languageModel.create({
            systemPrompt: `You are a debugging expert. Analyze bug reports and provide actionable insights.`
          });
          aiType = 'languageModel';
          console.log('[Mosqit] Using Language Model API');
        } catch (e) {
          console.log('[Mosqit] Language Model not available:', e.message);
        }
      }

      // Try Writer API as fallback
      if (!session && window.ai?.writer) {
        console.log('[Mosqit] Trying Writer API...');
        try {
          const capabilities = await window.ai.writer.capabilities();
          console.log('[Mosqit] Writer capabilities:', capabilities);

          if (capabilities.available === 'readily' || capabilities.available === 'available') {
            // Store as class property for reuse
            if (!this.writerSession) {
              this.writerSession = await window.ai.writer.create({
                tone: 'neutral',
                format: 'plain-text',
                length: 'medium',
                sharedContext: 'You are Mosqit, a debugging assistant analyzing bug reports.'
              });
              console.log('[Mosqit] Created new Writer session');
            }
            session = this.writerSession;
            aiType = 'writer';
            console.log('[Mosqit] Using Writer API for bug analysis');
          } else if (capabilities.available === 'after-download') {
            console.log('[Mosqit] Writer API requires model download');
          }
        } catch (e) {
          console.log('[Mosqit] Writer not available:', e.message);
        }
      }

      if (!session) {
        console.log('[Mosqit] No AI APIs available. Check chrome://flags/#prompt-api-for-gemini-nano');
        // Continue to fallback analysis below
      } else {
        // Build comprehensive context
        const bugContext = `
Bug Description: ${bugData.description || 'Visual/interaction issue'}
Expected Behavior: ${bugData.expected || 'Element should work correctly'}
Element Selector: ${bugData.element?.selector || 'Not specified'}
Element Type: ${bugData.element?.tagName || 'Unknown'}
Element Size: ${bugData.element?.position?.width}x${bugData.element?.position?.height}px
Page URL: ${bugData.page?.url || 'Unknown'}
Has Console Errors: ${errors && errors.length > 0 ? 'Yes (' + errors.length + ' errors)' : 'No'}
${errors && errors.length > 0 ? 'Primary Error: ' + errors[0].message : ''}

Analyze this bug and provide:
1. Most likely root cause (1-2 sentences)
2. Specific debugging steps (2-3 bullet points)
3. Potential fix (1-2 sentences)
Keep response under 150 words.`;

        let response = null;

        // Use appropriate method based on API type
        if (aiType === 'assistant' || aiType === 'languageModel') {
          response = await session.prompt(bugContext);
        } else if (aiType === 'writer') {
          response = await session.write(bugContext);
        }

        if (response && response.length > 10) {
          console.log('[Mosqit] AI analysis successful');
          return `🤖 **AI Analysis**\n\n${response.trim()}`;
        }
      }
    } catch (error) {
      console.error('[Mosqit] AI bug analysis failed:', error);
    }

    // If AI analysis fails or no AI available, still analyze errors if present
    if (errors && errors.length > 0) {
      return this.getAIAnalysisForErrors(errors);
    }

    // Fallback for visual/UX bugs without errors
    return this.generateContextualAnalysis(bugData);
  }

  generateContextualAnalysis(bugData) {
    const element = bugData.element;
    let analysis = `🤖 **Automated Analysis**\n\n`;

    // Analyze based on element type and description
    if (element?.tagName) {
      const tag = element.tagName.toLowerCase();

      if (['button', 'a', 'input', 'select'].includes(tag)) {
        analysis += `**Interactive Element Issue Detected**\n`;
        analysis += `• Element type: ${tag}\n`;
        analysis += `• Check if element is disabled or has pointer-events: none\n`;
        analysis += `• Verify click/change event listeners are attached\n`;
        analysis += `• Inspect z-index and overlapping elements\n`;
      } else if (['div', 'section', 'article'].includes(tag)) {
        analysis += `**Layout/Container Issue Detected**\n`;
        analysis += `• Check CSS display and visibility properties\n`;
        analysis += `• Verify responsive breakpoints\n`;
        analysis += `• Inspect flexbox/grid properties\n`;
      } else if (['img', 'video', 'picture'].includes(tag)) {
        analysis += `**Media Element Issue Detected**\n`;
        analysis += `• Verify resource URL is correct\n`;
        analysis += `• Check loading state and error events\n`;
        analysis += `• Inspect dimensions and aspect ratio\n`;
      }
    }

    // Add description-based insights
    const desc = (bugData.description || '').toLowerCase();
    if (desc.includes('click') || desc.includes('tap')) {
      analysis += `\n**Click/Tap Issue:**\n`;
      analysis += `• Element might be covered by another element\n`;
      analysis += `• JavaScript event handler might be missing\n`;
    } else if (desc.includes('display') || desc.includes('show') || desc.includes('visible')) {
      analysis += `\n**Visibility Issue:**\n`;
      analysis += `• Check CSS display, visibility, and opacity\n`;
      analysis += `• Verify element is in viewport\n`;
    } else if (desc.includes('size') || desc.includes('responsive')) {
      analysis += `\n**Sizing/Responsive Issue:**\n`;
      analysis += `• Check media queries and breakpoints\n`;
      analysis += `• Verify width/height constraints\n`;
    }

    return analysis;
  }

  async getAIAnalysisForErrors(errors) {
    // If no errors, provide helpful debugging guidance
    if (!errors || errors.length === 0) {
      return `🤖 **No Console Errors Detected**

**Debugging Checklist:**
☑️ Check browser console for warnings or info messages
☑️ Verify element exists in DOM before interaction
☑️ Check Network tab for failed API requests
☑️ Ensure all JavaScript files loaded successfully
☑️ Test in different browsers for compatibility

**Common Issues Without Errors:**
• Element might be dynamically loaded - add appropriate wait/delay
• Event listeners might not be properly attached
• CSS might be hiding or disabling the element
• JavaScript might be blocked by browser extensions
• Timing issues with async operations`;
    }

    // Try to generate AI analysis for the errors
    try {
      if (typeof window !== 'undefined' && window.ai?.languageModel) {
        const session = await window.ai.languageModel.create({
          systemPrompt: `You are a debugging expert. Analyze JavaScript errors and provide concise, actionable insights to help developers fix bugs quickly.`
        });

        const analysisResults = [];

        // Analyze each unique error
        for (const error of errors.slice(0, 2)) { // Limit to 2 errors for performance
          const prompt = `Analyze this JavaScript error and provide a concise solution:
Error: ${error.message}
File: ${error.file || 'unknown'}
Line: ${error.line || 'unknown'}

Provide:
1. Root cause (1 sentence)
2. Quick fix suggestion (1-2 sentences)`;

          try {
            const response = await session.prompt(prompt);
            if (response && response.length > 10) {
              analysisResults.push(`🤖 **${error.file}:${error.line}**\n${response.trim()}`);
            }
          } catch (err) {
            console.warn('[Mosqit] Failed to analyze individual error:', err);
          }
        }

        await session.destroy();

        if (analysisResults.length > 0) {
          return analysisResults.join('\n\n');
        }
      }
    } catch (error) {
      console.warn('[Mosqit] AI analysis generation failed:', error);
    }

    // Fallback: Provide basic analysis based on error patterns
    return this.generateBasicErrorAnalysis(errors);
  }

  generateBasicErrorAnalysis(errors) {
    const analysisResults = [];

    for (const error of errors.slice(0, 2)) {
      let analysis = '';
      const msg = error.message.toLowerCase();

      // Common error pattern analysis
      if (msg.includes('cannot read properties of null') || msg.includes('cannot read property')) {
        analysis = `🤖 **Null Reference Error** at ${error.file}:${error.line}
This occurs when trying to access a property of a null or undefined object.
**Fix**: Add null checks before accessing properties: \`if (object && object.property)\``;
      } else if (msg.includes('is not a function')) {
        analysis = `🤖 **Type Error** at ${error.file}:${error.line}
The code is trying to call something that isn't a function.
**Fix**: Verify the variable type and ensure the function exists before calling it.`;
      } else if (msg.includes('is not defined')) {
        analysis = `🤖 **Reference Error** at ${error.file}:${error.line}
Variable or function is being used before it's declared.
**Fix**: Ensure the variable is declared and in scope before use.`;
      } else if (msg.includes('network') || msg.includes('fetch')) {
        analysis = `🤖 **Network Error** at ${error.file}:${error.line}
Failed to complete a network request.
**Fix**: Check network connectivity, CORS settings, and API endpoints.`;
      } else {
        analysis = `🤖 **JavaScript Error** at ${error.file}:${error.line}
${error.message.substring(0, 100)}
**Debug**: Check the console for full error details and stack trace.`;
      }

      if (analysis) {
        analysisResults.push(analysis);
      }
    }

    // If no analysis was generated, provide generic debugging tips
    if (analysisResults.length === 0) {
      return `🤖 **Error Analysis**

**Error Summary:**
${errors.slice(0, 2).map(e => `• ${e.message.substring(0, 80)}${e.message.length > 80 ? '...' : ''}`).join('\n')}

**General Debugging Steps:**
1. Check the full error stack trace in the console
2. Verify all variables are properly initialized
3. Add console.log statements before the error line
4. Check for typos in property/method names
5. Ensure all dependencies are loaded

**Need More Help?**
Share the full error message and code context with your team or on Stack Overflow for specific guidance.`;
    }

    return analysisResults.join('\n\n');
  }

  collectRecentErrors() {
    // Collect errors from the last 5 minutes
    const fiveMinutesAgo = Date.now() - (5 * 60 * 1000);

    // Use a Map to deduplicate errors by message and location
    const uniqueErrors = new Map();

    this.logs.filter(log =>
      log.level === 'error' &&
      new Date(log.timestamp).getTime() > fiveMinutesAgo
    ).forEach(log => {
      // Create unique key based on message and location
      const key = `${log.message}_${log.file}_${log.line}`;

      // Only add if we haven't seen this exact error before
      if (!uniqueErrors.has(key)) {
        uniqueErrors.set(key, {
          message: log.message,
          stack: log.stack || '',
          file: log.file,
          line: log.line,
          column: log.column,
          timestamp: log.timestamp,
          type: log.type || 'Error',
          analysis: log.analysis
        });
      }
    });

    // Return unique errors as array
    return Array.from(uniqueErrors.values());
  }

  extractStackTraces(errors) {
    const stackTraces = [];
    errors.forEach(error => {
      if (error.stack) {
        const formattedStack = this.formatStackTrace(error.stack, error.file, error.line);
        if (formattedStack) {
          stackTraces.push(`### ${error.type}: ${error.message}\n\`\`\`\n${formattedStack}\n\`\`\``);
        }
      }
    });
    return stackTraces.join('\n\n');
  }

  formatStackTrace(stack, file, line) {
    if (!stack) return '';

    // Parse and format the stack trace
    const lines = stack.split('\n').map(line => {
      // Extract file path and line number from stack trace lines
      const match = line.match(/at\s+(.+?)\s+\((.+?):(\d+):(\d+)\)/) ||
                   line.match(/at\s+(.+?):(\d+):(\d+)/);

      if (match) {
        const [, method, filepath, lineNum, colNum] = match.length === 5 ? match : ['', '', ...match.slice(1)];
        return `  at ${method || 'anonymous'} (${filepath}:${lineNum}:${colNum})`;
      }
      return line;
    });

    // Highlight the main error location
    if (file && line) {
      lines.unshift(`📍 Main error location: ${file}:${line}`);
    }

    return lines.join('\n');
  }

  formatErrors(errors) {
    if (!errors || errors.length === 0) {
      return '✅ No console errors detected in the last 5 minutes';
    }

    return errors.map((error, index) => `
### Error ${index + 1}
\`\`\`javascript
// 📍 Location: ${error.file || 'Unknown'}:${error.line || '?'}:${error.column || '?'}
// ⏰ Time: ${new Date(error.timestamp).toLocaleTimeString()}

${error.type}: ${error.message}

${error.stack ? 'Stack Trace:\n' + this.formatStackTrace(error.stack, error.file, error.line) : 'No stack trace available'}
\`\`\`
`).join('\n');
  }

  getRecentConsoleLogs() {
    // Get last 20 console logs for context
    const recentLogs = this.logs.slice(-20);

    if (recentLogs.length === 0) {
      return 'No recent console activity';
    }

    return recentLogs.map(log => {
      const timestamp = new Date(log.timestamp).toLocaleTimeString();
      const location = log.file ? ` [${log.file}:${log.line}]` : '';
      const levelIcon = this.getLevelIcon(log.level);
      // Truncate long messages to save space
      const message = log.message.length > 150 ? log.message.substring(0, 150) + '...' : log.message;
      return `[${timestamp}] ${levelIcon} ${log.level.toUpperCase()}${location}: ${message}`;
    }).join('\n');
  }

  getLevelIcon(level) {
    const icons = {
      verbose: '🔍',
      debug: '🐛',
      info: 'ℹ️',
      warn: '⚠️',
      error: '❌',
      assert: '🚫'
    };
    return icons[level] || '📝';
  }

  async getSourceContext(errors) {
    if (!errors || errors.length === 0) {
      return '// No error source context available';
    }

    const contexts = [];
    for (const error of errors.slice(0, 3)) { // Limit to first 3 errors
      if (error.file && error.line) {
        contexts.push(`
### Source: ${error.file}:${error.line}
\`\`\`javascript
// Error: ${error.message}
// Line ${error.line}${error.column ? ', Column ' + error.column : ''}
// Context would be fetched from source maps if available
\`\`\``);
      }
    }

    return contexts.length > 0 ? contexts.join('\n') : '// No source context available';
  }

  truncateHTML(html) {
    if (!html) return '';
    const maxLength = 200;
    const cleaned = html.replace(/<[^>]*>/g, '').trim();
    return cleaned.length > maxLength ?
      cleaned.substring(0, maxLength) + '...' :
      cleaned;
  }

  getSessionDuration() {
    if (this.logs.length === 0) return 'N/A';

    const firstLog = new Date(this.logs[0].timestamp);
    const now = new Date();
    const duration = now - firstLog;

    const minutes = Math.floor(duration / 60000);
    const seconds = Math.floor((duration % 60000) / 1000);

    return `${minutes}m ${seconds}s`;
  }

  getRecentNetworkErrors() {
    // Filter for network-related errors
    const networkErrors = this.logs.filter(log =>
      log.level === 'error' &&
      (log.message.toLowerCase().includes('fetch') ||
       log.message.toLowerCase().includes('xhr') ||
       log.message.toLowerCase().includes('network') ||
       log.message.toLowerCase().includes('cors') ||
       log.message.match(/\b(4\d{2}|5\d{2})\b/)) // HTTP error codes
    ).slice(-5);

    if (networkErrors.length === 0) {
      return '✅ No recent network errors';
    }

    return '\`\`\`\n' + networkErrors.map(log =>
      `[${new Date(log.timestamp).toLocaleTimeString()}] ${log.message}`
    ).join('\n') + '\n\`\`\`';
  }

  getPerformanceMetrics() {
    // Get performance timing if available
    try {
      const perf = performance.timing;
      const loadTime = perf.loadEventEnd - perf.navigationStart;
      const domReadyTime = perf.domContentLoadedEventEnd - perf.navigationStart;
      const resourcesTime = perf.responseEnd - perf.requestStart;

      return `\`\`\`
Page Load: ${loadTime}ms
DOM Ready: ${domReadyTime}ms
Resources: ${resourcesTime}ms
Memory Usage: ${this.getMemoryUsage()}
\`\`\``;
    } catch {
      return 'Performance metrics not available';
    }
  }

  getMemoryUsage() {
    if (performance.memory) {
      const used = Math.round(performance.memory.usedJSHeapSize / 1048576);
      const total = Math.round(performance.memory.totalJSHeapSize / 1048576);
      return `${used}MB / ${total}MB`;
    }
    return 'N/A';
  }

  async submitToGitHub() {
    console.log('[Mosqit] Preparing GitHub issue submission...');

    // Get the already AI-generated title (don't reformat it)
    const issueTitle = document.querySelector('#vb-issue-content h3')?.textContent || '[Bug]: Visual Bug Report';

    // Get the issue body
    const issueBody = document.querySelector('#vb-issue-content pre')?.textContent ||
                      document.querySelector('#vb-issue-content')?.textContent || '';

    if (!issueBody) {
      alert('Please generate the issue content first');
      return;
    }

    // Show loading state
    const submitBtn = document.getElementById('vb-submit');
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.innerHTML = '⏳ Submitting to GitHub...';

    // Add progress indicator
    this.showProgressOverlay('Creating GitHub issue...');

    // Check if we have GitHub settings stored
    const settings = await this.getGitHubSettings();

    if (!settings.token || !settings.repo) {
      // Hide progress and restore button
      this.hideProgressOverlay();
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalText;

      // Show settings dialog
      this.showGitHubSettings(issueTitle, issueBody);
      return;
    }

    // Submit to GitHub
    try {
      this.updateProgressMessage('Authenticating with GitHub...');
      await new Promise(resolve => setTimeout(resolve, 500)); // Visual feedback

      this.updateProgressMessage('Creating issue...');
      const result = await this.createGitHubIssue(settings, issueTitle, issueBody);

      if (result.success) {
        this.updateProgressMessage('✅ Issue created successfully!');

        // Show success with issue number
        setTimeout(() => {
          this.hideProgressOverlay();
          this.showToast(`✅ Issue created: #${result.number}`, 'success');

          // Open the issue in a new tab
          if (result.url) {
            window.open(result.url, '_blank');
          }

          // Clear the form
          this.resetVisualBugReporter();
        }, 1500);
      } else {
        throw new Error(result.error || 'Failed to create issue');
      }
    } catch (error) {
      console.error('[Mosqit] GitHub submission error:', error);
      this.hideProgressOverlay();

      // Check if it's an authentication error - clear invalid token and show settings
      if (error.message.includes('Invalid GitHub token') ||
          error.message.includes('401') ||
          error.message.includes('Unauthorized')) {

        // Clear the invalid token from storage
        await this.clearGitHubSettings();

        // Show settings dialog again so user can enter correct token
        this.showToast('❌ Invalid token cleared. Please enter valid credentials.', 'error');
        setTimeout(() => {
          this.showGitHubSettings(issueTitle, issueBody, 'Previous token was invalid and has been cleared. Please enter valid credentials.');
        }, 2000);

      } else if (error.message.includes('Repository not found') ||
                 error.message.includes('404')) {

        // Clear invalid repo and show settings
        await this.clearGitHubSettings();

        this.showToast('❌ Repository not found. Please check your settings.', 'error');
        setTimeout(() => {
          this.showGitHubSettings(issueTitle, issueBody, 'Repository not found. Please check the format (owner/repo) and ensure you have access.');
        }, 2000);

      } else {
        // For other errors, just show the toast
        this.showToast('❌ ' + error.message, 'error');
      }
    } finally {
      // Restore button state
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalText;
    }
  }

  async getGitHubSettings() {
    // EPHEMERAL MODE: Session-only GitHub settings (not persisted)
    return {
      token: this.githubToken || '',
      repo: this.githubRepo || ''
    };
  }

  async saveGitHubSettings(token, repo) {
    // EPHEMERAL MODE: Session-only GitHub settings (not persisted)
    this.githubToken = token;
    this.githubRepo = repo;
  }

  async clearGitHubSettings() {
    // EPHEMERAL MODE: Session-only GitHub settings (not persisted)
    this.githubToken = '';
    this.githubRepo = '';
    console.log('[Mosqit] GitHub settings cleared (session)');
  }

  showGitHubSettings(issueTitle, issueBody, errorMessage = null) {
    const dialog = document.createElement('div');
    dialog.className = 'github-settings-dialog';
    dialog.innerHTML = `
      <div class="dialog-overlay"></div>
      <div class="dialog-content">
        <h3>🔧 GitHub Settings</h3>
        <p>Configure GitHub integration to submit issues directly.</p>
        ${errorMessage ? `<div class="error-message" style="background: #fee; border: 1px solid #f99; padding: 8px; border-radius: 4px; color: #c33; margin-bottom: 16px;"><strong>⚠️ ${errorMessage}</strong></div>` : ''}

        <div class="form-group">
          <label>GitHub Personal Access Token:</label>
          <input type="password" id="github-token" placeholder="ghp_xxxxxxxxxxxx">
          <small>Create at: <a href="https://github.com/settings/tokens/new?scopes=repo" target="_blank">github.com/settings/tokens</a></small>
        </div>

        <div class="form-group">
          <label>Repository (owner/name):</label>
          <input type="text" id="github-repo" placeholder="username/repository">
        </div>

        <div class="dialog-actions">
          <button class="btn-cancel">Cancel</button>
          <button class="btn-save">Save & Submit Issue</button>
        </div>
      </div>
    `;

    document.body.appendChild(dialog);

    // Load existing settings (only if not showing after an error)
    if (!errorMessage) {
      this.getGitHubSettings().then(settings => {
        if (settings.token) document.getElementById('github-token').value = settings.token;
        if (settings.repo) document.getElementById('github-repo').value = settings.repo;
      });
    }

    // Handle save
    dialog.querySelector('.btn-save').addEventListener('click', async () => {
      const token = document.getElementById('github-token').value.trim();
      const repo = document.getElementById('github-repo').value.trim();

      if (!token || !repo) {
        alert('Please fill in all fields');
        return;
      }

      // Save settings
      await this.saveGitHubSettings(token, repo);

      // Remove dialog
      dialog.remove();

      // Try submitting again
      const settings = { token, repo };
      try {
        const result = await this.createGitHubIssue(settings, issueTitle, issueBody);
        if (result.success) {
          this.showToast(`✅ Issue created: #${result.number}`, 'success');
          if (result.url) {
            window.open(result.url, '_blank');
          }
          this.resetVisualBugReporter();
        }
      } catch (error) {
        this.showToast('❌ ' + error.message, 'error');
      }
    });

    // Handle cancel
    dialog.querySelector('.btn-cancel').addEventListener('click', () => {
      dialog.remove();
    });
  }

  async uploadScreenshotToGitHub(settings, screenshot, issueNumber) {
    if (!screenshot || !screenshot.startsWith('data:image')) {
      console.log('[Mosqit] No valid screenshot to upload');
      return null;
    }

    const [owner, repo] = settings.repo.split('/');

    // Extract base64 content (remove data:image/png;base64, prefix)
    const base64Content = screenshot.split(',')[1];

    // Check size limit (GitHub has a 10MB limit for API uploads, but we'll be conservative)
    const sizeInBytes = (base64Content.length * 3) / 4; // Approximate size
    const sizeInMB = sizeInBytes / (1024 * 1024);
    if (sizeInMB > 5) {
      console.warn(`[Mosqit] Screenshot too large (${sizeInMB.toFixed(2)}MB). Skipping upload.`);
      this.showToast('⚠️ Screenshot too large for upload (>5MB)', 'warning');
      return null;
    }

    // Generate unique filename with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `mosqit-screenshots/issue-${issueNumber || 'draft'}-${timestamp}.png`;

    try {
      // Upload image to repository
      const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${filename}`, {
        method: 'PUT',
        headers: {
          'Authorization': `token ${settings.token}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: `Add screenshot for issue #${issueNumber || 'new'}`,
          content: base64Content,
          branch: 'main' // You might want to make this configurable
        })
      });

      if (response.ok) {
        const data = await response.json();
        // Return the raw URL for embedding in markdown
        const rawUrl = data.content.download_url;
        console.log('[Mosqit] Screenshot uploaded successfully:', rawUrl);
        return rawUrl;
      } else {
        const error = await response.json();
        console.error('[Mosqit] Failed to upload screenshot:', error);

        // If folder doesn't exist, try to create it first
        if (error.message && error.message.includes('path')) {
          console.log('[Mosqit] Attempting to create screenshots folder...');
          // Try without folder first
          const simpleFilename = `screenshot-${issueNumber || 'draft'}-${timestamp}.png`;
          const retryResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${simpleFilename}`, {
            method: 'PUT',
            headers: {
              'Authorization': `token ${settings.token}`,
              'Accept': 'application/vnd.github.v3+json',
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              message: `Add screenshot for issue #${issueNumber || 'new'}`,
              content: base64Content,
              branch: 'main'
            })
          });

          if (retryResponse.ok) {
            const retryData = await retryResponse.json();
            return retryData.content.download_url;
          }
        }
        return null;
      }
    } catch (error) {
      console.error('[Mosqit] Error uploading screenshot:', error);
      return null;
    }
  }

  async createGitHubIssue(settings, title, body) {
    const [owner, repo] = settings.repo.split('/');

    if (!owner || !repo) {
      throw new Error('Invalid repository format. Use: owner/repo');
    }

    // First, try to upload the screenshot if available
    let screenshotUrl = null;
    if (this.capturedBug?.screenshot) {
      this.updateProgressMessage('📸 Uploading screenshot...');
      screenshotUrl = await this.uploadScreenshotToGitHub(settings, this.capturedBug.screenshot);

      if (screenshotUrl) {
        this.updateProgressMessage('✅ Screenshot uploaded successfully');
      } else {
        this.updateProgressMessage('⚠️ Screenshot upload failed, creating issue without image');
      }
    }

    // Insert screenshot into body if upload was successful
    let enhancedBody = body;
    if (screenshotUrl) {
      // Find the right place to insert the screenshot (after "Visual Context" or at the beginning)
      const visualContextIndex = body.indexOf('## Visual Context');
      if (visualContextIndex !== -1) {
        // Insert after Visual Context heading
        const insertPoint = body.indexOf('\n', visualContextIndex) + 1;
        enhancedBody = body.slice(0, insertPoint) +
          `\n### Screenshot\n![Bug Screenshot](${screenshotUrl})\n\n` +
          body.slice(insertPoint);
      } else {
        // Insert after bug description
        const descIndex = body.indexOf('## Expected Behavior');
        if (descIndex !== -1) {
          enhancedBody = body.slice(0, descIndex) +
            `\n## Screenshot\n![Bug Screenshot](${screenshotUrl})\n\n` +
            body.slice(descIndex);
        } else {
          // Fallback: add at the beginning
          enhancedBody = `## Screenshot\n![Bug Screenshot](${screenshotUrl})\n\n${body}`;
        }
      }
    }

    // Truncate body if it exceeds GitHub's limit (65536 characters)
    const MAX_BODY_LENGTH = 65000; // Leave some buffer
    let truncatedBody = enhancedBody;
    if (enhancedBody.length > MAX_BODY_LENGTH) {
      // Keep the most important parts and add truncation notice
      const truncationNotice = '\n\n---\n*[Content truncated due to GitHub\'s 65536 character limit. Full details available in DevTools.]*';
      truncatedBody = enhancedBody.substring(0, MAX_BODY_LENGTH - truncationNotice.length) + truncationNotice;
      console.warn('[Mosqit] Issue body truncated from', enhancedBody.length, 'to', truncatedBody.length, 'characters');
    }

    try {
      const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/issues`, {
        method: 'POST',
        headers: {
          'Authorization': `token ${settings.token}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: title,
          body: truncatedBody
          // Note: labels removed - they need to exist in the repo first
        })
      });

      if (!response.ok) {
        const error = await response.json();
        console.error('[Mosqit] GitHub API Error:', error);

        // Provide more specific error messages
        if (response.status === 401) {
          throw new Error('Invalid GitHub token. Please check your personal access token.');
        } else if (response.status === 404) {
          throw new Error('Repository not found. Check the format: owner/repo');
        } else if (response.status === 422) {
          const validationErrors = error.errors ? error.errors.map(e => e.message).join(', ') : error.message;
          throw new Error(`Validation failed: ${validationErrors}`);
        } else {
          throw new Error(error.message || `GitHub API error: ${response.status}`);
        }
      }

      const issue = await response.json();
      return {
        success: true,
        number: issue.number,
        url: issue.html_url
      };
    } catch (error) {
      console.error('[Mosqit] GitHub API error:', error);
      throw error;
    }
  }

  resetVisualBugReporter() {
    // Reset the visual bug reporter UI
    document.getElementById('vb-capture-section').style.display = 'block';
    document.getElementById('vb-content').style.display = 'none';
    document.getElementById('vb-content').innerHTML = '';
    this.capturedBug = null;
  }

  showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => {
      toast.classList.add('show');
    }, 10);

    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

  showProgressOverlay(message) {
    // Remove existing overlay if any
    this.hideProgressOverlay();

    const overlay = document.createElement('div');
    overlay.id = 'github-progress-overlay';
    overlay.className = 'progress-overlay';
    overlay.innerHTML = `
      <div class="progress-content">
        <div class="progress-spinner"></div>
        <div class="progress-message">${message}</div>
        <div class="progress-steps">
          <div class="step active">🔑 Authenticating</div>
          <div class="step">📝 Creating Issue</div>
          <div class="step">✅ Complete</div>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);

    // Animate in
    setTimeout(() => {
      overlay.classList.add('show');
    }, 10);
  }

  updateProgressMessage(message) {
    const messageEl = document.querySelector('.progress-message');
    if (messageEl) {
      messageEl.textContent = message;
    }

    // Update step indicators
    const steps = document.querySelectorAll('.progress-steps .step');
    if (message.includes('Authenticating')) {
      steps[0]?.classList.add('active');
    } else if (message.includes('Creating issue')) {
      steps[0]?.classList.add('complete');
      steps[1]?.classList.add('active');
    } else if (message.includes('successfully')) {
      steps.forEach(step => step.classList.add('complete'));
    }
  }

  hideProgressOverlay() {
    const overlay = document.getElementById('github-progress-overlay');
    if (overlay) {
      overlay.classList.remove('show');
      setTimeout(() => overlay.remove(), 300);
    }
  }
}

// Add enhanced dark theme styles
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
  /* Base Reset and Variables */
  :root {
    --bg-primary: #1a1b26;
    --bg-secondary: #24283b;
    --bg-tertiary: #292e42;
    --bg-hover: #3b4261;
    --border-color: #414868;
    --text-primary: #c0caf5;
    --text-secondary: #9aa5ce;
    --text-muted: #565f89;

    /* Log Level Colors */
    --level-verbose: #6b7280;
    --level-debug: #8b5cf6;
    --level-info: #3b82f6;
    --level-warn: #eab308;
    --level-error: #ef4444;
    --level-assert: #dc2626;

    /* Accent Colors */
    --accent-primary: #7aa2f7;
    --accent-success: #9ece6a;
    --accent-warning: #e0af68;
    --accent-danger: #f7768e;
    --accent-info: #7dcfff;

    /* Spacing */
    --spacing-xs: 4px;
    --spacing-sm: 8px;
    --spacing-md: 12px;
    --spacing-lg: 16px;
    --spacing-xl: 24px;
  }

  /* Light Theme */
  [data-theme="light"] {
    --bg-primary: #ffffff;
    --bg-secondary: #f5f5f5;
    --bg-tertiary: #eeeeee;
    --bg-hover: #e8e8e8;
    --border-color: #d4d4d4;
    --text-primary: #1a1a1a;
    --text-secondary: #4a4a4a;
    --text-muted: #9e9e9e;

    /* Log Level Colors (adjusted for light background) */
    --level-verbose: #757575;
    --level-debug: #9333ea;
    --level-info: #2563eb;
    --level-warn: #d97706;
    --level-error: #dc2626;
    --level-assert: #b91c1c;

    /* Accent Colors (adjusted for light background) */
    --accent-primary: #2563eb;
    --accent-success: #16a34a;
    --accent-warning: #d97706;
    --accent-danger: #dc2626;
    --accent-info: #0891b2;
  }

  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  body {
    font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Fira Code', monospace;
    font-size: 12px;
    color: var(--text-primary);
    background: var(--bg-primary);
    overflow: hidden;
  }

  /* Main Panel Container */
  .mosqit-panel {
    display: flex;
    flex-direction: column;
    height: 100vh;
    background: var(--bg-primary);
  }

  /* Header Bar */
  .header-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--spacing-sm) var(--spacing-lg);
    background: var(--bg-secondary);
    border-bottom: 1px solid var(--border-color);
    min-height: 48px;
  }

  .brand {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
  }

  .brand-icon {
    font-size: 24px;
    filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));
  }

  .brand-text {
    display: flex;
    flex-direction: column;
  }

  .brand-name {
    font-weight: 700;
    font-size: 14px;
    letter-spacing: 1px;
    color: var(--text-primary);
  }

  .brand-tagline {
    font-size: 10px;
    color: var(--text-muted);
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .header-actions {
    display: flex;
    gap: var(--spacing-sm);
  }

  .header-btn {
    width: 32px;
    height: 32px;
    border: none;
    background: transparent;
    color: var(--text-secondary);
    cursor: pointer;
    border-radius: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
  }

  .header-btn:hover {
    background: var(--bg-hover);
    color: var(--text-primary);
  }

  /* Toolbar */
  .toolbar {
    display: flex;
    align-items: center;
    gap: var(--spacing-lg);
    padding: var(--spacing-sm) var(--spacing-lg);
    background: var(--bg-tertiary);
    border-bottom: 1px solid var(--border-color);
    flex-wrap: wrap;
    min-height: 56px;
  }

  /* Search Container */
  .search-container {
    display: flex;
    align-items: center;
    flex: 1;
    min-width: 300px;
    max-width: 600px;
    background: var(--bg-secondary);
    border: 1px solid var(--border-color);
    border-radius: 8px;
    padding: 0 var(--spacing-md);
    transition: all 0.2s ease;
  }

  .search-container:focus-within {
    border-color: var(--accent-primary);
    box-shadow: 0 0 0 2px rgba(122, 162, 247, 0.1);
  }

  .search-icon {
    color: var(--text-muted);
    display: flex;
    align-items: center;
  }

  .search-input {
    flex: 1;
    background: transparent;
    border: none;
    color: var(--text-primary);
    padding: var(--spacing-sm) var(--spacing-md);
    font-family: inherit;
    font-size: 12px;
    outline: none;
  }

  .search-input::placeholder {
    color: var(--text-muted);
    font-size: 11px;
  }

  .search-help {
    color: var(--text-muted);
    cursor: pointer;
    display: flex;
    align-items: center;
    padding: var(--spacing-xs);
  }

  .search-help:hover {
    color: var(--accent-primary);
  }

  /* Filter Group */
  .filter-group {
    display: flex;
    gap: var(--spacing-xs);
    flex-wrap: wrap;
  }

  .filter-chip {
    display: flex;
    align-items: center;
    gap: var(--spacing-xs);
    padding: var(--spacing-xs) var(--spacing-sm);
    background: var(--bg-secondary);
    border: 1px solid var(--border-color);
    border-radius: 16px;
    color: var(--text-secondary);
    font-size: 10px;
    font-weight: 600;
    text-transform: uppercase;
    cursor: pointer;
    transition: all 0.2s ease;
    position: relative;
  }

  .filter-chip:hover {
    background: var(--bg-hover);
  }

  .filter-chip.active {
    background: var(--bg-hover);
    border-color: currentColor;
  }

  .filter-chip[data-level="verbose"] { --chip-color: var(--level-verbose); }
  .filter-chip[data-level="debug"] { --chip-color: var(--level-debug); }
  .filter-chip[data-level="info"] { --chip-color: var(--level-info); }
  .filter-chip[data-level="warn"] { --chip-color: var(--level-warn); }
  .filter-chip[data-level="error"] { --chip-color: var(--level-error); }
  .filter-chip[data-level="assert"] { --chip-color: var(--level-assert); }

  .filter-indicator {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--chip-color);
  }

  .filter-chip.active .filter-indicator {
    box-shadow: 0 0 6px var(--chip-color);
  }

  .filter-count {
    color: var(--text-muted);
    font-size: 9px;
    background: var(--bg-primary);
    padding: 2px 6px;
    border-radius: 10px;
  }

  /* Action Group */
  .action-group {
    display: flex;
    gap: var(--spacing-xs);
    margin-left: auto;
  }

  .action-btn {
    display: flex;
    align-items: center;
    gap: var(--spacing-xs);
    padding: var(--spacing-xs) var(--spacing-sm);
    background: var(--bg-secondary);
    border: 1px solid var(--border-color);
    border-radius: 6px;
    color: var(--text-secondary);
    font-size: 11px;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .action-btn:hover {
    background: var(--bg-hover);
    color: var(--text-primary);
  }

  .action-btn.active {
    background: var(--accent-primary);
    border-color: var(--accent-primary);
    color: var(--bg-primary);
  }

  .btn-label {
    font-weight: 600;
    text-transform: uppercase;
    font-size: 10px;
  }

  /* Content Area */
  .content-area {
    flex: 1;
    display: flex;
    overflow: hidden;
    background: var(--bg-primary);
  }

  /* Logs Panel */
  .logs-panel {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .logs-list {
    flex: 1;
    overflow-y: auto;
    overflow-x: hidden;
    padding: var(--spacing-sm);
  }

  /* Custom Scrollbar */
  .logs-list::-webkit-scrollbar {
    width: 8px;
  }

  .logs-list::-webkit-scrollbar-track {
    background: var(--bg-secondary);
  }

  .logs-list::-webkit-scrollbar-thumb {
    background: var(--border-color);
    border-radius: 4px;
  }

  .logs-list::-webkit-scrollbar-thumb:hover {
    background: var(--text-muted);
  }

  /* Empty State */
  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    text-align: center;
    padding: var(--spacing-xl);
  }

  .empty-icon {
    font-size: 48px;
    margin-bottom: var(--spacing-lg);
    opacity: 0.5;
    animation: float 3s ease-in-out infinite;
  }

  @keyframes float {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-10px); }
  }

  .empty-title {
    font-size: 16px;
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: var(--spacing-xs);
  }

  .empty-subtitle {
    font-size: 12px;
    color: var(--text-secondary);
    margin-bottom: var(--spacing-sm);
  }

  .empty-hint {
    font-size: 11px;
    color: var(--text-muted);
    padding: var(--spacing-xs) var(--spacing-md);
    background: var(--bg-secondary);
    border-radius: 4px;
  }

  /* Log Entries */
  .log-entry {
    display: flex;
    align-items: flex-start;
    padding: var(--spacing-sm) var(--spacing-md);
    margin-bottom: 2px;
    background: var(--bg-secondary);
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.15s ease;
    position: relative;
    border-left: 3px solid transparent;
    font-family: 'SF Mono', 'Monaco', monospace;
  }

  .log-entry:hover {
    background: var(--bg-hover);
    transform: translateX(2px);
  }

  .log-entry.selected {
    background: var(--bg-tertiary);
    box-shadow: 0 2px 8px rgba(0,0,0,0.2);
  }

  /* Log Level Specific Styling */
  .log-entry.verbose { border-left-color: var(--level-verbose); }
  .log-entry.debug { border-left-color: var(--level-debug); }
  .log-entry.info { border-left-color: var(--level-info); }
  .log-entry.warn { border-left-color: var(--level-warn); }
  .log-entry.error {
    border-left-color: var(--level-error);
    background: rgba(239, 68, 68, 0.05);
  }
  .log-entry.assert {
    border-left-color: var(--level-assert);
    background: rgba(220, 38, 38, 0.08);
    animation: pulse 2s ease-in-out infinite;
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.8; }
  }

  .log-level {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    margin-right: var(--spacing-sm);
    flex-shrink: 0;
    margin-top: 4px;
  }

  .log-entry.verbose .log-level { background: var(--level-verbose); }
  .log-entry.debug .log-level { background: var(--level-debug); }
  .log-entry.info .log-level { background: var(--level-info); }
  .log-entry.warn .log-level { background: var(--level-warn); }
  .log-entry.error .log-level { background: var(--level-error); }
  .log-entry.assert .log-level { background: var(--level-assert); }

  .log-time {
    color: var(--text-muted);
    font-size: 11px;
    margin-right: var(--spacing-md);
    flex-shrink: 0;
  }

  .log-message {
    flex: 1;
    color: var(--text-primary);
    font-size: 12px;
    line-height: 1.5;
    word-break: break-word;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
  }

  .log-location {
    color: var(--text-muted);
    font-size: 10px;
    margin-left: auto;
    padding-left: var(--spacing-md);
    flex-shrink: 0;
    opacity: 0.7;
  }

  .log-location:hover {
    color: var(--accent-primary);
    text-decoration: underline;
  }

  /* AI Analysis */
  .ai-analysis {
    display: flex;
    align-items: center;
    gap: var(--spacing-xs);
    margin-top: var(--spacing-xs);
    padding: var(--spacing-xs) var(--spacing-sm);
    background: rgba(26, 27, 38, 0.8);
    border: 1px solid #414868;
    border-radius: 4px;
    font-size: 11px;
    color: #a9b1d6;
  }

  .ai-icon {
    animation: rotate 2s linear infinite;
  }

  @keyframes rotate {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }

  /* Details Panel */
  .details-panel {
    width: 400px;
    background: var(--bg-secondary);
    border-left: 1px solid var(--border-color);
    display: flex;
    flex-direction: column;
    transition: width 0.3s ease;
  }

  .details-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--spacing-md) var(--spacing-lg);
    background: var(--bg-tertiary);
    border-bottom: 1px solid var(--border-color);
  }

  .details-header h3 {
    font-size: 14px;
    font-weight: 600;
    color: var(--text-primary);
  }

  .close-details {
    width: 24px;
    height: 24px;
    border: none;
    background: transparent;
    color: var(--text-muted);
    cursor: pointer;
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
  }

  .close-details:hover {
    background: var(--bg-hover);
    color: var(--text-primary);
  }

  .details-content {
    flex: 1;
    overflow-y: auto;
    padding: var(--spacing-lg);
  }

  .detail-section {
    margin-bottom: var(--spacing-lg);
  }

  .detail-section strong {
    display: block;
    margin-bottom: var(--spacing-xs);
    font-size: 10px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: var(--text-muted);
  }

  .detail-value {
    padding: var(--spacing-sm);
    background: var(--bg-primary);
    border: 1px solid var(--border-color);
    border-radius: 4px;
    font-family: monospace;
    font-size: 11px;
    word-break: break-all;
    color: var(--text-primary);
  }

  .stack-trace {
    padding: var(--spacing-sm);
    background: var(--bg-primary);
    border: 1px solid var(--border-color);
    border-radius: 4px;
    font-size: 10px;
    overflow-x: auto;
    max-height: 200px;
    color: var(--text-secondary);
  }

  /* Status Bar */
  .status-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--spacing-xs) var(--spacing-lg);
    background: var(--bg-tertiary);
    border-top: 1px solid var(--border-color);
    min-height: 28px;
    font-size: 11px;
  }

  .status-left, .status-right {
    display: flex;
    gap: var(--spacing-lg);
    align-items: center;
  }

  .status-item {
    display: flex;
    align-items: center;
    gap: var(--spacing-xs);
    color: var(--text-secondary);
  }

  .status-indicator {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--text-muted);
  }

  .status-indicator.active {
    background: var(--accent-success);
    box-shadow: 0 0 4px var(--accent-success);
  }

  .coffee-support {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    background: linear-gradient(135deg, var(--accent-warning), #ff6b6b);
    border-radius: 50%;
    text-decoration: none;
    font-size: 12px;
    transition: all 0.2s ease;
    opacity: 0.7;
    margin-left: var(--spacing-sm);
  }

  .coffee-support:hover {
    opacity: 1;
    transform: scale(1.1);
    box-shadow: 0 2px 8px rgba(255, 107, 107, 0.3);
  }

  .coffee-support:active {
    transform: scale(0.95);
  }

  /* Responsive Design */
  @media (max-width: 1200px) {
    .details-panel {
      width: 350px;
    }
  }

  @media (max-width: 900px) {
    .toolbar {
      flex-direction: column;
      align-items: stretch;
      gap: var(--spacing-sm);
    }

    .search-container {
      max-width: 100%;
    }

    .filter-group {
      order: 3;
      width: 100%;
    }

    .action-group {
      order: 2;
      margin-left: 0;
      justify-content: flex-end;
    }

    .details-panel {
      position: absolute;
      right: 0;
      top: 0;
      bottom: 0;
      z-index: 10;
      width: 80%;
      max-width: 400px;
      box-shadow: -4px 0 12px rgba(0,0,0,0.3);
    }

    .brand-tagline {
      display: none;
    }
  }

  @media (max-width: 600px) {
    .header-bar {
      padding: var(--spacing-xs) var(--spacing-sm);
    }

    .toolbar {
      padding: var(--spacing-xs) var(--spacing-sm);
    }

    .filter-chip .filter-label {
      display: none;
    }

    .filter-chip {
      padding: var(--spacing-xs);
    }

    .btn-label {
      display: none;
    }

    .log-location {
      display: none;
    }

    .details-panel {
      width: 100%;
      max-width: 100%;
    }
  }

  /* Animation Classes */
  .fade-in {
    animation: fadeIn 0.3s ease;
  }

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  .slide-in {
    animation: slideIn 0.3s ease;
  }

  @keyframes slideIn {
    from { transform: translateX(-100%); }
    to { transform: translateX(0); }
  }

  /* Visual Bug Reporter Styles */
  .action-btn.special {
    background: linear-gradient(135deg, #667eea, #764ba2);
    color: white;
    border: none;
  }

  .action-btn.special:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
  }

  .action-btn.special.active {
    background: linear-gradient(135deg, #764ba2, #667eea);
  }

  .visual-bug-panel {
    flex: 1;
    overflow-y: auto;
    padding: 20px;
  }

  .vb-container {
    max-width: 800px;
    margin: 0 auto;
  }

  .vb-header {
    text-align: center;
    margin-bottom: 30px;
  }

  .vb-header h2 {
    color: var(--text-primary);
    font-size: 1.5rem;
    margin-bottom: 8px;
  }

  .vb-header p {
    color: var(--text-secondary);
  }

  .vb-capture-section {
    text-align: center;
    padding: 40px 20px;
  }

  .vb-capture-btn {
    display: inline-flex;
    align-items: center;
    gap: 12px;
    padding: 16px 32px;
    background: linear-gradient(135deg, #667eea, #764ba2);
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 1.1rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.3s;
  }

  .vb-capture-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
  }

  .vb-help {
    margin-top: 16px;
    color: var(--text-secondary);
    font-size: 0.9rem;
  }

  .vb-section {
    background: var(--bg-secondary);
    border: 1px solid var(--border-color);
    border-radius: 8px;
    padding: 16px;
    margin-bottom: 16px;
  }

  .vb-section h3 {
    color: var(--text-primary);
    font-size: 1rem;
    margin-bottom: 12px;
  }

  .vb-screenshot {
    position: relative;
    background: var(--bg-tertiary);
    border-radius: 6px;
    padding: 12px;
    text-align: center;
  }

  .vb-screenshot img {
    max-width: 100%;
    max-height: 300px;
    border-radius: 4px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  }

  .vb-annotate-btn {
    position: absolute;
    top: 16px;
    right: 16px;
    padding: 8px 16px;
    background: rgba(255, 255, 255, 0.9);
    color: #333;
    border: 1px solid #ddd;
    border-radius: 6px;
    cursor: pointer;
    font-size: 0.9rem;
    transition: all 0.2s;
  }

  .vb-annotate-btn:hover {
    background: white;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  .vb-info-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
  }

  .vb-info-item {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .vb-info-item label {
    font-size: 0.8rem;
    color: var(--text-secondary);
    text-transform: uppercase;
    font-weight: 500;
  }

  .vb-info-item code,
  .vb-info-item span {
    color: var(--text-primary);
    font-family: 'Monaco', monospace;
    font-size: 0.9rem;
  }

  .vb-issue-types {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 8px;
    margin-bottom: 12px;
  }

  .vb-issue-types label {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px;
    background: var(--bg-tertiary);
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.2s;
  }

  .vb-issue-types label:hover {
    background: var(--hover-bg);
  }

  .vb-issue-types input[type="checkbox"] {
    width: 16px;
    height: 16px;
  }

  textarea {
    width: 100%;
    padding: 10px;
    background: var(--bg-tertiary);
    color: var(--text-primary);
    border: 1px solid var(--border-color);
    border-radius: 6px;
    font-family: inherit;
    resize: vertical;
    transition: border-color 0.2s;
  }

  textarea:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }

  .vb-impact {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 8px;
  }

  .vb-impact label {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px;
    background: var(--bg-tertiary);
    border: 2px solid transparent;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.2s;
  }

  .vb-impact label:hover {
    border-color: var(--border-color);
  }

  .vb-impact input[type="radio"]:checked + label {
    border-color: #667eea;
    background: rgba(102, 126, 234, 0.1);
  }

  .vb-actions {
    display: flex;
    gap: 12px;
    justify-content: flex-end;
    margin-top: 20px;
  }

  .vb-btn {
    padding: 10px 20px;
    border: none;
    border-radius: 6px;
    font-size: 0.9rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
  }

  .vb-btn.secondary {
    background: var(--bg-tertiary);
    color: var(--text-primary);
    border: 1px solid var(--border-color);
  }

  .vb-btn.secondary:hover {
    background: var(--hover-bg);
  }

  .vb-btn.primary {
    background: linear-gradient(135deg, #667eea, #764ba2);
    color: white;
  }

  .vb-btn.primary:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
  }

  .vb-btn.success {
    background: #48bb78;
    color: white;
  }

  .vb-btn.success:hover:not(:disabled) {
    background: #38a169;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(72, 187, 120, 0.3);
  }

  .vb-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .vb-preview {
    margin-top: 20px;
    padding: 16px;
    background: var(--bg-tertiary);
    border: 1px solid var(--border-color);
    border-radius: 8px;
  }

  .vb-issue-content {
    font-family: 'Monaco', monospace;
    font-size: 0.85rem;
    white-space: pre-wrap;
    color: var(--text-primary);
    max-height: 400px;
    overflow-y: auto;
  }

  /* AI Generated Header and Copy Button */
  .ai-generated-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 16px;
    background: linear-gradient(135deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.1));
    border: 1px solid rgba(102, 126, 234, 0.2);
    border-radius: 8px;
    margin-bottom: 16px;
  }

  .ai-generated-header h3 {
    margin: 0;
    color: var(--text-primary);
    font-size: 1rem;
    font-weight: 600;
    flex: 1;
  }

  .header-actions {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .ai-badge {
    background: linear-gradient(135deg, #667eea, #764ba2);
    color: white;
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 0.75rem;
    font-weight: 500;
    white-space: nowrap;
  }

  .copy-btn {
    padding: 6px 12px;
    background: #48bb78;
    color: white;
    border: none;
    border-radius: 4px;
    font-size: 0.8rem;
    cursor: pointer;
    transition: all 0.2s ease;
    white-space: nowrap;
  }

  .copy-btn:hover {
    background: #38a169;
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(72, 187, 120, 0.3);
  }

  /* Simple markdown text display */
  #issue-content-text {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
    line-height: 1.6;
    color: var(--text-primary);
    background: var(--bg-primary);
    padding: 16px;
    border-radius: 6px;
    border: 1px solid var(--border-color);
    font-size: 0.9rem;
  }

  .markdown-text {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
    line-height: 1.6;
    color: var(--text-primary);
    background: var(--bg-primary);
    margin: 0;
    padding: 0;
    border: none;
    white-space: pre-wrap;
    font-size: 0.9rem;
  }

  /* GitHub Settings Dialog */
  .github-settings-dialog {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 10000;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .dialog-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.7);
  }

  .dialog-content {
    position: relative;
    background: var(--bg-secondary);
    border-radius: 12px;
    padding: 24px;
    max-width: 500px;
    width: 90%;
    border: 1px solid var(--border-color);
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5);
  }

  .dialog-content h3 {
    margin-top: 0;
    color: var(--text-primary);
    font-size: 1.4rem;
  }

  .dialog-content p {
    color: var(--text-secondary);
    margin-bottom: 20px;
  }

  .form-group {
    margin-bottom: 20px;
  }

  .form-group label {
    display: block;
    margin-bottom: 8px;
    color: var(--text-primary);
    font-weight: 500;
  }

  .form-group input {
    width: 100%;
    padding: 10px;
    background: var(--bg-primary);
    border: 1px solid var(--border-color);
    border-radius: 6px;
    color: var(--text-primary);
    font-size: 14px;
  }

  .form-group input:focus {
    outline: none;
    border-color: var(--accent-color);
  }

  .form-group small {
    display: block;
    margin-top: 4px;
    color: var(--text-secondary);
    font-size: 12px;
  }

  .form-group small a {
    color: var(--accent-color);
  }

  .dialog-actions {
    display: flex;
    gap: 10px;
    justify-content: flex-end;
    margin-top: 24px;
  }

  .dialog-actions button {
    padding: 10px 20px;
    border: none;
    border-radius: 6px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
  }

  .btn-cancel {
    background: var(--bg-tertiary);
    color: var(--text-secondary);
  }

  .btn-cancel:hover {
    background: var(--bg-hover);
  }

  .btn-save {
    background: var(--success-color);
    color: white;
  }

  .btn-save:hover {
    opacity: 0.9;
  }

  /* Toast Notifications */
  .toast {
    position: fixed;
    bottom: 20px;
    right: 20px;
    padding: 12px 20px;
    border-radius: 8px;
    background: var(--bg-tertiary);
    color: var(--text-primary);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    opacity: 0;
    transform: translateY(20px);
    transition: all 0.3s;
    z-index: 10001;
    max-width: 400px;
  }

  .toast.show {
    opacity: 1;
    transform: translateY(0);
  }

  .toast-success {
    background: var(--success-color);
    color: white;
  }

  .toast-error {
    background: var(--error-color);
    color: white;
  }

  .toast-info {
    background: var(--info-color);
    color: white;
  }

  /* Progress Overlay */
  .progress-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.85);
    backdrop-filter: blur(5px);
    z-index: 10002;
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: opacity 0.3s;
  }

  .progress-overlay.show {
    opacity: 1;
  }

  .progress-content {
    background: var(--bg-secondary);
    border-radius: 16px;
    padding: 32px;
    text-align: center;
    max-width: 400px;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
    border: 1px solid var(--border-color);
  }

  .progress-spinner {
    width: 60px;
    height: 60px;
    margin: 0 auto 20px;
    border: 3px solid var(--bg-tertiary);
    border-top: 3px solid var(--accent-color);
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  .progress-message {
    color: var(--text-primary);
    font-size: 1.2rem;
    font-weight: 500;
    margin-bottom: 24px;
  }

  .progress-steps {
    display: flex;
    justify-content: space-between;
    gap: 12px;
  }

  .progress-steps .step {
    flex: 1;
    padding: 8px 12px;
    background: var(--bg-tertiary);
    border-radius: 8px;
    color: var(--text-secondary);
    font-size: 0.9rem;
    opacity: 0.5;
    transition: all 0.3s;
  }

  .progress-steps .step.active {
    opacity: 1;
    background: var(--info-color);
    color: white;
    transform: scale(1.05);
  }

  .progress-steps .step.complete {
    opacity: 1;
    background: var(--success-color);
    color: white;
  }
`;
  document.head.appendChild(style);

  // Initialize the panel in browser environment
  console.log('[Mosqit Panel] Creating MosqitDevToolsPanel instance...');
  new MosqitDevToolsPanel();
  console.log('[Mosqit Panel] Panel instance created');
}

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports = MosqitDevToolsPanel;
}