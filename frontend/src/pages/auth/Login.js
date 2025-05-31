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
  InputAdornment,
  IconButton,
  Paper,
  Divider,
  useTheme,
} from '@mui/material';
import {
  LockOutlined,
  Email as EmailIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Login as LoginIcon,
} from '@mui/icons-material';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!email || !password) {
      setError('Email dan password harus diisi');
      return;
    }

    setLoading(true);
    try {
      const success = await login(email, password);
      if (success) {
        navigate('/');
      }
    } catch (err) {
      setError('Terjadi kesalahan saat login. Silakan coba lagi.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <Box className="auth-container">
      <Container maxWidth="sm">
        <Box sx={{ mb: 4, textAlign: 'center' }}>
          <Typography variant="h4" component="h1" fontWeight="700" color="primary.dark">
            Sistem Perijinan Karyawan
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
            Masuk untuk mengakses sistem perijinan
          </Typography>
        </Box>
        
        <Card className="auth-card">
          <CardContent sx={{ p: { xs: 3, md: 4 } }}>
            <Box className="auth-header">
              <Box 
                sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  bgcolor: 'primary.main', 
                  color: 'white',
                  width: 60,
                  height: 60,
                  borderRadius: '50%',
                  margin: '0 auto',
                  boxShadow: `0 4px 14px ${theme.palette.primary.main}40`,
                }}
              >
                <LockOutlined fontSize="large" />
              </Box>
              <Typography variant="h5" component="h1" fontWeight="600" sx={{ mt: 2 }}>
                Login
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Masukkan kredensial Anda untuk melanjutkan
              </Typography>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 3, mt: 2 }}>{error}</Alert>}

            <form onSubmit={handleSubmit} className="auth-form">
              <TextField
                label="Email"
                type="email"
                fullWidth
                variant="outlined"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />

              <TextField
                label="Password"
                type={showPassword ? 'text' : 'password'}
                fullWidth
                variant="outlined"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockOutlined color="action" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={handleTogglePasswordVisibility}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
                size="large"
                disabled={loading}
                sx={{ 
                  mt: 3, 
                  py: 1.5,
                  fontSize: '1rem',
                  fontWeight: 600,
                  boxShadow: `0 4px 14px ${theme.palette.primary.main}40`,
                }}
                startIcon={loading ? null : <LoginIcon />}
              >
                {loading ? <CircularProgress size={24} /> : 'Login'}
              </Button>

              <Box sx={{ mt: 3, textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  Belum memiliki akun?{' '}
                  <Link to="/register" style={{ 
                    color: theme.palette.primary.main,
                    textDecoration: 'none',
                    fontWeight: 600,
                  }}>
                    Daftar Sekarang
                  </Link>
                </Typography>
              </Box>
            </form>
          </CardContent>
        </Card>
        
        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            &copy; {new Date().getFullYear()} Sistem Perijinan Karyawan. All rights reserved.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}

export default Login;