import axios from "axios";

// Create central axios instance
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
});

// Intercept requests and attach token if it exists
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = token;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
