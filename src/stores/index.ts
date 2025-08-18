/**
 * Store exports and utilities
 * Provides centralized access to all Zustand stores
 */

// Individual stores
export { useNoteStore } from './noteStore';
export { useFolderStore } from './folderStore';
export { useTagStore } from './tagStore';
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
  if (import.meta.env.DEV) {
    // Note: This function should be called after stores are imported
    // to avoid circular dependency issues
    return {
      notes: 'Use individual store getState() methods',
      folders: 'Use individual store getState() methods',
      ui: 'Use individual store getState() methods',
      search: 'Use individual store getState() methods',
      app: 'Use individual store getState() methods'
    };
  }
  return null;
};