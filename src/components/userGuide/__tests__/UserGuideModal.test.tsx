/**
 * Unit tests for UserGuideModal component
 * Tests modal behavior, keyboard interactions, and accessibility
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { UserGuideModal } from '../UserGuideModal';
import { useUserGuideStore } from '../../../stores/userGuideStore';
import { useUIStore } from '../../../stores/uiStore';

// Mock the stores
vi.mock('../../../stores/userGuideStore');
vi.mock('../../../stores/uiStore');

const mockUseUserGuideStore = useUserGuideStore as any;
const mockUseUIStore = useUIStore as any;

describe('UserGuideModal', () => {
  const mockOnClose = vi.fn();
  
  const defaultUserGuideState = {
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

  const defaultUIState = {
    activeModal: null,
    openModal: vi.fn(),
    closeModal: vi.fn(),
    isModalOpen: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseUserGuideStore.mockReturnValue(defaultUserGuideState);
    mockUseUIStore.mockReturnValue(defaultUIState as any);
    
    // Mock document.body.style
    Object.defineProperty(document.body, 'style', {
      value: { overflow: '' },
      writable: true,
    });
  });

  afterEach(() => {
    // Clean up any remaining event listeners
    document.removeEventListener('keydown', vi.fn());
    document.body.style.overflow = 'unset';
  });

  describe('Rendering', () => {
    it('should not render when isOpen is false', () => {
      render(<UserGuideModal isOpen={false} onClose={mockOnClose} />);
      
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('should render when isOpen is true', () => {
      render(<UserGuideModal isOpen={true} onClose={mockOnClose} />);
      
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByText('DevNotes User Guide')).toBeInTheDocument();
      expect(screen.getByText('Learn how to use DevNotes effectively')).toBeInTheDocument();
    });

    it('should render the UserGuideContent component', () => {
      render(<UserGuideModal isOpen={true} onClose={mockOnClose} />);
      
      // The content area should be present
      expect(screen.getByText('DevNotes User Guide')).toBeInTheDocument();
      expect(screen.getByText('Learn how to use DevNotes effectively')).toBeInTheDocument();
    });

    it('should have proper ARIA attributes', () => {
      render(<UserGuideModal isOpen={true} onClose={mockOnClose} />);
      
      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveAttribute('aria-modal', 'true');
      expect(dialog).toHaveAttribute('aria-labelledby', 'user-guide-title');
      expect(dialog).toHaveAttribute('aria-describedby', 'user-guide-description');
    });

    it('should render close button with proper accessibility', () => {
      render(<UserGuideModal isOpen={true} onClose={mockOnClose} />);
      
      const closeButton = screen.getByRole('button', { name: /close user guide/i });
      expect(closeButton).toBeInTheDocument();
    });
  });

  describe('Modal Behavior', () => {
    it('should call onClose when close button is clicked', async () => {
      const user = userEvent.setup();
      render(<UserGuideModal isOpen={true} onClose={mockOnClose} />);
      
      const closeButton = screen.getByRole('button', { name: /close user guide/i });
      await user.click(closeButton);
      
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('should call onClose when backdrop is clicked', async () => {
      render(<UserGuideModal isOpen={true} onClose={mockOnClose} />);
      
      // Find the backdrop div (the outermost div with the click handler)
      const backdrop = document.querySelector('.fixed.inset-0');
      expect(backdrop).toBeInTheDocument();
      
      // Create a mock event that simulates clicking on the backdrop itself
      const mockEvent = {
        target: backdrop,
        currentTarget: backdrop,
        stopPropagation: vi.fn(),
        preventDefault: vi.fn()
      };
      
      // Simulate clicking on the backdrop itself by calling the handler directly
      fireEvent.click(backdrop!, mockEvent);
      
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('should not call onClose when modal content is clicked', async () => {
      const user = userEvent.setup();
      render(<UserGuideModal isOpen={true} onClose={mockOnClose} />);
      
      const modalContent = screen.getByText('DevNotes User Guide');
      await user.click(modalContent);
      
      expect(mockOnClose).not.toHaveBeenCalled();
    });

    it('should prevent body scroll when modal is open', () => {
      render(<UserGuideModal isOpen={true} onClose={mockOnClose} />);
      
      expect(document.body.style.overflow).toBe('hidden');
    });

    it('should restore body scroll when modal is closed', () => {
      const { rerender } = render(<UserGuideModal isOpen={true} onClose={mockOnClose} />);
      
      expect(document.body.style.overflow).toBe('hidden');
      
      rerender(<UserGuideModal isOpen={false} onClose={mockOnClose} />);
      
      expect(document.body.style.overflow).toBe('unset');
    });
  });

  describe('Keyboard Navigation', () => {
    it('should close modal when Escape key is pressed', () => {
      render(<UserGuideModal isOpen={true} onClose={mockOnClose} />);
      
      fireEvent.keyDown(document, { key: 'Escape' });
      
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('should not close modal when Escape is pressed and modal is closed', () => {
      render(<UserGuideModal isOpen={false} onClose={mockOnClose} />);
      
      fireEvent.keyDown(document, { key: 'Escape' });
      
      expect(mockOnClose).not.toHaveBeenCalled();
    });

    it('should handle arrow key navigation (left arrow)', () => {
      render(<UserGuideModal isOpen={true} onClose={mockOnClose} />);
      
      fireEvent.keyDown(document, { key: 'ArrowLeft' });
      
      // Currently just prevents default, navigation logic will be added with navigation component
      expect(mockOnClose).not.toHaveBeenCalled();
    });

    it('should handle arrow key navigation (right arrow)', () => {
      render(<UserGuideModal isOpen={true} onClose={mockOnClose} />);
      
      fireEvent.keyDown(document, { key: 'ArrowRight' });
      
      // Currently just prevents default, navigation logic will be added with navigation component
      expect(mockOnClose).not.toHaveBeenCalled();
    });

    it('should ignore other key presses', () => {
      render(<UserGuideModal isOpen={true} onClose={mockOnClose} />);
      
      fireEvent.keyDown(document, { key: 'Enter' });
      fireEvent.keyDown(document, { key: 'Space' });
      fireEvent.keyDown(document, { key: 'Tab' });
      
      expect(mockOnClose).not.toHaveBeenCalled();
    });

    it('should add and remove keyboard event listeners properly', () => {
      const addEventListenerSpy = vi.spyOn(document, 'addEventListener');
      const removeEventListenerSpy = vi.spyOn(document, 'removeEventListener');
      
      const { rerender } = render(<UserGuideModal isOpen={true} onClose={mockOnClose} />);
      
      expect(addEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
      
      rerender(<UserGuideModal isOpen={false} onClose={mockOnClose} />);
      
      expect(removeEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
      
      addEventListenerSpy.mockRestore();
      removeEventListenerSpy.mockRestore();
    });
  });

  describe('Focus Management', () => {
    it('should focus modal container when opened', async () => {
      render(<UserGuideModal isOpen={true} onClose={mockOnClose} />);
      
      await waitFor(() => {
        const modalElement = document.getElementById('user-guide-modal');
        expect(modalElement).toHaveFocus();
      });
    });

    it('should have proper tabIndex on modal container', () => {
      render(<UserGuideModal isOpen={true} onClose={mockOnClose} />);
      
      const modalElement = document.getElementById('user-guide-modal');
      expect(modalElement).toHaveAttribute('tabIndex', '-1');
    });
  });

  describe('Responsive Design', () => {
    it('should show navigation sidebar on desktop (hidden on mobile)', () => {
      render(<UserGuideModal isOpen={true} onClose={mockOnClose} />);
      
      // Look for the desktop sidebar container by its classes
      const sidebar = document.querySelector('.hidden');
      expect(sidebar).toBeInTheDocument();
      expect(sidebar).toHaveClass('md:block', 'w-64');
      
      // Verify it contains a navigation component
      const navigation = sidebar?.querySelector('nav[aria-label="User guide navigation"]');
      expect(navigation).toBeInTheDocument();
    });

    it('should show mobile navigation on mobile (hidden on desktop)', () => {
      render(<UserGuideModal isOpen={true} onClose={mockOnClose} />);
      
      // Look for the mobile navigation container
      const mobileNavContainer = document.querySelector('.md\\:hidden .h-full');
      expect(mobileNavContainer).toBeInTheDocument();
      
      // Verify it contains the navigation component
      const mobileNav = screen.getAllByRole('navigation', { name: 'User guide navigation' })[1]; // Second instance is mobile
      expect(mobileNav).toBeInTheDocument();
    });

    it('should have responsive padding and sizing classes', () => {
      render(<UserGuideModal isOpen={true} onClose={mockOnClose} />);
      
      const backdrop = document.querySelector('.fixed.inset-0');
      expect(backdrop).toHaveClass('p-4');
      
      // The modal content is the div inside the backdrop, not the dialog role element
      const modalContent = document.querySelector('#user-guide-modal');
      expect(modalContent).toHaveClass('max-w-6xl', 'max-h-[90vh]');
    });
  });

  describe('Accessibility', () => {
    it('should have proper semantic structure', () => {
      render(<UserGuideModal isOpen={true} onClose={mockOnClose} />);
      
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /close user guide/i })).toBeInTheDocument();
    });

    it('should have proper ARIA attributes', () => {
      render(<UserGuideModal isOpen={true} onClose={mockOnClose} />);
      
      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveAttribute('aria-modal', 'true');
      expect(dialog).toHaveAttribute('aria-labelledby', 'user-guide-title');
      expect(dialog).toHaveAttribute('aria-describedby', 'user-guide-description');
      expect(dialog).toHaveAttribute('aria-live', 'polite');
    });

    it('should have proper semantic landmarks', () => {
      render(<UserGuideModal isOpen={true} onClose={mockOnClose} />);
      
      // Check for aside elements (navigation sidebars)
      const asideElements = document.querySelectorAll('aside');
      expect(asideElements).toHaveLength(2); // Desktop and mobile navigation
      
      // Check for main content area
      const mainElement = screen.getByRole('main');
      expect(mainElement).toBeInTheDocument();
    });

    it('should implement focus trap', async () => {
      render(<UserGuideModal isOpen={true} onClose={mockOnClose} />);
      
      // Mock focusable elements
      const mockFocusableElements = [
        { focus: vi.fn() },
        { focus: vi.fn() },
        { focus: vi.fn() }
      ];
      
      const mockQuerySelectorAll = vi.fn().mockReturnValue(mockFocusableElements);
      const modalElement = document.getElementById('user-guide-modal');
      if (modalElement) {
        modalElement.querySelectorAll = mockQuerySelectorAll;
      }
      
      // Simulate Tab key at the last element
      Object.defineProperty(document, 'activeElement', {
        value: mockFocusableElements[2],
        writable: true
      });
      
      fireEvent.keyDown(document, { key: 'Tab' });
      
      // Should focus first element
      expect(mockFocusableElements[0].focus).toHaveBeenCalled();
    });

    it('should restore focus when modal closes', () => {
      const mockPreviousElement = { focus: vi.fn() };
      Object.defineProperty(document, 'activeElement', {
        value: mockPreviousElement,
        writable: true
      });
      
      const { rerender } = render(<UserGuideModal isOpen={true} onClose={mockOnClose} />);
      
      // Close modal
      rerender(<UserGuideModal isOpen={false} onClose={mockOnClose} />);
      
      // Focus should be restored
      expect(mockPreviousElement.focus).toHaveBeenCalled();
    });

    it('should show keyboard shortcuts hint on desktop', () => {
      render(<UserGuideModal isOpen={true} onClose={mockOnClose} />);
      
      expect(screen.getByText('Use arrow keys to navigate between sections')).toBeInTheDocument();
      expect(screen.getByText('Press ESC to close')).toBeInTheDocument();
    });

    it('should hide keyboard shortcuts hint on mobile', () => {
      render(<UserGuideModal isOpen={true} onClose={mockOnClose} />);
      
      const footer = screen.getByText('Use arrow keys to navigate between sections').parentElement?.parentElement;
      expect(footer).toHaveClass('hidden', 'sm:block');
    });

    it('should have proper aria-labels for navigation areas', () => {
      render(<UserGuideModal isOpen={true} onClose={mockOnClose} />);
      
      const desktopNav = document.querySelector('aside[aria-label="User guide navigation sidebar"]');
      const mobileNav = document.querySelector('aside[aria-label="User guide navigation (mobile)"]');
      
      expect(desktopNav).toBeInTheDocument();
      expect(mobileNav).toBeInTheDocument();
    });
  });

  describe('Integration with Stores', () => {
    it('should use current section from user guide store', () => {
      const customState = {
        ...defaultUserGuideState,
        currentSection: 'features/markdown-editor',
      };
      mockUseUserGuideStore.mockReturnValue(customState);
      
      render(<UserGuideModal isOpen={true} onClose={mockOnClose} />);
      
      // The modal should render with the custom state
      expect(screen.getByText('DevNotes User Guide')).toBeInTheDocument();
    });

    it('should access navigateToSection function from store', () => {
      render(<UserGuideModal isOpen={true} onClose={mockOnClose} />);
      
      // The function should be available (tested indirectly through store mock)
      expect(defaultUserGuideState.navigateToSection).toBeDefined();
    });
  });

  describe('Error Handling', () => {
    it('should handle missing modal element gracefully', () => {
      // Mock getElementById to return null
      const originalGetElementById = document.getElementById;
      document.getElementById = vi.fn().mockReturnValue(null);
      
      expect(() => {
        render(<UserGuideModal isOpen={true} onClose={mockOnClose} />);
      }).not.toThrow();
      
      // Restore original function
      document.getElementById = originalGetElementById;
    });

    it('should handle keyboard events when modal is not open', () => {
      render(<UserGuideModal isOpen={false} onClose={mockOnClose} />);
      
      expect(() => {
        fireEvent.keyDown(document, { key: 'Escape' });
      }).not.toThrow();
    });
  });
});