import { useContext, useState, useRef, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import CardTransition from './components/CardTransition';
import toast from 'react-hot-toast';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

// --- DATOS DE EJEMPLO (MOCKS) ---
const chartData = [
  { name: 'May', ingresos: 4000, gastos: 2400 },
  { name: 'Jun', ingresos: 3000, gastos: 1398 },
  { name: 'Jul', ingresos: 2000, gastos: 6800 },
  { name: 'Ago', ingresos: 2780, gastos: 3908 },
  { name: 'Sep', ingresos: 1890, gastos: 4800 },
  { name: 'Oct', ingresos: 2390, gastos: 3800 },
];

const categoryData = [
  { name: 'Vivienda', amount: 850.00, color: 'bg-blue-500', width: '65%' },
  { name: 'Comida', amount: 320.00, color: 'bg-purple-500', width: '25%' },
  { name: 'Transporte', amount: 150.00, color: 'bg-emerald-500', width: '15%' },
  { name: 'Otros', amount: 80.00, color: 'bg-orange-500', width: '8%' },
];

const Dashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    toast.success("Has cerrado sesión");
  };

  const getInitials = (name) => name ? name.charAt(0).toUpperCase() : "U";

  return (
    <CardTransition>
      <div className="min-h-screen flex bg-[#f6f6f8] font-sans text-[#111318]">
        
        {/* --- SIDEBAR (Barra Lateral) --- */}
        <aside className="hidden md:flex flex-col w-64 bg-white border-r border-gray-200 fixed h-full z-20">
            {/* Logo Area */}
            <div className="h-16 flex items-center px-6 border-b border-gray-100">
                <div className="flex items-center gap-2 text-[#111318] cursor-pointer">
                    <div className="flex items-center justify-center w-8 h-8 bg-blue-600 rounded-lg text-white">
                        <span className="material-symbols-outlined text-[20px]">account_balance_wallet</span>
                    </div>
                    <span className="text-xl font-extrabold tracking-tight">
                        Gastan<span className="text-blue-600">GO</span>
                    </span>
                </div>
            </div>

            {/* Navigation Links */}
            <div className="p-4 space-y-2 overflow-y-auto flex-1">
                <a href="#" className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-blue-700 bg-blue-50 rounded-xl transition-colors">
                    <span className="material-symbols-outlined text-[20px]">dashboard</span>
                    Inicio
                </a>
                <a href="#" className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-600 hover:text-blue-600 hover:bg-gray-50 rounded-xl transition-colors">
                    <span className="material-symbols-outlined text-[20px]">bar_chart</span>
                    Reportes
                </a>
                <a href="#" className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-600 hover:text-blue-600 hover:bg-gray-50 rounded-xl transition-colors">
                    <span className="material-symbols-outlined text-[20px]">receipt_long</span>
                    Transacciones
                </a>
                <a href="#" className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-600 hover:text-blue-600 hover:bg-gray-50 rounded-xl transition-colors">
                    <span className="material-symbols-outlined text-[20px]">account_balance_wallet</span>
                    Cuentas
                </a>
                <a href="#" className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-600 hover:text-blue-600 hover:bg-gray-50 rounded-xl transition-colors">
                    <span className="material-symbols-outlined text-[20px]">category</span>
                    Categorías
                </a>
            </div>

            {/* Bottom Settings */}
            <div className="p-4 border-t border-gray-100">
                <a href="#" className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-600 hover:text-blue-600 hover:bg-gray-50 rounded-xl transition-colors">
                    <span className="material-symbols-outlined text-[20px]">settings</span>
                    Configuración
                </a>
            </div>
        </aside>

        {/* --- MAIN CONTENT --- */}
        <div className="flex-1 md:ml-64 flex flex-col min-h-screen relative">
            
            {/* --- HEADER --- */}
            <header className="sticky top-0 z-10 w-full bg-[#f6f6f8]/90 backdrop-blur-md px-6 h-16 flex items-center justify-end md:justify-end justify-between border-b border-gray-200/50">
                {/* Mobile Logo (Visible only on small screens) */}
                <div className="md:hidden flex items-center gap-2">
                     <span className="material-symbols-outlined text-blue-600">account_balance_wallet</span>
                     <span className="font-bold">GastanGO</span>
                </div>

                {/* User Dropdown */}
                <div className="relative" ref={dropdownRef}>
                    <button 
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        className="flex items-center gap-3 hover:bg-white hover:shadow-sm p-1.5 rounded-full transition-all duration-200 focus:outline-none border border-transparent hover:border-gray-200"
                    >
                        <div className="hidden md:flex flex-col items-end mr-1">
                            <span className="text-sm font-bold text-gray-800">{user?.name || "Carlos Méndez"}</span>
                            <span className="text-[10px] text-gray-500 font-medium uppercase tracking-wide">Usuario Premium</span>
                        </div>
                        <div className="h-9 w-9 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-md ring-2 ring-white">
                            {getInitials(user?.name)}
                        </div>
                        <span className={`material-symbols-outlined text-gray-400 text-xl transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`}>
                            expand_more
                        </span>
                    </button>

                    {/* Dropdown Menu */}
                    {isDropdownOpen && (
                        <div className="absolute right-0 mt-2 w-60 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 origin-top-right animate-in fade-in slide-in-from-top-2">
                             <div className="px-4 py-3 border-b border-gray-50 mb-1 bg-gray-50/50">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500">
                                        <span className="material-symbols-outlined">person</span>
                                    </div>
                                    <div className="overflow-hidden">
                                        <p className="text-sm font-bold text-gray-900 truncate">{user?.name}</p>
                                        <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="p-1">
                                <a href="#" className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
                                    <span className="material-symbols-outlined text-[20px] text-gray-400">account_circle</span> Mi Perfil
                                </a>
                                <a href="#" className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
                                    <span className="material-symbols-outlined text-[20px] text-gray-400">settings</span> Configuración
                                </a>
                                <a href="#" className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
                                    <span className="material-symbols-outlined text-[20px] text-gray-400">help</span> Ayuda
                                </a>
                            </div>
                            <div className="border-t border-gray-100 my-1 mx-2"></div>
                            <div className="p-1">
                                <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm font-bold text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors">
                                    <span className="material-symbols-outlined text-[18px]">logout</span> Cerrar Sesión
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </header>

            {/* --- DASHBOARD CONTENT --- */}
            <main className="p-6 lg:p-8 space-y-8 max-w-7xl mx-auto w-full">
                
                {/* 1. TOP CARDS (Saldo, Ingresos, Gastos) */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Card Saldo */}
                    <div className="bg-white p-6 rounded-[24px] shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-full">
                                <span className="material-symbols-outlined">account_balance</span>
                            </div>
                            <span className="text-gray-500 font-medium text-sm">Saldo Actual</span>
                        </div>
                        <h2 className="text-4xl font-extrabold text-gray-900 tracking-tight">$1,234.56</h2>
                    </div>

                    {/* Card Ingresos */}
                    <div className="bg-white p-6 rounded-[24px] shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2.5 bg-emerald-50 text-emerald-500 rounded-full">
                                <span className="material-symbols-outlined">trending_up</span>
                            </div>
                            <span className="text-gray-500 font-medium text-sm">Ingresos (Mes)</span>
                        </div>
                        <h2 className="text-4xl font-extrabold text-emerald-500 tracking-tight">$1,500.00</h2>
                    </div>

                    {/* Card Gastos */}
                    <div className="bg-white p-6 rounded-[24px] shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2.5 bg-red-50 text-red-500 rounded-full">
                                <span className="material-symbols-outlined">trending_down</span>
                            </div>
                            <span className="text-gray-500 font-medium text-sm">Gastos (Mes)</span>
                        </div>
                        <h2 className="text-4xl font-extrabold text-red-500 tracking-tight">-$265.44</h2>
                    </div>
                </div>

                {/* 2. TABLA DE MOVIMIENTOS RECIENTES */}
                <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-4 px-2">Movimientos Recientes</h3>
                    <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50/80 border-b border-gray-100">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Transacción</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider hidden sm:table-cell">Categoría</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider hidden sm:table-cell">Fecha</th>
                                        <th className="px-6 py-4 text-right text-xs font-bold text-gray-400 uppercase tracking-wider">Monto</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {[
                                        { desc: 'Café de la mañana', cat: 'Comida', date: 'Oct 26, 2023', amount: '-$4.50', color: 'text-red-500' },
                                        { desc: 'Pago de salario', cat: 'Ingresos', date: 'Oct 25, 2023', amount: '+$1,500.00', color: 'text-emerald-500' },
                                        { desc: 'Suscripción a Spotify', cat: 'Entretenimiento', date: 'Oct 24, 2023', amount: '-$9.99', color: 'text-red-500' },
                                        { desc: 'Compras supermercado', cat: 'Comestibles', date: 'Oct 23, 2023', amount: '-$78.12', color: 'text-red-500' },
                                        { desc: 'Boleto de cine', cat: 'Entretenimiento', date: 'Oct 22, 2023', amount: '-$15.00', color: 'text-red-500' },
                                    ].map((item, index) => (
                                        <tr key={index} className="hover:bg-gray-50/80 transition-colors">
                                            <td className="px-6 py-4 text-sm font-semibold text-gray-900">{item.desc}</td>
                                            <td className="px-6 py-4 text-sm text-gray-500 hidden sm:table-cell">{item.cat}</td>
                                            <td className="px-6 py-4 text-sm text-gray-400 hidden sm:table-cell">{item.date}</td>
                                            <td className={`px-6 py-4 text-sm font-bold text-right ${item.color}`}>{item.amount}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* 3. GRID INFERIOR (Categorías y Gráfico de Balance) */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-20">
                    
                    {/* Panel Izquierdo: Gastos por Categoría */}
                    <div className="bg-white p-6 rounded-[24px] shadow-sm border border-gray-100 flex flex-col h-full">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-bold text-gray-900">Gastos por Categoría</h3>
                            <button className="text-sm font-semibold text-blue-600 hover:text-blue-700">Ver todo</button>
                        </div>
                        <div className="space-y-6 flex-1">
                            {categoryData.map((cat, idx) => (
                                <div key={idx}>
                                    <div className="flex justify-between items-center mb-2">
                                        <div className="flex items-center gap-2">
                                            <div className={`w-3 h-3 rounded-full ${cat.color}`}></div>
                                            <span className="text-sm font-medium text-gray-600">{cat.name}</span>
                                        </div>
                                        <span className="text-sm font-bold text-gray-900">${cat.amount.toFixed(2)}</span>
                                    </div>
                                    <div className="w-full bg-gray-100 rounded-full h-2.5">
                                        <div className={`${cat.color} h-2.5 rounded-full`} style={{ width: cat.width }}></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Panel Derecho: Balance Mensual (Gráfico de Barras) */}
                    <div className="bg-white p-6 rounded-[24px] shadow-sm border border-gray-100 flex flex-col h-[350px]">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-bold text-gray-900">Balance Mensual</h3>
                            <div className="flex gap-3">
                                <div className="flex items-center gap-1.5 text-xs font-medium text-gray-500">
                                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Ingresos
                                </div>
                                <div className="flex items-center gap-1.5 text-xs font-medium text-gray-500">
                                    <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span> Gastos
                                </div>
                            </div>
                        </div>
                        
                        {/* Implementación de Recharts para replicar el diseño de barras dobles */}
                        <div className="flex-1 w-full min-h-0">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={chartData} barGap={4}>
                                    <Tooltip 
                                        cursor={{ fill: '#F3F4F6' }}
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                                    />
                                    <XAxis 
                                        dataKey="name" 
                                        axisLine={false} 
                                        tickLine={false} 
                                        tick={{ fill: '#9CA3AF', fontSize: 12, fontWeight: 500 }} 
                                        dy={10}
                                    />
                                    <Bar dataKey="ingresos" fill="#10B981" radius={[4, 4, 0, 0]} barSize={12} />
                                    <Bar dataKey="gastos" fill="#2563EB" radius={[4, 4, 0, 0]} barSize={12} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

            </main>

            {/* FLOATING ACTION BUTTON (Bóton flotante +) */}
            <div className="fixed bottom-8 right-8 z-30">
                <button className="h-14 w-14 rounded-full bg-blue-600 text-white shadow-lg shadow-blue-600/30 flex items-center justify-center hover:scale-105 hover:bg-blue-700 transition-all duration-200">
                    <span className="material-symbols-outlined text-3xl">add</span>
                </button>
            </div>

        </div>
      </div>
    </CardTransition>
  );
};

export default Dashboard;