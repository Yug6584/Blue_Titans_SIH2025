import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Checkbox,
  IconButton,
  Chip,
  Avatar,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  Grid,
  Tooltip,
  LinearProgress,
  Alert,
  InputAdornment,
  CircularProgress,
} from '@mui/material';
import {
  Search,
  FilterList,
  MoreVert,
  Edit,
  Block,
  CheckCircle,
  Cancel,
  Download,
  Refresh,
  Add,
  Business,
  AccountBalance,
  AdminPanelSettings,
  Person,
  Visibility,
  Delete,
  Security,
  Email,
  Lock,
  VisibilityOff,
} from '@mui/icons-material';
import { blueCarbon } from '../../../theme/colors';
import UserDetailsModal from './UserDetailsModal';

const UserManagementTable = ({ users, onUserSelect, onRefresh, onNotification, loading }) => {
  const [filteredUsers, setFilteredUsers] = useState(users);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [sortBy, setSortBy] = useState('registrationDate');
  const [sortOrder, setSortOrder] = useState('desc');
  const [filters, setFilters] = useState({
    role: 'all',
    status: 'all',
    verified: 'all',
  });
  
  // Dialog states
  const [actionMenuAnchor, setActionMenuAnchor] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [bulkActionDialog, setBulkActionDialog] = useState(false);
  const [bulkAction, setBulkAction] = useState('');
  const [userDetailsOpen, setUserDetailsOpen] = useState(false);
  const [detailsUser, setDetailsUser] = useState(null);
  
  // Add User Dialog State
  const [addUserDialogOpen, setAddUserDialogOpen] = useState(false);
  const [addUserLoading, setAddUserLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [newUser, setNewUser] = useState({
    email: '',
    password: '',
    panel: '',
    name: '',
    organization: ''
  });
  const [addUserErrors, setAddUserErrors] = useState({});

  // Update filtered users when users or filters change
  useEffect(() => {
    let filtered = [...users];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.role.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply role filter
    if (filters.role !== 'all') {
      filtered = filtered.filter(user => user.role === filters.role);
    }

    // Apply status filter
    if (filters.status !== 'all') {
      filtered = filtered.filter(user => user.status === filters.status);
    }

    // Apply verification filter
    if (filters.verified !== 'all') {
      const isVerified = filters.verified === 'verified';
      filtered = filtered.filter(user => user.isVerified === isVerified);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];

      if (sortBy === 'registrationDate' || sortBy === 'lastLogin') {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredUsers(filtered);
    setPage(0); // Reset to first page when filters change
  }, [users, searchTerm, filters, sortBy, sortOrder]);

  const handleSelectAll = (event) => {
    if (event.target.checked) {
      const newSelected = filteredUsers.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map(user => user.id);
      setSelectedUsers(newSelected);
    } else {
      setSelectedUsers([]);
    }
  };

  const handleSelectUser = (userId) => {
    const selectedIndex = selectedUsers.indexOf(userId);
    let newSelected = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selectedUsers, userId);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selectedUsers.slice(1));
    } else if (selectedIndex === selectedUsers.length - 1) {
      newSelected = newSelected.concat(selectedUsers.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selectedUsers.slice(0, selectedIndex),
        selectedUsers.slice(selectedIndex + 1),
      );
    }

    setSelectedUsers(newSelected);
  };

  const handleActionMenu = (event, user) => {
    setActionMenuAnchor(event.currentTarget);
    setSelectedUser(user);
  };

  const handleCloseActionMenu = () => {
    setActionMenuAnchor(null);
    setSelectedUser(null);
  };

  const handleUserAction = async (action) => {
    if (!selectedUser) return;

    try {
      switch (action) {
        case 'view':
          setDetailsUser(selectedUser);
          setUserDetailsOpen(true);
          break;
          
        case 'edit':
          // Open edit dialog (we'll implement this)
          setDetailsUser(selectedUser);
          setUserDetailsOpen(true);
          break;
          
        case 'suspend':
          await handleSuspendUser(selectedUser);
          break;
          
        case 'activate':
          await handleActivateUser(selectedUser);
          break;
          
        case 'delete':
          await handleDeleteUser(selectedUser);
          break;
          
        default:
          break;
      }
    } catch (error) {
      onNotification(`Failed to ${action} user: ${error.message}`, 'error');
    }
    handleCloseActionMenu();
  };

  // Suspend User Function
  const handleSuspendUser = async (user) => {
    try {
      const response = await fetch(`http://localhost:8000/api/users/${user.id}/suspend`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const data = await response.json();

      if (data.success) {
        onNotification(`User ${user.email} has been suspended. They will not be able to login.`, 'warning');
        // Refresh the user list to show updated status
        if (onRefresh) {
          onRefresh();
        }
      } else {
        throw new Error(data.message || 'Failed to suspend user');
      }
    } catch (error) {
      console.error('Error suspending user:', error);
      throw error;
    }
  };

  // Activate User Function
  const handleActivateUser = async (user) => {
    try {
      const response = await fetch(`http://localhost:8000/api/users/${user.id}/activate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const data = await response.json();

      if (data.success) {
        onNotification(`User ${user.email} has been activated. They can now login.`, 'success');
        // Refresh the user list to show updated status
        if (onRefresh) {
          onRefresh();
        }
      } else {
        throw new Error(data.message || 'Failed to activate user');
      }
    } catch (error) {
      console.error('Error activating user:', error);
      throw error;
    }
  };

  // Delete User Function
  const handleDeleteUser = async (user) => {
    // Show confirmation dialog
    const confirmed = window.confirm(
      `Are you sure you want to permanently delete user "${user.name}" (${user.email})?\n\n` +
      `This action cannot be undone and will:\n` +
      `• Remove the user completely from the database\n` +
      `• Prevent them from logging in\n` +
      `• Update the user count\n\n` +
      `Click OK to confirm deletion.`
    );

    if (!confirmed) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:8000/api/users/${user.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const data = await response.json();

      if (data.success) {
        onNotification(`User ${user.email} has been permanently deleted from the database.`, 'error');
        // Refresh the user list to remove the deleted user and update count
        if (onRefresh) {
          onRefresh();
        }
      } else {
        throw new Error(data.message || 'Failed to delete user');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  };

  const handleBulkAction = () => {
    if (selectedUsers.length === 0) {
      onNotification('Please select users first', 'warning');
      return;
    }
    setBulkActionDialog(true);
  };

  const executeBulkAction = () => {
    onNotification(`${bulkAction} applied to ${selectedUsers.length} users`, 'success');
    setSelectedUsers([]);
    setBulkActionDialog(false);
    setBulkAction('');
  };

  // Add User Functions
  const handleAddUser = () => {
    setAddUserDialogOpen(true);
    setNewUser({
      email: '',
      password: '',
      panel: '',
      name: '',
      organization: ''
    });
    setAddUserErrors({});
  };

  const handleCloseAddUser = () => {
    setAddUserDialogOpen(false);
    setNewUser({
      email: '',
      password: '',
      panel: '',
      name: '',
      organization: ''
    });
    setAddUserErrors({});
    setShowPassword(false);
  };

  const validateUserForm = () => {
    const errors = {};
    
    if (!newUser.email) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newUser.email)) {
      errors.email = 'Please enter a valid email address';
    }
    
    if (!newUser.password) {
      errors.password = 'Password is required';
    } else if (newUser.password.length < 6) {
      errors.password = 'Password must be at least 6 characters long';
    }
    
    if (!newUser.panel) {
      errors.panel = 'Panel selection is required';
    }
    
    if (!newUser.name) {
      errors.name = 'Name is required';
    }
    
    setAddUserErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreateUser = async () => {
    if (!validateUserForm()) {
      return;
    }

    setAddUserLoading(true);
    try {
      const response = await fetch('http://localhost:8000/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(newUser)
      });

      const data = await response.json();

      if (data.success) {
        onNotification(`User ${newUser.email} created successfully!`, 'success');
        handleCloseAddUser();
        // Refresh data to update user list
        if (onRefresh) {
          onRefresh();
        }
      } else {
        throw new Error(data.message || 'Failed to create user');
      }
    } catch (error) {
      console.error('Error creating user:', error);
      onNotification(`Failed to create user: ${error.message}`, 'error');
    } finally {
      setAddUserLoading(false);
    }
  };

  // Export Users Function
  const handleExportUsers = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/stats/users/detailed', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      const data = await response.json();
      
      if (data.success && data.data.users) {
        const users = data.data.users;
        
        // Create text content
        let textContent = 'BLUECARBON LEDGER - USER DATABASE EXPORT\n';
        textContent += '='.repeat(50) + '\n';
        textContent += `Export Date: ${new Date().toLocaleString()}\n`;
        textContent += `Total Users: ${users.length}\n`;
        textContent += '='.repeat(50) + '\n\n';
        
        users.forEach((user, index) => {
          textContent += `USER ${index + 1}:\n`;
          textContent += `-`.repeat(20) + '\n';
          textContent += `ID: ${user.id}\n`;
          textContent += `Name: ${user.name || 'Not specified'}\n`;
          textContent += `Email: ${user.email}\n`;
          textContent += `Panel/Role: ${user.panel.charAt(0).toUpperCase() + user.panel.slice(1)}\n`;
          textContent += `Organization: ${user.organization || 'Not specified'}\n`;
          textContent += `Status: ${user.isActive ? 'Active' : 'Inactive'}\n`;
          textContent += `Created: ${new Date(user.createdAt).toLocaleString()}\n`;
          textContent += `Last Updated: ${new Date(user.updatedAt).toLocaleString()}\n`;
          textContent += `Last Login: ${user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'Never'}\n`;
          textContent += '\n';
        });
        
        textContent += '='.repeat(50) + '\n';
        textContent += 'END OF EXPORT\n';
        
        // Create and download file
        const blob = new Blob([textContent], { type: 'text/plain' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = `BlueCarbon_Users_Export_${new Date().toISOString().split('T')[0]}.txt`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        onNotification(`User database exported successfully! (${users.length} users)`, 'success');
      } else {
        throw new Error('Failed to fetch user data');
      }
    } catch (error) {
      console.error('Error exporting users:', error);
      onNotification(`Failed to export users: ${error.message}`, 'error');
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'company': return <Business />;
      case 'government': return <AccountBalance />;
      case 'admin': return <AdminPanelSettings />;
      default: return <Person />;
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'company': return blueCarbon.forest;
      case 'government': return blueCarbon.aqua;
      case 'admin': return blueCarbon.oceanBlue;
      default: return '#666';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return '#4caf50';
      case 'suspended': return '#f44336';
      case 'pending': return '#ff9800';
      default: return '#666';
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const paginatedUsers = filteredUsers.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  const isSelected = (id) => selectedUsers.indexOf(id) !== -1;

  return (
    <Box>
      {/* Header and Controls */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h5" sx={{ fontWeight: 600, color: blueCarbon.deepOcean }}>
            User Management ({filteredUsers.length} users)
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={handleAddUser}
              sx={{
                background: blueCarbon.gradients.oceanDepth,
                '&:hover': { background: blueCarbon.gradients.shallowWater }
              }}
            >
              Add User
            </Button>
            <Button
              variant="outlined"
              startIcon={<Download />}
              onClick={handleExportUsers}
              sx={{ borderColor: blueCarbon.oceanBlue, color: blueCarbon.oceanBlue }}
            >
              Export
            </Button>
            <IconButton onClick={onRefresh} disabled={loading}>
              <Refresh />
            </IconButton>
          </Box>
        </Box>

        {/* Search and Filters */}
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />,
              }}
            />
          </Grid>
          <Grid item xs={12} md={2}>
            <FormControl fullWidth>
              <InputLabel>Role</InputLabel>
              <Select
                value={filters.role}
                label="Role"
                onChange={(e) => setFilters({ ...filters, role: e.target.value })}
              >
                <MenuItem value="all">All Roles</MenuItem>
                <MenuItem value="company">Company</MenuItem>
                <MenuItem value="government">Government</MenuItem>
                <MenuItem value="admin">Admin</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={filters.status}
                label="Status"
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              >
                <MenuItem value="all">All Status</MenuItem>
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="suspended">Suspended</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <FormControl fullWidth>
              <InputLabel>Verification</InputLabel>
              <Select
                value={filters.verified}
                label="Verification"
                onChange={(e) => setFilters({ ...filters, verified: e.target.value })}
              >
                <MenuItem value="all">All</MenuItem>
                <MenuItem value="verified">Verified</MenuItem>
                <MenuItem value="unverified">Unverified</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            {selectedUsers.length > 0 && (
              <Button
                fullWidth
                variant="outlined"
                startIcon={<FilterList />}
                onClick={handleBulkAction}
                sx={{ height: '56px' }}
              >
                Bulk Actions ({selectedUsers.length})
              </Button>
            )}
          </Grid>
        </Grid>
      </Box>

      {/* Users Table */}
      <Card>
        <CardContent sx={{ p: 0 }}>
          {loading && <LinearProgress />}
          
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: 'grey.50' }}>
                  <TableCell padding="checkbox">
                    <Checkbox
                      indeterminate={selectedUsers.length > 0 && selectedUsers.length < paginatedUsers.length}
                      checked={paginatedUsers.length > 0 && selectedUsers.length === paginatedUsers.length}
                      onChange={handleSelectAll}
                    />
                  </TableCell>
                  <TableCell><strong>User</strong></TableCell>
                  <TableCell><strong>Role</strong></TableCell>
                  <TableCell><strong>Status</strong></TableCell>
                  <TableCell><strong>Verification</strong></TableCell>
                  <TableCell><strong>Registered</strong></TableCell>
                  <TableCell><strong>Last Login</strong></TableCell>
                  <TableCell><strong>Actions</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedUsers.map((user) => {
                  const isItemSelected = isSelected(user.id);
                  return (
                    <TableRow
                      key={user.id}
                      hover
                      selected={isItemSelected}
                      sx={{ '&:hover': { bgcolor: 'action.hover' } }}
                    >
                      <TableCell padding="checkbox">
                        <Checkbox
                          checked={isItemSelected}
                          onChange={() => handleSelectUser(user.id)}
                        />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Avatar sx={{ bgcolor: getRoleColor(user.role), mr: 2, width: 40, height: 40 }}>
                            {getRoleIcon(user.role)}
                          </Avatar>
                          <Box>
                            <Typography variant="body1" sx={{ fontWeight: 500 }}>
                              {user.name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {user.email}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                          size="small"
                          sx={{
                            bgcolor: `${getRoleColor(user.role)}20`,
                            color: getRoleColor(user.role),
                            fontWeight: 500
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                          size="small"
                          sx={{
                            bgcolor: `${getStatusColor(user.status)}20`,
                            color: getStatusColor(user.status),
                            fontWeight: 500
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          {user.isVerified ? (
                            <CheckCircle sx={{ color: '#4caf50', mr: 1 }} />
                          ) : (
                            <Cancel sx={{ color: '#f44336', mr: 1 }} />
                          )}
                          <Typography variant="body2">
                            {user.isVerified ? 'Verified' : 'Unverified'}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {formatDate(user.registrationDate)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {formatDate(user.lastLogin)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Tooltip title="View Details">
                            <IconButton
                              size="small"
                              onClick={() => {
                                setDetailsUser(user);
                                setUserDetailsOpen(true);
                              }}
                            >
                              <Visibility />
                            </IconButton>
                          </Tooltip>
                          <IconButton
                            size="small"
                            onClick={(e) => handleActionMenu(e, user)}
                          >
                            <MoreVert />
                          </IconButton>
                        </Box>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            rowsPerPageOptions={[5, 10, 25, 50]}
            component="div"
            count={filteredUsers.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={(e, newPage) => setPage(newPage)}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(parseInt(e.target.value, 10));
              setPage(0);
            }}
          />
        </CardContent>
      </Card>

      {/* Action Menu */}
      <Menu
        anchorEl={actionMenuAnchor}
        open={Boolean(actionMenuAnchor)}
        onClose={handleCloseActionMenu}
      >
        <MenuItem onClick={() => handleUserAction('view')}>
          <Visibility sx={{ mr: 1 }} /> View Details
        </MenuItem>
        <MenuItem onClick={() => handleUserAction('edit')}>
          <Edit sx={{ mr: 1 }} /> Edit User
        </MenuItem>
        <MenuItem onClick={() => handleUserAction('suspend')}>
          <Block sx={{ mr: 1 }} /> Suspend
        </MenuItem>
        <MenuItem onClick={() => handleUserAction('activate')}>
          <CheckCircle sx={{ mr: 1 }} /> Activate
        </MenuItem>
        <MenuItem onClick={() => handleUserAction('delete')} sx={{ color: 'error.main' }}>
          <Delete sx={{ mr: 1 }} /> Delete
        </MenuItem>
      </Menu>

      {/* Bulk Action Dialog */}
      <Dialog open={bulkActionDialog} onClose={() => setBulkActionDialog(false)}>
        <DialogTitle>Bulk Action</DialogTitle>
        <DialogContent>
          <Typography sx={{ mb: 2 }}>
            Select an action to apply to {selectedUsers.length} selected users:
          </Typography>
          <FormControl fullWidth>
            <InputLabel>Action</InputLabel>
            <Select
              value={bulkAction}
              label="Action"
              onChange={(e) => setBulkAction(e.target.value)}
            >
              <MenuItem value="suspend">Suspend Users</MenuItem>
              <MenuItem value="activate">Activate Users</MenuItem>
              <MenuItem value="verify">Verify Users</MenuItem>
              <MenuItem value="unverify">Unverify Users</MenuItem>
              <MenuItem value="delete">Delete Users</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBulkActionDialog(false)}>Cancel</Button>
          <Button 
            onClick={executeBulkAction} 
            variant="contained"
            disabled={!bulkAction}
          >
            Apply Action
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add User Dialog */}
      <Dialog 
        open={addUserDialogOpen} 
        onClose={handleCloseAddUser}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 2 }
        }}
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Add sx={{ color: blueCarbon.oceanBlue }} />
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Add New User
            </Typography>
          </Box>
        </DialogTitle>
        
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Grid container spacing={3}>
              {/* Email */}
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Email Address"
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  error={!!addUserErrors.email}
                  helperText={addUserErrors.email}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Email />
                      </InputAdornment>
                    ),
                  }}
                  disabled={addUserLoading}
                />
              </Grid>

              {/* Name */}
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Full Name"
                  value={newUser.name}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                  error={!!addUserErrors.name}
                  helperText={addUserErrors.name}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Person />
                      </InputAdornment>
                    ),
                  }}
                  disabled={addUserLoading}
                />
              </Grid>

              {/* Password */}
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  error={!!addUserErrors.password}
                  helperText={addUserErrors.password}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Lock />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  disabled={addUserLoading}
                />
              </Grid>

              {/* Panel */}
              <Grid item xs={12} md={6}>
                <FormControl fullWidth error={!!addUserErrors.panel}>
                  <InputLabel>Panel/Role</InputLabel>
                  <Select
                    value={newUser.panel}
                    label="Panel/Role"
                    onChange={(e) => setNewUser({ ...newUser, panel: e.target.value })}
                    disabled={addUserLoading}
                  >
                    <MenuItem value="admin">
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <AdminPanelSettings sx={{ color: blueCarbon.oceanBlue }} />
                        Administrator
                      </Box>
                    </MenuItem>
                    <MenuItem value="company">
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Business sx={{ color: blueCarbon.forest }} />
                        Company User
                      </Box>
                    </MenuItem>
                    <MenuItem value="government">
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <AccountBalance sx={{ color: blueCarbon.aqua }} />
                        Government User
                      </Box>
                    </MenuItem>
                  </Select>
                  {addUserErrors.panel && (
                    <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.5 }}>
                      {addUserErrors.panel}
                    </Typography>
                  )}
                </FormControl>
              </Grid>

              {/* Organization */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Organization (Optional)"
                  value={newUser.organization}
                  onChange={(e) => setNewUser({ ...newUser, organization: e.target.value })}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Business />
                      </InputAdornment>
                    ),
                  }}
                  disabled={addUserLoading}
                  helperText="Company name, department, or organization"
                />
              </Grid>

              {/* Role Description */}
              {newUser.panel && (
                <Grid item xs={12}>
                  <Alert 
                    severity="info" 
                    sx={{ 
                      bgcolor: newUser.panel === 'admin' ? `${blueCarbon.oceanBlue}10` : 
                               newUser.panel === 'company' ? `${blueCarbon.forest}10` : `${blueCarbon.aqua}10`,
                      border: `1px solid ${newUser.panel === 'admin' ? `${blueCarbon.oceanBlue}30` : 
                                          newUser.panel === 'company' ? `${blueCarbon.forest}30` : `${blueCarbon.aqua}30`}`
                    }}
                  >
                    <Typography variant="body2">
                      {newUser.panel === 'admin' && 
                        'Administrators have full system access including user management, system settings, and all panels.'
                      }
                      {newUser.panel === 'company' && 
                        'Company users can manage carbon credit projects, trade credits, and upload MRV data.'
                      }
                      {newUser.panel === 'government' && 
                        'Government users have access to regulatory oversight, compliance monitoring, and audit tools.'
                      }
                    </Typography>
                  </Alert>
                </Grid>
              )}
            </Grid>
          </Box>
        </DialogContent>

        <DialogActions sx={{ p: 3, pt: 1 }}>
          <Button 
            onClick={handleCloseAddUser}
            disabled={addUserLoading}
            sx={{ mr: 1 }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleCreateUser}
            variant="contained"
            disabled={addUserLoading}
            sx={{
              background: blueCarbon.gradients.oceanDepth,
              '&:hover': { background: blueCarbon.gradients.shallowWater },
              minWidth: 120
            }}
          >
            {addUserLoading ? (
              <CircularProgress size={20} color="inherit" />
            ) : (
              'Create User'
            )}
          </Button>
        </DialogActions>
      </Dialog>

      {/* User Details Modal */}
      <UserDetailsModal
        open={userDetailsOpen}
        user={detailsUser}
        onClose={() => {
          setUserDetailsOpen(false);
          setDetailsUser(null);
        }}
        onUpdate={(updates) => {
          onNotification('User updated successfully', 'success');
          onRefresh();
        }}
      />
    </Box>
  );
};

export default UserManagementTable;