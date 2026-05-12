'use client';

import { useState, useEffect } from 'react';

export const useAdminAuth = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginPassword, setLoginPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [passwords, setPasswords] = useState({ current: '', next: '', confirm: '' });

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (token === 'skye-admin-auth-token') {
      setIsLoggedIn(true);
    }
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: loginPassword })
      });
      const data = await res.json();
      if (data.success) {
        localStorage.setItem('adminToken', data.token);
        setIsLoggedIn(true);
      } else {
        alert('Invalid password');
      }
    } catch (err) {
      alert('Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    setIsLoggedIn(false);
  };

  const handleChangePassword = async (e, showMessage) => {
    e.preventDefault();
    if (passwords.next !== passwords.confirm) return alert('New passwords do not match');
    setLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch('/api/admin/change-password', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ currentPassword: passwords.current, newPassword: passwords.next })
      });
      if (res.ok) {
        showMessage('success', 'Password updated successfully');
        setPasswords({ current: '', next: '', confirm: '' });
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to update password');
      }
    } catch (err) {
      alert('Error updating password');
    } finally {
      setLoading(false);
    }
  };

  return {
    isLoggedIn,
    setIsLoggedIn,
    loginPassword,
    setLoginPassword,
    loading,
    setLoading,
    passwords,
    setPasswords,
    handleLogin,
    handleLogout,
    handleChangePassword
  };
};
