// BlueCarbon Ledger - Compliance Monitoring Routes (JavaScript)
// Government Panel - Post-verification compliance tracking

const express = require('express');
const router = express.Router();

// Mock compliance data
const generateMockComplianceData = () => {
  const records = [];
  const statuses = ['Compliant', 'Review Needed', 'Non-Compliant', 'Frozen', 'Revoked'];
  const riskLevels = ['Low', 'Medium', 'High', 'Critical'];
  const companies = ['EcoTech Solutions', 'Green Future Corp', 'Ocean Guardians Ltd', 'Blue Planet Inc', 'Coastal Restoration Co'];

  for (let i = 1; i <= 25; i++) {
    const baselineNdvi = 0.7 + Math.random() * 0.2;
    const currentNdvi = baselineNdvi * (0.8 + Math.random() * 0.4);
    const baselineCo2 = 50 + Math.random() * 200;
    const currentCo2 = baselineCo2 * (0.7 + Math.random() * 0.6);

    const ndviChange = ((currentNdvi - baselineNdvi) / baselineNdvi) * 100;
    const co2Change = ((currentCo2 - baselineCo2) / baselineCo2) * 100;

    const maxDegradation = Math.max(Math.abs(ndviChange), Math.abs(co2Change));
    let status = 'Compliant';
    let riskLevel = 'Low';

    if (maxDegradation > 25) {
      status = 'Non-Compliant';
      riskLevel = 'Critical';
    } else if (maxDegradation > 15) {
      status = 'Review Needed';
      riskLevel = 'High';
    } else if (maxDegradation > 8) {
      riskLevel = 'Medium';
    }

    // Randomly assign some frozen/revoked status
    if (Math.random() > 0.85) {
      status = Math.random() > 0.5 ? 'Frozen' : 'Revoked';
    }

    const lastInspection = new Date();
    lastInspection.setDate(lastInspection.getDate() - Math.floor(Math.random() * 90));

    records.push({
      id: `compliance-${i}`,
      project_id: `PRJ-${String(i).padStart(4, '0')}`,
      project_title: `Blue Carbon Project ${i}`,
      company_id: `company-${Math.floor(Math.random() * 5) + 1}`,
      company_name: companies[Math.floor(Math.random() * companies.length)],
      total_credits: Math.floor(baselineCo2),
      baseline_ndvi: Math.round(baselineNdvi * 10000) / 10000,
      current_ndvi: Math.round(currentNdvi * 10000) / 10000,
      baseline_co2_tons: Math.round(baselineCo2 * 100) / 100,
      current_co2_tons: Math.round(currentCo2 * 100) / 100,
      ai_confidence_score: Math.round((0.6 + Math.random() * 0.4) * 10000) / 10000,
      compliance_status: status,
      compliance_score: Math.round((0.5 + Math.random() * 0.5) * 10000) / 10000,
      risk_level: riskLevel,
      last_inspection: lastInspection.toISOString(),
      next_inspection_due: new Date(Date.now() + Math.random() * 120 * 24 * 60 * 60 * 1000).toISOString(),
      ndvi_change_percent: Math.round(ndviChange * 100) / 100,
      co2_change_percent: Math.round(co2Change * 100) / 100,
      area_change_percent: Math.round((Math.random() * 20 - 10) * 100) / 100,
      credits_frozen: status === 'Frozen' || status === 'Revoked',
      credits_revoked: status === 'Revoked',
      flagged_reason: maxDegradation > 15 ? `Degradation detected: ${maxDegradation.toFixed(1)}%` : null,
      created_at: new Date(Date.now() - Math.random() * 180 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date().toISOString()
    });
  }

  return records;
};

const generateMockAlerts = () => {
  const alerts = [];
  const alertTypes = ['NDVI_THRESHOLD_BREACH', 'CO2_SIGNIFICANT_DROP', 'AREA_REDUCTION_DETECTED', 'AI_CONFIDENCE_LOW'];
  const severities = ['High', 'Critical', 'Medium'];

  for (let i = 1; i <= 8; i++) {
    const alertType = alertTypes[Math.floor(Math.random() * alertTypes.length)];
    const severity = severities[Math.floor(Math.random() * severities.length)];
    
    alerts.push({
      alert_id: `alert-${i}`,
      project_id: `PRJ-${String(Math.floor(Math.random() * 25) + 1).padStart(4, '0')}`,
      alert_type: alertType,
      severity: severity,
      title: getAlertTitle(alertType),
      message: getAlertMessage(alertType),
      alert_status: Math.random() > 0.3 ? 'Active' : 'Acknowledged',
      created_at: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString()
    });
  }

  return alerts;
};

const getAlertTitle = (alertType) => {
  const titles = {
    'NDVI_THRESHOLD_BREACH': 'NDVI Threshold Breach Detected',
    'CO2_SIGNIFICANT_DROP': 'Significant CO2 Drop Detected',
    'AREA_REDUCTION_DETECTED': 'Project Area Reduction Detected',
    'AI_CONFIDENCE_LOW': 'Low AI Confidence Score'
  };
  return titles[alertType] || 'Compliance Alert';
};

const getAlertMessage = (alertType) => {
  const messages = {
    'NDVI_THRESHOLD_BREACH': 'Vegetation health has declined below acceptable thresholds',
    'CO2_SIGNIFICANT_DROP': 'Carbon sequestration capacity has significantly decreased',
    'AREA_REDUCTION_DETECTED': 'Project area has been reduced beyond acceptable limits',
    'AI_CONFIDENCE_LOW': 'AI analysis confidence is below minimum requirements'
  };
  return messages[alertType] || 'Compliance issue detected';
};

// Store mock data in memory (in production, this would be in database)
let mockComplianceData = generateMockComplianceData();
let mockAlerts = generateMockAlerts();

/**
 * GET /api/compliance/all - Get all compliance records with filters
 */
router.get('/all', async (req, res) => {
  try {
    let filtered = [...mockComplianceData];

    // Apply filters
    if (req.query.status && req.query.status !== 'all') {
      filtered = filtered.filter(record => record.compliance_status === req.query.status);
    }

    if (req.query.risk_level && req.query.risk_level !== 'all') {
      filtered = filtered.filter(record => record.risk_level === req.query.risk_level);
    }

    if (req.query.company_id && req.query.company_id !== 'all') {
      filtered = filtered.filter(record => record.company_id === req.query.company_id);
    }

    // Calculate summary
    const summary = {
      total_projects: filtered.length,
      compliant_projects: filtered.filter(r => r.compliance_status === 'Compliant').length,
      review_needed: filtered.filter(r => r.compliance_status === 'Review Needed').length,
      non_compliant: filtered.filter(r => r.compliance_status === 'Non-Compliant').length,
      frozen_credits: filtered.filter(r => r.credits_frozen).length,
      revoked_credits: filtered.filter(r => r.credits_revoked).length
    };

    res.json({
      success: true,
      data: {
        summary,
        compliance_records: filtered
      },
      filters_applied: req.query
    });

  } catch (error) {
    console.error('Error fetching compliance records:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch compliance records'
    });
  }
});

/**
 * GET /api/compliance/alerts - Get active compliance alerts
 */
router.get('/alerts', async (req, res) => {
  try {
    const activeAlerts = mockAlerts.filter(alert => alert.alert_status === 'Active');

    res.json({
      success: true,
      alerts: activeAlerts,
      total_count: activeAlerts.length
    });

  } catch (error) {
    console.error('Error fetching alerts:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch alerts'
    });
  }
});

/**
 * POST /api/compliance/reverify - Trigger AI re-verification
 */
router.post('/reverify', async (req, res) => {
  try {
    const { project_id, reverification_type, priority } = req.body;

    if (!project_id) {
      return res.status(400).json({
        success: false,
        message: 'Project ID is required'
      });
    }

    console.log(`🔄 Triggering AI re-verification for project ${project_id}`);

    // Simulate AI processing
    setTimeout(async () => {
      try {
        // Mock AI re-verification call
        const response = await fetch('http://localhost:5000/api/mrv/reverify', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer bluecarbon-ai-service-key-2024-secure'
          },
          body: JSON.stringify({
            project_id: project_id,
            coordinates: { type: 'Polygon', coordinates: [[[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]]] },
            project_type: 'mangrove_restoration',
            baseline_ndvi: 0.8,
            baseline_co2_tons: 100,
            baseline_area_hectares: 10,
            reverification_type: reverification_type || 'MANUAL'
          })
        });

        const aiData = await response.json();
        console.log(`✅ AI re-verification completed for ${project_id}:`, aiData);

        // Update mock data based on AI response
        const recordIndex = mockComplianceData.findIndex(r => r.project_id === project_id);
        if (recordIndex !== -1 && aiData.success) {
          mockComplianceData[recordIndex] = {
            ...mockComplianceData[recordIndex],
            current_ndvi: aiData.current_ndvi,
            current_co2_tons: aiData.current_co2_tons,
            ai_confidence_score: aiData.ai_confidence_score,
            ndvi_change_percent: aiData.ndvi_change_percent,
            co2_change_percent: aiData.co2_change_percent,
            last_inspection: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };

          // Update status based on changes
          const maxChange = Math.max(
            Math.abs(aiData.ndvi_change_percent),
            Math.abs(aiData.co2_change_percent)
          );

          if (maxChange > 25) {
            mockComplianceData[recordIndex].compliance_status = 'Non-Compliant';
            mockComplianceData[recordIndex].risk_level = 'Critical';
          } else if (maxChange > 15) {
            mockComplianceData[recordIndex].compliance_status = 'Review Needed';
            mockComplianceData[recordIndex].risk_level = 'High';
          }
        }

      } catch (error) {
        console.error('AI re-verification failed:', error);
      }
    }, 2000);

    res.json({
      success: true,
      message: 'AI re-verification triggered successfully',
      queue_id: `queue-${Date.now()}`,
      estimated_completion_time: '10-15 minutes'
    });

  } catch (error) {
    console.error('Error triggering re-verification:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to trigger re-verification'
    });
  }
});

/**
 * POST /api/compliance/freeze - Freeze credits
 */
router.post('/freeze', async (req, res) => {
  try {
    const { project_id, reason } = req.body;

    if (!project_id || !reason) {
      return res.status(400).json({
        success: false,
        message: 'Project ID and reason are required'
      });
    }

    console.log(`🧊 Freezing credits for project ${project_id}: ${reason}`);

    // Simulate blockchain transaction
    await new Promise(resolve => setTimeout(resolve, 2000));
    const txHash = `0x${Math.random().toString(16).substr(2, 64)}`;

    // Update mock data
    const recordIndex = mockComplianceData.findIndex(r => r.project_id === project_id);
    if (recordIndex !== -1) {
      mockComplianceData[recordIndex].credits_frozen = true;
      mockComplianceData[recordIndex].compliance_status = 'Frozen';
      mockComplianceData[recordIndex].blockchain_tx_hash = txHash;
      mockComplianceData[recordIndex].updated_at = new Date().toISOString();
    }

    res.json({
      success: true,
      message: 'Credits frozen successfully',
      blockchain_tx_hash: txHash
    });

  } catch (error) {
    console.error('Error freezing credits:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to freeze credits'
    });
  }
});

/**
 * POST /api/compliance/revoke - Revoke credits
 */
router.post('/revoke', async (req, res) => {
  try {
    const { project_id, reason } = req.body;

    if (!project_id || !reason) {
      return res.status(400).json({
        success: false,
        message: 'Project ID and reason are required'
      });
    }

    console.log(`🗑️ Revoking credits for project ${project_id}: ${reason}`);

    // Simulate blockchain transaction
    await new Promise(resolve => setTimeout(resolve, 2500));
    const txHash = `0x${Math.random().toString(16).substr(2, 64)}`;

    // Update mock data
    const recordIndex = mockComplianceData.findIndex(r => r.project_id === project_id);
    if (recordIndex !== -1) {
      mockComplianceData[recordIndex].credits_revoked = true;
      mockComplianceData[recordIndex].credits_frozen = true;
      mockComplianceData[recordIndex].compliance_status = 'Revoked';
      mockComplianceData[recordIndex].blockchain_tx_hash = txHash;
      mockComplianceData[recordIndex].updated_at = new Date().toISOString();
    }

    res.json({
      success: true,
      message: 'Credits revoked successfully',
      blockchain_tx_hash: txHash
    });

  } catch (error) {
    console.error('Error revoking credits:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to revoke credits'
    });
  }
});

/**
 * POST /api/compliance/reactivate - Reactivate credits
 */
router.post('/reactivate', async (req, res) => {
  try {
    const { project_id, reason } = req.body;

    if (!project_id || !reason) {
      return res.status(400).json({
        success: false,
        message: 'Project ID and reason are required'
      });
    }

    console.log(`🔄 Reactivating credits for project ${project_id}: ${reason}`);

    // Check if credits can be reactivated
    const record = mockComplianceData.find(r => r.project_id === project_id);
    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    if (record.credits_revoked) {
      return res.status(400).json({
        success: false,
        message: 'Cannot reactivate revoked credits'
      });
    }

    if (!record.credits_frozen) {
      return res.status(400).json({
        success: false,
        message: 'Credits are not frozen'
      });
    }

    // Simulate blockchain transaction
    await new Promise(resolve => setTimeout(resolve, 1800));
    const txHash = `0x${Math.random().toString(16).substr(2, 64)}`;

    // Update mock data
    const recordIndex = mockComplianceData.findIndex(r => r.project_id === project_id);
    if (recordIndex !== -1) {
      mockComplianceData[recordIndex].credits_frozen = false;
      mockComplianceData[recordIndex].compliance_status = 'Compliant';
      mockComplianceData[recordIndex].blockchain_tx_hash = txHash;
      mockComplianceData[recordIndex].updated_at = new Date().toISOString();
    }

    res.json({
      success: true,
      message: 'Credits reactivated successfully',
      blockchain_tx_hash: txHash
    });

  } catch (error) {
    console.error('Error reactivating credits:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reactivate credits'
    });
  }
});

/**
 * GET /api/compliance/project/:projectId - Get compliance details for specific project
 */
router.get('/project/:projectId', async (req, res) => {
  try {
    const { projectId } = req.params;
    const record = mockComplianceData.find(r => r.project_id === projectId);

    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Compliance record not found'
      });
    }

    // Generate mock audit log for this project
    const auditLog = [
      {
        log_id: `audit-${Date.now()}-1`,
        project_id: projectId,
        action_type: 'AI_REVERIFICATION_COMPLETED',
        performed_by_name: 'AI Service',
        performed_by_role: 'AI_SERVICE',
        reason: 'Scheduled compliance check completed',
        timestamp: new Date().toISOString()
      },
      {
        log_id: `audit-${Date.now()}-2`,
        project_id: projectId,
        action_type: 'COMPLIANCE_STATUS_CHANGED',
        performed_by_name: 'System',
        performed_by_role: 'SYSTEM',
        previous_status: 'Compliant',
        new_status: record.compliance_status,
        reason: 'Status updated based on AI analysis',
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
      }
    ];

    res.json({
      success: true,
      data: {
        compliance_record: record,
        audit_log: auditLog
      }
    });

  } catch (error) {
    console.error('Error fetching project compliance:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch project compliance data'
    });
  }
});

/**
 * POST /api/compliance/alerts/:alertId/acknowledge - Acknowledge alert
 */
router.post('/alerts/:alertId/acknowledge', async (req, res) => {
  try {
    const { alertId } = req.params;
    const alertIndex = mockAlerts.findIndex(a => a.alert_id === alertId);

    if (alertIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Alert not found'
      });
    }

    mockAlerts[alertIndex].alert_status = 'Acknowledged';
    mockAlerts[alertIndex].acknowledged_at = new Date().toISOString();

    res.json({
      success: true,
      message: 'Alert acknowledged successfully'
    });

  } catch (error) {
    console.error('Error acknowledging alert:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to acknowledge alert'
    });
  }
});

/**
 * GET /api/compliance/overview - Get compliance dashboard overview
 */
router.get('/overview', async (req, res) => {
  try {
    const analytics = {
      overview: {
        total_monitored_projects: mockComplianceData.length,
        compliance_rate: Math.round((mockComplianceData.filter(r => r.compliance_status === 'Compliant').length / mockComplianceData.length) * 10000) / 100,
        average_compliance_score: Math.round((mockComplianceData.reduce((sum, r) => sum + r.compliance_score, 0) / mockComplianceData.length) * 1000) / 1000,
        projects_at_risk: mockComplianceData.filter(r => r.risk_level === 'High' || r.risk_level === 'Critical').length,
        recent_degradations: mockComplianceData.filter(r => r.ndvi_change_percent < -10 || r.co2_change_percent < -15).length
      }
    };

    res.json({
      success: true,
      analytics: analytics
    });

  } catch (error) {
    console.error('Error fetching overview:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch overview'
    });
  }
});

module.exports = router;