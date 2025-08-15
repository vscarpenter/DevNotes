# DevNotes

A web-based note-taking application specifically designed for software developers and technical professionals. DevNotes provides a fast, organized, and feature-rich solution that supports technical workflows with markdown editing, code syntax highlighting, hierarchical organization, and intuitive file management.

## Features

- **Developer-focused**: Optimized for technical documentation with markdown support and code syntax highlighting
- **Privacy-first**: All data stored locally in IndexedDB with no server communication
- **Performance-oriented**: Sub-200ms load times, instant auto-save, and responsive interactions
- **Hierarchical organization**: Nested folder structure for project-based note organization
- **Offline-capable**: Full functionality without internet connection

## Tech Stack

- **Frontend**: React 18+ with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS with shadcn/ui components
- **State Management**: Zustand
- **Data Persistence**: IndexedDB with Dexie.js
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

### Development

Start the development server:
```bash
npm run dev
```

### Building

Build for production:
```bash
npm run build
```

Preview the production build:
```bash
npm run preview
```

### Testing

Run tests:
```bash
npm run test
```

Run tests in watch mode:
```bash
npm run test:watch
```

Generate coverage report:
```bash
npm run test:coverage
```

### Code Quality

Run linting:
```bash
npm run lint
```

Run TypeScript type checking:
```bash
npm run type-check
```

## Project Structure

```
src/
├── components/          # React components
│   ├── ui/             # shadcn/ui base components
│   ├── layout/         # Layout components
│   ├── navigation/     # Navigation components
│   ├── editor/         # Editor components
│   ├── search/         # Search components
│   └── modals/         # Modal components
├── hooks/              # Custom React hooks
├── lib/                # Utility functions and services
│   ├── db/            # IndexedDB service layer
│   ├── search/        # Search engine
│   ├── export/        # Export/import functionality
│   └── utils/         # General utilities
├── stores/             # Zustand state management
├── types/              # TypeScript type definitions
└── styles/             # Global styles
```

## License

MIT License - see LICENSE file for details.