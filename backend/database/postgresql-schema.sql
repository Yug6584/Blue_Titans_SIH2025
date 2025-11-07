-- BlueCarbon Ledger - PostgreSQL Database Schema
-- Fully Automated AI MRV → Government Forwarding Workflow

-- Enable PostGIS extension for geospatial data
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Project Registry Database
CREATE TABLE project_registry (
    project_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    coordinates GEOMETRY(POLYGON, 4326), -- GeoJSON polygon for project area
    project_area_hectares DECIMAL(10,2),
    project_type VARCHAR(100) NOT NULL, -- mangrove, seagrass, salt_marsh, etc.
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING_MRV',
    -- Status flow: PENDING_MRV → AI_VERIFIED → UNDER_GOVERNMENT_REVIEW → APPROVED → CREDITS_ISSUED → REJECTED
    submission_documents JSONB, -- Array of document URLs/hashes
    estimated_co2_tons DECIMAL(12,2),
    project_duration_years INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT valid_status CHECK (status IN (
        'PENDING_MRV', 
        'AI_PROCESSING', 
        'AI_VERIFIED', 
        'UNDER_GOVERNMENT_REVIEW', 
        'APPROVED', 
        'CREDITS_ISSUED', 
        'REJECTED'
    )),
    CONSTRAINT valid_project_type CHECK (project_type IN (
        'mangrove_restoration',
        'seagrass_conservation',
        'salt_marsh_restoration',
        'coastal_wetland_protection',
        'blue_carbon_afforestation'
    ))
);

-- MRV Data Database (AI Verification Results)
CREATE TABLE mrv_data (
    mrv_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES project_registry(project_id) ON DELETE CASCADE,
    ai_report_url VARCHAR(500), -- URL to AI-generated report (PDF)
    ai_report_json JSONB, -- Structured AI analysis results
    confidence_score DECIMAL(5,4) CHECK (confidence_score >= 0 AND confidence_score <= 1),
    estimated_co2_tons DECIMAL(12,2),
    verified_area_hectares DECIMAL(10,2),
    satellite_image_urls JSONB, -- Array of satellite image URLs used
    analysis_metadata JSONB, -- AI model version, processing time, etc.
    status VARCHAR(50) NOT NULL DEFAULT 'PROCESSING',
    processing_started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    processing_completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT valid_mrv_status CHECK (status IN ('PROCESSING', 'COMPLETED', 'FAILED'))
);

-- Government Verification Database
CREATE TABLE government_verification (
    verification_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES project_registry(project_id) ON DELETE CASCADE,
    mrv_id UUID NOT NULL REFERENCES mrv_data(mrv_id) ON DELETE CASCADE,
    assigned_officer_id UUID, -- Government user who reviews
    review_status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    review_notes TEXT,
    approved_co2_tons DECIMAL(12,2), -- Final approved amount (may differ from AI estimate)
    review_documents JSONB, -- Additional documents from government review
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    reviewed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT valid_review_status CHECK (review_status IN (
        'PENDING', 
        'IN_REVIEW', 
        'APPROVED', 
        'REJECTED', 
        'REQUIRES_ADDITIONAL_INFO'
    ))
);

-- Certification Database (Issued Certificates)
CREATE TABLE certification (
    certificate_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES project_registry(project_id) ON DELETE CASCADE,
    verification_id UUID NOT NULL REFERENCES government_verification(verification_id),
    certificate_number VARCHAR(100) UNIQUE NOT NULL, -- Human-readable cert number
    approved_by UUID NOT NULL, -- Government officer who approved
    certificate_hash VARCHAR(64) UNIQUE NOT NULL, -- SHA-256 hash of certificate
    ipfs_link VARCHAR(200), -- IPFS storage link for certificate document
    blockchain_tx_hash VARCHAR(66), -- Ethereum transaction hash
    token_id BIGINT, -- ERC-721 token ID or ERC-20 amount
    co2_credits_issued DECIMAL(12,2) NOT NULL,
    valid_from DATE NOT NULL,
    valid_until DATE NOT NULL,
    certificate_metadata JSONB, -- Additional certificate data
    issued_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Audit Log Database (Complete Event Tracking)
CREATE TABLE audit_log (
    event_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES project_registry(project_id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    -- Actions: SUBMITTED, AI_PROCESSING_STARTED, AI_VERIFIED, FORWARDED_TO_GOV, 
    --          ASSIGNED_TO_OFFICER, APPROVED, REJECTED, CREDITS_ISSUED, etc.
    performed_by UUID, -- User ID who performed the action (NULL for system actions)
    performed_by_type VARCHAR(50), -- 'COMPANY', 'GOVERNMENT', 'ADMIN', 'SYSTEM', 'AI_SERVICE'
    event_data JSONB, -- Additional context data for the event
    ip_address INET,
    user_agent TEXT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT valid_performer_type CHECK (performed_by_type IN (
        'COMPANY', 'GOVERNMENT', 'ADMIN', 'SYSTEM', 'AI_SERVICE'
    ))
);

-- Company Information (Extended from existing users table)
CREATE TABLE companies (
    company_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL, -- Reference to existing users table
    company_name VARCHAR(255) NOT NULL,
    registration_number VARCHAR(100),
    contact_person VARCHAR(255),
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    address TEXT,
    country VARCHAR(100),
    verification_status VARCHAR(50) DEFAULT 'PENDING',
    kyc_documents JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT valid_verification_status CHECK (verification_status IN (
        'PENDING', 'VERIFIED', 'REJECTED', 'SUSPENDED'
    ))
);

-- Government Officers (Extended from existing users table)
CREATE TABLE government_officers (
    officer_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL, -- Reference to existing users table
    officer_name VARCHAR(255) NOT NULL,
    department VARCHAR(255),
    position VARCHAR(255),
    jurisdiction GEOMETRY(POLYGON, 4326), -- Geographic area of responsibility
    specialization VARCHAR(100), -- mangrove, seagrass, etc.
    certification_level VARCHAR(50),
    active_status BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AI Processing Queue (For managing AI workload)
CREATE TABLE ai_processing_queue (
    queue_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES project_registry(project_id) ON DELETE CASCADE,
    priority INTEGER DEFAULT 5, -- 1 (highest) to 10 (lowest)
    processing_status VARCHAR(50) DEFAULT 'QUEUED',
    assigned_worker VARCHAR(100), -- AI worker instance ID
    retry_count INTEGER DEFAULT 0,
    max_retries INTEGER DEFAULT 3,
    error_message TEXT,
    queued_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    
    CONSTRAINT valid_processing_status CHECK (processing_status IN (
        'QUEUED', 'PROCESSING', 'COMPLETED', 'FAILED', 'CANCELLED'
    ))
);

-- Notification System
CREATE TABLE notifications (
    notification_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    recipient_id UUID NOT NULL, -- User ID
    recipient_type VARCHAR(50) NOT NULL, -- 'COMPANY', 'GOVERNMENT', 'ADMIN'
    project_id UUID REFERENCES project_registry(project_id) ON DELETE CASCADE,
    notification_type VARCHAR(100) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    data JSONB, -- Additional notification data
    read_status BOOLEAN DEFAULT FALSE,
    email_sent BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    read_at TIMESTAMP WITH TIME ZONE
);

-- Indexes for Performance
CREATE INDEX idx_project_registry_company_id ON project_registry(company_id);
CREATE INDEX idx_project_registry_status ON project_registry(status);
CREATE INDEX idx_project_registry_created_at ON project_registry(created_at);
CREATE INDEX idx_project_registry_coordinates ON project_registry USING GIST(coordinates);

CREATE INDEX idx_mrv_data_project_id ON mrv_data(project_id);
CREATE INDEX idx_mrv_data_status ON mrv_data(status);
CREATE INDEX idx_mrv_data_confidence_score ON mrv_data(confidence_score);

CREATE INDEX idx_government_verification_project_id ON government_verification(project_id);
CREATE INDEX idx_government_verification_officer_id ON government_verification(assigned_officer_id);
CREATE INDEX idx_government_verification_status ON government_verification(review_status);

CREATE INDEX idx_certification_project_id ON certification(project_id);
CREATE INDEX idx_certification_number ON certification(certificate_number);
CREATE INDEX idx_certification_issued_at ON certification(issued_at);

CREATE INDEX idx_audit_log_project_id ON audit_log(project_id);
CREATE INDEX idx_audit_log_action ON audit_log(action);
CREATE INDEX idx_audit_log_timestamp ON audit_log(timestamp);
CREATE INDEX idx_audit_log_performed_by ON audit_log(performed_by);

CREATE INDEX idx_ai_queue_status ON ai_processing_queue(processing_status);
CREATE INDEX idx_ai_queue_priority ON ai_processing_queue(priority);
CREATE INDEX idx_ai_queue_queued_at ON ai_processing_queue(queued_at);

CREATE INDEX idx_notifications_recipient ON notifications(recipient_id, recipient_type);
CREATE INDEX idx_notifications_read_status ON notifications(read_status);
CREATE INDEX idx_notifications_created_at ON notifications(created_at);

-- Triggers for automatic timestamp updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_project_registry_updated_at 
    BEFORE UPDATE ON project_registry 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_companies_updated_at 
    BEFORE UPDATE ON companies 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_government_officers_updated_at 
    BEFORE UPDATE ON government_officers 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Views for Analytics and Reporting
CREATE VIEW project_analytics AS
SELECT 
    pr.status,
    pr.project_type,
    COUNT(*) as project_count,
    AVG(md.confidence_score) as avg_confidence_score,
    SUM(pr.estimated_co2_tons) as total_estimated_co2,
    SUM(c.co2_credits_issued) as total_credits_issued
FROM project_registry pr
LEFT JOIN mrv_data md ON pr.project_id = md.project_id
LEFT JOIN certification c ON pr.project_id = c.project_id
GROUP BY pr.status, pr.project_type;

CREATE VIEW government_workload AS
SELECT 
    go.officer_id,
    go.officer_name,
    go.department,
    COUNT(gv.verification_id) as assigned_projects,
    COUNT(CASE WHEN gv.review_status = 'PENDING' THEN 1 END) as pending_reviews,
    COUNT(CASE WHEN gv.review_status = 'APPROVED' THEN 1 END) as approved_projects,
    AVG(EXTRACT(EPOCH FROM (gv.reviewed_at - gv.assigned_at))/3600) as avg_review_time_hours
FROM government_officers go
LEFT JOIN government_verification gv ON go.officer_id = gv.assigned_officer_id
WHERE go.active_status = TRUE
GROUP BY go.officer_id, go.officer_name, go.department;

-- Sample Data Inserts (for testing)
-- Note: These will be populated by the application, not in production schema

COMMENT ON TABLE project_registry IS 'Main project registry with geospatial data and status tracking';
COMMENT ON TABLE mrv_data IS 'AI-generated MRV verification results and reports';
COMMENT ON TABLE government_verification IS 'Government officer review and approval process';
COMMENT ON TABLE certification IS 'Issued carbon credit certificates with blockchain integration';
COMMENT ON TABLE audit_log IS 'Complete audit trail of all system actions and events';
COMMENT ON TABLE ai_processing_queue IS 'Queue management for AI processing workload';
COMMENT ON TABLE notifications IS 'System notifications for all user types';

-- Grant permissions (adjust based on your user setup)
-- GRANT SELECT, INSERT, UPDATE ON ALL TABLES IN SCHEMA public TO bluecarbon_app;
-- GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO bluecarbon_app;