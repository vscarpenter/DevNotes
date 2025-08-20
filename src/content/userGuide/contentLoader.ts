import { GuideSection, GuideContent } from '../../types/userGuide';
import embeddedGuideContent from './embeddedContent';

// Cache for loaded content to avoid reloading
let cachedContent: GuideContent | null = null;

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
  // Return cached content if available
  if (cachedContent) {
    return cachedContent;
  }

  const sections: any = {
    'getting-started': {},
    'features': {},
    'advanced': {},
    'troubleshooting': {},
  };

  // Load content from embedded data instead of dynamic imports
  for (const [category, categoryContent] of Object.entries(embeddedGuideContent)) {
    for (const [sectionKey, content] of Object.entries(categoryContent)) {
      const sectionId = `${category}/${sectionKey}`;
      const metadata = sectionMetadata[sectionId as keyof typeof sectionMetadata];
      
      if (metadata) {
        const guideSection: GuideSection = {
          id: sectionId,
          title: metadata.title,
          content: String(content),
          searchKeywords: metadata.searchKeywords,
          category: metadata.category,
        };

        if (sections[category as keyof GuideContent['sections']]) {
          (sections[category as keyof GuideContent['sections']] as any)[sectionKey] = guideSection;
        }
      }
    }
  }

  // Cache the loaded content
  cachedContent = { sections } as GuideContent;
  return cachedContent;
};

export const getSectionById = (content: GuideContent, sectionId: string): GuideSection | null => {
  if (!content || !content.sections) {
    console.error('getSectionById: Invalid content structure', content);
    return null;
  }

  const [category, section] = sectionId.split('/');
  
  if (!category || !section) return null;
  
  const categoryContent = content.sections[category as keyof typeof content.sections];
  if (!categoryContent) return null;
  
  return categoryContent[section as keyof typeof categoryContent] || null;
};

export const getSectionByIdDirect = async (sectionId: string): Promise<GuideSection | null> => {
  const content = await loadGuideContent();
  return getSectionById(content, sectionId);
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