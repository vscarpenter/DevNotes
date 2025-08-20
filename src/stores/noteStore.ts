/**
 * Note management store using Zustand
 * Handles note CRUD operations and state management
 * Requirements: 2.1, 2.2, 2.4, 2.5
 */

import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { Note, CreateNoteInput, UpdateNoteInput } from '../types/note';
import { databaseService } from '../lib/db/DatabaseService';

interface NoteState {
  // State
  notes: Record<string, Note>;
  selectedNoteId: string | null;
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;

  // Actions
  loadNotes: () => Promise<void>;
  createNote: (folderId: string, title?: string) => Promise<string>;
  updateNote: (id: string, updates: UpdateNoteInput) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;
  moveNote: (noteId: string, targetFolderId: string) => Promise<void>;
  duplicateNote: (id: string) => Promise<string>;
  selectNote: (id: string | null) => void;
  clearError: () => void;
  
  // Computed getters
  getNote: (id: string) => Note | undefined;
  getNotesByFolder: (folderId: string) => Note[];
  getRecentNotes: (limit?: number) => Note[];
}

export const useNoteStore = create<NoteState>()(
  subscribeWithSelector((set, get) => ({
    // Initial state
    notes: {},
    selectedNoteId: null,
    isLoading: false,
    isSaving: false,
    error: null,

    // Actions
    loadNotes: async () => {
      set({ isLoading: true, error: null });
      
      try {
        const result = await databaseService.getAllNotes();
        
        if (result.success && result.data) {
          const notesMap = result.data.reduce((acc, note) => {
            acc[note.id] = note;
            return acc;
          }, {} as Record<string, Note>);
          
          set({ notes: notesMap, isLoading: false });
        } else {
          set({ error: result.error || 'Failed to load notes', isLoading: false });
        }
      } catch (error) {
        set({ 
          error: error instanceof Error ? error.message : 'Failed to load notes', 
          isLoading: false 
        });
      }
    },

    createNote: async (folderId: string, title?: string) => {
      set({ isSaving: true, error: null });
      
      try {
        const noteInput: CreateNoteInput = {
          title: title || 'Untitled Note',
          content: '',
          folderId,
          tags: []
        };

        const result = await databaseService.createNote(noteInput);
        
        if (result.success && result.data) {
          const newNote = result.data;
          set(state => ({
            notes: { ...state.notes, [newNote.id]: newNote },
            selectedNoteId: newNote.id,
            isSaving: false
          }));
          
          return newNote.id;
        } else {
          set({ error: result.error || 'Failed to create note', isSaving: false });
          throw new Error(result.error || 'Failed to create note');
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to create note';
        set({ error: errorMessage, isSaving: false });
        throw error;
      }
    },

    updateNote: async (id: string, updates: UpdateNoteInput) => {
      set({ isSaving: true, error: null });
      
      try {
        const result = await databaseService.updateNote(id, updates);
        
        if (result.success && result.data) {
          const updatedNote = result.data;
          set(state => ({
            notes: { ...state.notes, [id]: updatedNote },
            isSaving: false
          }));
        } else {
          set({ error: result.error || 'Failed to update note', isSaving: false });
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to update note';
        set({ error: errorMessage, isSaving: false });
      }
    },

    deleteNote: async (id: string) => {
      set({ isLoading: true, error: null });
      
      try {
        const result = await databaseService.deleteNote(id);
        
        if (result.success) {
          set(state => {
            const { [id]: _deleted, ...remainingNotes } = state.notes;
            return {
              notes: remainingNotes,
              selectedNoteId: state.selectedNoteId === id ? null : state.selectedNoteId,
              isLoading: false
            };
          });
        } else {
          set({ error: result.error || 'Failed to delete note', isLoading: false });
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to delete note';
        set({ error: errorMessage, isLoading: false });
      }
    },

    moveNote: async (noteId: string, targetFolderId: string) => {
      set({ isSaving: true, error: null });
      
      try {
        const result = await databaseService.updateNote(noteId, { folderId: targetFolderId });
        
        if (result.success && result.data) {
          const updatedNote = result.data;
          set(state => ({
            notes: { ...state.notes, [noteId]: updatedNote },
            isSaving: false
          }));
        } else {
          set({ error: result.error || 'Failed to move note', isSaving: false });
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to move note';
        set({ error: errorMessage, isSaving: false });
      }
    },

    duplicateNote: async (id: string) => {
      set({ isSaving: true, error: null });
      
      try {
        const originalNote = get().notes[id];
        if (!originalNote) {
          throw new Error('Note not found');
        }

        const duplicateInput: CreateNoteInput = {
          title: `${originalNote.title} (Copy)`,
          content: originalNote.content,
          folderId: originalNote.folderId,
          tags: [...(originalNote.tags || [])]
        };

        const result = await databaseService.createNote(duplicateInput);
        
        if (result.success && result.data) {
          const newNote = result.data;
          set(state => ({
            notes: { ...state.notes, [newNote.id]: newNote },
            isSaving: false
          }));
          
          return newNote.id;
        } else {
          set({ error: result.error || 'Failed to duplicate note', isSaving: false });
          throw new Error(result.error || 'Failed to duplicate note');
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to duplicate note';
        set({ error: errorMessage, isSaving: false });
        throw error;
      }
    },

    selectNote: (id: string | null) => {
      set({ selectedNoteId: id });
    },

    clearError: () => {
      set({ error: null });
    },

    // Computed getters
    getNote: (id: string) => {
      return get().notes[id];
    },

    getNotesByFolder: (folderId: string) => {
      const notes = Object.values(get().notes);
      return notes
        .filter(note => note.folderId === folderId)
        .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
    },

    getRecentNotes: (limit = 10) => {
      const notes = Object.values(get().notes);
      return notes
        .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
        .slice(0, limit);
    }
  }))
);