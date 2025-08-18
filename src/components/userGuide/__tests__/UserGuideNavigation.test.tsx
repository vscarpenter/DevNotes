/**
 * UserGuideNavigation Component Tests
 * Tests navigation state management, section expansion, and click handlers
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { UserGuideNavigation } from '../UserGuideNavigation';
import { useUserGuideStore } from '../../../stores/userGuideStore';

// Mock the user guide store
vi.mock('../../../stores/userGuideStore');

// Mock the guide content
vi.mock('../../../content/userGuide/guideContent', () => ({
  default: {
    sections: {
      'getting-started': {
        'welcome': {
          id: 'getting-started/welcome',
          title: 'Welcome to DevNotes',
          content: 'Welcome content',
          searchKeywords: ['welcome'],
          category: 'getting-started'
        },
        'first-note': {
          id: 'getting-started/first-note',
          title: 'Creating Your First Note',
          content: 'First note content',
          searchKeywords: ['first note'],
          category: 'getting-started'
        }
      },
      'features': {
        'markdown-editor': {
          id: 'features/markdown-editor',
          title: 'Markdown Editor',
          content: 'Editor content',
          searchKeywords: ['markdown'],
          category: 'features'
        },
        'search': {
          id: 'features/search',
          title: 'Search Functionality',
          content: 'Search content',
          searchKeywords: ['search'],
          category: 'features'
        }
      },
      'advanced': {
        'power-user-tips': {
          id: 'advanced/power-user-tips',
          title: 'Power User Tips',
          content: 'Tips content',
          searchKeywords: ['tips'],
          category: 'advanced'
        }
      },
      'troubleshooting': {
        'common-issues': {
          id: 'troubleshooting/common-issues',
          title: 'Common Issues',
          content: 'Issues content',
          searchKeywords: ['issues'],
          category: 'troubleshooting'
        }
      }
    }
  }
}));

const mockNavigateToSection = vi.fn();
const mockUseUserGuideStore = useUserGuideStore as any;

describe('UserGuideNavigation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    mockUseUserGuideStore.mockReturnValue({
      currentSection: 'getting-started/welcome',
      navigateToSection: mockNavigateToSection,
    });
  });

  describe('Rendering', () => {
    it('renders navigation with all category sections', () => {
      render(<UserGuideNavigation />);
      
      expect(screen.getByText('Getting Started')).toBeInTheDocument();
      expect(screen.getByText('Features')).toBeInTheDocument();
      expect(screen.getByText('Advanced')).toBeInTheDocument();
      expect(screen.getByText('Troubleshooting')).toBeInTheDocument();
    });

    it('renders overall progress indicator', () => {
      render(<UserGuideNavigation />);
      
      expect(screen.getByText('Overall Progress')).toBeInTheDocument();
      expect(screen.getByRole('progressbar', { name: /overall progress/i })).toBeInTheDocument();
    });

    it('renders navigation hints', () => {
      render(<UserGuideNavigation />);
      
      expect(screen.getByText('Click sections to navigate')).toBeInTheDocument();
      expect(screen.getByText('Use ← → keys to navigate')).toBeInTheDocument();
    });

    it('applies custom className when provided', () => {
      const { container } = render(<UserGuideNavigation className="custom-class" />);
      
      expect(container.firstChild).toHaveClass('custom-class');
    });
  });

  describe('Section Expansion', () => {
    it('starts with getting-started section expanded by default', () => {
      render(<UserGuideNavigation />);
      
      // Getting started should be expanded and show subsections
      expect(screen.getByText('Welcome to DevNotes')).toBeInTheDocument();
      expect(screen.getByText('Creating Your First Note')).toBeInTheDocument();
    });

    it('toggles section expansion when category header is clicked', async () => {
      render(<UserGuideNavigation />);
      
      // Features section should be collapsed initially
      expect(screen.queryByText('Markdown Editor')).not.toBeInTheDocument();
      
      // Click on Features header to expand
      const featuresHeader = screen.getByRole('button', { name: /features/i });
      fireEvent.click(featuresHeader);
      
      // Features subsections should now be visible
      await waitFor(() => {
        expect(screen.getByText('Markdown Editor')).toBeInTheDocument();
        expect(screen.getByText('Search Functionality')).toBeInTheDocument();
      });
    });

    it('collapses expanded section when header is clicked again', async () => {
      render(<UserGuideNavigation />);
      
      // Getting started is expanded by default
      expect(screen.getByText('Welcome to DevNotes')).toBeInTheDocument();
      
      // Click on Getting Started header to collapse
      const gettingStartedHeader = screen.getAllByRole('button', { name: /getting started/i })[0];
      fireEvent.click(gettingStartedHeader);
      
      // Subsections should be hidden
      await waitFor(() => {
        expect(screen.queryByText('Welcome to DevNotes')).not.toBeInTheDocument();
      });
    });

    it('updates aria-expanded attribute correctly', () => {
      render(<UserGuideNavigation />);
      
      const gettingStartedHeader = screen.getAllByRole('button', { name: /getting started/i })[0];
      const featuresHeader = screen.getAllByRole('button', { name: /features/i })[0];
      
      // Getting started should be expanded, features collapsed
      expect(gettingStartedHeader).toHaveAttribute('aria-expanded', 'true');
      expect(featuresHeader).toHaveAttribute('aria-expanded', 'false');
    });
  });

  describe('Active Section Highlighting', () => {
    it('highlights the current section', () => {
      render(<UserGuideNavigation />);
      
      const welcomeSection = screen.getByRole('button', { name: /welcome to devnotes/i });
      expect(welcomeSection).toHaveAttribute('aria-current', 'page');
      expect(welcomeSection).toHaveClass('border-blue-600');
    });

    it('highlights the category containing the current section', () => {
      render(<UserGuideNavigation />);
      
      const gettingStartedHeader = screen.getAllByRole('button', { name: /getting started/i })[0];
      expect(gettingStartedHeader).toHaveClass('bg-blue-50');
    });

    it('updates highlighting when current section changes', () => {
      const { rerender } = render(<UserGuideNavigation />);
      
      // Initially welcome is active
      let welcomeSection = screen.getByRole('button', { name: /welcome to devnotes/i });
      expect(welcomeSection).toHaveAttribute('aria-current', 'page');
      
      // Change current section to first-note
      mockUseUserGuideStore.mockReturnValue({
        currentSection: 'getting-started/first-note',
        navigateToSection: mockNavigateToSection,
      });
      
      rerender(<UserGuideNavigation />);
      
      // Now first-note should be active
      const firstNoteSection = screen.getByRole('button', { name: /creating your first note/i });
      expect(firstNoteSection).toHaveAttribute('aria-current', 'page');
      
      // Welcome should no longer be active
      welcomeSection = screen.getByRole('button', { name: /welcome to devnotes/i });
      expect(welcomeSection).not.toHaveAttribute('aria-current', 'page');
    });
  });

  describe('Progress Indicators', () => {
    it('calculates and displays overall progress correctly', () => {
      // Mock being on the 2nd section out of 6 total sections (33%)
      mockUseUserGuideStore.mockReturnValue({
        currentSection: 'getting-started/first-note',
        navigateToSection: mockNavigateToSection,
      });
      
      render(<UserGuideNavigation />);
      
      const progressText = screen.getByText('33%');
      expect(progressText).toBeInTheDocument();
      
      const progressBar = screen.getByRole('progressbar', { name: /overall progress/i });
      expect(progressBar).toHaveAttribute('aria-valuenow', '33');
    });

    it('shows category progress for active category', () => {
      // Mock being on the 2nd section of getting-started (2 out of 2 = 100%)
      mockUseUserGuideStore.mockReturnValue({
        currentSection: 'getting-started/first-note',
        navigateToSection: mockNavigateToSection,
      });
      
      render(<UserGuideNavigation />);
      
      // Should show 100% for getting-started category
      expect(screen.getByText('100%')).toBeInTheDocument();
    });

    it('does not show category progress for inactive categories', () => {
      render(<UserGuideNavigation />);
      
      // Expand features section
      const featuresHeader = screen.getByRole('button', { name: /features/i });
      fireEvent.click(featuresHeader);
      
      // Features category should not show progress since it's not active
      const progressElements = screen.getAllByText(/\d+%/);
      // Should only have overall progress, not category progress for features
      expect(progressElements).toHaveLength(2); // Overall + getting-started category
    });
  });

  describe('Navigation Interactions', () => {
    it('calls navigateToSection when a section is clicked', () => {
      render(<UserGuideNavigation />);
      
      const welcomeSection = screen.getByRole('button', { name: /welcome to devnotes/i });
      fireEvent.click(welcomeSection);
      
      expect(mockNavigateToSection).toHaveBeenCalledWith('getting-started/welcome');
    });

    it('calls navigateToSection with correct section ID for different sections', async () => {
      render(<UserGuideNavigation />);
      
      // Expand features section first
      const featuresHeader = screen.getByRole('button', { name: /features/i });
      fireEvent.click(featuresHeader);
      
      await waitFor(() => {
        const markdownSection = screen.getByRole('button', { name: /markdown editor/i });
        fireEvent.click(markdownSection);
        
        expect(mockNavigateToSection).toHaveBeenCalledWith('features/markdown-editor');
      });
    });

    it('handles multiple section clicks correctly', () => {
      render(<UserGuideNavigation />);
      
      const welcomeSection = screen.getByRole('button', { name: /welcome to devnotes/i });
      const firstNoteSection = screen.getByRole('button', { name: /creating your first note/i });
      
      fireEvent.click(welcomeSection);
      fireEvent.click(firstNoteSection);
      
      expect(mockNavigateToSection).toHaveBeenCalledTimes(2);
      expect(mockNavigateToSection).toHaveBeenNthCalledWith(1, 'getting-started/welcome');
      expect(mockNavigateToSection).toHaveBeenNthCalledWith(2, 'getting-started/first-note');
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA labels and roles', () => {
      render(<UserGuideNavigation />);
      
      const nav = screen.getByRole('navigation');
      expect(nav).toHaveAttribute('aria-label', 'User guide navigation');
      
      const progressBar = screen.getByRole('progressbar', { name: /overall progress/i });
      expect(progressBar).toHaveAttribute('aria-label', 'Overall progress: 17%');
    });

    it('has proper aria-controls for expandable sections', () => {
      render(<UserGuideNavigation />);
      
      const gettingStartedHeader = screen.getAllByRole('button', { name: /getting started/i })[0];
      expect(gettingStartedHeader).toHaveAttribute('aria-controls', 'category-getting-started');
    });

    it('marks current section with aria-current', () => {
      render(<UserGuideNavigation />);
      
      const welcomeSection = screen.getByRole('button', { name: /welcome to devnotes/i });
      expect(welcomeSection).toHaveAttribute('aria-current', 'page');
    });

    it('has proper focus indicators', () => {
      render(<UserGuideNavigation />);
      
      const categoryButtons = document.querySelectorAll('[data-category-button]');
      const sectionButtons = document.querySelectorAll('[data-section-button]');
      
      categoryButtons.forEach(button => {
        expect(button).toHaveClass('focus:ring-2', 'focus:ring-blue-500');
      });
      
      sectionButtons.forEach(button => {
        expect(button).toHaveClass('focus:ring-2', 'focus:ring-blue-500');
      });
    });

    it('provides descriptive aria-describedby for sections', () => {
      render(<UserGuideNavigation />);
      
      const welcomeSection = screen.getByRole('button', { name: /welcome to devnotes/i });
      expect(welcomeSection).toHaveAttribute('aria-describedby');
      
      const describedById = welcomeSection.getAttribute('aria-describedby');
      const descriptionElement = document.getElementById(describedById!);
      expect(descriptionElement).toBeInTheDocument();
      expect(descriptionElement).toHaveTextContent('Welcome to DevNotes in Getting Started section');
    });

    it('has proper progress bar accessibility', () => {
      mockUseUserGuideStore.mockReturnValue({
        currentSection: 'getting-started/first-note',
        navigateToSection: mockNavigateToSection,
      });
      
      render(<UserGuideNavigation />);
      
      const categoryProgress = document.querySelector('[id^="progress-"]');
      expect(categoryProgress).toHaveAttribute('role', 'progressbar');
      expect(categoryProgress).toHaveAttribute('aria-valuenow');
      expect(categoryProgress).toHaveAttribute('aria-valuemin', '0');
      expect(categoryProgress).toHaveAttribute('aria-valuemax', '100');
      expect(categoryProgress).toHaveAttribute('aria-label');
    });

    it('supports keyboard navigation with Enter and Space', () => {
      render(<UserGuideNavigation />);
      
      const welcomeSection = screen.getByRole('button', { name: /welcome to devnotes/i });
      
      // Test Enter key
      fireEvent.keyDown(welcomeSection, { key: 'Enter' });
      expect(mockNavigateToSection).toHaveBeenCalledWith('getting-started/welcome');
      
      // Test Space key
      fireEvent.keyDown(welcomeSection, { key: ' ' });
      expect(mockNavigateToSection).toHaveBeenCalledWith('getting-started/welcome');
    });

    it('supports keyboard navigation with arrow keys for categories', () => {
      render(<UserGuideNavigation />);
      
      const featuresHeader = screen.getByRole('button', { name: /features/i });
      
      // Test Right arrow to expand
      fireEvent.keyDown(featuresHeader, { key: 'ArrowRight' });
      expect(featuresHeader).toHaveAttribute('aria-expanded', 'true');
      
      // Test Left arrow to collapse
      fireEvent.keyDown(featuresHeader, { key: 'ArrowLeft' });
      expect(featuresHeader).toHaveAttribute('aria-expanded', 'false');
    });

    it('supports Home and End key navigation', () => {
      render(<UserGuideNavigation />);
      
      const firstButton = document.querySelector('[data-category-button]') as HTMLElement;
      const focusSpy = vi.spyOn(firstButton, 'focus');
      
      // Test Home key on a specific element that has the keyboard handler
      const welcomeSection = screen.getByRole('button', { name: /welcome to devnotes/i });
      fireEvent.keyDown(welcomeSection, { key: 'Home' });
      expect(focusSpy).toHaveBeenCalled();
    });

    it('has screen reader only descriptions', () => {
      render(<UserGuideNavigation />);
      
      const srOnlyElements = document.querySelectorAll('.sr-only');
      expect(srOnlyElements.length).toBeGreaterThan(0);
      
      // Check that section descriptions exist
      const sectionDesc = document.querySelector('[id^="section-desc-"]');
      expect(sectionDesc).toBeInTheDocument();
      expect(sectionDesc).toHaveClass('sr-only');
    });
  });

  describe('Edge Cases', () => {
    it('handles empty or missing sections gracefully', () => {
      // Mock empty guide content
      vi.doMock('../../../content/userGuide/guideContent', () => ({
        default: { sections: {} }
      }));
      
      expect(() => render(<UserGuideNavigation />)).not.toThrow();
    });

    it('handles invalid current section gracefully', () => {
      mockUseUserGuideStore.mockReturnValue({
        currentSection: 'invalid/section',
        navigateToSection: mockNavigateToSection,
      });
      
      render(<UserGuideNavigation />);
      
      // Should still render without errors
      expect(screen.getByText('Getting Started')).toBeInTheDocument();
      
      // Progress should be 0% for invalid section
      expect(screen.getByText('0%')).toBeInTheDocument();
    });
  });
});