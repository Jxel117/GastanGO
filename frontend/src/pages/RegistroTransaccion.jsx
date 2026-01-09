import { useNavigate } from 'react-router-dom';
import { useTransaction } from '../context/TransactionContext'; // 1. IMPORTAR EL CONTEXTO
import CardTransition from './components/CardTransition'; // Verifica que esta ruta sea correcta según tu estructura
import { useEffect } from 'react';

const RegistroTransaccion = () => {
  const navigate = useNavigate();
  // 2. EXTRAER LA FUNCIÓN PARA ACTUALIZAR DATOS Y EL ESTADO ACTUAL
  const { updateTransaction, transactionData } = useTransaction(); 
  
  // Depurar cambios en transactionData
  useEffect(() => {
    console.log('TransactionData cambió:', transactionData);
  }, [transactionData]); 
  

  const handleGasto = () => {
    // a. Guardamos que es un gasto ('expense' según tu backend)
    updateTransaction('type', 'expense');
    console.log('Tipo establecido como gasto. Estado actual:', transactionData);
    // b. Navegamos a la selección de categoría
    navigate('/registro/categorias'); 
  };

  const handleIngreso = () => {
    // a. Guardamos que es un ingreso ('income' según tu backend)
    updateTransaction('type', 'income');
    console.log('Tipo establecido como ingreso. Estado actual:', transactionData);
    // b. Navegamos a la selección de categoría
    navigate('/registro/categorias');
  };

  return (
    <CardTransition>
      <div className="flex flex-col items-center justify-center h-full min-h-[60vh] text-center space-y-10">
        
        {/* Encabezado de la sección */}
        <div className="space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <h1 className="text-3xl md:text-4xl font-extrabold text-[#111318] tracking-tight">
                Selecciona el tipo de movimiento
            </h1>
            <p className="text-gray-500 text-lg">
                Elige si quieres registrar un gasto o un ingreso para continuar.
            </p>
        </div>

        {/* Botones de Selección */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-3xl px-4">
            
            {/* Opción GASTO (Rojo) */}
            <button 
                onClick={handleGasto}
                className="group relative flex flex-col items-center justify-center gap-4 p-12 rounded-[32px] bg-red-50 border-2 border-transparent hover:border-red-200 hover:bg-red-100 transition-all duration-300 cursor-pointer shadow-sm hover:shadow-lg hover:-translate-y-1"
            >
                <div className="w-16 h-16 rounded-full bg-red-200 text-red-600 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                     <span className="material-symbols-outlined text-4xl">trending_down</span>
                </div>
                <span className="text-2xl font-bold text-red-600 group-hover:text-red-700">Gasto</span>
                
                {/* Efecto decorativo hover */}
                <div className="absolute inset-0 rounded-[32px] ring-4 ring-red-100 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
            </button>

            {/* Opción INGRESO (Verde) */}
            <button 
                onClick={handleIngreso}
                className="group relative flex flex-col items-center justify-center gap-4 p-12 rounded-[32px] bg-emerald-50 border-2 border-transparent hover:border-emerald-200 hover:bg-emerald-100 transition-all duration-300 cursor-pointer shadow-sm hover:shadow-lg hover:-translate-y-1"
            >
                <div className="w-16 h-16 rounded-full bg-emerald-200 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                     <span className="material-symbols-outlined text-4xl">trending_up</span>
                </div>
                <span className="text-2xl font-bold text-emerald-600 group-hover:text-emerald-700">Ingreso</span>

                 {/* Efecto decorativo hover */}
                 <div className="absolute inset-0 rounded-[32px] ring-4 ring-emerald-100 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
            </button>

        </div>

      </div>
    </CardTransition>
  );
};

export default RegistroTransaccion;