import React, { createContext, useState, useContext } from 'react';

const initialState = {
  type: '',       // 'expense' | 'income'
  category: '', 
  amount: 0,
  description: ''
};

const TransactionContext = createContext();

export const TransactionProvider = ({ children }) => {
  const [transactionData, setTransactionData] = useState(initialState);

  const updateTransaction = (field, value) => {
    setTransactionData(prev => ({ ...prev, [field]: value }));
  };

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