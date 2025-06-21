import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
  Chip,
  CircularProgress,
  Alert,
  Paper,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Avatar,
} from '@mui/material';
import { format } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';
import {
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Pending as PendingIcon,
  CalendarToday as CalendarTodayIcon,
  AccessTime as AccessTimeIcon,
  Person as PersonIcon,
  Comment as CommentIcon,
  ArrowBack as ArrowBackIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
} from '@mui/icons-material';

function PermissionDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [permission, setPermission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelLoading, setCancelLoading] = useState(false);
  const [cancelError, setCancelError] = useState('');

  useEffect(() => {
    console.log('PermissionDetail mounted with id:', id);
    fetchPermissionDetail();
  }, [id]);

  const fetchPermissionDetail = async () => {
    try {
      setLoading(true);
      console.log('Fetching permission with id:', id);
      const response = await api.get(`/api/permissions/${id}`);
      console.log('API Response:', response.data);
      if (response.data && response.data.permission) {
        console.log('Setting permission data:', response.data.permission);
        setPermission(response.data.permission);
      } else {
        console.error('Invalid response format or no permission data in response.data.permission');
        setError('Gagal memuat detail perijinan: Invalid data format');
      }
    } catch (err) {
      console.error('Error fetching permission detail:', err);
      setError('Gagal memuat detail perijinan');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelPermission = async () => {
    if (!cancelReason.trim()) {
      setCancelError('Alasan pembatalan harus diisi');
      return;
    }

    try {
      setCancelLoading(true);
      setCancelError('');
      await api.post(`/api/permissions/${id}/cancel`, { cancelReason });
      setCancelDialogOpen(false);
      // Refresh data
      fetchPermissionDetail();
    } catch (err) {
      console.error('Error canceling permission:', err);
      setCancelError(err.response?.data?.message || 'Gagal membatalkan perijinan');
    } finally {
      setCancelLoading(false);
    }
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
      case 'canceled':
        return <Chip label="Dibatalkan" color="default" size="small" icon={<CancelIcon />} />;
      default:
        return <Chip label={status} size="small" />;
    }
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

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return format(new Date(dateString), 'dd MMMM yyyy', { locale: idLocale });
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return '-';
    return format(new Date(dateString), 'dd MMM yyyy, HH:mm', { locale: idLocale });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'warning';
      case 'approved_by_approval':
        return 'info';
      case 'approved':
        return 'success';
      case 'rejected':
      case 'canceled':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <PendingIcon />;
      case 'approved_by_approval':
      case 'approved':
        return <CheckCircleIcon />;
      case 'rejected':
      case 'canceled':
        return <CancelIcon />;
      default:
        return <PersonIcon />;
    }
  };

  // Custom Timeline Component using Material-UI components
  const CustomTimeline = ({ children }) => (
    <Box sx={{ position: 'relative', pl: 2 }}>
      {children}
    </Box>
  );

  const CustomTimelineItem = ({ icon, color, time, title, subtitle, isLast = false }) => (
    <Box sx={{ position: 'relative', pb: isLast ? 0 : 3 }}>
      {/* Timeline line */}
      {!isLast && (
        <Box
          sx={{
            position: 'absolute',
            left: 19,
            top: 40,
            bottom: -12,
            width: 2,
            bgcolor: 'divider',
          }}
        />
      )}
      
      {/* Timeline dot */}
      <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
        <Avatar
          sx={{
            width: 40,
            height: 40,
            bgcolor: `${color}.main`,
            mr: 2,
            zIndex: 1,
          }}
        >
          {icon}
        </Avatar>
        
        {/* Content */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 0.5 }}>
            <Typography variant="body1" component="span" sx={{ fontWeight: 'medium' }}>
              {title}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ ml: 1, flexShrink: 0 }}>
              {time}
            </Typography>
          </Box>
          {subtitle && (
            <Typography variant="body2" color="text.secondary">
              {subtitle}
            </Typography>
          )}
        </Box>
      </Box>
    </Box>
  );

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ py: 3 }}>
        <Alert severity="error">{error}</Alert>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/permissions')}
          sx={{ mt: 2 }}
        >
          Kembali ke Daftar Perijinan
        </Button>
      </Box>
    );
  }

  if (!permission) {
    return (
      <Box sx={{ py: 3 }}>
        <Alert severity="warning">Data perijinan tidak ditemukan</Alert>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/permissions')}
          sx={{ mt: 2 }}
        >
          Kembali ke Daftar Perijinan
        </Button>
      </Box>
    );
  }

  const canCancel = permission.status === 'pending' || permission.status === 'approved_by_approval';

  // Timeline data
  const timelineItems = [
    {
      icon: <PersonIcon />,
      color: 'primary',
      time: formatDateTime(permission.createdAt),
      title: 'Diajukan',
      subtitle: `Oleh: ${permission.user?.name || 'Anda'}`,
    },
  ];

  if (permission.status !== 'pending') {
    timelineItems.push({
      icon: getStatusIcon(permission.status),
      color: getStatusColor(permission.status),
      time: formatDateTime(permission.approvalDate || permission.rejectionDate || permission.cancelDate),
      title: permission.status === 'approved_by_approval' ? 'Disetujui Approval' : 
             permission.status === 'approved' ? 'Disetujui' : 
             permission.status === 'rejected' ? 'Ditolak' : 'Dibatalkan',
      subtitle: permission.status === 'approved_by_approval' ? `Oleh: ${permission.approvalUser?.name || 'Approval'}` :
                permission.status === 'approved' ? `Oleh: ${permission.hrdUser?.name || 'HRD'}` :
                permission.status === 'rejected' ? `Oleh: ${permission.rejectionUser?.name || 'Admin'}` :
                'Oleh: Anda',
    });
  }

  if (permission.status === 'approved_by_approval') {
    timelineItems.push({
      icon: <PendingIcon />,
      color: 'warning',
      time: 'Menunggu',
      title: 'Menunggu Persetujuan HRD',
      subtitle: '',
    });
  }

  return (
    <Box className="permission-detail-container">
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <IconButton 
          onClick={() => navigate('/permissions')} 
          sx={{ mr: 2 }}
          aria-label="kembali"
        >
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4" component="h1" className="permission-detail-title">
          Detail Perijinan
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Main Info Card */}
        <Grid item xs={12} md={8}>
          <Card className="permission-detail-card">
            <CardHeader 
              title={
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Typography variant="h6">
                    {getPermissionTypeLabel(permission.type)}
                  </Typography>
                  {getStatusChip(permission.status)}
                </Box>
              } 
            />
            <Divider />
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <CalendarTodayIcon color="action" sx={{ mr: 1 }} />
                    <Typography variant="body2" color="text.secondary">
                      Tanggal Mulai
                    </Typography>
                  </Box>
                  <Typography variant="body1">
                    {formatDate(permission.startDate)}
                    {permission.startTime && (
                      <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center', ml: 1 }}>
                        <AccessTimeIcon fontSize="small" color="action" sx={{ mr: 0.5 }} />
                        {permission.startTime}
                      </Box>
                    )}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <CalendarTodayIcon color="action" sx={{ mr: 1 }} />
                    <Typography variant="body2" color="text.secondary">
                      Tanggal Selesai
                    </Typography>
                  </Box>
                  <Typography variant="body1">
                    {formatDate(permission.endDate)}
                    {permission.endTime && (
                      <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center', ml: 1 }}>
                        <AccessTimeIcon fontSize="small" color="action" sx={{ mr: 0.5 }} />
                        {permission.endTime}
                      </Box>
                    )}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 1 }}>
                    <CommentIcon color="action" sx={{ mr: 1, mt: 0.5 }} />
                    <Typography variant="body2" color="text.secondary">
                      Alasan
                    </Typography>
                  </Box>
                  <Paper variant="outlined" sx={{ p: 2, bgcolor: 'background.paper' }}>
                    <Typography variant="body1">
                      {permission.reason || '-'}
                    </Typography>
                  </Paper>
                </Grid>
                {permission.cancelReason && (
                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 1 }}>
                      <CancelIcon color="error" sx={{ mr: 1, mt: 0.5 }} />
                      <Typography variant="body2" color="error">
                        Alasan Pembatalan
                      </Typography>
                    </Box>
                    <Paper variant="outlined" sx={{ p: 2, bgcolor: 'error.lightest' }}>
                      <Typography variant="body1" color="error.main">
                        {permission.cancelReason}
                      </Typography>
                    </Paper>
                  </Grid>
                )}
                {permission.rejectionReason && (
                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 1 }}>
                      <CancelIcon color="error" sx={{ mr: 1, mt: 0.5 }} />
                      <Typography variant="body2" color="error">
                        Alasan Penolakan
                      </Typography>
                    </Box>
                    <Paper variant="outlined" sx={{ p: 2, bgcolor: 'error.lightest' }}>
                      <Typography variant="body1" color="error.main">
                        {permission.rejectionReason}
                      </Typography>
                    </Paper>
                  </Grid>
                )}
              </Grid>
            </CardContent>
            {canCancel && (
              <>
                <Divider />
                <Box sx={{ p: 2, display: 'flex', justifyContent: 'flex-end' }}>
                  <Button
                    variant="outlined"
                    color="error"
                    startIcon={<CancelIcon />}
                    onClick={() => setCancelDialogOpen(true)}
                  >
                    Batalkan Perijinan
                  </Button>
                </Box>
              </>
            )}
          </Card>
        </Grid>

        {/* Status Timeline Card */}
        <Grid item xs={12} md={4}>
          <Card className="permission-detail-card">
            <CardHeader title="Riwayat Status" />
            <Divider />
            <CardContent>
              <CustomTimeline>
                {timelineItems.map((item, index) => (
                  <CustomTimelineItem
                    key={index}
                    icon={item.icon}
                    color={item.color}
                    time={item.time}
                    title={item.title}
                    subtitle={item.subtitle}
                    isLast={index === timelineItems.length - 1}
                  />
                ))}
              </CustomTimeline>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Cancel Dialog */}
      <Dialog open={cancelDialogOpen} onClose={() => setCancelDialogOpen(false)}>
        <DialogTitle>Batalkan Perijinan</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Apakah Anda yakin ingin membatalkan perijinan ini? Tindakan ini tidak dapat dibatalkan.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            label="Alasan Pembatalan"
            fullWidth
            multiline
            rows={3}
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
            error={!!cancelError}
            helperText={cancelError}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCancelDialogOpen(false)} disabled={cancelLoading}>
            Batal
          </Button>
          <Button 
            onClick={handleCancelPermission} 
            color="error" 
            disabled={cancelLoading}
            startIcon={cancelLoading ? <CircularProgress size={20} /> : <DeleteIcon />}
          >
            {cancelLoading ? 'Memproses...' : 'Batalkan'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default PermissionDetail;