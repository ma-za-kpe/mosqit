// Simple DevTools panel for Mosqit
const logList = document.getElementById('log-list');
const clearBtn = document.getElementById('clear-btn');
const exportBtn = document.getElementById('export-btn');

let logs = [];

// Connect to background script
const port = chrome.runtime.connect({ name: 'mosqit-devtools' });

port.onMessage.addListener((message) => {
  if (message.type === 'NEW_LOG') {
    addLog(message.data);
  } else if (message.type === 'LOGS_DATA') {
    logs = message.data || [];
    displayLogs();
  }
});

// Request existing logs
port.postMessage({ type: 'GET_LOGS' });

function addLog(logData) {
  logs.push(logData);
  displayLogs();
}

function displayLogs() {
  if (logs.length === 0) {
    logList.innerHTML = '<div class="log-item">No logs yet...</div>';
    return;
  }

  logList.innerHTML = logs.map(log => {
    const data = log.data || log;
    const timestamp = new Date(data.timestamp).toLocaleTimeString();
    const location = data.file ? `${data.file}:${data.line}:${data.column}` : '';

    return `
      <div class="log-item ${data.level || ''}">
        <strong>[${timestamp}]</strong> ${data.level?.toUpperCase() || 'LOG'}: ${data.message}
        ${location ? `<br><small>${location}</small>` : ''}
        ${data.domNode ? `<br><small>DOM: &lt;${data.domNode.tag} ${data.domNode.id ? `id="${data.domNode.id}"` : ''}&gt;</small>` : ''}
      </div>
    `;
  }).reverse().join('');
}

clearBtn.addEventListener('click', () => {
  logs = [];
  displayLogs();
  port.postMessage({ type: 'CLEAR_LOGS' });
});

exportBtn.addEventListener('click', () => {
  const dataStr = JSON.stringify(logs, null, 2);
  const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
  const link = document.createElement('a');
  link.setAttribute('href', dataUri);
  link.setAttribute('download', `mosqit-logs-${Date.now()}.json`);
  link.click();
});