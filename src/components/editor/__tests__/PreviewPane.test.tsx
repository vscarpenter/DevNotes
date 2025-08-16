/**
 * PreviewPane Component Tests
 * Tests markdown rendering and preview functionality
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { PreviewPane } from '../PreviewPane';
import { useUIStore } from '../../../stores/uiStore';

// Mock the UI store
vi.mock('../../../stores/uiStore');

const mockUseUIStore = vi.mocked(useUIStore);

describe('PreviewPane', () => {
  beforeEach(() => {
    mockUseUIStore.mockReturnValue({
      isDarkMode: false,
      // Add other required store properties as needed
    } as any);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders basic markdown content', () => {
    const content = '# Hello World\n\nThis is a **bold** text.';
    
    render(<PreviewPane content={content} />);
    
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Hello World');
    expect(screen.getByText('bold')).toBeInTheDocument();
  });

  it('renders code blocks with syntax highlighting', () => {
    const content = '```javascript\nconst hello = "world";\nconsole.log(hello);\n```';
    
    render(<PreviewPane content={content} />);
    
    // Check for the presence of code elements with syntax highlighting
    expect(screen.getByText('const')).toBeInTheDocument();
    expect(screen.getByText('"world"')).toBeInTheDocument();
    expect(screen.getByText('console')).toBeInTheDocument();
  });

  it('renders inline code', () => {
    const content = 'Use the `console.log()` function to debug.';
    
    render(<PreviewPane content={content} />);
    
    expect(screen.getByText('console.log()')).toBeInTheDocument();
  });

  it('renders tables correctly', () => {
    const content = `
| Name | Age | City |
|------|-----|------|
| John | 30  | NYC  |
| Jane | 25  | LA   |
    `;
    
    render(<PreviewPane content={content} />);
    
    expect(screen.getByRole('table')).toBeInTheDocument();
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('John')).toBeInTheDocument();
  });

  it('renders lists correctly', () => {
    const content = `
## Unordered List
- Item 1
- Item 2
- Item 3

## Ordered List
1. First item
2. Second item
3. Third item
    `;
    
    render(<PreviewPane content={content} />);
    
    expect(screen.getByText('Item 1')).toBeInTheDocument();
    expect(screen.getByText('First item')).toBeInTheDocument();
  });

  it('renders task lists', () => {
    const content = `
- [x] Completed task
- [ ] Incomplete task
    `;
    
    render(<PreviewPane content={content} />);
    
    expect(screen.getByText('Completed task')).toBeInTheDocument();
    expect(screen.getByText('Incomplete task')).toBeInTheDocument();
  });

  it('renders blockquotes', () => {
    const content = '> This is a blockquote\n> with multiple lines';
    
    render(<PreviewPane content={content} />);
    
    expect(screen.getByText(/This is a blockquote/)).toBeInTheDocument();
  });

  it('renders links correctly', () => {
    const content = '[GitHub](https://github.com)';
    
    render(<PreviewPane content={content} />);
    
    const link = screen.getByRole('link', { name: 'GitHub' });
    expect(link).toHaveAttribute('href', 'https://github.com');
  });

  it('handles scroll events', () => {
    const onScroll = vi.fn();
    const content = '# Test Content';
    
    render(<PreviewPane content={content} onScroll={onScroll} />);
    
    const previewPane = screen.getByTestId('preview-pane');
    
    // Mock scroll properties
    Object.defineProperty(previewPane, 'scrollTop', { value: 100, writable: true });
    Object.defineProperty(previewPane, 'scrollHeight', { value: 500, writable: true });
    
    fireEvent.scroll(previewPane);
    
    expect(onScroll).toHaveBeenCalledWith(100, 500);
  });

  it('applies dark mode styles', () => {
    mockUseUIStore.mockReturnValue({
      isDarkMode: true,
    } as any);

    const content = '# Dark Mode Test';
    
    render(<PreviewPane content={content} />);
    
    const previewPane = screen.getByTestId('preview-pane');
    expect(previewPane).toHaveClass('dark');
  });

  it('applies light mode styles', () => {
    mockUseUIStore.mockReturnValue({
      isDarkMode: false,
    } as any);

    const content = '# Light Mode Test';
    
    render(<PreviewPane content={content} />);
    
    const previewPane = screen.getByTestId('preview-pane');
    expect(previewPane).toHaveClass('light');
  });

  it('handles markdown processing errors gracefully', () => {
    // Mock console.error to avoid test output noise
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    // Create content that might cause processing issues
    const problematicContent = '```\nunclosed code block';
    
    render(<PreviewPane content={problematicContent} />);
    
    // Should still render something, even if there's an error
    expect(screen.getByTestId('preview-pane')).toBeInTheDocument();
    
    consoleSpy.mockRestore();
  });

  it('renders headings with proper hierarchy', () => {
    const content = `
# Heading 1
## Heading 2
### Heading 3
#### Heading 4
##### Heading 5
###### Heading 6
    `;
    
    render(<PreviewPane content={content} />);
    
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Heading 1');
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Heading 2');
    expect(screen.getByRole('heading', { level: 3 })).toHaveTextContent('Heading 3');
    expect(screen.getByRole('heading', { level: 4 })).toHaveTextContent('Heading 4');
    expect(screen.getByRole('heading', { level: 5 })).toHaveTextContent('Heading 5');
    expect(screen.getByRole('heading', { level: 6 })).toHaveTextContent('Heading 6');
  });

  it('renders emphasis and strong text', () => {
    const content = 'This is *italic* and **bold** and ***bold italic*** text.';
    
    render(<PreviewPane content={content} />);
    
    expect(screen.getByText('italic')).toBeInTheDocument();
    expect(screen.getByText('bold')).toBeInTheDocument();
    expect(screen.getByText('bold italic')).toBeInTheDocument();
  });

  it('handles empty content', () => {
    render(<PreviewPane content="" />);
    
    const previewPane = screen.getByTestId('preview-pane');
    expect(previewPane).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const content = '# Test';
    const customClass = 'custom-preview-class';
    
    render(<PreviewPane content={content} className={customClass} />);
    
    const previewPane = screen.getByTestId('preview-pane');
    expect(previewPane).toHaveClass(customClass);
  });
});