import React, { useContext } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { View, Text } from 'react-native';
import { ThemeContext } from '../context/ThemeContext'; // <--- IMPORTAR TEMA

import DashboardScreen from '../screens/DashboardScreen';
import ReportsScreen from '../screens/reports/ReportsScreen';
import BudgetScreen from '../screens/budget/BudgetScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';

const Tab = createBottomTabNavigator();

export default function MainNavigator() {
  const { theme } = useContext(ThemeContext); // <--- USAR TEMA
  const colors = theme.colors;

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: { 
            backgroundColor: colors.card, // <--- COLOR DINÁMICO
            height: 70, 
            borderTopLeftRadius: 30, 
            borderTopRightRadius: 30,
            borderTopWidth: 0,
            elevation: 10,
            position: 'absolute',
            bottom: 0,
            borderTopColor: 'transparent' // Quitar línea fea en android
        },
        tabBarShowLabel: true,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarLabelStyle: { fontSize: 10, marginBottom: 10 },
        tabBarIconStyle: { marginTop: 10 }
      }}
    >
      <Tab.Screen 
        name="Inicio" 
        component={DashboardScreen} 
        options={{
          tabBarIcon: ({ color }) => <MaterialIcons name="home-filled" size={28} color={color} />
        }}
      />
      <Tab.Screen 
        name="Reportes" 
        component={ReportsScreen} 
        options={{
          tabBarIcon: ({ color }) => <Ionicons name="pie-chart" size={26} color={color} />
        }}
      />
      <Tab.Screen 
        name="Presupuesto" 
        component={BudgetScreen} 
        options={{
          tabBarIcon: ({ color }) => <MaterialIcons name="account-balance-wallet" size={26} color={color} />
        }}
      />
      <Tab.Screen 
        name="Perfil" 
        component={ProfileScreen} 
        options={{
          tabBarIcon: ({ color }) => <MaterialIcons name="person" size={28} color={color} />
        }}
      />
    </Tab.Navigator>
  );
}