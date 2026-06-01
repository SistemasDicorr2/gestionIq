Gestion IQ - Indice de documentacion tecnica

Documentacion generada desde el codigo real del repositorio y los archivos
disponibles en Documentacion/, supabase/ y docs/.

Criterios de evidencia

  - Confirmado por codigo : surge de archivos en src/, supabase/functions/,
    configuracion Vite/Supabase o dependencias.
  - Confirmado por Supabase : surge de DDL, SQL, CSV/exportaciones read-only,
    auditoria Supabase o documentos exportados disponibles en Documentacion/,
    supabase/config.toml y docs/12_/docs/13_.
  - Inferido : deducido por nombres, relaciones de uso y flujos entre
    componentes.
  - Pendiente de validar : no hay evidencia suficiente en el workspace.
Los primeros documentos se generaron con codigo y .txt locales. Luego se
incorporaron 12_CONSOLIDATED_TECHNICAL_ARCHITECTURE.md
y 13_SECURITY_AUDIT_CURRENT_STATE.md, que agregan evidencia de exportaciones
CSV/consultas read-only sobre Supabase produccion. Para seguridad, RLS, grants,
buckets y ambiente, esos dos archivos son fuente prioritaria.

Archivos principales

  - 01_PROJECT_OVERVIEW.md: objetivo funcional, usuarios, roles y modulos
    detectados.
  - 02_TECH_STACK.md: stack real, dependencias, configuracion y variables de
    entorno.
  - 03_FRONTEND_ARCHITECTURE.md: arquitectura Vue, carpetas, rutas, vistas,
    componentes y patrones.
  - 04_SUPABASE_DATABASE_ARCHITECTURE.md: inventario de tablas, relaciones,
    vistas, triggers y faltantes de metadata.
  - 05_RPC_CATALOG.md: catalogo de RPC consumidas por frontend y referencias
    disponibles.
  - 06_SECURITY_RLS_MODEL.md: autenticacion, RLS, policies, roles y riesgos.
  - 07_DATA_FLOW_MAP.md: flujos frontend a Supabase por dominio funcional.
  - 08_MODULE_MAP.md: mapa por modulos con vistas, componentes, tablas y RPCs.
  - 09_EDGE_FUNCTIONS_AND_STORAGE.md: Edge Functions, R2, presigned URLs y
    storage.
  - 10_TECHNICAL_DEBT_AND_RISKS.md: deuda tecnica, acoplamientos, riesgos y
    reconmendaciones.
  - 11_AI_WORKING_CONTEXT.md: contexto operativo para futuras IAs/Codex.
  - 12_CONSOLIDATED_TECHNICAL_ARCHITECTURE.md: consolidado tecnico actualizado
    con evidencia de codigo y Supabase.
  - 13_SECURITY_AUDIT_CURRENT_STATE.md: auditoria actual de seguridad, RLS,
    policies, grants, buckets y RPCs.
Auxiliares

  - database/TABLE_DICTIONARY.md: diccionario de tablas detectadas.
  - database/RELATIONSHIP_MAP.md: relaciones confirmadas y pendientes.
  - database/RPC_DEPENDENCY_MAP.md: dependencia RPC -> consumidores.
  - frontend/COMPONENT_CATALOG.md: catalogo de componentes principales.
  - frontend/ROUTE_MAP.md: mapa de rutas Vue.

Documentacion existente preservada

  - informe-semanal-seguimiento/: documentacion existente del modulo Armador de
    Informe Semanal.