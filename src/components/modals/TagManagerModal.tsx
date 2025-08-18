/**
 * Tag Manager Modal for creating, editing, and managing tags
 * Requirements: 5.3, 5.4
 */

import React, { useState, useEffect } from 'react';
import { X, Edit2, Trash2, Plus, Palette } from 'lucide-react';
import { useTagStore } from '../../stores/tagStore';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Tag, TagList } from '../ui/tag';
import { useToast } from '../ui/toast';

interface TagManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const TAG_COLORS = [
  '#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16',
  '#22c55e', '#10b981', '#14b8a6', '#06b6d4', '#0ea5e9',
  '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#d946ef',
  '#ec4899', '#f43f5e'
];

export const TagManagerModal: React.FC<TagManagerModalProps> = ({
  isOpen,
  onClose
}) => {
  const {
    tags,
    isLoading,
    error,
    loadTags,
    createTag,
    updateTag,
    deleteTag,
    getAllTags,
    getPopularTags
  } = useTagStore();

  const { addToast } = useToast();

  const [newTagName, setNewTagName] = useState('');
  const [newTagColor, setNewTagColor] = useState(TAG_COLORS[0]);
  const [editingTag, setEditingTag] = useState<{
    id: string;
    name: string;
    color: string;
  } | null>(null);
  const [showColorPicker, setShowColorPicker] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadTags();
    }
  }, [isOpen, loadTags]);

  useEffect(() => {
    if (error) {
      addToast({ type: 'error', title: error });
    }
  }, [error, addToast]);

  const handleCreateTag = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTagName.trim()) return;

    try {
      await createTag(newTagName.trim(), newTagColor);
      setNewTagName('');
      setNewTagColor(TAG_COLORS[0]);
      addToast({ type: 'success', title: 'Tag created successfully' });
    } catch (error) {
      addToast({ type: 'error', title: 'Failed to create tag' });
    }
  };

  const handleUpdateTag = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTag || !editingTag.name.trim()) return;

    try {
      await updateTag(editingTag.id, {
        name: editingTag.name.trim(),
        color: editingTag.color
      });
      setEditingTag(null);
      addToast({ type: 'success', title: 'Tag updated successfully' });
    } catch (error) {
      addToast({ type: 'error', title: 'Failed to update tag' });
    }
  };

  const handleDeleteTag = async (tagId: string, tagName: string) => {
    if (!confirm(`Are you sure you want to delete the tag "${tagName}"? This will remove it from all notes.`)) {
      return;
    }

    try {
      await deleteTag(tagId);
      addToast({ type: 'success', title: 'Tag deleted successfully' });
    } catch (error) {
      addToast({ type: 'error', title: 'Failed to delete tag' });
    }
  };

  const allTags = getAllTags();
  const popularTags = getPopularTags(5);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Manage Tags
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(80vh-120px)]">
          {/* Create New Tag */}
          <div className="mb-8">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Create New Tag
            </h3>
            <form onSubmit={handleCreateTag} className="space-y-4">
              <div className="flex gap-3">
                <div className="flex-1">
                  <Input
                    type="text"
                    value={newTagName}
                    onChange={(e) => setNewTagName(e.target.value)}
                    placeholder="Tag name"
                    className="w-full"
                  />
                </div>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowColorPicker(showColorPicker ? null : 'new')}
                    className="w-12 h-10 rounded-md border border-gray-300 dark:border-gray-600 flex items-center justify-center"
                    style={{ backgroundColor: newTagColor }}
                  >
                    <Palette className="w-4 h-4 text-white" />
                  </button>
                  
                  {showColorPicker === 'new' && (
                    <div className="absolute top-full right-0 mt-2 p-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg z-10">
                      <div className="grid grid-cols-6 gap-2">
                        {TAG_COLORS.map((color) => (
                          <button
                            key={color}
                            type="button"
                            onClick={() => {
                              setNewTagColor(color);
                              setShowColorPicker(null);
                            }}
                            className="w-8 h-8 rounded-full border-2 border-transparent hover:border-gray-400 transition-colors"
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <Button
                  type="submit"
                  disabled={!newTagName.trim() || isLoading}
                  className="shrink-0"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create
                </Button>
              </div>
            </form>
          </div>

          {/* Popular Tags */}
          {popularTags.length > 0 && (
            <div className="mb-8">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Popular Tags
              </h3>
              <div className="flex flex-wrap gap-2">
                {popularTags.map((tag) => (
                  <div key={tag.id} className="flex items-center gap-2">
                    <Tag
                      id={tag.id}
                      name={`${tag.name} (${tag.usageCount})`}
                      color={tag.color}
                      size="sm"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* All Tags */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              All Tags ({allTags.length})
            </h3>
            
            {isLoading ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                Loading tags...
              </div>
            ) : allTags.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                No tags created yet. Create your first tag above.
              </div>
            ) : (
              <div className="space-y-3">
                {allTags.map((tag) => (
                  <div
                    key={tag.id}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                  >
                    {editingTag?.id === tag.id ? (
                      <form onSubmit={handleUpdateTag} className="flex items-center gap-3 flex-1">
                        <Input
                          type="text"
                          value={editingTag.name}
                          onChange={(e) =>
                            setEditingTag({ ...editingTag, name: e.target.value })
                          }
                          className="flex-1"
                        />
                        <button
                          type="button"
                          onClick={() => setShowColorPicker(editingTag.id)}
                          className="w-8 h-8 rounded-full border border-gray-300 dark:border-gray-600"
                          style={{ backgroundColor: editingTag.color }}
                        />
                        <div className="flex gap-2">
                          <Button type="submit" size="sm">
                            Save
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setEditingTag(null)}
                          >
                            Cancel
                          </Button>
                        </div>
                      </form>
                    ) : (
                      <>
                        <div className="flex items-center gap-3">
                          <Tag
                            id={tag.id}
                            name={tag.name}
                            color={tag.color}
                            size="sm"
                          />
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            Used in {tag.usageCount} notes
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              setEditingTag({
                                id: tag.id,
                                name: tag.name,
                                color: tag.color
                              })
                            }
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteTag(tag.id, tag.name)}
                            className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};