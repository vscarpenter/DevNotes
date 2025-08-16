# DevNotes

A web-based note-taking application specifically designed for software developers and technical professionals. DevNotes provides a fast, organized, and feature-rich solution that supports technical workflows with markdown editing, code syntax highlighting, hierarchical organization, and intuitive file management.

## 🚀 Features

### Core Functionality
- **Developer-focused**: Optimized for technical documentation with markdown support and code syntax highlighting
- **Privacy-first**: All data stored locally in IndexedDB with no server communication
- **Performance-oriented**: Sub-200ms load times, instant auto-save, and responsive interactions
- **Hierarchical organization**: Nested folder structure for project-based note organization
- **Offline-capable**: Full functionality without internet connection

### Current Implementation Status
✅ **Completed Features:**
- Two-panel responsive layout with resizable sidebar (250px-500px)
- Complete state management system with Zustand stores
- IndexedDB service layer with Dexie.js for data persistence
- Database migration system with backup/restore functionality
- Comprehensive error handling and user feedback
- Full test coverage for stores and database operations
- TypeScript type system with strict mode enabled
- Tailwind CSS with shadcn/ui component system

🚧 **In Development:**
- Folder tree navigation component
- Note list with virtual scrolling
- Markdown editor with CodeMirror 6
- Search engine with full-text search
- Drag and drop functionality
- Export/import features

## 🛠 Tech Stack

- **Frontend Framework**: React 18+ with TypeScript for type safety and modern React features
- **Build Tool**: Vite with TypeScript configuration for fast development and optimized builds
- **Styling**: Tailwind CSS v3+ with shadcn/ui component library for consistent design system
- **State Management**: Zustand for lightweight, performant global state management
- **Data Persistence**: IndexedDB with Dexie.js wrapper for client-side data storage
- **Icons**: Lucide React icon set for consistent iconography
- **Typography**: Geist font family for body text, Geist Mono for code blocks
- **Testing**: Vitest with React Testing Library for comprehensive testing

## 🚀 Getting Started

### Prerequisites

- **Node.js**: Version 18+ 
- **npm**: Comes with Node.js
- **Modern Browser**: Chrome 90+, Firefox 88+, Safari 14+, or Edge 90+

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd devnotes
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open your browser** and navigate to `http://localhost:5173`

### 🔧 Development Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Build for production (includes TypeScript compilation) |
| `npm run preview` | Preview production build locally |
| `npm run test` | Run unit tests with Vitest |
| `npm run test:watch` | Run tests in watch mode |
| `npm run test:coverage` | Generate test coverage report |
| `npm run lint` | Run ESLint for code quality |
| `npm run type-check` | Run TypeScript compiler without emitting files |

### 🏗 Build Configuration

The project uses Vite with the following optimizations:
- **Target**: ES2020 for modern browser support
- **Code Splitting**: Vendor chunks for React/React-DOM
- **Minification**: ESBuild for fast builds
- **Source Maps**: Enabled for debugging
- **Path Aliases**: `@/` maps to `src/` directory

## 📁 Project Structure

```
devnotes/
├── .kiro/                      # Kiro AI assistant configuration
│   ├── specs/                  # Project specifications and requirements
│   └── steering/               # AI guidance documents
├── assets/                     # Static assets (logos, icons, branding)
├── src/                        # Source code
│   ├── components/             # React components organized by feature
│   │   ├── ui/                # shadcn/ui base components (Button, Input, etc.)
│   │   ├── layout/            # Layout components (AppLayout, Sidebar, MainPanel) ✅
│   │   ├── navigation/        # Navigation components (FolderTree, NoteList) 🚧
│   │   ├── editor/            # Editor components (MarkdownEditor, PreviewPane) 🚧
│   │   ├── search/            # Search interface components 🚧
│   │   └── modals/            # Dialogs and overlays (Export, Import, Settings) 🚧
│   ├── hooks/                 # Custom React hooks 🚧
│   ├── lib/                   # Utility functions and services
│   │   ├── db/               # IndexedDB service layer ✅
│   │   ├── search/           # Search engine implementation 🚧
│   │   ├── export/           # Export/import functionality 🚧
│   │   └── utils/            # General utility functions ✅
│   ├── stores/               # Zustand state management ✅
│   │   ├── appStore.ts       # Cross-store coordination and initialization
│   │   ├── noteStore.ts      # Note-related state and actions
│   │   ├── folderStore.ts    # Folder-related state and actions
│   │   ├── uiStore.ts        # UI state (theme, sidebar, selections)
│   │   └── searchStore.ts    # Search state and operations
│   ├── types/                # TypeScript type definitions ✅
│   │   ├── note.ts           # Note and folder interfaces
│   │   ├── search.ts         # Search-related types
│   │   ├── app.ts            # Application state types
│   │   ├── database.ts       # Database operation types
│   │   └── components.ts     # Component prop types
│   ├── styles/               # Global styles and Tailwind configuration
│   └── test-utils/           # Testing utilities and setup
├── public/                   # Public assets and PWA manifest
├── package.json             # Dependencies and scripts
├── vite.config.ts           # Vite configuration with path aliases
├── tsconfig.json            # TypeScript configuration (strict mode)
├── tailwind.config.js       # Tailwind CSS configuration with custom theme
└── README.md               # Project documentation
```

### 🏗 Architecture Overview

**State Management Architecture:**
- **Domain Separation**: Separate Zustand stores for different data domains (notes, folders, UI, search)
- **Cross-Store Coordination**: AppStore handles interactions between different stores
- **Persistence**: Automatic sync with IndexedDB for data stores
- **Type Safety**: Full TypeScript coverage with strict mode enabled

**Database Layer:**
- **Service Layer**: DatabaseService class with Dexie.js for IndexedDB operations
- **Migration System**: Version-controlled schema migrations with backup/restore
- **Error Handling**: Comprehensive error handling with user-friendly messages
- **Performance**: Optimized queries with proper indexing

**Component Architecture:**
- **Atomic Design**: Components follow atomic design principles (atoms → molecules → organisms)
- **Feature-Based**: Components grouped by functionality rather than type
- **Composition**: Favor component composition over inheritance for flexibility

## 🔧 API Documentation

### Store APIs

#### UIStore
Manages application UI state including theme, sidebar, and layout preferences.

```typescript
import { useUIStore } from '@/stores/uiStore';

// Theme management
const { theme, isDarkMode, setTheme, toggleDarkMode } = useUIStore();

// Sidebar management
const { sidebarWidth, isSidebarCollapsed, setSidebarWidth, toggleSidebar } = useUIStore();

// Editor preferences
const { isPreviewMode, showLineNumbers, fontSize, togglePreviewMode } = useUIStore();
```

#### NoteStore
Handles note CRUD operations and state management.

```typescript
import { useNoteStore } from '@/stores/noteStore';

// Note operations
const { createNote, updateNote, deleteNote, selectNote } = useNoteStore();

// Data access
const { getNote, getNotesByFolder, getRecentNotes } = useNoteStore();

// State
const { notes, selectedNoteId, isLoading, error } = useNoteStore();
```

#### FolderStore
Manages folder hierarchy and operations.

```typescript
import { useFolderStore } from '@/stores/folderStore';

// Folder operations
const { createFolder, updateFolder, deleteFolder, moveFolder } = useFolderStore();

// Hierarchy management
const { expandFolder, collapseFolder, toggleFolderExpansion } = useFolderStore();

// Data access
const { getRootFolders, getChildFolders, getFolderPath } = useFolderStore();
```

### Database Service

The DatabaseService provides a clean API for IndexedDB operations:

```typescript
import { databaseService } from '@/lib/db/DatabaseService';

// Note operations
const result = await databaseService.createNote({
  title: 'My Note',
  content: 'Note content',
  folderId: 'folder-id',
  tags: ['tag1', 'tag2']
});

// Folder operations
const folderResult = await databaseService.createFolder({
  name: 'My Folder',
  parentId: null // null for root folder
});

// Bulk operations
const exportResult = await databaseService.exportData();
const importResult = await databaseService.importData(exportData);
```

## 🧪 Testing

The project includes comprehensive test coverage:

- **Unit Tests**: All stores, database operations, and utility functions
- **Component Tests**: Layout components with user interaction testing
- **Integration Tests**: Cross-store interactions and realistic user workflows
- **Error Handling Tests**: Database errors, storage quota, and edge cases

### Running Tests

```bash
# Run all tests
npm run test

# Run tests in watch mode during development
npm run test:watch

# Generate coverage report
npm run test:coverage

# Run specific test file
npm run test -- src/stores/__tests__/noteStore.test.ts
```

### Test Structure

```
src/
├── __tests__/                    # Test files mirror source structure
│   ├── components/
│   │   └── layout/
│   │       ├── AppLayout.test.tsx
│   │       └── MainPanel.test.tsx
│   ├── stores/
│   │   ├── noteStore.test.ts
│   │   ├── folderStore.test.ts
│   │   ├── uiStore.test.ts
│   │   ├── searchStore.test.ts
│   │   ├── appStore.test.ts
│   │   └── integration.test.ts
│   └── lib/
│       └── db/
│           ├── DatabaseService.test.ts
│           ├── DatabaseMigrations.test.ts
│           └── DatabaseErrorHandler.test.ts
└── test-utils/
    └── setup.ts                  # Test configuration and utilities
```

## 🚀 Performance Optimizations

- **Bundle Size**: Target < 500KB gzipped with code splitting
- **Code Splitting**: Vendor chunks for React/React-DOM
- **Virtual Scrolling**: For large note lists (1000+ items) - planned
- **Debounced Operations**: 500ms auto-save delay, optimized search
- **IndexedDB Optimization**: Proper indexing and query optimization
- **Memory Management**: Efficient state updates and cleanup

## 🔒 Privacy & Security

- **Client-Side Only**: No server communication, all data stays local
- **IndexedDB Storage**: Secure browser-native storage
- **No Analytics**: No tracking or data collection
- **Content Security Policy**: Configured for production deployment
- **Input Sanitization**: Proper sanitization for user-generated content

## 🌐 Browser Support

- **Chrome**: 90+
- **Firefox**: 88+
- **Safari**: 14+
- **Edge**: 90+

Features used:
- IndexedDB for data persistence
- ES2020 features (optional chaining, nullish coalescing)
- CSS Grid and Flexbox for layout
- ResizeObserver for responsive behavior

## 📝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes and add tests
4. Run tests: `npm run test`
5. Run linting: `npm run lint`
6. Commit your changes: `git commit -m 'Add amazing feature'`
7. Push to the branch: `git push origin feature/amazing-feature`
8. Open a Pull Request

## 📄 License

MIT License - see LICENSE file for details.