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
  const isActive = (path) => location.pathname === path;

  // COLOR PRINCIPAL NUEVO: Blue-600 (#2563EB) en lugar de Blue-800
  const primaryColorClass = "text-[#2563EB]";
  const bgPrimaryClass = "bg-[#2563EB]";

  return (
    // Fondo gris claro profesional para toda la app
    <div className="h-screen w-full bg-[#F6F8FB] font-sans text-slate-800 flex flex-col overflow-hidden">
      
      {/* --- HEADER GLOBAL --- */}
      <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 flex-shrink-0 z-50 shadow-sm">
        
        {/* IZQUIERDA: Logo + Navegación */}
        <div className="flex items-center gap-8 lg:gap-12">
          {/* Logo */}
          <a onClick={() => navigate('/dashboard')} className="cursor-pointer flex items-center gap-2 text-slate-900 hover:opacity-80 transition-opacity">
            <div className={`flex items-center justify-center w-8 h-8 ${bgPrimaryClass} rounded-lg text-white`}>
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
              { name: 'Reportes', path: '/reportes', icon: 'bar_chart' },
              { name: 'Transacciones', path: '/transacciones', icon: 'receipt_long' },
              { name: 'Cuentas', path: '/cuentas', icon: 'account_balance_wallet' },
              { name: 'Categorías', path: '/categorias', icon: 'category' }
            ].map((item) => (
              <button
                key={item.name}
                onClick={() => navigate(item.path)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 
                  ${isActive(item.path) 
                    ? `bg-blue-50 ${primaryColorClass}` 
                    : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'}`
                }
              >
                {/* Iconos opcionales en desktop para limpiar ruido visual, los dejo por usabilidad */}
                <span className="material-symbols-outlined text-[18px]">{item.icon}</span>
                {item.name}
              </button>
            ))}
          </nav>
        </div>

        {/* DERECHA: Botón de Acción + Perfil */}
        <div className="flex items-center gap-4">
            
            {/* --- NUEVO BOTÓN AÑADIR (GLOBAL) --- */}
            <button 
                onClick={() => navigate('/registro')}
                className={`hidden sm:flex items-center gap-2 ${bgPrimaryClass} hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold shadow-sm transition-all active:scale-95`}
            >
                <span className="material-symbols-outlined text-[18px]">add</span>
                Añadir Transacción
            </button>
            
            {/* Botón flotante SOLO para móvil (opcional, si quieres quitarlo del todo borra este bloque) */}
            <button 
                onClick={() => navigate('/registro')}
                className={`sm:hidden flex items-center justify-center w-9 h-9 ${bgPrimaryClass} text-white rounded-full shadow-md`}
            >
                <span className="material-symbols-outlined text-[20px]">add</span>
            </button>


            {/* Dropdown Perfil */}
            <div className="relative" ref={dropdownRef}>
                <button 
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="flex items-center gap-2 hover:bg-gray-50 p-1 pl-2 rounded-full transition-all border border-transparent hover:border-gray-200"
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
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-1 origin-top-right z-50 animate-in fade-in slide-in-from-top-2">
                        <div className="px-4 py-3 border-b border-gray-50 bg-gray-50/30">
                            <p className="text-sm font-bold text-gray-900 truncate">{user?.name}</p>
                            <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                        </div>
                        <div className="p-1">
                            <button className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg text-left">
                                <span className="material-symbols-outlined text-[18px]">settings</span> Configuración
                            </button>
                            <button onClick={handleLogout} className="w-full flex items-center gap-2 px-3 py-2 text-sm font-bold text-red-600 hover:bg-red-50 rounded-lg mt-1">
                                <span className="material-symbols-outlined text-[18px]">logout</span> Cerrar Sesión
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
      </header>

      {/* --- CONTENIDO PRINCIPAL --- */}
      <main className="flex-1 w-full relative overflow-y-auto overflow-x-hidden bg-[#F6F8FB] p-6">
        <div className="max-w-[1600px] mx-auto h-full flex flex-col">
           <Outlet />
        </div>
      </main>

    </div>
  );
};

export default MainLayout;