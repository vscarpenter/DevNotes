/**
 * Markdown Editor Component using CodeMirror 6
 * Provides real-time syntax highlighting, toolbar, and auto-save functionality
 * Requirements: 4.1, 4.4, 7.1, 7.2
 */

import React, { useEffect, useRef, useCallback } from 'react';
import { EditorView, keymap } from '@codemirror/view';
import { EditorState } from '@codemirror/state';
import { markdown } from '@codemirror/lang-markdown';
import { oneDark } from '@codemirror/theme-one-dark';
import { defaultKeymap, indentWithTab } from '@codemirror/commands';
import { basicSetup } from 'codemirror';
import { useNoteStore } from '../../stores/noteStore';
import { useUIStore } from '../../stores/uiStore';
import { useAutoSave } from '../../hooks/useAutoSave';
import { EditorToolbar } from './EditorToolbar';

interface MarkdownEditorProps {
  noteId: string;
  className?: string;
  onScroll?: (scrollTop: number, scrollHeight: number) => void;
}

export const MarkdownEditor: React.FC<MarkdownEditorProps> = ({ 
  noteId, 
  className = '',
  onScroll
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const { getNote, updateNote } = useNoteStore();
  const { 
    isDarkMode, 
    showLineNumbers, 
    wordWrap, 
    fontSize,
    setSaveStatus,
    setCursorPosition,
    setSelectionInfo
  } = useUIStore();
  
  const note = getNote(noteId);
  
  // Auto-save hook with 500ms debounce
  const { scheduleAutoSave, forceSave } = useAutoSave({
    onSave: async (content: string) => {
      setSaveStatus('saving');
      try {
        await updateNote(noteId, { content });
        setSaveStatus('saved');
      } catch (error) {
        setSaveStatus('error');
        console.error('Auto-save failed:', error);
      }
    },
    delay: 500
  });



  // Insert formatting helper
  const insertFormatting = useCallback((before: string, after: string) => {
    const view = viewRef.current;
    if (!view) return;

    const { from, to } = view.state.selection.main;
    const selectedText = view.state.doc.sliceString(from, to);
    
    const replacement = `${before}${selectedText}${after}`;
    
    view.dispatch({
      changes: { from, to, insert: replacement },
      selection: { 
        anchor: from + before.length, 
        head: from + before.length + selectedText.length 
      }
    });
    
    view.focus();
  }, []);

  // Handle content changes
  const handleContentChange = useCallback((content: string) => {
    scheduleAutoSave(content);
  }, [scheduleAutoSave]);

  // Create editor extensions
  const createExtensions = useCallback(() => {
    const extensions = [
      basicSetup,
      markdown(),
    ];

    // Add keyboard shortcuts
    extensions.push(keymap.of([
      ...defaultKeymap,
      indentWithTab,
      // Custom keyboard shortcuts
      {
        key: 'Ctrl-b',
        mac: 'Cmd-b',
        run: () => {
          insertFormatting('**', '**');
          return true;
        }
      },
      {
        key: 'Ctrl-i',
        mac: 'Cmd-i',
        run: () => {
          insertFormatting('*', '*');
          return true;
        }
      },
      {
        key: 'Ctrl-k',
        mac: 'Cmd-k',
        run: () => {
          insertFormatting('[', '](url)');
          return true;
        }
      },
      {
        key: 'Ctrl-s',
        mac: 'Cmd-s',
        run: () => {
          forceSave();
          return true;
        }
      }
    ]));

    // Add update listener
    extensions.push(EditorView.updateListener.of((update) => {
      if (update.docChanged) {
        const content = update.state.doc.toString();
        handleContentChange(content);
      }
      
      // Update cursor position and selection info
      if (update.selectionSet || update.docChanged) {
        const { from, to } = update.state.selection.main;
        const doc = update.state.doc;
        const line = doc.lineAt(from);
        const column = from - line.from + 1;
        
        setCursorPosition({ 
          line: line.number, 
          column 
        });
        
        setSelectionInfo({
          hasSelection: from !== to,
          selectedLength: to - from
        });
      }
    }));

    // Add scroll tracking if onScroll is provided
    if (onScroll) {
      extensions.push(EditorView.domEventHandlers({
        scroll: (event: Event) => {
          const target = event.target as HTMLElement;
          if (target.classList.contains('cm-scroller')) {
            onScroll(target.scrollTop, target.scrollHeight);
          }
        }
      }));
    }

    // Add theme
    extensions.push(EditorView.theme({
      '&': {
        fontSize: `${fontSize}px`,
        fontFamily: 'Geist Mono, monospace',
        height: '100%'
      },
      '.cm-editor': {
        height: '100%'
      },
      '.cm-scroller': {
        fontFamily: 'Geist Mono, monospace',
        lineHeight: '1.5',
        overflow: 'auto'
      },
      '.cm-content': {
        padding: '16px',
        minHeight: '100%',
        cursor: 'text'
      },
      '.cm-focused': {
        outline: 'none'
      },
      '&.cm-editor.cm-focused': {
        outline: 'none'
      }
    }));

    // Add line wrapping
    if (wordWrap) {
      extensions.push(EditorView.lineWrapping);
    }

    // Add dark theme if enabled
    if (isDarkMode) {
      extensions.push(oneDark);
    }

    return extensions;
  }, [isDarkMode, showLineNumbers, wordWrap, fontSize, handleContentChange, forceSave, insertFormatting, setCursorPosition, setSelectionInfo, onScroll]);

  // Toolbar action handlers
  const handleBold = useCallback(() => insertFormatting('**', '**'), [insertFormatting]);
  const handleItalic = useCallback(() => insertFormatting('*', '*'), [insertFormatting]);
  const handleHeading = useCallback((level: number) => {
    const prefix = '#'.repeat(level) + ' ';
    insertFormatting(prefix, '');
  }, [insertFormatting]);
  const handleLink = useCallback(() => insertFormatting('[', '](url)'), [insertFormatting]);
  const handleCode = useCallback(() => insertFormatting('`', '`'), [insertFormatting]);
  const handleCodeBlock = useCallback(() => insertFormatting('```\n', '\n```'), [insertFormatting]);
  
  // Math and diagram handlers
  const handleMath = useCallback(() => insertFormatting('$', '$'), [insertFormatting]);
  const handleMathBlock = useCallback(() => insertFormatting('$$\n', '\n$$'), [insertFormatting]);
  const handleMermaid = useCallback(() => {
    const template = 'graph TD\n    A[Start] --> B[Process]\n    B --> C[End]';
    insertFormatting('```mermaid\n', `\n${template}\n\`\`\``);
  }, [insertFormatting]);

  // Initialize editor
  useEffect(() => {
    if (!editorRef.current || !note) return;

    // Clear any existing content
    editorRef.current.innerHTML = '';

    const state = EditorState.create({
      doc: note.content,
      extensions: createExtensions()
    });

    const view = new EditorView({
      state,
      parent: editorRef.current
    });

    viewRef.current = view;

    // Focus the editor after a short delay to ensure it's fully rendered
    setTimeout(() => {
      if (view && !view.dom.querySelector('.cm-focused')) {
        view.focus();
      }
    }, 100);

    return () => {
      if (view) {
        view.destroy();
      }
      viewRef.current = null;
    };
  }, [note?.id, createExtensions, note]);

  // Update editor when note content changes externally
  useEffect(() => {
    const view = viewRef.current;
    if (!view || !note) return;

    const currentContent = view.state.doc.toString();
    if (currentContent !== note.content) {
      view.dispatch({
        changes: {
          from: 0,
          to: view.state.doc.length,
          insert: note.content
        }
      });
    }
  }, [note?.content, note]);

  // Recreate editor when settings change
  useEffect(() => {
    const view = viewRef.current;
    if (!view || !note) return;

    // Destroy and recreate the editor with new extensions
    view.destroy();
    
    const state = EditorState.create({
      doc: note.content,
      extensions: createExtensions()
    });

    const newView = new EditorView({
      state,
      parent: editorRef.current!
    });

    viewRef.current = newView;
  }, [isDarkMode, showLineNumbers, wordWrap, fontSize, createExtensions, note]);

  if (!note) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        Select a note to start editing
      </div>
    );
  }

  return (
    <div className={`flex flex-col h-full ${className}`}>
      <EditorToolbar
        onBold={handleBold}
        onItalic={handleItalic}
        onHeading={handleHeading}
        onLink={handleLink}
        onCode={handleCode}
        onCodeBlock={handleCodeBlock}
        onMath={handleMath}
        onMathBlock={handleMathBlock}
        onMermaid={handleMermaid}
        onSave={forceSave}
      />
      <div 
        ref={editorRef} 
        className="flex-1 border-t border-border"
        data-testid="markdown-editor"
        style={{ height: '100%', minHeight: '200px' }}
      />
    </div>
  );
};