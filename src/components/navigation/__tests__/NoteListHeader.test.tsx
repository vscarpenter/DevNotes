/**
 * Tests for NoteListHeader component
 * Requirements: 2.1, 9.6
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect } from 'vitest';
import { NoteListHeader } from '../NoteListHeader';

describe('NoteListHeader', () => {
  const defaultProps = {
    totalCount: 5,
    sortBy: 'updatedAt' as const,
    sortOrder: 'desc' as const,
    onSortChange: vi.fn(),
    onSortOrderChange: vi.fn(),
  };

  it('displays correct note count for multiple notes', () => {
    render(<NoteListHeader {...defaultProps} />);
    
    expect(screen.getByText('5 notes')).toBeInTheDocument();
  });

  it('displays correct note count for single note', () => {
    render(<NoteListHeader {...defaultProps} totalCount={1} />);
    
    expect(screen.getByText('1 note')).toBeInTheDocument();
  });

  it('displays correct note count for zero notes', () => {
    render(<NoteListHeader {...defaultProps} totalCount={0} />);
    
    expect(screen.getByText('0 notes')).toBeInTheDocument();
  });

  it('shows current sort option', () => {
    render(<NoteListHeader {...defaultProps} />);
    
    expect(screen.getByText('Last Modified')).toBeInTheDocument();
  });

  it('shows correct sort option for title sorting', () => {
    render(<NoteListHeader {...defaultProps} sortBy="title" />);
    
    expect(screen.getByText('Title')).toBeInTheDocument();
  });

  it('shows correct sort option for created date sorting', () => {
    render(<NoteListHeader {...defaultProps} sortBy="createdAt" />);
    
    expect(screen.getByText('Created')).toBeInTheDocument();
  });

  it('shows correct sort option for word count sorting', () => {
    render(<NoteListHeader {...defaultProps} sortBy="wordCount" />);
    
    expect(screen.getByText('Word Count')).toBeInTheDocument();
  });

  it('shows descending sort icon by default', () => {
    render(<NoteListHeader {...defaultProps} />);
    
    // Look for the sort desc icon (should be visible)
    const sortButton = screen.getByRole('button', { name: /sort descending/i });
    expect(sortButton).toBeInTheDocument();
  });

  it('shows ascending sort icon when sort order is asc', () => {
    render(<NoteListHeader {...defaultProps} sortOrder="asc" />);
    
    const sortButton = screen.getByRole('button', { name: /sort ascending/i });
    expect(sortButton).toBeInTheDocument();
  });

  it('calls onSortOrderChange when sort order button is clicked', async () => {
    const user = userEvent.setup();
    const onSortOrderChange = vi.fn();
    
    render(
      <NoteListHeader 
        {...defaultProps} 
        onSortOrderChange={onSortOrderChange}
        sortOrder="desc"
      />
    );
    
    const sortButton = screen.getByRole('button', { name: /sort descending/i });
    await user.click(sortButton);
    
    expect(onSortOrderChange).toHaveBeenCalledWith('asc');
  });

  it('calls onSortOrderChange with desc when current order is asc', async () => {
    const user = userEvent.setup();
    const onSortOrderChange = vi.fn();
    
    render(
      <NoteListHeader 
        {...defaultProps} 
        onSortOrderChange={onSortOrderChange}
        sortOrder="asc"
      />
    );
    
    const sortButton = screen.getByRole('button', { name: /sort ascending/i });
    await user.click(sortButton);
    
    expect(onSortOrderChange).toHaveBeenCalledWith('desc');
  });

  it('shows sort dropdown on hover', async () => {
    const user = userEvent.setup();
    render(<NoteListHeader {...defaultProps} />);
    
    const sortButton = screen.getByText('Last Modified');
    await user.hover(sortButton);
    
    // Check if dropdown options are visible
    expect(screen.getByText('Title')).toBeInTheDocument();
    expect(screen.getByText('Created')).toBeInTheDocument();
    expect(screen.getByText('Word Count')).toBeInTheDocument();
  });

  it('calls onSortChange when dropdown option is clicked', async () => {
    const user = userEvent.setup();
    const onSortChange = vi.fn();
    
    render(
      <NoteListHeader 
        {...defaultProps} 
        onSortChange={onSortChange}
      />
    );
    
    const sortButton = screen.getByText('Last Modified');
    await user.hover(sortButton);
    
    const titleOption = screen.getByText('Title');
    await user.click(titleOption);
    
    expect(onSortChange).toHaveBeenCalledWith('title');
  });

  it('highlights current sort option in dropdown', async () => {
    const user = userEvent.setup();
    render(<NoteListHeader {...defaultProps} sortBy="title" />);
    
    const sortButton = screen.getByText('Title');
    await user.hover(sortButton);
    
    // The current sort option should have accent styling
    const titleOption = screen.getByText('Title');
    expect(titleOption.closest('button')).toHaveClass('bg-accent');
  });

  it('shows all sort options in dropdown', async () => {
    const user = userEvent.setup();
    render(<NoteListHeader {...defaultProps} />);
    
    const sortButton = screen.getByText('Last Modified');
    await user.hover(sortButton);
    
    expect(screen.getByText('Last Modified')).toBeInTheDocument();
    expect(screen.getByText('Title')).toBeInTheDocument();
    expect(screen.getByText('Created')).toBeInTheDocument();
    expect(screen.getByText('Word Count')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(
      <NoteListHeader {...defaultProps} className="custom-class" />
    );
    
    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('has proper accessibility attributes', () => {
    render(<NoteListHeader {...defaultProps} />);
    
    const sortOrderButton = screen.getByRole('button', { name: /sort descending/i });
    expect(sortOrderButton).toHaveAttribute('title', 'Sort ascending');
  });
});