/**
 * Database migration system for schema changes
 * Handles version upgrades and data migrations
 * Requirements: 7.6
 */

import { DatabaseService } from './DatabaseService';
import { MigrationScript, DatabaseVersion } from '../../types';

export class DatabaseMigrations {
  private static readonly CURRENT_VERSION = 1;
  private static readonly VERSION_KEY = 'db_version';

  /**
   * Available migration scripts
   */
  private static readonly migrations: MigrationScript[] = [
    // Example migration for future use
    // {
    //   version: 2,
    //   description: 'Add tags support to notes',
    //   up: async () => {
    //     // Migration logic here
    //   },
    //   down: async () => {
    //     // Rollback logic here
    //   }
    // }
  ];

  /**
   * Database version configurations
   */
  private static readonly versions: DatabaseVersion[] = [
    {
      version: 1,
      stores: {
        notes: '++id, title, content, folderId, createdAt, updatedAt, [folderId+updatedAt]',
        folders: '++id, name, parentId, createdAt, updatedAt, [parentId+name]',
        tags: '++id, name, color, createdAt, usageCount',
        settings: '++key, value',
        searchIndex: '++noteId, lastIndexed'
      }
    }
  ];

  /**
   * Check if database needs migration
   */
  static async needsMigration(db: DatabaseService): Promise<boolean> {
    try {
      const currentVersion = await this.getCurrentVersion(db);
      return currentVersion < this.CURRENT_VERSION;
    } catch (error) {
      console.error('Error checking migration status:', error);
      return false;
    }
  }

  /**
   * Run all pending migrations
   */
  static async runMigrations(db: DatabaseService): Promise<void> {
    try {
      const currentVersion = await this.getCurrentVersion(db);
      
      if (currentVersion >= this.CURRENT_VERSION) {
        console.log('Database is up to date');
        return;
      }

      console.log(`Migrating database from version ${currentVersion} to ${this.CURRENT_VERSION}`);

      // Run migrations in sequence
      for (const migration of this.migrations) {
        if (migration.version > currentVersion) {
          console.log(`Running migration: ${migration.description}`);
          await migration.up();
          await this.setCurrentVersion(db, migration.version);
        }
      }

      console.log('Database migration completed successfully');
    } catch (error) {
      console.error('Database migration failed:', error);
      throw new Error(`Migration failed: ${error}`);
    }
  }

  /**
   * Rollback to a specific version
   */
  static async rollbackToVersion(db: DatabaseService, targetVersion: number): Promise<void> {
    try {
      const currentVersion = await this.getCurrentVersion(db);
      
      if (targetVersion >= currentVersion) {
        console.log('No rollback needed');
        return;
      }

      console.log(`Rolling back database from version ${currentVersion} to ${targetVersion}`);

      // Run rollbacks in reverse order
      const migrationsToRollback = this.migrations
        .filter(m => m.version > targetVersion && m.version <= currentVersion)
        .sort((a, b) => b.version - a.version);

      for (const migration of migrationsToRollback) {
        console.log(`Rolling back migration: ${migration.description}`);
        await migration.down();
      }

      await this.setCurrentVersion(db, targetVersion);
      console.log('Database rollback completed successfully');
    } catch (error) {
      console.error('Database rollback failed:', error);
      throw new Error(`Rollback failed: ${error}`);
    }
  }

  /**
   * Get current database version
   */
  private static async getCurrentVersion(db: DatabaseService): Promise<number> {
    try {
      const versionRecord = await db.settings.get(this.VERSION_KEY);
      return versionRecord?.value || 1;
    } catch (error) {
      // If settings table doesn't exist or version not found, assume version 1
      return 1;
    }
  }

  /**
   * Set current database version
   */
  private static async setCurrentVersion(db: DatabaseService, version: number): Promise<void> {
    await db.settings.put({ key: this.VERSION_KEY, value: version });
  }

  /**
   * Validate database schema
   */
  static async validateSchema(db: DatabaseService): Promise<boolean> {
    try {
      const currentVersion = await this.getCurrentVersion(db);
      const versionConfig = this.versions.find(v => v.version === currentVersion);
      
      if (!versionConfig) {
        console.error(`No configuration found for database version ${currentVersion}`);
        return false;
      }

      // Check if all required tables exist
      const tableNames = Object.keys(versionConfig.stores);
      for (const tableName of tableNames) {
        if (!db.tables.some(table => table.name === tableName)) {
          console.error(`Required table '${tableName}' not found`);
          return false;
        }
      }

      return true;
    } catch (error) {
      console.error('Schema validation failed:', error);
      return false;
    }
  }

  /**
   * Create backup before migration
   */
  static async createBackup(db: DatabaseService): Promise<string> {
    try {
      const exportResult = await db.exportData();
      if (!exportResult.success || !exportResult.data) {
        throw new Error('Failed to create backup');
      }

      const backupData = JSON.stringify(exportResult.data);
      const backupKey = `backup_${Date.now()}`;
      
      // Store backup in localStorage (for small datasets) or IndexedDB
      if (backupData.length < 5 * 1024 * 1024) { // 5MB limit for localStorage
        localStorage.setItem(backupKey, backupData);
      } else {
        // For larger datasets, store in a separate IndexedDB table
        await db.settings.put({ key: backupKey, value: exportResult.data });
      }

      return backupKey;
    } catch (error) {
      console.error('Failed to create backup:', error);
      throw new Error(`Backup creation failed: ${error}`);
    }
  }

  /**
   * Restore from backup
   */
  static async restoreFromBackup(db: DatabaseService, backupKey: string): Promise<void> {
    try {
      let backupData;
      
      // Try localStorage first
      const localBackup = localStorage.getItem(backupKey);
      if (localBackup) {
        backupData = JSON.parse(localBackup);
      } else {
        // Try IndexedDB
        const dbBackup = await db.settings.get(backupKey);
        if (dbBackup) {
          backupData = dbBackup.value;
        }
      }

      if (!backupData) {
        throw new Error(`Backup with key '${backupKey}' not found`);
      }

      const importResult = await db.importData(backupData);
      if (!importResult.success) {
        throw new Error(`Import failed: ${importResult.errors.join(', ')}`);
      }

      console.log('Database restored from backup successfully');
    } catch (error) {
      console.error('Failed to restore from backup:', error);
      throw new Error(`Backup restoration failed: ${error}`);
    }
  }

  /**
   * Clean up old backups
   */
  static async cleanupOldBackups(db: DatabaseService, keepCount: number = 5): Promise<void> {
    try {
      // Get all backup keys
      const allSettings = await db.settings.toArray();
      const backupKeys = allSettings
        .filter(setting => setting.key.startsWith('backup_'))
        .sort((a, b) => {
          const timestampA = parseInt(a.key.split('_')[1]);
          const timestampB = parseInt(b.key.split('_')[1]);
          return timestampB - timestampA; // Sort by timestamp descending
        });

      // Remove old backups beyond keepCount
      const backupsToDelete = backupKeys.slice(keepCount);
      for (const backup of backupsToDelete) {
        await db.settings.delete(backup.key);
        localStorage.removeItem(backup.key);
      }

      console.log(`Cleaned up ${backupsToDelete.length} old backups`);
    } catch (error) {
      console.error('Failed to cleanup old backups:', error);
    }
  }
}