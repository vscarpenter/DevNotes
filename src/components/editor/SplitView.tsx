/**
 * Split View Component
 * Handles editor/preview layout with synchronized scrolling
 * Requirements: 4.3, 4.5
 */

import React, { useRef, useCallback, useState, useEffect } from 'react';
import { MarkdownEditor } from './MarkdownEditor';
import { PreviewPane } from './PreviewPane';
import { useUIStore } from '../../stores/uiStore';
import { useNoteStore } from '../../stores/noteStore';
import { Button } from '../ui/button';
import { Eye, Edit, Split } from 'lucide-react';

interface SplitViewProps {
  noteId: string;
  className?: string;
}

export const SplitView: React.FC<SplitViewProps> = ({
  noteId,
  className = ''
}) => {
  const { panelLayout, setPanelLayout } = useUIStore();
  const { getNote } = useNoteStore();
  const [isScrollSyncing, setIsScrollSyncing] = useState(true);
  
  const editorRef = useRef<HTMLDivElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  
  const note = getNote(noteId);

  // Handle synchronized scrolling from editor to preview
  const handleEditorScroll = useCallback((scrollTop: number, scrollHeight: number) => {
    if (!isScrollSyncing || !previewRef.current || !editorRef.current) return;
    
    const editorClientHeight = editorRef.current.clientHeight || 1;
    const scrollRatio = scrollTop / (scrollHeight - editorClientHeight);
    const previewScrollHeight = previewRef.current.scrollHeight;
    const previewClientHeight = previewRef.current.clientHeight;
    const targetScrollTop = scrollRatio * (previewScrollHeight - previewClientHeight);
    
    previewRef.current.scrollTop = Math.max(0, targetScrollTop);
  }, [isScrollSyncing]);

  // Handle synchronized scrolling from preview to editor
  const handlePreviewScroll = useCallback((scrollTop: number, scrollHeight: number) => {
    if (!isScrollSyncing || !editorRef.current || !previewRef.current) return;
    
    const previewClientHeight = previewRef.current.clientHeight || 1;
    const scrollRatio = scrollTop / (scrollHeight - previewClientHeight);
    const editorScrollHeight = editorRef.current.scrollHeight;
    const editorClientHeight = editorRef.current.clientHeight;
    const targetScrollTop = scrollRatio * (editorScrollHeight - editorClientHeight);
    
    editorRef.current.scrollTop = Math.max(0, targetScrollTop);
  }, [isScrollSyncing]);

  // Toggle scroll synchronization
  const toggleScrollSync = useCallback(() => {
    setIsScrollSyncing(prev => !prev);
  }, []);

  if (!note) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        Select a note to start editing
      </div>
    );
  }

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* View mode toolbar */}
      <div className="flex items-center justify-between p-2 border-b border-border bg-background">
        <div className="flex items-center gap-1">
          <Button
            variant={panelLayout === 'editor-only' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setPanelLayout('editor-only')}
            title="Editor Only"
            className="h-8 px-3"
          >
            <Edit className="h-4 w-4 mr-1" />
            Edit
          </Button>
          
          <Button
            variant={panelLayout === 'split' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setPanelLayout('split')}
            title="Split View"
            className="h-8 px-3"
          >
            <Split className="h-4 w-4 mr-1" />
            Split
          </Button>
          
          <Button
            variant={panelLayout === 'preview-only' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setPanelLayout('preview-only')}
            title="Preview Only"
            className="h-8 px-3"
          >
            <Eye className="h-4 w-4 mr-1" />
            Preview
          </Button>
        </div>

        {panelLayout === 'split' && (
          <div className="flex items-center gap-2">
            <Button
              variant={isScrollSyncing ? 'default' : 'ghost'}
              size="sm"
              onClick={toggleScrollSync}
              title="Toggle Scroll Synchronization"
              className="h-8 px-3 text-xs"
            >
              Sync Scroll
            </Button>
          </div>
        )}
      </div>

      {/* Content area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Editor panel */}
        {(panelLayout === 'editor-only' || panelLayout === 'split') && (
          <div 
            ref={editorRef}
            className={`
              ${panelLayout === 'split' ? 'w-1/2 border-r border-border' : 'w-full'}
              overflow-hidden
            `}
          >
            <MarkdownEditor 
              noteId={noteId}
              className="h-full"
            />
          </div>
        )}

        {/* Preview panel */}
        {(panelLayout === 'preview-only' || panelLayout === 'split') && (
          <div 
            ref={previewRef}
            className={`
              ${panelLayout === 'split' ? 'w-1/2' : 'w-full'}
              overflow-hidden
            `}
          >
            <PreviewPane
              content={note.content}
              className="h-full"
              onScroll={handlePreviewScroll}
            />
          </div>
        )}
      </div>
    </div>
  );
};