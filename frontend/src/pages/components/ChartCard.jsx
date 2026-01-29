import React from 'react';
import PropTypes from 'prop-types';
import CardTransition from './CardTransition';
import { cn } from "../utils/cn";
import { Loader } from './Loader';

/**
 * ChartCard - Componente seguro para contenedor de gráficos
 * @param {Object} props - Propiedades del componente
 * @returns {JSX.Element} Tarjeta contenedora con manejo seguro de estados
 */
const ChartCard = ({ 
  children, 
  title, 
  subtitle, 
  action,
  isLoading = false,
  delay = 0,
  className = '',
  headerClassName = '',
  contentClassName = '',
  loadingHeight = '300px',
  error = null,
  ariaLabel = null,
  ...props 
}) => {
  // Sanitización de entrada
  const safeTitle = typeof title === 'string' ? title : 'Gráfico';
  const safeSubtitle = typeof subtitle === 'string' ? subtitle : '';
  const cardId = `chart-card-${Math.random().toString(36).substr(2, 9)}`;
  
  const renderContent = () => {
    if (error) {
      return (
        <div 
          className="flex items-center justify-center h-full"
          style={{ minHeight: loadingHeight }}
          role="alert"
          aria-live="assertive"
        >
          <div className="text-center" aria-label="Error cargando gráfico">
            <span className="material-symbols-outlined text-4xl text-red-500 mb-3">
              error
            </span>
            <p className="text-slate-600 text-sm font-medium">
              Error al cargar datos
            </p>
            <p className="text-slate-400 text-xs mt-1">
              Intente nuevamente
            </p>
          </div>
        </div>
      );
    }
    
    if (isLoading) {
      return (
        <div 
          className="flex items-center justify-center h-full"
          style={{ minHeight: loadingHeight }}
          aria-busy="true"
          aria-label="Cargando gráfico"
        >
          <Loader size="md" message="" />
        </div>
      );
    }
    
    return children;
  };

  return (
    <CardTransition 
      delay={delay}
      ariaLabel={ariaLabel || `Gráfico: ${safeTitle}`}
    >
      <article
        id={cardId}
        className={cn(
          "w-full bg-white rounded-2xl shadow-sm border border-slate-200",
          "overflow-hidden flex flex-col focus:outline-none focus:ring-2 focus:ring-blue-500",
          className
        )}
        aria-labelledby={`${cardId}-title`}
        tabIndex="0"
        {...props}
      >
        {/* Header */}
        <header className={cn(
          "px-6 py-5 border-b border-slate-100 flex justify-between items-center",
          headerClassName
        )}>
          <div>
            <h3 
              id={`${cardId}-title`}
              className="font-bold text-slate-800 text-lg"
            >
              {safeTitle}
            </h3>
            {safeSubtitle && (
              <p className="text-slate-500 text-sm mt-1">
                {safeSubtitle}
              </p>
            )}
          </div>
          
          {action && (
            <button
              className="text-slate-400 hover:text-slate-600 transition-colors p-1.5 rounded-lg hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Más opciones"
              aria-haspopup="true"
              onClick={(e) => e.stopPropagation()}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.stopPropagation();
                  e.preventDefault();
                }
              }}
            >
              <span 
                className="material-symbols-outlined"
                aria-hidden="true"
              >
                more_horiz
              </span>
            </button>
          )}
        </header>

        {/* Content */}
        <div 
          className={cn("flex-1 p-6", contentClassName)}
          aria-live="polite"
          aria-atomic="true"
        >
          {renderContent()}
        </div>
      </article>
    </CardTransition>
  );
};

ChartCard.propTypes = {
  children: PropTypes.node.isRequired,
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string,
  action: PropTypes.bool,
  isLoading: PropTypes.bool,
  delay: PropTypes.number,
  className: PropTypes.string,
  headerClassName: PropTypes.string,
  contentClassName: PropTypes.string,
  loadingHeight: PropTypes.string,
  error: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.instanceOf(Error)
  ]),
  ariaLabel: PropTypes.string,
};

export default ChartCard;