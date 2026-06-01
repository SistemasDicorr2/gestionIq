Deuda tecnica y riesgos

Riesgos altos

1.  Produccion unica sin staging
      - Estado: confirmado por auditoria Supabase.
      - Impacto: cualquier cambio de RLS, grants, RPCs, buckets o datos afecta
        directamente el entorno real.
2.  RLS, policies y grants amplios
      - Estado: confirmado por auditoria Supabase.
      - Impacto: existen policies publicas/permisivas y grants amplios que
        requieren hardening controlado.
3.  RPCs criticas con EXECUTE amplio y SECURITY DEFINER
      - Estado: confirmado por auditoria Supabase.
      - Impacto: funciones de pagos/correcciones/comprobantes pueden ser
        superficie critica si no validan auth/rol internamente.
4.  Operaciones de pago muy acopladas a RPCs
      - Estado: confirmado por codigo.
      - Impacto: cambios en registrar_orden_de_pago o estructuras de retorno
        pueden romper pagos por lote.
5.  Buckets publicos
      - Estado: confirmado por auditoria Supabase para firmas y documentos.
      - Impacto: riesgo de exposicion de datos personales si contienen firmas o
        documentos sensibles.
6.  CORS abierto en Edge Function
      - Estado: confirmado por codigo.
      - Impacto: ampliar superficie de abuso si los permisos JWT/RLS no estan
        bien cerrados.
Bugs o inconsistencias detectadas por codigo

  - FileUpload.vue expone reset, pero varios padres llaman .clear()
    (SubmissionSuccess.vue, ConsumoView.vue, GestionPagosView.vue). Esto puede
    fallar en runtime.
  - ConsumoView.vue llama toLocaleDateDateString, metodo inexistente. Debe ser
    toLocaleDateString.
  - ReportDrawer.vue usa useToast() dentro de handleRegisterIntervention pero no
    se ve import de useToast en el fragmento leido; validar archivo completo.
  - SubmissionSuccess.vue mantiene logs de diagnostico y console.table del
    payload de evidencias. Puede ser ruido o exposicion en produccion.
  - PhotosGallery.vue contiene TODOs para subida y borrado real.
  - .env esta presente en el repositorio/workspace con valores. No se
    documentaron secretos, pero se recomienda rotar si fue versionado.
Acoplamientos

  - RPCs definen gran parte de contratos de UI sin tipos compartidos.
  - Montos de pago se editan en frontend y se envian como JSON a RPC.
  - R2 object keys son usados como contrato entre Edge Function, base de datos y
    renderizadores.
  - app_metadata.role define acceso admin en frontend; debe estar replicado en
    backend/RPC.

Codigo duplicado o solapado

  - hasRealFichaSubmissionEvidence existe en fichaAccessEvents.js, shortLinks.js
    e InformeSemanalSeguimientoView.vue.
  - Flujos de pagos duplicados/alternativos entre PagosDashboardView,
    GestionPagosView y CrearOrdenDePagoView.
  - Componentes/vistas de notificaciones con nombres similares.
  - Documentacion historica en Documentacion/*.txt duplica componentes.
Tablas sensibles

  - reportes, instrumentadores, ordenes_de_pago, pagos, quejas,
    reporte_evidencias, short_links, ficha_access_events, pdf_generation_log,
    configuracion, files, intervenciones_clave, log_emails, medicos,
    reportes_log, reportes_normalizados, sugerencias.

Policies/grants prioritarios

Confirmado por auditoria Supabase :

  - Revisar policies publicas o amplias en reportes, clientes, materiales,
    tipos_cirugia, instrumentadores, reporte_evidencias, logistica_controles.
  - Revisar grants EXECUTE a anon, authenticated o PUBLIC en RPCs criticas.
  - No revocar ni cambiar directo en produccion sin staging.
Recomendaciones

  - Exportar schema completo con tablas, columnas, policies, functions, triggers
    e indices.
  - Crear backup y staging antes del hardening.
  - Agregar tests de humo para rutas criticas: login, ficha, pago, subida
    evidencia.
  - Corregir API expuesta de FileUpload o llamadas .clear().
  - Tipar contratos de RPC en una capa de servicios.
  - Mover reglas repetidas a helpers compartidos.
  - Documentar formalmente roles y policies.
  - Revisar secretos en .env y asegurar que no esten committeados en remoto.