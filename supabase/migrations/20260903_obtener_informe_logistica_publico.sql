-- =============================================================================
-- MIGRACIÓN SQL DEFINITIVA: Permisos de Lectura Pública para Informes de Logística
-- Archivo: supabase/migrations/20260903_obtener_informe_logistica_publico.sql
-- =============================================================================

BEGIN;

-- 1. Habilitar permisos SELECT para el rol anon (usuarios no autenticados)
GRANT SELECT ON TABLE public.logistica_informes_diarios TO anon, authenticated;
GRANT SELECT ON TABLE public.logistica_informe_movimientos TO anon, authenticated;

-- 2. Crear políticas RLS de lectura pública (SELECT) para el rol anon
DROP POLICY IF EXISTS "logistica_informes_anon_select_policy" ON public.logistica_informes_diarios;
CREATE POLICY "logistica_informes_anon_select_policy" ON public.logistica_informes_diarios
    FOR SELECT TO anon
    USING (true);

DROP POLICY IF EXISTS "logistica_movimientos_anon_select_policy" ON public.logistica_informe_movimientos;
CREATE POLICY "logistica_movimientos_anon_select_policy" ON public.logistica_informe_movimientos
    FOR SELECT TO anon
    USING (true);

-- 3. Crear/Actualizar la RPC pública SECURITY DEFINER
DROP FUNCTION IF EXISTS public.obtener_informe_logistica_publico(UUID);
DROP FUNCTION IF EXISTS public.obtener_informe_logistica_publico(TEXT);

CREATE OR REPLACE FUNCTION public.obtener_informe_logistica_publico(p_informe_id TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    v_id_uuid UUID;
    v_informe RECORD;
    v_movimientos JSONB;
BEGIN
    BEGIN
        v_id_uuid := p_informe_id::UUID;
    EXCEPTION WHEN OTHERS THEN
        RETURN json_build_object(
            'success', false,
            'error', 'El identificador del informe no tiene un formato UUID válido.'
        )::jsonb;
    END;

    SELECT 
        id,
        fecha,
        responsable_nombre,
        zona,
        observacion_general,
        estado,
        created_at,
        enviado_at
    INTO v_informe
    FROM public.logistica_informes_diarios
    WHERE id = v_id_uuid;

    IF NOT FOUND THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Informe de logística no encontrado.'
        )::jsonb;
    END IF;

    SELECT COALESCE(
        json_agg(
            json_build_object(
                'id', m.id,
                'informe_id', m.informe_id,
                'reporte_id', m.reporte_id,
                'id_cirugia_snapshot', m.id_cirugia_snapshot,
                'cliente_snapshot', m.cliente_snapshot,
                'paciente_snapshot', m.paciente_snapshot,
                'medico_snapshot', m.medico_snapshot,
                'institucion_snapshot', m.institucion_snapshot,
                'fecha_cirugia_snapshot', m.fecha_cirugia_snapshot,
                'tipo_movimiento', m.tipo_movimiento,
                'destino', m.destino,
                'cantidad_cajas', m.cantidad_cajas,
                'cantidad_bultos', m.cantidad_bultos,
                'resultado', m.resultado,
                'tiene_pendiente', m.tiene_pendiente,
                'cantidad_pendiente', m.cantidad_pendiente,
                'detalle_pendiente', m.detalle_pendiente,
                'motivo_pendiente', m.motivo_pendiente,
                'observaciones', m.observaciones,
                'orden', m.orden
            ) ORDER BY m.orden ASC
        ),
        '[]'::jsonb
    ) INTO v_movimientos
    FROM public.logistica_informe_movimientos m
    WHERE m.informe_id = v_id_uuid;

    RETURN json_build_object(
        'success', true,
        'informe', to_jsonb(v_informe),
        'movimientos', v_movimientos
    )::jsonb;
END;
$$;

GRANT EXECUTE ON FUNCTION public.obtener_informe_logistica_publico(TEXT) TO anon, authenticated, service_role;

-- 4. Notificar recarga de schema cache a PostgREST
NOTIFY pgrst, 'reload schema';

COMMIT;
