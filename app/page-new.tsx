'use client';

import { useAnalytics, useTrackVisibility } from '@/hooks/useAnalytics';
import { useEffect } from 'react';
import Link from 'next/link';

export default function Home() {
  const {
    trackButtonClick,
    trackLinkClick,
    trackFeature,
    trackSocialClick,
    trackEvent
  } = useAnalytics();

  useTrackVisibility('hero-section');
  useTrackVisibility('features-section');

  useEffect(() => {
    trackEvent('home_page_loaded', 'navigation', window.location.pathname);
  }, [trackEvent]);

  return (
    <>
      <style jsx>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        /* ===== PROFESSIONAL COLOR PALETTE ===== */
        :root {
          --mosqit-primary: #5B21B6;
          --mosqit-primary-light: #7C3AED;
          --mosqit-primary-dark: #4C1D95;
          --mosqit-accent: #10B981;
          --mosqit-gray-50: #F9FAFB;
          --mosqit-gray-100: #F3F4F6;
          --mosqit-gray-200: #E5E7EB;
          --mosqit-gray-500: #6B7280;
          --mosqit-gray-700: #374151;
          --mosqit-gray-900: #111827;
          --mosqit-bg-primary: #FFFFFF;
        }

        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
          background: var(--mosqit-bg-primary);
          color: var(--mosqit-gray-900);
          line-height: 1.6;
        }

        /* ===== NAVIGATION ===== */
        .navbar {
          position: sticky;
          top: 0;
          z-index: 1000;
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
          border-bottom: 1px solid var(--mosqit-gray-200);
          padding: 16px 0;
        }

        .nav-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 20px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .nav-logo {
          display: flex;
          align-items: center;
          gap: 12px;
          text-decoration: none;
          font-weight: 700;
          font-size: 1.5rem;
          color: var(--mosqit-gray-900);
        }

        .logo-icon {
          width: 40px;
          height: 40px;
          background: var(--mosqit-primary);
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 1.5rem;
        }

        .nav-links {
          display: flex;
          gap: 32px;
          align-items: center;
        }

        .nav-link {
          color: var(--mosqit-gray-700);
          text-decoration: none;
          font-weight: 500;
          font-size: 0.9375rem;
          transition: color 0.2s;
        }

        .nav-link:hover {
          color: var(--mosqit-primary);
        }

        .btn-nav-primary {
          padding: 10px 24px;
          background: var(--mosqit-primary);
          color: white;
          font-weight: 600;
          border-radius: 8px;
          text-decoration: none;
          font-size: 0.9375rem;
          transition: all 0.2s;
          border: none;
          cursor: pointer;
        }

        .btn-nav-primary:hover {
          background: var(--mosqit-primary-dark);
        }

        /* ===== HERO SECTION ===== */
        .hero {
          background: linear-gradient(180deg, #FFFFFF 0%, var(--mosqit-gray-50) 100%);
          padding: 100px 20px 80px;
        }

        .hero-container {
          max-width: 1200px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 60px;
          align-items: center;
        }

        .hero-content {
          max-width: 600px;
        }

        .hero-badge {
          display: inline-block;
          padding: 6px 16px;
          background: var(--mosqit-gray-100);
          border: 1px solid var(--mosqit-gray-200);
          border-radius: 20px;
          font-size: 0.875rem;
          font-weight: 600;
          color: var(--mosqit-gray-700);
          margin-bottom: 24px;
        }

        .hero-title {
          font-size: 3rem;
          font-weight: 700;
          line-height: 1.15;
          color: var(--mosqit-gray-900);
          margin-bottom: 20px;
          letter-spacing: -0.02em;
        }

        .hero-subtitle {
          font-size: 1.25rem;
          line-height: 1.6;
          color: var(--mosqit-gray-500);
          margin-bottom: 32px;
        }

        .hero-ctas {
          display: flex;
          gap: 16px;
          margin-bottom: 48px;
        }

        .btn-primary {
          padding: 14px 28px;
          background: var(--mosqit-primary);
          color: white;
          font-weight: 600;
          border-radius: 8px;
          text-decoration: none;
          transition: all 0.2s;
          border: none;
          cursor: pointer;
          font-size: 1rem;
        }

        .btn-primary:hover {
          background: var(--mosqit-primary-dark);
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(91, 33, 182, 0.3);
        }

        .btn-secondary {
          padding: 14px 28px;
          background: white;
          color: var(--mosqit-primary);
          font-weight: 600;
          border: 2px solid var(--mosqit-primary);
          border-radius: 8px;
          text-decoration: none;
          transition: all 0.2s;
          cursor: pointer;
          font-size: 1rem;
        }

        .btn-secondary:hover {
          background: var(--mosqit-primary);
          color: white;
        }

        .btn-github {
          padding: 14px 28px;
          background: var(--mosqit-gray-900);
          color: white;
          font-weight: 600;
          border-radius: 8px;
          text-decoration: none;
          transition: all 0.2s;
          border: none;
          cursor: pointer;
          font-size: 1rem;
          display: inline-flex;
          align-items: center;
          gap: 8px;
        }

        .btn-github:hover {
          background: var(--mosqit-gray-700);
          transform: translateY(-1px);
        }

        .hero-stats {
          display: flex;
          gap: 40px;
          padding-top: 32px;
          border-top: 1px solid var(--mosqit-gray-200);
        }

        .stat {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .stat-number {
          font-size: 1.875rem;
          font-weight: 700;
          color: var(--mosqit-primary);
        }

        .stat-label {
          font-size: 0.875rem;
          color: var(--mosqit-gray-500);
        }

        .hero-visual {
          position: relative;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
          background: var(--mosqit-gray-900);
          padding: 20px;
        }

        .hero-visual-placeholder {
          width: 100%;
          height: 400px;
          background: linear-gradient(135deg, #1a1b26 0%, #24283b 100%);
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--mosqit-gray-500);
          font-size: 1.125rem;
        }

        /* ===== FEATURES SECTION ===== */
        .features {
          padding: 80px 20px;
          background: white;
        }

        .section-container {
          max-width: 1200px;
          margin: 0 auto;
        }

        .section-header {
          text-align: center;
          max-width: 800px;
          margin: 0 auto 60px;
        }

        .section-title {
          font-size: 2.5rem;
          font-weight: 700;
          color: var(--mosqit-gray-900);
          margin-bottom: 16px;
        }

        .section-subtitle {
          font-size: 1.25rem;
          color: var(--mosqit-gray-500);
          line-height: 1.6;
        }

        .features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
          gap: 32px;
        }

        .feature-card {
          padding: 32px;
          background: white;
          border: 1px solid var(--mosqit-gray-200);
          border-radius: 12px;
          transition: all 0.3s;
        }

        .feature-card:hover {
          border-color: var(--mosqit-primary);
          box-shadow: 0 8px 24px rgba(91, 33, 182, 0.12);
          transform: translateY(-4px);
        }

        .feature-icon {
          width: 48px;
          height: 48px;
          background: var(--mosqit-primary-light);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 20px;
          color: white;
          font-size: 1.5rem;
        }

        .feature-title {
          font-size: 1.25rem;
          font-weight: 600;
          color: var(--mosqit-gray-900);
          margin-bottom: 12px;
        }

        .feature-description {
          font-size: 1rem;
          color: var(--mosqit-gray-500);
          line-height: 1.6;
        }

        /* ===== CODE SHOWCASE ===== */
        .code-showcase {
          padding: 80px 20px;
          background: linear-gradient(180deg, var(--mosqit-gray-50) 0%, white 100%);
        }

        .code-comparison {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
          margin-bottom: 40px;
        }

        .code-panel {
          background: var(--mosqit-gray-900);
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
        }

        .code-panel-enhanced {
          border: 2px solid var(--mosqit-primary);
          position: relative;
        }

        .code-panel-header {
          padding: 12px 20px;
          background: rgba(255, 255, 255, 0.05);
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .code-label {
          color: var(--mosqit-gray-500);
          font-size: 0.875rem;
          font-weight: 500;
        }

        .badge-ai {
          background: var(--mosqit-accent);
          color: white;
          padding: 2px 8px;
          border-radius: 4px;
          font-size: 0.75rem;
          font-weight: 600;
        }

        .code-block {
          padding: 24px;
          color: #E5E7EB;
          font-family: 'Courier New', monospace;
          font-size: 0.9rem;
          line-height: 1.8;
          overflow-x: auto;
        }

        /* ===== FOOTER ===== */
        .footer {
          background: var(--mosqit-gray-900);
          color: white;
          padding: 60px 20px 30px;
        }

        .footer-container {
          max-width: 1200px;
          margin: 0 auto;
        }

        .footer-top {
          display: grid;
          grid-template-columns: 2fr 1fr 1fr 1fr;
          gap: 60px;
          margin-bottom: 40px;
          padding-bottom: 40px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .footer-brand {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .footer-logo {
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 1.25rem;
          font-weight: 700;
        }

        .footer-tagline {
          color: var(--mosqit-gray-500);
          font-size: 0.9375rem;
        }

        .footer-column {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .footer-heading {
          font-size: 0.875rem;
          font-weight: 600;
          margin-bottom: 8px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .footer-column a {
          color: var(--mosqit-gray-500);
          text-decoration: none;
          font-size: 0.9375rem;
          transition: color 0.2s;
        }

        .footer-column a:hover {
          color: white;
        }

        .footer-bottom {
          display: flex;
          justify-content: space-between;
          align-items: center;
          color: var(--mosqit-gray-500);
          font-size: 0.875rem;
        }

        /* ===== RESPONSIVE ===== */
        @media (max-width: 768px) {
          .nav-links {
            display: none;
          }

          .hero-container {
            grid-template-columns: 1fr;
            gap: 40px;
          }

          .hero-title {
            font-size: 2rem;
          }

          .hero-subtitle {
            font-size: 1.125rem;
          }

          .hero-ctas {
            flex-direction: column;
          }

          .hero-stats {
            gap: 24px;
          }

          .code-comparison {
            grid-template-columns: 1fr;
          }

          .footer-top {
            grid-template-columns: 1fr;
            gap: 40px;
          }

          .footer-bottom {
            flex-direction: column;
            gap: 16px;
            text-align: center;
          }
        }
      `}</style>

      {/* Navigation */}
      <nav className="navbar">
        <div className="nav-container">
          <Link href="/" className="nav-logo">
            <div className="logo-icon">M</div>
            <span>Mosqit</span>
          </Link>

          <div className="nav-links">
            <a href="#features" className="nav-link">Features</a>
            <a href="/tutorial" className="nav-link">Documentation</a>
            <a href="/test/test-logger.html" className="nav-link">Demo</a>
            <a href="https://github.com/ma-za-kpe/mosqit" className="nav-link" target="_blank" rel="noopener noreferrer">GitHub</a>
          </div>

          <a
            href="/test/test-logger.html"
            className="btn-nav-primary"
            onClick={() => trackButtonClick('nav-try-demo', { location: 'navigation' })}
          >
            Try Demo
          </a>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero" id="hero-section" itemScope itemType="https://schema.org/SoftwareApplication">
        <div className="hero-container">
          <div className="hero-content">
            <span className="hero-badge">Chrome Built-in AI Challenge 2025</span>

            <h1 className="hero-title" itemProp="name">
              AI-Powered Debugging for Modern Web Development
            </h1>

            <p className="hero-subtitle" itemProp="description">
              Analyze console errors with on-device AI, detect patterns, and get actionable fix suggestions—all in under 100ms. Private, offline, and framework-aware.
            </p>

            <div className="hero-ctas">
              <a
                href="/test/test-logger.html"
                className="btn-primary"
                onClick={() => {
                  trackButtonClick('try-demo', { location: 'hero' });
                  trackFeature('demo', 'open');
                }}
              >
                Try Live Demo
              </a>
              <a
                href="/tutorial"
                className="btn-secondary"
                onClick={() => {
                  trackButtonClick('tutorial', { location: 'hero' });
                  trackLinkClick('tutorial', '/tutorial');
                }}
              >
                View Documentation
              </a>
              <a
                href="https://github.com/ma-za-kpe/mosqit"
                className="btn-github"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => {
                  trackButtonClick('github-star', { location: 'hero' });
                  trackSocialClick('github', 'star');
                }}
              >
                <svg width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.012 8.012 0 0 0 16 8c0-4.42-3.58-8-8-8z"/>
                </svg>
                Star on GitHub
              </a>
            </div>

            <div className="hero-stats">
              <div className="stat">
                <span className="stat-number">&lt;100ms</span>
                <span className="stat-label">AI Analysis Time</span>
              </div>
              <div className="stat">
                <span className="stat-number">100%</span>
                <span className="stat-label">On-Device</span>
              </div>
              <div className="stat">
                <span className="stat-number">1.5k+</span>
                <span className="stat-label">GitHub Stars</span>
              </div>
            </div>
          </div>

          <div className="hero-visual">
            <div className="hero-visual-placeholder">
              DevTools Screenshot Preview
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features" id="features-section">
        <div className="section-container">
          <div className="section-header">
            <h2 className="section-title">Powerful Debugging Features</h2>
            <p className="section-subtitle">
              Everything you need to debug frontend issues faster and more effectively
            </p>
          </div>

          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">AI</div>
              <h3 className="feature-title">AI-Powered Analysis</h3>
              <p className="feature-description">
                Leverages Chrome&apos;s built-in Gemini Nano model for intelligent debugging insights—completely on-device for privacy.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">⚡</div>
              <h3 className="feature-title">Instant Response</h3>
              <p className="feature-description">
                Get AI analysis in under 100ms. No network latency, no waiting—instant insights right in DevTools.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">🔒</div>
              <h3 className="feature-title">100% Private</h3>
              <p className="feature-description">
                All processing happens on-device. Your code and logs never leave your machine—perfect for proprietary code.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">🎯</div>
              <h3 className="feature-title">Pattern Detection</h3>
              <p className="feature-description">
                Automatically identifies recurring errors and issues. Track patterns over time to spot systemic problems.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">🌐</div>
              <h3 className="feature-title">Framework-Aware</h3>
              <p className="feature-description">
                Works with React, Vue, Angular, Svelte, or vanilla JavaScript. Auto-detects frameworks and dependencies.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">🐛</div>
              <h3 className="feature-title">Visual Bug Reporter</h3>
              <p className="feature-description">
                Click any element to capture bugs visually with screenshots and full context—then create GitHub issues.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Code Showcase */}
      <section className="code-showcase">
        <div className="section-container">
          <div className="section-header">
            <h2 className="section-title">See Mosqit in Action</h2>
            <p className="section-subtitle">
              Transform cryptic console errors into actionable insights
            </p>
          </div>

          <div className="code-comparison">
            <div className="code-panel">
              <div className="code-panel-header">
                <span className="code-label">Standard Console</span>
              </div>
              <div className="code-block">{`Uncaught TypeError: Cannot read property 'name' of null
  at UserProfile.js:42:15
  at processComponent (react-dom.js:123:8)
  at beginWork (react-dom.js:456:12)`}</div>
            </div>

            <div className="code-panel code-panel-enhanced">
              <div className="code-panel-header">
                <span className="code-label">Mosqit DevTools Panel</span>
                <span className="badge-ai">AI-Enhanced</span>
              </div>
              <div className="code-block">{`[11:03:02 PM] ERROR  UserProfile.js:42:15
Cannot read property 'name' of null

AI Analysis:
The variable 'user' is null when accessing the
'name' property. This likely means user data
hasn't loaded yet or wasn't passed correctly
to the component.

Suggested Fix:
Add null check: user?.name or ensure data
loads before render`}</div>
            </div>
          </div>

          <div style={{ textAlign: 'center' }}>
            <a href="/test/test-logger.html" className="btn-primary">
              Try Live Demo
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-container">
          <div className="footer-top">
            <div className="footer-brand">
              <div className="footer-logo">
                <div className="logo-icon">M</div>
                <span>Mosqit</span>
              </div>
              <p className="footer-tagline">
                AI-powered debugging for modern web development
              </p>
            </div>

            <div className="footer-column">
              <h3 className="footer-heading">Product</h3>
              <a href="#features">Features</a>
              <a href="/test/test-logger.html">Demo</a>
              <a href="/tutorial">Documentation</a>
            </div>

            <div className="footer-column">
              <h3 className="footer-heading">Developers</h3>
              <a href="https://github.com/ma-za-kpe/mosqit" target="_blank" rel="noopener noreferrer">GitHub</a>
              <a href="https://github.com/ma-za-kpe/mosqit/issues" target="_blank" rel="noopener noreferrer">Report Issues</a>
              <a href="https://github.com/ma-za-kpe/mosqit/discussions" target="_blank" rel="noopener noreferrer">Discussions</a>
            </div>

            <div className="footer-column">
              <h3 className="footer-heading">Resources</h3>
              <a href="https://developer.chrome.com/docs/ai/built-in-apis" target="_blank" rel="noopener noreferrer">Chrome AI Docs</a>
              <a href="https://github.com/ma-za-kpe/mosqit/blob/main/LICENSE" target="_blank" rel="noopener noreferrer">MIT License</a>
              <a href="https://github.com/ma-za-kpe/mosqit/blob/main/PRIVACY.md" target="_blank" rel="noopener noreferrer">Privacy Policy</a>
            </div>
          </div>

          <div className="footer-bottom">
            <p>© 2025 Mosqit. Open source under MIT License.</p>
            <p>Built for Chrome Built-in AI Challenge 2025</p>
          </div>
        </div>
      </footer>
    </>
  );
}
