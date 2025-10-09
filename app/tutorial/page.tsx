'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function Tutorial() {
  const [copiedStep, setCopiedStep] = useState<string>('');

  const copyToClipboard = (text: string, step: string) => {
    navigator.clipboard.writeText(text);
    setCopiedStep(step);
    setTimeout(() => setCopiedStep(''), 2000);
  };

  return (
    <div className="tutorial-page">
      {/* Header */}
      <header className="tutorial-header">
        <div className="container">
          <Link href="/" className="back-link">← Back to Home</Link>
          <h1>🦟 Mosqit Tutorial</h1>
          <p className="subtitle">Get started in 5 minutes</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="tutorial-content">
        <div className="container">

          {/* Step 1: Installation */}
          <section className="tutorial-step">
            <div className="step-number">1</div>
            <div className="step-content">
              <h2>📥 Install the Extension</h2>
              <p className="step-description">
                Load the Mosqit extension in Chrome to start debugging with AI-powered insights.
              </p>

              <div className="instruction-box">
                <h3>Quick Install Steps:</h3>
                <ol>
                  <li>Open <code>chrome://extensions/</code> in Chrome</li>
                  <li>Enable <strong>&quot;Developer mode&quot;</strong> (top right)</li>
                  <li>Click <strong>&quot;Load unpacked&quot;</strong></li>
                  <li>Select the <code>dist/extension</code> folder</li>
                </ol>
              </div>

              <div className="tip-box">
                <strong>✅ Success!</strong> You should see the Mosqit icon (🦟) in your Chrome toolbar.
              </div>
            </div>
          </section>

          {/* Step 2: Enable Chrome AI */}
          <section className="tutorial-step">
            <div className="step-number">2</div>
            <div className="step-content">
              <h2>🤖 Enable Chrome AI (Optional)</h2>
              <p className="step-description">
                Get intelligent error analysis powered by Chrome&apos;s built-in AI (Gemini Nano).
              </p>

              <div className="instruction-box">
                <h3>AI Setup (2 minutes):</h3>
                <ol>
                  <li>Open <code>chrome://flags</code> in a new tab</li>
                  <li>Search for: <code>Prompt API for Gemini Nano</code></li>
                  <li>Set it to: <strong>&quot;Enabled&quot;</strong></li>
                  <li>Search for: <code>Gemini Nano</code></li>
                  <li>Set it to: <strong>&quot;Enabled&quot;</strong></li>
                  <li><strong>Restart Chrome completely</strong></li>
                </ol>
              </div>

              <div className="code-box">
                <h4>Test AI is working:</h4>
                <pre>
                  <code>{`// Open Console (F12) and run:
await ai.languageModel.create();
// Should return: LanguageModel object`}</code>
                </pre>
                <button
                  className="copy-btn"
                  onClick={() => copyToClipboard('await ai.languageModel.create();', 'ai-test')}
                >
                  {copiedStep === 'ai-test' ? '✓ Copied!' : 'Copy'}
                </button>
              </div>

              <div className="warning-box">
                <strong>⚠️ Note:</strong> AI features work without this, but you&apos;ll get pattern-based analysis instead of AI insights.
              </div>
            </div>
          </section>

          {/* Step 3: Open DevTools */}
          <section className="tutorial-step">
            <div className="step-number">3</div>
            <div className="step-content">
              <h2>🔧 Open Mosqit DevTools</h2>
              <p className="step-description">
                Access the Mosqit panel to start seeing intelligent error insights.
              </p>

              <div className="instruction-box">
                <h3>Open the Panel:</h3>
                <ol>
                  <li>Visit any website (try <code>example.com</code>)</li>
                  <li>Press <kbd>F12</kbd> or right-click → <strong>&quot;Inspect&quot;</strong></li>
                  <li>Look for the <strong>&quot;Mosqit&quot;</strong> tab in DevTools</li>
                  <li>Click it to open the panel</li>
                </ol>
              </div>

              <div className="tip-box">
                <strong>💡 Pro Tip:</strong> Keep DevTools docked to the bottom or right for the best experience.
              </div>
            </div>
          </section>

          {/* Step 4: Test It */}
          <section className="tutorial-step">
            <div className="step-number">4</div>
            <div className="step-content">
              <h2>🧪 Test with Real Errors</h2>
              <p className="step-description">
                Trigger some errors to see Mosqit&apos;s AI analysis in action.
              </p>

              <div className="code-box">
                <h4>Try these in the Console:</h4>
                <pre>
                  <code>{`// Null reference error
const user = null;
console.log(user.name);

// Undefined function
someFunction();

// Type error
const num = 5;
num.toUppercase();`}</code>
                </pre>
                <button
                  className="copy-btn"
                  onClick={() => copyToClipboard('const user = null;\nconsole.log(user.name);', 'test-error')}
                >
                  {copiedStep === 'test-error' ? '✓ Copied!' : 'Copy'}
                </button>
              </div>

              <div className="instruction-box">
                <h3>What You&apos;ll See:</h3>
                <ul>
                  <li>🤔 <strong>&quot;AI is analyzing...&quot;</strong> indicator appears</li>
                  <li>✨ AI-powered analysis with fix suggestions (1-2 seconds)</li>
                  <li>📍 File location and line number</li>
                  <li>🎯 Smart context about what went wrong</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Step 5: Visual Bug Reporter */}
          <section className="tutorial-step">
            <div className="step-number">5</div>
            <div className="step-content">
              <h2>🐛 Visual Bug Reporter</h2>
              <p className="step-description">
                Report visual bugs by clicking elements directly on the page. Captures screenshots, context, and element details automatically.
              </p>

              <div className="instruction-box">
                <h3>How to Use Visual Bug Reporter:</h3>
                <ol>
                  <li>In Mosqit DevTools panel, find the <strong>🐛 Visual Bug Reporter</strong> button (toolbar, top right)</li>
                  <li>Click it to switch from Logs view to Visual Bug Reporter view</li>
                  <li>Click the <strong>&quot;Start Capture Mode&quot;</strong> button</li>
                  <li>Hover over any element on the page (you&apos;ll see blue highlighting)</li>
                  <li>Click the element you want to report</li>
                </ol>
              </div>

              <div className="instruction-box">
                <h3>What Gets Captured:</h3>
                <ul>
                  <li>📸 <strong>Screenshot</strong> - Visual snapshot of the element and surrounding area</li>
                  <li>🎯 <strong>Element Selector</strong> - CSS selector, XPath, and DOM position</li>
                  <li>🎨 <strong>Computed Styles</strong> - Colors, fonts, dimensions, spacing</li>
                  <li>📍 <strong>Context</strong> - Page URL, viewport size, browser info</li>
                  <li>🔍 <strong>Element Tree</strong> - Parent and child elements hierarchy</li>
                </ul>
              </div>

              <div className="tip-box">
                <strong>💡 Pro Tip:</strong> Use this for reporting UI bugs like misaligned elements, wrong colors, missing images, or layout issues. The captured data is perfect for bug reports!
              </div>

              <div className="warning-box">
                <strong>⚠️ Note:</strong> After capturing, you can add annotations and submit directly to GitHub if configured. All data is session-only (ephemeral).
              </div>
            </div>
          </section>

          {/* Step 6: Key Features */}
          <section className="tutorial-step">
            <div className="step-number">6</div>
            <div className="step-content">
              <h2>⚡ Key Features</h2>
              <p className="step-description">
                Quick overview of what makes Mosqit powerful.
              </p>

              <div className="features-grid">
                <div className="feature-card">
                  <div className="feature-icon">🎯</div>
                  <h3>Smart Capture</h3>
                  <p>Automatically captures console.error(), console.warn(), and uncaught exceptions</p>
                </div>

                <div className="feature-card">
                  <div className="feature-icon">✨</div>
                  <h3>AI Analysis</h3>
                  <p>Chrome&apos;s Gemini Nano analyzes errors and suggests fixes instantly</p>
                </div>

                <div className="feature-card">
                  <div className="feature-icon">🔍</div>
                  <h3>Pattern Detection</h3>
                  <p>Identifies recurring errors and common patterns</p>
                </div>

                <div className="feature-card">
                  <div className="feature-icon">⚡</div>
                  <h3>Zero Persistence</h3>
                  <p>Ephemeral like native console - no data left behind</p>
                </div>

                <div className="feature-card">
                  <div className="feature-icon">🎨</div>
                  <h3>Visual Inspector</h3>
                  <p>Click any element to capture screenshots and context</p>
                </div>

                <div className="feature-card">
                  <div className="feature-icon">🔒</div>
                  <h3>Privacy First</h3>
                  <p>All processing happens locally - nothing sent to servers</p>
                </div>
              </div>
            </div>
          </section>

          {/* Step 6: Tips */}
          <section className="tutorial-step">
            <div className="step-number">6</div>
            <div className="step-content">
              <h2>💡 Pro Tips</h2>
              <p className="step-description">
                Get the most out of Mosqit with these tips.
              </p>

              <div className="tips-list">
                <div className="tip-item">
                  <strong>🎯 Filter by Level:</strong> Click error/warn/info buttons to filter logs
                </div>
                <div className="tip-item">
                  <strong>🔍 Search:</strong> Use the search bar to find specific errors quickly
                </div>
                <div className="tip-item">
                  <strong>📋 Copy Issues:</strong> Click any log to copy formatted error details
                </div>
                <div className="tip-item">
                  <strong>🧹 Clear Logs:</strong> Hit the clear button to start fresh (just like native console)
                </div>
                <div className="tip-item">
                  <strong>⚙️ Debug Mode:</strong> Set <code>DEBUG = true</code> in source files to see internal logs
                </div>
              </div>
            </div>
          </section>

          {/* Quick Reference */}
          <section className="quick-reference">
            <h2>📚 Quick Reference</h2>
            <div className="reference-grid">
              <div className="reference-card">
                <h3>Keyboard Shortcuts</h3>
                <ul>
                  <li><kbd>F12</kbd> - Open DevTools</li>
                  <li><kbd>Ctrl/Cmd + K</kbd> - Clear console</li>
                  <li><kbd>Ctrl/Cmd + F</kbd> - Search logs</li>
                </ul>
              </div>

              <div className="reference-card">
                <h3>Panel Controls</h3>
                <ul>
                  <li><strong>🗑️ Clear</strong> - Clear all logs</li>
                  <li><strong>🔄 Filters</strong> - Toggle log levels</li>
                  <li><strong>🔍 Search</strong> - Find specific errors</li>
                </ul>
              </div>

              <div className="reference-card">
                <h3>Need Help?</h3>
                <ul>
                  <li><a href="https://github.com/yourusername/mosqit" target="_blank">📖 Full Documentation</a></li>
                  <li><a href="https://github.com/yourusername/mosqit/issues" target="_blank">🐛 Report Issues</a></li>
                  <li><Link href="/">🏠 Back to Home</Link></li>
                </ul>
              </div>
            </div>
          </section>

          {/* Footer CTA */}
          <section className="tutorial-footer">
            <h2>🎉 You&apos;re All Set!</h2>
            <p>Start debugging smarter with AI-powered insights.</p>
            <div className="footer-actions">
              <Link href="/" className="btn btn-primary">
                Go to Homepage
              </Link>
              <a href="https://github.com/yourusername/mosqit" target="_blank" className="btn btn-secondary">
                View on GitHub
              </a>
            </div>
          </section>

        </div>
      </main>

      <style jsx>{`
        /* Reset and Base */
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        .tutorial-page {
          min-height: 100vh;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: #2d3748;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
        }

        /* Header */
        .tutorial-header {
          background: rgba(255, 255, 255, 0.95);
          border-radius: 20px;
          padding: 40px;
          margin-bottom: 30px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
          text-align: center;
        }

        .back-link {
          display: inline-block;
          color: #667eea;
          text-decoration: none;
          font-size: 14px;
          font-weight: 600;
          margin-bottom: 15px;
          transition: color 0.2s;
        }

        .back-link:hover {
          color: #5a67d8;
        }

        .tutorial-header h1 {
          font-size: 2.5rem;
          font-weight: 700;
          margin-bottom: 10px;
          color: #2d3748;
        }

        .subtitle {
          font-size: 1.2rem;
          color: #718096;
        }

        /* Main Content */
        .tutorial-content {
          padding: 0;
        }

        /* Tutorial Steps */
        .tutorial-step {
          background: rgba(255, 255, 255, 0.95);
          border-radius: 20px;
          padding: 40px;
          margin-bottom: 30px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
          animation: fadeIn 0.6s ease-in;
          display: flex;
          gap: 30px;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .step-number {
          flex-shrink: 0;
          width: 60px;
          height: 60px;
          background: linear-gradient(135deg, #667eea, #764ba2);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 28px;
          font-weight: 800;
          color: white;
          box-shadow: 0 10px 30px rgba(102, 126, 234, 0.4);
        }

        .step-content {
          flex: 1;
        }

        .step-content h2 {
          font-size: 32px;
          font-weight: 700;
          margin-bottom: 12px;
          color: #2d3748;
        }

        .step-description {
          font-size: 18px;
          color: #718096;
          margin-bottom: 30px;
          line-height: 1.6;
        }

        /* Instruction Box */
        .instruction-box {
          background: #f7fafc;
          border: 2px solid #e2e8f0;
          border-radius: 12px;
          padding: 25px;
          margin-bottom: 20px;
        }

        .instruction-box h3 {
          font-size: 20px;
          font-weight: 600;
          margin-bottom: 15px;
          color: #2d3748;
        }

        .instruction-box ol,
        .instruction-box ul {
          margin-left: 20px;
        }

        .instruction-box li {
          font-size: 16px;
          line-height: 1.8;
          color: #2d3748;
          margin-bottom: 10px;
        }

        .instruction-box code {
          background: #e2e8f0;
          padding: 3px 8px;
          border-radius: 4px;
          font-family: 'Monaco', 'Courier New', monospace;
          font-size: 14px;
          color: #667eea;
        }

        .instruction-box strong {
          color: #667eea;
          font-weight: 600;
        }

        /* Code Box */
        .code-box {
          background: #2d3748;
          border: 2px solid #4a5568;
          border-radius: 12px;
          padding: 20px;
          margin-bottom: 20px;
          position: relative;
        }

        .code-box h4 {
          font-size: 16px;
          font-weight: 600;
          margin-bottom: 12px;
          color: #e2e8f0;
        }

        .code-box pre {
          margin: 0;
          overflow-x: auto;
        }

        .code-box code {
          font-family: 'Monaco', 'Courier New', monospace;
          font-size: 14px;
          line-height: 1.6;
          color: #e2e8f0;
          display: block;
        }

        .copy-btn {
          position: absolute;
          top: 15px;
          right: 15px;
          background: #667eea;
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 6px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
        }

        .copy-btn:hover {
          background: #5a67d8;
          transform: translateY(-2px);
        }

        /* Tip Box */
        .tip-box {
          background: #f0fff4;
          border: 2px solid #22c55e;
          border-radius: 12px;
          padding: 18px 22px;
          margin-bottom: 20px;
        }

        .tip-box strong {
          color: #16a34a;
          font-weight: 600;
        }

        /* Warning Box */
        .warning-box {
          background: #fffbeb;
          border: 2px solid #fbbf24;
          border-radius: 12px;
          padding: 18px 22px;
          margin-bottom: 20px;
        }

        .warning-box strong {
          color: #d97706;
          font-weight: 600;
        }

        /* Features Grid */
        .features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 20px;
          margin-top: 25px;
        }

        .feature-card {
          background: white;
          border: 2px solid #e2e8f0;
          border-radius: 15px;
          padding: 25px;
          transition: all 0.3s;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
        }

        .feature-card:hover {
          border-color: #667eea;
          transform: translateY(-5px);
          box-shadow: 0 15px 40px rgba(102, 126, 234, 0.2);
        }

        .feature-icon {
          font-size: 40px;
          margin-bottom: 15px;
        }

        .feature-card h3 {
          font-size: 18px;
          font-weight: 600;
          margin-bottom: 10px;
          color: #2d3748;
        }

        .feature-card p {
          font-size: 14px;
          color: #718096;
          line-height: 1.6;
        }

        /* Tips List */
        .tips-list {
          display: flex;
          flex-direction: column;
          gap: 15px;
          margin-top: 25px;
        }

        .tip-item {
          background: #f7fafc;
          border-left: 4px solid #667eea;
          padding: 18px 22px;
          border-radius: 8px;
          font-size: 16px;
          color: #2d3748;
          line-height: 1.6;
        }

        .tip-item strong {
          color: #667eea;
          font-weight: 600;
        }

        .tip-item code {
          background: #e2e8f0;
          padding: 2px 6px;
          border-radius: 4px;
          font-family: 'Monaco', monospace;
          font-size: 13px;
          color: #667eea;
        }

        /* Quick Reference */
        .quick-reference {
          background: rgba(255, 255, 255, 0.95);
          border: 2px solid #667eea;
          border-radius: 20px;
          padding: 40px;
          margin-bottom: 30px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
        }

        .quick-reference h2 {
          font-size: 32px;
          font-weight: 700;
          margin-bottom: 30px;
          text-align: center;
          color: #2d3748;
        }

        .reference-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 25px;
        }

        .reference-card {
          background: #f7fafc;
          border-radius: 12px;
          padding: 25px;
        }

        .reference-card h3 {
          font-size: 20px;
          font-weight: 600;
          margin-bottom: 15px;
          color: #2d3748;
        }

        .reference-card ul {
          list-style: none;
        }

        .reference-card li {
          font-size: 15px;
          color: #718096;
          margin-bottom: 10px;
          line-height: 1.6;
        }

        .reference-card a {
          color: #667eea;
          text-decoration: none;
          transition: color 0.2s;
          font-weight: 600;
        }

        .reference-card a:hover {
          color: #5a67d8;
          text-decoration: underline;
        }

        .reference-card kbd {
          background: #e2e8f0;
          padding: 4px 8px;
          border-radius: 4px;
          font-family: 'Monaco', monospace;
          font-size: 13px;
          color: #2d3748;
          border: 1px solid #cbd5e1;
        }

        /* Footer */
        .tutorial-footer {
          background: rgba(255, 255, 255, 0.95);
          border-radius: 20px;
          padding: 60px 40px;
          margin-bottom: 30px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
          text-align: center;
        }

        .tutorial-footer h2 {
          font-size: 36px;
          font-weight: 700;
          margin-bottom: 15px;
          color: #2d3748;
        }

        .tutorial-footer p {
          font-size: 18px;
          color: #718096;
          margin-bottom: 30px;
        }

        .footer-actions {
          display: flex;
          gap: 20px;
          justify-content: center;
          flex-wrap: wrap;
        }

        .btn {
          display: inline-block;
          padding: 15px 30px;
          border-radius: 30px;
          font-size: 1.1rem;
          font-weight: 600;
          text-decoration: none;
          transition: all 0.3s;
          cursor: pointer;
          border: none;
        }

        .btn-primary {
          background: #667eea;
          color: white;
          box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
        }

        .btn-primary:hover {
          background: #5a67d8;
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(102, 126, 234, 0.5);
        }

        .btn-secondary {
          background: white;
          color: #667eea;
          border: 2px solid #667eea;
        }

        .btn-secondary:hover {
          background: #667eea;
          color: white;
          transform: translateY(-2px);
        }

        /* Responsive */
        @media (max-width: 768px) {
          .tutorial-header h1 {
            font-size: 32px;
          }

          .subtitle {
            font-size: 16px;
          }

          .tutorial-step {
            flex-direction: column;
            gap: 20px;
          }

          .step-number {
            width: 50px;
            height: 50px;
            font-size: 24px;
          }

          .step-content h2 {
            font-size: 26px;
          }

          .features-grid,
          .reference-grid {
            grid-template-columns: 1fr;
          }

          .footer-actions {
            flex-direction: column;
            align-items: stretch;
          }

          .btn {
            width: 100%;
            text-align: center;
          }
        }
      `}</style>
    </div>
  );
}
