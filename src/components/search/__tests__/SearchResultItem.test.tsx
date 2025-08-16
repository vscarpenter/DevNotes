/**
 * SearchResultItem component tests
 * Tests search result display and highlighting functionality
 * Requirements: 5.2, 5.6
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SearchResultItem } from '../SearchResultItem';
import { useNoteStore } from '../../../stores/noteStore';
import { useFolderStore } from '../../../stores/folderStore';
import { SearchResult } from '../../../types/search';
import { Note } from '../../../types/note';
import { vi } from 'vitest';

// Mock the stores
vi.mock('../../../stores/noteStore');
vi.mock('../../../stores/folderStore');

const mockNote: Note = {
  id: 'note1',
  title: 'Test Note Title',
  content: 'This is the content of the test note with some keywords',
  folderId: 'folder1',
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-15'),
  wordCount: 12,
  readingTime: 1,
  tags: ['javascript', 'testing']
};

const mockFolder = {
  id: 'folder1',
  name: 'Test Folder',
  parentId: null,
  children: [],
  notes: ['note1'],
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  isExpanded: false
};

const mockSearchResult: SearchResult = {
  noteId: 'note1',
  title: 'Test Note Title',
  snippet: 'This is the content of the test note with some keywords',
  matchCount: 3,
  folderPath: 'Test Folder',
  lastModified: new Date('2024-01-15'),
  highlights: [
    { start: 0, end: 4, text: 'This' },
    { start: 20, end: 27, text: 'content' },
    { start: 50, end: 58, text: 'keywords' }
  ]
};

const mockNoteStore = {
  getNote: vi.fn(() => mockNote)
};

const mockFolderStore = {
  getFolder: vi.fn(() => mockFolder)
};

describe('SearchResultItem', () => {
  const defaultProps = {
    result: mockSearchResult,
    isSelected: false,
    onClick: vi.fn(),
    query: 'test'
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (useNoteStore as any).mockReturnValue(mockNoteStore);
    (useFolderStore as any).mockReturnValue(mockFolderStore);
  });

  describe('Basic Rendering', () => {
    it('renders search result with correct structure', () => {
      render(<SearchResultItem {...defaultProps} />);

      expect(screen.getByRole('option')).toBeInTheDocument();
      expect(screen.getByText('Test Note Title')).toBeInTheDocument();
      expect(screen.getByText(/This is the content of the test note/)).toBeInTheDocument();
      expect(screen.getByText('Test Folder')).toBeInTheDocument();
      expect(screen.getByText('12 words')).toBeInTheDocument();
      expect(screen.getByText('3 matches')).toBeInTheDocument();
    });

    it('renders with custom id and className', () => {
      render(
        <SearchResultItem 
          {...defaultProps} 
          id="custom-id" 
          className="custom-class" 
        />
      );

      const resultItem = screen.getByRole('option');
      expect(resultItem).toHaveAttribute('id', 'custom-id');
      expect(resultItem).toHaveClass('custom-class');
    });

    it('returns null when note does not exist', () => {
      (useNoteStore as any).mockReturnValue({
        getNote: vi.fn(() => undefined)
      });

      const { container } = render(<SearchResultItem {...defaultProps} />);
      expect(container.firstChild).toBeNull();
    });
  });

  describe('Selection State', () => {
    it('applies selected styling when isSelected is true', () => {
      render(<SearchResultItem {...defaultProps} isSelected={true} />);

      const resultItem = screen.getByRole('option');
      expect(resultItem).toHaveClass('bg-accent');
      expect(resultItem).toHaveAttribute('aria-selected', 'true');
    });

    it('does not apply selected styling when isSelected is false', () => {
      render(<SearchResultItem {...defaultProps} isSelected={false} />);

      const resultItem = screen.getByRole('option');
      expect(resultItem).not.toHaveClass('bg-accent');
      expect(resultItem).toHaveAttribute('aria-selected', 'false');
    });
  });

  describe('Text Highlighting', () => {
    it('highlights matching text in title', () => {
      const propsWithQuery = {
        ...defaultProps,
        query: 'Note'
      };

      render(<SearchResultItem {...propsWithQuery} />);

      const highlightedElements = screen.getAllByText('Note');
      const markElement = highlightedElements.find(el => el.tagName === 'MARK');
      expect(markElement).toBeInTheDocument();
      expect(markElement).toHaveClass('bg-yellow-200', 'dark:bg-yellow-800');
    });

    it('does not highlight when query is empty', () => {
      const propsWithQuery = {
        ...defaultProps,
        query: ''
      };

      const { container } = render(<SearchResultItem {...propsWithQuery} />);

      const markElements = container.querySelectorAll('mark');
      expect(markElements).toHaveLength(0);
    });
  });

  describe('Match Count Display', () => {
    it('displays singular "match" for single match', () => {
      const singleMatchResult = {
        ...mockSearchResult,
        matchCount: 1
      };

      render(<SearchResultItem {...defaultProps} result={singleMatchResult} />);

      expect(screen.getByText('1 match')).toBeInTheDocument();
    });

    it('displays plural "matches" for multiple matches', () => {
      const multipleMatchResult = {
        ...mockSearchResult,
        matchCount: 5
      };

      render(<SearchResultItem {...defaultProps} result={multipleMatchResult} />);

      expect(screen.getByText('5 matches')).toBeInTheDocument();
    });

    it('does not display match count when zero', () => {
      const noMatchResult = {
        ...mockSearchResult,
        matchCount: 0
      };

      render(<SearchResultItem {...defaultProps} result={noMatchResult} />);

      expect(screen.queryByText(/match/)).not.toBeInTheDocument();
    });
  });

  describe('Folder Information', () => {
    it('displays folder name when folder exists', () => {
      render(<SearchResultItem {...defaultProps} />);

      expect(screen.getByText('Test Folder')).toBeInTheDocument();
    });

    it('displays "Unknown" when folder does not exist', () => {
      (useFolderStore as any).mockReturnValue({
        getFolder: vi.fn(() => undefined)
      });

      render(<SearchResultItem {...defaultProps} />);

      expect(screen.getByText('Unknown')).toBeInTheDocument();
    });
  });

  describe('User Interactions', () => {
    it('calls onClick when clicked', async () => {
      const user = userEvent.setup();
      const onClickMock = vi.fn();

      render(<SearchResultItem {...defaultProps} onClick={onClickMock} />);

      const resultItem = screen.getByRole('option');
      await user.click(resultItem);

      expect(onClickMock).toHaveBeenCalledTimes(1);
    });

    it('has proper hover styling', () => {
      render(<SearchResultItem {...defaultProps} />);

      const resultItem = screen.getByRole('option');
      expect(resultItem).toHaveClass('hover:bg-accent');
    });

    it('has proper focus styling', () => {
      render(<SearchResultItem {...defaultProps} />);

      const resultItem = screen.getByRole('option');
      expect(resultItem).toHaveClass('focus:outline-none', 'focus:bg-accent');
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA attributes', () => {
      render(<SearchResultItem {...defaultProps} />);

      const resultItem = screen.getByRole('option');
      expect(resultItem).toHaveAttribute('role', 'option');
      expect(resultItem).toHaveAttribute('aria-selected', 'false');
    });

    it('updates aria-selected based on isSelected prop', () => {
      const { rerender } = render(<SearchResultItem {...defaultProps} isSelected={false} />);

      let resultItem = screen.getByRole('option');
      expect(resultItem).toHaveAttribute('aria-selected', 'false');

      rerender(<SearchResultItem {...defaultProps} isSelected={true} />);

      resultItem = screen.getByRole('option');
      expect(resultItem).toHaveAttribute('aria-selected', 'true');
    });

    it('is keyboard accessible', async () => {
      const user = userEvent.setup();
      const onClickMock = vi.fn();

      render(<SearchResultItem {...defaultProps} onClick={onClickMock} />);

      const resultItem = screen.getByRole('option');
      resultItem.focus();
      await user.keyboard('{Enter}');

      expect(onClickMock).toHaveBeenCalledTimes(1);
    });
  });

  describe('Content Truncation', () => {
    it('applies line-clamp classes for text truncation', () => {
      render(<SearchResultItem {...defaultProps} />);

      const titleElement = screen.getByText('Test Note Title');
      expect(titleElement).toHaveClass('line-clamp-1');

      const snippetElement = screen.getByText(/This is the content/);
      expect(snippetElement).toHaveClass('line-clamp-2');
    });
  });
});