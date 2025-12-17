import api from '../lib/api';

// Profile API services
export const profileService = {
  // Get current user's profile
  getMyProfile: async () => {
    return await api.get('/profile/me');
  },

  // Get profile by user ID
  getProfileByUserId: async (userId: string) => {
    return await api.get(`/profile/user/${userId}`);
  },

  // Create profile
  createProfile: async (profileData: {
    name: string;
    bio?: string;
    location?: string;
    website?: string;
  }) => {
    return await api.post('/profile', profileData);
  },

  // Update profile
  updateProfile: async (profileData: {
    name?: string;
    bio?: string;
    location?: string;
    website?: string;
  }) => {
    return await api.put('/profile', profileData);
  },

  // Create or update profile (upsert)
  upsertProfile: async (profileData: {
    name: string;
    bio?: string;
    location?: string;
    website?: string;
  }) => {
    return await api.put('/profile/upsert', profileData);
  },

  // Delete profile
  deleteProfile: async () => {
    return await api.delete('/profile');
  },

  // Upload avatar
  uploadAvatar: async (file: File) => {
    const formData = new FormData();
    formData.append('avatar', file);
    
    return await api.post('/profile/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  // Upload cover image
  uploadCover: async (file: File) => {
    const formData = new FormData();
    formData.append('cover', file);
    
    return await api.post('/profile/cover', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  // Get avatar URL
  getAvatarUrl: (userId: string | number): string => {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
    return `${baseUrl}/profile/user/${userId}/avatar`;
  },

  // Get cover URL
  getCoverUrl: (userId: string | number): string => {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
    return `${baseUrl}/profile/user/${userId}/cover`;
  },

  // Delete avatar
  deleteAvatar: async () => {
    return await api.delete('/profile/avatar');
  },

  // Delete cover
  deleteCover: async () => {
    return await api.delete('/profile/cover');
  },

  // Get user stats
  getMyStats: async () => {
    return await api.get('/profile/stats');
  },
};
