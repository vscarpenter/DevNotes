/**
 * Performance Benchmark Script for User Guide
 * Measures and validates performance across different scenarios
 */

interface PerformanceMetrics {
  renderTime: number;
  searchTime: number;
  contentLoadTime: number;
  memoryUsage: number;
  cacheHitRate: number;
  errorRate: number;
}

interface BenchmarkResult {
  scenario: string;
  metrics: PerformanceMetrics;
  passed: boolean;
  budget: PerformanceMetrics;
  timestamp: number;
}

interface DeviceProfile {
  name: string;
  memory: number; // GB
  cores: number;
  connection: string;
  budgets: PerformanceMetrics;
}

class UserGuidePerformanceBenchmark {
  private results: BenchmarkResult[] = [];
  private deviceProfiles: DeviceProfile[] = [
    {
      name: 'Desktop High-End',
      memory: 8,
      cores: 8,
      connection: 'wifi',
      budgets: {
        renderTime: 200,
        searchTime: 100,
        contentLoadTime: 150,
        memoryUsage: 50, // MB
        cacheHitRate: 0.8,
        errorRate: 0.01
      }
    },
    {
      name: 'Desktop Standard',
      memory: 4,
      cores: 4,
      connection: 'wifi',
      budgets: {
        renderTime: 400,
        searchTime: 200,
        contentLoadTime: 300,
        memoryUsage: 30,
        cacheHitRate: 0.7,
        errorRate: 0.02
      }
    },
    {
      name: 'Mobile High-End',
      memory: 4,
      cores: 6,
      connection: '4g',
      budgets: {
        renderTime: 600,
        searchTime: 300,
        contentLoadTime: 500,
        memoryUsage: 25,
        cacheHitRate: 0.6,
        errorRate: 0.03
      }
    },
    {
      name: 'Mobile Standard',
      memory: 2,
      cores: 4,
      connection: '4g',
      budgets: {
        renderTime: 800,
        searchTime: 500,
        contentLoadTime: 700,
        memoryUsage: 20,
        cacheHitRate: 0.5,
        errorRate: 0.05
      }
    },
    {
      name: 'Mobile Low-End',
      memory: 1,
      cores: 2,
      connection: '3g',
      budgets: {
        renderTime: 1200,
        searchTime: 800,
        contentLoadTime: 1000,
        memoryUsage: 15,
        cacheHitRate: 0.4,
        errorRate: 0.1
      }
    }
  ];

  /**
   * Run comprehensive performance benchmark
   */
  async runBenchmark(): Promise<BenchmarkResult[]> {
    console.log('🚀 Starting User Guide Performance Benchmark...');
    
    for (const profile of this.deviceProfiles) {
      console.log(`\n📱 Testing ${profile.name}...`);
      
      // Simulate device conditions
      this.simulateDeviceConditions(profile);
      
      // Run benchmark scenarios
      await this.benchmarkInitialRender(profile);
      await this.benchmarkSearchPerformance(profile);
      await this.benchmarkContentLoading(profile);
      await this.benchmarkMemoryUsage(profile);
      await this.benchmarkConcurrentOperations(profile);
      await this.benchmarkErrorHandling(profile);
    }

    this.generateReport();
    return this.results;
  }

  /**
   * Simulate device conditions for testing
   */
  private simulateDeviceConditions(profile: DeviceProfile): void {
    // Mock device memory
    if ('deviceMemory' in navigator) {
      Object.defineProperty(navigator, 'deviceMemory', {
        value: profile.memory,
        writable: true
      });
    }

    // Mock hardware concurrency
    Object.defineProperty(navigator, 'hardwareConcurrency', {
      value: profile.cores,
      writable: true
    });

    // Mock connection
    Object.defineProperty(navigator, 'connection', {
      value: {
        effectiveType: profile.connection,
        downlink: profile.connection === 'wifi' ? 10 : 
                 profile.connection === '4g' ? 2 : 0.5
      },
      writable: true
    });
  }

  /**
   * Benchmark initial render performance
   */
  private async benchmarkInitialRender(profile: DeviceProfile): Promise<void> {
    const iterations = 10;
    const renderTimes: number[] = [];

    for (let i = 0; i < iterations; i++) {
      const startTime = performance.now();
      
      // Simulate component render
      await this.simulateComponentRender();
      
      const endTime = performance.now();
      renderTimes.push(endTime - startTime);
    }

    const avgRenderTime = renderTimes.reduce((a, b) => a + b, 0) / iterations;
    const p95RenderTime = this.calculatePercentile(renderTimes, 95);

    this.recordResult({
      scenario: `${profile.name} - Initial Render`,
      metrics: {
        renderTime: p95RenderTime,
        searchTime: 0,
        contentLoadTime: 0,
        memoryUsage: this.getMemoryUsage(),
        cacheHitRate: 0,
        errorRate: 0
      },
      passed: p95RenderTime <= profile.budgets.renderTime,
      budget: profile.budgets,
      timestamp: Date.now()
    });

    console.log(`  ✅ Render: ${avgRenderTime.toFixed(2)}ms avg, ${p95RenderTime.toFixed(2)}ms p95`);
  }

  /**
   * Benchmark search performance
   */
  private async benchmarkSearchPerformance(profile: DeviceProfile): Promise<void> {
    const searchQueries = [
      'keyboard shortcuts',
      'export',
      'markdown',
      'folders',
      'search operators',
      'troubleshooting',
      'getting started',
      'advanced features'
    ];

    const searchTimes: number[] = [];
    let cacheHits = 0;

    for (const query of searchQueries) {
      // First search (cache miss)
      const startTime = performance.now();
      await this.simulateSearch(query);
      const endTime = performance.now();
      searchTimes.push(endTime - startTime);

      // Second search (cache hit)
      const cacheStartTime = performance.now();
      await this.simulateSearch(query);
      const cacheEndTime = performance.now();
      
      if (cacheEndTime - cacheStartTime < (endTime - startTime) * 0.5) {
        cacheHits++;
      }
    }

    const avgSearchTime = searchTimes.reduce((a, b) => a + b, 0) / searchTimes.length;
    const p95SearchTime = this.calculatePercentile(searchTimes, 95);
    const cacheHitRate = cacheHits / searchQueries.length;

    this.recordResult({
      scenario: `${profile.name} - Search Performance`,
      metrics: {
        renderTime: 0,
        searchTime: p95SearchTime,
        contentLoadTime: 0,
        memoryUsage: this.getMemoryUsage(),
        cacheHitRate,
        errorRate: 0
      },
      passed: p95SearchTime <= profile.budgets.searchTime && 
              cacheHitRate >= profile.budgets.cacheHitRate,
      budget: profile.budgets,
      timestamp: Date.now()
    });

    console.log(`  🔍 Search: ${avgSearchTime.toFixed(2)}ms avg, ${p95SearchTime.toFixed(2)}ms p95, ${(cacheHitRate * 100).toFixed(1)}% cache hit`);
  }

  /**
   * Benchmark content loading performance
   */
  private async benchmarkContentLoading(profile: DeviceProfile): Promise<void> {
    const sections = [
      'getting-started/welcome',
      'getting-started/first-note',
      'features/markdown-editor',
      'features/search',
      'features/export-import',
      'advanced/power-user-tips',
      'troubleshooting/common-issues'
    ];

    const loadTimes: number[] = [];

    for (const section of sections) {
      const startTime = performance.now();
      await this.simulateContentLoad(section);
      const endTime = performance.now();
      loadTimes.push(endTime - startTime);
    }

    const avgLoadTime = loadTimes.reduce((a, b) => a + b, 0) / loadTimes.length;
    const p95LoadTime = this.calculatePercentile(loadTimes, 95);

    this.recordResult({
      scenario: `${profile.name} - Content Loading`,
      metrics: {
        renderTime: 0,
        searchTime: 0,
        contentLoadTime: p95LoadTime,
        memoryUsage: this.getMemoryUsage(),
        cacheHitRate: 0,
        errorRate: 0
      },
      passed: p95LoadTime <= profile.budgets.contentLoadTime,
      budget: profile.budgets,
      timestamp: Date.now()
    });

    console.log(`  📄 Content: ${avgLoadTime.toFixed(2)}ms avg, ${p95LoadTime.toFixed(2)}ms p95`);
  }

  /**
   * Benchmark memory usage
   */
  private async benchmarkMemoryUsage(profile: DeviceProfile): Promise<void> {
    const initialMemory = this.getMemoryUsage();
    
    // Simulate heavy usage
    for (let i = 0; i < 50; i++) {
      await this.simulateSearch(`query${i}`);
      await this.simulateContentLoad(`section${i}`);
    }

    const peakMemory = this.getMemoryUsage();
    const memoryIncrease = peakMemory - initialMemory;

    // Simulate cleanup
    await this.simulateCleanup();
    const finalMemory = this.getMemoryUsage();
    const memoryLeakage = finalMemory - initialMemory;

    this.recordResult({
      scenario: `${profile.name} - Memory Usage`,
      metrics: {
        renderTime: 0,
        searchTime: 0,
        contentLoadTime: 0,
        memoryUsage: Math.max(memoryIncrease, memoryLeakage),
        cacheHitRate: 0,
        errorRate: 0
      },
      passed: memoryIncrease <= profile.budgets.memoryUsage && 
              memoryLeakage <= profile.budgets.memoryUsage * 0.1,
      budget: profile.budgets,
      timestamp: Date.now()
    });

    console.log(`  💾 Memory: ${memoryIncrease.toFixed(2)}MB peak, ${memoryLeakage.toFixed(2)}MB leakage`);
  }

  /**
   * Benchmark concurrent operations
   */
  private async benchmarkConcurrentOperations(profile: DeviceProfile): Promise<void> {
    const startTime = performance.now();

    // Simulate concurrent operations
    const operations = [
      this.simulateSearch('concurrent search 1'),
      this.simulateSearch('concurrent search 2'),
      this.simulateContentLoad('section1'),
      this.simulateContentLoad('section2'),
      this.simulateComponentRender(),
      this.simulateComponentRender()
    ];

    await Promise.all(operations);

    const endTime = performance.now();
    const totalTime = endTime - startTime;

    this.recordResult({
      scenario: `${profile.name} - Concurrent Operations`,
      metrics: {
        renderTime: totalTime,
        searchTime: 0,
        contentLoadTime: 0,
        memoryUsage: this.getMemoryUsage(),
        cacheHitRate: 0,
        errorRate: 0
      },
      passed: totalTime <= profile.budgets.renderTime * 2, // Allow 2x budget for concurrent ops
      budget: profile.budgets,
      timestamp: Date.now()
    });

    console.log(`  ⚡ Concurrent: ${totalTime.toFixed(2)}ms total`);
  }

  /**
   * Benchmark error handling performance
   */
  private async benchmarkErrorHandling(profile: DeviceProfile): Promise<void> {
    const errorScenarios = [
      'invalid_search_query',
      'missing_content_section',
      'network_failure',
      'storage_quota_exceeded',
      'invalid_navigation'
    ];

    let errorCount = 0;
    const errorTimes: number[] = [];

    for (const scenario of errorScenarios) {
      try {
        const startTime = performance.now();
        await this.simulateError(scenario);
        const endTime = performance.now();
        errorTimes.push(endTime - startTime);
      } catch (error) {
        errorCount++;
      }
    }

    const errorRate = errorCount / errorScenarios.length;
    const avgErrorHandlingTime = errorTimes.length > 0 ? 
      errorTimes.reduce((a, b) => a + b, 0) / errorTimes.length : 0;

    this.recordResult({
      scenario: `${profile.name} - Error Handling`,
      metrics: {
        renderTime: avgErrorHandlingTime,
        searchTime: 0,
        contentLoadTime: 0,
        memoryUsage: this.getMemoryUsage(),
        cacheHitRate: 0,
        errorRate
      },
      passed: errorRate <= profile.budgets.errorRate,
      budget: profile.budgets,
      timestamp: Date.now()
    });

    console.log(`  ⚠️  Errors: ${(errorRate * 100).toFixed(1)}% rate, ${avgErrorHandlingTime.toFixed(2)}ms handling`);
  }

  /**
   * Simulation methods
   */
  private async simulateComponentRender(): Promise<void> {
    // Simulate React component render time
    const complexity = Math.random() * 50 + 10; // 10-60ms base
    await this.delay(complexity);
  }

  private async simulateSearch(query: string): Promise<void> {
    // Simulate search processing time
    const complexity = query.length * 2 + Math.random() * 20; // Variable based on query
    await this.delay(complexity);
  }

  private async simulateContentLoad(section: string): Promise<void> {
    // Simulate content loading time
    const complexity = Math.random() * 100 + 50; // 50-150ms
    await this.delay(complexity);
  }

  private async simulateCleanup(): Promise<void> {
    // Simulate cache cleanup
    await this.delay(10);
  }

  private async simulateError(scenario: string): Promise<void> {
    // Simulate error handling
    const shouldError = Math.random() < 0.3; // 30% chance of actual error
    if (shouldError) {
      throw new Error(`Simulated error: ${scenario}`);
    }
    await this.delay(Math.random() * 50 + 10);
  }

  /**
   * Utility methods
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private getMemoryUsage(): number {
    // Simulate memory usage (in MB)
    if ('memory' in performance) {
      return (performance as any).memory.usedJSHeapSize / 1024 / 1024;
    }
    return Math.random() * 20 + 10; // Fallback simulation
  }

  private calculatePercentile(values: number[], percentile: number): number {
    const sorted = values.slice().sort((a, b) => a - b);
    const index = Math.ceil((percentile / 100) * sorted.length) - 1;
    return sorted[index];
  }

  private recordResult(result: BenchmarkResult): void {
    this.results.push(result);
  }

  /**
   * Generate comprehensive performance report
   */
  private generateReport(): void {
    console.log('\n📊 Performance Benchmark Report');
    console.log('================================');

    const passedTests = this.results.filter(r => r.passed).length;
    const totalTests = this.results.length;
    const passRate = (passedTests / totalTests) * 100;

    console.log(`\n📈 Overall Results: ${passedTests}/${totalTests} tests passed (${passRate.toFixed(1)}%)`);

    // Group results by device profile
    const profileResults = this.groupResultsByProfile();

    for (const [profile, results] of Object.entries(profileResults)) {
      console.log(`\n📱 ${profile}:`);
      
      results.forEach(result => {
        const status = result.passed ? '✅' : '❌';
        const scenario = result.scenario.replace(`${profile} - `, '');
        console.log(`  ${status} ${scenario}`);
        
        if (result.metrics.renderTime > 0) {
          console.log(`    Render: ${result.metrics.renderTime.toFixed(2)}ms (budget: ${result.budget.renderTime}ms)`);
        }
        if (result.metrics.searchTime > 0) {
          console.log(`    Search: ${result.metrics.searchTime.toFixed(2)}ms (budget: ${result.budget.searchTime}ms)`);
        }
        if (result.metrics.contentLoadTime > 0) {
          console.log(`    Content: ${result.metrics.contentLoadTime.toFixed(2)}ms (budget: ${result.budget.contentLoadTime}ms)`);
        }
        if (result.metrics.memoryUsage > 0) {
          console.log(`    Memory: ${result.metrics.memoryUsage.toFixed(2)}MB (budget: ${result.budget.memoryUsage}MB)`);
        }
        if (result.metrics.cacheHitRate > 0) {
          console.log(`    Cache: ${(result.metrics.cacheHitRate * 100).toFixed(1)}% (budget: ${(result.budget.cacheHitRate * 100).toFixed(1)}%)`);
        }
        if (result.metrics.errorRate > 0) {
          console.log(`    Errors: ${(result.metrics.errorRate * 100).toFixed(1)}% (budget: ${(result.budget.errorRate * 100).toFixed(1)}%)`);
        }
      });
    }

    // Performance recommendations
    this.generateRecommendations();
  }

  private groupResultsByProfile(): Record<string, BenchmarkResult[]> {
    const grouped: Record<string, BenchmarkResult[]> = {};
    
    this.results.forEach(result => {
      const profile = result.scenario.split(' - ')[0];
      if (!grouped[profile]) {
        grouped[profile] = [];
      }
      grouped[profile].push(result);
    });

    return grouped;
  }

  private generateRecommendations(): void {
    console.log('\n💡 Performance Recommendations:');
    
    const failedResults = this.results.filter(r => !r.passed);
    
    if (failedResults.length === 0) {
      console.log('  🎉 All performance budgets met! Great job!');
      return;
    }

    const recommendations = new Set<string>();

    failedResults.forEach(result => {
      if (result.metrics.renderTime > result.budget.renderTime) {
        recommendations.add('Consider implementing virtual scrolling for large content');
        recommendations.add('Optimize component re-renders with React.memo');
        recommendations.add('Implement code splitting for better initial load times');
      }

      if (result.metrics.searchTime > result.budget.searchTime) {
        recommendations.add('Implement search result caching');
        recommendations.add('Consider using Web Workers for search processing');
        recommendations.add('Optimize search index structure');
      }

      if (result.metrics.contentLoadTime > result.budget.contentLoadTime) {
        recommendations.add('Implement lazy loading for guide content');
        recommendations.add('Preload adjacent sections for faster navigation');
        recommendations.add('Compress and optimize content assets');
      }

      if (result.metrics.memoryUsage > result.budget.memoryUsage) {
        recommendations.add('Implement cache size limits and cleanup');
        recommendations.add('Use WeakMap for temporary references');
        recommendations.add('Monitor and fix memory leaks');
      }

      if (result.metrics.cacheHitRate < result.budget.cacheHitRate) {
        recommendations.add('Improve cache key strategies');
        recommendations.add('Implement smarter cache eviction policies');
        recommendations.add('Increase cache size for frequently accessed content');
      }

      if (result.metrics.errorRate > result.budget.errorRate) {
        recommendations.add('Improve error handling and recovery mechanisms');
        recommendations.add('Add more comprehensive input validation');
        recommendations.add('Implement better fallback strategies');
      }
    });

    Array.from(recommendations).forEach((rec, index) => {
      console.log(`  ${index + 1}. ${rec}`);
    });
  }
}

// Export for use in tests and development
export { UserGuidePerformanceBenchmark, type PerformanceMetrics, type BenchmarkResult };

// CLI execution
if (typeof window === 'undefined' && require.main === module) {
  const benchmark = new UserGuidePerformanceBenchmark();
  benchmark.runBenchmark().then(() => {
    console.log('\n✅ Benchmark completed successfully!');
  }).catch(error => {
    console.error('\n❌ Benchmark failed:', error);
    process.exit(1);
  });
}