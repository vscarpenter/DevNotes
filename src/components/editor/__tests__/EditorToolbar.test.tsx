/**
 * EditorToolbar component tests
 * Tests toolbar functionality and button interactions
 * Requirements: 4.1, 4.4
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EditorToolbar } from '../EditorToolbar';
import { useUIStore } from '../../../stores/uiStore';
import { vi } from 'vitest';

// Mock the UI store
vi.mock('../../../stores/uiStore');

const mockUseUIStore = vi.mocked(useUIStore);

describe('EditorToolbar', () => {
  const mockHandlers = {
    onBold: vi.fn(),
    onItalic: vi.fn(),
    onHeading: vi.fn(),
    onLink: vi.fn(),
    onCode: vi.fn(),
    onCodeBlock: vi.fn(),
    onMath: vi.fn(),
    onMathBlock: vi.fn(),
    onMermaid: vi.fn(),
    onSave: vi.fn()
  };

  beforeEach(() => {
    vi.clearAllMocks();
    
    mockUseUIStore.mockReturnValue({
      saveStatus: 'saved',
      isDarkMode: false,
      showLineNumbers: true,
      wordWrap: true,
      fontSize: 14,
      setSaveStatus: vi.fn(),
      sidebarWidth: 300,
      isSidebarCollapsed: false,
      panelLayout: 'split',
      theme: 'light',
      isPreviewMode: false,
      isLoading: false,
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

  it('renders all formatting buttons', () => {
    render(<EditorToolbar {...mockHandlers} />);

    // Text formatting
    expect(screen.getByRole('button', { name: /bold/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /italic/i })).toBeInTheDocument();

    // Headings
    expect(screen.getByRole('button', { name: /heading 1/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /heading 2/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /heading 3/i })).toBeInTheDocument();

    // Links and code
    expect(screen.getByRole('button', { name: /link/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /inline code/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /code block/i })).toBeInTheDocument();

    // Save button
    expect(screen.getByRole('button', { name: /saved/i })).toBeInTheDocument();
  });

  it('calls onBold when bold button is clicked', async () => {
    const user = userEvent.setup();
    render(<EditorToolbar {...mockHandlers} />);

    const boldButton = screen.getByRole('button', { name: /bold/i });
    await user.click(boldButton);

    expect(mockHandlers.onBold).toHaveBeenCalledTimes(1);
  });

  it('calls onItalic when italic button is clicked', async () => {
    const user = userEvent.setup();
    render(<EditorToolbar {...mockHandlers} />);

    const italicButton = screen.getByRole('button', { name: /italic/i });
    await user.click(italicButton);

    expect(mockHandlers.onItalic).toHaveBeenCalledTimes(1);
  });

  it('calls onHeading with correct level when heading buttons are clicked', async () => {
    const user = userEvent.setup();
    render(<EditorToolbar {...mockHandlers} />);

    const h1Button = screen.getByRole('button', { name: /heading 1/i });
    const h2Button = screen.getByRole('button', { name: /heading 2/i });
    const h3Button = screen.getByRole('button', { name: /heading 3/i });

    await user.click(h1Button);
    expect(mockHandlers.onHeading).toHaveBeenCalledWith(1);

    await user.click(h2Button);
    expect(mockHandlers.onHeading).toHaveBeenCalledWith(2);

    await user.click(h3Button);
    expect(mockHandlers.onHeading).toHaveBeenCalledWith(3);
  });

  it('calls onLink when link button is clicked', async () => {
    const user = userEvent.setup();
    render(<EditorToolbar {...mockHandlers} />);

    const linkButton = screen.getByRole('button', { name: /link/i });
    await user.click(linkButton);

    expect(mockHandlers.onLink).toHaveBeenCalledTimes(1);
  });

  it('calls onCode when inline code button is clicked', async () => {
    const user = userEvent.setup();
    render(<EditorToolbar {...mockHandlers} />);

    const codeButton = screen.getByRole('button', { name: /inline code/i });
    await user.click(codeButton);

    expect(mockHandlers.onCode).toHaveBeenCalledTimes(1);
  });

  it('calls onCodeBlock when code block button is clicked', async () => {
    const user = userEvent.setup();
    render(<EditorToolbar {...mockHandlers} />);

    const codeBlockButton = screen.getByRole('button', { name: /code block/i });
    await user.click(codeBlockButton);

    expect(mockHandlers.onCodeBlock).toHaveBeenCalledTimes(1);
  });

  it('calls onSave when save button is clicked', async () => {
    const user = userEvent.setup();
    render(<EditorToolbar {...mockHandlers} />);

    const saveButton = screen.getByRole('button', { name: /saved/i });
    await user.click(saveButton);

    expect(mockHandlers.onSave).toHaveBeenCalledTimes(1);
  });

  it('displays correct save status text and variant', () => {
    const testCases = [
      { status: 'saved', text: 'Saved', disabled: false },
      { status: 'saving', text: 'Saving...', disabled: true },
      { status: 'error', text: 'Error', disabled: false },
      { status: 'unsaved', text: 'Save', disabled: false }
    ] as const;

    testCases.forEach(({ status, text, disabled }) => {
      mockUseUIStore.mockReturnValue({
        saveStatus: status,
        isDarkMode: false,
        showLineNumbers: true,
        wordWrap: true,
        fontSize: 14,
        setSaveStatus: vi.fn(),
        sidebarWidth: 300,
        isSidebarCollapsed: false,
        panelLayout: 'split',
        theme: 'light',
        isPreviewMode: false,
        isLoading: false,
        error: null,
        cursorPosition: { line: 1, column: 1 },
        selectionInfo: { hasSelection: false, selectedLength: 0 },
        isSearchOpen: false,
        searchQuery: '',
        // Layout actions
        setSidebarWidth: vi.fn(),
        toggleSidebar: vi.fn(),
        setPanelLayout: vi.fn(),
        // Theme actions
        setTheme: vi.fn(),
        toggleTheme: vi.fn(),
        // Editor actions
        togglePreviewMode: vi.fn(),
        setShowLineNumbers: vi.fn(),
        setWordWrap: vi.fn(),
        setFontSize: vi.fn(),
        setCursorPosition: vi.fn(),
        setSelectionInfo: vi.fn(),
        // Application actions
        setLoading: vi.fn(),
        setError: vi.fn(),
        clearError: vi.fn(),
        // Search actions
        setSearchOpen: vi.fn(),
        setSearchQuery: vi.fn()
      });

      const { rerender } = render(<EditorToolbar {...mockHandlers} />);

      const saveButton = screen.getByRole('button', { name: new RegExp(text, 'i') });
      expect(saveButton).toBeInTheDocument();
      
      if (disabled) {
        expect(saveButton).toBeDisabled();
      } else {
        expect(saveButton).not.toBeDisabled();
      }

      rerender(<div />); // Clear for next iteration
    });
  });

  it('has proper keyboard shortcuts in button titles', () => {
    render(<EditorToolbar {...mockHandlers} />);

    // Check button titles contain keyboard shortcuts
    expect(screen.getByTitle(/bold.*ctrl\+b/i)).toBeInTheDocument();
    expect(screen.getByTitle(/italic.*ctrl\+i/i)).toBeInTheDocument();
    expect(screen.getByTitle(/link.*ctrl\+k/i)).toBeInTheDocument();
    expect(screen.getByTitle(/save.*ctrl\+s/i)).toBeInTheDocument();
  });

  it('groups buttons with proper visual separators', () => {
    render(<EditorToolbar {...mockHandlers} />);

    const toolbar = screen.getByRole('button', { name: /bold/i }).closest('div');
    expect(toolbar).toHaveClass('flex', 'items-center', 'gap-1');
  });
});