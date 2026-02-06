import React, { useState, useEffect, useRef } from 'react';
import { 
  Accessibility, 
  Type, 
  Sun, 
  Eye, 
  Volume2, 
  RotateCcw, 
  X, 
  Moon,
  Ruler 
} from 'lucide-react';

const AccessibilityWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  
  // Estados de Configuración
  const [fontSize, setFontSize] = useState(100);
  const [contrastMode, setContrastMode] = useState('normal');
  const [isReading, setIsReading] = useState(false);
  const [readingGuide, setReadingGuide] = useState(false);

  // Referencia para la guía de lectura
  const guideRef = useRef(null);
  
  // --- EFECTOS (Sin cambios en la lógica) ---
  useEffect(() => {
    const root = document.documentElement;
    root.style.fontSize = `${fontSize}%`;
    root.style.filter = 'none';
    switch (contrastMode) {
      case 'grayscale': root.style.filter = 'grayscale(100%)'; break;
      case 'invert': root.style.filter = 'invert(100%)'; break;
      case 'high-contrast': root.style.filter = 'contrast(150%)'; break;
      default: root.style.filter = 'none';
    }
  }, [fontSize, contrastMode]);

  useEffect(() => {
    if (!readingGuide) return;
    const handleMouseMove = (e) => {
      if (guideRef.current) guideRef.current.style.top = `${e.clientY}px`;
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [readingGuide]);

  useEffect(() => {
    const handleSpeech = () => {
      if (isReading) {
        window.speechSynthesis.cancel();
        const text = document.body.innerText;
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'es-ES';
        utterance.rate = 0.9;
        utterance.onend = () => setIsReading(false);
        window.speechSynthesis.speak(utterance);
      } else {
        window.speechSynthesis.cancel();
      }
    };
    handleSpeech();
    return () => window.speechSynthesis.cancel();
  }, [isReading]);

  // --- PERSISTENCIA Y RESET ---
  const handleReset = () => {
    setFontSize(100);
    setContrastMode('normal');
    setIsReading(false);
    setReadingGuide(false);
    localStorage.removeItem('a11y-settings');
  };

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('a11y-settings'));
    if (saved) {
      if (saved.fontSize) setFontSize(saved.fontSize);
      if (saved.contrastMode) setContrastMode(saved.contrastMode);
      if (saved.readingGuide) setReadingGuide(saved.readingGuide);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('a11y-settings', JSON.stringify({ fontSize, contrastMode, readingGuide }));
  }, [fontSize, contrastMode, readingGuide]);

  // --- RENDERIZADO CON NUEVOS COLORES ---
  return (
    <div className="font-sans">
      
      {/* 1. GUÍA DE LECTURA (Amarilla para resaltar) */}
      {readingGuide && (
        <div 
          ref={guideRef}
          className="fixed left-0 w-full h-12 bg-yellow-400/30 border-y-2 border-yellow-500/50 pointer-events-none z-[9990] -translate-y-1/2 mix-blend-multiply"
          style={{ top: '-100px' }}
        />
      )}

      {/* 2. PANEL DE CONTROL (Ahora Blanco y Azul) */}
      <div className="fixed bottom-5 right-5 z-[9999]">
        {isOpen && (
          <div 
            className="mb-4 bg-white rounded-2xl shadow-2xl border border-gray-200 p-5 w-80 animate-in slide-in-from-bottom-10 fade-in duration-300"
            role="dialog"
            aria-label="Herramientas de accesibilidad"
          >
            <div className="flex justify-between items-center mb-4 border-b border-gray-100 pb-2">
              <h3 className="font-bold text-lg text-slate-800">Accesibilidad</h3>
              <button 
                onClick={handleReset}
                className="text-xs text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1 font-medium transition-colors"
              >
                <RotateCcw size={12} /> Restablecer
              </button>
            </div>

            <div className="space-y-5">
              
              {/* Sección A: Texto */}
              <div className="space-y-2">
                <span className="text-sm font-semibold text-slate-600 flex items-center gap-2">
                  <Type size={16} className="text-blue-500" /> Tamaño de Texto
                </span>
                <div className="flex gap-2 bg-gray-50 p-1 rounded-lg border border-gray-200">
                  <button 
                    onClick={() => setFontSize(prev => Math.max(80, prev - 10))}
                    className="flex-1 py-1 bg-white hover:bg-gray-100 text-slate-700 rounded shadow-sm text-sm font-bold border border-gray-200 transition-all active:scale-95"
                  >A-</button>
                  <span className="px-3 text-sm font-mono font-semibold self-center w-16 text-center text-blue-700">{fontSize}%</span>
                  <button 
                    onClick={() => setFontSize(prev => Math.min(150, prev + 10))}
                    className="flex-1 py-1 bg-white hover:bg-gray-100 text-slate-700 rounded shadow-sm text-sm font-bold border border-gray-200 transition-all active:scale-95"
                  >A+</button>
                </div>
              </div>

              {/* Sección B: Ayudas de Lectura */}
              <div className="space-y-2">
                <span className="text-sm font-semibold text-slate-600 flex items-center gap-2">
                  <Eye size={16} className="text-blue-500" /> Ayudas de Lectura
                </span>
                <div className="grid grid-cols-2 gap-3">
                  <button 
                    onClick={() => setReadingGuide(!readingGuide)}
                    className={`flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-sm font-medium border shadow-sm transition-all active:scale-95
                      ${readingGuide 
                        ? 'bg-blue-600 text-white border-blue-600 hover:bg-blue-700' 
                        : 'bg-white text-slate-700 border-gray-200 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700'}`}
                  >
                    <Ruler size={18} />
                    Guía
                  </button>

                  <button 
                    onClick={() => setIsReading(!isReading)}
                    className={`flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-sm font-medium border shadow-sm transition-all active:scale-95
                      ${isReading 
                        ? 'bg-blue-600 text-white border-blue-600 hover:bg-blue-700' 
                        : 'bg-white text-slate-700 border-gray-200 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700'}`}
                  >
                    <Volume2 size={18} />
                    {isReading ? 'Detener' : 'Leer Sitio'}
                  </button>
                </div>
              </div>

              {/* Sección C: Modos de Pantalla */}
              <div className="space-y-2">
                <span className="text-sm font-semibold text-slate-600 flex items-center gap-2">
                  <Sun size={16} className="text-blue-500" /> Modos de Pantalla
                </span>
                <div className="grid grid-cols-3 gap-2">
                  <ButtonToggle 
                    active={contrastMode === 'grayscale'} 
                    onClick={() => setContrastMode(prev => prev === 'grayscale' ? 'normal' : 'grayscale')}
                    icon={Moon}
                    label="Grises"
                  />
                  <ButtonToggle 
                    active={contrastMode === 'high-contrast'} 
                    onClick={() => setContrastMode(prev => prev === 'high-contrast' ? 'normal' : 'high-contrast')}
                    icon={Sun}
                    label="Contraste"
                  />
                  <ButtonToggle 
                    active={contrastMode === 'invert'} 
                    onClick={() => setContrastMode(prev => prev === 'invert' ? 'normal' : 'invert')}
                    icon={Eye}
                    label="Invertir"
                  />
                </div>
              </div>

            </div>
          </div>
        )}

        {/* Botón Flotante Principal (FAB) - Siempre Azul */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`
            w-14 h-14 rounded-full shadow-xl flex items-center justify-center transition-all duration-300 
            hover:scale-110 hover:shadow-2xl focus:outline-none focus:ring-4 focus:ring-blue-300
            bg-blue-600 text-white hover:bg-blue-700
            ${isOpen ? 'rotate-90' : ''}
          `}
          aria-label={isOpen ? "Cerrar menú" : "Abrir accesibilidad"}
        >
          {isOpen ? <X size={28} /> : <Accessibility size={28} />}
        </button>
      </div>
    </div>
  );
};

// Subcomponente de botón pequeño (Actualizado con colores claros)
const ButtonToggle = ({ active, onClick, icon: Icon, label }) => (
  <button
    onClick={onClick}
    className={`
      flex flex-col items-center justify-center p-2 rounded-xl text-[11px] gap-1 transition-all border shadow-sm active:scale-95 font-medium
      ${active 
        ? 'bg-blue-600 text-white border-blue-600 hover:bg-blue-700' 
        : 'bg-white text-slate-600 border-gray-200 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700'}
    `}
  >
    <Icon size={20} className={active ? 'text-white' : 'text-slate-500 group-hover:text-blue-600'} />
    {label}
  </button>
);

export default AccessibilityWidget;