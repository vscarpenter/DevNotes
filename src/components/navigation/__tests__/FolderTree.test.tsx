/**
 * Tests for FolderTree component
 * Requirements: 3.5, 3.6, 1.4
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { FolderTree } from '../FolderTree';
import { useFolderStore } from '@/stores/folderStore';
import { useNoteStore } from '@/stores/noteStore';
import { Folder, Note } from '@/types/note';

// Mock the stores
vi.mock('@/stores/folderStore');
vi.mock('@/stores/noteStore');

const mockUseFolderStore = vi.mocked(useFolderStore);
const mockUseNoteStore = vi.mocked(useNoteStore);

// Mock data
const mockFolders: Folder[] = [
  {
    id: 'folder-1',
    name: 'Projects',
    parentId: null,
    children: ['folder-2'],
    notes: [],
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    isExpanded: true
  },
  {
    id: 'folder-2',
    name: 'React App',
    parentId: 'folder-1',
    children: [],
    notes: ['note-1'],
    createdAt: new Date('2024-01-02'),
    updatedAt: new Date('2024-01-02'),
    isExpanded: false
  },
  {
    id: 'folder-3',
    name: 'Documentation',
    parentId: null,
    children: [],
    notes: ['note-2', 'note-3'],
    createdAt: new Date('2024-01-03'),
    updatedAt: new Date('2024-01-03'),
    isExpanded: false
  }
];

const mockNotes: Note[] = [
  {
    id: 'note-1',
    title: 'Component Notes',
    content: 'React component documentation',
    folderId: 'folder-2',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    tags: [],
    wordCount: 3,
    readingTime: 1
  },
  {
    id: 'note-2',
    title: 'API Documentation',
    content: 'REST API documentation',
    folderId: 'folder-3',
    createdAt: new Date('2024-01-02'),
    updatedAt: new Date('2024-01-02'),
    tags: [],
    wordCount: 3,
    readingTime: 1
  },
  {
    id: 'note-3',
    title: 'User Guide',
    content: 'Application user guide',
    folderId: 'folder-3',
    createdAt: new Date('2024-01-03'),
    updatedAt: new Date('2024-01-03'),
    tags: [],
    wordCount: 3,
    readingTime: 1
  }
];

describe('FolderTree', () => {
  const mockFolderStore = {
    getRootFolders: vi.fn(),
    getFolder: vi.fn(),
    getChildFolders: vi.fn(),
    isFolderExpanded: vi.fn(),
    toggleFolderExpansion: vi.fn(),
    selectedFolderId: null,
    selectFolder: vi.fn(),
    loadFolders: vi.fn(),
    createFolder: vi.fn(),
    updateFolder: vi.fn(),
    deleteFolder: vi.fn(),
    isLoading: false,
    error: null
  };

  const mockNoteStore = {
    getNotesByFolder: vi.fn()
  };

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Reset store state
    mockFolderStore.isLoading = false;
    mockFolderStore.error = null;
    mockFolderStore.selectedFolderId = null;
    
    mockUseFolderStore.mockReturnValue(mockFolderStore as any);
    mockUseNoteStore.mockReturnValue(mockNoteStore as any);

    // Setup default mock implementations
    mockFolderStore.getRootFolders.mockReturnValue([mockFolders[0], mockFolders[2]]);
    mockFolderStore.getFolder.mockImplementation((id: string) => 
      mockFolders.find(f => f.id === id)
    );
    mockFolderStore.getChildFolders.mockImplementation((parentId: string) =>
      mockFolders.filter(f => f.parentId === parentId)
    );
    mockFolderStore.isFolderExpanded.mockImplementation((id: string) => {
      const folder = mockFolders.find(f => f.id === id);
      return folder?.isExpanded || false;
    });
    mockNoteStore.getNotesByFolder.mockImplementation((folderId: string) =>
      mockNotes.filter(n => n.folderId === folderId)
    );
  });

  it('renders folder tree with root folders', () => {
    render(<FolderTree />);
    
    expect(screen.getByText('Folders')).toBeInTheDocument();
    expect(screen.getByText('Projects')).toBeInTheDocument();
    expect(screen.getByText('Documentation')).toBeInTheDocument();
  });

  it('loads folders on mount', () => {
    render(<FolderTree />);
    
    expect(mockFolderStore.loadFolders).toHaveBeenCalledTimes(1);
  });

  it('displays loading state', () => {
    mockFolderStore.isLoading = true;
    render(<FolderTree />);
    
    expect(screen.getByText('Loading folders...')).toBeInTheDocument();
  });

  it('displays error state', () => {
    (mockFolderStore as any).error = 'Failed to load folders';
    render(<FolderTree />);
    
    expect(screen.getByText('Error loading folders: Failed to load folders')).toBeInTheDocument();
  });

  it('displays empty state when no folders exist', () => {
    mockFolderStore.getRootFolders.mockReturnValue([]);
    render(<FolderTree />);
    
    expect(screen.getByText('No folders yet. Create your first folder to get started.')).toBeInTheDocument();
  });

  it('expands and collapses folders', async () => {
    const user = userEvent.setup();
    render(<FolderTree />);
    
    // Projects folder should be expanded and show React App
    expect(screen.getByText('React App')).toBeInTheDocument();
    
    // Click the chevron to collapse
    const chevronDown = screen.getByRole('button', { name: /collapse/i });
    await user.click(chevronDown);
    
    expect(mockFolderStore.toggleFolderExpansion).toHaveBeenCalledWith('folder-1');
  });

  it('selects folder when clicked', async () => {
    const user = userEvent.setup();
    render(<FolderTree />);
    
    const projectsFolder = screen.getByText('Projects');
    await user.click(projectsFolder);
    
    expect(mockFolderStore.selectFolder).toHaveBeenCalledWith('folder-1');
  });

  it('shows visual indicators for folders with notes', () => {
    render(<FolderTree />);
    
    // Documentation folder should show note count
    const docFolder = screen.getByText('Documentation');
    const folderContainer = docFolder.closest('[role="treeitem"]');
    
    // Should show file icon and count
    expect(folderContainer).toBeInTheDocument();
  });

  it('handles keyboard navigation', async () => {
    const user = userEvent.setup();
    render(<FolderTree />);
    
    const projectsFolder = screen.getByText('Projects').closest('[role="treeitem"]');
    
    // Focus the folder
    (projectsFolder as HTMLElement)?.focus();
    
    // Press Enter to select
    await user.keyboard('{Enter}');
    expect(mockFolderStore.selectFolder).toHaveBeenCalledWith('folder-1');
    
    // Press ArrowLeft to collapse (if expanded)
    await user.keyboard('{ArrowLeft}');
    expect(mockFolderStore.toggleFolderExpansion).toHaveBeenCalledWith('folder-1');
  });

  it('shows context menu on right click', async () => {
    const user = userEvent.setup();
    render(<FolderTree />);
    
    const projectsFolder = screen.getByText('Projects');
    await user.pointer({ keys: '[MouseRight]', target: projectsFolder });
    
    // Context menu should appear
    await waitFor(() => {
      expect(screen.getByText('New Folder')).toBeInTheDocument();
      expect(screen.getByText('Rename')).toBeInTheDocument();
      expect(screen.getByText('Delete')).toBeInTheDocument();
    });
  });

  it('creates new folder from context menu', async () => {
    const user = userEvent.setup();
    mockFolderStore.createFolder.mockResolvedValue('new-folder-id');
    
    render(<FolderTree />);
    
    const projectsFolder = screen.getByText('Projects');
    await user.pointer({ keys: '[MouseRight]', target: projectsFolder });
    
    await waitFor(() => {
      expect(screen.getByText('New Folder')).toBeInTheDocument();
    });
    
    await user.click(screen.getByText('New Folder'));
    
    expect(mockFolderStore.createFolder).toHaveBeenCalledWith('folder-1', 'New Folder');
  });

  it('renames folder through context menu', async () => {
    const user = userEvent.setup();
    render(<FolderTree />);
    
    const projectsFolder = screen.getByText('Projects');
    await user.pointer({ keys: '[MouseRight]', target: projectsFolder });
    
    await waitFor(() => {
      expect(screen.getByText('Rename')).toBeInTheDocument();
    });
    
    await user.click(screen.getByText('Rename'));
    
    // Should show rename dialog
    await waitFor(() => {
      expect(screen.getByText('Rename Folder')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Projects')).toBeInTheDocument();
    });
    
    // Change name and save
    const input = screen.getByDisplayValue('Projects');
    await user.clear(input);
    await user.type(input, 'My Projects');
    await user.click(screen.getByText('Save'));
    
    expect(mockFolderStore.updateFolder).toHaveBeenCalledWith('folder-1', { name: 'My Projects' });
  });

  it('deletes folder with confirmation', async () => {
    const user = userEvent.setup();
    
    // Mock window.confirm
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);
    
    render(<FolderTree />);
    
    const projectsFolder = screen.getByText('Projects');
    await user.pointer({ keys: '[MouseRight]', target: projectsFolder });
    
    await waitFor(() => {
      expect(screen.getByText('Delete')).toBeInTheDocument();
    });
    
    await user.click(screen.getByText('Delete'));
    
    expect(confirmSpy).toHaveBeenCalledWith('Are you sure you want to delete this folder and all its contents?');
    expect(mockFolderStore.deleteFolder).toHaveBeenCalledWith('folder-1');
    
    confirmSpy.mockRestore();
  });

  it('cancels delete when confirmation is declined', async () => {
    const user = userEvent.setup();
    
    // Mock window.confirm to return false
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false);
    
    render(<FolderTree />);
    
    const projectsFolder = screen.getByText('Projects');
    await user.pointer({ keys: '[MouseRight]', target: projectsFolder });
    
    await waitFor(() => {
      expect(screen.getByText('Delete')).toBeInTheDocument();
    });
    
    await user.click(screen.getByText('Delete'));
    
    expect(confirmSpy).toHaveBeenCalled();
    expect(mockFolderStore.deleteFolder).not.toHaveBeenCalled();
    
    confirmSpy.mockRestore();
  });

  it('closes context menu when clicking outside', async () => {
    const user = userEvent.setup();
    render(<FolderTree />);
    
    const projectsFolder = screen.getByText('Projects');
    await user.pointer({ keys: '[MouseRight]', target: projectsFolder });
    
    await waitFor(() => {
      expect(screen.getByText('New Folder')).toBeInTheDocument();
    });
    
    // Click outside the context menu
    await user.click(document.body);
    
    await waitFor(() => {
      expect(screen.queryByText('New Folder')).not.toBeInTheDocument();
    });
  });

  it('closes context menu on Escape key', async () => {
    const user = userEvent.setup();
    render(<FolderTree />);
    
    const projectsFolder = screen.getByText('Projects');
    await user.pointer({ keys: '[MouseRight]', target: projectsFolder });
    
    await waitFor(() => {
      expect(screen.getByText('New Folder')).toBeInTheDocument();
    });
    
    await user.keyboard('{Escape}');
    
    await waitFor(() => {
      expect(screen.queryByText('New Folder')).not.toBeInTheDocument();
    });
  });

  it('creates root folder from header button', async () => {
    const user = userEvent.setup();
    mockFolderStore.createFolder.mockResolvedValue('root-folder-id');
    
    render(<FolderTree />);
    
    const createButton = screen.getByTitle('Create root folder');
    await user.click(createButton);
    
    expect(mockFolderStore.createFolder).toHaveBeenCalledWith(null, 'New Folder');
  });

  it('handles folder creation errors gracefully', async () => {
    const user = userEvent.setup();
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    mockFolderStore.createFolder.mockRejectedValue(new Error('Creation failed'));
    
    render(<FolderTree />);
    
    const createButton = screen.getByTitle('Create root folder');
    await user.click(createButton);
    
    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('Failed to create folder:', expect.any(Error));
    });
    
    consoleSpy.mockRestore();
  });

  it('supports accessibility features', () => {
    render(<FolderTree />);
    
    // Should have proper ARIA attributes
    const tree = screen.getByRole('tree');
    expect(tree).toHaveAttribute('aria-label', 'Folder tree');
    
    // Tree items should have proper roles and attributes
    const treeItems = screen.getAllByRole('treeitem');
    expect(treeItems.length).toBeGreaterThan(0);
    
    treeItems.forEach(item => {
      expect(item).toHaveAttribute('aria-level');
      expect(item).toHaveAttribute('tabIndex');
    });
  });
});