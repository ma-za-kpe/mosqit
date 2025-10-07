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
          background: linear-gradient(180deg, #0a0e27 0%, #1a1f3a 100%);
          color: #ffffff;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        .container {
          max-width: 900px;
          margin: 0 auto;
          padding: 0 20px;
        }

        /* Header */
        .tutorial-header {
          background: rgba(15, 20, 45, 0.95);
          border-bottom: 2px solid #3b82f6;
          padding: 30px 0;
          position: sticky;
          top: 0;
          z-index: 100;
          backdrop-filter: blur(10px);
        }

        .back-link {
          display: inline-block;
          color: #60a5fa;
          text-decoration: none;
          font-size: 14px;
          margin-bottom: 15px;
          transition: color 0.2s;
        }

        .back-link:hover {
          color: #93c5fd;
        }

        .tutorial-header h1 {
          font-size: 42px;
          font-weight: 800;
          margin-bottom: 8px;
          background: linear-gradient(135deg, #60a5fa 0%, #a78bfa 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .subtitle {
          font-size: 18px;
          color: #cbd5e1;
        }

        /* Main Content */
        .tutorial-content {
          padding: 60px 0;
        }

        /* Tutorial Steps */
        .tutorial-step {
          display: flex;
          gap: 30px;
          margin-bottom: 80px;
          animation: fadeIn 0.6s ease-in;
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
          background: linear-gradient(135deg, #3b82f6, #2563eb);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 28px;
          font-weight: 800;
          color: white;
          box-shadow: 0 10px 30px rgba(59, 130, 246, 0.4);
        }

        .step-content {
          flex: 1;
        }

        .step-content h2 {
          font-size: 32px;
          font-weight: 700;
          margin-bottom: 12px;
          color: #f1f5f9;
        }

        .step-description {
          font-size: 18px;
          color: #cbd5e1;
          margin-bottom: 30px;
          line-height: 1.6;
        }

        /* Instruction Box */
        .instruction-box {
          background: rgba(30, 41, 59, 0.6);
          border: 2px solid #334155;
          border-radius: 12px;
          padding: 25px;
          margin-bottom: 20px;
        }

        .instruction-box h3 {
          font-size: 20px;
          font-weight: 600;
          margin-bottom: 15px;
          color: #60a5fa;
        }

        .instruction-box ol,
        .instruction-box ul {
          margin-left: 20px;
        }

        .instruction-box li {
          font-size: 16px;
          line-height: 1.8;
          color: #e2e8f0;
          margin-bottom: 10px;
        }

        .instruction-box code {
          background: #1e293b;
          padding: 3px 8px;
          border-radius: 4px;
          font-family: 'Monaco', 'Courier New', monospace;
          font-size: 14px;
          color: #fbbf24;
        }

        .instruction-box strong {
          color: #60a5fa;
          font-weight: 600;
        }

        /* Code Box */
        .code-box {
          background: #0f172a;
          border: 2px solid #1e293b;
          border-radius: 12px;
          padding: 20px;
          margin-bottom: 20px;
          position: relative;
        }

        .code-box h4 {
          font-size: 16px;
          font-weight: 600;
          margin-bottom: 12px;
          color: #94a3b8;
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
          background: #3b82f6;
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 6px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .copy-btn:hover {
          background: #2563eb;
          transform: translateY(-2px);
        }

        /* Tip Box */
        .tip-box {
          background: rgba(34, 197, 94, 0.1);
          border: 2px solid #22c55e;
          border-radius: 12px;
          padding: 18px 22px;
          margin-bottom: 20px;
        }

        .tip-box strong {
          color: #22c55e;
          font-weight: 600;
        }

        /* Warning Box */
        .warning-box {
          background: rgba(251, 191, 36, 0.1);
          border: 2px solid #fbbf24;
          border-radius: 12px;
          padding: 18px 22px;
          margin-bottom: 20px;
        }

        .warning-box strong {
          color: #fbbf24;
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
          background: rgba(30, 41, 59, 0.6);
          border: 2px solid #334155;
          border-radius: 12px;
          padding: 25px;
          transition: all 0.3s;
        }

        .feature-card:hover {
          border-color: #3b82f6;
          transform: translateY(-5px);
          box-shadow: 0 10px 30px rgba(59, 130, 246, 0.2);
        }

        .feature-icon {
          font-size: 40px;
          margin-bottom: 15px;
        }

        .feature-card h3 {
          font-size: 18px;
          font-weight: 600;
          margin-bottom: 10px;
          color: #f1f5f9;
        }

        .feature-card p {
          font-size: 14px;
          color: #cbd5e1;
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
          background: rgba(30, 41, 59, 0.6);
          border-left: 4px solid #3b82f6;
          padding: 18px 22px;
          border-radius: 8px;
          font-size: 16px;
          color: #e2e8f0;
          line-height: 1.6;
        }

        .tip-item strong {
          color: #60a5fa;
          font-weight: 600;
        }

        .tip-item code {
          background: #1e293b;
          padding: 2px 6px;
          border-radius: 4px;
          font-family: 'Monaco', monospace;
          font-size: 13px;
          color: #fbbf24;
        }

        /* Quick Reference */
        .quick-reference {
          background: rgba(15, 20, 45, 0.8);
          border: 2px solid #3b82f6;
          border-radius: 16px;
          padding: 40px;
          margin-bottom: 60px;
        }

        .quick-reference h2 {
          font-size: 32px;
          font-weight: 700;
          margin-bottom: 30px;
          text-align: center;
          color: #f1f5f9;
        }

        .reference-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 25px;
        }

        .reference-card {
          background: rgba(30, 41, 59, 0.6);
          border-radius: 12px;
          padding: 25px;
        }

        .reference-card h3 {
          font-size: 20px;
          font-weight: 600;
          margin-bottom: 15px;
          color: #60a5fa;
        }

        .reference-card ul {
          list-style: none;
        }

        .reference-card li {
          font-size: 15px;
          color: #cbd5e1;
          margin-bottom: 10px;
          line-height: 1.6;
        }

        .reference-card a {
          color: #60a5fa;
          text-decoration: none;
          transition: color 0.2s;
        }

        .reference-card a:hover {
          color: #93c5fd;
          text-decoration: underline;
        }

        .reference-card kbd {
          background: #1e293b;
          padding: 4px 8px;
          border-radius: 4px;
          font-family: 'Monaco', monospace;
          font-size: 13px;
          color: #fbbf24;
          border: 1px solid #334155;
        }

        /* Footer */
        .tutorial-footer {
          text-align: center;
          padding: 60px 0;
        }

        .tutorial-footer h2 {
          font-size: 36px;
          font-weight: 700;
          margin-bottom: 15px;
          color: #f1f5f9;
        }

        .tutorial-footer p {
          font-size: 18px;
          color: #cbd5e1;
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
          padding: 14px 32px;
          border-radius: 8px;
          font-size: 16px;
          font-weight: 600;
          text-decoration: none;
          transition: all 0.3s;
          cursor: pointer;
        }

        .btn-primary {
          background: linear-gradient(135deg, #3b82f6, #2563eb);
          color: white;
          box-shadow: 0 10px 30px rgba(59, 130, 246, 0.3);
        }

        .btn-primary:hover {
          transform: translateY(-3px);
          box-shadow: 0 15px 40px rgba(59, 130, 246, 0.4);
        }

        .btn-secondary {
          background: rgba(30, 41, 59, 0.8);
          color: #60a5fa;
          border: 2px solid #3b82f6;
        }

        .btn-secondary:hover {
          background: rgba(59, 130, 246, 0.2);
          transform: translateY(-3px);
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
