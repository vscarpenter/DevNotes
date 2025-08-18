/**
 * Performance benchmark utility for user guide optimizations
 * Requirements: 1.4, 1.5
 */

import { 
  LazyContentLoader, 
  OptimizedSearch, 
  PerformanceMonitor 
} from './performanceOptimizations';
import { GuideSection } from '../../types/userGuide';

interface BenchmarkResult {
  operation: string;
  averageTime: number;
  minTime: number;
  maxTime: number;
  iterations: number;
  cacheHitRate?: number;
}

export class PerformanceBenchmark {
  private static results: BenchmarkResult[] = [];

  /**
   * Benchmark search performance
   */
  static async benchmarkSearch(queries: string[], iterations: number = 10): Promise<BenchmarkResult> {
    const times: number[] = [];
    let cacheHits = 0;
    
    // Mock search function
    const mockSearchFunction = async (query: string): Promise<GuideSection[]> => {
      // Simulate search work
      await new Promise(resolve => setTimeout(resolve, Math.random() * 10));
      
      return [
        {
          id: 'test-section',
          title: `Results for ${query}`,
          content: `Content matching ${query}`,
          searchKeywords: [query],
          category: 'getting-started' as const
        }
      ];
    };

    console.log(`🔍 Benchmarking search performance with ${queries.length} queries, ${iterations} iterations each...`);

    for (let i = 0; i < iterations; i++) {
      for (const query of queries) {
        const startTime = performance.now();
        
        // Check if this would be a cache hit
        const cacheSize = OptimizedSearch.getSearchCacheSize();
        
        await OptimizedSearch.search(query, mockSearchFunction);
        
        const endTime = performance.now();
        const duration = endTime - startTime;
        times.push(duration);
        
        // Check if cache size increased (indicating cache miss)
        if (OptimizedSearch.getSearchCacheSize() === cacheSize) {
          cacheHits++;
        }
      }
    }

    const result: BenchmarkResult = {
      operation: 'Search',
      averageTime: times.reduce((a, b) => a + b, 0) / times.length,
      minTime: Math.min(...times),
      maxTime: Math.max(...times),
      iterations: times.length,
      cacheHitRate: cacheHits / times.length
    };

    this.results.push(result);
    return result;
  }

  /**
   * Benchmark content loading performance
   */
  static async benchmarkContentLoading(sectionIds: string[], iterations: number = 10): Promise<BenchmarkResult> {
    const times: number[] = [];
    
    console.log(`📄 Benchmarking content loading with ${sectionIds.length} sections, ${iterations} iterations each...`);

    for (let i = 0; i < iterations; i++) {
      for (const sectionId of sectionIds) {
        // Clear cache to ensure fresh load
        if (i === 0) {
          LazyContentLoader.clearCache();
        }
        
        const startTime = performance.now();
        await LazyContentLoader.loadSection(sectionId);
        const endTime = performance.now();
        
        times.push(endTime - startTime);
      }
    }

    const result: BenchmarkResult = {
      operation: 'Content Loading',
      averageTime: times.reduce((a, b) => a + b, 0) / times.length,
      minTime: Math.min(...times),
      maxTime: Math.max(...times),
      iterations: times.length
    };

    this.results.push(result);
    return result;
  }

  /**
   * Benchmark concurrent operations
   */
  static async benchmarkConcurrentOperations(iterations: number = 5): Promise<BenchmarkResult> {
    const times: number[] = [];
    
    console.log(`⚡ Benchmarking concurrent operations with ${iterations} iterations...`);

    const queries = ['welcome', 'markdown', 'search', 'export', 'shortcuts'];
    const sections = [
      'getting-started/welcome',
      'features/markdown-editor',
      'features/search',
      'features/export-import',
      'features/keyboard-shortcuts'
    ];

    const mockSearchFunction = async (query: string): Promise<GuideSection[]> => {
      await new Promise(resolve => setTimeout(resolve, Math.random() * 5));
      return [];
    };

    for (let i = 0; i < iterations; i++) {
      const startTime = performance.now();
      
      // Perform multiple operations concurrently
      await Promise.all([
        ...queries.map(query => OptimizedSearch.search(query, mockSearchFunction)),
        ...sections.map(section => LazyContentLoader.loadSection(section))
      ]);
      
      const endTime = performance.now();
      times.push(endTime - startTime);
    }

    const result: BenchmarkResult = {
      operation: 'Concurrent Operations',
      averageTime: times.reduce((a, b) => a + b, 0) / times.length,
      minTime: Math.min(...times),
      maxTime: Math.max(...times),
      iterations: times.length
    };

    this.results.push(result);
    return result;
  }

  /**
   * Run comprehensive benchmark suite
   */
  static async runBenchmarkSuite(): Promise<BenchmarkResult[]> {
    console.log('🚀 Starting User Guide Performance Benchmark Suite...\n');
    
    // Clear all caches to start fresh
    LazyContentLoader.clearCache();
    OptimizedSearch.clearSearchCache();
    PerformanceMonitor.resetMetrics();

    const searchQueries = [
      'welcome', 'getting started', 'markdown', 'editor', 'search',
      'export', 'import', 'shortcuts', 'keyboard', 'advanced',
      'power user', 'customization', 'troubleshooting', 'performance'
    ];

    const contentSections = [
      'getting-started/welcome',
      'getting-started/first-note',
      'getting-started/organizing-notes',
      'features/markdown-editor',
      'features/search',
      'features/export-import',
      'features/keyboard-shortcuts',
      'advanced/power-user-tips',
      'advanced/customization',
      'troubleshooting/common-issues'
    ];

    // Run benchmarks
    const searchResult = await this.benchmarkSearch(searchQueries, 5);
    const contentResult = await this.benchmarkContentLoading(contentSections, 3);
    const concurrentResult = await this.benchmarkConcurrentOperations(5);

    // Print results
    console.log('\n📊 Benchmark Results:');
    console.log('='.repeat(60));
    
    this.results.forEach(result => {
      console.log(`\n${result.operation}:`);
      console.log(`  Average Time: ${result.averageTime.toFixed(2)}ms`);
      console.log(`  Min Time: ${result.minTime.toFixed(2)}ms`);
      console.log(`  Max Time: ${result.maxTime.toFixed(2)}ms`);
      console.log(`  Iterations: ${result.iterations}`);
      
      if (result.cacheHitRate !== undefined) {
        console.log(`  Cache Hit Rate: ${(result.cacheHitRate * 100).toFixed(1)}%`);
      }
      
      // Performance assessment
      if (result.operation === 'Search' && result.averageTime > 100) {
        console.log(`  ⚠️  Warning: Average search time exceeds 100ms target`);
      } else if (result.operation === 'Content Loading' && result.averageTime > 200) {
        console.log(`  ⚠️  Warning: Average content loading time exceeds 200ms target`);
      } else {
        console.log(`  ✅ Performance target met`);
      }
    });

    console.log('\n🎯 Performance Summary:');
    const searchPerfMet = searchResult.averageTime <= 100;
    const contentPerfMet = contentResult.averageTime <= 200;
    const concurrentPerfMet = concurrentResult.averageTime <= 300;

    console.log(`  Search Performance: ${searchPerfMet ? '✅' : '❌'} (${searchResult.averageTime.toFixed(2)}ms avg)`);
    console.log(`  Content Loading: ${contentPerfMet ? '✅' : '❌'} (${contentResult.averageTime.toFixed(2)}ms avg)`);
    console.log(`  Concurrent Ops: ${concurrentPerfMet ? '✅' : '❌'} (${concurrentResult.averageTime.toFixed(2)}ms avg)`);

    const overallScore = [searchPerfMet, contentPerfMet, concurrentPerfMet].filter(Boolean).length;
    console.log(`\n🏆 Overall Performance Score: ${overallScore}/3`);

    return this.results;
  }

  /**
   * Get benchmark results
   */
  static getResults(): BenchmarkResult[] {
    return [...this.results];
  }

  /**
   * Clear benchmark results
   */
  static clearResults(): void {
    this.results = [];
  }

  /**
   * Export results to JSON
   */
  static exportResults(): string {
    return JSON.stringify({
      timestamp: new Date().toISOString(),
      results: this.results,
      environment: {
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'Node.js',
        platform: typeof navigator !== 'undefined' ? navigator.platform : 'server'
      }
    }, null, 2);
  }
}

// Export for use in development/testing
if (typeof window !== 'undefined') {
  (window as any).UserGuideBenchmark = PerformanceBenchmark;
}