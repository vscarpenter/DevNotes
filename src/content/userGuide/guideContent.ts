import { GuideContent, GuideSection } from '../../types/userGuide';

// Import content loader for actual markdown content
export { loadGuideContent } from './contentLoader';

// Create placeholder sections with proper structure
const createPlaceholderSection = (id: string, title: string): GuideSection => ({
  id,
  title,
  content: 'Loading...',
  searchKeywords: [],
  category: id.split('/')[0] as any,
});

// Function to get content synchronously (will be populated by the components)
const guideContent: GuideContent = {
  sections: {
    'getting-started': {
      'welcome': createPlaceholderSection('getting-started/welcome', 'Welcome to DevNotes'),
      'first-note': createPlaceholderSection('getting-started/first-note', 'Creating Your First Note'),
      'organizing-notes': createPlaceholderSection('getting-started/organizing-notes', 'Organizing Your Notes'),
    },
    'features': {
      'markdown-editor': createPlaceholderSection('features/markdown-editor', 'Markdown Editor'),
      'search': createPlaceholderSection('features/search', 'Search Functionality'),
      'export-import': createPlaceholderSection('features/export-import', 'Export & Import'),
      'keyboard-shortcuts': createPlaceholderSection('features/keyboard-shortcuts', 'Keyboard Shortcuts'),
    },
    'advanced': {
      'power-user-tips': createPlaceholderSection('advanced/power-user-tips', 'Power User Tips'),
      'customization': createPlaceholderSection('advanced/customization', 'Customization Options'),
      'data-management': createPlaceholderSection('advanced/data-management', 'Data Management'),
    },
    'troubleshooting': {
      'common-issues': createPlaceholderSection('troubleshooting/common-issues', 'Common Issues'),
      'performance': createPlaceholderSection('troubleshooting/performance', 'Performance Optimization'),
      'data-recovery': createPlaceholderSection('troubleshooting/data-recovery', 'Data Recovery'),
    },
  }
};

// Function to populate the synchronous content object
export const populateGuideContent = (content: GuideContent) => {
  if (!content || !content.sections) {
    console.error('populateGuideContent: Invalid content structure', content);
    return;
  }

  // Replace placeholder content with actual loaded content
  Object.keys(content.sections).forEach(categoryKey => {
    const category = categoryKey as keyof typeof content.sections;
    const categoryContent = content.sections[category];
    
    if (categoryContent && typeof categoryContent === 'object') {
      Object.keys(categoryContent).forEach(sectionKey => {
        const section = sectionKey as keyof typeof categoryContent;
        (guideContent.sections[category] as any)[section] = categoryContent[section];
      });
    }
  });
};

export default guideContent;