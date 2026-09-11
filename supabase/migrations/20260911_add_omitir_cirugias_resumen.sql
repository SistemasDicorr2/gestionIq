-- Migration: 20260911_add_omitir_cirugias_resumen.sql
-- Permite omitir cirugías específicas de los próximos resúmenes operativos semanales

CREATE OR REPLACE FUNCTION public.toggle_omitir_cirugia_resumen(
    p_cirugia_id BIGINT,
    p_omitir BOOLEAN,
    p_motivo TEXT DEFAULT NULL,
    p_paciente TEXT DEFAULT NULL,
    p_fecha_cirugia TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_current JSONB;
    v_item JSONB;
    v_list JSONB := '[]'::jsonb;
    v_found BOOLEAN := false;
BEGIN
    SELECT value INTO v_current
    FROM public.resumen_operativo_config
    WHERE key = 'cirugias_omitidas';

    IF v_current IS NULL OR jsonb_typeof(v_current) <> 'array' THEN
        v_current := '[]'::jsonb;
    END IF;

    -- Iterar sobre la lista existente
    FOR v_item IN SELECT * FROM jsonb_array_elements(v_current)
    LOOP
        IF (v_item->>'id')::BIGINT = p_cirugia_id THEN
            v_found := true;
            IF p_omitir THEN
                -- Si se mantiene o actualiza la omisión
                v_list := v_list || jsonb_build_array(
                    jsonb_build_object(
                        'id', p_cirugia_id,
                        'paciente', COALESCE(p_paciente, v_item->>'paciente', 'Sin especificar'),
                        'fecha_cirugia', COALESCE(p_fecha_cirugia, v_item->>'fecha_cirugia', ''),
                        'motivo', COALESCE(p_motivo, v_item->>'motivo', ''),
                        'omitido_at', COALESCE(v_item->>'omitido_at', NOW()::text)
                    )
                );
            END IF;
            -- Si p_omitir es false, no se añade a v_list (se reincorpora)
        ELSE
            v_list := v_list || jsonb_build_array(v_item);
        END IF;
    END LOOP;

    -- Si se solicita omitir y aún no estaba en la lista, agregarla
    IF p_omitir AND NOT v_found THEN
        v_list := v_list || jsonb_build_array(
            jsonb_build_object(
                'id', p_cirugia_id,
                'paciente', COALESCE(p_paciente, 'Sin especificar'),
                'fecha_cirugia', COALESCE(p_fecha_cirugia, ''),
                'motivo', COALESCE(p_motivo, ''),
                'omitido_at', NOW()::text
            )
        );
    END IF;

    -- Persistir en la configuración de resumen operativo
    INSERT INTO public.resumen_operativo_config (key, value, updated_at)
    VALUES ('cirugias_omitidas', v_list, NOW())
    ON CONFLICT (key) DO UPDATE
    SET value = EXCLUDED.value, updated_at = NOW();

    RETURN jsonb_build_object(
        'success', true,
        'cirugia_id', p_cirugia_id,
        'omitida', p_omitir,
        'total_omitidas', jsonb_array_length(v_list),
        'omitidas', v_list
    );
END;
$$;

CREATE OR REPLACE FUNCTION public.obtener_cirugias_omitidas_resumen()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_res JSONB;
BEGIN
    SELECT value INTO v_res
    FROM public.resumen_operativo_config
    WHERE key = 'cirugias_omitidas';

    RETURN COALESCE(v_res, '[]'::jsonb);
END;
$$;

-- Permisos de ejecución
GRANT EXECUTE ON FUNCTION public.toggle_omitir_cirugia_resumen TO authenticated, anon, service_role;
GRANT EXECUTE ON FUNCTION public.obtener_cirugias_omitidas_resumen TO authenticated, anon, service_role;
