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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Paper,
  TextField,
  MenuItem,
  IconButton,
  Chip,
  InputAdornment,
  Tooltip,
  CircularProgress,
  Alert,
  Stack,
  FormControl,
  InputLabel,
  Select,
  OutlinedInput,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { id } from 'date-fns/locale';
import {
  Add as AddIcon,
  Search as SearchIcon,
  FilterList as FilterListIcon,
  Clear as ClearIcon,
  Visibility as VisibilityIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Pending as PendingIcon,
  CalendarToday as CalendarTodayIcon,
  Sort as SortIcon,
} from '@mui/icons-material';

function Permissions() {
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [currentUser, setCurrentUser] = useState(null);
  
  // Filter states
  const [filters, setFilters] = useState({
    status: '',
    type: '',
    startDate: null,
    endDate: null,
    search: '',
  });
  
  const [permissionTypes, setPermissionTypes] = useState([]);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    // Get current user from localStorage
    const user = JSON.parse(localStorage.getItem('user'));
    setCurrentUser(user);
    fetchPermissions();
    fetchPermissionTypes();
  }, [page, rowsPerPage, filters]);

  const fetchPermissions = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const params = {
        page: page + 1,
        limit: rowsPerPage,
      };
      
      // Add filters to params
      if (filters.status) params.status = filters.status;
      if (filters.type) params.type = filters.type;
      if (filters.startDate) params.startDate = filters.startDate.toISOString().split('T')[0];
      if (filters.endDate) params.endDate = filters.endDate.toISOString().split('T')[0];
      if (filters.search) params.search = filters.search;
      
      const response = await axios.get('/api/users/permissions/me', {
        headers: { Authorization: `Bearer ${token}` },
        params,
      });
      
      setPermissions(response.data.permissions || response.data);
      setTotalCount(response.data.totalCount || response.data.length);
      setError('');
    } catch (err) {
      console.error('Error fetching permissions:', err);
      setError('Gagal memuat data perijinan');
    } finally {
      setLoading(false);
    }
  };

  const fetchPermissionTypes = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/admin/permission-configs', {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Pastikan kita mengambil array configs dari respons
      setPermissionTypes(response.data.configs || []);
    } catch (err) {
      console.error('Error fetching permission types:', err);
      // Inisialisasi dengan array kosong jika terjadi error
      setPermissionTypes([]);
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
      [field]: value
    }));
    setPage(0);
  };

  const clearFilters = () => {
    setFilters({
      status: '',
      type: '',
      startDate: null,
      endDate: null,
      search: '',
    });
    setPage(0);
  };

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
    if (!dateString) return '-';
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
    <Box className="permissions-container">
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" className="permissions-title">
          Daftar Perijinan
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          component={Link}
          to="/permissions/create"
          sx={{ fontWeight: 600 }}
        >
          Buat Perijinan
        </Button>
      </Box>

      {/* Search and Filter */}
      <Card className="permissions-card" sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                placeholder="Cari perijinan..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                  endAdornment: filters.search ? (
                    <InputAdornment position="end">
                      <IconButton size="small" onClick={() => handleFilterChange('search', '')}>
                        <ClearIcon fontSize="small" />
                      </IconButton>
                    </InputAdornment>
                  ) : null
                }}
              />
            </Grid>
            <Grid item xs={12} md={6} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                color="primary"
                startIcon={<FilterListIcon />}
                onClick={() => setShowFilters(!showFilters)}
                sx={{ mr: 1 }}
              >
                {showFilters ? 'Sembunyikan Filter' : 'Tampilkan Filter'}
              </Button>
              {showFilters && (
                <Button
                  variant="outlined"
                  startIcon={<ClearIcon />}
                  onClick={clearFilters}
                >
                  Reset
                </Button>
              )}
            </Grid>
          </Grid>

          {showFilters && (
            <Box sx={{ mt: 3 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={3}>
                  <FormControl fullWidth size="small">
                    <InputLabel id="status-filter-label">Status</InputLabel>
                    <Select
                      labelId="status-filter-label"
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
                  <FormControl fullWidth size="small">
                    <InputLabel id="type-filter-label">Tipe Perijinan</InputLabel>
                    <Select
                      labelId="type-filter-label"
                      value={filters.type}
                      onChange={(e) => handleFilterChange('type', e.target.value)}
                      label="Tipe Perijinan"
                    >
                      <MenuItem value="">Semua</MenuItem>
                      {permissionTypes.map((type) => (
                        <MenuItem key={type.id} value={type.permissionType}>
                          {type.label || getPermissionTypeLabel(type.permissionType)}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={id}>
                    <DatePicker
                      label="Tanggal Mulai"
                      value={filters.startDate}
                      onChange={(date) => handleFilterChange('startDate', date)}
                      renderInput={(params) => <TextField size="small" {...params} fullWidth />}
                      slotProps={{
                        textField: {
                          size: 'small',
                          fullWidth: true,
                        },
                      }}
                    />
                  </LocalizationProvider>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={id}>
                    <DatePicker
                      label="Tanggal Selesai"
                      value={filters.endDate}
                      onChange={(date) => handleFilterChange('endDate', date)}
                      renderInput={(params) => <TextField size="small" {...params} fullWidth />}
                      slotProps={{
                        textField: {
                          size: 'small',
                          fullWidth: true,
                        },
                      }}
                    />
                  </LocalizationProvider>
                </Grid>
              </Grid>
            </Box>
          )}
        </CardContent>
      </Card>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Card className="permissions-card table-container">
          <TableContainer component={Paper} elevation={0}>
            <Table sx={{ minWidth: 650 }}>
              <TableHead>
                <TableRow>
                  <TableCell>Tipe</TableCell>
                  <TableCell>Tanggal Mulai</TableCell>
                  <TableCell>Tanggal Selesai</TableCell>
                  <TableCell>Alasan</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Aksi</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {permissions.length > 0 ? (
                  permissions.map((permission) => (
                    <TableRow key={permission.id} hover>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <CalendarTodayIcon fontSize="small" color="action" sx={{ mr: 1 }} />
                          <Typography variant="body2">
                            {getPermissionTypeLabel(permission.type)}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>{formatDate(permission.startDate)}</TableCell>
                      <TableCell>{formatDate(permission.endDate)}</TableCell>
                      <TableCell>
                        <Tooltip title={permission.reason || '-'} arrow>
                          <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>
                            {permission.reason ? (
                              permission.reason.length > 50 
                                ? `${permission.reason.substring(0, 50)}...` 
                                : permission.reason
                            ) : '-'}
                          </Typography>
                        </Tooltip>
                      </TableCell>
                      <TableCell>{getStatusChip(permission.status)}</TableCell>
                      <TableCell align="right">
                        <Tooltip title="Lihat Detail">
                          <IconButton 
                            component={Link} 
                            to={`/permissions/${permission.id}`}
                            color="primary"
                            size="small"
                          >
                            <VisibilityIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                      <Typography variant="body1" color="text.secondary">
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
                    </TableCell>
                  </TableRow>
                )}
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
            labelRowsPerPage="Baris per halaman:"
            labelDisplayedRows={({ from, to, count }) => `${from}-${to} dari ${count}`}
          />
        </Card>
      )}
    </Box>
  );
}

export default Permissions;