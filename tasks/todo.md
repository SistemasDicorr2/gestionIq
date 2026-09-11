# Task: Persistencia Atómica y Resiliente de Borradores de Logística

## Contexto
Solucionar pérdidas de datos de borradores en el Informe Diario de Logística producidas por condiciones de carrera al cambiar de pestaña, anti-patrón DELETE+INSERT separado, sobreescrituras por administradores en borradores ajenos y falta de recuperación desde localStorage.

## Plan
- [x] 1. Crear migración `supabase/migrations/20260910_guardar_borrador_logistica_atomico.sql` con columna `version` y RPC `guardar_borrador_informe_logistica`.
- [x] 2. Refactorizar `LogisticaNuevoInformeView.vue` para consumir la RPC transaccional atómica con detección de conflictos de versión.
- [x] 3. Implementar respaldo local instantáneo (`localStorage`) en cada mutación sin depender de hooks de salida.
- [x] 4. Implementar recuperación proactiva de borradores locales huérfanos al inicializar la vista.
- [x] 5. Implementar Modo Supervisión (Solo Lectura) para administradores que visualicen borradores ajenos, evitando autoguardados y colisiones.
- [x] 6. Configurar watcher reactivo profundo con bandera `isInitialLoading` y bloqueo de espera en `onBeforeRouteLeave`.
- [x] 7. Actualizar `docs/05_RPC_CATALOG.md` y `docs/07_DATA_FLOW_MAP.md`.

## Archivos involucrados
- `src/views/logistica/LogisticaNuevoInformeView.vue`
- `supabase/migrations/20260910_guardar_borrador_logistica_atomico.sql`
- `docs/05_RPC_CATALOG.md`
- `docs/07_DATA_FLOW_MAP.md`
- `tasks/todo.md`

## Verificación
- [x] Build de producción exitoso sin errores de sintaxis (`npm run build` OK)
- [x] Transaccionalidad garantizada en PostgreSQL ante fallos de red
- [x] Modo supervisión de administrador validado
- [x] Respetadas reglas de AGENTS.md

