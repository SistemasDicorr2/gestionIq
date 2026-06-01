# Informe Semanal - Armador manual

## Resumen

El modulo `Informe Semanal` es una pantalla interna de Gestion IQ para armar manualmente un informe HTML a partir de cirugias pendientes.

Ruta:

`/informe-semanal-seguimiento`

El sistema no clasifica automaticamente los casos. El usuario decide manualmente que cirugias pendientes incluir en cada seccion del informe.

## Objetivo

Permitir que el area operativa:

- Consulte cirugias pendientes dentro de un periodo.
- Busque rapidamente por paciente, codigo CX, medico, institucion o tecnico/instrumentador.
- Seleccione casos para una o dos categorias de seguimiento.
- Genere un informe HTML listo para copiar y pegar.

## Universo de datos

La pantalla trabaja solamente con:

- `reportes.fecha_cirugia` dentro del rango aplicado.
- `reportes.estado = 'Pendiente'`.

Las cirugias en estado `Enviado` no aparecen, porque se consideran fichas ya completadas.

## Enfoque funcional

Ambos bloques muestran el mismo universo de cirugias pendientes del periodo.

El sistema no intenta deducir si:

- Una ficha fue compartida al tecnico por fuera del sistema.
- Un link fue enviado por WhatsApp u otro canal.
- El tecnico/instrumentador cargado representa la verdad definitiva de la cobertura.

La categoria final del informe depende exclusivamente de la seleccion manual del usuario.

## Bloque A

Titulo:

`Fichas digitales pendientes de completar`

Uso:

El usuario selecciona las cirugias pendientes que quiere informar como casos donde la ficha fue compartida o solicitada al tecnico, pero aun no fue completada.

Significado de la seleccion:

`El area considera que este caso debe informarse como ficha pendiente de completar por el tecnico.`

## Bloque B

Titulo:

`Cirugias sin tecnico/instrumentador informado`

Uso:

El usuario selecciona las cirugias pendientes que quiere informar como casos donde aun no se cuenta con informacion clara del tecnico/instrumentador que realizo o realizara la cobertura.

Significado de la seleccion:

`El area considera que este caso debe informarse como sin tecnico/instrumentador informado.`

## Exclusividad entre bloques

Una misma cirugia no puede estar seleccionada en ambos bloques al mismo tiempo.

Regla:

- Si se selecciona en Bloque A y luego en Bloque B, queda solo en Bloque B.
- Si se selecciona en Bloque B y luego en Bloque A, queda solo en Bloque A.

Esto evita duplicados en el informe final.

## Busqueda

Cada bloque tiene un buscador local independiente.

Campos incluidos:

- Paciente.
- Codigo CX.
- Medico.
- Institucion.
- Tecnico / Instrumentador.

La busqueda no borra selecciones. Si una fila seleccionada queda oculta por el filtro de busqueda, sigue seleccionada internamente.

## Contadores

Cada bloque muestra:

- `Pendientes del periodo`: total de cirugias pendientes cargadas para el rango.
- `Mostrando`: filas visibles luego de aplicar la busqueda local.
- `Seleccionados para este informe`: cantidad elegida en ese bloque.

## Vista previa

La vista previa se genera solo con casos seleccionados.

Secciones posibles:

- `Fichas digitales pendientes de completar`.
- `Cirugias sin tecnico/instrumentador informado`.

Si una seccion no tiene seleccion, no aparece en el informe final.

## Copiado

El boton `Copiar informe HTML` se habilita cuando existe al menos una cirugia seleccionada en cualquiera de los dos bloques.

El copiado intenta usar:

- `text/html`.
- `text/plain` como fallback.

## Restricciones

El modulo es solo lectura.

No realiza:

- Creacion de estados.
- Guardado de selecciones.
- Modificacion de reportes.
- Registro de eventos.
- Marcado de casos como revisados.
- Deteccion automatica de links enviados.
- Clasificacion automatica por tecnico/instrumentador.

## Archivos relacionados

- `src/views/InformeSemanalSeguimientoView.vue`
- `src/router/index.js`
- `DATA_LOGIC.md`
- `FUNCTIONAL_SPEC.md`
- `IMPLEMENTATION_NOTES.md`
- `OVERVIEW.md`
- `TESTING_CHECKLIST.md`
