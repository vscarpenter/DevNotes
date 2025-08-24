/**
 * Markdown Editor Component using CodeMirror 6
 * Provides real-time syntax highlighting, toolbar, and auto-save functionality
 * Requirements: 4.1, 4.4, 7.1, 7.2
 */

import React, { useEffect, useRef, useCallback } from 'react';
import { EditorView, keymap, ViewUpdate } from '@codemirror/view';
import { EditorState, StateEffect } from '@codemirror/state';
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
  const isFirstRender = useRef(true);
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
  
  const setCursorPositionRef = useRef(setCursorPosition);
  const setSelectionInfoRef = useRef(setSelectionInfo);
  
  // Update refs when functions change
  useEffect(() => {
    setCursorPositionRef.current = setCursorPosition;
    setSelectionInfoRef.current = setSelectionInfo;
  }, [setCursorPosition, setSelectionInfo]);
  
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
        
        setCursorPositionRef.current({
          line: line.number, 
          column 
        });
        
        setSelectionInfoRef.current({
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
          if (target && target.classList && target.classList.contains('cm-scroller')) {
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
  }, [isDarkMode, showLineNumbers, wordWrap, fontSize, handleContentChange, forceSave, insertFormatting, onScroll]);

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
  
  // List handlers
  const handleBulletList = useCallback(() => {
    const view = viewRef.current;
    if (!view) return;

    const { from } = view.state.selection.main;
    const line = view.state.doc.lineAt(from);
    const lineStart = line.from;
    
    // Insert bullet point at the beginning of the line
    view.dispatch({
      changes: { from: lineStart, to: lineStart, insert: '- ' },
      selection: { anchor: from + 2, head: from + 2 }
    });
    
    view.focus();
  }, []);

  const handleNumberedList = useCallback(() => {
    const view = viewRef.current;
    if (!view) return;

    const { from } = view.state.selection.main;
    const line = view.state.doc.lineAt(from);
    const lineStart = line.from;
    
    // Insert numbered list item at the beginning of the line
    view.dispatch({
      changes: { from: lineStart, to: lineStart, insert: '1. ' },
      selection: { anchor: from + 3, head: from + 3 }
    });
    
    view.focus();
  }, []);

  // Initialize editor and handle note switches
  useEffect(() => {
    if (!editorRef.current) return;

    const note = getNote(noteId);
    if (!note) {
      if (viewRef.current) {
        viewRef.current.destroy();
        viewRef.current = null;
      }
      return;
    }

    // Clear the container before creating a new editor
    editorRef.current.innerHTML = '';

    const state = EditorState.create({
      doc: note.content,
      extensions: createExtensions(),
    });

    const view = new EditorView({
      state,
      parent: editorRef.current,
    });

    viewRef.current = view;
    
    setTimeout(() => view.focus(), 100);

    return () => {
      if (viewRef.current) {
        viewRef.current.destroy();
        viewRef.current = null;
      }
    };
  }, [noteId]);

  // Update editor content when it changes externally
  useEffect(() => {
    const view = viewRef.current;
    const note = getNote(noteId);
    if (!view || !note) return;

    const currentContent = view.state.doc.toString();
    if (currentContent !== note.content) {
      view.dispatch({
        changes: {
          from: 0,
          to: view.state.doc.length,
          insert: note.content,
        },
      });
    }
  }, [note?.content]);

  // Update editor configuration when settings change
  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;

    view.dispatch({
      effects: StateEffect.reconfigure.of(createExtensions()),
    });
  }, [isDarkMode, showLineNumbers, wordWrap, fontSize, createExtensions]);

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
        onBulletList={handleBulletList}
        onNumberedList={handleNumberedList}
        onSave={forceSave}
      />
      <div 
        ref={editorRef} 
        className="flex-1 border-t border-border"
        data-testid="markdown-editor"
        style={{ height: '100%', minHeight: '200px' }}
        onClick={() => {
          // Ensure editor gets focus when clicked
          if (viewRef.current) {
            viewRef.current.focus();
          }
        }}
      />
    </div>
  );
};
