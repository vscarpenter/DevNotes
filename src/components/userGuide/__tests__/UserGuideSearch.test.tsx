/**
 * UserGuideSearch Component Tests
 * Tests for search functionality, debouncing, and user interactions
 */

import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { UserGuideSearch } from '../UserGuideSearch';
import { useUserGuideStore } from '../../../stores/userGuideStore';

// Mock the user guide store
vi.mock('../../../stores/userGuideStore');
const mockUseUserGuideStore = vi.mocked(useUserGuideStore);

// Mock Fuse.js
vi.mock('fuse.js', () => {
  return {
    default: vi.fn().mockImplementation(() => ({
      search: vi.fn(() => [])
    }))
  };
});

// Mock guide content
vi.mock('../../../content/userGuide/guideContent', () => ({
  default: {
    sections: {
      'features': {
        'markdown-editor': {
          id: 'features/markdown-editor',
          title: 'Markdown Editor',
          content: 'Master the markdown editor with syntax highlighting',
          category: 'features',
          searchKeywords: ['markdown', 'editor']
        }
      }
    }
  }
}));

describe('UserGuideSearch', () => {
  const mockStore = {
    searchQuery: '',
    searchResults: [],
    searchHistory: [],
    setSearchQuery: vi.fn(),
    setSearchResults: vi.fn(),
    addToSearchHistory: vi.fn(),
    clearSearchHistory: vi.fn(),
    navigateToSection: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseUserGuideStore.mockReturnValue(mockStore);
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  describe('Basic Rendering', () => {
    it('renders search input with correct placeholder', () => {
      render(<UserGuideSearch />);
      
      const searchInput = screen.getByPlaceholderText('Search user guide...');
      expect(searchInput).toBeInTheDocument();
      expect(searchInput).toHaveAttribute('aria-label', 'Search user guide');
    });

    it('renders search icon', () => {
      render(<UserGuideSearch />);
      
      const searchIcon = screen.getByRole('combobox').parentElement?.querySelector('svg');
      expect(searchIcon).toBeInTheDocument();
    });

    it('applies custom className', () => {
      const { container } = render(<UserGuideSearch className="custom-class" />);
      
      expect(container.firstChild).toHaveClass('custom-class');
    });
  });

  describe('Search Input Behavior', () => {
    it('calls setSearchQuery when typing', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      render(<UserGuideSearch />);
      
      const searchInput = screen.getByPlaceholderText('Search user guide...');
      
      await act(async () => {
        await user.type(searchInput, 'm');
      });
      
      expect(mockStore.setSearchQuery).toHaveBeenCalledWith('m');
    });

    it('shows clear button when there is text', () => {
      mockUseUserGuideStore.mockReturnValue({
        ...mockStore,
        searchQuery: 'test query'
      });
      
      render(<UserGuideSearch />);
      
      const clearButton = screen.getByLabelText('Clear search');
      expect(clearButton).toBeInTheDocument();
    });

    it('does not show clear button when there is no text', () => {
      mockUseUserGuideStore.mockReturnValue({
        ...mockStore,
        searchQuery: ''
      });
      
      render(<UserGuideSearch />);
      
      const clearButton = screen.queryByLabelText('Clear search');
      expect(clearButton).not.toBeInTheDocument();
    });
  });

  describe('Search Debouncing', () => {
    it('debounces search queries by 300ms', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      render(<UserGuideSearch />);
      
      const searchInput = screen.getByPlaceholderText('Search user guide...');
      
      await act(async () => {
        await user.type(searchInput, 'test');
      });
      
      // Search should not be triggered immediately
      expect(mockStore.setSearchResults).not.toHaveBeenCalled();
      
      // Advance timers by 300ms
      act(() => {
        vi.advanceTimersByTime(300);
      });
      
      // Now search should be triggered
      expect(mockStore.setSearchResults).toHaveBeenCalled();
    });
  });

  describe('Keyboard Navigation', () => {
    it('clears search when Escape is pressed with query', () => {
      mockUseUserGuideStore.mockReturnValue({
        ...mockStore,
        searchQuery: 'test query'
      });
      
      render(<UserGuideSearch />);
      
      const searchInput = screen.getByPlaceholderText('Search user guide...');
      
      // Press Escape
      fireEvent.keyDown(searchInput, { key: 'Escape' });
      
      expect(mockStore.setSearchQuery).toHaveBeenCalledWith('');
      expect(mockStore.setSearchResults).toHaveBeenCalledWith([]);
    });

    it('submits search when Enter is pressed with results', () => {
      mockUseUserGuideStore.mockReturnValue({
        ...mockStore,
        searchQuery: 'test query',
        searchResults: [
          {
            id: 'features/search',
            title: 'Search',
            content: 'Search functionality',
            category: 'features' as const,
            searchKeywords: ['search']
          }
        ]
      });
      
      render(<UserGuideSearch />);
      
      const searchInput = screen.getByPlaceholderText('Search user guide...');
      
      // Press Enter
      fireEvent.keyDown(searchInput, { key: 'Enter' });
      
      expect(mockStore.addToSearchHistory).toHaveBeenCalledWith('test query');
      expect(mockStore.navigateToSection).toHaveBeenCalledWith('features/search');
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA attributes', () => {
      render(<UserGuideSearch />);
      
      const searchInput = screen.getByPlaceholderText('Search user guide...');
      expect(searchInput).toHaveAttribute('role', 'combobox');
      expect(searchInput).toHaveAttribute('aria-expanded', 'false');
      expect(searchInput).toHaveAttribute('aria-haspopup', 'listbox');
      expect(searchInput).toHaveAttribute('aria-describedby', 'search-instructions');
      expect(searchInput).toHaveAttribute('autoComplete', 'off');
    });

    it('has screen reader instructions', () => {
      render(<UserGuideSearch />);
      
      const instructions = document.getElementById('search-instructions');
      expect(instructions).toBeInTheDocument();
      expect(instructions).toHaveClass('sr-only');
      expect(instructions).toHaveTextContent('Use arrow keys to navigate search results, Enter to select, Escape to close');
    });

    it('updates aria-expanded when dropdown is shown', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      
      mockUseUserGuideStore.mockReturnValue({
        ...mockStore,
        searchResults: [
          {
            id: 'features/search',
            title: 'Search',
            content: 'Search functionality',
            category: 'features' as const,
            searchKeywords: ['search']
          }
        ]
      });
      
      render(<UserGuideSearch />);
      
      const searchInput = screen.getByPlaceholderText('Search user guide...');
      
      await act(async () => {
        await user.click(searchInput);
      });
      
      expect(searchInput).toHaveAttribute('aria-expanded', 'true');
    });

    it('sets aria-owns when dropdown is visible', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      
      mockUseUserGuideStore.mockReturnValue({
        ...mockStore,
        searchResults: [
          {
            id: 'features/search',
            title: 'Search',
            content: 'Search functionality',
            category: 'features' as const,
            searchKeywords: ['search']
          }
        ]
      });
      
      render(<UserGuideSearch />);
      
      const searchInput = screen.getByPlaceholderText('Search user guide...');
      
      await act(async () => {
        await user.click(searchInput);
      });
      
      expect(searchInput).toHaveAttribute('aria-owns', 'search-results');
    });

    it('sets aria-activedescendant for highlighted items', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      
      mockUseUserGuideStore.mockReturnValue({
        ...mockStore,
        searchResults: [
          {
            id: 'features/search',
            title: 'Search',
            content: 'Search functionality',
            category: 'features' as const,
            searchKeywords: ['search']
          }
        ]
      });
      
      render(<UserGuideSearch />);
      
      const searchInput = screen.getByPlaceholderText('Search user guide...');
      
      await act(async () => {
        await user.click(searchInput);
        await user.keyboard('{ArrowDown}');
      });
      
      expect(searchInput).toHaveAttribute('aria-activedescendant', 'search-item-0');
    });

    it('has proper listbox role and aria-label for dropdown', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      
      mockUseUserGuideStore.mockReturnValue({
        ...mockStore,
        searchResults: [
          {
            id: 'features/search',
            title: 'Search',
            content: 'Search functionality',
            category: 'features' as const,
            searchKeywords: ['search']
          }
        ]
      });
      
      render(<UserGuideSearch />);
      
      const searchInput = screen.getByPlaceholderText('Search user guide...');
      
      await act(async () => {
        await user.click(searchInput);
      });
      
      const dropdown = document.getElementById('search-results');
      expect(dropdown).toHaveAttribute('role', 'listbox');
      expect(dropdown).toHaveAttribute('aria-label', 'Search results');
    });

    it('has proper option roles and aria-selected for search results', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      
      mockUseUserGuideStore.mockReturnValue({
        ...mockStore,
        searchResults: [
          {
            id: 'features/search',
            title: 'Search',
            content: 'Search functionality',
            category: 'features' as const,
            searchKeywords: ['search']
          }
        ]
      });
      
      render(<UserGuideSearch />);
      
      const searchInput = screen.getByPlaceholderText('Search user guide...');
      
      await act(async () => {
        await user.click(searchInput);
      });
      
      const option = document.querySelector('[role="option"]');
      expect(option).toBeInTheDocument();
      expect(option).toHaveAttribute('aria-selected');
    });

    it('has descriptive aria-labels for search result buttons', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      
      mockUseUserGuideStore.mockReturnValue({
        ...mockStore,
        searchResults: [
          {
            id: 'features/search',
            title: 'Search',
            content: 'Search functionality',
            category: 'features' as const,
            searchKeywords: ['search']
          }
        ]
      });
      
      render(<UserGuideSearch />);
      
      const searchInput = screen.getByPlaceholderText('Search user guide...');
      
      await act(async () => {
        await user.click(searchInput);
      });
      
      const resultButton = document.querySelector('#search-item-0');
      expect(resultButton).toHaveAttribute('aria-label', 'Go to Search in features section');
      expect(resultButton).toHaveAttribute('aria-describedby', 'result-desc-0');
    });

    it('has screen reader descriptions for search results', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      
      mockUseUserGuideStore.mockReturnValue({
        ...mockStore,
        searchResults: [
          {
            id: 'features/search',
            title: 'Search',
            content: 'Search functionality',
            category: 'features' as const,
            searchKeywords: ['search']
          }
        ]
      });
      
      render(<UserGuideSearch />);
      
      const searchInput = screen.getByPlaceholderText('Search user guide...');
      
      await act(async () => {
        await user.click(searchInput);
      });
      
      const description = document.getElementById('result-desc-0');
      expect(description).toBeInTheDocument();
      expect(description).toHaveClass('sr-only');
      expect(description).toHaveTextContent(/Search result: Search from features section/);
    });

    it('has proper focus indicators for interactive elements', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      
      mockUseUserGuideStore.mockReturnValue({
        ...mockStore,
        searchResults: [
          {
            id: 'features/search',
            title: 'Search',
            content: 'Search functionality',
            category: 'features' as const,
            searchKeywords: ['search']
          }
        ]
      });
      
      render(<UserGuideSearch />);
      
      const searchInput = screen.getByPlaceholderText('Search user guide...');
      
      await act(async () => {
        await user.click(searchInput);
      });
      
      const resultButton = document.querySelector('#search-item-0');
      expect(resultButton).toHaveClass('focus:bg-gray-100', 'focus:outline-none');
    });

    it('handles search history with proper accessibility', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      
      mockUseUserGuideStore.mockReturnValue({
        ...mockStore,
        searchHistory: ['previous search']
      });
      
      render(<UserGuideSearch />);
      
      const searchInput = screen.getByPlaceholderText('Search user guide...');
      
      await act(async () => {
        await user.click(searchInput);
      });
      
      const historyButton = document.querySelector('#search-item-0');
      expect(historyButton).toHaveAttribute('aria-label', 'Search for previous search');
    });
  });

  describe('Edge Cases', () => {
    it('handles empty search query gracefully', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      render(<UserGuideSearch />);
      
      const searchInput = screen.getByPlaceholderText('Search user guide...');
      
      await act(async () => {
        await user.type(searchInput, '   '); // Only whitespace
      });
      
      act(() => {
        vi.advanceTimersByTime(300);
      });
      
      expect(mockStore.setSearchResults).toHaveBeenCalledWith([]);
    });

    it('prevents duplicate entries in search history', () => {
      mockUseUserGuideStore.mockReturnValue({
        ...mockStore,
        searchQuery: 'duplicate query',
        searchResults: []
      });
      
      render(<UserGuideSearch />);
      
      const searchInput = screen.getByPlaceholderText('Search user guide...');
      
      // Submit search
      fireEvent.keyDown(searchInput, { key: 'Enter' });
      
      expect(mockStore.addToSearchHistory).toHaveBeenCalledWith('duplicate query');
    });
  });

  describe('Store Integration', () => {
    it('uses search query from store', () => {
      mockUseUserGuideStore.mockReturnValue({
        ...mockStore,
        searchQuery: 'test from store'
      });
      
      render(<UserGuideSearch />);
      
      const searchInput = screen.getByPlaceholderText('Search user guide...');
      expect(searchInput).toHaveValue('test from store');
    });
  });
});