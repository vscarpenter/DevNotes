/**
 * SearchStore tests
 * Requirements: 5.1, 5.2, 5.4, 5.5
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useSearchStore } from '../searchStore';
import { searchEngine } from '../../lib/search/SearchEngine';
import { SearchResult } from '../../types/search';

// Mock the search engine
vi.mock('../../lib/search/SearchEngine', () => ({
  searchEngine: {
    search: vi.fn(),
    initialize: vi.fn(),
    indexNote: vi.fn(),
    removeFromIndex: vi.fn(),
    getRecentNotes: vi.fn(),
    updateFolders: vi.fn()
  }
}));

// Mock the other stores
vi.mock('../noteStore', () => ({
  useNoteStore: {
    getState: vi.fn(() => ({
      notes: {},
      getNote: vi.fn()
    }))
  }
}));

vi.mock('../folderStore', () => ({
  useFolderStore: {
    getState: vi.fn(() => ({
      folders: {}
    }))
  }
}));

describe('SearchStore', () => {
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
    
    // Reset mocks
    vi.clearAllMocks();
  });

  describe('Initial State', () => {
    it('should have correct initial state', () => {
      const state = useSearchStore.getState();
      
      expect(state.query).toBe('');
      expect(state.results).toEqual([]);
      expect(state.filters).toEqual({});
      expect(state.isSearching).toBe(false);
      expect(state.recentQueries).toEqual([]);
      expect(state.recentNotes).toEqual([]);
      expect(state.error).toBeNull();
    });
  });

  describe('Search Operations', () => {
    it('should perform search with query', async () => {
      const mockResults: SearchResult[] = [
        {
          noteId: 'note1',
          title: 'Test Note',
          snippet: 'Test content',
          matchCount: 1,
          folderPath: 'Test Folder',
          lastModified: new Date(),
          highlights: []
        }
      ];
      
      (searchEngine.search as any).mockResolvedValue(mockResults);
      
      await useSearchStore.getState().search('test query');
      
      const state = useSearchStore.getState();
      expect(state.query).toBe('test query');
      expect(state.results).toEqual(mockResults);
      expect(state.isSearching).toBe(false);
      expect(state.error).toBeNull();
      expect(searchEngine.search).toHaveBeenCalledWith({
        query: 'test query',
        filters: {},
        fuzzy: true,
        maxResults: 50
      });
    });

    it('should handle empty query', async () => {
      await useSearchStore.getState().search('');
      
      const state = useSearchStore.getState();
      expect(state.query).toBe('');
      expect(state.results).toEqual([]);
      expect(searchEngine.search).not.toHaveBeenCalled();
    });

    it('should handle whitespace-only query', async () => {
      await useSearchStore.getState().search('   ');
      
      const state = useSearchStore.getState();
      expect(state.query).toBe('');
      expect(state.results).toEqual([]);
      expect(searchEngine.search).not.toHaveBeenCalled();
    });

    it('should set loading state during search', async () => {
      let resolveSearch: (value: SearchResult[]) => void;
      const searchPromise = new Promise<SearchResult[]>((resolve) => {
        resolveSearch = resolve;
      });
      
      (searchEngine.search as any).mockReturnValue(searchPromise);
      
      const searchPromiseResult = useSearchStore.getState().search('test');
      
      // Check loading state
      expect(useSearchStore.getState().isSearching).toBe(true);
      
      // Resolve the search
      resolveSearch!([]);
      await searchPromiseResult;
      
      // Check final state
      expect(useSearchStore.getState().isSearching).toBe(false);
    });

    it('should handle search errors', async () => {
      const error = new Error('Search failed');
      (searchEngine.search as any).mockRejectedValue(error);
      
      await useSearchStore.getState().search('test query');
      
      const state = useSearchStore.getState();
      expect(state.error).toBe('Search failed');
      expect(state.isSearching).toBe(false);
      expect(state.results).toEqual([]);
    });

    it('should clear search', () => {
      // Set some state first
      useSearchStore.setState({
        query: 'test',
        results: [{ noteId: 'note1' } as SearchResult],
        error: 'Some error',
        isSearching: true
      });
      
      useSearchStore.getState().clearSearch();
      
      const state = useSearchStore.getState();
      expect(state.query).toBe('');
      expect(state.results).toEqual([]);
      expect(state.error).toBeNull();
      expect(state.isSearching).toBe(false);
    });
  });

  describe('Filter Management', () => {
    it('should set filters', () => {
      const filters = { folderId: 'folder1' };
      
      useSearchStore.getState().setFilters(filters);
      
      const state = useSearchStore.getState();
      expect(state.filters).toEqual(filters);
    });

    it('should merge filters', () => {
      useSearchStore.setState({ filters: { folderId: 'folder1' } });
      
      useSearchStore.getState().setFilters({ 
        dateRange: { 
          start: new Date('2024-01-01'), 
          end: new Date('2024-01-31') 
        } 
      });
      
      const state = useSearchStore.getState();
      expect(state.filters.folderId).toBe('folder1');
      expect(state.filters.dateRange).toBeDefined();
    });

    it('should clear filters', () => {
      useSearchStore.setState({ 
        filters: { 
          folderId: 'folder1', 
          tags: ['tag1'] 
        } 
      });
      
      useSearchStore.getState().clearFilters();
      
      const state = useSearchStore.getState();
      expect(state.filters).toEqual({});
    });

    it('should re-run search when filters change', async () => {
      const mockResults: SearchResult[] = [];
      (searchEngine.search as any).mockResolvedValue(mockResults);
      
      // Set initial query
      useSearchStore.setState({ query: 'test query' });
      
      // Change filters
      useSearchStore.getState().setFilters({ folderId: 'folder1' });
      
      expect(searchEngine.search).toHaveBeenCalledWith({
        query: 'test query',
        filters: { folderId: 'folder1' },
        fuzzy: true,
        maxResults: 50
      });
    });

    it('should identify active filters', () => {
      const { hasActiveFilters } = useSearchStore.getState();
      
      expect(hasActiveFilters()).toBe(false);
      
      useSearchStore.setState({ filters: { folderId: 'folder1' } });
      expect(hasActiveFilters()).toBe(true);
      
      useSearchStore.setState({ filters: { tags: ['tag1'] } });
      expect(hasActiveFilters()).toBe(true);
      
      useSearchStore.setState({ 
        filters: { 
          dateRange: { 
            start: new Date(), 
            end: new Date() 
          } 
        } 
      });
      expect(hasActiveFilters()).toBe(true);
    });
  });

  describe('Recent Queries', () => {
    it('should add recent queries', () => {
      useSearchStore.getState().addRecentQuery('query1');
      useSearchStore.getState().addRecentQuery('query2');
      
      const state = useSearchStore.getState();
      expect(state.recentQueries).toEqual(['query2', 'query1']);
    });

    it('should avoid duplicate recent queries', () => {
      useSearchStore.getState().addRecentQuery('query1');
      useSearchStore.getState().addRecentQuery('query2');
      useSearchStore.getState().addRecentQuery('query1'); // Duplicate
      
      const state = useSearchStore.getState();
      expect(state.recentQueries).toEqual(['query1', 'query2']);
    });

    it('should limit recent queries count', () => {
      // Add more than the limit (10)
      for (let i = 0; i < 15; i++) {
        useSearchStore.getState().addRecentQuery(`query${i}`);
      }
      
      const state = useSearchStore.getState();
      expect(state.recentQueries).toHaveLength(10);
      expect(state.recentQueries[0]).toBe('query14'); // Most recent first
    });

    it('should clear recent queries', () => {
      useSearchStore.getState().addRecentQuery('query1');
      useSearchStore.getState().addRecentQuery('query2');
      
      useSearchStore.getState().clearRecentQueries();
      
      const state = useSearchStore.getState();
      expect(state.recentQueries).toEqual([]);
    });

    it('should ignore empty queries', () => {
      useSearchStore.getState().addRecentQuery('');
      useSearchStore.getState().addRecentQuery('   ');
      
      const state = useSearchStore.getState();
      expect(state.recentQueries).toEqual([]);
    });
  });

  describe('Recent Notes', () => {
    it('should update recent notes', () => {
      const noteIds = ['note1', 'note2', 'note3'];
      
      useSearchStore.getState().updateRecentNotes(noteIds);
      
      const state = useSearchStore.getState();
      expect(state.recentNotes).toEqual(noteIds);
    });

    it('should limit recent notes count', () => {
      const noteIds = Array.from({ length: 25 }, (_, i) => `note${i}`);
      
      useSearchStore.getState().updateRecentNotes(noteIds);
      
      const state = useSearchStore.getState();
      expect(state.recentNotes).toHaveLength(20);
    });
  });

  describe('Error Handling', () => {
    it('should set error', () => {
      useSearchStore.getState().setError('Test error');
      
      const state = useSearchStore.getState();
      expect(state.error).toBe('Test error');
    });

    it('should clear error', () => {
      useSearchStore.setState({ error: 'Test error' });
      
      useSearchStore.getState().clearError();
      
      const state = useSearchStore.getState();
      expect(state.error).toBeNull();
    });
  });

  describe('Computed Properties', () => {
    it('should check if has results', () => {
      const { hasResults } = useSearchStore.getState();
      
      expect(hasResults()).toBe(false);
      
      useSearchStore.setState({ 
        results: [{ noteId: 'note1' } as SearchResult] 
      });
      
      expect(hasResults()).toBe(true);
    });

    it('should get filtered results without active filters', () => {
      const mockResults: SearchResult[] = [
        { noteId: 'note1', folderPath: 'folder1', lastModified: new Date() } as SearchResult,
        { noteId: 'note2', folderPath: 'folder2', lastModified: new Date() } as SearchResult
      ];
      
      useSearchStore.setState({ results: mockResults });
      
      const { getFilteredResults } = useSearchStore.getState();
      expect(getFilteredResults()).toEqual(mockResults);
    });

    it('should filter results by folder', () => {
      const mockResults: SearchResult[] = [
        { noteId: 'note1', folderPath: 'folder1 > subfolder', lastModified: new Date() } as SearchResult,
        { noteId: 'note2', folderPath: 'folder2', lastModified: new Date() } as SearchResult
      ];
      
      useSearchStore.setState({ 
        results: mockResults,
        filters: { folderId: 'folder1' }
      });
      
      const { getFilteredResults } = useSearchStore.getState();
      const filtered = getFilteredResults();
      
      expect(filtered).toHaveLength(1);
      expect(filtered[0].noteId).toBe('note1');
    });

    it('should filter results by date range', () => {
      const oldDate = new Date('2024-01-01');
      const newDate = new Date('2024-01-15');
      
      const mockResults: SearchResult[] = [
        { noteId: 'note1', lastModified: oldDate } as SearchResult,
        { noteId: 'note2', lastModified: newDate } as SearchResult
      ];
      
      useSearchStore.setState({ 
        results: mockResults,
        filters: { 
          dateRange: { 
            start: new Date('2024-01-10'), 
            end: new Date('2024-01-20') 
          } 
        }
      });
      
      const { getFilteredResults } = useSearchStore.getState();
      const filtered = getFilteredResults();
      
      expect(filtered).toHaveLength(1);
      expect(filtered[0].noteId).toBe('note2');
    });
  });

  describe('Search Engine Integration', () => {
    it('should initialize search engine', async () => {
      const mockNotes = [{ id: 'note1' }];
      const mockFolders = [{ id: 'folder1' }];
      const mockRecentNotes = [{ id: 'note1' }];
      
      (searchEngine.getRecentNotes as any).mockReturnValue(mockRecentNotes);
      
      await useSearchStore.getState().initializeSearchEngine();
      
      expect(searchEngine.initialize).toHaveBeenCalled();
      expect(searchEngine.getRecentNotes).toHaveBeenCalledWith(20);
      
      const state = useSearchStore.getState();
      expect(state.recentNotes).toEqual(['note1']);
    });

    it('should handle initialization errors', async () => {
      const error = new Error('Initialization failed');
      (searchEngine.initialize as any).mockRejectedValue(error);
      
      await useSearchStore.getState().initializeSearchEngine();
      
      const state = useSearchStore.getState();
      expect(state.error).toBe('Initialization failed');
    });

    it('should index individual notes', async () => {
      const mockNote = { id: 'note1', title: 'Test' };
      
      // Mock the note store to return the note
      const mockNoteStore = {
        getNote: vi.fn().mockReturnValue(mockNote)
      };
      
      const { useNoteStore } = await import('../noteStore');
      vi.mocked(useNoteStore.getState).mockReturnValue(mockNoteStore as any);
      
      await useSearchStore.getState().indexNote('note1');
      
      expect(mockNoteStore.getNote).toHaveBeenCalledWith('note1');
      expect(searchEngine.indexNote).toHaveBeenCalledWith(mockNote);
    });

    it('should remove notes from index', () => {
      useSearchStore.getState().removeNoteFromIndex('note1');
      
      expect(searchEngine.removeFromIndex).toHaveBeenCalledWith('note1');
    });

    it('should update search index', async () => {
      // Mock the stores to return proper data
      const { useNoteStore } = await import('../noteStore');
      const { useFolderStore } = await import('../folderStore');
      
      vi.mocked(useNoteStore.getState).mockReturnValue({
        notes: { note1: { id: 'note1', title: 'Test' } }
      } as any);
      
      vi.mocked(useFolderStore.getState).mockReturnValue({
        folders: { folder1: { id: 'folder1', name: 'Test Folder' } }
      } as any);
      
      await useSearchStore.getState().updateSearchIndex();
      
      expect(searchEngine.initialize).toHaveBeenCalled();
    });
  });
});