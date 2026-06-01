# Portal del Instrumentador — Changelog Frontend

## Fecha
31 de Mayo de 2026

## Alcance
Todos los cambios detallados en este documento son de alcance **Frontend-only**, estrictamente orientados a mejorar la UX/UI (Experiencia de Usuario e Interfaz de Usuario) del portal del instrumentador. No se ha modificado la arquitectura de base de datos, funciones RPC ni contratos de datos.

## Archivos modificados
* `src/views/ActivitySummaryView.vue`
* `src/components/MyDataSection.vue`
* `src/components/PaymentDetailModal.vue`

## Cambios principales

### 1. Resumen de actividad
* **KPIs simplificados:** Se redujo la carga cognitiva inicial mostrando únicamente "Pendientes" y "Este mes".
* **Pendientes de liquidación:** Diseño en tarjetas claras con badges ámbar y un texto explicativo amigable ("Todavía no fue incluido en una orden de pago").
* **Últimos comprobantes cargados:** Se muestran solo hasta 3 comprobantes recientes.
* **Navegación intuitiva:** El botón "Ver más comprobantes" (o su equivalente "Ir a pagos y comprobantes") ya no expande el historial infinitamente en la vista inicial, sino que redirige a la pestaña dedicada "Pagos y Comprobantes".

### 2. Pagos y Comprobantes
* **Nueva pestaña dedicada:** Se consolidó una vista interna nombrada visiblemente "Pagos y Comprobantes" (título principal: "Liquidaciones y comprobantes").
* **Diferenciación de estados:** Separación clara entre "Pendientes de liquidación" e "Historial de liquidaciones".
* **Historial agrupado por mes:** La lista de liquidaciones se agrupa de forma dinámica en el frontend (ej. "Mayo de 2026"), evitando saturar al usuario.
* **Carga progresiva:** Se implementó un límite inicial (6 tarjetas) y un botón "Cargar más liquidaciones" puramente reactivo (en memoria), sin hacer peticiones nuevas al backend.
* **Lenguaje corregido:** Se eliminó la terminología de "transferencia bancaria" directa, adoptando "Liquidación registrada", "Comprobante cargado" y "Comprobante pendiente de carga".

### 3. Modal de detalle de liquidación
* **Rediseño y renombre:** El antiguo "Detalle del Pago" pasó a ser "Detalle de liquidación".
* **Lista de pacientes incluidos:** El modal ahora itera y muestra todos los pacientes/cirugías que componen esa orden de pago (si aplica).
* **Lenguaje neutral:** Se cambió "Pagado (Transferido)" por "Incluida en liquidación" o "Pendiente de liquidación".
* **Montos condicionales:** Los montos individuales (por cirugía) y el total de la liquidación se calculan y muestran **solo si** el dato real viene informado por el backend; no se inventan ni reparten cifras.
* **Uso de fechas reales:** Se introdujo la etiqueta condicional "Comprobante subido el" o "Fecha de liquidación".

### 4. Mi Perfil
* **Nuevo enfoque:** La antigua pestaña "Mis Datos" fue renombrada visualmente a "Mi Perfil".
* **Card de perfil superior:** Presenta nombre, DNI, y un estado visual claro ("Datos completos" en verde o "Faltan datos por completar" en ámbar) con un botón para solicitar actualización vía WhatsApp.
* **KPIs calculados en frontend:** Se integró un resumen de "Actividad registrada" (Cirugías acompañadas, Médicos, Tipos de cirugía, Instituciones) procesando in-memory el historial existente.
* **Top 5:** Se añadieron listas de "Cirugías por tipo" y "Cirugías por médico", aplicando fallbacks como "Todavía no hay información suficiente..." si no hay datos.

### 5. Modo oscuro y visual
* **Dark Mode local:** Se añadió un botón (toggle luna/sol) en el header que inyecta la clase `dark` a nivel del contenedor principal del portal, permitiendo invertir colores de forma segura y sin dependencias globales problemáticas.
* **Uso de colores por estado:** Consolidación de paleta semántica (Ámbar para pendiente, Esmeralda para comprobantes, Celeste para información).
* **Mejoras responsive:** Ajustes en padding, bordes redondeados (`rounded-2xl`), y eliminación de todo scroll horizontal. Las tarjetas flotan levemente en el hover (`hover:-translate-y-0.5`).

## Decisiones UX importantes
* **Carga progresiva:** El inicio no debe mostrar todo el historial. La vista rápida es fundamental para instrumentadores.
* **Navegación natural:** "Ir a pagos y comprobantes" lleva a la tab correspondiente en lugar de alterar el layout principal.
* **Lenguaje seguro:** Se evitó el uso categórico de "Pagado" si el sistema solo puede dar fe de la generación de la "Liquidación" o la carga del "Comprobante". 
* **Filtro anti-tecnicismos:** Queda prohibido mostrar nombres de tablas (ej. `orden_de_pago_id`), RPCs, JSON, `null`, `undefined` o `NaN`.

## Datos usados
Toda la UI se alimenta de los siguientes estados reactivos, confirmados por el código existente y abastecidos por una única llamada inicial:
* `allActivityData`: Provee el historial que alimenta KPIs y listas.
* `instrumentadorInfo`: Provee los datos personales y bancarios.
* `historialLiquidaciones`: Array computado para la pestaña de pagos.
* `liquidacionesAgrupadasPorMes`: Objeto computado front-end para agrupar visualmente el historial.
* `activeTab`: Estado de enrutamiento visual entre 'resumen', 'pagos', 'datos' y 'faq'.

## Límites y restricciones respetadas
**NO se tocó, alteró ni consultó:**
* Supabase (Dashboard, DB, Auth).
* RPCs (incluyendo `autenticar_y_obtener_resumen`).
* Reglas de Nivel de Fila (RLS), Policies o Grants.
* Edge Functions o Buckets (R2).
* Variables de entorno.
* Contratos de datos esperados (el backend dicta la estructura).
* Lógica backend o económica (los totales y sumas en frontend son derivaciones puramente presentacionales de variables provistas `monto`, `honorarios`, etc.).

## Riesgos o pendientes
* **Validar campo de cirugía:** Se implementó un fallback que prioriza `tipo_cirugia` sobre `patologia`. Se debe confirmar a futuro cuál es el estándar oficial del payload en la base.
* **Número oficial de WhatsApp:** La URL generada es `wa.me` genérica con texto pre-cargado. Queda pendiente definir el número telefónico corporativo si se desea automatizar el destinatario.
* **Refactorización modular:** Si el archivo `ActivitySummaryView.vue` sigue creciendo, convendrá separar las pestañas en componentes `.vue` independientes en una iteración técnica futura.
* **Hoja de vida profesional:** Evaluar la generación en PDF del "Perfil" para la siguiente etapa, excluyendo información sensible/económica.

## Verificación
* **Comando:** `npm run build`
* **Resultado:** Build exitoso.
```text
vite v5.2.11 building for production...
✓ 76 modules transformed.
dist/index.html                   0.45 kB │ gzip:   0.29 kB
dist/assets/index-D8gR...css     25.33 kB │ gzip:   5.12 kB
dist/assets/index-C5...js       180.52 kB │ gzip:  58.35 kB
✓ built in 1.48s
```