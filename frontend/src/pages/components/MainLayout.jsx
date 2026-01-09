import { useContext, useState, useRef, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom'; // Outlet es clave aquí
import { AuthContext } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const MainLayout = () => {
  const { user, logout } = useContext(AuthContext);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

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

  return (
    // Quitamos CardTransition de aquí para que el menú NO parpadee al navegar
    <div className="min-h-screen w-full bg-[#f6f6f8] font-sans text-[#111318] relative">
      
      {/* --- 1. SIDEBAR FIJO --- */}
      <aside className="fixed top-0 left-0 hidden md:flex flex-col w-64 bg-white border-r border-gray-200 h-screen z-30">
        <div className="h-16 flex items-center px-6 border-b border-gray-100 bg-white flex-shrink-0">
          <a onClick={() => navigate('/dashboard')} className="cursor-pointer flex items-center gap-2 text-[#111318]">
            <div className="flex items-center justify-center w-8 h-8 bg-blue-600 rounded-lg text-white">
              <span className="material-symbols-outlined text-[20px]">account_balance_wallet</span>
            </div>
            <span className="text-xl font-extrabold tracking-tight">
              Gastan<span className="text-blue-600">GO</span>
            </span>
          </a>
        </div>

        <nav className="p-4 space-y-2 overflow-y-auto flex-1 custom-scrollbar">
          <a onClick={() => navigate('/dashboard')} className="cursor-pointer flex items-center gap-3 px-4 py-3 text-sm font-medium text-blue-700 bg-blue-50 rounded-xl transition-colors">
            <span className="material-symbols-outlined text-[20px]">dashboard</span> Inicio
          </a>
          <a href="#" className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-600 hover:text-blue-600 hover:bg-gray-50 rounded-xl transition-colors">
            <span className="material-symbols-outlined text-[20px]">bar_chart</span> Reportes
          </a>
          <a href="#" className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-600 hover:text-blue-600 hover:bg-gray-50 rounded-xl transition-colors">
            <span className="material-symbols-outlined text-[20px]">receipt_long</span> Transacciones
          </a>
          <a href="#" className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-600 hover:text-blue-600 hover:bg-gray-50 rounded-xl transition-colors">
                    <span className="material-symbols-outlined text-[20px]">account_balance_wallet</span>
                    Cuentas
                </a>
                <a href="#" className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-600 hover:text-blue-600 hover:bg-gray-50 rounded-xl transition-colors">
                    <span className="material-symbols-outlined text-[20px]">category</span>
                    Categorías
                </a>
        </nav>

        <div className="p-4 border-t border-gray-100 bg-white flex-shrink-0">
          <a href="#" className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-600 hover:text-blue-600 hover:bg-gray-50 rounded-xl transition-colors">
            <span className="material-symbols-outlined text-[20px]">settings</span> Configuración
          </a>
        </div>
      </aside>

      {/* --- 2. CONTENIDO PRINCIPAL --- */}
      <div className="md:ml-64 min-h-screen flex flex-col">
        
        {/* HEADER */}
        <header className="sticky top-0 w-full bg-[#f6f6f8]/90 backdrop-blur-md px-6 h-16 flex items-center justify-between md:justify-end border-b border-gray-200/50 z-20">
            <div className="md:hidden flex items-center gap-2">
                <span className="material-symbols-outlined text-blue-600">account_balance_wallet</span>
                <span className="font-bold text-gray-900">GastanGO</span>
            </div>
           <div className="relative" ref={dropdownRef}>
                    <button 
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        className="flex items-center gap-3 hover:bg-white hover:shadow-sm p-1.5 rounded-full transition-all duration-200 focus:outline-none border border-transparent hover:border-gray-200"
                    >
                        <div className="hidden md:flex flex-col items-end mr-1">
                            <span className="text-sm font-bold text-gray-800">{user?.username || "Usuario"}</span>
                            <span className="text-[10px] text-gray-500 font-medium uppercase tracking-wide">Premium</span>
                        </div>
                        <div className="h-9 w-9 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-md ring-2 ring-white">
                            {getInitials(user?.name)}
                        </div>
                        <span className={`material-symbols-outlined text-gray-400 text-xl transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`}>
                            expand_more
                        </span>
                    </button>

                    {isDropdownOpen && (
                        <div className="absolute right-0 mt-2 w-60 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 origin-top-right animate-in fade-in slide-in-from-top-2 z-50">
                             <div className="px-4 py-3 border-b border-gray-50 mb-1 bg-gray-50/50">
                                <p className="text-sm font-bold text-gray-900 truncate">{user?.name}</p>
                                <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                            </div>
                            <div className="p-1">
                                <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm font-bold text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors">
                                    <span className="material-symbols-outlined text-[18px]">logout</span> Cerrar Sesión
                                </button>
                            </div>
                        </div>
                    )}
                </div>
        </header>

        {/* AQUÍ SE RENDERIZAN LOS HIJOS (DASHBOARD O REGISTRO) */}
        <main className="p-6 lg:p-8 w-full max-w-7xl mx-auto space-y-8 pb-32">
            <Outlet />
        </main>
      </div>

      {/* --- 3. BOTÓN FLOTANTE (FAB) --- */}
      {/* Lo dejamos en el Layout para que esté disponible siempre */}
      <button 
        onClick={() => navigate('/registro')} 
        className="fixed bottom-8 right-8 z-50 group flex items-center justify-center h-14 w-14 rounded-full bg-blue-600 text-white shadow-[0_8px_30px_rgb(37,99,235,0.3)] hover:bg-blue-700 hover:scale-110 active:scale-95 transition-all duration-300 ease-out"
        title="Nueva Transacción"
      >
        <span className="material-symbols-outlined text-3xl group-hover:rotate-90 transition-transform duration-300">add</span>
      </button>

    </div>
  );
};

export default MainLayout;