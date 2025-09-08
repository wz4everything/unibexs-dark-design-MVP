/**
 * Complete Workflow Configuration
 * 
 * This file combines all stage configurations into a single
 * workflow configuration that the WorkflowEngine can use.
 * 
 * NO MORE HARDCODED LOGIC - Everything is configuration-driven!
 */

import { WorkflowConfiguration } from './stages/types';
import STAGE_1_CONFIG from './stages/stage-1-config';
import STAGE_2_CONFIG from './stages/stage-2-config';
import STAGE_3_CONFIG from './stages/stage-3-config';
import STAGE_4_CONFIG from './stages/stage-4-config';
import STAGE_5_CONFIG from './stages/stage-5-config';

export const COMPLETE_WORKFLOW_CONFIG: WorkflowConfiguration = {
  stages: {
    1: STAGE_1_CONFIG,
    2: STAGE_2_CONFIG,
    3: STAGE_3_CONFIG,
    4: STAGE_4_CONFIG,
    5: STAGE_5_CONFIG,
  },
  
  globalSettings: {
    timeoutDays: 30,
    maxRetries: 3,
    notificationSettings: {
      emailEnabled: true,
      smsEnabled: false,
      pushEnabled: true,
      reminderInterval: 24, // hours
      escalationInterval: 72 // hours
    },
    auditSettings: {
      logAllActions: true,
      retentionDays: 365,
      sensitiveFieldsEncrypted: true,
      auditTrailEnabled: true
    }
  },
  
  version: "3.0.0",
  lastUpdated: "2025-08-31"
};

export default COMPLETE_WORKFLOW_CONFIG;