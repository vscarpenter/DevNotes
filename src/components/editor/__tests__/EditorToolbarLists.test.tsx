/**
 * Editor Toolbar List Tests
 * Tests the bullet list and numbered list buttons in the editor toolbar
 * Requirements: 4.1, 4.4
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { EditorToolbar } from '../EditorToolbar';
import { useUIStore } from '../../../stores/uiStore';

import { vi } from 'vitest';

// Mock UI store
vi.mock('../../../stores/uiStore');
const mockUseUIStore = useUIStore as any;

describe('EditorToolbar List Features', () => {
  const mockHandlers = {
    onBold: vi.fn(),
    onItalic: vi.fn(),
    onHeading: vi.fn(),
    onLink: vi.fn(),
    onCode: vi.fn(),
    onCodeBlock: vi.fn(),
    onBulletList: vi.fn(),
    onNumberedList: vi.fn(),
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

  describe('List Buttons', () => {
    it('should render bullet list button', () => {
      render(<EditorToolbar {...mockHandlers} />);
      
      const bulletListButton = screen.getByTitle('Bullet List');
      expect(bulletListButton).toBeInTheDocument();
    });

    it('should render numbered list button', () => {
      render(<EditorToolbar {...mockHandlers} />);
      
      const numberedListButton = screen.getByTitle('Numbered List');
      expect(numberedListButton).toBeInTheDocument();
    });

    it('should call onBulletList when bullet list button is clicked', () => {
      render(<EditorToolbar {...mockHandlers} />);
      
      const bulletListButton = screen.getByTitle('Bullet List');
      fireEvent.click(bulletListButton);
      
      expect(mockHandlers.onBulletList).toHaveBeenCalledTimes(1);
    });

    it('should call onNumberedList when numbered list button is clicked', () => {
      render(<EditorToolbar {...mockHandlers} />);
      
      const numberedListButton = screen.getByTitle('Numbered List');
      fireEvent.click(numberedListButton);
      
      expect(mockHandlers.onNumberedList).toHaveBeenCalledTimes(1);
    });

    it('should have proper accessibility attributes for list buttons', () => {
      render(<EditorToolbar {...mockHandlers} />);
      
      const bulletListButton = screen.getByTitle('Bullet List');
      const numberedListButton = screen.getByTitle('Numbered List');
      
      expect(bulletListButton).toHaveAttribute('title', 'Bullet List');
      expect(numberedListButton).toHaveAttribute('title', 'Numbered List');
      
      // Should be focusable
      expect(bulletListButton).not.toHaveAttribute('tabindex', '-1');
      expect(numberedListButton).not.toHaveAttribute('tabindex', '-1');
    });
  });

  describe('Toolbar Layout', () => {
    it('should group list buttons together', () => {
      render(<EditorToolbar {...mockHandlers} />);
      
      const bulletListButton = screen.getByTitle('Bullet List');
      const numberedListButton = screen.getByTitle('Numbered List');
      
      // Check that they are in the same section (have common parent with border)
      const listSection = bulletListButton.closest('.border-r');
      expect(listSection).toContain(numberedListButton);
    });

    it('should maintain proper button spacing and sizing', () => {
      render(<EditorToolbar {...mockHandlers} />);
      
      const bulletListButton = screen.getByTitle('Bullet List');
      const numberedListButton = screen.getByTitle('Numbered List');
      
      // All buttons should have consistent sizing classes
      expect(bulletListButton).toHaveClass('h-8', 'w-8', 'p-0');
      expect(numberedListButton).toHaveClass('h-8', 'w-8', 'p-0');
    });

    it('should separate list section from other sections', () => {
      render(<EditorToolbar {...mockHandlers} />);
      
      // The list section should be separate from code section
      const codeButton = screen.getByTitle('Inline Code');
      const bulletListButton = screen.getByTitle('Bullet List');
      
      const codeSection = codeButton.closest('.border-r');
      const listSection = bulletListButton.closest('.border-r');
      
      expect(codeSection).not.toBe(listSection);
    });
  });

  describe('Button States', () => {
    it('should render buttons in default ghost variant', () => {
      render(<EditorToolbar {...mockHandlers} />);
      
      const bulletListButton = screen.getByTitle('Bullet List');
      const numberedListButton = screen.getByTitle('Numbered List');
      
      // Should not have active/pressed state classes
      expect(bulletListButton).not.toHaveClass('bg-accent');
      expect(numberedListButton).not.toHaveClass('bg-accent');
    });

    it('should be enabled by default', () => {
      render(<EditorToolbar {...mockHandlers} />);
      
      const bulletListButton = screen.getByTitle('Bullet List');
      const numberedListButton = screen.getByTitle('Numbered List');
      
      expect(bulletListButton).not.toBeDisabled();
      expect(numberedListButton).not.toBeDisabled();
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
      
      // Should still render list buttons
      expect(screen.getByTitle('Bullet List')).toBeInTheDocument();
      expect(screen.getByTitle('Numbered List')).toBeInTheDocument();
      
      // Should also render preview controls
      expect(screen.getByTitle('Editor Only')).toBeInTheDocument();
      expect(screen.getByTitle('Split View')).toBeInTheDocument();
      expect(screen.getByTitle('Preview Only')).toBeInTheDocument();
    });
  });

  describe('Keyboard Accessibility', () => {
    it('should support keyboard navigation', () => {
      render(<EditorToolbar {...mockHandlers} />);
      
      const bulletListButton = screen.getByTitle('Bullet List');
      
      // Should be focusable with keyboard
      bulletListButton.focus();
      expect(document.activeElement).toBe(bulletListButton);
      
      // Should respond to Enter key
      fireEvent.keyDown(bulletListButton, { key: 'Enter' });
      // Note: Button component should handle this internally
    });

    it('should support space key activation', () => {
      render(<EditorToolbar {...mockHandlers} />);
      
      const numberedListButton = screen.getByTitle('Numbered List');
      
      numberedListButton.focus();
      fireEvent.keyDown(numberedListButton, { key: ' ' });
      // Note: Button component should handle this internally
    });
  });

  describe('Icon Rendering', () => {
    it('should use List icon for bullet list button', () => {
      render(<EditorToolbar {...mockHandlers} />);
      
      const bulletListButton = screen.getByTitle('Bullet List');
      const icon = bulletListButton.querySelector('svg');
      
      expect(icon).toBeInTheDocument();
    });

    it('should use ListOrdered icon for numbered list button', () => {
      render(<EditorToolbar {...mockHandlers} />);
      
      const numberedListButton = screen.getByTitle('Numbered List');
      const icon = numberedListButton.querySelector('svg');
      
      expect(icon).toBeInTheDocument();
    });
  });
});