/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Mosqit Logger - Chrome AI Integration
 * Uses Chrome's built-in Writer, Rewriter, and Summarizer APIs
 */

// Chrome AI API type declarations
declare global {
  const Writer: {
    availability(): Promise<string>;
    create(options?: {
      tone?: 'formal' | 'neutral' | 'casual';
      format?: 'markdown' | 'plain-text';
      length?: 'short' | 'medium' | 'long';
      sharedContext?: string;
      monitor?: (monitor: {
        addEventListener(event: string, handler: (e: { loaded: number }) => void): void;
      }) => void;
      signal?: AbortSignal;
    }): Promise<{
      write(prompt: string, options?: { context?: string }): Promise<string>;
      writeStreaming(prompt: string, options?: { context?: string }): ReadableStream<string>;
      destroy(): void;
    }>;
  };

  const Rewriter: {
    availability(): Promise<string>;
    create(options?: {
      tone?: 'as-is' | 'more-formal' | 'more-casual';
      format?: 'as-is' | 'markdown' | 'plain-text';
      length?: 'as-is' | 'shorter' | 'longer';
      sharedContext?: string;
      monitor?: (monitor: {
        addEventListener(event: string, handler: (e: { loaded: number }) => void): void;
      }) => void;
      signal?: AbortSignal;
    }): Promise<{
      rewrite(text: string, options?: { context?: string }): Promise<string>;
      rewriteStreaming(text: string, options?: { context?: string }): ReadableStream<string>;
      destroy(): void;
    }>;
  };

  const Summarizer: {
    availability(): Promise<string>;
    create(options?: {
      type?: 'tl;dr' | 'key-points' | 'headline' | 'teaser';
      format?: 'markdown' | 'plain-text';
      length?: 'short' | 'medium' | 'long';
      sharedContext?: string;
      monitor?: (monitor: {
        addEventListener(event: string, handler: (e: { loaded: number }) => void): void;
      }) => void;
      signal?: AbortSignal;
    }): Promise<{
      summarize(text: string, options?: { context?: string }): Promise<string>;
      summarizeStreaming(text: string, options?: { context?: string }): ReadableStream<string>;
      destroy(): void;
    }>;
  };
}

interface LogMetadata {
  message: string;
  level: 'log' | 'error' | 'warn' | 'info' | 'debug';
  timestamp: number;
  file?: string;
  line?: number;
  column?: number;
  stack?: string;
  url: string;
  analysis?: string;
}

interface WriterSession {
  write(prompt: string, options?: { context?: string }): Promise<string>;
  destroy(): void;
}

interface RewriterSession {
  rewrite(text: string, options?: { context?: string }): Promise<string>;
  destroy(): void;
}

interface SummarizerSession {
  summarize(text: string, options?: { context?: string }): Promise<string>;
  destroy(): void;
}

class MosqitChromeAI {
  private writerSession: WriterSession | null = null;
  private rewriterSession: RewriterSession | null = null;
  private summarizerSession: SummarizerSession | null = null;
  private aiAvailable = false;
  private logs: LogMetadata[] = [];
  private maxLogs = 1000;
  private errorPatterns = new Map<string, number>();

  constructor() {
    this.init();
  }

  private async init() {
    console.log('[Mosqit] Initializing Chrome AI integration...');
    await this.initializeAI();
    this.overrideConsoleMethods();
    this.setupErrorListener();
  }

  private async initializeAI() {
    // Check for Writer API (best for bug reports and analysis)
    if (typeof Writer !== 'undefined') {
      try {
        const availability = await Writer.availability();
        console.info('[Mosqit] Writer API availability:', availability);

        if (availability === 'available' || availability === 'downloadable') {
          this.writerSession = await Writer.create({
            tone: 'neutral',
            format: 'plain-text',
            length: 'short',
            sharedContext: 'You are Mosqit, an AI debugging assistant analyzing JavaScript console logs and errors. Provide concise, actionable debugging insights.',
            monitor: (m) => {
              m.addEventListener('downloadprogress', (e: { loaded: number }) => {
                console.log(`[Mosqit] Model download: ${Math.round(e.loaded * 100)}%`);
              });
            }
          });
          this.aiAvailable = true;
          console.info('[Mosqit] ✅ Writer API ready - AI analysis enabled!');
        }
      } catch (error) {
        console.warn('[Mosqit] Writer API initialization failed:', error);
      }
    }

    // Try Summarizer API as fallback
    if (!this.aiAvailable && typeof Summarizer !== 'undefined') {
      try {
        const availability = await Summarizer.availability();
        console.info('[Mosqit] Summarizer API availability:', availability);

        if (availability === 'available' || availability === 'downloadable') {
          this.summarizerSession = await Summarizer.create({
            type: 'tl;dr',
            format: 'plain-text',
            length: 'short',
            sharedContext: 'Debug logs and error messages from a web application',
            monitor: (m) => {
              m.addEventListener('downloadprogress', (e: { loaded: number }) => {
                console.log(`[Mosqit] Model download: ${Math.round(e.loaded * 100)}%`);
              });
            }
          });
          this.aiAvailable = true;
          console.info('[Mosqit] ✅ Summarizer API ready - AI analysis enabled!');
        }
      } catch (error) {
        console.warn('[Mosqit] Summarizer API initialization failed:', error);
      }
    }

    // Try Rewriter API as another fallback
    if (!this.aiAvailable && typeof Rewriter !== 'undefined') {
      try {
        const availability = await Rewriter.availability();
        console.info('[Mosqit] Rewriter API availability:', availability);

        if (availability === 'available' || availability === 'downloadable') {
          this.rewriterSession = await Rewriter.create({
            tone: 'more-formal',
            format: 'plain-text',
            length: 'shorter',
            sharedContext: 'Technical error messages and debugging output',
            monitor: (m) => {
              m.addEventListener('downloadprogress', (e: { loaded: number }) => {
                console.log(`[Mosqit] Model download: ${Math.round(e.loaded * 100)}%`);
              });
            }
          });
          this.aiAvailable = true;
          console.info('[Mosqit] ✅ Rewriter API ready - AI analysis enabled!');
        }
      } catch (error) {
        console.warn('[Mosqit] Rewriter API initialization failed:', error);
      }
    }

    if (!this.aiAvailable) {
      console.info('[Mosqit] ⚠️ Chrome AI not detected - Using Logcat-inspired fallback');
      console.info('[Mosqit] To enable AI: Chrome 128+ with flags enabled');
      console.info('[Mosqit] Check chrome://flags → "optimization-guide-on-device-model"');
    }
  }

  private overrideConsoleMethods() {
    const originalConsole = {
      log: console.log,
      error: console.error,
      warn: console.warn,
      info: console.info,
      debug: console.debug,
    };

    const methods = ['log', 'error', 'warn', 'info', 'debug'] as const;

    methods.forEach(method => {
      const original = originalConsole[method];

      (console as any)[method] = async (...args: any[]) => {
        // Capture metadata
        const metadata = await this.captureMetadata(method, args);

        // Perform AI analysis
        if (this.aiAvailable) {
          metadata.analysis = await this.performAIAnalysis(metadata);
        } else {
          metadata.analysis = this.generateFallbackAnalysis(metadata);
        }

        // Store log
        this.storeLog(metadata);

        // Send to extension
        this.sendToExtension(metadata);

        // Call original console method
        original.apply(console, args);
      };
    });
  }

  private async captureMetadata(level: string, args: any[]): Promise<LogMetadata> {
    const message = args.map(arg => {
      if (typeof arg === 'object') {
        try {
          return JSON.stringify(arg, null, 2);
        } catch {
          return String(arg);
        }
      }
      return String(arg);
    }).join(' ');

    // Extract stack trace for file/line info
    const stack = new Error().stack || '';
    const stackLines = stack.split('\n');
    const callerLine = stackLines[3] || '';
    const match = callerLine.match(/\(([^:)]+):(\d+):(\d+)\)/) ||
                  callerLine.match(/at\s+([^:]+):(\d+):(\d+)/);

    return {
      message,
      level: level as any,
      timestamp: Date.now(),
      file: match ? match[1] : undefined,
      line: match ? parseInt(match[2]) : undefined,
      column: match ? parseInt(match[3]) : undefined,
      stack: level === 'error' ? stack : undefined,
      url: window.location.href
    };
  }

  private async performAIAnalysis(metadata: LogMetadata): Promise<string> {
    const prompt = `Analyze this ${metadata.level} from ${metadata.file || 'unknown'}:${metadata.line || '?'}:
"${metadata.message}"

Provide: 1) What's happening 2) Likely cause 3) How to fix (max 2 sentences total)`;

    try {
      // Try Writer API first
      if (this.writerSession) {
        const response = await this.writerSession.write(prompt, {
          context: metadata.stack ? `Stack: ${metadata.stack.substring(0, 200)}` : undefined
        });
        return this.formatResponse(response, metadata);
      }

      // Try Summarizer API
      if (this.summarizerSession) {
        const errorContext = `${metadata.level.toUpperCase()}: ${metadata.message} at ${metadata.file}:${metadata.line}. ${metadata.stack || 'No stack trace.'}`;
        const response = await this.summarizerSession.summarize(errorContext, {
          context: 'Provide debugging analysis'
        });
        return this.formatResponse(response, metadata);
      }

      // Try Rewriter API
      if (this.rewriterSession) {
        const technicalError = `${metadata.level}: ${metadata.message}`;
        const response = await this.rewriterSession.rewrite(technicalError, {
          context: 'Explain this error and suggest a fix'
        });
        return this.formatResponse(response, metadata);
      }
    } catch (error) {
      console.debug('[Mosqit] AI analysis failed:', error);
    }

    return this.generateFallbackAnalysis(metadata);
  }

  private formatResponse(response: string, metadata: LogMetadata): string {
    if (!response || response.length < 10) {
      return this.generateFallbackAnalysis(metadata);
    }

    // Clean and format for Logcat-style output
    const formatted = response
      .replace(/\n+/g, ' ')
      .replace(/\s+/g, ' ')
      .substring(0, 200)
      .trim();

    const indicator = metadata.level === 'error' ? '🔴' :
                     metadata.level === 'warn' ? '🟡' : '🔵';

    return `${indicator} ${formatted}`;
  }

  private generateFallbackAnalysis(metadata: LogMetadata): string {
    const patterns: Record<string, string> = {
      'null|undefined': '🔴 Null/undefined reference. Add optional chaining (?.) or null checks.',
      'not defined|ReferenceError': '🔴 Missing variable/function. Check imports and declarations.',
      'SyntaxError|Unexpected': '🔴 Syntax error. Check brackets, quotes, and semicolons.',
      'TypeError': '🔴 Type mismatch. Verify data types and method availability.',
      'network|fetch|CORS': '🟡 Network issue. Check API endpoints and CORS settings.',
      'timeout': '🟡 Operation timeout. Consider retry logic or longer timeout.',
      'permission|denied': '🔴 Permission denied. Check user permissions or API keys.',
      'deprecated': '🟡 Using deprecated API. Update to modern alternative.',
      'memory|heap': '🟡 Memory issue. Check for memory leaks or large objects.',
      'async|await|Promise': '🔵 Async operation. Ensure proper await/then handling.'
    };

    for (const [pattern, analysis] of Object.entries(patterns)) {
      if (new RegExp(pattern, 'i').test(metadata.message)) {
        return analysis;
      }
    }

    return `🔵 ${metadata.level} at ${metadata.file || 'unknown'}:${metadata.line || '?'}`;
  }

  private storeLog(metadata: LogMetadata) {
    this.logs.push(metadata);
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }

    // Track error patterns
    if (metadata.level === 'error') {
      const key = `${metadata.file}:${metadata.line}`;
      this.errorPatterns.set(key, (this.errorPatterns.get(key) || 0) + 1);
    }
  }

  private sendToExtension(metadata: LogMetadata) {
    try {
      // Send to background script
      if (typeof chrome !== 'undefined' && chrome.runtime) {
        chrome.runtime.sendMessage({
          type: 'MOSQIT_LOG',
          data: metadata
        }).catch(() => {
          // Extension context not available - silently fail
        });
      }
    } catch {
      // Extension context not available
    }
  }

  private setupErrorListener() {
    window.addEventListener('error', async (event) => {
      const metadata: LogMetadata = {
        message: event.message,
        level: 'error',
        timestamp: Date.now(),
        file: event.filename,
        line: event.lineno,
        column: event.colno,
        stack: event.error?.stack,
        url: window.location.href
      };

      if (this.aiAvailable) {
        metadata.analysis = await this.performAIAnalysis(metadata);
      } else {
        metadata.analysis = this.generateFallbackAnalysis(metadata);
      }

      this.storeLog(metadata);
      this.sendToExtension(metadata);
    });

    window.addEventListener('unhandledrejection', async (event) => {
      const metadata: LogMetadata = {
        message: `Unhandled Promise Rejection: ${event.reason}`,
        level: 'error',
        timestamp: Date.now(),
        url: window.location.href
      };

      if (this.aiAvailable) {
        metadata.analysis = await this.performAIAnalysis(metadata);
      } else {
        metadata.analysis = this.generateFallbackAnalysis(metadata);
      }

      this.storeLog(metadata);
      this.sendToExtension(metadata);
    });
  }

  // Public API for web pages
  public getLogs() {
    return this.logs;
  }

  public getErrorPatterns() {
    return this.errorPatterns;
  }

  public clearLogs() {
    this.logs = [];
    this.errorPatterns.clear();
  }

  public destroy() {
    if (this.writerSession) {
      this.writerSession.destroy();
    }
    if (this.summarizerSession) {
      this.summarizerSession.destroy();
    }
    if (this.rewriterSession) {
      this.rewriterSession.destroy();
    }
  }
}

// Auto-initialize when script loads
if (typeof window !== 'undefined') {
  (window as any).mosqitAI = new MosqitChromeAI();
  console.log('[Mosqit] 🦟 Chrome AI logger initialized');
}