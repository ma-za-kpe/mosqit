/**
 * Mosqit Grammar DevTools Panel
 * Displays grammar statistics and settings
 */

class GrammarPanel {
  constructor() {
    this.config = null;
    this.stats = {
      checksPerformed: 0,
      errorsFound: 0,
      errorsCorrected: 0,
      avgProcessingTime: 0
    };
    this.tabId = chrome.devtools.inspectedWindow.tabId;
  }

  /**
   * Initialize the panel
   */
  async init() {
    console.log('[Grammar Panel] Initializing...');
    await this.loadConfig();
    this.render();
    this.setupEventListeners();
    this.connectToBackground();
  }

  /**
   * Load configuration from storage
   */
  async loadConfig() {
    return new Promise((resolve) => {
      chrome.storage.sync.get(['grammarConfig'], (result) => {
        this.config = result.grammarConfig || this.getDefaultConfig();
        console.log('[Grammar Panel] Config loaded:', this.config);
        resolve();
      });
    });
  }

  /**
   * Get default configuration
   */
  getDefaultConfig() {
    return {
      enabled: false,
      features: {
        basicGrammar: true,
        toneDetection: false,
        commitWizard: false,
        contextAwareness: false
      },
      platforms: {
        gmail: true,
        github: true,
        slack: false,
        twitter: false,
        linkedin: false
      },
      privacy: {
        collectAnonymousStats: false,
        showPrivacyDashboard: true
      }
    };
  }

  /**
   * Save configuration
   */
  async saveConfig() {
    return new Promise((resolve) => {
      chrome.storage.sync.set({ grammarConfig: this.config }, () => {
        console.log('[Grammar Panel] Config saved');
        this.notifyConfigChange();
        resolve();
      });
    });
  }

  /**
   * Notify content script of config changes
   */
  notifyConfigChange() {
    chrome.tabs.sendMessage(this.tabId, {
      type: 'GRAMMAR_CONFIG_CHANGED',
      config: this.config
    });
  }

  /**
   * Connect to background script for stats updates
   */
  connectToBackground() {
    // Listen for stats updates
    chrome.runtime.onMessage.addListener((message) => {
      if (message.type === 'GRAMMAR_STATS_UPDATE') {
        this.stats = message.stats;
        this.updateStats();
      }
    });
  }

  /**
   * Render the panel
   */
  render() {
    const root = document.getElementById('grammar-panel-root');

    root.innerHTML = `
      <div class="grammar-header">
        <div class="grammar-brand">
          <div class="grammar-icon">🦟</div>
          <div class="grammar-title">
            <div class="grammar-name">MOSQIT GRAMMAR</div>
            <div class="grammar-tagline">AI-Powered Writing Assistant</div>
          </div>
        </div>
        <div class="grammar-status ${this.config.enabled ? 'enabled' : 'disabled'}" id="status-indicator">
          <span class="status-dot"></span>
          <span>${this.config.enabled ? 'Active' : 'Disabled'}</span>
        </div>
      </div>

      <div class="grammar-content">
        ${this.config.enabled ? this.renderEnabledView() : this.renderDisabledView()}
      </div>
    `;
  }

  /**
   * Render enabled view (with stats and settings)
   */
  renderEnabledView() {
    return `
      <!-- Stats Grid -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-label">Checks Performed</div>
          <div class="stat-value" id="stat-checks">${this.stats.checksPerformed}</div>
          <div class="stat-sublabel">Total grammar checks</div>
        </div>

        <div class="stat-card">
          <div class="stat-label">Issues Found</div>
          <div class="stat-value" id="stat-errors">${this.stats.errorsFound}</div>
          <div class="stat-sublabel">Grammar & style issues</div>
        </div>

        <div class="stat-card">
          <div class="stat-label">Corrections Applied</div>
          <div class="stat-value" id="stat-corrected">${this.stats.errorsCorrected}</div>
          <div class="stat-sublabel">Accepted suggestions</div>
        </div>

        <div class="stat-card">
          <div class="stat-label">Avg Processing</div>
          <div class="stat-value" id="stat-time">${this.stats.avgProcessingTime}ms</div>
          <div class="stat-sublabel">Per check</div>
        </div>
      </div>

      <!-- Features Section -->
      <div class="settings-section">
        <div class="section-header">
          <div class="section-title">
            <span>✨</span>
            <span>Features</span>
          </div>
        </div>
        <div class="section-content">
          ${this.renderFeatureToggles()}
        </div>
      </div>

      <!-- Platforms Section -->
      <div class="settings-section">
        <div class="section-header">
          <div class="section-title">
            <span>🌐</span>
            <span>Enabled Platforms</span>
          </div>
        </div>
        <div class="section-content">
          <div class="platform-pills">
            ${this.renderPlatformPills()}
          </div>
        </div>
      </div>

      <!-- Privacy Section -->
      <div class="settings-section">
        <div class="section-header">
          <div class="section-title">
            <span>🔐</span>
            <span>Privacy</span>
          </div>
        </div>
        <div class="section-content">
          <div class="privacy-indicator">
            <div class="privacy-icon">🔒</div>
            <div class="privacy-text">
              <strong>100% Private:</strong> All text processing happens locally on your device.
              Zero data is sent to cloud servers.
            </div>
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div class="btn-group">
        <button class="btn btn-secondary" id="btn-disable">
          Disable Grammar Features
        </button>
        <button class="btn btn-secondary" id="btn-reset">
          Reset to Defaults
        </button>
      </div>
    `;
  }

  /**
   * Render disabled view
   */
  renderDisabledView() {
    return `
      <div class="empty-state">
        <div class="empty-icon">🦟</div>
        <div class="empty-title">Grammar Features Disabled</div>
        <div class="empty-description">
          Enable Mosqit Grammar to get AI-powered writing assistance across Gmail, GitHub, Slack, and more.
          All processing happens locally on your device for complete privacy.
        </div>
        <button class="btn btn-primary" id="btn-enable">
          <span>⚡</span>
          <span>Enable Grammar Features</span>
        </button>

        <div class="privacy-indicator" style="max-width: 500px; margin: 20px auto 0;">
          <div class="privacy-icon">🔒</div>
          <div class="privacy-text">
            <strong>Privacy First:</strong> Mosqit Grammar runs 100% locally using Chrome's built-in AI.
            Your text never leaves your device.
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Render feature toggles
   */
  renderFeatureToggles() {
    const features = [
      {
        key: 'basicGrammar',
        name: 'Grammar & Spelling',
        description: 'Catch typos, grammar errors, and punctuation mistakes'
      },
      {
        key: 'toneDetection',
        name: 'Tone Detection',
        description: 'Analyze empathy and suggest tone improvements',
        badge: 'Phase 2'
      },
      {
        key: 'commitWizard',
        name: 'Commit Message Wizard',
        description: 'AI-generated commit messages from code changes',
        badge: 'Phase 2'
      },
      {
        key: 'contextAwareness',
        name: 'Context Awareness',
        description: 'Adapt suggestions based on platform (Email vs Tweet vs GitHub)',
        badge: 'Phase 2'
      }
    ];

    return features.map(feature => `
      <div class="toggle-group">
        <div class="toggle-label">
          <div class="toggle-name">
            ${feature.name}
            ${feature.badge ? `<span style="font-size: 10px; color: #888; font-weight: normal;">(${feature.badge})</span>` : ''}
          </div>
          <div class="toggle-description">${feature.description}</div>
        </div>
        <div class="toggle-switch ${this.config.features[feature.key] ? 'active' : ''}"
             data-feature="${feature.key}"
             ${feature.badge ? 'style="opacity: 0.5; cursor: not-allowed;"' : ''}>
          <div class="toggle-slider"></div>
        </div>
      </div>
    `).join('');
  }

  /**
   * Render platform pills
   */
  renderPlatformPills() {
    const platforms = [
      { key: 'gmail', name: 'Gmail', icon: '📧' },
      { key: 'github', name: 'GitHub', icon: '🐙' },
      { key: 'slack', name: 'Slack', icon: '💬' },
      { key: 'twitter', name: 'Twitter', icon: '🐦' },
      { key: 'linkedin', name: 'LinkedIn', icon: '💼' }
    ];

    return platforms.map(platform => `
      <div class="platform-pill ${this.config.platforms[platform.key] ? 'active' : ''}"
           data-platform="${platform.key}">
        <span>${platform.icon}</span>
        <span>${platform.name}</span>
      </div>
    `).join('');
  }

  /**
   * Setup event listeners
   */
  setupEventListeners() {
    // Enable button
    const enableBtn = document.getElementById('btn-enable');
    if (enableBtn) {
      enableBtn.addEventListener('click', () => this.enableGrammar());
    }

    // Disable button
    const disableBtn = document.getElementById('btn-disable');
    if (disableBtn) {
      disableBtn.addEventListener('click', () => this.disableGrammar());
    }

    // Reset button
    const resetBtn = document.getElementById('btn-reset');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => this.resetSettings());
    }

    // Feature toggles
    document.querySelectorAll('.toggle-switch').forEach(toggle => {
      if (!toggle.style.cursor || toggle.style.cursor !== 'not-allowed') {
        toggle.addEventListener('click', (e) => {
          const feature = e.currentTarget.dataset.feature;
          this.toggleFeature(feature);
        });
      }
    });

    // Platform pills
    document.querySelectorAll('.platform-pill').forEach(pill => {
      pill.addEventListener('click', (e) => {
        const platform = e.currentTarget.dataset.platform;
        this.togglePlatform(platform);
      });
    });
  }

  /**
   * Enable grammar features
   */
  async enableGrammar() {
    this.config.enabled = true;
    await this.saveConfig();
    this.render();
    this.setupEventListeners();
  }

  /**
   * Disable grammar features
   */
  async disableGrammar() {
    this.config.enabled = false;
    await this.saveConfig();
    this.render();
    this.setupEventListeners();
  }

  /**
   * Toggle a feature
   */
  async toggleFeature(featureKey) {
    this.config.features[featureKey] = !this.config.features[featureKey];
    await this.saveConfig();
    this.render();
    this.setupEventListeners();
  }

  /**
   * Toggle a platform
   */
  async togglePlatform(platformKey) {
    this.config.platforms[platformKey] = !this.config.platforms[platformKey];
    await this.saveConfig();
    this.render();
    this.setupEventListeners();
  }

  /**
   * Reset settings to defaults
   */
  async resetSettings() {
    if (confirm('Reset all grammar settings to defaults?')) {
      this.config = this.getDefaultConfig();
      await this.saveConfig();
      this.render();
      this.setupEventListeners();
    }
  }

  /**
   * Update stats display
   */
  updateStats() {
    const statsElements = {
      'stat-checks': this.stats.checksPerformed,
      'stat-errors': this.stats.errorsFound,
      'stat-corrected': this.stats.errorsCorrected,
      'stat-time': Math.round(this.stats.avgProcessingTime)
    };

    for (const [id, value] of Object.entries(statsElements)) {
      const element = document.getElementById(id);
      if (element) {
        element.textContent = value + (id === 'stat-time' ? 'ms' : '');
      }
    }
  }
}

// Initialize panel when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  const panel = new GrammarPanel();
  panel.init();
});
