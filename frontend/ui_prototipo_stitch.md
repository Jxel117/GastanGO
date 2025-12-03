# 📱 GastanGO: Documentación de Diseño UI/UX

## Descripción General

Bienvenido a la documentación visual de **GastanGO**, un sistema rápido e intuitivo de gestión de gastos diseñado para la velocidad. Este documento presenta las guías de diseño, objetivos del usuario y componentes clave para las 8 pantallas principales del flujo crítico de la aplicación.

---

## 🔄 Flujo Principal del Usuario

El flujo de diseño cubre el ciclo de vida completo de una transacción en GastanGO, priorizando la filosofía **"Tiempo-de-Acción"** (menos de 5 segundos):

### Pasos del Viaje

1. **Acceso**: El usuario inicia sesión en el sistema (Pantalla de Login)
2. **Inicio**: Ve su estado financiero e inicia una acción (Dashboard)
3. **Registro Rápido (4 Toques)**:
   - **Toque 1**: Define el tipo de transacción (Ingreso/Gasto)
   - **Toque 2**: Clasifica por categoría (Selección visual)
   - **Toque 3**: Introduce el monto (Teclado numérico optimizado)
   - **Toque 4**: Retroalimentación inmediata (Confirmación)
4. **Enriquecimiento**: Añade contexto mediante notificación (Detalles)
5. **Análisis**: Revisa tendencias en pantallas grandes (Reportes Web)

---

## 🎨 Especificaciones de Pantallas

### 1. Pantalla de Login

| Propiedad | Valor |
|----------|-------|
| **Plataforma** | Móvil |
| **Objetivo del Usuario** | Acceso rápido y seguro a la cuenta |

**Layout**: Diseño centrado, limpio y minimalista. Área principal con formulario y branding discreto.

**Componentes Principales**:
- **Logo GastanGO**: Tamaño mediano, superior central
- **Campos de Formulario**: Email y Contraseña (con toggle de visibilidad)
- **Botón Principal (CTA)**: "Iniciar Sesión" (Azul profundo, prominente)
- **Enlaces Secundarios**: "Olvidé mi contraseña" y "Registrarse" (Sutiles)

**Interacción**: Validación de credenciales → Redirección al Dashboard
**Captura**

![loginMovil](docs/img/prototipos/movil/login/screen.png)

![loginWeb](docs\img\prototipos\web\iniciar_sesión\screen.png)

---

### 2. Dashboard (Inicio)

| Propiedad | Valor |
|----------|-------|
| **Plataforma** | Móvil |
| **Objetivo del Usuario** | Ver saldo actual y registrar una nueva transacción inmediatamente |

**Layout**: Header fijo, sección "Hero" de saldo, cuerpo con lista/resumen. Botón flotante anclado.

**Componentes Principales**:
- **Header Pegajoso**: Logo y navegación (Perfil/Ajustes)
- **Saldo Actual (Hero)**: Tipografía impactante (Azul para positivo, Rojo para negativo)
- **Transacciones Recientes**: Lista concisa (últimos 3-5 items)
- **FAB (Botón de Acción Flotante)**: Botón circular "+" grande, azul profundo (Esquina inferior derecha)

**Interacción**: El botón "+" inicia el flujo de registro
**Captura**
![dashMovil](docs\img\prototipos\movil\dashboard_(home)\screen.png)

![DashWeb](docs\img\prototipos\web\dashboard_(inicio)\screen.png)

---

### 3. Selección de Tipo de Transacción (Toque 1)

| Propiedad | Valor |
|----------|-------|
| **Plataforma** | Móvil |
| **Objetivo del Usuario** | Decidir rápidamente entre Ingreso o Gasto |

**Layout**: Pantalla dividida con dos grandes áreas de toque.

**Componentes Principales**:
- **Botón "Gasto"**: Mitad superior/izquierda, color rojo suave, icono (Carrito/Flecha abajo)
- **Botón "Ingreso"**: Mitad inferior/derecha, color verde esmeralda, icono (Dinero/Flecha arriba)
- **Texto Guía**: Instrucciones sutiles y breves

**Interacción**: Tocar cualquiera avanza a Categoría con tipo preseleccionado
**Captura**

![transaccionMovil](docs\img\prototipos\movil\selección_de_tipo_(toque_1)\screen.png)

![transaccionWeb](docs\img\prototipos\web\selección_de_tipo_de_movimiento\screen.png)

---

### 4. Selección de Categoría (Toque 2)

| Propiedad | Valor |
|----------|-------|
| **Plataforma** | Móvil |
| **Objetivo del Usuario** | Elegir categoría mediante escaneo visual rápido |

**Layout**: Grid responsivo de iconos grandes.

**Componentes Principales**:
- **Título**: "Selecciona la Categoría"
- **Grid de Iconos**:
  - Iconos grandes y centrados
  - Etiquetas de texto pequeño debajo (ej: Comida, Transporte)
- **Navegación**: Botón pequeño "Atrás"

**Interacción**: Un toque selecciona la categoría y avanza automáticamente a Monto
**Captura**
![categoriaMovil](docs\img\prototipos\movil\selección_de_categoría_(toque_2)\screen.png)

![categoriaWeb](docs\img\prototipos\web\selección_de_categoría\screen.png)

---

### 5. Ingreso de Monto (Toque 3)

| Propiedad | Valor |
|----------|-------|
| **Plataforma** | Móvil |
| **Objetivo del Usuario** | Ingresar monto monetario de forma rápida y precisa |

**Layout**: Display en la parte superior, teclado numérico personalizado en la parte inferior (mayoría de la pantalla).

**Componentes Principales**:
- **Display de Monto**: Gigante, actualizaciones en tiempo real
- **Teclado Personalizado**:
  - Botones de números grandes (0-9)
  - Botones de Decimal (.) y Borrar (←)
- **Botón de Acción**: "Aceptar/Siguiente" (CTA, azul profundo)

**Interacción**: Entrada directa al display. "Aceptar" finaliza el registro base
**Captura**
![montoMovil](docs\img\prototipos\movil\ingreso_de_monto_(toque_3)\screen.png)

![montoWeb](docs\img\prototipos\web\ingreso_de_monto\screen.png)

---

### 6. Confirmación (Toque 4)

| Propiedad | Valor |
|----------|-------|
| **Plataforma** | Móvil |
| **Objetivo del Usuario** | Retroalimentación inmediata de éxito (Tranquilidad mental) |

**Layout**: Overlay centrado o modal efímero.

**Componentes Principales**:
- **Mensaje**: "¡Gasto Registrado!" (Tipografía Hero)
- **Icono**: Marca de verificación gigante (Verde esmeralda)
- **Resumen**: Monto y categoría en texto pequeño (Opcional)

**Interacción**: Desaparición automática después de 1-2 segundos, retorno al Dashboard
**Captura**

![confirmacionMovil](docs\img\prototipos\movil\confirmación_(toque_4)\screen.png)

![confirmacionWeb](docs\img\prototipos\web\confirmación_de_registro\screen.png)

---

### 7. Notificación de Detalles (Post-Registro)

| Propiedad | Valor |
|----------|-------|
| **Plataforma** | Móvil |
| **Objetivo del Usuario** | Enriquecer transacción (foto, nota, ubicación) mediante recordatorio |

**Layout**: Formulario vertical con sección de resumen en la parte superior.

**Componentes Principales**:
- **Header**: Título y botón de cerrar
- **Resumen**: Muestra Monto (Gigante) y Categoría/Fecha
- **Campos de Formulario**:
  - Entrada de texto "Notas"
  - Botón "Cámara"
  - Botón "Ubicación"
- **Acción**: Botón "Guardar Cambios" (Gigante, azul)

**Interacción**: Abre funciones nativas (Cámara/Mapa) y actualiza el registro en la base de datos

---

### 8. Reportes (Vista Web)

| Propiedad | Valor |
|----------|-------|
| **Plataforma** | Web / Tablet |
| **Objetivo del Usuario** | Análisis profundo, tendencias de consumo y patrones |

**Layout**: Dashboard denso. Header, barra lateral de filtros y área principal de gráficos.

**Componentes Principales**:
- **Header**: Logo y botón de exportación
- **Barra Lateral de Filtros**:
  - Rango de tiempo (Semana/Mes)
  - Categoría (Tags)
  - Tipo (Toggle)
- **Gráficos**:
  - Gráfico de pastel (Por categoría)
  - Gráfico de líneas (Evolución mensual)
- **Tabla de Datos**: Desglose detallado con columnas ordenables
- **KPIs**: Tarjetas de métricas (Gasto Total, Ahorros)

**Interacción**: Los cambios de filtro actualizan dinámicamente todos los gráficos y tablas

---

## 🎯 Filosofía de Diseño

- **Tiempo-de-Acción**: Registrar un gasto en menos de 5 segundos
- **Jerarquía Visual**: Distinción clara entre acciones primarias y secundarias
- **Mobile-First**: Optimizado para interacción táctil
- **Retroalimentación Instantánea**: Los usuarios siempre saben que su acción fue registrada
- **Enriquecimiento Progresivo**: Información básica requerida, detalles opcionales

---

## 📱 Paleta de Colores

| Caso de Uso | Color |
|----------|-------|
| Positivo/Ingreso | Verde Esmeralda |
| Negativo/Gasto | Rojo Suave |
| CTA Primario | Azul Profundo |
| Éxito/Confirmación | Verde Esmeralda |
| Alertas/Advertencias | Rojo Suave |
| Fondo Neutral | Gris Claro/Blanco |


**© 2024 Proyecto GastanGO. Documentación de Diseño UI/UX**
