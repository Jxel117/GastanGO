import { motion } from 'framer-motion';

const CardTransition = ({ children }) => {
  return (
    <motion.div
      // 1. ESTADO INICIAL (Viene desde "atrás")
      initial={{ scale: 0.8, opacity: 0, filter: 'blur(10px)' }} 
      
      // 2. ESTADO VISIBLE (Está al frente)
      animate={{ scale: 1, opacity: 1, filter: 'blur(0px)' }} 
      
      // 3. ESTADO DE SALIDA (Se va hacia "atrás" de nuevo)
      exit={{ scale: 0.8, opacity: 0, filter: 'blur(10px)' }} 
      
      // CONFIGURACIÓN DE TIEMPO (Suavidad)
      transition={{ duration: 0.4, ease: "easeInOut" }}
      
      className="w-full h-full flex justify-center items-center"
    >
      {children}
    </motion.div>
  );
};

export default CardTransition;