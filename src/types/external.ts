/**
 * Type definitions for external libraries
 * Requirements: 4.1, 4.6, 4.7
 */

// Re-export CodeMirror types
export type { EditorState, Transaction, ChangeSet } from '@codemirror/state';
export type { EditorView, ViewUpdate } from '@codemirror/view';

// Additional type definitions for libraries that may not have complete types
export interface KatexOptions {
  displayMode?: boolean;
  throwOnError?: boolean;
  errorColor?: string;
  macros?: Record<string, string>;
}

export interface MermaidConfig {
  theme?: 'default' | 'dark' | 'forest' | 'neutral';
  startOnLoad?: boolean;
  securityLevel?: 'strict' | 'loose' | 'antiscript' | 'sandbox';
}

export interface PrismGrammar {
  [key: string]: any;
}

export interface UnifiedProcessor {
  use(plugin: any, options?: any): UnifiedProcessor;
  process(value: string): Promise<UnifiedVFile>;
  processSync(value: string): UnifiedVFile;
}

export interface UnifiedVFile {
  contents: string;
  data: Record<string, any>;
  messages: any[];
}

// React DnD types (if used for drag and drop)
export interface DragSourceMonitor {
  isDragging(): boolean;
  getDropResult(): any;
}

export interface DropTargetMonitor {
  isOver(): boolean;
  canDrop(): boolean;
  getItem(): any;
}