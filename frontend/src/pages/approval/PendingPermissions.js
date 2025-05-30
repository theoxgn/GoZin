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
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
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
import { FilterList as FilterListIcon } from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import idLocale from 'date-fns/locale/id';

function PendingPermissions() {
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  
  // Filter states
  const [filters, setFilters] = useState({
    type: '',
    startDate: null,
    endDate: null,
  });
  const [showFilters, setShowFilters] = useState(false);

  // Action states
  const [actionDialog, setActionDialog] = useState({
    open: false,
    type: '', // 'approve' or 'reject'
    permissionId: null,
    note: '',
    reason: '',
  });
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchPendingPermissions();
  }, [page, rowsPerPage, filters]);

  const fetchPendingPermissions = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const params = {
        page: page + 1, // API uses 1-based indexing
        limit: rowsPerPage,
      };
      
      // Add filters if they are set
      if (filters.type) params.type = filters.type;
      if (filters.startDate) params.startDate = filters.startDate.toISOString().split('T')[0];
      if (filters.endDate) params.endDate = filters.endDate.toISOString().split('T')[0];
      
      const response = await axios.get('/api/approvals/pending', {
        headers: { Authorization: `Bearer ${token}` },
        params,
      });
      
      setPermissions(response.data.permissions || response.data);
      setTotalCount(response.data.totalCount || response.data.length);
      setError('');
    } catch (err) {
      console.error('Error fetching pending permissions:', err);
      setError('Gagal memuat data perijinan pending');
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
      startDate: null,
      endDate: null,
    });
    setPage(0);
  };

  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };

  const openApproveDialog = (permissionId) => {
    setActionDialog({
      open: true,
      type: 'approve',
      permissionId,
      note: '',
      reason: '',
    });
  };

  const openRejectDialog = (permissionId) => {
    setActionDialog({
      open: true,
      type: 'reject',
      permissionId,
      note: '',
      reason: '',
    });
  };

  const closeActionDialog = () => {
    setActionDialog({
      open: false,
      type: '',
      permissionId: null,
      note: '',
      reason: '',
    });
  };

  const handleActionDialogChange = (e) => {
    const { name, value } = e.target;
    setActionDialog({
      ...actionDialog,
      [name]: value,
    });
  };

  const handleApprove = async () => {
    try {
      setProcessing(true);
      const token = localStorage.getItem('token');
      
      await axios.put(
        `/api/approvals/approve/${actionDialog.permissionId}`,
        { note: actionDialog.note },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Refresh the list
      fetchPendingPermissions();
      closeActionDialog();
    } catch (err) {
      console.error('Error approving permission:', err);
      setError('Gagal menyetujui perijinan');
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!actionDialog.reason) {
      setError('Alasan penolakan harus diisi');
      return;
    }

    try {
      setProcessing(true);
      const token = localStorage.getItem('token');
      
      await axios.put(
        `/api/approvals/reject/${actionDialog.permissionId}`,
        { 
          note: actionDialog.note,
          rejectionReason: actionDialog.reason 
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Refresh the list
      fetchPendingPermissions();
      closeActionDialog();
    } catch (err) {
      console.error('Error rejecting permission:', err);
      setError('Gagal menolak perijinan');
    } finally {
      setProcessing(false);
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
            Perijinan Menunggu Persetujuan
          </Typography>
        </Grid>
        <Grid item>
          <Button
            variant="outlined"
            startIcon={<FilterListIcon />}
            onClick={toggleFilters}
          >
            {showFilters ? 'Sembunyikan Filter' : 'Tampilkan Filter'}
          </Button>
        </Grid>
      </Grid>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {showFilters && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={4}>
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
              
              <Grid item xs={12} sm={4}>
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
              
              <Grid item xs={12} sm={4}>
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
                    <TableCell>Nama</TableCell>
                    <TableCell>Tipe</TableCell>
                    <TableCell>Tanggal</TableCell>
                    <TableCell>Alasan</TableCell>
                    <TableCell>Aksi</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {permissions.map((permission) => (
                    <TableRow hover key={permission.id}>
                      <TableCell>{permission.id}</TableCell>
                      <TableCell>{permission.userName || 'User'}</TableCell>
                      <TableCell>{getPermissionTypeLabel(permission.type)}</TableCell>
                      <TableCell>
                        {formatDate(permission.startDate)}
                        {permission.startDate !== permission.endDate && 
                          <><br />{`s/d ${formatDate(permission.endDate)}`}</>
                        }
                      </TableCell>
                      <TableCell>
                        {permission.reason.length > 50
                          ? `${permission.reason.substring(0, 50)}...`
                          : permission.reason}
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Button
                            variant="outlined"
                            size="small"
                            component={Link}
                            to={`/permissions/${permission.id}`}
                          >
                            Detail
                          </Button>
                          <Button
                            variant="contained"
                            color="success"
                            size="small"
                            onClick={() => openApproveDialog(permission.id)}
                          >
                            Setujui
                          </Button>
                          <Button
                            variant="contained"
                            color="error"
                            size="small"
                            onClick={() => openRejectDialog(permission.id)}
                          >
                            Tolak
                          </Button>
                        </Box>
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
              Tidak ada perijinan yang menunggu persetujuan
            </Typography>
          </Box>
        )}
      </Paper>

      {/* Approve/Reject Dialog */}
      <Dialog open={actionDialog.open} onClose={closeActionDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {actionDialog.type === 'approve' ? 'Setujui Perijinan' : 'Tolak Perijinan'}
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            {actionDialog.type === 'approve'
              ? 'Anda akan menyetujui perijinan ini. Tambahkan catatan jika diperlukan.'
              : 'Anda akan menolak perijinan ini. Harap berikan alasan penolakan.'}
          </DialogContentText>
          
          {actionDialog.type === 'reject' && (
            <TextField
              autoFocus
              margin="dense"
              name="reason"
              label="Alasan Penolakan"
              type="text"
              fullWidth
              multiline
              rows={3}
              value={actionDialog.reason}
              onChange={handleActionDialogChange}
              required
              error={actionDialog.type === 'reject' && !actionDialog.reason}
              helperText={actionDialog.type === 'reject' && !actionDialog.reason ? 'Alasan penolakan harus diisi' : ''}
              sx={{ mb: 2 }}
            />
          )}
          
          <TextField
            margin="dense"
            name="note"
            label="Catatan (Opsional)"
            type="text"
            fullWidth
            multiline
            rows={2}
            value={actionDialog.note}
            onChange={handleActionDialogChange}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={closeActionDialog} disabled={processing}>
            Batal
          </Button>
          <Button 
            onClick={actionDialog.type === 'approve' ? handleApprove : handleReject} 
            color={actionDialog.type === 'approve' ? 'success' : 'error'}
            variant="contained"
            disabled={processing || (actionDialog.type === 'reject' && !actionDialog.reason)}
          >
            {processing ? <CircularProgress size={24} /> : 
              actionDialog.type === 'approve' ? 'Setujui' : 'Tolak'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default PendingPermissions;