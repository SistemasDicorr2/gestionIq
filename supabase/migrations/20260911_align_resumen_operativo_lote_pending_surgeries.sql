-- Migration: 20260911_align_resumen_operativo_lote_pending_surgeries.sql
-- Alinea la generación del lote inmutable con la lista de cirugías pendientes consolidadas en el reporte semanal

-- 1. Eliminar versiones anteriores de la función para evitar conflictos de sobrecarga (42725)
DROP FUNCTION IF EXISTS public.generar_o_consultar_lote_semanal(TIMESTAMPTZ, TIMESTAMPTZ, TEXT);
DROP FUNCTION IF EXISTS public.generar_o_consultar_lote_semanal(TIMESTAMPTZ, TIMESTAMPTZ, TEXT, BIGINT[]);

-- 2. Creación de generar_o_consultar_lote_semanal con parámetro opcional p_reporte_ids
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
    v_token TEXT;
    v_stats JSONB;
    v_total_fichas INT;
    v_total_inst INT;
    v_total_lugares INT;
    v_min_fecha TIMESTAMPTZ;
    v_max_fecha TIMESTAMPTZ;
    v_new_id UUID;
BEGIN
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
          AND r.pago_id IS NULL;

        v_final_ids := COALESCE(v_reportes.ids, p_reporte_ids);
        v_total_fichas := COALESCE(v_reportes.total_fichas, array_length(p_reporte_ids, 1));
        v_total_inst := COALESCE(v_reportes.total_inst, 0);
        v_total_lugares := COALESCE(v_reportes.total_lugares, 0);
        v_min_fecha := COALESCE(v_reportes.min_fecha, p_desde);
        v_max_fecha := COALESCE(v_reportes.max_fecha, p_hasta);
    ELSE
        -- Fallback: Consultar por rango de fechas de envío (solo no pagadas)
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
          AND r.fecha_envio >= p_desde
          AND r.fecha_envio <= p_hasta;

        v_final_ids := v_reportes.ids;
        v_total_fichas := COALESCE(v_reportes.total_fichas, 0);
        v_total_inst := COALESCE(v_reportes.total_inst, 0);
        v_total_lugares := COALESCE(v_reportes.total_lugares, 0);
        v_min_fecha := COALESCE(v_reportes.min_fecha, p_desde);
        v_max_fecha := COALESCE(v_reportes.max_fecha, p_hasta);
    END IF;

    -- 2. Idempotencia: Verificar si el lote de esta semana ya existe
    SELECT * INTO v_existing
    FROM public.resumen_operativo_lotes
    WHERE semana_key = p_semana_key;

    IF FOUND THEN
        -- Si ya existe y se pasan IDs explícitos, actualizar reporte_ids y stats
        IF p_reporte_ids IS NOT NULL AND array_length(p_reporte_ids, 1) > 0 THEN
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

        RETURN jsonb_build_object(
            'success', true,
            'idempotent', true,
            'token', v_existing.token,
            'semana_key', v_existing.semana_key,
            'stats', v_existing.stats,
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

-- 2. Actualización de obtener_lote_por_token para priorizar los reporte_ids almacenados en el lote
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

    -- 2. Consultar dinámicamente las fichas asociadas al lote (por IDs o por período)
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
            'pago_id', r.pago_id,
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
        ) ORDER BY r.fecha_cirugia DESC, r.fecha_envio DESC
    ) INTO v_fichas
    FROM public.reportes r
    WHERE (
        (v_lote.reporte_ids IS NOT NULL AND array_length(v_lote.reporte_ids, 1) > 0 AND r.id = ANY(v_lote.reporte_ids))
        OR (
            (v_lote.reporte_ids IS NULL OR array_length(v_lote.reporte_ids, 1) = 0)
            AND LOWER(TRIM(r.estado)) = 'enviado'
            AND r.pago_id IS NULL
            AND r.fecha_envio >= v_lote.periodo_desde
            AND r.fecha_envio <= v_lote.periodo_hasta
        )
    );

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

-- Permisos de Ejecución
GRANT EXECUTE ON FUNCTION public.generar_o_consultar_lote_semanal(TIMESTAMPTZ, TIMESTAMPTZ, TEXT, BIGINT[]) TO authenticated, anon, service_role;
GRANT EXECUTE ON FUNCTION public.obtener_lote_por_token(TEXT) TO authenticated, anon, service_role;
