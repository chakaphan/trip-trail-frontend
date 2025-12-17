import api from '../lib/api';

export interface CreateMemoryData {
  park_name: string;
  start_date: string;
  end_date: string;
  duration_days: number;
  location_lat?: number;
  location_lng?: number;
  impression?: string;
  tips?: string;
  privacy_level: 'private' | 'friends' | 'public';
  places?: string[];
  expenses?: Array<{
    category: string;
    amount: number;
  }>;
}

export interface Memory {
  id: number;
  user_id: number;
  park_name: string;
  start_date: string;
  end_date: string;
  duration_days: number;
  location_lat?: number;
  location_lng?: number;
  impression?: string;
  tips?: string;
  privacy_level: string;
  total_expense: number;
  created_at: string;
  updated_at: string;
  places?: Array<{ id: number; place_name: string }>;
  expenses?: Array<{ id: number; category: string; amount: number }>;
  photo_count?: number;
  cover_photo?: string; // file_name of first photo
}

export interface Photo {
  id: number;
  memory_id: number;
  file_name: string;
  mime_type: string;
  file_size: number;
  sort_order: number;
  created_at: string;
}

export interface Timeline {
  id: number;
  memory_id: number;
  time_label: string;
  title: string;
  description: string;
  location_name?: string;
  location_lat?: number;
  location_lng?: number;
  created_at: string;
  updated_at: string;
  photos?: TimelinePhoto[];
}

export interface TimelinePhoto {
  id: number;
  timeline_id: number;
  file_name: string;
  mime_type: string;
  file_size: number;
  sort_order: number;
  created_at: string;
}

export interface CreateTimelineData {
  time_label: string;
  title: string;
  description: string;
  location_name?: string;
  location_lat?: number;
  location_lng?: number;
}

// Create new memory
export const createMemory = async (memoryData: CreateMemoryData): Promise<{ memory: Memory }> => {
  const response = await api.post<{ message: string; memory: Memory }>('/memory', memoryData);
  return response.data;
};

// Get user's memories
export const getMyMemories = async (options?: {
  limit?: number;
  offset?: number;
  privacy_level?: string;
}): Promise<{ memories: Memory[]; count: number }> => {
  const response = await api.get('/memory/my-memories', { params: options });
  return response.data;
};

// Get memory by ID
export const getMemoryById = async (memoryId: number): Promise<{ memory: Memory }> => {
  const response = await api.get(`/memory/${memoryId}`);
  return response.data;
};

// Get public memories
export const getPublicMemories = async (options?: {
  limit?: number;
  offset?: number;
  park_name?: string;
}): Promise<{ memories: Memory[]; count: number }> => {
  const response = await api.get('/memory/public', { params: options });
  return response.data;
};

// Update memory
export const updateMemory = async (
  memoryId: number,
  memoryData: Partial<CreateMemoryData>
): Promise<{ memory: Memory }> => {
  const response = await api.put(`/memory/${memoryId}`, memoryData);
  return response.data;
};

// Delete memory
export const deleteMemory = async (memoryId: number): Promise<{ message: string }> => {
  const response = await api.delete(`/memory/${memoryId}`);
  return response.data;
};

// Upload photo to memory
export const uploadPhoto = async (
  memoryId: number,
  file: File,
  sortOrder?: number
): Promise<{ photo: Photo }> => {
  const formData = new FormData();
  formData.append('image', file);
  if (sortOrder !== undefined) {
    formData.append('sort_order', sortOrder.toString());
  }

  const response = await api.post(`/memory/${memoryId}/photos`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

// Get photos for a memory
export const getPhotos = async (memoryId: number): Promise<{ photos: Photo[] }> => {
  const response = await api.get(`/memory/${memoryId}/photos`);
  return response.data;
};

// Get photo URL (for displaying in <img> tag)
export const getPhotoUrl = (memoryId: number, photoId: number): string => {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
  const token = localStorage.getItem('token');
  return `${baseUrl}/memory/${memoryId}/photos/${photoId}?token=${token}`;
};

// Delete photo
export const deletePhoto = async (memoryId: number, photoId: number): Promise<{ message: string }> => {
  const response = await api.delete(`/memory/${memoryId}/photos/${photoId}`);
  return response.data;
};

// Update photo sort order
export const updatePhotoOrder = async (
  memoryId: number,
  photoId: number,
  sortOrder: number
): Promise<{ photo: Photo }> => {
  const response = await api.patch(`/memory/${memoryId}/photos/${photoId}/order`, {
    sort_order: sortOrder,
  });
  return response.data;
};

// ===== Timeline Functions =====

// Get timelines for a memory
export const getTimelines = async (memoryId: number): Promise<{ timelines: Timeline[] }> => {
  const response = await api.get(`/memory/${memoryId}/timelines`);
  return response.data;
};

// Create new timeline
export const createTimeline = async (
  memoryId: number,
  timelineData: CreateTimelineData
): Promise<{ timeline: Timeline }> => {
  const response = await api.post(`/memory/${memoryId}/timelines`, timelineData);
  return response.data;
};

// Update timeline
export const updateTimeline = async (
  memoryId: number,
  timelineId: number,
  timelineData: Partial<CreateTimelineData>
): Promise<{ timeline: Timeline }> => {
  const response = await api.put(`/memory/${memoryId}/timelines/${timelineId}`, timelineData);
  return response.data;
};

// Delete timeline
export const deleteTimeline = async (memoryId: number, timelineId: number): Promise<{ message: string }> => {
  const response = await api.delete(`/memory/${memoryId}/timelines/${timelineId}`);
  return response.data;
};

// ===== Timeline Photo Functions =====

// Get timeline photo URL (for displaying in <img> tag)
export const getTimelinePhotoUrl = (memoryId: number, timelineId: number, photoId: number): string => {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
  const token = localStorage.getItem('token');
  return `${baseUrl}/memory/${memoryId}/timelines/${timelineId}/photos/${photoId}?token=${token}`;
};

// Upload photo to timeline
export const uploadTimelinePhoto = async (
  memoryId: number,
  timelineId: number,
  file: File,
  sortOrder?: number
): Promise<{ photo: TimelinePhoto }> => {
  const formData = new FormData();
  formData.append('image', file);
  if (sortOrder !== undefined) {
    formData.append('sort_order', sortOrder.toString());
  }

  const response = await api.post(`/memory/${memoryId}/timelines/${timelineId}/photos`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

// Get photos for a timeline
export const getTimelinePhotos = async (
  memoryId: number,
  timelineId: number
): Promise<{ photos: TimelinePhoto[] }> => {
  const response = await api.get(`/memory/${memoryId}/timelines/${timelineId}/photos`);
  return response.data;
};

// Delete timeline photo
export const deleteTimelinePhoto = async (
  memoryId: number,
  timelineId: number,
  photoId: number
): Promise<{ message: string }> => {
  const response = await api.delete(`/memory/${memoryId}/timelines/${timelineId}/photos/${photoId}`);
  return response.data;
};
