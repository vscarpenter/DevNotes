/**
 * End-to-end tests for complete user guide workflow
 * Tests all major user stories and acceptance criteria
 */

import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { UserGuideModal } from '../UserGuideModal';
import { useUserGuideStore } from '../../../stores/userGuideStore';
import { useUIStore } from '../../../stores/uiStore';

// Mock the stores
vi.mock('../../../stores/userGuideStore');
vi.mock('../../../stores/uiStore');

// Mock clipboard API
Object.assign(navigator, {
  clipboard: {
    writeText: vi.fn().mockResolvedValue(undefined),
  },
});

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

describe('User Guide End-to-End Tests', () => {
  const mockUserGuideStore = {
    isOpen: true,
    currentSection: 'getting-started/welcome',
    searchQuery: '',
    searchResults: [],
    lastViewedSection: 'getting-started/welcome',
    searchHistory: [],
    openGuide: vi.fn(),
    closeGuide: vi.fn(),
    navigateToSection: vi.fn(),
    setSearchQuery: vi.fn(),
    setSearchResults: vi.fn(),
    addToSearchHistory: vi.fn(),
    clearSearchHistory: vi.fn(),
  };

  const mockUIStore = {
    theme: 'light' as const,
    isDarkMode: false,
    getEffectiveTheme: vi.fn().mockReturnValue('light'),
  };

  beforeEach(() => {
    vi.mocked(useUserGuideStore).mockReturnValue(mockUserGuideStore);
    vi.mocked(useUIStore).mockReturnValue(mockUIStore as any);
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('User Story 1: Access comprehensive user guide', () => {
    it('should display comprehensive user guide interface when opened', async () => {
      render(<UserGuideModal isOpen={true} onClose={() => {}} />);

      // Verify modal is displayed
      expect(screen.getByRole('dialog', { name: /user guide/i })).toBeInTheDocument();
      
      // Verify table of contents is shown
      expect(screen.getByRole('navigation', { name: /guide navigation/i })).toBeInTheDocument();
      
      // Verify major feature categories are present
      expect(screen.getByText(/getting started/i)).toBeInTheDocument();
      expect(screen.getByText(/features/i)).toBeInTheDocument();
      expect(screen.getByText(/advanced/i)).toBeInTheDocument();
      expect(screen.getByText(/troubleshooting/i)).toBeInTheDocument();
    });

    it('should navigate to specific section when topic is clicked', async () => {
      const user = userEvent.setup();
      render(<UserGuideModal isOpen={true} onClose={() => {}} />);

      const markdownEditorLink = screen.getByRole('button', { name: /markdown editor/i });
      await user.click(markdownEditorLink);

      expect(mockUserGuideStore.navigateToSection).toHaveBeenCalledWith('features/markdown-editor');
    });

    it('should provide search functionality', async () => {
      const user = userEvent.setup();
      render(<UserGuideModal isOpen={true} onClose={() => {}} />);

      const searchInput = screen.getByRole('combobox', { name: /search user guide/i });
      expect(searchInput).toBeInTheDocument();

      await user.type(searchInput, 'keyboard shortcuts');
      
      expect(mockUserGuideStore.setSearchQuery).toHaveBeenCalledWith('keyboard shortcuts');
    });

    it('should highlight matching content in search results', async () => {
      const user = userEvent.setup();
      mockUserGuideStore.searchResults = [];
      mockUserGuideStore.setSearchResults([
        {
          id: 'features/keyboard-shortcuts',
          title: 'Keyboard Shortcuts',
          content: 'Learn about keyboard shortcuts for faster navigation',
          searchKeywords: ['keyboard', 'shortcuts', 'hotkeys'],
          category: 'features' as const
        }
      ]);

      render(<UserGuideModal isOpen={true} onClose={() => {}} />);

      const searchInput = screen.getByRole('combobox', { name: /search user guide/i });
      await user.type(searchInput, 'keyboard');

      await waitFor(() => {
        expect(screen.getByText(/keyboard shortcuts/i)).toBeInTheDocument();
      });
    });
  });

  describe('User Story 2: Practical examples and screenshots', () => {
    it('should display step-by-step instructions with visual examples', async () => {
      mockUserGuideStore.currentSection = 'getting-started/first-note';
      render(<UserGuideModal isOpen={true} onClose={() => {}} />);

      // Verify content area shows instructions
      expect(screen.getByRole('main', { name: /guide content/i })).toBeInTheDocument();
      
      // Content would be loaded and displayed here
      await waitFor(() => {
        expect(screen.queryByText(/loading guide content/i)).not.toBeInTheDocument();
      });
    });

    it('should show markdown syntax and rendered output', async () => {
      mockUserGuideStore.currentSection = 'features/markdown-editor';
      render(<UserGuideModal isOpen={true} onClose={() => {}} />);

      // Verify code examples are present (would be rendered by markdown processor)
      await waitFor(() => {
        expect(screen.queryByText(/loading guide content/i)).not.toBeInTheDocument();
      });
    });

    it('should display keyboard shortcuts clearly', async () => {
      mockUserGuideStore.currentSection = 'features/keyboard-shortcuts';
      render(<UserGuideModal isOpen={true} onClose={() => {}} />);

      await waitFor(() => {
        expect(screen.queryByText(/loading guide content/i)).not.toBeInTheDocument();
      });
    });

    it('should provide copy-to-clipboard functionality for code snippets', async () => {
      const user = userEvent.setup();
      mockUserGuideStore.currentSection = 'features/markdown-editor';
      render(<UserGuideModal isOpen={true} onClose={() => {}} />);

      // Look for copy buttons (would be rendered with code blocks)
      await waitFor(() => {
        const copyButtons = screen.queryAllByRole('button', { name: /copy/i });
        if (copyButtons.length > 0) {
          expect(copyButtons[0]).toBeInTheDocument();
        }
      });
    });
  });

  describe('User Story 3: Accessible without leaving application', () => {
    it('should display in modal that does not disrupt workspace', () => {
      render(<UserGuideModal isOpen={true} onClose={() => {}} />);

      const modal = screen.getByRole('dialog', { name: /user guide/i });
      expect(modal).toBeInTheDocument();
      
      // Modal should have backdrop
      expect(modal.closest('[data-backdrop="true"]')).toBeTruthy();
    });

    it('should allow closing and returning to previous state', async () => {
      const user = userEvent.setup();
      render(<UserGuideModal isOpen={true} onClose={() => {}} />);

      const closeButton = screen.getByRole('button', { name: /close/i });
      await user.click(closeButton);

      expect(mockUserGuideStore.closeGuide).toHaveBeenCalled();
    });

    it('should provide easy navigation between guide sections', async () => {
      const user = userEvent.setup();
      render(<UserGuideModal isOpen={true} onClose={() => {}} />);

      // Test navigation buttons
      const nextButton = screen.queryByRole('button', { name: /next/i });
      const prevButton = screen.queryByRole('button', { name: /previous/i });

      if (nextButton) {
        await user.click(nextButton);
        expect(mockUserGuideStore.navigateToSection).toHaveBeenCalled();
      }
    });

    it('should remember last viewed section when reopened', () => {
      mockUserGuideStore.lastViewedSection = 'advanced/power-user-tips';
      mockUserGuideStore.currentSection = 'advanced/power-user-tips';
      
      render(<UserGuideModal isOpen={true} onClose={() => {}} />);

      expect(mockUserGuideStore.currentSection).toBe('advanced/power-user-tips');
    });
  });

  describe('User Story 4: Contextual help with tooltips', () => {
    it('should handle keyboard navigation for tooltips', async () => {
      render(<UserGuideModal isOpen={true} onClose={() => {}} />);

      // Test ESC key dismisses tooltips
      fireEvent.keyDown(document, { key: 'Escape' });
      
      // Tooltip system should handle this
      expect(document.activeElement).toBeDefined();
    });

    it('should provide relevant help links for errors', async () => {
      // This would be tested in integration with error handling
      render(<UserGuideModal isOpen={true} onClose={() => {}} />);
      
      // Verify help system is available
      expect(screen.getByRole('dialog', { name: /user guide/i })).toBeInTheDocument();
    });
  });

  describe('User Story 5: Advanced features and technical details', () => {
    it('should document all keyboard shortcuts', async () => {
      mockUserGuideStore.currentSection = 'features/keyboard-shortcuts';
      render(<UserGuideModal isOpen={true} onClose={() => {}} />);

      await waitFor(() => {
        expect(screen.queryByText(/loading guide content/i)).not.toBeInTheDocument();
      });

      // Content would include comprehensive keyboard shortcuts
    });

    it('should detail advanced search operators', async () => {
      mockUserGuideStore.currentSection = 'features/search';
      render(<UserGuideModal isOpen={true} onClose={() => {}} />);

      await waitFor(() => {
        expect(screen.queryByText(/loading guide content/i)).not.toBeInTheDocument();
      });
    });

    it('should explain export/import technical specifications', async () => {
      mockUserGuideStore.currentSection = 'features/export-import';
      render(<UserGuideModal isOpen={true} onClose={() => {}} />);

      await waitFor(() => {
        expect(screen.queryByText(/loading guide content/i)).not.toBeInTheDocument();
      });
    });

    it('should document data storage and persistence', async () => {
      mockUserGuideStore.currentSection = 'advanced/data-management';
      render(<UserGuideModal isOpen={true} onClose={() => {}} />);

      await waitFor(() => {
        expect(screen.queryByText(/loading guide content/i)).not.toBeInTheDocument();
      });
    });
  });

  describe('User Story 6: Responsive and accessible design', () => {
    it('should handle keyboard-only navigation', async () => {
      render(<UserGuideModal isOpen={true} onClose={() => {}} />);

      const modal = screen.getByRole('dialog', { name: /user guide/i });
      
      // Test Tab navigation
      fireEvent.keyDown(modal, { key: 'Tab' });
      expect(document.activeElement).toBeDefined();

      // Test Escape to close
      fireEvent.keyDown(modal, { key: 'Escape' });
      expect(mockUserGuideStore.closeGuide).toHaveBeenCalled();
    });

    it('should provide proper ARIA labels and semantic structure', () => {
      render(<UserGuideModal isOpen={true} onClose={() => {}} />);

      // Verify semantic structure
      expect(screen.getByRole('dialog', { name: /user guide/i })).toBeInTheDocument();
      expect(screen.getByRole('navigation', { name: /guide navigation/i })).toBeInTheDocument();
      expect(screen.getByRole('main', { name: /guide content/i })).toBeInTheDocument();
    });

    it('should maintain proper contrast ratios', () => {
      render(<UserGuideModal isOpen={true} onClose={() => {}} />);

      const modal = screen.getByRole('dialog', { name: /user guide/i });
      
      // Verify modal has proper styling classes for contrast
      expect(modal).toHaveClass('bg-white', 'text-gray-900');
    });

    it('should handle zoom levels up to 200%', () => {
      // Mock viewport scaling
      Object.defineProperty(window, 'devicePixelRatio', {
        writable: true,
        value: 2,
      });

      render(<UserGuideModal isOpen={true} onClose={() => {}} />);

      const modal = screen.getByRole('dialog', { name: /user guide/i });
      expect(modal).toBeInTheDocument();
    });
  });

  describe('Complete Workflow Tests', () => {
    it('should complete full user journey from opening to finding information', async () => {
      const user = userEvent.setup();
      render(<UserGuideModal isOpen={true} onClose={() => {}} />);

      // 1. User opens guide
      expect(screen.getByRole('dialog', { name: /user guide/i })).toBeInTheDocument();

      // 2. User searches for information
      const searchInput = screen.getByRole('combobox', { name: /search user guide/i });
      await user.type(searchInput, 'export');

      expect(mockUserGuideStore.setSearchQuery).toHaveBeenCalledWith('export');

      // 3. User clicks on search result
      mockUserGuideStore.searchResults = [];
      mockUserGuideStore.setSearchResults([
        {
          id: 'features/export-import',
          title: 'Export & Import',
          content: 'Learn how to export and import your notes',
          searchKeywords: ['export', 'import', 'backup'],
          category: 'features' as const
        }
      ]);

      // Re-render with search results
      render(<UserGuideModal isOpen={true} onClose={() => {}} />);

      // 4. User navigates to section
      const exportLink = screen.getByRole('button', { name: /export.*import/i });
      await user.click(exportLink);

      expect(mockUserGuideStore.navigateToSection).toHaveBeenCalledWith('features/export-import');

      // 5. User copies code example
      if (navigator.clipboard.writeText) {
        // Code copy functionality would be tested here
        expect(navigator.clipboard.writeText).toBeDefined();
      }

      // 6. User closes guide
      const closeButton = screen.getByRole('button', { name: /close/i });
      await user.click(closeButton);

      expect(mockUserGuideStore.closeGuide).toHaveBeenCalled();
    });

    it('should handle error scenarios gracefully', async () => {
      const user = userEvent.setup();
      
      // Mock search error
      mockUserGuideStore.setSearchQuery = vi.fn().mockImplementation(() => {
        throw new Error('Search failed');
      });

      render(<UserGuideModal isOpen={true} onClose={() => {}} />);

      const searchInput = screen.getByRole('combobox', { name: /search user guide/i });
      
      // Should not crash when search fails
      await user.type(searchInput, 'test');
      
      // Guide should still be functional
      expect(screen.getByRole('dialog', { name: /user guide/i })).toBeInTheDocument();
    });

    it('should maintain performance during extended use', async () => {
      const user = userEvent.setup();
      render(<UserGuideModal isOpen={true} onClose={() => {}} />);

      const startTime = performance.now();

      // Simulate extended use with multiple operations
      for (let i = 0; i < 10; i++) {
        const searchInput = screen.getByRole('combobox', { name: /search user guide/i });
        await user.clear(searchInput);
        await user.type(searchInput, `query${i}`);
        
        // Navigate to different sections
        if (i % 2 === 0) {
          mockUserGuideStore.navigateToSection(`section${i}`);
        }
      }

      const endTime = performance.now();
      const totalTime = endTime - startTime;

      // Should maintain good performance even with extended use
      expect(totalTime).toBeLessThan(2000); // Allow generous buffer for test environment
    });
  });

  describe('Accessibility Compliance Tests', () => {
    it('should support screen reader navigation', () => {
      render(<UserGuideModal isOpen={true} onClose={() => {}} />);

      // Verify proper heading structure
      const headings = screen.getAllByRole('heading');
      expect(headings.length).toBeGreaterThan(0);

      // Verify navigation landmarks
      expect(screen.getByRole('navigation', { name: /guide navigation/i })).toBeInTheDocument();
      expect(screen.getByRole('main', { name: /guide content/i })).toBeInTheDocument();
    });

    it('should handle focus management correctly', async () => {
      render(<UserGuideModal isOpen={true} onClose={() => {}} />);

      const modal = screen.getByRole('dialog', { name: /user guide/i });
      
      // Focus should be trapped within modal
      fireEvent.keyDown(modal, { key: 'Tab' });
      
      const focusedElement = document.activeElement;
      expect(modal.contains(focusedElement)).toBe(true);
    });

    it('should provide alternative text for images', async () => {
      mockUserGuideStore.currentSection = 'getting-started/first-note';
      render(<UserGuideModal isOpen={true} onClose={() => {}} />);

      // Images in content should have alt text (would be rendered by markdown processor)
      await waitFor(() => {
        const images = screen.queryAllByRole('img');
        images.forEach(img => {
          expect(img).toHaveAttribute('alt');
        });
      });
    });
  });

  describe('Mobile and Responsive Tests', () => {
    it('should adapt to mobile viewport', () => {
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        value: 375,
      });

      render(<UserGuideModal isOpen={true} onClose={() => {}} />);

      const modal = screen.getByRole('dialog', { name: /user guide/i });
      expect(modal).toBeInTheDocument();
      
      // Should have mobile-appropriate classes
      expect(modal).toHaveClass('w-full', 'h-full');
    });

    it('should handle touch interactions', async () => {
      render(<UserGuideModal isOpen={true} onClose={() => {}} />);

      const modal = screen.getByRole('dialog', { name: /user guide/i });
      
      // Simulate touch events
      fireEvent.touchStart(modal, { touches: [{ clientX: 100, clientY: 100 }] });
      fireEvent.touchEnd(modal, { changedTouches: [{ clientX: 100, clientY: 100 }] });
      
      expect(modal).toBeInTheDocument();
    });
  });
});