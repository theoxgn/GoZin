import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
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
} from '@mui/material';
import {
  ListAlt as ListAltIcon,
  SupervisorAccount as SupervisorAccountIcon,
} from '@mui/icons-material';

function ApprovalDashboard() {
  const [pendingCount, setPendingCount] = useState(0);
  const [recentPending, setRecentPending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem('token');
        
        // Fetch pending count
        const countResponse = await axios.get('/api/approval/pending', {
          headers: { Authorization: `Bearer ${token}` },
          params: { count: true }
        });
        
        // Fetch recent pending permissions
        const recentResponse = await axios.get('/api/approval/pending', {
          headers: { Authorization: `Bearer ${token}` },
          params: { limit: 5, sort: 'createdAt,desc' }
        });
        
        setPendingCount(countResponse.data.count || 0);
        setRecentPending(recentResponse.data.permissions || recentResponse.data);
      } catch (err) {
        console.error('Error fetching approval dashboard data:', err);
        setError('Gagal memuat data dashboard approval');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

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

  return (
    <Box className="dashboard-container">
      <Typography variant="h4" component="h1" gutterBottom>
        Dashboard Approval
      </Typography>
      
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      
      <Grid container spacing={3} sx={{ mt: 1 }}>
        {/* Summary Card */}
        <Grid item xs={12} md={6}>
          <Card className="dashboard-card">
            <CardHeader 
              title="Ringkasan" 
              avatar={<SupervisorAccountIcon color="primary" />}
            />
            <Divider />
            <CardContent>
              <Typography variant="h5" gutterBottom>
                {pendingCount} Perijinan Menunggu Persetujuan
              </Typography>
              
              <Button
                variant="contained"
                color="primary"
                startIcon={<ListAltIcon />}
                component={Link}
                to="/approval/pending"
                sx={{ mt: 2 }}
              >
                Lihat Semua Perijinan Pending
              </Button>
            </CardContent>
          </Card>
        </Grid>
        
        {/* Recent Pending Permissions Card */}
        <Grid item xs={12} md={6}>
          <Card className="dashboard-card">
            <CardHeader 
              title="Perijinan Terbaru Menunggu Persetujuan" 
              action={
                <Button 
                  size="small" 
                  component={Link} 
                  to="/approval/pending"
                >
                  Lihat Semua
                </Button>
              }
            />
            <Divider />
            <CardContent>
              {recentPending.length > 0 ? (
                <List>
                  {recentPending.map((permission) => (
                    <ListItem 
                      key={permission.id} 
                      component={Link} 
                      to={`/permissions/${permission.id}`}
                      sx={{ 
                        textDecoration: 'none', 
                        color: 'inherit',
                        '&:hover': { bgcolor: 'action.hover' } 
                      }}
                    >
                      <ListItemText
                        primary={
                          <>
                            <Typography component="span" variant="body1" fontWeight="medium">
                              {permission.userName || 'User'}
                            </Typography>
                            {' - '}
                            <Typography component="span" variant="body1">
                              {getPermissionTypeLabel(permission.type)}
                            </Typography>
                          </>
                        }
                        secondary={
                          <>
                            {formatDate(permission.startDate)}
                            {permission.startDate !== permission.endDate && 
                              ` s/d ${formatDate(permission.endDate)}`}
                            <br />
                            {permission.reason.substring(0, 50)}
                            {permission.reason.length > 50 ? '...' : ''}
                          </>
                        }
                      />
                      <Chip label="Pending" color="warning" size="small" />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography variant="body1" color="textSecondary" align="center">
                  Tidak ada perijinan yang menunggu persetujuan
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}

export default ApprovalDashboard;