import 'react-native-gesture-handler';
import React from 'react';
import { AuthProvider } from './src/context/AuthContext';
import { TransactionProvider } from './src/context/TransactionContext'; // Si no lo usas, podrías quitarlo, pero dejémoslo por seguridad.
import AppNavigator from './src/navigation/AppNavigator';
import { ThemeProvider } from './src/context/ThemeContext';

export default function App() {
  return (
    <AuthProvider>
      <TransactionProvider>
        {/* ThemeProvider ya incluye el StatusBar correcto internamente */}
        <ThemeProvider>
          <AppNavigator />
        </ThemeProvider>
      </TransactionProvider>
    </AuthProvider>
  );
}