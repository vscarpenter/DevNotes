/**
 * Store exports and utilities
 * Provides centralized access to all Zustand stores
 */

// Individual stores
export { useNoteStore } from './noteStore';
export { useFolderStore } from './folderStore';
export { useUIStore } from './uiStore';
export { useSearchStore } from './searchStore';

// Main app store
export { useAppStore, useAppStoreWithInit } from './appStore';

// Types
export type { Theme, PanelLayout, SaveStatus } from './uiStore';

// Store utilities
export const clearAllStores = () => {
  // Clear persisted data (UI preferences will remain)
  localStorage.removeItem('devnotes-ui-store');
};

// Development utilities
export const getStoreStates = () => {
  if (process.env.NODE_ENV === 'development') {
    return {
      notes: useNoteStore.getState(),
      folders: useFolderStore.getState(),
      ui: useUIStore.getState(),
      search: useSearchStore.getState(),
      app: useAppStore.getState()
    };
  }
  return null;
};