/**
 * VirtualScrollContent - Virtual scrolling component for long content areas
 * Requirements: 1.4, 1.5
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { VirtualScrollManager } from '../../lib/userGuide/performanceOptimizations';

interface VirtualScrollContentProps {
  items: React.ReactNode[];
  itemHeight: number;
  containerHeight: number;
  className?: string;
  onItemClick?: (index: number) => void;
}

export const VirtualScrollContent: React.FC<VirtualScrollContentProps> = ({
  items,
  itemHeight,
  containerHeight,
  className = '',
  onItemClick
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [visibleItems, setVisibleItems] = useState<React.ReactNode[]>([]);
  const [startIndex, setStartIndex] = useState(0);
  const [endIndex, setEndIndex] = useState(0);
  const virtualScrollManagerRef = useRef<VirtualScrollManager | null>(null);

  // Calculate visible range
  const calculateVisibleRange = useCallback((scrollTop: number) => {
    const start = Math.floor(scrollTop / itemHeight);
    const visibleCount = Math.ceil(containerHeight / itemHeight) + 2; // Buffer
    const end = Math.min(start + visibleCount, items.length);
    
    return { start, end };
  }, [itemHeight, containerHeight, items.length]);

  // Handle scroll events
  const handleScroll = useCallback((event: React.UIEvent<HTMLDivElement>) => {
    const scrollTop = event.currentTarget.scrollTop;
    const { start, end } = calculateVisibleRange(scrollTop);
    
    setStartIndex(start);
    setEndIndex(end);
    setVisibleItems(items.slice(start, end));
  }, [calculateVisibleRange, items]);

  // Initialize virtual scrolling
  useEffect(() => {
    const { start, end } = calculateVisibleRange(0);
    setStartIndex(start);
    setEndIndex(end);
    setVisibleItems(items.slice(start, end));
  }, [items, calculateVisibleRange]);

  // Handle item clicks
  const handleItemClick = useCallback((relativeIndex: number) => {
    const actualIndex = startIndex + relativeIndex;
    onItemClick?.(actualIndex);
  }, [startIndex, onItemClick]);

  const totalHeight = items.length * itemHeight;

  return (
    <div
      ref={containerRef}
      className={`overflow-auto ${className}`}
      style={{ height: containerHeight }}
      onScroll={handleScroll}
      role="listbox"
      aria-label="Virtual scrolled content"
    >
      <div
        style={{ 
          height: totalHeight,
          position: 'relative'
        }}
      >
        {visibleItems.map((item, index) => (
          <div
            key={startIndex + index}
            style={{
              position: 'absolute',
              top: (startIndex + index) * itemHeight,
              height: itemHeight,
              width: '100%',
              cursor: onItemClick ? 'pointer' : 'default'
            }}
            onClick={() => handleItemClick(index)}
            role="option"
            aria-selected={false}
            tabIndex={0}
            onKeyDown={(e) => {
              if ((e.key === 'Enter' || e.key === ' ') && onItemClick) {
                e.preventDefault();
                handleItemClick(index);
              }
            }}
          >
            {item}
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * Hook for virtual scrolling with performance optimization
 */
export const useVirtualScroll = (
  items: any[],
  itemHeight: number,
  containerHeight: number
) => {
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: 0 });
  const [scrollTop, setScrollTop] = useState(0);

  const calculateVisibleRange = useCallback((currentScrollTop: number) => {
    const start = Math.floor(currentScrollTop / itemHeight);
    const visibleCount = Math.ceil(containerHeight / itemHeight) + 2;
    const end = Math.min(start + visibleCount, items.length);
    
    return { start, end };
  }, [itemHeight, containerHeight, items.length]);

  const handleScroll = useCallback((event: React.UIEvent<HTMLDivElement>) => {
    const newScrollTop = event.currentTarget.scrollTop;
    setScrollTop(newScrollTop);
    
    const newRange = calculateVisibleRange(newScrollTop);
    if (newRange.start !== visibleRange.start || newRange.end !== visibleRange.end) {
      setVisibleRange(newRange);
    }
  }, [calculateVisibleRange, visibleRange]);

  const scrollToIndex = useCallback((index: number, behavior: ScrollBehavior = 'smooth') => {
    const targetScrollTop = index * itemHeight;
    setScrollTop(targetScrollTop);
    
    // This would need to be called on the actual container element
    return targetScrollTop;
  }, [itemHeight]);

  useEffect(() => {
    const range = calculateVisibleRange(scrollTop);
    setVisibleRange(range);
  }, [items.length, calculateVisibleRange, scrollTop]);

  return {
    visibleRange,
    visibleItems: items.slice(visibleRange.start, visibleRange.end),
    totalHeight: items.length * itemHeight,
    handleScroll,
    scrollToIndex,
    scrollTop
  };
};