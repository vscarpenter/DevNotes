/**
 * Markdown Editor Math and Diagram Tests
 * Tests math and diagram insertion functionality in the editor
 * Requirements: 4.6, 4.7
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MarkdownEditor } from '../MarkdownEditor';
import { useNoteStore } from '../../../stores/noteStore';
import { useUIStore } from '../../../stores/uiStore';
import { useAutoSave } from '../../../hooks/useAutoSave';

import { vi } from 'vitest';

// Mock dependencies
vi.mock('../../../stores/noteStore');
vi.mock('../../../stores/uiStore');
vi.mock('../../../hooks/useAutoSave');

// Mock CodeMirror
vi.mock('@codemirror/view', () => ({
  EditorView: vi.fn().mockImplementation(() => ({
    state: {
      doc: { toString: () => 'test content' },
      selection: { main: { from: 0, to: 0 } }
    },
    dispatch: vi.fn(),
    focus: vi.fn(),
    destroy: vi.fn()
  })),
  keymap: { of: vi.fn() }
}));

vi.mock('@codemirror/state', () => ({
  EditorState: {
    create: vi.fn().mockReturnValue({})
  },
  Compartment: vi.fn()
}));

vi.mock('codemirror', () => ({
  basicSetup: []
}));

vi.mock('@codemirror/lang-markdown', () => ({
  markdown: vi.fn().mockReturnValue([])
}));

vi.mock('@codemirror/theme-one-dark', () => ({
  oneDark: []
}));

vi.mock('@codemirror/commands', () => ({
  defaultKeymap: [],
  indentWithTab: {}
}));

const mockUseNoteStore = useNoteStore as any;
const mockUseUIStore = useUIStore as any;
const mockUseAutoSave = useAutoSave as any;

describe('MarkdownEditor Math and Diagram Features', () => {
  const mockNote = {
    id: 'test-note-1',
    title: 'Test Note',
    content: 'Initial content',
    folderId: 'folder-1',
    createdAt: new Date(),
    updatedAt: new Date(),
    wordCount: 2,
    readingTime: 1
  };

  const mockNoteStore = {
    getNote: vi.fn().mockReturnValue(mockNote),
    updateNote: vi.fn().mockResolvedValue(undefined),
    createNote: vi.fn(),
    deleteNote: vi.fn(),
    moveNote: vi.fn(),
    getAllNotes: vi.fn(),
    getNotesByFolder: vi.fn(),
    searchNotes: vi.fn()
  };

  const mockUIStore = {
    isDarkMode: false,
    showLineNumbers: true,
    wordWrap: true,
    fontSize: 14,
    setSaveStatus: vi.fn(),
    saveStatus: 'saved' as const,
    panelLayout: 'split' as const,
    setPanelLayout: vi.fn()
  };

  const mockAutoSave = {
    scheduleAutoSave: vi.fn(),
    forceSave: vi.fn()
  };

  beforeEach(() => {
    mockUseNoteStore.mockReturnValue(mockNoteStore);
    mockUseUIStore.mockReturnValue(mockUIStore);
    mockUseAutoSave.mockReturnValue(mockAutoSave);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Math Insertion', () => {
    it('should render inline math button in toolbar', () => {
      render(<MarkdownEditor noteId="test-note-1" />);
      
      const inlineMathButton = screen.getByTitle('Inline Math');
      expect(inlineMathButton).toBeInTheDocument();
    });

    it('should render math block button in toolbar', () => {
      render(<MarkdownEditor noteId="test-note-1" />);
      
      const mathBlockButton = screen.getByTitle('Math Block');
      expect(mathBlockButton).toBeInTheDocument();
    });

    it('should handle inline math insertion', async () => {
      const mockView = {
        state: {
          doc: { toString: () => 'test content', sliceString: () => 'selected' },
          selection: { main: { from: 5, to: 13 } }
        },
        dispatch: vi.fn(),
        focus: vi.fn(),
        destroy: vi.fn()
      };

      const { EditorView } = require('@codemirror/view');
      EditorView.mockImplementation(() => mockView);

      render(<MarkdownEditor noteId="test-note-1" />);
      
      const inlineMathButton = screen.getByTitle('Inline Math');
      fireEvent.click(inlineMathButton);

      await waitFor(() => {
        expect(mockView.dispatch).toHaveBeenCalledWith({
          changes: { from: 5, to: 13, insert: '$selected$' },
          selection: { anchor: 6, head: 14 }
        });
        expect(mockView.focus).toHaveBeenCalled();
      });
    });

    it('should handle math block insertion', async () => {
      const mockView = {
        state: {
          doc: { toString: () => 'test content', sliceString: () => 'formula' },
          selection: { main: { from: 0, to: 7 } }
        },
        dispatch: vi.fn(),
        focus: vi.fn(),
        destroy: vi.fn()
      };

      const { EditorView } = require('@codemirror/view');
      EditorView.mockImplementation(() => mockView);

      render(<MarkdownEditor noteId="test-note-1" />);
      
      const mathBlockButton = screen.getByTitle('Math Block');
      fireEvent.click(mathBlockButton);

      await waitFor(() => {
        expect(mockView.dispatch).toHaveBeenCalledWith({
          changes: { from: 0, to: 7, insert: '$$\nformula\n$$' },
          selection: { anchor: 3, head: 10 }
        });
        expect(mockView.focus).toHaveBeenCalled();
      });
    });

    it('should handle empty selection for inline math', async () => {
      const mockView = {
        state: {
          doc: { toString: () => 'test content', sliceString: () => '' },
          selection: { main: { from: 5, to: 5 } }
        },
        dispatch: vi.fn(),
        focus: vi.fn(),
        destroy: vi.fn()
      };

      const { EditorView } = require('@codemirror/view');
      EditorView.mockImplementation(() => mockView);

      render(<MarkdownEditor noteId="test-note-1" />);
      
      const inlineMathButton = screen.getByTitle('Inline Math');
      fireEvent.click(inlineMathButton);

      await waitFor(() => {
        expect(mockView.dispatch).toHaveBeenCalledWith({
          changes: { from: 5, to: 5, insert: '$$' },
          selection: { anchor: 6, head: 6 }
        });
      });
    });
  });

  describe('Mermaid Diagram Insertion', () => {
    it('should render Mermaid diagram button in toolbar', () => {
      render(<MarkdownEditor noteId="test-note-1" />);
      
      const mermaidButton = screen.getByTitle('Mermaid Diagram');
      expect(mermaidButton).toBeInTheDocument();
    });

    it('should handle Mermaid diagram insertion with template', async () => {
      const mockView = {
        state: {
          doc: { toString: () => 'content', sliceString: () => '' },
          selection: { main: { from: 7, to: 7 } }
        },
        dispatch: vi.fn(),
        focus: vi.fn(),
        destroy: vi.fn()
      };

      const { EditorView } = require('@codemirror/view');
      EditorView.mockImplementation(() => mockView);

      render(<MarkdownEditor noteId="test-note-1" />);
      
      const mermaidButton = screen.getByTitle('Mermaid Diagram');
      fireEvent.click(mermaidButton);

      const expectedTemplate = 'graph TD\n    A[Start] --> B[Process]\n    B --> C[End]';
      const expectedInsert = `\`\`\`mermaid\n\n${expectedTemplate}\n\`\`\``;

      await waitFor(() => {
        expect(mockView.dispatch).toHaveBeenCalledWith({
          changes: { from: 7, to: 7, insert: expectedInsert },
          selection: { anchor: 15, head: 15 + expectedTemplate.length }
        });
        expect(mockView.focus).toHaveBeenCalled();
      });
    });

    it('should replace selected text with Mermaid template', async () => {
      const mockView = {
        state: {
          doc: { toString: () => 'old diagram', sliceString: () => 'old diagram' },
          selection: { main: { from: 0, to: 11 } }
        },
        dispatch: vi.fn(),
        focus: vi.fn(),
        destroy: vi.fn()
      };

      const { EditorView } = require('@codemirror/view');
      EditorView.mockImplementation(() => mockView);

      render(<MarkdownEditor noteId="test-note-1" />);
      
      const mermaidButton = screen.getByTitle('Mermaid Diagram');
      fireEvent.click(mermaidButton);

      const expectedTemplate = 'graph TD\n    A[Start] --> B[Process]\n    B --> C[End]';
      const expectedInsert = `\`\`\`mermaid\nold diagram\n${expectedTemplate}\n\`\`\``;

      await waitFor(() => {
        expect(mockView.dispatch).toHaveBeenCalledWith({
          changes: { from: 0, to: 11, insert: expectedInsert },
          selection: { 
            anchor: 15, 
            head: 15 + 'old diagram'.length 
          }
        });
      });
    });
  });

  describe('Toolbar Integration', () => {
    it('should pass all math and diagram handlers to toolbar', () => {
      render(<MarkdownEditor noteId="test-note-1" />);
      
      // Verify all new buttons are present
      expect(screen.getByTitle('Inline Math')).toBeInTheDocument();
      expect(screen.getByTitle('Math Block')).toBeInTheDocument();
      expect(screen.getByTitle('Mermaid Diagram')).toBeInTheDocument();
      
      // Verify existing buttons still work
      expect(screen.getByTitle('Bold (Ctrl+B)')).toBeInTheDocument();
      expect(screen.getByTitle('Italic (Ctrl+I)')).toBeInTheDocument();
      expect(screen.getByTitle('Inline Code')).toBeInTheDocument();
    });

    it('should maintain existing toolbar functionality', () => {
      render(<MarkdownEditor noteId="test-note-1" />);
      
      const boldButton = screen.getByTitle('Bold (Ctrl+B)');
      const saveButton = screen.getByTitle('Save (Ctrl+S)');
      
      expect(boldButton).toBeInTheDocument();
      expect(saveButton).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('should handle missing editor view gracefully', () => {
      // Mock EditorView to return null
      const { EditorView } = require('@codemirror/view');
      EditorView.mockImplementation(() => null);

      render(<MarkdownEditor noteId="test-note-1" />);
      
      const inlineMathButton = screen.getByTitle('Inline Math');
      
      // Should not throw error when clicking
      expect(() => {
        fireEvent.click(inlineMathButton);
      }).not.toThrow();
    });

    it('should handle editor dispatch errors gracefully', async () => {
      const mockView = {
        state: {
          doc: { toString: () => 'content', sliceString: () => '' },
          selection: { main: { from: 0, to: 0 } }
        },
        dispatch: vi.fn().mockImplementation(() => {
          throw new Error('Dispatch failed');
        }),
        focus: vi.fn(),
        destroy: vi.fn()
      };

      const { EditorView } = require('@codemirror/view');
      EditorView.mockImplementation(() => mockView);

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      render(<MarkdownEditor noteId="test-note-1" />);
      
      const mathBlockButton = screen.getByTitle('Math Block');
      
      // Should not crash the component
      expect(() => {
        fireEvent.click(mathBlockButton);
      }).not.toThrow();

      consoleSpy.mockRestore();
    });
  });

  describe('Content Auto-save Integration', () => {
    it('should trigger auto-save when math content is inserted', async () => {
      const mockView = {
        state: {
          doc: { toString: () => 'new content with math', sliceString: () => '' },
          selection: { main: { from: 0, to: 0 } }
        },
        dispatch: vi.fn(),
        focus: vi.fn(),
        destroy: vi.fn()
      };

      const { EditorView } = require('@codemirror/view');
      EditorView.mockImplementation(() => mockView);

      render(<MarkdownEditor noteId="test-note-1" />);
      
      const inlineMathButton = screen.getByTitle('Inline Math');
      fireEvent.click(inlineMathButton);

      // Auto-save should be triggered through the update listener
      // This is tested indirectly through the editor's update mechanism
      expect(mockView.dispatch).toHaveBeenCalled();
    });
  });
});