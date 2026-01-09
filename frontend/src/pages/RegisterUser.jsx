import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import CardTransition from './components/CardTransition';

// --- LISTA NEGRA DE CONTRASEÑAS (Top 50 más inseguras) ---
const WEAK_PASSWORDS = [
  "123456", "password", "123456789", "12345678", "12345", "111111", "1234567", "sunshine", 
  "qwerty", "iloveyou", "admin", "welcome", "google", "secret", "123123", "football", 
  "monkey", "dragon", "master", "1234567890", "senha", "charlie", "hunter", "princess", 
  "access", "cookie", "shadow", "computer", "freedom", "superman", "jordan", "michael", 
  "solo", "daniel", "starwars", "hello", "amoremio", "teamo", "pokemon", "naruto",
  "123321", "666666", "000000", "555555", "777777", "888888", "999999", "abcde", "test"
];

const RegisterUser = () => {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // --- VALIDACIONES DE SEGURIDAD ---
  const validateForm = () => {
    const { username, email, password, confirmPassword } = formData;
    const emailRegex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    // Requiere al menos una letra y un número
    const complexityRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{6,}$/;

    if (!username.trim()) {
      toast.error('El nombre de usuario es requerido.');
      return false;
    }
    
    if (!emailRegex.test(email)) {
      toast.error('Ingresa un correo electrónico válido.');
      return false;
    }

    if (password.length < 6) {
      toast.error('La contraseña debe tener al menos 6 caracteres.');
      return false;
    }

    if (WEAK_PASSWORDS.includes(password.toLowerCase())) {
      toast.error('Contraseña muy insegura. Por favor elige otra.');
      return false;
    }

    if (!complexityRegex.test(password)) {
      toast.error('La contraseña debe contener letras y números.');
      return false;
    }

    if (password !== confirmPassword) {
      toast.error('Las contraseñas no coinciden.');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      // Simulación de API (Sustituye esto con tu llamada real)
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast.success('¡Registro exitoso!');
      setTimeout(() => navigate('/login'), 2000);

    } catch (error) {
      toast.error('Error al registrar usuario.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-50 px-4 py-6 font-sans text-slate-900">
      <CardTransition>
      {/* Configuración de Notificaciones (Estilo Píldora Blanca) */}
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            borderRadius: '50px',
            background: '#ffffff',
            color: '#1e293b',
            boxShadow: '0 8px 20px -4px rgba(0, 0, 0, 0.15)',
            padding: '12px 24px',
            fontWeight: '500',
            border: '1px solid #f1f5f9'
          },
          success: { iconTheme: { primary: '#10B981', secondary: '#fff' } },
          error: { iconTheme: { primary: '#EF4444', secondary: '#fff' } },
        }}
      />

      {/* Tarjeta del Formulario */}
      <div className="w-full max-w-sm bg-white rounded-[2rem] shadow-xl shadow-slate-200/60 p-8 flex flex-col items-center border border-slate-100">
        
        {/* ICONO SUPERIOR (Person Add) */}
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 shadow-lg shadow-blue-600/30">
          <span className="material-symbols-outlined text-white text-[28px]" aria-hidden="true">
            person_add
          </span>
        </div>

        {/* ENCABEZADO */}
        <div className="mb-6 text-center w-full">
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 mb-2">
            Registro de Usuario
          </h1>
          <p className="text-sm text-gray-500 font-medium leading-relaxed px-2">
            Crea tu cuenta en GastanGO y organiza tus finanzas
          </p>
        </div>

        {/* FORMULARIO */}
        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4" noValidate>
          
          {/* Input: Usuario */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="username" className="text-[13px] font-semibold text-gray-700 ml-1">
              Nombre de Usuario
            </label>
            <input
              id="username"
              name="username"
              type="text"
              value={formData.username}
              onChange={handleChange}
              placeholder="Ej. usuario123"
              className="h-11 w-full rounded-full border border-gray-200 bg-slate-50 px-5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-600 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-600/10 transition-all duration-200"
            />
          </div>

          {/* Input: Email */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="email" className="text-[13px] font-semibold text-gray-700 ml-1">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="tu@email.com"
              className="h-11 w-full rounded-full border border-gray-200 bg-slate-50 px-5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-600 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-600/10 transition-all duration-200"
            />
          </div>

          {/* Input: Contraseña */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="password" className="text-[13px] font-semibold text-gray-700 ml-1">
              Contraseña
            </label>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={handleChange}
                placeholder="Crear contraseña"
                className="h-11 w-full rounded-full border border-gray-200 bg-slate-50 px-5 pr-12 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-600 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-600/10 transition-all duration-200 [&::-ms-reveal]:hidden [&::-ms-clear]:hidden"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-0 flex h-full items-center justify-center text-gray-400 hover:text-gray-600 focus:outline-none"
              >
                <span className="material-symbols-outlined text-xl select-none">
                  {showPassword ? 'visibility_off' : 'visibility'}
                </span>
              </button>
            </div>
          </div>

          {/* Input: Confirmar Contraseña */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="confirmPassword" className="text-[13px] font-semibold text-gray-700 ml-1">
              Confirmar Contraseña
            </label>
            <div className="relative">
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Repetir contraseña"
                className="h-11 w-full rounded-full border border-gray-200 bg-slate-50 px-5 pr-12 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-600 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-600/10 transition-all duration-200 [&::-ms-reveal]:hidden [&::-ms-clear]:hidden"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-4 top-0 flex h-full items-center justify-center text-gray-400 hover:text-gray-600 focus:outline-none"
              >
                <span className="material-symbols-outlined text-xl select-none">
                  {showConfirmPassword ? 'visibility_off' : 'visibility'}
                </span>
              </button>
            </div>
          </div>

          {/* Botón de Acción (Ajustado a h-10) */}
          <button
            type="submit"
            disabled={isLoading}
            className="mt-4 h-10 w-full rounded-full bg-blue-600 text-[14px] font-bold text-white shadow-lg shadow-blue-600/25 hover:bg-blue-700 hover:shadow-blue-600/40 focus:outline-none focus:ring-4 focus:ring-blue-500/30 disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-200 active:scale-[0.98]"
          >
            {isLoading ? 'Registrando...' : 'Registrarse'}
          </button>

        </form>

        {/* Footer Link (Usando Link de react-router-dom) */}
        <p className="mt-6 text-sm text-gray-500 text-center">
          ¿Ya tienes una cuenta?{' '}
          <Link to="/login" className="font-bold text-blue-800 hover:text-blue-900 hover:underline transition-colors">
            Inicia Sesión
          </Link>
        </p>

      </div>
      </CardTransition>
    </main>
  );
};

export default RegisterUser;