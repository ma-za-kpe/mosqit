/**
 * Mosqit Logger - Enhanced console logging with Logcat-inspired AI analysis
 */

interface LogMetadata {
  message: string;
  level: 'log' | 'warn' | 'error' | 'info' | 'debug';
  severity?: 'log' | 'warn' | 'error'; // Added for compatibility
  timestamp: number;
  file?: string;
  line?: number;
  column?: number;
  stack?: string;
  dependencies?: string[];
  domNode?: {
    tag: string;
    id?: string;
    class?: string; // Single class string for display
    classes?: string[];
    attributes?: Record<string, string>;
    xpath?: string;
    html?: string; // Outer HTML snippet
  };
  url: string;
  userAgent: string;
  analysis?: string; // AI-generated analysis field (Logcat-inspired)
  patterns?: string[]; // Recurring error patterns detected
}

// Future enhancement: structured error analysis
// interface ErrorAnalysis {
//   errorType: string;
//   rootCause: string;
//   suggestedFix: string;
//   relatedComponents: string[];
//   confidence: number;
// }

class MosqitLogger {
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
  private errorPatterns = new Map<string, number>(); // Track error frequency

  constructor() {
    this.init();
  }

  private async init() {
    this.overrideConsoleMethods();
    this.setupErrorListener();
    this.setupDOMListener();
    await this.checkAIAvailability();
  }

  private async checkAIAvailability() {
    // Check if Chrome AI APIs are available
    if ('ai' in self && (self as unknown as Record<string, unknown>).ai) {
      this.aiAvailable = true;
      console.info('[Mosqit] Chrome AI APIs detected - Logcat-inspired analysis enabled');
    } else {
      console.info('[Mosqit] Chrome AI APIs not available - basic logging only');
    }
  }

  private overrideConsoleMethods() {
    type ConsoleMethod = 'log' | 'error' | 'warn' | 'info' | 'debug';
    const methods: ConsoleMethod[] = ['log', 'error', 'warn', 'info', 'debug'];

    methods.forEach(method => {
      const original = this.originalConsole[method];

      (console as unknown as Record<string, unknown>)[method] = async (...args: unknown[]) => {
        if (this.enabled) {
          const metadata = await this.captureMetadata(method, args);

          // Perform AI analysis for errors and warnings
          if (this.aiAvailable && (method === 'error' || method === 'warn')) {
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
        class: domNode.classes?.join(' '), // Single string for display
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
        metadata.patterns = [`Recurring error at ${file}:${line} (${this.errorPatterns.get(errorKey)} occurrences)`];
      }
    }

    return metadata;
  }

  private async performAIAnalysis(metadata: LogMetadata): Promise<string> {
    try {
      // Use Chrome's Prompt API for multimodal analysis
      const ai = (self as unknown as Record<string, unknown>).ai as { languageModel?: { create: () => Promise<{ prompt: (text: string) => Promise<string>; destroy: () => void }> } };
      if (!ai?.languageModel) return '';

      const session = await ai.languageModel.create();

      const prompt = this.buildAnalysisPrompt(metadata);
      const response = await session.prompt(prompt);

      // Clean up session
      session.destroy();

      return this.formatAnalysisResponse(response, metadata);
    } catch (error) {
      console.warn('[Mosqit] AI analysis failed:', error);
      return this.generateFallbackAnalysis(metadata);
    }
  }

  private buildAnalysisPrompt(metadata: LogMetadata): string {
    return `Analyze this frontend error with Logcat-style precision:

    Error: ${metadata.message}
    File: ${metadata.file || 'unknown'}
    Line: ${metadata.line || 'unknown'}
    DOM Context: ${metadata.domNode ? `<${metadata.domNode.tag} class="${metadata.domNode.class}">` : 'none'}
    Dependencies: ${metadata.dependencies?.join(', ') || 'none'}

    Provide:
    1. Error type classification
    2. Root cause (one sentence)
    3. Specific fix suggestion
    4. Related components that might be affected

    Format as: "Error Type: [type]. Root cause: [cause]. Fix: [suggestion]. Check: [components]"
    Keep response under 100 words.`;
  }

  private formatAnalysisResponse(response: string, metadata: LogMetadata): string {
    // Format AI response into structured analysis
    const defaultAnalysis = this.generateFallbackAnalysis(metadata);

    if (!response || response.length < 10) {
      return defaultAnalysis;
    }

    // Clean and format the response
    const formatted = response
      .replace(/\n+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    // Add file/line context if not present in response
    if (metadata.file && !formatted.includes(metadata.file)) {
      return `${formatted} Location: ${metadata.file}:${metadata.line}.`;
    }

    return formatted;
  }

  private generateFallbackAnalysis(metadata: LogMetadata): string {
    const errorType = this.extractErrorType(metadata.message);
    const file = metadata.file ? `${metadata.file}:${metadata.line}` : 'unknown location';

    // Generate contextual analysis based on error patterns
    if (errorType === 'TypeError' && metadata.message.includes('null')) {
      return `Null reference error at ${file}. The object being accessed is null or undefined. Check parent component props or add null checks.`;
    } else if (errorType === 'ReferenceError') {
      return `Undefined variable at ${file}. Variable is not declared or imported. Verify imports and variable declarations.`;
    } else if (errorType === 'SyntaxError') {
      return `Syntax error at ${file}. Check for missing brackets, quotes, or semicolons.`;
    } else if (metadata.domNode) {
      return `UI-related error at ${file}. DOM element <${metadata.domNode.tag}> may have event handler issues. Verify event bindings and props.`;
    }

    return `${errorType} at ${file}. Review the stack trace for details.`;
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

  private getElementHTML(domNode: LogMetadata['domNode']): string | undefined {
    if (!domNode) return undefined;

    // Build a simplified HTML representation
    const attrs = domNode.id ? ` id="${domNode.id}"` : '';
    const classes = domNode.classes?.length ? ` class="${domNode.classes.join(' ')}"` : '';
    return `<${domNode.tag}${attrs}${classes}>`;
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
      // Return a cleaner path like src/components/Button.js
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

    // Check for common global variables with versions if possible
    const globals = [
      { name: 'React', pkg: 'react' },
      { name: 'Vue', pkg: 'vue' },
      { name: 'angular', pkg: 'angular' },
      { name: 'jQuery', pkg: 'jquery' },
    ];

    globals.forEach(({ name, pkg }) => {
      const global = (window as unknown as Record<string, unknown>)[name] as { version?: string; VERSION?: string } | undefined;
      if (global) {
        // Try to get version
        const version = global.version || global.VERSION || '';
        deps.push(version ? `${pkg}@${version}` : pkg);
      }
    });

    // Extract from loaded scripts
    const scripts = document.querySelectorAll('script[src]');
    scripts.forEach(script => {
      const src = script.getAttribute('src');
      if (src?.includes('node_modules')) {
        const match = src.match(/node_modules\/([^\/]+)/);
        if (match) {
          // Try to extract version from URL if present
          const versionMatch = src.match(/@(\d+\.\d+\.\d+)/);
          deps.push(versionMatch ? `${match[1]}@${versionMatch[1]}` : match[1]);
        }
      }
    });

    return [...new Set(deps)];
  }

  private captureCurrentDOMNode(): LogMetadata['domNode'] | undefined {
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

      // Perform AI analysis for window errors
      if (this.aiAvailable) {
        metadata.analysis = await this.performAIAnalysis(metadata);
      }

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

      if (this.aiAvailable) {
        metadata.analysis = await this.performAIAnalysis(metadata);
      }

      this.storelog(metadata);
      this.sendToExtension(metadata);
    });
  }

  private setupDOMListener() {
    document.addEventListener('click', (event) => {
      const target = event.target as Element;
      if (target) {
        (window as unknown as Record<string, unknown>).__mosqit_last_clicked = {
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

  public async analyzePatterns(): Promise<string[]> {
    // Use Summarizer API to identify recurring patterns
    if (!this.aiAvailable) return [];

    try {
      const ai = (self as unknown as Record<string, unknown>).ai as { summarizer?: { create: () => Promise<{ summarize: (text: string) => Promise<string>; destroy: () => void }> } };
      if (!ai?.summarizer) return [];

      const recentErrors = this.logs
        .filter(log => log.level === 'error')
        .slice(-20)
        .map(log => `${log.file}:${log.line} - ${log.message}`)
        .join('\n');

      const session = await ai.summarizer.create();
      const summary = await session.summarize(recentErrors);
      session.destroy();

      return summary.split('\n').filter(Boolean);
    } catch {
      return [];
    }
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
}

// Initialize logger
const mosqit = new MosqitLogger();

// Export for use in other modules
(window as unknown as Record<string, unknown>).mosqit = mosqit;

export default mosqit;