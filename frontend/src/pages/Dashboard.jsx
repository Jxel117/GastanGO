import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import CardTransition from '../pages/components/CardTransition'; // Verifica que esta ruta sea correcta en tu proyecto
import api from '../services/api';
import toast from 'react-hot-toast';

// --- ESTILOS REUTILIZABLES ---
// dark:bg-slate-900 -> Fondo de tarjeta gris oscuro (no negro total)
// dark:border-slate-800 -> Borde sutil para separar tarjetas del fondo
const cardClassName = "bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 flex flex-col justify-between transition-all duration-300 hover:shadow-md dark:shadow-none hover:-translate-y-1 cursor-default relative overflow-hidden";

// Componente para el Tooltip del gráfico (personalizado para modo oscuro)
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 p-3 rounded-xl shadow-xl">
        <p className="font-bold text-gray-900 dark:text-white mb-2">{label}</p>
        <p className="text-emerald-600 font-medium text-sm">
          Ingresos: <span className="font-bold ml-1">{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(payload[0].value)}</span>
        </p>
        <p className="text-red-500 font-medium text-sm">
          Gastos: <span className="font-bold ml-1">{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(payload[1].value)}</span>
        </p>
      </div>
    );
  }
  return null;
};

const Dashboard = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Estados para KPIs
  const [totalBalance, setTotalBalance] = useState(0);
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpense, setTotalExpense] = useState(0);

  // Estados para Gráficos
  const [chartData, setChartData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const { data } = await api.get('/transactions');
        const list = Array.isArray(data) ? data : data.transactions || [];
        setTransactions(list);
        calculateFinancials(list);
        processChartData(list);
        processCategoryData(list);
      } catch (error) {
        console.error(error);
        toast.error("No se pudieron cargar los datos");
      } finally {
        setLoading(false);
      }
    };
    fetchTransactions();
  }, []);

  // --- CÁLCULOS ---
  const calculateFinancials = (list) => {
    let income = 0;
    let expense = 0;
    list.forEach(tx => {
      const amt = parseFloat(tx.amount);
      tx.type === 'income' ? income += amt : expense += amt;
    });
    setTotalIncome(income);
    setTotalExpense(expense);
    setTotalBalance(income - expense);
  };

  const processChartData = (list) => {
    const monthsMap = {};
    const monthNames = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
    
    // Inicializar mapa o procesar
    list.forEach(tx => {
      const date = new Date(tx.date || tx.createdAt);
      const mName = monthNames[date.getMonth()];
      
      if (!monthsMap[mName]) {
        monthsMap[mName] = { name: mName, ingresos: 0, gastos: 0, order: date.getMonth() };
      }
      
      if (tx.type === 'income') {
        monthsMap[mName].ingresos += parseFloat(tx.amount);
      } else {
        monthsMap[mName].gastos += parseFloat(tx.amount);
      }
    });
    
    setChartData(Object.values(monthsMap).sort((a, b) => a.order - b.order));
  };

  const processCategoryData = (list) => {
    const expenses = list.filter(tx => tx.type === 'expense');
    const totalExp = expenses.reduce((acc, curr) => acc + parseFloat(curr.amount), 0);
    const catMap = {};
    const colors = { 
        'Comida': 'bg-purple-500', 
        'Transporte': 'bg-emerald-500', 
        'Vivienda': 'bg-blue-500', 
        'Entretenimiento': 'bg-orange-500', 
        'Salud': 'bg-red-400', 
        'Ropa': 'bg-gray-500', 
        'Apuesta': 'bg-yellow-500',
        'Educación': 'bg-indigo-500',
        'Hogar': 'bg-cyan-500'
    };

    expenses.forEach(tx => {
      if (!catMap[tx.category]) catMap[tx.category] = 0;
      catMap[tx.category] += parseFloat(tx.amount);
    });

    setCategoryData(Object.keys(catMap).map(key => ({
      name: key,
      amount: catMap[key],
      color: colors[key] || 'bg-blue-400',
      width: totalExp > 0 ? `${(catMap[key] / totalExp) * 100}%` : '0%'
    })).sort((a, b) => b.amount - a.amount).slice(0, 5));
  };

  const formatCurrency = (amount) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Math.abs(amount));

  if (loading) return (
    <div className="flex h-full w-full items-center justify-center min-h-[500px]">
        <span className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></span>
    </div>
  );

  return (
    // ESTE DIV PADRE ES LA CLAVE: Controla el color de fondo de toda la pantalla
    // bg-gray-50 (Luz) vs dark:bg-slate-950 (Oscuro profundo)
    <div className="min-h-full w-full bg-gray-50 dark:bg-slate-950 transition-colors duration-300 p-4 md:p-6 lg:p-8">
      
      <CardTransition>
          <div className="flex flex-col gap-6 w-full pb-10">
              
              {/* --- FILA SUPERIOR: KPIs --- */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
                  
                  {/* 1. KPI Saldo */}
                  <div className={cardClassName}>
                      <div className="flex items-center gap-4">
                          <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 transition-colors">
                              <span className="material-symbols-outlined text-[24px]">savings</span>
                          </div>
                          <div>
                              <span className="text-gray-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider block mb-1">Saldo Total</span>
                              <h2 className={`text-2xl font-black tracking-tight ${totalBalance < 0 ? 'text-red-500 dark:text-red-400' : 'text-slate-900 dark:text-white'}`}>
                                  {formatCurrency(totalBalance)}
                              </h2>
                          </div>
                      </div>
                  </div>

                  {/* 2. KPI Ingresos */}
                  <div className={cardClassName}>
                      <div className="flex items-center gap-4">
                          <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 transition-colors">
                              <span className="material-symbols-outlined text-[24px]">trending_up</span>
                          </div>
                          <div>
                              <span className="text-gray-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider block mb-1">Ingresos</span>
                              <h2 className="text-2xl font-black tracking-tight text-emerald-600 dark:text-emerald-400">+{formatCurrency(totalIncome)}</h2>
                          </div>
                      </div>
                  </div>

                  {/* 3. KPI Gastos */}
                  <div className={cardClassName}>
                      <div className="flex items-center gap-4">
                          <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 transition-colors">
                              <span className="material-symbols-outlined text-[24px]">trending_down</span>
                          </div>
                          <div>
                              <span className="text-gray-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider block mb-1">Gastos</span>
                              <h2 className="text-2xl font-black tracking-tight text-red-600 dark:text-red-400">-{formatCurrency(totalExpense)}</h2>
                          </div>
                      </div>
                  </div>

                  {/* 4. BANNER APP MÓVIL */}
                  <div className="relative overflow-hidden bg-blue-700 dark:bg-blue-800 rounded-2xl p-6 flex flex-col justify-center text-white shadow-lg shadow-blue-500/20 dark:shadow-none transition-all duration-300 hover:scale-[1.02] cursor-pointer group border border-transparent dark:border-slate-700">
                      <div className="z-10 flex items-start justify-between relative">
                           <div>
                              <div className="flex items-center gap-2 mb-2">
                                  <span className="material-symbols-outlined text-[20px]">smartphone</span>
                                  <h2 className="text-sm font-bold uppercase tracking-wider text-blue-100">App Móvil</h2>
                              </div>
                              <p className="text-white font-medium text-xs leading-relaxed max-w-[150px] opacity-90">
                                  Escanea para llevar tus finanzas a todos lados.
                              </p>
                           </div>
                           <div className="bg-white p-1.5 rounded-xl shadow-md">
                               <span className="material-symbols-outlined text-3xl text-slate-900">qr_code_2</span>
                           </div>
                      </div>
                      <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/30 rounded-full blur-2xl -mr-10 -mt-10 group-hover:bg-blue-400/30 transition-all"></div>
                      <div className="absolute bottom-0 left-0 w-24 h-24 bg-indigo-600/30 rounded-full blur-xl -ml-5 -mb-5"></div>
                  </div>
              </div>

              {/* --- SECCIÓN INFERIOR: TABLA + GRÁFICOS --- */}
              <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 w-full items-start">
                  
                  {/* COLUMNA IZQUIERDA: Tabla (Ocupa 7 columnas) */}
                  <div className="xl:col-span-7 flex flex-col gap-6">
                      <div className={`${cardClassName} p-0 overflow-hidden min-h-[500px]`}>
                          <div className="p-6 border-b border-gray-100 dark:border-slate-800 flex justify-between items-center bg-white dark:bg-slate-900">
                              <h3 className="font-bold text-slate-900 dark:text-white text-lg">Últimos Movimientos</h3>
                              <button className="text-sm font-medium text-blue-600 dark:text-blue-400 px-4 py-1.5 rounded-full hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all hover:scale-105">
                                  Ver todos
                              </button>
                          </div>
                          <div className="overflow-x-auto">
                              <table className="w-full text-left border-collapse">
                                  <thead className="bg-gray-50/50 dark:bg-slate-800/50">
                                      <tr className="text-xs uppercase text-gray-500 dark:text-slate-400 font-semibold tracking-wider">
                                          <th className="px-6 py-4">Detalle</th>
                                          <th className="px-6 py-4">Categoría</th>
                                          <th className="px-6 py-4 text-right">Monto</th>
                                      </tr>
                                  </thead>
                                  <tbody className="text-sm divide-y divide-gray-100 dark:divide-slate-800">
                                      {transactions.length === 0 ? (
                                          <tr><td colSpan="3" className="text-center py-10 text-gray-400 dark:text-slate-500">Sin movimientos recientes</td></tr>
                                      ) : (
                                          transactions.slice().reverse().slice(0, 8).map((tx) => (
                                              <tr key={tx._id} className="hover:bg-gray-50 dark:hover:bg-slate-800/60 transition-colors cursor-pointer group">
                                                  <td className="px-6 py-4 font-medium text-slate-700 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                                      {tx.description}
                                                  </td>
                                                  <td className="px-6 py-4">
                                                      <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-400 border border-gray-200 dark:border-slate-700">
                                                          {tx.category}
                                                      </span>
                                                  </td>
                                                  <td className={`px-6 py-4 text-right font-bold ${tx.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500 dark:text-red-400'}`}>
                                                      {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                                                  </td>
                                              </tr>
                                          ))
                                      )}
                                  </tbody>
                              </table>
                          </div>
                      </div>
                  </div>

                  {/* COLUMNA DERECHA: Gráficos (Ocupa 5 columnas) */}
                  <div className="xl:col-span-5 flex flex-col gap-6">
                      
                      {/* Gráfico 1: Balance Anual */}
                      <div className={`${cardClassName} min-h-[300px]`}>
                           <div className="mb-6">
                               <h3 className="font-bold text-slate-900 dark:text-white text-lg">Balance Anual</h3>
                               <p className="text-xs text-gray-500 dark:text-slate-400">Ingresos vs Gastos mes a mes</p>
                           </div>
                           
                           <div className="w-full h-[250px]">
                              <ResponsiveContainer width="100%" height="100%">
                                  <BarChart data={chartData} barGap={4}>
                                      {/* Grid muy sutil */}
                                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#94a3b8" strokeOpacity={0.2} />
                                      {/* Ejes color gris medio (funciona en blanco y negro) */}
                                      <XAxis 
                                          dataKey="name" 
                                          axisLine={false} 
                                          tickLine={false} 
                                          tick={{fill:'#94a3b8', fontSize:11}} 
                                          dy={10} 
                                      />
                                      <Tooltip content={<CustomTooltip />} cursor={{fill: 'transparent'}} />
                                      <Bar dataKey="ingresos" fill="#10B981" radius={[4,4,0,0]} barSize={16} />
                                      <Bar dataKey="gastos" fill="#EF4444" radius={[4,4,0,0]} barSize={16} />
                                  </BarChart>
                              </ResponsiveContainer>
                          </div>
                      </div>

                      {/* Gráfico 2: Top Gastos */}
                      <div className={`${cardClassName} min-h-[250px] justify-start`}>
                          <div className="mb-6">
                              <h3 className="font-bold text-slate-900 dark:text-white text-lg">Top Categorías</h3>
                              <p className="text-xs text-gray-500 dark:text-slate-400">¿Dónde se va tu dinero?</p>
                          </div>
                          
                          <div className="space-y-6 overflow-y-auto custom-scrollbar pr-1">
                              {categoryData.length === 0 ? (
                                  <p className="text-gray-400 dark:text-slate-500 text-xs text-center py-4">No hay gastos registrados</p>
                              ) : (
                                  categoryData.map((cat) => (
                                      <div key={cat.name} className="group">
                                          <div className="flex justify-between text-xs mb-2">
                                              <span className="font-semibold text-gray-600 dark:text-slate-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                                  {cat.name}
                                              </span>
                                              <span className="font-bold text-slate-900 dark:text-white">
                                                  {formatCurrency(cat.amount)}
                                              </span>
                                          </div>
                                          {/* Barra de fondo sutil */}
                                          <div className="w-full bg-gray-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                                              <div 
                                                  className={`h-2 rounded-full ${cat.color} transition-all duration-1000 ease-out`} 
                                                  style={{ width: cat.width }}
                                              ></div>
                                          </div>
                                      </div>
                                  ))
                              )}
                          </div>
                      </div>

                  </div>
              </div>
          </div>
      </CardTransition>
    </div>
  );
};

export default Dashboard;