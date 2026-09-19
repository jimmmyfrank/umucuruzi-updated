import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5002/api', // Changed from 5000 to 5002
  headers: { 'Content-Type': 'application/json' }
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('umucuruzi_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;