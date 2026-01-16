import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import CardTransition from '../pages/components/CardTransition';
import api from '../services/api';
import toast from 'react-hot-toast';

// Estilo base de cards
const cardClassName = "bg-white p-6 rounded-xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-gray-100 flex flex-col justify-between transition-all duration-300 hover:shadow-xl hover:-translate-y-1 cursor-default";

const Dashboard = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // KPIs
  const [totalBalance, setTotalBalance] = useState(0);
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpense, setTotalExpense] = useState(0);

  // Gráficos
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
        toast.error("Error cargando datos");
      } finally {
        setLoading(false);
      }
    };
    fetchTransactions();
  }, []);

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
    list.forEach(tx => {
      const date = new Date(tx.date || tx.createdAt);
      const mName = monthNames[date.getMonth()];
      if (!monthsMap[mName]) monthsMap[mName] = { name: mName, ingresos: 0, gastos: 0, order: date.getMonth() };
      tx.type === 'income' ? monthsMap[mName].ingresos += parseFloat(tx.amount) : monthsMap[mName].gastos += parseFloat(tx.amount);
    });
    setChartData(Object.values(monthsMap).sort((a, b) => a.order - b.order));
  };

  const processCategoryData = (list) => {
    const expenses = list.filter(tx => tx.type === 'expense');
    const totalExp = expenses.reduce((acc, curr) => acc + parseFloat(curr.amount), 0);
    const catMap = {};
    const colors = { 'Comida': 'bg-purple-500', 'Transporte': 'bg-emerald-500', 'Vivienda': 'bg-blue-500', 'Entretenimiento': 'bg-orange-500', 'Salud': 'bg-red-400', 'Ropa': 'bg-gray-500', 'Apuesta': 'bg-yellow-500' };

    expenses.forEach(tx => {
      if (!catMap[tx.category]) catMap[tx.category] = 0;
      catMap[tx.category] += parseFloat(tx.amount);
    });

    setCategoryData(Object.keys(catMap).map(key => ({
      name: key,
      amount: catMap[key],
      color: colors[key] || 'bg-blue-400', // Color por defecto si no está en la lista
      width: totalExp > 0 ? `${(catMap[key] / totalExp) * 100}%` : '0%'
    })).sort((a, b) => b.amount - a.amount).slice(0, 4));
  };

  const formatCurrency = (amount) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Math.abs(amount));

  if (loading) return <div className="flex h-full items-center justify-center"><span className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></span></div>;

  return (
    <CardTransition>
        <div className="flex flex-col gap-6 w-full pb-10">
            
            {/* --- FILA SUPERIOR: 4 COLUMNAS (KPIs + BANNER) --- */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
                {/* 1. KPI Saldo */}
                <div className={cardClassName}>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 flex items-center justify-center bg-blue-50 text-blue-600 rounded-lg">
                            <span className="material-symbols-outlined text-[22px]">savings</span>
                        </div>
                        <span className="text-gray-500 text-sm font-semibold uppercase tracking-wide">Saldo Total</span>
                    </div>
                    <h2 className={`text-3xl font-bold mt-3 ${totalBalance < 0 ? 'text-red-600' : 'text-slate-900'}`}>{formatCurrency(totalBalance)}</h2>
                </div>

                {/* 2. KPI Ingresos */}
                <div className={cardClassName}>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 flex items-center justify-center bg-emerald-50 text-emerald-600 rounded-lg">
                            <span className="material-symbols-outlined text-[22px]">trending_up</span>
                        </div>
                        <span className="text-gray-500 text-sm font-semibold uppercase tracking-wide">Ingresos</span>
                    </div>
                    <h2 className="text-3xl font-bold mt-3 text-emerald-600">+{formatCurrency(totalIncome)}</h2>
                </div>

                {/* 3. KPI Gastos */}
                <div className={cardClassName}>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 flex items-center justify-center bg-red-50 text-red-600 rounded-lg">
                            <span className="material-symbols-outlined text-[22px]">trending_down</span>
                        </div>
                        <span className="text-gray-500 text-sm font-semibold uppercase tracking-wide">Gastos</span>
                    </div>
                    <h2 className="text-3xl font-bold mt-3 text-red-600">-{formatCurrency(totalExpense)}</h2>
                </div>

                {/* 4. BANNER APP MÓVIL */}
                <div className="bg-[#1E40AF] rounded-xl p-6 flex flex-col justify-center text-white shadow-lg shadow-blue-200 transition-all duration-300 hover:scale-[1.03] hover:shadow-xl cursor-pointer relative overflow-hidden group">
                    <div className="z-10 flex items-start justify-between">
                         <div>
                            <div className="flex items-center gap-2 mb-2">
                                <span className="material-symbols-outlined text-[20px]">smartphone</span>
                                <h2 className="text-sm font-bold uppercase tracking-wider">App Móvil</h2>
                            </div>
                            <p className="text-blue-100 text-xs leading-relaxed max-w-[150px]">Escanea para descargar GastanGO.</p>
                         </div>
                         <div className="bg-white p-1 rounded-lg">
                             <span className="material-symbols-outlined text-4xl text-slate-900">qr_code_2</span>
                         </div>
                    </div>
                    <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-xl group-hover:bg-white/20 transition-all"></div>
                </div>
            </div>

            {/* --- FILA INFERIOR: TABLA (Izq) + GRÁFICOS (Der) --- */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 w-full items-start">
                
                {/* COLUMNA IZQUIERDA: Tabla (Ocupa 7 columnas) */}
                <div className="xl:col-span-7 flex flex-col gap-6">
                    <div className={`${cardClassName} p-0 overflow-hidden min-h-[500px]`}>
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-white">
                            <h3 className="font-bold text-slate-800 text-lg">Últimos Movimientos</h3>
                            <button className="text-sm font-medium text-blue-600 px-4 py-1.5 rounded-full hover:bg-blue-50 transition-all hover:scale-105">
                                Ver todos
                            </button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-gray-50/50">
                                    <tr className="text-xs uppercase text-gray-500 font-semibold tracking-wider">
                                        <th className="px-6 py-4">Detalle</th>
                                        <th className="px-6 py-4">Categoría</th>
                                        <th className="px-6 py-4 text-right">Monto</th>
                                    </tr>
                                </thead>
                                <tbody className="text-sm divide-y divide-gray-50">
                                    {transactions.length === 0 ? (
                                        <tr><td colSpan="3" className="text-center py-10 text-gray-400">Sin movimientos recientes</td></tr>
                                    ) : (
                                        transactions.slice().reverse().slice(0, 8).map((tx) => (
                                            <tr key={tx._id} className="hover:bg-blue-50/30 transition-colors cursor-pointer group">
                                                <td className="px-6 py-4 font-medium text-slate-700 group-hover:text-blue-700 transition-colors">{tx.description}</td>
                                                <td className="px-6 py-4">
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-gray-100 text-gray-500 border border-gray-200">
                                                        {tx.category}
                                                    </span>
                                                </td>
                                                <td className={`px-6 py-4 text-right font-bold ${tx.type === 'income' ? 'text-emerald-600' : 'text-red-600'}`}>
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

                {/* COLUMNA DERECHA: Gráficos Apilados (Ocupa 5 columnas) */}
                <div className="xl:col-span-5 flex flex-col gap-6">
                    
                    {/* Gráfico 1: Balance Anual (CORREGIDO: Altura Fija) */}
                    <div className={`${cardClassName} min-h-[300px]`}>
                         <h3 className="font-bold text-slate-800 text-sm mb-6">Balance Anual</h3>
                         
                         {/* AQUÍ ESTÁ LA CORRECCIÓN: h-[250px] en lugar de flex-1 */}
                         <div className="w-full h-[250px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={chartData} barGap={6}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill:'#94a3b8', fontSize:11}} dy={10} />
                                    <Tooltip cursor={{fill:'#f8fafc'}} contentStyle={{borderRadius:'8px', border:'none', boxShadow:'0 10px 15px -3px rgba(0,0,0,0.1)'}} />
                                    <Bar dataKey="ingresos" fill="#10B981" radius={[4,4,0,0]} barSize={12} />
                                    <Bar dataKey="gastos" fill="#EF4444" radius={[4,4,0,0]} barSize={12} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Gráfico 2: Top Gastos */}
                    <div className={`${cardClassName} min-h-[250px] justify-start`}>
                        <h3 className="font-bold text-slate-800 text-sm mb-4">Top Gastos</h3>
                        <div className="space-y-5 overflow-y-auto custom-scrollbar pr-1">
                            {categoryData.length === 0 ? (
                                <p className="text-gray-400 text-xs text-center py-4">No hay gastos registrados</p>
                            ) : (
                                categoryData.map((cat) => (
                                    <div key={cat.name} className="group">
                                        <div className="flex justify-between text-xs mb-1.5">
                                            <span className="font-medium text-gray-600 group-hover:text-blue-600 transition-colors">{cat.name}</span>
                                            <span className="font-bold text-slate-900">{formatCurrency(cat.amount)}</span>
                                        </div>
                                        <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                                            <div className={`h-1.5 rounded-full ${cat.color} transition-all duration-500`} style={{ width: cat.width }}></div>
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
  );
};

export default Dashboard;