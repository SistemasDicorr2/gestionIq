# Task: Actualización de Plantilla HTML de Correo para Informes Diarios de Logística

## Contexto
Reformatar el HTML generado para los envíos por correo de informes de logística, adoptando la plantilla institucional completa responsive en escritorio (`.desktop-table`) y dispositivos móviles (`.mobile-only`).

## Plan
- [x] 1. Actualizar `generateEmailTableHtml` en `src/views/logistica/LogisticaDetalleInformeView.vue` con la nueva maquetación HTML/CSS.
- [x] 2. Mapear dinámicamente:
  - Header institucional `DISTRICORR · GESTIÓN IQ` con badge `ENVIADO`, fecha y zona.
  - Datos de responsable y hora de envío.
  - Tarjetas KPI compactas con íconos vectoriales inline (Movimientos, Cajas/Equipos, Bultos, Pendientes).
  - Observaciones generales de la jornada.
  - Tabla completa para escritorio (`.desktop-table`).
  - Tarjetas de registros apiladas para vista móvil (`.mobile-record`).
- [x] 3. Verificar compilación limpia (`npm run build` OK - 26.88s).

## Archivos involucrados
- `src/views/logistica/LogisticaDetalleInformeView.vue`
- `tasks/todo.md`
- `walkthrough.md`

## Riesgos
- Sin riesgo. Cambio de maquetación HTML email compatible con clientes de correo estándar.

## Verificación
- [x] Build de producción sin errores (`npm run build` OK en 26.88s)
- [x] Respetadas reglas de AGENTS.md
