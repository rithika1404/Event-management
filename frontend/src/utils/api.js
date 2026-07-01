export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const getHeaders = () => {
  const token = localStorage.getItem('adminToken');
  const headers = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

export const isAuthenticated = () => {
  return !!localStorage.getItem('adminToken');
};

export const logoutAdmin = () => {
  localStorage.removeItem('adminToken');
};
