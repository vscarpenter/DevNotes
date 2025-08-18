/**
 * UserGuideContent - Content display area with markdown rendering
 * Requirements: 2.1, 2.2, 2.4
 */

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Copy, Check, ExternalLink } from 'lucide-react';
import { useUserGuideStore } from '../../stores/userGuideStore';
import { loadGuideContent, getSectionById } from '../../content/userGuide/contentLoader';
import { GuideContent, GuideSection } from '../../types/userGuide';
import { Button } from '../ui/button';
import { processMarkdown } from '../../lib/utils/markdownProcessor';
import { 
  LazyContentLoader, 
  PerformanceMonitor, 
  VirtualScrollManager 
} from '../../lib/userGuide/performanceOptimizations';

interface UserGuideContentProps {
  className?: string;
}

interface CopyState {
  [key: string]: boolean;
}

export const UserGuideContent: React.FC<UserGuideContentProps> = ({ className = '' }) => {
  const { currentSection, navigateToSection } = useUserGuideStore();
  const [guideContent, setGuideContent] = useState<GuideContent | null>(null);
  const [currentSectionData, setCurrentSectionData] = useState<GuideSection | null>(null);
  const [processedContent, setProcessedContent] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copyStates, setCopyStates] = useState<CopyState>({});
  const contentRef = useRef<HTMLDivElement>(null);
  const virtualScrollRef = useRef<VirtualScrollManager | null>(null);

  // Helper function to get adjacent sections for preloading
  const getAdjacentSections = useCallback((sectionId: string): string[] => {
    const allSections = [
      'getting-started/welcome',
      'getting-started/first-note', 
      'getting-started/organizing-notes',
      'features/markdown-editor',
      'features/search',
      'features/export-import',
      'features/keyboard-shortcuts',
      'advanced/power-user-tips',
      'advanced/customization',
      'advanced/data-management',
      'troubleshooting/common-issues',
      'troubleshooting/performance',
      'troubleshooting/data-recovery'
    ];
    
    const currentIndex = allSections.indexOf(sectionId);
    const adjacent: string[] = [];
    
    if (currentIndex > 0) {
      adjacent.push(allSections[currentIndex - 1]);
    }
    if (currentIndex < allSections.length - 1) {
      adjacent.push(allSections[currentIndex + 1]);
    }
    
    return adjacent;
  }, []);

  // Load guide content on mount (lazy loading)
  useEffect(() => {
    const loadContent = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Use performance monitoring
        await PerformanceMonitor.measureAsyncRenderTime(async () => {
          const content = await loadGuideContent();
          setGuideContent(content);
        });
        
        // Preload adjacent sections for better UX
        if (currentSection) {
          const adjacentSections = getAdjacentSections(currentSection);
          adjacentSections.forEach(sectionId => {
            LazyContentLoader.preloadSection(sectionId);
          });
        }
      } catch (err) {
        console.error('Failed to load guide content:', err);
        setError('Failed to load guide content. Please try again.');
      } finally {
        setIsLoading(false);
        PerformanceMonitor.logPerformanceWarnings();
      }
    };

    loadContent();
  }, [currentSection]);

  // Update current section data when section changes (with lazy loading)
  useEffect(() => {
    const loadSectionData = async () => {
      if (!currentSection) {
        setCurrentSectionData(null);
        setProcessedContent('');
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        // Use lazy loading for section content
        const sectionData = await LazyContentLoader.loadSection(currentSection);
        setCurrentSectionData(sectionData);

        if (sectionData) {
          // Process markdown content with performance monitoring
          await PerformanceMonitor.measureAsyncRenderTime(async () => {
            const html = await processMarkdown(sectionData.content);
            setProcessedContent(html);
          });
        }
      } catch (err) {
        console.error('Failed to load section data:', err);
        setError(`Failed to load section: ${err instanceof Error ? err.message : 'Unknown error'}`);
        setProcessedContent('');
      } finally {
        setIsLoading(false);
        PerformanceMonitor.logPerformanceWarnings();
      }
    };

    loadSectionData();
  }, [currentSection]);

  // Smooth scroll to top when section changes
  useEffect(() => {
    if (contentRef.current && typeof contentRef.current.scrollTo === 'function') {
      contentRef.current.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
  }, [currentSection]);

  // Copy to clipboard functionality
  const copyToClipboard = useCallback(async (text: string, codeId: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopyStates(prev => ({ ...prev, [codeId]: true }));
      
      // Reset copy state after 2 seconds
      setTimeout(() => {
        setCopyStates(prev => ({ ...prev, [codeId]: false }));
      }, 2000);
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
    }
  }, []);

  // Add copy buttons to code blocks after content is rendered
  useEffect(() => {
    if (!contentRef.current || !processedContent) return;

    const codeBlocks = contentRef.current.querySelectorAll('pre code');
    
    codeBlocks.forEach((codeBlock, index) => {
      const pre = codeBlock.parentElement;
      if (!pre || pre.querySelector('.copy-button-container')) return;

      const codeId = `code-${currentSection}-${index}`;
      const codeText = codeBlock.textContent || '';

      // Add accessibility attributes to code block
      codeBlock.setAttribute('role', 'code');
      codeBlock.setAttribute('aria-label', `Code example ${index + 1}`);
      pre.setAttribute('tabindex', '0');
      pre.setAttribute('aria-label', `Code block ${index + 1}: ${codeText.substring(0, 50)}...`);

      // Create copy button container
      const copyContainer = document.createElement('div');
      copyContainer.className = 'copy-button-container absolute top-2 right-2 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity duration-200';
      
      // Create copy button
      const copyButton = document.createElement('button');
      copyButton.className = 'flex items-center gap-1 px-2 py-1 text-xs bg-gray-800 text-white rounded border border-gray-600 hover:bg-gray-700 focus:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors';
      copyButton.setAttribute('aria-label', `Copy code example ${index + 1} to clipboard`);
      copyButton.setAttribute('type', 'button');
      
      const updateButtonContent = (copied: boolean) => {
        copyButton.innerHTML = copied 
          ? '<svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path></svg><span>Copied!</span>'
          : '<svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true"><path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z"></path><path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z"></path></svg><span>Copy</span>';
        
        // Update aria-label when state changes
        copyButton.setAttribute('aria-label', copied 
          ? `Code example ${index + 1} copied to clipboard`
          : `Copy code example ${index + 1} to clipboard`
        );
      };

      updateButtonContent(false);

      copyButton.addEventListener('click', () => {
        copyToClipboard(codeText, codeId);
      });

      // Handle keyboard interaction for copy button
      copyButton.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          copyToClipboard(codeText, codeId);
        }
      });

      // Update button when copy state changes
      const updateButton = () => {
        updateButtonContent(copyStates[codeId] || false);
      };

      // Watch for copy state changes
      const observer = new MutationObserver(updateButton);
      observer.observe(document.body, { attributes: true, subtree: true });

      copyContainer.appendChild(copyButton);
      
      // Make pre element relative and add group class for hover effects
      pre.style.position = 'relative';
      pre.classList.add('group');
      pre.appendChild(copyContainer);
    });

    // Add accessibility attributes to other elements
    const headings = contentRef.current.querySelectorAll('h1, h2, h3, h4, h5, h6');
    headings.forEach((heading, index) => {
      if (!heading.id) {
        heading.id = `heading-${currentSection}-${index}`;
      }
      heading.setAttribute('tabindex', '0');
    });

    // Add accessibility to links
    const links = contentRef.current.querySelectorAll('a');
    links.forEach((link) => {
      const href = link.getAttribute('href');
      if (href?.startsWith('http')) {
        link.setAttribute('aria-label', `${link.textContent} (opens in new tab)`);
        link.setAttribute('rel', 'noopener noreferrer');
      }
    });

    // Add accessibility to images
    const images = contentRef.current.querySelectorAll('img');
    images.forEach((img) => {
      if (!img.getAttribute('alt')) {
        img.setAttribute('alt', 'Guide illustration');
      }
      img.setAttribute('role', 'img');
    });

  }, [processedContent, currentSection, copyStates, copyToClipboard]);

  // Handle internal link navigation
  const handleLinkClick = useCallback((event: React.MouseEvent) => {
    const target = event.target as HTMLElement;
    const link = target.closest('a');
    
    if (!link) return;

    const href = link.getAttribute('href');
    if (!href) return;

    // Handle internal guide links
    if (href.startsWith('getting-started/') || 
        href.startsWith('features/') || 
        href.startsWith('advanced/') || 
        href.startsWith('troubleshooting/')) {
      event.preventDefault();
      navigateToSection(href);
      return;
    }

    // Handle external links - open in new tab
    if (href.startsWith('http://') || href.startsWith('https://')) {
      event.preventDefault();
      window.open(href, '_blank', 'noopener,noreferrer');
      return;
    }
  }, [navigateToSection]);

  // Loading state
  if (isLoading) {
    return (
      <div className={`flex items-center justify-center h-full ${className}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-500 dark:text-gray-400">Loading guide content...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className={`flex items-center justify-center h-full ${className}`}>
        <div className="text-center max-w-md">
          <div className="text-red-500 mb-4">
            <ExternalLink className="w-12 h-12 mx-auto" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Content Unavailable
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            {error}
          </p>
          <Button
            onClick={() => window.location.reload()}
            variant="outline"
            size="sm"
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  // No content state
  if (!currentSectionData) {
    return (
      <div className={`flex items-center justify-center h-full ${className}`}>
        <div className="text-center">
          <p className="text-gray-500 dark:text-gray-400">
            Section not found. Please select a valid section from the navigation.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* Content Header */}
      <div className="flex-shrink-0 border-b border-gray-200 dark:border-gray-700 pb-4 mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
          {currentSectionData.title}
        </h1>
        <div className="flex items-center gap-2 mt-2 text-sm text-gray-500 dark:text-gray-400">
          <span className="capitalize">
            {currentSectionData.category.replace('-', ' ')}
          </span>
          <span>•</span>
          <span>{currentSectionData.id}</span>
        </div>
      </div>

      {/* Content Body */}
      <div
        ref={contentRef}
        className="flex-1 overflow-y-auto prose prose-gray dark:prose-invert max-w-none prose-headings:scroll-mt-6 prose-code:text-sm prose-pre:bg-gray-900 prose-pre:text-gray-100"
        onClick={handleLinkClick}
        dangerouslySetInnerHTML={{ __html: processedContent }}
        role="main"
        aria-label={`${currentSectionData.title} content`}
        aria-live="polite"
        aria-atomic="false"
        tabIndex={0}
      />
    </div>
  );
};