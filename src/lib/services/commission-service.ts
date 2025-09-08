/**
 * Commission Service
 * 
 * Handles commission calculation, tracking, and payment processing
 * for the UniBexs MVP workflow system.
 */

import { 
  Application, 
  Commission, 
  CommissionTracking, 
  Student, 
  Partner, 
  ProgramInfo 
} from '@/types';
import { StorageService } from '@/lib/data/storage';

export interface CommissionCalculationResult {
  baseCommission: number;
  bonusCommission: number;
  totalCommission: number;
  partnerTier: string;
  calculationDetails: {
    tuitionFee: number;
    commissionPercentage: number;
    tierMultiplier: number;
    bonusReason?: string;
  };
}

export class CommissionService {
  
  /**
   * Calculate commission for an application
   */
  static calculateCommission(
    application: Application,
    programInfo?: ProgramInfo,
    partner?: Partner
  ): CommissionCalculationResult {
    
    // Get program info if not provided
    if (!programInfo && application.programInfoId) {
      programInfo = StorageService.getProgramInfo(application.programInfoId);
    }
    
    // Get partner if not provided
    if (!partner) {
      partner = StorageService.getPartner(application.partnerId);
    }
    
    if (!programInfo || !partner) {
      throw new Error('Missing program info or partner data for commission calculation');
    }
    
    const tuitionFee = programInfo.tuitionFee || application.tuitionFee || 0;
    const commissionPercentage = programInfo.commissionPercentage || application.commissionPercentage || 10;
    
    // Base commission calculation
    const baseCommission = (tuitionFee * commissionPercentage) / 100;
    
    // Tier-based multipliers
    const tierMultipliers = {
      'bronze': 1.0,
      'silver': 1.1,
      'gold': 1.2,
      'platinum': 1.3,
    };
    
    const tierMultiplier = tierMultipliers[partner.tier] || 1.0;
    
    // Bonus commission for high-performing partners
    let bonusCommission = 0;
    let bonusReason: string | undefined;
    
    if (partner.averageConversionRate > 85) {
      bonusCommission = baseCommission * 0.05; // 5% bonus
      bonusReason = 'High conversion rate bonus (>85%)';
    } else if (partner.averageConversionRate > 80) {
      bonusCommission = baseCommission * 0.025; // 2.5% bonus
      bonusReason = 'Good conversion rate bonus (>80%)';
    }
    
    // Apply tier multiplier to base commission
    const adjustedBaseCommission = baseCommission * tierMultiplier;
    const totalCommission = adjustedBaseCommission + bonusCommission;
    
    return {
      baseCommission: adjustedBaseCommission,
      bonusCommission,
      totalCommission,
      partnerTier: partner.tier,
      calculationDetails: {
        tuitionFee,
        commissionPercentage,
        tierMultiplier,
        bonusReason,
      },
    };
  }
  
  /**
   * Create commission tracking record when student enrolls
   */
  static createCommissionTracking(
    application: Application,
    enrollmentDate: string
  ): CommissionTracking {
    
    const partner = StorageService.getPartner(application.partnerId);
    const programInfo = application.programInfoId 
      ? StorageService.getProgramInfo(application.programInfoId)
      : null;
    
    if (!partner) {
      throw new Error('Partner not found for commission tracking');
    }
    
    const calculation = this.calculateCommission(application, programInfo || undefined, partner);
    
    const commissionTracking: CommissionTracking = {
      id: this.generateCommissionId(),
      applicationId: application.id,
      partnerId: application.partnerId,
      trackingNumber: application.trackingNumber,
      
      // Program Information
      programInfoId: application.programInfoId,
      programUrl: programInfo?.programUrl,
      programName: application.program,
      universityName: application.university,
      
      // Financial Details
      tuitionAmount: programInfo?.tuitionFee || application.tuitionFee || 0,
      commissionPercentage: calculation.calculationDetails.commissionPercentage,
      commissionAmount: calculation.totalCommission,
      currency: programInfo?.currency || application.currency || 'USD',
      
      // Commission Status Lifecycle
      commissionStatus: 'pending',
      
      // Timeline Tracking
      createdAt: new Date().toISOString(),
      earnedAt: enrollmentDate,
      
      // Verification & Compliance
      enrollmentVerified: true,
      enrollmentVerificationDate: enrollmentDate.split('T')[0],
      studentAttendanceConfirmed: false, // Will be confirmed later
      
      // Performance & Analytics
      daysToEarn: this.calculateDaysFromSubmission(application.submittedAt, enrollmentDate),
      partnerTierAtEarning: partner.tier,
      bonusCommission: calculation.bonusCommission,
      totalCommission: calculation.totalCommission,
      
      updatedAt: new Date().toISOString(),
    };
    
    // Save to storage
    StorageService.saveCommissionTracking(commissionTracking);
    
    // Update application commission status
    const updatedApplication = {
      ...application,
      commissionStatus: 'earned' as any,
      commissionEarnedAt: enrollmentDate,
    };
    StorageService.updateApplication(updatedApplication);
    
    return commissionTracking;
  }
  
  /**
   * Approve commission for payment
   */
  static approveCommission(
    commissionId: string,
    adminId: string,
    approvalNotes?: string
  ): CommissionTracking {
    
    const commissions = StorageService.getCommissionTracking();
    const commission = commissions.find(c => c.id === commissionId);
    
    if (!commission) {
      throw new Error('Commission tracking record not found');
    }
    
    if (commission.commissionStatus !== 'pending') {
      throw new Error('Commission is not in pending status');
    }
    
    const updatedCommission: CommissionTracking = {
      ...commission,
      commissionStatus: 'approved',
      approvedAt: new Date().toISOString(),
      approvedBy: adminId,
      approvalNotes: approvalNotes || 'Commission approved for payment',
      updatedAt: new Date().toISOString(),
    };
    
    StorageService.saveCommissionTracking(updatedCommission);
    
    // Update application status
    const application = StorageService.getApplication(commission.applicationId);
    if (application) {
      const updatedApplication = {
        ...application,
        commissionStatus: 'approved' as any,
      };
      StorageService.updateApplication(updatedApplication);
    }
    
    return updatedCommission;
  }
  
  /**
   * Mark commission as paid
   */
  static markCommissionPaid(
    commissionId: string,
    adminId: string,
    paymentDetails: {
      paymentMethod: string;
      paymentReference: string;
      paymentNotes?: string;
    }
  ): CommissionTracking {
    
    const commissions = StorageService.getCommissionTracking();
    const commission = commissions.find(c => c.id === commissionId);
    
    if (!commission) {
      throw new Error('Commission tracking record not found');
    }
    
    if (commission.commissionStatus !== 'approved') {
      throw new Error('Commission is not in approved status');
    }
    
    const updatedCommission: CommissionTracking = {
      ...commission,
      commissionStatus: 'paid',
      paidAt: new Date().toISOString(),
      paymentMethod: paymentDetails.paymentMethod,
      paymentReference: paymentDetails.paymentReference,
      approvalNotes: paymentDetails.paymentNotes,
      updatedAt: new Date().toISOString(),
    };
    
    StorageService.saveCommissionTracking(updatedCommission);
    
    // Update application status
    const application = StorageService.getApplication(commission.applicationId);
    if (application) {
      const updatedApplication = {
        ...application,
        commissionStatus: 'paid' as any,
        commissionPaidAt: updatedCommission.paidAt,
      };
      StorageService.updateApplication(updatedApplication);
    }
    
    // Update partner metrics
    this.updatePartnerCommissionMetrics(commission.partnerId, updatedCommission);
    
    return updatedCommission;
  }
  
  /**
   * Dispute commission
   */
  static disputeCommission(
    commissionId: string,
    disputeReason: string
  ): CommissionTracking {
    
    const commissions = StorageService.getCommissionTracking();
    const commission = commissions.find(c => c.id === commissionId);
    
    if (!commission) {
      throw new Error('Commission tracking record not found');
    }
    
    const updatedCommission: CommissionTracking = {
      ...commission,
      commissionStatus: 'disputed',
      disputeReason,
      updatedAt: new Date().toISOString(),
    };
    
    StorageService.saveCommissionTracking(updatedCommission);
    
    // Update application status
    const application = StorageService.getApplication(commission.applicationId);
    if (application) {
      const updatedApplication = {
        ...application,
        commissionStatus: 'disputed' as any,
      };
      StorageService.updateApplication(updatedApplication);
    }
    
    return updatedCommission;
  }
  
  /**
   * Get commission summary for partner
   */
  static getPartnerCommissionSummary(partnerId: string) {
    const commissions = StorageService.getCommissionTracking(partnerId);
    const currentMonth = new Date();
    currentMonth.setDate(1);
    currentMonth.setHours(0, 0, 0, 0);
    
    const totalEarned = commissions
      .filter(c => c.commissionStatus === 'paid')
      .reduce((sum, c) => sum + c.commissionAmount, 0);
    
    const pendingReview = commissions
      .filter(c => c.commissionStatus === 'pending')
      .reduce((sum, c) => sum + c.commissionAmount, 0);
    
    const awaitingPayment = commissions
      .filter(c => c.commissionStatus === 'approved')
      .reduce((sum, c) => sum + c.commissionAmount, 0);
    
    const thisMonth = commissions
      .filter(c => 
        c.commissionStatus === 'paid' && 
        c.paidAt && 
        new Date(c.paidAt) >= currentMonth
      )
      .reduce((sum, c) => sum + c.commissionAmount, 0);
    
    const totalStudents = new Set(commissions.map(c => 
      StorageService.getApplication(c.applicationId)?.studentId
    )).size;
    
    return {
      totalEarned,
      pendingReview,
      awaitingPayment,
      thisMonth,
      totalStudents,
      totalCommissions: commissions.length,
    };
  }
  
  /**
   * Get commission pipeline statistics
   */
  static getCommissionPipelineStats() {
    const commissions = StorageService.getCommissionTracking();
    const now = new Date();
    
    const pending = commissions.filter(c => c.commissionStatus === 'pending');
    const approved = commissions.filter(c => c.commissionStatus === 'approved');
    const paid = commissions.filter(c => c.commissionStatus === 'paid');
    
    const currentMonth = new Date();
    currentMonth.setDate(1);
    currentMonth.setHours(0, 0, 0, 0);
    
    return {
      pending: {
        count: pending.length,
        totalAmount: pending.reduce((sum, c) => sum + c.commissionAmount, 0),
        oldestDays: pending.length > 0 
          ? Math.max(...pending.map(c => 
              Math.floor((now.getTime() - new Date(c.createdAt).getTime()) / (1000 * 60 * 60 * 24))
            ))
          : 0,
      },
      approved: {
        count: approved.length,
        totalAmount: approved.reduce((sum, c) => sum + c.commissionAmount, 0),
        averageDaysToApprove: approved.length > 0
          ? approved
              .filter(c => c.approvedAt)
              .reduce((sum, c) => {
                const days = Math.floor(
                  (new Date(c.approvedAt!).getTime() - new Date(c.createdAt).getTime()) / (1000 * 60 * 60 * 24)
                );
                return sum + days;
              }, 0) / approved.length
          : 0,
      },
      paid: {
        count: paid.length,
        totalAmount: paid.reduce((sum, c) => sum + c.commissionAmount, 0),
        thisMonth: paid
          .filter(c => c.paidAt && new Date(c.paidAt) >= currentMonth)
          .reduce((sum, c) => sum + c.commissionAmount, 0),
      },
    };
  }
  
  // Private helper methods
  
  private static generateCommissionId(): string {
    return 'comm-' + Date.now().toString(36) + '-' + Math.random().toString(36).substr(2, 5);
  }
  
  private static calculateDaysFromSubmission(submittedAt?: string, enrollmentDate?: string): number {
    if (!submittedAt || !enrollmentDate) return 0;
    
    const submitted = new Date(submittedAt);
    const enrolled = new Date(enrollmentDate);
    
    return Math.floor((enrolled.getTime() - submitted.getTime()) / (1000 * 60 * 60 * 24));
  }
  
  private static updatePartnerCommissionMetrics(partnerId: string, commission: CommissionTracking): void {
    const partner = StorageService.getPartner(partnerId);
    if (!partner) return;
    
    const updatedPartner = {
      ...partner,
      totalCommissionEarned: partner.totalCommissionEarned + commission.commissionAmount,
      commissionPending: Math.max(0, partner.commissionPending - commission.commissionAmount),
      updatedAt: new Date().toISOString(),
    };
    
    StorageService.savePartner(updatedPartner);
  }
}

// Workflow integration functions

/**
 * Trigger commission creation when student enrollment is confirmed
 */
export const triggerCommissionCreation = (application: Application): CommissionTracking | null => {
  try {
    // Only create commission if we're moving to stage 5 and enrollment is confirmed
    if (application.currentStage === 5 && application.currentStatus === 'enrollment_confirmed') {
      const enrollmentDate = new Date().toISOString();
      return CommissionService.createCommissionTracking(application, enrollmentDate);
    }
    return null;
  } catch (error) {
    console.error('Failed to trigger commission creation:', error);
    return null;
  }
};

/**
 * Auto-transition application to Stage 5 when enrollment is confirmed
 */
export const transitionToCommissionStage = (application: Application): Application => {
  if (application.currentStage === 4 && application.currentStatus === 'enrollment_confirmed') {
    const updatedApplication = {
      ...application,
      currentStage: 5 as const,
      currentStatus: 'commission_pending',
      statusChangeCount: application.statusChangeCount + 1,
      lastStatusChangeAt: new Date().toISOString(),
      stageCompletionDates: {
        ...application.stageCompletionDates,
        '4': new Date().toISOString(),
      },
    };
    
    // Create commission tracking
    triggerCommissionCreation(updatedApplication);
    
    return updatedApplication;
  }
  
  return application;
};