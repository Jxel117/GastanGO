import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import toast from 'react-hot-toast';
import api from '../services/api';

// ============================================================
// UTILITIES
// ============================================================
const cn = (...inputs) => twMerge(clsx(inputs));

const formatCurrency = (amount) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(Math.abs(amount));

// ============================================================
// CONSTANTS - Color scheme matching Dashboard
// ============================================================
const CATEGORY_COLORS = {
  'Vivienda': '#3b82f6',
  'Alimentación': '#10b981',
  'Comida': '#10b981',
  'Ocio': '#f59e0b',
  'Entretenimiento': '#f59e0b',
  'Transporte': '#06b6d4',
  'Salud': '#ef4444',
  'Otros': '#6b7280',
  'Ropa': '#8b5cf6',
  'Apuesta': '#ec4899'
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
  'Inversión': { icon: 'trending_up', color: 'emerald' },
};

const TRANSACTIONS_PER_PAGE = 10;

// ============================================================
// COMPONENTS
// ============================================================

// GlassCard - Componente mejorado con efecto glass
const GlassCard = ({ children, className, delay = 0, hover = true }) => (
  <motion.div
    initial={{ scale: 0.95, opacity: 0, y: 20 }}
    animate={{ scale: 1, opacity: 1, y: 0 }}
    transition={{ duration: 0.4, delay, ease: "easeOut" }}
    whileHover={hover ? { scale: 1.02, translateY: -5 } : {}}
    className={cn(
      "rounded-xl shadow-lg border backdrop-blur-sm",
      "bg-white/80 dark:bg-slate-800/80 border-white/20 dark:border-slate-700/30",
      "transition-all duration-300",
      className
    )}
  >
    {children}
  </motion.div>
);

// KPI Card - Tarjeta de estadísticas mejorada
const KPICard = ({ title, amount, percentage, icon, color, delay }) => {
  const isPositive = parseFloat(percentage) >= 0;
  const colorClass = {
    blue: { bg: 'bg-blue-50 dark:bg-blue-900/20', text: 'text-blue-600 dark:text-blue-400', icon: 'bg-blue-100 dark:bg-blue-900/50' },
    emerald: { bg: 'bg-emerald-50 dark:bg-emerald-900/20', text: 'text-emerald-600 dark:text-emerald-400', icon: 'bg-emerald-100 dark:bg-emerald-900/50' },
    amber: { bg: 'bg-amber-50 dark:bg-amber-900/20', text: 'text-amber-600 dark:text-amber-400', icon: 'bg-amber-100 dark:bg-amber-900/50' }
  }[color] || { bg: 'bg-slate-50 dark:bg-slate-900/20', text: 'text-slate-600 dark:text-slate-400', icon: 'bg-slate-100 dark:bg-slate-900/50' };

  return (
    <GlassCard delay={delay} className={cn("p-6", colorClass.bg)}>
      <div className="flex justify-between items-start mb-4">
        <div>
          <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
            {title}
          </p>
        </div>
        <div className={cn("p-2 rounded-lg", colorClass.icon)}>
          <span className={cn("material-symbols-outlined text-xl", colorClass.text)}>
            {icon}
          </span>
        </div>
      </div>
      <div className="mb-3">
        <p className="text-3xl font-bold text-gray-900 dark:text-white">
          {formatCurrency(amount)}
        </p>
      </div>
      <div className={cn("flex items-center gap-1 text-xs font-semibold", isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400')}>
        <span className="material-symbols-outlined text-sm">
          {isPositive ? 'trending_up' : 'trending_down'}
        </span>
        <span>{percentage >= 0 ? '+' : ''}{percentage}% vs mes anterior</span>
      </div>
    </GlassCard>
  );
};

// ViewToggle - Selector visual mejorado
const ViewToggle = ({ activeTab, onChange }) => (
  <div className="inline-flex gap-2 p-1 bg-gray-100 dark:bg-slate-800 rounded-lg">
    {['mensual', 'anual'].map((tab) => (
      <button
        key={tab}
        onClick={() => onChange(tab)}
        className={cn(
          "px-4 py-2 rounded-md font-semibold text-sm transition-all duration-200",
          activeTab === tab
            ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-md'
            : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300'
        )}
      >
        {tab === 'mensual' ? 'Mensual' : 'Anual'}
      </button>
    ))}
  </div>
);

// Tooltip personalizado
const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white dark:bg-slate-800 p-3 rounded-lg shadow-xl border border-gray-200 dark:border-slate-700">
      <p className="font-semibold text-gray-900 dark:text-white text-sm mb-2">
        {payload[0]?.payload?.name}
      </p>
      {payload[0]?.value && (
        <p className="text-xs text-emerald-600 dark:text-emerald-400">
          Ingresos: {formatCurrency(payload[0]?.value)}
        </p>
      )}
      {payload[1]?.value && (
        <p className="text-xs text-red-600 dark:text-red-400">
          Gastos: {formatCurrency(payload[1]?.value)}
        </p>
      )}
    </div>
  );
};

// ExportButton - Botón para exportar datos
const ExportButton = ({ data, filteredTransactions, stats, viewMode }) => {
  const exportToCSV = () => {
    if (filteredTransactions.length === 0) {
      toast.error('No hay datos para exportar');
      return;
    }

    const headers = ['Fecha', 'Descripción', 'Categoría', 'Monto', 'Tipo', 'Estado'];
    const rows = filteredTransactions.map(tx => [
      new Date(tx.date || tx.createdAt).toLocaleDateString('es-ES'),
      tx.description,
      tx.category,
      tx.amount,
      tx.type === 'income' ? 'Ingreso' : 'Gasto',
      tx.status === 'completed' ? 'Completado' : 'Pendiente'
    ]);

    const csv = [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reportes_${viewMode}_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    toast.success('Reporte exportado como CSV');
  };

  const exportToJSON = () => {
    if (filteredTransactions.length === 0) {
      toast.error('No hay datos para exportar');
      return;
    }

    const exportData = {
      periodo: viewMode,
      fecha_generacion: new Date().toISOString(),
      resumen: stats,
      transacciones: filteredTransactions
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reportes_${viewMode}_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    toast.success('Reporte exportado como JSON');
  };

  return (
    <div className="flex gap-2">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={exportToCSV}
        className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-semibold transition-colors duration-200 shadow-md hover:shadow-lg"
      >
        <span className="material-symbols-outlined text-sm">download</span>
        Excel
      </motion.button>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={exportToJSON}
        className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold transition-colors duration-200 shadow-md hover:shadow-lg"
      >
        <span className="material-symbols-outlined text-sm">description</span>
        JSON
      </motion.button>
    </div>
  );
};

// ============== MAIN COMPONENT ==============
const Reportes = () => {
  // ---- STATE MANAGEMENT ----
  const [viewMode, setViewMode] = useState('mensual');
  const [allTransactions, setAllTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAllTransactions, setShowAllTransactions] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const [stats, setStats] = useState({
    income: 0,
    expense: 0,
    balance: 0,
    incomePct: 0,
    expensePct: 0,
    balancePct: 0
  });

  const [categoryData, setCategoryData] = useState([]);
  const [evolutionData, setEvolutionData] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);

  // ---- FETCH DATA ----
  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setLoading(true);
        const { data } = await api.get('/transactions');
        const list = Array.isArray(data) ? data : data.transactions || [];
        setAllTransactions(list);
      } catch (error) {
        toast.error("Error cargando reportes");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchTransactions();
  }, []);

  // ---- PROCESS DATA ----
  useEffect(() => {
    if (loading) return;

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    // Helper: Check if date is in current period
    const isCurrentPeriod = (date) => {
      if (viewMode === 'mensual') {
        return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
      }
      return date.getFullYear() === currentYear;
    };

    // Helper: Check if date is in previous period
    const isPreviousPeriod = (date) => {
      if (viewMode === 'mensual') {
        if (currentMonth === 0) {
          return date.getMonth() === 11 && date.getFullYear() === currentYear - 1;
        }
        return date.getMonth() === currentMonth - 1 && date.getFullYear() === currentYear;
      }
      return date.getFullYear() === currentYear - 1;
    };

    // Separate transactions by period
    const currentTx = [];
    const previousTx = [];

    allTransactions.forEach(tx => {
      const d = new Date(tx.date || tx.createdAt);
      if (isCurrentPeriod(d)) currentTx.push(tx);
      else if (isPreviousPeriod(d)) previousTx.push(tx);
    });

    setFilteredTransactions(currentTx);

    // Helper: Calculate totals
    const calcTotals = (list) => {
      let inc = 0, exp = 0;
      list.forEach(tx => {
        const amt = parseFloat(tx.amount);
        tx.type === 'income' ? inc += amt : exp += amt;
      });
      return { inc, exp, bal: inc - exp };
    };

    // Helper: Calculate percentage change
    const calcPct = (curr, prev) => {
      if (prev === 0) return curr === 0 ? 0 : 100;
      return ((curr - prev) / prev * 100).toFixed(1);
    };

    const currentStats = calcTotals(currentTx);
    const prevStats = calcTotals(previousTx);

    // Update stats
    setStats({
      income: currentStats.inc,
      expense: currentStats.exp,
      balance: currentStats.bal,
      incomePct: calcPct(currentStats.inc, prevStats.inc),
      expensePct: calcPct(currentStats.exp, prevStats.exp),
      balancePct: calcPct(currentStats.bal, prevStats.bal)
    });

    // Process category data
    const expenses = currentTx.filter(tx => tx.type === 'expense');
    const catMap = {};
    expenses.forEach(tx => {
      const category = tx.category || 'Otros';
      const amt = parseFloat(tx.amount);
      catMap[category] = (catMap[category] || 0) + amt;
    });

    const processedPie = Object.entries(catMap)
      .map(([name, value]) => ({
        name,
        value,
        percentage: ((value / currentStats.exp) * 100).toFixed(1),
        color: CATEGORY_COLORS[name] || CATEGORY_COLORS['Otros']
      }))
      .sort((a, b) => b.value - a.value);

    setCategoryData(processedPie);

    // Process evolution data
    const evolutionMap = {};

    if (viewMode === 'anual') {
      const monthNames = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
      monthNames.forEach((m, i) => {
        evolutionMap[m] = { name: m, ingresos: 0, gastos: 0, order: i };
      });

      currentTx.forEach(tx => {
        const d = new Date(tx.date || tx.createdAt);
        const key = monthNames[d.getMonth()];
        const amt = parseFloat(tx.amount);
        tx.type === 'income' ? evolutionMap[key].ingresos += amt : evolutionMap[key].gastos += amt;
      });
    } else {
      // Monthly view by weeks
      currentTx.forEach(tx => {
        const d = new Date(tx.date || tx.createdAt);
        const day = d.getDate();
        let weekStr = "Sem 4+";
        if (day <= 7) weekStr = "Sem 1";
        else if (day <= 14) weekStr = "Sem 2";
        else if (day <= 21) weekStr = "Sem 3";

        if (!evolutionMap[weekStr]) {
          evolutionMap[weekStr] = { name: weekStr, ingresos: 0, gastos: 0, order: day };
        }
        const amt = parseFloat(tx.amount);
        tx.type === 'income' ? evolutionMap[weekStr].ingresos += amt : evolutionMap[weekStr].gastos += amt;
      });
    }

    const processedChart = Object.values(evolutionMap).sort((a, b) =>
      viewMode === 'anual' ? a.order - b.order : a.name.localeCompare(b.name)
    );
    setEvolutionData(processedChart);

  }, [allTransactions, viewMode, loading]);

  // ---- PAGINATION ----
  const indexOfLastTransaction = currentPage * TRANSACTIONS_PER_PAGE;
  const indexOfFirstTransaction = indexOfLastTransaction - TRANSACTIONS_PER_PAGE;
  const currentTransactions = showAllTransactions
    ? filteredTransactions
    : filteredTransactions.slice(indexOfFirstTransaction, indexOfLastTransaction);
  const totalPages = Math.ceil(filteredTransactions.length / TRANSACTIONS_PER_PAGE);

  // ---- HANDLERS ----
  const handlePageChange = useCallback((page) => {
    setCurrentPage(page);
  }, []);

  const handleToggleShowAll = useCallback(() => {
    setShowAllTransactions(prev => !prev);
    setCurrentPage(1);
  }, []);

  // ---- RENDER ----
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* HEADER */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center md:justify-between gap-6"
        >
          <div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
              Reportes & Análisis
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              Visualiza tu desempeño financiero {viewMode === 'mensual' ? 'mensualmente' : 'anualmente'}
            </p>
          </div>
          <div className="flex flex-col gap-4 items-start md:items-end">
            <ViewToggle activeTab={viewMode} onChange={setViewMode} />
            {!loading && <ExportButton data={categoryData} filteredTransactions={filteredTransactions} stats={stats} viewMode={viewMode} />}
          </div>
        </motion.div>

        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="loader"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center justify-center min-h-96"
            >
              <div className="text-center">
                <div className="inline-block">
                  <div className="w-16 h-16 border-4 border-blue-200 dark:border-blue-900 border-t-blue-600 dark:border-t-blue-400 rounded-full animate-spin mb-4"></div>
                </div>
                <p className="text-gray-600 dark:text-gray-400 font-semibold">Cargando reportes...</p>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="content"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-8"
            >
              {/* KPIs ROW */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <KPICard
                  title="Gastos Totales"
                  amount={stats.expense}
                  percentage={stats.expensePct}
                  icon="trending_down"
                  color="amber"
                  delay={0.1}
                />
                <KPICard
                  title="Ingresos Totales"
                  amount={stats.income}
                  percentage={stats.incomePct}
                  icon="trending_up"
                  color="emerald"
                  delay={0.2}
                />
                <KPICard
                  title="Balance Neto"
                  amount={stats.balance}
                  percentage={stats.balancePct}
                  icon="account_balance"
                  color="blue"
                  delay={0.3}
                />
              </div>

              {/* CHARTS SECTION */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* PIE CHART */}
                <GlassCard delay={0.4} className="p-6">
                  <div className="mb-6">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                      <span className="material-symbols-outlined text-blue-600">pie_chart</span>
                      Gastos por Categoría
                    </h2>
                  </div>

                  {categoryData.length === 0 ? (
                    <div className="flex items-center justify-center h-72 text-gray-400">
                      <div className="text-center">
                        <span className="material-symbols-outlined text-6xl mb-2 opacity-20">donut_small</span>
                        <p className="font-semibold">Sin datos de gastos</p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <ResponsiveContainer width="100%" height={280}>
                        <PieChart>
                          <Pie
                            data={categoryData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={100}
                            paddingAngle={3}
                            dataKey="value"
                            cornerRadius={5}
                          >
                            {categoryData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip content={<CustomTooltip />} />
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="grid grid-cols-2 gap-2 max-h-24 overflow-y-auto">
                        {categoryData.map((cat, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-sm">
                            <div
                              className="w-3 h-3 rounded-full flex-shrink-0"
                              style={{ backgroundColor: cat.color }}
                            ></div>
                            <span className="text-gray-700 dark:text-gray-300 truncate">
                              {cat.name} <span className="text-xs text-gray-500">({cat.percentage}%)</span>
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </GlassCard>

                {/* LINE CHART */}
                <GlassCard delay={0.5} className="p-6">
                  <div className="mb-6">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                      <span className="material-symbols-outlined text-emerald-600">trending_up</span>
                      Evolución {viewMode === 'mensual' ? 'Semanal' : 'Mensual'}
                    </h2>
                  </div>

                  <ResponsiveContainer width="100%" height={280}>
                    <LineChart data={evolutionData} margin={{ top: 5, right: 10, left: -15, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                      <XAxis
                        dataKey="name"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#9ca3af', fontSize: 12 }}
                      />
                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#9ca3af', fontSize: 12 }}
                        tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="ingresos"
                        name="Ingresos"
                        stroke="#10b981"
                        strokeWidth={2.5}
                        dot={{ fill: '#10b981', r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="gastos"
                        name="Gastos"
                        stroke="#ef4444"
                        strokeWidth={2.5}
                        dot={{ fill: '#ef4444', r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </GlassCard>
              </div>

              {/* TRANSACTIONS TABLE */}
              <GlassCard delay={0.6} className="p-6 overflow-hidden">
                <div className="mb-6 flex justify-between items-center">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                      <span className="material-symbols-outlined text-blue-600">receipt_long</span>
                      Movimientos Recientes
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {filteredTransactions.length} transacciones en este período
                    </p>
                  </div>
                  <button
                    onClick={handleToggleShowAll}
                    className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 px-4 py-2 rounded-lg transition-colors font-semibold text-sm"
                  >
                    <span>{showAllTransactions ? 'Ver menos' : 'Ver todo'}</span>
                    <motion.span
                      animate={{ rotate: showAllTransactions ? 180 : 0 }}
                      className="material-symbols-outlined"
                    >
                      expand_more
                    </motion.span>
                  </button>
                </div>

                <div
                  className={cn(
                    "overflow-x-auto transition-all duration-500",
                    showAllTransactions ? 'max-h-[800px]' : 'max-h-[500px]',
                    "overflow-y-auto"
                  )}
                >
                  <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 dark:bg-slate-900/50 sticky top-0 z-10">
                      <tr className="border-b border-gray-200 dark:border-slate-700">
                        <th className="px-6 py-3 font-semibold text-gray-700 dark:text-gray-300">Fecha</th>
                        <th className="px-6 py-3 font-semibold text-gray-700 dark:text-gray-300">Descripción</th>
                        <th className="px-6 py-3 font-semibold text-gray-700 dark:text-gray-300">Categoría</th>
                        <th className="px-6 py-3 font-semibold text-gray-700 dark:text-gray-300 text-right">Monto</th>
                        <th className="px-6 py-3 font-semibold text-gray-700 dark:text-gray-300 text-center">Estado</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-slate-700/50">
                      {currentTransactions.length === 0 ? (
                        <tr>
                          <td colSpan="5" className="text-center py-12 text-gray-500 dark:text-gray-400">
                            No hay transacciones en este período
                          </td>
                        </tr>
                      ) : (
                        currentTransactions.map((tx) => {
                          const txDate = new Date(tx.date || tx.createdAt);
                          const formattedDate = txDate.toLocaleDateString('es-ES', {
                            day: 'numeric',
                            month: 'short',
                            year: '2-digit'
                          });
                          const categoryConfig = CATEGORY_ICONS[tx.category] || { icon: 'category', color: 'slate' };

                          return (
                            <motion.tr
                              key={tx._id}
                              whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.02)' }}
                              className="hover:bg-gray-50/80 dark:hover:bg-slate-700/20 transition-colors group"
                            >
                              <td className="px-6 py-4 text-gray-700 dark:text-gray-300 font-medium">
                                {formattedDate}
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                  <div className={cn(
                                    "p-2 rounded-lg group-hover:scale-110 transition-transform",
                                    `bg-${categoryConfig.color}-100 dark:bg-${categoryConfig.color}-900/30 text-${categoryConfig.color}-600`
                                  )}>
                                    <span className="material-symbols-outlined text-base">
                                      {categoryConfig.icon}
                                    </span>
                                  </div>
                                  <span className="font-medium text-gray-900 dark:text-white">
                                    {tx.description}
                                  </span>
                                </div>
                              </td>
                              <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                                {tx.category}
                              </td>
                              <td className={cn(
                                "px-6 py-4 font-bold text-right",
                                tx.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'
                              )}>
                                {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                              </td>
                              <td className="px-6 py-4 text-center">
                                <span className={cn(
                                  "px-3 py-1 text-xs font-bold rounded-full",
                                  tx.status === 'completed' || !tx.status
                                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                                    : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                                )}>
                                  {tx.status === 'completed' || !tx.status ? 'Completado' : 'Pendiente'}
                                </span>
                              </td>
                            </motion.tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>

                {/* PAGINATION */}
                {!showAllTransactions && filteredTransactions.length > TRANSACTIONS_PER_PAGE && (
                  <div className="mt-6 pt-6 border-t border-gray-200 dark:border-slate-700 flex items-center justify-between flex-wrap gap-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Mostrando {indexOfFirstTransaction + 1} - {Math.min(indexOfLastTransaction, filteredTransactions.length)} de {filteredTransactions.length}
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setCurrentPage(Math.max(currentPage - 1, 1))}
                        disabled={currentPage === 1}
                        className="px-3 py-2 text-sm font-semibold bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
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
                              onClick={() => setCurrentPage(page)}
                              className={cn(
                                "w-9 h-9 rounded-lg text-sm font-bold transition-all",
                                currentPage === page
                                  ? 'bg-blue-600 text-white shadow-lg'
                                  : 'bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-slate-600'
                              )}
                            >
                              {page}
                            </button>
                          );
                        })}
                      </div>
                      <button
                        onClick={() => setCurrentPage(Math.min(currentPage + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className="px-3 py-2 text-sm font-semibold bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                      >
                        Siguiente
                      </button>
                    </div>
                  </div>
                )}
              </GlassCard>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Reportes;