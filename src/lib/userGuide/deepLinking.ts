/**
 * Deep linking utilities for user guide
 * Provides functions to create shareable links and handle URL navigation
 */

export interface GuideLink {
  url: string;
  sectionId: string;
  title?: string;
}

/**
 * Creates a shareable link to a specific guide section
 */
export const createGuideLink = (sectionId: string, title?: string): GuideLink => {
  if (typeof window === 'undefined') {
    return {
      url: '',
      sectionId,
      title
    };
  }

  const url = new URL(window.location.href);
  url.searchParams.set('guide', 'true');
  url.searchParams.set('section', sectionId);

  return {
    url: url.toString(),
    sectionId,
    title
  };
};

/**
 * Parses URL parameters to extract guide information
 */
export const parseGuideURL = (url?: string): { shouldOpen: boolean; sectionId?: string } => {
  if (typeof window === 'undefined' && !url) {
    return { shouldOpen: false };
  }

  const targetURL = url ? new URL(url) : new URL(window.location.href);
  const urlParams = new URLSearchParams(targetURL.search);
  
  return {
    shouldOpen: urlParams.get('guide') === 'true',
    sectionId: urlParams.get('section') || undefined
  };
};

/**
 * Copies a guide link to the clipboard
 */
export const copyGuideLink = async (sectionId: string, title?: string): Promise<boolean> => {
  try {
    const link = createGuideLink(sectionId, title);
    await navigator.clipboard.writeText(link.url);
    return true;
  } catch (error) {
    console.error('Failed to copy guide link:', error);
    return false;
  }
};

/**
 * Opens a guide section from a URL
 */
export const openGuideFromLink = (url: string): { success: boolean; sectionId?: string } => {
  try {
    const { shouldOpen, sectionId } = parseGuideURL(url);
    
    if (shouldOpen && sectionId) {
      // Import the store dynamically to avoid circular dependencies
      import('../../stores/userGuideStore').then(({ useUserGuideStore }) => {
        const store = useUserGuideStore.getState();
        store.openGuide(sectionId);
      });
      
      return { success: true, sectionId };
    }
    
    return { success: false };
  } catch (error) {
    console.error('Failed to open guide from link:', error);
    return { success: false };
  }
};

/**
 * Validates if a section ID exists in the guide content
 */
export const isValidSectionId = (sectionId: string): boolean => {
  const validSections = [
    // Getting started
    'getting-started/welcome',
    'getting-started/first-note',
    'getting-started/organizing-notes',
    
    // Features
    'features/markdown-editor',
    'features/search',
    'features/export-import',
    'features/keyboard-shortcuts',
    
    // Advanced
    'advanced/power-user-tips',
    'advanced/customization',
    'advanced/data-management',
    
    // Troubleshooting
    'troubleshooting/common-issues',
    'troubleshooting/performance',
    'troubleshooting/data-recovery'
  ];
  
  return validSections.includes(sectionId);
};

/**
 * Gets a human-readable title for a section ID
 */
export const getSectionTitle = (sectionId: string): string => {
  const sectionTitles: Record<string, string> = {
    // Getting started
    'getting-started/welcome': 'Welcome to DevNotes',
    'getting-started/first-note': 'Creating Your First Note',
    'getting-started/organizing-notes': 'Organizing Your Notes',
    
    // Features
    'features/markdown-editor': 'Markdown Editor',
    'features/search': 'Search Functionality',
    'features/export-import': 'Export & Import',
    'features/keyboard-shortcuts': 'Keyboard Shortcuts',
    
    // Advanced
    'advanced/power-user-tips': 'Power User Tips',
    'advanced/customization': 'Customization Options',
    'advanced/data-management': 'Data Management',
    
    // Troubleshooting
    'troubleshooting/common-issues': 'Common Issues',
    'troubleshooting/performance': 'Performance Tips',
    'troubleshooting/data-recovery': 'Data Recovery'
  };
  
  return sectionTitles[sectionId] || sectionId;
};