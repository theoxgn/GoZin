import React, { useState } from 'react';
import { Outlet, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
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
} from '@mui/material';
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
} from '@mui/icons-material';

const drawerWidth = 240;

function MainLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
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

  const menuItems = [
    // User Menu Items - Available to all authenticated users
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/' },
    { text: 'Daftar Perijinan', icon: <ListAltIcon />, path: '/permissions' },
    { text: 'Buat Perijinan', icon: <AddIcon />, path: '/permissions/create' },
    
    // Divider for role-specific menus
    { divider: true },
    
    // Approval Menu Items
    ...(user && (user.role === 'approval' || user.role === 'admin') ? [
      { text: 'Approval Dashboard', icon: <SupervisorAccountIcon />, path: '/approval' },
      { text: 'Perijinan Pending', icon: <ListAltIcon />, path: '/approval/pending' },
    ] : []),
    
    // HRD Menu Items
    ...(user && (user.role === 'hrd' || user.role === 'admin') ? [
      { text: 'HRD Dashboard', icon: <BusinessIcon />, path: '/hrd' },
      { text: 'Perijinan Disetujui Approval', icon: <ListAltIcon />, path: '/hrd/pending' },
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
      <Toolbar>
        <Typography variant="h6" noWrap component="div">
          Sistem Perijinan
        </Typography>
      </Toolbar>
      <Divider />
      <List>
        {menuItems.map((item, index) => (
          item.divider ? (
            <Divider key={`divider-${index}`} />
          ) : (
            <ListItem key={item.text} disablePadding>
              <ListItemButton component={Link} to={item.path} onClick={() => setMobileOpen(false)}>
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItemButton>
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
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            Sistem Perijinan Karyawan
          </Typography>
          
          {user && (
            <>
              <Button 
                color="inherit" 
                onClick={handleProfileMenuOpen} 
                startIcon={
                  <Avatar sx={{ width: 24, height: 24 }}>
                    {getUserInitials()}
                  </Avatar>
                }
              >
                {getUserDisplayName()}
              </Button>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleProfileMenuClose}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'right',
                }}
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
              >
                <MenuItem component={Link} to="/profile" onClick={handleProfileMenuClose}>
                  <ListItemIcon>
                    <PersonIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText>Profil</ListItemText>
                </MenuItem>
                <MenuItem component={Link} to="/change-password" onClick={handleProfileMenuClose}>
                  <ListItemIcon>
                    <VpnKeyIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText>Ubah Password</ListItemText>
                </MenuItem>
                <Divider />
                <MenuItem onClick={handleLogout}>
                  <ListItemIcon>
                    <LogoutIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText>Logout</ListItemText>
                </MenuItem>
              </Menu>
            </>
          )}
        </Toolbar>
      </AppBar>
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{ flexGrow: 1, p: 3, width: { sm: `calc(100% - ${drawerWidth}px)` } }}
      >
        <Toolbar />
        <Container maxWidth="lg">
          <Outlet />
        </Container>
      </Box>
    </Box>
  );
}

export default MainLayout;