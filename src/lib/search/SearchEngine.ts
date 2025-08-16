/**
 * Full-text search engine implementation
 * Requirements: 5.1, 5.2, 5.4, 5.5
 */

import { Note, Folder } from '../../types/note';
import { 
  SearchResult, 
  SearchHighlight, 
  SearchIndex, 
  SearchOptions, 
  SearchFilters 
} from '../../types/search';

interface TokenizedContent {
  tokens: string[];
  positions: Map<string, number[]>;
}

interface SearchMatch {
  noteId: string;
  score: number;
  titleMatches: SearchHighlight[];
  contentMatches: SearchHighlight[];
}

export class SearchEngine {
  private index: Map<string, SearchIndex> = new Map();
  private notes: Map<string, Note> = new Map();
  private folders: Map<string, Folder> = new Map();
  
  // Configuration
  private readonly MIN_QUERY_LENGTH = 1;
  private readonly MAX_RESULTS = 50;
  private readonly SNIPPET_LENGTH = 150;
  private readonly CONTEXT_PADDING = 30;
  
  // Stop words to exclude from indexing
  private readonly STOP_WORDS = new Set([
    'a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'for', 'from',
    'has', 'he', 'in', 'is', 'it', 'its', 'of', 'on', 'that', 'the',
    'to', 'was', 'will', 'with', 'the', 'this', 'but', 'they', 'have',
    'had', 'what', 'said', 'each', 'which', 'she', 'do', 'how', 'their',
    'if', 'up', 'out', 'many', 'then', 'them', 'these', 'so', 'some',
    'her', 'would', 'make', 'like', 'into', 'him', 'time', 'two', 'more',
    'go', 'no', 'way', 'could', 'my', 'than', 'first', 'been', 'call',
    'who', 'oil', 'sit', 'now', 'find', 'down', 'day', 'did', 'get',
    'come', 'made', 'may', 'part'
  ]);

  /**
   * Initialize the search engine with notes and folders
   */
  async initialize(notes: Note[], folders: Folder[]): Promise<void> {
    // Store references
    this.notes.clear();
    this.folders.clear();
    
    notes.forEach(note => this.notes.set(note.id, note));
    folders.forEach(folder => this.folders.set(folder.id, folder));
    
    // Build search index
    await this.buildIndex(notes);
  }  /**

   * Build search index for all notes
   */
  private async buildIndex(notes: Note[]): Promise<void> {
    this.index.clear();
    
    for (const note of notes) {
      await this.indexNote(note);
    }
  }

  /**
   * Index a single note for search
   */
  async indexNote(note: Note): Promise<void> {
    // Update the notes map
    this.notes.set(note.id, note);
    
    const titleTokens = this.tokenize(note.title);
    const contentTokens = this.tokenize(note.content);
    const allTokens = [...titleTokens.tokens, ...contentTokens.tokens];
    
    const searchIndex: SearchIndex = {
      noteId: note.id,
      tokens: allTokens,
      title: note.title,
      folderId: note.folderId,
      lastIndexed: new Date()
    };
    
    this.index.set(note.id, searchIndex);
  }

  /**
   * Remove a note from the search index
   */
  removeFromIndex(noteId: string): void {
    this.index.delete(noteId);
    this.notes.delete(noteId);
  }

  /**
   * Update folder information
   */
  updateFolders(folders: Folder[]): void {
    this.folders.clear();
    folders.forEach(folder => this.folders.set(folder.id, folder));
  }

  /**
   * Perform full-text search
   */
  async search(options: SearchOptions): Promise<SearchResult[]> {
    const { query, filters, fuzzy = true, maxResults = this.MAX_RESULTS } = options;
    
    if (!query || query.trim().length < this.MIN_QUERY_LENGTH) {
      return [];
    }

    const trimmedQuery = query.trim().toLowerCase();
    const queryTokens = this.tokenizeForSearch(trimmedQuery, fuzzy);
    
    // Find matching notes
    const matches: SearchMatch[] = [];
    
    for (const [noteId, index] of this.index) {
      const note = this.notes.get(noteId);
      if (!note) continue;
      
      // Apply filters first
      if (!this.passesFilters(note, filters)) {
        continue;
      }
      
      const match = this.scoreNote(note, index, queryTokens, fuzzy);
      if (match && match.score > 0) {
        matches.push(match);
      }
    }
    
    // Sort by relevance score
    matches.sort((a, b) => b.score - a.score);
    
    // Convert to search results
    const results: SearchResult[] = [];
    const limitedMatches = matches.slice(0, maxResults);
    
    for (const match of limitedMatches) {
      const note = this.notes.get(match.noteId);
      if (!note) continue;
      
      const result = await this.createSearchResult(note, match, trimmedQuery);
      results.push(result);
    }
    
    return results;
  }  /*
*
   * Tokenize text into searchable tokens
   */
  private tokenize(text: string): TokenizedContent {
    const tokens: string[] = [];
    const positions: Map<string, number[]> = new Map();
    
    // Convert to lowercase and split on word boundaries
    const words = text.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 0);
    
    words.forEach((word, index) => {
      // Skip stop words for content indexing
      if (this.STOP_WORDS.has(word)) {
        return;
      }
      
      // Add full word
      tokens.push(word);
      if (!positions.has(word)) {
        positions.set(word, []);
      }
      positions.get(word)!.push(index);
      
      // Add word stems/prefixes for fuzzy matching (only if fuzzy search is enabled)
      // Note: This will be controlled by the search method, not here
      if (word.length > 3) {
        const stem = word.substring(0, Math.max(3, word.length - 2));
        tokens.push(stem);
        if (!positions.has(stem)) {
          positions.set(stem, []);
        }
        positions.get(stem)!.push(index);
      }
    });
    
    return { tokens, positions };
  }

  /**
   * Tokenize text for search queries (with optional stemming)
   */
  private tokenizeForSearch(text: string, includeStemming: boolean): TokenizedContent {
    const tokens: string[] = [];
    const positions: Map<string, number[]> = new Map();
    
    // Convert to lowercase and split on word boundaries
    const words = text.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 0);
    
    words.forEach((word, index) => {
      // Skip stop words for content indexing
      if (this.STOP_WORDS.has(word)) {
        return;
      }
      
      // Add full word
      tokens.push(word);
      if (!positions.has(word)) {
        positions.set(word, []);
      }
      positions.get(word)!.push(index);
      
      // Add word stems/prefixes only if fuzzy search is enabled
      if (includeStemming && word.length > 3) {
        const stem = word.substring(0, Math.max(3, word.length - 2));
        tokens.push(stem);
        if (!positions.has(stem)) {
          positions.set(stem, []);
        }
        positions.get(stem)!.push(index);
      }
    });
    
    return { tokens, positions };
  }

  /**
   * Check if a note passes the applied filters
   */
  private passesFilters(note: Note, filters?: SearchFilters): boolean {
    if (!filters) return true;
    
    // Filter by folder
    if (filters.folderId) {
      if (note.folderId !== filters.folderId) {
        // Check if note is in a subfolder
        const folderPath = this.getFolderPath(note.folderId);
        if (!folderPath.includes(filters.folderId)) {
          return false;
        }
      }
    }
    
    // Filter by date range
    if (filters.dateRange) {
      const noteDate = note.updatedAt;
      if (noteDate < filters.dateRange.start || noteDate > filters.dateRange.end) {
        return false;
      }
    }
    
    // Filter by tags
    if (filters.tags && filters.tags.length > 0) {
      const noteTags = note.tags || [];
      const hasMatchingTag = filters.tags.some(tag => 
        noteTags.some(noteTag => 
          noteTag.toLowerCase().includes(tag.toLowerCase())
        )
      );
      if (!hasMatchingTag) {
        return false;
      }
    }
    
    return true;
  }

  /**
   * Score a note against search query
   */
  private scoreNote(
    note: Note, 
    index: SearchIndex, 
    queryTokens: TokenizedContent, 
    fuzzy: boolean
  ): SearchMatch | null {
    let totalScore = 0;
    const titleMatches: SearchHighlight[] = [];
    const contentMatches: SearchHighlight[] = [];
    
    // Score title matches (higher weight)
    const titleScore = this.scoreText(note.title, queryTokens, fuzzy, titleMatches);
    totalScore += titleScore * 3; // Title matches are 3x more important
    
    // Score content matches
    const contentScore = this.scoreText(note.content, queryTokens, fuzzy, contentMatches);
    totalScore += contentScore;
    
    // Boost score for exact phrase matches
    const exactPhraseBoost = this.getExactPhraseBoost(note, queryTokens.tokens.join(' '));
    totalScore += exactPhraseBoost;
    
    // Boost score for recent notes
    const recencyBoost = this.getRecencyBoost(note.updatedAt);
    totalScore += recencyBoost;
    
    if (totalScore === 0) {
      return null;
    }
    
    return {
      noteId: note.id,
      score: totalScore,
      titleMatches,
      contentMatches
    };
  }  
/**
   * Score text content against query tokens
   */
  private scoreText(
    text: string, 
    queryTokens: TokenizedContent, 
    fuzzy: boolean, 
    matches: SearchHighlight[]
  ): number {
    let score = 0;
    const lowerText = text.toLowerCase();
    
    // Get unique tokens (remove duplicates from stemming)
    const uniqueTokens = [...new Set(queryTokens.tokens)];
    
    for (const token of uniqueTokens) {
      const exactMatches = this.findExactMatches(lowerText, token);
      score += exactMatches.length * 2; // Exact matches get higher score
      
      // Add highlights for exact matches
      exactMatches.forEach(match => {
        matches.push({
          start: match.start,
          end: match.end,
          text: text.substring(match.start, match.end)
        });
      });
      
      if (fuzzy && exactMatches.length === 0) { // Only do fuzzy if no exact matches
        const fuzzyMatches = this.findFuzzyMatches(lowerText, token);
        score += fuzzyMatches.length * 1; // Fuzzy matches get lower score
        
        // Add highlights for fuzzy matches (avoid duplicates)
        fuzzyMatches.forEach(match => {
          const isDuplicate = matches.some(existing => 
            Math.abs(existing.start - match.start) < 3
          );
          if (!isDuplicate) {
            matches.push({
              start: match.start,
              end: match.end,
              text: text.substring(match.start, match.end)
            });
          }
        });
      }
    }
    
    // Sort matches by position
    matches.sort((a, b) => a.start - b.start);
    
    return score;
  }

  /**
   * Find exact string matches
   */
  private findExactMatches(text: string, query: string): Array<{start: number, end: number}> {
    const matches: Array<{start: number, end: number}> = [];
    let index = 0;
    
    while (index < text.length) {
      const found = text.indexOf(query, index);
      if (found === -1) break;
      
      matches.push({
        start: found,
        end: found + query.length
      });
      
      index = found + 1;
    }
    
    return matches;
  }

  /**
   * Find fuzzy matches with typo tolerance
   */
  private findFuzzyMatches(text: string, query: string): Array<{start: number, end: number}> {
    const matches: Array<{start: number, end: number}> = [];
    const words = text.split(/\s+/);
    let currentIndex = 0;
    
    for (const word of words) {
      const wordStart = text.indexOf(word, currentIndex);
      if (wordStart === -1) continue;
      
      if (this.isFuzzyMatch(word, query)) {
        matches.push({
          start: wordStart,
          end: wordStart + word.length
        });
      }
      
      currentIndex = wordStart + word.length;
    }
    
    return matches;
  }

  /**
   * Check if two strings are a fuzzy match (allowing for typos)
   */
  private isFuzzyMatch(word: string, query: string): boolean {
    if (word === query) return true;
    if (Math.abs(word.length - query.length) > 2) return false;
    
    // Simple Levenshtein distance check
    const distance = this.levenshteinDistance(word, query);
    const maxDistance = Math.max(1, Math.floor(query.length * 0.3));
    
    return distance <= maxDistance;
  }  /*
*
   * Calculate Levenshtein distance between two strings
   */
  private levenshteinDistance(str1: string, str2: string): number {
    const matrix: number[][] = [];
    
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }
    
    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }
    
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1, // substitution
            matrix[i][j - 1] + 1,     // insertion
            matrix[i - 1][j] + 1      // deletion
          );
        }
      }
    }
    
    return matrix[str2.length][str1.length];
  }

  /**
   * Get boost score for exact phrase matches
   */
  private getExactPhraseBoost(note: Note, query: string): number {
    const titleBoost = note.title.toLowerCase().includes(query) ? 5 : 0;
    const contentBoost = note.content.toLowerCase().includes(query) ? 2 : 0;
    return titleBoost + contentBoost;
  }

  /**
   * Get boost score based on note recency
   */
  private getRecencyBoost(updatedAt: Date): number {
    const now = new Date();
    const daysSinceUpdate = (now.getTime() - updatedAt.getTime()) / (1000 * 60 * 60 * 24);
    
    if (daysSinceUpdate < 1) return 5;      // Updated today
    if (daysSinceUpdate < 7) return 3;      // Updated this week
    if (daysSinceUpdate < 30) return 1;     // Updated this month
    return 0;                               // Older notes get no boost
  }

  /**
   * Get folder path for a given folder ID
   */
  private getFolderPath(folderId: string): string[] {
    const path: string[] = [];
    let currentFolder = this.folders.get(folderId);
    
    while (currentFolder) {
      path.unshift(currentFolder.id);
      currentFolder = currentFolder.parentId ? this.folders.get(currentFolder.parentId) : undefined;
    }
    
    return path;
  }

  /**
   * Get folder path as string names
   */
  private getFolderPathNames(folderId: string): string {
    const path: string[] = [];
    let currentFolder = this.folders.get(folderId);
    
    while (currentFolder) {
      path.unshift(currentFolder.name);
      currentFolder = currentFolder.parentId ? this.folders.get(currentFolder.parentId) : undefined;
    }
    
    return path.join(' > ');
  } 
 /**
   * Create a search result from a match
   */
  private async createSearchResult(
    note: Note, 
    match: SearchMatch, 
    query: string
  ): Promise<SearchResult> {
    const folderPath = this.getFolderPathNames(note.folderId);
    const snippet = this.createSnippet(note.content, match.contentMatches, query);
    
    // Combine and deduplicate highlights
    const allHighlights = [...match.titleMatches, ...match.contentMatches];
    const uniqueHighlights = this.deduplicateHighlights(allHighlights);
    
    return {
      noteId: note.id,
      title: note.title,
      snippet,
      matchCount: uniqueHighlights.length,
      folderPath,
      lastModified: note.updatedAt,
      highlights: uniqueHighlights
    };
  }

  /**
   * Create a context snippet around matches
   */
  private createSnippet(content: string, matches: SearchHighlight[], query: string): string {
    if (matches.length === 0) {
      // No specific matches, return beginning of content
      return content.length > this.SNIPPET_LENGTH 
        ? content.substring(0, this.SNIPPET_LENGTH) + '...'
        : content;
    }
    
    // Find the best match position (first match with good context)
    const bestMatch = matches[0];
    const start = Math.max(0, bestMatch.start - this.CONTEXT_PADDING);
    const end = Math.min(content.length, bestMatch.end + this.CONTEXT_PADDING);
    
    let snippet = content.substring(start, end);
    
    // Add ellipsis if we're not at the beginning/end
    if (start > 0) snippet = '...' + snippet;
    if (end < content.length) snippet = snippet + '...';
    
    // Ensure snippet isn't too long
    if (snippet.length > this.SNIPPET_LENGTH) {
      snippet = snippet.substring(0, this.SNIPPET_LENGTH) + '...';
    }
    
    return snippet;
  }

  /**
   * Remove duplicate highlights that overlap
   */
  private deduplicateHighlights(highlights: SearchHighlight[]): SearchHighlight[] {
    if (highlights.length <= 1) return highlights;
    
    const sorted = [...highlights].sort((a, b) => a.start - b.start);
    const deduplicated: SearchHighlight[] = [sorted[0]];
    
    for (let i = 1; i < sorted.length; i++) {
      const current = sorted[i];
      const last = deduplicated[deduplicated.length - 1];
      
      // Check for overlap
      if (current.start <= last.end + 5) { // Allow small gaps
        // Merge overlapping highlights
        last.end = Math.max(last.end, current.end);
        last.text = last.text; // Keep original text for now
      } else {
        deduplicated.push(current);
      }
    }
    
    return deduplicated;
  }

  /**
   * Get recent notes (most recently updated)
   */
  getRecentNotes(limit: number = 10): Note[] {
    const notes = Array.from(this.notes.values());
    return notes
      .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
      .slice(0, limit);
  }

  /**
   * Clear the entire search index
   */
  clearIndex(): void {
    this.index.clear();
  }

  /**
   * Get search statistics
   */
  getStats(): { indexedNotes: number; totalTokens: number } {
    const indexedNotes = this.index.size;
    const totalTokens = Array.from(this.index.values())
      .reduce((sum, index) => sum + index.tokens.length, 0);
    
    return { indexedNotes, totalTokens };
  }
}

// Export singleton instance
export const searchEngine = new SearchEngine();