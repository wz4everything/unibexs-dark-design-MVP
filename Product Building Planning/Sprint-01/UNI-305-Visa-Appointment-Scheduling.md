# UNI-305: Add Visa Appointment Scheduling

## Jira Ticket Details
**Type**: Story  
**Priority**: Low  
**Story Points**: 3  
**Assignee**: Backend Developer  
**Epic**: Stage 3 Visa Processing  

## Summary
Implement basic visa appointment scheduling functionality to track interview appointments, biometric appointments, and embassy visits.

## Description
Simple appointment tracking system for visa-related appointments. This is a foundational feature that will be enhanced in future sprints with calendar integrations and automated scheduling.

## Acceptance Criteria

### ✅ Appointment Model
- [ ] Appointment entity with basic scheduling data
- [ ] Appointment types:
  - Biometric appointment
  - Visa interview
  - Embassy visit
  - Document submission
- [ ] Date/time tracking with timezone support
- [ ] Status tracking (scheduled, completed, rescheduled, cancelled)

### ✅ Basic Scheduling Logic
- [ ] Appointment creation and modification
- [ ] Conflict detection for duplicate appointments
- [ ] Appointment reminder framework (for future implementation)
- [ ] Integration with immigration status tracking
- [ ] Basic calendar data export (ICS format)

### ✅ Admin Management
- [ ] Admin interface for appointment management
- [ ] Bulk appointment scheduling capabilities
- [ ] Appointment history and audit trail
- [ ] Embassy/consulate location data management

## Technical Requirements

### Files to Update
- `src/types/index.ts` - Add appointment interfaces
- `src/lib/data/appointments.ts` - Appointment data management
- Add to localStorage schema and initialization

### Data Models
```typescript
interface VisaAppointment {
  id: string
  applicationId: string
  type: AppointmentType
  scheduledDate: Date
  scheduledTime: string
  timezone: string
  location: EmbassyLocation
  status: AppointmentStatus
  notes: string
  createdBy: string
  createdAt: Date
  updatedAt: Date
}

enum AppointmentType {
  BIOMETRIC = 'biometric',
  INTERVIEW = 'interview',
  SUBMISSION = 'submission',
  COLLECTION = 'collection'
}
```

### Integration Points
- Immigration status tracking updates
- Application workflow progression
- Email notifications (preparation)
- Admin dashboard appointment calendar

## Dependencies
- UNI-304 (Immigration status tracking)
- Embassy location data
- Timezone handling library

## Scope Limitations
**Not included in this sprint**:
- Calendar application integrations
- Automated appointment booking with embassies
- SMS notifications
- Advanced scheduling algorithms

**Future enhancements**:
- Google Calendar integration
- Automated reminder system
- Embassy API integration for real-time availability

## Testing Strategy
- Unit tests for appointment logic
- Date/time handling validation
- Integration tests with immigration tracking
- Manual testing of appointment CRUD operations

---
**Created**: Sprint 1 Planning  
**Sprint**: 1  
**Target Completion**: Week 1 Day 4