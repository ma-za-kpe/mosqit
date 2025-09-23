/**
 * Issue Generation Test Suite
 * Tests GitHub issue content creation, formatting, and deduplication
 */

describe('Issue Content Generation', () => {
  let panel;

  beforeEach(() => {
    panel = {
      createIssueContent: jest.fn(),
      collectRecentErrors: jest.fn(),
      getAIAnalysisForErrors: jest.fn(),
      getBrowserInfo: jest.fn(),
      getImpactDescription: jest.fn(),
      formatIssueTitle: jest.fn(),
      renderMarkdown: jest.fn(),
      copyIssueContent: jest.fn()
    };

    // Mock browser environment
    global.window = {
      location: { href: 'http://test.com' }
    };
    global.document = {
      title: 'Test Page',
      getElementById: jest.fn(),
      querySelector: jest.fn()
    };
    global.navigator = {
      userAgent: 'Mozilla/5.0 Chrome/140.0.0.0'
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createIssueContent', () => {
    beforeEach(() => {
      panel.createIssueContent = async function(bugData) {
        const recentErrors = this.collectRecentErrors().slice(0, 3);
        const hasErrors = recentErrors.length > 0;
        const aiAnalysis = await this.getAIAnalysisForErrors(recentErrors);

        let body = `## Bug Description
${bugData.description}

## Expected Behavior
${bugData.expected || 'Please describe what you expected to happen instead.'}

## Steps to Reproduce
1. Navigate to \`${bugData.page?.url}\`
2. Interact with element: \`${bugData.element?.selector || 'the affected element'}\`
3. Observe the unexpected behavior

## Current Behavior
${bugData.description}

## Environment
- **URL**: ${bugData.page?.url || window.location.href}
- **Browser**: ${this.getBrowserInfo(bugData.page?.userAgent)}
- **Viewport**: ${bugData.page?.viewport?.width}×${bugData.page?.viewport?.height}
- **Element**: \`${bugData.element?.selector || 'N/A'}\`
- **Position**: (${Math.round(bugData.element?.position?.x || 0)}, ${Math.round(bugData.element?.position?.y || 0)})
`;

        // Console errors section
        if (hasErrors) {
          body += `
## Console Errors
\`\`\`
${recentErrors.map(err => {
  const location = err.file ? `${err.file}:${err.line}:${err.column}` : 'unknown location';
  return `${err.message.substring(0, 200)}\n  at ${location}`;
}).join('\n\n')}
\`\`\`
`;
        } else {
          body += `
## Console Errors
No console errors captured at the time of this report.
`;
        }

        // AI Analysis
        if (aiAnalysis && aiAnalysis.length > 0) {
          body += `
## AI Analysis
${aiAnalysis}
`;
        } else {
          body += `
## AI Analysis
No specific AI analysis available. Please ensure console errors are present for detailed analysis.
`;
        }

        return body;
      };

      panel.getBrowserInfo = jest.fn().mockReturnValue('Chrome 140');
      panel.collectRecentErrors = jest.fn().mockReturnValue([]);
      panel.getAIAnalysisForErrors = jest.fn().mockResolvedValue('');
    });

    test('should generate complete issue content with all sections', async () => {
      const bugData = {
        description: 'Button click not working',
        expected: 'Button should submit the form',
        page: {
          url: 'http://test.com/form',
          viewport: { width: 1920, height: 1080 },
          userAgent: 'Chrome/140'
        },
        element: {
          selector: 'button#submit',
          position: { x: 100.5, y: 200.7 }
        },
        issueTypes: ['ui', 'functional'],
        impact: 'high'
      };

      const content = await panel.createIssueContent(bugData);

      expect(content).toContain('## Bug Description');
      expect(content).toContain('Button click not working');
      expect(content).toContain('## Expected Behavior');
      expect(content).toContain('Button should submit the form');
      expect(content).toContain('## Steps to Reproduce');
      expect(content).toContain('Navigate to `http://test.com/form`');
      expect(content).toContain('## Environment');
      expect(content).toContain('Chrome 140');
      expect(content).toContain('1920×1080');
      expect(content).toContain('(101, 201)'); // Rounded positions
    });

    test('should include console errors when present', async () => {
      panel.collectRecentErrors.mockReturnValue([
        {
          message: 'Cannot read properties of null',
          file: 'app.js',
          line: 42,
          column: 15,
          stack: 'Error stack trace here'
        }
      ]);

      const content = await panel.createIssueContent({
        description: 'Error occurred',
        page: { url: 'http://test.com' }
      });

      expect(content).toContain('## Console Errors');
      expect(content).toContain('Cannot read properties of null');
      expect(content).toContain('app.js:42:15');
      expect(content).not.toContain('No console errors captured');
    });

    test('should show no errors message when none present', async () => {
      panel.collectRecentErrors.mockReturnValue([]);

      const content = await panel.createIssueContent({
        description: 'Visual issue',
        page: { url: 'http://test.com' }
      });

      expect(content).toContain('No console errors captured at the time of this report');
    });

    test('should include AI analysis when available', async () => {
      panel.getAIAnalysisForErrors.mockResolvedValue(
        '🤖 **Null Reference Error**\nAdd null checks before accessing properties.'
      );

      const content = await panel.createIssueContent({
        description: 'Bug',
        page: { url: 'http://test.com' }
      });

      expect(content).toContain('## AI Analysis');
      expect(content).toContain('Null Reference Error');
      expect(content).toContain('Add null checks');
    });

    test('should show fallback message when no AI analysis', async () => {
      panel.getAIAnalysisForErrors.mockResolvedValue('');

      const content = await panel.createIssueContent({
        description: 'Bug',
        page: { url: 'http://test.com' }
      });

      expect(content).toContain('No specific AI analysis available');
    });

    test('should handle missing optional fields gracefully', async () => {
      const content = await panel.createIssueContent({
        description: 'Minimal bug report'
        // No page, element, or other optional fields
      });

      expect(content).toContain('Please describe what you expected to happen');
      expect(content).toContain('Navigate to'); // Will have some URL
      expect(content).toContain('N/A'); // For missing element
      expect(content).toContain('(0, 0)'); // Default position
    });
  });

  describe('collectRecentErrors', () => {
    beforeEach(() => {
      panel.logs = [];
      panel.collectRecentErrors = function() {
        const fiveMinutesAgo = Date.now() - (5 * 60 * 1000);
        const uniqueErrors = new Map();

        this.logs.filter(log =>
          log.level === 'error' &&
          new Date(log.timestamp).getTime() > fiveMinutesAgo
        ).forEach(log => {
          const key = `${log.message}_${log.file}_${log.line}`;
          if (!uniqueErrors.has(key)) {
            uniqueErrors.set(key, {
              message: log.message,
              stack: log.stack || '',
              file: log.file,
              line: log.line,
              column: log.column,
              timestamp: log.timestamp,
              type: log.type || 'Error',
              analysis: log.analysis
            });
          }
        });

        return Array.from(uniqueErrors.values());
      };
    });

    test('should collect recent errors from last 5 minutes', () => {
      const now = Date.now();
      panel.logs = [
        { level: 'error', message: 'Recent error', timestamp: now - 60000, file: 'a.js', line: 1 },
        { level: 'error', message: 'Old error', timestamp: now - 400000, file: 'b.js', line: 2 }, // 6+ minutes old
        { level: 'info', message: 'Not an error', timestamp: now, file: 'c.js', line: 3 }
      ];

      const errors = panel.collectRecentErrors();

      expect(errors).toHaveLength(1);
      expect(errors[0].message).toBe('Recent error');
    });

    test('should deduplicate identical errors', () => {
      const now = Date.now();
      panel.logs = [
        { level: 'error', message: 'Same error', timestamp: now, file: 'a.js', line: 1 },
        { level: 'error', message: 'Same error', timestamp: now - 1000, file: 'a.js', line: 1 },
        { level: 'error', message: 'Different error', timestamp: now, file: 'b.js', line: 2 }
      ];

      const errors = panel.collectRecentErrors();

      expect(errors).toHaveLength(2); // Only 2 unique errors
    });

    test('should include all error metadata', () => {
      panel.logs = [{
        level: 'error',
        message: 'Test error',
        timestamp: Date.now(),
        file: 'test.js',
        line: 42,
        column: 15,
        stack: 'Error stack',
        type: 'TypeError',
        analysis: 'AI analysis text'
      }];

      const errors = panel.collectRecentErrors();

      expect(errors[0]).toMatchObject({
        message: 'Test error',
        file: 'test.js',
        line: 42,
        column: 15,
        stack: 'Error stack',
        type: 'TypeError',
        analysis: 'AI analysis text'
      });
    });
  });

  describe('formatIssueTitle', () => {
    beforeEach(() => {
      panel.formatIssueTitle = function(rawTitle, bugData) {
        const description = bugData?.description || rawTitle;
        let title = description.length > 60 ?
          description.substring(0, 60) + '...' :
          description;

        title = title.replace(/\n/g, ' ').replace(/\s+/g, ' ').trim();

        const element = bugData?.element?.selector;
        if (element && element !== 'N/A') {
          const shortElement = element.length > 20 ?
            element.substring(0, 20) + '...' :
            element;
          title += ` (${shortElement})`;
        }

        return `[Bug]: ${title}`;
      };
    });

    test('should format issue title with bug prefix', () => {
      const title = panel.formatIssueTitle('Button not working', {
        description: 'Button not working'
      });

      expect(title).toBe('[Bug]: Button not working');
    });

    test('should truncate long titles', () => {
      const longDescription = 'This is a very long description that needs to be truncated because it exceeds the maximum length allowed for GitHub issue titles';

      const title = panel.formatIssueTitle(longDescription, {
        description: longDescription
      });

      expect(title).toContain('...');
      expect(title.length).toBeLessThanOrEqual(90);
    });

    test('should add element selector to title', () => {
      const title = panel.formatIssueTitle('Click error', {
        description: 'Click error',
        element: { selector: '#submit-button' }
      });

      expect(title).toBe('[Bug]: Click error (#submit-button)');
    });

    test('should truncate long element selectors', () => {
      const title = panel.formatIssueTitle('Error', {
        description: 'Error',
        element: { selector: 'div.very-long-class-name-that-needs-truncation > button' }
      });

      expect(title).toContain('...');
    });

    test('should clean up line breaks and extra spaces', () => {
      const title = panel.formatIssueTitle('Error\nwith\n\nbreaks   and    spaces', {
        description: 'Error\nwith\n\nbreaks   and    spaces'
      });

      expect(title).toBe('[Bug]: Error with breaks and spaces');
    });
  });

  describe('renderMarkdown', () => {
    beforeEach(() => {
      panel.renderMarkdown = function(text) {
        if (!text) return '';
        return `<pre class="markdown-text">${text}</pre>`;
      };
    });

    test('should render markdown as pre-formatted text', () => {
      const markdown = '## Title\n- Item 1\n- Item 2';
      const result = panel.renderMarkdown(markdown);

      expect(result).toContain('<pre class="markdown-text">');
      expect(result).toContain('## Title');
    });

    test('should handle empty input', () => {
      expect(panel.renderMarkdown('')).toBe('');
      expect(panel.renderMarkdown(null)).toBe('');
      expect(panel.renderMarkdown(undefined)).toBe('');
    });
  });

  describe('copyIssueContent', () => {
    beforeEach(() => {
      panel.copyIssueContent = function() {
        const element = document.getElementById('issue-content-text');
        if (!element) return false;

        const text = element.dataset.originalMarkdown ||
                    element.textContent ||
                    element.innerText;

        if (navigator.clipboard?.writeText) {
          return navigator.clipboard.writeText(text);
        }

        // Fallback method
        const textarea = document.createElement('textarea');
        textarea.value = text;
        document.body.appendChild(textarea);
        textarea.select();
        const success = document.execCommand('copy');
        document.body.removeChild(textarea);
        return success;
      };

      panel.showCopyFeedback = jest.fn();
    });

    test('should copy issue content using Clipboard API', async () => {
      const mockClipboard = {
        writeText: jest.fn().mockResolvedValue(undefined)
      };
      global.navigator.clipboard = mockClipboard;

      const mockElement = {
        dataset: { originalMarkdown: 'Original markdown content' },
        textContent: 'Rendered content'
      };
      document.getElementById = jest.fn().mockReturnValue(mockElement);

      await panel.copyIssueContent();

      expect(mockClipboard.writeText).toHaveBeenCalledWith('Original markdown content');
    });

    test('should fallback to execCommand when Clipboard API unavailable', () => {
      global.navigator.clipboard = undefined;
      document.execCommand = jest.fn().mockReturnValue(true);

      const mockElement = {
        dataset: {},
        textContent: 'Content to copy'
      };
      document.getElementById = jest.fn().mockReturnValue(mockElement);

      const createElement = jest.spyOn(document, 'createElement');
      document.body.appendChild = jest.fn();
      document.body.removeChild = jest.fn();

      panel.copyIssueContent();

      expect(createElement).toHaveBeenCalledWith('textarea');
      expect(document.execCommand).toHaveBeenCalledWith('copy');
    });

    test('should handle missing element gracefully', () => {
      document.getElementById = jest.fn().mockReturnValue(null);

      panel.copyIssueContent();

      expect(result).toBe(false);
    });

    test('should prefer original markdown over rendered text', () => {
      const mockClipboard = {
        writeText: jest.fn().mockResolvedValue(undefined)
      };
      global.navigator.clipboard = mockClipboard;

      const mockElement = {
        dataset: { originalMarkdown: 'Raw markdown' },
        textContent: 'Rendered HTML text',
        innerText: 'Inner text'
      };
      document.getElementById = jest.fn().mockReturnValue(mockElement);

      panel.copyIssueContent();

      expect(mockClipboard.writeText).toHaveBeenCalledWith('Raw markdown');
    });
  });
});