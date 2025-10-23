// src/controllers/auth.controller.js
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { validationResult } = require('express-validator');

// (Simulación de base de datos) En un proyecto real, esto interactuaría con tu base de datos PostgreSQL.
const users = []; 

// Función para registrar un nuevo usuario
exports.register = async (req, res) => {
    // 1. Validar entrada (request body)
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { username, email, password } = req.body;

        // 2. Verificar si el usuario ya existe (Principio OWASP: Validación de entrada)
        if (users.find(user => user.email === email)) {
            return res.status(409).json({ message: "El correo electronico ya esta en uso." });
        }

        // 3. Hashear la contraseña (Principio OWASP: Fallos criptográficos)
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = { id: users.length + 1, username, email, password: hashedPassword, roles: ['user'] };
        users.push(newUser); // Guardar en la "base de datos"

        res.status(201).json({ message: "Usuario registrado con exito." });

    } catch (error) {
        res.status(500).json({ message: "Error en el servidor al registrar el usuario." });
    }
};

// Función para iniciar sesión
exports.login = async (req, res) => {
    // 1. Validar entrada
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { email, password } = req.body;
        const user = users.find(u => u.email === email);

        // 2. Verificar si el usuario existe y si la contraseña es correcta
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ message: "Credenciales inválidas." }); // Mensaje genérico por seguridad
        }

        // 3. Generar el token JWT
        const payload = {
            userId: user.id,
            roles: user.roles,
            iat: Math.floor(Date.now() / 1000), // Issued at
            exp: Math.floor(Date.now() / 1000) + (60 * 60) // Expira en 1 hora
        };

        const token = jwt.sign(payload, process.env.JWT_SECRET);

        res.status(200).json({
            message: "Inicio de sesión exitoso.",
            token: token
        });

    } catch (error) {
        res.status(500).json({ message: "Error en el servidor al iniciar sesión." });
    }
};