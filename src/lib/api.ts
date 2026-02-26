import axios, { AxiosError, AxiosRequestConfig, InternalAxiosRequestConfig } from 'axios';
import { config } from '../config/env';
import { storage } from '../lib/storage';

const _rawAxios = axios.create({ baseURL: config.apiUrl, timeout: 10000 });

// ---------------------------------------------------------------------------
// Main axios instance
// ---------------------------------------------------------------------------
export const api = axios.create({
  baseURL: config.apiUrl,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor — add Bearer token
api.interceptors.request.use(
  (reqConfig: InternalAxiosRequestConfig) => {
    const token = storage.getAccessToken();
    if (token && reqConfig.headers) {
      reqConfig.headers.Authorization = `Bearer ${token}`;
    }
    return reqConfig;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — handle errors and transparent token refresh
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

    // Handle 401 Unauthorized — try to refresh the access token once
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = storage.getRefreshToken();
        if (!refreshToken) throw new Error('No refresh token');

        const response = await _rawAxios.post('/auth/refresh', { refreshToken });

        const { accessToken, refreshToken: newRefreshToken } = response.data;
        storage.setAccessToken(accessToken);
        storage.setRefreshToken(newRefreshToken);

        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        }

        return api(originalRequest);
      } catch (refreshError) {
        // Import dynamically to avoid circular deps
        const { useAuthStore } = await import('../stores/authStore');
        useAuthStore.getState().logout();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject({
      status: error.response?.status,
      message: extractErrorMessage(error),
      errors: (error.response?.data as any)?.errors,
    });
  }
);

function extractErrorMessage(error: AxiosError): string {
  if (error.response?.data) {
    const data = error.response.data as any;
    return data.message || data.error || 'An error occurred';
  }
  return error.message || 'Network error';
}

export default api;