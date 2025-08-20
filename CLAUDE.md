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

# Run specific test file or pattern
npm run test -- src/stores/__tests__/noteStore.test.ts
npm run test -- --grep "search functionality"

# Code Quality
npm run lint             # Run ESLint for code quality checks
npm run type-check       # Run TypeScript compiler without emitting files

# Deployment (requires AWS credentials)
npm run deploy           # Full deploy: build + S3 sync + CloudFront invalidation
npm run deploy:s3        # Deploy to S3 bucket (notes.vinny.dev)
npm run deploy:invalidate # Invalidate CloudFront cache
```

## Architecture Overview

DevNotes is a client-side note-taking application built with React 18, TypeScript, and IndexedDB. The application follows a layered architecture:

### State Management (Zustand Stores)
- **AppStore** (`src/stores/appStore.ts`): Main coordinator for cross-store interactions and initialization
  - Use for complex operations involving multiple stores (e.g., `createNoteInFolder`, `deleteNoteAndUpdateUI`)
  - Handles PWA shortcuts and auto-initialization
- **NoteStore** (`src/stores/noteStore.ts`): Note CRUD operations and state
- **FolderStore** (`src/stores/folderStore.ts`): Folder hierarchy and operations
- **UIStore** (`src/stores/uiStore.ts`): UI state (theme, sidebar, selections)
- **SearchStore** (`src/stores/searchStore.ts`): Search operations and state
- **TagStore** (`src/stores/tagStore.ts`): Tag management and operations
- **UserGuideStore** (`src/stores/userGuideStore.ts`): User guide state and navigation

Each store follows a consistent pattern with data, selectedId, isLoading, error properties and CRUD operations.

### Database Layer
- **DatabaseService** (`src/lib/db/DatabaseService.ts`): Dexie.js wrapper for IndexedDB operations
- Uses transactions for data consistency
- Includes migration system and comprehensive error handling
- Automatic timestamp management via Dexie hooks

### Component Architecture
Components are organized by feature in `src/components/`:
- `ui/`: Base components (Button, Input, Toast, Error Boundary, PWA components) using shadcn/ui
- `layout/`: Layout components (AppLayout, Sidebar, MainPanel)
- `editor/`: Markdown editor and preview components with math/diagram support
- `navigation/`: Folder tree and note list components with drag-drop
- `search/`: Search interface with filters and recent notes
- `modals/`: Export/import, settings, tag manager, template selection, and keyboard shortcuts dialogs
- `userGuide/`: Interactive user guide with tooltips and performance optimizations

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
  tags: '++id, name, color, createdAt, usageCount',
  settings: '++key, value',
  searchIndex: '++noteId, lastIndexed'
}
```

**Key Indexes:**
- `[folderId+updatedAt]`: Fast retrieval of notes in folder sorted by modification time
- `[parentId+name]`: Efficient folder hierarchy navigation and name-based sorting

**Enhanced Features:**
- Automatic timestamp management via Dexie hooks
- Word count and reading time calculation
- Cascade deletion for folders and notes
- Comprehensive error handling with specific error types
- Bulk import/export operations with progress tracking

## Testing Strategy

- **Unit Tests**: All stores, database operations, and utilities
- **Component Tests**: React components with React Testing Library
- **Integration Tests**: Cross-store interactions
- Test files mirror source structure in `__tests__/` directories
- Use Vitest with jsdom environment

## Build Configuration

- **Vite**: ES2020 target with React plugin and PWA support
- **Code Splitting**: Strategic chunks for vendor, editor, markdown processing, and utilities
- **Bundle Analysis**: Monitor bundle size (target <500KB gzipped, warning at 1MB)
- **Source Maps**: Enabled for debugging
- **PWA**: Service worker with auto-update and offline caching

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

1. **Store Architecture**: Components should use existing stores rather than direct database access
2. **Cross-store Operations**: Use AppStore for complex operations involving multiple stores
3. **Database Layer**: All database operations should go through DatabaseService with proper error handling
4. **Testing**: Add comprehensive tests in corresponding `__tests__/` directories (unit, integration, and e2e)
5. **Code Organization**: Follow existing patterns and file structure
6. **Performance**: Consider memoization, virtual scrolling for large datasets
7. **Accessibility**: Ensure WCAG compliance for all new components
8. **PWA**: Consider offline functionality and mobile experience

## Important File Locations

- **Types**: `src/types/` - Comprehensive TypeScript definitions
- **Hooks**: `src/hooks/` - Custom React hooks (auto-save, drag-drop, error handling)
- **Utils**: `src/lib/utils/` - Utility functions and processors
- **Content**: `src/content/userGuide/` - User guide content and search index
- **Services**: `src/lib/` - Feature-specific services (export, import, search)
- **Test Utils**: `src/test-utils/` - Shared testing utilities and setup

## Key Dependencies & Libraries

- **CodeMirror 6**: Markdown editor with syntax highlighting and themes
- **Dexie.js**: IndexedDB wrapper for client-side database
- **Zustand**: Lightweight state management with subscriptions
- **Tailwind CSS + shadcn/ui**: Styling and component system
- **Unified/Remark/Rehype**: Markdown processing pipeline with GFM support
- **Fuse.js**: Fuzzy search functionality
- **React Window**: Virtual scrolling for performance
- **Lucide React**: Consistent icon system
- **Vitest + React Testing Library**: Testing framework with coverage
- **KaTeX**: Mathematical notation rendering
- **Mermaid**: Diagram and flowchart rendering
- **Prism.js**: Code syntax highlighting
- **JSZip**: File compression for exports
- **Playwright**: End-to-end testing
- **Vite PWA Plugin**: Progressive Web App functionality

## Tech Stack Features

- **TypeScript Strict Mode**: Full type safety with strict configuration
- **Markdown Processing**: Full GitHub Flavored Markdown support with math (KaTeX) and diagrams (Mermaid)
- **PWA Support**: Service worker, manifest, shortcuts, and offline functionality
- **Responsive Design**: Mobile-first approach with desktop optimizations
- **Drag & Drop**: File organization and note management
- **Export/Import**: Multiple formats including JSON, ZIP, and Markdown
- **Performance Optimizations**: Code splitting, virtual scrolling, memoization
- **Accessibility**: WCAG 2.1 AA compliance with keyboard navigation and screen reader support
- **Error Handling**: Comprehensive error boundaries and user-friendly error messages
- **Auto-save**: Debounced auto-save with visual feedback