/**
 * DragDropManager - Central service for handling drag and drop operations
 * Requirements: 6.1, 6.2, 6.3, 6.4, 6.5
 */

import { 
  DragData, 
  DragState, 
  DragOperation, 
  BatchDragOperation,
  UndoableOperation,
  DragType 
} from '../../types/dragdrop';

export class DragDropManager {
  private static instance: DragDropManager;
  private dragState: DragState;
  private operationHistory: UndoableOperation[] = [];
  private currentHistoryIndex: number = -1;
  private maxHistorySize: number = 50;
  private listeners: Map<string, (state: DragState) => void> = new Map();

  private constructor() {
    this.dragState = {
      isDragging: false,
      dragType: null,
      dragId: null,
      dragData: null,
      dropTargetId: null,
      dropTargetType: null,
      isValidDropTarget: false
    };
  }

  public static getInstance(): DragDropManager {
    if (!DragDropManager.instance) {
      DragDropManager.instance = new DragDropManager();
    }
    return DragDropManager.instance;
  }

  // State management
  public getDragState(): DragState {
    return { ...this.dragState };
  }

  public subscribe(id: string, callback: (state: DragState) => void): () => void {
    this.listeners.set(id, callback);
    return () => this.listeners.delete(id);
  }

  private notifyListeners(): void {
    this.listeners.forEach(callback => callback(this.getDragState()));
  }

  // Drag operations
  public startDrag(data: DragData): void {
    this.dragState = {
      isDragging: true,
      dragType: data.type,
      dragId: data.id,
      dragData: data,
      dropTargetId: null,
      dropTargetType: null,
      isValidDropTarget: false
    };
    this.notifyListeners();
  }

  public endDrag(): void {
    this.dragState = {
      isDragging: false,
      dragType: null,
      dragId: null,
      dragData: null,
      dropTargetId: null,
      dropTargetType: null,
      isValidDropTarget: false
    };
    this.notifyListeners();
  }

  public updateDropTarget(targetId: string | null, targetType: DragType | null, isValid: boolean): void {
    this.dragState = {
      ...this.dragState,
      dropTargetId: targetId,
      dropTargetType: targetType,
      isValidDropTarget: isValid
    };
    this.notifyListeners();
  }

  // Validation logic
  public canDrop(dragData: DragData, targetId: string, targetType: DragType): boolean {
    if (!dragData) return false;

    // Can't drop on itself
    if (dragData.id === targetId) return false;

    switch (dragData.type) {
      case 'note':
        // Notes can only be dropped on folders
        return targetType === 'folder';
      
      case 'folder':
        // Folders can be dropped on other folders (to become children)
        if (targetType === 'folder') {
          // Prevent dropping a folder into its own descendants
          return !this.isDescendantOf(targetId, dragData.id);
        }
        return false;
      
      default:
        return false;
    }
  }

  // Helper method to check if a folder is a descendant of another
  private isDescendantOf(folderId: string, potentialAncestorId: string): boolean {
    // This would need to be implemented with actual folder hierarchy data
    // For now, we'll return false and implement this in the store integration
    return false;
  }

  // Batch operations
  public createBatchOperation(operations: DragOperation[]): BatchDragOperation {
    return {
      operations,
      timestamp: new Date()
    };
  }

  // Undo/Redo functionality
  public addToHistory(operation: UndoableOperation): void {
    // Remove any operations after current index (when undoing then doing new operation)
    this.operationHistory = this.operationHistory.slice(0, this.currentHistoryIndex + 1);
    
    // Add new operation
    this.operationHistory.push(operation);
    this.currentHistoryIndex++;
    
    // Limit history size
    if (this.operationHistory.length > this.maxHistorySize) {
      this.operationHistory.shift();
      this.currentHistoryIndex--;
    }
  }

  public canUndo(): boolean {
    return this.currentHistoryIndex >= 0;
  }

  public canRedo(): boolean {
    return this.currentHistoryIndex < this.operationHistory.length - 1;
  }

  public async undo(): Promise<void> {
    if (!this.canUndo()) return;
    
    const operation = this.operationHistory[this.currentHistoryIndex];
    await operation.undo();
    this.currentHistoryIndex--;
  }

  public async redo(): Promise<void> {
    if (!this.canRedo()) return;
    
    this.currentHistoryIndex++;
    const operation = this.operationHistory[this.currentHistoryIndex];
    await operation.redo();
  }

  public getUndoDescription(): string | null {
    if (!this.canUndo()) return null;
    return this.operationHistory[this.currentHistoryIndex].description;
  }

  public getRedoDescription(): string | null {
    if (!this.canRedo()) return null;
    return this.operationHistory[this.currentHistoryIndex + 1].description;
  }

  public clearHistory(): void {
    this.operationHistory = [];
    this.currentHistoryIndex = -1;
  }

  // Utility methods for creating drag data
  public createNoteDragData(noteId: string, sourceFolderId: string): DragData {
    return {
      type: 'note',
      id: noteId,
      sourceId: sourceFolderId
    };
  }

  public createFolderDragData(folderId: string, sourceParentId: string | null): DragData {
    return {
      type: 'folder',
      id: folderId,
      sourceId: sourceParentId || 'root'
    };
  }

  // Visual feedback helpers
  public getDragPreviewElement(dragData: DragData): HTMLElement {
    const preview = document.createElement('div');
    preview.className = 'drag-preview';
    preview.style.cssText = `
      position: absolute;
      top: -1000px;
      left: -1000px;
      background: var(--background);
      border: 1px solid var(--border);
      border-radius: 6px;
      padding: 8px 12px;
      font-size: 14px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      pointer-events: none;
      z-index: 1000;
    `;
    
    const icon = dragData.type === 'note' ? '📄' : '📁';
    preview.textContent = `${icon} Moving ${dragData.type}`;
    
    document.body.appendChild(preview);
    return preview;
  }

  public removeDragPreview(element: HTMLElement): void {
    if (element && element.parentNode) {
      element.parentNode.removeChild(element);
    }
  }
}

// Export singleton instance
export const dragDropManager = DragDropManager.getInstance();