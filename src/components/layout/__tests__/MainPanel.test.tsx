/**
 * Tests for MainPanel component
 * Covers main panel functionality, toolbar, and status indicators
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { MainPanel } from '../MainPanel';
import { useUIStore } from '@/stores/uiStore';

// Mock the UI store
vi.mock('@/stores/uiStore');

describe('MainPanel', () => {
  const mockUIStore = {
    isSidebarCollapsed: false,
    toggleSidebar: vi.fn(),
    isPreviewMode: false,
    togglePreviewMode: vi.fn(),
    saveStatus: 'saved' as const,
    panelLayout: 'split' as const,
  };

  beforeEach(() => {
    vi.mocked(useUIStore).mockReturnValue(mockUIStore as any);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders main panel with toolbar', () => {
    render(<MainPanel />);
    
    expect(screen.getByTitle('Toggle sidebar')).toBeInTheDocument();
    expect(screen.getByText('Welcome Note')).toBeInTheDocument();
    expect(screen.getByTitle('More options')).toBeInTheDocument();
  });

  it('shows mobile menu button on mobile', () => {
    render(<MainPanel />);
    
    const mobileMenuButton = screen.getByTitle('Toggle sidebar');
    expect(mobileMenuButton).toHaveClass('md:hidden');
  });

  it('shows desktop sidebar toggle button', () => {
    render(<MainPanel />);
    
    const desktopToggleButton = screen.getByTitle('Hide sidebar');
    expect(desktopToggleButton).toHaveClass('hidden', 'md:flex');
  });

  it('updates sidebar toggle button title when collapsed', () => {
    vi.mocked(useUIStore).mockReturnValue({
      ...mockUIStore,
      isSidebarCollapsed: true,
    } as any);

    render(<MainPanel />);
    
    expect(screen.getByTitle('Show sidebar')).toBeInTheDocument();
  });

  it('toggles sidebar when menu button is clicked', () => {
    render(<MainPanel />);
    
    const menuButton = screen.getByTitle('Toggle sidebar');
    fireEvent.click(menuButton);
    
    expect(mockUIStore.toggleSidebar).toHaveBeenCalled();
  });

  describe('Save status indicator', () => {
    it('shows saved status', () => {
      render(<MainPanel />);
      
      expect(screen.getByText('Saved')).toBeInTheDocument();
      const indicator = document.querySelector('.bg-green-500');
      expect(indicator).toBeInTheDocument();
    });

    it('shows saving status', () => {
      vi.mocked(useUIStore).mockReturnValue({
        ...mockUIStore,
        saveStatus: 'saving' as const,
      } as any);

      render(<MainPanel />);
      
      expect(screen.getByText('Saving...')).toBeInTheDocument();
      const indicator = document.querySelector('.bg-yellow-500.animate-pulse');
      expect(indicator).toBeInTheDocument();
    });

    it('shows error status', () => {
      vi.mocked(useUIStore).mockReturnValue({
        ...mockUIStore,
        saveStatus: 'error' as const,
      } as any);

      render(<MainPanel />);
      
      expect(screen.getByText('Save failed')).toBeInTheDocument();
      const indicator = document.querySelector('.bg-red-500');
      expect(indicator).toBeInTheDocument();
    });

    it('shows unsaved status', () => {
      vi.mocked(useUIStore).mockReturnValue({
        ...mockUIStore,
        saveStatus: 'unsaved' as const,
      } as any);

      render(<MainPanel />);
      
      expect(screen.getByText('Unsaved changes')).toBeInTheDocument();
      const indicator = document.querySelector('.bg-gray-400');
      expect(indicator).toBeInTheDocument();
    });
  });

  describe('Preview mode toggle', () => {
    it('shows preview button when in edit mode', () => {
      render(<MainPanel />);
      
      expect(screen.getByTitle('Switch to preview mode')).toBeInTheDocument();
      expect(screen.getByText('Preview')).toBeInTheDocument();
    });

    it('shows edit button when in preview mode', () => {
      vi.mocked(useUIStore).mockReturnValue({
        ...mockUIStore,
        isPreviewMode: true,
      } as any);

      render(<MainPanel />);
      
      expect(screen.getByTitle('Switch to edit mode')).toBeInTheDocument();
      expect(screen.getByText('Edit')).toBeInTheDocument();
    });

    it('toggles preview mode when button is clicked', () => {
      render(<MainPanel />);
      
      const previewButton = screen.getByTitle('Switch to preview mode');
      fireEvent.click(previewButton);
      
      expect(mockUIStore.togglePreviewMode).toHaveBeenCalled();
    });
  });

  it('renders welcome content when no children provided', () => {
    render(<MainPanel />);
    
    expect(screen.getByText('Welcome to DevNotes')).toBeInTheDocument();
    expect(screen.getByText(/A developer-focused note-taking application/)).toBeInTheDocument();
    expect(screen.getByText('• Create folders to organize your notes')).toBeInTheDocument();
  });

  it('renders children when provided', () => {
    render(
      <MainPanel>
        <div data-testid="custom-content">Custom Content</div>
      </MainPanel>
    );
    
    expect(screen.getByTestId('custom-content')).toBeInTheDocument();
    expect(screen.queryByText('Welcome to DevNotes')).not.toBeInTheDocument();
  });

  it('shows status bar with default information', () => {
    render(<MainPanel />);
    
    expect(screen.getByText('Ready')).toBeInTheDocument();
    expect(screen.getByText('0 words')).toBeInTheDocument();
    expect(screen.getByText('Ln 1, Col 1')).toBeInTheDocument();
  });

  it('shows layout information in status bar when not split', () => {
    vi.mocked(useUIStore).mockReturnValue({
      ...mockUIStore,
      panelLayout: 'editor-only' as const,
    } as any);

    render(<MainPanel />);
    
    expect(screen.getByText('Layout: editor-only')).toBeInTheDocument();
  });

  it('applies custom className when provided', () => {
    const { container } = render(<MainPanel className="custom-class" />);
    
    const mainPanel = container.firstChild as HTMLElement;
    expect(mainPanel).toHaveClass('custom-class');
  });

  it('has proper accessibility attributes', () => {
    render(<MainPanel />);
    
    // Check that buttons have proper titles
    expect(screen.getByTitle('Toggle sidebar')).toBeInTheDocument();
    expect(screen.getByTitle('Switch to preview mode')).toBeInTheDocument();
    expect(screen.getByTitle('More options')).toBeInTheDocument();
  });
});