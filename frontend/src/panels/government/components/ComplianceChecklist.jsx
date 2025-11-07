import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Checkbox,
  LinearProgress,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Alert,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material';
import {
  CheckCircle,
  Cancel,
  Warning,
  ExpandMore,
  Assignment,
  Eco,
  Group,
  Security,
  Assessment,
  LocationOn,
  Description,
  Flag,
} from '@mui/icons-material';
import { blueCarbon } from '../../../theme/colors';

const ComplianceChecklist = ({ project }) => {
  const [checklist, setChecklist] = useState({
    documentation: {
      title: 'Documentation Requirements',
      icon: <Description />,
      items: [
        { id: 'eia', label: 'Environmental Impact Assessment', status: 'completed', required: true },
        { id: 'pdd', label: 'Project Design Document', status: 'completed', required: true },
        { id: 'baseline', label: 'Baseline Study Report', status: 'completed', required: true },
        { id: 'monitoring', label: 'Monitoring Plan', status: 'completed', required: true },
        { id: 'consent', label: 'Community Consent Letters', status: 'pending', required: true },
        { id: 'permits', label: 'Government Permits', status: 'flagged', required: true },
      ]
    },
    environmental: {
      title: 'Environmental Compliance',
      icon: <Eco />,
      items: [
        { id: 'biodiversity', label: 'Biodiversity Impact Assessment', status: 'completed', required: true },
        { id: 'carbon', label: 'Carbon Stock Measurements', status: 'completed', required: true },
        { id: 'water', label: 'Water Quality Analysis', status: 'completed', required: false },
        { id: 'soil', label: 'Soil Quality Assessment', status: 'pending', required: false },
        { id: 'species', label: 'Endangered Species Survey', status: 'completed', required: true },
      ]
    },
    social: {
      title: 'Social & Community',
      icon: <Group />,
      items: [
        { id: 'stakeholder', label: 'Stakeholder Consultation', status: 'completed', required: true },
        { id: 'indigenous', label: 'Indigenous Rights Assessment', status: 'completed', required: true },
        { id: 'livelihood', label: 'Livelihood Impact Study', status: 'pending', required: true },
        { id: 'grievance', label: 'Grievance Mechanism', status: 'completed', required: true },
      ]
    },
    technical: {
      title: 'Technical Standards',
      icon: <Assessment />,
      items: [
        { id: 'methodology', label: 'Approved Methodology Applied', status: 'completed', required: true },
        { id: 'measurements', label: 'Accurate Measurements', status: 'completed', required: true },
        { id: 'verification', label: 'Third-party Verification', status: 'pending', required: true },
        { id: 'permanence', label: 'Permanence Assurance', status: 'flagged', required: true },
      ]
    },
    legal: {
      title: 'Legal Compliance',
      icon: <Security />,
      items: [
        { id: 'ownership', label: 'Land Ownership Verification', status: 'completed', required: true },
        { id: 'regulations', label: 'Local Regulations Compliance', status: 'completed', required: true },
        { id: 'international', label: 'International Standards', status: 'completed', required: true },
        { id: 'contracts', label: 'Legal Contracts Review', status: 'pending', required: true },
      ]
    }
  });

  const [issueDialog, setIssueDialog] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [issueComment, setIssueComment] = useState('');

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle sx={{ color: '#4caf50' }} />;
      case 'pending':
        return <Warning sx={{ color: '#ff9800' }} />;
      case 'flagged':
        return <Cancel sx={{ color: '#f44336' }} />;
      default:
        return <Warning sx={{ color: '#666' }} />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return '#4caf50';
      case 'pending': return '#ff9800';
      case 'flagged': return '#f44336';
      default: return '#666';
    }
  };

  const calculateCategoryProgress = (category) => {
    const items = checklist[category].items;
    const completed = items.filter(item => item.status === 'completed').length;
    return (completed / items.length) * 100;
  };

  const calculateOverallProgress = () => {
    const allItems = Object.values(checklist).flatMap(category => category.items);
    const completed = allItems.filter(item => item.status === 'completed').length;
    return (completed / allItems.length) * 100;
  };

  const getFlaggedIssues = () => {
    return Object.values(checklist).flatMap(category => 
      category.items.filter(item => item.status === 'flagged')
        .map(item => ({ ...item, category: category.title }))
    );
  };

  const handleIssueClick = (item, category) => {
    setSelectedIssue({ ...item, category });
    setIssueDialog(true);
  };

  const resolveIssue = () => {
    // Update the item status
    const categoryKey = Object.keys(checklist).find(key => 
      checklist[key].title === selectedIssue.category
    );
    
    setChecklist(prev => ({
      ...prev,
      [categoryKey]: {
        ...prev[categoryKey],
        items: prev[categoryKey].items.map(item => 
          item.id === selectedIssue.id 
            ? { ...item, status: 'completed' }
            : item
        )
      }
    }));

    setIssueDialog(false);
    setSelectedIssue(null);
    setIssueComment('');
  };

  const overallProgress = calculateOverallProgress();
  const flaggedIssues = getFlaggedIssues();

  return (
    <Box>
      {/* Overall Progress */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Compliance Overview
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Box sx={{ flexGrow: 1, mr: 2 }}>
              <LinearProgress
                variant="determinate"
                value={overallProgress}
                sx={{
                  height: 8,
                  borderRadius: 4,
                  '& .MuiLinearProgress-bar': {
                    bgcolor: overallProgress >= 80 ? '#4caf50' : 
                             overallProgress >= 60 ? '#ff9800' : '#f44336'
                  }
                }}
              />
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              {Math.round(overallProgress)}%
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Chip
              label={`${Math.round(overallProgress)}% Complete`}
              color={overallProgress >= 80 ? 'success' : overallProgress >= 60 ? 'warning' : 'error'}
            />
            {flaggedIssues.length > 0 && (
              <Chip
                icon={<Flag />}
                label={`${flaggedIssues.length} Issues`}
                color="error"
                variant="outlined"
              />
            )}
          </Box>
        </CardContent>
      </Card>

      {/* Flagged Issues Alert */}
      {flaggedIssues.length > 0 && (
        <Alert severity="error" sx={{ mb: 3 }}>
          <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
            Critical Issues Requiring Attention:
          </Typography>
          {flaggedIssues.map((issue, index) => (
            <Typography key={index} variant="body2">
              • {issue.category}: {issue.label}
            </Typography>
          ))}
        </Alert>
      )}

      {/* Compliance Categories */}
      {Object.entries(checklist).map(([categoryKey, category]) => {
        const progress = calculateCategoryProgress(categoryKey);
        const flaggedCount = category.items.filter(item => item.status === 'flagged').length;
        
        return (
          <Accordion key={categoryKey} defaultExpanded>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                {category.icon}
                <Box sx={{ ml: 2, flexGrow: 1 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    {category.title}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                    <LinearProgress
                      variant="determinate"
                      value={progress}
                      sx={{
                        width: 200,
                        height: 4,
                        mr: 2,
                        '& .MuiLinearProgress-bar': {
                          bgcolor: progress >= 80 ? '#4caf50' : 
                                   progress >= 60 ? '#ff9800' : '#f44336'
                        }
                      }}
                    />
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {Math.round(progress)}%
                    </Typography>
                    {flaggedCount > 0 && (
                      <Chip
                        size="small"
                        label={`${flaggedCount} issues`}
                        color="error"
                        sx={{ ml: 1 }}
                      />
                    )}
                  </Box>
                </Box>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <List>
                {category.items.map((item) => (
                  <ListItem
                    key={item.id}
                    sx={{
                      border: 1,
                      borderColor: 'divider',
                      borderRadius: 1,
                      mb: 1,
                      bgcolor: item.status === 'flagged' ? '#f4433610' : 'transparent',
                      cursor: item.status === 'flagged' ? 'pointer' : 'default'
                    }}
                    onClick={() => item.status === 'flagged' && handleIssueClick(item, category.title)}
                  >
                    <ListItemIcon>
                      {getStatusIcon(item.status)}
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {item.label}
                          </Typography>
                          {item.required && (
                            <Chip
                              label="Required"
                              size="small"
                              color="primary"
                              variant="outlined"
                              sx={{ ml: 1 }}
                            />
                          )}
                        </Box>
                      }
                      secondary={
                        <Chip
                          label={item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                          size="small"
                          sx={{
                            bgcolor: `${getStatusColor(item.status)}20`,
                            color: getStatusColor(item.status),
                            fontWeight: 500,
                            mt: 0.5
                          }}
                        />
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </AccordionDetails>
          </Accordion>
        );
      })}

      {/* Issue Resolution Dialog */}
      <Dialog
        open={issueDialog}
        onClose={() => setIssueDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Resolve Compliance Issue
        </DialogTitle>
        <DialogContent>
          {selectedIssue && (
            <>
              <Typography variant="body1" sx={{ fontWeight: 600, mb: 1 }}>
                {selectedIssue.label}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Category: {selectedIssue.category}
              </Typography>
              
              <Alert severity="error" sx={{ mb: 3 }}>
                <Typography variant="body2">
                  This item has been flagged as non-compliant. Please review the requirements and confirm resolution.
                </Typography>
              </Alert>

              <TextField
                fullWidth
                multiline
                rows={4}
                label="Resolution Comments"
                placeholder="Describe how this issue has been resolved..."
                value={issueComment}
                onChange={(e) => setIssueComment(e.target.value)}
              />
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIssueDialog(false)}>
            Cancel
          </Button>
          <Button
            onClick={resolveIssue}
            variant="contained"
            color="success"
            disabled={!issueComment.trim()}
          >
            Mark as Resolved
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ComplianceChecklist;