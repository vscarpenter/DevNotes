/**
 * Template Selection Modal for choosing note templates
 * Requirements: 2.1, 4.1
 */

import React, { useState, useEffect } from 'react';
import { X, Search, Plus, Edit2, Trash2, FileText, Star } from 'lucide-react';
import { noteTemplatesService, NoteTemplate } from '../../lib/utils/noteTemplates';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { useToast } from '../ui/toast';
import { cn } from '../../lib/utils';

interface TemplateSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTemplate: (template: NoteTemplate) => void;
}

interface TemplateCardProps {
  template: NoteTemplate;
  onSelect: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  isCustom: boolean;
}

const TemplateCard: React.FC<TemplateCardProps> = ({
  template,
  onSelect,
  onEdit,
  onDelete,
  isCustom
}) => {
  return (
    <div className="group relative bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-md transition-all cursor-pointer">
      <div onClick={onSelect} className="flex-1">
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-lg">{template.icon || '📄'}</span>
            <h3 className="font-medium text-gray-900 dark:text-white text-sm">
              {template.name}
            </h3>
          </div>
          {isCustom && (
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit?.();
                }}
                className="h-6 w-6 p-0 text-gray-400 hover:text-blue-600"
              >
                <Edit2 className="w-3 h-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete?.();
                }}
                className="h-6 w-6 p-0 text-gray-400 hover:text-red-600"
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            </div>
          )}
        </div>
        
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 line-clamp-2">
          {template.description}
        </p>
        
        <div className="flex items-center justify-between">
          <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-1 rounded">
            {template.category}
          </span>
          
          {template.tags && template.tags.length > 0 && (
            <div className="flex gap-1">
              {template.tags.slice(0, 2).map((tag, index) => (
                <span
                  key={index}
                  className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-1.5 py-0.5 rounded"
                >
                  {tag}
                </span>
              ))}
              {template.tags.length > 2 && (
                <span className="text-xs text-gray-400">+{template.tags.length - 2}</span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export const TemplateSelectionModal: React.FC<TemplateSelectionModalProps> = ({
  isOpen,
  onClose,
  onSelectTemplate
}) => {
  const { addToast } = useToast();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [templates, setTemplates] = useState<NoteTemplate[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [recentTemplates, setRecentTemplates] = useState<NoteTemplate[]>([]);

  useEffect(() => {
    if (isOpen) {
      loadTemplates();
    }
  }, [isOpen]);

  const loadTemplates = () => {
    const allTemplates = noteTemplatesService.getAllTemplates();
    const allCategories = ['All', ...noteTemplatesService.getCategories()];
    const recent = noteTemplatesService.getRecentlyUsedTemplates();
    
    setTemplates(allTemplates);
    setCategories(allCategories);
    setRecentTemplates(recent);
  };

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = searchQuery === '' ||
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'All' || template.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const handleSelectTemplate = (template: NoteTemplate) => {
    noteTemplatesService.markTemplateUsed(template.id);
    onSelectTemplate(template);
    onClose();
  };

  const handleDeleteTemplate = (templateId: string) => {
    if (confirm('Are you sure you want to delete this template?')) {
      if (noteTemplatesService.deleteCustomTemplate(templateId)) {
        addToast({ type: 'success', title: 'Template deleted successfully' });
        loadTemplates();
      } else {
        addToast({ type: 'error', title: 'Failed to delete template' });
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Choose Template
            </h2>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Search and Filters */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex gap-4 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search templates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button
              variant="outline"
              onClick={() => {
                // TODO: Implement custom template creation
                addToast({ type: 'info', title: 'Custom template creation coming soon!' });
              }}
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Template
            </Button>
          </div>

          {/* Category Filter */}
          <div className="flex gap-2 overflow-x-auto">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={cn(
                  'px-3 py-1.5 text-sm rounded-full whitespace-nowrap transition-colors',
                  selectedCategory === category
                    ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                )}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(80vh-240px)]">
          {/* Recent Templates */}
          {recentTemplates.length > 0 && searchQuery === '' && selectedCategory === 'All' && (
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <Star className="w-4 h-4 text-amber-500" />
                <h3 className="font-medium text-gray-900 dark:text-white">
                  Recently Used
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {recentTemplates.map((template) => (
                  <TemplateCard
                    key={template.id}
                    template={template}
                    onSelect={() => handleSelectTemplate(template)}
                    isCustom={noteTemplatesService.isCustomTemplate(template.id)}
                    onDelete={() => handleDeleteTemplate(template.id)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* All Templates */}
          <div>
            {searchQuery === '' && selectedCategory === 'All' && recentTemplates.length > 0 && (
              <h3 className="font-medium text-gray-900 dark:text-white mb-4">
                All Templates
              </h3>
            )}
            
            {filteredTemplates.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">
                  {searchQuery || selectedCategory !== 'All'
                    ? 'No templates found matching your criteria'
                    : 'No templates available'
                  }
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredTemplates.map((template) => (
                  <TemplateCard
                    key={template.id}
                    template={template}
                    onSelect={() => handleSelectTemplate(template)}
                    isCustom={noteTemplatesService.isCustomTemplate(template.id)}
                    onDelete={() => handleDeleteTemplate(template.id)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center p-6 border-t border-gray-200 dark:border-gray-700">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {filteredTemplates.length} template{filteredTemplates.length !== 1 ? 's' : ''} available
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              onClick={() => handleSelectTemplate({ 
                id: 'blank', 
                name: 'Blank Note', 
                description: 'Start with a clean slate', 
                category: 'Basic', 
                content: '' 
              })}
            >
              Start Blank
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};