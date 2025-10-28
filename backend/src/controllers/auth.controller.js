import axios from 'axios';
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

const REGISTER_MS_URL = 'http://localhost:3001/api/v1/register';

export const handleRegisterFromMain = async (req, res) => {
  console.log('[Main Backend] Petición de registro recibida. Redirigiendo a Register-MS...');
  
  try {
    // 1. Llama al microservicio (Comunicación REST)
    const response = await axios.post(REGISTER_MS_URL, req.body);

    // 2. Devuelve la respuesta del microservicio al cliente
    console.log('[Main Backend] Registro exitoso en Register-MS');
    return res.status(response.status).json(response.data);

  } catch (error) {
    // Manejo de errores (si el microservicio está caído o devuelve un error)
    console.error('[Main Backend] Error al contactar Register-MS:', error.message);
    
    // Si el microservicio nos dio una respuesta de error (ej. 400)
    if (error.response) {
      return res.status(error.response.status).json(error.response.data);
    }
    
    // Si el microservicio está caído (error de conexión)
    return res.status(502).json({ 
      error: 'Error de comunicación: El servicio de registro no está disponible.' 
    });
  }
};