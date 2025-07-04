import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import {
  AppBar,
  Box,
  CssBaseline,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  Button,
  Container,
  Menu,
  MenuItem,
  Avatar,
  useMediaQuery,
  Tooltip,
  Badge,
  Fade,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  ListAlt as ListAltIcon,
  Add as AddIcon,
  Person as PersonIcon,
  Settings as SettingsIcon,
  SupervisorAccount as SupervisorAccountIcon,
  Business as BusinessIcon,
  AdminPanelSettings as AdminPanelSettingsIcon,
  Group as GroupIcon,
  Logout as LogoutIcon,
  VpnKey as VpnKeyIcon,
  Notifications as NotificationsIcon,
  ChevronLeft as ChevronLeftIcon,
  AccessTime as AccessTimeIcon,
  Receipt as ReceiptIcon,
  MonetizationOn as MonetizationOnIcon,
  AssessmentOutlined as AssessmentOutlinedIcon,
} from '@mui/icons-material';

const drawerWidth = 260;

function MainLayout() {
  const { user, logout } = useAuth();
  const { notifications, unreadCount, loading: notificationLoading, markAsRead, markAllAsRead, formatRelativeTime } = useNotification();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [notificationAnchorEl, setNotificationAnchorEl] = useState(null);
  const [miniDrawer, setMiniDrawer] = useState(false);

  // Close mobile drawer when route changes
  useEffect(() => {
    if (mobileOpen) {
      setMobileOpen(false);
    }
  }, [location.pathname]);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleMiniDrawer = () => {
    setMiniDrawer(!miniDrawer);
  };

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationMenuOpen = (event) => {
    setNotificationAnchorEl(event.currentTarget);
  };

  const handleNotificationMenuClose = () => {
    setNotificationAnchorEl(null);
  };
  
  const handleNotificationClick = (notificationId) => {
    markAsRead(notificationId);
    handleNotificationMenuClose();
  };
  
  const handleMarkAllAsRead = () => {
    markAllAsRead();
  };

  const handleLogout = () => {
    handleProfileMenuClose();
    logout();
    navigate('/login');
  };

  // Helper function to get user display name with fallback
  const getUserDisplayName = () => {
    if (!user) return 'User';
    return user.name || user.email || 'User';
  };

  // Helper function to get user initials with fallback
  const getUserInitials = () => {
    const displayName = getUserDisplayName();
    return displayName.charAt(0).toUpperCase();
  };

  // Helper function to check if a menu item is active
  const isMenuItemActive = (path) => {
    const currentPath = location.pathname;
    
    // Debug log (remove in production)
    // console.log('Checking path:', path, 'against current:', currentPath);
    
    // Special case untuk root/dashboard
    if (path === '/') {
      return currentPath === '/';
    }
    
    // Exact match - paling prioritas
    if (currentPath === path) {
      return true;
    }
    
    // Sub-path match - hanya untuk parent paths, bukan sibling paths
    // Contoh: "/permissions" active untuk "/permissions/create", "/permissions/123"
    // Tapi "/permissions/create" TIDAK active untuk "/permissions"
    if (currentPath.startsWith(path + '/')) {
      return true;
    }
    
    return false;
  };

  const menuItems = [
    // User Menu Items - Available to all authenticated users except admin
    ...(user && user.role !== 'admin' ? [
      { text: 'Dashboard', icon: <DashboardIcon />, path: '/' },
      { text: 'Daftar Perijinan', icon: <ListAltIcon />, path: '/permissions' },
      { text: 'Buat Perijinan', icon: <AddIcon />, path: '/permissions/create' },
      { text: 'Absensi', icon: <AccessTimeIcon />, path: '/attendance' },
      { text: 'Slip Gaji', icon: <ReceiptIcon />, path: '/payslip' },
    ] : []),
    
    // Divider for role-specific menus
    ...(user && user.role !== 'admin' ? [{ divider: true }] : []),
    
    // Approval Menu Items
    ...(user && user.role === 'approval' ? [
      { text: 'Approval Dashboard', icon: <SupervisorAccountIcon />, path: '/approval' },
      { text: 'Perijinan Pending', icon: <ListAltIcon />, path: '/approval/pending' },
    ] : []),
    
    // HRD Menu Items
    ...(user && user.role === 'hrd' ? [
      { text: 'HRD Dashboard', icon: <BusinessIcon />, path: '/hrd' },
      { text: 'Perijinan Disetujui Approval', icon: <ListAltIcon />, path: '/hrd/pending' },
      { text: 'Laporan Absensi', icon: <AssessmentOutlinedIcon />, path: '/hrd/attendance' },
      { text: 'Konfigurasi Absensi', icon: <SettingsIcon />, path: '/hrd/attendance-config' },
      { text: 'Manajemen Penggajian', icon: <MonetizationOnIcon />, path: '/hrd/payroll' },
    ] : []),
    
    // Admin Menu Items
    ...(user && user.role === 'admin' ? [
      { text: 'Admin Dashboard', icon: <AdminPanelSettingsIcon />, path: '/admin' },
      { text: 'Manajemen User', icon: <GroupIcon />, path: '/admin/users' },
      { text: 'Konfigurasi Perijinan', icon: <SettingsIcon />, path: '/admin/config' },
    ] : []),
  ];

  const drawer = (
    <div>
      <Toolbar sx={{ 
        display: 'flex', 
        justifyContent: miniDrawer ? 'center' : 'space-between',
        px: miniDrawer ? 1 : 2,
        py: 1.5,
      }}>
        {!miniDrawer && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <img 
              src="/main-logo.png" 
              alt="Logo" 
              style={{ 
                width: '32px', 
                height: '32px', 
                objectFit: 'contain' 
              }} 
            />
            <Typography variant="h6" noWrap component="div" sx={{ fontWeight: 700 }}>
              Sistem Perijinan
            </Typography>
          </Box>
        )}
        {!isMobile && (
          <IconButton onClick={handleMiniDrawer} size="small" sx={{ ml: miniDrawer ? 0 : 'auto' }}>
            <ChevronLeftIcon />
          </IconButton>
        )}
      </Toolbar>
      <Divider />
      <List sx={{ px: miniDrawer ? 1 : 2, py: 1 }}>
        {menuItems.map((item, index) => (
          item.divider ? (
            <Divider key={`divider-${index}`} sx={{ my: 1.5 }} />
          ) : (
            <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
              <Tooltip title={miniDrawer ? item.text : ''} placement="right" arrow>
                <ListItemButton 
                  component={Link} 
                  to={item.path} 
                  onClick={() => isMobile && setMobileOpen(false)}
                  selected={isMenuItemActive(item.path)}
                  sx={{
                    borderRadius: '10px',
                    minHeight: '48px',
                    justifyContent: miniDrawer ? 'center' : 'flex-start',
                  }}
                >
                  <ListItemIcon sx={{ 
                    minWidth: miniDrawer ? 0 : 40, 
                    mr: miniDrawer ? 0 : 2,
                    justifyContent: 'center',
                  }}>
                    {item.icon}
                  </ListItemIcon>
                  {!miniDrawer && <ListItemText primary={item.text} />}
                </ListItemButton>
              </Tooltip>
            </ListItem>
          )
        ))}
      </List>
    </div>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          width: { 
            xs: '100%',
            md: miniDrawer ? `calc(100% - ${theme.spacing(9)})` : `calc(100% - ${drawerWidth}px)` 
          },
          ml: { 
            xs: 0,
            md: miniDrawer ? theme.spacing(9) : drawerWidth 
          },
          bgcolor: 'background.paper',
          color: 'text.primary',
          borderBottom: '1px solid',
          borderColor: 'divider',
          borderRadius: 0, // Hilangkan rounded corners pada AppBar
          // Override semua rounded corners yang mungkin diterapkan oleh MUI
          '& .MuiToolbar-root': {
            borderRadius: 0,
          },
        }}
      >
        <Toolbar sx={{ 
          justifyContent: 'space-between',
          borderRadius: 0, // Hilangkan rounded corners pada Toolbar
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2, display: { md: 'none' } }}
            >
              <MenuIcon />
            </IconButton>
            <Typography 
              variant="h6" 
              noWrap 
              component="div" 
              sx={{ 
                display: { xs: 'none', sm: 'block' },
                fontWeight: 600,
              }}
            >
              Sistem Perijinan Karyawan
            </Typography>
          </Box>
          
          {user && (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Tooltip title="Notifikasi">
                <IconButton 
                  color="inherit" 
                  sx={{ mr: 1 }}
                  onClick={handleNotificationMenuOpen}
                >
                  <Badge badgeContent={unreadCount} color="error">
                    <NotificationsIcon />
                  </Badge>
                </IconButton>
              </Tooltip>
              
              <Menu
                anchorEl={notificationAnchorEl}
                open={Boolean(notificationAnchorEl)}
                onClose={handleNotificationMenuClose}
                TransitionComponent={Fade}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'right',
                }}
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                PaperProps={{
                  elevation: 3,
                  sx: { 
                    mt: 1.5, 
                    width: 320,
                    borderRadius: 2,
                    overflow: 'hidden',
                    maxHeight: '70vh',
                  }
                }}
              >
                <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="subtitle1" fontWeight={600}>Notifikasi</Typography>
                  {unreadCount > 0 && (
                    <Button 
                      size="small" 
                      onClick={handleMarkAllAsRead}
                      sx={{ textTransform: 'none' }}
                    >
                      Tandai Semua Dibaca
                    </Button>
                  )}
                </Box>
                
                {notificationLoading ? (
                  <Box sx={{ p: 3, textAlign: 'center' }}>
                    <Typography variant="body2" color="text.secondary">Memuat notifikasi...</Typography>
                  </Box>
                ) : notifications.length === 0 ? (
                  <Box sx={{ p: 3, textAlign: 'center' }}>
                    <Typography variant="body2" color="text.secondary">Tidak ada notifikasi</Typography>
                  </Box>
                ) : (
                  <Box sx={{ maxHeight: '50vh', overflow: 'auto' }}>
                    {notifications.map((notification) => (
                      <MenuItem 
                        key={notification.id} 
                        onClick={() => handleNotificationClick(notification.id)} 
                        sx={{ 
                          py: 2,
                          bgcolor: notification.isRead ? 'transparent' : 'action.hover',
                          borderLeft: notification.isRead ? 'none' : `4px solid ${theme.palette.primary.main}`,
                        }}
                      >
                        <Box>
                          <Typography variant="body2" fontWeight={notification.isRead ? 400 : 600}>
                            {notification.title}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                            {notification.message}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                            {formatRelativeTime(notification.createdAt)}
                          </Typography>
                        </Box>
                      </MenuItem>
                    ))}
                  </Box>
                )}
                
                <Box sx={{ p: 1.5, borderTop: '1px solid', borderColor: 'divider', textAlign: 'center' }}>
                  <Typography 
                    variant="body2" 
                    color="primary" 
                    sx={{ cursor: 'pointer', fontWeight: 500 }}
                    onClick={() => {
                      handleNotificationMenuClose();
                      // Tambahkan navigasi ke halaman notifikasi jika ada
                    }}
                  >
                    Lihat Semua Notifikasi
                  </Typography>
                </Box>
              </Menu>
              
              <Button 
                color="inherit" 
                onClick={handleProfileMenuOpen} 
                startIcon={
                  <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                    {getUserInitials()}
                  </Avatar>
                }
                endIcon={null}
                sx={{ 
                  borderRadius: 2,
                  textTransform: 'none',
                  ml: 1,
                  '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.04)' },
                }}
              >
                <Box sx={{ display: { xs: 'none', sm: 'block' }, ml: 1, textAlign: 'left' }}>
                  <Typography variant="body2" fontWeight={600} lineHeight={1.2}>
                    {getUserDisplayName()}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" lineHeight={1}>
                    {user.role === 'admin' ? 'Administrator' : 
                     user.role === 'approval' ? 'Approval' : 
                     user.role === 'hrd' ? 'HRD' : 'Karyawan'}
                  </Typography>
                </Box>
              </Button>
              
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleProfileMenuClose}
                TransitionComponent={Fade}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'right',
                }}
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                PaperProps={{
                  elevation: 3,
                  sx: { mt: 1.5, borderRadius: 2 }
                }}
              >
                <MenuItem component={Link} to="/profile" onClick={handleProfileMenuClose} sx={{ py: 1.5 }}>
                  <ListItemIcon>
                    <PersonIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText primary="Profil" />
                </MenuItem>
                <MenuItem component={Link} to="/change-password" onClick={handleProfileMenuClose} sx={{ py: 1.5 }}>
                  <ListItemIcon>
                    <VpnKeyIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText primary="Ubah Password" />
                </MenuItem>
                <Divider />
                <MenuItem onClick={handleLogout} sx={{ py: 1.5 }}>
                  <ListItemIcon>
                    <LogoutIcon fontSize="small" color="error" />
                  </ListItemIcon>
                  <ListItemText primary="Logout" sx={{ color: 'error.main' }} />
                </MenuItem>
              </Menu>
            </Box>
          )}
        </Toolbar>
      </AppBar>
      <Box
        component="nav"
        sx={{ 
          width: { md: miniDrawer ? theme.spacing(9) : drawerWidth }, 
          flexShrink: { md: 0 } 
        }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth,
              borderRight: 'none',
            },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: miniDrawer ? theme.spacing(9) : drawerWidth,
              borderRight: 'none',
              transition: theme.transitions.create('width', {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.enteringScreen,
              }),
              overflowX: 'hidden',
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{ 
          flexGrow: 1, 
          p: { xs: 2, sm: 3 }, 
          width: { 
            xs: '100%',
            md: miniDrawer ? `calc(100% - ${theme.spacing(9)})` : `calc(100% - ${drawerWidth}px)` 
          },
          transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
        }}
      >
        <Toolbar />
        <Container maxWidth="xl">
          <Outlet />
        </Container>
      </Box>
    </Box>
  );
}

export default MainLayout;