
const jwt = require('jsonwebtoken');
const { Token } = require('../models');

// --- IMPLEMENTACIÓN DETALLADA ---
// Este es nuestro "Guardián". Un middleware es una función que tiene acceso a los objetos
// `req` (petición), `res` (respuesta) y la función `next` para pasar el control al siguiente middleware.
// `verifyToken` protege las rutas:
// 1. Extrae el token del header 'Authorization'.
// 2. Valida el token (firma y expiración).
// 3. Valida que el token no esté revocado en la BD.
// 4. Si es válido, decodifica el payload (que contiene el ID del usuario) y lo adjunta a `req`.
// 5. Llama a `next()` para continuar con la ejecución del controlador de la ruta.
// 6. Si no es válido, corta la ejecución y devuelve un error de autenticación.

exports.verifyToken = async (req, res, next) => {
  // Obtener el token del header
  const authHeader = req.header('Authorization');

  // Comprobar si no hay token
  if (!authHeader) {
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }

  // El token debe estar en el formato "Bearer <token>"
  const tokenParts = authHeader.split(' ');
  if (tokenParts.length !== 2 || tokenParts[0] !== 'Bearer') {
    return res.status(401).json({ msg: 'Token format is "Bearer <token>"' });
  }

  const token = tokenParts[1];

  try {
    // Verificar el token (firma y expiración)
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Verificar que el token no haya sido revocado en la BD
    const tokenRecord = await Token.findOne({ where: { token, userId: decoded.user.id } });
    
    if (!tokenRecord) {
      return res.status(401).json({ msg: 'Token not found in database' });
    }

    if (!tokenRecord.isActive) {
      return res.status(401).json({ msg: 'Token has been revoked (logged out)' });
    }

    // Añadir el usuario del payload del token al objeto request
    req.user = decoded.user;
    req.tokenId = tokenRecord.id; // Guardar el ID del token para logout
    next();
  } catch (err) {
    res.status(401).json({ msg: 'Token is not valid' });
  }
};
