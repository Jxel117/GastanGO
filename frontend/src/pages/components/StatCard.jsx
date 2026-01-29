import React from 'react';
import PropTypes from 'prop-types';
import CardTransition from './CardTransition';
import { cn } from '../utils/cn';

/**
 * StatCard - Componente seguro para mostrar estadísticas financieras
 * @param {Object} props - Propiedades del componente
 * @returns {JSX.Element} Tarjeta de estadística con validación de datos
 */
const StatCard = ({ 
  title, 
  amount, 
  percentage, 
  color = 'blue',
  icon,
  delay = 0,
  isLoading = false,
  trendIcon = true,
  className = '',
  ariaLabel = null,
  ...props 
}) => {
  // Validación y sanitización de entradas
  const safeTitle = typeof title === 'string' ? title : 'Estadística';
  const safeAmount = typeof amount === 'string' ? amount : '0';
  const safePercentage = typeof percentage === 'string' || typeof percentage === 'number' 
    ? parseFloat(percentage) || 0 
    : 0;
  
  const isPositive = safePercentage >= 0;
  
  // Configuración de colores validada
  const colorConfig = {
    emerald: {
      bg: 'bg-emerald-50',
      iconBg: 'bg-emerald-100',
      text: 'text-emerald-600',
      border: 'border-emerald-100',
      trendIcon: 'trending_up',
      ariaLabel: 'Tendencia positiva'
    },
    red: {
      bg: 'bg-red-50',
      iconBg: 'bg-red-100',
      text: 'text-red-600',
      border: 'border-red-100',
      trendIcon: 'trending_down',
      ariaLabel: 'Tendencia negativa'
    },
    blue: {
      bg: 'bg-blue-50',
      iconBg: 'bg-blue-100',
      text: 'text-blue-600',
      border: 'border-blue-100',
      trendIcon: isPositive ? 'trending_up' : 'trending_down',
      ariaLabel: isPositive ? 'Tendencia positiva' : 'Tendencia negativa'
    },
    purple: {
      bg: 'bg-purple-50',
      iconBg: 'bg-purple-100',
      text: 'text-purple-600',
      border: 'border-purple-100',
      trendIcon: isPositive ? 'trending_up' : 'trending_down',
      ariaLabel: isPositive ? 'Tendencia positiva' : 'Tendencia negativa'
    }
  };

  const config = colorConfig[color] || colorConfig.blue;
  const cardId = `stat-card-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <CardTransition 
      delay={delay}
      ariaLabel={ariaLabel || `Estadística: ${safeTitle}`}
    >
      <article
        id={cardId}
        className={cn(
          "w-full bg-white rounded-2xl shadow-sm border p-6 flex flex-col",
          config.border,
          "hover:shadow-md transition-all duration-300",
          "focus:outline-none focus:ring-2 focus:ring-blue-500",
          isLoading && "animate-pulse pointer-events-none",
          className
        )}
        aria-labelledby={`${cardId}-title`}
        tabIndex="0"
        {...props}
      >
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div>
            <p 
              id={`${cardId}-title`}
              className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1"
            >
              {safeTitle}
            </p>
            {isLoading ? (
              <div 
                className="h-8 bg-slate-200 rounded w-32"
                aria-hidden="true"
              >
                <span className="sr-only">Cargando valor...</span>
              </div>
            ) : (
              <p 
                className="text-2xl font-bold text-slate-800"
                aria-live="polite"
              >
                {safeAmount}
              </p>
            )}
          </div>
          
          <div 
            className={cn(
              "p-2.5 rounded-xl flex items-center justify-center",
              config.iconBg,
              config.text
            )}
            aria-hidden="true"
          >
            <span className="material-symbols-outlined text-xl">
              {isLoading ? 'refresh' : icon}
            </span>
          </div>
        </div>
        
        {/* Trend Indicator */}
        {!isLoading && (
          <div 
            className={cn(
              "text-sm font-medium flex items-center gap-1.5 mt-2",
              isPositive ? 'text-emerald-600' : 'text-red-600'
            )}
            role="status"
            aria-label={`${config.ariaLabel}: ${safePercentage > 0 ? '+' : ''}${safePercentage}% comparado con el período anterior`}
          >
            {trendIcon && (
              <span 
                className="material-symbols-outlined text-base"
                aria-hidden="true"
              >
                {config.trendIcon}
              </span>
            )}
            <span className="font-semibold">
              {safePercentage > 0 ? '+' : ''}{safePercentage}%
            </span>
            <span className="text-xs text-slate-500 ml-1">
              vs período anterior
            </span>
          </div>
        )}
        
        {/* Estado de carga para screen readers */}
        {isLoading && (
          <span className="sr-only" aria-live="polite">
            Cargando estadística: {safeTitle}
          </span>
        )}
      </article>
    </CardTransition>
  );
};

StatCard.propTypes = {
  title: PropTypes.string.isRequired,
  amount: PropTypes.string,
  percentage: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number
  ]),
  color: PropTypes.oneOf(['emerald', 'red', 'blue', 'purple']),
  icon: PropTypes.string,
  delay: PropTypes.number,
  isLoading: PropTypes.bool,
  trendIcon: PropTypes.bool,
  className: PropTypes.string,
  ariaLabel: PropTypes.string,
};

StatCard.defaultProps = {
  amount: '$0',
  percentage: 0,
  isLoading: false,
  trendIcon: true,
};

export default StatCard;