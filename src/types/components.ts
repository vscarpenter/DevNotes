/**
 * Component prop types and UI-related interfaces
 * Requirements: 1.1, 1.2, 1.3
 */

import { ReactNode } from 'react';
import { Note, Folder } from './note';
import { SearchResult } from './search';

// Base component props
export interface BaseComponentProps {
  className?: string;
  children?: ReactNode;
}

// Layout component props
export interface AppLayoutProps extends BaseComponentProps {
  sidebarWidth: number;
  onSidebarResize: (width: number) => void;
}

export interface SidebarProps extends BaseComponentProps {
  width: number;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  onResize: (width: number) => void;
}

export interface MainPanelProps extends BaseComponentProps {
  selectedNote: Note | null;
  isPreviewMode: boolean;
  onTogglePreview: () => void;
}

// Navigation component props
export interface FolderTreeProps extends BaseComponentProps {
  folders: Record<string, Folder>;
  selectedFolderId: string | null;
  onFolderSelect: (folderId: string) => void;
  onFolderCreate: (parentId: string | null, name: string) => void;
  onFolderRename: (folderId: string, name: string) => void;
  onFolderDelete: (folderId: string) => void;
  onFolderMove: (folderId: string, targetParentId: string | null) => void;
}

export interface NoteListProps extends BaseComponentProps {
  notes: Note[];
  selectedNoteId: string | null;
  onNoteSelect: (noteId: string) => void;
  onNoteCreate: (folderId: string, title?: string) => void;
  onNoteDelete: (noteId: string) => void;
  onNoteMove: (noteId: string, targetFolderId: string) => void;
}

// Editor component props
export interface MarkdownEditorProps extends BaseComponentProps {
  content: string;
  onChange: (content: string) => void;
  onSave?: () => void;
  autoSave?: boolean;
  readOnly?: boolean;
}

export interface PreviewPaneProps extends BaseComponentProps {
  content: string;
  onScroll?: (scrollTop: number) => void;
}

export interface EditorToolbarProps extends BaseComponentProps {
  onFormat: (format: MarkdownFormat) => void;
  onInsert: (element: MarkdownElement) => void;
  isPreviewMode: boolean;
  onTogglePreview: () => void;
  wordCount: number;
  readingTime: number;
}

// Search component props
export interface SearchInterfaceProps extends BaseComponentProps {
  query: string;
  results: SearchResult[];
  isSearching: boolean;
  onSearch: (query: string) => void;
  onResultSelect: (noteId: string) => void;
  onClearSearch: () => void;
}

// Modal component props
export interface ModalProps extends BaseComponentProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export interface ExportModalProps extends ModalProps {
  selectedNotes: string[];
  onExport: (format: ExportFormat, options: ExportOptions) => void;
}

export interface ImportModalProps extends ModalProps {
  onImport: (file: File) => void;
}

// Drag and drop types
export interface DragItem {
  type: 'note' | 'folder';
  id: string;
  data: Note | Folder;
}

export interface DropTarget {
  type: 'folder' | 'trash';
  id: string;
  accepts: ('note' | 'folder')[];
}

// Utility types for component props
export type MarkdownFormat = 'bold' | 'italic' | 'strikethrough' | 'code' | 'heading1' | 'heading2' | 'heading3';
export type MarkdownElement = 'link' | 'image' | 'table' | 'codeblock' | 'quote' | 'list' | 'math' | 'diagram';
export type ExportFormat = 'markdown' | 'html' | 'json' | 'zip';

export interface ExportOptions {
  includeMetadata: boolean;
  includeAttachments: boolean;
  format: ExportFormat;
}