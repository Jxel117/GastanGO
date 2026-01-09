import { createContext, useState, useContext } from 'react';

// Estructura inicial basada en tu JSON del backend
const initialState = {
  type: '',       // 'expense' o 'income'
  category: '',   // string
  amount: 0,      // number
  description: '' // string (podemos poner una por defecto si no hay pantalla para esto)
};

const TransactionContext = createContext();

export const TransactionProvider = ({ children }) => {
  const [transactionData, setTransactionData] = useState(initialState);

  // Función para actualizar campos específicos
  const updateTransaction = (field, value) => {
    setTransactionData(prev => ({ ...prev, [field]: value }));
  };

  // Función para reiniciar el formulario al terminar
  const resetTransaction = () => {
    setTransactionData(initialState);
  };

  return (
    <TransactionContext.Provider value={{ transactionData, updateTransaction, resetTransaction }}>
      {children}
    </TransactionContext.Provider>
  );
};

export const useTransaction = () => useContext(TransactionContext);