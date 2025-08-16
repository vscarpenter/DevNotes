# Import Service

The Import Service provides comprehensive functionality for restoring DevNotes data from backup files, supporting both JSON and ZIP formats with advanced conflict resolution and data validation.

## Features

- **Multiple Format Support**: Import from JSON and ZIP backup files
- **Data Validation**: Comprehensive validation of import data structure and integrity
- **Conflict Resolution**: Intelligent handling of duplicate notes and folders
- **Progress Tracking**: Real-time progress updates during import operations
- **Error Handling**: Graceful error handling with detailed error reporting
- **Schema Migration**: Support for data migration between different schema versions

## Usage

### Basic Import

```typescript
import { importService } from '@/lib/import';

// Import from JSON file
const result = await importService.importFromJSON(file, {
  format: 'json',
  conflictResolution: 'rename',
  validateData: true,
  preserveIds: false
});

// Import from ZIP file
const result = await importService.importFromZIP(file, {
  format: 'zip',
  conflictResolution: 'skip',
  validateData: true,
  preserveIds: false
});
```

### With Progress Tracking

```typescript
const onProgress = (progress) => {
  console.log(`${progress.message} - ${progress.current}%`);
};

const result = await importService.importFromJSON(file, options, onProgress);
```

## Import Options

### Conflict Resolution Strategies

- **`skip`**: Skip items that conflict with existing data
- **`overwrite`**: Replace existing items with imported data
- **`rename`**: Automatically rename conflicting items

### Data Validation

- **`validateData: true`**: Perform comprehensive validation before import
- **`validateData: false`**: Skip validation for faster import (not recommended)

### ID Preservation

- **`preserveIds: true`**: Keep original IDs from backup (may cause conflicts)
- **`preserveIds: false`**: Generate new IDs for imported items (recommended)

## Import Result

The import operation returns a detailed result object:

```typescript
interface ImportResult {
  success: boolean;
  processed: number;
  failed: number;
  errors: string[];
  importedNotes: number;
  importedFolders: number;
  skippedItems: number;
  conflicts: ConflictItem[];
}
```

## Data Validation

The service validates:

- **Required Fields**: Ensures all required fields are present
- **Data Types**: Validates field types and formats
- **References**: Checks folder and parent references
- **Duplicate IDs**: Detects and handles duplicate identifiers
- **Schema Version**: Verifies compatibility with current schema

## Error Handling

Common error scenarios:

- **File Size Limits**: Files larger than 50MB are rejected
- **Invalid JSON**: Malformed JSON files are handled gracefully
- **Missing Files**: ZIP archives without backup files are detected
- **Schema Incompatibility**: Unsupported data versions are rejected
- **Database Errors**: Storage issues are handled with detailed reporting

## Progress Phases

Import operations progress through several phases:

1. **Preparing**: File reading and initial validation
2. **Validating**: Data structure and integrity validation
3. **Processing**: Actual data import with sub-phases:
   - **folders**: Importing folder hierarchy
   - **notes**: Importing notes and content
   - **settings**: Importing application settings
   - **cleanup**: Final cleanup and indexing

## Conflict Resolution

When conflicts are detected, the service:

1. Identifies conflicting items by name and location
2. Applies the selected resolution strategy
3. Tracks all conflicts for reporting
4. Generates unique names for renamed items

### Conflict Types

- **Note Conflicts**: Same title in same folder
- **Folder Conflicts**: Same name with same parent

## Schema Migration

The service supports migration between schema versions:

```typescript
const migrationResult = await importService.migrateData('1.0.0', '1.1.0');
```

Currently supported versions:
- `1.0.0`: Initial schema version

## File Format Support

### JSON Format
- Direct import of DevNotes backup JSON files
- Comprehensive validation and error reporting
- Fast processing for large datasets

### ZIP Format
- Extracts backup JSON from ZIP archives
- Supports compressed backups from export functionality
- Automatic detection of backup files within archives

## Performance Considerations

- **File Size**: Maximum 50MB file size limit
- **Memory Usage**: Efficient streaming for large datasets
- **Progress Updates**: Non-blocking progress reporting
- **Database Transactions**: Atomic operations for data integrity

## Security

- **Input Validation**: All imported data is validated and sanitized
- **File Type Checking**: Only supported file types are processed
- **Size Limits**: File size restrictions prevent memory exhaustion
- **Error Isolation**: Import errors don't affect existing data

## Testing

The import service includes comprehensive tests:

- **Unit Tests**: Individual function testing
- **Integration Tests**: End-to-end import workflows
- **Error Scenarios**: Edge cases and error conditions
- **Performance Tests**: Large dataset handling

Run tests with:
```bash
npm run test src/lib/import
```

## Requirements Compliance

This implementation satisfies the following requirements:

- **7.6**: Data schema migration and version control
- **8.1**: Import functionality for data restoration

## API Reference

### ImportService Class

#### Methods

- `importFromJSON(file, options, onProgress?)`: Import from JSON file
- `importFromZIP(file, options, onProgress?)`: Import from ZIP archive
- `migrateData(fromVersion, toVersion)`: Migrate data between schema versions

#### Types

- `ImportOptions`: Configuration options for import operations
- `ImportProgress`: Progress tracking information
- `ImportResult`: Detailed import operation results
- `ConflictItem`: Information about resolved conflicts
- `ValidationError`: Data validation error details