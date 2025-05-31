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
  alpha,
} from '@mui/material';
import {
  LockOutlined,
  Email as EmailIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Login as LoginIcon,
  Business as BusinessIcon,
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
    <Box 
      className="auth-container"
      sx={{
        background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.primary.light, 0.2)} 100%)`,
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        py: 4,
      }}
    >
      <Container maxWidth="sm">
        <Box 
          sx={{ 
            mb: 4, 
            textAlign: 'center',
            animation: 'fadeInDown 0.8s ease-out',
          }}
        >
          <Box
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 80,
              height: 80,
              mb: 2,
            }}
          >
            <img 
              src="/main-logo.png" 
              alt="Logo" 
              style={{ 
                width: '100%', 
                height: '100%', 
                objectFit: 'contain' 
              }} 
            />
          </Box>
          <Typography 
            variant="h4" 
            component="h1" 
            fontWeight="700" 
            color="primary.dark"
            sx={{ mb: 1 }}
          >
            Sistem Perijinan Karyawan
          </Typography>
          <Typography 
            variant="body1" 
            color="text.secondary"
            sx={{ 
              maxWidth: '400px',
              mx: 'auto',
              opacity: 0.8,
            }}
          >
            Masuk untuk mengakses sistem perijinan karyawan
          </Typography>
        </Box>
        
        <Card 
          className="auth-card"
          sx={{
            margin: '0 auto',
            borderRadius: 4,
            boxShadow: `0 12px 32px ${alpha(theme.palette.common.black, 0.1)}`,
            backdropFilter: 'blur(10px)',
            animation: 'fadeInUp 0.8s ease-out',
          }}
        >
          <CardContent sx={{ p: { xs: 3, md: 4 } }}>
            <Box 
              className="auth-header"
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                mb: 4,
              }}
            >
              <Box 
                sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  bgcolor: 'primary.main', 
                  color: 'white',
                  width: 64,
                  height: 64,
                  borderRadius: '50%',
                  mb: 2,
                  boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.3)}`,
                }}
              >
                <LockOutlined sx={{ fontSize: 32 }} />
              </Box>
              <Typography 
                variant="h5" 
                component="h2" 
                fontWeight="600"
                sx={{ mb: 1 }}
              >
                Login
              </Typography>
              <Typography 
                variant="body2" 
                color="text.secondary"
                sx={{ opacity: 0.8 }}
              >
                Masukkan kredensial Anda untuk melanjutkan
              </Typography>
            </Box>

            {error && (
              <Alert 
                severity="error" 
                sx={{ 
                  mb: 3,
                  borderRadius: 2,
                  animation: 'shake 0.5s ease-in-out',
                }}
              >
                {error}
              </Alert>
            )}

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
                sx={{
                  mb: 2,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    transition: 'all 0.2s',
                    '&:hover': {
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'primary.main',
                      },
                    },
                  },
                }}
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
                sx={{
                  mb: 3,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    transition: 'all 0.2s',
                    '&:hover': {
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'primary.main',
                      },
                    },
                  },
                }}
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
                        sx={{
                          color: 'text.secondary',
                          '&:hover': {
                            color: 'primary.main',
                          },
                        }}
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
                  py: 1.5,
                  borderRadius: 2,
                  fontSize: '1rem',
                  fontWeight: 600,
                  textTransform: 'none',
                  boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.3)}`,
                  transition: 'all 0.2s',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: `0 12px 28px ${alpha(theme.palette.primary.main, 0.4)}`,
                  },
                }}
                startIcon={loading ? null : <LoginIcon />}
              >
                {loading ? <CircularProgress size={24} /> : 'Login'}
              </Button>

              <Box 
                sx={{ 
                  mt: 3, 
                  textAlign: 'center',
                  animation: 'fadeIn 1s ease-out',
                }}
              >
                <Typography 
                  variant="body2" 
                  color="text.secondary"
                  sx={{ opacity: 0.8 }}
                >
                  Belum memiliki akun?{' '}
                  <Link 
                    to="/register" 
                    style={{ 
                      color: theme.palette.primary.main,
                      textDecoration: 'none',
                      fontWeight: 600,
                      transition: 'all 0.2s',
                      '&:hover': {
                        color: theme.palette.primary.dark,
                      },
                    }}
                  >
                    Daftar Sekarang
                  </Link>
                </Typography>
              </Box>
            </form>
          </CardContent>
        </Card>
        
        <Box 
          sx={{ 
            mt: 4, 
            textAlign: 'center',
            animation: 'fadeIn 1.2s ease-out',
          }}
        >
          <Typography 
            variant="body2" 
            color="text.secondary"
            sx={{ opacity: 0.7 }}
          >
            &copy; {new Date().getFullYear()} Sistem Perijinan Karyawan. All rights reserved.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}

export default Login;