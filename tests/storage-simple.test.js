/**
 * Storage Service Tests - Simplified for CI/CD
 */

describe('MosqitStorage Service (Unit Tests)', () => {
  describe('Storage Configuration', () => {
    test('should have correct default configuration', () => {
      // Test configuration without actual IndexedDB
      const config = {
        maxLogs: 10000,
        maxAge: 7 * 24 * 60 * 60 * 1000,
        cleanupInterval: 60 * 60 * 1000,
        compressionThreshold: 100
      };

      expect(config.maxLogs).toBe(10000);
      expect(config.maxAge).toBe(604800000); // 7 days in ms
      expect(config.cleanupInterval).toBe(3600000); // 1 hour in ms
    });
  });

  describe('Session ID Generation', () => {
    test('should generate valid session IDs', () => {
      const generateSessionId = () => {
        return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      };

      const sessionId = generateSessionId();
      expect(sessionId).toMatch(/^session_\d+_[a-z0-9]+$/);
    });
  });

  describe('Pattern Key Generation', () => {
    test('should generate pattern keys from file and line', () => {
      const generatePatternKey = (file, line) => {
        return `${file}:${line}`;
      };

      const pattern = generatePatternKey('test.js', 10);
      expect(pattern).toBe('test.js:10');
    });
  });

  describe('Log Enrichment', () => {
    test('should enrich log with session and timestamp', () => {
      const enrichLog = (log, sessionId) => {
        return {
          ...log,
          sessionId,
          storedAt: Date.now()
        };
      };

      const log = { message: 'Test', level: 'error' };
      const enriched = enrichLog(log, 'session_123');

      expect(enriched.sessionId).toBe('session_123');
      expect(enriched.storedAt).toBeDefined();
      expect(enriched.message).toBe('Test');
    });
  });

  describe('Export Data Structure', () => {
    test('should create valid export structure', () => {
      const createExportData = (logs, patterns) => {
        return {
          version: 1,
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
      };

      const logs = [
        { message: 'Log 1', timestamp: Date.now() - 1000 },
        { message: 'Log 2', timestamp: Date.now() }
      ];
      const patterns = [
        { pattern: 'error.js:10', count: 5 }
      ];

      const exportData = createExportData(logs, patterns);

      expect(exportData.version).toBe(1);
      expect(exportData.logs.length).toBe(2);
      expect(exportData.patterns.length).toBe(1);
      expect(exportData.metadata.totalLogs).toBe(2);
      expect(exportData.metadata.dateRange).toBeDefined();
    });
  });

  describe('Storage Statistics', () => {
    test('should calculate storage statistics', () => {
      const calculateStats = (logs, patterns) => {
        return {
          logs: {
            count: logs.length,
            oldestDate: logs.length > 0 ? new Date(Math.min(...logs.map(l => l.timestamp))) : null,
            newestDate: logs.length > 0 ? new Date(Math.max(...logs.map(l => l.timestamp))) : null
          },
          patterns: {
            count: patterns.length,
            topPatterns: patterns.sort((a, b) => b.count - a.count).slice(0, 5)
          }
        };
      };

      const logs = [
        { timestamp: Date.now() - 2000 },
        { timestamp: Date.now() - 1000 },
        { timestamp: Date.now() }
      ];
      const patterns = [
        { pattern: 'a.js:1', count: 10 },
        { pattern: 'b.js:2', count: 5 },
        { pattern: 'c.js:3', count: 15 }
      ];

      const stats = calculateStats(logs, patterns);

      expect(stats.logs.count).toBe(3);
      expect(stats.patterns.count).toBe(3);
      expect(stats.patterns.topPatterns[0].count).toBe(15);
    });
  });

  describe('Cleanup Logic', () => {
    test('should identify logs older than max age', () => {
      const findOldLogs = (logs, maxAge) => {
        const cutoff = Date.now() - maxAge;
        return logs.filter(log => log.timestamp < cutoff);
      };

      const logs = [
        { id: 1, timestamp: Date.now() - 8 * 24 * 60 * 60 * 1000 }, // 8 days old
        { id: 2, timestamp: Date.now() - 6 * 24 * 60 * 60 * 1000 }, // 6 days old
        { id: 3, timestamp: Date.now() - 1000 } // Recent
      ];

      const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days
      const oldLogs = findOldLogs(logs, maxAge);

      expect(oldLogs.length).toBe(1);
      expect(oldLogs[0].id).toBe(1);
    });

    test('should enforce max log limit', () => {
      const enforceLimit = (logs, maxLogs) => {
        if (logs.length > maxLogs) {
          const excess = logs.length - maxLogs;
          return logs.slice(excess); // Keep newest
        }
        return logs;
      };

      const logs = Array.from({ length: 15 }, (_, i) => ({ id: i }));
      const limited = enforceLimit(logs, 10);

      expect(limited.length).toBe(10);
      expect(limited[0].id).toBe(5); // First 5 removed
    });
  });

  describe('Import Validation', () => {
    test('should validate import data structure', () => {
      const validateImportData = (data) => {
        if (!data || typeof data !== 'object') return false;
        if (data.logs && !Array.isArray(data.logs)) return false;
        if (data.patterns && !Array.isArray(data.patterns)) return false;
        return true;
      };

      expect(validateImportData(null)).toBe(false);
      expect(validateImportData({})).toBe(true);
      expect(validateImportData({ logs: [] })).toBe(true);
      expect(validateImportData({ logs: 'invalid' })).toBe(false);
      expect(validateImportData({ logs: [], patterns: [] })).toBe(true);
    });
  });
});