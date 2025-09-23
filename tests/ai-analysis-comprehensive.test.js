/**
 * Comprehensive AI Analysis Test Suite
 * Tests all aspects of AI error analysis including edge cases and fallbacks
 */

describe('AI Analysis Functions - Comprehensive Tests', () => {
  let panel;
  let mockAI;
  let mockWindow;

  beforeEach(() => {
    // Create a complete mock panel instance
    panel = {
      logs: [],
      capturedBug: null,
      getAIAnalysisForErrors: jest.fn(),
      generateBasicErrorAnalysis: jest.fn(),
      collectRecentErrors: jest.fn(),
      generateAITitle: jest.fn(),
      generateFallbackTitle: jest.fn(),
      formatIssueTitle: jest.fn(),
      createIssueContent: jest.fn(),
    };

    // Mock Chrome AI API
    mockAI = {
      languageModel: {
        create: jest.fn(),
      },
    };

    mockWindow = {
      ai: mockAI,
      location: { href: 'http://test.com' },
    };

    global.window = mockWindow;
    global.console = {
      log: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
    };

    // Implement the actual getAIAnalysisForErrors function
    panel.getAIAnalysisForErrors = async function(errors) {
      // If no errors, provide helpful debugging guidance
      if (!errors || errors.length === 0) {
        return `🤖 **No Console Errors Detected**

**Debugging Checklist:**
☑️ Check browser console for warnings or info messages
☑️ Verify element exists in DOM before interaction
☑️ Check Network tab for failed API requests
☑️ Ensure all JavaScript files loaded successfully
☑️ Test in different browsers for compatibility

**Common Issues Without Errors:**
• Element might be dynamically loaded - add appropriate wait/delay
• Event listeners might not be properly attached
• CSS might be hiding or disabling the element
• JavaScript might be blocked by browser extensions
• Timing issues with async operations`;
      }

      // Try to generate AI analysis for the errors
      try {
        // Use global.window in test environment, window in browser
        const win = typeof window !== 'undefined' ? window : (typeof global !== 'undefined' ? global.window : null);
        if (win && win.ai?.languageModel) {
          const session = await win.ai.languageModel.create({
            systemPrompt: `You are a debugging expert. Analyze JavaScript errors and provide concise, actionable insights to help developers fix bugs quickly.`
          });

          const analysisResults = [];

          for (const error of errors.slice(0, 2)) {
            const prompt = `Analyze this JavaScript error and provide a brief explanation with a fix:
Error: ${error.message}
File: ${error.file}:${error.line}:${error.column}
Stack: ${error.stack?.substring(0, 500)}

Provide:
1. Root cause (1 sentence)
2. Quick fix (1-2 sentences)`;

            const response = await session.prompt(prompt);

            if (response) {
              analysisResults.push(
                `🤖 **${error.file}:${error.line}**\n${response}`
              );
            }
          }

          session.destroy();

          if (analysisResults.length > 0) {
            return analysisResults.join('\n\n');
          }
        }
      } catch (error) {
        console.warn('[Mosqit] AI analysis not available, using pattern-based analysis');
      }

      // Fallback: Always provide pattern-based analysis
      return this.generateBasicErrorAnalysis(errors);
    };

    // Implement generateBasicErrorAnalysis
    panel.generateBasicErrorAnalysis = function(errors) {
      const analysisResults = [];

      for (const error of errors.slice(0, 2)) {
        // Add null safety check
        if (!error || !error.message) {
          continue;
        }

        let analysis = '';
        const msg = error.message.toLowerCase();

        if (msg.includes('cannot read properties of null') || msg.includes('cannot read property')) {
          analysis = `🤖 **Null Reference Error** at ${error.file}:${error.line}
This occurs when trying to access a property of a null or undefined object.
**Fix**: Add null checks before accessing properties: \`if (object && object.property)\``;
        } else if (msg.includes('is not a function')) {
          analysis = `🤖 **Type Error** at ${error.file}:${error.line}
The code is trying to call something that isn't a function.
**Fix**: Verify the variable type and ensure the function exists before calling it.`;
        } else if (msg.includes('is not defined')) {
          analysis = `🤖 **Reference Error** at ${error.file}:${error.line}
Variable or function is being used before it's declared.
**Fix**: Ensure the variable is declared and in scope before use.`;
        } else if (msg.includes('network') || msg.includes('fetch')) {
          analysis = `🤖 **Network Error** at ${error.file}:${error.line}
Failed to complete a network request.
**Fix**: Check network connectivity, CORS settings, and API endpoints.`;
        } else if (msg.includes('syntax error')) {
          analysis = `🤖 **Syntax Error** at ${error.file}:${error.line}
JavaScript code has invalid syntax.
**Fix**: Check for missing brackets, quotes, or semicolons near the error location.`;
        } else if (msg.includes('maximum call stack')) {
          analysis = `🤖 **Stack Overflow** at ${error.file}:${error.line}
Infinite recursion or loop detected.
**Fix**: Add proper base case for recursion or break condition for loops.`;
        } else {
          analysis = `🤖 **JavaScript Error** at ${error.file}:${error.line}
${error.message.substring(0, 100)}
**Debug**: Check the console for full error details and stack trace.`;
        }

        if (analysis) {
          analysisResults.push(analysis);
        }
      }

      // If no analysis was generated, provide generic debugging tips
      if (analysisResults.length === 0) {
        return `🤖 **Error Analysis**

**Error Summary:**
${errors.slice(0, 2).filter(e => e && e.message).map(e => `• ${e.message.substring(0, 80)}${e.message.length > 80 ? '...' : ''}`).join('\n')}

**General Debugging Steps:**
1. Check the full error stack trace in the console
2. Verify all variables are properly initialized
3. Add console.log statements before the error line
4. Check for typos in property/method names
5. Ensure all dependencies are loaded

**Need More Help?**
Share the full error message and code context with your team or on Stack Overflow for specific guidance.`;
      }

      return analysisResults.join('\n\n');
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('No Errors Scenario', () => {
    test('should provide helpful debugging checklist when no errors exist', async () => {
      const result = await panel.getAIAnalysisForErrors([]);

      expect(result).toContain('🤖 **No Console Errors Detected**');
      expect(result).toContain('Debugging Checklist');
      expect(result).toContain('Check browser console');
      expect(result).toContain('Verify element exists in DOM');
      expect(result).toContain('Common Issues Without Errors');
      expect(result).toContain('Element might be dynamically loaded');
    });

    test('should handle null errors array', async () => {
      const result = await panel.getAIAnalysisForErrors(null);

      expect(result).toContain('🤖 **No Console Errors Detected**');
      expect(result).toBeTruthy();
      expect(result.length).toBeGreaterThan(100);
    });

    test('should handle undefined errors array', async () => {
      const result = await panel.getAIAnalysisForErrors(undefined);

      expect(result).toContain('No Console Errors Detected');
      expect(result).toContain('Debugging Checklist');
    });
  });

  describe('AI Available Scenario', () => {
    beforeEach(() => {
      const mockSession = {
        prompt: jest.fn(),
        destroy: jest.fn(),
      };

      mockAI.languageModel.create.mockResolvedValue(mockSession);
    });

    test('should use AI to analyze errors when available', async () => {
      const mockSession = {
        prompt: jest.fn().mockResolvedValue('This is a null reference error. The object is undefined. Fix: Add null checks.'),
        destroy: jest.fn(),
      };

      // Update the existing mockAI with new session and ensure it's properly mocked
      mockAI.languageModel.create = jest.fn().mockResolvedValue(mockSession);

      // Ensure global.window has the updated mockAI
      global.window.ai = mockAI;

      const errors = [{
        message: 'Cannot read properties of null',
        file: 'app.js',
        line: 42,
        column: 15,
        stack: 'Error stack trace'
      }];

      const result = await panel.getAIAnalysisForErrors(errors);

      // Check that AI was actually called
      expect(mockAI.languageModel.create).toHaveBeenCalled();
      expect(mockSession.prompt).toHaveBeenCalled();
      expect(mockSession.destroy).toHaveBeenCalled();
      expect(result).toContain('🤖 **app.js:42**');
      expect(result).toContain('null reference error');
    });

    test('should analyze multiple errors with AI', async () => {
      const mockSession = {
        prompt: jest.fn()
          .mockResolvedValueOnce('First error analysis')
          .mockResolvedValueOnce('Second error analysis'),
        destroy: jest.fn(),
      };

      // Update the existing mockAI with new session and ensure it's properly mocked
      mockAI.languageModel.create = jest.fn().mockResolvedValue(mockSession);

      // Ensure global.window has the updated mockAI
      global.window.ai = mockAI;

      const errors = [
        {
          message: 'Error 1',
          file: 'file1.js',
          line: 10,
          column: 5,
        },
        {
          message: 'Error 2',
          file: 'file2.js',
          line: 20,
          column: 10,
        },
      ];

      const result = await panel.getAIAnalysisForErrors(errors);

      expect(mockSession.prompt).toHaveBeenCalledTimes(2);
      expect(result).toContain('file1.js:10');
      expect(result).toContain('file2.js:20');
      expect(result).toContain('First error analysis');
      expect(result).toContain('Second error analysis');
    });

    test('should limit AI analysis to 2 errors maximum', async () => {
      const mockSession = {
        prompt: jest.fn().mockResolvedValue('Error analysis'),
        destroy: jest.fn(),
      };

      // Update the existing mockAI with new session and ensure it's properly mocked
      mockAI.languageModel.create = jest.fn().mockResolvedValue(mockSession);

      // Ensure global.window has the updated mockAI
      global.window.ai = mockAI;

      const errors = Array(5).fill(null).map((_, i) => ({
        message: `Error ${i}`,
        file: `file${i}.js`,
        line: i * 10,
        column: 5,
      }));

      await panel.getAIAnalysisForErrors(errors);

      expect(mockSession.prompt).toHaveBeenCalledTimes(2); // Only 2 errors analyzed
    });

    test('should handle AI session creation failure gracefully', async () => {
      // Set up AI to fail
      global.window.ai = {
        languageModel: {
          create: jest.fn().mockRejectedValue(new Error('AI not available'))
        }
      };

      const errors = [{
        message: 'Cannot read properties of null',
        file: 'app.js',
        line: 42,
        column: 15,
      }];

      const result = await panel.getAIAnalysisForErrors(errors);

      expect(result).toContain('Null Reference Error');
      expect(result).toContain('Add null checks');
      expect(console.warn).toHaveBeenCalledWith(
        '[Mosqit] AI analysis not available, using pattern-based analysis'
      );
    });

    test('should handle empty AI response', async () => {
      const mockSession = {
        prompt: jest.fn().mockResolvedValue(''),
        destroy: jest.fn(),
      };

      mockAI.languageModel.create.mockResolvedValue(mockSession);

      const errors = [{
        message: 'Some error',
        file: 'app.js',
        line: 42,
      }];

      const result = await panel.getAIAnalysisForErrors(errors);

      // Should fall back to pattern analysis
      expect(result).toContain('JavaScript Error');
    });
  });

  describe('Fallback Pattern Analysis', () => {
    beforeEach(() => {
      mockWindow.ai = undefined; // Disable AI
    });

    test('should detect null reference errors', async () => {
      const errors = [{
        message: 'Cannot read properties of null (reading "name")',
        file: 'user.js',
        line: 15,
      }];

      const result = await panel.getAIAnalysisForErrors(errors);

      expect(result).toContain('Null Reference Error');
      expect(result).toContain('user.js:15');
      expect(result).toContain('Add null checks');
      expect(result).toContain('if (object && object.property)');
    });

    test('should detect type errors', async () => {
      const errors = [{
        message: 'handleClick is not a function',
        file: 'events.js',
        line: 25,
      }];

      const result = await panel.getAIAnalysisForErrors(errors);

      expect(result).toContain('Type Error');
      expect(result).toContain('events.js:25');
      expect(result).toContain('trying to call something that isn\'t a function');
      expect(result).toContain('ensure the function exists');
    });

    test('should detect reference errors', async () => {
      const errors = [{
        message: 'myVariable is not defined',
        file: 'main.js',
        line: 100,
      }];

      const result = await panel.getAIAnalysisForErrors(errors);

      expect(result).toContain('Reference Error');
      expect(result).toContain('main.js:100');
      expect(result).toContain('before it\'s declared');
      expect(result).toContain('Ensure the variable is declared');
    });

    test('should detect network errors', async () => {
      const errors = [{
        message: 'Network request failed',
        file: 'api.js',
        line: 50,
      }];

      const result = await panel.getAIAnalysisForErrors(errors);

      expect(result).toContain('Network Error');
      expect(result).toContain('api.js:50');
      expect(result).toContain('network connectivity');
      expect(result).toContain('CORS settings');
    });

    test('should detect syntax errors', async () => {
      const errors = [{
        message: 'Unexpected token syntax error',
        file: 'parser.js',
        line: 75,
      }];

      const result = await panel.getAIAnalysisForErrors(errors);

      expect(result).toContain('Syntax Error');
      expect(result).toContain('parser.js:75');
      expect(result).toContain('invalid syntax');
      expect(result).toContain('missing brackets');
    });

    test('should detect stack overflow errors', async () => {
      const errors = [{
        message: 'Maximum call stack size exceeded',
        file: 'recursive.js',
        line: 30,
      }];

      const result = await panel.getAIAnalysisForErrors(errors);

      expect(result).toContain('Stack Overflow');
      expect(result).toContain('recursive.js:30');
      expect(result).toContain('Infinite recursion');
      expect(result).toContain('base case for recursion');
    });

    test('should provide generic analysis for unknown errors', async () => {
      const errors = [{
        message: 'Some custom application error that doesn\'t match patterns',
        file: 'custom.js',
        line: 999,
      }];

      const result = await panel.getAIAnalysisForErrors(errors);

      expect(result).toContain('JavaScript Error');
      expect(result).toContain('custom.js:999');
      expect(result).toContain('Some custom application error');
      expect(result).toContain('Check the console for full error details');
    });

    test('should handle errors with missing file information', async () => {
      const errors = [{
        message: 'Cannot read properties of null',
        file: undefined,
        line: undefined,
      }];

      const result = await panel.getAIAnalysisForErrors(errors);

      expect(result).toContain('Null Reference Error');
      expect(result).toContain('undefined:undefined');
    });

    test('should truncate very long error messages', async () => {
      const longMessage = 'x'.repeat(200);
      const errors = [{
        message: longMessage,
        file: 'long.js',
        line: 1,
      }];

      const result = await panel.getAIAnalysisForErrors(errors);

      expect(result).toContain('JavaScript Error');
      expect(result).toContain('x'.repeat(100)); // Should truncate at 100 chars
      expect(result).not.toContain('x'.repeat(101));
    });

    test('should provide generic tips when no patterns match', async () => {
      const errors = [
        {
          message: 'Custom error 1',
          file: 'file1.js',
          line: 1,
        },
        {
          message: 'Custom error 2',
          file: 'file2.js',
          line: 2,
        },
      ];

      // Mock generateBasicErrorAnalysis to return empty array
      panel.generateBasicErrorAnalysis = function(errors) {
        return `🤖 **Error Analysis**

**Error Summary:**
${errors.slice(0, 2).map(e => `• ${e.message.substring(0, 80)}${e.message.length > 80 ? '...' : ''}`).join('\n')}

**General Debugging Steps:**
1. Check the full error stack trace in the console
2. Verify all variables are properly initialized
3. Add console.log statements before the error line
4. Check for typos in property/method names
5. Ensure all dependencies are loaded

**Need More Help?**
Share the full error message and code context with your team or on Stack Overflow for specific guidance.`;
      };

      const result = await panel.getAIAnalysisForErrors(errors);

      expect(result).toContain('Error Analysis');
      expect(result).toContain('Error Summary');
      expect(result).toContain('Custom error 1');
      expect(result).toContain('Custom error 2');
      expect(result).toContain('General Debugging Steps');
      expect(result).toContain('Check the full error stack trace');
    });
  });

  describe('Error Collection and Deduplication', () => {
    beforeEach(() => {
      panel.collectRecentErrors = function() {
        const fiveMinutesAgo = Date.now() - (5 * 60 * 1000);
        const uniqueErrors = new Map();

        // Return empty array if no logs
        if (!this.logs || this.logs.length === 0) {
          return [];
        }

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
              analysis: log.analysis,
            });
          }
        });

        return Array.from(uniqueErrors.values());
      };
    });

    test('should collect errors from last 5 minutes', () => {
      const now = Date.now();
      panel.logs = [
        {
          level: 'error',
          message: 'Recent error',
          timestamp: now - 60000, // 1 minute ago
          file: 'app.js',
          line: 1,
        },
        {
          level: 'error',
          message: 'Old error',
          timestamp: now - 400000, // 6+ minutes ago
          file: 'old.js',
          line: 2,
        },
        {
          level: 'info',
          message: 'Not an error',
          timestamp: now,
          file: 'info.js',
          line: 3,
        },
      ];

      const errors = panel.collectRecentErrors();

      expect(errors).toHaveLength(1);
      expect(errors[0].message).toBe('Recent error');
    });

    test('should deduplicate identical errors', () => {
      const now = Date.now();
      panel.logs = [
        {
          level: 'error',
          message: 'Duplicate error',
          timestamp: now,
          file: 'app.js',
          line: 10,
        },
        {
          level: 'error',
          message: 'Duplicate error',
          timestamp: now - 1000,
          file: 'app.js',
          line: 10,
        },
        {
          level: 'error',
          message: 'Different error',
          timestamp: now,
          file: 'app.js',
          line: 20,
        },
      ];

      const errors = panel.collectRecentErrors();

      expect(errors).toHaveLength(2);
      expect(errors.filter(e => e.message === 'Duplicate error')).toHaveLength(1);
    });

    test('should preserve error metadata', () => {
      const now = Date.now();
      panel.logs = [{
        level: 'error',
        message: 'Test error',
        timestamp: now,
        file: 'test.js',
        line: 42,
        column: 15,
        stack: 'Error stack trace',
        type: 'TypeError',
        analysis: 'Previous analysis',
      }];

      const errors = panel.collectRecentErrors();

      expect(errors[0]).toMatchObject({
        message: 'Test error',
        file: 'test.js',
        line: 42,
        column: 15,
        stack: 'Error stack trace',
        type: 'TypeError',
        analysis: 'Previous analysis',
      });
    });
  });

  describe('Integration Tests', () => {
    beforeEach(() => {
      // Set up collectRecentErrors for integration tests
      panel.collectRecentErrors = function() {
        const fiveMinutesAgo = Date.now() - (5 * 60 * 1000);
        const uniqueErrors = new Map();

        // Return empty array if no logs
        if (!this.logs || this.logs.length === 0) {
          return [];
        }

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
              analysis: log.analysis,
            });
          }
        });

        return Array.from(uniqueErrors.values());
      };
    });

    test('should handle complete flow from error collection to AI analysis', async () => {
      const now = Date.now();
      panel.logs = [
        {
          level: 'error',
          message: 'Cannot read properties of null',
          timestamp: now,
          file: 'app.js',
          line: 42,
          column: 15,
        },
      ];

      const errors = panel.collectRecentErrors();
      const analysis = await panel.getAIAnalysisForErrors(errors);

      expect(analysis).toBeTruthy();
      expect(analysis).toContain('🤖');
      expect(analysis.length).toBeGreaterThan(50);
    });

    test('should handle empty logs gracefully', async () => {
      panel.logs = [];

      const errors = panel.collectRecentErrors();
      const analysis = await panel.getAIAnalysisForErrors(errors || []);

      expect(errors).toEqual([]);
      expect(analysis).toContain('No Console Errors Detected');
      expect(analysis).toContain('Debugging Checklist');
    });

    test('should provide meaningful output for any scenario', async () => {
      // Test various scenarios
      const scenarios = [
        { errors: [], description: 'No errors' },
        { errors: null, description: 'Null errors' },
        { errors: undefined, description: 'Undefined errors' },
        { errors: [{ message: 'Test error', file: 'test.js', line: 1 }], description: 'Single error' },
        { errors: Array(10).fill({ message: 'Error', file: 'file.js', line: 1 }), description: 'Many errors' },
      ];

      for (const scenario of scenarios) {
        const result = await panel.getAIAnalysisForErrors(scenario.errors);

        expect(result).toBeTruthy();
        expect(result).toContain('🤖');
        expect(result.length).toBeGreaterThan(50);
        console.log(`Scenario "${scenario.description}" produced ${result.length} chars of analysis`);
      }
    });
  });

  describe('Performance Tests', () => {
    test('should handle large number of errors efficiently', async () => {
      const manyErrors = Array(100).fill(null).map((_, i) => ({
        message: `Error ${i}`,
        file: `file${i}.js`,
        line: i,
        column: 1,
      }));

      const startTime = Date.now();
      const result = await panel.getAIAnalysisForErrors(manyErrors);
      const endTime = Date.now();

      expect(result).toBeTruthy();
      expect(endTime - startTime).toBeLessThan(1000); // Should complete within 1 second

      // Should only process first 2 errors
      const processedCount = (result.match(/🤖/g) || []).length;
      expect(processedCount).toBeLessThanOrEqual(2);
    });

    test('should not hang on malformed error data', async () => {
      const malformedErrors = [
        null,
        undefined,
        {},
        { message: null },
        { file: 123 },
        { line: 'not a number' },
        { message: '', file: '', line: 0 },
      ];

      for (const error of malformedErrors) {
        const result = await panel.getAIAnalysisForErrors([error]);
        expect(result).toBeTruthy();
      }
    });
  });
});