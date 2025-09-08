/**
 * Stage 5 Configuration: Commission Processing
 * 
 * This file contains ALL Stage 5 workflow logic based on the v6 database schema.
 * Handles commission calculation, approval, payment processing, and completion.
 * 
 * Based on v6 Database Schema Stage 5 statuses:
 * - commission_pending (System sets, Admin can update)
 * - commission_approved (Admin can update)  
 * - commission_paid (Admin can update - Terminal success)
 * - commission_disputed (Partner can update)
 */

import { StageConfig } from './types';

const STAGE_5_CONFIG: StageConfig = {
  stageName: "Commission Processing",
  stageDescription: "Partner commission processing and payment",
  stageIcon: "💰",
  stageColor: "green",
  estimatedDuration: "1-2 weeks",
  
  statuses: {
    // ===== COMMISSION_PENDING =====
    commission_pending: {
      // Authority matrix
      authority: {
        setBy: 'System',
        setTrigger: 'After enrollment_confirmed in Stage 4',
        adminCanUpdate: true,
        adminTransitions: ['commission_approved', 'commission_disputed'],
        partnerCanUpdate: false,
        partnerTransitions: [],
        partnerWaitsFor: 'WAITS for admin commission review and approval',
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
        allowsBulkUpdate: true,
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
            statusCard: 'Review and approve partner commission for payment',
            primaryMessage: 'Review commission details and approve payment',
            secondaryMessage: 'Student enrolled - review partner commission for approval',
            dashboardTitle: 'Commission Pending',
            dashboardSubtitle: 'Review & Approve',
            listViewStatus: 'Commission Review',
            heroCardTitle: 'Commission Pending Review',
            heroCardSubtitle: 'Review Required',
            heroCardDescription: 'Partner commission ready for review and approval',
            timelineTitle: 'Commission Generated',
            timelineDescription: 'Commission calculated and ready for review',
            actionButtonText: 'Review & Approve',
            actionButtonSecondary: 'View Calculation',
            successMessage: 'Commission approved successfully',
            errorMessage: 'Failed to approve commission',
            warningMessage: 'Review commission calculation and student enrollment',
            infoMessage: 'Verify enrollment before approving commission',
            emptyStateTitle: 'Ready for Review',
            emptyStateDescription: 'Commission ready for admin review',
            loadingMessage: 'Processing commission approval...',
            nextStepsTitle: 'Review Steps',
            nextSteps: ['Verify student enrollment', 'Check commission calculation', 'Approve for payment'],
            estimatedTime: '1-2 business days',
            urgencyText: 'High priority - partner awaiting payment'
          },
          styling: {
            statusColor: 'orange',
            statusIcon: '💼',
            urgencyLevel: 'high',
            badgeVariant: 'warning',
            progressStep: 1,
            progressTotal: 3
          }
        },
        partner: {
          allText: {
            statusCard: 'Commission pending admin review and approval',
            primaryMessage: 'Commission under admin review for approval',
            secondaryMessage: 'Your commission is being reviewed for approval',
            dashboardTitle: 'Commission Pending',
            dashboardSubtitle: 'Under Review',
            listViewStatus: 'Under Review',
            heroCardTitle: 'Commission Under Review',
            heroCardSubtitle: 'Approval Pending',
            heroCardDescription: 'Your commission is being reviewed by admin',
            timelineTitle: 'Commission Review',
            timelineDescription: 'Commission generated and under admin review',
            actionButtonText: 'View Commission',
            actionButtonSecondary: 'Track Status',
            successMessage: 'Commission details retrieved',
            errorMessage: 'Error viewing commission details',
            warningMessage: 'Commission approval in progress',
            infoMessage: 'Admin is reviewing commission for approval',
            emptyStateTitle: 'Under Review',
            emptyStateDescription: 'Admin is reviewing your commission',
            loadingMessage: 'Loading commission details...',
            nextStepsTitle: 'What\'s Next',
            nextSteps: ['Admin reviews enrollment', 'Commission gets approved', 'Payment processing begins'],
            estimatedTime: '1-2 business days',
            urgencyText: 'Review in progress - please wait'
          },
          styling: {
            statusColor: 'orange',
            statusIcon: '💼',
            urgencyLevel: 'medium',
            badgeVariant: 'warning',
            progressStep: 1,
            progressTotal: 3
          }
        }
      },

      // Actions configuration
      actions: {
        admin: [{
          id: 'approve_commission',
          label: 'Approve Commission',
          type: 'primary',
          icon: 'CheckCircle',
          behavior: 'showModal',
          target: 'CommissionApprovalModal',
          requiresConfirmation: true
        }, {
          id: 'dispute_commission',
          label: 'Dispute Commission',
          type: 'secondary',
          icon: 'AlertTriangle',
          behavior: 'showModal',
          target: 'CommissionDisputeModal',
          requiresConfirmation: true
        }],
        partner: [{
          id: 'view_commission_details',
          label: 'View Commission Details',
          type: 'primary',
          icon: 'Eye',
          behavior: 'showModal',
          target: 'CommissionDetailsModal',
          requiresConfirmation: false
        }]
      },

      // Behavior configuration
      behavior: {
        onEntry: ['expandTimelineSection', 'highlightCommissionReview'],
        onExit: ['finalizeCommissionDecision'],
        onAction: 'showCommissionModal',
        modalToShow: 'CommissionReviewModal',
        redirectAfterAction: false,
        waitingForActor: 'Admin',
        notificationTriggers: ['commissionPending', 'reviewRequired'],
        auditEvents: ['commission.pending', 'commission.review_started']
      },

      // Documents configuration
      documents: {
        required: ['commission_calculation', 'enrollment_confirmation'],
        optional: ['performance_metrics', 'partnership_agreement'],
        autoGenerate: ['commission_report'],
        hideUpload: false,
        reviewRequired: true,
        bulkUpload: false,
        allowedTypes: ['pdf', 'xlsx'],
        maxSize: 10,
        downloadable: true
      },

      // Validation configuration
      validation: {
        onEntry: ['enrollment_confirmed'],
        onExit: ['commission_reviewed'],
        requiredFields: ['commission_amount', 'enrollment_date'],
        businessRules: ['commission_calculation_valid', 'enrollment_verified'],
        dependencies: ['enrollment_confirmed'],
        blockers: []
      },

      version: "1.0.0",
      lastUpdated: "2025-08-31",
      description: "Commission pending admin review and approval"
    },

    // ===== COMMISSION_APPROVED =====
    commission_approved: {
      // Authority matrix
      authority: {
        setBy: 'Admin',
        setTrigger: 'Admin approves commission for payment',
        adminCanUpdate: true,
        adminTransitions: ['commission_paid', 'commission_disputed'],
        partnerCanUpdate: false,
        partnerTransitions: [],
        partnerWaitsFor: 'WAITS for payment processing and transfer',
        systemCanUpdate: false,
        systemTransitions: []
      },

      // Rules configuration
      rules: {
        isDocumentUploadStatus: false,
        isDocumentReviewStatus: false,
        isPaymentStatus: true,
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
            statusCard: 'Commission approved - process payment to partner',
            primaryMessage: 'Process approved commission payment',
            secondaryMessage: 'Commission approved - ready for payment processing',
            dashboardTitle: 'Commission Approved',
            dashboardSubtitle: 'Process Payment',
            listViewStatus: 'Payment Processing',
            heroCardTitle: 'Commission Approved',
            heroCardSubtitle: 'Process Payment',
            heroCardDescription: 'Commission approved and ready for payment',
            timelineTitle: 'Commission Approved',
            timelineDescription: 'Commission approved for payment processing',
            actionButtonText: 'Process Payment',
            actionButtonSecondary: 'Upload Transfer Receipt',
            successMessage: 'Payment processed successfully',
            errorMessage: 'Failed to process payment',
            warningMessage: 'Process payment promptly to maintain partner relationship',
            infoMessage: 'Commission approved - ready for payment transfer',
            emptyStateTitle: 'Ready for Payment',
            emptyStateDescription: 'Commission approved and ready for transfer',
            loadingMessage: 'Processing payment...',
            nextStepsTitle: 'Payment Steps',
            nextSteps: ['Initiate bank transfer', 'Upload transfer receipt', 'Mark as paid'],
            estimatedTime: '2-3 business days',
            urgencyText: 'High priority - process payment'
          },
          styling: {
            statusColor: 'blue',
            statusIcon: '💳',
            urgencyLevel: 'high',
            badgeVariant: 'info',
            progressStep: 2,
            progressTotal: 3
          }
        },
        partner: {
          allText: {
            statusCard: 'Commission approved! Payment processing in progress',
            primaryMessage: 'Great news! Commission approved for payment',
            secondaryMessage: 'Your commission has been approved and payment is being processed',
            dashboardTitle: 'Commission Approved!',
            dashboardSubtitle: 'Payment Processing',
            listViewStatus: 'Payment Processing',
            heroCardTitle: 'Commission Approved!',
            heroCardSubtitle: 'Payment Coming Soon',
            heroCardDescription: 'Your commission approved - payment being processed',
            timelineTitle: 'Commission Approved',
            timelineDescription: 'Commission approved and payment initiated',
            actionButtonText: 'View Payment Details',
            actionButtonSecondary: 'Download Invoice',
            successMessage: 'Payment details retrieved',
            errorMessage: 'Error viewing payment details',
            warningMessage: 'Payment processing - expect transfer soon',
            infoMessage: 'Payment is being processed - expect transfer within 2-3 days',
            emptyStateTitle: 'Payment Processing',
            emptyStateDescription: 'Your payment is being processed',
            loadingMessage: 'Loading payment details...',
            nextStepsTitle: 'Payment Timeline',
            nextSteps: ['Payment transfer initiated', 'Transfer receipt uploaded', 'Payment completed'],
            estimatedTime: '2-3 business days',
            urgencyText: 'Payment processing - almost complete!'
          },
          styling: {
            statusColor: 'blue',
            statusIcon: '💳',
            urgencyLevel: 'medium',
            badgeVariant: 'info',
            progressStep: 2,
            progressTotal: 3
          }
        }
      },

      // Actions configuration
      actions: {
        admin: [{
          id: 'process_payment',
          label: 'Process Payment',
          type: 'primary',
          icon: 'CreditCard',
          behavior: 'showModal',
          target: 'PaymentProcessingModal',
          requiresConfirmation: true
        }, {
          id: 'upload_receipt',
          label: 'Upload Transfer Receipt',
          type: 'secondary',
          icon: 'Upload',
          behavior: 'upload',
          target: 'ReceiptUploadModal',
          requiresConfirmation: false
        }],
        partner: [{
          id: 'view_payment_status',
          label: 'View Payment Status',
          type: 'primary',
          icon: 'Eye',
          behavior: 'showModal',
          target: 'PaymentStatusModal',
          requiresConfirmation: false
        }]
      },

      // Behavior configuration
      behavior: {
        onEntry: ['expandTimelineSection', 'highlightPaymentProcessing'],
        onExit: ['finalizePayment'],
        onAction: 'showPaymentModal',
        modalToShow: 'PaymentProcessingModal',
        redirectAfterAction: false,
        waitingForActor: 'Admin',
        notificationTriggers: ['paymentProcessing', 'transferRequired'],
        auditEvents: ['commission.approved', 'payment.processing_started']
      },

      // Documents configuration
      documents: {
        required: ['bank_transfer_receipt', 'payment_confirmation'],
        optional: ['transaction_details'],
        autoGenerate: ['payment_invoice'],
        hideUpload: false,
        reviewRequired: true,
        bulkUpload: false,
        allowedTypes: ['pdf', 'jpg', 'png'],
        maxSize: 10,
        downloadable: true
      },

      // Validation configuration
      validation: {
        onEntry: ['commission_approved'],
        onExit: ['payment_confirmed'],
        requiredFields: ['payment_method', 'transfer_amount'],
        businessRules: ['payment_amount_matches_commission', 'bank_details_valid'],
        dependencies: ['commission_approved'],
        blockers: []
      },

      version: "1.0.0",
      lastUpdated: "2025-08-31",
      description: "Commission approved - processing payment transfer"
    },

    // ===== COMMISSION_PAID =====
    commission_paid: {
      // Authority matrix
      authority: {
        setBy: 'Admin',
        setTrigger: 'Admin confirms commission payment completed',
        adminCanUpdate: false,
        adminTransitions: [],
        partnerCanUpdate: false,
        partnerTransitions: [],
        partnerWaitsFor: 'COMPLETE - Commission paid successfully',
        systemCanUpdate: false,
        systemTransitions: []
      },

      // Rules configuration
      rules: {
        isDocumentUploadStatus: false,
        isDocumentReviewStatus: false,
        isPaymentStatus: true,
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
            statusCard: 'Commission paid successfully - application cycle complete',
            primaryMessage: 'Commission paid - full application cycle complete',
            secondaryMessage: 'Partner commission paid - application successfully completed',
            dashboardTitle: 'Commission Paid',
            dashboardSubtitle: 'Cycle Complete',
            listViewStatus: 'Commission Paid',
            heroCardTitle: 'Commission Paid Successfully!',
            heroCardSubtitle: 'Application Complete',
            heroCardDescription: 'Full application cycle completed successfully',
            timelineTitle: 'Commission Paid',
            timelineDescription: 'Commission payment completed successfully',
            actionButtonText: 'View Summary',
            actionButtonSecondary: 'Archive Application',
            successMessage: 'Application summary retrieved',
            errorMessage: 'Error viewing summary',
            warningMessage: 'Application cycle successfully completed',
            infoMessage: 'Full application cycle from submission to commission complete',
            emptyStateTitle: 'Cycle Complete',
            emptyStateDescription: 'Application successfully completed end-to-end',
            loadingMessage: 'Loading application summary...',
            nextStepsTitle: 'Application Complete',
            nextSteps: ['Archive successful application', 'Update partner metrics', 'Prepare success report'],
            estimatedTime: 'Complete',
            urgencyText: 'Success! Application cycle complete'
          },
          styling: {
            statusColor: 'green',
            statusIcon: '🏆',
            urgencyLevel: 'low',
            badgeVariant: 'success',
            progressStep: 3,
            progressTotal: 3
          }
        },
        partner: {
          allText: {
            statusCard: 'Commission paid! Application successfully completed',
            primaryMessage: 'Success! Commission received - application complete',
            secondaryMessage: 'Commission payment received - full cycle completed successfully',
            dashboardTitle: 'Commission Received!',
            dashboardSubtitle: 'Application Complete',
            listViewStatus: 'Commission Paid',
            heroCardTitle: 'Success! Commission Received!',
            heroCardSubtitle: 'Application Complete',
            heroCardDescription: 'Commission received - student successfully enrolled',
            timelineTitle: 'Commission Received',
            timelineDescription: 'Commission payment received successfully',
            actionButtonText: 'View Receipt',
            actionButtonSecondary: 'Celebrate Success',
            successMessage: 'Payment receipt retrieved',
            errorMessage: 'Error viewing receipt',
            warningMessage: 'Congratulations on successful completion',
            infoMessage: 'Great work! Student enrolled and commission received',
            emptyStateTitle: 'Mission Accomplished!',
            emptyStateDescription: 'Student enrolled successfully - commission received',
            loadingMessage: 'Loading payment receipt...',
            nextStepsTitle: 'Congratulations!',
            nextSteps: ['Student successfully enrolled', 'Commission received', 'Ready for next application'],
            estimatedTime: 'Complete',
            urgencyText: 'Success! Mission accomplished!'
          },
          styling: {
            statusColor: 'green',
            statusIcon: '🏆',
            urgencyLevel: 'low',
            badgeVariant: 'success',
            progressStep: 3,
            progressTotal: 3
          }
        }
      },

      // Actions configuration
      actions: {
        admin: [{
          id: 'view_payment_summary',
          label: 'View Payment Summary',
          type: 'primary',
          icon: 'FileText',
          behavior: 'showModal',
          target: 'PaymentSummaryModal',
          requiresConfirmation: false
        }, {
          id: 'archive_application',
          label: 'Archive Application',
          type: 'secondary',
          icon: 'Archive',
          behavior: 'showModal',
          target: 'ArchiveModal',
          requiresConfirmation: true
        }],
        partner: [{
          id: 'view_receipt',
          label: 'View Payment Receipt',
          type: 'primary',
          icon: 'Receipt',
          behavior: 'showModal',
          target: 'PaymentReceiptModal',
          requiresConfirmation: false
        }, {
          id: 'celebrate_success',
          label: 'Celebrate Success',
          type: 'secondary',
          icon: 'Party',
          behavior: 'showModal',
          target: 'CelebrationModal',
          requiresConfirmation: false
        }]
      },

      // Behavior configuration
      behavior: {
        onEntry: ['expandTimelineSection', 'showSuccessIndicators', 'celebrateCompletion'],
        onExit: ['archiveApplication'],
        onAction: 'showSuccessModal',
        modalToShow: 'SuccessModal',
        redirectAfterAction: false,
        waitingForActor: 'Admin',
        notificationTriggers: ['paymentCompleted', 'applicationSuccess'],
        auditEvents: ['commission.paid', 'application.completed']
      },

      // Documents configuration
      documents: {
        required: ['payment_receipt', 'commission_invoice'],
        optional: ['success_certificate'],
        autoGenerate: ['completion_report'],
        hideUpload: true,
        reviewRequired: false,
        bulkUpload: false,
        allowedTypes: ['pdf'],
        maxSize: 5,
        downloadable: true
      },

      // Validation configuration
      validation: {
        onEntry: ['payment_completed'],
        onExit: ['application_archived'],
        requiredFields: ['payment_date', 'receipt_number'],
        businessRules: ['payment_verified', 'application_complete'],
        dependencies: ['commission_approved'],
        blockers: []
      },

      version: "1.0.0",
      lastUpdated: "2025-08-31",
      description: "Commission payment completed - application cycle successful"
    },

    // ===== COMMISSION_DISPUTED =====
    commission_disputed: {
      // Authority matrix
      authority: {
        setBy: 'Partner',
        setTrigger: 'Partner disputes commission amount or payment',
        adminCanUpdate: true,
        adminTransitions: ['commission_approved', 'commission_paid'],
        partnerCanUpdate: true,
        partnerTransitions: ['commission_approved'],
        partnerWaitsFor: 'WAITS for dispute resolution',
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
            statusCard: 'Commission disputed - investigate and resolve urgently',
            primaryMessage: 'Investigate commission dispute and resolve',
            secondaryMessage: 'Partner disputed commission - urgent resolution needed',
            dashboardTitle: 'Commission Disputed',
            dashboardSubtitle: 'Urgent Resolution',
            listViewStatus: 'Disputed',
            heroCardTitle: 'Commission Disputed',
            heroCardSubtitle: 'Urgent Investigation',
            heroCardDescription: 'Partner disputed commission - investigate urgently',
            timelineTitle: 'Commission Disputed',
            timelineDescription: 'Partner raised dispute about commission',
            actionButtonText: 'Investigate Dispute',
            actionButtonSecondary: 'Contact Partner',
            successMessage: 'Dispute investigation started',
            errorMessage: 'Failed to investigate dispute',
            warningMessage: 'Urgent action required - partner dispute',
            infoMessage: 'Review dispute details and work with partner on resolution',
            emptyStateTitle: 'Dispute Investigation',
            emptyStateDescription: 'Investigation needed to resolve dispute',
            loadingMessage: 'Starting dispute investigation...',
            nextStepsTitle: 'Resolution Steps',
            nextSteps: ['Review dispute details', 'Investigate commission calculation', 'Work with partner on resolution'],
            estimatedTime: '2-5 business days',
            urgencyText: 'Urgent - resolve partner dispute'
          },
          styling: {
            statusColor: 'red',
            statusIcon: '⚠️',
            urgencyLevel: 'high',
            badgeVariant: 'error',
            progressStep: 2,
            progressTotal: 3
          }
        },
        partner: {
          allText: {
            statusCard: 'Commission dispute submitted - awaiting admin resolution',
            primaryMessage: 'Dispute submitted - admin investigating',
            secondaryMessage: 'Your commission dispute is being investigated',
            dashboardTitle: 'Dispute Submitted',
            dashboardSubtitle: 'Under Investigation',
            listViewStatus: 'Dispute Investigation',
            heroCardTitle: 'Dispute Under Investigation',
            heroCardSubtitle: 'Resolution in Progress',
            heroCardDescription: 'Your commission dispute is being investigated',
            timelineTitle: 'Dispute Submitted',
            timelineDescription: 'Commission dispute submitted for investigation',
            actionButtonText: 'View Dispute Status',
            actionButtonSecondary: 'Add Details',
            successMessage: 'Dispute status updated',
            errorMessage: 'Error viewing dispute status',
            warningMessage: 'Dispute being investigated - please wait',
            infoMessage: 'Admin is investigating your commission dispute',
            emptyStateTitle: 'Under Investigation',
            emptyStateDescription: 'Admin is working to resolve your dispute',
            loadingMessage: 'Loading dispute status...',
            nextStepsTitle: 'Resolution Process',
            nextSteps: ['Admin reviews dispute', 'Investigation completed', 'Resolution provided'],
            estimatedTime: '2-5 business days',
            urgencyText: 'Investigation in progress'
          },
          styling: {
            statusColor: 'red',
            statusIcon: '⚠️',
            urgencyLevel: 'high',
            badgeVariant: 'error',
            progressStep: 2,
            progressTotal: 3
          }
        }
      },

      // Actions configuration
      actions: {
        admin: [{
          id: 'investigate_dispute',
          label: 'Investigate Dispute',
          type: 'primary',
          icon: 'Search',
          behavior: 'showModal',
          target: 'DisputeInvestigationModal',
          requiresConfirmation: false
        }, {
          id: 'contact_partner',
          label: 'Contact Partner',
          type: 'secondary',
          icon: 'Phone',
          behavior: 'showModal',
          target: 'ContactPartnerModal',
          requiresConfirmation: false
        }, {
          id: 'resolve_dispute',
          label: 'Resolve Dispute',
          type: 'primary',
          icon: 'CheckCircle',
          behavior: 'showModal',
          target: 'DisputeResolutionModal',
          requiresConfirmation: true
        }],
        partner: [{
          id: 'view_dispute_status',
          label: 'View Dispute Status',
          type: 'primary',
          icon: 'Eye',
          behavior: 'showModal',
          target: 'DisputeStatusModal',
          requiresConfirmation: false
        }, {
          id: 'add_dispute_details',
          label: 'Add Details',
          type: 'secondary',
          icon: 'Plus',
          behavior: 'showModal',
          target: 'DisputeDetailsModal',
          requiresConfirmation: false
        }]
      },

      // Behavior configuration
      behavior: {
        onEntry: ['expandTimelineSection', 'highlightUrgentAction', 'notifyDispute'],
        onExit: ['finalizeResolution'],
        onAction: 'showDisputeModal',
        modalToShow: 'DisputeResolutionModal',
        redirectAfterAction: false,
        waitingForActor: 'Admin',
        notificationTriggers: ['disputeRaised', 'urgentResolution'],
        auditEvents: ['commission.disputed', 'dispute.investigation_started']
      },

      // Documents configuration
      documents: {
        required: ['dispute_details', 'commission_calculation'],
        optional: ['supporting_evidence', 'partner_correspondence'],
        autoGenerate: ['dispute_report'],
        hideUpload: false,
        reviewRequired: true,
        bulkUpload: true,
        allowedTypes: ['pdf', 'jpg', 'png', 'xlsx'],
        maxSize: 15,
        downloadable: true
      },

      // Validation configuration
      validation: {
        onEntry: ['dispute_reason_provided'],
        onExit: ['dispute_resolved'],
        requiredFields: ['dispute_reason', 'dispute_details'],
        businessRules: ['dispute_valid', 'investigation_complete'],
        dependencies: ['commission_pending'],
        blockers: ['payment_on_hold']
      },

      version: "1.0.0",
      lastUpdated: "2025-08-31",
      description: "Commission disputed - investigation and resolution required"
    }
  },
  
  // Required StageConfig properties
  defaultTransitions: [],
  stageCompletionStatus: 'commission_paid',
  version: '1.0.0',
  lastUpdated: '2025-08-31'
};

export default STAGE_5_CONFIG;