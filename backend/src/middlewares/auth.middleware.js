// src/middlewares/auth.middleware.js
const jwt = require('jsonwebtoken');

// Este middleware verifica si el token es válido
exports.verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // "Bearer TOKEN"

    if (!token) {
        //  Responde 401 si no hay token
        return res.status(401).json({ message: "Acceso denegado. No se proporciono un token." });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            //  Responde 403 si el token es inválido (expirado, firma incorrecta)
            return res.status(403).json({ message: "Token invalido o expirado." });
        }
        
        req.user = decoded; // Guarda { userId, roles, iat, exp } en la request
        next();
    });
};

/**
 *  Middleware RBAC (Role-Based Access Control).
 * Verifica si el usuario (ya verificado por verifyToken) tiene uno de los roles requeridos.
 * @param {Array<string>} allowedRoles - Array de roles permitidos (ej. ['admin', 'user'])
 */
exports.checkRoles = (allowedRoles) => {
    return (req, res, next) => {
        // req.user es establecido por el middleware anterior (verifyToken)
        if (!req.user || !req.user.roles) {
            return res.status(403).json({ message: "Error de permisos (No se encontraron roles)." });
        }

        const userRoles = req.user.roles; 

        // Comprueba si algún rol del usuario está en la lista de roles permitidos
        const hasPermission = userRoles.some(role => allowedRoles.includes(role));

        if (!hasPermission) {
            //  Responde 403 si no tiene permisos
            return res.status(403).json({ message: "Acceso denegado. No tienes los permisos necesarios." });
        }

        next(); // Tiene permiso, continúa
    };
};