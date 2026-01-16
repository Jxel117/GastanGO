import { useNavigate } from 'react-router-dom';
// Ajusta la ruta si tu CardTransition está en otro lado, según tu estructura anterior parecía estar en ../components
import CardTransition from '../components/CardTransition'; 
import defaultImage from './grafic_estamos_construyendo.jpg'; // Asegúrate que la imagen esté en esta misma carpeta

const ConstructionView = ({ 
  title = "Página en Construcción", 
  message = "Estamos trabajando duro para traerte esta funcionalidad pronto. ¡Vuelve más tarde!", 
  imageSrc = defaultImage,
  buttonText = "Volver atrás"
}) => {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-center p-4 md:p-8 h-full min-h-[80vh]">
      <CardTransition>
        {/* CONTENEDOR PRINCIPAL TIPO GRID 
           - En móvil (grid-cols-1): La imagen queda arriba (order-1) y el texto abajo (order-2).
           - En escritorio (md:grid-cols-2): El texto izquierda (order-1) y la imagen derecha (order-2).
        */}
        <div className="max-w-6xl w-full bg-white rounded-[32px] shadow-2xl shadow-slate-200/70 overflow-hidden border border-slate-100 grid grid-cols-1 md:grid-cols-5 min-h-[500px]">
          
          {/* --- COLUMNA IZQUIERDA: TEXTO Y BOTÓN (Ocupa 2/5 partes en desktop) --- */}
          <div className="p-8 md:p-12 flex flex-col justify-center items-start text-left order-2 md:order-1 md:col-span-2 bg-white relative z-10">
             
             {/* Badge decorativo */}
             <span className="mb-6 inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider">
                <span className="material-symbols-outlined text-sm animate-spin-slow">settings</span>
                En desarrollo
             </span>

            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4 leading-tight">
              {title}
            </h2>
            
            <p className="text-slate-600 text-lg leading-relaxed mb-10 font-medium">
              {message}
            </p>

            {/* Botón alineado a la izquierda */}
            <button
              onClick={() => navigate(-1)}
              className="group py-3.5 px-8 rounded-2xl bg-slate-900 text-white font-bold text-sm shadow-lg shadow-slate-900/20 hover:bg-blue-600 hover:shadow-blue-600/30 transform active:scale-95 transition-all duration-300 flex items-center justify-center gap-3"
            >
              <span className="material-symbols-outlined text-xl group-hover:-translate-x-1 transition-transform">arrow_back</span>
              {buttonText}
            </button>
          </div>

          {/* --- COLUMNA DERECHA: IMAGEN GRANDE (Ocupa 3/5 partes en desktop) --- */}
          <div className="relative h-64 md:h-auto w-full bg-slate-100 order-1 md:order-2 md:col-span-3 overflow-hidden">
            {imageSrc ? (
              // La imagen usa 'object-cover' y 'h-full w-full' para llenar todo el espacio disponible
              <img 
                src={imageSrc} 
                alt="Ilustración de construcción" 
                className="w-full h-full object-cover object-center hover:scale-110 transition-transform duration-[1.5s] ease-in-out"
              />
            ) : (
              // Fallback por si falla la imagen
              <div className="w-full h-full flex items-center justify-center bg-slate-200 text-slate-400">
                <span className="material-symbols-outlined text-8xl opacity-50">
                  image_not_supported
                </span>
              </div>
            )}
            {/* Overlay degradado sutil para mejorar contraste si la imagen es muy clara */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/10 via-transparent to-transparent pointer-events-none"></div>
          </div>

        </div>
      </CardTransition>
    </div>
  );
};

export default ConstructionView;