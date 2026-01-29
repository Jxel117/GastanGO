import axios from 'axios';

// Tu IP de la red local
const API_URL = 'http://10.20.138.222:3000/api'; 

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;