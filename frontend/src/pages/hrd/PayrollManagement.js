import React, { useState, useEffect } from 'react';
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
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
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
  Calculate as CalculateIcon,
  Payment as PaymentIcon,
  Receipt as ReceiptIcon,
  Person as PersonIcon,
  CalendarMonth as CalendarMonthIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Warning as WarningIcon,
  MonetizationOn as MonetizationOnIcon,
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Print as PrintIcon,
} from '@mui/icons-material';

function PayrollManagement() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [payrolls, setPayrolls] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [filters, setFilters] = useState({
    month: '',
    year: new Date().getFullYear(),
    status: '',
    search: '',
    departmentId: '',
  });
  const [departments, setDepartments] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedUserForCalculation, setSelectedUserForCalculation] = useState(null);
  const [userSearchValue, setUserSearchValue] = useState('');
  const [calculationUserSearchValue, setCalculationUserSearchValue] = useState('');
  const [statsLoading, setStatsLoading] = useState(true);
  const [stats, setStats] = useState({
    draft: 0,
    processed: 0,
    paid: 0,
    totalAmount: 0,
  });
  const [years, setYears] = useState([]);
  const [months, setMonths] = useState([
    { value: 1, label: 'Januari' },
    { value: 2, label: 'Februari' },
    { value: 3, label: 'Maret' },
    { value: 4, label: 'April' },
    { value: 5, label: 'Mei' },
    { value: 6, label: 'Juni' },
    { value: 7, label: 'Juli' },
    { value: 8, label: 'Agustus' },
    { value: 9, label: 'September' },
    { value: 10, label: 'Oktober' },
    { value: 11, label: 'November' },
    { value: 12, label: 'Desember' },
  ]);
  const [calculateDialogOpen, setCalculateDialogOpen] = useState(false);
  const [calculateMonth, setCalculateMonth] = useState('');
  const [calculateYear, setCalculateYear] = useState(new Date().getFullYear());
  const [calculateLoading, setCalculateLoading] = useState(false);
  const [processDialogOpen, setProcessDialogOpen] = useState(false);
  const [selectedPayrollId, setSelectedPayrollId] = useState(null);
  const [processLoading, setProcessLoading] = useState(false);
  const [payDialogOpen, setPayDialogOpen] = useState(false);
  const [paymentDate, setPaymentDate] = useState(new Date());
  const [paymentNotes, setPaymentNotes] = useState('');
  const [payLoading, setPayLoading] = useState(false);

  useEffect(() => {
    // Generate years for filter (current year and 5 years back)
    const currentYear = new Date().getFullYear();
    const yearsList = [];
    for (let i = 0; i <= 5; i++) {
      yearsList.push(currentYear - i);
    }
    setYears(yearsList);
    
    // Fetch initial data for the table based on filters
    fetchPayrollData();
    fetchPayrollStats();
    fetchDepartments(); // Keep fetching departments with filters if needed
    
    // Removed fetchUsers() from here

  }, [page, rowsPerPage, filters]);

  // New useEffect to fetch users only once on component mount
  useEffect(() => {
    fetchUsers();
  }, []); // Empty dependency array means run only once on mount

  const fetchPayrollData = async () => {
    setLoading(true);
    try {
      const params = {
        page: page + 1,
        limit: rowsPerPage,
        ...filters,
      };
      
      // Add userId to params if a user is selected
      if (selectedUser) {
        params.userId = selectedUser.id;
      }
      
      const response = await api.get('/api/payroll', {
        params,
      });
      
      setPayrolls(response.data.payrolls || []);
      setTotalCount(response.data.totalCount || 0);
      setError('');
    } catch (err) {
      console.error('Error fetching payroll data:', err);
      setError('Gagal memuat data penggajian');
    } finally {
      setLoading(false);
    }
  };

  const fetchPayrollStats = async () => {
    setStatsLoading(true);
    try {
      const params = { ...filters };
      
      // Add userId to params if a user is selected
      if (selectedUser) {
        params.userId = selectedUser.id;
      }
      
      const response = await api.get('/api/payroll/stats', {
        params,
      });
      
      setStats(response.data.stats || {
        draft: 0,
        processed: 0,
        paid: 0,
        totalAmount: 0,
      });
    } catch (err) {
      console.error('Error fetching payroll stats:', err);
    } finally {
      setStatsLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const response = await api.get('/api/admin/departments');
      setDepartments(response.data || []);
    } catch (err) {
      console.error('Error fetching departments:', err);
    }
  };

  const fetchUsers = async () => {
    try {
      // console.log('Fetching users from /api/admin/users...'); // Log step 1
      const response = await api.get('/api/admin/users');
      // console.log('API Response Data:', response.data); // Log step 2: raw data

      // Access the users array from the response data
      const usersData = response.data?.users || [];

      // Ensure we're setting an array and filter out non-employee users
      const employeeUsers = Array.isArray(usersData)
        ? usersData.filter(user => user.role !== 'admin' && user.role !== 'hrd')
        : [];

      // console.log('Filtered Employee Users:', employeeUsers); // Log step 3: filtered data

      setUsers(employeeUsers);
    } catch (err) {
      console.error('Error fetching users:', err);
      setUsers([]); // Set empty array on error
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
    setUserSearchValue('');
    // If this Autocomplete is the filter, trigger data fetch
    // Check if this function is being called from the filter Autocomplete
    // A simple way is to check if the newValue is null (clearing selection in filter)
    // or if selectedUser was null before (first selection in filter)
    // However, the Autocomplete onChange is used for BOTH filter and calculate dialog
    // A more robust way is to have separate handlers or pass a context/flag
    
    // Let's assume for now that changing the selected user in the *calculate dialog*
    // does NOT trigger a table data fetch. Only changing the user in the *filter* does.
    // The current handleUserChange is shared. We need to differentiate.

    // Let's modify the filter Autocomplete's onChange to call handleFilterChange directly for the user filter.
    // The calculate dialog Autocomplete will use handleUserChange as is.
  };

  const handleResetFilters = () => {
    setFilters({
      month: '',
      year: new Date().getFullYear(),
      status: '',
      search: '',
      departmentId: '',
    });
    setSelectedUser(null);
    setUserSearchValue('');
    setCalculationUserSearchValue('');
    setPage(0);
  };

  const handleExportToExcel = async () => {
    try {
      const params = { ...filters, export: true };
      
      // Add userId to params if a user is selected
      if (selectedUser) {
        params.userId = selectedUser.id;
      }
      
      const response = await api.get('/api/payroll/export', {
        params,
        responseType: 'blob',
      });
      
      // Create a download link and trigger download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Laporan_Penggajian_${new Date().toISOString().split('T')[0]}.xlsx`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Error exporting payroll data:', err);
      alert('Gagal mengekspor data penggajian');
    }
  };

  const handleCalculatePayroll = async () => {
    if (!selectedUserForCalculation) {
      setError('Pilih karyawan terlebih dahulu');
      return;
    }

    if (!calculateMonth || !calculateYear) {
      setError('Pilih bulan dan tahun terlebih dahulu');
      return;
    }

    setCalculateLoading(true);
    setError('');

    try {
      const response = await api.post('/api/payroll/calculate', {
        userId: selectedUserForCalculation.id,
        month: parseInt(calculateMonth),
        year: parseInt(calculateYear),
        basicSalary: selectedUserForCalculation.basicSalary || 0,
        allowances: selectedUserForCalculation.allowances || 0
      });

      // Refresh data after successful calculation
      await fetchPayrollData();
      await fetchPayrollStats();
      
      setCalculateDialogOpen(false);
      setCalculateMonth('');
      setCalculateYear(new Date().getFullYear());
      setSelectedUserForCalculation(null);
      setCalculationUserSearchValue('');
    } catch (err) {
      console.error('Error calculating payroll:', err);
      setError(err.response?.data?.message || 'Gagal menghitung gaji');
    } finally {
      setCalculateLoading(false);
    }
  };

  const handleProcessPayroll = async () => {
    if (!selectedPayrollId) return;
    
    setProcessLoading(true);
    try {
      await api.put(`/api/payroll/process/${selectedPayrollId}`, {});
      
      setProcessDialogOpen(false);
      alert('Gaji berhasil diproses');
      fetchPayrollData();
      fetchPayrollStats();
    } catch (err) {
      console.error('Error processing payroll:', err);
      alert(err.response?.data?.message || 'Gagal memproses gaji');
    } finally {
      setProcessLoading(false);
    }
  };

  const handlePayPayroll = async () => {
    if (!selectedPayrollId) return;
    
    setPayLoading(true);
    try {
      await api.put(`/api/payroll/pay/${selectedPayrollId}`, {
        paymentDate: paymentDate.toISOString(),
        notes: paymentNotes,
      });
      
      setPayDialogOpen(false);
      alert('Pembayaran gaji berhasil dicatat');
      fetchPayrollData();
      fetchPayrollStats();
    } catch (err) {
      console.error('Error paying payroll:', err);
      alert(err.response?.data?.message || 'Gagal mencatat pembayaran gaji');
    } finally {
      setPayLoading(false);
    }
  };

  const handleViewPayslip = (payrollId) => {
    window.open(`/payslip/${payrollId}`, '_blank');
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount || 0);
  };

  const formatMonthYear = (month, year) => {
    const monthNames = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    return `${monthNames[month - 1]} ${year}`;
  };

  const getStatusChip = (status) => {
    switch (status) {
      case 'draft':
        return <Chip label="Draft" color="default" size="small" />;
      case 'processed':
        return <Chip label="Diproses" color="primary" size="small" />;
      case 'paid':
        return <Chip label="Dibayar" color="success" size="small" />;
      default:
        return <Chip label={status} color="default" size="small" />;
    }
  };

  return (
    <Box sx={{ py: 2 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Manajemen Penggajian
      </Typography>

      {/* Stats Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: '#f5f5f5' }}>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Draft
              </Typography>
              <Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}>
                {statsLoading ? <CircularProgress size={24} /> : stats.draft}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: '#e3f2fd' }}>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Diproses
              </Typography>
              <Typography variant="h4" component="div" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                {statsLoading ? <CircularProgress size={24} /> : stats.processed}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: '#e8f5e9' }}>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Dibayar
              </Typography>
              <Typography variant="h4" component="div" sx={{ fontWeight: 'bold', color: 'success.main' }}>
                {statsLoading ? <CircularProgress size={24} /> : stats.paid}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: '#fffde7' }}>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Total Penggajian
              </Typography>
              <Typography variant="h6" component="div" sx={{ fontWeight: 'bold', color: 'warning.main' }}>
                {statsLoading ? <CircularProgress size={24} /> : formatCurrency(stats.totalAmount)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Action Buttons */}
      <Box sx={{ mb: 3 }}>
        <Button
          variant="contained"
          startIcon={<CalculateIcon />}
          onClick={() => { 
            setCalculateDialogOpen(true);
            setSelectedUserForCalculation(null);
            setCalculateMonth('');
            setCalculateYear(new Date().getFullYear());
            setCalculationUserSearchValue('');
          }}
          sx={{ mr: 2 }}
        >
          Hitung Gaji
        </Button>
        <Button
          variant="outlined"
          startIcon={<DownloadIcon />}
          onClick={handleExportToExcel}
        >
          Export Excel
        </Button>
      </Box>

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" component="h2">
            Filter
          </Typography>
          <Button 
            startIcon={<RefreshIcon />} 
            onClick={handleResetFilters}
            size="small"
          >
            Reset
          </Button>
        </Box>
        <Divider sx={{ mb: 2 }} />
        
        <Grid container spacing={2}>
          <Grid item xs={12} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel id="month-select-label">Bulan</InputLabel>
              <Select
                labelId="month-select-label"
                value={filters.month}
                label="Bulan"
                onChange={(e) => handleFilterChange('month', e.target.value)}
              >
                <MenuItem value="">Semua Bulan</MenuItem>
                {months.map((month) => (
                  <MenuItem key={month.value} value={month.value}>{month.label}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel id="year-select-label">Tahun</InputLabel>
              <Select
                labelId="year-select-label"
                value={filters.year}
                label="Tahun"
                onChange={(e) => handleFilterChange('year', e.target.value)}
              >
                {years.map((year) => (
                  <MenuItem key={year} value={year}>{year}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel id="status-select-label">Status</InputLabel>
              <Select
                labelId="status-select-label"
                value={filters.status}
                label="Status"
                onChange={(e) => handleFilterChange('status', e.target.value)}
              >
                <MenuItem value="">Semua Status</MenuItem>
                <MenuItem value="draft">Draft</MenuItem>
                <MenuItem value="processed">Diproses</MenuItem>
                <MenuItem value="paid">Dibayar</MenuItem>
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
          <Grid item xs={12} md={3}>
            <Autocomplete
              options={users}
              getOptionLabel={(option) => {
                if (!option) return '';
                return `${option.name} (${option.email}) - ${option.position}`;
              }}
              value={selectedUser}
              onChange={(event, newValue) => {
                setSelectedUser(newValue);
                setUserSearchValue('');
                handleFilterChange('userId', newValue ? newValue.id : '');
              }}
              inputValue={userSearchValue}
              onInputChange={(event, newInputValue) => {
                setUserSearchValue(newInputValue);
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Cari Karyawan (Filter)"
                  size="small"
                  fullWidth
                />
              )}
              isOptionEqualToValue={(option, value) => option?.id === value?.id}
              noOptionsText="Tidak ada karyawan ditemukan"
              loadingText="Memuat data karyawan..."
              renderOption={(props, option) => {
                const { key, ...otherProps } = props;
                return (
                  <li key={key} {...otherProps}>
                    <Box>
                      <Typography variant="body1">
                        {option.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {option.position} - {option.department || 'No Department'}
                      </Typography>
                    </Box>
                  </li>
                );
              }}
            />
          </Grid>
        </Grid>
      </Paper>

      {/* Payroll Table */}
      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ m: 2 }}>{error}</Alert>
        ) : payrolls.length === 0 ? (
          <Box sx={{ textAlign: 'center', p: 3 }}>
            <Typography variant="body1" color="text.secondary">
              Tidak ada data penggajian yang ditemukan
            </Typography>
          </Box>
        ) : (
          <>
            <TableContainer sx={{ maxHeight: 440 }}>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell>Periode</TableCell>
                    <TableCell>Karyawan</TableCell>
                    <TableCell>Departemen</TableCell>
                    <TableCell>Gaji Pokok</TableCell>
                    <TableCell>Total Pendapatan</TableCell>
                    <TableCell>Total Potongan</TableCell>
                    <TableCell>Gaji Bersih</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="center">Aksi</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {payrolls.map((payroll) => (
                    <TableRow key={payroll.id}>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <CalendarMonthIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                          {formatMonthYear(payroll.month, payroll.year)}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <PersonIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                          {payroll.user?.name || '-'}
                        </Box>
                      </TableCell>
                      <TableCell>{payroll.user?.department || '-'}</TableCell>
                      <TableCell>{formatCurrency(payroll.basicSalary)}</TableCell>
                      <TableCell>{formatCurrency(payroll.totalEarnings)}</TableCell>
                      <TableCell>{formatCurrency(payroll.totalDeductions)}</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>{formatCurrency(payroll.netSalary)}</TableCell>
                      <TableCell>{getStatusChip(payroll.status)}</TableCell>
                      <TableCell align="center">
                        <Stack direction="row" spacing={1} justifyContent="center">
                          <Tooltip title="Lihat Slip Gaji">
                            <IconButton 
                              size="small" 
                              color="primary"
                              onClick={() => handleViewPayslip(payroll.id)}
                            >
                              <VisibilityIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          
                          {payroll.status === 'draft' && (
                            <Tooltip title="Proses Gaji">
                              <IconButton 
                                size="small" 
                                color="primary"
                                onClick={() => {
                                  setSelectedPayrollId(payroll.id);
                                  setProcessDialogOpen(true);
                                }}
                              >
                                <CheckCircleIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          )}
                          
                          {payroll.status === 'processed' && (
                            <Tooltip title="Tandai Sudah Dibayar">
                              <IconButton 
                                size="small" 
                                color="success"
                                onClick={() => {
                                  setSelectedPayrollId(payroll.id);
                                  setPaymentDate(new Date());
                                  setPaymentNotes('');
                                  setPayDialogOpen(true);
                                }}
                              >
                                <PaymentIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          )}
                        </Stack>
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

      {/* Calculate Payroll Dialog */}
      <Dialog open={calculateDialogOpen} onClose={() => setCalculateDialogOpen(false)}>
        <DialogTitle>Hitung Gaji Karyawan</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Pilih karyawan dan periode untuk menghitung gaji
          </DialogContentText>
          
          <Stack spacing={3} sx={{ mt: 2 }}>
            {/* Calculate Dialog Autocomplete for Users */}
            <Autocomplete
              options={users}
              getOptionLabel={(option) => {
                // Tampilkan label berdasarkan nama, posisi, departemen untuk dialog hitung gaji
                if (!option) return '';
                // Pastikan format label sesuai dengan yang diharapkan saat memilih
                return `${option.name} - ${option.position} (${option.department || 'No Department'})`;
              }}
              value={selectedUserForCalculation} // **Pastikan ini terikat ke state yang benar**
              onChange={(event, newValue) => { 
                // **Saat opsi dipilih di dialog Autocomplete**
                setSelectedUserForCalculation(newValue); // **Update state selectedUserForCalculation**
                // Opsional: Update input value state untuk konsistensi setelah memilih
                // Jika newValue adalah objek (bukan null), set input value ke label yang dipilih.
                // Jika newValue null (dihapus), set input value menjadi kosong.
                setCalculationUserSearchValue(newValue 
                  ? `${newValue.name} - ${newValue.position} (${newValue.department || 'No Department'})`
                  : '');
              }}
               inputValue={calculationUserSearchValue} // **Pastikan ini terikat ke state yang benar**
               onInputChange={(event, newInputValue) => { 
                  // **Saat teks input berubah di dialog Autocomplete**
                  setCalculationUserSearchValue(newInputValue); // **Update dialog input value state**
               }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Pilih Karyawan"
                  required
                  error={!selectedUserForCalculation} // Validasi berdasarkan state dialog
                  helperText={!selectedUserForCalculation ? 'Pilih karyawan terlebih dahulu' : ''} // Teks bantuan berdasarkan state dialog
                />
              )}
              renderOption={(props, option) => {
                 const { key, ...otherProps } = props;
                 return (
                   <li key={key} {...otherProps}>
                     <Box>
                       <Typography variant="body1">
                         {option.name}
                       </Typography>
                       <Typography variant="body2" color="text.secondary">
                         {option.position} - {option.department || 'No Department'}
                       </Typography>
                     </Box>
                   </li>
                 );
               }}
              isOptionEqualToValue={(option, value) => option?.id === value?.id} // Pastikan perbandingan objek berdasarkan ID
              noOptionsText="Tidak ada karyawan ditemukan"
              loadingText="Memuat data karyawan..."
            />

            <FormControl fullWidth required error={!calculateMonth}>
              <InputLabel>Bulan</InputLabel>
              <Select
                value={calculateMonth}
                onChange={(e) => setCalculateMonth(e.target.value)}
                label="Bulan"
              >
                {months.map((month) => (
                  <MenuItem key={month.value} value={month.value}>
                    {month.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth required error={!calculateYear}>
              <InputLabel>Tahun</InputLabel>
              <Select
                value={calculateYear}
                onChange={(e) => setCalculateYear(e.target.value)}
                label="Tahun"
              >
                {years.map((year) => (
                  <MenuItem key={year} value={year}>
                    {year}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {selectedUserForCalculation && ( // Tampilkan info berdasarkan state dialog
              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  Informasi Gaji:
                </Typography>
                <Typography>
                  Gaji Pokok: {formatCurrency(selectedUserForCalculation.basicSalary || 0)}
                </Typography>
                <Typography>
                  Tunjangan: {formatCurrency(selectedUserForCalculation.allowances || 0)}
                </Typography>
              </Box>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { 
            setCalculateDialogOpen(false);
            setSelectedUserForCalculation(null); // Reset pilihan dialog saat ditutup
            setCalculationUserSearchValue(''); // Reset input dialog saat ditutup
          }}>Batal</Button>
          <Button
            onClick={handleCalculatePayroll}
            variant="contained"
            disabled={calculateLoading || !selectedUserForCalculation || !calculateMonth || !calculateYear} // Disable berdasarkan state dialog
            startIcon={calculateLoading ? <CircularProgress size={20} /> : <CalculateIcon />}
          >
            {calculateLoading ? 'Menghitung...' : 'Hitung Gaji'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Process Payroll Dialog */}
      <Dialog open={processDialogOpen} onClose={() => setProcessDialogOpen(false)}>
        <DialogTitle>Proses Gaji</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Apakah Anda yakin ingin memproses gaji ini? Status gaji akan berubah dari draft menjadi diproses.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setProcessDialogOpen(false)}>Batal</Button>
          <Button 
            onClick={handleProcessPayroll} 
            variant="contained" 
            color="primary"
            disabled={processLoading}
          >
            {processLoading ? 'Memproses...' : 'Proses Gaji'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Pay Payroll Dialog */}
      <Dialog open={payDialogOpen} onClose={() => setPayDialogOpen(false)}>
        <DialogTitle>Tandai Gaji Sudah Dibayar</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Tandai gaji ini sebagai sudah dibayar. Status gaji akan berubah dari diproses menjadi dibayar.
          </DialogContentText>
          <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={id}>
            <DatePicker
              label="Tanggal Pembayaran"
              value={paymentDate}
              onChange={(newValue) => setPaymentDate(newValue)}
              renderInput={(params) => <TextField {...params} fullWidth sx={{ mb: 2 }} />}
              inputFormat="dd/MM/yyyy"
            />
          </LocalizationProvider>
          <TextField
            label="Catatan Pembayaran (opsional)"
            multiline
            rows={3}
            fullWidth
            value={paymentNotes}
            onChange={(e) => setPaymentNotes(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPayDialogOpen(false)}>Batal</Button>
          <Button 
            onClick={handlePayPayroll} 
            variant="contained" 
            color="success"
            disabled={payLoading || !paymentDate}
          >
            {payLoading ? 'Memproses...' : 'Tandai Sudah Dibayar'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default PayrollManagement;