/**
 * Drag and drop type definitions
 * Requirements: 6.1, 6.2, 6.3, 6.4, 6.5
 */

export type DragType = 'note' | 'folder';

export interface DragData {
  type: DragType;
  id: string;
  sourceId?: string; // For tracking source folder/parent
}

export interface DragState {
  isDragging: boolean;
  dragType: DragType | null;
  dragId: string | null;
  dragData: DragData | null;
  dropTargetId: string | null;
  dropTargetType: DragType | null;
  isValidDropTarget: boolean;
}

export interface DropZoneState {
  isOver: boolean;
  canDrop: boolean;
  dropEffect: 'move' | 'copy' | 'none';
}

export interface DragOperation {
  id: string;
  type: DragType;
  sourceId: string;
  targetId: string;
  timestamp: Date;
}

export interface BatchDragOperation {
  operations: DragOperation[];
  timestamp: Date;
}

// Drag and drop event handlers
export interface DragHandlers {
  onDragStart: (data: DragData, event: React.DragEvent) => void;
  onDragEnd: (event: React.DragEvent) => void;
  onDragOver: (event: React.DragEvent) => void;
  onDragEnter: (event: React.DragEvent) => void;
  onDragLeave: (event: React.DragEvent) => void;
  onDrop: (event: React.DragEvent) => void;
}

// Drop zone configuration
export interface DropZoneConfig {
  acceptedTypes: DragType[];
  canDrop?: (dragData: DragData) => boolean;
  onDrop?: (dragData: DragData) => Promise<void>;
  className?: string;
  activeClassName?: string;
  invalidClassName?: string;
}

// Visual feedback configuration
export interface DragVisualConfig {
  showDropZones: boolean;
  highlightValidTargets: boolean;
  showDragPreview: boolean;
  animateDrop: boolean;
}

// Undo/redo operation types
export interface UndoableOperation {
  id: string;
  type: 'move_note' | 'move_folder' | 'batch_move';
  description: string;
  undo: () => Promise<void>;
  redo: () => Promise<void>;
  timestamp: Date;
}