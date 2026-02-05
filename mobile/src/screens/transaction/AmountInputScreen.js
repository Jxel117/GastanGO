import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, Platform, StatusBar } from 'react-native';
import api from '../../services/api';
import { MaterialIcons, FontAwesome5 } from '@expo/vector-icons';

export default function AmountInputScreen({ route, navigation }) {
  const { type, category } = route.params;
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);

  // Función para manejar las teclas del teclado personalizado
  const handlePress = (val) => {
    if (val === 'back') {
      setAmount(prev => prev.slice(0, -1));
      return;
    }
    if (val === '.' && amount.includes('.')) return;
    if (amount.length > 8) return; // Límite de caracteres
    setAmount(prev => prev + val);
  };

  const handleSave = async () => {
    if (!amount || parseFloat(amount) <= 0) return Alert.alert("Error", "Ingresa un monto válido");
    
    setLoading(true);
    try {
      await api.post('/transactions', {
        amount: parseFloat(amount),
        type,
        category: category.name,
        categoryIcon: category.icon,
        date: new Date()
      });
      navigation.popToTop(); 
    } catch (error) {
      Alert.alert('Error', 'No se pudo guardar');
    } finally {
      setLoading(false);
    }
  };

  // Componente de Botón del Teclado
  const KeyButton = ({ value, label, icon }) => (
    <TouchableOpacity style={styles.keyBtn} onPress={() => handlePress(value)}>
      {icon ? <MaterialIcons name={icon} size={28} color="#374151" /> : <Text style={styles.keyText}>{label || value}</Text>}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <MaterialIcons name="arrow-back" size={28} color="#374151" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{category.name}</Text>
        <View style={{width: 40}} /> 
      </View>

      {/* PANTALLA DE VISUALIZACIÓN */}
      <View style={styles.displayContainer}>
         <Text style={styles.label}>Monto a registrar</Text>
         <View style={styles.amountWrapper}>
            <Text style={[styles.currency, { color: type === 'expense' ? '#EF4444' : '#10B981' }]}>$</Text>
            <Text style={[styles.amountText, { color: type === 'expense' ? '#EF4444' : '#10B981' }]}>
                {amount || '0'}
            </Text>
         </View>
      </View>

      {/* TECLADO NUMÉRICO PERSONALIZADO */}
      <View style={styles.keyboard}>
        <View style={styles.row}>
            <KeyButton value="1" />
            <KeyButton value="2" />
            <KeyButton value="3" />
        </View>
        <View style={styles.row}>
            <KeyButton value="4" />
            <KeyButton value="5" />
            <KeyButton value="6" />
        </View>
        <View style={styles.row}>
            <KeyButton value="7" />
            <KeyButton value="8" />
            <KeyButton value="9" />
        </View>
        <View style={styles.row}>
            <KeyButton value="." />
            <KeyButton value="0" />
            <KeyButton value="back" icon="backspace" />
        </View>

        {/* BOTÓN CONFIRMAR */}
        <TouchableOpacity style={styles.confirmBtn} onPress={handleSave} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.confirmText}>Confirmar</Text>}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { 
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', 
    paddingHorizontal: 20, 
    marginTop: Platform.OS === 'android' ? StatusBar.currentHeight + 20 : 60
  },
  backBtn: { padding: 8, backgroundColor: '#E2E8F0', borderRadius: 12 },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#64748B' },

  displayContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  label: { fontSize: 16, color: '#94A3B8', marginBottom: 10 },
  amountWrapper: { flexDirection: 'row', alignItems: 'center' },
  currency: { fontSize: 40, fontWeight: 'bold', marginRight: 5 },
  amountText: { fontSize: 60, fontWeight: 'bold' },

  keyboard: { backgroundColor: '#fff', borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 20, paddingBottom: 40, elevation: 10, shadowColor: '#000', shadowOpacity: 0.1 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
  keyBtn: { width: '30%', height: 60, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F1F5F9', borderRadius: 15 },
  keyText: { fontSize: 24, fontWeight: 'bold', color: '#334155' },

  confirmBtn: { backgroundColor: '#2563EB', height: 60, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginTop: 10 },
  confirmText: { color: '#fff', fontSize: 20, fontWeight: 'bold' }
});