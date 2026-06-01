Gestion IQ — Documento Integral de Magnitud del Proyecto

Fecha de elaboración: 28 de mayo de 2026

Estado del documento: visión integral, técnica y operativa del proyecto

Modo de trabajo recomendado: lectura, planificación y evolución controlada

1.  Resumen ejecutivo

Gestion IQ es una plataforma web orientada a la trazabilidad quirúrgica, la
gestión de reportes de instrumentadores, el seguimiento operativo de cirugías,
la carga de evidencias visuales, el control logístico, la generación de PDFs,
las notificaciones internas y la gestión de pagos por lote.
El proyecto no debe entenderse como una aplicación administrativa simple. Su
alcance real se aproxima a un sistema operativo interno para una empresa de
distribución quirúrgica: centraliza información sensible del circuito
quirúrgico, estructura la comunicación entre áreas y transforma eventos
dispersos en datos trazables.
El valor principal del sistema está en convertir cada cirugía en un expediente
digital: una unidad operativa donde se vinculan paciente, médico, institución,
instrumentador, ficha digital, evidencias, controles logísticos, PDFs, actividad
del instrumentador, pagos y auditoría.
La magnitud del proyecto está dada por tres dimensiones:

  - Dimensión operativa: acompaña el circuito real de cirugías,
    instrumentadores, logística, reclamos, evidencias y pagos.
  - Dimensión técnica: utiliza Vue 3, Supabase, PostgreSQL, RPCs, RLS, Edge
    Functions, Realtime, Storage y Cloudflare R2.
  - Dimensión estratégica: permite avanzar hacia un ERP quirúrgico/logístico
    propio, con trazabilidad, inteligencia operativa y control documental.
2.  Propósito del proyecto

Gestion IQ nace para resolver problemas concretos del circuito quirúrgico:
  - pérdida de información entre WhatsApp, planillas, papeles y sistemas
    aislados;

  - falta de evidencia centralizada;
  - dificultad para auditar quién hizo qué y cuándo;

  - necesidad de registrar el consumo post cirugía;
  - necesidad de ordenar pagos a instrumentadores;

  - necesidad de generar reportes, PDFs y trazabilidad documental;
  - necesidad de dar visibilidad al trabajo del instrumentador;

  - necesidad de profesionalizar procesos internos sin depender exclusivamente
    de memoria operativa.
El sistema busca que la información no dependa de mensajes sueltos, sino de
eventos registrados, consultables y auditables.
3.  Alcance funcional actual

El proyecto ya contiene múltiples módulos funcionales:

3.1 Reportes / cirugías

El módulo de reportes es el núcleo del sistema. Cada reporte representa una
cirugía o evento quirúrgico gestionable. Desde este módulo se administran datos
como paciente, médico, institución, instrumentador, fecha, material, estado,
consumo, firma, observaciones, logística, pagos y generación documental.
3.2 Ficha digital

La ficha digital permite al instrumentador acceder mediante token o short link,
identificarse, completar información post cirugía, registrar consumo, firmar y
enviar la ficha. Al completarse, el sistema actualiza el estado del reporte y
dispara procesos relacionados, como notificaciones, actividad del instrumentador
y carga posterior de evidencias.
3.3 Evidencias visuales

El sistema permite subir fotos, comprobantes, remitos, stickers, cajas y otros
archivos relacionados con una cirugía. La arquitectura usa Cloudflare R2 para
almacenar archivos pesados, mientras Supabase conserva los metadatos. Esta
decisión desacopla storage de base de datos y mejora escalabilidad.
3.4 Logística y control de consumo

Gestion IQ incorpora vistas y flujos para registrar controles logísticos,
observaciones, estado del material y evidencias asociadas. Esto convierte el
retorno de cajas, control de consumo y documentación logística en datos
trazables, en vez de depender de mensajes informales.
3.5 Pagos por lote

El módulo de pagos permite agrupar cirugías en órdenes de pago, asociar pagos
por instrumentador, registrar comprobantes y actualizar el estado de pago de
reportes. Es uno de los dominios más críticos del sistema porque impacta en
montos, historial administrativo y liquidaciones.
3.6 Instrumentadores

El sistema administra instrumentadores, actividad, estadísticas, ranking, tokens
de acceso, datos bancarios y visualización de cirugías vinculadas. Este módulo
es clave para convertir el trabajo de campo en información medible y
gestionable.
3.7 Notificaciones

El sistema utiliza notificaciones internas y Realtime para informar eventos
relevantes dentro del panel administrativo. Esto permite responder más rápido
ante fichas enviadas, novedades o acciones importantes.
3.8 PDFs y documentación

Gestion IQ genera y registra PDFs vinculados a reportes, órdenes de pago y
trazabilidad. La generación documental cumple un rol operativo y de respaldo.
3.9 Reclamos, quejas y pedidos especiales

El sistema también contempla formularios y vistas para gestionar reclamos,
quejas y pedidos especiales, ampliando el alcance más allá del reporte
quirúrgico tradicional.
4.  Arquitectura técnica general

La arquitectura actual se basa en:

  - Frontend: Vue 3 + Vite.
  - Estilos: Tailwind CSS.

  - Backend/BaaS: Supabase.

  - Base de datos: PostgreSQL.
  - Lógica de negocio: RPCs, vistas, triggers y constraints.

  - Autenticación: Supabase Auth.
  - Seguridad: Row Level Security y policies, aunque con pendientes de auditoría
    y endurecimiento.
  - Archivos: Cloudflare R2 y Supabase Storage.

  - Edge Functions: generación de URLs prefirmadas para R2.

  - Realtime: notificaciones.
  - Documentos/PDFs: jsPDF, html2canvas y librerías asociadas.
La característica central es el enfoque server-centric. El frontend no debería
contener las reglas críticas del negocio. Su rol ideal es presentar datos,
capturar entradas y orquestar interacciones. Las decisiones transaccionales
importantes deben residir en PostgreSQL mediante RPCs, vistas, triggers y
políticas de seguridad.
5.  Filosofía server-centric

Gestion IQ no está diseñado como un CRUD superficial. El sistema concentra buena
parte de la lógica en Supabase/PostgreSQL.

Esto tiene ventajas importantes:
  - mayor consistencia de datos;

  - operaciones transaccionales más seguras;

  - menor duplicación de reglas entre pantallas;
  - posibilidad de auditar procesos desde base de datos;

  - mejor control de flujos críticos como pagos, fichas y logística.
Pero también implica responsabilidades:

  - las RPCs deben estar correctamente protegidas;

  - las policies RLS deben estar auditadas;
  - los grants de anon/authenticated deben ser controlados;

  - las funciones SECURITY DEFINER deben validar permisos internamente;
  - los cambios en RPCs pueden romper múltiples módulos si no hay contratos
    tipados.
6.  Modelo de datos conceptual

El modelo gira alrededor de la tabla de reportes. Desde reportes se conectan
distintos dominios:

  - reportes con instrumentadores;

  - reportes con pagos;

  - reportes con órdenes de pago;
  - reportes con evidencias;

  - reportes con logística;

  - reportes con PDFs;

  - reportes con eventos de acceso;
  - reportes con short links;

  - reportes con intervenciones, incidencias o reclamos.

Entidades principales:
  - reportes: corazón operativo del sistema.

  - instrumentadores: usuarios externos/operativos vinculados a cirugías.
  - pagos: subtotales por instrumentador dentro de una orden.

  - ordenes_de_pago: lote administrativo de pago.
  - reporte_evidencias: metadatos de archivos/evidencias asociados a reportes.

  - logistica_controles: controles físicos y observaciones logísticas.
  - short_links: accesos cortos a fichas.

  - ficha_access_events: auditoría de accesos.

  - pdf_generation_log: registro de generación documental.
  - notifications: eventos notificados al panel.

  - quejas y pedidos_especiales: extensión de reclamos y solicitudes.
7.  Flujo operativo integral

El ciclo completo puede entenderse así:

1.  Se crea o registra una cirugía/reporte.
2.  El reporte queda disponible para gestión interna.

3.  Se genera un token o short link para ficha digital.
4.  El instrumentador accede, se identifica y completa la ficha.

5.  Se registra firma, consumo, observaciones y estado.
6.  Al enviar, el reporte pasa a estado enviado y puede disparar notificaciones.
7.  El instrumentador puede cargar evidencias visuales.

8.  El área logística puede registrar controles de consumo y evidencias propias.
9.  El administrador revisa el expediente digital del reporte.

10. Se generan PDFs y registros documentales.
11. La cirugía puede ser incluida en un lote de pago.
12. Se registra orden de pago, comprobante y pagos por instrumentador.
13. El sistema conserva trazabilidad de actividad, documentos, evidencias y
    estados.
Este flujo muestra que Gestión IQ no solo registra datos: modela un circuito
operativo completo.
8.  Frontend y experiencia de usuario

El frontend está organizado por rutas públicas y rutas protegidas.
Rutas públicas:

  - login;

  - ficha por token;

  - ficha por short link;

  - reclamo;
  - resumen de actividad del instrumentador.

Rutas protegidas:

  - panel de administración;

  - estadísticas;

  - instrumentadores;

  - incidencias;
  - quejas;

  - pedidos especiales;

  - notificaciones;

  - informe semanal;

  - logística;

  - control de consumo;

  - pagos;
  - historial de pagos;

  - configuración.

Componentes relevantes:
  - AdminLayout;

  - Sidebar;

  - ReportTable;

  - ReportCard;

  - ReportDrawer;

  - FichaForm;

  - IdentificationWizard;

  - SubmissionSuccess;

  - FileUpload;

  - PhotosGallery;
  - EvidenceViewer;

  - SurgerySelector;

  - LogisticaTimeline;

  - PaymentDetailModal;

  - OrdenDePagoDetalleModal;

  - NotificationBell;

  - NotificationDropdown.
La aplicación no depende de un store global fuerte como Pinia o Vuex. El estado
parece vivir principalmente en componentes, rutas, session/local storage y
Supabase.

9.  Storage y evidencias
La arquitectura de archivos combina dos enfoques:

  - Cloudflare R2 para evidencias y comprobantes pesados.
  - Supabase Storage para firmas.

El flujo de R2 funciona mediante una Edge Function que genera URLs prefirmadas.
El frontend solicita una URL, sube el archivo directamente a R2 y luego persiste
los metadatos en Supabase. Esto evita que Supabase procese archivos pesados y
permite mantener la base más liviana.
Riesgos a validar:

  - privacidad real de buckets públicos;

  - lifecycle de archivos;
  - CORS de la Edge Function;

  - permisos para generar URLs prefirmadas;

  - control de lectura de firmas y documentos.
10. Seguridad actual y estado de madurez

El proyecto utiliza Supabase Auth, anon key, authenticated users, guards
frontend y roles en app_metadata.
Sin embargo, el relevamiento detectó pendientes importantes:

  - existen grants amplios para anon/authenticated;

  - algunas tablas tienen RLS desactivado;
  - hay RPCs administrativas SECURITY DEFINER que deben auditarse;

  - algunas funciones críticas de pagos no validan auth internamente según lo
    observado;
  - existen buckets públicos;

  - CORS abierto en Edge Function;
  - el proyecto trabaja actualmente sobre una única base productiva, sin
    staging.
Esto no significa que el sistema esté comprometido, pero sí que la seguridad
backend todavía requiere una etapa formal de endurecimiento.
La prioridad no debe ser tocar producción de inmediato, sino:

1.  backup;

2.  creación de staging;
3.  export completo de schema;

4.  auditoría de policies y grants;

5.  revisión de SECURITY DEFINER;
6.  migraciones controladas;
7.  pruebas antes de producción.

8.  Deuda técnica detectada

Principales puntos:

  - FileUpload.vue expone reset, pero algunos padres llaman .clear().
  - ConsumoView.vue usa toLocaleDateDateString, método inexistente.

  - pagos tiene flujos potencialmente duplicados o alternativos.
  - algunas reglas están repetidas en helpers o vistas.

  - contratos RPC no están tipados en TypeScript.
  - faltan tests de humo para rutas críticas.

  - falta staging.

  - falta versionado completo de schema y migrations.
  - falta documentación viva de RLS y grants.

12. Magnitud real del proyecto

Gestion IQ ya tiene dimensiones de un ERP operativo especializado. No es todavía
un ERP completo en sentido tradicional, pero sí contiene bloques propios de un
ERP quirúrgico/logístico:

  - gestión de eventos quirúrgicos;
  - gestión de usuarios internos y externos;

  - trazabilidad documental;

  - control de evidencias;

  - logística;

  - pagos;

  - auditoría;
  - notificaciones;

  - reportes;

  - estadísticas;

  - flujos públicos y privados;
  - almacenamiento externo;

  - funciones backend transaccionales.

Su valor estratégico está en que refleja el circuito real de una empresa
quirúrgica y permite capturar información que normalmente queda dispersa en
WhatsApp, papeles, conversaciones y planillas.
13. Riesgos estratégicos

Los principales riesgos actuales no son funcionales sino de madurez de
plataforma:

  - una sola base de producción;
  - ausencia de staging;

  - seguridad backend en etapa incompleta;

  - dependencia fuerte de RPCs sin contratos tipados;
  - falta de migraciones versionadas;

  - riesgo de romper pagos o ficha si se modifica sin pruebas;
  - exposición potencial de datos por grants o buckets públicos.

14. Roadmap recomendado

Fase 1 — Protección

  - backup completo;
  - export de schema;

  - creación de proyecto Supabase staging;

  - copia de estructura y datos mínimos;
  - documentación de variables y secretos;

  - freeze de cambios destructivos en producción.
Fase 2 — Seguridad

  - auditar RLS;

  - auditar grants;

  - revisar SECURITY DEFINER;

  - restringir RPCs críticas;
  - validar buckets;

  - revisar CORS;

  - definir roles reales.

Fase 3 — Calidad técnica

  - generar tipos Supabase;
  - tipar contratos RPC;

  - corregir bugs detectados;

  - agregar tests de humo;

  - separar flujos legacy;

  - limpiar duplicaciones.
Fase 4 — Escalabilidad

  - observabilidad;

  - logs estructurados;

  - dashboards de operación;

  - auditoría de eventos;
  - documentación viva;

  - metodología Spec Driven Development.

Fase 5 — Evolución ERP

  - expediente quirúrgico completo;
  - integración logística avanzada;
  - trazabilidad de cajas/materiales;

  - tablero de pagos y liquidaciones;

  - portal avanzado de instrumentadores;

  - inteligencia operativa.
15. Conclusión

Gestion IQ es un proyecto de alta magnitud para el contexto operativo que busca
resolver. Su arquitectura ya demuestra una intención clara de plataforma:
frontend modular, Supabase como backend operacional, PostgreSQL como centro de
lógica, RPCs transaccionales, R2 para archivos, Realtime para notificaciones y
flujos diferenciados para usuarios internos y externos.
El sistema tiene una base fuerte y una visión técnica correcta. La siguiente
etapa no debería ser agregar más funcionalidades sin control, sino estabilizar
la plataforma: staging, backups, seguridad, tipado, migraciones y documentación
viva.
Si se ordena correctamente, Gestión IQ puede evolucionar de una aplicación
operativa avanzada a un ERP quirúrgico/logístico propio, con trazabilidad real
de punta a punta.