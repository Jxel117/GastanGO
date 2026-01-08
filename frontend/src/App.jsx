import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { useContext } from 'react';
import { AnimatePresence } from 'framer-motion';

// Importar tus páginas
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import RegisterUser from './pages/RegisterUser';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);
  if (loading) return <div>Cargando...</div>;
  return user ? children : <Navigate to="/login" />;
};

// --- NUEVO COMPONENTE: Maneja las rutas y la animación ---
// Esto es necesario porque useLocation debe estar DENTRO del Router
const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<RegisterUser />} />
        
        <Route path="/dashboard" element={
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        } />
        
        <Route path="*" element={<Navigate to="/login" />} />
        
      </Routes>
    </AnimatePresence>
  );
};

// --- COMPONENTE PRINCIPAL ---
function App() {
  return (
    <AuthProvider>
      <Router>
        {/* Llamamos al componente hijo que SÍ puede usar useLocation */}
        <AnimatedRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;