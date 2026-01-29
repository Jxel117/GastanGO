import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTransaction } from '../../context/TransactionContext';
import { MaterialIcons } from '@expo/vector-icons';

export default function TypeSelectScreen({ navigation }) {
  const { updateTransaction } = useTransaction();

  const selectType = (type) => {
    updateTransaction('type', type);
    if (type === 'income') {
        updateTransaction('category', 'INGRESOS');
        navigation.navigate('AmountInput');
    } else {
        navigation.navigate('CategorySelect');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>¿Qué deseas registrar?</Text>
      <View style={styles.row}>
        <TouchableOpacity style={[styles.btn, styles.expense]} onPress={() => selectType('expense')}>
          <MaterialIcons name="trending-down" size={40} color="#DC2626" />
          <Text style={[styles.btnText, { color: '#DC2626' }]}>Gasto</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={[styles.btn, styles.income]} onPress={() => selectType('income')}>
          <MaterialIcons name="trending-up" size={40} color="#059669" />
          <Text style={[styles.btnText, { color: '#059669' }]}>Ingreso</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F6F8FB' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 40, color: '#1E293B' },
  row: { flexDirection: 'row', gap: 20 },
  btn: { width: 150, height: 150, borderRadius: 24, justifyContent: 'center', alignItems: 'center', borderWidth: 2 },
  expense: { backgroundColor: '#FEF2F2', borderColor: '#FECACA' },
  income: { backgroundColor: '#ECFDF5', borderColor: '#A7F3D0' },
  btnText: { marginTop: 10, fontSize: 18, fontWeight: 'bold' }
});