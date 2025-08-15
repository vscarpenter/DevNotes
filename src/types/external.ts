/**
 * Type definitions for external libraries
 * Requirements: 4.1, 4.6, 4.7
 */

// CodeMirror 6 types
declare module '@codemirror/state' {
  export interface EditorState {
    doc: Text;
    selection: EditorSelection;
  }
  
  export interface EditorSelection {
    main: SelectionRange;
    ranges: readonly SelectionRange[];
  }
  
  export interface SelectionRange {
    from: number;
    to: number;
    anchor: number;
    head: number;
  }
}

declare module '@codemirror/view' {
  export interface EditorView {
    state: EditorState;
    dispatch: (transaction: Transaction) => void;
    dom: HTMLElement;
  }
  
  export interface ViewUpdate {
    state: EditorState;
    changes: ChangeSet;
    docChanged: boolean;
  }
}

// Dexie types extension
declare module 'dexie' {
  export interface Table<T = any, TKey = any> {
    bulkAdd(items: T[]): Promise<TKey[]>;
    bulkPut(items: T[]): Promise<TKey[]>;
    bulkDelete(keys: TKey[]): Promise<void>;
  }
}

// KaTeX types
declare module 'katex' {
  export interface KatexOptions {
    displayMode?: boolean;
    throwOnError?: boolean;
    errorColor?: string;
    macros?: Record<string, string>;
  }
  
  export function render(tex: string, element: HTMLElement, options?: KatexOptions): void;
  export function renderToString(tex: string, options?: KatexOptions): string;
}

// Mermaid types
declare module 'mermaid' {
  export interface MermaidConfig {
    theme?: 'default' | 'dark' | 'forest' | 'neutral';
    startOnLoad?: boolean;
    securityLevel?: 'strict' | 'loose' | 'antiscript' | 'sandbox';
  }
  
  export function initialize(config: MermaidConfig): void;
  export function render(id: string, definition: string): Promise<string>;
}

// Prism.js types
declare module 'prismjs' {
  export interface Grammar {
    [key: string]: any;
  }
  
  export interface LanguageDefinition {
    [key: string]: any;
  }
  
  export const languages: Record<string, Grammar>;
  export function highlight(text: string, grammar: Grammar, language: string): string;
  export function highlightAll(): void;
}

// Unified.js ecosystem types
declare module 'unified' {
  export interface Processor {
    use(plugin: any, options?: any): Processor;
    process(value: string): Promise<VFile>;
    processSync(value: string): VFile;
  }
  
  export interface VFile {
    contents: string;
    data: Record<string, any>;
    messages: any[];
  }
}

// React DnD types (if used for drag and drop)
declare module 'react-dnd' {
  export interface DragSourceMonitor {
    isDragging(): boolean;
    getDropResult(): any;
  }
  
  export interface DropTargetMonitor {
    isOver(): boolean;
    canDrop(): boolean;
    getItem(): any;
  }
}