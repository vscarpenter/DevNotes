/**
 * Unit tests for app store
 * Tests cross-store interactions and initialization
 */

import { describe, it, expect, beforeEach, vi, Mock } from 'vitest';
import { useAppStore } from '../appStore';
import { useNoteStore } from '../noteStore';
import { useFolderStore } from '../folderStore';
import { useUIStore } from '../uiStore';
import { useSearchStore } from '../searchStore';
import { Note, Folder } from '../../types/note';

// Mock all individual stores
vi.mock('../noteStore', () => ({
  useNoteStore: {
    getState: vi.fn()
  }
}));

vi.mock('../folderStore', () => ({
  useFolderStore: {
    getState: vi.fn()
  }
}));

vi.mock('../uiStore', () => ({
  useUIStore: {
    getState: vi.fn()
  }
}));

vi.mock('../searchStore', () => ({
  useSearchStore: {
    getState: vi.fn()
  }
}));

const mockNoteStore = useNoteStore as { getState: Mock };
const mockFolderStore = useFolderStore as { getState: Mock };
const mockUIStore = useUIStore as { getState: Mock };
const mockSearchStore = useSearchStore as { getState: Mock };

describe('appStore', () => {
  let mockNoteActions: any;
  let mockFolderActions: any;
  let mockUIActions: any;
  let mockSearchActions: any;

  beforeEach(() => {
    // Reset app store state
    useAppStore.setState({
      isInitialized: false
    });

    // Setup mock store actions
    mockNoteActions = {
      loadNotes: vi.fn(),
      createNote: vi.fn(),
      deleteNote: vi.fn(),
      selectNote: vi.fn(),
      getNote: vi.fn(),
      getNotesByFolder: vi.fn(),
      getRecentNotes: vi.fn(),
      selectedNoteId: null
    };

    mockFolderActions = {
      loadFolders: vi.fn(),
      deleteFolder: vi.fn(),
      selectFolder: vi.fn(),
      expandFolder: vi.fn(),
      getFolder: vi.fn(),
      selectedFolderId: null
    };

    mockUIActions = {
      setLoading: vi.fn(),
      clearError: vi.fn(),
      setError: vi.fn(),
      setSaveStatus: vi.fn()
    };

    mockSearchActions = {
      updateRecentNotes: vi.fn(),
      search: vi.fn(),
      results: [],
      query: ''
    };

    // Setup mock store getState returns
    mockNoteStore.getState.mockReturnValue(mockNoteActions);
    mockFolderStore.getState.mockReturnValue(mockFolderActions);
    mockUIStore.getState.mockReturnValue(mockUIActions);
    mockSearchStore.getState.mockReturnValue(mockSearchActions);

    // Clear all mocks
    vi.clearAllMocks();
  });

  describe('initialization', () => {
    it('should initialize successfully', async () => {
      const mockNotes: Note[] = [
        {
          id: '1',
          title: 'Test Note',
          content: 'Content',
          folderId: 'folder1',
          createdAt: new Date(),
          updatedAt: new Date(),
          wordCount: 1,
          readingTime: 1
        }
      ];

      mockNoteActions.loadNotes.mockResolvedValue(undefined);
      mockFolderActions.loadFolders.mockResolvedValue(undefined);
      mockNoteActions.getRecentNotes.mockReturnValue(mockNotes);

      const store = useAppStore.getState();
      await store.initialize();

      expect(mockUIActions.setLoading).toHaveBeenCalledWith(true);
      expect(mockUIActions.clearError).toHaveBeenCalled();
      expect(mockNoteActions.loadNotes).toHaveBeenCalled();
      expect(mockFolderActions.loadFolders).toHaveBeenCalled();
      expect(mockSearchActions.updateRecentNotes).toHaveBeenCalledWith(['1']);
      expect(mockUIActions.setLoading).toHaveBeenCalledWith(false);
      
      const state = useAppStore.getState();
      expect(state.isInitialized).toBe(true);
    });

    it('should handle initialization error', async () => {
      const error = new Error('Initialization failed');
      mockNoteActions.loadNotes.mockRejectedValue(error);

      const store = useAppStore.getState();
      await store.initialize();

      expect(mockUIActions.setLoading).toHaveBeenCalledWith(false);
      
      const state = useAppStore.getState();
      expect(state.isInitialized).toBe(false);
    });
  });

  describe('createNoteInFolder', () => {
    it('should create note and update UI', async () => {
      const mockNotes: Note[] = [
        {
          id: 'new-note',
          title: 'New Note',
          content: '',
          folderId: 'folder1',
          createdAt: new Date(),
          updatedAt: new Date(),
          wordCount: 0,
          readingTime: 1
        }
      ];

      mockNoteActions.createNote.mockResolvedValue('new-note');
      mockNoteActions.getRecentNotes.mockReturnValue(mockNotes);

      const store = useAppStore.getState();
      const noteId = await store.createNoteInFolder('folder1', 'New Note');

      expect(noteId).toBe('new-note');
      expect(mockFolderActions.selectFolder).toHaveBeenCalledWith('folder1');
      expect(mockNoteActions.createNote).toHaveBeenCalledWith('folder1', 'New Note');
      expect(mockNoteActions.selectNote).toHaveBeenCalledWith('new-note');
      expect(mockSearchActions.updateRecentNotes).toHaveBeenCalledWith(['new-note']);
    });

    it('should handle create note error', async () => {
      const error = new Error('Create failed');
      mockNoteActions.createNote.mockRejectedValue(error);

      const store = useAppStore.getState();
      
      await expect(store.createNoteInFolder('folder1', 'New Note')).rejects.toThrow('Create failed');
    });
  });

  describe('deleteNoteAndUpdateUI', () => {
    it('should delete note and clear selection if selected', async () => {
      const mockNote: Note = {
        id: 'note1',
        title: 'Test Note',
        content: 'Content',
        folderId: 'folder1',
        createdAt: new Date(),
        updatedAt: new Date(),
        wordCount: 1,
        readingTime: 1
      };

      mockNoteActions.getNote.mockReturnValue(mockNote);
      mockNoteActions.selectedNoteId = 'note1';
      mockNoteActions.deleteNote.mockResolvedValue(undefined);
      mockNoteActions.getRecentNotes.mockReturnValue([]);
      mockSearchActions.results = [];

      const store = useAppStore.getState();
      await store.deleteNoteAndUpdateUI('note1');

      expect(mockNoteActions.deleteNote).toHaveBeenCalledWith('note1');
      expect(mockNoteActions.selectNote).toHaveBeenCalledWith(null);
      expect(mockSearchActions.updateRecentNotes).toHaveBeenCalledWith([]);
    });

    it('should not clear selection if different note selected', async () => {
      const mockNote: Note = {
        id: 'note1',
        title: 'Test Note',
        content: 'Content',
        folderId: 'folder1',
        createdAt: new Date(),
        updatedAt: new Date(),
        wordCount: 1,
        readingTime: 1
      };

      mockNoteActions.getNote.mockReturnValue(mockNote);
      mockNoteActions.selectedNoteId = 'note2'; // Different note selected
      mockNoteActions.deleteNote.mockResolvedValue(undefined);
      mockNoteActions.getRecentNotes.mockReturnValue([]);
      mockSearchActions.results = [];

      const store = useAppStore.getState();
      await store.deleteNoteAndUpdateUI('note1');

      expect(mockNoteActions.deleteNote).toHaveBeenCalledWith('note1');
      expect(mockNoteActions.selectNote).not.toHaveBeenCalled();
    });

    it('should refresh search if deleted note was in results', async () => {
      const mockNote: Note = {
        id: 'note1',
        title: 'Test Note',
        content: 'Content',
        folderId: 'folder1',
        createdAt: new Date(),
        updatedAt: new Date(),
        wordCount: 1,
        readingTime: 1
      };

      mockNoteActions.getNote.mockReturnValue(mockNote);
      mockNoteActions.deleteNote.mockResolvedValue(undefined);
      mockNoteActions.getRecentNotes.mockReturnValue([]);
      mockSearchActions.results = [
        {
          noteId: 'note1',
          title: 'Test Note',
          snippet: 'Content',
          matchCount: 1,
          folderPath: 'folder1',
          lastModified: new Date(),
          highlights: []
        }
      ];
      mockSearchActions.query = 'test query';

      const store = useAppStore.getState();
      await store.deleteNoteAndUpdateUI('note1');

      expect(mockSearchActions.search).toHaveBeenCalledWith('test query');
    });
  });

  describe('deleteFolderAndUpdateUI', () => {
    it('should delete folder and update UI', async () => {
      const mockNotesInFolder: Note[] = [
        {
          id: 'note1',
          title: 'Note in folder',
          content: 'Content',
          folderId: 'folder1',
          createdAt: new Date(),
          updatedAt: new Date(),
          wordCount: 1,
          readingTime: 1
        }
      ];

      mockNoteActions.getNotesByFolder.mockReturnValue(mockNotesInFolder);
      mockNoteActions.selectedNoteId = 'note1';
      mockFolderActions.selectedFolderId = 'folder1';
      mockFolderActions.deleteFolder.mockResolvedValue(undefined);
      mockNoteActions.loadNotes.mockResolvedValue(undefined);
      mockNoteActions.getRecentNotes.mockReturnValue([]);
      mockSearchActions.query = '';

      const store = useAppStore.getState();
      await store.deleteFolderAndUpdateUI('folder1');

      expect(mockFolderActions.deleteFolder).toHaveBeenCalledWith('folder1');
      expect(mockNoteActions.loadNotes).toHaveBeenCalled();
      expect(mockFolderActions.selectFolder).toHaveBeenCalledWith(null);
      expect(mockNoteActions.selectNote).toHaveBeenCalledWith(null);
      expect(mockSearchActions.updateRecentNotes).toHaveBeenCalledWith([]);
    });
  });

  describe('selectNoteAndFolder', () => {
    it('should select note and expand folder hierarchy', () => {
      const mockNote: Note = {
        id: 'note1',
        title: 'Test Note',
        content: 'Content',
        folderId: 'child-folder',
        createdAt: new Date(),
        updatedAt: new Date(),
        wordCount: 1,
        readingTime: 1
      };

      const mockChildFolder: Folder = {
        id: 'child-folder',
        name: 'Child Folder',
        parentId: 'parent-folder',
        children: [],
        notes: ['note1'],
        createdAt: new Date(),
        updatedAt: new Date(),
        isExpanded: false
      };

      const mockParentFolder: Folder = {
        id: 'parent-folder',
        name: 'Parent Folder',
        parentId: null,
        children: ['child-folder'],
        notes: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        isExpanded: false
      };

      mockNoteActions.getNote.mockReturnValue(mockNote);
      mockFolderActions.getFolder
        .mockReturnValueOnce(mockChildFolder)
        .mockReturnValueOnce(mockParentFolder)
        .mockReturnValueOnce(undefined); // No grandparent

      const store = useAppStore.getState();
      store.selectNoteAndFolder('note1');

      expect(mockNoteActions.selectNote).toHaveBeenCalledWith('note1');
      expect(mockFolderActions.selectFolder).toHaveBeenCalledWith('child-folder');
      expect(mockFolderActions.expandFolder).toHaveBeenCalledWith('child-folder');
      expect(mockFolderActions.expandFolder).toHaveBeenCalledWith('parent-folder');
    });
  });

  describe('refreshData', () => {
    it('should refresh all data', async () => {
      mockNoteActions.loadNotes.mockResolvedValue(undefined);
      mockFolderActions.loadFolders.mockResolvedValue(undefined);
      mockNoteActions.getRecentNotes.mockReturnValue([]);
      mockSearchActions.query = '';

      const store = useAppStore.getState();
      await store.refreshData();

      expect(mockUIActions.setLoading).toHaveBeenCalledWith(true);
      expect(mockNoteActions.loadNotes).toHaveBeenCalled();
      expect(mockFolderActions.loadFolders).toHaveBeenCalled();
      expect(mockSearchActions.updateRecentNotes).toHaveBeenCalledWith([]);
      expect(mockUIActions.setLoading).toHaveBeenCalledWith(false);
    });

    it('should refresh search if query exists', async () => {
      mockNoteActions.loadNotes.mockResolvedValue(undefined);
      mockFolderActions.loadFolders.mockResolvedValue(undefined);
      mockNoteActions.getRecentNotes.mockReturnValue([]);
      mockSearchActions.query = 'test query';

      const store = useAppStore.getState();
      await store.refreshData();

      expect(mockSearchActions.search).toHaveBeenCalledWith('test query');
    });
  });

  describe('error handling', () => {
    it('should handle error with context', () => {
      const store = useAppStore.getState();
      store.handleError('Test error', 'test context');

      expect(mockUIActions.setError).toHaveBeenCalledWith('test context: Test error');
      expect(mockUIActions.setLoading).toHaveBeenCalledWith(false);
      expect(mockUIActions.setSaveStatus).toHaveBeenCalledWith('error');
    });

    it('should handle error without context', () => {
      const store = useAppStore.getState();
      store.handleError('Test error');

      expect(mockUIActions.setError).toHaveBeenCalledWith('Test error');
    });

    it('should clear all errors', () => {
      const mockClearError = vi.fn();
      mockUIActions.clearError = mockClearError;
      mockNoteActions.clearError = vi.fn();
      mockFolderActions.clearError = vi.fn();
      mockSearchActions.clearError = vi.fn();

      const store = useAppStore.getState();
      store.clearAllErrors();

      expect(mockUIActions.clearError).toHaveBeenCalled();
      expect(mockNoteActions.clearError).toHaveBeenCalled();
      expect(mockFolderActions.clearError).toHaveBeenCalled();
      expect(mockSearchActions.clearError).toHaveBeenCalled();
    });
  });
});