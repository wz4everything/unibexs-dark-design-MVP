'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { StorageService } from '@/lib/data/storage';
import { Student, Partner } from '@/types';
import Sidebar from '@/components/layout/Sidebar';
import {
  Search,
  User,
  Phone,
  Flag,
  Calendar,
  FileText,
  Users,
  ArrowRight,
  GraduationCap,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

const AdminStudentsPage = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPartner, setSelectedPartner] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'partner'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    loadData();
    
    // Listen for data changes
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key?.includes('appleaction_')) {
        loadData();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const loadData = () => {
    try {
      const allStudents = StorageService.getStudents();
      const allPartners = StorageService.getPartners();
      
      setStudents(allStudents);
      setPartners(allPartners);
    } catch (error) {
      console.error('Error loading students data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPartnerName = (partnerId: string) => {
    const partner = partners.find(p => p.id === partnerId);
    return partner ? (partner.businessName || partner.name || 'Unknown Partner') : 'Unknown Partner';
  };

  const getStudentApplicationsCount = (studentId: string) => {
    const applications = StorageService.getApplications();
    return applications.filter(app => app.studentId === studentId).length;
  };

  const filteredAndSortedStudents = students
    .filter(student => {
      const matchesSearch = 
        student.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.nationality.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesPartner = selectedPartner === 'all' || student.partnerId === selectedPartner;
      
      return matchesSearch && matchesPartner;
    })
    .sort((a, b) => {
      const modifier = sortOrder === 'asc' ? 1 : -1;
      
      switch (sortBy) {
        case 'name':
          return modifier * a.fullName.localeCompare(b.fullName);
        case 'date':
          return modifier * (new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        case 'partner':
          return modifier * getPartnerName(a.partnerId).localeCompare(getPartnerName(b.partnerId));
        default:
          return 0;
      }
    });

  const handleSort = (field: 'name' | 'date' | 'partner') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-900">
        <Sidebar isAdmin={true} />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-900">
      <Sidebar isAdmin={true} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-gray-800 border-b border-gray-700 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white flex items-center">
                <GraduationCap className="w-6 h-6 mr-3 text-blue-500" />
                Students Management
              </h1>
              <p className="text-gray-400 mt-1">
                Manage all students across all partners ({filteredAndSortedStudents.length} students)
              </p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-gray-800 border-b border-gray-700 px-6 py-4">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search students by name, email, or nationality..."
                className="w-full pl-10 pr-4 py-2 border border-gray-600 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Partner Filter */}
            <div className="sm:w-64">
              <select
                value={selectedPartner}
                onChange={(e) => setSelectedPartner(e.target.value)}
                className="w-full px-3 py-2 border border-gray-600 rounded-lg bg-gray-700 text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Partners</option>
                {partners.map(partner => (
                  <option key={partner.id} value={partner.id}>
                    {partner.businessName}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Students List */}
        <div className="flex-1 overflow-auto">
          <div className="p-6">
            {filteredAndSortedStudents.length === 0 ? (
              <div className="text-center py-12">
                <GraduationCap className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-white mb-2">No students found</h3>
                <p className="text-gray-400">
                  {searchQuery || selectedPartner !== 'all'
                    ? 'No students match your current filters.'
                    : 'No students have been registered yet.'}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Sort Controls */}
                <div className="flex items-center gap-4 text-sm">
                  <span className="text-gray-400">Sort by:</span>
                  <button
                    onClick={() => handleSort('name')}
                    className={`flex items-center gap-1 px-3 py-1 rounded ${
                      sortBy === 'name' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    Name
                    {sortBy === 'name' && (
                      sortOrder === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
                    )}
                  </button>
                  <button
                    onClick={() => handleSort('date')}
                    className={`flex items-center gap-1 px-3 py-1 rounded ${
                      sortBy === 'date' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    Date Added
                    {sortBy === 'date' && (
                      sortOrder === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
                    )}
                  </button>
                  <button
                    onClick={() => handleSort('partner')}
                    className={`flex items-center gap-1 px-3 py-1 rounded ${
                      sortBy === 'partner' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    Partner
                    {sortBy === 'partner' && (
                      sortOrder === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
                    )}
                  </button>
                </div>

                {/* Students Grid */}
                <div className="grid gap-4">
                  {filteredAndSortedStudents.map(student => {
                    const applicationsCount = getStudentApplicationsCount(student.id);
                    
                    return (
                      <Link
                        key={student.id}
                        href={`/admin/students/${student.id}`}
                        className="block"
                      >
                        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 hover:bg-gray-750 hover:border-gray-600 transition-all duration-200 group">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center border border-gray-600">
                                  <User className="w-5 h-5 text-gray-300" />
                                </div>
                                <div>
                                  <h3 className="font-semibold text-white group-hover:text-blue-400 transition-colors">
                                    {student.fullName}
                                  </h3>
                                  <p className="text-sm text-gray-400">
                                    {student.email}
                                  </p>
                                </div>
                              </div>
                              
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                <div className="flex items-center gap-2 text-gray-300">
                                  <Users className="w-4 h-4 text-gray-500" />
                                  <span>{getPartnerName(student.partnerId)}</span>
                                </div>
                                <div className="flex items-center gap-2 text-gray-300">
                                  <Flag className="w-4 h-4 text-gray-500" />
                                  <span>{student.nationality}</span>
                                </div>
                                <div className="flex items-center gap-2 text-gray-300">
                                  <Calendar className="w-4 h-4 text-gray-500" />
                                  <span>Added {formatDate(student.createdAt)}</span>
                                </div>
                              </div>

                              <div className="flex items-center gap-4 mt-4 pt-3 border-t border-gray-700">
                                <div className="flex items-center gap-2 text-sm">
                                  <FileText className="w-4 h-4 text-blue-500" />
                                  <span className="text-gray-300">
                                    {applicationsCount} Application{applicationsCount !== 1 ? 's' : ''}
                                  </span>
                                </div>
                                {student.phone && (
                                  <div className="flex items-center gap-2 text-sm text-gray-400">
                                    <Phone className="w-4 h-4" />
                                    <span>{student.phone}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                            
                            <div className="flex items-center text-gray-400 group-hover:text-blue-400 transition-colors">
                              <ArrowRight className="w-5 h-5" />
                            </div>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminStudentsPage;