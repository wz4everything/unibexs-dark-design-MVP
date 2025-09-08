# UNI-301: Complete Stage 3 Workflow Configuration

## Jira Ticket Details
**Type**: Story  
**Priority**: High  
**Story Points**: 8  
**Assignee**: Backend Developer  
**Epic**: Stage 3 Visa Processing  

## Summary
Complete the Stage 3 workflow configuration in `stage-3-config.ts` to support all visa processing statuses with proper role-based permissions and transitions.

## Description
The Stage 3 configuration exists but needs completion for all visa processing statuses. This includes proper authority matrix setup, display text configuration, and status transition rules.

## Acceptance Criteria

### ✅ Configuration Completion
- [ ] All 7 Stage 3 statuses fully configured:
  - `waiting_visa_documents` 
  - `visa_documents_submitted`
  - `visa_application_in_progress`
  - `visa_interview_scheduled`
  - `visa_approved` 
  - `visa_rejected`
  - `stage3_completed`

### ✅ Authority Matrix
- [ ] Admin permissions defined for each status
- [ ] Partner permissions defined for each status  
- [ ] System-triggered transitions identified
- [ ] Available actions mapped per role per status

### ✅ Display Configuration
- [ ] Primary messages for all statuses (admin & partner views)
- [ ] Secondary messages and descriptions
- [ ] Action button text and styling
- [ ] Progress indicators and urgency levels

### ✅ Business Rules
- [ ] Required documents per status defined
- [ ] Validation rules for status transitions
- [ ] Conditional logic for visa types (study/work)
- [ ] Integration points with payment processing

## Technical Requirements

### File Updates
- `src/lib/workflow/stages/stage-3-config.ts`
- `src/lib/workflow/status-authority-matrix.ts`
- Update workflow config index to include Stage 3

### Configuration Structure
```typescript
export const stage3Config: StageConfig = {
  statuses: {
    waiting_visa_documents: {
      display: { /* admin & partner display settings */ },
      styling: { /* colors, urgency, progress */ },
      rules: { /* documents, validation, transitions */ }
    }
    // ... all other statuses
  }
}
```

## Dependencies
- Authority matrix PDF specification
- Visa processing business requirements
- Document requirements for visa applications

## Validation
- [ ] `npm run validate:quick` passes
- [ ] All status properties complete (prevents runtime errors)
- [ ] Authority matrix covers all Stage 3 statuses
- [ ] Workflow engine can load Stage 3 config without errors

## Testing Strategy
- Unit tests for config validation
- Integration tests with workflow engine
- Manual testing of all status transitions

---
**Created**: Sprint 1 Planning  
**Sprint**: 1  
**Target Completion**: Week 1 Day 3