# UNI-302: Implement Visa Document Validation Logic

## Jira Ticket Details
**Type**: Story  
**Priority**: High  
**Story Points**: 8  
**Assignee**: Backend Developer  
**Epic**: Stage 3 Visa Processing  

## Summary
Implement comprehensive document validation logic for visa processing documents including country-specific requirements and automated validation rules.

## Description
Stage 3 requires specialized document validation beyond basic upload/approval. Need to implement visa-specific document requirements, country-based validation rules, and automated document completeness checking.

## Acceptance Criteria

### ✅ Document Type Extensions
- [ ] Add visa-specific document types to `types/index.ts`:
  - Visa application form
  - Medical examination certificates
  - Police clearance certificates
  - Financial support documents
  - Travel insurance proof
  - Accommodation booking
  - Biometric appointment confirmation

### ✅ Country-Specific Rules
- [ ] Sudan: Yellow fever certificate mandatory
- [ ] Sudan/Oman: Embassy NOC (No Objection Certificate) required
- [ ] All countries: Affidavit letter if passport name differs from academic certificates
- [ ] Configurable country-based document requirements

### ✅ Validation Engine
- [ ] Document completeness checker for visa applications
- [ ] File format validation (PDF, JPG, PNG accepted)
- [ ] File size limits and compression validation
- [ ] Expiry date validation for time-sensitive documents
- [ ] Cross-reference validation (passport number consistency)

### ✅ Business Logic
- [ ] Automatic status progression when all documents validated
- [ ] Rejection reasons and resubmission workflow
- [ ] Document version control and replacement logic
- [ ] Admin override capabilities for special cases

## Technical Requirements

### New Files
- `src/lib/documents/visa-document-validator.ts`
- `src/lib/documents/country-requirements.ts`
- `src/types/visa-documents.ts`

### Core Functions
```typescript
// Document validation interface
interface VisaDocumentValidator {
  validateDocument(doc: Document, studentNationality: string): ValidationResult
  getRequiredDocuments(nationality: string, visaType: string): DocumentType[]
  checkCompleteness(documents: Document[], student: Student): CompletenessReport
  validateExpiryDates(documents: Document[]): ExpiryValidation[]
}
```

### Integration Points
- Document upload handler integration
- Status transition triggers
- Admin dashboard validation results
- Partner notification system

## Dependencies
- UNI-301 (Stage 3 configuration) must be completed first
- Document type definitions from existing system
- Country requirements specification document

## Validation Criteria
- [ ] All validation rules documented and testable
- [ ] Error messages clear and actionable
- [ ] Performance acceptable for large document sets
- [ ] Integration with existing document management system

## Testing Strategy
- Unit tests for each validation rule
- Test cases for all supported countries
- Integration tests with document upload flow
- Manual testing with sample visa documents

---
**Created**: Sprint 1 Planning  
**Sprint**: 1  
**Target Completion**: Week 1 Day 5