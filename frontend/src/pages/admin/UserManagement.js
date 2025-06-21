import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControl,
  FormHelperText,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Typography,
  Alert,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Lock as LockIcon,
  LockOpen as LockOpenIcon,
} from '@mui/icons-material';

function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  
  // Dialog states
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState('add'); // 'add', 'edit', 'delete', 'resetPassword'
  const [currentUser, setCurrentUser] = useState({
    id: null,
    name: '',
    email: '',
    department: '',
    position: '',
    role: 'user',
    password: '',
    confirmPassword: '',
  });
  const [processing, setProcessing] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    fetchUsers();
  }, [page, rowsPerPage]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/admin/users', {
        params: {
          page: page + 1, // API uses 1-based indexing
          limit: rowsPerPage,
        },
      });
      
      setUsers(response.data.users || response.data);
      setTotalCount(response.data.totalCount || response.data.length);
      setError('');
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Gagal memuat data pengguna');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const openAddDialog = () => {
    setDialogType('add');
    setCurrentUser({
      id: null,
      name: '',
      email: '',
      department: '',
      position: '',
      role: 'user',
      password: '',
      confirmPassword: '',
    });
    setFormErrors({});
    setDialogOpen(true);
  };

  const openEditDialog = (user) => {
    setDialogType('edit');
    setCurrentUser({
      id: user.id,
      name: user.name,
      email: user.email,
      department: user.department || '',
      position: user.position || '',
      role: user.role,
      password: '',
      confirmPassword: '',
    });
    setFormErrors({});
    setDialogOpen(true);
  };

  const openDeleteDialog = (user) => {
    setDialogType('delete');
    setCurrentUser(user);
    setDialogOpen(true);
  };

  const openResetPasswordDialog = (user) => {
    setDialogType('resetPassword');
    setCurrentUser({
      ...user,
      password: '',
      confirmPassword: '',
    });
    setFormErrors({});
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentUser({
      ...currentUser,
      [name]: value,
    });
    
    // Clear error for this field
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: '',
      });
    }
  };

  const validateForm = (isPasswordReset = false) => {
    const errors = {};
    
    if (!isPasswordReset) {
      if (!currentUser.name) {
        errors.name = 'Nama harus diisi';
      }
      
      if (!currentUser.email) {
        errors.email = 'Email harus diisi';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(currentUser.email)) {
        errors.email = 'Format email tidak valid';
      }
    }
    
    if (dialogType === 'add' || isPasswordReset) {
      if (!currentUser.password) {
        errors.password = 'Password harus diisi';
      } else if (currentUser.password.length < 6) {
        errors.password = 'Password minimal 6 karakter';
      }
      
      if (!currentUser.confirmPassword) {
        errors.confirmPassword = 'Konfirmasi password harus diisi';
      } else if (currentUser.password !== currentUser.confirmPassword) {
        errors.confirmPassword = 'Password dan konfirmasi password tidak sama';
      }
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAddUser = async () => {
    if (!validateForm()) return;
    
    try {
      setProcessing(true);
      await api.post(
        '/api/admin/users',
        {
          name: currentUser.name,
          email: currentUser.email,
          department: currentUser.department,
          position: currentUser.position,
          role: currentUser.role,
          password: currentUser.password,
        }
      );
      
      // Refresh the list
      fetchUsers();
      closeDialog();
    } catch (err) {
      console.error('Error adding user:', err);
      setError('Gagal menambahkan pengguna');
      
      // Check for specific error messages from the server
      if (err.response && err.response.data && err.response.data.message) {
        if (err.response.data.message.includes('email')) {
          setFormErrors({
            ...formErrors,
            email: 'Email sudah digunakan',
          });
        }
      }
    } finally {
      setProcessing(false);
    }
  };

  const handleEditUser = async () => {
    if (!validateForm(false)) return;
    
    try {
      setProcessing(true);
      await api.put(
        `/api/admin/users/${currentUser.id}`,
        {
          name: currentUser.name,
          email: currentUser.email,
          department: currentUser.department,
          position: currentUser.position,
          role: currentUser.role,
        }
      );
      
      // Refresh the list
      fetchUsers();
      closeDialog();
    } catch (err) {
      console.error('Error updating user:', err);
      setError('Gagal memperbarui pengguna');
      
      // Check for specific error messages from the server
      if (err.response && err.response.data && err.response.data.message) {
        if (err.response.data.message.includes('email')) {
          setFormErrors({
            ...formErrors,
            email: 'Email sudah digunakan',
          });
        }
      }
    } finally {
      setProcessing(false);
    }
  };

  const handleDeleteUser = async () => {
    try {
      setProcessing(true);
      await api.delete(`/api/admin/users/${currentUser.id}`);
      
      // Refresh the list
      fetchUsers();
      closeDialog();
    } catch (err) {
      console.error('Error deleting user:', err);
      setError('Gagal menghapus pengguna');
    } finally {
      setProcessing(false);
    }
  };

  const handleResetPassword = async () => {
    if (!validateForm(true)) return;
    
    try {
      setProcessing(true);
      await api.put(
        `/api/admin/users/${currentUser.id}/reset-password`,
        { password: currentUser.password }
      );
      
      closeDialog();
    } catch (err) {
      console.error('Error resetting password:', err);
      setError('Gagal mereset password');
    } finally {
      setProcessing(false);
    }
  };

  const handleToggleActive = async (userId, isActive) => {
    try {
      await api.put(
        `/api/admin/users/${userId}/${isActive ? 'deactivate' : 'activate'}`,
        {}
      );
      
      // Refresh the list
      fetchUsers();
    } catch (err) {
      console.error(`Error ${isActive ? 'deactivating' : 'activating'} user:`, err);
      setError(`Gagal ${isActive ? 'menonaktifkan' : 'mengaktifkan'} pengguna`);
    }
  };

  const getRoleLabel = (role) => {
    switch (role) {
      case 'admin':
        return 'Administrator';
      case 'hrd':
        return 'HRD';
      case 'approval':
        return 'Approval';
      case 'user':
        return 'User';
      default:
        return role;
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin':
        return 'error';
      case 'hrd':
        return 'warning';
      case 'approval':
        return 'info';
      case 'user':
        return 'default';
      default:
        return 'default';
    }
  };

  return (
    <Box sx={{ py: 2 }}>
      <Grid container spacing={2} alignItems="center" sx={{ mb: 3 }}>
        <Grid item xs>
          <Typography variant="h4" component="h1">
            Manajemen Pengguna
          </Typography>
        </Grid>
        <Grid item>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={openAddDialog}
          >
            Tambah Pengguna
          </Button>
        </Grid>
      </Grid>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : users.length > 0 ? (
          <>
            <TableContainer sx={{ maxHeight: 440 }}>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell>Nama</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Departemen</TableCell>
                    <TableCell>Jabatan</TableCell>
                    <TableCell>Peran</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="center">Aksi</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.department || '-'}</TableCell>
                      <TableCell>{user.position || '-'}</TableCell>
                      <TableCell>
                        <Chip 
                          label={getRoleLabel(user.role)} 
                          color={getRoleColor(user.role)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={user.isActive ? 'Aktif' : 'Nonaktif'} 
                          color={user.isActive ? 'success' : 'default'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="center">
                        <IconButton 
                          color="primary" 
                          onClick={() => openEditDialog(user)}
                          size="small"
                          title="Edit"
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton 
                          color="secondary" 
                          onClick={() => openResetPasswordDialog(user)}
                          size="small"
                          title="Reset Password"
                        >
                          <LockIcon />
                        </IconButton>
                        <IconButton 
                          color={user.isActive ? 'default' : 'success'} 
                          onClick={() => handleToggleActive(user.id, user.isActive)}
                          size="small"
                          title={user.isActive ? 'Nonaktifkan' : 'Aktifkan'}
                        >
                          {user.isActive ? <LockIcon /> : <LockOpenIcon />}
                        </IconButton>
                        <IconButton 
                          color="error" 
                          onClick={() => openDeleteDialog(user)}
                          size="small"
                          title="Hapus"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={totalCount}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </>
        ) : (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="body1" color="textSecondary">
              Tidak ada data pengguna
            </Typography>
          </Box>
        )}
      </Paper>

      {/* Add/Edit Dialog */}
      <Dialog 
        open={dialogOpen && (dialogType === 'add' || dialogType === 'edit')} 
        onClose={closeDialog} 
        maxWidth="md" 
        fullWidth
      >
        <DialogTitle>
          {dialogType === 'add' ? 'Tambah Pengguna' : 'Edit Pengguna'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                name="name"
                label="Nama"
                value={currentUser.name}
                onChange={handleInputChange}
                fullWidth
                required
                error={!!formErrors.name}
                helperText={formErrors.name}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                name="email"
                label="Email"
                type="email"
                value={currentUser.email}
                onChange={handleInputChange}
                fullWidth
                required
                error={!!formErrors.email}
                helperText={formErrors.email}
                disabled={dialogType === 'edit'} // Can't change email when editing
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                name="department"
                label="Departemen"
                value={currentUser.department}
                onChange={handleInputChange}
                fullWidth
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                name="position"
                label="Jabatan"
                value={currentUser.position}
                onChange={handleInputChange}
                fullWidth
              />
            </Grid>
            
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Peran</InputLabel>
                <Select
                  name="role"
                  value={currentUser.role}
                  onChange={handleInputChange}
                  label="Peran"
                >
                  <MenuItem value="user">User</MenuItem>
                  <MenuItem value="approval">Approval</MenuItem>
                  <MenuItem value="hrd">HRD</MenuItem>
                  <MenuItem value="admin">Administrator</MenuItem>
                </Select>
                <FormHelperText>
                  Peran menentukan hak akses pengguna dalam sistem
                </FormHelperText>
              </FormControl>
            </Grid>
            
            {dialogType === 'add' && (
              <>
                <Grid item xs={12} sm={6}>
                  <TextField
                    name="password"
                    label="Password"
                    type="password"
                    value={currentUser.password}
                    onChange={handleInputChange}
                    fullWidth
                    required
                    error={!!formErrors.password}
                    helperText={formErrors.password}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    name="confirmPassword"
                    label="Konfirmasi Password"
                    type="password"
                    value={currentUser.confirmPassword}
                    onChange={handleInputChange}
                    fullWidth
                    required
                    error={!!formErrors.confirmPassword}
                    helperText={formErrors.confirmPassword}
                  />
                </Grid>
              </>
            )}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDialog} disabled={processing}>
            Batal
          </Button>
          <Button 
            onClick={dialogType === 'add' ? handleAddUser : handleEditUser} 
            variant="contained"
            disabled={processing}
          >
            {processing ? <CircularProgress size={24} /> : 
              dialogType === 'add' ? 'Tambah' : 'Simpan'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Reset Password Dialog */}
      <Dialog 
        open={dialogOpen && dialogType === 'resetPassword'} 
        onClose={closeDialog} 
        maxWidth="sm" 
        fullWidth
      >
        <DialogTitle>Reset Password</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Anda akan mereset password untuk pengguna <strong>{currentUser.name}</strong> ({currentUser.email}).
          </DialogContentText>
          
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                name="password"
                label="Password Baru"
                type="password"
                value={currentUser.password}
                onChange={handleInputChange}
                fullWidth
                required
                error={!!formErrors.password}
                helperText={formErrors.password}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                name="confirmPassword"
                label="Konfirmasi Password Baru"
                type="password"
                value={currentUser.confirmPassword}
                onChange={handleInputChange}
                fullWidth
                required
                error={!!formErrors.confirmPassword}
                helperText={formErrors.confirmPassword}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDialog} disabled={processing}>
            Batal
          </Button>
          <Button 
            onClick={handleResetPassword} 
            color="primary"
            variant="contained"
            disabled={processing}
          >
            {processing ? <CircularProgress size={24} /> : 'Reset Password'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog 
        open={dialogOpen && dialogType === 'delete'} 
        onClose={closeDialog}
      >
        <DialogTitle>Hapus Pengguna</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Apakah Anda yakin ingin menghapus pengguna <strong>{currentUser.name}</strong> ({currentUser.email})?
            Tindakan ini tidak dapat dibatalkan dan akan menghapus semua data terkait pengguna ini.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDialog} disabled={processing}>
            Batal
          </Button>
          <Button 
            onClick={handleDeleteUser} 
            color="error"
            variant="contained"
            disabled={processing}
          >
            {processing ? <CircularProgress size={24} /> : 'Hapus'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default UserManagement;