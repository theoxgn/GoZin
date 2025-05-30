import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Divider,
  Grid,
  Paper,
  Typography,
  Alert,
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Pending as PendingIcon,
  People as PeopleIcon,
  Settings as SettingsIcon,
  List as ListIcon,
} from '@mui/icons-material';

function AdminDashboard() {
  const [stats, setStats] = useState({
    pendingCount: 0,
    approvedCount: 0,
    rejectedCount: 0,
    userCount: 0,
    permissionTypeCount: 0,
  });
  const [recentPermissions, setRecentPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      // Fetch stats
      const statsResponse = await axios.get('/api/admin/stats', {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      // Fetch recent permissions
      const permissionsResponse = await axios.get('/api/permissions', {
        headers: { Authorization: `Bearer ${token}` },
        params: { limit: 5, page: 1 },
      });
      
      setStats(statsResponse.data);
      setRecentPermissions(permissionsResponse.data.permissions || permissionsResponse.data);
      setError('');
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Gagal memuat data dashboard');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('id-ID', options);
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

  const getStatusLabel = (status) => {
    switch (status) {
      case 'pending':
        return 'Menunggu Persetujuan';
      case 'approved_by_approval':
        return 'Disetujui oleh Approval';
      case 'approved':
        return 'Disetujui';
      case 'rejected':
        return 'Ditolak';
      default:
        return status;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'primary';
      case 'approved_by_approval':
        return 'info';
      case 'approved':
        return 'success';
      case 'rejected':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <Box sx={{ py: 2 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Dashboard Admin
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ height: '100%', bgcolor: '#f5f5f5' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <PendingIcon color="primary" sx={{ mr: 1, fontSize: 32 }} />
                    <Typography variant="h6" component="div">
                      Pending
                    </Typography>
                  </Box>
                  <Typography variant="h3" component="div" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                    {stats.pendingCount}
                  </Typography>
                  <Button 
                    component={Link} 
                    to="/permissions?status=pending" 
                    variant="outlined" 
                    size="small" 
                    sx={{ mt: 2 }}
                  >
                    Lihat Semua
                  </Button>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ height: '100%', bgcolor: '#e8f5e9' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <CheckCircleIcon color="success" sx={{ mr: 1, fontSize: 32 }} />
                    <Typography variant="h6" component="div">
                      Disetujui
                    </Typography>
                  </Box>
                  <Typography variant="h3" component="div" sx={{ fontWeight: 'bold', color: 'success.main' }}>
                    {stats.approvedCount}
                  </Typography>
                  <Button 
                    component={Link} 
                    to="/permissions?status=approved" 
                    variant="outlined" 
                    color="success" 
                    size="small" 
                    sx={{ mt: 2 }}
                  >
                    Lihat Semua
                  </Button>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ height: '100%', bgcolor: '#ffebee' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <CancelIcon color="error" sx={{ mr: 1, fontSize: 32 }} />
                    <Typography variant="h6" component="div">
                      Ditolak
                    </Typography>
                  </Box>
                  <Typography variant="h3" component="div" sx={{ fontWeight: 'bold', color: 'error.main' }}>
                    {stats.rejectedCount}
                  </Typography>
                  <Button 
                    component={Link} 
                    to="/permissions?status=rejected" 
                    variant="outlined" 
                    color="error" 
                    size="small" 
                    sx={{ mt: 2 }}
                  >
                    Lihat Semua
                  </Button>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ height: '100%', bgcolor: '#e3f2fd' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <PeopleIcon color="info" sx={{ mr: 1, fontSize: 32 }} />
                    <Typography variant="h6" component="div">
                      Pengguna
                    </Typography>
                  </Box>
                  <Typography variant="h3" component="div" sx={{ fontWeight: 'bold', color: 'info.main' }}>
                    {stats.userCount}
                  </Typography>
                  <Button 
                    component={Link} 
                    to="/admin/users" 
                    variant="outlined" 
                    color="info" 
                    size="small" 
                    sx={{ mt: 2 }}
                  >
                    Kelola Pengguna
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} md={8}>
              <Paper sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <ListIcon sx={{ mr: 1 }} />
                  <Typography variant="h6" component="h2">
                    Perijinan Terbaru
                  </Typography>
                </Box>
                <Divider sx={{ mb: 2 }} />
                
                {recentPermissions.length > 0 ? (
                  <Grid container spacing={2}>
                    {recentPermissions.map((permission) => (
                      <Grid item xs={12} key={permission.id}>
                        <Card variant="outlined">
                          <CardContent>
                            <Grid container spacing={2}>
                              <Grid item xs={12} sm={3}>
                                <Typography variant="subtitle2" color="textSecondary">
                                  Nama
                                </Typography>
                                <Typography variant="body1">
                                  {permission.userName || 'User'}
                                </Typography>
                              </Grid>
                              
                              <Grid item xs={6} sm={2}>
                                <Typography variant="subtitle2" color="textSecondary">
                                  Tipe
                                </Typography>
                                <Typography variant="body1">
                                  {getPermissionTypeLabel(permission.type)}
                                </Typography>
                              </Grid>
                              
                              <Grid item xs={6} sm={3}>
                                <Typography variant="subtitle2" color="textSecondary">
                                  Tanggal
                                </Typography>
                                <Typography variant="body1">
                                  {formatDate(permission.startDate)}
                                  {permission.startDate !== permission.endDate && 
                                    <><br />{`s/d ${formatDate(permission.endDate)}`}</>
                                  }
                                </Typography>
                              </Grid>
                              
                              <Grid item xs={6} sm={2}>
                                <Typography variant="subtitle2" color="textSecondary">
                                  Status
                                </Typography>
                                <Typography 
                                  variant="body1" 
                                  color={`${getStatusColor(permission.status)}.main`}
                                >
                                  {getStatusLabel(permission.status)}
                                </Typography>
                              </Grid>
                              
                              <Grid item xs={6} sm={2} sx={{ display: 'flex', alignItems: 'center', justifyContent: { xs: 'flex-start', sm: 'flex-end' } }}>
                                <Button
                                  variant="contained"
                                  size="small"
                                  component={Link}
                                  to={`/permissions/${permission.id}`}
                                >
                                  Detail
                                </Button>
                              </Grid>
                            </Grid>
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                ) : (
                  <Box sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="body1" color="textSecondary">
                      Tidak ada data perijinan
                    </Typography>
                  </Box>
                )}
                
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                  <Button
                    variant="outlined"
                    component={Link}
                    to="/permissions"
                  >
                    Lihat Semua Perijinan
                  </Button>
                </Box>
              </Paper>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 2, height: '100%' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <SettingsIcon sx={{ mr: 1 }} />
                  <Typography variant="h6" component="h2">
                    Pengaturan Sistem
                  </Typography>
                </Box>
                <Divider sx={{ mb: 2 }} />
                
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Card variant="outlined" sx={{ mb: 2 }}>
                      <CardContent>
                        <Typography variant="subtitle1" gutterBottom>
                          Konfigurasi Perijinan
                        </Typography>
                        <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                          Kelola tipe perijinan, durasi maksimal, dan pengaturan lainnya
                        </Typography>
                        <Button
                          variant="contained"
                          component={Link}
                          to="/admin/permission-config"
                          fullWidth
                        >
                          Kelola Konfigurasi
                        </Button>
                      </CardContent>
                    </Card>
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Card variant="outlined" sx={{ mb: 2 }}>
                      <CardContent>
                        <Typography variant="subtitle1" gutterBottom>
                          Manajemen Pengguna
                        </Typography>
                        <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                          Kelola pengguna, peran, dan hak akses
                        </Typography>
                        <Button
                          variant="contained"
                          component={Link}
                          to="/admin/users"
                          fullWidth
                        >
                          Kelola Pengguna
                        </Button>
                      </CardContent>
                    </Card>
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="subtitle1" gutterBottom>
                          Statistik Sistem
                        </Typography>
                        <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                          Lihat statistik penggunaan sistem
                        </Typography>
                        <Button
                          variant="contained"
                          component={Link}
                          to="/admin/stats"
                          fullWidth
                        >
                          Lihat Statistik
                        </Button>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
          </Grid>
        </>
      )}
    </Box>
  );
}

export default AdminDashboard;