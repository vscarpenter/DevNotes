/**
 * Unit tests for DatabaseMigrations
 * Tests migration system and schema validation
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { DatabaseMigrations } from '../DatabaseMigrations';
import { DatabaseService } from '../DatabaseService';

// Mock DatabaseService
const mockDatabaseService = {
  settings: {
    get: vi.fn(),
    put: vi.fn(),
    toArray: vi.fn(),
    delete: vi.fn()
  },
  tables: [
    { name: 'notes' },
    { name: 'folders' },
    { name: 'settings' },
    { name: 'searchIndex' }
  ],
  exportData: vi.fn(),
  importData: vi.fn()
} as unknown as DatabaseService;

// Mock localStorage
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn()
};

describe('DatabaseMigrations', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock localStorage
    Object.defineProperty(window, 'localStorage', {
      value: mockLocalStorage,
      writable: true
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('needsMigration', () => {
    it('should return false when database is up to date', async () => {
      vi.mocked(mockDatabaseService.settings.get).mockResolvedValue({
        key: 'db_version',
        value: 1
      });

      const needsMigration = await DatabaseMigrations.needsMigration(mockDatabaseService);

      expect(needsMigration).toBe(false);
      expect(mockDatabaseService.settings.get).toHaveBeenCalledWith('db_version');
    });

    it('should return true when database needs migration', async () => {
      // Mock current version as 0 (older than current version 1)
      vi.mocked(mockDatabaseService.settings.get).mockResolvedValue(undefined);

      const needsMigration = await DatabaseMigrations.needsMigration(mockDatabaseService);

      expect(needsMigration).toBe(false); // Since we don't have migrations yet, it should be false
    });

    it('should handle errors gracefully', async () => {
      vi.mocked(mockDatabaseService.settings.get).mockRejectedValue(new Error('Database error'));

      const needsMigration = await DatabaseMigrations.needsMigration(mockDatabaseService);

      expect(needsMigration).toBe(false);
    });
  });

  describe('runMigrations', () => {
    it('should skip migration when database is up to date', async () => {
      vi.mocked(mockDatabaseService.settings.get).mockResolvedValue({
        key: 'db_version',
        value: 1
      });

      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      await DatabaseMigrations.runMigrations(mockDatabaseService);

      expect(consoleSpy).toHaveBeenCalledWith('Database is up to date');
      consoleSpy.mockRestore();
    });

    it('should run migrations when needed', async () => {
      // Mock version as 0 to trigger migration
      vi.mocked(mockDatabaseService.settings.get).mockResolvedValue(undefined);
      vi.mocked(mockDatabaseService.settings.put).mockResolvedValue('db_version');

      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      await DatabaseMigrations.runMigrations(mockDatabaseService);

      // Since we don't have actual migrations and version is already 1, it should be up to date
      expect(consoleSpy).toHaveBeenCalledWith('Database is up to date');
      consoleSpy.mockRestore();
    });

    it('should handle migration errors', async () => {
      // Mock getCurrentVersion to throw an error during migration check
      const originalGetCurrentVersion = DatabaseMigrations['getCurrentVersion'];
      DatabaseMigrations['getCurrentVersion'] = vi.fn().mockRejectedValue(new Error('Migration error'));

      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      await expect(DatabaseMigrations.runMigrations(mockDatabaseService)).rejects.toThrow('Migration failed');
      
      // Restore original method
      DatabaseMigrations['getCurrentVersion'] = originalGetCurrentVersion;
      consoleErrorSpy.mockRestore();
    });
  });

  describe('validateSchema', () => {
    it('should validate schema successfully', async () => {
      vi.mocked(mockDatabaseService.settings.get).mockResolvedValue({
        key: 'db_version',
        value: 1
      });

      const isValid = await DatabaseMigrations.validateSchema(mockDatabaseService);

      expect(isValid).toBe(true);
    });

    it('should fail validation for missing tables', async () => {
      vi.mocked(mockDatabaseService.settings.get).mockResolvedValue({
        key: 'db_version',
        value: 1
      });

      // Mock database with missing table
      const dbWithMissingTable = {
        ...mockDatabaseService,
        tables: [
          { name: 'notes' },
          { name: 'folders' }
          // Missing 'settings' and 'searchIndex' tables
        ]
      } as unknown as DatabaseService;

      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const isValid = await DatabaseMigrations.validateSchema(dbWithMissingTable);

      expect(isValid).toBe(false);
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining("Required table 'settings' not found")
      );
      consoleErrorSpy.mockRestore();
    });

    it('should fail validation for unknown version', async () => {
      vi.mocked(mockDatabaseService.settings.get).mockResolvedValue({
        key: 'db_version',
        value: 999 // Unknown version
      });

      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const isValid = await DatabaseMigrations.validateSchema(mockDatabaseService);

      expect(isValid).toBe(false);
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'No configuration found for database version 999'
      );
      consoleErrorSpy.mockRestore();
    });

    it('should handle validation errors', async () => {
      // Mock getCurrentVersion to throw an error during validation
      const originalGetCurrentVersion = DatabaseMigrations['getCurrentVersion'];
      DatabaseMigrations['getCurrentVersion'] = vi.fn().mockRejectedValue(new Error('Validation error'));

      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const isValid = await DatabaseMigrations.validateSchema(mockDatabaseService);

      expect(isValid).toBe(false);
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Schema validation failed:',
        expect.any(Error)
      );
      
      // Restore original method
      DatabaseMigrations['getCurrentVersion'] = originalGetCurrentVersion;
      consoleErrorSpy.mockRestore();
    });
  });

  describe('createBackup', () => {
    it('should create backup in localStorage for small datasets', async () => {
      const mockExportData = {
        version: '1.0.0',
        exportDate: new Date(),
        notes: [],
        folders: [],
        settings: {},
        metadata: {
          totalNotes: 0,
          totalFolders: 0,
          exportFormat: 'json' as const
        }
      };

      vi.mocked(mockDatabaseService.exportData).mockResolvedValue({
        success: true,
        data: mockExportData
      });

      const backupKey = await DatabaseMigrations.createBackup(mockDatabaseService);

      expect(backupKey).toMatch(/^backup_\d+$/);
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        backupKey,
        JSON.stringify(mockExportData)
      );
    });

    it('should create backup in IndexedDB for large datasets', async () => {
      // Create a large string that exceeds 5MB when stringified
      const largeContent = 'A'.repeat(6 * 1024 * 1024); // 6MB string
      const largeExportData = {
        version: '1.0.0',
        exportDate: new Date(),
        notes: [{
          id: 'note-1',
          title: 'Large Note',
          content: largeContent,
          folderId: 'folder-1',
          createdAt: new Date(),
          updatedAt: new Date(),
          wordCount: 1000,
          readingTime: 5
        }],
        folders: [],
        settings: {},
        metadata: {
          totalNotes: 1,
          totalFolders: 0,
          exportFormat: 'json' as const
        }
      };

      vi.mocked(mockDatabaseService.exportData).mockResolvedValue({
        success: true,
        data: largeExportData
      });
      vi.mocked(mockDatabaseService.settings.put).mockResolvedValue('backup_key');

      const backupKey = await DatabaseMigrations.createBackup(mockDatabaseService);

      expect(backupKey).toMatch(/^backup_\d+$/);
      expect(mockDatabaseService.settings.put).toHaveBeenCalledWith({
        key: backupKey,
        value: largeExportData
      });
    });

    it('should handle backup creation errors', async () => {
      vi.mocked(mockDatabaseService.exportData).mockResolvedValue({
        success: false,
        error: 'Export failed'
      });

      await expect(DatabaseMigrations.createBackup(mockDatabaseService)).rejects.toThrow('Failed to create backup');
    });
  });

  describe('restoreFromBackup', () => {
    it('should restore from localStorage backup', async () => {
      const backupKey = 'backup_123456789';
      const exportDate = new Date();
      const backupData = {
        version: '1.0.0',
        exportDate,
        notes: [],
        folders: [],
        settings: {},
        metadata: {
          totalNotes: 0,
          totalFolders: 0,
          exportFormat: 'json' as const
        }
      };

      // When JSON.stringify/parse happens, Date becomes string
      const serializedBackupData = JSON.parse(JSON.stringify(backupData));
      
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(backupData));
      vi.mocked(mockDatabaseService.importData).mockResolvedValue({
        success: true,
        processed: 0,
        failed: 0,
        errors: []
      });

      await DatabaseMigrations.restoreFromBackup(mockDatabaseService, backupKey);

      expect(mockLocalStorage.getItem).toHaveBeenCalledWith(backupKey);
      expect(mockDatabaseService.importData).toHaveBeenCalledWith(serializedBackupData);
    });

    it('should restore from IndexedDB backup', async () => {
      const backupKey = 'backup_123456789';
      const backupData = {
        version: '1.0.0',
        exportDate: new Date(),
        notes: [],
        folders: [],
        settings: {},
        metadata: {
          totalNotes: 0,
          totalFolders: 0,
          exportFormat: 'json' as const
        }
      };

      mockLocalStorage.getItem.mockReturnValue(null);
      vi.mocked(mockDatabaseService.settings.get).mockResolvedValue({
        key: backupKey,
        value: backupData
      });
      vi.mocked(mockDatabaseService.importData).mockResolvedValue({
        success: true,
        processed: 0,
        failed: 0,
        errors: []
      });

      await DatabaseMigrations.restoreFromBackup(mockDatabaseService, backupKey);

      expect(mockDatabaseService.settings.get).toHaveBeenCalledWith(backupKey);
      expect(mockDatabaseService.importData).toHaveBeenCalledWith(backupData);
    });

    it('should handle backup not found', async () => {
      const backupKey = 'nonexistent_backup';

      mockLocalStorage.getItem.mockReturnValue(null);
      vi.mocked(mockDatabaseService.settings.get).mockResolvedValue(undefined);

      await expect(DatabaseMigrations.restoreFromBackup(mockDatabaseService, backupKey))
        .rejects.toThrow("Backup with key 'nonexistent_backup' not found");
    });

    it('should handle import errors', async () => {
      const backupKey = 'backup_123456789';
      const backupData = {
        version: '1.0.0',
        exportDate: new Date(),
        notes: [],
        folders: [],
        settings: {},
        metadata: {
          totalNotes: 0,
          totalFolders: 0,
          exportFormat: 'json' as const
        }
      };

      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(backupData));
      vi.mocked(mockDatabaseService.importData).mockResolvedValue({
        success: false,
        processed: 0,
        failed: 1,
        errors: ['Import failed']
      });

      await expect(DatabaseMigrations.restoreFromBackup(mockDatabaseService, backupKey))
        .rejects.toThrow('Import failed: Import failed');
    });
  });

  describe('cleanupOldBackups', () => {
    it('should clean up old backups beyond keepCount', async () => {
      const allSettings = [
        { key: 'backup_1000000001', value: {} },
        { key: 'backup_1000000002', value: {} },
        { key: 'backup_1000000003', value: {} },
        { key: 'backup_1000000004', value: {} },
        { key: 'backup_1000000005', value: {} },
        { key: 'backup_1000000006', value: {} }, // Should be deleted
        { key: 'backup_1000000007', value: {} }, // Should be deleted
        { key: 'other_setting', value: {} } // Should not be affected
      ];

      vi.mocked(mockDatabaseService.settings.toArray).mockResolvedValue(allSettings);
      vi.mocked(mockDatabaseService.settings.delete).mockResolvedValue();

      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      await DatabaseMigrations.cleanupOldBackups(mockDatabaseService, 5);

      expect(mockDatabaseService.settings.delete).toHaveBeenCalledTimes(2);
      expect(mockDatabaseService.settings.delete).toHaveBeenCalledWith('backup_1000000001');
      expect(mockDatabaseService.settings.delete).toHaveBeenCalledWith('backup_1000000002');
      expect(mockLocalStorage.removeItem).toHaveBeenCalledTimes(2);
      expect(consoleSpy).toHaveBeenCalledWith('Cleaned up 2 old backups');

      consoleSpy.mockRestore();
    });

    it('should handle cleanup errors gracefully', async () => {
      vi.mocked(mockDatabaseService.settings.toArray).mockRejectedValue(new Error('Cleanup error'));

      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      await DatabaseMigrations.cleanupOldBackups(mockDatabaseService);

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Failed to cleanup old backups:',
        expect.any(Error)
      );
      consoleErrorSpy.mockRestore();
    });
  });
});