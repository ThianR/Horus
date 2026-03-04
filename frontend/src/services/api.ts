import axios from 'axios';
import { logger } from './loggerService';

const api = axios.create({
    baseURL: '/api'
});

// Interceptor para incluir el token en cada petición
api.interceptors.request.use(config => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, error => {
    return Promise.reject(error);
});

// Interceptor para errores: logueo centralizado en el servidor
api.interceptors.response.use(
    response => response,
    error => {
        const status = error.response ? error.response.status : 'CONEXIÓN';
        const url = error.config ? error.config.url : 'URL_DESCONOCIDA';
        logger.error(`[API ERROR] Status: ${status} | URL: ${url}`, error.response?.data);
        return Promise.reject(error);
    }
);

export default api;
