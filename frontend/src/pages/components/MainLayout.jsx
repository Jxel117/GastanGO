import { useContext, useState, useRef, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const MainLayout = () => {
  const { user, logout } = useContext(AuthContext);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    toast.success("Has cerrado sesión");
  };

  const getInitials = (name) => name ? name.charAt(0).toUpperCase() : "U";
  
  // --- CORRECCIÓN AQUÍ ---
  // Función para determinar si el botón está activo.
  // Si la ruta del botón es la genérica '/proximamente', devolvemos false 
  // para evitar que se marquen múltiples botones a la vez.
  const isActive = (path) => {
    if (path === '/proximamente') return false;
    return location.pathname === path;
  };

  const primaryColorClass = "text-[#2563EB]";
  const bgPrimaryClass = "bg-[#2563EB]";

  return (
    <div className="h-screen w-full bg-[#F6F8FB] font-sans text-slate-800 flex flex-col overflow-hidden">
      
      {/* --- HEADER GLOBAL --- */}
      <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 flex-shrink-0 z-50 shadow-sm">
        
        {/* IZQUIERDA: Logo + Navegación */}
        <div className="flex items-center gap-8 lg:gap-12">
          {/* Logo */}
          <a onClick={() => navigate('/dashboard')} className="cursor-pointer flex items-center gap-2 text-slate-900 hover:scale-105 transition-transform duration-200">
            <div className={`flex items-center justify-center w-8 h-8 ${bgPrimaryClass} rounded-lg text-white shadow-sm`}>
              <span className="material-symbols-outlined text-[20px]">account_balance_wallet</span>
            </div>
            <span className="text-xl font-bold tracking-tight">
              Gastan<span className={primaryColorClass}>GO</span>
            </span>
          </a>

          {/* Menú de Navegación */}
          <nav className="hidden md:flex items-center gap-1">
            {[
              { name: 'Inicio', path: '/dashboard', icon: 'dashboard' },
              // Botones que llevan a la vista de construcción
              { name: 'Reportes', path: '/proximamente', icon: 'bar_chart' },
              { name: 'Transacciones', path: '/proximamente', icon: 'receipt_long' },
              { name: 'Cuentas', path: '/proximamente', icon: 'account_balance_wallet' },
              { name: 'Categorías', path: '/proximamente', icon: 'category' }
            ].map((item) => {
              const active = isActive(item.path);
              return (
                <button
                  key={item.name}
                  onClick={() => navigate(item.path)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 active:scale-95 hover:scale-105
                    ${active 
                      ? `bg-blue-50 ${primaryColorClass} shadow-sm font-bold` // Estilo ACTIVO
                      : 'text-gray-500 hover:bg-gray-100 hover:text-blue-600'}` // Estilo INACTIVO
                  }
                >
                  <span className="material-symbols-outlined text-[18px]">{item.icon}</span>
                  {item.name}
                </button>
              );
            })}
          </nav>
        </div>

        {/* DERECHA: Botón de Acción + Perfil (Sin cambios aquí) */}
        <div className="flex items-center gap-4">
            <button 
                onClick={() => navigate('/registro')}
                className={`hidden sm:flex items-center gap-2 ${bgPrimaryClass} hover:bg-blue-700 text-white px-5 py-2 rounded-lg text-sm font-bold shadow-md shadow-blue-200 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:scale-105 active:scale-95`}
            >
                <span className="material-symbols-outlined text-[18px]">add</span>
                Añadir Transacción
            </button>
            <button 
                onClick={() => navigate('/registro')}
                className={`sm:hidden flex items-center justify-center w-9 h-9 ${bgPrimaryClass} text-white rounded-full shadow-md hover:scale-110 transition-transform`}
            >
                <span className="material-symbols-outlined text-[20px]">add</span>
            </button>

            {/* Dropdown Perfil */}
            <div className="relative" ref={dropdownRef}>
                <button 
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="flex items-center gap-2 hover:bg-white hover:shadow-sm p-1 pl-2 rounded-full transition-all duration-200 border border-transparent hover:border-gray-100 hover:scale-105"
                >
                    <div className="hidden md:flex flex-col items-end mr-1">
                        <span className="text-sm font-bold text-gray-800 leading-tight">{user?.username || "Usuario"}</span>
                        <span className="text-[10px] text-gray-400 font-medium">PREMIUM</span>
                    </div>
                    <div className="h-9 w-9 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center font-bold text-sm ring-2 ring-white shadow-sm">
                        {getInitials(user?.name)}
                    </div>
                </button>
                {isDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 py-1 origin-top-right z-50 animate-in fade-in slide-in-from-top-2">
                         <div className="px-4 py-3 border-b border-gray-50 bg-gray-50/30">
                            <p className="text-sm font-bold text-gray-900 truncate">{user?.name}</p>
                            <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                        </div>
                        <div className="p-1">
                             <button onClick={handleLogout} className="w-full flex items-center gap-2 px-3 py-2 text-sm font-bold text-red-600 hover:bg-red-50 rounded-lg mt-1 transition-colors">
                                <span className="material-symbols-outlined text-[18px]">logout</span> Cerrar Sesión
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
      </header>

      <main className="flex-1 w-full relative overflow-y-auto overflow-x-hidden bg-[#F6F8FB] p-6">
        <div className="max-w-[1600px] mx-auto h-full flex flex-col">
           <Outlet />
        </div>
      </main>
    </div>
  );
};

export default MainLayout;