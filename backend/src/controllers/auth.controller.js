
const { User } = require('../models');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');

// --- IMPLEMENTACIÓN DETALLADA ---
// Este archivo es el controlador de autenticación. Contiene la lógica principal para:
// 1. Registrar nuevos usuarios, validando que no existan previamente y guardándolos en la BD.
// 2. Iniciar sesión, verificando credenciales y generando un JWT.
// 3. Obtener el perfil del usuario autenticado.

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
      (err, token) => {
        if (err) throw err;
        res.json({ token });
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
