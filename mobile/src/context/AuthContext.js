import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const storedToken = await AsyncStorage.getItem('token');
        if (storedToken) {
          setToken(storedToken);
          api.defaults.headers.common['x-auth-token'] = storedToken;
          await fetchUserProfile();
        }
      } catch (e) {
        console.log("Error cargando sesión:", e);
      } finally {
        setLoading(false);
      }
    };
    loadUser();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const res = await api.get('/auth'); // O la ruta que uses para obtener datos
      setUser(res.data);
    } catch (error) {
      console.log("Error perfil:", error);
    }
  };

  // ✅ FUNCIÓN PARA ACTUALIZAR DATOS EN VIVO
  const updateUserData = (newData) => {
    setUser((prevUser) => ({
        ...prevUser, 
        ...newData 
    }));
  };

  const login = async (email, password) => {
    try {
      const res = await api.post('/auth/login', { email, password });
      if (!res.data.success) throw new Error(res.data.message);
      
      const newToken = res.data.token;
      await AsyncStorage.setItem('token', newToken);
      setToken(newToken);
      api.defaults.headers.common['x-auth-token'] = newToken;
      
      if (res.data.user) setUser(res.data.user);
      else await fetchUserProfile();
    } catch (error) { throw error; }
  };

  const register = async (username, email, password) => {
    try {
      const res = await api.post('/auth/register', { username, email, password });
      if (!res.data.success) throw new Error(res.data.message);
      
      const newToken = res.data.token;
      await AsyncStorage.setItem('token', newToken);
      setToken(newToken);
      api.defaults.headers.common['x-auth-token'] = newToken;
      
      if (res.data.user) setUser(res.data.user);
      else await fetchUserProfile();
    } catch (error) { throw error; }
  };

  const logout = async () => {
    await AsyncStorage.removeItem('token');
    setToken(null);
    setUser(null);
    delete api.defaults.headers.common['x-auth-token'];
  };

  return (
    <AuthContext.Provider value={{ token, user, login, register, logout, loading, updateUserData }}>
      {children}
    </AuthContext.Provider>
  );
};