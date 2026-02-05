import React, { useState, useCallback, useContext } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../../services/api';
import { PieChart, BarChart } from 'react-native-chart-kit';
import { MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import { ThemeContext } from '../../context/ThemeContext';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

const screenWidth = Dimensions.get('window').width;

export default function ReportsScreen() {
  const { theme } = useContext(ThemeContext);
  const colors = theme.colors;
  const styles = getStyles(colors);

  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState([]);
  const [pieData, setPieData] = useState([]);
  const [barData, setBarData] = useState(null);
  const [insights, setInsights] = useState({ maxCat: '', maxAmount: 0, avgDaily: 0, totalTx: 0 });

  useFocusEffect(
    useCallback(() => {
      calculateStats();
    }, [])
  );

  const calculateStats = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const res = await api.get('/transactions', { headers: { 'x-auth-token': token } });
      const txs = res.data.filter(t => t.type === 'expense');
      setTransactions(txs);

      // 1. GRÁFICO CIRCULAR (Categorías)
      const categories = {};
      txs.forEach(t => {
        if (!categories[t.category]) categories[t.category] = 0;
        categories[t.category] += parseFloat(t.amount);
      });

      const pieColors = ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'];
      const pData = Object.keys(categories).map((cat, index) => ({
        name: cat,
        population: categories[cat],
        color: pieColors[index % pieColors.length],
        legendFontColor: colors.textSecondary,
        legendFontSize: 12
      }));
      setPieData(pData);

      // 2. INSIGHTS (Texto inteligente)
      let maxCatName = '';
      let maxCatVal = 0;
      let totalAmount = 0;

      Object.keys(categories).forEach(cat => {
        totalAmount += categories[cat];
        if (categories[cat] > maxCatVal) {
            maxCatVal = categories[cat];
            maxCatName = cat;
        }
      });

      // 3. GRÁFICO DE BARRAS (Últimos 7 días)
      const last7Days = {};
      const labels = [];
      const dataPoints = [];
      
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateKey = d.toISOString().split('T')[0]; // YYYY-MM-DD
        const dayName = d.toLocaleDateString('es-ES', { weekday: 'short' });
        
        last7Days[dateKey] = 0;
        labels.push(dayName);
      }

      txs.forEach(t => {
        const tDate = new Date(t.date).toISOString().split('T')[0];
        if (last7Days[tDate] !== undefined) {
            last7Days[tDate] += parseFloat(t.amount);
        }
      });

      Object.keys(last7Days).sort().forEach(key => {
        dataPoints.push(last7Days[key]);
      });

      setBarData({
        labels: labels,
        datasets: [{ data: dataPoints }]
      });

      setInsights({
        maxCat: maxCatName,
        maxAmount: maxCatVal,
        avgDaily: txs.length > 0 ? (totalAmount / 30).toFixed(2) : 0, // Promedio mensual estimado
        totalTx: txs.length
      });

    } catch (e) { console.log(e); } 
    finally { setLoading(false); }
  };

  // --- GENERAR PDF ---
  const generatePDF = async () => {
    const htmlContent = `
      <html>
        <head>
          <style>
            body { font-family: 'Helvetica'; padding: 20px; }
            h1 { color: #2563EB; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
            .summary { margin-top: 20px; padding: 15px; background-color: #f9f9f9; border-radius: 10px; }
          </style>
        </head>
        <body>
          <h1>Reporte Financiero GastanGO</h1>
          <p>Fecha de emisión: ${new Date().toLocaleDateString()}</p>
          
          <div class="summary">
            <h3>Resumen Ejecutivo</h3>
            <p><strong>Total de Movimientos:</strong> ${insights.totalTx}</p>
            <p><strong>Mayor Gasto:</strong> ${insights.maxCat} ($${insights.maxAmount})</p>
          </div>

          <h3>Detalle de Transacciones</h3>
          <table>
            <tr>
              <th>Fecha</th>
              <th>Categoría</th>
              <th>Monto</th>
            </tr>
            ${transactions.map(t => `
              <tr>
                <td>${new Date(t.date).toLocaleDateString()}</td>
                <td>${t.category}</td>
                <td>$${parseFloat(t.amount).toFixed(2)}</td>
              </tr>
            `).join('')}
          </table>
        </body>
      </html>
    `;

    try {
      const { uri } = await Print.printToFileAsync({ html: htmlContent });
      await Sharing.shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf' });
    } catch (error) {
      Alert.alert("Error", "No se pudo generar el reporte");
    }
  };

  if (loading) return <View style={styles.container}><ActivityIndicator size="large" color={colors.primary}/></View>;

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      
      {/* HEADER */}
      <View style={styles.headerRow}>
        <Text style={styles.headerTitle}>Reportes</Text>
        <TouchableOpacity style={styles.downloadBtn} onPress={generatePDF}>
            <MaterialIcons name="file-download" size={24} color="#fff" />
            <Text style={styles.downloadText}>PDF</Text>
        </TouchableOpacity>
      </View>

      {/* 1. TARJETAS DE INSIGHTS */}
      <View style={styles.statsContainer}>
        <View style={styles.statBox}>
            <FontAwesome5 name="fire" size={20} color={colors.danger} style={{marginBottom:8}} />
            <Text style={styles.statLabel}>Mayor Gasto</Text>
            <Text style={styles.statValue}>{insights.maxCat}</Text>
            <Text style={styles.statSub}>${insights.maxAmount}</Text>
        </View>
        <View style={styles.statBox}>
            <FontAwesome5 name="calendar-alt" size={20} color={colors.primary} style={{marginBottom:8}} />
            <Text style={styles.statLabel}>Prom. Diario</Text>
            <Text style={styles.statValue}>${insights.avgDaily}</Text>
            <Text style={styles.statSub}>Estimado mes</Text>
        </View>
        <View style={styles.statBox}>
            <FontAwesome5 name="receipt" size={20} color={colors.success} style={{marginBottom:8}} />
            <Text style={styles.statLabel}>Registros</Text>
            <Text style={styles.statValue}>{insights.totalTx}</Text>
            <Text style={styles.statSub}>Total</Text>
        </View>
      </View>

      {/* 2. TEXTO DE ANÁLISIS */}
      <View style={styles.textBox}>
        <Text style={styles.textTitle}>Análisis Semanal</Text>
        <Text style={styles.textContent}>
            Esta semana has realizado <Text style={{fontWeight:'bold'}}>{insights.totalTx}</Text> movimientos. 
            Tu categoría principal de consumo ha sido <Text style={{fontWeight:'bold', color: colors.danger}}>{insights.maxCat}</Text>. 
            {parseFloat(insights.avgDaily) > 50 
                ? " Tu promedio de gasto diario es alto, considera reducir gastos hormiga." 
                : " Mantienes un ritmo de gasto moderado."}
        </Text>
      </View>

      {/* 3. GRÁFICO DE BARRAS (Tendencia) */}
      <Text style={styles.chartTitle}>Gasto últimos 7 días</Text>
      {barData && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <BarChart
                data={barData}
                width={screenWidth - 20} 
                height={220}
                yAxisLabel="$"
                chartConfig={{
                    backgroundColor: colors.card,
                    backgroundGradientFrom: colors.card,
                    backgroundGradientTo: colors.card,
                    decimalPlaces: 0,
                    color: (opacity = 1) => colors.primary, // Color de las barras
                    labelColor: (opacity = 1) => colors.textSecondary,
                    barPercentage: 0.7,
                }}
                style={{ borderRadius: 16, marginVertical: 10 }}
                fromZero
            />
        </ScrollView>
      )}

      {/* 4. GRÁFICO CIRCULAR */}
      <Text style={styles.chartTitle}>Distribución por Categoría</Text>
      <View style={styles.pieCard}>
        {pieData.length > 0 ? (
            <PieChart
                data={pieData}
                width={screenWidth - 40}
                height={220}
                chartConfig={{
                    color: (opacity = 1) => colors.text,
                }}
                accessor={"population"}
                backgroundColor={"transparent"}
                paddingLeft={"15"}
                absolute
            />
        ) : <Text style={{textAlign:'center', padding:20, color: colors.textSecondary}}>Sin datos</Text>}
      </View>

      <View style={{height: 100}} /> 
    </ScrollView>
  );
}

const getStyles = (colors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: 20, paddingTop: 60 },
  
  // Header
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  headerTitle: { fontSize: 28, fontWeight: 'bold', color: colors.text },
  downloadBtn: { flexDirection: 'row', backgroundColor: colors.primary, paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20, alignItems: 'center' },
  downloadText: { color: '#fff', fontWeight: 'bold', marginLeft: 8 },

  // Stats Grid
  statsContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 25 },
  statBox: { width: '31%', backgroundColor: colors.card, padding: 12, borderRadius: 16, alignItems: 'center', elevation: 2, shadowColor: '#000', shadowOpacity: 0.05 },
  statLabel: { fontSize: 10, color: colors.textSecondary, textTransform: 'uppercase', fontWeight: 'bold' },
  statValue: { fontSize: 16, fontWeight: 'bold', color: colors.text, marginVertical: 2, textAlign: 'center' },
  statSub: { fontSize: 10, color: colors.textSecondary },

  // Text Analysis
  textBox: { backgroundColor: colors.card, padding: 20, borderRadius: 16, marginBottom: 25, borderLeftWidth: 4, borderLeftColor: colors.primary },
  textTitle: { fontSize: 16, fontWeight: 'bold', color: colors.text, marginBottom: 8 },
  textContent: { fontSize: 14, color: colors.textSecondary, lineHeight: 22 },

  // Charts
  chartTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15, color: colors.text, marginTop: 10 },
  pieCard: { backgroundColor: colors.card, borderRadius: 20, padding: 10, elevation: 2, alignItems: 'center' }
});