import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
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
  List as ListIcon,
} from '@mui/icons-material';

function HRDDashboard() {
  const [stats, setStats] = useState({
    pending: 0,
    approved: 0,
    rejected: 0,
    byType: [],
    byDepartment: [],
  });
  const [recentPermissions, setRecentPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statsError, setStatsError] = useState('');
  const [permissionsError, setPermissionsError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);

    // Fetch stats
    try {
      const statsResponse = await api.get('/api/hrd/stats');
      setStats(statsResponse.data.stats);
      setStatsError('');
    } catch (error) {
      console.error('Error fetching stats data:', error);
      setStatsError('Gagal memuat statistik dashboard');
    }

    // Fetch recent pending permissions
    try {
      const permissionsResponse = await api.get('/api/hrd/pending', {
        params: { limit: 5, page: 1 },
      });
      setRecentPermissions(permissionsResponse.data.permissions || permissionsResponse.data);
      setPermissionsError('');
    } catch (error) {
      console.error('Error fetching recent permissions:', error);
      setPermissionsError('Gagal memuat perijinan terbaru');
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

  return (
    <Box sx={{ py: 2 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Dashboard HRD
      </Typography>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {statsError && <Alert severity="error" sx={{ mb: 2 }}>{statsError}</Alert>}
          {!statsError && (
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12} sm={4}>
                <Card sx={{ height: '100%', bgcolor: '#f5f5f5' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <PendingIcon color="primary" sx={{ mr: 1, fontSize: 32 }} />
                      <Typography variant="h6" component="div">
                        Menunggu Persetujuan
                      </Typography>
                    </Box>
                    <Typography variant="h3" component="div" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                      {stats.pending}
                    </Typography>
                    <Button 
                      component={Link} 
                      to="/hrd/pending" 
                      variant="outlined" 
                      size="small" 
                      sx={{ mt: 2 }}
                    >
                      Lihat Semua
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} sm={4}>
                <Card sx={{ height: '100%', bgcolor: '#e8f5e9' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <CheckCircleIcon color="success" sx={{ mr: 1, fontSize: 32 }} />
                      <Typography variant="h6" component="div">
                        Disetujui
                      </Typography>
                    </Box>
                    <Typography variant="h3" component="div" sx={{ fontWeight: 'bold', color: 'success.main' }}>
                      {stats.approved}
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
              
              <Grid item xs={12} sm={4}>
                <Card sx={{ height: '100%', bgcolor: '#ffebee' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <CancelIcon color="error" sx={{ mr: 1, fontSize: 32 }} />
                      <Typography variant="h6" component="div">
                        Ditolak
                      </Typography>
                    </Box>
                    <Typography variant="h3" component="div" sx={{ fontWeight: 'bold', color: 'error.main' }}>
                      {stats.rejected}
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
            </Grid>
          )}

          {permissionsError && <Alert severity="error" sx={{ mb: 2 }}>{permissionsError}</Alert>}
          {!permissionsError && (
            <Paper sx={{ p: 2, mb: 4 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <ListIcon sx={{ mr: 1 }} />
                <Typography variant="h6" component="h2">
                  Perijinan Terbaru Menunggu Persetujuan HRD
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
                            <Grid item xs={12} sm={4}>
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
                            
                            <Grid item xs={12} sm={3} sx={{ display: 'flex', alignItems: 'center', justifyContent: { xs: 'flex-start', sm: 'flex-end' } }}>
                              <Button
                                variant="contained"
                                size="small"
                                component={Link}
                                to={`/permissions/${permission.id}`}
                                sx={{ mr: 1 }}
                              >
                                Detail
                              </Button>
                              <Button
                                variant="outlined"
                                size="small"
                                component={Link}
                                to="/hrd/pending"
                              >
                                Semua
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
                    Tidak ada perijinan yang menunggu persetujuan HRD
                  </Typography>
                </Box>
              )}
            </Paper>
          )}

          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <Button
              variant="contained"
              size="large"
              component={Link}
              to="/hrd/pending"
              startIcon={<ListIcon />}
            >
              Lihat Semua Perijinan Pending
            </Button>
          </Box>
        </>
      )}
    </Box>
  );
}

export default HRDDashboard;