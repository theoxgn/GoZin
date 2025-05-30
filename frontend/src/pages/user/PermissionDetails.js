import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  Grid,
  Paper,
  Typography,
  Alert,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';

function PermissionDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [permission, setPermission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchPermissionDetails();
  }, [id]);

  const fetchPermissionDetails = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`/api/permissions/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPermission(response.data);
      setError('');
    } catch (err) {
      console.error('Error fetching permission details:', err);
      const errorMessage = err.response?.data?.message || 'Gagal memuat detail perijinan';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setDeleting(true);
      const token = localStorage.getItem('token');
      await axios.delete(`/api/permissions/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDeleteDialogOpen(false);
      navigate('/permissions', { state: { message: 'Perijinan berhasil dihapus' } });
    } catch (err) {
      console.error('Error deleting permission:', err);
      const errorMessage = err.response?.data?.message || 'Gagal menghapus perijinan';
      setError(errorMessage);
      setDeleteDialogOpen(false);
    } finally {
      setDeleting(false);
    }
  };

  const getStatusChip = (status) => {
    switch (status) {
      case 'pending':
        return <Chip label="Pending" color="warning" />;
      case 'approved_by_approval':
        return <Chip label="Disetujui Approval" color="info" />;
      case 'approved':
        return <Chip label="Disetujui" color="success" />;
      case 'rejected':
        return <Chip label="Ditolak" color="error" />;
      default:
        return <Chip label={status} />;
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

  // Check if user can edit or delete this permission
  const canModify = permission && 
    (permission.status === 'pending') && 
    (user.id === permission.userId || user.role === 'admin');

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ py: 2 }}>
        <Button
          component={Link}
          to="/permissions"
          startIcon={<ArrowBackIcon />}
          sx={{ mb: 2 }}
        >
          Kembali ke Daftar Perijinan
        </Button>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  if (!permission) {
    return (
      <Box sx={{ py: 2 }}>
        <Button
          component={Link}
          to="/permissions"
          startIcon={<ArrowBackIcon />}
          sx={{ mb: 2 }}
        >
          Kembali ke Daftar Perijinan
        </Button>
        <Alert severity="warning">Perijinan tidak ditemukan</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ py: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Button
          component={Link}
          to="/permissions"
          startIcon={<ArrowBackIcon />}
        >
          Kembali ke Daftar Perijinan
        </Button>
        
        {canModify && (
          <Box>
            <Button
              variant="outlined"
              color="primary"
              startIcon={<EditIcon />}
              component={Link}
              to={`/permissions/edit/${id}`}
              sx={{ mr: 1 }}
            >
              Edit
            </Button>
            <Button
              variant="outlined"
              color="error"
              startIcon={<DeleteIcon />}
              onClick={() => setDeleteDialogOpen(true)}
            >
              Hapus
            </Button>
          </Box>
        )}
      </Box>

      <Typography variant="h4" component="h1" gutterBottom>
        Detail Perijinan
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardHeader title="Informasi Perijinan" />
            <Divider />
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="textSecondary">
                    ID Perijinan
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {permission.id}
                  </Typography>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Tipe Perijinan
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {getPermissionTypeLabel(permission.type)}
                  </Typography>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Tanggal Mulai
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {formatDate(permission.startDate)}
                  </Typography>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Tanggal Selesai
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {formatDate(permission.endDate)}
                  </Typography>
                </Grid>
                
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Status
                  </Typography>
                  <Box sx={{ mt: 0.5, mb: 1 }}>
                    {getStatusChip(permission.status)}
                  </Box>
                </Grid>
                
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Alasan
                  </Typography>
                  <Paper variant="outlined" sx={{ p: 2, mt: 0.5 }}>
                    <Typography variant="body1">
                      {permission.reason}
                    </Typography>
                  </Paper>
                </Grid>
                
                {permission.rejectionReason && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="error">
                      Alasan Penolakan
                    </Typography>
                    <Paper variant="outlined" sx={{ p: 2, mt: 0.5, borderColor: 'error.light' }}>
                      <Typography variant="body1" color="error">
                        {permission.rejectionReason}
                      </Typography>
                    </Paper>
                  </Grid>
                )}
              </Grid>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card>
            <CardHeader title="Informasi Approval" />
            <Divider />
            <CardContent>
              {permission.status !== 'pending' && permission.approvalId ? (
                <>
                  <Typography variant="subtitle2" color="textSecondary">
                    Disetujui/Ditolak oleh Approval
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {permission.approvalName || 'Approval'}
                  </Typography>
                  
                  {permission.approvalDate && (
                    <>
                      <Typography variant="subtitle2" color="textSecondary" sx={{ mt: 1 }}>
                        Tanggal Approval
                      </Typography>
                      <Typography variant="body1" gutterBottom>
                        {formatDate(permission.approvalDate)}
                      </Typography>
                    </>
                  )}
                  
                  {permission.approvalNote && (
                    <>
                      <Typography variant="subtitle2" color="textSecondary" sx={{ mt: 1 }}>
                        Catatan Approval
                      </Typography>
                      <Paper variant="outlined" sx={{ p: 2, mt: 0.5 }}>
                        <Typography variant="body1">
                          {permission.approvalNote}
                        </Typography>
                      </Paper>
                    </>
                  )}
                </>
              ) : (
                <Typography variant="body1" color="textSecondary">
                  Belum ada informasi approval
                </Typography>
              )}
              
              {(permission.status === 'approved' || permission.status === 'rejected') && permission.hrdId && (
                <Box sx={{ mt: 3 }}>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="subtitle2" color="textSecondary">
                    Disetujui/Ditolak oleh HRD
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {permission.hrdName || 'HRD'}
                  </Typography>
                  
                  {permission.hrdDate && (
                    <>
                      <Typography variant="subtitle2" color="textSecondary" sx={{ mt: 1 }}>
                        Tanggal HRD
                      </Typography>
                      <Typography variant="body1" gutterBottom>
                        {formatDate(permission.hrdDate)}
                      </Typography>
                    </>
                  )}
                  
                  {permission.hrdNote && (
                    <>
                      <Typography variant="subtitle2" color="textSecondary" sx={{ mt: 1 }}>
                        Catatan HRD
                      </Typography>
                      <Paper variant="outlined" sx={{ p: 2, mt: 0.5 }}>
                        <Typography variant="body1">
                          {permission.hrdNote}
                        </Typography>
                      </Paper>
                    </>
                  )}
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Konfirmasi Hapus</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Apakah Anda yakin ingin menghapus perijinan ini? Tindakan ini tidak dapat dibatalkan.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} disabled={deleting}>
            Batal
          </Button>
          <Button onClick={handleDelete} color="error" disabled={deleting}>
            {deleting ? <CircularProgress size={24} /> : 'Hapus'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default PermissionDetails;