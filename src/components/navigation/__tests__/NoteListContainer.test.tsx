/**
 * Tests for NoteListContainer component
 * Requirements: 2.1, 9.6
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { NoteListContainer } from '../NoteListContainer';
import { useNoteStore } from '../../../stores/noteStore';
import { Note } from '../../../types/note';

// Mock the stores
vi.mock('../../../stores/noteStore');

// Mock the child components
vi.mock('../NoteList', () => ({
  NoteList: ({ folderId, searchQuery, sortBy, sortOrder, height }: any) => (
    <div data-testid="note-list">
      <div>folderId: {folderId || 'all'}</div>
      <div>searchQuery: {searchQuery || 'none'}</div>
      <div>sortBy: {sortBy}</div>
      <div>sortOrder: {sortOrder}</div>
      <div>height: {height}</div>
    </div>
  ),
}));

vi.mock('../NoteListHeader', () => ({
  NoteListHeader: ({ totalCount, sortBy, sortOrder, onSortChange, onSortOrderChange }: any) => (
    <div data-testid="note-list-header">
      <div>totalCount: {totalCount}</div>
      <div>sortBy: {sortBy}</div>
      <div>sortOrder: {sortOrder}</div>
      <button onClick={() => onSortChange('title')}>Change Sort</button>
      <button onClick={() => onSortOrderChange('asc')}>Change Order</button>
    </div>
  ),
}));

const mockNotes: Record<string, Note> = {
  'note-1': {
    id: 'note-1',
    title: 'First Note',
    content: 'This is the content of the first note.',
    folderId: 'folder-1',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-02'),
    tags: ['javascript'],
    wordCount: 8,
    readingTime: 1
  },
  'note-2': {
    id: 'note-2',
    title: 'Second Note',
    content: 'This is the content of the second note.',
    folderId: 'folder-1',
    createdAt: new Date('2024-01-03'),
    updatedAt: new Date('2024-01-04'),
    tags: ['typescript'],
    wordCount: 8,
    readingTime: 1
  },
  'note-3': {
    id: 'note-3',
    title: 'Third Note',
    content: 'This is the content of the third note.',
    folderId: 'folder-2',
    createdAt: new Date('2024-01-05'),
    updatedAt: new Date('2024-01-06'),
    tags: [],
    wordCount: 8,
    readingTime: 1
  }
};

describe('NoteListContainer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    (useNoteStore as any).mockReturnValue({
      notes: mockNotes,
    });
  });

  it('renders header and list components', () => {
    render(<NoteListContainer height={400} />);
    
    expect(screen.getByTestId('note-list-header')).toBeInTheDocument();
    expect(screen.getByTestId('note-list')).toBeInTheDocument();
  });

  it('passes correct props to NoteList', () => {
    render(
      <NoteListContainer 
        folderId="folder-1" 
        searchQuery="test" 
        height={400} 
      />
    );
    
    expect(screen.getByText('folderId: folder-1')).toBeInTheDocument();
    expect(screen.getByText('searchQuery: test')).toBeInTheDocument();
    expect(screen.getAllByText('sortBy: updatedAt')).toHaveLength(2); // Header and list
    expect(screen.getAllByText('sortOrder: desc')).toHaveLength(2); // Header and list
  });

  it('calculates correct height for NoteList', () => {
    render(<NoteListContainer height={400} />);
    
    // Height should be total height minus header height (49px)
    expect(screen.getByText('height: 351')).toBeInTheDocument();
  });

  it('calculates correct total count for all notes', () => {
    render(<NoteListContainer height={400} />);
    
    expect(screen.getByText('totalCount: 3')).toBeInTheDocument();
  });

  it('calculates correct total count for filtered notes by folder', () => {
    render(<NoteListContainer folderId="folder-1" height={400} />);
    
    expect(screen.getByText('totalCount: 2')).toBeInTheDocument();
  });

  it('calculates correct total count for search results', () => {
    render(<NoteListContainer searchQuery="first" height={400} />);
    
    expect(screen.getByText('totalCount: 1')).toBeInTheDocument();
  });

  it('calculates correct total count for search in content', () => {
    render(<NoteListContainer searchQuery="content" height={400} />);
    
    expect(screen.getByText('totalCount: 3')).toBeInTheDocument();
  });

  it('calculates correct total count for search in tags', () => {
    render(<NoteListContainer searchQuery="javascript" height={400} />);
    
    expect(screen.getByText('totalCount: 1')).toBeInTheDocument();
  });

  it('handles empty search query', () => {
    render(<NoteListContainer searchQuery="" height={400} />);
    
    expect(screen.getByText('totalCount: 3')).toBeInTheDocument();
    expect(screen.getByText('searchQuery: none')).toBeInTheDocument();
  });

  it('handles whitespace-only search query', () => {
    render(<NoteListContainer searchQuery="   " height={400} />);
    
    expect(screen.getByText('totalCount: 3')).toBeInTheDocument();
    expect(screen.getByText(/searchQuery:\s+/)).toBeInTheDocument(); // Whitespace is preserved
  });

  it('updates sort settings when header controls are used', async () => {
    const user = userEvent.setup();
    render(<NoteListContainer height={400} />);
    
    // Initially should be updatedAt desc
    expect(screen.getAllByText('sortBy: updatedAt')).toHaveLength(2);
    expect(screen.getAllByText('sortOrder: desc')).toHaveLength(2);
    
    // Change sort by
    await user.click(screen.getByText('Change Sort'));
    expect(screen.getAllByText('sortBy: title')).toHaveLength(2);
    
    // Change sort order
    await user.click(screen.getByText('Change Order'));
    expect(screen.getByText('sortOrder: asc')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(
      <NoteListContainer height={400} className="custom-class" />
    );
    
    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('handles case-insensitive search', () => {
    render(<NoteListContainer searchQuery="FIRST" height={400} />);
    
    expect(screen.getByText('totalCount: 1')).toBeInTheDocument();
  });

  it('handles search with no results', () => {
    render(<NoteListContainer searchQuery="nonexistent" height={400} />);
    
    expect(screen.getByText('totalCount: 0')).toBeInTheDocument();
  });

  it('combines folder filter and search query', () => {
    render(
      <NoteListContainer 
        folderId="folder-1" 
        searchQuery="second" 
        height={400} 
      />
    );
    
    expect(screen.getByText('totalCount: 1')).toBeInTheDocument();
  });

  it('handles non-existent folder', () => {
    render(<NoteListContainer folderId="non-existent" height={400} />);
    
    expect(screen.getByText('totalCount: 0')).toBeInTheDocument();
  });

  it('maintains state between re-renders', async () => {
    const user = userEvent.setup();
    const { rerender } = render(<NoteListContainer height={400} />);
    
    // Change sort settings
    await user.click(screen.getByText('Change Sort'));
    await user.click(screen.getByText('Change Order'));
    
    expect(screen.getAllByText('sortBy: title')).toHaveLength(2);
    expect(screen.getAllByText('sortOrder: asc')).toHaveLength(2);
    
    // Re-render with different props
    rerender(<NoteListContainer height={500} searchQuery="test" />);
    
    // Sort settings should be maintained
    expect(screen.getAllByText('sortBy: title')).toHaveLength(2);
    expect(screen.getAllByText('sortOrder: asc')).toHaveLength(2);
    
    // But other props should update
    expect(screen.getByText('height: 451')).toBeInTheDocument();
    expect(screen.getByText('searchQuery: test')).toBeInTheDocument();
  });
});