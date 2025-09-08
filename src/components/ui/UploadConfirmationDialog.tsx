'use client';

import React from 'react';
import { X, Upload, FileText, AlertTriangle, Info } from 'lucide-react';

export interface UploadConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  file?: File | null;
  files?: File[];
  documentType: string;
  isUploading?: boolean;
}

const UploadConfirmationDialog: React.FC<UploadConfirmationDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  file,
  files,
  documentType,
  isUploading = false,
}) => {
  const fileList = files || (file ? [file] : []);
  if (!isOpen || fileList.length === 0) return null;

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileTypeIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    if (extension === 'pdf') {
      return <FileText className="w-8 h-8 text-red-600" />;
    }
    return <FileText className="w-8 h-8 text-blue-600" />;
  };

  const validFileTypes = ['pdf', 'jpg', 'jpeg', 'png', 'doc', 'docx'];
  const maxFileSize = 10 * 1024 * 1024; // 10MB limit
  
  const fileValidations = fileList.map(file => {
    const fileExtension = file.name.split('.').pop()?.toLowerCase() || '';
    return {
      file,
      isValidSize: file.size <= maxFileSize,
      isValidType: validFileTypes.includes(fileExtension),
    };
  });
  
  const hasInvalidFiles = fileValidations.some(v => !v.isValidSize || !v.isValidType);
  const canProceed = !hasInvalidFiles;
  const totalSize = fileList.reduce((sum, file) => sum + file.size, 0);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-gray-900/80 backdrop-blur-sm transition-opacity"
          onClick={onClose}
        />
        
        {/* Modal */}
        <div className="relative bg-gray-800 rounded-xl shadow-2xl max-w-lg w-full p-6 transform transition-all border border-gray-700">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3">
              <Upload className="w-6 h-6 text-blue-400" />
              <div>
                <h3 className="text-lg font-semibold text-white">
                  Confirm Document Upload
                </h3>
                <p className="text-sm text-gray-400">
                  {fileList.length} file{fileList.length !== 1 ? 's' : ''} • {formatFileSize(totalSize)} total
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          {/* Content */}
          <div className="space-y-4">
            <p className="text-gray-300">
              You are about to upload {fileList.length} document{fileList.length !== 1 ? 's' : ''} for <span className="text-blue-400 font-medium">{documentType.replace(/_/g, ' ')}</span>. This action cannot be undone once submitted.
            </p>
            
            {/* File List */}
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {fileValidations.map((validation, index) => (
                <div key={index} className={`p-3 rounded-lg border ${
                  validation.isValidSize && validation.isValidType 
                    ? 'bg-gray-700/50 border-gray-600' 
                    : 'bg-red-900/20 border-red-700'
                }`}>
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      {getFileTypeIcon(validation.file.name)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className={`text-sm font-medium truncate ${
                        validation.isValidSize && validation.isValidType ? 'text-white' : 'text-red-300'
                      }`}>
                        {validation.file.name}
                      </h4>
                      <div className="mt-1 space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-400">Size:</span>
                          <span className={`font-medium ${
                            validation.isValidSize ? 'text-gray-300' : 'text-red-400'
                          }`}>
                            {formatFileSize(validation.file.size)}
                            {!validation.isValidSize && ' (too large)'}
                          </span>
                        </div>
                        {!validation.isValidType && (
                          <p className="text-xs text-red-400">Unsupported file type</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Validation Summary */}
            {hasInvalidFiles && (
              <div className="p-3 bg-red-900/20 border border-red-700 rounded-lg">
                <div className="flex items-start space-x-2">
                  <AlertTriangle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-red-300">Some files have issues</p>
                    <p className="text-xs text-red-400 mt-1">
                      Please fix the issues above before uploading. Maximum file size is 10MB. Supported formats: PDF, JPG, PNG, DOC, DOCX.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* What happens next */}
            {canProceed && (
              <div className="p-3 bg-blue-900/20 border border-blue-700 rounded-lg">
                <div className="flex items-start space-x-2">
                  <Info className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-blue-300">What happens next?</p>
                    <p className="text-xs text-blue-400 mt-1">
                      Your {fileList.length} document{fileList.length !== 1 ? 's' : ''} will be sent to the admin for review. You will be notified once reviewed.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Actions */}
          <div className="flex space-x-3 mt-6">
            <button
              onClick={onClose}
              disabled={isUploading}
              className="flex-1 px-4 py-2 border border-gray-600 rounded-lg text-gray-300 bg-gray-700 hover:bg-gray-600 hover:text-white disabled:opacity-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={!canProceed || isUploading}
              className={`flex-1 px-4 py-2 text-white rounded-lg disabled:opacity-50 transition-colors ${
                canProceed 
                  ? 'bg-blue-600 hover:bg-blue-700' 
                  : 'bg-gray-400 cursor-not-allowed'
              }`}
            >
              {isUploading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin w-4 h-4 border-2 border-white/30 border-t-white rounded-full mr-2" />
                  Uploading {fileList.length} file{fileList.length !== 1 ? 's' : ''}...
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  <Upload className="w-4 h-4 mr-2" />
                  Upload {fileList.length} Document{fileList.length !== 1 ? 's' : ''}
                </div>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadConfirmationDialog;