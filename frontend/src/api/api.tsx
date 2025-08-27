import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL,
  timeout: 5000, // 5 giây
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
