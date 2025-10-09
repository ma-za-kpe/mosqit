/**
 * Suggestion UI
 * Displays inline grammar suggestions in the page
 * Runs in MAIN world (can manipulate DOM)
 */

class SuggestionUI {
  constructor() {
    this.activeElement = null;
    this.suggestions = [];
    this.highlights = [];
    this.card = null;
    this.cardVisible = false;
  }

  /**
   * Initialize the UI
   */
  init() {
    console.log('[Suggestion UI] Initializing...');
    this.injectStyles();
    this.setupEventListeners();
  }

  /**
   * Inject CSS styles for suggestions
   */
  injectStyles() {
    if (document.getElementById('mosqit-grammar-styles')) {
      return; // Already injected
    }

    const styles = document.createElement('style');
    styles.id = 'mosqit-grammar-styles';
    styles.textContent = `
      /* Mosqit Grammar Highlights */
      .mosqit-grammar-highlight {
        position: relative;
        background-image: linear-gradient(to right, #FF006E 50%, transparent 50%);
        background-size: 4px 2px;
        background-repeat: repeat-x;
        background-position: 0 bottom;
        cursor: pointer;
        transition: background-color 0.2s;
      }

      .mosqit-grammar-highlight:hover {
        background-color: rgba(255, 0, 110, 0.1);
      }

      .mosqit-grammar-highlight.error {
        background-image: linear-gradient(to right, #FF006E 50%, transparent 50%);
      }

      .mosqit-grammar-highlight.warning {
        background-image: linear-gradient(to right, #FFB800 50%, transparent 50%);
      }

      .mosqit-grammar-highlight.info {
        background-image: linear-gradient(to right, #00D9FF 50%, transparent 50%);
      }

      /* Suggestion Card */
      .mosqit-suggestion-card {
        position: absolute;
        z-index: 999999;
        background: #1e1e1e;
        border: 1px solid #3c3c3c;
        border-radius: 8px;
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
        padding: 0;
        min-width: 300px;
        max-width: 400px;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        font-size: 13px;
        color: #e0e0e0;
        animation: mosqit-card-slide-up 0.2s ease-out;
      }

      @keyframes mosqit-card-slide-up {
        from {
          opacity: 0;
          transform: translateY(4px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      .mosqit-suggestion-card-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 12px 16px;
        border-bottom: 1px solid #3c3c3c;
      }

      .mosqit-suggestion-type {
        display: flex;
        align-items: center;
        gap: 8px;
        font-weight: 600;
        font-size: 11px;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }

      .mosqit-suggestion-type.error {
        color: #FF006E;
      }

      .mosqit-suggestion-type.warning {
        color: #FFB800;
      }

      .mosqit-suggestion-type.info {
        color: #00D9FF;
      }

      .mosqit-suggestion-close {
        background: transparent;
        border: none;
        color: #888;
        font-size: 20px;
        cursor: pointer;
        padding: 0;
        width: 24px;
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 4px;
        transition: all 0.2s;
      }

      .mosqit-suggestion-close:hover {
        background: #3c3c3c;
        color: #fff;
      }

      .mosqit-suggestion-content {
        padding: 16px;
      }

      .mosqit-suggestion-message {
        margin-bottom: 12px;
        line-height: 1.5;
      }

      .mosqit-suggestion-comparison {
        background: #2d2d30;
        border-radius: 6px;
        padding: 12px;
        margin-bottom: 12px;
      }

      .mosqit-suggestion-original,
      .mosqit-suggestion-replacement {
        padding: 6px 8px;
        border-radius: 4px;
        margin-bottom: 6px;
        font-family: 'Monaco', 'Menlo', monospace;
        font-size: 12px;
      }

      .mosqit-suggestion-original {
        background: rgba(255, 0, 110, 0.1);
        color: #ff6b9d;
        text-decoration: line-through;
      }

      .mosqit-suggestion-replacement {
        background: rgba(0, 217, 255, 0.1);
        color: #5ce1ff;
      }

      .mosqit-suggestion-actions {
        display: flex;
        gap: 8px;
        padding: 12px 16px;
        border-top: 1px solid #3c3c3c;
      }

      .mosqit-btn {
        flex: 1;
        padding: 8px 16px;
        border: none;
        border-radius: 6px;
        font-size: 13px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s;
      }

      .mosqit-btn-primary {
        background: linear-gradient(135deg, #00D9FF, #FF006E);
        color: white;
      }

      .mosqit-btn-primary:hover {
        opacity: 0.9;
        transform: translateY(-1px);
        box-shadow: 0 4px 8px rgba(0, 217, 255, 0.3);
      }

      .mosqit-btn-secondary {
        background: transparent;
        color: #888;
        border: 1px solid #3c3c3c;
      }

      .mosqit-btn-secondary:hover {
        background: #3c3c3c;
        color: #fff;
      }

      .mosqit-bug-icon {
        display: inline-block;
        font-size: 14px;
      }

      .mosqit-explanation {
        font-size: 12px;
        color: #888;
        margin-top: 8px;
        padding-top: 8px;
        border-top: 1px solid #3c3c3c;
        line-height: 1.4;
      }
    `;

    document.head.appendChild(styles);
    console.log('[Suggestion UI] Styles injected');
  }

  /**
   * Setup global event listeners
   */
  setupEventListeners() {
    // Close card when clicking outside
    document.addEventListener('click', (e) => {
      if (this.cardVisible && !e.target.closest('.mosqit-suggestion-card')) {
        this.hideCard();
      }
    });

    // Close card on Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.cardVisible) {
        this.hideCard();
      }
    });
  }

  /**
   * Display suggestions for an element
   */
  displaySuggestions(element, suggestions) {
    this.activeElement = element;
    this.suggestions = suggestions;

    console.log('[Suggestion UI] Displaying suggestions:', suggestions.length);

    // Clear existing highlights
    this.clearHighlights();

    // Add new highlights
    for (const suggestion of suggestions) {
      this.addHighlight(element, suggestion);
    }
  }

  /**
   * Add highlight for a suggestion
   */
  addHighlight(element, suggestion) {
    // For now, we'll use a simple approach
    // In production, we'd use a more sophisticated highlighting library

    // Create highlight marker
    const marker = {
      element,
      suggestion,
      offset: suggestion.offset,
      length: suggestion.length
    };

    this.highlights.push(marker);

    // Add click listener to show suggestion card
    // Note: This is a simplified version
    // Real implementation would overlay highlights on the text
  }

  /**
   * Show suggestion card
   */
  showCard(suggestion, position) {
    // Remove existing card
    this.hideCard();

    // Create card
    this.card = this.createCard(suggestion);

    // Position card
    this.card.style.left = position.x + 'px';
    this.card.style.top = position.y + 'px';

    // Add to page
    document.body.appendChild(this.card);

    this.cardVisible = true;

    console.log('[Suggestion UI] Card shown');
  }

  /**
   * Create suggestion card element
   */
  createCard(suggestion) {
    const card = document.createElement('div');
    card.className = 'mosqit-suggestion-card';

    card.innerHTML = `
      <div class="mosqit-suggestion-card-header">
        <div class="mosqit-suggestion-type ${suggestion.severity}">
          <span class="mosqit-bug-icon">🦟</span>
          <span>${suggestion.type.toUpperCase()}</span>
        </div>
        <button class="mosqit-suggestion-close" data-action="close">×</button>
      </div>

      <div class="mosqit-suggestion-content">
        <div class="mosqit-suggestion-message">
          ${suggestion.message}
        </div>

        ${suggestion.original && suggestion.suggestion ? `
          <div class="mosqit-suggestion-comparison">
            <div class="mosqit-suggestion-original">
              ${this.escapeHtml(suggestion.original)}
            </div>
            <div class="mosqit-suggestion-replacement">
              ${this.escapeHtml(suggestion.suggestion)}
            </div>
          </div>
        ` : ''}

        ${suggestion.explanation ? `
          <div class="mosqit-explanation">
            💡 ${this.escapeHtml(suggestion.explanation)}
          </div>
        ` : ''}
      </div>

      <div class="mosqit-suggestion-actions">
        <button class="mosqit-btn mosqit-btn-primary" data-action="accept">
          Accept Fix
        </button>
        <button class="mosqit-btn mosqit-btn-secondary" data-action="ignore">
          Ignore
        </button>
      </div>
    `;

    // Add event listeners
    card.querySelector('[data-action="close"]').addEventListener('click', () => {
      this.hideCard();
    });

    card.querySelector('[data-action="accept"]').addEventListener('click', () => {
      this.acceptSuggestion(suggestion);
    });

    card.querySelector('[data-action="ignore"]').addEventListener('click', () => {
      this.ignoreSuggestion(suggestion);
    });

    return card;
  }

  /**
   * Hide suggestion card
   */
  hideCard() {
    if (this.card) {
      this.card.remove();
      this.card = null;
      this.cardVisible = false;
    }
  }

  /**
   * Accept a suggestion (apply the fix)
   */
  acceptSuggestion(suggestion) {
    console.log('[Suggestion UI] Accepting suggestion:', suggestion);

    if (!this.activeElement) return;

    // Apply the suggestion
    const text = this.getElementText(this.activeElement);
    const before = text.substring(0, suggestion.offset);
    const after = text.substring(suggestion.offset + suggestion.length);
    const newText = before + suggestion.suggestion + after;

    this.setElementText(this.activeElement, newText);

    // Show success feedback
    this.showSuccessFeedback();

    // Hide card
    this.hideCard();

    // Refresh suggestions
    this.refreshSuggestions();
  }

  /**
   * Ignore a suggestion
   */
  ignoreSuggestion(suggestion) {
    console.log('[Suggestion UI] Ignoring suggestion:', suggestion);

    // Remove from suggestions list
    this.suggestions = this.suggestions.filter(s => s !== suggestion);

    // Hide card
    this.hideCard();

    // Refresh display
    this.refreshSuggestions();
  }

  /**
   * Show success feedback
   */
  showSuccessFeedback() {
    // TODO: Add success animation/toast
    console.log('[Suggestion UI] ✓ Fix applied!');
  }

  /**
   * Refresh suggestions display
   */
  refreshSuggestions() {
    if (this.activeElement && this.suggestions.length > 0) {
      this.displaySuggestions(this.activeElement, this.suggestions);
    } else {
      this.clearHighlights();
    }
  }

  /**
   * Clear all highlights
   */
  clearHighlights() {
    this.highlights = [];
    // TODO: Remove highlight overlays
  }

  /**
   * Get text from element
   */
  getElementText(element) {
    if (element.tagName === 'TEXTAREA' || element.tagName === 'INPUT') {
      return element.value;
    } else if (element.isContentEditable) {
      return element.innerText || element.textContent;
    }
    return '';
  }

  /**
   * Set text in element
   */
  setElementText(element, text) {
    if (element.tagName === 'TEXTAREA' || element.tagName === 'INPUT') {
      element.value = text;
      element.dispatchEvent(new Event('input', { bubbles: true }));
    } else if (element.isContentEditable) {
      element.innerText = text;
      element.dispatchEvent(new Event('input', { bubbles: true }));
    }
  }

  /**
   * Escape HTML
   */
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * Cleanup
   */
  cleanup() {
    this.hideCard();
    this.clearHighlights();
    this.activeElement = null;
    this.suggestions = [];
  }
}

// Create instance
const suggestionUI = new SuggestionUI();

// Export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = suggestionUI;
}
