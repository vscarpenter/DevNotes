// Embedded user guide content - converted from markdown files for reliable loading
// This replaces dynamic imports which fail in production builds

export const embeddedGuideContent = {
  'getting-started': {
    welcome: `# Welcome to DevNotes

Welcome to **DevNotes** - a powerful, developer-focused note-taking application designed specifically for software developers and technical professionals.

## What is DevNotes?

DevNotes is a web-based note-taking application that combines the simplicity of markdown with the power of modern web technologies. Built with developers in mind, it offers:

- **Markdown-first editing** with live preview and syntax highlighting
- **Hierarchical organization** with unlimited folder nesting
- **Powerful search** with advanced operators and filters
- **Code syntax highlighting** for 100+ programming languages
- **Privacy-focused** - all data stored locally in your browser using IndexedDB
- **Offline-capable** - works without an internet connection
- **Lightning fast** - sub-200ms load times and instant auto-save
- **Keyboard-driven** - extensive keyboard shortcuts for power users

## Quick Start (2 Minutes)

Get up and running with DevNotes in just 2 minutes:

### Step 1: Create Your First Note (30 seconds)
1. Click the **"+ New Note"** button in the sidebar
2. Type a title like "My First DevNote"
3. Press Enter to confirm

### Step 2: Write Some Content (60 seconds)
Try typing this sample content:

\`\`\`markdown
# My Development Setup

## Tools I Use Daily
- **Editor**: VS Code with Vim extension
- **Terminal**: iTerm2 with Oh My Zsh
- **Browser**: Chrome with React DevTools

## Code Snippet
\`\`\`javascript
const greet = (name) => {
  console.log("Hello, " + name + "!");
};
\`\`\`

Watch how the preview pane shows your formatted content in real-time!

### Step 3: Organize with Folders (30 seconds)
1. Right-click in the sidebar
2. Select "New Folder"
3. Name it "Development Notes"
4. Drag your note into the folder

**Congratulations!** You're now ready to build your knowledge base with DevNotes.

## Key Features at a Glance

### 📝 Markdown Editor
Write in markdown with real-time syntax highlighting and live preview. Perfect for technical documentation, code snippets, and structured notes.

**What makes it special:**
- Split-view editing with live preview
- Syntax highlighting for 100+ languages
- Math expressions with KaTeX
- Mermaid diagrams for flowcharts
- Auto-completion and smart formatting

### 🗂️ Folder Organization
Organize your notes in a hierarchical folder structure. Create projects, categories, and subcategories to keep everything organized.

**Organization features:**
- Unlimited folder nesting
- Drag-and-drop organization
- Bulk operations (move, delete, rename)
- Folder templates for consistent structure
- Visual folder tree with expand/collapse

### 🔍 Advanced Search
Find any note instantly with our powerful search engine. Search by content, tags, or file names with advanced filtering options.

**Search capabilities:**
- Real-time search as you type
- Boolean operators (AND, OR, NOT)
- Field-specific search (title:, content:, folder:)
- Date range filtering
- Fuzzy matching for typos

### 💾 Local Storage
Your data stays on your device. DevNotes uses IndexedDB for fast, reliable local storage with no server dependencies.

**Privacy benefits:**
- No data sent to servers
- Works completely offline
- Your notes never leave your device
- No account required
- GDPR compliant by design

### ⚡ Performance First
Built for speed with sub-200ms load times and instant auto-save. Your workflow stays uninterrupted.

**Performance features:**
- Virtual scrolling for large note collections
- Lazy loading of content
- Optimized search indexing
- Memory-efficient data structures
- Background auto-save every 500ms

## Common Use Cases

### For Software Developers
**Daily Development Notes:**
- Code snippets and solutions
- Bug investigation notes
- Architecture decisions
- Learning notes from tutorials

**Example folder structure:**
\`\`\`
📁 Development
  📁 Projects
    📁 E-commerce App
    📁 API Gateway
  📁 Learning
    📁 React
    📁 Node.js
  📁 Troubleshooting
    📁 Production Issues
    📁 Local Setup
\`\`\`

### For Technical Writers
**Documentation Workflow:**
- Draft technical articles
- API documentation
- User guides and tutorials
- Research and reference materials

### For DevOps Engineers
**Infrastructure Notes:**
- Server configurations
- Deployment procedures
- Monitoring and alerting
- Incident response playbooks

### For Team Leads
**Management Documentation:**
- Meeting notes and action items
- Team processes and guidelines
- Performance reviews
- Project planning and tracking

## Getting Started

Ready to dive in? Follow this recommended learning path:

### Phase 1: Basics (15 minutes)
1. **Create your first note** - Learn the basics of creating and editing notes
2. **Organize your notes** - Set up folders and structure your workspace

### Phase 2: Core Features (30 minutes)
3. **Master the markdown editor** - Discover the powerful editing capabilities
4. **Learn search techniques** - Find your content quickly with advanced search

### Phase 3: Productivity (20 minutes)
5. **Keyboard shortcuts** - Speed up your workflow
6. **Export and import** - Backup and share your work

### Phase 4: Advanced Usage (30 minutes)
7. **Power user tips** - Advanced workflows and techniques
8. **Customization options** - Make DevNotes work your way

## Quick Reference Card

### Essential Shortcuts
| Action | Windows/Linux | Mac |
|--------|---------------|-----|
| New Note | Ctrl+N | Cmd+N |
| Search | Ctrl+/ | Cmd+/ |
| Save | Ctrl+S | Cmd+S |
| Bold | Ctrl+B | Cmd+B |
| Italic | Ctrl+I | Cmd+I |

### Markdown Quick Reference
\`\`\`markdown
# Header 1
## Header 2
**Bold** *Italic*
\`Code\`
- List item
1. Numbered item
[Link](url)
\`\`\`

## Need Help?

- **🔍 Search this guide**: Use your browser's find function (Ctrl+F)
- **📖 Features section**: Learn about specific functionality
- **⚡ Advanced section**: Power-user techniques and workflows
- **🔧 Troubleshooting**: Solutions to common problems
- **💬 Community**: Join our user community for tips and support

Let's get started building your knowledge base with DevNotes!`,

    'first-note': `# Creating Your First Note

Learn how to create and manage notes in DevNotes with this step-by-step guide.

## Creating a New Note

### Method 1: Sidebar Button (Recommended)
1. Look for the **"+ New Note"** button at the top of the sidebar
2. Click it to create a new note
3. Enter a title for your note
4. Press Enter to confirm

### Method 2: Keyboard Shortcut (Fastest)
- **Windows/Linux**: Press Ctrl+N
- **Mac**: Press Cmd+N

### Method 3: Right-Click Menu
1. Right-click in the sidebar
2. Select "New Note" from the context menu
3. Enter your note title

## Writing Your First Content

Once your note is created, you'll see the markdown editor. Try this sample content:

\`\`\`markdown
# My First DevNote

Welcome to my knowledge base! Here's what I'm learning:

## Today's Goals
- [ ] Learn DevNotes basics
- [ ] Create my first folder
- [ ] Write some documentation

## Code Snippet
\`\`\`javascript
function hello(name) {
  return "Hello, " + name + "! Welcome to DevNotes.";
}
\`\`\`

## Links
- [DevNotes Documentation](https://example.com)
- [Markdown Guide](https://www.markdownguide.org/)
\`\`\`

## Understanding the Interface

### Split View
DevNotes shows your content in two panes:
- **Left**: Markdown editor with syntax highlighting
- **Right**: Live preview of your formatted content

### Auto-Save
Your changes are automatically saved every 500ms - no need to manually save!

### Note List
All your notes appear in the sidebar, sorted by last modified date.

## Next Steps

Now that you've created your first note:
1. Try organizing it in a folder
2. Experiment with different markdown features
3. Use the search function to find your content quickly

Great job! You're now ready to build your knowledge base.`,

    'organizing-notes': `# Organizing Your Notes

Learn how to structure and organize your notes using DevNotes' powerful folder system.

## Creating Folders

### Method 1: Right-Click Menu
1. Right-click in an empty area of the sidebar
2. Select "New Folder" from the menu
3. Enter a folder name
4. Press Enter to create

### Method 2: Folder Context Menu
1. Right-click on an existing folder
2. Select "New Subfolder"
3. Name your new folder

## Moving Notes into Folders

### Drag and Drop (Easiest)
1. Click and hold on a note in the sidebar
2. Drag it over the target folder
3. Release to move the note

### Cut and Paste
1. Right-click on a note
2. Select "Cut" or press Ctrl+X
3. Right-click on the target folder
4. Select "Paste" or press Ctrl+V

## Recommended Folder Structure

Here's a proven organizational structure for developers:

\`\`\`
📁 Projects
  📁 Current Work
    📁 Project Alpha
    📁 Project Beta
  📁 Side Projects
    📁 Personal Website
    📁 Open Source Contributions

📁 Learning
  📁 Technologies
    📁 React
    📁 Node.js
    📁 Docker
  📁 Courses
    📁 Algorithm Course
    📁 System Design

📁 Reference
  📁 Code Snippets
    📁 JavaScript
    📁 Python
    📁 CSS
  📁 Documentation
    📁 APIs
    📁 Tools

📁 Work
  📁 Meetings
  📁 Performance Reviews
  📁 Team Documentation

📁 Archive
  📁 Completed Projects
  📁 Old Notes
\`\`\`

## Folder Operations

### Renaming Folders
1. Right-click on a folder
2. Select "Rename"
3. Enter the new name
4. Press Enter

### Deleting Folders
1. Right-click on a folder
2. Select "Delete"
3. Confirm the deletion
4. **Note**: All notes in the folder will also be deleted

### Moving Folders
You can drag and drop folders just like notes to reorganize your structure.

## Advanced Organization Tips

### Use Consistent Naming
- **Projects**: Use descriptive project names
- **Learning**: Organize by technology or topic
- **Reference**: Keep frequently accessed items at the top level

### Folder Depth
- Keep important folders 1-2 levels deep for quick access
- Use deeper nesting for archive or reference materials

### Regular Cleanup
- Review your structure monthly
- Archive completed projects
- Consolidate similar content

## Quick Access

### Recent Notes
Your most recently modified notes appear at the top of each folder.

### Search Within Folders
Use the search function with folder filters:
- Type "folder:Project Alpha" to search within a specific folder
- Combine with other search terms for precise results

## Next Steps

Now that your notes are organized:
1. Learn about powerful search features
2. Explore markdown editing capabilities
3. Set up keyboard shortcuts for faster workflow

Your organized knowledge base is ready to grow!`
  },

  features: {
    'markdown-editor': `# Mastering the Markdown Editor

DevNotes features a powerful markdown editor designed specifically for developers and technical professionals.

## Editor Interface

### Split View
The editor uses a split-pane interface:
- **Left Pane**: Markdown source with syntax highlighting
- **Right Pane**: Live preview of formatted content
- **Resize**: Drag the divider to adjust pane sizes

### Toolbar
Quick access buttons for:
- **Bold** (Ctrl+B) - Make text **bold**
- **Italic** (Ctrl+I) - Make text *italic*
- **Code** (Ctrl+\`) - Add inline code
- **Link** (Ctrl+K) - Insert links
- **Image** - Insert images
- **Table** - Create tables

## Markdown Syntax Support

### Headers
\`\`\`markdown
# Header 1
## Header 2
### Header 3
#### Header 4
##### Header 5
###### Header 6
\`\`\`

### Text Formatting
\`\`\`markdown
**Bold text**
*Italic text*
***Bold and italic***
~~Strikethrough~~
\`Inline code\`
\`\`\`

### Lists
\`\`\`markdown
- Unordered list item
- Another item
  - Nested item
  - Another nested item

1. Ordered list item
2. Another numbered item
   1. Nested numbered item
   2. Another nested item
\`\`\`

### Links and Images
\`\`\`markdown
[Link text](https://example.com)
[Link with title](https://example.com "Link title")

![Image alt text](image-url.jpg)
![Image with title](image-url.jpg "Image title")
\`\`\`

### Code Blocks
\`\`\`markdown
\`\`\`javascript
function example() {
  console.log("Syntax highlighted!");
}
\`\`\`

\`\`\`python
def hello_world():
    print("Hello, World!")
\`\`\`

\`\`\`bash
npm install
git commit -m "Update documentation"
\`\`\`
\`\`\`

### Tables
\`\`\`markdown
| Column 1 | Column 2 | Column 3 |
|----------|----------|----------|
| Cell 1   | Cell 2   | Cell 3   |
| Cell 4   | Cell 5   | Cell 6   |

| Left | Center | Right |
|:-----|:------:|------:|
| Text | Text   | Text  |
\`\`\`

### Blockquotes
\`\`\`markdown
> This is a blockquote
> with multiple lines
>
> > Nested blockquote
\`\`\`

### Task Lists
\`\`\`markdown
- [x] Completed task
- [ ] Incomplete task
- [ ] Another task
  - [x] Nested completed task
  - [ ] Nested incomplete task
\`\`\`

## Advanced Features

### Math Expressions (KaTeX)
\`\`\`markdown
Inline math: $E = mc^2$

Block math:
\`\`\`math
\\frac{-b \\pm \\sqrt{b^2-4ac}}{2a}
\`\`\`
\`\`\`

### Mermaid Diagrams
\`\`\`markdown
\`\`\`mermaid
graph TD
    A[Start] --> B{Decision}
    B -->|Yes| C[Action 1]
    B -->|No| D[Action 2]
    C --> E[End]
    D --> E
\`\`\`

\`\`\`mermaid
sequenceDiagram
    Alice->>Bob: Hello Bob, how are you?
    Bob-->>John: How about you John?
    Bob--x Alice: I am good thanks!
\`\`\`
\`\`\`

### Syntax Highlighting

DevNotes supports syntax highlighting for 100+ languages:

**Popular Languages:**
- JavaScript, TypeScript
- Python, Java, C++, Rust
- HTML, CSS, SCSS
- JSON, YAML, XML
- SQL, GraphQL
- Shell/Bash scripts
- Docker, Kubernetes
- And many more...

## Editor Shortcuts

### Text Editing
| Action | Windows/Linux | Mac |
|--------|---------------|-----|
| Bold | Ctrl+B | Cmd+B |
| Italic | Ctrl+I | Cmd+I |
| Code | Ctrl+\` | Cmd+\` |
| Link | Ctrl+K | Cmd+K |

### Navigation
| Action | Windows/Linux | Mac |
|--------|---------------|-----|
| Find | Ctrl+F | Cmd+F |
| Replace | Ctrl+H | Cmd+H |
| Go to line | Ctrl+G | Cmd+G |

### Editor Actions
| Action | Windows/Linux | Mac |
|--------|---------------|-----|
| Select all | Ctrl+A | Cmd+A |
| Undo | Ctrl+Z | Cmd+Z |
| Redo | Ctrl+Y | Cmd+Y |

## Productivity Tips

### Auto-Completion
The editor provides intelligent auto-completion for:
- Markdown syntax
- Code block languages
- Common patterns

### Smart Formatting
- Auto-close brackets and quotes
- Smart indentation for code blocks
- Automatic list continuation

### Live Preview
See your changes instantly in the preview pane:
- Math equations render in real-time
- Code syntax highlighting updates as you type
- Diagrams compile automatically

### Focus Mode
- Hide the sidebar for distraction-free writing
- Use full-screen mode for maximum focus
- Toggle preview pane as needed

## Best Practices

### Document Structure
1. Use clear, descriptive headers
2. Keep paragraphs concise
3. Use lists for better readability
4. Add code examples for technical topics

### Code Documentation
1. Always specify language for syntax highlighting
2. Add comments to explain complex code
3. Use consistent indentation
4. Include example usage

### Visual Elements
1. Use tables for structured data
2. Add diagrams for complex workflows
3. Include images for visual explanations
4. Use blockquotes for important notes

## Troubleshooting

### Common Issues

**Preview not updating?**
- Check for unclosed code blocks
- Verify math syntax is correct
- Refresh the preview pane

**Syntax highlighting not working?**
- Ensure language name is spelled correctly
- Check for proper code block formatting
- Some languages may not be supported

**Performance issues with large documents?**
- Break large documents into smaller files
- Use section headers for better navigation
- Consider archiving old content

Ready to create amazing documentation? Start writing and experiment with these features!`,

    search: `# Advanced Search Features

DevNotes includes a powerful search engine designed to help you find any information quickly, no matter how large your knowledge base grows.

## Basic Search

### Quick Search
1. Click the search icon in the sidebar or press Ctrl+/ (Cmd+/ on Mac)
2. Type your search terms
3. Results appear instantly as you type
4. Click any result to open that note

### Search Scope
By default, search looks through:
- Note titles
- Note content
- Folder names
- Tag names

## Advanced Search Operators

### Boolean Operators

**AND (default)**
\`\`\`
javascript function
\`\`\`
Finds notes containing both "javascript" AND "function"

**OR**
\`\`\`
javascript OR python
\`\`\`
Finds notes containing either "javascript" OR "python"

**NOT**
\`\`\`
javascript NOT react
\`\`\`
Finds notes with "javascript" but NOT "react"

**Parentheses for grouping**
\`\`\`
(javascript OR python) AND tutorial
\`\`\`
Finds notes with "tutorial" and either "javascript" or "python"

### Field-Specific Search

**Title search**
\`\`\`
title:setup
\`\`\`
Searches only in note titles

**Content search**
\`\`\`
content:"error handling"
\`\`\`
Searches only in note content

**Folder search**
\`\`\`
folder:projects
\`\`\`
Searches within specific folders

**Tag search**
\`\`\`
tag:urgent
\`\`\`
Searches for specific tags

### Phrase Search

**Exact phrases**
\`\`\`
"error handling in javascript"
\`\`\`
Finds the exact phrase

**Partial phrases**
\`\`\`
"async await"
\`\`\`
Finds notes containing this exact phrase

### Wildcard Search

**Prefix matching**
\`\`\`
java*
\`\`\`
Finds "javascript", "java", "javadoc", etc.

**Suffix matching**
\`\`\`
*script
\`\`\`
Finds "javascript", "typescript", "coffeescript", etc.

## Advanced Filters

### Date Filters

**Recent notes**
\`\`\`
modified:today
modified:yesterday
modified:thisweek
modified:thismonth
\`\`\`

**Date ranges**
\`\`\`
modified:2024-01-01..2024-12-31
created:2024-01-01..now
\`\`\`

**Relative dates**
\`\`\`
modified:>7days
created:<30days
\`\`\`

### Size Filters

**Content length**
\`\`\`
size:>1000
size:<500
size:100..2000
\`\`\`

### Multiple Filters

**Complex queries**
\`\`\`
folder:projects AND tag:urgent AND modified:thisweek
\`\`\`

\`\`\`
(title:react OR content:react) AND NOT folder:archive
\`\`\`

## Search Results

### Result Display
- **Snippet preview**: Shows context around matches
- **Highlight matches**: Search terms highlighted in yellow
- **Relevance ranking**: Most relevant results appear first
- **Folder context**: Shows which folder contains each result

### Navigation
- **Click to open**: Click any result to open the note
- **Keyboard navigation**: Use arrow keys to navigate results
- **Quick preview**: Hover for expanded snippet

## Search Tips and Tricks

### Fuzzy Search
DevNotes automatically handles:
- **Typos**: "javasript" finds "javascript"
- **Partial words**: "func" finds "function"
- **Alternative spellings**: "grey" finds "gray"

### Search Strategy

**Start broad, then narrow**
1. Begin with general terms
2. Add specific filters
3. Use boolean operators to refine

**Use multiple search approaches**
1. Search by topic: "machine learning"
2. Search by project: "folder:project-alpha"
3. Search by date: "modified:thisweek"
4. Search by content type: "title:tutorial"

### Performance Optimization

**For large knowledge bases:**
- Use specific folder filters to narrow scope
- Search for exact phrases when possible
- Use date filters to limit results

**Memory usage:**
- DevNotes indexes content efficiently
- Search results are paginated automatically
- Background indexing doesn't slow down editing

## Search Examples

### Developer Use Cases

**Finding code snippets**
\`\`\`
"async function" AND folder:snippets
\`\`\`

**Debugging notes**
\`\`\`
(error OR bug OR issue) AND modified:thismonth
\`\`\`

**API documentation**
\`\`\`
title:api AND (documentation OR docs)
\`\`\`

**Meeting notes**
\`\`\`
folder:meetings AND modified:thisweek
\`\`\`

### Content Research

**Learning materials**
\`\`\`
(tutorial OR guide OR howto) AND tag:learning
\`\`\`

**Reference materials**
\`\`\`
folder:reference AND NOT tag:outdated
\`\`\`

**Project documentation**
\`\`\`
folder:projects AND (readme OR documentation)
\`\`\`

## Keyboard Shortcuts

| Action | Windows/Linux | Mac |
|--------|---------------|-----|
| Open search | Ctrl+/ | Cmd+/ |
| Search in page | Ctrl+F | Cmd+F |
| Next result | ↓ or Tab | ↓ or Tab |
| Previous result | ↑ or Shift+Tab | ↑ or Shift+Tab |
| Open result | Enter | Enter |
| Close search | Esc | Esc |

## Search Settings

### Customization Options
- **Result limit**: Set maximum results per search
- **Snippet length**: Adjust preview text length
- **Case sensitivity**: Enable/disable case-sensitive search
- **Stemming**: Enable/disable word stemming

### Index Management
- **Manual reindex**: Force rebuild of search index
- **Index statistics**: View index size and coverage
- **Exclusions**: Exclude specific folders from search

## Troubleshooting Search

### Common Issues

**No results found?**
1. Check spelling and try simpler terms
2. Remove quotes for broader matching
3. Try searching in specific folders
4. Check if content exists in excluded folders

**Slow search performance?**
1. Use more specific search terms
2. Add folder filters to narrow scope
3. Consider rebuilding search index
4. Check available device memory

**Missing recent content?**
1. Search index updates automatically
2. Force reindex if needed
3. Check if auto-save completed

### Search Index

The search index is automatically maintained:
- **Real-time updates**: New content indexed immediately
- **Background optimization**: Index optimized during idle time
- **Memory efficient**: Only active searches load full index

Master these search techniques and you'll never lose track of your knowledge again!`,

    'keyboard-shortcuts': `# Keyboard Shortcuts Reference

DevNotes is designed for keyboard-driven productivity. Master these shortcuts to dramatically speed up your workflow.

## Global Shortcuts

### Core Actions
| Action | Windows/Linux | Mac | Description |
|--------|---------------|-----|-------------|
| New Note | Ctrl+N | Cmd+N | Create a new note |
| Search | Ctrl+/ | Cmd+/ | Open global search |
| Quick Open | Ctrl+P | Cmd+P | Quick note selector |
| Save | Ctrl+S | Cmd+S | Manual save (auto-save is default) |
| Settings | Ctrl+, | Cmd+, | Open settings panel |

### Navigation
| Action | Windows/Linux | Mac | Description |
|--------|---------------|-----|-------------|
| Toggle Sidebar | Ctrl+B | Cmd+B | Show/hide sidebar |
| Focus Editor | Ctrl+E | Cmd+E | Focus on editor pane |
| Focus Preview | Ctrl+R | Cmd+R | Focus on preview pane |
| Previous Note | Ctrl+PageUp | Cmd+PageUp | Navigate to previous note |
| Next Note | Ctrl+PageDown | Cmd+PageDown | Navigate to next note |

## Editor Shortcuts

### Text Formatting
| Action | Windows/Linux | Mac | Description |
|--------|---------------|-----|-------------|
| Bold | Ctrl+B | Cmd+B | Make text **bold** |
| Italic | Ctrl+I | Cmd+I | Make text *italic* |
| Inline Code | Ctrl+\` | Cmd+\` | Add code formatting |
| Insert Link | Ctrl+K | Cmd+K | Insert/edit link |
| Strikethrough | Ctrl+Shift+X | Cmd+Shift+X | Strike through text |

### Text Editing
| Action | Windows/Linux | Mac | Description |
|--------|---------------|-----|-------------|
| Select All | Ctrl+A | Cmd+A | Select all content |
| Cut | Ctrl+X | Cmd+X | Cut selected text |
| Copy | Ctrl+C | Cmd+C | Copy selected text |
| Paste | Ctrl+V | Cmd+V | Paste from clipboard |
| Undo | Ctrl+Z | Cmd+Z | Undo last action |
| Redo | Ctrl+Y | Cmd+Y | Redo last undone action |

### Line Operations
| Action | Windows/Linux | Mac | Description |
|--------|---------------|-----|-------------|
| Duplicate Line | Ctrl+D | Cmd+D | Duplicate current line |
| Delete Line | Ctrl+Shift+K | Cmd+Shift+K | Delete entire line |
| Move Line Up | Alt+↑ | Option+↑ | Move line up |
| Move Line Down | Alt+↓ | Option+↓ | Move line down |
| Insert Line Above | Ctrl+Shift+Enter | Cmd+Shift+Enter | New line above cursor |
| Insert Line Below | Ctrl+Enter | Cmd+Enter | New line below cursor |

### Selection and Navigation
| Action | Windows/Linux | Mac | Description |
|--------|---------------|-----|-------------|
| Go to Line | Ctrl+G | Cmd+G | Jump to specific line |
| Find in Note | Ctrl+F | Cmd+F | Find text in current note |
| Find and Replace | Ctrl+H | Cmd+H | Find and replace text |
| Select Word | Ctrl+W | Cmd+W | Select current word |
| Select Line | Ctrl+L | Cmd+L | Select entire line |

## Markdown Shortcuts

### Headers
| Action | Shortcut | Result |
|--------|----------|--------|
| Header 1 | Ctrl+1 | # Header 1 |
| Header 2 | Ctrl+2 | ## Header 2 |
| Header 3 | Ctrl+3 | ### Header 3 |
| Header 4 | Ctrl+4 | #### Header 4 |
| Header 5 | Ctrl+5 | ##### Header 5 |
| Header 6 | Ctrl+6 | ###### Header 6 |

### Lists and Structure
| Action | Windows/Linux | Mac | Description |
|--------|---------------|-----|-------------|
| Bullet List | Ctrl+Shift+8 | Cmd+Shift+8 | Create unordered list |
| Numbered List | Ctrl+Shift+7 | Cmd+Shift+7 | Create ordered list |
| Task List | Ctrl+Shift+9 | Cmd+Shift+9 | Create task list |
| Blockquote | Ctrl+Shift+> | Cmd+Shift+> | Create blockquote |
| Code Block | Ctrl+Shift+\` | Cmd+Shift+\` | Create code block |
| Horizontal Rule | Ctrl+Shift+- | Cmd+Shift+- | Insert horizontal rule |

### Quick Insertion
| Action | Windows/Linux | Mac | Description |
|--------|---------------|-----|-------------|
| Insert Table | Ctrl+Shift+T | Cmd+Shift+T | Insert markdown table |
| Insert Image | Ctrl+Shift+I | Cmd+Shift+I | Insert image link |
| Insert Date | Ctrl+; | Cmd+; | Insert current date |
| Insert Time | Ctrl+Shift+; | Cmd+Shift+; | Insert current time |

## File Management

### Note Operations
| Action | Windows/Linux | Mac | Description |
|--------|---------------|-----|-------------|
| Rename Note | F2 | F2 | Rename current note |
| Delete Note | Delete | Delete | Delete current note |
| Duplicate Note | Ctrl+Shift+D | Cmd+Shift+D | Duplicate current note |
| Export Note | Ctrl+Shift+E | Cmd+Shift+E | Export current note |

### Folder Operations
| Action | Windows/Linux | Mac | Description |
|--------|---------------|-----|-------------|
| New Folder | Ctrl+Shift+N | Cmd+Shift+N | Create new folder |
| Collapse All | Ctrl+Shift+← | Cmd+Shift+← | Collapse all folders |
| Expand All | Ctrl+Shift+→ | Cmd+Shift+→ | Expand all folders |

## View and Layout

### Panel Management
| Action | Windows/Linux | Mac | Description |
|--------|---------------|-----|-------------|
| Toggle Preview | Ctrl+Shift+V | Cmd+Shift+V | Show/hide preview pane |
| Focus Mode | F11 | F11 | Toggle distraction-free mode |
| Zen Mode | Ctrl+K Z | Cmd+K Z | Hide all UI elements |
| Split View | Ctrl+\\ | Cmd+\\ | Toggle split view |

### Zoom and Display
| Action | Windows/Linux | Mac | Description |
|--------|---------------|-----|-------------|
| Zoom In | Ctrl++ | Cmd++ | Increase editor font size |
| Zoom Out | Ctrl+- | Cmd+- | Decrease editor font size |
| Reset Zoom | Ctrl+0 | Cmd+0 | Reset to default size |
| Toggle Theme | Ctrl+Shift+L | Cmd+Shift+L | Switch dark/light theme |

## Search and Navigation

### Search Operations
| Action | Windows/Linux | Mac | Description |
|--------|---------------|-----|-------------|
| Global Search | Ctrl+/ | Cmd+/ | Open global search |
| Search in Files | Ctrl+Shift+F | Cmd+Shift+F | Advanced search |
| Find Next | F3 | F3 | Find next occurrence |
| Find Previous | Shift+F3 | Shift+F3 | Find previous occurrence |
| Clear Search | Esc | Esc | Clear search results |

### Quick Navigation
| Action | Windows/Linux | Mac | Description |
|--------|---------------|-----|-------------|
| Go to Note | Ctrl+P | Cmd+P | Quick note picker |
| Recent Notes | Ctrl+Shift+P | Cmd+Shift+P | Recently opened notes |
| Jump to Folder | Ctrl+J | Cmd+J | Quick folder navigation |

## Advanced Shortcuts

### Multi-Cursor Editing
| Action | Windows/Linux | Mac | Description |
|--------|---------------|-----|-------------|
| Add Cursor Above | Ctrl+Alt+↑ | Cmd+Alt+↑ | Add cursor above |
| Add Cursor Below | Ctrl+Alt+↓ | Cmd+Alt+↓ | Add cursor below |
| Select All Occurrences | Ctrl+Shift+L | Cmd+Shift+L | Multi-select same word |
| Add Next Occurrence | Ctrl+Alt+N | Cmd+Alt+N | Add next matching selection |

### Developer Tools
| Action | Windows/Linux | Mac | Description |
|--------|---------------|-----|-------------|
| Command Palette | Ctrl+Shift+P | Cmd+Shift+P | Open command palette |
| Developer Tools | F12 | F12 | Open browser dev tools |
| Reload App | Ctrl+R | Cmd+R | Reload application |

## Customizing Shortcuts

### Settings
You can customize most keyboard shortcuts in Settings:
1. Press Ctrl+, (Cmd+, on Mac) to open Settings
2. Navigate to "Keyboard Shortcuts"
3. Click on any shortcut to reassign it
4. Press your desired key combination
5. Click "Save" to apply changes

### Creating Custom Shortcuts
- Assign shortcuts to frequently used functions
- Use function keys (F1-F12) for custom actions
- Combine modifiers (Ctrl+Shift+Alt) for complex operations
- Avoid conflicts with browser shortcuts

## Tips for Mastery

### Learning Strategy
1. **Start with basics**: Master Ctrl+N, Ctrl+S, Ctrl+/ first
2. **Add gradually**: Learn 2-3 new shortcuts per week
3. **Practice regularly**: Use shortcuts instead of mouse clicks
4. **Create muscle memory**: Repeat common actions

### Productivity Boosters
- **Search everything**: Use Ctrl+/ instead of browsing folders
- **Quick creation**: Ctrl+N + type title + Enter for instant notes
- **Fast formatting**: Select text + shortcut for instant formatting
- **Multi-cursor power**: Edit multiple lines simultaneously

### Workflow Examples

**Morning routine:**
1. Ctrl+N - New daily note
2. Type "Daily - " + Ctrl+; - Add date
3. Ctrl+Shift+9 - Start task list
4. Begin typing todos

**Research session:**
1. Ctrl+/ - Search existing notes
2. Ctrl+N - Create research note
3. Ctrl+K - Add reference links
4. Ctrl+Shift+\` - Add code examples

**Review and cleanup:**
1. Ctrl+Shift+F - Search for outdated content
2. Ctrl+Shift+P - Check recent notes
3. Delete - Remove obsolete notes
4. F2 - Rename for better organization

Master these shortcuts and watch your productivity soar!`,

    'export-import': `# Export and Import Guide

DevNotes provides comprehensive export and import capabilities to backup your data, share content, and migrate between systems.

## Export Options

### Single Note Export

**Export current note:**
1. Open the note you want to export
2. Press Ctrl+Shift+E or click Export in the note menu
3. Choose your preferred format:
   - **Markdown (.md)** - Preserves formatting and structure
   - **HTML** - For web publishing or email
   - **PDF** - For sharing or printing
   - **Plain Text** - Basic text without formatting

### Bulk Export

**Export multiple notes:**
1. Select notes in the sidebar (Ctrl+click for multiple)
2. Right-click and choose "Export Selected"
3. Choose format and destination

**Export entire folders:**
1. Right-click on a folder
2. Select "Export Folder"
3. All notes in the folder and subfolders will be exported

### Complete Backup

**Export all data:**
1. Go to Settings → Export/Import
2. Click "Export All Data"
3. Choose format:
   - **DevNotes Archive (.zip)** - Complete backup with metadata
   - **Markdown Archive (.zip)** - Folder structure with .md files
   - **JSON Export** - Raw data for programmatic use

## Export Formats

### Markdown (.md)
- **Best for**: Version control, editing in other apps
- **Preserves**: All formatting, code blocks, tables
- **Compatible with**: GitHub, GitLab, Obsidian, Notion

### HTML
- **Best for**: Web publishing, email, sharing
- **Features**: Styled output, embedded CSS
- **Includes**: Syntax highlighting, math rendering

### PDF
- **Best for**: Printing, professional sharing
- **Features**: High-quality formatting, embedded fonts
- **Options**: Page size, margins, header/footer

### JSON
- **Best for**: Data migration, programmatic access
- **Contains**: Raw note data, metadata, relationships
- **Use cases**: Backup, migration scripts, analysis

### DevNotes Archive
- **Best for**: Complete backup and restore
- **Contains**: Notes, folders, settings, search index
- **Preserves**: All metadata, timestamps, organization

## Import Options

### Supported Import Formats

**Markdown files:**
- Single .md files
- Zip archives with .md files
- Folder structures with markdown

**Other note apps:**
- Obsidian vaults (.zip)
- Notion exports (.zip)
- Evernote exports (.enex)
- OneNote exports
- Apple Notes exports

**Developer formats:**
- GitHub repositories
- GitLab wikis
- README files
- Documentation sites

### Import Process

**Single file import:**
1. Go to Settings → Export/Import
2. Click "Import File"
3. Select your file
4. Choose destination folder
5. Click "Import"

**Bulk import:**
1. Click "Import Archive"
2. Select .zip file
3. Preview import structure
4. Choose import options:
   - Preserve folder structure
   - Handle naming conflicts
   - Skip duplicates
5. Confirm import

### Import Options

**Folder structure:**
- **Preserve structure** - Maintains original organization
- **Flatten to single folder** - Imports all to one location
- **Custom mapping** - Choose destination for each folder

**Naming conflicts:**
- **Auto-rename** - Adds numbers to duplicate names
- **Skip duplicates** - Ignores files that already exist
- **Overwrite** - Replaces existing files
- **Prompt for each** - Ask what to do for each conflict

**Content processing:**
- **Convert formats** - Transform content during import
- **Extract metadata** - Parse frontmatter and tags
- **Clean formatting** - Remove unwanted formatting

## Migration Scenarios

### From Other Note Apps

**From Obsidian:**
1. Export Obsidian vault as .zip
2. Use DevNotes "Import Archive" feature
3. Choose "Preserve folder structure"
4. Wikilinks will be converted to standard markdown links

**From Notion:**
1. Export Notion workspace as Markdown
2. Download the .zip file
3. Import using "Import Archive"
4. Database properties become tags

**From Evernote:**
1. Export notebooks as .enex files
2. Use "Import ENEX" option
3. Notes are converted to markdown
4. Attachments are preserved

### Between DevNotes Instances

**Full migration:**
1. Export "DevNotes Archive" from source
2. Import archive on target system
3. All data, settings, and organization preserved

**Selective migration:**
1. Export specific folders as ZIP
2. Import into target folders
3. Merge with existing content

### Version Control Integration

**Git repository setup:**
1. Export notes as Markdown Archive
2. Initialize git repository
3. Commit markdown files
4. Use standard git workflow for collaboration

**Continuous backup:**
1. Set up automated export script
2. Export to cloud storage (Dropbox, Google Drive)
3. Version history maintained automatically

## Advanced Export/Import

### Custom Scripts

**Automated exports:**
\`\`\`javascript
// Export all notes modified in last week
const lastWeek = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
const recentNotes = notes.filter(note => note.updatedAt > lastWeek);
exportNotes(recentNotes, 'markdown');
\`\`\`

**Import preprocessing:**
\`\`\`javascript
// Convert custom formatting during import
function preprocessContent(content) {
  // Convert custom syntax to markdown
  return content
    .replace(/{{([^}]+)}}/g, '\`$1\`')  // Convert {{code}} to code
    .replace(/-->/g, '→');              // Convert arrows
}
\`\`\`

### Batch Operations

**Bulk rename during import:**
1. Use regex patterns for file naming
2. Extract dates from content
3. Apply consistent naming conventions

**Content transformation:**
1. Update links during import
2. Convert image references
3. Standardize formatting

## Backup Strategies

### Regular Backups

**Daily automated backup:**
1. Set up weekly full export
2. Use incremental exports for recent changes
3. Store in multiple locations (local + cloud)

**Version retention:**
- Keep last 7 daily backups
- Monthly archives for long-term storage
- Annual complete archives

### Backup Verification

**Test restores:**
1. Periodically test import process
2. Verify data integrity
3. Check all features work correctly

**Backup monitoring:**
1. Verify export file sizes
2. Check export completion logs
3. Monitor backup storage space

## Troubleshooting

### Common Export Issues

**Large file exports:**
- Break into smaller chunks
- Use ZIP compression
- Consider cloud storage for transfer

**Special characters:**
- Ensure UTF-8 encoding
- Test with special character content
- Use platform-appropriate line endings

**Missing attachments:**
- Verify attachment export settings
- Check file size limits
- Ensure proper permissions

### Import Problems

**Encoding issues:**
- Check file encoding (UTF-8 recommended)
- Test with sample content first
- Convert encoding if necessary

**Format compatibility:**
- Verify source format support
- Use intermediate conversion if needed
- Check for format-specific limitations

**Performance with large imports:**
- Import in smaller batches
- Monitor memory usage
- Use background import for large datasets

## Best Practices

### Export Guidelines
1. **Regular schedule**: Set up automated weekly exports
2. **Multiple formats**: Export in both native and portable formats
3. **Test restores**: Verify exports can be imported successfully
4. **Version control**: Keep multiple backup versions

### Import Guidelines
1. **Backup first**: Always backup existing data before importing
2. **Test small**: Start with a small subset of data
3. **Review structure**: Check folder organization before bulk import
4. **Verify content**: Spot-check imported content for accuracy

### Security Considerations
1. **Sensitive data**: Be careful with exports containing confidential information
2. **Access control**: Secure backup files appropriately
3. **Encryption**: Consider encrypting backup files
4. **Cloud storage**: Review privacy policies for cloud backup services

Your data is valuable - protect it with a solid backup and export strategy!`
  },

  advanced: {
    'power-user-tips': `# Power User Tips and Advanced Workflows

Unlock the full potential of DevNotes with these advanced techniques and workflows used by power users.

## Advanced Organization Strategies

### The PARA Method for Developers

Organize your knowledge using the PARA (Projects, Areas, Resources, Archive) method adapted for development:

\`\`\`
📁 Projects (Active work with deadlines)
  📁 E-commerce Rewrite
  📁 API Migration
  📁 Performance Optimization

📁 Areas (Ongoing responsibilities)
  📁 Code Reviews
  📁 Team Mentoring
  📁 Architecture Decisions

📁 Resources (Future reference)
  📁 Design Patterns
  📁 Best Practices
  📁 Library Documentation

📁 Archive (Completed/inactive)
  📁 2024-Q1-Projects
  📁 Legacy Systems
\`\`\`

### Zettelkasten for Technical Knowledge

Create a linked knowledge system:
1. **Atomic notes**: One concept per note
2. **Unique IDs**: Use format like YYYYMMDD-HHMM
3. **Linking**: Connect related concepts
4. **Index notes**: Create topic overview notes

Example structure:
\`\`\`
📝 20241120-1430 - React Hooks Fundamentals
📝 20241120-1435 - useEffect Hook Details
📝 20241120-1440 - Custom Hooks Pattern
📝 20241120-1500 - React Hooks Index
\`\`\`

### Daily Developer Workflows

**Morning Routine:**
\`\`\`markdown
# Daily - 2024-11-20

## Today's Focus
- [ ] Complete user authentication feature
- [ ] Review PR #124
- [ ] Team standup at 10am

## Code Review Notes
- PR-124-Authentication - Ready for final review
- Security-Checklist - Applied to new features

## Learning
- Reading: Clean Architecture Chapter 5
- Practice: React Testing Library Examples
\`\`\`

## Advanced Search Techniques

### Complex Query Patterns

**Multi-condition searches:**
\`\`\`
(folder:projects OR folder:work) AND tag:urgent AND modified:thisweek
\`\`\`

**Regex patterns for power users:**
\`\`\`
content:/function\\s+\\w+\\(/  # Find function definitions
content:/TODO|FIXME|HACK/     # Find code annotations
title:/\\d{4}-\\d{2}-\\d{2}/  # Find dated notes
\`\`\`

**Saved search shortcuts:**
Create keyboard shortcuts for common searches:
- Alt+1: Recent work notes
- Alt+2: Today's tasks
- Alt+3: Code snippets

### Search-Driven Workflows

**GTD (Getting Things Done) with Search:**
\`\`\`
tag:next-action AND NOT tag:waiting
tag:project AND modified:<7days
tag:someday AND created:>30days
\`\`\`

**Knowledge Discovery:**
\`\`\`
content:"similar to" OR content:"related to"  # Find connection notes
tag:learn AND modified:thismonth             # Recent learning
folder:archive AND tag:useful                # Archived gems
\`\`\`

## Template Systems

### Note Templates

**Meeting Notes Template:**
\`\`\`markdown
# Meeting: TITLE - DATE

**Attendees:** ATTENDEES
**Duration:** DURATION
**Type:** TYPE

## Agenda
- 

## Discussion
- 

## Action Items
- [ ] ACTION - @PERSON - Due: DATE

## Follow-up
- 

**Next Meeting:** NEXT_DATE
\`\`\`

**Code Review Template:**
\`\`\`markdown
# Code Review: PR_NUMBER - TITLE

**Author:** AUTHOR
**Reviewers:** REVIEWERS
**Files Changed:** FILE_COUNT

## Summary
DESCRIPTION

## Technical Review
### Architecture
- [ ] Follows established patterns
- [ ] Proper separation of concerns
- [ ] Maintainable design

### Code Quality
- [ ] Clean, readable code
- [ ] Proper error handling
- [ ] Adequate test coverage

### Security
- [ ] No sensitive data exposed
- [ ] Input validation present
- [ ] Authentication/authorization correct

## Comments
FEEDBACK

## Decision
- [ ] Approve
- [ ] Request changes
- [ ] Needs discussion

**Review completed:** DATE
\`\`\`

### Dynamic Templates with JavaScript

Create templates that generate content:
\`\`\`javascript
// Daily note generator
function createDailyNote() {
  const today = new Date().toISOString().split('T')[0];
  const dayOfWeek = new Date().toLocaleDateString('en-US', { weekday: 'long' });
  
  return \`# Daily - \${today} (\${dayOfWeek})

## Priority Tasks
- [ ] 
- [ ] 
- [ ] 

## Code Review Queue
\${getPendingReviews()}

## Learning Goal
Focus: 

## Notes
\`;
}
\`\`\`

## Automation and Scripting

### Auto-linking Strategies

**Project Cross-references:**
\`\`\`markdown
Related: Project-Alpha-Architecture, API-Design-Decisions
See also: Performance-Requirements, Security-Checklist
Dependencies: Database-Schema, Authentication-Service
\`\`\`

**Tag Automation:**
Use consistent tagging for automatic organization:
- #project/alpha - Project-specific content
- #type/meeting - Content type tags
- #status/in-progress - Status indicators
- #priority/high - Priority levels

### Workflow Automation

**Git Integration:**
\`\`\`bash
# Export notes as documentation
npm run export:docs

# Commit to git repository
git add docs/
git commit -m "Update documentation: $(date)"
git push origin main
\`\`\`

**CI/CD Integration:**
\`\`\`yaml
# .github/workflows/docs.yml
name: Update Documentation
on:
  push:
    branches: [main]
jobs:
  docs:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Generate docs
        run: npm run docs:generate
\`\`\`

## Performance Optimization

### Large-Scale Organization

**For 1000+ notes:**
1. Use consistent folder hierarchies (max 3-4 levels deep)
2. Implement regular archiving schedules
3. Use specific tags rather than broad categories
4. Archive completed projects quarterly

**Memory Management:**
- Close unused notes regularly
- Use search instead of browsing large folders
- Archive old content to separate databases
- Monitor browser memory usage

### Search Optimization

**Index Management:**
\`\`\`javascript
// Rebuild search index monthly
async function rebuildSearchIndex() {
  await searchService.rebuildIndex();
  console.log('Search index rebuilt');
}

// Schedule for first of each month
if (new Date().getDate() === 1) {
  rebuildSearchIndex();
}
\`\`\`

**Query Optimization:**
- Use folder filters for faster searches
- Combine specific terms rather than broad searches
- Use date ranges to limit scope
- Cache frequent search results

## Advanced Markdown Techniques

### Complex Document Structures

**Multi-level TOC:**
\`\`\`markdown
# API Documentation

## Table of Contents
1. [Authentication](#authentication)
   - [Login](#login)
   - [Logout](#logout)
2. [Endpoints](#endpoints)
   - [Users](#users)
   - [Posts](#posts)
3. [Examples](#examples)

## Authentication
### Login
...
\`\`\`

**Cross-document Linking:**
\`\`\`markdown
<!-- Reference other documents -->
See: Authentication-Guide#jwt-tokens
Related: API-Design#error-handling
Example: Code-Samples#user-registration
\`\`\`

### Embedded Content

**Code Documentation:**
\`\`\`markdown
## Function: getUserData

\`\`\`typescript
/**
 * Fetches user data from the API
 * @param userId - The unique user identifier
 * @param options - Optional request configuration
 * @returns Promise resolving to user data
 */
async function getUserData(
  userId: string, 
  options?: RequestOptions
): Promise<UserData> {
  // Implementation details...
}
\`\`\`

**Usage:**
\`\`\`typescript
const user = await getUserData('123', { 
  includeProfile: true 
});
\`\`\`

**Testing:**
\`\`\`typescript
describe('getUserData', () => {
  it('should fetch user data successfully', async () => {
    // Test implementation...
  });
});
\`\`\`
\`\`\`

## Team Collaboration

### Shared Knowledge Bases

**Team Documentation Standards:**
1. Consistent naming conventions
2. Standardized templates
3. Regular review cycles
4. Clear ownership assignments

**Review Process:**
\`\`\`markdown
<!-- Document header -->
**Author:** @username
**Reviewers:** @reviewer1, @reviewer2
**Last Updated:** 2024-11-20
**Status:** Draft | Review | Approved
**Version:** 1.2

<!-- Review history -->
## Review History
- v1.0 - Initial draft - @author
- v1.1 - Architecture review - @reviewer1
- v1.2 - Security review - @reviewer2
\`\`\`

### Knowledge Sharing

**Weekly Knowledge Sharing:**
\`\`\`markdown
# Team Learning - Week of DATE

## New Discoveries
- React-18-Features - Concurrent rendering benefits
- Database-Optimization - Index tuning strategies

## Shared Solutions
- CORS-Issues-Fix - Solution for development environment
- Testing-Utils - New helper functions for unit tests

## Upcoming Learning
- [ ] GraphQL federation workshop
- [ ] Security audit training
- [ ] Performance monitoring tools
\`\`\`

## Backup and Security

### Advanced Backup Strategies

**Automated Backup Script:**
\`\`\`javascript
// Backup rotation system
class BackupManager {
  async createBackup() {
    const timestamp = new Date().toISOString().split('T')[0];
    const backup = await devnotes.export.createFullBackup();
    
    // Save to multiple locations
    await this.saveToCloud(backup, \`devnotes-\${timestamp}.zip\`);
    await this.saveToLocal(backup, \`backups/\${timestamp}\`);
    
    // Cleanup old backups
    await this.cleanupOldBackups();
  }
  
  async cleanupOldBackups() {
    // Keep last 30 days of daily backups
    // Keep last 12 weeks of weekly backups
    // Keep last 24 months of monthly backups
  }
}
\`\`\`

**Security Best Practices:**
1. Encrypt sensitive backups
2. Use secure cloud storage
3. Implement access controls
4. Regular security audits
5. Monitor for unauthorized access

## Custom Extensions

### Browser Extensions

**Quick Capture Extension:**
\`\`\`javascript
// Content script for capturing web content
function capturePageContent() {
  const title = document.title;
  const url = window.location.href;
  const selectedText = window.getSelection().toString();
  
  const markdown = \`# \${title}

**Source:** [Link](\${url})
**Captured:** \${new Date().toISOString()}

## Selected Content
\${selectedText}

## Notes
\`;
  
  // Send to DevNotes
  sendToDevNotes(markdown);
}
\`\`\`

### API Integration

**External Tool Integration:**
\`\`\`javascript
// Jira ticket integration
async function createNoteFromJira(ticketId) {
  const ticket = await jira.getTicket(ticketId);
  
  const noteContent = \`# \${ticket.summary}

**Ticket:** [\${ticketId}](\${ticket.url})
**Status:** \${ticket.status}
**Assignee:** \${ticket.assignee}
**Priority:** \${ticket.priority}

## Description
\${ticket.description}

## Analysis
\`;
  
  return devnotes.createNote(noteContent, {
    folder: 'work/tickets',
    tags: ['jira', ticket.priority.toLowerCase()]
  });
}
\`\`\`

## Productivity Hacks

### Keyboard Maestro/AutoHotkey Scripts

**Quick Note Creation:**
\`\`\`autohotkey
; AutoHotkey script for Windows
^j::  ; Ctrl+J hotkey
InputBox, noteTitle, Quick Note, Enter note title:
if ErrorLevel = 0
{
    Run, chrome.exe "https://devnotes.app?new=%noteTitle%"
}
return
\`\`\`

**Template Shortcuts:**
\`\`\`applescript
# macOS Keyboard Maestro macro
tell application "DevNotes"
    activate
    delay 0.5
    
    -- Create meeting note with current date
    set currentDate to (current date) as string
    set noteTitle to "Meeting - " & currentDate
    
    -- Insert template
    keystroke "n" using command down
    delay 0.2
    type text noteTitle
    keystroke return
    delay 0.5
    type text "## Agenda\\n\\n## Notes\\n\\n## Action Items\\n"
end tell
\`\`\`

### Alfred/Raycast Workflows

**DevNotes Alfred Workflow:**
\`\`\`javascript
// Alfred script filter
const query = argv[0];
const notes = await devnotes.search(query);

const items = notes.map(note => ({
  uid: note.id,
  title: note.title,
  subtitle: note.folder + ' • ' + note.updatedAt,
  arg: note.id,
  action: 'open-note'
}));

console.log(JSON.stringify({ items }));
\`\`\`

Master these power user techniques and transform DevNotes into your ultimate productivity system!`,

    customization: `# Customization Guide

Make DevNotes work exactly the way you want with comprehensive customization options.

## Theme Customization

### Built-in Themes

DevNotes includes several professionally designed themes:

**Light Themes:**
- **Default Light** - Clean, minimal design
- **GitHub Light** - Familiar GitHub-inspired interface
- **Solarized Light** - Easy on the eyes for long sessions

**Dark Themes:**
- **Default Dark** - Elegant dark mode
- **GitHub Dark** - Dark version of GitHub theme
- **Dracula** - Popular dark theme with vibrant accents
- **Nord** - Cool, arctic-inspired colors

**High Contrast:**
- **High Contrast Light** - Maximum readability
- **High Contrast Dark** - Dark mode with enhanced contrast

### Custom Theme Creation

**CSS Variables for Theming:**
\`\`\`css
/* Custom theme example */
:root {
  /* Primary colors */
  --primary-bg: #1e1e2e;
  --secondary-bg: #313244;
  --accent-color: #89b4fa;
  
  /* Text colors */
  --text-primary: #cdd6f4;
  --text-secondary: #a6adc8;
  --text-muted: #6c7086;
  
  /* Syntax highlighting */
  --syntax-keyword: #cba6f7;
  --syntax-string: #a6e3a1;
  --syntax-comment: #6c7086;
  --syntax-number: #fab387;
  
  /* Interface elements */
  --border-color: #45475a;
  --hover-bg: #585b70;
  --selection-bg: #45475a;
}
\`\`\`

**Editor Theme Customization:**
\`\`\`css
/* CodeMirror editor styling */
.cm-editor {
  --cm-background: var(--primary-bg);
  --cm-foreground: var(--text-primary);
  --cm-selection: var(--selection-bg);
  --cm-cursor: var(--accent-color);
}

.cm-line {
  font-family: 'JetBrains Mono', 'Fira Code', monospace;
  font-size: 14px;
  line-height: 1.6;
}
\`\`\`

### Font Configuration

**Editor Fonts:**
\`\`\`css
/* Programming fonts */
.editor-content {
  font-family: 
    'JetBrains Mono',
    'Fira Code',
    'Source Code Pro',
    'SF Mono',
    'Monaco',
    'Cascadia Code',
    'Consolas',
    monospace;
}

/* Enable font ligatures */
.editor-content {
  font-feature-settings: "liga" 1, "calt" 1;
  font-variant-ligatures: contextual;
}
\`\`\`

**Interface Fonts:**
\`\`\`css
/* Interface typography */
.interface-text {
  font-family:
    'Inter',
    'SF Pro Display',
    'Segoe UI',
    'Roboto',
    'Helvetica Neue',
    sans-serif;
}

/* Heading fonts */
h1, h2, h3, h4, h5, h6 {
  font-family:
    'JetBrains Mono',
    'SF Pro Display',
    'Inter',
    sans-serif;
  font-weight: 600;
}
\`\`\`

## Layout Customization

### Panel Configuration

**Sidebar Settings:**
\`\`\`json
{
  "sidebar": {
    "width": 280,
    "position": "left",
    "collapsible": true,
    "autoHide": false,
    "sections": {
      "noteList": { "enabled": true, "order": 1 },
      "folderTree": { "enabled": true, "order": 2 },
      "tagCloud": { "enabled": true, "order": 3 },
      "recentNotes": { "enabled": true, "order": 4 }
    }
  }
}
\`\`\`

**Editor Layout:**
\`\`\`json
{
  "editor": {
    "splitView": true,
    "splitRatio": 0.5,
    "previewOnRight": true,
    "showLineNumbers": true,
    "wordWrap": true,
    "minimap": false,
    "breadcrumbs": true
  }
}
\`\`\`

### Custom CSS Injection

**Advanced Layout Modifications:**
\`\`\`css
/* Hide elements you don't need */
.feature-you-dont-use {
  display: none !important;
}

/* Adjust spacing */
.note-list-item {
  padding: 8px 12px;
  margin-bottom: 2px;
}

/* Custom scrollbars */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: var(--secondary-bg);
}

::-webkit-scrollbar-thumb {
  background: var(--border-color);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: var(--hover-bg);
}
\`\`\`

## Keyboard Shortcuts

### Custom Shortcut Configuration

**Shortcuts Configuration File:**
\`\`\`json
{
  "shortcuts": {
    "global": {
      "newNote": "Ctrl+N",
      "search": "Ctrl+/",
      "quickOpen": "Ctrl+P",
      "commandPalette": "Ctrl+Shift+P"
    },
    "editor": {
      "bold": "Ctrl+B",
      "italic": "Ctrl+I",
      "code": "Ctrl+\`",
      "link": "Ctrl+K",
      "save": "Ctrl+S"
    },
    "custom": {
      "insertDate": "Ctrl+;",
      "insertTime": "Ctrl+Shift+;",
      "duplicateNote": "Ctrl+Shift+D",
      "exportNote": "Ctrl+Shift+E"
    }
  }
}
\`\`\`

**Advanced Shortcuts:**
\`\`\`json
{
  "macros": {
    "dailyNote": {
      "shortcut": "Ctrl+Alt+D",
      "actions": [
        "newNote",
        { "type": "insertText", "value": "# Daily - {DATE}\\n\\n## Tasks\\n- [ ] \\n\\n## Notes\\n" },
        { "type": "moveCursor", "position": "end" }
      ]
    },
    "meetingNote": {
      "shortcut": "Ctrl+Alt+M",
      "template": "meeting-template",
      "folder": "meetings"
    }
  }
}
\`\`\`

This customization guide helps you tailor DevNotes to your exact workflow preferences and needs!`
  },

  troubleshooting: {
    'common-issues': `# Troubleshooting Common Issues

Quick solutions to common problems and issues you might encounter while using DevNotes.

## Installation and Setup Issues

### Browser Compatibility

**Issue: DevNotes won't load in my browser**

**Solutions:**
1. **Check browser support:**
   - Chrome 88+ (recommended)
   - Firefox 85+
   - Safari 14+
   - Edge 88+

2. **Clear browser cache:**
   - Press Ctrl+Shift+R (Windows/Linux) or Cmd+Shift+R (Mac)
   - Or manually clear cache in browser settings

3. **Disable browser extensions:**
   - Try opening DevNotes in incognito/private mode
   - Disable ad blockers and privacy extensions temporarily

4. **Enable JavaScript:**
   - Ensure JavaScript is enabled in browser settings
   - Check for script blockers (NoScript, uBlock Origin)

**Issue: PWA installation fails**

**Solutions:**
1. **Use HTTPS:** PWA requires secure connection
2. **Check browser support:** Install from Chrome, Edge, or Safari
3. **Clear service worker:** Go to DevTools → Application → Service Workers → Unregister
4. **Retry installation:** Refresh page and click install prompt again

### Performance Issues

**Issue: DevNotes loads slowly**

**Solutions:**
1. **Check system resources:**
   - Close unnecessary browser tabs
   - Monitor RAM usage (Task Manager/Activity Monitor)
   - Restart browser if needed

2. **Clear browser data:**
   - Clear cache, cookies, and local storage
   - Reset to default settings if needed

3. **Disable browser extensions:**
   - Temporarily disable all extensions
   - Re-enable one by one to identify conflicts

4. **Check network connection:**
   - Ensure stable internet for initial load
   - DevNotes works offline after first load

## Data and Storage Issues

### Data Loss Prevention

**Issue: My notes disappeared**

**Solutions:**
1. **Check browser storage:**
   - Open DevTools → Application → IndexedDB → DevNotes
   - Verify data is present in database

2. **Check search filters:**
   - Clear any active search filters
   - Check if you're in a specific folder view

3. **Browser data cleanup:**
   - Check if browser automatically cleared data
   - Look in browser settings for storage cleanup policies

4. **Import from backup:**
   - If you have exports, use Import function
   - Check Downloads folder for automatic exports

**Issue: "Storage quota exceeded" error**

**Solutions:**
1. **Check storage usage:**
   - DevTools → Application → Storage → Usage
   - See how much space DevNotes is using

2. **Clean up data:**
   - Delete unnecessary notes and folders
   - Archive old content
   - Clear search index and rebuild

3. **Increase browser storage:**
   - Chrome: Settings → Privacy → Site Settings → Storage
   - Allocate more space to DevNotes

4. **Export and reimport:**
   - Export all data
   - Clear browser storage
   - Import data back

### Sync and Backup Issues

**Issue: Auto-backup not working**

**Solutions:**
1. **Check browser permissions:**
   - Allow file system access
   - Enable automatic downloads

2. **Verify backup settings:**
   - Settings → Backup → Auto-backup enabled
   - Check backup frequency and location

3. **Manual backup:**
   - Export all data manually
   - Save to secure location

4. **Cloud storage setup:**
   - Configure cloud storage integration
   - Test upload/download functionality

## Editor and Interface Issues

### Editor Problems

**Issue: Markdown preview not updating**

**Solutions:**
1. **Refresh preview:**
   - Click refresh button in preview pane
   - Toggle preview off and on

2. **Check for syntax errors:**
   - Look for unclosed code blocks
   - Check for malformed markdown syntax

3. **Clear editor cache:**
   - Restart editor by switching notes
   - Refresh entire application

4. **Browser console errors:**
   - Open DevTools → Console
   - Look for JavaScript errors and report them

**Issue: Syntax highlighting not working**

**Solutions:**
1. **Verify language name:**
   - Check spelling of language identifier
   - Use supported language names (javascript, python, etc.)

2. **Clear and reapply:**
   - Remove language identifier
   - Retype the language name

3. **Editor restart:**
   - Switch to different note and back
   - Refresh the application

**Issue: Keyboard shortcuts not working**

**Solutions:**
1. **Check browser conflicts:**
   - Some shortcuts may be captured by browser
   - Try alternative shortcuts in settings

2. **Focus issues:**
   - Click in editor area first
   - Ensure editor has focus, not sidebar

3. **Reset shortcuts:**
   - Settings → Keyboard Shortcuts → Reset to defaults
   - Reconfigure custom shortcuts

### Search Issues

**Issue: Search not finding existing content**

**Solutions:**
1. **Rebuild search index:**
   - Settings → Advanced → Rebuild Search Index
   - Wait for completion before searching

2. **Check search syntax:**
   - Use simple terms first
   - Avoid complex operators if having issues

3. **Clear search cache:**
   - Close and reopen search panel
   - Refresh application

4. **Content verification:**
   - Manually browse to suspected content
   - Verify text actually exists in notes

**Issue: Search results incomplete or wrong**

**Solutions:**
1. **Update search index:**
   - Allow time for background indexing
   - Force manual reindex if needed

2. **Check search filters:**
   - Remove folder, date, or tag filters
   - Use broader search terms

3. **Database integrity:**
   - Export and reimport data
   - This rebuilds all indexes

## Import/Export Issues

### Import Problems

**Issue: Import fails with error message**

**Solutions:**
1. **Check file format:**
   - Verify file is supported format (.md, .zip, .json)
   - Ensure file is not corrupted

2. **File size limits:**
   - Large files may timeout
   - Break into smaller imports

3. **Content encoding:**
   - Ensure UTF-8 encoding
   - Check for special characters

4. **Browser permissions:**
   - Allow file access in browser settings
   - Try different browser if needed

**Issue: Imported content loses formatting**

**Solutions:**
1. **Check source format:**
   - Verify original markdown syntax
   - Look for non-standard formatting

2. **Import settings:**
   - Try different import options
   - Use "preserve formatting" if available

3. **Manual cleanup:**
   - Edit imported notes to fix formatting
   - Use find/replace for bulk fixes

### Export Problems

**Issue: Export downloads empty or corrupted file**

**Solutions:**
1. **Check browser downloads:**
   - Verify file actually downloaded
   - Check Downloads folder

2. **Try different format:**
   - If ZIP fails, try individual files
   - Use different export format

3. **Reduce export size:**
   - Export in smaller batches
   - Exclude large attachments

4. **Browser security:**
   - Disable popup blockers
   - Allow file downloads from DevNotes

## Connectivity and Network Issues

### Offline Functionality

**Issue: DevNotes doesn't work offline**

**Solutions:**
1. **PWA installation:**
   - Install as PWA for better offline support
   - Ensure service worker is registered

2. **Cache refresh:**
   - Clear service worker cache
   - Reload application while online

3. **Browser settings:**
   - Enable offline storage
   - Allow larger cache sizes

**Issue: Slow loading of large notes**

**Solutions:**
1. **Break up large notes:**
   - Split into smaller, focused notes
   - Use linking between related notes

2. **Optimize images:**
   - Compress large images
   - Use external image hosting

3. **Performance settings:**
   - Enable virtual scrolling
   - Reduce preview refresh rate

## Mobile and Touch Issues

### Mobile Browser Problems

**Issue: Interface too small on mobile**

**Solutions:**
1. **Zoom settings:**
   - Adjust browser zoom level
   - Use responsive design mode

2. **Mobile layout:**
   - Switch to mobile-optimized view
   - Hide unnecessary panels

3. **Touch targets:**
   - Use larger tap areas
   - Enable accessibility features

**Issue: Keyboard issues on mobile**

**Solutions:**
1. **Virtual keyboard:**
   - Use external keyboard if available
   - Adjust keyboard settings

2. **Input focus:**
   - Tap directly in editor area
   - Scroll to keep input visible

## Advanced Troubleshooting

### Browser Console Debugging

**How to check browser console:**
1. **Open DevTools:**
   - Press F12 or Ctrl+Shift+I
   - Right-click → Inspect

2. **Console tab:**
   - Look for error messages in red
   - Note any warnings in yellow

3. **Common error types:**
   - TypeError: Usually coding issues
   - QuotaExceededError: Storage full
   - NetworkError: Connectivity issues

### Storage Inspection

**Check IndexedDB data:**
1. **DevTools → Application tab**
2. **IndexedDB → DevNotes database**
3. **Expand tables:** notes, folders, settings
4. **Verify data integrity**

**Clear storage if needed:**
1. **Application → Storage**
2. **Clear site data**
3. **Refresh application**
4. **Reimport data from backup**

### Performance Monitoring

**Monitor resource usage:**
1. **DevTools → Performance tab**
2. **Record a session**
3. **Look for:**
   - Memory leaks
   - Slow operations
   - Blocked threads

**Memory usage:**
1. **DevTools → Memory tab**
2. **Take heap snapshot**
3. **Compare before/after operations**

## Getting Help

### Before Reporting Issues

**Gather information:**
1. **Browser and version**
2. **Operating system**
3. **Steps to reproduce**
4. **Error messages**
5. **Console logs**

**Try safe mode:**
1. **Disable all customizations**
2. **Clear browser cache**
3. **Test in incognito mode**
4. **Use default settings**

### Reporting Bugs

**Include in bug reports:**
1. **Detailed description**
2. **Steps to reproduce**
3. **Expected vs actual behavior**
4. **Screenshots or videos**
5. **Browser console errors**
6. **System information**

### Emergency Data Recovery

**If all else fails:**
1. **Don't clear browser data**
2. **Export via DevTools:**
   - Application → IndexedDB → Export
3. **Contact support with:**
   - Browser type and version
   - Error descriptions
   - Last working date

Remember: DevNotes stores all data locally in your browser's IndexedDB. Regular exports are your best protection against data loss!`
  }
};

export default embeddedGuideContent;