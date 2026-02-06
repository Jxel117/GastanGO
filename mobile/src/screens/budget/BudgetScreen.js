import React, { useState, useCallback, useContext } from 'react';
import { 
  View, Text, StyleSheet, ScrollView, ActivityIndicator, Dimensions, 
  TouchableOpacity, TextInput, Alert, Modal 
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../../services/api';
import { ThemeContext } from '../../context/ThemeContext';
import { MaterialIcons, FontAwesome5 } from '@expo/vector-icons';

export default function BudgetScreen() {
  const { theme } = useContext(ThemeContext);
  const colors = theme.colors;
  const styles = getStyles(colors);

  const [loading, setLoading] = useState(true);
  const [income, setIncome] = useState(0);
  const [expense, setExpense] = useState(0);
  
  // META DE AHORRO (Inicia en 0, pero carga lo guardado)
  const [savingsGoal, setSavingsGoal] = useState(0); 
  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [tempGoal, setTempGoal] = useState('');

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const loadData = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      
      // 1. Cargar Transacciones
      const res = await api.get('/transactions', { headers: { 'x-auth-token': token } });
      let inc = 0, exp = 0;
      res.data.forEach(t => {
        const val = parseFloat(t.amount);
        if (t.type === 'income') inc += val;
        else exp += val;
      });
      setIncome(inc);
      setExpense(exp);

      // 2. Cargar Meta Guardada
      // NOTA: Si ves 10 aquí, es porque se quedó guardado de una prueba anterior en tu teléfono.
      const savedGoal = await AsyncStorage.getItem('userSavingsGoal');
      if (savedGoal) {
          setSavingsGoal(parseFloat(savedGoal));
      } else {
          setSavingsGoal(0); // Si no hay nada guardado, es 0
      }

    } catch (e) { console.log(e); } 
    finally { setLoading(false); }
  };

  const saveGoal = async () => {
    // Permitir guardar 0 o vacío para reiniciar la meta
    const goalVal = tempGoal === '' ? 0 : parseFloat(tempGoal);
    
    if (isNaN(goalVal)) {
        return Alert.alert("Error", "Ingresa un número válido");
    }
    
    setSavingsGoal(goalVal);
    await AsyncStorage.setItem('userSavingsGoal', goalVal.toString());
    setIsEditingGoal(false);
  };

  // Función para abrir el modal de edición
  const openEditModal = () => {
      // Si es 0, mostramos vacío para facilitar la escritura
      setTempGoal(savingsGoal === 0 ? '' : savingsGoal.toString());
      setIsEditingGoal(true);
  };

  if (loading) return <View style={styles.container}><ActivityIndicator size="large" color={colors.primary} /></View>;

  // CÁLCULOS
  const currentSavings = income - expense;
  const progress = savingsGoal > 0 ? (currentSavings / savingsGoal) : 0;
  const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
  const daysLeft = daysInMonth - new Date().getDate();
  
  const remainingBudget = income - expense - savingsGoal;
  const dailyBudget = daysLeft > 0 ? (remainingBudget / daysLeft) : 0;

  // Formato Moneda
  const format = (val) => `$${val.toFixed(2)}`;

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      
      {/* HEADER */}
      <View style={styles.headerRow}>
          <Text style={styles.headerTitle}>Ahorro Mensual</Text>
          <TouchableOpacity onPress={openEditModal}>
              <MaterialIcons name="edit" size={24} color={colors.primary} />
          </TouchableOpacity>
      </View>

      {/* 1. TARJETA DE META */}
      <View style={styles.goalCard}>
          <Text style={styles.goalLabel}>Meta</Text>
          <Text style={styles.goalAmount}>{format(savingsGoal)}</Text>
          
          <View style={styles.progressBg}>
              <View style={[styles.progressFill, { width: `${Math.min(progress * 100, 100)}%`, backgroundColor: progress >= 1 ? colors.success : colors.primary }]} />
          </View>
          
          <View style={styles.goalFooter}>
              <Text style={styles.goalFooterText}>
                  Saldo Disponible: <Text style={{fontWeight:'bold', color: currentSavings >= savingsGoal ? colors.success : colors.text}}>{format(currentSavings)}</Text>
              </Text>
              <Text style={styles.goalFooterText}>{Math.min(progress * 100, 100).toFixed(0)}%</Text>
          </View>
      </View>

      {/* 🔥 INSIGNIA DE META CUMPLIDA (CENTRADA) 🔥 */}
      {progress >= 1 && savingsGoal > 0 && (
          <View style={styles.badgeContainer}>
              <View style={styles.congratsBadge}>
                  <FontAwesome5 name="medal" size={14} color="#fff" />
                  <Text style={styles.congratsText}>¡Meta Cumplida!</Text>
              </View>
          </View>
      )}

      {/* 2. PRESUPUESTO INTELIGENTE */}
      <Text style={styles.sectionTitle}>Presupuesto Inteligente</Text>
      <View style={styles.smartCard}>
          <View style={styles.smartRow}>
              <View style={[styles.iconBox, {backgroundColor: '#EFF6FF'}]}>
                  <MaterialIcons name="today" size={24} color="#2563EB" />
              </View>
              <View style={{flex:1}}>
                  <Text style={styles.smartLabel}>Puedes gastar hoy</Text>
                  <Text style={[styles.smartValue, { color: dailyBudget < 0 ? colors.danger : colors.text }]}>
                      {dailyBudget < 0 ? '$0.00' : format(dailyBudget)}
                  </Text>
                  <Text style={styles.smartSub}>sin afectar tu meta de ahorro</Text>
              </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.smartRow}>
              <View style={[styles.iconBox, {backgroundColor: '#ECFDF5'}]}>
                  <MaterialIcons name="account-balance-wallet" size={24} color="#10B981" />
              </View>
              <View style={{flex:1}}>
                  <Text style={styles.smartLabel}>Restante del mes</Text>
                  <Text style={[styles.smartValue, { color: remainingBudget < 0 ? colors.danger : colors.text }]}>
                      {remainingBudget < 0 ? `Deficit: ${format(Math.abs(remainingBudget))}` : format(remainingBudget)}
                  </Text>
                  <Text style={styles.smartSub}>libre para gastos varios</Text>
              </View>
          </View>
      </View>

      {/* 3. CONSEJO */}
      <View style={[styles.tipCard, { borderColor: remainingBudget < 0 ? colors.danger : colors.success }]}>
          <FontAwesome5 
            name={remainingBudget < 0 ? "exclamation-triangle" : "smile-wink"} 
            size={24} 
            color={remainingBudget < 0 ? colors.danger : colors.success} 
          />
          <Text style={styles.tipText}>
              {remainingBudget < 0 
                ? "¡Cuidado! Para cumplir tu meta, necesitas reducir gastos o aumentar ingresos."
                : "Vas por buen camino. Si mantienes este ritmo, alcanzarás tu meta sin problemas."}
          </Text>
      </View>

      {/* MODAL */}
      <Modal visible={isEditingGoal} transparent animationType="slide">
          <View style={styles.modalOverlay}>
              <View style={[styles.modalCard, {backgroundColor: colors.card}]}>
                  <Text style={[styles.modalTitle, {color: colors.text}]}>Definir Meta de Ahorro</Text>
                  <Text style={styles.modalSub}>¿Cuánto quieres guardar este mes?</Text>
                  
                  <TextInput 
                      style={[styles.modalInput, {color: colors.text, borderColor: colors.border}]}
                      value={tempGoal}
                      onChangeText={setTempGoal}
                      keyboardType="numeric"
                      placeholder="$0.00"
                      placeholderTextColor={colors.textSecondary}
                      autoFocus
                  />
                  
                  <View style={styles.modalButtons}>
                      <TouchableOpacity onPress={() => setIsEditingGoal(false)} style={styles.cancelBtn}>
                          <Text style={styles.cancelText}>Cancelar</Text>
                      </TouchableOpacity>
                      <TouchableOpacity onPress={saveGoal} style={styles.saveBtn}>
                          <Text style={styles.saveText}>Guardar</Text>
                      </TouchableOpacity>
                  </View>
              </View>
          </View>
      </Modal>

      <View style={{height: 100}} />
    </ScrollView>
  );
}

const getStyles = (colors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: 20, paddingTop: 60 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: colors.text },
  
  // Goal Card
  goalCard: { backgroundColor: colors.card, padding: 25, borderRadius: 24, marginBottom: 15, elevation: 4, shadowColor: colors.primary, shadowOpacity: 0.15, shadowRadius: 10, shadowOffset: {width:0, height:4} },
  goalLabel: { fontSize: 14, color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: 1, textAlign: 'center' },
  goalAmount: { fontSize: 36, fontWeight: '900', color: colors.primary, textAlign: 'center', marginVertical: 10 },
  progressBg: { height: 12, backgroundColor: colors.border, borderRadius: 6, overflow: 'hidden', marginBottom: 10 },
  progressFill: { height: '100%', borderRadius: 6 },
  goalFooter: { flexDirection: 'row', justifyContent: 'space-between' },
  goalFooterText: { fontSize: 14, color: colors.textSecondary },
  
  // Badge Centrado
  badgeContainer: { alignItems: 'center', marginBottom: 25 },
  congratsBadge: { backgroundColor: colors.success, paddingHorizontal: 15, paddingVertical: 8, borderRadius: 20, flexDirection: 'row', alignItems: 'center', gap: 8, elevation: 3 },
  congratsText: { color: '#fff', fontSize: 14, fontWeight: 'bold' },

  // Smart Budget
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: colors.text, marginBottom: 15 },
  smartCard: { backgroundColor: colors.card, borderRadius: 20, padding: 20, elevation: 2 },
  smartRow: { flexDirection: 'row', alignItems: 'center', gap: 15 },
  iconBox: { width: 48, height: 48, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  smartLabel: { fontSize: 14, color: colors.textSecondary },
  smartValue: { fontSize: 22, fontWeight: 'bold' },
  smartSub: { fontSize: 12, color: colors.textSecondary },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: 15 },

  tipCard: { flexDirection: 'row', alignItems: 'center', gap: 15, backgroundColor: colors.card, padding: 20, borderRadius: 16, marginTop: 25, borderWidth: 1, borderLeftWidth: 5 },
  tipText: { flex: 1, fontSize: 14, color: colors.text, lineHeight: 20 },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalCard: { width: '85%', padding: 25, borderRadius: 24, elevation: 5 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', textAlign: 'center', marginBottom: 10 },
  modalSub: { fontSize: 14, color: colors.textSecondary, textAlign: 'center', marginBottom: 20 },
  modalInput: { fontSize: 32, fontWeight: 'bold', textAlign: 'center', borderBottomWidth: 2, paddingBottom: 10, marginBottom: 30 },
  modalButtons: { flexDirection: 'row', justifyContent: 'space-between', gap: 15 },
  cancelBtn: { flex: 1, padding: 15, borderRadius: 12, backgroundColor: colors.border, alignItems: 'center' },
  cancelText: { fontWeight: 'bold', color: colors.textSecondary },
  saveBtn: { flex: 1, padding: 15, borderRadius: 12, backgroundColor: colors.primary, alignItems: 'center' },
  saveText: { fontWeight: 'bold', color: '#fff' }
});