import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTransaction } from '../context/TransactionContext';
import CardTransition from './components/CardTransition';
import toast from 'react-hot-toast'; 
import api from '../services/api';

const IngresoMonto = () => {
  const navigate = useNavigate();
  const { transactionData, updateTransaction, resetTransaction } = useTransaction();
  const [displayAmount, setDisplayAmount] = useState('0');
  const [showModal, setShowModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [description, setDescription] = useState('');

  // Identificar si es Gasto
  const isExpense = transactionData.type === 'expense'; 

  // --- LÓGICA DE TECLADO ---
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

  // --- ABRIR CONFIRMACIÓN ---
  const handleOpenConfirmation = () => {
    const amount = parseFloat(displayAmount);
    
    if (amount <= 0) {
        toast.error("Por favor ingresa un monto mayor a 0");
        return;
    }

    // Solo validamos descripción si NO es gasto (es decir, si es Ingreso)
    if (!isExpense && !description.trim()) {
        toast.error("Por favor agrega una breve descripción");
        return;
    }

    updateTransaction('amount', amount);
    setShowModal(true);
  };

  // --- GUARDAR EN BD ---
  const handleFinalSave = async () => {
    try {
      setIsSaving(true);
      const finalAmount = parseFloat(displayAmount);
      
      // Lógica de descripción:
      // Si es Gasto -> Usamos "Gasto en [Categoria]" automáticamente.
      // Si es Ingreso -> Usamos lo que escribió el usuario.
      const finalDescription = isExpense 
        ? `Gasto en ${transactionData.category}` 
        : description;

      const payload = {
        type: transactionData.type,
        category: transactionData.category,
        amount: finalAmount,
        description: finalDescription, 
        date: new Date().toISOString()
      };

      await api.post('/transactions', payload); 
      
      toast.success('¡Transacción guardada exitosamente!');
      resetTransaction();
      setShowModal(false);
      navigate('/dashboard'); 

    } catch (error) {
      console.error("Error al guardar:", error);
      const errorMsg = error.response?.data?.message || 'Error al conectar con el servidor';
      toast.error(errorMsg);
    } finally {
      setIsSaving(false);
    }
  };

  // Variables de estilo
  const colorClass = isExpense ? 'text-red-500' : 'text-emerald-500';
  const numBtnClass = "h-14 w-full rounded-[16px] text-xl font-semibold text-gray-700 bg-white border border-gray-100 shadow-[0_2px_4px_rgba(0,0,0,0.02)] hover:bg-gray-50 hover:shadow-md active:scale-90 transition-all duration-150 flex items-center justify-center select-none";

  return (
    <CardTransition>
      <div className="max-w-md mx-auto h-full flex flex-col">
        
        {/* HEADER */}
        <div className="flex items-center justify-between px-4 py-4 w-full">
             <div className="w-24 flex justify-start">
                <button onClick={() => navigate(-1)} className="text-gray-400 hover:text-gray-800 flex items-center gap-1 font-medium transition-colors">
                    <span className="material-symbols-outlined">arrow_back</span> Atrás
                </button>
             </div>
             <h2 className="text-xl font-bold text-[#111318] whitespace-nowrap">
                {isExpense ? 'Registrar Gasto' : 'Registrar Ingreso'}
             </h2>
             <div className="w-24"></div> 
        </div>

        {/* DISPLAY DEL MONTO */}
        <div className="flex flex-col items-center justify-center mb-4 min-h-[120px]">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1 bg-gray-50 px-3 py-1 rounded-full">
                {transactionData.category}
            </span>
            <div className="flex items-baseline text-[#111318]">
                <span className="text-3xl font-bold text-gray-300 mr-2">$</span>
                <span className={`font-extrabold tracking-tighter ${displayAmount === '0' ? 'text-gray-300' : 'text-[#111318]'} text-6xl`}>
                    {displayAmount}
                </span>
            </div>
        </div>

        {/* CAMPO DE DESCRIPCIÓN (CONDICIONAL: Solo si NO es gasto) */}
        {!isExpense && (
            <div className="px-8 mb-6 animate-in fade-in slide-in-from-bottom-2">
                <input 
                    type="text" 
                    value={description}
                    onChange={(e) => setDescription(e.target.value.toUpperCase())}
                    placeholder="DESCRIPCIÓN BREVE"
                    className="w-full text-center py-3 border-b-2 border-emerald-100 focus:border-emerald-500 outline-none text-lg font-bold text-gray-700 placeholder:text-gray-300 transition-colors uppercase"
                    maxLength={30}
                    autoFocus
                />
            </div>
        )}

        {/* Espaciador si es gasto para mantener el diseño equilibrado */}
        {isExpense && <div className="mb-8"></div>}

        {/* TECLADO NUMÉRICO */}
        <div className="px-6 pb-6 flex-1 flex flex-col justify-end">
            <div className="grid grid-cols-3 gap-3 mb-6 max-w-[300px] mx-auto w-full">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                    <button key={num} onClick={() => handleNumberClick(num)} className={numBtnClass}>{num}</button>
                ))}
                <button onClick={() => handleNumberClick('.')} className={numBtnClass}>.</button>
                <button onClick={() => handleNumberClick(0)} className={numBtnClass}>0</button>
                <button onClick={handleBackspace} className={`${numBtnClass} text-red-400 hover:bg-red-50 hover:text-red-500`}>
                    <span className="material-symbols-outlined text-[24px]">backspace</span>
                </button>
            </div>

            <button
                onClick={handleOpenConfirmation}
                // La validación cambia dependiendo de si es gasto o ingreso
                disabled={
                    parseFloat(displayAmount) <= 0 || 
                    (!isExpense && !description.trim())
                }
                className={`w-full py-4 rounded-[24px] font-bold text-lg shadow-lg transition-all transform active:scale-95
                    ${
                        (parseFloat(displayAmount) > 0 && (isExpense || description.trim()))
                        ? (isExpense ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-emerald-500 text-white hover:bg-emerald-600') 
                        : 'bg-gray-100 text-gray-400 cursor-not-allowed shadow-none'
                    }
                `}
            >
                Confirmar
            </button>
        </div>

        {/* MODAL DE CONFIRMACIÓN */}
        {showModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-lg animate-in fade-in duration-200" style={{ background: 'rgba(0,0,0,0.2)' }}>
                <div className="bg-white rounded-[32px] w-full max-w-sm p-6 shadow-2xl scale-100 animate-in zoom-in-95 duration-200 flex flex-col items-center text-center">
                    
                    <h3 className="text-xl font-bold text-gray-800 mb-4">Confirmar Transacción</h3>
                    
                    <div className="w-full bg-gray-50 rounded-2xl p-4 mb-6 text-left space-y-2">
                        <div className="flex justify-between">
                            <span className="text-gray-500 text-sm">Categoría</span>
                            <span className="font-bold text-gray-800">{transactionData.category}</span>
                        </div>
                        {/* Mostrar descripción solo si es Ingreso en el resumen, o la generada si es gasto */}
                        <div className="flex justify-between">
                            <span className="text-gray-500 text-sm">Detalle</span>
                            <span className="font-bold text-gray-800 uppercase truncate max-w-[150px]">
                                {isExpense ? 'Gasto registrado' : description}
                            </span>
                        </div>
                        <div className="flex justify-between border-t border-gray-200 pt-2 mt-2">
                            <span className="text-gray-500 text-sm">Total</span>
                            <span className={`font-bold ${colorClass}`}>${parseFloat(displayAmount).toFixed(2)}</span>
                        </div>
                    </div>

                    <div className="flex gap-3 w-full">
                        <button onClick={() => setShowModal(false)} disabled={isSaving} className="flex-1 py-3 rounded-xl font-bold text-gray-500 bg-gray-100 hover:bg-gray-200">
                            Editar
                        </button>
                        <button onClick={handleFinalSave} disabled={isSaving} className="flex-1 py-3 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 flex justify-center">
                             {isSaving ? '...' : 'Guardar'}
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