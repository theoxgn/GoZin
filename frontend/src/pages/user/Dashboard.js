import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Divider,
  Grid,
  Typography,
  List,
  ListItem,
  ListItemText,
  Chip,
  CircularProgress,
  Alert,
  Paper,
  IconButton,
  Stack,
  useTheme,
  LinearProgress,
  Tooltip,
} from '@mui/material';
import {
  Add as AddIcon,
  ListAlt as ListAltIcon,
  AccessTime as AccessTimeIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Pending as PendingIcon,
  ArrowForward as ArrowForwardIcon,
  CalendarToday as CalendarTodayIcon,
  MoreVert as MoreVertIcon,
  EventAvailable as EventAvailableIcon,
} from '@mui/icons-material';

function UserDashboard() {
  const { user } = useAuth();
  const [recentPermissions, setRecentPermissions] = useState([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [approvedCount, setApprovedCount] = useState(0);
  const [rejectedCount, setRejectedCount] = useState(0);
  const [quotas, setQuotas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [quotaLoading, setQuotaLoading] = useState(true);
  const [quotaError, setQuotaError] = useState('');
  const theme = useTheme();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem('token');
        
        // Fetch recent permissions
        const recentResponse = await axios.get('/api/permissions', {
          headers: { Authorization: `Bearer ${token}` },
          params: { limit: 5, sort: 'createdAt,desc' }
        });
        
        // Fetch counts by status
        const pendingResponse = await axios.get('/api/permissions', {
          headers: { Authorization: `Bearer ${token}` },
          params: { status: 'pending', count: true }
        });
        
        const approvedResponse = await axios.get('/api/permissions', {
          headers: { Authorization: `Bearer ${token}` },
          params: { status: 'approved', count: true }
        });
        
        const rejectedResponse = await axios.get('/api/permissions', {
          headers: { Authorization: `Bearer ${token}` },
          params: { status: 'rejected', count: true }
        });
        
        setRecentPermissions(recentResponse.data);
        setPendingCount(pendingResponse.data.count);
        setApprovedCount(approvedResponse.data.count);
        setRejectedCount(rejectedResponse.data.count);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Gagal memuat data dashboard');
      } finally {
        setLoading(false);
      }
    };

    const fetchQuotaData = async () => {
      try {
        setQuotaLoading(true);
        const token = localStorage.getItem('token');
        
        // Fetch quota data
        const response = await axios.get('/api/quotas', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setQuotas(response.data.quotas);
      } catch (err) {
        console.error('Error fetching quota data:', err);
        setQuotaError('Gagal memuat data kuota perizinan');
      } finally {
        setQuotaLoading(false);
      }
    };

    fetchDashboardData();
    fetchQuotaData();
  }, []);

  const getStatusChip = (status) => {
    switch (status) {
      case 'pending':
        return <Chip label="Pending" color="warning" size="small" icon={<PendingIcon />} />;
      case 'approved_by_approval':
        return <Chip label="Disetujui Approval" color="info" size="small" icon={<CheckCircleIcon />} />;
      case 'approved':
        return <Chip label="Disetujui" color="success" size="small" icon={<CheckCircleIcon />} />;
      case 'rejected':
        return <Chip label="Ditolak" color="error" size="small" icon={<CancelIcon />} />;
      default:
        return <Chip label={status} size="small" />;
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

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>
    );
  }

  return (
    <Box className="dashboard-container">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" className="dashboard-title">
          Selamat Datang, {user.name}!
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Berikut adalah ringkasan perijinan Anda
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={4}>
          <Card className="dashboard-card dashboard-stat-card">
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Box 
                  sx={{ 
                    bgcolor: 'warning.light', 
                    color: 'warning.dark',
                    p: 1,
                    borderRadius: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mr: 2
                  }}
                >
                  <PendingIcon />
                </Box>
                <Typography variant="h6" fontWeight={600}>Pending</Typography>
              </Box>
              <Typography variant="h3" className="dashboard-stat-value">
                {pendingCount}
              </Typography>
              <Button 
                component={Link} 
                to="/permissions?status=pending" 
                color="warning" 
                variant="text" 
                endIcon={<ArrowForwardIcon />}
                sx={{ mt: 1, fontWeight: 500 }}
              >
                Lihat Detail
              </Button>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={4}>
          <Card className="dashboard-card dashboard-stat-card">
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Box 
                  sx={{ 
                    bgcolor: 'success.light', 
                    color: 'success.dark',
                    p: 1,
                    borderRadius: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mr: 2
                  }}
                >
                  <CheckCircleIcon />
                </Box>
                <Typography variant="h6" fontWeight={600}>Disetujui</Typography>
              </Box>
              <Typography variant="h3" className="dashboard-stat-value">
                {approvedCount}
              </Typography>
              <Button 
                component={Link} 
                to="/permissions?status=approved" 
                color="success" 
                variant="text" 
                endIcon={<ArrowForwardIcon />}
                sx={{ mt: 1, fontWeight: 500 }}
              >
                Lihat Detail
              </Button>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={4}>
          <Card className="dashboard-card dashboard-stat-card">
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Box 
                  sx={{ 
                    bgcolor: 'error.light', 
                    color: 'error.dark',
                    p: 1,
                    borderRadius: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mr: 2
                  }}
                >
                  <CancelIcon />
                </Box>
                <Typography variant="h6" fontWeight={600}>Ditolak</Typography>
              </Box>
              <Typography variant="h3" className="dashboard-stat-value">
                {rejectedCount}
              </Typography>
              <Button 
                component={Link} 
                to="/permissions?status=rejected" 
                color="error" 
                variant="text" 
                endIcon={<ArrowForwardIcon />}
                sx={{ mt: 1, fontWeight: 500 }}
              >
                Lihat Detail
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      {/* Quota Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12}>
          <Card className="dashboard-card">
            <CardHeader 
              title="Sisa Kuota Perizinan Bulan Ini" 
              action={
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <EventAvailableIcon sx={{ mr: 1, color: 'primary.main' }} />
                  <Typography variant="body2" color="text.secondary">
                    {new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}
                  </Typography>
                </Box>
              }
              sx={{ 
                pb: 0,
                '& .MuiCardHeader-title': {
                  fontSize: '1.25rem',
                  fontWeight: 600
                }
              }}
            />
            <CardContent>
              {quotaLoading ? (
                <Box sx={{ py: 4, textAlign: 'center' }}>
                  <CircularProgress size={30} />
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                    Memuat data kuota perizinan...
                  </Typography>
                </Box>
              ) : quotaError ? (
                <Alert severity="error" sx={{ my: 2 }}>{quotaError}</Alert>
              ) : quotas.length > 0 ? (
                <Grid container spacing={3}>
                  {quotas.map((quota) => (
                    <Grid item xs={12} md={6} key={quota.type}>
                      <Box sx={{ p: 2, border: 1, borderColor: 'divider', borderRadius: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                          <Typography variant="subtitle1" fontWeight={600}>
                            {quota.label}
                          </Typography>
                          <Tooltip title={quota.description || `Maksimal ${quota.maxDurationDays} hari per pengajuan`}>
                            <Typography variant="body2" color="primary.main" sx={{ cursor: 'help' }}>
                              Info
                            </Typography>
                          </Tooltip>
                        </Box>
                        
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="body2" color="text.secondary">
                            Terpakai: {quota.used} dari {quota.maxPerMonth}
                          </Typography>
                          <Typography 
                            variant="body2" 
                            fontWeight={600}
                            color={quota.remaining > 0 ? 'success.main' : 'error.main'}
                          >
                            Sisa: {quota.remaining}
                          </Typography>
                        </Box>
                        
                        <LinearProgress 
                          variant="determinate" 
                          value={(quota.used / quota.maxPerMonth) * 100}
                          color={quota.remaining > 0 ? 'primary' : 'error'}
                          sx={{ height: 8, borderRadius: 4 }}
                        />
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              ) : (
                <Box sx={{ py: 4, textAlign: 'center' }}>
                  <Typography variant="body1" color="text.secondary">
                    Tidak ada data kuota perizinan
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Recent Permissions */}
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Card className="dashboard-card">
            <CardHeader 
              title="Perijinan Terbaru" 
              action={
                <Button
                  component={Link}
                  to="/permissions"
                  color="primary"
                  endIcon={<ArrowForwardIcon />}
                  sx={{ fontWeight: 500 }}
                >
                  Lihat Semua
                </Button>
              }
              sx={{ 
                pb: 0,
                '& .MuiCardHeader-title': {
                  fontSize: '1.25rem',
                  fontWeight: 600
                }
              }}
            />
            <CardContent>
              {recentPermissions.length > 0 ? (
                <List sx={{ p: 0 }}>
                  {recentPermissions.map((permission, index) => (
                    <React.Fragment key={permission.id}>
                      <ListItem 
                        component={Link} 
                        to={`/permissions/${permission.id}`}
                        sx={{ 
                          py: 2, 
                          px: 3,
                          borderRadius: 2,
                          textDecoration: 'none',
                          color: 'inherit',
                          transition: 'all 0.2s',
                          '&:hover': {
                            bgcolor: 'action.hover',
                          }
                        }}
                      >
                        <Grid container spacing={2} alignItems="center">
                          <Grid item xs={12} sm={4}>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <CalendarTodayIcon 
                                fontSize="small" 
                                color="action" 
                                sx={{ mr: 1.5 }} 
                              />
                              <Box>
                                <Typography variant="subtitle2" fontWeight={600}>
                                  {getPermissionTypeLabel(permission.type)}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {formatDate(permission.createdAt)}
                                </Typography>
                              </Box>
                            </Box>
                          </Grid>
                          <Grid item xs={12} sm={3}>
                            <Typography variant="body2">
                              {permission.startDate && permission.endDate ? (
                                <>
                                  {formatDate(permission.startDate)}
                                  {permission.startDate !== permission.endDate && (
                                    <> - {formatDate(permission.endDate)}</>
                                  )}
                                </>
                              ) : 'N/A'}
                            </Typography>
                          </Grid>
                          <Grid item xs={12} sm={3}>
                            {getStatusChip(permission.status)}
                          </Grid>
                          <Grid item xs={12} sm={2} sx={{ textAlign: 'right' }}>
                            <IconButton 
                              component={Link} 
                              to={`/permissions/${permission.id}`}
                              size="small"
                              color="primary"
                            >
                              <ArrowForwardIcon fontSize="small" />
                            </IconButton>
                          </Grid>
                        </Grid>
                      </ListItem>
                      {index < recentPermissions.length - 1 && (
                        <Divider sx={{ my: 0.5 }} />
                      )}
                    </React.Fragment>
                  ))}
                </List>
              ) : (
                <Box sx={{ py: 4, textAlign: 'center' }}>
                  <Typography variant="body1" color="text.secondary">
                    Belum ada perijinan yang dibuat
                  </Typography>
                  <Button
                    component={Link}
                    to="/permissions/create"
                    variant="contained"
                    color="primary"
                    startIcon={<AddIcon />}
                    sx={{ mt: 2 }}
                  >
                    Buat Perijinan Baru
                  </Button>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Quick Actions */}
      <Box sx={{ mt: 4, textAlign: 'center' }}>
        <Button
          component={Link}
          to="/permissions/create"
          variant="contained"
          color="primary"
          size="large"
          startIcon={<AddIcon />}
          sx={{ mr: 2, px: 3, py: 1.5, fontWeight: 600 }}
        >
          Buat Perijinan Baru
        </Button>
        <Button
          component={Link}
          to="/permissions"
          variant="outlined"
          color="primary"
          size="large"
          startIcon={<ListAltIcon />}
          sx={{ px: 3, py: 1.5, fontWeight: 600 }}
        >
          Lihat Semua Perijinan
        </Button>
      </Box>
    </Box>
  );
}

export default UserDashboard;