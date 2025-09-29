// Extension Analytics Module
// Tracks user interactions within the Chrome extension

class ExtensionAnalytics {
  constructor() {
    this.GA_MEASUREMENT_ID = 'G-XXXXXXXXXX'; // Replace with your GA4 Measurement ID
    this.GA_API_SECRET = 'YOUR_API_SECRET'; // Replace with your GA4 API secret
    this.sessionId = this.generateSessionId();
    this.userId = this.getUserId();
    this.events = [];
    this.batchTimer = null;
  }

  // Generate unique session ID
  generateSessionId() {
    return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Get or create user ID (stored in chrome.storage)
  async getUserId() {
    return new Promise((resolve) => {
      chrome.storage.local.get(['analyticsUserId'], (result) => {
        if (result.analyticsUserId) {
          resolve(result.analyticsUserId);
        } else {
          const newUserId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          chrome.storage.local.set({ analyticsUserId: newUserId }, () => {
            resolve(newUserId);
          });
        }
      });
    });
  }

  // Track events using GA4 Measurement Protocol
  async trackEvent(eventName, parameters = {}) {
    const event = {
      name: eventName,
      params: {
        ...parameters,
        session_id: this.sessionId,
        timestamp_micros: Date.now() * 1000,
        engagement_time_msec: 100,
        extension_version: chrome.runtime.getManifest().version,
        browser: this.getBrowserInfo(),
      }
    };

    this.events.push(event);

    // Batch events and send every 5 seconds or when 10 events accumulate
    if (this.events.length >= 10) {
      this.sendEvents();
    } else if (!this.batchTimer) {
      this.batchTimer = setTimeout(() => this.sendEvents(), 5000);
    }
  }

  // Send batched events to GA4
  async sendEvents() {
    if (this.events.length === 0) return;

    const userId = await this.userId;
    const payload = {
      client_id: userId,
      user_id: userId,
      events: this.events.slice(0, 25), // GA4 accepts max 25 events per request
    };

    try {
      // Send to GA4 Measurement Protocol
      await fetch(`https://www.google-analytics.com/mp/collect?measurement_id=${this.GA_MEASUREMENT_ID}&api_secret=${this.GA_API_SECRET}`, {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      // Clear sent events
      this.events = this.events.slice(25);

      // Reset batch timer
      if (this.batchTimer) {
        clearTimeout(this.batchTimer);
        this.batchTimer = null;
      }
    } catch (error) {
      console.error('[Mosqit Analytics] Failed to send events:', error);
    }
  }

  // Get browser information
  getBrowserInfo() {
    const ua = navigator.userAgent;
    if (ua.includes('Chrome')) return 'Chrome';
    if (ua.includes('Firefox')) return 'Firefox';
    if (ua.includes('Safari')) return 'Safari';
    if (ua.includes('Edge')) return 'Edge';
    return 'Unknown';
  }

  // Track panel open
  trackPanelOpen() {
    this.trackEvent('panel_open', {
      event_category: 'extension',
      event_label: 'devtools_panel',
    });
  }

  // Track log capture
  trackLogCapture(level, source) {
    this.trackEvent('log_capture', {
      event_category: 'logs',
      event_label: level,
      log_level: level,
      log_source: source,
    });
  }

  // Track visual bug reporter
  trackVisualBugReporter(action, success = true) {
    this.trackEvent(`visual_bug_${action}`, {
      event_category: 'feature',
      event_label: 'visual_bug_reporter',
      success: success,
    });
  }

  // Track GitHub integration
  trackGitHubAction(action, success = true) {
    this.trackEvent(`github_${action}`, {
      event_category: 'integration',
      event_label: 'github',
      success: success,
    });
  }

  // Track AI analysis
  trackAIAnalysis(type, success = true) {
    this.trackEvent('ai_analysis', {
      event_category: 'ai',
      event_label: type,
      analysis_type: type,
      success: success,
    });
  }

  // Track copy action
  trackCopyAction(contentType) {
    this.trackEvent('copy_content', {
      event_category: 'action',
      event_label: contentType,
      content_type: contentType,
    });
  }

  // Track error
  trackError(errorMessage, errorType) {
    this.trackEvent('error', {
      event_category: 'error',
      event_label: errorType,
      error_message: errorMessage,
      error_type: errorType,
    });
  }

  // Track filter usage
  trackFilter(filterType, value) {
    this.trackEvent('filter_use', {
      event_category: 'interaction',
      event_label: filterType,
      filter_type: filterType,
      filter_value: value,
    });
  }

  // Track settings change
  trackSettings(setting, value) {
    this.trackEvent('settings_change', {
      event_category: 'settings',
      event_label: setting,
      setting_name: setting,
      setting_value: value,
    });
  }

  // Track search
  trackSearch(query, resultsCount) {
    this.trackEvent('search', {
      event_category: 'interaction',
      event_label: 'log_search',
      search_query: query,
      results_count: resultsCount,
    });
  }

  // Track export/import
  trackDataTransfer(action, format) {
    this.trackEvent(`data_${action}`, {
      event_category: 'data',
      event_label: format,
      transfer_action: action,
      transfer_format: format,
    });
  }

  // Track theme change
  trackTheme(theme) {
    this.trackEvent('theme_change', {
      event_category: 'ui',
      event_label: theme,
      theme_name: theme,
    });
  }

  // Track performance metrics
  trackPerformance(metric, value) {
    this.trackEvent('performance', {
      event_category: 'performance',
      event_label: metric,
      metric_name: metric,
      metric_value: value,
    });
  }

  // Track session duration
  trackSessionEnd(duration) {
    this.trackEvent('session_end', {
      event_category: 'session',
      event_label: 'duration',
      session_duration: duration,
      engagement_time_msec: duration * 1000,
    });
  }

  // Track feature discovery
  trackFeatureDiscovery(feature) {
    this.trackEvent('feature_discovery', {
      event_category: 'engagement',
      event_label: feature,
      discovered_feature: feature,
    });
  }

  // Track pattern detection
  trackPatternDetection(patternType, count) {
    this.trackEvent('pattern_detected', {
      event_category: 'intelligence',
      event_label: patternType,
      pattern_type: patternType,
      pattern_count: count,
    });
  }

  // Flush events before unload
  flush() {
    if (this.events.length > 0) {
      this.sendEvents();
    }
  }
}

// Create singleton instance
const analytics = new ExtensionAnalytics();

// Flush events when extension unloads
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => analytics.flush());
}

// Export for use in extension
if (typeof module !== 'undefined' && module.exports) {
  module.exports = analytics;
} else {
  window.mosqitAnalytics = analytics;
}