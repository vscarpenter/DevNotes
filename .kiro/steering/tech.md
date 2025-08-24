# DevNotes Technical Stack

## Core Technologies
- **Frontend Framework**: React 18+ with TypeScript for type safety and modern React features
- **Build Tool**: Vite with TypeScript configuration for fast development and optimized builds
- **Styling**: Tailwind CSS v3+ with shadcn/ui component library for consistent design system
- **State Management**: Zustand for lightweight, performant global state management (distributed store architecture)
- **Data Persistence**: IndexedDB with Dexie.js wrapper for client-side data storage
- **Icons**: Lucide React icon set for consistent iconography
- **Typography**: Geist font family for body text, Geist Mono for code blocks
- **Utilities**: Class Variance Authority (CVA) for component variants, clsx for conditional classes
- **File Processing**: JSZip for export/import functionality, React Window for virtualization

## Markdown & Content Processing
- **Markdown Processing**: Unified.js ecosystem (remark/rehype) for extensible markdown parsing
- **Code Highlighting**: Prism.js with rehype-highlight for syntax highlighting in code blocks
- **Math Rendering**: KaTeX with rehype-katex for mathematical expressions
- **Diagram Rendering**: Mermaid for flowcharts and technical diagrams
- **Editor**: CodeMirror 6 for advanced markdown editing with real-time syntax highlighting
- **Content Management**: Build-time markdown processing for user guide content

## Development Tools
- **Package Manager**: npm (standard Node.js package management)
- **Testing**: Vitest for unit testing, React Testing Library for component testing, Playwright for E2E
- **Linting**: ESLint with TypeScript rules for code quality
- **Type Checking**: TypeScript strict mode with comprehensive type safety
- **Build Tool**: Vite with optimized production builds and development HMR

## Performance & Optimization
- **Code Splitting**: Route-based and feature-based splitting for optimal loading
- **Virtual Scrolling**: React Window for large note lists and folder trees (1000+ items)
- **Debouncing**: 500ms auto-save delay, 300ms search delay for optimized operations
- **Bundle Target**: < 500KB gzipped with tree shaking and minification
- **PWA Features**: Service worker caching, offline functionality, install prompts
- **Search Optimization**: Fuse.js for fuzzy search with performance optimizations

## Browser Compatibility
- Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- Progressive Web App features with service worker for offline functionality
- Responsive design supporting mobile, tablet, and desktop viewports
- Touch and keyboard navigation support

## Common Commands
```bash
# Development
npm install          # Install dependencies
npm run dev         # Start development server with HMR
npm run build       # Build for production with optimization
npm run preview     # Preview production build locally

# Testing
npm run test        # Run unit tests with Vitest
npm run test:watch  # Run tests in watch mode
npm run test:coverage # Generate coverage report

# Code Quality
npm run lint        # Run ESLint with TypeScript rules
npm run type-check  # Run TypeScript compiler check

# Deployment
npm run deploy      # Full deployment pipeline (build + deploy + invalidate)
npm run deploy:s3   # Sync build to S3 with proper cache headers
npm run deploy:invalidate # Invalidate CloudFront cache
```

## Architecture Principles
- **Client-side only**: No server communication, all data stored in IndexedDB
- **Component composition**: Reusable components with clear separation of concerns
- **Performance first**: Optimize for sub-200ms interactions and instant auto-save
- **Accessibility**: WCAG 2.1 AA compliance with keyboard navigation and screen reader support