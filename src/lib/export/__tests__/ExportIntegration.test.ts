/**
 * Integration tests for export functionality
 * Requirements: 8.1, 8.2, 8.3, 8.4
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ExportService } from '../ExportService';
import { databaseService } from '../../db/DatabaseService';
import { Note, Folder } from '../../../types';

// Mock dependencies
vi.mock('../../db/DatabaseService');

describe('Export Integration', () => {
  let exportService: ExportService;
  let mockNote: Note;
  let mockFolder: Folder;

  beforeEach(() => {
    exportService = new ExportService();
    
    mockNote = {
      id: 'note-1',
      title: 'Integration Test Note',
      content: '# Test\n\nThis is a test note with **bold** text.',
      folderId: 'folder-1',
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-02'),
      tags: ['test'],
      wordCount: 8,
      readingTime: 1
    };

    mockFolder = {
      id: 'folder-1',
      name: 'Test Folder',
      parentId: null,
      children: [],
      notes: ['note-1'],
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
      isExpanded: true
    };

    vi.clearAllMocks();
  });

  describe('Single Note Export', () => {
    beforeEach(() => {
      vi.mocked(databaseService.getNoteById).mockResolvedValue({
        success: true,
        data: mockNote
      });
      vi.mocked(databaseService.getFolderById).mockResolvedValue({
        success: true,
        data: mockFolder
      });
    });

    it('should export note in all supported formats', async () => {
      const formats = ['markdown', 'html', 'json', 'txt'] as const;
      
      for (const format of formats) {
        const result = await exportService.exportNote('note-1', { format });
        
        expect(result.content).toBeTruthy();
        expect(result.filename).toContain('Integration-Test-Note');
        const expectedExtension = format === 'markdown' ? 'md' : format;
        expect(result.filename).toMatch(new RegExp(`\\.(${expectedExtension})$`));
        
        // Verify content contains note data
        if (format === 'json') {
          const parsed = JSON.parse(result.content);
          expect(parsed.note.title).toBe(mockNote.title);
        } else {
          expect(result.content).toContain('Test');
        }
      }
    });

    it('should include metadata when requested', async () => {
      const result = await exportService.exportNote('note-1', { 
        format: 'markdown', 
        includeMetadata: true 
      });
      
      expect(result.content).toContain('Integration Test Note');
      expect(result.content).toContain('Test Folder');
      expect(result.content).toContain('Word Count');
      expect(result.content).toContain('---');
    });
  });

  describe('Database Export', () => {
    it('should export complete database', async () => {
      const mockExportData = {
        version: '1.0.0',
        exportDate: new Date(),
        notes: [mockNote],
        folders: [mockFolder],
        settings: {},
        metadata: {
          totalNotes: 1,
          totalFolders: 1,
          exportFormat: 'json' as const
        }
      };

      vi.mocked(databaseService.exportData).mockResolvedValue({
        success: true,
        data: mockExportData
      });

      const result = await exportService.exportDatabase();
      
      expect(result.content).toBeTruthy();
      expect(result.filename).toMatch(/devnotes-backup-\d{4}-\d{2}-\d{2}\.json/);
      expect(result.mimeType).toBe('application/json');
      
      const parsed = JSON.parse(result.content);
      expect(parsed.notes).toHaveLength(1);
      expect(parsed.folders).toHaveLength(1);
    });
  });

  describe('Error Handling', () => {
    it('should handle note not found gracefully', async () => {
      vi.mocked(databaseService.getNoteById).mockResolvedValue({
        success: false,
        error: 'Note not found'
      });

      await expect(exportService.exportNote('invalid-id', { format: 'markdown' }))
        .rejects.toThrow('Note not found: invalid-id');
    });

    it('should handle database export failure', async () => {
      vi.mocked(databaseService.exportData).mockResolvedValue({
        success: false,
        error: 'Database error'
      });

      await expect(exportService.exportDatabase())
        .rejects.toThrow('Failed to export database');
    });
  });

  describe('File Naming', () => {
    beforeEach(() => {
      vi.mocked(databaseService.getNoteById).mockResolvedValue({
        success: true,
        data: mockNote
      });
      vi.mocked(databaseService.getFolderById).mockResolvedValue({
        success: true,
        data: mockFolder
      });
    });

    it('should generate safe filenames', async () => {
      const noteWithUnsafeName = {
        ...mockNote,
        title: 'Test/Note<>:"|?*'
      };

      vi.mocked(databaseService.getNoteById).mockResolvedValue({
        success: true,
        data: noteWithUnsafeName
      });

      const result = await exportService.exportNote('note-1', { format: 'markdown' });
      
      // Should sanitize unsafe characters
      expect(result.filename).toBe('Test-Note.md');
      expect(result.filename).not.toContain('/');
      expect(result.filename).not.toContain('<');
      expect(result.filename).not.toContain('>');
    });
  });
});