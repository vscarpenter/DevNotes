/**
 * Main application store that combines all individual stores
 * Provides a unified interface and handles cross-store interactions
 * Requirements: 2.1, 2.2, 2.4, 2.5, 3.1, 3.2, 3.4
 */

import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { useNoteStore } from './noteStore';
import { useFolderStore } from './folderStore';
import { useUIStore } from './uiStore';
import { useSearchStore } from './searchStore';

interface AppStore {
  // Initialization
  initialize: () => Promise<void>;
  isInitialized: boolean;
  
  // Cross-store actions
  createNoteInFolder: (folderId: string, title?: string) => Promise<string>;
  deleteNoteAndUpdateUI: (noteId: string) => Promise<void>;
  deleteFolderAndUpdateUI: (folderId: string) => Promise<void>;
  selectNoteAndFolder: (noteId: string) => void;
  
  // Bulk operations
  refreshData: () => Promise<void>;
  
  // Error handling
  handleError: (error: string, context?: string) => void;
  clearAllErrors: () => void;
}

export const useAppStore = create<AppStore>()(
  subscribeWithSelector((set, get) => ({
    isInitialized: false,

    initialize: async () => {
      try {
        // Set loading state
        useUIStore.getState().setLoading(true);
        useUIStore.getState().clearError();

        // Load data from database
        await Promise.all([
          useNoteStore.getState().loadNotes(),
          useFolderStore.getState().loadFolders()
        ]);

        // Update recent notes in search store
        const recentNotes = useNoteStore.getState().getRecentNotes(20);
        useSearchStore.getState().updateRecentNotes(recentNotes.map(note => note.id));

        // Handle PWA shortcuts
        const pwaAction = sessionStorage.getItem('pwa-action');
        if (pwaAction) {
          sessionStorage.removeItem('pwa-action');
          
          switch (pwaAction) {
            case 'new-note':
              // Create a new note in the root folder or selected folder
              const selectedFolderId = useFolderStore.getState().selectedFolderId;
              const targetFolderId = selectedFolderId || 'root';
              await get().createNoteInFolder(targetFolderId, 'New Note');
              break;
              
            case 'search':
              // Open search interface
              useUIStore.getState().setSearchOpen(true);
              break;
          }
        }

        set({ isInitialized: true });
        useUIStore.getState().setLoading(false);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to initialize application';
        get().handleError(errorMessage, 'initialization');
        useUIStore.getState().setLoading(false);
      }
    },

    createNoteInFolder: async (folderId: string, title?: string) => {
      try {
        // Select the folder first
        useFolderStore.getState().selectFolder(folderId);
        
        // Create the note
        const noteId = await useNoteStore.getState().createNote(folderId, title);
        
        // Select the new note
        useNoteStore.getState().selectNote(noteId);
        
        // Update recent notes
        const recentNotes = useNoteStore.getState().getRecentNotes(20);
        useSearchStore.getState().updateRecentNotes(recentNotes.map(note => note.id));
        
        return noteId;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to create note';
        get().handleError(errorMessage, 'note creation');
        throw error;
      }
    },

    deleteNoteAndUpdateUI: async (noteId: string) => {
      try {
        // Check if the note is selected before deletion
        const isSelected = useNoteStore.getState().selectedNoteId === noteId;
        
        // Delete the note
        await useNoteStore.getState().deleteNote(noteId);
        
        // If the deleted note was selected, clear selection
        if (isSelected) {
          useNoteStore.getState().selectNote(null);
        }
        
        // Update recent notes
        const recentNotes = useNoteStore.getState().getRecentNotes(20);
        useSearchStore.getState().updateRecentNotes(recentNotes.map(note => note.id));
        
        // Clear search if the deleted note was in results
        const searchResults = useSearchStore.getState().results;
        if (searchResults.some(result => result.noteId === noteId)) {
          const currentQuery = useSearchStore.getState().query;
          if (currentQuery) {
            useSearchStore.getState().search(currentQuery);
          }
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to delete note';
        get().handleError(errorMessage, 'note deletion');
        throw error;
      }
    },

    deleteFolderAndUpdateUI: async (folderId: string) => {
      try {
        // Get notes in the folder before deletion
        const notesInFolder = useNoteStore.getState().getNotesByFolder(folderId);
        const selectedNoteId = useNoteStore.getState().selectedNoteId;
        const selectedFolderId = useFolderStore.getState().selectedFolderId;
        
        // Delete the folder (this will cascade delete notes)
        await useFolderStore.getState().deleteFolder(folderId);
        
        // Reload notes to reflect the cascade deletion
        await useNoteStore.getState().loadNotes();
        
        // Clear selections if they were in the deleted folder
        if (selectedFolderId === folderId) {
          useFolderStore.getState().selectFolder(null);
        }
        
        if (selectedNoteId && notesInFolder.some(note => note.id === selectedNoteId)) {
          useNoteStore.getState().selectNote(null);
        }
        
        // Update recent notes
        const recentNotes = useNoteStore.getState().getRecentNotes(20);
        useSearchStore.getState().updateRecentNotes(recentNotes.map(note => note.id));
        
        // Refresh search results if needed
        const currentQuery = useSearchStore.getState().query;
        if (currentQuery) {
          useSearchStore.getState().search(currentQuery);
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to delete folder';
        get().handleError(errorMessage, 'folder deletion');
        throw error;
      }
    },

    selectNoteAndFolder: (noteId: string) => {
      const note = useNoteStore.getState().getNote(noteId);
      if (note) {
        // Select the note
        useNoteStore.getState().selectNote(noteId);
        
        // Select and expand the folder containing the note
        useFolderStore.getState().selectFolder(note.folderId);
        useFolderStore.getState().expandFolder(note.folderId);
        
        // Expand all parent folders to make the note visible
        let currentFolder = useFolderStore.getState().getFolder(note.folderId);
        while (currentFolder && currentFolder.parentId) {
          useFolderStore.getState().expandFolder(currentFolder.parentId);
          currentFolder = useFolderStore.getState().getFolder(currentFolder.parentId);
        }
      }
    },

    refreshData: async () => {
      try {
        useUIStore.getState().setLoading(true);
        
        await Promise.all([
          useNoteStore.getState().loadNotes(),
          useFolderStore.getState().loadFolders()
        ]);
        
        // Update recent notes
        const recentNotes = useNoteStore.getState().getRecentNotes(20);
        useSearchStore.getState().updateRecentNotes(recentNotes.map(note => note.id));
        
        // Refresh search results if there's an active query
        const currentQuery = useSearchStore.getState().query;
        if (currentQuery) {
          useSearchStore.getState().search(currentQuery);
        }
        
        useUIStore.getState().setLoading(false);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to refresh data';
        get().handleError(errorMessage, 'data refresh');
        useUIStore.getState().setLoading(false);
      }
    },

    handleError: (error: string, context?: string) => {
      const contextualError = context ? `${context}: ${error}` : error;
      
      // Set error in UI store
      useUIStore.getState().setError(contextualError);
      
      // Log error for debugging
      console.error('App Error:', contextualError);
      
      // Clear loading states
      useUIStore.getState().setLoading(false);
      useUIStore.getState().setSaveStatus('error');
    },

    clearAllErrors: () => {
      useUIStore.getState().clearError();
      useNoteStore.getState().clearError();
      useFolderStore.getState().clearError();
      useSearchStore.getState().clearError();
    }
  }))
);

// Auto-initialize when the store is first used
let isAutoInitialized = false;

export const useAppStoreWithInit = () => {
  const store = useAppStore();
  
  if (!isAutoInitialized && !store.isInitialized) {
    isAutoInitialized = true;
    store.initialize().catch(console.error);
  }
  
  return store;
};