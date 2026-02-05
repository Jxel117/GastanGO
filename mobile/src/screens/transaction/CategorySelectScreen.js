import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Platform, StatusBar } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

const CATEGORIES = {
  expense: [
    { id: '1', name: 'Comida', icon: 'restaurant' },
    { id: '2', name: 'Transporte', icon: 'directions-bus' },
    { id: '3', name: 'Compras', icon: 'shopping-bag' },
    { id: '4', name: 'Servicios', icon: 'lightbulb' },
    { id: '5', name: 'Salud', icon: 'local-hospital' },
    { id: '6', name: 'Entretenimiento', icon: 'movie' },
  ],
  income: [
    { id: '10', name: 'Salario', icon: 'attach-money' },
    { id: '11', name: 'Negocio', icon: 'store' },
    { id: '12', name: 'Regalo', icon: 'card-giftcard' },
    { id: '13', name: 'Otros', icon: 'account-balance' },
  ]
};

export default function CategorySelectScreen({ route, navigation }) {
  const { type } = route.params; // Recibimos si es 'income' o 'expense'
  const list = CATEGORIES[type] || [];

  const handleSelect = (category) => {
    navigation.navigate('AmountInput', { type, category });
  };

  return (
    <View style={styles.container}>
      {/* HEADER con botón Atrás */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <MaterialIcons name="arrow-back" size={28} color="#374151" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Elige una Categoría</Text>
        <View style={{width: 40}} /> {/* Espacio vacío para equilibrar */}
      </View>

      <FlatList
        data={list}
        keyExtractor={item => item.id}
        numColumns={2}
        contentContainerStyle={styles.grid}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card} onPress={() => handleSelect(item)}>
            <View style={styles.iconContainer}>
              <MaterialIcons name={item.icon} size={32} color="#2563EB" />
            </View>
            <Text style={styles.label}>{item.name}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { 
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', 
    paddingHorizontal: 20, paddingBottom: 20,
    marginTop: Platform.OS === 'android' ? StatusBar.currentHeight + 20 : 60
  },
  backBtn: { padding: 8, backgroundColor: '#fff', borderRadius: 12, elevation: 2 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#1E293B' },
  
  grid: { padding: 10 },
  card: { 
    flex: 1, margin: 10, backgroundColor: '#fff', borderRadius: 20, padding: 20, 
    alignItems: 'center', justifyContent: 'center',
    elevation: 3, shadowColor: '#000', shadowOpacity: 0.05, height: 140
  },
  iconContainer: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#EFF6FF', justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  label: { fontSize: 16, fontWeight: '600', color: '#334155' }
});