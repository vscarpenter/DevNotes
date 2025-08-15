/**
 * Search state management store using Zustand
 * Handles search operations and results
 * Requirements: 5.1, 5.2, 5.4, 5.5
 */

import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { SearchResult, SearchFilters, SearchOptions } from '../types/search';

interface SearchState {
  // State
  query: string;
  results: SearchResult[];
  filters: SearchFilters;
  isSearching: boolean;
  recentQueries: string[];
  recentNotes: string[];
  error: string | null;

  // Actions
  search: (query: string, options?: Partial<SearchOptions>) => Promise<void>;
  clearSearch: () => void;
  setFilters: (filters: Partial<SearchFilters>) => void;
  clearFilters: () => void;
  addRecentQuery: (query: string) => void;
  clearRecentQueries: () => void;
  updateRecentNotes: (noteIds: string[]) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  
  // Computed getters
  hasResults: () => boolean;
  hasActiveFilters: () => boolean;
  getFilteredResults: () => SearchResult[];
}

const MAX_RECENT_QUERIES = 10;
const MAX_RECENT_NOTES = 20;

export const useSearchStore = create<SearchState>()(
  subscribeWithSelector((set, get) => ({
    // Initial state
    query: '',
    results: [],
    filters: {},
    isSearching: false,
    recentQueries: [],
    recentNotes: [],
    error: null,

    // Actions
    search: async (query: string, options?: Partial<SearchOptions>) => {
      const trimmedQuery = query.trim();
      
      if (!trimmedQuery) {
        set({ query: '', results: [], error: null });
        return;
      }

      set({ query: trimmedQuery, isSearching: true, error: null });

      try {
        // Add to recent queries
        get().addRecentQuery(trimmedQuery);

        // TODO: Implement actual search when SearchEngine is available
        // For now, return empty results
        const searchResults: SearchResult[] = [];

        set({ 
          results: searchResults, 
          isSearching: false 
        });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Search failed';
        set({ 
          error: errorMessage, 
          isSearching: false,
          results: []
        });
      }
    },

    clearSearch: () => {
      set({ 
        query: '', 
        results: [], 
        error: null,
        isSearching: false 
      });
    },

    setFilters: (newFilters: Partial<SearchFilters>) => {
      set(state => ({
        filters: { ...state.filters, ...newFilters }
      }));
      
      // Re-run search with new filters if there's an active query
      const currentQuery = get().query;
      if (currentQuery) {
        get().search(currentQuery);
      }
    },

    clearFilters: () => {
      set({ filters: {} });
      
      // Re-run search without filters if there's an active query
      const currentQuery = get().query;
      if (currentQuery) {
        get().search(currentQuery);
      }
    },

    addRecentQuery: (query: string) => {
      set(state => {
        const trimmedQuery = query.trim();
        if (!trimmedQuery) return state;

        const newRecentQueries = [
          trimmedQuery,
          ...state.recentQueries.filter(q => q !== trimmedQuery)
        ].slice(0, MAX_RECENT_QUERIES);

        return { recentQueries: newRecentQueries };
      });
    },

    clearRecentQueries: () => {
      set({ recentQueries: [] });
    },

    updateRecentNotes: (noteIds: string[]) => {
      set({ 
        recentNotes: noteIds.slice(0, MAX_RECENT_NOTES) 
      });
    },

    setError: (error: string | null) => {
      set({ error });
    },

    clearError: () => {
      set({ error: null });
    },

    // Computed getters
    hasResults: () => {
      return get().results.length > 0;
    },

    hasActiveFilters: () => {
      const filters = get().filters;
      return !!(
        filters.folderId ||
        filters.dateRange ||
        (filters.tags && filters.tags.length > 0)
      );
    },

    getFilteredResults: () => {
      const { results, filters } = get();
      
      if (!get().hasActiveFilters()) {
        return results;
      }

      return results.filter(result => {
        // Filter by folder
        if (filters.folderId && !result.folderPath.includes(filters.folderId)) {
          return false;
        }

        // Filter by date range
        if (filters.dateRange) {
          const resultDate = result.lastModified;
          if (resultDate < filters.dateRange.start || resultDate > filters.dateRange.end) {
            return false;
          }
        }

        // Filter by tags (would need to be implemented when tags are available)
        if (filters.tags && filters.tags.length > 0) {
          // TODO: Implement tag filtering when note tags are available
        }

        return true;
      });
    }
  }))
);