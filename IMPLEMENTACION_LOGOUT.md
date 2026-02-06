/**
 * RESUMEN DE IMPLEMENTACIONES - SISTEMA DE LOGOUT CON VALIDACIÓN EN BACKEND
 * 
 * Fecha: 2026-01-26
 * Objetivo: Implementar un sistema robusto de logout con revocación de tokens
 *           y agregar botón "Editar Perfil" en el dropdown del usuario
 */

// ============================================================================
// BACKEND - CAMBIOS REALIZADOS
// ============================================================================

/**
 * 1. CREAR MODELO TOKEN (Token.model.js)
 *    Ubicación: /backend/src/models/Token.model.js
 *    
 *    Descripción:
 *    - Modelo Sequelize que registra todos los tokens activos de usuarios
 *    - Permite implementar un sistema de blacklist (lista negra) de tokens
 *    - Beneficios:
 *      * Logout inmediato: El servidor marca el token como inactivo
 *      * Seguridad: Previene reutilización de tokens después de logout
 *      * Auditoría: Registro de emisión, revocación y expiración
 *    
 *    Campos principales:
 *    - id: PK
 *    - userId: FK a Users
 *    - token: El JWT (único)
 *    - isActive: boolean (true = activo, false = revocado)
 *    - expiresAt: Fecha de expiración del JWT
 *    - revokedAt: Fecha en que fue revocado (si aplica)
 *    - timestamps: createdAt, updatedAt
 */

/**
 * 2. ACTUALIZAR MODELO Y RELACIONES (models/index.js)
 *    Cambios:
 *    - Importar modelo Token
 *    - Crear relación: User.hasMany(Token)
 *    - Configurar cascade delete: Si se elimina usuario → se eliminan tokens
 */

/**
 * 3. ACTUALIZAR CONTROLADOR DE AUTH (auth.controller.js)
 *    
 *    a) MÉTODO login() - Modificado
 *       - Ahora guarda el token en la BD después de generarlo
 *       - Calcula expiresAt usando jwt.decode()
 *       - Crea registro en tabla Token
 *    
 *    b) MÉTODO logout() - NUEVO
 *       - Recibe token en Authorization header
 *       - Busca el token en la BD
 *       - Marca como inactivo (isActive = false)
 *       - Registra revokedAt = new Date()
 *       - Responde con confirmación de logout
 */

/**
 * 4. ACTUALIZAR MIDDLEWARE DE AUTENTICACIÓN (auth.middleware.js)
 *    
 *    Cambios en verifyToken():
 *    - Ahora es una función async (antes era sincrónica)
 *    - Verifica firma y expiración del JWT (igual que antes)
 *    - NUEVO: Valida que el token NO esté revocado en la BD
 *    - Si token.isActive === false → Rechaza solicitud (401)
 *    - Guarda tokenId en req para uso en logout
 *    
 *    Beneficio: Cualquier endpoint que use verifyToken valida automáticamente
 *               que el usuario no haya hecho logout
 */

/**
 * 5. ACTUALIZAR RUTAS DE AUTH (auth.routes.js)
 *    
 *    a) Importar: logout, verifyToken
 *    
 *    b) Nueva ruta POST /api/auth/logout
 *       - Método: POST
 *       - Middleware: verifyToken (requiere autenticación)
 *       - Controlador: logout
 *       - Documentado con Swagger
 */

// ============================================================================
// FRONTEND - CAMBIOS REALIZADOS
// ============================================================================

/**
 * 1. ACTUALIZAR CONTEXTO DE AUTENTICACIÓN (AuthContext.jsx)
 *    
 *    Cambios en logout():
 *    - Cambió de función sincrónica a async/await
 *    - Ahora llama a api.post('/auth/logout') ANTES de limpiar estado
 *    - Try/catch para manejar errores
 *    - Finally: Limpia token y usuario sin importar resultado
 *    
 *    Flujo:
 *    1. Usuario clica "Cerrar Sesión"
 *    2. Se llama logout() que hace POST a /auth/logout
 *    3. Backend marca token como revocado en BD
 *    4. Frontend limpia localStorage y estado
 *    5. Redirecciona a login
 */

/**
 * 2. ACTUALIZAR LAYOUT PRINCIPAL (MainLayout.jsx)
 *    
 *    Cambios en el dropdown del usuario (línea ~119-131):
 *    
 *    a) handleLogout() - Ahora es async
 *       - Llama a logout() que es async
 *       - Toast de confirmación
 *    
 *    b) Agregar botón "Editar Perfil"
 *       - Icono: edit
 *       - Texto: "Editar Perfil"
 *       - Acción: navigate('/profile-settings')
 *       - Color: Azul (tema principal)
 *       - Posición: Antes de "Cerrar Sesión"
 *    
 *    c) Botón "Cerrar Sesión" - Mejorado
 *       - Ahora llama handleLogout (async)
 *       - Color: Rojo (tema de peligro)
 */

/**
 * 3. ACTUALIZAR RUTAS PRINCIPALES (App.jsx)
 *    
 *    a) Importar ProfileSettings
 *    
 *    b) Agregar ruta privada
 *       - Path: /profile-settings
 *       - Componente: ProfileSettings (ya existía)
 *       - Protegida: <PrivateRoute> ✓
 *       - Layout: Dentro de <MainLayout> ✓
 */

/**
 * 4. API SERVICE (api.js)
 *    - NO REQUERÍA CAMBIOS
 *    - Ya tenía interceptor que agrega Authorization header
 *    - El Token se envía automáticamente en cada request
 */

// ============================================================================
// FLUJO COMPLETO DE LOGIN - LOGOUT
// ============================================================================

/**
 * LOGIN:
 * 1. Usuario ingresa email y password en Login.jsx
 * 2. AuthContext.login() hace POST /api/auth/login
 * 3. Backend valida credenciales
 * 4. Backend genera JWT y lo GUARDA en tabla Token (isActive: true)
 * 5. Backend responde con token
 * 6. Frontend guarda token en localStorage
 * 7. Frontend actualiza AuthContext.user
 * 8. Redirecciona a /dashboard
 * 
 * OPERACIONES NORMALES:
 * 1. Frontend hace request a cualquier endpoint protegido
 * 2. Interceptor agrega "Authorization: Bearer <token>"
 * 3. Backend middleware verifyToken:
 *    a. Valida firma JWT ✓
 *    b. Valida expiración ✓
 *    c. Valida que token.isActive === true en BD ✓
 * 4. Si todo OK → ejecuta controlador
 * 5. Si token.isActive === false → responde 401 (Unauthorized)
 * 
 * LOGOUT:
 * 1. Usuario clica "Cerrar Sesión" en MainLayout dropdown
 * 2. MainLayout.handleLogout() es llamado (async)
 * 3. AuthContext.logout() hace POST /api/auth/logout
 * 4. Frontend envía Authorization header con token
 * 5. Backend middleware verifyToken valida token activo ✓
 * 6. Backend auth.logout():
 *    a. Encuentra token en BD
 *    b. Marca isActive = false
 *    c. Registra revokedAt = now
 *    d. Responde: { msg: "Logout successful" }
 * 7. Frontend limpia localStorage.removeItem('token')
 * 8. Frontend limpia AuthContext.user = null
 * 9. Frontend redirecciona a /login
 * 10. Si usuario intenta usar token antiguo:
 *     - Middleware rechaza: "Token has been revoked (logged out)"
 *     - Responde 401
 */

// ============================================================================
// MEJORES PRÁCTICAS IMPLEMENTADAS
// ============================================================================

/**
 * 1. VALIDACIÓN EN CLIENTE Y SERVIDOR
 *    ✓ Frontend valida entrada de usuario
 *    ✓ Backend valida todas las operaciones
 *    ✓ Servidor es la fuente de verdad
 * 
 * 2. SEGURIDAD DE TOKENS
 *    ✓ Tokens no se pueden reutilizar después de logout
 *    ✓ Lista negra (blacklist) de tokens revocados
 *    ✓ Auditoría completa de tokens (cuándo se emiten, revocan)
 *    ✓ Expiración automática (JWT expiry)
 *    ✓ HTTPS en producción (configurar)
 * 
 * 3. MANEJO DE ERRORES
 *    ✓ Try/catch en operaciones async
 *    ✓ Finally block para limpieza garantizada
 *    ✓ Mensajes de error claros para debugging
 *    ✓ Console.error para registro de errores
 * 
 * 4. EXPERIENCIA DE USUARIO
 *    ✓ Toast de confirmación en logout
 *    ✓ Redirección automática a login
 *    ✓ Estados de carga manejados
 *    ✓ Botones con iconos y estilos claros
 * 
 * 5. BASE DE DATOS
 *    ✓ Índices en campos de búsqueda (userId, token, isActive)
 *    ✓ Cascade delete para integridad referencial
 *    ✓ Timestamps para auditoría (createdAt, updatedAt, revokedAt)
 *    ✓ Campo isActive para queries eficientes
 * 
 * 6. CÓDIGO LIMPIO
 *    ✓ Funciones con responsabilidad única
 *    ✓ Nombres descriptivos de variables
 *    ✓ Comentarios explicativos
 *    ✓ Rutas organizadas por módulo (auth, users, etc)
 */

// ============================================================================
// TESTING RECOMENDADO
// ============================================================================

/**
 * Para validar que todo funciona:
 * 
 * 1. TEST LOGIN:
 *    - POST /api/auth/login con credenciales válidas
 *    - Verificar que retorna token
 *    - Verificar que se guardó en tabla Token con isActive=true
 * 
 * 2. TEST OPERACIONES NORMALES:
 *    - GET /api/users/me (obtener perfil)
 *    - GET /api/transactions (listar transacciones)
 *    - Verificar que todas funcionan con token válido
 * 
 * 3. TEST LOGOUT:
 *    - POST /api/auth/logout con Authorization header
 *    - Verificar que responde 200
 *    - Verificar que token.isActive = false en BD
 *    - Verificar que token.revokedAt se registró
 * 
 * 4. TEST REUTILIZACIÓN DESPUÉS DE LOGOUT:
 *    - Intentar usar mismo token después de logout
 *    - Verificar que retorna 401 "Token has been revoked"
 * 
 * 5. TEST FRONTEND:
 *    - Hacer login → Verificar redirección a dashboard
 *    - Abrir dropdown → Verificar botones visibles
 *    - Clicar "Editar Perfil" → Debe ir a /profile-settings
 *    - Clicar "Cerrar Sesión" → Debe limpiar y volver a login
 */

// ============================================================================
// ARCHIVOS MODIFICADOS/CREADOS
// ============================================================================

/**
 * BACKEND:
 * ✓ [CREADO] /backend/src/models/Token.model.js
 * ✓ [MODIFICADO] /backend/src/models/index.js
 * ✓ [MODIFICADO] /backend/src/controllers/auth.controller.js
 * ✓ [MODIFICADO] /backend/src/middlewares/auth.middleware.js
 * ✓ [MODIFICADO] /backend/src/routes/auth.routes.js
 * 
 * FRONTEND:
 * ✓ [MODIFICADO] /frontend/src/context/AuthContext.jsx
 * ✓ [MODIFICADO] /frontend/src/pages/components/MainLayout.jsx
 * ✓ [MODIFICADO] /frontend/src/App.jsx
 */

// ============================================================================
// NOTAS IMPORTANTES
// ============================================================================

/**
 * 1. MIGRACIÓN DE BD REQUERIDA:
 *    - Ejecutar migraciones Sequelize para crear tabla Token
 *    - O ejecutar seed para crear la tabla
 *    - Comando: npm run migrate (o similar según tu setup)
 * 
 * 2. VARIABLES DE ENTORNO:
 *    - Asegurar que JWT_SECRET está configurado
 *    - Asegurar que JWT_EXPIRES_IN está configurado
 *    - Ej: JWT_EXPIRES_IN=7d, JWT_SECRET=tu_clave_secreta
 * 
 * 3. FRONTEND - TESTING LOCAL:
 *    - Backend debe correr en http://localhost:3000
 *    - Frontend debe correr en http://localhost:5173 (Vite)
 *    - CORS debe permitir solicitudes cruzadas (revisar backend)
 * 
 * 4. PERFORMANCE FUTURE IMPROVEMENTS:
 *    - Implementar Redis para cache de tokens válidos (para validación más rápida)
 *    - Limpiar tokens expirados periodicamente de la BD
 *    - Implementar refresh tokens para mejor seguridad
 */
