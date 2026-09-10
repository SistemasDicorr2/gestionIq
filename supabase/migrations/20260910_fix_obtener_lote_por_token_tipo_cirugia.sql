-- Migration: 20260910_fix_obtener_lote_por_token_tipo_cirugia.sql
-- Corrección en la función RPC obtener_lote_por_token para incluir el campo tipo_cirugia en el objeto JSON de cada ficha

CREATE OR REPLACE FUNCTION public.obtener_lote_por_token(
    p_token TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_lote RECORD;
    v_fichas JSONB;
    v_total_fichas INT;
BEGIN
    -- 1. Buscar lote por token
    SELECT * INTO v_lote
    FROM public.resumen_operativo_lotes
    WHERE token = p_token;

    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'error', 'Lote no encontrado o expirado.');
    END IF;

    -- 2. Consultar dinámicamente las fichas enviadas dentro del período del lote (o por IDs asociados)
    SELECT jsonb_agg(
        jsonb_build_object(
            'id', r.id,
            'id_cirugia', r.id_cirugia,
            'paciente', r.paciente,
            'medico', r.medico,
            'tipo_cirugia', r.tipo_cirugia,
            'lugar_cirugia', r.lugar_cirugia,
            'fecha_cirugia', r.fecha_cirugia,
            'fecha_envio', r.fecha_envio,
            'estado', r.estado,
            'instrumentador', r.instrumentador,
            'instrumentador_completado', r.instrumentador_completado,
            'instrumentador_dni', r.instrumentador_dni,
            'url_firma', r.url_firma,
            'consumo_realizado', r.consumo_realizado,
            'set_completo', r.set_completo,
            'informe_faltante', r.informe_faltante,
            'rating_puntualidad', r.rating_puntualidad,
            'rating_condiciones', r.rating_condiciones,
            'rating_asesoramiento', r.rating_asesoramiento,
            'rating_evaluacion_general', r.rating_evaluacion_general,
            'observaciones', r.observaciones,
            'representante_ventas', r.representante_ventas,
            'duracion_cirugia', r.duracion_cirugia,
            'tipo_logistica', r.tipo_logistica,
            'transporte_utilizado', r.transporte_utilizado,
            'created_at', r.created_at
        ) ORDER BY r.fecha_envio ASC
    ) INTO v_fichas
    FROM public.reportes r
    WHERE (
        LOWER(TRIM(r.estado)) = 'enviado'
        AND r.fecha_envio >= v_lote.periodo_desde
        AND r.fecha_envio <= v_lote.periodo_hasta
    )
    OR (r.id = ANY(v_lote.reporte_ids));

    v_total_fichas := jsonb_array_length(COALESCE(v_fichas, '[]'::jsonb));

    RETURN jsonb_build_object(
        'success', true,
        'lote', jsonb_build_object(
            'token', v_lote.token,
            'semana_key', v_lote.semana_key,
            'periodo_desde', v_lote.periodo_desde,
            'periodo_hasta', v_lote.periodo_hasta,
            'stats', jsonb_build_object(
                'total_fichas', v_total_fichas,
                'periodo_desde', v_lote.periodo_desde,
                'periodo_hasta', v_lote.periodo_hasta
            ),
            'created_at', v_lote.created_at
        ),
        'fichas', COALESCE(v_fichas, '[]'::jsonb)
    );
END;
$$;

GRANT EXECUTE ON FUNCTION public.obtener_lote_por_token TO authenticated, anon, service_role;
