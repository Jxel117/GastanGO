// src/routes/auth.routes.js
const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const authController = require('../controllers/auth.controller');
const { verifyToken, checkRoles } = require('../middlewares/auth.middleware'); // Importamos checkRoles

// Ruta de Registro: POST /api/auth/register
router.post('/register', [
    // OWASP: Validación de Entrada (Ajustada a tus requisitos)
    body('email', 'Por favor, introduce un email valido')
        .isEmail()
        .custom(value => {
            if (!value.endsWith('@gmail.com')) {
                throw new Error('El dominio del correo debe ser @gmail.com');
            }
            return true;
        }),
    body('password', 'La contraseña debe tener minimo 6 caracteres, una mayuscula y un numero')
        .isLength({ min: 6 })
        .matches(/^(?=.*[A-Z])(?=.*\d)/),
    body('username')
        .notEmpty().withMessage('El nombre de usuario no puede estar vacio')
        .isLength({ min: 3, max: 15 }).withMessage('El nombre de usuario debe tener entre 3 y 15 caracteres')
        .trim()
        .escape(),
], authController.register);

// Ruta de Login: POST /api/auth/login
router.post('/login', [
    body('email', 'Por favor, introduce un email valido').isEmail(),
    body('password', 'La contrasenia no puede estar vacia').not().isEmpty()
], authController.login);

// Ruta Protegida de Ejemplo: GET /api/auth/profile
//  Se aplica el middleware verifyToken y luego el checkRoles
router.get('/profile', verifyToken, checkRoles(['user', 'admin']), (req, res) => {
    // Gracias al middleware verifyToken, tenemos acceso a req.user
    res.json({
        message: "Bienvenido a tu perfil protegido.",
        user: req.user
    });
});

// Ejemplo de ruta solo para Admins (para probar RBAC)
router.get('/admin-dashboard', verifyToken, checkRoles(['admin']), (req, res) => {
    res.json({
        message: "Bienvenido al panel de Administrador.",
        user: req.user
    });
});

module.exports = router;