export interface User {
  id: string;
  email: string;
  password: string; // In real implementation, this would be passwordHash
  role: 'admin' | 'partner' | 'super_admin';
  name: string;
  partnerId?: string;
  isActive: boolean;
  
  // Login & Activity Tracking (v6)
  lastLogin?: string;
  loginCount: number;
  
  // Permissions & Settings (v6)
  permissions: Record<string, boolean>;
  notificationPreferences: {
    email: boolean;
    dashboard: boolean;
    statusChanges: boolean;
  };
  
  createdAt: string;
  updatedAt: string;
}

export interface Partner {
  id: string;
  type: 'individual' | 'business';
  name: string;
  email: string;
  phone: string;
  country: string;
  
  // Individual specific
  photo?: string; // URL
  passport?: string; // URL
  
  // Business specific
  businessName?: string;
  tradingLicense?: string; // URL
  
  status: 'pending' | 'active' | 'approved' | 'suspended' | 'rejected';
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  createdAt: string;
  
  // Enhanced fields from v6 schema
  address?: string;
  contactPerson?: string;
  
  // Performance Metrics (from v6)
  totalApplications: number;
  successfulApplications: number;
  totalCommissionEarned: number;
  commissionPending: number;
  averageConversionRate: number;
  averageProcessingDays: number;
  
  // Activity Tracking
  currentMonthApplications: number;
  lastApplicationDate?: string;
  mostSuccessfulProgramLevel?: string;
  mostSuccessfulCountry?: string;
  
  // Settings & Preferences (from v6)
  preferredCountries: string[];
  autoSaveEnabled: boolean;
  defaultDocumentLanguage: string;
  communicationPreferences: {
    email: boolean;
    sms: boolean;
  };
  
  updatedAt: string;
}

export interface Student {
  id: string;
  // Required fields
  partnerId: string; // From v6: student must belong to a partner
  fullName: string; // Combined name field from v6
  firstName?: string; // Legacy compatibility
  lastName?: string;  // Legacy compatibility
  email: string;
  passportNumber: string;
  dateOfBirth: string; // Required in v6
  nationality: string;
  phone?: string;
  gender?: 'male' | 'female';
  
  // Contact Information (from v6)
  currentAddress?: string;
  permanentAddress?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyContactRelationship?: string;
  parentGuardianName?: string;
  
  // Academic Background (from v6)
  highestEducation?: string;
  graduationYear?: number;
  gpa?: number;
  englishProficiencyType?: string;
  englishProficiencyScore?: string;
  englishProficiencyExpires?: string;
  
  // Returning Student Intelligence (NEW in v6)
  searchTokens?: string; // For full-text search
  firstApplicationDate?: string;
  totalApplications: number;
  successfulApplications: number;
  lastApplicationDate?: string;
  applicationIds?: string[]; // Legacy compatibility
  profileVersion: number;
  profileCompletedAt?: string;
  
  // Smart Suggestions
  preferredProgramLevels: string[];
  preferredCountries: string[];
  typicalDocumentTypes: string[];
  
  // Data Compliance
  dataConsentGiven: boolean;
  dataConsentDate?: string;
  gdprCompliant: boolean;
  
  // Status & Activity
  status: 'active' | 'inactive' | 'archived';
  lastActivityAt: string;
  
  createdAt: string;
  updatedAt: string;
  
  // Legacy compatibility fields
  address?: string;
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
  academicHistory?: Array<{
    institution: string;
    degree: string;
    startYear: number;
    endYear: number;
    gpa: number;
  }>;
  englishProficiency?: {
    testType: string;
    score: string;
    testDate: string;
  };
}

export interface Application {
  id: string;
  studentId: string;
  partnerId: string;
  programInfoId?: string; // Link to program_info from v6
  assignedAdminId?: string; // Admin handling this application
  
  // Application Details (from v6)
  trackingNumber: string; // Auto-generated, required in v6
  intendedIntake: string; // Date in YYYY-MM-DD format
  priority: 'low' | 'medium' | 'high' | 'urgent';
  applicationType: 'new' | 'transfer' | 'reapplication';
  
  // Workflow Status (5-stage system)
  currentStage: 1 | 2 | 3 | 4 | 5;
  currentStatus: string;
  
  // Returning Student Support (NEW for v6)
  isReturningStudent: boolean;
  studentSearchMethod?: 'passport' | 'email' | 'phone' | 'new';
  previousApplicationId?: string; // Self-reference for related apps
  profileEditMode: boolean;
  
  // Status Tracking & Performance (NEW for v6)
  statusChangeCount: number;
  lastStatusChangeAt: string;
  lastStatusChangeBy?: string;
  stuckDurationHours: number;
  totalProcessingDays: number;
  stageCompletionDates: Record<string, string>; // Track when each stage completed
  
  // Document Management
  requiredDocumentsCount: number;
  uploadedDocumentsCount: number;
  approvedDocumentsCount: number;
  reusedDocumentsCount: number;
  newDocumentsCount: number;
  documentCompletionPercentage: number;
  activeDocumentRequestId?: string;
  documentRequestCount: number;
  
  // Communication & Interaction (NEW for v6)
  communicationCount: number;
  lastCommunicationAt?: string;
  unreadAdminMessages: number;
  unreadPartnerMessages: number;
  
  // Commission Tracking
  commissionPercentage?: number;
  estimatedCommission?: number;
  commissionStatus: 'pending' | 'earned' | 'approved' | 'paid' | 'cancelled';
  commissionEarnedAt?: string;
  commissionPaidAt?: string;
  
  // Status Management
  rejectionReason?: string;
  
  // Auto-save Support
  draftData: Record<string, unknown>;
  lastAutoSave?: string;
  isSubmitted: boolean;
  
  // University & External Tracking
  universityApplicationId?: string;
  universityPortalUrl?: string;
  visaApplicationId?: string;
  
  // Performance Analytics
  partnerSatisfactionScore?: number;
  processingEfficiencyScore: number;
  
  // Legacy compatibility fields
  nextAction?: string;
  nextActor?: 'Admin' | 'Partner' | 'University' | 'Immigration';
  stageHistory?: StageHistoryEntry[];
  documentsRequired?: string[];
  hasActionRequired?: boolean; // Quick flag for partner to see action needed
  programChangeId?: string; // ID of program change request
  
  // Hold/Resume functionality
  previousStatus?: string; // Status to resume to when coming off hold
  holdReason?: string; // Reason why application was put on hold
  heldBy?: string; // Admin who put the application on hold
  heldAt?: string; // Timestamp when application was put on hold
  resumeReason?: string; // Reason why application was resumed
  resumedBy?: string; // Admin who resumed the application
  resumedAt?: string; // Timestamp when application was resumed
  
  // Cancel functionality
  cancelReason?: string; // Reason why application was cancelled
  cancelledBy?: string; // Admin who cancelled the application
  cancelledAt?: string; // Timestamp when application was cancelled
  
  program: string;
  university: string;
  intakeDate: string;
  tuitionFee?: number;
  currency?: string;
  
  // Additional properties used in initialize-v2.ts
  documents?: Array<{
    id: string;
    name: string;
    type: string;
    status: string;
    uploadedAt: string;
    uploadedBy: string;
    filename: string;
    size: number;
    url: string;
  }>;
  timeline?: Array<{
    id: string;
    stage: number;
    status: string;
    timestamp: string;
    actor: string;
    action: string;
    notes?: string;
  }>;
  metadata?: Record<string, unknown>;
  
  // Program change workflow support
  appliedProgram?: string; // Original applied program for compatibility
  appliedUniversity?: string; // Original applied university for compatibility
  studentName?: string; // Student name for compatibility
  studentEmail?: string; // Student email for compatibility
  submissionDate?: string; // Submission date for compatibility
  notes?: string; // General notes
  
  programChangeData?: {
    suggestedUniversity: string;
    suggestedProgram: string;
    originalProgram: string;
    reason: string;
    suggestedAt?: string;
    suggestedBy?: string;
    newProgramDetails?: {
      duration: string;
      fee: number;
      requirements: string[];
    };
  };
  programChangeDecision?: {
    decision: 'accepted' | 'rejected';
    decidedAt: string;
    decidedBy: string;
    reason: string;
    newProgram?: {
      university: string;
      program: string;
      details?: {
        duration: string;
        fee: number;
        requirements: string[];
      };
    };
  };
  
  // Timeline
  createdAt: string;
  updatedAt: string;
  submittedAt?: string;
}

export interface StageHistoryEntry {
  stage: number;
  status: string;
  timestamp: string;
  actor: string;
  reason?: string;
  documents?: string[];
  notes?: string;
}

export interface Document {
  id: string;
  applicationId: string;
  documentRequestId?: string; // If uploaded in response to request
  
  // Document Classification
  stage: number;
  documentType: string;
  category: 'academic' | 'financial' | 'legal' | 'medical' | 'personal' | 'visa' | 'other';
  subCategory?: string;
  
  // File Information
  fileName: string;
  originalFileName: string;
  fileUrl?: string;
  fileSize?: number;
  mimeType?: string;
  fileHash?: string; // To detect duplicates
  
  // Document Metadata
  isMandatory: boolean;
  isStageSpecific: boolean;
  version: number; // For resubmissions
  replacesDocumentId?: string; // If this is a replacement
  
  // Validity & Expiry
  issuedDate?: string;
  expiresAt?: string;
  isCertified: boolean;
  certificationAuthority?: string;
  
  // Upload Information
  uploadedBy: string;
  uploadMethod: 'web' | 'email' | 'mobile_app' | 'api';
  uploadedAt: string;
  
  // Review Information
  status: 'pending' | 'under_review' | 'approved' | 'rejected' | 'expired' | 'resubmission_required';
  reviewedBy?: string;
  reviewedAt?: string;
  rejectionReason?: string;
  reviewNotes?: string;
  adminFeedback?: string;
  
  // External Review (University/Immigration)
  universityStatus?: 'pending' | 'approved' | 'rejected' | 'not_required';
  immigrationStatus?: 'pending' | 'approved' | 'rejected' | 'not_required';
  
  // Performance & Analytics
  reviewTimeHours?: number;
  partnerSatisfactionRating?: number;
  
  createdAt: string;
  updatedAt: string;
  
  // Legacy compatibility
  type?: string;
  url?: string;
  parentDocumentId?: string; // Link to previous version if resubmitted
  size?: number; // File size in bytes
}

export interface DocumentRequest {
  id: string;
  applicationId: string;
  stage: number;
  
  // Request Identification
  requestNumber?: string; // REQ-2024-001
  requestType: 'initial' | 'correction' | 'additional' | 'urgent';
  
  // Request Information
  requestedBy: string;
  requestedFor: 'admin' | 'university' | 'immigration' | 'embassy';
  
  // Content & Requirements
  title: string;
  description?: string;
  requestedDocuments: string[]; // List of specific documents needed
  specialInstructions?: string;
  
  // Timeline & Priority
  dueDate?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  escalationLevel: number;
  
  // Status & Response Tracking
  status: 'pending' | 'in_progress' | 'partially_completed' | 'completed' | 'overdue' | 'cancelled';
  responseStatus: 'awaiting' | 'partial' | 'complete' | 'rejected';
  
  // Completion Tracking
  totalDocumentsRequested: number;
  documentsReceived: number;
  documentsApproved: number;
  completionPercentage: number;
  
  // Communication & Reminders
  reminderSentCount: number;
  lastReminderSent?: string;
  autoReminderEnabled: boolean;
  partnerNotified: boolean;
  
  // Timeline
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  closedAt?: string;
  
  // Legacy compatibility
  requestedAt?: string;
  requestSource?: 'Admin' | 'University' | 'Immigration';
  documents?: DocumentRequirement[];
  notes?: string;
}

export interface DocumentRequirement {
  id: string;
  type: string;
  description: string;
  mandatory: boolean;
  status: 'pending' | 'uploaded' | 'approved' | 'rejected' | 'resubmission_required';
  documentId?: string; // Link to uploaded document
  rejectionReason?: string;
}

export interface Payment {
  id: string;
  applicationId: string;
  stage: number;
  type: 'visa_fee' | 'student_payment';
  amount: number;
  currency: string;
  proofDocument: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
  processedAt?: string;
  processedBy?: string;
}

export interface VisaRecord {
  id: string;
  applicationId: string;
  trackingNumber: string;
  visaNumber?: string;
  issuedAt?: string;
  expiryDate?: string;
  status: 'submitted' | 'approved' | 'rejected';
  rejectionReason?: string;
}

export interface ArrivalRecord {
  id: string;
  applicationId: string;
  plannedArrivalDate: string;
  actualArrivalDate?: string;
  status: 'planned' | 'confirmed' | 'verified';
  verifiedBy?: string;
  verifiedAt?: string;
}


export interface Comment {
  id: string;
  applicationId: string;
  stage: number;
  author: string;
  authorRole: 'admin' | 'partner';
  content: string;
  isInternal: boolean;
  createdAt: string;
  parentId?: string; // For threaded comments/replies
}

export interface AuditLogEntry {
  id: string;
  applicationId: string;
  event: string;
  action: string;
  actor: string;
  actorRole: 'admin' | 'partner' | 'university' | 'immigration';
  timestamp: string;
  previousStatus?: string;
  newStatus?: string;
  stage?: number;
  reason?: string;
  trackingNumber?: string;
  visaNumber?: string;
  documents?: string[];
  details?: Record<string, unknown>;
}

export interface DashboardStats {
  totalApplications: number;
  pendingReview: number;
  approved: number;
  rejected: number;
  byStage: Record<number, number>;
  byStatus: Record<string, number>;
  recentActivity: AuditLogEntry[];
}

export interface WorkflowStage {
  stage: number;
  name: string;
  description: string;
  statuses: WorkflowStatus[];
}

export interface WorkflowStatus {
  key: string;
  name: string;
  description: string;
  nextAction: string;
  nextActor: 'Admin' | 'Partner' | 'University' | 'Immigration';
  canTransitionTo: string[];
  requiresReason?: boolean;
  requiresDocuments?: string[];
  allowedVerbs?: string[];
  preconditions?: string[];
  inputs?: string[];
  validationRules?: string[];
  statusTransition?: string;
  notifications?: Array<{to: string; template: string}>;
  auditLog?: {event: string; fields?: string[]};
}

export interface AuthSession {
  user: User;
  token: string;
  expiresAt: string;
}

export interface DocumentRequestData {
  documentType: string;
  reason: string;
  applicationId: string;
}

export interface FileUploadData {
  files: FileList;
  uploadType: string;
  notes: string;
  applicationId: string;
}

export interface ProgramChangeData {
  newProgram: string;
  reason: string;
  applicationId: string;
}

export interface ProgramDecisionData {
  decision: 'accept' | 'reject';
  reason: string;
  suggestedProgram?: string;
  applicationId: string;
}

// New MVP Entities

export interface University {
  id: string;
  name: string;
  type: 'university' | 'college';
  country: string;
  logo?: string;
  createdAt: string;
}

export interface College {
  id: string;
  universityId: string;
  name: string;
  createdAt: string;
}

export interface Program {
  id: string;
  universityId: string;
  collegeId?: string; // Optional college within university
  name: string;
  duration: string;
  fees: number;
  currency: string;
  intakes: string[];
  requirements?: string[];
  createdAt: string;
}

// Enhanced Program Management with Field of Study and Level Support

export interface FieldOfStudy {
  id: string;
  name: string;
  code: string; // Based on ISCED-F simplified
  keywords: string[]; // For search matching
  icon: string; // Emoji or icon identifier
  description?: string;
  subcategories?: string[]; // Related specializations
  createdAt: string;
}

export interface Level {
  id: string;
  universityId: string;
  collegeId: string;
  name: 'Bachelor' | 'Master' | 'PhD' | 'Foundation' | 'Diploma' | 'Certificate';
  displayName: string; // E.g., "Bachelor's Degree", "Master's Degree"
  
  // Default values that can be inherited by programs
  defaultDuration?: string;
  defaultCommissionRate?: number; // Percentage (0.15 = 15%)
  defaultEnglishRequirements?: EnglishRequirements;
  
  // Metadata
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface EnglishRequirements {
  ielts?: number;
  toefl?: number;
  pte?: number;
  duolingo?: number;
  other?: {
    testName: string;
    minScore: number | string;
  };
}

export interface EnhancedProgram extends Program {
  levelId: string;
  fieldOfStudyId: string;
  
  // Override inherited values from Level if needed
  englishRequirements?: EnglishRequirements;
  commissionRate?: number; // Override level default
  
  // Enhanced search and categorization
  searchKeywords: string[]; // Additional keywords for better search
  programCode?: string; // Internal program code
  isActive: boolean; // Enable/disable programs
  
  // Display enhancements
  shortDescription?: string;
  highlights?: string[]; // Key selling points
  programUrl?: string; // Official program URL for partners to get more information
  
  // Inheritance flags
  inheritsFromLevel: {
    duration: boolean;
    commission: boolean;
    englishRequirements: boolean;
  };
  
  updatedAt: string;
}

export interface LogisticsPartner {
  id: string;
  name: string;
  city: string;
  country: string;
  phone: string;
  email: string;
  services: string[];
  description?: string;
  createdAt: string;
}

export interface ServiceProvider {
  id: string;
  name: string;
  type: 'accommodation' | 'transport' | 'insurance' | 'medical' | 'banking' | 'other';
  contactEmail: string;
  contactPhone: string;
  country: string;
  services: string[]; // Simple list of services offered
  description?: string;
  createdAt: string;
}

// Analytics interfaces for dashboard cards
export interface PartnerAnalytics {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
}

export interface StudentAnalytics {
  total: number;
  active: number;
  countries: number;
  programs: number;
}

export interface UniversityAnalytics {
  totalUniversities: number;
  totalColleges: number;
  totalPrograms: number;
  countries: number;
}

export interface ServiceAnalytics {
  total: number;
  byType: Record<string, number>;
}

// Commission Module Types (Updated for v6 compatibility)
export type CommissionStatus = 
  | 'pending'        // Initial state, awaiting admin review
  | 'earned'         // Student enrolled, commission earned
  | 'approved'       // Admin approved, payment being processed
  | 'paid'           // Payment completed (terminal status)
  | 'cancelled'      // Commission cancelled
  | 'disputed'       // Payment disputed
  | 'commission_pending'    // v6 Stage 5 statuses
  | 'commission_approved'   
  | 'commission_paid'
  | 'commission_disputed'
  | 'commission_released'
  | 'commission_transfer_disputed';

export interface Commission {
  id: string;
  applicationId: string;
  studentId: string;
  partnerId: string;
  
  // Commission Details
  tuitionFee: number;
  commissionRate: number;        // e.g., 0.15 for 15%
  commissionAmount: number;      // calculated amount
  currency: string;              // e.g., 'MYR'
  
  // Status & Dates (v6 compatible)
  status: CommissionStatus;
  enrollmentDate?: string;        // When enrollment was confirmed
  createdAt: string;             // When commission was created (Stage 5 start)
  earnedAt?: string;             // When student enrolled
  approvedAt?: string;           // When admin approved
  paidAt?: string;               // When payment was made
  cancelledAt?: string;          // When cancelled
  
  // Documents & Payment Info
  transferDocumentUrl?: string;   // Admin uploaded transfer receipt
  transferReference?: string;     // Bank transfer reference number
  paymentNotes?: string;         // Admin notes about payment
  paymentMethod?: string;        // Payment method used
  paymentBatchId?: string;       // Batch ID for bulk payments
  
  // Verification & Compliance (v6)
  enrollmentVerified: boolean;
  enrollmentVerificationDate?: string;
  enrollmentVerificationDocument?: string;
  studentAttendanceConfirmed: boolean;
  
  // Metadata
  partnerTier: 'bronze' | 'silver' | 'gold' | 'platinum';
  university: string;
  program: string;
  
  // Performance & Analytics (v6)
  daysToEarn?: number;
  partnerTierAtEarning?: string;
  bonusCommission: number;
  totalCommission?: number;
  
  // Dispute & Resolution (v6)
  disputeReason?: string;
  disputeResolvedAt?: string;
  disputeResolutionNotes?: string;
  
  // Audit
  approvedBy?: string;           // Admin who approved
  releasedBy?: string;           // Admin who released payment
  
  updatedAt: string;
}

export interface CommissionCalculationConfig {
  tiers: {
    bronze: { rate: number; minimumStudents: number };
    silver: { rate: number; minimumStudents: number };
    gold: { rate: number; minimumStudents: number };
    platinum: { rate: number; minimumStudents: number };
  };
  specialRates?: {
    byUniversity?: Record<string, number>;
    byProgram?: Record<string, number>;
    byCountry?: Record<string, number>;
  };
  processingFee?: number;        // Flat fee or percentage
  taxRate?: number;              // Tax percentage if applicable
}

export interface CommissionSummary {
  totalEarned: number;           // All commission_paid
  pendingReview: number;         // commission_pending
  awaitingPayment: number;       // commission_approved + commission_released  
  thisMonth: number;             // Paid this month
  totalStudents: number;         // Count of students with commissions
}

export interface CommissionPipelineStats {
  pending: {
    count: number;
    totalAmount: number;
    oldestDays: number;
  };
  approved: {
    count: number;
    totalAmount: number;
    averageDaysToApprove: number;
  };
  paid: {
    count: number;
    totalAmount: number;
    thisMonth: number;
  };
}

// NEW V6 ENTITIES

// Programs Info table (URL-based with commission tracking)
export interface ProgramInfo {
  id: string;
  
  // URL-based approach
  programUrl: string;
  urlHash?: string; // For fast lookups
  
  // Extracted/Manual Information
  universityName?: string;
  programName?: string;
  programLevel?: 'Foundation' | 'Diploma' | 'Bachelor' | 'Master' | 'PhD';
  country?: string;
  city?: string;
  programCode?: string;
  
  // Financial Information (COMMISSION TRANSPARENCY)
  tuitionFee?: number;
  applicationFee?: number;
  commissionPercentage: number;
  commissionType: 'percentage' | 'fixed';
  commissionAmount?: number;
  currency: string;
  
  // Program Details
  intakeDates: string[];
  applicationDeadline?: string;
  programDuration?: string;
  programDescription?: string;
  entryRequirements?: string;
  
  // Document Requirements (Excel-based)
  requiredDocuments: string[];
  optionalDocuments: string[];
  conditionalDocuments: string[];
  documentRequirementsByNationality: Record<string, string[]>;
  
  // Performance & Analytics
  applicationsCount: number;
  successRate: number;
  averageProcessingDays: number;
  universityResponseRate: number;
  
  // Verification
  isVerified: boolean;
  verifiedBy?: string;
  verifiedAt?: string;
  verificationNotes?: string;
  lastUpdated: string;
  
  createdAt: string;
  updatedAt: string;
}

// Status Authority Matrix (Critical for v6)
export interface StatusAuthorityMatrix {
  id: string;
  
  // Status Identification
  stage: number;
  statusCode: string;
  statusName: string;
  statusDescription?: string;
  
  // Authority Rules (From workflow config)
  setBy: 'Admin' | 'Partner' | 'System';
  setTrigger: string;
  
  // Admin Permissions
  adminCanUpdate: boolean;
  adminTransitions: string[];
  adminWaitsFor?: string;
  
  // Partner Permissions
  partnerCanUpdate: boolean;
  partnerTransitions: string[];
  partnerWaitsFor?: string;
  
  // System Permissions
  systemCanUpdate: boolean;
  systemTransitions: string[];
  systemAutoTriggerAfterHours?: number;
  
  // Requirements & Rules
  requiresDocuments: string[];
  requiresReason: boolean;
  requiresAdminApproval: boolean;
  isTerminalStatus: boolean;
  
  // Performance & Timing
  estimatedDurationDays: number;
  maxStuckDurationHours: number;
  escalationAfterHours?: number;
  
  // Display & UI
  displayColor: string;
  displayIcon: string;
  urgencyLevel: string;
  showInDashboard: boolean;
  
  // Metadata
  isActive: boolean;
  createdAt: string;
}

// Status Transitions Log (Complete Audit Trail)
export interface StatusTransitionLog {
  id: string;
  
  // Application Reference
  applicationId: string;
  trackingNumber: string;
  
  // Transition Details
  fromStage?: number;
  fromStatus?: string;
  toStage?: number;
  toStatus?: string;
  
  // Actor Information
  changedBy?: string;
  changedByRole?: 'admin' | 'partner' | 'system' | 'university' | 'immigration';
  changedByName?: string;
  
  // Context & Reasoning
  changeReason?: string;
  changeNotes?: string;
  documentsAttached: string[];
  metadata: Record<string, unknown>;
  
  // Performance Analytics
  transitionTimeHours: number;
  wasStuck: boolean;
  wasEscalated: boolean;
  
  // System Information
  ipAddress?: string;
  userAgent?: string;
  
  createdAt: string;
}

// Student Document Pool (Document Reuse)
export interface StudentDocumentPool {
  id: string;
  studentId: string;
  
  // Document Classification
  documentType: string;
  documentName: string;
  category: 'personal' | 'academic' | 'financial' | 'legal' | 'medical';
  
  // File Information
  fileName: string;
  originalFileName: string;
  fileUrl?: string;
  fileSize?: number;
  mimeType?: string;
  fileHash?: string; // To detect duplicates
  
  // Origin & History
  originalApplicationId?: string; // First application that uploaded this
  uploadedBy?: string;
  uploadedAt: string;
  
  // Validity & Expiry
  expiresAt?: string;
  isValid: boolean;
  validityCheckedAt?: string;
  validityNotes?: string;
  
  // Reuse Tracking
  canReuse: boolean;
  timesReused: number;
  lastReusedAt?: string;
  lastReusedApplicationId?: string;
  
  // Review Status
  reviewStatus: 'pending' | 'approved' | 'rejected' | 'expired';
  reviewedBy?: string;
  reviewedAt?: string;
  reviewNotes?: string;
  
  createdAt: string;
  updatedAt: string;
}

// Document Request Responses (NEW for v6)
export interface DocumentRequestResponse {
  id: string;
  
  // Request Reference
  requestId: string;
  applicationId: string;
  
  // Response Details
  documentType: string;
  documentId?: string; // If new upload
  reusedDocumentId?: string; // If reused from pool
  
  // Response Status
  responseType?: 'new_upload' | 'reused_document' | 'not_available';
  uploadStatus: 'uploaded' | 'under_review' | 'approved' | 'rejected' | 'resubmission_required';
  
  // Response Information
  partnerNotes?: string;
  uploadMethod: 'web' | 'email' | 'mobile_app';
  
  // Review Information
  reviewedBy?: string;
  reviewedAt?: string;
  reviewDecision?: 'approved' | 'rejected' | 'needs_revision';
  reviewNotes?: string;
  adminFeedback?: string;
  
  // Timeline
  uploadedAt: string;
  createdAt: string;
}

// Application Communications (NEW for v6)
export interface ApplicationCommunication {
  id: string;
  
  // Application Reference
  applicationId: string;
  trackingNumber?: string;
  
  // Message Details
  senderId: string;
  senderRole: 'admin' | 'partner';
  senderName?: string;
  
  recipientId?: string;
  recipientRole?: 'admin' | 'partner';
  recipientName?: string;
  
  // Message Content
  messageType: 'general' | 'status_change' | 'document_request' | 'correction_needed' | 'approval' | 'rejection' | 'commission';
  subject?: string;
  message: string;
  
  // Attachments & References
  attachments: string[];
  referencesStatus?: string;
  referencesDocumentId?: string;
  referencesRequestId?: string;
  
  // Priority & Urgency
  priority: 'low' | 'medium' | 'high' | 'urgent';
  requiresResponse: boolean;
  responseDeadline?: string;
  
  // Status & Tracking
  isRead: boolean;
  readAt?: string;
  isArchived: boolean;
  archivedAt?: string;
  
  // Response Tracking
  isResponseTo?: string; // Self-reference for reply threads
  responseCount: number;
  lastResponseAt?: string;
  
  // Delivery & Notifications
  emailSent: boolean;
  smsSent: boolean;
  pushNotificationSent: boolean;
  deliveryStatus: string;
  
  createdAt: string;
}

// Commission Tracking (Enhanced for v6)
export interface CommissionTracking {
  id: string;
  
  // Application Reference
  applicationId: string;
  partnerId: string;
  trackingNumber?: string;
  
  // Program Information
  programInfoId?: string;
  programUrl?: string;
  programName?: string;
  universityName?: string;
  
  // Financial Details
  tuitionAmount: number;
  commissionPercentage: number;
  commissionAmount: number;
  currency: string;
  
  // Commission Status Lifecycle
  commissionStatus: 'pending' | 'earned' | 'approved' | 'paid' | 'cancelled' | 'disputed';
  
  // Timeline Tracking
  createdAt: string;
  earnedAt?: string; // When student enrolled
  approvedAt?: string; // When admin approved payment
  paidAt?: string; // When payment was made
  cancelledAt?: string;
  
  // Approval & Payment Details
  approvedBy?: string;
  approvalNotes?: string;
  paymentMethod?: string;
  paymentReference?: string;
  paymentBatchId?: string;
  
  // Verification & Compliance
  enrollmentVerified: boolean;
  enrollmentVerificationDate?: string;
  enrollmentVerificationDocument?: string;
  studentAttendanceConfirmed: boolean;
  
  // Performance & Analytics
  daysToEarn?: number; // Days from application to enrollment
  partnerTierAtEarning?: string;
  bonusCommission: number;
  totalCommission?: number; // commissionAmount + bonusCommission
  
  // Dispute & Resolution
  disputeReason?: string;
  disputeResolvedAt?: string;
  disputeResolutionNotes?: string;
  
  updatedAt: string;
}

// Partner Dashboard Metrics (Enhanced for v6)
export interface PartnerDashboardMetrics {
  id: string;
  partnerId: string;
  metricDate: string;
  metricType: 'daily' | 'weekly' | 'monthly';
  
  // Application Metrics
  applicationsSubmitted: number;
  applicationsApproved: number;
  applicationsRejected: number;
  applicationsInProgress: number;
  
  // Commission Metrics
  commissionEarned: number;
  commissionPending: number;
  commissionPaid: number;
  
  // Performance Indicators
  avgProcessingTimeHours: number;
  documentApprovalRate: number;
  conversionRate: number;
  partnerSatisfactionScore: number;
  
  // Communication Metrics
  messagesSent: number;
  messagesReceived: number;
  responseTimeHours: number;
  
  // Document Metrics
  documentsUploaded: number;
  documentsApproved: number;
  documentReuseCount: number;
  
  createdAt: string;
}

// Application Sessions (Auto-save support)
export interface ApplicationSession {
  id: string;
  
  // Session Information
  sessionToken: string;
  partnerId: string;
  applicationId?: string; // If editing existing
  
  // Session Data
  studentData: Record<string, unknown>;
  programData: Record<string, unknown>;
  documentData: Record<string, unknown>;
  formState: Record<string, unknown>;
  
  // Progress Tracking
  currentStep: number;
  totalSteps: number;
  completionPercentage: number;
  isCompleted: boolean;
  
  // Session Management
  isReturningStudentSession: boolean;
  selectedStudentId?: string;
  studentSearchMethod?: string;
  
  // Activity & Expiry
  lastActivity: string;
  expiresAt: string;
  sessionTimeoutMinutes: number;
  
  // Metadata
  ipAddress?: string;
  userAgent?: string;
  deviceType: string;
  
  createdAt: string;
}

// Workflow Templates (NEW for v6 - Partner Efficiency)
export interface WorkflowTemplate {
  id: string;
  partnerId: string;
  
  // Template Information
  templateName: string;
  description?: string;
  isPublic: boolean; // Can other partners use this template?
  
  // Template Criteria
  studentNationality?: string;
  programLevel?: string;
  programCountry?: string;
  programType?: string;
  
  // Template Data
  typicalDocuments: string[];
  documentChecklist: string[];
  preFilledData: Record<string, unknown>;
  
  // Performance Analytics
  timesUsed: number;
  successRate: number;
  averageProcessingDays: number;
  lastUsedAt?: string;
  
  // Smart Suggestions
  recommendedIntakeMonths: string[];
  commonCorrections: string[];
  processingTips?: string;
  
  createdAt: string;
  updatedAt: string;
}