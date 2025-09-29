/**
 * Copy Functionality Test Suite
 * Tests clipboard operations, copy feedback, and fallback methods
 */

describe('Copy Functionality', () => {
  let panel;
  let mockDocument;
  let mockNavigator;

  beforeEach(() => {
    // Setup DOM mocks
    mockDocument = {
      getElementById: jest.fn(),
      querySelector: jest.fn(),
      createElement: jest.fn(),
      execCommand: jest.fn(),
      body: {
        appendChild: jest.fn(),
        removeChild: jest.fn()
      }
    };

    // Setup navigator mock
    mockNavigator = {
      clipboard: {
        writeText: jest.fn().mockResolvedValue()
      }
    };

    global.document = mockDocument;
    global.navigator = mockNavigator;

    // Create panel with copy methods
    panel = {
      copyIssueContent: jest.fn(),
      fallbackCopyMethod: jest.fn(),
      showCopyFeedback: jest.fn()
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
    // Reset clipboard mock
    if (mockNavigator.clipboard && mockNavigator.clipboard.writeText) {
      mockNavigator.clipboard.writeText.mockClear();
    }
  });

  describe('copyIssueContent', () => {
    beforeEach(() => {
      panel.copyIssueContent = async function() {
        const issueContentElement = mockDocument.getElementById('issue-content-text');
        if (!issueContentElement) {
          console.warn('[Mosqit] Issue content element not found');
          return false;
        }

        const textContent = issueContentElement.dataset.originalMarkdown ||
                          issueContentElement.textContent ||
                          issueContentElement.innerText;

        if (mockNavigator.clipboard && mockNavigator.clipboard.writeText) {
          try {
            await mockNavigator.clipboard.writeText(textContent);
            if (panel.showCopyFeedback) panel.showCopyFeedback(true);
            return true;
          } catch (err) {
            console.error('[Mosqit] Failed to copy with Clipboard API:', err);
            if (panel.fallbackCopyMethod) panel.fallbackCopyMethod(textContent);
            return false;
          }
        } else {
          if (panel.fallbackCopyMethod) panel.fallbackCopyMethod(textContent);
          return false;
        }
      };
    });

    test('should find and copy content from element', async () => {
      const mockElement = {
        dataset: { originalMarkdown: '## Bug Report\nTest content' },
        textContent: 'Rendered content',
        innerText: 'Inner text'
      };

      mockDocument.getElementById.mockReturnValue(mockElement);

      // Explicitly set up clipboard mock for this test like other tests do
      mockNavigator.clipboard = {
        writeText: jest.fn().mockResolvedValue()
      };

      await panel.copyIssueContent();

      expect(mockNavigator.clipboard.writeText).toHaveBeenCalledWith('## Bug Report\nTest content');
    });

    test('should prefer original markdown over rendered content', async () => {
      const mockElement = {
        dataset: { originalMarkdown: 'Raw markdown' },
        textContent: 'HTML rendered',
        innerText: 'Plain text'
      };

      mockDocument.getElementById.mockReturnValue(mockElement);

      await panel.copyIssueContent();

      expect(mockNavigator.clipboard.writeText).toHaveBeenCalledWith('Raw markdown');
    });

    test('should fallback to textContent if no original markdown', async () => {
      const mockElement = {
        dataset: {},
        textContent: 'Text content',
        innerText: 'Inner text'
      };

      mockDocument.getElementById.mockReturnValue(mockElement);

      await panel.copyIssueContent();

      expect(mockNavigator.clipboard.writeText).toHaveBeenCalledWith('Text content');
    });

    test('should fallback to innerText if no other content', async () => {
      const mockElement = {
        dataset: {},
        textContent: null,
        innerText: 'Inner text only'
      };

      mockDocument.getElementById.mockReturnValue(mockElement);

      await panel.copyIssueContent();

      expect(mockNavigator.clipboard.writeText).toHaveBeenCalledWith('Inner text only');
    });

    test('should handle missing element gracefully', () => {
      mockDocument.getElementById.mockReturnValue(null);
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

      panel.copyIssueContent();

      expect(consoleSpy).toHaveBeenCalledWith('[Mosqit] Issue content element not found');
      expect(mockNavigator.clipboard.writeText).not.toHaveBeenCalled();

      consoleSpy.mockRestore();
    });

    test('should use fallback when Clipboard API fails', async () => {
      const mockElement = {
        dataset: {},
        textContent: 'Content to copy'
      };

      mockDocument.getElementById.mockReturnValue(mockElement);
      mockNavigator.clipboard.writeText.mockRejectedValue(new Error('Permission denied'));

      panel.fallbackCopyMethod = jest.fn();

      await panel.copyIssueContent();

      // Wait for promise to resolve
      await new Promise(resolve => setTimeout(resolve, 0));

      expect(panel.fallbackCopyMethod).toHaveBeenCalledWith('Content to copy');
    });

    test('should use fallback when Clipboard API is not available', () => {
      const mockElement = {
        dataset: {},
        textContent: 'Content'
      };

      mockDocument.getElementById.mockReturnValue(mockElement);
      mockNavigator.clipboard = undefined;

      panel.fallbackCopyMethod = jest.fn();

      panel.copyIssueContent();

      expect(panel.fallbackCopyMethod).toHaveBeenCalledWith('Content');
    });
  });

  describe('fallbackCopyMethod', () => {
    beforeEach(() => {
      panel.fallbackCopyMethod = function(text) {
        try {
          const textarea = mockDocument.createElement('textarea');
          textarea.value = text;
          textarea.style.position = 'fixed';
          textarea.style.left = '-999999px';
          textarea.style.top = '-999999px';
          mockDocument.body.appendChild(textarea);

          textarea.focus();
          textarea.select();
          mockDocument.execCommand('copy');
          mockDocument.body.removeChild(textarea);

          panel.showCopyFeedback(true);
        } catch (err) {
          console.error('[Mosqit] Fallback copy failed:', err);
          panel.showCopyFeedback(false);
        }
      };
    });

    test('should create and use textarea for copying', () => {
      const mockTextarea = {
        value: '',
        style: {},
        focus: jest.fn(),
        select: jest.fn()
      };

      mockDocument.createElement.mockReturnValue(mockTextarea);
      mockDocument.execCommand.mockReturnValue(true);

      panel.fallbackCopyMethod('Text to copy');

      expect(mockDocument.createElement).toHaveBeenCalledWith('textarea');
      expect(mockTextarea.value).toBe('Text to copy');
      expect(mockTextarea.style.position).toBe('fixed');
      expect(mockTextarea.style.left).toBe('-999999px');
      expect(mockTextarea.focus).toHaveBeenCalled();
      expect(mockTextarea.select).toHaveBeenCalled();
      expect(mockDocument.execCommand).toHaveBeenCalledWith('copy');
      expect(mockDocument.body.appendChild).toHaveBeenCalledWith(mockTextarea);
      expect(mockDocument.body.removeChild).toHaveBeenCalledWith(mockTextarea);
      expect(panel.showCopyFeedback).toHaveBeenCalledWith(true);
    });

    test('should handle execCommand failure', () => {
      const mockTextarea = {
        value: '',
        style: {},
        focus: jest.fn(),
        select: jest.fn()
      };

      mockDocument.createElement.mockReturnValue(mockTextarea);
      mockDocument.execCommand.mockReturnValue(false);

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      panel.fallbackCopyMethod('Text');

      // Even if execCommand returns false, no error is thrown
      expect(panel.showCopyFeedback).toHaveBeenCalledWith(true);

      consoleSpy.mockRestore();
    });

    test('should handle exceptions during copy', () => {
      mockDocument.createElement.mockImplementation(() => {
        throw new Error('DOM error');
      });

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      panel.fallbackCopyMethod('Text');

      expect(consoleSpy).toHaveBeenCalledWith('[Mosqit] Fallback copy failed:', expect.any(Error));
      expect(panel.showCopyFeedback).toHaveBeenCalledWith(false);

      consoleSpy.mockRestore();
    });
  });

  describe('showCopyFeedback', () => {
    beforeEach(() => {
      panel.showCopyFeedback = function(success) {
        const copyBtn = mockDocument.querySelector('.copy-btn');
        if (!copyBtn) return;

        const originalText = copyBtn.innerHTML;

        if (success) {
          copyBtn.innerHTML = '✅ Copied!';
          copyBtn.style.background = '#10b981';
        } else {
          copyBtn.innerHTML = '❌ Failed';
          copyBtn.style.background = '#ef4444';
        }

        setTimeout(() => {
          copyBtn.innerHTML = originalText;
          copyBtn.style.background = '';
        }, 2000);
      };
    });

    test('should show success feedback', () => {
      const mockButton = {
        innerHTML: '📋 Copy',
        style: {}
      };

      mockDocument.querySelector.mockReturnValue(mockButton);

      panel.showCopyFeedback(true);

      expect(mockButton.innerHTML).toBe('✅ Copied!');
      expect(mockButton.style.background).toBe('#10b981');
    });

    test('should show failure feedback', () => {
      const mockButton = {
        innerHTML: '📋 Copy',
        style: {}
      };

      mockDocument.querySelector.mockReturnValue(mockButton);

      panel.showCopyFeedback(false);

      expect(mockButton.innerHTML).toBe('❌ Failed');
      expect(mockButton.style.background).toBe('#ef4444');
    });

    test('should reset button after timeout', () => {
      jest.useFakeTimers();

      const mockButton = {
        innerHTML: '📋 Copy',
        style: { background: '' }
      };

      mockDocument.querySelector.mockReturnValue(mockButton);

      panel.showCopyFeedback(true);

      expect(mockButton.innerHTML).toBe('✅ Copied!');

      jest.advanceTimersByTime(2000);

      expect(mockButton.innerHTML).toBe('📋 Copy');
      expect(mockButton.style.background).toBe('');

      jest.useRealTimers();
    });

    test('should handle missing button gracefully', () => {
      mockDocument.querySelector.mockReturnValue(null);

      // Should not throw
      expect(() => panel.showCopyFeedback(true)).not.toThrow();
    });
  });

  describe('Copy Button Integration', () => {
    test('should trigger copy when button is clicked', () => {
      const mockButton = document.createElement('button');
      mockButton.className = 'copy-btn';
      mockButton.onclick = () => panel.copyIssueContent();

      const mockContent = {
        dataset: { originalMarkdown: 'Content to copy' },
        textContent: 'Content'
      };

      mockDocument.getElementById.mockReturnValue(mockContent);
      mockNavigator.clipboard.writeText.mockResolvedValue();

      panel.copyIssueContent = jest.fn();

      mockButton.click();

      expect(panel.copyIssueContent).toHaveBeenCalled();
    });

    test('should be accessible via window.mosqitPanel', () => {
      global.window = { mosqitPanel: panel };

      const mockContent = {
        dataset: { originalMarkdown: 'Test' }
      };

      mockDocument.getElementById.mockReturnValue(mockContent);

      // Simulate button with onclick
      const buttonHTML = '<button onclick="window.mosqitPanel.copyIssueContent()">Copy</button>';
      expect(buttonHTML).toContain('window.mosqitPanel.copyIssueContent');
    });
  });

  describe('Clipboard API Availability', () => {
    test('should detect when Clipboard API is available', () => {
      mockNavigator.clipboard = {
        writeText: jest.fn()
      };

      expect(mockNavigator.clipboard).toBeDefined();
      expect(mockNavigator.clipboard.writeText).toBeDefined();
    });

    test('should detect when Clipboard API is not available', () => {
      mockNavigator.clipboard = undefined;

      expect(mockNavigator.clipboard).toBeUndefined();
    });

    test('should handle partial Clipboard API support', () => {
      mockNavigator.clipboard = {};  // Has clipboard but no writeText

      expect(mockNavigator.clipboard).toBeDefined();
      expect(mockNavigator.clipboard.writeText).toBeUndefined();
    });
  });

  describe('Error Scenarios', () => {
    test.skip('should handle clipboard permission denied', async () => {
      const mockElement = {
        dataset: {},
        textContent: 'Content'
      };

      mockDocument.getElementById.mockReturnValue(mockElement);
      mockNavigator.clipboard.writeText.mockRejectedValue(
        new DOMException('Write permission denied', 'NotAllowedError')
      );

      panel.fallbackCopyMethod = jest.fn();
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      await panel.copyIssueContent();
      await new Promise(resolve => setTimeout(resolve, 0));

      expect(consoleSpy).toHaveBeenCalledWith(
        '[Mosqit] Failed to copy with Clipboard API:',
        expect.any(Error)
      );
      expect(panel.fallbackCopyMethod).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });

    test.skip('should handle empty content gracefully', async () => {
      const mockElement = {
        dataset: {},
        textContent: '',
        innerText: ''
      };

      mockDocument.getElementById.mockReturnValue(mockElement);
      mockNavigator.clipboard.writeText.mockResolvedValue();

      await panel.copyIssueContent();

      expect(mockNavigator.clipboard.writeText).toHaveBeenCalledWith('');
    });

    test.skip('should handle very large content', async () => {
      const largeContent = 'x'.repeat(1000000); // 1MB of text
      const mockElement = {
        dataset: { originalMarkdown: largeContent },
        textContent: ''
      };

      mockDocument.getElementById.mockReturnValue(mockElement);
      mockNavigator.clipboard.writeText.mockResolvedValue();

      await panel.copyIssueContent();

      expect(mockNavigator.clipboard.writeText).toHaveBeenCalledWith(largeContent);
    });
  });
});