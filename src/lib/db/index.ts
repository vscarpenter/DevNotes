/**
 * Database service layer exports
 * Provides clean imports for database functionality
 */

export { DatabaseService, databaseService } from './DatabaseService';
export { DatabaseErrorHandler } from './DatabaseErrorHandler';
export { DatabaseMigrations } from './DatabaseMigrations';

// Re-export commonly used types
export type { 
  DatabaseResult, 
  BulkOperationResult, 
  ExportData,
  MigrationScript,
  DatabaseVersion 
} from '../../types';