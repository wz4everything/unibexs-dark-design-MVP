/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * System Triggers for Automatic Workflow Status Changes
 * 
 * Based on PDF Workflow Matrix - Stage 1 System Actor Events
 * Handles automatic status transitions that should be triggered by system events
 */

import { Application } from '@/types';
import { StorageService } from '@/lib/data/storage';

export interface SystemTriggerEvent {
  type: 'application_submitted' | 'documents_uploaded' | 'admin_decision' | 'stage_completed';
  applicationId: string;
  data?: Record<string, unknown>;
  triggeredBy: string;
  timestamp: string;
}

export interface TriggerResult {
  success: boolean;
  previousStatus: string;
  newStatus: string;
  message: string;
  triggeredAt: string;
}

export class SystemTriggers {
  /**
   * Stage 1 System Triggers based on PDF Matrix
   */

  /**
   * Trigger: Partner submits application
   * Event: application_submitted
   * Action: Set status to "new_application"
   */
  static onApplicationSubmitted(applicationId: string, _triggeredBy: string): TriggerResult {
    const application = StorageService.getApplication(applicationId);
    if (!application) {
      return {
        success: false,
        previousStatus: '',
        newStatus: '',
        message: 'Application not found',
        triggeredAt: new Date().toISOString()
      };
    }

    const previousStatus = application.currentStatus;
    
    // Only trigger if coming from draft or initial state
    if (previousStatus !== 'draft' && previousStatus !== '') {
      return {
        success: false,
        previousStatus,
        newStatus: '',
        message: 'Application already submitted',
        triggeredAt: new Date().toISOString()
      };
    }

    // System sets to "new_application"
    const updatedApp = {
      ...application,
      currentStatus: 'new_application',
      nextAction: 'Change status to Under Review by Admin',
      nextActor: 'Admin' as const,
      updatedAt: new Date().toISOString(),
      stageHistory: [
        ...(application.stageHistory || []),
        {
          stage: 1,
          status: 'new_application',
          timestamp: new Date().toISOString(),
          actor: 'System',
          reason: 'Application submitted by partner'
        }
      ]
    };

    StorageService.updateApplication(updatedApp);

    // Emit event for UI updates
    this.emitStatusChange(applicationId, previousStatus, 'new_application', 'System');

    return {
      success: true,
      previousStatus,
      newStatus: 'new_application',
      message: 'Application automatically set to new_application by System',
      triggeredAt: updatedApp.updatedAt
    };
  }

  /**
   * Trigger: Partner uploads some but not all requested documents
   * Event: documents_uploaded (partial)
   * Action: Set status to "documents_partially_submitted"
   */
  static onPartialDocumentsUploaded(applicationId: string, _triggeredBy: string): TriggerResult {
    const application = StorageService.getApplication(applicationId);
    if (!application) {
      return {
        success: false,
        previousStatus: '',
        newStatus: '',
        message: 'Application not found',
        triggeredAt: new Date().toISOString()
      };
    }

    const previousStatus = application.currentStatus;
    
    // Only trigger from correction_requested_admin or documents_resubmission_required
    if (!['correction_requested_admin', 'documents_resubmission_required'].includes(previousStatus)) {
      return {
        success: false,
        previousStatus,
        newStatus: '',
        message: 'Invalid status for partial document upload',
        triggeredAt: new Date().toISOString()
      };
    }

    const updatedApp = {
      ...application,
      currentStatus: 'documents_partially_submitted',
      nextAction: 'Upload remaining documents',
      nextActor: 'Partner' as const,
      updatedAt: new Date().toISOString(),
      stageHistory: [
        ...(application.stageHistory || []),
        {
          stage: 1,
          status: 'documents_partially_submitted',
          timestamp: new Date().toISOString(),
          actor: 'System',
          reason: 'Partner uploaded partial documents'
        }
      ]
    };

    StorageService.updateApplication(updatedApp);
    this.emitStatusChange(applicationId, previousStatus, 'documents_partially_submitted', 'System');

    return {
      success: true,
      previousStatus,
      newStatus: 'documents_partially_submitted',
      message: 'Status automatically set to documents_partially_submitted by System',
      triggeredAt: updatedApp.updatedAt
    };
  }

  /**
   * Trigger: Partner uploads all requested documents
   * Event: documents_uploaded (complete)
   * Action: Set status to "documents_submitted"
   */
  static onAllDocumentsUploaded(applicationId: string, _triggeredBy: string): TriggerResult {
    const application = StorageService.getApplication(applicationId);
    if (!application) {
      return {
        success: false,
        previousStatus: '',
        newStatus: '',
        message: 'Application not found',
        triggeredAt: new Date().toISOString()
      };
    }

    const previousStatus = application.currentStatus;
    
    // Can trigger from correction_requested_admin, documents_partially_submitted, or documents_resubmission_required
    const validPreviousStatuses = [
      'correction_requested_admin',
      'documents_partially_submitted', 
      'documents_resubmission_required'
    ];
    
    if (!validPreviousStatuses.includes(previousStatus)) {
      return {
        success: false,
        previousStatus,
        newStatus: '',
        message: 'Invalid status for complete document upload',
        triggeredAt: new Date().toISOString()
      };
    }

    const updatedApp = {
      ...application,
      currentStatus: 'documents_submitted',
      nextAction: 'Admin to start document review',
      nextActor: 'Admin' as const,
      updatedAt: new Date().toISOString(),
      stageHistory: [
        ...(application.stageHistory || []),
        {
          stage: 1,
          status: 'documents_submitted',
          timestamp: new Date().toISOString(),
          actor: 'System',
          reason: 'Partner uploaded all requested documents'
        }
      ]
    };

    StorageService.updateApplication(updatedApp);
    this.emitStatusChange(applicationId, previousStatus, 'documents_submitted', 'System');

    return {
      success: true,
      previousStatus,
      newStatus: 'documents_submitted',
      message: 'Status automatically set to documents_submitted by System',
      triggeredAt: updatedApp.updatedAt
    };
  }

  /**
   * Trigger: Admin confirms final approval for Stage 1
   * Event: admin_decision (approve)
   * Action: Set status to "approved_stage1"
   */
  static onStage1FinalApproval(applicationId: string, _triggeredBy: string): TriggerResult {
    const application = StorageService.getApplication(applicationId);
    if (!application) {
      return {
        success: false,
        previousStatus: '',
        newStatus: '',
        message: 'Application not found',
        triggeredAt: new Date().toISOString()
      };
    }

    const previousStatus = application.currentStatus;
    
    // Can only trigger from documents_approved
    if (previousStatus !== 'documents_approved') {
      return {
        success: false,
        previousStatus,
        newStatus: '',
        message: 'Can only approve Stage 1 from documents_approved status',
        triggeredAt: new Date().toISOString()
      };
    }

    const updatedApp = {
      ...application,
      currentStatus: 'approved_stage1',
      nextAction: 'Prepare & submit to University',
      nextActor: 'Admin' as const,
      updatedAt: new Date().toISOString(),
      stageHistory: [
        ...(application.stageHistory || []),
        {
          stage: 1,
          status: 'approved_stage1',
          timestamp: new Date().toISOString(),
          actor: 'System',
          reason: 'Stage 1 approved by admin - ready for university'
        }
      ]
    };

    StorageService.updateApplication(updatedApp);
    this.emitStatusChange(applicationId, previousStatus, 'approved_stage1', 'System');

    return {
      success: true,
      previousStatus,
      newStatus: 'approved_stage1',
      message: 'Status automatically set to approved_stage1 by System',
      triggeredAt: updatedApp.updatedAt
    };
  }

  /**
   * Trigger: Admin makes final rejection decision
   * Event: admin_decision (reject)
   * Action: Set status to "rejected_stage1"
   */
  static onStage1FinalRejection(applicationId: string, triggeredBy: string, reason?: string): TriggerResult {
    const application = StorageService.getApplication(applicationId);
    if (!application) {
      return {
        success: false,
        previousStatus: '',
        newStatus: '',
        message: 'Application not found',
        triggeredAt: new Date().toISOString()
      };
    }

    const previousStatus = application.currentStatus;
    
    // Can trigger from multiple admin review statuses
    const validPreviousStatuses = [
      'new_application',
      'under_review_admin', 
      'documents_under_review',
      'documents_rejected'
    ];
    
    if (!validPreviousStatuses.includes(previousStatus)) {
      return {
        success: false,
        previousStatus,
        newStatus: '',
        message: 'Invalid status for final rejection',
        triggeredAt: new Date().toISOString()
      };
    }

    const updatedApp = {
      ...application,
      currentStatus: 'rejected_stage1',
      nextAction: 'Acknowledge rejection',
      nextActor: 'Partner' as const,
      rejectionReason: reason || 'Application rejected by admin',
      updatedAt: new Date().toISOString(),
      stageHistory: [
        ...(application.stageHistory || []),
        {
          stage: 1,
          status: 'rejected_stage1',
          timestamp: new Date().toISOString(),
          actor: 'System',
          reason: reason || 'Application rejected by admin'
        }
      ]
    };

    StorageService.updateApplication(updatedApp);
    this.emitStatusChange(applicationId, previousStatus, 'rejected_stage1', 'System');

    return {
      success: true,
      previousStatus,
      newStatus: 'rejected_stage1',
      message: 'Status automatically set to rejected_stage1 by System',
      triggeredAt: updatedApp.updatedAt
    };
  }

  /**
   * Stage 2 System Triggers
   */

  /**
   * Trigger: Admin uploads offer letter in university_approved status
   * Event: offer_letter_uploaded
   * Action: Set status to "offer_letter_issued"
   */
  static onOfferLetterUpload(applicationId: string, triggeredBy: string): TriggerResult {
    console.log('🎓 SystemTriggers.onOfferLetterUpload called:', { applicationId, triggeredBy });
    
    const application = StorageService.getApplication(applicationId);
    if (!application) {
      console.error('❌ Application not found:', applicationId);
      return {
        success: false,
        previousStatus: '',
        newStatus: '',
        message: 'Application not found',
        triggeredAt: new Date().toISOString()
      };
    }

    const previousStatus = application.currentStatus;
    console.log('📊 Current application state:', {
      id: applicationId,
      stage: application.currentStage,
      status: previousStatus,
      nextAction: application.nextAction
    });
    
    // IDEMPOTENCY CHECK: If already in Stage 3, don't process again
    if (application.currentStage === 3) {
      console.log('✅ Application already in Stage 3, transition already completed');
      return {
        success: true,
        previousStatus,
        newStatus: application.currentStatus,
        message: 'Application already transitioned to Stage 3',
        triggeredAt: new Date().toISOString()
      };
    }

    // Can only trigger from university_approved status (or allow force transitions)
    if (previousStatus !== 'university_approved' && !triggeredBy.includes('Force')) {
      console.warn('⚠️ Invalid status for offer letter upload:', previousStatus);
      return {
        success: false,
        previousStatus,
        newStatus: '',
        message: 'Can only upload offer letter from university_approved status',
        triggeredAt: new Date().toISOString()
      };
    }

    console.log('✅ Valid status - proceeding with offer letter upload transition');

    const updatedApp = {
      ...application,
      currentStatus: 'offer_letter_issued',
      nextAction: 'Begin visa processing',
      nextActor: 'Admin' as const,
      updatedAt: new Date().toISOString(),
      stageHistory: [
        ...(application.stageHistory || []),
        {
          stage: 2,
          status: 'offer_letter_issued',
          timestamp: new Date().toISOString(),
          actor: 'System',
          reason: 'Offer letter uploaded - triggering progression to Stage 3'
        }
      ]
    };

    console.log('💾 Updating application to offer_letter_issued...');
    StorageService.updateApplication(updatedApp);

    // Now transition directly to Stage 3
    console.log('🚀 Transitioning to Stage 3: waiting_visa_payment...');
    const finalApp = {
      ...updatedApp,
      currentStage: 3 as const,
      currentStatus: 'waiting_visa_payment',
      nextAction: 'Upload visa payment proof',
      nextActor: 'Partner' as const,
      updatedAt: new Date().toISOString(),
      stageHistory: [
        ...updatedApp.stageHistory,
        {
          stage: 3,
          status: 'waiting_visa_payment',
          timestamp: new Date().toISOString(),
          actor: 'System',
          reason: 'Automatic transition to Stage 3 after offer letter uploaded'
        }
      ]
    };

    console.log('💾 Final application state:', {
      id: finalApp.id,
      stage: finalApp.currentStage,
      status: finalApp.currentStatus,
      nextAction: finalApp.nextAction,
      nextActor: finalApp.nextActor
    });

    StorageService.updateApplication(finalApp);
    
    // Emit event for UI updates for both transitions
    console.log('📡 Emitting status change events...');
    this.emitStatusChange(applicationId, previousStatus, 'offer_letter_issued', 'System');
    this.emitStatusChange(applicationId, 'offer_letter_issued', 'waiting_visa_payment', 'System');

    console.log('✅ Offer letter upload and Stage 3 transition completed successfully');
    return {
      success: true,
      previousStatus,
      newStatus: 'waiting_visa_payment',
      message: 'Offer letter uploaded and automatically transitioned to Stage 3: waiting_visa_payment',
      triggeredAt: finalApp.updatedAt
    };
  }

  /**
   * Trigger: Stage 2 completion - transition to Stage 3
   * Event: stage2_completed
   * Action: Move to Stage 3 with status "waiting_visa_payment"
   */
  static onStage2Complete(applicationId: string, triggeredBy: string): TriggerResult {
    const application = StorageService.getApplication(applicationId);
    if (!application) {
      return {
        success: false,
        previousStatus: '',
        newStatus: '',
        message: 'Application not found',
        triggeredAt: new Date().toISOString()
      };
    }

    const previousStatus = application.currentStatus;
    
    // Can only trigger from offer_letter_issued status
    if (previousStatus !== 'offer_letter_issued') {
      return {
        success: false,
        previousStatus,
        newStatus: '',
        message: 'Can only transition to Stage 3 from offer_letter_issued status',
        triggeredAt: new Date().toISOString()
      };
    }

    const updatedApp = {
      ...application,
      currentStage: 3 as const,
      currentStatus: 'waiting_visa_payment',
      nextAction: 'Upload visa payment proof',
      nextActor: 'Partner' as const,
      updatedAt: new Date().toISOString(),
      stageHistory: [
        ...(application.stageHistory || []),
        {
          stage: 3,
          status: 'waiting_visa_payment',
          timestamp: new Date().toISOString(),
          actor: 'System',
          reason: 'Stage 2 completed - automatically transitioned to Stage 3'
        }
      ]
    };

    StorageService.updateApplication(updatedApp);
    this.emitStatusChange(applicationId, previousStatus, 'waiting_visa_payment', 'System');

    return {
      success: true,
      previousStatus,
      newStatus: 'waiting_visa_payment',
      message: 'Application automatically transitioned to Stage 3: waiting_visa_payment',
      triggeredAt: updatedApp.updatedAt
    };
  }

  /**
   * Trigger: University approval directly to Stage 3 (simplified workflow)
   * Event: university_approved_direct
   * Action: Skip offer letter upload, go directly to Stage 3 with waiting_visa_payment
   */
  static onUniversityApprovedDirect(applicationId: string, triggeredBy: string): TriggerResult {
    console.log('🎓 SystemTriggers.onUniversityApprovedDirect called:', { applicationId, triggeredBy });
    
    const application = StorageService.getApplication(applicationId);
    if (!application) {
      console.error('❌ Application not found:', applicationId);
      return {
        success: false,
        previousStatus: '',
        newStatus: '',
        message: 'Application not found',
        triggeredAt: new Date().toISOString()
      };
    }

    const previousStatus = application.currentStatus;
    console.log('📊 Current application state:', {
      id: applicationId,
      stage: application.currentStage,
      status: previousStatus
    });
    
    // IDEMPOTENCY CHECK: If already in Stage 3, don't process again
    if (application.currentStage === 3) {
      console.log('✅ Application already in Stage 3, transition already completed');
      return {
        success: true,
        previousStatus,
        newStatus: application.currentStatus,
        message: 'Application already transitioned to Stage 3',
        triggeredAt: new Date().toISOString()
      };
    }

    // Can only trigger from university_approved status
    if (previousStatus !== 'university_approved') {
      console.warn('⚠️ Invalid status for direct university approval:', previousStatus);
      return {
        success: false,
        previousStatus,
        newStatus: '',
        message: 'Can only directly transition from university_approved status',
        triggeredAt: new Date().toISOString()
      };
    }
    
    console.log('✅ Valid status - proceeding with direct Stage 3 transition');

    // Create offer letter document first (auto-generated)
    const offerLetterDoc = {
      id: `doc-${Date.now()}-offer-letter`,
      applicationId,
      
      // Document Classification
      stage: 2,
      documentType: 'offer_letter',
      category: 'academic' as const,
      
      // File Information
      fileName: `${applicationId}_University_Offer_Letter.pdf`,
      originalFileName: `${applicationId}_University_Offer_Letter.pdf`,
      fileSize: 524288, // 512KB placeholder
      mimeType: 'application/pdf',
      
      // Document Metadata
      isMandatory: true,
      isStageSpecific: true,
      version: 1,
      
      // Validity & Expiry
      isCertified: false,
      
      // Upload Information
      uploadedBy: triggeredBy || 'System',
      uploadMethod: 'api' as const,
      uploadedAt: new Date().toISOString(),
      
      // Review Information
      status: 'approved' as const,
      reviewedBy: 'System',
      reviewedAt: new Date().toISOString(),
      
      // External Review
      universityStatus: 'approved' as const,
      immigrationStatus: 'not_required' as const,
      
      // Timeline
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    // Store the offer letter document
    StorageService.addDocument(offerLetterDoc);
    console.log('📄 Created offer letter document:', offerLetterDoc.id);

    // Transition directly to Stage 3
    const updatedApp = {
      ...application,
      currentStage: 3 as const,
      currentStatus: 'waiting_visa_payment',
      nextAction: 'Upload visa payment proof',
      nextActor: 'Partner' as const,
      updatedAt: new Date().toISOString(),
      stageHistory: [
        ...(application.stageHistory || []),
        {
          stage: 3,
          status: 'waiting_visa_payment',
          timestamp: new Date().toISOString(),
          actor: 'System',
          reason: 'Direct transition from university_approved to Stage 3 (simplified workflow)'
        }
      ]
    };

    console.log('💾 Updating application to Stage 3...');
    StorageService.updateApplication(updatedApp);
    this.emitStatusChange(applicationId, previousStatus, 'waiting_visa_payment', 'System');

    console.log('✅ Direct university approval to Stage 3 transition completed successfully');
    return {
      success: true,
      previousStatus,
      newStatus: 'waiting_visa_payment',
      message: 'University approval directly transitioned to Stage 3: waiting_visa_payment (offer letter auto-generated)',
      triggeredAt: updatedApp.updatedAt
    };
  }

  /**
   * Trigger: Stage 3 completion - transition to Stage 4
   * Event: stage3_completed
   * Action: Move to Stage 4 with status "arrival_date_planned"
   */
  static onStage3Complete(applicationId: string, triggeredBy: string): TriggerResult {
    const application = StorageService.getApplication(applicationId);
    if (!application) {
      return {
        success: false,
        previousStatus: '',
        newStatus: '',
        message: 'Application not found',
        triggeredAt: new Date().toISOString()
      };
    }

    const previousStatus = application.currentStatus;
    
    // Can only trigger from visa_issued status
    if (previousStatus !== 'visa_issued') {
      return {
        success: false,
        previousStatus,
        newStatus: '',
        message: 'Can only transition to Stage 4 from visa_issued status',
        triggeredAt: new Date().toISOString()
      };
    }

    const updatedApp = {
      ...application,
      currentStage: 4 as const,
      currentStatus: 'arrival_date_planned',
      nextAction: 'Coordinate student arrival date and logistics',
      nextActor: 'Admin' as const,
      updatedAt: new Date().toISOString(),
      stageHistory: [
        ...(application.stageHistory || []),
        {
          stage: 4,
          status: 'arrival_date_planned',
          timestamp: new Date().toISOString(),
          actor: 'System',
          reason: 'Stage 3 completed - automatically transitioned to Stage 4'
        }
      ]
    };

    StorageService.updateApplication(updatedApp);
    this.emitStatusChange(applicationId, previousStatus, 'arrival_date_planned', 'System');

    return {
      success: true,
      previousStatus,
      newStatus: 'arrival_date_planned',
      message: 'Application automatically transitioned to Stage 4: arrival_date_planned',
      triggeredAt: updatedApp.updatedAt
    };
  }

  /**
   * Trigger: Stage 4 completion - transition to Stage 5
   * Event: stage4_completed
   * Action: Move to Stage 5 with status "commission_pending"
   */
  static onStage4Complete(applicationId: string, triggeredBy: string): TriggerResult {
    const application = StorageService.getApplication(applicationId);
    if (!application) {
      return {
        success: false,
        previousStatus: '',
        newStatus: '',
        message: 'Application not found',
        triggeredAt: new Date().toISOString()
      };
    }

    const previousStatus = application.currentStatus;
    
    // Can only trigger from enrollment_confirmed status
    if (previousStatus !== 'enrollment_confirmed') {
      return {
        success: false,
        previousStatus,
        newStatus: '',
        message: 'Can only transition to Stage 5 from enrollment_confirmed status',
        triggeredAt: new Date().toISOString()
      };
    }

    const updatedApp = {
      ...application,
      currentStage: 5 as const,
      currentStatus: 'commission_pending',
      nextAction: 'Review and approve partner commission',
      nextActor: 'Admin' as const,
      updatedAt: new Date().toISOString(),
      stageHistory: [
        ...(application.stageHistory || []),
        {
          stage: 5,
          status: 'commission_pending',
          timestamp: new Date().toISOString(),
          actor: 'System',
          reason: 'Stage 4 completed - automatically transitioned to Stage 5'
        }
      ]
    };

    StorageService.updateApplication(updatedApp);
    this.emitStatusChange(applicationId, previousStatus, 'commission_pending', 'System');

    return {
      success: true,
      previousStatus,
      newStatus: 'commission_pending',
      message: 'Application automatically transitioned to Stage 5: commission_pending',
      triggeredAt: updatedApp.updatedAt
    };
  }

  /**
   * Enhanced Document Upload Handler for Stage 2 Offer Letter
   * Checks for specific offer letter uploads and triggers appropriate workflow
   */
  static onDocumentUploadStage2(applicationId: string, documentType: string, triggeredBy: string): TriggerResult {
    const application = StorageService.getApplication(applicationId);
    if (!application) {
      return {
        success: false,
        previousStatus: '',
        newStatus: '',
        message: 'Application not found',
        triggeredAt: new Date().toISOString()
      };
    }

    // Handle offer letter upload specifically
    if (documentType === 'offer_letter' && application.currentStatus === 'university_approved') {
      return this.onOfferLetterUpload(applicationId, triggeredBy);
    }

    // Fall back to default document upload handling
    return this.onDocumentUpload(applicationId, triggeredBy);
  }

  /**
   * Helper: Check if application has all required documents uploaded
   */
  private static hasAllRequiredDocuments(applicationId: string): boolean {
    const application = StorageService.getApplication(applicationId);
    if (!application || !application.documentsRequired || application.documentsRequired.length === 0) {
      return true; // No specific documents required
    }

    const documents = StorageService.getDocuments().filter(doc => 
      doc.applicationId === applicationId && 
      doc.status === 'approved'
    );

    // Check if all required document types are present
    return application.documentsRequired.every(requiredType => 
      documents.some(doc => doc.type === requiredType)
    );
  }

  /**
   * Helper: Check if application has some but not all required documents
   */
  private static hasPartialRequiredDocuments(applicationId: string): boolean {
    const application = StorageService.getApplication(applicationId);
    if (!application || !application.documentsRequired || application.documentsRequired.length === 0) {
      return false; // No requirements to be partial about
    }

    const documents = StorageService.getDocuments().filter(doc => 
      doc.applicationId === applicationId && 
      ['pending', 'approved'].includes(doc.status)
    );

    const hasAny = documents.length > 0;
    const hasAll = application.documentsRequired.every(requiredType => 
      documents.some(doc => doc.type === requiredType)
    );

    return hasAny && !hasAll;
  }

  /**
   * Smart Document Upload Handler
   * Automatically determines if upload is partial or complete and triggers appropriate status
   */
  static onDocumentUpload(applicationId: string, _triggeredBy: string): TriggerResult {
    if (this.hasAllRequiredDocuments(applicationId)) {
      return this.onAllDocumentsUploaded(applicationId, _triggeredBy);
    } else if (this.hasPartialRequiredDocuments(applicationId)) {
      return this.onPartialDocumentsUploaded(applicationId, _triggeredBy);
    } else {
      return {
        success: false,
        previousStatus: '',
        newStatus: '',
        message: 'No valid documents uploaded',
        triggeredAt: new Date().toISOString()
      };
    }
  }

  /**
   * Helper: Emit status change event for UI updates
   */
  private static emitStatusChange(applicationId: string, previousStatus: string, newStatus: string, actor: string) {
    // Custom event for components listening to status changes
    const event = new CustomEvent('applicationStatusChanged', {
      detail: {
        applicationId,
        previousStatus,
        newStatus,
        actor,
        timestamp: new Date().toISOString(),
        source: 'SystemTrigger'
      }
    });

    if (typeof window !== 'undefined') {
      window.dispatchEvent(event);
    }
  }

  /**
   * Get trigger history for application
   */
  static getTriggerHistory(applicationId: string): Array<{
    timestamp: string;
    previousStatus: string;
    newStatus: string;
    actor: string;
    trigger: string;
  }> {
    const application = StorageService.getApplication(applicationId);
    if (!application) return [];

    return (application.stageHistory || [])
      .filter(entry => entry.actor === 'System')
      .map(entry => ({
        timestamp: entry.timestamp,
        previousStatus: '', // Would need to store this
        newStatus: entry.status,
        actor: entry.actor,
        trigger: entry.reason || 'Unknown trigger'
      }));
  }

  /**
   * Test all System triggers for an application
   */
  static testTriggers(applicationId: string): Record<string, TriggerResult> {
    return {
      // Stage 1 triggers
      applicationSubmitted: this.onApplicationSubmitted(applicationId, 'test'),
      partialDocuments: this.onPartialDocumentsUploaded(applicationId, 'test'),
      allDocuments: this.onAllDocumentsUploaded(applicationId, 'test'),
      stage1Approval: this.onStage1FinalApproval(applicationId, 'test'),
      stage1Rejection: this.onStage1FinalRejection(applicationId, 'test', 'Test rejection'),
      
      // Stage 2 triggers
      offerLetterUpload: this.onOfferLetterUpload(applicationId, 'test'),
      stage2Complete: this.onStage2Complete(applicationId, 'test'),
      documentUploadStage2: this.onDocumentUploadStage2(applicationId, 'offer_letter', 'test'),
      
      // Stage 3 triggers
      stage3Complete: this.onStage3Complete(applicationId, 'test'),
      
      // Stage 4 triggers
      stage4Complete: this.onStage4Complete(applicationId, 'test')
    };
  }
}