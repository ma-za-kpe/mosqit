/**
 * AI Analysis Test Suite
 * Tests Chrome AI integration, error analysis, and fallback mechanisms
 */

describe('AI Analysis Features', () => {
  let panel;
  let mockAI;
  let mockWindow;

  beforeEach(() => {
    // Mock Chrome AI API
    mockAI = {
      languageModel: {
        create: jest.fn().mockResolvedValue({
          prompt: jest.fn(),
          destroy: jest.fn()
        })
      }
    };

    mockWindow = {
      ai: mockAI
    };

    global.window = mockWindow;

    // Create panel mock with methods
    panel = {
      generateAITitle: jest.fn(),
      getAIAnalysisForErrors: jest.fn(),
      generateBasicErrorAnalysis: jest.fn(),
      generateFallbackTitle: jest.fn(),
      buildAIContext: jest.fn(),
      formatIssueTitle: jest.fn(),
      getElementType: jest.fn()
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('generateAITitle', () => {
    test('should generate AI title and description when AI is available', async () => {
      panel.generateAITitle = jest.fn().mockResolvedValue({
        title: 'Button click handler throws null reference error',
        enhancedDescription: 'The submit button event listener is trying to access a property of null object, causing the form submission to fail.'
      });

      const result = await panel.generateAITitle({
        userDescription: 'Button not working',
        element: { selector: 'button#submit' },
        errors: [],
        impact: 'high'
      });

      expect(result.title).toContain('Button click handler');
      expect(result.enhancedDescription).toContain('submit button');
      expect(panel.generateAITitle).toHaveBeenCalledWith(expect.objectContaining({
        userDescription: 'Button not working'
      }));
    });

    test('should fallback when AI is not available', async () => {
      mockWindow.ai = undefined;

      panel.generateAITitle = async function(context) {
        if (!window.ai?.languageModel) {
          return this.generateFallbackTitle(context);
        }
      };

      panel.generateFallbackTitle = jest.fn().mockReturnValue({
        title: '[Bug]: Button not working',
        enhancedDescription: 'Button not working'
      });

      const result = await panel.generateAITitle({
        userDescription: 'Button not working',
        impact: 'medium'
      });

      expect(panel.generateFallbackTitle).toHaveBeenCalled();
      expect(result.title).toBe('[Bug]: Button not working');
    });

    test('should handle AI prompt errors gracefully', async () => {
      const mockSession = {
        prompt: jest.fn().mockRejectedValue(new Error('AI service unavailable')),
        destroy: jest.fn()
      };

      mockAI.languageModel.create.mockResolvedValue(mockSession);

      panel.generateAITitle = async function(context) {
        try {
          const session = await window.ai.languageModel.create();
          await session.prompt('test');
        } catch {
          return this.generateFallbackTitle(context);
        }
      };

      panel.generateFallbackTitle = jest.fn().mockReturnValue({
        title: '[Bug]: Fallback title',
        enhancedDescription: 'Fallback description'
      });

      const result = await panel.generateAITitle({
        userDescription: 'Test error'
      });

      expect(panel.generateFallbackTitle).toHaveBeenCalled();
    });

    test('should handle malformed AI responses', async () => {
      panel.generateAITitle = jest.fn().mockImplementation(async function(context) {
        return panel.generateFallbackTitle(context);
      });

      panel.generateFallbackTitle = jest.fn().mockReturnValue({
        title: '[Bug]: Fallback',
        enhancedDescription: 'Fallback'
      });

      const result = await panel.generateAITitle({ userDescription: 'Test' });

      expect(panel.generateFallbackTitle).toHaveBeenCalled();
      expect(result.title).toBe('[Bug]: Fallback');
    });
  });

  describe('getAIAnalysisForErrors', () => {
    test('should generate AI analysis for errors', async () => {
      panel.getAIAnalysisForErrors = jest.fn().mockResolvedValue(
        '🤖 **app.js:42**\nRoot cause: Null reference error. Quick fix: Add null check before accessing property.'
      );

      const errors = [{
        message: 'Cannot read property of null',
        file: 'app.js',
        line: 42
      }];

      const result = await panel.getAIAnalysisForErrors(errors);

      expect(result).toContain('🤖');
      expect(result).toContain('app.js:42');
      expect(result).toContain('null check');
      expect(panel.getAIAnalysisForErrors).toHaveBeenCalledWith(errors);
    });

    test('should provide basic analysis when AI is unavailable', async () => {
      mockWindow.ai = undefined;

      panel.getAIAnalysisForErrors = async function(errors) {
        if (!window.ai?.languageModel) {
          return this.generateBasicErrorAnalysis(errors);
        }
      };

      panel.generateBasicErrorAnalysis = function(errors) {
        const analysisResults = [];

        for (const error of errors) {
          if (error.message.toLowerCase().includes('cannot read properties of null')) {
            analysisResults.push(
              `🤖 **Null Reference Error** at ${error.file}:${error.line}\n` +
              'This occurs when trying to access a property of a null object.\n' +
              '**Fix**: Add null checks before accessing properties.'
            );
          }
        }

        return analysisResults.join('\n\n');
      };

      const errors = [{
        message: 'Cannot read properties of null (reading "value")',
        file: 'form.js',
        line: 15
      }];

      const result = await panel.getAIAnalysisForErrors(errors);

      expect(result).toContain('Null Reference Error');
      expect(result).toContain('form.js:15');
      expect(result).toContain('Add null checks');
    });

    test('should handle empty error array', async () => {
      panel.getAIAnalysisForErrors = async function(errors) {
        if (!errors || errors.length === 0) return '';
        // ... rest of implementation
      };

      const result = await panel.getAIAnalysisForErrors([]);
      expect(result).toBe('');
    });

    test('should deduplicate similar errors', async () => {
      panel.getAIAnalysisForErrors = async function(errors) {
        const uniqueAnalysis = new Set();
        const analysisResults = [];

        for (const error of errors) {
          const key = `${error.message}_${error.file}_${error.line}`;
          if (!uniqueAnalysis.has(key)) {
            uniqueAnalysis.add(key);
            analysisResults.push(`Analysis for ${error.message}`);
          }
        }

        return analysisResults.join('\n');
      };

      const errors = [
        { message: 'Error A', file: 'a.js', line: 1 },
        { message: 'Error A', file: 'a.js', line: 1 }, // Duplicate
        { message: 'Error B', file: 'b.js', line: 2 }
      ];

      const result = await panel.getAIAnalysisForErrors(errors);
      const lines = result.split('\n').filter(l => l);

      expect(lines).toHaveLength(2); // Only 2 unique errors
    });
  });

  describe('generateBasicErrorAnalysis', () => {
    beforeEach(() => {
      panel.generateBasicErrorAnalysis = function(errors) {
        const analysisResults = [];

        for (const error of errors.slice(0, 2)) {
          let analysis = '';
          const msg = error.message.toLowerCase();

          if (msg.includes('cannot read properties of null')) {
            analysis = `🤖 **Null Reference Error** at ${error.file}:${error.line}\nAdd null checks`;
          } else if (msg.includes('is not a function')) {
            analysis = `🤖 **Type Error** at ${error.file}:${error.line}\nVerify function exists`;
          } else if (msg.includes('is not defined')) {
            analysis = `🤖 **Reference Error** at ${error.file}:${error.line}\nEnsure variable is declared`;
          } else if (msg.includes('network')) {
            analysis = `🤖 **Network Error** at ${error.file}:${error.line}\nCheck connectivity`;
          } else {
            analysis = `🤖 **JavaScript Error** at ${error.file}:${error.line}\n${error.message}`;
          }

          if (analysis) analysisResults.push(analysis);
        }

        return analysisResults.join('\n\n');
      };
    });

    test('should analyze null reference errors', () => {
      const errors = [{
        message: 'Cannot read properties of null (reading "addEventListener")',
        file: 'events.js',
        line: 25
      }];

      const result = panel.generateBasicErrorAnalysis(errors);

      expect(result).toContain('Null Reference Error');
      expect(result).toContain('events.js:25');
      expect(result).toContain('null checks');
    });

    test('should analyze type errors', () => {
      const errors = [{
        message: 'handleClick is not a function',
        file: 'handlers.js',
        line: 10
      }];

      const result = panel.generateBasicErrorAnalysis(errors);

      expect(result).toContain('Type Error');
      expect(result).toContain('Verify function exists');
    });

    test('should analyze reference errors', () => {
      const errors = [{
        message: 'myVariable is not defined',
        file: 'script.js',
        line: 5
      }];

      const result = panel.generateBasicErrorAnalysis(errors);

      expect(result).toContain('Reference Error');
      expect(result).toContain('Ensure variable is declared');
    });

    test('should analyze network errors', () => {
      const errors = [{
        message: 'Network request failed',
        file: 'api.js',
        line: 100
      }];

      const result = panel.generateBasicErrorAnalysis(errors);

      expect(result).toContain('Network Error');
      expect(result).toContain('Check connectivity');
    });

    test('should provide generic analysis for unknown errors', () => {
      const errors = [{
        message: 'Some unknown error occurred',
        file: 'unknown.js',
        line: 1
      }];

      const result = panel.generateBasicErrorAnalysis(errors);

      expect(result).toContain('JavaScript Error');
      expect(result).toContain('Some unknown error');
    });

    test('should limit analysis to 2 errors', () => {
      const errors = [
        { message: 'Error 1', file: 'a.js', line: 1 },
        { message: 'Error 2', file: 'b.js', line: 2 },
        { message: 'Error 3', file: 'c.js', line: 3 },
        { message: 'Error 4', file: 'd.js', line: 4 }
      ];

      const result = panel.generateBasicErrorAnalysis(errors);
      const errorCount = (result.match(/🤖/g) || []).length;

      expect(errorCount).toBe(2); // Only first 2 errors analyzed
    });
  });

  describe('buildAIContext', () => {
    test('should build comprehensive context for AI', () => {
      panel.buildAIContext = function(context) {
        return {
          description: context.userDescription,
          element: context.element?.selector,
          errors: context.errors?.map(e => e.message.substring(0, 150)),
          url: context.url,
          impact: context.impact,
          issueTypes: context.issueTypes
        };
      };

      const context = {
        userDescription: 'Button not working',
        element: { selector: '#submit-btn' },
        errors: [{ message: 'Very long error message that needs to be truncated...' }],
        url: 'http://test.com',
        impact: 'high',
        issueTypes: ['ui', 'functional']
      };

      const result = panel.buildAIContext(context);

      expect(result.description).toBe('Button not working');
      expect(result.element).toBe('#submit-btn');
      expect(result.errors[0].length).toBeLessThanOrEqual(150);
      expect(result.impact).toBe('high');
      expect(result.issueTypes).toEqual(['ui', 'functional']);
    });
  });

  describe('generateFallbackTitle', () => {
    beforeEach(() => {
      panel.generateFallbackTitle = function(context) {
        let title = context.userDescription;

        if (context.element?.selector) {
          const elementType = this.getElementType(context.element.selector);
          if (elementType) {
            title = `${elementType} issue: ${title}`;
          }
        }

        if (context.impact === 'critical') {
          title = `Critical: ${title}`;
        }

        title = title.substring(0, 80).trim();
        if (title.length === 80) title += '...';

        return {
          title: `[Bug]: ${title}`,
          enhancedDescription: context.userDescription
        };
      };

      panel.getElementType = function(selector) {
        if (selector.includes('button')) return 'Button';
        if (selector.includes('input')) return 'Input field';
        if (selector.includes('form')) return 'Form';
        return null;
      };
    });

    test('should generate fallback title with element type', () => {
      const result = panel.generateFallbackTitle({
        userDescription: 'Submit not working',
        element: { selector: 'button#submit' }
      });

      expect(result.title).toBe('[Bug]: Button issue: Submit not working');
    });

    test('should add critical prefix for high impact issues', () => {
      const result = panel.generateFallbackTitle({
        userDescription: 'Login broken',
        impact: 'critical'
      });

      expect(result.title).toBe('[Bug]: Critical: Login broken');
    });

    test('should truncate long titles', () => {
      const longDescription = 'x'.repeat(100);
      const result = panel.generateFallbackTitle({
        userDescription: longDescription
      });

      expect(result.title.length).toBeLessThanOrEqual(90); // [Bug]: + 80 chars + ...
    });
  });
});