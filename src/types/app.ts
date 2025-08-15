/**
 * Application state and UI-related type definitions
 * Requirements: 2.1, 3.1
 */

import { Note, Folder } from './note';
import { SearchResult } from './search';

export interface AppState {
  // Data state
  notes: Record<string, Note>;
  folders: Record<string, Folder>;
  
  // UI state
  selectedNoteId: string | null;
  selectedFolderId: string | null;
  searchQuery: string;
  searchResults: SearchResult[];
  sidebarWidth: number;
  isDarkMode: boolean;
  isPreviewMode: boolean;
  
  // Loading states
  isLoading: boolean;
  isSaving: boolean;
  
  // Error state
  error: string | null;
}

export interface UIState {
  selectedNoteId: string | null;
  selectedFolderId: string | null;
  sidebarWidth: number;
  isDarkMode: boolean;
  isPreviewMode: boolean;
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
}

export interface DataState {
  notes: Record<string, Note>;
  folders: Record<string, Folder>;
}

export interface SearchState {
  query: string;
  results: SearchResult[];
  isSearching: boolean;
}

// Theme types
export type Theme = 'light' | 'dark' | 'system';

// Panel layout types
export type PanelLayout = 'split' | 'editor-only' | 'preview-only';

// Save status types
export type SaveStatus = 'saved' | 'saving' | 'error' | 'unsaved';