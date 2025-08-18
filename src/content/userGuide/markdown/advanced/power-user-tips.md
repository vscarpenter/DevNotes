# Power User Tips

Unlock the full potential of DevNotes with these advanced techniques and productivity hacks used by power users.

## Advanced Workflows

### The Zettelkasten Method
Implement the Zettelkasten (slip-box) method for connected thinking and knowledge building:

#### Setup Your Zettelkasten
1. **Create a dedicated folder** called "Zettelkasten" or "Knowledge Base"
2. **Use unique IDs** for each note using timestamp format: `YYYYMMDDHHMM-descriptive-title`
3. **Keep notes atomic** - one concept per note (aim for 200-500 words)
4. **Link liberally** between related concepts using `[[note-id]]` syntax

#### ID Generation System
```markdown
Format: YYYYMMDDHHMM-topic-subtopic
Examples:
- 202401151430-react-hooks-usestate
- 202401151445-javascript-closures-practical
- 202401151500-database-indexing-btree
```

#### Linking Strategy with Examples
```markdown
# 202401151430 - React Hooks: useState Pattern

useState is the most fundamental React hook for managing component state.

## Core Concept
```javascript
const [state, setState] = useState(initialValue);
```

## Key Insights
- State updates are asynchronous
- Functional updates prevent stale closures
- Initial state can be a function for expensive computations

## Related Concepts
- [[202401141200-functional-components]] - Foundation for hooks
- [[202401151445-react-state-management]] - Broader state patterns
- [[202401151500-useeffect-hook]] - Side effects in functional components
- [[202401151515-react-performance-optimization]] - When to optimize state

## Practical Applications
- Form input handling
- Toggle states (modals, dropdowns)
- Counter implementations
- Loading states

## Anti-patterns to Avoid
- Mutating state directly
- Using state for derived values
- Over-using state when props suffice

## Source
React Documentation - Hooks API Reference
Created: 2024-01-15 14:30
```

#### Advanced Linking Patterns

**Concept Hierarchies:**
```markdown
# Parent Concept: 202401151400-javascript-fundamentals
## Child Concepts:
- [[202401151410-javascript-variables]]
- [[202401151420-javascript-functions]]
- [[202401151430-javascript-objects]]
- [[202401151440-javascript-arrays]]
```

**Cross-Domain Connections:**
```markdown
# 202401151500 - Database Indexing Strategies

## Technical Implementation
- B-tree indexes for range queries
- Hash indexes for equality lookups

## Related to Other Domains:
- [[202401141200-data-structures-trees]] - Computer Science
- [[202401151300-performance-optimization]] - System Design
- [[202401151600-sql-query-optimization]] - Database Administration
```

#### Benefits and Outcomes
- **Emergent structure**: Knowledge organization develops naturally
- **Serendipitous discovery**: Find unexpected connections between ideas
- **Long-term knowledge building**: Compound learning effect over months/years
- **Better retention**: Active linking improves memory
- **Research acceleration**: Quickly find related concepts

#### Maintenance Workflow
1. **Daily review**: Spend 10 minutes reviewing recent notes
2. **Weekly linking**: Look for new connections between notes
3. **Monthly cleanup**: Remove outdated links, merge similar concepts
4. **Quarterly overview**: Identify knowledge gaps and emerging themes

### The PARA Method
Organize notes using the PARA method (Projects, Areas, Resources, Archive):

```
📁 01-Projects (things with deadlines)
  📁 Website Redesign
  📁 API Documentation
  📁 Team Onboarding

📁 02-Areas (ongoing responsibilities)
  📁 Team Management
  📁 Professional Development
  📁 Code Reviews

📁 03-Resources (future reference)
  📁 JavaScript Reference
  📁 Design Patterns
  📁 Industry Articles

📁 04-Archive (inactive items)
  📁 Completed Projects
  📁 Old Meeting Notes
  📁 Deprecated Documentation
```

### Daily Note System
Create a daily note system for consistent knowledge capture:

#### Template Structure
```markdown
# {{date}} - Daily Note

## Today's Focus
- [ ] Priority task 1
- [ ] Priority task 2
- [ ] Priority task 3

## Meeting Notes
### 10:00 AM - Team Standup
- Discussion points
- Action items

## Learning
### New Concepts
- Concept learned today
- Link to detailed notes: [[concept-note]]

### Code Snippets
```javascript
// Useful code discovered today
function example() {
  return "something useful";
}
```

## Reflections
- What went well?
- What could be improved?
- Ideas for tomorrow

## Links
- [[yesterday's note]]
- [[tomorrow's note]]
```

## Power User Keyboard Workflows

### Lightning-Fast Note Creation
Master these keyboard combinations for instant note creation:

```
Workflow 1: Quick Capture
Ctrl+N → Type title → Tab → Start writing
(Total time: 3 seconds)

Workflow 2: Structured Note
Ctrl+N → Type title → Tab → Ctrl+1 → Type heading → Enter → Start content
(Creates note with H1 header instantly)

Workflow 3: Meeting Notes
Ctrl+N → "Meeting - {date}" → Tab → Ctrl+Shift+T → Select meeting template
(Uses template system for consistent structure)
```

### Advanced Navigation Patterns
```
Quick Search and Open:
Ctrl+/ → Type search → Enter → Edit immediately

Folder Navigation:
Ctrl+B → Arrow keys → Enter → Ctrl+N
(Toggle sidebar, navigate, create note in specific folder)

Multi-Note Workflow:
Ctrl+P → Type note name → Enter → Ctrl+T → Open another note
(Quick note switching for research)
```

### Text Manipulation Mastery
```
Line Operations:
Ctrl+L → Select entire line
Ctrl+Shift+K → Delete entire line
Ctrl+Shift+D → Duplicate line
Alt+↑/↓ → Move line up/down

Block Operations:
Ctrl+A → Ctrl+] → Indent entire note
Ctrl+A → Ctrl+[ → Unindent entire note
Ctrl+Shift+L → Select all occurrences of selected text
```

### Multi-Cursor Power Techniques
```
Pattern Editing:
1. Select a word (double-click)
2. Ctrl+D → Select next occurrence
3. Ctrl+D → Select next occurrence (repeat)
4. Type replacement → All instances change simultaneously

Column Editing:
1. Hold Alt + drag vertically
2. Type to edit multiple lines at once
3. Perfect for formatting lists or code
```

## Advanced Markdown Techniques

### Custom CSS Classes for Visual Organization
Use HTML classes for enhanced visual structure:

```html
<div class="warning">
⚠️ **Critical**: This is a high-priority warning that needs immediate attention.
</div>

<div class="tip">
💡 **Pro Tip**: Use this technique for better visual organization and improved readability.
</div>

<div class="code-example">
🔧 **Implementation**: Here's how to implement this feature in your codebase.
</div>

<div class="research-note">
📚 **Research**: Findings from the latest industry studies and best practices.
</div>
```

### Advanced Callout Patterns
```markdown
> **📋 TODO**: Implement user authentication
> - [ ] Set up JWT tokens
> - [ ] Create login form
> - [ ] Add password validation

> **🐛 BUG**: Login form validation issue
> **Status**: In Progress
> **Assignee**: @john-doe
> **Due**: 2024-01-20

> **💭 IDEA**: What if we used a different approach?
> This could potentially solve the performance issue we've been having.
> Need to research feasibility.

> **📊 METRICS**: Performance improvements
> - Load time: 2.3s → 0.8s (65% improvement)
> - Bundle size: 2.1MB → 1.2MB (43% reduction)
> - User satisfaction: 3.2/5 → 4.7/5
```

### Advanced Tables
Create complex tables with merged cells and formatting:

```markdown
| Feature | Basic | Pro | Enterprise |
|---------|-------|-----|------------|
| Notes | ✅ | ✅ | ✅ |
| Folders | ✅ | ✅ | ✅ |
| Search | Basic | Advanced | AI-Powered |
| Export | Limited | Full | Full + API |
| Users | 1 | 5 | Unlimited |
```

### Nested Lists with Mixed Types
Combine different list types for complex structures:

```markdown
1. **Project Phase 1**
   - [x] Requirements gathering
   - [x] Initial design
   - [ ] Stakeholder approval
     - [ ] Technical review
     - [ ] Business review
   
2. **Project Phase 2**
   - [ ] Development
     1. Backend API
     2. Frontend UI
     3. Integration testing
   - [ ] Documentation
```

### Mathematical Expressions
Use LaTeX for complex mathematical notation:

```latex
$$
\begin{align}
\nabla \times \vec{\mathbf{B}} -\, \frac1c\, \frac{\partial\vec{\mathbf{E}}}{\partial t} &= \frac{4\pi}{c}\vec{\mathbf{j}} \\
\nabla \cdot \vec{\mathbf{E}} &= 4 \pi \rho \\
\nabla \times \vec{\mathbf{E}}\, +\, \frac1c\, \frac{\partial\vec{\mathbf{B}}}{\partial t} &= \vec{\mathbf{0}} \\
\nabla \cdot \vec{\mathbf{B}} &= 0
\end{align}
$$
```

## Automation and Scripting

### Template Automation
Create templates for common note types:

#### Meeting Notes Template
```markdown
# {{meeting-title}} - {{date}}

**Attendees**: {{attendees}}
**Duration**: {{start-time}} - {{end-time}}

## Agenda
1. {{agenda-item-1}}
2. {{agenda-item-2}}
3. {{agenda-item-3}}

## Discussion
### {{agenda-item-1}}
- Key points discussed
- Decisions made

## Action Items
- [ ] {{action-item}} - {{assignee}} - {{due-date}}

## Next Meeting
**Date**: {{next-meeting-date}}
**Focus**: {{next-meeting-focus}}
```

#### Code Review Template
```markdown
# Code Review - {{pr-title}}

**PR**: {{pr-link}}
**Author**: {{author}}
**Reviewer**: {{reviewer}}
**Date**: {{date}}

## Summary
{{brief-description}}

## Files Changed
- {{file-1}} - {{change-description}}
- {{file-2}} - {{change-description}}

## Review Comments
### Positive
- {{positive-feedback}}

### Suggestions
- {{suggestion-1}}
- {{suggestion-2}}

### Issues
- [ ] {{issue-1}} - Priority: {{priority}}
- [ ] {{issue-2}} - Priority: {{priority}}

## Decision
- [ ] Approve
- [ ] Request Changes
- [ ] Needs Discussion

**Overall Rating**: {{rating}}/5
```

### Keyboard Shortcuts for Templates
Set up custom shortcuts for frequently used templates:

1. **Create template notes** in a dedicated folder
2. **Use quick insert shortcuts** to copy template content
3. **Customize placeholders** for easy replacement

### Batch Operations
Perform bulk operations on multiple notes:

#### Batch Renaming
```javascript
// Rename all notes in a folder with date prefix
const notes = folder.getAllNotes();
notes.forEach(note => {
  const newName = `${getCurrentDate()}-${note.title}`;
  note.rename(newName);
});
```

#### Batch Tag Addition
```javascript
// Add tags to all notes in a project folder
const projectNotes = folder.getAllNotes();
projectNotes.forEach(note => {
  note.addTag('project-alpha');
  note.addTag('in-progress');
});
```

## Advanced Search Techniques

### Search Operators Mastery
Combine multiple operators for precise searches:

```
(javascript OR typescript) AND hooks NOT class
```

```
title:"meeting notes" AND created:this-month
```

```
folder:projects AND modified:last-week AND size:large
```

### Saved Searches
Create and save complex search queries:

1. **Build complex query** using operators
2. **Save as named search** for reuse
3. **Create shortcuts** for frequent searches
4. **Share searches** with team members

### Search-Based Workflows
Use search as a workflow tool:

#### Review Workflow
```
# Weekly Review Search Queries
1. modified:this-week - What did I work on?
2. tag:action-item AND NOT tag:completed - What needs attention?
3. created:this-week - What new ideas emerged?
4. folder:projects AND tag:urgent - What's critical?
```

#### Learning Workflow
```
# Learning Progress Queries
1. tag:learning AND created:this-month - Recent learning
2. tag:concept AND NOT tag:understood - Concepts to review
3. tag:code-example AND language:javascript - JS examples
4. tag:reference AND folder:resources - Reference materials
```

## Performance Optimization

### Large Note Collections
Optimize DevNotes for large collections (1000+ notes):

#### Folder Strategy
- **Limit folder depth** to 3-4 levels maximum
- **Balance folder sizes** (50-200 notes per folder)
- **Use consistent naming** for better performance
- **Archive old content** regularly

#### Search Optimization
- **Use specific terms** rather than broad searches
- **Leverage folder filters** to narrow scope
- **Clear search history** periodically
- **Use saved searches** for complex queries

#### Content Management
- **Break large notes** into smaller, focused notes
- **Use linking** instead of copying content
- **Optimize images** for web (compress, resize)
- **Clean up unused** attachments and media

### Memory Management
Monitor and optimize memory usage:

#### Browser Optimization
- **Close unused tabs** to free memory
- **Clear browser cache** periodically
- **Use dedicated browser** for DevNotes
- **Monitor memory usage** in dev tools

#### Content Optimization
- **Lazy load images** in large notes
- **Paginate long lists** of search results
- **Use virtual scrolling** for large folders
- **Compress exported** data

## Collaboration Techniques

### Team Knowledge Sharing
Share knowledge effectively with team members:

#### Shared Folder Structure
```
📁 Team-Shared
  📁 Meeting-Notes
    📁 All-Hands
    📁 Team-Standups
    📁 Project-Reviews
  📁 Documentation
    📁 Processes
    📁 Guidelines
    📁 Templates
  📁 Learning
    📁 Tech-Talks
    📁 Training-Materials
    📁 Best-Practices
```

#### Export Strategies
- **Regular exports** of shared content
- **Standardized formats** for consistency
- **Version control** for shared documents
- **Access control** for sensitive information

### Code Documentation
Integrate DevNotes with development workflows:

#### API Documentation
```markdown
# API Endpoint: User Authentication

## Endpoint
`POST /api/auth/login`

## Request
```json
{
  "email": "user@example.com",
  "password": "securepassword"
}
```

## Response
```json
{
  "token": "jwt-token-here",
  "user": {
    "id": 123,
    "email": "user@example.com",
    "name": "John Doe"
  }
}
```

## Error Codes
- `400`: Invalid request format
- `401`: Invalid credentials
- `429`: Rate limit exceeded

## Related
- [[user-registration-endpoint]]
- [[jwt-token-validation]]
- [[rate-limiting-strategy]]
```

#### Architecture Decisions
```markdown
# ADR-001: Database Choice

**Status**: Accepted
**Date**: 2024-01-15
**Deciders**: Tech Team

## Context
We need to choose a database for our new microservice.

## Decision
We will use PostgreSQL for the following reasons:
- ACID compliance requirements
- Complex query needs
- Team expertise
- Proven scalability

## Consequences
**Positive**:
- Strong consistency guarantees
- Rich query capabilities
- Excellent tooling ecosystem

**Negative**:
- Higher operational complexity
- Vertical scaling limitations

## Related Decisions
- [[adr-002-caching-strategy]]
- [[adr-003-backup-strategy]]
```

## Integration with External Tools

### Version Control Integration
Connect DevNotes with Git workflows:

#### Git Hooks
```bash
#!/bin/bash
# Pre-commit hook to export DevNotes
devnotes export --format=markdown --output=docs/
git add docs/
```

#### Documentation Sync
```bash
# Sync DevNotes with documentation site
devnotes export --format=hugo --output=content/docs/
hugo build
```

### API Integration
Use DevNotes API for custom integrations:

```javascript
// Auto-create meeting notes from calendar
calendar.onMeetingScheduled(async (meeting) => {
  const template = await devnotes.getTemplate('meeting-notes');
  const note = template.fill({
    title: meeting.title,
    attendees: meeting.attendees.join(', '),
    date: meeting.date
  });
  await devnotes.createNote(note);
});
```

### Backup Automation
Automate backups with external services:

```bash
#!/bin/bash
# Daily backup script
DATE=$(date +%Y%m%d)
devnotes export --format=json --output=/tmp/backup-$DATE.json
aws s3 cp /tmp/backup-$DATE.json s3://my-backups/devnotes/
```

## Advanced Customization

### Custom Themes
Create custom themes for DevNotes:

```css
/* Custom dark theme */
:root {
  --bg-primary: #1a1a1a;
  --bg-secondary: #2d2d2d;
  --text-primary: #ffffff;
  --text-secondary: #cccccc;
  --accent: #007acc;
}

.editor {
  background: var(--bg-primary);
  color: var(--text-primary);
}

.sidebar {
  background: var(--bg-secondary);
  border-right: 1px solid var(--accent);
}
```

### Custom Plugins
Extend DevNotes functionality:

```javascript
// Custom word count plugin
class WordCountPlugin {
  constructor() {
    this.name = 'Word Count';
    this.version = '1.0.0';
  }
  
  onNoteChange(note) {
    const wordCount = note.content.split(/\s+/).length;
    this.updateStatusBar(`Words: ${wordCount}`);
  }
  
  updateStatusBar(text) {
    document.getElementById('word-count').textContent = text;
  }
}

// Register plugin
devnotes.plugins.register(new WordCountPlugin());
```

## Troubleshooting Advanced Issues

### Performance Problems
Diagnose and fix performance issues:

#### Memory Leaks
```javascript
// Monitor memory usage
setInterval(() => {
  const memory = performance.memory;
  console.log(`Used: ${memory.usedJSHeapSize / 1024 / 1024}MB`);
  console.log(`Total: ${memory.totalJSHeapSize / 1024 / 1024}MB`);
}, 5000);
```

#### Slow Search
- **Rebuild search index** in settings
- **Clear search cache** and restart
- **Reduce search scope** with filters
- **Check for corrupted notes**

### Data Recovery
Recover from data corruption or loss:

#### Backup Restoration
```bash
# Restore from backup
devnotes import --format=json --file=backup-20240115.json --merge
```

#### Partial Recovery
```javascript
// Recover specific notes
const corruptedNotes = devnotes.findCorrupted();
corruptedNotes.forEach(note => {
  const backup = findBackupVersion(note.id);
  if (backup) {
    note.restore(backup);
  }
});
```

## Next Steps

- **[Explore customization options](advanced/customization)** - Personalize DevNotes
- **[Learn data management](advanced/data-management)** - Advanced data handling
- **[Check troubleshooting guide](troubleshooting/common-issues)** - Solve common problems

These power user techniques will transform how you use DevNotes. Start with the workflows that match your needs and gradually incorporate more advanced techniques as you grow more comfortable with the system.