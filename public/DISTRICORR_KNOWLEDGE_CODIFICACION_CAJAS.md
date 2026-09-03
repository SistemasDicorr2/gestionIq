# DISTRICORR — Knowledge Base de Cajas, Sets y Codificación

**Versión de consolidación:** 2026-09-03  
**Objetivo:** reunir en un único documento el conocimiento actualmente disponible sobre cajas, sets, instrumental, motores/equipos, estructura de códigos, relación físico–lógica y criterios propuestos para convertir la codificación en una fuente de verdad controlada.

> Este documento distingue tres niveles: **Regla confirmada** (criterio operativo definido por Districorr), **Histórico observado** (lo que actualmente aparece en archivos/ERP) y **Propuesta** (modelo recomendado para normalizar el futuro). Una propuesta no modifica ni corrige automáticamente los códigos históricos.

## 1. Fuentes consolidadas

- `CAJAS EN GENERAL CATEGORIZADO`: índice maestro físico/categorizado; informa **69 cajas propias** y enlaza los catálogos de detalle.
- `LISTADO DE ARTICULOS CARGADOS.xlsx`: padrón del ERP con **236 artículos**.
- `Codificacion de cajas.xlsx` y `CODIFICACION DE CAJA.xlsx`: diccionarios históricos y ejemplos de composición de códigos.
- **CLAVOS ENDOMEDULARES** — `CLAVO ENDOMEDULARES` — https://docs.google.com/spreadsheets/d/1vJ3m1urUV4kyXXoW1ck41sOk2l-n_o-4-FnAh5gC6Ew/edit
- **OSTEOSÍNTESIS** — `OSTEOSINTESIS CODIFICACION.xlsx` — https://docs.google.com/spreadsheets/d/1L6a042LRr6U3s6Ma8zyPOd8A-oWKkNqy/edit
- **REEMPLAZOS ARTICULARES** — `REEMPLAZO ARTICULARES` — https://docs.google.com/spreadsheets/d/1_T0l2IFxVVg3sXXCLv3k61hfFNsPMGNkShLBMJQmivc/edit
- **CIRUGÍA MÍNIMAMENTE INVASIVA** — `CIRUGIA MINIMAMENTE INVASIVA` — https://docs.google.com/spreadsheets/d/1i5E5i_NdKeLPMlwVtU5kK_FhbvPu_-bg0n7B67D7JY4/edit
- **EXTRACCIÓN Y REVISIÓN** — `EXTRACCION Y REVISION DE IMPLANTES` — https://docs.google.com/spreadsheets/d/1aYvFturQask0YX8cBCgBaH43ZeKJfBK1qFURw9gApVs/edit
- **MEDICINA DEL DEPORTE** — `MEDICINA DEL DEPORTE` — https://docs.google.com/spreadsheets/d/1iklz4KiwO-ASbulG7xU242O2P5uBSWaszrOhq9cqfq8/edit
- **MOTORES Y EQUIPOS** — `EQUIPOS DE FERRETERIA` — https://docs.google.com/spreadsheets/d/1rlbYARPF0fzjjElks7kNlcyZs8FlJrv4nAcmRHm4k-8/edit

## 2. Modelo operativo confirmado: físico ≠ lógico

### Regla confirmada

- Una **caja física** puede contener en la práctica instrumental e implantes sin que esas partes estén permanentemente asignadas entre sí.
- En el sistema, **instrumental/caja** y **set de implantes** deben mantenerse como entidades lógicas separadas, aunque físicamente estén dentro del mismo contenedor.
- `OS` identifica la familia/categoría de osteosíntesis usada para la **caja de instrumental**.
- `ST` identifica un **set**, usado en el modelo actual para los implantes (por ejemplo placas).
- La coincidencia de serie **NO crea una relación 1:1**. `OS-...-004` no pertenece obligatoriamente a `ST-...-004`. Los sets pueden mezclarse con cajas compatibles.
- El número de serie identifica una instancia dentro de su código/familia lógica; no debe usarse como clave de emparejamiento físico entre OS y ST.

### Ejemplo confirmado

| Entidad | Código | Interpretación |
|---|---|---|
| Caja/instrumental | `OS-T35VLU-004` | Osteosíntesis, titanio, 3,5, Volar, serie 004 |
| Set/implantes | `ST-T35VLP-004` | Set de implantes/placas Volar 3,5, serie 004 |

Aunque puedan coexistir físicamente, son **dos registros lógicos independientes**. La serie 004 compartida no debe convertirse en FK ni en asignación permanente.

## 3. Inventario físico categorizado actualmente

El índice `CAJAS EN GENERAL CATEGORIZADO` presenta el siguiente conteo. Este conteo es de **cajas propias físicas/categorizadas**, no de entidades lógicas ni de todos los códigos existentes en ERP.

| Grupo | Cantidad |
|---|---:|
| Clavos endomedulares | 13 |
| Osteosíntesis — Placa/Clavo DHS-DCS + Tutor AO | 2 |
| Osteosíntesis 3,5 | 16 |
| Osteosíntesis 4,5 | 4 |
| Reemplazos articulares | 9 |
| Cirugía mínimamente invasiva — Grandes fragmentos | 3 |
| Cirugía mínimamente invasiva — Pequeños fragmentos 3,5/Herbert 3,0 | 4 |
| Cirugía mínimamente invasiva — Mini Herbert + Microfragmento | 4 |
| Extracción y revisión de implantes | 6 |
| Medicina del deporte | 8 |
| **TOTAL CAJAS PROPIAS** | **69** |

Motores y equipos médicos aparecen enlazados por separado en el índice maestro; por eso no deben confundirse con el total físico de 69 cajas.

## 4. Anatomía histórica del código de cajas

Los diccionarios históricos ejemplifican la estructura con `OS-T35VLU-001`:

| Segmento conceptual | Ejemplo | Significado histórico |
|---|---:|---|
| Clasificación general | `OS` | Osteosíntesis |
| Material | `T` | Titanio |
| Medida / variante | `35` | 3,5 mm |
| Clasificación específica | `VL` | Volar |
| Contenido | `U` | Unificado (histórico) |
| Serie | `001` | Instancia/serie |

**Forma técnica observada predominante:** `AA-XXXXXX-999` (2 caracteres + guion + 6 caracteres semánticos + guion + 3 dígitos). El significado interno de los 6 caracteres varía según el tipo de artículo.

### Punto pendiente importante

En los códigos históricos de osteosíntesis el contenido `U` significa **UNIFICADO**, porque originalmente varias cajas se describían como “instrumental + tornillos”. El modelo operativo nuevo separa lógicamente instrumental y set de implantes. Por lo tanto, para códigos futuros debe decidirse explícitamente si:

1. `OS` conserva `U` por compatibilidad histórica; o
2. los nuevos `OS` pasan a usar `I` (instrumental) y se reserva `P` para implantes/sets.

**No debe cambiarse este significado por inferencia ni renombrarse el histórico sin una decisión formal.**

## 5. Diccionario histórico de segmentos

### 5.1 Clasificación general — registrada en los diccionarios

| Código | Significado histórico | Observación |
|---|---|---|
| `RR` | Reemplazo rodilla | Aparece en códigos de rodilla JPX. |
| `RC` | Reemplazo cadera cementada | El uso real actual también incluye no cementada/otros; requiere normalización. |
| `RN` | Reemplazo cadera no cementada | Definido en diccionario, pero los catálogos actuales usan RC en varios no cementados. |
| `AR` | Artroscopia | Uso observado. |
| `TR` | Tornillo | Uso observado. |
| `OS` | Osteosíntesis | En el modelo actual representa la caja/instrumental de osteosíntesis. |
| `LC` | Ligamento | Diccionario histórico; el detalle actual también usa LG. |
| `CL` | Clavo | Uso observado. |
| `EX` | Extracción | Uso observado. |
| `PC` | Placa/Clavo | Uso observado para DHS/tutor en históricos. |
| `HE` | Herbert | Uso observado. |
| `RP` | Reemplazo cúpula | También aparece en otros reemplazos parciales. |
| `TU` | Tutor | Definido históricamente. |
| `GM` | Gamma | Definido históricamente; el catálogo de clavos contiene Gamma con otros prefijos. |
| `ST` | Set | Regla operativa actual: entidad lógica de implantes/placas. |
| `RD` | Reducción | Observado en reducción de pelvis. |
| `LG` | Ligamento | Observado en Medicina del Deporte/ERP. |
| `MT` | Motor | Gramática específica de motores. |
| `SR` | Sierra | Gramática específica de equipos/motores. |
| `EQ` | Equipo | Gramática específica de equipos. |
| `MS` | Motor + sierra / unidad combinada | Observado en Overfix. |
| `MC` | Micro motor | Observado en BTR. |
| `TL` | Taladro de mano | Observado en equipos. |

### 5.2 Material

| Código | Significado histórico |
|---|---|
| `T` | Titanio |
| `A` | Acero |
| `P` | PEEK |
| `X` | Más de uno / no específico |

### 5.3 Medida / variante

- `00`: rango variado / sin medida única según contexto.
- `35`: 3,5 mm.
- `45`: 4,5 mm.
- `70`: 7,0 mm.
- `60`: 6,0 mm.
- `25`: 2,5 mm.
- `40`: 4,0 mm.
- En clavos Expert el diccionario histórico permite utilizar este espacio para **lado**: `I1` (izquierda) y `D2` (derecha).
- Por lo anterior, este segmento no debe tratarse en base de datos como un simple número: conceptualmente es **medida/variante**.

### 5.4 Clasificación específica — diccionario histórico

| Código | Significado histórico |
|---|---|
| `ST` | Set |
| `TP` | Tibia proximal |
| `FR` | Fémur |
| `CM` | Cementado |
| `CN` | No cementado |
| `NT` | Tallo no cementado |
| `HD` | Húmero distal |
| `RT` | Rótula |
| `VL` | Volar |
| `TX` | Tibia Expert |
| `FX` | Fémur Expert |
| `TA` | Tibia con antibiótico |
| `CV` | Clavícula |
| `RS` | Reconstrucción |
| `HP` | Húmero proximal |
| `DT` | Tercio tubo + DCP |
| `PR` | Peroné |
| `TD` | Tibia distal |
| `TL` | T y L |
| `DA` | DCP ancha y angosta |
| `SC` | Supracondílea |
| `JK` | Placa Jockey |
| `TR` | Trebolar |
| `HB` | Herbert Barouk cónico |
| `GM` | Gamma |
| `BT` | Botón |
| `AP` | Arpón |
| `SM` | Sutura meniscal |
| `MC` | Microfragmento |
| `TT` | Tallo tricónico |
| `DM` | Doble movilidad |
| `DH` | DHS |
| `OL` | Olécranon |
| `OC` | Osteosíntesis clavo |
| `HM` | Herbert mini |
| `TC` | Tornillo canulado |
| `CR` | Cúpula radial |
| `AO` | Tipo de tutor |
| `JT` | Rodilla tibial |
| `JF` | Rodilla femoral |
| `JP` | Rodilla patelar |
| `TN` | Tenodesis |

> **Advertencia:** esta tabla refleja el diccionario histórico, no un diccionario ya saneado. En los catálogos actuales existen colisiones y usos diferentes; por ejemplo `TD` aparece asociado a conceptos distintos en algunas filas. No debe usarse todavía como tabla de constraints sin auditoría.

### 5.5 Contenido

| Código | Significado histórico |
|---|---|
| `I` | Instrumental |
| `P` | Implante |
| `U` | Unificado |
| `M` | Maletín |
| `C` | Contenedor |

### 5.6 Serie

- Formato histórico esperado: `001`, `002`, `003`, etc.
- La serie es parte de la identidad del registro y **no debe reutilizarse** una vez emitida.
- La secuencia debe ser independiente por **código base lógico**. Que `OS-...-004` y `ST-...-004` existan no crea una pareja.

## 6. Gramática histórica de motores y equipos

### Motores

Ejemplo: `MT-CANDWB-001` → `MT` (motor) + `CAN` (canulado) + `DW` (DeWalt) + `B` (a batería) + `001` (serie).

Elementos definidos/observados:
- Clasificación general: `MT` motor, `SR` sierra; además existen `MS`, `MC` y `TL` en el catálogo real.
- Tipo: `CAN` canulado, `TAL` taladro, `UNI` unificado motor/sierra, `SIM` simple, `REC` reciprocante.
- Marca histórica: `DW` DeWalt, `MK` Makita, `WK` Milwaukee, `OF` Overfix, `SW` Swipro. El catálogo real usa también variantes como `MW`, por lo que debe normalizarse antes de bloquear códigos.
- Funcionalidad: `B` batería, `E` eléctrico.

### Equipos

Ejemplo: `EQ-BIRCMM-001` → equipo + bomba de irrigación + CONMED + maletín + serie.
El diccionario histórico define `BIR` para bomba de irrigación y `CM` para CONMED. El catálogo real incorpora otros tipos como radiofrecuencia y Shaver.

## 7. Problemas históricos detectados que justifican una fuente de verdad

Estos son **ejemplos de inconsistencias reales** encontradas; no se corrigen automáticamente:
| Ejemplo | Fuente/uso | Riesgo |
|---|---|---|
| `ST-T35TDP-001` | Tibia distal 3,5 | El mismo segmento `TD`/código base aparece en otros registros usados para DCP/Terciotubo. |
| `OS-T35TPU-001` | Fila rotulada Tibia distal | El diccionario histórico define `TP` como Tibia proximal. |
| `OS-T35TDU-005` | Fila rotulada Tibia proximal | El diccionario histórico define `TD` como Tibia distal. |
| `ST-T35VLP-009` | Contenido Volar 009 | La fila del archivo de osteosíntesis tiene categoría/serie que indican DCP/Terciotubo 008. |
| `MT-SIMTLB-004` | Motor serie 004 | En la fila de asignación de osteosíntesis la columna serie figura 003. |
| `MT-SIMTLB-007` | Motor Total | Aparece reutilizado en más de una fila de asignación del catálogo de osteosíntesis. |
| `ST-T35OLP-011` | Ubicado bajo Calcáneo/Philo | Código/categoría dicen Olécranon mientras el contenido menciona Philo. |
| `CL-AD2FXP-001` | Fémur Expert derecha, fuente dice Titanio | El primer carácter del bloque intermedio entra en conflicto con el significado histórico `A = Acero`; requiere definición formal de la variante por lado. |
| Gamma | Catálogo de clavos vs ERP | El detalle de clavos usa prefijos `RC-...GM...`; el ERP contiene variantes `CL-...GM...`. |
| Ligamento | Diccionario vs uso real | El diccionario histórico define `LC`; fuentes actuales también usan `LG`. |
| Reemplazo no cementado | Diccionario vs uso real | El diccionario define `RN`, pero el catálogo actual usa `RC` para varias entidades no cementadas. |

Además, el ERP contiene códigos que no cumplen el patrón dominante (por ejemplo `OS-T35CLU0001`) y códigos externos/SAI que deliberadamente siguen otra codificación. **No deben forzarse todos al mismo patrón.**

## 8. Regla objetivo para el futuro: el código no se escribe a mano

### Propuesta

Al crear una caja/set/equipo, el usuario debe seleccionar valores de catálogos controlados. El sistema genera el código.

Ejemplo de alta:

| Campo | Selección |
|---|---|
| Tipo lógico | OS — Osteosíntesis / caja instrumental |
| Material | T — Titanio |
| Medida/variante | 35 — 3,5 mm |
| Clasificación específica | VL — Volar |
| Contenido | valor permitido según política futura |
| Serie | asignada automáticamente |

El sistema muestra una **vista previa** del código y valida antes de confirmar. No se permite introducir libremente `VL`, `35`, una abreviatura nueva ni la serie.

## 9. Propuesta de fuente de verdad

### Fuente principal

**Supabase/PostgreSQL** debe ser la fuente de verdad transaccional. Google Sheets, Markdown y PDF deben ser salidas de consulta/auditoría, no lugares donde se inventen códigos nuevos.

### Tablas sugeridas

| Tabla conceptual | Función | Restricción clave |
|---|---|---|
| `codigo_tipos` | OS, ST, CL, RC, TR, MT, EQ, etc. | `code` único; nombre canónico; estado activo/inactivo. |
| `codigo_materiales` | T, A, P, X. | Código y nombre normalizado únicos. |
| `codigo_variantes` | Medidas, rango, lado u otras variantes. | No asumir que siempre es numérico. |
| `codigo_clasificaciones` | VL Volar, TP Tibia proximal, etc. | Código único + nombre normalizado único + aliases controlados. |
| `codigo_contenidos` | I, P, U, M, C u otros aprobados. | Valores permitidos y alcance documentado. |
| `familias_quirurgicas` | Agrupa compatibilidad lógica sin asignación física 1:1. | ID interno estable; no usar la serie como relación. |
| `codigos_maestros` | Todos los códigos emitidos. | `codigo` UNIQUE; componentes guardados por FK; no reutilizar. |
| `contenedores_fisicos` | Identifica caja/bandeja física real. | ID propio independiente del código lógico. |
| `contenedor_asignaciones` | Qué entidades lógicas están dentro de un contenedor en un período. | Relación temporal; permite cambiar combinaciones OS/ST. |
| `codigo_aliases` | Nombres antiguos, sobrenombres, equivalencias de búsqueda. | No modifica código ni nombre canónico. |

## 10. Reglas de integridad recomendadas

1. **Código único:** la base rechaza un código ya existente.
2. **Clasificación específica única:** una abreviatura no puede tener dos significados activos.
3. **Nombre normalizado único:** evita crear `Volar`, `Placa volar` y `Radio volar` como tres clasificaciones si son el mismo concepto.
4. **Serie automática:** se obtiene el siguiente valor libre dentro del código base correspondiente.
5. **No reutilización:** un código anulado queda histórico y nunca se reasigna.
6. **No edición destructiva:** si un código fue incorrecto, se marca `ANULADO/REEMPLAZADO` y se enlaza al nuevo código.
7. **Alias separado:** el apodo operativo puede cambiar sin alterar el nombre canónico ni el código.
8. **Auditoría:** registrar quién creó/aprobó una clasificación y quién emitió un código.
9. **Externos separados:** códigos de proveedores/SAI permanecen como identificadores externos; no se fuerzan a la gramática Districorr.
10. **Concurrencia segura:** la asignación de serie debe ocurrir dentro de una transacción/constraint de base de datos para evitar que dos usuarios creen el mismo siguiente número.

## 11. Política de nombres recomendada

### Problema a evitar

No permitir descripciones libres que terminen en variantes como: “CAJA OSTEOSINTESIS VOLAR TITANIO VOLAR 3,5 CAJA 004”, “OSTEOSINTESIS VOLAR 3.5 TIT 004”, etc.

### Propuesta

Generar el **nombre canónico** a partir de los componentes estructurados y guardar el texto libre solo como alias/observación.

- Caja instrumental: `Caja instrumental · Osteosíntesis Volar 3,5 · Titanio · 004`.
- Set de implantes: `Set de implantes · Volar 3,5 · Titanio · 009`.
- Alias opcional: `Volar nueva`, `Volar larga`, etc., sin afectar el identificador.

## 12. Flujo recomendado para emitir un código nuevo

1. Seleccionar la familia/tipo lógico existente.
2. Seleccionar material permitido.
3. Seleccionar medida/variante permitida.
4. Seleccionar clasificación específica existente.
5. Seleccionar contenido/rol válido.
6. Si la clasificación no existe, **detener el alta** y crear/validar primero la nueva entrada del diccionario.
7. Calcular el código base.
8. Asignar automáticamente la siguiente serie.
9. Mostrar código y nombre canónico en vista previa.
10. Validar constraint de unicidad y guardar en una única transacción.

## 13. Migración del histórico

### Propuesta de procedimiento

- Importar todos los códigos actuales **sin renombrarlos**.
- Descomponer los que sean interpretables en segmentos estructurados.
- Marcar cada registro como `VALIDADO`, `LEGACY`, `EXTERNO` o `REQUIERE_REVISION`.
- Detectar colisiones de abreviaturas, descripciones y series.
- Definir el Diccionario Maestro V1 con aprobación humana.
- Congelar el histórico: a partir de la fecha de corte, ningún código nuevo se crea fuera del generador.
- Publicar el diccionario a Google Sheet/Markdown/PDF como documentación de consulta.

## 14. Datos de cruce actual

- Registros del ERP analizados: **236**.
- Referencias encontradas en los 7 catálogos de detalle: **169** filas.
- Códigos únicos en catálogos de detalle: **155**.
- Coincidencias exactas de código entre detalle y ERP: **86**.
- Códigos del detalle sin coincidencia exacta en ERP: **69**.
- Códigos del ERP sin coincidencia exacta en los catálogos de detalle: **150**.

Estas diferencias **no significan automáticamente error**: pueden representar versiones históricas, códigos nuevos, asignaciones de motores, entidades externas o cambios de nomenclatura. Deben auditarse antes de una migración definitiva.

## 15. Decisiones que todavía deben cerrarse antes de bloquear el generador

- Definir si el contenido futuro de `OS` seguirá siendo `U` o pasará a `I`.
- Resolver el significado único de abreviaturas actualmente colisionadas (`TD`, `TP`, variantes DCP/Terciotubo, etc.).
- Definir prefijo definitivo para reemplazos no cementados (`RC` vs `RN`) preservando el histórico.
- Definir estándar definitivo de ligamentos (`LC` vs `LG`).
- Normalizar códigos de marca en motores (`WK`/`MW`, etc.).
- Determinar qué códigos son puramente externos/proveedor y cuáles serán códigos internos Districorr.
- Definir si los contenedores físicos recibirán un identificador propio (recomendado) independiente de OS/ST.

## 16. Principio rector

> **El código identifica una entidad lógica; no debe intentar describir por sí solo toda la realidad física. La realidad física, la compatibilidad entre componentes y la ubicación deben modelarse mediante relaciones de base de datos.**

El objetivo final es que una persona **seleccione conceptos conocidos** y el sistema produzca un identificador estable, en lugar de depender de recordar abreviaturas o inventar nombres en el momento.
