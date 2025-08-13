import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Create axios instance with retry logic
const apiClient = axios.create({
  baseURL: API,
  timeout: 15000, // Increased timeout for slow wake-ups
  headers: {
    'Content-Type': 'application/json'
  }
});

// Retry configuration
const MAX_RETRIES = 3;
const RETRY_DELAY = 2000; // 2 seconds between retries

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor with retry logic
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config;
    
    // If no response (network error) and we haven't retried too many times
    if (!error.response && config && !config._retryCount) {
      config._retryCount = 1;
      
      console.log(`Backend not ready, retrying... (${config._retryCount}/${MAX_RETRIES})`);
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * config._retryCount));
      
      return apiClient(config);
    }
    
    // Handle other errors
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      window.location.href = '/admin/login';
    }
    
    return Promise.reject(error);
  }
);

// Health check function
export const checkBackendHealth = async () => {
  try {
    const response = await apiClient.get('/health');
    return response.data;
  } catch (error) {
    throw new Error('Backend not responding');
  }
};

// Enhanced API calls with retry
export const portfolioAPI = {
  getPersonal: () => apiClient.get('/portfolio/personal'),
  getProjects: (category = '') => {
    const params = category && category !== 'All' ? { category } : {};
    return apiClient.get('/portfolio/projects', { params });
  },
  getFeaturedProjects: () => apiClient.get('/portfolio/projects/featured'),
  getTechStack: () => apiClient.get('/portfolio/tech-stack'),
  getStats: () => apiClient.get('/portfolio/stats')
};

export const contactAPI = {
  submitContact: (contactData) => apiClient.post('/contact', contactData)
};

export default apiClient;
