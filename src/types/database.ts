/**
 * Database schema interfaces for IndexedDB
 * Requirements: 7.1, 7.6
 */

import { Note, Folder } from './note';
import { SearchIndex } from './search';

// IndexedDB schema definition
export interface DatabaseSchema {
  notes: {
    key: string;
    value: Note;
    indexes: {
      folderId: string;
      createdAt: Date;
      updatedAt: Date;
      title: string;
    };
  };
  
  folders: {
    key: string;
    value: Folder;
    indexes: {
      parentId: string | null;
      name: string;
      createdAt: Date;
    };
  };
  
  settings: {
    key: string;
    value: {
      key: string;
      value: any;
    };
  };
  
  searchIndex: {
    key: string;
    value: SearchIndex;
    indexes: {
      noteId: string;
      lastIndexed: Date;
    };
  };
}

// Database operation result types
export interface DatabaseResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface BulkOperationResult {
  success: boolean;
  processed: number;
  failed: number;
  errors: string[];
}

// Export/Import data structure
export interface ExportData {
  version: string;
  exportDate: Date;
  notes: Note[];
  folders: Folder[];
  settings: Record<string, any>;
  metadata: {
    totalNotes: number;
    totalFolders: number;
    exportFormat: 'json' | 'zip';
  };
}

// Database migration types
export interface MigrationScript {
  version: number;
  description: string;
  up: () => Promise<void>;
  down: () => Promise<void>;
}

export interface DatabaseVersion {
  version: number;
  stores: Record<string, string>;
  migrations?: MigrationScript[];
}