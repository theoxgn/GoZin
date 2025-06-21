import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Divider,
  Grid,
  TextField,
  Typography,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  FormHelperText,
  Alert,
  Snackbar,
  CircularProgress,
  Paper,
  Stepper,
  Step,
  StepLabel,
  IconButton,
  InputAdornment,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { id } from 'date-fns/locale';
import { format, isAfter, isBefore, addDays } from 'date-fns';
import {
  Save as SaveIcon,
  ArrowBack as ArrowBackIcon,
  ArrowForward as ArrowForwardIcon,
  CalendarToday as CalendarTodayIcon,
  AccessTime as AccessTimeIcon,
  Description as DescriptionIcon,
  Category as CategoryIcon,
  Check as CheckIcon,
} from '@mui/icons-material';

function CreatePermission() {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [permissionTypes, setPermissionTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    type: '',
    startDate: null,
    endDate: null,
    startTime: null,
    endTime: null,
    reason: '',
  });
  
  const [formErrors, setFormErrors] = useState({
    type: '',
    startDate: '',
    endDate: '',
    startTime: '',
    endTime: '',
    reason: '',
  });

  useEffect(() => {
    fetchPermissionTypes();
  }, []);

  const fetchPermissionTypes = async () => {
    try {
      setLoading(true);
      console.log('Fetching permission types...');
      const response = await api.get('/api/admin/permission-configs');
      console.log('Permission types response:', response.data);
      setPermissionTypes(response.data.configs || response.data);
    } catch (err) {
      console.error('Error fetching permission types:', err);
      setError('Gagal memuat tipe perijinan');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData({
      ...formData,
      [field]: value,
    });
    
    // Clear error when field is changed
    if (formErrors[field]) {
      setFormErrors({
        ...formErrors,
        [field]: '',
      });
    }
  };

  const validateForm = () => {
    const errors = {};
    let isValid = true;

    if (!formData.type) {
      errors.type = 'Tipe perijinan harus dipilih';
      isValid = false;
    }

    if (!formData.startDate) {
      errors.startDate = 'Tanggal mulai harus diisi';
      isValid = false;
    }

    if (!formData.endDate) {
      errors.endDate = 'Tanggal selesai harus diisi';
      isValid = false;
    } else if (formData.startDate && isAfter(formData.startDate, formData.endDate)) {
      errors.endDate = 'Tanggal selesai harus setelah tanggal mulai';
      isValid = false;
    }
    
    // Validate time if permission type is short_leave
    if (formData.type === 'short_leave') {
      if (!formData.startTime) {
        errors.startTime = 'Waktu mulai harus diisi';
        isValid = false;
      }
      
      if (!formData.endTime) {
        errors.endTime = 'Waktu selesai harus diisi';
        isValid = false;
      } else if (formData.startTime && formData.endTime && 
                formData.startDate && formData.endDate && 
                formData.startDate.getTime() === formData.endDate.getTime() && 
                formData.startTime.getTime() >= formData.endTime.getTime()) {
        errors.endTime = 'Waktu selesai harus setelah waktu mulai';
        isValid = false;
      }
    }

    if (!formData.reason || formData.reason.trim() === '') {
      errors.reason = 'Alasan harus diisi';
      isValid = false;
    } else if (formData.reason.length < 10) {
      errors.reason = 'Alasan minimal 10 karakter';
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      setSubmitLoading(true);
      setError('');
      
      const token = localStorage.getItem('token');
      
      // Format data for API
      const permissionData = {
        type: formData.type,
        startDate: format(formData.startDate, 'yyyy-MM-dd'),
        endDate: format(formData.endDate, 'yyyy-MM-dd'),
        reason: formData.reason,
      };
      
      // Add time for short_leave type
      if (formData.type === 'short_leave' && formData.startTime && formData.endTime) {
        permissionData.startTime = format(formData.startTime, 'HH:mm');
        permissionData.endTime = format(formData.endTime, 'HH:mm');
      }
      
      await api.post('/api/permissions', permissionData);
      
      setSuccess(true);
      
      // Redirect after 2 seconds
      setTimeout(() => {
        navigate('/permissions');
      }, 2000);
      
    } catch (err) {
      console.error('Error creating permission:', err);
      setError(err.response?.data?.message || 'Gagal membuat perijinan');
    } finally {
      setSubmitLoading(false);
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
  
  const handleNext = () => {
    if (activeStep === 0) {
      // Validate first step
      const errors = {};
      let isValid = true;
      
      if (!formData.type) {
        errors.type = 'Tipe perijinan harus dipilih';
        isValid = false;
      }
      
      setFormErrors({...formErrors, ...errors});
      
      if (!isValid) return;
    } else if (activeStep === 1) {
      // Validate second step
      const errors = {};
      let isValid = true;
      
      if (!formData.startDate) {
        errors.startDate = 'Tanggal mulai harus diisi';
        isValid = false;
      }

      if (!formData.endDate) {
        errors.endDate = 'Tanggal selesai harus diisi';
        isValid = false;
      } else if (formData.startDate && isAfter(formData.startDate, formData.endDate)) {
        errors.endDate = 'Tanggal selesai harus setelah tanggal mulai';
        isValid = false;
      }
      
      // Validate time if permission type is short_leave
      if (formData.type === 'short_leave') {
        if (!formData.startTime) {
          errors.startTime = 'Waktu mulai harus diisi';
          isValid = false;
        }
        
        if (!formData.endTime) {
          errors.endTime = 'Waktu selesai harus diisi';
          isValid = false;
        } else if (formData.startTime && formData.endTime && 
                  formData.startDate && formData.endDate && 
                  formData.startDate.getTime() === formData.endDate.getTime() && 
                  formData.startTime.getTime() >= formData.endTime.getTime()) {
          errors.endTime = 'Waktu selesai harus setelah waktu mulai';
          isValid = false;
        }
      }
      
      setFormErrors({...formErrors, ...errors});
      
      if (!isValid) return;
    }
    
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };
  
  const steps = ['Pilih Tipe Perijinan', 'Tentukan Waktu', 'Berikan Alasan'];
  
  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Box sx={{ mt: 3 }}>
            <FormControl fullWidth error={!!formErrors.type}>
              <InputLabel id="permission-type-label">Tipe Perijinan</InputLabel>
              <Select
                labelId="permission-type-label"
                value={formData.type}
                onChange={(e) => handleChange('type', e.target.value)}
                label="Tipe Perijinan"
                startAdornment={
                  <InputAdornment position="start">
                    <CategoryIcon color="action" />
                  </InputAdornment>
                }
              >
                {permissionTypes.map((type) => (
                  <MenuItem key={type.id} value={type.permissionType}>
                    {type.label}
                  </MenuItem>
                ))}
              </Select>
              {formErrors.type && <FormHelperText>{formErrors.type}</FormHelperText>}
            </FormControl>
            
            {formData.type && (
              <Box sx={{ mt: 3, p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Informasi Tipe Perijinan
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {formData.type === 'short_leave' && 'Izin keluar digunakan untuk keperluan keluar kantor dalam waktu singkat dan kembali pada hari yang sama.'}
                  {formData.type === 'cuti' && 'Cuti digunakan untuk keperluan tidak masuk kerja dalam jangka waktu tertentu.'}
                  {formData.type === 'visit' && 'Kunjungan digunakan untuk keperluan mengunjungi lokasi atau instansi lain.'}
                  {formData.type === 'dinas' && 'Dinas digunakan untuk keperluan tugas dinas ke lokasi lain.'}
                </Typography>
              </Box>
            )}
          </Box>
        );
      case 1:
        return (
          <Box sx={{ mt: 3 }}>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={id}>
                  <DatePicker
                    label="Tanggal Mulai"
                    value={formData.startDate}
                    onChange={(date) => handleChange('startDate', date)}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        error: !!formErrors.startDate,
                        helperText: formErrors.startDate,
                        InputProps: {
                          startAdornment: (
                            <InputAdornment position="start">
                              <CalendarTodayIcon color="action" />
                            </InputAdornment>
                          ),
                        },
                      },
                    }}
                  />
                </LocalizationProvider>
              </Grid>
              <Grid item xs={12} sm={6}>
                <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={id}>
                  <DatePicker
                    label="Tanggal Selesai"
                    value={formData.endDate}
                    onChange={(date) => handleChange('endDate', date)}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        error: !!formErrors.endDate,
                        helperText: formErrors.endDate,
                        InputProps: {
                          startAdornment: (
                            <InputAdornment position="start">
                              <CalendarTodayIcon color="action" />
                            </InputAdornment>
                          ),
                        },
                      },
                    }}
                  />
                </LocalizationProvider>
              </Grid>
              
              {formData.type === 'short_leave' && (
                <>
                  <Grid item xs={12} sm={6}>
                    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={id}>
                      <TimePicker
                        label="Waktu Mulai"
                        value={formData.startTime}
                        onChange={(time) => handleChange('startTime', time)}
                        slotProps={{
                          textField: {
                            fullWidth: true,
                            error: !!formErrors.startTime,
                            helperText: formErrors.startTime,
                            InputProps: {
                              startAdornment: (
                                <InputAdornment position="start">
                                  <AccessTimeIcon color="action" />
                                </InputAdornment>
                              ),
                            },
                          },
                        }}
                      />
                    </LocalizationProvider>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={id}>
                      <TimePicker
                        label="Waktu Selesai"
                        value={formData.endTime}
                        onChange={(time) => handleChange('endTime', time)}
                        slotProps={{
                          textField: {
                            fullWidth: true,
                            error: !!formErrors.endTime,
                            helperText: formErrors.endTime,
                            InputProps: {
                              startAdornment: (
                                <InputAdornment position="start">
                                  <AccessTimeIcon color="action" />
                                </InputAdornment>
                              ),
                            },
                          },
                        }}
                      />
                    </LocalizationProvider>
                  </Grid>
                </>
              )}
            </Grid>
            
            {formData.startDate && formData.endDate && (
              <Box sx={{ mt: 3, p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Informasi Durasi
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {formData.startDate && formData.endDate && (
                    <>
                      Durasi: {Math.max(1, Math.floor((formData.endDate - formData.startDate) / (1000 * 60 * 60 * 24)) + 1)} hari
                      {formData.type === 'short_leave' && formData.startTime && formData.endTime && (
                        <>, {Math.floor((formData.endTime - formData.startTime) / (1000 * 60))} menit</>
                      )}
                    </>
                  )}
                </Typography>
              </Box>
            )}
          </Box>
        );
      case 2:
        return (
          <Box sx={{ mt: 3 }}>
            <TextField
              fullWidth
              label="Alasan"
              multiline
              rows={4}
              value={formData.reason}
              onChange={(e) => handleChange('reason', e.target.value)}
              error={!!formErrors.reason}
              helperText={formErrors.reason || `${formData.reason.length}/10 karakter minimum`}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start" sx={{ alignSelf: 'flex-start', mt: 1.5 }}>
                    <DescriptionIcon color="action" />
                  </InputAdornment>
                ),
              }}
            />
            
            <Box sx={{ mt: 3, p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
              <Typography variant="subtitle1" gutterBottom>
                Ringkasan Perijinan
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    Tipe Perijinan
                  </Typography>
                  <Typography variant="body1">
                    {getPermissionTypeLabel(formData.type)}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    Durasi
                  </Typography>
                  <Typography variant="body1">
                    {formData.startDate && formData.endDate && (
                      <>
                        {Math.max(1, Math.floor((formData.endDate - formData.startDate) / (1000 * 60 * 60 * 24)) + 1)} hari
                        {formData.type === 'short_leave' && formData.startTime && formData.endTime && (
                          <>, {Math.floor((formData.endTime - formData.startTime) / (1000 * 60))} menit</>
                        )}
                      </>
                    )}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    Tanggal Mulai
                  </Typography>
                  <Typography variant="body1">
                    {formData.startDate && format(formData.startDate, 'dd MMMM yyyy', { locale: id })}
                    {formData.type === 'short_leave' && formData.startTime && (
                      <>, {format(formData.startTime, 'HH:mm')}</>
                    )}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    Tanggal Selesai
                  </Typography>
                  <Typography variant="body1">
                    {formData.endDate && format(formData.endDate, 'dd MMMM yyyy', { locale: id })}
                    {formData.type === 'short_leave' && formData.endTime && (
                      <>, {format(formData.endTime, 'HH:mm')}</>
                    )}
                  </Typography>
                </Grid>
              </Grid>
            </Box>
          </Box>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box className="permission-form-container">
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <IconButton 
          onClick={() => navigate('/permissions')} 
          sx={{ mr: 2 }}
          aria-label="kembali"
        >
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4" component="h1" className="permission-form-title">
          Buat Perijinan Baru
        </Typography>
      </Box>
      
      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
      
      <Card className="permission-form-card">
        <CardContent>
          <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
          
          <form onSubmit={handleSubmit}>
            {renderStepContent(activeStep)}
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
              <Button
                disabled={activeStep === 0}
                onClick={handleBack}
                startIcon={<ArrowBackIcon />}
              >
                Kembali
              </Button>
              <Box>
                {activeStep === steps.length - 1 ? (
                  <Button
                    variant="contained"
                    color="primary"
                    type="submit"
                    disabled={submitLoading}
                    startIcon={submitLoading ? <CircularProgress size={20} /> : <SaveIcon />}
                  >
                    {submitLoading ? 'Menyimpan...' : 'Simpan Perijinan'}
                  </Button>
                ) : (
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleNext}
                    endIcon={<ArrowForwardIcon />}
                  >
                    Lanjut
                  </Button>
                )}
              </Box>
            </Box>
          </form>
        </CardContent>
      </Card>
      
      <Snackbar
        open={success}
        autoHideDuration={6000}
        onClose={() => setSuccess(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="success" sx={{ width: '100%' }}>
          Perijinan berhasil dibuat! Mengalihkan ke halaman daftar perijinan...
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default CreatePermission;