/**
 * Unit tests for search store
 * Tests search operations and state management
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useSearchStore } from '../searchStore';
import { SearchResult, SearchFilters } from '../../types/search';

describe('searchStore', () => {
  beforeEach(() => {
    // Reset store state
    useSearchStore.setState({
      query: '',
      results: [],
      filters: {},
      isSearching: false,
      recentQueries: [],
      recentNotes: [],
      error: null
    });
  });

  describe('search operations', () => {
    it('should handle empty query', async () => {
      const store = useSearchStore.getState();
      await store.search('');
      
      const state = useSearchStore.getState();
      expect(state.query).toBe('');
      expect(state.results).toEqual([]);
      expect(state.error).toBeNull();
    });

    it('should handle whitespace-only query', async () => {
      const store = useSearchStore.getState();
      await store.search('   ');
      
      const state = useSearchStore.getState();
      expect(state.query).toBe('');
      expect(state.results).toEqual([]);
    });

    it('should set query and searching state', async () => {
      const store = useSearchStore.getState();
      
      // Start search and immediately check state (search is synchronous in current implementation)
      await store.search('test query');
      
      // Check final state
      const state = useSearchStore.getState();
      expect(state.query).toBe('test query');
      expect(state.isSearching).toBe(false); // Should be false after completion
      expect(state.error).toBeNull();
      expect(state.results).toEqual([]); // Empty results since SearchEngine is not implemented
    });

    it('should add query to recent queries', async () => {
      const store = useSearchStore.getState();
      
      await store.search('first query');
      await store.search('second query');
      await store.search('first query'); // Duplicate should move to top
      
      const state = useSearchStore.getState();
      expect(state.recentQueries).toEqual(['first query', 'second query']);
    });

    it('should limit recent queries', async () => {
      const store = useSearchStore.getState();
      
      // Add more than the maximum number of queries
      for (let i = 1; i <= 12; i++) {
        await store.search(`query ${i}`);
      }
      
      const state = useSearchStore.getState();
      expect(state.recentQueries).toHaveLength(10); // Should be limited to MAX_RECENT_QUERIES
      expect(state.recentQueries[0]).toBe('query 12'); // Most recent first
    });

    it('should clear search', () => {
      useSearchStore.setState({
        query: 'test query',
        results: [
          {
            noteId: '1',
            title: 'Test Note',
            snippet: 'Test content',
            matchCount: 1,
            folderPath: 'folder1',
            lastModified: new Date(),
            highlights: []
          }
        ],
        isSearching: true,
        error: 'Test error'
      });
      
      const store = useSearchStore.getState();
      store.clearSearch();
      
      const state = useSearchStore.getState();
      expect(state.query).toBe('');
      expect(state.results).toEqual([]);
      expect(state.isSearching).toBe(false);
      expect(state.error).toBeNull();
    });
  });

  describe('filters management', () => {
    it('should set filters', () => {
      const store = useSearchStore.getState();
      const filters: Partial<SearchFilters> = {
        folderId: 'folder1',
        tags: ['tag1', 'tag2']
      };
      
      store.setFilters(filters);
      
      const state = useSearchStore.getState();
      expect(state.filters).toEqual(filters);
    });

    it('should merge filters', () => {
      useSearchStore.setState({
        filters: { folderId: 'folder1' }
      });
      
      const store = useSearchStore.getState();
      store.setFilters({ tags: ['tag1'] });
      
      const state = useSearchStore.getState();
      expect(state.filters).toEqual({
        folderId: 'folder1',
        tags: ['tag1']
      });
    });

    it('should clear filters', () => {
      useSearchStore.setState({
        filters: {
          folderId: 'folder1',
          tags: ['tag1'],
          dateRange: {
            start: new Date('2024-01-01'),
            end: new Date('2024-01-31')
          }
        }
      });
      
      const store = useSearchStore.getState();
      store.clearFilters();
      
      const state = useSearchStore.getState();
      expect(state.filters).toEqual({});
    });

    it('should detect active filters', () => {
      const store = useSearchStore.getState();
      
      // No filters
      expect(store.hasActiveFilters()).toBe(false);
      
      // With folder filter
      useSearchStore.setState({
        filters: { folderId: 'folder1' }
      });
      expect(store.hasActiveFilters()).toBe(true);
      
      // With date range filter
      useSearchStore.setState({
        filters: {
          dateRange: {
            start: new Date('2024-01-01'),
            end: new Date('2024-01-31')
          }
        }
      });
      expect(store.hasActiveFilters()).toBe(true);
      
      // With tags filter
      useSearchStore.setState({
        filters: { tags: ['tag1'] }
      });
      expect(store.hasActiveFilters()).toBe(true);
    });
  });

  describe('recent queries management', () => {
    it('should add recent query', () => {
      const store = useSearchStore.getState();
      
      store.addRecentQuery('test query');
      
      const state = useSearchStore.getState();
      expect(state.recentQueries).toEqual(['test query']);
    });

    it('should ignore empty queries', () => {
      const store = useSearchStore.getState();
      
      store.addRecentQuery('');
      store.addRecentQuery('   ');
      
      const state = useSearchStore.getState();
      expect(state.recentQueries).toEqual([]);
    });

    it('should move duplicate query to top', () => {
      useSearchStore.setState({
        recentQueries: ['query1', 'query2', 'query3']
      });
      
      const store = useSearchStore.getState();
      store.addRecentQuery('query2');
      
      const state = useSearchStore.getState();
      expect(state.recentQueries).toEqual(['query2', 'query1', 'query3']);
    });

    it('should clear recent queries', () => {
      useSearchStore.setState({
        recentQueries: ['query1', 'query2', 'query3']
      });
      
      const store = useSearchStore.getState();
      store.clearRecentQueries();
      
      const state = useSearchStore.getState();
      expect(state.recentQueries).toEqual([]);
    });
  });

  describe('recent notes management', () => {
    it('should update recent notes', () => {
      const store = useSearchStore.getState();
      const noteIds = ['note1', 'note2', 'note3'];
      
      store.updateRecentNotes(noteIds);
      
      const state = useSearchStore.getState();
      expect(state.recentNotes).toEqual(noteIds);
    });

    it('should limit recent notes', () => {
      const store = useSearchStore.getState();
      const noteIds = Array.from({ length: 25 }, (_, i) => `note${i + 1}`);
      
      store.updateRecentNotes(noteIds);
      
      const state = useSearchStore.getState();
      expect(state.recentNotes).toHaveLength(20); // Should be limited to MAX_RECENT_NOTES
      expect(state.recentNotes).toEqual(noteIds.slice(0, 20));
    });
  });

  describe('error handling', () => {
    it('should set and clear error', () => {
      const store = useSearchStore.getState();
      
      store.setError('Test error');
      expect(useSearchStore.getState().error).toBe('Test error');
      
      store.clearError();
      expect(useSearchStore.getState().error).toBeNull();
    });
  });

  describe('computed getters', () => {
    it('should check if has results', () => {
      const store = useSearchStore.getState();
      
      expect(store.hasResults()).toBe(false);
      
      useSearchStore.setState({
        results: [
          {
            noteId: '1',
            title: 'Test Note',
            snippet: 'Test content',
            matchCount: 1,
            folderPath: 'folder1',
            lastModified: new Date(),
            highlights: []
          }
        ]
      });
      
      expect(store.hasResults()).toBe(true);
    });

    it('should get filtered results without filters', () => {
      const mockResults: SearchResult[] = [
        {
          noteId: '1',
          title: 'Test Note 1',
          snippet: 'Test content 1',
          matchCount: 1,
          folderPath: 'folder1',
          lastModified: new Date('2024-01-01'),
          highlights: []
        },
        {
          noteId: '2',
          title: 'Test Note 2',
          snippet: 'Test content 2',
          matchCount: 1,
          folderPath: 'folder2',
          lastModified: new Date('2024-01-02'),
          highlights: []
        }
      ];

      useSearchStore.setState({ results: mockResults });
      
      const store = useSearchStore.getState();
      const filteredResults = store.getFilteredResults();
      
      expect(filteredResults).toEqual(mockResults);
    });

    it('should get filtered results with folder filter', () => {
      const mockResults: SearchResult[] = [
        {
          noteId: '1',
          title: 'Test Note 1',
          snippet: 'Test content 1',
          matchCount: 1,
          folderPath: 'folder1',
          lastModified: new Date('2024-01-01'),
          highlights: []
        },
        {
          noteId: '2',
          title: 'Test Note 2',
          snippet: 'Test content 2',
          matchCount: 1,
          folderPath: 'folder2',
          lastModified: new Date('2024-01-02'),
          highlights: []
        }
      ];

      useSearchStore.setState({
        results: mockResults,
        filters: { folderId: 'folder1' }
      });
      
      const store = useSearchStore.getState();
      const filteredResults = store.getFilteredResults();
      
      expect(filteredResults).toHaveLength(1);
      expect(filteredResults[0].noteId).toBe('1');
    });

    it('should get filtered results with date range filter', () => {
      const mockResults: SearchResult[] = [
        {
          noteId: '1',
          title: 'Test Note 1',
          snippet: 'Test content 1',
          matchCount: 1,
          folderPath: 'folder1',
          lastModified: new Date('2024-01-15'),
          highlights: []
        },
        {
          noteId: '2',
          title: 'Test Note 2',
          snippet: 'Test content 2',
          matchCount: 1,
          folderPath: 'folder2',
          lastModified: new Date('2024-02-15'),
          highlights: []
        }
      ];

      useSearchStore.setState({
        results: mockResults,
        filters: {
          dateRange: {
            start: new Date('2024-01-01'),
            end: new Date('2024-01-31')
          }
        }
      });
      
      const store = useSearchStore.getState();
      const filteredResults = store.getFilteredResults();
      
      expect(filteredResults).toHaveLength(1);
      expect(filteredResults[0].noteId).toBe('1');
    });
  });
});