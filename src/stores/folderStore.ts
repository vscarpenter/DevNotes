/**
 * Folder management store using Zustand
 * Handles folder CRUD operations and hierarchy management
 * Requirements: 3.1, 3.2, 3.4
 */

import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { Folder, CreateFolderInput, UpdateFolderInput } from '../types/note';
import { databaseService } from '../lib/db/DatabaseService';

interface FolderState {
  // State
  folders: Record<string, Folder>;
  selectedFolderId: string | null;
  expandedFolders: Set<string>;
  isLoading: boolean;
  error: string | null;

  // Actions
  loadFolders: () => Promise<void>;
  createFolder: (parentId: string | null, name: string) => Promise<string>;
  updateFolder: (id: string, updates: UpdateFolderInput) => Promise<void>;
  deleteFolder: (id: string) => Promise<void>;
  moveFolder: (folderId: string, targetParentId: string | null) => Promise<void>;
  selectFolder: (id: string | null) => void;
  toggleFolderExpansion: (id: string) => void;
  expandFolder: (id: string) => void;
  collapseFolder: (id: string) => void;
  clearError: () => void;
  
  // Computed getters
  getFolder: (id: string) => Folder | undefined;
  getRootFolders: () => Folder[];
  getChildFolders: (parentId: string) => Folder[];
  getFolderPath: (id: string) => string[];
  isFolderExpanded: (id: string) => boolean;
  getFolderHierarchy: () => Folder[];
}

export const useFolderStore = create<FolderState>()(
  subscribeWithSelector((set, get) => ({
    // Initial state
    folders: {},
    selectedFolderId: null,
    expandedFolders: new Set<string>(),
    isLoading: false,
    error: null,

    // Actions
    loadFolders: async () => {
      set({ isLoading: true, error: null });
      
      try {
        const result = await databaseService.getAllFolders();
        
        if (result.success && result.data) {
          const foldersMap = result.data.reduce((acc, folder) => {
            acc[folder.id] = folder;
            return acc;
          }, {} as Record<string, Folder>);
          
          // Restore expanded state from folder data
          const expandedFolders = new Set<string>();
          result.data.forEach(folder => {
            if (folder.isExpanded) {
              expandedFolders.add(folder.id);
            }
          });
          
          set({ 
            folders: foldersMap, 
            expandedFolders,
            isLoading: false 
          });
        } else {
          set({ error: result.error || 'Failed to load folders', isLoading: false });
        }
      } catch (error) {
        set({ 
          error: error instanceof Error ? error.message : 'Failed to load folders', 
          isLoading: false 
        });
      }
    },

    createFolder: async (parentId: string | null, name: string) => {
      set({ isLoading: true, error: null });
      
      try {
        const folderInput: CreateFolderInput = {
          name: name.trim(),
          parentId
        };

        const result = await databaseService.createFolder(folderInput);
        
        if (result.success && result.data) {
          const newFolder = result.data;
          set(state => ({
            folders: { ...state.folders, [newFolder.id]: newFolder },
            selectedFolderId: newFolder.id,
            isLoading: false
          }));
          
          // Expand parent folder if it exists
          if (parentId) {
            get().expandFolder(parentId);
          }
          
          return newFolder.id;
        } else {
          set({ error: result.error || 'Failed to create folder', isLoading: false });
          throw new Error(result.error || 'Failed to create folder');
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to create folder';
        set({ error: errorMessage, isLoading: false });
        throw error;
      }
    },

    updateFolder: async (id: string, updates: UpdateFolderInput) => {
      set({ isLoading: true, error: null });
      
      try {
        const result = await databaseService.updateFolder(id, updates);
        
        if (result.success && result.data) {
          const updatedFolder = result.data;
          set(state => ({
            folders: { ...state.folders, [id]: updatedFolder },
            isLoading: false
          }));
        } else {
          set({ error: result.error || 'Failed to update folder', isLoading: false });
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to update folder';
        set({ error: errorMessage, isLoading: false });
      }
    },

    deleteFolder: async (id: string) => {
      set({ isLoading: true, error: null });
      
      try {
        const result = await databaseService.deleteFolder(id);
        
        if (result.success) {
          set(state => {
            const { [id]: deleted, ...remainingFolders } = state.folders;
            const newExpandedFolders = new Set(state.expandedFolders);
            newExpandedFolders.delete(id);
            
            return {
              folders: remainingFolders,
              selectedFolderId: state.selectedFolderId === id ? null : state.selectedFolderId,
              expandedFolders: newExpandedFolders,
              isLoading: false
            };
          });
        } else {
          set({ error: result.error || 'Failed to delete folder', isLoading: false });
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to delete folder';
        set({ error: errorMessage, isLoading: false });
      }
    },

    moveFolder: async (folderId: string, targetParentId: string | null) => {
      set({ isLoading: true, error: null });
      
      try {
        // Prevent moving a folder into itself or its descendants
        if (targetParentId && get().isDescendantOf(folderId, targetParentId)) {
          throw new Error('Cannot move folder into itself or its descendants');
        }

        const result = await databaseService.updateFolder(folderId, { parentId: targetParentId });
        
        if (result.success && result.data) {
          const updatedFolder = result.data;
          set(state => ({
            folders: { ...state.folders, [folderId]: updatedFolder },
            isLoading: false
          }));
          
          // Expand target parent folder if it exists
          if (targetParentId) {
            get().expandFolder(targetParentId);
          }
        } else {
          set({ error: result.error || 'Failed to move folder', isLoading: false });
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to move folder';
        set({ error: errorMessage, isLoading: false });
      }
    },

    selectFolder: (id: string | null) => {
      set({ selectedFolderId: id });
    },

    toggleFolderExpansion: (id: string) => {
      const isExpanded = get().expandedFolders.has(id);
      if (isExpanded) {
        get().collapseFolder(id);
      } else {
        get().expandFolder(id);
      }
    },

    expandFolder: (id: string) => {
      set(state => {
        const newExpandedFolders = new Set(state.expandedFolders);
        newExpandedFolders.add(id);
        return { expandedFolders: newExpandedFolders };
      });
      
      // Persist expansion state to database
      databaseService.updateFolder(id, { isExpanded: true }).catch(console.error);
    },

    collapseFolder: (id: string) => {
      set(state => {
        const newExpandedFolders = new Set(state.expandedFolders);
        newExpandedFolders.delete(id);
        return { expandedFolders: newExpandedFolders };
      });
      
      // Persist expansion state to database
      databaseService.updateFolder(id, { isExpanded: false }).catch(console.error);
    },

    clearError: () => {
      set({ error: null });
    },

    // Computed getters
    getFolder: (id: string) => {
      return get().folders[id];
    },

    getRootFolders: () => {
      const folders = Object.values(get().folders);
      return folders
        .filter(folder => folder.parentId === null)
        .sort((a, b) => a.name.localeCompare(b.name));
    },

    getChildFolders: (parentId: string) => {
      const folders = Object.values(get().folders);
      return folders
        .filter(folder => folder.parentId === parentId)
        .sort((a, b) => a.name.localeCompare(b.name));
    },

    getFolderPath: (id: string) => {
      const path: string[] = [];
      let currentFolder = get().folders[id];
      
      while (currentFolder) {
        path.unshift(currentFolder.name);
        currentFolder = currentFolder.parentId ? get().folders[currentFolder.parentId] : undefined;
      }
      
      return path;
    },

    isFolderExpanded: (id: string) => {
      return get().expandedFolders.has(id);
    },

    getFolderHierarchy: () => {
      const folders = Object.values(get().folders);
      const rootFolders = folders.filter(folder => folder.parentId === null);
      
      const buildHierarchy = (folder: Folder): Folder[] => {
        const children = folders.filter(f => f.parentId === folder.id);
        const result = [folder];
        
        children.forEach(child => {
          result.push(...buildHierarchy(child));
        });
        
        return result;
      };
      
      const hierarchy: Folder[] = [];
      rootFolders.forEach(root => {
        hierarchy.push(...buildHierarchy(root));
      });
      
      return hierarchy;
    },

    // Helper method to check if a folder is a descendant of another
    isDescendantOf: (folderId: string, potentialAncestorId: string): boolean => {
      const folder = get().folders[folderId];
      if (!folder || !folder.parentId) return false;
      
      if (folder.parentId === potentialAncestorId) return true;
      
      return get().isDescendantOf(folder.parentId, potentialAncestorId);
    }
  }))
);