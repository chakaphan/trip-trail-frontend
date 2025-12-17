import api from '../lib/api';

// Auth API services
export const authService = {
  // Register new user
  register: async (userData: { name: string; email: string; password: string }) => {
    return await api.post('/auth/register', userData);
  },

  // Login user
  login: async (credentials: { email: string; password: string }) => {
    return await api.post('/auth/login', credentials);
  },

  // Get current user (requires auth token)
  getCurrentUser: async () => {
    return await api.get('/auth/me');
  },

  // Save token to localStorage
  setToken: (token: string) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', token);
    }
  },

  // Get token from localStorage
  getToken: () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('token');
    }
    return null;
  },

  // Remove token from localStorage
  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  }
};
