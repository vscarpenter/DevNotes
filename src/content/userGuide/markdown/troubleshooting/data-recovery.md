# Data Recovery

Learn how to recover lost, corrupted, or accidentally deleted data in DevNotes. This guide covers various recovery scenarios and prevention strategies.

## Types of Data Loss

### Common Data Loss Scenarios
1. **Accidental deletion**: Notes or folders deleted by mistake
2. **Browser data clearing**: Cache/storage cleared accidentally
3. **Database corruption**: IndexedDB corruption or errors
4. **Sync conflicts**: Data overwritten during synchronization
5. **Hardware failure**: Device crash or storage failure
6. **Software bugs**: Application errors causing data loss

### Data Recovery Hierarchy
DevNotes uses multiple recovery layers:

1. **Undo/Redo system**: Immediate recovery for recent actions
2. **Auto-save versions**: Multiple versions of each note
3. **Local backups**: Automatic local backup files
4. **Export history**: Previously exported data
5. **Browser recovery**: Browser's built-in recovery mechanisms
6. **Cloud backups**: Synchronized backup data (if enabled)

## Immediate Recovery Options

### Undo/Redo System
For recent changes, use the built-in undo system:

```javascript
// Undo last action
devnotes.undo();

// Redo last undone action
devnotes.redo();

// Check undo history
const history = devnotes.getUndoHistory();
console.log(`${history.length} actions can be undone`);
```

**Keyboard shortcuts:**
- Undo: `Ctrl+Z` (Windows/Linux) or `Cmd+Z` (Mac)
- Redo: `Ctrl+Y` or `Ctrl+Shift+Z` (Windows/Linux) or `Cmd+Shift+Z` (Mac)

### Auto-Save Version Recovery
DevNotes automatically saves multiple versions of each note:

```javascript
// Recover from auto-save versions
const recoverFromAutoSave = async (noteId) => {
  const versions = await devnotes.getAutoSaveVersions(noteId);
  
  if (versions.length > 0) {
    console.log(`Found ${versions.length} auto-save versions`);
    
    // Show version picker to user
    const selectedVersion = await showVersionPicker(versions);
    
    if (selectedVersion) {
      await devnotes.restoreNoteVersion(noteId, selectedVersion);
      console.log('Note restored from auto-save version');
      return true;
    }
  }
  
  return false;
};

// Get auto-save versions for a note
const getAutoSaveVersions = async (noteId) => {
  return await db.autoSaveVersions
    .where('noteId')
    .equals(noteId)
    .orderBy('timestamp')
    .reverse()
    .limit(10) // Keep last 10 versions
    .toArray();
};
```

### Recently Deleted Items
DevNotes keeps deleted items in a trash folder:

```javascript
// Recover from trash
const recoverFromTrash = async () => {
  const trashedItems = await db.trash.toArray();
  
  console.log(`Found ${trashedItems.length} items in trash`);
  
  // Show trash recovery interface
  const itemsToRecover = await showTrashRecoveryDialog(trashedItems);
  
  for (const item of itemsToRecover) {
    if (item.type === 'note') {
      await db.notes.add(item.data);
    } else if (item.type === 'folder') {
      await db.folders.add(item.data);
    }
    
    // Remove from trash
    await db.trash.delete(item.id);
  }
  
  console.log(`Recovered ${itemsToRecover.length} items`);
};

// Empty trash (permanent deletion)
const emptyTrash = async () => {
  const count = await db.trash.count();
  await db.trash.clear();
  console.log(`Permanently deleted ${count} items`);
};
```

## Backup Recovery

### Local Backup Recovery
Restore from automatic local backups:

```javascript
// Find and restore from local backups
const recoverFromLocalBackup = async () => {
  const backups = await findLocalBackups();
  
  if (backups.length === 0) {
    throw new Error('No local backups found');
  }
  
  // Sort by date (newest first)
  backups.sort((a, b) => b.timestamp - a.timestamp);
  
  console.log(`Found ${backups.length} local backups`);
  
  // Show backup selection dialog
  const selectedBackup = await showBackupSelectionDialog(backups);
  
  if (selectedBackup) {
    await restoreFromBackup(selectedBackup);
    console.log('Data restored from local backup');
    return true;
  }
  
  return false;
};

const findLocalBackups = async () => {
  const backups = [];
  
  // Check IndexedDB backup store
  const dbBackups = await db.backups.orderBy('timestamp').reverse().toArray();
  backups.push(...dbBackups);
  
  // Check localStorage backups
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key.startsWith('devnotes-backup-')) {
      try {
        const backup = JSON.parse(localStorage.getItem(key));
        backups.push({
          id: key,
          timestamp: backup.timestamp,
          source: 'localStorage',
          data: backup
        });
      } catch (error) {
        console.warn(`Invalid backup in localStorage: ${key}`);
      }
    }
  }
  
  return backups;
};
```

### Export File Recovery
Recover from previously exported files:

```javascript
// Recover from export files
const recoverFromExport = async (exportFile) => {
  try {
    let data;
    
    if (typeof exportFile === 'string') {
      // JSON string
      data = JSON.parse(exportFile);
    } else if (exportFile instanceof File) {
      // File object
      const text = await exportFile.text();
      data = JSON.parse(text);
    } else {
      // Already parsed object
      data = exportFile;
    }
    
    // Validate export data
    if (!validateExportData(data)) {
      throw new Error('Invalid export data format');
    }
    
    // Show import options
    const importOptions = await showImportOptionsDialog(data);
    
    // Import data based on options
    await importData(data, importOptions);
    
    console.log('Data recovered from export file');
    return true;
    
  } catch (error) {
    console.error('Export recovery failed:', error);
    throw new Error(`Failed to recover from export: ${error.message}`);
  }
};

const validateExportData = (data) => {
  // Check required fields
  if (!data.version || !data.timestamp) {
    return false;
  }
  
  // Check data structure
  if (!data.notes || !Array.isArray(data.notes)) {
    return false;
  }
  
  if (!data.folders || !Array.isArray(data.folders)) {
    return false;
  }
  
  // Validate individual notes
  for (const note of data.notes) {
    if (!note.id || !note.title || typeof note.content !== 'string') {
      return false;
    }
  }
  
  return true;
};
```

## Browser-Level Recovery

### IndexedDB Recovery
Attempt to recover from IndexedDB corruption:

```javascript
// Recover from IndexedDB corruption
const recoverFromIndexedDBCorruption = async () => {
  console.log('Attempting IndexedDB recovery...');
  
  try {
    // Try to open database in recovery mode
    const recoveredData = await openDatabaseInRecoveryMode();
    
    if (recoveredData) {
      // Create new database
      await createFreshDatabase();
      
      // Import recovered data
      await importRecoveredData(recoveredData);
      
      console.log('IndexedDB recovery successful');
      return true;
    }
  } catch (error) {
    console.error('IndexedDB recovery failed:', error);
  }
  
  // Try alternative recovery methods
  return await tryAlternativeRecovery();
};

const openDatabaseInRecoveryMode = async () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('devnotes-recovery', 1);
    
    request.onerror = () => reject(request.error);
    
    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction(['notes', 'folders'], 'readonly');
      
      const notes = [];
      const folders = [];
      
      // Try to read all data
      const noteStore = transaction.objectStore('notes');
      const folderStore = transaction.objectStore('folders');
      
      noteStore.getAll().onsuccess = (event) => {
        notes.push(...event.target.result);
      };
      
      folderStore.getAll().onsuccess = (event) => {
        folders.push(...event.target.result);
      };
      
      transaction.oncomplete = () => {
        resolve({ notes, folders });
      };
      
      transaction.onerror = () => {
        reject(transaction.error);
      };
    };
  });
};
```

### Browser Cache Recovery
Recover data from browser cache:

```javascript
// Recover from browser cache
const recoverFromBrowserCache = async () => {
  console.log('Searching browser cache for recoverable data...');
  
  const recoveredData = {
    notes: [],
    folders: [],
    settings: {}
  };
  
  // Check service worker cache
  if ('caches' in window) {
    const cacheNames = await caches.keys();
    
    for (const cacheName of cacheNames) {
      if (cacheName.includes('devnotes')) {
        const cache = await caches.open(cacheName);
        const requests = await cache.keys();
        
        for (const request of requests) {
          if (request.url.includes('api/notes') || request.url.includes('api/folders')) {
            try {
              const response = await cache.match(request);
              const data = await response.json();
              
              if (data.notes) recoveredData.notes.push(...data.notes);
              if (data.folders) recoveredData.folders.push(...data.folders);
            } catch (error) {
              console.warn('Failed to recover from cache entry:', error);
            }
          }
        }
      }
    }
  }
  
  // Check sessionStorage
  for (let i = 0; i < sessionStorage.length; i++) {
    const key = sessionStorage.key(i);
    if (key.startsWith('devnotes-')) {
      try {
        const data = JSON.parse(sessionStorage.getItem(key));
        if (data.notes) recoveredData.notes.push(...data.notes);
        if (data.folders) recoveredData.folders.push(...data.folders);
      } catch (error) {
        console.warn(`Invalid sessionStorage data: ${key}`);
      }
    }
  }
  
  // Deduplicate recovered data
  recoveredData.notes = deduplicateById(recoveredData.notes);
  recoveredData.folders = deduplicateById(recoveredData.folders);
  
  console.log(`Recovered ${recoveredData.notes.length} notes and ${recoveredData.folders.length} folders from cache`);
  
  return recoveredData;
};

const deduplicateById = (items) => {
  const seen = new Set();
  return items.filter(item => {
    if (seen.has(item.id)) {
      return false;
    }
    seen.add(item.id);
    return true;
  });
};
```

## Advanced Recovery Techniques

### Partial Data Recovery
Recover what you can from corrupted data:

```javascript
// Attempt partial recovery from corrupted data
const attemptPartialRecovery = async (corruptedData) => {
  const recovered = {
    notes: [],
    folders: [],
    errors: []
  };
  
  // Try to recover individual notes
  if (corruptedData.notes) {
    for (let i = 0; i < corruptedData.notes.length; i++) {
      try {
        const note = corruptedData.notes[i];
        
        // Validate and repair note
        const repairedNote = repairNote(note);
        if (repairedNote) {
          recovered.notes.push(repairedNote);
        }
      } catch (error) {
        recovered.errors.push({
          type: 'note',
          index: i,
          error: error.message
        });
      }
    }
  }
  
  // Try to recover folders
  if (corruptedData.folders) {
    for (let i = 0; i < corruptedData.folders.length; i++) {
      try {
        const folder = corruptedData.folders[i];
        
        // Validate and repair folder
        const repairedFolder = repairFolder(folder);
        if (repairedFolder) {
          recovered.folders.push(repairedFolder);
        }
      } catch (error) {
        recovered.errors.push({
          type: 'folder',
          index: i,
          error: error.message
        });
      }
    }
  }
  
  console.log(`Partial recovery: ${recovered.notes.length} notes, ${recovered.folders.length} folders, ${recovered.errors.length} errors`);
  
  return recovered;
};

const repairNote = (note) => {
  // Check required fields
  if (!note.id) {
    note.id = generateId();
  }
  
  if (!note.title) {
    note.title = 'Recovered Note';
  }
  
  if (typeof note.content !== 'string') {
    note.content = String(note.content || '');
  }
  
  if (!note.createdAt) {
    note.createdAt = new Date();
  }
  
  if (!note.modifiedAt) {
    note.modifiedAt = new Date();
  }
  
  // Validate content
  if (note.content.length > 1024 * 1024) {
    note.content = note.content.substring(0, 1024 * 1024) + '\n\n[Content truncated during recovery]';
  }
  
  return note;
};
```

### Text-Based Recovery
Recover content from plain text sources:

```javascript
// Recover notes from plain text
const recoverFromPlainText = (textContent) => {
  const notes = [];
  
  // Split by common note separators
  const sections = textContent.split(/\n\s*#{1,6}\s+/);
  
  sections.forEach((section, index) => {
    if (section.trim()) {
      const lines = section.split('\n');
      const title = lines[0].trim() || `Recovered Note ${index + 1}`;
      const content = lines.slice(1).join('\n').trim();
      
      if (content) {
        notes.push({
          id: generateId(),
          title: title,
          content: `# ${title}\n\n${content}`,
          createdAt: new Date(),
          modifiedAt: new Date(),
          folderId: null,
          tags: ['recovered']
        });
      }
    }
  });
  
  return notes;
};

// Recover from clipboard content
const recoverFromClipboard = async () => {
  try {
    const clipboardText = await navigator.clipboard.readText();
    
    if (clipboardText && clipboardText.length > 100) {
      const recoveredNotes = recoverFromPlainText(clipboardText);
      
      if (recoveredNotes.length > 0) {
        console.log(`Recovered ${recoveredNotes.length} notes from clipboard`);
        return recoveredNotes;
      }
    }
  } catch (error) {
    console.warn('Clipboard recovery failed:', error);
  }
  
  return [];
};
```

## Recovery Workflows

### Complete Recovery Workflow
Comprehensive recovery process:

```javascript
// Complete data recovery workflow
const performCompleteRecovery = async () => {
  console.log('Starting complete data recovery process...');
  
  const recoveryResults = {
    undoRecovery: false,
    autoSaveRecovery: false,
    trashRecovery: false,
    backupRecovery: false,
    exportRecovery: false,
    browserRecovery: false,
    partialRecovery: false,
    totalRecovered: 0
  };
  
  try {
    // Step 1: Try undo/redo recovery
    console.log('Step 1: Checking undo history...');
    const undoHistory = devnotes.getUndoHistory();
    if (undoHistory.length > 0) {
      recoveryResults.undoRecovery = true;
      console.log(`Found ${undoHistory.length} undoable actions`);
    }
    
    // Step 2: Auto-save version recovery
    console.log('Step 2: Checking auto-save versions...');
    const autoSaveCount = await checkAutoSaveVersions();
    if (autoSaveCount > 0) {
      recoveryResults.autoSaveRecovery = true;
      console.log(`Found ${autoSaveCount} auto-save versions`);
    }
    
    // Step 3: Trash recovery
    console.log('Step 3: Checking trash...');
    const trashItems = await db.trash.count();
    if (trashItems > 0) {
      recoveryResults.trashRecovery = true;
      console.log(`Found ${trashItems} items in trash`);
    }
    
    // Step 4: Local backup recovery
    console.log('Step 4: Checking local backups...');
    const localBackups = await findLocalBackups();
    if (localBackups.length > 0) {
      recoveryResults.backupRecovery = true;
      console.log(`Found ${localBackups.length} local backups`);
    }
    
    // Step 5: Browser cache recovery
    console.log('Step 5: Checking browser cache...');
    const cacheData = await recoverFromBrowserCache();
    if (cacheData.notes.length > 0 || cacheData.folders.length > 0) {
      recoveryResults.browserRecovery = true;
      recoveryResults.totalRecovered += cacheData.notes.length;
      console.log(`Recovered ${cacheData.notes.length} notes from cache`);
    }
    
    // Step 6: Show recovery options to user
    const recoveryOptions = await showRecoveryOptionsDialog(recoveryResults);
    
    // Execute selected recovery methods
    await executeRecoveryMethods(recoveryOptions);
    
    console.log('Data recovery process completed');
    
  } catch (error) {
    console.error('Recovery process failed:', error);
    throw error;
  }
  
  return recoveryResults;
};
```

### Selective Recovery
Recover specific types of data:

```javascript
// Selective recovery interface
const performSelectiveRecovery = async (options) => {
  const results = {};
  
  if (options.recoverNotes) {
    results.notes = await recoverNotes(options.noteFilters);
  }
  
  if (options.recoverFolders) {
    results.folders = await recoverFolders(options.folderFilters);
  }
  
  if (options.recoverSettings) {
    results.settings = await recoverSettings();
  }
  
  if (options.recoverSearchIndex) {
    results.searchIndex = await recoverSearchIndex();
  }
  
  return results;
};

const recoverNotes = async (filters = {}) => {
  const allSources = [
    () => recoverFromAutoSave(),
    () => recoverFromTrash(),
    () => recoverFromBackups(),
    () => recoverFromBrowserCache()
  ];
  
  const recoveredNotes = [];
  
  for (const source of allSources) {
    try {
      const notes = await source();
      
      // Apply filters
      const filteredNotes = applyNoteFilters(notes, filters);
      recoveredNotes.push(...filteredNotes);
      
    } catch (error) {
      console.warn('Recovery source failed:', error);
    }
  }
  
  // Deduplicate and sort
  return deduplicateAndSortNotes(recoveredNotes);
};
```

## Prevention Strategies

### Automatic Backup Configuration
Set up robust backup systems:

```javascript
// Configure automatic backups
const configureAutoBackup = (options = {}) => {
  const config = {
    enabled: true,
    frequency: 'daily', // hourly, daily, weekly
    retention: 30, // days
    location: 'local', // local, cloud, both
    compression: true,
    encryption: false,
    ...options
  };
  
  // Schedule automatic backups
  scheduleBackups(config);
  
  // Set up backup verification
  scheduleBackupVerification(config);
  
  return config;
};

const scheduleBackups = (config) => {
  const intervals = {
    hourly: 60 * 60 * 1000,
    daily: 24 * 60 * 60 * 1000,
    weekly: 7 * 24 * 60 * 60 * 1000
  };
  
  const interval = intervals[config.frequency];
  
  setInterval(async () => {
    try {
      await createAutomaticBackup(config);
      console.log('Automatic backup completed');
    } catch (error) {
      console.error('Automatic backup failed:', error);
    }
  }, interval);
};
```

### Data Integrity Monitoring
Monitor data integrity continuously:

```javascript
// Data integrity monitoring
const setupIntegrityMonitoring = () => {
  // Check data integrity every 5 minutes
  setInterval(async () => {
    try {
      const issues = await checkDataIntegrity();
      
      if (issues.length > 0) {
        console.warn(`Found ${issues.length} data integrity issues`);
        
        // Attempt automatic repair
        const repaired = await attemptAutoRepair(issues);
        
        if (repaired < issues.length) {
          // Notify user of unresolved issues
          notifyUser(`Data integrity issues detected. ${repaired}/${issues.length} automatically repaired.`);
        }
      }
    } catch (error) {
      console.error('Integrity check failed:', error);
    }
  }, 5 * 60 * 1000);
};

const checkDataIntegrity = async () => {
  const issues = [];
  
  // Check for orphaned notes
  const notes = await db.notes.toArray();
  const folders = await db.folders.toArray();
  const folderIds = new Set(folders.map(f => f.id));
  
  notes.forEach(note => {
    if (note.folderId && !folderIds.has(note.folderId)) {
      issues.push({
        type: 'orphaned_note',
        noteId: note.id,
        folderId: note.folderId
      });
    }
  });
  
  // Check for duplicate IDs
  const noteIds = notes.map(n => n.id);
  const duplicateNoteIds = noteIds.filter((id, index) => noteIds.indexOf(id) !== index);
  
  duplicateNoteIds.forEach(id => {
    issues.push({
      type: 'duplicate_note_id',
      noteId: id
    });
  });
  
  return issues;
};
```

### Recovery Testing
Regularly test recovery procedures:

```javascript
// Recovery testing suite
const testRecoveryProcedures = async () => {
  console.log('Starting recovery procedure tests...');
  
  const tests = [
    testUndoRecovery,
    testAutoSaveRecovery,
    testTrashRecovery,
    testBackupRecovery,
    testExportRecovery
  ];
  
  const results = [];
  
  for (const test of tests) {
    try {
      const result = await test();
      results.push({ test: test.name, passed: true, result });
    } catch (error) {
      results.push({ test: test.name, passed: false, error: error.message });
    }
  }
  
  const passedTests = results.filter(r => r.passed).length;
  console.log(`Recovery tests: ${passedTests}/${results.length} passed`);
  
  return results;
};

const testBackupRecovery = async () => {
  // Create test data
  const testNote = await createTestNote();
  
  // Create backup
  const backup = await createBackup();
  
  // Delete test data
  await db.notes.delete(testNote.id);
  
  // Attempt recovery
  await restoreFromBackup(backup);
  
  // Verify recovery
  const recovered = await db.notes.get(testNote.id);
  
  if (!recovered || recovered.content !== testNote.content) {
    throw new Error('Backup recovery test failed');
  }
  
  return 'Backup recovery test passed';
};
```

## Best Practices

### Recovery Best Practices
1. **Regular backups**: Export data weekly
2. **Multiple backup locations**: Local and cloud storage
3. **Test recovery procedures**: Verify backups work
4. **Monitor data integrity**: Check for corruption
5. **Document recovery procedures**: Keep recovery instructions

### Prevention Best Practices
1. **Enable auto-save**: Minimize data loss
2. **Use version control**: Keep multiple versions
3. **Avoid risky operations**: Be careful with bulk operations
4. **Keep backups current**: Regular backup schedule
5. **Monitor storage health**: Check for issues early

### Emergency Procedures
1. **Stop using the application**: Prevent further data loss
2. **Don't clear browser data**: Preserve recovery sources
3. **Document the issue**: Note what happened
4. **Try immediate recovery**: Undo, auto-save, trash
5. **Contact support**: If recovery fails

## Next Steps

- **[Learn about common issues](troubleshooting/common-issues)** - Prevent data loss scenarios
- **[Explore data management](advanced/data-management)** - Better data protection strategies
- **[Check performance optimization](troubleshooting/performance)** - Maintain system health

Data recovery is your safety net, but prevention is always better than recovery. Implement robust backup strategies and monitor your data health regularly to minimize the risk of data loss.