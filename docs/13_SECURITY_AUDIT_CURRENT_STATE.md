Gestión IQ — Auditoría de Seguridad y Estado Actual

Fecha del relevamiento: 2026-05-28 12:53:54 UTC Documento generado: 2026-05-28
Modo de trabajo: read-only. Ambiente: Supabase producción única. Acciones
realizadas: consultas de lectura, exportación CSV y análisis. Acciones NO
realizadas: no se modificó base de datos, no se modificaron policies, no se
modificaron grants, no se ejecutaron migraciones.

1. Contexto

Gestión IQ actualmente trabaja con una sola base Supabase, usada como
producción. Esto es funcional para una etapa inicial, pero representa un riesgo
operativo porque cualquier cambio mal aplicado puede afectar directamente datos
reales, pagos, fichas, evidencias o reportes.
Por este motivo, toda la auditoría se realizó en modo read-only . Este documento
registra el estado de seguridad observado en la fecha indicada. No es una
certificación final ni una prueba de intrusión; es una auditoría técnica inicial
basada en metadata real exportada desde Supabase y revisión de
documentación/código.

2. Resumen ejecutivo de seguridad

La seguridad actual se encuentra en un estado parcialmente maduro .

Fortalezas
- Existe uso de Supabase Auth.
  - Existen rutas protegidas por sesión en el frontend.
  - Algunas rutas requieren rol admin por app_metadata.role.
  - Varias tablas tienen RLS activo.
  - Algunas funciones sensibles como grant_admin_role y list_all_users validan
    usuario superadministrador por email.
  - El sistema usa RPCs para encapsular lógica crítica.
  - El flujo de R2 usa presigned URLs y no sube binarios directamente a la DB.

Riesgos principales

  - No hay staging.
  - Existen grants amplios para anon y authenticated.
  - Existen policies públicas muy permisivas en algunas tablas.
  - Varias funciones RPC críticas tienen EXECUTE para anon y authenticated.
  - Algunas funciones SECURITY DEFINER críticas no validan usuario/rol
    internamente.
  - Existen buckets públicos (firmas, documentos).
  - Hay tablas con RLS desactivado.
  - Parte de la seguridad depende de que el frontend no exponga operaciones
    sensibles.
3. Modelo de autenticación

Confirmado por código

  - Login con supabase.auth.signInWithPassword.
  - Logout con supabase.auth.signOut.
  - Sesión leída con supabase.auth.getSession.
  - Usuario leído con supabase.auth.getUser.
  - Rutas protegidas por guard global.
  - Algunas rutas admin verifican user.app_metadata.role === 'admin'.

Rutas protegidas por rol admin en frontend

  - /pagos
  - /historial-pagos
  - /configuracion

Riesgo

La autorización frontend es útil para UX, pero no es suficiente como control de
seguridad . Toda operación crítica debe estar protegida en Supabase mediante:
- RLS,
  - policies,
  - grants restrictivos,
  - validaciones dentro de RPCs,
  - control de rol/usuario en backend.

4. Roles Supabase observados

Roles relevantes detectados o inferidos:

  - anon
  - authenticated
  - postgres
  - service_role
  - PUBLIC El frontend usa la anon key, por lo que cualquier permiso concedido a
    anon o PUBLIC debe tratarse con extremo cuidado.
5. Estado RLS por tabla

RLS activo

Tablas con RLS activo en el relevamiento:

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

Tablas con RLS desactivado en el relevamiento:

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
  - transportes
Evaluación

No toda tabla sin RLS es necesariamente crítica. Algunas pueden ser catálogos o
tablas auxiliares. Sin embargo, tablas como configuracion, files,
intervenciones_clave, log_emails, medicos, reportes_log, reportes_normalizados y
sugerencias requieren revisión específica porque podrían contener información
operativa o sensible.

6. Policies detectadas

Policies públicas o amplias relevantes

clientes

Policies detectadas:
- lectura pública.
  - todas las operaciones de escritura para public. Riesgo:
  - exposición o modificación amplia si la tabla contiene datos reales de
    clientes.

materiales

Policies detectadas:

  - lectura pública.
  - todas las operaciones de escritura para public. Riesgo:
  - modificación de catálogo/materiales si no se restringe adecuadamente.

tipos_cirugia

Policies detectadas:

  - lectura pública.
  - escritura pública. Riesgo:
  - alteración de catálogos operativos.

instrumentadores

Policies detectadas:

  - lectura pública.
  - inserción pública.
  - inserción/update para authenticated.
Riesgo:

  - la lectura pública de instrumentadores puede exponer datos personales si la
    tabla contiene DNI, teléfono, CBU, alias bancario u otros datos sensibles.

reportes

Policies detectadas:

  - anon puede leer reportes con estado Pendiente o Enviado.
  - anon puede actualizar reportes pendientes para pasarlos a Enviado.
  - authenticated puede administrar.
  - existe además una policy pública de escritura total: Permitir todas las
    operaciones de escritura en reportes. Riesgo:
  - la policy pública de escritura total sobre reportes es una alerta crítica y
    debe revisarse. Puede ser una policy heredada o accidental.
ordenes_de_pago y pagos

Policies detectadas:

  - full access para authenticated.
  - roles = {public} con with_check basado en auth.role() = 'authenticated'.
    Riesgo:
  - el acceso para usuarios autenticados debe validarse contra rol real de
    administrador. No todo usuario autenticado debería tener acceso completo a
    pagos.

reporte_evidencias

Policies detectadas:

  - anon puede insertar y seleccionar evidencias si el reporte está en estado
    Pendiente o Enviado.
  - authenticated tiene full access. Riesgo:
  - tiene sentido para el flujo público de ficha, pero requiere controles
    adicionales sobre tamaño, tipo, ownership, abuso de storage y visibilidad.
logistica_controles

Policies detectadas:

  - anon tiene lectura.
  - authenticated tiene full access. Riesgo:
  - leer logística desde anon puede exponer estado operativo interno si la tabla
    contiene observaciones, fechas, instituciones o detalles de control.

7. Grants detectados

Grants sobre tablas

Se detectaron grants amplios para anon y authenticated en tablas como:

  - clientes
  - configuracion
  - ficha_access_events
  - files
  - incidencias
  - instrumentador_tokens
  - instrumentadores
  - instrumentadores_stats
En varios casos aparecen privilegios como:

  - SELECT
  - INSERT
  - UPDATE
  - DELETE
  - TRUNCATE
  - REFERENCES
  - TRIGGER

Interpretación

En Supabase, grants amplios no siempre implican acceso efectivo si RLS está bien
configurado. Pero si una tabla no tiene RLS activo, esos grants pueden
representar exposición real.

Riesgo prioritario

Cruzar: o:

8. Routine privileges / EXECUTE sobre RPC

Se detectó que varias funciones tienen EXECUTE para:
- PUBLIC
  - anon
  - authenticated
  - postgres
  - service_role RPCs con EXECUTE amplio incluyen:
  - actualizar_comprobante_orden_pago
  - add_sugerencias_batch
  - anular_orden_de_pago
  - anular_y_recrear_pago_individual
  - autenticar_y_obtener_resumen
  - calculate_puntaje_iq
  - create_instrumentador_token
  - create_logistica_control_with_evidences
  - create_short_link
  - delete_pedido_especial
  - expire_report_link
  - generar_activity_token
  - get_all_notifications_paginated
  - get_instrumentador_activity
  - get_instrumentador_ranking_kpis
  - get_instrumentadores_con_stats
  - get_medicos_con_pedidos
  - get_notifications
  - get_pedidos_especiales
  - get_pedidos_y_stats_por_medico
Riesgo

El riesgo no es solo que una función tenga EXECUTE; el riesgo real aparece
cuando combina:

9. Funciones SECURITY DEFINER detectadas

Funciones SECURITY DEFINER detectadas:

  - actualizar_comprobante_orden_pago
  - add_sugerencias_batch
  - anular_orden_de_pago
  - create_instrumentador_token
  - create_short_link
  - expire_report_link
  - generar_activity_token
  - get_instrumentador_ranking_kpis
  - grant_admin_role
  - handle_new_notification_on_ficha_enviada
  - list_all_users
  - log_pdf_generation
  - mark_notifications_as_read
  - modificar_orden_de_pago
  - registrar_intervencion_clave
  - registrar_lote_de_pago
  - trigger_create_notification_on_ficha_enviada
Funciones con validación interna aceptable

grant_admin_role

Valida usuario actual mediante auth.uid() y verifica email en
auth.users.raw_app_meta_data contra: Evaluación:

  - Correcto para etapa actual.
  - Mejorable a futuro con lista de superadmins/claim dedicado.

list_all_users

También valida email superadmin antes de retornar usuarios. Evaluación:

  - Correcto para etapa actual.
  - Recomendable mejorar a claim/rol formal en backend.

Funciones críticas con riesgo alto

actualizar_comprobante_orden_pago

Hace UPDATE sobre ordenes_de_pago.comprobante_object_key.
Riesgo observado:

  - No se observó validación auth.uid().
  - No se observó validación de rol admin.
  - No se observó auditoría. Impacto potencial:
  - modificación de comprobantes de órdenes de pago.

registrar_lote_de_pago

Hace INSERT en pagos y UPDATE en reportes para marcar como pagado. Riesgo
observado:

  - No se observó validación auth/rol.
  - Cambia estados económicos.
  - Vincula reportes a pagos. Impacto potencial:
  - registro indebido de pagos o alteración de estado de cirugías.

modificar_orden_de_pago

Modifica montos, recalcula pagos y actualiza notas.
Riesgo observado:

  - Tiene validación de consistencia de orden/anulada.
  - No se observó validación de usuario/rol. Impacto potencial:
  - modificación de montos de órdenes.

anular_orden_de_pago

Función crítica por su nombre y rol operativo. Riesgo observado:

  - Debe considerarse crítica hasta validar completamente su código.
  - Si no valida auth/rol, puede revertir o anular operaciones administrativas
    reales.

anular_y_recrear_pago_individual

Función crítica por su impacto sobre pagos. Riesgo:

  - requiere revisión de validaciones internas y grants.
10. Buckets de Storage

Buckets detectados: | Bucket | Público | | ------ | ------ | | firmas | Sí | |
documentos | Sí |

Evaluación

El bucket firmas es sensible porque puede contener firmas digitales asociadas a
fichas o reclamos. Si es público, cualquier URL correctamente construida puede
exponer el recurso. No se afirma que exista explotación. Sí se identifica como
superficie de riesgo.

Recomendación

  - Validar si la exposición pública es intencional.
  - Evaluar URLs firmadas para firmas sensibles.
  - Separar firmas públicas de documentación privada.
  - Definir lifecycle/retención.
11. Edge Function b2-presigned-url

Confirmado

  - Edge Function para generar presigned URLs hacia Cloudflare R2.
  - CORS configurado con Access-Control-Allow-Origin: *.
  - Usa variables server para credenciales R2.

Riesgo

CORS abierto no es automáticamente crítico si:

  - el endpoint valida bien,
  - las URLs son de corta duración,
  - no permite object keys arbitrarias peligrosas,
  - hay control de tipo/tamaño/área. Pero amplía superficie de abuso si se
    combina con:
- falta de JWT,
  - falta de validación de área,
  - grants amplios,
  - bucket público,
  - endpoint invocable desde cualquier origen.

12. Riesgos críticos actuales

12.1 Producción única sin staging

Riesgo:

  - cualquier cambio mal aplicado afecta datos reales. Prioridad:
  - crítica. Acción recomendada:
  - crear staging antes de tocar RLS/grants/RPCs.

12.2 RPCs administrativas con EXECUTE amplio

Riesgo:

  - funciones sensibles pueden ser invocadas fuera del frontend si no validan
    auth internamente.
Prioridad:

  - crítica para pagos/admin.

12.3 SECURITY DEFINER sin auth interna

Riesgo:

  - las funciones se ejecutan con privilegios del owner. Prioridad:
  - crítica para pagos y comprobantes.

12.4 Policies públicas permisivas

Riesgo:

  - escritura pública sobre catálogos/reportes/clientes/materiales/tipos si no
    está justificada. Prioridad:
  - alta.

12.5 Buckets públicos

Riesgo:

  - exposición de firmas/documentos. Prioridad:
  - alta si contienen datos personales.
13. Riesgos moderados

  - Notificaciones con políticas duplicadas o solapadas.
  - Logística legible por anon.
  - Instrumentadores públicamente visibles.
  - Contratos RPC sin tipado.
  - Roles admin validados en frontend.
  - Logs de diagnóstico en producción.
  - Falta de auditoría formal en cambios de pago.

14. Riesgos bajos / mejoras futuras

  - Normalizar nombres de policies.
  - Eliminar policies duplicadas.
  - Documentar ownership de tablas.
  - Generar matriz tabla → rol → permiso.
  - Crear pruebas de seguridad automatizadas.
  - Agregar monitoreo de errores RPC.
  - Agregar auditoría de cambios críticos.
15. Lo que NO debe hacerse todavía

Hasta tener backup y staging, NO hacer directamente en producción:

  - ALTER TABLE
  - DROP
  - DELETE masivo
  - UPDATE masivo
  - REVOKE directo
  - GRANT directo
  - CREATE POLICY/DROP POLICY
  - modificar RPCs críticas
  - cambiar RLS de tablas centrales
  - cambiar buckets públicos a privados sin probar frontend
  - tocar flujos de pagos sin entorno de prueba
16. Plan recomendado de endurecimiento

Fase 0 — Congelamiento preventivo

  - Trabajar solo read-only.
  - Documentar todo cambio propuesto.
  - No ejecutar migraciones sin revisión.

Fase 1 — Backup

  - Exportar schema.
  - Exportar datos críticos.
  - Descargar dump externo.
  - Guardar versión fechada.

Fase 2 — Staging

  - Crear segundo proyecto Supabase.
  - Restaurar schema.
  - Usar datos anonimizados o subconjunto.
  - Conectar una rama frontend a staging.

Fase 3 — Auditoría en staging

  - Probar cambios de RLS.
  - Probar revokes.
  - Probar funciones críticas.
  - Ejecutar flujo completo de ficha, evidencia, logística y pagos.
Fase 4 — Hardening RPC

Agregar validaciones internas a RPCs críticas:

  - auth.uid() no nulo.
  - rol admin real.
  - autorización por claim/backend.
  - validación de parámetros.
  - auditoría de cambios. Funciones prioritarias:
  - actualizar_comprobante_orden_pago
  - registrar_lote_de_pago
  - modificar_orden_de_pago
  - anular_orden_de_pago
  - anular_y_recrear_pago_individual
  - delete_pedido_especial
  - get_notifications

Fase 5 — Ajuste de grants

  - Revocar EXECUTE de anon donde no corresponda.
  - Evitar PUBLIC EXECUTE en RPCs sensibles.
  - Mantener públicas solo las RPCs necesarias para flujos públicos.
Fase 6 — Ajuste de RLS/policies

  - Eliminar policies públicas innecesarias.
  - Reemplazar true por condiciones específicas.
  - Validar acceso por rol.
  - Separar flujo público de ficha de flujo admin.

Fase 7 — Storage

  - Revisar bucket firmas.
  - Evaluar bucket privado + signed URLs.
  - Separar documentos públicos y privados.

Fase 8 — Testing

Tests mínimos:

  - usuario anon no puede modificar pagos.
  - usuario anon no puede modificar catálogos internos.
  - usuario authenticated no admin no puede anular pagos.
  - admin sí puede operar pagos.
  - ficha pública sigue funcionando.
  - carga de evidencias sigue funcionando.
  - portal instrumentador sigue funcionando.
17. Priorización recomendada

Prioridad crítica

1.  Backup.
2.  Staging.
3.  RPCs de pagos SECURITY DEFINER.
4.  Grants EXECUTE para anon/PUBLIC.
5.  Policies públicas sobre reportes, clientes, materiales, tipos_cirugia.

Prioridad alta

1.  Buckets públicos.
2.  RLS en tablas sin protección.
3.  Logística visible por anon.
4.  Instrumentadores visibles públicamente.

Prioridad media

1.  Tipado Supabase.
2.  Tests de humo.
3.  Auditoría de logs.
4.  Limpieza de policies duplicadas.
18. Conclusión

La seguridad de Gestión IQ no está ausente, pero todavía no está endurecida al
nivel que requiere un sistema operativo con pagos, fichas, evidencias, firmas y
datos personales. El hallazgo más importante es que el sistema tiene buena
arquitectura de base, pero conserva permisos amplios típicos de una etapa de
desarrollo acelerada. No hay evidencia en este relevamiento de daño, intrusión o
explotación. Lo que sí existe es una superficie de riesgo concreta que debe ser
reducida antes de escalar más el sistema.
La decisión correcta es no tocar producción directamente. El camino seguro es:

1.  backup,
2.  staging,
3.  pruebas,
4.  hardening en staging,
5.  migración controlada,
6.  validación funcional completa. Hasta entonces, toda intervención sobre
    Supabase producción debe tratarse como operación crítica.