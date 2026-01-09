import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import CardTransition from '../pages/components/CardTransition';
import api from '../services/api';
import toast from 'react-hot-toast';

// Estilo base de tarjetas
const cardClassName = "bg-white p-5 rounded-[20px] shadow-sm border border-gray-100 flex flex-col justify-between transition-all duration-300 hover:shadow-md";

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
    const colors = { 'Comida': 'bg-purple-500', 'Transporte': 'bg-emerald-500', 'Vivienda': 'bg-blue-500', 'Entretenimiento': 'bg-orange-500', 'Salud': 'bg-red-400' };

    expenses.forEach(tx => {
      if (!catMap[tx.category]) catMap[tx.category] = 0;
      catMap[tx.category] += parseFloat(tx.amount);
    });

    setCategoryData(Object.keys(catMap).map(key => ({
      name: key,
      amount: catMap[key],
      color: colors[key] || 'bg-gray-400',
      width: totalExp > 0 ? `${(catMap[key] / totalExp) * 100}%` : '0%'
    })).sort((a, b) => b.amount - a.amount).slice(0, 4));
  };

  const formatCurrency = (amount) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Math.abs(amount));
  const formatDate = (dateString) => new Date(dateString).toLocaleDateString('es-ES', { month: 'short', day: 'numeric' });

  if (loading) return <div className="flex h-full items-center justify-center"><span className="loader"></span></div>;

  return (
    <CardTransition>
        <div className="flex flex-col gap-6 h-full w-full">
            
            {/* --- FILA 1: KPIs y BANNER QR (Ocupando todo el ancho) --- */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
                
                {/* KPI 1: Saldo */}
                <div className={cardClassName}>
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-50 text-blue-600 rounded-full"><span className="material-symbols-outlined">savings</span></div>
                        <span className="text-gray-500 text-sm font-bold">Saldo Total</span>
                    </div>
                    <h2 className={`text-3xl font-extrabold mt-2 ${totalBalance < 0 ? 'text-red-500' : 'text-[#111318]'}`}>{formatCurrency(totalBalance)}</h2>
                </div>

                {/* KPI 2: Ingresos */}
                <div className={cardClassName}>
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-emerald-50 text-emerald-600 rounded-full"><span className="material-symbols-outlined">trending_up</span></div>
                        <span className="text-gray-500 text-sm font-bold">Ingresos</span>
                    </div>
                    <h2 className="text-3xl font-extrabold mt-2 text-emerald-500">+{formatCurrency(totalIncome)}</h2>
                </div>

                {/* KPI 3: Gastos */}
                <div className={cardClassName}>
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-red-50 text-red-600 rounded-full"><span className="material-symbols-outlined">trending_down</span></div>
                        <span className="text-gray-500 text-sm font-bold">Gastos</span>
                    </div>
                    <h2 className="text-3xl font-extrabold mt-2 text-red-500">-{formatCurrency(totalExpense)}</h2>
                </div>

                {/* BANNER QR (Integrado en la fila superior para ahorrar espacio vertical) */}
                <div className={`${cardClassName} bg-gradient-to-br from-blue-700 to-blue-900 text-white border-none relative overflow-hidden flex-row items-center p-4`}>
                    <div className="z-10 flex-1">
                        <div className="flex items-center gap-2 mb-1">
                            <span className="material-symbols-outlined text-[18px]">smartphone</span>
                            <h3 className="font-bold text-sm uppercase tracking-wide">App Móvil</h3>
                        </div>
                        <p className="text-xs text-blue-100 leading-tight">Escanea para descargar GastanGO.</p>
                    </div>
                    <div className="z-10 bg-white p-1 rounded-lg ml-2 flex-shrink-0">
                         {/* QR Falso */}
                         <div className="w-12 h-12 bg-gray-900 flex items-center justify-center rounded">
                            <span className="material-symbols-outlined text-white text-2xl">qr_code_2</span>
                         </div>
                    </div>
                    {/* Decoración fondo */}
                    <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
                </div>
            </div>

            {/* --- FILA 2: CONTENIDO PRINCIPAL (Dividido para ocupar ancho) --- */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 min-h-0">
                
                {/* COLUMNA IZQUIERDA: Tabla (Ocupa 7 columnas) */}
                <div className={`${cardClassName} lg:col-span-7 p-0 overflow-hidden flex flex-col`}>
                    <div className="p-5 border-b border-gray-50 flex justify-between items-center bg-white sticky top-0 z-10">
                        <h3 className="font-bold text-[#111318]">Últimos Movimientos</h3>
                        <button className="text-xs font-bold text-blue-600 hover:bg-blue-50 px-3 py-1 rounded-full transition-colors">Ver todos</button>
                    </div>
                    <div className="overflow-auto flex-1 custom-scrollbar">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-gray-50/50 sticky top-0">
                                <tr className="text-xs uppercase text-gray-400 font-semibold">
                                    <th className="px-6 py-3">Detalle</th>
                                    <th className="px-6 py-3">Categoría</th>
                                    <th className="px-6 py-3 text-right">Monto</th>
                                </tr>
                            </thead>
                            <tbody className="text-sm">
                                {transactions.slice().reverse().map((tx) => (
                                    <tr key={tx._id} className="hover:bg-gray-50/50 border-b border-gray-50 last:border-0">
                                        <td className="px-6 py-3 font-medium text-gray-900 truncate max-w-[150px]">{tx.description}</td>
                                        <td className="px-6 py-3">
                                            <span className="px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-gray-100 text-gray-500 border border-gray-200">
                                                {tx.category}
                                            </span>
                                        </td>
                                        <td className={`px-6 py-3 text-right font-bold ${tx.type === 'income' ? 'text-emerald-500' : 'text-red-500'}`}>
                                            {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* COLUMNA DERECHA: Gráficos (Ocupa 5 columnas) */}
                <div className="lg:col-span-5 flex flex-col gap-6 h-full">
                    
                    {/* Gráfico 1: Barras Balance */}
                    <div className={`${cardClassName} flex-1 min-h-[200px]`}>
                        <div className="flex justify-between items-center mb-2">
                             <h3 className="font-bold text-sm text-[#111318]">Balance Anual</h3>
                        </div>
                        <div className="flex-1 w-full min-h-0">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={chartData} barGap={4}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill:'#9CA3AF', fontSize:10}} dy={10} />
                                    <Tooltip cursor={{fill:'#f9fafb'}} contentStyle={{borderRadius:'8px', border:'none', boxShadow:'0 4px 6px -1px rgba(0,0,0,0.1)'}} />
                                    <Bar dataKey="ingresos" fill="#10B981" radius={[2,2,2,2]} barSize={8} />
                                    <Bar dataKey="gastos" fill="#EF4444" radius={[2,2,2,2]} barSize={8} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Gráfico 2: Categorías (Barras de progreso) */}
                    <div className={`${cardClassName} flex-1 min-h-[180px] justify-start`}>
                        <h3 className="font-bold text-sm text-[#111318] mb-4">Top Gastos</h3>
                        <div className="space-y-4 overflow-y-auto custom-scrollbar pr-2">
                            {categoryData.map((cat) => (
                                <div key={cat.name}>
                                    <div className="flex justify-between text-xs mb-1">
                                        <span className="font-medium text-gray-600">{cat.name}</span>
                                        <span className="font-bold text-gray-900">{formatCurrency(cat.amount)}</span>
                                    </div>
                                    <div className="w-full bg-gray-100 rounded-full h-1.5">
                                        <div className={`h-1.5 rounded-full ${cat.color}`} style={{ width: cat.width }}></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    </CardTransition>
  );
};

export default Dashboard;