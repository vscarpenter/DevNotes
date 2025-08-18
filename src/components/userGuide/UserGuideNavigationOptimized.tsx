/**
 * Optimized UserGuideNavigation with virtual scrolling for large content lists
 * Requirements: 1.4, 1.5
 */

import React, { useMemo } from 'react';
import { ChevronDown, ChevronRight, BookOpen, Search, Settings, AlertCircle } from 'lucide-react';
import { useUserGuideStore } from '../../stores/userGuideStore';
import { VirtualScrollContent } from './VirtualScrollContent';
import { GuideSection } from '../../types/userGuide';

interface UserGuideNavigationOptimizedProps {
  className?: string;
  sections?: GuideSection[];
}

interface NavigationItem {
  id: string;
  title: string;
  category: string;
  icon: React.ReactNode;
  isActive: boolean;
}

const categoryIcons = {
  'getting-started': <BookOpen className="w-4 h-4" />,
  'features': <Settings className="w-4 h-4" />,
  'advanced': <Search className="w-4 h-4" />,
  'troubleshooting': <AlertCircle className="w-4 h-4" />
};

export const UserGuideNavigationOptimized: React.FC<UserGuideNavigationOptimizedProps> = ({
  className = '',
  sections = []
}) => {
  const { currentSection, navigateToSection } = useUserGuideStore();

  // Convert sections to navigation items for virtual scrolling
  const navigationItems = useMemo((): NavigationItem[] => {
    return sections.map(section => ({
      id: section.id,
      title: section.title,
      category: section.category,
      icon: categoryIcons[section.category] || <BookOpen className="w-4 h-4" />,
      isActive: section.id === currentSection
    }));
  }, [sections, currentSection]);

  // Render individual navigation item
  const renderNavigationItem = (item: NavigationItem) => (
    <div
      key={item.id}
      className={`flex items-center gap-3 px-3 py-2 rounded-md cursor-pointer transition-colors ${
        item.isActive
          ? 'bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100'
          : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
      }`}
      onClick={() => navigateToSection(item.id)}
      role="button"
      tabIndex={0}
      aria-label={`Navigate to ${item.title}`}
      aria-current={item.isActive ? 'page' : undefined}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          navigateToSection(item.id);
        }
      }}
    >
      {item.icon}
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium truncate">
          {item.title}
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400 capitalize">
          {item.category.replace('-', ' ')}
        </div>
      </div>
      {item.isActive && (
        <ChevronRight className="w-4 h-4 text-blue-600 dark:text-blue-400" />
      )}
    </div>
  );

  // Group items by category for better organization
  const groupedItems = useMemo(() => {
    const groups: Record<string, NavigationItem[]> = {};
    navigationItems.forEach(item => {
      if (!groups[item.category]) {
        groups[item.category] = [];
      }
      groups[item.category].push(item);
    });
    return groups;
  }, [navigationItems]);

  // If we have a small number of items, render normally
  if (navigationItems.length <= 20) {
    return (
      <nav className={`space-y-1 ${className}`} role="navigation" aria-label="User guide navigation">
        {Object.entries(groupedItems).map(([category, items]) => (
          <div key={category} className="space-y-1">
            <div className="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
              {category.replace('-', ' ')}
            </div>
            {items.map(renderNavigationItem)}
          </div>
        ))}
      </nav>
    );
  }

  // For large lists, use virtual scrolling
  const virtualItems = navigationItems.map(renderNavigationItem);

  return (
    <nav className={`${className}`} role="navigation" aria-label="User guide navigation">
      <div className="mb-4 px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
        Guide Sections ({navigationItems.length})
      </div>
      <VirtualScrollContent
        items={virtualItems}
        itemHeight={60} // Approximate height of each navigation item
        containerHeight={400} // Fixed height for virtual scrolling
        className="border border-gray-200 dark:border-gray-700 rounded-md"
        onItemClick={(index) => {
          const item = navigationItems[index];
          if (item) {
            navigateToSection(item.id);
          }
        }}
      />
    </nav>
  );
};