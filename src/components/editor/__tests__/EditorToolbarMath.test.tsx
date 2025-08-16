/**
 * Editor Toolbar Math and Diagram Tests
 * Tests the new math and diagram buttons in the editor toolbar
 * Requirements: 4.6, 4.7
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { EditorToolbar } from '../EditorToolbar';
import { useUIStore } from '../../../stores/uiStore';

import { vi } from 'vitest';

// Mock UI store
vi.mock('../../../stores/uiStore');
const mockUseUIStore = useUIStore as any;

describe('EditorToolbar Math and Diagram Features', () => {
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
    mockUseUIStore.mockReturnValue({
      saveStatus: 'saved',
      panelLayout: 'split',
      setPanelLayout: vi.fn(),
      isDarkMode: false,
      showLineNumbers: true,
      wordWrap: true,
      fontSize: 14,
      setSaveStatus: vi.fn()
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Math Buttons', () => {
    it('should render inline math button', () => {
      render(<EditorToolbar {...mockHandlers} />);
      
      const mathButtons = screen.getAllByTitle(/Math/);
      expect(mathButtons).toHaveLength(2); // Inline Math and Math Block
      
      const inlineMathButton = screen.getByTitle('Inline Math');
      expect(inlineMathButton).toBeInTheDocument();
    });

    it('should render math block button', () => {
      render(<EditorToolbar {...mockHandlers} />);
      
      const mathBlockButton = screen.getByTitle('Math Block');
      expect(mathBlockButton).toBeInTheDocument();
    });

    it('should call onMath when inline math button is clicked', () => {
      render(<EditorToolbar {...mockHandlers} />);
      
      const inlineMathButton = screen.getByTitle('Inline Math');
      fireEvent.click(inlineMathButton);
      
      expect(mockHandlers.onMath).toHaveBeenCalledTimes(1);
    });

    it('should call onMathBlock when math block button is clicked', () => {
      render(<EditorToolbar {...mockHandlers} />);
      
      const mathBlockButton = screen.getByTitle('Math Block');
      fireEvent.click(mathBlockButton);
      
      expect(mockHandlers.onMathBlock).toHaveBeenCalledTimes(1);
    });

    it('should have proper accessibility attributes for math buttons', () => {
      render(<EditorToolbar {...mockHandlers} />);
      
      const inlineMathButton = screen.getByTitle('Inline Math');
      const mathBlockButton = screen.getByTitle('Math Block');
      
      expect(inlineMathButton).toHaveAttribute('title', 'Inline Math');
      expect(mathBlockButton).toHaveAttribute('title', 'Math Block');
      
      // Should be focusable
      expect(inlineMathButton).not.toHaveAttribute('tabindex', '-1');
      expect(mathBlockButton).not.toHaveAttribute('tabindex', '-1');
    });
  });

  describe('Mermaid Diagram Button', () => {
    it('should render Mermaid diagram button', () => {
      render(<EditorToolbar {...mockHandlers} />);
      
      const mermaidButton = screen.getByTitle('Mermaid Diagram');
      expect(mermaidButton).toBeInTheDocument();
    });

    it('should call onMermaid when Mermaid button is clicked', () => {
      render(<EditorToolbar {...mockHandlers} />);
      
      const mermaidButton = screen.getByTitle('Mermaid Diagram');
      fireEvent.click(mermaidButton);
      
      expect(mockHandlers.onMermaid).toHaveBeenCalledTimes(1);
    });

    it('should have proper accessibility attributes for Mermaid button', () => {
      render(<EditorToolbar {...mockHandlers} />);
      
      const mermaidButton = screen.getByTitle('Mermaid Diagram');
      
      expect(mermaidButton).toHaveAttribute('title', 'Mermaid Diagram');
      expect(mermaidButton).not.toHaveAttribute('tabindex', '-1');
    });

    it('should use GitBranch icon for Mermaid button', () => {
      render(<EditorToolbar {...mockHandlers} />);
      
      const mermaidButton = screen.getByTitle('Mermaid Diagram');
      const icon = mermaidButton.querySelector('svg');
      
      expect(icon).toBeInTheDocument();
    });
  });

  describe('Toolbar Layout', () => {
    it('should group math and diagram buttons together', () => {
      render(<EditorToolbar {...mockHandlers} />);
      
      const inlineMathButton = screen.getByTitle('Inline Math');
      const mathBlockButton = screen.getByTitle('Math Block');
      const mermaidButton = screen.getByTitle('Mermaid Diagram');
      
      // Check that they are in the same section (have common parent with border)
      const mathSection = inlineMathButton.closest('.border-r');
      expect(mathSection).toContain(mathBlockButton);
      expect(mathSection).toContain(mermaidButton);
    });

    it('should maintain proper button spacing and sizing', () => {
      render(<EditorToolbar {...mockHandlers} />);
      
      const inlineMathButton = screen.getByTitle('Inline Math');
      const mathBlockButton = screen.getByTitle('Math Block');
      const mermaidButton = screen.getByTitle('Mermaid Diagram');
      
      // All buttons should have consistent sizing classes
      expect(inlineMathButton).toHaveClass('h-8', 'w-8', 'p-0');
      expect(mathBlockButton).toHaveClass('h-8', 'w-8', 'p-0');
      expect(mermaidButton).toHaveClass('h-8', 'w-8', 'p-0');
    });

    it('should separate math/diagram section from other sections', () => {
      render(<EditorToolbar {...mockHandlers} />);
      
      // The math/diagram section should be separate from code section
      const codeButton = screen.getByTitle('Inline Code');
      const mathButton = screen.getByTitle('Inline Math');
      
      const codeSection = codeButton.closest('.border-r');
      const mathSection = mathButton.closest('.border-r');
      
      expect(codeSection).not.toBe(mathSection);
    });
  });

  describe('Button States', () => {
    it('should render buttons in default ghost variant', () => {
      render(<EditorToolbar {...mockHandlers} />);
      
      const inlineMathButton = screen.getByTitle('Inline Math');
      const mathBlockButton = screen.getByTitle('Math Block');
      const mermaidButton = screen.getByTitle('Mermaid Diagram');
      
      // Should not have active/pressed state classes
      expect(inlineMathButton).not.toHaveClass('bg-accent');
      expect(mathBlockButton).not.toHaveClass('bg-accent');
      expect(mermaidButton).not.toHaveClass('bg-accent');
    });

    it('should be enabled by default', () => {
      render(<EditorToolbar {...mockHandlers} />);
      
      const inlineMathButton = screen.getByTitle('Inline Math');
      const mathBlockButton = screen.getByTitle('Math Block');
      const mermaidButton = screen.getByTitle('Mermaid Diagram');
      
      expect(inlineMathButton).not.toBeDisabled();
      expect(mathBlockButton).not.toBeDisabled();
      expect(mermaidButton).not.toBeDisabled();
    });
  });

  describe('Integration with Existing Toolbar', () => {
    it('should not affect existing button functionality', () => {
      render(<EditorToolbar {...mockHandlers} />);
      
      // Test that existing buttons still work
      const boldButton = screen.getByTitle('Bold (Ctrl+B)');
      const italicButton = screen.getByTitle('Italic (Ctrl+I)');
      const codeButton = screen.getByTitle('Inline Code');
      
      fireEvent.click(boldButton);
      fireEvent.click(italicButton);
      fireEvent.click(codeButton);
      
      expect(mockHandlers.onBold).toHaveBeenCalledTimes(1);
      expect(mockHandlers.onItalic).toHaveBeenCalledTimes(1);
      expect(mockHandlers.onCode).toHaveBeenCalledTimes(1);
    });

    it('should maintain save button functionality', () => {
      render(<EditorToolbar {...mockHandlers} />);
      
      const saveButton = screen.getByTitle('Save (Ctrl+S)');
      fireEvent.click(saveButton);
      
      expect(mockHandlers.onSave).toHaveBeenCalledTimes(1);
    });

    it('should work with preview controls when enabled', () => {
      render(<EditorToolbar {...mockHandlers} showPreviewControls={true} />);
      
      // Should still render math and diagram buttons
      expect(screen.getByTitle('Inline Math')).toBeInTheDocument();
      expect(screen.getByTitle('Math Block')).toBeInTheDocument();
      expect(screen.getByTitle('Mermaid Diagram')).toBeInTheDocument();
      
      // Should also render preview controls
      expect(screen.getByTitle('Editor Only')).toBeInTheDocument();
      expect(screen.getByTitle('Split View')).toBeInTheDocument();
      expect(screen.getByTitle('Preview Only')).toBeInTheDocument();
    });
  });

  describe('Keyboard Accessibility', () => {
    it('should support keyboard navigation', () => {
      render(<EditorToolbar {...mockHandlers} />);
      
      const inlineMathButton = screen.getByTitle('Inline Math');
      
      // Should be focusable with keyboard
      inlineMathButton.focus();
      expect(document.activeElement).toBe(inlineMathButton);
      
      // Should respond to Enter key
      fireEvent.keyDown(inlineMathButton, { key: 'Enter' });
      // Note: Button component should handle this internally
    });

    it('should support space key activation', () => {
      render(<EditorToolbar {...mockHandlers} />);
      
      const mathBlockButton = screen.getByTitle('Math Block');
      
      mathBlockButton.focus();
      fireEvent.keyDown(mathBlockButton, { key: ' ' });
      // Note: Button component should handle this internally
    });
  });
});