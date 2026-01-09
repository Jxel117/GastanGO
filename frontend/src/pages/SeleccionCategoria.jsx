import { useNavigate } from 'react-router-dom';
import { useTransaction } from '../context/TransactionContext';
import CardTransition from './components/CardTransition';
import { useEffect } from 'react';

const categories = [
  { id: 'comida', name: 'Comida', icon: 'restaurant' },
  { id: 'transporte', name: 'Transporte', icon: 'directions_bus' },
  { id: 'hogar', name: 'Hogar', icon: 'home' },
  { id: 'entretenimiento', name: 'Entretenimiento', icon: 'movie' },
  { id: 'salud', name: 'Salud', icon: 'medical_services' },
  { id: 'ropa', name: 'Ropa', icon: 'checkroom' },
  { id: 'educacion', name: 'Educación', icon: 'school' },
  { id: 'ahorros', name: 'Ahorros', icon: 'savings' },
  { id: 'salario', name: 'Salario', icon: 'payments' },
  { id: 'inversiones', name: 'Inversiones', icon: 'trending_up' },
];

const SeleccionCategoria = () => {
  const navigate = useNavigate();
  const { updateTransaction, transactionData } = useTransaction();
  const transactionType = transactionData.type; // 'expense' o 'income'

  // Depurar el tipo recibido
  useEffect(() => {
    console.log('Tipo de transacción en SeleccionCategoria:', transactionType);
    console.log('TransactionData completo:', transactionData);
  }, [transactionType, transactionData]);

  // Filtrar categorías según el tipo de transacción
  const filteredCategories = transactionType === 'expense'
    ? categories.filter(cat => ['Comida', 'Transporte', 'Hogar', 'Entretenimiento', 'Salud', 'Ropa', 'Educación'].includes(cat.name))
    : categories.filter(cat => ['Ahorros', 'Salario', 'Inversiones'].includes(cat.name));

  const handleCategorySelect = (categoryName) => {
    updateTransaction('category', categoryName);
    navigate('/registro/monto'); // Siguiente paso
  };

  return (
    <CardTransition>
      <div className="max-w-4xl mx-auto text-center space-y-8">
        <div className="flex items-center justify-between px-4">
             <button onClick={() => navigate(-1)} className="text-gray-400 hover:text-gray-800 flex items-center gap-1 font-medium">
                <span className="material-symbols-outlined">arrow_back</span> Atrás
             </button>
             <h2 className="text-2xl font-bold text-[#111318]">Selecciona la Categoría</h2>
             <div className="w-16"></div> {/* Espaciador para centrar el título */}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => handleCategorySelect(cat.name)}
              className="flex flex-col items-center justify-center gap-3 p-6 rounded-[24px] bg-white border border-gray-100 hover:border-blue-500 hover:shadow-lg hover:bg-blue-50 transition-all duration-200 group aspect-square"
            >
              <span className="material-symbols-outlined text-3xl text-blue-600 group-hover:scale-110 transition-transform">
                {cat.icon}
              </span>
              <span className="text-sm font-semibold text-gray-700 group-hover:text-blue-700">
                {cat.name}
              </span>
            </button>
          ))}
        </div>
      </div>
    </CardTransition>
  );
};

export default SeleccionCategoria;