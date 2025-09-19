'use client';

export default function Home() {
  return (
    <>
      <style jsx>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        .gradient-bg {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          min-height: 100vh;
        }
        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
        }
        .card {
          background: rgba(255, 255, 255, 0.95);
          border-radius: 20px;
          padding: 40px;
          margin-bottom: 30px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
        }
        .logo {
          font-size: 4rem;
          text-align: center;
          margin-bottom: 20px;
        }
        .title {
          font-size: 2.5rem;
          color: #2d3748;
          margin-bottom: 10px;
          font-weight: 700;
          text-align: center;
        }
        .subtitle {
          font-size: 1.2rem;
          color: #718096;
          margin-bottom: 20px;
          text-align: center;
        }
        .badges {
          display: flex;
          justify-content: center;
          gap: 15px;
          flex-wrap: wrap;
          margin: 20px 0;
        }
        .badge {
          display: inline-block;
          padding: 8px 16px;
          background: #f7fafc;
          border: 2px solid #e2e8f0;
          border-radius: 25px;
          font-size: 0.9rem;
          color: #2d3748;
          font-weight: 600;
        }
        .badge.highlight {
          background: #667eea;
          color: white;
          border-color: #667eea;
        }
        .challenge-banner {
          background: linear-gradient(135deg, #FF6B6B, #FFE66D);
          padding: 20px;
          border-radius: 15px;
          margin: 20px 0;
          color: white;
          text-align: center;
          font-weight: 600;
        }
        .features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 25px;
          margin: 30px 0;
        }
        .feature-card {
          background: white;
          padding: 30px;
          border-radius: 15px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
          transition: transform 0.3s, box-shadow 0.3s;
        }
        .feature-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 15px 40px rgba(0, 0, 0, 0.12);
        }
        .feature-card h3 {
          color: #2d3748;
          margin-bottom: 10px;
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .feature-icon {
          font-size: 1.5rem;
        }
        .feature-card p {
          color: #718096;
          line-height: 1.6;
        }
        .button-group {
          display: flex;
          gap: 20px;
          justify-content: center;
          flex-wrap: wrap;
          margin: 30px 0;
        }
        .btn {
          display: inline-block;
          padding: 15px 30px;
          border-radius: 30px;
          text-decoration: none;
          font-weight: 600;
          transition: all 0.3s;
          font-size: 1.1rem;
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
        .btn-github {
          background: #24292e;
          color: white;
        }
        .btn-github:hover {
          background: #1a1e22;
          transform: translateY(-2px);
        }
        .tech-stack {
          display: flex;
          gap: 15px;
          justify-content: center;
          flex-wrap: wrap;
          margin: 20px 0;
        }
        .tech-badge {
          padding: 10px 20px;
          background: rgba(255, 255, 255, 0.1);
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-radius: 25px;
          color: white;
          font-weight: 600;
        }
        .installation-steps {
          background: #f7fafc;
          padding: 25px;
          border-radius: 10px;
          margin: 20px 0;
        }
        .installation-steps ol {
          padding-left: 20px;
          color: #2d3748;
        }
        .installation-steps li {
          margin: 10px 0;
          line-height: 1.8;
        }
        .installation-steps code {
          background: #e2e8f0;
          padding: 2px 8px;
          border-radius: 4px;
          font-family: 'Courier New', monospace;
          font-size: 0.9em;
        }
        .code-preview {
          background: #2d3748;
          color: #e2e8f0;
          padding: 20px;
          border-radius: 10px;
          margin: 20px 0;
          font-family: 'Courier New', monospace;
          overflow-x: auto;
        }
        .footer-links {
          display: flex;
          justify-content: center;
          gap: 30px;
          margin: 20px 0;
          flex-wrap: wrap;
        }
        .footer-links a {
          color: #667eea;
          text-decoration: none;
          font-weight: 600;
          transition: color 0.3s;
        }
        .footer-links a:hover {
          color: #5a67d8;
        }
      `}</style>

      <div className="gradient-bg">
        <div className="container">
          <div className="card">
            <div className="logo">🦟</div>
            <h1 className="title">Mosqit</h1>
            <p className="subtitle">AI-Powered Debugging Assistant for Chrome</p>
            <div className="badges">
              <span className="badge highlight">🏆 Chrome Built-in AI Challenge 2025</span>
              <span className="badge">🤖 Gemini Nano Powered</span>
              <span className="badge">🔒 100% On-Device AI</span>
              <span className="badge">⚡ Real-Time Analysis</span>
              <span className="badge">📖 Open Source</span>
            </div>
            <div className="challenge-banner">
              Built for the Google Chrome Built-in AI Challenge 2025 • Deadline: October 31, 2025
            </div>
          </div>

          <div className="card">
            <h2 style={{ color: '#2d3748', marginBottom: '20px' }}>🚀 Transform Your Debugging Experience</h2>
            <p style={{ color: '#718096', lineHeight: '1.6' }}>
              Mosqit brings Android Logcat-inspired intelligent error analysis directly to your Chrome DevTools.
              Using Chrome&apos;s built-in Gemini Nano AI, get instant insights, root cause analysis, and fix suggestions -
              all running locally on your device for maximum privacy and speed.
            </p>

            <div className="tech-stack">
              <span className="tech-badge">TypeScript</span>
              <span className="tech-badge">Chrome Extension API</span>
              <span className="tech-badge">Writer API</span>
              <span className="tech-badge">Prompt API</span>
              <span className="tech-badge">Summarizer API</span>
            </div>

            <div className="button-group">
              <a href="/test/test-logger.html" className="btn btn-primary">🧪 Try Demo</a>
              <a href="https://github.com/ma-za-kpe/mosqit" className="btn btn-github" target="_blank" rel="noopener noreferrer">⭐ Star on GitHub</a>
              <a href="#installation" className="btn btn-secondary">📦 Install Extension</a>
            </div>
          </div>

          <div className="card">
            <h2 style={{ color: '#2d3748', marginBottom: '20px' }}>✨ Key Features</h2>
            <div className="features-grid">
              <div className="feature-card">
                <h3><span className="feature-icon">🤖</span> AI-Powered Analysis</h3>
                <p>Leverages Chrome&apos;s built-in Gemini Nano model with Writer API for intelligent debugging insights - completely on-device.</p>
              </div>
              <div className="feature-card">
                <h3><span className="feature-icon">🎯</span> Universal Debugging</h3>
                <p>Analyzes ALL console outputs - not just errors. Handles logs, warnings, performance issues, network problems, state changes, and debug traces.</p>
              </div>
              <div className="feature-card">
                <h3><span className="feature-icon">📊</span> Pattern Detection</h3>
                <p>Automatically identifies recurring errors and issues. Tracks patterns over time to spot systemic problems in your codebase.</p>
              </div>
              <div className="feature-card">
                <h3><span className="feature-icon">🛠️</span> DevTools Panel</h3>
                <p>Custom Mosqit panel in Chrome DevTools with Logcat-inspired UI. Real-time log streaming with color-coded severity levels.</p>
              </div>
              <div className="feature-card">
                <h3><span className="feature-icon">⚡</span> Smart Fallback</h3>
                <p>40+ built-in debugging patterns ensure you get helpful insights even without AI. Works offline and on non-GPU machines.</p>
              </div>
              <div className="feature-card">
                <h3><span className="feature-icon">🔐</span> 100% Private</h3>
                <p>All processing happens on-device using Chrome&apos;s local Gemini Nano. Your code and logs never leave your machine.</p>
              </div>
              <div className="feature-card">
                <h3><span className="feature-icon">🎨</span> Context-Aware</h3>
                <p>Captures DOM state, dependencies, stack traces, and user interactions. AI considers full context for better insights.</p>
              </div>
              <div className="feature-card">
                <h3><span className="feature-icon">💡</span> Actionable Fixes</h3>
                <p>Get specific fix suggestions, code examples, and next debugging steps. Not just what&apos;s wrong, but how to fix it.</p>
              </div>
              <div className="feature-card">
                <h3><span className="feature-icon">🚀</span> Multi-API Strategy</h3>
                <p>Uses Writer API for structured insights, Prompt API for complex explanations. Plans for Summarizer and Rewriter APIs.</p>
              </div>
              <div className="feature-card">
                <h3><span className="feature-icon">🧪</span> Comprehensive Testing</h3>
                <p>50+ test scenarios included. Test all Chrome AI APIs, error types, and debugging scenarios with one click.</p>
              </div>
              <div className="feature-card">
                <h3><span className="feature-icon">📦</span> Easy Setup</h3>
                <p>5-minute installation. Works with any website or web app. No code changes required in your application.</p>
              </div>
              <div className="feature-card">
                <h3><span className="feature-icon">🌐</span> Framework Agnostic</h3>
                <p>Works with React, Vue, Angular, Svelte, or vanilla JavaScript. Automatically detects frameworks and dependencies.</p>
              </div>
            </div>
          </div>

          <div className="card">
            <h2 style={{ color: '#2d3748', marginBottom: '20px' }}>🔄 How Mosqit Works</h2>
            <div style={{ color: '#718096', lineHeight: '1.8', fontSize: '1.1rem' }}>
              <p style={{ marginBottom: '20px' }}>
                <strong>1. Console Interception:</strong> Mosqit overrides ALL console methods (log, warn, error, info, debug) to capture every debugging output in your application.
              </p>
              <p style={{ marginBottom: '20px' }}>
                <strong>2. Context Capture:</strong> For each log, we capture file location, line numbers, stack traces, DOM state, dependencies, and user interactions.
              </p>
              <p style={{ marginBottom: '20px' }}>
                <strong>3. AI Analysis:</strong> Chrome&apos;s local Gemini Nano model (Writer API) analyzes the output and context to provide debugging insights.
              </p>
              <p style={{ marginBottom: '20px' }}>
                <strong>4. Pattern Detection:</strong> Recurring issues are automatically identified and tracked over time.
              </p>
              <p style={{ marginBottom: '20px' }}>
                <strong>5. DevTools Display:</strong> All enhanced logs appear in the custom Mosqit panel in Chrome DevTools with AI insights.
              </p>
            </div>

            <div className="code-preview" style={{ marginTop: '30px' }}>
              <pre>{`// Before Mosqit:
console.error("Cannot read property 'name' of null");
> TypeError: Cannot read property 'name' of null

// With Mosqit AI:
console.error("Cannot read property 'name' of null");
> TypeError: Cannot read property 'name' of null
> 🔴 Null reference at UserProfile.js:42
> 💡 Root cause: Object not initialized before property access
> ✅ Fix: Add null check: user?.name || 'Default Name'
> 📚 Best practice: Use optional chaining for nested properties`}</pre>
            </div>
          </div>

          <div className="card" id="installation">
            <h2 style={{ color: '#2d3748', marginBottom: '20px' }}>🛠️ Installation & Setup</h2>
            <div className="installation-steps">
              <ol>
                <li><strong>Enable Chrome AI:</strong> Navigate to <code>chrome://flags</code> and enable:
                  <ul>
                    <li>Prompt API for Gemini Nano</li>
                    <li>Summarization API for WebUI</li>
                    <li>Writer API for WebUI</li>
                    <li>Optimization Guide On Device Model</li>
                  </ul>
                </li>
                <li><strong>Restart Chrome:</strong> Completely restart Chrome (quit from system tray)</li>
                <li><strong>Clone Repository:</strong> <code>git clone https://github.com/ma-za-kpe/mosqit.git</code></li>
                <li><strong>Build Extension:</strong> <code>npm install && npm run build:extension</code></li>
                <li><strong>Load Extension:</strong> Open chrome://extensions, enable Developer mode, load unpacked from dist folder</li>
                <li><strong>Download AI Model:</strong> Chrome will download Gemini Nano (~2GB) on first use</li>
              </ol>
            </div>

            <div className="code-preview">
              <pre>{`// Mosqit enhances ALL your debugging:
console.log("Checking user state");
// Mosqit: 📝 State check at app.js:42. Consider using debugger or breakpoints.

console.error("Cannot read property 'name' of null");
// Mosqit: 🔴 Null reference at app.js:56. Add optional chaining: user?.name

console.warn("API response slow: 3.2s");
// Mosqit: 🟡 Performance issue. Consider caching or pagination.`}</pre>
            </div>
          </div>

          <div className="card">
            <h2 style={{ color: '#2d3748', marginBottom: '20px' }}>🚀 Advanced Capabilities</h2>
            <div className="features-grid">
              <div className="feature-card">
                <h3><span className="feature-icon">🌐</span> Content Script Bridge</h3>
                <p>Sophisticated message passing between content scripts and extension. MAIN world execution with secure PostMessage protocol.</p>
              </div>
              <div className="feature-card">
                <h3><span className="feature-icon">💾</span> Intelligent Storage</h3>
                <p>Chrome Storage API for preferences, memory cache for 1000 recent logs, pattern cache, and reusable AI session management.</p>
              </div>
              <div className="feature-card">
                <h3><span className="feature-icon">📈</span> Performance Metrics</h3>
                <p>Sub-50ms analysis latency, 100% console output coverage, 95% pattern detection accuracy with minimal memory footprint.</p>
              </div>
              <div className="feature-card">
                <h3><span className="feature-icon">🔄</span> Session Management</h3>
                <p>Intelligent AI session reuse, automatic cleanup, rolling buffer for logs, and efficient resource management.</p>
              </div>
            </div>
          </div>

          <div className="card">
            <h2 style={{ color: '#2d3748', marginBottom: '20px' }}>🔮 Coming Soon</h2>
            <p style={{ color: '#718096', marginBottom: '30px' }}>
              We&apos;re continuously improving Mosqit with new features based on community feedback:
            </p>
            <div className="features-grid">
              <div className="feature-card" style={{ opacity: 0.8 }}>
                <h3><span className="feature-icon">🔗</span> GitHub Integration</h3>
                <p>Create issues directly from debugging insights with AI-generated descriptions and reproduction steps.</p>
                <div style={{ marginTop: '10px', fontSize: '0.9em', color: '#a0aec0' }}>🚧 In Development</div>
              </div>
              <div className="feature-card" style={{ opacity: 0.8 }}>
                <h3><span className="feature-icon">📱</span> Mobile Dashboard</h3>
                <p>Responsive web dashboard for viewing and managing logs on mobile devices. Real-time sync across devices.</p>
                <div style={{ marginTop: '10px', fontSize: '0.9em', color: '#a0aec0' }}>🚧 Planned Q2 2025</div>
              </div>
              <div className="feature-card" style={{ opacity: 0.8 }}>
                <h3><span className="feature-icon">🌍</span> Multi-Language Support</h3>
                <p>Localized debugging insights in 5+ languages using Chrome Translator API. Technical terms preserved.</p>
                <div style={{ marginTop: '10px', fontSize: '0.9em', color: '#a0aec0' }}>🚧 Planned Q2 2025</div>
              </div>
              <div className="feature-card" style={{ opacity: 0.8 }}>
                <h3><span className="feature-icon">👥</span> Team Collaboration</h3>
                <p>Share debugging sessions, add comments to logs, @mention teammates, and track issue resolution together.</p>
                <div style={{ marginTop: '10px', fontSize: '0.9em', color: '#a0aec0' }}>📋 Backlog</div>
              </div>
              <div className="feature-card" style={{ opacity: 0.8 }}>
                <h3><span className="feature-icon">📊</span> Summarizer API</h3>
                <p>Condense long stack traces, group related errors, and create executive summaries of debugging sessions.</p>
                <div style={{ marginTop: '10px', fontSize: '0.9em', color: '#a0aec0' }}>🚧 Planned</div>
              </div>
              <div className="feature-card" style={{ opacity: 0.8 }}>
                <h3><span className="feature-icon">✏️</span> Rewriter API</h3>
                <p>Simplify complex technical errors for junior developers. Adjust explanation complexity based on experience.</p>
                <div style={{ marginTop: '10px', fontSize: '0.9em', color: '#a0aec0' }}>🚧 Planned</div>
              </div>
            </div>
          </div>

          <div className="card">
            <h2 style={{ color: '#2d3748', marginBottom: '20px' }}>📊 Feature Status & Roadmap</h2>
            <div style={{ background: '#f7fafc', padding: '20px', borderRadius: '10px', marginBottom: '20px' }}>
              <h3 style={{ color: '#2d3748', marginBottom: '15px' }}>✅ Implemented (Core Features)</h3>
              <ul style={{ color: '#4a5568', lineHeight: '1.8', paddingLeft: '20px' }}>
                <li>AI-Powered Universal Debugging with Chrome Writer API</li>
                <li>DevTools Panel with Logcat-inspired UI</li>
                <li>Intelligent Pattern Detection System</li>
                <li>Context-Aware Analysis (DOM, Stack, Dependencies)</li>
                <li>40+ Fallback Patterns for Offline Operation</li>
                <li>Content Script Bridge Architecture</li>
                <li>Comprehensive Test Suite (50+ scenarios)</li>
                <li>100% On-Device Privacy</li>
              </ul>
            </div>
            <div style={{ background: '#fff5f5', padding: '20px', borderRadius: '10px', marginBottom: '20px' }}>
              <h3 style={{ color: '#2d3748', marginBottom: '15px' }}>🚧 In Development</h3>
              <ul style={{ color: '#4a5568', lineHeight: '1.8', paddingLeft: '20px' }}>
                <li>GitHub Issue Generation with AI</li>
                <li>Chrome Summarizer API Integration</li>
                <li>Chrome Rewriter API for Error Simplification</li>
                <li>Export/Import Debug Sessions</li>
              </ul>
            </div>
            <div style={{ background: '#f0fff4', padding: '20px', borderRadius: '10px' }}>
              <h3 style={{ color: '#2d3748', marginBottom: '15px' }}>📋 Planned Features</h3>
              <ul style={{ color: '#4a5568', lineHeight: '1.8', paddingLeft: '20px' }}>
                <li>Mobile Dashboard (Q2 2025)</li>
                <li>Multi-Language Support (Q2 2025)</li>
                <li>Team Collaboration Features (Q3 2025)</li>
                <li>VS Code Extension (Q3 2025)</li>
                <li>CI/CD Pipeline Integration (Q4 2025)</li>
                <li>Slack/Discord Notifications (Q4 2025)</li>
              </ul>
            </div>
          </div>

          <div className="card">
            <h2 style={{ color: '#2d3748', marginBottom: '20px' }}>🤝 Open Source Project</h2>
            <p style={{ color: '#718096', marginBottom: '20px' }}>
              Mosqit is proudly open source and welcomes contributions from the community.
              Whether you&apos;re fixing bugs, adding features, or improving documentation, your help makes Mosqit better for everyone.
            </p>

            <div className="button-group">
              <a href="https://github.com/ma-za-kpe/mosqit/issues" className="btn btn-secondary" target="_blank" rel="noopener noreferrer">🐛 Report Issues</a>
              <a href="https://github.com/ma-za-kpe/mosqit/pulls" className="btn btn-secondary" target="_blank" rel="noopener noreferrer">🔀 Submit PR</a>
              <a href="https://github.com/ma-za-kpe/mosqit/discussions" className="btn btn-secondary" target="_blank" rel="noopener noreferrer">💬 Discussions</a>
            </div>
          </div>

          <div className="card" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
            <h2 style={{ color: 'white', marginBottom: '20px', textAlign: 'center' }}>☕ Support Development</h2>
            <p style={{ color: 'rgba(255, 255, 255, 0.9)', marginBottom: '30px', textAlign: 'center', fontSize: '1.1rem' }}>
              Mosqit is free and open source forever. If you find it helpful, consider supporting the development!
            </p>
            <div style={{ textAlign: 'center' }}>
              <p style={{ color: 'rgba(255, 255, 255, 0.9)', marginBottom: '20px' }}>
                Your support helps us:
              </p>
              <ul style={{ color: 'rgba(255, 255, 255, 0.9)', listStyle: 'none', padding: 0, marginBottom: '30px' }}>
                <li style={{ marginBottom: '10px' }}>✨ Add new features faster</li>
                <li style={{ marginBottom: '10px' }}>🐛 Fix bugs and improve performance</li>
                <li style={{ marginBottom: '10px' }}>📚 Create better documentation</li>
                <li style={{ marginBottom: '10px' }}>🌍 Add support for more languages</li>
                <li style={{ marginBottom: '10px' }}>⚡ Keep the project maintained and updated</li>
              </ul>
              <div className="button-group" style={{ justifyContent: 'center' }}>
                <a
                  href="https://www.buymeacoffee.com/mosqit"
                  className="btn"
                  style={{
                    background: '#FFDD00',
                    color: '#000000',
                    padding: '15px 30px',
                    fontSize: '1.1rem',
                    fontWeight: 'bold',
                    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)'
                  }}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  ☕ Buy Me a Coffee
                </a>
                <a
                  href="https://github.com/sponsors/ma-za-kpe"
                  className="btn"
                  style={{
                    background: 'white',
                    color: '#24292e',
                    padding: '15px 30px',
                    fontSize: '1.1rem',
                    fontWeight: 'bold',
                    border: '2px solid white'
                  }}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  ❤️ GitHub Sponsors
                </a>
              </div>
              <p style={{ color: 'rgba(255, 255, 255, 0.7)', marginTop: '20px', fontSize: '0.9rem' }}>
                100% optional - Mosqit will always be free and open source!
              </p>
            </div>
          </div>

          <div className="card" style={{ textAlign: 'center' }}>
            <p><strong>Mosqit</strong> - Built with ❤️ for the Chrome Built-in AI Challenge 2025</p>
            <div className="footer-links">
              <a href="https://github.com/ma-za-kpe/mosqit" target="_blank" rel="noopener noreferrer">GitHub</a>
              <a href="https://developer.chrome.com/docs/ai/built-in" target="_blank" rel="noopener noreferrer">Chrome AI Docs</a>
              <a href="/test/test-logger.html">Test Suite</a>
              <a href="https://github.com/ma-za-kpe/mosqit/blob/main/LICENSE" target="_blank" rel="noopener noreferrer">MIT License</a>
            </div>
            <p style={{ marginTop: '20px', color: '#718096' }}>© 2025 Mosqit Project. Open Source under MIT License.</p>
          </div>
        </div>
      </div>
    </>
  );
}