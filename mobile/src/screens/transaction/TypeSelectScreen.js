import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, StatusBar } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

export default function TypeSelectScreen({ navigation }) {
  
  const selectType = (type) => {
    if (type === 'income') {
        navigation.navigate('AmountInput', { 
            type: 'income', 
            category: { name: 'Ingreso', icon: 'attach-money' } 
        });
    } else {
        navigation.navigate('CategorySelect', { type: 'expense' });
    }
  };

  return (
    <View style={styles.container}>
      {/* HEADER SEGURO (Con zIndex para que el botón funcione) */}
      <View style={styles.header}>
        <View style={{flex: 1}}></View> 
        <TouchableOpacity 
          onPress={() => navigation.goBack()} 
          style={styles.closeBtn}
          activeOpacity={0.7} // Feedback visual al tocar
        >
          <MaterialIcons name="close" size={32} color="#374151" />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>¿Qué deseas registrar?</Text>
        
        <View style={styles.row}>        
          {/* Opción Ingreso */}
          <TouchableOpacity style={[styles.btn, styles.income]} onPress={() => selectType('income')}>
            <View style={[styles.iconCircle, { backgroundColor: '#A7F3D0' }]}>
                <MaterialIcons name="arrow-upward" size={40} color="#059669" />
            </View>
            <Text style={[styles.btnText, { color: '#059669' }]}>Ingreso</Text>
          </TouchableOpacity>

          {/* Opción Gasto */}
          <TouchableOpacity style={[styles.btn, styles.expense]} onPress={() => selectType('expense')}>
            <View style={[styles.iconCircle, { backgroundColor: '#FECACA' }]}>
                <MaterialIcons name="arrow-downward" size={40} color="#DC2626" />
            </View>
            <Text style={[styles.btnText, { color: '#DC2626' }]}>Gasto</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { 
    flexDirection: 'row', 
    justifyContent: 'flex-end', 
    paddingHorizontal: 20, 
    marginTop: Platform.OS === 'android' ? StatusBar.currentHeight + 10 : 50,
    zIndex: 10, // <--- ESTO ARREGLA EL CLICK (pone el botón encima de todo)
    elevation: 10 // Para Android
  },
  closeBtn: { padding: 8, backgroundColor: '#E2E8F0', borderRadius: 20 },
  content: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginTop: -50 // Esto subía el contenido y tapaba el botón, el zIndex lo soluciona
  },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 50, color: '#1E293B' },
  row: { flexDirection: 'row', gap: 20 },
  btn: { width: 150, height: 160, borderRadius: 24, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff', elevation: 4, shadowColor: '#000', shadowOpacity: 0.1 },
  expense: { borderBottomWidth: 4, borderBottomColor: '#EF4444' },
  income: { borderBottomWidth: 4, borderBottomColor: '#10B981' },
  iconCircle: { width: 70, height: 70, borderRadius: 35, justifyContent: 'center', alignItems: 'center', marginBottom: 15 },
  btnText: { fontSize: 18, fontWeight: 'bold' }
});