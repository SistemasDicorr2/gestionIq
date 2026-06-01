Mapa de modulos

Reportes

  - Vistas: AdminView, FichaView, StatsView, InformeSemanalSeguimientoView.
  - Componentes: ReportTable, ReportCard, ReportDrawer, ReportPDF, FilterBar,
    GenerateLinkModal.
  - Tablas/vistas: reportes, reportes_stats, short_links, short_link_events,
    ficha_access_events, pdf_generation_log.
  - RPCs: search_reportes_avanzado, search_reportes_for_selector,
    log_pdf_generation, create_short_link, expire_report_link.

Instrumentadores

  - Vistas: InstrumentadoresView, ActivitySummaryView, InstrumentadorUpload.
  - Componentes: EditInstrumentadorModal, NewInstrumentadorModal,
    ImportInstrumentadoresModal, EstadisticasInstrumentadorModal,
    InstrumentadoresFilters, InstrumentadoresRanking, MyDataSection.
  - Tablas: instrumentadores, instrumentador_tokens, valoraciones_semanales.
  - RPCs: get_instrumentadores_con_stats, get_instrumentador_ranking_kpis,
    get_ranking_ivo_detallado, generar_activity_token,
    create_instrumentador_token, autenticar_y_obtener_resumen,
    obtener_detalle_estadisticas_instrumentador, obtener_galeria_archivos.
Evidencias

  - Componentes: FileUpload, EvidenceViewer, PhotosGallery, PhotoCard,
    PhotoUploader, WebcamCapture, ArchivoCard.
  - Tablas: reporte_evidencias.
  - Edge Function: b2-presigned-url.
  - Storage: Cloudflare R2, Supabase bucket firmas.

Logistica

  - Vistas: LogisticaControl, ConsumoView.
  - Componentes: LogisticaTimeline, SurgerySelector.
  - Tablas/vistas: logistica_controles, logistica_controles_con_evidencias.
  - RPCs: create_logistica_control_with_evidences, search_reportes_for_selector.

Pagos

  - Vistas: PagosDashboardView, HistorialPagosView, GestionPagosView,
    CrearOrdenDePagoView.
  - Componentes: PaymentDetailModal, PostPagoModal, OrdenDePagoDetalleModal,
    GestionPagoModal, DividirOrdenDePago, herramientas de correccion.
  - Tablas: ordenes_de_pago, pagos, reportes.
  - RPCs: get_todas_cirugias_pendientes, registrar_orden_de_pago,
    obtener_cirugias_pendientes, registrar_lote_de_pago,
    obtener_detalle_orden_pago, obtener_historial_ordenes_pago,
    marcar_como_pagado, anular_orden_de_pago, modificar_orden_de_pago,
    actualizar_comprobante_orden_pago, anular_y_recrear_pago_individual.
  - Seguridad: confirmado por auditoria Supabase como modulo critico por RPCs
    con impacto economico, SECURITY DEFINER y/o permisos amplios. No modificar
    sin staging.
PDFs

  - Componentes/servicios: ReportPDF, ReportDrawer, useOrdenDePagoPDF,
    pdfGenerator, reportGeneratorService.
  - Tablas: pdf_generation_log.
  - RPCs: log_pdf_generation.

Notificaciones

  - Vistas/componentes: NotificationsView, NotificationDropdown,
    NotificationBell, AdminLayout.
  - Tabla: notifications inferida por Realtime y RPCs; DDL pendiente.
  - RPCs: get_notifications, mark_notifications_as_read,
    get_all_notifications_paginated.

Admin

  - Vistas: AdminView, ConfigView.
  - Componentes: AuthorizationModal, modales admin, correcciones de pagos.
  - RPCs: list_all_users, grant_admin_role.
  - Seguridad: auditoria Supabase indica que list_all_users y grant_admin_role
    validan superadmin por email en el estado actual; recomendable evolucionar a
    claim/rol backend formal.
Autenticacion

  - Vista: LoginView.
  - Router: guard global.
  - Componentes: Sidebar para logout, AuthorizationModal para reautenticacion.
  - Servicio: cliente Supabase Auth.

Reclamos, quejas y pedidos

  - Vistas: ReclamoView, QuejasView, PedidosEspecialesView.
  - Componentes: FormularioMedicoReclamo, GestionReclamoModal,
    PedidoEspecialModal, QuejasFilterBar, ShareReclamoLinkModal.
  - Tablas: quejas, pedidos_especiales, firmas.
  - RPCs: get_quejas, get_quejas_stats, get_medicos_con_pedidos,
    get_pedidos_y_stats_por_medico, delete_pedido_especial,
    search_reportes_para_pedidos.