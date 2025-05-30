import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Typography,
  Alert,
} from '@mui/material';
import { Add as AddIcon, FilterList as FilterListIcon } from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import idLocale from 'date-fns/locale/id';

function Permissions() {
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  
  // Filter states
  const [filters, setFilters] = useState({
    type: '',
    status: '',
    startDate: null,
    endDate: null,
  });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchPermissions();
  }, [page, rowsPerPage, filters]);

  const fetchPermissions = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const params = {
        page: page + 1, // API uses 1-based indexing
        limit: rowsPerPage,
      };
      
      // Add filters if they are set
      if (filters.type) params.type = filters.type;
      if (filters.status) params.status = filters.status;
      if (filters.startDate) params.startDate = filters.startDate.toISOString().split('T')[0];
      if (filters.endDate) params.endDate = filters.endDate.toISOString().split('T')[0];
      
      const response = await axios.get('/api/permissions', {
        headers: { Authorization: `Bearer ${token}` },
        params,
      });
      
      setPermissions(response.data.permissions || response.data);
      setTotalCount(response.data.totalCount || response.data.length);
      setError('');
    } catch (err) {
      console.error('Error fetching permissions:', err);
      setError('Gagal memuat data perijinan');
      setPermissions([]);
    } finally {
      setLoading(false);
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
    setFilters({
      ...filters,
      [field]: value,
    });
    setPage(0); // Reset to first page when filters change
  };

  const clearFilters = () => {
    setFilters({
      type: '',
      status: '',
      startDate: null,
      endDate: null,
    });
    setPage(0);
  };

  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };

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
      <Grid container spacing={2} alignItems="center" sx={{ mb: 3 }}>
        <Grid item xs>
          <Typography variant="h4" component="h1">
            Daftar Perijinan
          </Typography>
        </Grid>
        <Grid item>
          <Button
            variant="outlined"
            startIcon={<FilterListIcon />}
            onClick={toggleFilters}
            sx={{ mr: 1 }}
          >
            {showFilters ? 'Sembunyikan Filter' : 'Tampilkan Filter'}
          </Button>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            component={Link}
            to="/permissions/create"
          >
            Buat Perijinan
          </Button>
        </Grid>
      </Grid>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {showFilters && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth variant="outlined" size="small">
                  <InputLabel>Tipe Perijinan</InputLabel>
                  <Select
                    value={filters.type}
                    onChange={(e) => handleFilterChange('type', e.target.value)}
                    label="Tipe Perijinan"
                  >
                    <MenuItem value="">Semua</MenuItem>
                    <MenuItem value="short_leave">Izin Keluar</MenuItem>
                    <MenuItem value="cuti">Cuti</MenuItem>
                    <MenuItem value="visit">Kunjungan</MenuItem>
                    <MenuItem value="dinas">Dinas</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth variant="outlined" size="small">
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={filters.status}
                    onChange={(e) => handleFilterChange('status', e.target.value)}
                    label="Status"
                  >
                    <MenuItem value="">Semua</MenuItem>
                    <MenuItem value="pending">Pending</MenuItem>
                    <MenuItem value="approved_by_approval">Disetujui Approval</MenuItem>
                    <MenuItem value="approved">Disetujui</MenuItem>
                    <MenuItem value="rejected">Ditolak</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={idLocale}>
                  <DatePicker
                    label="Tanggal Mulai"
                    value={filters.startDate}
                    onChange={(date) => handleFilterChange('startDate', date)}
                    renderInput={(params) => (
                      <TextField {...params} fullWidth size="small" />
                    )}
                  />
                </LocalizationProvider>
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={idLocale}>
                  <DatePicker
                    label="Tanggal Selesai"
                    value={filters.endDate}
                    onChange={(date) => handleFilterChange('endDate', date)}
                    renderInput={(params) => (
                      <TextField {...params} fullWidth size="small" />
                    )}
                  />
                </LocalizationProvider>
              </Grid>
              
              <Grid item xs={12}>
                <Button variant="outlined" onClick={clearFilters} size="small">
                  Reset Filter
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}

      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : permissions.length > 0 ? (
          <>
            <TableContainer sx={{ maxHeight: 440 }}>
              <Table stickyHeader aria-label="sticky table">
                <TableHead>
                  <TableRow>
                    <TableCell>ID</TableCell>
                    <TableCell>Tipe</TableCell>
                    <TableCell>Tanggal Mulai</TableCell>
                    <TableCell>Tanggal Selesai</TableCell>
                    <TableCell>Alasan</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Aksi</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {permissions.map((permission) => (
                    <TableRow hover key={permission.id}>
                      <TableCell>{permission.id}</TableCell>
                      <TableCell>{getPermissionTypeLabel(permission.type)}</TableCell>
                      <TableCell>{formatDate(permission.startDate)}</TableCell>
                      <TableCell>{formatDate(permission.endDate)}</TableCell>
                      <TableCell>
                        {permission.reason.length > 50
                          ? `${permission.reason.substring(0, 50)}...`
                          : permission.reason}
                      </TableCell>
                      <TableCell>{getStatusChip(permission.status)}</TableCell>
                      <TableCell>
                        <Button
                          variant="outlined"
                          size="small"
                          component={Link}
                          to={`/permissions/${permission.id}`}
                        >
                          Detail
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={totalCount}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </>
        ) : (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="body1" color="textSecondary">
              Tidak ada data perijinan
            </Typography>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              component={Link}
              to="/permissions/create"
              sx={{ mt: 2 }}
            >
              Buat Perijinan Baru
            </Button>
          </Box>
        )}
      </Paper>
    </Box>
  );
}

export default Permissions;