Vision general del proyecto

Descripcion funcional

Confirmado por codigo : Gestion IQ es una aplicacion web Vue orientada a
administrar cirugias/reportes, fichas digitales post cirugia, instrumentadores,
evidencias, incidencias, logistica, pagos por lote, notificaciones y vistas
administrativas. Confirmado por Supabase : La documentacion
Documentacion/Documentacion 5.0/ describe una arquitectura "server-centric"
donde la logica de negocio, seguridad y consistencia residen en PostgreSQL
mediante vistas, RPCs y triggers.
Objetivo del producto

Inferido : centralizar la trazabilidad quirurgica desde la creacion de una
cirugia hasta el cierre de ficha, carga de evidencias, control logistico,
calculo operativo de rendimiento y liquidacion/pago de instrumentadores.

Usuarios y roles principales

  - Administrador interno : confirmado por codigo en rutas protegidas bajo
    AdminLayout, vistas AdminView, InstrumentadoresView, PagosDashboardView,
    ConfigView y guardas requiredRole: 'admin'.
  - Usuario autenticado interno : confirmado por codigo en el guard global de
    router que exige sesion Supabase para rutas hijas de /.
  - Instrumentador : confirmado por codigo en FichaView, FichaForm,
    SubmissionSuccess y ActivitySummaryView.
  - Medico/reclamante externo : inferido por ReclamoView, QuejasView,
    PedidosEspecialesView y componentes bajo components/reclamos.
  - Service role/backend privilegiado : confirmado por auditoria Supabase como
    rol existente. No se detecto uso en frontend ni Edge Function local.
Modulos detectados

  - Reportes/cirugias: confirmado por codigo.
  - Ficha digital post cirugia: confirmado por codigo.
  - Instrumentadores y ranking IVO/KPI: confirmado por codigo y Supabase.
  - Evidencias visuales en Cloudflare R2: confirmado por codigo.
  - Logistica/control de consumo: confirmado por codigo.
  - Pagos por lote y ordenes de pago: confirmado por codigo y Supabase.
  - PDFs y logs de generacion: confirmado por codigo.
  - Notificaciones realtime: confirmado por codigo.
  - Incidencias e intervenciones clave: confirmado por codigo y Supabase.
  - Reclamos, quejas y pedidos especiales: confirmado por codigo.
  - Informe semanal de seguimiento: confirmado por codigo y documentacion
    existente.
  - Configuracion/admin de usuarios: confirmado por codigo, metadata exacta
    pendiente de validar.
Ambiente operativo

Confirmado por auditoria Supabase : el relevamiento actual identifica una unica
produccion Supabase y no confirma staging. Cualquier cambio de RLS, grants,
RPCs, buckets o datos productivos debe tratarse como operacion critica hasta
contar con backup y entorno staging.

Modulos posiblemente obsoletos o duplicados

  - src/views/admin/CrearOrdenDePagoView.vue y
    src/views/admin/GestionPagosView.vue conviven con PagosDashboardView.vue.
    Inferido : pueden representar flujos anteriores o alternativos de pagos.
  - src/components/NotificationsView.vue y src/views/NotificationsView.vue
    tienen nombres solapados. Pendiente de validar si ambos estan activos.
  - Documentacion/*.txt contiene copias de componentes y versiones previas.
    Inferido : es archivo historico, no fuente ejecutable.
  - src/HomeView.vue existe pero no aparece en rutas activas. Pendiente de
    validar si esta obsoleto.
  - src/components/report-details/PhotosGallery.vue contiene TODOs de
    subida/borrado. Confirmado por codigo .