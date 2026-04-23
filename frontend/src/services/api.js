// src/services/api.js
// Este archivo configura una instancia de Axios para interactuar con el backend.
// Asegúrate de que el backend esté corriendo en el puerto correcto y que la URL sea la adecuada.
// Puedes cambiar la URL a 'http://localhost:3000/api' para desarrollo local.

import axios from 'axios';

// URL del Backend (Asegúrate de que tu backend esté corriendo en puerto 3000)
const API_URL = 'https://gastango-back.onrender.com/api';
// const API_URL = 'http://localhost:3000/api'; // Para desarrollo local

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar el Token automáticamente
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token'); // En web usamos localStorage
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;