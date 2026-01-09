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
