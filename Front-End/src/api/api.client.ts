import axios, { AxiosResponse, AxiosError } from 'axios';

const apiClient = axios.create({
  // פנייה לפורט 8000 כפי שמופיע בלוגים של ה-Uvicorn שלך
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
  timeout: 1000000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor לניטור שגיאות בזמן אמת
apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    console.error('Global API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default apiClient;