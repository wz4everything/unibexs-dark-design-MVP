-- =====================================================
-- UNIBEXS SUPABASE DATABASE SCHEMA
-- =====================================================
-- Complete database schema for UniBexs International Student Management System
-- Designed for Supabase with Row Level Security (RLS) and PostgreSQL features
-- 
-- This schema supports:
-- - International student application management (5-stage workflow)
-- - Partner/agency management with commission tracking
-- - Document management with version control
-- - University and program catalog
-- - Commission calculation (10-18% tiered rates)
-- - Comprehensive audit logging
-- - Multi-role access control (Admin/Partner)
--
-- Execute this entire file in Supabase SQL Editor to create the complete database
-- =====================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- STEP 1: CREATE ALL TABLES WITHOUT FOREIGN KEYS
-- =====================================================

-- Users table (Authentication & Authorization)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL, -- Use Supabase auth instead in production
    role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'partner')),
    name VARCHAR(255) NOT NULL,
    partner_id UUID, -- Will add FK constraint later
    is_active BOOLEAN DEFAULT TRUE,
    email_verified BOOLEAN DEFAULT FALSE,
    last_login_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Partners table (Education Consultants & Agencies)
CREATE TABLE partners (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Basic Information
    type VARCHAR(20) NOT NULL CHECK (type IN ('individual', 'business')),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(50) NOT NULL,
    country VARCHAR(100) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'suspended')),
    
    -- Individual Partner Fields
    photo_url TEXT,
    passport_url TEXT,
    
    -- Business Partner Fields
    business_name VARCHAR(255),
    trading_license_url TEXT,
    registration_number VARCHAR(100),
    contact_person VARCHAR(255),
    
    -- Commission & Performance
    tier VARCHAR(10) DEFAULT 'bronze' CHECK (tier IN ('bronze', 'silver', 'gold')),
    total_applications INTEGER DEFAULT 0,
    successful_placements INTEGER DEFAULT 0,
    pending_commission DECIMAL(15,2) DEFAULT 0.00,
    total_earned_commission DECIMAL(15,2) DEFAULT 0.00,
    
    -- Address Information
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    postal_code VARCHAR(20),
    
    -- Agreement & Compliance
    agreement_signed_at TIMESTAMP WITH TIME ZONE,
    agreement_version VARCHAR(20),
    compliance_status VARCHAR(20) DEFAULT 'pending',
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID, -- Will add FK constraint later
    approved_at TIMESTAMP WITH TIME ZONE,
    approved_by UUID, -- Will add FK constraint later
    
    -- Performance Tracking
    last_application_at TIMESTAMP WITH TIME ZONE,
    avg_processing_days INTEGER DEFAULT 0,
    satisfaction_score DECIMAL(3,2) DEFAULT 5.00
);

-- Students table (International Student Applicants)
CREATE TABLE students (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Personal Information
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(50) NOT NULL,
    date_of_birth DATE,
    gender VARCHAR(20) CHECK (gender IN ('male', 'female', 'other', 'prefer_not_to_say')),
    
    -- Identity & Nationality
    nationality VARCHAR(100) NOT NULL,
    passport_number VARCHAR(50) UNIQUE NOT NULL,
    passport_expiry_date DATE,
    national_id VARCHAR(50),
    
    -- Address Information
    current_address TEXT,
    permanent_address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    postal_code VARCHAR(20),
    country VARCHAR(100),
    
    -- Emergency Contact
    emergency_contact_name VARCHAR(255),
    emergency_contact_phone VARCHAR(50),
    emergency_contact_relationship VARCHAR(50),
    emergency_contact_address TEXT,
    
    -- Guardian/Parent Information (for minors)
    parent_guardian_name VARCHAR(255),
    parent_guardian_phone VARCHAR(50),
    parent_guardian_email VARCHAR(255),
    parent_guardian_relationship VARCHAR(50),
    
    -- Financial Sponsor Information
    sponsor_name VARCHAR(255),
    sponsor_relationship VARCHAR(100),
    sponsor_phone VARCHAR(50),
    sponsor_email VARCHAR(255),
    sponsor_address TEXT,
    
    -- Academic Background
    highest_qualification VARCHAR(100),
    institution_name VARCHAR(255),
    graduation_year INTEGER,
    gpa DECIMAL(4,2),
    gpa_scale VARCHAR(10), -- e.g., "4.0", "5.0", "100"
    
    -- English Proficiency
    english_test_type VARCHAR(50), -- IELTS, TOEFL, PTE, Duolingo
    english_test_score VARCHAR(20),
    english_test_date DATE,
    
    -- Medical Information
    medical_conditions TEXT,
    allergies TEXT,
    emergency_medications TEXT,
    
    -- Preferences & Notes
    preferred_intake VARCHAR(50),
    study_preferences TEXT,
    special_requirements TEXT,
    internal_notes TEXT, -- Admin-only notes
    
    -- Status & Tracking
    is_active BOOLEAN DEFAULT TRUE,
    total_applications INTEGER DEFAULT 0,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID -- Will add FK constraint later
);

-- Universities table
CREATE TABLE universities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) DEFAULT 'university' CHECK (type IN ('university', 'college', 'institute')),
    country VARCHAR(100) NOT NULL,
    city VARCHAR(100),
    state VARCHAR(100),
    
    -- Contact Information
    website_url TEXT,
    email VARCHAR(255),
    phone VARCHAR(50),
    address TEXT,
    
    -- University Details
    established_year INTEGER,
    ranking_national INTEGER,
    ranking_international INTEGER,
    logo_url TEXT,
    description TEXT,
    
    -- Commission & Partnership
    commission_rate DECIMAL(5,4), -- e.g., 0.1500 for 15%
    partnership_status VARCHAR(20) DEFAULT 'active' CHECK (partnership_status IN ('active', 'inactive', 'pending')),
    agreement_signed_at TIMESTAMP WITH TIME ZONE,
    
    -- Processing Information
    avg_processing_days INTEGER DEFAULT 30,
    application_fee DECIMAL(10,2),
    application_fee_currency VARCHAR(3) DEFAULT 'USD',
    
    -- Metadata
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Colleges table (Faculties/Schools within Universities)
CREATE TABLE colleges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    university_id UUID NOT NULL, -- Will add FK constraint later
    name VARCHAR(255) NOT NULL,
    code VARCHAR(20),
    description TEXT,
    dean_name VARCHAR(255),
    contact_email VARCHAR(255),
    contact_phone VARCHAR(50),
    established_year INTEGER,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Fields of Study table (Academic Disciplines)
CREATE TABLE fields_of_study (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    code VARCHAR(20) UNIQUE NOT NULL, -- ISCED-F based codes
    description TEXT,
    keywords TEXT[], -- For search matching
    icon VARCHAR(100), -- Emoji or icon identifier
    subcategories TEXT[], -- Related specializations
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Levels table (Degree Levels)
CREATE TABLE levels (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    university_id UUID NOT NULL, -- Will add FK constraint later
    college_id UUID, -- Will add FK constraint later
    name VARCHAR(50) NOT NULL CHECK (name IN ('Foundation', 'Diploma', 'Certificate', 'Bachelor', 'Master', 'PhD')),
    display_name VARCHAR(100) NOT NULL, -- e.g., "Bachelor's Degree"
    
    -- Default Inheritance Values
    default_duration VARCHAR(50), -- e.g., "3 years", "18 months"
    default_commission_rate DECIMAL(5,4), -- e.g., 0.1500 for 15%
    
    -- English Requirements
    default_ielts_requirement DECIMAL(3,1), -- e.g., 6.5
    default_toefl_requirement INTEGER, -- e.g., 90
    default_pte_requirement INTEGER, -- e.g., 65
    default_duolingo_requirement INTEGER, -- e.g., 110
    
    -- Academic Requirements
    minimum_gpa DECIMAL(4,2),
    gpa_scale VARCHAR(10),
    
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Programs table (Study Programs)
CREATE TABLE programs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    university_id UUID NOT NULL, -- Will add FK constraint later
    college_id UUID, -- Will add FK constraint later
    level_id UUID NOT NULL, -- Will add FK constraint later
    field_of_study_id UUID NOT NULL, -- Will add FK constraint later
    
    -- Program Information
    name VARCHAR(255) NOT NULL,
    program_code VARCHAR(50),
    duration VARCHAR(50), -- Override level default if needed
    
    -- Financial Information
    fees DECIMAL(15,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    application_fee DECIMAL(10,2),
    
    -- Commission
    commission_rate DECIMAL(5,4), -- Override level/university default
    
    -- Academic Requirements
    ielts_requirement DECIMAL(3,1),
    toefl_requirement INTEGER,
    pte_requirement INTEGER,
    duolingo_requirement INTEGER,
    minimum_gpa DECIMAL(4,2),
    gpa_scale VARCHAR(10),
    
    -- Program Details
    description TEXT,
    highlights TEXT[], -- Key selling points
    requirements TEXT[],
    career_prospects TEXT,
    program_url TEXT, -- Official program page
    
    -- Intake & Scheduling
    intakes VARCHAR(100)[], -- e.g., ['January', 'September']
    next_intake DATE,
    application_deadline DATE,
    
    -- Search & Discovery
    search_keywords TEXT[],
    is_featured BOOLEAN DEFAULT FALSE,
    is_popular BOOLEAN DEFAULT FALSE,
    
    -- Inheritance Flags
    inherits_duration_from_level BOOLEAN DEFAULT TRUE,
    inherits_commission_from_level BOOLEAN DEFAULT TRUE,
    inherits_english_requirements_from_level BOOLEAN DEFAULT TRUE,
    
    -- Status & Metadata
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID -- Will add FK constraint later
);

-- Applications table (Central Workflow Entity)
CREATE TABLE applications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Core References
    student_id UUID NOT NULL, -- Will add FK constraint later
    partner_id UUID NOT NULL, -- Will add FK constraint later
    program_id UUID NOT NULL, -- Will add FK constraint later
    university_id UUID NOT NULL, -- Will add FK constraint later
    
    -- Workflow Status
    current_stage INTEGER NOT NULL DEFAULT 1 CHECK (current_stage BETWEEN 1 AND 5),
    current_status VARCHAR(100) NOT NULL,
    next_action TEXT,
    next_actor VARCHAR(50) CHECK (next_actor IN ('Admin', 'Partner', 'University', 'Immigration', 'System')),
    
    -- Identifiers
    tracking_number VARCHAR(50) UNIQUE,
    university_reference_number VARCHAR(100),
    visa_reference_number VARCHAR(100),
    
    -- Application Details
    program_name VARCHAR(255), -- Snapshot at time of application
    university_name VARCHAR(255), -- Snapshot at time of application
    intake_date DATE NOT NULL,
    tuition_fee DECIMAL(15,2),
    currency VARCHAR(3) DEFAULT 'USD',
    
    -- Priority & Classification
    priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    is_expedited BOOLEAN DEFAULT FALSE,
    complexity_score INTEGER DEFAULT 1 CHECK (complexity_score BETWEEN 1 AND 5),
    
    -- Status Tracking Flags
    has_action_required BOOLEAN DEFAULT FALSE,
    documents_required TEXT[], -- Array of required document types
    active_document_request_id UUID,
    
    -- Hold/Pause Functionality
    is_on_hold BOOLEAN DEFAULT FALSE,
    hold_reason TEXT,
    held_by UUID, -- Will add FK constraint later
    held_at TIMESTAMP WITH TIME ZONE,
    previous_status VARCHAR(100), -- Status to resume to
    resume_reason TEXT,
    resumed_by UUID, -- Will add FK constraint later
    resumed_at TIMESTAMP WITH TIME ZONE,
    
    -- Cancellation
    is_cancelled BOOLEAN DEFAULT FALSE,
    cancel_reason TEXT,
    cancelled_by UUID, -- Will add FK constraint later
    cancelled_at TIMESTAMP WITH TIME ZONE,
    
    -- Rejection Information
    rejection_reason TEXT,
    rejected_by UUID, -- Will add FK constraint later
    rejected_at TIMESTAMP WITH TIME ZONE,
    can_resubmit BOOLEAN DEFAULT TRUE,
    
    -- Program Change Support
    program_change_request_id UUID,
    original_program_id UUID, -- Will add FK constraint later
    suggested_program_id UUID, -- Will add FK constraint later
    program_change_reason TEXT,
    program_change_suggested_by UUID, -- Will add FK constraint later
    program_change_suggested_at TIMESTAMP WITH TIME ZONE,
    program_change_decision VARCHAR(20) CHECK (program_change_decision IN ('accepted', 'rejected', 'pending')),
    program_change_decided_by UUID, -- Will add FK constraint later
    program_change_decided_at TIMESTAMP WITH TIME ZONE,
    
    -- Timeline & Processing
    submitted_at TIMESTAMP WITH TIME ZONE,
    last_activity_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    estimated_completion_date DATE,
    
    -- Financial Information
    application_fee_paid BOOLEAN DEFAULT FALSE,
    application_fee_amount DECIMAL(10,2),
    tuition_deposit_paid BOOLEAN DEFAULT FALSE,
    tuition_deposit_amount DECIMAL(10,2),
    
    -- Additional Context
    notes TEXT, -- General notes
    internal_notes TEXT, -- Admin-only notes
    partner_notes TEXT, -- Partner-visible notes
    metadata JSONB, -- Flexible additional data
    
    -- Quality & Performance Metrics
    processing_days INTEGER DEFAULT 0,
    partner_satisfaction_score INTEGER CHECK (partner_satisfaction_score BETWEEN 1 AND 5),
    completion_score INTEGER CHECK (completion_score BETWEEN 1 AND 100),
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID -- Will add FK constraint later
);

-- Documents table (File Management)
CREATE TABLE documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    application_id UUID NOT NULL, -- Will add FK constraint later
    
    -- Document Classification
    stage INTEGER NOT NULL CHECK (stage BETWEEN 1 AND 5),
    type VARCHAR(100) NOT NULL, -- passport_copy, transcript, etc.
    category VARCHAR(50), -- admission, visa, financial, etc.
    
    -- File Information
    file_name VARCHAR(255) NOT NULL,
    original_file_name VARCHAR(255),
    file_size BIGINT, -- Size in bytes
    mime_type VARCHAR(100),
    file_path TEXT, -- Supabase Storage path
    file_url TEXT, -- Public URL if applicable
    
    -- Document Status & Review
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'under_review', 'approved', 'rejected', 'resubmission_required', 'expired')),
    review_status VARCHAR(50),
    is_mandatory BOOLEAN DEFAULT TRUE,
    
    -- Version Control
    version INTEGER DEFAULT 1,
    parent_document_id UUID, -- Will add FK constraint later (self-reference)
    is_latest_version BOOLEAN DEFAULT TRUE,
    
    -- Review Information
    reviewed_by UUID, -- Will add FK constraint later
    reviewed_at TIMESTAMP WITH TIME ZONE,
    rejection_reason TEXT,
    admin_comments TEXT,
    
    -- Upload Information
    uploaded_by UUID, -- Will add FK constraint later
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    upload_source VARCHAR(50), -- 'partner', 'admin', 'system'
    
    -- Document Metadata
    expiry_date DATE, -- For documents like passport, visa
    issue_date DATE,
    issuing_authority VARCHAR(255),
    document_number VARCHAR(100),
    
    -- Security & Verification
    is_verified BOOLEAN DEFAULT FALSE,
    verification_method VARCHAR(50),
    verified_by UUID, -- Will add FK constraint later
    verified_at TIMESTAMP WITH TIME ZONE,
    checksum VARCHAR(255), -- File integrity check
    
    -- Processing Information
    requires_translation BOOLEAN DEFAULT FALSE,
    translation_status VARCHAR(50),
    requires_notarization BOOLEAN DEFAULT FALSE,
    notarization_status VARCHAR(50),
    
    -- Metadata
    tags TEXT[], -- Flexible tagging
    notes TEXT,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Document Requests table (Admin requesting documents)
CREATE TABLE document_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    application_id UUID NOT NULL, -- Will add FK constraint later
    stage INTEGER NOT NULL CHECK (stage BETWEEN 1 AND 5),
    
    -- Request Information
    requested_by UUID NOT NULL, -- Will add FK constraint later
    request_source VARCHAR(50) DEFAULT 'Admin' CHECK (request_source IN ('Admin', 'University', 'Immigration')),
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'partially_submitted', 'submitted', 'approved', 'rejected')),
    
    -- Timeline
    due_date DATE,
    reminder_sent_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    
    -- Content
    title VARCHAR(255) NOT NULL,
    description TEXT,
    notes TEXT,
    urgency_level VARCHAR(20) DEFAULT 'normal' CHECK (urgency_level IN ('low', 'normal', 'high', 'urgent')),
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Document Requirements table (Individual requirements within a request)
CREATE TABLE document_requirements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_request_id UUID NOT NULL, -- Will add FK constraint later
    
    -- Requirement Details
    type VARCHAR(100) NOT NULL, -- passport_copy, transcript, etc.
    description TEXT NOT NULL,
    is_mandatory BOOLEAN DEFAULT TRUE,
    
    -- Status
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'uploaded', 'approved', 'rejected', 'resubmission_required')),
    uploaded_document_id UUID, -- Will add FK constraint later
    
    -- Review
    rejection_reason TEXT,
    admin_comments TEXT,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Stage History table (Track workflow progression)
CREATE TABLE stage_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    application_id UUID NOT NULL, -- Will add FK constraint later
    
    -- Stage Information
    stage INTEGER NOT NULL CHECK (stage BETWEEN 1 AND 5),
    status VARCHAR(100) NOT NULL,
    previous_status VARCHAR(100),
    
    -- Actor & Action
    actor_id UUID, -- Will add FK constraint later
    actor_role VARCHAR(50), -- admin, partner, system
    action_taken VARCHAR(100),
    
    -- Context
    reason TEXT,
    notes TEXT,
    documents_involved TEXT[], -- Document IDs involved in this change
    
    -- Metadata
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    duration_in_status INTERVAL, -- How long it was in previous status
    metadata JSONB
);

-- Payments table (Track all payments)
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    application_id UUID NOT NULL, -- Will add FK constraint later
    
    -- Payment Type & Stage
    stage INTEGER NOT NULL CHECK (stage BETWEEN 1 AND 5),
    type VARCHAR(50) NOT NULL CHECK (type IN ('application_fee', 'tuition_deposit', 'visa_fee', 'service_fee', 'other')),
    
    -- Payment Details
    amount DECIMAL(15,2) NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'USD',
    exchange_rate DECIMAL(10,4), -- If conversion needed
    local_amount DECIMAL(15,2), -- Amount in local currency
    local_currency VARCHAR(3),
    
    -- Status & Processing
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'approved', 'rejected', 'refunded', 'cancelled')),
    payment_method VARCHAR(50), -- bank_transfer, credit_card, etc.
    transaction_reference VARCHAR(255),
    bank_reference VARCHAR(255),
    
    -- Proof & Documentation
    proof_document_id UUID, -- Will add FK constraint later
    receipt_url TEXT,
    
    -- Processing Information
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    processed_at TIMESTAMP WITH TIME ZONE,
    processed_by UUID, -- Will add FK constraint later
    
    -- Review Information
    review_notes TEXT,
    rejection_reason TEXT,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID -- Will add FK constraint later
);

-- Commissions table (Partner earnings tracking)
CREATE TABLE commissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Core References
    application_id UUID NOT NULL, -- Will add FK constraint later
    student_id UUID NOT NULL, -- Will add FK constraint later
    partner_id UUID NOT NULL, -- Will add FK constraint later
    program_id UUID NOT NULL, -- Will add FK constraint later
    
    -- Commission Calculation
    tuition_fee DECIMAL(15,2) NOT NULL,
    commission_rate DECIMAL(5,4) NOT NULL, -- e.g., 0.1500 for 15%
    gross_commission DECIMAL(15,2) NOT NULL,
    processing_fee DECIMAL(15,2) DEFAULT 0.00,
    tax_amount DECIMAL(15,2) DEFAULT 0.00,
    net_commission DECIMAL(15,2) NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'USD',
    
    -- Status & Timeline
    status VARCHAR(50) DEFAULT 'commission_pending' CHECK (status IN (
        'commission_pending',     -- Awaiting admin review after enrollment
        'commission_approved',    -- Admin approved, payment being processed
        'commission_released',    -- Admin uploaded transfer document
        'commission_paid',        -- Partner confirmed receipt (terminal)
        'commission_transfer_disputed' -- Partner disputed payment
    )),
    
    -- Important Dates
    enrollment_date DATE NOT NULL, -- When enrollment was confirmed
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(), -- Stage 5 start
    approved_at TIMESTAMP WITH TIME ZONE,
    released_at TIMESTAMP WITH TIME ZONE,
    paid_at TIMESTAMP WITH TIME ZONE,
    disputed_at TIMESTAMP WITH TIME ZONE,
    
    -- Payment Processing
    transfer_document_id UUID, -- Will add FK constraint later
    transfer_reference VARCHAR(255), -- Bank transfer reference
    payment_method VARCHAR(50),
    bank_details TEXT,
    
    -- Partner Information (snapshot)
    partner_tier VARCHAR(10) NOT NULL CHECK (partner_tier IN ('bronze', 'silver', 'gold')),
    partner_name VARCHAR(255) NOT NULL,
    
    -- Program Information (snapshot)
    university_name VARCHAR(255) NOT NULL,
    program_name VARCHAR(255) NOT NULL,
    
    -- Processing Information
    payment_notes TEXT,
    admin_notes TEXT,
    calculation_breakdown JSONB, -- Detailed breakdown of calculation
    
    -- Audit Information
    approved_by UUID, -- Will add FK constraint later
    released_by UUID, -- Will add FK constraint later
    
    -- Metadata
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Visa Records table
CREATE TABLE visa_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    application_id UUID NOT NULL, -- Will add FK constraint later
    student_id UUID NOT NULL, -- Will add FK constraint later
    
    -- Visa Application Information
    visa_type VARCHAR(50), -- student_visa, study_permit, etc.
    tracking_number VARCHAR(100) UNIQUE,
    application_reference VARCHAR(100),
    
    -- Visa Details
    visa_number VARCHAR(100),
    visa_category VARCHAR(50),
    single_entry BOOLEAN DEFAULT FALSE,
    multiple_entry BOOLEAN DEFAULT TRUE,
    
    -- Timeline
    application_submitted_at TIMESTAMP WITH TIME ZONE,
    biometric_appointment_date TIMESTAMP WITH TIME ZONE,
    interview_date TIMESTAMP WITH TIME ZONE,
    decision_date TIMESTAMP WITH TIME ZONE,
    issued_at TIMESTAMP WITH TIME ZONE,
    received_at TIMESTAMP WITH TIME ZONE,
    
    -- Status & Decision
    status VARCHAR(50) DEFAULT 'applied' CHECK (status IN ('applied', 'under_review', 'approved', 'rejected', 'cancelled')),
    decision VARCHAR(50),
    rejection_reason TEXT,
    rejection_category VARCHAR(100),
    appeal_possible BOOLEAN DEFAULT FALSE,
    
    -- Visa Validity
    valid_from DATE,
    valid_until DATE,
    expiry_date DATE,
    duration_months INTEGER,
    
    -- Processing Information
    processing_office VARCHAR(255),
    processing_country VARCHAR(100),
    officer_name VARCHAR(255),
    
    -- Documents
    approval_letter_id UUID, -- Will add FK constraint later
    visa_document_id UUID, -- Will add FK constraint later
    
    -- Financial Requirements
    financial_proof_amount DECIMAL(15,2),
    financial_proof_currency VARCHAR(3),
    
    -- Conditions & Restrictions
    work_allowed BOOLEAN DEFAULT FALSE,
    work_hours_limit INTEGER,
    travel_restrictions TEXT,
    study_conditions TEXT,
    other_conditions TEXT,
    
    -- Metadata
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID -- Will add FK constraint later
);

-- Arrival Records table (Student arrival tracking)
CREATE TABLE arrival_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    application_id UUID NOT NULL, -- Will add FK constraint later
    student_id UUID NOT NULL, -- Will add FK constraint later
    visa_record_id UUID, -- Will add FK constraint later
    
    -- Planned Arrival
    planned_arrival_date DATE NOT NULL,
    planned_flight VARCHAR(50),
    planned_airport VARCHAR(100),
    
    -- Actual Arrival
    actual_arrival_date DATE,
    actual_flight VARCHAR(50),
    actual_airport VARCHAR(100),
    
    -- Status
    status VARCHAR(50) DEFAULT 'planned' CHECK (status IN ('planned', 'in_transit', 'arrived', 'confirmed', 'no_show')),
    
    -- Verification
    verified_by UUID, -- Will add FK constraint later
    verified_at TIMESTAMP WITH TIME ZONE,
    verification_method VARCHAR(50), -- phone_call, in_person, document_check
    
    -- Contact & Support
    pickup_arranged BOOLEAN DEFAULT FALSE,
    pickup_contact_name VARCHAR(255),
    pickup_contact_phone VARCHAR(50),
    accommodation_confirmed BOOLEAN DEFAULT FALSE,
    university_orientation_scheduled BOOLEAN DEFAULT FALSE,
    
    -- Issues & Notes
    arrival_issues TEXT,
    support_provided TEXT,
    notes TEXT,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID -- Will add FK constraint later
);

-- Comments table (Application discussions)
CREATE TABLE comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    application_id UUID NOT NULL, -- Will add FK constraint later
    
    -- Comment Hierarchy
    parent_comment_id UUID, -- Will add FK constraint later (self-reference)
    thread_level INTEGER DEFAULT 0,
    
    -- Content
    content TEXT NOT NULL,
    content_type VARCHAR(50) DEFAULT 'text' CHECK (content_type IN ('text', 'markdown', 'html')),
    
    -- Context
    stage INTEGER CHECK (stage BETWEEN 1 AND 5),
    context_type VARCHAR(50), -- document_review, status_update, general
    context_reference UUID, -- Reference to document, payment, etc.
    
    -- Author Information
    author_id UUID NOT NULL, -- Will add FK constraint later
    author_role VARCHAR(50) NOT NULL CHECK (author_role IN ('admin', 'partner')),
    author_name VARCHAR(255) NOT NULL, -- Snapshot for historical accuracy
    
    -- Visibility & Privacy
    is_internal BOOLEAN DEFAULT FALSE, -- Admin-only comments
    is_system_generated BOOLEAN DEFAULT FALSE,
    visibility_scope VARCHAR(50) DEFAULT 'application' CHECK (visibility_scope IN ('application', 'stage', 'private')),
    
    -- Status & Moderation
    is_edited BOOLEAN DEFAULT FALSE,
    is_deleted BOOLEAN DEFAULT FALSE,
    edited_at TIMESTAMP WITH TIME ZONE,
    deleted_at TIMESTAMP WITH TIME ZONE,
    
    -- Engagement
    likes_count INTEGER DEFAULT 0,
    replies_count INTEGER DEFAULT 0,
    
    -- Metadata
    mentioned_users UUID[], -- @mentions
    attachments TEXT[], -- File URLs
    tags TEXT[],
    priority VARCHAR(20) DEFAULT 'normal',
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notifications table (System notifications)
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Recipients
    user_id UUID, -- Will add FK constraint later
    partner_id UUID, -- Will add FK constraint later
    
    -- Notification Content
    type VARCHAR(100) NOT NULL, -- email, sms, push, in_app
    category VARCHAR(100) NOT NULL, -- status_update, document_request, deadline, etc.
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    
    -- Context & References
    application_id UUID, -- Will add FK constraint later
    document_id UUID, -- Will add FK constraint later
    commission_id UUID, -- Will add FK constraint later
    reference_type VARCHAR(50), -- application, document, payment, etc.
    reference_id UUID,
    
    -- Delivery Information
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'delivered', 'failed', 'cancelled')),
    delivery_method VARCHAR(50), -- email, sms, push, in_app
    recipient_email VARCHAR(255),
    recipient_phone VARCHAR(50),
    
    -- Timing
    scheduled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    sent_at TIMESTAMP WITH TIME ZONE,
    delivered_at TIMESTAMP WITH TIME ZONE,
    read_at TIMESTAMP WITH TIME ZONE,
    
    -- Email-specific fields
    email_subject VARCHAR(255),
    email_template VARCHAR(100),
    email_from VARCHAR(255),
    
    -- SMS-specific fields
    sms_from VARCHAR(50),
    
    -- Content & Personalization
    template_variables JSONB, -- Variables for template rendering
    personalization_data JSONB,
    
    -- Interaction Tracking
    clicked_at TIMESTAMP WITH TIME ZONE,
    click_count INTEGER DEFAULT 0,
    links_clicked TEXT[],
    
    -- Priority & Routing
    priority VARCHAR(20) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    is_bulk BOOLEAN DEFAULT FALSE,
    batch_id UUID,
    
    -- Failure Information
    failure_reason TEXT,
    retry_count INTEGER DEFAULT 0,
    max_retries INTEGER DEFAULT 3,
    next_retry_at TIMESTAMP WITH TIME ZONE,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Audit Logs table (Complete activity tracking)
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Context
    application_id UUID, -- Will add FK constraint later
    user_id UUID, -- Will add FK constraint later
    partner_id UUID, -- Will add FK constraint later
    student_id UUID, -- Will add FK constraint later
    
    -- Event Information
    event_type VARCHAR(100) NOT NULL, -- create, update, delete, status_change, etc.
    action VARCHAR(100) NOT NULL, -- specific action taken
    entity_type VARCHAR(100) NOT NULL, -- application, document, payment, etc.
    entity_id UUID, -- ID of the affected entity
    
    -- Actor Information
    actor_id UUID, -- Will add FK constraint later
    actor_role VARCHAR(50),
    actor_name VARCHAR(255),
    actor_ip_address INET,
    user_agent TEXT,
    
    -- Change Details
    stage INTEGER CHECK (stage BETWEEN 1 AND 5),
    previous_status VARCHAR(100),
    new_status VARCHAR(100),
    previous_values JSONB, -- Old values for comparison
    new_values JSONB, -- New values
    changes JSONB, -- Specific fields that changed
    
    -- Context & Reason
    reason TEXT,
    notes TEXT,
    tracking_number VARCHAR(50),
    
    -- Document & File Changes
    documents_affected TEXT[], -- Document IDs
    files_uploaded TEXT[], -- File URLs
    files_deleted TEXT[],
    
    -- Financial Changes
    payment_amount DECIMAL(15,2),
    commission_amount DECIMAL(15,2),
    
    -- Metadata
    session_id VARCHAR(255),
    request_id VARCHAR(255),
    correlation_id UUID, -- Group related events
    metadata JSONB, -- Additional context
    
    -- Performance Tracking
    processing_time_ms INTEGER,
    
    -- Timestamp
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Activity Logs table (User activity tracking)
CREATE TABLE activity_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- User Information
    user_id UUID, -- Will add FK constraint later
    partner_id UUID, -- Will add FK constraint later
    session_id VARCHAR(255),
    
    -- Activity Details
    activity_type VARCHAR(100) NOT NULL, -- login, logout, view, create, update, delete
    resource_type VARCHAR(100), -- application, document, student, etc.
    resource_id UUID,
    action VARCHAR(255) NOT NULL,
    
    -- Request Information
    method VARCHAR(10), -- GET, POST, PUT, DELETE
    endpoint VARCHAR(255),
    status_code INTEGER,
    
    -- Client Information
    ip_address INET,
    user_agent TEXT,
    device_type VARCHAR(50), -- desktop, mobile, tablet
    browser VARCHAR(100),
    os VARCHAR(100),
    country VARCHAR(100),
    city VARCHAR(100),
    
    -- Performance
    response_time_ms INTEGER,
    
    -- Context
    application_id UUID, -- Will add FK constraint later
    referrer_url TEXT,
    
    -- Metadata
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Logistics Partners table (Service providers)
CREATE TABLE logistics_partners (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    type VARCHAR(100) NOT NULL, -- accommodation, transport, insurance, etc.
    
    -- Contact Information
    email VARCHAR(255),
    phone VARCHAR(50),
    website_url TEXT,
    contact_person VARCHAR(255),
    
    -- Location
    country VARCHAR(100) NOT NULL,
    city VARCHAR(100),
    address TEXT,
    
    -- Services
    services TEXT[] NOT NULL, -- Array of services provided
    service_areas TEXT[], -- Geographic coverage
    languages_supported TEXT[],
    
    -- Business Information
    business_registration VARCHAR(100),
    license_number VARCHAR(100),
    established_year INTEGER,
    
    -- Partnership
    partnership_status VARCHAR(50) DEFAULT 'active' CHECK (partnership_status IN ('active', 'inactive', 'pending', 'suspended')),
    contract_start_date DATE,
    contract_end_date DATE,
    commission_rate DECIMAL(5,4), -- If applicable
    
    -- Quality & Performance
    rating DECIMAL(3,2) CHECK (rating BETWEEN 0 AND 5),
    review_count INTEGER DEFAULT 0,
    response_time_hours INTEGER DEFAULT 24,
    
    -- Description & Marketing
    description TEXT,
    specializations TEXT[],
    certifications TEXT[],
    awards TEXT[],
    
    -- Operational Information
    operating_hours VARCHAR(255),
    emergency_contact VARCHAR(50),
    
    -- Metadata
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID -- Will add FK constraint later
);

-- Service Providers table (General service providers)
CREATE TABLE service_providers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    type VARCHAR(100) NOT NULL CHECK (type IN ('accommodation', 'transport', 'insurance', 'medical', 'banking', 'telecom', 'other')),
    
    -- Contact Information
    contact_email VARCHAR(255) NOT NULL,
    contact_phone VARCHAR(50) NOT NULL,
    website_url TEXT,
    
    -- Location
    country VARCHAR(100) NOT NULL,
    city VARCHAR(100),
    state VARCHAR(100),
    address TEXT,
    postal_code VARCHAR(20),
    
    -- Services & Offerings
    services TEXT[] NOT NULL,
    description TEXT,
    pricing_info TEXT,
    
    -- Business Details
    business_hours VARCHAR(255),
    languages_supported TEXT[],
    
    -- Quality Metrics
    rating DECIMAL(3,2) CHECK (rating BETWEEN 0 AND 5),
    review_count INTEGER DEFAULT 0,
    
    -- Status
    is_verified BOOLEAN DEFAULT FALSE,
    is_recommended BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- System Settings table (Application configuration)
CREATE TABLE system_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category VARCHAR(100) NOT NULL, -- email, commission, workflow, etc.
    key VARCHAR(100) NOT NULL,
    value TEXT,
    value_type VARCHAR(50) DEFAULT 'string' CHECK (value_type IN ('string', 'number', 'boolean', 'json')),
    description TEXT,
    is_encrypted BOOLEAN DEFAULT FALSE,
    is_public BOOLEAN DEFAULT FALSE, -- Can be accessed by frontend
    
    -- Validation
    allowed_values TEXT[], -- For enum-like settings
    min_value DECIMAL(15,4), -- For numeric settings
    max_value DECIMAL(15,4),
    validation_regex TEXT,
    
    -- Metadata
    last_modified_by UUID, -- Will add FK constraint later
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Unique constraint on category + key
    UNIQUE(category, key)
);

-- Email Templates table (Notification templates)
CREATE TABLE email_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) UNIQUE NOT NULL,
    category VARCHAR(100) NOT NULL, -- status_update, document_request, etc.
    
    -- Template Content
    subject VARCHAR(255) NOT NULL,
    body_text TEXT NOT NULL, -- Plain text version
    body_html TEXT, -- HTML version
    
    -- Template Variables
    variables JSONB, -- Available variables for template
    required_variables TEXT[], -- Variables that must be provided
    
    -- Personalization
    supports_personalization BOOLEAN DEFAULT TRUE,
    default_from_name VARCHAR(255),
    default_from_email VARCHAR(255),
    default_reply_to VARCHAR(255),
    
    -- Template Metadata
    description TEXT,
    usage_notes TEXT,
    preview_data JSONB, -- Sample data for previews
    
    -- Status & Versioning
    is_active BOOLEAN DEFAULT TRUE,
    version INTEGER DEFAULT 1,
    parent_template_id UUID, -- Will add FK constraint later
    
    -- Usage Statistics
    sent_count INTEGER DEFAULT 0,
    open_rate DECIMAL(5,4), -- 0.2500 for 25%
    click_rate DECIMAL(5,4),
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID -- Will add FK constraint later
);

-- Sessions table (User session management)
CREATE TABLE sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL, -- Will add FK constraint later
    
    -- Session Information
    session_token VARCHAR(255) UNIQUE NOT NULL,
    refresh_token VARCHAR(255),
    device_id VARCHAR(255),
    
    -- Session Details
    ip_address INET,
    user_agent TEXT,
    device_type VARCHAR(50), -- desktop, mobile, tablet
    browser VARCHAR(100),
    os VARCHAR(100),
    location_country VARCHAR(100),
    location_city VARCHAR(100),
    
    -- Timeline
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    last_activity_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    logout_reason VARCHAR(100), -- user_logout, timeout, force_logout, etc.
    
    -- Security
    is_suspicious BOOLEAN DEFAULT FALSE,
    security_flags TEXT[]
);

-- Attachments table (General file storage)
CREATE TABLE attachments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- File Information
    file_name VARCHAR(255) NOT NULL,
    original_file_name VARCHAR(255),
    file_size BIGINT NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    file_path TEXT NOT NULL, -- Supabase Storage path
    file_url TEXT, -- Public URL if applicable
    checksum VARCHAR(255), -- File integrity
    
    -- Context
    entity_type VARCHAR(100), -- application, comment, user, etc.
    entity_id UUID,
    context VARCHAR(100), -- profile_photo, document, etc.
    
    -- Access Control
    is_public BOOLEAN DEFAULT FALSE,
    access_level VARCHAR(50) DEFAULT 'private' CHECK (access_level IN ('public', 'private', 'restricted')),
    
    -- Processing Status
    processing_status VARCHAR(50) DEFAULT 'completed' CHECK (processing_status IN ('uploading', 'processing', 'completed', 'failed')),
    thumbnail_url TEXT,
    
    -- Metadata
    uploaded_by UUID, -- Will add FK constraint later
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Expiry (for temporary files)
    expires_at TIMESTAMP WITH TIME ZONE
);

-- =====================================================
-- STEP 2: ADD ALL FOREIGN KEY CONSTRAINTS
-- =====================================================

-- Users table foreign keys
ALTER TABLE users 
ADD CONSTRAINT fk_users_partner_id 
FOREIGN KEY (partner_id) REFERENCES partners(id) ON DELETE SET NULL;

-- Partners table foreign keys
ALTER TABLE partners 
ADD CONSTRAINT fk_partners_created_by 
FOREIGN KEY (created_by) REFERENCES users(id);

ALTER TABLE partners 
ADD CONSTRAINT fk_partners_approved_by 
FOREIGN KEY (approved_by) REFERENCES users(id);

-- Students table foreign keys
ALTER TABLE students 
ADD CONSTRAINT fk_students_created_by 
FOREIGN KEY (created_by) REFERENCES users(id);

-- Colleges table foreign keys
ALTER TABLE colleges 
ADD CONSTRAINT fk_colleges_university_id 
FOREIGN KEY (university_id) REFERENCES universities(id) ON DELETE CASCADE;

-- Levels table foreign keys
ALTER TABLE levels 
ADD CONSTRAINT fk_levels_university_id 
FOREIGN KEY (university_id) REFERENCES universities(id) ON DELETE CASCADE;

ALTER TABLE levels 
ADD CONSTRAINT fk_levels_college_id 
FOREIGN KEY (college_id) REFERENCES colleges(id) ON DELETE CASCADE;

-- Programs table foreign keys
ALTER TABLE programs 
ADD CONSTRAINT fk_programs_university_id 
FOREIGN KEY (university_id) REFERENCES universities(id) ON DELETE CASCADE;

ALTER TABLE programs 
ADD CONSTRAINT fk_programs_college_id 
FOREIGN KEY (college_id) REFERENCES colleges(id) ON DELETE SET NULL;

ALTER TABLE programs 
ADD CONSTRAINT fk_programs_level_id 
FOREIGN KEY (level_id) REFERENCES levels(id) ON DELETE RESTRICT;

ALTER TABLE programs 
ADD CONSTRAINT fk_programs_field_of_study_id 
FOREIGN KEY (field_of_study_id) REFERENCES fields_of_study(id) ON DELETE RESTRICT;

ALTER TABLE programs 
ADD CONSTRAINT fk_programs_created_by 
FOREIGN KEY (created_by) REFERENCES users(id);

-- Applications table foreign keys
ALTER TABLE applications 
ADD CONSTRAINT fk_applications_student_id 
FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE RESTRICT;

ALTER TABLE applications 
ADD CONSTRAINT fk_applications_partner_id 
FOREIGN KEY (partner_id) REFERENCES partners(id) ON DELETE RESTRICT;

ALTER TABLE applications 
ADD CONSTRAINT fk_applications_program_id 
FOREIGN KEY (program_id) REFERENCES programs(id) ON DELETE RESTRICT;

ALTER TABLE applications 
ADD CONSTRAINT fk_applications_university_id 
FOREIGN KEY (university_id) REFERENCES universities(id) ON DELETE RESTRICT;

ALTER TABLE applications 
ADD CONSTRAINT fk_applications_held_by 
FOREIGN KEY (held_by) REFERENCES users(id);

ALTER TABLE applications 
ADD CONSTRAINT fk_applications_resumed_by 
FOREIGN KEY (resumed_by) REFERENCES users(id);

ALTER TABLE applications 
ADD CONSTRAINT fk_applications_cancelled_by 
FOREIGN KEY (cancelled_by) REFERENCES users(id);

ALTER TABLE applications 
ADD CONSTRAINT fk_applications_rejected_by 
FOREIGN KEY (rejected_by) REFERENCES users(id);

ALTER TABLE applications 
ADD CONSTRAINT fk_applications_original_program_id 
FOREIGN KEY (original_program_id) REFERENCES programs(id);

ALTER TABLE applications 
ADD CONSTRAINT fk_applications_suggested_program_id 
FOREIGN KEY (suggested_program_id) REFERENCES programs(id);

ALTER TABLE applications 
ADD CONSTRAINT fk_applications_program_change_suggested_by 
FOREIGN KEY (program_change_suggested_by) REFERENCES users(id);

ALTER TABLE applications 
ADD CONSTRAINT fk_applications_program_change_decided_by 
FOREIGN KEY (program_change_decided_by) REFERENCES users(id);

ALTER TABLE applications 
ADD CONSTRAINT fk_applications_created_by 
FOREIGN KEY (created_by) REFERENCES users(id);

-- Documents table foreign keys
ALTER TABLE documents 
ADD CONSTRAINT fk_documents_application_id 
FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE CASCADE;

ALTER TABLE documents 
ADD CONSTRAINT fk_documents_parent_document_id 
FOREIGN KEY (parent_document_id) REFERENCES documents(id);

ALTER TABLE documents 
ADD CONSTRAINT fk_documents_reviewed_by 
FOREIGN KEY (reviewed_by) REFERENCES users(id);

ALTER TABLE documents 
ADD CONSTRAINT fk_documents_uploaded_by 
FOREIGN KEY (uploaded_by) REFERENCES users(id);

ALTER TABLE documents 
ADD CONSTRAINT fk_documents_verified_by 
FOREIGN KEY (verified_by) REFERENCES users(id);

-- Document Requests table foreign keys
ALTER TABLE document_requests 
ADD CONSTRAINT fk_document_requests_application_id 
FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE CASCADE;

ALTER TABLE document_requests 
ADD CONSTRAINT fk_document_requests_requested_by 
FOREIGN KEY (requested_by) REFERENCES users(id);

-- Document Requirements table foreign keys
ALTER TABLE document_requirements 
ADD CONSTRAINT fk_document_requirements_document_request_id 
FOREIGN KEY (document_request_id) REFERENCES document_requests(id) ON DELETE CASCADE;

ALTER TABLE document_requirements 
ADD CONSTRAINT fk_document_requirements_uploaded_document_id 
FOREIGN KEY (uploaded_document_id) REFERENCES documents(id);

-- Stage History table foreign keys
ALTER TABLE stage_history 
ADD CONSTRAINT fk_stage_history_application_id 
FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE CASCADE;

ALTER TABLE stage_history 
ADD CONSTRAINT fk_stage_history_actor_id 
FOREIGN KEY (actor_id) REFERENCES users(id);

-- Payments table foreign keys
ALTER TABLE payments 
ADD CONSTRAINT fk_payments_application_id 
FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE RESTRICT;

ALTER TABLE payments 
ADD CONSTRAINT fk_payments_proof_document_id 
FOREIGN KEY (proof_document_id) REFERENCES documents(id);

ALTER TABLE payments 
ADD CONSTRAINT fk_payments_processed_by 
FOREIGN KEY (processed_by) REFERENCES users(id);

ALTER TABLE payments 
ADD CONSTRAINT fk_payments_created_by 
FOREIGN KEY (created_by) REFERENCES users(id);

-- Commissions table foreign keys
ALTER TABLE commissions 
ADD CONSTRAINT fk_commissions_application_id 
FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE RESTRICT;

ALTER TABLE commissions 
ADD CONSTRAINT fk_commissions_student_id 
FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE RESTRICT;

ALTER TABLE commissions 
ADD CONSTRAINT fk_commissions_partner_id 
FOREIGN KEY (partner_id) REFERENCES partners(id) ON DELETE RESTRICT;

ALTER TABLE commissions 
ADD CONSTRAINT fk_commissions_program_id 
FOREIGN KEY (program_id) REFERENCES programs(id) ON DELETE RESTRICT;

ALTER TABLE commissions 
ADD CONSTRAINT fk_commissions_transfer_document_id 
FOREIGN KEY (transfer_document_id) REFERENCES documents(id);

ALTER TABLE commissions 
ADD CONSTRAINT fk_commissions_approved_by 
FOREIGN KEY (approved_by) REFERENCES users(id);

ALTER TABLE commissions 
ADD CONSTRAINT fk_commissions_released_by 
FOREIGN KEY (released_by) REFERENCES users(id);

-- Visa Records table foreign keys
ALTER TABLE visa_records 
ADD CONSTRAINT fk_visa_records_application_id 
FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE CASCADE;

ALTER TABLE visa_records 
ADD CONSTRAINT fk_visa_records_student_id 
FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE RESTRICT;

ALTER TABLE visa_records 
ADD CONSTRAINT fk_visa_records_approval_letter_id 
FOREIGN KEY (approval_letter_id) REFERENCES documents(id);

ALTER TABLE visa_records 
ADD CONSTRAINT fk_visa_records_visa_document_id 
FOREIGN KEY (visa_document_id) REFERENCES documents(id);

ALTER TABLE visa_records 
ADD CONSTRAINT fk_visa_records_created_by 
FOREIGN KEY (created_by) REFERENCES users(id);

-- Arrival Records table foreign keys
ALTER TABLE arrival_records 
ADD CONSTRAINT fk_arrival_records_application_id 
FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE CASCADE;

ALTER TABLE arrival_records 
ADD CONSTRAINT fk_arrival_records_student_id 
FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE RESTRICT;

ALTER TABLE arrival_records 
ADD CONSTRAINT fk_arrival_records_visa_record_id 
FOREIGN KEY (visa_record_id) REFERENCES visa_records(id);

ALTER TABLE arrival_records 
ADD CONSTRAINT fk_arrival_records_verified_by 
FOREIGN KEY (verified_by) REFERENCES users(id);

ALTER TABLE arrival_records 
ADD CONSTRAINT fk_arrival_records_created_by 
FOREIGN KEY (created_by) REFERENCES users(id);

-- Comments table foreign keys
ALTER TABLE comments 
ADD CONSTRAINT fk_comments_application_id 
FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE CASCADE;

ALTER TABLE comments 
ADD CONSTRAINT fk_comments_parent_comment_id 
FOREIGN KEY (parent_comment_id) REFERENCES comments(id);

ALTER TABLE comments 
ADD CONSTRAINT fk_comments_author_id 
FOREIGN KEY (author_id) REFERENCES users(id);

-- Notifications table foreign keys
ALTER TABLE notifications 
ADD CONSTRAINT fk_notifications_user_id 
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE notifications 
ADD CONSTRAINT fk_notifications_partner_id 
FOREIGN KEY (partner_id) REFERENCES partners(id) ON DELETE CASCADE;

ALTER TABLE notifications 
ADD CONSTRAINT fk_notifications_application_id 
FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE CASCADE;

ALTER TABLE notifications 
ADD CONSTRAINT fk_notifications_document_id 
FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE SET NULL;

ALTER TABLE notifications 
ADD CONSTRAINT fk_notifications_commission_id 
FOREIGN KEY (commission_id) REFERENCES commissions(id) ON DELETE SET NULL;

-- Audit Logs table foreign keys
ALTER TABLE audit_logs 
ADD CONSTRAINT fk_audit_logs_application_id 
FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE SET NULL;

ALTER TABLE audit_logs 
ADD CONSTRAINT fk_audit_logs_user_id 
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL;

ALTER TABLE audit_logs 
ADD CONSTRAINT fk_audit_logs_partner_id 
FOREIGN KEY (partner_id) REFERENCES partners(id) ON DELETE SET NULL;

ALTER TABLE audit_logs 
ADD CONSTRAINT fk_audit_logs_student_id 
FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE SET NULL;

ALTER TABLE audit_logs 
ADD CONSTRAINT fk_audit_logs_actor_id 
FOREIGN KEY (actor_id) REFERENCES users(id);

-- Activity Logs table foreign keys
ALTER TABLE activity_logs 
ADD CONSTRAINT fk_activity_logs_user_id 
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL;

ALTER TABLE activity_logs 
ADD CONSTRAINT fk_activity_logs_partner_id 
FOREIGN KEY (partner_id) REFERENCES partners(id) ON DELETE SET NULL;

ALTER TABLE activity_logs 
ADD CONSTRAINT fk_activity_logs_application_id 
FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE SET NULL;

-- Logistics Partners table foreign keys
ALTER TABLE logistics_partners 
ADD CONSTRAINT fk_logistics_partners_created_by 
FOREIGN KEY (created_by) REFERENCES users(id);

-- System Settings table foreign keys
ALTER TABLE system_settings 
ADD CONSTRAINT fk_system_settings_last_modified_by 
FOREIGN KEY (last_modified_by) REFERENCES users(id);

-- Email Templates table foreign keys
ALTER TABLE email_templates 
ADD CONSTRAINT fk_email_templates_parent_template_id 
FOREIGN KEY (parent_template_id) REFERENCES email_templates(id);

ALTER TABLE email_templates 
ADD CONSTRAINT fk_email_templates_created_by 
FOREIGN KEY (created_by) REFERENCES users(id);

-- Sessions table foreign keys
ALTER TABLE sessions 
ADD CONSTRAINT fk_sessions_user_id 
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- Attachments table foreign keys
ALTER TABLE attachments 
ADD CONSTRAINT fk_attachments_uploaded_by 
FOREIGN KEY (uploaded_by) REFERENCES users(id);

-- =====================================================
-- STEP 3: CREATE INDEXES FOR PERFORMANCE
-- =====================================================

-- Core entity indexes
CREATE INDEX idx_applications_student_id ON applications(student_id);
CREATE INDEX idx_applications_partner_id ON applications(partner_id);
CREATE INDEX idx_applications_current_stage ON applications(current_stage);
CREATE INDEX idx_applications_current_status ON applications(current_status);
CREATE INDEX idx_applications_priority ON applications(priority);
CREATE INDEX idx_applications_created_at ON applications(created_at DESC);
CREATE INDEX idx_applications_updated_at ON applications(updated_at DESC);
CREATE INDEX idx_applications_tracking_number ON applications(tracking_number);
CREATE INDEX idx_applications_has_action_required ON applications(has_action_required);

-- Document indexes
CREATE INDEX idx_documents_application_id ON documents(application_id);
CREATE INDEX idx_documents_type ON documents(type);
CREATE INDEX idx_documents_status ON documents(status);
CREATE INDEX idx_documents_stage ON documents(stage);
CREATE INDEX idx_documents_uploaded_at ON documents(uploaded_at DESC);

-- Commission indexes
CREATE INDEX idx_commissions_partner_id ON commissions(partner_id);
CREATE INDEX idx_commissions_status ON commissions(status);
CREATE INDEX idx_commissions_created_at ON commissions(created_at DESC);
CREATE INDEX idx_commissions_enrollment_date ON commissions(enrollment_date);

-- Program catalog indexes
CREATE INDEX idx_programs_university_id ON programs(university_id);
CREATE INDEX idx_programs_level_id ON programs(level_id);
CREATE INDEX idx_programs_field_of_study_id ON programs(field_of_study_id);
CREATE INDEX idx_programs_is_active ON programs(is_active);
CREATE INDEX idx_programs_fees ON programs(fees);

-- Search indexes for programs
CREATE INDEX idx_programs_name_search ON programs USING GIN(to_tsvector('english', name));
CREATE INDEX idx_programs_keywords_search ON programs USING GIN(search_keywords);

-- Student indexes
CREATE INDEX idx_students_email ON students(email);
CREATE INDEX idx_students_nationality ON students(nationality);
CREATE INDEX idx_students_passport_number ON students(passport_number);

-- Partner indexes
CREATE INDEX idx_partners_email ON partners(email);
CREATE INDEX idx_partners_status ON partners(status);
CREATE INDEX idx_partners_tier ON partners(tier);
CREATE INDEX idx_partners_country ON partners(country);

-- Audit and activity indexes
CREATE INDEX idx_audit_logs_application_id ON audit_logs(application_id);
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_timestamp ON audit_logs(timestamp DESC);
CREATE INDEX idx_audit_logs_event_type ON audit_logs(event_type);

CREATE INDEX idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX idx_activity_logs_created_at ON activity_logs(created_at DESC);

-- Notification indexes
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_status ON notifications(status);
CREATE INDEX idx_notifications_scheduled_at ON notifications(scheduled_at);

-- Session indexes
CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_sessions_session_token ON sessions(session_token);
CREATE INDEX idx_sessions_expires_at ON sessions(expires_at);

-- Composite indexes for common queries
CREATE INDEX idx_applications_stage_status ON applications(current_stage, current_status);
CREATE INDEX idx_applications_partner_stage ON applications(partner_id, current_stage);
CREATE INDEX idx_documents_app_type_status ON documents(application_id, type, status);
CREATE INDEX idx_stage_history_app_timestamp ON stage_history(application_id, timestamp DESC);

-- =====================================================
-- STEP 4: ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE commissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- User access policies
CREATE POLICY "Users can view their own data" ON users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Admins can view all users" ON users
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Partner access policies
CREATE POLICY "Partners can view their own data" ON partners
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND partner_id = partners.id
        )
    );

CREATE POLICY "Admins can view all partners" ON partners
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Application access policies
CREATE POLICY "Partners can view their own applications" ON applications
    FOR SELECT USING (
        partner_id IN (
            SELECT partner_id FROM users WHERE id = auth.uid()
        )
    );

CREATE POLICY "Admins can view all applications" ON applications
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Document access policies
CREATE POLICY "Users can access documents for their applications" ON documents
    FOR SELECT USING (
        application_id IN (
            SELECT id FROM applications 
            WHERE partner_id IN (
                SELECT partner_id FROM users WHERE id = auth.uid()
            )
        ) OR
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Commission access policies
CREATE POLICY "Partners can view their own commissions" ON commissions
    FOR SELECT USING (
        partner_id IN (
            SELECT partner_id FROM users WHERE id = auth.uid()
        )
    );

CREATE POLICY "Admins can view all commissions" ON commissions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- =====================================================
-- STEP 5: TRIGGERS FOR AUTOMATION
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers to relevant tables
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_partners_updated_at
    BEFORE UPDATE ON partners
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_students_updated_at
    BEFORE UPDATE ON students
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_applications_updated_at
    BEFORE UPDATE ON applications
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_documents_updated_at
    BEFORE UPDATE ON documents
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_commissions_updated_at
    BEFORE UPDATE ON commissions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to create audit log entry
CREATE OR REPLACE FUNCTION create_audit_log()
RETURNS TRIGGER AS $$
DECLARE
    operation_type TEXT;
    old_values JSONB;
    new_values JSONB;
BEGIN
    -- Determine operation type
    IF TG_OP = 'DELETE' THEN
        operation_type := 'delete';
        old_values := row_to_json(OLD)::jsonb;
        new_values := NULL;
    ELSIF TG_OP = 'INSERT' THEN
        operation_type := 'create';
        old_values := NULL;
        new_values := row_to_json(NEW)::jsonb;
    ELSIF TG_OP = 'UPDATE' THEN
        operation_type := 'update';
        old_values := row_to_json(OLD)::jsonb;
        new_values := row_to_json(NEW)::jsonb;
    END IF;

    -- Insert audit log entry
    INSERT INTO audit_logs (
        entity_type,
        entity_id,
        event_type,
        action,
        previous_values,
        new_values,
        actor_id
    ) VALUES (
        TG_TABLE_NAME,
        COALESCE(NEW.id, OLD.id),
        operation_type,
        TG_OP,
        old_values,
        new_values,
        auth.uid()
    );

    IF TG_OP = 'DELETE' THEN
        RETURN OLD;
    ELSE
        RETURN NEW;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Apply audit triggers to core tables
CREATE TRIGGER audit_applications
    AFTER INSERT OR UPDATE OR DELETE ON applications
    FOR EACH ROW EXECUTE FUNCTION create_audit_log();

CREATE TRIGGER audit_documents
    AFTER INSERT OR UPDATE OR DELETE ON documents
    FOR EACH ROW EXECUTE FUNCTION create_audit_log();

CREATE TRIGGER audit_commissions
    AFTER INSERT OR UPDATE OR DELETE ON commissions
    FOR EACH ROW EXECUTE FUNCTION create_audit_log();

-- Function to update application last_activity_at
CREATE OR REPLACE FUNCTION update_application_activity()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE applications 
    SET last_activity_at = NOW()
    WHERE id = NEW.application_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update application activity on related changes
CREATE TRIGGER update_activity_on_document_change
    AFTER INSERT OR UPDATE ON documents
    FOR EACH ROW EXECUTE FUNCTION update_application_activity();

CREATE TRIGGER update_activity_on_comment_insert
    AFTER INSERT ON comments
    FOR EACH ROW EXECUTE FUNCTION update_application_activity();

-- Function to auto-generate tracking numbers
CREATE OR REPLACE FUNCTION generate_tracking_number()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.tracking_number IS NULL THEN
        NEW.tracking_number := 'UNI' || TO_CHAR(NOW(), 'YYYY') || 
                              LPAD(EXTRACT(DOY FROM NOW())::TEXT, 3, '0') || 
                              LPAD(NEXTVAL('tracking_number_seq')::TEXT, 4, '0');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create sequence for tracking numbers
CREATE SEQUENCE IF NOT EXISTS tracking_number_seq START 1;

-- Apply tracking number trigger
CREATE TRIGGER generate_application_tracking_number
    BEFORE INSERT ON applications
    FOR EACH ROW EXECUTE FUNCTION generate_tracking_number();

-- =====================================================
-- STEP 6: VIEWS FOR DASHBOARD ANALYTICS
-- =====================================================

-- Application Statistics View
CREATE VIEW application_stats AS
SELECT 
    COUNT(*) as total_applications,
    COUNT(*) FILTER (WHERE current_stage = 1) as stage_1_count,
    COUNT(*) FILTER (WHERE current_stage = 2) as stage_2_count,
    COUNT(*) FILTER (WHERE current_stage = 3) as stage_3_count,
    COUNT(*) FILTER (WHERE current_stage = 4) as stage_4_count,
    COUNT(*) FILTER (WHERE current_stage = 5) as stage_5_count,
    COUNT(*) FILTER (WHERE current_status LIKE '%approved%') as approved_count,
    COUNT(*) FILTER (WHERE current_status LIKE '%rejected%') as rejected_count,
    COUNT(*) FILTER (WHERE has_action_required = true) as action_required_count,
    AVG(processing_days) as avg_processing_days
FROM applications
WHERE NOT is_cancelled;

-- Partner Performance View
CREATE VIEW partner_performance AS
SELECT 
    p.id,
    p.name,
    p.tier,
    COUNT(a.id) as total_applications,
    COUNT(*) FILTER (WHERE a.current_stage >= 4) as successful_applications,
    ROUND(
        COUNT(*) FILTER (WHERE a.current_stage >= 4)::numeric / 
        NULLIF(COUNT(a.id), 0) * 100, 2
    ) as success_rate,
    SUM(c.net_commission) FILTER (WHERE c.status = 'commission_paid') as total_earned,
    SUM(c.net_commission) FILTER (WHERE c.status IN ('commission_pending', 'commission_approved')) as pending_commission,
    AVG(a.processing_days) as avg_processing_days,
    MAX(a.created_at) as last_application_date
FROM partners p
LEFT JOIN applications a ON p.id = a.partner_id AND NOT a.is_cancelled
LEFT JOIN commissions c ON p.id = c.partner_id
WHERE p.status = 'approved'
GROUP BY p.id, p.name, p.tier;

-- Monthly Commission Summary View
CREATE VIEW monthly_commission_summary AS
SELECT 
    DATE_TRUNC('month', enrollment_date) as month,
    COUNT(*) as total_commissions,
    SUM(gross_commission) as total_gross,
    SUM(net_commission) as total_net,
    AVG(commission_rate) as avg_rate,
    COUNT(*) FILTER (WHERE status = 'commission_paid') as paid_count,
    SUM(net_commission) FILTER (WHERE status = 'commission_paid') as paid_amount
FROM commissions
GROUP BY DATE_TRUNC('month', enrollment_date)
ORDER BY month DESC;

-- =====================================================
-- STEP 7: BUSINESS LOGIC FUNCTIONS
-- =====================================================

-- Function to calculate commission
CREATE OR REPLACE FUNCTION calculate_commission_amount(
    p_tuition_fee DECIMAL,
    p_partner_tier VARCHAR,
    p_university_id UUID DEFAULT NULL,
    p_program_name VARCHAR DEFAULT NULL,
    p_student_nationality VARCHAR DEFAULT NULL
)
RETURNS TABLE (
    base_rate DECIMAL,
    effective_rate DECIMAL,
    gross_commission DECIMAL,
    processing_fee DECIMAL,
    net_commission DECIMAL
) AS $$
DECLARE
    base_rate_val DECIMAL;
    effective_rate_val DECIMAL;
    processing_fee_rate DECIMAL := 0.02; -- 2%
BEGIN
    -- Base tier rates
    base_rate_val := CASE 
        WHEN p_partner_tier = 'bronze' THEN 0.10
        WHEN p_partner_tier = 'silver' THEN 0.125
        WHEN p_partner_tier = 'gold' THEN 0.15
        ELSE 0.10
    END;
    
    effective_rate_val := base_rate_val;
    
    -- Apply program-specific adjustments
    IF p_program_name ILIKE '%medicine%' OR p_program_name ILIKE '%dentistry%' THEN
        effective_rate_val := LEAST(effective_rate_val, 0.08); -- Max 8% for medical programs
    ELSIF p_program_name ILIKE '%business%' THEN
        effective_rate_val := GREATEST(effective_rate_val, 0.15); -- Min 15% for business
    END IF;
    
    -- Country-specific bonuses
    IF p_student_nationality = 'Sudan' THEN
        effective_rate_val := effective_rate_val + 0.02; -- +2% for Sudan
    ELSIF p_student_nationality = 'Oman' THEN
        effective_rate_val := effective_rate_val + 0.015; -- +1.5% for Oman
    END IF;
    
    -- Calculate amounts
    RETURN QUERY SELECT 
        base_rate_val,
        effective_rate_val,
        (p_tuition_fee * effective_rate_val)::DECIMAL,
        (p_tuition_fee * effective_rate_val * processing_fee_rate)::DECIMAL,
        (p_tuition_fee * effective_rate_val * (1 - processing_fee_rate))::DECIMAL;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- STEP 8: INITIAL CONFIGURATION DATA
-- =====================================================

-- Insert default system settings
INSERT INTO system_settings (category, key, value, value_type, description) VALUES
('commission', 'bronze_rate', '0.10', 'number', 'Commission rate for bronze tier partners'),
('commission', 'silver_rate', '0.125', 'number', 'Commission rate for silver tier partners'),
('commission', 'gold_rate', '0.15', 'number', 'Commission rate for gold tier partners'),
('commission', 'processing_fee_rate', '0.02', 'number', 'Processing fee rate (2%)'),
('commission', 'min_students_silver', '10', 'number', 'Minimum students for silver tier'),
('commission', 'min_students_gold', '25', 'number', 'Minimum students for gold tier'),

('workflow', 'auto_progress_enabled', 'true', 'boolean', 'Enable automatic status progression'),
('workflow', 'notification_enabled', 'true', 'boolean', 'Enable email notifications'),
('workflow', 'sms_notification_enabled', 'false', 'boolean', 'Enable SMS notifications'),

('document', 'max_file_size_mb', '50', 'number', 'Maximum file size for document uploads (MB)'),
('document', 'allowed_extensions', '["pdf", "jpg", "jpeg", "png", "doc", "docx"]', 'json', 'Allowed file extensions'),
('document', 'auto_approve_resubmissions', 'false', 'boolean', 'Auto-approve document resubmissions'),

('email', 'smtp_host', '', 'string', 'SMTP server host'),
('email', 'smtp_port', '587', 'number', 'SMTP server port'),
('email', 'from_email', 'noreply@unibexs.com', 'string', 'Default from email address'),
('email', 'from_name', 'UniBexs System', 'string', 'Default from name'),

('application', 'tracking_number_prefix', 'UNI', 'string', 'Prefix for tracking numbers'),
('application', 'default_processing_days', '30', 'number', 'Default estimated processing days'),
('application', 'urgent_threshold_days', '7', 'number', 'Days threshold for urgent applications');

-- Insert basic email templates
INSERT INTO email_templates (name, category, subject, body_text, body_html, variables, required_variables) VALUES
('application_submitted', 'status_update', 
'Application Submitted - {{tracking_number}}',
'Dear {{student_name}},

Your application for {{program_name}} at {{university_name}} has been successfully submitted.

Tracking Number: {{tracking_number}}
Intake Date: {{intake_date}}

Our team will review your application and contact you within 2-3 business days.

Best regards,
UniBexs Team',
'<p>Dear {{student_name}},</p>
<p>Your application for <strong>{{program_name}}</strong> at <strong>{{university_name}}</strong> has been successfully submitted.</p>
<ul>
<li><strong>Tracking Number:</strong> {{tracking_number}}</li>
<li><strong>Intake Date:</strong> {{intake_date}}</li>
</ul>
<p>Our team will review your application and contact you within 2-3 business days.</p>
<p>Best regards,<br>UniBexs Team</p>',
'{"student_name": "Student full name", "program_name": "Program name", "university_name": "University name", "tracking_number": "Application tracking number", "intake_date": "Intake date"}',
'{student_name,program_name,university_name,tracking_number}');

-- Insert sample fields of study
INSERT INTO fields_of_study (name, code, description, keywords, icon) VALUES
('Computer Science', 'CS', 'Computing, programming, software development', '{programming,software,coding,IT,technology}', '💻'),
('Business Administration', 'BA', 'Business management, entrepreneurship, marketing', '{business,management,marketing,finance,MBA}', '💼'),
('Engineering', 'ENG', 'Various engineering disciplines', '{engineering,mechanical,electrical,civil,chemical}', '⚙️'),
('Medicine', 'MED', 'Medical sciences, healthcare', '{medicine,medical,healthcare,doctor,physician}', '⚕️'),
('Law', 'LAW', 'Legal studies, jurisprudence', '{law,legal,lawyer,attorney,justice}', '⚖️');

-- =====================================================
-- COMPLETION MESSAGE
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE '✅ UNIBEXS DATABASE SCHEMA CREATED SUCCESSFULLY!';
    RAISE NOTICE '';
    RAISE NOTICE 'Created:';
    RAISE NOTICE '- 25+ production-ready tables';
    RAISE NOTICE '- All foreign key constraints';
    RAISE NOTICE '- Performance indexes';
    RAISE NOTICE '- Row Level Security (RLS) policies';
    RAISE NOTICE '- Automated triggers';
    RAISE NOTICE '- Dashboard analytics views';
    RAISE NOTICE '- Business logic functions';
    RAISE NOTICE '- Initial configuration data';
    RAISE NOTICE '';
    RAISE NOTICE 'Ready for production deployment!';
END $$;