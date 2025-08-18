/**
 * Backup reminder and data health check utilities
 * Requirements: 7.5, 8.1
 */

import { databaseService } from '../db/DatabaseService';

export interface BackupReminderSettings {
  enabled: boolean;
  intervalDays: number;
  lastReminderDate: Date | null;
  lastBackupDate: Date | null;
}

export interface DataHealthCheck {
  totalNotes: number;
  totalFolders: number;
  totalTags: number;
  lastModified: Date | null;
  storageUsed: number;
  storageQuota: number;
  issues: string[];
  recommendations: string[];
}

const STORAGE_KEY = 'devnotes-backup-reminder';
const DEFAULT_SETTINGS: BackupReminderSettings = {
  enabled: true,
  intervalDays: 7,
  lastReminderDate: null,
  lastBackupDate: null
};

export class BackupReminderService {
  private settings: BackupReminderSettings;

  constructor() {
    this.settings = this.loadSettings();
  }

  private loadSettings(): BackupReminderSettings {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return {
          ...DEFAULT_SETTINGS,
          ...parsed,
          lastReminderDate: parsed.lastReminderDate ? new Date(parsed.lastReminderDate) : null,
          lastBackupDate: parsed.lastBackupDate ? new Date(parsed.lastBackupDate) : null
        };
      }
    } catch (error) {
      console.error('Failed to load backup reminder settings:', error);
    }
    return { ...DEFAULT_SETTINGS };
  }

  private saveSettings(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.settings));
    } catch (error) {
      console.error('Failed to save backup reminder settings:', error);
    }
  }

  public getSettings(): BackupReminderSettings {
    return { ...this.settings };
  }

  public updateSettings(updates: Partial<BackupReminderSettings>): void {
    this.settings = { ...this.settings, ...updates };
    this.saveSettings();
  }

  public shouldShowReminder(): boolean {
    if (!this.settings.enabled) {
      return false;
    }

    const now = new Date();
    const { lastReminderDate, intervalDays } = this.settings;

    if (!lastReminderDate) {
      return true; // First time
    }

    const daysSinceLastReminder = Math.floor(
      (now.getTime() - lastReminderDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    return daysSinceLastReminder >= intervalDays;
  }

  public markReminderShown(): void {
    this.settings.lastReminderDate = new Date();
    this.saveSettings();
  }

  public markBackupCompleted(): void {
    this.settings.lastBackupDate = new Date();
    this.saveSettings();
  }

  public getDaysSinceLastBackup(): number | null {
    if (!this.settings.lastBackupDate) {
      return null;
    }

    const now = new Date();
    return Math.floor(
      (now.getTime() - this.settings.lastBackupDate.getTime()) / (1000 * 60 * 60 * 24)
    );
  }

  public async performHealthCheck(): Promise<DataHealthCheck> {
    const issues: string[] = [];
    const recommendations: string[] = [];

    try {
      // Get data counts
      const [notesResult, foldersResult, tagsResult] = await Promise.all([
        databaseService.getAllNotes(),
        databaseService.getAllFolders(),
        databaseService.getAllTags()
      ]);

      const totalNotes = notesResult.success ? notesResult.data?.length || 0 : 0;
      const totalFolders = foldersResult.success ? foldersResult.data?.length || 0 : 0;
      const totalTags = tagsResult.success ? tagsResult.data?.length || 0 : 0;

      // Find last modified date
      let lastModified: Date | null = null;
      if (notesResult.success && notesResult.data) {
        const sortedNotes = notesResult.data.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
        lastModified = sortedNotes[0]?.updatedAt || null;
      }

      // Check storage usage
      let storageUsed = 0;
      let storageQuota = 0;
      
      if ('storage' in navigator && 'estimate' in navigator.storage) {
        try {
          const estimate = await navigator.storage.estimate();
          storageUsed = estimate.usage || 0;
          storageQuota = estimate.quota || 0;
        } catch (error) {
          console.warn('Failed to get storage estimate:', error);
        }
      }

      // Analyze data and generate issues/recommendations
      if (totalNotes === 0) {
        recommendations.push('Start creating notes to build your knowledge base');
      } else if (totalNotes > 1000) {
        recommendations.push('Consider organizing your notes with more folders and tags');
      }

      if (totalFolders === 0 && totalNotes > 10) {
        recommendations.push('Create folders to better organize your notes');
      }

      if (totalTags === 0 && totalNotes > 5) {
        recommendations.push('Add tags to your notes for better searchability');
      }

      // Storage warnings
      if (storageQuota > 0) {
        const usagePercent = (storageUsed / storageQuota) * 100;
        if (usagePercent > 80) {
          issues.push('Storage usage is above 80%. Consider exporting and cleaning up old data.');
        } else if (usagePercent > 60) {
          recommendations.push('Storage usage is above 60%. Consider backing up your data.');
        }
      }

      // Backup recommendations
      const daysSinceBackup = this.getDaysSinceLastBackup();
      if (daysSinceBackup === null) {
        recommendations.push('Create your first backup to protect your data');
      } else if (daysSinceBackup > 30) {
        issues.push(`Last backup was ${daysSinceBackup} days ago. Consider creating a new backup.`);
      } else if (daysSinceBackup > 14) {
        recommendations.push(`Last backup was ${daysSinceBackup} days ago. Consider creating a new backup.`);
      }

      // Data integrity checks
      if (notesResult.success && foldersResult.success && notesResult.data && foldersResult.data) {
        const folderIds = new Set(foldersResult.data.map(f => f.id));
        const orphanedNotes = notesResult.data.filter(note => 
          note.folderId && !folderIds.has(note.folderId)
        );
        
        if (orphanedNotes.length > 0) {
          issues.push(`${orphanedNotes.length} notes reference non-existent folders`);
        }
      }

      return {
        totalNotes,
        totalFolders,
        totalTags,
        lastModified,
        storageUsed,
        storageQuota,
        issues,
        recommendations
      };
    } catch (error) {
      console.error('Health check failed:', error);
      return {
        totalNotes: 0,
        totalFolders: 0,
        totalTags: 0,
        lastModified: null,
        storageUsed: 0,
        storageQuota: 0,
        issues: ['Failed to perform health check'],
        recommendations: ['Try refreshing the page and running the health check again']
      };
    }
  }

  public async fixDataIntegrityIssues(): Promise<{ fixed: number; errors: string[] }> {
    let fixed = 0;
    const errors: string[] = [];

    try {
      const [notesResult, foldersResult] = await Promise.all([
        databaseService.getAllNotes(),
        databaseService.getAllFolders()
      ]);

      if (!notesResult.success || !foldersResult.success || !notesResult.data || !foldersResult.data) {
        throw new Error('Failed to load data for integrity check');
      }

      const folderIds = new Set(foldersResult.data.map(f => f.id));
      const orphanedNotes = notesResult.data.filter(note => 
        note.folderId && !folderIds.has(note.folderId)
      );

      // Create a default folder for orphaned notes
      if (orphanedNotes.length > 0) {
        const defaultFolderResult = await databaseService.createFolder({
          name: 'Recovered Notes',
          parentId: null
        });

        if (defaultFolderResult.success && defaultFolderResult.data) {
          const defaultFolderId = defaultFolderResult.data.id;

          // Move orphaned notes to the default folder
          for (const note of orphanedNotes) {
            try {
              await databaseService.updateNote(note.id, { folderId: defaultFolderId });
              fixed++;
            } catch (error) {
              errors.push(`Failed to fix note "${note.title}": ${error}`);
            }
          }
        } else {
          errors.push('Failed to create recovery folder for orphaned notes');
        }
      }

      return { fixed, errors };
    } catch (error) {
      return { 
        fixed: 0, 
        errors: [`Data integrity fix failed: ${error}`] 
      };
    }
  }
}

// Singleton instance
export const backupReminderService = new BackupReminderService();