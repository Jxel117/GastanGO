import React, { useContext, useState, useCallback } from 'react';
import { 
  View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, StatusBar, Platform 
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
// 👇 RUTAS CORREGIDAS (Solo un ../)
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';
import api from '../services/api'; 
// 👆 ----------------------------
import { MaterialIcons, Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import * as Speech from 'expo-speech';

// 🎨 LISTA DE AVATARES
const AVATARS = [
    { id: '1', name: 'face', lib: 'MaterialIcons', color: '#3B82F6' },
    { id: '2', name: 'face-3', lib: 'MaterialIcons', color: '#EC4899' },
    { id: '3', name: 'face-6', lib: 'MaterialIcons', color: '#10B981' },
    { id: '4', name: 'user-astronaut', lib: 'FontAwesome5', color: '#8B5CF6' },
    { id: '5', name: 'user-ninja', lib: 'FontAwesome5', color: '#EF4444' },
    { id: '6', name: 'user-secret', lib: 'FontAwesome5', color: '#6B7280' },
    { id: '7', name: 'user-graduate', lib: 'FontAwesome5', color: '#F59E0B' },
    { id: '8', name: 'user-md', lib: 'FontAwesome5', color: '#0EA5E9' },
    { id: '9', name: 'ghost', lib: 'FontAwesome5', color: '#6366F1' },
    { id: '10', name: 'robot', lib: 'FontAwesome5', color: '#94A3B8' },
    { id: '11', name: 'dragon', lib: 'FontAwesome5', color: '#DC2626' },
    { id: '12', name: 'hat-wizard', lib: 'FontAwesome5', color: '#7C3AED' },
    { id: '13', name: 'cat', lib: 'FontAwesome5', color: '#F472B6' },
    { id: '14', name: 'dog', lib: 'FontAwesome5', color: '#A78BFA' },
    { id: '15', name: 'crow', lib: 'FontAwesome5', color: '#1F2937' },
    { id: '16', name: 'frog', lib: 'FontAwesome5', color: '#22C55E' },
    { id: '17', name: 'gamepad', lib: 'FontAwesome5', color: '#3B82F6' },
    { id: '18', name: 'music', lib: 'FontAwesome5', color: '#E11D48' },
    { id: '19', name: 'bicycle', lib: 'FontAwesome5', color: '#F97316' },
    { id: '20', name: 'camera', lib: 'FontAwesome5', color: '#06B6D4' },
];

export default function DashboardScreen({ navigation }) {
  const { user } = useContext(AuthContext);
  const { theme } = useContext(ThemeContext);
  const colors = theme.colors;
  const styles = getStyles(colors);

  const [transactions, setTransactions] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [summary, setSummary] = useState({ income: 0, expense: 0, balance: 0 });
  const [isSpeaking, setIsSpeaking] = useState(false);

  const userName = user?.username || 'Usuario';

  const fetchDashboardData = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) return;
      const res = await api.get('/transactions', { headers: { 'x-auth-token': token } });
      const sortedData = res.data.sort((a, b) => new Date(b.date) - new Date(a.date));
      setTransactions(sortedData);
      calculateSummary(sortedData);
    } catch (error) { console.log('Error data'); } 
    finally { setRefreshing(false); }
  };

  const calculateSummary = (data) => {
    let inc = 0, exp = 0;
    data.forEach(t => t.type === 'income' ? inc += parseFloat(t.amount) : exp += parseFloat(t.amount));
    setSummary({ income: inc, expense: exp, balance: inc - exp });
  };

  useFocusEffect(useCallback(() => { 
      fetchDashboardData(); 
      return () => Speech.stop();
  }, []));

  const onRefresh = () => { setRefreshing(true); fetchDashboardData(); };

  // --- FUNCIÓN PARA RENDERIZAR EL AVATAR EN EL HEADER ---
  const renderAvatar = () => {
    const avatarObj = AVATARS.find(a => a.name === user?.avatar);

    if (avatarObj) {
        return (
            <View style={[styles.avatar, { backgroundColor: avatarObj.color }]}>
                {avatarObj.lib === 'FontAwesome5' ? (
                    <FontAwesome5 name={avatarObj.name} size={18} color="#fff" />
                ) : (
                    <MaterialIcons name={avatarObj.name} size={20} color="#fff" />
                )}
            </View>
        );
    }
    
    return (
        <View style={[styles.avatar, { backgroundColor: colors.primary + '30' }]}>
            <Text style={[styles.avatarText, { color: colors.primary }]}>
                {userName.charAt(0).toUpperCase()}
            </Text>
        </View>
    );
  };

  const speakSummary = () => {
    if (isSpeaking) { Speech.stop(); setIsSpeaking(false); } 
    else {
      setIsSpeaking(true);
      let lastMoveText = "y aún no has registrado movimientos.";
      if (transactions.length > 0) {
        const last = transactions[0];
        const typeText = last.type === 'income' ? "un ingreso" : "un gasto";
        lastMoveText = `y tu último movimiento fue ${typeText} de ${parseFloat(last.amount).toFixed(2)} dólares en ${last.category}.`;
      }
      const textToSay = `¡Hola! Este es tu presupuesto actual: ${summary.balance.toFixed(2)} dólares, ${lastMoveText} ¡Ten un excelente día!`;
      Speech.speak(textToSay, { 
          pitch: 1.0, rate: 0.9, 
          onDone: () => setIsSpeaking(false), 
          onError: () => setIsSpeaking(false) 
      });
    }
  };

  const renderTransaction = ({ item }) => {
    const isExpense = item.type === 'expense';
    const iconName = isExpense ? 'arrow-downward' : 'arrow-upward';
    const iconColor = isExpense ? colors.danger : colors.success;
    const amountColor = isExpense ? colors.danger : colors.success;
    const iconBg = isExpense ? (theme.dark ? '#3A1D1D' : '#FFE5E5') : (theme.dark ? '#132F20' : '#E5F9F0');

    return (
      <View style={[styles.rowItem, { backgroundColor: colors.card }]}>
        <View style={[styles.rowIcon, { backgroundColor: iconBg }]}>
          <MaterialIcons name={iconName} size={26} color={iconColor} />
        </View>
        <View style={styles.rowText}>
          <Text style={[styles.rowTitle, { color: colors.text }]}>{item.category}</Text>
          <Text style={[styles.rowDate, { color: colors.textSecondary }]}>
            {new Date(item.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
          </Text>
        </View>
        <Text style={[styles.rowAmount, { color: amountColor }]}>
          {isExpense ? '-' : '+'}${Math.abs(item.amount).toFixed(2)}
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle={theme.dark ? "light-content" : "dark-content"} backgroundColor={colors.background} />

      <View style={styles.header}>
        <TouchableOpacity onPress={speakSummary} style={styles.iconBtn}>
          <Ionicons name={isSpeaking ? "volume-high" : "volume-medium-outline"} size={28} color={isSpeaking ? colors.primary : colors.text} />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Hola, {userName}</Text>

        <View style={styles.headerRight}>
          <TouchableOpacity onPress={() => navigation.navigate('Settings')} style={{ padding: 5 }}>
             <Ionicons name="notifications-outline" size={24} color={colors.text} style={{ marginRight: 15 }} />
          </TouchableOpacity>
          
          <TouchableOpacity onPress={() => navigation.navigate('Perfil')}>
             {renderAvatar()}
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={transactions}
        keyExtractor={item => item.id.toString()}
        renderItem={renderTransaction}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
        
        ListHeaderComponent={
          <>
            <View style={styles.balanceCard}>
              <Text style={styles.balanceLabel}>Balance Actual</Text>
              <Text style={styles.balanceAmount}>${summary.balance.toFixed(2)}</Text>
            </View>

            <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('TypeSelect')}>
              <View style={styles.actionButtonIcon}>
                <MaterialIcons name="add" size={24} color="#fff" />
              </View>
              <Text style={styles.actionButtonText}>Registrar Movimiento</Text>
              <MaterialIcons name="chevron-right" size={24} color={colors.primary} />
            </TouchableOpacity>

            <View style={styles.statsRow}>
              <View style={styles.statCard}>
                <View style={[styles.statIcon, { backgroundColor: theme.dark ? '#132F20' : '#E5F9F0' }]}>
                  <MaterialIcons name="arrow-upward" size={20} color={colors.success} />
                  <Text style={[styles.statLabel, { color: colors.success }]}>Ingresos</Text>
                </View>
                <Text style={[styles.statValue, { color: colors.success }]}>+${summary.income.toFixed(2)}</Text>
              </View>

              <View style={styles.statCard}>
                <View style={[styles.statIcon, { backgroundColor: theme.dark ? '#3A1D1D' : '#FFE5E5' }]}>
                  <MaterialIcons name="arrow-downward" size={20} color={colors.danger} />
                  <Text style={[styles.statLabel, { color: colors.danger }]}>Gastos</Text>
                </View>
                <Text style={[styles.statValue, { color: colors.danger }]}>-${summary.expense.toFixed(2)}</Text>
              </View>
            </View>

            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Movimientos Recientes</Text>
            </View>
          </>
        }
      />
    </View>
  );
}

const getStyles = (colors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, paddingHorizontal: 20 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: Platform.OS === 'android' ? 40 : 60, marginBottom: 20 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: colors.text },
  headerRight: { flexDirection: 'row', alignItems: 'center' },
  iconBtn: { padding: 5 },
  // Avatar estilo base
  avatar: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  avatarText: { fontWeight: 'bold' },
  balanceCard: { backgroundColor: colors.card, borderRadius: 24, padding: 25, alignItems: 'center', marginBottom: 20, elevation: 2 },
  balanceLabel: { fontSize: 14, color: colors.textSecondary, marginBottom: 8 },
  balanceAmount: { fontSize: 36, fontWeight: '900', color: colors.primary },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 30 },
  statCard: { backgroundColor: colors.card, width: '48%', padding: 16, borderRadius: 20, elevation: 2 },
  statIcon: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 20, marginBottom: 12 },
  statLabel: { fontSize: 12, fontWeight: 'bold', marginLeft: 4 },
  statValue: { fontSize: 20, fontWeight: 'bold' },
  sectionHeader: { marginBottom: 15 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: colors.text },
  rowItem: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 16, marginBottom: 12, elevation: 1 },
  rowIcon: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  rowText: { flex: 1 },
  rowTitle: { fontSize: 16, fontWeight: 'bold' },
  rowDate: { fontSize: 12, marginTop: 4 },
  rowAmount: { fontSize: 16, fontWeight: 'bold' },
  actionButton: { backgroundColor: colors.card, borderRadius: 20, padding: 12, flexDirection: 'row', alignItems: 'center', marginBottom: 20, elevation: 2 },
  actionButtonIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  actionButtonText: { fontSize: 16, fontWeight: 'bold', color: colors.text, flex: 1 },
});