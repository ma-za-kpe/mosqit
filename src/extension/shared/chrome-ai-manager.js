/**
 * Chrome AI Manager
 * Centralized management of Chrome Built-in AI sessions
 * Shared by debugging and grammar features
 */

class ChromeAIManager {
  constructor() {
    this.sessions = {
      proofreader: [],
      writer: [],
      rewriter: [],
      summarizer: [],
      languageModel: []
    };

    this.maxPoolSize = 3; // Max sessions per type
    this.aiAvailable = null; // null = unknown, true/false = checked
    this.capabilities = {};
  }

  /**
   * Check if Chrome AI is available
   */
  async checkAvailability() {
    if (this.aiAvailable !== null) {
      return this.aiAvailable;
    }

    try {
      // Check if AI namespace exists
      if (typeof ai === 'undefined' || !ai) {
        console.log('[Chrome AI] AI namespace not available');
        this.aiAvailable = false;
        return false;
      }

      // Check Proofreader API
      if (ai.proofreader) {
        const proofreaderCapabilities = await ai.proofreader.capabilities();
        this.capabilities.proofreader = proofreaderCapabilities;
        console.log('[Chrome AI] Proofreader available:', proofreaderCapabilities.available);
      }

      // Check Writer API (if available)
      if (ai.writer) {
        try {
          const writerCapabilities = await ai.writer.capabilities();
          this.capabilities.writer = writerCapabilities;
          console.log('[Chrome AI] Writer available:', writerCapabilities.available);
        } catch (e) {
          console.log('[Chrome AI] Writer not available yet');
        }
      }

      // Check Rewriter API (if available)
      if (ai.rewriter) {
        try {
          const rewriterCapabilities = await ai.rewriter.capabilities();
          this.capabilities.rewriter = rewriterCapabilities;
          console.log('[Chrome AI] Rewriter available:', rewriterCapabilities.available);
        } catch (e) {
          console.log('[Chrome AI] Rewriter not available yet');
        }
      }

      // Check Summarizer API (if available)
      if (ai.summarizer) {
        try {
          const summarizerCapabilities = await ai.summarizer.capabilities();
          this.capabilities.summarizer = summarizerCapabilities;
          console.log('[Chrome AI] Summarizer available:', summarizerCapabilities.available);
        } catch (e) {
          console.log('[Chrome AI] Summarizer not available yet');
        }
      }

      // Check Language Model (Prompt API)
      if (ai.languageModel) {
        try {
          const languageModelCapabilities = await ai.languageModel.capabilities();
          this.capabilities.languageModel = languageModelCapabilities;
          console.log('[Chrome AI] Language Model available:', languageModelCapabilities.available);
        } catch (e) {
          console.log('[Chrome AI] Language Model not available yet');
        }
      }

      this.aiAvailable = Object.keys(this.capabilities).length > 0;
      console.log('[Chrome AI] Available capabilities:', Object.keys(this.capabilities));

      return this.aiAvailable;
    } catch (error) {
      console.error('[Chrome AI] Error checking availability:', error);
      this.aiAvailable = false;
      return false;
    }
  }

  /**
   * Get or create a Proofreader session
   */
  async getProofreaderSession() {
    const pool = this.sessions.proofreader;

    // Try to reuse an existing session
    const available = pool.find(s => !s.inUse && !s.destroyed);
    if (available) {
      available.inUse = true;
      available.lastUsed = Date.now();
      console.log('[Chrome AI] Reusing proofreader session');
      return available;
    }

    // Create new session if pool not full
    if (pool.length < this.maxPoolSize) {
      try {
        const session = await ai.proofreader.create();
        const wrapper = {
          session,
          type: 'proofreader',
          inUse: true,
          destroyed: false,
          created: Date.now(),
          lastUsed: Date.now()
        };
        pool.push(wrapper);
        console.log('[Chrome AI] Created new proofreader session');
        return wrapper;
      } catch (error) {
        console.error('[Chrome AI] Failed to create proofreader session:', error);
        throw error;
      }
    }

    // Pool full, wait for one to become available
    console.log('[Chrome AI] Session pool full, waiting...');
    return new Promise((resolve) => {
      const checkInterval = setInterval(() => {
        const available = pool.find(s => !s.inUse && !s.destroyed);
        if (available) {
          clearInterval(checkInterval);
          available.inUse = true;
          available.lastUsed = Date.now();
          resolve(available);
        }
      }, 100);

      // Timeout after 5 seconds
      setTimeout(() => {
        clearInterval(checkInterval);
        resolve(null);
      }, 5000);
    });
  }

  /**
   * Get or create a Writer session
   */
  async getWriterSession(options = {}) {
    const pool = this.sessions.writer;

    // Try to reuse session with matching options
    const available = pool.find(s =>
      !s.inUse &&
      !s.destroyed &&
      this.matchesOptions(s.options, options)
    );

    if (available) {
      available.inUse = true;
      available.lastUsed = Date.now();
      console.log('[Chrome AI] Reusing writer session');
      return available;
    }

    // Create new session
    if (pool.length < this.maxPoolSize) {
      try {
        const session = await ai.writer.create(options);
        const wrapper = {
          session,
          type: 'writer',
          options,
          inUse: true,
          destroyed: false,
          created: Date.now(),
          lastUsed: Date.now()
        };
        pool.push(wrapper);
        console.log('[Chrome AI] Created new writer session');
        return wrapper;
      } catch (error) {
        console.error('[Chrome AI] Failed to create writer session:', error);
        throw error;
      }
    }

    return null;
  }

  /**
   * Get or create a Language Model session
   */
  async getLanguageModelSession(options = {}) {
    const pool = this.sessions.languageModel;

    const available = pool.find(s =>
      !s.inUse &&
      !s.destroyed &&
      this.matchesOptions(s.options, options)
    );

    if (available) {
      available.inUse = true;
      available.lastUsed = Date.now();
      return available;
    }

    if (pool.length < this.maxPoolSize) {
      try {
        const session = await ai.languageModel.create(options);
        const wrapper = {
          session,
          type: 'languageModel',
          options,
          inUse: true,
          destroyed: false,
          created: Date.now(),
          lastUsed: Date.now()
        };
        pool.push(wrapper);
        console.log('[Chrome AI] Created new language model session');
        return wrapper;
      } catch (error) {
        console.error('[Chrome AI] Failed to create language model session:', error);
        throw error;
      }
    }

    return null;
  }

  /**
   * Release a session back to the pool
   */
  releaseSession(wrapper) {
    if (!wrapper) return;

    wrapper.inUse = false;
    wrapper.lastUsed = Date.now();

    // Auto-cleanup old sessions after 30 seconds
    setTimeout(() => {
      this.cleanupOldSessions(wrapper.type);
    }, 30000);
  }

  /**
   * Cleanup old unused sessions
   */
  cleanupOldSessions(type) {
    const pool = this.sessions[type];
    const now = Date.now();
    const maxAge = 60000; // 60 seconds

    const toRemove = pool.filter(s =>
      !s.inUse &&
      !s.destroyed &&
      (now - s.lastUsed) > maxAge
    );

    toRemove.forEach(s => {
      try {
        if (s.session && s.session.destroy) {
          s.session.destroy();
        }
        s.destroyed = true;
        console.log(`[Chrome AI] Destroyed old ${type} session`);
      } catch (error) {
        console.error(`[Chrome AI] Error destroying ${type} session:`, error);
      }
    });

    // Remove destroyed sessions from pool
    this.sessions[type] = pool.filter(s => !s.destroyed);
  }

  /**
   * Check if session options match
   */
  matchesOptions(opts1, opts2) {
    if (!opts1 && !opts2) return true;
    if (!opts1 || !opts2) return false;

    const keys1 = Object.keys(opts1);
    const keys2 = Object.keys(opts2);

    if (keys1.length !== keys2.length) return false;

    return keys1.every(key => opts1[key] === opts2[key]);
  }

  /**
   * Get capabilities for a specific API
   */
  getCapabilities(apiType) {
    return this.capabilities[apiType] || null;
  }

  /**
   * Check if a specific API is available
   */
  isAPIAvailable(apiType) {
    const caps = this.capabilities[apiType];
    return caps && caps.available === 'readily';
  }

  /**
   * Destroy all sessions and cleanup
   */
  destroyAll() {
    Object.keys(this.sessions).forEach(type => {
      this.sessions[type].forEach(wrapper => {
        try {
          if (wrapper.session && wrapper.session.destroy) {
            wrapper.session.destroy();
          }
          wrapper.destroyed = true;
        } catch (error) {
          console.error(`[Chrome AI] Error destroying ${type} session:`, error);
        }
      });
      this.sessions[type] = [];
    });
    console.log('[Chrome AI] All sessions destroyed');
  }

  /**
   * Get session pool statistics
   */
  getStats() {
    const stats = {};

    Object.keys(this.sessions).forEach(type => {
      const pool = this.sessions[type];
      stats[type] = {
        total: pool.length,
        inUse: pool.filter(s => s.inUse).length,
        available: pool.filter(s => !s.inUse && !s.destroyed).length,
        destroyed: pool.filter(s => s.destroyed).length
      };
    });

    return stats;
  }
}

// Singleton instance
const chromeAI = new ChromeAIManager();

// Auto-check availability on load
if (typeof ai !== 'undefined') {
  chromeAI.checkAvailability().catch(console.error);
}

// Export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = chromeAI;
}
