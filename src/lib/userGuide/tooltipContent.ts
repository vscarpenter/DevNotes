import { TooltipConfig } from '@/types/userGuide';

export interface TooltipContentMap {
  [key: string]: Omit<TooltipConfig, 'id'>;
}

export const tooltipContent: TooltipContentMap = {
  // Editor tooltips
  'editor-markdown-help': {
    content: 'Click for markdown syntax help and formatting tips',
    position: 'bottom',
    trigger: 'hover',
    delay: 500
  },
  'editor-preview-toggle': {
    content: 'Toggle between edit and preview modes (Ctrl+P)',
    position: 'bottom',
    trigger: 'hover',
    delay: 500
  },
  'editor-split-view': {
    content: 'View markdown source and preview side by side',
    position: 'bottom',
    trigger: 'hover',
    delay: 500
  },
  'editor-toolbar-bold': {
    content: 'Make text bold (Ctrl+B)',
    position: 'bottom',
    trigger: 'hover',
    delay: 500
  },
  'editor-toolbar-italic': {
    content: 'Make text italic (Ctrl+I)',
    position: 'bottom',
    trigger: 'hover',
    delay: 500
  },
  'editor-toolbar-code': {
    content: 'Insert inline code or code block (Ctrl+`)',
    position: 'bottom',
    trigger: 'hover',
    delay: 500
  },
  'editor-toolbar-link': {
    content: 'Insert or edit link (Ctrl+K)',
    position: 'bottom',
    trigger: 'hover',
    delay: 500
  },
  'editor-toolbar-list': {
    content: 'Create bulleted or numbered lists',
    position: 'bottom',
    trigger: 'hover',
    delay: 500
  },

  // Navigation tooltips
  'folder-create': {
    content: 'Create a new folder to organize your notes',
    position: 'right',
    trigger: 'hover',
    delay: 500
  },
  'note-create': {
    content: 'Create a new note in the current folder (Ctrl+N)',
    position: 'right',
    trigger: 'hover',
    delay: 500
  },
  'folder-drag-drop': {
    content: 'Drag and drop to reorganize folders and notes',
    position: 'right',
    trigger: 'hover',
    delay: 500
  },
  'note-search': {
    content: 'Search through all your notes and folders (Ctrl+F)',
    position: 'bottom',
    trigger: 'hover',
    delay: 500
  },

  // Search tooltips
  'search-filters': {
    content: 'Use filters to narrow down search results by date, tags, or folders',
    position: 'bottom',
    trigger: 'hover',
    delay: 500
  },
  'search-syntax': {
    content: 'Use quotes for exact phrases, + for required terms, - to exclude terms',
    position: 'bottom',
    trigger: 'focus',
    delay: 300
  },
  'search-recent': {
    content: 'Quickly access your recently viewed notes',
    position: 'left',
    trigger: 'hover',
    delay: 500
  },

  // Settings and export tooltips
  'export-options': {
    content: 'Export your notes as Markdown, PDF, or HTML files',
    position: 'left',
    trigger: 'hover',
    delay: 500
  },
  'import-notes': {
    content: 'Import notes from other applications or markdown files',
    position: 'left',
    trigger: 'hover',
    delay: 500
  },
  'backup-reminder': {
    content: 'Regular backups help protect your notes from data loss',
    position: 'top',
    trigger: 'hover',
    delay: 500
  },
  'keyboard-shortcuts': {
    content: 'View all available keyboard shortcuts to work faster',
    position: 'left',
    trigger: 'hover',
    delay: 500
  },

  // Tag management tooltips
  'tag-create': {
    content: 'Create tags to categorize and organize your notes',
    position: 'bottom',
    trigger: 'hover',
    delay: 500
  },
  'tag-filter': {
    content: 'Click tags to filter notes by category',
    position: 'bottom',
    trigger: 'hover',
    delay: 500
  },
  'tag-manager': {
    content: 'Manage all your tags, rename, merge, or delete unused tags',
    position: 'left',
    trigger: 'hover',
    delay: 500
  },

  // Performance and troubleshooting tooltips
  'performance-tip': {
    content: 'For better performance with large notes, consider breaking them into smaller sections',
    position: 'top',
    trigger: 'hover',
    delay: 500
  },
  'auto-save-indicator': {
    content: 'Your changes are automatically saved as you type',
    position: 'bottom',
    trigger: 'hover',
    delay: 300
  },
  'offline-indicator': {
    content: 'DevNotes works completely offline - your data stays on your device',
    position: 'bottom',
    trigger: 'hover',
    delay: 500
  }
};

export const getTooltipConfig = (tooltipId: string): TooltipConfig | null => {
  const config = tooltipContent[tooltipId];
  if (!config) {
    return null;
  }

  return {
    id: tooltipId,
    ...config
  };
};

export const createTooltipConfig = (
  id: string,
  content: string,
  options: Partial<Omit<TooltipConfig, 'id' | 'content'>> = {}
): TooltipConfig => {
  return {
    id,
    content,
    position: options.position || 'top',
    trigger: options.trigger || 'hover',
    delay: options.delay || 500
  };
};

// Helper function to get contextual help based on current UI state
export const getContextualTooltips = (context: {
  isEditing?: boolean;
  hasNotes?: boolean;
  isSearching?: boolean;
  currentView?: 'editor' | 'list' | 'search';
}): string[] => {
  const tooltips: string[] = [];

  if (context.isEditing) {
    tooltips.push(
      'editor-markdown-help',
      'editor-toolbar-bold',
      'editor-toolbar-italic',
      'editor-toolbar-code',
      'auto-save-indicator'
    );
  }

  if (context.hasNotes === false) {
    tooltips.push('note-create', 'folder-create');
  }

  if (context.isSearching) {
    tooltips.push('search-syntax', 'search-filters');
  }

  if (context.currentView === 'list') {
    tooltips.push('folder-drag-drop', 'tag-filter');
  }

  return tooltips;
};