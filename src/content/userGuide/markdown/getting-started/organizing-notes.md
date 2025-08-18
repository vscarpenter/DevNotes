# Organizing Your Notes

Good organization is key to making the most of DevNotes. Learn how to structure your notes with folders, tags, and naming conventions.

## Folder Structure

### Creating Folders

1. **Right-click** in the sidebar where you want to create a folder
2. Select **"New Folder"** from the context menu
3. Type a name for your folder and press Enter

**Keyboard shortcut:** `Ctrl+Shift+N` (Windows/Linux) or `Cmd+Shift+N` (Mac)

### Folder Hierarchy

DevNotes supports unlimited folder nesting:

```
📁 Projects
  📁 Project Alpha
    📁 Meeting Notes
    📁 Technical Specs
    📁 Code Reviews
  📁 Project Beta
    📁 Research
    📁 Implementation
📁 Learning
  📁 JavaScript
  📁 React
  📁 Node.js
📁 Personal
  📁 Ideas
  📁 Todo Lists
```

### Best Practices for Folder Organization

#### 1. Project-Based Structure
Organize by projects or work areas:
- One main folder per project
- Subfolders for different aspects (meetings, docs, code)
- Keep related notes together

#### 2. Topic-Based Structure
Organize by subject matter:
- Technology stacks (React, Python, DevOps)
- Learning topics (Algorithms, System Design)
- Reference materials (Cheatsheets, Documentation)

#### 3. Time-Based Structure
Organize by time periods:
- Daily notes
- Weekly reviews
- Monthly planning
- Quarterly goals

## Moving Notes and Folders

### Drag and Drop
- **Drag notes** between folders in the sidebar
- **Drag folders** to reorganize your structure
- **Drop notes on folders** to move them

### Cut and Paste
1. Right-click on a note or folder
2. Select **"Cut"** from the context menu
3. Right-click on the destination folder
4. Select **"Paste"**

**Keyboard shortcuts:**
- Cut: `Ctrl+X` (Windows/Linux) or `Cmd+X` (Mac)
- Paste: `Ctrl+V` (Windows/Linux) or `Cmd+V` (Mac)

## Naming Conventions

### Notes
Use descriptive, searchable names:

**Good examples:**
- `API Documentation - User Authentication`
- `Meeting Notes - Sprint Planning - 2024-01-15`
- `React Hooks - useEffect Best Practices`

**Avoid:**
- `Note 1`, `Untitled`, `temp`
- Names that are too generic
- Special characters that might cause issues

### Folders
Keep folder names:
- **Short but descriptive**
- **Consistent in style**
- **Easy to scan visually**

**Examples:**
- `01-Projects` (numbered for ordering)
- `Learning-Resources`
- `Meeting-Notes`

## Tags and Metadata

While DevNotes focuses on folder organization, you can use markdown to add metadata:

```markdown
---
Tags: javascript, react, hooks
Project: Alpha
Status: In Progress
Created: 2024-01-15
---

# Your Note Content Here
```

This creates searchable metadata within your notes.

## Search-Friendly Organization

### Use Consistent Keywords
Include relevant keywords in:
- Note titles
- Folder names
- Note content
- Headers and subheaders

### Create Index Notes
For complex projects, create index notes that link to related content:

```markdown
# Project Alpha - Index

## Meeting Notes
- [Kickoff Meeting](./meetings/kickoff-2024-01-10.md)
- [Sprint Planning](./meetings/sprint-planning-2024-01-15.md)

## Technical Documentation
- [API Specification](./docs/api-spec.md)
- [Database Schema](./docs/database-schema.md)

## Code Reviews
- [Authentication Module](./reviews/auth-module-review.md)
```

## Folder Management Tips

### Regular Cleanup
- **Archive old projects** to keep your workspace clean
- **Delete empty folders** that are no longer needed
- **Consolidate similar folders** to reduce clutter

### Backup Important Structures
- **Export folder structures** before major reorganizations
- **Document your organization system** for consistency
- **Share folder templates** with team members

### Performance Considerations
- **Avoid too many nested levels** (3-4 levels max recommended)
- **Keep folder names reasonably short**
- **Don't create too many folders in a single directory**

## Advanced Organization Techniques

### Project Templates
Create template folder structures for new projects:

```
📁 Project Template
  📁 01-Planning
    📄 Project Charter Template.md
    📄 Requirements Template.md
  📁 02-Development
    📄 Technical Specs Template.md
    📄 Code Review Template.md
  📁 03-Documentation
    📄 User Guide Template.md
    📄 API Docs Template.md
```

### Cross-References
Use markdown links to connect related notes across folders:

```markdown
See also:
- [Related concept in Learning folder](../Learning/JavaScript/closures.md)
- [Implementation notes](../Projects/Alpha/implementation.md)
```

### Status Tracking
Use consistent prefixes or suffixes to track note status:

- `[DRAFT] Feature Specification`
- `[REVIEW] Code Architecture`
- `[FINAL] User Documentation`

## Next Steps

Now that you understand organization:

1. **[Explore the markdown editor](features/markdown-editor)** - Learn advanced editing features
2. **[Master search functionality](features/search)** - Find your notes quickly
3. **[Set up your workflow](advanced/power-user-tips)** - Optimize your productivity

Remember: The best organization system is the one you'll actually use consistently. Start simple and evolve your structure as your needs grow.