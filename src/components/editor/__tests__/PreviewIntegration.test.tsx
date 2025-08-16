/**
 * Preview Integration Tests
 * Tests the complete preview functionality integration
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PreviewPane } from '../PreviewPane';
import { SplitView } from '../SplitView';
import { useUIStore } from '../../../stores/uiStore';
import { useNoteStore } from '../../../stores/noteStore';

// Mock the stores
vi.mock('../../../stores/uiStore');
vi.mock('../../../stores/noteStore');

// Mock the MarkdownEditor component
vi.mock('../MarkdownEditor', () => ({
  MarkdownEditor: ({ noteId }: { noteId: string }) => (
    <div data-testid="markdown-editor">
      <div>Editor for note {noteId}</div>
      <textarea 
        data-testid="editor-textarea"
        onChange={(e) => {
          // Simulate content changes
          const mockNote = mockUseNoteStore.getState().getNote(noteId);
          if (mockNote) {
            mockNote.content = e.target.value;
          }
        }}
      />
    </div>
  )
}));

const mockUseUIStore = vi.mocked(useUIStore);
const mockUseNoteStore = vi.mocked(useNoteStore);

const createMockNote = (content: string) => ({
  id: 'test-note-1',
  title: 'Test Note',
  content,
  folderId: 'folder-1',
  createdAt: new Date(),
  updatedAt: new Date(),
  wordCount: content.split(' ').length,
  readingTime: Math.ceil(content.split(' ').length / 200)
});

describe('Preview Integration', () => {
  const mockSetPanelLayout = vi.fn();
  const mockGetNote = vi.fn();

  beforeEach(() => {
    mockUseUIStore.mockReturnValue({
      panelLayout: 'split',
      setPanelLayout: mockSetPanelLayout,
      isDarkMode: false,
    } as any);

    mockUseNoteStore.mockReturnValue({
      getNote: mockGetNote,
    } as any);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Markdown Rendering', () => {
    it('renders complex markdown content correctly', () => {
      const complexMarkdown = `
# Main Title

## Subtitle

This is a paragraph with **bold** and *italic* text.

### Code Example

\`\`\`javascript
const hello = "world";
console.log(hello);
\`\`\`

### List Example

- Item 1
- Item 2
  - Nested item
- Item 3

### Table Example

| Name | Value |
|------|-------|
| Test | 123   |

### Blockquote

> This is a quote
> with multiple lines

### Task List

- [x] Completed task
- [ ] Incomplete task
      `;

      mockGetNote.mockReturnValue(createMockNote(complexMarkdown));

      render(<PreviewPane content={complexMarkdown} />);

      // Check for various markdown elements
      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Main Title');
      expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Subtitle');
      expect(screen.getByRole('heading', { level: 3, name: /code example/i })).toBeInTheDocument();
      
      // Check for formatted text
      expect(screen.getByText('bold')).toBeInTheDocument();
      expect(screen.getByText('italic')).toBeInTheDocument();
      
      // Check for code
      expect(screen.getByText('const')).toBeInTheDocument();
      expect(screen.getByText('"world"')).toBeInTheDocument();
      
      // Check for list items
      expect(screen.getByText('Item 1')).toBeInTheDocument();
      expect(screen.getByText('Nested item')).toBeInTheDocument();
      
      // Check for table
      expect(screen.getByRole('table')).toBeInTheDocument();
      expect(screen.getByText('Name')).toBeInTheDocument();
      expect(screen.getByText('Test')).toBeInTheDocument();
      
      // Check for blockquote
      expect(screen.getByText(/This is a quote/)).toBeInTheDocument();
      
      // Check for task list
      expect(screen.getByText('Completed task')).toBeInTheDocument();
      expect(screen.getByText('Incomplete task')).toBeInTheDocument();
    });

    it('handles syntax highlighting for different languages', () => {
      const codeMarkdown = `
\`\`\`python
def hello():
    print("Hello, World!")
\`\`\`

\`\`\`typescript
interface User {
  name: string;
  age: number;
}
\`\`\`

\`\`\`css
.container {
  display: flex;
  justify-content: center;
}
\`\`\`
      `;

      render(<PreviewPane content={codeMarkdown} />);

      // Check for Python syntax
      expect(screen.getByText('def')).toBeInTheDocument();
      expect(screen.getByText('print')).toBeInTheDocument();

      // Check for TypeScript syntax
      expect(screen.getByText('interface')).toBeInTheDocument();
      expect(screen.getByText('string')).toBeInTheDocument();

      // Check for CSS syntax
      expect(screen.getByText('.container')).toBeInTheDocument();
      expect(screen.getByText('display')).toBeInTheDocument();
    });
  });

  describe('Split View Integration', () => {
    it('synchronizes content between editor and preview', async () => {
      const initialContent = '# Initial Content';
      mockGetNote.mockReturnValue(createMockNote(initialContent));

      render(<SplitView noteId="test-note-1" />);

      // Verify initial content is displayed
      expect(screen.getByTestId('markdown-editor')).toBeInTheDocument();
      expect(screen.getByTestId('preview-pane')).toBeInTheDocument();
      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Initial Content');
    });

    it('switches between different view modes', () => {
      mockGetNote.mockReturnValue(createMockNote('# Test Content'));

      render(<SplitView noteId="test-note-1" />);

      // Initially in split mode
      expect(screen.getByTestId('markdown-editor')).toBeInTheDocument();
      expect(screen.getByTestId('preview-pane')).toBeInTheDocument();

      // Switch to editor-only mode
      const editButton = screen.getByRole('button', { name: /edit/i });
      fireEvent.click(editButton);
      expect(mockSetPanelLayout).toHaveBeenCalledWith('editor-only');

      // Switch to preview-only mode
      const previewButton = screen.getByRole('button', { name: /preview/i });
      fireEvent.click(previewButton);
      expect(mockSetPanelLayout).toHaveBeenCalledWith('preview-only');
    });

    it('handles scroll synchronization toggle', () => {
      mockGetNote.mockReturnValue(createMockNote('# Test Content'));

      render(<SplitView noteId="test-note-1" />);

      const syncButton = screen.getByRole('button', { name: /sync scroll/i });
      expect(syncButton).toBeInTheDocument();

      // Toggle sync
      fireEvent.click(syncButton);
      // The button should still be there (state change is internal)
      expect(syncButton).toBeInTheDocument();
    });
  });

  describe('Theme Integration', () => {
    it('applies dark mode styles correctly', () => {
      mockUseUIStore.mockReturnValue({
        panelLayout: 'preview-only',
        setPanelLayout: mockSetPanelLayout,
        isDarkMode: true,
      } as any);

      const content = '# Dark Mode Test';
      render(<PreviewPane content={content} />);

      const previewPane = screen.getByTestId('preview-pane');
      expect(previewPane).toHaveClass('dark');
    });

    it('applies light mode styles correctly', () => {
      mockUseUIStore.mockReturnValue({
        panelLayout: 'preview-only',
        setPanelLayout: mockSetPanelLayout,
        isDarkMode: false,
      } as any);

      const content = '# Light Mode Test';
      render(<PreviewPane content={content} />);

      const previewPane = screen.getByTestId('preview-pane');
      expect(previewPane).toHaveClass('light');
    });
  });

  describe('Error Handling', () => {
    it('handles malformed markdown gracefully', () => {
      const malformedMarkdown = `
# Unclosed Header
[Unclosed link](
\`\`\`
Unclosed code block
**Unclosed bold
      `;

      render(<PreviewPane content={malformedMarkdown} />);

      // Should still render something without crashing
      const previewPane = screen.getByTestId('preview-pane');
      expect(previewPane).toBeInTheDocument();
    });

    it('handles empty content', () => {
      render(<PreviewPane content="" />);

      const previewPane = screen.getByTestId('preview-pane');
      expect(previewPane).toBeInTheDocument();
    });

    it('handles very large content', () => {
      const largeContent = '# Large Content\n\n' + 'This is a line of text.\n'.repeat(1000);

      render(<PreviewPane content={largeContent} />);

      const previewPane = screen.getByTestId('preview-pane');
      expect(previewPane).toBeInTheDocument();
      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Large Content');
    });
  });

  describe('Performance', () => {
    it('renders quickly with moderate content', () => {
      const moderateContent = `
# Performance Test

${'## Section\n\nContent paragraph.\n\n'.repeat(50)}
      `;

      const startTime = performance.now();
      render(<PreviewPane content={moderateContent} />);
      const endTime = performance.now();

      // Should render in reasonable time (less than 100ms)
      expect(endTime - startTime).toBeLessThan(100);

      // Verify content is rendered
      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Performance Test');
    });
  });
});