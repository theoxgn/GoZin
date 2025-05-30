import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  TextField,
  Typography,
  CircularProgress,
  Alert,
  MenuItem,
  Grid,
} from '@mui/material';
import { PersonAddOutlined } from '@mui/icons-material';

function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    department: '',
    position: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

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

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Password dan konfirmasi password tidak cocok');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password harus minimal 6 karakter');
      return;
    }

    setLoading(true);
    try {
      // Remove confirmPassword before sending to API
      const { confirmPassword, ...userData } = formData;
      // Set default role to 'user'
      userData.role = 'user';
      
      const success = await register(userData);
      if (success) {
        navigate('/login');
      }
    } catch (err) {
      setError('Terjadi kesalahan saat registrasi. Silakan coba lagi.');
      console.error(err);
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
    <Box className="auth-container">
      <Container maxWidth="sm">
        <Card className="auth-card">
          <CardContent>
            <Box className="auth-header">
              <PersonAddOutlined fontSize="large" color="primary" />
              <Typography variant="h4" component="h1" gutterBottom>
                Register
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Daftar Akun Sistem Perijinan Karyawan
              </Typography>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            <form onSubmit={handleSubmit} className="auth-form">
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    label="Nama Lengkap"
                    name="name"
                    fullWidth
                    variant="outlined"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    disabled={loading}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    label="Email"
                    name="email"
                    type="email"
                    fullWidth
                    variant="outlined"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    disabled={loading}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Password"
                    name="password"
                    type="password"
                    fullWidth
                    variant="outlined"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    disabled={loading}
                    helperText="Minimal 6 karakter"
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Konfirmasi Password"
                    name="confirmPassword"
                    type="password"
                    fullWidth
                    variant="outlined"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    disabled={loading}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    select
                    label="Departemen"
                    name="department"
                    fullWidth
                    variant="outlined"
                    value={formData.department}
                    onChange={handleChange}
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
                    fullWidth
                    variant="outlined"
                    value={formData.position}
                    onChange={handleChange}
                    required
                    disabled={loading}
                  />
                </Grid>
              </Grid>

              <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
                size="large"
                disabled={loading}
                sx={{ mt: 3 }}
              >
                {loading ? <CircularProgress size={24} /> : 'Register'}
              </Button>

              <Box sx={{ mt: 2, textAlign: 'center' }}>
                <Typography variant="body2">
                  Sudah punya akun?{' '}
                  <Link to="/login" style={{ textDecoration: 'none' }}>
                    Login disini
                  </Link>
                </Typography>
              </Box>
            </form>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}

export default Register;