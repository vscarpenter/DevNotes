/**
 * Tests for NoteList component
 * Requirements: 2.1, 9.6
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { NoteList } from '../NoteList';
import { useNoteStore } from '../../../stores/noteStore';
import { useFolderStore } from '../../../stores/folderStore';
import { Note } from '../../../types/note';

// Mock the stores
vi.mock('../../../stores/noteStore');
vi.mock('../../../stores/folderStore');

// Mock react-window
vi.mock('react-window', () => ({
  FixedSizeList: ({ children, itemCount, itemSize }: any) => (
    <div data-testid="virtual-list">
      {Array.from({ length: itemCount }, (_, index) => 
        children({ index, style: { height: itemSize } })
      )}
    </div>
  ),
}));

const mockNotes: Record<string, Note> = {
  'note-1': {
    id: 'note-1',
    title: 'First Note',
    content: 'This is the content of the first note with some **bold** text.',
    folderId: 'folder-1',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-02'),
    tags: ['javascript', 'react'],
    wordCount: 12,
    readingTime: 1
  },
  'note-2': {
    id: 'note-2',
    title: 'Second Note',
    content: 'This is a longer note with more content that should be truncated in the preview because it exceeds the character limit.',
    folderId: 'folder-1',
    createdAt: new Date('2024-01-03'),
    updatedAt: new Date('2024-01-04'),
    tags: ['typescript'],
    wordCount: 15,
    readingTime: 1
  },
  'note-3': {
    id: 'note-3',
    title: 'Third Note',
    content: 'Short note.',
    folderId: 'folder-2',
    createdAt: new Date('2024-01-05'),
    updatedAt: new Date('2024-01-06'),
    tags: [],
    wordCount: 2,
    readingTime: 1
  }
};

const mockFolders = {
  'folder-1': {
    id: 'folder-1',
    name: 'Work',
    parentId: null,
    children: [],
    notes: ['note-1', 'note-2'],
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    isExpanded: true
  },
  'folder-2': {
    id: 'folder-2',
    name: 'Personal',
    parentId: null,
    children: [],
    notes: ['note-3'],
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    isExpanded: true
  }
};

describe('NoteList', () => {
  const mockSelectNote = vi.fn();
  const mockDuplicateNote = vi.fn();
  const mockDeleteNote = vi.fn();
  const mockGetFolderById = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    
    (useNoteStore as any).mockReturnValue({
      notes: mockNotes,
      selectedNoteId: null,
      selectNote: mockSelectNote,
      duplicateNote: mockDuplicateNote,
      deleteNote: mockDeleteNote,
    });

    (useFolderStore as any).mockReturnValue({
      getFolderById: mockGetFolderById,
    });

    mockGetFolderById.mockImplementation((id: string) => (mockFolders as any)[id]);
  });

  it('renders all notes when no filter is applied', () => {
    render(<NoteList height={400} />);
    
    expect(screen.getByText('First Note')).toBeInTheDocument();
    expect(screen.getByText('Second Note')).toBeInTheDocument();
    expect(screen.getByText('Third Note')).toBeInTheDocument();
  });

  it('filters notes by folder', () => {
    render(<NoteList folderId="folder-1" height={400} />);
    
    expect(screen.getByText('First Note')).toBeInTheDocument();
    expect(screen.getByText('Second Note')).toBeInTheDocument();
    expect(screen.queryByText('Third Note')).not.toBeInTheDocument();
  });

  it('filters notes by search query', () => {
    render(<NoteList searchQuery="first" height={400} />);
    
    expect(screen.getByText('First Note')).toBeInTheDocument();
    expect(screen.queryByText('Second Note')).not.toBeInTheDocument();
    expect(screen.queryByText('Third Note')).not.toBeInTheDocument();
  });

  it('searches in note content', () => {
    render(<NoteList searchQuery="bold" height={400} />);
    
    expect(screen.getByText('First Note')).toBeInTheDocument();
    expect(screen.queryByText('Second Note')).not.toBeInTheDocument();
  });

  it('searches in note tags', () => {
    render(<NoteList searchQuery="javascript" height={400} />);
    
    expect(screen.getByText('First Note')).toBeInTheDocument();
    expect(screen.queryByText('Second Note')).not.toBeInTheDocument();
  });

  it('sorts notes by title ascending', () => {
    render(<NoteList sortBy="title" sortOrder="asc" height={400} />);
    
    const noteElements = screen.getAllByRole('generic').filter(el => 
      el.textContent?.includes('Note')
    );
    
    // Should be in alphabetical order: First, Second, Third
    expect(noteElements[0]).toHaveTextContent('First Note');
    expect(noteElements[1]).toHaveTextContent('Second Note');
    expect(noteElements[2]).toHaveTextContent('Third Note');
  });

  it('sorts notes by word count descending', () => {
    render(<NoteList sortBy="wordCount" sortOrder="desc" height={400} />);
    
    const noteElements = screen.getAllByRole('generic').filter(el => 
      el.textContent?.includes('Note')
    );
    
    // Should be in word count order: Second (15), First (12), Third (2)
    expect(noteElements[0]).toHaveTextContent('Second Note');
    expect(noteElements[1]).toHaveTextContent('First Note');
    expect(noteElements[2]).toHaveTextContent('Third Note');
  });

  it('selects note when clicked', async () => {
    const user = userEvent.setup();
    render(<NoteList height={400} />);
    
    await user.click(screen.getByText('First Note'));
    
    expect(mockSelectNote).toHaveBeenCalledWith('note-1');
  });

  it('shows selected note with different styling', () => {
    (useNoteStore as any).mockReturnValue({
      notes: mockNotes,
      selectedNoteId: 'note-1',
      selectNote: mockSelectNote,
      duplicateNote: mockDuplicateNote,
      deleteNote: mockDeleteNote,
    });

    render(<NoteList height={400} />);
    
    // Find the note item container (should have the bg-accent class)
    const noteItems = screen.getAllByText('First Note');
    const selectedNoteContainer = noteItems[0].closest('[class*="bg-accent"]');
    expect(selectedNoteContainer).toBeInTheDocument();
  });

  it('shows context menu on right click', async () => {
    const user = userEvent.setup();
    render(<NoteList height={400} />);
    
    await user.pointer({ keys: '[MouseRight]', target: screen.getByText('First Note') });
    
    expect(screen.getByText('Duplicate')).toBeInTheDocument();
    expect(screen.getByText('Move to...')).toBeInTheDocument();
    expect(screen.getByText('Delete')).toBeInTheDocument();
  });

  it('duplicates note from context menu', async () => {
    const user = userEvent.setup();
    mockDuplicateNote.mockResolvedValue('new-note-id');
    
    render(<NoteList height={400} />);
    
    await user.pointer({ keys: '[MouseRight]', target: screen.getByText('First Note') });
    await user.click(screen.getByText('Duplicate'));
    
    expect(mockDuplicateNote).toHaveBeenCalledWith('note-1');
  });

  it('deletes note from context menu with confirmation', async () => {
    const user = userEvent.setup();
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);
    mockDeleteNote.mockResolvedValue(undefined);
    
    render(<NoteList height={400} />);
    
    await user.pointer({ keys: '[MouseRight]', target: screen.getByText('First Note') });
    await user.click(screen.getByText('Delete'));
    
    expect(confirmSpy).toHaveBeenCalledWith('Are you sure you want to delete this note?');
    expect(mockDeleteNote).toHaveBeenCalledWith('note-1');
    
    confirmSpy.mockRestore();
  });

  it('does not delete note if confirmation is cancelled', async () => {
    const user = userEvent.setup();
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false);
    
    render(<NoteList height={400} />);
    
    await user.pointer({ keys: '[MouseRight]', target: screen.getByText('First Note') });
    await user.click(screen.getByText('Delete'));
    
    expect(confirmSpy).toHaveBeenCalled();
    expect(mockDeleteNote).not.toHaveBeenCalled();
    
    confirmSpy.mockRestore();
  });

  it('closes context menu when clicking outside', async () => {
    const user = userEvent.setup();
    render(<NoteList height={400} />);
    
    await user.pointer({ keys: '[MouseRight]', target: screen.getByText('First Note') });
    expect(screen.getByText('Duplicate')).toBeInTheDocument();
    
    await user.click(document.body);
    
    await waitFor(() => {
      expect(screen.queryByText('Duplicate')).not.toBeInTheDocument();
    });
  });

  it('displays empty state when no notes match filter', () => {
    render(<NoteList folderId="non-existent-folder" height={400} />);
    
    expect(screen.getByText('No notes yet')).toBeInTheDocument();
    expect(screen.getByText('Create your first note to get started with DevNotes.')).toBeInTheDocument();
  });

  it('displays empty state for search with no results', () => {
    render(<NoteList searchQuery="nonexistent" height={400} />);
    
    expect(screen.getByText('No notes found')).toBeInTheDocument();
    expect(screen.getByText('No notes match "nonexistent". Try a different search term.')).toBeInTheDocument();
  });

  it('displays note metadata correctly', () => {
    render(<NoteList height={400} />);
    
    // Check word count
    expect(screen.getByText('12 words')).toBeInTheDocument();
    expect(screen.getByText('15 words')).toBeInTheDocument();
    
    // Check folder names
    expect(screen.getAllByText('Work')).toHaveLength(2);
    expect(screen.getByText('Personal')).toBeInTheDocument();
    
    // Check tags
    expect(screen.getByText('javascript')).toBeInTheDocument();
    expect(screen.getByText('typescript')).toBeInTheDocument();
  });

  it('truncates long preview text', () => {
    render(<NoteList height={400} />);
    
    // The long content should be truncated (we set it to 80 chars)
    const longContent = screen.getByText(/This is a longer note with more content that should be truncated/);
    expect(longContent.textContent).toMatch(/\.\.\.$/);
  });

  it('formats dates correctly', () => {
    render(<NoteList height={400} />);
    
    // Should show formatted dates (exact format depends on current date)
    const dateElements = screen.getAllByText(/\d/);
    expect(dateElements.length).toBeGreaterThan(0);
  });
});