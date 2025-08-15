/**
 * Unit tests for note store
 * Tests note CRUD operations and state management
 */

import { describe, it, expect, beforeEach, vi, Mock } from 'vitest';
import { useNoteStore } from '../noteStore';
import { databaseService } from '../../lib/db/DatabaseService';
import { Note, CreateNoteInput } from '../../types/note';

// Mock the database service
vi.mock('../../lib/db/DatabaseService', () => ({
  databaseService: {
    getAllNotes: vi.fn(),
    createNote: vi.fn(),
    updateNote: vi.fn(),
    deleteNote: vi.fn()
  }
}));

const mockDatabaseService = databaseService as {
  getAllNotes: Mock;
  createNote: Mock;
  updateNote: Mock;
  deleteNote: Mock;
};

describe('noteStore', () => {
  beforeEach(() => {
    // Reset store state
    useNoteStore.setState({
      notes: {},
      selectedNoteId: null,
      isLoading: false,
      isSaving: false,
      error: null
    });
    
    // Clear all mocks
    vi.clearAllMocks();
  });

  describe('loadNotes', () => {
    it('should load notes successfully', async () => {
      const mockNotes: Note[] = [
        {
          id: '1',
          title: 'Test Note 1',
          content: 'Content 1',
          folderId: 'folder1',
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01'),
          wordCount: 2,
          readingTime: 1
        },
        {
          id: '2',
          title: 'Test Note 2',
          content: 'Content 2',
          folderId: 'folder2',
          createdAt: new Date('2024-01-02'),
          updatedAt: new Date('2024-01-02'),
          wordCount: 2,
          readingTime: 1
        }
      ];

      mockDatabaseService.getAllNotes.mockResolvedValue({
        success: true,
        data: mockNotes
      });

      const store = useNoteStore.getState();
      await store.loadNotes();

      const state = useNoteStore.getState();
      expect(state.notes).toEqual({
        '1': mockNotes[0],
        '2': mockNotes[1]
      });
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
    });

    it('should handle load notes error', async () => {
      mockDatabaseService.getAllNotes.mockResolvedValue({
        success: false,
        error: 'Database error'
      });

      const store = useNoteStore.getState();
      await store.loadNotes();

      const state = useNoteStore.getState();
      expect(state.notes).toEqual({});
      expect(state.isLoading).toBe(false);
      expect(state.error).toBe('Database error');
    });
  });

  describe('createNote', () => {
    it('should create note successfully', async () => {
      const mockNote: Note = {
        id: 'new-note',
        title: 'New Note',
        content: '',
        folderId: 'folder1',
        createdAt: new Date(),
        updatedAt: new Date(),
        wordCount: 0,
        readingTime: 1
      };

      mockDatabaseService.createNote.mockResolvedValue({
        success: true,
        data: mockNote
      });

      const store = useNoteStore.getState();
      const noteId = await store.createNote('folder1', 'New Note');

      expect(noteId).toBe('new-note');
      
      const state = useNoteStore.getState();
      expect(state.notes['new-note']).toEqual(mockNote);
      expect(state.selectedNoteId).toBe('new-note');
      expect(state.isSaving).toBe(false);
      expect(state.error).toBeNull();
    });

    it('should handle create note error', async () => {
      mockDatabaseService.createNote.mockResolvedValue({
        success: false,
        error: 'Create failed'
      });

      const store = useNoteStore.getState();
      
      await expect(store.createNote('folder1', 'New Note')).rejects.toThrow('Create failed');
      
      const state = useNoteStore.getState();
      expect(state.isSaving).toBe(false);
      expect(state.error).toBe('Create failed');
    });
  });

  describe('updateNote', () => {
    beforeEach(() => {
      const mockNote: Note = {
        id: '1',
        title: 'Original Title',
        content: 'Original content',
        folderId: 'folder1',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
        wordCount: 2,
        readingTime: 1
      };

      useNoteStore.setState({
        notes: { '1': mockNote }
      });
    });

    it('should update note successfully', async () => {
      const updatedNote: Note = {
        id: '1',
        title: 'Updated Title',
        content: 'Updated content',
        folderId: 'folder1',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-02'),
        wordCount: 2,
        readingTime: 1
      };

      mockDatabaseService.updateNote.mockResolvedValue({
        success: true,
        data: updatedNote
      });

      const store = useNoteStore.getState();
      await store.updateNote('1', { title: 'Updated Title', content: 'Updated content' });

      const state = useNoteStore.getState();
      expect(state.notes['1']).toEqual(updatedNote);
      expect(state.isSaving).toBe(false);
      expect(state.error).toBeNull();
    });

    it('should handle update note error', async () => {
      mockDatabaseService.updateNote.mockResolvedValue({
        success: false,
        error: 'Update failed'
      });

      const store = useNoteStore.getState();
      await store.updateNote('1', { title: 'Updated Title' });

      const state = useNoteStore.getState();
      expect(state.isSaving).toBe(false);
      expect(state.error).toBe('Update failed');
    });
  });

  describe('deleteNote', () => {
    beforeEach(() => {
      const mockNotes: Record<string, Note> = {
        '1': {
          id: '1',
          title: 'Note 1',
          content: 'Content 1',
          folderId: 'folder1',
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01'),
          wordCount: 2,
          readingTime: 1
        },
        '2': {
          id: '2',
          title: 'Note 2',
          content: 'Content 2',
          folderId: 'folder1',
          createdAt: new Date('2024-01-02'),
          updatedAt: new Date('2024-01-02'),
          wordCount: 2,
          readingTime: 1
        }
      };

      useNoteStore.setState({
        notes: mockNotes,
        selectedNoteId: '1'
      });
    });

    it('should delete note successfully', async () => {
      mockDatabaseService.deleteNote.mockResolvedValue({
        success: true,
        data: true
      });

      const store = useNoteStore.getState();
      await store.deleteNote('1');

      const state = useNoteStore.getState();
      expect(state.notes['1']).toBeUndefined();
      expect(state.notes['2']).toBeDefined();
      expect(state.selectedNoteId).toBeNull(); // Should clear selection
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
    });

    it('should handle delete note error', async () => {
      mockDatabaseService.deleteNote.mockResolvedValue({
        success: false,
        error: 'Delete failed'
      });

      const store = useNoteStore.getState();
      await store.deleteNote('1');

      const state = useNoteStore.getState();
      expect(state.notes['1']).toBeDefined(); // Should still exist
      expect(state.isLoading).toBe(false);
      expect(state.error).toBe('Delete failed');
    });
  });

  describe('computed getters', () => {
    beforeEach(() => {
      const mockNotes: Record<string, Note> = {
        '1': {
          id: '1',
          title: 'Note 1',
          content: 'Content 1',
          folderId: 'folder1',
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-03'),
          wordCount: 2,
          readingTime: 1
        },
        '2': {
          id: '2',
          title: 'Note 2',
          content: 'Content 2',
          folderId: 'folder1',
          createdAt: new Date('2024-01-02'),
          updatedAt: new Date('2024-01-02'),
          wordCount: 2,
          readingTime: 1
        },
        '3': {
          id: '3',
          title: 'Note 3',
          content: 'Content 3',
          folderId: 'folder2',
          createdAt: new Date('2024-01-03'),
          updatedAt: new Date('2024-01-01'),
          wordCount: 2,
          readingTime: 1
        }
      };

      useNoteStore.setState({ notes: mockNotes });
    });

    it('should get note by id', () => {
      const store = useNoteStore.getState();
      const note = store.getNote('1');
      
      expect(note).toBeDefined();
      expect(note?.title).toBe('Note 1');
    });

    it('should get notes by folder', () => {
      const store = useNoteStore.getState();
      const notes = store.getNotesByFolder('folder1');
      
      expect(notes).toHaveLength(2);
      expect(notes[0].id).toBe('1'); // Most recently updated first
      expect(notes[1].id).toBe('2');
    });

    it('should get recent notes', () => {
      const store = useNoteStore.getState();
      const recentNotes = store.getRecentNotes(2);
      
      expect(recentNotes).toHaveLength(2);
      expect(recentNotes[0].id).toBe('1'); // Most recently updated first
      expect(recentNotes[1].id).toBe('2');
    });
  });

  describe('state management', () => {
    it('should select note', () => {
      const store = useNoteStore.getState();
      store.selectNote('test-note');
      
      const state = useNoteStore.getState();
      expect(state.selectedNoteId).toBe('test-note');
    });

    it('should clear error', () => {
      useNoteStore.setState({ error: 'Test error' });
      
      const store = useNoteStore.getState();
      store.clearError();
      
      const state = useNoteStore.getState();
      expect(state.error).toBeNull();
    });
  });
});