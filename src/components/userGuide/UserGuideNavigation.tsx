/**
 * UserGuideNavigation - Table of contents and navigation for the user guide
 * Requirements: 1.2, 1.3, 3.4
 */

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { ChevronDown, ChevronRight, BookOpen, Wrench, Zap, AlertTriangle } from 'lucide-react';
import { useUserGuideStore } from '../../stores/userGuideStore';
import guideContent, { loadGuideContent, populateGuideContent } from '../../content/userGuide/guideContent';
import { GuideCategory, GuideSection } from '../../types/userGuide';

interface NavigationSection {
  category: GuideCategory;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  sections: GuideSection[];
  isExpanded: boolean;
}

interface UserGuideNavigationProps {
  className?: string;
}

const categoryConfig: Record<GuideCategory, { title: string; icon: React.ComponentType<{ className?: string }> }> = {
  'getting-started': { title: 'Getting Started', icon: BookOpen },
  'features': { title: 'Features', icon: Wrench },
  'advanced': { title: 'Advanced', icon: Zap },
  'troubleshooting': { title: 'Troubleshooting', icon: AlertTriangle },
};

export const UserGuideNavigation: React.FC<UserGuideNavigationProps> = ({ className = '' }) => {
  const { currentSection, navigateToSection } = useUserGuideStore();
  const [isContentLoaded, setIsContentLoaded] = useState(false);
  
  // Track which sections are expanded
  const [expandedSections, setExpandedSections] = useState<Set<GuideCategory>>(
    new Set(['getting-started']) // Start with getting-started expanded
  );

  // Load guide content on mount
  useEffect(() => {
    const loadContent = async () => {
      try {
        const content = await loadGuideContent();
        populateGuideContent(content);
        setIsContentLoaded(true);
      } catch (error) {
        console.error('Failed to load guide content:', error);
      }
    };

    loadContent();
  }, []);

  // Organize content by category
  const navigationSections = useMemo((): NavigationSection[] => {
    if (!isContentLoaded) return [];
    
    return Object.entries(guideContent.sections).map(([category, sections]) => {
      const categoryKey = category as GuideCategory;
      const config = categoryConfig[categoryKey];
      
      return {
        category: categoryKey,
        title: config.title,
        icon: config.icon,
        sections: Object.values(sections),
        isExpanded: expandedSections.has(categoryKey),
      };
    });
  }, [expandedSections, isContentLoaded]);

  // Calculate progress for each category
  const getCategoryProgress = (category: GuideCategory): number => {
    if (!isContentLoaded) return 0;
    const sections = Object.values(guideContent.sections[category]);
    const currentIndex = sections.findIndex(section => section.id === currentSection);
    
    if (currentIndex === -1) return 0;
    return Math.round(((currentIndex + 1) / sections.length) * 100);
  };

  // Get total progress across all sections
  const getTotalProgress = (): number => {
    if (!isContentLoaded) return 0;
    const allSections = Object.values(guideContent.sections).flatMap(sections => Object.values(sections));
    const currentIndex = allSections.findIndex(section => section.id === currentSection);
    
    if (currentIndex === -1) return 0;
    return Math.round(((currentIndex + 1) / allSections.length) * 100);
  };

  // Toggle section expansion
  const toggleSection = (category: GuideCategory) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(category)) {
        newSet.delete(category);
      } else {
        newSet.add(category);
      }
      return newSet;
    });
  };

  // Handle section navigation
  const handleSectionClick = (sectionId: string) => {
    navigateToSection(sectionId);
  };

  // Handle keyboard navigation within the navigation tree
  const handleKeyDown = useCallback((event: React.KeyboardEvent, sectionId?: string, category?: GuideCategory) => {
    switch (event.key) {
      case 'Enter':
      case ' ': // Space key
        event.preventDefault();
        if (sectionId) {
          handleSectionClick(sectionId);
        } else if (category) {
          toggleSection(category);
        }
        break;
      case 'ArrowRight':
        event.preventDefault();
        if (category && !expandedSections.has(category)) {
          toggleSection(category);
        }
        break;
      case 'ArrowLeft':
        event.preventDefault();
        if (category && expandedSections.has(category)) {
          toggleSection(category);
        }
        break;
      case 'Home':
        event.preventDefault();
        // Focus first category
        const firstCategory = document.querySelector('[data-category-button]') as HTMLElement;
        if (firstCategory) firstCategory.focus();
        break;
      case 'End':
        event.preventDefault();
        // Focus last visible section or category
        const allFocusable = document.querySelectorAll('[data-category-button], [data-section-button]');
        const lastFocusable = allFocusable[allFocusable.length - 1] as HTMLElement;
        if (lastFocusable) lastFocusable.focus();
        break;
      default:
        break;
    }
  }, [expandedSections, toggleSection, handleSectionClick]);

  // Check if a section is currently active
  const isSectionActive = (sectionId: string): boolean => {
    return currentSection === sectionId;
  };

  // Check if a category contains the current section
  const isCategoryActive = (category: GuideCategory): boolean => {
    if (!isContentLoaded) return false;
    const sections = Object.values(guideContent.sections[category]);
    return sections.some(section => section.id === currentSection);
  };

  // Loading state
  if (!isContentLoaded) {
    return (
      <nav className={`flex flex-col h-full ${className}`} role="navigation" aria-label="User guide navigation">
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-500 dark:text-gray-400">Loading navigation...</p>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className={`flex flex-col h-full ${className}`} role="navigation" aria-label="User guide navigation">
      {/* Overall Progress */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Overall Progress
          </span>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {getTotalProgress()}%
          </span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${getTotalProgress()}%` }}
            role="progressbar"
            aria-valuenow={getTotalProgress()}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`Overall progress: ${getTotalProgress()}%`}
          />
        </div>
      </div>

      {/* Navigation Sections */}
      <div className="flex-1 overflow-y-auto">
        {navigationSections.map((navSection) => {
          const Icon = navSection.icon;
          const isActive = isCategoryActive(navSection.category);
          const progress = getCategoryProgress(navSection.category);

          return (
            <div key={navSection.category} className="border-b border-gray-100 dark:border-gray-800 last:border-b-0">
              {/* Category Header */}
              <button
                onClick={() => toggleSection(navSection.category)}
                onKeyDown={(e) => handleKeyDown(e, undefined, navSection.category)}
                className={`w-full flex items-center justify-between p-3 text-left hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset ${
                  isActive ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                }`}
                aria-expanded={navSection.isExpanded}
                aria-controls={`category-${navSection.category}`}
                data-category-button
                aria-describedby={isActive && progress > 0 ? `progress-${navSection.category}` : undefined}
              >
                <div className="flex items-center space-x-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'}`} />
                  <span className={`font-medium ${isActive ? 'text-blue-900 dark:text-blue-100' : 'text-gray-900 dark:text-gray-100'}`}>
                    {navSection.title}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  {isActive && progress > 0 && (
                    <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                      {progress}%
                    </span>
                  )}
                  {navSection.isExpanded ? (
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  )}
                </div>
              </button>

              {/* Category Progress Bar */}
              {isActive && progress > 0 && (
                <div className="px-3 pb-2">
                  <div 
                    className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1"
                    role="progressbar"
                    aria-valuenow={progress}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label={`${navSection.title} progress: ${progress}%`}
                    id={`progress-${navSection.category}`}
                  >
                    <div
                      className="bg-blue-600 h-1 rounded-full transition-all duration-300 ease-out"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Section List */}
              {navSection.isExpanded && (
                <div
                  id={`category-${navSection.category}`}
                  className="bg-gray-25 dark:bg-gray-900/25"
                >
                  {navSection.sections.map((section, index) => {
                    const isCurrentSection = isSectionActive(section.id);
                    
                    return (
                      <button
                        key={section.id}
                        onClick={() => handleSectionClick(section.id)}
                        onKeyDown={(e) => handleKeyDown(e, section.id)}
                        className={`w-full text-left px-6 py-2.5 hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-colors border-l-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset ${
                          isCurrentSection
                            ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20 text-blue-900 dark:text-blue-100'
                            : 'border-transparent text-gray-700 dark:text-gray-300'
                        }`}
                        aria-current={isCurrentSection ? 'page' : undefined}
                        data-section-button
                        aria-describedby={`section-desc-${section.id.replace('/', '-')}`}
                      >
                        <div className="flex items-center justify-between">
                          <span className={`text-sm ${isCurrentSection ? 'font-medium' : ''}`}>
                            {section.title}
                          </span>
                          {isCurrentSection && (
                            <div className="w-2 h-2 bg-blue-600 rounded-full" aria-hidden="true" />
                          )}
                        </div>
                        <div 
                          id={`section-desc-${section.id.replace('/', '-')}`}
                          className="sr-only"
                        >
                          {section.title} in {navSection.title} section
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Navigation Hints */}
      <div className="p-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
        <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
          <div>Click sections to navigate</div>
          <div>Use ← → keys to navigate</div>
        </div>
      </div>
    </nav>
  );
};