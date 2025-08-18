# Creating Your First Note

Let's create your first note in DevNotes! This guide will walk you through the process step by step.

## Step 1: Create a New Note

There are several ways to create a new note. Choose the method that feels most natural to you:

### Method 1: Using the New Note Button (Recommended for beginners)
1. **Locate the sidebar** on the left side of the DevNotes interface
2. **Find the "+ New Note" button** at the top of the sidebar (it's usually blue or highlighted)
3. **Click the button** - you'll see a new note appear in the notes list
4. **The note will be created** in the currently selected folder (or root if no folder is selected)

![Screenshot: New Note Button Location](../../../assets/screenshots/new-note-button.png)
*The "+ New Note" button is prominently displayed at the top of the sidebar*

### Method 2: Using Keyboard Shortcuts (Fastest for power users)
- **Windows/Linux**: Press `Ctrl+N`
- **Mac**: Press `Cmd+N`
- **Result**: A new note is created instantly without using the mouse

**Pro tip**: This keyboard shortcut works from anywhere in the application, even when you're editing another note.

### Method 3: Right-Click Context Menu (Best for specific folder placement)
1. **Right-click in the notes list** (the area showing your existing notes)
2. **Or right-click on a specific folder** where you want the note created
3. **Select "New Note"** from the context menu that appears
4. **The note will be created** in the exact location you right-clicked

![Screenshot: Context Menu](../../../assets/screenshots/context-menu-new-note.png)
*Right-clicking shows a context menu with the "New Note" option*

### Method 4: Drag and Drop (Advanced)
1. **Drag a text file** from your computer's file manager
2. **Drop it onto the DevNotes window**
3. **The file content** will be imported as a new note automatically

## Step 2: Name Your Note

When you create a new note, the naming process is designed to be quick and intuitive:

### What You'll See
- **A text input field** appears with "Untitled Note" highlighted
- **The text is pre-selected** so you can immediately start typing
- **The cursor is positioned** and ready for your input

![Screenshot: Note Naming Interface](../../../assets/screenshots/note-naming.png)
*The note title field is highlighted and ready for input*

### How to Name Your Note
1. **Start typing immediately** - the highlighted text will be replaced
2. **Use descriptive names** that will help you find the note later
3. **Press Enter** to confirm the name, or **Tab** to move to the content area
4. **Press Escape** to cancel and use the default name

### Naming Best Practices

#### For Meeting Notes
```
Meeting Notes - [Project/Team] - [Date]
Examples:
- Meeting Notes - Project Alpha - 2024-01-15
- Meeting Notes - Engineering Team - 2024-01-15
- Meeting Notes - Client Review - 2024-01-15
```

#### For Technical Documentation
```
[Technology/Topic] - [Specific Area]
Examples:
- React Hooks - useEffect Best Practices
- Database Schema - User Management System
- API Documentation - Authentication Endpoints
```

#### For Learning Notes
```
[Subject] - [Specific Topic] - [Date/Session]
Examples:
- JavaScript - Async/Await Patterns
- System Design - Load Balancing Strategies
- AWS - EC2 Configuration Guide
```

#### For Project Notes
```
[Project Name] - [Document Type] - [Version/Date]
Examples:
- Website Redesign - Requirements - v1.0
- Mobile App - Architecture Decision - 2024-01-15
- API Migration - Implementation Plan - Phase 1
```

### Advanced Naming Features

#### Auto-Date Insertion
- Type `{date}` in the title to automatically insert today's date
- Type `{time}` to insert the current time
- Example: "Daily Standup - {date}" becomes "Daily Standup - 2024-01-15"

#### Template-Based Naming
- Use consistent prefixes for related notes
- Create naming templates for different note types
- Example: All meeting notes start with "MEET-", all learning notes with "LEARN-"

### Renaming Notes Later
Don't worry if you need to change the name later:
1. **Click on the note title** in the editor or sidebar
2. **Or press F2** when the note is selected
3. **Edit the name** and press Enter to confirm

## Step 3: Start Writing

Once you've named your note, you can start writing in the editor:

### The Editor Interface
- **Left pane**: Markdown editor with syntax highlighting
- **Right pane**: Live preview of your rendered content
- **Toolbar**: Quick access to formatting options

### Basic Markdown Syntax

Here are some essential markdown elements to get you started:

```markdown
# Heading 1
## Heading 2
### Heading 3

**Bold text**
*Italic text*
`Inline code`

- Bullet point 1
- Bullet point 2
- Bullet point 3

1. Numbered list item 1
2. Numbered list item 2
3. Numbered list item 3

[Link text](https://example.com)

> This is a blockquote
```

### Code Blocks

For code snippets, use triple backticks with the language name:

````markdown
```javascript
function greet(name) {
  return `Hello, ${name}!`;
}
```
````

This will render with syntax highlighting:

```javascript
function greet(name) {
  return `Hello, ${name}!`;
}
```

## Step 4: Auto-Save

DevNotes automatically saves your work as you type:
- Changes are saved every 500ms after you stop typing
- You'll see a small indicator showing save status
- No need to manually save - your work is always protected

## Step 5: Preview Your Note

Use the preview pane to see how your markdown will look:
- The preview updates in real-time as you type
- Toggle between editor-only, split view, or preview-only modes
- Use `Ctrl+Shift+P` to toggle preview mode

## Next Steps

Now that you've created your first note, you might want to:

1. **[Learn about organizing notes](getting-started/organizing-notes)** - Create folders and structure your workspace
2. **[Explore the markdown editor](features/markdown-editor)** - Discover advanced editing features
3. **[Set up keyboard shortcuts](features/keyboard-shortcuts)** - Speed up your workflow

## Common Questions

**Q: Can I change the note title later?**
A: Yes! Click on the note title in the editor or sidebar to rename it.

**Q: What happens if I accidentally close the browser?**
A: Your notes are automatically saved locally. When you return, everything will be exactly as you left it.

**Q: Can I write in plain text instead of markdown?**
A: Absolutely! Markdown is optional - you can write plain text and add formatting as needed.

Congratulations on creating your first note! You're ready to start building your knowledge base with DevNotes.