/**
 * Preview Demo Component
 * Demonstrates the markdown preview functionality
 * This is for testing and demonstration purposes
 */

import React, { useState } from 'react';
import { SplitView } from './SplitView';
import { useNoteStore } from '../../stores/noteStore';
import { useUIStore } from '../../stores/uiStore';

const sampleMarkdown = `# DevNotes Preview Demo

This is a demonstration of the markdown preview functionality.

## Features

### Text Formatting
- **Bold text** and *italic text*
- \`inline code\` and code blocks
- ~~strikethrough~~ text

### Code Blocks

\`\`\`javascript
// JavaScript example
const greeting = "Hello, World!";
console.log(greeting);

function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}
\`\`\`

\`\`\`python
# Python example
def hello_world():
    print("Hello from Python!")
    
for i in range(5):
    print(f"Count: {i}")
\`\`\`

### Tables

| Feature | Status | Priority |
|---------|--------|----------|
| Markdown Preview | ✅ Complete | High |
| Syntax Highlighting | ✅ Complete | High |
| Split View | ✅ Complete | Medium |
| Synchronized Scrolling | ✅ Complete | Medium |

### Lists

#### Unordered List
- First item
- Second item
  - Nested item
  - Another nested item
- Third item

#### Ordered List
1. First step
2. Second step
3. Third step

#### Task List
- [x] Implement PreviewPane component
- [x] Add syntax highlighting
- [x] Create SplitView component
- [x] Add synchronized scrolling
- [ ] Add math expression support (future)
- [ ] Add diagram support (future)

### Blockquotes

> This is a blockquote example.
> It can span multiple lines and provides
> a nice way to highlight important information.

### Links and Images

Check out the [DevNotes repository](https://github.com/example/devnotes) for more information.

### Horizontal Rule

---

## Technical Implementation

The preview functionality uses:
- **unified.js** for markdown processing
- **remark-gfm** for GitHub Flavored Markdown
- **rehype-highlight** for syntax highlighting
- **React** for component architecture

### Performance Notes

The preview updates in real-time as you type, with efficient rendering and minimal re-processing of unchanged content.
`;

export const PreviewDemo: React.FC = () => {
  const { createNote, notes } = useNoteStore();
  const { setPanelLayout } = useUIStore();
  const [demoNoteId, setDemoNoteId] = useState<string | null>(null);

  React.useEffect(() => {
    // Create a demo note if it doesn't exist
    const createDemoNote = async () => {
      try {
        const noteId = await createNote('root', 'Preview Demo');
        // Update the note with sample content
        const noteStore = useNoteStore.getState();
        await noteStore.updateNote(noteId, { content: sampleMarkdown });
        setDemoNoteId(noteId);
        setPanelLayout('split'); // Start in split view
      } catch (error) {
        console.error('Failed to create demo note:', error);
      }
    };

    createDemoNote();
  }, [createNote, setPanelLayout]);

  if (!demoNoteId) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading preview demo...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full">
      <SplitView noteId={demoNoteId} />
    </div>
  );
};