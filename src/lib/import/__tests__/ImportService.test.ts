/**
 * Tests for ImportService
 * Requirements: 7.6, 8.1
 */

import { describe, it, expect, beforeEach, vi, Mock } from 'vitest';
import { ImportService } from '../ImportService';
import { databaseService } from '../../db/DatabaseService';
import { ExportData, Note, Folder } from '../../../types';

// Mock the database service
vi.mock('../../db/DatabaseService', () => ({
  databaseService: {
    getAllNotes: vi.fn(),
    getAllFolders: vi.fn(),
    createNote: vi.fn(),
    createFolder: vi.fn()
  }
}));

// Mock JSZip
vi.mock('jszip', () => ({
  default: vi.fn().mockImplementation(() => ({
    loadAsync: vi.fn(),
    file: vi.fn()
  }))
}));

describe('ImportService', () => {
  let importService: ImportService;
  let mockFile: File;
  let mockExportData: ExportData;

  beforeEach(() => {
    importService = new ImportService();
    vi.clearAllMocks();

    // Mock file
    mockFile = new File(['test content'], 'test.json', { type: 'application/json' });

    // Mock export data
    mockExportData = {
      version: '1.0.0',
      exportDate: new Date(),
      notes: [
        {
          id: 'note1',
          title: 'Test Note 1',
          content: 'Content 1',
          folderId: 'folder1',
          createdAt: new Date(),
          updatedAt: new Date(),
          wordCount: 2,
          readingTime: 1
        },
        {
          id: 'note2',
          title: 'Test Note 2',
          content: 'Content 2',
          folderId: 'folder2',
          createdAt: new Date(),
          updatedAt: new Date(),
          wordCount: 2,
          readingTime: 1
        }
      ] as Note[],
      folders: [
        {
          id: 'folder1',
          name: 'Folder 1',
          parentId: null,
          children: [],
          notes: ['note1'],
          createdAt: new Date(),
          updatedAt: new Date(),
          isExpanded: false
        },
        {
          id: 'folder2',
          name: 'Folder 2',
          parentId: 'folder1',
          children: [],
          notes: ['note2'],
          createdAt: new Date(),
          updatedAt: new Date(),
          isExpanded: false
        }
      ] as Folder[],
      settings: {},
      metadata: {
        totalNotes: 2,
        totalFolders: 2,
        exportFormat: 'json'
      }
    };

    // Setup default mocks
    (databaseService.getAllNotes as Mock).mockResolvedValue({
      success: true,
      data: []
    });
    (databaseService.getAllFolders as Mock).mockResolvedValue({
      success: true,
      data: []
    });
    (databaseService.createFolder as Mock).mockResolvedValue({
      success: true,
      data: { id: 'new-folder-id' }
    });
    (databaseService.createNote as Mock).mockResolvedValue({
      success: true,
      data: { id: 'new-note-id' }
    });
  });

  describe('importFromJSON', () => {
    it('should successfully import valid JSON data', async () => {
      // Mock FileReader
      const mockFileReader = {
        readAsText: vi.fn(),
        onload: null as any,
        onerror: null as any,
        result: JSON.stringify(mockExportData)
      };

      vi.spyOn(window, 'FileReader').mockImplementation(() => mockFileReader as any);

      // Mock the file reading
      setTimeout(() => {
        mockFileReader.onload();
      }, 0);

      const result = await importService.importFromJSON(mockFile, {
        format: 'json',
        conflictResolution: 'rename',
        validateData: true,
        preserveIds: false
      });

      expect(result.success).toBe(true);
      expect(result.importedFolders).toBe(2);
      expect(result.importedNotes).toBe(2);
      expect(result.errors).toHaveLength(0);
    });

    it('should handle file size validation', async () => {
      const largeFile = new File(['x'.repeat(60 * 1024 * 1024)], 'large.json', { 
        type: 'application/json' 
      });

      const result = await importService.importFromJSON(largeFile, {
        format: 'json',
        conflictResolution: 'skip',
        validateData: false,
        preserveIds: false
      });

      expect(result.success).toBe(false);
      expect(result.errors[0]).toContain('File size exceeds maximum limit');
    });

    it('should handle invalid JSON', async () => {
      const mockFileReader = {
        readAsText: vi.fn(),
        onload: null as any,
        onerror: null as any,
        result: 'invalid json'
      };

      vi.spyOn(window, 'FileReader').mockImplementation(() => mockFileReader as any);

      setTimeout(() => {
        mockFileReader.onload();
      }, 0);

      const result = await importService.importFromJSON(mockFile, {
        format: 'json',
        conflictResolution: 'skip',
        validateData: false,
        preserveIds: false
      });

      expect(result.success).toBe(false);
      expect(result.errors[0]).toContain('JSON import failed');
    });

    it('should call progress callback during import', async () => {
      const mockFileReader = {
        readAsText: vi.fn(),
        onload: null as any,
        onerror: null as any,
        result: JSON.stringify(mockExportData)
      };

      vi.spyOn(window, 'FileReader').mockImplementation(() => mockFileReader as any);

      const progressCallback = vi.fn();

      setTimeout(() => {
        mockFileReader.onload();
      }, 0);

      await importService.importFromJSON(mockFile, {
        format: 'json',
        conflictResolution: 'rename',
        validateData: false,
        preserveIds: false
      }, progressCallback);

      expect(progressCallback).toHaveBeenCalled();
      expect(progressCallback).toHaveBeenCalledWith(
        expect.objectContaining({
          status: expect.any(String),
          message: expect.any(String),
          current: expect.any(Number),
          total: expect.any(Number)
        })
      );
    });
  });

  describe('importFromZIP', () => {
    it('should extract and import ZIP file', async () => {
      const zipFile = new File(['zip content'], 'backup.zip', { type: 'application/zip' });

      // Mock JSZip
      const mockZip = {
        loadAsync: vi.fn().mockResolvedValue({
          file: vi.fn().mockReturnValue([
            {
              async: vi.fn().mockResolvedValue(JSON.stringify(mockExportData))
            }
          ])
        })
      };

      const JSZip = await import('jszip');
      (JSZip.default as any).mockImplementation(() => mockZip);

      const result = await importService.importFromZIP(zipFile, {
        format: 'zip',
        conflictResolution: 'rename',
        validateData: false,
        preserveIds: false
      });

      expect(result.success).toBe(true);
      expect(mockZip.loadAsync).toHaveBeenCalledWith(zipFile);
    });

    it('should handle ZIP without JSON file', async () => {
      const zipFile = new File(['zip content'], 'backup.zip', { type: 'application/zip' });

      const mockZip = {
        loadAsync: vi.fn().mockResolvedValue({
          file: vi.fn().mockReturnValue([]) // No JSON files
        })
      };

      const JSZip = await import('jszip');
      (JSZip.default as any).mockImplementation(() => mockZip);

      const result = await importService.importFromZIP(zipFile, {
        format: 'zip',
        conflictResolution: 'skip',
        validateData: false,
        preserveIds: false
      });

      expect(result.success).toBe(false);
      expect(result.errors[0]).toContain('No JSON backup file found');
    });
  });

  describe('data validation', () => {
    it('should validate required fields', async () => {
      const invalidData = {
        ...mockExportData,
        notes: [
          {
            id: 'note1',
            // Missing title
            content: 'Content',
            folderId: 'folder1',
            createdAt: new Date(),
            updatedAt: new Date(),
            wordCount: 1,
            readingTime: 1
          }
        ]
      };

      const mockFileReader = {
        readAsText: vi.fn(),
        onload: null as any,
        onerror: null as any,
        result: JSON.stringify(invalidData)
      };

      vi.spyOn(window, 'FileReader').mockImplementation(() => mockFileReader as any);

      setTimeout(() => {
        mockFileReader.onload();
      }, 0);

      const result = await importService.importFromJSON(mockFile, {
        format: 'json',
        conflictResolution: 'skip',
        validateData: true,
        preserveIds: false
      });

      expect(result.success).toBe(false);
      expect(result.errors.some(error => error.includes('missing required title field'))).toBe(true);
    });

    it('should detect duplicate IDs', async () => {
      const invalidData = {
        ...mockExportData,
        notes: [
          mockExportData.notes[0],
          { ...mockExportData.notes[0] } // Duplicate ID
        ]
      };

      const mockFileReader = {
        readAsText: vi.fn(),
        onload: null as any,
        onerror: null as any,
        result: JSON.stringify(invalidData)
      };

      vi.spyOn(window, 'FileReader').mockImplementation(() => mockFileReader as any);

      setTimeout(() => {
        mockFileReader.onload();
      }, 0);

      const result = await importService.importFromJSON(mockFile, {
        format: 'json',
        conflictResolution: 'skip',
        validateData: true,
        preserveIds: false
      });

      expect(result.success).toBe(false);
      expect(result.errors.some(error => error.includes('Duplicate note ID'))).toBe(true);
    });

    it('should validate folder references', async () => {
      const invalidData = {
        ...mockExportData,
        notes: [
          {
            ...mockExportData.notes[0],
            folderId: 'nonexistent-folder'
          }
        ]
      };

      const mockFileReader = {
        readAsText: vi.fn(),
        onload: null as any,
        onerror: null as any,
        result: JSON.stringify(invalidData)
      };

      vi.spyOn(window, 'FileReader').mockImplementation(() => mockFileReader as any);

      setTimeout(() => {
        mockFileReader.onload();
      }, 0);

      const result = await importService.importFromJSON(mockFile, {
        format: 'json',
        conflictResolution: 'skip',
        validateData: true,
        preserveIds: false
      });

      expect(result.success).toBe(false);
      expect(result.errors.some(error => error.includes('references non-existent folder'))).toBe(true);
    });
  });

  describe('conflict resolution', () => {
    beforeEach(() => {
      // Mock existing data with conflicts
      (databaseService.getAllNotes as Mock).mockResolvedValue({
        success: true,
        data: [
          {
            id: 'existing-note',
            title: 'Test Note 1', // Same title as imported note
            content: 'Existing content',
            folderId: 'existing-folder',
            createdAt: new Date(),
            updatedAt: new Date(),
            wordCount: 2,
            readingTime: 1
          }
        ]
      });

      (databaseService.getAllFolders as Mock).mockResolvedValue({
        success: true,
        data: [
          {
            id: 'existing-folder',
            name: 'Folder 1', // Same name as imported folder
            parentId: null,
            children: [],
            notes: ['existing-note'],
            createdAt: new Date(),
            updatedAt: new Date(),
            isExpanded: false
          }
        ]
      });
    });

    it('should skip conflicting items when resolution is skip', async () => {
      const mockFileReader = {
        readAsText: vi.fn(),
        onload: null as any,
        onerror: null as any,
        result: JSON.stringify(mockExportData)
      };

      vi.spyOn(window, 'FileReader').mockImplementation(() => mockFileReader as any);

      setTimeout(() => {
        mockFileReader.onload();
      }, 0);

      const result = await importService.importFromJSON(mockFile, {
        format: 'json',
        conflictResolution: 'skip',
        validateData: false,
        preserveIds: false
      });

      expect(result.skippedItems).toBeGreaterThan(0);
      expect(result.conflicts.some(c => c.resolution === 'skipped')).toBe(true);
    });

    it('should rename conflicting items when resolution is rename', async () => {
      const mockFileReader = {
        readAsText: vi.fn(),
        onload: null as any,
        onerror: null as any,
        result: JSON.stringify(mockExportData)
      };

      vi.spyOn(window, 'FileReader').mockImplementation(() => mockFileReader as any);

      setTimeout(() => {
        mockFileReader.onload();
      }, 0);

      const result = await importService.importFromJSON(mockFile, {
        format: 'json',
        conflictResolution: 'rename',
        validateData: false,
        preserveIds: false
      });

      expect(result.conflicts.some(c => c.resolution === 'renamed')).toBe(true);
      expect(result.conflicts.some(c => c.newName?.includes('(1)'))).toBe(true);
    });
  });

  describe('version compatibility', () => {
    it('should reject unsupported versions', async () => {
      const unsupportedData = {
        ...mockExportData,
        version: '2.0.0' // Unsupported version
      };

      const mockFileReader = {
        readAsText: vi.fn(),
        onload: null as any,
        onerror: null as any,
        result: JSON.stringify(unsupportedData)
      };

      vi.spyOn(window, 'FileReader').mockImplementation(() => mockFileReader as any);

      setTimeout(() => {
        mockFileReader.onload();
      }, 0);

      const result = await importService.importFromJSON(mockFile, {
        format: 'json',
        conflictResolution: 'skip',
        validateData: false,
        preserveIds: false
      });

      expect(result.success).toBe(false);
      expect(result.errors[0]).toContain('Unsupported data version: 2.0.0');
    });

    it('should accept supported versions', async () => {
      const mockFileReader = {
        readAsText: vi.fn(),
        onload: null as any,
        onerror: null as any,
        result: JSON.stringify(mockExportData) // Version 1.0.0
      };

      vi.spyOn(window, 'FileReader').mockImplementation(() => mockFileReader as any);

      setTimeout(() => {
        mockFileReader.onload();
      }, 0);

      const result = await importService.importFromJSON(mockFile, {
        format: 'json',
        conflictResolution: 'rename',
        validateData: false,
        preserveIds: false
      });

      expect(result.success).toBe(true);
    });
  });

  describe('error handling', () => {
    it('should handle database errors gracefully', async () => {
      (databaseService.createFolder as Mock).mockResolvedValue({
        success: false,
        error: 'Database error'
      });

      const mockFileReader = {
        readAsText: vi.fn(),
        onload: null as any,
        onerror: null as any,
        result: JSON.stringify(mockExportData)
      };

      vi.spyOn(window, 'FileReader').mockImplementation(() => mockFileReader as any);

      setTimeout(() => {
        mockFileReader.onload();
      }, 0);

      const result = await importService.importFromJSON(mockFile, {
        format: 'json',
        conflictResolution: 'rename',
        validateData: false,
        preserveIds: false
      });

      expect(result.failed).toBeGreaterThan(0);
      expect(result.errors.some(error => error.includes('Database error'))).toBe(true);
    });

    it('should handle file reading errors', async () => {
      const mockFileReader = {
        readAsText: vi.fn(),
        onload: null as any,
        onerror: null as any,
        result: null
      };

      vi.spyOn(window, 'FileReader').mockImplementation(() => mockFileReader as any);

      setTimeout(() => {
        mockFileReader.onerror();
      }, 0);

      const result = await importService.importFromJSON(mockFile, {
        format: 'json',
        conflictResolution: 'skip',
        validateData: false,
        preserveIds: false
      });

      expect(result.success).toBe(false);
      expect(result.errors[0]).toContain('Failed to read file');
    });
  });

  describe('data migration', () => {
    it('should handle same version migration', async () => {
      const result = await importService.migrateData('1.0.0', '1.0.0');
      
      expect(result.success).toBe(true);
      expect(result.processed).toBe(0);
      expect(result.failed).toBe(0);
    });

    it('should reject unsupported migrations', async () => {
      const result = await importService.migrateData('0.9.0', '1.0.0');
      
      expect(result.success).toBe(false);
      expect(result.errors[0]).toContain('Migration from 0.9.0 to 1.0.0 not supported');
    });
  });
});