/**
 * Mosqit Extension Background Service Worker
 */

import { LogStorage } from '../storage/log-storage';

interface LogMessage {
  type: string;
  data: Record<string, unknown>;
}

class BackgroundService {
  private storage: LogStorage;
  private connections: Map<number, chrome.runtime.Port> = new Map();

  constructor() {
    this.storage = new LogStorage();
    this.setupListeners();
  }

  private setupListeners() {
    // Listen for messages from content scripts
    chrome.runtime.onMessage.addListener((message: LogMessage, sender, sendResponse) => {
      if (message.type === 'MOSQIT_LOG') {
        this.handleLog(message.data, sender.tab);
        sendResponse({ success: true });
      }
      return true;
    });

    // Listen for connections from DevTools
    chrome.runtime.onConnect.addListener((port) => {
      if (port.name === 'mosqit-devtools') {
        const tabId = port.sender?.tab?.id;
        if (tabId) {
          this.connections.set(tabId, port);

          port.onDisconnect.addListener(() => {
            this.connections.delete(tabId);
          });

          port.onMessage.addListener((msg) => {
            this.handleDevToolsMessage(msg, tabId);
          });
        }
      }
    });

    // Listen for tab updates
    chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
      if (changeInfo.status === 'complete') {
        this.injectContentScript(tabId);
      }
    });

    // Listen for extension icon click
    chrome.action.onClicked.addListener((tab) => {
      if (tab.id) {
        this.toggleLogger(tab.id);
      }
    });
  }

  private async handleLog(logData: Record<string, unknown>, tab?: chrome.tabs.Tab) {
    // Store log
    await this.storage.addLog(logData);

    // Add tab info
    const enrichedLog = {
      ...logData,
      tab: {
        id: tab?.id,
        title: tab?.title,
        url: tab?.url,
      },
    };

    // Send to DevTools if connected
    if (tab?.id && this.connections.has(tab.id)) {
      const port = this.connections.get(tab.id);
      port?.postMessage({
        type: 'NEW_LOG',
        data: enrichedLog,
      });
    }

    // Update badge
    if (tab?.id) {
      this.updateBadge(tab.id);
    }
  }

  private handleDevToolsMessage(message: { type: string; data?: unknown }, tabId: number) {
    switch (message.type) {
      case 'GET_LOGS':
        this.sendLogsToDevTools(tabId);
        break;
      case 'CLEAR_LOGS':
        this.clearLogs(tabId);
        break;
      case 'EXPORT_LOGS':
        this.exportLogs(tabId);
        break;
    }
  }

  private async sendLogsToDevTools(tabId: number) {
    const logs = await this.storage.getLogs(tabId);
    const port = this.connections.get(tabId);

    port?.postMessage({
      type: 'LOGS_DATA',
      data: logs,
    });
  }

  private async clearLogs(tabId: number) {
    await this.storage.clearLogs(tabId);
    this.updateBadge(tabId, 0);
  }

  private async exportLogs(tabId: number) {
    const logs = await this.storage.getLogs(tabId);
    const dataStr = JSON.stringify(logs, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);

    chrome.downloads.download({
      url: dataUri,
      filename: `mosqit-logs-${Date.now()}.json`,
    });
  }

  private async injectContentScript(tabId: number) {
    try {
      await chrome.scripting.executeScript({
        target: { tabId },
        files: ['content.js'],
      });
    } catch (error) {
      console.error('Failed to inject content script:', error);
    }
  }

  private async toggleLogger(tabId: number) {
    chrome.tabs.sendMessage(tabId, {
      type: 'TOGGLE_LOGGER',
    });
  }

  private async updateBadge(tabId: number, count?: number) {
    const logCount = count ?? (await this.storage.getLogCount(tabId));

    chrome.action.setBadgeText({
      text: logCount > 0 ? String(logCount) : '',
      tabId,
    });

    chrome.action.setBadgeBackgroundColor({
      color: '#FF5252',
      tabId,
    });
  }
}

// Initialize background service
new BackgroundService();