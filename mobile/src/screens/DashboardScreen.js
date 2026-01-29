import React, { useEffect, useState, useContext } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, RefreshControl } from 'react-native';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import { MaterialIcons } from '@expo/vector-icons';

export default function DashboardScreen({ navigation }) {
  const { user, logout } = useContext(AuthContext);
  const [transactions, setTransactions] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchTransactions = async () => {
    try {
      const { data } = await api.get('/transactions');
      setTransactions(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchTransactions();
    setRefreshing(false);
  };

  useEffect(() => {
    // Escuchar el foco para recargar cuando volvemos de registrar algo
    const unsubscribe = navigation.addListener('focus', () => {
      fetchTransactions();
    });
    return unsubscribe;
  }, [navigation]);

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View>
        <Text style={styles.desc}>{item.description || item.category}</Text>
        <Text style={styles.cat}>{item.category}</Text>
      </View>
      <Text style={[styles.amount, { color: item.type === 'income' ? '#10B981' : '#EF4444' }]}>
        {item.type === 'income' ? '+' : '-'}${item.amount}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
            <Text style={styles.greeting}>Hola, {user?.username}</Text>
            <Text style={styles.subGreeting}>Tus finanzas al día</Text>
        </View>
        <TouchableOpacity onPress={logout}>
            <MaterialIcons name="logout" size={24} color="#64748B" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={transactions}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={{ paddingBottom: 100 }}
        ListEmptyComponent={<Text style={styles.empty}>No hay movimientos</Text>}
      />

      {/* Botón Flotante (FAB) para iniciar el flujo */}
      <TouchableOpacity 
        style={styles.fab} 
        onPress={() => navigation.navigate('TypeSelect')}
      >
        <MaterialIcons name="add" size={32} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F6F8FB', paddingTop: 50, paddingHorizontal: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  greeting: { fontSize: 24, fontWeight: 'bold', color: '#1E293B' },
  subGreeting: { color: '#64748B' },
  card: { backgroundColor: '#fff', padding: 20, borderRadius: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5, elevation: 2 },
  desc: { fontSize: 16, fontWeight: '600', color: '#334155' },
  cat: { fontSize: 12, color: '#94A3B8', marginTop: 4, textTransform: 'uppercase' },
  amount: { fontSize: 18, fontWeight: 'bold' },
  empty: { textAlign: 'center', marginTop: 50, color: '#94A3B8' },
  fab: { position: 'absolute', right: 20, bottom: 30, backgroundColor: '#2563EB', width: 60, height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center', elevation: 5, shadowColor: '#2563EB', shadowOpacity: 0.3, shadowRadius: 10 },
});