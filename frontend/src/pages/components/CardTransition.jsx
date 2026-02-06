import React from 'react';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';

/**
 * CardTransition - Componente seguro de transición animada
 * @param {Object} props - Propiedades del componente
 * @param {React.ReactNode} props.children - Contenido a animar
 * @param {string} props.className - Clases CSS adicionales
 * @param {number} props.duration - Duración de la animación en segundos
 * @param {string} props.ariaLabel - Etiqueta ARIA para accesibilidad
 * @returns {JSX.Element} Componente animado con transiciones seguras
 */
const CardTransition = ({ 
  children, 
  className = '', 
  duration = 0.3,
  ariaLabel = 'Contenido animado',
  ...props 
}) => {
  // Validación de entrada
  const safeDuration = Math.max(0.1, Math.min(2, parseFloat(duration) || 0.3));
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ 
        duration: safeDuration,
        ease: "easeOut"
      }}
      className={className}
      aria-label={ariaLabel}
      role="region"
      aria-live="polite"
      aria-atomic="true"
      {...props}
    >
      {children}
    </motion.div>
  );
};

CardTransition.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  duration: PropTypes.number,
  ariaLabel: PropTypes.string,
};

export default CardTransition;