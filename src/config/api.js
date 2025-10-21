// API Configuration
const getApiBaseUrl = () => {
  // Try environment variable first
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  
  // Fallback to production URL
  return 'https://halfsec-backend.onrender.com';
};

const API_BASE_URL = getApiBaseUrl();

console.log('API Base URL:', API_BASE_URL); // Debug log

export default API_BASE_URL;