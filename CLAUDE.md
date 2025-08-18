# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

```bash
# Development
npm run dev              # Start development server with hot reload (Vite on port 5173)
npm run build            # Production build (TypeScript compilation + Vite build)
npm run preview          # Preview production build locally

# Testing
npm run test             # Run all tests with Vitest
npm run test:watch       # Run tests in watch mode for development
npm run test:coverage    # Generate test coverage report

# Code Quality
npm run lint             # Run ESLint for code quality checks
npm run type-check       # Run TypeScript compiler without emitting files
```

## Architecture Overview

DevNotes is a client-side note-taking application built with React 18, TypeScript, and IndexedDB. The application follows a layered architecture:

### State Management (Zustand Stores)
- **AppStore** (`src/stores/appStore.ts`): Main coordinator for cross-store interactions and initialization
- **NoteStore** (`src/stores/noteStore.ts`): Note CRUD operations and state
- **FolderStore** (`src/stores/folderStore.ts`): Folder hierarchy and operations
- **UIStore** (`src/stores/uiStore.ts`): UI state (theme, sidebar, selections)
- **SearchStore** (`src/stores/searchStore.ts`): Search operations and state

Each store follows a consistent pattern with data, selectedId, isLoading, error properties and CRUD operations.

### Database Layer
- **DatabaseService** (`src/lib/db/DatabaseService.ts`): Dexie.js wrapper for IndexedDB operations
- Uses transactions for data consistency
- Includes migration system and comprehensive error handling
- Automatic timestamp management via Dexie hooks

### Component Architecture
Components are organized by feature in `src/components/`:
- `ui/`: Base components (Button, Input) using shadcn/ui
- `layout/`: Layout components (AppLayout, Sidebar, MainPanel)
- `editor/`: Markdown editor and preview components
- `navigation/`: Folder tree and note list components
- `search/`: Search interface components
- `modals/`: Export/import and settings dialogs

### Key Patterns
- TypeScript strict mode with comprehensive type definitions in `src/types/`
- Functional components with hooks
- Error boundaries for graceful error handling
- Tailwind CSS with shadcn/ui design system
- Path alias `@/` maps to `src/` directory

## Database Schema

IndexedDB with Dexie.js:
```javascript
// Schema v1
{
  notes: '++id, title, content, folderId, createdAt, updatedAt, [folderId+updatedAt]',
  folders: '++id, name, parentId, createdAt, updatedAt, [parentId+name]',
  settings: '++key, value',
  searchIndex: '++noteId, lastIndexed'
}
```

## Testing Strategy

- **Unit Tests**: All stores, database operations, and utilities
- **Component Tests**: React components with React Testing Library
- **Integration Tests**: Cross-store interactions
- Test files mirror source structure in `__tests__/` directories
- Use Vitest with jsdom environment

## Build Configuration

- **Vite**: ES2020 target with React plugin
- **Code Splitting**: Vendor chunks for React/React-DOM
- **Bundle Analysis**: Monitor bundle size (target <500KB gzipped)
- **Source Maps**: Enabled for debugging

## Performance Considerations

- Debounced auto-save (500ms delay)
- Virtual scrolling for large lists (planned for 1000+ items)
- Memoized computations with React.memo and useMemo
- IndexedDB optimization with proper indexing and compound keys

## Important Notes

- **Client-side only**: No server communication, all data in IndexedDB
- **Cross-store coordination**: Use AppStore for actions involving multiple stores
- **Error handling**: Comprehensive error handling with user-friendly messages
- **Type safety**: Strict TypeScript with explicit interfaces
- **Accessibility**: WCAG 2.1 AA compliance with keyboard navigation

## Development Workflow

1. Components should use existing stores rather than direct database access
2. New features typically require updating multiple stores (coordination via AppStore)
3. All database operations should go through DatabaseService
4. Tests should be added for new functionality in corresponding `__tests__/` directories
5. Follow existing naming conventions and file organization patterns