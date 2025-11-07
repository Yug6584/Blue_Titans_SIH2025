import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  LinearProgress,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Tooltip,
  Alert
} from '@mui/material';
import {
  Gavel,
  Assessment,
  Security,
  AccountBalance,
  Verified,
  Warning,
  TrendingUp,
  Visibility,
  CheckCircle,
  Schedule
} from '@mui/icons-material';
import { Line, Doughnut, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip as ChartTooltip,
  Legend,
  ArcElement
} from 'chart.js';
import CardStats from '../../components/CardStats';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  ChartTooltip,
  Legend,
  ArcElement
);

const GovernmentDashboard = () => {
  const [pendingVerifications, setPendingVerifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setPendingVerifications([
        {
          id: 1,
          projectName: 'Mangrove Restoration - Sundarbans',
          company: 'EcoRestore Ltd.',
          submissionDate: '2024-01-15',
          type: 'Initial Verification',
          priority: 'High',
          estimatedCredits: 15000,
          status: 'Under Review'
        },
        {
          id: 2,
          projectName: 'Seagrass Conservation - Gulf Coast',
          company: 'Ocean Carbon Co.',
          submissionDate: '2024-01-12',
          type: 'Annual Monitoring',
          priority: 'Medium',
          estimatedCredits: 8200,
          status: 'Pending Documents'
        },
        {
          id: 3,
          projectName: 'Salt Marsh Protection - Bay Area',
          company: 'Pacific Blue Carbon',
          submissionDate: '2024-01-10',
          type: 'Credit Issuance',
          priority: 'Low',
          estimatedCredits: 5500,
          status: 'Technical Review'
        }
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  const verificationTrendData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Verifications Completed',
        data: [12, 18, 15, 22, 19, 25],
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        tension: 0.4
      },
      {
        label: 'Credits Issued',
        data: [45000, 62000, 58000, 78000, 71000, 89000],
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        tension: 0.4,
        yAxisID: 'y1'
      }
    ]
  };

  const projectStatusData = {
    labels: ['Approved', 'Under Review', 'Rejected', 'Pending'],
    datasets: [
      {
        data: [65, 20, 10, 5],
        backgroundColor: [
          '#4CAF50',
          '#FF9800',
          '#F44336',
          '#2196F3'
        ]
      }
    ]
  };

  const complianceData = {
    labels: ['Q1', 'Q2', 'Q3', 'Q4'],
    datasets: [
      {
        label: 'Compliance Rate (%)',
        data: [92, 95, 88, 94],
        backgroundColor: 'rgba(54, 162, 235, 0.8)'
      }
    ]
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High': return 'error';
      case 'Medium': return 'warning';
      case 'Low': return 'info';
      default: return 'default';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Under Review': return 'warning';
      case 'Pending Documents': return 'info';
      case 'Technical Review': return 'primary';
      case 'Approved': return 'success';
      default: return 'default';
    }
  };

  if (loading) {
    return (
      <Box sx={{ width: '100%', mt: 2 }}>
        <LinearProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ mb: 3, fontWeight: 'bold' }}>
        Government Oversight Dashboard
      </Typography>

      {/* Alert for urgent items */}
      <Alert severity="warning" sx={{ mb: 3 }}>
        You have 3 high-priority verifications pending review. Average processing time: 7 days.
      </Alert>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <CardStats
            title="Pending Verifications"
            value="23"
            icon={<Gavel />}
            trend="+12%"
            color="warning"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <CardStats
            title="Credits Issued (YTD)"
            value="425K"
            icon={<Verified />}
            trend="+18%"
            color="success"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <CardStats
            title="Active Projects"
            value="156"
            icon={<Assessment />}
            trend="+8%"
            color="info"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <CardStats
            title="Compliance Rate"
            value="94%"
            icon={<Security />}
            trend="+2%"
            color="primary"
          />
        </Grid>
      </Grid>

      {/* Charts */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Verification & Credit Issuance Trends
              </Typography>
              <Box sx={{ height: 300 }}>
                <Line 
                  data={verificationTrendData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    interaction: {
                      mode: 'index',
                      intersect: false,
                    },
                    scales: {
                      x: {
                        display: true,
                        title: {
                          display: true,
                          text: 'Month'
                        }
                      },
                      y: {
                        type: 'linear',
                        display: true,
                        position: 'left',
                        title: {
                          display: true,
                          text: 'Verifications'
                        }
                      },
                      y1: {
                        type: 'linear',
                        display: true,
                        position: 'right',
                        title: {
                          display: true,
                          text: 'Credits Issued'
                        },
                        grid: {
                          drawOnChartArea: false,
                        },
                      },
                    },
                    plugins: {
                      legend: {
                        position: 'top',
                      },
                    },
                  }}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Project Status Distribution
              </Typography>
              <Box sx={{ height: 300 }}>
                <Doughnut 
                  data={projectStatusData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'bottom',
                      },
                    },
                  }}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Quarterly Compliance Rates
              </Typography>
              <Box sx={{ height: 250 }}>
                <Bar 
                  data={complianceData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        display: false,
                      },
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                        max: 100,
                        title: {
                          display: true,
                          text: 'Compliance Rate (%)'
                        }
                      }
                    }
                  }}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
                Quick Actions
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Button
                    variant="contained"
                    fullWidth
                    startIcon={<Gavel />}
                    sx={{ mb: 1 }}
                  >
                    Review Queue
                  </Button>
                </Grid>
                <Grid item xs={6}>
                  <Button
                    variant="contained"
                    fullWidth
                    startIcon={<Assessment />}
                    sx={{ mb: 1 }}
                  >
                    Generate Report
                  </Button>
                </Grid>
                <Grid item xs={6}>
                  <Button
                    variant="outlined"
                    fullWidth
                    startIcon={<Security />}
                    sx={{ mb: 1 }}
                  >
                    Audit Trail
                  </Button>
                </Grid>
                <Grid item xs={6}>
                  <Button
                    variant="outlined"
                    fullWidth
                    startIcon={<AccountBalance />}
                    sx={{ mb: 1 }}
                  >
                    Policy Center
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Pending Verifications Table */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Priority Verification Queue
          </Typography>
          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Project Name</TableCell>
                  <TableCell>Company</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Priority</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Est. Credits</TableCell>
                  <TableCell>Submission Date</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {pendingVerifications.map((verification) => (
                  <TableRow key={verification.id}>
                    <TableCell>
                      <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                        {verification.projectName}
                      </Typography>
                    </TableCell>
                    <TableCell>{verification.company}</TableCell>
                    <TableCell>{verification.type}</TableCell>
                    <TableCell>
                      <Chip 
                        label={verification.priority}
                        color={getPriorityColor(verification.priority)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={verification.status}
                        color={getStatusColor(verification.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="right">
                      {verification.estimatedCredits.toLocaleString()}
                    </TableCell>
                    <TableCell>{verification.submissionDate}</TableCell>
                    <TableCell align="center">
                      <Tooltip title="Review Details">
                        <IconButton size="small" color="primary">
                          <Visibility />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Approve">
                        <IconButton size="small" color="success">
                          <CheckCircle />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Request More Info">
                        <IconButton size="small" color="warning">
                          <Schedule />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Box>
  );
};

export default GovernmentDashboard;