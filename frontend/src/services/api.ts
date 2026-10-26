import axios, { AxiosError } from 'axios';
import type {
  ApiResponse,
  User,
  FreelancerProfile,
  Category,
  Service,
  Project,
  Proposal,
  Order,
  Review,
  Conversation,
  Message,
  Notification,
  SmartMatch,
} from '../types';

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  (typeof window !== 'undefined' && !window.location.hostname.includes('localhost') && !window.location.hostname.includes('127.0.0.1')
    ? `${window.location.origin}/api`
    : 'http://localhost:5000/api');

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach authorization header
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ message?: string }>) => {
    if (error.response?.status === 401) {
      // Clear token if expired or revoked
      const currentPath = window.location.pathname;
      if (!currentPath.includes('/login') && !currentPath.includes('/register')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.dispatchEvent(new Event('auth:unauthorized'));
      }
    }
    return Promise.reject(error);
  }
);

// Auth Service API
export const authApi = {
  login: async (credentials: any) => {
    const res = await api.post<ApiResponse<{ token: string; user: User; profile?: FreelancerProfile }>>(
      '/auth/login',
      credentials
    );
    return res.data;
  },
  register: async (data: any) => {
    const res = await api.post<ApiResponse<{ token: string; user: User; profile?: FreelancerProfile }>>(
      '/auth/register',
      data
    );
    return res.data;
  },
  getMe: async () => {
    const res = await api.get<ApiResponse<{ user: User; profile?: FreelancerProfile }>>('/auth/me');
    return res.data;
  },
  updateProfile: async (data: any) => {
    const res = await api.put<ApiResponse<{ user: User; profile?: FreelancerProfile }>>('/auth/profile', data);
    return res.data;
  },
};

// Category Service API
export const categoryApi = {
  getAll: async () => {
    const res = await api.get<ApiResponse<Category[]>>('/categories');
    return res.data;
  },
  create: async (data: any) => {
    const res = await api.post<ApiResponse<Category>>('/categories', data);
    return res.data;
  },
  update: async (id: string, data: any) => {
    const res = await api.put<ApiResponse<Category>>(`/categories/${id}`, data);
    return res.data;
  },
  delete: async (id: string) => {
    const res = await api.delete<ApiResponse<null>>(`/categories/${id}`);
    return res.data;
  },
};

// Services API
export const serviceApi = {
  getServices: async (params?: any) => {
    const res = await api.get<ApiResponse<Service[]>>('/services', { params });
    return res.data;
  },
  getById: async (id: string) => {
    const res = await api.get<ApiResponse<Service & { freelancerProfile: FreelancerProfile; reviews: Review[] }>>(
      `/services/${id}`
    );
    return res.data;
  },
  getMyServices: async () => {
    const res = await api.get<ApiResponse<Service[]>>('/services/my/services');
    return res.data;
  },
  create: async (data: any) => {
    const res = await api.post<ApiResponse<Service>>('/services', data);
    return res.data;
  },
  update: async (id: string, data: any) => {
    const res = await api.put<ApiResponse<Service>>(`/services/${id}`, data);
    return res.data;
  },
  delete: async (id: string) => {
    const res = await api.delete<ApiResponse<null>>(`/services/${id}`);
    return res.data;
  },
};

// Freelancers API
export const freelancerApi = {
  getFreelancers: async (params?: any) => {
    const res = await api.get<ApiResponse<FreelancerProfile[]>>('/freelancers', { params });
    return res.data;
  },
  getById: async (id: string) => {
    const res = await api.get<
      ApiResponse<FreelancerProfile & { services: Service[]; reviews: Review[] }>
    >(`/freelancers/${id}`);
    return res.data;
  },
};

// Projects API
export const projectApi = {
  getOpenProjects: async (params?: any) => {
    const res = await api.get<ApiResponse<Project[]>>('/projects', { params });
    return res.data;
  },
  getById: async (id: string) => {
    const res = await api.get<ApiResponse<Project>>(`/projects/${id}`);
    return res.data;
  },
  getMyProjects: async () => {
    const res = await api.get<ApiResponse<Project[]>>('/projects/my/projects');
    return res.data;
  },
  create: async (data: any) => {
    const res = await api.post<ApiResponse<Project>>('/projects', data);
    return res.data;
  },
  update: async (id: string, data: any) => {
    const res = await api.put<ApiResponse<Project>>(`/projects/${id}`, data);
    return res.data;
  },
  close: async (id: string) => {
    const res = await api.patch<ApiResponse<null>>(`/projects/${id}/close`);
    return res.data;
  },
};

// Proposals API
export const proposalApi = {
  submit: async (projectId: string, data: any) => {
    const res = await api.post<ApiResponse<Proposal>>(`/proposals/project/${projectId}`, data);
    return res.data;
  },
  getProjectProposals: async (projectId: string) => {
    const res = await api.get<ApiResponse<{ project: Project; proposals: Proposal[] }>>(
      `/proposals/project/${projectId}`
    );
    return res.data;
  },
  getMyProposals: async () => {
    const res = await api.get<ApiResponse<Proposal[]>>('/proposals/my/proposals');
    return res.data;
  },
  accept: async (proposalId: string) => {
    const res = await api.post<ApiResponse<{ order: Order; project: Project }>>(
      `/proposals/${proposalId}/accept`
    );
    return res.data;
  },
  withdraw: async (proposalId: string) => {
    const res = await api.post<ApiResponse<null>>(`/proposals/${proposalId}/withdraw`);
    return res.data;
  },
};

// Orders API
export const orderApi = {
  createDirect: async (serviceId: string) => {
    const res = await api.post<ApiResponse<Order>>('/orders/direct', { serviceId });
    return res.data;
  },
  getById: async (id: string) => {
    const res = await api.get<ApiResponse<Order>>(`/orders/${id}`);
    return res.data;
  },
  getMyOrders: async (params?: { status?: string; role?: string }) => {
    const res = await api.get<ApiResponse<Order[]>>('/orders/my/orders', { params });
    return res.data;
  },
  submitDelivery: async (id: string, data: { deliveryNotes: string; deliveryFiles?: any[] }) => {
    const res = await api.post<ApiResponse<Order>>(`/orders/${id}/deliver`, data);
    return res.data;
  },
  requestRevision: async (id: string, data: { revisionNotes: string }) => {
    const res = await api.post<ApiResponse<Order>>(`/orders/${id}/revision`, data);
    return res.data;
  },
  approve: async (id: string) => {
    const res = await api.post<ApiResponse<Order>>(`/orders/${id}/approve`);
    return res.data;
  },
  cancel: async (id: string, data?: { reason?: string }) => {
    const res = await api.post<ApiResponse<Order>>(`/orders/${id}/cancel`, data);
    return res.data;
  },
};

// Reviews API
export const reviewApi = {
  create: async (orderId: string, data: { rating: number; comment: string }) => {
    const res = await api.post<ApiResponse<Review>>(`/reviews/order/${orderId}`, data);
    return res.data;
  },
  getByFreelancer: async (freelancerId: string) => {
    const res = await api.get<ApiResponse<Review[]>>(`/reviews/freelancer/${freelancerId}`);
    return res.data;
  },
};

// Chat API
export const chatApi = {
  getConversations: async () => {
    const res = await api.get<ApiResponse<Conversation[]>>('/chat/conversations');
    return res.data;
  },
  getOrCreateConversation: async (data: { recipientId: string; projectId?: string; orderId?: string }) => {
    const res = await api.post<ApiResponse<Conversation>>('/chat/conversations', data);
    return res.data;
  },
  getMessages: async (conversationId: string) => {
    const res = await api.get<ApiResponse<Message[]>>(`/chat/conversations/${conversationId}/messages`);
    return res.data;
  },
  markAsRead: async (conversationId: string) => {
    const res = await api.put<ApiResponse<null>>(`/chat/conversations/${conversationId}/read`);
    return res.data;
  },
};

// Notifications API
export const notificationApi = {
  getAll: async () => {
    const res = await api.get<ApiResponse<{ notifications: Notification[]; unreadCount: number }>>('/notifications');
    return res.data;
  },
  markAsRead: async (id: string) => {
    const res = await api.patch<ApiResponse<Notification>>(`/notifications/${id}/read`);
    return res.data;
  },
  markAllAsRead: async () => {
    const res = await api.patch<ApiResponse<null>>('/notifications/read-all');
    return res.data;
  },
};

// Smart Matching API
export const matchingApi = {
  getProjectMatches: async (projectId: string) => {
    const res = await api.get<ApiResponse<SmartMatch[]>>(`/matching/project/${projectId}`);
    return res.data;
  },
  previewDraftMatches: async (data: any) => {
    const res = await api.post<ApiResponse<SmartMatch[]>>('/matching/preview', data);
    return res.data;
  },
};

// Saved Items API
export const savedItemApi = {
  toggle: async (data: { itemType: 'service' | 'freelancer'; itemId: string }) => {
    const res = await api.post<ApiResponse<{ isSaved: boolean }>>('/saved-items/toggle', data);
    return res.data;
  },
  getAll: async () => {
    const res = await api.get<ApiResponse<any[]>>('/saved-items');
    return res.data;
  },
};

// Reports API
export const reportApi = {
  create: async (data: { targetType: string; targetId: string; reason: string; description?: string }) => {
    const res = await api.post<ApiResponse<any>>('/reports', data);
    return res.data;
  },
};

// Admin API
export const adminApi = {
  getStats: async () => {
    const res = await api.get<ApiResponse<any>>('/admin/stats');
    return res.data;
  },
  getUsers: async (params?: any) => {
    const res = await api.get<ApiResponse<User[]>>('/admin/users', { params });
    return res.data;
  },
  toggleUserStatus: async (userId: string) => {
    const res = await api.patch<ApiResponse<User>>(`/admin/users/${userId}/toggle-status`);
    return res.data;
  },
  getServices: async (params?: any) => {
    const res = await api.get<ApiResponse<Service[]>>('/admin/services', { params });
    return res.data;
  },
  getReports: async (params?: any) => {
    const res = await api.get<ApiResponse<any[]>>('/admin/reports', { params });
    return res.data;
  },
  updateReport: async (id: string, data: { status: string; adminNotes?: string }) => {
    const res = await api.patch<ApiResponse<any>>(`/admin/reports/${id}`, data);
    return res.data;
  },
};

// Upload API
export const uploadApi = {
  uploadSingle: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await api.post<
      ApiResponse<{ url: string; originalName: string; size: number; mimetype?: string; filename?: string }>
    >('/upload/single', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },
};
