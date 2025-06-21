import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
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
} from '@mui/material';
import {
  Add as AddIcon,
  ListAlt as ListAltIcon,
  Person as PersonIcon,
  Category as CategoryIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Pending as PendingIcon,
  ArrowForward as ArrowForwardIcon,
  CalendarToday as CalendarTodayIcon,
  PeopleAlt as PeopleAltIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

function AdminDashboard() {
  const [recentPermissions, setRecentPermissions] = useState([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [approvedCount, setApprovedCount] = useState(0);
  const [rejectedCount, setRejectedCount] = useState(0);
  const [userCount, setUserCount] = useState(0);
  const [permissionTypeCount, setPermissionTypeCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const theme = useTheme();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch recent permissions
        const recentResponse = await api.get('/api/permissions', {
          params: { limit: 5, sort: 'createdAt,desc' }
        });
        
        // Fetch counts by status
        const pendingResponse = await api.get('/api/permissions', {
          params: { status: 'pending', count: true }
        });
        
        const approvedResponse = await api.get('/api/permissions', {
          params: { status: 'approved', count: true }
        });
        
        const rejectedResponse = await api.get('/api/permissions', {
          params: { status: 'rejected', count: true }
        });
        
        // Fetch user count
        const userResponse = await api.get('/api/users', {
          params: { count: true }
        });
        
        // Fetch permission type count
        const typeResponse = await api.get('/api/admin/permission-configs', {
          params: { count: true }
        });
        
        setRecentPermissions(recentResponse.data);
        setPendingCount(pendingResponse.data.count);
        setApprovedCount(approvedResponse.data.count);
        setRejectedCount(rejectedResponse.data.count);
        setUserCount(userResponse.data.count);
        setPermissionTypeCount(typeResponse.data.count);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Gagal memuat data dashboard');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
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

  const chartData = {
    labels: ['Pending', 'Disetujui', 'Ditolak'],
    datasets: [
      {
        data: [pendingCount, approvedCount, rejectedCount],
        backgroundColor: [
          theme.palette.warning.main,
          theme.palette.success.main,
          theme.palette.error.main,
        ],
        borderColor: [
          theme.palette.warning.light,
          theme.palette.success.light,
          theme.palette.error.light,
        ],
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          boxWidth: 15,
          padding: 15,
          font: {
            size: 12,
          },
        },
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.raw || 0;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = Math.round((value / total) * 100);
            return `${label}: ${value} (${percentage}%)`;
          }
        }
      }
    },
    cutout: '70%',
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
          Dashboard Admin
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Ringkasan data dan aktivitas sistem
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
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
                to="/admin/permissions?status=pending" 
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
        
        <Grid item xs={12} sm={6} md={3}>
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
                to="/admin/permissions?status=approved" 
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
        
        <Grid item xs={12} sm={6} md={3}>
          <Card className="dashboard-card dashboard-stat-card">
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Box 
                  sx={{ 
                    bgcolor: 'primary.light', 
                    color: 'primary.dark',
                    p: 1,
                    borderRadius: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mr: 2
                  }}
                >
                  <PeopleAltIcon />
                </Box>
                <Typography variant="h6" fontWeight={600}>Pengguna</Typography>
              </Box>
              <Typography variant="h3" className="dashboard-stat-value">
                {userCount}
              </Typography>
              <Button 
                component={Link} 
                to="/admin/users" 
                color="primary" 
                variant="text" 
                endIcon={<ArrowForwardIcon />}
                sx={{ mt: 1, fontWeight: 500 }}
              >
                Kelola Pengguna
              </Button>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card className="dashboard-card dashboard-stat-card">
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Box 
                  sx={{ 
                    bgcolor: 'info.light', 
                    color: 'info.dark',
                    p: 1,
                    borderRadius: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mr: 2
                  }}
                >
                  <CategoryIcon />
                </Box>
                <Typography variant="h6" fontWeight={600}>Tipe Perijinan</Typography>
              </Box>
              <Typography variant="h3" className="dashboard-stat-value">
                {permissionTypeCount}
              </Typography>
              <Button 
                component={Link} 
                to="/admin/permission-types" 
                color="info" 
                variant="text" 
                endIcon={<ArrowForwardIcon />}
                sx={{ mt: 1, fontWeight: 500 }}
              >
                Kelola Tipe
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Chart and Recent Permissions */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={5}>
          <Card className="dashboard-card" sx={{ height: '100%' }}>
            <CardHeader 
              title="Distribusi Status" 
              sx={{ 
                pb: 0,
                '& .MuiCardHeader-title': {
                  fontSize: '1.25rem',
                  fontWeight: 600
                }
              }}
            />
            <CardContent sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
              {pendingCount + approvedCount + rejectedCount > 0 ? (
                <Box sx={{ width: '100%', height: '100%', position: 'relative' }}>
                  <Doughnut data={chartData} options={chartOptions} />
                  <Box 
                    sx={{ 
                      position: 'absolute', 
                      top: '50%', 
                      left: '50%', 
                      transform: 'translate(-50%, -50%)',
                      textAlign: 'center'
                    }}
                  >
                    <Typography variant="h4" fontWeight={600}>
                      {pendingCount + approvedCount + rejectedCount}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total
                    </Typography>
                  </Box>
                </Box>
              ) : (
                <Typography variant="body1" color="text.secondary" sx={{ py: 4 }}>
                  Belum ada data perijinan
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={7}>
          <Card className="dashboard-card" sx={{ height: '100%' }}>
            <CardHeader 
              title="Perijinan Terbaru" 
              action={
                <Button
                  component={Link}
                  to="/admin/permissions"
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
                        to={`/admin/permissions/${permission.id}`}
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
                                  {permission.user?.name || 'Unknown'}
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
                              to={`/admin/permissions/${permission.id}`}
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
          to="/admin/users/create"
          variant="contained"
          color="primary"
          size="large"
          startIcon={<PersonIcon />}
          sx={{ mr: 2, px: 3, py: 1.5, fontWeight: 600 }}
        >
          Tambah Pengguna
        </Button>
        <Button
          component={Link}
          to="/admin/permission-types"
          variant="outlined"
          color="primary"
          size="large"
          startIcon={<SettingsIcon />}
          sx={{ px: 3, py: 1.5, fontWeight: 600 }}
        >
          Kelola Tipe Perijinan
        </Button>
      </Box>
    </Box>
  );
}

export default AdminDashboard;