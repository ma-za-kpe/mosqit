/**
 * Text Chunker
 * Handles Chrome AI token limits by intelligently splitting text
 * Preserves semantic boundaries (paragraphs, sentences)
 */

class TextChunker {
  constructor(options = {}) {
    this.maxTokens = options.maxTokens || 900; // Leave buffer for system prompts
    this.overlapTokens = options.overlapTokens || 50; // Context overlap between chunks
    this.estimatedCharsPerToken = 4; // Rough estimate: 1 token ≈ 4 characters
  }

  /**
   * Split text into chunks that respect semantic boundaries
   */
  chunk(text, options = {}) {
    const maxChars = (options.maxTokens || this.maxTokens) * this.estimatedCharsPerToken;
    const overlapChars = this.overlapTokens * this.estimatedCharsPerToken;

    // If text is short enough, return as single chunk
    if (text.length <= maxChars) {
      return [{
        text,
        index: 0,
        start: 0,
        end: text.length,
        isFirst: true,
        isLast: true
      }];
    }

    const chunks = [];
    let position = 0;

    while (position < text.length) {
      const chunkEnd = Math.min(position + maxChars, text.length);
      let actualEnd = chunkEnd;

      // If not at end of text, try to break at semantic boundary
      if (chunkEnd < text.length) {
        actualEnd = this.findSemanticBoundary(text, position, chunkEnd);
      }

      // Extract chunk with overlap from previous chunk
      const chunkStart = position > 0 ? position - overlapChars : 0;
      const chunkText = text.substring(chunkStart, actualEnd);

      chunks.push({
        text: chunkText,
        index: chunks.length,
        start: chunkStart,
        end: actualEnd,
        isFirst: chunks.length === 0,
        isLast: actualEnd >= text.length,
        overlap: position > 0 ? overlapChars : 0
      });

      position = actualEnd;
    }

    console.log(`[Text Chunker] Split ${text.length} chars into ${chunks.length} chunks`);
    return chunks;
  }

  /**
   * Find the best place to split text (semantic boundary)
   * Priority: paragraph > sentence > clause > word
   */
  findSemanticBoundary(text, start, idealEnd) {
    const searchWindow = 100; // Look 100 chars before ideal end
    const searchStart = Math.max(start, idealEnd - searchWindow);
    const searchText = text.substring(searchStart, idealEnd + searchWindow);

    // Try to find paragraph break (\n\n)
    const paragraphBreak = searchText.lastIndexOf('\n\n');
    if (paragraphBreak !== -1) {
      return searchStart + paragraphBreak + 2;
    }

    // Try to find sentence end (. ! ?)
    const sentenceEndPattern = /[.!?]\s/g;
    let lastSentenceEnd = -1;
    let match;

    while ((match = sentenceEndPattern.exec(searchText)) !== null) {
      lastSentenceEnd = match.index + match[0].length;
    }

    if (lastSentenceEnd !== -1) {
      return searchStart + lastSentenceEnd;
    }

    // Try to find clause break (, ; :)
    const clauseBreak = searchText.lastIndexOf(',');
    if (clauseBreak !== -1) {
      return searchStart + clauseBreak + 1;
    }

    // Fall back to word boundary
    const lastSpace = searchText.lastIndexOf(' ');
    if (lastSpace !== -1) {
      return searchStart + lastSpace + 1;
    }

    // If all else fails, break at ideal position
    return idealEnd;
  }

  /**
   * Merge results from multiple chunks
   * Handles overlapping suggestions intelligently
   */
  mergeChunkResults(results) {
    if (results.length === 0) return [];
    if (results.length === 1) return results[0];

    const merged = [];
    const seen = new Set();

    for (const chunkResult of results) {
      for (const suggestion of chunkResult) {
        // Create unique key based on position and type
        const key = `${suggestion.offset}-${suggestion.length}-${suggestion.type}`;

        // Skip duplicates from overlapping chunks
        if (seen.has(key)) continue;

        seen.add(key);
        merged.push(suggestion);
      }
    }

    // Sort by position
    merged.sort((a, b) => a.offset - b.offset);

    console.log(`[Text Chunker] Merged ${results.length} chunk results into ${merged.length} suggestions`);
    return merged;
  }

  /**
   * Estimate token count for text
   */
  estimateTokens(text) {
    return Math.ceil(text.length / this.estimatedCharsPerToken);
  }

  /**
   * Check if text needs chunking
   */
  needsChunking(text, maxTokens) {
    const tokens = this.estimateTokens(text);
    const limit = maxTokens || this.maxTokens;
    return tokens > limit;
  }

  /**
   * Get chunk statistics
   */
  getChunkStats(chunks) {
    return {
      totalChunks: chunks.length,
      averageChunkSize: Math.round(
        chunks.reduce((sum, c) => sum + c.text.length, 0) / chunks.length
      ),
      totalChars: chunks[chunks.length - 1].end,
      estimatedTokens: this.estimateTokens(chunks[chunks.length - 1].end)
    };
  }
}

// Singleton instance
const textChunker = new TextChunker();

// Export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = textChunker;
}
