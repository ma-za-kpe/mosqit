'use client';

import { useAnalytics, useTrackVisibility, useTrackHover } from '@/hooks/useAnalytics';
import { useEffect } from 'react';

export default function Home() {
  const {
    trackButtonClick,
    trackLinkClick,
    trackFeature,
    trackSocialClick,
    trackEvent
  } = useAnalytics();

  // Track visibility of key sections
  useTrackVisibility('hero-section');
  useTrackVisibility('features-section');
  useTrackVisibility('installation-section');
  useTrackVisibility('chrome-ai-warning');

  // Track hover on important elements
  useTrackHover('demo-button');
  useTrackHover('install-button');

  // Track initial page load
  useEffect(() => {
    trackEvent('home_page_loaded', 'navigation', window.location.pathname);
  }, []);

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

        /* Mobile Responsive Styles */
        @media (max-width: 768px) {
          .container {
            padding: 10px;
          }
          .card {
            padding: 20px;
            margin-bottom: 20px;
            border-radius: 15px;
          }
          .logo {
            font-size: 3rem;
          }
          .title {
            font-size: 1.8rem;
          }
          .subtitle {
            font-size: 1rem;
          }
          .badges {
            gap: 10px;
          }
          .badge {
            padding: 6px 12px;
            font-size: 0.8rem;
          }
          .challenge-banner {
            padding: 15px;
            font-size: 0.9rem;
          }
          .features-grid {
            grid-template-columns: 1fr;
            gap: 15px;
          }
          .feature-card {
            padding: 20px;
          }
          .feature-card h3 {
            font-size: 1.1rem;
          }
          .button-group {
            flex-direction: column;
            align-items: stretch;
            gap: 15px;
          }
          .btn {
            padding: 12px 24px;
            font-size: 1rem;
            text-align: center;
          }
          .tech-stack {
            gap: 10px;
          }
          .tech-badge {
            padding: 8px 16px;
            font-size: 0.9rem;
          }
          .installation-steps {
            padding: 15px;
          }
          .installation-steps ol {
            padding-left: 15px;
          }
          .installation-steps li {
            font-size: 0.95rem;
          }
          .code-preview {
            padding: 15px;
            font-size: 0.85rem;
          }
          .footer-links {
            gap: 20px;
          }
          .footer-links a {
            font-size: 0.9rem;
          }
          h2 {
            font-size: 1.5rem !important;
          }
          p {
            font-size: 0.95rem;
          }
        }

        @media (max-width: 480px) {
          .container {
            padding: 5px;
          }
          .card {
            padding: 15px;
            border-radius: 12px;
          }
          .logo {
            font-size: 2.5rem;
            margin-bottom: 15px;
          }
          .title {
            font-size: 1.5rem;
            margin-bottom: 8px;
          }
          .subtitle {
            font-size: 0.9rem;
            margin-bottom: 15px;
          }
          .badge {
            padding: 5px 10px;
            font-size: 0.75rem;
          }
          .challenge-banner {
            padding: 12px;
            font-size: 0.85rem;
            border-radius: 10px;
          }
          .feature-card {
            padding: 15px;
            border-radius: 12px;
          }
          .feature-card h3 {
            font-size: 1rem;
            margin-bottom: 8px;
          }
          .feature-icon {
            font-size: 1.2rem;
          }
          .feature-card p {
            font-size: 0.9rem;
          }
          .btn {
            padding: 10px 20px;
            font-size: 0.95rem;
            border-radius: 25px;
          }
          .tech-badge {
            padding: 6px 12px;
            font-size: 0.85rem;
          }
          .installation-steps {
            padding: 12px;
            font-size: 0.9rem;
          }
          .installation-steps code {
            font-size: 0.8em;
            padding: 1px 6px;
          }
          .code-preview {
            padding: 12px;
            font-size: 0.75rem;
            border-radius: 8px;
          }
          h2 {
            font-size: 1.3rem !important;
            margin-bottom: 15px !important;
          }
          p {
            font-size: 0.9rem;
            line-height: 1.5;
          }
          .footer-links {
            flex-direction: column;
            gap: 10px;
            text-align: center;
          }
        }

        /* Improved text readability on mobile */
        @media (max-width: 768px) {
          body {
            -webkit-text-size-adjust: 100%;
            text-size-adjust: 100%;
          }
        }

        /* Landscape mode adjustments */
        @media (max-width: 768px) and (orientation: landscape) {
          .logo {
            font-size: 2rem;
          }
          .title {
            font-size: 1.5rem;
          }
          .card {
            padding: 15px;
          }
        }

        /* Under Construction Badge */
        .construction-badge {
          position: fixed;
          top: 0;
          right: 0;
          width: 200px;
          height: 200px;
          overflow: hidden;
          z-index: 9999;
          pointer-events: none;
        }

        .construction-ribbon {
          position: absolute;
          top: 50px;
          right: -50px;
          width: 280px;
          height: 50px;
          background: linear-gradient(135deg, #FFB800 0%, #FF6B00 100%);
          transform: rotate(45deg);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
          pointer-events: auto;
          cursor: default;
        }

        .construction-text {
          color: white;
          font-weight: bold;
          font-size: 14px;
          text-transform: uppercase;
          letter-spacing: 1px;
          text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .construction-icon {
          font-size: 18px;
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.1);
          }
        }

        /* Mobile adjustments for construction badge */
        @media (max-width: 768px) {
          .construction-badge {
            width: 150px;
            height: 150px;
          }

          .construction-ribbon {
            top: 35px;
            right: -40px;
            width: 200px;
            height: 35px;
          }

          .construction-text {
            font-size: 11px;
            gap: 5px;
          }

          .construction-icon {
            font-size: 14px;
          }
        }

        @media (max-width: 480px) {
          .construction-badge {
            width: 120px;
            height: 120px;
          }

          .construction-ribbon {
            top: 28px;
            right: -35px;
            width: 160px;
            height: 28px;
          }

          .construction-text {
            font-size: 9px;
            letter-spacing: 0.5px;
          }

          .construction-icon {
            font-size: 12px;
          }
        }
      `}</style>

      {/* Under Construction Badge */}
      <div className="construction-badge" aria-label="Under Construction">
        <div className="construction-ribbon">
          <span className="construction-text">
            <span className="construction-icon">🚧</span>
            Under Construction
            <span className="construction-icon">🔨</span>
          </span>
        </div>
      </div>

      <div className="gradient-bg" itemScope itemType="https://schema.org/SoftwareApplication">
        <div className="container">
          <header className="card" role="banner">
            <div className="logo" aria-label="Mosqit Logo">🦟</div>
            <h1 className="title" itemProp="name">Mosqit</h1>
            <p className="subtitle" itemProp="description">AI-Driven Frontend Debugging Chrome Extension</p>
            <meta itemProp="applicationCategory" content="DeveloperApplication" />
            <meta itemProp="operatingSystem" content="Chrome 127+" />
            <div itemProp="offers" itemScope itemType="https://schema.org/Offer">
              <meta itemProp="price" content="0" />
              <meta itemProp="priceCurrency" content="USD" />
            </div>
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
          </header>

          <div className="card">
            <h2 style={{ color: '#2d3748', marginBottom: '20px' }}>🚀 Buzz Through Frontend Bugs with AI-Driven Intelligence</h2>
            <p style={{ color: '#718096', lineHeight: '1.6', marginBottom: '20px' }}>
              <strong>Mosqit</strong> revolutionizes frontend debugging by combining Visual Bug Reporter, Android Logcat-inspired logging, and Chrome&apos;s built-in AI APIs (Gemini Nano).
              Click any element to capture bugs, analyze console errors with AI, detect patterns, get framework-specific insights, and create professional GitHub issues - all directly from DevTools!
            </p>
            <p style={{ color: '#718096', lineHeight: '1.6' }}>
              Experience &lt;100ms response times, comprehensive metadata capture, recurring error detection, and actionable fix suggestions -
              all while maintaining complete privacy through on-device AI processing.
            </p>

            <div className="tech-stack">
              <span className="tech-badge">TypeScript</span>
              <span className="tech-badge">Chrome Extension API</span>
              <span className="tech-badge">Writer API</span>
              <span className="tech-badge">Prompt API</span>
              <span className="tech-badge">Summarizer API</span>
            </div>

            <div className="button-group">
              <a
                href="/test/test-logger.html"
                className="btn btn-primary"
                onClick={() => {
                  trackButtonClick('try-demo', { location: 'hero' });
                  trackFeature('demo', 'open');
                }}
              >
                🧪 Try Demo
              </a>
              <a
                href="/tutorial"
                className="btn btn-secondary"
                onClick={() => {
                  trackButtonClick('tutorial', { location: 'hero' });
                  trackLinkClick('tutorial', '/tutorial');
                }}
              >
                📚 Tutorial
              </a>
              <a
                href="https://github.com/ma-za-kpe/mosqit"
                className="btn btn-github"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => {
                  trackButtonClick('github-star', { location: 'hero' });
                  trackSocialClick('github', 'star');
                }}
              >
                ⭐ Star on GitHub
              </a>
              <button
                className="btn btn-secondary"
                style={{ cursor: 'not-allowed', opacity: 0.7, position: 'relative' }}
                disabled
                title="Extension coming soon to Chrome Web Store!"
                onClick={() => {
                  trackButtonClick('install-extension-disabled', { location: 'hero', reason: 'coming_soon' });
                }}
              >
                📦 Install Extension
                <span style={{
                  position: 'absolute',
                  top: '-10px',
                  right: '-10px',
                  background: 'linear-gradient(135deg, #FFB800 0%, #FF6B00 100%)',
                  color: 'white',
                  fontSize: '10px',
                  padding: '2px 6px',
                  borderRadius: '10px',
                  fontWeight: 'bold'
                }}>SOON</span>
              </button>
            </div>
          </div>

          {/* Chrome AI Setup Warning */}
          <div className="card" style={{ background: 'linear-gradient(135deg, #FFF9C4, #FFE082)', border: '2px solid #F57C00' }}>
            <h2 style={{ color: '#E65100', marginBottom: '20px' }}>⚠️ Chrome AI Setup Required</h2>
            <p style={{ color: '#BF360C', fontWeight: '600', marginBottom: '15px' }}>
              🦟 Mosqit uses Chrome&apos;s experimental AI APIs. These require specific setup:
            </p>
            <div style={{ background: 'white', padding: '20px', borderRadius: '10px', marginBottom: '15px' }}>
              <h3 style={{ color: '#E65100', marginBottom: '15px' }}>Quick Setup (3 Steps):</h3>
              <ol style={{ color: '#424242', lineHeight: '1.8' }}>
                <li><strong>Chrome Version:</strong> You need Chrome 128+ (you probably have 140+)</li>
                <li><strong>Enable AI Flags:</strong> Go to <code style={{ background: '#FFF3E0', padding: '2px 6px', borderRadius: '3px' }}>chrome://flags</code>
                  <ul style={{ marginTop: '8px', marginBottom: '8px' }}>
                    <li><code>#optimization-guide-on-device-model</code> → <strong>Enabled BypassPerfRequirement</strong></li>
                    <li><code>#writer-api-for-gemini-nano</code> → <strong>Enabled</strong></li>
                    <li><code>#rewriter-api-for-gemini-nano</code> → <strong>Enabled</strong> (optional)</li>
                    <li><code>#summarization-api-for-gemini-nano</code> → <strong>Enabled</strong> (optional)</li>
                  </ul>
                </li>
                <li><strong>Restart Chrome Completely</strong> (not just the tab)</li>
              </ol>
            </div>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <a
                href="/test/chrome-ai-status.html"
                className="btn btn-primary"
                style={{ background: '#E65100' }}
                onClick={() => {
                  trackButtonClick('check-ai-status', { location: 'chrome-ai-warning' });
                  trackFeature('ai-status-check', 'open');
                }}
              >
                🔍 Check Your AI Status
              </a>
              <a
                href="chrome://flags"
                className="btn btn-secondary"
                style={{ background: '#F57C00', color: 'white' }}
                onClick={() => {
                  trackButtonClick('open-chrome-flags', { location: 'chrome-ai-warning' });
                  trackFeature('chrome-flags', 'navigate');
                }}
              >
                ⚙️ Open Chrome Flags
              </a>
              <a
                href="https://developer.chrome.com/docs/ai/writer-api"
                className="btn btn-secondary"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => {
                  trackButtonClick('chrome-ai-docs', { location: 'chrome-ai-warning' });
                  trackLinkClick('chrome-ai-docs', 'https://developer.chrome.com/docs/ai/writer-api', true);
                }}
              >
                📚 Chrome AI Docs
              </a>
            </div>
            <p style={{ color: '#795548', fontSize: '0.9rem', marginTop: '15px' }}>
              <strong>Note:</strong> The AI model (Gemini Nano) is ~2GB. It downloads automatically when you first use it.
              Without AI, Mosqit still works using pattern-based analysis! 🦟
            </p>
          </div>

          <div className="card">
            <h2 style={{ color: '#2d3748', marginBottom: '20px' }}>✨ Key Features</h2>
            <div className="features-grid">
              <div className="feature-card">
                <h3><span className="feature-icon">🤖</span> AI-Powered Analysis</h3>
                <p>Leverages Chrome&apos;s built-in Gemini Nano model with Writer API for intelligent debugging insights - completely on-device.</p>
              </div>
              <div className="feature-card">
                <h3><span className="feature-icon">🐛</span> Visual Bug Reporter</h3>
                <p>Click any element on a webpage to capture bugs visually. Automatically collects element info, console errors, and screenshot for comprehensive bug reports.</p>
              </div>
              <div className="feature-card">
                <h3><span className="feature-icon">🚀</span> GitHub Issue Creation</h3>
                <p>Create professional GitHub issues directly from DevTools. AI-generated titles, enhanced descriptions, and complete debugging context included automatically.</p>
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
                <p>Get specific fix suggestions with proper stack trace location tracking. Shows exact file:line:column for every error with DOM context.</p>
              </div>
              <div className="feature-card">
                <h3><span className="feature-icon">🚀</span> Multi-API Strategy</h3>
                <p>Uses Writer API for structured insights, Prompt API for complex analysis, and Summarizer API for pattern detection across multiple errors.</p>
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

            <div className="code-preview" style={{
              marginTop: '30px',
              background: '#1a1b26',
              color: '#c0caf5',
              border: '1px solid #414868',
              padding: '20px'
            }}>
              <pre style={{ color: '#c0caf5', margin: 0 }}>{`// Standard Chrome DevTools Console:
Uncaught TypeError: Cannot read property 'name' of null
    at UserProfile.js:42:15
    at processComponent (react-dom.js:123:8)
    at beginWork (react-dom.js:456:12)

// 🦟 Mosqit DevTools Panel (click log to expand):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[11:03:02 PM] ❌ ERROR  UserProfile.js:42:15
Cannot read property 'name' of null
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

▼ Log Details (expanded view)

  Message:
  Cannot read property 'name' of null

  🤖 AI Analysis:
  The error "Cannot read property 'name' of null" occurs
  in the UserProfile component. The variable 'user' is null
  when trying to access its 'name' property. This likely
  means the user data hasn't loaded yet or wasn't passed
  correctly to the component.

  Location: UserProfile.js:42:15

  Stack Trace:
  TypeError: Cannot read property 'name' of null
    at UserProfile.render (UserProfile.js:42:15)
    at processComponent (react-dom.js:123:8)
    at beginWork (react-dom.js:456:12)
    at performUnitOfWork (react-dom.js:789:10)

  Metadata:
  • URL: http://localhost:3000/profile
  • Timestamp: 9/21/2025, 11:03:02 PM
  • Level: error
  • User Agent: Mozilla/5.0 (Windows NT 10.0)`}</pre>
            </div>
          </div>

          <div className="card" id="devtools-tutorial">
            <h2 style={{ color: '#2d3748', marginBottom: '20px' }}>🛠️ How to Use Mosqit DevTools Panel</h2>

            <div style={{
              background: 'linear-gradient(135deg, #1a1b26 0%, #24283b 100%)',
              padding: '25px',
              borderRadius: '12px',
              color: '#c0caf5',
              marginBottom: '30px'
            }}>
              <h3 style={{ color: '#7aa2f7', marginBottom: '20px' }}>🦟 Quick Start Guide</h3>

              <ol style={{ lineHeight: '2', fontSize: '1.1rem' }}>
                <li><strong style={{ color: '#9ece6a' }}>Install the Extension:</strong> Load Mosqit from Chrome Extensions</li>
                <li><strong style={{ color: '#9ece6a' }}>Open DevTools:</strong> Press <code style={{
                  background: '#292e42',
                  padding: '3px 8px',
                  borderRadius: '4px',
                  border: '1px solid #414868'
                }}>F12</code> or right-click → &ldquo;Inspect&rdquo;</li>
                <li><strong style={{ color: '#9ece6a' }}>Find Mosqit Tab:</strong> Look for the 🦟 Mosqit panel in DevTools tabs</li>
                <li><strong style={{ color: '#9ece6a' }}>Start Debugging:</strong> All console outputs automatically appear with AI analysis</li>
              </ol>

              <div style={{ marginTop: '25px', padding: '20px', background: '#292e42', borderRadius: '8px' }}>
                <h4 style={{ color: '#e0af68', marginBottom: '15px' }}>✨ Panel Features</h4>
                <ul style={{ listStyle: 'none', padding: 0 }}>
                  <li style={{ marginBottom: '10px' }}>🌙 <strong>Dark/Light Theme:</strong> Click the theme toggle in the top-right</li>
                  <li style={{ marginBottom: '10px' }}>🔍 <strong>Filter by Level:</strong> Click chips for Error, Warn, Info, Debug</li>
                  <li style={{ marginBottom: '10px' }}>🤖 <strong>AI Analysis:</strong> Toggle AI insights on/off with the AI button</li>
                  <li style={{ marginBottom: '10px' }}>📦 <strong>Export Logs:</strong> Download all logs as JSON for sharing</li>
                  <li style={{ marginBottom: '10px' }}>🗑️ <strong>Clear Logs:</strong> Start fresh with the clear button</li>
                  <li style={{ marginBottom: '10px' }}>📊 <strong>Live Updates:</strong> Logs stream in real-time as they occur</li>
                </ul>
              </div>

              <div style={{ marginTop: '25px', padding: '20px', background: '#24283b', borderRadius: '8px', border: '1px solid #414868' }}>
                <h4 style={{ color: '#7dcfff', marginBottom: '15px' }}>💡 Pro Tips</h4>
                <ul style={{ listStyle: 'none', padding: 0 }}>
                  <li style={{ marginBottom: '8px' }}>• Click any log to see full details including stack trace</li>
                  <li style={{ marginBottom: '8px' }}>• Search logs with <code style={{ background: '#1a1b26', padding: '2px 6px', borderRadius: '3px' }}>Ctrl+F</code></li>
                  <li style={{ marginBottom: '8px' }}>• Press <code style={{ background: '#1a1b26', padding: '2px 6px', borderRadius: '3px' }}>Esc</code> to clear search</li>
                  <li style={{ marginBottom: '8px' }}>• Use arrow keys to navigate between logs</li>
                  <li style={{ marginBottom: '8px' }}>• Logs available during current debugging session</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="card" id="installation">
            <h2 style={{ color: '#2d3748', marginBottom: '20px' }}>🛠️ Installation & Setup</h2>

            <div className="challenge-banner" style={{
              marginBottom: '25px',
              background: 'linear-gradient(135deg, #FFB800 0%, #FF6B00 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px'
            }}>
              <span style={{ fontSize: '20px' }}>🚧</span>
              <div>
                <strong>Chrome Web Store submission in progress!</strong>
                <br />
                <span style={{ fontSize: '0.9em', opacity: 0.95 }}>
                  For now, you can build from source or try the demo while we await approval.
                </span>
              </div>
              <span style={{ fontSize: '20px' }}>🚀</span>
            </div>

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

            <div className="code-preview" style={{
              background: '#1a1b26',
              color: '#c0caf5',
              border: '1px solid #414868'
            }}>
              <pre style={{ color: '#c0caf5' }}>{`// 🦟 Mosqit DevTools Panel - Actual Display:

[11:03:02 PM] ❌ ERROR  content.js:215:35
Cannot read properties of null (reading 'addEventListener')
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Click to expand and see:
▼ Log Details

  Message:
  DOM manipulation error: Cannot read properties of null
  (reading 'addEventListener')

  🤖 AI Analysis:
  The error "Cannot read properties of null (reading
  'addEventListener')" occurs because the JavaScript code
  attempted to add an event listener to a DOM element that
  was null. This likely happened because the element targeted
  by the event listener was not found in the DOM at the time
  the code executed.

  Location: content.js:215:35

  Stack Trace:
  Error
    at MosqitLogger.captureMetadata (content.js:273:21)
    at console.<computed> [as error] (content.js:215:35)
    at testDOMError (test-logger.js:88:17)
    at HTMLButtonElement.onclick (test-logger.html:56:56)

  Metadata:
  • URL: http://localhost:3000/test/test-logger.html
  • Timestamp: 9/21/2025, 11:03:02 PM
  • Level: error
  • User Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64)

[11:03:05 PM] ⚠️ WARN  app.js:156:8
API response slow: 3.2s
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[11:03:07 PM] ✅ INFO  content.js:215
[Mosqit] ✅ Logger initialized
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`}</pre>
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
                <h3><span className="feature-icon">💾</span> Smart Memory Management</h3>
                <p>Efficient in-memory log caching for current session, pattern detection cache, and reusable AI session management for optimal performance.</p>
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
              <div className="feature-card">
                <h3><span className="feature-icon">✅</span> GitHub Integration (Released!)</h3>
                <p>Now available! Create issues directly from debugging insights with AI-generated descriptions and reproduction steps.</p>
                <div style={{ marginTop: '10px', fontSize: '0.9em', color: '#10b981', fontWeight: '600' }}>✅ Released in v1.0.0</div>
              </div>
              <div className="feature-card" style={{ opacity: 0.8 }}>
                <h3><span className="feature-icon">📱</span> Mobile Dashboard</h3>
                <p>Responsive web dashboard for viewing and managing logs on mobile devices. Real-time sync across devices.</p>
                <div style={{ marginTop: '10px', fontSize: '0.9em', color: '#a0aec0' }}>🚧 Coming Soon</div>
              </div>
              <div className="feature-card" style={{ opacity: 0.8 }}>
                <h3><span className="feature-icon">🌍</span> Multi-Language Support</h3>
                <p>Localized debugging insights in 5+ languages using Chrome Translator API. Technical terms preserved.</p>
                <div style={{ marginTop: '10px', fontSize: '0.9em', color: '#a0aec0' }}>🚧 Coming Soon</div>
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
                <li>Visual Bug Reporter with element selection and screenshot capture</li>
                <li>GitHub Issue Creation with AI-generated content</li>
                <li>AI-Powered Universal Debugging with Chrome Writer API</li>
                <li>DevTools Panel with Logcat-inspired UI</li>
                <li>Intelligent Pattern Detection System</li>
                <li>Context-Aware Analysis (DOM, Stack, Dependencies)</li>
                <li>40+ Fallback Patterns for Offline Operation</li>
                <li>Content Script Bridge Architecture</li>
                <li>Comprehensive Test Suite (75+ scenarios)</li>
                <li>100% On-Device Privacy</li>
                <li>Copy Issue Content with visual feedback</li>
                <li>Auto-recovery from invalid GitHub tokens</li>
              </ul>
            </div>
            <div style={{ background: '#fff5f5', padding: '20px', borderRadius: '10px', marginBottom: '20px' }}>
              <h3 style={{ color: '#16a34a', marginBottom: '15px' }}>✅ Recently Completed</h3>
              <ul style={{ color: '#4a5568', lineHeight: '1.8', paddingLeft: '20px' }}>
                <li>Visual Bug Reporter with element selection and screenshot capture</li>
                <li>GitHub Integration - Create issues directly from DevTools</li>
                <li>AI-Generated issue titles and enhanced descriptions</li>
                <li>Copy to clipboard with visual feedback</li>
                <li>Auto-recovery from invalid GitHub tokens</li>
                <li>Professional DevTools Panel with Android Logcat-inspired dark UI</li>
                <li>Chrome Writer & Prompt API Integration</li>
                <li>Export/Import Debug Sessions with JSON format</li>
                <li>Light/Dark Theme Toggle with saved preferences</li>
                <li>Real-time log streaming with expandable metadata</li>
                <li>Pattern tracking and recurring error detection</li>
                <li>Developer Notes with debugging checklists</li>
                <li>Comprehensive test suite (75+ test scenarios)</li>
              </ul>
            </div>
            <div style={{ background: '#fff5f5', padding: '20px', borderRadius: '10px', marginBottom: '20px' }}>
              <h3 style={{ color: '#2d3748', marginBottom: '15px' }}>🚧 In Development</h3>
              <ul style={{ color: '#4a5568', lineHeight: '1.8', paddingLeft: '20px' }}>
                <li>Chrome Summarizer API Integration</li>
                <li>Chrome Rewriter API for Error Simplification</li>
                <li>Jira Integration</li>
                <li>Video Recording for Bug Reproduction</li>
              </ul>
            </div>
            <div style={{ background: '#f0fff4', padding: '20px', borderRadius: '10px' }}>
              <h3 style={{ color: '#2d3748', marginBottom: '15px' }}>📋 Planned Features</h3>
              <ul style={{ color: '#4a5568', lineHeight: '1.8', paddingLeft: '20px' }}>
                <li>Mobile Dashboard</li>
                <li>Multi-Language Support</li>
                <li>Team Collaboration Features</li>
                <li>VS Code Extension</li>
                <li>CI/CD Pipeline Integration</li>
                <li>Slack/Discord Notifications</li>
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

          {/* Chrome AI Resources Section */}
          <div className="card">
            <h2 style={{ color: '#2d3748', marginBottom: '25px' }}>🔗 Chrome AI Developer Resources</h2>
            <p style={{ color: '#718096', marginBottom: '25px' }}>
              Join the Chrome Early Preview Program community and access official resources for building with Chrome&apos;s built-in AI:
            </p>
            <div className="features-grid">
              <div className="feature-card">
                <h3><span className="feature-icon">📚</span>Official API Docs</h3>
                <p>Complete documentation for Chrome&apos;s built-in AI APIs including Writer, Prompt, and Summarizer APIs.</p>
                <a
                  href="https://developer.chrome.com/docs/ai/built-in-apis"
                  className="btn btn-secondary"
                  style={{ marginTop: '15px', display: 'inline-block' }}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View API Docs →
                </a>
              </div>
              <div className="feature-card">
                <h3><span className="feature-icon">🗂️</span>EPP Docs Index</h3>
                <p>Comprehensive index including multimodal and hybrid AI capabilities, experimental features, and advanced use cases.</p>
                <a
                  href="https://goo.gle/chrome-ai-dev-preview-index"
                  className="btn btn-secondary"
                  style={{ marginTop: '15px', display: 'inline-block' }}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Browse Index →
                </a>
              </div>
              <div className="feature-card">
                <h3><span className="feature-icon">💬</span>Discussion Forum</h3>
                <p>Connect with the Chrome AI developer community, share ideas, get help, and provide feedback on the APIs.</p>
                <a
                  href="https://goo.gle/chrome-ai-dev-preview-discuss"
                  className="btn btn-secondary"
                  style={{ marginTop: '15px', display: 'inline-block' }}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Join Discussion →
                </a>
              </div>
              <div className="feature-card">
                <h3><span className="feature-icon">🎮</span>Discord Community</h3>
                <p>Real-time chat with Chrome AI developers and enthusiasts. Get instant help and share your projects.</p>
                <a
                  href="https://goo.gle/chrome-ai-dev-preview-gdc-discord"
                  className="btn btn-secondary"
                  style={{ marginTop: '15px', display: 'inline-block' }}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Join Discord →
                </a>
              </div>
            </div>
            <div className="challenge-banner" style={{ marginTop: '30px', background: 'linear-gradient(135deg, #4285F4 0%, #EA4335 100%)' }}>
              <strong>🏆 Building for Chrome Built-in AI Challenge?</strong> These resources are essential for maximizing your use of Chrome&apos;s AI capabilities!
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
                  href="https://buymeacoffee.com/mosqit"
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
              <a href="/tutorial">Tutorial</a>
              <a href="https://github.com/ma-za-kpe/mosqit/blob/main/LICENSE" target="_blank" rel="noopener noreferrer">MIT License</a>
            </div>
            <p style={{ marginTop: '20px', color: '#718096' }}>© 2025 Mosqit Project. Open Source under MIT License.</p>
          </div>
        </div>
      </div>
    </>
  );
}