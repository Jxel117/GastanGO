import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StatusBar } from 'react-native';

export const ThemeContext = createContext();

export const lightTheme = {
  dark: false,
  colors: {
    background: '#F8FAFC', // Blanco humo
    card: '#FFFFFF',
    text: '#0F172A',       // Azul noche muy oscuro (casi negro)
    textSecondary: '#64748B',
    primary: '#2563EB',    // Azul estándar
    border: '#E2E8F0',
    input: '#FFFFFF',
    success: '#10B981',
    danger: '#EF4444',
    iconBg: '#F1F5F9'
  }
};

// PALETA "MODO NOCHE" BASADA EN TU IMAGEN
export const darkTheme = {
  dark: true,
  colors: {
    background: '#020617', // Fondo CASI negro (Slate 950)
    card: '#1e293b',       // Tarjetas gris azulado oscuro (Slate 800)
    text: '#F8FAFC',       // Texto blanco brillante
    textSecondary: '#94A3B8', // Texto secundario gris claro
    primary: '#3B82F6',    // Azul Neón brillante
    border: '#334155',     // Bordes sutiles
    input: '#0f172a',      // Inputs más oscuros que las tarjetas
    success: '#22c55e',    // Verde brillante
    danger: '#ef4444',     // Rojo brillante
    iconBg: '#334155'      // Fondo de iconos circulares
  }
};

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(lightTheme);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const loadTheme = async () => {
      const savedTheme = await AsyncStorage.getItem('userTheme');
      if (savedTheme === 'dark') {
        setIsDarkMode(true);
        setTheme(darkTheme);
      }
    };
    loadTheme();
  }, []);

  const toggleTheme = async () => {
    if (isDarkMode) {
      setTheme(lightTheme);
      setIsDarkMode(false);
      await AsyncStorage.setItem('userTheme', 'light');
    } else {
      setTheme(darkTheme);
      setIsDarkMode(true);
      await AsyncStorage.setItem('userTheme', 'dark');
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, isDarkMode }}>
      <StatusBar 
        barStyle={isDarkMode ? 'light-content' : 'dark-content'} 
        backgroundColor={theme.colors.background} 
      />
      {children}
    </ThemeContext.Provider>
  );
};