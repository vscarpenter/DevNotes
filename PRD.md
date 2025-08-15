# DevNotes - Product Requirements Document

## 1. Executive Summary

**Product Name**: DevNotes  
**Target Audience**: Software developers and technical professionals  
**Primary Use Case**: A web-based note-taking application optimized for developers with markdown support, hierarchical organization, and seamless workflow integration  

**Core Value Proposition**: Provide developers with a fast, organized, and feature-rich note-taking solution that supports their technical workflow with markdown editing, code syntax highlighting, and intuitive file management.

## 2. Product Overview

### 2.1 Vision Statement
Create the most developer-friendly note-taking application that seamlessly integrates into technical workflows while providing powerful organization and sharing capabilities.

### 2.2 Success Metrics
- **Performance**: Sub-200ms load times, instant auto-save
- **Usability**: Zero-learning-curve interface for developers
- **Reliability**: 99.9% uptime with robust local storage fallbacks
- **Adoption**: High user retention through intuitive UX and powerful features

## 3. Technical Architecture

### 3.1 Technology Stack
- **Frontend Framework**: React 18+ with TypeScript
- **Styling**: Tailwind CSS v3+ with custom design system
- **UI Components**: shadcn/ui component library
- **Icons**: Lucide React icon set
- **Typography**: 
  - Primary: Geist font family for body text
  - Monospace: Geist Mono for code blocks and technical content
  - Enhanced OpenType features enabled
- **Data Persistence**: IndexedDB for client-side storage
- **Build Tool**: Vite with TypeScript configuration
- **Deployment**: AWS S3 + CloudFront CDN

### 3.2 Browser Compatibility
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 4. Core Features & Functional Requirements

### 4.1 Application Layout

#### Two-Panel Interface
- **Left Panel (30% width)**: Folder tree navigation and note list
- **Right Panel (70% width)**: Note editor with live preview
- **Responsive Design**: Mobile-first approach with collapsible sidebar
- **Resizable Panels**: Drag-to-resize functionality between panels

#### Navigation Structure
```
📁 Root Folder
├── 📁 Projects
│   ├── 📁 Project Alpha
│   │   ├── 📄 meeting-notes.md
│   │   └── 📄 technical-specs.md
│   └── 📁 Project Beta
├── 📁 Learning
│   ├── 📄 react-patterns.md
│   └── 📄 typescript-tips.md
└── 📁 Quick Notes
    └── 📄 daily-standup.md
```

### 4.2 Note Management

#### Core Note Operations
- **Create Note**: New note creation with automatic naming
- **Edit Note**: Real-time markdown editing with syntax highlighting
- **Delete Note**: Soft delete with confirmation dialog
- **Duplicate Note**: Copy note with new name
- **Move Note**: Drag-and-drop between folders
- **Search Notes**: Full-text search across all notes and folders

#### Note Metadata
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
  readingTime: number; // estimated reading time in minutes
}
```

### 4.3 Folder Management

#### Folder Operations
- **Create Folder**: Nested folder creation with validation
- **Rename Folder**: Inline editing with auto-save
- **Delete Folder**: Cascade delete with confirmation
- **Move Folder**: Drag-and-drop reorganization
- **Expand/Collapse**: Tree view state persistence

#### Folder Structure
```typescript
interface Folder {
  id: string;
  name: string;
  parentId: string | null;
  children: string[]; // folder IDs
  notes: string[]; // note IDs
  createdAt: Date;
  updatedAt: Date;
  isExpanded: boolean;
}
```

### 4.4 Markdown Editor

#### Editor Features
- **Syntax Highlighting**: Real-time markdown syntax highlighting
- **Live Preview**: Side-by-side or toggle preview mode
- **Code Block Support**: Syntax highlighting for 20+ programming languages
- **Table Support**: Markdown table editing with formatting assistance
- **Math Support**: KaTeX integration for mathematical expressions
- **Mermaid Diagrams**: Support for flowcharts and diagrams

#### Editor Toolbar
- Bold, Italic, Strikethrough
- Headers (H1-H6)
- Lists (ordered, unordered)
- Code blocks and inline code
- Links and images
- Tables
- Horizontal rules

#### Keyboard Shortcuts
```
Ctrl/Cmd + S: Save note
Ctrl/Cmd + N: New note
Ctrl/Cmd + K: Quick search
Ctrl/Cmd + B: Bold
Ctrl/Cmd + I: Italic
Ctrl/Cmd + `: Inline code
Ctrl/Cmd + Shift + K: Code block
Tab: Indent list item
Shift + Tab: Outdent list item
```

### 4.5 Auto-Save & Persistence

#### Auto-Save Behavior
- **Debounced Auto-Save**: 500ms delay after last keystroke
- **Save Indicators**: Visual feedback for save states
- **Conflict Resolution**: Handle multiple tab editing scenarios
- **Offline Support**: Continue working without internet connection

#### Data Storage Strategy
- **Primary Storage**: IndexedDB for structured data
- **Backup Strategy**: Local export functionality
- **Data Migration**: Version-controlled schema migrations
- **Storage Limits**: Graceful handling of browser storage quotas

### 4.6 Search & Discovery

#### Search Functionality
- **Global Search**: Search across all notes and folders
- **Search Filters**: Filter by folder, date range, tags
- **Search Highlighting**: Highlight search terms in results
- **Recent Notes**: Quick access to recently edited notes
- **Fuzzy Search**: Intelligent search with typo tolerance

#### Search Interface
```typescript
interface SearchResult {
  noteId: string;
  title: string;
  snippet: string;
  matchCount: number;
  folderPath: string;
  lastModified: Date;
}
```

### 4.7 Drag & Drop

#### Drag Operations
- **Note to Folder**: Move notes between folders
- **Folder Reorganization**: Nest and reorganize folder hierarchy
- **Batch Operations**: Select and move multiple notes
- **Visual Feedback**: Clear drop zones and hover states
- **Undo/Redo**: Support for drag operations

#### Drop Zones
- Folder items in navigation tree
- Folder headers in navigation
- Empty space in folders for quick access

### 4.8 Sharing & Export

#### Share Functionality
- **Email Sharing**: Generate mailto links with note content
- **Copy to Clipboard**: Copy markdown or HTML format
- **Export Options**: Individual note or bulk export
- **Share Permissions**: Read-only link generation (future feature)

#### Export Formats
- Markdown (.md)
- HTML (styled)
- Plain text (.txt)
- JSON (structured data)
- ZIP archive (bulk export)

## 5. User Interface Specifications

### 5.1 Design System

#### Color Palette
```css
/* Primary Colors */
--primary-50: #f0f9ff;
--primary-500: #3b82f6;
--primary-900: #1e3a8a;

/* Gray Scale */
--gray-50: #f9fafb;
--gray-100: #f3f4f6;
--gray-500: #6b7280;
--gray-900: #111827;

/* Semantic Colors */
--success: #10b981;
--warning: #f59e0b;
--error: #ef4444;
```

#### Typography Scale
```css
/* Headings */
.text-4xl { font-size: 2.25rem; } /* H1 */
.text-3xl { font-size: 1.875rem; } /* H2 */
.text-2xl { font-size: 1.5rem; } /* H3 */
.text-xl { font-size: 1.25rem; } /* H4 */
.text-lg { font-size: 1.125rem; } /* H5 */
.text-base { font-size: 1rem; } /* H6, Body */

/* Code */
.font-mono { font-family: 'Geist Mono', monospace; }
```

#### Component Specifications

**Navigation Panel**
- Width: 300px (default), resizable 250px-500px
- Background: `bg-gray-50 dark:bg-gray-900`
- Border: `border-r border-gray-200 dark:border-gray-700`

**Editor Panel**
- Background: `bg-white dark:bg-gray-800`
- Padding: `p-6`
- Max width: `prose prose-lg`

**Folder Tree**
- Indent: 16px per level
- Icons: Lucide React (Folder, File, ChevronRight, ChevronDown)
- Hover states: `hover:bg-gray-100 dark:hover:bg-gray-800`

### 5.2 Responsive Design

#### Breakpoints
- Mobile: 320px - 768px
- Tablet: 768px - 1024px
- Desktop: 1024px+

#### Mobile Adaptations
- Single panel view with navigation drawer
- Touch-optimized drag and drop
- Swipe gestures for navigation
- Optimized toolbar for touch targets

## 6. Performance Requirements

### 6.1 Performance Targets
- **Initial Load**: < 2 seconds on 3G connection
- **Note Switching**: < 100ms transition time
- **Auto-Save**: < 50ms save operation
- **Search**: < 200ms for 1000+ notes
- **Bundle Size**: < 500KB gzipped

### 6.2 Optimization Strategies
- Code splitting by routes and features
- Lazy loading of non-critical components
- Virtual scrolling for large note lists
- Debounced search and auto-save
- Service worker for offline functionality

## 7. Security & Privacy

### 7.1 Data Protection
- **Client-Side Storage**: All data stored locally in IndexedDB
- **No Server Communication**: Zero server-side data transmission
- **Privacy First**: No analytics or tracking
- **Secure Defaults**: CSP headers and security best practices

### 7.2 Data Backup
- **Local Export**: JSON/ZIP backup functionality
- **Import Capability**: Restore from backup files
- **Data Portability**: Standard markdown format for interoperability

## 8. Development Guidelines

### 8.1 Code Structure
```
src/
├── components/
│   ├── ui/           # shadcn/ui components
│   ├── editor/       # Editor-specific components
│   ├── navigation/   # Folder tree and navigation
│   └── modals/       # Dialogs and overlays
├── hooks/            # Custom React hooks
├── lib/              # Utility functions and constants
├── stores/           # State management (Zustand/Context)
├── types/            # TypeScript type definitions
└── styles/           # Global styles and Tailwind config
```

### 8.2 State Management
- **Global State**: Note data, folder structure, app settings
- **Local State**: UI state, form inputs, temporary data
- **Persistence**: Automatic sync with IndexedDB
- **State Shape**:
```typescript
interface AppState {
  notes: Record<string, Note>;
  folders: Record<string, Folder>;
  ui: {
    selectedNoteId: string | null;
    selectedFolderId: string | null;
    searchQuery: string;
    sidebarWidth: number;
    isDarkMode: boolean;
  };
}
```

### 8.3 Component Patterns
- **Composition over Inheritance**: Flexible component composition
- **Controlled Components**: Controlled inputs with proper state management
- **Error Boundaries**: Graceful error handling and recovery
- **Accessibility**: ARIA labels, keyboard navigation, screen reader support

## 9. Testing Strategy

### 9.1 Testing Requirements
- **Unit Tests**: 90%+ coverage for utilities and hooks
- **Component Tests**: Key user interactions and edge cases
- **Integration Tests**: Full user workflows
- **Performance Tests**: Load testing with large datasets
- **Accessibility Tests**: WCAG 2.1 AA compliance

### 9.2 Test Scenarios
1. **Note Creation & Editing**: Create, edit, save, delete operations
2. **Folder Management**: Create, rename, move, delete folder operations
3. **Drag & Drop**: Move notes and folders between locations
4. **Search**: Full-text search across various content types
5. **Auto-Save**: Ensure data persistence during editing
6. **Import/Export**: Data backup and restore functionality
7. **Offline Usage**: Functionality without internet connection

## 10. Deployment & Infrastructure

### 10.1 AWS S3 + CloudFront Setup
```bash
# S3 Bucket Configuration
- Bucket Name: notes.vinny.dev
- Static Website Hosting: Enabled
- Public Read Access: Enabled for website files
- Error Document: index.html (SPA routing)

# CloudFront Distribution
- Origin: S3 bucket endpoint
- Caching: Optimize for SPA (cache index.html for short duration)
- Compression: Enabled
- Security Headers: CSP, HSTS, X-Frame-Options
```

### 10.2 Build & Deployment Pipeline
1. **Build Process**: `npm run build` generates optimized production bundle
2. **Asset Optimization**: Minification, compression, cache busting
3. **Upload to S3**: Sync build artifacts to S3 bucket
4. **CloudFront Invalidation**: Clear CDN cache for updated files
5. **Health Check**: Verify deployment success

## 11. Future Enhancements

### 11.1 Phase 2 Features
- **Real-time Collaboration**: Multi-user editing with operational transforms
- **Plugin System**: Third-party integrations and extensions
- **Advanced Search**: Regex search, saved searches, search macros
- **Note Templates**: Predefined templates for common note types
- **Git Integration**: Version control for notes and folders

### 11.2 Phase 3 Features
- **Mobile App**: React Native application with sync
- **Desktop App**: Electron wrapper with native integrations
- **Cloud Sync**: Optional cloud backup and sync (encrypted)
- **AI Integration**: Smart suggestions and content generation
- **Team Workspaces**: Shared collaborative spaces

## 12. Success Criteria

### 12.1 Launch Criteria
- [ ] All core features implemented and tested
- [ ] Performance targets met
- [ ] Accessibility compliance achieved
- [ ] Security review completed
- [ ] Deployment pipeline established

### 12.2 User Acceptance Criteria
- [ ] Users can create and organize notes intuitively
- [ ] Markdown editing feels natural and responsive
- [ ] Drag-and-drop operations work reliably
- [ ] Auto-save prevents data loss
- [ ] Search finds relevant content quickly
- [ ] Export/sharing features work as expected

---

**Document Version**: 1.0  
**Last Updated**: August 15, 2025  
**Stakeholder**: Vinny Carpenter (https://vinny.dev)