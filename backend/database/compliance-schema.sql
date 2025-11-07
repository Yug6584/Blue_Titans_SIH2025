-- BlueCarbon Ledger - Compliance Monitoring Database Schema
-- Post-verification compliance tracking with AI MRV re-verification

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1️⃣ Compliance Records Table
-- Stores project compliance monitoring data
CREATE TABLE compliance_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES project_registry(project_id) ON DELETE CASCADE,
    company_id UUID NOT NULL,
    certificate_id UUID REFERENCES certification(certificate_id),
    
    -- Baseline measurements (from initial verification)
    baseline_ndvi NUMERIC(4,2) CHECK (baseline_ndvi >= 0 AND baseline_ndvi <= 1),
    baseline_co2_tons NUMERIC(12,2),
    baseline_area_hectares NUMERIC(10,2),
    baseline_date TIMESTAMP WITH TIME ZONE,
    
    -- Current measurements (from re-verification)
    current_ndvi NUMERIC(4,2) CHECK (current_ndvi >= 0 AND current_ndvi <= 1),
    current_co2_tons NUMERIC(12,2),
    current_area_hectares NUMERIC(10,2),
    
    -- AI Analysis Results
    ai_confidence_score NUMERIC(4,2) CHECK (ai_confidence_score >= 0 AND ai_confidence_score <= 1),
    ai_analysis_report_url VARCHAR(500),
    ai_analysis_metadata JSONB,
    
    -- Compliance Status
    compliance_status VARCHAR(30) NOT NULL DEFAULT 'Compliant' 
        CHECK (compliance_status IN ('Compliant', 'Review Needed', 'Non-Compliant', 'Frozen', 'Revoked')),
    compliance_score NUMERIC(4,2) CHECK (compliance_score >= 0 AND compliance_score <= 1),
    
    -- Flagging and Reasons
    flagged_reason TEXT,
    risk_level VARCHAR(20) DEFAULT 'Low' CHECK (risk_level IN ('Low', 'Medium', 'High', 'Critical')),
    
    -- Inspection Schedule
    last_inspection TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    next_inspection_due TIMESTAMP WITH TIME ZONE,
    inspection_frequency_days INTEGER DEFAULT 90, -- Default 3 months
    
    -- Change Detection
    ndvi_change_percent NUMERIC(6,2), -- Percentage change from baseline
    co2_change_percent NUMERIC(6,2),
    area_change_percent NUMERIC(6,2),
    
    -- Blockchain Integration
    blockchain_tx_hash VARCHAR(66), -- Ethereum transaction hash
    credits_frozen BOOLEAN DEFAULT FALSE,
    credits_revoked BOOLEAN DEFAULT FALSE,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Indexes for performance
    CONSTRAINT valid_ndvi_change CHECK (
        baseline_ndvi IS NULL OR current_ndvi IS NULL OR 
        ndvi_change_percent = ROUND(((current_ndvi - baseline_ndvi) / baseline_ndvi * 100), 2)
    )
);

-- 2️⃣ Compliance Audit Log Table
-- Immutable log of all compliance-related actions
CREATE TABLE compliance_audit_log (
    log_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES project_registry(project_id) ON DELETE SET NULL,
    compliance_record_id UUID REFERENCES compliance_records(id) ON DELETE SET NULL,
    
    -- Action Details
    action_type VARCHAR(50) NOT NULL CHECK (action_type IN (
        'AI_REVERIFICATION_STARTED',
        'AI_REVERIFICATION_COMPLETED',
        'AI_REVERIFICATION_FAILED',
        'COMPLIANCE_STATUS_CHANGED',
        'CREDITS_FROZEN',
        'CREDITS_REVOKED',
        'CREDITS_REACTIVATED',
        'MANUAL_INSPECTION_REQUESTED',
        'THRESHOLD_BREACH_DETECTED',
        'ALERT_GENERATED',
        'GOVERNMENT_REVIEW_ASSIGNED',
        'COMPLIANCE_RESTORED'
    )),
    
    -- Actor Information
    performed_by UUID, -- User ID who performed the action
    performed_by_name VARCHAR(255),
    performed_by_role VARCHAR(50) CHECK (performed_by_role IN ('SYSTEM', 'AI_SERVICE', 'GOVERNMENT', 'ADMIN')),
    
    -- Technical Details
    blockchain_tx_hash VARCHAR(66),
    smart_contract_address VARCHAR(42),
    gas_used BIGINT,
    
    -- Action Context
    previous_status VARCHAR(30),
    new_status VARCHAR(30),
    reason TEXT,
    details JSONB, -- Additional structured data
    
    -- Metadata
    ip_address INET,
    user_agent TEXT,
    api_endpoint VARCHAR(255),
    
    -- Immutable timestamp
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 3️⃣ Compliance Alerts Table
-- System-generated alerts for compliance issues
CREATE TABLE compliance_alerts (
    alert_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES project_registry(project_id) ON DELETE CASCADE,
    compliance_record_id UUID REFERENCES compliance_records(id) ON DELETE CASCADE,
    
    -- Alert Details
    alert_type VARCHAR(50) NOT NULL CHECK (alert_type IN (
        'NDVI_THRESHOLD_BREACH',
        'CO2_SIGNIFICANT_DROP',
        'AREA_REDUCTION_DETECTED',
        'AI_CONFIDENCE_LOW',
        'INSPECTION_OVERDUE',
        'COMPLIANCE_DEGRADATION',
        'BLOCKCHAIN_SYNC_FAILED',
        'SATELLITE_DATA_UNAVAILABLE'
    )),
    
    severity VARCHAR(20) NOT NULL DEFAULT 'Medium' CHECK (severity IN ('Low', 'Medium', 'High', 'Critical')),
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    
    -- Threshold Information
    threshold_value NUMERIC(10,4),
    actual_value NUMERIC(10,4),
    threshold_type VARCHAR(50), -- 'ndvi_drop_percent', 'co2_drop_percent', etc.
    
    -- Status and Resolution
    alert_status VARCHAR(20) DEFAULT 'Active' CHECK (alert_status IN ('Active', 'Acknowledged', 'Resolved', 'Dismissed')),
    acknowledged_by UUID,
    acknowledged_at TIMESTAMP WITH TIME ZONE,
    resolved_by UUID,
    resolved_at TIMESTAMP WITH TIME ZONE,
    resolution_notes TEXT,
    
    -- Notification Status
    email_sent BOOLEAN DEFAULT FALSE,
    dashboard_shown BOOLEAN DEFAULT TRUE,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE -- Auto-dismiss after this time
);

-- 4️⃣ Compliance Thresholds Configuration Table
-- Configurable thresholds for different project types
CREATE TABLE compliance_thresholds (
    threshold_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_type VARCHAR(100) NOT NULL,
    
    -- NDVI Thresholds
    ndvi_warning_drop_percent NUMERIC(5,2) DEFAULT 10.00, -- 10% drop triggers warning
    ndvi_critical_drop_percent NUMERIC(5,2) DEFAULT 20.00, -- 20% drop triggers critical alert
    
    -- CO2 Thresholds
    co2_warning_drop_percent NUMERIC(5,2) DEFAULT 15.00,
    co2_critical_drop_percent NUMERIC(5,2) DEFAULT 30.00,
    
    -- Area Thresholds
    area_warning_reduction_percent NUMERIC(5,2) DEFAULT 5.00,
    area_critical_reduction_percent NUMERIC(5,2) DEFAULT 15.00,
    
    -- AI Confidence Thresholds
    ai_confidence_minimum NUMERIC(4,2) DEFAULT 0.70,
    ai_confidence_warning NUMERIC(4,2) DEFAULT 0.60,
    
    -- Inspection Frequency
    default_inspection_days INTEGER DEFAULT 90,
    high_risk_inspection_days INTEGER DEFAULT 30,
    
    -- Auto-actions
    auto_freeze_on_critical BOOLEAN DEFAULT FALSE,
    auto_alert_government BOOLEAN DEFAULT TRUE,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(project_type)
);

-- 5️⃣ AI Re-verification Queue Table
-- Queue for managing AI re-verification jobs
CREATE TABLE ai_reverification_queue (
    queue_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES project_registry(project_id) ON DELETE CASCADE,
    compliance_record_id UUID REFERENCES compliance_records(id) ON DELETE CASCADE,
    
    -- Queue Management
    priority INTEGER DEFAULT 5 CHECK (priority >= 1 AND priority <= 10), -- 1 = highest priority
    queue_status VARCHAR(20) DEFAULT 'QUEUED' CHECK (queue_status IN (
        'QUEUED', 'PROCESSING', 'COMPLETED', 'FAILED', 'CANCELLED', 'RETRY'
    )),
    
    -- Processing Details
    assigned_worker VARCHAR(100), -- AI worker node ID
    processing_started_at TIMESTAMP WITH TIME ZONE,
    processing_completed_at TIMESTAMP WITH TIME ZONE,
    processing_duration_seconds INTEGER,
    
    -- Retry Logic
    retry_count INTEGER DEFAULT 0,
    max_retries INTEGER DEFAULT 3,
    last_error_message TEXT,
    
    -- Request Data
    reverification_type VARCHAR(50) DEFAULT 'SCHEDULED' CHECK (reverification_type IN (
        'SCHEDULED', 'MANUAL', 'ALERT_TRIGGERED', 'THRESHOLD_BREACH'
    )),
    requested_by UUID,
    
    -- Timestamps
    queued_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    scheduled_for TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Indexes for Performance
CREATE INDEX idx_compliance_records_project_id ON compliance_records(project_id);
CREATE INDEX idx_compliance_records_company_id ON compliance_records(company_id);
CREATE INDEX idx_compliance_records_status ON compliance_records(compliance_status);
CREATE INDEX idx_compliance_records_next_inspection ON compliance_records(next_inspection_due);
CREATE INDEX idx_compliance_records_risk_level ON compliance_records(risk_level);

CREATE INDEX idx_compliance_audit_log_project_id ON compliance_audit_log(project_id);
CREATE INDEX idx_compliance_audit_log_action_type ON compliance_audit_log(action_type);
CREATE INDEX idx_compliance_audit_log_timestamp ON compliance_audit_log(timestamp);
CREATE INDEX idx_compliance_audit_log_performed_by ON compliance_audit_log(performed_by);

CREATE INDEX idx_compliance_alerts_project_id ON compliance_alerts(project_id);
CREATE INDEX idx_compliance_alerts_status ON compliance_alerts(alert_status);
CREATE INDEX idx_compliance_alerts_severity ON compliance_alerts(severity);
CREATE INDEX idx_compliance_alerts_created_at ON compliance_alerts(created_at);

CREATE INDEX idx_ai_reverification_queue_status ON ai_reverification_queue(queue_status);
CREATE INDEX idx_ai_reverification_queue_priority ON ai_reverification_queue(priority);
CREATE INDEX idx_ai_reverification_queue_scheduled_for ON ai_reverification_queue(scheduled_for);

-- Create Triggers for Automatic Updates
CREATE OR REPLACE FUNCTION update_compliance_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_compliance_records_updated_at 
    BEFORE UPDATE ON compliance_records 
    FOR EACH ROW EXECUTE FUNCTION update_compliance_updated_at();

CREATE TRIGGER update_compliance_thresholds_updated_at 
    BEFORE UPDATE ON compliance_thresholds 
    FOR EACH ROW EXECUTE FUNCTION update_compliance_updated_at();

-- Function to Calculate Compliance Score
CREATE OR REPLACE FUNCTION calculate_compliance_score(
    ndvi_change NUMERIC,
    co2_change NUMERIC,
    area_change NUMERIC,
    ai_confidence NUMERIC
) RETURNS NUMERIC AS $$
DECLARE
    score NUMERIC := 1.0;
BEGIN
    -- Reduce score based on negative changes
    IF ndvi_change < 0 THEN
        score := score - (ABS(ndvi_change) / 100.0 * 0.4); -- NDVI has 40% weight
    END IF;
    
    IF co2_change < 0 THEN
        score := score - (ABS(co2_change) / 100.0 * 0.3); -- CO2 has 30% weight
    END IF;
    
    IF area_change < 0 THEN
        score := score - (ABS(area_change) / 100.0 * 0.2); -- Area has 20% weight
    END IF;
    
    -- Factor in AI confidence (10% weight)
    score := score * (0.9 + ai_confidence * 0.1);
    
    -- Ensure score is between 0 and 1
    RETURN GREATEST(0, LEAST(1, score));
END;
$$ LANGUAGE plpgsql;

-- Insert Default Compliance Thresholds
INSERT INTO compliance_thresholds (project_type, ndvi_warning_drop_percent, ndvi_critical_drop_percent, 
                                 co2_warning_drop_percent, co2_critical_drop_percent,
                                 area_warning_reduction_percent, area_critical_reduction_percent) VALUES
('mangrove_restoration', 10.00, 20.00, 15.00, 30.00, 5.00, 15.00),
('seagrass_conservation', 15.00, 25.00, 20.00, 35.00, 8.00, 20.00),
('salt_marsh_restoration', 12.00, 22.00, 18.00, 32.00, 6.00, 18.00),
('coastal_wetland_protection', 8.00, 18.00, 12.00, 25.00, 4.00, 12.00),
('blue_carbon_afforestation', 10.00, 20.00, 15.00, 30.00, 5.00, 15.00);

-- Views for Analytics and Reporting
CREATE VIEW compliance_summary AS
SELECT 
    cr.compliance_status,
    COUNT(*) as project_count,
    AVG(cr.compliance_score) as avg_compliance_score,
    AVG(cr.ndvi_change_percent) as avg_ndvi_change,
    AVG(cr.co2_change_percent) as avg_co2_change,
    COUNT(CASE WHEN cr.credits_frozen THEN 1 END) as frozen_credits_count,
    COUNT(CASE WHEN cr.credits_revoked THEN 1 END) as revoked_credits_count
FROM compliance_records cr
GROUP BY cr.compliance_status;

CREATE VIEW overdue_inspections AS
SELECT 
    cr.*,
    pr.title as project_title,
    c.company_name,
    (NOW() - cr.next_inspection_due) as overdue_duration
FROM compliance_records cr
JOIN project_registry pr ON cr.project_id = pr.project_id
JOIN companies c ON cr.company_id = c.company_id
WHERE cr.next_inspection_due < NOW()
AND cr.compliance_status NOT IN ('Revoked', 'Frozen');

CREATE VIEW high_risk_projects AS
SELECT 
    cr.*,
    pr.title as project_title,
    c.company_name,
    ABS(cr.ndvi_change_percent) as ndvi_degradation,
    ABS(cr.co2_change_percent) as co2_degradation
FROM compliance_records cr
JOIN project_registry pr ON cr.project_id = pr.project_id
JOIN companies c ON cr.company_id = c.company_id
WHERE cr.risk_level IN ('High', 'Critical')
OR cr.compliance_status = 'Non-Compliant'
ORDER BY cr.compliance_score ASC;

-- Comments for Documentation
COMMENT ON TABLE compliance_records IS 'Main compliance monitoring records with AI re-verification results';
COMMENT ON TABLE compliance_audit_log IS 'Immutable audit trail of all compliance actions and blockchain transactions';
COMMENT ON TABLE compliance_alerts IS 'System-generated alerts for compliance threshold breaches';
COMMENT ON TABLE compliance_thresholds IS 'Configurable thresholds for different project types';
COMMENT ON TABLE ai_reverification_queue IS 'Queue management for AI re-verification jobs';

COMMENT ON COLUMN compliance_records.ndvi_change_percent IS 'Percentage change in NDVI from baseline (negative = degradation)';
COMMENT ON COLUMN compliance_records.compliance_score IS 'Calculated compliance score (0-1, higher is better)';
COMMENT ON COLUMN compliance_records.risk_level IS 'Risk assessment based on degradation trends';
COMMENT ON COLUMN compliance_audit_log.blockchain_tx_hash IS 'Ethereum/Polygon transaction hash for on-chain actions';