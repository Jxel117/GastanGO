import React from 'react';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import CardTransition from '../pages/components/CardTransition';

// --- ESTILO PROFESIONAL ---
// Definimos esta clase constante para no repetir código y mantener consistencia.
// hover:shadow-xl -> Aumenta la sombra
// hover:-translate-y-1 -> Sube la tarjeta ligeramente hacia arriba
// hover:scale-[1.02] -> La agranda un 2% (muy sutil)
// transition-all duration-300 ease-out -> Suaviza la animación
const cardClassName = "bg-white p-6 rounded-[24px] shadow-sm border border-gray-100 transition-all duration-300 ease-out hover:shadow-[0_20px_25px_-5px_rgba(0,0,0,0.1),0_10px_10px_-5px_rgba(0,0,0,0.04)] hover:-translate-y-1 hover:scale-[1.02] cursor-pointer relative z-0 hover:z-10";

// --- DATOS MOCK ---
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

const recentTransactions = [
  { id: 1, name: 'Café de la mañana', category: 'Comida', date: 'Oct 26, 2023', amount: -4.50, type: 'gasto' },
  { id: 2, name: 'Pago de salario', category: 'Ingresos', date: 'Oct 25, 2023', amount: 1500.00, type: 'ingreso' },
  { id: 3, name: 'Suscripción a Spotify', category: 'Entretenimiento', date: 'Oct 24, 2023', amount: -9.99, type: 'gasto' },
  { id: 4, name: 'Compras supermercado', category: 'Comestibles', date: 'Oct 23, 2023', amount: -78.12, type: 'gasto' },
  { id: 5, name: 'Boleto de cine', category: 'Entretenimiento', date: 'Oct 22, 2023', amount: -15.00, type: 'gasto' },
];

const Dashboard = () => {
  return (
    <CardTransition>
        <div className="space-y-8">
            
            {/* 1. SECCIÓN DE TARJETAS SUPERIORES (KPIs) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Card Saldo */}
                <div className={cardClassName}>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-blue-50 text-blue-600 rounded-full">
                            <span className="material-symbols-outlined text-[20px]">account_balance</span>
                        </div>
                        <span className="text-gray-500 font-medium text-sm">Saldo Actual</span>
                    </div>
                    <h2 className="text-4xl font-extrabold text-[#111318] tracking-tight">$1,234.56</h2>
                </div>

                {/* Card Ingresos */}
                <div className={cardClassName}>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-emerald-50 text-emerald-600 rounded-full">
                             <span className="material-symbols-outlined text-[20px]">trending_up</span>
                        </div>
                        <span className="text-gray-500 font-medium text-sm">Ingresos (Mes)</span>
                    </div>
                    <h2 className="text-4xl font-extrabold text-emerald-500 tracking-tight">+$1,500.00</h2>
                </div>

                {/* Card Gastos */}
                <div className={cardClassName}>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-red-50 text-red-600 rounded-full">
                             <span className="material-symbols-outlined text-[20px]">trending_down</span>
                        </div>
                        <span className="text-gray-500 font-medium text-sm">Gastos (Mes)</span>
                    </div>
                    <h2 className="text-4xl font-extrabold text-red-500 tracking-tight">-$265.44</h2>
                </div>
            </div>

            {/* 2. SECCIÓN TABLA - A esta también le aplicamos el efecto sutil */}
            <div className={`${cardClassName} overflow-hidden p-0 block`}> {/* p-0 porque la tabla necesita llenar el borde */}
                <div className="p-6 border-b border-gray-50">
                    <h3 className="text-lg font-bold text-[#111318]">Movimientos Recientes</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="text-xs uppercase text-gray-400 font-semibold tracking-wider border-b border-gray-50">
                                <th className="px-6 py-4">Transacción</th>
                                <th className="px-6 py-4">Categoría</th>
                                <th className="px-6 py-4">Fecha</th>
                                <th className="px-6 py-4 text-right">Monto</th>
                            </tr>
                        </thead>
                        <tbody className="text-sm">
                            {recentTransactions.map((tx) => (
                                <tr key={tx.id} className="hover:bg-gray-50/50 transition-colors border-b border-gray-50 last:border-0">
                                    <td className="px-6 py-4 font-medium text-[#111318]">{tx.name}</td>
                                    <td className="px-6 py-4 text-gray-500">{tx.category}</td>
                                    <td className="px-6 py-4 text-gray-400">{tx.date}</td>
                                    <td className={`px-6 py-4 text-right font-bold ${tx.type === 'ingreso' ? 'text-emerald-500' : 'text-red-500'}`}>
                                        {tx.type === 'ingreso' ? '+' : ''}{tx.amount.toFixed(2)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* 3. SECCIÓN INFERIOR */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Gastos por Categoría */}
                <div className={cardClassName}>
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-bold text-[#111318]">Gastos por Categoría</h3>
                        <button className="text-sm text-blue-600 font-semibold hover:underline">Ver todo</button>
                    </div>
                    <div className="space-y-6">
                        {categoryData.map((cat) => (
                            <div key={cat.name}>
                                <div className="flex justify-between items-end mb-1">
                                    <span className="text-sm font-medium text-gray-600 flex items-center gap-2">
                                        <span className={`w-3 h-3 rounded-full ${cat.color}`}></span>
                                        {cat.name}
                                    </span>
                                    <span className="text-sm font-bold text-[#111318]">${cat.amount.toFixed(2)}</span>
                                </div>
                                <div className="w-full bg-gray-100 rounded-full h-2.5">
                                    <div 
                                        className={`h-2.5 rounded-full ${cat.color}`} 
                                        style={{ width: cat.width }}
                                    ></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Gráfico de Balance Mensual */}
                <div className={`${cardClassName} min-h-[350px] flex flex-col`}>
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-bold text-[#111318]">Balance Mensual</h3>
                        <div className="flex gap-3 text-xs font-medium">
                            <span className="flex items-center gap-1 text-gray-500"><span className="w-2 h-2 rounded-full bg-emerald-500"></span> Ingresos</span>
                            <span className="flex items-center gap-1 text-gray-500"><span className="w-2 h-2 rounded-full bg-blue-600"></span> Gastos</span>
                        </div>
                    </div>
                    <div className="h-[250px] w-full flex-1">
                         <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData} barGap={8}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                <XAxis 
                                    dataKey="name" 
                                    axisLine={false} 
                                    tickLine={false} 
                                    tick={{ fill: '#9CA3AF', fontSize: 12 }} 
                                    dy={10}
                                />
                                <Tooltip 
                                    cursor={{ fill: '#f9fafb' }}
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                />
                                <Bar dataKey="ingresos" fill="#10B981" radius={[4, 4, 4, 4]} barSize={12} />
                                <Bar dataKey="gastos" fill="#2563EB" radius={[4, 4, 4, 4]} barSize={12} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

            </div>
        </div>
    </CardTransition>
  );
};

export default Dashboard;