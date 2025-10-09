/**
 * Grammar Engine
 * Uses Chrome Built-in AI (Proofreader API) to analyze text
 * Runs in ISOLATED world (has access to Chrome APIs)
 */

class GrammarEngine {
  constructor() {
    this.aiManager = null; // Will be initialized with chromeAI instance
    this.textChunker = null; // Will be initialized with textChunker instance
    this.processingQueue = [];
    this.isProcessing = false;
    this.cache = new Map(); // Cache results to avoid redundant checks
    this.maxCacheSize = 100;
    this.stats = {
      checksPerformed: 0,
      errorsFound: 0,
      cacheHits: 0,
      avgProcessingTime: 0
    };
  }

  /**
   * Initialize the engine
   */
  async init(aiManager, textChunker) {
    console.log('[Grammar Engine] Initializing...');
    this.aiManager = aiManager;
    this.textChunker = textChunker;

    // Check AI availability
    const available = await this.aiManager.checkAvailability();
    if (!available) {
      console.error('[Grammar Engine] Chrome AI not available');
      return false;
    }

    // Check if Proofreader API is available
    if (!this.aiManager.isAPIAvailable('proofreader')) {
      console.warn('[Grammar Engine] Proofreader API not available');
      return false;
    }

    console.log('[Grammar Engine] Initialized successfully');
    return true;
  }

  /**
   * Check text for grammar errors
   */
  async checkGrammar(text, context = {}) {
    const startTime = Date.now();

    try {
      // Check cache first
      const cacheKey = this.getCacheKey(text);
      if (this.cache.has(cacheKey)) {
        console.log('[Grammar Engine] Cache hit');
        this.stats.cacheHits++;
        return this.cache.get(cacheKey);
      }

      // Check if text needs chunking
      const needsChunking = this.textChunker.needsChunking(text, 900);

      let result;
      if (needsChunking) {
        result = await this.checkLongText(text, context);
      } else {
        result = await this.checkShortText(text, context);
      }

      // Update stats
      this.stats.checksPerformed++;
      this.stats.errorsFound += result.suggestions.length;
      const processingTime = Date.now() - startTime;
      this.stats.avgProcessingTime =
        (this.stats.avgProcessingTime * (this.stats.checksPerformed - 1) + processingTime) /
        this.stats.checksPerformed;

      // Cache result
      this.addToCache(cacheKey, result);

      console.log('[Grammar Engine] Check complete:', {
        textLength: text.length,
        suggestions: result.suggestions.length,
        processingTime: `${processingTime}ms`
      });

      return result;
    } catch (error) {
      console.error('[Grammar Engine] Error checking grammar:', error);
      return {
        suggestions: [],
        error: error.message,
        stats: {
          processingTime: Date.now() - startTime
        }
      };
    }
  }

  /**
   * Check short text (fits in one chunk)
   */
  async checkShortText(text, context) {
    const session = await this.aiManager.getProofreaderSession();
    if (!session) {
      throw new Error('Failed to get proofreader session');
    }

    try {
      const result = await session.session.proofread(text);

      // Parse and format suggestions
      const suggestions = this.formatSuggestions(result, text, context);

      return {
        suggestions,
        textLength: text.length,
        chunked: false,
        stats: {
          totalChunks: 1
        }
      };
    } finally {
      this.aiManager.releaseSession(session);
    }
  }

  /**
   * Check long text (needs chunking)
   */
  async checkLongText(text, context) {
    const chunks = this.textChunker.chunk(text);
    const chunkResults = [];

    console.log(`[Grammar Engine] Processing ${chunks.length} chunks...`);

    for (const chunk of chunks) {
      const session = await this.aiManager.getProofreaderSession();
      if (!session) {
        console.warn('[Grammar Engine] Failed to get session for chunk', chunk.index);
        continue;
      }

      try {
        const result = await session.session.proofread(chunk.text);

        // Adjust offsets to account for chunk position
        const adjustedSuggestions = this.formatSuggestions(result, chunk.text, context, chunk.start);
        chunkResults.push(adjustedSuggestions);
      } catch (error) {
        console.error(`[Grammar Engine] Error processing chunk ${chunk.index}:`, error);
      } finally {
        this.aiManager.releaseSession(session);
      }
    }

    // Merge all chunk results
    const mergedSuggestions = this.textChunker.mergeChunkResults(chunkResults);

    return {
      suggestions: mergedSuggestions,
      textLength: text.length,
      chunked: true,
      stats: {
        totalChunks: chunks.length,
        ...this.textChunker.getChunkStats(chunks)
      }
    };
  }

  /**
   * Format raw API suggestions into our structure
   */
  formatSuggestions(apiResult, originalText, context, offsetAdjustment = 0) {
    // The Proofreader API returns suggestions in a specific format
    // We need to normalize them
    const suggestions = [];

    // Handle different possible return formats
    if (Array.isArray(apiResult)) {
      for (const item of apiResult) {
        suggestions.push(this.formatSingleSuggestion(item, originalText, context, offsetAdjustment));
      }
    } else if (apiResult && apiResult.suggestions) {
      for (const item of apiResult.suggestions) {
        suggestions.push(this.formatSingleSuggestion(item, originalText, context, offsetAdjustment));
      }
    }

    return suggestions;
  }

  /**
   * Format a single suggestion
   */
  formatSingleSuggestion(item, originalText, context, offsetAdjustment = 0) {
    return {
      type: item.type || 'grammar',
      severity: this.getSeverity(item.type),
      offset: (item.offset || 0) + offsetAdjustment,
      length: item.length || 0,
      original: item.original || '',
      suggestion: item.suggestion || '',
      message: item.message || 'Grammar issue detected',
      explanation: item.explanation || '',
      context: {
        ...context,
        beforeText: this.getContextText(originalText, item.offset - 20, item.offset),
        afterText: this.getContextText(originalText, item.offset + item.length, item.offset + item.length + 20)
      },
      timestamp: Date.now()
    };
  }

  /**
   * Get severity level for suggestion type
   */
  getSeverity(type) {
    const severityMap = {
      'spelling': 'error',
      'grammar': 'error',
      'punctuation': 'warning',
      'style': 'info',
      'clarity': 'info'
    };

    return severityMap[type] || 'info';
  }

  /**
   * Get context text around a position
   */
  getContextText(text, start, end) {
    const safeStart = Math.max(0, start);
    const safeEnd = Math.min(text.length, end);
    return text.substring(safeStart, safeEnd);
  }

  /**
   * Generate cache key for text
   */
  getCacheKey(text) {
    // Simple hash function for caching
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      const char = text.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString(36);
  }

  /**
   * Add result to cache
   */
  addToCache(key, result) {
    // Implement LRU cache
    if (this.cache.size >= this.maxCacheSize) {
      // Remove oldest entry
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }

    this.cache.set(key, {
      ...result,
      cached: true,
      cachedAt: Date.now()
    });
  }

  /**
   * Clear cache
   */
  clearCache() {
    this.cache.clear();
    console.log('[Grammar Engine] Cache cleared');
  }

  /**
   * Get engine statistics
   */
  getStats() {
    return {
      ...this.stats,
      cacheSize: this.cache.size,
      cacheHitRate: this.stats.checksPerformed > 0
        ? (this.stats.cacheHits / this.stats.checksPerformed * 100).toFixed(2) + '%'
        : '0%'
    };
  }

  /**
   * Queue text for processing (with priority)
   */
  async queueCheck(text, context, priority = 'normal') {
    return new Promise((resolve, reject) => {
      this.processingQueue.push({
        text,
        context,
        priority,
        resolve,
        reject,
        timestamp: Date.now()
      });

      // Sort by priority
      this.processingQueue.sort((a, b) => {
        const priorityMap = { high: 3, normal: 2, low: 1 };
        return priorityMap[b.priority] - priorityMap[a.priority];
      });

      this.processQueue();
    });
  }

  /**
   * Process queued checks
   */
  async processQueue() {
    if (this.isProcessing || this.processingQueue.length === 0) {
      return;
    }

    this.isProcessing = true;

    while (this.processingQueue.length > 0) {
      const item = this.processingQueue.shift();

      try {
        const result = await this.checkGrammar(item.text, item.context);
        item.resolve(result);
      } catch (error) {
        item.reject(error);
      }
    }

    this.isProcessing = false;
  }

  /**
   * Analyze tone/empathy of text (using Language Model API)
   */
  async analyzeTone(text, context = {}) {
    try {
      const session = await this.aiManager.getLanguageModelSession();
      if (!session) {
        return { score: 0, analysis: 'Tone analysis unavailable' };
      }

      const prompt = `Analyze the tone of this ${context.type || 'message'}. Rate it on a scale of 0-100 where 0 is very harsh/rude and 100 is very kind/empathetic. Also provide a brief analysis.

Text: "${text}"

Format your response as JSON:
{
  "score": <number>,
  "tone": "<harsh|neutral|professional|friendly|warm>",
  "issues": ["<list of tone issues if any>"],
  "suggestions": ["<suggestions to improve tone>"]
}`;

      try {
        const result = await session.session.prompt(prompt);
        const analysis = JSON.parse(result);

        this.aiManager.releaseSession(session);

        return {
          ...analysis,
          timestamp: Date.now()
        };
      } catch (error) {
        this.aiManager.releaseSession(session);
        throw error;
      }
    } catch (error) {
      console.error('[Grammar Engine] Error analyzing tone:', error);
      return {
        score: 50,
        tone: 'neutral',
        error: error.message
      };
    }
  }
}

// Create instance
const grammarEngine = new GrammarEngine();

// Export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = grammarEngine;
}
