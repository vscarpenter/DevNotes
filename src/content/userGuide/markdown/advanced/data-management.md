# Data Management

Understanding how DevNotes stores, manages, and protects your data is crucial for long-term use and data security.

## Data Storage Architecture

### IndexedDB Foundation
DevNotes uses IndexedDB for client-side data storage:

#### Why IndexedDB?
- **Large storage capacity**: Gigabytes of data storage
- **Structured data**: Efficient querying and indexing
- **Transactional**: ACID compliance for data integrity
- **Asynchronous**: Non-blocking operations
- **Cross-browser**: Supported in all modern browsers

#### Storage Structure
```javascript
// Database schema
const schema = {
  notes: {
    keyPath: 'id',
    indexes: {
      title: 'title',
      folderId: 'folderId',
      created: 'createdAt',
      modified: 'modifiedAt',
      tags: 'tags'
    }
  },
  folders: {
    keyPath: 'id',
    indexes: {
      name: 'name',
      parentId: 'parentId',
      path: 'path'
    }
  },
  settings: {
    keyPath: 'key'
  },
  searchIndex: {
    keyPath: 'term'
  }
};
```

### Data Models

#### Note Model
```typescript
interface Note {
  id: string;                    // Unique identifier
  title: string;                 // Note title
  content: string;               // Markdown content
  folderId: string;              // Parent folder ID
  tags: string[];                // Associated tags
  createdAt: Date;               // Creation timestamp
  modifiedAt: Date;              // Last modification
  version: number;               // Version for conflict resolution
  metadata: {
    wordCount: number;
    readingTime: number;
    checksum: string;
  };
}
```

#### Folder Model
```typescript
interface Folder {
  id: string;                    // Unique identifier
  name: string;                  // Folder name
  parentId: string | null;       // Parent folder ID
  path: string;                  // Full path for quick lookup
  createdAt: Date;               // Creation timestamp
  modifiedAt: Date;              // Last modification
  metadata: {
    noteCount: number;
    totalSize: number;
  };
}
```

## Storage Limits and Management

### Browser Storage Limits
Understanding storage constraints:

#### Typical Limits
- **Chrome**: ~60% of available disk space
- **Firefox**: ~50% of available disk space  
- **Safari**: ~1GB per origin
- **Edge**: Similar to Chrome

#### Monitoring Storage Usage
```javascript
// Check storage usage
navigator.storage.estimate().then(estimate => {
  const used = estimate.usage;
  const quota = estimate.quota;
  const percentage = (used / quota * 100).toFixed(2);
  
  console.log(`Storage used: ${used} bytes (${percentage}%)`);
  console.log(`Storage quota: ${quota} bytes`);
});
```

### Storage Optimization

#### Data Compression
DevNotes automatically compresses data:

```javascript
// Content compression
const compressContent = (content) => {
  // Use LZ-string compression for text content
  return LZString.compress(content);
};

const decompressContent = (compressed) => {
  return LZString.decompress(compressed);
};
```

#### Cleanup Strategies
- **Automatic cleanup**: Remove orphaned data
- **Version pruning**: Keep only recent versions
- **Index optimization**: Rebuild search indexes
- **Cache management**: Clear temporary data

## Backup and Recovery

### Automatic Backups
DevNotes creates automatic backups:

#### Backup Schedule
```json
{
  "backup": {
    "enabled": true,
    "frequency": "daily",
    "retention": 30,
    "location": "local",
    "compression": true,
    "encryption": false
  }
}
```

#### Backup Types
- **Full backup**: Complete database export
- **Incremental backup**: Only changed data
- **Differential backup**: Changes since last full backup
- **Snapshot backup**: Point-in-time copy

### Manual Backup Creation
Create backups on demand:

```javascript
// Create full backup
const createBackup = async () => {
  const backup = {
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    data: {
      notes: await db.notes.toArray(),
      folders: await db.folders.toArray(),
      settings: await db.settings.toArray()
    }
  };
  
  const blob = new Blob([JSON.stringify(backup)], {
    type: 'application/json'
  });
  
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `devnotes-backup-${Date.now()}.json`;
  a.click();
};
```

### Backup Verification
Ensure backup integrity:

```javascript
// Verify backup integrity
const verifyBackup = async (backupData) => {
  const checks = {
    structure: validateStructure(backupData),
    data: validateData(backupData),
    checksums: validateChecksums(backupData),
    version: validateVersion(backupData)
  };
  
  return Object.values(checks).every(check => check === true);
};
```

## Data Migration

### Version Migration
Handle data structure changes:

```javascript
// Migration system
const migrations = {
  '1.0.0': (data) => {
    // Initial version - no migration needed
    return data;
  },
  
  '1.1.0': (data) => {
    // Add tags field to notes
    data.notes.forEach(note => {
      if (!note.tags) {
        note.tags = [];
      }
    });
    return data;
  },
  
  '1.2.0': (data) => {
    // Add metadata to notes
    data.notes.forEach(note => {
      if (!note.metadata) {
        note.metadata = {
          wordCount: note.content.split(/\s+/).length,
          readingTime: Math.ceil(note.content.split(/\s+/).length / 200),
          checksum: generateChecksum(note.content)
        };
      }
    });
    return data;
  }
};

const migrateData = (data, fromVersion, toVersion) => {
  const versions = Object.keys(migrations).sort();
  const startIndex = versions.indexOf(fromVersion);
  const endIndex = versions.indexOf(toVersion);
  
  for (let i = startIndex + 1; i <= endIndex; i++) {
    data = migrations[versions[i]](data);
  }
  
  return data;
};
```

### Import from Other Apps
Migrate data from other note-taking applications:

#### Notion Import
```javascript
const importFromNotion = async (notionExport) => {
  const pages = notionExport.pages;
  const folders = new Map();
  const notes = [];
  
  // Create folder structure
  pages.forEach(page => {
    if (page.type === 'database') {
      folders.set(page.id, {
        id: generateId(),
        name: page.title,
        parentId: null,
        path: page.title
      });
    }
  });
  
  // Convert pages to notes
  pages.forEach(page => {
    if (page.type === 'page') {
      notes.push({
        id: generateId(),
        title: page.title,
        content: convertNotionToMarkdown(page.content),
        folderId: findFolderId(page.parent, folders),
        tags: page.tags || [],
        createdAt: new Date(page.created_time),
        modifiedAt: new Date(page.last_edited_time)
      });
    }
  });
  
  return { folders: Array.from(folders.values()), notes };
};
```

#### Obsidian Import
```javascript
const importFromObsidian = async (obsidianVault) => {
  const files = obsidianVault.files;
  const folders = new Map();
  const notes = [];
  
  // Process each file
  files.forEach(file => {
    if (file.extension === 'md') {
      const folderPath = file.path.substring(0, file.path.lastIndexOf('/'));
      const folderId = ensureFolder(folderPath, folders);
      
      notes.push({
        id: generateId(),
        title: file.basename,
        content: convertObsidianToMarkdown(file.content),
        folderId: folderId,
        tags: extractTags(file.content),
        createdAt: new Date(file.stat.ctime),
        modifiedAt: new Date(file.stat.mtime)
      });
    }
  });
  
  return { folders: Array.from(folders.values()), notes };
};
```

## Data Synchronization

### Multi-Device Sync
Synchronize data across multiple devices:

#### Sync Strategy
```javascript
const syncData = async () => {
  const localData = await getLocalData();
  const remoteData = await getRemoteData();
  
  const conflicts = detectConflicts(localData, remoteData);
  const resolved = await resolveConflicts(conflicts);
  
  const merged = mergeData(localData, remoteData, resolved);
  
  await saveLocalData(merged);
  await saveRemoteData(merged);
  
  return merged;
};
```

#### Conflict Resolution
```javascript
const resolveConflicts = async (conflicts) => {
  const resolutions = {};
  
  for (const conflict of conflicts) {
    switch (conflict.type) {
      case 'content':
        // Use last modified wins strategy
        resolutions[conflict.id] = conflict.local.modifiedAt > conflict.remote.modifiedAt
          ? conflict.local
          : conflict.remote;
        break;
        
      case 'deletion':
        // Prompt user for deletion conflicts
        resolutions[conflict.id] = await promptUser(conflict);
        break;
        
      case 'structure':
        // Merge folder structures
        resolutions[conflict.id] = mergeFolderStructure(
          conflict.local,
          conflict.remote
        );
        break;
    }
  }
  
  return resolutions;
};
```

### Cloud Storage Integration
Integrate with cloud storage providers:

#### Dropbox Integration
```javascript
const syncWithDropbox = async () => {
  const dbx = new Dropbox({ accessToken: getAccessToken() });
  
  try {
    // Download remote backup
    const response = await dbx.filesDownload({
      path: '/devnotes-backup.json'
    });
    
    const remoteData = JSON.parse(response.result.fileBinary);
    const localData = await exportLocalData();
    
    // Merge and sync
    const merged = await mergeData(localData, remoteData);
    await importData(merged);
    
    // Upload updated backup
    await dbx.filesUpload({
      path: '/devnotes-backup.json',
      contents: JSON.stringify(merged),
      mode: 'overwrite'
    });
    
  } catch (error) {
    console.error('Sync failed:', error);
    throw new Error('Failed to sync with Dropbox');
  }
};
```

## Performance Optimization

### Database Optimization

#### Indexing Strategy
```javascript
// Optimize database indexes
const optimizeIndexes = async () => {
  // Create compound indexes for common queries
  await db.notes.createIndex('folder_modified', ['folderId', 'modifiedAt']);
  await db.notes.createIndex('tags_created', ['tags', 'createdAt']);
  
  // Create full-text search index
  await db.searchIndex.clear();
  const notes = await db.notes.toArray();
  
  for (const note of notes) {
    const terms = extractSearchTerms(note.content);
    for (const term of terms) {
      await db.searchIndex.put({
        term: term,
        noteId: note.id,
        weight: calculateWeight(term, note)
      });
    }
  }
};
```

#### Query Optimization
```javascript
// Efficient querying patterns
const getRecentNotes = async (limit = 10) => {
  return await db.notes
    .orderBy('modifiedAt')
    .reverse()
    .limit(limit)
    .toArray();
};

const getNotesByFolder = async (folderId) => {
  return await db.notes
    .where('folderId')
    .equals(folderId)
    .sortBy('title');
};

const searchNotes = async (query) => {
  const terms = query.toLowerCase().split(/\s+/);
  const results = new Map();
  
  for (const term of terms) {
    const matches = await db.searchIndex
      .where('term')
      .startsWithIgnoreCase(term)
      .toArray();
    
    matches.forEach(match => {
      const score = results.get(match.noteId) || 0;
      results.set(match.noteId, score + match.weight);
    });
  }
  
  return Array.from(results.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([noteId]) => noteId);
};
```

### Memory Management
Optimize memory usage for large datasets:

```javascript
// Lazy loading for large note collections
class LazyNoteLoader {
  constructor(pageSize = 50) {
    this.pageSize = pageSize;
    this.cache = new Map();
  }
  
  async loadPage(offset) {
    const cacheKey = Math.floor(offset / this.pageSize);
    
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }
    
    const notes = await db.notes
      .orderBy('modifiedAt')
      .reverse()
      .offset(offset)
      .limit(this.pageSize)
      .toArray();
    
    this.cache.set(cacheKey, notes);
    
    // Limit cache size
    if (this.cache.size > 10) {
      const oldestKey = Math.min(...this.cache.keys());
      this.cache.delete(oldestKey);
    }
    
    return notes;
  }
}
```

## Security and Privacy

### Data Encryption
Protect sensitive data with encryption:

```javascript
// Client-side encryption
const encryptData = async (data, password) => {
  const key = await deriveKey(password);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  
  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: iv },
    key,
    new TextEncoder().encode(JSON.stringify(data))
  );
  
  return {
    iv: Array.from(iv),
    data: Array.from(new Uint8Array(encrypted))
  };
};

const decryptData = async (encryptedData, password) => {
  const key = await deriveKey(password);
  const iv = new Uint8Array(encryptedData.iv);
  const data = new Uint8Array(encryptedData.data);
  
  const decrypted = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: iv },
    key,
    data
  );
  
  return JSON.parse(new TextDecoder().decode(decrypted));
};
```

### Data Sanitization
Sanitize data to prevent XSS and other attacks:

```javascript
// Content sanitization
const sanitizeContent = (content) => {
  // Remove potentially dangerous HTML
  const clean = DOMPurify.sanitize(content, {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'code', 'pre', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'],
    ALLOWED_ATTR: ['class']
  });
  
  return clean;
};

// Input validation
const validateNote = (note) => {
  const errors = [];
  
  if (!note.title || note.title.trim().length === 0) {
    errors.push('Title is required');
  }
  
  if (note.title.length > 255) {
    errors.push('Title too long (max 255 characters)');
  }
  
  if (note.content.length > 1024 * 1024) {
    errors.push('Content too large (max 1MB)');
  }
  
  return errors;
};
```

## Troubleshooting Data Issues

### Common Problems

#### Database Corruption
```javascript
// Detect and repair database corruption
const repairDatabase = async () => {
  try {
    // Test database integrity
    const testQuery = await db.notes.limit(1).toArray();
    
    if (testQuery.length === 0) {
      throw new Error('Database appears empty');
    }
    
    // Validate data structure
    const notes = await db.notes.toArray();
    const invalidNotes = notes.filter(note => !validateNote(note));
    
    if (invalidNotes.length > 0) {
      console.warn(`Found ${invalidNotes.length} invalid notes`);
      
      // Attempt to repair
      for (const note of invalidNotes) {
        const repaired = repairNote(note);
        if (repaired) {
          await db.notes.put(repaired);
        } else {
          await db.notes.delete(note.id);
        }
      }
    }
    
  } catch (error) {
    console.error('Database repair failed:', error);
    
    // Last resort: restore from backup
    const backup = await getLatestBackup();
    if (backup) {
      await restoreFromBackup(backup);
    }
  }
};
```

#### Storage Quota Exceeded
```javascript
// Handle storage quota issues
const handleStorageQuota = async () => {
  const estimate = await navigator.storage.estimate();
  const usage = estimate.usage;
  const quota = estimate.quota;
  
  if (usage / quota > 0.9) {
    // Storage is nearly full
    console.warn('Storage quota nearly exceeded');
    
    // Clean up old data
    await cleanupOldVersions();
    await optimizeStorage();
    
    // Notify user
    showNotification('Storage space is running low. Consider exporting old notes.');
  }
};

const cleanupOldVersions = async () => {
  // Remove old backup versions
  const backups = await db.backups.orderBy('created').toArray();
  const toDelete = backups.slice(0, -5); // Keep only 5 most recent
  
  for (const backup of toDelete) {
    await db.backups.delete(backup.id);
  }
  
  // Clear search index and rebuild
  await db.searchIndex.clear();
  await rebuildSearchIndex();
};
```

### Data Recovery
Recover lost or corrupted data:

```javascript
// Attempt data recovery
const recoverData = async () => {
  const recoveryMethods = [
    () => restoreFromAutoBackup(),
    () => restoreFromBrowserCache(),
    () => recoverFromIndexedDBFragments(),
    () => restoreFromExportedFiles()
  ];
  
  for (const method of recoveryMethods) {
    try {
      const recovered = await method();
      if (recovered && recovered.notes.length > 0) {
        console.log(`Recovered ${recovered.notes.length} notes`);
        return recovered;
      }
    } catch (error) {
      console.warn('Recovery method failed:', error);
    }
  }
  
  throw new Error('All recovery methods failed');
};
```

## Best Practices

### Data Management Guidelines
1. **Regular backups**: Export data weekly
2. **Monitor storage**: Check usage monthly
3. **Clean up regularly**: Remove unused data
4. **Validate imports**: Check data integrity
5. **Test recovery**: Verify backup restoration

### Performance Best Practices
1. **Optimize queries**: Use appropriate indexes
2. **Limit data size**: Keep notes reasonably sized
3. **Clean up indexes**: Rebuild search indexes periodically
4. **Monitor memory**: Watch for memory leaks
5. **Use pagination**: Load data in chunks

### Security Best Practices
1. **Encrypt sensitive data**: Use client-side encryption
2. **Validate inputs**: Sanitize all user data
3. **Regular updates**: Keep dependencies updated
4. **Audit access**: Monitor data access patterns
5. **Secure backups**: Encrypt backup files

## Next Steps

- **[Explore troubleshooting](troubleshooting/common-issues)** - Solve data-related problems
- **[Learn power user tips](advanced/power-user-tips)** - Advanced data management techniques
- **[Check performance optimization](troubleshooting/performance)** - Optimize data performance

Understanding data management is crucial for long-term success with DevNotes. Implement these practices to ensure your data remains safe, accessible, and performant.