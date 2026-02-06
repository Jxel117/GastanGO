import React, { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react'; // Asegúrate de tener lucide-react o usa Material Symbols si prefieres

const ThemeToggle = () => {
  const [theme, setTheme] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') || 
        (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    }
    return 'light';
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [theme]);

  return (
    <button
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className={`
        relative inline-flex h-9 w-16 items-center rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900
        ${theme === 'dark' ? 'bg-slate-700' : 'bg-blue-100'}
      `}
      aria-label="Alternar modo oscuro"
    >
      <span className="sr-only">Alternar tema</span>
      {/* Icono Sol (Fondo) */}
      <span className="absolute left-2 text-amber-500">
        <Sun size={14} />
      </span>
      {/* Icono Luna (Fondo) */}
      <span className="absolute right-2 text-blue-300">
        <Moon size={14} />
      </span>
      
      {/* Círculo que se mueve */}
      <span
        className={`
          ${theme === 'dark' ? 'translate-x-8 bg-slate-800' : 'translate-x-1 bg-white'}
          inline-block h-7 w-7 transform rounded-full shadow-md transition-transform duration-300 flex items-center justify-center
        `}
      >
         {theme === 'dark' ? (
           <Moon size={14} className="text-slate-200" />
         ) : (
           <Sun size={14} className="text-amber-500" />
         )}
      </span>
    </button>
  );
};

export default ThemeToggle;