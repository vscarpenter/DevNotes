/**
 * Integration tests for store interactions
 * Tests how stores work together in realistic scenarios
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useAppStoreWithInit } from '../appStore';
import { useNoteStore } from '../noteStore';
import { useFolderStore } from '../folderStore';
import { useUIStore } from '../uiStore';
import { useSearchStore } from '../searchStore';

// Mock the database service
vi.mock('../../lib/db/DatabaseService', () => ({
  databaseService: {
    getAllNotes: vi.fn().mockResolvedValue({ success: true, data: [] }),
    getAllFolders: vi.fn().mockResolvedValue({ success: true, data: [] }),
    createNote: vi.fn(),
    createFolder: vi.fn(),
    updateNote: vi.fn(),
    updateFolder: vi.fn(),
    deleteNote: vi.fn(),
    deleteFolder: vi.fn()
  }
}));

describe('Store Integration', () => {
  beforeEach(() => {
    // Reset all stores
    useNoteStore.setState({
      notes: {},
      selectedNoteId: null,
      isLoading: false,
      isSaving: false,
      error: null
    });

    useFolderStore.setState({
      folders: {},
      selectedFolderId: null,
      expandedFolders: new Set(),
      isLoading: false,
      error: null
    });

    useUIStore.setState({
      sidebarWidth: 300,
      isSidebarCollapsed: false,
      panelLayout: 'split',
      theme: 'system',
      isDarkMode: false,
      isPreviewMode: false,
      showLineNumbers: true,
      wordWrap: true,
      fontSize: 14,
      isLoading: false,
      saveStatus: 'saved',
      error: null,
      isSearchOpen: false,
      searchQuery: '',
      activeModal: null
    });

    useSearchStore.setState({
      query: '',
      results: [],
      filters: {},
      isSearching: false,
      recentQueries: [],
      recentNotes: [],
      error: null
    });

    vi.clearAllMocks();
  });

  it('should maintain consistent state across stores', () => {
    // Test that stores can be accessed independently
    const noteStore = useNoteStore.getState();
    const folderStore = useFolderStore.getState();
    const uiStore = useUIStore.getState();
    const searchStore = useSearchStore.getState();

    expect(noteStore.notes).toEqual({});
    expect(folderStore.folders).toEqual({});
    expect(uiStore.isLoading).toBe(false);
    expect(searchStore.query).toBe('');
  });

  it('should handle UI state changes independently', () => {
    const uiStore = useUIStore.getState();
    
    // Change UI settings
    uiStore.setSidebarWidth(400);
    uiStore.setTheme('dark');
    uiStore.togglePreviewMode();
    
    const updatedState = useUIStore.getState();
    expect(updatedState.sidebarWidth).toBe(400);
    expect(updatedState.theme).toBe('dark');
    expect(updatedState.isDarkMode).toBe(true);
    expect(updatedState.isPreviewMode).toBe(true);
    
    // Other stores should be unaffected
    expect(useNoteStore.getState().notes).toEqual({});
    expect(useFolderStore.getState().folders).toEqual({});
  });

  it('should handle search state independently', () => {
    const searchStore = useSearchStore.getState();
    
    // Add recent queries
    searchStore.addRecentQuery('test query 1');
    searchStore.addRecentQuery('test query 2');
    
    // Set filters
    searchStore.setFilters({ folderId: 'folder1' });
    
    const updatedState = useSearchStore.getState();
    expect(updatedState.recentQueries).toEqual(['test query 2', 'test query 1']);
    expect(updatedState.filters).toEqual({ folderId: 'folder1' });
    expect(updatedState.hasActiveFilters()).toBe(true);
    
    // Other stores should be unaffected
    expect(useNoteStore.getState().selectedNoteId).toBeNull();
    expect(useFolderStore.getState().selectedFolderId).toBeNull();
  });

  it('should handle error states independently', () => {
    // Set errors in different stores
    useNoteStore.setState({ error: 'Note error' });
    useFolderStore.setState({ error: 'Folder error' });
    useUIStore.setState({ error: 'UI error' });
    useSearchStore.setState({ error: 'Search error' });
    
    // Each store should maintain its own error
    expect(useNoteStore.getState().error).toBe('Note error');
    expect(useFolderStore.getState().error).toBe('Folder error');
    expect(useUIStore.getState().error).toBe('UI error');
    expect(useSearchStore.getState().error).toBe('Search error');
    
    // Clear errors individually
    useNoteStore.getState().clearError();
    expect(useNoteStore.getState().error).toBeNull();
    expect(useFolderStore.getState().error).toBe('Folder error'); // Should still exist
  });

  it('should handle loading states independently', () => {
    // Set loading states
    useNoteStore.setState({ isLoading: true });
    useFolderStore.setState({ isLoading: true });
    useUIStore.setState({ isLoading: true });
    useSearchStore.setState({ isSearching: true });
    
    // Each store should maintain its own loading state
    expect(useNoteStore.getState().isLoading).toBe(true);
    expect(useFolderStore.getState().isLoading).toBe(true);
    expect(useUIStore.getState().isLoading).toBe(true);
    expect(useSearchStore.getState().isSearching).toBe(true);
    
    // Clear loading states individually
    useNoteStore.setState({ isLoading: false });
    expect(useNoteStore.getState().isLoading).toBe(false);
    expect(useFolderStore.getState().isLoading).toBe(true); // Should still be loading
  });

  it('should maintain selection states independently', () => {
    // Set selections
    useNoteStore.getState().selectNote('note1');
    useFolderStore.getState().selectFolder('folder1');
    
    expect(useNoteStore.getState().selectedNoteId).toBe('note1');
    expect(useFolderStore.getState().selectedFolderId).toBe('folder1');
    
    // Clear one selection
    useNoteStore.getState().selectNote(null);
    expect(useNoteStore.getState().selectedNoteId).toBeNull();
    expect(useFolderStore.getState().selectedFolderId).toBe('folder1'); // Should remain
  });

  it('should handle computed getters correctly', () => {
    // Test UI store getters
    const uiStore = useUIStore.getState();
    expect(uiStore.getEffectiveTheme()).toBe('light'); // Default in test environment
    expect(uiStore.isModalOpen('test-modal')).toBe(false);
    
    uiStore.openModal('test-modal');
    expect(uiStore.isModalOpen('test-modal')).toBe(true);
    
    // Test search store getters
    const searchStore = useSearchStore.getState();
    expect(searchStore.hasResults()).toBe(false);
    expect(searchStore.hasActiveFilters()).toBe(false);
    
    searchStore.setFilters({ folderId: 'folder1' });
    expect(searchStore.hasActiveFilters()).toBe(true);
  });
});