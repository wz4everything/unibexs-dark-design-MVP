-- =====================================================
-- UNIBEXS MVP DATABASE SCHEMA - VERSION 5
-- =====================================================
-- STREAMLINED UX-FOCUSED DESIGN
-- Based on industry research (ApplyBoard) and standardized document requirements
--
-- KEY IMPROVEMENTS FROM V4:
-- 1. Commission transparency (embedded in program URLs)
-- 2. Streamlined 3-step application flow
-- 3. Standardized document requirements from Excel
-- 4. Partner dashboard with performance tracking
-- 5. Smart document filtering by program level & nationality
-- 6. Mobile-first design with auto-save support
--
-- DESIGN PHILOSOPHY:
-- - Partners see commission rates BEFORE applying (transparency)
-- - Only 3 steps: Student → Program → Documents
-- - Excel-based document standardization
-- - Real-time commission tracking for partners
-- - ApplyBoard-inspired UX patterns
--
-- Execute this entire file in Supabase SQL Editor to create the V5 database
-- =====================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- STEP 1: CREATE CORE TABLES
-- =====================================================

-- Users table (Admin and Partner login accounts)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'partner')),
    name VARCHAR(255) NOT NULL,
    partner_id UUID, -- Will add FK constraint later
    is_active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Partners table (Agencies with performance tracking)
CREATE TABLE partners (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Basic Information
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(50) NOT NULL,
    country VARCHAR(100) NOT NULL,
    
    -- Status & Verification
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('pending', 'active', 'suspended', 'rejected')),
    tier VARCHAR(10) DEFAULT 'bronze' CHECK (tier IN ('bronze', 'silver', 'gold', 'platinum')),
    
    -- Performance Metrics (NEW for V5)
    total_applications INTEGER DEFAULT 0,
    successful_applications INTEGER DEFAULT 0,
    total_commission_earned DECIMAL(15,2) DEFAULT 0.00,
    average_conversion_rate DECIMAL(5,2) DEFAULT 0.00,
    current_month_applications INTEGER DEFAULT 0,
    last_application_date TIMESTAMP WITH TIME ZONE,
    
    -- Settings
    preferred_countries JSONB DEFAULT '[]'::JSONB, -- Frequently applied countries
    auto_save_enabled BOOLEAN DEFAULT TRUE,
    notification_preferences JSONB DEFAULT '{"email": true, "dashboard": true}'::JSONB,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Students table (Data records created by partners)
CREATE TABLE students (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Partner relationship (REQUIRED)
    partner_id UUID NOT NULL, -- Will add FK constraint later
    
    -- Basic Information (Excel: Information Fields)
    full_name VARCHAR(255) NOT NULL, -- "Full Name (as per passport)"
    email VARCHAR(255) NOT NULL,
    passport_number VARCHAR(50) NOT NULL,
    date_of_birth DATE NOT NULL,
    nationality VARCHAR(100) NOT NULL,
    phone VARCHAR(50),
    
    -- Optional Information
    current_address TEXT,
    emergency_contact_name VARCHAR(255),
    emergency_contact_phone VARCHAR(50),
    parent_guardian_name VARCHAR(255),
    
    -- Academic Background (simplified)
    highest_education VARCHAR(50), -- High School, Bachelor, Master
    graduation_year INTEGER,
    english_proficiency_type VARCHAR(20), -- IELTS, TOEFL, MUET, etc.
    english_proficiency_score VARCHAR(20),
    
    -- Status
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    applications_count INTEGER DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Unique constraint: One passport per partner
    UNIQUE(partner_id, passport_number)
);

-- Programs Info table (NEW for V5 - URL-based with commission tracking)
CREATE TABLE programs_info (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- URL-based approach
    program_url TEXT UNIQUE NOT NULL,
    url_hash VARCHAR(64) UNIQUE, -- For fast lookups
    
    -- Extracted/Manual Information
    university_name VARCHAR(255),
    program_name VARCHAR(255),
    program_level VARCHAR(50) CHECK (program_level IN ('Foundation', 'Diploma', 'Bachelor', 'Master', 'PhD')),
    country VARCHAR(100),
    city VARCHAR(100),
    
    -- Financial Information (COMMISSION TRANSPARENCY)
    tuition_fee DECIMAL(15,2),
    application_fee DECIMAL(10,2),
    commission_percentage DECIMAL(5,2) NOT NULL, -- Partner commission rate
    commission_type VARCHAR(20) DEFAULT 'percentage' CHECK (commission_type IN ('percentage', 'fixed')),
    commission_amount DECIMAL(15,2), -- If fixed commission
    currency VARCHAR(3) DEFAULT 'USD',
    
    -- Program Details
    intake_dates JSONB DEFAULT '[]'::JSONB, -- Array of intake dates
    application_deadline DATE,
    program_duration VARCHAR(50),
    program_description TEXT,
    
    -- Document Requirements (Excel-based)
    required_documents JSONB DEFAULT '[]'::JSONB, -- From standardized list
    optional_documents JSONB DEFAULT '[]'::JSONB,
    conditional_documents JSONB DEFAULT '[]'::JSONB, -- Nationality-specific
    
    -- Metadata
    is_verified BOOLEAN DEFAULT FALSE,
    verified_by UUID, -- Admin who verified
    verified_at TIMESTAMP WITH TIME ZONE,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    applications_count INTEGER DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Applications table (Streamlined for 3-step flow)
CREATE TABLE applications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Core References
    student_id UUID NOT NULL, -- Will add FK constraint later
    partner_id UUID NOT NULL, -- Will add FK constraint later
    program_info_id UUID, -- Will add FK constraint later
    assigned_admin_id UUID, -- Will add FK constraint later
    
    -- Application Details
    tracking_number VARCHAR(50) UNIQUE,
    intended_intake DATE NOT NULL,
    priority VARCHAR(10) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
    
    -- Workflow Status (5-stage system)
    current_stage INTEGER NOT NULL DEFAULT 1 CHECK (current_stage BETWEEN 1 AND 5),
    current_status VARCHAR(100) NOT NULL,
    
    -- Commission Tracking (NEW for V5)
    commission_percentage DECIMAL(5,2), -- Copied from program
    estimated_commission DECIMAL(15,2), -- Calculated amount
    commission_status VARCHAR(20) DEFAULT 'pending' CHECK (commission_status IN ('pending', 'earned', 'paid')),
    commission_paid_at TIMESTAMP WITH TIME ZONE,
    
    -- Document Status Tracking
    required_documents_count INTEGER DEFAULT 0,
    uploaded_documents_count INTEGER DEFAULT 0,
    approved_documents_count INTEGER DEFAULT 0,
    document_completion_percentage DECIMAL(5,2) DEFAULT 0.00,
    
    -- Auto-save Support (NEW for V5)
    draft_data JSONB DEFAULT '{}'::JSONB, -- For form auto-save
    last_auto_save TIMESTAMP WITH TIME ZONE,
    is_submitted BOOLEAN DEFAULT FALSE,
    
    -- Status Management
    rejection_reason TEXT,
    hold_reason TEXT,
    cancel_reason TEXT,
    
    -- Timeline
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    submitted_at TIMESTAMP WITH TIME ZONE
);

-- Document Requirements Master (NEW - Excel standardization)
CREATE TABLE document_requirements_master (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- From Excel: Document Uploads sheet
    document_name VARCHAR(255) NOT NULL,
    document_code VARCHAR(50) UNIQUE NOT NULL, -- passport_scan, high_school_cert, etc.
    phase VARCHAR(20) NOT NULL CHECK (phase IN ('Admission', 'Visa')),
    program_levels JSONB DEFAULT '[]'::JSONB, -- ["All"] or ["Master", "PhD"]
    requirement_type VARCHAR(20) NOT NULL CHECK (requirement_type IN ('Required', 'Optional', 'Conditional')),
    
    -- Conditions
    applicable_nationalities JSONB DEFAULT '[]'::JSONB, -- ["Sudan", "Oman"] for special docs
    applicable_countries JSONB DEFAULT '[]'::JSONB, -- University countries
    conditions TEXT, -- When this document is required
    
    -- Metadata
    description TEXT,
    file_types_accepted JSONB DEFAULT '["pdf", "jpg", "png", "doc", "docx"]'::JSONB,
    max_file_size INTEGER DEFAULT 5242880, -- 5MB in bytes
    
    -- Display
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Documents table (Application-specific document uploads)
CREATE TABLE documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    application_id UUID NOT NULL, -- Will add FK constraint later
    requirement_master_id UUID NOT NULL, -- Will add FK constraint later
    
    -- File Information
    file_name VARCHAR(255) NOT NULL,
    original_file_name VARCHAR(255) NOT NULL,
    file_url TEXT, -- Supabase Storage URL
    file_size BIGINT, -- Size in bytes
    mime_type VARCHAR(100),
    
    -- Document Status
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'under_review', 'approved', 'rejected', 'resubmission_required')),
    version INTEGER DEFAULT 1, -- For resubmissions
    
    -- Upload Information
    uploaded_by UUID, -- Will add FK constraint later
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Review Information
    reviewed_by UUID, -- Will add FK constraint later
    reviewed_at TIMESTAMP WITH TIME ZONE,
    rejection_reason TEXT,
    review_notes TEXT,
    
    -- Auto-generated fields
    expires_at DATE, -- For documents with expiry dates
    is_mandatory BOOLEAN DEFAULT TRUE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Partner Dashboard Metrics (NEW for V5)
CREATE TABLE partner_dashboard_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    partner_id UUID NOT NULL, -- Will add FK constraint later
    metric_date DATE NOT NULL,
    
    -- Daily Metrics
    applications_submitted INTEGER DEFAULT 0,
    applications_approved INTEGER DEFAULT 0,
    applications_rejected INTEGER DEFAULT 0,
    commission_earned DECIMAL(15,2) DEFAULT 0.00,
    
    -- Performance Indicators
    avg_processing_time_hours DECIMAL(8,2) DEFAULT 0.00,
    document_approval_rate DECIMAL(5,2) DEFAULT 0.00,
    
    -- Calculated fields
    conversion_rate DECIMAL(5,2) DEFAULT 0.00,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(partner_id, metric_date)
);

-- Stage History table (Audit trail)
CREATE TABLE stage_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    application_id UUID NOT NULL, -- Will add FK constraint later
    
    -- Stage Information
    stage INTEGER NOT NULL CHECK (stage BETWEEN 1 AND 5),
    status VARCHAR(100) NOT NULL,
    previous_status VARCHAR(100),
    
    -- Actor Information
    actor_id UUID, -- Will add FK constraint later
    actor_role VARCHAR(50), -- admin, partner, system
    action_taken VARCHAR(100),
    
    -- Context
    reason TEXT,
    notes TEXT,
    metadata JSONB DEFAULT '{}'::JSONB,
    
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Application Sessions (NEW - Auto-save support)
CREATE TABLE application_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Session Information
    session_token VARCHAR(255) UNIQUE NOT NULL,
    partner_id UUID NOT NULL, -- Will add FK constraint later
    student_data JSONB DEFAULT '{}'::JSONB,
    program_data JSONB DEFAULT '{}'::JSONB,
    document_data JSONB DEFAULT '{}'::JSONB,
    
    -- Progress Tracking
    current_step INTEGER DEFAULT 1 CHECK (current_step BETWEEN 1 AND 3),
    completion_percentage DECIMAL(5,2) DEFAULT 0.00,
    is_completed BOOLEAN DEFAULT FALSE,
    
    -- Timestamps
    last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '24 hours'),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- STEP 2: ADD FOREIGN KEY CONSTRAINTS
-- =====================================================

-- Users table
ALTER TABLE users 
ADD CONSTRAINT fk_users_partner_id 
FOREIGN KEY (partner_id) REFERENCES partners(id) ON DELETE SET NULL;

-- Students table
ALTER TABLE students 
ADD CONSTRAINT fk_students_partner_id 
FOREIGN KEY (partner_id) REFERENCES partners(id) ON DELETE RESTRICT;

-- Programs Info table
ALTER TABLE programs_info 
ADD CONSTRAINT fk_programs_info_verified_by 
FOREIGN KEY (verified_by) REFERENCES users(id) ON DELETE SET NULL;

-- Applications table
ALTER TABLE applications 
ADD CONSTRAINT fk_applications_student_id 
FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE RESTRICT;

ALTER TABLE applications 
ADD CONSTRAINT fk_applications_partner_id 
FOREIGN KEY (partner_id) REFERENCES partners(id) ON DELETE RESTRICT;

ALTER TABLE applications 
ADD CONSTRAINT fk_applications_program_info_id 
FOREIGN KEY (program_info_id) REFERENCES programs_info(id) ON DELETE SET NULL;

ALTER TABLE applications 
ADD CONSTRAINT fk_applications_assigned_admin_id 
FOREIGN KEY (assigned_admin_id) REFERENCES users(id) ON DELETE SET NULL;

-- Documents table
ALTER TABLE documents 
ADD CONSTRAINT fk_documents_application_id 
FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE CASCADE;

ALTER TABLE documents 
ADD CONSTRAINT fk_documents_requirement_master_id 
FOREIGN KEY (requirement_master_id) REFERENCES document_requirements_master(id) ON DELETE RESTRICT;

ALTER TABLE documents 
ADD CONSTRAINT fk_documents_uploaded_by 
FOREIGN KEY (uploaded_by) REFERENCES users(id);

ALTER TABLE documents 
ADD CONSTRAINT fk_documents_reviewed_by 
FOREIGN KEY (reviewed_by) REFERENCES users(id);

-- Partner Dashboard Metrics
ALTER TABLE partner_dashboard_metrics 
ADD CONSTRAINT fk_partner_dashboard_metrics_partner_id 
FOREIGN KEY (partner_id) REFERENCES partners(id) ON DELETE CASCADE;

-- Stage History
ALTER TABLE stage_history 
ADD CONSTRAINT fk_stage_history_application_id 
FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE CASCADE;

ALTER TABLE stage_history 
ADD CONSTRAINT fk_stage_history_actor_id 
FOREIGN KEY (actor_id) REFERENCES users(id);

-- Application Sessions
ALTER TABLE application_sessions 
ADD CONSTRAINT fk_application_sessions_partner_id 
FOREIGN KEY (partner_id) REFERENCES partners(id) ON DELETE CASCADE;

-- =====================================================
-- STEP 3: CREATE INDEXES FOR PERFORMANCE
-- =====================================================

-- Users indexes
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_partner_id ON users(partner_id);
CREATE INDEX idx_users_last_login ON users(last_login);

-- Partners indexes
CREATE INDEX idx_partners_status ON partners(status);
CREATE INDEX idx_partners_tier ON partners(tier);
CREATE INDEX idx_partners_country ON partners(country);
CREATE INDEX idx_partners_performance ON partners(total_applications, successful_applications);

-- Students indexes
CREATE INDEX idx_students_partner_id ON students(partner_id);
CREATE INDEX idx_students_nationality ON students(nationality);
CREATE INDEX idx_students_status ON students(status);

-- Programs Info indexes (CRITICAL for V5)
CREATE INDEX idx_programs_info_url_hash ON programs_info(url_hash);
CREATE INDEX idx_programs_info_program_level ON programs_info(program_level);
CREATE INDEX idx_programs_info_country ON programs_info(country);
CREATE INDEX idx_programs_info_commission ON programs_info(commission_percentage);
CREATE INDEX idx_programs_info_verified ON programs_info(is_verified);

-- Applications indexes
CREATE INDEX idx_applications_current_stage ON applications(current_stage);
CREATE INDEX idx_applications_current_status ON applications(current_status);
CREATE INDEX idx_applications_partner_id ON applications(partner_id);
CREATE INDEX idx_applications_student_id ON applications(student_id);
CREATE INDEX idx_applications_program_info_id ON applications(program_info_id);
CREATE INDEX idx_applications_tracking_number ON applications(tracking_number);
CREATE INDEX idx_applications_commission_status ON applications(commission_status);
CREATE INDEX idx_applications_is_submitted ON applications(is_submitted);

-- Document Requirements Master
CREATE INDEX idx_doc_req_master_code ON document_requirements_master(document_code);
CREATE INDEX idx_doc_req_master_phase ON document_requirements_master(phase);
CREATE INDEX idx_doc_req_master_active ON document_requirements_master(is_active);

-- Documents indexes
CREATE INDEX idx_documents_application_id ON documents(application_id);
CREATE INDEX idx_documents_requirement_master_id ON documents(requirement_master_id);
CREATE INDEX idx_documents_status ON documents(status);
CREATE INDEX idx_documents_uploaded_by ON documents(uploaded_by);

-- Dashboard Metrics
CREATE INDEX idx_dashboard_metrics_partner_date ON partner_dashboard_metrics(partner_id, metric_date);
CREATE INDEX idx_dashboard_metrics_date ON partner_dashboard_metrics(metric_date DESC);

-- Application Sessions (Auto-save)
CREATE INDEX idx_app_sessions_token ON application_sessions(session_token);
CREATE INDEX idx_app_sessions_partner ON application_sessions(partner_id);
CREATE INDEX idx_app_sessions_activity ON application_sessions(last_activity DESC);
CREATE INDEX idx_app_sessions_expires ON application_sessions(expires_at);

-- Text search indexes
CREATE INDEX idx_programs_search ON programs_info USING GIN(to_tsvector('english', university_name || ' ' || program_name));
CREATE INDEX idx_students_search ON students USING GIN(to_tsvector('english', full_name || ' ' || email));

-- =====================================================
-- STEP 4: INSERT STANDARDIZED DOCUMENT REQUIREMENTS
-- =====================================================
-- Based on Excel: Document Uploads sheet

-- Admission Phase Documents
INSERT INTO document_requirements_master (document_name, document_code, phase, program_levels, requirement_type, description, display_order) VALUES
('Passport Scan', 'passport_scan', 'Admission', '["All"]', 'Required', 'Clear scan of passport bio page', 1),
('High School Certificate / Transcript', 'high_school_cert', 'Admission', '["Foundation", "Bachelor"]', 'Required', 'Official high school graduation documents', 2),
('Bachelor''s Certificate + Transcript', 'bachelor_cert', 'Admission', '["Master", "PhD"]', 'Required', 'Official bachelor degree documents', 3),
('Master''s Certificate + Transcript', 'master_cert', 'Admission', '["PhD"]', 'Required', 'Official master degree documents', 4),
('English Certificate (IELTS/MUET/etc.)', 'english_cert', 'Admission', '["All"]', 'Optional', 'English proficiency test results', 5),
('Statement of Purpose', 'statement_purpose', 'Admission', '["Master", "PhD"]', 'Required', 'Personal statement for graduate programs', 6),
('Research Proposal', 'research_proposal', 'Admission', '["Master by Research", "PhD"]', 'Required', 'Detailed research proposal', 7),
('Recommendation Letters (2)', 'recommendation_letters', 'Admission', '["Master", "PhD"]', 'Required', 'Academic or professional references', 8),
('CV / Resume', 'cv_resume', 'Admission', '["Master", "PhD"]', 'Required', 'Current curriculum vitae', 9),
('White Background Photo', 'white_bg_photo', 'Admission', '["All"]', 'Optional', 'Passport-style photograph', 10),
('Birth Certificate', 'birth_certificate', 'Admission', '["All"]', 'Optional', 'Official birth certificate', 11),
('Address Proof', 'address_proof', 'Admission', '["All"]', 'Optional', 'Utility bill or official address proof', 12),
('Application Form', 'application_form', 'Admission', '["All"]', 'Optional', 'University-specific application form', 13);

-- Visa Phase Documents
INSERT INTO document_requirements_master (document_name, document_code, phase, program_levels, requirement_type, description, display_order, applicable_nationalities) VALUES
('Offer Letter', 'offer_letter', 'Visa', '["All"]', 'Required', 'Official university offer letter', 20, '[]'),
('Visa Application Form', 'visa_application', 'Visa', '["All"]', 'Required', 'Completed visa application form', 21, '[]'),
('Medical Report (EMGS format)', 'medical_report', 'Visa', '["All"]', 'Required', 'Medical examination report', 22, '[]'),
('Bank Statement', 'bank_statement', 'Visa', '["All"]', 'Required', 'Financial proof documents', 23, '[]'),
('Sponsor Letter / Financial Guarantee', 'sponsor_letter', 'Visa', '["All"]', 'Required', 'Sponsorship documentation', 24, '[]'),
('Visa Fee Receipt', 'visa_fee_receipt', 'Visa', '["All"]', 'Required', 'Proof of visa fee payment', 25, '[]'),
('Passport-Size Photo', 'passport_photo', 'Visa', '["All"]', 'Required', 'Recent passport-sized photographs', 26, '[]'),
('Affidavit Letter', 'affidavit_letter', 'Visa', '["All"]', 'Conditional', 'Required if name differs on documents', 27, '[]'),
('Yellow Fever Certificate', 'yellow_fever_cert', 'Visa', '["All"]', 'Conditional', 'Required for Sudanese students', 28, '["Sudan"]'),
('NOC from Embassy', 'embassy_noc', 'Visa', '["All"]', 'Conditional', 'No Objection Certificate', 29, '["Sudan", "Oman", "Libya"]');

-- =====================================================
-- STEP 5: TRIGGERS AND FUNCTIONS
-- =====================================================

-- Updated timestamp trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_partners_updated_at BEFORE UPDATE ON partners FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_students_updated_at BEFORE UPDATE ON students FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_programs_info_updated_at BEFORE UPDATE ON programs_info FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_applications_updated_at BEFORE UPDATE ON applications FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_documents_updated_at BEFORE UPDATE ON documents FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Auto-generate tracking numbers
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

CREATE SEQUENCE IF NOT EXISTS tracking_number_seq START 1;
CREATE TRIGGER generate_application_tracking_number BEFORE INSERT ON applications FOR EACH ROW EXECUTE FUNCTION generate_tracking_number();

-- Auto-generate URL hash for programs
CREATE OR REPLACE FUNCTION generate_url_hash()
RETURNS TRIGGER AS $$
BEGIN
    NEW.url_hash := encode(sha256(NEW.program_url::bytea), 'hex');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER generate_program_url_hash BEFORE INSERT OR UPDATE ON programs_info FOR EACH ROW EXECUTE FUNCTION generate_url_hash();

-- Update partner performance metrics
CREATE OR REPLACE FUNCTION update_partner_metrics()
RETURNS TRIGGER AS $$
BEGIN
    -- Update partner total applications
    UPDATE partners 
    SET total_applications = total_applications + 1,
        last_application_date = NOW(),
        current_month_applications = CASE 
            WHEN DATE_TRUNC('month', NOW()) = DATE_TRUNC('month', last_application_date) 
            THEN current_month_applications + 1 
            ELSE 1 
        END
    WHERE id = NEW.partner_id;
    
    -- Update program application count
    IF NEW.program_info_id IS NOT NULL THEN
        UPDATE programs_info 
        SET applications_count = applications_count + 1 
        WHERE id = NEW.program_info_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_partner_metrics_on_application AFTER INSERT ON applications FOR EACH ROW EXECUTE FUNCTION update_partner_metrics();

-- =====================================================
-- STEP 6: SAMPLE DATA WITH COMMISSION TRANSPARENCY
-- =====================================================

-- Insert Admin User
INSERT INTO users (id, email, password_hash, role, name) VALUES
('22222222-2222-2222-2222-222222222222', 'admin@unibexs.com', crypt('admin123', gen_salt('bf')), 'admin', 'System Administrator');

-- Insert Sample Partners with Performance Data
INSERT INTO partners (id, name, email, phone, country, tier, total_applications, successful_applications, total_commission_earned) VALUES
('11111111-1111-1111-1111-111111111111', 'Global Education Partners', 'partner@globaledu.com', '+60-123-456789', 'Malaysia', 'gold', 45, 38, 15750.00),
('33333333-3333-3333-3333-333333333333', 'StudyAbroad Consultants', 'info@studyabroad.sg', '+65-987-654321', 'Singapore', 'silver', 23, 19, 8420.00);

-- Insert Partner Users
INSERT INTO users (id, email, password_hash, role, name, partner_id) VALUES
('44444444-4444-4444-4444-444444444444', 'partner@globaledu.com', crypt('partner123', gen_salt('bf')), 'partner', 'Partner Manager', '11111111-1111-1111-1111-111111111111'),
('55555555-5555-5555-5555-555555555555', 'info@studyabroad.sg', crypt('partner456', gen_salt('bf')), 'partner', 'Study Consultant', '33333333-3333-3333-3333-333333333333');

-- Insert Sample Program Information with Commission Rates
INSERT INTO programs_info (
    id, program_url, university_name, program_name, program_level, country, city,
    tuition_fee, commission_percentage, currency, intake_dates, is_verified, verified_by
) VALUES 
(
    'prog1111-1111-1111-1111-111111111111',
    'https://www.utm.my/academic/faculty-of-computing/bachelor-of-computer-science/',
    'University of Technology Malaysia',
    'Bachelor of Computer Science',
    'Bachelor',
    'Malaysia',
    'Kuala Lumpur',
    25000.00,
    12.00,
    'USD',
    '["2024-09-01", "2025-01-15", "2025-05-01"]',
    true,
    '22222222-2222-2222-2222-222222222222'
),
(
    'prog2222-2222-2222-2222-222222222222',
    'https://www.monash.edu.my/study/undergraduate/courses/business-administration',
    'Monash University Malaysia',
    'Bachelor of Business Administration', 
    'Bachelor',
    'Malaysia',
    'Subang Jaya',
    35000.00,
    15.00,
    'USD',
    '["2024-07-01", "2024-11-01", "2025-03-01"]',
    true,
    '22222222-2222-2222-2222-222222222222'
),
(
    'prog3333-3333-3333-3333-333333333333',
    'https://www.taylor.edu.my/programmes/computer-science-artificial-intelligence/',
    'Taylor''s University',
    'Bachelor of Computer Science (Artificial Intelligence)',
    'Bachelor', 
    'Malaysia',
    'Subang Jaya',
    28000.00,
    10.00,
    'USD',
    '["2024-08-15", "2025-01-08", "2025-04-28"]',
    true,
    '22222222-2222-2222-2222-222222222222'
);

-- Insert Sample Students
INSERT INTO students (id, partner_id, full_name, email, passport_number, date_of_birth, nationality, phone) VALUES
('stud1111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'Ahmed Hassan Mohammed', 'ahmed.hassan@email.com', 'SD123456789', '2000-05-15', 'Sudan', '+966-123-456789'),
('stud2222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', 'Fatima Al-Rashid', 'fatima.rashid@email.com', 'OM987654321', '1999-12-03', 'Oman', '+968-987-654321'),
('stud3333-3333-3333-3333-333333333333', '33333333-3333-3333-3333-333333333333', 'Mohammed Ibrahim', 'mohammed.ibrahim@email.com', 'AE555123456', '2001-08-22', 'UAE', '+971-555-123456');

-- Insert Sample Applications with Commission Tracking
INSERT INTO applications (
    id, student_id, partner_id, program_info_id, assigned_admin_id,
    intended_intake, current_stage, current_status, commission_percentage, 
    estimated_commission, is_submitted, submitted_at
) VALUES 
(
    'app11111-1111-1111-1111-111111111111',
    'stud1111-1111-1111-1111-111111111111',
    '11111111-1111-1111-1111-111111111111',
    'prog1111-1111-1111-1111-111111111111',
    '22222222-2222-2222-2222-222222222222',
    '2024-09-01',
    1,
    'new_application',
    12.00,
    3000.00,
    true,
    NOW()
),
(
    'app22222-2222-2222-2222-222222222222',
    'stud2222-2222-2222-2222-222222222222',
    '11111111-1111-1111-1111-111111111111',
    'prog2222-2222-2222-2222-222222222222',
    '22222222-2222-2222-2222-222222222222',
    '2024-11-01',
    1,
    'under_review_admin',
    15.00,
    5250.00,
    true,
    NOW() - INTERVAL '2 days'
);

-- Insert Sample Dashboard Metrics
INSERT INTO partner_dashboard_metrics (partner_id, metric_date, applications_submitted, applications_approved, commission_earned, conversion_rate) VALUES
('11111111-1111-1111-1111-111111111111', CURRENT_DATE, 2, 1, 3000.00, 84.4),
('11111111-1111-1111-1111-111111111111', CURRENT_DATE - INTERVAL '1 day', 1, 1, 5250.00, 82.6),
('33333333-3333-3333-3333-333333333333', CURRENT_DATE, 1, 0, 0.00, 82.6);

-- =====================================================
-- COMPLETION MESSAGE
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE '🚀 UNIBEXS MVP DATABASE SCHEMA V5 CREATED SUCCESSFULLY!';
    RAISE NOTICE '';
    RAISE NOTICE '✨ MAJOR FEATURES IN V5:';
    RAISE NOTICE '- 🎯 Commission Transparency (embedded in program URLs)';
    RAISE NOTICE '- 📱 3-Step Streamlined Application Flow';
    RAISE NOTICE '- 📋 Excel-Based Document Standardization';
    RAISE NOTICE '- 📊 Partner Dashboard with Performance Metrics';
    RAISE NOTICE '- 💾 Auto-save Support for Form Sessions';
    RAISE NOTICE '- 🔍 Smart Document Filtering by Program/Nationality';
    RAISE NOTICE '- ⚡ Mobile-First Design Ready';
    RAISE NOTICE '';
    RAISE NOTICE '📊 DATABASE STRUCTURE:';
    RAISE NOTICE '- 10 core tables optimized for UX performance';
    RAISE NOTICE '- Programs with embedded commission rates';
    RAISE NOTICE '- Standardized document requirements (23 types)';
    RAISE NOTICE '- Partner performance tracking system';
    RAISE NOTICE '- Auto-save session management';
    RAISE NOTICE '';
    RAISE NOTICE '💰 COMMISSION TRANSPARENCY MODEL:';
    RAISE NOTICE '- UTM Computer Science: 12% commission = $3,000';
    RAISE NOTICE '- Monash Business: 15% commission = $5,250';
    RAISE NOTICE '- Taylor AI: 10% commission = $2,800';
    RAISE NOTICE '';
    RAISE NOTICE '📋 STANDARDIZED DOCUMENTS:';
    RAISE NOTICE '- 13 Admission phase documents';
    RAISE NOTICE '- 10 Visa phase documents';
    RAISE NOTICE '- Smart filtering by program level & nationality';
    RAISE NOTICE '';
    RAISE NOTICE '🔑 LOGIN CREDENTIALS:';
    RAISE NOTICE '- Admin: admin@unibexs.com / admin123';
    RAISE NOTICE '- Partner 1: partner@globaledu.com / partner123';
    RAISE NOTICE '- Partner 2: info@studyabroad.sg / partner456';
    RAISE NOTICE '';
    RAISE NOTICE '🎉 Ready for Streamlined Partner Experience!';
END $$;