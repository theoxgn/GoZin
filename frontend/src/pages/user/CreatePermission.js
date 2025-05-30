import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  CircularProgress,
  Divider,
  FormControl,
  FormHelperText,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
  Alert,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import idLocale from 'date-fns/locale/id';
import { differenceInDays, addDays } from 'date-fns';

function CreatePermission() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    type: '',
    startDate: null,
    endDate: null,
    reason: '',
  });
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [permissionConfigs, setPermissionConfigs] = useState([]);
  const [selectedConfig, setSelectedConfig] = useState(null);

  useEffect(() => {
    fetchPermissionConfigs();
  }, []);

  useEffect(() => {
    if (formData.type && permissionConfigs.length > 0) {
      const config = permissionConfigs.find(c => c.type === formData.type);
      setSelectedConfig(config);
      
      // Auto-set end date based on start date and max duration
      if (formData.startDate && config) {
        const maxDays = config.maxDuration;
        const newEndDate = addDays(new Date(formData.startDate), maxDays - 1);
        setFormData(prev => ({ ...prev, endDate: newEndDate }));
      }
    }
  }, [formData.type, formData.startDate, permissionConfigs]);

  const fetchPermissionConfigs = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/admin/permission-configs', {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log('Permission configs loaded:', response.data); // Debug log
      setPermissionConfigs(response.data);
    } catch (err) {
      console.error('Error fetching permission configs:', err);
      setError('Gagal memuat konfigurasi perijinan');
      // Fallback data jika API gagal
      setPermissionConfigs([
        { type: 'short_leave', label: 'Izin Keluar', maxDuration: 1, description: 'Izin keluar sementara' },
        { type: 'cuti', label: 'Cuti', maxDuration: 30, description: 'Cuti tahunan' },
        { type: 'visit', label: 'Kunjungan', maxDuration: 1, description: 'Kunjungan dinas' },
        { type: 'dinas', label: 'Dinas', maxDuration: 7, description: 'Perjalanan dinas' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleDateChange = (field, date) => {
    setFormData({
      ...formData,
      [field]: date,
    });
  };

  const validateForm = () => {
    if (!formData.type) {
      setError('Tipe perijinan harus dipilih');
      return false;
    }
    if (!formData.startDate) {
      setError('Tanggal mulai harus diisi');
      return false;
    }
    if (!formData.endDate) {
      setError('Tanggal selesai harus diisi');
      return false;
    }
    if (!formData.reason) {
      setError('Alasan harus diisi');
      return false;
    }

    // Check if end date is after start date
    if (new Date(formData.endDate) < new Date(formData.startDate)) {
      setError('Tanggal selesai harus setelah tanggal mulai');
      return false;
    }

    // Check max duration if config is available
    if (selectedConfig) {
      const duration = differenceInDays(
        new Date(formData.endDate),
        new Date(formData.startDate)
      ) + 1; // Include both start and end days
      
      if (duration > selectedConfig.maxDuration) {
        setError(`Durasi maksimal untuk ${getPermissionTypeLabel(formData.type)} adalah ${selectedConfig.maxDuration} hari`);
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) {
      return;
    }

    try {
      setSubmitting(true);
      const token = localStorage.getItem('token');
      
      // Format dates to ISO string (YYYY-MM-DD)
      const formattedData = {
        ...formData,
        startDate: formData.startDate.toISOString().split('T')[0],
        endDate: formData.endDate.toISOString().split('T')[0],
      };
      
      const response = await axios.post('/api/permissions', formattedData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      // Redirect to permission details page
      navigate(`/permissions/${response.data.id}`);
    } catch (err) {
      console.error('Error creating permission:', err);
      const errorMessage = err.response?.data?.message || 'Gagal membuat perijinan. Silakan coba lagi.';
      setError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const getPermissionTypeLabel = (type) => {
    switch (type) {
      case 'short_leave':
        return 'Izin Keluar';
      case 'cuti':
        return 'Cuti';
      case 'visit':
        return 'Kunjungan';
      case 'dinas':
        return 'Dinas';
      default:
        return type;
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ py: 2 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Buat Perijinan Baru
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Card>
        <CardHeader title="Form Perijinan" />
        <Divider />
        <CardContent>
          <form onSubmit={handleSubmit} className="permission-form">
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <FormControl fullWidth required>
                  <InputLabel>Tipe Perijinan</InputLabel>
                  <Select
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    label="Tipe Perijinan"
                    disabled={submitting}
                  >
                    {permissionConfigs.map((config) => (
                      <MenuItem key={config.type} value={config.type}>
                        {config.label || getPermissionTypeLabel(config.type)}
                      </MenuItem>
                    ))}
                  </Select>
                  {selectedConfig && (
                    <FormHelperText>
                      Maksimal {selectedConfig.maxDuration} hari
                      {selectedConfig.description && ` - ${selectedConfig.description}`}
                    </FormHelperText>
                  )}
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={idLocale}>
                  <DatePicker
                    label="Tanggal Mulai"
                    value={formData.startDate}
                    onChange={(date) => handleDateChange('startDate', date)}
                    renderInput={(params) => (
                      <TextField {...params} fullWidth required disabled={submitting} />
                    )}
                    disablePast
                  />
                </LocalizationProvider>
              </Grid>

              <Grid item xs={12} sm={6}>
                <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={idLocale}>
                  <DatePicker
                    label="Tanggal Selesai"
                    value={formData.endDate}
                    onChange={(date) => handleDateChange('endDate', date)}
                    renderInput={(params) => (
                      <TextField {...params} fullWidth required disabled={submitting} />
                    )}
                    disablePast
                    minDate={formData.startDate}
                    maxDate={
                      formData.startDate && selectedConfig
                        ? addDays(new Date(formData.startDate), selectedConfig.maxDuration - 1)
                        : undefined
                    }
                  />
                </LocalizationProvider>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  name="reason"
                  label="Alasan"
                  multiline
                  rows={4}
                  value={formData.reason}
                  onChange={handleChange}
                  fullWidth
                  required
                  disabled={submitting}
                  placeholder="Jelaskan alasan perijinan Anda"
                />
              </Grid>

              {selectedConfig && (
                <Grid item xs={12}>
                  <Alert severity="info">
                    <Typography variant="body2">
                      <strong>Informasi:</strong> Maksimal durasi {selectedConfig.maxDuration} hari.
                      {selectedConfig.description && ` ${selectedConfig.description}`}
                    </Typography>
                  </Alert>
                </Grid>
              )}

              <Grid item xs={12} sx={{ mt: 2 }}>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={submitting}
                  fullWidth
                >
                  {submitting ? <CircularProgress size={24} /> : 'Ajukan Perijinan'}
                </Button>
              </Grid>
            </Grid>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
}

export default CreatePermission;