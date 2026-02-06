# GastanGO - Frontend Web

**Sistema de Gestión de Finanzas Personales**

Este proyecto constituye la capa visual (Frontend) de la plataforma **GastanGO**. Es una aplicación web moderna (SPA) diseñada para que los usuarios puedan registrar sus ingresos y gastos, visualizar su balance en tiempo real y gestionar sus categorías de forma sencilla desde cualquier dispositivo.

---

## Tecnologías Usadas

El desarrollo se realizó utilizando un stack moderno enfocado en el rendimiento y la experiencia de usuario:

* **Core:** [React](https://reactjs.org/) con [Vite](https://vitejs.dev/) para un entorno de desarrollo rápido.
* **Estilos:** [Tailwind CSS](https://tailwindcss.com/) para un diseño responsivo y limpio (Mobile First).
* **Estado:** React Context API para manejar la sesión del usuario y los datos de transacciones globalmente.
* **Conexión:** Axios para consumir la API REST del backend (con interceptores para seguridad JWT).
* **Gráficos:** Recharts para la visualización estadística de datos.

---

## Funcionalidades Principales

1.  **Autenticación:** Login y Registro de usuarios conectados al backend.
2.  **Dashboard:** Visualización de KPIs (Saldo, Ingresos, Gastos) y gráficos estadísticos.
3.  **Gestión de Transacciones:** Formulario intuitivo (Wizard) para registrar movimientos.
4.  **Diseño Responsivo:** Interfaz adaptable a móviles, tablets y escritorio.

---

## Instrucciones de Ejecución

Sigue estos pasos para probar el proyecto en tu entorno local:

**1. Prerrequisitos**
* Tener instalado Node.js (v16+).
* Tener el **Backend** de GastanGO corriendo (usualmente en el puerto 3000).

**2. Instalación**
Abre una terminal en la carpeta del proyecto y ejecuta:
```bash
npm install


---

## 🏗️ Arquitectura en Resumen

### Stack Tecnológico

```
┌─────────────────────────────────────────────┐
│  Frontend (React + Vite)                    │
│  - React Router, Context API                │
│  - Tailwind CSS, Framer Motion              │
│  - Axios con JWT interceptor                │
└──────────────┬──────────────────────────────┘
               │ REST/JSON/HTTPS
               ↓
┌──────────────────────────────────────────────┐
│  Backend (Node.js + Express)                 │
│  - Sequelize ORM                             │
│  - JWT con Token Blacklist                   │
│  - Swagger/OpenAPI Docs                      │
│  - bcryptjs, helmet, CORS                    │
└──────────────┬───────────────────────────────┘
               │ SQL/TCP
               ↓
┌──────────────────────────────────────────────┐
│  Database (PostgreSQL en Docker)             │
│  - 4 Tablas (Users, Transactions, Tokens)    │
│  - Relaciones 1:N con CASCADE DELETE         │
│  - pgAdmin para gestión visual               │
└──────────────────────────────────────────────┘

┌──────────────────────────────────────────────┐
│  Mobile (React Native + Expo)                │
│  - AsyncStorage para persistencia            │
│  - Misma API backend                         │
└──────────────────────────────────────────────┘
```

### Patrones Implementados

| Patrón | Dónde | Beneficio |
|--------|-------|----------|
| **MVC** | Backend | Separación responsabilidades |
| **Context API** | Frontend | State management sin Redux |
| **JWT + Blacklist** | Auth | Logout inmediato, seguridad |
| **Middleware** | Backend | Autenticación centralizada |
| **ORM (Sequelize)** | Backend | SQL injection prevention |
| **Interceptor** | Frontend/Mobile | Token injection automático |
| **Singleton** | Services | Instancia única compartida |

### Flujos Críticos

| Flujo | Entrada | Salida | Validaciones |
|-------|---------|--------|-------------|
| **Registro** | email, password, username | JWT token | Email @gmail, contraseña 6+ chars |
| **Login** | email, password | JWT + Token en BD | Contraseña válida, usuario existe |
| **Logout** | JWT válido | Confirmation 200 | Token revocado en BD |
| **Crear TX** | amount, type, category, date | TX guardada | Amount > 0, type enum, userId FK |
| **Ver TX** | JWT válido | Array de TX | Aisladas por usuario |

---

## 🔐 Seguridad Implementada

✅ **Implementado:**
- Password hashing (bcryptjs round 10)
- JWT con expiración (7 días)
- Token blacklist en BD (logout inmediato)
- Middleware de autenticación
- Validaciones express-validator
- Helmet (security headers)
- CORS configurado
- Contraseña nunca en respuestas API
- userId extraído del token (no confiable del cliente)

⚠️ **Falta para Producción:**
- Rate limiting
- Email verification
- HTTPS obligatorio
- Refresh tokens (para mayor seguridad)
- Logs de auditoría
- Backup automático
- Secrets en variables de entorno

---