# DIAGRAMA DE ARQUITECTURA - SISTEMA DE LOGOUT

```
╔════════════════════════════════════════════════════════════════════════════════════════╗
║                              FLUJO DE AUTENTICACIÓN                                     ║
╚════════════════════════════════════════════════════════════════════════════════════════╝

                                    FASE 1: LOGIN
                                    
    ┌─────────────────────────────────────────────────────────────────────────────────┐
    │ FRONTEND (React)                                                                 │
    │ ┌────────────────────────────────┐                                             │
    │ │ Login.jsx                      │                                             │
    │ │ - Email                        │                                             │
    │ │ - Password                     │                                             │
    │ └────────────────┬───────────────┘                                             │
    │                  │                                                              │
    │                  ▼                                                              │
    │ ┌────────────────────────────────────────────────────────────────────────────┐ │
    │ │ AuthContext.login(email, password)                                       │ │
    │ │ ├─ POST /api/auth/login                                                 │ │
    │ │ └─ localStorage.setItem('token', response.token)                       │ │
    │ └────────────────┬───────────────────────────────────────────────────────┘ │
    └────────────────┼──────────────────────────────────────────────────────────┘
                     │
                     │ HTTP POST
                     │
    ┌─────────────────────────────────────────────────────────────────────────────┐
    │ BACKEND (Node.js/Express)                                                   │
    │ ┌────────────────────────────────────────────────────────────────────────┐  │
    │ │ POST /api/auth/login                                                  │  │
    │ │ ├─ Validar email y password                                          │  │
    │ │ ├─ Comparar contraseña con bcrypt                                   │  │
    │ │ ├─ Generar JWT (jsonwebtoken)                                       │  │
    │ │ │                                                                     │  │
    │ │ │ ┌───────────────────────────────────────────────────────────────┐ │  │
    │ │ │ │ NUEVO: Guardar token en BD                                  │ │  │
    │ │ │ │ Token.create({                                              │ │  │
    │ │ │ │   userId: user.id,                                          │ │  │
    │ │ │ │   token: jwt_token,                                         │ │  │
    │ │ │ │   isActive: true,          ← CLAVE: Marcar como activo     │ │  │
    │ │ │ │   expiresAt: decoded.exp,                                  │ │  │
    │ │ │ │ })                                                          │ │  │
    │ │ │ └───────────────────────────────────────────────────────────────┘ │  │
    │ │ │                                                                     │  │
    │ │ └─ Responder { token }                                               │  │
    │ └────────────────┬──────────────────────────────────────────────────────┘  │
    │                  │                                                       │
    │                  ▼                                                       │
    │            DATABASE (PostgreSQL)                                        │
    │            ┌─────────────────────────────────────────────────┐         │
    │            │ TABLE: Tokens                                  │         │
    │            ├──────────────────────────────────────────────┤         │
    │            │ id | userId | token | isActive | expiresAt │         │
    │            │ 1  │   5    │ jwe- │  true    │ 2026-02-01│         │
    │            │    │        │      │          │           │         │
    │            └─────────────────────────────────────────────┘         │
    └─────────────────────────────────────────────────────────────────────────────┘


                              FASE 2: OPERACIONES NORMALES
                              
    ┌──────────────────────────────────────────────────────────────────────────┐
    │ FRONTEND (React)                                                         │
    │ ├─ GET /api/users/me                                                   │
    │ ├─ GET /api/transactions                                               │
    │ └─ interceptor agrega: Authorization: Bearer <token>                   │
    └────────────────┬─────────────────────────────────────────────────────┘
                     │
                     │ HTTP GET + Authorization Header
                     │
    ┌──────────────────────────────────────────────────────────────────────────┐
    │ BACKEND (Node.js/Express)                                               │
    │ ┌──────────────────────────────────────────────────────────────────────┐ │
    │ │ Middleware: verifyToken(req, res, next)                            │ │
    │ │                                                                      │ │
    │ │ 1. Extraer token del header Authorization                          │ │
    │ │ 2. Verificar firma JWT ✓                                           │ │
    │ │ 3. Verificar expiración ✓                                          │ │
    │ │ 4. NUEVO: Buscar en BD                                             │ │
    │ │    ┌──────────────────────────────────────────────────────────┐   │ │
    │ │    │ tokenRecord = await Token.findOne({                    │   │ │
    │ │    │   where: { token, userId: decoded.user.id }          │   │ │
    │ │    │ })                                                    │   │ │
    │ │    │ if (!tokenRecord.isActive) {                         │   │ │
    │ │    │   return 401 "Token has been revoked (logged out)"  │   │ │
    │ │    │ }                                                    │   │ │
    │ │    └──────────────────────────────────────────────────────────┘   │ │
    │ │ 5. Si todo OK → next() para ejecutar controlador                   │ │
    │ └──────────────────────────────────────────────────────────────────────┘ │
    │ ├─ Ejecutar controlador correspondiente                                 │
    │ └─ Responder con datos                                                  │
    └──────────────────────────────────────────────────────────────────────────┘


                              FASE 3: LOGOUT (CLAVE)
                              
    ┌────────────────────────────────────────────────────────────────────────┐
    │ FRONTEND (React)                                                       │
    │ ┌────────────────────────────────┐                                   │
    │ │ MainLayout.jsx                 │                                   │
    │ │ - Dropdown menu abierto        │                                   │
    │ │ - Usuario clica "Cerrar Sesión"                                    │
    │ └────────────────┬───────────────┘                                   │
    │                  │                                                    │
    │                  ▼                                                    │
    │ ┌────────────────────────────────────────────────────────────────┐  │
    │ │ handleLogout() {                                              │  │
    │ │   await logout()  ← AuthContext.logout()                     │  │
    │ │   toast.success("Has cerrado sesión")                        │  │
    │ │ }                                                            │  │
    │ │                                                              │  │
    │ │ AuthContext.logout() {                                      │  │
    │ │   try {                                                     │  │
    │ │     await api.post('/auth/logout')  ← POST AL BACKEND       │  │
    │ │   } finally {                                               │  │
    │ │     localStorage.removeItem('token')                        │  │
    │ │     setUser(null)                                           │  │
    │ │   }                                                         │  │
    │ │ }                                                           │  │
    │ └────────────────┬────────────────────────────────────────────┘  │
    └────────────────┼────────────────────────────────────────────────┘
                     │
                     │ HTTP POST /api/auth/logout
                     │ Authorization: Bearer <token>
                     │
    ┌─────────────────────────────────────────────────────────────────────┐
    │ BACKEND (Node.js/Express)                                           │
    │ ┌─────────────────────────────────────────────────────────────────┐ │
    │ │ POST /api/auth/logout                                         │ │
    │ │ - Middleware verifyToken ejecuta PRIMERO                      │ │
    │ │   * Valida firma, expiración, y isActive=true ✓               │ │
    │ │                                                                │ │
    │ │ - auth.logout() controlador:                                  │ │
    │ │                                                                │ │
    │ │   ┌──────────────────────────────────────────────────────┐   │ │
    │ │   │ 1. Obtener token del Authorization header          │   │ │
    │ │   │ 2. Buscar en BD:                                   │   │ │
    │ │   │    tokenRecord = await Token.findOne({            │   │ │
    │ │   │      where: { token }                             │   │ │
    │ │   │    })                                             │   │ │
    │ │   │ 3. ACTUALIZAR:                                    │   │ │
    │ │   │    await tokenRecord.update({                    │   │ │
    │ │   │      isActive: false,      ← MARCAR COMO INACTIVO │   │ │
    │ │   │      revokedAt: new Date() ← REGISTRAR REVOCACIÓN│   │ │
    │ │   │    })                                             │   │ │
    │ │   │ 4. Responder: { msg: "Logout successful" }        │   │ │
    │ │   └──────────────────────────────────────────────────────┘   │ │
    │ └─────────────────────────────────────────────────────────────────┘ │
    │                  │                                                  │
    │                  ▼                                                  │
    │            DATABASE (PostgreSQL)                                   │
    │            ┌────────────────────────────────────────┐              │
    │            │ TABLE: Tokens                         │              │
    │            ├────────────────────────────────────────┤              │
    │            │ id | userId | token | isActive | ...│              │
    │            │ 1  │   5    │ jwe- │  FALSE   │ ...│ ← REVOCADO │
    │            │    │        │      │          │    │              │
    │            └────────────────────────────────────────┘              │
    └──────────────────────────────────────────────────────────────────────┘
                     │
                     │ Respuesta 200 OK
                     │
    ┌──────────────────────────────────────────────────────────────┐
    │ FRONTEND (React)                                             │
    │ ├─ localStorage.removeItem('token')                         │
    │ ├─ setUser(null)                                            │
    │ ├─ navigate('/login')                                       │
    │ └─ Toast: "Has cerrado sesión"                              │
    └──────────────────────────────────────────────────────────────┘


                     FASE 4: INTENTO DE REUTILIZAR TOKEN
                     
    ┌─────────────────────────────────────────────────┐
    │ Usuario intenta acceder a ruta protegida       │
    │ con el MISMO token anterior                     │
    └────────────────┬────────────────────────────────┘
                     │
                     │ HTTP GET /api/users/me
                     │ Authorization: Bearer <OLD_token>
                     │
    ┌────────────────────────────────────────────────┐
    │ Middleware verifyToken:                       │
    │                                               │
    │ 1. Extraer token del header ✓                 │
    │ 2. Validar firma JWT ✓                        │
    │ 3. Validar expiración ✓                       │
    │ 4. BÚSQUEDA EN BD:                            │
    │    tokenRecord = await Token.findOne({       │
    │      where: { token, userId: ... }          │
    │    })                                        │
    │    if (!tokenRecord.isActive) {              │
    │      return 401                              │
    │      "Token has been revoked (logged out)" │
    │    }                                         │
    │                                               │
    │ ✗ RECHAZADO: isActive = false                │
    │                                               │
    └────────────────────────────────────────────────┘
                     │
                     ▼
    ┌────────────────────────────────────────────────┐
    │ Frontend recibe 401 Unauthorized              │
    │ AuthContext limpia estado                     │
    │ Redirecciona a login                          │
    └────────────────────────────────────────────────┘


╔════════════════════════════════════════════════════════════════════════════════════════╗
║                            MODELO DE DATOS - TOKEN TABLE                               ║
╚════════════════════════════════════════════════════════════════════════════════════════╝

TABLE: Tokens
┌────────────────────────────────────────────────────────────────────────────┐
│ COLUMNA       │ TIPO        │ NULL │ UNIQUE │ DESCRIPCIÓN                 │
├────────────────────────────────────────────────────────────────────────────┤
│ id            │ INTEGER     │ NO   │ Sí (PK)│ Primary key                │
│ userId        │ INTEGER     │ NO   │ No     │ Foreign key → Users(id)     │
│ token         │ TEXT        │ NO   │ Sí     │ JWT token completo          │
│ isActive      │ BOOLEAN     │ NO   │ No     │ true=activo, false=revocado │
│ expiresAt     │ DATE        │ NO   │ No     │ Cuando expira el JWT        │
│ revokedAt     │ DATE        │ Sí   │ No     │ Cuándo fue revocado         │
│ createdAt     │ TIMESTAMP   │ NO   │ No     │ Cuándo se creó              │
│ updatedAt     │ TIMESTAMP   │ NO   │ No     │ Última actualización        │
├────────────────────────────────────────────────────────────────────────────┤
│ ÍNDICES:                                                                   │
│ - INDEX (userId)                                                           │
│ - UNIQUE INDEX (token)                                                     │
│ - INDEX (isActive)                                                         │
└────────────────────────────────────────────────────────────────────────────┘

EJEMPLOS DE DATOS:
┌────┬────────┬──────────────────────────┬──────────┬────────────┬────────────┐
│ id │ userId │ token                    │ isActive │ expiresAt  │ revokedAt  │
├────┼────────┼──────────────────────────┼──────────┼────────────┼────────────┤
│ 1  │   5    │ eyJhbGc...               │   true   │ 2026-02-01 │   null     │ ← ACTIVO
│ 2  │   5    │ eyJhbGc...               │   false  │ 2026-01-26 │ 2026-01-26 │ ← REVOCADO
│ 3  │   7    │ eyJhbGc...               │   true   │ 2026-02-05 │   null     │ ← ACTIVO
└────┴────────┴──────────────────────────┴──────────┴────────────┴────────────┘


╔════════════════════════════════════════════════════════════════════════════════════════╗
║                        ESTRUCTURA DE RESPUESTAS HTTP                                    ║
╚════════════════════════════════════════════════════════════════════════════════════════╝

1. LOGIN (POST /api/auth/login)
   
   Request:
   {
     "email": "user@example.com",
     "password": "password123"
   }
   
   Response 200 OK:
   {
     "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
   }
   
   Response 400 Bad Request:
   {
     "msg": "Invalid credentials"
   }


2. LOGOUT (POST /api/auth/logout)
   
   Request:
   {
     "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
   }
   
   Response 200 OK:
   {
     "msg": "Logout successful"
   }
   
   Response 401 Unauthorized:
   {
     "msg": "No token, authorization denied"
   }
   
   Response 401 Unauthorized:
   {
     "msg": "Token has been revoked (logged out)"
   }


3. OPERACIONES NORMALES (GET /api/users/me)
   
   Request:
   {
     "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
   }
   
   Response 200 OK (Token activo):
   {
     "id": 5,
     "username": "johndoe",
     "email": "john@example.com",
     "createdAt": "2026-01-20T10:30:00Z"
   }
   
   Response 401 Unauthorized (Token revocado):
   {
     "msg": "Token has been revoked (logged out)"
   }
```

## Relaciones entre Modelos

```
┌─────────────┐         ┌─────────────┐
│   Users     │ 1 ─ ∞ │   Tokens    │
├─────────────┤         ├─────────────┤
│ id (PK)     │◄────────│ userId (FK) │
│ username    │         │ id (PK)     │
│ email       │         │ token       │
│ password    │         │ isActive    │
└─────────────┘         │ expiresAt   │
      ▲                 │ revokedAt   │
      │ 1               └─────────────┘
      │
      ├──────── ∞ ────────┐
      │                   │
      │            ┌──────────────────┐
      │            │  Transactions    │
      │            ├──────────────────┤
      │            │ id (PK)          │
      │            │ userId (FK) ────►│
      │            │ amount           │
      │            │ category         │
      │            └──────────────────┘
      │
      └──────── ∞ ────────┐
                          │
                  ┌──────────────────┐
                  │    Budgets       │
                  ├──────────────────┤
                  │ id (PK)          │
                  │ userId (FK) ────►│
                  │ category         │
                  │ limit            │
                  └──────────────────┘

CASCADE DELETE:
- Si se elimina un User → Se eliminan todos sus Tokens, Transactions y Budgets
- Si se elimina un Token → Solo se elimina ese token (no afecta user)
```
