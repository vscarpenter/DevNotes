/**
 * Tests for ExportModal component
 * Requirements: 8.1, 8.2, 8.3, 8.4
 */

import React from 'react';
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ExportModal } from '../ExportModal';
import { exportService } from '../../../lib/export/ExportService';
import { useNoteStore } from '../../../stores/noteStore';
import { useFolderStore } from '../../../stores/folderStore';
import { Note, Folder } from '../../../types';

// Mock dependencies
vi.mock('../../../lib/export/ExportService');
vi.mock('../../../stores/noteStore');
vi.mock('../../../stores/folderStore');

// Mock URL.createObjectURL and revokeObjectURL
global.URL.createObjectURL = vi.fn(() => 'mock-url');
global.URL.revokeObjectURL = vi.fn();

// Mock window.open
global.window.open = vi.fn();

describe('ExportModal', () => {
  const mockNote: Note = {
    id: 'note-1',
    title: 'Test Note',
    content: 'Test content',
    folderId: 'folder-1',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-02'),
    tags: ['test'],
    wordCount: 2,
    readingTime: 1
  };

  const mockFolder: Folder = {
    id: 'folder-1',
    name: 'Test Folder',
    parentId: null,
    children: [],
    notes: ['note-1'],
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    isExpanded: true
  };

  const mockGetNote = vi.fn();
  const mockGetFolder = vi.fn();

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();

    // Setup store mocks
    vi.mocked(useNoteStore).mockReturnValue({
      getNote: mockGetNote,
      notes: { 'note-1': mockNote },
      selectedNoteId: null,
      isLoading: false,
      isSaving: false,
      error: null,
      loadNotes: vi.fn(),
      createNote: vi.fn(),
      updateNote: vi.fn(),
      deleteNote: vi.fn(),
      moveNote: vi.fn(),
      duplicateNote: vi.fn(),
      selectNote: vi.fn(),
      clearError: vi.fn(),
      getNotesByFolder: vi.fn(),
      getRecentNotes: vi.fn()
    });

    vi.mocked(useFolderStore).mockReturnValue({
      getFolder: mockGetFolder,
      folders: { 'folder-1': mockFolder },
      selectedFolderId: null,
      expandedFolders: new Set(),
      isLoading: false,
      error: null,
      loadFolders: vi.fn(),
      createFolder: vi.fn(),
      updateFolder: vi.fn(),
      deleteFolder: vi.fn(),
      moveFolder: vi.fn(),
      selectFolder: vi.fn(),
      toggleFolderExpansion: vi.fn(),
      expandFolder: vi.fn(),
      collapseFolder: vi.fn(),
      clearError: vi.fn(),
      getRootFolders: vi.fn(),
      getChildFolders: vi.fn(),
      getFolderPath: vi.fn(),
      isFolderExpanded: vi.fn(),
      getFolderHierarchy: vi.fn(),
      isDescendantOf: vi.fn()
    });

    mockGetNote.mockReturnValue(mockNote);
    mockGetFolder.mockReturnValue(mockFolder);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Modal Rendering', () => {
    it('should not render when closed', () => {
      render(<ExportModal isOpen={false} onClose={vi.fn()} />);
      expect(screen.queryByText('Export Database')).not.toBeInTheDocument();
    });

    it('should render single note export mode', () => {
      render(<ExportModal isOpen={true} onClose={vi.fn()} noteId="note-1" />);
      
      expect(screen.getByText('Export Note')).toBeInTheDocument();
      expect(screen.getByText('Test Note')).toBeInTheDocument();
      expect(screen.getByText('2 words • Modified 1/2/2024')).toBeInTheDocument();
    });

    it('should render bulk export mode', () => {
      render(
        <ExportModal 
          isOpen={true} 
          onClose={vi.fn()} 
          selectedNoteIds={['note-1', 'note-2']} 
        />
      );
      
      expect(screen.getByText('Export Notes')).toBeInTheDocument();
      expect(screen.getByText('Export Mode')).toBeInTheDocument();
    });

    it('should render database export mode by default', () => {
      render(<ExportModal isOpen={true} onClose={vi.fn()} />);
      
      expect(screen.getByText('Export Database')).toBeInTheDocument();
      expect(screen.getByText('Complete database backup')).toBeInTheDocument();
    });
  });

  describe('Format Selection', () => {
    it('should allow format selection for single note export', async () => {
      const user = userEvent.setup();
      render(<ExportModal isOpen={true} onClose={vi.fn()} noteId="note-1" />);
      
      // Default should be markdown
      expect(screen.getByText('Markdown')).toHaveClass('border-blue-500');
      
      // Click HTML format
      await user.click(screen.getByText('HTML'));
      expect(screen.getByText('HTML')).toHaveClass('border-blue-500');
      expect(screen.getByText('Markdown')).not.toHaveClass('border-blue-500');
    });

    it('should not show format selection for database export', () => {
      render(<ExportModal isOpen={true} onClose={vi.fn()} />);
      
      expect(screen.queryByText('Export Format')).not.toBeInTheDocument();
    });
  });

  describe('Options', () => {
    it('should show metadata option for single note export', () => {
      render(<ExportModal isOpen={true} onClose={vi.fn()} noteId="note-1" />);
      
      expect(screen.getByText('Include metadata (dates, tags, etc.)')).toBeInTheDocument();
      expect(screen.getByRole('checkbox', { name: /include metadata/i })).toBeChecked();
    });

    it('should show bulk export options', () => {
      render(
        <ExportModal 
          isOpen={true} 
          onClose={vi.fn()} 
          selectedNoteIds={['note-1']} 
        />
      );
      
      expect(screen.getByText('Preserve folder structure')).toBeInTheDocument();
      expect(screen.getByRole('checkbox', { name: /preserve folder structure/i })).toBeChecked();
    });

    it('should show subfolder option for folder selection', () => {
      render(
        <ExportModal 
          isOpen={true} 
          onClose={vi.fn()} 
          selectedFolderIds={['folder-1']} 
        />
      );
      
      expect(screen.getByText('Include subfolders')).toBeInTheDocument();
      expect(screen.getByRole('checkbox', { name: /include subfolders/i })).toBeChecked();
    });
  });

  describe('Single Note Export', () => {
    it('should export single note', async () => {
      const user = userEvent.setup();
      const mockExportResult = {
        content: 'exported content',
        filename: 'test-note.md',
        mimeType: 'text/markdown'
      };

      vi.mocked(exportService.exportNote).mockResolvedValue(mockExportResult);

      render(<ExportModal isOpen={true} onClose={vi.fn()} noteId="note-1" />);
      
      await user.click(screen.getByText('Export'));

      await waitFor(() => {
        expect(exportService.exportNote).toHaveBeenCalledWith('note-1', {
          format: 'markdown',
          includeMetadata: true,
          preserveStructure: true
        });
      });

      expect(screen.getByText('Note exported as test-note.md')).toBeInTheDocument();
    });

    it('should handle export error', async () => {
      const user = userEvent.setup();
      vi.mocked(exportService.exportNote).mockRejectedValue(new Error('Export failed'));

      render(<ExportModal isOpen={true} onClose={vi.fn()} noteId="note-1" />);
      
      await user.click(screen.getByText('Export'));

      await waitFor(() => {
        expect(screen.getByText('Export failed')).toBeInTheDocument();
      });
    });

    it('should copy to clipboard', async () => {
      const user = userEvent.setup();
      vi.mocked(exportService.copyToClipboard).mockResolvedValue();

      render(<ExportModal isOpen={true} onClose={vi.fn()} noteId="note-1" />);
      
      await user.click(screen.getByText('Copy'));

      await waitFor(() => {
        expect(exportService.copyToClipboard).toHaveBeenCalledWith('note-1', 'markdown');
      });

      expect(screen.getByText('Note copied to clipboard')).toBeInTheDocument();
    });

    it('should generate email link', async () => {
      const user = userEvent.setup();
      vi.mocked(exportService.generateEmailLink).mockResolvedValue('mailto:test');

      render(<ExportModal isOpen={true} onClose={vi.fn()} noteId="note-1" />);
      
      await user.click(screen.getByText('Email'));

      await waitFor(() => {
        expect(exportService.generateEmailLink).toHaveBeenCalledWith('note-1', 'markdown');
      });

      expect(window.open).toHaveBeenCalledWith('mailto:test', '_blank');
      expect(screen.getByText('Email client opened')).toBeInTheDocument();
    });
  });

  describe('Bulk Export', () => {
    it('should export multiple notes', async () => {
      const user = userEvent.setup();
      const mockExportResult = {
        content: new Blob(['zip content']),
        filename: 'export.zip',
        mimeType: 'application/zip'
      };

      vi.mocked(exportService.exportBulk).mockResolvedValue(mockExportResult);

      render(
        <ExportModal 
          isOpen={true} 
          onClose={vi.fn()} 
          selectedNoteIds={['note-1', 'note-2']} 
        />
      );
      
      await user.click(screen.getByText('Export'));

      await waitFor(() => {
        expect(exportService.exportBulk).toHaveBeenCalledWith(
          {
            format: 'markdown',
            includeMetadata: true,
            preserveStructure: true,
            includeSubfolders: true,
            selectedNoteIds: ['note-1', 'note-2']
          },
          expect.any(Function)
        );
      });

      expect(screen.getByText('Export completed: export.zip')).toBeInTheDocument();
    });

    it('should show progress during bulk export', async () => {
      const user = userEvent.setup();
      let progressCallback: any;

      vi.mocked(exportService.exportBulk).mockImplementation(async (options, callback) => {
        progressCallback = callback;
        
        // Simulate progress updates
        callback?.({
          current: 0,
          total: 2,
          status: 'preparing',
          message: 'Preparing export...'
        });

        callback?.({
          current: 1,
          total: 2,
          status: 'processing',
          message: 'Exporting note 1'
        });

        callback?.({
          current: 2,
          total: 2,
          status: 'complete',
          message: 'Creating archive...'
        });

        return {
          content: new Blob(['zip content']),
          filename: 'export.zip',
          mimeType: 'application/zip'
        };
      });

      render(
        <ExportModal 
          isOpen={true} 
          onClose={vi.fn()} 
          selectedNoteIds={['note-1', 'note-2']} 
        />
      );
      
      await user.click(screen.getByText('Export'));

      await waitFor(() => {
        expect(screen.getByText('Preparing export...')).toBeInTheDocument();
      });
    });
  });

  describe('Database Export', () => {
    it('should export complete database', async () => {
      const user = userEvent.setup();
      const mockExportResult = {
        content: '{"version": "1.0.0"}',
        filename: 'backup.json',
        mimeType: 'application/json'
      };

      vi.mocked(exportService.exportDatabase).mockResolvedValue(mockExportResult);

      render(<ExportModal isOpen={true} onClose={vi.fn()} />);
      
      await user.click(screen.getByText('Export'));

      await waitFor(() => {
        expect(exportService.exportDatabase).toHaveBeenCalled();
      });

      expect(screen.getByText('Database backup created: backup.json')).toBeInTheDocument();
    });
  });

  describe('Modal Controls', () => {
    it('should close modal when close button is clicked', async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();

      render(<ExportModal isOpen={true} onClose={onClose} />);
      
      await user.click(screen.getByRole('button', { name: /close/i }));
      expect(onClose).toHaveBeenCalled();
    });

    it('should close modal when cancel button is clicked', async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();

      render(<ExportModal isOpen={true} onClose={onClose} />);
      
      await user.click(screen.getByText('Cancel'));
      expect(onClose).toHaveBeenCalled();
    });

    it('should disable buttons during export', async () => {
      const user = userEvent.setup();
      vi.mocked(exportService.exportDatabase).mockImplementation(
        () => new Promise(resolve => setTimeout(resolve, 1000))
      );

      render(<ExportModal isOpen={true} onClose={vi.fn()} />);
      
      await user.click(screen.getByText('Export'));

      expect(screen.getByText('Exporting...')).toBeInTheDocument();
      expect(screen.getByText('Cancel')).toBeDisabled();
    });
  });

  describe('Mode Selection', () => {
    it('should switch between export modes', async () => {
      const user = userEvent.setup();

      render(
        <ExportModal 
          isOpen={true} 
          onClose={vi.fn()} 
          selectedNoteIds={['note-1']} 
        />
      );
      
      // Should start in bulk mode
      expect(screen.getByDisplayValue('bulk')).toBeChecked();
      
      // Switch to database mode
      await user.click(screen.getByDisplayValue('database'));
      expect(screen.getByDisplayValue('database')).toBeChecked();
      
      // Format selection should be hidden for database mode
      expect(screen.queryByText('Export Format')).not.toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      render(<ExportModal isOpen={true} onClose={vi.fn()} noteId="note-1" />);
      
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /export/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
    });

    it('should support keyboard navigation', async () => {
      const user = userEvent.setup();
      render(<ExportModal isOpen={true} onClose={vi.fn()} noteId="note-1" />);
      
      // Tab through format options
      await user.tab();
      expect(screen.getByText('Markdown')).toHaveFocus();
      
      await user.tab();
      expect(screen.getByText('HTML')).toHaveFocus();
    });
  });
});