# DevNotes API Documentation

This document provides comprehensive API documentation for the DevNotes application, including store APIs, database services, and component interfaces.

## Table of Contents

- [Store APIs](#store-apis)
  - [UIStore](#uistore)
  - [NoteStore](#notestore)
  - [FolderStore](#folderstore)
  - [SearchStore](#searchstore)
  - [AppStore](#appstore)
- [Database Service](#database-service)
- [Component APIs](#component-apis)
- [Type Definitions](#type-definitions)
- [Error Handling](#error-handling)

## Store APIs

### UIStore

Manages application UI state including theme, sidebar, layout preferences, and modal state.

#### State Interface

```typescript
interface UIState {
  // Layout state
  sidebarWidth: number;
  isSidebarCollapsed: boolean;
  panelLayout: 'split' | 'editor-only' | 'preview-only';
  
  // Theme state
  theme: 'light' | 'dark' | 'system';
  isDarkMode: boolean;
  
  // Editor state
  isPreviewMode: boolean;
  showLineNumbers: boolean;
  wordWrap: boolean;
  fontSize: number;
  
  // Application state
  isLoading: boolean;
  saveStatus: 'saved' | 'saving' | 'error' | 'unsaved';
  error: string | null;
  
  // Search state
  isSearchOpen: boolean;
  searchQuery: string;
  
  // Modal state
  activeModal: string | null;
}
```

#### Actions

```typescript
// Layout management
setSidebarWidth(width: number): void
toggleSidebar(): void
collapseSidebar(): void
expandSidebar(): void
setPanelLayout(layout: PanelLayout): void

// Theme management
setTheme(theme: Theme): void
toggleDarkMode(): void

// Editor preferences
togglePreviewMode(): void
setPreviewMode(enabled: boolean): void
toggleLineNumbers(): void
toggleWordWrap(): void
setFontSize(size: number): void

// Application state
setLoading(loading: boolean): void
setSaveStatus(status: SaveStatus): void
setError(error: string | null): void
clearError(): void

// Search management
setSearchOpen(open: boolean): void
setSearchQuery(query: string): void
clearSearch(): void

// Modal management
openModal(modalId: string): void
closeModal(): void

// Computed getters
getEffectiveTheme(): 'light' | 'dark'
isModalOpen(modalId: string): boolean
```

#### Usage Examples

```typescript
import { useUIStore } from '@/stores/uiStore';

// Theme management
const { theme, isDarkMode, setTheme, toggleDarkMode } = useUIStore();

// Set explicit theme
setTheme('dark');

// Toggle between light/dark
toggleDarkMode();

// Sidebar management
const { sidebarWidth, isSidebarCollapsed, setSidebarWidth } = useUIStore();

// Resize sidebar (clamped between 250-500px)
setSidebarWidth(350);

// Editor preferences
const { fontSize, showLineNumbers, toggleLineNumbers } = useUIStore();

// Toggle line numbers
toggleLineNumbers();
```

### NoteStore

Handles note CRUD operations and state management.

#### State Interface

```typescript
interface NoteState {
  notes: Record<string, Note>;
  selectedNoteId: string | null;
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
}
```

#### Actions

```typescript
// Data loading
loadNotes(): Promise<void>

// CRUD operations
createNote(folderId: string, title?: string): Promise<string>
updateNote(id: string, updates: UpdateNoteInput): Promise<void>
deleteNote(id: string): Promise<void>
moveNote(noteId: string, targetFolderId: string): Promise<void>
duplicateNote(id: string): Promise<string>

// Selection
selectNote(id: string | null): void

// Error handling
clearError(): void

// Computed getters
getNote(id: string): Note | undefined
getNotesByFolder(folderId: string): Note[]
getRecentNotes(limit?: number): Note[]
```

#### Usage Examples

```typescript
import { useNoteStore } from '@/stores/noteStore';

// Create a new note
const { createNote, selectNote } = useNoteStore();
const noteId = await createNote('folder-id', 'My New Note');
selectNote(noteId);

// Update note content
const { updateNote } = useNoteStore();
await updateNote('note-id', {
  title: 'Updated Title',
  content: 'Updated content',
  tags: ['tag1', 'tag2']
});

// Get notes by folder
const { getNotesByFolder } = useNoteStore();
const folderNotes = getNotesByFolder('folder-id');

// Get recent notes
const { getRecentNotes } = useNoteStore();
const recentNotes = getRecentNotes(10);
```

### FolderStore

Manages folder hierarchy and operations.

#### State Interface

```typescript
interface FolderState {
  folders: Record<string, Folder>;
  selectedFolderId: string | null;
  expandedFolders: Set<string>;
  isLoading: boolean;
  error: string | null;
}
```

#### Actions

```typescript
// Data loading
loadFolders(): Promise<void>

// CRUD operations
createFolder(parentId: string | null, name: string): Promise<string>
updateFolder(id: string, updates: UpdateFolderInput): Promise<void>
deleteFolder(id: string): Promise<void>
moveFolder(folderId: string, targetParentId: string | null): Promise<void>

// Selection and expansion
selectFolder(id: string | null): void
toggleFolderExpansion(id: string): void
expandFolder(id: string): void
collapseFolder(id: string): void

// Error handling
clearError(): void

// Computed getters
getFolder(id: string): Folder | undefined
getRootFolders(): Folder[]
getChildFolders(parentId: string): Folder[]
getFolderPath(id: string): string[]
isFolderExpanded(id: string): boolean
getFolderHierarchy(): Folder[]
```

#### Usage Examples

```typescript
import { useFolderStore } from '@/stores/folderStore';

// Create root folder
const { createFolder } = useFolderStore();
const folderId = await createFolder(null, 'My Project');

// Create child folder
const childId = await createFolder(folderId, 'Documentation');

// Expand folder
const { expandFolder } = useFolderStore();
expandFolder(folderId);

// Get folder hierarchy
const { getFolderHierarchy } = useFolderStore();
const hierarchy = getFolderHierarchy();

// Get folder path
const { getFolderPath } = useFolderStore();
const path = getFolderPath(childId); // ['My Project', 'Documentation']
```

### SearchStore

Manages search operations and state.

#### State Interface

```typescript
interface SearchState {
  query: string;
  results: SearchResult[];
  filters: Partial<SearchFilters>;
  isSearching: boolean;
  recentQueries: string[];
  recentNotes: string[];
  error: string | null;
}
```

#### Actions

```typescript
// Search operations
search(query: string): Promise<void>
clearSearch(): void

// Filter management
setFilters(filters: Partial<SearchFilters>): void
clearFilters(): void

// Recent queries
addRecentQuery(query: string): void
clearRecentQueries(): void

// Recent notes
updateRecentNotes(noteIds: string[]): void

// Error handling
setError(error: string | null): void
clearError(): void

// Computed getters
hasResults(): boolean
hasActiveFilters(): boolean
getFilteredResults(): SearchResult[]
```

#### Usage Examples

```typescript
import { useSearchStore } from '@/stores/searchStore';

// Perform search
const { search, results } = useSearchStore();
await search('react hooks');

// Apply filters
const { setFilters } = useSearchStore();
setFilters({
  folderId: 'folder-id',
  dateRange: {
    start: new Date('2024-01-01'),
    end: new Date('2024-12-31')
  }
});

// Check if has results
const { hasResults } = useSearchStore();
if (hasResults()) {
  // Display results
}
```

### AppStore

Coordinates cross-store interactions and handles application initialization.

#### State Interface

```typescript
interface AppStore {
  isInitialized: boolean;
}
```

#### Actions

```typescript
// Initialization
initialize(): Promise<void>

// Cross-store operations
createNoteInFolder(folderId: string, title?: string): Promise<string>
deleteNoteAndUpdateUI(noteId: string): Promise<void>
deleteFolderAndUpdateUI(folderId: string): Promise<void>
selectNoteAndFolder(noteId: string): void

// Bulk operations
refreshData(): Promise<void>

// Error handling
handleError(error: string, context?: string): void
clearAllErrors(): void
```

#### Usage Examples

```typescript
import { useAppStore } from '@/stores/appStore';

// Initialize application
const { initialize, isInitialized } = useAppStore();
if (!isInitialized) {
  await initialize();
}

// Create note and update UI
const { createNoteInFolder } = useAppStore();
const noteId = await createNoteInFolder('folder-id', 'New Note');

// Select note and expand folder hierarchy
const { selectNoteAndFolder } = useAppStore();
selectNoteAndFolder(noteId);
```

## Database Service

The DatabaseService provides a clean API for IndexedDB operations using Dexie.js.

### Core Methods

```typescript
class DatabaseService {
  // Note operations
  createNote(noteInput: CreateNoteInput): Promise<DatabaseResult<Note>>
  getNoteById(id: string): Promise<DatabaseResult<Note>>
  updateNote(id: string, updates: UpdateNoteInput): Promise<DatabaseResult<Note>>
  deleteNote(id: string): Promise<DatabaseResult<boolean>>
  getNotesByFolder(folderId: string): Promise<DatabaseResult<Note[]>>
  getAllNotes(): Promise<DatabaseResult<Note[]>>

  // Folder operations
  createFolder(folderInput: CreateFolderInput): Promise<DatabaseResult<Folder>>
  getFolderById(id: string): Promise<DatabaseResult<Folder>>
  updateFolder(id: string, updates: UpdateFolderInput): Promise<DatabaseResult<Folder>>
  deleteFolder(id: string): Promise<DatabaseResult<boolean>>
  getAllFolders(): Promise<DatabaseResult<Folder[]>>
  getRootFolders(): Promise<DatabaseResult<Folder[]>>
  getChildFolders(parentId: string): Promise<DatabaseResult<Folder[]>>

  // Bulk operations
  exportData(): Promise<DatabaseResult<ExportData>>
  importData(data: ExportData): Promise<BulkOperationResult>
}
```

### Usage Examples

```typescript
import { databaseService } from '@/lib/db/DatabaseService';

// Create a note
const result = await databaseService.createNote({
  title: 'My Note',
  content: 'Note content',
  folderId: 'folder-id',
  tags: ['tag1', 'tag2']
});

if (result.success) {
  console.log('Note created:', result.data);
} else {
  console.error('Error:', result.error);
}

// Export all data
const exportResult = await databaseService.exportData();
if (exportResult.success) {
  const jsonData = JSON.stringify(exportResult.data);
  // Save to file or send to user
}
```

## Component APIs

### AppLayout

Main application layout with resizable two-panel interface.

```typescript
interface AppLayoutProps {
  children?: React.ReactNode;
}

// Features:
// - Resizable sidebar (250px-500px)
// - Mobile responsive with overlay
// - Dark mode support
// - Keyboard navigation
```

### Sidebar

Navigation sidebar with folder tree and search.

```typescript
interface SidebarProps {
  className?: string;
}

// Features:
// - Collapsible search bar
// - Quick action buttons
// - Folder tree placeholder
// - Settings access
```

### MainPanel

Main content area with toolbar and status bar.

```typescript
interface MainPanelProps {
  children?: React.ReactNode;
  className?: string;
}

// Features:
// - Responsive toolbar
// - Save status indicator
// - Preview mode toggle
// - Welcome screen when no content
```

## Type Definitions

### Core Data Models

```typescript
interface Note {
  id: string;
  title: string;
  content: string;
  folderId: string;
  createdAt: Date;
  updatedAt: Date;
  tags?: string[];
  wordCount: number;
  readingTime: number;
}

interface Folder {
  id: string;
  name: string;
  parentId: string | null;
  children: string[];
  notes: string[];
  createdAt: Date;
  updatedAt: Date;
  isExpanded: boolean;
}

interface SearchResult {
  noteId: string;
  title: string;
  snippet: string;
  matchCount: number;
  folderPath: string;
  lastModified: Date;
  highlights: SearchHighlight[];
}
```

### Input Types

```typescript
interface CreateNoteInput {
  title: string;
  content: string;
  folderId: string;
  tags?: string[];
}

interface UpdateNoteInput {
  title?: string;
  content?: string;
  folderId?: string;
  tags?: string[];
}

interface CreateFolderInput {
  name: string;
  parentId: string | null;
}

interface UpdateFolderInput {
  name?: string;
  parentId?: string | null;
  isExpanded?: boolean;
}
```

### Database Result Types

```typescript
interface DatabaseResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

interface BulkOperationResult {
  success: boolean;
  processed: number;
  failed: number;
  errors: string[];
}
```

## Error Handling

### Database Errors

The application handles various database error scenarios:

```typescript
// Quota exceeded
{
  name: 'QuotaExceededError',
  message: 'Storage quota exceeded. Please free up space or export your data.'
}

// Version conflicts
{
  name: 'VersionError',
  message: 'Database version conflict. Please refresh the page.'
}

// Item not found
{
  name: 'NotFoundError',
  message: 'Requested item not found.'
}
```

### Error Recovery

```typescript
import { DatabaseErrorHandler } from '@/lib/db/DatabaseErrorHandler';

// Handle database errors with user feedback
await DatabaseErrorHandler.handleDatabaseError(error, 'createNote');

// Check if error is recoverable
const isRecoverable = DatabaseErrorHandler.isRecoverableError(error);

// Check if user action is required
const requiresAction = DatabaseErrorHandler.requiresUserAction(error);
```

### Store Error Handling

All stores provide error handling:

```typescript
// Clear errors
const { clearError } = useNoteStore();
clearError();

// Clear all errors across stores
const { clearAllErrors } = useAppStore();
clearAllErrors();

// Handle errors with context
const { handleError } = useAppStore();
handleError('Operation failed', 'note creation');
```

## Performance Considerations

### Debouncing

- Auto-save operations are debounced with 500ms delay
- Search operations are debounced to prevent excessive queries
- UI updates are optimized to prevent unnecessary re-renders

### Memory Management

- Event listeners are properly cleaned up in useEffect hooks
- Large datasets use virtual scrolling (planned)
- IndexedDB queries are optimized with proper indexing

### Bundle Optimization

- Code splitting separates vendor chunks
- Tree shaking removes unused code
- Target bundle size: < 500KB gzipped

## Migration and Versioning

### Database Migrations

```typescript
import { DatabaseMigrations } from '@/lib/db/DatabaseMigrations';

// Check if migration is needed
const needsMigration = await DatabaseMigrations.needsMigration(db);

// Run migrations
await DatabaseMigrations.runMigrations(db);

// Create backup before migration
const backupKey = await DatabaseMigrations.createBackup(db);

// Restore from backup if needed
await DatabaseMigrations.restoreFromBackup(db, backupKey);
```

### Schema Validation

```typescript
// Validate current schema
const isValid = await DatabaseMigrations.validateSchema(db);
```

This API documentation will be updated as new features are implemented and APIs evolve.