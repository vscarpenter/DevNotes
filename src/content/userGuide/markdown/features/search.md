# Search Functionality

DevNotes includes a powerful search engine that helps you find any note, folder, or content instantly across your entire knowledge base.

## Basic Search

### Quick Search
1. **Click the search icon** in the toolbar or sidebar
2. **Use the keyboard shortcut**: `Ctrl+/` (Windows/Linux) or `Cmd+/` (Mac)
3. **Type your search query** and see results in real-time

### Search Interface
- **Search bar**: Enter your query here
- **Results list**: Shows matching notes with previews
- **Filters panel**: Refine your search with advanced options
- **Recent searches**: Quick access to previous queries

## Search Types

### Content Search
Search within the text content of your notes:

```
javascript functions
```
Finds notes containing both "javascript" and "functions"

### Title Search
Search specifically in note titles:

```
title:meeting notes
```
Finds notes with "meeting notes" in the title

### Folder Search
Search within specific folders:

```
folder:projects react hooks
```
Searches for "react hooks" only in the "projects" folder

## Advanced Search Operators

### Boolean Operators

#### AND (default)
```
react hooks
```
Finds notes containing both "react" AND "hooks"

#### OR
```
react OR vue
```
Finds notes containing either "react" OR "vue"

#### NOT
```
javascript NOT typescript
```
Finds notes with "javascript" but NOT "typescript"

### Exact Phrases
Use quotes for exact phrase matching:

```
"useEffect hook"
```
Finds the exact phrase "useEffect hook"

### Wildcards
Use asterisk (*) for partial matching:

```
react*
```
Finds "react", "reactive", "reactjs", etc.

### Field-Specific Search

#### Title Only
```
title:"project alpha"
```

#### Content Only
```
content:database schema
```

#### Tags (if using metadata)
```
tag:javascript
```

#### Date Ranges
```
created:2024-01-01..2024-01-31
modified:last-week
```

## Search Filters

### By File Type
- **All notes**: Default search across all content
- **Markdown files**: Search only .md files
- **Code files**: Search files with code extensions

### By Date
- **Created date**: When the note was first created
- **Modified date**: When the note was last edited
- **Date ranges**: Custom date ranges

### By Folder
- **Current folder**: Search only in the selected folder
- **Include subfolders**: Search in nested folders too
- **Specific folders**: Choose multiple folders to search

### By Size
- **Small notes**: Under 1KB
- **Medium notes**: 1KB - 10KB  
- **Large notes**: Over 10KB

## Search Results

### Result Display
Each search result shows:
- **Note title** with matching terms highlighted
- **Folder path** showing note location
- **Content preview** with search terms highlighted
- **Last modified date**
- **Relevance score** (higher scores appear first)

### Result Actions
- **Click to open**: Open the note in the editor
- **Preview**: Hover to see more content
- **Go to folder**: Navigate to the note's location
- **Copy link**: Copy internal link to the note

### Sorting Options
- **Relevance**: Best matches first (default)
- **Date modified**: Most recently edited first
- **Date created**: Newest notes first
- **Title**: Alphabetical order
- **Size**: Largest or smallest first

## Search Performance

### Indexing
DevNotes automatically indexes your notes for fast search:
- **Real-time indexing**: New content is indexed as you type
- **Background processing**: Large updates processed in background
- **Smart indexing**: Only changed content is re-indexed

### Search Speed
- **Instant results**: Search results appear as you type
- **Sub-100ms response**: Optimized for speed
- **Fuzzy matching**: Finds results even with typos
- **Cached results**: Repeated searches are faster

## Search History

### Recent Searches
- **Last 10 searches** are saved automatically
- **Click to repeat** previous searches
- **Clear history** option available

### Search Suggestions
- **Auto-complete**: Suggests completions as you type
- **Popular terms**: Shows frequently searched terms
- **Related searches**: Suggests similar queries

## Advanced Features

### Fuzzy Search
DevNotes can find matches even with typos:

```
javascrpit
```
Still finds "javascript" content

### Stemming
Searches for word variations:

```
running
```
Also finds "run", "runs", "ran"

### Stop Words
Common words are handled intelligently:

```
the quick brown fox
```
Focuses on "quick", "brown", "fox" (ignores "the")

### Regular Expressions
For power users, regex search is supported:

```
regex:/function\s+\w+\(/
```
Finds function declarations

## Search Tips

### Effective Search Strategies

#### Start Broad, Then Narrow
1. Begin with general terms
2. Add more specific terms
3. Use filters to refine results

#### Use Multiple Keywords
```
react hooks useEffect cleanup
```
More keywords = more precise results

#### Search for Concepts
```
authentication security jwt
```
Find related concepts across notes

#### Use Synonyms
```
bug OR issue OR problem
```
Cover different ways to describe the same thing

### Common Search Patterns

#### Finding Code Examples
```
code:function OR method OR class
```

#### Finding Meeting Notes
```
title:meeting OR agenda OR minutes
```

#### Finding Recent Work
```
modified:this-week
```

#### Finding Large Documents
```
size:large content:documentation
```

## Keyboard Shortcuts

| Action | Windows/Linux | Mac |
|--------|---------------|-----|
| Open Search | `Ctrl+/` | `Cmd+/` |
| Focus Search | `Ctrl+K` | `Cmd+K` |
| Next Result | `↓` or `Tab` | `↓` or `Tab` |
| Previous Result | `↑` or `Shift+Tab` | `↑` or `Shift+Tab` |
| Open Result | `Enter` | `Enter` |
| Clear Search | `Escape` | `Escape` |

## Search Settings

### Customization Options
- **Search as you type**: Enable/disable real-time search
- **Include file names**: Search in file names too
- **Case sensitivity**: Make searches case-sensitive
- **Whole words only**: Match complete words only
- **Maximum results**: Limit number of results shown

### Performance Settings
- **Index size limit**: Control index memory usage
- **Background indexing**: Enable/disable background processing
- **Search timeout**: Set maximum search time
- **Cache size**: Control result caching

## Troubleshooting

### Search Not Working
1. **Check spelling** - Try different spellings
2. **Simplify query** - Use fewer, more general terms
3. **Clear filters** - Remove restrictive filters
4. **Rebuild index** - Force re-indexing in settings

### Slow Search Results
1. **Reduce result limit** - Show fewer results
2. **Use more specific terms** - Narrow your search
3. **Clear search cache** - Reset cached results
4. **Check system resources** - Close other applications

### Missing Results
1. **Check folder filters** - Ensure correct folders are selected
2. **Verify file types** - Include all relevant file types
3. **Check date filters** - Expand date ranges
4. **Try different keywords** - Use synonyms or related terms

## Next Steps

- **[Master keyboard shortcuts](features/keyboard-shortcuts)** - Search faster with hotkeys
- **[Learn export/import](features/export-import)** - Backup your searchable content
- **[Explore power user tips](advanced/power-user-tips)** - Advanced search techniques

Effective search is crucial for managing large knowledge bases. Master these techniques to find any information instantly!