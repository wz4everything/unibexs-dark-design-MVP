/**
 * Stage 4 Configuration: Arrival Management
 * 
 * This file contains ALL Stage 4 workflow logic based on the v6 database schema.
 * Handles student arrival coordination, verification, and enrollment confirmation.
 * 
 * Based on v6 Database Schema Stage 4 statuses:
 * - arrival_date_planned (System/Admin can update)
 * - travel_documents_verified (Admin can update)
 * - arrival_confirmed (Partner can update)
 * - arrival_verified (Admin can update)
 * - enrollment_confirmed (Admin can update - Terminal success)
 * - arrival_delayed (Partner can update)
 */

import { StageConfig } from './types';

const STAGE_4_CONFIG: StageConfig = {
  stageName: "Arrival Management",
  stageDescription: "Student arrival coordination and verification",
  stageIcon: "✈️",
  stageColor: "teal",
  estimatedDuration: "2-4 weeks",
  
  statuses: {
    // ===== ARRIVAL_DATE_PLANNED =====
    arrival_date_planned: {
      // Authority matrix
      authority: {
        setBy: 'System',
        setTrigger: 'After visa_issued in Stage 3',
        adminCanUpdate: true,
        adminTransitions: ['travel_documents_verified', 'arrival_delayed'],
        partnerCanUpdate: true,
        partnerTransitions: ['travel_documents_verified', 'arrival_delayed'],
        partnerWaitsFor: 'WAITS to coordinate arrival details',
        systemCanUpdate: false,
        systemTransitions: []
      },

      // Rules configuration
      rules: {
        isDocumentUploadStatus: false,
        isDocumentReviewStatus: false,
        isPaymentStatus: false,
        isTerminalStatus: false,
        requiresUrgentAction: true,
        showsInDashboard: true,
        allowsBulkUpdate: false,
        expandsDocumentSection: false,
        expandsTimelineSection: true,
        blocksNavigation: false,
        autoRefreshRequired: false,
        requiresConfirmation: false,
        requiresDocuments: false,
        partialSubmission: false
      },

      // Display configuration for both roles
      display: {
        admin: {
          allText: {
            statusCard: 'Partner is coordinating student arrival date and travel plans',
            primaryMessage: 'Partner is working with student on arrival planning',
            secondaryMessage: 'Student has visa - Partner coordinating arrival logistics',
            dashboardTitle: 'Arrival Planning',
            dashboardSubtitle: 'Partner Coordinating',
            listViewStatus: 'Partner Coordinating',
            heroCardTitle: 'Arrival Coordination in Progress',
            heroCardSubtitle: 'Partner Action Required',
            heroCardDescription: 'Partner is working with student to coordinate arrival logistics',
            timelineTitle: 'Partner Coordinating Arrival',
            timelineDescription: 'Partner working with student on arrival date and logistics',
            actionButtonText: 'View Progress',
            actionButtonSecondary: 'Contact Partner',
            successMessage: 'Arrival date set successfully',
            errorMessage: 'Failed to set arrival date',
            warningMessage: 'Coordinate arrival before semester starts',
            infoMessage: 'Work with student to plan arrival logistics',
            emptyStateTitle: 'Plan Arrival',
            emptyStateDescription: 'Student needs arrival coordination',
            loadingMessage: 'Setting arrival plans...',
            nextStepsTitle: 'Next Steps',
            nextSteps: ['Set arrival date', 'Verify travel documents', 'Arrange accommodation'],
            estimatedTime: '3-5 business days',
            urgencyText: 'High priority - semester approaching'
          },
          styling: {
            statusColor: 'green',
            statusIcon: '📅',
            urgencyLevel: 'high',
            badgeVariant: 'info',
            progressStep: 1,
            progressTotal: 5
          }
        },
        partner: {
          allText: {
            statusCard: 'Work with student to plan arrival date and logistics',
            primaryMessage: 'Coordinate student arrival date and travel',
            secondaryMessage: 'Student has visa - plan arrival and accommodation',
            dashboardTitle: 'Plan Arrival',
            dashboardSubtitle: 'Action Required',
            listViewStatus: 'Planning Arrival',
            heroCardTitle: 'Plan Student Arrival',
            heroCardSubtitle: 'Action Required',
            heroCardDescription: 'Coordinate arrival date and travel logistics',
            timelineTitle: 'Arrival Planning',
            timelineDescription: 'Work with student to coordinate arrival',
            actionButtonText: 'Set Arrival Date',
            actionButtonSecondary: 'Contact Student',
            successMessage: 'Arrival plans updated successfully',
            errorMessage: 'Failed to update arrival plans',
            warningMessage: 'Plan arrival well before semester starts',
            infoMessage: 'Coordinate with student on travel and accommodation',
            emptyStateTitle: 'Coordinate Arrival',
            emptyStateDescription: 'Student needs help planning arrival',
            loadingMessage: 'Updating arrival plans...',
            nextStepsTitle: 'Required Actions',
            nextSteps: ['Discuss arrival date with student', 'Verify travel documents', 'Arrange pickup/accommodation'],
            estimatedTime: 'Within 1 week',
            urgencyText: 'Action required - coordinate arrival'
          },
          styling: {
            statusColor: 'green',
            statusIcon: '📅',
            urgencyLevel: 'high',
            badgeVariant: 'info',
            progressStep: 1,
            progressTotal: 5
          }
        }
      },

      // Actions configuration
      actions: {
        admin: [{
          id: 'view_progress',
          label: 'View Progress',
          type: 'secondary',
          icon: 'Eye',
          behavior: 'showModal',
          target: 'ProgressViewModal',
          requiresConfirmation: false
        }, {
          id: 'contact_partner',
          label: 'Contact Partner',
          type: 'secondary',
          icon: 'Phone',
          behavior: 'showModal',
          target: 'ContactPartnerModal',
          requiresConfirmation: false
        }],
        partner: [{
          id: 'coordinate_arrival',
          label: 'Coordinate Arrival',
          type: 'primary',
          icon: 'Users',
          behavior: 'showModal',
          target: 'ArrivalCoordinationModal',
          requiresConfirmation: false
        }, {
          id: 'prepare_documents',
          label: 'Prepare Documents',
          type: 'secondary',
          icon: 'FileText',
          behavior: 'showModal',
          target: 'DocumentPreparationModal',
          requiresConfirmation: false
        }]
      },

      // Behavior configuration
      behavior: {
        onEntry: ['expandTimelineSection', 'startArrivalPlanning'],
        onExit: ['finalizeArrivalPlans'],
        onAction: 'showArrivalPlanning',
        modalToShow: 'ArrivalPlanningModal',
        redirectAfterAction: false,
        waitingForActor: 'Partner',
        notificationTriggers: ['arrivalPlanning', 'coordinationRequired'],
        auditEvents: ['arrival.planning_started', 'arrival.coordination_initiated']
      },

      // Documents configuration
      documents: {
        required: ['travel_itinerary'],
        optional: ['accommodation_booking', 'travel_insurance'],
        autoGenerate: ['arrival_checklist', 'coordination_plan'],
        hideUpload: false,
        reviewRequired: true,
        bulkUpload: false,
        allowedTypes: ['pdf', 'jpg', 'png'],
        maxSize: 10,
        downloadable: true
      },

      // Validation configuration
      validation: {
        onEntry: ['visa_documents_available'],
        onExit: ['arrival_date_confirmed'],
        requiredFields: ['planned_arrival_date', 'arrival_location'],
        businessRules: ['arrival_date_valid', 'semester_start_compatible'],
        dependencies: [],
        blockers: []
      },

      version: "1.0.0",
      lastUpdated: "2025-08-31",
      description: "Planning student arrival date and logistics coordination"
    },

    // ===== TRAVEL_DOCUMENTS_VERIFIED =====
    travel_documents_verified: {
      // Authority matrix
      authority: {
        setBy: 'Admin',
        setTrigger: 'Admin verifies student travel documents',
        adminCanUpdate: true,
        adminTransitions: ['arrival_confirmed', 'arrival_delayed'],
        partnerCanUpdate: false,
        partnerTransitions: [],
        partnerWaitsFor: 'WAITS for student to arrive',
        systemCanUpdate: false,
        systemTransitions: []
      },

      // Rules configuration
      rules: {
        isDocumentUploadStatus: false,
        isDocumentReviewStatus: false,
        isPaymentStatus: false,
        isTerminalStatus: false,
        requiresUrgentAction: false,
        showsInDashboard: true,
        allowsBulkUpdate: false,
        expandsDocumentSection: false,
        expandsTimelineSection: true,
        blocksNavigation: false,
        autoRefreshRequired: false,
        requiresConfirmation: false,
        requiresDocuments: false,
        partialSubmission: false
      },

      // Display configuration
      display: {
        admin: {
          allText: {
            statusCard: 'Travel documents verified - awaiting student arrival',
            primaryMessage: 'Documents verified - monitor arrival status',
            secondaryMessage: 'Travel documents verified - student should arrive soon',
            dashboardTitle: 'Documents Verified',
            dashboardSubtitle: 'Awaiting Arrival',
            listViewStatus: 'Awaiting Arrival',
            heroCardTitle: 'Travel Documents Verified',
            heroCardSubtitle: 'Awaiting Arrival',
            heroCardDescription: 'Documents verified - student ready to travel',
            timelineTitle: 'Documents Verified',
            timelineDescription: 'Travel documents verified and approved',
            actionButtonText: 'Check Arrival Status',
            actionButtonSecondary: 'Contact Student',
            successMessage: 'Arrival status updated',
            errorMessage: 'Failed to check arrival status',
            warningMessage: 'Monitor student arrival closely',
            infoMessage: 'Student should arrive as planned',
            emptyStateTitle: 'Awaiting Arrival',
            emptyStateDescription: 'Student has verified documents and should arrive',
            loadingMessage: 'Checking arrival status...',
            nextStepsTitle: 'Next Steps',
            nextSteps: ['Monitor arrival status', 'Be ready for arrival confirmation', 'Prepare verification process'],
            estimatedTime: 'Based on planned arrival date',
            urgencyText: 'Monitor arrival timeline'
          },
          styling: {
            statusColor: 'green',
            statusIcon: '✅',
            urgencyLevel: 'medium',
            badgeVariant: 'success',
            progressStep: 2,
            progressTotal: 5
          }
        },
        partner: {
          allText: {
            statusCard: 'Travel documents verified - student ready to travel',
            primaryMessage: 'Documents approved - student can travel',
            secondaryMessage: 'All travel documents verified and approved',
            dashboardTitle: 'Ready to Travel',
            dashboardSubtitle: 'Documents Approved',
            listViewStatus: 'Ready to Travel',
            heroCardTitle: 'Ready to Travel',
            heroCardSubtitle: 'Documents Verified',
            heroCardDescription: 'All travel documents verified - student cleared to travel',
            timelineTitle: 'Travel Approved',
            timelineDescription: 'Travel documents verified and approved',
            actionButtonText: 'Confirm Departure',
            actionButtonSecondary: 'Track Arrival',
            successMessage: 'Departure confirmed',
            errorMessage: 'Error confirming departure',
            warningMessage: 'Ensure student travels as planned',
            infoMessage: 'Student cleared to travel - monitor arrival',
            emptyStateTitle: 'Ready to Travel',
            emptyStateDescription: 'Student can now travel to destination',
            loadingMessage: 'Confirming departure...',
            nextStepsTitle: 'What\'s Next',
            nextSteps: ['Student travels as planned', 'Confirm arrival upon landing', 'Assist with any arrival issues'],
            estimatedTime: 'Based on travel schedule',
            urgencyText: 'Monitor travel and arrival'
          },
          styling: {
            statusColor: 'green',
            statusIcon: '✅',
            urgencyLevel: 'medium',
            badgeVariant: 'success',
            progressStep: 2,
            progressTotal: 5
          }
        }
      },

      // Actions configuration
      actions: {
        admin: [{
          id: 'verify_travel_docs',
          label: 'Verify Travel Documents',
          type: 'primary',
          icon: 'CheckCircle',
          behavior: 'showModal',
          target: 'DocumentVerificationModal',
          requiresConfirmation: false
        }, {
          id: 'approve_travel',
          label: 'Approve Travel',
          type: 'success',
          icon: 'Plane',
          behavior: 'showModal',
          target: 'TravelApprovalModal',
          requiresConfirmation: true,
          confirmationMessage: 'Approve student travel with verified documents?'
        }],
        partner: [{
          id: 'view_verification_status',
          label: 'View Verification Status',
          type: 'secondary',
          icon: 'Eye',
          behavior: 'showModal',
          target: 'VerificationStatusModal',
          requiresConfirmation: false
        }, {
          id: 'confirm_travel_readiness',
          label: 'Confirm Travel Readiness',
          type: 'primary',
          icon: 'CheckSquare',
          behavior: 'showModal',
          target: 'TravelReadinessModal',
          requiresConfirmation: false
        }]
      },

      // Behavior configuration
      behavior: {
        onEntry: ['expandDocumentSection', 'startDocumentVerification'],
        onExit: ['finalizeDocumentVerification'],
        onAction: 'showVerificationModal',
        modalToShow: 'DocumentVerificationModal',
        redirectAfterAction: false,
        waitingForActor: 'Admin',
        notificationTriggers: ['documentsVerified', 'travelApproved'],
        auditEvents: ['documents.travel_verified', 'travel.approved']
      },

      // Documents configuration
      documents: {
        required: ['passport_copy', 'visa_documents', 'travel_insurance'],
        optional: ['flight_booking', 'accommodation_proof'],
        autoGenerate: ['verification_report', 'travel_clearance'],
        hideUpload: false,
        reviewRequired: true,
        bulkUpload: false,
        allowedTypes: ['pdf', 'jpg', 'png'],
        maxSize: 10,
        downloadable: true
      },

      // Validation configuration
      validation: {
        onEntry: ['travel_documents_submitted'],
        onExit: ['travel_documents_approved'],
        requiredFields: ['passport_validity', 'visa_validity', 'insurance_coverage'],
        businessRules: ['documents_valid', 'travel_authorized'],
        dependencies: [],
        blockers: []
      },

      version: "1.0.0",
      lastUpdated: "2025-08-31",
      description: "Verifying travel documents and approving student travel"
    },

    // ===== ARRIVAL_CONFIRMED =====
    arrival_confirmed: {
      // Authority matrix
      authority: {
        setBy: 'Partner',
        setTrigger: 'Partner confirms student has arrived',
        adminCanUpdate: true,
        adminTransitions: ['arrival_verified', 'arrival_delayed'],
        partnerCanUpdate: false,
        partnerTransitions: [],
        partnerWaitsFor: 'WAITS for admin to verify arrival',
        systemCanUpdate: false,
        systemTransitions: []
      },

      // Rules configuration
      rules: {
        isDocumentUploadStatus: false,
        isDocumentReviewStatus: false,
        isPaymentStatus: false,
        isTerminalStatus: false,
        requiresUrgentAction: true,
        showsInDashboard: true,
        allowsBulkUpdate: false,
        expandsDocumentSection: false,
        expandsTimelineSection: true,
        blocksNavigation: false,
        autoRefreshRequired: false,
        requiresConfirmation: false,
        requiresDocuments: false,
        partialSubmission: false
      },

      // Display configuration
      display: {
        admin: {
          allText: {
            statusCard: 'Student arrival confirmed - verify and process enrollment',
            primaryMessage: 'Arrival confirmed - verify student and enroll',
            secondaryMessage: 'Partner confirmed arrival - verify and complete enrollment',
            dashboardTitle: 'Arrival Confirmed',
            dashboardSubtitle: 'Verify & Enroll',
            listViewStatus: 'Verify Arrival',
            heroCardTitle: 'Student Arrived!',
            heroCardSubtitle: 'Verify & Enroll',
            heroCardDescription: 'Student arrival confirmed - complete verification',
            timelineTitle: 'Arrival Confirmed',
            timelineDescription: 'Partner confirmed student has arrived safely',
            actionButtonText: 'Verify Arrival',
            actionButtonSecondary: 'Process Enrollment',
            successMessage: 'Arrival verified successfully',
            errorMessage: 'Failed to verify arrival',
            warningMessage: 'Complete verification promptly',
            infoMessage: 'Student arrived - ready for enrollment verification',
            emptyStateTitle: 'Ready to Verify',
            emptyStateDescription: 'Student arrived and ready for verification',
            loadingMessage: 'Verifying arrival...',
            nextStepsTitle: 'Next Steps',
            nextSteps: ['Verify student arrival', 'Check enrollment documents', 'Confirm enrollment'],
            estimatedTime: '1-2 business days',
            urgencyText: 'High priority - complete verification'
          },
          styling: {
            statusColor: 'blue',
            statusIcon: '🛬',
            urgencyLevel: 'high',
            badgeVariant: 'info',
            progressStep: 3,
            progressTotal: 5
          }
        },
        partner: {
          allText: {
            statusCard: 'Student arrival confirmed - awaiting admin verification',
            primaryMessage: 'Arrival confirmed - admin processing verification',
            secondaryMessage: 'Student arrived safely - admin verifying enrollment',
            dashboardTitle: 'Arrival Confirmed',
            dashboardSubtitle: 'Being Verified',
            listViewStatus: 'Being Verified',
            heroCardTitle: 'Student Arrived!',
            heroCardSubtitle: 'Being Verified',
            heroCardDescription: 'Student arrived safely - verification in progress',
            timelineTitle: 'Arrival Confirmed',
            timelineDescription: 'Student arrival confirmed successfully',
            actionButtonText: 'View Status',
            actionButtonSecondary: 'Track Progress',
            successMessage: 'Status updated successfully',
            errorMessage: 'Error updating status',
            warningMessage: 'Verification in progress',
            infoMessage: 'Admin is verifying arrival and processing enrollment',
            emptyStateTitle: 'Arrival Confirmed',
            emptyStateDescription: 'Admin is verifying arrival details',
            loadingMessage: 'Checking verification status...',
            nextStepsTitle: 'What\'s Next',
            nextSteps: ['Admin verifies arrival', 'Enrollment confirmed', 'Commission processing begins'],
            estimatedTime: '1-2 business days',
            urgencyText: 'Verification in progress'
          },
          styling: {
            statusColor: 'blue',
            statusIcon: '🛬',
            urgencyLevel: 'medium',
            badgeVariant: 'info',
            progressStep: 3,
            progressTotal: 5
          }
        }
      },

      // Actions configuration
      actions: {
        admin: [{
          id: 'verify_arrival',
          label: 'Verify Arrival',
          type: 'primary',
          icon: 'CheckCircle',
          behavior: 'showModal',
          target: 'ArrivalVerificationModal',
          requiresConfirmation: false
        }, {
          id: 'process_enrollment',
          label: 'Process Enrollment',
          type: 'secondary',
          icon: 'UserCheck',
          behavior: 'showModal',
          target: 'EnrollmentModal',
          requiresConfirmation: true
        }],
        partner: [{
          id: 'view_arrival_status',
          label: 'View Arrival Status',
          type: 'primary',
          icon: 'Eye',
          behavior: 'showModal',
          target: 'ArrivalStatusModal',
          requiresConfirmation: false
        }, {
          id: 'track_progress',
          label: 'Track Progress',
          type: 'secondary',
          icon: 'MapPin',
          behavior: 'showModal',
          target: 'ProgressTrackingModal',
          requiresConfirmation: false
        }]
      },

      // Behavior configuration
      behavior: {
        onEntry: ['expandTimelineSection', 'highlightVerificationNeeded', 'prepareEnrollment'],
        onExit: ['initializeEnrollmentProcess'],
        onAction: 'showVerificationModal',
        modalToShow: 'ArrivalVerificationModal',
        redirectAfterAction: false,
        waitingForActor: 'Admin',
        notificationTriggers: ['arrivalConfirmed', 'verificationRequired'],
        auditEvents: ['arrival.confirmed', 'enrollment.verification_started']
      },

      // Documents configuration
      documents: {
        required: ['arrival_confirmation', 'enrollment_documents'],
        optional: ['arrival_photos', 'accommodation_proof'],
        autoGenerate: ['enrollment_checklist'],
        hideUpload: false,
        reviewRequired: true,
        bulkUpload: false,
        allowedTypes: ['pdf', 'jpg', 'png'],
        maxSize: 10,
        downloadable: true
      },

      // Validation configuration
      validation: {
        onEntry: ['arrival_confirmed_by_partner'],
        onExit: ['arrival_verified_by_admin'],
        requiredFields: ['arrival_date', 'arrival_location', 'enrollment_status'],
        businessRules: ['arrival_date_valid', 'enrollment_documents_complete'],
        dependencies: ['travel_documents_verified'],
        blockers: []
      },

      version: "1.0.0",
      lastUpdated: "2025-08-31",
      description: "Student arrival confirmed by partner - admin verification and enrollment processing required"
    },

    // ===== ARRIVAL_DELAYED =====
    arrival_delayed: {
      // Authority matrix
      authority: {
        setBy: 'Partner',
        setTrigger: 'Partner reports arrival delay or issues',
        adminCanUpdate: true,
        adminTransitions: ['travel_documents_verified', 'arrival_confirmed'],
        partnerCanUpdate: true,
        partnerTransitions: ['travel_documents_verified', 'arrival_confirmed'],
        partnerWaitsFor: 'WAITS to resolve delay and confirm new arrival',
        systemCanUpdate: false,
        systemTransitions: []
      },

      // Rules configuration
      rules: {
        isDocumentUploadStatus: false,
        isDocumentReviewStatus: false,
        isPaymentStatus: false,
        isTerminalStatus: false,
        requiresUrgentAction: true,
        showsInDashboard: true,
        allowsBulkUpdate: false,
        expandsDocumentSection: false,
        expandsTimelineSection: true,
        blocksNavigation: false,
        autoRefreshRequired: false,
        requiresConfirmation: false,
        requiresDocuments: false,
        partialSubmission: false
      },

      // Display configuration
      display: {
        admin: {
          allText: {
            statusCard: 'Student arrival delayed - assist with resolution',
            primaryMessage: 'Arrival delayed - provide support and assistance',
            secondaryMessage: 'Student arrival delayed - work on resolution',
            dashboardTitle: 'Arrival Delayed',
            dashboardSubtitle: 'Assistance Needed',
            listViewStatus: 'Arrival Delayed',
            heroCardTitle: 'Arrival Delayed',
            heroCardSubtitle: 'Assistance Required',
            heroCardDescription: 'Student arrival delayed - assistance needed',
            timelineTitle: 'Arrival Delayed',
            timelineDescription: 'Student arrival delayed - working on resolution',
            actionButtonText: 'Assist with Resolution',
            actionButtonSecondary: 'Contact Student',
            successMessage: 'Assistance provided successfully',
            errorMessage: 'Failed to provide assistance',
            warningMessage: 'Urgent assistance needed for arrival delay',
            infoMessage: 'Work with partner to resolve arrival issues',
            emptyStateTitle: 'Resolving Delay',
            emptyStateDescription: 'Working to resolve arrival delay',
            loadingMessage: 'Providing assistance...',
            nextStepsTitle: 'Resolution Steps',
            nextSteps: ['Identify delay cause', 'Provide necessary assistance', 'Update arrival plans'],
            estimatedTime: 'Variable - depends on issue',
            urgencyText: 'High priority - resolve delay'
          },
          styling: {
            statusColor: 'orange',
            statusIcon: '⚠️',
            urgencyLevel: 'high',
            badgeVariant: 'warning',
            progressStep: 2,
            progressTotal: 5
          }
        },
        partner: {
          allText: {
            statusCard: 'Student arrival delayed - work on resolution',
            primaryMessage: 'Arrival delayed - coordinate new travel plans',
            secondaryMessage: 'Student arrival delayed - update plans and coordinate',
            dashboardTitle: 'Arrival Delayed',
            dashboardSubtitle: 'Action Required',
            listViewStatus: 'Arrival Delayed',
            heroCardTitle: 'Arrival Delayed',
            heroCardSubtitle: 'Action Required',
            heroCardDescription: 'Student arrival delayed - coordinate resolution',
            timelineTitle: 'Arrival Delayed',
            timelineDescription: 'Student arrival delayed - working on resolution',
            actionButtonText: 'Update Arrival Plans',
            actionButtonSecondary: 'Contact Student',
            successMessage: 'Arrival plans updated',
            errorMessage: 'Failed to update arrival plans',
            warningMessage: 'Resolve delay urgently to avoid issues',
            infoMessage: 'Work with student to resolve travel issues',
            emptyStateTitle: 'Resolving Delay',
            emptyStateDescription: 'Working with student to resolve delay',
            loadingMessage: 'Updating arrival plans...',
            nextStepsTitle: 'Required Actions',
            nextSteps: ['Contact student about delay', 'Arrange new travel plans', 'Coordinate with admin'],
            estimatedTime: 'Resolve as soon as possible',
            urgencyText: 'Urgent action required'
          },
          styling: {
            statusColor: 'orange',
            statusIcon: '⚠️',
            urgencyLevel: 'high',
            badgeVariant: 'warning',
            progressStep: 2,
            progressTotal: 5
          }
        }
      },

      // Actions configuration
      actions: {
        admin: [{
          id: 'assist_with_delay',
          label: 'Assist with Resolution',
          type: 'primary',
          icon: 'HelpCircle',
          behavior: 'showModal',
          target: 'DelayAssistanceModal',
          requiresConfirmation: false
        }, {
          id: 'contact_student_delay',
          label: 'Contact Student',
          type: 'secondary',
          icon: 'Phone',
          behavior: 'showModal',
          target: 'ContactStudentModal',
          requiresConfirmation: false
        }],
        partner: [{
          id: 'update_arrival_plans',
          label: 'Update Arrival Plans',
          type: 'primary',
          icon: 'Calendar',
          behavior: 'showModal',
          target: 'ArrivalPlanUpdateModal',
          requiresConfirmation: false
        }, {
          id: 'report_delay_status',
          label: 'Report Delay Status',
          type: 'secondary',
          icon: 'MessageSquare',
          behavior: 'showModal',
          target: 'DelayStatusModal',
          requiresConfirmation: false
        }]
      },

      // Behavior configuration
      behavior: {
        onEntry: ['expandTimelineSection', 'highlightDelayResolution'],
        onExit: ['finalizeDelayResolution'],
        onAction: 'showDelayResolution',
        modalToShow: 'DelayResolutionModal',
        redirectAfterAction: false,
        waitingForActor: 'Partner',
        notificationTriggers: ['arrivalDelayed', 'resolutionRequired'],
        auditEvents: ['arrival.delayed', 'delay.resolution_initiated']
      },

      // Documents configuration
      documents: {
        required: ['delay_explanation'],
        optional: ['new_travel_plans', 'delay_documentation'],
        autoGenerate: ['delay_report', 'resolution_plan'],
        hideUpload: false,
        reviewRequired: true,
        bulkUpload: false,
        allowedTypes: ['pdf', 'jpg', 'png'],
        maxSize: 10,
        downloadable: true
      },

      // Validation configuration
      validation: {
        onEntry: ['delay_reason_documented'],
        onExit: ['delay_resolved'],
        requiredFields: ['delay_reason', 'new_arrival_date'],
        businessRules: ['delay_justified', 'new_date_valid'],
        dependencies: [],
        blockers: []
      },

      version: "1.0.0",
      lastUpdated: "2025-08-31",
      description: "Student arrival delayed - coordination and resolution required"
    },

    // ===== ARRIVAL_VERIFIED =====
    arrival_verified: {
      // Authority matrix
      authority: {
        setBy: 'Admin',
        setTrigger: 'Admin verifies student arrival and documents',
        adminCanUpdate: true,
        adminTransitions: ['enrollment_confirmed'],
        partnerCanUpdate: false,
        partnerTransitions: [],
        partnerWaitsFor: 'WAITS for enrollment confirmation',
        systemCanUpdate: false,
        systemTransitions: []
      },

      // Rules configuration
      rules: {
        isDocumentUploadStatus: false,
        isDocumentReviewStatus: false,
        isPaymentStatus: false,
        isTerminalStatus: false,
        requiresUrgentAction: true,
        showsInDashboard: true,
        allowsBulkUpdate: false,
        expandsDocumentSection: false,
        expandsTimelineSection: true,
        blocksNavigation: false,
        autoRefreshRequired: false,
        requiresConfirmation: false,
        requiresDocuments: false,
        partialSubmission: false
      },

      // Display configuration
      display: {
        admin: {
          allText: {
            statusCard: 'Arrival verified - confirm enrollment to complete Stage 4',
            primaryMessage: 'Arrival verified - confirm student enrollment',
            secondaryMessage: 'Student arrival verified - confirm enrollment completion',
            dashboardTitle: 'Arrival Verified',
            dashboardSubtitle: 'Confirm Enrollment',
            listViewStatus: 'Confirm Enrollment',
            heroCardTitle: 'Arrival Verified',
            heroCardSubtitle: 'Confirm Enrollment',
            heroCardDescription: 'Student arrival verified - ready for enrollment confirmation',
            timelineTitle: 'Arrival Verified',
            timelineDescription: 'Student arrival successfully verified',
            actionButtonText: 'Confirm Enrollment',
            actionButtonSecondary: 'View Verification',
            successMessage: 'Enrollment confirmed successfully',
            errorMessage: 'Failed to confirm enrollment',
            warningMessage: 'Complete enrollment confirmation promptly',
            infoMessage: 'Student verified and ready for enrollment confirmation',
            emptyStateTitle: 'Ready for Enrollment',
            emptyStateDescription: 'Student verified and ready for enrollment',
            loadingMessage: 'Confirming enrollment...',
            nextStepsTitle: 'Final Steps',
            nextSteps: ['Confirm enrollment completion', 'Move to Stage 5', 'Begin commission processing'],
            estimatedTime: '1 business day',
            urgencyText: 'High priority - complete enrollment'
          },
          styling: {
            statusColor: 'green',
            statusIcon: '✅',
            urgencyLevel: 'high',
            badgeVariant: 'success',
            progressStep: 4,
            progressTotal: 5
          }
        },
        partner: {
          allText: {
            statusCard: 'Arrival verified - enrollment confirmation in progress',
            primaryMessage: 'Arrival verified - enrollment being confirmed',
            secondaryMessage: 'Student arrival verified - enrollment confirmation in progress',
            dashboardTitle: 'Arrival Verified',
            dashboardSubtitle: 'Enrollment Pending',
            listViewStatus: 'Enrollment Pending',
            heroCardTitle: 'Arrival Verified!',
            heroCardSubtitle: 'Enrollment Pending',
            heroCardDescription: 'Student arrival verified - enrollment being confirmed',
            timelineTitle: 'Arrival Verified',
            timelineDescription: 'Student arrival successfully verified',
            actionButtonText: 'Check Status',
            actionButtonSecondary: 'View Progress',
            successMessage: 'Status checked successfully',
            errorMessage: 'Error checking status',
            warningMessage: 'Enrollment confirmation in progress',
            infoMessage: 'Admin is confirming enrollment completion',
            emptyStateTitle: 'Enrollment Pending',
            emptyStateDescription: 'Admin is confirming enrollment details',
            loadingMessage: 'Checking enrollment status...',
            nextStepsTitle: 'Almost Complete',
            nextSteps: ['Admin confirms enrollment', 'Stage 4 completes', 'Commission processing begins'],
            estimatedTime: '1 business day',
            urgencyText: 'Final verification in progress'
          },
          styling: {
            statusColor: 'green',
            statusIcon: '✅',
            urgencyLevel: 'medium',
            badgeVariant: 'success',
            progressStep: 4,
            progressTotal: 5
          }
        }
      },

      // Actions configuration
      actions: {
        admin: [{
          id: 'confirm_enrollment',
          label: 'Confirm Enrollment',
          type: 'success',
          icon: 'GraduationCap',
          behavior: 'showModal',
          target: 'EnrollmentConfirmationModal',
          requiresConfirmation: true,
          confirmationMessage: 'Confirm student enrollment completion?'
        }, {
          id: 'verify_documents',
          label: 'Verify Enrollment Documents',
          type: 'primary',
          icon: 'FileCheck',
          behavior: 'showModal',
          target: 'DocumentVerificationModal',
          requiresConfirmation: false
        }],
        partner: [{
          id: 'view_verification_status',
          label: 'View Verification Status',
          type: 'secondary',
          icon: 'Eye',
          behavior: 'showModal',
          target: 'VerificationStatusModal',
          requiresConfirmation: false
        }]
      },

      // Behavior configuration
      behavior: {
        onEntry: ['expandTimelineSection', 'prepareEnrollmentVerification'],
        onExit: ['finalizeEnrollmentProcess'],
        onAction: 'showEnrollmentConfirmation',
        modalToShow: 'EnrollmentConfirmationModal',
        redirectAfterAction: false,
        waitingForActor: 'Admin',
        notificationTriggers: ['arrivalVerified', 'enrollmentPending'],
        auditEvents: ['arrival.verified', 'enrollment.pending']
      },

      // Documents configuration
      documents: {
        required: ['enrollment_verification'],
        optional: ['academic_records', 'enrollment_photos'],
        autoGenerate: ['verification_report', 'enrollment_certificate'],
        hideUpload: false,
        reviewRequired: true,
        bulkUpload: false,
        allowedTypes: ['pdf', 'jpg', 'png'],
        maxSize: 10,
        downloadable: true
      },

      // Validation configuration
      validation: {
        onEntry: ['arrival_confirmed'],
        onExit: ['enrollment_ready'],
        requiredFields: ['verification_date', 'enrollment_status'],
        businessRules: ['arrival_verified', 'enrollment_eligible'],
        dependencies: [],
        blockers: []
      },

      version: "1.0.0",
      lastUpdated: "2025-08-31",
      description: "Admin verifies arrival and prepares enrollment confirmation"
    },

    // ===== ENROLLMENT_CONFIRMED =====
    enrollment_confirmed: {
      // Authority matrix
      authority: {
        setBy: 'Admin',
        setTrigger: 'Admin confirms student enrollment completion',
        adminCanUpdate: false,
        adminTransitions: [],
        partnerCanUpdate: false,
        partnerTransitions: [],
        partnerWaitsFor: 'COMPLETE - Ready for Stage 5',
        systemCanUpdate: true,
        systemTransitions: []
      },

      // Rules configuration
      rules: {
        isDocumentUploadStatus: false,
        isDocumentReviewStatus: false,
        isPaymentStatus: false,
        isTerminalStatus: true,
        requiresUrgentAction: false,
        showsInDashboard: true,
        allowsBulkUpdate: false,
        expandsDocumentSection: false,
        expandsTimelineSection: true,
        blocksNavigation: false,
        autoRefreshRequired: false,
        requiresConfirmation: false,
        requiresDocuments: false,
        partialSubmission: false
      },

      // Display configuration
      display: {
        admin: {
          allText: {
            statusCard: 'Enrollment confirmed - Stage 4 complete, ready for Stage 5',
            primaryMessage: 'Enrollment confirmed - Stage 4 complete',
            secondaryMessage: 'Student enrolled successfully - ready for commission processing',
            dashboardTitle: 'Enrollment Confirmed',
            dashboardSubtitle: 'Stage 4 Complete',
            listViewStatus: 'Enrollment Confirmed',
            heroCardTitle: 'Enrollment Confirmed!',
            heroCardSubtitle: 'Stage 4 Complete',
            heroCardDescription: 'Student successfully enrolled - ready for Stage 5',
            timelineTitle: 'Enrollment Confirmed',
            timelineDescription: 'Student enrollment successfully confirmed',
            actionButtonText: 'Move to Stage 5',
            actionButtonSecondary: 'View Summary',
            successMessage: 'Moved to Stage 5 successfully',
            errorMessage: 'Error moving to Stage 5',
            warningMessage: 'Ready to begin commission processing',
            infoMessage: 'Stage 4 completed successfully - student enrolled',
            emptyStateTitle: 'Stage 4 Complete',
            emptyStateDescription: 'Ready for commission processing',
            loadingMessage: 'Moving to Stage 5...',
            nextStepsTitle: 'Next Steps',
            nextSteps: ['Begin Stage 5', 'Process commission', 'Complete partner payment'],
            estimatedTime: 'Ready for Stage 5',
            urgencyText: 'Stage complete - success!'
          },
          styling: {
            statusColor: 'green',
            statusIcon: '🎓',
            urgencyLevel: 'low',
            badgeVariant: 'success',
            progressStep: 5,
            progressTotal: 5
          }
        },
        partner: {
          allText: {
            statusCard: 'Enrollment confirmed! Student successfully enrolled',
            primaryMessage: 'Success! Student enrolled and commission processing',
            secondaryMessage: 'Student successfully enrolled - commission processing begins',
            dashboardTitle: 'Student Enrolled!',
            dashboardSubtitle: 'Commission Processing',
            listViewStatus: 'Student Enrolled',
            heroCardTitle: 'Success! Student Enrolled!',
            heroCardSubtitle: 'Commission Processing',
            heroCardDescription: 'Student successfully enrolled - commission processing begins',
            timelineTitle: 'Enrollment Success',
            timelineDescription: 'Student successfully enrolled in program',
            actionButtonText: 'View Commission',
            actionButtonSecondary: 'Celebrate Success',
            successMessage: 'Enrollment success confirmed',
            errorMessage: 'Error viewing commission details',
            warningMessage: 'Commission processing in progress',
            infoMessage: 'Great work! Student enrolled successfully',
            emptyStateTitle: 'Enrollment Success!',
            emptyStateDescription: 'Student enrolled - commission processing',
            loadingMessage: 'Loading commission details...',
            nextStepsTitle: 'What\'s Next',
            nextSteps: ['Commission processing', 'Payment approval', 'Receive commission payment'],
            estimatedTime: 'Commission processing in progress',
            urgencyText: 'Success! Commission processing'
          },
          styling: {
            statusColor: 'green',
            statusIcon: '🎓',
            urgencyLevel: 'low',
            badgeVariant: 'success',
            progressStep: 5,
            progressTotal: 5
          }
        }
      },

      // Actions configuration
      actions: {
        admin: [{
          id: 'move_to_stage_5',
          label: 'Move to Stage 5',
          type: 'success',
          icon: 'DollarSign',
          behavior: 'custom',
          target: 'onStage4Complete',
          requiresConfirmation: true,
          confirmationMessage: 'Ready to move to Stage 5 - Commission Processing?'
        }],
        partner: [{
          id: 'celebrate_success',
          label: 'Celebrate Success',
          type: 'primary',
          icon: 'Trophy',
          behavior: 'showModal',
          target: 'success_modal',
          requiresConfirmation: false
        }]
      },

      // Behavior configuration
      behavior: {
        onEntry: ['expandTimelineSection', 'celebrateEnrollmentSuccess', 'prepareStage5Transition'],
        onExit: ['initializeStage5'],
        onAction: 'handleStageTransition',
        autoProgressTo: 'commission_pending',
        modalToShow: 'StageTransitionModal',
        redirectAfterAction: false,
        waitingForActor: 'Admin',
        notificationTriggers: ['enrollmentConfirmed', 'stage4Complete', 'stage5Ready'],
        auditEvents: ['enrollment.confirmed', 'stage_transition.4_to_5']
      },

      // Documents configuration
      documents: {
        required: [],
        optional: [],
        autoGenerate: ['commission_calculation_report'],
        hideUpload: true,
        reviewRequired: false,
        bulkUpload: false,
        allowedTypes: ['pdf'],
        maxSize: 5,
        downloadable: true
      },

      // Validation configuration
      validation: {
        onEntry: ['enrollment_verified'],
        onExit: ['ready_for_stage5'],
        requiredFields: [],
        businessRules: ['commission_eligibility'],
        dependencies: [],
        blockers: []
      },

      version: "1.0.0",
      lastUpdated: "2025-08-31",
      description: "Enrollment confirmed - Stage 4 complete, ready for Stage 5"
    }
  },
  
  // Required StageConfig properties
  defaultTransitions: [],
  stageCompletionStatus: 'enrollment_confirmed',
  version: '1.0.0',
  lastUpdated: '2025-08-31'
};

export default STAGE_4_CONFIG;