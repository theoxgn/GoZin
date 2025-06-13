import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../services/api';
import { toast } from 'react-toastify';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in on initial load
    const token = localStorage.getItem('token');
    if (token) {
      fetchUserProfile();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }

      const response = await api.get('/api/auth/profile');

      if (response.data && response.data.user) {
        setUser(response.data.user);
      } else {
        // If no user data is returned, clear the token and user state
        localStorage.removeItem('token');
        setUser(null);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching user profile:', error);
      // Clear token and user state on any error
      localStorage.removeItem('token');
      setUser(null);
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await api.post('/api/auth/login', { email, password });
      const { token, user } = response.data;

      localStorage.setItem('token', token);
      setUser(user);
      toast.success('Login berhasil!');
      return true;
    } catch (error) {
      console.error('Login error:', error);
      const errorMessage = error.response?.data?.message || 'Login gagal. Silakan coba lagi.';
      toast.error(errorMessage);
      return false;
    }
  };

  const register = async (userData) => {
    try {
      const response = await api.post('/api/auth/register', userData);
      toast.success('Registrasi berhasil! Silakan login.');
      return true;
    } catch (error) {
      console.error('Register error:', error);
      const errorMessage = error.response?.data?.message || 'Registrasi gagal. Silakan coba lagi.';
      toast.error(errorMessage);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    toast.info('Anda telah keluar dari sistem');
  };

  const changePassword = async (currentPassword, newPassword) => {
    try {
      await api.post(
        '/api/auth/change-password',
        { currentPassword, newPassword }
      );
      toast.success('Password berhasil diubah!');
      return true;
    } catch (error) {
      console.error('Change password error:', error);
      const errorMessage = error.response?.data?.message || 'Gagal mengubah password. Silakan coba lagi.';
      toast.error(errorMessage);
      return false;
    }
  };

  const updateProfile = async (userData) => {
    try {
      const response = await api.put(
        `/api/users/${user.id}`,
        userData
      );
      
      setUser({ ...user, ...response.data });
      toast.success('Profil berhasil diperbarui!');
      return true;
    } catch (error) {
      console.error('Update profile error:', error);
      const errorMessage = error.response?.data?.message || 'Gagal memperbarui profil. Silakan coba lagi.';
      toast.error(errorMessage);
      return false;
    }
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    changePassword,
    updateProfile,
    refreshUser: fetchUserProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};