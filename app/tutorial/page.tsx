'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';

export default function Tutorial() {
  const [activeTab, setActiveTab] = useState<string>('getting-started');
  const [activeSection, setActiveSection] = useState<string>('');
  const [completedSections, setCompletedSections] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [copySuccess, setCopySuccess] = useState<string>('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Tutorial content organized by learning path
  const learningPaths = {
    'getting-started': {
      title: 'Getting Started',
      icon: '🚀',
      color: '#22c55e',
      estimatedTime: '10 min',
      description: 'Quick setup and your first debug session',
      sections: [
        {
          id: 'quick-install',
          title: '⚡ Quick Installation',
          component: QuickInstallContent
        },
        {
          id: 'first-debug',
          title: '🦟 Your First Debug Session',
          component: FirstDebugContent
        },
        {
          id: 'understanding-ui',
          title: '🎨 Understanding the Interface',
          component: UnderstandingUIContent
        }
      ]
    },
    'core-features': {
      title: 'Core Features',
      icon: '⚡',
      color: '#3b82f6',
      estimatedTime: '15 min',
      description: 'Master log capture, filtering, and analysis',
      sections: [
        {
          id: 'smart-capture',
          title: '🎯 Smart Log Capture',
          component: SmartCaptureContent
        },
        {
          id: 'filtering',
          title: '🔎 Advanced Filtering',
          component: FilteringContent
        },
        {
          id: 'pattern-detection',
          title: '🔍 Pattern Detection',
          component: PatternDetectionContent
        }
      ]
    },
    'visual-debugging': {
      title: 'Visual Debugging',
      icon: '📸',
      color: '#8b5cf6',
      estimatedTime: '8 min',
      description: 'Point, click, and report bugs visually',
      sections: [
        {
          id: 'visual-capture',
          title: '🎯 Visual Bug Reporter',
          component: VisualCaptureContent
        },
        {
          id: 'element-inspector',
          title: '🔍 Smart Element Selection',
          component: ElementInspectorContent
        }
      ]
    },
    'ai-features': {
      title: 'AI Analysis',
      icon: '🤖',
      color: '#ef4444',
      estimatedTime: '12 min',
      description: 'Leverage Chrome\'s built-in AI for intelligent debugging',
      sections: [
        {
          id: 'ai-setup',
          title: '⚙️ Enable Chrome AI',
          component: AISetupContent
        },
        {
          id: 'ai-analysis',
          title: '🧠 Smart Error Analysis',
          component: AIAnalysisContent
        },
        {
          id: 'fallback-analysis',
          title: '🔄 Smart Fallbacks',
          component: FallbackAnalysisContent
        }
      ]
    },
    'integrations': {
      title: 'Integrations',
      icon: '🔗',
      color: '#f59e0b',
      estimatedTime: '10 min',
      description: 'Connect with GitHub, export data, and extend functionality',
      sections: [
        {
          id: 'github-setup',
          title: '🐙 GitHub Integration',
          component: GitHubSetupContent
        },
        {
          id: 'export-options',
          title: '📤 Export & Share',
          component: ExportOptionsContent
        }
      ]
    },
    'troubleshooting': {
      title: 'Troubleshooting',
      icon: '🔧',
      color: '#6b7280',
      estimatedTime: '5 min',
      description: 'Quick fixes for common issues',
      sections: [
        {
          id: 'common-issues',
          title: '❓ FAQ & Quick Fixes',
          component: CommonIssuesContent
        }
      ]
    }
  };

  // Content Components
  function QuickInstallContent({ onCopy }: { onCopy: (code: string) => void }) {
    return (
      <div className="content-section">
        <div className="card highlight-card">
          <h3>Two Ways to Install</h3>

          <div className="install-grid">
            <div className="install-option recommended">
              <div className="badge">Recommended</div>
              <h4>🏪 Chrome Web Store</h4>
              <p>One-click installation with automatic updates</p>
              <button className="btn btn-primary">Install from Chrome Store →</button>
              <small className="muted">Coming soon - pending review</small>
            </div>

            <div className="install-option">
              <h4>👨‍💻 Developer Mode</h4>
              <p>Build from source for development</p>
              <div className="code-block">
                <pre>
{`git clone https://github.com/ma-za-kpe/mosqit.git
cd mosqit && npm install
npm run build:extension`}
                </pre>
                <button
                  className="copy-btn"
                  onClick={() => onCopy('git clone https://github.com/ma-za-kpe/mosqit.git\ncd mosqit && npm install\nnpm run build:extension')}
                >
                  📋
                </button>
              </div>
              <p>Then load <code className="inline-code">dist/extension</code> in Chrome Extensions</p>
            </div>
          </div>
        </div>

        <div className="requirements">
          <h3>Requirements</h3>
          <div className="req-grid">
            <div className="req-card">
              <span className="icon">🌐</span>
              <div>
                <strong>Chrome 120+</strong>
                <small>or Edge/Brave</small>
              </div>
            </div>
            <div className="req-card">
              <span className="icon">⚙️</span>
              <div>
                <strong>Developer Mode</strong>
                <small>for manual install</small>
              </div>
            </div>
            <div className="req-card">
              <span className="icon">💾</span>
              <div>
                <strong>~10MB</strong>
                <small>disk space</small>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  function FirstDebugContent() {
    return (
      <div className="content-section">
        <div className="steps-container">
          <div className="step">
            <div className="step-number">1</div>
            <div className="step-content">
              <h4>Open Any Website</h4>
              <p>Navigate to the page you want to debug</p>
            </div>
          </div>

          <div className="step">
            <div className="step-number">2</div>
            <div className="step-content">
              <h4>Open DevTools</h4>
              <p>Press <kbd>F12</kbd> or right-click → Inspect</p>
              <div className="keyboard-hint">
                <kbd>F12</kbd> <span>or</span> <kbd>Cmd</kbd>+<kbd>Opt</kbd>+<kbd>I</kbd>
              </div>
            </div>
          </div>

          <div className="step">
            <div className="step-number">3</div>
            <div className="step-content">
              <h4>Find Mosqit Tab</h4>
              <p>Click the &quot;Mosqit&quot; tab in DevTools panel</p>
              <div className="tip-box">
                <strong>💡 Tip:</strong> If you don&apos;t see it, refresh the page after installation
              </div>
            </div>
          </div>

          <div className="step complete">
            <div className="step-number">✓</div>
            <div className="step-content">
              <h4>Start Debugging!</h4>
              <p>All console logs are now being captured automatically</p>
              <button className="btn btn-success">You&apos;re all set! 🎉</button>
            </div>
          </div>
        </div>

        <div className="card demo-card">
          <h3>Try It Yourself</h3>
          <button
            className="btn btn-demo"
            onClick={() => console.error('Test error from Mosqit tutorial!')}
          >
            Generate Test Error
          </button>
          <p>Click above and check your Mosqit panel to see the captured error!</p>
        </div>
      </div>
    );
  }

  function UnderstandingUIContent() {
    return (
      <div className="content-section">
        <div className="ui-overview">
          <h3>Main Panel Areas</h3>
          <div className="ui-diagram">
            <div className="ui-area toolbar">
              <span className="label">Toolbar</span>
              <p>Quick actions: Clear logs, Export, Visual capture</p>
            </div>
            <div className="ui-area filters">
              <span className="label">Filters</span>
              <p>Search and filter by level, source, or content</p>
            </div>
            <div className="ui-area logs">
              <span className="label">Log Stream</span>
              <p>Real-time console output with enhanced details</p>
            </div>
            <div className="ui-area details">
              <span className="label">Details Panel</span>
              <p>Stack traces, AI analysis, and context</p>
            </div>
          </div>
        </div>

        <div className="controls-section">
          <h3>Essential Controls</h3>
          <div className="control-grid">
            <div className="control-item">
              <button className="icon-btn">🔍</button>
              <span>Search logs</span>
            </div>
            <div className="control-item">
              <button className="icon-btn">📷</button>
              <span>Visual capture</span>
            </div>
            <div className="control-item">
              <button className="icon-btn">🤖</button>
              <span>AI analysis</span>
            </div>
            <div className="control-item">
              <button className="icon-btn">📋</button>
              <span>Copy/Export</span>
            </div>
            <div className="control-item">
              <button className="icon-btn">🐛</button>
              <span>Submit to GitHub</span>
            </div>
            <div className="control-item">
              <button className="icon-btn">🗑️</button>
              <span>Clear logs</span>
            </div>
          </div>
        </div>

        <div className="card pro-tips">
          <h3>💡 Pro Tips</h3>
          <ul className="tips-list">
            <li>Double-click any log to expand full details</li>
            <li>Use <kbd>Ctrl</kbd>+<kbd>F</kbd> for quick search</li>
            <li>Right-click logs for context menu options</li>
            <li>Drag to reorder panel sections</li>
          </ul>
        </div>
      </div>
    );
  }

  function SmartCaptureContent() {
    return (
      <div className="content-section">
        <h3>Automatic Enhancement</h3>
        <p>Every console log is automatically enhanced with:</p>

        <div className="enhancement-grid">
          <div className="enhancement-card">
            <div className="icon">📍</div>
            <h4>Precise Location</h4>
            <p>Exact file, line, and column</p>
            <code className="inline-code">app.js:42:15</code>
          </div>
          <div className="enhancement-card">
            <div className="icon">⏱️</div>
            <h4>Timestamps</h4>
            <p>Microsecond precision</p>
            <code className="inline-code">14:23:45.678</code>
          </div>
          <div className="enhancement-card">
            <div className="icon">📚</div>
            <h4>Stack Traces</h4>
            <p>Full call chain</p>
            <code className="inline-code">at handleClick()</code>
          </div>
          <div className="enhancement-card">
            <div className="icon">🔍</div>
            <h4>Context</h4>
            <p>Surrounding code</p>
            <code className="inline-code">3 lines ± error</code>
          </div>
        </div>

        <div className="comparison">
          <div className="compare-item before">
            <h4>❌ Standard Console</h4>
            <pre className="code-block">Error: Cannot read property &apos;name&apos;</pre>
          </div>
          <div className="compare-item after">
            <h4>✅ With Mosqit</h4>
            <pre className="code-block">
{`Error: Cannot read property 'name' of undefined
  at UserProfile.render (user-profile.tsx:45:23)
  in UserProfile (created by App)
  in div (created by Layout)

Context:
  44 |   const user = useUser();
> 45 |   return <h1>{user.name}</h1>; // ← Error
  46 | };`}
            </pre>
          </div>
        </div>
      </div>
    );
  }

  function FilteringContent() {
    return (
      <div className="content-section">
        <h3>Filter Like a Pro</h3>

        <div className="filter-examples">
          <div className="filter-example">
            <input type="text" value="error" readOnly className="filter-input" />
            <span>→ Find all errors</span>
          </div>
          <div className="filter-example">
            <input type="text" value="/api.*failed/i" readOnly className="filter-input" />
            <span>→ Regex for API failures</span>
          </div>
          <div className="filter-example">
            <input type="text" value="level:error file:app.js" readOnly className="filter-input" />
            <span>→ Errors from app.js only</span>
          </div>
          <div className="filter-example">
            <input type="text" value="-info -debug" readOnly className="filter-input" />
            <span>→ Exclude info and debug logs</span>
          </div>
        </div>

        <h4>Search Operators</h4>
        <table className="data-table">
          <thead>
            <tr>
              <th>Operator</th>
              <th>Description</th>
              <th>Example</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><code className="inline-code">level:</code></td>
              <td>Filter by log level</td>
              <td><code className="inline-code">level:error</code></td>
            </tr>
            <tr>
              <td><code className="inline-code">file:</code></td>
              <td>Filter by source file</td>
              <td><code className="inline-code">file:app.js</code></td>
            </tr>
            <tr>
              <td><code className="inline-code">line:</code></td>
              <td>Filter by line number</td>
              <td><code className="inline-code">line:42</code></td>
            </tr>
            <tr>
              <td><code className="inline-code">-</code></td>
              <td>Exclude matches</td>
              <td><code className="inline-code">-debug</code></td>
            </tr>
            <tr>
              <td><code className="inline-code">/regex/</code></td>
              <td>Regular expression</td>
              <td><code className="inline-code">/error.*null/i</code></td>
            </tr>
          </tbody>
        </table>

        <div className="saved-filters">
          <h4>Save Your Filters</h4>
          <p>Create custom filter presets for common debugging scenarios:</p>
          <div className="preset-list">
            <button className="preset-btn">🔴 Critical Errors</button>
            <button className="preset-btn">🔵 API Calls</button>
            <button className="preset-btn">⚡ Performance</button>
            <button className="preset-btn">🎯 User Actions</button>
          </div>
        </div>
      </div>
    );
  }

  function PatternDetectionContent() {
    return (
      <div className="content-section">
        <h3>Automatic Issue Recognition</h3>
        <p>Mosqit identifies recurring patterns and potential issues:</p>

        <div className="pattern-cards">
          <div className="pattern-card critical">
            <div className="pattern-header">
              <span className="severity">Critical</span>
              <span className="count">12 occurrences</span>
            </div>
            <h4>Memory Leak Detected</h4>
            <p>Detached DOM nodes growing over time</p>
            <div className="pattern-details">
              <code className="inline-code">274 detached nodes in 5 minutes</code>
            </div>
          </div>

          <div className="pattern-card warning">
            <div className="pattern-header">
              <span className="severity">Warning</span>
              <span className="count">8 occurrences</span>
            </div>
            <h4>Repeated API Failures</h4>
            <p>Same endpoint failing consistently</p>
            <div className="pattern-details">
              <code className="inline-code">POST /api/user - 500 Internal Server Error</code>
            </div>
          </div>

          <div className="pattern-card info">
            <div className="pattern-header">
              <span className="severity">Info</span>
              <span className="count">25 occurrences</span>
            </div>
            <h4>Performance Bottleneck</h4>
            <p>Long task blocking main thread</p>
            <div className="pattern-details">
              <code className="inline-code">Task took 847ms (threshold: 50ms)</code>
            </div>
          </div>
        </div>

        <div className="pattern-insights">
          <h4>Pattern Insights</h4>
          <ul className="insights-list">
            <li>
              <strong>Error Clustering:</strong>
              Groups related errors from the same root cause
            </li>
            <li>
              <strong>Frequency Analysis:</strong>
              Tracks error rates and spikes over time
            </li>
            <li>
              <strong>Impact Assessment:</strong>
              Identifies which errors affect most users
            </li>
            <li>
              <strong>Smart Deduplication:</strong>
              Combines identical errors with occurrence count
            </li>
          </ul>
        </div>
      </div>
    );
  }

  function VisualCaptureContent() {
    return (
      <div className="content-section">
        <h3>Report Bugs Without Code</h3>
        <p>Perfect for designers, QA testers, and product managers!</p>

        <div className="workflow">
          <div className="workflow-step">
            <div className="step-icon">👆</div>
            <h4>Click to Select</h4>
            <p>Point at any element</p>
          </div>
          <div className="workflow-arrow">→</div>
          <div className="workflow-step">
            <div className="step-icon">📸</div>
            <h4>Auto Capture</h4>
            <p>Screenshot + details</p>
          </div>
          <div className="workflow-arrow">→</div>
          <div className="workflow-step">
            <div className="step-icon">📝</div>
            <h4>Describe Issue</h4>
            <p>Add observations</p>
          </div>
          <div className="workflow-arrow">→</div>
          <div className="workflow-step">
            <div className="step-icon">🚀</div>
            <h4>Submit Report</h4>
            <p>Creates GitHub issue</p>
          </div>
        </div>

        <h4>What Gets Captured</h4>
        <div className="capture-grid">
          <div className="capture-item">
            <span className="icon">📷</span>
            <span>Screenshot</span>
          </div>
          <div className="capture-item">
            <span className="icon">🎯</span>
            <span>Element selector</span>
          </div>
          <div className="capture-item">
            <span className="icon">📐</span>
            <span>Dimensions</span>
          </div>
          <div className="capture-item">
            <span className="icon">🎨</span>
            <span>Computed styles</span>
          </div>
          <div className="capture-item">
            <span className="icon">🔗</span>
            <span>DOM hierarchy</span>
          </div>
          <div className="capture-item">
            <span className="icon">⚡</span>
            <span>Event listeners</span>
          </div>
          <div className="capture-item">
            <span className="icon">🚨</span>
            <span>Console errors</span>
          </div>
          <div className="capture-item">
            <span className="icon">📊</span>
            <span>Performance metrics</span>
          </div>
        </div>

        <div className="card demo-card">
          <button className="btn btn-primary">Try Visual Capture Mode</button>
          <p>Activates on any webpage - try it on your own site!</p>
        </div>
      </div>
    );
  }

  function ElementInspectorContent() {
    return (
      <div className="content-section">
        <h3>Chrome DevTools-Quality Selection</h3>

        <div className="selection-demo">
          <h4>Intelligent Scoring System</h4>
          <p>Mosqit uses multiple factors to select the right element:</p>
          <ul className="scoring-factors">
            <li>🎯 <strong>Proximity:</strong> Distance from cursor</li>
            <li>🖱️ <strong>Interactivity:</strong> Buttons and links prioritized</li>
            <li>📏 <strong>Size:</strong> Smaller elements preferred when nested</li>
            <li>🎨 <strong>Visibility:</strong> Visible boundaries weighted higher</li>
            <li>📚 <strong>Semantic value:</strong> Meaningful HTML elements</li>
          </ul>
        </div>

        <div className="box-model-visual">
          <h4>Visual Box Model</h4>
          <div className="box-model">
            <div className="box-margin">
              <span>Margin</span>
              <div className="box-border">
                <span>Border</span>
                <div className="box-padding">
                  <span>Padding</span>
                  <div className="box-content">
                    <span>Content</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="color-legend">
            <span className="legend-item content-color">Content</span>
            <span className="legend-item padding-color">Padding</span>
            <span className="legend-item border-color">Border</span>
            <span className="legend-item margin-color">Margin</span>
          </div>
        </div>
      </div>
    );
  }

  function AISetupContent({ onCopy }: { onCopy: (code: string) => void }) {
    return (
      <div className="content-section">
        <h3>Activate Chrome&apos;s Built-in AI</h3>

        <div className="steps-container">
          <div className="setup-step">
            <div className="step-header">
              <span className="step-num">1</span>
              <h4>Check Chrome Version</h4>
            </div>
            <p>Ensure you have Chrome 127 or higher</p>
            <div className="code-block">
              <pre>chrome://version</pre>
              <button className="copy-btn" onClick={() => onCopy('chrome://version')}>
                📋
              </button>
            </div>
          </div>

          <div className="setup-step">
            <div className="step-header">
              <span className="step-num">2</span>
              <h4>Enable AI Flags</h4>
            </div>
            <p>Navigate to chrome://flags and enable:</p>
            <div className="flags-list">
              <div className="flag-item">
                <code className="inline-code">#prompt-api-for-gemini-nano</code>
                <span>Error analysis</span>
              </div>
              <div className="flag-item">
                <code className="inline-code">#optimization-guide-on-device-model</code>
                <span>Model downloads</span>
              </div>
            </div>
          </div>

          <div className="setup-step">
            <div className="step-header">
              <span className="step-num">3</span>
              <h4>Restart Chrome</h4>
            </div>
            <p>Completely restart all Chrome windows</p>
          </div>

          <div className="setup-step success">
            <div className="step-header">
              <span className="step-num">✓</span>
              <h4>Verify Installation</h4>
            </div>
            <p>Test in DevTools console:</p>
            <div className="code-block">
              <pre>await window.ai?.languageModel?.capabilities()</pre>
              <button
                className="copy-btn"
                onClick={() => onCopy('await window.ai?.languageModel?.capabilities()')}
              >
                📋
              </button>
            </div>
          </div>
        </div>

        <div className="ai-status">
          <h4>AI Status Check</h4>
          <div className="status-indicator">
            <span className="status-dot active"></span>
            <span>AI Ready - Gemini Nano model loaded</span>
          </div>
        </div>
      </div>
    );
  }

  function AIAnalysisContent() {
    return (
      <div className="content-section">
        <h3>AI-Powered Debugging Assistant</h3>

        <div className="ai-example">
          <div className="error-input">
            <h4>Your Error:</h4>
            <pre className="code-block error">
{`TypeError: Cannot read property 'map' of undefined
  at Products.render (products.jsx:23:19)`}
            </pre>
          </div>

          <div className="ai-output">
            <h4>🤖 AI Analysis:</h4>

            <div className="analysis-section">
              <h5>Root Cause</h5>
              <p>The component is trying to call .map() on a variable that is undefined, likely because data hasn&apos;t loaded yet from an API call.</p>
            </div>

            <div className="analysis-section">
              <h5>Quick Fix</h5>
              <pre className="code-block">
{`// Option 1: Default value
const [products, setProducts] = useState([]);

// Option 2: Conditional rendering
{products && products.map(item => ...)}

// Option 3: Optional chaining
{products?.map(item => ...)}`}
              </pre>
            </div>

            <div className="analysis-section">
              <h5>Prevention</h5>
              <ul>
                <li>Always initialize state with appropriate defaults</li>
                <li>Add loading states for async data</li>
                <li>Use TypeScript for type safety</li>
                <li>Implement proper error boundaries</li>
              </ul>
            </div>
          </div>
        </div>

        <h4>What AI Can Do</h4>
        <div className="capability-grid">
          <div className="capability">
            <span className="icon">🔍</span>
            <h5>Root Cause Analysis</h5>
            <p>Identifies why errors occur</p>
          </div>
          <div className="capability">
            <span className="icon">💡</span>
            <h5>Solution Suggestions</h5>
            <p>Multiple fix approaches</p>
          </div>
          <div className="capability">
            <span className="icon">📝</span>
            <h5>Code Examples</h5>
            <p>Ready-to-use snippets</p>
          </div>
          <div className="capability">
            <span className="icon">🛡️</span>
            <h5>Best Practices</h5>
            <p>Prevention strategies</p>
          </div>
          <div className="capability">
            <span className="icon">📚</span>
            <h5>Documentation</h5>
            <p>Links to relevant docs</p>
          </div>
          <div className="capability">
            <span className="icon">🎯</span>
            <h5>Pattern Recognition</h5>
            <p>Identifies common issues</p>
          </div>
        </div>
      </div>
    );
  }

  function FallbackAnalysisContent() {
    return (
      <div className="content-section">
        <h3>Works Even Without AI</h3>
        <p>Mosqit includes comprehensive fallback systems:</p>

        <div className="comparison">
          <div className="compare-item with-ai">
            <h4>✨ With Chrome AI</h4>
            <ul>
              <li>Natural language explanations</li>
              <li>Context-aware solutions</li>
              <li>Framework-specific fixes</li>
              <li>Learning from patterns</li>
            </ul>
          </div>

          <div className="compare-item without-ai">
            <h4>💪 Without AI (Fallback)</h4>
            <ul>
              <li>500+ error patterns database</li>
              <li>Regex-based classification</li>
              <li>Pre-written solutions</li>
              <li>Stack trace analysis</li>
            </ul>
          </div>
        </div>

        <h4>Pattern Database Sample</h4>
        <div className="pattern-examples">
          <div className="pattern-example">
            <code className="inline-code">Cannot read property .* of (null|undefined)</code>
            <span>→ Null reference error</span>
          </div>
          <div className="pattern-example">
            <code className="inline-code">Maximum call stack size exceeded</code>
            <span>→ Infinite recursion</span>
          </div>
          <div className="pattern-example">
            <code className="inline-code">CORS.*blocked</code>
            <span>→ Cross-origin issue</span>
          </div>
          <div className="pattern-example">
            <code className="inline-code">is not a function</code>
            <span>→ Type error</span>
          </div>
        </div>

        <div className="fallback-quality">
          <h4>Fallback Quality</h4>
          <div className="quality-meter">
            <div className="meter-fill" style={{ width: '85%' }}></div>
            <span>85% accuracy without AI</span>
          </div>
          <p>Our pattern matching covers most common JavaScript errors effectively!</p>
        </div>
      </div>
    );
  }

  function GitHubSetupContent() {
    return (
      <div className="content-section">
        <h3>Direct Issue Creation</h3>

        <div className="github-flow">
          <div className="flow-step">
            <h4>1. Get Your Token</h4>
            <ol>
              <li>Go to GitHub Settings → Developer Settings</li>
              <li>Personal access tokens → Tokens (classic)</li>
              <li>Generate new token with <code className="inline-code">repo</code> scope</li>
            </ol>
            <button className="btn btn-secondary">Open GitHub Settings →</button>
          </div>

          <div className="flow-step">
            <h4>2. Configure in Mosqit</h4>
            <div className="config-form">
              <input type="password" placeholder="GitHub Token" className="input-field" />
              <input type="text" placeholder="owner/repository" className="input-field" />
              <button className="btn btn-primary">Save Configuration</button>
            </div>
          </div>

          <div className="flow-step">
            <h4>3. Submit Issues</h4>
            <p>Click &quot;Submit to GitHub&quot; after capturing any bug!</p>
          </div>
        </div>

        <div className="issue-preview">
          <h4>Generated Issue Preview</h4>
          <div className="issue-card">
            <div className="issue-header">
              <span className="issue-label bug">bug</span>
              <span className="issue-label priority">high priority</span>
              <h5>[Bug]: Submit button throws null reference error</h5>
            </div>
            <div className="issue-body">
              <strong>Description:</strong> Button click fails with TypeError<br/>
              <strong>Console Errors:</strong> 3 errors captured<br/>
              <strong>AI Analysis:</strong> Missing null check on form.value<br/>
              <strong>Screenshots:</strong> 1 attachment<br/>
              <strong>Environment:</strong> Chrome 120, Windows 11
            </div>
          </div>
        </div>

        <h4>What Gets Included</h4>
        <ul className="feature-list">
          <li>✅ AI-enhanced title and description</li>
          <li>✅ Full error stack traces</li>
          <li>✅ Screenshot with annotations</li>
          <li>✅ Browser and system info</li>
          <li>✅ Element selectors and DOM path</li>
          <li>✅ Suggested fixes from AI</li>
          <li>✅ Reproduction steps</li>
          <li>✅ Performance metrics</li>
        </ul>
      </div>
    );
  }

  function ExportOptionsContent() {
    return (
      <div className="content-section">
        <h3>Multiple Export Formats</h3>

        <div className="export-grid">
          <div className="export-option">
            <div className="option-icon">📋</div>
            <h4>Clipboard</h4>
            <p>Quick copy for chat/email</p>
            <small className="muted">Markdown formatted</small>
          </div>

          <div className="export-option">
            <div className="option-icon">📄</div>
            <h4>JSON</h4>
            <p>Structured data export</p>
            <small className="muted">For analysis tools</small>
          </div>

          <div className="export-option">
            <div className="option-icon">📊</div>
            <h4>CSV</h4>
            <p>Spreadsheet compatible</p>
            <small className="muted">For reporting</small>
          </div>

          <div className="export-option">
            <div className="option-icon">🐛</div>
            <h4>HAR</h4>
            <p>Network activity log</p>
            <small className="muted">Chrome DevTools format</small>
          </div>
        </div>

        <h4>Example Export</h4>
        <pre className="code-block">
{`{
  "timestamp": "2024-01-15T14:23:45.678Z",
  "url": "https://example.com/checkout",
  "errors": [
    {
      "level": "error",
      "message": "Cannot read property 'value' of null",
      "file": "checkout.js",
      "line": 42,
      "stack": "TypeError: Cannot read property...",
      "aiAnalysis": "Form field #email not found in DOM"
    }
  ],
  "metrics": {
    "loadTime": 1234,
    "memoryUsage": 45.2,
    "errorCount": 3
  }
}`}
        </pre>

        <h4>Quick Share</h4>
        <div className="share-buttons">
          <button className="share-btn">📧 Email</button>
          <button className="share-btn">💬 Slack</button>
          <button className="share-btn">📎 Jira</button>
          <button className="share-btn">🔗 Share Link</button>
        </div>
      </div>
    );
  }

  function CommonIssuesContent() {
    const [expandedFaq, setExpandedFaq] = useState<string>('');

    return (
      <div className="content-section">
        <div className="faq-section">
          <div className="faq-item">
            <button
              className="faq-question"
              onClick={() => setExpandedFaq(expandedFaq === 'devtools' ? '' : 'devtools')}
            >
              <span className="faq-icon">❌</span>
              <span>Mosqit tab not showing in DevTools?</span>
              <span className="expand-icon">{expandedFaq === 'devtools' ? '−' : '+'}</span>
            </button>
            {expandedFaq === 'devtools' && (
              <div className="faq-answer">
                <ul>
                  <li>✅ Refresh the page after installation</li>
                  <li>✅ Close and reopen DevTools</li>
                  <li>✅ Check extension is enabled in chrome://extensions</li>
                  <li>✅ Try disabling other DevTools extensions</li>
                </ul>
              </div>
            )}
          </div>

          <div className="faq-item">
            <button
              className="faq-question"
              onClick={() => setExpandedFaq(expandedFaq === 'logs' ? '' : 'logs')}
            >
              <span className="faq-icon">⚠️</span>
              <span>Not capturing all console logs?</span>
              <span className="expand-icon">{expandedFaq === 'logs' ? '−' : '+'}</span>
            </button>
            {expandedFaq === 'logs' && (
              <div className="faq-answer">
                <ul>
                  <li>✅ Ensure page loaded after Mosqit was installed</li>
                  <li>✅ Check filter settings aren&apos;t hiding logs</li>
                  <li>✅ Verify content scripts are injected (icon should be colored)</li>
                  <li>✅ Some sites block extensions - try a different site</li>
                </ul>
              </div>
            )}
          </div>

          <div className="faq-item">
            <button
              className="faq-question"
              onClick={() => setExpandedFaq(expandedFaq === 'ai' ? '' : 'ai')}
            >
              <span className="faq-icon">🤖</span>
              <span>AI features not working?</span>
              <span className="expand-icon">{expandedFaq === 'ai' ? '−' : '+'}</span>
            </button>
            {expandedFaq === 'ai' && (
              <div className="faq-answer">
                <ul>
                  <li>✅ Chrome 127+ required</li>
                  <li>✅ Enable flags: chrome://flags</li>
                  <li>✅ Restart Chrome completely</li>
                  <li>✅ Check: <code className="inline-code">window.ai</code> in console</li>
                  <li>ℹ️ Fallback patterns still work without AI!</li>
                </ul>
              </div>
            )}
          </div>

          <div className="faq-item">
            <button
              className="faq-question"
              onClick={() => setExpandedFaq(expandedFaq === 'github' ? '' : 'github')}
            >
              <span className="faq-icon">🐛</span>
              <span>GitHub integration failing?</span>
              <span className="expand-icon">{expandedFaq === 'github' ? '−' : '+'}</span>
            </button>
            {expandedFaq === 'github' && (
              <div className="faq-answer">
                <ul>
                  <li>✅ Token needs &apos;repo&apos; scope</li>
                  <li>✅ Format: owner/repository</li>
                  <li>✅ Check token hasn&apos;t expired</li>
                  <li>✅ Ensure repo exists and you have access</li>
                  <li>💡 Use copy feature as backup</li>
                </ul>
              </div>
            )}
          </div>
        </div>

        <div className="debug-checklist">
          <h4>Debug Checklist</h4>
          <div className="checklist">
            <label className="check-item">
              <input type="checkbox" />
              <span>Extension enabled in chrome://extensions</span>
            </label>
            <label className="check-item">
              <input type="checkbox" />
              <span>Page refreshed after install</span>
            </label>
            <label className="check-item">
              <input type="checkbox" />
              <span>DevTools reopened</span>
            </label>
            <label className="check-item">
              <input type="checkbox" />
              <span>No conflicting extensions</span>
            </label>
            <label className="check-item">
              <input type="checkbox" />
              <span>Chrome version 120+</span>
            </label>
          </div>
        </div>

        <div className="support-links">
          <h4>Still Need Help?</h4>
          <div className="support-buttons">
            <a href="https://github.com/ma-za-kpe/mosqit/issues" className="support-btn">
              🐛 Report Issue
            </a>
            <a href="https://github.com/ma-za-kpe/mosqit/discussions" className="support-btn">
              💬 Community Forum
            </a>
            <button
              className="support-btn"
              onClick={() => console.log('Mosqit Debug Info:', navigator.userAgent)}
            >
              📊 Generate Debug Info
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Calculate overall progress
  const calculateProgress = () => {
    const totalSections = Object.values(learningPaths).reduce(
      (acc, path) => acc + path.sections.length,
      0
    );
    const completedCount = completedSections.size;
    return Math.round((completedCount / totalSections) * 100);
  };

  // Handle section completion
  const toggleSectionComplete = (sectionId: string) => {
    const newCompleted = new Set(completedSections);
    if (newCompleted.has(sectionId)) {
      newCompleted.delete(sectionId);
    } else {
      newCompleted.add(sectionId);
    }
    setCompletedSections(newCompleted);
    localStorage.setItem('mosqit-completed-sections', JSON.stringify([...newCompleted]));
  };

  // Load completed sections from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('mosqit-completed-sections');
    if (saved) {
      setCompletedSections(new Set(JSON.parse(saved)));
    }
  }, []);

  // Handle copy code
  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopySuccess(code);
    setTimeout(() => setCopySuccess(''), 2000);
  };

  const progress = calculateProgress();

  return (
    <div className="tutorial-container">
      <style jsx global>{`
        /* Global Styles */
        .tutorial-container {
          min-height: 100vh;
          background: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%);
          color: #e0e0e0;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        /* Header */
        .header {
          background: rgba(0, 0, 0, 0.8);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          position: sticky;
          top: 0;
          z-index: 100;
        }

        .header-content {
          max-width: 1400px;
          margin: 0 auto;
          padding: 1rem 2rem;
        }

        .header-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
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
          border-radius: 10px;
          display: block;
          object-fit: contain;
        }

        .mobile-menu-toggle {
          display: none;
        }

        .mobile-overlay {
          display: none;
        }

        .copy-notification {
          position: fixed;
          top: 20px;
          right: 20px;
          background: linear-gradient(135deg, #22c55e, #16a34a);
          color: white;
          padding: 12px 24px;
          border-radius: 8px;
          box-shadow: 0 4px 20px rgba(34, 197, 94, 0.3);
          animation: slideIn 0.3s ease;
          z-index: 9999;
          font-weight: 500;
        }

        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        .logo-text {
          font-size: 1.5rem;
          font-weight: 700;
          color: white;
        }

        .header-actions {
          display: flex;
          gap: 1rem;
          align-items: center;
        }

        .search-bar {
          position: relative;
          width: 300px;
        }

        .search-input {
          width: 100%;
          padding: 0.5rem 1rem 0.5rem 2.5rem;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 8px;
          color: white;
          outline: none;
          transition: all 0.2s;
        }

        .search-input:focus {
          background: rgba(255, 255, 255, 0.15);
          border-color: #ff6b6b;
        }

        .search-icon {
          position: absolute;
          left: 0.75rem;
          top: 50%;
          transform: translateY(-50%);
          color: #a0a0a0;
        }

        .github-button {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 8px;
          color: white;
          text-decoration: none;
          transition: all 0.2s;
        }

        .github-button:hover {
          background: rgba(255, 255, 255, 0.2);
          transform: translateY(-1px);
        }

        /* Progress Bar */
        .progress-section {
          padding: 1rem 0;
        }

        .progress-info {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.5rem;
        }

        .progress-label {
          font-size: 0.9rem;
          color: #a0a0a0;
        }

        .progress-percentage {
          font-size: 0.9rem;
          font-weight: 600;
          color: #22c55e;
        }

        .progress-bar {
          width: 100%;
          height: 4px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 2px;
          overflow: hidden;
        }

        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #22c55e, #10b981);
          border-radius: 2px;
          transition: width 0.5s ease;
        }

        /* Main Layout */
        .main-content {
          max-width: 1400px;
          margin: 0 auto;
          padding: 2rem;
          display: grid;
          grid-template-columns: 280px 1fr 280px;
          gap: 2rem;
        }

        /* Sidebar Navigation */
        .sidebar {
          position: sticky;
          top: 120px;
          height: fit-content;
        }

        .nav-section {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          padding: 1.5rem;
          margin-bottom: 1.5rem;
        }

        .nav-title {
          font-size: 0.85rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: #6b7280;
          margin-bottom: 1rem;
          font-weight: 600;
        }

        .nav-list {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .nav-item {
          margin-bottom: 0.5rem;
        }

        .nav-button {
          width: 100%;
          padding: 0.75rem 1rem;
          background: transparent;
          border: 1px solid transparent;
          border-radius: 8px;
          color: #a0a0a0;
          cursor: pointer;
          transition: all 0.2s;
          text-align: left;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-size: 0.95rem;
        }

        .nav-button:hover {
          background: rgba(255, 255, 255, 0.05);
          color: white;
        }

        .nav-button.active {
          background: linear-gradient(135deg,
            rgba(255, 107, 107, 0.1),
            rgba(255, 107, 107, 0.05));
          border-color: #ff6b6b;
          color: white;
        }

        .nav-icon {
          font-size: 1.2rem;
        }

        .nav-text {
          flex: 1;
        }

        .nav-completed {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #22c55e;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.7rem;
        }

        /* Content Area */
        .content-area {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          overflow: hidden;
        }

        .content-header {
          padding: 2rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          background: linear-gradient(135deg,
            rgba(255, 107, 107, 0.05),
            transparent);
        }

        .content-title {
          font-size: 2rem;
          font-weight: 700;
          margin: 0 0 0.5rem;
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .content-description {
          color: #a0a0a0;
          margin: 0;
        }

        .content-meta {
          display: flex;
          gap: 2rem;
          margin-top: 1rem;
          font-size: 0.9rem;
        }

        .meta-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: #6b7280;
        }

        /* Sections */
        .sections-container {
          padding: 2rem;
        }

        .section {
          margin-bottom: 3rem;
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
          padding-bottom: 1rem;
          border-bottom: 2px solid rgba(255, 107, 107, 0.2);
        }

        .section-title {
          font-size: 1.5rem;
          font-weight: 600;
          margin: 0;
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .complete-button {
          padding: 0.5rem 1rem;
          background: transparent;
          border: 2px solid #22c55e;
          border-radius: 8px;
          color: #22c55e;
          cursor: pointer;
          transition: all 0.2s;
          font-weight: 600;
          font-size: 0.9rem;
        }

        .complete-button:hover {
          background: #22c55e;
          color: white;
        }

        .complete-button.completed {
          background: #22c55e;
          color: white;
        }

        /* Content Section Styles */
        .content-section {
          color: #d0d0d0;
        }

        .content-section h3 {
          font-size: 1.3rem;
          color: white;
          margin: 1.5rem 0 1rem;
          font-weight: 600;
        }

        .content-section h4 {
          font-size: 1.1rem;
          color: #ff6b6b;
          margin: 1.5rem 0 0.75rem;
          font-weight: 600;
        }

        .content-section h5 {
          font-size: 1rem;
          color: #60a5fa;
          margin: 1rem 0 0.5rem;
          font-weight: 600;
        }

        .content-section p {
          line-height: 1.7;
          margin: 0.75rem 0;
        }

        .content-section ul, .content-section ol {
          margin: 1rem 0;
          padding-left: 1.5rem;
        }

        .content-section li {
          margin: 0.5rem 0;
          line-height: 1.6;
        }

        .content-section strong {
          color: white;
          font-weight: 600;
        }

        /* Cards and Boxes */
        .card {
          background: rgba(0, 0, 0, 0.3);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          padding: 1.5rem;
          margin: 1.5rem 0;
        }

        .highlight-card {
          background: linear-gradient(135deg,
            rgba(255, 107, 107, 0.05),
            rgba(0, 0, 0, 0.3));
        }

        .demo-card {
          background: linear-gradient(135deg,
            rgba(139, 92, 246, 0.1),
            rgba(139, 92, 246, 0.05));
          border-color: rgba(139, 92, 246, 0.3);
          text-align: center;
        }

        /* Code Blocks */
        .code-block {
          background: #0a0a0a;
          border: 1px solid #333;
          border-radius: 8px;
          padding: 1rem;
          margin: 1rem 0;
          overflow-x: auto;
          font-family: 'Consolas', 'Monaco', monospace;
          font-size: 0.9rem;
          position: relative;
          white-space: pre;
        }

        .code-block.error {
          border-color: rgba(239, 68, 68, 0.3);
          background: linear-gradient(135deg,
            rgba(239, 68, 68, 0.05),
            #0a0a0a);
        }

        .inline-code {
          background: rgba(255, 107, 107, 0.1);
          color: #ff8a8a;
          padding: 0.2rem 0.4rem;
          border-radius: 4px;
          font-family: 'Consolas', 'Monaco', monospace;
          font-size: 0.9em;
        }

        .copy-btn {
          position: absolute;
          top: 0.5rem;
          right: 0.5rem;
          padding: 0.25rem 0.5rem;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 4px;
          color: white;
          cursor: pointer;
          font-size: 0.9rem;
          transition: all 0.2s;
        }

        .copy-btn:hover {
          background: rgba(255, 255, 255, 0.2);
        }

        /* Buttons */
        .btn {
          padding: 0.75rem 1.5rem;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          border: none;
          font-size: 0.95rem;
        }

        .btn-primary {
          background: linear-gradient(135deg, #ff6b6b, #ff4444);
          color: white;
        }

        .btn-primary:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(255, 107, 107, 0.3);
        }

        .btn-secondary {
          background: transparent;
          border: 2px solid rgba(255, 255, 255, 0.2);
          color: white;
        }

        .btn-secondary:hover {
          background: rgba(255, 255, 255, 0.1);
          border-color: rgba(255, 255, 255, 0.3);
        }

        .btn-success {
          background: linear-gradient(135deg, #22c55e, #16a34a);
          color: white;
        }

        .btn-demo {
          background: linear-gradient(135deg, #8b5cf6, #7c3aed);
          color: white;
          font-size: 1.1rem;
          padding: 1rem 2rem;
        }

        .btn-demo:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(139, 92, 246, 0.3);
        }

        /* Grids and Layouts */
        .install-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.5rem;
          margin: 1.5rem 0;
        }

        .install-option {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          padding: 1.5rem;
          position: relative;
        }

        .install-option.recommended {
          border-color: #22c55e;
        }

        .badge {
          position: absolute;
          top: -0.5rem;
          right: 1rem;
          background: #22c55e;
          color: white;
          padding: 0.25rem 0.75rem;
          border-radius: 4px;
          font-size: 0.75rem;
          font-weight: 600;
        }

        .req-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1rem;
          margin: 1rem 0;
        }

        .req-card {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          padding: 1rem;
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .req-card .icon {
          font-size: 1.5rem;
        }

        .req-card small {
          display: block;
          color: #a0a0a0;
          font-size: 0.85rem;
        }

        /* Steps */
        .steps-container {
          margin: 2rem 0;
        }

        .step {
          display: flex;
          gap: 1.5rem;
          margin-bottom: 2rem;
          position: relative;
        }

        .step:not(:last-child)::after {
          content: "";
          position: absolute;
          left: 1.5rem;
          top: 3rem;
          bottom: -1.5rem;
          width: 2px;
          background: rgba(255, 255, 255, 0.1);
        }

        .step-number {
          width: 3rem;
          height: 3rem;
          background: linear-gradient(135deg, #ff6b6b, #ff4444);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          font-size: 1.2rem;
          color: white;
          flex-shrink: 0;
        }

        .step.complete .step-number {
          background: linear-gradient(135deg, #22c55e, #16a34a);
        }

        .step-content {
          flex: 1;
        }

        .step-content h4 {
          margin: 0 0 0.5rem;
          color: white;
        }

        .step-content p {
          margin: 0;
          color: #a0a0a0;
        }

        /* Tips and Hints */
        .tip-box {
          background: linear-gradient(135deg,
            rgba(34, 197, 94, 0.1),
            rgba(34, 197, 94, 0.05));
          border: 1px solid rgba(34, 197, 94, 0.3);
          border-radius: 8px;
          padding: 1rem;
          margin: 1rem 0;
        }

        .keyboard-hint {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          margin-top: 0.5rem;
        }

        kbd {
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.3);
          border-radius: 4px;
          padding: 0.2rem 0.5rem;
          font-family: monospace;
          font-size: 0.9rem;
          color: white;
        }

        /* UI Diagram */
        .ui-diagram {
          background: rgba(0, 0, 0, 0.5);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          padding: 1rem;
          margin: 1rem 0;
        }

        .ui-area {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 6px;
          padding: 1rem;
          margin-bottom: 0.5rem;
          transition: all 0.2s;
        }

        .ui-area:hover {
          background: rgba(255, 255, 255, 0.08);
          border-color: #ff6b6b;
        }

        .ui-area .label {
          display: block;
          font-weight: 600;
          color: #ff6b6b;
          margin-bottom: 0.25rem;
        }

        .ui-area p {
          margin: 0;
          font-size: 0.9rem;
          color: #a0a0a0;
        }

        /* Controls Grid */
        .control-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1rem;
          margin: 1rem 0;
        }

        .control-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
          padding: 1rem;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          transition: all 0.2s;
        }

        .control-item:hover {
          background: rgba(255, 255, 255, 0.05);
          transform: translateY(-2px);
        }

        .icon-btn {
          width: 3rem;
          height: 3rem;
          border-radius: 8px;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
          cursor: pointer;
          transition: all 0.2s;
        }

        .icon-btn:hover {
          background: rgba(255, 107, 107, 0.1);
          border-color: #ff6b6b;
        }

        /* Enhancement Grid */
        .enhancement-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
          margin: 1.5rem 0;
        }

        .enhancement-card {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          padding: 1.5rem;
          text-align: center;
          transition: all 0.2s;
        }

        .enhancement-card:hover {
          background: rgba(255, 255, 255, 0.05);
          transform: translateY(-2px);
        }

        .enhancement-card .icon {
          font-size: 2rem;
          margin-bottom: 0.5rem;
        }

        /* Comparison */
        .comparison {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.5rem;
          margin: 1.5rem 0;
        }

        .compare-item {
          padding: 1.5rem;
          border-radius: 8px;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .compare-item.before {
          background: linear-gradient(135deg,
            rgba(239, 68, 68, 0.05),
            rgba(0, 0, 0, 0.3));
          border-color: rgba(239, 68, 68, 0.3);
        }

        .compare-item.after {
          background: linear-gradient(135deg,
            rgba(34, 197, 94, 0.05),
            rgba(0, 0, 0, 0.3));
          border-color: rgba(34, 197, 94, 0.3);
        }

        .compare-item.with-ai {
          background: linear-gradient(135deg,
            rgba(59, 130, 246, 0.05),
            rgba(0, 0, 0, 0.3));
          border-color: rgba(59, 130, 246, 0.3);
        }

        .compare-item.without-ai {
          background: linear-gradient(135deg,
            rgba(251, 191, 36, 0.05),
            rgba(0, 0, 0, 0.3));
          border-color: rgba(251, 191, 36, 0.3);
        }

        /* Tables */
        .data-table {
          width: 100%;
          background: rgba(0, 0, 0, 0.3);
          border-radius: 8px;
          overflow: hidden;
          margin: 1rem 0;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .data-table th {
          background: rgba(255, 107, 107, 0.1);
          padding: 0.75rem;
          text-align: left;
          font-weight: 600;
          color: white;
          border-bottom: 2px solid rgba(255, 107, 107, 0.2);
        }

        .data-table td {
          padding: 0.75rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .data-table tr:last-child td {
          border-bottom: none;
        }

        .data-table tr:hover {
          background: rgba(255, 255, 255, 0.02);
        }

        /* Pattern Cards */
        .pattern-cards {
          display: grid;
          gap: 1rem;
          margin: 1.5rem 0;
        }

        .pattern-card {
          padding: 1.5rem;
          border-radius: 8px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          background: rgba(0, 0, 0, 0.3);
        }

        .pattern-card.critical {
          border-color: rgba(239, 68, 68, 0.3);
          background: linear-gradient(135deg,
            rgba(239, 68, 68, 0.05),
            rgba(0, 0, 0, 0.3));
        }

        .pattern-card.warning {
          border-color: rgba(251, 191, 36, 0.3);
          background: linear-gradient(135deg,
            rgba(251, 191, 36, 0.05),
            rgba(0, 0, 0, 0.3));
        }

        .pattern-card.info {
          border-color: rgba(59, 130, 246, 0.3);
          background: linear-gradient(135deg,
            rgba(59, 130, 246, 0.05),
            rgba(0, 0, 0, 0.3));
        }

        .pattern-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.75rem;
        }

        .pattern-card .severity {
          padding: 0.25rem 0.75rem;
          border-radius: 4px;
          font-size: 0.85rem;
          font-weight: 600;
        }

        .pattern-card.critical .severity {
          background: rgba(239, 68, 68, 0.2);
          color: #ef4444;
        }

        .pattern-card.warning .severity {
          background: rgba(251, 191, 36, 0.2);
          color: #fbbf24;
        }

        .pattern-card.info .severity {
          background: rgba(59, 130, 246, 0.2);
          color: #60a5fa;
        }

        .pattern-card .count {
          font-size: 0.85rem;
          color: #a0a0a0;
        }

        /* Workflow */
        .workflow {
          display: flex;
          align-items: center;
          justify-content: space-around;
          margin: 2rem 0;
          padding: 2rem;
          background: rgba(0, 0, 0, 0.3);
          border-radius: 12px;
        }

        .workflow-step {
          text-align: center;
          flex: 1;
        }

        .workflow-arrow {
          color: #ff6b6b;
          font-size: 1.5rem;
          margin: 0 1rem;
        }

        .step-icon {
          font-size: 2.5rem;
          margin-bottom: 0.5rem;
        }

        /* Capture Grid */
        .capture-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1rem;
          margin: 1.5rem 0;
        }

        .capture-item {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          padding: 1rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
          transition: all 0.2s;
        }

        .capture-item:hover {
          background: rgba(255, 255, 255, 0.05);
          transform: translateY(-2px);
        }

        /* Box Model Visual */
        .box-model {
          width: 300px;
          margin: 2rem auto;
        }

        .box-margin {
          background: rgba(251, 191, 36, 0.1);
          border: 2px dashed rgba(251, 191, 36, 0.3);
          padding: 20px;
          position: relative;
        }

        .box-border {
          background: rgba(139, 92, 246, 0.1);
          border: 2px solid rgba(139, 92, 246, 0.5);
          padding: 20px;
        }

        .box-padding {
          background: rgba(34, 197, 94, 0.1);
          border: 2px dashed rgba(34, 197, 94, 0.3);
          padding: 20px;
        }

        .box-content {
          background: rgba(239, 68, 68, 0.1);
          border: 2px solid rgba(239, 68, 68, 0.5);
          padding: 20px;
          text-align: center;
        }

        .color-legend {
          display: flex;
          justify-content: center;
          gap: 1rem;
          margin-top: 1rem;
        }

        .legend-item {
          padding: 0.25rem 0.75rem;
          border-radius: 4px;
          font-size: 0.85rem;
        }

        .legend-item.content-color {
          background: rgba(239, 68, 68, 0.2);
          color: #ef4444;
        }

        .legend-item.padding-color {
          background: rgba(34, 197, 94, 0.2);
          color: #22c55e;
        }

        .legend-item.border-color {
          background: rgba(139, 92, 246, 0.2);
          color: #8b5cf6;
        }

        .legend-item.margin-color {
          background: rgba(251, 191, 36, 0.2);
          color: #fbbf24;
        }

        /* FAQ Section */
        .faq-item {
          margin-bottom: 1rem;
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          overflow: hidden;
        }

        .faq-question {
          width: 100%;
          padding: 1rem;
          background: rgba(255, 255, 255, 0.03);
          border: none;
          color: white;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 1rem;
          transition: all 0.2s;
          text-align: left;
        }

        .faq-question:hover {
          background: rgba(255, 255, 255, 0.05);
        }

        .faq-icon {
          font-size: 1.2rem;
        }

        .expand-icon {
          margin-left: auto;
          font-size: 1.2rem;
        }

        .faq-answer {
          padding: 1rem;
          background: rgba(0, 0, 0, 0.3);
          border-top: 1px solid rgba(255, 255, 255, 0.1);
        }

        /* Right Sidebar */
        .right-sidebar {
          position: sticky;
          top: 120px;
          height: fit-content;
        }

        .toc-section {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          padding: 1.5rem;
          margin-bottom: 1.5rem;
        }

        .toc-title {
          font-size: 0.85rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: #6b7280;
          margin-bottom: 1rem;
          font-weight: 600;
        }

        .toc-list {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .toc-item {
          margin-bottom: 0.5rem;
        }

        .toc-link {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: #a0a0a0;
          text-decoration: none;
          font-size: 0.9rem;
          transition: color 0.2s;
        }

        .toc-link:hover {
          color: white;
        }

        .toc-link.active {
          color: #ff6b6b;
        }

        .toc-check {
          width: 16px;
          height: 16px;
          border-radius: 3px;
          border: 2px solid #4b5563;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.7rem;
        }

        .toc-check.completed {
          background: #22c55e;
          border-color: #22c55e;
          color: white;
        }

        /* Help Section */
        .help-section {
          background: linear-gradient(135deg,
            rgba(59, 130, 246, 0.1),
            rgba(59, 130, 246, 0.05));
          border: 1px solid rgba(59, 130, 246, 0.3);
          border-radius: 12px;
          padding: 1.5rem;
        }

        .help-title {
          font-size: 1rem;
          font-weight: 600;
          margin: 0 0 1rem;
          color: #60a5fa;
        }

        .help-links {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .help-link {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: #93c5fd;
          text-decoration: none;
          font-size: 0.9rem;
          transition: color 0.2s;
        }

        .help-link:hover {
          color: white;
        }

        /* Misc */
        .muted {
          color: #6b7280;
        }

        .support-buttons {
          display: flex;
          gap: 1rem;
          flex-wrap: wrap;
        }

        .support-btn {
          padding: 0.75rem 1.5rem;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 8px;
          color: white;
          text-decoration: none;
          transition: all 0.2s;
          cursor: pointer;
        }

        .support-btn:hover {
          background: rgba(255, 255, 255, 0.1);
          transform: translateY(-1px);
        }

        .checklist {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          margin: 1rem 0;
        }

        .check-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          cursor: pointer;
        }

        .check-item input[type="checkbox"] {
          width: 20px;
          height: 20px;
          cursor: pointer;
        }

        /* Responsive */
        @media (max-width: 1200px) {
          .main-content {
            grid-template-columns: 250px 1fr;
          }

          .right-sidebar {
            display: none;
          }
        }

        @media (max-width: 768px) {
          .main-content {
            grid-template-columns: 1fr;
            padding: 0;
          }

          .sidebar {
            position: fixed;
            top: 0;
            left: -100%;
            width: 80%;
            max-width: 300px;
            height: 100vh;
            background: white;
            z-index: 1000;
            transition: left 0.3s ease;
            box-shadow: 2px 0 10px rgba(0, 0, 0, 0.1);
            overflow-y: auto;
          }

          .sidebar.mobile-open {
            left: 0;
          }

          .mobile-menu-toggle {
            display: block;
            position: fixed;
            bottom: 20px;
            right: 20px;
            width: 56px;
            height: 56px;
            background: linear-gradient(135deg, #667eea, #764ba2);
            border-radius: 50%;
            border: none;
            color: white;
            font-size: 24px;
            z-index: 999;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            cursor: pointer;
          }

          .mobile-overlay {
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.5);
            z-index: 999;
          }

          .mobile-overlay.show {
            display: block;
          }

          .header {
            padding: 1rem;
          }

          .header-content {
            padding: 0;
          }

          .header-top {
            flex-direction: column;
            gap: 1rem;
            text-align: center;
          }

          .search-bar {
            width: 100%;
            margin: 0;
          }

          .hero h1 {
            font-size: 2rem;
            line-height: 1.2;
          }

          .hero p {
            font-size: 1rem;
          }

          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 1rem;
          }

          .stat-card h3 {
            font-size: 1.5rem;
          }

          .content-container {
            padding: 1rem;
          }

          .content-section {
            padding: 1.5rem;
          }

          .install-grid,
          .comparison {
            grid-template-columns: 1fr;
          }

          .req-grid,
          .control-grid {
            grid-template-columns: 1fr;
          }

          .capture-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .workflow {
            flex-direction: column;
            gap: 1rem;
          }

          .workflow-arrow {
            transform: rotate(90deg);
          }

          .step {
            padding: 1rem;
          }

          .step-number {
            width: 32px;
            height: 32px;
            font-size: 1rem;
          }

          .code-block {
            font-size: 0.875rem;
            padding: 1rem;
            overflow-x: auto;
          }

          pre {
            font-size: 0.875rem;
          }

          .copy-btn {
            padding: 0.5rem;
            font-size: 0.875rem;
          }

          .faq-item {
            padding: 1rem;
          }

          .tip-box, .warning-box, .info-box {
            padding: 1rem;
            font-size: 0.9rem;
          }

          h1 {
            font-size: 2rem;
          }

          h2 {
            font-size: 1.5rem;
          }

          h3 {
            font-size: 1.25rem;
          }

          h4 {
            font-size: 1.1rem;
          }

          .nav-button {
            padding: 0.75rem 1rem;
            font-size: 0.9rem;
          }

          .learning-path-card {
            padding: 1rem;
          }

          .progress-bar {
            height: 6px;
          }

          .btn {
            padding: 0.75rem 1.5rem;
            font-size: 0.9rem;
          }

          .analysis-card {
            padding: 1.25rem;
          }

          .flow-step {
            padding: 1rem;
          }
        }

        @media (max-width: 480px) {
          .stats-grid {
            grid-template-columns: 1fr;
          }

          .capture-grid {
            grid-template-columns: 1fr;
          }

          .hero h1 {
            font-size: 1.75rem;
          }

          .header-top {
            padding: 0.5rem;
          }

          .content-section {
            padding: 1rem;
          }

          .mobile-menu-toggle {
            width: 48px;
            height: 48px;
            font-size: 20px;
            bottom: 15px;
            right: 15px;
          }
        }
      `}</style>

      {/* Copy Success Notification */}
      {copySuccess && (
        <div className="copy-notification">
          ✅ Copied to clipboard!
        </div>
      )}

      <header className="header">
        <div className="header-content">
          <div className="header-top">
            <Link href="/" className="logo">
              <Image src="/icon.svg" alt="Mosqit" className="logo-icon" width={40} height={40} />
              <div className="logo-text">Mosqit Learn</div>
            </Link>

            <div className="header-actions">
              <div className="search-bar">
                <span className="search-icon">🔍</span>
                <input
                  type="text"
                  className="search-input"
                  placeholder="Search documentation..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <a
                href="https://github.com/ma-za-kpe/mosqit"
                target="_blank"
                rel="noopener noreferrer"
                className="github-button"
              >
                <span>⭐</span>
                <span>GitHub</span>
              </a>
            </div>
          </div>

          <div className="progress-section">
            <div className="progress-info">
              <span className="progress-label">Your Learning Progress</span>
              <span className="progress-percentage">{progress}% Complete</span>
            </div>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${progress}%` }}></div>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu Toggle Button */}
      <button
        className="mobile-menu-toggle"
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        aria-label="Toggle menu"
      >
        {mobileMenuOpen ? '✕' : '☰'}
      </button>

      {/* Mobile Overlay */}
      <div
        className={`mobile-overlay ${mobileMenuOpen ? 'show' : ''}`}
        onClick={() => setMobileMenuOpen(false)}
      />

      <main className="main-content">
        {/* Left Sidebar - Navigation */}
        <aside className={`sidebar ${mobileMenuOpen ? 'mobile-open' : ''}`}>
          <nav className="nav-section">
            <h3 className="nav-title">Learning Paths</h3>
            <ul className="nav-list">
              {Object.entries(learningPaths).map(([key, path]) => {
                const pathCompleted = path.sections.every(s =>
                  completedSections.has(s.id)
                );
                return (
                  <li key={key} className="nav-item">
                    <button
                      className={`nav-button ${activeTab === key ? 'active' : ''}`}
                      onClick={() => {
                        setActiveTab(key);
                        setMobileMenuOpen(false);
                      }}
                    >
                      <span className="nav-icon">{path.icon}</span>
                      <span className="nav-text">{path.title}</span>
                      {pathCompleted && <span className="nav-completed">✓</span>}
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>

          <nav className="nav-section">
            <h3 className="nav-title">Quick Links</h3>
            <ul className="nav-list">
              <li className="nav-item">
                <a href="#" className="nav-button">
                  <span className="nav-icon">📹</span>
                  <span className="nav-text">Video Tutorials</span>
                </a>
              </li>
              <li className="nav-item">
                <a href="#" className="nav-button">
                  <span className="nav-icon">💬</span>
                  <span className="nav-text">Community</span>
                </a>
              </li>
              <li className="nav-item">
                <a href="#" className="nav-button">
                  <span className="nav-icon">📚</span>
                  <span className="nav-text">API Docs</span>
                </a>
              </li>
            </ul>
          </nav>
        </aside>

        {/* Main Content */}
        <div className="content-area">
          {activeTab && learningPaths[activeTab as keyof typeof learningPaths] && (
            <>
              <div className="content-header">
                <h1 className="content-title">
                  <span style={{ color: learningPaths[activeTab as keyof typeof learningPaths].color }}>
                    {learningPaths[activeTab as keyof typeof learningPaths].icon}
                  </span>
                  {learningPaths[activeTab as keyof typeof learningPaths].title}
                </h1>
                <p className="content-description">
                  {learningPaths[activeTab as keyof typeof learningPaths].description}
                </p>
                <div className="content-meta">
                  <span className="meta-item">
                    ⏱️ {learningPaths[activeTab as keyof typeof learningPaths].estimatedTime}
                  </span>
                  <span className="meta-item">
                    📚 {learningPaths[activeTab as keyof typeof learningPaths].sections.length} sections
                  </span>
                </div>
              </div>

              <div className="sections-container">
                {learningPaths[activeTab as keyof typeof learningPaths].sections.map((section) => {
                  const Component = section.component;
                  return (
                    <section key={section.id} className="section" id={section.id}>
                      <div className="section-header">
                        <h2 className="section-title">
                          {section.title}
                        </h2>
                        <button
                          className={`complete-button ${
                            completedSections.has(section.id) ? 'completed' : ''
                          }`}
                          onClick={() => toggleSectionComplete(section.id)}
                        >
                          {completedSections.has(section.id) ? '✓ Completed' : 'Mark Complete'}
                        </button>
                      </div>
                      <Component onCopy={handleCopyCode} />
                    </section>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* Right Sidebar - Table of Contents */}
        <aside className="right-sidebar">
          <div className="toc-section">
            <h3 className="toc-title">On This Page</h3>
            <ul className="toc-list">
              {activeTab && learningPaths[activeTab as keyof typeof learningPaths] &&
                learningPaths[activeTab as keyof typeof learningPaths].sections.map(section => (
                  <li key={section.id} className="toc-item">
                    <a
                      href={`#${section.id}`}
                      className={`toc-link ${activeSection === section.id ? 'active' : ''}`}
                      onClick={() => setActiveSection(section.id)}
                    >
                      <span className={`toc-check ${
                        completedSections.has(section.id) ? 'completed' : ''
                      }`}>
                        {completedSections.has(section.id) ? '✓' : ''}
                      </span>
                      <span>{section.title.replace(/^[^\s]+\s/, '')}</span>
                    </a>
                  </li>
                ))
              }
            </ul>
          </div>

          <div className="help-section">
            <h3 className="help-title">Need Help?</h3>
            <div className="help-links">
              <a href="https://github.com/ma-za-kpe/mosqit/issues" className="help-link">
                🐛 Report an Issue
              </a>
              <a href="https://github.com/ma-za-kpe/mosqit/discussions" className="help-link">
                💬 Ask a Question
              </a>
              <a href="https://buymeacoffee.com/mosqit" className="help-link">
                ☕ Support the Project
              </a>
            </div>
          </div>
        </aside>
      </main>
    </div>
  );
}