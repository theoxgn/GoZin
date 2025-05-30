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
} from '@mui/material';
import {
  Add as AddIcon,
  ListAlt as ListAltIcon,
  AccessTime as AccessTimeIcon,
} from '@mui/icons-material';

function UserDashboard() {
  const { user } = useAuth();
  const [recentPermissions, setRecentPermissions] = useState([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [approvedCount, setApprovedCount] = useState(0);
  const [rejectedCount, setRejectedCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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

    fetchDashboardData();
  }, []);

  const getStatusChip = (status) => {
    switch (status) {
      case 'pending':
        return <Chip label="Pending" color="warning" size="small" />;
      case 'approved_by_approval':
        return <Chip label="Disetujui Approval" color="info" size="small" />;
      case 'approved':
        return <Chip label="Disetujui" color="success" size="small" />;
      case 'rejected':
        return <Chip label="Ditolak" color="error" size="small" />;
      default:
        return <Chip label={status} size="small" />;
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('id-ID', options);
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
        Dashboard
      </Typography>
      
      <Typography variant="h6" gutterBottom>
        Selamat datang, {user?.name}!
      </Typography>
      
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      
      <Grid container spacing={3} sx={{ mt: 1 }}>
        {/* Quick Actions Card */}
        <Grid item xs={12} md={4}>
          <Card className="dashboard-card">
            <CardHeader title="Aksi Cepat" />
            <Divider />
            <CardContent>
              <Button
                variant="contained"
                color="primary"
                startIcon={<AddIcon />}
                component={Link}
                to="/permissions/create"
                fullWidth
                sx={{ mb: 2 }}
              >
                Buat Perijinan Baru
              </Button>
              
              <Button
                variant="outlined"
                startIcon={<ListAltIcon />}
                component={Link}
                to="/permissions"
                fullWidth
              >
                Lihat Semua Perijinan
              </Button>
            </CardContent>
          </Card>
        </Grid>
        
        {/* Status Summary Card */}
        <Grid item xs={12} md={4}>
          <Card className="dashboard-card">
            <CardHeader title="Ringkasan Status" />
            <Divider />
            <CardContent>
              <List dense>
                <ListItem>
                  <ListItemText primary="Pending" />
                  <Chip label={pendingCount} color="warning" />
                </ListItem>
                <ListItem>
                  <ListItemText primary="Disetujui" />
                  <Chip label={approvedCount} color="success" />
                </ListItem>
                <ListItem>
                  <ListItemText primary="Ditolak" />
                  <Chip label={rejectedCount} color="error" />
                </ListItem>
                <ListItem>
                  <ListItemText primary="Total" />
                  <Chip label={pendingCount + approvedCount + rejectedCount} />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>
        
        {/* Recent Permissions Card */}
        <Grid item xs={12} md={4}>
          <Card className="dashboard-card">
            <CardHeader 
              title="Perijinan Terbaru" 
              action={
                <Button 
                  size="small" 
                  component={Link} 
                  to="/permissions"
                  endIcon={<AccessTimeIcon />}
                >
                  Semua
                </Button>
              }
            />
            <Divider />
            <CardContent>
              {recentPermissions.length > 0 ? (
                <List dense>
                  {recentPermissions.map((permission) => (
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
                        primary={`${permission.type} (${formatDate(permission.startDate)})`}
                        secondary={permission.reason.substring(0, 30) + (permission.reason.length > 30 ? '...' : '')}
                      />
                      {getStatusChip(permission.status)}
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography variant="body2" color="textSecondary" align="center">
                  Belum ada perijinan
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}

export default UserDashboard;