-- =============================================================================
-- MIGRACIÓN SQL COMPATIBLE POSTGREST: RPC de Lectura Pública por ID TEXT/UUID
-- Archivo: supabase/migrations/20260903_obtener_informe_logistica_publico.sql
-- =============================================================================

BEGIN;

-- Limpieza preventiva de firma previa si existía con parametro UUID
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
    -- 1. Casteo seguro de texto a UUID
    BEGIN
        v_id_uuid := p_informe_id::UUID;
    EXCEPTION WHEN OTHERS THEN
        RETURN json_build_object(
            'success', false,
            'error', 'El identificador del informe no tiene un formato UUID válido.'
        )::jsonb;
    END;

    -- 2. Obtener encabezado del informe diario
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
            'error', 'Informe de logística no encontrado o el enlace es inválido.'
        )::jsonb;
    END IF;

    -- 3. Obtener movimientos asociados ordenados
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

-- Otorgar permisos de ejecución explícitos a anon y authenticated
GRANT EXECUTE ON FUNCTION public.obtener_informe_logistica_publico(TEXT) TO anon, authenticated, service_role;

COMMIT;
