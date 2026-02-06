import React from 'react';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';
import { cn } from '../utils/cn';

/**
 * Loader - Componente seguro de indicador de carga
 * @param {Object} props - Propiedades del componente
 * @returns {JSX.Element} Indicador de carga accesible
 */
const Loader = ({ 
  message = 'Cargando...', 
  fullScreen = false,
  size = 'md',
  className = '',
  ariaLabel = null,
  ...props 
}) => {
  // Validación de tamaño
  const sizeConfig = {
    sm: { classes: 'w-6 h-6 border-2', label: 'Carga pequeña' },
    md: { classes: 'w-10 h-10 border-3', label: 'Carga' },
    lg: { classes: 'w-14 h-14 border-4', label: 'Carga grande' }
  };
  
  const config = sizeConfig[size] || sizeConfig.md;
  
  // Sanitización del mensaje
  const safeMessage = typeof message === 'string' ? message : 'Cargando...';
  const screenReaderMessage = ariaLabel || safeMessage;

  const containerClasses = cn(
    "flex flex-col items-center justify-center",
    fullScreen ? "min-h-screen" : "min-h-64",
    className
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={containerClasses}
      role="status"
      aria-live="polite"
      aria-label={screenReaderMessage}
      aria-busy="true"
      {...props}
    >
      <div className="relative" aria-hidden="true">
        {/* Spinner principal */}
        <div 
          className={cn(
            "border-blue-600 border-t-transparent rounded-full animate-spin",
            config.classes
          )}
          style={{ 
            animationDuration: '1s',
            animationIterationCount: 'infinite',
            animationTimingFunction: 'linear'
          }}
        />
        {/* Spinner secundario para efecto de profundidad */}
        <div 
          className={cn(
            "absolute inset-0 border-blue-200 border-t-transparent rounded-full animate-spin",
            config.classes
          )}
          style={{ 
            animationDuration: '1.5s',
            animationIterationCount: 'infinite',
            animationTimingFunction: 'linear',
            animationDelay: '0.2s'
          }}
        />
      </div>
      
      {/* Mensaje visual (opcional para screen readers) */}
      {safeMessage && (
        <p 
          className="text-slate-500 text-sm mt-4 font-medium"
          aria-hidden="true"
        >
          {safeMessage}
        </p>
      )}
      
      {/* Mensaje solo para screen readers */}
      <span className="sr-only">{screenReaderMessage}</span>
    </motion.div>
  );
};

Loader.propTypes = {
  message: PropTypes.string,
  fullScreen: PropTypes.bool,
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  className: PropTypes.string,
  ariaLabel: PropTypes.string,
};

export default Loader;