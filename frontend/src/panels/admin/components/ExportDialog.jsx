import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  Download,
  Close,
  DateRange,
} from '@mui/icons-material';
import { blueCarbon } from '../../../theme/colors';
import { adminActionService } from '../../../services/adminActionService';

const ExportDialog = ({ open, onClose, onNotification }) => {
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [format, setFormat] = useState('txt');
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    if (!dateFrom || !dateTo) {
      onNotification('Please select both start and end dates', 'error');
      return;
    }

    if (new Date(dateFrom) > new Date(dateTo)) {
      onNotification('Start date cannot be after end date', 'error');
      return;
    }

    try {
      setIsExporting(true);
      
      // Get admin actions for the date range
      const params = new URLSearchParams();
      params.append('dateFrom', dateFrom);
      params.append('dateTo', dateTo);
      params.append('limit', '1000'); // Get all actions in range
      
      const response = await adminActionService.getAdminActions(params.toString());
      
      if (response && response.success) {
        const actions = response.actions || [];
        
        if (actions.length === 0) {
          onNotification('No admin actions found in the selected date range', 'warning');
          return;
        }

        // Generate the export content
        const exportContent = generateExportContent(actions, dateFrom, dateTo, format);
        
        // Download the file
        downloadFile(exportContent, `admin-actions-${dateFrom}-to-${dateTo}.${format}`);
        
        onNotification(`Successfully exported ${actions.length} admin actions`, 'success');
        onClose();
      } else {
        onNotification('Failed to fetch admin actions for export', 'error');
      }
    } catch (error) {
      console.error('Export error:', error);
      onNotification('Error occurred during export', 'error');
    } finally {
      setIsExporting(false);
    }
  };

  const generateExportContent = (actions, fromDate, toDate, format) => {
    const sortedActions = actions.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    if (format === 'txt') {
      return generateTextContent(sortedActions, fromDate, toDate);
    } else if (format === 'csv') {
      return generateCSVContent(sortedActions, fromDate, toDate);
    }
  };

  const generateTextContent = (actions, fromDate, toDate) => {
    let content = '';
    content += '='.repeat(80) + '\n';
    content += '                    ADMIN ACTIONS REPORT\n';
    content += '='.repeat(80) + '\n';
    content += `Report Period: ${formatDate(fromDate)} to ${formatDate(toDate)}\n`;
    content += `Generated: ${new Date().toLocaleString()}\n`;
    content += `Total Actions: ${actions.length}\n`;
    content += '='.repeat(80) + '\n\n';

    // Group by date
    const groupedByDate = {};
    actions.forEach(action => {
      const date = new Date(action.timestamp).toDateString();
      if (!groupedByDate[date]) {
        groupedByDate[date] = [];
      }
      groupedByDate[date].push(action);
    });

    // Generate content for each date
    Object.entries(groupedByDate).forEach(([date, dateActions]) => {
      content += `📅 ${formatDate(date)} (${dateActions.length} actions)\n`;
      content += '-'.repeat(60) + '\n';
      
      dateActions.forEach((action, index) => {
        const time = new Date(action.timestamp).toLocaleTimeString();
        const actionType = action.action?.type ? action.action.type.replace(/_/g, ' ').toUpperCase() : 'UNKNOWN ACTION';
        const severity = (action.action?.severity || 'medium').toUpperCase();
        const admin = action.admin?.email || 'Unknown Admin';
        const target = action.target?.email || 'N/A';
        const details = action.action?.details || 'No details available';
        
        content += `${index + 1}. ${time} - ${actionType} [${severity}]\n`;
        content += `   Admin: ${admin}\n`;
        content += `   Target: ${target}\n`;
        content += `   Details: ${details}\n`;
        content += `   IP Address: ${action.metadata?.ipAddress || 'Unknown'}\n`;
        content += `   Status: ${action.metadata?.status || 'completed'}\n`;
        content += '\n';
      });
      
      content += '\n';
    });

    // Summary
    const severityCounts = {
      high: actions.filter(a => a.action?.severity === 'high').length,
      medium: actions.filter(a => a.action?.severity === 'medium').length,
      low: actions.filter(a => a.action?.severity === 'low').length
    };

    content += '='.repeat(80) + '\n';
    content += '                        SUMMARY\n';
    content += '='.repeat(80) + '\n';
    content += `Total Actions: ${actions.length}\n`;
    content += `High Severity: ${severityCounts.high}\n`;
    content += `Medium Severity: ${severityCounts.medium}\n`;
    content += `Low Severity: ${severityCounts.low}\n`;
    content += `Report Generated: ${new Date().toLocaleString()}\n`;
    content += '='.repeat(80) + '\n';

    return content;
  };

  const generateCSVContent = (actions, fromDate, toDate) => {
    let content = '';
    
    // CSV Header
    content += 'Timestamp,Date,Time,Admin Email,Admin Name,Action Type,Target Email,Severity,Status,Details,IP Address\n';
    
    // CSV Data
    actions.forEach(action => {
      const timestamp = action.timestamp;
      const date = new Date(timestamp).toLocaleDateString();
      const time = new Date(timestamp).toLocaleTimeString();
      const adminEmail = action.admin?.email || 'Unknown';
      const adminName = action.admin?.name || 'Unknown';
      const actionType = action.action?.type || 'unknown';
      const targetEmail = action.target?.email || 'N/A';
      const severity = action.action?.severity || 'medium';
      const status = action.metadata?.status || 'completed';
      const details = (action.action?.details || 'No details').replace(/,/g, ';'); // Replace commas to avoid CSV issues
      const ipAddress = action.metadata?.ipAddress || 'Unknown';
      
      content += `"${timestamp}","${date}","${time}","${adminEmail}","${adminName}","${actionType}","${targetEmail}","${severity}","${status}","${details}","${ipAddress}"\n`;
    });
    
    return content;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const downloadFile = (content, filename) => {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const handleClose = () => {
    if (!isExporting) {
      setDateFrom('');
      setDateTo('');
      setFormat('txt');
      onClose();
    }
  };

  // Set default dates (last 30 days)
  React.useEffect(() => {
    if (open && !dateFrom && !dateTo) {
      const today = new Date();
      const thirtyDaysAgo = new Date(today);
      thirtyDaysAgo.setDate(today.getDate() - 30);
      
      setDateTo(today.toISOString().split('T')[0]);
      setDateFrom(thirtyDaysAgo.toISOString().split('T')[0]);
    }
  }, [open, dateFrom, dateTo]);

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 2 }
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        pb: 1,
        borderBottom: '1px solid #e0e0e0'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Download sx={{ color: blueCarbon.oceanBlue }} />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Export Admin Actions
          </Typography>
        </Box>
        <Button onClick={handleClose} size="small" disabled={isExporting}>
          <Close />
        </Button>
      </DialogTitle>

      <DialogContent sx={{ pt: 3 }}>
        <Alert severity="info" sx={{ mb: 3 }}>
          Select a date range to export admin actions. The report will include all administrative activities within the specified period.
        </Alert>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* Date Range Selection */}
          <Box>
            <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
              <DateRange sx={{ fontSize: 20 }} />
              Select Date Range
            </Typography>
            
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                label="From Date"
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                InputLabelProps={{ shrink: true }}
                fullWidth
                disabled={isExporting}
              />
              <TextField
                label="To Date"
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                InputLabelProps={{ shrink: true }}
                fullWidth
                disabled={isExporting}
              />
            </Box>
          </Box>

          {/* Format Selection */}
          <Box>
            <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
              Export Format
            </Typography>
            
            <FormControl fullWidth disabled={isExporting}>
              <InputLabel>Format</InputLabel>
              <Select
                value={format}
                label="Format"
                onChange={(e) => setFormat(e.target.value)}
              >
                <MenuItem value="txt">Text File (.txt) - Detailed Report</MenuItem>
                <MenuItem value="csv">CSV File (.csv) - Spreadsheet Format</MenuItem>
              </Select>
            </FormControl>
          </Box>

          {/* Preview Info */}
          {dateFrom && dateTo && (
            <Alert severity="success">
              Ready to export admin actions from <strong>{formatDate(dateFrom)}</strong> to <strong>{formatDate(dateTo)}</strong> as a <strong>{format.toUpperCase()}</strong> file.
            </Alert>
          )}
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 3, borderTop: '1px solid #e0e0e0' }}>
        <Button 
          onClick={handleClose} 
          disabled={isExporting}
          sx={{ mr: 1 }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleExport}
          variant="contained"
          startIcon={isExporting ? <CircularProgress size={16} /> : <Download />}
          disabled={isExporting || !dateFrom || !dateTo}
          sx={{ 
            bgcolor: blueCarbon.oceanBlue,
            '&:hover': { bgcolor: blueCarbon.deepOcean }
          }}
        >
          {isExporting ? 'Exporting...' : 'Export Report'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ExportDialog;