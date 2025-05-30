import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';

// Layouts
import MainLayout from './layouts/MainLayout';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// User Pages
import UserDashboard from './pages/user/Dashboard';
import UserPermissions from './pages/user/Permissions';
import CreatePermission from './pages/user/CreatePermission';
import PermissionDetails from './pages/user/PermissionDetails';
import Profile from './pages/user/Profile';
import ChangePassword from './pages/user/ChangePassword';

// Approval Pages
import ApprovalDashboard from './pages/approval/Dashboard';
import PendingPermissions from './pages/approval/PendingPermissions';

// HRD Pages
import HrdDashboard from './pages/hrd/Dashboard';
// import ApprovedByApprovalPermissions from './pages/hrd/ApprovedByApprovalPermissions';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';
import UserManagement from './pages/admin/UserManagement';
import PermissionConfig from './pages/admin/PermissionConfig';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#f50057',
    },
    background: {
      default: '#f5f5f5',
    },
  },
});

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
        <Route path="/register" element={!user ? <Register /> : <Navigate to="/" />} />

        {/* Protected Routes */}
        <Route path="/" element={user ? <MainLayout /> : <Navigate to="/login" />}>
          {/* User Routes - Available to all authenticated users */}
          <Route index element={<UserDashboard />} />
          <Route path="permissions" element={<UserPermissions />} />
          <Route path="permissions/create" element={<CreatePermission />} />
          <Route path="permissions/:id" element={<PermissionDetails />} />
          <Route path="profile" element={<Profile />} />
          <Route path="change-password" element={<ChangePassword />} />

          {/* Approval Routes */}
          {user && (user.role === 'approval' || user.role === 'admin') && (
            <>
              <Route path="approval" element={<ApprovalDashboard />} />
              <Route path="approval/pending" element={<PendingPermissions />} />
            </>
          )}

          {/* HRD Routes */}
          {user && (user.role === 'hrd' || user.role === 'admin') && (
            <>
              <Route path="hrd" element={<HrdDashboard />} />
              {/* <Route path="hrd/pending" element={<ApprovedByApprovalPermissions />} /> */}
            </>
          )}

          {/* Admin Routes */}
          {user && user.role === 'admin' && (
            <>
              <Route path="admin" element={<AdminDashboard />} />
              <Route path="admin/users" element={<UserManagement />} />
              <Route path="admin/config" element={<PermissionConfig />} />
            </>
          )}
        </Route>

        {/* Fallback Route */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </ThemeProvider>
  );
}

export default App;