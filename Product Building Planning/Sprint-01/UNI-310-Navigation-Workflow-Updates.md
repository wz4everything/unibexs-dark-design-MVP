# UNI-310: Update Navigation and Workflow Progression

## Jira Ticket Details
**Type**: Task  
**Priority**: Low  
**Story Points**: 2  
**Assignee**: Frontend Developer  
**Epic**: Stage 3 Visa Processing  

## Summary
Update application navigation and workflow progression indicators to properly support Stage 3 visa processing workflow integration.

## Description
Small but important updates to ensure Stage 3 integrates seamlessly with the existing application workflow. This includes navigation breadcrumbs, progress indicators, and ensuring smooth transitions between stages.

## Acceptance Criteria

### ✅ Navigation Updates
- [ ] Add Stage 3 to workflow progress indicator
- [ ] Update breadcrumb navigation to include visa processing
- [ ] Ensure proper navigation between Stage 2 and Stage 3
- [ ] Add Stage 3 quick links in application header
- [ ] Update stage completion indicators

### ✅ Workflow Integration
- [ ] Smooth transition from Stage 2 completion to Stage 3
- [ ] Proper handling of Stage 3 status in application lists
- [ ] Filter options for Stage 3 applications in admin/partner dashboards
- [ ] Stage 3 applications appear in relevant search results
- [ ] Correct stage labeling throughout the application

### ✅ Progress Indicators
- [ ] Visual progress bar includes Stage 3 milestones
- [ ] Stage completion checkmarks work for Stage 3
- [ ] Overall application progress calculation includes Stage 3
- [ ] Timeline view shows Stage 3 activities
- [ ] Status badges reflect Stage 3 statuses correctly

## Technical Requirements

### Files to Update
```
src/components/layout/
├── NavigationBreadcrumb.tsx   # Add Stage 3 breadcrumbs
├── WorkflowProgress.tsx       # Include Stage 3 progress
└── ApplicationHeader.tsx      # Stage 3 quick navigation

src/components/applications/
├── ApplicationList.tsx        # Stage 3 filtering/display
└── ApplicationCard.tsx        # Stage 3 status display
```

### Configuration Updates
- Update workflow stage definitions
- Add Stage 3 to navigation configuration
- Update progress calculation logic
- Ensure consistent stage naming throughout

### Integration Points
- Workflow engine configuration
- Application filtering logic
- Search functionality
- Dashboard summary calculations

## Dependencies
- UNI-301 (Stage 3 workflow configuration) - Required
- Existing navigation and progress components
- Workflow engine integration

## Testing Checklist
- [ ] Navigation works correctly between all stages
- [ ] Progress indicators show accurate completion
- [ ] Filtering and search include Stage 3 applications
- [ ] Breadcrumbs work on all Stage 3 pages
- [ ] Mobile navigation includes Stage 3 properly

## Scope Limitations
This is a small integration task focused on:
- Navigation consistency
- Visual progress indicators  
- Basic workflow integration

**Not included**:
- Major navigation redesign
- New navigation features
- Advanced filtering capabilities

---
**Created**: Sprint 1 Planning  
**Sprint**: 1  
**Target Completion**: Week 1 Day 2