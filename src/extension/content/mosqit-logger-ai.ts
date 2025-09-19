/**
 * Mosqit Logger - Enhanced with Chrome AI (Writer API)
 * Logcat-inspired debugging with real AI analysis
 */

interface LogMetadata {
  message: string;
  level: 'log' | 'error' | 'warn' | 'info' | 'debug';
  severity: 'log' | 'error' | 'warn';
  timestamp: number;
  file?: string;
  line?: number;
  column?: number;
  stack?: string;
  dependencies?: string[];
  domNode?: {
    tag: string;
    id?: string;
    classes?: string[];
    attributes?: Record<string, string>;
    xpath?: string;
    class?: string;
    html?: string;
  };
  url: string;
  userAgent: string;
  analysis?: string; // AI-generated analysis
  patterns?: string[]; // Recurring patterns detected
}

declare const Writer: unknown;
declare const self: Window & { ai?: unknown };

class MosqitLoggerAI {
  private originalConsole = {
    log: console.log,
    error: console.error,
    warn: console.warn,
    info: console.info,
    debug: console.debug,
  };

  private logs: LogMetadata[] = [];
  private maxLogs = 1000;
  private enabled = true;
  private aiAvailable = false;
  private writerSession: unknown = null;
  private errorPatterns = new Map<string, number>();

  constructor() {
    this.init();
  }

  private async init() {
    this.overrideConsoleMethods();
    this.setupErrorListener();
    this.setupDOMListener();
    await this.initializeAI();
  }

  private async initializeAI() {
    // Check for Writer API (EPP feature, best for structured output)
    if (typeof Writer !== 'undefined') {
      try {
        const availability = await Writer.availability({ outputLanguage: 'en' });

        if (availability === 'available') {
          this.writerSession = await Writer.create({
            outputLanguage: 'en',
            tone: 'neutral',
            format: 'plain-text',
            length: 'short',
            sharedContext: 'You are Mosqit, a debugging assistant. Analyze JavaScript errors with Logcat-style precision. Be concise and specific.'
          });

          this.aiAvailable = true;
          console.info('[Mosqit] ✅ Chrome Writer API ready - AI-powered analysis enabled!');
        } else if (availability === 'downloadable') {
          console.info('[Mosqit] 📥 Chrome AI model available for download (2GB)');
          // Could trigger download here if desired
        } else {
          console.info('[Mosqit] ⏳ Chrome AI model downloading or not available');
        }
      } catch (error) {
        console.warn('[Mosqit] Writer API check failed:', error);
      }
    }

    // Fallback to Prompt API if available
    if (!this.aiAvailable && 'ai' in self && self.ai?.languageModel) {
      try {
        const capabilities = await self.ai.languageModel.capabilities();
        if (capabilities.available === 'readily') {
          this.aiAvailable = true;
          console.info('[Mosqit] ✅ Chrome Prompt API ready - AI analysis enabled');
        }
      } catch (error) {
        console.warn('[Mosqit] Prompt API check failed:', error);
      }
    }

    if (!this.aiAvailable) {
      console.info('[Mosqit] 🔧 Using Logcat-inspired fallback analysis (no AI)');
    }
  }

  private overrideConsoleMethods() {
    const methods = ['log', 'error', 'warn', 'info', 'debug'] as const;

    methods.forEach(method => {
      const original = this.originalConsole[method];

      (console as Record<string, unknown>)[method] = async (...args: unknown[]) => {
        if (this.enabled) {
          const metadata = await this.captureMetadata(method, args);

          // Perform AI analysis for errors and warnings
          if ((method === 'error' || method === 'warn')) {
            metadata.analysis = await this.performAIAnalysis(metadata);
          }

          this.storelog(metadata);
          this.sendToExtension(metadata);
        }

        // Call original method
        original.apply(console, args);
      };
    });
  }

  private async performAIAnalysis(metadata: LogMetadata): Promise<string> {
    // Try Writer API first (best for structured output)
    if (this.writerSession) {
      try {
        const prompt = `Analyze this error and provide: 1) Error type 2) Root cause 3) Fix suggestion.
Error: ${metadata.message}
File: ${metadata.file || 'unknown'}:${metadata.line || '?'}
Component: ${metadata.domNode ? `<${metadata.domNode.tag}>` : 'unknown'}`;

        const response = await this.writerSession.write(prompt, {
          context: `Stack trace: ${metadata.stack?.substring(0, 200) || 'none'}`
        });

        // Format for Logcat-style output
        return this.formatAIResponse(response, metadata);
      } catch (error) {
        console.debug('[Mosqit] Writer API analysis failed:', error);
      }
    }

    // Try Prompt API as fallback
    if (this.aiAvailable && self.ai?.languageModel) {
      try {
        const session = await self.ai.languageModel.create({
          systemPrompt: 'You are a debugging assistant. Analyze errors with Logcat precision. Be concise.'
        });

        const prompt = `Analyze: ${metadata.message} at ${metadata.file}:${metadata.line}`;
        const response = await session.prompt(prompt);
        session.destroy();

        return this.formatAIResponse(response, metadata);
      } catch (error) {
        console.debug('[Mosqit] Prompt API analysis failed:', error);
      }
    }

    // Fallback to pattern-based analysis
    return this.generateFallbackAnalysis(metadata);
  }

  private formatAIResponse(response: string, metadata: LogMetadata): string {
    // Ensure response is concise and Logcat-styled
    if (!response || response.length < 10) {
      return this.generateFallbackAnalysis(metadata);
    }

    // Clean and format
    const formatted = response
      .replace(/\n+/g, ' ')
      .replace(/\s+/g, ' ')
      .substring(0, 200) // Logcat-style brevity
      .trim();

    // Add severity indicator
    const severity = metadata.level === 'error' ? '🔴' : '🟡';
    return `${severity} ${formatted}`;
  }

  private generateFallbackAnalysis(metadata: LogMetadata): string {
    const errorType = this.extractErrorType(metadata.message);
    const file = metadata.file ? `${metadata.file}:${metadata.line}` : 'unknown';

    // Logcat-inspired analysis patterns
    const patterns: Record<string, string> = {
      'TypeError.*null': `🔴 NullPointer at ${file}. Check object initialization before access.`,
      'TypeError.*undefined': `🔴 Undefined access at ${file}. Verify variable exists.`,
      'ReferenceError': `🔴 Reference error at ${file}. Check imports and declarations.`,
      'SyntaxError': `🔴 Syntax error at ${file}. Check brackets and semicolons.`,
      'NetworkError|fetch': `🔴 Network failure at ${file}. Check API endpoint and CORS.`,
      'Promise.*rejection': `🟡 Unhandled promise at ${file}. Add .catch() handler.`,
    };

    for (const [pattern, analysis] of Object.entries(patterns)) {
      if (new RegExp(pattern, 'i').test(metadata.message)) {
        return analysis;
      }
    }

    // Generic fallback
    return `🟡 ${errorType} at ${file}. Check stack trace for details.`;
  }

  private async captureMetadata(level: string, args: unknown[]): Promise<LogMetadata> {
    const stack = this.captureStack();
    const { file, line, column } = this.parseStack(stack);
    const domNode = this.captureCurrentDOMNode();

    const metadata: LogMetadata = {
      message: this.formatMessage(args),
      level: level as LogMetadata['level'],
      severity: this.mapLevelToSeverity(level),
      timestamp: Date.now(),
      file,
      line,
      column,
      stack,
      dependencies: this.extractDependencies(),
      domNode: domNode ? {
        ...domNode,
        class: domNode.classes?.join(' '),
        html: this.getElementHTML(domNode)
      } : undefined,
      url: window.location.href,
      userAgent: navigator.userAgent,
    };

    // Track error patterns
    if (level === 'error' && file) {
      const errorKey = `${file}:${line}:${this.extractErrorType(metadata.message)}`;
      this.errorPatterns.set(errorKey, (this.errorPatterns.get(errorKey) || 0) + 1);

      if (this.errorPatterns.get(errorKey)! > 2) {
        metadata.patterns = [`🔄 Recurring error (${this.errorPatterns.get(errorKey)}x) at ${file}:${line}`];
      }
    }

    return metadata;
  }

  private extractErrorType(message: string): string {
    const match = message.match(/^(\w+Error|TypeError|ReferenceError|SyntaxError|RangeError):/);
    return match ? match[1] : 'Error';
  }

  private mapLevelToSeverity(level: string): LogMetadata['severity'] {
    if (level === 'error') return 'error';
    if (level === 'warn') return 'warn';
    return 'log';
  }

  private formatMessage(args: unknown[]): string {
    return args.map(arg => {
      if (typeof arg === 'object') {
        try {
          return JSON.stringify(arg, null, 2);
        } catch {
          return String(arg);
        }
      }
      return String(arg);
    }).join(' ');
  }

  private captureStack(): string {
    const error = new Error();
    return error.stack || '';
  }

  private parseStack(stack: string): { file?: string; line?: number; column?: number } {
    const stackLines = stack.split('\n');

    for (let i = 3; i < stackLines.length; i++) {
      const line = stackLines[i];
      const match = line.match(/at\s+(?:.*?\s+)?\(?(.+):(\d+):(\d+)\)?/);

      if (match && !match[1].includes('mosqit-logger')) {
        return {
          file: this.cleanFilePath(match[1]),
          line: parseInt(match[2], 10),
          column: parseInt(match[3], 10),
        };
      }
    }

    return {};
  }

  private cleanFilePath(path: string): string {
    try {
      const url = new URL(path);
      const pathname = url.pathname;
      const srcIndex = pathname.indexOf('/src/');
      if (srcIndex !== -1) {
        return pathname.substring(srcIndex + 1);
      }
      return pathname.startsWith('/') ? pathname.substring(1) : pathname;
    } catch {
      return path;
    }
  }

  private extractDependencies(): string[] {
    const deps: string[] = [];
    const globals = [
      { name: 'React', pkg: 'react' },
      { name: 'Vue', pkg: 'vue' },
      { name: 'angular', pkg: 'angular' },
      { name: 'jQuery', pkg: 'jquery' },
    ];

    globals.forEach(({ name, pkg }) => {
      const global = (window as Record<string, unknown>)[name] as { version?: string; VERSION?: string } | undefined;
      if (global) {
        const version = global.version || global.VERSION || '';
        deps.push(version ? `${pkg}@${version}` : pkg);
      }
    });

    return [...new Set(deps)];
  }

  private captureCurrentDOMNode() {
    const activeElement = document.activeElement;
    const hoveredElement = document.querySelector(':hover');
    const element = hoveredElement || activeElement;

    if (!element || element === document.body) return undefined;

    return {
      tag: element.tagName.toLowerCase(),
      id: element.id || undefined,
      classes: element.className ? element.className.split(' ').filter(Boolean) : [],
      attributes: this.getElementAttributes(element),
      xpath: this.getXPath(element),
    };
  }

  private getElementAttributes(element: Element): Record<string, string> {
    const attrs: Record<string, string> = {};
    Array.from(element.attributes).forEach(attr => {
      if (!['class', 'id', 'style'].includes(attr.name)) {
        attrs[attr.name] = attr.value;
      }
    });
    return attrs;
  }

  private getElementHTML(domNode: ReturnType<typeof this.captureCurrentDOMNode>): string | undefined {
    if (!domNode) return undefined;
    const attrs = domNode.id ? ` id="${domNode.id}"` : '';
    const classes = domNode.classes?.length ? ` class="${domNode.classes.join(' ')}"` : '';
    return `<${domNode.tag}${attrs}${classes}>`;
  }

  private getXPath(element: Element): string {
    const segments: string[] = [];

    while (element && element.nodeType === Node.ELEMENT_NODE) {
      let index = 0;
      const siblings = element.parentNode ? Array.from(element.parentNode.children) : [];

      for (let i = 0; i < siblings.length; i++) {
        if (siblings[i].tagName === element.tagName) index++;
        if (siblings[i] === element) break;
      }

      const tagName = element.tagName.toLowerCase();
      const segment = index > 1 ? `${tagName}[${index}]` : tagName;
      segments.unshift(segment);

      element = element.parentElement as Element;
    }

    return `/${segments.join('/')}`;
  }

  private setupErrorListener() {
    window.addEventListener('error', async (event) => {
      const metadata: LogMetadata = {
        message: event.message,
        level: 'error',
        severity: 'error',
        timestamp: Date.now(),
        file: this.cleanFilePath(event.filename || ''),
        line: event.lineno,
        column: event.colno,
        stack: event.error?.stack,
        dependencies: this.extractDependencies(),
        domNode: this.captureCurrentDOMNode(),
        url: window.location.href,
        userAgent: navigator.userAgent,
      };

      // AI analysis for window errors
      metadata.analysis = await this.performAIAnalysis(metadata);

      this.storelog(metadata);
      this.sendToExtension(metadata);
    });

    window.addEventListener('unhandledrejection', async (event) => {
      const metadata: LogMetadata = {
        message: `Unhandled Promise Rejection: ${event.reason}`,
        level: 'error',
        severity: 'error',
        timestamp: Date.now(),
        stack: event.reason?.stack,
        dependencies: this.extractDependencies(),
        domNode: this.captureCurrentDOMNode(),
        url: window.location.href,
        userAgent: navigator.userAgent,
      };

      metadata.analysis = await this.performAIAnalysis(metadata);

      this.storelog(metadata);
      this.sendToExtension(metadata);
    });
  }

  private setupDOMListener() {
    document.addEventListener('click', (event) => {
      const target = event.target as Element;
      if (target) {
        (window as Record<string, unknown>).__mosqit_last_clicked = {
          tag: target.tagName.toLowerCase(),
          id: target.id,
          classes: target.className,
          xpath: this.getXPath(target),
        };
      }
    }, true);
  }

  private storelog(metadata: LogMetadata) {
    this.logs.push(metadata);

    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    try {
      localStorage.setItem('mosqit_logs', JSON.stringify(this.logs));
    } catch {
      this.logs = this.logs.slice(-100);
    }
  }

  private sendToExtension(metadata: LogMetadata) {
    if (typeof chrome !== 'undefined' && chrome.runtime) {
      try {
        chrome.runtime.sendMessage({
          type: 'MOSQIT_LOG',
          data: metadata,
        });
      } catch {
        // Extension might not be available
      }
    }

    window.dispatchEvent(new CustomEvent('mosqit:log', {
      detail: metadata,
    }));
  }

  public getLogs(): LogMetadata[] {
    return this.logs;
  }

  public clearLogs() {
    this.logs = [];
    this.errorPatterns.clear();
    localStorage.removeItem('mosqit_logs');
  }

  public disable() {
    this.enabled = false;
  }

  public enable() {
    this.enabled = true;
  }

  public getErrorPatterns(): Map<string, number> {
    return this.errorPatterns;
  }

  public async destroy() {
    // Clean up AI sessions
    if (this.writerSession) {
      this.writerSession.destroy();
      this.writerSession = null;
    }
    this.aiAvailable = false;
  }
}

// Initialize logger
const mosqit = new MosqitLoggerAI();

// Export for use in other modules
(window as Record<string, unknown>).mosqit = mosqit;

export default mosqit;