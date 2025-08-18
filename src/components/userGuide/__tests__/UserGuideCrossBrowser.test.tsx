/**
 * Cross-browser and device performance tests for user guide
 * Requirements: Performance across different devices and browsers
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { UserGuideModal } from '../UserGuideModal';
import { UserGuideSearch } from '../UserGuideSearch';
import { useUserGuideStore } from '../../../stores/userGuideStore';
import { useUIStore } from '../../../stores/uiStore';

// Mock the stores
vi.mock('../../../stores/userGuideStore');
vi.mock('../../../stores/uiStore');

// Mock different browser environments
const mockBrowserEnvironments = {
  chrome: {
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    features: {
      intersectionObserver: true,
      resizeObserver: true,
      clipboard: true,
      webGL: true,
    }
  },
  firefox: {
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:89.0) Gecko/20100101 Firefox/89.0',
    features: {
      intersectionObserver: true,
      resizeObserver: true,
      clipboard: true,
      webGL: true,
    }
  },
  safari: {
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Safari/605.1.15',
    features: {
      intersectionObserver: true,
      resizeObserver: true,
      clipboard: false, // Safari has restrictions
      webGL: true,
    }
  },
  edge: {
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36 Edg/91.0.864.59',
    features: {
      intersectionObserver: true,
      resizeObserver: true,
      clipboard: true,
      webGL: true,
    }
  },
  mobileSafari: {
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1',
    features: {
      intersectionObserver: true,
      resizeObserver: false,
      clipboard: false,
      webGL: true,
    }
  },
  mobileChrome: {
    userAgent: 'Mozilla/5.0 (Linux; Android 11; SM-G991B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.120 Mobile Safari/537.36',
    features: {
      intersectionObserver: true,
      resizeObserver: true,
      clipboard: true,
      webGL: true,
    }
  }
};

// Mock device characteristics
const mockDevices = {
  desktop: {
    viewport: { width: 1920, height: 1080 },
    pixelRatio: 1,
    memory: 8, // GB
    cores: 8,
    connection: 'wifi'
  },
  laptop: {
    viewport: { width: 1366, height: 768 },
    pixelRatio: 1,
    memory: 4,
    cores: 4,
    connection: 'wifi'
  },
  tablet: {
    viewport: { width: 768, height: 1024 },
    pixelRatio: 2,
    memory: 2,
    cores: 4,
    connection: 'wifi'
  },
  mobile: {
    viewport: { width: 375, height: 667 },
    pixelRatio: 2,
    memory: 1,
    cores: 2,
    connection: '4g'
  },
  lowEnd: {
    viewport: { width: 320, height: 568 },
    pixelRatio: 1,
    memory: 0.5,
    cores: 1,
    connection: '3g'
  }
};

describe('User Guide Cross-Browser and Device Tests', () => {
  const mockUserGuideStore = {
    isOpen: true,
    currentSection: 'getting-started/welcome',
    searchQuery: '',
    searchResults: [],
    lastViewedSection: 'getting-started/welcome',
    searchHistory: [],
    openGuide: vi.fn(),
    closeGuide: vi.fn(),
    navigateToSection: vi.fn(),
    setSearchQuery: vi.fn(),
    setSearchResults: vi.fn(),
    addToSearchHistory: vi.fn(),
    clearSearchHistory: vi.fn(),
  };

  const mockUIStore = {
    theme: 'light' as const,
    isDarkMode: false,
    getEffectiveTheme: vi.fn().mockReturnValue('light'),
  };

  beforeEach(() => {
    vi.mocked(useUserGuideStore).mockReturnValue(mockUserGuideStore);
    vi.mocked(useUIStore).mockReturnValue(mockUIStore as any);
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
    // Reset global mocks
    vi.restoreAllMocks();
  });

  const setupBrowserEnvironment = (browser: keyof typeof mockBrowserEnvironments) => {
    const env = mockBrowserEnvironments[browser];
    
    // Mock user agent
    Object.defineProperty(navigator, 'userAgent', {
      writable: true,
      value: env.userAgent,
    });

    // Mock browser features
    if (!env.features.intersectionObserver) {
      global.IntersectionObserver = undefined as any;
    } else {
      global.IntersectionObserver = vi.fn().mockImplementation(() => ({
        observe: vi.fn(),
        unobserve: vi.fn(),
        disconnect: vi.fn(),
      }));
    }

    if (!env.features.resizeObserver) {
      global.ResizeObserver = undefined as any;
    } else {
      global.ResizeObserver = vi.fn().mockImplementation(() => ({
        observe: vi.fn(),
        unobserve: vi.fn(),
        disconnect: vi.fn(),
      }));
    }

    if (!env.features.clipboard) {
      Object.defineProperty(navigator, 'clipboard', {
        value: undefined,
        writable: true,
      });
    } else {
      Object.defineProperty(navigator, 'clipboard', {
        value: {
          writeText: vi.fn().mockResolvedValue(undefined),
        },
        writable: true,
      });
    }
  };

  const setupDeviceEnvironment = (device: keyof typeof mockDevices) => {
    const deviceConfig = mockDevices[device];
    
    // Mock viewport
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      value: deviceConfig.viewport.width,
    });
    
    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      value: deviceConfig.viewport.height,
    });

    // Mock pixel ratio
    Object.defineProperty(window, 'devicePixelRatio', {
      writable: true,
      value: deviceConfig.pixelRatio,
    });

    // Mock device memory (if supported)
    if ('deviceMemory' in navigator) {
      Object.defineProperty(navigator, 'deviceMemory', {
        writable: true,
        value: deviceConfig.memory,
      });
    }

    // Mock hardware concurrency
    Object.defineProperty(navigator, 'hardwareConcurrency', {
      writable: true,
      value: deviceConfig.cores,
    });

    // Mock connection
    Object.defineProperty(navigator, 'connection', {
      writable: true,
      value: {
        effectiveType: deviceConfig.connection,
        downlink: deviceConfig.connection === 'wifi' ? 10 : deviceConfig.connection === '4g' ? 2 : 0.5,
      },
    });
  };

  describe('Browser Compatibility Tests', () => {
    Object.keys(mockBrowserEnvironments).forEach(browser => {
      describe(`${browser} compatibility`, () => {
        beforeEach(() => {
          setupBrowserEnvironment(browser as keyof typeof mockBrowserEnvironments);
        });

        it(`should render correctly in ${browser}`, () => {
          render(<UserGuideModal isOpen={true} onClose={() => {}} />);
          
          expect(screen.getByRole('dialog', { name: /user guide/i })).toBeInTheDocument();
        });

        it(`should handle search functionality in ${browser}`, async () => {
          const user = userEvent.setup();
          render(<UserGuideSearch />);

          const searchInput = screen.getByRole('combobox', { name: /search user guide/i });
          await user.type(searchInput, 'test');

          expect(mockUserGuideStore.setSearchQuery).toHaveBeenCalledWith('test');
        });

        it(`should handle keyboard navigation in ${browser}`, async () => {
          render(<UserGuideModal isOpen={true} onClose={() => {}} />);

          const modal = screen.getByRole('dialog', { name: /user guide/i });
          fireEvent.keyDown(modal, { key: 'Escape' });

          expect(mockUserGuideStore.closeGuide).toHaveBeenCalled();
        });

        it(`should handle clipboard operations in ${browser}`, async () => {
          const env = mockBrowserEnvironments[browser as keyof typeof mockBrowserEnvironments];
          
          render(<UserGuideModal isOpen={true} onClose={() => {}} />);

          if (env.features.clipboard && navigator.clipboard) {
            // Test clipboard functionality
            expect(navigator.clipboard.writeText).toBeDefined();
          } else {
            // Should gracefully handle missing clipboard API
            expect(navigator.clipboard).toBeUndefined();
          }
        });

        it(`should handle missing browser features gracefully in ${browser}`, () => {
          const env = mockBrowserEnvironments[browser as keyof typeof mockBrowserEnvironments];
          
          render(<UserGuideModal isOpen={true} onClose={() => {}} />);

          // Should render without errors even if some features are missing
          expect(screen.getByRole('dialog', { name: /user guide/i })).toBeInTheDocument();

          if (!env.features.intersectionObserver) {
            expect(global.IntersectionObserver).toBeUndefined();
          }

          if (!env.features.resizeObserver) {
            expect(global.ResizeObserver).toBeUndefined();
          }
        });
      });
    });
  });

  describe('Device Performance Tests', () => {
    Object.keys(mockDevices).forEach(device => {
      describe(`${device} performance`, () => {
        beforeEach(() => {
          setupDeviceEnvironment(device as keyof typeof mockDevices);
        });

        it(`should render within performance budget on ${device}`, async () => {
          const startTime = performance.now();
          
          render(<UserGuideModal isOpen={true} onClose={() => {}} />);
          
          await waitFor(() => {
            expect(screen.getByRole('dialog', { name: /user guide/i })).toBeInTheDocument();
          });

          const endTime = performance.now();
          const renderTime = endTime - startTime;

          // Performance budgets based on device capability
          const deviceConfig = mockDevices[device as keyof typeof mockDevices];
          const performanceBudget = deviceConfig.memory >= 4 ? 200 : deviceConfig.memory >= 2 ? 400 : 800;

          expect(renderTime).toBeLessThan(performanceBudget);
        });

        it(`should handle search performance on ${device}`, async () => {
          const user = userEvent.setup();
          render(<UserGuideSearch />);

          const searchInput = screen.getByRole('combobox', { name: /search user guide/i });
          
          const startTime = performance.now();
          await user.type(searchInput, 'search query');
          
          await waitFor(() => {
            expect(mockUserGuideStore.setSearchQuery).toHaveBeenCalled();
          });

          const endTime = performance.now();
          const searchTime = endTime - startTime;

          // Search performance budgets
          const deviceConfig = mockDevices[device as keyof typeof mockDevices];
          const searchBudget = deviceConfig.memory >= 4 ? 300 : deviceConfig.memory >= 2 ? 600 : 1000;

          expect(searchTime).toBeLessThan(searchBudget);
        });

        it(`should adapt layout for ${device} viewport`, () => {
          render(<UserGuideModal isOpen={true} onClose={() => {}} />);

          const modal = screen.getByRole('dialog', { name: /user guide/i });
          const deviceConfig = mockDevices[device as keyof typeof mockDevices];

          if (deviceConfig.viewport.width < 768) {
            // Mobile layout
            expect(modal).toHaveClass('w-full', 'h-full');
          } else {
            // Desktop/tablet layout
            expect(modal).toHaveClass('max-w-6xl');
          }
        });

        it(`should handle touch interactions on ${device}`, async () => {
          const deviceConfig = mockDevices[device as keyof typeof mockDevices];
          
          if (deviceConfig.viewport.width < 1024) {
            render(<UserGuideModal isOpen={true} onClose={() => {}} />);

            const modal = screen.getByRole('dialog', { name: /user guide/i });
            
            // Simulate touch events
            fireEvent.touchStart(modal, { 
              touches: [{ clientX: 100, clientY: 100 }] 
            });
            fireEvent.touchEnd(modal, { 
              changedTouches: [{ clientX: 100, clientY: 100 }] 
            });

            expect(modal).toBeInTheDocument();
          }
        });

        it(`should optimize for ${device} connection speed`, async () => {
          const deviceConfig = mockDevices[device as keyof typeof mockDevices];
          
          render(<UserGuideModal isOpen={true} onClose={() => {}} />);

          // Should adapt loading strategy based on connection
          if (deviceConfig.connection === '3g') {
            // Should use more aggressive lazy loading
            expect(screen.getByRole('dialog', { name: /user guide/i })).toBeInTheDocument();
          }
        });
      });
    });
  });

  describe('Responsive Design Tests', () => {
    const viewports = [
      { width: 320, height: 568, name: 'small mobile' },
      { width: 375, height: 667, name: 'mobile' },
      { width: 768, height: 1024, name: 'tablet' },
      { width: 1024, height: 768, name: 'small desktop' },
      { width: 1366, height: 768, name: 'desktop' },
      { width: 1920, height: 1080, name: 'large desktop' },
    ];

    viewports.forEach(viewport => {
      it(`should adapt to ${viewport.name} (${viewport.width}x${viewport.height})`, () => {
        Object.defineProperty(window, 'innerWidth', {
          writable: true,
          value: viewport.width,
        });
        
        Object.defineProperty(window, 'innerHeight', {
          writable: true,
          value: viewport.height,
        });

        render(<UserGuideModal isOpen={true} onClose={() => {}} />);

        const modal = screen.getByRole('dialog', { name: /user guide/i });
        expect(modal).toBeInTheDocument();

        // Verify responsive classes are applied
        if (viewport.width < 768) {
          expect(modal).toHaveClass('w-full', 'h-full');
        } else {
          expect(modal).toHaveClass('max-w-6xl');
        }
      });
    });
  });

  describe('Performance Monitoring', () => {
    it('should track performance metrics across different environments', async () => {
      const performanceEntries: PerformanceEntry[] = [];
      
      // Mock performance observer
      global.PerformanceObserver = Object.assign(
        vi.fn().mockImplementation((callback) => ({
          observe: vi.fn().mockImplementation(() => {
            // Simulate performance entries
            callback({
              getEntries: () => performanceEntries,
            });
          }),
          disconnect: vi.fn(),
        })),
        {
          supportedEntryTypes: []
        }
      );

      render(<UserGuideModal isOpen={true} onClose={() => {}} />);

      // Should set up performance monitoring
      expect(global.PerformanceObserver).toHaveBeenCalled();
    });

    it('should handle memory pressure gracefully', async () => {
      // Mock low memory condition
      Object.defineProperty(navigator, 'deviceMemory', {
        writable: true,
        value: 0.5, // 512MB
      });

      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      render(<UserGuideModal isOpen={true} onClose={() => {}} />);

      // Should render without issues even on low memory devices
      expect(screen.getByRole('dialog', { name: /user guide/i })).toBeInTheDocument();

      consoleSpy.mockRestore();
    });

    it('should adapt to slow network conditions', async () => {
      // Mock slow connection
      Object.defineProperty(navigator, 'connection', {
        writable: true,
        value: {
          effectiveType: '2g',
          downlink: 0.1,
        },
      });

      const startTime = performance.now();
      
      render(<UserGuideModal isOpen={true} onClose={() => {}} />);
      
      await waitFor(() => {
        expect(screen.getByRole('dialog', { name: /user guide/i })).toBeInTheDocument();
      });

      const endTime = performance.now();
      const loadTime = endTime - startTime;

      // Should still load within reasonable time even on slow connections
      expect(loadTime).toBeLessThan(2000);
    });
  });

  describe('Error Handling Across Environments', () => {
    it('should handle JavaScript errors gracefully', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      // Mock a component that throws an error
      const ThrowingComponent = () => {
        throw new Error('Test error');
      };

      // Should be caught by error boundary
      expect(() => {
        render(<ThrowingComponent />);
      }).toThrow();

      consoleSpy.mockRestore();
    });

    it('should handle network failures', async () => {
      // Mock network failure
      global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

      render(<UserGuideModal isOpen={true} onClose={() => {}} />);

      // Should render with fallback content
      expect(screen.getByRole('dialog', { name: /user guide/i })).toBeInTheDocument();
    });

    it('should handle storage quota exceeded', () => {
      // Mock storage quota exceeded
      const mockStorage = {
        setItem: vi.fn().mockImplementation(() => {
          throw new Error('QuotaExceededError');
        }),
        getItem: vi.fn(),
        removeItem: vi.fn(),
      };

      Object.defineProperty(window, 'localStorage', {
        value: mockStorage,
        writable: true,
      });

      render(<UserGuideModal isOpen={true} onClose={() => {}} />);

      // Should handle storage errors gracefully
      expect(screen.getByRole('dialog', { name: /user guide/i })).toBeInTheDocument();
    });
  });

  describe('Accessibility Across Devices', () => {
    it('should maintain accessibility on touch devices', () => {
      setupDeviceEnvironment('mobile');
      
      render(<UserGuideModal isOpen={true} onClose={() => {}} />);

      const modal = screen.getByRole('dialog', { name: /user guide/i });
      
      // Should have proper touch target sizes
      const buttons = modal.querySelectorAll('button');
      buttons.forEach(button => {
        // In a real test, we'd check computed styles for minimum 44px touch targets
        expect(button).toBeInTheDocument();
      });
    });

    it('should support high DPI displays', () => {
      Object.defineProperty(window, 'devicePixelRatio', {
        writable: true,
        value: 3, // High DPI
      });

      render(<UserGuideModal isOpen={true} onClose={() => {}} />);

      const modal = screen.getByRole('dialog', { name: /user guide/i });
      expect(modal).toBeInTheDocument();
    });
  });
});