import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Container,
  Divider,
  Grid,
  Paper,
  Typography,
  Alert,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Tooltip,
  Chip,
  Stack,
  useTheme,
} from '@mui/material';
import {
  AccessTime as AccessTimeIcon,
  LocationOn as LocationOnIcon,
  CameraAlt as CameraAltIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  History as HistoryIcon,
  Today as TodayIcon,
  Close as CloseIcon,
  PhotoCamera as PhotoCameraIcon,
} from '@mui/icons-material';

function Attendance() {
  const { user } = useAuth();
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [todayAttendance, setTodayAttendance] = useState(null);
  const [attendanceHistory, setAttendanceHistory] = useState([]);
  const [attendanceConfig, setAttendanceConfig] = useState(null);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [stream, setStream] = useState(null);
  const [photoData, setPhotoData] = useState(null);
  const [location, setLocation] = useState(null);
  const [locationError, setLocationError] = useState('');
  const [clockInLoading, setClockInLoading] = useState(false);
  const [clockOutLoading, setClockOutLoading] = useState(false);
  const [historyPage, setHistoryPage] = useState(1);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [hasMoreHistory, setHasMoreHistory] = useState(true);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    fetchAttendanceData();
    fetchAttendanceConfig();
  }, []);

  const fetchAttendanceData = async () => {
    setLoading(true);
    try {
      // Fetch today's attendance
      const todayResponse = await api.get('/api/attendance/today');
      setTodayAttendance(todayResponse.data);
      
      // Fetch attendance history
      const historyResponse = await api.get('/api/attendance/history', {
        params: { page: 1, limit: 5 },
      });
      setAttendanceHistory(historyResponse.data.attendances || []);
      setHasMoreHistory(historyResponse.data.hasMore || false);
      setError('');
    } catch (err) {
      console.error('Error fetching attendance data:', err);
      setError('Gagal memuat data absensi');
    } finally {
      setLoading(false);
    }
  };

  const fetchAttendanceConfig = async () => {
    try {
      const response = await api.get('/api/attendance-config/active', {
        params: { departmentId: user.departmentId },
      });
      setAttendanceConfig(response.data);
    } catch (err) {
      console.error('Error fetching attendance config:', err);
    }
  };

  const loadMoreHistory = async () => {
    if (historyLoading || !hasMoreHistory) return;
    
    setHistoryLoading(true);
    try {
      const nextPage = historyPage + 1;
      
      const response = await api.get('/api/attendance/history', {
        params: { page: nextPage, limit: 5 },
      });
      
      const newAttendances = response.data.attendances || [];
      setAttendanceHistory([...attendanceHistory, ...newAttendances]);
      setHistoryPage(nextPage);
      setHasMoreHistory(response.data.hasMore || false);
    } catch (err) {
      console.error('Error loading more history:', err);
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleOpenCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
      setStream(mediaStream);
      setCameraOpen(true);
      
      // Get location when opening camera
      getCurrentLocation();
    } catch (err) {
      console.error('Error accessing camera:', err);
      alert('Tidak dapat mengakses kamera. Pastikan Anda memberikan izin kamera.');
    }
  };

  const handleCloseCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setCameraOpen(false);
    setPhotoData(null);
  };

  const handleTakePhoto = () => {
    const video = document.getElementById('camera-preview');
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    const data = canvas.toDataURL('image/jpeg');
    setPhotoData(data);
  };

  const getCurrentLocation = () => {
    setLocationError('');
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => {
          console.error('Error getting location:', error);
          setLocationError('Tidak dapat mengakses lokasi. Pastikan Anda memberikan izin lokasi.');
        }
      );
    } else {
      setLocationError('Geolokasi tidak didukung oleh browser Anda.');
    }
  };

  const handleClockIn = async () => {
    if (!photoData && attendanceConfig?.photoRequired) {
      alert('Silakan ambil foto terlebih dahulu');
      return;
    }
    
    if (!location || !location.latitude || !location.longitude) {
      if (attendanceConfig?.locationRequired) {
        alert('Lokasi tidak tersedia atau tidak lengkap. Silakan aktifkan GPS Anda dan coba lagi.');
        return;
      }
    }
    
    setClockInLoading(true);
    try {
      const payload = {
        clockInPhoto: photoData,
        latitude: location?.latitude || null,
        longitude: location?.longitude || null,
        notes: notes,
      };
      
      const response = await api.post('/api/attendance/clock-in', payload);
      
      setTodayAttendance(response.data);
      handleCloseCamera();
      setNotes('');
      alert('Absensi masuk berhasil dicatat!');
    } catch (err) {
      console.error('Error clocking in:', err);
      alert(err.response?.data?.message || 'Gagal melakukan absensi masuk');
    } finally {
      setClockInLoading(false);
    }
  };

  const handleClockOut = async () => {
    if (!photoData && attendanceConfig?.photoRequired) {
      alert('Silakan ambil foto terlebih dahulu');
      return;
    }
    
    if (!location || !location.latitude || !location.longitude) {
      if (attendanceConfig?.locationRequired) {
        alert('Lokasi tidak tersedia atau tidak lengkap. Silakan aktifkan GPS Anda dan coba lagi.');
        return;
      }
    }
    
    setClockOutLoading(true);
    try {
      const payload = {
        clockOutPhoto: photoData,
        latitude: location?.latitude || null,
        longitude: location?.longitude || null,
        notes: notes,
      };
      
      const response = await api.post('/api/attendance/clock-out', payload);
      
      setTodayAttendance(response.data);
      handleCloseCamera();
      setNotes('');
      alert('Absensi pulang berhasil dicatat!');
    } catch (err) {
      console.error('Error clocking out:', err);
      alert(err.response?.data?.message || 'Gagal melakukan absensi pulang');
    } finally {
      setClockOutLoading(false);
    }
  };

  const formatTime = (dateString) => {
    if (!dateString) return '-';
    const options = { hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleTimeString('id-ID', options);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('id-ID', options);
  };

  const getStatusChip = (status) => {
    switch (status) {
      case 'present':
        return <Chip label="Hadir" color="success" size="small" />;
      case 'late':
        return <Chip label="Terlambat" color="warning" size="small" />;
      case 'absent':
        return <Chip label="Tidak Hadir" color="error" size="small" />;
      case 'early_leave':
        return <Chip label="Pulang Awal" color="warning" size="small" />;
      default:
        return <Chip label={status} color="default" size="small" />;
    }
  };

  return (
    <Box sx={{ py: 2 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Absensi
      </Typography>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          
          <Grid container spacing={3}>
            {/* Today's Attendance Card */}
            <Grid item xs={12} md={6}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <TodayIcon sx={{ mr: 1 }} />
                    <Typography variant="h6" component="h2">
                      Absensi Hari Ini
                    </Typography>
                  </Box>
                  <Divider sx={{ mb: 2 }} />
                  
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="body1" gutterBottom>
                      {formatDate(new Date())}
                    </Typography>
                    
                    {attendanceConfig && (
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Jam Kerja: {attendanceConfig.workStartTime} - {attendanceConfig.workEndTime}
                      </Typography>
                    )}
                  </Box>
                  
                  <Grid container spacing={2} sx={{ mb: 3 }}>
                    <Grid item xs={6}>
                      <Paper sx={{ p: 2, bgcolor: 'background.default', textAlign: 'center' }}>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          Jam Masuk
                        </Typography>
                        <Typography variant="h6">
                          {todayAttendance?.clockInTime ? formatTime(todayAttendance.clockInTime) : '-'}
                        </Typography>
                        {todayAttendance?.status === 'late' && (
                          <Chip 
                            label="Terlambat" 
                            color="warning" 
                            size="small" 
                            sx={{ mt: 1 }} 
                          />
                        )}
                      </Paper>
                    </Grid>
                    <Grid item xs={6}>
                      <Paper sx={{ p: 2, bgcolor: 'background.default', textAlign: 'center' }}>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          Jam Pulang
                        </Typography>
                        <Typography variant="h6">
                          {todayAttendance?.clockOutTime ? formatTime(todayAttendance.clockOutTime) : '-'}
                        </Typography>
                        {todayAttendance?.status === 'early_leave' && (
                          <Chip 
                            label="Pulang Awal" 
                            color="warning" 
                            size="small" 
                            sx={{ mt: 1 }} 
                          />
                        )}
                      </Paper>
                    </Grid>
                  </Grid>
                  
                  {!todayAttendance?.clockInTime ? (
                    <Button
                      variant="contained"
                      color="primary"
                      fullWidth
                      startIcon={<AccessTimeIcon />}
                      onClick={handleOpenCamera}
                      disabled={clockInLoading}
                    >
                      {clockInLoading ? 'Memproses...' : 'Absen Masuk'}
                    </Button>
                  ) : !todayAttendance?.clockOutTime ? (
                    <Button
                      variant="contained"
                      color="secondary"
                      fullWidth
                      startIcon={<AccessTimeIcon />}
                      onClick={handleOpenCamera}
                      disabled={clockOutLoading}
                    >
                      {clockOutLoading ? 'Memproses...' : 'Absen Pulang'}
                    </Button>
                  ) : (
                    <Alert severity="success" sx={{ mt: 2 }}>
                      Absensi hari ini sudah lengkap
                    </Alert>
                  )}
                </CardContent>
              </Card>
            </Grid>
            
            {/* Attendance History Card */}
            <Grid item xs={12} md={6}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <HistoryIcon sx={{ mr: 1 }} />
                    <Typography variant="h6" component="h2">
                      Riwayat Absensi
                    </Typography>
                  </Box>
                  <Divider sx={{ mb: 2 }} />
                  
                  {attendanceHistory.length === 0 ? (
                    <Box sx={{ textAlign: 'center', py: 3 }}>
                      <Typography variant="body2" color="text.secondary">
                        Belum ada riwayat absensi
                      </Typography>
                    </Box>
                  ) : (
                    <>
                      {attendanceHistory.map((attendance, index) => (
                        <Paper 
                          key={attendance.id} 
                          sx={{ 
                            p: 2, 
                            mb: 2, 
                            bgcolor: 'background.default',
                            borderLeft: `4px solid ${attendance.status === 'present' ? theme.palette.success.main : 
                                        attendance.status === 'late' || attendance.status === 'early_leave' ? theme.palette.warning.main : 
                                        theme.palette.error.main}`
                          }}
                        >
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                            <Typography variant="body1" fontWeight={500}>
                              {formatDate(attendance.date)}
                            </Typography>
                            {getStatusChip(attendance.status)}
                          </Box>
                          
                          <Grid container spacing={2}>
                            <Grid item xs={6}>
                              <Typography variant="body2" color="text.secondary">
                                Masuk: {formatTime(attendance.clockInTime || '-')}
                              </Typography>
                            </Grid>
                            <Grid item xs={6}>
                              <Typography variant="body2" color="text.secondary">
                                Pulang: {formatTime(attendance.clockOutTime || '-')}
                              </Typography>
                            </Grid>
                          </Grid>
                          
                          {attendance.notes && (
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                              Catatan: {attendance.notes}
                            </Typography>
                          )}
                        </Paper>
                      ))}
                      
                      {hasMoreHistory && (
                        <Box sx={{ textAlign: 'center', mt: 2 }}>
                          <Button 
                            variant="outlined" 
                            onClick={loadMoreHistory}
                            disabled={historyLoading}
                          >
                            {historyLoading ? 'Memuat...' : 'Muat Lebih Banyak'}
                          </Button>
                        </Box>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </>
      )}
      
      {/* Camera Dialog */}
      <Dialog 
        open={cameraOpen} 
        onClose={handleCloseCamera} 
        maxWidth="sm" 
        fullWidth
      >
        <DialogTitle>
          {!todayAttendance?.clockInTime ? 'Absen Masuk' : 'Absen Pulang'}
          <IconButton
            aria-label="close"
            onClick={handleCloseCamera}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          {locationError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {locationError}
            </Alert>
          )}
          
          {!photoData ? (
            <Box sx={{ position: 'relative', width: '100%', height: 'auto', aspectRatio: '4/3', bgcolor: 'black', borderRadius: 1, overflow: 'hidden' }}>
              <video
                id="camera-preview"
                autoPlay
                playsInline
                muted
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                ref={(videoElement) => {
                  if (videoElement && stream) {
                    videoElement.srcObject = stream;
                  }
                }}
              />
              <Box sx={{ position: 'absolute', bottom: 16, left: 0, right: 0, display: 'flex', justifyContent: 'center' }}>
                <IconButton 
                  onClick={handleTakePhoto} 
                  sx={{ bgcolor: 'white', '&:hover': { bgcolor: 'rgba(255,255,255,0.8)' } }}
                >
                  <CameraAltIcon />
                </IconButton>
              </Box>
            </Box>
          ) : (
            <Box sx={{ position: 'relative', width: '100%', height: 'auto', aspectRatio: '4/3', borderRadius: 1, overflow: 'hidden' }}>
              <img 
                src={photoData} 
                alt="Preview" 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
              />
              <Box sx={{ position: 'absolute', bottom: 16, left: 0, right: 0, display: 'flex', justifyContent: 'center' }}>
                <Button 
                  variant="contained" 
                  startIcon={<PhotoCameraIcon />} 
                  onClick={() => setPhotoData(null)}
                >
                  Ambil Ulang
                </Button>
              </Box>
            </Box>
          )}
          
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" gutterBottom>
              <LocationOnIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 0.5 }} />
              {location ? `Lokasi: ${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}` : 'Mendapatkan lokasi...'}
            </Typography>
            
            <TextField
              label="Catatan (opsional)"
              multiline
              rows={2}
              fullWidth
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              margin="normal"
              variant="outlined"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseCamera}>Batal</Button>
          {!todayAttendance?.clockInTime ? (
            <Button 
              onClick={handleClockIn} 
              variant="contained" 
              disabled={!photoData || clockInLoading || (attendanceConfig?.locationRequired && !location)}
            >
              {clockInLoading ? 'Memproses...' : 'Absen Masuk'}
            </Button>
          ) : (
            <Button 
              onClick={handleClockOut} 
              variant="contained" 
              color="secondary"
              disabled={!photoData || clockOutLoading || (attendanceConfig?.locationRequired && !location)}
            >
              {clockOutLoading ? 'Memproses...' : 'Absen Pulang'}
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default Attendance;