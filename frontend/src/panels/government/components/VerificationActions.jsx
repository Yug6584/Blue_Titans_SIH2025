import React, { useState } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  Divider,
  Paper,
} from '@mui/material';
import {
  CheckCircle,
  Cancel,
  Assignment,
  Send,
  Warning,
  Info,
  Group,
  Schedule,
  Flag,
} from '@mui/icons-material';
import { blueCarbon } from '../../../theme/colors';

const VerificationActions = ({ project, onUpdate }) => {
  const [actionDialog, setActionDialog] = useState(false);
  const [selectedAction, setSelectedAction] = useState('');
  const [comments, setComments] = useState('');
  const [assignedTeam, setAssignedTeam] = useState('');
  const [priority, setPriority] = useState(project.priority);

  const verificationTeams = [
    'Field Team Alpha',
    'Field Team Beta',
    'Remote Sensing Team',
    'Document Review Team',
    'Compliance Team'
  ];

  const actionTypes = [
    {
      id: 'approve',
      label: 'Approve Project',
      description: 'Mark project as verified and approved for credit issuance',
      color: '#4caf50',
      icon: <CheckCircle />,
      requiresComments: false
    },
    {
      id: 'reject',
      label: 'Reject Project',
      description: 'Reject project due to non-compliance or insufficient evidence',
      color: '#f44336',
      icon: <Cancel />,
      requiresComments: true
    },
    {
      id: 'request-info',
      label: 'Request Additional Information',
      description: 'Request more documentation or clarification from project developer',
      color: '#ff9800',
      icon: <Info />,
      requiresComments: true
    },
    {
      id: 'assign-team',
      label: 'Assign Verification Team',
      description: 'Assign a field verification team to conduct on-site validation',
      color: blueCarbon.oceanBlue,
      icon: <Group />,
      requiresComments: false
    },
    {
      id: 'schedule-visit',
      label: 'Schedule Site Visit',
      description: 'Schedule a field visit for physical verification',
      color: '#9c27b0',
      icon: <Schedule />,
      requiresComments: false
    },
    {
      id: 'flag-issue',
      label: 'Flag Issue',
      description: 'Flag specific issues that need to be addressed',
      color: '#ff5722',
      icon: <Flag />,
      requiresComments: true
    }
  ];

  const handleActionClick = (actionId) => {
    setSelectedAction(actionId);
    setActionDialog(true);
  };

  const executeAction = () => {
    const action = actionTypes.find(a => a.id === selectedAction);
    
    // Simulate action execution
    console.log(`Executing ${action.label} for project ${project.id}`);
    console.log('Comments:', comments);
    
    if (selectedAction === 'assign-team') {
      console.log('Assigned Team:', assignedTeam);
      // Update project with assigned team
      onUpdate({
        ...project,
        verificationTeam: assignedTeam,
        status: 'in-review'
      });
    } else if (selectedAction === 'approve') {
      onUpdate({
        ...project,
        status: 'verified'
      });
    } else if (selectedAction === 'reject') {
      onUpdate({
        ...project,
        status: 'rejected'
      });
    }

    // Reset form
    setActionDialog(false);
    setSelectedAction('');
    setComments('');
    setAssignedTeam('');
  };

  const getActionButton = (action) => (
    <Button
      key={action.id}
      variant="outlined"
      startIcon={action.icon}
      onClick={() => handleActionClick(action.id)}
      sx={{
        borderColor: action.color,
        color: action.color,
        '&:hover': {
          borderColor: action.color,
          bgcolor: `${action.color}10`
        }
      }}
      fullWidth
    >
      {action.label}
    </Button>
  );

  const selectedActionData = actionTypes.find(a => a.id === selectedAction);

  return (
    <Box>
      {/* Current Status */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Current Project Status
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <Chip
              label={project.status.charAt(0).toUpperCase() + project.status.slice(1)}
              sx={{
                bgcolor: project.status === 'verified' ? '#4caf5020' : 
                         project.status === 'rejected' ? '#f4433620' : '#ff980020',
                color: project.status === 'verified' ? '#4caf50' : 
                       project.status === 'rejected' ? '#f44336' : '#ff9800',
                fontWeight: 600
              }}
            />
            <Chip
              label={`Priority: ${project.priority.charAt(0).toUpperCase() + project.priority.slice(1)}`}
              variant="outlined"
            />
          </Box>
          
          {project.verificationTeam && (
            <Alert severity="info" sx={{ mb: 2 }}>
              <Typography variant="body2">
                <strong>Assigned Team:</strong> {project.verificationTeam}
              </Typography>
            </Alert>
          )}

          <Typography variant="body2" color="text.secondary">
            Last updated: {new Date(project.lastActivity).toLocaleDateString()}
          </Typography>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Typography variant="h6" gutterBottom>
        Verification Actions
      </Typography>
      
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {actionTypes.map((action) => (
          <Grid item xs={12} sm={6} md={4} key={action.id}>
            <Paper sx={{ p: 2, height: '100%' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                {React.cloneElement(action.icon, { 
                  sx: { color: action.color, mr: 1 } 
                })}
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                  {action.label}
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2, minHeight: 40 }}>
                {action.description}
              </Typography>
              {getActionButton(action)}
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* Recent Actions History */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Recent Actions
          </Typography>
          <List>
            <ListItem>
              <ListItemIcon>
                <Assignment color="primary" />
              </ListItemIcon>
              <ListItemText
                primary="Project Submitted"
                secondary={`${new Date(project.submissionDate).toLocaleDateString()} by ${project.submittedBy}`}
              />
            </ListItem>
            <Divider />
            <ListItem>
              <ListItemIcon>
                <Info color="info" />
              </ListItemIcon>
              <ListItemText
                primary="AI Validation Completed"
                secondary={`Score: ${project.aiValidationScore}% - ${project.flaggedIssues} issues flagged`}
              />
            </ListItem>
            {project.verificationTeam && (
              <>
                <Divider />
                <ListItem>
                  <ListItemIcon>
                    <Group color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Verification Team Assigned"
                    secondary={`${project.verificationTeam} assigned for field verification`}
                  />
                </ListItem>
              </>
            )}
          </List>
        </CardContent>
      </Card>

      {/* Action Dialog */}
      <Dialog 
        open={actionDialog} 
        onClose={() => setActionDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {selectedActionData?.label}
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            {selectedActionData?.description}
          </Typography>

          {selectedAction === 'assign-team' && (
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Verification Team</InputLabel>
              <Select
                value={assignedTeam}
                label="Verification Team"
                onChange={(e) => setAssignedTeam(e.target.value)}
              >
                {verificationTeams.map((team) => (
                  <MenuItem key={team} value={team}>
                    {team}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}

          {selectedActionData?.requiresComments && (
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Comments"
              placeholder="Please provide detailed comments for this action..."
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              required
            />
          )}

          {!selectedActionData?.requiresComments && selectedAction !== 'assign-team' && (
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Comments (Optional)"
              placeholder="Add any additional comments..."
              value={comments}
              onChange={(e) => setComments(e.target.value)}
            />
          )}

          {(selectedAction === 'approve' || selectedAction === 'reject') && (
            <Alert 
              severity={selectedAction === 'approve' ? 'success' : 'warning'} 
              sx={{ mt: 2 }}
            >
              <Typography variant="body2">
                {selectedAction === 'approve' 
                  ? 'This action will mark the project as verified and approved for credit issuance.'
                  : 'This action will reject the project. The developer will be notified and can resubmit after addressing the issues.'
                }
              </Typography>
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setActionDialog(false)}>
            Cancel
          </Button>
          <Button 
            onClick={executeAction}
            variant="contained"
            disabled={
              selectedActionData?.requiresComments && !comments.trim() ||
              selectedAction === 'assign-team' && !assignedTeam
            }
            sx={{
              bgcolor: selectedActionData?.color,
              '&:hover': {
                bgcolor: selectedActionData?.color,
                opacity: 0.8
              }
            }}
          >
            Execute Action
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default VerificationActions;