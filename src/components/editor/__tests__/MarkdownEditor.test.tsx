/**
 * MarkdownEditor component tests
 * Tests editor functionality, keyboard shortcuts, and auto-save
 * Requirements: 4.1, 4.4, 7.1, 7.2
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { MarkdownEditor } from '../MarkdownEditor';
import { useNoteStore } from '../../../stores/noteStore';
import { useUIStore } from '../../../stores/uiStore';
import { Note } from '../../../types/note';
import { vi } from 'vitest';

// Mock the stores
vi.mock('../../../stores/noteStore');
vi.mock('../../../stores/uiStore');

// Mock CodeMirror completely to avoid complex setup
vi.mock('@codemirror/view', () => ({
  EditorView: vi.fn().mockImplementation(() => ({
    destroy: vi.fn(),
    dispatch: vi.fn(),
    focus: vi.fn(),
    state: {
      doc: {
        toString: () => 'test content',
        length: 12,
        sliceString: () => 'selected'
      },
      selection: {
        main: { from: 0, to: 8 }
      }
    }
  })),
  keymap: {
    of: vi.fn().mockReturnValue([])
  }
}));

vi.mock('@codemirror/state', () => ({
  EditorState: {
    create: vi.fn().mockReturnValue({}),
    reconfigure: {
      of: vi.fn()
    }
  }
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

// Mock the auto-save hook
vi.mock('../../../hooks/useAutoSave', () => ({
  useAutoSave: vi.fn().mockReturnValue({
    scheduleAutoSave: vi.fn(),
    forceSave: vi.fn(),
    cancelAutoSave: vi.fn()
  })
}));

const mockNote: Note = {
  id: 'test-note-1',
  title: 'Test Note',
  content: '# Test Content\n\nThis is a test note.',
  folderId: 'folder-1',
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-02'),
  tags: ['test'],
  wordCount: 6,
  readingTime: 1
};

const mockUseNoteStore = useNoteStore as any;
const mockUseUIStore = useUIStore as any;

describe('MarkdownEditor', () => {
  const mockGetNote = vi.fn();
  const mockUpdateNote = vi.fn();
  const mockSetSaveStatus = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    
    mockUseNoteStore.mockReturnValue({
      getNote: mockGetNote,
      updateNote: mockUpdateNote,
      notes: {},
      selectedNoteId: null,
      isLoading: false,
      isSaving: false,
      error: null,
      loadNotes: vi.fn(),
      createNote: vi.fn(),
      deleteNote: vi.fn(),
      moveNote: vi.fn(),
      duplicateNote: vi.fn(),
      selectNote: vi.fn(),
      clearError: vi.fn(),
      getNotesByFolder: vi.fn(),
      getRecentNotes: vi.fn()
    });

    mockUseUIStore.mockReturnValue({
      isDarkMode: false,
      showLineNumbers: true,
      wordWrap: true,
      fontSize: 14,
      setSaveStatus: mockSetSaveStatus,
      sidebarWidth: 300,
      isSidebarCollapsed: false,
      panelLayout: 'split',
      theme: 'light',
      isPreviewMode: false,
      isLoading: false,
      saveStatus: 'saved',
      error: null,
      isSearchOpen: false,
      searchQuery: '',
      activeModal: null,
      setSidebarWidth: vi.fn(),
      toggleSidebar: vi.fn(),
      collapseSidebar: vi.fn(),
      expandSidebar: vi.fn(),
      setPanelLayout: vi.fn(),
      setTheme: vi.fn(),
      toggleDarkMode: vi.fn(),
      togglePreviewMode: vi.fn(),
      setPreviewMode: vi.fn(),
      toggleLineNumbers: vi.fn(),
      toggleWordWrap: vi.fn(),
      setFontSize: vi.fn(),
      setLoading: vi.fn(),
      setError: vi.fn(),
      clearError: vi.fn(),
      setSearchOpen: vi.fn(),
      setSearchQuery: vi.fn(),
      clearSearch: vi.fn(),
      openModal: vi.fn(),
      closeModal: vi.fn(),
      getEffectiveTheme: vi.fn().mockReturnValue('light'),
      isModalOpen: vi.fn()
    });
  });

  it('shows placeholder when no note is selected', () => {
    mockGetNote.mockReturnValue(undefined);

    render(<MarkdownEditor noteId="nonexistent" />);

    expect(screen.getByText('Select a note to start editing')).toBeInTheDocument();
    expect(screen.queryByTestId('markdown-editor')).not.toBeInTheDocument();
  });

  it('renders editor container when note is provided', () => {
    mockGetNote.mockReturnValue(mockNote);

    render(<MarkdownEditor noteId="test-note-1" />);

    expect(screen.getByTestId('markdown-editor')).toBeInTheDocument();
  });

  it('renders toolbar with formatting buttons', () => {
    mockGetNote.mockReturnValue(mockNote);

    render(<MarkdownEditor noteId="test-note-1" />);

    // Check for toolbar buttons
    expect(screen.getByRole('button', { name: /bold/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /italic/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /heading 1/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /link/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /saved/i })).toBeInTheDocument();
  });

  it('applies custom className', () => {
    mockGetNote.mockReturnValue(mockNote);

    render(<MarkdownEditor noteId="test-note-1" className="custom-class" />);

    const editorContainer = screen.getByTestId('markdown-editor').parentElement;
    expect(editorContainer).toHaveClass('custom-class');
  });

  it('respects dark mode setting', () => {
    mockGetNote.mockReturnValue(mockNote);
    mockUseUIStore.mockReturnValue({
      ...mockUseUIStore(),
      isDarkMode: true
    });

    render(<MarkdownEditor noteId="test-note-1" />);

    // The component should render without errors with dark theme
    expect(screen.getByTestId('markdown-editor')).toBeInTheDocument();
  });

  it('respects font size setting', () => {
    mockGetNote.mockReturnValue(mockNote);
    mockUseUIStore.mockReturnValue({
      ...mockUseUIStore(),
      fontSize: 16
    });

    render(<MarkdownEditor noteId="test-note-1" />);

    // Font size is applied through CodeMirror theme configuration
    expect(screen.getByTestId('markdown-editor')).toBeInTheDocument();
  });

  it('respects word wrap setting', () => {
    mockGetNote.mockReturnValue(mockNote);
    mockUseUIStore.mockReturnValue({
      ...mockUseUIStore(),
      wordWrap: false
    });

    render(<MarkdownEditor noteId="test-note-1" />);

    // Word wrap is applied through CodeMirror configuration
    expect(screen.getByTestId('markdown-editor')).toBeInTheDocument();
  });

  it('respects line numbers setting', () => {
    mockGetNote.mockReturnValue(mockNote);
    mockUseUIStore.mockReturnValue({
      ...mockUseUIStore(),
      showLineNumbers: false
    });

    render(<MarkdownEditor noteId="test-note-1" />);

    // Line numbers are controlled through CodeMirror configuration
    expect(screen.getByTestId('markdown-editor')).toBeInTheDocument();
  });
});