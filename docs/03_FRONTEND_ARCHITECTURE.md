Arquitectura frontend

Estructura principal

Confirmado por codigo :

  - src/main.js: inicializa Vue, router, vue-sonner CSS y Tailwind.
  - src/App.vue: contiene router-view y Toaster de vue-sonner (expand=true, position=top-right, richColors).
  - src/router/index.js: define rutas publicas y protegidas.
  - src/layouts/AdminLayout.vue: layout de administracion, UtilBar ultra-compacta (40px, toggle sidebar a la izquierda, notificaciones + CTA Nueva Cirugia a la derecha), sidebar colapsable (228px <-> 64px), notificaciones realtime con sonido sintetizado Web Audio API ("pop-pop").
  - src/components/Sidebar.vue: menu lateral colapsable con tooltips Reka UI, acoplamiento de submenús en "Otras Opciones" (Incidencias, Área Médicos, Carga de Archivos/Control Devolución).
  - src/components/ReportTable.vue: tabla de cirugías optimizada sin columna de checkboxes para maximizar el ancho de lectura de Paciente/Médico.
  - src/views/: pantallas de negocio.
  - src/components/: componentes reutilizables y modales.
  - src/composables/useToasts.js: adaptador universal invocable de vue-sonner con colores semanticos explícitos (verde éxito, rojo error, cian info, ámbar advertencia) y duraciones ampliadas (5s-8s) sin apilamiento.
  - src/services/: cliente Supabase y servicios auxiliares.
  - src/directives/: directiva autosize.
Router

Confirmado por codigo :

  - Publicas: /login, /ficha/:token, /f/:short_code, /reclamo, /resumen/:token.
  - Protegidas bajo /: /admin, /estadisticas, /instrumentadores, /incidencias,
    /quejas, /pedidos-especiales, /notificaciones, /informe-semanal-seguimiento,
    /logistica-control, /instrumentador-upload, /control-consumo, /pagos,
    /historial-pagos, /configuracion.
  - Guarda global: supabase.auth.getSession().
  - Control admin: to.meta.requiredRole contra user.app_metadata?.role.

Vistas principales

  - AdminView.vue: panel de cirugias/reportes, filtros, exportaciones PDF y
    drawer.
  - FichaView.vue: validacion de token/shortlink y orquestacion de ficha
    digital.
  - ActivitySummaryView.vue: portal de actividad/pagos para instrumentador via
    token + DNI.
  - InstrumentadoresView.vue: lista, ranking, exportacion XLS y links
    permanentes.
  - IncidenciasView.vue: gestion de incidencias.
  - StatsView.vue: estadisticas desde reportes_stats.
  - LogisticaControl.vue y ConsumoView.vue: operaciones logisticas/control de
    consumo.
  - PagosDashboardView.vue, HistorialPagosView.vue, GestionPagosView.vue,
    CrearOrdenDePagoView.vue: pagos.
  - ReclamoView.vue, QuejasView.vue, PedidosEspecialesView.vue:
    reclamos/pedidos.
  - InformeSemanalSeguimientoView.vue: armador de informe semanal.
  - ConfigView.vue: administracion de usuarios/roles por RPC.
Componentes reutilizables destacados

  - Tablas/tarjetas: ReportTable, ReportCard, StatCard, SkeletonLoader.
  - Modales: NewSurgeryModal, GenerateLinkModal, ReporteModal, SignatureModal,
    modales admin/pagos.
  - Ficha: FichaForm, IdentificationWizard, FormStepQuestionnaire,
    FormStepComments, FormStepSignature, SubmissionSuccess.
  - Evidencias: FileUpload, EvidenceViewer, PhotosGallery, PhotoCard,
    PhotoUploader, WebcamCapture.
  - Pagos: PaymentDetailModal, PostPagoModal, OrdenDePagoDetalleModal,
    GestionPagoModal.
  - Instrumentadores: filtros, ranking, edicion, importacion y estadisticas.
  - Notificaciones: NotificationBell, NotificationDropdown.
Composables y servicios

  - useToasts: wrapper de toasts.
  - useAuthorization: pendiente de validar detalle funcional.
  - useDarkMode, useDeviceDetection.
  - useOrdenDePagoPDF: generacion PDF de ordenes.
  - fichaAccessEvents: auditoria de accesos a ficha.
  - shortLinks: creacion/auditoria de short links.
  - pdfGenerator, reportGeneratorService: generacion de reportes; pendiente de
    validar cobertura completa.

Stores

No se detecto Pinia/Vuex ni stores dedicados. Confirmado por codigo : el estado
vive en componentes, refs/reactive, sessionStorage/localStorage y Supabase.
Patrones detectados

  - Arquitectura SPA con rutas publicas/protegidas.
  - Modales y drawers para edicion y detalle.
  - RPCs para operaciones transaccionales o agregadas.
  - Acceso directo from() para CRUD simple.
  - Presigned URLs hacia R2 para archivos pesados.
  - Realtime para notificaciones.
  - Uso de inject/provide para header dinamico del layout admin.

Notas frontend recientes

Confirmado por codigo :

  - El portal del instrumentador en ActivitySummaryView.vue usa tabs Resumen,
    Pagos y Comprobantes, Mi Perfil y Preguntas Frecuentes.
  - MyDataSection.vue concentra la visualizacion de Mi Perfil, KPIs de
    actividad y datos personales/pago.
  - PagosDashboardView.vue incorpora KPIs operativos frontend-only para la
    Estacion de Pagos Rapidos.
  - Estos cambios son de presentacion y filtrado local; no agregan nuevas
    consultas ni cambian contratos backend.
