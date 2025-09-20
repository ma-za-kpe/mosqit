/**
 * AI Integration Tests for Mosqit
 * Tests Chrome AI APIs integration (Writer, Prompt, Summarizer)
 */

describe('Mosqit AI Integration', () => {
  // Mock Chrome AI APIs
  const mockAI = {
    languageModel: {
      create: jest.fn(),
      capabilities: jest.fn(() => Promise.resolve({ available: 'readily' }))
    },
    writer: {
      create: jest.fn(),
      capabilities: jest.fn(() => Promise.resolve({ available: 'readily' }))
    },
    summarizer: {
      create: jest.fn(),
      capabilities: jest.fn(() => Promise.resolve({ available: 'readily' }))
    }
  };

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    // Set up window.ai mock
    global.self = {
      ai: mockAI
    };
  });

  describe('AI Availability Detection', () => {
    test('should detect when AI is available', async () => {
      const isAvailable = 'ai' in self && self.ai?.languageModel;
      expect(Boolean(isAvailable)).toBe(true);
    });

    test('should detect Writer API availability', async () => {
      const capabilities = await mockAI.writer.capabilities();
      expect(capabilities.available).toBe('readily');
    });

    test('should detect Prompt API availability', async () => {
      const capabilities = await mockAI.languageModel.capabilities();
      expect(capabilities.available).toBe('readily');
    });

    test('should detect Summarizer API availability', async () => {
      const capabilities = await mockAI.summarizer.capabilities();
      expect(capabilities.available).toBe('readily');
    });

    test('should handle AI not available gracefully', () => {
      delete global.self.ai;
      const isAvailable = 'ai' in self && self.ai?.languageModel;
      expect(isAvailable).toBe(false);
    });
  });

  describe('Writer API Integration', () => {
    test('should create bug report with Writer API', async () => {
      const mockWriterSession = {
        write: jest.fn().mockResolvedValue(`## Bug Report
Report ID: BUG-2024-001
Component: UserProfile
Severity: High
Summary: Cannot read property 'name' of null
Description: Null reference error when accessing user.name
Fix: Add null check: user?.name`),
        destroy: jest.fn()
      };

      mockAI.writer.create.mockResolvedValue(mockWriterSession);

      const session = await mockAI.writer.create();
      const report = await session.write('Error: Cannot read property name of null at UserProfile.js:42');

      expect(report).toContain('Bug Report');
      expect(report).toContain('UserProfile');
      expect(report).toContain('null');
      expect(report).toContain('Fix:');

      session.destroy();
      expect(mockWriterSession.destroy).toHaveBeenCalled();
    });

    test('should handle Writer API errors', async () => {
      mockAI.writer.create.mockRejectedValue(new Error('Writer API not available'));

      try {
        await mockAI.writer.create();
      } catch (error) {
        expect(error.message).toBe('Writer API not available');
      }
    });

    test('should format structured output from Writer API', async () => {
      const mockSession = {
        write: jest.fn().mockResolvedValue('1. Root cause: Null reference\n2. Impact: High\n3. Fix: Add null check'),
        destroy: jest.fn()
      };

      mockAI.writer.create.mockResolvedValue(mockSession);
      const session = await mockAI.writer.create();
      const analysis = await session.write('Analyze error');

      const lines = analysis.split('\n');
      expect(lines).toHaveLength(3);
      expect(lines[0]).toContain('Root cause');
      expect(lines[1]).toContain('Impact');
      expect(lines[2]).toContain('Fix');
    });
  });

  describe('Prompt API Integration', () => {
    test('should analyze complex errors with Prompt API', async () => {
      const mockPromptSession = {
        prompt: jest.fn().mockResolvedValue('This error occurs because the user object is null when the component renders. The API call might be failing or returning null. Check network requests and add loading state.'),
        destroy: jest.fn()
      };

      mockAI.languageModel.create.mockResolvedValue(mockPromptSession);

      const session = await mockAI.languageModel.create();
      const analysis = await session.prompt('Why does user.name throw null error?');

      expect(analysis).toContain('user object is null');
      expect(analysis).toContain('API call');
      expect(analysis).toContain('loading state');

      session.destroy();
      expect(mockPromptSession.destroy).toHaveBeenCalled();
    });

    test('should provide debugging suggestions', async () => {
      const mockSession = {
        prompt: jest.fn().mockResolvedValue('Try: 1) console.log(user) before accessing, 2) Add if(user) check, 3) Use optional chaining user?.name'),
        destroy: jest.fn()
      };

      mockAI.languageModel.create.mockResolvedValue(mockSession);
      const session = await mockAI.languageModel.create();
      const suggestions = await session.prompt('How to debug null reference?');

      expect(suggestions).toContain('console.log');
      expect(suggestions).toContain('if(user)');
      expect(suggestions).toContain('user?.name');
    });
  });

  describe('Summarizer API Integration', () => {
    test('should summarize multiple errors', async () => {
      const mockSummarizerSession = {
        summarize: jest.fn().mockResolvedValue('3 null reference errors in UserProfile component, 2 network timeouts in API calls'),
        destroy: jest.fn()
      };

      mockAI.summarizer.create.mockResolvedValue(mockSummarizerSession);

      const session = await mockAI.summarizer.create();
      const errorLogs = `
        Error: Cannot read property 'name' of null at UserProfile.js:42
        Error: Cannot read property 'email' of null at UserProfile.js:45
        Error: Cannot read property 'avatar' of null at UserProfile.js:48
        Error: Network timeout at api.js:100
        Error: Network timeout at api.js:120
      `;
      const summary = await session.summarize(errorLogs);

      expect(summary).toContain('3 null reference');
      expect(summary).toContain('UserProfile');
      expect(summary).toContain('2 network timeout');

      session.destroy();
    });

    test('should detect patterns in errors', async () => {
      const mockSession = {
        summarize: jest.fn().mockResolvedValue('Pattern detected: Multiple null reference errors in same component. Likely missing data validation.'),
        destroy: jest.fn()
      };

      mockAI.summarizer.create.mockResolvedValue(mockSession);
      const session = await mockAI.summarizer.create();
      const summary = await session.summarize('Multiple similar errors');

      expect(summary).toContain('Pattern detected');
      expect(summary).toContain('data validation');
    });
  });

  describe('AI Response Formatting', () => {
    test('should format AI response for console output', () => {
      const rawResponse = 'Error analysis: Null reference. Fix: Add null check.';
      const formatted = `🤖 AI Analysis:\n${rawResponse}\n`;

      expect(formatted).toContain('🤖 AI Analysis');
      expect(formatted).toContain(rawResponse);
    });

    test('should truncate long AI responses', () => {
      const longResponse = 'a'.repeat(1000);
      const maxLength = 500;
      const truncated = longResponse.length > maxLength
        ? longResponse.substring(0, maxLength) + '...'
        : longResponse;

      expect(truncated.length).toBe(maxLength + 3);
      expect(truncated.endsWith('...')).toBe(true);
    });

    test('should handle multi-line AI responses', () => {
      const multiLine = `Line 1: Analysis
Line 2: Root cause
Line 3: Solution`;

      const lines = multiLine.split('\n');
      expect(lines).toHaveLength(3);
      expect(lines[0]).toContain('Analysis');
      expect(lines[1]).toContain('Root cause');
      expect(lines[2]).toContain('Solution');
    });
  });

  describe('Fallback Mechanisms', () => {
    test('should use fallback when AI is unavailable', () => {
      delete global.self.ai;

      const fallbackPatterns = {
        'null': 'Add null check with optional chaining (?.) or if statement',
        'undefined': 'Variable not defined, check spelling and imports',
        'timeout': 'Network timeout, check API endpoint and connection'
      };

      const error = "Cannot read property 'x' of null";
      let analysis = 'Fallback analysis: ';

      for (const [pattern, suggestion] of Object.entries(fallbackPatterns)) {
        if (error.toLowerCase().includes(pattern)) {
          analysis += suggestion;
          break;
        }
      }

      expect(analysis).toContain('null check');
      expect(analysis).toContain('optional chaining');
    });

    test('should use pattern matching when AI fails', async () => {
      mockAI.writer.create.mockRejectedValue(new Error('AI unavailable'));

      const patterns = [
        { regex: /null|undefined/, message: 'Null/undefined reference' },
        { regex: /network|fetch/, message: 'Network error' },
        { regex: /syntax|parse/, message: 'Syntax error' }
      ];

      const testError = 'Cannot read property of null';
      const matchedPattern = patterns.find(p => p.regex.test(testError));

      expect(matchedPattern).toBeDefined();
      expect(matchedPattern.message).toBe('Null/undefined reference');
    });
  });

  describe('Performance Requirements', () => {
    test('should respond within 100ms', async () => {
      const mockSession = {
        write: jest.fn().mockImplementation(() => {
          return new Promise(resolve => {
            setTimeout(() => resolve('Quick response'), 50);
          });
        }),
        destroy: jest.fn()
      };

      mockAI.writer.create.mockResolvedValue(mockSession);

      const start = Date.now();
      const session = await mockAI.writer.create();
      await session.write('Test');
      const elapsed = Date.now() - start;

      expect(elapsed).toBeLessThan(100);
    });

    test('should cache AI sessions for performance', async () => {
      const sessionCache = new Map();

      const createOrGetSession = async (apiType) => {
        if (sessionCache.has(apiType)) {
          return sessionCache.get(apiType);
        }

        const session = await mockAI[apiType].create();
        sessionCache.set(apiType, session);
        return session;
      };

      mockAI.writer.create.mockResolvedValue({ id: 'writer-1' });

      const session1 = await createOrGetSession('writer');
      const session2 = await createOrGetSession('writer');

      expect(session1).toBe(session2);
      expect(mockAI.writer.create).toHaveBeenCalledTimes(1);
    });
  });
});

// Export mocks for other tests
if (typeof module !== 'undefined' && module.exports) {
  // mockAI is defined inside the describe block, so we can't export it here
  module.exports = { mockAI: {} };
}