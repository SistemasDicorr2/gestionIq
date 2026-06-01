# AGENTS.md — Gestión IQ

## Propósito

Este archivo define cómo deben trabajar los agentes de IA dentro del repositorio **Gestión IQ**.

Gestión IQ es una aplicación Vue 3 + Vite + Supabase orientada a trazabilidad quirúrgica, instrumentadores, fichas digitales, evidencias, logística, pagos, comprobantes, PDFs y actividad profesional del instrumentador.

La prioridad absoluta es:

> Avanzar sin romper.

---

# 1. Fuentes de contexto obligatorias

Antes de modificar código, el agente debe revisar el contexto del proyecto.

## Lectura mínima obligatoria

Leer siempre:

* `.skills/gestion-iq-safe-coding.md`
* `docs/11_AI_WORKING_CONTEXT.md`
* `docs/07_DATA_FLOW_MAP.md`
* `docs/10_TECHNICAL_DEBT_AND_RISKS.md`

## Si el cambio toca arquitectura

Leer también:

* `docs/12_CONSOLIDATED_TECHNICAL_ARCHITECTURE.md`
* `docs/03_FRONTEND_ARCHITECTURE.md`
* `docs/05_RPC_CATALOG.md`

## Si el cambio toca seguridad, pagos, Supabase, rutas públicas, storage o autenticación

Leer también:

* `docs/13_SECURITY_AUDIT_CURRENT_STATE.md`
* `docs/06_SECURITY_RLS_MODEL.md`
* `docs/09_EDGE_FUNCTIONS_AND_STORAGE.md`

## Regla

No decir “leí todo” sin evidencia.

El agente debe indicar:

* qué archivos leyó;
* qué reglas aplican;
* qué riesgos detectó;
* qué archivos va a revisar antes de implementar.

---

# 2. Principio central del proyecto

Gestión IQ trabaja con una arquitectura server-centric.

La lógica crítica vive en Supabase/PostgreSQL mediante:

* RPCs;
* vistas;
* triggers;
* RLS;
* policies;
* grants;
* storage;
* Edge Functions.

El frontend Vue debe:

* presentar información;
* mejorar UX;
* validar datos visualmente;
* consumir contratos existentes;
* no asumir reglas críticas del negocio.

---

# 3. Límites innegociables

Sin autorización explícita del usuario, el agente NO debe modificar:

* Supabase producción;
* RPCs;
* RLS;
* policies;
* grants;
* funciones SQL;
* triggers;
* migrations;
* Edge Functions;
* buckets;
* variables de entorno;
* contratos backend;
* lógica económica de pagos;
* estructura de datos real.

No ejecutar SQL destructivo.

Prohibido sin autorización:

```sql
alter
drop
delete
update
insert
grant
revoke
create policy
drop policy
create function
replace function
```

Las consultas SQL, si se piden, deben ser **read-only** por defecto.

---

# 4. Workflow de orquestación

## 4.1 Plan mode por defecto

Entrar en modo planificación para cualquier tarea no trivial.

Una tarea es no trivial si:

* toca 2 o más archivos importantes;
* puede afectar flujos existentes;
* involucra pagos;
* involucra portal del instrumentador;
* involucra PDFs;
* involucra Supabase;
* involucra rutas públicas;
* requiere decisiones de arquitectura;
* requiere entender más de 3 pasos.

Antes de implementar, escribir:

1. diagnóstico;
2. archivos a revisar;
3. plan corto;
4. riesgos;
5. verificación esperada.

Si algo sale mal, detenerse y replanificar.

No seguir empujando cambios a ciegas.

---

## 4.2 Subagent strategy

Usar subagentes o asistentes separados cuando la tarea sea compleja.

Roles sugeridos:

### Codex

Implementador principal.

Responsabilidades:

* leer documentación;
* aplicar cambios controlados;
* editar Vue/componentes/helpers;
* ejecutar build/lint;
* reportar diffs y riesgos.

### Gemini Code Assist

Revisor UX/UI y segunda opinión.

Responsabilidades:

* revisar claridad visual;
* detectar confusión en lenguaje;
* evaluar mobile-first;
* revisar si la pantalla parece demasiado técnica;
* proponer mejoras sin tocar backend.

### Agente documental

Usar para:

* actualizar `/docs`;
* resumir decisiones;
* mantener consistencia entre documentación y código.

## Regla

No permitir que dos agentes editen el mismo archivo al mismo tiempo.

Flujo correcto:

1. Gemini revisa.
2. Usuario aprueba.
3. Codex implementa.
4. Gemini revisa resultado.
5. Codex ajusta si corresponde.

---

# 5. Task management

Para tareas medianas o grandes, usar carpeta `tasks/`.

Si no existe, crear:

* `tasks/todo.md`
* `tasks/lessons.md`

## `tasks/todo.md`

Debe contener:

```md
# Task: nombre de la tarea

## Contexto
Breve descripción.

## Plan
- [ ] Paso 1
- [ ] Paso 2
- [ ] Paso 3

## Archivos involucrados
- ...

## Riesgos
- ...

## Verificación
- [ ] Build
- [ ] Revisión visual
- [ ] No se tocó Supabase
- [ ] No se modificaron RPCs

## Resultado
Resumen final.
```

## `tasks/lessons.md`

Después de cualquier corrección del usuario, registrar la lección.

Formato:

```md
# Lessons

## Fecha — Tema

### Corrección recibida
Qué corrigió el usuario.

### Patrón detectado
Qué error cometió el agente.

### Regla nueva
Qué debe hacer diferente la próxima vez.
```

## Regla

Si el usuario corrige un patrón, no repetirlo.

Ejemplo:

* Si el usuario dice “esto parece dashboard de rendimiento”, agregar regla para evitar “rendimiento”, “ranking”, “crecimiento”, “certificación” en el portal del instrumentador.

---

# 6. Verification before done

Nunca marcar una tarea como terminada sin demostrar verificación.

Verificar según corresponda:

* build;
* lint;
* revisión visual;
* búsqueda de textos incorrectos;
* revisión de imports;
* revisión de fallbacks;
* revisión mobile;
* comparación contra comportamiento anterior.

Preguntas obligatorias antes de finalizar:

* ¿Un staff engineer aprobaría este cambio?
* ¿Se tocó solo lo necesario?
* ¿Se conservó funcionalidad previa?
* ¿El cambio es reversible?
* ¿Hay riesgo para producción?
* ¿Hay datos faltantes sin fallback?
* ¿Se respetó `gestion-iq-safe-coding`?

---

# 7. Simplicidad y elegancia

Buscar la solución más simple que resuelva el problema real.

Evitar:

* refactors grandes innecesarios;
* abstracciones prematuras;
* rediseños totales si alcanza con ajuste incremental;
* duplicación de lógica;
* introducir dependencias sin necesidad;
* mezclar dominios.

Para cambios no triviales, pausar y preguntar:

> ¿Existe una forma más simple, segura y elegante de resolver esto?

Si una solución parece parche, replantear.

---

# 8. Autonomous bug fixing

Cuando el usuario reporte un bug claro:

* investigar;
* localizar causa raíz;
* revisar logs/errores;
* proponer fix;
* aplicar si es frontend-only y seguro;
* verificar.

No pedir al usuario que guíe paso a paso si el repo contiene la información necesaria.

Pero detenerse si el bug requiere:

* tocar Supabase;
* modificar RPCs;
* cambiar RLS;
* cambiar pagos;
* cambiar contratos backend;
* tocar producción.

---

# 9. Reglas del portal del instrumentador

El portal del instrumentador es una superficie pública/sensible.

Ruta principal:

* `/resumen/:token`

Componente principal:

* `ActivitySummaryView.vue`

RPC crítica relacionada:

* `autenticar_y_obtener_resumen`

## Antes de tocar esta vista

Leer:

* `.skills/gestion-iq-safe-coding.md`
* `docs/07_DATA_FLOW_MAP.md`
* `docs/11_AI_WORKING_CONTEXT.md`
* `docs/13_SECURITY_AUDIT_CURRENT_STATE.md`

## Principios UX

El portal debe ser:

* mobile-first;
* claro;
* profesional;
* simple;
* no técnico;
* útil para el instrumentador.

No debe parecer:

* dashboard interno;
* evaluación de rendimiento;
* ranking;
* sistema de productividad;
* gamificación;
* capacitación inventada;
* pantalla administrativa compleja.

---

# 10. Estructura conceptual del portal del instrumentador

## Mi Experiencia

Debe mostrar la actividad profesional registrada del instrumentador.

Usar:

* cirugías acompañadas;
* actividad quirúrgica registrada;
* procedimientos más frecuentes;
* médicos con los que trabajaste;
* instituciones donde participaste;
* actividad reciente;
* trayectoria con Districorr.

Evitar:

* rendimiento;
* ranking;
* productividad;
* fichas completadas como KPI principal;
* crecimiento profesional;
* certificaciones inventadas;
* bioseguridad;
* credencial IQ;
* entrenamiento;
* score.

Frase guía:

> Tu actividad registrada también forma parte de tu trayectoria profesional.

---

## Mis Datos

Debe contener solo información personal y de pago.

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

* usar “No especificado”;
* usar “Dato pendiente”.

Nunca mostrar:

* `null`;
* `undefined`;
* `NaN`;
* JSON;
* nombres de tablas;
* nombres de RPC;
* campos internos.

No permitir edición directa si no existe flujo seguro.

Usar:

* “Solicitar actualización”
* “Solicitar actualización por WhatsApp”

---

## Pagos y Comprobantes

Dominio crítico.

Permitido:

* mejorar visualización;
* mejorar lenguaje;
* ordenar cards;
* mostrar órdenes de pago existentes;
* mejorar estados vacíos;
* generar PDF individual por liquidación.

No permitido sin autorización:

* modificar lógica de pagos;
* modificar RPCs;
* cambiar estados económicos;
* crear escrituras nuevas;
* asumir montos;
* tocar tablas de pagos.

Lenguaje recomendado:

* Pendiente de liquidación
* Comprobante de pago cargado
* Orden de pago
* Pacientes abonados
* Monto liquidado

Evitar:

* Pagado el
* Histórico de pagos si genera confusión
* `object_key`
* `comprobante_object_key`
* `orden_de_pago_id`

PDF de comprobantes:

* debe ser individual por orden/liquidación;
* no debe descargar todo el histórico por defecto;
* no debe generar documentos enormes innecesarios.

---

## Hoja de vida profesional

Debe ser un beneficio para el instrumentador.

Debe incluir:

* nombre;
* período de actividad;
* cantidad de cirugías acompañadas;
* procedimientos frecuentes;
* médicos con los que trabajó;
* instituciones si existen;
* última cirugía registrada;
* aclaración de origen de datos.

No debe incluir:

* pagos;
* montos;
* CBU;
* alias bancario;
* datos administrativos internos;
* información sensible innecesaria.

Texto sugerido:

> Este documento resume tu experiencia registrada con Districorr. No reemplaza certificados oficiales ni documentación laboral formal.

---

# 11. Reglas sobre PDFs

Usar librerías existentes si ya están instaladas:

* `jsPDF`
* `jspdf-autotable`
* `html2canvas`

Antes de crear helpers nuevos, revisar:

* `useOrdenDePagoPDF`
* `pdfGenerator`
* `reportGeneratorService`

Principios:

* PDFs simples;
* claros;
* imprimibles;
* sin datos técnicos;
* sin JSON;
* sin campos internos.

Tipos de PDF:

1. PDF de orden/liquidación:

   * individual;
   * por orden de pago;
   * incluye cirugías/pacientes abonados;
   * incluye monto de esa orden si corresponde.

2. PDF de hoja de vida:

   * profesional;
   * sin pagos;
   * sin montos;
   * orientado a experiencia registrada.

3. PDF de resumen:

   * acotado;
   * no histórico completo;
   * solo información relevante.

---

# 12. Reglas sobre storage, R2 y archivos

No modificar Edge Functions ni buckets sin autorización.

Al trabajar con archivos:

* respetar flujo existente;
* usar R2 para evidencias/comprobantes si el flujo lo hace;
* usar bucket `firmas` solo si el flujo existente lo requiere;
* no cambiar `object_key` sin validar;
* no exponer URLs sensibles innecesarias.

Riesgos conocidos:

* bucket `firmas` público;
* bucket `documentos` público;
* CORS abierto en Edge Function;
* producción sin staging.

---

# 13. Uso de skills instaladas

Usar las skills instaladas si aplican.

Skills detectadas esperadas:

* `gestion-iq-safe-coding`
* `find-skills`
* `frontend-design`
* `cognitive-doc-design`
* `comment-writer`
* `gentle-ai-branch-pr`
* `gentle-ai-chained-pr`
* `gentle-ai-issue-creation`
* `work-unit-commits`

## Prioridad

Si hay conflicto entre una skill genérica y Gestión IQ:

> Gana Gestión IQ.

Orden de prioridad:

1. `AGENTS.md`
2. `.skills/gestion-iq-safe-coding.md`
3. `docs/11_AI_WORKING_CONTEXT.md`
4. `docs/13_SECURITY_AUDIT_CURRENT_STATE.md`
5. docs técnicos específicos
6. skills genéricas

## Cuándo usar cada skill

* `find-skills`: cuando no se sabe qué skill aplica.
* `frontend-design`: UX/UI, responsive, jerarquía visual.
* `cognitive-doc-design`: documentación clara y navegable.
* `comment-writer`: comentarios de código útiles, no obvios.
* `work-unit-commits`: organizar cambios en unidades pequeñas.
* `gentle-ai-branch-pr`: solo si el usuario pide ramas/PR.
* `gentle-ai-chained-pr`: solo si el usuario pide PRs encadenados.
* `gentle-ai-issue-creation`: solo si el usuario pide issues.

---

# 14. Evidencia y trazabilidad

Cuando el agente explique algo, clasificar la evidencia:

* Confirmado por código
* Confirmado por documentación
* Confirmado por Supabase
* Inferido
* Pendiente de validar

No presentar inferencias como hechos.

---

# 15. Documentación viva

Si un cambio modifica un flujo importante, actualizar documentación.

Ejemplos:

* si cambia flujo de datos: `docs/07_DATA_FLOW_MAP.md`;
* si cambia arquitectura frontend: `docs/03_FRONTEND_ARCHITECTURE.md`;
* si cambia RPC consumida: `docs/05_RPC_CATALOG.md`;
* si aparece riesgo técnico: `docs/10_TECHNICAL_DEBT_AND_RISKS.md`;
* si cambia contexto de agentes: `docs/11_AI_WORKING_CONTEXT.md`.

No inventar documentación.

Marcar como:

* confirmado;
* inferido;
* pendiente de validar.

---

# 16. Formato obligatorio antes de implementar

Antes de tocar archivos, responder:

```md
## Contexto leído
- ...

## Entendimiento
- ...

## Archivos a revisar
- ...

## Plan
- [ ] ...
- [ ] ...
- [ ] ...

## Riesgos
- ...

## Confirmación requerida
Sí / No
```

Si el cambio es pequeño, frontend-only y seguro, puede indicar:

> Confirmación requerida: No, cambio frontend-only de bajo riesgo.

---

# 17. Formato obligatorio al finalizar

Al terminar, responder:

```md
## Archivos modificados
- ...

## Qué cambió
- ...

## Qué se conservó
- ...

## Qué NO se tocó
- Supabase
- RPCs
- RLS
- policies
- grants
- Edge Functions
- buckets
- variables de entorno

## Verificación
- ...

## Pendientes
- ...
```

---

# 18. Regla final

El agente puede actuar con autonomía dentro de frontend, documentación y UX.

Debe detenerse y pedir confirmación cuando el cambio pueda afectar:

* datos reales;
* seguridad;
* pagos;
* Supabase;
* contratos backend;
* rutas públicas sensibles;
* storage;
* PDFs críticos;
* flujos productivos.

La prioridad es:

> simple, seguro, verificable y reversible.
