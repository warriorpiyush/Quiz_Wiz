// API Configuration
const isDevelopment = process.env.NODE_ENV === 'development' || window.location.hostname === 'localhost';

export const API_CONFIG = {
  // Use local backend in development, deployed backend in production
  BASE_URL: isDevelopment ? 'http://localhost:8000' : 'https://quiz-wiz-t06d.onrender.com',
  // AI service is now integrated into the main backend
  AI_SERVICE_URL: isDevelopment ? 'http://localhost:8000' : 'https://quiz-wiz-t06d.onrender.com'
};

export default API_CONFIG;
