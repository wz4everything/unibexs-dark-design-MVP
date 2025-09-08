-- =====================================================
-- UNIBEXS MVP DATABASE SCHEMA
-- =====================================================
-- Minimal database schema for UniBexs Application Workflow MVP
-- Focused ONLY on the core application workflow (Stages 1-5)
-- 
-- This MVP schema supports:
-- - Partner creates applications and uploads documents
-- - Admin reviews and manages workflow status transitions
-- - Complete 5-stage workflow with all status transitions
-- - Document upload and review cycles
-- - Basic audit trail through stage history
--
-- Execute this entire file in Supabase SQL Editor to create the MVP database
-- =====================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- STEP 1: CREATE TABLES WITHOUT FOREIGN KEYS
-- =====================================================

-- Users table (Authentication & Authorization)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'partner')),
    name VARCHAR(255) NOT NULL,
    partner_id UUID, -- Will add FK constraint later
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Partners table (Education Consultants & Agencies)
CREATE TABLE partners (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(50) NOT NULL,
    country VARCHAR(100) NOT NULL,
    status VARCHAR(20) DEFAULT 'approved' CHECK (status IN ('pending', 'approved', 'rejected', 'suspended')),
    tier VARCHAR(10) DEFAULT 'bronze' CHECK (tier IN ('bronze', 'silver', 'gold')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Students table (International Student Applicants)
CREATE TABLE students (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(50) NOT NULL,
    nationality VARCHAR(100) NOT NULL,
    passport_number VARCHAR(50) UNIQUE NOT NULL,
    date_of_birth DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Universities table
CREATE TABLE universities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    country VARCHAR(100) NOT NULL,
    city VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Programs table (Study Programs)
CREATE TABLE programs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    university_id UUID NOT NULL, -- Will add FK constraint later
    name VARCHAR(255) NOT NULL,
    duration VARCHAR(50), -- e.g., "3 years", "18 months"
    fees DECIMAL(15,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    intakes TEXT[], -- e.g., {January,September}
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Applications table (Central Workflow Entity)
CREATE TABLE applications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Core References
    student_id UUID NOT NULL, -- Will add FK constraint later
    partner_id UUID NOT NULL, -- Will add FK constraint later
    program_id UUID NOT NULL, -- Will add FK constraint later
    university_id UUID NOT NULL, -- Will add FK constraint later
    
    -- Workflow Status (Essential for workflow engine)
    current_stage INTEGER NOT NULL DEFAULT 1 CHECK (current_stage BETWEEN 1 AND 5),
    current_status VARCHAR(100) NOT NULL, -- All 50+ workflow statuses
    
    -- Identifiers
    tracking_number VARCHAR(50) UNIQUE,
    
    -- Application Details
    program_name VARCHAR(255), -- Snapshot at time of application
    university_name VARCHAR(255), -- Snapshot at time of application
    intake_date DATE NOT NULL,
    
    -- Workflow Control Flags
    has_action_required BOOLEAN DEFAULT FALSE,
    documents_required TEXT[], -- Array of required document types
    active_document_request_id UUID,
    
    -- Status Management
    rejection_reason TEXT,
    hold_reason TEXT,
    cancel_reason TEXT,
    previous_status VARCHAR(100), -- For hold/resume functionality
    
    -- Timeline
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    submitted_at TIMESTAMP WITH TIME ZONE
);

-- Documents table (File Management)
CREATE TABLE documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    application_id UUID NOT NULL, -- Will add FK constraint later
    
    -- Document Classification
    stage INTEGER NOT NULL CHECK (stage BETWEEN 1 AND 5),
    type VARCHAR(100) NOT NULL, -- passport_copy, transcript, etc.
    
    -- File Information
    file_name VARCHAR(255) NOT NULL,
    file_url TEXT, -- Supabase Storage URL
    file_size BIGINT, -- Size in bytes
    
    -- Document Status & Review
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'under_review', 'approved', 'rejected', 'resubmission_required')),
    version INTEGER DEFAULT 1, -- For resubmissions
    is_mandatory BOOLEAN DEFAULT TRUE,
    
    -- Upload Information
    uploaded_by UUID, -- Will add FK constraint later
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Review Information
    reviewed_by UUID, -- Will add FK constraint later
    reviewed_at TIMESTAMP WITH TIME ZONE,
    rejection_reason TEXT,
    
    -- Metadata
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
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'partially_submitted', 'submitted', 'approved', 'rejected')),
    
    -- Content
    title VARCHAR(255) NOT NULL,
    description TEXT,
    due_date DATE,
    
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
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Stage History table (Track workflow progression - Essential for audit)
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
    
    -- Timestamp
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- STEP 2: ADD FOREIGN KEY CONSTRAINTS
-- =====================================================

-- Users table foreign keys
ALTER TABLE users 
ADD CONSTRAINT fk_users_partner_id 
FOREIGN KEY (partner_id) REFERENCES partners(id) ON DELETE SET NULL;

-- Programs table foreign keys
ALTER TABLE programs 
ADD CONSTRAINT fk_programs_university_id 
FOREIGN KEY (university_id) REFERENCES universities(id) ON DELETE CASCADE;

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

-- Documents table foreign keys
ALTER TABLE documents 
ADD CONSTRAINT fk_documents_application_id 
FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE CASCADE;

ALTER TABLE documents 
ADD CONSTRAINT fk_documents_uploaded_by 
FOREIGN KEY (uploaded_by) REFERENCES users(id);

ALTER TABLE documents 
ADD CONSTRAINT fk_documents_reviewed_by 
FOREIGN KEY (reviewed_by) REFERENCES users(id);

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

-- =====================================================
-- STEP 3: CREATE INDEXES FOR PERFORMANCE
-- =====================================================

-- Application workflow indexes
CREATE INDEX idx_applications_current_stage ON applications(current_stage);
CREATE INDEX idx_applications_current_status ON applications(current_status);
CREATE INDEX idx_applications_partner_id ON applications(partner_id);
CREATE INDEX idx_applications_student_id ON applications(student_id);
CREATE INDEX idx_applications_tracking_number ON applications(tracking_number);
CREATE INDEX idx_applications_has_action_required ON applications(has_action_required);

-- Document indexes
CREATE INDEX idx_documents_application_id ON documents(application_id);
CREATE INDEX idx_documents_type ON documents(type);
CREATE INDEX idx_documents_status ON documents(status);
CREATE INDEX idx_documents_stage ON documents(stage);

-- Stage history indexes
CREATE INDEX idx_stage_history_application_id ON stage_history(application_id);
CREATE INDEX idx_stage_history_timestamp ON stage_history(timestamp DESC);

-- Composite indexes for common queries
CREATE INDEX idx_applications_stage_status ON applications(current_stage, current_status);
CREATE INDEX idx_documents_app_type_status ON documents(application_id, type, status);

-- =====================================================
-- STEP 4: ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on core tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE stage_history ENABLE ROW LEVEL SECURITY;

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

-- Apply updated_at triggers
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
-- STEP 6: INITIAL MVP DATA
-- =====================================================

-- Insert MVP Partner for pilot
INSERT INTO partners (id, name, email, phone, country, status, tier) VALUES
('11111111-1111-1111-1111-111111111111', 'Global Education Partners', 'partner@globaledu.com', '+60-123-456789', 'Malaysia', 'approved', 'gold');

-- Insert Admin User
INSERT INTO users (id, email, password_hash, role, name) VALUES
('22222222-2222-2222-2222-222222222222', 'admin@unibexs.com', crypt('admin123', gen_salt('bf')), 'admin', 'System Administrator');

-- Insert Partner User
INSERT INTO users (id, email, password_hash, role, name, partner_id) VALUES
('33333333-3333-3333-3333-333333333333', 'partner@globaledu.com', crypt('partner123', gen_salt('bf')), 'partner', 'Partner User', '11111111-1111-1111-1111-111111111111');

-- Insert Sample Universities
INSERT INTO universities (id, name, country, city) VALUES
('44444444-4444-4444-4444-444444444444', 'University of Technology Malaysia', 'Malaysia', 'Kuala Lumpur'),
('55555555-5555-5555-5555-555555555555', 'Taylor University', 'Malaysia', 'Subang Jaya'),
('66666666-6666-6666-6666-666666666666', 'Monash University Malaysia', 'Malaysia', 'Bandar Sunway');

-- Insert Sample Programs
INSERT INTO programs (id, university_id, name, duration, fees, currency, intakes) VALUES
('77777777-7777-7777-7777-777777777777', '44444444-4444-4444-4444-444444444444', 'Bachelor of Computer Science', '3 years', 45000.00, 'MYR', '{February,September}'),
('88888888-8888-8888-8888-888888888888', '55555555-5555-5555-5555-555555555555', 'Bachelor of Business Administration', '3 years', 42000.00, 'MYR', '{January,March,August}'),
('99999999-9999-9999-9999-999999999999', '66666666-6666-6666-6666-666666666666', 'Master of Engineering', '2 years', 55000.00, 'MYR', '{February,July}');

-- Insert Sample Students
INSERT INTO students (id, first_name, last_name, email, phone, nationality, passport_number, date_of_birth) VALUES
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Ahmed', 'Hassan', 'ahmed.hassan@email.com', '+966-123-456789', 'Sudan', 'SD123456789', '2000-05-15'),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Fatima', 'Al-Rashid', 'fatima.rashid@email.com', '+968-987-654321', 'Oman', 'OM987654321', '1999-12-03'),
('cccccccc-cccc-cccc-cccc-cccccccccccc', 'Mohammed', 'Ibrahim', 'mohammed.ibrahim@email.com', '+971-555-123456', 'UAE', 'AE555123456', '2001-08-22');

-- Insert Sample Application (for testing workflow)
INSERT INTO applications (
    id, student_id, partner_id, program_id, university_id,
    current_stage, current_status, program_name, university_name,
    intake_date, submitted_at
) VALUES (
    'dddddddd-dddd-dddd-dddd-dddddddddddd',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    '11111111-1111-1111-1111-111111111111',
    '77777777-7777-7777-7777-777777777777',
    '44444444-4444-4444-4444-444444444444',
    1,
    'new_application',
    'Bachelor of Computer Science',
    'University of Technology Malaysia',
    '2024-09-01',
    NOW()
);

-- Insert initial stage history entry
INSERT INTO stage_history (
    application_id, stage, status, previous_status,
    actor_role, action_taken, timestamp
) VALUES (
    'dddddddd-dddd-dddd-dddd-dddddddddddd',
    1,
    'new_application',
    NULL,
    'system',
    'Application created',
    NOW()
);

-- =====================================================
-- COMPLETION MESSAGE
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE '✅ UNIBEXS MVP DATABASE SCHEMA CREATED SUCCESSFULLY!';
    RAISE NOTICE '';
    RAISE NOTICE 'MVP Features Created:';
    RAISE NOTICE '- 10 essential tables for application workflow';
    RAISE NOTICE '- Complete 5-stage workflow support';
    RAISE NOTICE '- Document upload and review system';
    RAISE NOTICE '- Stage history audit trail';
    RAISE NOTICE '- Row Level Security (RLS) policies';
    RAISE NOTICE '- Performance indexes';
    RAISE NOTICE '- Sample data for testing';
    RAISE NOTICE '';
    RAISE NOTICE 'Ready for MVP Launch!';
    RAISE NOTICE '';
    RAISE NOTICE 'Login Credentials:';
    RAISE NOTICE '- Admin: admin@unibexs.com / admin123';
    RAISE NOTICE '- Partner: partner@globaledu.com / partner123';
END $$;