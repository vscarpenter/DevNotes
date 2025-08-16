/**
 * Tests for Sidebar component
 * Covers sidebar functionality, search, and navigation
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { Sidebar } from '../Sidebar';
import { useUIStore } from '@/stores/uiStore';

// Mock the UI store
vi.mock('@/stores/uiStore');

describe('Sidebar', () => {
  const mockUIStore = {
    isSidebarCollapsed: false,
    toggleSidebar: vi.fn(),
    collapseSidebar: vi.fn(),
    isSearchOpen: false,
    setSearchOpen: vi.fn(),
    searchQuery: '',
    setSearchQuery: vi.fn(),
  };

  beforeEach(() => {
    vi.mocked(useUIStore).mockReturnValue(mockUIStore as any);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders sidebar header with logo and title', () => {
    render(<Sidebar />);
    
    expect(screen.getByText('DevNotes')).toBeInTheDocument();
    expect(screen.getByTitle('Search')).toBeInTheDocument();
  });

  it('shows close button on mobile', () => {
    render(<Sidebar />);
    
    const closeButton = screen.getByTitle('Close sidebar');
    expect(closeButton).toBeInTheDocument();
    expect(closeButton).toHaveClass('md:hidden');
  });

  it('toggles search when search button is clicked', () => {
    render(<Sidebar />);
    
    const searchButton = screen.getByTitle('Search');
    fireEvent.click(searchButton);
    
    expect(mockUIStore.setSearchOpen).toHaveBeenCalledWith(true);
  });

  it('closes sidebar when close button is clicked', () => {
    render(<Sidebar />);
    
    const closeButton = screen.getByTitle('Close sidebar');
    fireEvent.click(closeButton);
    
    expect(mockUIStore.collapseSidebar).toHaveBeenCalled();
  });

  it('shows search bar when search is open', () => {
    vi.mocked(useUIStore).mockReturnValue({
      ...mockUIStore,
      isSearchOpen: true,
    } as any);

    render(<Sidebar />);
    
    expect(screen.getByPlaceholderText('Search notes...')).toBeInTheDocument();
  });

  it('hides search bar when search is closed', () => {
    vi.mocked(useUIStore).mockReturnValue({
      ...mockUIStore,
      isSearchOpen: false,
    } as any);

    render(<Sidebar />);
    
    expect(screen.queryByPlaceholderText('Search notes...')).not.toBeInTheDocument();
  });

  it('updates search query when typing in search input', () => {
    vi.mocked(useUIStore).mockReturnValue({
      ...mockUIStore,
      isSearchOpen: true,
    } as any);

    render(<Sidebar />);
    
    const searchInput = screen.getByPlaceholderText('Search notes...');
    fireEvent.change(searchInput, { target: { value: 'test query' } });
    
    expect(mockUIStore.setSearchQuery).toHaveBeenCalledWith('test query');
  });

  it('displays current search query in input', () => {
    vi.mocked(useUIStore).mockReturnValue({
      ...mockUIStore,
      isSearchOpen: true,
      searchQuery: 'existing query',
    } as any);

    render(<Sidebar />);
    
    const searchInput = screen.getByPlaceholderText('Search notes...') as HTMLInputElement;
    expect(searchInput.value).toBe('existing query');
  });

  it('renders quick action buttons', () => {
    render(<Sidebar />);
    
    expect(screen.getByTitle('New folder')).toBeInTheDocument();
    expect(screen.getByTitle('New note')).toBeInTheDocument();
  });

  it('renders placeholder folder structure', () => {
    render(<Sidebar />);
    
    expect(screen.getByText('Folder Tree')).toBeInTheDocument();
    expect(screen.getByText('Projects')).toBeInTheDocument();
    expect(screen.getByText('React App')).toBeInTheDocument();
    expect(screen.getByText('Component Notes')).toBeInTheDocument();
    expect(screen.getByText('Documentation')).toBeInTheDocument();
  });

  it('renders settings button in footer', () => {
    render(<Sidebar />);
    
    expect(screen.getByTitle('Settings')).toBeInTheDocument();
  });

  it('applies custom className when provided', () => {
    const { container } = render(<Sidebar className="custom-class" />);
    
    const sidebar = container.firstChild as HTMLElement;
    expect(sidebar).toHaveClass('custom-class');
  });

  it('has proper accessibility attributes', () => {
    render(<Sidebar />);
    
    // Check that buttons have proper titles
    expect(screen.getByTitle('Search')).toBeInTheDocument();
    expect(screen.getByTitle('Close sidebar')).toBeInTheDocument();
    expect(screen.getByTitle('New folder')).toBeInTheDocument();
    expect(screen.getByTitle('New note')).toBeInTheDocument();
    expect(screen.getByTitle('Settings')).toBeInTheDocument();
  });

  it('has proper keyboard navigation support', () => {
    vi.mocked(useUIStore).mockReturnValue({
      ...mockUIStore,
      isSearchOpen: true,
    } as any);

    render(<Sidebar />);
    
    const searchInput = screen.getByPlaceholderText('Search notes...');
    
    // Should be focusable
    searchInput.focus();
    expect(document.activeElement).toBe(searchInput);
  });
});