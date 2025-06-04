import React, { useState, useEffect } from 'react';
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
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  IconButton,
  Tooltip,
  Stack,
  Autocomplete,
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { id } from 'date-fns/locale';
import {
  FilterList as FilterListIcon,
  Search as SearchIcon,
  Refresh as RefreshIcon,
  Download as DownloadIcon,
  AccessTime as AccessTimeIcon,
  Person as PersonIcon,
  CalendarMonth as CalendarMonthIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';

function AttendanceReport() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [attendances, setAttendances] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [filterOpen, setFilterOpen] = useState(false);
  const [filters, setFilters] = useState({
    startDate: null,
    endDate: null,
    status: '',
    search: '',
    departmentId: '',
  });
  const [departments, setDepartments] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [stats, setStats] = useState({
    present: 0,
    late: 0,
    absent: 0,
    earlyLeave: 0,
    total: 0,
  });

  useEffect(() => {
    fetchAttendanceData();
    fetchAttendanceStats();
    fetchDepartments();
    fetchUsers();
  }, [page, rowsPerPage, filters]);

  const fetchAttendanceData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      
      const params = {
        page: page + 1,
        limit: rowsPerPage,
        ...filters,
      };
      
      // Add userId to params if a user is selected
      if (selectedUser) {
        params.userId = selectedUser.id;
      }
      
      // Convert dates to ISO string if they exist
      if (params.startDate) params.startDate = params.startDate.toISOString();
      if (params.endDate) params.endDate = params.endDate.toISOString();
      
      const response = await axios.get('/api/attendance/report', {
        headers: { Authorization: `Bearer ${token}` },
        params,
      });
      
      setAttendances(response.data.attendances || []);
      setTotalCount(response.data.totalCount || 0);
      setError('');
    } catch (err) {
      console.error('Error fetching attendance data:', err);
      setError('Gagal memuat data absensi');
    } finally {
      setLoading(false);
    }
  };

  const fetchAttendanceStats = async () => {
    setStatsLoading(true);
    try {
      const token = localStorage.getItem('token');
      
      const params = { ...filters };
      
      // Add userId to params if a user is selected
      if (selectedUser) {
        params.userId = selectedUser.id;
      }
      
      // Convert dates to ISO string if they exist
      if (params.startDate) params.startDate = params.startDate.toISOString();
      if (params.endDate) params.endDate = params.endDate.toISOString();
      
      const response = await axios.get('/api/attendance/stats', {
        headers: { Authorization: `Bearer ${token}` },
        params,
      });
      
      setStats(response.data.stats || {
        present: 0,
        late: 0,
        absent: 0,
        earlyLeave: 0,
        total: 0,
      });
    } catch (err) {
      console.error('Error fetching attendance stats:', err);
    } finally {
      setStatsLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/admin/departments', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDepartments(response.data || []);
    } catch (err) {
      console.error('Error fetching departments:', err);
    }
  };

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/admin/users', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(response.data || []);
    } catch (err) {
      console.error('Error fetching users:', err);
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value,
    }));
    setPage(0); // Reset to first page when filter changes
  };

  const handleUserChange = (event, newValue) => {
    setSelectedUser(newValue);
    setPage(0); // Reset to first page when user changes
  };

  const handleResetFilters = () => {
    setFilters({
      startDate: null,
      endDate: null,
      status: '',
      search: '',
      departmentId: '',
    });
    setSelectedUser(null);
    setPage(0);
  };

  const handleExportToExcel = async () => {
    try {
      const token = localStorage.getItem('token');
      
      const params = { ...filters, export: true };
      
      // Add userId to params if a user is selected
      if (selectedUser) {
        params.userId = selectedUser.id;
      }
      
      // Convert dates to ISO string if they exist
      if (params.startDate) params.startDate = params.startDate.toISOString();
      if (params.endDate) params.endDate = params.endDate.toISOString();
      
      const response = await axios.get('/api/attendance/export', {
        headers: { Authorization: `Bearer ${token}` },
        params,
        responseType: 'blob',
      });
      
      // Create a download link and trigger download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Laporan_Absensi_${new Date().toISOString().split('T')[0]}.xlsx`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Error exporting attendance data:', err);
      alert('Gagal mengekspor data absensi');
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
        return <Chip label="Hadir" color="success" size="small" icon={<CheckCircleIcon />} />;
      case 'late':
        return <Chip label="Terlambat" color="warning" size="small" icon={<WarningIcon />} />;
      case 'absent':
        return <Chip label="Tidak Hadir" color="error" size="small" icon={<CancelIcon />} />;
      case 'early_leave':
        return <Chip label="Pulang Awal" color="warning" size="small" icon={<WarningIcon />} />;
      default:
        return <Chip label={status} color="default" size="small" />;
    }
  };

  return (
    <Box sx={{ py: 2 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Laporan Absensi
      </Typography>

      {/* Stats Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: '#e8f5e9' }}>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Hadir
              </Typography>
              <Typography variant="h4" component="div" sx={{ fontWeight: 'bold', color: 'success.main' }}>
                {statsLoading ? <CircularProgress size={24} /> : stats.present}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {statsLoading ? '' : `${Math.round((stats.present / (stats.total || 1)) * 100)}% dari total`}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: '#fff8e1' }}>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Terlambat
              </Typography>
              <Typography variant="h4" component="div" sx={{ fontWeight: 'bold', color: 'warning.main' }}>
                {statsLoading ? <CircularProgress size={24} /> : stats.late}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {statsLoading ? '' : `${Math.round((stats.late / (stats.total || 1)) * 100)}% dari total`}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: '#fff8e1' }}>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Pulang Awal
              </Typography>
              <Typography variant="h4" component="div" sx={{ fontWeight: 'bold', color: 'warning.main' }}>
                {statsLoading ? <CircularProgress size={24} /> : stats.earlyLeave}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {statsLoading ? '' : `${Math.round((stats.earlyLeave / (stats.total || 1)) * 100)}% dari total`}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: '#ffebee' }}>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Tidak Hadir
              </Typography>
              <Typography variant="h4" component="div" sx={{ fontWeight: 'bold', color: 'error.main' }}>
                {statsLoading ? <CircularProgress size={24} /> : stats.absent}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {statsLoading ? '' : `${Math.round((stats.absent / (stats.total || 1)) * 100)}% dari total`}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" component="h2">
            Filter
          </Typography>
          <Box>
            <Button 
              startIcon={<RefreshIcon />} 
              onClick={handleResetFilters}
              size="small"
              sx={{ mr: 1 }}
            >
              Reset
            </Button>
            <Button 
              variant="contained" 
              startIcon={<DownloadIcon />}
              onClick={handleExportToExcel}
              size="small"
            >
              Export Excel
            </Button>
          </Box>
        </Box>
        <Divider sx={{ mb: 2 }} />
        
        <Grid container spacing={2}>
          <Grid item xs={12} md={3}>
            <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={id}>
              <DatePicker
                label="Tanggal Mulai"
                value={filters.startDate}
                onChange={(newValue) => handleFilterChange('startDate', newValue)}
                renderInput={(params) => <TextField {...params} fullWidth size="small" />}
                inputFormat="dd/MM/yyyy"
              />
            </LocalizationProvider>
          </Grid>
          <Grid item xs={12} md={3}>
            <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={id}>
              <DatePicker
                label="Tanggal Akhir"
                value={filters.endDate}
                onChange={(newValue) => handleFilterChange('endDate', newValue)}
                renderInput={(params) => <TextField {...params} fullWidth size="small" />}
                inputFormat="dd/MM/yyyy"
              />
            </LocalizationProvider>
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel id="status-select-label">Status</InputLabel>
              <Select
                labelId="status-select-label"
                value={filters.status}
                label="Status"
                onChange={(e) => handleFilterChange('status', e.target.value)}
              >
                <MenuItem value="">Semua</MenuItem>
                <MenuItem value="present">Hadir</MenuItem>
                <MenuItem value="late">Terlambat</MenuItem>
                <MenuItem value="absent">Tidak Hadir</MenuItem>
                <MenuItem value="early_leave">Pulang Awal</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel id="department-select-label">Departemen</InputLabel>
              <Select
                labelId="department-select-label"
                value={filters.departmentId}
                label="Departemen"
                onChange={(e) => handleFilterChange('departmentId', e.target.value)}
              >
                <MenuItem value="">Semua Departemen</MenuItem>
                {departments.map((dept) => (
                  <MenuItem key={dept.id} value={dept.id}>{dept.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={6}>
            <Autocomplete
              options={users}
              getOptionLabel={(option) => `${option.name} (${option.email})`}
              value={selectedUser}
              onChange={handleUserChange}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Cari Karyawan"
                  size="small"
                  fullWidth
                />
              )}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              label="Cari"
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              fullWidth
              size="small"
              placeholder="Cari berdasarkan nama atau catatan"
              InputProps={{
                startAdornment: <SearchIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />,
              }}
            />
          </Grid>
        </Grid>
      </Paper>

      {/* Attendance Table */}
      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ m: 2 }}>{error}</Alert>
        ) : attendances.length === 0 ? (
          <Box sx={{ textAlign: 'center', p: 3 }}>
            <Typography variant="body1" color="text.secondary">
              Tidak ada data absensi yang ditemukan
            </Typography>
          </Box>
        ) : (
          <>
            <TableContainer sx={{ maxHeight: 440 }}>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell>Tanggal</TableCell>
                    <TableCell>Karyawan</TableCell>
                    <TableCell>Departemen</TableCell>
                    <TableCell>Jam Masuk</TableCell>
                    <TableCell>Jam Pulang</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Catatan</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {attendances.map((attendance) => (
                    <TableRow key={attendance.id}>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <CalendarMonthIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                          {formatDate(attendance.date)}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <PersonIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                          {attendance.user?.name || '-'}
                        </Box>
                      </TableCell>
                      <TableCell>{attendance.user?.department || '-'}</TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <AccessTimeIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                          {formatTime(attendance.clockInTime)}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <AccessTimeIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                          {formatTime(attendance.clockOutTime)}
                        </Box>
                      </TableCell>
                      <TableCell>{getStatusChip(attendance.status)}</TableCell>
                      <TableCell>
                        <Tooltip title={attendance.notes || 'Tidak ada catatan'} arrow>
                          <Typography variant="body2" noWrap sx={{ maxWidth: 150 }}>
                            {attendance.notes || '-'}
                          </Typography>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25, 50]}
              component="div"
              count={totalCount}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              labelRowsPerPage="Baris per halaman:"
              labelDisplayedRows={({ from, to, count }) => `${from}-${to} dari ${count !== -1 ? count : `lebih dari ${to}`}`}
            />
          </>
        )}
      </Paper>
    </Box>
  );
}

export default AttendanceReport;