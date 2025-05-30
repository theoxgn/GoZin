import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Box,
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
  BarChart as BarChartIcon,
  PieChart as PieChartIcon,
  Timeline as TimelineIcon,
  TrendingUp as TrendingUpIcon,
} from '@mui/icons-material';

// Assuming we're using Chart.js for visualizations
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
} from 'chart.js';
import { Bar, Pie, Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

function Statistics() {
  const [stats, setStats] = useState({
    permissionsByType: [],
    permissionsByStatus: [],
    permissionsByMonth: [],
    permissionsByDepartment: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchStatistics();
  }, []);

  const fetchStatistics = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await axios.get('/api/admin/statistics', {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      setStats(response.data);
      setError('');
    } catch (err) {
      console.error('Error fetching statistics:', err);
      setError('Gagal memuat data statistik');
    } finally {
      setLoading(false);
    }
  };

  // Prepare chart data
  const permissionsByTypeData = {
    labels: stats.permissionsByType.map(item => getPermissionTypeLabel(item.type)),
    datasets: [
      {
        label: 'Jumlah Perijinan',
        data: stats.permissionsByType.map(item => item.count),
        backgroundColor: [
          'rgba(255, 99, 132, 0.6)',
          'rgba(54, 162, 235, 0.6)',
          'rgba(255, 206, 86, 0.6)',
          'rgba(75, 192, 192, 0.6)',
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const permissionsByStatusData = {
    labels: stats.permissionsByStatus.map(item => getStatusLabel(item.status)),
    datasets: [
      {
        label: 'Jumlah Perijinan',
        data: stats.permissionsByStatus.map(item => item.count),
        backgroundColor: [
          'rgba(54, 162, 235, 0.6)', // pending
          'rgba(75, 192, 192, 0.6)', // approved_by_approval
          'rgba(75, 192, 192, 0.9)', // approved
          'rgba(255, 99, 132, 0.6)', // rejected
        ],
        borderColor: [
          'rgba(54, 162, 235, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(255, 99, 132, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const permissionsByMonthData = {
    labels: stats.permissionsByMonth.map(item => item.month),
    datasets: [
      {
        label: 'Jumlah Perijinan',
        data: stats.permissionsByMonth.map(item => item.count),
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
        tension: 0.1,
      },
    ],
  };

  const permissionsByDepartmentData = {
    labels: stats.permissionsByDepartment.map(item => item.department || 'Tidak Ada'),
    datasets: [
      {
        label: 'Jumlah Perijinan',
        data: stats.permissionsByDepartment.map(item => item.count),
        backgroundColor: [
          'rgba(255, 99, 132, 0.6)',
          'rgba(54, 162, 235, 0.6)',
          'rgba(255, 206, 86, 0.6)',
          'rgba(75, 192, 192, 0.6)',
          'rgba(153, 102, 255, 0.6)',
          'rgba(255, 159, 64, 0.6)',
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
          'rgba(255, 159, 64, 1)',
        ],
        borderWidth: 1,
      },
    ],
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

  return (
    <Box sx={{ py: 2 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Statistik Sistem
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2, height: '100%' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <PieChartIcon sx={{ mr: 1 }} />
                <Typography variant="h6" component="h2">
                  Perijinan Berdasarkan Tipe
                </Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />
              
              {stats.permissionsByType.length > 0 ? (
                <Box sx={{ height: 300, display: 'flex', justifyContent: 'center' }}>
                  <Pie data={permissionsByTypeData} options={{ maintainAspectRatio: false }} />
                </Box>
              ) : (
                <Box sx={{ p: 2, textAlign: 'center' }}>
                  <Typography variant="body1" color="textSecondary">
                    Tidak ada data
                  </Typography>
                </Box>
              )}
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2, height: '100%' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <PieChartIcon sx={{ mr: 1 }} />
                <Typography variant="h6" component="h2">
                  Perijinan Berdasarkan Status
                </Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />
              
              {stats.permissionsByStatus.length > 0 ? (
                <Box sx={{ height: 300, display: 'flex', justifyContent: 'center' }}>
                  <Pie data={permissionsByStatusData} options={{ maintainAspectRatio: false }} />
                </Box>
              ) : (
                <Box sx={{ p: 2, textAlign: 'center' }}>
                  <Typography variant="body1" color="textSecondary">
                    Tidak ada data
                  </Typography>
                </Box>
              )}
            </Paper>
          </Grid>
          
          <Grid item xs={12}>
            <Paper sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <TimelineIcon sx={{ mr: 1 }} />
                <Typography variant="h6" component="h2">
                  Perijinan Berdasarkan Bulan
                </Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />
              
              {stats.permissionsByMonth.length > 0 ? (
                <Box sx={{ height: 300 }}>
                  <Line 
                    data={permissionsByMonthData} 
                    options={{ 
                      maintainAspectRatio: false,
                      scales: {
                        y: {
                          beginAtZero: true,
                          ticks: {
                            precision: 0
                          }
                        }
                      }
                    }} 
                  />
                </Box>
              ) : (
                <Box sx={{ p: 2, textAlign: 'center' }}>
                  <Typography variant="body1" color="textSecondary">
                    Tidak ada data
                  </Typography>
                </Box>
              )}
            </Paper>
          </Grid>
          
          <Grid item xs={12}>
            <Paper sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <BarChartIcon sx={{ mr: 1 }} />
                <Typography variant="h6" component="h2">
                  Perijinan Berdasarkan Departemen
                </Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />
              
              {stats.permissionsByDepartment.length > 0 ? (
                <Box sx={{ height: 300 }}>
                  <Bar 
                    data={permissionsByDepartmentData} 
                    options={{ 
                      maintainAspectRatio: false,
                      scales: {
                        y: {
                          beginAtZero: true,
                          ticks: {
                            precision: 0
                          }
                        }
                      }
                    }} 
                  />
                </Box>
              ) : (
                <Box sx={{ p: 2, textAlign: 'center' }}>
                  <Typography variant="body1" color="textSecondary">
                    Tidak ada data
                  </Typography>
                </Box>
              )}
            </Paper>
          </Grid>
        </Grid>
      )}
    </Box>
  );
}

export default Statistics;