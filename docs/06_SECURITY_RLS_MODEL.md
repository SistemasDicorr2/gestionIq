Modelo de seguridad y RLS

Fuente prioritaria

Este documento esta sincronizado con 13_SECURITY_AUDIT_CURRENT_STATE.md, que
resume consultas read-only/exportaciones Supabase del 2026-05-28. Para
seguridad, RLS, grants, buckets y SECURITY DEFINER, ese archivo es fuente
prioritaria.

Autenticacion

Confirmado por codigo :

  - Login con supabase.auth.signInWithPassword.
  - Logout con supabase.auth.signOut.
  - Sesion leida con supabase.auth.getSession.
  - Usuario leido con supabase.auth.getUser.
  - Reautenticacion en operaciones administrativas sensibles con
    supabase.auth.reauthenticate y validacion de password en AuthorizationModal.
Autorizacion frontend

Confirmado por codigo :

  - Rutas protegidas requieren sesion.
  - Rutas con requiredRole: 'admin': /pagos, /historial-pagos, /configuracion.
  - La verificacion usa user.app_metadata.role === 'admin'. Riesgo confirmado
    por auditoria : la autorizacion frontend no es control de seguridad
    suficiente. Las operaciones criticas deben validarse en Supabase mediante
    RLS, grants restrictivos, policies y validacion interna en RPCs.

Roles Supabase observados

Confirmado por auditoria Supabase :

  - anon
  - authenticated
  - postgres
  - service_role
  - PUBLIC
El frontend usa anon key, por lo que permisos a anon o PUBLIC deben tratarse
como superficie sensible.

Estado RLS por tabla

RLS activo

Confirmado por auditoria Supabase :

  - clientes
  - ficha_access_events
  - incidencias
  - instrumentador_tokens
  - instrumentadores
  - logistica_controles
  - materiales
  - notifications
  - ordenes_de_pago
  - pagos
  - pdf_generation_log
  - pedidos_especiales
  - quejas
  - reporte_evidencias
  - reportes
  - short_link_events
  - short_links
  - tipos_cirugia
  - valoraciones_semanales

RLS desactivado

Confirmado por auditoria Supabase :
- configuracion
  - files
  - intervenciones_clave
  - localidades
  - log_emails
  - logistica_envios
  - medicos
  - provincias
  - reporte_versiones
  - reportes_log
  - reportes_normalizados
  - sugerencias
  - transportes No toda tabla sin RLS es necesariamente critica, pero
    configuracion, files, intervenciones_clave, log_emails, medicos,
    reportes_log, reportes_normalizados y sugerencias requieren revision
    especifica.

Policies relevantes

Confirmado por auditoria Supabase :

  - clientes: lectura publica y escrituras para public.
  - materiales: lectura publica y escrituras para public.
  - tipos_cirugia: lectura publica y escritura publica.
  - instrumentadores: lectura publica, insercion publica e insert/update para
    authenticated.
  - reportes: anon puede leer reportes Pendiente o Enviado; anon puede
    actualizar reportes pendientes para pasarlos a Enviado; authenticated puede
    administrar; existe una policy publica de escritura total sobre reportes.
  - ordenes_de_pago y pagos: full access para authenticated; debe validarse rol
    admin real.
  - reporte_evidencias: anon puede insertar/select si el reporte esta Pendiente
    o Enviado; authenticated tiene full access.
  - logistica_controles: lectura para anon; authenticated full access.
Grants y EXECUTE

Confirmado por auditoria Supabase :

  - Hay grants amplios para anon y authenticated en varias tablas.
  - Grants amplios no siempre implican acceso efectivo si RLS bloquea, pero son
    criticos cuando se combinan con RLS desactivado o policies permisivas.
  - Varias RPCs tienen EXECUTE para PUBLIC, anon y/o authenticated. Riesgo
    clave:

SECURITY DEFINER

Confirmado por auditoria Supabase : funciones SECURITY DEFINER detectadas
incluyen actualizar_comprobante_orden_pago, anular_orden_de_pago,
create_instrumentador_token, create_short_link, expire_report_link,
generar_activity_token, grant_admin_role, list_all_users, log_pdf_generation,
mark_notifications_as_read, modificar_orden_de_pago,
registrar_intervencion_clave, registrar_lote_de_pago y otras.
Funciones con validacion interna aceptable en el relevamiento:

  - grant_admin_role
  - list_all_users Funciones criticas a endurecer/revisar:
  - actualizar_comprobante_orden_pago
  - registrar_lote_de_pago
  - modificar_orden_de_pago
  - anular_orden_de_pago
  - anular_y_recrear_pago_individual
  - delete_pedido_especial
  - get_notifications

Superficies publicas

Confirmado por codigo :

  - /ficha/:token busca reportes por token.
  - /f/:short_code busca short_links y luego reportes.
  - /resumen/:token llama autenticar_y_obtener_resumen y solicita DNI.
  - /reclamo inserta en quejas y sube firma a bucket firmas.
Storage

Confirmado por codigo y auditoria Supabase :

  - Bucket firmas: publico.
  - Bucket documentos: publico.
  - Cloudflare R2 para evidencias y comprobantes por presigned URL. Riesgo : si
    firmas o documentos contienen datos personales o documentos sensibles, la
    exposicion publica debe revisarse.

Recomendaciones prioritarias

1.  Crear backup y staging antes de tocar produccion.
2.  Auditar y endurecer RPCs criticas SECURITY DEFINER.
3.  Revocar EXECUTE de anon/PUBLIC donde no corresponda.
4.  Revisar policies publicas en reportes, clientes, materiales, tipos_cirugia,
    instrumentadores, logistica_controles.
5.  Validar que authenticated no admin no pueda operar pagos.
6.  Evaluar bucket privado + signed URLs para firmas/documentos sensibles.
7.  Agregar tests de seguridad para anon, authenticated no admin y admin.