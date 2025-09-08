# UNI-401: Complete Stage 4 Workflow Configuration

## Jira Ticket Details
**Type**: Story  
**Priority**: High  
**Story Points**: 8  
**Assignee**: Backend Developer  
**Epic**: Stage 4 Arrival Management  

## Summary
Complete the Stage 4 workflow configuration in `stage-4-config.ts` to support all arrival management statuses with proper role-based permissions and coordination workflows.

## Description
Stage 4 manages the complete student arrival process from visa approval through campus enrollment. The configuration needs to support complex coordination between universities, accommodation providers, transportation services, and immigration authorities.

## Acceptance Criteria

### ✅ Configuration Completion
- [ ] All 6 Stage 4 statuses fully configured:
  - `visa_approved_arrival_pending`
  - `travel_arrangements_in_progress`
  - `student_arrived`
  - `accommodation_check_in`
  - `enrollment_verification`
  - `stage4_completed`

### ✅ Authority Matrix
- [ ] Admin permissions for arrival coordination
- [ ] Partner permissions for student communication
- [ ] University integration points defined
- [ ] Student self-service actions (check-in confirmations)
- [ ] Third-party service integrations (accommodation, transport)

### ✅ Coordination Workflows
- [ ] Airport pickup scheduling and tracking
- [ ] Accommodation booking and check-in process
- [ ] University enrollment verification steps
- [ ] Document collection and verification
- [ ] Emergency contact and support procedures

### ✅ Business Rules Integration
- [ ] Automatic status progression based on confirmations
- [ ] Deadline management for arrival activities
- [ ] Escalation procedures for delayed arrivals
- [ ] Integration with Stage 5 (commission processing) triggers

## Technical Requirements

### File Updates
- `src/lib/workflow/stages/stage-4-config.ts`
- `src/lib/workflow/status-authority-matrix.ts`
- Integration with third-party service abstractions

### Configuration Structure
```typescript
export const stage4Config: StageConfig = {
  statuses: {
    visa_approved_arrival_pending: {
      display: {
        admin: { primaryMessage: "Coordinate student arrival logistics" },
        partner: { primaryMessage: "Support student arrival preparation" }
      },
      styling: { urgencyLevel: "high", progressPercentage: 75 },
      rules: {
        requiresDocuments: ["travel_itinerary", "accommodation_booking"],
        availableActions: ["schedule_pickup", "confirm_accommodation"],
        autoTransitions: ["arrival_confirmation_received"]
      }
    }
    // ... other statuses
  }
}
```

### Integration Points
- Travel booking systems
- University enrollment databases
- Accommodation provider APIs
- Airport pickup services
- Immigration arrival tracking

## Dependencies
- Stage 3 completion workflow
- University partnership agreements
- Accommodation provider contracts
- Transportation service partnerships

## Validation
- [ ] `npm run validate:quick` passes
- [ ] All status properties complete
- [ ] Authority matrix covers all stakeholders
- [ ] Third-party integration points documented

---
**Created**: Sprint 2 Planning  
**Sprint**: 2  
**Target Completion**: Week 3 Day 3