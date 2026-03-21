import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from '../constants/api';

const api = axios.create({ baseURL: BASE_URL, timeout: 15000 });

api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    if (error.response?.status === 401) {
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('user');
    }
    return Promise.reject(error);
  }
);

// ── Auth ──
export const apiSignup = (data: object) => api.post('/auth/signup', data);
export const apiLogin = (data: object) => api.post('/auth/login', data);
export const apiGetMe = () => api.get('/auth/me');
export const apiGoogleAuth = (data: object) => api.post('/auth/google', data);

// ── User ──
export const apiUpdateProfile = (data: object) => api.put('/user/update', data);
export const apiGetProfile = () => api.get('/user/profile');

// ── Services (from DB) ──
export const apiGetServices = (age?: number, category?: string) => {
  const params = new URLSearchParams();
  if (age) params.append('age', String(age));
  if (category && category !== 'All') params.append('category', category);
  return api.get(`/services?${params.toString()}`);
};
export const apiGetServiceById = (id: string) => api.get(`/services/${id}`);

// ── Helpers ──
export const apiGetNearbyHelpers = (lat: number, lng: number, radius = 10000, service?: string) => {
  let url = `/helpers/nearby?lat=${lat}&lng=${lng}&radius=${radius}`;
  if (service) url += `&service=${service}`;
  return api.get(url);
};

// ── Tasks ──
export const apiCreateTask = (data: object) => api.post('/task/create', data);
export const apiGetUserTasks = () => api.get('/task/user');
export const apiGetHelperTasks = () => api.get('/task/helper');
export const apiGetTaskById = (id: string) => api.get(`/task/${id}`);
export const apiAcceptTask = (id: string) => api.put(`/task/accept/${id}`);
export const apiRejectTask = (id: string) => api.put(`/task/reject/${id}`);
export const apiUpdateTaskStatus = (id: string, data: object) => api.put(`/task/update-status/${id}`, data);
export const apiRateTask = (id: string, data: object) => api.put(`/task/rate/${id}`, data);

// ── Chat ──
export const apiGetChatByTask = (taskId: string) => api.get(`/chat/${taskId}`);
export const apiSendMessage = (data: object) => api.post('/chat/send', data);
export const apiGetMyChats = () => api.get('/chat/my-chats');

// ── Documents ──
export const apiGetDocument = (taskId: string) => api.get(`/document/${taskId}`);
export const apiGetMyDocuments = () => api.get('/document/my-documents');
export const apiUploadDocument = (formData: FormData) =>
  api.post('/document/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    transformRequest: (data) => data, // Prevent Axios from serializing FormData
  });

// ── Payments ──
export const apiCreatePayment = (data: object) => api.post('/payment/create', data);
export const apiVerifyPayment = (data: object) => api.post('/payment/verify', data);
export const apiGetPaymentHistory = () => api.get('/payment/history');

// ── Notifications ──
export const apiGetNotifications = () => api.get('/notifications');
export const apiMarkNotifRead = (id: string) => api.put(`/notifications/${id}/read`);
export const apiMarkAllNotifsRead = () => api.put('/notifications/read-all');

// ── AI Chat ──
export const apiGetAIChat = () => api.get('/aichat');
export const apiPostAIChat = (messages: any) => api.post('/aichat', { messages });
export const apiClearAIChat = () => api.delete('/aichat');

// ── OCR ──
export const apiOcrAadhaar = (formData: FormData) =>
  api.post('/ocr/aadhaar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    transformRequest: (data) => data,
  });
export const apiOcrDemo = () => api.post('/ocr/demo');

// ── Admin ──
export const apiAdminGetStats = () => api.get('/admin/stats');
export const apiAdminGetUsers = (role?: string) => api.get(role ? `/admin/users?role=${role}` : `/admin/users`);
export const apiAdminToggleUser = (userId: string) => api.put(`/admin/user/${userId}/toggle`);
export const apiAdminGetHelpers = (status: string = 'all') => api.get(`/admin/helpers?status=${status}`);
export const apiAdminVerifyHelper = (profileId: string, data: object) => api.put(`/admin/verify-helper/${profileId}`, data);
export const apiAdminGetDocuments = (status: string = 'all') => api.get(`/admin/documents?status=${status}`);
export const apiAdminVerifyDocument = (docId: string, data: object) => api.put(`/admin/verify-document/${docId}`, data);

export default api;
