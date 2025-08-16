/**
 * Integration tests for import functionality
 * Tests complete import workflow with real database operations
 * Requirements: 7.6, 8.1
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { ImportService } from '../ImportService';
import { databaseService } from '../../db/DatabaseService';
import { ExportData, Note, Folder } from '../../../types';

describe('Import Integration Tests', () => {
  let importService: ImportService;
  let testData: ExportData;

  beforeEach(async () => {
    importService = new ImportService();
    
    // Clear database
    await databaseService.notes.clear();
    await databaseService.folders.clear();
    await databaseService.settings.clear();

    // Create test data
    testData = {
      version: '1.0.0',
      exportDate: new Date(),
      notes: [
        {
          id: 'test-note-1',
          title: 'Integration Test Note 1',
          content: '# Test Content\n\nThis is a test note for integration testing.',
          folderId: 'test-folder-1',
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-02'),
          wordCount: 12,
          readingTime: 1,
          tags: ['test', 'integration']
        },
        {
          id: 'test-note-2',
          title: 'Integration Test Note 2',
          content: 'Another test note with different content.',
          folderId: 'test-folder-2',
          createdAt: new Date('2024-01-03'),
          updatedAt: new Date('2024-01-04'),
          wordCount: 8,
          readingTime: 1
        }
      ] as Note[],
      folders: [
        {
          id: 'test-folder-1',
          name: 'Test Folder 1',
          parentId: null,
          children: ['test-folder-2'],
          notes: ['test-note-1'],
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01'),
          isExpanded: true
        },
        {
          id: 'test-folder-2',
          name: 'Test Folder 2',
          parentId: 'test-folder-1',
          children: [],
          notes: ['test-note-2'],
          createdAt: new Date('2024-01-02'),
          updatedAt: new Date('2024-01-02'),
          isExpanded: false
        }
      ] as Folder[],
      settings: {
        theme: 'dark',
        sidebarWidth: 300
      },
      metadata: {
        totalNotes: 2,
        totalFolders: 2,
        exportFormat: 'json'
      }
    };
  });

  afterEach(async () => {
    // Clean up database
    await databaseService.notes.clear();
    await databaseService.folders.clear();
    await databaseService.settings.clear();
  });

  it('should import complete dataset successfully', async () => {
    // Create mock file
    const jsonContent = JSON.stringify(testData);
    const file = new File([jsonContent], 'test-backup.json', { type: 'application/json' });

    // Mock FileReader
    const originalFileReader = global.FileReader;
    global.FileReader = vi.fn().mockImplementation(() => ({
      readAsText: vi.fn(),
      onload: null,
      onerror: null,
      result: jsonContent
    })) as any;

    const mockFileReader = new FileReader();
    setTimeout(() => {
      if (mockFileReader.onload) {
        mockFileReader.onload({} as any);
      }
    }, 0);

    // Perform import
    const result = await importService.importFromJSON(file, {
      format: 'json',
      conflictResolution: 'rename',
      validateData: true,
      preserveIds: false
    });

    // Verify import result
    expect(result.success).toBe(true);
    expect(result.importedFolders).toBe(2);
    expect(result.importedNotes).toBe(2);
    expect(result.errors).toHaveLength(0);

    // Verify data in database
    const notesResult = await databaseService.getAllNotes();
    const foldersResult = await databaseService.getAllFolders();

    expect(notesResult.success).toBe(true);
    expect(foldersResult.success).toBe(true);
    expect(notesResult.data).toHaveLength(2);
    expect(foldersResult.data).toHaveLength(2);

    // Verify note content
    const importedNotes = notesResult.data!;
    expect(importedNotes.some(n => n.title === 'Integration Test Note 1')).toBe(true);
    expect(importedNotes.some(n => n.title === 'Integration Test Note 2')).toBe(true);

    // Verify folder hierarchy
    const importedFolders = foldersResult.data!;
    expect(importedFolders.some(f => f.name === 'Test Folder 1')).toBe(true);
    expect(importedFolders.some(f => f.name === 'Test Folder 2')).toBe(true);

    // Restore FileReader
    global.FileReader = originalFileReader;
  });

  it('should handle conflicts with existing data', async () => {
    // Create existing data
    const existingFolderResult = await databaseService.createFolder({
      name: 'Test Folder 1', // Same name as imported folder
      parentId: null
    });
    expect(existingFolderResult.success).toBe(true);

    const existingNoteResult = await databaseService.createNote({
      title: 'Integration Test Note 1', // Same title as imported note
      content: 'Existing content',
      folderId: existingFolderResult.data!.id,
      tags: ['existing']
    });
    expect(existingNoteResult.success).toBe(true);

    // Create mock file
    const jsonContent = JSON.stringify(testData);
    const file = new File([jsonContent], 'test-backup.json', { type: 'application/json' });

    // Mock FileReader
    const originalFileReader = global.FileReader;
    global.FileReader = vi.fn().mockImplementation(() => ({
      readAsText: vi.fn(),
      onload: null,
      onerror: null,
      result: jsonContent
    })) as any;

    const mockFileReader = new FileReader();
    setTimeout(() => {
      if (mockFileReader.onload) {
        mockFileReader.onload({} as any);
      }
    }, 0);

    // Perform import with rename conflict resolution
    const result = await importService.importFromJSON(file, {
      format: 'json',
      conflictResolution: 'rename',
      validateData: true,
      preserveIds: false
    });

    // Verify conflicts were handled
    expect(result.success).toBe(true);
    expect(result.conflicts.length).toBeGreaterThan(0);
    expect(result.conflicts.some(c => c.resolution === 'renamed')).toBe(true);

    // Verify renamed items exist
    const notesResult = await databaseService.getAllNotes();
    const foldersResult = await databaseService.getAllFolders();

    expect(notesResult.data!.length).toBeGreaterThan(2); // Original + imported
    expect(foldersResult.data!.length).toBeGreaterThan(2); // Original + imported

    // Restore FileReader
    global.FileReader = originalFileReader;
  });

  it('should validate data integrity before import', async () => {
    // Create invalid test data (missing required fields)
    const invalidData = {
      ...testData,
      notes: [
        {
          id: 'invalid-note',
          // Missing title
          content: 'Content without title',
          folderId: 'nonexistent-folder', // Invalid folder reference
          createdAt: new Date(),
          updatedAt: new Date(),
          wordCount: 3,
          readingTime: 1
        }
      ]
    };

    const jsonContent = JSON.stringify(invalidData);
    const file = new File([jsonContent], 'invalid-backup.json', { type: 'application/json' });

    // Mock FileReader
    const originalFileReader = global.FileReader;
    global.FileReader = vi.fn().mockImplementation(() => ({
      readAsText: vi.fn(),
      onload: null,
      onerror: null,
      result: jsonContent
    })) as any;

    const mockFileReader = new FileReader();
    setTimeout(() => {
      if (mockFileReader.onload) {
        mockFileReader.onload({} as any);
      }
    }, 0);

    // Perform import with validation enabled
    const result = await importService.importFromJSON(file, {
      format: 'json',
      conflictResolution: 'rename',
      validateData: true,
      preserveIds: false
    });

    // Verify validation caught the errors
    expect(result.success).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
    expect(result.errors.some(e => e.includes('missing required title field'))).toBe(true);
    expect(result.errors.some(e => e.includes('references non-existent folder'))).toBe(true);

    // Verify no data was imported
    const notesResult = await databaseService.getAllNotes();
    const foldersResult = await databaseService.getAllFolders();

    expect(notesResult.data).toHaveLength(0);
    expect(foldersResult.data).toHaveLength(0);

    // Restore FileReader
    global.FileReader = originalFileReader;
  });

  it('should handle progress callbacks during import', async () => {
    const jsonContent = JSON.stringify(testData);
    const file = new File([jsonContent], 'test-backup.json', { type: 'application/json' });

    // Mock FileReader
    const originalFileReader = global.FileReader;
    global.FileReader = vi.fn().mockImplementation(() => ({
      readAsText: vi.fn(),
      onload: null,
      onerror: null,
      result: jsonContent
    })) as any;

    const mockFileReader = new FileReader();
    setTimeout(() => {
      if (mockFileReader.onload) {
        mockFileReader.onload({} as any);
      }
    }, 0);

    // Track progress callbacks
    const progressUpdates: any[] = [];
    const progressCallback = (progress: any) => {
      progressUpdates.push(progress);
    };

    // Perform import with progress tracking
    const result = await importService.importFromJSON(file, {
      format: 'json',
      conflictResolution: 'rename',
      validateData: false,
      preserveIds: false
    }, progressCallback);

    // Verify import succeeded
    expect(result.success).toBe(true);

    // Verify progress callbacks were called
    expect(progressUpdates.length).toBeGreaterThan(0);
    expect(progressUpdates.some(p => p.status === 'preparing')).toBe(true);
    expect(progressUpdates.some(p => p.status === 'processing')).toBe(true);
    expect(progressUpdates.some(p => p.status === 'complete')).toBe(true);

    // Verify progress phases
    expect(progressUpdates.some(p => p.phase === 'folders')).toBe(true);
    expect(progressUpdates.some(p => p.phase === 'notes')).toBe(true);

    // Restore FileReader
    global.FileReader = originalFileReader;
  });

  it('should preserve folder hierarchy during import', async () => {
    const jsonContent = JSON.stringify(testData);
    const file = new File([jsonContent], 'test-backup.json', { type: 'application/json' });

    // Mock FileReader
    const originalFileReader = global.FileReader;
    global.FileReader = vi.fn().mockImplementation(() => ({
      readAsText: vi.fn(),
      onload: null,
      onerror: null,
      result: jsonContent
    })) as any;

    const mockFileReader = new FileReader();
    setTimeout(() => {
      if (mockFileReader.onload) {
        mockFileReader.onload({} as any);
      }
    }, 0);

    // Perform import
    const result = await importService.importFromJSON(file, {
      format: 'json',
      conflictResolution: 'rename',
      validateData: false,
      preserveIds: false
    });

    expect(result.success).toBe(true);

    // Verify folder hierarchy
    const foldersResult = await databaseService.getAllFolders();
    const folders = foldersResult.data!;

    const parentFolder = folders.find(f => f.name === 'Test Folder 1');
    const childFolder = folders.find(f => f.name === 'Test Folder 2');

    expect(parentFolder).toBeDefined();
    expect(childFolder).toBeDefined();
    expect(childFolder!.parentId).toBe(parentFolder!.id);

    // Verify notes are in correct folders
    const notesResult = await databaseService.getAllNotes();
    const notes = notesResult.data!;

    const note1 = notes.find(n => n.title === 'Integration Test Note 1');
    const note2 = notes.find(n => n.title === 'Integration Test Note 2');

    expect(note1!.folderId).toBe(parentFolder!.id);
    expect(note2!.folderId).toBe(childFolder!.id);

    // Restore FileReader
    global.FileReader = originalFileReader;
  });

  it('should handle database errors gracefully', async () => {
    // Mock database service to simulate errors
    const originalCreateFolder = databaseService.createFolder;
    databaseService.createFolder = vi.fn().mockResolvedValue({
      success: false,
      error: 'Simulated database error'
    });

    const jsonContent = JSON.stringify(testData);
    const file = new File([jsonContent], 'test-backup.json', { type: 'application/json' });

    // Mock FileReader
    const originalFileReader = global.FileReader;
    global.FileReader = vi.fn().mockImplementation(() => ({
      readAsText: vi.fn(),
      onload: null,
      onerror: null,
      result: jsonContent
    })) as any;

    const mockFileReader = new FileReader();
    setTimeout(() => {
      if (mockFileReader.onload) {
        mockFileReader.onload({} as any);
      }
    }, 0);

    // Perform import
    const result = await importService.importFromJSON(file, {
      format: 'json',
      conflictResolution: 'rename',
      validateData: false,
      preserveIds: false
    });

    // Verify errors were handled
    expect(result.failed).toBeGreaterThan(0);
    expect(result.errors.some(e => e.includes('Simulated database error'))).toBe(true);

    // Restore mocks
    databaseService.createFolder = originalCreateFolder;
    global.FileReader = originalFileReader;
  });
});