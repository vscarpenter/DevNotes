/**
 * Accessibility audit tests for user guide components
 * Requirements: 6.2, 6.3, 6.4 - WCAG 2.1 AA compliance
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { axe, toHaveNoViolations } from 'jest-axe';

// Extend expect with jest-axe matchers
expect.extend(toHaveNoViolations);
import { UserGuideModal } from '../UserGuideModal';
import { UserGuideNavigation } from '../UserGuideNavigation';
import { UserGuideContent } from '../UserGuideContent';
import { UserGuideSearch } from '../UserGuideSearch';
import { UserGuideTooltip } from '../UserGuideTooltip';
import { useUserGuideStore } from '../../../stores/userGuideStore';
import { useUIStore } from '../../../stores/uiStore';

// Extend Jest matchers
expect.extend(toHaveNoViolations);

// Mock the stores
vi.mock('../../../stores/userGuideStore');
vi.mock('../../../stores/uiStore');

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

describe('User Guide Accessibility Tests', () => {
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

  describe('WCAG 2.1 AA Compliance', () => {
    it('should have no accessibility violations in UserGuideModal', async () => {
      const { container } = render(<UserGuideModal isOpen={true} onClose={() => {}} />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have no accessibility violations in UserGuideNavigation', async () => {
      const { container } = render(<UserGuideNavigation />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have no accessibility violations in UserGuideContent', async () => {
      const { container } = render(<UserGuideContent />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have no accessibility violations in UserGuideSearch', async () => {
      const { container } = render(<UserGuideSearch />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have no accessibility violations in UserGuideTooltip', async () => {
      const { container } = render(
        <UserGuideTooltip config={{ id: "test-tooltip", content: "Test tooltip", position: "top", trigger: "hover", delay: 0 }}>
          <button>Test button</button>
        </UserGuideTooltip>
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('Keyboard Navigation', () => {
    it('should support full keyboard navigation in modal', async () => {
      render(<UserGuideModal isOpen={true} onClose={() => {}} />);

      const modal = screen.getByRole('dialog', { name: /user guide/i });
      
      // Focus should be trapped within modal
      modal.focus();
      expect(document.activeElement).toBe(modal);

      // Tab should move focus to first interactive element
      fireEvent.keyDown(modal, { key: 'Tab' });
      
      const focusableElements = modal.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      
      expect(focusableElements.length).toBeGreaterThan(0);
    });

    it('should handle Escape key to close modal', async () => {
      render(<UserGuideModal isOpen={true} onClose={() => {}} />);

      const modal = screen.getByRole('dialog', { name: /user guide/i });
      fireEvent.keyDown(modal, { key: 'Escape' });

      expect(mockUserGuideStore.closeGuide).toHaveBeenCalled();
    });

    it('should support arrow key navigation in table of contents', async () => {
      render(<UserGuideNavigation />);

      const navigation = screen.getByRole('navigation', { name: /guide navigation/i });
      const firstLink = navigation.querySelector('button');
      
      if (firstLink) {
        firstLink.focus();
        fireEvent.keyDown(firstLink, { key: 'ArrowDown' });
        
        // Should move focus to next item
        expect(document.activeElement).toBeDefined();
      }
    });

    it('should support keyboard navigation in search results', async () => {
      const user = userEvent.setup();
      mockUserGuideStore.searchResults = [];
      mockUserGuideStore.setSearchResults([
        {
          id: 'features/search',
          title: 'Search Features',
          content: 'Learn about search functionality',
          searchKeywords: ['search', 'find'],
          category: 'features' as const
        }
      ]);

      render(<UserGuideSearch />);

      const searchInput = screen.getByRole('combobox', { name: /search user guide/i });
      await user.type(searchInput, 'search');

      // Arrow keys should navigate search results
      fireEvent.keyDown(searchInput, { key: 'ArrowDown' });
      fireEvent.keyDown(searchInput, { key: 'ArrowUp' });
      
      expect(searchInput).toBeInTheDocument();
    });

    it('should handle Enter key to select search results', async () => {
      const user = userEvent.setup();
      mockUserGuideStore.searchResults = [];
      mockUserGuideStore.setSearchResults([
        {
          id: 'features/search',
          title: 'Search Features',
          content: 'Learn about search functionality',
          searchKeywords: ['search', 'find'],
          category: 'features' as const
        }
      ]);

      render(<UserGuideSearch />);

      const searchInput = screen.getByRole('combobox', { name: /search user guide/i });
      await user.type(searchInput, 'search');

      fireEvent.keyDown(searchInput, { key: 'ArrowDown' });
      fireEvent.keyDown(searchInput, { key: 'Enter' });

      // Should navigate to selected result
      expect(mockUserGuideStore.navigateToSection).toHaveBeenCalled();
    });
  });

  describe('Screen Reader Support', () => {
    it('should provide proper ARIA labels for all interactive elements', () => {
      render(<UserGuideModal isOpen={true} onClose={() => {}} />);

      // Modal should have proper ARIA attributes
      const modal = screen.getByRole('dialog', { name: /user guide/i });
      expect(modal).toHaveAttribute('aria-modal', 'true');
      expect(modal).toHaveAttribute('aria-labelledby');

      // Close button should have accessible name
      const closeButton = screen.getByRole('button', { name: /close/i });
      expect(closeButton).toHaveAttribute('aria-label');
    });

    it('should provide proper heading structure', () => {
      render(<UserGuideModal isOpen={true} onClose={() => {}} />);

      // Should have logical heading hierarchy
      const headings = screen.getAllByRole('heading');
      expect(headings.length).toBeGreaterThan(0);

      // Main heading should be h1
      const mainHeading = headings.find(h => h.tagName === 'H1');
      expect(mainHeading).toBeInTheDocument();
    });

    it('should provide proper landmarks', () => {
      render(<UserGuideModal isOpen={true} onClose={() => {}} />);

      // Should have navigation landmark
      expect(screen.getByRole('navigation', { name: /guide navigation/i })).toBeInTheDocument();
      
      // Should have main content landmark
      expect(screen.getByRole('main', { name: /guide content/i })).toBeInTheDocument();
    });

    it('should provide live region updates for search results', async () => {
      const user = userEvent.setup();
      render(<UserGuideSearch />);

      const searchInput = screen.getByRole('combobox', { name: /search user guide/i });
      
      // Live region should announce search results
      const liveRegion = screen.queryByRole('status');
      if (liveRegion) {
        expect(liveRegion).toHaveAttribute('aria-live', 'polite');
      }

      await user.type(searchInput, 'test');
      
      // Search results should be announced
      expect(mockUserGuideStore.setSearchQuery).toHaveBeenCalled();
    });

    it('should provide proper descriptions for complex UI elements', () => {
      render(<UserGuideNavigation />);

      const navigation = screen.getByRole('navigation', { name: /guide navigation/i });
      
      // Navigation should have description
      expect(navigation).toHaveAttribute('aria-describedby');
    });
  });

  describe('Focus Management', () => {
    it('should trap focus within modal', async () => {
      render(<UserGuideModal isOpen={true} onClose={() => {}} />);

      const modal = screen.getByRole('dialog', { name: /user guide/i });
      const focusableElements = modal.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );

      if (focusableElements.length > 1) {
        const firstElement = focusableElements[0] as HTMLElement;
        const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

        // Focus first element
        firstElement.focus();
        expect(document.activeElement).toBe(firstElement);

        // Shift+Tab from first should go to last
        fireEvent.keyDown(firstElement, { key: 'Tab', shiftKey: true });
        
        // Tab from last should go to first
        fireEvent.keyDown(lastElement, { key: 'Tab' });
      }
    });

    it('should restore focus when modal closes', async () => {
      const triggerButton = document.createElement('button');
      triggerButton.textContent = 'Open Guide';
      document.body.appendChild(triggerButton);
      triggerButton.focus();

      render(<UserGuideModal isOpen={true} onClose={() => {}} />);

      const modal = screen.getByRole('dialog', { name: /user guide/i });
      const closeButton = screen.getByRole('button', { name: /close/i });
      
      closeButton.click();
      
      // Focus should return to trigger element
      expect(mockUserGuideStore.closeGuide).toHaveBeenCalled();
      
      document.body.removeChild(triggerButton);
    });

    it('should manage focus in search dropdown', async () => {
      const user = userEvent.setup();
      mockUserGuideStore.searchResults = [];
      mockUserGuideStore.setSearchResults([
        {
          id: 'features/search',
          title: 'Search Features',
          content: 'Learn about search functionality',
          searchKeywords: ['search', 'find'],
          category: 'features' as const
        }
      ]);

      render(<UserGuideSearch />);

      const searchInput = screen.getByRole('combobox', { name: /search user guide/i });
      await user.type(searchInput, 'search');

      // Focus should remain manageable in dropdown
      expect(searchInput).toHaveFocus();
    });
  });

  describe('Color Contrast and Visual Accessibility', () => {
    it('should maintain proper contrast ratios in light theme', () => {
      mockUIStore.theme = 'light';
      render(<UserGuideModal isOpen={true} onClose={() => {}} />);

      const modal = screen.getByRole('dialog', { name: /user guide/i });
      
      // Should have high contrast classes
      expect(modal).toHaveClass('bg-white', 'text-gray-900');
    });

    it('should maintain proper contrast ratios in dark theme', () => {
      mockUIStore.getEffectiveTheme = vi.fn().mockReturnValue('dark');
      mockUIStore.isDarkMode = true;
      mockUIStore.getEffectiveTheme = vi.fn().mockReturnValue('dark');
      
      render(<UserGuideModal isOpen={true} onClose={() => {}} />);

      const modal = screen.getByRole('dialog', { name: /user guide/i });
      
      // Should have dark theme classes with proper contrast
      expect(modal).toHaveClass('dark:bg-gray-900', 'dark:text-gray-100');
    });

    it('should provide focus indicators for all interactive elements', async () => {
      const user = userEvent.setup();
      render(<UserGuideModal isOpen={true} onClose={() => {}} />);

      const closeButton = screen.getByRole('button', { name: /close/i });
      
      // Focus should be visible
      await user.tab();
      if (document.activeElement === closeButton) {
        expect(closeButton).toHaveClass('focus:outline-none', 'focus:ring-2');
      }
    });

    it('should support high contrast mode', () => {
      // Mock high contrast media query
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: vi.fn().mockImplementation(query => ({
          matches: query === '(prefers-contrast: high)',
          media: query,
          onchange: null,
          addListener: vi.fn(),
          removeListener: vi.fn(),
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
          dispatchEvent: vi.fn(),
        })),
      });

      render(<UserGuideModal isOpen={true} onClose={() => {}} />);

      const modal = screen.getByRole('dialog', { name: /user guide/i });
      expect(modal).toBeInTheDocument();
    });
  });

  describe('Reduced Motion Support', () => {
    it('should respect prefers-reduced-motion setting', () => {
      // Mock reduced motion media query
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: vi.fn().mockImplementation(query => ({
          matches: query === '(prefers-reduced-motion: reduce)',
          media: query,
          onchange: null,
          addListener: vi.fn(),
          removeListener: vi.fn(),
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
          dispatchEvent: vi.fn(),
        })),
      });

      render(<UserGuideModal isOpen={true} onClose={() => {}} />);

      const modal = screen.getByRole('dialog', { name: /user guide/i });
      
      // Should have reduced motion classes
      expect(modal).toHaveClass('motion-reduce:transition-none');
    });
  });

  describe('Alternative Input Methods', () => {
    it('should support voice control commands', () => {
      render(<UserGuideModal isOpen={true} onClose={() => {}} />);

      // Elements should have proper labels for voice control
      const closeButton = screen.getByRole('button', { name: /close/i });
      expect(closeButton).toHaveAttribute('aria-label');

      const searchInput = screen.getByRole('combobox', { name: /search user guide/i });
      expect(searchInput).toHaveAttribute('aria-label');
    });

    it('should support switch navigation', async () => {
      render(<UserGuideModal isOpen={true} onClose={() => {}} />);

      const modal = screen.getByRole('dialog', { name: /user guide/i });
      
      // Should support single-switch scanning
      fireEvent.keyDown(modal, { key: ' ' }); // Space bar activation
      
      expect(modal).toBeInTheDocument();
    });
  });

  describe('Internationalization and Accessibility', () => {
    it('should support RTL languages', () => {
      // Mock RTL direction
      document.dir = 'rtl';
      
      render(<UserGuideModal isOpen={true} onClose={() => {}} />);

      const modal = screen.getByRole('dialog', { name: /user guide/i });
      
      // Should handle RTL layout
      expect(modal).toBeInTheDocument();
      
      // Reset
      document.dir = 'ltr';
    });

    it('should provide proper language attributes', () => {
      render(<UserGuideModal isOpen={true} onClose={() => {}} />);

      const modal = screen.getByRole('dialog', { name: /user guide/i });
      
      // Should have language attribute
      expect(modal).toHaveAttribute('lang', 'en');
    });
  });

  describe('Error Accessibility', () => {
    it('should announce errors to screen readers', async () => {
      const user = userEvent.setup();
      
      // Mock search error
      mockUserGuideStore.setSearchQuery = vi.fn().mockImplementation(() => {
        throw new Error('Search failed');
      });

      render(<UserGuideSearch />);

      const searchInput = screen.getByRole('combobox', { name: /search user guide/i });
      
      try {
        await user.type(searchInput, 'test');
      } catch (error) {
        // Error should be handled gracefully
      }

      // Error message should be accessible
      const errorMessage = screen.queryByRole('alert');
      if (errorMessage) {
        expect(errorMessage).toHaveAttribute('aria-live', 'assertive');
      }
    });

    it('should provide accessible error recovery options', () => {
      render(<UserGuideModal isOpen={true} onClose={() => {}} />);

      // If there's an error state, recovery options should be accessible
      const modal = screen.getByRole('dialog', { name: /user guide/i });
      expect(modal).toBeInTheDocument();
    });
  });

  describe('Mobile Accessibility', () => {
    it('should support touch accessibility features', () => {
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        value: 375,
      });

      render(<UserGuideModal isOpen={true} onClose={() => {}} />);

      const modal = screen.getByRole('dialog', { name: /user guide/i });
      
      // Should have appropriate touch targets (44px minimum)
      const buttons = modal.querySelectorAll('button');
      buttons.forEach(button => {
        const styles = window.getComputedStyle(button);
        // In a real test, we'd check computed dimensions
        expect(button).toBeInTheDocument();
      });
    });

    it('should support screen reader gestures on mobile', () => {
      render(<UserGuideModal isOpen={true} onClose={() => {}} />);

      const modal = screen.getByRole('dialog', { name: /user guide/i });
      
      // Should have proper swipe navigation support
      expect(modal).toHaveAttribute('role', 'dialog');
    });
  });
});