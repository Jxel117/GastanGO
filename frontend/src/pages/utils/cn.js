import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * cn - Utilidad segura para combinar clases CSS de Tailwind
 * @param {...string} inputs - Clases CSS a combinar
 * @returns {string} Clases CSS combinadas y optimizadas
 */
export const cn = (...inputs) => {
  // Sanitización básica para prevenir inyección de clases maliciosas
  const sanitizedInputs = inputs.map(input => {
    if (typeof input === 'string') {
      // Remover caracteres potencialmente peligrosos
      return input.replace(/[<>'"]/g, '');
    }
    return input;
  });
  
  return twMerge(clsx(sanitizedInputs));
};

/**
 * safeClassName - Alternativa más restrictiva para clases CSS
 * @param {...string} inputs - Clases CSS a validar
 * @returns {string} Clases CSS validadas
 */
export const safeClassName = (...inputs) => {
  const allowedPattern = /^[a-zA-Z0-9-_:\s\[\]\.]+$/;
  
  const safeInputs = inputs.filter(input => {
    if (typeof input !== 'string') return false;
    return allowedPattern.test(input);
  });
  
  return cn(...safeInputs);
};