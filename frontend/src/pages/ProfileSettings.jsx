import React, { useState, useContext, useEffect, useRef, useCallback } from 'react';
import CardTransition from '../pages/components/CardTransition';
import { Toaster, toast } from 'react-hot-toast';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { 
  User, Mail, Phone, DollarSign, Camera, Lock, 
  Save, Info, Upload, AlertCircle, CheckCircle, 
  Loader2, Eye, EyeOff, RefreshCw
} from 'lucide-react';

// --- COMPONENTES UI REUTILIZABLES ---

/**
 * Componente de Input Seguro y Accesible
 * Maneja estados de error, iconos y atributos ARIA automáticamente.
 */
const FormInput = ({ 
  label, 
  id, 
  error, 
  icon: Icon, 
  className = "", 
  ...props 
}) => (
  <div className="flex flex-col gap-2 w-full">
    <label 
      htmlFor={id} 
      className="text-xs font-bold text-gray-500 uppercase tracking-wide ml-1 flex items-center gap-1"
    >
      {label}
    </label>
    <div className="relative group">
      {Icon && (
        <Icon 
          className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors ${error ? 'text-red-400' : 'text-gray-400 group-focus-within:text-blue-500'}`} 
          aria-hidden="true"
        />
      )}
      <input
        id={id}
        className={`
          w-full rounded-xl border bg-gray-50/30 text-gray-700 font-medium placeholder-gray-400
          transition-all duration-200 focus:outline-none focus:ring-2 focus:bg-white
          disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed
          ${Icon ? 'pl-11 pr-4' : 'px-4'} py-3
          ${error 
            ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' 
            : 'border-gray-200 focus:border-blue-500 focus:ring-blue-500/20'
          }
          ${className}
        `}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : undefined}
        {...props}
      />
    </div>
    {error && (
      <div id={`${id}-error`} className="flex items-center gap-1 mt-1 animate-in slide-in-from-top-1 fade-in duration-200">
        <AlertCircle className="w-3 h-3 text-red-500" />
        <span className="text-xs font-medium text-red-500" role="alert">{error}</span>
      </div>
    )}
  </div>
);

/**
 * Contenedor de Tarjeta Estándar
 */
const SectionCard = ({ title, icon: Icon, children, className = "" }) => (
  <div className={`bg-white p-6 rounded-[20px] shadow-sm border border-gray-100 transition-all duration-300 hover:shadow-md ${className}`}>
    {title && (
      <div className="flex items-center gap-2 mb-6 border-b border-gray-100 pb-4">
        {Icon && <Icon className="w-5 h-5 text-blue-600" aria-hidden="true" />}
        <h3 className="font-bold text-slate-800 text-lg">{title}</h3>
      </div>
    )}
    {children}
  </div>
);

// --- COMPONENTE PRINCIPAL ---

const ProfileSettings = () => {
  const { user } = useContext(AuthContext);
  const fileInputRef = useRef(null);

  // Estados de UI
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [avatarUploading, setAvatarUploading] = useState(false);
  
  // Visibilidad de contraseñas
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

  // Datos del formulario
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    currency: 'USD',
    phone: '',
    avatar: '',
  });

  // Datos de contraseña
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Archivos
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  // Errores de validación
  const [errors, setErrors] = useState({});

  // Cargar datos iniciales
  useEffect(() => {
    let isMounted = true;
    const fetchUserData = async () => {
      try {
        const { data } = await api.get('/users/me');
        if (isMounted) {
          setFormData({
            fullName: data.fullName || '',
            email: data.email || '',
            currency: data.currency || 'USD',
            phone: data.phone || '',
            avatar: data.avatar || '',
          });
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
        toast.error('No se pudo cargar la información del perfil.');
      } finally {
        if (isMounted) setPageLoading(false);
      }
    };
    fetchUserData();
    return () => { isMounted = false; };
  }, []);

  // --- LOGICA DE VALIDACIÓN ---

  const validateProfile = () => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!formData.email || !emailRegex.test(formData.email)) {
      newErrors.email = 'Ingresa un correo electrónico válido.';
    }
    if (!formData.fullName || formData.fullName.trim().length < 3) {
      newErrors.fullName = 'El nombre debe tener al menos 3 caracteres.';
    }
    // Validación básica de teléfono (solo longitud y caracteres permitidos)
    if (formData.phone && !/^[+\d\s-]{10,}$/.test(formData.phone)) {
      newErrors.phone = 'Ingresa un número de teléfono válido (mín. 10 dígitos).';
    }

    setErrors(prev => ({ ...prev, ...newErrors }));
    return Object.keys(newErrors).length === 0;
  };

  const validatePassword = () => {
    const newErrors = {};
    const { currentPassword, newPassword, confirmPassword } = passwordData;
    
    // Regex: Mínimo 8 caracteres, 1 mayúscula, 1 minúscula, 1 número, 1 símbolo
    const complexityRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

    if (!currentPassword) newErrors.currentPassword = 'La contraseña actual es requerida.';
    
    if (!newPassword) {
      newErrors.newPassword = 'La nueva contraseña es requerida.';
    } else if (!complexityRegex.test(newPassword)) {
      newErrors.newPassword = 'Debe tener mín. 8 caracteres, mayúscula, número y símbolo.';
    }

    if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden.';
    }

    setErrors(prev => ({ ...prev, ...newErrors }));
    return Object.keys(newErrors).length === 0;
  };

  // --- HANDLERS ---

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Limpiar error al escribir
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
  }, [errors]);

  const handlePasswordInput = useCallback((e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
  }, [errors]);

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validación estricta de MIME type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Formato no seguro. Solo usa JPG, PNG o WebP.');
      return;
    }

    // Máximo 2MB para evitar DoS por archivos grandes
    if (file.size > 2 * 1024 * 1024) {
      toast.error('La imagen debe pesar menos de 2MB.');
      return;
    }

    setSelectedFile(file);
    
    // Limpieza de memoria para preview anterior
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
  };

  const handleUploadAvatar = async () => {
    if (!selectedFile) return;

    setAvatarUploading(true);
    const toastId = toast.loading('Procesando imagen...');
    const formDataUpload = new FormData();
    formDataUpload.append('avatar', selectedFile);

    try {
      const { data } = await api.post('/users/avatar', formDataUpload, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      
      setFormData(prev => ({ ...prev, avatar: data.avatar }));
      setSelectedFile(null);
      setPreviewUrl(null);
      toast.success('Avatar actualizado', { id: toastId });
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Error al subir la imagen', { id: toastId });
    } finally {
      setAvatarUploading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!validateProfile()) return;

    setLoading(true);
    const toastId = toast.loading('Guardando cambios...');

    try {
      // Solo enviamos los campos permitidos
      const payload = {
        fullName: formData.fullName.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        currency: formData.currency,
      };

      const { data } = await api.put('/users/me', payload);

      setFormData(prev => ({
        ...prev,
        fullName: data.user.fullName,
        email: data.user.email,
        phone: data.user.phone,
        currency: data.user.currency,
      }));

      toast.success('Perfil actualizado correctamente', { id: toastId });
    } catch (error) {
      console.error('Update error:', error);
      const msg = error.response?.data?.msg || 'Error al actualizar el perfil';
      toast.error(msg, { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (!validatePassword()) return;

    setLoading(true);
    const toastId = toast.loading('Actualizando seguridad...');

    try {
      await api.post('/users/change-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
        confirmPassword: passwordData.confirmPassword,
      });

      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      toast.success('Contraseña modificada exitosamente', { id: toastId });
    } catch (error) {
      console.error('Password error:', error);
      const msg = error.response?.data?.msg || 'No se pudo cambiar la contraseña. Verifica tus datos.';
      toast.error(msg, { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  // --- RENDER ---

  if (pageLoading) {
    return (
      <CardTransition>
        <div className="flex h-96 items-center justify-center" aria-live="polite">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
            <p className="text-gray-500 font-medium">Cargando perfil seguro...</p>
          </div>
        </div>
      </CardTransition>
    );
  }

  return (
    <>
      <Toaster position="top-right" toastOptions={{ className: 'font-medium text-sm' }} />
      
      <div className="w-full min-h-screen bg-gray-50/50 py-10 px-4">
        <div className="max-w-4xl mx-auto flex flex-col gap-6 pb-10">
        
          <header className="mb-2">
            <h2 className="text-2xl font-bold text-slate-900">Configuración de Perfil</h2>
            <p className="text-gray-500 text-sm">Gestiona tu información personal y preferencias de seguridad.</p>
          </header>

          {/* AVATAR SECTION */}
          <SectionCard className="flex flex-col items-center justify-center text-center py-10 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-b from-blue-50/50 to-transparent pointer-events-none" />
            
            <button 
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="relative group cursor-pointer rounded-full focus:outline-none focus:ring-4 focus:ring-blue-500/30 transition-all"
              aria-label="Cambiar foto de perfil"
            >
              <div className="w-32 h-32 rounded-full p-1 border-2 border-dashed border-blue-200 group-hover:border-blue-500 transition-colors bg-white">
                <img
                  src={previewUrl || formData.avatar || `https://ui-avatars.com/api/?name=${formData.fullName}&background=random`}
                  alt=""
                  className="w-full h-full rounded-full object-cover shadow-sm"
                  aria-hidden="true"
                />
              </div>
              <div className="absolute bottom-1 right-1 bg-blue-600 text-white p-2.5 rounded-full shadow-lg border-2 border-white transform transition-transform group-hover:scale-110 group-focus:scale-110">
                <Camera className="w-4 h-4" />
              </div>
            </button>

            <h3 className="mt-4 text-lg font-bold text-slate-800">
              {formData.fullName || user?.username || 'Usuario'}
            </h3>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleFileChange}
              className="hidden"
              disabled={avatarUploading}
              aria-hidden="true"
            />

            {selectedFile ? (
              <button
                onClick={handleUploadAvatar}
                disabled={avatarUploading}
                className="mt-4 text-sm font-semibold px-5 py-2 rounded-full bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center gap-2 shadow-md shadow-blue-200"
              >
                {avatarUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                {avatarUploading ? 'Subiendo...' : 'Confirmar Subida'}
              </button>
            ) : (
              <p className="mt-2 text-xs text-gray-400">
                Formatos permitidos: JPG, PNG, WebP (Máx. 2MB)
              </p>
            )}
          </SectionCard>

          {/* PERSONAL INFORMATION */}
          <SectionCard title="Información Personal" icon={User}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormInput
                id="fullName"
                name="fullName"
                label="Nombre Completo"
                value={formData.fullName}
                onChange={handleChange}
                error={errors.fullName}
                icon={User}
                placeholder="Ej. Juan Pérez"
                autoComplete="name"
              />

              <FormInput
                id="email"
                name="email"
                type="email"
                label="Correo Electrónico"
                value={formData.email}
                onChange={handleChange}
                error={errors.email}
                icon={Mail}
                placeholder="juan@ejemplo.com"
                autoComplete="email"
              />

              <FormInput
                id="phone"
                name="phone"
                type="tel"
                label="Teléfono"
                value={formData.phone}
                onChange={handleChange}
                error={errors.phone}
                icon={Phone}
                placeholder="+54 9 11 1234 5678"
                autoComplete="tel"
              />

              <div className="flex flex-col gap-2">
                <label htmlFor="currency" className="text-xs font-bold text-gray-500 uppercase tracking-wide ml-1 flex items-center gap-1">
                  Moneda Preferida
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                  <select
                    id="currency"
                    name="currency"
                    value={formData.currency}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-gray-200 bg-gray-50/30 text-gray-700 px-4 pl-11 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 appearance-none cursor-pointer font-medium"
                  >
                    <option value="USD">Dólar Estadounidense (USD)</option>
                    <option value="EUR">Euro (EUR)</option>
                    <option value="ARS">Peso Argentino (ARS)</option>
                    <option value="MXN">Peso Mexicano (MXN)</option>
                  </select>
                </div>
              </div>
            </div>
          </SectionCard>

          {/* PASSWORD CHANGE */}
          <SectionCard title="Seguridad de la Cuenta" icon={Lock}>
            <div className="grid grid-cols-1 gap-6">
              <div className="bg-orange-50 border border-orange-100 rounded-lg p-4 flex gap-3 text-orange-800 text-sm mb-2">
                <Info className="w-5 h-5 flex-shrink-0" />
                <p>
                  Usa una contraseña fuerte con al menos 8 caracteres, incluyendo mayúsculas, números y símbolos.
                </p>
              </div>

              <div className="relative">
                <FormInput
                  id="currentPassword"
                  name="currentPassword"
                  type={showPasswords.current ? "text" : "password"}
                  label="Contraseña Actual"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordInput}
                  error={errors.currentPassword}
                  icon={Lock}
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('current')}
                  className="absolute right-4 top-[38px] text-gray-400 hover:text-gray-600 focus:outline-none focus:text-blue-500"
                  aria-label={showPasswords.current ? "Ocultar contraseña" : "Mostrar contraseña"}
                >
                  {showPasswords.current ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="relative">
                  <FormInput
                    id="newPassword"
                    name="newPassword"
                    type={showPasswords.new ? "text" : "password"}
                    label="Nueva Contraseña"
                    value={passwordData.newPassword}
                    onChange={handlePasswordInput}
                    error={errors.newPassword}
                    icon={Lock}
                    placeholder="••••••••"
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility('new')}
                    className="absolute right-4 top-[38px] text-gray-400 hover:text-gray-600 focus:outline-none focus:text-blue-500"
                  >
                    {showPasswords.new ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>

                <div className="relative">
                  <FormInput
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showPasswords.confirm ? "text" : "password"}
                    label="Confirmar Contraseña"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordInput}
                    error={errors.confirmPassword}
                    icon={Lock}
                    placeholder="••••••••"
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility('confirm')}
                    className="absolute right-4 top-[38px] text-gray-400 hover:text-gray-600 focus:outline-none focus:text-blue-500"
                  >
                    {showPasswords.confirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div className="flex justify-end mt-2">
                <button
                  onClick={handleChangePassword}
                  disabled={loading || !passwordData.currentPassword}
                  className="px-6 py-2.5 rounded-xl bg-slate-800 text-white font-bold shadow-lg shadow-slate-200 hover:bg-slate-900 hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <RefreshCw className="w-5 h-5" />
                  )}
                  Actualizar Contraseña
                </button>
              </div>
            </div>
          </SectionCard>

          {/* ACCOUNT INFO (Read Only) */}
          <SectionCard title="Datos de la Cuenta" icon={Info}>
            <div className="space-y-3">
              {[
                { label: 'ID de Usuario', value: user?._id || 'N/A' },
                { label: 'Usuario', value: user?.username || 'N/A' },
                { label: 'Miembro desde', value: user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A' }
              ].map((item, index) => (
                <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-100">
                  <span className="text-sm font-medium text-gray-500">{item.label}</span>
                  <span className="text-sm font-bold text-gray-800 font-mono">{item.value}</span>
                </div>
              ))}
            </div>
          </SectionCard>

          {/* GLOBAL ACTIONS */}
          <div className="flex justify-end gap-4 pt-2 sticky bottom-4 z-10">
            <div className="bg-white/80 backdrop-blur-md p-2 rounded-2xl shadow-xl border border-gray-200 flex gap-3">
                <button
                className="px-6 py-3 rounded-xl text-gray-600 font-bold hover:bg-gray-100 transition-colors disabled:opacity-50"
                onClick={() => window.history.back()}
                disabled={loading}
                >
                Cancelar
                </button>
                <button
                onClick={handleSaveProfile}
                disabled={loading}
                className="px-8 py-3 rounded-xl bg-blue-600 text-white font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center gap-2 disabled:opacity-75 disabled:cursor-not-allowed"
                >
                {loading ? (
                    <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Guardando...
                    </>
                ) : (
                    <>
                    <Save className="w-5 h-5" />
                    Guardar Cambios
                    </>
                )}
                </button>
            </div>
          </div>

        </div>
      </div>
    </>
  );
};

export default ProfileSettings;