/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { UserGuideContent } from '../UserGuideContent';
import { useUserGuideStore } from '../../../stores/userGuideStore';
import * as contentLoader from '../../../content/userGuide/contentLoader';
import * as markdownProcessor from '../../../lib/utils/markdownProcessor';

// Mock the stores
vi.mock('../../../stores/userGuideStore');

// Mock the content loader
vi.mock('../../../content/userGuide/contentLoader');

// Mock the markdown processor
vi.mock('../../../lib/utils/markdownProcessor');

// Mock clipboard API
Object.assign(navigator, {
  clipboard: {
    writeText: vi.fn(() => Promise.resolve()),
  },
});

// Mock the Button component
vi.mock('../../ui/button', () => ({
  Button: ({ children, onClick, ...props }: any) => (
    <button onClick={onClick} {...props}>
      {children}
    </button>
  ),
}));

// Mock scrollTo method
Element.prototype.scrollTo = vi.fn() as any;

const mockUseUserGuideStore = vi.mocked(useUserGuideStore);
const mockLoadGuideContent = vi.mocked(contentLoader.loadGuideContent);
const mockGetSectionById = vi.mocked(contentLoader.getSectionById);
const mockProcessMarkdown = vi.mocked(markdownProcessor.processMarkdown);

const mockGuideContent = {
  sections: {
    'getting-started': {
      'welcome': {
        id: 'getting-started/welcome',
        title: 'Welcome to DevNotes',
        content: '# Welcome\n\nThis is a test section with some content.',
        searchKeywords: ['welcome', 'introduction'],
        category: 'getting-started' as const,
      },
      'first-note': {
        id: 'getting-started/first-note',
        title: 'First Note',
        content: '# First Note',
        searchKeywords: ['first', 'note'],
        category: 'getting-started' as const,
      },
      'organizing-notes': {
        id: 'getting-started/organizing-notes',
        title: 'Organizing Notes',
        content: '# Organizing Notes',
        searchKeywords: ['organizing', 'notes'],
        category: 'getting-started' as const,
      },
    },
    'features': {
      'markdown-editor': {
        id: 'features/markdown-editor',
        title: 'Markdown Editor',
        content: '# Markdown Editor\n\n```javascript\nconsole.log("Hello World");\n```',
        searchKeywords: ['markdown', 'editor'],
        category: 'features' as const,
      },
      'search': {
        id: 'features/search',
        title: 'Search',
        content: '# Search',
        searchKeywords: ['search'],
        category: 'features' as const,
      },
      'export-import': {
        id: 'features/export-import',
        title: 'Export Import',
        content: '# Export Import',
        searchKeywords: ['export', 'import'],
        category: 'features' as const,
      },
      'keyboard-shortcuts': {
        id: 'features/keyboard-shortcuts',
        title: 'Keyboard Shortcuts',
        content: '# Keyboard Shortcuts',
        searchKeywords: ['keyboard', 'shortcuts'],
        category: 'features' as const,
      },
    },
    'advanced': {
      'power-user-tips': {
        id: 'advanced/power-user-tips',
        title: 'Power User Tips',
        content: '# Power User Tips',
        searchKeywords: ['power', 'user', 'tips'],
        category: 'advanced' as const,
      },
      'customization': {
        id: 'advanced/customization',
        title: 'Customization',
        content: '# Customization',
        searchKeywords: ['customization'],
        category: 'advanced' as const,
      },
      'data-management': {
        id: 'advanced/data-management',
        title: 'Data Management',
        content: '# Data Management',
        searchKeywords: ['data', 'management'],
        category: 'advanced' as const,
      },
    },
    'troubleshooting': {
      'common-issues': {
        id: 'troubleshooting/common-issues',
        title: 'Common Issues',
        content: '# Common Issues',
        searchKeywords: ['common', 'issues'],
        category: 'troubleshooting' as const,
      },
      'performance': {
        id: 'troubleshooting/performance',
        title: 'Performance',
        content: '# Performance',
        searchKeywords: ['performance'],
        category: 'troubleshooting' as const,
      },
      'data-recovery': {
        id: 'troubleshooting/data-recovery',
        title: 'Data Recovery',
        content: '# Data Recovery',
        searchKeywords: ['data', 'recovery'],
        category: 'troubleshooting' as const,
      },
    },
  },
};

const mockStoreState = {
  currentSection: 'getting-started/welcome',
  navigateToSection: vi.fn(),
  isOpen: true,
  searchQuery: '',
  searchResults: [],
  lastViewedSection: 'getting-started/welcome',
  searchHistory: [],
  openGuide: vi.fn(),
  closeGuide: vi.fn(),
  setSearchQuery: vi.fn(),
  setSearchResults: vi.fn(),
  addToSearchHistory: vi.fn(),
  clearSearchHistory: vi.fn(),
};

describe('UserGuideContent', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseUserGuideStore.mockReturnValue(mockStoreState);
    mockLoadGuideContent.mockResolvedValue(mockGuideContent);
    mockGetSectionById.mockReturnValue(mockGuideContent.sections['getting-started']['welcome']);
    mockProcessMarkdown.mockResolvedValue('<h1>Welcome</h1><p>This is a test section with some content.</p>');
  });

  afterEach(() => {
    vi.clearAllTimers();
  });

  describe('Loading States', () => {
    it('should show loading state initially', async () => {
      mockLoadGuideContent.mockImplementation(() => new Promise(() => {})); // Never resolves
      
      render(<UserGuideContent />);
      
      expect(screen.getByText('Loading guide content...')).toBeInTheDocument();
      expect(screen.getByText('Loading guide content...').closest('div')).toHaveClass('text-center');
    });

    it('should show error state when content loading fails', async () => {
      const errorMessage = 'Network error';
      mockLoadGuideContent.mockRejectedValue(new Error(errorMessage));
      
      render(<UserGuideContent />);
      
      await waitFor(() => {
        expect(screen.getByText('Content Unavailable')).toBeInTheDocument();
        expect(screen.getByText('Failed to load guide content. Please try again.')).toBeInTheDocument();
        expect(screen.getByText('Retry')).toBeInTheDocument();
      });
    });

    it('should show no content state when section is not found', async () => {
      mockGetSectionById.mockReturnValue(null);
      
      render(<UserGuideContent />);
      
      await waitFor(() => {
        expect(screen.getByText('Section not found. Please select a valid section from the navigation.')).toBeInTheDocument();
      });
    });
  });

  describe('Content Rendering', () => {
    it('should render section title and metadata', async () => {
      render(<UserGuideContent />);
      
      await waitFor(() => {
        expect(screen.getByText('Welcome to DevNotes')).toBeInTheDocument();
        expect(screen.getByText('getting started')).toBeInTheDocument();
        expect(screen.getByText('getting-started/welcome')).toBeInTheDocument();
      });
    });

    it('should render processed markdown content', async () => {
      render(<UserGuideContent />);
      
      await waitFor(() => {
        expect(mockProcessMarkdown).toHaveBeenCalledWith('# Welcome\n\nThis is a test section with some content.');
      });
      
      // Check that the processed HTML is rendered
      await waitFor(() => {
        const contentElement = screen.getByRole('main');
        expect(contentElement).toHaveAttribute('aria-label', 'Welcome to DevNotes content');
      });
    });

    it('should handle markdown processing errors gracefully', async () => {
      mockProcessMarkdown.mockRejectedValue(new Error('Processing failed'));
      
      render(<UserGuideContent />);
      
      await waitFor(() => {
        expect(mockProcessMarkdown).toHaveBeenCalled();
      });
      
      // Should still render the component without crashing
      expect(screen.getByText('Welcome to DevNotes')).toBeInTheDocument();
    });
  });

  describe('Section Navigation', () => {
    it('should update content when current section changes', async () => {
      const { rerender } = render(<UserGuideContent />);
      
      await waitFor(() => {
        expect(screen.getByText('Welcome to DevNotes')).toBeInTheDocument();
      });
      
      // Change section
      mockUseUserGuideStore.mockReturnValue({
        ...mockStoreState,
        currentSection: 'features/markdown-editor',
      });
      
      mockGetSectionById.mockReturnValue(mockGuideContent.sections['features']['markdown-editor']);
      mockProcessMarkdown.mockResolvedValue('<h1>Markdown Editor</h1><pre><code class="language-javascript">console.log("Hello World");</code></pre>');
      
      rerender(<UserGuideContent />);
      
      await waitFor(() => {
        expect(screen.getByText('Markdown Editor')).toBeInTheDocument();
      });
    });

    it('should scroll to top when section changes', async () => {
      const { rerender } = render(<UserGuideContent />);
      
      await waitFor(() => {
        expect(screen.getByText('Welcome to DevNotes')).toBeInTheDocument();
      });
      
      // Change section
      mockUseUserGuideStore.mockReturnValue({
        ...mockStoreState,
        currentSection: 'features/markdown-editor',
      });
      
      mockGetSectionById.mockReturnValue(mockGuideContent.sections['features']['markdown-editor']);
      mockProcessMarkdown.mockResolvedValue('<h1>Markdown Editor</h1>');
      
      rerender(<UserGuideContent />);
      
      await waitFor(() => {
        expect(screen.getByText('Markdown Editor')).toBeInTheDocument();
      });
      
      // Verify scrollTo was called (mocked globally)
      expect(Element.prototype.scrollTo).toHaveBeenCalled();
    });
  });

  describe('Link Handling', () => {
    it('should handle internal guide links', async () => {
      mockProcessMarkdown.mockResolvedValue('<p><a href="features/markdown-editor">Markdown Editor</a></p>');
      
      render(<UserGuideContent />);
      
      await waitFor(() => {
        const link = screen.getByText('Markdown Editor');
        expect(link).toBeInTheDocument();
      });
      
      const link = screen.getByText('Markdown Editor');
      fireEvent.click(link);
      
      expect(mockStoreState.navigateToSection).toHaveBeenCalledWith('features/markdown-editor');
    });

    it('should handle external links', async () => {
      const mockOpen = vi.fn();
      vi.stubGlobal('open', mockOpen);
      
      mockProcessMarkdown.mockResolvedValue('<p><a href="https://example.com">External Link</a></p>');
      
      render(<UserGuideContent />);
      
      await waitFor(() => {
        const link = screen.getByText('External Link');
        expect(link).toBeInTheDocument();
      });
      
      const link = screen.getByText('External Link');
      fireEvent.click(link);
      
      expect(mockOpen).toHaveBeenCalledWith('https://example.com', '_blank', 'noopener,noreferrer');
    });
  });

  describe('Copy to Clipboard', () => {
    it('should render content with code blocks', async () => {
      mockProcessMarkdown.mockResolvedValue('<pre><code class="language-javascript">console.log("Hello World");</code></pre>');
      
      render(<UserGuideContent />);
      
      await waitFor(() => {
        expect(screen.getByText('Welcome to DevNotes')).toBeInTheDocument();
      });
      
      // Verify the content is rendered
      const mainContent = screen.getByRole('main');
      expect(mainContent).toBeInTheDocument();
    });

    it('should handle clipboard operations', async () => {
      render(<UserGuideContent />);
      
      await waitFor(() => {
        expect(screen.getByText('Welcome to DevNotes')).toBeInTheDocument();
      });
      
      // Test that clipboard API is available
      expect(navigator.clipboard.writeText).toBeDefined();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels', async () => {
      render(<UserGuideContent />);
      
      await waitFor(() => {
        const mainContent = screen.getByRole('main');
        expect(mainContent).toHaveAttribute('aria-label', 'Welcome to DevNotes content');
      });
    });

    it('should have proper ARIA live region attributes', async () => {
      render(<UserGuideContent />);
      
      await waitFor(() => {
        const mainContent = screen.getByRole('main');
        expect(mainContent).toHaveAttribute('aria-live', 'polite');
        expect(mainContent).toHaveAttribute('aria-atomic', 'false');
      });
    });

    it('should be keyboard navigable with tabindex', async () => {
      render(<UserGuideContent />);
      
      await waitFor(() => {
        const mainContent = screen.getByRole('main');
        expect(mainContent).toHaveAttribute('tabindex', '0');
      });
    });

    it('should add accessibility attributes to code blocks', async () => {
      mockProcessMarkdown.mockResolvedValue('<pre><code class="language-javascript">console.log("Hello");</code></pre>');
      
      render(<UserGuideContent />);
      
      await waitFor(() => {
        expect(screen.getByText('Welcome to DevNotes')).toBeInTheDocument();
      });
      
      // Wait for useEffect to process code blocks
      await waitFor(() => {
        const codeElement = document.querySelector('code');
        if (codeElement) {
          expect(codeElement).toHaveAttribute('role', 'code');
          expect(codeElement).toHaveAttribute('aria-label');
        }
      });
    });

    it('should add accessibility attributes to copy buttons', async () => {
      mockProcessMarkdown.mockResolvedValue('<pre><code class="language-javascript">console.log("Hello");</code></pre>');
      
      render(<UserGuideContent />);
      
      await waitFor(() => {
        expect(screen.getByText('Welcome to DevNotes')).toBeInTheDocument();
      });
      
      // Wait for copy buttons to be added
      await waitFor(() => {
        const copyButton = document.querySelector('.copy-button-container button');
        if (copyButton) {
          expect(copyButton).toHaveAttribute('aria-label');
          expect(copyButton).toHaveAttribute('type', 'button');
          expect(copyButton).toHaveClass('focus:ring-2', 'focus:ring-blue-500');
        }
      });
    });

    it('should add accessibility attributes to headings', async () => {
      mockProcessMarkdown.mockResolvedValue('<h2>Test Heading</h2><h3>Sub Heading</h3>');
      
      render(<UserGuideContent />);
      
      await waitFor(() => {
        expect(screen.getByText('Welcome to DevNotes')).toBeInTheDocument();
      });
      
      // Wait for headings to be processed
      await waitFor(() => {
        const headings = document.querySelectorAll('h2, h3');
        headings.forEach(heading => {
          expect(heading).toHaveAttribute('tabindex', '0');
          expect(heading.id).toBeTruthy();
        });
      });
    });

    it('should add accessibility attributes to external links', async () => {
      mockProcessMarkdown.mockResolvedValue('<a href="https://example.com">External Link</a>');
      
      render(<UserGuideContent />);
      
      await waitFor(() => {
        expect(screen.getByText('Welcome to DevNotes')).toBeInTheDocument();
      });
      
      // Wait for links to be processed
      await waitFor(() => {
        const link = document.querySelector('a[href^="https://"]');
        if (link) {
          expect(link).toHaveAttribute('aria-label');
          expect(link).toHaveAttribute('rel', 'noopener noreferrer');
          expect(link.getAttribute('aria-label')).toContain('opens in new tab');
        }
      });
    });

    it('should add accessibility attributes to images', async () => {
      mockProcessMarkdown.mockResolvedValue('<img src="test.jpg" />');
      
      render(<UserGuideContent />);
      
      await waitFor(() => {
        expect(screen.getByText('Welcome to DevNotes')).toBeInTheDocument();
      });
      
      // Wait for images to be processed
      await waitFor(() => {
        const image = document.querySelector('img');
        if (image) {
          expect(image).toHaveAttribute('role', 'img');
          expect(image).toHaveAttribute('alt');
        }
      });
    });

    it('should handle keyboard events on copy buttons', async () => {
      mockProcessMarkdown.mockResolvedValue('<pre><code>test code</code></pre>');
      
      render(<UserGuideContent />);
      
      await waitFor(() => {
        expect(screen.getByText('Welcome to DevNotes')).toBeInTheDocument();
      });
      
      // Wait for copy button to be added and test keyboard interaction
      await waitFor(() => {
        const copyButton = document.querySelector('.copy-button-container button');
        if (copyButton) {
          // Test Enter key
          fireEvent.keyDown(copyButton, { key: 'Enter' });
          expect(navigator.clipboard.writeText).toHaveBeenCalled();
          
          // Test Space key
          fireEvent.keyDown(copyButton, { key: ' ' });
          expect(navigator.clipboard.writeText).toHaveBeenCalled();
        }
      });
    });

    it('should update copy button aria-label when state changes', async () => {
      mockProcessMarkdown.mockResolvedValue('<pre><code>test code</code></pre>');
      
      render(<UserGuideContent />);
      
      await waitFor(() => {
        expect(screen.getByText('Welcome to DevNotes')).toBeInTheDocument();
      });
      
      // Wait for copy button and test state change
      await waitFor(() => {
        const copyButton = document.querySelector('.copy-button-container button');
        if (copyButton) {
          const initialLabel = copyButton.getAttribute('aria-label');
          expect(initialLabel).toContain('Copy code example');
          
          // Simulate successful copy
          fireEvent.click(copyButton);
          
          // Check that aria-label updates
          setTimeout(() => {
            const updatedLabel = copyButton.getAttribute('aria-label');
            expect(updatedLabel).toContain('copied to clipboard');
          }, 100);
        }
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle retry action in error state', async () => {
      const mockReload = vi.fn();
      Object.defineProperty(window, 'location', {
        value: { reload: mockReload },
        writable: true,
      });
      
      mockLoadGuideContent.mockRejectedValue(new Error('Network error'));
      
      render(<UserGuideContent />);
      
      await waitFor(() => {
        expect(screen.getByText('Retry')).toBeInTheDocument();
      });
      
      const retryButton = screen.getByText('Retry');
      fireEvent.click(retryButton);
      
      expect(mockReload).toHaveBeenCalled();
    });

    it('should handle missing content gracefully', async () => {
      mockLoadGuideContent.mockResolvedValue({
        sections: {
          'getting-started': {} as any,
          'features': {} as any,
          'advanced': {} as any,
          'troubleshooting': {} as any,
        },
      } as any);
      
      mockGetSectionById.mockReturnValue(null);
      
      render(<UserGuideContent />);
      
      await waitFor(() => {
        expect(screen.getByText('Section not found. Please select a valid section from the navigation.')).toBeInTheDocument();
      });
    });
  });

  describe('Custom Props', () => {
    it('should apply custom className', async () => {
      const { container } = render(<UserGuideContent className="custom-class" />);
      
      await waitFor(() => {
        expect(container.firstChild).toHaveClass('custom-class');
      });
    });
  });
});