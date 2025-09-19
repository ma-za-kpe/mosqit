'use client';

import Link from 'next/link';

export default function Tutorial() {
  return (
    <>
      <style jsx>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        .tutorial-container {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          min-height: 100vh;
          padding: 20px;
        }
        .tutorial-content {
          max-width: 900px;
          margin: 0 auto;
        }
        .back-link {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          color: white;
          text-decoration: none;
          padding: 10px 20px;
          background: rgba(255, 255, 255, 0.2);
          border-radius: 25px;
          margin-bottom: 20px;
          transition: background 0.3s;
        }
        .back-link:hover {
          background: rgba(255, 255, 255, 0.3);
        }
        .tutorial-card {
          background: rgba(255, 255, 255, 0.98);
          border-radius: 20px;
          padding: 40px;
          margin-bottom: 30px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
        }
        .tutorial-header {
          text-align: center;
          margin-bottom: 40px;
        }
        .logo {
          font-size: 3rem;
          margin-bottom: 20px;
        }
        h1 {
          color: #2d3748;
          font-size: 2rem;
          margin-bottom: 10px;
        }
        .subtitle {
          color: #718096;
          font-size: 1.1rem;
        }
        h2 {
          color: #1a202c;
          margin-top: 30px;
          margin-bottom: 20px;
          font-size: 1.5rem;
          display: flex;
          align-items: center;
          gap: 10px;
          font-weight: 700;
        }
        h3 {
          color: #2d3748;
          margin-top: 25px;
          margin-bottom: 15px;
          font-size: 1.2rem;
          font-weight: 600;
        }
        .step {
          background: #f7fafc;
          padding: 20px;
          border-left: 4px solid #667eea;
          border-radius: 8px;
          margin: 20px 0;
        }
        .step strong {
          color: #1a202c;
          font-size: 1.1rem;
          font-weight: 700;
        }
        .step-number {
          display: inline-block;
          background: #667eea;
          color: white;
          width: 30px;
          height: 30px;
          border-radius: 50%;
          text-align: center;
          line-height: 30px;
          font-weight: bold;
          margin-right: 15px;
        }
        .code-block {
          background: #2d3748;
          color: #e2e8f0;
          padding: 15px;
          border-radius: 8px;
          margin: 15px 0;
          font-family: 'Courier New', monospace;
          overflow-x: auto;
        }
        .button-demo {
          display: inline-block;
          padding: 10px 20px;
          margin: 10px 5px;
          background: #667eea;
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          text-decoration: none;
          font-weight: 600;
          transition: background 0.3s;
        }
        .button-demo:hover {
          background: #5a67d8;
        }
        .test-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 20px;
          margin: 20px 0;
        }
        .test-card {
          background: white;
          padding: 20px;
          border-radius: 12px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
          border: 1px solid #e2e8f0;
        }
        .test-card h4 {
          color: #1a202c;
          margin-bottom: 10px;
          font-size: 1.1rem;
          font-weight: 600;
        }
        .test-card p {
          color: #4a5568;
          font-size: 0.95rem;
          line-height: 1.5;
        }
        .warning-box {
          background: #fffbeb;
          border: 2px solid #fbbf24;
          border-radius: 8px;
          padding: 15px;
          margin: 20px 0;
          color: #92400e;
        }
        .success-box {
          background: #f0fdf4;
          border: 2px solid #22c55e;
          border-radius: 8px;
          padding: 15px;
          margin: 20px 0;
          color: #166534;
        }
        .info-box {
          background: #eff6ff;
          border: 2px solid #60a5fa;
          border-radius: 8px;
          padding: 15px;
          margin: 20px 0;
          color: #1e40af;
        }
        ul {
          padding-left: 25px;
          line-height: 1.8;
          color: #2d3748;
        }
        li {
          margin: 8px 0;
          color: #2d3748;
        }
        p {
          color: #2d3748;
          line-height: 1.6;
        }
        strong {
          color: #1a202c;
          font-weight: 700;
        }
        code {
          background: #e2e8f0;
          padding: 2px 6px;
          border-radius: 4px;
          font-family: 'Courier New', monospace;
          font-size: 0.9em;
          color: #2d3748;
        }
        .feature-badge {
          display: inline-block;
          background: #667eea;
          color: white;
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 0.85rem;
          margin: 5px;
        }

        @media (max-width: 768px) {
          .tutorial-card {
            padding: 25px;
          }
          h1 {
            font-size: 1.5rem;
          }
          h2 {
            font-size: 1.3rem;
          }
          .test-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <div className="tutorial-container">
        <div className="tutorial-content">
          <Link href="/" className="back-link">
            ← Back to Home
          </Link>

          <div className="tutorial-card">
            <div className="tutorial-header">
              <div className="logo">🦟</div>
              <h1>Mosqit Test Suite Tutorial</h1>
              <p className="subtitle">Learn how to test AI-powered debugging features and generate bug reports</p>
            </div>

            <h2>🎯 Overview</h2>
            <p>The Mosqit Test Suite allows you to experience all the AI-powered debugging features without installing the full extension. Test real-time error analysis, pattern detection, and bug report generation using Chrome&apos;s built-in AI APIs.</p>

            <div className="info-box">
              <strong>ℹ️ Note:</strong> The bug reports you see are dynamically generated by Chrome&apos;s Writer API based on the actual errors you trigger. This isn&apos;t dummy data - it&apos;s real AI analysis!
            </div>

            <h2>🚀 Getting Started</h2>

            <div className="step">
              <span className="step-number">1</span>
              <strong>Prerequisites</strong>
              <p>Before testing, ensure you have:</p>
              <ul>
                <li>Chrome 127 or higher (check via <code>chrome://version</code>)</li>
                <li>Enabled Chrome AI flags (see below)</li>
                <li>~2GB free space for Gemini Nano model download</li>
              </ul>
            </div>

            <div className="step">
              <span className="step-number">2</span>
              <strong>Enable Chrome AI Features</strong>
              <p>Navigate to <code>chrome://flags</code> and enable these flags:</p>
              <ul>
                <li><code>Prompt API for Gemini Nano</code> - For complex analysis</li>
                <li><code>Writer API for WebUI</code> - For structured bug reports</li>
                <li><code>Summarization API for WebUI</code> - For pattern detection</li>
                <li><code>Optimization Guide On Device Model</code> - For model download</li>
              </ul>
              <div className="warning-box">
                ⚠️ After enabling flags, completely restart Chrome (quit from system tray)
              </div>
            </div>

            <div className="step">
              <span className="step-number">3</span>
              <strong>Access the Test Page</strong>
              <p>Open the test suite at: <a href="/test/test-logger.html" className="button-demo">🧪 Launch Test Suite</a></p>
            </div>

            <h2>📋 Test Categories</h2>

            <div className="test-grid">
              <div className="test-card">
                <h4>🔴 Error Types</h4>
                <p>Test various JavaScript errors: TypeError, ReferenceError, SyntaxError, RangeError, and custom errors.</p>
              </div>
              <div className="test-card">
                <h4>🎨 Framework Errors</h4>
                <p>Simulate React, Vue, Angular, and Next.js specific errors with framework detection.</p>
              </div>
              <div className="test-card">
                <h4>🔄 Async Operations</h4>
                <p>Test Promise rejections, async/await errors, and timeout scenarios.</p>
              </div>
              <div className="test-card">
                <h4>🌐 Network Issues</h4>
                <p>Simulate API failures, CORS errors, and network timeouts.</p>
              </div>
              <div className="test-card">
                <h4>🎯 DOM Errors</h4>
                <p>Test null element access, event handler errors, and DOM manipulation issues.</p>
              </div>
              <div className="test-card">
                <h4>📊 Performance</h4>
                <p>Monitor memory leaks, infinite loops, and performance bottlenecks.</p>
              </div>
            </div>

            <h2>🧪 How to Use Each Test</h2>

            <h3>1. Basic Error Testing</h3>
            <div className="code-block">
              {`// Click any error button to trigger
[Test TypeError] → Triggers: Cannot read property 'name' of null
[Test ReferenceError] → Triggers: undefinedVariable is not defined`}
            </div>
            <p>Each error will show:</p>
            <ul>
              <li>🔍 <strong>Root Cause Analysis</strong> - AI identifies why the error occurred</li>
              <li>💡 <strong>Fix Suggestions</strong> - Specific code fixes you can apply</li>
              <li>📝 <strong>Best Practices</strong> - How to prevent similar issues</li>
            </ul>

            <h3>2. Pattern Detection Testing</h3>
            <div className="code-block">
              {`// Trigger the same error 3+ times
Click [Test Recurring Error] × 3
// Mosqit will detect: "🔄 Recurring error (3x) at test.js:42"`}
            </div>
            <p>Pattern detection identifies:</p>
            <ul>
              <li>Recurring errors at the same location</li>
              <li>Similar error patterns across different files</li>
              <li>Systemic issues that need architectural fixes</li>
            </ul>

            <h3>3. AI Analysis Testing</h3>
            <div className="step">
              <strong>Writer API Features:</strong>
              <ul>
                <li>Click <code>[Test Writer API]</code> to generate structured bug reports</li>
                <li>Reports include: ID, severity, steps to reproduce, and fix suggestions</li>
                <li>Each report is uniquely generated based on the actual error context</li>
              </ul>
            </div>

            <div className="step">
              <strong>Prompt API Features:</strong>
              <ul>
                <li>Click <code>[Test Prompt API]</code> for detailed explanations</li>
                <li>Get comprehensive analysis of complex errors</li>
                <li>Receive context-aware debugging strategies</li>
              </ul>
            </div>

            <div className="step">
              <strong>Summarizer API Features:</strong>
              <ul>
                <li>Click <code>[Test Summarizer API]</code> after triggering multiple errors</li>
                <li>Get a summary of all recent errors and patterns</li>
                <li>Identify common issues across your debugging session</li>
              </ul>
            </div>

            <h2>📊 Understanding the Output</h2>

            <h3>Bug Report Structure</h3>
            <div className="code-block">
              {`## Bug Report
Report ID: BUG-[timestamp]-[hash]    // Unique identifier
Component: [Detected component]      // Where error occurred
Severity: [High/Medium/Low]         // AI-assessed impact
Priority: [Urgent/Normal/Low]       // Suggested fix priority

Summary: [One-line description]
Description: [Detailed analysis]
Steps to Reproduce: [1, 2, 3...]
Recommended Fix: [Code solution]`}
            </div>

            <div className="success-box">
              ✅ <strong>Pro Tip:</strong> The bug reports are generated in real-time by the Writer API. Each report is unique and based on the actual error context, not pre-written templates!
            </div>

            <h2>🎯 Advanced Testing</h2>

            <h3>Stress Testing</h3>
            <ol>
              <li>Click <code>[Run All Tests]</code> to trigger 50+ test scenarios</li>
              <li>Monitor the AI&apos;s response time (should be &lt;100ms)</li>
              <li>Check pattern detection across multiple errors</li>
              <li>Verify fallback mechanisms when AI is unavailable</li>
            </ol>

            <h3>Framework-Specific Testing</h3>
            <div className="test-grid">
              <div className="test-card">
                <h4>⚛️ React</h4>
                <p>Test hooks errors, state updates, and lifecycle issues</p>
              </div>
              <div className="test-card">
                <h4>💚 Vue</h4>
                <p>Test reactivity problems and computed property errors</p>
              </div>
              <div className="test-card">
                <h4>🔺 Angular</h4>
                <p>Test dependency injection and zone.js errors</p>
              </div>
              <div className="test-card">
                <h4>▲ Next.js</h4>
                <p>Test SSR/hydration mismatches and API routes</p>
              </div>
            </div>

            <h2>🔧 Troubleshooting</h2>

            <div className="warning-box">
              <strong>AI Not Working?</strong>
              <ul>
                <li>Ensure all Chrome flags are enabled</li>
                <li>Wait for Gemini Nano download (~2GB)</li>
                <li>Check GPU availability in <code>chrome://gpu</code></li>
                <li>Try fallback patterns if AI is unavailable</li>
              </ul>
            </div>

            <h2>🚀 Next Steps</h2>
            <ol>
              <li>Complete all test scenarios to understand Mosqit&apos;s capabilities</li>
              <li>Try the <a href="https://github.com/ma-za-kpe/mosqit" target="_blank" rel="noopener noreferrer">full extension</a> for production use</li>
              <li>Report issues or suggest features on <a href="https://github.com/ma-za-kpe/mosqit/issues" target="_blank" rel="noopener noreferrer">GitHub</a></li>
              <li>Join the <a href="https://goo.gle/chrome-ai-dev-preview-gdc-discord" target="_blank" rel="noopener noreferrer">Chrome AI Discord</a> community</li>
            </ol>

            <div className="success-box">
              🎉 <strong>Ready to test?</strong> <a href="/test/test-logger.html" className="button-demo">Launch Test Suite →</a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}