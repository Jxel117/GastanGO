import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Backend desplegado
const API_URL = 'https://gastango-api.onrender.com/api'; 
// Tu IP de la red local
// const API_URL = 'http://10.20.138.222:3001/api'; UNIVERSIDAD
// const API_URL = 'http://192.168.110.223:3001/api'; 
// const API_URL = 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para poner el token automáticamente (esto ya lo tenías, déjalo igual)
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('token');
    if (token) {
      config.headers['x-auth-token'] = token;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;