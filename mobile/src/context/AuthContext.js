import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null); // Aquí guardamos el nombre (username)
  const [loading, setLoading] = useState(true);

  // 1. Al abrir la App: Verificar si hay token y cargar usuario
  useEffect(() => {
    const loadUser = async () => {
      try {
        const storedToken = await AsyncStorage.getItem('token');
        if (storedToken) {
          setToken(storedToken);
          // Configurar header global para axios
          api.defaults.headers.common['x-auth-token'] = storedToken;
          await fetchUserProfile(); // <--- IMPORTANTE: Cargar datos
        }
      } catch (e) {
        console.log("Error cargando sesión:", e);
      } finally {
        setLoading(false);
      }
    };
    loadUser();
  }, []);

  // 2. Función para pedir los datos del usuario al Backend
// EN: src/context/AuthContext.js

  // ... (resto del código igual)

  // 2. Función para pedir los datos del usuario
  const fetchUserProfile = async () => {
    try {
      const res = await api.get('/auth'); 
      setUser(res.data);
    } catch (error) {
      console.log("Error obteniendo perfil:", error);
      // --- CAMBIO: COMENTA EL LOGOUT AQUÍ ---
      // Si el internet falla un segundo, no queremos sacar al usuario de la app.
      // logout(); 
    }
  };

  // 3. Login Manual
  const login = async (email, password) => {
    try {
      const res = await api.post('/auth/login', { email, password });
      const newToken = res.data.token;
      
      // Guardamos Token
      await AsyncStorage.setItem('token', newToken);
      setToken(newToken);
      api.defaults.headers.common['x-auth-token'] = newToken;
      
      // Cargamos Perfil
      await fetchUserProfile();
    } catch (error) {
      // Re-lanzamos el error para que LoginScreen muestre la alerta
      throw error; 
    }
  };
  
  // ... (resto del código igual)

  // 4. Registro
  const register = async (username, email, password) => {
    const res = await api.post('/auth/register', { username, email, password });
    const newToken = res.data.token;

    await AsyncStorage.setItem('token', newToken);
    setToken(newToken);
    api.defaults.headers.common['x-auth-token'] = newToken;
    
    await fetchUserProfile();
  };

  // 5. Cerrar Sesión
  const logout = async () => {
    await AsyncStorage.removeItem('token');
    setToken(null);
    setUser(null);
    delete api.defaults.headers.common['x-auth-token'];
  };

  return (
    <AuthContext.Provider value={{ token, user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};