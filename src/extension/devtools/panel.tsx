import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';

interface LogEntry {
  id: string;
  message: string;
  level: 'log' | 'warn' | 'error' | 'info' | 'debug';
  timestamp: number;
  file?: string;
  line?: number;
  column?: number;
  stack?: string;
  dependencies?: string[];
  domNode?: {
    tag: string;
    id?: string;
    classes?: string[];
    xpath?: string;
  };
  url: string;
}

const LogPanel: React.FC = () => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [filter, setFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedLog, setSelectedLog] = useState<LogEntry | null>(null);

  useEffect(() => {
    // Connect to background script
    const port = chrome.runtime.connect({ name: 'mosqit-devtools' });

    port.onMessage.addListener((message) => {
      if (message.type === 'NEW_LOG') {
        setLogs(prev => [...prev, { ...message.data, id: Date.now().toString() }]);
      } else if (message.type === 'LOGS_DATA') {
        setLogs(message.data.map((log: { data: LogEntry; timestamp: number }, index: number) => ({
          ...log.data,
          id: `${log.timestamp}-${index}`,
        })));
      }
    });

    // Request existing logs
    port.postMessage({ type: 'GET_LOGS' });

    return () => {
      port.disconnect();
    };
  }, []);

  const filteredLogs = logs.filter(log => {
    const matchesFilter = filter === 'all' || log.level === filter;
    const matchesSearch = !searchTerm ||
      log.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.file?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const clearLogs = () => {
    setLogs([]);
    const port = chrome.runtime.connect({ name: 'mosqit-devtools' });
    port.postMessage({ type: 'CLEAR_LOGS' });
  };

  const exportLogs = () => {
    const dataStr = JSON.stringify(logs, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    const link = document.createElement('a');
    link.setAttribute('href', dataUri);
    link.setAttribute('download', `mosqit-logs-${Date.now()}.json`);
    link.click();
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'error': return '#ff5252';
      case 'warn': return '#ff9800';
      case 'info': return '#2196f3';
      case 'debug': return '#9e9e9e';
      default: return '#ffffff';
    }
  };

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  return (
    <div className="mosqit-panel">
      <div className="toolbar">
        <div className="toolbar-left">
          <button
            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All ({logs.length})
          </button>
          <button
            className={`filter-btn error ${filter === 'error' ? 'active' : ''}`}
            onClick={() => setFilter('error')}
          >
            Errors ({logs.filter(l => l.level === 'error').length})
          </button>
          <button
            className={`filter-btn warn ${filter === 'warn' ? 'active' : ''}`}
            onClick={() => setFilter('warn')}
          >
            Warnings ({logs.filter(l => l.level === 'warn').length})
          </button>
          <button
            className={`filter-btn info ${filter === 'info' ? 'active' : ''}`}
            onClick={() => setFilter('info')}
          >
            Info ({logs.filter(l => l.level === 'info').length})
          </button>
        </div>
        <div className="toolbar-right">
          <input
            type="text"
            placeholder="Search logs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <button onClick={exportLogs} className="action-btn">
            📥 Export
          </button>
          <button onClick={clearLogs} className="action-btn">
            🗑️ Clear
          </button>
        </div>
      </div>

      <div className="logs-container">
        <div className="logs-list">
          {filteredLogs.map(log => (
            <div
              key={log.id}
              className={`log-entry ${log.level} ${selectedLog?.id === log.id ? 'selected' : ''}`}
              onClick={() => setSelectedLog(log)}
            >
              <span
                className="log-level"
                style={{ color: getLevelColor(log.level) }}
              >
                ●
              </span>
              <span className="log-time">{formatTimestamp(log.timestamp)}</span>
              <span className="log-message">{log.message}</span>
              {log.file && (
                <span className="log-location">
                  {log.file}:{log.line}:{log.column}
                </span>
              )}
            </div>
          ))}
        </div>

        {selectedLog && (
          <div className="log-details">
            <h3>Log Details</h3>

            <div className="detail-section">
              <strong>Message:</strong>
              <div className="detail-value">{selectedLog.message}</div>
            </div>

            <div className="detail-section">
              <strong>Level:</strong>
              <span style={{ color: getLevelColor(selectedLog.level) }}>
                {selectedLog.level}
              </span>
            </div>

            <div className="detail-section">
              <strong>Timestamp:</strong>
              <div className="detail-value">
                {new Date(selectedLog.timestamp).toLocaleString()}
              </div>
            </div>

            {selectedLog.file && (
              <div className="detail-section">
                <strong>Location:</strong>
                <div className="detail-value">
                  {selectedLog.file}:{selectedLog.line}:{selectedLog.column}
                </div>
              </div>
            )}

            {selectedLog.domNode && (
              <div className="detail-section">
                <strong>DOM Element:</strong>
                <div className="detail-value">
                  <div>&lt;{selectedLog.domNode.tag}</div>
                  {selectedLog.domNode.id && <div>&nbsp;&nbsp;id={`"${selectedLog.domNode.id}"`}</div>}
                  {selectedLog.domNode.classes && selectedLog.domNode.classes.length > 0 && (
                    <div>&nbsp;&nbsp;class={`"${selectedLog.domNode.classes.join(' ')}"`}</div>
                  )}
                  <div>&gt;</div>
                  {selectedLog.domNode.xpath && (
                    <div className="xpath">XPath: {selectedLog.domNode.xpath}</div>
                  )}
                </div>
              </div>
            )}

            {selectedLog.dependencies && selectedLog.dependencies.length > 0 && (
              <div className="detail-section">
                <strong>Dependencies:</strong>
                <div className="detail-value">
                  {selectedLog.dependencies.join(', ')}
                </div>
              </div>
            )}

            {selectedLog.stack && (
              <div className="detail-section">
                <strong>Stack Trace:</strong>
                <pre className="stack-trace">{selectedLog.stack}</pre>
              </div>
            )}

            <div className="detail-section">
              <strong>URL:</strong>
              <div className="detail-value">{selectedLog.url}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Initialize the panel
const container = document.getElementById('mosqit-devtools-root');
if (container) {
  const root = createRoot(container);
  root.render(<LogPanel />);
}