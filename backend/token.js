const jwt = require('jsonwebtoken');

jwt.sign(
  { id: user.id, email: user.email },
  process.env.JWT_SECRET, // Clave secreta
  { expiresIn: '15m' }   // Expiracion corta
);