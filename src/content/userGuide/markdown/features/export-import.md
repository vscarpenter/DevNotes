# Export & Import

DevNotes provides comprehensive export and import functionality to help you backup, share, and migrate your notes between different systems and formats.

## Export Options

### Export Formats

#### Markdown (.md)
- **Single note**: Export individual notes as .md files
- **Folder export**: Export entire folders with structure preserved
- **Full export**: Export your complete note collection
- **Maintains formatting**: All markdown syntax preserved

#### HTML (.html)
- **Rendered output**: Markdown converted to HTML
- **Styled export**: Includes CSS for proper formatting
- **Self-contained**: Images and assets embedded
- **Print-friendly**: Optimized for printing or sharing

#### PDF (.pdf)
- **Professional format**: Perfect for sharing and archiving
- **Preserves formatting**: Maintains fonts, colors, and layout
- **Table of contents**: Automatic TOC for long documents
- **Page breaks**: Smart pagination for readability

#### JSON (.json)
- **Complete data**: Includes all metadata and structure
- **Machine readable**: Perfect for programmatic processing
- **Backup format**: Full fidelity backup of your data
- **Import compatible**: Can be re-imported to DevNotes

### Export Scope

#### Single Note Export
1. **Open the note** you want to export
2. **Click the export button** in the toolbar
3. **Choose format** (Markdown, HTML, PDF)
4. **Select location** and save

**Keyboard shortcut**: `Ctrl+E` (Windows/Linux) or `Cmd+E` (Mac)

#### Folder Export
1. **Right-click on a folder** in the sidebar
2. **Select "Export Folder"** from context menu
3. **Choose format and options**
4. **Select destination** and export

#### Bulk Export
1. **Go to Settings** → **Export/Import**
2. **Select "Export All Notes"**
3. **Choose format and structure options**
4. **Start export process**

### Export Settings

#### Structure Options
- **Preserve folder hierarchy**: Maintain folder structure in export
- **Flatten structure**: Export all notes to single directory
- **Custom naming**: Use templates for file naming
- **Include metadata**: Export creation dates, tags, etc.

#### Content Options
- **Include images**: Embed or link to images
- **Code highlighting**: Preserve syntax highlighting in HTML/PDF
- **Math rendering**: Render LaTeX expressions
- **Diagram rendering**: Convert Mermaid diagrams to images

#### Advanced Options
- **Compression**: Create ZIP archives for large exports
- **Encryption**: Password-protect sensitive exports
- **Selective export**: Choose specific notes or date ranges
- **Format conversion**: Convert between different markdown flavors

## Import Options

### Supported Import Formats

#### Markdown Files
- **Individual files**: Import single .md files
- **Folder structures**: Import entire folder hierarchies
- **Batch import**: Import multiple files at once
- **Automatic detection**: Recognizes markdown variants

#### Popular Note Apps
DevNotes can import from:

- **Notion**: Export from Notion and import to DevNotes
- **Obsidian**: Direct import of Obsidian vaults
- **Roam Research**: Import Roam databases
- **Evernote**: Convert ENEX files to markdown
- **OneNote**: Import OneNote sections
- **Bear**: Import Bear note archives
- **Joplin**: Import Joplin exports

#### Text Formats
- **Plain text (.txt)**: Convert text files to notes
- **Rich text (.rtf)**: Import formatted text
- **Word documents (.docx)**: Convert Word docs to markdown
- **HTML files (.html)**: Convert web pages to notes

#### Structured Data
- **JSON**: Import DevNotes JSON exports
- **CSV**: Import tabular data as structured notes
- **XML**: Import structured XML data
- **OPML**: Import outline files

### Import Process

#### Basic Import
1. **Go to Settings** → **Export/Import**
2. **Click "Import Notes"**
3. **Select files or folders** to import
4. **Choose import options**
5. **Review and confirm** import

#### Drag and Drop Import
1. **Drag files** from your file manager
2. **Drop onto DevNotes** window
3. **Choose destination folder**
4. **Confirm import settings**

#### Batch Import
1. **Select multiple files** or folders
2. **Use import wizard** for guided process
3. **Map file types** to note categories
4. **Set naming conventions**
5. **Execute batch import**

### Import Settings

#### File Handling
- **Duplicate detection**: Skip or rename duplicate files
- **File naming**: Use original names or generate new ones
- **Folder mapping**: Map source folders to DevNotes structure
- **Metadata preservation**: Keep original creation dates

#### Content Processing
- **Markdown conversion**: Convert other formats to markdown
- **Image handling**: Import and link images
- **Link processing**: Update internal links
- **Cleanup options**: Remove unwanted formatting

#### Conflict Resolution
- **Overwrite existing**: Replace notes with same names
- **Create new versions**: Keep both old and new versions
- **Skip duplicates**: Don't import duplicate content
- **Manual review**: Review conflicts before importing

## Migration Scenarios

### From Other Note Apps

#### Notion Migration
1. **Export from Notion**: Use Notion's export feature
2. **Download ZIP file**: Contains markdown and assets
3. **Import to DevNotes**: Use folder import feature
4. **Review structure**: Adjust folder organization as needed

#### Obsidian Migration
1. **Locate Obsidian vault**: Find your vault folder
2. **Import vault folder**: Use DevNotes folder import
3. **Handle wiki links**: Convert [[links]] to markdown links
4. **Import attachments**: Ensure images and files are included

#### Evernote Migration
1. **Export from Evernote**: Create ENEX export files
2. **Convert ENEX**: Use DevNotes ENEX converter
3. **Import converted files**: Import resulting markdown files
4. **Organize content**: Create folder structure in DevNotes

### From File Systems

#### Existing Markdown Collections
1. **Identify source folder**: Locate your markdown files
2. **Preserve structure**: Use folder import to maintain hierarchy
3. **Update links**: Fix any broken internal links
4. **Add metadata**: Enhance notes with tags and categories

#### Documentation Sites
1. **Export site content**: Use site generators' export features
2. **Convert to markdown**: Use pandoc or similar tools
3. **Import to DevNotes**: Use batch import for large collections
4. **Restructure**: Organize for personal use

## Backup and Sync

### Regular Backups

#### Automated Backups
- **Schedule exports**: Set up regular export schedules
- **Cloud storage**: Export directly to cloud services
- **Version control**: Maintain backup versions
- **Incremental backups**: Only backup changed content

#### Manual Backups
- **Full exports**: Complete backup of all notes
- **Selective backups**: Backup specific projects or folders
- **Format choices**: Choose backup format based on needs
- **Verification**: Verify backup integrity

### Sync Strategies

#### Multi-Device Sync
1. **Export from device A**: Create full JSON export
2. **Transfer to device B**: Use cloud storage or direct transfer
3. **Import to device B**: Import JSON to sync content
4. **Merge conflicts**: Handle any conflicting changes

#### Team Collaboration
1. **Export shared folders**: Create team-specific exports
2. **Share via cloud**: Use shared cloud folders
3. **Import updates**: Team members import shared content
4. **Version control**: Track changes and versions

## Advanced Features

### Custom Export Templates
Create custom export formats:

```javascript
// Custom HTML template
const template = {
  header: '<h1>{{title}}</h1>',
  content: '{{content}}',
  footer: '<p>Exported from DevNotes</p>'
};
```

### Scripted Imports
Automate imports with scripts:

```bash
# Batch convert and import
for file in *.txt; do
  devnotes-import --format=text --folder=imported "$file"
done
```

### API Integration
Use DevNotes API for programmatic export/import:

```javascript
// Export via API
const exportData = await devnotes.export({
  format: 'json',
  scope: 'all',
  includeMetadata: true
});
```

## Troubleshooting

### Export Issues

#### Large Export Failures
- **Break into smaller chunks**: Export folders separately
- **Check available space**: Ensure sufficient disk space
- **Simplify format**: Use simpler export formats
- **Reduce content**: Exclude large images or attachments

#### Format Problems
- **Check compatibility**: Ensure target app supports format
- **Validate output**: Test exported files before sharing
- **Use standard formats**: Stick to widely supported formats
- **Include documentation**: Explain any custom formatting

### Import Issues

#### File Recognition Problems
- **Check file extensions**: Ensure correct file extensions
- **Verify encoding**: Use UTF-8 encoding for text files
- **Test small samples**: Import small batches first
- **Check file permissions**: Ensure files are readable

#### Content Corruption
- **Backup originals**: Keep original files safe
- **Test imports**: Verify imported content is correct
- **Use safe formats**: Prefer lossless formats like JSON
- **Manual review**: Check critical content manually

## Best Practices

### Export Best Practices
1. **Regular backups**: Export regularly for data safety
2. **Multiple formats**: Use different formats for different purposes
3. **Test exports**: Verify exported content is usable
4. **Document process**: Keep notes on your export procedures

### Import Best Practices
1. **Clean source data**: Organize source files before importing
2. **Test small batches**: Import small amounts first
3. **Review results**: Check imported content carefully
4. **Maintain originals**: Keep original files as backup

### Migration Best Practices
1. **Plan structure**: Design your DevNotes organization first
2. **Gradual migration**: Move content in phases
3. **Verify completeness**: Ensure all content migrated successfully
4. **Update workflows**: Adapt your processes to DevNotes

## Next Steps

- **[Learn keyboard shortcuts](features/keyboard-shortcuts)** - Speed up export/import operations
- **[Explore advanced features](advanced/data-management)** - Advanced data management techniques
- **[Set up automation](advanced/power-user-tips)** - Automate backup and sync processes

Export and import capabilities make DevNotes a flexible part of your knowledge management ecosystem. Use these features to integrate DevNotes with your existing tools and workflows!