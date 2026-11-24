-- Migration: 20261124_fix_generar_lote_semanal_acumulativo.sql
-- Garantiza que generar_o_consultar_lote_semanal sea acumulativo (últimos 60 días pendientes sin pago,
-- excluyendo cirugías omitidas) incluso cuando se invoca sin p_reporte_ids o sobre un semana_key existente.
-- Elimina el punto ciego entre cortes semanales (ej. fichas enviadas los viernes después del cron o entre martes y viernes).

CREATE OR REPLACE FUNCTION public.generar_o_consultar_lote_semanal(
    p_desde TIMESTAMPTZ,
    p_hasta TIMESTAMPTZ,
    p_semana_key TEXT,
    p_reporte_ids BIGINT[] DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_existing RECORD;
    v_reportes RECORD;
    v_final_ids BIGINT[];
    v_omitidos_ids BIGINT[];
    v_token TEXT;
    v_stats JSONB;
    v_total_fichas INT;
    v_total_inst INT;
    v_total_lugares INT;
    v_min_fecha TIMESTAMPTZ;
    v_max_fecha TIMESTAMPTZ;
    v_new_id UUID;
BEGIN
    -- 0. Obtener IDs de cirugías omitidas configuradas
    SELECT COALESCE(
        array_agg((item->>'id')::BIGINT),
        '{}'::BIGINT[]
    )
    INTO v_omitidos_ids
    FROM public.resumen_operativo_config cfg,
         jsonb_array_elements(
             CASE
                 WHEN jsonb_typeof(cfg.value) = 'array' THEN cfg.value
                 ELSE '[]'::jsonb
             END
         ) AS item
    WHERE cfg.key = 'cirugias_omitidas'
      AND (item->>'id') ~ '^[0-9]+$';

    v_omitidos_ids := COALESCE(v_omitidos_ids, '{}'::BIGINT[]);

    -- 1. Si se pasan IDs explícitos (las cirugías consolidadas en el reporte semanal)
    IF p_reporte_ids IS NOT NULL AND array_length(p_reporte_ids, 1) > 0 THEN
        SELECT
            COALESCE(array_agg(r.id), '{}'::BIGINT[]) AS ids,
            COUNT(r.id) AS total_fichas,
            COUNT(DISTINCT NULLIF(TRIM(r.instrumentador), '')) AS total_inst,
            COUNT(DISTINCT NULLIF(TRIM(r.lugar_cirugia), '')) AS total_lugares,
            MIN(COALESCE(r.fecha_cirugia::timestamptz, r.fecha_envio)) AS min_fecha,
            MAX(COALESCE(r.fecha_cirugia::timestamptz, r.fecha_envio)) AS max_fecha
        INTO v_reportes
        FROM public.reportes r
        WHERE r.id = ANY(p_reporte_ids)
          AND r.pago_id IS NULL
          AND NOT (r.id = ANY(v_omitidos_ids));

        v_final_ids := COALESCE(v_reportes.ids, '{}'::BIGINT[]);
        v_total_fichas := COALESCE(v_reportes.total_fichas, 0);
        v_total_inst := COALESCE(v_reportes.total_inst, 0);
        v_total_lugares := COALESCE(v_reportes.total_lugares, 0);
        v_min_fecha := COALESCE(v_reportes.min_fecha, p_desde);
        v_max_fecha := COALESCE(v_reportes.max_fecha, p_hasta);
    ELSE
        -- Fallback acumulativo: todas las fichas enviadas sin pagar de los últimos 60 días (sin omitidas)
        SELECT
            COALESCE(array_agg(r.id), '{}'::BIGINT[]) AS ids,
            COUNT(r.id) AS total_fichas,
            COUNT(DISTINCT NULLIF(TRIM(r.instrumentador), '')) AS total_inst,
            COUNT(DISTINCT NULLIF(TRIM(r.lugar_cirugia), '')) AS total_lugares,
            MIN(COALESCE(r.fecha_cirugia::timestamptz, r.fecha_envio)) AS min_fecha,
            MAX(COALESCE(r.fecha_cirugia::timestamptz, r.fecha_envio)) AS max_fecha
        INTO v_reportes
        FROM public.reportes r
        WHERE LOWER(TRIM(r.estado)) = 'enviado'
          AND r.pago_id IS NULL
          AND r.fecha_cirugia IS NOT NULL
          AND r.fecha_cirugia >= (CURRENT_DATE - INTERVAL '60 days')
          AND NOT (r.id = ANY(v_omitidos_ids));

        v_final_ids := COALESCE(v_reportes.ids, '{}'::BIGINT[]);
        v_total_fichas := COALESCE(v_reportes.total_fichas, 0);
        v_total_inst := COALESCE(v_reportes.total_inst, 0);
        v_total_lugares := COALESCE(v_reportes.total_lugares, 0);
        v_min_fecha := COALESCE(v_reportes.min_fecha, p_desde);
        v_max_fecha := COALESCE(v_reportes.max_fecha, p_hasta);
    END IF;

    -- 2. Idempotencia con actualización: si el lote de esta semana ya existe, actualizar con las pendientes vigentes
    SELECT * INTO v_existing
    FROM public.resumen_operativo_lotes
    WHERE semana_key = p_semana_key;

    IF FOUND THEN
        v_stats := jsonb_build_object(
            'total_fichas', v_total_fichas,
            'total_instrumentadores', v_total_inst,
            'total_instituciones', v_total_lugares,
            'periodo_desde', v_min_fecha,
            'periodo_hasta', v_max_fecha
        );

        UPDATE public.resumen_operativo_lotes
        SET reporte_ids = v_final_ids,
            stats = v_stats,
            periodo_desde = v_min_fecha,
            periodo_hasta = v_max_fecha
        WHERE id = v_existing.id;

        RETURN jsonb_build_object(
            'success', true,
            'idempotent', true,
            'updated', true,
            'token', v_existing.token,
            'semana_key', v_existing.semana_key,
            'stats', v_stats,
            'created_at', v_existing.created_at
        );
    END IF;

    -- 3. Generar token seguro e inmutable
    v_token := 'rol_' || lower(encode(gen_random_bytes(16), 'hex'));

    -- 4. Construir objeto de estadísticas
    v_stats := jsonb_build_object(
        'total_fichas', v_total_fichas,
        'total_instrumentadores', v_total_inst,
        'total_instituciones', v_total_lugares,
        'periodo_desde', v_min_fecha,
        'periodo_hasta', v_max_fecha
    );

    -- 5. Insertar lote
    INSERT INTO public.resumen_operativo_lotes (
        token,
        semana_key,
        periodo_desde,
        periodo_hasta,
        reporte_ids,
        stats
    )
    VALUES (
        v_token,
        p_semana_key,
        v_min_fecha,
        v_max_fecha,
        v_final_ids,
        v_stats
    )
    RETURNING id INTO v_new_id;

    RETURN jsonb_build_object(
        'success', true,
        'idempotent', false,
        'token', v_token,
        'semana_key', p_semana_key,
        'stats', v_stats,
        'created_at', NOW()
    );
END;
$$;

GRANT EXECUTE ON FUNCTION public.generar_o_consultar_lote_semanal(TIMESTAMPTZ, TIMESTAMPTZ, TEXT, BIGINT[]) TO authenticated, anon, service_role;

