# gestion-iq-safe-coding

## Propósito

Usá esta skill para trabajar en el proyecto **Gestión IQ** de forma segura, productiva y autónoma, sin poner en riesgo la base de datos, los flujos críticos ni la operación real.

Gestión IQ es una aplicación Vue 3 + Vite + Supabase orientada a trazabilidad quirúrgica, ficha digital, instrumentadores, evidencias, logística, pagos, comprobantes, PDFs y actividad profesional del instrumentador.

El objetivo de esta skill no es bloquear al agente.
El objetivo es darle libertad de trabajo dentro de límites seguros.

---

## Principio central

**Podés avanzar con criterio técnico, pero no podés asumir datos, modificar producción ni romper contratos existentes.**

Cuando haya duda:

1. leer documentación,
2. inspeccionar código,
3. proponer plan,
4. hacer cambio mínimo,
5. verificar,
6. reportar qué se tocó y qué no.

---

## Documentación obligatoria antes de trabajar

Antes de modificar código, leer como mínimo:

* `docs/11_AI_WORKING_CONTEXT.md`
* `docs/07_DATA_FLOW_MAP.md`
* `docs/10_TECHNICAL_DEBT_AND_RISKS.md`

Si el cambio toca arquitectura, leer también:

* `docs/12_CONSOLIDATED_TECHNICAL_ARCHITECTURE.md`
* `docs/03_FRONTEND_ARCHITECTURE.md`
* `docs/05_RPC_CATALOG.md`

Si el cambio toca seguridad, pagos, autenticación, storage, rutas públicas, RLS, RPCs o Supabase, leer también:

* `docs/13_SECURITY_AUDIT_CURRENT_STATE.md`
* `docs/06_SECURITY_RLS_MODEL.md`
* `docs/09_EDGE_FUNCTIONS_AND_STORAGE.md`

---

## Fuentes de verdad

Usar esta prioridad:

1. Código real del repositorio.
2. Documentación actual en `/docs`.
3. Consultas/exportaciones Supabase ya documentadas.
4. Inferencias razonables, marcadas como inferidas.
5. Supuestos pendientes, marcados como pendientes de validar.

No inventar:

* tablas,
* campos,
* RPCs,
* rutas,
* policies,
* roles,
* flujos,
* datos del negocio.

---

## Niveles de evidencia

Cuando expliques una decisión, usá estas etiquetas si corresponde:

* **Confirmado por código**
* **Confirmado por documentación**
* **Confirmado por Supabase**
* **Inferido**
* **Pendiente de validar**

---

## Libertad permitida para el agente

El agente puede, sin pedir permiso adicional, hacer cambios frontend seguros cuando el objetivo del usuario sea claro.

Está permitido:

* mejorar UX/UI en componentes Vue existentes;
* ordenar lenguaje visible para usuarios;
* corregir bugs de frontend evidentes;
* ajustar estilos Tailwind;
* mejorar responsive/mobile;
* refactorizar componentes pequeños si reduce duplicación;
* crear helpers frontend si están justificados;
* reutilizar composables existentes;
* agregar fallbacks visuales ante datos faltantes;
* mejorar validaciones de pantalla;
* mejorar mensajes de error;
* mejorar estados vacíos;
* mejorar PDFs frontend existentes;
* actualizar documentación en `/docs`;
* ejecutar `npm run build` o lint/test si existe y no toca servicios externos;
* crear TODOs claros cuando falte dato o contrato.

---

## Cambios que requieren cautela

Estos cambios se pueden proponer, pero no aplicar sin confirmación explícita del usuario:

* refactors grandes;
* cambios que toquen más de 3 archivos no triviales;
* cambios en estructura de rutas;
* cambios en contratos de props compartidas;
* cambios que afecten el portal público del instrumentador;
* cambios en generación de PDFs usados operativamente;
* cambios en pagos, comprobantes, órdenes de pago o liquidaciones;
* cambios en carga de archivos/evidencias;
* cambios en autenticación o guards;
* cambios que modifiquen flujo de datos entre frontend y Supabase.

En estos casos, primero entregar:

1. diagnóstico,
2. plan,
3. archivos afectados,
4. riesgos,
5. propuesta de implementación.

---

## Prohibido sin autorización explícita

No hacer lo siguiente:

* modificar Supabase producción;
* ejecutar migraciones;
* crear, modificar o borrar RPCs;
* modificar RLS;
* modificar policies;
* modificar grants;
* modificar funciones SQL;
* modificar triggers;
* modificar buckets;
* modificar Edge Functions;
* cambiar variables de entorno;
* exponer valores de `.env`;
* crear queries destructivas;
* ejecutar `ALTER`, `DROP`, `DELETE`, `UPDATE`, `INSERT`, `GRANT`, `REVOKE` sobre producción;
* cambiar contratos de datos sin validar;
* reemplazar flujos críticos por supuestos;
* eliminar funcionalidades existentes sin justificar;
* cambiar pagos o comprobantes desde backend;
* tocar datos reales.

---

## Regla especial: Supabase producción

El proyecto actualmente debe tratarse como si tuviera una única base productiva.

Por lo tanto:

* cualquier cambio de base de datos se considera operación crítica;
* cualquier SQL debe ser read-only salvo autorización explícita;
* si se requiere modificar base, generar propuesta o migración pendiente, no aplicarla;
* primero debe existir backup y staging;
* no tocar RLS, grants, RPCs ni buckets en producción.

Consultas seguras:

```sql
select ...
```

Consultas prohibidas sin autorización explícita:

```sql
alter ...
drop ...
delete ...
update ...
insert ...
grant ...
revoke ...
create policy ...
drop policy ...
create function ...
replace function ...
```

---

## Reglas para el portal del instrumentador

El portal del instrumentador es sensible porque es una ruta pública/externa.

Antes de tocarlo, revisar:

* `ActivitySummaryView.vue`
* `docs/07_DATA_FLOW_MAP.md`
* `docs/11_AI_WORKING_CONTEXT.md`
* `docs/13_SECURITY_AUDIT_CURRENT_STATE.md`

Principios:

* no mostrar datos de otros instrumentadores;
* no mostrar JSON;
* no mostrar nombres de tablas;
* no mostrar nombres de RPCs;
* no mostrar campos internos como `object_key`, `comprobante_object_key`, `orden_de_pago_id`;
* no inventar datos si la RPC no los devuelve;
* no hacer nuevas consultas directas si los datos existentes alcanzan;
* usar fallbacks seguros si faltan datos;
* mantener lenguaje simple.

Lenguaje recomendado:

* “Mi Experiencia”
* “Actividad registrada”
* “Cirugías acompañadas”
* “Procedimientos más frecuentes”
* “Médicos con los que trabajaste”
* “Instituciones donde participaste”
* “Hoja de vida profesional”
* “Pendiente de liquidación”
* “Comprobante de pago cargado”
* “Orden de pago”
* “Pacientes abonados”
* “Mis Datos”
* “Solicitar actualización”

Lenguaje a evitar:

* “rendimiento”
* “ranking”
* “productividad”
* “score”
* “fichas completadas” como KPI principal
* “certificación”
* “credencial IQ”
* “bioseguridad”
* “entrenamiento”
* “dashboard de pagos”
* términos técnicos internos.

---

## Reglas para pagos y comprobantes

El dominio de pagos es crítico.

Permitido en frontend:

* mejorar visualización;
* mejorar textos;
* ordenar cards;
* mejorar PDF individual;
* mostrar mejor órdenes de pago existentes;
* agregar estados vacíos;
* evitar confusión entre pagado, comprobante cargado y pendiente de liquidación.

No permitido sin autorización explícita:

* modificar RPCs de pagos;
* modificar tablas `ordenes_de_pago`, `pagos`, `reportes`;
* cambiar lógica de liquidación;
* cambiar estados económicos;
* crear nuevas escrituras;
* asumir montos;
* generar documentos masivos por defecto.

Regla UX:

* PDF de comprobante/liquidación debe ser individual por orden de pago.
* No generar PDF gigante de todo el histórico salvo que el usuario lo pida explícitamente y con filtros.
* Si el PDF es una hoja de vida profesional, no debe incluir pagos ni montos.

---

## Reglas para “Mi Experiencia”

“Mi Experiencia” no es una pantalla de pagos ni de evaluación.

Debe mostrar:

* cirugías acompañadas;
* actividad quirúrgica registrada;
* procedimientos más frecuentes;
* médicos con los que trabajó;
* instituciones donde participó;
* actividad reciente;
* trayectoria con Districorr.

Debe evitar:

* gamificación;
* ranking competitivo;
* rendimiento;
* productividad;
* crecimiento profesional inventado;
* certificaciones no reales;
* métricas no respaldadas.

Frase guía:

> Tu actividad registrada también forma parte de tu trayectoria profesional.

---

## Reglas para “Mis Datos”

“Mis Datos” debe contener solo información personal y de pago.

Sección personal:

* Nombre completo
* DNI
* CUIT / CUIL
* Lugar de trabajo

Sección de pago:

* Banco
* Alias
* CBU
* Medio de pago

Si falta información:

* mostrar “No especificado” o “Dato pendiente”;
* nunca mostrar `null`, `undefined`, `NaN` o campos crudos.

No permitir edición directa si no existe flujo seguro.
Usar acción tipo:

* “Solicitar actualización”
* “Solicitar actualización por WhatsApp”

---

## Reglas para hoja de vida profesional

La hoja de vida profesional debe ser un beneficio para el instrumentador.

Debe incluir:

* nombre;
* período de actividad;
* cantidad de cirugías acompañadas;
* procedimientos frecuentes;
* médicos con los que trabajó;
* instituciones si existen;
* última cirugía registrada;
* aclaración de que surge de registros de Gestión IQ.

No debe incluir:

* montos;
* pagos;
* CBU;
* alias bancario;
* datos administrativos internos;
* nombres de tablas;
* nombres de RPC;
* información sensible innecesaria.

Texto recomendado:

> Este documento resume tu experiencia registrada con Districorr. No reemplaza certificados oficiales ni documentación laboral formal.

---

## Reglas para archivos, R2 y Storage

No modificar Edge Functions ni buckets sin autorización.

Al trabajar con archivos:

* usar flujo existente;
* revisar `FileUpload`;
* respetar R2 para evidencias/comprobantes;
* respetar bucket `firmas` si el flujo existente lo usa;
* no cambiar object keys sin validar;
* no exponer URLs sensibles innecesariamente.

Riesgos conocidos:

* bucket `firmas` público;
* bucket `documentos` público;
* CORS abierto en Edge Function;
* producción sin staging.

Por eso, cualquier cambio en storage requiere revisión previa.

---

## Reglas para PDFs

Usar librerías existentes si están disponibles:

* `jsPDF`
* `jspdf-autotable`
* `html2canvas`

Antes de crear un helper nuevo, revisar si ya existen:

* `useOrdenDePagoPDF`
* `pdfGenerator`
* `reportGeneratorService`

Principios:

* PDFs simples;
* claros;
* imprimibles;
* sin datos técnicos;
* sin JSON;
* sin campos internos;
* sin información innecesaria.

Tipos:

1. PDF de orden/liquidación:

   * individual por orden de pago;
   * incluye pacientes/cirugías abonadas;
   * incluye monto de esa orden si corresponde;
   * no incluye todo el histórico.

2. PDF de hoja de vida:

   * profesional;
   * sin pagos ni montos;
   * orientado a respaldo de experiencia.

3. PDF de resumen:

   * acotado;
   * solo información visible o resumida;
   * no debe convertirse en un documento enorme.

---

## Flujo de trabajo esperado del agente

Para cada tarea:

1. Leer documentación necesaria.
2. Identificar archivos relacionados.
3. Explicar brevemente entendimiento.
4. Proponer plan corto.
5. Aplicar cambios mínimos.
6. Verificar.
7. Reportar resultado.

Formato de cierre obligatorio:

```txt
Archivos modificados:
- ...

Qué cambió:
- ...

Qué se conservó:
- ...

Qué NO se tocó:
- Supabase
- RPCs
- RLS
- policies
- grants
- Edge Functions
- buckets
- variables de entorno

Verificación:
- Build/lint/test ejecutado o motivo por el que no se ejecutó.

Pendientes:
- ...
```

---

## Cuándo usar SDD

Usar SDD si la tarea implica:

* feature grande;
* tocar varios módulos;
* cambiar flujo;
* tocar pagos;
* tocar portal del instrumentador de forma amplia;
* tocar PDFs importantes;
* rediseñar arquitectura;
* crear módulos nuevos;
* riesgo de romper comportamiento existente.

Para tareas chicas de texto, estilos o componentes aislados, no hace falta ceremonia SDD completa.

---

## Regla de mínima intervención

Preferir:

* cambios pequeños;
* compatibles;
* incrementales;
* reversibles;
* fáciles de revisar.

Evitar:

* reescrituras completas;
* cambios amplios sin necesidad;
* introducir dependencias nuevas;
* crear abstracciones prematuras;
* cambiar nombres públicos sin cuidar compatibilidad.

---

## Checklist antes de finalizar

Antes de dar por terminada una tarea, verificar:

* ¿Se leyó la documentación relevante?
* ¿Se respetó `AI_WORKING_CONTEXT`?
* ¿No se tocó Supabase?
* ¿No se modificaron RPCs?
* ¿No se expusieron secretos?
* ¿No se inventaron campos?
* ¿Hay fallbacks para datos faltantes?
* ¿La UI mantiene lenguaje claro?
* ¿El cambio es mobile-friendly?
* ¿Se conservó funcionalidad previa?
* ¿Se informó exactamente qué cambió?

---

## Regla final

El agente puede actuar con autonomía dentro del frontend, documentación y UX, pero debe detenerse y pedir confirmación cuando el cambio pueda afectar datos reales, seguridad, pagos, Supabase, contratos backend o flujos productivos.

La prioridad es avanzar sin romper.
