Gestión IQ — Documentación Técnica Consolidada

Fecha de consolidación: 2026-05-28 Modo de trabajo: documentación y auditoría
read-only. Estado: no se modificó código ni base de datos. Ambiente relevado:
producción Supabase única, sin staging confirmado.

1. Resumen ejecutivo

Gestión IQ es una aplicación web orientada a la trazabilidad quirúrgica y
administrativa del circuito de instrumentadores. El sistema administra reportes
de cirugías, fichas digitales post cirugía, evidencias visuales,
logística/control de consumo, pagos por lote, PDFs, notificaciones,
reclamos/pedidos e instrumentadores.
La arquitectura real observada responde a un modelo server-centric : el frontend
Vue actúa como cliente de operación y visualización, mientras que la lógica
crítica se apoya en Supabase/PostgreSQL mediante tablas, vistas, triggers,
RPCs, RLS y Edge Functions. El sistema no se comporta como un CRUD simple. Tiene
flujos transaccionales relevantes, especialmente en pagos, ficha digital,
logística, evidencias y auditoría de actividad.
2. Fuentes utilizadas

Este documento se basa en:

  - Documentación técnica ya generada en /docs.
  - Relevamiento de código Vue/Vite.
  - Exportaciones CSV read-only desde Supabase.
  - Revisión de funciones RPC, grants, RLS, policies, buckets y funciones
    SECURITY DEFINER.
  - Manuales internos previos del proyecto Gestión IQ.

Criterios de evidencia

  - Confirmado por código: surge del repositorio/frontend/Edge Functions.
  - Confirmado por Supabase: surge de CSV/exportaciones/consultas read-only
    ejecutadas sobre Supabase.
  - Inferido: deducido por relación funcional entre código, tablas y flujos.
  - Pendiente de validar: requiere dump/migración/schema completo o ambiente
    staging.
3. Stack técnico confirmado

Frontend

  - Vue 3.
  - Vite.
  - Vue Router.
  - Tailwind CSS.
  - Supabase JS.
  - Vue Toastification.
  - Chart.js / vue-chartjs.
  - jsPDF, html2canvas, jspdf-autotable.
  - signature_pad.
  - date-fns.
  - xlsx / file-saver.

Backend / datos

  - Supabase Auth.
  - Supabase PostgreSQL.
  - PostgREST.
  - RPCs PostgreSQL.
  - RLS/policies.
  - Realtime.
  - Supabase Storage para firmas.
  - Cloudflare R2 para evidencias y comprobantes.
  - Supabase Edge Function b2-presigned-url.
Servicios externos

  - Cloudflare R2 para almacenamiento desacoplado.
  - Vercel inferido como hosting frontend.
  - Supabase como backend principal.

4. Filosofía arquitectónica

Gestión IQ está construido bajo una filosofía server-centric . Eso significa:

  - El frontend no debería contener reglas críticas de negocio.
  - Las operaciones transaccionales deberían resolverse en PostgreSQL/RPC.
  - Las vistas y RPCs funcionan como contratos de backend.
  - El frontend orquesta UI, formularios, navegación y experiencia operativa.
  - La seguridad real debe estar en Supabase: RLS, grants, policies,
    validaciones dentro de RPCs y control de roles.
Esta filosofía es correcta para un sistema de trazabilidad quirúrgica porque
permite:

  - consistencia de datos,
  - auditoría,
  - transacciones atómicas,
  - reducción de lógica duplicada,
  - integridad en pagos y consumos,
  - evolución hacia un ERP operacional. El riesgo principal es que, si las RPCs
    o grants quedan demasiado abiertos, el sistema puede depender excesivamente
    de la confianza en el frontend.

5. Módulos funcionales del sistema
5.1 Reportes / cirugías

El módulo de reportes es el núcleo del sistema. Objetos principales:

  - reportes
  - reportes_stats
  - short_links
  - short_link_events
  - ficha_access_events
  - pdf_generation_log Componentes/Vistas relacionados:
  - AdminView.vue
  - ReportTable.vue
  - ReportCard.vue
  - ReportDrawer.vue
  - ReportPDF.vue
  - GenerateLinkModal.vue RPCs relevantes:
  - search_reportes_avanzado
  - search_reportes_for_selector
  - create_short_link
  - expire_report_link
  - log_pdf_generation

5.2 Ficha digital

Flujo público por token o short link.
Rutas:

  - /ficha/:token
  - /f/:short_code Flujo operativo:

1.  Se recibe token o short code.
2.  Se consulta short_links o reportes.
3.  Se identifica instrumentador.
4.  Se completa ficha.
5.  Se sube firma al bucket firmas.
6.  Se actualiza reportes a estado = 'Enviado'.
7.  Se pueden subir evidencias a R2.
8.  Se registra metadata en reporte_evidencias. Tablas relacionadas:

  - reportes
  - instrumentadores
  - short_links
  - ficha_access_events
  - reporte_evidencias

5.3 Instrumentadores

Módulo para gestión, ranking, actividad y pagos por instrumentador.
Tablas:

  - instrumentadores
  - instrumentador_tokens
  - valoraciones_semanales RPCs:
  - get_instrumentadores_con_stats
  - get_instrumentador_ranking_kpis
  - get_ranking_ivo_detallado
  - generar_activity_token
  - create_instrumentador_token
  - autenticar_y_obtener_resumen
  - obtener_detalle_estadisticas_instrumentador

5.4 Evidencias visuales

El sistema desacopla archivos binarios de la base de datos. Flujo:

1.  FileUpload selecciona o captura archivos.
2.  Solicita presigned URL a b2-presigned-url.
3.  Sube archivo a Cloudflare R2.
4.  Devuelve metadata.
5.  El padre inserta metadata en reporte_evidencias o la envía a una RPC.
Tabla principal:

  - reporte_evidencias Storage:
  - Cloudflare R2 para evidencias y comprobantes.
  - Supabase Storage bucket firmas para firmas.

5.5 Logística / control de consumo

Módulo operativo para seguimiento y control físico del material.
Vistas/componentes:

  - LogisticaControl.vue
  - ConsumoView.vue
  - SurgerySelector.vue
  - LogisticaTimeline.vue Tablas/vistas:
  - logistica_controles
  - logistica_controles_con_evidencias
  - reporte_evidencias
  - reportes RPCs:
  - create_logistica_control_with_evidences
  - search_reportes_for_selector
5.6 Pagos

Módulo crítico por impacto administrativo y económico. Tablas:

  - ordenes_de_pago
  - pagos
  - reportes Vistas/componentes:
  - PagosDashboardView.vue
  - HistorialPagosView.vue
  - GestionPagosView.vue
  - CrearOrdenDePagoView.vue
  - OrdenDePagoDetalleModal.vue
  - GestionPagoModal.vue
  - herramientas de corrección de pagos. RPCs críticas:
  - registrar_orden_de_pago
  - registrar_lote_de_pago
  - obtener_cirugias_pendientes
  - get_todas_cirugias_pendientes
  - obtener_detalle_orden_pago
  - obtener_historial_ordenes_pago
  - marcar_como_pagado
  - anular_orden_de_pago
  - modificar_orden_de_pago
  - actualizar_comprobante_orden_pago
  - anular_y_recrear_pago_individual
Este módulo requiere especial cuidado porque combina montos, estados
administrativos, comprobantes, reportes y cambios transaccionales.

5.7 PDFs

Generación y registro de PDFs. Componentes/servicios:

  - ReportPDF.vue
  - ReportDrawer.vue
  - useOrdenDePagoPDF
  - pdfGenerator
  - reportGeneratorService Tabla:
  - pdf_generation_log RPC:
  - log_pdf_generation

5.8 Notificaciones

Sistema con realtime. Componentes:

  - NotificationBell.vue
  - NotificationDropdown.vue
  - NotificationsView.vue
  - AdminLayout.vue Tabla:
  - notifications RPCs:
- get_notifications
  - mark_notifications_as_read
  - get_all_notifications_paginated

5.9 Reclamos, quejas y pedidos especiales

Rutas y vistas públicas/internas para gestión de reclamos/pedidos. Tablas:

  - quejas
  - pedidos_especiales
  - firmas como storage. RPCs:
  - get_quejas
  - get_quejas_stats
  - get_medicos_con_pedidos
  - get_pedidos_y_stats_por_medico
  - delete_pedido_especial
  - search_reportes_para_pedidos

6. Base de datos: objetos principales
Tablas centrales

  - reportes
  - instrumentadores
  - instrumentador_tokens
  - ordenes_de_pago
  - pagos
  - reporte_evidencias
  - logistica_controles
  - short_links
  - short_link_events
  - ficha_access_events
  - pdf_generation_log
  - notifications
  - quejas
  - pedidos_especiales
  - incidencias
  - valoraciones_semanales

Vistas / objetos de lectura detectados

  - logistica_controles_con_evidencias
  - reportes_stats
  - v_reportes_con_ivo

Triggers detectados

  - on_ficha_enviada_create_notification
  - trigger_calculate_puntaje_iq_on_update
  - otros triggers exportados en CSV pendientes de clasificación exhaustiva.
Relaciones críticas confirmadas o inferidas

  - reportes.instrumentador_dni → instrumentadores.dni
  - reportes.pago_id → pagos.id
  - pagos.orden_de_pago_id → ordenes_de_pago.id
  - pagos.instrumentador_dni → instrumentadores.dni
  - instrumentador_tokens.instrumentador_dni → instrumentadores.dni
  - reporte_evidencias.reporte_id → reportes.id
  - logistica_controles.cirugia_id → reportes.id
  - short_links.reporte_id → reportes.id
  - pdf_generation_log.reporte_id → reportes.id
7. Arquitectura RPC

Gestión IQ usa RPCs como contratos centrales.

RPCs de reportes/ficha

  - search_reportes_avanzado
  - create_instrumentador_token
  - autenticar_y_obtener_resumen
  - create_short_link
  - expire_report_link
  - log_pdf_generation

RPCs de instrumentadores

  - get_instrumentadores_con_stats
  - get_instrumentador_ranking_kpis
  - generar_activity_token
  - obtener_detalle_estadisticas_instrumentador
  - get_ranking_ivo_detallado

RPCs de logística/evidencias

  - search_reportes_for_selector
  - create_logistica_control_with_evidences
RPCs de pagos

  - get_todas_cirugias_pendientes
  - registrar_orden_de_pago
  - registrar_lote_de_pago
  - obtener_cirugias_pendientes
  - obtener_detalle_orden_pago
  - obtener_historial_ordenes_pago
  - marcar_como_pagado
  - anular_orden_de_pago
  - modificar_orden_de_pago
  - actualizar_comprobante_orden_pago
  - anular_y_recrear_pago_individual

RPCs admin/seguridad

  - list_all_users
  - grant_admin_role

Observación técnica

Las RPCs permiten una arquitectura limpia y transaccional, pero también
concentran mucho poder. Las funciones que cambian pagos, roles, comprobantes o
reportes deben validar autorización dentro de PostgreSQL y no depender solo del
frontend.
8. Arquitectura frontend

Rutas públicas

  - /login
  - /ficha/:token
  - /f/:short_code
  - /reclamo
  - /resumen/:token

Rutas protegidas por sesión

  - /admin
  - /estadisticas
  - /instrumentadores
  - /incidencias
  - /quejas
  - /pedidos-especiales
  - /notificaciones
  - /informe-semanal-seguimiento
  - /logistica-control
  - /instrumentador-upload
  - /control-consumo

Rutas con rol admin en frontend

  - /pagos
  - /historial-pagos
  - /configuracion

Patrones detectados
- SPA con Vue Router.
  - AdminLayout como shell central.
  - Modales/drawers para detalle y edición.
  - RPCs para operaciones transaccionales o agregadas.
  - supabase.from() para CRUD simple.
  - FileUpload para archivos.
  - Realtime para notificaciones.
  - Estado principalmente local; no se detectó Pinia/Vuex como store central.

9. Flujo operacional completo

Lifecycle principal

1.  Se registra o consulta una cirugía en reportes.
2.  Se genera token o short link para ficha.
3.  El instrumentador accede a la ficha.
4.  Se identifica y completa datos post cirugía.
5.  Se sube firma.
6.  Se actualiza estado de ficha.
7.  Se cargan evidencias visuales.
8.  Logística registra control de consumo/devolución.
9.  Se generan PDFs o registros de auditoría.
10. Se liquida o agrupa en pagos.
11. Se registra comprobante.
12. Se consulta actividad del instrumentador.
13. Se mantiene historial y trazabilidad.
Valor del modelo

Este lifecycle convierte una cirugía en un expediente digital operativo, con
datos, evidencias, pagos, auditoría y documentación asociada.

10. Storage y archivos

Cloudflare R2

Usado para:

  - evidencias visuales,
  - comprobantes,
  - imágenes asociadas a logística/instrumentadores. Flujo:

1.  Frontend solicita URL firmada.
2.  Edge Function genera permiso temporal.
3.  Frontend sube directo a R2.
4.  Base de datos guarda metadata y object_key.
Supabase Storage

Buckets detectados:

  - firmas
  - documentos Ambos se detectaron como públicos en el relevamiento. Uso
    confirmado:
  - firmas para firmas de ficha/reclamos. Riesgo:
  - si el bucket público contiene firmas o datos personales, debe validarse si
    esa exposición es intencional y aceptable.

11. Deuda técnica y riesgos generales

Riesgos altos

  - No existe staging confirmado.
  - La base Supabase actual es producción.
  - RLS/policies no están versionadas como migraciones controladas.
  - Hay RPCs críticas con permisos amplios.
  - Algunos buckets son públicos.
  - Hay funciones SECURITY DEFINER sin validación interna suficiente.
  - Pagos está muy acoplada a RPCs y estructuras JSON.
Bugs detectados

  - FileUpload.vue expone reset, pero varios padres llaman .clear().
  - ConsumoView.vue usa toLocaleDateDateString, método inexistente.
  - Posibles imports faltantes en ReportDrawer.vue.
  - Logs de diagnóstico en flujos de evidencia.

Acoplamientos

  - Contratos RPC sin tipos compartidos.
  - R2 object keys usados como contrato entre Edge Function, DB y frontend.
  - Roles admin controlados en frontend mediante app_metadata.role, que debe
    tener respaldo backend.
12. Estado de madurez técnica

Fortalezas

  - Arquitectura modular.
  - Buen uso de RPCs para procesos transaccionales.
  - Separación clara de módulos.
  - Storage desacoplado con R2.
  - Buen potencial de trazabilidad.
  - Flujos operativos complejos ya modelados.

Debilidades

  - Seguridad backend todavía requiere endurecimiento.
  - Falta staging.
  - Falta versionado formal de schema/migraciones.
  - Falta tipado Supabase.
  - Falta auditoría automatizada de RLS/grants.
  - Algunas policies son demasiado amplias.

Evaluación

Gestión IQ tiene una base técnica superior a una aplicación administrativa
simple. La arquitectura permite evolucionar hacia un ERP quirúrgico/logístico
interno, pero necesita una etapa formal de estabilización: staging, backups,
migraciones, RLS, revisión de grants, tipado y tests de humo.
13. Roadmap técnico recomendado

Fase 1 — Protección

  - Crear backup/dump completo.
  - Crear proyecto Supabase staging.
  - Restaurar schema y datos de prueba.
  - Congelar cambios directos sobre producción.

Fase 2 — Seguridad

  - Auditar RLS y policies.
  - Auditar grants a anon y authenticated.
  - Auditar SECURITY DEFINER.
  - Ajustar permisos solo en staging.
  - Validar flujos públicos.

Fase 3 — Tipado y contratos

  - Generar src/types/database.ts.
  - Crear capa de servicios para RPCs.
  - Documentar contratos de entrada/salida.
Fase 4 — Calidad

  - Tests de humo:
      - login,
      - ficha,
      - subida evidencia,
      - control consumo,
      - pagos,
      - notificaciones.

Fase 5 — Evolución ERP

  - Trazabilidad completa por expediente.
  - Auditoría de eventos.
  - Reportes operativos.
  - Observabilidad.
  - Separación por roles reales.

14. Conclusión

Gestión IQ ya tiene una arquitectura funcional robusta para trazabilidad
quirúrgica, logística y pagos. El sistema está bien orientado conceptualmente:
frontend liviano, backend server-centric, RPCs para procesos críticos y storage
desacoplado.
El punto crítico no es rehacer la arquitectura, sino protegerla y formalizarla .
La prioridad técnica inmediata debería ser:

1.  staging,
2.  backup,
3.  auditoría de seguridad,
4.  versionado de Supabase,
5.  endurecimiento de RPC/RLS/grants,
6.  tipado y tests. Hasta que exista staging, cualquier cambio sobre producción
    debe tratarse como operación crítica.