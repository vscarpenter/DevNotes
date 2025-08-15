# DevNotes Project Structure

## Root Directory Organization
```
├── .kiro/                    # Kiro AI assistant configuration
│   ├── specs/               # Project specifications and requirements
│   └── steering/            # AI guidance documents
├── assets/                  # Static assets (logos, icons, branding)
├── src/                     # Source code (to be created)
├── public/                  # Public assets and PWA manifest (to be created)
├── package.json             # Dependencies and scripts (to be created)
└── README.md               # Project documentation (to be created)
```

## Source Code Structure (src/)
```
src/
├── components/              # React components organized by feature
│   ├── ui/                 # shadcn/ui base components (Button, Input, etc.)
│   ├── layout/             # Layout components (AppLayout, Sidebar, MainPanel)
│   ├── navigation/         # Navigation components (FolderTree, NoteList)
│   ├── editor/             # Editor components (MarkdownEditor, PreviewPane, Toolbar)
│   ├── search/             # Search interface components
│   └── modals/             # Dialogs and overlays (Export, Import, Settings)
├── hooks/                  # Custom React hooks
│   ├── useAutoSave.ts      # Auto-save functionality
│   ├── useSearch.ts        # Search operations
│   └── useDragDrop.ts      # Drag and drop handling
├── lib/                    # Utility functions and services
│   ├── db/                 # IndexedDB service layer
│   ├── search/             # Search engine implementation
│   ├── export/             # Export/import functionality
│   └── utils/              # General utility functions
├── stores/                 # Zustand state management
│   ├── noteStore.ts        # Note-related state and actions
│   ├── folderStore.ts      # Folder-related state and actions
│   └── uiStore.ts          # UI state (theme, sidebar, selections)
├── types/                  # TypeScript type definitions
│   ├── note.ts             # Note and folder interfaces
│   ├── search.ts           # Search-related types
│   └── app.ts              # Application state types
└── styles/                 # Global styles and Tailwind configuration
    ├── globals.css         # Global CSS and Tailwind imports
    └── components.css      # Component-specific styles
```

## Component Organization Principles
- **Feature-based grouping**: Components grouped by functionality rather than type
- **Atomic design**: UI components follow atomic design principles (atoms → molecules → organisms)
- **Single responsibility**: Each component has a clear, focused purpose
- **Composition over inheritance**: Favor component composition for flexibility

## File Naming Conventions
- **Components**: PascalCase (e.g., `MarkdownEditor.tsx`, `FolderTree.tsx`)
- **Hooks**: camelCase with `use` prefix (e.g., `useAutoSave.ts`, `useSearch.ts`)
- **Utilities**: camelCase (e.g., `formatDate.ts`, `sanitizeInput.ts`)
- **Types**: camelCase with descriptive names (e.g., `note.ts`, `searchResult.ts`)
- **Stores**: camelCase with `Store` suffix (e.g., `noteStore.ts`, `uiStore.ts`)

## Import/Export Patterns
- **Named exports**: Prefer named exports for utilities and hooks
- **Default exports**: Use for React components and main store instances
- **Barrel exports**: Use index.ts files for clean imports from directories
- **Absolute imports**: Configure path mapping for clean imports (`@/components`, `@/lib`)

## State Management Organization
- **Domain separation**: Separate stores for different data domains (notes, folders, UI)
- **Action co-location**: Keep actions with their related state
- **Derived state**: Use selectors for computed values
- **Persistence**: Auto-sync critical state with IndexedDB

## Testing Structure
```
src/
├── __tests__/              # Test files mirror source structure
│   ├── components/         # Component tests
│   ├── hooks/              # Hook tests
│   ├── lib/                # Utility and service tests
│   └── stores/             # State management tests
└── test-utils/             # Testing utilities and setup
```

## Asset Organization
- **Branding assets**: Logos, icons, and brand-related images in `/assets`
- **Component assets**: Small icons and component-specific assets in `/src/assets`
- **Public assets**: PWA icons, manifest, and static files in `/public`

## Configuration Files Location
- **Root level**: Package.json, tsconfig.json, tailwind.config.js, vite.config.ts
- **Build configs**: Keep build and tooling configuration at project root
- **Environment**: .env files for environment-specific configuration (if needed)