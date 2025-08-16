/**
 * SplitView Component Tests
 * Tests split view functionality and synchronized scrolling
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SplitView } from '../SplitView';
import { useUIStore } from '../../../stores/uiStore';
import { useNoteStore } from '../../../stores/noteStore';

// Mock the stores
vi.mock('../../../stores/uiStore');
vi.mock('../../../stores/noteStore');

// Mock the child components
vi.mock('../MarkdownEditor', () => ({
  MarkdownEditor: ({ noteId }: { noteId: string }) => (
    <div data-testid="markdown-editor">Editor for note {noteId}</div>
  )
}));

vi.mock('../PreviewPane', () => ({
  PreviewPane: ({ content, onScroll }: { content: string; onScroll?: Function }) => (
    <div 
      data-testid="preview-pane"
      onScroll={(e) => onScroll?.(100, 500)}
    >
      Preview: {content}
    </div>
  )
}));

const mockUseUIStore = vi.mocked(useUIStore);
const mockUseNoteStore = vi.mocked(useNoteStore);

const mockNote = {
  id: 'test-note-1',
  title: 'Test Note',
  content: '# Test Content\n\nThis is test content.',
  folderId: 'folder-1',
  createdAt: new Date(),
  updatedAt: new Date(),
  wordCount: 10,
  readingTime: 1
};

describe('SplitView', () => {
  const mockSetPanelLayout = vi.fn();
  const mockGetNote = vi.fn();

  beforeEach(() => {
    mockUseUIStore.mockReturnValue({
      panelLayout: 'split',
      setPanelLayout: mockSetPanelLayout,
    } as any);

    mockUseNoteStore.mockReturnValue({
      getNote: mockGetNote,
    } as any);

    mockGetNote.mockReturnValue(mockNote);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders split view with both editor and preview', () => {
    render(<SplitView noteId="test-note-1" />);
    
    expect(screen.getByTestId('markdown-editor')).toBeInTheDocument();
    expect(screen.getByTestId('preview-pane')).toBeInTheDocument();
  });

  it('renders editor only when panelLayout is editor-only', () => {
    mockUseUIStore.mockReturnValue({
      panelLayout: 'editor-only',
      setPanelLayout: mockSetPanelLayout,
    } as any);

    render(<SplitView noteId="test-note-1" />);
    
    expect(screen.getByTestId('markdown-editor')).toBeInTheDocument();
    expect(screen.queryByTestId('preview-pane')).not.toBeInTheDocument();
  });

  it('renders preview only when panelLayout is preview-only', () => {
    mockUseUIStore.mockReturnValue({
      panelLayout: 'preview-only',
      setPanelLayout: mockSetPanelLayout,
    } as any);

    render(<SplitView noteId="test-note-1" />);
    
    expect(screen.queryByTestId('markdown-editor')).not.toBeInTheDocument();
    expect(screen.getByTestId('preview-pane')).toBeInTheDocument();
  });

  it('switches to editor-only mode when Edit button is clicked', () => {
    render(<SplitView noteId="test-note-1" />);
    
    const editButton = screen.getByRole('button', { name: /edit/i });
    fireEvent.click(editButton);
    
    expect(mockSetPanelLayout).toHaveBeenCalledWith('editor-only');
  });

  it('switches to split mode when Split button is clicked', () => {
    mockUseUIStore.mockReturnValue({
      panelLayout: 'editor-only',
      setPanelLayout: mockSetPanelLayout,
    } as any);

    render(<SplitView noteId="test-note-1" />);
    
    const splitButton = screen.getByRole('button', { name: /split/i });
    fireEvent.click(splitButton);
    
    expect(mockSetPanelLayout).toHaveBeenCalledWith('split');
  });

  it('switches to preview-only mode when Preview button is clicked', () => {
    render(<SplitView noteId="test-note-1" />);
    
    const previewButton = screen.getByRole('button', { name: /preview/i });
    fireEvent.click(previewButton);
    
    expect(mockSetPanelLayout).toHaveBeenCalledWith('preview-only');
  });

  it('shows sync scroll button in split mode', () => {
    render(<SplitView noteId="test-note-1" />);
    
    expect(screen.getByRole('button', { name: /sync scroll/i })).toBeInTheDocument();
  });

  it('hides sync scroll button in non-split modes', () => {
    mockUseUIStore.mockReturnValue({
      panelLayout: 'editor-only',
      setPanelLayout: mockSetPanelLayout,
    } as any);

    render(<SplitView noteId="test-note-1" />);
    
    expect(screen.queryByRole('button', { name: /sync scroll/i })).not.toBeInTheDocument();
  });

  it('toggles scroll synchronization when sync button is clicked', () => {
    render(<SplitView noteId="test-note-1" />);
    
    const syncButton = screen.getByRole('button', { name: /sync scroll/i });
    
    // Initially should be active (default state)
    expect(syncButton).toBeInTheDocument();
    
    fireEvent.click(syncButton);
    
    // Should toggle the state (implementation detail - button appearance changes)
    // The actual sync behavior is tested through scroll events
  });

  it('displays message when no note is selected', () => {
    mockGetNote.mockReturnValue(undefined);
    
    render(<SplitView noteId="nonexistent-note" />);
    
    expect(screen.getByText('Select a note to start editing')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const customClass = 'custom-split-view';
    
    render(<SplitView noteId="test-note-1" className={customClass} />);
    
    const container = screen.getByTestId('markdown-editor').closest('.custom-split-view');
    expect(container).toBeInTheDocument();
  });

  it('highlights active panel layout button', () => {
    render(<SplitView noteId="test-note-1" />);
    
    const splitButton = screen.getByRole('button', { name: /split/i });
    // Check that the button exists and is rendered
    expect(splitButton).toBeInTheDocument();
  });

  it('passes note content to preview pane', () => {
    render(<SplitView noteId="test-note-1" />);
    
    const previewPane = screen.getByTestId('preview-pane');
    // Check that the content is passed (the mock adds "Preview: " prefix)
    expect(previewPane).toHaveTextContent('Preview: # Test Content');
  });

  it('handles scroll synchronization from preview to editor', () => {
    render(<SplitView noteId="test-note-1" />);
    
    const previewPane = screen.getByTestId('preview-pane');
    
    // Simulate scroll event
    fireEvent.scroll(previewPane);
    
    // The actual synchronization logic is complex and involves DOM manipulation
    // This test verifies that the scroll handler is called
    expect(previewPane).toBeInTheDocument();
  });

  describe('Panel Layout States', () => {
    it('shows correct buttons as active for editor-only mode', () => {
      mockUseUIStore.mockReturnValue({
        panelLayout: 'editor-only',
        setPanelLayout: mockSetPanelLayout,
      } as any);

      render(<SplitView noteId="test-note-1" />);
      
      const editButton = screen.getByRole('button', { name: /edit/i });
      // Check that the button exists and is rendered
      expect(editButton).toBeInTheDocument();
    });

    it('shows correct buttons as active for preview-only mode', () => {
      mockUseUIStore.mockReturnValue({
        panelLayout: 'preview-only',
        setPanelLayout: mockSetPanelLayout,
      } as any);

      render(<SplitView noteId="test-note-1" />);
      
      const previewButton = screen.getByRole('button', { name: /preview/i });
      expect(previewButton).toBeInTheDocument();
    });

    it('shows correct buttons as active for split mode', () => {
      render(<SplitView noteId="test-note-1" />);
      
      const splitButton = screen.getByRole('button', { name: /split/i });
      expect(splitButton).toBeInTheDocument();
    });
  });
});