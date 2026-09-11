# Task: Pestaña de Trazabilidad Logística (Cajas Devueltas sin Ficha) y Reporte Automatizado por Email

## Contexto
Implementar en el Resumen Operativo una nueva pestaña para cirugías en estado Pendiente que cuentan con entrega/retiro de cajas y control de devolución completado, pero no tienen ficha digital finalizada ni técnico identificado. Integrar la visualización de evidencias de remitos y automatizar la inclusión de estas anomalías en el correo semanal.

## Plan
- [x] 1. Enriquecer la consulta de `fetchReportes` en `ResumenOperativoView.vue` para cruzar con `logistica_controles_con_evidencias` y `logistica_informe_movimientos`.
- [x] 2. Añadir la 3ra pestaña segmentada "📦 Cajas Devueltas sin Ficha / Técnico" con contador dinámico y alerta en `ResumenOperativoView.vue`.
- [x] 3. Diseñar la tabla y acciones operativas de la 3ra pestaña (Visor lightbox de fotos de remitos, asignación de técnico, marcado "Solo Entrega / Sin Técnico", exportación PDF).
- [x] 4. Actualizar la Edge Function `send-resumen-operativo-semanal` para consultar y renderizar la sección destacada de cirugías con devolución de cajas sin ficha.
- [x] 5. Actualizar el modal `ConfigurarDestinatariosModal.vue` para reflejar la previsualización del nuevo bloque de reporte y pruebas.
- [x] 6. Ejecutar verificación de build (`npm run build` exitoso sin errores).

## Archivos involucrados
- `src/views/admin/ResumenOperativoView.vue`
- `src/components/admin/ConfigurarDestinatariosModal.vue`
- `supabase/functions/send-resumen-operativo-semanal/index.ts`
- `tasks/todo.md`

## Verificación
- [x] Build limpio (`npm run build` exitoso en 35s)
- [x] Cruce de datos seguro entre `reportes` y `logistica_controles_con_evidencias`
- [x] No se modificaron RPCs críticas ni contratos backend existentes
- [x] Respetadas reglas de AGENTS.md

## Resultado
Implementación completada con éxito. La nueva pestaña permite identificar y regularizar inmediatamente cirugías con ciclo logístico cerrado pero sin ficha, y el sistema de email automático incluye esta auditoría ejecutiva semanalmente.
