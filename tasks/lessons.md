# Lessons Learned - Gestión IQ

## 2026-09-11 — Separación Estricta de Reportes Automatizados (Single Responsibility)

### Corrección recibida
El usuario indicó: "el send resumen operativo no deberiamos modificar, volve a la version anterior, deberiamos crear otro send automatico para no mezclar agua y aceite".

### Patrón detectado
Se intentó fusionar dos dominios operativos distintos (Pagos Semanales de Fichas Enviadas vs. Anomalías de Trazabilidad Logística de Fichas Pendientes con Cajas Devueltas) en un único script de Edge Function y un solo modal de configuración.

### Regla nueva
1. **Nunca mezclar flujos de dominios dispares ("No mezclar agua y aceite"):** Cada reporte automático por correo debe tener su propia Edge Function dedicada (e.g. `send-resumen-operativo-semanal` para pagos vs. `send-reporte-cajas-sin-ficha` para trazabilidad logística).
2. **Modales de configuración independientes:** Cada reporte programable debe contar con su propio modal de destinatarios, horarios y pruebas en frontend (`ConfigurarDestinatariosModal` vs. `ConfigurarReporteCajasDevueltasModal`), permitiendo a la empresa configurar diferentes destinatarios (e.g., contabilidad para pagos vs. logística/supervisión médica para anomalías de cajas).

---

## 2026-08-31 — Módulo de Conciliación de Transferencias (UX/UI y Persistencia)

### Correcciones aplicadas y Patrones Detectados
1. **Evitar Selectores Nativos `<select>` en Tablas:** Los elementos `<select>` nativos HTML en tablas o vistas de administración se despliegan sobre toda la pantalla sin opción de búsqueda, arruinando la usabilidad.
   - *Nueva regla:* Usar siempre un Modal/Buscador Flotante con input de filtrado instantáneo para seleccionar o asignar entidades de listas largas.

2. **Evitar Sub-modales Anidados:** Abrir un modal sobre otro modal (popup sobre popup) resulta confuso e incómodo.
   - *Nueva regla:* Integrar el buscador y las acciones de imputación directamente dentro del cuerpo principal del modal.

3. **Cero Scroll Horizontal Extremo:** La propiedad `whitespace-nowrap` o anchos fijos arbitrarios en tablas provocan desbordamientos laterales en monitores de 19" o portátiles.
   - *Nueva regla:* Utilizar `table-fixed w-full` con anchos porcentuales explícitos (`w-[22%]`, etc.) o tarjetas verticales apilables en móvil para garantizar 100% de ajuste visual sin barras de desplazamiento lateral.

4. **Montos Imputados Editables:** Al vincular una transferencia con cirugías, no asumir imputaciones fijas. Permitir la edición numérica libre del importe a saldar con recálculo de saldos pendientes en tiempo real.

5. **Protección de Costos IA y Borradores:** Utilizar binary hashing SHA-256 en cliente previa llamada a Edge Functions de IA para devolver resultados desde caché en <50ms a costo $0 para archivos repetidos, conservando el progreso en `localStorage` y Supabase `conciliacion_borradores`.

6. **Inputs de Archivo Disponibles en DOM:** Los elementos `<input type="file">` referenciados vía ref no deben estar dentro de condicionales `v-if` que los desmonter del DOM. Deben permanecer siempre montados en el nivel raíz del componente.

7. **Verificación de Cirugías Pagadas:** El buscador de cirugías para vincular comprobantes debe incluir la opción de consultar cirugías ya pagadas/liquidadas mediante un checkbox explícito `[ ] Incluir pagadas (verificación)` y con una insignia verde distintiva `[✓ Ya Pagada]`.
