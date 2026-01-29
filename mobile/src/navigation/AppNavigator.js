import React, { useContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { AuthContext } from '../context/AuthContext';

import LoginScreen from '../screens/LoginScreen';
import DashboardScreen from '../screens/DashboardScreen';
import TypeSelectScreen from '../screens/transaction/TypeSelectScreen';
import CategorySelectScreen from '../screens/transaction/CategorySelectScreen';
import AmountInputScreen from '../screens/transaction/AmountInputScreen';

const Stack = createStackNavigator();

export default function AppNavigator() {
  const { token, loading } = useContext(AuthContext);

  if (loading) return null; // O un Splash Screen

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {token ? (
          <>
            <Stack.Screen name="Dashboard" component={DashboardScreen} />
            <Stack.Screen name="TypeSelect" component={TypeSelectScreen} options={{ presentation: 'modal' }}/>
            <Stack.Screen name="CategorySelect" component={CategorySelectScreen} />
            <Stack.Screen name="AmountInput" component={AmountInputScreen} />
          </>
        ) : (
          <Stack.Screen name="Login" component={LoginScreen} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}