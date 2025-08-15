# DevNotes Technical Stack

## Core Technologies
- **Frontend Framework**: React 18+ with TypeScript for type safety and modern React features
- **Build Tool**: Vite with TypeScript configuration for fast development and optimized builds
- **Styling**: Tailwind CSS v3+ with shadcn/ui component library for consistent design system
- **State Management**: Zustand for lightweight, performant global state management
- **Data Persistence**: IndexedDB with Dexie.js wrapper for client-side data storage
- **Icons**: Lucide React icon set for consistent iconography
- **Typography**: Geist font family for body text, Geist Mono for code blocks

## Markdown & Content Processing
- **Markdown Processing**: Unified.js ecosystem (remark/rehype) for extensible markdown parsing
- **Code Highlighting**: Prism.js or Shiki for syntax highlighting in code blocks
- **Math Rendering**: KaTeX for mathematical expressions
- **Diagram Rendering**: Mermaid for flowcharts and technical diagrams
- **Editor**: CodeMirror 6 for advanced markdown editing with real-time syntax highlighting

## Development Tools
- **Package Manager**: npm (standard Node.js package management)
- **Testing**: React Testing Library for component testing, Jest for unit tests
- **Linting**: ESLint with TypeScript rules for code quality
- **Type Checking**: TypeScript strict mode for comprehensive type safety

## Performance & Optimization
- **Code Splitting**: Route-based and feature-based splitting for optimal loading
- **Virtual Scrolling**: For large note lists and folder trees (1000+ items)
- **Debouncing**: 500ms auto-save delay, optimized search operations
- **Bundle Target**: < 500KB gzipped with tree shaking and minification

## Browser Compatibility
- Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- Progressive Web App features with service worker for offline functionality

## Common Commands
```bash
# Development
npm install          # Install dependencies
npm run dev         # Start development server
npm run build       # Build for production
npm run preview     # Preview production build locally

# Testing
npm run test        # Run unit tests
npm run test:watch  # Run tests in watch mode
npm run test:coverage # Generate coverage report

# Code Quality
npm run lint        # Run ESLint
npm run type-check  # Run TypeScript compiler check
```

## Architecture Principles
- **Client-side only**: No server communication, all data stored in IndexedDB
- **Component composition**: Reusable components with clear separation of concerns
- **Performance first**: Optimize for sub-200ms interactions and instant auto-save
- **Accessibility**: WCAG 2.1 AA compliance with keyboard navigation and screen reader support