/**
 * IndexedDB storage for Mosqit logs
 */

interface StoredLog {
  id?: number;
  tabId?: number;
  timestamp: number;
  data: Record<string, unknown>;
}

export class LogStorage {
  private dbName = 'MosqitDB';
  private dbVersion = 1;
  private storeName = 'logs';
  private db: IDBDatabase | null = null;

  constructor() {
    this.initDB();
  }

  private async initDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve(request.result);
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        if (!db.objectStoreNames.contains(this.storeName)) {
          const store = db.createObjectStore(this.storeName, {
            keyPath: 'id',
            autoIncrement: true,
          });

          store.createIndex('tabId', 'tabId', { unique: false });
          store.createIndex('timestamp', 'timestamp', { unique: false });
        }
      };
    });
  }

  private async getDB(): Promise<IDBDatabase> {
    if (!this.db) {
      return await this.initDB();
    }
    return this.db;
  }

  async addLog(logData: Record<string, unknown>, tabId?: number): Promise<void> {
    const db = await this.getDB();
    const transaction = db.transaction([this.storeName], 'readwrite');
    const store = transaction.objectStore(this.storeName);

    const log: StoredLog = {
      tabId,
      timestamp: Date.now(),
      data: logData,
    };

    store.add(log);

    // Clean up old logs (keep last 1000 per tab)
    this.cleanOldLogs(tabId);
  }

  async getLogs(tabId?: number): Promise<StoredLog[]> {
    const db = await this.getDB();
    const transaction = db.transaction([this.storeName], 'readonly');
    const store = transaction.objectStore(this.storeName);

    return new Promise((resolve, reject) => {
      const logs: StoredLog[] = [];
      let request: IDBRequest;

      if (tabId !== undefined) {
        const index = store.index('tabId');
        request = index.openCursor(IDBKeyRange.only(tabId));
      } else {
        request = store.openCursor();
      }

      request.onsuccess = () => {
        const cursor = request.result;
        if (cursor) {
          logs.push(cursor.value);
          cursor.continue();
        } else {
          resolve(logs);
        }
      };

      request.onerror = () => reject(request.error);
    });
  }

  async getLogCount(tabId?: number): Promise<number> {
    const logs = await this.getLogs(tabId);
    return logs.length;
  }

  async clearLogs(tabId?: number): Promise<void> {
    const db = await this.getDB();
    const transaction = db.transaction([this.storeName], 'readwrite');
    const store = transaction.objectStore(this.storeName);

    if (tabId !== undefined) {
      const index = store.index('tabId');
      const request = index.openCursor(IDBKeyRange.only(tabId));

      request.onsuccess = () => {
        const cursor = request.result;
        if (cursor) {
          cursor.delete();
          cursor.continue();
        }
      };
    } else {
      store.clear();
    }
  }

  private async cleanOldLogs(tabId?: number) {
    const logs = await this.getLogs(tabId);

    if (logs.length > 1000) {
      const db = await this.getDB();
      const transaction = db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);

      // Sort by timestamp and delete old ones
      logs.sort((a, b) => a.timestamp - b.timestamp);
      const toDelete = logs.slice(0, logs.length - 1000);

      toDelete.forEach(log => {
        if (log.id) {
          store.delete(log.id);
        }
      });
    }
  }

  async searchLogs(query: string, tabId?: number): Promise<StoredLog[]> {
    const logs = await this.getLogs(tabId);

    return logs.filter(log => {
      const searchStr = JSON.stringify(log.data).toLowerCase();
      return searchStr.includes(query.toLowerCase());
    });
  }

  async getLogsByLevel(level: string, tabId?: number): Promise<StoredLog[]> {
    const logs = await this.getLogs(tabId);

    return logs.filter(log => log.data.level === level);
  }

  async getLogsByTimeRange(start: number, end: number, tabId?: number): Promise<StoredLog[]> {
    const logs = await this.getLogs(tabId);

    return logs.filter(log => {
      return log.timestamp >= start && log.timestamp <= end;
    });
  }
}