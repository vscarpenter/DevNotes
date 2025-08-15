/**
 * Search-related type definitions
 * Requirements: 5.2
 */

export interface SearchResult {
  noteId: string;
  title: string;
  snippet: string;
  matchCount: number;
  folderPath: string;
  lastModified: Date;
  highlights: SearchHighlight[];
}

export interface SearchHighlight {
  start: number;
  end: number;
  text: string;
}

export interface SearchIndex {
  noteId: string;
  tokens: string[];
  title: string;
  folderId: string;
  lastIndexed: Date;
}

export interface SearchFilters {
  folderId?: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
  tags?: string[];
}

export interface SearchOptions {
  query: string;
  filters?: SearchFilters;
  fuzzy?: boolean;
  maxResults?: number;
}

// Utility types for search operations
export type SearchQuery = string;
export type SearchScore = number;