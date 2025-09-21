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
        } else if (message.type === 'LOGS_DATA') {
          console.log('[Mosqit Panel] Received', message.data?.length || 0, 'logs');
          this.logs = message.data || [];
          this.applyFilters();
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

    // AI toggle
    this.elements.aiToggle.addEventListener('click', (e) => {
      this.filters.showAIAnalysis = !this.filters.showAIAnalysis;
      e.currentTarget.classList.toggle('active', this.filters.showAIAnalysis);
      const label = e.currentTarget.querySelector('.btn-label');
      if (label) label.textContent = this.filters.showAIAnalysis ? 'AI' : 'OFF';
      this.renderLogs();
    });

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
      aiElement.className = 'ai-analysis';
      aiElement.innerHTML = `
        <span class="ai-icon">✨</span>
        <span class="ai-text">${this.escapeHtml(data.analysis)}</span>
      `;
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
}

// Add enhanced dark theme styles
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

    /* Spacing */
    --spacing-xs: 4px;
    --spacing-sm: 8px;
    --spacing-md: 12px;
    --spacing-lg: 16px;
    --spacing-xl: 24px;
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
`;
document.head.appendChild(style);

// Initialize the panel
console.log('[Mosqit Panel] Creating MosqitDevToolsPanel instance...');
const panel = new MosqitDevToolsPanel();
console.log('[Mosqit Panel] Panel instance created');