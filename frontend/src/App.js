import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { CssBaseline, ThemeProvider } from '@mui/material';
import theme from './theme';

// Layouts
import MainLayout from './layouts/MainLayout';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// User Pages
import UserDashboard from './pages/user/Dashboard';
import UserPermissions from './pages/user/Permissions';
import CreatePermission from './pages/user/CreatePermission';
import PermissionDetail from './pages/user/PermissionDetail';
import Profile from './pages/user/Profile';
import ChangePassword from './pages/user/ChangePassword';
import Attendance from './pages/user/Attendance';
import Payslip from './pages/user/Payslip';

// Common Pages
import PayslipDetail from './pages/common/PayslipDetail';

// Approval Pages
import ApprovalDashboard from './pages/approval/Dashboard';
import PendingPermissions from './pages/approval/PendingPermissions';

// HRD Pages
import HrdDashboard from './pages/hrd/Dashboard';
import ApprovedByApprovalPermissions from './pages/hrd/PendingPermissions';
import AttendanceReport from './pages/hrd/AttendanceReport';
import AttendanceConfig from './pages/hrd/AttendanceConfig';
import PayrollManagement from './pages/hrd/PayrollManagement';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';
import UserManagement from './pages/admin/UserManagement';
import PermissionConfig from './pages/admin/PermissionConfig';

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100vh',
          flexDirection: 'column',
          gap: '16px'
        }}>
          <div className="loading-spinner"></div>
          <p>Memuat aplikasi...</p>
        </div>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <NotificationProvider>
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
          <Route path="permissions/:id" element={<PermissionDetail />} />
          <Route path="profile" element={<Profile />} />
          <Route path="change-password" element={<ChangePassword />} />
          <Route path="attendance" element={<Attendance />} />
          <Route path="payslip" element={<Payslip />} />
          <Route path="payslip/:id" element={<PayslipDetail />} />

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
              <Route path="hrd/pending" element={<ApprovedByApprovalPermissions />} />
              <Route path="hrd/attendance" element={<AttendanceReport />} />
              <Route path="hrd/attendance-config" element={<AttendanceConfig />} />
              <Route path="hrd/payroll" element={<PayrollManagement />} />
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
      </NotificationProvider>
    </ThemeProvider>
  );
}

export default App;