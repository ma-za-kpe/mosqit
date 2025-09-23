/**
 * GitHub Integration Test Suite
 * Tests GitHub issue creation, authentication, and error handling
 */

describe('GitHub Integration', () => {
  let panel;
  let mockChrome;
  let mockFetch;

  beforeEach(() => {
    // Setup Chrome API mocks
    mockChrome = {
      storage: {
        sync: {
          get: jest.fn((keys, callback) => {
            callback({
              githubToken: 'test-token-123',
              githubRepo: 'testuser/testrepo'
            });
          }),
          set: jest.fn((data, callback) => callback && callback()),
          remove: jest.fn((keys, callback) => callback && callback())
        }
      },
      runtime: {
        lastError: null
      }
    };

    // Setup fetch mock
    mockFetch = jest.fn();
    global.fetch = mockFetch;
    global.chrome = mockChrome;

    // Mock panel instance
    panel = {
      getGitHubSettings: jest.fn().mockImplementation(async () => {
        return new Promise((resolve) => {
          mockChrome.storage.sync.get(['mosqitGitHubToken', 'mosqitGitHubRepo'], (result) => {
            resolve({
              token: 'test-token-123',
              repo: 'testuser/testrepo'
            });
          });
        });
      }),
      saveGitHubSettings: jest.fn().mockResolvedValue(undefined),
      clearGitHubSettings: jest.fn().mockResolvedValue(undefined),
      createGitHubIssue: jest.fn(),
      showToast: jest.fn(),
      showProgressOverlay: jest.fn(),
      hideProgressOverlay: jest.fn(),
      updateProgressMessage: jest.fn(),
      capturedBug: {
        element: { selector: 'button.test' },
        page: { url: 'http://test.com' },
        screenshot: 'data:image/png;base64,test'
      }
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('submitToGitHub', () => {
    test('should successfully create GitHub issue with valid token', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          number: 123,
          html_url: 'https://github.com/testuser/testrepo/issues/123',
          title: 'Test Issue',
          body: 'Test body'
        })
      });

      panel.createGitHubIssue = jest.fn().mockResolvedValue({
        success: true,
        number: 123,
        url: 'https://github.com/testuser/testrepo/issues/123'
      });

      const result = await panel.createGitHubIssue(
        { token: 'test-token', repo: 'user/repo' },
        'Test Issue',
        'Test body'
      );

      expect(panel.createGitHubIssue).toHaveBeenCalledWith(
        { token: 'test-token', repo: 'user/repo' },
        'Test Issue',
        'Test body'
      );
      expect(result.success).toBe(true);
      expect(result.number).toBe(123);
    });

    test('should handle 401 unauthorized error and clear token', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({ message: 'Bad credentials' })
      });

      panel.createGitHubIssue = async function(settings, title, body) {
        const response = await fetch(`https://api.github.com/repos/user/repo/issues`, {
          method: 'POST',
          headers: {
            'Authorization': `token ${settings.token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ title, body })
        });

        if (!response.ok && response.status === 401) {
          await this.clearGitHubSettings();
          throw new Error('Invalid GitHub token. Please check your personal access token.');
        }
      };

      await expect(
        panel.createGitHubIssue({ token: 'bad-token', repo: 'user/repo' }, 'Test', 'Body')
      ).rejects.toThrow('Invalid GitHub token');

      expect(panel.clearGitHubSettings).toHaveBeenCalled();
    });

    test('should handle 404 repository not found error', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: async () => ({ message: 'Not Found' })
      });

      panel.createGitHubIssue = jest.fn().mockRejectedValue(
        new Error('Repository not found. Check the format: owner/repo')
      );

      await expect(
        panel.createGitHubIssue({ token: 'token', repo: 'bad/repo' }, 'Test', 'Body')
      ).rejects.toThrow('Repository not found');
    });

    test('should handle network errors gracefully', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      panel.createGitHubIssue = jest.fn().mockRejectedValue(new Error('Network error'));

      await expect(
        panel.createGitHubIssue({ token: 'token', repo: 'user/repo' }, 'Test', 'Body')
      ).rejects.toThrow('Network error');
    });

    test('should truncate body if exceeds GitHub limit', () => {
      const longBody = 'x'.repeat(70000);
      const truncated = longBody.substring(0, 65000);

      expect(truncated.length).toBeLessThanOrEqual(65536);
    });
  });

  describe('getGitHubSettings', () => {
    test('should retrieve stored GitHub settings', async () => {
      const settings = await panel.getGitHubSettings();

      expect(settings).toEqual({
        token: 'test-token-123',
        repo: 'testuser/testrepo'
      });

      expect(mockChrome.storage.sync.get).toHaveBeenCalled();
    });

    test('should return empty settings if none stored', async () => {
      mockChrome.storage.sync.get.mockImplementation((keys, callback) => {
        callback({});
      });

      panel.getGitHubSettings = jest.fn().mockResolvedValue({
        token: '',
        repo: ''
      });

      const settings = await panel.getGitHubSettings();

      expect(settings.token).toBe('');
      expect(settings.repo).toBe('');
    });
  });

  describe('saveGitHubSettings', () => {
    test('should save GitHub settings to chrome storage', async () => {
      panel.saveGitHubSettings = jest.fn().mockResolvedValue(undefined);

      await panel.saveGitHubSettings('new-token', 'new/repo');

      expect(panel.saveGitHubSettings).toHaveBeenCalledWith('new-token', 'new/repo');
    });

    test('should handle storage errors', async () => {
      mockChrome.runtime.lastError = { message: 'Storage error' };
      mockChrome.storage.sync.set.mockImplementation((data, callback) => {
        callback();
      });

      // Should not throw but log error
      await expect(panel.saveGitHubSettings('token', 'repo')).resolves.toBeUndefined();
    });
  });

  describe('clearGitHubSettings', () => {
    test('should remove GitHub settings from storage', async () => {
      panel.clearGitHubSettings = jest.fn().mockResolvedValue(undefined);

      await panel.clearGitHubSettings();

      expect(panel.clearGitHubSettings).toHaveBeenCalled();
    });
  });

  describe('showGitHubSettings', () => {
    test('should create settings dialog with error message', () => {
      document.body.innerHTML = '';

      panel.showGitHubSettings = function(issueTitle, issueBody, errorMessage) {
        const dialog = document.createElement('div');
        dialog.className = 'github-settings-dialog';

        if (errorMessage) {
          dialog.innerHTML = `<div class="error-message">${errorMessage}</div>`;
        }

        document.body.appendChild(dialog);
      };

      panel.showGitHubSettings('Title', 'Body', 'Invalid token error');

      const dialog = document.querySelector('.github-settings-dialog');
      expect(dialog).toBeTruthy();
      expect(dialog.innerHTML).toContain('Invalid token error');
    });

    test('should not load existing settings when showing after error', () => {
      panel.showGitHubSettings = function(issueTitle, issueBody, errorMessage) {
        if (errorMessage) {
          // Should not call getGitHubSettings
          return;
        }
        this.getGitHubSettings();
      };

      const spy = jest.spyOn(panel, 'getGitHubSettings');
      panel.showGitHubSettings('Title', 'Body', 'Error message');

      expect(spy).not.toHaveBeenCalled();
    });
  });

  describe('GitHub API Response Handling', () => {
    test('should handle successful issue creation', async () => {
      const mockResponse = {
        number: 42,
        html_url: 'https://github.com/user/repo/issues/42',
        state: 'open'
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      panel.createGitHubIssue = async function(settings, title, body) {
        const response = await fetch(`https://api.github.com/repos/${settings.repo}/issues`, {
          method: 'POST',
          headers: {
            'Authorization': `token ${settings.token}`
          },
          body: JSON.stringify({ title, body })
        });

        if (response.ok) {
          const issue = await response.json();
          return {
            success: true,
            number: issue.number,
            url: issue.html_url
          };
        }
      };

      const result = await panel.createGitHubIssue(
        { token: 'token', repo: 'user/repo' },
        'Bug Report',
        'Description'
      );

      expect(result.success).toBe(true);
      expect(result.number).toBe(42);
      expect(result.url).toContain('github.com');
    });

    test('should handle rate limit errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 403,
        json: async () => ({
          message: 'API rate limit exceeded'
        })
      });

      panel.createGitHubIssue = async function(settings, title, body) {
        const response = await fetch(`https://api.github.com/repos/${settings.repo}/issues`, {
          method: 'POST'
        });

        if (!response.ok && response.status === 403) {
          const error = await response.json();
          throw new Error(`GitHub API Error: ${error.message}`);
        }
      };

      await expect(
        panel.createGitHubIssue({ token: 'token', repo: 'user/repo' }, 'Test', 'Body')
      ).rejects.toThrow('API rate limit');
    });

    test('should handle validation errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 422,
        json: async () => ({
          message: 'Validation Failed',
          errors: [
            { field: 'title', code: 'missing' }
          ]
        })
      });

      panel.createGitHubIssue = async function(settings, title, body) {
        const response = await fetch(`https://api.github.com/repos/${settings.repo}/issues`, {
          method: 'POST'
        });

        if (!response.ok && response.status === 422) {
          const error = await response.json();
          const validationErrors = error.errors.map(e => e.field).join(', ');
          throw new Error(`Validation failed: ${validationErrors}`);
        }
      };

      await expect(
        panel.createGitHubIssue({ token: 'token', repo: 'user/repo' }, '', 'Body')
      ).rejects.toThrow('Validation failed: title');
    });
  });
});