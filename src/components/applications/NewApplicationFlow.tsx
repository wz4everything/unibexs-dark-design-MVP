'use client';

import React, { useState, useEffect } from 'react';
import { AuthService } from '@/lib/auth';
import { StorageService } from '@/lib/data/storage';
import { Student, Application, ProgramInfo, ApplicationSession } from '@/types';
import { 
  Search, 
  User, 
  FileText, 
  Upload, 
  CheckCircle, 
  ArrowLeft, 
  ArrowRight, 
  Save,
  RotateCcw,
  X,
  XCircle,
  UserCheck,
  Globe,
  GraduationCap,
  FileCheck,
  Send,
  Sparkles
} from 'lucide-react';
import { generateArabicStudentData, generateArabicProgramData } from '@/lib/utils/test-data-generator';
import { DEFAULT_COMMISSION_CONFIG } from '@/lib/commission/commission-calculator';

interface NewApplicationFlowProps {
  onComplete: (applicationId: string) => void;
  onCancel: () => void;
}

interface FormData {
  // Student Information
  studentSearch: string;
  studentSearchMethod: 'passport' | 'email' | 'phone' | 'new';
  selectedStudentId?: string;
  isReturningStudent: boolean;
  
  // Student Details (for new or editing returning)
  fullName: string;
  email: string;
  phone: string;
  nationality: string;
  passportNumber: string;
  dateOfBirth: string;
  gender: 'male' | 'female' | '';
  
  // Contact Information
  currentAddress: string;
  permanentAddress: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  emergencyContactRelationship: string;
  
  // Academic Background
  highestEducation: string;
  graduationYear: number | '';
  gpa: number | '';
  englishProficiencyType: string;
  englishProficiencyScore: string;
  
  // Program Information
  programUrl: string;
  universityName: string;
  programName: string;
  programLevel: 'Foundation' | 'Diploma' | 'Bachelor' | 'Master' | 'PhD' | '';
  intendedIntake: string;
  tuitionFee: number | '';
  commissionPercentage: number | '';
  
  // Application Settings
  priority: 'low' | 'medium' | 'high' | 'urgent';
  notes: string;
}

const STEPS = [
  {
    id: 1,
    title: 'Student Search',
    description: 'Find existing student or create new',
    icon: Search,
  },
  {
    id: 2,
    title: 'Student Details',
    description: 'Personal and contact information',
    icon: User,
  },
  {
    id: 3,
    title: 'Program Selection',
    description: 'University and program details',
    icon: GraduationCap,
  },
  {
    id: 4,
    title: 'Review & Submit',
    description: 'Confirm and submit application',
    icon: Send,
  },
];

const NewApplicationFlow: React.FC<NewApplicationFlowProps> = ({
  onComplete,
  onCancel,
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [searchResults, setSearchResults] = useState<Student[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  // Get current partner to determine commission rate
  const currentUser = AuthService.getCurrentUser();
  const currentPartner = currentUser?.partnerId ? StorageService.getPartner(currentUser.partnerId) : null;
  
  // Calculate partner commission rate based on tier
  const getPartnerCommissionRate = (): number => {
    if (!currentPartner) return 10; // Default 10%
    const tierRates = DEFAULT_COMMISSION_CONFIG.tiers;
    const rate = currentPartner.tier === 'platinum' ? 0.15 : (tierRates[currentPartner.tier as keyof typeof tierRates]?.rate || 0.10);
    return rate * 100; // Convert to percentage
  };
  
  const [formData, setFormData] = useState<FormData>({
    // Student Search
    studentSearch: '',
    studentSearchMethod: 'passport',
    isReturningStudent: false,
    
    // Student Details
    fullName: '',
    email: '',
    phone: '',
    nationality: '',
    passportNumber: '',
    dateOfBirth: '',
    gender: '',
    
    // Contact Information
    currentAddress: '',
    permanentAddress: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    emergencyContactRelationship: '',
    
    // Academic Background
    highestEducation: '',
    graduationYear: '',
    gpa: '',
    englishProficiencyType: '',
    englishProficiencyScore: '',
    
    // Program Information
    programUrl: '',
    universityName: '',
    programName: '',
    programLevel: '',
    intendedIntake: '',
    tuitionFee: '',
    commissionPercentage: getPartnerCommissionRate(),
    
    // Application Settings
    priority: 'medium',
    notes: '',
  });

  // Auto-save functionality
  useEffect(() => {
    const currentUser = AuthService.getCurrentUser();
    if (!currentUser?.partnerId) return;

    if (!sessionId) {
      // Create new session
      const newSessionId = generateSessionId();
      setSessionId(newSessionId);
      
      const session: ApplicationSession = {
        id: newSessionId,
        sessionToken: newSessionId,
        partnerId: currentUser.partnerId,
        studentData: {},
        programData: {},
        documentData: {},
        formState: formData as unknown as Record<string, unknown>,
        currentStep,
        totalSteps: STEPS.length,
        completionPercentage: (currentStep / STEPS.length) * 100,
        isCompleted: false,
        isReturningStudentSession: formData.isReturningStudent,
        selectedStudentId: formData.selectedStudentId,
        studentSearchMethod: formData.studentSearchMethod,
        lastActivity: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
        sessionTimeoutMinutes: 120,
        deviceType: 'web',
        createdAt: new Date().toISOString(),
      };
      
      StorageService.saveApplicationSession(session);
    }
  }, []);

  // Auto-save on form changes
  useEffect(() => {
    if (!sessionId) return;
    
    const saveTimeout = setTimeout(() => {
      autoSave();
    }, 2000); // Auto-save after 2 seconds of inactivity

    return () => clearTimeout(saveTimeout);
  }, [formData, currentStep, sessionId]);

  const generateSessionId = (): string => {
    return 'sess-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
  };

  const autoSave = () => {
    if (!sessionId) return;
    
    setIsSaving(true);
    
    try {
      const session: ApplicationSession = {
        id: sessionId,
        sessionToken: sessionId,
        partnerId: AuthService.getCurrentUser()?.partnerId || '',
        studentData: extractStudentData(formData),
        programData: extractProgramData(formData),
        documentData: {},
        formState: formData as unknown as Record<string, unknown>,
        currentStep,
        totalSteps: STEPS.length,
        completionPercentage: (currentStep / STEPS.length) * 100,
        isCompleted: false,
        isReturningStudentSession: formData.isReturningStudent,
        selectedStudentId: formData.selectedStudentId,
        studentSearchMethod: formData.studentSearchMethod,
        lastActivity: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        sessionTimeoutMinutes: 120,
        deviceType: 'web',
        createdAt: new Date().toISOString(),
      };
      
      StorageService.saveApplicationSession(session);
    } catch (error) {
      console.error('Auto-save failed:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const extractStudentData = (data: FormData) => ({
    fullName: data.fullName,
    email: data.email,
    phone: data.phone,
    nationality: data.nationality,
    passportNumber: data.passportNumber,
    dateOfBirth: data.dateOfBirth,
    gender: data.gender,
    currentAddress: data.currentAddress,
    permanentAddress: data.permanentAddress,
    emergencyContactName: data.emergencyContactName,
    emergencyContactPhone: data.emergencyContactPhone,
    emergencyContactRelationship: data.emergencyContactRelationship,
    highestEducation: data.highestEducation,
    graduationYear: data.graduationYear,
    gpa: data.gpa,
    englishProficiencyType: data.englishProficiencyType,
    englishProficiencyScore: data.englishProficiencyScore,
  });

  const extractProgramData = (data: FormData) => ({
    programUrl: data.programUrl,
    universityName: data.universityName,
    programName: data.programName,
    programLevel: data.programLevel,
    intendedIntake: data.intendedIntake,
    tuitionFee: data.tuitionFee,
    commissionPercentage: data.commissionPercentage,
  });

  const handleSearch = () => {
    if (!formData.studentSearch.trim()) return;
    
    setIsSearching(true);
    
    try {
      const currentUser = AuthService.getCurrentUser();
      const partnerId = currentUser?.partnerId;
      
      if (!partnerId) {
        console.error('Partner ID not found');
        return;
      }

      // Search students by the selected method
      const results = StorageService.searchStudents(
        formData.studentSearch,
        formData.studentSearchMethod,
        partnerId
      );
      
      setSearchResults(results);
      
      if (results.length === 0) {
        // No results found, suggest creating new student
        setFormData(prev => ({
          ...prev,
          isReturningStudent: false,
          // Pre-fill search data based on method
          ...(formData.studentSearchMethod === 'email' && { email: formData.studentSearch }),
          ...(formData.studentSearchMethod === 'passport' && { passportNumber: formData.studentSearch }),
          ...(formData.studentSearchMethod === 'phone' && { phone: formData.studentSearch }),
        }));
      }
      
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const selectExistingStudent = (student: Student) => {
    setFormData(prev => ({
      ...prev,
      selectedStudentId: student.id,
      isReturningStudent: true,
      // Pre-fill form with student data
      fullName: student.fullName,
      email: student.email,
      phone: student.phone || '',
      nationality: student.nationality,
      passportNumber: student.passportNumber,
      dateOfBirth: student.dateOfBirth || '',
      gender: (student as any).gender || '',
      currentAddress: (student as any).currentAddress || '',
      permanentAddress: (student as any).permanentAddress || '',
      emergencyContactName: (student as any).emergencyContactName || '',
      emergencyContactPhone: (student as any).emergencyContactPhone || '',
      emergencyContactRelationship: (student as any).emergencyContactRelationship || '',
      highestEducation: (student as any).highestEducation || '',
      graduationYear: (student as any).graduationYear || '',
      gpa: (student as any).gpa || '',
      englishProficiencyType: (student as any).englishProficiencyType || '',
      englishProficiencyScore: (student as any).englishProficiencyScore || '',
    }));
    
    // Move to next step
    setCurrentStep(2);
  };

  const createNewStudent = () => {
    setFormData(prev => ({
      ...prev,
      isReturningStudent: false,
      selectedStudentId: undefined,
    }));
    setCurrentStep(2);
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        // Student search/selection is validated by moving to next step
        return true;
      
      case 2:
        // Student details validation
        return !!(
          formData.fullName &&
          formData.email &&
          formData.nationality &&
          formData.passportNumber &&
          formData.dateOfBirth
        );
      
      case 3:
        // Program details validation
        return !!(
          formData.programUrl &&
          formData.universityName &&
          formData.programName &&
          formData.programLevel &&
          formData.intendedIntake
        );
      
      case 4:
        // Review step - all previous steps must be valid
        return validateStep(2) && validateStep(3);
      
      default:
        return true;
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, STEPS.length));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (!validateStep(4)) return;
    
    setIsSubmitting(true);
    
    try {
      const currentUser = AuthService.getCurrentUser();
      if (!currentUser?.partnerId) {
        throw new Error('Partner not found');
      }

      // Create or update student
      let studentId = formData.selectedStudentId;
      
      if (!studentId) {
        // Create new student
        const newStudent: Student = {
          id: generateId(),
          partnerId: currentUser.partnerId,
          fullName: formData.fullName,
          email: formData.email,
          passportNumber: formData.passportNumber,
          dateOfBirth: formData.dateOfBirth,
          nationality: formData.nationality,
          phone: formData.phone,
          gender: formData.gender as 'male' | 'female' | undefined,
          currentAddress: formData.currentAddress,
          permanentAddress: formData.permanentAddress,
          emergencyContactName: formData.emergencyContactName,
          emergencyContactPhone: formData.emergencyContactPhone,
          emergencyContactRelationship: formData.emergencyContactRelationship,
          parentGuardianName: '',
          highestEducation: formData.highestEducation,
          graduationYear: Number(formData.graduationYear) || undefined,
          gpa: Number(formData.gpa) || undefined,
          englishProficiencyType: formData.englishProficiencyType,
          englishProficiencyScore: formData.englishProficiencyScore,
          searchTokens: '',
          firstApplicationDate: new Date().toISOString(),
          totalApplications: 0,
          successfulApplications: 0,
          profileVersion: 1,
          preferredProgramLevels: formData.programLevel ? [formData.programLevel] : [],
          preferredCountries: [],
          typicalDocumentTypes: [],
          dataConsentGiven: true,
          dataConsentDate: new Date().toISOString(),
          gdprCompliant: true,
          status: 'active',
          lastActivityAt: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        
        StorageService.saveStudent(newStudent);
        studentId = newStudent.id;
      } else if (formData.isReturningStudent) {
        // Update existing student if needed
        const existingStudent = StorageService.getStudent(studentId);
        if (existingStudent) {
          const updatedStudent: Student = {
            ...existingStudent,
            fullName: formData.fullName,
            email: formData.email,
            phone: formData.phone,
            // Update other fields as needed
            lastActivityAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          StorageService.saveStudent(updatedStudent);
        }
      }

      // Create program info if needed
      let programInfoId: string | undefined;
      if (formData.programUrl) {
        const programInfo: ProgramInfo = {
          id: generateId(),
          programUrl: formData.programUrl,
          urlHash: btoa(formData.programUrl).substr(0, 32),
          universityName: formData.universityName,
          programName: formData.programName,
          programLevel: formData.programLevel as any,
          tuitionFee: Number(formData.tuitionFee) || undefined,
          commissionPercentage: getPartnerCommissionRate(),
          commissionType: 'percentage',
          currency: 'USD',
          intakeDates: formData.intendedIntake ? [formData.intendedIntake] : [],
          requiredDocuments: [],
          optionalDocuments: [],
          conditionalDocuments: [],
          documentRequirementsByNationality: {},
          applicationsCount: 0,
          successRate: 0,
          averageProcessingDays: 0,
          universityResponseRate: 0,
          isVerified: false,
          lastUpdated: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        
        StorageService.saveProgramInfo(programInfo);
        programInfoId = programInfo.id;
      }

      // Create application
      const newApplication: Application = {
        id: generateId(),
        studentId,
        partnerId: currentUser.partnerId,
        programInfoId,
        trackingNumber: generateTrackingNumber(),
        intendedIntake: formData.intendedIntake,
        priority: formData.priority,
        applicationType: 'new',
        currentStage: 1,
        currentStatus: 'new_application',
        isReturningStudent: formData.isReturningStudent,
        studentSearchMethod: formData.studentSearchMethod,
        previousApplicationId: formData.isReturningStudent ? findPreviousApplicationId(studentId) : undefined,
        profileEditMode: false,
        statusChangeCount: 1,
        lastStatusChangeAt: new Date().toISOString(),
        stuckDurationHours: 0,
        totalProcessingDays: 0,
        stageCompletionDates: {},
        requiredDocumentsCount: 0,
        uploadedDocumentsCount: 0,
        approvedDocumentsCount: 0,
        reusedDocumentsCount: 0,
        newDocumentsCount: 0,
        documentCompletionPercentage: 0,
        documentRequestCount: 0,
        communicationCount: 0,
        unreadAdminMessages: 0,
        unreadPartnerMessages: 0,
        commissionPercentage: getPartnerCommissionRate(),
        estimatedCommission: calculateEstimatedCommission(
          Number(formData.tuitionFee) || 0,
          getPartnerCommissionRate()
        ),
        commissionStatus: 'pending',
        draftData: {},
        isSubmitted: true,
        processingEfficiencyScore: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        submittedAt: new Date().toISOString(),
        // Legacy fields for compatibility
        program: formData.programName,
        university: formData.universityName,
        intakeDate: formData.intendedIntake,
        tuitionFee: Number(formData.tuitionFee) || undefined,
        currency: 'USD',
        notes: formData.notes,
      };

      StorageService.saveApplication(newApplication);

      // Clean up session
      if (sessionId) {
        StorageService.removeApplicationSession(sessionId);
      }

      // Complete the flow
      onComplete(newApplication.id);
      
    } catch (error) {
      console.error('Failed to submit application:', error);
      const errorMsg = error instanceof Error ? error.message : 'Failed to submit application. Please try again.';
      setErrorMessage(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const generateId = (): string => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  };

  const generateTrackingNumber = (): string => {
    const year = new Date().getFullYear();
    const dayOfYear = Math.floor((Date.now() - new Date(year, 0, 0).getTime()) / 1000 / 60 / 60 / 24);
    const random = Math.floor(Math.random() * 9999).toString().padStart(4, '0');
    return `UNI${year}${dayOfYear.toString().padStart(3, '0')}${random}`;
  };

  const findPreviousApplicationId = (studentId: string): string | undefined => {
    const applications = StorageService.getApplications().filter(app => app.studentId === studentId);
    return applications.length > 0 ? applications[applications.length - 1].id : undefined;
  };

  const calculateEstimatedCommission = (tuitionFee: number, commissionPercentage: number): number => {
    return (tuitionFee * commissionPercentage) / 100;
  };

  const fillTestData = (step: number) => {
    if (step === 2) {
      // Fill student details with Arabic data
      const studentData = generateArabicStudentData();
      setFormData(prev => ({
        ...prev,
        fullName: studentData.fullName,
        email: studentData.email,
        phone: studentData.phone,
        nationality: studentData.nationality,
        passportNumber: studentData.passportNumber,
        dateOfBirth: studentData.dateOfBirth,
        gender: studentData.gender,
        currentAddress: studentData.currentAddress,
        permanentAddress: studentData.permanentAddress,
        emergencyContactName: studentData.emergencyContactName,
        emergencyContactPhone: studentData.emergencyContactPhone,
        emergencyContactRelationship: studentData.emergencyContactRelationship,
        highestEducation: studentData.highestEducation,
        graduationYear: studentData.graduationYear,
        gpa: studentData.gpa,
        englishProficiencyType: studentData.englishProficiencyType,
        englishProficiencyScore: studentData.englishProficiencyScore,
      }));
    } else if (step === 3) {
      // Fill program data
      const programData = generateArabicProgramData();
      setFormData(prev => ({
        ...prev,
        universityName: programData.universityName,
        programName: programData.programName,
        programLevel: programData.programLevel,
        programUrl: programData.programUrl,
        intendedIntake: programData.intendedIntake,
        tuitionFee: programData.tuitionFee,
        commissionPercentage: programData.commissionPercentage,
      }));
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return renderStudentSearchStep();
      case 2:
        return renderStudentDetailsStep();
      case 3:
        return renderProgramSelectionStep();
      case 4:
        return renderReviewStep();
      default:
        return null;
    }
  };

  const renderStudentSearchStep = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-white mb-2">Find Existing Student</h3>
        <p className="text-sm text-gray-400 mb-4">
          Search for an existing student to reuse their information, or create a new student profile.
        </p>
        
        {/* Search Method Selection */}
        <div className="grid grid-cols-4 gap-2 mb-4">
          {[
            { key: 'passport', label: 'Passport', icon: FileText },
            { key: 'email', label: 'Email', icon: User },
            { key: 'phone', label: 'Phone', icon: User },
            { key: 'new', label: 'New Student', icon: UserCheck },
          ].map((method) => (
            <button
              key={method.key}
              onClick={() => setFormData(prev => ({ 
                ...prev, 
                studentSearchMethod: method.key as any,
                studentSearch: method.key === 'new' ? '' : prev.studentSearch
              }))}
              className={`p-3 border rounded-lg text-sm font-medium transition-colors ${
                formData.studentSearchMethod === method.key
                  ? 'bg-blue-900/30 border-blue-700 text-blue-300'
                  : 'bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-800'
              }`}
            >
              <method.icon className="w-4 h-4 mx-auto mb-1" />
              {method.label}
            </button>
          ))}
        </div>

        {formData.studentSearchMethod !== 'new' && (
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              placeholder={`Enter ${formData.studentSearchMethod}...`}
              value={formData.studentSearch}
              onChange={(e) => setFormData(prev => ({ ...prev, studentSearch: e.target.value }))}
              className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
            <button
              onClick={handleSearch}
              disabled={isSearching || !formData.studentSearch.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Search className="w-4 h-4" />
              {isSearching ? 'Searching...' : 'Search'}
            </button>
          </div>
        )}

        {/* Search Results */}
        {searchResults.length > 0 && (
          <div className="bg-gray-800 rounded-lg p-4 mb-4">
            <h4 className="font-medium text-white mb-3">Found {searchResults.length} existing student(s):</h4>
            <div className="space-y-2">
              {searchResults.map((student) => (
                <div
                  key={student.id}
                  className="bg-gray-800 p-3 rounded-lg border cursor-pointer hover:bg-blue-900/30 hover:border-blue-700 transition-colors"
                  onClick={() => selectExistingStudent(student)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-white">{student.fullName}</p>
                      <p className="text-sm text-gray-400">{student.email} • {student.passportNumber}</p>
                      <p className="text-sm text-gray-400">{student.nationality}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-blue-600 font-medium">Click to select</p>
                      <p className="text-xs text-gray-400">{student.totalApplications} applications</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Create New Student Option */}
        {(formData.studentSearchMethod === 'new' || 
          (formData.studentSearch && searchResults.length === 0 && !isSearching)) && (
          <div className="bg-blue-900/30 border border-blue-700 rounded-lg p-4">
            <h4 className="font-medium text-blue-300 mb-2">Create New Student</h4>
            <p className="text-sm text-blue-300 mb-3">
              {formData.studentSearchMethod === 'new' 
                ? 'You\'ll create a new student profile in the next step.'
                : 'No existing student found. You can create a new student profile.'}
            </p>
            <button
              onClick={createNewStudent}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <User className="w-4 h-4" />
              Create New Student
            </button>
          </div>
        )}
      </div>
    </div>
  );

  const renderStudentDetailsStep = () => (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-4">
        <div className={`p-2 rounded-full ${formData.isReturningStudent ? 'bg-green-900/30' : 'bg-blue-100'}`}>
          {formData.isReturningStudent ? (
            <RotateCcw className="w-5 h-5 text-green-400" />
          ) : (
            <User className="w-5 h-5 text-blue-600" />
          )}
        </div>
        <div>
          <h3 className="text-lg font-semibold text-white">
            {formData.isReturningStudent ? 'Update Student Details' : 'New Student Information'}
          </h3>
          <p className="text-sm text-gray-400">
            {formData.isReturningStudent 
              ? 'Review and update the student information as needed'
              : 'Enter the student\'s personal and academic information'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Basic Information */}
        <div className="md:col-span-2">
          <h4 className="font-medium text-white mb-3">Basic Information</h4>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Full Name *</label>
          <input
            type="text"
            value={formData.fullName}
            onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter full name as per passport"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Email *</label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="student@email.com"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Phone</label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="+1-234-567-8900"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Nationality *</label>
          <select
            value={formData.nationality}
            onChange={(e) => setFormData(prev => ({ ...prev, nationality: e.target.value }))}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select nationality</option>
            <option value="Malaysia">Malaysia</option>
            <option value="Singapore">Singapore</option>
            <option value="Indonesia">Indonesia</option>
            <option value="Thailand">Thailand</option>
            <option value="Philippines">Philippines</option>
            <option value="Vietnam">Vietnam</option>
            <option value="Sudan">Sudan</option>
            <option value="Oman">Oman</option>
            <option value="UAE">UAE</option>
            <option value="Saudi Arabia">Saudi Arabia</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Passport Number *</label>
          <input
            type="text"
            value={formData.passportNumber}
            onChange={(e) => setFormData(prev => ({ ...prev, passportNumber: e.target.value.toUpperCase() }))}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="A1234567"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Date of Birth *</label>
          <input
            type="date"
            value={formData.dateOfBirth}
            onChange={(e) => setFormData(prev => ({ ...prev, dateOfBirth: e.target.value }))}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Gender</label>
          <select
            value={formData.gender}
            onChange={(e) => setFormData(prev => ({ ...prev, gender: e.target.value as any }))}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
        </div>

        {/* Academic Information */}
        <div className="md:col-span-2 mt-6">
          <h4 className="font-medium text-white mb-3">Academic Background</h4>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Highest Education</label>
          <select
            value={formData.highestEducation}
            onChange={(e) => setFormData(prev => ({ ...prev, highestEducation: e.target.value }))}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select highest education</option>
            <option value="High School">High School</option>
            <option value="Foundation">Foundation</option>
            <option value="Diploma">Diploma</option>
            <option value="Bachelor">Bachelor&apos;s Degree</option>
            <option value="Master">Master&apos;s Degree</option>
            <option value="PhD">PhD</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Graduation Year</label>
          <input
            type="number"
            value={formData.graduationYear}
            onChange={(e) => setFormData(prev => ({ ...prev, graduationYear: e.target.value ? parseInt(e.target.value) : '' }))}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="2023"
            min="1990"
            max={new Date().getFullYear()}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">English Proficiency Test</label>
          <select
            value={formData.englishProficiencyType}
            onChange={(e) => setFormData(prev => ({ ...prev, englishProficiencyType: e.target.value }))}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select test type</option>
            <option value="IELTS">IELTS</option>
            <option value="TOEFL">TOEFL</option>
            <option value="PTE">PTE</option>
            <option value="Duolingo">Duolingo</option>
            <option value="None">None yet</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Test Score</label>
          <input
            type="text"
            value={formData.englishProficiencyScore}
            onChange={(e) => setFormData(prev => ({ ...prev, englishProficiencyScore: e.target.value }))}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="e.g., 6.5, 90, 65"
          />
        </div>
      </div>
    </div>
  );

  const renderProgramSelectionStep = () => (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-purple-100 rounded-full">
          <GraduationCap className="w-5 h-5 text-purple-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-white">Program Selection</h3>
          <p className="text-sm text-gray-400">Enter the university and program details</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Program URL *</label>
          <input
            type="url"
            value={formData.programUrl}
            onChange={(e) => setFormData(prev => ({ ...prev, programUrl: e.target.value }))}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="https://university.edu/programs/computer-science"
          />
          <p className="text-xs text-gray-400 mt-1">Paste the official program page URL</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">University Name *</label>
            <input
              type="text"
              value={formData.universityName}
              onChange={(e) => setFormData(prev => ({ ...prev, universityName: e.target.value }))}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="University of Technology Malaysia"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Program Name *</label>
            <input
              type="text"
              value={formData.programName}
              onChange={(e) => setFormData(prev => ({ ...prev, programName: e.target.value }))}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Bachelor of Computer Science"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Program Level *</label>
            <select
              value={formData.programLevel}
              onChange={(e) => setFormData(prev => ({ ...prev, programLevel: e.target.value as any }))}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select program level</option>
              <option value="Foundation">Foundation</option>
              <option value="Diploma">Diploma</option>
              <option value="Bachelor">Bachelor</option>
              <option value="Master">Master</option>
              <option value="PhD">PhD</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Intended Intake *</label>
            <input
              type="date"
              value={formData.intendedIntake}
              onChange={(e) => setFormData(prev => ({ ...prev, intendedIntake: e.target.value }))}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Tuition Fee (USD)</label>
            <input
              type="number"
              value={formData.tuitionFee}
              onChange={(e) => setFormData(prev => ({ ...prev, tuitionFee: e.target.value ? parseFloat(e.target.value) : '' }))}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="25000"
              min="0"
              step="100"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Commission Rate (%)</label>
            <div className="relative">
              <input
                type="number"
                value={getPartnerCommissionRate()}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-gray-300 rounded-lg cursor-not-allowed"
                disabled
                readOnly
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                <span className="text-xs text-gray-400">
                  {currentPartner?.tier.toUpperCase()} TIER
                </span>
              </div>
            </div>
            <p className="text-xs text-gray-400 mt-1">
              Rate set by {currentPartner?.tier || 'bronze'} tier
            </p>
          </div>
        </div>

        {/* Commission Calculation Display */}
        {formData.tuitionFee && (
          <div className="bg-green-900/50 border border-green-700 rounded-lg p-4">
            <h4 className="font-medium text-green-200 mb-2">Estimated Commission</h4>
            <p className="text-2xl font-bold text-green-300">
              ${calculateEstimatedCommission(Number(formData.tuitionFee), getPartnerCommissionRate()).toLocaleString()}
            </p>
            <p className="text-sm text-green-400 mt-1">
              {getPartnerCommissionRate()}% of ${Number(formData.tuitionFee).toLocaleString()} tuition fee
            </p>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Priority</label>
          <select
            value={formData.priority}
            onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value as any }))}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="low">Low Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="high">High Priority</option>
            <option value="urgent">Urgent</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Additional Notes</label>
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            rows={3}
            placeholder="Any special requirements or notes about this application..."
          />
        </div>
      </div>
    </div>
  );

  const renderReviewStep = () => (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-green-900/30 rounded-full">
          <CheckCircle className="w-5 h-5 text-green-400" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-white">Review & Submit</h3>
          <p className="text-sm text-gray-400">Review all information before submitting the application</p>
        </div>
      </div>

      {/* Application Summary */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h4 className="font-medium text-white mb-4">Application Summary</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Student Information */}
          <div>
            <h5 className="font-medium text-gray-300 mb-2 flex items-center gap-2">
              <User className="w-4 h-4" />
              Student Information
              {formData.isReturningStudent && (
                <span className="text-xs bg-green-900/30 text-green-300 px-2 py-1 rounded-full">
                  Returning Student
                </span>
              )}
            </h5>
            <div className="space-y-1 text-sm">
              <p><span className="text-gray-400">Name:</span> {formData.fullName}</p>
              <p><span className="text-gray-400">Email:</span> {formData.email}</p>
              <p><span className="text-gray-400">Nationality:</span> {formData.nationality}</p>
              <p><span className="text-gray-400">Passport:</span> {formData.passportNumber}</p>
              <p><span className="text-gray-400">Date of Birth:</span> {formData.dateOfBirth}</p>
              {formData.englishProficiencyType && (
                <p><span className="text-gray-400">English:</span> {formData.englishProficiencyType} {formData.englishProficiencyScore}</p>
              )}
            </div>
          </div>

          {/* Program Information */}
          <div>
            <h5 className="font-medium text-gray-300 mb-2 flex items-center gap-2">
              <GraduationCap className="w-4 h-4" />
              Program Information
            </h5>
            <div className="space-y-1 text-sm">
              <p><span className="text-gray-400">University:</span> {formData.universityName}</p>
              <p><span className="text-gray-400">Program:</span> {formData.programName}</p>
              <p><span className="text-gray-400">Level:</span> {formData.programLevel}</p>
              <p><span className="text-gray-400">Intake:</span> {formData.intendedIntake}</p>
              <p><span className="text-gray-400">Priority:</span> {formData.priority}</p>
              {formData.tuitionFee && (
                <div className="bg-green-900/30 border border-green-700 rounded p-2 mt-2">
                  <p className="font-medium text-green-300">
                    Estimated Commission: ${calculateEstimatedCommission(Number(formData.tuitionFee), getPartnerCommissionRate()).toLocaleString()}
                  </p>
                  <p className="text-xs text-green-400">
                    {getPartnerCommissionRate()}% of ${Number(formData.tuitionFee).toLocaleString()} ({currentPartner?.tier || 'bronze'} tier)
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {formData.notes && (
          <div className="mt-4">
            <h5 className="font-medium text-gray-300 mb-2">Additional Notes</h5>
            <p className="text-sm text-gray-400 bg-gray-800 p-3 rounded border">{formData.notes}</p>
          </div>
        )}
      </div>

      {/* Submission Warning */}
      <div className="bg-blue-900/30 border border-blue-700 rounded-lg p-4">
        <h4 className="font-medium text-blue-300 mb-2">Ready to Submit</h4>
        <p className="text-sm text-blue-300">
          Once you submit this application, it will be sent to the admin for review. 
          You can track its progress in the applications list.
        </p>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        {/* Backdrop */}
        <div className="fixed inset-0 bg-gray-900/80 backdrop-blur-sm" onClick={onCancel} />
        
        {/* Modal */}
        <div className="relative w-full max-w-4xl bg-gray-900 rounded-2xl shadow-2xl shadow-gray-900/50 border border-gray-700 max-h-[95vh] overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600/90 to-purple-600/90 text-white p-6 border-b border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">New Application</h2>
                <p className="text-blue-100 mt-1">Create a new student application</p>
              </div>
              <div className="flex items-center gap-3">
                {/* Test Data Button */}
                {(currentStep === 2 || currentStep === 3) && (
                  <button
                    onClick={() => fillTestData(currentStep)}
                    className="flex items-center px-3 py-1.5 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors text-sm font-medium"
                    title="Fill with realistic Arabic student test data"
                  >
                    <Sparkles className="w-4 h-4 mr-1.5" />
                    Fill Test Data
                  </button>
                )}
                <button
                  onClick={onCancel}
                  className="p-2 text-gray-400 hover:text-white hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Progress Steps */}
          <div className="flex justify-center gap-4 mt-6">
            {STEPS.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`flex items-center gap-2 ${
                  currentStep === step.id 
                    ? 'text-white' 
                    : currentStep > step.id 
                      ? 'text-green-200' 
                      : 'text-white/60'
                }`}>
                  <div className={`p-2 rounded-full ${
                    currentStep === step.id 
                      ? 'bg-gray-800/20 ring-2 ring-white' 
                      : currentStep > step.id 
                        ? 'bg-green-500' 
                        : 'bg-gray-800/10'
                  }`}>
                    {currentStep > step.id ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : (
                      <step.icon className="w-5 h-5" />
                    )}
                  </div>
                  <div className="hidden sm:block">
                    <p className="text-sm font-medium">{step.title}</p>
                    <p className="text-xs opacity-80">{step.description}</p>
                  </div>
                </div>
                {index < STEPS.length - 1 && (
                  <div className={`w-8 h-0.5 mx-4 ${
                    currentStep > step.id ? 'bg-green-200' : 'bg-gray-800/20'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(95vh-280px)] bg-gray-900">
          {/* Error Message */}
          {errorMessage && (
            <div className="mb-6 p-4 bg-red-900/50 border border-red-700 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0">
                  <XCircle className="w-5 h-5 text-red-400" />
                </div>
                <div>
                  <h3 className="font-medium text-red-200">Error</h3>
                  <p className="text-red-300 mt-1">{errorMessage}</p>
                </div>
                <button
                  onClick={() => setErrorMessage(null)}
                  className="flex-shrink-0 ml-auto text-red-400 hover:text-red-300"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
          
          {renderStep()}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-700 bg-gray-800 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-gray-400">
              {isSaving && (
                <>
                  <Save className="w-4 h-4 animate-pulse" />
                  Auto-saving...
                </>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={prevStep}
                disabled={currentStep === 1}
                className="px-4 py-2 text-gray-300 border border-gray-600 bg-gray-700 rounded-lg hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Previous
              </button>
              
              {currentStep < STEPS.length ? (
                <button
                  onClick={nextStep}
                  disabled={!validateStep(currentStep)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
                >
                  Next
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting || !validateStep(4)}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Submit Application
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewApplicationFlow;