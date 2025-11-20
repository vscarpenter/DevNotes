/**
 * useDragDrop hook for drag and drop functionality
 * Provides an easy-to-use interface for components to implement drag-drop
 * Requirements: 6.1, 6.2, 6.3, 6.4, 6.5
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { DragDropManager } from '@/lib/dragdrop/DragDropManager';
import {
  DragData,
  DragState,
  DropZoneState,
  DragType,
  DropZoneConfig
} from '@/types/dragdrop';

interface UseDraggableOptions {
  type: DragType;
  id: string;
  data?: any;
  disabled?: boolean;
  onDragStart?: () => void;
  onDragEnd?: () => void;
}

interface UseDraggableReturn {
  isDragging: boolean;
  dragProps: {
    draggable: boolean;
    onDragStart: (e: React.DragEvent) => void;
    onDragEnd: (e: React.DragEvent) => void;
    onDragOver: (e: React.DragEvent) => void;
  };
}

interface UseDropZoneOptions {
  id: string;
  type: DragType;
  acceptedTypes: DragType[];
  canDrop?: (dragData: DragData) => boolean;
  onDrop?: (dragData: DragData) => Promise<void> | void;
  disabled?: boolean;
}

interface UseDropZoneReturn {
  isOver: boolean;
  canDrop: boolean;
  isDragging: boolean;
  dropProps: {
    onDragOver: (e: React.DragEvent) => void;
    onDragEnter: (e: React.DragEvent) => void;
    onDragLeave: (e: React.DragEvent) => void;
    onDrop: (e: React.DragEvent) => void;
  };
}

/**
 * Hook for making an element draggable
 */
export function useDraggable({
  type,
  id,
  data,
  disabled = false,
  onDragStart,
  onDragEnd
}: UseDraggableOptions): UseDraggableReturn {
  const [isDragging, setIsDragging] = useState(false);
  const manager = DragDropManager.getInstance();

  const handleDragStart = useCallback((e: React.DragEvent) => {
    if (disabled) {
      e.preventDefault();
      return;
    }

    const dragData: DragData = {
      type,
      id,
      sourceId: data?.folderId || data?.parentId
    };

    // Set drag data for browser compatibility
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', id);
    e.dataTransfer.setData('application/json', JSON.stringify(dragData));

    // Set custom drag image if element exists
    const target = e.currentTarget as HTMLElement;
    if (target) {
      const ghost = target.cloneNode(true) as HTMLElement;
      ghost.style.position = 'absolute';
      ghost.style.top = '-1000px';
      ghost.style.opacity = '0.7';
      ghost.style.pointerEvents = 'none';
      document.body.appendChild(ghost);
      e.dataTransfer.setDragImage(ghost, 0, 0);
      setTimeout(() => document.body.removeChild(ghost), 0);
    }

    manager.startDrag(dragData);
    setIsDragging(true);
    onDragStart?.();
  }, [type, id, data, disabled, manager, onDragStart]);

  const handleDragEnd = useCallback((e: React.DragEvent) => {
    manager.endDrag();
    setIsDragging(false);
    onDragEnd?.();
  }, [manager, onDragEnd]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    // Required to allow drop
    e.preventDefault();
  }, []);

  return {
    isDragging,
    dragProps: {
      draggable: !disabled,
      onDragStart: handleDragStart,
      onDragEnd: handleDragEnd,
      onDragOver: handleDragOver
    }
  };
}

/**
 * Hook for making an element a drop zone
 */
export function useDropZone({
  id,
  type,
  acceptedTypes,
  canDrop: canDropProp,
  onDrop: onDropProp,
  disabled = false
}: UseDropZoneOptions): UseDropZoneReturn {
  const [isOver, setIsOver] = useState(false);
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    dragType: null,
    dragId: null,
    dragData: null,
    dropTargetId: null,
    dropTargetType: null,
    isValidDropTarget: false
  });
  const dragCounterRef = useRef(0);
  const manager = DragDropManager.getInstance();

  // Subscribe to drag state changes
  useEffect(() => {
    const unsubscribe = manager.subscribe(`dropzone-${id}`, (state) => {
      setDragState(state);
    });
    return unsubscribe;
  }, [manager, id]);

  const canDrop = useCallback((dragData: DragData | null): boolean => {
    if (disabled || !dragData) return false;

    // Check if this drop zone accepts the drag type
    if (!acceptedTypes.includes(dragData.type)) return false;

    // Can't drop on itself
    if (dragData.id === id) return false;

    // Custom canDrop validation
    if (canDropProp && !canDropProp(dragData)) return false;

    // Use manager's validation
    return manager.canDrop(dragData, id, type);
  }, [disabled, acceptedTypes, id, type, canDropProp, manager]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();

    if (!dragState.dragData) return;

    const canDropHere = canDrop(dragState.dragData);
    e.dataTransfer.dropEffect = canDropHere ? 'move' : 'none';

    manager.updateDropTarget(id, type, canDropHere);
  }, [dragState.dragData, canDrop, id, type, manager]);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    dragCounterRef.current++;

    if (dragCounterRef.current === 1) {
      setIsOver(true);
    }
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    dragCounterRef.current--;

    if (dragCounterRef.current === 0) {
      setIsOver(false);
    }
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    dragCounterRef.current = 0;
    setIsOver(false);

    // Get drag data
    let dragData: DragData | null = null;
    try {
      const jsonData = e.dataTransfer.getData('application/json');
      if (jsonData) {
        dragData = JSON.parse(jsonData);
      }
    } catch (error) {
      console.error('Failed to parse drag data:', error);
    }

    if (!dragData) {
      dragData = dragState.dragData;
    }

    if (!dragData || !canDrop(dragData)) {
      return;
    }

    // Execute drop handler
    try {
      await onDropProp?.(dragData);
    } catch (error) {
      console.error('Drop operation failed:', error);
    }
  }, [dragState.dragData, canDrop, onDropProp]);

  return {
    isOver,
    canDrop: dragState.dragData ? canDrop(dragState.dragData) : false,
    isDragging: dragState.isDragging,
    dropProps: {
      onDragOver: handleDragOver,
      onDragEnter: handleDragEnter,
      onDragLeave: handleDragLeave,
      onDrop: handleDrop
    }
  };
}

/**
 * Combined hook for elements that are both draggable and drop zones (like folders)
 */
export function useDragAndDrop(
  draggableOptions: UseDraggableOptions,
  dropZoneOptions: UseDropZoneOptions
) {
  const draggable = useDraggable(draggableOptions);
  const dropZone = useDropZone(dropZoneOptions);

  return {
    ...draggable,
    ...dropZone,
    combinedProps: {
      ...draggable.dragProps,
      ...dropZone.dropProps
    }
  };
}

/**
 * Hook to access global drag state
 */
export function useDragState(): DragState {
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    dragType: null,
    dragId: null,
    dragData: null,
    dropTargetId: null,
    dropTargetType: null,
    isValidDropTarget: false
  });
  const manager = DragDropManager.getInstance();

  useEffect(() => {
    const unsubscribe = manager.subscribe('global-drag-state', (state) => {
      setDragState(state);
    });
    return unsubscribe;
  }, [manager]);

  return dragState;
}
