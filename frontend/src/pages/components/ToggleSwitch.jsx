import React, { useCallback, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';
import { cn } from '../utils/cn';

/**
 * ToggleSwitch - Componente seguro para alternar entre opciones
 * @param {Object} props - Propiedades del componente
 * @returns {JSX.Element} Interruptor accesible con validación
 */
const ToggleSwitch = ({ 
  activeTab, 
  onChange,
  options = [
    { id: 'monthly', label: 'Mensual' },
    { id: 'annual', label: 'Anual' }
  ],
  ariaLabel = 'Seleccionar período',
  ...props 
}) => {
  const toggleRef = useRef(null);
  
  // Validación de opciones
  const safeOptions = Array.isArray(options) && options.length >= 2 
    ? options.slice(0, 2) 
    : [
        { id: 'monthly', label: 'Mensual' },
        { id: 'annual', label: 'Anual' }
      ];
  
  // Validación de tab activo
  const safeActiveTab = safeOptions.some(opt => opt.id === activeTab) 
    ? activeTab 
    : safeOptions[0].id;
  
  const activeIndex = safeOptions.findIndex(opt => opt.id === safeActiveTab);
  
  // Manejo seguro de teclado
  const handleKeyDown = useCallback((event, tabId) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onChange(tabId);
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault();
      const prevIndex = (activeIndex - 1 + safeOptions.length) % safeOptions.length;
      onChange(safeOptions[prevIndex].id);
    } else if (event.key === 'ArrowRight') {
      event.preventDefault();
      const nextIndex = (activeIndex + 1) % safeOptions.length;
      onChange(safeOptions[nextIndex].id);
    }
  }, [activeIndex, onChange, safeOptions]);
  
  // Focus management
  useEffect(() => {
    if (toggleRef.current) {
      const activeButton = toggleRef.current.querySelector(`[data-tab="${safeActiveTab}"]`);
      if (activeButton) {
        activeButton.focus();
      }
    }
  }, [safeActiveTab]);
  
  return (
    <div
      ref={toggleRef}
      className="relative inline-flex bg-gray-100 rounded-xl p-1.5 border border-gray-200"
      role="tablist"
      aria-label={ariaLabel}
      {...props}
    >
      {/* Indicador visual */}
      <motion.div
        layout
        className="absolute top-1.5 bottom-1.5 bg-white rounded-lg shadow-sm border border-gray-300"
        initial={false}
        animate={{ 
          x: activeIndex === 0 ? '0.25rem' : 'calc(100% - 0.25rem)',
          width: 'calc(50% - 0.5rem)'
        }}
        transition={{ 
          type: "spring", 
          stiffness: 400, 
          damping: 25 
        }}
        aria-hidden="true"
      />
      
      {/* Opciones */}
      {safeOptions.map((option, index) => (
        <button
          key={option.id}
          data-tab={option.id}
          onClick={() => onChange(option.id)}
          onKeyDown={(e) => handleKeyDown(e, option.id)}
          className={cn(
            "relative z-10 px-6 py-2.5 text-sm font-semibold rounded-lg transition-colors min-w-[90px]",
            "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
            safeActiveTab === option.id 
              ? "text-gray-900" 
              : "text-gray-500 hover:text-gray-700"
          )}
          role="tab"
          aria-selected={safeActiveTab === option.id}
          aria-controls={`panel-${option.id}`}
          id={`tab-${option.id}`}
          tabIndex={safeActiveTab === option.id ? 0 : -1}
        >
          {option.label}
          <span className="sr-only">
            {safeActiveTab === option.id ? ', seleccionado' : ''}
          </span>
        </button>
      ))}
      
      {/* Descripción para screen readers */}
      <div className="sr-only" aria-live="polite">
        {safeActiveTab === 'monthly' ? 'Período mensual seleccionado' : 'Período anual seleccionado'}
      </div>
    </div>
  );
};

ToggleSwitch.propTypes = {
  activeTab: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  options: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired
    })
  ),
  ariaLabel: PropTypes.string,
};

ToggleSwitch.defaultProps = {
  options: [
    { id: 'monthly', label: 'Mensual' },
    { id: 'annual', label: 'Anual' }
  ],
  ariaLabel: 'Seleccionar período de visualización'
};

export default ToggleSwitch;