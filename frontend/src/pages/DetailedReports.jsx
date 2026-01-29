import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import toast from 'react-hot-toast';
import api from '../services/api';
import CardTransition from './components/CardTransition';
import * as XLSX from 'xlsx';

// --- UTILIDADES ---
function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const formatCurrency = (amount) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Math.abs(amount));

const CATEGORY_COLORS = {
  'Comida': '#a855f7',
  'Transporte': '#10b981',
  'Vivienda': '#3b82f6',
  'Entretenimiento': '#f97316',
  'Salud': '#f87171',
  'Ropa': '#6b7280',
  'Apuesta': '#eab308',
  'Otros': '#64748b'
};

const CATEGORY_ICONS = {
  'Alimentación': { icon: 'restaurant', color: 'emerald' },
  'Comida': { icon: 'shopping_cart', color: 'emerald' },
  'Transporte': { icon: 'directions_car', color: 'cyan' },
  'Vivienda': { icon: 'home', color: 'blue' },
  'Ocio': { icon: 'movie', color: 'amber' },
  'Entretenimiento': { icon: 'movie', color: 'amber' },
  'Salud': { icon: 'health_and_safety', color: 'red' },
  'Salario': { icon: 'work', color: 'blue' },
  'Ingresos': { icon: 'trending_up', color: 'emerald' },
  'Inversión': { icon: 'trending_up', color: 'emerald' },
  'Ropa': { icon: 'checkroom', color: 'purple' },
  'Apuesta': { icon: 'casino', color: 'yellow' },
  'Educación': { icon: 'school', color: 'indigo' },
  'Hogar': { icon: 'home_repair_service', color: 'blue' },
  'Otros': { icon: 'category', color: 'slate' }
};

const TRANSACTIONS_PER_PAGE = 10;

const cardStyle = "w-full h-full bg-white rounded-[20px] shadow-sm border border-slate-200 p-6 flex flex-col";

const StatCard = ({ title, amount, percentage, color, icon }) => {
  const isPositiveTrend = parseFloat(percentage) >= 0;
  let trendColor = isPositiveTrend ? 'text-emerald-600' : 'text-red-600';
  if (color === 'red') trendColor = isPositiveTrend ? 'text-red-600' : 'text-emerald-600';

  const iconBg = {
    red: "bg-red-50 text-red-600",
    emerald: "bg-emerald-50 text-emerald-600",
    blue: "bg-blue-50 text-blue-600"
  };

  return (
    <CardTransition>
      <div className={cn(cardStyle, "hover:shadow-md transition-shadow")}>
        <div className="flex justify-between items-start mb-4">
          <p className="text-sm font-bold text-slate-500 uppercase tracking-wide">{title}</p>
          <div className={cn("p-2 rounded-xl", iconBg[color] || iconBg.blue)}>
            <span className="material-symbols-outlined text-[22px]">{icon}</span>
          </div>
        </div>
        <p className="text-3xl font-extrabold text-slate-800">{formatCurrency(amount)}</p>
        <div className={cn("text-xs font-bold mt-2 flex items-center gap-1", trendColor)}>
          <span className="material-symbols-outlined text-[16px]">
            {isPositiveTrend ? 'trending_up' : 'trending_down'}
          </span>
          <span>{percentage > 0 ? '+' : ''}{percentage}% vs periodo anterior</span>
        </div>
      </div>
    </CardTransition>
  );
};

const ToggleSwitch = ({ activeTab, onChange }) => (
  <div className="flex bg-slate-100 rounded-lg p-1 relative w-64 h-10 border border-slate-200">
    <motion.div 
      layout 
      className="absolute top-1 bottom-1 bg-white rounded-md shadow-sm z-0 border border-slate-200/50"
      initial={false}
      animate={{ 
        x: activeTab === 'monthly' ? 0 : '100%', 
        width: '50%' 
      }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    />
    <button 
      onClick={() => onChange('monthly')} 
      className={cn(
        "relative z-10 w-1/2 flex items-center justify-center text-sm font-bold transition-colors",
        activeTab === 'monthly' ? "text-slate-800" : "text-slate-400"
      )}
    >
      Mensual
    </button>
    <button 
      onClick={() => onChange('annual')} 
      className={cn(
        "relative z-10 w-1/2 flex items-center justify-center text-sm font-bold transition-colors",
        activeTab === 'annual' ? "text-slate-800" : "text-slate-400"
      )}
    >
      Anual
    </button>
  </div>
);

// --- COMPONENTE PRINCIPAL ---
export default function DetailedReports() {
  const [allTransactions, setAllTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('monthly');
  const [showAllTransactions, setShowAllTransactions] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [isExportOpen, setIsExportOpen] = useState(false);

  // Estados procesados
  const [stats, setStats] = useState({ 
    income: 0, 
    expense: 0, 
    balance: 0, 
    incomePct: 0, 
    expensePct: 0, 
    balancePct: 0 
  });
  const [chartData, setChartData] = useState([]);
  const [pieData, setPieData] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);

  // 1. FETCH
  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setLoading(true);
        const { data } = await api.get('/transactions');
        const list = Array.isArray(data) ? data : data.transactions || [];
        setAllTransactions(list);
      } catch (error) {
        toast.error("Error cargando reporte");
      } finally {
        setLoading(false);
      }
    };
    fetchTransactions();
  }, []);

  // 2. PROCESAMIENTO
  useEffect(() => {
    if (loading) return;

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const isCurrentPeriod = (date) => {
      if (timeRange === 'monthly') {
        return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
      }
      return date.getFullYear() === currentYear;
    };

    const isPreviousPeriod = (date) => {
      if (timeRange === 'monthly') {
        if (currentMonth === 0) {
          return date.getMonth() === 11 && date.getFullYear() === currentYear - 1;
        }
        return date.getMonth() === currentMonth - 1 && date.getFullYear() === currentYear;
      }
      return date.getFullYear() === currentYear - 1;
    };

    const currentTx = [];
    const previousTx = [];

    allTransactions.forEach(tx => {
      const d = new Date(tx.date || tx.createdAt);
      if (isCurrentPeriod(d)) currentTx.push(tx);
      else if (isPreviousPeriod(d)) previousTx.push(tx);
    });

    setFilteredTransactions(currentTx);

    const calcTotals = (list) => {
      let inc = 0, exp = 0;
      list.forEach(tx => {
        const amt = parseFloat(tx.amount);
        tx.type === 'income' ? inc += amt : exp += amt;
      });
      return { inc, exp, bal: inc - exp };
    };

    const currentStats = calcTotals(currentTx);
    const prevStats = calcTotals(previousTx);

    const calcPct = (curr, prev) => {
      if (prev === 0) return curr === 0 ? 0 : 100;
      return ((curr - prev) / prev * 100).toFixed(1);
    };

    setStats({
      income: currentStats.inc,
      expense: currentStats.exp,
      balance: currentStats.bal,
      incomePct: calcPct(currentStats.inc, prevStats.inc),
      expensePct: calcPct(currentStats.exp, prevStats.exp),
      balancePct: calcPct(currentStats.bal, prevStats.bal)
    });

    // Pie Chart
    const expenses = currentTx.filter(tx => tx.type === 'expense');
    const catMap = {};
    expenses.forEach(tx => {
      const amt = parseFloat(tx.amount);
      catMap[tx.category] = (catMap[tx.category] || 0) + amt;
    });

    const processedPie = Object.keys(catMap).map(key => ({
      name: key,
      value: catMap[key],
      percentage: ((catMap[key] / currentStats.exp) * 100).toFixed(1),
      color: CATEGORY_COLORS[key] || CATEGORY_COLORS['Otros']
    })).sort((a, b) => b.value - a.value);

    setPieData(processedPie);

    // Area Chart
    const evolutionMap = {};
    if (timeRange === 'annual') {
      const monthNames = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
      monthNames.forEach((m, i) => evolutionMap[m] = { name: m, ingresos: 0, gastos: 0, order: i });
      currentTx.forEach(tx => {
        const d = new Date(tx.date || tx.createdAt);
        const key = monthNames[d.getMonth()];
        tx.type === 'income' ? evolutionMap[key].ingresos += parseFloat(tx.amount) : evolutionMap[key].gastos += parseFloat(tx.amount);
      });
    } else {
      currentTx.forEach(tx => {
        const d = new Date(tx.date || tx.createdAt);
        const day = d.getDate();
        let weekStr = "";
        if (day <= 7) weekStr = "Sem 1";
        else if (day <= 14) weekStr = "Sem 2";
        else if (day <= 21) weekStr = "Sem 3";
        else weekStr = "Sem 4+";
        
        if (!evolutionMap[weekStr]) evolutionMap[weekStr] = { name: weekStr, ingresos: 0, gastos: 0, order: day };
        tx.type === 'income' ? evolutionMap[weekStr].ingresos += parseFloat(tx.amount) : evolutionMap[weekStr].gastos += parseFloat(tx.amount);
      });
    }

    const processedChart = Object.values(evolutionMap)
      .sort((a, b) => timeRange === 'annual' ? a.order - b.order : a.name.localeCompare(b.name));
    setChartData(processedChart);
  }, [allTransactions, timeRange, loading]);

  // Cálculos de paginación
  const indexOfLastTransaction = currentPage * TRANSACTIONS_PER_PAGE;
  const indexOfFirstTransaction = indexOfLastTransaction - TRANSACTIONS_PER_PAGE;
  const paginatedTransactions = filteredTransactions.slice(indexOfFirstTransaction, indexOfLastTransaction);
  const totalPages = Math.ceil(filteredTransactions.length / TRANSACTIONS_PER_PAGE);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Resetear paginación cuando cambia el filtro
  React.useEffect(() => {
    setCurrentPage(1);
  }, [showAllTransactions, timeRange]);

  // Cerrar dropdown al hacer click fuera
  React.useEffect(() => {
    const handleClickOutside = (event) => {
      const isClickInside = event.target.closest('[data-export-container]');
      if (isExportOpen && !isClickInside) {
        setIsExportOpen(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isExportOpen]);

  // Función para exportar a Excel profesional
  const exportToExcel = () => {
    try {
      const workbook = XLSX.utils.book_new();

      // ========== HOJA 1: RESUMEN EJECUTIVO ==========
      const summaryData = [
        ['REPORTE DETALLADO DE FINANZAS', ''],
        ['Período:', timeRange === 'monthly' ? 'Mensual' : 'Anual'],
        ['Fecha de Generación:', new Date().toLocaleDateString()],
        [''],
        ['RESUMEN FINANCIERO', ''],
        ['', ''],
        ['Concepto', 'Monto', 'Cambio %'],
        ['Gasto Total', stats.expense, `${stats.expensePct}%`],
        ['Ingreso Total', stats.income, `${stats.incomePct}%`],
        ['Balance Neto', stats.balance, `${stats.balancePct}%`],
        ['', ''],
        ['DISTRIBUCIÓN DE GASTOS POR CATEGORÍA', ''],
        ['Categoría', 'Monto', 'Porcentaje'],
        ...pieData.map(item => [item.name, item.value, `${item.percentage}%`])
      ];

      const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
      
      // Estilos para la hoja de resumen
      summarySheet['!cols'] = [{ wch: 30 }, { wch: 15 }, { wch: 15 }];
      
      // Aplicar estilos a celdas específicas
      const titleCells = ['A1', 'A5', 'A12'];
      titleCells.forEach(cell => {
        if (summarySheet[cell]) {
          summarySheet[cell].s = {
            font: { bold: true, size: 14, color: { rgb: '1e293b' } },
            fill: { fgColor: { rgb: 'e2e8f0' } },
            alignment: { horizontal: 'left', vertical: 'center' }
          };
        }
      });

      // Encabezados de tabla
      ['A7', 'A12'].forEach(cell => {
        if (summarySheet[cell]) {
          summarySheet[cell].s = {
            font: { bold: true, color: { rgb: 'ffffff' } },
            fill: { fgColor: { rgb: '1e293b' } },
            alignment: { horizontal: 'center' }
          };
        }
      });

      // Formato de moneda para valores
      for (let i = 8; i <= 10; i++) {
        if (summarySheet[`B${i}`]) {
          summarySheet[`B${i}`].z = '$#,##0.00';
        }
      }

      XLSX.utils.book_append_sheet(workbook, summarySheet, 'Resumen');

      // ========== HOJA 2: MOVIMIENTOS DETALLADOS ==========
      const transactionsData = [
        ['MOVIMIENTOS DEL PERÍODO', '', '', ''],
        ['', '', '', ''],
        ['Fecha', 'Descripción', 'Categoría', 'Tipo', 'Monto'],
        ...filteredTransactions.map(tx => [
          new Date(tx.date || tx.createdAt).toLocaleDateString(),
          tx.description,
          tx.category,
          tx.type === 'income' ? 'INGRESO' : 'GASTO',
          tx.amount
        ])
      ];

      const transactionsSheet = XLSX.utils.aoa_to_sheet(transactionsData);
      transactionsSheet['!cols'] = [
        { wch: 15 },
        { wch: 30 },
        { wch: 18 },
        { wch: 12 },
        { wch: 15 }
      ];

      // Estilos para encabezados
      ['A1', 'A3', 'B3', 'C3', 'D3', 'E3'].forEach(cell => {
        if (transactionsSheet[cell]) {
          transactionsSheet[cell].s = {
            font: { bold: true, color: { rgb: cell === 'A1' ? '1e293b' : 'ffffff' }, size: cell === 'A1' ? 12 : 11 },
            fill: { fgColor: { rgb: cell === 'A1' ? 'e2e8f0' : '1e293b' } },
            alignment: { horizontal: 'center', vertical: 'center', wrapText: true }
          };
        }
      });

      // Formato de moneda
      for (let i = 4; i < transactionsData.length; i++) {
        if (transactionsSheet[`E${i}`]) {
          transactionsSheet[`E${i}`].z = '$#,##0.00';
        }
      }

      // Colorear filas alternadas
      for (let i = 4; i < transactionsData.length; i++) {
        const rowColor = i % 2 === 0 ? 'f8fafc' : 'ffffff';
        ['A', 'B', 'C', 'D', 'E'].forEach(col => {
          const cell = `${col}${i}`;
          if (transactionsSheet[cell]) {
            transactionsSheet[cell].s = {
              ...(transactionsSheet[cell].s || {}),
              fill: { fgColor: { rgb: rowColor } },
              border: {
                bottom: { style: 'thin', color: { rgb: 'cbd5e1' } }
              }
            };
            
            // Color especial para tipo
            if (col === 'D') {
              const isIncome = transactionsData[i - 3][3] === 'INGRESO';
              transactionsSheet[cell].s.font = {
                bold: true,
                color: { rgb: isIncome ? '059669' : 'dc2626' }
              };
            }
          }
        });
      }

      XLSX.utils.book_append_sheet(workbook, transactionsSheet, 'Movimientos');

      // ========== HOJA 3: ANÁLISIS POR CATEGORÍA ==========
      const categoryData = [
        ['ANÁLISIS DE GASTOS POR CATEGORÍA', '', ''],
        ['', '', ''],
        ['Categoría', 'Monto', 'Porcentaje del Total'],
        ...pieData.map(item => [
          item.name,
          item.value,
          item.percentage
        ])
      ];

      const categorySheet = XLSX.utils.aoa_to_sheet(categoryData);
      categorySheet['!cols'] = [{ wch: 25 }, { wch: 15 }, { wch: 20 }];

      // Estilos
      ['A1', 'A3', 'B3', 'C3'].forEach(cell => {
        if (categorySheet[cell]) {
          categorySheet[cell].s = {
            font: { bold: true, color: { rgb: cell === 'A1' ? '1e293b' : 'ffffff' }, size: cell === 'A1' ? 12 : 11 },
            fill: { fgColor: { rgb: cell === 'A1' ? 'e2e8f0' : '1e293b' } },
            alignment: { horizontal: 'center', vertical: 'center' }
          };
        }
      });

      // Formato
      for (let i = 4; i < categoryData.length; i++) {
        if (categorySheet[`B${i}`]) {
          categorySheet[`B${i}`].z = '$#,##0.00';
        }
        if (categorySheet[`C${i}`]) {
          categorySheet[`C${i}`].z = '0.00"%"';
        }
      }

      XLSX.utils.book_append_sheet(workbook, categorySheet, 'Por Categoría');

      // ========== HOJA 4: EVOLUCIÓN ==========
      const evolutionData = [
        [`EVOLUCIÓN ${timeRange === 'monthly' ? 'SEMANAL' : 'MENSUAL'}`, '', ''],
        ['', '', ''],
        ['Período', 'Ingresos', 'Gastos'],
        ...chartData.map(item => [item.name, item.ingresos, item.gastos])
      ];

      const evolutionSheet = XLSX.utils.aoa_to_sheet(evolutionData);
      evolutionSheet['!cols'] = [{ wch: 15 }, { wch: 15 }, { wch: 15 }];

      ['A1', 'A3', 'B3', 'C3'].forEach(cell => {
        if (evolutionSheet[cell]) {
          evolutionSheet[cell].s = {
            font: { bold: true, color: { rgb: cell === 'A1' ? '1e293b' : 'ffffff' }, size: cell === 'A1' ? 12 : 11 },
            fill: { fgColor: { rgb: cell === 'A1' ? 'e2e8f0' : '1e293b' } },
            alignment: { horizontal: 'center', vertical: 'center' }
          };
        }
      });

      for (let i = 4; i < evolutionData.length; i++) {
        ['B', 'C'].forEach(col => {
          if (evolutionSheet[`${col}${i}`]) {
            evolutionSheet[`${col}${i}`].z = '$#,##0.00';
          }
        });
      }

      XLSX.utils.book_append_sheet(workbook, evolutionSheet, 'Evolución');

      // ========== DESCARGAR ==========
      const fileName = `Reporte_Financiero_${new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(workbook, fileName);
      
      toast.success('Reporte Excel exportado exitosamente');
      setIsExportOpen(false);
    } catch (error) {
      console.error('Error al exportar Excel:', error);
      toast.error('Error al generar el archivo Excel');
    }
  };

  // Función para exportar a PDF
  const exportToPDF = async () => {
    try {
      // Creamos contenido HTML para el PDF
      const htmlContent = `
        <html>
          <head>
            <meta charset="UTF-8">
            <title>Reporte Detallado</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              h1 { color: #1e293b; text-align: center; margin-bottom: 10px; }
              h3 { color: #475569; margin-top: 20px; margin-bottom: 10px; }
              .stats { display: flex; gap: 20px; margin-bottom: 30px; flex-wrap: wrap; }
              .stat-box { 
                border: 1px solid #e2e8f0; 
                padding: 15px; 
                border-radius: 8px; 
                flex: 1; 
                min-width: 200px;
              }
              .stat-label { color: #64748b; font-size: 12px; font-weight: bold; }
              .stat-value { font-size: 24px; font-weight: bold; color: #1e293b; margin: 10px 0; }
              .stat-change { font-size: 12px; color: #64748b; }
              table { 
                width: 100%; 
                border-collapse: collapse; 
                margin-top: 20px;
              }
              th { 
                background-color: #f1f5f9; 
                padding: 12px; 
                text-align: left; 
                font-weight: bold;
                border-bottom: 2px solid #cbd5e1;
                color: #475569;
              }
              td { 
                padding: 10px 12px; 
                border-bottom: 1px solid #e2e8f0;
              }
              tr:hover { background-color: #f8fafc; }
              .income { color: #10b981; font-weight: bold; }
              .expense { color: #ef4444; font-weight: bold; }
              .footer { margin-top: 30px; text-align: center; color: #94a3b8; font-size: 11px; }
            </style>
          </head>
          <body>
            <h1>Reporte Detallado de Transacciones</h1>
            <p style="text-align: center; color: #64748b; margin-bottom: 30px;">
              Período: ${timeRange === 'monthly' ? 'Mensual' : 'Anual'} | Generado: ${new Date().toLocaleDateString()}
            </p>
            
            <h3>Resumen Financiero</h3>
            <div class="stats">
              <div class="stat-box">
                <div class="stat-label">💰 Gasto Total</div>
                <div class="stat-value" style="color: #ef4444;">${formatCurrency(stats.expense)}</div>
                <div class="stat-change">${stats.expensePct > 0 ? '+' : ''}${stats.expensePct}% vs período anterior</div>
              </div>
              <div class="stat-box">
                <div class="stat-label">📈 Ingreso Total</div>
                <div class="stat-value" style="color: #10b981;">${formatCurrency(stats.income)}</div>
                <div class="stat-change">${stats.incomePct > 0 ? '+' : ''}${stats.incomePct}% vs período anterior</div>
              </div>
              <div class="stat-box">
                <div class="stat-label">⚖️ Balance Neto</div>
                <div class="stat-value" style="color: #3b82f6;">${formatCurrency(stats.balance)}</div>
                <div class="stat-change">${stats.balancePct > 0 ? '+' : ''}${stats.balancePct}% vs período anterior</div>
              </div>
            </div>

            <h3>Movimientos del Período</h3>
            <table>
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Descripción</th>
                  <th>Categoría</th>
                  <th style="text-align: right;">Monto</th>
                </tr>
              </thead>
              <tbody>
                ${filteredTransactions.map(tx => `
                  <tr>
                    <td>${new Date(tx.date || tx.createdAt).toLocaleDateString()}</td>
                    <td>${tx.description}</td>
                    <td>${tx.category}</td>
                    <td class="${tx.type === 'income' ? 'income' : 'expense'}" style="text-align: right;">
                      ${tx.type === 'income' ? '+' : '-'}${formatCurrency(tx.amount)}
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
            
            <div class="footer">
              <p>Este reporte fue generado automáticamente por GastanGO</p>
              <p>${new Date().toLocaleString()}</p>
            </div>
          </body>
        </html>
      `;

      // Crear un blob con el contenido HTML
      const blob = new Blob([htmlContent], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      
      // Abrir en nueva ventana para imprimir a PDF
      const newWindow = window.open(url);
      setTimeout(() => {
        newWindow.print();
      }, 250);
      
      toast.success('Abriendo vista previa para exportar a PDF');
      setIsExportOpen(false);
    } catch (error) {
      toast.error('Error al generar PDF');
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-4 md:p-8 space-y-8 pb-20">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-800 tracking-tight">Reportes Detallados</h2>
          <p className="text-slate-700 text-sm">Visión general y comparativa de rendimiento</p>
        </div>
        <div className="flex items-center gap-3">
          <ToggleSwitch activeTab={timeRange} onChange={setTimeRange} />
          
          {/* EXPORT BUTTON */}
          <div className="relative" data-export-container>
            <button
              onClick={() => setIsExportOpen(!isExportOpen)}
              data-export-container
              className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:shadow-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 font-semibold text-sm group"
            >
              <span className="material-symbols-outlined text-[18px]">download</span>
              <span className="hidden sm:inline">Exportar</span>
              <motion.span
                animate={{ rotate: isExportOpen ? 180 : 0 }}
                className="material-symbols-outlined text-[18px]"
              >
                expand_more
              </motion.span>
            </button>

            {/* DROPDOWN */}
            <AnimatePresence>
              {isExportOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-slate-200 overflow-hidden z-50"
                >
                  <div className="p-2">
                    <button
                      onClick={exportToExcel}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-blue-50 rounded-lg transition-colors group text-left"
                    >
                      <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-green-50 group-hover:bg-green-100 transition-colors">
                        <span className="material-symbols-outlined text-green-600 text-[20px]">table_chart</span>
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-slate-800 text-sm">Exportar a Excel</p>
                        <p className="text-xs text-slate-500">Formato CSV compatible</p>
                      </div>
                      <span className="text-slate-300 group-hover:text-slate-600">
                        <span className="material-symbols-outlined text-[18px]">arrow_outward</span>
                      </span>
                    </button>

                    <div className="h-px bg-slate-100 my-1"></div>

                    <button
                      onClick={exportToPDF}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-50 rounded-lg transition-colors group text-left"
                    >
                      <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-red-50 group-hover:bg-red-100 transition-colors">
                        <span className="material-symbols-outlined text-red-600 text-[20px]">picture_as_pdf</span>
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-slate-800 text-sm">Exportar a PDF</p>
                        <p className="text-xs text-slate-500">Para imprimir o guardar</p>
                      </div>
                      <span className="text-slate-300 group-hover:text-slate-600">
                        <span className="material-symbols-outlined text-[18px]">arrow_outward</span>
                      </span>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div 
            key="loader" 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            className="flex items-center justify-center h-64"
          >
            <span className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></span>
          </motion.div>
        ) : (
          <motion.div 
            key="content" 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            className="space-y-8"
          >
            {/* 1. STATS ROW */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <StatCard 
                title="Gasto Total" 
                amount={stats.expense} 
                percentage={stats.expensePct} 
                color="red" 
                icon="trending_down" 
              />
              <StatCard 
                title="Ingreso Total" 
                amount={stats.income} 
                percentage={stats.incomePct} 
                color="emerald" 
                icon="trending_up" 
              />
              <StatCard 
                title="Balance Neto" 
                amount={stats.balance} 
                percentage={stats.balancePct} 
                color="blue" 
                icon="account_balance" 
              />
            </div>

            {/* 2. CHARTS GRID */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Pie Chart */}
              <div className="lg:col-span-5">
                <CardTransition>
                  <div className={cardStyle}>
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-bold text-slate-800">Distribución de Gastos</h3>
                      <button className="text-slate-400 hover:text-slate-600">
                        <span className="material-symbols-outlined">more_horiz</span>
                      </button>
                    </div>
                    <div className="flex-1 flex flex-col items-center justify-center relative min-h-[300px]">
                      {pieData.length > 0 ? (
                        <>
                          <ResponsiveContainer width="100%" height={250}>
                            <PieChart>
                              <Pie 
                                data={pieData} 
                                cx="50%" 
                                cy="50%" 
                                innerRadius={80} 
                                outerRadius={100} 
                                paddingAngle={5} 
                                dataKey="value" 
                                cornerRadius={6} 
                                stroke="none"
                              >
                                {pieData.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                              </Pie>
                              <Tooltip 
                                formatter={(value) => formatCurrency(value)}
                                contentStyle={{ 
                                  borderRadius: '12px', 
                                  border: 'none', 
                                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)' 
                                }}
                              />
                            </PieChart>
                          </ResponsiveContainer>
                          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-[60%] text-center pointer-events-none">
                            <span className="block text-xs text-slate-400 font-bold uppercase tracking-wider">Total</span>
                            <span className="block text-xl font-bold text-slate-800">
                              {formatCurrency(stats.expense)}
                            </span>
                          </div>
                          <div className="grid grid-cols-2 gap-x-4 gap-y-2 w-full mt-4 max-h-32 overflow-y-auto custom-scrollbar pr-2">
                            {pieData.map((item) => (
                              <div key={item.name} className="flex items-center justify-between gap-2 text-xs">
                                <div className="flex items-center gap-2 overflow-hidden">
                                  <div 
                                    className="w-2.5 h-2.5 rounded-full flex-shrink-0" 
                                    style={{ backgroundColor: item.color }} 
                                  />
                                  <span className="text-slate-600 font-medium truncate">{item.name}</span>
                                </div>
                                <span className="font-bold text-slate-700">{item.percentage}%</span>
                              </div>
                            ))}
                          </div>
                        </>
                      ) : (
                        <div className="flex flex-col items-center justify-center text-slate-300 h-full">
                          <span className="material-symbols-outlined text-4xl mb-2 opacity-50">donut_small</span>
                          <p className="text-sm">Sin gastos registrados</p>
                        </div>
                      )}
                    </div>
                  </div>
                </CardTransition>
              </div>

              {/* Area Chart */}
              <div className="lg:col-span-7">
                <CardTransition>
                  <div className={cardStyle}>
                    <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-8 gap-4">
                      <div>
                        <h3 className="font-bold text-slate-800">Flujo de Caja</h3>
                        <p className="text-xs text-slate-500 mt-1">Comparativa de ingresos y egresos</p>
                      </div>
                      <div className="flex gap-4">
                        <div className="flex items-center gap-2">
                          <span className="w-3 h-3 rounded-full bg-[#1152d4]"></span>
                          <span className="text-xs font-semibold text-slate-600">Ingresos</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="w-3 h-3 rounded-full bg-[#f87171]"></span>
                          <span className="text-xs font-semibold text-slate-600">Gastos</span>
                        </div>
                      </div>
                    </div>
                    <div className="h-[300px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart 
                          data={chartData} 
                          margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                        >
                          <defs>
                            <linearGradient id="colorIngresos" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#1152d4" stopOpacity={0.1}/>
                              <stop offset="95%" stopColor="#1152d4" stopOpacity={0}/>
                            </linearGradient>
                            <linearGradient id="colorGastos" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#f87171" stopOpacity={0.1}/>
                              <stop offset="95%" stopColor="#f87171" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                          <XAxis 
                            dataKey="name" 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 600 }} 
                            dy={10}
                          />
                          <YAxis 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{ fill: '#94a3b8', fontSize: 11 }} 
                            tickFormatter={(val) => `$${val}`}
                          />
                          <Tooltip 
                            contentStyle={{ 
                              borderRadius: '12px', 
                              border: 'none', 
                              boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)' 
                            }}
                            formatter={(value) => formatCurrency(value)}
                          />
                          <Area 
                            type="monotone" 
                            dataKey="ingresos" 
                            stroke="#1152d4" 
                            strokeWidth={3} 
                            fillOpacity={1} 
                            fill="url(#colorIngresos)" 
                          />
                          <Area 
                            type="monotone" 
                            dataKey="gastos" 
                            stroke="#f87171" 
                            strokeWidth={3} 
                            fillOpacity={1} 
                            fill="url(#colorGastos)" 
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </CardTransition>
              </div>
            </div>

            {/* 3. TRANSACTIONS TABLE */}
            <CardTransition>
              <div className="w-full bg-white rounded-[20px] shadow-sm border border-slate-200 overflow-hidden flex flex-col">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white z-10">
                  <h3 className="font-bold text-slate-800">Movimientos del Periodo</h3>
                  <button 
                    onClick={() => setShowAllTransactions(!showAllTransactions)}
                    className="text-blue-600 text-xs font-bold hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1 uppercase tracking-wide"
                  >
                    {showAllTransactions ? 'Ver menos' : 'Ver todo'}
                    <motion.span 
                      animate={{ rotate: showAllTransactions ? 180 : 0 }}
                      className="material-symbols-outlined text-sm"
                    >
                      keyboard_arrow_down
                    </motion.span>
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-50/80">
                      <tr>
                        <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Fecha</th>
                        <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Descripción</th>
                        <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Categoría</th>
                        <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Monto</th>
                      </tr>
                    </thead>
                    <motion.tbody layout className="divide-y divide-slate-100">
                      {filteredTransactions.length === 0 ? (
                        <tr>
                          <td colSpan="4" className="text-center py-10 text-slate-400 italic">
                            No hay movimientos en este periodo.
                          </td>
                        </tr>
                      ) : (
                        (showAllTransactions ? filteredTransactions : paginatedTransactions).map((tx) => (
                          <tr key={tx._id || Math.random()} className="hover:bg-slate-50 transition-colors group">
                            <td className="px-6 py-4 text-xs font-medium text-slate-500">
                              {new Date(tx.date || tx.createdAt).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                {(() => {
                                  const categoryConfig = CATEGORY_ICONS[tx.category] || { icon: 'category', color: 'slate' };
                                  const colorMap = {
                                    emerald: 'bg-emerald-100 text-emerald-600',
                                    cyan: 'bg-cyan-100 text-cyan-600',
                                    blue: 'bg-blue-100 text-blue-600',
                                    amber: 'bg-amber-100 text-amber-600',
                                    red: 'bg-red-100 text-red-600',
                                    purple: 'bg-purple-100 text-purple-600',
                                    yellow: 'bg-yellow-100 text-yellow-600',
                                    indigo: 'bg-indigo-100 text-indigo-600',
                                    slate: 'bg-slate-100 text-slate-600'
                                  };
                                  return (
                                    <div className={cn('p-2 rounded-lg group-hover:scale-110 transition-transform', colorMap[categoryConfig.color] || colorMap.slate)}>
                                      <span className="material-symbols-outlined text-[18px]">
                                        {categoryConfig.icon}
                                      </span>
                                    </div>
                                  );
                                })()}
                                <span className="text-sm font-medium text-slate-700 group-hover:text-blue-600 transition-colors">
                                  {tx.description}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className="inline-flex items-center px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-500 border border-slate-200">
                                {tx.category}
                              </span>
                            </td>
                            <td className={`px-6 py-4 text-sm font-bold text-right ${tx.type === 'income' ? 'text-emerald-600' : 'text-red-600'}`}>
                              {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                            </td>
                          </tr>
                        ))
                      )}
                    </motion.tbody>
                  </table>
                </div>

                {/* PAGINATION */}
                {!showAllTransactions && filteredTransactions.length > TRANSACTIONS_PER_PAGE && (
                  <div className="mt-6 pt-6 px-6 pb-6 border-t border-slate-200 flex items-center justify-between flex-wrap gap-4">
                    <p className="text-sm text-slate-600">
                      Mostrando {indexOfFirstTransaction + 1} - {Math.min(indexOfLastTransaction, filteredTransactions.length)} de {filteredTransactions.length}
                    </p>
                    <div className="flex gap-2 items-center">
                      <button
                        onClick={() => handlePageChange(Math.max(currentPage - 1, 1))}
                        disabled={currentPage === 1}
                        className="px-3 py-2 text-sm font-semibold bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                      >
                        Anterior
                      </button>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                          let page;
                          if (totalPages <= 5) {
                            page = i + 1;
                          } else if (currentPage <= 3) {
                            page = i + 1;
                          } else if (currentPage >= totalPages - 2) {
                            page = totalPages - 4 + i;
                          } else {
                            page = currentPage - 2 + i;
                          }
                          return (
                            <button
                              key={page}
                              onClick={() => handlePageChange(page)}
                              className={cn(
                                "w-9 h-9 rounded-lg text-sm font-bold transition-all",
                                currentPage === page
                                  ? 'bg-blue-600 text-white shadow-lg'
                                  : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                              )}
                            >
                              {page}
                            </button>
                          );
                        })}
                      </div>
                      <button
                        onClick={() => handlePageChange(Math.min(currentPage + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className="px-3 py-2 text-sm font-semibold bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                      >
                        Siguiente
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </CardTransition>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}