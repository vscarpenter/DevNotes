/**
 * Barrel export for all type definitions
 * Provides clean imports throughout the application
 */

// Core data models
export * from './note';
export * from './search';
export * from './app';
export * from './database';

// Component types
export * from './components';

// External library types
export * from './external';

// Re-export commonly used types for convenience
export type { Note, Folder, CreateNoteInput, UpdateNoteInput } from './note';
export type { SearchResult, SearchHighlight, SearchOptions } from './search';
export type { AppState, UIState, Theme, SaveStatus } from './app';
export type { DatabaseResult, ExportData } from './database';