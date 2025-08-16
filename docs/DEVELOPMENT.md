# Development Guide

This guide provides comprehensive information for developers working on the DevNotes project, including architecture decisions, coding standards, and development workflows.

## Table of Contents

- [Architecture Overview](#architecture-overview)
- [Development Setup](#development-setup)
- [Coding Standards](#coding-standards)
- [State Management](#state-management)
- [Database Layer](#database-layer)
- [Component Development](#component-development)
- [Testing Strategy](#testing-strategy)
- [Performance Guidelines](#performance-guidelines)
- [Debugging](#debugging)
- [Contributing Workflow](#contributing-workflow)

## Architecture Overview

DevNotes follows a layered architecture with clear separation of concerns:

```
┌─────────────────────────────────────────┐
│              UI Components              │
├─────────────────────────────────────────┤
│            State Management             │
│         (Zustand Stores)                │
├─────────────────────────────────────────┤
│           Service Layer                 │
│        (Database Service)               │
├─────────────────────────────────────────┤
│          Data Persistence               │
│         (IndexedDB/Dexie)               │
└─────────────────────────────────────────┘
```

### Key Principles

1. **Client-Side Only**: No server communication, all data stored locally
2. **Performance First**: Sub-200ms interactions, optimized for developer workflows
3. **Type Safety**: Comprehensive TypeScript coverage with strict mode
4. **Testability**: High test coverage with isolated, testable components
5. **Accessibility**: WCAG 2.1 AA compliance with keyboard navigation

## Development Setup

### Prerequisites

- Node.js 18+
- npm (comes with Node.js)
- Modern browser for testing
- VS Code (recommended) with extensions:
  - TypeScript and JavaScript Language Features
  - Tailwind CSS IntelliSense
  - ESLint
  - Prettier

### Initial Setup

```bash
# Clone and setup
git clone <repository-url>
cd devnotes
npm install

# Start development
npm run dev

# Run tests
npm run test

# Type checking
npm run type-check
```

### Development Scripts

```bash
# Development
npm run dev              # Start dev server with hot reload
npm run build            # Production build
npm run preview          # Preview production build

# Testing
npm run test             # Run all tests
npm run test:watch       # Watch mode for development
npm run test:coverage    # Generate coverage report

# Code Quality
npm run lint             # ESLint checking
npm run type-check       # TypeScript compilation check
```

### Environment Configuration

The project uses Vite with the following configuration:

```typescript
// vite.config.ts
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    target: 'es2020',
    minify: 'esbuild',
    sourcemap: true,
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test-utils/setup.ts'],
  }
})
```

## Coding Standards

### TypeScript Guidelines

1. **Strict Mode**: Always use TypeScript strict mode
2. **Explicit Types**: Prefer explicit type annotations for public APIs
3. **Interface over Type**: Use interfaces for object shapes
4. **Utility Types**: Leverage TypeScript utility types (Partial, Pick, etc.)

```typescript
// Good: Explicit interface
interface NoteProps {
  note: Note;
  onUpdate: (updates: UpdateNoteInput) => void;
  className?: string;
}

// Good: Utility types
type CreateNoteInput = Omit<Note, 'id' | 'createdAt' | 'updatedAt'>;

// Good: Generic constraints
function updateEntity<T extends { id: string }>(entity: T, updates: Partial<T>): T {
  return { ...entity, ...updates };
}
```

### React Guidelines

1. **Functional Components**: Use function components with hooks
2. **Custom Hooks**: Extract reusable logic into custom hooks
3. **Prop Interfaces**: Define explicit interfaces for component props
4. **Error Boundaries**: Implement error boundaries for error handling

```typescript
// Good: Functional component with explicit props
interface NoteEditorProps {
  noteId: string;
  onSave: (content: string) => void;
}

const NoteEditor: React.FC<NoteEditorProps> = ({ noteId, onSave }) => {
  const [content, setContent] = useState('');
  
  // Custom hook usage
  const { autoSave } = useAutoSave(content, onSave);
  
  return (
    <textarea
      value={content}
      onChange={(e) => setContent(e.target.value)}
    />
  );
};
```

### File Organization

```
src/
├── components/
│   ├── ui/              # Base UI components (Button, Input)
│   ├── layout/          # Layout components (AppLayout, Sidebar)
│   ├── editor/          # Editor-specific components
│   └── [feature]/       # Feature-specific components
├── hooks/               # Custom React hooks
├── lib/                 # Utility functions and services
├── stores/              # Zustand state management
├── types/               # TypeScript type definitions
└── styles/              # Global styles and Tailwind config
```

### Naming Conventions

- **Components**: PascalCase (`NoteEditor.tsx`)
- **Hooks**: camelCase with `use` prefix (`useAutoSave.ts`)
- **Utilities**: camelCase (`formatDate.ts`)
- **Types**: PascalCase (`Note`, `SearchResult`)
- **Constants**: UPPER_SNAKE_CASE (`MAX_NOTE_LENGTH`)

## State Management

### Zustand Store Pattern

Each store follows a consistent pattern:

```typescript
interface StoreState {
  // State properties
  data: Record<string, Entity>;
  selectedId: string | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  loadData: () => Promise<void>;
  createEntity: (input: CreateInput) => Promise<string>;
  updateEntity: (id: string, updates: UpdateInput) => Promise<void>;
  deleteEntity: (id: string) => Promise<void>;
  selectEntity: (id: string | null) => void;
  clearError: () => void;
  
  // Computed getters
  getEntity: (id: string) => Entity | undefined;
  getEntitiesByFilter: (filter: FilterInput) => Entity[];
}

export const useEntityStore = create<StoreState>()((set, get) => ({
  // Initial state
  data: {},
  selectedId: null,
  isLoading: false,
  error: null,
  
  // Actions implementation
  loadData: async () => {
    set({ isLoading: true, error: null });
    try {
      const result = await databaseService.getAllEntities();
      if (result.success) {
        const dataMap = result.data.reduce((acc, entity) => {
          acc[entity.id] = entity;
          return acc;
        }, {} as Record<string, Entity>);
        set({ data: dataMap, isLoading: false });
      } else {
        set({ error: result.error, isLoading: false });
      }
    } catch (error) {
      set({ error: error.message, isLoading: false });
    }
  },
  
  // Computed getters
  getEntity: (id: string) => get().data[id],
}));
```

### Store Communication

Use the AppStore for cross-store coordination:

```typescript
// AppStore coordinates between stores
export const useAppStore = create<AppStore>()((set, get) => ({
  createNoteInFolder: async (folderId: string, title?: string) => {
    // 1. Select folder
    useFolderStore.getState().selectFolder(folderId);
    
    // 2. Create note
    const noteId = await useNoteStore.getState().createNote(folderId, title);
    
    // 3. Select note
    useNoteStore.getState().selectNote(noteId);
    
    // 4. Update search recent notes
    const recentNotes = useNoteStore.getState().getRecentNotes(20);
    useSearchStore.getState().updateRecentNotes(recentNotes.map(n => n.id));
    
    return noteId;
  },
}));
```

## Database Layer

### Service Pattern

The DatabaseService encapsulates all IndexedDB operations:

```typescript
class DatabaseService extends Dexie {
  // Table definitions
  notes!: Table<Note>;
  folders!: Table<Folder>;
  
  constructor() {
    super('DevNotesDB');
    this.version(1).stores({
      notes: '++id, title, content, folderId, createdAt, updatedAt',
      folders: '++id, name, parentId, createdAt, updatedAt',
    });
  }
  
  // CRUD operations with error handling
  async createNote(input: CreateNoteInput): Promise<DatabaseResult<Note>> {
    try {
      const noteId = await this.transaction('rw', this.notes, async () => {
        const note = {
          ...input,
          wordCount: this.calculateWordCount(input.content),
          readingTime: this.calculateReadingTime(input.content),
        };
        return await this.notes.add(note as Note);
      });
      
      const createdNote = await this.notes.get(noteId);
      return { success: true, data: createdNote };
    } catch (error) {
      return this.handleDatabaseError('createNote', error);
    }
  }
}
```

### Error Handling

Implement comprehensive error handling:

```typescript
private handleDatabaseError(operation: string, error: any): DatabaseResult<any> {
  console.error(`Database operation failed: ${operation}`, error);
  
  let errorMessage = `Failed to ${operation}`;
  
  if (error.name === 'QuotaExceededError') {
    errorMessage = 'Storage quota exceeded. Please free up space.';
  } else if (error.name === 'VersionError') {
    errorMessage = 'Database version conflict. Please refresh the page.';
  }
  
  return { success: false, error: errorMessage };
}
```

### Migration System

Implement version-controlled migrations:

```typescript
export class DatabaseMigrations {
  private static readonly migrations: MigrationScript[] = [
    {
      version: 2,
      description: 'Add tags support to notes',
      up: async (db) => {
        // Migration logic
        await db.notes.toCollection().modify(note => {
          note.tags = note.tags || [];
        });
      },
      down: async (db) => {
        // Rollback logic
        await db.notes.toCollection().modify(note => {
          delete note.tags;
        });
      }
    }
  ];
}
```

## Component Development

### Component Structure

Follow this structure for components:

```typescript
/**
 * Component description and requirements reference
 */

import React from 'react';
import { cn } from '@/lib/utils';

interface ComponentProps {
  // Required props
  data: DataType;
  onAction: (param: ParamType) => void;
  
  // Optional props
  className?: string;
  disabled?: boolean;
}

export const Component: React.FC<ComponentProps> = ({
  data,
  onAction,
  className,
  disabled = false
}) => {
  // Hooks at the top
  const [state, setState] = useState(initialState);
  const { storeData, storeAction } = useStore();
  
  // Event handlers
  const handleClick = useCallback((event: React.MouseEvent) => {
    if (disabled) return;
    onAction(event.currentTarget.value);
  }, [disabled, onAction]);
  
  // Effects
  useEffect(() => {
    // Effect logic
    return () => {
      // Cleanup
    };
  }, [dependencies]);
  
  // Early returns
  if (!data) {
    return <div>Loading...</div>;
  }
  
  // Main render
  return (
    <div className={cn('base-classes', className)}>
      {/* Component content */}
    </div>
  );
};
```

### Styling Guidelines

Use Tailwind CSS with the following patterns:

```typescript
// Use cn() utility for conditional classes
const buttonClasses = cn(
  'base-button-classes',
  variant === 'primary' && 'primary-variant-classes',
  disabled && 'disabled-classes',
  className
);

// Prefer Tailwind utilities over custom CSS
<div className="flex items-center justify-between p-4 border-b border-border">
  <span className="text-sm font-medium text-foreground">Title</span>
  <Button variant="ghost" size="sm">Action</Button>
</div>
```

### Accessibility

Ensure components are accessible:

```typescript
// Proper ARIA labels
<button
  aria-label="Delete note"
  aria-describedby="delete-description"
  onClick={handleDelete}
>
  <TrashIcon />
</button>

// Keyboard navigation
const handleKeyDown = (event: React.KeyboardEvent) => {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    handleAction();
  }
};

// Focus management
const buttonRef = useRef<HTMLButtonElement>(null);
useEffect(() => {
  if (shouldFocus) {
    buttonRef.current?.focus();
  }
}, [shouldFocus]);
```

## Testing Strategy

### Test Structure

Organize tests to mirror source structure:

```
src/
├── components/
│   └── __tests__/
│       └── Component.test.tsx
├── stores/
│   └── __tests__/
│       └── store.test.ts
└── lib/
    └── __tests__/
        └── utility.test.ts
```

### Component Testing

Test components with React Testing Library:

```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { Component } from '../Component';

describe('Component', () => {
  const mockProps = {
    data: mockData,
    onAction: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders with required props', () => {
    render(<Component {...mockProps} />);
    
    expect(screen.getByText('Expected Text')).toBeInTheDocument();
  });

  it('handles user interactions', async () => {
    render(<Component {...mockProps} />);
    
    const button = screen.getByRole('button', { name: 'Action Button' });
    fireEvent.click(button);
    
    await waitFor(() => {
      expect(mockProps.onAction).toHaveBeenCalledWith(expectedParam);
    });
  });

  it('handles error states', () => {
    render(<Component {...mockProps} data={null} />);
    
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });
});
```

### Store Testing

Test stores in isolation:

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useStore } from '../store';

// Mock dependencies
vi.mock('../databaseService', () => ({
  databaseService: {
    getAllEntities: vi.fn(),
    createEntity: vi.fn(),
  }
}));

describe('useStore', () => {
  beforeEach(() => {
    // Reset store state
    useStore.setState(initialState);
    vi.clearAllMocks();
  });

  it('loads data successfully', async () => {
    const mockData = [{ id: '1', name: 'Test' }];
    vi.mocked(databaseService.getAllEntities).mockResolvedValue({
      success: true,
      data: mockData
    });

    const store = useStore.getState();
    await store.loadData();

    const state = useStore.getState();
    expect(state.data).toEqual({ '1': mockData[0] });
    expect(state.isLoading).toBe(false);
  });
});
```

### Integration Testing

Test cross-store interactions:

```typescript
describe('Store Integration', () => {
  it('coordinates between stores correctly', async () => {
    const appStore = useAppStore.getState();
    const noteStore = useNoteStore.getState();
    const folderStore = useFolderStore.getState();

    // Setup initial state
    folderStore.selectFolder('folder-1');

    // Perform cross-store action
    const noteId = await appStore.createNoteInFolder('folder-1', 'Test Note');

    // Verify coordination
    expect(noteStore.selectedNoteId).toBe(noteId);
    expect(folderStore.selectedFolderId).toBe('folder-1');
  });
});
```

## Performance Guidelines

### Optimization Strategies

1. **Debouncing**: Use debouncing for expensive operations
2. **Memoization**: Use React.memo and useMemo for expensive computations
3. **Virtual Scrolling**: Implement for large lists (1000+ items)
4. **Code Splitting**: Split by routes and features
5. **Bundle Analysis**: Monitor bundle size regularly

### React Performance

```typescript
// Memoize expensive computations
const expensiveValue = useMemo(() => {
  return computeExpensiveValue(data);
}, [data]);

// Memoize callbacks to prevent unnecessary re-renders
const handleClick = useCallback((id: string) => {
  onItemClick(id);
}, [onItemClick]);

// Memoize components that receive stable props
const MemoizedComponent = React.memo(Component);
```

### Database Performance

```typescript
// Use proper indexing
this.version(1).stores({
  notes: '++id, title, folderId, [folderId+updatedAt]', // Compound index
});

// Batch operations
await this.transaction('rw', this.notes, async () => {
  for (const note of notes) {
    await this.notes.add(note);
  }
});

// Limit query results
const recentNotes = await this.notes
  .orderBy('updatedAt')
  .reverse()
  .limit(20)
  .toArray();
```

## Debugging

### Development Tools

1. **React DevTools**: Component inspection and profiling
2. **Browser DevTools**: Network, Performance, Application tabs
3. **Zustand DevTools**: State management debugging
4. **TypeScript**: Compile-time error checking

### Debugging Techniques

```typescript
// Store debugging
const debugStore = create<State>()(
  devtools(
    (set, get) => ({
      // Store implementation
    }),
    { name: 'store-name' }
  )
);

// Component debugging
const Component = () => {
  const state = useStore();
  
  // Debug renders
  useEffect(() => {
    console.log('Component rendered with state:', state);
  });
  
  return <div>Component</div>;
};

// Database debugging
class DatabaseService {
  async createNote(input: CreateNoteInput) {
    console.log('Creating note:', input);
    
    try {
      const result = await this.notes.add(input);
      console.log('Note created successfully:', result);
      return { success: true, data: result };
    } catch (error) {
      console.error('Failed to create note:', error);
      return { success: false, error: error.message };
    }
  }
}
```

### Common Issues

1. **State Not Updating**: Check if store actions are properly implemented
2. **Performance Issues**: Use React Profiler to identify bottlenecks
3. **Database Errors**: Check browser console for IndexedDB errors
4. **Type Errors**: Run `npm run type-check` for TypeScript issues

## Contributing Workflow

### Branch Strategy

```bash
# Feature development
git checkout -b feature/folder-tree-navigation
git checkout -b fix/auto-save-debouncing
git checkout -b refactor/database-service

# Commit messages
git commit -m "feat: implement folder tree navigation component"
git commit -m "fix: resolve auto-save debouncing issue"
git commit -m "refactor: improve database service error handling"
```

### Pull Request Process

1. **Create Feature Branch**: Branch from main for new features
2. **Implement Changes**: Follow coding standards and add tests
3. **Run Tests**: Ensure all tests pass (`npm run test`)
4. **Type Check**: Verify TypeScript compilation (`npm run type-check`)
5. **Lint Code**: Fix any linting issues (`npm run lint`)
6. **Update Documentation**: Update relevant documentation
7. **Create PR**: Provide clear description and link to requirements
8. **Code Review**: Address feedback and make necessary changes
9. **Merge**: Squash and merge after approval

### Code Review Checklist

- [ ] Code follows established patterns and conventions
- [ ] All tests pass and coverage is maintained
- [ ] TypeScript compilation succeeds without errors
- [ ] Components are accessible and keyboard navigable
- [ ] Performance considerations are addressed
- [ ] Error handling is comprehensive
- [ ] Documentation is updated as needed

This development guide will be updated as the project evolves and new patterns emerge.