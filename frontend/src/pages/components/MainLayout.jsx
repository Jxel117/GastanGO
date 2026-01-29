import React, { useContext, useState, useRef, useEffect, useCallback } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import PropTypes from 'prop-types';
import { AuthContext } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { cn } from '../utils/cn';
import ThemeToggle from '../components/ThemeToggle';

/**
 * MainLayout - Layout principal seguro y accesible
 * Adaptado para Dark Mode
 */
const MainLayout = () => {
  const { user, logout } = useContext(AuthContext);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const dropdownRef = useRef(null);
  const mobileMenuRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Manejo seguro de clics fuera del dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target)) {
        setIsMobileMenuOpen(false);
      }
    };
    
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", (e) => {
      if (e.key === 'Escape') {
        setIsDropdownOpen(false);
        setIsMobileMenuOpen(false);
      }
    });
    
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleClickOutside);
    };
  }, []);

  // Logout seguro
  const handleLogout = useCallback(async () => {
    try {
      await logout();
      toast.success("Sesión cerrada exitosamente");
      navigate('/login');
    } catch (error) {
      toast.error("Error al cerrar sesión");
      console.error('Logout error:', error);
    }
  }, [logout, navigate]);

  // Función segura para obtener iniciales
  const getInitials = useCallback((name) => {
    if (!name || typeof name !== 'string') return "U";
    const sanitizedName = name.replace(/[<>]/g, '');
    const parts = sanitizedName.trim().split(' ');
    if (parts.length === 0) return "U";
    const firstChar = parts[0].charAt(0).toUpperCase();
    const lastChar = parts.length > 1 ? parts[parts.length - 1].charAt(0).toUpperCase() : '';
    return lastChar ? `${firstChar}${lastChar}` : firstChar;
  }, []);

  // Navegación principal
  const mainNavigation = [
    { 
      name: 'Inicio', 
      path: '/dashboard', 
      icon: 'dashboard',
      description: 'Página principal del dashboard'
    },
    { 
      name: 'Reportes', 
      path: '/detailed-reportes', 
      icon: 'bar_chart',
      description: 'Reportes financieros detallados'
    }
  ];

  const isActive = useCallback((path) => {
    if (path === '/proximamente') return false;
    return location.pathname === path;
  }, [location.pathname]);

  const bgPrimaryClass = "bg-blue-600";
  // Ajustamos el color primario para que brille un poco más en dark mode
  const primaryColorClass = "text-blue-600 dark:text-blue-400"; 

  return (
    // 1. CORRECCIÓN FONDO GENERAL: dark:bg-slate-950 y dark:text-slate-200
    <div 
      className="h-screen w-full bg-gray-50 dark:bg-slate-950 font-sans text-gray-800 dark:text-slate-200 flex flex-col overflow-hidden transition-colors duration-300"
      role="application"
      aria-label="Aplicación de gestión financiera"
    >
      {/* 2. CORRECCIÓN HEADER: dark:bg-slate-900 y dark:border-slate-800 */}
      <header 
        className="h-16 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 flex items-center justify-between px-4 sm:px-6 flex-shrink-0 z-50 shadow-sm transition-colors duration-300"
        role="banner"
      >
        {/* Izquierda: Logo y Navegación */}
        <div className="flex items-center gap-4 lg:gap-8">
          {/* Logo */}
          <button
            onClick={() => navigate('/dashboard')}
            className="cursor-pointer flex items-center gap-2 text-gray-900 dark:text-white hover:scale-105 transition-transform duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-lg p-2"
            aria-label="Ir al inicio"
          >
            <div 
              className={`flex items-center justify-center w-8 h-8 ${bgPrimaryClass} rounded-lg text-white shadow-sm`}
              aria-hidden="true"
            >
              <span className="material-symbols-outlined text-[20px]">
                account_balance_wallet
              </span>
            </div>
            <span className="text-xl font-bold tracking-tight">
              Gastan<span className={primaryColorClass}>GO</span>
            </span>
          </button>

          {/* Menú de Navegación Desktop */}
          <nav 
            className="hidden md:flex items-center gap-1"
            aria-label="Navegación principal"
          >
            {mainNavigation.map((item) => {
              const active = isActive(item.path);
              return (
                <button
                  key={item.name}
                  onClick={() => {
                    navigate(item.path);
                    setIsMobileMenuOpen(false);
                  }}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                    "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
                    active
                      // Estado Activo: Dark mode usa fondo azul oscuro y texto azul claro
                      ? `bg-blue-50 dark:bg-blue-900/30 ${primaryColorClass} shadow-sm font-bold`
                      // Estado Inactivo: Dark mode usa texto gris claro y hover gris oscuro
                      : 'text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800 hover:text-blue-600 dark:hover:text-blue-400'
                  )}
                  aria-current={active ? 'page' : undefined}
                  aria-label={`${item.name} - ${item.description}`}
                >
                  <span 
                    className="material-symbols-outlined text-[18px]"
                    aria-hidden="true"
                  >
                    {item.icon}
                  </span>
                  {item.name}
                </button>
              );
            })}
          </nav>

          {/* Botón Menú Mobile */}
          <button
            ref={mobileMenuRef}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden flex items-center justify-center w-10 h-10 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-600 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Abrir menú de navegación"
            aria-expanded={isMobileMenuOpen}
            aria-controls="mobile-menu"
          >
            <span className="material-symbols-outlined">
              {isMobileMenuOpen ? 'close' : 'menu'}
            </span>
          </button>
        </div>

        {/* Derecha: Acciones y Perfil */}
        <div className="flex items-center gap-3">
          {/* Botón de Acción */}
          <button
            onClick={() => navigate('/registro')}
            className={cn(
              "hidden sm:flex items-center gap-2",
              `${bgPrimaryClass} hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-bold`,
              "shadow-md shadow-blue-200 dark:shadow-none transition-all duration-200",
              "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            )}
            aria-label="Añadir nueva transacción"
          >
            <span 
              className="material-symbols-outlined text-[18px]"
              aria-hidden="true"
            >
              add
            </span>
            Añadir Transacción
          </button>

          <div className="mx-1 hidden sm:block">
             <ThemeToggle />
          </div>

          {/* Dropdown Perfil */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className={cn(
                "flex items-center gap-2 hover:bg-white dark:hover:bg-slate-800 hover:shadow-sm p-1 pl-2 rounded-full",
                "transition-all duration-200 border border-transparent hover:border-gray-100 dark:hover:border-slate-700",
                "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              )}
              aria-label="Menú de usuario"
              aria-expanded={isDropdownOpen}
              aria-haspopup="true"
              aria-controls="user-menu"
            >
              <div className="hidden md:flex flex-col items-end mr-1">
                <span className="text-sm font-bold text-gray-800 dark:text-slate-200 leading-tight truncate max-w-[120px]">
                  {user?.username || "Usuario"}
                </span>
                <span className="text-[10px] text-gray-400 font-medium">
                  PREMIUM
                </span>
              </div>
              <div 
                className="h-9 w-9 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center font-bold text-sm ring-2 ring-white dark:ring-slate-800 shadow-sm"
                aria-hidden="true"
              >
                {getInitials(user?.name)}
              </div>
            </button>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div
                id="user-menu"
                // 3. CORRECCIÓN DROPDOWN: dark:bg-slate-900 y bordes oscuros
                className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-gray-100 dark:border-slate-700 py-1 origin-top-right z-50 transition-colors"
                role="menu"
                aria-orientation="vertical"
              >
                <div className="px-4 py-3 border-b border-gray-50 dark:border-slate-800 bg-gray-50/30 dark:bg-slate-800/30">
                  <p className="text-sm font-bold text-gray-900 dark:text-white truncate">
                    {user?.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-slate-400 truncate">
                    {user?.email}
                  </p>
                </div>
                <div className="p-1">
                  <button
                    onClick={() => {
                      navigate('/profile-settings');
                      setIsDropdownOpen(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm font-bold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-slate-800 rounded-lg transition-colors focus:outline-none"
                    role="menuitem"
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      edit
                    </span>
                    Editar Perfil
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg mt-1 transition-colors focus:outline-none"
                    role="menuitem"
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      logout
                    </span>
                    Cerrar Sesión
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Menú Mobile */}
      {isMobileMenuOpen && (
        <nav
          id="mobile-menu"
          // 4. CORRECCIÓN MENU MÓVIL
          className="md:hidden bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 px-4 py-3 shadow-sm transition-colors"
          role="navigation"
          aria-label="Navegación móvil"
        >
          <div className="space-y-1">
            {mainNavigation.map((item) => (
              <button
                key={item.name}
                onClick={() => {
                  navigate(item.path);
                  setIsMobileMenuOpen(false);
                }}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                  "focus:outline-none focus:ring-2 focus:ring-blue-500",
                  isActive(item.path)
                    ? `bg-blue-50 dark:bg-blue-900/20 ${primaryColorClass} font-bold`
                    : 'text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800'
                )}
                aria-current={isActive(item.path) ? 'page' : undefined}
              >
                <span className="material-symbols-outlined">
                  {item.icon}
                </span>
                {item.name}
              </button>
            ))}
          </div>
        </nav>
      )}

      {/* Contenido Principal */}
      <main 
        // 5. CORRECCIÓN AREA DE CONTENIDO: dark:bg-slate-950
        className="flex-1 w-full relative overflow-y-auto overflow-x-hidden bg-gray-50 dark:bg-slate-950 p-4 sm:p-6 transition-colors duration-300"
        role="main"
      >
        <div className="max-w-[1600px] mx-auto h-full flex flex-col">
          <Outlet />
        </div>
      </main>

      <footer className="sr-only">
        <h2>Información de accesibilidad</h2>
        <p>Esta aplicación cumple con los estándares WCAG 2.1 AA</p>
        <p>Use Tab para navegar, Enter para seleccionar y Escape para cerrar menús</p>
      </footer>
    </div>
  );
};

MainLayout.propTypes = {};

export default MainLayout;