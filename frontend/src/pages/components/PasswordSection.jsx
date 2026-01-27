// --- CONSTANTES DE SEGURIDAD ---
const WEAK_PASSWORDS = [
  "123456", "password", "123456789", "12345678", "12345", "111111", "1234567", "sunshine",
  "qwerty", "iloveyou", "admin", "welcome", "google", "secret", "123123", "football",
  "monkey", "dragon", "master", "1234567890", "senha", "charlie", "hunter", "princess"
  // ... puedes agregar más
];

// --- SUB-COMPONENTE: PASSWORD INPUT (Maneja su propia visibilidad) ---
const PasswordInput = ({ label, name, value, onChange, placeholder }) => {
  const [show, setShow] = useState(false);

  return (
    <div className="flex flex-col gap-2">
      <label className="text-xs font-bold text-gray-500 uppercase tracking-wide ml-1">{label}</label>
      <div className="relative">
        <input
          type={show ? "text" : "password"}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-700 bg-gray-50/30 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all font-medium"
        />
        <button
          type="button"
          onClick={() => setShow(!show)}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors focus:outline-none"
        >
          <span className="material-symbols-outlined text-xl select-none">
            {show ? 'visibility_off' : 'visibility'}
          </span>
        </button>
      </div>
    </div>
  );
};

// --- COMPONENTE PRINCIPAL DE PASSWORD ---
const PasswordSection = () => {
  const [loading, setLoading] = useState(false);
  const [passData, setPassData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const handleChange = (e) => {
    setPassData({ ...passData, [e.target.name]: e.target.value });
  };

  const validate = () => {
    const { currentPassword, newPassword, confirmPassword } = passData;
    const complexityRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{6,}$/;

    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error('Todos los campos son obligatorios');
      return false;
    }
    if (newPassword.length < 6) {
      toast.error('La contraseña debe tener al menos 6 caracteres');
      return false;
    }
    if (WEAK_PASSWORDS.includes(newPassword.toLowerCase())) {
      toast.error('Contraseña muy común. Elige una más segura.');
      return false;
    }
    if (!complexityRegex.test(newPassword)) {
      toast.error('La contraseña debe incluir letras y números');
      return false;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Las nuevas contraseñas no coinciden');
      return false;
    }
    return true;
  };

  const handleChangePassword = async () => {
    if (!validate()) return;

    setLoading(true);
    const toastId = toast.loading('Actualizando seguridad...');

    try {
      await api.post('/users/change-password', {
        currentPassword: passData.currentPassword,
        newPassword: passData.newPassword,
        confirmPassword: passData.confirmPassword,
      });

      // Limpiar formulario al tener éxito (Mejor UX)
      setPassData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      toast.success('Contraseña actualizada correctamente', { id: toastId });
      
    } catch (error) {
      console.error(error);
      const msg = error.response?.data?.msg || 'Error al cambiar la contraseña';
      toast.error(msg, { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-8 rounded-[20px] shadow-sm border border-gray-100 mt-6">
      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
        <div className="p-2 bg-orange-50 rounded-lg text-orange-600">
          <span className="material-symbols-outlined">lock_reset</span>
        </div>
        <div>
          <h3 className="font-bold text-slate-800 text-lg">Seguridad</h3>
          <p className="text-xs text-gray-400">Protege tu cuenta con una contraseña fuerte</p>
        </div>
      </div>

      <div className="space-y-5">
        <PasswordInput
          label="Contraseña Actual"
          name="currentPassword"
          value={passData.currentPassword}
          onChange={handleChange}
          placeholder="••••••••••••"
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <PasswordInput
            label="Nueva Contraseña"
            name="newPassword"
            value={passData.newPassword}
            onChange={handleChange}
            placeholder="Mínimo 6 caracteres"
          />
          <PasswordInput
            label="Confirmar Contraseña"
            name="confirmPassword"
            value={passData.confirmPassword}
            onChange={handleChange}
            placeholder="Repite la nueva contraseña"
          />
        </div>

        <div className="flex justify-end pt-2">
          <button
            onClick={handleChangePassword}
            disabled={loading}
            className={`
              px-6 py-3 rounded-xl bg-orange-600 text-white font-bold shadow-lg shadow-orange-200 
              hover:bg-orange-700 hover:shadow-xl hover:-translate-y-0.5 transition-all
              flex items-center gap-2
              ${loading ? 'opacity-75 cursor-not-allowed' : ''}
            `}
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Procesando...
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[20px]">key</span>
                Actualizar Contraseña
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PasswordSection;