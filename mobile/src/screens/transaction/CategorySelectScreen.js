import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList } from 'react-native';
import { useTransaction } from '../../context/TransactionContext';
import { MaterialIcons } from '@expo/vector-icons';

const categories = [
  { id: '1', name: 'Comida', icon: 'restaurant' },
  { id: '2', name: 'Transporte', icon: 'directions-bus' },
  { id: '3', name: 'Hogar', icon: 'home' },
  { id: '4', name: 'Entretenimiento', icon: 'movie' },
  { id: '5', name: 'Salud', icon: 'medical-services' },
  { id: '6', name: 'Ropa', icon: 'checkroom' },
];

export default function CategorySelectScreen({ navigation }) {
  const { updateTransaction } = useTransaction();

  const handleSelect = (catName) => {
    updateTransaction('category', catName);
    navigation.navigate('AmountInput');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Categoría</Text>
      <FlatList 
        data={categories}
        numColumns={2}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.item} onPress={() => handleSelect(item.name)}>
            <MaterialIcons name={item.icon} size={32} color="#2563EB" />
            <Text style={styles.itemText}>{item.name}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 60, paddingHorizontal: 20, backgroundColor: '#F6F8FB' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center', color: '#1E293B' },
  item: { flex: 1, margin: 8, backgroundColor: '#fff', height: 120, borderRadius: 20, justifyContent: 'center', alignItems: 'center', elevation: 2 },
  itemText: { marginTop: 8, fontWeight: '600', color: '#475569' }
});