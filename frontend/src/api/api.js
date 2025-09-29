import axios from "axios";
import Cookies from "js-cookie"; // Keep Cookies for potential non-httpOnly uses if needed, but remove dependency on 'token'

import { toast } from "react-toastify";

// Create Axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  withCredentials: true, // CRITICAL: This ensures httpOnly cookies are sent by the browser
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

// Request Interceptor: Remove reliance on reading httpOnly 'token' cookie
api.interceptors.request.use(
  (config) => {
    // IMPORTANT: The 'token' cookie is expected to be httpOnly. 
    // The browser automatically sends it due to 'withCredentials: true'.
    
    // If the token is manually set on the header later (e.g., after refresh), 
    // the Authorization header will be present in defaults.
    
    // **ONLY** if you also store a non-httpOnly 'token' (e.g., for header fallback):
    const token = Cookies.get("token"); 
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);


// Response Interceptor: Handle 401 error and token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Check for 401 error and if it's not a refresh request
    if (error.response?.status === 401 && !originalRequest._retry) {
      
      // Ignore 401 for /auth/me on app start, as it's expected if user is logged out
      if (originalRequest?.url?.endsWith("/auth/me")) {
        return Promise.reject(error);
      }

      // If a token refresh is already in progress, add the new request to the queue
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          // Retry the request with the new token
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Call refresh-token endpoint. Browser automatically sends the httpOnly 'refreshToken' cookie.
        const { data } = await axios.post(`${api.defaults.baseURL}/auth/refresh-token`, {}, { withCredentials: true });
        
        const newToken = data.token; // New token is received in the response body
        
        // Remove manual Cookies.set() if the server sets the new httpOnly cookie!
        // The server is expected to set the 'token' httpOnly cookie in its response header.
        
        // Update Axios defaults for all pending and future requests in this session
        api.defaults.headers.common["Authorization"] = `Bearer ${newToken}`;
        
        processQueue(null, newToken);

        // Retry the original request
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
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
