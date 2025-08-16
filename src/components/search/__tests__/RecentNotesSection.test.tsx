/**
 * RecentNotesSection component tests
 * Tests recent notes display functionality
 * Requirements: 5.4
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RecentNotesSection } from '../RecentNotesSection';
import { useNoteStore } from '../../../stores/noteStore';
import { useFolderStore } from '../../../stores/folderStore';
import { Note } from '../../../types/note';

// Mock the stores
vi.mock('../../../stores/noteStore');
vi.mock('../../../stores/folderStore');

const mockNotes: Record<string, Note> = {
  'note1': {
    id: 'note1',
    title: 'Recent Note 1',
    content: 'This is the content of the first recent note with some interesting details',
    folderId: 'folder1',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-15T10:30:00'),
    wordCount: 15,
    readingTime: 1,
    tags: ['javascript']
  },
  'note2': {
    id: 'note2',
    title: 'Recent Note 2',
    content: 'Short content',
    folderId: 'folder2',
    createdAt: new Date('2024-01-02'),
    updatedAt: new Date('2024-01-14T14:20:00'),
    wordCount: 2,
    readingTime: 1,
    tags: []
  },
  'note3': {
    id: 'note3',
    title: 'Very Long Title That Should Be Truncated Because It Exceeds The Display Limit',
    content: 'This is a very long content that should be truncated when displayed in the recent notes section because it exceeds the character limit that we have set for preview text',
    folderId: 'folder1',
    createdAt: new Date('2024-01-03'),
    updatedAt: new Date('2024-01-13T08:15:00'),
    wordCount: 35,
    readingTime: 2,
    tags: ['react', 'typescript']
  }
};

const mockFolders = {
  'folder1': {
    id: 'folder1',
    name: 'Documents',
    parentId: null,
    children: [],
    notes: ['note1', 'note3'],
    createdAt: new Date(),
    updatedAt: new Date(),
    isExpanded: false
  },
  'folder2': {
    id: 'folder2',
    name: 'Projects',
    parentId: null,
    children: [],
    notes: ['note2'],
    createdAt: new Date(),
    updatedAt: new Date(),
    isExpanded: false
  }
};

const mockNoteStore = {
  getNote: vi.fn((id: string) => mockNotes[id])
};

const mockFolderStore = {
  getFolder: vi.fn((id: string) => mockFolders[id as keyof typeof mockFolders])
};

describe('RecentNotesSection', () => {
  const defaultProps = {
    recentNotes: ['note1', 'note2', 'note3'],
    onNoteSelect: vi.fn()
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (useNoteStore as any).mockReturnValue(mockNoteStore);
    (useFolderStore as any).mockReturnValue(mockFolderStore);
  });

  describe('Basic Rendering', () => {
    it('renders recent notes section with header', () => {
      render(<RecentNotesSection {...defaultProps} />);

      expect(screen.getByText('Recent Notes')).toBeInTheDocument();
      expect(screen.getByText('Recent Note 1')).toBeInTheDocument();
      expect(screen.getByText('Recent Note 2')).toBeInTheDocument();
    });

    it('applies custom className', () => {
      const { container } = render(
        <RecentNotesSection {...defaultProps} className="custom-class" />
      );

      expect(container.firstChild).toHaveClass('custom-class');
    });

    it('renders all valid recent notes', () => {
      render(<RecentNotesSection {...defaultProps} />);

      expect(screen.getByText('Recent Note 1')).toBeInTheDocument();
      expect(screen.getByText('Recent Note 2')).toBeInTheDocument();
      expect(screen.getByText('Very Long Title That Should Be Truncated Because It Exceeds The Display Limit')).toBeInTheDocument();
    });
  });

  describe('Empty State', () => {
    it('displays empty state when no recent notes', () => {
      render(<RecentNotesSection {...defaultProps} recentNotes={[]} />);

      expect(screen.getByText('No recent notes')).toBeInTheDocument();
      expect(screen.getByText('Your recently accessed notes will appear here.')).toBeInTheDocument();
    });

    it('displays empty state when all note IDs are invalid', () => {
      (useNoteStore as any).mockReturnValue({
        getNote: vi.fn(() => undefined)
      });

      render(<RecentNotesSection {...defaultProps} />);

      expect(screen.getByText('No recent notes')).toBeInTheDocument();
    });

    it('filters out invalid note IDs and shows valid ones', () => {
      const recentNotesWithInvalid = ['note1', 'invalid-note', 'note2'];
      
      render(<RecentNotesSection {...defaultProps} recentNotes={recentNotesWithInvalid} />);

      expect(screen.getByText('Recent Note 1')).toBeInTheDocument();
      expect(screen.getByText('Recent Note 2')).toBeInTheDocument();
      expect(screen.queryByText('invalid-note')).not.toBeInTheDocument();
    });
  });

  describe('Note Display', () => {
    it('displays note titles correctly', () => {
      render(<RecentNotesSection {...defaultProps} />);

      expect(screen.getByText('Recent Note 1')).toBeInTheDocument();
      expect(screen.getByText('Recent Note 2')).toBeInTheDocument();
    });

    it('displays truncated preview text', () => {
      render(<RecentNotesSection {...defaultProps} />);

      // Should show truncated version of the long content
      expect(screen.getByText('This is the content of the first recent note with some...')).toBeInTheDocument();
      expect(screen.getByText('Short content')).toBeInTheDocument();
    });

    it('handles content without preview text', () => {
      const noteWithoutContent = {
        ...mockNotes.note1,
        content: ''
      };

      (useNoteStore as any).mockReturnValue({
        getNote: vi.fn((id: string) => id === 'note1' ? noteWithoutContent : mockNotes[id])
      });

      render(<RecentNotesSection {...defaultProps} recentNotes={['note1']} />);

      expect(screen.getByText('Recent Note 1')).toBeInTheDocument();
      // Should not show any preview text
      expect(screen.queryByText(/This is the content/)).not.toBeInTheDocument();
    });

    it('strips markdown formatting from preview text', () => {
      const noteWithMarkdown = {
        ...mockNotes.note1,
        content: '# Header\n\nThis is **bold** and *italic* text with `code` blocks.\n\nAnother paragraph.'
      };

      (useNoteStore as any).mockReturnValue({
        getNote: vi.fn((id: string) => id === 'note1' ? noteWithMarkdown : mockNotes[id])
      });

      render(<RecentNotesSection {...defaultProps} recentNotes={['note1']} />);

      // Should show plain text without markdown
      expect(screen.getByText('This is bold and italic text with code blocks. Another...')).toBeInTheDocument();
    });
  });

  describe('Folder Information', () => {
    it('displays folder names correctly', () => {
      render(<RecentNotesSection {...defaultProps} />);

      expect(screen.getByText('Documents')).toBeInTheDocument();
      expect(screen.getByText('Projects')).toBeInTheDocument();
    });

    it('displays "Unknown" when folder does not exist', () => {
      (useFolderStore as any).mockReturnValue({
        getFolder: vi.fn(() => undefined)
      });

      render(<RecentNotesSection {...defaultProps} />);

      const unknownElements = screen.getAllByText('Unknown');
      expect(unknownElements.length).toBeGreaterThan(0);
    });
  });

  describe('Date Formatting', () => {
    beforeEach(() => {
      // Mock current time for consistent testing
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2024-01-15T12:00:00'));
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('displays "Just now" for very recent notes', () => {
      const veryRecentNote = {
        ...mockNotes.note1,
        updatedAt: new Date('2024-01-15T11:59:30') // 30 seconds ago
      };

      (useNoteStore as any).mockReturnValue({
        getNote: vi.fn(() => veryRecentNote)
      });

      render(<RecentNotesSection {...defaultProps} recentNotes={['note1']} />);

      expect(screen.getByText('Just now')).toBeInTheDocument();
    });

    it('displays hours ago for notes modified within 24 hours', () => {
      const hoursAgoNote = {
        ...mockNotes.note1,
        updatedAt: new Date('2024-01-15T08:00:00') // 4 hours ago
      };

      (useNoteStore as any).mockReturnValue({
        getNote: vi.fn(() => hoursAgoNote)
      });

      render(<RecentNotesSection {...defaultProps} recentNotes={['note1']} />);

      expect(screen.getByText('4h ago')).toBeInTheDocument();
    });

    it('displays days ago for notes modified within a week', () => {
      const daysAgoNote = {
        ...mockNotes.note1,
        updatedAt: new Date('2024-01-12T12:00:00') // 3 days ago
      };

      (useNoteStore as any).mockReturnValue({
        getNote: vi.fn(() => daysAgoNote)
      });

      render(<RecentNotesSection {...defaultProps} recentNotes={['note1']} />);

      expect(screen.getByText('3d ago')).toBeInTheDocument();
    });

    it('displays formatted date for older notes', () => {
      const oldNote = {
        ...mockNotes.note1,
        updatedAt: new Date('2024-01-01T12:00:00') // 2 weeks ago
      };

      (useNoteStore as any).mockReturnValue({
        getNote: vi.fn(() => oldNote)
      });

      render(<RecentNotesSection {...defaultProps} recentNotes={['note1']} />);

      expect(screen.getByText('Jan 1')).toBeInTheDocument();
    });
  });

  describe('User Interactions', () => {
    it('calls onNoteSelect when note is clicked', async () => {
      const user = userEvent.setup();
      const onNoteSelect = vi.fn();

      render(<RecentNotesSection {...defaultProps} onNoteSelect={onNoteSelect} />);

      const noteButton = screen.getByText('Recent Note 1');
      await user.click(noteButton);

      expect(onNoteSelect).toHaveBeenCalledWith('note1');
    });

    it('calls onNoteSelect with correct note ID for each note', async () => {
      const user = userEvent.setup();
      const onNoteSelect = vi.fn();

      render(<RecentNotesSection {...defaultProps} onNoteSelect={onNoteSelect} />);

      const note1Button = screen.getByText('Recent Note 1');
      const note2Button = screen.getByText('Recent Note 2');

      await user.click(note1Button);
      expect(onNoteSelect).toHaveBeenCalledWith('note1');

      await user.click(note2Button);
      expect(onNoteSelect).toHaveBeenCalledWith('note2');
    });

    it('has proper hover styling', () => {
      render(<RecentNotesSection {...defaultProps} />);

      const noteButtons = screen.getAllByRole('button');
      noteButtons.forEach(button => {
        expect(button).toHaveClass('hover:bg-accent');
      });
    });

    it('has proper focus styling', () => {
      render(<RecentNotesSection {...defaultProps} />);

      const noteButtons = screen.getAllByRole('button');
      noteButtons.forEach(button => {
        expect(button).toHaveClass('focus:outline-none', 'focus:bg-accent');
      });
    });
  });

  describe('Scrolling Behavior', () => {
    it('has scrollable container for many notes', () => {
      render(<RecentNotesSection {...defaultProps} />);

      const scrollContainer = screen.getByText('Recent Notes').closest('div')?.querySelector('.max-h-80');
      expect(scrollContainer).toHaveClass('overflow-y-auto');
    });
  });

  describe('Content Truncation', () => {
    it('truncates long titles with line-clamp', () => {
      render(<RecentNotesSection {...defaultProps} />);

      const titleElements = screen.getAllByText(/Recent Note|Very Long Title/);
      titleElements.forEach(element => {
        if (element.tagName === 'H3') {
          expect(element).toHaveClass('line-clamp-1');
        }
      });
    });

    it('truncates preview text with line-clamp', () => {
      render(<RecentNotesSection {...defaultProps} />);

      const previewElements = screen.getAllByText(/This is|Short content/);
      previewElements.forEach(element => {
        if (element.tagName === 'P') {
          expect(element).toHaveClass('line-clamp-1');
        }
      });
    });

    it('truncates folder names with max-width', () => {
      render(<RecentNotesSection {...defaultProps} />);

      const folderElements = screen.getAllByText(/Documents|Projects/);
      folderElements.forEach(element => {
        if (element.classList.contains('truncate')) {
          expect(element).toHaveClass('max-w-24');
        }
      });
    });
  });

  describe('Accessibility', () => {
    it('has proper button roles', () => {
      render(<RecentNotesSection {...defaultProps} />);

      const noteButtons = screen.getAllByRole('button');
      expect(noteButtons.length).toBe(3); // One for each note
    });

    it('is keyboard accessible', async () => {
      const user = userEvent.setup();
      const onNoteSelect = vi.fn();

      render(<RecentNotesSection {...defaultProps} onNoteSelect={onNoteSelect} />);

      const noteButton = screen.getByText('Recent Note 1');
      noteButton.focus();
      await user.keyboard('{Enter}');

      expect(onNoteSelect).toHaveBeenCalledWith('note1');
    });

    it('has proper semantic structure', () => {
      render(<RecentNotesSection {...defaultProps} />);

      // Check for proper heading structure
      expect(screen.getByText('Recent Notes')).toBeInTheDocument();
      
      // Check for proper content structure
      const noteButtons = screen.getAllByRole('button');
      expect(noteButtons.length).toBeGreaterThan(0);
    });
  });
});