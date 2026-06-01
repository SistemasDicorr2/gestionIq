Catalogo de RPC

Fuente

Confirmado por codigo : llamadas supabase.rpc() en src/. Confirmado por Supabase
: descripcion parcial de algunas RPCs en Documentacion/Documentacion 5.0/.
Confirmado por auditoria Supabase : 13_SECURITY_AUDIT_CURRENT_STATE.md detecta
grants EXECUTE amplios en varias RPCs y funciones SECURITY DEFINER. Firmas y
returns exactos: pendiente de validar salvo donde la documentacion exportada lo
indica.

Nota de seguridad

Las RPCs de pagos, admin, correcciones, comprobantes y notificaciones deben
tratarse como contratos criticos. El riesgo real aumenta cuando coinciden:
RPCs consumidas

| RPC | Consumidores | Modulo | Estado | Riesgo si cambia | | ------ | ------ |
------ | ------ | ------ | | search_reportes_avanzado | AdminView.vue | Reportes
| Confirmado por codigo | Alto: rompe panel principal y exportaciones | |
create_instrumentador_token | FichaView.vue | Ficha/instrumentadores |
Confirmado por codigo | Medio: rompe link a resumen | |
autenticar_y_obtener_resumen | ActivitySummaryView.vue | Portal instrumentador |
Confirmado por codigo y Supabase | Alto: rompe acceso a actividad/pagos | |
get_instrumentadores_con_stats | InstrumentadoresView.vue | Instrumentadores |
Confirmado por codigo y Supabase | Alto: rompe tabla principal | |
get_instrumentador_ranking_kpis | InstrumentadoresView.vue | Instrumentadores |
Confirmado por codigo | Medio | | generar_activity_token |
InstrumentadoresView.vue | Instrumentadores | Confirmado por codigo | Medio | |
obtener_detalle_estadisticas_instrumentador |
EstadisticasInstrumentadorModal.vue | Instrumentadores | Confirmado por codigo y
Supabase | Medio | | get_ranking_ivo_detallado | InstrumentadoresRanking.vue |
Instrumentadores | Confirmado por codigo | Medio | |
create_logistica_control_with_evidences | ConsumoView.vue | Logistica/evidencias
| Confirmado por codigo | Alto: operacion transaccional | |
search_reportes_for_selector | SurgerySelector.vue | Busqueda comun | Confirmado
por codigo | Medio | | registrar_orden_de_pago | PagosDashboardView.vue,
CrearOrdenDePagoView.vue | Pagos | Confirmado por codigo y Supabase | Alto:
registra pagos por lote | | get_todas_cirugias_pendientes |
PagosDashboardView.vue | Pagos | Confirmado por codigo | Alto | |
obtener_cirugias_pendientes | GestionPagosView.vue, CrearOrdenDePagoView.vue |
Pagos | Confirmado por codigo | Medio | | registrar_lote_de_pago |
GestionPagosView.vue | Pagos | Confirmado por codigo | Alto | |
obtener_detalle_orden_pago | varias vistas/componentes de pagos | Pagos |
Confirmado por codigo | Medio | | obtener_historial_ordenes_pago |
historial/correcciones/division | Pagos | Confirmado por codigo | Medio | |
marcar_como_pagado | GestionPagoModal.vue | Pagos | Confirmado por codigo | Alto
| | anular_orden_de_pago | ToolAnularPago.vue | Correcciones pagos | Confirmado
por codigo | Alto | | modificar_orden_de_pago | ToolModificarMontosNotas.vue |
Correcciones pagos | Confirmado por codigo | Alto | |
actualizar_comprobante_orden_pago | ToolCambiarComprobante.vue | Correcciones
pagos | Confirmado por codigo | Alto | | anular_y_recrear_pago_individual |
DividirOrdenDePago.vue | Correcciones pagos | Confirmado por codigo | Alto | |
log_pdf_generation | ReportDrawer.vue | PDFs | Confirmado por codigo | Medio | |
registrar_intervencion_clave | ReportDrawer.vue | Incidencias/IVO | Confirmado
por codigo | Medio | | get_notifications | AdminLayout.vue | Notificaciones |
Confirmado por codigo | Medio | | mark_notifications_as_read | AdminLayout.vue |
Notificaciones | Confirmado por codigo | Bajo/medio | |
get_all_notifications_paginated | NotificationsView.vue | Notificaciones |
Confirmado por codigo | Medio | | create_short_link | shortLinks.js | Short
links | Confirmado por codigo | Alto: rompe links publicos | |
expire_report_link | GenerateLinkModal.vue | Short links | Confirmado por codigo
| Medio | | get_quejas_stats | QuejasView.vue | Quejas | Confirmado por codigo |
Medio | | get_quejas | QuejasView.vue | Quejas | Confirmado por codigo | Medio |
| get_medicos_con_pedidos | PedidosEspecialesView.vue | Pedidos especiales |
Confirmado por codigo | Bajo/medio | | get_pedidos_y_stats_por_medico |
PedidosEspecialesView.vue | Pedidos especiales | Confirmado por codigo | Medio |
| delete_pedido_especial | PedidosEspecialesView.vue | Pedidos especiales |
Confirmado por codigo | Medio | | search_reportes_para_pedidos |
PedidoEspecialModal.vue | Pedidos especiales | Confirmado por codigo | Medio | |
obtener_galeria_archivos | InstrumentadorUpload.vue | Archivos instrumentadores
| Confirmado por codigo | Bajo/medio | | list_all_users | ConfigView.vue | Admin
usuarios | Confirmado por codigo | Alto: requiere permisos | | grant_admin_role
| ConfigView.vue | Admin usuarios | Confirmado por codigo | Alto: seguridad |
SECURITY DEFINER y validacion interna

Confirmado por auditoria Supabase :

  - grant_admin_role y list_all_users validan usuario superadministrador por
    email en el relevamiento actual.
  - Requieren hardening/revision prioritaria: actualizar_comprobante_orden_pago,
    registrar_lote_de_pago, modificar_orden_de_pago, anular_orden_de_pago,
    anular_y_recrear_pago_individual, delete_pedido_especial, get_notifications.
  - No cambiar grants ni definiciones directamente en produccion sin
    backup/staging.

RPCs documentadas pero no consumidas directamente
- obtener_ranking_ivo(p_dias integer): confirmado por Supabase como funcion de
    apoyo llamada por otras RPCs.

Parametros y retornos

Parametros confirmados por codigo estan en database/RPC_DEPENDENCY_MAP.md.
Retornos exactos: pendiente de validar con definiciones SQL completas.