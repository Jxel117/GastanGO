import React, { useContext } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { AuthContext } from '../context/AuthContext';
import HelpScreen from '../screens/profile/HelpScreen';

// Importamos el Navegador Principal (El que tiene el menú de abajo)
import MainNavigator from './MainNavigator'; 

// Importa tus pantallas de Auth
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';

// Importa las nuevas pantallas de transacción
import TypeSelectScreen from '../screens/transaction/TypeSelectScreen';
import CategorySelectScreen from '../screens/transaction/CategorySelectScreen';
import AmountInputScreen from '../screens/transaction/AmountInputScreen';
import SettingsScreen from '../screens/profile/SettingsScreen';

const Stack = createStackNavigator();

export default function AppNavigator() {
  const { token, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <View style={{flex:1, justifyContent:'center', alignItems:'center'}}>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {token ? (
          // --- RUTAS PRIVADAS (Usuario Logueado) ---
          <>
            {/* 1. La pantalla principal ahora es el Menú con Pestañas */}
            <Stack.Screen name="Main" component={MainNavigator} />
            <Stack.Screen name="Settings" component={SettingsScreen} />
            <Stack.Screen name="Help" component={HelpScreen} />

            {/* 2. Pantallas de Transacción (Se abren encima del menú) */}
            <Stack.Screen 
              name="TypeSelect" 
              component={TypeSelectScreen} 
              options={{ presentation: 'modal' }} // Animación de subir hacia arriba
            />
            <Stack.Screen name="CategorySelect" component={CategorySelectScreen} />
            <Stack.Screen name="AmountInput" component={AmountInputScreen} />
          </>
        ) : (
          // --- RUTAS PÚBLICAS (Login/Registro) ---
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}