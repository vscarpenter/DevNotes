/**
 * SearchFiltersPanel component tests
 * Tests search filters UI functionality
 * Requirements: 5.3
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SearchFiltersPanel } from '../SearchFiltersPanel';
import { useFolderStore } from '../../../stores/folderStore';
import { SearchFilters } from '../../../types/search';

// Mock the folder store
vi.mock('../../../stores/folderStore');

const mockFolders = {
  'folder1': {
    id: 'folder1',
    name: 'Documents',
    parentId: null,
    children: ['folder2'],
    notes: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    isExpanded: false
  },
  'folder2': {
    id: 'folder2',
    name: 'Projects',
    parentId: 'folder1',
    children: [],
    notes: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    isExpanded: false
  }
};

const mockFolderStore = {
  folders: mockFolders,
  getFolder: vi.fn((id: string) => mockFolders[id as keyof typeof mockFolders])
};

describe('SearchFiltersPanel', () => {
  const defaultProps = {
    filters: {} as SearchFilters,
    onFiltersChange: vi.fn(),
    onClearFilters: vi.fn()
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (useFolderStore as any).mockReturnValue(mockFolderStore);
  });

  describe('Basic Rendering', () => {
    it('renders filter panel with correct structure', () => {
      render(<SearchFiltersPanel {...defaultProps} />);

      expect(screen.getByText('Search Filters')).toBeInTheDocument();
      expect(screen.getByText('Folder')).toBeInTheDocument();
      expect(screen.getByText('Date range')).toBeInTheDocument();
      expect(screen.getByText('Tags')).toBeInTheDocument();
    });

    it('applies custom className', () => {
      const { container } = render(
        <SearchFiltersPanel {...defaultProps} className="custom-class" />
      );

      expect(container.firstChild).toHaveClass('custom-class');
    });

    it('shows clear all button when filters are active', () => {
      const filtersWithData: SearchFilters = {
        folderId: 'folder1'
      };

      render(<SearchFiltersPanel {...defaultProps} filters={filtersWithData} />);

      expect(screen.getByText('Clear all')).toBeInTheDocument();
    });

    it('does not show clear all button when no filters are active', () => {
      render(<SearchFiltersPanel {...defaultProps} />);

      expect(screen.queryByText('Clear all')).not.toBeInTheDocument();
    });
  });

  describe('Folder Filter', () => {
    it('displays "All folders" when no folder is selected', () => {
      render(<SearchFiltersPanel {...defaultProps} />);

      expect(screen.getByText('All folders')).toBeInTheDocument();
    });

    it('displays selected folder name when folder is selected', () => {
      const filtersWithFolder: SearchFilters = {
        folderId: 'folder1'
      };

      render(<SearchFiltersPanel {...defaultProps} filters={filtersWithFolder} />);

      expect(screen.getByText('Documents')).toBeInTheDocument();
    });

    it('opens folder dropdown when clicked', async () => {
      const user = userEvent.setup();
      render(<SearchFiltersPanel {...defaultProps} />);

      const folderButton = screen.getByText('All folders');
      await user.click(folderButton);

      expect(screen.getByText('Documents')).toBeInTheDocument();
      expect(screen.getByText('Projects')).toBeInTheDocument();
    });

    it('selects folder when clicked in dropdown', async () => {
      const user = userEvent.setup();
      const onFiltersChange = vi.fn();

      render(<SearchFiltersPanel {...defaultProps} onFiltersChange={onFiltersChange} />);

      const folderButton = screen.getByText('All folders');
      await user.click(folderButton);

      const documentsOption = screen.getByText('Documents');
      await user.click(documentsOption);

      expect(onFiltersChange).toHaveBeenCalledWith({ folderId: 'folder1' });
    });

    it('clears folder selection when "All folders" is clicked', async () => {
      const user = userEvent.setup();
      const onFiltersChange = vi.fn();
      const filtersWithFolder: SearchFilters = {
        folderId: 'folder1'
      };

      render(
        <SearchFiltersPanel 
          {...defaultProps} 
          filters={filtersWithFolder}
          onFiltersChange={onFiltersChange} 
        />
      );

      const folderButton = screen.getByText('Documents');
      await user.click(folderButton);

      const allFoldersOption = screen.getByText('All folders');
      await user.click(allFoldersOption);

      expect(onFiltersChange).toHaveBeenCalledWith({ folderId: undefined });
    });
  });

  describe('Date Range Filter', () => {
    it('displays "Any time" when no date range is selected', () => {
      render(<SearchFiltersPanel {...defaultProps} />);

      expect(screen.getByText('Any time')).toBeInTheDocument();
    });

    it('displays formatted date range when selected', () => {
      const filtersWithDateRange: SearchFilters = {
        dateRange: {
          start: new Date('2024-01-01'),
          end: new Date('2024-01-31')
        }
      };

      render(<SearchFiltersPanel {...defaultProps} filters={filtersWithDateRange} />);

      expect(screen.getByText('Jan 1 - Jan 31')).toBeInTheDocument();
    });

    it('opens date range picker when clicked', async () => {
      const user = userEvent.setup();
      render(<SearchFiltersPanel {...defaultProps} />);

      const dateButton = screen.getByText('Any time');
      await user.click(dateButton);

      expect(screen.getByText('From')).toBeInTheDocument();
      expect(screen.getByText('To')).toBeInTheDocument();
      expect(screen.getByText('Apply')).toBeInTheDocument();
      expect(screen.getByText('Clear')).toBeInTheDocument();
    });

    it('applies date range when Apply is clicked', async () => {
      const user = userEvent.setup();
      const onFiltersChange = vi.fn();

      render(<SearchFiltersPanel {...defaultProps} onFiltersChange={onFiltersChange} />);

      const dateButton = screen.getByText('Any time');
      await user.click(dateButton);

      const startDateInput = screen.getByDisplayValue('');
      const endDateInput = screen.getAllByDisplayValue('')[1];

      await user.type(startDateInput, '2024-01-01');
      await user.type(endDateInput, '2024-01-31');

      const applyButton = screen.getByText('Apply');
      await user.click(applyButton);

      expect(onFiltersChange).toHaveBeenCalledWith({
        dateRange: {
          start: new Date('2024-01-01'),
          end: expect.any(Date) // End date is set to end of day
        }
      });
    });

    it('clears date range when Clear is clicked', async () => {
      const user = userEvent.setup();
      const onFiltersChange = vi.fn();

      render(<SearchFiltersPanel {...defaultProps} onFiltersChange={onFiltersChange} />);

      const dateButton = screen.getByText('Any time');
      await user.click(dateButton);

      const clearButton = screen.getByText('Clear');
      await user.click(clearButton);

      expect(onFiltersChange).toHaveBeenCalledWith({ dateRange: undefined });
    });

    it('disables Apply button when dates are incomplete', async () => {
      const user = userEvent.setup();
      render(<SearchFiltersPanel {...defaultProps} />);

      const dateButton = screen.getByText('Any time');
      await user.click(dateButton);

      const applyButton = screen.getByText('Apply');
      expect(applyButton).toBeDisabled();

      const startDateInput = screen.getByDisplayValue('');
      await user.type(startDateInput, '2024-01-01');

      expect(applyButton).toBeDisabled();
    });
  });

  describe('Tags Filter', () => {
    it('displays "Any tags" when no tags are selected', () => {
      render(<SearchFiltersPanel {...defaultProps} />);

      expect(screen.getByText('Any tags')).toBeInTheDocument();
    });

    it('displays tag count when tags are selected', () => {
      const filtersWithTags: SearchFilters = {
        tags: ['javascript', 'react']
      };

      render(<SearchFiltersPanel {...defaultProps} filters={filtersWithTags} />);

      expect(screen.getByText('2 tags')).toBeInTheDocument();
    });

    it('displays singular "tag" for single tag', () => {
      const filtersWithTag: SearchFilters = {
        tags: ['javascript']
      };

      render(<SearchFiltersPanel {...defaultProps} filters={filtersWithTag} />);

      expect(screen.getByText('1 tag')).toBeInTheDocument();
    });

    it('opens tags panel when clicked', async () => {
      const user = userEvent.setup();
      render(<SearchFiltersPanel {...defaultProps} />);

      const tagsButton = screen.getByText('Any tags');
      await user.click(tagsButton);

      expect(screen.getByText('Add tag')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Enter tag name')).toBeInTheDocument();
    });

    it('adds tag when Add button is clicked', async () => {
      const user = userEvent.setup();
      const onFiltersChange = vi.fn();

      render(<SearchFiltersPanel {...defaultProps} onFiltersChange={onFiltersChange} />);

      const tagsButton = screen.getByText('Any tags');
      await user.click(tagsButton);

      const tagInput = screen.getByPlaceholderText('Enter tag name');
      await user.type(tagInput, 'javascript');

      const addButton = screen.getByText('Add');
      await user.click(addButton);

      expect(onFiltersChange).toHaveBeenCalledWith({ tags: ['javascript'] });
    });

    it('adds tag when Enter key is pressed', async () => {
      const user = userEvent.setup();
      const onFiltersChange = vi.fn();

      render(<SearchFiltersPanel {...defaultProps} onFiltersChange={onFiltersChange} />);

      const tagsButton = screen.getByText('Any tags');
      await user.click(tagsButton);

      const tagInput = screen.getByPlaceholderText('Enter tag name');
      await user.type(tagInput, 'javascript');
      await user.keyboard('{Enter}');

      expect(onFiltersChange).toHaveBeenCalledWith({ tags: ['javascript'] });
    });

    it('displays selected tags with remove buttons', async () => {
      const user = userEvent.setup();
      const filtersWithTags: SearchFilters = {
        tags: ['javascript', 'react']
      };

      render(<SearchFiltersPanel {...defaultProps} filters={filtersWithTags} />);

      const tagsButton = screen.getByText('2 tags');
      await user.click(tagsButton);

      expect(screen.getByText('Selected tags')).toBeInTheDocument();
      expect(screen.getByText('javascript')).toBeInTheDocument();
      expect(screen.getByText('react')).toBeInTheDocument();
    });

    it('removes tag when remove button is clicked', async () => {
      const user = userEvent.setup();
      const onFiltersChange = vi.fn();
      const filtersWithTags: SearchFilters = {
        tags: ['javascript', 'react']
      };

      render(
        <SearchFiltersPanel 
          {...defaultProps} 
          filters={filtersWithTags}
          onFiltersChange={onFiltersChange} 
        />
      );

      const tagsButton = screen.getByText('2 tags');
      await user.click(tagsButton);

      // Find the remove button for the javascript tag
      const javascriptTag = screen.getByText('javascript');
      const removeButton = javascriptTag.parentElement?.querySelector('button');
      
      if (removeButton) {
        await user.click(removeButton);
      }

      expect(onFiltersChange).toHaveBeenCalledWith({ tags: ['react'] });
    });

    it('disables Add button when input is empty', async () => {
      const user = userEvent.setup();
      render(<SearchFiltersPanel {...defaultProps} />);

      const tagsButton = screen.getByText('Any tags');
      await user.click(tagsButton);

      const addButton = screen.getByText('Add');
      expect(addButton).toBeDisabled();
    });

    it('prevents adding duplicate tags', async () => {
      const user = userEvent.setup();
      const onFiltersChange = vi.fn();
      const filtersWithTags: SearchFilters = {
        tags: ['javascript']
      };

      render(
        <SearchFiltersPanel 
          {...defaultProps} 
          filters={filtersWithTags}
          onFiltersChange={onFiltersChange} 
        />
      );

      const tagsButton = screen.getByText('1 tag');
      await user.click(tagsButton);

      const tagInput = screen.getByPlaceholderText('Enter tag name');
      await user.type(tagInput, 'javascript');

      const addButton = screen.getByText('Add');
      await user.click(addButton);

      // Should not call onFiltersChange since tag already exists
      expect(onFiltersChange).not.toHaveBeenCalled();
    });
  });

  describe('Clear All Functionality', () => {
    it('calls onClearFilters when Clear all button is clicked', async () => {
      const user = userEvent.setup();
      const onClearFilters = vi.fn();
      const filtersWithData: SearchFilters = {
        folderId: 'folder1',
        tags: ['javascript']
      };

      render(
        <SearchFiltersPanel 
          {...defaultProps} 
          filters={filtersWithData}
          onClearFilters={onClearFilters} 
        />
      );

      const clearAllButton = screen.getByText('Clear all');
      await user.click(clearAllButton);

      expect(onClearFilters).toHaveBeenCalledTimes(1);
    });
  });

  describe('Dropdown Behavior', () => {
    it('closes dropdown when clicking outside', async () => {
      const user = userEvent.setup();
      render(<SearchFiltersPanel {...defaultProps} />);

      const folderButton = screen.getByText('All folders');
      await user.click(folderButton);

      expect(screen.getByText('Documents')).toBeInTheDocument();

      // Click outside the dropdown
      await user.click(document.body);

      await waitFor(() => {
        expect(screen.queryByText('Documents')).not.toBeInTheDocument();
      });
    });

    it('closes dropdown after selection', async () => {
      const user = userEvent.setup();
      render(<SearchFiltersPanel {...defaultProps} />);

      const folderButton = screen.getByText('All folders');
      await user.click(folderButton);

      const documentsOption = screen.getByText('Documents');
      await user.click(documentsOption);

      await waitFor(() => {
        expect(screen.queryByText('Projects')).not.toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    it('has proper labels for form elements', () => {
      render(<SearchFiltersPanel {...defaultProps} />);

      expect(screen.getByText('Folder')).toBeInTheDocument();
      expect(screen.getByText('Date range')).toBeInTheDocument();
      expect(screen.getByText('Tags')).toBeInTheDocument();
    });

    it('has proper button roles and states', async () => {
      const user = userEvent.setup();
      render(<SearchFiltersPanel {...defaultProps} />);

      const folderButton = screen.getByText('All folders');
      expect(folderButton).toHaveAttribute('type', 'button');

      await user.click(folderButton);

      const options = screen.getAllByRole('button');
      expect(options.length).toBeGreaterThan(1);
    });
  });
});