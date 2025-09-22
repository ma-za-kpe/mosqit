'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function Tutorial() {
  const tutorials = {
    installation: {
      title: 'Installation & Setup',
      icon: '▶',
      duration: '3 min',
      difficulty: 'Beginner',
      sections: [
        {
          title: 'Chrome Extension Installation',
          content: `
            <h3>Prerequisites</h3>
            <ul>
              <li>Chrome/Edge browser version 120 or higher</li>
              <li>Developer mode enabled in browser extensions</li>
              <li>Node.js 18+ for local development (optional)</li>
            </ul>

            <h3>Installation Methods</h3>

            <h4>Method 1: Load Unpacked Extension (Development)</h4>
            <ol>
              <li>Clone the repository: <code>git clone https://github.com/ma-za-kpe/mosqit.git</code></li>
              <li>Build the extension: <code>npm run build:extension</code></li>
              <li>Navigate to <code>chrome://extensions/</code></li>
              <li>Enable "Developer mode" toggle in top right</li>
              <li>Click "Load unpacked" and select <code>dist/extension</code> directory</li>
            </ol>

            <h4>Method 2: Chrome Web Store (Coming Soon)</h4>
            <p>The extension will be available on the Chrome Web Store for one-click installation.</p>

            <h3>Required Permissions</h3>
            <ul>
              <li><strong>tabs:</strong> Access to tab information for debugging context</li>
              <li><strong>scripting:</strong> Inject content scripts for log capturing</li>
              <li><strong>storage:</strong> Persist debugging data using IndexedDB</li>
              <li><strong>activeTab:</strong> Access current tab for visual bug reporting</li>
            </ul>
          `
        },
        {
          title: 'Accessing the DevTools Panel',
          content: `
            <h3>Opening Mosqit DevTools</h3>
            <ol>
              <li>Open Chrome DevTools using one of these methods:
                <ul>
                  <li>Press <kbd>F12</kbd> (Windows/Linux) or <kbd>Cmd+Option+I</kbd> (Mac)</li>
                  <li>Right-click any element and select "Inspect"</li>
                  <li>Menu → More Tools → Developer Tools</li>
                </ul>
              </li>
              <li>Locate the "Mosqit" tab in the DevTools panel bar</li>
              <li>Click to activate the debugging panel</li>
            </ol>

            <h3>Initial Setup</h3>
            <p>On first launch, Mosqit will:</p>
            <ul>
              <li>Initialize IndexedDB for log storage</li>
              <li>Inject content scripts into the active tab</li>
              <li>Begin capturing console output automatically</li>
              <li>Establish WebSocket connection for real-time updates</li>
            </ul>

            <div class="info-box">
              <strong>Note:</strong> Mosqit needs to be activated per tab. Refresh the page after installation for full functionality.
            </div>
          `
        }
      ]
    },
    core: {
      title: 'Core Debugging Features',
      icon: '◆',
      duration: '10 min',
      difficulty: 'Intermediate',
      sections: [
        {
          title: 'Log Capture & Filtering',
          content: `
            <h3>Automatic Log Capture</h3>
            <p>Mosqit intercepts and enhances all console output with:</p>
            <ul>
              <li><strong>Source Location:</strong> Exact file, line, and column numbers</li>
              <li><strong>Timestamps:</strong> Microsecond precision timing</li>
              <li><strong>Stack Traces:</strong> Full call stack for errors</li>
              <li><strong>Context:</strong> Surrounding code and variable states</li>
            </ul>

            <h3>Log Levels</h3>
            <table class="data-table">
              <tr><th>Level</th><th>Color</th><th>Use Case</th></tr>
              <tr><td>ERROR</td><td style="color: #ef4444">Red</td><td>Exceptions, failures, critical issues</td></tr>
              <tr><td>WARN</td><td style="color: #eab308">Yellow</td><td>Deprecations, potential issues</td></tr>
              <tr><td>INFO</td><td style="color: #3b82f6">Blue</td><td>General information, state changes</td></tr>
              <tr><td>DEBUG</td><td style="color: #8b5cf6">Purple</td><td>Detailed debugging information</td></tr>
              <tr><td>VERBOSE</td><td style="color: #6b7280">Gray</td><td>Trace-level logging</td></tr>
            </table>

            <h3>Advanced Filtering</h3>
            <ul>
              <li><strong>Text Search:</strong> Full-text search across messages and stack traces</li>
              <li><strong>Regex Support:</strong> Use <code>/pattern/flags</code> for complex matching</li>
              <li><strong>Level Filtering:</strong> Toggle specific log levels on/off</li>
              <li><strong>Source Filtering:</strong> Filter by file or component name</li>
              <li><strong>Time Range:</strong> Filter logs within specific time windows</li>
            </ul>

            <h3>Performance Considerations</h3>
            <p>Mosqit implements several optimizations:</p>
            <ul>
              <li>Virtual scrolling for large log volumes (10,000+ entries)</li>
              <li>Debounced search with 150ms delay</li>
              <li>IndexedDB for persistent storage (100MB limit)</li>
              <li>Automatic log rotation after 10,000 entries</li>
            </ul>
          `
        },
        {
          title: 'Stack Trace Analysis',
          content: `
            <h3>Enhanced Stack Traces</h3>
            <p>Mosqit provides enriched stack trace information beyond standard browser output:</p>

            <h4>Stack Frame Details</h4>
            <pre class="code-block">
Error: Cannot read property 'name' of undefined
  at UserProfile.render (user-profile.tsx:45:23)
  at finishClassComponent (react-dom.js:17485:31)
  at updateClassComponent (react-dom.js:17435:24)

  <strong>Source Context:</strong>
  43 | const UserProfile = () => {
  44 |   const user = useUser();
> 45 |   return <h1>{user.name}</h1>; // ← Error here
  46 | };
            </pre>

            <h4>Features</h4>
            <ul>
              <li><strong>Source Maps:</strong> Automatic source map resolution for minified code</li>
              <li><strong>Framework Detection:</strong> React, Vue, Angular specific insights</li>
              <li><strong>Async Traces:</strong> Full async/await chain visualization</li>
              <li><strong>Code Context:</strong> 3 lines before/after error location</li>
            </ul>

            <h3>Click-to-Source</h3>
            <p>Click any stack frame to:</p>
            <ul>
              <li>Open file in VS Code (requires extension)</li>
              <li>View source in Chrome Sources panel</li>
              <li>Copy file path to clipboard</li>
            </ul>
          `
        },
        {
          title: 'Pattern Detection',
          content: `
            <h3>Automatic Error Pattern Recognition</h3>
            <p>Mosqit identifies recurring issues and patterns across your application:</p>

            <h4>Pattern Types</h4>
            <ul>
              <li><strong>Recurring Errors:</strong> Same error occurring 3+ times</li>
              <li><strong>Error Clusters:</strong> Related errors in same module/component</li>
              <li><strong>Memory Leaks:</strong> Detached DOM nodes, growing heap usage</li>
              <li><strong>Performance Issues:</strong> Long tasks, layout thrashing</li>
              <li><strong>Network Failures:</strong> Failed API calls, CORS issues</li>
            </ul>

            <h4>Pattern Metrics</h4>
            <table class="data-table">
              <tr><th>Metric</th><th>Description</th><th>Threshold</th></tr>
              <tr><td>Frequency</td><td>Occurrences per minute</td><td>>5 = High</td></tr>
              <tr><td>Impact</td><td>Affected user interactions</td><td>>10% = Critical</td></tr>
              <tr><td>Spread</td><td>Unique locations</td><td>>3 = Widespread</td></tr>
            </table>

            <h3>Pattern Storage</h3>
            <p>Patterns are tracked using:</p>
            <ul>
              <li>In-memory cache for current session</li>
              <li>IndexedDB for persistence across reloads</li>
              <li>Automatic cleanup after 24 hours</li>
            </ul>
          `
        }
      ]
    },
    visual: {
      title: 'Visual Bug Reporter',
      icon: '◉',
      duration: '8 min',
      difficulty: 'Intermediate',
      sections: [
        {
          title: 'Visual Bug Capture Overview',
          content: `
            <h3>Purpose</h3>
            <p>The Visual Bug Reporter enables non-technical stakeholders (PMs, QA, designers) to report UI issues with full technical context for developers.</p>

            <h3>Key Features</h3>
            <ul>
              <li><strong>Element Selection:</strong> Chrome DevTools-quality precision using elementsFromPoint API</li>
              <li><strong>Screenshot Capture:</strong> Automatic full-page or element-specific screenshots</li>
              <li><strong>Technical Context:</strong> Automatically captures DOM, styles, and JavaScript state</li>
              <li><strong>GitHub Integration:</strong> Generate developer-ready issue reports</li>
            </ul>

            <h3>Activation</h3>
            <ol>
              <li>Click "Start Visual Capture" in Mosqit panel</li>
              <li>Page overlay activates with crosshair cursor</li>
              <li>Hover to preview element information</li>
              <li>Click to capture and report bug</li>
            </ol>
          `
        },
        {
          title: 'Element Selection Technology',
          content: `
            <h3>Precise Element Selection</h3>
            <p>Our selection algorithm matches Chrome DevTools Inspector precision:</p>

            <h4>Selection Algorithm</h4>
            <pre class="code-block">
// Multi-layer element detection
const elements = document.elementsFromPoint(x, y);

// Intelligent scoring system
elements.forEach(element => {
  score += proximityToCenter * 10;
  score += isInteractive ? 15 : 0;
  score += hasEventHandlers ? 10 : 0;
  score += semanticValue * 5;
  score += zIndex / 100;
});
            </pre>

            <h4>Scoring Factors</h4>
            <ul>
              <li><strong>Proximity:</strong> Distance from cursor to element center</li>
              <li><strong>Interactivity:</strong> Buttons, links, inputs prioritized</li>
              <li><strong>Semantic HTML:</strong> Article, section, nav elements</li>
              <li><strong>Visual Boundaries:</strong> Elements with backgrounds/borders</li>
              <li><strong>Z-Index:</strong> Layering and stacking context</li>
            </ul>

            <h3>Box Model Visualization</h3>
            <p>Visual overlays show:</p>
            <ul>
              <li><span style="background: rgba(255,107,107,0.3)">Content area (red)</span></li>
              <li><span style="background: rgba(147,196,125,0.3)">Padding (green)</span></li>
              <li><span style="background: rgba(252,176,126,0.3)">Margin (orange)</span></li>
            </ul>
          `
        },
        {
          title: 'Generated Issue Reports',
          content: `
            <h3>Comprehensive Bug Reports</h3>
            <p>Each captured bug generates a detailed GitHub/Jira-ready issue with:</p>

            <h4>Report Sections</h4>
            <pre class="code-block">
## Bug Description
[User-provided description]

## Console Errors & Stack Traces
Error: Cannot read property 'value' of null
  at FormValidator.validate (validator.js:123:45)
  at HTMLFormElement.handleSubmit (form.js:67:23)

## Debug Information
{
  selector: "#submit-button",
  xpath: "//*[@id='submit-button']",
  dimensions: { width: 120px, height: 40px },
  position: { x: 350, y: 500 },
  styles: {
    backgroundColor: "#007bff",
    color: "#ffffff",
    cursor: "pointer"
  },
  eventListeners: ["click", "mouseenter"],
  framework: "React 18.2.0"
}

## Performance Metrics
Page Load: 1234ms
DOM Ready: 567ms
Memory: 45MB / 128MB

## Network Activity
[GET] /api/user - 404 Not Found (234ms)
[POST] /api/submit - CORS blocked
            </pre>

            <h4>Included Technical Data</h4>
            <ul>
              <li>Complete stack traces with line numbers</li>
              <li>Console errors from last 5 minutes</li>
              <li>Element XPath and CSS selectors</li>
              <li>Computed styles and dimensions</li>
              <li>Parent chain for DOM context</li>
              <li>JavaScript framework detection</li>
              <li>Performance timing metrics</li>
              <li>Network error logs</li>
              <li>Browser and viewport information</li>
            </ul>
          `
        }
      ]
    },
    ai: {
      title: 'AI-Powered Analysis',
      icon: '▲',
      duration: '12 min',
      difficulty: 'Advanced',
      sections: [
        {
          title: 'Chrome Built-in AI Setup',
          content: `
            <h3>Prerequisites</h3>
            <p>Chrome's built-in AI APIs require Chrome 127+ with specific flags enabled.</p>

            <h4>Enable AI Features</h4>
            <ol>
              <li>Navigate to <code>chrome://flags</code></li>
              <li>Enable these experimental flags:
                <ul>
                  <li><code>#prompt-api-for-gemini-nano</code> - Complex error analysis</li>
                  <li><code>#writer-api-for-webui</code> - Bug report generation</li>
                  <li><code>#summarization-api-for-webui</code> - Pattern summarization</li>
                  <li><code>#optimization-guide-on-device-model</code> - Model downloads</li>
                </ul>
              </li>
              <li>Restart Chrome completely (all windows)</li>
              <li>Check availability: <code>chrome://components/</code> → Optimization Guide</li>
            </ol>

            <h4>API Availability Check</h4>
            <pre class="code-block">
// Test in DevTools Console
if (window.ai) {
  const capabilities = await window.ai.capabilities();
  console.log('AI Available:', capabilities.available);
}
            </pre>
          `
        },
        {
          title: 'Error Analysis Features',
          content: `
            <h3>AI-Powered Error Analysis</h3>

            <h4>Prompt API (Gemini Nano)</h4>
            <p>Provides detailed error explanations including:</p>
            <ul>
              <li><strong>Root Cause Analysis:</strong> Why the error occurred</li>
              <li><strong>Impact Assessment:</strong> Effects on application functionality</li>
              <li><strong>Solution Suggestions:</strong> Multiple fix approaches with code examples</li>
              <li><strong>Prevention Strategies:</strong> Best practices to avoid recurrence</li>
            </ul>

            <h4>Writer API</h4>
            <p>Generates structured bug reports with:</p>
            <ul>
              <li>Unique bug identifier and metadata</li>
              <li>Severity classification (Critical/High/Medium/Low)</li>
              <li>Reproduction steps based on user actions</li>
              <li>Test cases for QA validation</li>
            </ul>

            <h4>Summarization API</h4>
            <p>Creates concise summaries of:</p>
            <ul>
              <li>Multiple related errors</li>
              <li>Pattern analysis results</li>
              <li>Session debugging highlights</li>
            </ul>

            <h3>Example Analysis Output</h3>
            <pre class="code-block">
<strong>Error:</strong> TypeError: Cannot read property 'map' of undefined

<strong>Analysis:</strong>
This error occurs when attempting to call .map() on an undefined value,
typically when API data hasn't loaded yet.

<strong>Root Cause:</strong>
The component renders before the async data fetch completes, and the
initial state doesn't provide a default array value.

<strong>Recommended Fix:</strong>
// Add default value in state
const [items, setItems] = useState([]); // Instead of useState()

// Or add conditional rendering
{items && items.map(item => ...)}

// Or use optional chaining
{items?.map(item => ...)}

<strong>Prevention:</strong>
- Always initialize state with appropriate default values
- Use TypeScript for type safety
- Implement loading states for async operations
            </pre>
          `
        },
        {
          title: 'Fallback Mechanisms',
          content: `
            <h3>When AI is Unavailable</h3>
            <p>Mosqit includes comprehensive fallback systems for environments without Chrome AI:</p>

            <h4>Pattern-Based Analysis</h4>
            <ul>
              <li>Database of 500+ common JavaScript errors</li>
              <li>Framework-specific error patterns (React, Vue, Angular)</li>
              <li>Regular expression matching for error classification</li>
              <li>Heuristic-based severity assessment</li>
            </ul>

            <h4>Static Analysis</h4>
            <pre class="code-block">
// Error pattern matching example
const ERROR_PATTERNS = {
  NULL_REFERENCE: {
    pattern: /Cannot read propert(?:y|ies) .* of (?:null|undefined)/,
    severity: 'HIGH',
    suggestion: 'Add null checks or optional chaining (?.)',
    category: 'Type Safety'
  },
  CORS: {
    pattern: /CORS|Cross-Origin|blocked by CORS policy/,
    severity: 'MEDIUM',
    suggestion: 'Configure CORS headers on server or use proxy',
    category: 'Network'
  }
};
            </pre>

            <h4>Fallback Features</h4>
            <table class="data-table">
              <tr><th>AI Feature</th><th>Fallback Alternative</th></tr>
              <tr><td>Error Analysis</td><td>Pattern matching + documentation links</td></tr>
              <tr><td>Bug Reports</td><td>Template-based generation</td></tr>
              <tr><td>Code Suggestions</td><td>Snippet library</td></tr>
              <tr><td>Root Cause</td><td>Stack trace analysis</td></tr>
            </table>
          `
        }
      ]
    },
    architecture: {
      title: 'Technical Architecture',
      icon: '■',
      duration: '15 min',
      difficulty: 'Expert',
      sections: [
        {
          title: 'Extension Architecture',
          content: `
            <h3>Component Overview</h3>
            <p>Mosqit uses Chrome Extension Manifest V3 architecture with multiple isolated contexts:</p>

            <h4>Core Components</h4>
            <pre class="code-block">
mosqit/
├── background.js       // Service worker for message routing
├── content-script.js   // Injected into web pages
├── devtools.js        // DevTools initialization
├── panel.js           // Main debugging interface
├── storage.js         // IndexedDB abstraction
└── visual-bug-reporter.js // DOM interaction layer
            </pre>

            <h4>Message Flow</h4>
            <ol>
              <li><strong>Content Script</strong> captures console.log calls</li>
              <li><strong>Background Script</strong> routes messages between contexts</li>
              <li><strong>DevTools Panel</strong> receives and displays logs</li>
              <li><strong>Storage Service</strong> persists data to IndexedDB</li>
            </ol>

            <h3>Communication Protocol</h3>
            <pre class="code-block">
// Content → Background
chrome.runtime.sendMessage({
  type: 'MOSQIT_LOG',
  data: {
    level: 'error',
    message: 'Error message',
    stack: 'Error stack trace',
    timestamp: Date.now(),
    file: 'app.js',
    line: 123,
    column: 45
  }
});

// Background → DevTools
port.postMessage({
  type: 'NEW_LOG',
  data: logData
});
            </pre>
          `
        },
        {
          title: 'Data Storage',
          content: `
            <h3>IndexedDB Schema</h3>
            <pre class="code-block">
// Database: MosqitDB
// Version: 1

// Stores
logs: {
  keyPath: 'id',
  indexes: [
    'timestamp',
    'level',
    'tabId',
    'pattern'
  ]
}

patterns: {
  keyPath: 'id',
  indexes: [
    'count',
    'lastSeen',
    'severity'
  ]
}

bugs: {
  keyPath: 'id',
  indexes: [
    'timestamp',
    'status'
  ]
}
            </pre>

            <h4>Storage Limits</h4>
            <ul>
              <li><strong>IndexedDB:</strong> 100MB per origin</li>
              <li><strong>Memory Cache:</strong> 100 logs per tab</li>
              <li><strong>Pattern History:</strong> 24 hours retention</li>
              <li><strong>Screenshot Storage:</strong> Base64 encoded, 5MB max</li>
            </ul>

            <h3>Performance Optimizations</h3>
            <ul>
              <li><strong>Virtual Scrolling:</strong> Render only visible log entries</li>
              <li><strong>Debounced Search:</strong> 150ms delay on keystrokes</li>
              <li><strong>Batch Updates:</strong> Group DOM modifications</li>
              <li><strong>Worker Threads:</strong> Offload heavy computations</li>
            </ul>
          `
        },
        {
          title: 'Security & Privacy',
          content: `
            <h3>Security Measures</h3>

            <h4>Content Security Policy</h4>
            <pre class="code-block">
"content_security_policy": {
  "extension_pages": "script-src 'self'; object-src 'self'"
}
            </pre>

            <h4>Data Handling</h4>
            <ul>
              <li><strong>No External Servers:</strong> All data stored locally</li>
              <li><strong>Isolated Contexts:</strong> Content scripts run in isolated world</li>
              <li><strong>Permission Scoping:</strong> Minimal required permissions</li>
              <li><strong>Sensitive Data:</strong> Automatic redaction of passwords/tokens</li>
            </ul>

            <h3>Privacy Considerations</h3>
            <ul>
              <li>No telemetry or analytics collection</li>
              <li>Local-only AI processing (Chrome built-in)</li>
              <li>Manual data export only (user initiated)</li>
              <li>Automatic cleanup of old data</li>
            </ul>

            <h4>Data Redaction</h4>
            <pre class="code-block">
// Automatic sensitive data masking
const SENSITIVE_PATTERNS = [
  /api[_-]?key/i,
  /password/i,
  /token/i,
  /secret/i,
  /credit[_-]?card/i
];

function redactSensitiveData(text) {
  return text.replace(/([a-z0-9]{32,})/gi, '[REDACTED]');
}
            </pre>
          `
        }
      ]
    },
    api: {
      title: 'API Reference',
      icon: '{}',
      duration: '20 min',
      difficulty: 'Expert',
      sections: [
        {
          title: 'Content Script API',
          content: `
            <h3>Window Interface</h3>
            <pre class="code-block">
// Global Mosqit interface
window.__MOSQIT__ = {
  // Enable/disable logging
  setEnabled(enabled: boolean): void;

  // Set minimum log level
  setLogLevel(level: 'error' | 'warn' | 'info' | 'debug'): void;

  // Get current configuration
  getConfig(): MosqitConfig;

  // Manual log capture
  captureLog(data: LogData): void;

  // Clear all logs
  clear(): void;
};

// Usage
window.__MOSQIT__.setLogLevel('error');
window.__MOSQIT__.captureLog({
  level: 'error',
  message: 'Custom error',
  data: { userId: 123 }
});
            </pre>

            <h3>Custom Integration</h3>
            <pre class="code-block">
// React Error Boundary Integration
class ErrorBoundary extends React.Component {
  componentDidCatch(error, errorInfo) {
    if (window.__MOSQIT__) {
      window.__MOSQIT__.captureLog({
        level: 'error',
        message: error.toString(),
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        props: this.props
      });
    }
  }
}
            </pre>
          `
        },
        {
          title: 'Message Protocol',
          content: `
            <h3>Message Types</h3>
            <pre class="code-block">
// Log capture
{
  type: 'MOSQIT_LOG',
  data: {
    level: string,
    message: string,
    timestamp: number,
    file?: string,
    line?: number,
    column?: number,
    stack?: string,
    data?: any
  }
}

// Visual bug report
{
  type: 'VISUAL_BUG_CAPTURED',
  data: {
    element: ElementData,
    screenshot: string, // base64
    page: PageContext,
    debug: DebugContext
  }
}

// Pattern detection
{
  type: 'PATTERN_DETECTED',
  data: {
    pattern: string,
    count: number,
    locations: string[],
    severity: 'low' | 'medium' | 'high' | 'critical'
  }
}
            </pre>

            <h3>Event Listeners</h3>
            <pre class="code-block">
// Listen for Mosqit events
window.addEventListener('mosqit:log', (event) => {
  console.log('Log captured:', event.detail);
});

window.addEventListener('mosqit:pattern', (event) => {
  console.log('Pattern detected:', event.detail);
});

// Trigger custom events
window.dispatchEvent(new CustomEvent('mosqit:custom', {
  detail: {
    action: 'user_click',
    target: 'submit_button'
  }
}));
            </pre>
          `
        }
      ]
    }
  };

  const [activeTab, setActiveTab] = useState<keyof typeof tutorials>('installation');

  return (
    <div className="tutorial-container">
      <style jsx>{`
        .tutorial-container {
          min-height: 100vh;
          background: linear-gradient(135deg, #0f0f0f 0%, #1a1a1a 100%);
          color: #e0e0e0;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
        }

        .header {
          background: rgba(0, 0, 0, 0.5);
          backdrop-filter: blur(10px);
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          position: sticky;
          top: 0;
          z-index: 100;
        }

        .header-content {
          max-width: 1400px;
          margin: 0 auto;
          padding: 1.5rem 2rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .logo {
          display: flex;
          align-items: center;
          gap: 1rem;
          text-decoration: none;
        }

        .logo-icon {
          width: 40px;
          height: 40px;
          background: linear-gradient(135deg, #ff6b6b, #ff4444);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
        }

        .logo-text {
          font-size: 1.5rem;
          font-weight: 700;
          color: white;
          letter-spacing: -0.5px;
        }

        .nav-links {
          display: flex;
          gap: 2rem;
          align-items: center;
        }

        .nav-link {
          color: #a0a0a0;
          text-decoration: none;
          transition: color 0.2s;
          font-weight: 500;
        }

        .nav-link:hover {
          color: white;
        }

        .github-link {
          padding: 0.5rem 1rem;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          transition: all 0.2s;
        }

        .github-link:hover {
          background: rgba(255, 255, 255, 0.2);
        }

        .main-content {
          max-width: 1400px;
          margin: 0 auto;
          padding: 2rem;
          display: flex;
          gap: 2rem;
        }

        .sidebar {
          width: 320px;
          position: sticky;
          top: 100px;
          height: fit-content;
        }

        .sidebar-header {
          padding: 1rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          margin-bottom: 1rem;
        }

        .sidebar-title {
          font-size: 1.2rem;
          font-weight: 600;
          color: white;
          margin: 0;
        }

        .tab-list {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .tab-item {
          margin-bottom: 0.5rem;
        }

        .tab-button {
          width: 100%;
          padding: 1rem;
          background: transparent;
          border: 1px solid transparent;
          border-radius: 10px;
          color: #a0a0a0;
          cursor: pointer;
          transition: all 0.2s;
          text-align: left;
          display: flex;
          gap: 1rem;
        }

        .tab-button:hover {
          background: rgba(255, 255, 255, 0.05);
          border-color: rgba(255, 255, 255, 0.1);
          color: white;
        }

        .tab-button.active {
          background: rgba(255, 107, 107, 0.1);
          border-color: #ff6b6b;
          color: white;
        }

        .tab-icon {
          font-size: 1.2rem;
          width: 24px;
          text-align: center;
        }

        .tab-info {
          flex: 1;
        }

        .tab-title {
          display: block;
          font-weight: 600;
          margin-bottom: 0.25rem;
        }

        .tab-meta {
          display: flex;
          gap: 1rem;
          font-size: 0.85rem;
          color: #606060;
        }

        .content-area {
          flex: 1;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          overflow: hidden;
        }

        .tutorial-content {
          padding: 2rem;
        }

        .tutorial-header {
          margin-bottom: 2rem;
          padding-bottom: 1.5rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .tutorial-title {
          font-size: 2rem;
          font-weight: 700;
          margin: 0 0 0.5rem;
          color: white;
        }

        .tutorial-meta {
          display: flex;
          gap: 2rem;
          color: #a0a0a0;
        }

        .meta-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .sections-list {
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }

        .section {
          background: rgba(0, 0, 0, 0.3);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 10px;
          padding: 1.5rem;
        }

        .section-title {
          font-size: 1.3rem;
          font-weight: 600;
          margin: 0 0 1rem;
          color: #ff6b6b;
        }

        .section-content {
          line-height: 1.8;
          font-size: 16px;
          color: #d0d0d0;
        }

        .section-content p {
          margin: 1rem 0;
          line-height: 1.7;
        }

        .section-content h3 {
          font-size: 1.4rem;
          font-weight: 700;
          margin: 2rem 0 1rem;
          color: #ffffff;
          border-bottom: 2px solid #ff6b6b;
          padding-bottom: 0.5rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .section-content h3::before {
          content: "▶";
          color: #ff6b6b;
          font-size: 0.8em;
        }

        .section-content h4 {
          font-size: 1.1rem;
          font-weight: 600;
          margin: 1.5rem 0 0.8rem;
          color: #ff6b6b;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .section-content h4::before {
          content: "◆";
          color: #ff6b6b;
          font-size: 0.7em;
        }

        .section-content ul,
        .section-content ol {
          margin: 1rem 0;
          padding-left: 0;
          list-style: none;
        }

        .section-content ul li {
          position: relative;
          margin: 0.8rem 0;
          padding-left: 2rem;
          line-height: 1.6;
        }

        .section-content ul li::before {
          content: "●";
          color: #ff6b6b;
          position: absolute;
          left: 0.5rem;
          top: 0;
          font-size: 0.8rem;
        }

        .section-content ul li strong {
          color: #ffffff;
          font-weight: 600;
        }

        .section-content ol {
          counter-reset: step-counter;
          padding-left: 0;
        }

        .section-content ol li {
          position: relative;
          margin: 1rem 0;
          padding-left: 3rem;
          line-height: 1.6;
          counter-increment: step-counter;
        }

        .section-content ol li::before {
          content: counter(step-counter);
          position: absolute;
          left: 0;
          top: 0;
          background: #ff6b6b;
          color: white;
          width: 1.8rem;
          height: 1.8rem;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          font-size: 0.9rem;
        }

        .section-content ul ul li::before {
          content: "◦";
          color: #a0a0a0;
        }

        .section-content code {
          background: linear-gradient(135deg, rgba(255, 107, 107, 0.15), rgba(255, 107, 107, 0.1));
          color: #ff8a8a;
          padding: 0.3rem 0.6rem;
          border-radius: 6px;
          font-family: 'JetBrains Mono', 'Monaco', 'Menlo', monospace;
          font-size: 0.9rem;
          border: 1px solid rgba(255, 107, 107, 0.2);
          font-weight: 500;
        }

        .section-content pre {
          background: linear-gradient(135deg, #0a0a0a, #111111);
          border: 1px solid #333333;
          border-radius: 12px;
          padding: 1.5rem;
          overflow-x: auto;
          margin: 1.5rem 0;
          position: relative;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
        }

        .section-content pre::before {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 3px;
          background: linear-gradient(90deg, #ff6b6b, #ff8a8a, #ff6b6b);
          border-radius: 12px 12px 0 0;
        }

        .section-content pre code {
          background: none;
          color: #e8e8e8;
          padding: 0;
          border: none;
          font-size: 0.9rem;
          line-height: 1.6;
        }

        .section-content a {
          color: #7dcfff;
          text-decoration: none;
          border-bottom: 1px solid transparent;
          transition: all 0.2s;
          font-weight: 500;
        }

        .section-content a:hover {
          color: #ffffff;
          border-bottom-color: #7dcfff;
        }

        .info-box {
          background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(59, 130, 246, 0.05));
          border: 1px solid rgba(59, 130, 246, 0.3);
          border-left: 4px solid #3b82f6;
          border-radius: 8px;
          padding: 1.2rem;
          margin: 1.5rem 0;
          position: relative;
          box-shadow: 0 2px 10px rgba(59, 130, 246, 0.1);
        }

        .info-box::before {
          content: "ℹ";
          position: absolute;
          top: 1rem;
          left: 1rem;
          color: #3b82f6;
          font-size: 1.2rem;
          font-weight: 600;
        }

        .info-box strong {
          color: #60a5fa;
          margin-left: 1.5rem;
        }

        .warning-box {
          background: linear-gradient(135deg, rgba(234, 179, 8, 0.1), rgba(234, 179, 8, 0.05));
          border: 1px solid rgba(234, 179, 8, 0.3);
          border-left: 4px solid #eab308;
          border-radius: 8px;
          padding: 1.2rem;
          margin: 1.5rem 0;
          position: relative;
          box-shadow: 0 2px 10px rgba(234, 179, 8, 0.1);
        }

        .warning-box::before {
          content: "⚠";
          position: absolute;
          top: 1rem;
          left: 1rem;
          color: #eab308;
          font-size: 1.2rem;
          font-weight: 600;
        }

        .warning-box strong {
          color: #fbbf24;
          margin-left: 1.5rem;
        }

        .success-box {
          background: linear-gradient(135deg, rgba(34, 197, 94, 0.1), rgba(34, 197, 94, 0.05));
          border: 1px solid rgba(34, 197, 94, 0.3);
          border-left: 4px solid #22c55e;
          border-radius: 8px;
          padding: 1.2rem;
          margin: 1.5rem 0;
          position: relative;
          box-shadow: 0 2px 10px rgba(34, 197, 94, 0.1);
        }

        .success-box::before {
          content: "✓";
          position: absolute;
          top: 1rem;
          left: 1rem;
          color: #22c55e;
          font-size: 1.2rem;
          font-weight: 600;
        }

        .success-box strong {
          color: #4ade80;
          margin-left: 1.5rem;
        }

        .code-block {
          background: linear-gradient(135deg, #0a0a0a, #111111);
          border: 1px solid #333333;
          border-radius: 12px;
          padding: 1.5rem;
          overflow-x: auto;
          font-family: 'JetBrains Mono', 'Monaco', 'Menlo', monospace;
          font-size: 0.9rem;
          line-height: 1.6;
          margin: 1.5rem 0;
          position: relative;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
        }

        .code-block::before {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 3px;
          background: linear-gradient(90deg, #ff6b6b, #ff8a8a, #ff6b6b);
          border-radius: 12px 12px 0 0;
        }

        .data-table {
          width: 100%;
          border-collapse: collapse;
          margin: 1.5rem 0;
          background: rgba(0, 0, 0, 0.2);
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
        }

        .data-table th {
          background: linear-gradient(135deg, rgba(255, 107, 107, 0.2), rgba(255, 107, 107, 0.1));
          padding: 1rem;
          text-align: left;
          border: none;
          font-weight: 600;
          color: #ffffff;
          border-bottom: 2px solid #ff6b6b;
        }

        .data-table td {
          padding: 0.8rem 1rem;
          border: none;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          vertical-align: top;
        }

        .data-table tr:hover {
          background: rgba(255, 255, 255, 0.03);
        }

        .data-table tr:last-child td {
          border-bottom: none;
        }

        kbd {
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.15), rgba(255, 255, 255, 0.1));
          border: 1px solid rgba(255, 255, 255, 0.3);
          border-radius: 6px;
          padding: 0.3rem 0.6rem;
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.85rem;
          font-weight: 600;
          color: #ffffff;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
          display: inline-flex;
          align-items: center;
          min-width: 2rem;
          justify-content: center;
        }

        /* Better button styling for any buttons in content */
        .section-content button {
          background: linear-gradient(135deg, #ff6b6b, #ff4444);
          color: white;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          margin: 0.5rem 0.5rem 0.5rem 0;
        }

        .section-content button:hover {
          background: linear-gradient(135deg, #ff5555, #ff3333);
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(255, 107, 107, 0.3);
        }

        /* Copy button for code blocks */
        .section-content pre {
          position: relative;
        }

        .copy-button {
          position: absolute;
          top: 1rem;
          right: 1rem;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          color: #ffffff;
          padding: 0.5rem;
          border-radius: 4px;
          cursor: pointer;
          font-size: 0.8rem;
          opacity: 0.7;
          transition: all 0.2s;
        }

        .copy-button:hover {
          opacity: 1;
          background: rgba(255, 255, 255, 0.2);
        }

        /* Support section styling */
        .support-section {
          margin-top: 3rem;
          padding: 2rem;
          background: linear-gradient(135deg, rgba(255, 107, 107, 0.05), rgba(255, 107, 107, 0.02));
          border: 1px solid rgba(255, 107, 107, 0.1);
          border-radius: 12px;
          text-align: center;
        }

        .support-content p {
          margin: 0 0 1rem;
          color: #a0a0a0;
          font-size: 0.95rem;
        }

        .coffee-link {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.5rem;
          background: linear-gradient(135deg, #ff6b6b, #ff4444);
          color: white;
          text-decoration: none;
          border-radius: 8px;
          font-weight: 600;
          font-size: 0.9rem;
          transition: all 0.3s ease;
          box-shadow: 0 2px 8px rgba(255, 107, 107, 0.2);
        }

        .coffee-link:hover {
          background: linear-gradient(135deg, #ff5555, #ff3333);
          transform: translateY(-2px);
          box-shadow: 0 4px 16px rgba(255, 107, 107, 0.3);
          color: white;
          border-bottom: none;
        }

        .coffee-link:active {
          transform: translateY(0);
        }

        @media (max-width: 1024px) {
          .main-content {
            flex-direction: column;
          }

          .sidebar {
            width: 100%;
            position: relative;
            top: 0;
          }
        }
      `}</style>

      <header className="header">
        <div className="header-content">
          <Link href="/" className="logo">
            <div className="logo-icon">M</div>
            <div className="logo-text">Mosqit Documentation</div>
          </Link>
          <nav className="nav-links">
            <Link href="/" className="nav-link">Home</Link>
            <Link href="/tutorial" className="nav-link">Documentation</Link>
            <a href="https://github.com/ma-za-kpe/mosqit" className="nav-link github-link">GitHub</a>
          </nav>
        </div>
      </header>

      <main className="main-content">
        <aside className="sidebar">
          <div className="sidebar-header">
            <h2 className="sidebar-title">Documentation</h2>
          </div>
          <ul className="tab-list">
            {Object.entries(tutorials).map(([key, tutorial]) => (
              <li key={key} className="tab-item">
                <button
                  className={`tab-button ${activeTab === key ? 'active' : ''}`}
                  onClick={() => setActiveTab(key as keyof typeof tutorials)}
                >
                  <span className="tab-icon">{tutorial.icon}</span>
                  <div className="tab-info">
                    <span className="tab-title">{tutorial.title}</span>
                    <div className="tab-meta">
                      <span>{tutorial.duration}</span>
                      <span>•</span>
                      <span>{tutorial.difficulty}</span>
                    </div>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </aside>

        <div className="content-area">
          <div className="tutorial-content">
            {activeTab && tutorials[activeTab] && (
              <>
                <div className="tutorial-header">
                  <h2 className="tutorial-title">
                    {tutorials[activeTab].title}
                  </h2>
                  <div className="tutorial-meta">
                    <span className="meta-item">Duration: {tutorials[activeTab].duration}</span>
                    <span className="meta-item">Level: {tutorials[activeTab].difficulty}</span>
                  </div>
                </div>
                <div className="sections-list">
                  {tutorials[activeTab].sections.map((section, index) => (
                    <section key={index} className="section">
                      <h3 className="section-title">{section.title}</h3>
                      <div
                        className="section-content"
                        dangerouslySetInnerHTML={{ __html: section.content }}
                      />
                    </section>
                  ))}
                </div>

                {/* Subtle Buy Me a Coffee link */}
                <div className="support-section">
                  <div className="support-content">
                    <p>Found this documentation helpful?</p>
                    <a
                      href="https://buymeacoffee.com/mosqit"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="coffee-link"
                    >
                      ☕ Buy me a coffee
                    </a>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}