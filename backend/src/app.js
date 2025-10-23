// src/app.js
require('dotenv').config(); // Carga las variables de entorno desde .env
const express = require('express');
const cors = require('cors');

const app = express();

// --- Middlewares ---
// Configuración de CORS para permitir peticiones solo desde tus frontends
const corsOptions = {
  origin: ['http://localhost:3000', 'http://localhost:5173'], // Reemplaza con las URLs de tus apps móvil y web
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true
};
app.use(cors(corsOptions));

// Middleware para parsear JSON en el cuerpo de las peticiones
app.use(express.json());

// --- Rutas ---
app.get('/', (req, res) => {
  res.send('API de GastanGO funcionando correctamente!');
});

// Importar y usar las rutas de autenticación
const authRoutes = require('./routes/auth.routes.js');
app.use('/api/auth', authRoutes);


// --- Manejo de Errores (básico) ---
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Algo salio mal en el servidor' });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`);
});