import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';

export const createAxiosInstance = (): AxiosInstance => {
  const instance = axios.create({
    baseURL: 'http://tfabackend-production.up.railway.app:8082/api',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  instance.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      const token = localStorage.getItem('token');
      if (token && config.headers) {
        config.headers['Authorization'] = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  instance.interceptors.response.use(
    (response) => response,
    (error) => {
      // Don't redirect on 401 if we're already on the login page
      if (error.response?.status === 401 && !window.location.pathname.includes('login')) {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
      return Promise.reject(error);
    }
  );

  return instance;
};

export const axiosInstance = createAxiosInstance();
export default axiosInstance;
