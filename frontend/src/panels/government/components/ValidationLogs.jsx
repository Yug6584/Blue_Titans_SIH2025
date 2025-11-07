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
  Avatar,
  Chip,
  Paper,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
} from '@mui/material';
import {
  Assignment,
  CheckCircle,
  Warning,
  Error,
  Info,
  Person,
  Computer,
  Group,
  Flag,
  Send,
  Add,
  CalendarToday,
} from '@mui/icons-material';
import { blueCarbon } from '../../../theme/colors';

const ValidationLogs = ({ project }) => {
  const [addLogDialog, setAddLogDialog] = useState(false);
  const [newLog, setNewLog] = useState({
    type: 'note',
    message: '',
    priority: 'medium'
  });

  // Mock validation logs
  const logs = [
    {
      id: 1,
      timestamp: new Date('2024-01-20T14:30:00'),
      type: 'submission',
      actor: 'System',
      actorType: 'system',
      message: 'Project submitted for verification',
      details: 'Initial project submission received from Tata Power Renewable Energy',
      priority: 'info'
    },
    {
      id: 2,
      timestamp: new Date('2024-01-20T14:35:00'),
      type: 'ai_validation',
      actor: 'AI Validator',
      actorType: 'ai',
      message: 'AI validation completed',
      details: 'Overall score: 92%. 1 issue flagged in risk assessment category.',
      priority: 'info'
    },
    {
      id: 3,
      timestamp: new Date('2024-01-21T09:15:00'),
      type: 'review',
      actor: 'Dr. Sarah Chen',
      actorType: 'human',
      message: 'Initial document review completed',
      details: 'All required documents present. Minor formatting issues noted in carbon calculations.',
      priority: 'low'
    },
    {
      id: 4,
      timestamp: new Date('2024-01-21T11:45:00'),
      type: 'flag',
      actor: 'AI Validator',
      actorType: 'ai',
      message: 'Issue flagged: Permanence assurance',
      details: 'Sea level rise projections may impact long-term viability. Requires expert review.',
      priority: 'high'
    },
    {
      id: 5,
      timestamp: new Date('2024-01-22T08:30:00'),
      type: 'assignment',
      actor: 'System Admin',
      actorType: 'human',
      message: 'Verification team assignment pending',
      details: 'Awaiting availability of Field Team Alpha for site visit scheduling.',
      priority: 'medium'
    },
    {
      id: 6,
      timestamp: new Date('2024-01-22T16:20:00'),
      type: 'note',
      actor: 'Prof. Michael Rodriguez',
      actorType: 'human',
      message: 'Expert consultation requested',
      details: 'Requesting marine ecology expert review for mangrove restoration methodology validation.',
      priority: 'medium'
    }
  ];

  const getLogIcon = (type) => {
    switch (type) {
      case 'submission':
        return <Assignment />;
      case 'ai_validation':
        return <Computer />;
      case 'review':
        return <CheckCircle />;
      case 'flag':
        return <Flag />;
      case 'assignment':
        return <Group />;
      case 'note':
        return <Info />;
      case 'approval':
        return <CheckCircle />;
      case 'rejection':
        return <Error />;
      default:
        return <Info />;
    }
  };

  const getLogColor = (type, priority) => {
    if (priority === 'high') return '#f44336';
    if (priority === 'medium') return '#ff9800';
    
    switch (type) {
      case 'submission':
        return blueCarbon.oceanBlue;
      case 'ai_validation':
        return blueCarbon.aqua;
      case 'review':
        return '#4caf50';
      case 'flag':
        return '#f44336';
      case 'assignment':
        return '#9c27b0';
      case 'approval':
        return '#4caf50';
      case 'rejection':
        return '#f44336';
      default:
        return '#666';
    }
  };

  const getActorAvatar = (actorType, actor) => {
    switch (actorType) {
      case 'system':
        return (
          <Avatar sx={{ bgcolor: '#666', width: 32, height: 32 }}>
            <Computer sx={{ fontSize: 16 }} />
          </Avatar>
        );
      case 'ai':
        return (
          <Avatar sx={{ bgcolor: blueCarbon.aqua, width: 32, height: 32 }}>
            <Computer sx={{ fontSize: 16 }} />
          </Avatar>
        );
      case 'human':
        return (
          <Avatar sx={{ bgcolor: blueCarbon.forest, width: 32, height: 32 }}>
            <Person sx={{ fontSize: 16 }} />
          </Avatar>
        );
      default:
        return (
          <Avatar sx={{ width: 32, height: 32 }}>
            {actor.charAt(0)}
          </Avatar>
        );
    }
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleAddLog = () => {
    // Simulate adding a new log entry
    console.log('Adding new log:', newLog);
    setAddLogDialog(false);
    setNewLog({ type: 'note', message: '', priority: 'medium' });
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return '#f44336';
      case 'medium': return '#ff9800';
      case 'low': return '#4caf50';
      default: return '#666';
    }
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6">
          Validation Timeline
        </Typography>
        <Button
          variant="outlined"
          startIcon={<Add />}
          onClick={() => setAddLogDialog(true)}
        >
          Add Log Entry
        </Button>
      </Box>

      {/* Timeline */}
      <Box sx={{ position: 'relative' }}>
        {/* Timeline line */}
        <Box
          sx={{
            position: 'absolute',
            left: 20,
            top: 0,
            bottom: 0,
            width: 2,
            bgcolor: 'divider',
            zIndex: 0
          }}
        />
        
        {logs.map((log, index) => (
          <Box key={log.id} sx={{ position: 'relative', pb: 3 }}>
            {/* Timeline dot */}
            <Box
              sx={{
                position: 'absolute',
                left: 12,
                top: 8,
                width: 16,
                height: 16,
                borderRadius: '50%',
                bgcolor: getLogColor(log.type, log.priority),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1,
                border: '2px solid white'
              }}
            >
              {React.cloneElement(getLogIcon(log.type), { 
                sx: { color: 'white', fontSize: 10 } 
              })}
            </Box>
            
            {/* Timeline content */}
            <Box sx={{ ml: 5 }}>
              <Paper sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    {getActorAvatar(log.actorType, log.actor)}
                    <Box sx={{ ml: 1 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                        {log.message}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        by {log.actor} • {formatTimestamp(log.timestamp)}
                      </Typography>
                    </Box>
                  </Box>
                  <Chip
                    label={log.priority.toUpperCase()}
                    size="small"
                    sx={{
                      bgcolor: `${getPriorityColor(log.priority)}20`,
                      color: getPriorityColor(log.priority),
                      fontWeight: 600
                    }}
                  />
                </Box>
                
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  {log.details}
                </Typography>

                {log.type === 'flag' && (
                  <Box sx={{ mt: 2, p: 1, bgcolor: '#f4433610', borderRadius: 1, border: '1px solid #f4433630' }}>
                    <Typography variant="caption" sx={{ color: '#f44336', fontWeight: 600 }}>
                      ⚠️ This issue requires attention before project approval
                    </Typography>
                  </Box>
                )}
              </Paper>
            </Box>
          </Box>
        ))}
      </Box>

      {/* Summary Stats */}
      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Activity Summary
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Chip
              label={`${logs.length} Total Entries`}
              variant="outlined"
            />
            <Chip
              label={`${logs.filter(l => l.priority === 'high').length} High Priority`}
              sx={{
                bgcolor: '#f4433620',
                color: '#f44336',
                fontWeight: 600
              }}
            />
            <Chip
              label={`${logs.filter(l => l.type === 'flag').length} Flagged Issues`}
              color="warning"
            />
            <Chip
              label={`${logs.filter(l => l.actorType === 'ai').length} AI Actions`}
              sx={{
                bgcolor: `${blueCarbon.aqua}20`,
                color: blueCarbon.aqua,
                fontWeight: 600
              }}
            />
          </Box>
        </CardContent>
      </Card>

      {/* Add Log Dialog */}
      <Dialog
        open={addLogDialog}
        onClose={() => setAddLogDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Add Log Entry
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <FormControl fullWidth>
              <InputLabel>Entry Type</InputLabel>
              <Select
                value={newLog.type}
                label="Entry Type"
                onChange={(e) => setNewLog({ ...newLog, type: e.target.value })}
              >
                <MenuItem value="note">Note</MenuItem>
                <MenuItem value="review">Review</MenuItem>
                <MenuItem value="flag">Flag Issue</MenuItem>
                <MenuItem value="assignment">Assignment</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Priority</InputLabel>
              <Select
                value={newLog.priority}
                label="Priority"
                onChange={(e) => setNewLog({ ...newLog, priority: e.target.value })}
              >
                <MenuItem value="low">Low</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="high">High</MenuItem>
              </Select>
            </FormControl>

            <TextField
              fullWidth
              multiline
              rows={4}
              label="Message"
              placeholder="Enter your log message..."
              value={newLog.message}
              onChange={(e) => setNewLog({ ...newLog, message: e.target.value })}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddLogDialog(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleAddLog}
            variant="contained"
            disabled={!newLog.message.trim()}
            startIcon={<Send />}
          >
            Add Entry
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ValidationLogs;