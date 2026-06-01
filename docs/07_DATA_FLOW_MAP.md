Mapa de flujos de datos

Frontend -> Supabase

Confirmado por codigo :

  - CRUD simple mediante supabase.from.
  - Operaciones agregadas/transaccionales mediante supabase.rpc.
  - Archivos hacia R2 mediante supabase.functions.invoke('b2-presigned-url') +
    fetch PUT.
  - Firmas hacia Supabase Storage firmas.
  - Realtime con canal public:notifications. Confirmado por auditoria Supabase :
    el entorno relevado es produccion unica sin staging confirmado. Cualquier
    cambio de flujo que requiera modificar RPCs, RLS, grants o buckets debe
    probarse primero en staging.
Flujo de ficha digital

1.  FichaView recibe token o short_code.
2.  Si hay short_code, consulta short_links y luego reportes.
3.  Si hay token, consulta reportes.
4.  Audita accesos con ficha_access_events.
5.  IdentificationWizard identifica instrumentador contra instrumentadores.
6.  FichaForm sube firma a firmas, actualiza reportes a estado = 'Enviado' y
    guarda campos de evaluacion/consumo.
7.  Al enviar, FichaView llama create_instrumentador_token.
8.  SubmissionSuccess permite cargar evidencias en R2 y persiste metadata en
    reporte_evidencias.
Triggers Supabase relacionados: on_ficha_enviada_create_notification,
trigger_calculate_puntaje_iq_on_update.

Flujo de evidencias

1.  FileUpload selecciona/captura archivos y genera preview.
2.  Solicita URL firmada a Edge Function b2-presigned-url.
3.  Sube archivo original y miniatura a Cloudflare R2.
4.  Devuelve object_key, file_name, content_type, size_bytes.
5.  Componentes padres insertan metadata en reporte_evidencias o la envian a RPC
    logisticas.
6.  Visualizacion construye URL con VITE_R2_PUBLIC_URL.
Flujo de logistica/control de consumo

  - LogisticaControl.vue: inserta registros en logistica_controles.
  - ConsumoView.vue: selecciona cirugia, verifica controles previos, sube
    evidencia a R2 y llama create_logistica_control_with_evidences.
  - LogisticaTimeline.vue: lee logistica_controles_con_evidencias.

Flujo de pagos

1.  PagosDashboardView obtiene pendientes via get_todas_cirugias_pendientes.
2.  El usuario selecciona cirugias y montos.
3.  Sube comprobante a R2 con FileUpload.
4.  Arma p_orden con total general, comprobante, notas, pagos por instrumentador
    y cirugias.
5.  Llama registrar_orden_de_pago.
6.  Tablas confirmadas relacionadas: ordenes_de_pago, pagos, reportes.
7.  Historial/correcciones usan RPCs especificas.
Riesgo confirmado por auditoria Supabase : las RPCs de pagos/correcciones
concentran cambios economicos y algunas tienen SECURITY DEFINER/EXECUTE amplio.
Deben validar auth/rol en backend.

Flujo de PDFs

  - AdminView exporta listas/resumenes/trazabilidad con jsPDF.
  - ReportDrawer llama log_pdf_generation, renderiza ReportPDF y genera PDF con
    html2canvas + jsPDF.
  - useOrdenDePagoPDF existe para ordenes de pago; detalle pendiente de validar.
  - Tabla pdf_generation_log: confirmada por codigo.

Flujo de actividad de instrumentadores
1.  Admin genera/copia token permanente con generar_activity_token.
2.  Instrumentador abre /resumen/:token.
3.  Ingresa DNI.
4.  ActivitySummaryView llama autenticar_y_obtener_resumen.
5.  Muestra datos personales, cirugias pendientes/pagadas y comprobantes R2.

Notas frontend recientes:

  - El portal del instrumentador usa datos ya cargados desde
    autenticar_y_obtener_resumen.
  - Mi Perfil calcula metricas visuales en frontend desde activity.
  - Pagos y Comprobantes agrupa liquidaciones en frontend desde allActivityData.
  - No se agregaron nuevas consultas ni contratos para esta etapa.

Notas Estacion de Pagos Rapidos:

  - PagosDashboardView calcula KPIs en frontend desde allPendingSurgeries,
    lista obtenida por get_todas_cirugias_pendientes.
  - Los filtros KPI se aplican localmente despues de los filtros manuales.
  - La seleccion y el resumen de pago siguen usando selectedSurgeryIds y
    paymentSummary.
  - No se agregaron nuevas consultas ni contratos.

Flujo de notificaciones

  - AdminLayout carga get_notifications.
  - Se suscribe a inserts en notifications.
  - Marca leidas con mark_notifications_as_read.
  - Al hacer click busca reportes y abre ReportDrawer. Pendiente de
    endurecimiento : revisar grants y validacion interna de RPCs de
    notificaciones segun auditoria actual.
