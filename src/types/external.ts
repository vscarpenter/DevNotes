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
  [key: string]: RegExp | string | PrismGrammar | Array<RegExp | string | PrismGrammar>;
}

export interface UnifiedPlugin {
  (options?: Record<string, unknown>): void;
}

export interface UnifiedProcessor {
  use(plugin: UnifiedPlugin, options?: Record<string, unknown>): UnifiedProcessor;
  process(value: string): Promise<UnifiedVFile>;
  processSync(value: string): UnifiedVFile;
}

export interface UnifiedMessage {
  message: string;
  line?: number;
  column?: number;
  source?: string;
  ruleId?: string;
  fatal?: boolean;
}

export interface UnifiedVFile {
  contents: string;
  data: Record<string, unknown>;
  messages: UnifiedMessage[];
}

// React DnD types (if used for drag and drop)
export interface DragSourceMonitor {
  isDragging(): boolean;
  getDropResult(): Record<string, unknown> | null;
}

export interface DropTargetMonitor {
  isOver(): boolean;
  canDrop(): boolean;
  getItem(): Record<string, unknown> | null;
}