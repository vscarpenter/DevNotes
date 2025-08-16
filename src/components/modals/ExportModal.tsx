/**
 * Export modal component for note and bulk export functionality
 * Requirements: 8.1, 8.2, 8.3, 8.4
 */

import React, { useState, useCallback } from 'react';
import { X, Download, FileText, Globe, Code, Archive, Mail, Copy, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '../ui/button';
import { exportService, ExportOptions, BulkExportOptions, ExportProgress } from '../../lib/export/ExportService';
import { useNoteStore } from '../../stores/noteStore';
import { useFolderStore } from '../../stores/folderStore';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  noteId?: string;
  selectedNoteIds?: string[];
  selectedFolderIds?: string[];
}

type ExportFormat = 'markdown' | 'html' | 'json' | 'txt';
type ExportMode = 'single' | 'bulk' | 'database';

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  noteId,
  selectedNoteIds = [],
  selectedFolderIds = []
}) => {
  const [mode, setMode] = useState<ExportMode>(() => {
    if (noteId) return 'single';
    if (selectedNoteIds.length > 0 || selectedFolderIds.length > 0) return 'bulk';
    return 'database';
  });
  
  const [format, setFormat] = useState<ExportFormat>('markdown');
  const [includeMetadata, setIncludeMetadata] = useState(true);
  const [preserveStructure, setPreserveStructure] = useState(true);
  const [includeSubfolders, setIncludeSubfolders] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [progress, setProgress] = useState<ExportProgress | null>(null);
  const [exportResult, setExportResult] = useState<{ success: boolean; message: string } | null>(null);

  const { getNote } = useNoteStore();
  const { getFolder } = useFolderStore();

  const currentNote = noteId ? getNote(noteId) : null;

  const handleExport = useCallback(async () => {
    setIsExporting(true);
    setExportResult(null);
    
    try {
      if (mode === 'single' && noteId) {
        await handleSingleExport();
      } else if (mode === 'bulk') {
        await handleBulkExport();
      } else if (mode === 'database') {
        await handleDatabaseExport();
      }
    } catch (error) {
      setExportResult({
        success: false,
        message: error instanceof Error ? error.message : 'Export failed'
      });
    } finally {
      setIsExporting(false);
      setProgress(null);
    }
  }, [mode, noteId, format, includeMetadata, preserveStructure, includeSubfolders, selectedNoteIds, selectedFolderIds]);

  const handleSingleExport = async () => {
    if (!noteId) return;

    const options: ExportOptions = {
      format,
      includeMetadata,
      preserveStructure
    };

    const result = await exportService.exportNote(noteId, options);
    downloadFile(result.content, result.filename, result.mimeType);
    
    setExportResult({
      success: true,
      message: `Note exported as ${result.filename}`
    });
  };

  const handleBulkExport = async () => {
    const options: BulkExportOptions = {
      format,
      includeMetadata,
      preserveStructure,
      includeSubfolders,
      selectedNoteIds: selectedNoteIds.length > 0 ? selectedNoteIds : undefined,
      selectedFolderIds: selectedFolderIds.length > 0 ? selectedFolderIds : undefined
    };

    const result = await exportService.exportBulk(options, setProgress);
    downloadBlob(result.content, result.filename, result.mimeType);
    
    setExportResult({
      success: true,
      message: `Export completed: ${result.filename}`
    });
  };

  const handleDatabaseExport = async () => {
    const result = await exportService.exportDatabase();
    downloadFile(result.content, result.filename, result.mimeType);
    
    setExportResult({
      success: true,
      message: `Database backup created: ${result.filename}`
    });
  };

  const handleCopyToClipboard = async () => {
    if (!noteId) return;
    
    try {
      await exportService.copyToClipboard(noteId, format === 'html' ? 'html' : 'markdown');
      setExportResult({
        success: true,
        message: 'Note copied to clipboard'
      });
    } catch (error) {
      setExportResult({
        success: false,
        message: 'Failed to copy to clipboard'
      });
    }
  };

  const handleEmailShare = async () => {
    if (!noteId) return;
    
    try {
      const emailLink = await exportService.generateEmailLink(noteId, format === 'html' ? 'html' : 'markdown');
      window.open(emailLink, '_blank');
      setExportResult({
        success: true,
        message: 'Email client opened'
      });
    } catch (error) {
      setExportResult({
        success: false,
        message: 'Failed to generate email link'
      });
    }
  };

  const downloadFile = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    downloadBlob(blob, filename, mimeType);
  };

  const downloadBlob = (blob: Blob, filename: string, mimeType: string) => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const getExportCount = () => {
    if (mode === 'single') return 1;
    if (selectedNoteIds.length > 0) return selectedNoteIds.length;
    // For folder selection, we'd need to count notes in selected folders
    return 'multiple';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md mx-4">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Export {mode === 'single' ? 'Note' : mode === 'bulk' ? 'Notes' : 'Database'}
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="p-6 space-y-6">
          {/* Export Mode Selection */}
          {!noteId && (
            <div className="space-y-3">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Export Mode
              </label>
              <div className="space-y-2">
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    value="bulk"
                    checked={mode === 'bulk'}
                    onChange={(e) => setMode(e.target.value as ExportMode)}
                    className="text-blue-600"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    Selected items ({getExportCount()} items)
                  </span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    value="database"
                    checked={mode === 'database'}
                    onChange={(e) => setMode(e.target.value as ExportMode)}
                    className="text-blue-600"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    Complete database backup
                  </span>
                </label>
              </div>
            </div>
          )}

          {/* Format Selection */}
          {mode !== 'database' && (
            <div className="space-y-3">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Export Format
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setFormat('markdown')}
                  className={`flex items-center space-x-2 p-3 rounded-lg border transition-colors ${
                    format === 'markdown'
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  <FileText className="h-4 w-4" />
                  <span className="text-sm">Markdown</span>
                </button>
                <button
                  onClick={() => setFormat('html')}
                  className={`flex items-center space-x-2 p-3 rounded-lg border transition-colors ${
                    format === 'html'
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  <Globe className="h-4 w-4" />
                  <span className="text-sm">HTML</span>
                </button>
                <button
                  onClick={() => setFormat('json')}
                  className={`flex items-center space-x-2 p-3 rounded-lg border transition-colors ${
                    format === 'json'
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  <Code className="h-4 w-4" />
                  <span className="text-sm">JSON</span>
                </button>
                <button
                  onClick={() => setFormat('txt')}
                  className={`flex items-center space-x-2 p-3 rounded-lg border transition-colors ${
                    format === 'txt'
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  <FileText className="h-4 w-4" />
                  <span className="text-sm">Plain Text</span>
                </button>
              </div>
            </div>
          )}

          {/* Options */}
          {mode !== 'database' && (
            <div className="space-y-3">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Options
              </label>
              <div className="space-y-2">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={includeMetadata}
                    onChange={(e) => setIncludeMetadata(e.target.checked)}
                    className="text-blue-600"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    Include metadata (dates, tags, etc.)
                  </span>
                </label>
                
                {mode === 'bulk' && (
                  <>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={preserveStructure}
                        onChange={(e) => setPreserveStructure(e.target.checked)}
                        className="text-blue-600"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        Preserve folder structure
                      </span>
                    </label>
                    
                    {selectedFolderIds.length > 0 && (
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={includeSubfolders}
                          onChange={(e) => setIncludeSubfolders(e.target.checked)}
                          className="text-blue-600"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          Include subfolders
                        </span>
                      </label>
                    )}
                  </>
                )}
              </div>
            </div>
          )}

          {/* Progress */}
          {progress && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">{progress.message}</span>
                <span className="text-gray-600 dark:text-gray-400">
                  {progress.current}/{progress.total}
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(progress.current / progress.total) * 100}%` }}
                />
              </div>
            </div>
          )}

          {/* Export Result */}
          {exportResult && (
            <div className={`flex items-center space-x-2 p-3 rounded-lg ${
              exportResult.success 
                ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300'
                : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300'
            }`}>
              {exportResult.success ? (
                <CheckCircle className="h-4 w-4" />
              ) : (
                <AlertCircle className="h-4 w-4" />
              )}
              <span className="text-sm">{exportResult.message}</span>
            </div>
          )}

          {/* Current Note Info */}
          {mode === 'single' && currentNote && (
            <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
              <h3 className="font-medium text-gray-900 dark:text-white text-sm">
                {currentNote.title}
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {currentNote.wordCount} words • Modified {currentNote.updatedAt.toLocaleDateString()}
              </p>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700">
          <div className="flex space-x-2">
            {mode === 'single' && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopyToClipboard}
                  disabled={isExporting}
                  className="flex items-center space-x-1"
                >
                  <Copy className="h-3 w-3" />
                  <span>Copy</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleEmailShare}
                  disabled={isExporting}
                  className="flex items-center space-x-1"
                >
                  <Mail className="h-3 w-3" />
                  <span>Email</span>
                </Button>
              </>
            )}
          </div>
          
          <div className="flex space-x-2">
            <Button variant="outline" onClick={onClose} disabled={isExporting}>
              Cancel
            </Button>
            <Button
              onClick={handleExport}
              disabled={isExporting}
              className="flex items-center space-x-1"
            >
              {isExporting ? (
                <>
                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white" />
                  <span>Exporting...</span>
                </>
              ) : (
                <>
                  {mode === 'bulk' ? <Archive className="h-3 w-3" /> : <Download className="h-3 w-3" />}
                  <span>Export</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};