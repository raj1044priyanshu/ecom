import axios from 'axios';
import { toast } from 'react-hot-toast';

const baseURL = import.meta.env.VITE_API_URL || '/api';

const axiosInstance = axios.create({
  baseURL,
  withCredentials: true, // Important for sending/receiving cookies (JWT)
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor for global error handling and token refresh
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 Unauthorized (Token expired)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Attempt to refresh token
        await axios.post(`${baseURL}/auth/refresh-token`, {}, { withCredentials: true });
        
        // Retry the original request
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        // If refresh fails, user needs to login again
        if (window.location.pathname !== '/login') {
          // Dispatch logout event or redirect
          window.location.href = '/login?expired=true';
        }
        return Promise.reject(refreshError);
      }
    }

    // Global error toast (except for specific cases where we handle it locally)
    if (!originalRequest.hideErrorToast) {
      const message = error.response?.data?.message || 'Something went wrong';
      if (error.response?.status !== 401 && error.response?.status !== 404) {
        toast.error(message);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
