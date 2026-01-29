const { User } = require('../models');
const { validationResult } = require('express-validator');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');

// --- IMPLEMENTACIÓN DETALLADA ---
// Este archivo contiene los controladores para la gestión del perfil de usuario.
// 1. getProfile: Obtiene los datos del usuario autenticado
// 2. updateProfile: Actualiza los datos personales del usuario
// 3. uploadAvatar: Maneja la carga de imagen de perfil

/**
 * Controlador: Obtener perfil del usuario autenticado
 * Retorna los datos del usuario sin incluir la contraseña
 */
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] },
    });

    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

/**
 * Controlador: Actualizar perfil del usuario autenticado
 * Actualiza: fullName, email, phone, currency
 * Validación: email único (si se intenta cambiar)
 */
exports.updateProfile = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { fullName, email, phone, currency } = req.body;
  const userId = req.user.id;

  try {
    // Buscar usuario
    let user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    // Validar que el email no esté siendo usado por otro usuario
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        return res.status(400).json({ msg: 'Email already in use' });
      }
    }

    // Actualizar campos
    user.fullName = fullName || user.fullName;
    user.email = email || user.email;
    user.phone = phone || user.phone;
    user.currency = currency || user.currency;

    // Guardar cambios
    await user.save();

    // Retornar usuario actualizado (sin contraseña)
    const updatedUser = await User.findByPk(userId, {
      attributes: { exclude: ['password'] },
    });

    res.json({
      msg: 'Profile updated successfully',
      user: updatedUser,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

/**
 * Controlador: Cargar avatar del usuario
 * Guarda la imagen en /uploads/avatars/
 * Retorna la ruta relativa del archivo
 */
exports.uploadAvatar = async (req, res) => {
  try {
    // Validar que se subió un archivo
    if (!req.file) {
      return res.status(400).json({ msg: 'No file uploaded' });
    }

    // Validar tipo de archivo (solo imágenes)
    const allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedMimes.includes(req.file.mimetype)) {
      // Eliminar archivo rechazado
      fs.unlink(req.file.path, (err) => {
        if (err) console.error('Error deleting invalid file:', err);
      });
      return res.status(400).json({ msg: 'Only image files are allowed' });
    }

    // Validar tamaño del archivo (máx 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB en bytes
    if (req.file.size > maxSize) {
      fs.unlink(req.file.path, (err) => {
        if (err) console.error('Error deleting oversized file:', err);
      });
      return res.status(400).json({ msg: 'File size must be less than 5MB' });
    }

    // Construir ruta relativa del archivo
    const avatarPath = `/uploads/avatars/${req.file.filename}`;

    // Buscar usuario y actualizar avatar
    const user = await User.findByPk(req.user.id);
    if (!user) {
      fs.unlink(req.file.path, (err) => {
        if (err) console.error('Error deleting file:', err);
      });
      return res.status(404).json({ msg: 'User not found' });
    }

    // Si el usuario tenía un avatar anterior, eliminar la imagen anterior
    if (user.avatar) {
      const oldAvatarPath = path.join(__dirname, '../../', user.avatar);
      if (fs.existsSync(oldAvatarPath)) {
        fs.unlink(oldAvatarPath, (err) => {
          if (err) console.error('Error deleting old avatar:', err);
        });
      }
    }

    // Actualizar avatar en BD
    user.avatar = avatarPath;
    await user.save();

    res.json({
      msg: 'Avatar uploaded successfully',
      avatar: avatarPath,
    });
  } catch (err) {
    // Eliminar archivo en caso de error
    if (req.file) {
      fs.unlink(req.file.path, (err) => {
        if (err) console.error('Error deleting file:', err);
      });
    }
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

/**
 * Controlador: Obtener foto de perfil
 * Retorna la imagen del archivo
 */
exports.getAvatar = async (req, res) => {
  try {
    const { filename } = req.params;

    // Validar que el filename sea seguro (prevenir path traversal)
    if (filename.includes('..') || filename.includes('/')) {
      return res.status(400).json({ msg: 'Invalid filename' });
    }

    const filePath = path.join(__dirname, '../../uploads/avatars/', filename);

    // Validar que el archivo existe
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ msg: 'Avatar not found' });
    }

    // Enviar archivo
    res.sendFile(filePath);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

/**
 * Controlador: Cambiar contraseña del usuario
 * Valida: contraseña actual, nueva contraseña (complejidad), coincidencia
 */
exports.changePassword = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { currentPassword, newPassword } = req.body;
  const userId = req.user.id;

  try {
    // Buscar usuario (con password para validación)
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    // Validar que la contraseña actual sea correcta
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ msg: 'Contraseña actual incorrecta' });
    }

    // Validar que la nueva contraseña sea diferente
    const isSamePassword = await bcrypt.compare(newPassword, user.password);
    if (isSamePassword) {
      return res.status(400).json({ msg: 'La nueva contraseña debe ser diferente a la actual' });
    }

    // Encriptar nueva contraseña
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Actualizar contraseña
    user.password = hashedPassword;
    await user.save();

    res.json({
      msg: 'Contraseña actualizada correctamente',
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};
