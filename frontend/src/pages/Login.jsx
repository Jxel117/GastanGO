import { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
// 1. IMPORTANTE: Agregamos 'Link' aquí
import { useNavigate, Link } from "react-router-dom";
// Libreria para notificaciones
import toast, { Toaster } from "react-hot-toast";
// Componente de transición
import CardTransition from "./components/CardTransition";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const validateEmail = (email) => {
    return String(email)
      .toLowerCase()
      .match(
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateEmail(email)) {
      toast.error("Por favor ingresa un correo válido.");
      return;
    }
    if (!password) {
      toast.error("La contraseña es requerida.");
      return;
    }

    setIsLoading(true);

    try {
      await login(email, password);
      toast.success("¡Bienvenido a GastanGO!");
      navigate("/dashboard");
    } catch (err) {
      toast.error("Credenciales incorrectas.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-50 px-4 py-6 font-sans text-slate-900">
      <CardTransition>
      <Toaster
        position="top-right"
        reverseOrder={false}
        toastOptions={{
          style: {
            borderRadius: "50px",
            background: "#ffffff",
            color: "#1e293b",
            boxShadow: "0 8px 20px -4px rgba(0, 0, 0, 0.15)",
            padding: "12px 24px",
            fontWeight: "500",
            border: "1px solid #f1f5f9",
          },
          success: {
            iconTheme: {
              primary: "#10B981",
              secondary: "#fff",
            },
          },
          error: {
            iconTheme: {
              primary: "#EF4444",
              secondary: "#fff",
            },
          },
        }}
      />

      <div className="w-full max-w-sm bg-white rounded-3xl shadow-xl shadow-slate-200/50 p-6 sm:p-8 flex flex-col items-center">
        <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 shadow-lg shadow-blue-600/30">
          <span
            className="material-symbols-outlined text-white text-2xl"
            aria-hidden="true"
          >
            trending_up
          </span>
        </div>

        <div className="mb-6 text-center w-full">
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 mb-1">
            Iniciar Sesión
          </h1>
          <p className="text-sm text-gray-500 font-medium">
            Bienvenido de nuevo a GastanGO
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="w-full flex flex-col gap-4"
          noValidate
        >
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="email"
              className="text-sm font-semibold text-gray-700 ml-1"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
              className="h-11 w-full rounded-full border border-gray-200 bg-slate-50 px-5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-600 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-600/10 transition-all duration-200"
              autoComplete="email"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="password"
              className="text-sm font-semibold text-gray-700 ml-1"
            >
              Contraseña
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Contraseña"
                className="h-11 w-full rounded-full border border-gray-200 bg-slate-50 px-5 pr-12 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-600 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-600/10 transition-all duration-200 [&::-ms-reveal]:hidden [&::-ms-clear]:hidden"
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-0 flex h-full items-center justify-center text-gray-400 hover:text-gray-600 focus:outline-none"
              >
                <span className="material-symbols-outlined text-xl select-none">
                  {showPassword ? "visibility_off" : "visibility"}
                </span>
              </button>
            </div>
          </div>

          <div className="flex justify-end mt-[-4px]">
            <a
              href="#"
              className="text-xs font-medium text-blue-600 hover:text-blue-800 hover:underline transition-colors"
            >
              Olvidé mi contraseña
            </a>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="mt-2 h-11 w-full rounded-full bg-blue-600 text-sm font-bold text-white shadow-lg shadow-blue-600/20 hover:bg-blue-700 hover:shadow-blue-600/30 focus:outline-none focus:ring-4 focus:ring-blue-500/30 disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-200 active:scale-[0.98]"
          >
            {isLoading ? "Cargando..." : "Iniciar Sesión"}
          </button>
        </form>

        <p className="mt-6 text-sm text-gray-500 text-center">
          ¿No tienes una cuenta?{" "}
          {/* 2. AQUÍ EL CAMBIO: Usamos Link en lugar de <a> */}
          <Link
            to="/register"
            className="font-bold text-blue-600 hover:underline transition-colors"
          >
            Regístrate
          </Link>
        </p>
      </div>
      </CardTransition>
    </main>
  );
};

export default Login;