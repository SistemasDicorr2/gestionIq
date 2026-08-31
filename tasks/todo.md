# Task: Evolución y Optimización UX/UI del Módulo de Conciliación de Transferencias

## Contexto
Implementar persistencia de borradores, caché SHA-256 de comprobantes, buscador flotante de instrumentadores, modal de vinculación ultracompacto con montos editables en tiempo real, notas de observaciones internas, auto-confirmación en lote, atajos de teclado, resumen de cierre en PDF y pestaña de historial de conciliaciones pasadas.

## Plan
- [x] 1. Crear tablas en Supabase (`conciliacion_cache_comprobantes` y `conciliacion_borradores`).
- [x] 2. Implementar binary hashing SHA-256 para comprobantes duplicados (0 costo IA).
- [x] 3. Implementar autoguardado de borrador en `localStorage` y Supabase con banner de recuperación.
- [x] 4. Parser robusto de Planilla ERP Excel con detección dinámica de encabezados y filtrado de footers.
- [x] 5. Modal flotante de selección de instrumentadores con buscador en tiempo real.
- [x] 6. Modal de vinculación de cirugías ultracompacto con montos editables en tiempo real y saldos dinámicos.
- [x] 7. Modal de observaciones internas y registro de saldo pendiente interno.
- [x] 8. Auto-confirmación en lote `⚡ Conciliar N automáticos listos`.
- [x] 9. Atajos globales de teclado (`Esc` para cerrar modales, `Enter` para vincular cirugía).
- [x] 10. Tarjeta de resumen de cierre de lote con exportación de reporte PDF.
- [x] 11. Pestaña `📜 Historial Efectuados` consumiendo `obtener_historial_ordenes_pago` con descarga PDF individual.

## Archivos involucrados
- `src/views/admin/ConciliacionTransferenciasView.vue`
- `supabase/migrations/2026083101_conciliacion_cache_borradores.sql`
- `docs/07_DATA_FLOW_MAP.md`
- `docs/11_AI_WORKING_CONTEXT.md`

## Verificación
- [x] Build de producción exitoso sin advertencias de sintaxis (`npm run build` OK)
- [x] Cero scroll horizontal en escritorio y vista móvil adaptada
- [x] Respetadas reglas de AGENTS.md
