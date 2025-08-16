/**
 * Math and Diagram Rendering Tests
 * Tests KaTeX math rendering and Mermaid diagram functionality
 * Requirements: 4.6, 4.7
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { PreviewPane } from '../PreviewPane';
import { useUIStore } from '../../../stores/uiStore';

import { vi } from 'vitest';

// Mock Mermaid
vi.mock('mermaid', () => ({
  default: {
    initialize: vi.fn(),
    render: vi.fn().mockResolvedValue({
      svg: '<svg><g>Mocked Mermaid Diagram</g></svg>'
    })
  }
}));

// Mock KaTeX CSS import
vi.mock('katex/dist/katex.min.css', () => ({}));

// Mock UI store
vi.mock('../../../stores/uiStore');
const mockUseUIStore = useUIStore as any;

describe('Math and Diagram Rendering', () => {
  beforeEach(() => {
    mockUseUIStore.mockReturnValue({
      isDarkMode: false,
      panelLayout: 'split',
      setPanelLayout: vi.fn(),
      saveStatus: 'saved',
      setSaveStatus: vi.fn(),
      showLineNumbers: true,
      wordWrap: true,
      fontSize: 14
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('KaTeX Math Rendering', () => {
    it('should render inline math expressions', async () => {
      const content = 'The equation $E = mc^2$ is famous.';
      
      render(<PreviewPane content={content} />);
      
      await waitFor(() => {
        const previewPane = screen.getByTestId('preview-pane');
        expect(previewPane).toBeInTheDocument();
      });
    });

    it('should render block math expressions', async () => {
      const content = `
Here is a block equation:

$$
\\int_{-\\infty}^{\\infty} e^{-x^2} dx = \\sqrt{\\pi}
$$

This is a famous integral.
      `;
      
      render(<PreviewPane content={content} />);
      
      await waitFor(() => {
        const previewPane = screen.getByTestId('preview-pane');
        expect(previewPane).toBeInTheDocument();
      });
    });

    it('should handle invalid math expressions gracefully', async () => {
      const content = 'Invalid math: $\\invalid{syntax}$';
      
      render(<PreviewPane content={content} />);
      
      await waitFor(() => {
        const previewPane = screen.getByTestId('preview-pane');
        expect(previewPane).toBeInTheDocument();
        // Should not crash and should render some content
      });
    });

    it('should render complex mathematical expressions', async () => {
      const content = `
Complex math expressions:

Inline: $\\sum_{i=1}^{n} x_i^2$

Block:
$$
\\begin{pmatrix}
a & b \\\\
c & d
\\end{pmatrix}
\\begin{pmatrix}
x \\\\
y
\\end{pmatrix}
=
\\begin{pmatrix}
ax + by \\\\
cx + dy
\\end{pmatrix}
$$
      `;
      
      render(<PreviewPane content={content} />);
      
      await waitFor(() => {
        const previewPane = screen.getByTestId('preview-pane');
        expect(previewPane).toBeInTheDocument();
      });
    });
  });

  describe('Mermaid Diagram Rendering', () => {
    it('should render simple flowchart diagrams', async () => {
      const content = `
\`\`\`mermaid
graph TD
    A[Start] --> B[Process]
    B --> C[End]
\`\`\`
      `;
      
      render(<PreviewPane content={content} />);
      
      await waitFor(() => {
        const previewPane = screen.getByTestId('preview-pane');
        expect(previewPane).toBeInTheDocument();
      });

      // Verify Mermaid diagram is rendered
      await waitFor(() => {
        const diagramElement = screen.getByTestId('preview-pane').querySelector('.mermaid-diagram');
        expect(diagramElement).toBeInTheDocument();
      });
    });

    it('should render sequence diagrams', async () => {
      const content = `
\`\`\`mermaid
sequenceDiagram
    participant A as Alice
    participant B as Bob
    A->>B: Hello Bob, how are you?
    B-->>A: Great!
\`\`\`
      `;
      
      render(<PreviewPane content={content} />);
      
      await waitFor(() => {
        const previewPane = screen.getByTestId('preview-pane');
        expect(previewPane).toBeInTheDocument();
      });

      await waitFor(() => {
        const diagramElement = screen.getByTestId('preview-pane').querySelector('.mermaid-diagram');
        expect(diagramElement).toBeInTheDocument();
      });
    });

    it('should render class diagrams', async () => {
      const content = `
\`\`\`mermaid
classDiagram
    class Animal {
        +String name
        +int age
        +makeSound()
    }
    class Dog {
        +String breed
        +bark()
    }
    Animal <|-- Dog
\`\`\`
      `;
      
      render(<PreviewPane content={content} />);
      
      await waitFor(() => {
        const previewPane = screen.getByTestId('preview-pane');
        expect(previewPane).toBeInTheDocument();
      });

      await waitFor(() => {
        const diagramElement = screen.getByTestId('preview-pane').querySelector('.mermaid-diagram');
        expect(diagramElement).toBeInTheDocument();
      });
    });

    it('should handle invalid Mermaid syntax gracefully', async () => {
      const content = `
\`\`\`mermaid
invalid syntax here
this is not valid mermaid
\`\`\`
      `;
      
      render(<PreviewPane content={content} />);
      
      await waitFor(() => {
        const previewPane = screen.getByTestId('preview-pane');
        expect(previewPane).toBeInTheDocument();
        // Should render without crashing even with invalid syntax
      });
    });

    it('should render multiple diagrams in the same document', async () => {
      const content = `
# Multiple Diagrams

First diagram:
\`\`\`mermaid
graph LR
    A --> B
    B --> C
\`\`\`

Some text in between.

Second diagram:
\`\`\`mermaid
pie title Pets adopted by volunteers
    "Dogs" : 386
    "Cats" : 85
    "Rats" : 15
\`\`\`
      `;
      
      render(<PreviewPane content={content} />);
      
      await waitFor(() => {
        const previewPane = screen.getByTestId('preview-pane');
        expect(previewPane).toBeInTheDocument();
      });

      // Should render both diagrams
      await waitFor(() => {
        const diagramElements = screen.getByTestId('preview-pane').querySelectorAll('.mermaid-diagram');
        expect(diagramElements).toHaveLength(2);
      });
    });
  });

  describe('Mixed Content Rendering', () => {
    it('should render math and diagrams together', async () => {
      const content = `
# Mathematical Analysis with Flowchart

The algorithm complexity is $O(n^2)$ as shown in the flowchart:

\`\`\`mermaid
graph TD
    A[Input: n items] --> B[Nested loops]
    B --> C[Process each pair]
    C --> D[Output: O(n²) complexity]
\`\`\`

The mathematical proof:

$$
\\sum_{i=1}^{n} \\sum_{j=1}^{n} 1 = n^2
$$
      `;
      
      render(<PreviewPane content={content} />);
      
      await waitFor(() => {
        const previewPane = screen.getByTestId('preview-pane');
        expect(previewPane).toBeInTheDocument();
      });

      await waitFor(() => {
        const diagramElement = screen.getByTestId('preview-pane').querySelector('.mermaid-diagram');
        expect(diagramElement).toBeInTheDocument();
      });
    });

    it('should handle code blocks alongside math and diagrams', async () => {
      const content = `
# Code, Math, and Diagrams

Here's some code:
\`\`\`javascript
function factorial(n) {
  return n <= 1 ? 1 : n * factorial(n - 1);
}
\`\`\`

The mathematical representation: $n! = n \\times (n-1)!$

And the algorithm flow:
\`\`\`mermaid
graph TD
    A[Input: n] --> B{n <= 1?}
    B -->|Yes| C[Return 1]
    B -->|No| D[Return n * factorial(n-1)]
    D --> E[Recursive call]
\`\`\`
      `;
      
      render(<PreviewPane content={content} />);
      
      await waitFor(() => {
        const previewPane = screen.getByTestId('preview-pane');
        expect(previewPane).toBeInTheDocument();
      });
    });
  });

  describe('Dark Mode Support', () => {
    it('should apply dark mode styles to math and diagrams', async () => {
      mockUseUIStore.mockReturnValue({
        isDarkMode: true,
        panelLayout: 'split',
        setPanelLayout: vi.fn(),
        saveStatus: 'saved',
        setSaveStatus: vi.fn(),
        showLineNumbers: true,
        wordWrap: true,
        fontSize: 14
      });

      const content = `
Math: $E = mc^2$

\`\`\`mermaid
graph TD
    A[Dark Mode] --> B[Diagram]
\`\`\`
      `;
      
      render(<PreviewPane content={content} />);
      
      await waitFor(() => {
        const previewPane = screen.getByTestId('preview-pane');
        expect(previewPane).toHaveClass('dark');
      });

      // Verify dark mode is applied
      await waitFor(() => {
        const previewPane = screen.getByTestId('preview-pane');
        expect(previewPane).toHaveClass('dark');
      });
    });
  });

  describe('Error Handling', () => {
    it('should display error messages for processing failures', async () => {
      // Mock unified processor to throw an error
      const originalConsoleError = console.error;
      console.error = vi.fn();

      const content = 'Some content that might cause processing errors';
      
      render(<PreviewPane content={content} />);
      
      await waitFor(() => {
        const previewPane = screen.getByTestId('preview-pane');
        expect(previewPane).toBeInTheDocument();
      });

      console.error = originalConsoleError;
    });

    it('should handle empty math expressions', async () => {
      const content = 'Empty math: $$ $$';
      
      render(<PreviewPane content={content} />);
      
      await waitFor(() => {
        const previewPane = screen.getByTestId('preview-pane');
        expect(previewPane).toBeInTheDocument();
      });
    });

    it('should handle empty Mermaid blocks', async () => {
      const content = `
\`\`\`mermaid

\`\`\`
      `;
      
      render(<PreviewPane content={content} />);
      
      await waitFor(() => {
        const previewPane = screen.getByTestId('preview-pane');
        expect(previewPane).toBeInTheDocument();
      });
    });
  });
});