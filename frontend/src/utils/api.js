let baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
baseUrl = baseUrl.replace(/\/+$/, '');
if (!baseUrl.endsWith('/api') && baseUrl.includes('vercel.app')) {
  baseUrl += '/api';
}
export const API_BASE_URL = baseUrl;

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
