'use client';

import React from 'react';
import { X, User, Building, FileText, CheckCircle, AlertCircle, GraduationCap } from 'lucide-react';

interface InitializationData {
  applications: Array<{
    student: {
      name: string;
      email: string;
      nationality: string;
      passportNumber: string;
    };
    application: {
      id: string;
      program: string;
      university: string;
      status: string;
      stage: number;
      priority: string;
    };
    documents: {
      total: number;
      approved: number;
      pending: number;
    };
  }>;
  stats: {
    applications: number;
    students: number;
    partners: number;
    comments: number;
    auditEntries: number;
  };
}

interface DataInitializationModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: InitializationData;
}

const DataInitializationModal: React.FC<DataInitializationModalProps> = ({
  isOpen,
  onClose,
  data
}) => {
  if (!isOpen) return null;

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'new_application':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200';
      case 'approved':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'high':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-200';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                Data Initialized Successfully ✅
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {data.applications.length} applications across all 5 stages ready for testing
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Applications Summary */}
          <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
              <GraduationCap className="w-4 h-4 mr-2 text-purple-600" />
              Applications Overview ({data.applications.length} applications)
            </h3>
            
            <div className="grid grid-cols-1 gap-4">
              {data.applications.map((appData, index) => (
                <div key={appData.application.id} className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Student Info */}
                    <div>
                      <h4 className="text-xs font-semibold text-gray-900 dark:text-gray-100 mb-2 flex items-center">
                        <User className="w-3 h-3 mr-1 text-blue-600" />
                        Student #{index + 1}
                      </h4>
                      <div className="space-y-1 text-xs">
                        <p><span className="font-medium text-gray-600 dark:text-gray-400">Name:</span> {appData.student.name}</p>
                        <p><span className="font-medium text-gray-600 dark:text-gray-400">Email:</span> {appData.student.email}</p>
                        <p><span className="font-medium text-gray-600 dark:text-gray-400">Nationality:</span> {appData.student.nationality}</p>
                      </div>
                    </div>
                    
                    {/* Application Info */}
                    <div>
                      <h4 className="text-xs font-semibold text-gray-900 dark:text-gray-100 mb-2 flex items-center">
                        <FileText className="w-3 h-3 mr-1 text-purple-600" />
                        Application Details
                      </h4>
                      <div className="space-y-1 text-xs">
                        <p><span className="font-medium text-gray-600 dark:text-gray-400">ID:</span> {appData.application.id}</p>
                        <p><span className="font-medium text-gray-600 dark:text-gray-400">Program:</span> {appData.application.program}</p>
                        <p><span className="font-medium text-gray-600 dark:text-gray-400">University:</span> {appData.application.university}</p>
                      </div>
                    </div>
                    
                    {/* Status & Documents */}
                    <div>
                      <h4 className="text-xs font-semibold text-gray-900 dark:text-gray-100 mb-2 flex items-center">
                        <CheckCircle className="w-3 h-3 mr-1 text-green-600" />
                        Status & Documents
                      </h4>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(appData.application.status)}`}>
                            Stage {appData.application.stage}
                          </span>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${getPriorityColor(appData.application.priority)}`}>
                            {appData.application.priority}
                          </span>
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">
                          <span className="font-medium">Documents:</span> {appData.documents.total} total, {appData.documents.approved} approved
                          {appData.documents.pending > 0 && <span>, {appData.documents.pending} pending</span>}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Login Credentials */}
          <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center">
              <AlertCircle className="w-4 h-4 mr-2 text-orange-600" />
              Test Credentials
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white dark:bg-gray-800 rounded p-3 border border-gray-200 dark:border-gray-600">
                <h4 className="font-medium text-gray-900 dark:text-gray-100 text-xs mb-2 flex items-center">
                  <User className="w-3 h-3 mr-1 text-blue-600" />
                  Partner Login
                </h4>
                <div className="space-y-1 text-xs text-gray-600 dark:text-gray-400">
                  <p><span className="font-medium">Email:</span> partner@unibexs.com</p>
                  <p><span className="font-medium">Password:</span> partner123</p>
                </div>
              </div>
              
              <div className="bg-white dark:bg-gray-800 rounded p-3 border border-gray-200 dark:border-gray-600">
                <h4 className="font-medium text-gray-900 dark:text-gray-100 text-xs mb-2 flex items-center">
                  <Building className="w-3 h-3 mr-1 text-purple-600" />
                  Admin Login
                </h4>
                <div className="space-y-1 text-xs text-gray-600 dark:text-gray-400">
                  <p><span className="font-medium">Email:</span> admin@unibexs.com</p>
                  <p><span className="font-medium">Password:</span> admin123</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 rounded-b-lg">
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              🎯 Ready to test all {data.applications.length} applications across stages 1-5!
            </p>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
            >
              Start Testing
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataInitializationModal;