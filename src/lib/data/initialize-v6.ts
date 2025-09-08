/**
 * V6 Database Schema Compatible Initialization
 * 
 * This file initializes the application with sample data that follows
 * the v6 database schema structure for MVP scope.
 * 
 * Features:
 * - Complete 5-stage workflow
 * - Returning student support
 * - Commission tracking
 * - Document reuse
 * - Status authority matrix
 */

import {
  User,
  Partner,
  Student,
  Application,
  Document,
  ProgramInfo,
  StatusAuthorityMatrix,
  StatusTransitionLog,
  StudentDocumentPool,
  CommissionTracking,
  PartnerDashboardMetrics,
} from '@/types';

// Sample realistic data for MVP
const SAMPLE_USERS: User[] = [
  {
    id: 'admin-1',
    email: 'admin@unibexs.com',
    password: 'admin123', // In real app this would be hashed
    role: 'admin',
    name: 'System Administrator',
    isActive: true,
    lastLogin: '2024-08-31T09:00:00Z',
    loginCount: 247,
    permissions: { all: true },
    notificationPreferences: {
      email: true,
      dashboard: true,
      statusChanges: true,
    },
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-08-31T09:00:00Z',
  },
  {
    id: 'admin-2',
    email: 'senior.admin@unibexs.com',
    password: 'admin456',
    role: 'admin',
    name: 'Senior Admin',
    isActive: true,
    lastLogin: '2024-08-31T08:30:00Z',
    loginCount: 189,
    permissions: { applications: true, documents: true, commission: true },
    notificationPreferences: {
      email: true,
      dashboard: true,
      statusChanges: true,
    },
    createdAt: '2024-01-15T00:00:00Z',
    updatedAt: '2024-08-31T08:30:00Z',
  },
  {
    id: 'partner-1',
    email: 'partner@globaledu.com',
    password: 'partner123',
    role: 'partner',
    name: 'Partner Manager',
    partnerId: 'partner-global-edu',
    isActive: true,
    lastLogin: '2024-08-31T10:15:00Z',
    loginCount: 156,
    permissions: { applications: true, students: true },
    notificationPreferences: {
      email: true,
      dashboard: true,
      statusChanges: true,
    },
    createdAt: '2024-02-01T00:00:00Z',
    updatedAt: '2024-08-31T10:15:00Z',
  },
  {
    id: 'partner-2',
    email: 'info@studyabroad.sg',
    password: 'partner456',
    role: 'partner',
    name: 'Study Consultant',
    partnerId: 'partner-study-abroad',
    isActive: true,
    lastLogin: '2024-08-30T16:45:00Z',
    loginCount: 89,
    permissions: { applications: true, students: true },
    notificationPreferences: {
      email: true,
      dashboard: false,
      statusChanges: true,
    },
    createdAt: '2024-03-01T00:00:00Z',
    updatedAt: '2024-08-30T16:45:00Z',
  },
];

const SAMPLE_PARTNERS: Partner[] = [
  {
    id: 'partner-global-edu',
    type: 'business',
    name: 'Global Education Partners',
    email: 'partner@globaledu.com',
    phone: '+60-123-456789',
    country: 'Malaysia',
    businessName: 'Global Education Partners Sdn Bhd',
    status: 'active',
    tier: 'gold',
    address: '123 Education Street, Kuala Lumpur 50450, Malaysia',
    contactPerson: 'Sarah Ahmad',
    
    // Performance Metrics (v6)
    totalApplications: 45,
    successfulApplications: 38,
    totalCommissionEarned: 125750.00,
    commissionPending: 15000.00,
    averageConversionRate: 84.4,
    averageProcessingDays: 28.5,
    
    // Activity Tracking
    currentMonthApplications: 8,
    lastApplicationDate: '2024-08-30T14:30:00Z',
    mostSuccessfulProgramLevel: 'Bachelor',
    mostSuccessfulCountry: 'Malaysia',
    
    // Settings & Preferences
    preferredCountries: ['Malaysia', 'Singapore', 'UAE'],
    autoSaveEnabled: true,
    defaultDocumentLanguage: 'EN',
    communicationPreferences: {
      email: true,
      sms: false,
    },
    
    createdAt: '2024-02-01T00:00:00Z',
    updatedAt: '2024-08-31T10:15:00Z',
  },
  {
    id: 'partner-study-abroad',
    type: 'business',
    name: 'StudyAbroad Consultants',
    email: 'info@studyabroad.sg',
    phone: '+65-987-654321',
    country: 'Singapore',
    businessName: 'StudyAbroad Consultants Pte Ltd',
    status: 'active',
    tier: 'silver',
    address: '456 Orchard Road, Singapore 238883',
    contactPerson: 'David Lim',
    
    // Performance Metrics (v6)
    totalApplications: 23,
    successfulApplications: 19,
    totalCommissionEarned: 67420.00,
    commissionPending: 8500.00,
    averageConversionRate: 82.6,
    averageProcessingDays: 31.2,
    
    // Activity Tracking
    currentMonthApplications: 4,
    lastApplicationDate: '2024-08-29T11:20:00Z',
    mostSuccessfulProgramLevel: 'Master',
    mostSuccessfulCountry: 'Singapore',
    
    // Settings & Preferences
    preferredCountries: ['Singapore', 'Malaysia', 'Australia'],
    autoSaveEnabled: true,
    defaultDocumentLanguage: 'EN',
    communicationPreferences: {
      email: true,
      sms: true,
    },
    
    createdAt: '2024-03-01T00:00:00Z',
    updatedAt: '2024-08-30T16:45:00Z',
  },
];

const SAMPLE_STUDENTS: Student[] = [
  {
    id: 'student-ahmed-hassan',
    partnerId: 'partner-global-edu',
    fullName: 'Ahmed Hassan Mohammed',
    email: 'ahmed.hassan@email.com',
    passportNumber: 'SD123456789',
    dateOfBirth: '2000-05-15',
    nationality: 'Sudan',
    phone: '+966-123-456789',
    gender: 'male',
    
    // Contact Information
    currentAddress: '123 Al-Riyadh Street, Riyadh 12345, Saudi Arabia',
    permanentAddress: '456 Khartoum Avenue, Khartoum, Sudan',
    emergencyContactName: 'Hassan Mohammed Ahmed',
    emergencyContactPhone: '+249-123-456789',
    emergencyContactRelationship: 'Father',
    parentGuardianName: 'Hassan Mohammed Ahmed',
    
    // Academic Background
    highestEducation: 'High School',
    graduationYear: 2023,
    gpa: 3.8,
    englishProficiencyType: 'IELTS',
    englishProficiencyScore: '6.5',
    
    // Returning Student Intelligence (v6)
    searchTokens: 'ahmed hassan mohammed sudan sd123456789 ahmed.hassan@email.com',
    firstApplicationDate: '2024-01-15T10:30:00Z',
    totalApplications: 2,
    successfulApplications: 1,
    lastApplicationDate: '2024-08-20T14:15:00Z',
    profileVersion: 2,
    profileCompletedAt: '2024-01-15T11:00:00Z',
    
    // Smart Suggestions
    preferredProgramLevels: ['Bachelor', 'Master'],
    preferredCountries: ['Malaysia', 'UAE'],
    typicalDocumentTypes: ['passport', 'academic_transcript', 'english_test'],
    
    // Data Compliance
    dataConsentGiven: true,
    dataConsentDate: '2024-01-15T10:30:00Z',
    gdprCompliant: true,
    
    // Status & Activity
    status: 'active',
    lastActivityAt: '2024-08-30T16:20:00Z',
    
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-08-30T16:20:00Z',
    
    // Legacy compatibility
    firstName: 'Ahmed Hassan',
    lastName: 'Mohammed',
    applicationIds: [], // Will be populated
  },
  {
    id: 'student-fatima-rashid',
    partnerId: 'partner-global-edu',
    fullName: 'Fatima Al-Rashid',
    email: 'fatima.rashid@email.com',
    passportNumber: 'OM987654321',
    dateOfBirth: '1999-12-03',
    nationality: 'Oman',
    phone: '+968-987-654321',
    gender: 'female',
    
    // Contact Information
    currentAddress: '789 Muscat Boulevard, Muscat 100, Oman',
    permanentAddress: '789 Muscat Boulevard, Muscat 100, Oman',
    emergencyContactName: 'Mohammed Al-Rashid',
    emergencyContactPhone: '+968-123-987654',
    emergencyContactRelationship: 'Father',
    parentGuardianName: 'Mohammed Al-Rashid',
    
    // Academic Background
    highestEducation: 'High School',
    graduationYear: 2024,
    gpa: 3.9,
    englishProficiencyType: 'IELTS',
    englishProficiencyScore: '7.0',
    
    // Returning Student Intelligence (v6)
    searchTokens: 'fatima al-rashid oman om987654321 fatima.rashid@email.com',
    firstApplicationDate: '2024-05-10T09:15:00Z',
    totalApplications: 1,
    successfulApplications: 0,
    lastApplicationDate: '2024-05-10T09:15:00Z',
    profileVersion: 1,
    profileCompletedAt: '2024-05-10T09:45:00Z',
    
    // Smart Suggestions
    preferredProgramLevels: ['Bachelor'],
    preferredCountries: ['Malaysia', 'Singapore'],
    typicalDocumentTypes: ['passport', 'academic_transcript', 'english_test'],
    
    // Data Compliance
    dataConsentGiven: true,
    dataConsentDate: '2024-05-10T09:15:00Z',
    gdprCompliant: true,
    
    // Status & Activity
    status: 'active',
    lastActivityAt: '2024-08-29T13:45:00Z',
    
    createdAt: '2024-05-10T09:15:00Z',
    updatedAt: '2024-08-29T13:45:00Z',
    
    // Legacy compatibility
    firstName: 'Fatima',
    lastName: 'Al-Rashid',
    applicationIds: [], // Will be populated
  },
  {
    id: 'student-mohammed-ibrahim',
    partnerId: 'partner-study-abroad',
    fullName: 'Mohammed Ibrahim Al-Zahra',
    email: 'mohammed.ibrahim@email.com',
    passportNumber: 'AE555123456',
    dateOfBirth: '2001-08-22',
    nationality: 'UAE',
    phone: '+971-555-123456',
    gender: 'male',
    
    // Contact Information
    currentAddress: '321 Dubai Marina, Dubai, UAE',
    permanentAddress: '321 Dubai Marina, Dubai, UAE',
    emergencyContactName: 'Ibrahim Al-Zahra',
    emergencyContactPhone: '+971-555-987654',
    emergencyContactRelationship: 'Father',
    parentGuardianName: 'Ibrahim Al-Zahra',
    
    // Academic Background
    highestEducation: 'High School',
    graduationYear: 2023,
    gpa: 3.7,
    englishProficiencyType: 'TOEFL',
    englishProficiencyScore: '95',
    
    // Returning Student Intelligence (v6)
    searchTokens: 'mohammed ibrahim al-zahra uae ae555123456 mohammed.ibrahim@email.com',
    firstApplicationDate: '2024-08-20T11:30:00Z',
    totalApplications: 1,
    successfulApplications: 0,
    lastApplicationDate: '2024-08-20T11:30:00Z',
    profileVersion: 1,
    profileCompletedAt: '2024-08-20T12:00:00Z',
    
    // Smart Suggestions
    preferredProgramLevels: ['Bachelor'],
    preferredCountries: ['Singapore', 'Malaysia'],
    typicalDocumentTypes: ['passport', 'academic_transcript', 'english_test'],
    
    // Data Compliance
    dataConsentGiven: true,
    dataConsentDate: '2024-08-20T11:30:00Z',
    gdprCompliant: true,
    
    // Status & Activity
    status: 'active',
    lastActivityAt: '2024-08-30T10:30:00Z',
    
    createdAt: '2024-08-20T11:30:00Z',
    updatedAt: '2024-08-30T10:30:00Z',
    
    // Legacy compatibility
    firstName: 'Mohammed Ibrahim',
    lastName: 'Al-Zahra',
    applicationIds: [], // Will be populated
  },
];

const SAMPLE_PROGRAM_INFO: ProgramInfo[] = [
  {
    id: 'program-utm-cs',
    programUrl: 'https://www.utm.my/academic/faculty-of-computing/bachelor-of-computer-science/',
    urlHash: btoa('https://www.utm.my/academic/faculty-of-computing/bachelor-of-computer-science/').substr(0, 32),
    universityName: 'University of Technology Malaysia',
    programName: 'Bachelor of Computer Science',
    programLevel: 'Bachelor',
    country: 'Malaysia',
    city: 'Kuala Lumpur',
    programCode: 'CS-BACH-001',
    
    // Financial Information
    tuitionFee: 25000,
    applicationFee: 200,
    commissionPercentage: 12.0,
    commissionType: 'percentage',
    currency: 'USD',
    
    // Program Details
    intakeDates: ['2024-09-01', '2025-01-15', '2025-05-01'],
    applicationDeadline: '2024-08-15',
    programDuration: '4 years',
    programDescription: 'Comprehensive computer science program with AI specialization',
    entryRequirements: 'High school diploma, English proficiency (IELTS 6.0+)',
    
    // Document Requirements
    requiredDocuments: ['passport', 'academic_transcript', 'english_test', 'personal_statement'],
    optionalDocuments: ['recommendation_letter', 'portfolio'],
    conditionalDocuments: ['medical_certificate'],
    documentRequirementsByNationality: {
      'Sudan': ['noc_certificate', 'yellow_fever_certificate'],
      'Oman': ['noc_certificate'],
    },
    
    // Performance & Analytics
    applicationsCount: 15,
    successRate: 85.5,
    averageProcessingDays: 28,
    universityResponseRate: 92.3,
    
    // Verification
    isVerified: true,
    verifiedBy: 'admin-1',
    verifiedAt: '2024-01-10T00:00:00Z',
    verificationNotes: 'Program verified and commission rate confirmed',
    lastUpdated: '2024-08-30T00:00:00Z',
    
    createdAt: '2024-01-10T00:00:00Z',
    updatedAt: '2024-08-30T00:00:00Z',
  },
  {
    id: 'program-monash-business',
    programUrl: 'https://www.monash.edu.my/study/undergraduate/courses/business-administration',
    urlHash: btoa('https://www.monash.edu.my/study/undergraduate/courses/business-administration').substr(0, 32),
    universityName: 'Monash University Malaysia',
    programName: 'Bachelor of Business Administration',
    programLevel: 'Bachelor',
    country: 'Malaysia',
    city: 'Subang Jaya',
    programCode: 'BBA-001',
    
    // Financial Information
    tuitionFee: 35000,
    applicationFee: 300,
    commissionPercentage: 15.0,
    commissionType: 'percentage',
    currency: 'USD',
    
    // Program Details
    intakeDates: ['2024-07-01', '2024-11-01', '2025-03-01'],
    applicationDeadline: '2024-06-15',
    programDuration: '3 years',
    programDescription: 'International business administration degree',
    entryRequirements: 'High school diploma, English proficiency (IELTS 6.5+)',
    
    // Document Requirements
    requiredDocuments: ['passport', 'academic_transcript', 'english_test', 'personal_statement'],
    optionalDocuments: ['recommendation_letter', 'work_experience'],
    conditionalDocuments: ['financial_statement'],
    documentRequirementsByNationality: {},
    
    // Performance & Analytics
    applicationsCount: 23,
    successRate: 78.2,
    averageProcessingDays: 32,
    universityResponseRate: 88.7,
    
    // Verification
    isVerified: true,
    verifiedBy: 'admin-1',
    verifiedAt: '2024-02-01T00:00:00Z',
    verificationNotes: 'Premium program with higher commission rate',
    lastUpdated: '2024-08-29T00:00:00Z',
    
    createdAt: '2024-02-01T00:00:00Z',
    updatedAt: '2024-08-29T00:00:00Z',
  },
];

const SAMPLE_APPLICATIONS: Application[] = [
  {
    id: 'app-ahmed-utm-cs',
    studentId: 'student-ahmed-hassan',
    partnerId: 'partner-global-edu',
    programInfoId: 'program-utm-cs',
    assignedAdminId: 'admin-1',
    
    // Application Details
    trackingNumber: 'UNI20242440001',
    intendedIntake: '2025-01-15',
    priority: 'medium',
    applicationType: 'new',
    
    // Workflow Status
    currentStage: 1,
    currentStatus: 'under_review_admin',
    
    // Returning Student Support
    isReturningStudent: false,
    studentSearchMethod: 'new',
    profileEditMode: false,
    
    // Status Tracking & Performance
    statusChangeCount: 2,
    lastStatusChangeAt: '2024-08-30T14:30:00Z',
    lastStatusChangeBy: 'admin-1',
    stuckDurationHours: 12.5,
    totalProcessingDays: 3,
    stageCompletionDates: {},
    
    // Document Management
    requiredDocumentsCount: 4,
    uploadedDocumentsCount: 3,
    approvedDocumentsCount: 2,
    reusedDocumentsCount: 0,
    newDocumentsCount: 3,
    documentCompletionPercentage: 75.0,
    documentRequestCount: 0,
    
    // Communication & Interaction
    communicationCount: 2,
    lastCommunicationAt: '2024-08-30T13:15:00Z',
    unreadAdminMessages: 0,
    unreadPartnerMessages: 1,
    
    // Commission Tracking
    commissionPercentage: 12.0,
    estimatedCommission: 3000.00,
    commissionStatus: 'pending',
    
    // Auto-save Support
    draftData: {},
    isSubmitted: true,
    
    // Performance Analytics
    partnerSatisfactionScore: 4,
    processingEfficiencyScore: 0.85,
    
    // Timeline
    createdAt: '2024-08-27T10:30:00Z',
    updatedAt: '2024-08-30T14:30:00Z',
    submittedAt: '2024-08-27T11:00:00Z',
    
    // Legacy compatibility
    program: 'Bachelor of Computer Science',
    university: 'University of Technology Malaysia',
    intakeDate: '2025-01-15',
    tuitionFee: 25000,
    currency: 'USD',
  },
  {
    id: 'app-fatima-monash-business',
    studentId: 'student-fatima-rashid',
    partnerId: 'partner-global-edu',
    programInfoId: 'program-monash-business',
    assignedAdminId: 'admin-2',
    
    // Application Details
    trackingNumber: 'UNI20241310002',
    intendedIntake: '2025-03-01',
    priority: 'high',
    applicationType: 'new',
    
    // Workflow Status
    currentStage: 2,
    currentStatus: 'sent_to_university',
    
    // Returning Student Support
    isReturningStudent: false,
    studentSearchMethod: 'new',
    profileEditMode: false,
    
    // Status Tracking & Performance
    statusChangeCount: 5,
    lastStatusChangeAt: '2024-08-29T16:20:00Z',
    lastStatusChangeBy: 'admin-2',
    stuckDurationHours: 48.7,
    totalProcessingDays: 10,
    stageCompletionDates: {
      '1': '2024-08-25T09:30:00Z',
    },
    
    // Document Management
    requiredDocumentsCount: 4,
    uploadedDocumentsCount: 4,
    approvedDocumentsCount: 4,
    reusedDocumentsCount: 0,
    newDocumentsCount: 4,
    documentCompletionPercentage: 100.0,
    documentRequestCount: 1,
    
    // Communication & Interaction
    communicationCount: 3,
    lastCommunicationAt: '2024-08-29T15:45:00Z',
    unreadAdminMessages: 0,
    unreadPartnerMessages: 0,
    
    // Commission Tracking
    commissionPercentage: 15.0,
    estimatedCommission: 5250.00,
    commissionStatus: 'pending',
    
    // Auto-save Support
    draftData: {},
    isSubmitted: true,
    
    // Performance Analytics
    partnerSatisfactionScore: 5,
    processingEfficiencyScore: 0.92,
    
    // Timeline
    createdAt: '2024-05-10T09:15:00Z',
    updatedAt: '2024-08-29T16:20:00Z',
    submittedAt: '2024-05-10T09:45:00Z',
    
    // Legacy compatibility
    program: 'Bachelor of Business Administration',
    university: 'Monash University Malaysia',
    intakeDate: '2025-03-01',
    tuitionFee: 35000,
    currency: 'USD',
  },
  {
    id: 'app-mohammed-completed',
    studentId: 'student-mohammed-ibrahim',
    partnerId: 'partner-study-abroad',
    programInfoId: 'program-monash-business',
    assignedAdminId: 'admin-1',
    
    // Application Details
    trackingNumber: 'UNI20242320003',
    intendedIntake: '2024-11-01',
    priority: 'medium',
    applicationType: 'new',
    
    // Workflow Status (Completed Example)
    currentStage: 5,
    currentStatus: 'commission_paid',
    
    // Returning Student Support
    isReturningStudent: false,
    studentSearchMethod: 'new',
    profileEditMode: false,
    
    // Status Tracking & Performance
    statusChangeCount: 15,
    lastStatusChangeAt: '2024-08-30T17:00:00Z',
    lastStatusChangeBy: 'admin-1',
    stuckDurationHours: 0,
    totalProcessingDays: 85,
    stageCompletionDates: {
      '1': '2024-06-10T14:30:00Z',
      '2': '2024-06-25T10:15:00Z',
      '3': '2024-07-20T16:45:00Z',
      '4': '2024-08-15T09:30:00Z',
      '5': '2024-08-30T17:00:00Z',
    },
    
    // Document Management
    requiredDocumentsCount: 4,
    uploadedDocumentsCount: 4,
    approvedDocumentsCount: 4,
    reusedDocumentsCount: 0,
    newDocumentsCount: 4,
    documentCompletionPercentage: 100.0,
    documentRequestCount: 2,
    
    // Communication & Interaction
    communicationCount: 8,
    lastCommunicationAt: '2024-08-30T16:55:00Z',
    unreadAdminMessages: 0,
    unreadPartnerMessages: 0,
    
    // Commission Tracking
    commissionPercentage: 15.0,
    estimatedCommission: 5250.00,
    commissionStatus: 'paid',
    commissionEarnedAt: '2024-08-15T09:30:00Z',
    commissionPaidAt: '2024-08-30T17:00:00Z',
    
    // Auto-save Support
    draftData: {},
    isSubmitted: true,
    
    // Performance Analytics
    partnerSatisfactionScore: 5,
    processingEfficiencyScore: 0.94,
    
    // Timeline
    createdAt: '2024-05-15T11:30:00Z',
    updatedAt: '2024-08-30T17:00:00Z',
    submittedAt: '2024-05-15T12:00:00Z',
    
    // Legacy compatibility
    program: 'Bachelor of Business Administration',
    university: 'Monash University Malaysia',
    intakeDate: '2024-11-01',
    tuitionFee: 35000,
    currency: 'USD',
  },
];

const SAMPLE_COMMISSION_TRACKING: CommissionTracking[] = [
  {
    id: 'comm-track-ahmed',
    applicationId: 'app-ahmed-utm-cs',
    partnerId: 'partner-global-edu',
    trackingNumber: 'UNI20242440001',
    programInfoId: 'program-utm-cs',
    programUrl: 'https://www.utm.my/academic/faculty-of-computing/bachelor-of-computer-science/',
    programName: 'Bachelor of Computer Science',
    universityName: 'University of Technology Malaysia',
    
    // Financial Details
    tuitionAmount: 25000,
    commissionPercentage: 12.0,
    commissionAmount: 3000.00,
    currency: 'USD',
    
    // Status & Timeline
    commissionStatus: 'pending',
    createdAt: '2024-08-27T11:00:00Z',
    
    // Verification & Compliance
    enrollmentVerified: false,
    studentAttendanceConfirmed: false,
    
    // Performance & Analytics
    partnerTierAtEarning: 'gold',
    bonusCommission: 0,
    
    updatedAt: '2024-08-30T14:30:00Z',
  },
  {
    id: 'comm-track-mohammed',
    applicationId: 'app-mohammed-completed',
    partnerId: 'partner-study-abroad',
    trackingNumber: 'UNI20242320003',
    programInfoId: 'program-monash-business',
    programUrl: 'https://www.monash.edu.my/study/undergraduate/courses/business-administration',
    programName: 'Bachelor of Business Administration',
    universityName: 'Monash University Malaysia',
    
    // Financial Details
    tuitionAmount: 35000,
    commissionPercentage: 15.0,
    commissionAmount: 5250.00,
    currency: 'USD',
    
    // Status & Timeline
    commissionStatus: 'paid',
    createdAt: '2024-08-15T09:30:00Z',
    earnedAt: '2024-08-15T09:30:00Z',
    approvedAt: '2024-08-28T14:20:00Z',
    paidAt: '2024-08-30T17:00:00Z',
    
    // Payment Details
    approvedBy: 'admin-1',
    approvalNotes: 'Student enrolled successfully - commission approved',
    paymentMethod: 'Bank Transfer',
    paymentReference: 'TXN-2024083017001',
    
    // Verification & Compliance
    enrollmentVerified: true,
    enrollmentVerificationDate: '2024-08-15',
    enrollmentVerificationDocument: 'enrollment-cert-mohammed.pdf',
    studentAttendanceConfirmed: true,
    
    // Performance & Analytics
    daysToEarn: 92,
    partnerTierAtEarning: 'silver',
    bonusCommission: 250.00,
    totalCommission: 5500.00,
    
    updatedAt: '2024-08-30T17:00:00Z',
  },
];

// Storage function for v6 compatibility
export const initializeV6Data = () => {
  console.log('🚀 Initializing UniBexs v6 MVP data...');
  
  try {
    // Clear existing data
    const keysToRemove = Object.keys(localStorage).filter(key => 
      key.startsWith('appleaction_') || key.startsWith('unibexs_')
    );
    keysToRemove.forEach(key => localStorage.removeItem(key));
    
    // Initialize v6 data structure
    localStorage.setItem('unibexs_users', JSON.stringify(SAMPLE_USERS));
    localStorage.setItem('unibexs_partners', JSON.stringify(SAMPLE_PARTNERS));
    localStorage.setItem('unibexs_students', JSON.stringify(SAMPLE_STUDENTS));
    localStorage.setItem('unibexs_program_info', JSON.stringify(SAMPLE_PROGRAM_INFO));
    localStorage.setItem('unibexs_applications', JSON.stringify(SAMPLE_APPLICATIONS));
    localStorage.setItem('unibexs_commission_tracking', JSON.stringify(SAMPLE_COMMISSION_TRACKING));
    
    // Initialize empty collections for other v6 entities
    localStorage.setItem('unibexs_status_authority_matrix', JSON.stringify([]));
    localStorage.setItem('unibexs_status_transitions_log', JSON.stringify([]));
    localStorage.setItem('unibexs_student_document_pool', JSON.stringify([]));
    localStorage.setItem('unibexs_document_request_responses', JSON.stringify([]));
    localStorage.setItem('unibexs_application_communications', JSON.stringify([]));
    localStorage.setItem('unibexs_partner_dashboard_metrics', JSON.stringify([]));
    localStorage.setItem('unibexs_application_sessions', JSON.stringify([]));
    localStorage.setItem('unibexs_workflow_templates', JSON.stringify([]));
    
    // Legacy compatibility - keep some old keys for existing components
    localStorage.setItem('appleaction_applications', JSON.stringify(SAMPLE_APPLICATIONS));
    localStorage.setItem('appleaction_partners', JSON.stringify(SAMPLE_PARTNERS));
    localStorage.setItem('appleaction_students', JSON.stringify(SAMPLE_STUDENTS));
    localStorage.setItem('appleaction_documents', JSON.stringify([]));
    localStorage.setItem('appleaction_document_requests', JSON.stringify([]));
    localStorage.setItem('appleaction_commissions', JSON.stringify([]));
    localStorage.setItem('appleaction_comments', JSON.stringify([]));
    localStorage.setItem('appleaction_audit_log', JSON.stringify([]));
    
    // Set version marker
    localStorage.setItem('unibexs_version', '6.0.0');
    localStorage.setItem('unibexs_initialized_at', new Date().toISOString());
    
    console.log('✅ UniBexs v6 MVP data initialized successfully!');
    console.log('📊 Data Summary:');
    console.log(`   - ${SAMPLE_USERS.length} Users (2 Admins, 2 Partners)`);
    console.log(`   - ${SAMPLE_PARTNERS.length} Partners`);
    console.log(`   - ${SAMPLE_STUDENTS.length} Students`);
    console.log(`   - ${SAMPLE_PROGRAM_INFO.length} Program Info records`);
    console.log(`   - ${SAMPLE_APPLICATIONS.length} Applications (Stages 1-5 represented)`);
    console.log(`   - ${SAMPLE_COMMISSION_TRACKING.length} Commission Tracking records`);
    console.log('🎯 MVP Features:');
    console.log('   - Complete 5-stage workflow (Application → Commission)');
    console.log('   - Returning student support');
    console.log('   - Commission tracking and payment');
    console.log('   - Document reuse system');
    console.log('   - Performance metrics');
    
    return true;
  } catch (error) {
    console.error('❌ Failed to initialize v6 data:', error);
    return false;
  }
};