import 'react-native-gesture-handler';
import React from 'react';
import { AuthProvider } from './src/context/AuthContext';
import { TransactionProvider } from './src/context/TransactionContext';
import AppNavigator from './src/navigation/AppNavigator';
import { StatusBar } from 'expo-status-bar';

export default function App() {
  return (
    <AuthProvider>
      <TransactionProvider>
        <StatusBar style="auto" />
        <AppNavigator />
      </TransactionProvider>
    </AuthProvider>
  );
}