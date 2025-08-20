/**
 * Performance optimization utilities for the user guide system
 * Requirements: 1.4, 1.5
 */

import { GuideSection } from '../../types/userGuide';

// Cache for loaded content sections
const contentCache = new Map<string, GuideSection>();
const searchCache = new Map<string, GuideSection[]>();

// Performance monitoring
interface PerformanceMetrics {
  searchTime: number;
  contentLoadTime: number;
  renderTime: number;
}

const performanceMetrics: PerformanceMetrics = {
  searchTime: 0,
  contentLoadTime: 0,
  renderTime: 0,
};

/**
 * Lazy loading utility for guide content sections
 */
export class LazyContentLoader {
  private static loadingPromises = new Map<string, Promise<GuideSection>>();
  private static readonly MAX_CONTENT_SIZE = 100 * 1024; // 100KB max content size
  private static readonly LOAD_TIMEOUT = 5000; // 5 seconds timeout
  private static abortController: AbortController | null = null;
  private static preloadQueue: string[] = [];
  private static isPreloading = false;

  static async loadSection(sectionId: string): Promise<GuideSection> {
    // Validate section ID
    if (!sectionId || typeof sectionId !== 'string') {
      console.error('Invalid section ID provided to LazyContentLoader');
      return this.createFallbackSection('invalid-section');
    }

    // Check cache first
    if (contentCache.has(sectionId)) {
      return contentCache.get(sectionId)!;
    }

    // Check if already loading
    if (this.loadingPromises.has(sectionId)) {
      return this.loadingPromises.get(sectionId)!;
    }

    // Create a new abort controller for this request
    this.abortController = new AbortController();
    
    // Start loading with timeout protection
    const loadPromise = this.loadSectionContent(sectionId);
    this.loadingPromises.set(sectionId, loadPromise);

    try {
      const section = await loadPromise;
      if (!section) {
        throw new Error(`Failed to load section: ${sectionId}`);
      }
      
      // Validate section content size
      if (section.content && section.content.length > this.MAX_CONTENT_SIZE) {
        console.warn(`Section ${sectionId} content exceeds maximum size (${section.content.length} > ${this.MAX_CONTENT_SIZE}). Truncating.`);
        section.content = section.content.substring(0, this.MAX_CONTENT_SIZE) + 
          '\n\n*Content truncated due to size limitations*';
      }
      
      contentCache.set(sectionId, section);
      
      // Queue adjacent sections for preloading
      this.queueSectionForPreload(sectionId);
      
      return section;
    } catch (error) {
      console.error(`Error loading section ${sectionId}:`, error);
      // Return fallback content instead of throwing
      const fallbackSection = this.createFallbackSection(sectionId);
      return fallbackSection;
    } finally {
      this.loadingPromises.delete(sectionId);
      this.abortController = null;
    }
  }

  private static async loadSectionContent(sectionId: string): Promise<GuideSection> {
    const startTime = performance.now();

    try {
      // Import the content loader with pre-compiled markdown modules
      const { getSectionByIdDirect } = await import('../../content/userGuide/contentLoader');
      
      // Get the specific section
      const section = await getSectionByIdDirect(sectionId);
      
      if (!section) {
        throw new Error(`Section ${sectionId} not found`);
      }

      performanceMetrics.contentLoadTime = performance.now() - startTime;
      return section;
    } catch (error) {
      console.error(`Failed to load section ${sectionId}:`, error);
      
      // Return fallback content
      const metadata = this.getSectionMetadata(sectionId);
      return {
        id: sectionId,
        title: metadata.title,
        content: `# ${metadata.title}\n\nContent is currently unavailable. Please try again later.`,
        searchKeywords: metadata.searchKeywords,
        category: metadata.category,
      };
    }
  }

  private static getSectionMetadata(sectionId: string) {
    const metadataMap: Record<string, {
      title: string;
      searchKeywords: string[];
      category: 'getting-started' | 'features' | 'advanced' | 'troubleshooting';
    }> = {
      'getting-started/welcome': {
        title: 'Welcome to DevNotes',
        searchKeywords: ['welcome', 'introduction', 'getting started', 'overview', 'devnotes'],
        category: 'getting-started' as const
      },
      'getting-started/first-note': {
        title: 'Creating Your First Note',
        searchKeywords: ['first note', 'create', 'new note', 'editor', 'getting started'],
        category: 'getting-started' as const
      },
      'getting-started/organizing-notes': {
        title: 'Organizing Your Notes',
        searchKeywords: ['organize', 'folders', 'structure', 'hierarchy', 'management'],
        category: 'getting-started' as const
      },
      'features/markdown-editor': {
        title: 'Markdown Editor',
        searchKeywords: ['markdown', 'editor', 'syntax', 'preview', 'formatting', 'code'],
        category: 'features' as const
      },
      'features/search': {
        title: 'Search Functionality',
        searchKeywords: ['search', 'find', 'filter', 'query', 'operators'],
        category: 'features' as const
      },
      'features/export-import': {
        title: 'Export & Import',
        searchKeywords: ['export', 'import', 'backup', 'transfer', 'migration'],
        category: 'features' as const
      },
      'features/keyboard-shortcuts': {
        title: 'Keyboard Shortcuts',
        searchKeywords: ['keyboard', 'shortcuts', 'hotkeys', 'productivity', 'navigation'],
        category: 'features' as const
      },
      'advanced/power-user-tips': {
        title: 'Power User Tips',
        searchKeywords: ['power user', 'advanced', 'tips', 'tricks', 'productivity', 'workflow'],
        category: 'advanced' as const
      },
      'advanced/customization': {
        title: 'Customization Options',
        searchKeywords: ['customize', 'settings', 'preferences', 'configuration', 'themes'],
        category: 'advanced' as const
      },
      'advanced/data-management': {
        title: 'Data Management',
        searchKeywords: ['data', 'storage', 'indexeddb', 'management', 'backup'],
        category: 'advanced' as const
      },
      'troubleshooting/common-issues': {
        title: 'Common Issues',
        searchKeywords: ['issues', 'problems', 'troubleshooting', 'help', 'bugs'],
        category: 'troubleshooting' as const
      },
      'troubleshooting/performance': {
        title: 'Performance Optimization',
        searchKeywords: ['performance', 'speed', 'optimization', 'slow', 'memory'],
        category: 'troubleshooting' as const
      },
      'troubleshooting/data-recovery': {
        title: 'Data Recovery',
        searchKeywords: ['recovery', 'lost data', 'backup', 'restore', 'corruption'],
        category: 'troubleshooting' as const
      },
    };

    return metadataMap[sectionId] || {
      title: 'Unknown Section',
      searchKeywords: [],
      category: 'getting-started' as const
    };
  }
  
  private static createFallbackSection(sectionId: string): GuideSection {
    const metadata = this.getSectionMetadata(sectionId);
    return {
      id: sectionId,
      title: metadata.title,
      content: `# ${metadata.title}\n\nWe're sorry, but this content couldn't be loaded. Please try again later or check another section.\n\n**Troubleshooting Tips:**\n- Refresh the page\n- Clear your browser cache\n- Try a different browser`,
      searchKeywords: metadata.searchKeywords,
      category: metadata.category,
    };
  }

  static queueSectionForPreload(sectionId: string): void {
    try {
      // Add to preload queue if not already in cache or queue
      if (!contentCache.has(sectionId) && !this.preloadQueue.includes(sectionId)) {
        this.preloadQueue.push(sectionId);
      }
      
      // Start preloading if not already in progress
      if (!this.isPreloading) {
        this.processPreloadQueue();
      }
    } catch (error) {
      console.error('Error queueing section for preload:', error);
    }
  }
  
  private static async processPreloadQueue(): Promise<void> {
    if (this.isPreloading || this.preloadQueue.length === 0) return;
    
    this.isPreloading = true;
    
    try {
      // Process one item at a time to avoid overwhelming the browser
      const sectionId = this.preloadQueue.shift();
      if (sectionId) {
        await this.preloadSection(sectionId);
      }
    } catch (error) {
      console.warn('Error processing preload queue:', error);
    } finally {
      this.isPreloading = false;
      
      // Continue processing queue if there are more items
      if (this.preloadQueue.length > 0) {
        // Use setTimeout to avoid blocking the main thread
        setTimeout(() => this.processPreloadQueue(), 100);
      }
    }
  }

  static preloadSection(sectionId: string): void {
    // Preload in background without blocking
    this.loadSection(sectionId).catch(error => {
      console.warn(`Failed to preload section ${sectionId}:`, error);
    });
  }

  static clearCache(): void {
    contentCache.clear();
    this.loadingPromises.clear();
    this.preloadQueue = [];
    this.isPreloading = false;
    
    if (this.abortController) {
      this.abortController.abort();
      this.abortController = null;
    }
  }

  static getCacheSize(): number {
    return contentCache.size;
  }
  
  static cancelLoading(): void {
    if (this.abortController) {
      this.abortController.abort();
      this.abortController = null;
    }
    
    this.preloadQueue = [];
    this.isPreloading = false;
  }
}

/**
 * Optimized search with caching and debouncing
 */
export class OptimizedSearch {
  private static searchTimeout: NodeJS.Timeout | null = null;
  private static readonly DEBOUNCE_DELAY = 300;
  private static readonly CACHE_SIZE_LIMIT = 50;

  static async search(
    query: string,
    searchFunction: (query: string) => Promise<GuideSection[]>
  ): Promise<GuideSection[]> {
    const startTime = performance.now();
    
    try {
      // Check cache first
      const cacheKey = query.toLowerCase().trim();
      if (searchCache.has(cacheKey)) {
        performanceMetrics.searchTime = performance.now() - startTime;
        return searchCache.get(cacheKey)!;
      }

      // Perform search
      const results = await searchFunction(query);
      
      // Cache results (with size limit)
      if (searchCache.size >= this.CACHE_SIZE_LIMIT) {
        // Remove oldest entries
        const firstKey = searchCache.keys().next().value;
        if (firstKey) {
          searchCache.delete(firstKey);
        }
      }
      
      searchCache.set(cacheKey, results);
      performanceMetrics.searchTime = performance.now() - startTime;
      
      return results;
    } catch (error) {
      console.error('Search error:', error);
      performanceMetrics.searchTime = performance.now() - startTime;
      return [];
    }
  }

  static debouncedSearch(
    query: string,
    searchFunction: (query: string) => Promise<GuideSection[]>,
    callback: (results: GuideSection[]) => void
  ): void {
    // Clear previous timeout
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }

    // Set new timeout
    this.searchTimeout = setTimeout(async () => {
      const results = await this.search(query, searchFunction);
      callback(results);
    }, this.DEBOUNCE_DELAY);
  }

  static clearSearchCache(): void {
    searchCache.clear();
  }

  static getSearchCacheSize(): number {
    return searchCache.size;
  }
}

/**
 * Virtual scrolling utility for long content
 */
export class VirtualScrollManager {
  private container: HTMLElement;
  private items: HTMLElement[];
  private itemHeight: number;
  private visibleCount: number;
  private scrollTop: number = 0;
  private startIndex: number = 0;
  private endIndex: number = 0;
  private scrollHandler: () => void;
  private isDestroyed: boolean = false;
  private maxItemsLimit: number = 1000; // Safety limit to prevent browser crashes

  constructor(config: {
    container: HTMLElement;
    items?: HTMLElement[];
    itemHeight?: number;
    maxItemsLimit?: number;
  }) {
    const { container, items = [], itemHeight = 100, maxItemsLimit = 1000 } = config;
    if (!container || !(container instanceof HTMLElement)) {
      console.error('Invalid container provided to VirtualScrollManager');
      throw new Error('Invalid container element');
    }

    this.container = container;
    this.items = this.validateItems(items);
    this.itemHeight = itemHeight;
    this.maxItemsLimit = maxItemsLimit;
    this.visibleCount = Math.ceil(container.clientHeight / itemHeight) + 2; // Buffer
    
    // Bind the handler once to avoid memory leaks
    this.scrollHandler = this.handleScroll.bind(this);
    
    this.setupVirtualScrolling();
  }

  private validateItems(items: HTMLElement[]): HTMLElement[] {
    // Ensure items is an array and contains only HTMLElements
    if (!Array.isArray(items)) {
      console.warn('Invalid items array provided to VirtualScrollManager');
      return [];
    }

    // Filter out non-HTMLElements
    const validItems = items.filter(item => item instanceof HTMLElement);
    
    // Apply safety limit to prevent browser crashes
    if (validItems.length > this.maxItemsLimit) {
      console.warn(`Items array exceeds safety limit (${validItems.length} > ${this.maxItemsLimit}). Truncating.`);
      return validItems.slice(0, this.maxItemsLimit);
    }
    
    return validItems;
  }

  private setupVirtualScrolling(): void {
    if (this.isDestroyed) return;
    
    try {
      // Set container height
      const totalHeight = this.items.length * this.itemHeight;
      this.container.style.height = `${totalHeight}px`;
      this.container.style.position = 'relative';

      // Initial render
      this.updateVisibleItems();

      // Add scroll listener
      this.container.addEventListener('scroll', this.scrollHandler);
    } catch (error) {
      console.error('Error setting up virtual scrolling:', error);
    }
  }

  private handleScroll(): void {
    if (this.isDestroyed) return;
    
    // Use requestAnimationFrame to optimize scroll performance
    requestAnimationFrame(() => {
      try {
        this.scrollTop = this.container.scrollTop;
        this.updateVisibleItems();
      } catch (error) {
        console.error('Error handling scroll:', error);
      }
    });
  }

  private updateVisibleItems(): void {
    if (this.isDestroyed) return;
    
    try {
      this.startIndex = Math.max(0, Math.floor(this.scrollTop / this.itemHeight));
      this.endIndex = Math.min(
        this.startIndex + this.visibleCount,
        this.items.length
      );

      // Hide all items first
      this.items.forEach(item => {
        if (item && item.style) {
          item.style.display = 'none';
        }
      });

      // Show visible items
      for (let i = this.startIndex; i < this.endIndex; i++) {
        const item = this.items[i];
        if (item && item.style) {
          item.style.display = 'block';
          item.style.position = 'absolute';
          item.style.top = `${i * this.itemHeight}px`;
          item.style.width = '100%';
        }
      }
    } catch (error) {
      console.error('Error updating visible items:', error);
    }
  }

  updateItems(newItems: HTMLElement[]): void {
    if (this.isDestroyed) return;
    
    try {
      this.items = this.validateItems(newItems);
      const totalHeight = this.items.length * this.itemHeight;
      this.container.style.height = `${totalHeight}px`;
      this.updateVisibleItems();
    } catch (error) {
      console.error('Error updating items:', error);
    }
  }

  scrollToIndex(index: number): void {
    if (this.isDestroyed) return;
    
    try {
      const safeIndex = Math.max(0, Math.min(index, this.items.length - 1));
      const targetScrollTop = safeIndex * this.itemHeight;
      this.container.scrollTo({
        top: targetScrollTop,
        behavior: 'smooth'
      });
    } catch (error) {
      console.error('Error scrolling to index:', error);
    }
  }

  destroy(): void {
    if (this.isDestroyed) return;
    
    try {
      this.container.removeEventListener('scroll', this.scrollHandler);
      this.items = [];
      this.isDestroyed = true;
    } catch (error) {
      console.error('Error destroying VirtualScrollManager:', error);
    }
  }
}

/**
 * Performance monitoring utilities
 */
export class PerformanceMonitor {
  private static operations = new Map<string, number>();

  static getMetrics(): PerformanceMetrics {
    return { ...performanceMetrics };
  }

  static resetMetrics(): void {
    performanceMetrics.searchTime = 0;
    performanceMetrics.contentLoadTime = 0;
    performanceMetrics.renderTime = 0;
  }

  static startOperation(operationName: string): void {
    this.operations.set(operationName, performance.now());
  }

  static endOperation(operationName: string): number {
    const startTime = this.operations.get(operationName);
    if (startTime) {
      const duration = performance.now() - startTime;
      this.operations.delete(operationName);
      return duration;
    }
    return 0;
  }

  static measureRenderTime<T>(fn: () => T): T {
    const startTime = performance.now();
    const result = fn();
    performanceMetrics.renderTime = performance.now() - startTime;
    return result;
  }

  static async measureAsyncRenderTime<T>(fn: () => Promise<T>): Promise<T> {
    const startTime = performance.now();
    const result = await fn();
    performanceMetrics.renderTime = performance.now() - startTime;
    return result;
  }

  static logPerformanceWarnings(): void {
    const metrics = this.getMetrics();
    
    if (metrics.searchTime > 100) {
      console.warn(`Search performance warning: ${metrics.searchTime.toFixed(2)}ms (target: <100ms)`);
    }
    
    if (metrics.contentLoadTime > 200) {
      console.warn(`Content load performance warning: ${metrics.contentLoadTime.toFixed(2)}ms (target: <200ms)`);
    }
    
    if (metrics.renderTime > 50) {
      console.warn(`Render performance warning: ${metrics.renderTime.toFixed(2)}ms (target: <50ms)`);
    }
  }
}

/**
 * Memory management utilities
 */
export class MemoryManager {
  private static readonly MAX_CACHE_SIZE = 20; // Maximum cached sections
  private static readonly CLEANUP_INTERVAL = 2 * 60 * 1000; // 2 minutes (reduced from 5)
  private static readonly MEMORY_THRESHOLD_MB = 100; // 100MB threshold
  private static cleanupTimer: NodeJS.Timeout | null = null;
  private static isDestroyed: boolean = false;

  static startMemoryManagement(): void {
    if (this.cleanupTimer || this.isDestroyed) return;

    try {
      this.cleanupTimer = setInterval(() => {
        this.performCleanup();
      }, this.CLEANUP_INTERVAL);
      
      // Initial cleanup
      this.performCleanup();
      console.log('Memory management started');
    } catch (error) {
      console.error('Error starting memory management:', error);
    }
  }

  static stopMemoryManagement(): void {
    if (this.isDestroyed) return;
    
    try {
      if (this.cleanupTimer) {
        clearInterval(this.cleanupTimer);
        this.cleanupTimer = null;
      }
      console.log('Memory management stopped');
    } catch (error) {
      console.error('Error stopping memory management:', error);
    }
  }

  private static performCleanup(): void {
    if (this.isDestroyed) return;
    
    try {
      // Check if memory usage is high (Chrome only)
      if (this.isMemoryUsageHigh()) {
        console.warn('High memory usage detected, performing aggressive cleanup');
        this.clearAllCaches();
        return;
      }
      
      // Clean up content cache if it's too large
      if (contentCache.size > this.MAX_CACHE_SIZE) {
        const keysToDelete = Array.from(contentCache.keys())
          .slice(0, Math.ceil(contentCache.size * 0.5)); // Remove 50% of cache instead of just overflow
        keysToDelete.forEach(key => contentCache.delete(key));
        console.log(`Cleaned up ${keysToDelete.length} cached content sections`);
      }

      // Clean up search cache if it's too large
      if (searchCache.size > OptimizedSearch.getSearchCacheSize()) {
        OptimizedSearch.clearSearchCache();
        console.log('Cleaned up search cache');
      }
    } catch (error) {
      console.error('Error performing cache cleanup:', error);
    }
  }
  
  static isMemoryUsageHigh(): boolean {
    // Check if performance.memory is available (Chrome only)
    if (typeof window !== 'undefined' && window.performance && (window.performance as unknown as { memory: { usedJSHeapSize: number } }).memory) {
      const memoryInfo = (window.performance as unknown as { memory: { usedJSHeapSize: number } }).memory;
      const usedHeapSizeMB = memoryInfo.usedJSHeapSize / (1024 * 1024);
      
      if (usedHeapSizeMB > this.MEMORY_THRESHOLD_MB) {
        console.warn(`High memory usage: ${usedHeapSizeMB.toFixed(2)}MB exceeds threshold of ${this.MEMORY_THRESHOLD_MB}MB`);
        return true;
      }
    }
    
    return false;
  }

  static getMemoryUsage(): {
    contentCacheSize: number;
    searchCacheSize: number;
    totalCacheSize: number;
  } {
    return {
      contentCacheSize: contentCache.size,
      searchCacheSize: searchCache.size,
      totalCacheSize: contentCache.size + searchCache.size,
    };
  }

  static clearAllCaches(): void {
    try {
      LazyContentLoader.clearCache();
      OptimizedSearch.clearSearchCache();
      console.log('All caches cleared');
    } catch (error) {
      console.error('Error clearing caches:', error);
    }
  }
  
  static performCacheCleanup(): void {
    try {
      // Clean up content cache if it's too large
      if (contentCache.size > this.MAX_CACHE_SIZE) {
        const keysToDelete = Array.from(contentCache.keys())
          .slice(0, Math.ceil(contentCache.size * 0.3)); // Remove 30% of cache
        keysToDelete.forEach(key => contentCache.delete(key));
        console.log(`Cleaned up ${keysToDelete.length} cached content sections`);
      }

      // Clean up search cache if it's too large
      if (searchCache.size > OptimizedSearch.getSearchCacheSize()) {
        OptimizedSearch.clearSearchCache();
        console.log('Cleaned up search cache');
      }
    } catch (error) {
      console.error('Error performing cache cleanup:', error);
    }
  }
  
  static destroy(): void {
    if (this.isDestroyed) return;
    
    try {
      this.stopMemoryManagement();
      this.clearAllCaches();
      this.isDestroyed = true;
      console.log('Memory manager destroyed');
    } catch (error) {
      console.error('Error destroying memory manager:', error);
    }
  }
}

// Initialize memory management
if (typeof window !== 'undefined') {
  MemoryManager.startMemoryManagement();
  
  // Clean up on page unload
  window.addEventListener('beforeunload', () => {
    MemoryManager.stopMemoryManagement();
  });
}