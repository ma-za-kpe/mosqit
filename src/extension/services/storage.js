/**
 * Mosqit Storage Service - IndexedDB Implementation
 * Handles persistent storage of logs, patterns, and settings
 */

class MosqitStorage {
  constructor(options = {}) {
    this.dbName = 'MosqitDB';
    this.dbVersion = 1;
    this.db = null;

    // Store names
    this.stores = {
      logs: 'logs',
      patterns: 'patterns',
      sessions: 'sessions',
      settings: 'settings'
    };

    // Configuration
    this.config = {
      maxLogs: 10000,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
      cleanupInterval: 60 * 60 * 1000, // 1 hour
      compressionThreshold: 100, // Compress logs older than 100 entries
      ...options.config
    };

    // Skip auto-initialization in test environment
    const isTest = typeof process !== 'undefined' && process.env && process.env.NODE_ENV === 'test';

    this.initializeDB();

    // Only start scheduler if not in test environment or explicitly enabled
    if (!isTest && options.startScheduler !== false) {
      this.startCleanupScheduler();
    }
  }

  /**
   * Initialize IndexedDB
   */
  async initializeDB() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = () => {
        console.error('[Mosqit Storage] Failed to open IndexedDB:', request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        console.log('[Mosqit Storage] IndexedDB initialized successfully');

        // Handle database close/error
        this.db.onerror = (event) => {
          console.error('[Mosqit Storage] Database error:', event.target.error);
        };

        this.db.onclose = () => {
          console.warn('[Mosqit Storage] Database connection closed');
          this.db = null;
        };

        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;

        // Create logs store
        if (!db.objectStoreNames.contains(this.stores.logs)) {
          const logsStore = db.createObjectStore(this.stores.logs, {
            keyPath: 'id',
            autoIncrement: true
          });

          // Indexes for efficient querying
          logsStore.createIndex('timestamp', 'timestamp', { unique: false });
          logsStore.createIndex('level', 'level', { unique: false });
          logsStore.createIndex('file', 'file', { unique: false });
          logsStore.createIndex('url', 'url', { unique: false });
          logsStore.createIndex('sessionId', 'sessionId', { unique: false });
        }

        // Create patterns store
        if (!db.objectStoreNames.contains(this.stores.patterns)) {
          const patternsStore = db.createObjectStore(this.stores.patterns, {
            keyPath: 'pattern'
          });

          patternsStore.createIndex('count', 'count', { unique: false });
          patternsStore.createIndex('lastSeen', 'lastSeen', { unique: false });
          patternsStore.createIndex('severity', 'severity', { unique: false });
        }

        // Create sessions store
        if (!db.objectStoreNames.contains(this.stores.sessions)) {
          const sessionsStore = db.createObjectStore(this.stores.sessions, {
            keyPath: 'id',
            autoIncrement: true
          });

          sessionsStore.createIndex('startTime', 'startTime', { unique: false });
          sessionsStore.createIndex('url', 'url', { unique: false });
        }

        // Create settings store
        if (!db.objectStoreNames.contains(this.stores.settings)) {
          db.createObjectStore(this.stores.settings, {
            keyPath: 'key'
          });
        }

        console.log('[Mosqit Storage] Database schema created/updated');
      };
    });
  }

  /**
   * Ensure database is connected
   */
  async ensureDB() {
    if (!this.db) {
      await this.initializeDB();
    }
    return this.db;
  }

  /**
   * Save a log entry
   */
  async saveLog(logData) {
    try {
      const db = await this.ensureDB();
      const transaction = db.transaction([this.stores.logs], 'readwrite');
      const store = transaction.objectStore(this.stores.logs);

      // Add session ID and storage timestamp
      const enrichedLog = {
        ...logData,
        sessionId: this.getSessionId(),
        storedAt: Date.now()
      };

      const request = store.add(enrichedLog);

      return new Promise((resolve, reject) => {
        request.onsuccess = () => {
          // Check if we need to cleanup
          this.checkLogLimit();
          resolve(request.result);
        };
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('[Mosqit Storage] Failed to save log:', error);
      throw error;
    }
  }

  /**
   * Save multiple logs in batch
   */
  async saveLogs(logs) {
    try {
      const db = await this.ensureDB();
      const transaction = db.transaction([this.stores.logs], 'readwrite');
      const store = transaction.objectStore(this.stores.logs);

      const sessionId = this.getSessionId();
      const promises = logs.map(log => {
        const enrichedLog = {
          ...log,
          sessionId,
          storedAt: Date.now()
        };

        return new Promise((resolve, reject) => {
          const request = store.add(enrichedLog);
          request.onsuccess = () => resolve(request.result);
          request.onerror = () => reject(request.error);
        });
      });

      const results = await Promise.all(promises);
      this.checkLogLimit();
      return results;
    } catch (error) {
      console.error('[Mosqit Storage] Failed to save logs batch:', error);
      throw error;
    }
  }

  /**
   * Get logs with filtering and pagination
   */
  async getLogs(options = {}) {
    try {
      const {
        limit = 100,
        offset = 0,
        level = null,
        startTime = null,
        endTime = null,
        url = null,
        sessionId = null,
        sortBy = 'timestamp',
        sortOrder = 'desc'
      } = options;

      const db = await this.ensureDB();
      const transaction = db.transaction([this.stores.logs], 'readonly');
      const store = transaction.objectStore(this.stores.logs);

      let logs = [];
      let count = 0;

      // Use index if filtering by specific field
      let source = store;
      if (level) {
        source = store.index('level');
      } else if (url) {
        source = store.index('url');
      } else if (sessionId) {
        source = store.index('sessionId');
      } else if (sortBy === 'timestamp') {
        source = store.index('timestamp');
      }

      return new Promise((resolve, reject) => {
        const request = source.openCursor(null, sortOrder === 'desc' ? 'prev' : 'next');

        request.onsuccess = (event) => {
          const cursor = event.target.result;

          if (cursor) {
            const log = cursor.value;

            // Apply filters
            if (level && log.level !== level) {
              cursor.continue();
              return;
            }

            if (startTime && log.timestamp < startTime) {
              cursor.continue();
              return;
            }

            if (endTime && log.timestamp > endTime) {
              cursor.continue();
              return;
            }

            if (url && log.url !== url) {
              cursor.continue();
              return;
            }

            if (sessionId && log.sessionId !== sessionId) {
              cursor.continue();
              return;
            }

            // Skip based on offset
            if (count < offset) {
              count++;
              cursor.continue();
              return;
            }

            // Add to results if within limit
            if (logs.length < limit) {
              logs.push(log);
            }

            // Continue if we need more logs
            if (logs.length < limit) {
              cursor.continue();
            } else {
              resolve(logs);
            }
          } else {
            // No more results
            resolve(logs);
          }
        };

        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('[Mosqit Storage] Failed to get logs:', error);
      throw error;
    }
  }

  /**
   * Get log by ID
   */
  async getLog(id) {
    try {
      const db = await this.ensureDB();
      const transaction = db.transaction([this.stores.logs], 'readonly');
      const store = transaction.objectStore(this.stores.logs);

      return new Promise((resolve, reject) => {
        const request = store.get(id);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('[Mosqit Storage] Failed to get log:', error);
      throw error;
    }
  }

  /**
   * Update error pattern tracking
   */
  async updatePattern(pattern, metadata = {}) {
    try {
      const db = await this.ensureDB();
      const transaction = db.transaction([this.stores.patterns], 'readwrite');
      const store = transaction.objectStore(this.stores.patterns);

      return new Promise(async (resolve, reject) => {
        // Get existing pattern
        const getRequest = store.get(pattern);

        getRequest.onsuccess = () => {
          const existing = getRequest.result;

          const updated = existing ? {
            ...existing,
            count: (existing.count || 0) + 1,
            lastSeen: Date.now(),
            ...metadata
          } : {
            pattern,
            count: 1,
            firstSeen: Date.now(),
            lastSeen: Date.now(),
            ...metadata
          };

          const putRequest = store.put(updated);
          putRequest.onsuccess = () => resolve(updated);
          putRequest.onerror = () => reject(putRequest.error);
        };

        getRequest.onerror = () => reject(getRequest.error);
      });
    } catch (error) {
      console.error('[Mosqit Storage] Failed to update pattern:', error);
      throw error;
    }
  }

  /**
   * Get error patterns
   */
  async getPatterns(options = {}) {
    try {
      const { limit = 50, minCount = 1 } = options;

      const db = await this.ensureDB();
      const transaction = db.transaction([this.stores.patterns], 'readonly');
      const store = transaction.objectStore(this.stores.patterns);
      const index = store.index('count');

      const patterns = [];

      return new Promise((resolve, reject) => {
        const request = index.openCursor(null, 'prev'); // Sort by count descending

        request.onsuccess = (event) => {
          const cursor = event.target.result;

          if (cursor) {
            const pattern = cursor.value;

            if (pattern.count >= minCount) {
              patterns.push(pattern);
            }

            if (patterns.length < limit) {
              cursor.continue();
            } else {
              resolve(patterns);
            }
          } else {
            resolve(patterns);
          }
        };

        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('[Mosqit Storage] Failed to get patterns:', error);
      throw error;
    }
  }

  /**
   * Save settings
   */
  async saveSetting(key, value) {
    try {
      const db = await this.ensureDB();
      const transaction = db.transaction([this.stores.settings], 'readwrite');
      const store = transaction.objectStore(this.stores.settings);

      return new Promise((resolve, reject) => {
        const request = store.put({ key, value, updatedAt: Date.now() });
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('[Mosqit Storage] Failed to save setting:', error);
      throw error;
    }
  }

  /**
   * Get settings
   */
  async getSetting(key, defaultValue = null) {
    try {
      const db = await this.ensureDB();
      const transaction = db.transaction([this.stores.settings], 'readonly');
      const store = transaction.objectStore(this.stores.settings);

      return new Promise((resolve, reject) => {
        const request = store.get(key);
        request.onsuccess = () => {
          const result = request.result;
          resolve(result ? result.value : defaultValue);
        };
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('[Mosqit Storage] Failed to get setting:', error);
      return defaultValue;
    }
  }

  /**
   * Check and enforce log limit
   */
  async checkLogLimit() {
    try {
      const db = await this.ensureDB();
      const transaction = db.transaction([this.stores.logs], 'readwrite');
      const store = transaction.objectStore(this.stores.logs);

      const countRequest = store.count();

      countRequest.onsuccess = async () => {
        const count = countRequest.result;

        if (count > this.config.maxLogs) {
          const excess = count - this.config.maxLogs;
          await this.deleteOldestLogs(excess);
        }
      };
    } catch (error) {
      console.error('[Mosqit Storage] Failed to check log limit:', error);
    }
  }

  /**
   * Delete oldest logs
   */
  async deleteOldestLogs(count) {
    try {
      const db = await this.ensureDB();
      const transaction = db.transaction([this.stores.logs], 'readwrite');
      const store = transaction.objectStore(this.stores.logs);
      const index = store.index('timestamp');

      let deleted = 0;

      return new Promise((resolve, reject) => {
        const request = index.openCursor();

        request.onsuccess = (event) => {
          const cursor = event.target.result;

          if (cursor && deleted < count) {
            cursor.delete();
            deleted++;
            cursor.continue();
          } else {
            console.log(`[Mosqit Storage] Deleted ${deleted} old logs`);
            resolve(deleted);
          }
        };

        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('[Mosqit Storage] Failed to delete old logs:', error);
      throw error;
    }
  }

  /**
   * Clean up old logs based on age
   */
  async cleanupOldLogs() {
    try {
      const cutoffTime = Date.now() - this.config.maxAge;

      const db = await this.ensureDB();
      const transaction = db.transaction([this.stores.logs], 'readwrite');
      const store = transaction.objectStore(this.stores.logs);
      const index = store.index('timestamp');

      const range = IDBKeyRange.upperBound(cutoffTime);
      let deleted = 0;

      return new Promise((resolve, reject) => {
        const request = index.openCursor(range);

        request.onsuccess = (event) => {
          const cursor = event.target.result;

          if (cursor) {
            cursor.delete();
            deleted++;
            cursor.continue();
          } else {
            if (deleted > 0) {
              console.log(`[Mosqit Storage] Cleaned up ${deleted} old logs`);
            }
            resolve(deleted);
          }
        };

        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('[Mosqit Storage] Failed to cleanup old logs:', error);
    }
  }

  /**
   * Export logs to JSON
   */
  async exportLogs(options = {}) {
    try {
      const logs = await this.getLogs({ ...options, limit: 10000 });
      const patterns = await this.getPatterns();

      const exportData = {
        version: this.dbVersion,
        exportDate: new Date().toISOString(),
        logs,
        patterns,
        metadata: {
          totalLogs: logs.length,
          totalPatterns: patterns.length,
          dateRange: logs.length > 0 ? {
            start: new Date(Math.min(...logs.map(l => l.timestamp))).toISOString(),
            end: new Date(Math.max(...logs.map(l => l.timestamp))).toISOString()
          } : null
        }
      };

      return exportData;
    } catch (error) {
      console.error('[Mosqit Storage] Failed to export logs:', error);
      throw error;
    }
  }

  /**
   * Import logs from JSON
   */
  async importLogs(data) {
    try {
      if (!data || !data.logs) {
        throw new Error('Invalid import data');
      }

      // Import logs
      if (data.logs && data.logs.length > 0) {
        await this.saveLogs(data.logs);
      }

      // Import patterns
      if (data.patterns && data.patterns.length > 0) {
        const db = await this.ensureDB();
        const transaction = db.transaction([this.stores.patterns], 'readwrite');
        const store = transaction.objectStore(this.stores.patterns);

        for (const pattern of data.patterns) {
          store.put(pattern);
        }
      }

      return {
        logsImported: data.logs ? data.logs.length : 0,
        patternsImported: data.patterns ? data.patterns.length : 0
      };
    } catch (error) {
      console.error('[Mosqit Storage] Failed to import logs:', error);
      throw error;
    }
  }

  /**
   * Clear all logs
   */
  async clearLogs() {
    try {
      const db = await this.ensureDB();
      const transaction = db.transaction([this.stores.logs], 'readwrite');
      const store = transaction.objectStore(this.stores.logs);

      return new Promise((resolve, reject) => {
        const request = store.clear();
        request.onsuccess = () => {
          console.log('[Mosqit Storage] All logs cleared');
          resolve();
        };
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('[Mosqit Storage] Failed to clear logs:', error);
      throw error;
    }
  }

  /**
   * Clear all data
   */
  async clearAll() {
    try {
      const db = await this.ensureDB();
      const transaction = db.transaction(
        [this.stores.logs, this.stores.patterns, this.stores.sessions],
        'readwrite'
      );

      const promises = [
        transaction.objectStore(this.stores.logs).clear(),
        transaction.objectStore(this.stores.patterns).clear(),
        transaction.objectStore(this.stores.sessions).clear()
      ].map(request => new Promise((resolve, reject) => {
        request.onsuccess = resolve;
        request.onerror = reject;
      }));

      await Promise.all(promises);
      console.log('[Mosqit Storage] All data cleared');
    } catch (error) {
      console.error('[Mosqit Storage] Failed to clear all data:', error);
      throw error;
    }
  }

  /**
   * Get or create session ID
   */
  getSessionId() {
    if (!this.sessionId) {
      this.sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    return this.sessionId;
  }

  /**
   * Start cleanup scheduler
   */
  startCleanupScheduler() {
    // Run cleanup every hour
    this.cleanupIntervalId = setInterval(() => {
      this.cleanupOldLogs();
    }, this.config.cleanupInterval);

    // Run initial cleanup after 10 seconds
    this.cleanupTimeoutId = setTimeout(() => {
      this.cleanupOldLogs();
    }, 10000);
  }

  /**
   * Stop cleanup scheduler (for testing)
   */
  stopCleanupScheduler() {
    if (this.cleanupIntervalId) {
      clearInterval(this.cleanupIntervalId);
      this.cleanupIntervalId = null;
    }
    if (this.cleanupTimeoutId) {
      clearTimeout(this.cleanupTimeoutId);
      this.cleanupTimeoutId = null;
    }
  }

  /**
   * Get storage statistics
   */
  async getStats() {
    try {
      const db = await this.ensureDB();

      const stats = {
        logs: { count: 0, oldestDate: null, newestDate: null },
        patterns: { count: 0, topPatterns: [] },
        storage: { estimatedSize: 0 }
      };

      // Get log stats
      const logsTransaction = db.transaction([this.stores.logs], 'readonly');
      const logsStore = logsTransaction.objectStore(this.stores.logs);

      const countRequest = logsStore.count();
      stats.logs.count = await new Promise((resolve, reject) => {
        countRequest.onsuccess = () => resolve(countRequest.result);
        countRequest.onerror = reject;
      });

      // Get patterns stats
      const patterns = await this.getPatterns({ limit: 5 });
      stats.patterns.count = patterns.length;
      stats.patterns.topPatterns = patterns;

      // Estimate storage size
      if ('storage' in navigator && 'estimate' in navigator.storage) {
        const estimate = await navigator.storage.estimate();
        stats.storage.estimatedSize = estimate.usage || 0;
        stats.storage.quota = estimate.quota || 0;
      }

      return stats;
    } catch (error) {
      console.error('[Mosqit Storage] Failed to get stats:', error);
      throw error;
    }
  }
}

// Export for use in extension
if (typeof module !== 'undefined' && module.exports) {
  module.exports = MosqitStorage;
} else if (typeof window !== 'undefined') {
  window.MosqitStorage = MosqitStorage;
}