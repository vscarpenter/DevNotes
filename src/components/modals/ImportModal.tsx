/**
 * Import modal component for data restoration
 * Provides UI for importing from JSON and ZIP files
 * Requirements: 7.6, 8.1
 */

import React, { useState, useCallback } from 'react';
import { X, Upload, FileText, Archive, AlertCircle, CheckCircle, Info } from 'lucide-react';
import { importService, ImportOptions, ImportProgress, ImportResult } from '../../lib/import';

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportComplete: (result: ImportResult) => void;
}

export const ImportModal: React.FC<ImportModalProps> = ({
  isOpen,
  onClose,
  onImportComplete
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [importOptions, setImportOptions] = useState<ImportOptions>({
    format: 'json',
    conflictResolution: 'rename',
    validateData: true,
    preserveIds: false
  });
  const [isImporting, setIsImporting] = useState(false);
  const [progress, setProgress] = useState<ImportProgress | null>(null);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const handleFileSelect = useCallback((file: File) => {
    const extension = file.name.toLowerCase().split('.').pop();
    const format = extension === 'zip' ? 'zip' : 'json';
    
    setSelectedFile(file);
    setImportOptions(prev => ({ ...prev, format }));
    setResult(null);
  }, []);

  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  }, [handleFileSelect]);

  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    setDragOver(false);
  }, []);

  const handleDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    setDragOver(false);
    
    const file = event.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  }, [handleFileSelect]);

  const handleImport = useCallback(async () => {
    if (!selectedFile) return;

    setIsImporting(true);
    setProgress(null);
    setResult(null);

    try {
      const onProgress = (progress: ImportProgress) => {
        setProgress(progress);
      };

      let importResult: ImportResult;
      
      if (importOptions.format === 'zip') {
        importResult = await importService.importFromZIP(selectedFile, importOptions, onProgress);
      } else {
        importResult = await importService.importFromJSON(selectedFile, importOptions, onProgress);
      }

      setResult(importResult);
      onImportComplete(importResult);
    } catch (error) {
      setResult({
        success: false,
        processed: 0,
        failed: 0,
        errors: [`Import failed: ${error instanceof Error ? error.message : 'Unknown error'}`],
        importedNotes: 0,
        importedFolders: 0,
        skippedItems: 0,
        conflicts: []
      });
    } finally {
      setIsImporting(false);
    }
  }, [selectedFile, importOptions, onImportComplete]);

  const handleClose = useCallback(() => {
    if (!isImporting) {
      setSelectedFile(null);
      setProgress(null);
      setResult(null);
      onClose();
    }
  }, [isImporting, onClose]);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Import Data
          </h2>
          <button
            onClick={handleClose}
            disabled={isImporting}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-50"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {!result && (
            <>
              {/* File Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Select Import File
                </label>
                
                <div
                  className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                    dragOver
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                  }`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <p className="text-gray-600 dark:text-gray-400 mb-2">
                    Drag and drop your backup file here, or click to browse
                  </p>
                  <input
                    type="file"
                    accept=".json,.zip"
                    onChange={handleFileChange}
                    className="hidden"
                    id="import-file"
                  />
                  <label
                    htmlFor="import-file"
                    className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 cursor-pointer"
                  >
                    Choose File
                  </label>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    Supports JSON and ZIP files (max 50MB)
                  </p>
                </div>

                {selectedFile && (
                  <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-center">
                      {selectedFile.name.endsWith('.zip') ? (
                        <Archive className="h-5 w-5 text-gray-500 mr-2" />
                      ) : (
                        <FileText className="h-5 w-5 text-gray-500 mr-2" />
                      )}
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {selectedFile.name}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {formatFileSize(selectedFile.size)}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Import Options */}
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  Import Options
                </h3>

                <div className="space-y-4">
                  {/* Conflict Resolution */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Conflict Resolution
                    </label>
                    <select
                      value={importOptions.conflictResolution}
                      onChange={(e) => setImportOptions(prev => ({
                        ...prev,
                        conflictResolution: e.target.value as 'skip' | 'overwrite' | 'rename'
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    >
                      <option value="skip">Skip conflicting items</option>
                      <option value="overwrite">Overwrite existing items</option>
                      <option value="rename">Rename conflicting items</option>
                    </select>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      How to handle items that already exist with the same name
                    </p>
                  </div>

                  {/* Validation */}
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="validate-data"
                      checked={importOptions.validateData}
                      onChange={(e) => setImportOptions(prev => ({
                        ...prev,
                        validateData: e.target.checked
                      }))}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="validate-data" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                      Validate data integrity before import
                    </label>
                  </div>

                  {/* Preserve IDs */}
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="preserve-ids"
                      checked={importOptions.preserveIds}
                      onChange={(e) => setImportOptions(prev => ({
                        ...prev,
                        preserveIds: e.target.checked
                      }))}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="preserve-ids" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                      Preserve original IDs (may cause conflicts)
                    </label>
                  </div>
                </div>
              </div>

              {/* Warning */}
              <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                <div className="flex">
                  <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mr-2 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                      Important Notice
                    </h4>
                    <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                      Importing data will add new items to your existing notes and folders. 
                      Make sure to backup your current data before proceeding.
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Progress */}
          {progress && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {progress.message}
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {Math.round(progress.current)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress.current}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Phase: {progress.phase} ({progress.current}/{progress.total})
              </p>
            </div>
          )}

          {/* Results */}
          {result && (
            <div className="mb-6">
              <div className={`p-4 rounded-lg border ${
                result.success 
                  ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                  : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
              }`}>
                <div className="flex items-center mb-2">
                  {result.success ? (
                    <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 mr-2" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mr-2" />
                  )}
                  <h4 className={`text-sm font-medium ${
                    result.success 
                      ? 'text-green-800 dark:text-green-200'
                      : 'text-red-800 dark:text-red-200'
                  }`}>
                    {result.success ? 'Import Completed Successfully' : 'Import Failed'}
                  </h4>
                </div>

                <div className="text-sm space-y-1">
                  <p className={result.success ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'}>
                    Imported: {result.importedNotes} notes, {result.importedFolders} folders
                  </p>
                  {result.skippedItems > 0 && (
                    <p className="text-yellow-700 dark:text-yellow-300">
                      Skipped: {result.skippedItems} items
                    </p>
                  )}
                  {result.failed > 0 && (
                    <p className="text-red-700 dark:text-red-300">
                      Failed: {result.failed} items
                    </p>
                  )}
                </div>

                {result.conflicts.length > 0 && (
                  <div className="mt-3">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Conflicts Resolved:
                    </p>
                    <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                      {result.conflicts.slice(0, 5).map((conflict, index) => (
                        <li key={index}>
                          {conflict.type}: {conflict.name} → {conflict.resolution}
                          {conflict.newName && ` as "${conflict.newName}"`}
                        </li>
                      ))}
                      {result.conflicts.length > 5 && (
                        <li>... and {result.conflicts.length - 5} more</li>
                      )}
                    </ul>
                  </div>
                )}

                {result.errors.length > 0 && (
                  <div className="mt-3">
                    <p className="text-sm font-medium text-red-700 dark:text-red-300 mb-1">
                      Errors:
                    </p>
                    <ul className="text-xs text-red-600 dark:text-red-400 space-y-1">
                      {result.errors.slice(0, 3).map((error, index) => (
                        <li key={index}>{error}</li>
                      ))}
                      {result.errors.length > 3 && (
                        <li>... and {result.errors.length - 3} more errors</li>
                      )}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={handleClose}
            disabled={isImporting}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {result ? 'Close' : 'Cancel'}
          </button>
          
          {!result && (
            <button
              onClick={handleImport}
              disabled={!selectedFile || isImporting}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isImporting ? 'Importing...' : 'Import Data'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImportModal;