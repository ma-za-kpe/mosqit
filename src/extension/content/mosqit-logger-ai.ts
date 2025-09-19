/* eslint-disable @typescript-eslint/no-explicit-any */
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
    if (typeof Writer !== 'undefined' && Writer !== null) {
      try {
        const availability = await (Writer as any).availability({ outputLanguage: 'en' });

        if (availability === 'available') {
          this.writerSession = await (Writer as any).create({
            outputLanguage: 'en',
            tone: 'neutral',
            format: 'plain-text',
            length: 'short',
            sharedContext: 'You are Mosqit, an intelligent debugging assistant. Analyze any log output, bug, performance issue, warning, or unexpected behavior. Provide actionable insights for debugging. Be concise and specific.'
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
    if (!this.aiAvailable && 'ai' in self && (self.ai as any)?.languageModel) {
      try {
        const capabilities = await (self.ai as any).languageModel.capabilities();
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

      (console as any)[method] = async (...args: unknown[]) => {
        if (this.enabled) {
          const metadata = await this.captureMetadata(method, args);

          // Perform AI analysis for all log types to provide debugging insights
          // AI can help with any debugging output, not just errors
          metadata.analysis = await this.performAIAnalysis(metadata);

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
        const prompt = `Analyze this debugging output and provide insights:

Log Level: ${metadata.level}
Output: ${metadata.message}
Location: ${metadata.file || 'unknown'}:${metadata.line || '?'}
${metadata.domNode ? `UI Element: <${metadata.domNode.tag}${metadata.domNode.id ? ` id="${metadata.domNode.id}"` : ''}>` : ''}

Provide: 1) What's happening 2) Potential issues or root cause 3) Actionable next steps for debugging
Be concise - max 3 sentences.`;

        const response = await (this.writerSession as any).write(prompt, {
          context: `Stack trace: ${metadata.stack?.substring(0, 200) || 'none'}`
        });

        // Format for Logcat-style output
        return this.formatAIResponse(response, metadata);
      } catch (error) {
        console.debug('[Mosqit] Writer API analysis failed:', error);
      }
    }

    // Try Prompt API as fallback
    if (this.aiAvailable && (self.ai as any)?.languageModel) {
      try {
        const session = await (self.ai as any).languageModel.create({
          systemPrompt: 'You are Mosqit, a debugging assistant. Analyze any log output, debug info, warnings, or errors. Provide actionable debugging insights. Be extremely concise.'
        });

        const prompt = `Debug analysis needed:
Level: ${metadata.level}
Message: ${metadata.message}
Location: ${metadata.file}:${metadata.line}

Provide debugging insights in 1-2 sentences.`;
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

    // Comprehensive debugging patterns for various scenarios
    const patterns: Record<string, string> = {
      // JavaScript Errors
      'TypeError.*null|cannot.*null': `🔴 Null reference at ${file}. Add null checks or optional chaining (?.).`,
      'TypeError.*undefined|cannot.*undefined': `🔴 Undefined access at ${file}. Check if variable/property exists first.`,
      'ReferenceError|not defined': `🔴 Missing reference at ${file}. Check imports, typos, or load order.`,
      'SyntaxError|Unexpected token': `🔴 Syntax issue at ${file}. Check brackets, quotes, or semicolons.`,

      // Network & API Issues
      'NetworkError|fetch.*failed|ERR_NETWORK|ERR_INTERNET': `🔴 Network failure at ${file}. Check connectivity, URL, and CORS policy.`,
      '404|Not Found': `🟡 Resource not found at ${file}. Verify URL path and server routes.`,
      '401|403|Unauthorized|Forbidden': `🔴 Auth issue at ${file}. Check credentials or permissions.`,
      '500|502|503|Internal Server': `🔴 Server error at ${file}. Check backend logs and service health.`,
      'timeout|timed out': `🟡 Operation timeout at ${file}. Consider retry logic or longer timeout.`,

      // Async & Promise Issues
      'Promise.*rejection|Unhandled.*rejection': `🟡 Unhandled async error at ${file}. Add .catch() or try/catch with await.`,
      'async|await': `🟡 Async operation at ${file}. Check promise handling and error boundaries.`,

      // Performance & Memory
      'Maximum call stack|stack overflow': `🔴 Stack overflow at ${file}. Check for infinite recursion or loops.`,
      'out of memory|memory leak': `🔴 Memory issue at ${file}. Check for retained references or large data.`,
      'slow|performance|lag': `🟡 Performance concern at ${file}. Profile with DevTools Performance tab.`,

      // DOM & UI Issues
      'DOM|element|querySelector': `🟡 DOM manipulation at ${file}. Ensure element exists before access.`,
      'addEventListener|event': `🟡 Event handling at ${file}. Check event binding and bubbling.`,
      'render|component|React|Vue|Angular': `🟡 UI framework issue at ${file}. Check component lifecycle and state.`,

      // Data & State Issues
      'state|setState|mutation': `🟡 State management at ${file}. Check state updates and immutability.`,
      'localStorage|sessionStorage|cookie': `🟡 Storage operation at ${file}. Check browser support and quotas.`,
      'JSON.parse|parsing|invalid': `🔴 Data parsing error at ${file}. Validate format before parsing.`,

      // Security & Validation
      'security|XSS|injection': `🔴 Security concern at ${file}. Sanitize user input and validate data.`,
      'validation|invalid|required': `🟡 Validation issue at ${file}. Check input constraints and format.`,

      // General Debugging Info
      'console.log|debug|trace': `📘 Debug output at ${file}. Review logged values and execution flow.`,
      'warning|deprecated': `🟡 Warning at ${file}. Update deprecated code or address concern.`,
      'info|notice': `📘 Info logged at ${file}. Note for debugging context.`,
    };

    // Check all patterns
    for (const [pattern, analysis] of Object.entries(patterns)) {
      if (new RegExp(pattern, 'i').test(metadata.message)) {
        return analysis;
      }
    }

    // Smart generic fallback based on log level
    const levelAnalysis: Record<string, string> = {
      'error': `🔴 Error at ${file}. Check stack trace and surrounding code.`,
      'warn': `🟡 Warning at ${file}. Review potential issue before it escalates.`,
      'info': `📘 Info at ${file}. Debugging checkpoint or status update.`,
      'debug': `🔍 Debug at ${file}. Detailed diagnostic information logged.`,
      'log': `📝 Log at ${file}. General output for debugging purposes.`,
    };

    return levelAnalysis[metadata.level] || `📝 ${errorType} at ${file}. Review output and context.`;
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
      const global = (window as any)[name] as { version?: string; VERSION?: string } | undefined;
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
        (window as any).__mosqit_last_clicked = {
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
      (this.writerSession as any).destroy();
      this.writerSession = null;
    }
    this.aiAvailable = false;
  }
}

// Initialize logger
const mosqit = new MosqitLoggerAI();

// Export for use in other modules
(window as any).mosqit = mosqit;

export default mosqit;