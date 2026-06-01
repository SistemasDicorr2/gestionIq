# Portal del Instrumentador - Changelog Frontend

## Fecha

2026-05-31

## Alcance

Esta etapa fue frontend-only y estuvo orientada a mejorar UX, organizacion visual, lenguaje de liquidaciones y claridad del portal del instrumentador en `/resumen/:token`.

No se modificaron contratos de datos, backend, Supabase ni RPCs. Los cambios consumen datos ya disponibles desde el flujo existente de `ActivitySummaryView.vue`.

## Archivos involucrados

- `src/views/ActivitySummaryView.vue`
- `src/components/MyDataSection.vue`
- `src/components/PaymentDetailModal.vue`

## Cambios principales

### 1. Resumen de actividad

- Se simplifico el inicio para mostrar una lectura rapida del estado actual.
- Se conservaron KPIs principales de actividad y pagos del mes.
- Se agrego foco visual en `Pendientes de liquidacion`.
- Se agrego bloque de `Ultimos comprobantes cargados`.
- Se agrego navegacion hacia `Pagos y Comprobantes`.
- Se evito cargar todo el historico completo en el resumen inicial.

### 2. Pagos y Comprobantes

- Se incorporo la pestana `Pagos y Comprobantes`.
- El titulo interno visible es `Liquidaciones y comprobantes`.
- Se separan pendientes de liquidacion e historial de liquidaciones.
- El historial se agrupa visualmente por mes mediante `liquidacionesAgrupadasPorMes`.
- Se implemento carga incremental con `Cargar mas liquidaciones`.
- Se diferencia entre `Comprobante cargado` y `Comprobante pendiente de carga`.

### 3. Modal Detalle de liquidacion

- Se cambio el lenguaje visible a `Detalle de liquidacion`.
- Se reemplazo lenguaje de pago/transferencia directa por lenguaje neutral de liquidacion y comprobante.
- Se usa `Comprobante subido el` cuando existe comprobante.
- Se listan pacientes incluidos.
- Los montos por cirugia se muestran solo si existen en datos reales (`monto_a_pagar`, `monto`, `monto_liquidado` u `honorarios`).
- No se inventan montos ni se reparten totales en frontend.

### 4. Mi Perfil

- Se cambio conceptualmente `Mis Datos` a `Mi Perfil`.
- Se agrego card superior con iniciales, nombre, DNI y badge `Instrumentador registrado`.
- Se conservaron estados `Datos completos` y `Faltan datos por completar`.
- Se reorganizaron datos personales:
  - Nombre completo
  - DNI
  - CUIT / CUIL
  - Lugar de trabajo
- Se reorganizaron datos de pago:
  - Medio de pago
  - Banco
  - Alias
  - CBU
- Se agregaron KPIs de actividad:
  - Cirugias acompanadas
  - Medicos
  - Tipos de cirugia
  - Instituciones
- `Medicos` e `Instituciones` muestran `Dato pendiente` cuando no hay campo confirmado o dato disponible.
- `Cirugias por tipo` aplica normalizacion visual local para agrupar variantes evidentes.
- `Cirugias por medico` muestra estado vacio claro si no hay informacion suficiente.
- Se mejoro el boton `Solicitar actualizacion por WhatsApp`.

### 5. Dark mode y responsive

- Se reforzo compatibilidad con dark mode.
- Se mantuvo enfoque mobile-first.
- Se usaron cards, badges, iconos inline y transiciones suaves.
- Se cuidaron textos largos y estructuras responsive para prevenir scroll horizontal.

## Decisiones UX importantes

- No mostrar `0` enganoso cuando un campo no esta confirmado.
- Usar `Dato pendiente` cuando falta contrato o campo confirmado.
- No mostrar `null`, `undefined` ni `NaN`.
- Evitar nombres tecnicos, nombres de tablas, nombres de RPCs o JSON.
- Evitar lenguaje competitivo como ranking, rendimiento, productividad o score.
- Evitar afirmar transferencia bancaria si solo existe liquidacion/comprobante.
- Mantener enfoque de perfil profesional e informativo del instrumentador.

## Datos usados

Confirmado por codigo:

- `allActivityData`: actividad filtrada en `ActivitySummaryView.vue`.
- `instrumentadorInfo`: datos personales/pago recibidos por el portal.
- `activity`: prop usada por `MyDataSection.vue`.
- `pendientes`: computed basado en `estado_pago === 'Pendiente'`.
- `historialLiquidaciones`: agrupacion frontend de actividad pagada.
- `liquidacionesAgrupadasPorMes`: agrupacion visual por mes.
- `activeTab`: controla `Resumen`, `Pagos y Comprobantes`, `Mi Perfil` y `Preguntas Frecuentes`.

## Restricciones respetadas

No se toco:

- Supabase
- RPCs
- `autenticar_y_obtener_resumen`
- RLS
- policies
- grants
- Edge Functions
- buckets
- variables de entorno
- contratos de datos
- logica backend
- logica economica

## Verificacion

Ultimo resultado real registrado:

- Comando: `npm run build`
- Resultado: exitoso.
- Vite compilo 1795 modulos.
- Build terminado correctamente en 5.02s.

Warnings existentes:

- chunks grandes despues de minificacion.
- `browserslist/caniuse-lite` desactualizado.
- `baseline-browser-mapping` viejo.

## Pendientes

- Validar si `activity_summary` trae medico como campo confirmado.
- Validar si `activity_summary` trae institucion o `lugar_cirugia`.
- Validar si `tipo_cirugia` es campo definitivo o si `patologia` sigue siendo fallback.
- Definir numero oficial de WhatsApp para actualizacion de datos.
- Evaluar hoja de vida profesional / PDF en una etapa posterior.
- Separar componentes si `ActivitySummaryView.vue` queda demasiado grande.
