import { GuideContent } from '../../types/userGuide';

// This will be replaced with actual markdown content in task 2
const guideContent: GuideContent = {
  sections: {
    'getting-started': {
      'welcome': {
        id: 'getting-started/welcome',
        title: 'Welcome to DevNotes',
        content: 'Welcome to DevNotes - your developer-focused note-taking application.',
        searchKeywords: ['welcome', 'introduction', 'getting started', 'overview'],
        category: 'getting-started'
      },
      'first-note': {
        id: 'getting-started/first-note',
        title: 'Creating Your First Note',
        content: 'Learn how to create and edit your first note in DevNotes.',
        searchKeywords: ['first note', 'create', 'new note', 'editor'],
        category: 'getting-started'
      },
      'organizing-notes': {
        id: 'getting-started/organizing-notes',
        title: 'Organizing Your Notes',
        content: 'Discover how to organize your notes using folders and tags.',
        searchKeywords: ['organize', 'folders', 'structure', 'hierarchy'],
        category: 'getting-started'
      }
    },
    'features': {
      'markdown-editor': {
        id: 'features/markdown-editor',
        title: 'Markdown Editor',
        content: 'Master the markdown editor with syntax highlighting and live preview.',
        searchKeywords: ['markdown', 'editor', 'syntax', 'preview', 'formatting'],
        category: 'features'
      },
      'search': {
        id: 'features/search',
        title: 'Search Functionality',
        content: 'Learn how to effectively search through your notes and content.',
        searchKeywords: ['search', 'find', 'filter', 'query'],
        category: 'features'
      },
      'export-import': {
        id: 'features/export-import',
        title: 'Export & Import',
        content: 'Export your notes and import from other applications.',
        searchKeywords: ['export', 'import', 'backup', 'transfer'],
        category: 'features'
      },
      'keyboard-shortcuts': {
        id: 'features/keyboard-shortcuts',
        title: 'Keyboard Shortcuts',
        content: 'Speed up your workflow with keyboard shortcuts.',
        searchKeywords: ['keyboard', 'shortcuts', 'hotkeys', 'productivity'],
        category: 'features'
      }
    },
    'advanced': {
      'power-user-tips': {
        id: 'advanced/power-user-tips',
        title: 'Power User Tips',
        content: 'Advanced tips and tricks for power users.',
        searchKeywords: ['power user', 'advanced', 'tips', 'tricks', 'productivity'],
        category: 'advanced'
      },
      'customization': {
        id: 'advanced/customization',
        title: 'Customization Options',
        content: 'Customize DevNotes to fit your workflow.',
        searchKeywords: ['customize', 'settings', 'preferences', 'configuration'],
        category: 'advanced'
      },
      'data-management': {
        id: 'advanced/data-management',
        title: 'Data Management',
        content: 'Understanding how your data is stored and managed.',
        searchKeywords: ['data', 'storage', 'indexeddb', 'management'],
        category: 'advanced'
      }
    },
    'troubleshooting': {
      'common-issues': {
        id: 'troubleshooting/common-issues',
        title: 'Common Issues',
        content: 'Solutions to common problems and issues.',
        searchKeywords: ['issues', 'problems', 'troubleshooting', 'help'],
        category: 'troubleshooting'
      },
      'performance': {
        id: 'troubleshooting/performance',
        title: 'Performance Optimization',
        content: 'Tips for optimizing DevNotes performance.',
        searchKeywords: ['performance', 'speed', 'optimization', 'slow'],
        category: 'troubleshooting'
      },
      'data-recovery': {
        id: 'troubleshooting/data-recovery',
        title: 'Data Recovery',
        content: 'How to recover lost or corrupted data.',
        searchKeywords: ['recovery', 'lost data', 'backup', 'restore'],
        category: 'troubleshooting'
      }
    }
  }
};

export default guideContent;