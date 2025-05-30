import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Alert,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';

function PermissionConfig() {
  const [configs, setConfigs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Dialog states
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState('add'); // 'add', 'edit', 'delete'
  const [currentConfig, setCurrentConfig] = useState({
    id: null,
    type: '',
    label: '',
    maxDuration: 1,
    description: '',
  });
  const [processing, setProcessing] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    fetchPermissionConfigs();
  }, []);

  const fetchPermissionConfigs = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/admin/permission-configs', {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      setConfigs(response.data);
      setError('');
    } catch (err) {
      console.error('Error fetching permission configs:', err);
      setError('Gagal memuat data konfigurasi perijinan');
      setConfigs([]);
    } finally {
      setLoading(false);
    }
  };

  const openAddDialog = () => {
    setDialogType('add');
    setCurrentConfig({
      id: null,
      type: '',
      label: '',
      maxDuration: 1,
      description: '',
    });
    setFormErrors({});
    setDialogOpen(true);
  };

  const openEditDialog = (config) => {
    setDialogType('edit');
    setCurrentConfig({
      id: config.id,
      type: config.type,
      label: config.label,
      maxDuration: config.maxDuration,
      description: config.description || '',
    });
    setFormErrors({});
    setDialogOpen(true);
  };

  const openDeleteDialog = (config) => {
    setDialogType('delete');
    setCurrentConfig(config);
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentConfig({
      ...currentConfig,
      [name]: name === 'maxDuration' ? parseInt(value, 10) || 1 : value,
    });
    
    // Clear error for this field
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: '',
      });
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (!currentConfig.type) {
      errors.type = 'Tipe perijinan harus diisi';
    } else if (!/^[a-z_]+$/.test(currentConfig.type)) {
      errors.type = 'Tipe hanya boleh berisi huruf kecil dan underscore';
    }
    
    if (!currentConfig.label) {
      errors.label = 'Label perijinan harus diisi';
    }
    
    if (!currentConfig.maxDuration || currentConfig.maxDuration < 1) {
      errors.maxDuration = 'Durasi maksimal harus lebih dari 0';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAddConfig = async () => {
    if (!validateForm()) return;
    
    try {
      setProcessing(true);
      const token = localStorage.getItem('token');
      
      await axios.post(
        '/api/admin/permission-configs',
        currentConfig,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Refresh the list
      fetchPermissionConfigs();
      closeDialog();
    } catch (err) {
      console.error('Error adding permission config:', err);
      setError('Gagal menambahkan konfigurasi perijinan');
    } finally {
      setProcessing(false);
    }
  };

  const handleEditConfig = async () => {
    if (!validateForm()) return;
    
    try {
      setProcessing(true);
      const token = localStorage.getItem('token');
      
      await axios.put(
        `/api/admin/permission-configs/${currentConfig.id}`,
        currentConfig,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Refresh the list
      fetchPermissionConfigs();
      closeDialog();
    } catch (err) {
      console.error('Error updating permission config:', err);
      setError('Gagal memperbarui konfigurasi perijinan');
    } finally {
      setProcessing(false);
    }
  };

  const handleDeleteConfig = async () => {
    try {
      setProcessing(true);
      const token = localStorage.getItem('token');
      
      await axios.delete(`/api/admin/permission-configs/${currentConfig.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      // Refresh the list
      fetchPermissionConfigs();
      closeDialog();
    } catch (err) {
      console.error('Error deleting permission config:', err);
      setError('Gagal menghapus konfigurasi perijinan');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <Box sx={{ py: 2 }}>
      <Grid container spacing={2} alignItems="center" sx={{ mb: 3 }}>
        <Grid item xs>
          <Typography variant="h4" component="h1">
            Konfigurasi Perijinan
          </Typography>
        </Grid>
        <Grid item>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={openAddDialog}
          >
            Tambah Konfigurasi
          </Button>
        </Grid>
      </Grid>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : configs.length > 0 ? (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Tipe</TableCell>
                  <TableCell>Label</TableCell>
                  <TableCell>Durasi Maksimal (hari)</TableCell>
                  <TableCell>Deskripsi</TableCell>
                  <TableCell align="center">Aksi</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {configs.map((config) => (
                  <TableRow key={config.id}>
                    <TableCell>{config.type}</TableCell>
                    <TableCell>{config.label}</TableCell>
                    <TableCell>{config.maxDuration}</TableCell>
                    <TableCell>{config.description || '-'}</TableCell>
                    <TableCell align="center">
                      <IconButton 
                        color="primary" 
                        onClick={() => openEditDialog(config)}
                        size="small"
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton 
                        color="error" 
                        onClick={() => openDeleteDialog(config)}
                        size="small"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="body1" color="textSecondary">
              Tidak ada konfigurasi perijinan
            </Typography>
          </Box>
        )}
      </Paper>

      {/* Add/Edit Dialog */}
      <Dialog 
        open={dialogOpen && (dialogType === 'add' || dialogType === 'edit')} 
        onClose={closeDialog} 
        maxWidth="sm" 
        fullWidth
      >
        <DialogTitle>
          {dialogType === 'add' ? 'Tambah Konfigurasi Perijinan' : 'Edit Konfigurasi Perijinan'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                name="type"
                label="Tipe Perijinan"
                value={currentConfig.type}
                onChange={handleInputChange}
                fullWidth
                required
                error={!!formErrors.type}
                helperText={formErrors.type || 'Contoh: cuti, short_leave'}
                disabled={dialogType === 'edit'} // Can't change type when editing
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                name="label"
                label="Label Perijinan"
                value={currentConfig.label}
                onChange={handleInputChange}
                fullWidth
                required
                error={!!formErrors.label}
                helperText={formErrors.label || 'Contoh: Cuti, Izin Keluar'}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                name="maxDuration"
                label="Durasi Maksimal (hari)"
                type="number"
                value={currentConfig.maxDuration}
                onChange={handleInputChange}
                fullWidth
                required
                inputProps={{ min: 1 }}
                error={!!formErrors.maxDuration}
                helperText={formErrors.maxDuration}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                name="description"
                label="Deskripsi (opsional)"
                value={currentConfig.description}
                onChange={handleInputChange}
                fullWidth
                multiline
                rows={3}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDialog} disabled={processing}>
            Batal
          </Button>
          <Button 
            onClick={dialogType === 'add' ? handleAddConfig : handleEditConfig} 
            variant="contained"
            disabled={processing}
          >
            {processing ? <CircularProgress size={24} /> : 
              dialogType === 'add' ? 'Tambah' : 'Simpan'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog 
        open={dialogOpen && dialogType === 'delete'} 
        onClose={closeDialog}
      >
        <DialogTitle>Hapus Konfigurasi Perijinan</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Apakah Anda yakin ingin menghapus konfigurasi perijinan <strong>{currentConfig.label}</strong> ({currentConfig.type})?
            Tindakan ini tidak dapat dibatalkan dan mungkin mempengaruhi perijinan yang sudah ada.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDialog} disabled={processing}>
            Batal
          </Button>
          <Button 
            onClick={handleDeleteConfig} 
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

export default PermissionConfig;