
const { User, Token } = require('../models');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');

// --- IMPLEMENTACIÓN DETALLADA ---
// Este archivo es el controlador de autenticación. Contiene la lógica principal para:
// 1. Registrar nuevos usuarios, validando que no existan previamente y guardándolos en la BD.
// 2. Iniciar sesión, verificando credenciales y generando un JWT.
// 3. Obtener el perfil del usuario autenticado.
// 4. Hacer logout revocando el token en la base de datos.

// Controlador para registrar un nuevo usuario
exports.register = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { username, email, password } = req.body;

  try {
    // Verificar si el usuario ya existe
    let user = await User.findOne({ where: { email } });
    if (user) {
      return res.status(400).json({ msg: 'User already exists' });
    }

    // Crear el nuevo usuario (el hash de la contraseña se hace en el hook del modelo)
    user = await User.create({ username, email, password });

    res.status(201).json({ msg: 'User registered successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Controlador para iniciar sesión
exports.login = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;

  try {
    // Buscar al usuario por email
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    // Comparar la contraseña (usando el método del modelo)
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    // Crear y firmar el JWT
    const payload = {
      user: {
        id: user.id,
      },
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN },
      async (err, token) => {
        if (err) throw err;

        try {
          // Calcular fecha de expiración del token
          const decoded = jwt.decode(token);
          const expiresAt = new Date(decoded.exp * 1000);

          // Guardar el token en la base de datos
          await Token.create({
            userId: user.id,
            token: token,
            isActive: true,
            expiresAt: expiresAt,
          });

          res.json({ token });
        } catch (dbErr) {
          console.error('Error saving token to database:', dbErr.message);
          res.status(500).send('Server error');
        }
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Controlador para obtener el perfil del usuario
exports.getProfile = async (req, res) => {
  try {
    // El middleware `verifyToken` ya ha buscado al usuario y lo ha añadido a `req.user`
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] }, // Excluir la contraseña del resultado
    });
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Controlador para hacer logout (revocar token)
exports.logout = async (req, res) => {
  try {
    // Obtener el token del header Authorization
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(400).json({ msg: 'No token provided' });
    }

    const token = authHeader.replace('Bearer ', '');

    // Buscar el token en la BD
    const tokenRecord = await Token.findOne({ where: { token } });
    if (!tokenRecord) {
      return res.status(404).json({ msg: 'Token not found' });
    }

    // Marcar el token como inactivo (revocado)
    await tokenRecord.update({
      isActive: false,
      revokedAt: new Date(),
    });

    res.json({ msg: 'Logout successful' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};
