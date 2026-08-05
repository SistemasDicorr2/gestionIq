-- =============================================================================
-- ROLLBACK SQL: Retirar Módulo Informe Diario de Logística — Gestión IQ
-- Archivo: supabase/migrations/20260805_logistica_informes_diarios_rollback.sql
-- NOTA: Utilizar únicamente si se requiere revertir completamente el módulo.
-- =============================================================================

BEGIN;

-- 1. Revocar y eliminar RPCs
REVOKE EXECUTE ON FUNCTION public.enviar_informe_logistica(UUID) FROM authenticated, PUBLIC, anon;
DROP FUNCTION IF EXISTS public.enviar_informe_logistica(UUID);

REVOKE EXECUTE ON FUNCTION public.buscar_cirugias_logistica(TEXT) FROM authenticated, PUBLIC, anon;
DROP FUNCTION IF EXISTS public.buscar_cirugias_logistica(TEXT);

-- 2. Eliminar Tablas (CASCADE elimina automáticamente triggers, policies e índices asociados)
DROP TABLE IF EXISTS public.logistica_informe_movimientos CASCADE;
DROP TABLE IF EXISTS public.logistica_informes_diarios CASCADE;

-- 3. Eliminar Función Trigger específica de Logística
DROP FUNCTION IF EXISTS public.set_logistica_updated_at();

COMMIT;
