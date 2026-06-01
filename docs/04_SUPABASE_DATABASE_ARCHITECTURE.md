Arquitectura de base de datos Supabase

Fuentes disponibles

  - Confirmado por Supabase : DDL en Documentacion/reportes.txt,
    instrumentadores esquema.txt, instrumentadores tokens.txt, Pagos sql.txt,
    orden_de_pago.txt.
  - Confirmado por Supabase : contexto verificado en
    Documentacion/Documentacion 5.0/.
  - Confirmado por Supabase : exportaciones CSV/consultas read-only resumidas en
    docs/12_CONSOLIDATED_TECHNICAL_ARCHITECTURE.md y
    docs/13_SECURITY_AUDIT_CURRENT_STATE.md.
  - Confirmado por codigo : tablas/vistas llamadas desde src.
  - Pendiente de validar : dump/migraciones versionadas completas, DDL de todos
    los objetos, indices completos, extensiones y conteos/tamanos.
Tablas con DDL disponible

instrumentadores

Confirmado por Supabase :

  - PK: dni.
  - Columnas: dni, nombre_completo, created_at, alias, telefono, lugar_trabajo,
    cuil, puntos_manuales, cbu, alias_bancario, banco, activity_token.
  - Unique: activity_token.

instrumentador_tokens

Confirmado por Supabase :

  - PK: id.
  - Unique: token.
  - FK: instrumentador_dni -> instrumentadores.dni con ON DELETE CASCADE.

reportes

Confirmado por Supabase :

  - PK: id.
  - Unique: id_cirugia, token.
  - FK: instrumentador_dni -> instrumentadores.dni.
  - FK: pago_id -> pagos.id.
  - Checks: ratings 1..5, estado en Pendiente, Enviado, Expirado, estado_pago en
    Pendiente, Pagado.
  - Triggers: on_ficha_enviada_create_notification,
    trigger_calculate_puntaje_iq_on_update.
pagos

Confirmado por Supabase :

  - PK: id.
  - FK: instrumentador_dni -> instrumentadores.dni.
  - FK: orden_de_pago_id -> ordenes_de_pago.id.

ordenes_de_pago

Confirmado por Supabase :

  - PK: id.
  - Columnas: created_at, monto_total_general, fecha_emision,
    comprobante_object_key, notas.

Tablas/vistas detectadas por uso de frontend

Confirmado por codigo :

  - ficha_access_events
  - incidencias
  - instrumentadores
  - intervenciones_clave
  - logistica_controles
  - logistica_controles_con_evidencias
  - pagos
  - pdf_generation_log
  - pedidos_especiales
  - quejas
  - reporte_evidencias
  - reportes
  - reportes_stats
  - short_link_events
  - short_links
  - valoraciones_semanales
Pendiente de validar : DDL completo de todas las tablas anteriores excepto las
cinco con DDL local. Confirmado por auditoria Supabase adicional :

  - clientes
  - configuracion
  - files
  - localidades
  - log_emails
  - logistica_envios
  - materiales
  - medicos
  - provincias
  - reporte_versiones
  - reportes_log
  - reportes_normalizados
  - sugerencias
  - tipos_cirugia
  - transportes

Vistas

  - v_reportes_con_ivo: confirmado por Supabase en documentacion v5.0 como
    calculadora central del IVO.
  - logistica_controles_con_evidencias: confirmado por codigo como vista o tabla
    consultada.
  - reportes_stats: confirmado por codigo como vista o tabla consultada.
DDL de vistas: pendiente de validar.

Triggers

Confirmado por Supabase :

  - on_ficha_enviada_create_notification sobre reportes, al pasar estado a
    Enviado, ejecuta handle_new_notification_on_ficha_enviada().
  - trigger_calculate_puntaje_iq_on_update sobre reportes, antes de update a
    Enviado, ejecuta calculate_puntaje_iq(). Otros triggers fueron exportados en
    CSV, pero quedan pendientes de clasificacion exhaustiva.

Indices

Confirmado por Supabase : indices implicitos por PK/unique/FK en DDL disponible.
Indices adicionales: pendiente de validar.
RLS observado

Confirmado por auditoria Supabase :

  - RLS activo: clientes, ficha_access_events, incidencias,
    instrumentador_tokens, instrumentadores, logistica_controles, materiales,
    notifications, ordenes_de_pago, pagos, pdf_generation_log,
    pedidos_especiales, quejas, reporte_evidencias, reportes, short_link_events,
    short_links, tipos_cirugia, valoraciones_semanales.
  - RLS desactivado: configuracion, files, intervenciones_clave, localidades,
    log_emails, logistica_envios, medicos, provincias, reporte_versiones,
    reportes_log, reportes_normalizados, sugerencias, transportes.
Enums, extensions, publicaciones realtime, conteo y tamano

  - Enums: pendiente de validar.
  - Extensions: pendiente de validar.
  - Publicaciones realtime: el codigo se suscribe a public:notifications;
    configuracion completa pendiente.
  - Conteo y tamano de tablas: pendiente de validar.