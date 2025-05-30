import React, { useState } from 'react';
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
} from '@mui/material';
import { Save as SaveIcon, Person as PersonIcon } from '@mui/icons-material';

function Profile() {
  const { user, updateProfile } = useAuth();
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    department: user?.department || '',
    position: user?.position || '',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

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
      }
    } catch (err) {
      console.error('Error updating profile:', err);
      setError('Terjadi kesalahan saat memperbarui profil');
    } finally {
      setLoading(false);
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
      <Typography variant="h4" component="h1" gutterBottom>
        Profil Saya
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>Profil berhasil diperbarui</Alert>}

      <Card>
        <CardHeader 
          title="Informasi Profil" 
          avatar={<PersonIcon color="primary" />}
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
                  disabled={loading}
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
                  disabled={loading}
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
                  disabled={loading}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Role"
                  value={(() => {
                    switch (user?.role) {
                      case 'user': return 'User';
                      case 'approval': return 'Approval';
                      case 'hrd': return 'HRD';
                      case 'admin': return 'Administrator';
                      default: return user?.role || '';
                    }
                  })()}
                  fullWidth
                  disabled={true}
                  helperText="Role tidak dapat diubah"
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Status"
                  value={user?.isActive ? 'Aktif' : 'Tidak Aktif'}
                  fullWidth
                  disabled={true}
                  helperText="Status tidak dapat diubah"
                />
              </Grid>
              
              <Grid item xs={12} sx={{ mt: 2 }}>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  startIcon={<SaveIcon />}
                  disabled={loading}
                >
                  {loading ? <CircularProgress size={24} /> : 'Simpan Perubahan'}
                </Button>
              </Grid>
            </Grid>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
}

export default Profile;