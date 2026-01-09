import { useNavigate } from 'react-router-dom';
import { useTransaction } from '../context/TransactionContext';
import CardTransition from './components/CardTransition';
import { useEffect } from 'react';

const RegistroTransaccion = () => {
  const navigate = useNavigate();
  const { updateTransaction, transactionData } = useTransaction(); 
  
  useEffect(() => {
    console.log('TransactionData cambió:', transactionData);
  }, [transactionData]); 

  const handleGasto = () => {
    updateTransaction('type', 'expense');
    // Gasto SÍ va a seleccionar categoría
    navigate('/registro/categorias'); 
  };

  const handleIngreso = () => {
    updateTransaction('type', 'income');
    // CAMBIO IMPORTANTE:
    // 1. Asignamos una categoría automática (el backend la requiere)
    updateTransaction('category', 'INGRESOS'); 
    // 2. Saltamos directamente a la pantalla de monto
    navigate('/registro/monto');
  };

  return (
    <CardTransition>
      <div className="flex flex-col items-center justify-center h-full min-h-[60vh] text-center space-y-10">
        
        <div className="space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <h1 className="text-3xl md:text-4xl font-extrabold text-[#111318] tracking-tight">
                Selecciona el tipo
            </h1>
            <p className="text-gray-500 text-lg">
                ¿Qué deseas registrar?
            </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-3xl px-4">
            {/* Opción GASTO (Rojo) - Se mantiene igual */}
            <button 
                onClick={handleGasto}
                className="group relative flex flex-col items-center justify-center gap-4 p-12 rounded-[32px] bg-red-50 border-2 border-transparent hover:border-red-200 hover:bg-red-100 transition-all duration-300 cursor-pointer shadow-sm hover:shadow-lg hover:-translate-y-1"
            >
                <div className="w-16 h-16 rounded-full bg-red-200 text-red-600 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                     <span className="material-symbols-outlined text-4xl">trending_down</span>
                </div>
                <span className="text-2xl font-bold text-red-600 group-hover:text-red-700">Gasto</span>
            </button>

            {/* Opción INGRESO (Verde) - Ahora salta categorías */}
            <button 
                onClick={handleIngreso}
                className="group relative flex flex-col items-center justify-center gap-4 p-12 rounded-[32px] bg-emerald-50 border-2 border-transparent hover:border-emerald-200 hover:bg-emerald-100 transition-all duration-300 cursor-pointer shadow-sm hover:shadow-lg hover:-translate-y-1"
            >
                <div className="w-16 h-16 rounded-full bg-emerald-200 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                     <span className="material-symbols-outlined text-4xl">trending_up</span>
                </div>
                <span className="text-2xl font-bold text-emerald-600 group-hover:text-emerald-700">Ingreso</span>
            </button>
        </div>
      </div>
    </CardTransition>
  );
};

export default RegistroTransaccion;