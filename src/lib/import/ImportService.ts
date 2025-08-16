/**
 * Import service for restoring data from backup files
 * Handles JSON and ZIP import with data validation and conflict resolution
 * Requirements: 7.6, 8.1
 */

import { Note, Folder, ExportData, DatabaseResult, BulkOperationResult } from '../../types';
import { databaseService } from '../db/DatabaseService';

export interface ImportOptions {
  format: 'json' | 'zip';
  conflictResolution: 'skip' | 'overwrite' | 'rename';
  validateData?: boolean;
  preserveIds?: boolean;
}

export interface ImportProgress {
  current: number;
  total: number;
  status: 'preparing' | 'validating' | 'processing' | 'complete' | 'error';
  message: string;
  phase: 'folders' | 'notes' | 'settings' | 'cleanup';
}

export interface ImportResult extends BulkOperationResult {
  importedNotes: number;
  importedFolders: number;
  skippedItems: number;
  conflicts: ConflictItem[];
}

export interface ConflictItem {
  type: 'note' | 'folder';
  id: string;
  name: string;
  resolution: 'skipped' | 'overwritten' | 'renamed';
  newName?: string;
}

export interface ValidationError {
  type: 'missing_field' | 'invalid_type' | 'invalid_reference' | 'duplicate_id';
  item: string;
  field?: string;
  message: string;
}

export type ProgressCallback = (progress: ImportProgress) => void;

export class ImportService {
  private readonly SUPPORTED_VERSIONS = ['1.0.0'];
  private readonly MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

  /**
   * Import data from JSON file
   */
  async importFromJSON(
    file: File,
    options: ImportOptions,
    onProgress?: ProgressCallback
  ): Promise<ImportResult> {
    try {
      onProgress?.({
        current: 0,
        total: 100,
        status: 'preparing',
        message: 'Reading file...',
        phase: 'folders'
      });

      // Validate file size
      if (file.size > this.MAX_FILE_SIZE) {
        throw new Error(`File size exceeds maximum limit of ${this.MAX_FILE_SIZE / 1024 / 1024}MB`);
      }

      // Read and parse JSON
      const content = await this.readFileAsText(file);
      const data = JSON.parse(content) as ExportData;

      return await this.importData(data, options, onProgress);
    } catch (error) {
      return {
        success: false,
        processed: 0,
        failed: 0,
        errors: [`JSON import failed: ${error instanceof Error ? error.message : 'Unknown error'}`],
        importedNotes: 0,
        importedFolders: 0,
        skippedItems: 0,
        conflicts: []
      };
    }
  }

  /**
   * Import data from ZIP archive
   */
  async importFromZIP(
    file: File,
    options: ImportOptions,
    onProgress?: ProgressCallback
  ): Promise<ImportResult> {
    try {
      onProgress?.({
        current: 0,
        total: 100,
        status: 'preparing',
        message: 'Extracting archive...',
        phase: 'folders'
      });

      // Validate file size
      if (file.size > this.MAX_FILE_SIZE) {
        throw new Error(`File size exceeds maximum limit of ${this.MAX_FILE_SIZE / 1024 / 1024}MB`);
      }

      // Extract ZIP file
      const { default: JSZip } = await import('jszip');
      const zip = new JSZip();
      const archive = await zip.loadAsync(file);

      // Look for backup JSON file in the archive
      const backupFile = archive.file(/.*\.json$/)[0];
      if (!backupFile) {
        throw new Error('No JSON backup file found in archive');
      }

      onProgress?.({
        current: 25,
        total: 100,
        status: 'preparing',
        message: 'Reading backup data...',
        phase: 'folders'
      });

      // Read and parse the backup JSON
      const content = await backupFile.async('text');
      const data = JSON.parse(content) as ExportData;

      return await this.importData(data, options, onProgress);
    } catch (error) {
      return {
        success: false,
        processed: 0,
        failed: 0,
        errors: [`ZIP import failed: ${error instanceof Error ? error.message : 'Unknown error'}`],
        importedNotes: 0,
        importedFolders: 0,
        skippedItems: 0,
        conflicts: []
      };
    }
  }

  /**
   * Import data with validation and conflict resolution
   */
  private async importData(
    data: ExportData,
    options: ImportOptions,
    onProgress?: ProgressCallback
  ): Promise<ImportResult> {
    const result: ImportResult = {
      success: false,
      processed: 0,
      failed: 0,
      errors: [],
      importedNotes: 0,
      importedFolders: 0,
      skippedItems: 0,
      conflicts: []
    };

    try {
      // Validate data format
      onProgress?.({
        current: 10,
        total: 100,
        status: 'validating',
        message: 'Validating data format...',
        phase: 'folders'
      });

      if (options.validateData) {
        const validationErrors = await this.validateImportData(data);
        if (validationErrors.length > 0) {
          result.errors = validationErrors.map(e => e.message);
          return result;
        }
      }

      // Check version compatibility
      if (!this.SUPPORTED_VERSIONS.includes(data.version)) {
        result.errors.push(`Unsupported data version: ${data.version}`);
        return result;
      }

      const totalItems = data.folders.length + data.notes.length + Object.keys(data.settings).length;
      let currentItem = 0;

      // Get existing data for conflict detection
      const [existingNotesResult, existingFoldersResult] = await Promise.all([
        databaseService.getAllNotes(),
        databaseService.getAllFolders()
      ]);

      const existingNotes = existingNotesResult.data || [];
      const existingFolders = existingFoldersResult.data || [];

      // Create ID mapping for conflict resolution
      const folderIdMap = new Map<string, string>();
      const noteIdMap = new Map<string, string>();

      // Import folders first (to maintain hierarchy)
      onProgress?.({
        current: 20,
        total: 100,
        status: 'processing',
        message: 'Importing folders...',
        phase: 'folders'
      });

      for (const folder of data.folders) {
        try {
          const conflict = existingFolders.find(f => 
            f.name === folder.name && f.parentId === folder.parentId
          );

          if (conflict) {
            const resolution = await this.resolveConflict(
              'folder',
              folder,
              conflict,
              options.conflictResolution
            );

            result.conflicts.push({
              type: 'folder',
              id: folder.id,
              name: folder.name,
              resolution: resolution.action === 'skip' ? 'skipped' : 
                         resolution.action === 'overwrite' ? 'overwritten' : 'renamed',
              newName: resolution.newName
            });

            if (resolution.action === 'skip') {
              result.skippedItems++;
              folderIdMap.set(folder.id, conflict.id);
              continue;
            }

            if (resolution.action === 'rename') {
              folder.name = resolution.newName!;
            }
          }

          // Generate new ID if not preserving IDs or if conflict exists
          const newId = options.preserveIds && !conflict ? folder.id : this.generateId();
          folderIdMap.set(folder.id, newId);

          // Update parent ID mapping
          if (folder.parentId && folderIdMap.has(folder.parentId)) {
            folder.parentId = folderIdMap.get(folder.parentId)!;
          }

          // Create folder
          const createResult = await databaseService.createFolder({
            name: folder.name,
            parentId: folder.parentId
          });

          if (createResult.success) {
            result.importedFolders++;
            result.processed++;
          } else {
            result.failed++;
            result.errors.push(`Failed to import folder ${folder.name}: ${createResult.error}`);
          }

          currentItem++;
          onProgress?.({
            current: 20 + (currentItem / totalItems) * 60,
            total: 100,
            status: 'processing',
            message: `Importing folder: ${folder.name}`,
            phase: 'folders'
          });
        } catch (error) {
          result.failed++;
          result.errors.push(`Failed to import folder ${folder.name}: ${error}`);
        }
      }

      // Import notes
      onProgress?.({
        current: 50,
        total: 100,
        status: 'processing',
        message: 'Importing notes...',
        phase: 'notes'
      });

      for (const note of data.notes) {
        try {
          const conflict = existingNotes.find(n => 
            n.title === note.title && n.folderId === note.folderId
          );

          if (conflict) {
            const resolution = await this.resolveConflict(
              'note',
              note,
              conflict,
              options.conflictResolution
            );

            result.conflicts.push({
              type: 'note',
              id: note.id,
              name: note.title,
              resolution: resolution.action === 'skip' ? 'skipped' : 
                         resolution.action === 'overwrite' ? 'overwritten' : 'renamed',
              newName: resolution.newName
            });

            if (resolution.action === 'skip') {
              result.skippedItems++;
              continue;
            }

            if (resolution.action === 'rename') {
              note.title = resolution.newName!;
            }
          }

          // Update folder ID mapping
          if (folderIdMap.has(note.folderId)) {
            note.folderId = folderIdMap.get(note.folderId)!;
          }

          // Create note
          const createResult = await databaseService.createNote({
            title: note.title,
            content: note.content,
            folderId: note.folderId,
            tags: note.tags
          });

          if (createResult.success) {
            result.importedNotes++;
            result.processed++;
          } else {
            result.failed++;
            result.errors.push(`Failed to import note ${note.title}: ${createResult.error}`);
          }

          currentItem++;
          onProgress?.({
            current: 50 + (currentItem / totalItems) * 30,
            total: 100,
            status: 'processing',
            message: `Importing note: ${note.title}`,
            phase: 'notes'
          });
        } catch (error) {
          result.failed++;
          result.errors.push(`Failed to import note ${note.title}: ${error}`);
        }
      }

      // Import settings
      onProgress?.({
        current: 90,
        total: 100,
        status: 'processing',
        message: 'Importing settings...',
        phase: 'settings'
      });

      // Note: Settings import would be implemented here if needed
      // For now, we skip settings to avoid overwriting user preferences

      onProgress?.({
        current: 100,
        total: 100,
        status: 'complete',
        message: 'Import completed successfully',
        phase: 'cleanup'
      });

      result.success = result.errors.length === 0;
      return result;
    } catch (error) {
      result.errors.push(`Import failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return result;
    }
  }

  /**
   * Validate import data structure and integrity
   */
  private async validateImportData(data: ExportData): Promise<ValidationError[]> {
    const errors: ValidationError[] = [];

    // Validate required fields
    if (!data.version) {
      errors.push({
        type: 'missing_field',
        item: 'root',
        field: 'version',
        message: 'Missing version field in import data'
      });
    }

    if (!Array.isArray(data.notes)) {
      errors.push({
        type: 'invalid_type',
        item: 'root',
        field: 'notes',
        message: 'Notes field must be an array'
      });
    }

    if (!Array.isArray(data.folders)) {
      errors.push({
        type: 'invalid_type',
        item: 'root',
        field: 'folders',
        message: 'Folders field must be an array'
      });
    }

    // Validate notes
    const noteIds = new Set<string>();
    for (const note of data.notes || []) {
      if (!note.id) {
        errors.push({
          type: 'missing_field',
          item: `note-${note.title || 'unknown'}`,
          field: 'id',
          message: 'Note missing required id field'
        });
      } else if (noteIds.has(note.id)) {
        errors.push({
          type: 'duplicate_id',
          item: `note-${note.id}`,
          message: `Duplicate note ID: ${note.id}`
        });
      } else {
        noteIds.add(note.id);
      }

      if (!note.title) {
        errors.push({
          type: 'missing_field',
          item: `note-${note.id}`,
          field: 'title',
          message: 'Note missing required title field'
        });
      }

      if (!note.content && note.content !== '') {
        errors.push({
          type: 'missing_field',
          item: `note-${note.id}`,
          field: 'content',
          message: 'Note missing required content field'
        });
      }

      if (!note.folderId) {
        errors.push({
          type: 'missing_field',
          item: `note-${note.id}`,
          field: 'folderId',
          message: 'Note missing required folderId field'
        });
      }
    }

    // Validate folders
    const folderIds = new Set<string>();
    for (const folder of data.folders || []) {
      if (!folder.id) {
        errors.push({
          type: 'missing_field',
          item: `folder-${folder.name || 'unknown'}`,
          field: 'id',
          message: 'Folder missing required id field'
        });
      } else if (folderIds.has(folder.id)) {
        errors.push({
          type: 'duplicate_id',
          item: `folder-${folder.id}`,
          message: `Duplicate folder ID: ${folder.id}`
        });
      } else {
        folderIds.add(folder.id);
      }

      if (!folder.name) {
        errors.push({
          type: 'missing_field',
          item: `folder-${folder.id}`,
          field: 'name',
          message: 'Folder missing required name field'
        });
      }
    }

    // Validate references
    for (const note of data.notes || []) {
      if (note.folderId && !folderIds.has(note.folderId)) {
        errors.push({
          type: 'invalid_reference',
          item: `note-${note.id}`,
          field: 'folderId',
          message: `Note references non-existent folder: ${note.folderId}`
        });
      }
    }

    for (const folder of data.folders || []) {
      if (folder.parentId && !folderIds.has(folder.parentId)) {
        errors.push({
          type: 'invalid_reference',
          item: `folder-${folder.id}`,
          field: 'parentId',
          message: `Folder references non-existent parent: ${folder.parentId}`
        });
      }
    }

    return errors;
  }

  /**
   * Resolve conflicts between existing and imported items
   */
  private async resolveConflict(
    type: 'note' | 'folder',
    importItem: Note | Folder,
    existingItem: Note | Folder,
    strategy: 'skip' | 'overwrite' | 'rename'
  ): Promise<{ action: 'skip' | 'overwrite' | 'rename'; newName?: string }> {
    switch (strategy) {
      case 'skip':
        return { action: 'skip' };
      
      case 'overwrite':
        return { action: 'overwrite' };
      
      case 'rename':
        const name = type === 'note' ? (importItem as Note).title : (importItem as Folder).name;
        const newName = await this.generateUniqueName(name, type);
        return { action: 'rename', newName };
      
      default:
        return { action: 'skip' };
    }
  }

  /**
   * Generate unique name for conflict resolution
   */
  private async generateUniqueName(baseName: string, type: 'note' | 'folder'): Promise<string> {
    let counter = 1;
    let newName = `${baseName} (${counter})`;

    while (await this.nameExists(newName, type)) {
      counter++;
      newName = `${baseName} (${counter})`;
    }

    return newName;
  }

  /**
   * Check if name already exists
   */
  private async nameExists(name: string, type: 'note' | 'folder'): Promise<boolean> {
    if (type === 'note') {
      const result = await databaseService.getAllNotes();
      return result.data?.some(note => note.title === name) || false;
    } else {
      const result = await databaseService.getAllFolders();
      return result.data?.some(folder => folder.name === name) || false;
    }
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  /**
   * Read file as text
   */
  private readFileAsText(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  }

  /**
   * Create data migration for schema changes
   */
  async migrateData(fromVersion: string, toVersion: string): Promise<BulkOperationResult> {
    // This would contain migration logic for different schema versions
    // For now, we only support version 1.0.0
    if (fromVersion === toVersion) {
      return {
        success: true,
        processed: 0,
        failed: 0,
        errors: []
      };
    }

    return {
      success: false,
      processed: 0,
      failed: 0,
      errors: [`Migration from ${fromVersion} to ${toVersion} not supported`]
    };
  }
}

// Singleton instance
export const importService = new ImportService();