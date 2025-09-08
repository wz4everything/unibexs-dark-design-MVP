'use client';

import React, { useState } from 'react';
import { Application, FileUploadData } from '@/types';
import { Upload, X, File } from 'lucide-react';

interface InlineFileUploadProps {
  application: Application;
  onCancel: () => void;
  onSubmit: (data: FileUploadData) => void;
}

const InlineFileUpload: React.FC<InlineFileUploadProps> = ({
  application,
  onCancel,
  onSubmit
}) => {
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [uploadType, setUploadType] = useState('');
  const [notes, setNotes] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedFiles(e.target.files);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedFiles && uploadType.trim()) {
      onSubmit({
        files: selectedFiles,
        uploadType: uploadType.trim(),
        notes: notes.trim(),
        applicationId: application.id
      });
    }
  };

  const getContextualTitle = () => {
    switch (application.currentStage) {
      case 1:
        return 'Upload Academic & Personal Documents';
      case 2:
        return 'Upload University Documents';
      case 3:
        return 'Upload Visa Documents';
      case 4:
        return 'Upload Travel Documents';
      case 5:
        return 'Upload Payment Documents';
      default:
        return 'Upload Files';
    }
  };

  const getContextualUploadTypes = () => {
    switch (application.currentStage) {
      case 1:
        return [
          { value: 'academic_transcripts', label: 'Academic Transcripts' },
          { value: 'passport', label: 'Passport Copy' },
          { value: 'english_proficiency', label: 'English Test Results' },
          { value: 'documents', label: 'Additional Documents' },
        ];
      case 2:
        return [
          { value: 'offer_letter', label: 'University Offer Letter' },
          { value: 'conditional_requirements', label: 'Conditional Requirements' },
          { value: 'program_documents', label: 'Program Documents' },
          { value: 'documents', label: 'Additional Documents' },
        ];
      case 3:
        return [
          { value: 'visa_application', label: 'Visa Application Forms' },
          { value: 'financial_proof', label: 'Financial Documents' },
          { value: 'medical_certificate', label: 'Medical Certificate' },
          { value: 'visa_documents', label: 'Visa Documents' },
        ];
      case 4:
        return [
          { value: 'flight_tickets', label: 'Flight Tickets' },
          { value: 'accommodation_proof', label: 'Accommodation Booking' },
          { value: 'arrival_documents', label: 'Arrival Documents' },
          { value: 'other', label: 'Other Travel Documents' },
        ];
      case 5:
        return [
          { value: 'payment_proof', label: 'Payment Receipts' },
          { value: 'commission_docs', label: 'Commission Documents' },
          { value: 'invoices', label: 'Invoices' },
          { value: 'other', label: 'Other Financial Documents' },
        ];
      default:
        return [
          { value: 'documents', label: 'Additional Documents' },
          { value: 'corrections', label: 'Document Corrections' },
          { value: 'payment_proof', label: 'Payment Proof' },
          { value: 'other', label: 'Other' },
        ];
    }
  };

  return (
    <div className="bg-gray-800 border border-gray-600 rounded-lg p-4 mb-4">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-medium text-white flex items-center">
          <Upload className="w-4 h-4 mr-2 text-blue-400" />
          {getContextualTitle()}
        </h4>
        <button
          onClick={onCancel}
          className="text-gray-400 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-white mb-1">
            Document Type
          </label>
          <select
            value={uploadType}
            onChange={(e) => setUploadType(e.target.value)}
            className="w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-700 text-white focus:ring-blue-500 focus:border-blue-500"
            required
          >
            <option value="">Select document type...</option>
            {getContextualUploadTypes().map(type => (
              <option key={type.value} value={type.value}>{type.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-white mb-1">
            Select Files
          </label>
          <input
            type="file"
            onChange={handleFileChange}
            multiple
            accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
            className="w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-700 text-white file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-600 file:text-white hover:file:bg-blue-700"
            required
          />
          <p className="text-xs text-gray-400 mt-1">
            📎 Multiple files supported • PDF, JPG, PNG, DOC, DOCX • Max 10MB each
          </p>
        </div>

        {selectedFiles && (
          <div>
            <label className="block text-sm font-medium text-white mb-1">
              Selected Files ({Array.from(selectedFiles).length})
            </label>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {Array.from(selectedFiles).map((file, index) => (
                <div key={index} className="flex items-center space-x-2 text-sm text-gray-300 bg-gray-700/50 p-2 rounded">
                  <File className="w-4 h-4 text-blue-400" />
                  <span className="flex-1 truncate">{file.name}</span>
                  <span className="text-gray-400 text-xs">({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-white mb-1">
            Notes (Optional)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            className="w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-700 text-white placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Add any notes about these files..."
          />
        </div>

        <div className="flex justify-end space-x-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-3 py-2 text-sm font-medium text-gray-300 bg-gray-700 border border-gray-600 rounded-md hover:bg-gray-600 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            disabled={!selectedFiles || !uploadType.trim()}
          >
            Upload {selectedFiles ? Array.from(selectedFiles).length : ''} File{selectedFiles && Array.from(selectedFiles).length !== 1 ? 's' : ''}
          </button>
        </div>
      </form>
    </div>
  );
};

export default InlineFileUpload;