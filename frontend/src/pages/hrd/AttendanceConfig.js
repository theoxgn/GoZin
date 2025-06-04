import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControlLabel,
  Switch,
  Grid,
  IconButton,
  Alert,
  Snackbar,
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import axios from 'axios';

function AttendanceConfig() {
  const [configs, setConfigs] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingConfig, setEditingConfig] = useState(null);
  const [formData, setFormData] = useState({
    workStartTime: '08:00',
    workEndTime: '17:00',
    lateThreshold: 15,
    locationRequired: true,
    photoRequired: true,
    maxDistanceMeters: 100,
    workingDays: [1, 2, 3, 4, 5],
    departmentId: '',
    isActive: true,
    officeLocations: [],
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });

  useEffect(() => {
    fetchConfigs();
  }, []);

  const fetchConfigs = async () => {

    const token = localStorage.getItem('token');
    try {
      const response = await axios.get('/api/attendance-config', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setConfigs(response.data.configs);
    } catch (error) {
      console.error('Error fetching configs:', error);
      showSnackbar('Gagal memuat konfigurasi absensi', 'error');
    }
  };

  const handleOpenDialog = (config = null) => {
    if (config) {
      setEditingConfig(config);
      setFormData({
        ...config,
        workStartTime: config.workStartTime.slice(0, 5),
        workEndTime: config.workEndTime.slice(0, 5),
      });
    } else {
      setEditingConfig(null);
      setFormData({
        workStartTime: '08:00',
        workEndTime: '17:00',
        lateThreshold: 15,
        locationRequired: true,
        photoRequired: true,
        maxDistanceMeters: 100,
        workingDays: [1, 2, 3, 4, 5],
        departmentId: '',
        isActive: true,
        officeLocations: [],
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingConfig(null);
  };

  const handleInputChange = (e) => {
    const { name, value, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: e.target.type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    try {
      if (editingConfig) {
        await axios.put(`/api/attendance-config/${editingConfig.id}`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        showSnackbar('Konfigurasi absensi berhasil diperbarui');
      } else {
        await axios.post('/api/attendance-config', formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        showSnackbar('Konfigurasi absensi berhasil dibuat');
      }
      handleCloseDialog();
      fetchConfigs();
    } catch (error) {
      console.error('Error saving config:', error);
      showSnackbar(error.response?.data?.message || 'Terjadi kesalahan', 'error');
    }
  };

  const handleDelete = async (id) => {

    const token = localStorage.getItem('token');
    if (window.confirm('Apakah Anda yakin ingin menghapus konfigurasi ini?')) {
      try {
        await axios.delete(`/api/attendance-config/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        showSnackbar('Konfigurasi absensi berhasil dihapus');
        fetchConfigs();
      } catch (error) {
        console.error('Error deleting config:', error);
        showSnackbar('Gagal menghapus konfigurasi absensi', 'error');
      }
    }
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({
      open: true,
      message,
      severity,
    });
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Konfigurasi Absensi
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => handleOpenDialog()}
        >
          Tambah Konfigurasi
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Departemen</TableCell>
              <TableCell>Jam Mulai</TableCell>
              <TableCell>Jam Selesai</TableCell>
              <TableCell>Batas Keterlambatan</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Aksi</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {configs.map((config) => (
              <TableRow key={config.id}>
                <TableCell>{config.departmentId || 'Semua Departemen'}</TableCell>
                <TableCell>{config.workStartTime}</TableCell>
                <TableCell>{config.workEndTime}</TableCell>
                <TableCell>{config.lateThreshold} menit</TableCell>
                <TableCell>
                  {config.isActive ? 'Aktif' : 'Nonaktif'}
                </TableCell>
                <TableCell>
                  <IconButton
                    color="primary"
                    onClick={() => handleOpenDialog(config)}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    color="error"
                    onClick={() => handleDelete(config.id)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingConfig ? 'Edit Konfigurasi Absensi' : 'Tambah Konfigurasi Absensi'}
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Departemen"
                  name="departmentId"
                  value={formData.departmentId}
                  onChange={handleInputChange}
                  helperText="Kosongkan untuk konfigurasi default"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Batas Keterlambatan (menit)"
                  name="lateThreshold"
                  type="number"
                  value={formData.lateThreshold}
                  onChange={handleInputChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Jam Mulai"
                  name="workStartTime"
                  type="time"
                  value={formData.workStartTime}
                  onChange={handleInputChange}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Jam Selesai"
                  name="workEndTime"
                  type="time"
                  value={formData.workEndTime}
                  onChange={handleInputChange}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Jarak Maksimum (meter)"
                  name="maxDistanceMeters"
                  type="number"
                  value={formData.maxDistanceMeters}
                  onChange={handleInputChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.locationRequired}
                      onChange={handleInputChange}
                      name="locationRequired"
                    />
                  }
                  label="Wajib Lokasi"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.photoRequired}
                      onChange={handleInputChange}
                      name="photoRequired"
                    />
                  }
                  label="Wajib Foto"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.isActive}
                      onChange={handleInputChange}
                      name="isActive"
                    />
                  }
                  label="Aktif"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Lokasi Kantor (JSON array)"
                  name="officeLocations"
                  value={JSON.stringify(formData.officeLocations)}
                  onChange={(e) => {
                    try {
                      const parsedValue = JSON.parse(e.target.value);
                      if (Array.isArray(parsedValue)) {
                        setFormData(prev => ({
                          ...prev,
                          officeLocations: parsedValue
                        }));
                      }
                    } catch (error) {
                      // Invalid JSON, ignore
                    }
                  }}
                  helperText="Masukkan array JSON lokasi kantor, contoh: [{'name': 'Kantor Pusat', 'latitude': -6.123456, 'longitude': 106.123456}]"
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Batal</Button>
            <Button type="submit" variant="contained" color="primary">
              {editingConfig ? 'Simpan' : 'Tambah'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}

export default AttendanceConfig; 