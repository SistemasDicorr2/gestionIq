Contexto de trabajo para futuras IAs/Codex

Reglas del proyecto

  - No inventar tablas, RPCs ni flujos.
  - Marcar evidencia como confirmado por codigo, confirmado por Supabase,
    inferido o pendiente de validar.
  - No exponer valores de variables de entorno.
  - No cambiar logica productiva sin pedido explicito.
  - No tocar Supabase produccion sin backup, staging y aprobacion explicita.
  - Preservar documentacion existente en docs/informe-semanal-seguimiento.

Arquitectura esperada

Confirmado por Supabase : arquitectura server-centric. La logica critica debe
vivir en PostgreSQL mediante RPCs, vistas, triggers y RLS.
Confirmado por codigo : Vue 3 + Vite como SPA cliente, Supabase para
auth/database/RPC/storage/realtime, Edge Function para presigned URLs R2.

Que no tocar sin validar

  - RPCs de pagos y correcciones.
  - Grants EXECUTE, RLS y policies de Supabase.
  - Buckets firmas y documentos.
  - Contratos de registrar_orden_de_pago, get_todas_cirugias_pendientes,
    autenticar_y_obtener_resumen.
  - RLS/policies y roles admin.
  - Estructura de object keys R2.
  - Tabla reportes y triggers de envio/calculo.
  - Campos de pagos en reportes, pagos, ordenes_de_pago.
  - Flujo publico de ficha por token/shortlink.
Como agregar funcionalidades

1.  Buscar primero si existe RPC o vista relacionada.
2.  Si toca datos sensibles, preferir RPC server-side y validar RLS.
3.  Mantener UI Vue local al modulo, sin store global salvo necesidad real.
4.  Reusar supabase desde src/services/supabase.js.
5.  Para archivos, usar FileUpload/R2 si son evidencias o comprobantes; usar
    Supabase Storage solo si el flujo existente lo hace.
6.  Documentar cambios en docs y actualizar mapas de RPC/tablas/rutas.

Pendientes de validacion para IA
- Dump/migraciones versionadas de schema Supabase.
  - Clasificacion exhaustiva de triggers, indices, extensions y conteos/tamanos.
  - Matriz final tabla -> rol -> permiso efectivo.
  - Definiciones SQL de todas las RPCs.
  - Bucket policies de firmas, documentos y R2.
  - Estado real de deploy de Edge Functions.
  - Modulos obsoletos vs activos.

Fuente prioritaria actual

Para decisiones de seguridad usar primero:

  - docs/13_SECURITY_AUDIT_CURRENT_STATE.md
  - docs/12_CONSOLIDATED_TECHNICAL_ARCHITECTURE.md Estos documentos incorporan
    evidencia read-only de Supabase produccion y actualizan lo que antes
    figuraba como pendiente de validar.

Regla para cambios visuales recientes

  - El conciliador de transferencias (`ConciliacionTransferenciasView.vue`) cuenta con persistencia de borradores (`conciliacion_borradores`), caché SHA-256 (`conciliacion_cache_comprobantes`), asociaciones bancarias (`conciliacion_asociaciones_bancarias`), modal flotante de instrumentadores con buscador, modal de vinculación de cirugías ultracompacto con montos editables, modal de observaciones, atajos de teclado (Esc/Enter), conciliación automática en lote, exportación de resumen PDF y pestaña de historial de conciliaciones pasadas.


  - Los cambios visuales del portal del instrumentador y la Estacion de Pagos
    Rapidos deben mantenerse frontend-only salvo autorizacion explicita.
  - Supabase, RPCs, RLS, grants, policies, contratos de datos y logica
    economica se trabajan fuera del agente visual.
  - Antes de documentar o modificar estas superficies, revisar el codigo real y
    registrar si el cambio usa datos confirmados o inferencias pendientes.
