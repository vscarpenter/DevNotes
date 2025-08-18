# Common Issues

This guide helps you diagnose and resolve the most frequently encountered issues in DevNotes.

## Application Won't Load

### Symptoms
- Blank white screen
- Loading spinner that never completes
- Error messages on startup
- Browser console errors

### Troubleshooting Steps

#### 1. Check Browser Compatibility
Ensure you're using a supported browser with the minimum required version:

**✅ Fully Supported Browsers:**
- **Chrome**: Version 90+ (Recommended: Latest version)
- **Firefox**: Version 88+ (Recommended: Latest version)
- **Safari**: Version 14+ (macOS/iOS only)
- **Edge**: Version 90+ (Chromium-based)

**❌ Unsupported Browsers:**
- Internet Explorer (all versions)
- Chrome versions below 90
- Firefox versions below 88
- Safari versions below 14

**How to check your browser version:**
1. **Chrome**: Go to `chrome://version/` or Help → About Google Chrome
2. **Firefox**: Go to `about:support` or Help → About Firefox
3. **Safari**: Safari menu → About Safari
4. **Edge**: Go to `edge://version/` or Help → About Microsoft Edge

#### 2. Clear Browser Cache (Step-by-Step)

**Chrome:**
1. Press `Ctrl+Shift+Delete` (Windows/Linux) or `Cmd+Shift+Delete` (Mac)
2. In the "Clear browsing data" dialog:
   - **Time range**: Select "All time"
   - **Check these boxes**: 
     - ✅ Cached images and files
     - ✅ Cookies and other site data (if you don't mind re-logging into sites)
3. Click "Clear data"
4. Wait for the process to complete
5. Refresh DevNotes (`F5` or `Ctrl+R`)

**Firefox:**
1. Press `Ctrl+Shift+Delete` (Windows/Linux) or `Cmd+Shift+Delete` (Mac)
2. In the "Clear Recent History" dialog:
   - **Time range to clear**: Select "Everything"
   - **Details**: Click to expand and check:
     - ✅ Cache
     - ✅ Cookies (optional)
3. Click "Clear Now"
4. Refresh DevNotes

**Safari:**
1. Go to Safari menu → Preferences → Privacy
2. Click "Manage Website Data..."
3. Search for your DevNotes domain
4. Click "Remove" or "Remove All"
5. Refresh DevNotes

#### 3. Disable Browser Extensions (Systematic Approach)

**Why this helps:** Extensions can interfere with DevNotes by:
- Blocking JavaScript execution
- Modifying page content
- Intercepting network requests
- Consuming excessive memory

**Step-by-step process:**

**Chrome:**
1. Type `chrome://extensions/` in the address bar
2. **Turn off all extensions** by clicking the toggle switches
3. **Restart Chrome** completely (close all windows)
4. **Test DevNotes** - if it works, re-enable extensions one by one to find the culprit

**Firefox:**
1. Type `about:addons` in the address bar
2. Click "Extensions" in the left sidebar
3. **Disable all extensions** by clicking the toggle switches
4. **Restart Firefox**
5. **Test DevNotes**

**Common problematic extensions:**
- Ad blockers (uBlock Origin, AdBlock Plus)
- Privacy tools (Ghostery, Privacy Badger)
- Script blockers (NoScript)
- VPN extensions
- Password managers (sometimes)

#### 4. Verify JavaScript is Enabled

**Chrome:**
1. Go to `chrome://settings/content/javascript`
2. Ensure "Sites can use Javascript" is selected
3. Check if your DevNotes domain is in the "Block" list
4. If blocked, click the trash icon to remove it

**Firefox:**
1. Type `about:config` in the address bar
2. Accept the warning
3. Search for `javascript.enabled`
4. Ensure the value is `true`
5. If `false`, double-click to change it to `true`

**Safari:**
1. Safari menu → Preferences → Security
2. Ensure "Enable JavaScript" is checked
3. Close preferences and refresh DevNotes

#### 5. Check for Console Errors (Advanced)
1. **Open Developer Tools**: Press `F12` or right-click → "Inspect"
2. **Go to Console tab**
3. **Look for red error messages**
4. **Common error patterns to look for:**
   ```
   Failed to load resource: net::ERR_BLOCKED_BY_CLIENT
   Uncaught ReferenceError: [something] is not defined
   Failed to execute 'open' on 'IDBFactory'
   SecurityError: The operation is insecure
   ```
5. **Take a screenshot** of any errors for support

### Advanced Solutions

#### Reset Application Data (Nuclear Option)

⚠️ **CRITICAL WARNING**: This will permanently delete ALL your local data. Only use this as a last resort after trying all other solutions.

**Before proceeding:**
1. **Try to export your data** if the app partially works
2. **Check if you have recent backups**
3. **Consider contacting support** first

**Step-by-step reset process:**

1. **Open Developer Console:**
   - Press `F12` or right-click → "Inspect"
   - Click the "Console" tab

2. **Run the reset commands** (copy and paste each line):
   ```javascript
   // Clear all local storage
   localStorage.clear();
   console.log("✅ Local storage cleared");
   
   // Clear session storage
   sessionStorage.clear();
   console.log("✅ Session storage cleared");
   
   // Delete IndexedDB database
   indexedDB.deleteDatabase('devnotes').onsuccess = function() {
     console.log("✅ Database deleted");
   };
   
   // Clear all caches
   if ('caches' in window) {
     caches.keys().then(names => {
       names.forEach(name => caches.delete(name));
       console.log("✅ Caches cleared");
     });
   }
   ```

3. **Wait for confirmation messages** in the console

4. **Close all DevNotes tabs**

5. **Restart your browser completely**

6. **Open DevNotes in a new tab**

**What this does:**
- Removes all notes and folders
- Clears all settings and preferences
- Deletes search indexes
- Removes cached data
- Resets the app to factory state

**After reset:**
- DevNotes should load like a fresh installation
- You'll see the welcome screen
- All data will be gone (unless you have backups)
- You can import from backups if available

![Screenshot: Console Reset Process](../../../assets/screenshots/console-reset.png)
*Running the reset commands in the browser console*

## Notes Not Saving

### Symptoms
- Changes disappear after refresh
- "Save failed" error messages
- Auto-save indicator stuck
- Data loss after browser restart

### Troubleshooting Steps

#### 1. Check Storage Permissions
Verify browser storage permissions:
1. Click the lock icon in address bar
2. Ensure "Storage" is set to "Allow"
3. Refresh the page

#### 2. Check Available Storage
```javascript
// Check storage quota in browser console
navigator.storage.estimate().then(estimate => {
  console.log(`Used: ${(estimate.usage / 1024 / 1024).toFixed(2)}MB`);
  console.log(`Available: ${(estimate.quota / 1024 / 1024).toFixed(2)}MB`);
  console.log(`Usage: ${(estimate.usage / estimate.quota * 100).toFixed(2)}%`);
});
```

If storage is full:
1. Export important notes
2. Delete unnecessary notes
3. Clear browser cache
4. Try saving again

#### 3. Disable Private/Incognito Mode
Private browsing modes may prevent data persistence:
1. Open DevNotes in normal browser window
2. Import your notes if needed
3. Continue working in normal mode

#### 4. Check Network Connection
For cloud sync features:
1. Verify internet connection
2. Check if cloud service is accessible
3. Try manual sync

### Manual Recovery
If auto-save fails, try manual save:
1. Select all content (`Ctrl+A`)
2. Copy to clipboard (`Ctrl+C`)
3. Create new note
4. Paste content (`Ctrl+V`)
5. Save manually (`Ctrl+S`)

## Search Not Working

### Symptoms
- No search results for known content
- Search interface not responding
- Slow search performance
- Incorrect search results

### Troubleshooting Steps

#### 1. Rebuild Search Index
```javascript
// In browser console:
devnotes.search.rebuildIndex().then(() => {
  console.log('Search index rebuilt');
});
```

#### 2. Check Search Syntax
Verify your search query syntax:
```
# Correct syntax
javascript functions
title:"meeting notes"
folder:projects

# Incorrect syntax
javascript AND AND functions  // Double AND
title:meeting notes           // Missing quotes
folder:"projects              // Unclosed quote
```

#### 3. Clear Search Cache
```javascript
// Clear search cache
devnotes.search.clearCache();
```

#### 4. Check Content Indexing
Ensure notes are properly indexed:
1. Open a note that should appear in search
2. Make a small edit
3. Save the note
4. Try searching again

### Search Performance Issues
If search is slow:
1. **Limit search scope**: Use folder filters
2. **Use specific terms**: Avoid very broad searches
3. **Clear old data**: Remove unused notes
4. **Restart application**: Refresh the page

## Import/Export Problems

### Import Issues

#### File Not Recognized
- **Check file format**: Ensure file has correct extension (.md, .json, .txt)
- **Verify file encoding**: Use UTF-8 encoding
- **Check file size**: Large files may timeout
- **Validate file structure**: Ensure proper JSON format for structured imports

#### Content Corruption During Import
```javascript
// Validate imported content
const validateImport = (data) => {
  if (!data.notes || !Array.isArray(data.notes)) {
    throw new Error('Invalid notes array');
  }
  
  data.notes.forEach((note, index) => {
    if (!note.title || !note.content) {
      console.warn(`Note ${index} missing required fields`);
    }
  });
};
```

#### Partial Import Failure
If only some notes import:
1. **Check error console** for specific failures
2. **Split large imports** into smaller batches
3. **Validate individual files** before importing
4. **Use manual import** for problematic files

### Export Issues

#### Export Fails to Complete
- **Check available disk space**
- **Try smaller export batches**
- **Use different export format**
- **Disable browser download restrictions**

#### Corrupted Export Files
```javascript
// Verify export integrity
const verifyExport = async (exportFile) => {
  try {
    const data = JSON.parse(exportFile);
    
    // Check required fields
    if (!data.notes || !data.folders) {
      throw new Error('Missing required data sections');
    }
    
    // Validate data structure
    data.notes.forEach(note => {
      if (!note.id || !note.title || !note.content) {
        throw new Error(`Invalid note structure: ${note.id}`);
      }
    });
    
    return true;
  } catch (error) {
    console.error('Export validation failed:', error);
    return false;
  }
};
```

## Performance Issues

### Slow Application Startup

#### Symptoms
- Long loading times
- Unresponsive interface during startup
- High CPU usage
- Browser becomes sluggish

#### Solutions

1. **Clear Application Cache**
```javascript
// Clear all caches
caches.keys().then(names => {
  names.forEach(name => {
    caches.delete(name);
  });
});
```

2. **Optimize Database**
```javascript
// Compact database
devnotes.db.compact().then(() => {
  console.log('Database optimized');
});
```

3. **Reduce Data Load**
- Archive old notes
- Delete unnecessary folders
- Clean up search index
- Remove large attachments

### Slow Note Loading

#### Causes
- Very large notes (>100KB)
- Complex markdown rendering
- Many embedded images
- Corrupted note data

#### Solutions

1. **Split Large Notes**
Break large notes into smaller, focused notes

2. **Optimize Images**
```javascript
// Compress images before embedding
const compressImage = (file, quality = 0.8) => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      
      canvas.toBlob(resolve, 'image/jpeg', quality);
    };
    
    img.src = URL.createObjectURL(file);
  });
};
```

3. **Enable Lazy Loading**
```javascript
// Enable lazy loading for images
const enableLazyLoading = () => {
  const images = document.querySelectorAll('img[data-src]');
  
  const imageObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        img.src = img.dataset.src;
        img.removeAttribute('data-src');
        imageObserver.unobserve(img);
      }
    });
  });
  
  images.forEach(img => imageObserver.observe(img));
};
```

## Keyboard Shortcuts Not Working

### Common Causes
- Browser shortcuts override DevNotes shortcuts
- Focus is not on DevNotes interface
- Conflicting browser extensions
- Operating system shortcuts interfere

### Solutions

#### 1. Check Focus
Ensure DevNotes has focus:
- Click anywhere in the DevNotes interface
- Try the shortcut again

#### 2. Resolve Conflicts
```javascript
// Check for shortcut conflicts
const checkShortcutConflicts = () => {
  const shortcuts = devnotes.shortcuts.getAll();
  const conflicts = [];
  
  shortcuts.forEach(shortcut => {
    if (isSystemShortcut(shortcut.key)) {
      conflicts.push(shortcut);
    }
  });
  
  return conflicts;
};
```

#### 3. Reset Shortcuts
Reset to default shortcuts:
1. Go to Settings → Keyboard Shortcuts
2. Click "Reset to Defaults"
3. Confirm the reset

#### 4. Custom Shortcuts
Create alternative shortcuts for conflicting ones:
```json
{
  "shortcuts": {
    "newNote": "Ctrl+Alt+N",
    "search": "Ctrl+Alt+F",
    "save": "Ctrl+Alt+S"
  }
}
```

## Sync Issues

### Cloud Sync Problems

#### Authentication Failures
- **Re-authenticate**: Log out and log back in
- **Check permissions**: Ensure app has necessary permissions
- **Verify credentials**: Check username/password
- **Clear auth cache**: Remove stored authentication tokens

#### Sync Conflicts
```javascript
// Handle sync conflicts
const resolveSyncConflict = (local, remote) => {
  // Show conflict resolution dialog
  const resolution = showConflictDialog({
    local: local,
    remote: remote,
    options: ['keep-local', 'keep-remote', 'merge']
  });
  
  switch (resolution) {
    case 'keep-local':
      return local;
    case 'keep-remote':
      return remote;
    case 'merge':
      return mergeNotes(local, remote);
  }
};
```

#### Partial Sync Failures
If only some data syncs:
1. **Check network stability**
2. **Verify file sizes** (large files may fail)
3. **Try manual sync** for failed items
4. **Check service status** of cloud provider

## Browser-Specific Issues

### Chrome Issues
- **Memory usage**: Chrome may use excessive memory with large note collections
- **Extension conflicts**: Ad blockers may interfere with functionality
- **Storage limits**: Check chrome://settings/content/all for storage permissions

### Firefox Issues
- **Tracking protection**: May block some features
- **Private browsing**: Doesn't persist data
- **Security settings**: Strict security may prevent functionality

### Safari Issues
- **Storage limitations**: More restrictive storage policies
- **Cross-origin restrictions**: May affect some features
- **Extension compatibility**: Limited extension support

## Error Messages

### Common Error Messages and Solutions

#### "Storage quota exceeded"
```javascript
// Free up storage space
const freeUpSpace = async () => {
  // Delete old backups
  await devnotes.backups.cleanup();
  
  // Clear search cache
  await devnotes.search.clearCache();
  
  // Optimize database
  await devnotes.db.compact();
  
  console.log('Storage space freed up');
};
```

#### "Failed to load note"
```javascript
// Attempt note recovery
const recoverNote = async (noteId) => {
  try {
    // Try loading from backup
    const backup = await devnotes.backups.findNote(noteId);
    if (backup) {
      return backup;
    }
    
    // Try loading from cache
    const cached = await devnotes.cache.getNote(noteId);
    if (cached) {
      return cached;
    }
    
    throw new Error('Note not recoverable');
  } catch (error) {
    console.error('Note recovery failed:', error);
    return null;
  }
};
```

#### "Sync failed"
```javascript
// Retry sync with exponential backoff
const retrySyncWithBackoff = async (maxRetries = 3) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      await devnotes.sync.start();
      return; // Success
    } catch (error) {
      const delay = Math.pow(2, i) * 1000; // 1s, 2s, 4s
      console.log(`Sync failed, retrying in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw new Error('Sync failed after all retries');
};
```

## Specific Problem Scenarios

### Scenario 1: "My notes disappeared after browser update"

**Symptoms:**
- Notes were there yesterday, gone today
- Browser was recently updated
- No error messages visible

**Step-by-step solution:**
1. **Don't panic** - data is likely still there
2. **Check browser console** (F12 → Console tab)
3. **Look for these specific messages:**
   ```
   Failed to open database: Version change transaction was aborted
   IDBDatabase.open() called with version [X], but database is version [Y]
   ```
4. **If you see version errors:**
   ```javascript
   // In console, try to access old version
   const request = indexedDB.open('devnotes', 1); // Try version 1
   request.onsuccess = () => console.log('Found data in version 1');
   ```
5. **Recovery steps:**
   - Go to `chrome://settings/content/all`
   - Find your DevNotes domain
   - Click "Reset permissions"
   - Refresh DevNotes

### Scenario 2: "Search finds notes but won't open them"

**Symptoms:**
- Search results show note titles
- Clicking on results does nothing
- Notes exist in sidebar but won't open

**Diagnostic steps:**
1. **Check console for errors:**
   ```
   TypeError: Cannot read property 'content' of undefined
   Failed to load note: [note-id]
   ```
2. **Test database integrity:**
   ```javascript
   // In console
   devnotes.db.notes.toArray().then(notes => {
     console.log(`Found ${notes.length} notes`);
     const corruptedNotes = notes.filter(note => !note.content);
     console.log(`${corruptedNotes.length} notes missing content`);
   });
   ```

**Solution:**
1. **Rebuild search index:**
   - Settings → Advanced → "Rebuild Search Index"
   - Wait for completion message
2. **If that fails, manual rebuild:**
   ```javascript
   // Clear and rebuild index
   devnotes.search.clearIndex()
     .then(() => devnotes.search.rebuildIndex())
     .then(() => console.log('Index rebuilt successfully'));
   ```

### Scenario 3: "DevNotes is extremely slow"

**Symptoms:**
- Takes 10+ seconds to load
- Typing has noticeable delay
- Browser becomes unresponsive

**Performance diagnosis:**
1. **Check memory usage:**
   ```javascript
   // In console
   if (performance.memory) {
     const used = Math.round(performance.memory.usedJSHeapSize / 1024 / 1024);
     const limit = Math.round(performance.memory.jsHeapSizeLimit / 1024 / 1024);
     console.log(`Memory: ${used}MB / ${limit}MB (${Math.round(used/limit*100)}%)`);
   }
   ```

2. **Check note collection size:**
   ```javascript
   devnotes.db.notes.count().then(count => {
     console.log(`Total notes: ${count}`);
     if (count > 1000) console.warn('Large collection detected');
   });
   ```

**Solutions (in order of effectiveness):**
1. **Archive old notes:**
   - Create "Archive" folder
   - Move notes older than 6 months
   - Export archived notes as backup

2. **Clear browser cache:**
   - Chrome: Settings → Privacy → Clear browsing data
   - Select "All time" and "Cached images and files"

3. **Optimize database:**
   ```javascript
   // Compact database
   devnotes.db.compact().then(() => {
     console.log('Database optimized');
     location.reload();
   });
   ```

### Scenario 4: "Can't import my exported notes"

**Symptoms:**
- Import process starts but fails
- "Invalid file format" error
- Only some notes import successfully

**Troubleshooting steps:**
1. **Validate export file:**
   ```javascript
   // Drag your export file to console, then:
   const file = $0; // If you dropped it on the page
   const reader = new FileReader();
   reader.onload = (e) => {
     try {
       const data = JSON.parse(e.target.result);
       console.log('✅ Valid JSON');
       console.log(`Notes: ${data.notes?.length || 0}`);
       console.log(`Folders: ${data.folders?.length || 0}`);
     } catch (error) {
       console.error('❌ Invalid JSON:', error);
     }
   };
   reader.readAsText(file);
   ```

2. **Check file size:**
   - Files over 50MB may timeout
   - Split large exports into smaller chunks

3. **Manual import for corrupted files:**
   ```javascript
   // Extract just the notes array
   const data = JSON.parse(exportFileContent);
   const validNotes = data.notes.filter(note => 
     note.id && note.title && typeof note.content === 'string'
   );
   console.log(`${validNotes.length} valid notes found`);
   ```

## Getting Help

### Diagnostic Information Generator
When reporting issues, run this diagnostic script:

```javascript
// Comprehensive diagnostic report
const generateDiagnostics = async () => {
  const report = {
    timestamp: new Date().toISOString(),
    browser: {
      userAgent: navigator.userAgent,
      language: navigator.language,
      cookieEnabled: navigator.cookieEnabled,
      onLine: navigator.onLine
    },
    devnotes: {
      version: devnotes?.version || 'unknown',
      notesCount: await devnotes?.db?.notes?.count() || 0,
      foldersCount: await devnotes?.db?.folders?.count() || 0,
      settingsCount: await devnotes?.db?.settings?.count() || 0
    },
    storage: await navigator.storage?.estimate() || {},
    performance: {
      memory: performance.memory ? {
        used: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024),
        total: Math.round(performance.memory.totalJSHeapSize / 1024 / 1024),
        limit: Math.round(performance.memory.jsHeapSizeLimit / 1024 / 1024)
      } : 'not available'
    },
    errors: devnotes?.errors?.getRecent() || []
  };
  
  console.log('📊 Diagnostic Report:');
  console.log(JSON.stringify(report, null, 2));
  
  // Copy to clipboard
  navigator.clipboard.writeText(JSON.stringify(report, null, 2))
    .then(() => console.log('✅ Report copied to clipboard'))
    .catch(() => console.log('❌ Could not copy to clipboard'));
    
  return report;
};

// Run the diagnostic
generateDiagnostics();
```

### Support Channels (Prioritized)
1. **🔍 Search this User Guide**: Use Ctrl+F to search for your specific issue
2. **💬 Community Forum**: Check existing discussions and solutions
3. **🐛 GitHub Issues**: Report bugs with diagnostic information
4. **📧 Support Email**: For urgent issues or data recovery
5. **📚 Documentation**: Technical API and integration docs

### Before Contacting Support - Checklist
- [ ] **Tried basic troubleshooting** (clear cache, restart browser)
- [ ] **Checked browser console** for error messages
- [ ] **Tested in incognito/private mode** to rule out extensions
- [ ] **Tested in different browser** to isolate browser-specific issues
- [ ] **Exported data as backup** (if possible)
- [ ] **Generated diagnostic report** using the script above
- [ ] **Documented exact steps** to reproduce the issue
- [ ] **Noted when the issue started** (after update, specific action, etc.)

### Emergency Data Recovery Contacts
If you've lost important data and standard recovery methods don't work:
- **Priority Support**: support-urgent@devnotes.app
- **Include**: Diagnostic report, description of data loss, last known working state
- **Response time**: Within 4 hours for data loss issues

## Prevention Tips

### Regular Maintenance
1. **Weekly exports**: Backup your data regularly
2. **Clear cache**: Monthly cache clearing
3. **Update browser**: Keep browser updated
4. **Monitor storage**: Check storage usage
5. **Review settings**: Verify configuration

### Best Practices
1. **Use supported browsers**: Stick to recommended browsers
2. **Avoid private browsing**: Use normal browsing mode
3. **Keep notes reasonable size**: Split very large notes
4. **Regular backups**: Export data frequently
5. **Test imports**: Verify imported data

## Next Steps

- **[Check performance optimization](troubleshooting/performance)** - Improve application speed
- **[Learn data recovery](troubleshooting/data-recovery)** - Recover lost data
- **[Explore advanced features](advanced/power-user-tips)** - Prevent issues with better workflows

Most issues can be resolved with the steps in this guide. If problems persist, don't hesitate to seek help through the support channels.