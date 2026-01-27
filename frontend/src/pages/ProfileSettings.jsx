 import React, { useState, useContext, useEffect } from 'react';

import CardTransition from '../pages/components/CardTransition';

import { Toaster } from 'react-hot-toast';

import toast from 'react-hot-toast';

import api from '../services/api';

import { AuthContext } from '../context/AuthContext';


// --- LISTA NEGRA DE CONTRASEÑAS (Top 50 más inseguras) ---

const WEAK_PASSWORDS = [

  "123456", "password", "123456789", "12345678", "12345", "111111", "1234567", "sunshine",

  "qwerty", "iloveyou", "admin", "welcome", "google", "secret", "123123", "football",

  "monkey", "dragon", "master", "1234567890", "senha", "charlie", "hunter", "princess",

  "access", "cookie", "shadow", "computer", "freedom", "superman", "jordan", "michael",

  "solo", "daniel", "starwars", "hello", "amoremio", "teamo", "pokemon", "naruto",

  "123321", "666666", "000000", "555555", "777777", "888888", "999999", "abcde", "test"

];


// --- ESTILOS REUTILIZABLES (Design System) ---

const cardClassName = "bg-white p-6 rounded-[20px] shadow-sm border border-gray-100 transition-all duration-300 hover:shadow-md";

const inputGroupClass = "flex flex-col gap-2";

const labelClass = "text-xs font-bold text-gray-500 uppercase tracking-wide ml-1";

const inputClass = "w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-700 bg-gray-50/30 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 placeholder-gray-400 font-medium";


const ProfileSettings = () => {

  const { user } = useContext(AuthContext);

  const [loading, setLoading] = useState(false);

  const [pageLoading, setPageLoading] = useState(true);

  const [avatarUploading, setAvatarUploading] = useState(false);

  const [passwordChanging, setPasswordChanging] = useState(false);

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);

  const [showNewPassword, setShowNewPassword] = useState(false);

  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

 

  const [formData, setFormData] = useState({

    fullName: '',

    email: '',

    currency: 'USD',

    phone: '',

    avatar: '',

  });


  const [passwordData, setPasswordData] = useState({

    currentPassword: '',

    newPassword: '',

    confirmPassword: '',

  });


  const [selectedFile, setSelectedFile] = useState(null);

  const [previewUrl, setPreviewUrl] = useState(null);


  // Cargar datos del usuario autenticado

  useEffect(() => {

    const fetchUserData = async () => {

      try {

        const { data } = await api.get('/users/me');

        setFormData({

          fullName: data.fullName || '',

          email: data.email || '',

          currency: data.currency || 'USD',

          phone: data.phone || '',

          avatar: data.avatar || '',

        });

      } catch (error) {

        console.error('Error cargando datos del usuario:', error);

        toast.error('Error al cargar los datos del perfil');

      } finally {

        setPageLoading(false);

      }

    };

   

    fetchUserData();

  }, []);


  // --- VALIDACIONES DE SEGURIDAD (igual que RegisterUser) ---

  const validateProfileForm = () => {

    const { fullName, email, phone, currency } = formData;

    const emailRegex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

   

    if (!email || !emailRegex.test(email)) {

      toast.error('Ingresa un correo electrónico válido.');

      return false;

    }


    if (fullName && fullName.trim().length < 3) {

      toast.error('El nombre debe tener al menos 3 caracteres.');

      return false;

    }


    if (phone && phone.trim().length < 10) {

      toast.error('El teléfono debe tener al menos 10 caracteres.');

      return false;

    }


    if (!['USD', 'EUR', 'ARS', 'MXN'].includes(currency)) {

      toast.error('Selecciona una moneda válida.');

      return false;

    }


    return true;

  };


  const validatePasswordForm = () => {

    const { currentPassword, newPassword, confirmPassword } = passwordData;

    const complexityRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{6,}$/;


    if (!currentPassword || !newPassword || !confirmPassword) {

      toast.error('Todos los campos de contraseña son requeridos.');

      return false;

    }


    if (newPassword.length < 6) {

      toast.error('La nueva contraseña debe tener al menos 6 caracteres.');

      return false;

    }


    if (WEAK_PASSWORDS.includes(newPassword.toLowerCase())) {

      toast.error('Contraseña muy insegura. Por favor elige otra.');

      return false;

    }


    if (!complexityRegex.test(newPassword)) {

      toast.error('La contraseña debe contener letras y números.');

      return false;

    }


    if (newPassword !== confirmPassword) {

      toast.error('Las contraseñas nuevas no coinciden.');

      return false;

    }


    return true;

  };


  // Manejador de cambios en inputs

  const handleChange = (e) => {

    const { name, value } = e.target;

    setFormData(prev => ({ ...prev, [name]: value }));

  };


  const handlePasswordChange = (e) => {

    const { name, value } = e.target;

    setPasswordData(prev => ({ ...prev, [name]: value }));

  };


  // Manejador para seleccionar archivo

  const handleFileChange = (e) => {

    const file = e.target.files[0];

    if (!file) return;


    // Validar tipo de archivo

    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

    if (!allowedTypes.includes(file.type)) {

      toast.error('Solo se permiten archivos de imagen (JPEG, PNG, GIF, WebP)');

      return;

    }


    // Validar tamaño (máx 5MB)

    if (file.size > 5 * 1024 * 1024) {

      toast.error('El archivo no debe exceder 5MB');

      return;

    }


    setSelectedFile(file);

   

    // Mostrar vista previa

    const reader = new FileReader();

    reader.onload = (e) => {

      setPreviewUrl(e.target.result);

    };

    reader.readAsDataURL(file);

  };


  // Cargar avatar al servidor

  const handleUploadAvatar = async () => {

    if (!selectedFile) {

      toast.error('Selecciona una imagen primero');

      return;

    }


    setAvatarUploading(true);

    const toastId = toast.loading('Subiendo imagen...');

    const formDataUpload = new FormData();

    formDataUpload.append('avatar', selectedFile);


    try {

      const { data } = await api.post('/users/avatar', formDataUpload, {

        headers: {

          'Content-Type': 'multipart/form-data',

        },

      });

     

      setFormData(prev => ({ ...prev, avatar: data.avatar }));

      setSelectedFile(null);

      setPreviewUrl(null);

      toast.success('Avatar actualizado correctamente', { id: toastId });

    } catch (error) {

      console.error('Error subiendo avatar:', error);

      toast.error(error.response?.data?.msg || 'Error al subir la imagen', { id: toastId });

    } finally {

      setAvatarUploading(false);

    }

  };


  // Guardar cambios de perfil

  const handleSave = async () => {

    if (!validateProfileForm()) return;


    setLoading(true);

    const toastId = toast.loading('Guardando cambios...');


    try {

      const { data } = await api.put('/users/me', {

        fullName: formData.fullName,

        email: formData.email,

        phone: formData.phone,

        currency: formData.currency,

      });


      setFormData({

        fullName: data.user.fullName || '',

        email: data.user.email || '',

        currency: data.user.currency || 'USD',

        phone: data.user.phone || '',

        avatar: data.user.avatar || formData.avatar,

      });


      toast.success('Perfil actualizado correctamente', { id: toastId });

    } catch (error) {

      console.error('Error actualizando perfil:', error);

      const errorMsg = error.response?.data?.msg ||

                       error.response?.data?.errors?.[0]?.msg ||

                       'Error al actualizar el perfil';

      toast.error(errorMsg, { id: toastId });

    } finally {

      setLoading(false);

    }

  };


  // Cambiar contraseña

  const handleChangePassword = async () => {

    if (!validatePasswordForm()) return;


    setPasswordChanging(true);

    const toastId = toast.loading('Cambiando contraseña...');


    try {

      await api.post('/users/change-password', {

        currentPassword: passwordData.currentPassword,

        newPassword: passwordData.newPassword,

        confirmPassword: passwordData.confirmPassword,

      });


      // Limpiar campos

      setPasswordData({

        currentPassword: '',

        newPassword: '',

        confirmPassword: '',

      });


      toast.success('Contraseña actualizada correctamente', { id: toastId });

    } catch (error) {

      console.error('Error cambiando contraseña:', error);

      const errorMsg = error.response?.data?.msg ||

                       error.response?.data?.errors?.[0]?.msg ||

                       'Error al cambiar la contraseña';

      toast.error(errorMsg, { id: toastId });

    } finally {

      setPasswordChanging(false);

    }

  };


  // Input file reference

  const fileInputRef = React.useRef(null);


  if (pageLoading) {

    return (

      <CardTransition>

        <div className="flex h-96 items-center justify-center">

          <div className="flex flex-col items-center gap-4">

            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>

            <p className="text-gray-500 font-medium">Cargando datos del perfil...</p>

          </div>

        </div>

      </CardTransition>

    );

  }


  return (

    <>

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

          loading: { iconTheme: { primary: '#3B82F6', secondary: '#fff' } },

        }}

      />

     

      <div className="w-full min-h-screen bg-gray-50/50 py-10 px-4">

        <div className="max-w-4xl mx-auto flex flex-col gap-6 pb-10">

       

        {/* --- TÍTULO DE LA SECCIÓN --- */}

        <div>

           <h2 className="text-2xl font-bold text-[#111318]">Configuración de Perfil</h2>

           <p className="text-gray-500 text-sm">Gestiona tu información personal y preferencias de seguridad.</p>

        </div>


        {/* --- TARJETA 1: FOTO DE PERFIL --- */}

        <div className={`${cardClassName} flex flex-col items-center justify-center text-center py-10 relative overflow-hidden`}>

            {/* Decoración de fondo */}

            <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-b from-blue-50/50 to-transparent"></div>

           

            <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>

                <div className="w-32 h-32 rounded-full p-1 border-2 border-dashed border-blue-200 group-hover:border-blue-500 transition-colors">

                    <img

                        src={previewUrl || formData.avatar || `https://i.pravatar.cc/150?u=${user?.email}`}

                        alt="Profile"

                        className="w-full h-full rounded-full object-cover shadow-sm"

                    />

                </div>

                {/* Botón flotante de cámara */}

                <div className="absolute bottom-1 right-1 bg-blue-600 text-white p-2 rounded-full shadow-lg border-2 border-white transform transition-transform group-hover:scale-110">

                    <span className="material-symbols-outlined text-[18px] block">photo_camera</span>

                </div>

            </div>


            <h3 className="mt-4 text-lg font-bold text-slate-800">{formData.fullName || user?.username || 'Usuario'}</h3>

           

            {/* Input file oculto */}

            <input

                ref={fileInputRef}

                type="file"

                accept="image/*"

                onChange={handleFileChange}

                className="hidden"

                disabled={avatarUploading}

            />


            {selectedFile && (

              <button

                  onClick={handleUploadAvatar}

                  disabled={avatarUploading}

                  className="mt-3 text-sm font-semibold px-4 py-2 rounded-full bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"

              >

                {avatarUploading ? (

                  <>

                    <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>

                    Subiendo...

                  </>

                ) : (

                  <>

                    <span className="material-symbols-outlined text-[16px]">upload</span>

                    Subir Imagen

                  </>

                )}

              </button>

            )}


            {!selectedFile && (

              <button

                  onClick={() => fileInputRef.current?.click()}

                  className="mt-2 text-sm text-blue-600 font-semibold hover:bg-blue-50 px-4 py-1.5 rounded-full transition-colors"

              >

                Cambiar Foto

              </button>

            )}

        </div>


        {/* --- TARJETA 2: INFORMACIÓN PERSONAL --- */}

        <div className={cardClassName}>

            <div className="flex items-center gap-2 mb-6 border-b border-gray-100 pb-4">

                <span className="material-symbols-outlined text-blue-600">person</span>

                <h3 className="font-bold text-slate-800 text-lg">Información Personal</h3>

            </div>

           

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* Nombre Completo */}

                <div className={inputGroupClass}>

                    <label className={labelClass}>Nombre Completo</label>

                    <input

                        type="text"

                        name="fullName"

                        value={formData.fullName}

                        onChange={handleChange}

                        placeholder="Tu nombre completo"

                        className={inputClass}

                    />

                </div>


                {/* Email */}

                <div className={inputGroupClass}>

                    <label className={labelClass}>Correo Electrónico</label>

                    <input

                        type="email"

                        name="email"

                        value={formData.email}

                        onChange={handleChange}

                        placeholder="tu@email.com"

                        className={inputClass}

                    />

                </div>


                {/* Teléfono */}

                <div className={inputGroupClass}>

                    <label className={labelClass}>Teléfono</label>

                    <input

                        type="tel"

                        name="phone"

                        value={formData.phone}

                        onChange={handleChange}

                        placeholder="+54 9 11 1234 5678"

                        className={inputClass}

                    />

                </div>


                {/* Moneda */}

                <div className={inputGroupClass}>

                    <label className={labelClass}>Moneda Preferida</label>

                    <div className="relative">

                        <select

                            name="currency"

                            value={formData.currency}

                            onChange={handleChange}

                            className={`${inputClass} appearance-none cursor-pointer`}

                        >

                            <option value="USD">Dólar Estadounidense (USD)</option>

                            <option value="EUR">Euro (EUR)</option>

                            <option value="ARS">Peso Argentino (ARS)</option>

                            <option value="MXN">Peso Mexicano (MXN)</option>

                        </select>

                        <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none text-sm">expand_more</span>

                    </div>

                </div>

            </div>

        </div>


        {/* --- TARJETA 3: CAMBIAR CONTRASEÑA --- */}

        <div className={cardClassName}>

            <div className="flex items-center gap-2 mb-6 border-b border-gray-100 pb-4">

                <span className="material-symbols-outlined text-blue-600">lock</span>

                <h3 className="font-bold text-slate-800 text-lg">Cambiar Contraseña</h3>

            </div>


            <div className="grid grid-cols-1 gap-6">

                {/* Contraseña Actual */}

                <div className={inputGroupClass}>

                    <label className={labelClass}>Contraseña Actual</label>

                    <div className="relative">

                        <input

                            type={showCurrentPassword ? "text" : "password"}

                            name="currentPassword"

                            value={passwordData.currentPassword}

                            onChange={handlePasswordChange}

                            placeholder="Ingresa tu contraseña actual"

                            className={inputClass}

                        />

                        <button

                            type="button"

                            onClick={() => setShowCurrentPassword(!showCurrentPassword)}

                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"

                        >

                            <span className="material-symbols-outlined text-xl select-none">

                                {showCurrentPassword ? 'visibility_off' : 'visibility'}

                            </span>

                        </button>

                    </div>

                </div>


                {/* Nueva Contraseña */}

                <div className={inputGroupClass}>

                    <label className={labelClass}>Nueva Contraseña</label>

                    <div className="relative">

                        <input

                            type={showNewPassword ? "text" : "password"}

                            name="newPassword"

                            value={passwordData.newPassword}

                            onChange={handlePasswordChange}

                            placeholder="Crear nueva contraseña"

                            className={inputClass}

                        />

                        <button

                            type="button"

                            onClick={() => setShowNewPassword(!showNewPassword)}

                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"

                        >

                            <span className="material-symbols-outlined text-xl select-none">

                                {showNewPassword ? 'visibility_off' : 'visibility'}

                            </span>

                        </button>

                    </div>

                </div>


                {/* Confirmar Nueva Contraseña */}

                <div className={inputGroupClass}>

                    <label className={labelClass}>Confirmar Nueva Contraseña</label>

                    <div className="relative">

                        <input

                            type={showConfirmPassword ? "text" : "password"}

                            name="confirmPassword"

                            value={passwordData.confirmPassword}

                            onChange={handlePasswordChange}

                            placeholder="Repetir nueva contraseña"

                            className={inputClass}

                        />

                        <button

                            type="button"

                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}

                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"

                        >

                            <span className="material-symbols-outlined text-xl select-none">

                                {showConfirmPassword ? 'visibility_off' : 'visibility'}

                            </span>

                        </button>

                    </div>

                </div>


                <button

                    onClick={handleChangePassword}

                    disabled={passwordChanging || loading || avatarUploading}

                    className={`

                        px-6 py-3 rounded-xl bg-orange-600 text-white font-bold shadow-lg shadow-orange-200

                        hover:bg-orange-700 hover:shadow-xl hover:-translate-y-0.5 transition-all

                        flex items-center justify-center gap-2

                        ${(passwordChanging || loading || avatarUploading) ? 'opacity-75 cursor-not-allowed' : ''}

                    `}

                >

                    {passwordChanging ? (

                        <>

                            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>

                            Cambiando...

                        </>

                    ) : (

                        <>

                            <span className="material-symbols-outlined text-[20px]">check_circle</span>

                            Cambiar Contraseña

                        </>

                    )}

                </button>

            </div>

        </div>


        {/* --- TARJETA 4: INFORMACIÓN ADICIONAL --- */}

        <div className={cardClassName}>

            <div className="flex items-center gap-2 mb-4 border-b border-gray-100 pb-4">

                <span className="material-symbols-outlined text-blue-600">info</span>

                <h3 className="font-bold text-slate-800 text-lg">Información de Cuenta</h3>

            </div>


            <div className="space-y-3">

                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">

                    <span className="text-sm font-medium text-gray-600">Usuario:</span>

                    <span className="text-sm font-bold text-gray-800">{user?.username || 'N/A'}</span>

                </div>

                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">

                    <span className="text-sm font-medium text-gray-600">Miembro desde:</span>

                    <span className="text-sm font-bold text-gray-800">{new Date(user?.createdAt).toLocaleDateString('es-AR')}</span>

                </div>

                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">

                    <span className="text-sm font-medium text-gray-600">Última actualización:</span>

                    <span className="text-sm font-bold text-gray-800">{new Date(user?.updatedAt).toLocaleDateString('es-AR')}</span>

                </div>

            </div>

        </div>


        {/* --- BOTONES DE ACCIÓN --- */}

        <div className="flex justify-end gap-4 pt-2">

            <button

                className="px-6 py-3 rounded-xl text-gray-500 font-bold hover:bg-gray-100 transition-colors disabled:opacity-50"

                onClick={() => window.history.back()}

                disabled={loading || avatarUploading || passwordChanging}

            >

                Cancelar

            </button>

            <button

                onClick={handleSave}

                disabled={loading || avatarUploading || passwordChanging}

                className={`

                    px-8 py-3 rounded-xl bg-blue-600 text-white font-bold shadow-lg shadow-blue-200

                    hover:bg-blue-700 hover:shadow-xl hover:-translate-y-0.5 transition-all

                    flex items-center gap-2

                    ${(loading || avatarUploading || passwordChanging) ? 'opacity-75 cursor-not-allowed' : ''}

                `}

            >

                {loading ? (

                    <>

                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>

                        Guardando...

                    </>

                ) : (

                    <>

                        <span className="material-symbols-outlined text-[20px]">save</span>

                        Guardar Cambios

                    </>

                )}

            </button>

        </div>


      </div>

      </div>

    </>

  );

};


export default ProfileSettings; 