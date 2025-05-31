import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  CircularProgress,
  Divider,
  Grid,
  MenuItem,
  TextField,
  Typography,
  Alert,
  Avatar,
  Paper,
  IconButton,
  Tooltip,
  Chip,
  Snackbar,
  useTheme,
} from '@mui/material';
import {
  Save as SaveIcon,
  Person as PersonIcon,
  Edit as EditIcon,
  Badge as BadgeIcon,
  Business as BusinessIcon,
  Email as EmailIcon,
  Work as WorkIcon,
  VerifiedUser as VerifiedUserIcon,
  Close as CloseIcon,
} from '@mui/icons-material';

function Profile() {
  const { user, updateProfile } = useAuth();
  const theme = useTheme();
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    department: user?.department || '',
    position: user?.position || '',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [avatarColor, setAvatarColor] = useState('#1976d2');

  useEffect(() => {
    // Generate a consistent color based on user name
    if (user?.name) {
      const colors = [
        theme.palette.primary.main,
        theme.palette.secondary.main,
        theme.palette.success.main,
        theme.palette.info.main,
        theme.palette.warning.main,
      ];
      const nameHash = user.name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
      setAvatarColor(colors[nameHash % colors.length]);
    }
  }, [user?.name, theme]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    // Validation
    if (!formData.name || !formData.email || !formData.department || !formData.position) {
      setError('Semua field harus diisi');
      return;
    }

    setLoading(true);
    try {
      const success = await updateProfile(formData);
      if (success) {
        setSuccess(true);
        setEditMode(false);
      }
    } catch (err) {
      console.error('Error updating profile:', err);
      setError('Terjadi kesalahan saat memperbarui profil');
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSuccess(false);
  };

  const getInitials = (name) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const getRoleLabel = (role) => {
    switch (role) {
      case 'user': return 'User';
      case 'approval': return 'Approval';
      case 'hrd': return 'HRD';
      case 'admin': return 'Administrator';
      default: return role || '';
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'user': return 'primary';
      case 'approval': return 'info';
      case 'hrd': return 'secondary';
      case 'admin': return 'error';
      default: return 'default';
    }
  };

  const departments = [
    'IT',
    'HR',
    'Finance',
    'Marketing',
    'Operations',
    'Sales',
    'Customer Service',
    'Research & Development',
  ];

  return (
    <Box sx={{ py: 2 }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
        <PersonIcon sx={{ mr: 1 }} /> Profil Saya
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Grid container spacing={3}>
        {/* Profile Summary Card */}
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', p: 3 }}>
            <Avatar
              sx={{
                width: 120,
                height: 120,
                bgcolor: avatarColor,
                fontSize: '3rem',
                mb: 2,
              }}
            >
              {user?.name ? getInitials(user.name) : 'U'}
            </Avatar>
            
            <Typography variant="h5" gutterBottom>
              {user?.name || 'User'}
            </Typography>
            
            <Chip 
              icon={<VerifiedUserIcon />} 
              label={getRoleLabel(user?.role)} 
              color={getRoleColor(user?.role)}
              sx={{ mb: 2 }}
            />
            
            <Box sx={{ width: '100%', mt: 2 }}>
              <Paper elevation={0} sx={{ p: 2, bgcolor: 'background.default', mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <EmailIcon color="action" sx={{ mr: 1 }} />
                  <Typography variant="body2" color="text.secondary">
                    Email
                  </Typography>
                </Box>
                <Typography variant="body1">{user?.email || '-'}</Typography>
              </Paper>
              
              <Paper elevation={0} sx={{ p: 2, bgcolor: 'background.default', mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <BusinessIcon color="action" sx={{ mr: 1 }} />
                  <Typography variant="body2" color="text.secondary">
                    Departemen
                  </Typography>
                </Box>
                <Typography variant="body1">{user?.department || '-'}</Typography>
              </Paper>
              
              <Paper elevation={0} sx={{ p: 2, bgcolor: 'background.default' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <WorkIcon color="action" sx={{ mr: 1 }} />
                  <Typography variant="body2" color="text.secondary">
                    Jabatan
                  </Typography>
                </Box>
                <Typography variant="body1">{user?.position || '-'}</Typography>
              </Paper>
            </Box>
          </Card>
        </Grid>

        {/* Edit Profile Card */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardHeader 
              title={
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Typography variant="h6">Informasi Profil</Typography>
                  <Tooltip title={editMode ? "Batal Edit" : "Edit Profil"}>
                    <IconButton onClick={() => setEditMode(!editMode)} color={editMode ? "error" : "primary"}>
                      {editMode ? <CloseIcon /> : <EditIcon />}
                    </IconButton>
                  </Tooltip>
                </Box>
              }
            />
            <Divider />
            <CardContent>
              <form onSubmit={handleSubmit}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Nama Lengkap"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      fullWidth
                      required
                      disabled={loading || !editMode}
                      InputProps={{
                        startAdornment: <PersonIcon color="action" sx={{ mr: 1 }} />,
                      }}
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      fullWidth
                      required
                      disabled={true} // Email cannot be changed
                      helperText="Email tidak dapat diubah"
                      InputProps={{
                        startAdornment: <EmailIcon color="action" sx={{ mr: 1 }} />,
                      }}
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <TextField
                      select
                      label="Departemen"
                      name="department"
                      value={formData.department}
                      onChange={handleChange}
                      fullWidth
                      required
                      disabled={loading || !editMode}
                      InputProps={{
                        startAdornment: <BusinessIcon color="action" sx={{ mr: 1 }} />,
                      }}
                    >
                      {departments.map((dept) => (
                        <MenuItem key={dept} value={dept}>
                          {dept}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Jabatan"
                      name="position"
                      value={formData.position}
                      onChange={handleChange}
                      fullWidth
                      required
                      disabled={loading || !editMode}
                      InputProps={{
                        startAdornment: <WorkIcon color="action" sx={{ mr: 1 }} />,
                      }}
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Role"
                      value={getRoleLabel(user?.role)}
                      fullWidth
                      disabled={true}
                      helperText="Role tidak dapat diubah"
                      InputProps={{
                        startAdornment: <VerifiedUserIcon color="action" sx={{ mr: 1 }} />,
                      }}
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Status"
                      value={user?.isActive ? 'Aktif' : 'Tidak Aktif'}
                      fullWidth
                      disabled={true}
                      helperText="Status tidak dapat diubah"
                      InputProps={{
                        startAdornment: <BadgeIcon color="action" sx={{ mr: 1 }} />,
                      }}
                    />
                  </Grid>
                  
                  {editMode && (
                    <Grid item xs={12} sx={{ mt: 2 }}>
                      <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                        disabled={loading}
                        sx={{ mr: 1 }}
                      >
                        {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
                      </Button>
                      <Button
                        variant="outlined"
                        color="error"
                        onClick={() => {
                          setEditMode(false);
                          // Reset form to original values
                          setFormData({
                            name: user?.name || '',
                            email: user?.email || '',
                            department: user?.department || '',
                            position: user?.position || '',
                          });
                        }}
                        disabled={loading}
                      >
                        Batal
                      </Button>
                    </Grid>
                  )}
                </Grid>
              </form>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Snackbar
        open={success}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        message="Profil berhasil diperbarui"
        action={
          <IconButton size="small" color="inherit" onClick={handleCloseSnackbar}>
            <CloseIcon fontSize="small" />
          </IconButton>
        }
      />
    </Box>
  );
}

export default Profile;