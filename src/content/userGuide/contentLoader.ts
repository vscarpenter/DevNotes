import { GuideSection, GuideContent } from '../../types/userGuide';

// Import markdown content
const markdownModules = {
  'getting-started/welcome': () => import('./markdown/getting-started/welcome.md?raw'),
  'getting-started/first-note': () => import('./markdown/getting-started/first-note.md?raw'),
  'getting-started/organizing-notes': () => import('./markdown/getting-started/organizing-notes.md?raw'),
  'features/markdown-editor': () => import('./markdown/features/markdown-editor.md?raw'),
  'features/search': () => import('./markdown/features/search.md?raw'),
  'features/export-import': () => import('./markdown/features/export-import.md?raw'),
  'features/keyboard-shortcuts': () => import('./markdown/features/keyboard-shortcuts.md?raw'),
  'advanced/power-user-tips': () => import('./markdown/advanced/power-user-tips.md?raw'),
  'advanced/customization': () => import('./markdown/advanced/customization.md?raw'),
  'advanced/data-management': () => import('./markdown/advanced/data-management.md?raw'),
  'troubleshooting/common-issues': () => import('./markdown/troubleshooting/common-issues.md?raw'),
  'troubleshooting/performance': () => import('./markdown/troubleshooting/performance.md?raw'),
  'troubleshooting/data-recovery': () => import('./markdown/troubleshooting/data-recovery.md?raw'),
};

// Section metadata
const sectionMetadata = {
  'getting-started/welcome': {
    title: 'Welcome to DevNotes',
    searchKeywords: ['welcome', 'introduction', 'getting started', 'overview', 'devnotes'],
    category: 'getting-started' as const
  },
  'getting-started/first-note': {
    title: 'Creating Your First Note',
    searchKeywords: ['first note', 'create', 'new note', 'editor', 'getting started'],
    category: 'getting-started' as const
  },
  'getting-started/organizing-notes': {
    title: 'Organizing Your Notes',
    searchKeywords: ['organize', 'folders', 'structure', 'hierarchy', 'management'],
    category: 'getting-started' as const
  },
  'features/markdown-editor': {
    title: 'Markdown Editor',
    searchKeywords: ['markdown', 'editor', 'syntax', 'preview', 'formatting', 'code'],
    category: 'features' as const
  },
  'features/search': {
    title: 'Search Functionality',
    searchKeywords: ['search', 'find', 'filter', 'query', 'operators'],
    category: 'features' as const
  },
  'features/export-import': {
    title: 'Export & Import',
    searchKeywords: ['export', 'import', 'backup', 'transfer', 'migration'],
    category: 'features' as const
  },
  'features/keyboard-shortcuts': {
    title: 'Keyboard Shortcuts',
    searchKeywords: ['keyboard', 'shortcuts', 'hotkeys', 'productivity', 'navigation'],
    category: 'features' as const
  },
  'advanced/power-user-tips': {
    title: 'Power User Tips',
    searchKeywords: ['power user', 'advanced', 'tips', 'tricks', 'productivity', 'workflow'],
    category: 'advanced' as const
  },
  'advanced/customization': {
    title: 'Customization Options',
    searchKeywords: ['customize', 'settings', 'preferences', 'configuration', 'themes'],
    category: 'advanced' as const
  },
  'advanced/data-management': {
    title: 'Data Management',
    searchKeywords: ['data', 'storage', 'indexeddb', 'management', 'backup'],
    category: 'advanced' as const
  },
  'troubleshooting/common-issues': {
    title: 'Common Issues',
    searchKeywords: ['issues', 'problems', 'troubleshooting', 'help', 'bugs'],
    category: 'troubleshooting' as const
  },
  'troubleshooting/performance': {
    title: 'Performance Optimization',
    searchKeywords: ['performance', 'speed', 'optimization', 'slow', 'memory'],
    category: 'troubleshooting' as const
  },
  'troubleshooting/data-recovery': {
    title: 'Data Recovery',
    searchKeywords: ['recovery', 'lost data', 'backup', 'restore', 'corruption'],
    category: 'troubleshooting' as const
  },
};

export const loadGuideContent = async (): Promise<GuideContent> => {
  const sections: any = {
    'getting-started': {},
    'features': {},
    'advanced': {},
    'troubleshooting': {},
  };

  // Load all markdown content
  for (const [sectionId, moduleLoader] of Object.entries(markdownModules)) {
    try {
      const module = await moduleLoader();
      const content = typeof module === 'string' ? module : module.default || module;
      const metadata = sectionMetadata[sectionId as keyof typeof sectionMetadata];
      
      const [category, section] = sectionId.split('/');
      
      const guideSection: GuideSection = {
        id: sectionId,
        title: metadata.title,
        content: String(content),
        searchKeywords: metadata.searchKeywords,
        category: metadata.category,
      };

      if (sections[category as keyof GuideContent['sections']]) {
        (sections[category as keyof GuideContent['sections']] as any)[section] = guideSection;
      }
    } catch (error) {
      console.error(`Failed to load section ${sectionId}:`, error);
      
      // Fallback content
      const metadata = sectionMetadata[sectionId as keyof typeof sectionMetadata];
      const [category, section] = sectionId.split('/');
      
      const fallbackSection: GuideSection = {
        id: sectionId,
        title: metadata.title,
        content: `# ${metadata.title}\n\nContent is currently unavailable. Please try again later.`,
        searchKeywords: metadata.searchKeywords,
        category: metadata.category,
      };

      if (sections[category as keyof GuideContent['sections']]) {
        (sections[category as keyof GuideContent['sections']] as any)[section] = fallbackSection;
      }
    }
  }

  return sections as GuideContent;
};

export const getSectionById = (content: GuideContent, sectionId: string): GuideSection | null => {
  const [category, section] = sectionId.split('/');
  
  if (!category || !section) return null;
  
  const categoryContent = content.sections[category as keyof typeof content.sections];
  if (!categoryContent) return null;
  
  return categoryContent[section as keyof typeof categoryContent] || null;
};

export const getAllSections = (content: GuideContent): GuideSection[] => {
  const sections: GuideSection[] = [];
  
  Object.values(content.sections).forEach(category => {
    Object.values(category).forEach(section => {
      sections.push(section);
    });
  });
  
  return sections;
};