import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL,
  timeout: 10000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config)=>{
    const token = localStorage.getItem("token");
    if(token) {
      config.headers.Authorization = `Bearer ${token}`;
      // console.log("hi",config.headers);
    }
    return config;
  },
  (error) => Promise.reject(error)
  
)

export default api;
