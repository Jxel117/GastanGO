import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useTransaction } from '../../context/TransactionContext';
import api from '../../services/api';

export default function AmountInputScreen({ navigation }) {
  const { transactionData, resetTransaction } = useTransaction();
  const [amount, setAmount] = useState('0');
  const [loading, setLoading] = useState(false);

  const handlePress = (val) => {
    if (amount === '0') setAmount(val);
    else setAmount(prev => prev + val);
  };

  const handleSave = async () => {
    if (parseFloat(amount) <= 0) return;
    setLoading(true);
    try {
      await api.post('/transactions', {
        ...transactionData,
        amount: parseFloat(amount),
        description: transactionData.description || `Gasto en ${transactionData.category}`
      });
      resetTransaction();
      navigation.popToTop(); // Vuelve al Dashboard
    } catch (error) {
      Alert.alert('Error', 'No se pudo guardar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.categoryBadge}>{transactionData.category}</Text>
      <Text style={styles.display}>${amount}</Text>

      <View style={styles.keypad}>
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
          <TouchableOpacity key={num} style={styles.key} onPress={() => handlePress(num.toString())}>
            <Text style={styles.keyText}>{num}</Text>
          </TouchableOpacity>
        ))}
        <TouchableOpacity style={styles.key} onPress={() => setAmount('0')}>
            <Text style={styles.keyText}>C</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.key} onPress={() => handlePress('0')}>
            <Text style={styles.keyText}>0</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.key} onPress={() => handlePress('.')}>
            <Text style={styles.keyText}>.</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={loading}>
        <Text style={styles.saveText}>{loading ? 'Guardando...' : 'Confirmar'}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F6F8FB', alignItems: 'center', justifyContent: 'flex-end', paddingBottom: 40 },
  categoryBadge: { backgroundColor: '#E2E8F0', paddingVertical: 5, paddingHorizontal: 15, borderRadius: 20, fontWeight: 'bold', color: '#64748B', marginBottom: 10 },
  display: { fontSize: 60, fontWeight: 'bold', color: '#1E293B', marginBottom: 40 },
  keypad: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', width: '80%', gap: 15 },
  key: { width: 70, height: 70, backgroundColor: '#fff', borderRadius: 35, justifyContent: 'center', alignItems: 'center', elevation: 2 },
  keyText: { fontSize: 24, fontWeight: '600', color: '#334155' },
  saveBtn: { marginTop: 30, backgroundColor: '#2563EB', width: '80%', padding: 18, borderRadius: 20, alignItems: 'center' },
  saveText: { color: '#fff', fontSize: 18, fontWeight: 'bold' }
});