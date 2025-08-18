# Performance Optimization

Optimize DevNotes for maximum speed and responsiveness, especially when working with large note collections.

## Performance Monitoring

### Built-in Performance Metrics
DevNotes includes performance monitoring tools:

```javascript
// Access performance metrics
const metrics = devnotes.performance.getMetrics();
console.log({
  startupTime: metrics.startup,
  noteLoadTime: metrics.noteLoad,
  searchTime: metrics.search,
  saveTime: metrics.save,
  memoryUsage: metrics.memory
});
```

### Browser Performance Tools
Use browser developer tools to monitor performance:

#### Chrome DevTools
1. **Open DevTools** (F12)
2. **Go to Performance tab**
3. **Record performance** while using DevNotes
4. **Analyze results** for bottlenecks

#### Performance Metrics to Monitor
- **First Contentful Paint (FCP)**: < 1.5s
- **Largest Contentful Paint (LCP)**: < 2.5s
- **Time to Interactive (TTI)**: < 3.5s
- **Memory usage**: Monitor for leaks
- **CPU usage**: Should remain reasonable

### Custom Performance Monitoring
```javascript
// Custom performance monitoring
class PerformanceMonitor {
  constructor() {
    this.metrics = new Map();
  }
  
  startTimer(name) {
    this.metrics.set(name, performance.now());
  }
  
  endTimer(name) {
    const start = this.metrics.get(name);
    if (start) {
      const duration = performance.now() - start;
      console.log(`${name}: ${duration.toFixed(2)}ms`);
      return duration;
    }
  }
  
  measureAsync(name, asyncFn) {
    return async (...args) => {
      this.startTimer(name);
      try {
        const result = await asyncFn(...args);
        this.endTimer(name);
        return result;
      } catch (error) {
        this.endTimer(name);
        throw error;
      }
    };
  }
}

// Usage
const monitor = new PerformanceMonitor();
const timedSaveNote = monitor.measureAsync('saveNote', devnotes.saveNote);
```

## Application Startup Optimization

### Lazy Loading
Implement lazy loading for non-critical components:

```javascript
// Lazy load components
const LazyUserGuide = React.lazy(() => import('./UserGuide'));
const LazySettings = React.lazy(() => import('./Settings'));
const LazyExportModal = React.lazy(() => import('./ExportModal'));

// Use with Suspense
<Suspense fallback={<LoadingSpinner />}>
  <LazyUserGuide />
</Suspense>
```

### Code Splitting
Split code into smaller chunks:

```javascript
// Route-based code splitting
const routes = [
  {
    path: '/',
    component: React.lazy(() => import('./pages/Home'))
  },
  {
    path: '/settings',
    component: React.lazy(() => import('./pages/Settings'))
  }
];
```

### Preloading Critical Resources
```javascript
// Preload critical resources
const preloadCriticalResources = () => {
  // Preload fonts
  const fontLink = document.createElement('link');
  fontLink.rel = 'preload';
  fontLink.href = '/fonts/inter.woff2';
  fontLink.as = 'font';
  fontLink.type = 'font/woff2';
  fontLink.crossOrigin = 'anonymous';
  document.head.appendChild(fontLink);
  
  // Preload critical CSS
  const cssLink = document.createElement('link');
  cssLink.rel = 'preload';
  cssLink.href = '/css/critical.css';
  cssLink.as = 'style';
  document.head.appendChild(cssLink);
};
```

### Service Worker Optimization
```javascript
// Efficient service worker caching
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open('devnotes-v1').then(cache => {
      return cache.addAll([
        '/',
        '/css/app.css',
        '/js/app.js',
        '/fonts/inter.woff2'
      ]);
    })
  );
});

self.addEventListener('fetch', event => {
  // Cache-first strategy for static assets
  if (event.request.url.includes('/static/')) {
    event.respondWith(
      caches.match(event.request).then(response => {
        return response || fetch(event.request);
      })
    );
  }
});
```

## Database Performance

### Indexing Optimization
Create efficient database indexes:

```javascript
// Optimize database schema
const optimizeDatabase = async () => {
  const db = devnotes.db;
  
  // Create compound indexes for common queries
  await db.notes.createIndex('folder_modified', ['folderId', 'modifiedAt']);
  await db.notes.createIndex('tags_title', ['tags', 'title']);
  await db.notes.createIndex('created_folder', ['createdAt', 'folderId']);
  
  // Create full-text search index
  await db.searchTerms.createIndex('term_weight', ['term', 'weight']);
  
  console.log('Database indexes optimized');
};
```

### Query Optimization
Write efficient database queries:

```javascript
// Efficient queries
class OptimizedQueries {
  // Good: Use indexes
  async getRecentNotesByFolder(folderId, limit = 20) {
    return await db.notes
      .where(['folderId', 'modifiedAt'])
      .between([folderId, new Date(0)], [folderId, new Date()])
      .reverse()
      .limit(limit)
      .toArray();
  }
  
  // Bad: Full table scan
  async getRecentNotesByFolderSlow(folderId, limit = 20) {
    const allNotes = await db.notes.toArray();
    return allNotes
      .filter(note => note.folderId === folderId)
      .sort((a, b) => b.modifiedAt - a.modifiedAt)
      .slice(0, limit);
  }
  
  // Good: Batch operations
  async updateMultipleNotes(updates) {
    return await db.transaction('rw', db.notes, async () => {
      for (const update of updates) {
        await db.notes.update(update.id, update.changes);
      }
    });
  }
}
```

### Database Maintenance
Regular database maintenance:

```javascript
// Database maintenance tasks
const performMaintenance = async () => {
  console.log('Starting database maintenance...');
  
  // 1. Remove orphaned data
  await removeOrphanedNotes();
  
  // 2. Rebuild search index
  await rebuildSearchIndex();
  
  // 3. Compact database
  await compactDatabase();
  
  // 4. Update statistics
  await updateDatabaseStats();
  
  console.log('Database maintenance completed');
};

const removeOrphanedNotes = async () => {
  const notes = await db.notes.toArray();
  const folders = await db.folders.toArray();
  const folderIds = new Set(folders.map(f => f.id));
  
  const orphanedNotes = notes.filter(note => 
    note.folderId && !folderIds.has(note.folderId)
  );
  
  if (orphanedNotes.length > 0) {
    console.log(`Removing ${orphanedNotes.length} orphaned notes`);
    await db.notes.bulkDelete(orphanedNotes.map(n => n.id));
  }
};

const compactDatabase = async () => {
  // This is browser-specific and may not be available in all browsers
  if (db.compact) {
    await db.compact();
  }
};
```

## Memory Management

### Memory Leak Prevention
Prevent common memory leaks:

```javascript
// Proper event listener cleanup
class ComponentWithListeners {
  constructor() {
    this.handleResize = this.handleResize.bind(this);
    this.handleScroll = this.handleScroll.bind(this);
  }
  
  mount() {
    window.addEventListener('resize', this.handleResize);
    window.addEventListener('scroll', this.handleScroll);
  }
  
  unmount() {
    // Always clean up event listeners
    window.removeEventListener('resize', this.handleResize);
    window.removeEventListener('scroll', this.handleScroll);
  }
  
  handleResize() {
    // Handle resize
  }
  
  handleScroll() {
    // Handle scroll
  }
}

// Proper timer cleanup
class TimerManager {
  constructor() {
    this.timers = new Set();
  }
  
  setTimeout(callback, delay) {
    const timerId = setTimeout(() => {
      this.timers.delete(timerId);
      callback();
    }, delay);
    
    this.timers.add(timerId);
    return timerId;
  }
  
  clearTimeout(timerId) {
    clearTimeout(timerId);
    this.timers.delete(timerId);
  }
  
  clearAll() {
    this.timers.forEach(timerId => clearTimeout(timerId));
    this.timers.clear();
  }
}
```

### Memory Usage Monitoring
```javascript
// Monitor memory usage
const monitorMemory = () => {
  if (performance.memory) {
    const memory = performance.memory;
    const used = Math.round(memory.usedJSHeapSize / 1024 / 1024);
    const total = Math.round(memory.totalJSHeapSize / 1024 / 1024);
    const limit = Math.round(memory.jsHeapSizeLimit / 1024 / 1024);
    
    console.log(`Memory: ${used}MB / ${total}MB (limit: ${limit}MB)`);
    
    // Warn if memory usage is high
    if (used / limit > 0.8) {
      console.warn('High memory usage detected');
      // Trigger cleanup
      triggerMemoryCleanup();
    }
  }
};

const triggerMemoryCleanup = () => {
  // Clear caches
  devnotes.cache.clear();
  
  // Force garbage collection (if available)
  if (window.gc) {
    window.gc();
  }
  
  // Clear unused references
  devnotes.cleanup();
};

// Monitor memory every 30 seconds
setInterval(monitorMemory, 30000);
```

### Efficient Data Structures
Use memory-efficient data structures:

```javascript
// Use Maps for key-value lookups instead of objects
const noteCache = new Map(); // Better than {}

// Use Sets for unique collections
const tagSet = new Set(); // Better than array with includes()

// Use WeakMap for object associations
const noteMetadata = new WeakMap(); // Automatically garbage collected

// Efficient string operations
const stringBuilder = [];
stringBuilder.push('part1', 'part2', 'part3');
const result = stringBuilder.join(''); // Better than string concatenation
```

## Search Performance

### Search Index Optimization
Optimize search indexing:

```javascript
// Efficient search indexing
class SearchIndexOptimizer {
  constructor() {
    this.stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at']);
    this.stemmer = new PorterStemmer();
  }
  
  indexNote(note) {
    const terms = this.extractTerms(note.content);
    const titleTerms = this.extractTerms(note.title);
    
    // Weight title terms higher
    const weightedTerms = [
      ...terms.map(term => ({ term, weight: 1, noteId: note.id })),
      ...titleTerms.map(term => ({ term, weight: 3, noteId: note.id }))
    ];
    
    return weightedTerms;
  }
  
  extractTerms(text) {
    return text
      .toLowerCase()
      .split(/\W+/)
      .filter(term => term.length > 2 && !this.stopWords.has(term))
      .map(term => this.stemmer.stem(term));
  }
  
  async rebuildIndex() {
    console.log('Rebuilding search index...');
    const startTime = performance.now();
    
    // Clear existing index
    await db.searchIndex.clear();
    
    // Index all notes in batches
    const batchSize = 100;
    let offset = 0;
    let batch;
    
    do {
      batch = await db.notes.offset(offset).limit(batchSize).toArray();
      
      const indexEntries = [];
      for (const note of batch) {
        const terms = this.indexNote(note);
        indexEntries.push(...terms);
      }
      
      await db.searchIndex.bulkAdd(indexEntries);
      offset += batchSize;
      
    } while (batch.length === batchSize);
    
    const duration = performance.now() - startTime;
    console.log(`Search index rebuilt in ${duration.toFixed(2)}ms`);
  }
}
```

### Search Query Optimization
```javascript
// Optimized search queries
class OptimizedSearch {
  async search(query, options = {}) {
    const { limit = 20, offset = 0 } = options;
    
    // Parse and optimize query
    const terms = this.parseQuery(query);
    
    // Use database indexes efficiently
    const results = await this.executeSearch(terms, limit, offset);
    
    return results;
  }
  
  parseQuery(query) {
    // Remove stop words and normalize
    return query
      .toLowerCase()
      .split(/\s+/)
      .filter(term => term.length > 2)
      .map(term => term.replace(/[^\w]/g, ''));
  }
  
  async executeSearch(terms, limit, offset) {
    const scoreMap = new Map();
    
    // Search for each term
    for (const term of terms) {
      const matches = await db.searchIndex
        .where('term')
        .startsWithIgnoreCase(term)
        .limit(1000) // Reasonable limit
        .toArray();
      
      matches.forEach(match => {
        const currentScore = scoreMap.get(match.noteId) || 0;
        scoreMap.set(match.noteId, currentScore + match.weight);
      });
    }
    
    // Sort by score and apply pagination
    const sortedResults = Array.from(scoreMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(offset, offset + limit)
      .map(([noteId]) => noteId);
    
    // Fetch note details
    return await db.notes.where('id').anyOf(sortedResults).toArray();
  }
}
```

## UI Performance

### Virtual Scrolling
Implement virtual scrolling for large lists:

```javascript
// Virtual scrolling component
class VirtualList {
  constructor(container, itemHeight, renderItem) {
    this.container = container;
    this.itemHeight = itemHeight;
    this.renderItem = renderItem;
    this.items = [];
    this.visibleStart = 0;
    this.visibleEnd = 0;
    
    this.setupScrollListener();
  }
  
  setItems(items) {
    this.items = items;
    this.updateVisibleRange();
    this.render();
  }
  
  setupScrollListener() {
    this.container.addEventListener('scroll', () => {
      this.updateVisibleRange();
      this.render();
    });
  }
  
  updateVisibleRange() {
    const scrollTop = this.container.scrollTop;
    const containerHeight = this.container.clientHeight;
    
    this.visibleStart = Math.floor(scrollTop / this.itemHeight);
    this.visibleEnd = Math.min(
      this.items.length,
      this.visibleStart + Math.ceil(containerHeight / this.itemHeight) + 1
    );
  }
  
  render() {
    const visibleItems = this.items.slice(this.visibleStart, this.visibleEnd);
    
    // Create virtual container
    const totalHeight = this.items.length * this.itemHeight;
    const offsetY = this.visibleStart * this.itemHeight;
    
    this.container.innerHTML = `
      <div style="height: ${totalHeight}px; position: relative;">
        <div style="transform: translateY(${offsetY}px);">
          ${visibleItems.map(item => this.renderItem(item)).join('')}
        </div>
      </div>
    `;
  }
}
```

### Debouncing and Throttling
Optimize frequent operations:

```javascript
// Debounce utility
const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(this, args), delay);
  };
};

// Throttle utility
const throttle = (func, limit) => {
  let inThrottle;
  return (...args) => {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

// Usage examples
const debouncedSave = debounce(saveNote, 500);
const throttledScroll = throttle(handleScroll, 16); // ~60fps
```

### Efficient DOM Updates
Minimize DOM manipulation:

```javascript
// Batch DOM updates
const batchDOMUpdates = (updates) => {
  // Use DocumentFragment for multiple insertions
  const fragment = document.createDocumentFragment();
  
  updates.forEach(update => {
    const element = document.createElement(update.tag);
    element.textContent = update.text;
    element.className = update.className;
    fragment.appendChild(element);
  });
  
  // Single DOM insertion
  document.getElementById('container').appendChild(fragment);
};

// Use requestAnimationFrame for smooth animations
const smoothUpdate = (callback) => {
  requestAnimationFrame(() => {
    callback();
  });
};
```

## Network Performance

### Efficient Data Loading
Optimize data loading strategies:

```javascript
// Lazy loading with intersection observer
const lazyLoadImages = () => {
  const imageObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        img.src = img.dataset.src;
        img.removeAttribute('data-src');
        imageObserver.unobserve(img);
      }
    });
  });
  
  document.querySelectorAll('img[data-src]').forEach(img => {
    imageObserver.observe(img);
  });
};

// Preload critical resources
const preloadResources = (urls) => {
  urls.forEach(url => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = url;
    link.as = 'fetch';
    document.head.appendChild(link);
  });
};
```

### Caching Strategies
Implement effective caching:

```javascript
// Multi-level caching
class CacheManager {
  constructor() {
    this.memoryCache = new Map();
    this.maxMemorySize = 100; // Max items in memory
  }
  
  async get(key) {
    // 1. Check memory cache
    if (this.memoryCache.has(key)) {
      return this.memoryCache.get(key);
    }
    
    // 2. Check IndexedDB cache
    const cached = await db.cache.get(key);
    if (cached && !this.isExpired(cached)) {
      this.memoryCache.set(key, cached.data);
      return cached.data;
    }
    
    return null;
  }
  
  async set(key, data, ttl = 3600000) { // 1 hour default
    const cacheEntry = {
      key,
      data,
      timestamp: Date.now(),
      ttl
    };
    
    // Store in memory cache
    if (this.memoryCache.size >= this.maxMemorySize) {
      const firstKey = this.memoryCache.keys().next().value;
      this.memoryCache.delete(firstKey);
    }
    this.memoryCache.set(key, data);
    
    // Store in IndexedDB
    await db.cache.put(cacheEntry);
  }
  
  isExpired(cacheEntry) {
    return Date.now() - cacheEntry.timestamp > cacheEntry.ttl;
  }
}
```

## Performance Best Practices

### Code Optimization
1. **Minimize bundle size**: Use tree shaking and code splitting
2. **Optimize images**: Compress and use appropriate formats
3. **Lazy load components**: Load only when needed
4. **Use efficient algorithms**: Choose appropriate data structures
5. **Avoid memory leaks**: Clean up resources properly

### Database Optimization
1. **Create proper indexes**: Index frequently queried fields
2. **Batch operations**: Group multiple operations together
3. **Use transactions**: Ensure data consistency
4. **Regular maintenance**: Clean up and optimize periodically
5. **Monitor query performance**: Profile slow queries

### UI Optimization
1. **Virtual scrolling**: Handle large lists efficiently
2. **Debounce inputs**: Reduce unnecessary operations
3. **Optimize animations**: Use CSS transforms and opacity
4. **Minimize reflows**: Batch DOM updates
5. **Use efficient selectors**: Optimize CSS and JavaScript selectors

## Performance Testing

### Automated Performance Tests
```javascript
// Performance test suite
class PerformanceTests {
  async runAllTests() {
    const results = {};
    
    results.startup = await this.testStartupTime();
    results.noteLoad = await this.testNoteLoadTime();
    results.search = await this.testSearchPerformance();
    results.save = await this.testSavePerformance();
    
    return results;
  }
  
  async testStartupTime() {
    const start = performance.now();
    await devnotes.initialize();
    const end = performance.now();
    
    return {
      duration: end - start,
      target: 2000, // 2 seconds
      passed: (end - start) < 2000
    };
  }
  
  async testNoteLoadTime() {
    const testNotes = await this.createTestNotes(100);
    const start = performance.now();
    
    for (const note of testNotes) {
      await devnotes.loadNote(note.id);
    }
    
    const end = performance.now();
    const avgTime = (end - start) / testNotes.length;
    
    return {
      averageTime: avgTime,
      target: 50, // 50ms per note
      passed: avgTime < 50
    };
  }
  
  async testSearchPerformance() {
    const queries = ['javascript', 'react hooks', 'database design'];
    const results = [];
    
    for (const query of queries) {
      const start = performance.now();
      await devnotes.search(query);
      const end = performance.now();
      
      results.push(end - start);
    }
    
    const avgTime = results.reduce((a, b) => a + b) / results.length;
    
    return {
      averageTime: avgTime,
      target: 100, // 100ms
      passed: avgTime < 100
    };
  }
}
```

### Performance Monitoring in Production
```javascript
// Production performance monitoring
const setupPerformanceMonitoring = () => {
  // Monitor Core Web Vitals
  new PerformanceObserver((list) => {
    list.getEntries().forEach((entry) => {
      if (entry.entryType === 'largest-contentful-paint') {
        console.log('LCP:', entry.startTime);
      }
      
      if (entry.entryType === 'first-input') {
        console.log('FID:', entry.processingStart - entry.startTime);
      }
      
      if (entry.entryType === 'layout-shift') {
        console.log('CLS:', entry.value);
      }
    });
  }).observe({ entryTypes: ['largest-contentful-paint', 'first-input', 'layout-shift'] });
  
  // Monitor custom metrics
  setInterval(() => {
    const metrics = {
      memory: performance.memory?.usedJSHeapSize,
      timing: performance.timing,
      navigation: performance.navigation
    };
    
    // Send to analytics service
    sendMetrics(metrics);
  }, 60000); // Every minute
};
```

## Next Steps

- **[Learn data recovery techniques](troubleshooting/data-recovery)** - Recover from performance-related data issues
- **[Explore advanced data management](advanced/data-management)** - Optimize data storage and retrieval
- **[Check common issues](troubleshooting/common-issues)** - Solve performance-related problems

Performance optimization is an ongoing process. Regular monitoring and maintenance will keep DevNotes running smoothly even with large note collections.