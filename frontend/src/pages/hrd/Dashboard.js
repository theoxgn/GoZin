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
  List as ListIcon,
} from '@mui/icons-material';

function HRDDashboard() {
  const [stats, setStats] = useState({
    pendingCount: 0,
    approvedCount: 0,
    rejectedCount: 0,
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
      const statsResponse = await axios.get('/api/hrd/stats', {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      // Fetch recent pending permissions
      const permissionsResponse = await axios.get('/api/hrd/pending', {
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

  return (
    <Box sx={{ py: 2 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Dashboard HRD
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
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
                    {stats.pendingCount}
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
          </Grid>

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