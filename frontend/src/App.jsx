import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { useContext } from 'react';
import { AnimatePresence } from 'framer-motion';

// Imports
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import RegisterUser from './pages/RegisterUser';
// import RegistroTransaccion from './pages/RegistroTransaccion'; // Ya no se necesita importar aquí si solo se usa dentro de la sub-ruta, pero déjalo si quieres.
import MainLayout from './pages/components/MainLayout';

// Imports del Wizard
import SeleccionCategoria from './pages/SeleccionCategoria';
import IngresoMonto from './pages/IngresoMonto';
import RegistroTransaccion from './pages/RegistroTransaccion'; // Importado para el wizard
import { TransactionProvider } from './context/TransactionContext';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);
  if (loading) return <div>Cargando...</div>;
  return user ? children : <Navigate to="/login" />;
};

const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        
        {/* Rutas Públicas */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<RegisterUser />} />
        
        {/* Rutas Privadas CON Layout */}
        <Route element={<MainLayout />}>
             
             {/* Dashboard */}
             <Route path="/dashboard" element={
                <PrivateRoute>
                   <Dashboard />
                </PrivateRoute>
             } />

             {/* HE ELIMINADO LA RUTA VIEJA "/registro-transaccion"
                Para evitar conflictos con la nueva estructura.
             */}

             {/* FLUJO DE REGISTRO (WIZARD) */}
             <Route path="/registro/*" element={
                // 1. AÑADIDO: PrivateRoute para proteger todo el flujo
                <PrivateRoute>
                    <Routes>
                        {/* Ruta base: /registro/  -> Selección de Tipo */}
                        <Route path="/" element={<RegistroTransaccion />} />
                        
                        {/* Paso 2: /registro/categorias */}
                        <Route path="/categorias" element={<SeleccionCategoria />} />
                        
                        {/* Paso 3: /registro/monto */}
                        <Route path="/monto" element={<IngresoMonto />} />
                    </Routes>
                </PrivateRoute>
             } />

        </Route>
        
        <Route path="*" element={<Navigate to="/login" />} />
        
      </Routes>
    </AnimatePresence>
  );
};

function App() {
  return (
    <AuthProvider>
      <TransactionProvider>
        <Router>
          <AnimatedRoutes />
        </Router>
      </TransactionProvider>
    </AuthProvider>
  );
}

export default App;