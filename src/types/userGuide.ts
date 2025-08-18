export interface GuideSection {
  id: string;
  title: string;
  content: string;
  subsections?: GuideSection[];
  searchKeywords: string[];
  category: 'getting-started' | 'features' | 'advanced' | 'troubleshooting';
}

export interface GuideState {
  isOpen: boolean;
  currentSection: string;
  searchQuery: string;
  searchResults: GuideSection[];
  lastViewedSection: string;
  searchHistory: string[];
}

export interface GuideContent {
  sections: {
    'getting-started': {
      'welcome': GuideSection;
      'first-note': GuideSection;
      'organizing-notes': GuideSection;
    };
    'features': {
      'markdown-editor': GuideSection;
      'search': GuideSection;
      'export-import': GuideSection;
      'keyboard-shortcuts': GuideSection;
    };
    'advanced': {
      'power-user-tips': GuideSection;
      'customization': GuideSection;
      'data-management': GuideSection;
    };
    'troubleshooting': {
      'common-issues': GuideSection;
      'performance': GuideSection;
      'data-recovery': GuideSection;
    };
  };
}

export interface SearchIndex {
  terms: Map<string, string[]>; // term -> section IDs
  sections: Map<string, {
    title: string;
    content: string;
    keywords: string[];
  }>;
}

export interface TooltipConfig {
  id: string;
  content: string;
  position: 'top' | 'bottom' | 'left' | 'right';
  trigger: 'hover' | 'focus' | 'click';
  delay: number;
}

export type GuideCategory = 'getting-started' | 'features' | 'advanced' | 'troubleshooting';

export interface GuideActions {
  openGuide: (sectionId?: string) => void;
  closeGuide: () => void;
  navigateToSection: (sectionId: string) => void;
  setSearchQuery: (query: string) => void;
  setSearchResults: (results: GuideSection[]) => void;
  addToSearchHistory: (query: string) => void;
  clearSearchHistory: () => void;
}