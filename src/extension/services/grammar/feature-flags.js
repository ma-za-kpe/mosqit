/**
 * Grammar Feature Flags System
 * Controls which grammar features are enabled
 * All features default to OFF for safe rollout
 */

// Default configuration
const DEFAULT_GRAMMAR_CONFIG = {
  // Master toggle - everything disabled by default
  enabled: false,

  // Feature-level toggles
  features: {
    basicGrammar: true,          // Proofreader API (Phase 1)
    toneDetection: false,        // Empathy meter (Phase 2)
    commitWizard: false,         // Git message suggestions (Phase 2)
    contextAwareness: false,     // Platform detection (Phase 2)
    autocomplete: false,         // Writer API (Phase 3)
    rewriting: false,            // Rewriter API (Phase 3)
    summarization: false,        // Summarizer API (Phase 3)
    writingMemory: false,        // Local index (Phase 3)
    accessibility: false         // Dyslexia/ESL (Phase 3)
  },

  // Platform-level toggles
  platforms: {
    gmail: true,
    github: true,
    slack: false,
    twitter: false,
    linkedin: false,
    notion: false,
    'all-text-inputs': false  // Universal (risky, default off)
  },

  // Privacy settings
  privacy: {
    collectAnonymousStats: false,           // Opt-in only
    contributeFederatedLearning: false,     // Opt-in only
    showPrivacyDashboard: true
  },

  // Performance settings
  performance: {
    maxConcurrentSessions: 3,               // AI session pool size
    suggestionDebounceMs: 300,              // Typing delay before checking
    enableCaching: true,
    enableSessionPooling: true,
    maxTextLength: 5000                     // Max chars to analyze
  },

  // UI preferences
  ui: {
    showInlineSuggestions: true,
    showDevToolsPanel: true,
    highlightColor: '#FF006E',              // Mosqit pink
    animationsEnabled: true
  }
};

class GrammarFeatureFlags {
  constructor() {
    this.config = { ...DEFAULT_GRAMMAR_CONFIG };
    this.listeners = new Set();
    this.loaded = false;
  }

  /**
   * Initialize and load settings from storage
   */
  async init() {
    if (this.loaded) return;

    try {
      const stored = await this.loadFromStorage();
      if (stored) {
        this.config = this.mergeConfig(DEFAULT_GRAMMAR_CONFIG, stored);
      }
      this.loaded = true;
      console.log('[Grammar Flags] Initialized:', this.config);
    } catch (error) {
      console.error('[Grammar Flags] Failed to load settings:', error);
      this.config = { ...DEFAULT_GRAMMAR_CONFIG };
    }
  }

  /**
   * Load configuration from Chrome storage
   */
  async loadFromStorage() {
    return new Promise((resolve) => {
      chrome.storage.sync.get(['grammarConfig'], (result) => {
        resolve(result.grammarConfig || null);
      });
    });
  }

  /**
   * Save configuration to Chrome storage
   */
  async saveToStorage() {
    return new Promise((resolve, reject) => {
      chrome.storage.sync.set({ grammarConfig: this.config }, () => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          console.log('[Grammar Flags] Saved to storage');
          this.notifyListeners();
          resolve();
        }
      });
    });
  }

  /**
   * Deep merge two config objects
   */
  mergeConfig(defaults, stored) {
    const merged = { ...defaults };

    for (const key in stored) {
      if (typeof stored[key] === 'object' && !Array.isArray(stored[key])) {
        merged[key] = { ...defaults[key], ...stored[key] };
      } else {
        merged[key] = stored[key];
      }
    }

    return merged;
  }

  /**
   * Check if grammar features are enabled at all
   */
  isEnabled() {
    return this.config.enabled;
  }

  /**
   * Check if a specific feature is enabled
   */
  isFeatureEnabled(featureName) {
    return this.config.enabled &&
           this.config.features[featureName] === true;
  }

  /**
   * Check if a specific platform is enabled
   */
  isPlatformEnabled(platformName) {
    return this.config.enabled &&
           this.config.platforms[platformName] === true;
  }

  /**
   * Get a configuration value
   */
  get(path) {
    const parts = path.split('.');
    let value = this.config;

    for (const part of parts) {
      value = value[part];
      if (value === undefined) return undefined;
    }

    return value;
  }

  /**
   * Set a configuration value
   */
  async set(path, value) {
    const parts = path.split('.');
    let obj = this.config;

    for (let i = 0; i < parts.length - 1; i++) {
      obj = obj[parts[i]];
    }

    obj[parts[parts.length - 1]] = value;
    await this.saveToStorage();
  }

  /**
   * Enable grammar features (master toggle)
   */
  async enable() {
    this.config.enabled = true;
    await this.saveToStorage();
  }

  /**
   * Disable grammar features (master toggle)
   */
  async disable() {
    this.config.enabled = false;
    await this.saveToStorage();
  }

  /**
   * Reset to default configuration
   */
  async reset() {
    this.config = { ...DEFAULT_GRAMMAR_CONFIG };
    await this.saveToStorage();
  }

  /**
   * Get entire configuration (for DevTools display)
   */
  getAll() {
    return { ...this.config };
  }

  /**
   * Listen for configuration changes
   */
  addListener(callback) {
    this.listeners.add(callback);
  }

  /**
   * Remove configuration listener
   */
  removeListener(callback) {
    this.listeners.delete(callback);
  }

  /**
   * Notify all listeners of changes
   */
  notifyListeners() {
    this.listeners.forEach(callback => {
      try {
        callback(this.config);
      } catch (error) {
        console.error('[Grammar Flags] Listener error:', error);
      }
    });
  }
}

// Singleton instance
const grammarFlags = new GrammarFeatureFlags();

// Auto-initialize
if (typeof chrome !== 'undefined' && chrome.storage) {
  grammarFlags.init().catch(console.error);
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = grammarFlags;
}
