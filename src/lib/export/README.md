# Export Functionality

This module provides comprehensive export and sharing functionality for DevNotes, supporting multiple formats and both individual and bulk operations.

## Features

- **Multiple Formats**: Export notes as Markdown, HTML, JSON, or plain text
- **Bulk Export**: Export multiple notes or entire folders as ZIP archives
- **Database Backup**: Complete database export for backup purposes
- **Clipboard Integration**: Copy notes to clipboard in multiple formats
- **Email Sharing**: Generate mailto links for easy sharing
- **Progress Tracking**: Real-time progress updates for bulk operations

## Usage

### Single Note Export

```typescript
import { exportService } from '@/lib/export';

// Export a note as markdown
const result = await exportService.exportNote('note-id', {
  format: 'markdown',
  includeMetadata: true
});

// Download the file
const blob = new Blob([result.content], { type: result.mimeType });
const url = URL.createObjectURL(blob);
const link = document.createElement('a');
link.href = url;
link.download = result.filename;
link.click();
```

### Bulk Export

```typescript
// Export multiple notes as ZIP
const result = await exportService.exportBulk({
  format: 'markdown',
  selectedNoteIds: ['note-1', 'note-2'],
  includeMetadata: true,
  preserveStructure: true
}, (progress) => {
  console.log(`Progress: ${progress.current}/${progress.total}`);
});

// Download ZIP file
const link = document.createElement('a');
link.href = URL.createObjectURL(result.content);
link.download = result.filename;
link.click();
```

### Clipboard Operations

```typescript
// Copy note to clipboard as markdown
await exportService.copyToClipboard('note-id', 'markdown');

// Copy as HTML (includes both HTML and plain text)
await exportService.copyToClipboard('note-id', 'html');
```

### Email Sharing

```typescript
// Generate mailto link
const emailLink = await exportService.generateEmailLink('note-id', 'markdown');
window.open(emailLink, '_blank');
```

### Database Backup

```typescript
// Export complete database
const backup = await exportService.exportDatabase();

// Save backup file
const link = document.createElement('a');
link.href = URL.createObjectURL(new Blob([backup.content], { type: backup.mimeType }));
link.download = backup.filename;
link.click();
```

## Export Modal Component

The `ExportModal` component provides a complete UI for export operations:

```typescript
import { ExportModal } from '@/components/modals';

function MyComponent() {
  const [showExport, setShowExport] = useState(false);

  return (
    <>
      <button onClick={() => setShowExport(true)}>
        Export Note
      </button>
      
      <ExportModal
        isOpen={showExport}
        onClose={() => setShowExport(false)}
        noteId="note-id"
      />
    </>
  );
}
```

## Supported Formats

### Markdown (.md)
- Preserves original markdown formatting
- Optional metadata header
- Ideal for technical documentation

### HTML (.html)
- Fully rendered HTML with CSS styling
- Syntax highlighting for code blocks
- Self-contained with embedded styles

### JSON (.json)
- Complete note data including metadata
- Structured format for programmatic access
- Includes folder information

### Plain Text (.txt)
- Stripped of all formatting
- Clean, readable text
- Optional metadata header

## Requirements Satisfied

- **8.1**: Individual note export in multiple formats
- **8.2**: Bulk export with ZIP archive generation
- **8.3**: Clipboard integration and email sharing
- **8.4**: Progress indicators and error handling

## Error Handling

The export service includes comprehensive error handling:

- Note not found errors
- Database access failures
- File system quota issues
- Network connectivity problems
- Invalid format specifications

All errors are properly caught and provide meaningful error messages to users.