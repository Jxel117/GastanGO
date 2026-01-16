import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { TransactionProvider } from './context/TransactionContext';
import { useContext } from 'react';
import { AnimatePresence } from 'framer-motion';

// --- IMPORTS DE PÁGINAS ---
import Login from './pages/Login';
import RegisterUser from './pages/RegisterUser';
import Dashboard from './pages/Dashboard';
import MainLayout from './pages/components/MainLayout';

// Imports del Wizard de Transacciones
import SeleccionCategoria from './pages/SeleccionCategoria';
import IngresoMonto from './pages/IngresoMonto';
import RegistroTransaccion from './pages/RegistroTransaccion';

// --- AQUÍ IMPORTAMOS TU CARPETA UTILS ---
// Gracias al archivo index.js que creamos, podemos importar así de limpio:
import { ConstructionView } from './pages/utils'; 

const PrivateRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);
  if (loading) return <div className="min-h-screen flex items-center justify-center">Cargando...</div>;
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
             
             <Route path="/dashboard" element={
                <PrivateRoute>
                   <Dashboard />
                </PrivateRoute>
             } />

             {/* --- RUTA DE "PRÓXIMAMENTE" --- */}
             {/* Aquí usamos tu componente de utils */}
             <Route path="/proximamente" element={
                <PrivateRoute>
                    <ConstructionView 
                        title="¡Próximamente!" 
                        message="Estamos construyendo esta funcionalidad para ti." 
                    />
                </PrivateRoute>
             } />

             {/* FLUJO DE REGISTRO (WIZARD) */}
             <Route path="/registro/*" element={
                <PrivateRoute>
                    <Routes>
                        <Route path="/" element={<RegistroTransaccion />} />
                        <Route path="/categorias" element={<SeleccionCategoria />} />
                        <Route path="/monto" element={<IngresoMonto />} />
                    </Routes>
                </PrivateRoute>
             } />

        </Route>
        
        {/* Redirección por defecto */}
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