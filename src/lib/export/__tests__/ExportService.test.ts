/**
 * Tests for ExportService
 * Requirements: 8.1, 8.2, 8.3, 8.4
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { ExportService } from '../ExportService';
import { databaseService } from '../../db/DatabaseService';
import { Note, Folder } from '../../../types';

// Mock dependencies
vi.mock('../../db/DatabaseService');
const mockZipInstance = {
  file: vi.fn(),
  folder: vi.fn(),
  generateAsync: vi.fn().mockResolvedValue(new Blob(['mock zip content']))
};

vi.mock('jszip', () => ({
  default: vi.fn().mockImplementation(() => mockZipInstance)
}));

// Mock unified and related packages
vi.mock('unified', () => ({
  unified: vi.fn(() => ({
    use: vi.fn().mockReturnThis(),
    process: vi.fn().mockResolvedValue({ toString: () => '<p>Mock HTML content</p>' })
  }))
}));

vi.mock('remark-parse', () => ({ default: vi.fn() }));
vi.mock('remark-rehype', () => ({ default: vi.fn() }));
vi.mock('rehype-stringify', () => ({ default: vi.fn() }));
vi.mock('rehype-highlight', () => ({ default: vi.fn() }));

// Mock clipboard API
Object.assign(navigator, {
  clipboard: {
    writeText: vi.fn().mockResolvedValue(undefined),
    write: vi.fn().mockResolvedValue(undefined)
  }
});

// Mock ClipboardItem
global.ClipboardItem = vi.fn().mockImplementation((data) => ({ 
  data,
  supports: vi.fn().mockReturnValue(true)
})) as any;

describe('ExportService', () => {
  let exportService: ExportService;
  let mockNote: Note;
  let mockFolder: Folder;

  beforeEach(() => {
    exportService = new ExportService();
    
    mockNote = {
      id: 'note-1',
      title: 'Test Note',
      content: '# Test Content\n\nThis is a **test** note with `code`.',
      folderId: 'folder-1',
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-02'),
      tags: ['test', 'example'],
      wordCount: 10,
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

    // Reset mocks
    vi.clearAllMocks();
    mockZipInstance.file.mockClear();
    mockZipInstance.folder.mockClear();
    mockZipInstance.generateAsync.mockClear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('exportNote', () => {
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

    it('should export note as markdown', async () => {
      const result = await exportService.exportNote('note-1', { format: 'markdown' });

      expect(result.content).toBe(mockNote.content);
      expect(result.filename).toBe('Test-Note.md');
      expect(result.mimeType).toBe('text/markdown');
    });

    it('should export note as markdown with metadata', async () => {
      const result = await exportService.exportNote('note-1', { 
        format: 'markdown', 
        includeMetadata: true 
      });

      expect(result.content).toContain('# Test Note');
      expect(result.content).toContain('**Created:**');
      expect(result.content).toContain('**Modified:**');
      expect(result.content).toContain('**Folder:** Test Folder');
      expect(result.content).toContain('**Word Count:** 10');
      expect(result.content).toContain('**Reading Time:** 1 min');
      expect(result.content).toContain('**Tags:** test, example');
      expect(result.content).toContain('---');
      expect(result.content).toContain(mockNote.content);
    });

    it('should export note as HTML', async () => {
      const result = await exportService.exportNote('note-1', { format: 'html' });

      expect(result.content).toContain('<!DOCTYPE html>');
      expect(result.content).toContain('<title>Test Note</title>');
      expect(result.content).toContain('<p>Mock HTML content</p>');
      expect(result.filename).toBe('Test-Note.html');
      expect(result.mimeType).toBe('text/html');
    });

    it('should export note as HTML with metadata', async () => {
      const result = await exportService.exportNote('note-1', { 
        format: 'html', 
        includeMetadata: true 
      });

      expect(result.content).toContain('<div class="metadata">');
      expect(result.content).toContain('<h2>Test Note</h2>');
      expect(result.content).toContain('<strong>Created:</strong>');
      expect(result.content).toContain('<strong>Tags:</strong> test, example');
    });

    it('should export note as JSON', async () => {
      const result = await exportService.exportNote('note-1', { format: 'json' });

      const parsedContent = JSON.parse(result.content);
      expect(parsedContent.note.id).toBe(mockNote.id);
      expect(parsedContent.note.title).toBe(mockNote.title);
      expect(parsedContent.note.content).toBe(mockNote.content);
      expect(parsedContent.folder).toEqual({
        id: mockFolder.id,
        name: mockFolder.name,
        path: mockFolder.name
      });
      expect(parsedContent.format).toBe('json');
      expect(result.filename).toBe('Test-Note.json');
      expect(result.mimeType).toBe('application/json');
    });

    it('should export note as plain text', async () => {
      const result = await exportService.exportNote('note-1', { format: 'txt' });

      expect(result.content).toBe('Test Content\n\nThis is a test note with code.');
      expect(result.filename).toBe('Test-Note.txt');
      expect(result.mimeType).toBe('text/plain');
    });

    it('should export note as plain text with metadata', async () => {
      const result = await exportService.exportNote('note-1', { 
        format: 'txt', 
        includeMetadata: true 
      });

      expect(result.content).toContain('Test Note');
      expect(result.content).toContain('='.repeat('Test Note'.length));
      expect(result.content).toContain('Created:');
      expect(result.content).toContain('Tags: test, example');
      expect(result.content).toContain('-'.repeat(50));
    });

    it('should handle note not found', async () => {
      vi.mocked(databaseService.getNoteById).mockResolvedValue({
        success: false,
        error: 'Note not found'
      });

      await expect(exportService.exportNote('invalid-id', { format: 'markdown' }))
        .rejects.toThrow('Note not found: invalid-id');
    });

    it('should sanitize filename', async () => {
      const noteWithSpecialChars = {
        ...mockNote,
        title: 'Test/Note<>:"|?*'
      };

      vi.mocked(databaseService.getNoteById).mockResolvedValue({
        success: true,
        data: noteWithSpecialChars
      });

      const result = await exportService.exportNote('note-1', { format: 'markdown' });
      expect(result.filename).toBe('Test-Note.md');
    });
  });

  describe('exportBulk', () => {
    const mockNotes = [mockNote, { ...mockNote, id: 'note-2', title: 'Second Note' }];
    const mockFolders = [mockFolder];

    beforeEach(() => {
      vi.mocked(databaseService.getAllNotes).mockResolvedValue({
        success: true,
        data: mockNotes
      });
      vi.mocked(databaseService.getAllFolders).mockResolvedValue({
        success: true,
        data: mockFolders
      });
      
      // Mock folder lookup for export
      vi.mocked(databaseService.getFolderById).mockResolvedValue({
        success: true,
        data: mockFolder
      });
    });

    it('should export multiple notes as ZIP', async () => {
      const progressCallback = vi.fn();
      
      const result = await exportService.exportBulk({
        format: 'markdown',
        selectedNoteIds: ['note-1', 'note-2']
      }, progressCallback);

      expect(result.content).toBeInstanceOf(Blob);
      expect(result.filename).toMatch(/devnotes-export-\d{4}-\d{2}-\d{2}\.zip/);
      expect(result.mimeType).toBe('application/zip');
      expect(progressCallback).toHaveBeenCalled();
    });

    it('should call progress callback with correct values', async () => {
      const progressCallback = vi.fn();
      
      await exportService.exportBulk({
        format: 'markdown',
        selectedNoteIds: ['note-1', 'note-2']
      }, progressCallback);

      expect(progressCallback).toHaveBeenCalledWith({
        current: 0,
        total: 2,
        status: 'preparing',
        message: 'Preparing export...'
      });

      expect(progressCallback).toHaveBeenCalledWith({
        current: 2,
        total: 2,
        status: 'complete',
        message: 'Creating archive...'
      });
    });

    it('should filter notes by selected note IDs', async () => {
      await exportService.exportBulk({
        format: 'markdown',
        selectedNoteIds: ['note-1']
      });

      expect(databaseService.getAllNotes).toHaveBeenCalled();
      expect(databaseService.getAllFolders).toHaveBeenCalled();
    });

    it('should filter notes by selected folder IDs', async () => {
      await exportService.exportBulk({
        format: 'markdown',
        selectedFolderIds: ['folder-1']
      });

      expect(databaseService.getAllNotes).toHaveBeenCalled();
      expect(databaseService.getAllFolders).toHaveBeenCalled();
    });
  });

  describe('exportDatabase', () => {
    it('should export complete database as JSON', async () => {
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

      expect(result.content).toBe(JSON.stringify(mockExportData, null, 2));
      expect(result.filename).toMatch(/devnotes-backup-\d{4}-\d{2}-\d{2}\.json/);
      expect(result.mimeType).toBe('application/json');
    });

    it('should handle database export failure', async () => {
      vi.mocked(databaseService.exportData).mockResolvedValue({
        success: false,
        error: 'Export failed'
      });

      await expect(exportService.exportDatabase())
        .rejects.toThrow('Failed to export database');
    });
  });

  describe('copyToClipboard', () => {
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

    it('should copy markdown to clipboard', async () => {
      await exportService.copyToClipboard('note-1', 'markdown');

      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(mockNote.content);
    });

    it('should copy HTML to clipboard with both formats', async () => {
      await exportService.copyToClipboard('note-1', 'html');

      expect(navigator.clipboard.write).toHaveBeenCalled();
      expect(ClipboardItem).toHaveBeenCalledWith({
        'text/html': expect.any(Blob),
        'text/plain': expect.any(Blob)
      });
    });
  });

  describe('generateEmailLink', () => {
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

    it('should generate mailto link with markdown content', async () => {
      const emailLink = await exportService.generateEmailLink('note-1', 'markdown');

      expect(emailLink).toContain('mailto:?subject=');
      expect(emailLink).toContain(encodeURIComponent('DevNotes: Test Note'));
      expect(emailLink).toContain('&body=');
      expect(emailLink).toContain(encodeURIComponent(mockNote.content));
    });

    it('should handle note not found for email', async () => {
      vi.mocked(databaseService.getNoteById).mockResolvedValue({
        success: false,
        error: 'Note not found'
      });

      await expect(exportService.generateEmailLink('invalid-id'))
        .rejects.toThrow('Note not found: invalid-id');
    });
  });

  describe('filename sanitization', () => {
    it('should sanitize special characters', async () => {
      const service = new ExportService();
      const sanitized = (service as any).sanitizeFilename('Test/Note<>:"|?*');
      expect(sanitized).toBe('Test-Note');
    });

    it('should handle multiple spaces and dashes', async () => {
      const service = new ExportService();
      const sanitized = (service as any).sanitizeFilename('Test   Note---File');
      expect(sanitized).toBe('Test-Note-File');
    });

    it('should trim leading and trailing dashes', async () => {
      const service = new ExportService();
      const sanitized = (service as any).sanitizeFilename('-Test Note-');
      expect(sanitized).toBe('Test-Note');
    });

    it('should limit filename length', async () => {
      const service = new ExportService();
      const longName = 'a'.repeat(150);
      const sanitized = (service as any).sanitizeFilename(longName);
      expect(sanitized.length).toBe(100);
    });
  });

  describe('markdown stripping', () => {
    it('should strip markdown formatting', async () => {
      const service = new ExportService();
      const markdown = '# Header\n\n**Bold** and *italic* text with `code` and [link](url)';
      const stripped = (service as any).stripMarkdown(markdown);
      
      expect(stripped).toBe('Header\n\nBold and italic text with code and link');
    });

    it('should remove code blocks', async () => {
      const service = new ExportService();
      const markdown = 'Text\n\n```javascript\ncode here\n```\n\nMore text';
      const stripped = (service as any).stripMarkdown(markdown);
      
      expect(stripped).toContain('Text');
      expect(stripped).toContain('More text');
      expect(stripped).not.toContain('```');
      // The code content should be removed
      expect(stripped.replace(/\s+/g, ' ').trim()).toBe('Text More text');
    });

    it('should handle list items', async () => {
      const service = new ExportService();
      const markdown = '- Item 1\n- Item 2\n1. Numbered\n2. List';
      const stripped = (service as any).stripMarkdown(markdown);
      
      expect(stripped).toBe('Item 1\nItem 2\nNumbered\nList');
    });
  });

  describe('HTML utilities', () => {
    it('should escape HTML characters', async () => {
      const service = new ExportService();
      const text = '<script>alert("xss")</script>';
      const escaped = (service as any).escapeHTML(text);
      
      expect(escaped).toBe('&lt;script&gt;alert("xss")&lt;/script&gt;');
    });

    it('should strip HTML tags', async () => {
      const service = new ExportService();
      const html = '<p>Hello <strong>world</strong></p>';
      const stripped = (service as any).stripHTML(html);
      
      expect(stripped).toBe('Hello world');
    });
  });
});