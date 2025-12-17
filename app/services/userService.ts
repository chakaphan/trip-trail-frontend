import api from '../lib/api';

// User API services
export const userService = {
  // Get all users
  getAllUsers: async () => {
    return await api.get('/users');
  },

  // Get user by ID
  getUserById: async (id: string) => {
    return await api.get(`/users/${id}`);
  },

  // Create new user (signup)
  signup: async (userData: { name: string; email: string; password: string }) => {
    return await api.post('/users', userData);
  },

  // Update user
  updateUser: async (id: string, userData: { name?: string; email?: string }) => {
    return await api.put(`/users/${id}`, userData);
  },

  // Delete user
  deleteUser: async (id: string) => {
    return await api.delete(`/users/${id}`);
  },
};
