/**
 * Stage 3 Configuration: Visa Processing
 * 
 * This file contains ALL Stage 3 workflow logic based on the v6 database schema.
 * Handles visa application submission, payment processing, and visa approval/rejection.
 * 
 * Based on v6 Database Schema Stage 3 statuses:
 * - waiting_visa_payment (Partner can update)
 * - payment_received (Admin can update)  
 * - submitted_to_immigration (Admin can update)
 * - visa_approved (Admin can update)
 * - visa_rejected (Terminal status)
 * - additional_documents_required (Partner can update)
 * - visa_issued (Admin can update - Terminal success)
 */

import { StageConfig } from './types';

const STAGE_3_CONFIG: StageConfig = {
  stageName: "Visa Processing",
  stageDescription: "Visa application and immigration procedures",
  stageIcon: "📄",
  stageColor: "orange",
  estimatedDuration: "4-8 weeks",
  
  statuses: {
    // ===== WAITING_VISA_PAYMENT =====
    waiting_visa_payment: {
      // Authority matrix
      authority: {
        setBy: 'System',
        setTrigger: 'After university_approved in Stage 2',
        adminCanUpdate: false,
        adminTransitions: [],
        adminWaitsFor: 'WAITS for Partner to upload payment proof',
        partnerCanUpdate: true,
        partnerTransitions: ['payment_received'],
        partnerWaitsFor: 'WAITS to upload visa payment proof',
        systemCanUpdate: false,
        systemTransitions: []
      },

      // Rules configuration
      rules: {
        isDocumentUploadStatus: true,
        isDocumentReviewStatus: false,
        isPaymentStatus: true,
        isTerminalStatus: false,
        requiresUrgentAction: true,
        showsInDashboard: true,
        allowsBulkUpdate: false,
        expandsDocumentSection: true,
        expandsTimelineSection: false,
        blocksNavigation: false,
        autoRefreshRequired: false,
        requiresConfirmation: false,
        requiresDocuments: true,
        partialSubmission: false
      },

      // Display configuration for both roles
      display: {
        admin: {
          allText: {
            statusCard: 'Waiting for partner to upload visa payment proof',
            primaryMessage: 'Awaiting visa payment proof from partner',
            secondaryMessage: 'Partner needs to upload visa fee payment receipt',
            dashboardTitle: 'Visa Payment Pending',
            dashboardSubtitle: 'Payment Required',
            listViewStatus: 'Payment Pending',
            heroCardTitle: 'Visa Payment Required',
            heroCardSubtitle: 'Awaiting Payment Proof',
            heroCardDescription: 'Student needs to pay visa fees and upload proof',
            timelineTitle: 'Visa Payment Required',
            timelineDescription: 'Waiting for visa fee payment and proof upload',
            actionButtonText: undefined,
            actionButtonSecondary: undefined,
            successMessage: 'Payment reminder sent successfully',
            errorMessage: 'Failed to send payment reminder',
            warningMessage: 'Payment is overdue - consider following up',
            infoMessage: 'Visa payment typically takes 2-3 business days',
            emptyStateTitle: 'Awaiting Payment',
            emptyStateDescription: 'Partner will upload payment proof when ready',
            loadingMessage: 'Checking payment status...',
            nextStepsTitle: 'Waiting For',
            nextSteps: ['Partner to upload visa payment proof', 'Payment verification', 'Submit to immigration'],
            estimatedTime: 'Waiting for partner action',
            urgencyText: 'High priority - visa processing timeline'
          },
          styling: {
            statusColor: 'orange',
            statusIcon: '💳',
            urgencyLevel: 'high',
            badgeVariant: 'warning',
            progressStep: 1,
            progressTotal: 6
          }
        },
        partner: {
          allText: {
            statusCard: 'Upload visa payment proof to continue',
            primaryMessage: 'Please upload visa fee payment receipt',
            secondaryMessage: 'Student must pay visa fees and provide payment proof',
            dashboardTitle: 'Payment Required',
            dashboardSubtitle: 'Upload Receipt',
            listViewStatus: 'Payment Pending',
            heroCardTitle: 'Visa Payment Required',
            heroCardSubtitle: 'Action Required',
            heroCardDescription: 'Upload visa fee payment receipt to proceed',
            timelineTitle: 'Payment Upload Required',
            timelineDescription: 'Student must pay visa fees and upload proof',
            actionButtonText: 'Upload Payment Proof',
            actionButtonSecondary: 'View Requirements',
            successMessage: 'Payment proof uploaded successfully',
            errorMessage: 'Failed to upload payment proof',
            warningMessage: 'Please ensure payment receipt is clear and complete',
            infoMessage: 'Upload bank transfer receipt or payment confirmation',
            emptyStateTitle: 'Payment Required',
            emptyStateDescription: 'Please pay visa fees and upload receipt',
            loadingMessage: 'Uploading payment proof...',
            nextStepsTitle: 'How to Pay',
            nextSteps: ['Pay visa fees via bank transfer', 'Upload payment receipt', 'Wait for admin verification'],
            estimatedTime: 'Immediate action required',
            urgencyText: 'Action required to proceed'
          },
          styling: {
            statusColor: 'orange',
            statusIcon: '💳',
            urgencyLevel: 'high',
            badgeVariant: 'warning',
            progressStep: 1,
            progressTotal: 6
          }
        }
      },

      // Actions configuration
      actions: {
        admin: [], // No actions for admin - they wait for partner
        partner: [{
          id: 'upload_payment_proof',
          label: 'Upload Payment Proof',
          type: 'primary',
          icon: 'Upload',
          behavior: 'upload',
          target: 'DocumentUploadModal',
          requiresConfirmation: false
        }]
      },

      // Behavior configuration
      behavior: {
        onEntry: ['expandDocumentSection', 'showPaymentInstructions'],
        onExit: ['validatePaymentUpload'],
        onAction: 'showDocumentUpload',
        onDocumentUpload: 'autoProgressOnPayment',
        modalToShow: 'DocumentUploadModal',
        redirectAfterAction: false,
        waitingForActor: 'Partner',
        notificationTriggers: ['paymentRequired', 'paymentUploaded'],
        auditEvents: ['payment.required', 'payment.uploaded']
      },

      // Documents configuration
      documents: {
        required: ['visa_payment_receipt'],
        optional: ['additional_payment_documents'],
        autoGenerate: [],
        hideUpload: false,
        reviewRequired: true,
        bulkUpload: false,
        allowedTypes: ['pdf', 'jpg', 'png'],
        maxSize: 10,
        downloadable: true
      },

      // Validation configuration
      validation: {
        onEntry: ['visa_fees_calculated'],
        onExit: ['payment_receipt_uploaded'],
        requiredFields: ['payment_amount', 'payment_date'],
        businessRules: ['payment_amount_matches'],
        dependencies: [],
        blockers: []
      },

      version: "1.0.0",
      lastUpdated: "2025-08-31",
      description: "Partner must upload visa payment proof to proceed"
    },

    // ===== PAYMENT_RECEIVED =====
    payment_received: {
      // Authority matrix
      authority: {
        setBy: 'Partner',
        setTrigger: 'Partner uploads visa payment proof',
        adminCanUpdate: true,
        adminTransitions: ['submitted_to_immigration', 'waiting_visa_payment'],
        partnerCanUpdate: false,
        partnerTransitions: [],
        partnerWaitsFor: 'WAITS for admin to verify payment and submit to immigration',
        systemCanUpdate: false,
        systemTransitions: []
      },

      // Rules configuration
      rules: {
        isDocumentUploadStatus: false,
        isDocumentReviewStatus: true,
        isPaymentStatus: true,
        isTerminalStatus: false,
        requiresUrgentAction: true,
        showsInDashboard: true,
        allowsBulkUpdate: true,
        expandsDocumentSection: true,
        expandsTimelineSection: false,
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
            statusCard: 'Verify payment and submit visa application to immigration',
            primaryMessage: 'Review payment proof and submit to immigration',
            secondaryMessage: 'Partner uploaded visa payment - ready for submission',
            dashboardTitle: 'Payment Received',
            dashboardSubtitle: 'Ready for Submission',
            listViewStatus: 'Payment Received',
            heroCardTitle: 'Payment Verified',
            heroCardSubtitle: 'Ready for Immigration',
            heroCardDescription: 'Payment received - submit to immigration office',
            timelineTitle: 'Payment Received',
            timelineDescription: 'Payment proof uploaded and ready for submission',
            actionButtonText: 'Submit to Immigration',
            actionButtonSecondary: 'Review Payment',
            successMessage: 'Visa application submitted to immigration',
            errorMessage: 'Failed to submit to immigration',
            warningMessage: 'Please verify payment amount matches requirements',
            infoMessage: 'Review payment proof before submitting',
            emptyStateTitle: 'Ready for Submission',
            emptyStateDescription: 'Payment verified - ready for immigration submission',
            loadingMessage: 'Submitting to immigration...',
            nextStepsTitle: 'Next Steps',
            nextSteps: ['Verify payment amount', 'Check all documents', 'Submit to immigration'],
            estimatedTime: '1 business day',
            urgencyText: 'High priority - ready for submission'
          },
          styling: {
            statusColor: 'green',
            statusIcon: '✅',
            urgencyLevel: 'high',
            badgeVariant: 'success',
            progressStep: 2,
            progressTotal: 6
          }
        },
        partner: {
          allText: {
            statusCard: 'Payment received - awaiting admin submission to immigration',
            primaryMessage: 'Payment received - admin processing submission',
            secondaryMessage: 'Your payment has been received and verified',
            dashboardTitle: 'Payment Received',
            dashboardSubtitle: 'Processing Submission',
            listViewStatus: 'Payment Received',
            heroCardTitle: 'Payment Confirmed',
            heroCardSubtitle: 'Processing Submission',
            heroCardDescription: 'Payment verified - submitting to immigration office',
            timelineTitle: 'Payment Confirmed',
            timelineDescription: 'Payment received and being processed for submission',
            actionButtonText: 'View Status',
            actionButtonSecondary: 'Track Progress',
            successMessage: 'Payment confirmed successfully',
            errorMessage: 'Error checking payment status',
            warningMessage: 'Submission in progress',
            infoMessage: 'Admin is preparing submission to immigration',
            emptyStateTitle: 'Payment Confirmed',
            emptyStateDescription: 'Admin is processing your submission',
            loadingMessage: 'Checking submission status...',
            nextStepsTitle: 'Next Steps',
            nextSteps: ['Admin reviews payment', 'Application submitted to immigration', 'Wait for immigration response'],
            estimatedTime: '1-2 business days',
            urgencyText: 'Processing in progress'
          },
          styling: {
            statusColor: 'green',
            statusIcon: '✅',
            urgencyLevel: 'medium',
            badgeVariant: 'success',
            progressStep: 2,
            progressTotal: 6
          }
        }
      },

      // Actions configuration
      actions: {
        admin: [{
          id: 'submit_to_immigration',
          label: 'Submit to Immigration',
          type: 'success',
          icon: 'Send',
          behavior: 'showModal',
          target: 'ImmigrationSubmissionModal',
          requiresConfirmation: true,
          confirmationMessage: 'Ready to submit visa application to immigration office?'
        }, {
          id: 'verify_payment',
          label: 'Verify Payment',
          type: 'primary',
          icon: 'CheckCircle',
          behavior: 'showModal',
          target: 'PaymentVerificationModal',
          requiresConfirmation: false
        }],
        partner: [{
          id: 'view_payment_status',
          label: 'View Payment Status',
          type: 'secondary',
          icon: 'Eye',
          behavior: 'showModal',
          target: 'PaymentStatusModal',
          requiresConfirmation: false
        }]
      },

      // Behavior configuration
      behavior: {
        onEntry: ['expandTimelineSection', 'highlightVerificationNeeded'],
        onExit: ['finalizePaymentVerification'],
        onAction: 'showVerificationModal',
        modalToShow: 'PaymentVerificationModal',
        redirectAfterAction: false,
        waitingForActor: 'Admin',
        notificationTriggers: ['paymentReceived', 'verificationRequired'],
        auditEvents: ['payment.received', 'payment.verification_pending']
      },

      // Documents configuration
      documents: {
        required: [],
        optional: ['payment_confirmation', 'bank_transfer_receipt'],
        autoGenerate: ['payment_verification_report'],
        hideUpload: true,
        reviewRequired: false,
        bulkUpload: false,
        allowedTypes: ['pdf', 'jpg', 'png'],
        maxSize: 5,
        downloadable: true
      },

      // Validation configuration
      validation: {
        onEntry: ['payment_receipt_available'],
        onExit: ['payment_verified'],
        requiredFields: ['payment_amount', 'payment_date', 'payment_method'],
        businessRules: ['payment_amount_correct', 'payment_date_valid'],
        dependencies: [],
        blockers: []
      },

      version: "1.0.0",
      lastUpdated: "2025-08-31",
      description: "Payment received - admin verification and immigration submission pending"
    },

    // ===== SUBMITTED_TO_IMMIGRATION =====
    submitted_to_immigration: {
      // Authority matrix
      authority: {
        setBy: 'Admin',
        setTrigger: 'Admin submits visa application to immigration',
        adminCanUpdate: true,
        adminTransitions: ['visa_approved', 'visa_rejected', 'additional_documents_required'],
        partnerCanUpdate: false,
        partnerTransitions: [],
        partnerWaitsFor: 'WAITS for immigration decision',
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
        autoRefreshRequired: true,
        requiresConfirmation: false,
        requiresDocuments: false,
        partialSubmission: false
      },

      // Display configuration
      display: {
        admin: {
          allText: {
            statusCard: 'Monitoring immigration office response',
            primaryMessage: 'Visa application submitted - monitoring response',
            secondaryMessage: 'Application submitted to immigration - awaiting decision',
            dashboardTitle: 'Submitted to Immigration',
            dashboardSubtitle: 'Awaiting Decision',
            listViewStatus: 'Immigration Review',
            heroCardTitle: 'Immigration Review',
            heroCardSubtitle: 'Application Submitted',
            heroCardDescription: 'Visa application submitted to immigration office',
            timelineTitle: 'Submitted to Immigration',
            timelineDescription: 'Application submitted and under immigration review',
            actionButtonText: 'Check Immigration Status',
            actionButtonSecondary: 'Update Status',
            successMessage: 'Immigration status updated successfully',
            errorMessage: 'Failed to update immigration status',
            warningMessage: 'Monitor immigration portal for updates',
            infoMessage: 'Immigration review typically takes 3-6 weeks',
            emptyStateTitle: 'Under Immigration Review',
            emptyStateDescription: 'Immigration office is reviewing the application',
            loadingMessage: 'Checking immigration status...',
            nextStepsTitle: 'Monitoring Process',
            nextSteps: ['Monitor immigration portal', 'Respond to any queries', 'Track processing timeline'],
            estimatedTime: '3-6 weeks',
            urgencyText: 'Standard immigration timeline'
          },
          styling: {
            statusColor: 'blue',
            statusIcon: '📄',
            urgencyLevel: 'low',
            badgeVariant: 'info',
            progressStep: 3,
            progressTotal: 6
          }
        },
        partner: {
          allText: {
            statusCard: 'Visa application submitted to immigration office',
            primaryMessage: 'Application under immigration review',
            secondaryMessage: 'Your visa application has been submitted and is being reviewed',
            dashboardTitle: 'Immigration Review',
            dashboardSubtitle: 'Under Review',
            listViewStatus: 'Immigration Review',
            heroCardTitle: 'Immigration Review',
            heroCardSubtitle: 'Application Submitted',
            heroCardDescription: 'Your visa application is being reviewed by immigration',
            timelineTitle: 'Immigration Review',
            timelineDescription: 'Application submitted and under official review',
            actionButtonText: 'View Progress',
            actionButtonSecondary: 'Check Timeline',
            successMessage: 'Status updated successfully',
            errorMessage: 'Error checking status',
            warningMessage: 'Review process may take several weeks',
            infoMessage: 'Immigration review typically takes 3-6 weeks',
            emptyStateTitle: 'Under Review',
            emptyStateDescription: 'Immigration office is reviewing your application',
            loadingMessage: 'Checking review status...',
            nextStepsTitle: 'What\'s Next',
            nextSteps: ['Immigration office reviews application', 'Possible request for additional documents', 'Visa decision notification'],
            estimatedTime: '3-6 weeks',
            urgencyText: 'Standard review timeline'
          },
          styling: {
            statusColor: 'blue',
            statusIcon: '📄',
            urgencyLevel: 'low',
            badgeVariant: 'info',
            progressStep: 3,
            progressTotal: 6
          }
        }
      },

      // Actions configuration
      actions: {
        admin: [{
          id: 'check_immigration_status',
          label: 'Check Immigration Status',
          type: 'primary',
          icon: 'RefreshCw',
          behavior: 'external',
          target: 'immigration_portal',
          requiresConfirmation: false
        }, {
          id: 'update_status',
          label: 'Update Status',
          type: 'secondary',
          icon: 'Edit',
          behavior: 'showModal',
          target: 'StatusUpdateModal',
          requiresConfirmation: false
        }],
        partner: [{
          id: 'track_progress',
          label: 'Track Progress',
          type: 'secondary',
          icon: 'Activity',
          behavior: 'showModal',
          target: 'ProgressTrackingModal',
          requiresConfirmation: false
        }]
      },

      // Behavior configuration
      behavior: {
        onEntry: ['expandTimelineSection', 'startImmigrationTracking'],
        onExit: ['stopImmigrationTracking'],
        onAction: 'showTrackingModal',
        modalToShow: 'ImmigrationTrackingModal',
        redirectAfterAction: false,
        waitingForActor: 'Immigration',
        notificationTriggers: ['immigrationSubmitted', 'statusUpdate'],
        auditEvents: ['immigration.submitted', 'immigration.status_check']
      },

      // Documents configuration
      documents: {
        required: [],
        optional: ['immigration_correspondence'],
        autoGenerate: ['submission_package', 'tracking_report'],
        hideUpload: true,
        reviewRequired: false,
        bulkUpload: false,
        allowedTypes: ['pdf'],
        maxSize: 5,
        downloadable: true
      },

      // Validation configuration
      validation: {
        onEntry: ['immigration_submission_confirmed'],
        onExit: ['immigration_response_received'],
        requiredFields: ['submission_reference', 'submission_date'],
        businessRules: ['immigration_office_valid', 'tracking_active'],
        dependencies: [],
        blockers: []
      },

      version: "1.0.0",
      lastUpdated: "2025-08-31",
      description: "Visa application submitted to immigration - awaiting official decision"
    },

    // ===== ADDITIONAL_DOCUMENTS_REQUIRED =====
    additional_documents_required: {
      // Authority matrix
      authority: {
        setBy: 'Admin',
        setTrigger: 'Immigration requests additional documents',
        adminCanUpdate: false,
        adminTransitions: [],
        partnerCanUpdate: true,
        partnerTransitions: ['submitted_to_immigration'],
        partnerWaitsFor: 'WAITS to upload additional documents',
        systemCanUpdate: false,
        systemTransitions: []
      },

      // Rules configuration
      rules: {
        isDocumentUploadStatus: true,
        isDocumentReviewStatus: false,
        isPaymentStatus: false,
        isTerminalStatus: false,
        requiresUrgentAction: true,
        showsInDashboard: true,
        allowsBulkUpdate: false,
        expandsDocumentSection: true,
        expandsTimelineSection: false,
        blocksNavigation: false,
        autoRefreshRequired: false,
        requiresConfirmation: false,
        requiresDocuments: true,
        partialSubmission: true
      },

      // Display configuration
      display: {
        admin: {
          allText: {
            statusCard: 'Waiting for partner to upload additional documents',
            primaryMessage: 'Immigration requested additional documents',
            secondaryMessage: 'Partner needs to upload required additional documents',
            dashboardTitle: 'Additional Documents Required',
            dashboardSubtitle: 'Partner Action Needed',
            listViewStatus: 'Documents Required',
            heroCardTitle: 'Additional Documents Required',
            heroCardSubtitle: 'Partner Action Needed',
            heroCardDescription: 'Immigration office requires additional documentation',
            timelineTitle: 'Additional Documents Requested',
            timelineDescription: 'Immigration office requested additional documents',
            actionButtonText: 'Review Requirements',
            actionButtonSecondary: 'Send Reminder',
            successMessage: 'Reminder sent to partner',
            errorMessage: 'Failed to send reminder',
            warningMessage: 'Documents needed urgently to avoid delays',
            infoMessage: 'Partner has been notified of additional requirements',
            emptyStateTitle: 'Awaiting Documents',
            emptyStateDescription: 'Partner will upload additional documents',
            loadingMessage: 'Checking document status...',
            nextStepsTitle: 'Next Steps',
            nextSteps: ['Partner uploads documents', 'Admin reviews and resubmits', 'Immigration continues review'],
            estimatedTime: '3-5 business days',
            urgencyText: 'High priority - immigration timeline'
          },
          styling: {
            statusColor: 'orange',
            statusIcon: '📎',
            urgencyLevel: 'high',
            badgeVariant: 'warning',
            progressStep: 3,
            progressTotal: 6
          }
        },
        partner: {
          allText: {
            statusCard: 'Upload additional documents required by immigration',
            primaryMessage: 'Immigration office requires additional documents',
            secondaryMessage: 'Please upload the requested additional documents',
            dashboardTitle: 'Documents Required',
            dashboardSubtitle: 'Action Required',
            listViewStatus: 'Documents Required',
            heroCardTitle: 'Additional Documents Required',
            heroCardSubtitle: 'Action Required',
            heroCardDescription: 'Immigration office needs additional documentation',
            timelineTitle: 'Additional Documents Required',
            timelineDescription: 'Please upload additional documents as requested',
            actionButtonText: 'Upload Documents',
            actionButtonSecondary: 'View Requirements',
            successMessage: 'Documents uploaded successfully',
            errorMessage: 'Failed to upload documents',
            warningMessage: 'Please ensure all documents meet requirements',
            infoMessage: 'Upload all requested documents to avoid delays',
            emptyStateTitle: 'Documents Required',
            emptyStateDescription: 'Please upload additional documents as requested',
            loadingMessage: 'Uploading documents...',
            nextStepsTitle: 'Required Actions',
            nextSteps: ['Review document requirements', 'Upload all requested documents', 'Wait for resubmission'],
            estimatedTime: 'Immediate action required',
            urgencyText: 'Urgent action required'
          },
          styling: {
            statusColor: 'orange',
            statusIcon: '📎',
            urgencyLevel: 'high',
            badgeVariant: 'warning',
            progressStep: 3,
            progressTotal: 6
          }
        }
      },

      // Actions configuration
      actions: {
        admin: [{
          id: 'review_requirements',
          label: 'Review Requirements',
          type: 'secondary',
          icon: 'FileText',
          behavior: 'showModal',
          target: 'RequirementsModal',
          requiresConfirmation: false
        }, {
          id: 'contact_partner',
          label: 'Contact Partner',
          type: 'primary',
          icon: 'Phone',
          behavior: 'showModal',
          target: 'ContactModal',
          requiresConfirmation: false
        }],
        partner: [{
          id: 'upload_additional_docs',
          label: 'Upload Additional Documents',
          type: 'primary',
          icon: 'Upload',
          behavior: 'upload',
          target: 'DocumentUploadModal',
          requiresConfirmation: false
        }, {
          id: 'view_requirements',
          label: 'View Requirements',
          type: 'secondary',
          icon: 'Eye',
          behavior: 'showModal',
          target: 'RequirementsViewModal',
          requiresConfirmation: false
        }]
      },

      // Behavior configuration
      behavior: {
        onEntry: ['expandDocumentSection', 'highlightRequirements'],
        onExit: ['validateAdditionalDocuments'],
        onAction: 'showDocumentUpload',
        onDocumentUpload: 'autoProgressOnComplete',
        modalToShow: 'DocumentUploadModal',
        redirectAfterAction: false,
        waitingForActor: 'Partner',
        notificationTriggers: ['additionalDocsRequired', 'docsUploaded'],
        auditEvents: ['immigration.additional_docs_required', 'documents.additional_uploaded']
      },

      // Documents configuration
      documents: {
        required: ['additional_immigration_documents'],
        optional: ['supporting_evidence'],
        autoGenerate: ['requirements_list'],
        hideUpload: false,
        reviewRequired: true,
        bulkUpload: true,
        allowedTypes: ['pdf', 'jpg', 'png', 'doc', 'docx'],
        maxSize: 15,
        downloadable: true
      },

      // Validation configuration
      validation: {
        onEntry: ['immigration_requirements_available'],
        onExit: ['all_additional_docs_uploaded'],
        requiredFields: ['requirement_list', 'deadline'],
        businessRules: ['deadline_not_expired', 'requirements_clear'],
        dependencies: [],
        blockers: []
      },

      version: "1.0.0",
      lastUpdated: "2025-08-31",
      description: "Immigration requires additional documents - partner action required"
    },

    // ===== VISA_APPROVED =====
    visa_approved: {
      // Authority matrix
      authority: {
        setBy: 'Admin',
        setTrigger: 'Immigration approves visa application',
        adminCanUpdate: true,
        adminTransitions: ['visa_issued'],
        partnerCanUpdate: false,
        partnerTransitions: [],
        partnerWaitsFor: 'WAITS for admin to issue visa',
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
            statusCard: 'Visa approved - prepare and issue visa documents',
            primaryMessage: 'Immigration approved visa - issue documents',
            secondaryMessage: 'Visa application approved - prepare visa documents',
            dashboardTitle: 'Visa Approved',
            dashboardSubtitle: 'Issue Documents',
            listViewStatus: 'Visa Approved',
            heroCardTitle: 'Visa Approved!',
            heroCardSubtitle: 'Issue Documents',
            heroCardDescription: 'Immigration approved the visa application',
            timelineTitle: 'Visa Approved',
            timelineDescription: 'Immigration office approved the visa application',
            actionButtonText: 'Issue Visa Documents',
            actionButtonSecondary: 'Download Approval',
            successMessage: 'Visa documents prepared successfully',
            errorMessage: 'Failed to prepare visa documents',
            warningMessage: 'Prepare visa documents promptly',
            infoMessage: 'Visa approved - ready for document issuance',
            emptyStateTitle: 'Visa Approved',
            emptyStateDescription: 'Ready to issue visa documents',
            loadingMessage: 'Preparing visa documents...',
            nextStepsTitle: 'Next Steps',
            nextSteps: ['Prepare visa documents', 'Issue to student', 'Move to Stage 4'],
            estimatedTime: '1-2 business days',
            urgencyText: 'High priority - issue documents'
          },
          styling: {
            statusColor: 'green',
            statusIcon: '🎉',
            urgencyLevel: 'high',
            badgeVariant: 'success',
            progressStep: 4,
            progressTotal: 6
          }
        },
        partner: {
          allText: {
            statusCard: 'Visa approved! Awaiting document issuance',
            primaryMessage: 'Congratulations! Visa application approved',
            secondaryMessage: 'Immigration approved the visa - documents being prepared',
            dashboardTitle: 'Visa Approved!',
            dashboardSubtitle: 'Documents Pending',
            listViewStatus: 'Visa Approved',
            heroCardTitle: 'Visa Approved!',
            heroCardSubtitle: 'Congratulations!',
            heroCardDescription: 'The visa application has been approved by immigration',
            timelineTitle: 'Visa Approved',
            timelineDescription: 'Great news! The visa application was approved',
            actionButtonText: 'View Details',
            actionButtonSecondary: 'Share News',
            successMessage: 'Visa approval confirmed',
            errorMessage: 'Error viewing approval details',
            warningMessage: 'Await document issuance',
            infoMessage: 'Admin is preparing visa documents',
            emptyStateTitle: 'Visa Approved!',
            emptyStateDescription: 'Visa documents are being prepared',
            loadingMessage: 'Loading approval details...',
            nextStepsTitle: 'What\'s Next',
            nextSteps: ['Receive visa documents', 'Plan student arrival', 'Prepare for Stage 4'],
            estimatedTime: '1-2 business days',
            urgencyText: 'Success! Documents pending'
          },
          styling: {
            statusColor: 'green',
            statusIcon: '🎉',
            urgencyLevel: 'medium',
            badgeVariant: 'success',
            progressStep: 4,
            progressTotal: 6
          }
        }
      },

      // Actions configuration
      actions: {
        admin: [{
          id: 'issue_visa_documents',
          label: 'Issue Visa Documents',
          type: 'success',
          icon: 'Award',
          behavior: 'showModal',
          target: 'VisaIssuanceModal',
          requiresConfirmation: true,
          confirmationMessage: 'Ready to issue visa documents to student?'
        }, {
          id: 'prepare_documents',
          label: 'Prepare Documents',
          type: 'primary',
          icon: 'FileCheck',
          behavior: 'showModal',
          target: 'DocumentPreparationModal',
          requiresConfirmation: false
        }],
        partner: [{
          id: 'celebrate_approval',
          label: 'Share Good News',
          type: 'primary',
          icon: 'Heart',
          behavior: 'showModal',
          target: 'CelebrationModal',
          requiresConfirmation: false
        }, {
          id: 'prepare_next_steps',
          label: 'Prepare Next Steps',
          type: 'secondary',
          icon: 'CheckSquare',
          behavior: 'showModal',
          target: 'NextStepsModal',
          requiresConfirmation: false
        }]
      },

      // Behavior configuration
      behavior: {
        onEntry: ['expandTimelineSection', 'celebrateApproval', 'prepareVisaIssuance'],
        onExit: ['finalizeVisaPreparation'],
        onAction: 'showVisaIssuanceModal',
        modalToShow: 'VisaIssuanceModal',
        redirectAfterAction: false,
        waitingForActor: 'Admin',
        notificationTriggers: ['visaApproved', 'issuancePending', 'celebrateSuccess'],
        auditEvents: ['visa.approved', 'visa.issuance_pending']
      },

      // Documents configuration
      documents: {
        required: [],
        optional: ['approval_notification'],
        autoGenerate: ['visa_documents_package', 'approval_certificate'],
        hideUpload: true,
        reviewRequired: false,
        bulkUpload: false,
        allowedTypes: ['pdf'],
        maxSize: 5,
        downloadable: true
      },

      // Validation configuration
      validation: {
        onEntry: ['immigration_approval_confirmed'],
        onExit: ['visa_documents_ready'],
        requiredFields: ['approval_date', 'visa_number'],
        businessRules: ['approval_valid', 'documents_complete'],
        dependencies: [],
        blockers: []
      },

      version: "1.0.0",
      lastUpdated: "2025-08-31",
      description: "Visa approved by immigration - preparing documents for issuance"
    },

    // ===== VISA_REJECTED =====
    visa_rejected: {
      // Authority matrix
      authority: {
        setBy: 'Admin',
        setTrigger: 'Immigration rejects visa application',
        adminCanUpdate: false,
        adminTransitions: [],
        partnerCanUpdate: false,
        partnerTransitions: [],
        partnerWaitsFor: 'TERMINAL - Application rejected',
        systemCanUpdate: false,
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
            statusCard: 'Visa application rejected by immigration',
            primaryMessage: 'Immigration rejected the visa application',
            secondaryMessage: 'Visa application was rejected - review rejection reasons',
            dashboardTitle: 'Visa Rejected',
            dashboardSubtitle: 'Application Closed',
            listViewStatus: 'Visa Rejected',
            heroCardTitle: 'Visa Rejected',
            heroCardSubtitle: 'Application Closed',
            heroCardDescription: 'Immigration office rejected the visa application',
            timelineTitle: 'Visa Rejected',
            timelineDescription: 'Immigration office rejected the visa application',
            actionButtonText: 'View Rejection Details',
            actionButtonSecondary: 'Archive Application',
            successMessage: 'Rejection details viewed',
            errorMessage: 'Error viewing rejection details',
            warningMessage: 'Review rejection reasons for future applications',
            infoMessage: 'Application closed due to visa rejection',
            emptyStateTitle: 'Application Rejected',
            emptyStateDescription: 'Visa was rejected by immigration office',
            loadingMessage: 'Loading rejection details...',
            nextStepsTitle: 'Options',
            nextSteps: ['Review rejection reasons', 'Consider reapplication', 'Archive application'],
            estimatedTime: 'N/A',
            urgencyText: 'Terminal status'
          },
          styling: {
            statusColor: 'red',
            statusIcon: '❌',
            urgencyLevel: 'low',
            badgeVariant: 'error',
            progressStep: 6,
            progressTotal: 6
          }
        },
        partner: {
          allText: {
            statusCard: 'Visa application was rejected',
            primaryMessage: 'Unfortunately, the visa application was rejected',
            secondaryMessage: 'Immigration office rejected the visa application',
            dashboardTitle: 'Visa Rejected',
            dashboardSubtitle: 'Application Closed',
            listViewStatus: 'Visa Rejected',
            heroCardTitle: 'Visa Rejected',
            heroCardSubtitle: 'Application Closed',
            heroCardDescription: 'The visa application was rejected by immigration',
            timelineTitle: 'Visa Rejected',
            timelineDescription: 'Immigration office rejected the visa application',
            actionButtonText: 'View Details',
            actionButtonSecondary: 'Contact Support',
            successMessage: 'Rejection details retrieved',
            errorMessage: 'Error viewing details',
            warningMessage: 'Consider future reapplication options',
            infoMessage: 'Review rejection reasons for future reference',
            emptyStateTitle: 'Application Rejected',
            emptyStateDescription: 'Visa was not approved by immigration',
            loadingMessage: 'Loading rejection details...',
            nextStepsTitle: 'Next Options',
            nextSteps: ['Review rejection reasons', 'Consider reapplication', 'Discuss alternatives'],
            estimatedTime: 'N/A',
            urgencyText: 'Application closed'
          },
          styling: {
            statusColor: 'red',
            statusIcon: '❌',
            urgencyLevel: 'low',
            badgeVariant: 'error',
            progressStep: 6,
            progressTotal: 6
          }
        }
      },

      // Actions configuration
      actions: {
        admin: [{
          id: 'review_rejection_reasons',
          label: 'Review Rejection Reasons',
          type: 'secondary',
          icon: 'AlertCircle',
          behavior: 'showModal',
          target: 'RejectionReviewModal',
          requiresConfirmation: false
        }, {
          id: 'archive_application',
          label: 'Archive Application',
          type: 'primary',
          icon: 'Archive',
          behavior: 'showModal',
          target: 'ArchiveModal',
          requiresConfirmation: true,
          confirmationMessage: 'Archive this rejected application?'
        }],
        partner: [{
          id: 'view_rejection_details',
          label: 'View Rejection Details',
          type: 'secondary',
          icon: 'Eye',
          behavior: 'showModal',
          target: 'RejectionDetailsModal',
          requiresConfirmation: false
        }, {
          id: 'discuss_options',
          label: 'Discuss Options',
          type: 'primary',
          icon: 'MessageCircle',
          behavior: 'showModal',
          target: 'OptionsDiscussionModal',
          requiresConfirmation: false
        }]
      },

      // Behavior configuration
      behavior: {
        onEntry: ['expandTimelineSection', 'showRejectionSummary'],
        onExit: ['finalizeArchiving'],
        onAction: 'showRejectionModal',
        modalToShow: 'RejectionDetailsModal',
        redirectAfterAction: false,
        waitingForActor: 'Admin',
        notificationTriggers: ['visaRejected', 'applicationClosed'],
        auditEvents: ['visa.rejected', 'application.archived']
      },

      // Documents configuration
      documents: {
        required: [],
        optional: ['rejection_notice'],
        autoGenerate: ['rejection_summary', 'closure_report'],
        hideUpload: true,
        reviewRequired: false,
        bulkUpload: false,
        allowedTypes: ['pdf'],
        maxSize: 5,
        downloadable: true
      },

      // Validation configuration
      validation: {
        onEntry: ['rejection_reason_documented'],
        onExit: ['application_properly_closed'],
        requiredFields: ['rejection_date', 'rejection_reason'],
        businessRules: ['rejection_final', 'documentation_complete'],
        dependencies: [],
        blockers: []
      },

      version: "1.0.0",
      lastUpdated: "2025-08-31",
      description: "Visa application rejected - terminal status"
    },

    // ===== VISA_ISSUED =====
    visa_issued: {
      // Authority matrix
      authority: {
        setBy: 'Admin',
        setTrigger: 'Admin issues visa documents to student',
        adminCanUpdate: false,
        adminTransitions: [],
        partnerCanUpdate: false,
        partnerTransitions: [],
        partnerWaitsFor: 'COMPLETE - Ready for Stage 4',
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
            statusCard: 'Visa issued successfully - ready for Stage 4',
            primaryMessage: 'Visa documents issued - Stage 3 complete',
            secondaryMessage: 'Visa issued successfully - ready for arrival management',
            dashboardTitle: 'Visa Issued',
            dashboardSubtitle: 'Stage 3 Complete',
            listViewStatus: 'Visa Issued',
            heroCardTitle: 'Visa Issued Successfully!',
            heroCardSubtitle: 'Stage 3 Complete',
            heroCardDescription: 'Visa documents issued - ready for Stage 4',
            timelineTitle: 'Visa Issued',
            timelineDescription: 'Visa documents issued successfully to student',
            actionButtonText: 'Move to Stage 4',
            actionButtonSecondary: 'View Documents',
            successMessage: 'Moved to Stage 4 successfully',
            errorMessage: 'Error moving to Stage 4',
            warningMessage: 'Ready to begin arrival management',
            infoMessage: 'Stage 3 completed successfully',
            emptyStateTitle: 'Stage 3 Complete',
            emptyStateDescription: 'Ready for arrival management',
            loadingMessage: 'Moving to Stage 4...',
            nextStepsTitle: 'Next Steps',
            nextSteps: ['Begin Stage 4', 'Plan student arrival', 'Set arrival date'],
            estimatedTime: 'Ready for Stage 4',
            urgencyText: 'Stage complete - success!'
          },
          styling: {
            statusColor: 'green',
            statusIcon: '🏆',
            urgencyLevel: 'low',
            badgeVariant: 'success',
            progressStep: 6,
            progressTotal: 6
          }
        },
        partner: {
          allText: {
            statusCard: 'Visa issued successfully! Student can travel',
            primaryMessage: 'Visa issued - student can plan arrival',
            secondaryMessage: 'Visa documents issued - student can now travel',
            dashboardTitle: 'Visa Issued!',
            dashboardSubtitle: 'Ready to Travel',
            listViewStatus: 'Visa Issued',
            heroCardTitle: 'Visa Issued Successfully!',
            heroCardSubtitle: 'Student Can Travel',
            heroCardDescription: 'Visa documents issued - student ready for arrival',
            timelineTitle: 'Visa Issued',
            timelineDescription: 'Visa documents successfully issued',
            actionButtonText: 'Download Visa',
            actionButtonSecondary: 'Plan Arrival',
            successMessage: 'Visa documents downloaded',
            errorMessage: 'Error downloading documents',
            warningMessage: 'Prepare for arrival coordination',
            infoMessage: 'Student can now plan travel and arrival',
            emptyStateTitle: 'Visa Ready!',
            emptyStateDescription: 'Student can travel with issued visa',
            loadingMessage: 'Loading visa documents...',
            nextStepsTitle: 'What\'s Next',
            nextSteps: ['Coordinate student arrival', 'Plan accommodation', 'Prepare for arrival verification'],
            estimatedTime: 'Ready for travel',
            urgencyText: 'Success! Ready for arrival'
          },
          styling: {
            statusColor: 'green',
            statusIcon: '🏆',
            urgencyLevel: 'low',
            badgeVariant: 'success',
            progressStep: 6,
            progressTotal: 6
          }
        }
      },

      // Actions configuration
      actions: {
        admin: [{
          id: 'move_to_stage_4',
          label: 'Move to Stage 4',
          type: 'success',
          icon: 'Plane',
          behavior: 'custom',
          target: 'onStage3Complete',
          requiresConfirmation: true,
          confirmationMessage: 'Ready to move to Stage 4 - Arrival Management?'
        }],
        partner: [{
          id: 'download_visa',
          label: 'Download Visa Documents',
          type: 'primary',
          icon: 'Download',
          behavior: 'download',
          target: 'visa_documents',
          requiresConfirmation: false
        }]
      },

      // Behavior configuration
      behavior: {
        onEntry: ['expandTimelineSection', 'celebrateVisaSuccess', 'prepareStage4Transition'],
        onExit: ['initializeStage4'],
        onAction: 'handleStageTransition',
        autoProgressTo: 'arrival_date_planned',
        modalToShow: 'StageTransitionModal',
        redirectAfterAction: false,
        waitingForActor: 'Admin',
        notificationTriggers: ['visaIssued', 'stage3Complete', 'stage4Ready'],
        auditEvents: ['visa.issued', 'stage_transition.3_to_4']
      },

      // Documents configuration
      documents: {
        required: [],
        optional: [],
        autoGenerate: ['arrival_preparation_package'],
        hideUpload: true,
        reviewRequired: false,
        bulkUpload: false,
        allowedTypes: ['pdf'],
        maxSize: 5,
        downloadable: true
      },

      // Validation configuration
      validation: {
        onEntry: ['visa_documents_generated'],
        onExit: ['ready_for_stage4'],
        requiredFields: [],
        businessRules: ['stage4_ready'],
        dependencies: [],
        blockers: []
      },

      version: "1.0.0",
      lastUpdated: "2025-08-31",
      description: "Visa issued - Stage 3 complete, ready for Stage 4"
    }
  },
  
  // Required StageConfig properties
  defaultTransitions: [],
  stageCompletionStatus: 'visa_issued',
  version: '1.0.0',
  lastUpdated: '2025-08-31'
};

export default STAGE_3_CONFIG;