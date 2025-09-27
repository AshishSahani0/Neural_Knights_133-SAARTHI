import axios from "axios";
import Cookies from "js-cookie";
import { toast } from "react-toastify";

// Create Axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  withCredentials: true, // always send cookies
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Add Authorization header automatically if token exists
api.interceptors.request.use(
  (config) => {
    const token = Cookies.get("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Global response interceptor for token refresh and error handling
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Check for 401 error and if it's not a refresh request
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Ignore 401 for /auth/me on app start, as it's expected
      if (originalRequest?.url?.endsWith("/auth/me")) {
        return Promise.reject(error);
      }

      // If a token refresh is already in progress, add the new request to the queue
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const { data } = await axios.post(`${api.defaults.baseURL}/auth/refresh-token`, {}, { withCredentials: true });
        
        const newToken = data.token;
        Cookies.set("token", newToken, { expires: data.expiresIn || 7 });
        api.defaults.headers.common["Authorization"] = `Bearer ${newToken}`;
        
        processQueue(null, newToken);

        return api(originalRequest);
      } catch (refreshError) {
        toast.error("Session expired. Please log in again.");
        processQueue(refreshError, null);
        window.location.href = "/login"; // Redirect to login
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }
    
    // For other errors, just reject the promise
    return Promise.reject(error);
  }
);

export default api;