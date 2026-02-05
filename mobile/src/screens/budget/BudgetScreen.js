import React, { useState, useCallback, useContext } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Dimensions } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../../services/api';
import { ThemeContext } from '../../context/ThemeContext';
import { MaterialIcons, FontAwesome5 } from '@expo/vector-icons';

const screenWidth = Dimensions.get('window').width;

export default function BudgetScreen() {
  const { theme } = useContext(ThemeContext);
  const colors = theme.colors;
  const styles = getStyles(colors);

  const [loading, setLoading] = useState(true);
  const [income, setIncome] = useState(0);
  const [expense, setExpense] = useState(0);
  const [categoryData, setCategoryData] = useState([]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const loadData = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const res = await api.get('/transactions', { headers: { 'x-auth-token': token } });
      
      let inc = 0, exp = 0;
      const cats = {};

      res.data.forEach(t => {
        const val = parseFloat(t.amount);
        if (t.type === 'income') {
          inc += val;
        } else {
          exp += val;
          // Agrupar gastos por categoría
          if (!cats[t.category]) cats[t.category] = 0;
          cats[t.category] += val;
        }
      });

      // Convertir objeto de categorías a array ordenado por mayor gasto
      const sortedCats = Object.keys(cats)
        .map(key => ({ name: key, amount: cats[key] }))
        .sort((a, b) => b.amount - a.amount);

      setIncome(inc);
      setExpense(exp);
      setCategoryData(sortedCats);

    } catch (e) { console.log(e); } 
    finally { setLoading(false); }
  };

  if (loading) return <View style={styles.container}><ActivityIndicator size="large" color={colors.primary} /></View>;

  // Cálculos de presupuesto
  const savings = income - expense;
  const savingsRate = income > 0 ? (savings / income) * 100 : 0;
  const expenseRate = income > 0 ? (expense / income) : 0;

  // Estado financiero
  const getStatusColor = () => {
    if (expenseRate > 1) return colors.danger; // Rojo (Deuda)
    if (expenseRate > 0.8) return '#F59E0B'; // Naranja (Al limite)
    return colors.success; // Verde (Bien)
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.headerTitle}>Mi Presupuesto</Text>

      {/* 1. TARJETA PRINCIPAL: DISPONIBLE */}
      <View style={[styles.mainCard, { borderColor: getStatusColor() }]}>
        <Text style={styles.mainLabel}>Disponible para Ahorro</Text>
        <Text style={[styles.mainAmount, { color: getStatusColor() }]}>
            ${savings.toFixed(2)}
        </Text>
        <View style={styles.miniStatsRow}>
            <View>
                <Text style={styles.miniLabel}>Ingresos Reales</Text>
                <Text style={[styles.miniValue, {color: colors.success}]}>+${income.toFixed(2)}</Text>
            </View>
            <View style={{height: 20, width:1, backgroundColor: colors.border}}/>
            <View>
                <Text style={styles.miniLabel}>Gastos Totales</Text>
                <Text style={[styles.miniValue, {color: colors.danger}]}>-${expense.toFixed(2)}</Text>
            </View>
        </View>
      </View>

      {/* 2. CONSEJO INTELIGENTE */}
      <View style={styles.tipBox}>
        <FontAwesome5 name="lightbulb" size={20} color="#F59E0B" style={{marginRight: 10}}/>
        <Text style={styles.tipText}>
            {expenseRate > 1 
             ? "Estás gastando más de lo que ganas. Revisa tus gastos urgente." 
             : expenseRate > 0.8 
             ? "Cuidado, estás llegando al límite de tus ingresos."
             : "¡Excelente! Estás ahorrando el " + savingsRate.toFixed(0) + "% de tus ingresos."}
        </Text>
      </View>

      {/* 3. BARRA DE PROGRESO TOTAL */}
      <Text style={styles.sectionTitle}>Uso del Presupuesto</Text>
      <View style={styles.progressBarContainer}>
        <View style={[styles.progressBarFill, { 
            width: `${Math.min(expenseRate * 100, 100)}%`, 
            backgroundColor: getStatusColor() 
        }]} />
      </View>
      <Text style={styles.progressText}>Has usado el {(expenseRate * 100).toFixed(0)}% de tus ingresos</Text>

      {/* 4. LISTA DE GASTOS POR CATEGORÍA CON BARRAS */}
      <Text style={styles.sectionTitle}>Distribución del Gasto</Text>
      <View style={styles.listContainer}>
        {categoryData.length > 0 ? categoryData.map((cat, index) => {
            // Qué porcentaje del Ingreso representa esta categoría
            const catPercentage = income > 0 ? (cat.amount / income) : 0;
            const barWidth = Math.min(catPercentage * 100, 100);
            
            // Si una sola categoría gasta más del 30% del ingreso, alerta roja
            const barColor = catPercentage > 0.3 ? colors.danger : colors.primary;

            return (
                <View key={index} style={styles.catRow}>
                    <View style={styles.catHeader}>
                        <View style={{flexDirection:'row', alignItems:'center'}}>
                            <MaterialIcons name="label-outline" size={18} color={colors.textSecondary} />
                            <Text style={styles.catName}>{cat.name}</Text>
                        </View>
                        <Text style={styles.catAmount}>${cat.amount.toFixed(2)}</Text>
                    </View>
                    
                    {/* Barra de la categoría */}
                    <View style={styles.catBarBg}>
                        <View style={[styles.catBarFill, { width: `${barWidth}%`, backgroundColor: barColor }]} />
                    </View>
                    <Text style={styles.catPercent}>{(catPercentage * 100).toFixed(1)}% de tus ingresos</Text>
                </View>
            );
        }) : (
            <Text style={{color: colors.textSecondary, textAlign: 'center', margin: 20}}>
                No hay gastos registrados aún.
            </Text>
        )}
      </View>
      
      <View style={{height: 100}} />
    </ScrollView>
  );
}

const getStyles = (colors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: 20, paddingTop: 60 },
  headerTitle: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, color: colors.text },
  
  // Main Card
  mainCard: { backgroundColor: colors.card, padding: 25, borderRadius: 20, alignItems: 'center', borderWidth: 1, elevation: 2, marginBottom: 20 },
  mainLabel: { fontSize: 14, color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: 1 },
  mainAmount: { fontSize: 40, fontWeight: '900', marginVertical: 10 },
  miniStatsRow: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginTop: 15, paddingTop: 15, borderTopWidth: 1, borderTopColor: colors.border },
  miniLabel: { fontSize: 12, color: colors.textSecondary },
  miniValue: { fontSize: 16, fontWeight: 'bold' },

  // Tip Box
  tipBox: { flexDirection: 'row', backgroundColor: colors.card, padding: 15, borderRadius: 12, alignItems: 'center', marginBottom: 25 },
  tipText: { flex: 1, fontSize: 14, color: colors.text, lineHeight: 20 },

  // Global Progress
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: colors.text, marginBottom: 15, marginTop: 10 },
  progressBarContainer: { height: 16, backgroundColor: colors.border, borderRadius: 8, overflow: 'hidden', marginBottom: 8 },
  progressBarFill: { height: '100%', borderRadius: 8 },
  progressText: { fontSize: 12, color: colors.textSecondary, textAlign: 'right' },

  // Category List
  listContainer: { backgroundColor: colors.card, borderRadius: 16, padding: 15 },
  catRow: { marginBottom: 20 },
  catHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
  catName: { fontSize: 16, fontWeight: '600', color: colors.text, marginLeft: 8 },
  catAmount: { fontSize: 16, fontWeight: 'bold', color: colors.text },
  catBarBg: { height: 8, backgroundColor: colors.border, borderRadius: 4, overflow: 'hidden' },
  catBarFill: { height: '100%', borderRadius: 4 },
  catPercent: { fontSize: 11, color: colors.textSecondary, marginTop: 4 }
});