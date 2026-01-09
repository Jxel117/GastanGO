import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTransaction } from '../context/TransactionContext';
import CardTransition from './components/CardTransition';
import toast from 'react-hot-toast'; 

const IngresoMonto = () => {
  const navigate = useNavigate();
  const { transactionData, updateTransaction, resetTransaction } = useTransaction();
  const [displayAmount, setDisplayAmount] = useState('0');
  
  // 1. NUEVO ESTADO: Controla la visibilidad del cuadro de confirmación
  const [showModal, setShowModal] = useState(false);

  const getCategoryIcon = (categoryName) => {
  const icons = {
    'Comida': 'restaurant',
    'Transporte': 'directions_bus',
    'Hogar': 'home',
    'Entretenimiento': 'movie',
    'Salud': 'medical_services',
    'Ropa': 'checkroom',
    'Educación': 'school',
    'Ahorros': 'savings',
    'Salario': 'payments',
    'Inversiones': 'trending_up',
    'Regalos': 'redeem',
    'Mascotas': 'pets'
  };
  return icons[categoryName] || 'category'; // Icono por defecto
};



  const handleNumberClick = (num) => {
    if (displayAmount.length >= 8) return; 

    if (displayAmount === '0' && num !== '.') {
        setDisplayAmount(num.toString());
    } else if (displayAmount.includes('.') && num === '.') {
        return; 
    } else {
        setDisplayAmount(prev => prev + num);
    }
  };

  const handleBackspace = () => {
    setDisplayAmount(prev => prev.length > 1 ? prev.slice(0, -1) : '0');
  };

  // 2. MODIFICADO: Esta función ahora solo ABRE el modal
  const handleOpenConfirmation = () => {
    const amount = parseFloat(displayAmount);
    
    if (amount <= 0) {
        alert("Por favor ingresa un monto mayor a 0");
        return;
    }

    // Actualizamos el contexto con el monto actual antes de confirmar
    updateTransaction('amount', amount);
    setShowModal(true); // Abrimos el cuadro de diálogo
  };

  // 3. NUEVA FUNCIÓN: Se ejecuta cuando el usuario dice "SÍ" en el modal
  const handleFinalSave = () => {
    const finalAmount = parseFloat(displayAmount);
    updateTransaction('description', `Movimiento de ${transactionData.category}`);
    
    // Aquí tu lógica de guardado (Backend)
    console.log("GUARDADO EXITOSO:", { ...transactionData, amount: finalAmount });
    
    // Cerrar modal y navegar
    setShowModal(false);
    navigate('/dashboard'); 
  };

  // 4. NUEVA FUNCIÓN: Resetea el registro y navega al inicio del flujo
  const handleResetRegistro = () => {
    resetTransaction();
    setShowModal(false);
    navigate('/registro'); // O '/registro/' si es la ruta base
  };

  // Variables para estilos dinámicos (Rojo para gastos / Verde para ingresos)
  const isExpense = transactionData.type !== 'income'; 
  const colorClass = isExpense ? 'text-red-500' : 'text-emerald-500';
  const bgIconClass = isExpense ? 'bg-red-100 text-red-500' : 'bg-emerald-100 text-emerald-500';
  const sign = isExpense ? '-' : '+';

  const numBtnClass = "h-16 w-full rounded-[20px] text-2xl font-semibold text-gray-700 bg-white border border-gray-100 shadow-[0_2px_4px_rgba(0,0,0,0.02)] hover:bg-gray-50 hover:shadow-md active:scale-90 transition-all duration-150 flex items-center justify-center select-none";

  return (
    <CardTransition>
      <div className="max-w-md mx-auto h-full flex flex-col">
        
        {/* 1. HEADER CORREGIDO (Estructura de 3 columnas equilibrada) */}
        <div className="flex items-center justify-between px-4 py-6 w-full">
             {/* Columna Izquierda: Botón Atrás (Ancho fijo para empujar) */}
             <div className="w-24 flex justify-start">
                <button 
                    onClick={() => navigate(-1)} 
                    className="text-gray-400 hover:text-gray-800 flex items-center gap-1 font-medium transition-colors"
                >
                    <span className="material-symbols-outlined">arrow_back</span> Atrás
                </button>
             </div>

             {/* Columna Central: Título */}
             <h2 className="text-xl md:text-2xl font-bold text-[#111318] text-center whitespace-nowrap">
                Ingresa el Monto
             </h2>

             {/* Columna Derecha: Espaciador Fantasma (Mismo ancho que la izq) */}
             <div className="w-24"></div> 
        </div>

        {/* 2. DISPLAY DEL MONTO */}
        <div className="flex-1 flex flex-col items-center justify-center mb-4 min-h-[100px]">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 bg-gray-50 px-3 py-1 rounded-full">
                {transactionData.category || 'Categoría'}
            </span>
            <div className="flex items-baseline text-[#111318]">
                <span className="text-4xl font-bold text-gray-300 mr-2">$</span>
                <span className={`font-extrabold tracking-tighter ${displayAmount === '0' ? 'text-gray-300' : 'text-[#111318]'} text-7xl`}>
                    {displayAmount}
                </span>
            </div>
        </div>

        {/* 3. TECLADO NUMÉRICO */}
        <div className="px-6 pb-8">
            <div className="grid grid-cols-3 gap-4 mb-8 max-w-[320px] mx-auto">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                    <button key={num} onClick={() => handleNumberClick(num)} className={numBtnClass}>
                        {num}
                    </button>
                ))}
                
                <button onClick={() => handleNumberClick('.')} className={numBtnClass}>.</button>
                <button onClick={() => handleNumberClick(0)} className={numBtnClass}>0</button>
                
                <button onClick={handleBackspace} className={`${numBtnClass} text-red-400 hover:bg-red-50 hover:text-red-500 hover:border-red-100`}>
                    <span className="material-symbols-outlined text-[28px]">backspace</span>
                </button>
            </div>

            {/* 4. BOTÓN CONFIRMAR */}
            <button
                onClick={handleOpenConfirmation}
                disabled={parseFloat(displayAmount) <= 0}
                className={`w-full py-4 rounded-[24px] font-bold text-lg shadow-lg transition-all transform active:scale-95
                    ${parseFloat(displayAmount) > 0 
                        ? 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-blue-200' 
                        : 'bg-gray-100 text-gray-400 cursor-not-allowed shadow-none'}
                `}
            >
                Confirmar Transacción
            </button>
        </div>

        {/* 5. MODAL DE CONFIRMACIÓN */}
        {showModal && (
            <div 
                className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-lg animate-in fade-in duration-200"
                style={{ background: 'radial-gradient(circle at center, rgba(0,0,0,0.1) 0%, transparent 70%)' }}
            >
                {/* Tarjeta del Modal */}
                <div className="bg-white rounded-[32px] w-full max-w-sm p-8 shadow-2xl scale-100 animate-in zoom-in-95 duration-200 flex flex-col items-center text-center border border-gray-100">
                    
                    {/* Icono de la categoría */}
                    <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-5 ${isExpense ? 'bg-red-100 text-red-500' : 'bg-emerald-100 text-emerald-500'}`}>
                        <span className="material-symbols-outlined text-4xl">
                            {getCategoryIcon(transactionData.category)}
                        </span>
                    </div>

                    <h3 className="text-xl font-bold text-gray-800 mb-1">
                        ¿Desea confirmar esta transacción?
                    </h3>
                    <p className="text-gray-400 text-sm mb-4">
                        Tipo: {isExpense ? 'Gasto' : 'Ingreso'} | Categoría: {transactionData.category}
                    </p>

                    {/* Detalles de la Transacción */}
                    <div className="w-full bg-gray-50 rounded-2xl p-4 mb-6 text-left">
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Tipo:</span>
                                <span className="font-semibold">{isExpense ? 'Gasto' : 'Ingreso'}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Categoría:</span>
                                <span className="font-semibold">{transactionData.category}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Monto:</span>
                                <span className={`font-semibold ${colorClass}`}>{sign}${parseFloat(displayAmount).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Descripción:</span>
                                <span className="font-semibold">{transactionData.description || 'Movimiento de ' + transactionData.category}</span>
                            </div>
                        </div>
                    </div>

                    {/* Botones de Acción */}
                    <div className="flex gap-3 w-full">
                        <button 
                            onClick={handleResetRegistro}
                            className="flex-1 py-3.5 rounded-2xl font-bold text-red-600 bg-red-50 border border-red-200 hover:bg-red-100 transition-colors active:scale-95"
                        >
                            Resetear Registro
                        </button>
                        
                        <button 
                            onClick={handleFinalSave}
                            className="flex-1 py-3.5 rounded-2xl font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all active:scale-95"
                        >
                            Confirmar
                        </button>
                    </div>

                </div>
            </div>
        )}

      </div>
    </CardTransition>
  );
};

export default IngresoMonto;