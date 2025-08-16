/**
 * SearchInterface component tests
 * Tests search UI interactions and accessibility
 * Requirements: 5.1, 5.2, 5.3, 5.6
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SearchInterface } from '../SearchInterface';
import { useSearchStore } from '../../../stores/searchStore';
import { useNoteStore } from '../../../stores/noteStore';
import { useFolderStore } from '../../../stores/folderStore';
import { vi } from 'vitest';

// Mock the stores
vi.mock('../../../stores/searchStore');
vi.mock('../../../stores/noteStore');
vi.mock('../../../stores/folderStore');

// Mock the child components
vi.mock('../SearchResultItem', () => ({
  SearchResultItem: ({ result, onClick, isSelected, id }: any) => (
    <div
      data-testid={`search-result-${result.noteId}`}
      onClick={onClick}
      className={isSelected ? 'selected' : ''}
      id={id}
    >
      {result.title} - {result.snippet}
    </div>
  )
}));

vi.mock('../SearchFiltersPanel', () => ({
  SearchFiltersPanel: ({ onFiltersChange, onClearFilters }: any) => (
    <div data-testid="search-filters-panel">
      <button onClick={() => onFiltersChange({ folderId: 'test-folder' })}>
        Set Folder Filter
      </button>
      <button onClick={onClearFilters}>Clear Filters</button>
    </div>
  )
}));

vi.mock('../RecentNotesSection', () => ({
  RecentNotesSection: ({ recentNotes, onNoteSelect }: any) => (
    <div data-testid="recent-notes-section">
      {recentNotes.map((noteId: string) => (
        <button key={noteId} onClick={() => onNoteSelect(noteId)}>
          Recent Note {noteId}
        </button>
      ))}
    </div>
  )
}));

const mockSearchStore = {
  query: '',
  results: [],
  filters: {},
  isSearching: false,
  recentQueries: [],
  recentNotes: [],
  error: null,
  search: vi.fn(),
  clearSearch: vi.fn(),
  setFilters: vi.fn(),
  clearFilters: vi.fn(),
  hasResults: vi.fn(() => false),
  hasActiveFilters: vi.fn(() => false),
  getFilteredResults: vi.fn(() => [])
};

const mockNoteStore = {
  selectNote: vi.fn()
};

const mockFolderStore = {
  selectFolder: vi.fn()
};

describe('SearchInterface', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (useSearchStore as any).mockReturnValue(mockSearchStore);
    (useNoteStore as any).mockReturnValue(mockNoteStore);
    (useFolderStore as any).mockReturnValue(mockFolderStore);
  });

  describe('Basic Rendering', () => {
    it('renders search input with correct attributes', () => {
      render(<SearchInterface />);
      
      const searchInput = screen.getByRole('combobox', { name: /search notes/i });
      expect(searchInput).toBeInTheDocument();
      expect(searchInput).toHaveAttribute('placeholder', 'Search notes...');
      expect(searchInput).toHaveAttribute('aria-expanded', 'false');
      expect(searchInput).toHaveAttribute('aria-haspopup', 'listbox');
    });

    it('focuses input on mount when autoFocus is true', () => {
      render(<SearchInterface autoFocus={true} />);
      
      const searchInput = screen.getByRole('combobox');
      expect(searchInput).toHaveFocus();
    });

    it('renders filter and clear buttons', () => {
      render(<SearchInterface />);
      
      expect(screen.getByTitle('Search filters')).toBeInTheDocument();
    });
  });

  describe('Search Input Behavior', () => {
    it('updates input value on change', async () => {
      const user = userEvent.setup();
      render(<SearchInterface />);
      
      const searchInput = screen.getByRole('combobox');
      await user.type(searchInput, 'test query');
      
      expect(searchInput).toHaveValue('test query');
    });

    it('shows recent queries when input is focused and empty', async () => {
      const user = userEvent.setup();
      (useSearchStore as any).mockReturnValue({
        ...mockSearchStore,
        recentQueries: ['recent query 1', 'recent query 2']
      });
      
      render(<SearchInterface />);
      
      const searchInput = screen.getByRole('combobox');
      await user.click(searchInput);
      
      expect(screen.getByText('Recent searches')).toBeInTheDocument();
      expect(screen.getByText('recent query 1')).toBeInTheDocument();
      expect(screen.getByText('recent query 2')).toBeInTheDocument();
    });
  });

  describe('Search Results Display', () => {
    it('displays search results when available', () => {
      const mockResults = [
        {
          noteId: 'note1',
          title: 'Test Note 1',
          snippet: 'This is a test snippet',
          matchCount: 2,
          folderPath: 'Folder 1',
          lastModified: new Date(),
          highlights: []
        }
      ];

      (useSearchStore as any).mockReturnValue({
        ...mockSearchStore,
        query: 'test',
        results: mockResults,
        hasResults: vi.fn(() => true),
        getFilteredResults: vi.fn(() => mockResults)
      });

      render(<SearchInterface />);

      expect(screen.getByTestId('search-result-note1')).toBeInTheDocument();
      expect(screen.getByText('1 result for "test"')).toBeInTheDocument();
    });

    it('displays no results message when search returns empty', () => {
      (useSearchStore as any).mockReturnValue({
        ...mockSearchStore,
        query: 'nonexistent',
        results: [],
        hasResults: vi.fn(() => false),
        getFilteredResults: vi.fn(() => [])
      });

      render(<SearchInterface />);

      expect(screen.getByText('No results found')).toBeInTheDocument();
      expect(screen.getByText(/No notes match "nonexistent"/)).toBeInTheDocument();
    });

    it('displays loading indicator when searching', () => {
      (useSearchStore as any).mockReturnValue({
        ...mockSearchStore,
        isSearching: true
      });

      render(<SearchInterface />);

      expect(screen.getByText('Searching...')).toBeInTheDocument();
    });

    it('displays error message when search fails', () => {
      (useSearchStore as any).mockReturnValue({
        ...mockSearchStore,
        error: 'Search failed due to network error'
      });

      render(<SearchInterface />);

      expect(screen.getByText('Search failed due to network error')).toBeInTheDocument();
    });
  });

  describe('User Interactions', () => {
    it('calls onResultSelect when result is clicked', async () => {
      const user = userEvent.setup();
      const onResultSelect = vi.fn();
      const mockResults = [
        {
          noteId: 'note1',
          title: 'Test Note 1',
          snippet: 'Snippet 1',
          matchCount: 1,
          folderPath: 'Folder 1',
          lastModified: new Date(),
          highlights: []
        }
      ];

      (useSearchStore as any).mockReturnValue({
        ...mockSearchStore,
        query: 'test',
        results: mockResults,
        hasResults: vi.fn(() => true),
        getFilteredResults: vi.fn(() => mockResults)
      });

      render(<SearchInterface onResultSelect={onResultSelect} />);

      const resultItem = screen.getByTestId('search-result-note1');
      await user.click(resultItem);

      expect(mockNoteStore.selectNote).toHaveBeenCalledWith('note1');
      expect(onResultSelect).toHaveBeenCalledWith('note1');
    });

    it('clears search when clear button is clicked', async () => {
      const user = userEvent.setup();
      (useSearchStore as any).mockReturnValue({
        ...mockSearchStore,
        query: 'test'
      });

      render(<SearchInterface />);

      const clearButton = screen.getByTitle('Clear search');
      await user.click(clearButton);

      expect(mockSearchStore.clearSearch).toHaveBeenCalled();
    });
  });

  describe('Filters Integration', () => {
    it('shows filters panel when filter button is clicked', async () => {
      const user = userEvent.setup();
      render(<SearchInterface />);

      const filterButton = screen.getByTitle('Search filters');
      await user.click(filterButton);

      expect(screen.getByTestId('search-filters-panel')).toBeInTheDocument();
    });

    it('highlights filter button when filters are active', () => {
      (useSearchStore as any).mockReturnValue({
        ...mockSearchStore,
        hasActiveFilters: vi.fn(() => true)
      });

      render(<SearchInterface />);

      const filterButton = screen.getByTitle('Search filters');
      expect(filterButton).toHaveClass('text-primary', 'bg-primary/10');
    });
  });

  describe('Recent Notes Integration', () => {
    it('shows recent notes when no search query', () => {
      (useSearchStore as any).mockReturnValue({
        ...mockSearchStore,
        recentNotes: ['note1', 'note2']
      });

      render(<SearchInterface />);

      expect(screen.getByTestId('recent-notes-section')).toBeInTheDocument();
      expect(screen.getByText('Recent Note note1')).toBeInTheDocument();
      expect(screen.getByText('Recent Note note2')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA attributes', () => {
      render(<SearchInterface />);

      const searchInput = screen.getByRole('combobox');
      expect(searchInput).toHaveAttribute('aria-label', 'Search notes');
      expect(searchInput).toHaveAttribute('role', 'combobox');
      expect(searchInput).toHaveAttribute('aria-haspopup', 'listbox');
    });

    it('updates aria-expanded when results are shown', () => {
      const mockResults = [
        {
          noteId: 'note1',
          title: 'Test Note',
          snippet: 'Snippet',
          matchCount: 1,
          folderPath: 'Folder',
          lastModified: new Date(),
          highlights: []
        }
      ];

      (useSearchStore as any).mockReturnValue({
        ...mockSearchStore,
        results: mockResults,
        hasResults: vi.fn(() => true),
        getFilteredResults: vi.fn(() => mockResults)
      });

      render(<SearchInterface />);

      const searchInput = screen.getByRole('combobox');
      expect(searchInput).toHaveAttribute('aria-expanded', 'true');
    });
  });
});