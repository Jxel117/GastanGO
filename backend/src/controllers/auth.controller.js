const { User } = require('../models');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');

// 1. REGISTRO
const register = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  const { username, email, password } = req.body;

  if (!email.toLowerCase().endsWith('@gmail.com')) {
    return res.status(400).json({ success: false, message: 'Solo correos @gmail.com' });
  }

  try {
    const userExists = await User.findOne({ where: { email } });
    if (userExists) {
        return res.status(400).json({ success: false, message: 'El correo ya está registrado' });
    }

    const user = await User.create({ 
      username, 
      email, 
      password, 
      isVerified: true,
      avatar: null 
    });

    const payload = { user: { id: user.id } };
    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '30d' }, (err, token) => {
      if (err) throw err;
      res.json({ 
        success: true, 
        token, 
        user: { id: user.id, username, email, avatar: user.avatar } 
      });
    });

  } catch (err) {
    console.error("Error en registro:", err);
    res.status(500).json({ success: false, message: 'Error del servidor' });
  }
};

// 2. LOGIN CON LOGS DE DEPURACIÓN
const login = async (req, res) => {
  const { email, password } = req.body;
  
  console.log("➡️ [LOGIN] Intento de acceso para:", email);

  try {
    // 1. Buscar usuario
    console.log("🔍 [LOGIN] Buscando usuario en BD...");
    const user = await User.findOne({ where: { email } });
    
    if (!user) {
      console.log("❌ [LOGIN] Usuario no encontrado.");
      return res.status(400).json({ success: false, message: 'Credenciales inválidas (Email)' });
    }
    console.log("✅ [LOGIN] Usuario encontrado (ID):", user.id);

    // 2. Comparar contraseña
    console.log("🔐 [LOGIN] Comparando contraseñas...");
    // A veces esto tarda en servidores gratuitos
    const isMatch = await user.comparePassword(password);
    
    if (!isMatch) {
      console.log("❌ [LOGIN] Contraseña incorrecta.");
      return res.status(400).json({ success: false, message: 'Credenciales inválidas (Pass)' });
    }
    console.log("✅ [LOGIN] Contraseña correcta.");

    // 3. Generar Token
    console.log("🎫 [LOGIN] Generando Token...");
    const payload = { user: { id: user.id } };
    
    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '30d' }, (err, token) => {
      if (err) {
          console.error("❌ [LOGIN] Error firmando token:", err);
          throw err;
      }
      
      console.log("🚀 [LOGIN] Éxito! Enviando respuesta.");
      res.json({ 
        success: true, 
        token, 
        user: { 
            id: user.id, 
            username: user.username, 
            email: user.email, 
            avatar: user.avatar 
        } 
      });
    });

  } catch (err) {
    console.error("🔥 [LOGIN] ERROR CRÍTICO:", err);
    res.status(500).json({ success: false, message: 'Error del servidor' });
  }
};

// 3. PERFIL
const getProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, { attributes: { exclude: ['password'] } });
    if (!user) return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
    
    res.json({ success: true, ...user.toJSON() });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error del servidor' });
  }
};

// 4. ACTUALIZAR
const updateUser = async (req, res) => {
  const { username, avatar } = req.body;

  try {
    const user = await User.findByPk(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: 'Usuario no encontrado' });

    if (username) user.username = username;
    if (avatar) user.avatar = avatar;

    await user.save();

    res.json({ 
        success: true, 
        message: 'Actualizado', 
        user: { id: user.id, username: user.username, email: user.email, avatar: user.avatar } 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Error al actualizar' });
  }
};

// 5. VERIFICAR
const verifyEmail = async (req, res) => {
    res.json({ success: true, message: 'Verificado' });
};

// EXPORTACIÓN LIMPIA (CommonJS)
module.exports = {
    register,
    login,
    getProfile,
    updateUser,
    verifyEmail
};