# Customization Options

Personalize DevNotes to match your workflow, preferences, and visual style. Discover all the ways you can make DevNotes truly yours.

## Theme Customization

### Built-in Themes
DevNotes includes several professionally designed themes:

#### Light Themes
- **Default Light**: Clean, minimal design with high contrast
- **Soft Light**: Warmer tones with reduced eye strain
- **High Contrast**: Maximum contrast for accessibility
- **Minimal**: Ultra-clean design with minimal UI elements

#### Dark Themes
- **Default Dark**: Elegant dark theme with blue accents
- **True Black**: OLED-friendly pure black background
- **Warm Dark**: Dark theme with warm, amber tones
- **Midnight**: Deep blue-black theme with subtle highlights

#### Auto Themes
- **System**: Follows your operating system's theme preference
- **Time-based**: Automatically switches based on time of day
- **Adaptive**: Adjusts based on ambient light (if supported)

### Custom Theme Creation
Create your own themes using CSS variables:

```css
/* Custom theme: Forest */
:root {
  --bg-primary: #1a2f1a;
  --bg-secondary: #2d4a2d;
  --bg-tertiary: #3d5a3d;
  --text-primary: #e8f5e8;
  --text-secondary: #c8e6c8;
  --text-muted: #a8d6a8;
  --accent-primary: #4ade80;
  --accent-secondary: #22c55e;
  --border-color: #4a7c59;
  --shadow-color: rgba(0, 0, 0, 0.3);
}

/* Editor customization */
.editor {
  background: var(--bg-primary);
  color: var(--text-primary);
  font-family: 'JetBrains Mono', monospace;
}

/* Syntax highlighting */
.token.keyword {
  color: var(--accent-primary);
}

.token.string {
  color: #fbbf24;
}

.token.comment {
  color: var(--text-muted);
  font-style: italic;
}
```

### Theme Installation
1. **Create theme file** with `.css` extension
2. **Go to Settings** → **Appearance** → **Custom Themes**
3. **Import theme file** or paste CSS directly
4. **Apply theme** and preview changes
5. **Fine-tune** colors and spacing as needed

## Editor Customization

### Font Settings
Customize typography for optimal readability:

#### Font Family Options
- **System fonts**: Use your OS default fonts
- **Coding fonts**: JetBrains Mono, Fira Code, Source Code Pro
- **Reading fonts**: Inter, Roboto, Open Sans
- **Custom fonts**: Import your own font files

#### Font Configuration
```json
{
  "editor": {
    "fontFamily": "JetBrains Mono",
    "fontSize": 14,
    "lineHeight": 1.6,
    "fontWeight": 400,
    "letterSpacing": 0.5
  },
  "preview": {
    "fontFamily": "Inter",
    "fontSize": 16,
    "lineHeight": 1.7,
    "fontWeight": 400
  }
}
```

### Editor Behavior
Customize how the editor behaves:

#### Editing Options
- **Auto-save delay**: 500ms to 5000ms
- **Tab size**: 2, 4, or 8 spaces
- **Word wrap**: Enable/disable line wrapping
- **Line numbers**: Show/hide line numbers
- **Minimap**: Enable/disable code minimap
- **Bracket matching**: Highlight matching brackets

#### Smart Features
- **Auto-completion**: Enable/disable suggestions
- **Auto-pairing**: Automatically close brackets and quotes
- **Smart indentation**: Maintain indentation levels
- **Auto-linking**: Convert URLs to clickable links
- **Spell checking**: Enable/disable spell check

### Syntax Highlighting
Customize code syntax highlighting:

#### Color Schemes
- **Monokai**: Popular dark color scheme
- **Solarized**: Scientifically designed colors
- **Dracula**: Modern dark theme
- **GitHub**: Familiar GitHub-style highlighting
- **Custom**: Create your own color scheme

#### Language Support
Configure highlighting for specific languages:

```json
{
  "syntaxHighlighting": {
    "javascript": {
      "keywords": "#ff6b6b",
      "strings": "#4ecdc4",
      "comments": "#95a5a6",
      "functions": "#f39c12"
    },
    "markdown": {
      "headers": "#3498db",
      "emphasis": "#e74c3c",
      "code": "#2ecc71",
      "links": "#9b59b6"
    }
  }
}
```

## Interface Customization

### Layout Options
Customize the DevNotes interface layout:

#### Sidebar Configuration
- **Width**: Adjustable from 200px to 400px
- **Position**: Left or right side
- **Auto-hide**: Hide when not in use
- **Compact mode**: Reduced spacing and smaller icons
- **Tree indentation**: Adjust folder nesting visual depth

#### Editor Layout
- **Split view ratio**: Adjust editor/preview split
- **Default view**: Editor-only, split, or preview-only
- **Toolbar position**: Top, bottom, or floating
- **Status bar**: Show/hide status information
- **Breadcrumbs**: Show current note path

### Toolbar Customization
Customize the editor toolbar:

#### Button Configuration
```json
{
  "toolbar": {
    "buttons": [
      "bold",
      "italic",
      "code",
      "|",
      "header1",
      "header2",
      "header3",
      "|",
      "unordered-list",
      "ordered-list",
      "task-list",
      "|",
      "link",
      "image",
      "table",
      "|",
      "preview-toggle"
    ],
    "position": "top",
    "size": "medium",
    "showLabels": false
  }
}
```

#### Custom Buttons
Add custom buttons for frequently used actions:

```javascript
// Custom button for inserting current date
const dateButton = {
  name: 'insert-date',
  title: 'Insert Current Date',
  icon: 'calendar',
  action: (editor) => {
    const date = new Date().toISOString().split('T')[0];
    editor.insertText(date);
  },
  shortcut: 'Ctrl+;'
};

toolbar.addButton(dateButton);
```

## Keyboard Shortcuts

### Shortcut Customization
Modify keyboard shortcuts to match your preferences:

#### Common Customizations
```json
{
  "shortcuts": {
    "newNote": "Ctrl+N",
    "newFolder": "Ctrl+Shift+N",
    "save": "Ctrl+S",
    "search": "Ctrl+/",
    "togglePreview": "Ctrl+Shift+P",
    "insertDate": "Ctrl+;",
    "insertTime": "Ctrl+Shift+;",
    "wordCount": "Ctrl+Shift+W"
  }
}
```

#### Vim Mode
Enable Vim keybindings for modal editing:

```json
{
  "editor": {
    "vimMode": true,
    "vimSettings": {
      "insertModeEscape": "jj",
      "showMode": true,
      "highlightSearch": true,
      "smartCase": true
    }
  }
}
```

#### Emacs Mode
Enable Emacs keybindings:

```json
{
  "editor": {
    "emacsMode": true,
    "emacsSettings": {
      "metaKey": "Alt",
      "killRing": true,
      "markMode": true
    }
  }
}
```

## Workflow Customization

### Auto-Save Settings
Configure automatic saving behavior:

```json
{
  "autoSave": {
    "enabled": true,
    "delay": 500,
    "onFocusLoss": true,
    "onWindowClose": true,
    "showIndicator": true,
    "backupVersions": 5
  }
}
```

### File Organization
Customize file and folder behavior:

#### Default Settings
```json
{
  "files": {
    "defaultNoteTitle": "Untitled Note",
    "dateInFilename": false,
    "autoRename": true,
    "sortBy": "modified",
    "sortOrder": "desc",
    "showFileExtensions": false
  },
  "folders": {
    "autoExpand": true,
    "rememberState": true,
    "showItemCount": true,
    "compactView": false
  }
}
```

### Search Behavior
Customize search functionality:

```json
{
  "search": {
    "searchAsYouType": true,
    "caseSensitive": false,
    "wholeWords": false,
    "includeFilenames": true,
    "maxResults": 50,
    "highlightMatches": true,
    "showPreview": true,
    "previewLength": 200
  }
}
```

## Export/Import Customization

### Default Export Settings
Set preferred export formats and options:

```json
{
  "export": {
    "defaultFormat": "markdown",
    "includeMetadata": true,
    "preserveStructure": true,
    "imageHandling": "embed",
    "compression": true,
    "customTemplates": {
      "html": "custom-html-template.html",
      "pdf": "custom-pdf-template.css"
    }
  }
}
```

### Import Preferences
Configure import behavior:

```json
{
  "import": {
    "duplicateHandling": "rename",
    "preserveDates": true,
    "convertFormats": true,
    "defaultFolder": "Imported",
    "batchSize": 100
  }
}
```

## Advanced Customization

### Plugin System
Extend DevNotes with custom plugins:

#### Plugin Structure
```javascript
class CustomPlugin {
  constructor() {
    this.name = 'My Custom Plugin';
    this.version = '1.0.0';
    this.description = 'Adds custom functionality';
  }

  onLoad() {
    // Plugin initialization
    this.addMenuItem();
    this.registerShortcuts();
  }

  onNoteOpen(note) {
    // Called when a note is opened
    this.updateWordCount(note);
  }

  onNoteSave(note) {
    // Called when a note is saved
    this.backupNote(note);
  }

  addMenuItem() {
    const menu = devnotes.getMenu('tools');
    menu.addItem({
      label: 'My Custom Action',
      action: () => this.customAction(),
      shortcut: 'Ctrl+Alt+C'
    });
  }

  customAction() {
    // Custom functionality
    console.log('Custom action executed!');
  }
}

// Register plugin
devnotes.plugins.register(new CustomPlugin());
```

### CSS Customization
Advanced styling with custom CSS:

#### Custom Scrollbars
```css
/* Custom scrollbar styling */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: var(--bg-secondary);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb {
  background: var(--accent-primary);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: var(--accent-secondary);
}
```

#### Custom Animations
```css
/* Smooth transitions */
.note-item {
  transition: all 0.2s ease-in-out;
}

.note-item:hover {
  transform: translateX(4px);
  background: var(--bg-tertiary);
}

/* Fade in animation for new notes */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.note-new {
  animation: fadeIn 0.3s ease-out;
}
```

### JavaScript Customization
Add custom JavaScript functionality:

```javascript
// Custom note templates
const templates = {
  meeting: `# Meeting Notes - {{date}}

**Attendees**: 
**Duration**: 
**Location**: 

## Agenda
1. 
2. 
3. 

## Discussion

## Action Items
- [ ] 

## Next Steps
`,

  codeReview: `# Code Review - {{title}}

**PR**: 
**Author**: 
**Reviewer**: 
**Date**: {{date}}

## Summary

## Files Changed

## Comments

## Decision
- [ ] Approve
- [ ] Request Changes
- [ ] Needs Discussion
`
};

// Register templates
Object.entries(templates).forEach(([name, content]) => {
  devnotes.templates.register(name, content);
});
```

## Settings Management

### Configuration Files
DevNotes stores settings in JSON configuration files:

#### User Settings (`settings.json`)
```json
{
  "theme": "dark",
  "editor": {
    "fontSize": 14,
    "fontFamily": "JetBrains Mono",
    "tabSize": 2,
    "wordWrap": true
  },
  "shortcuts": {
    "newNote": "Ctrl+N",
    "search": "Ctrl+/"
  },
  "autoSave": {
    "enabled": true,
    "delay": 500
  }
}
```

#### Workspace Settings (`.devnotes/settings.json`)
```json
{
  "folderStructure": {
    "defaultExpanded": ["Projects", "Learning"],
    "sortBy": "name",
    "showHidden": false
  },
  "searchSettings": {
    "indexingEnabled": true,
    "excludePatterns": ["*.tmp", "node_modules"]
  }
}
```

### Settings Sync
Synchronize settings across devices:

#### Export Settings
```bash
# Export current settings
devnotes settings export --file=my-settings.json
```

#### Import Settings
```bash
# Import settings from file
devnotes settings import --file=my-settings.json --merge
```

#### Cloud Sync
```json
{
  "sync": {
    "enabled": true,
    "provider": "dropbox",
    "settingsFile": "devnotes-settings.json",
    "autoSync": true,
    "conflictResolution": "prompt"
  }
}
```

## Troubleshooting Customization

### Common Issues

#### Theme Not Loading
1. **Check CSS syntax** for errors
2. **Verify file permissions** for custom themes
3. **Clear browser cache** and reload
4. **Reset to default theme** if corrupted

#### Shortcuts Not Working
1. **Check for conflicts** with browser/OS shortcuts
2. **Verify JSON syntax** in settings file
3. **Reset shortcuts** to defaults
4. **Restart application** after changes

#### Performance Issues
1. **Disable heavy customizations** temporarily
2. **Check for infinite loops** in custom JavaScript
3. **Optimize CSS selectors** for better performance
4. **Reduce animation complexity**

### Backup and Recovery
Always backup your customizations:

```bash
# Backup all customizations
mkdir devnotes-backup
cp -r ~/.devnotes/themes devnotes-backup/
cp -r ~/.devnotes/plugins devnotes-backup/
cp ~/.devnotes/settings.json devnotes-backup/
```

## Best Practices

### Customization Guidelines
1. **Start small**: Make incremental changes
2. **Test thoroughly**: Verify changes work as expected
3. **Document changes**: Keep notes on your customizations
4. **Backup regularly**: Save working configurations
5. **Share wisely**: Share useful customizations with others

### Performance Considerations
1. **Minimize CSS complexity**: Use efficient selectors
2. **Optimize images**: Compress custom icons and backgrounds
3. **Limit animations**: Use sparingly for better performance
4. **Test on different devices**: Ensure compatibility

### Maintenance
1. **Regular updates**: Keep customizations up to date
2. **Clean unused**: Remove old customizations
3. **Monitor performance**: Watch for slowdowns
4. **Version control**: Track changes to customizations

## Next Steps

- **[Learn data management](advanced/data-management)** - Advanced data handling techniques
- **[Explore power user tips](advanced/power-user-tips)** - Advanced productivity techniques
- **[Check troubleshooting](troubleshooting/common-issues)** - Solve customization issues

Customization makes DevNotes truly yours. Start with simple changes and gradually build a personalized environment that enhances your productivity and enjoyment.