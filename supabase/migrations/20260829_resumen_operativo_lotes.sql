-- Migration: 20260829_resumen_operativo_lotes.sql
-- Tabla de lotes inmutables para el Resumen Operativo Semanal
CREATE TABLE IF NOT EXISTS public.resumen_operativo_lotes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    token TEXT UNIQUE NOT NULL,
    semana_key TEXT UNIQUE NOT NULL,
    periodo_desde TIMESTAMPTZ NOT NULL,
    periodo_hasta TIMESTAMPTZ NOT NULL,
    reporte_ids BIGINT[] NOT NULL,
    stats JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    enviado_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de configuración de destinatarios del resumen operativo
CREATE TABLE IF NOT EXISTS public.resumen_operativo_config (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insertar configuración inicial por defecto si no existe
INSERT INTO public.resumen_operativo_config (key, value)
VALUES (
    'emails_destinatarios',
    '["sistemas@districorr.com.ar", "contable@districorr.com.ar", "auxiliardeposito@districorr.com.ar"]'::jsonb
)
ON CONFLICT (key) DO NOTHING;

-- Habilitar RLS (Row Level Security) y Políticas de Acceso
ALTER TABLE public.resumen_operativo_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resumen_operativo_lotes ENABLE ROW LEVEL SECURITY;

-- Políticas para resumen_operativo_config
DROP POLICY IF EXISTS "Permitir lectura de configuracion a usuarios autenticados" ON public.resumen_operativo_config;
CREATE POLICY "Permitir lectura de configuracion a usuarios autenticados"
ON public.resumen_operativo_config
FOR SELECT
TO authenticated
USING (true);

DROP POLICY IF EXISTS "Permitir modificacion de configuracion a usuarios autenticados" ON public.resumen_operativo_config;
CREATE POLICY "Permitir modificacion de configuracion a usuarios autenticados"
ON public.resumen_operativo_config
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Políticas para resumen_operativo_lotes
DROP POLICY IF EXISTS "Permitir lectura de lotes a anonimos y autenticados" ON public.resumen_operativo_lotes;
CREATE POLICY "Permitir lectura de lotes a anonimos y autenticados"
ON public.resumen_operativo_lotes
FOR SELECT
TO anon, authenticated
USING (true);

-- Permisos de Tablas (Grants)
GRANT ALL ON TABLE public.resumen_operativo_config TO authenticated, service_role;
GRANT SELECT ON TABLE public.resumen_operativo_config TO anon;

GRANT ALL ON TABLE public.resumen_operativo_lotes TO authenticated, service_role;
GRANT SELECT ON TABLE public.resumen_operativo_lotes TO anon;

-- Función de Idempotencia: Generar o Consultar Lote Semanal
CREATE OR REPLACE FUNCTION public.generar_o_consultar_lote_semanal(
    p_desde TIMESTAMPTZ,
    p_hasta TIMESTAMPTZ,
    p_semana_key TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_existing RECORD;
    v_reportes RECORD;
    v_reporte_ids BIGINT[];
    v_token TEXT;
    v_stats JSONB;
    v_total_fichas INT;
    v_total_inst INT;
    v_total_lugares INT;
    v_new_id UUID;
BEGIN
    -- 1. Idempotencia: Verificar si el lote de esta semana ya existe
    SELECT * INTO v_existing
    FROM public.resumen_operativo_lotes
    WHERE semana_key = p_semana_key;

    IF FOUND THEN
        RETURN jsonb_build_object(
            'success', true,
            'idempotent', true,
            'token', v_existing.token,
            'semana_key', v_existing.semana_key,
            'stats', v_existing.stats,
            'created_at', v_existing.created_at
        );
    END IF;

    -- 2. Consultar fichas enviadas strictly por fecha_envio
    SELECT 
        COALESCE(array_agg(r.id), '{}'::BIGINT[]) AS ids,
        COUNT(r.id) AS total_fichas,
        COUNT(DISTINCT NULLIF(TRIM(r.instrumentador), '')) AS total_inst,
        COUNT(DISTINCT NULLIF(TRIM(r.lugar_cirugia), '')) AS total_lugares
    INTO v_reportes
    FROM public.reportes r
    WHERE LOWER(TRIM(r.estado)) = 'enviado'
      AND r.fecha_envio >= p_desde
      AND r.fecha_envio <= p_hasta;

    v_reporte_ids := v_reportes.ids;
    v_total_fichas := COALESCE(v_reportes.total_fichas, 0);
    v_total_inst := COALESCE(v_reportes.total_inst, 0);
    v_total_lugares := COALESCE(v_reportes.total_lugares, 0);

    -- 3. Generar token seguro e inmutable
    v_token := 'rol_' || lower(encode(gen_random_bytes(16), 'hex'));

    -- 4. Construir objeto de estadísticas congeladas
    v_stats := jsonb_build_object(
        'total_fichas', v_total_fichas,
        'total_instrumentadores', v_total_inst,
        'total_instituciones', v_total_lugares,
        'periodo_desde', p_desde,
        'periodo_hasta', p_hasta
    );

    -- 5. Insertar lote inmutable
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
        p_desde,
        p_hasta,
        v_reporte_ids,
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

-- Función de consulta segura por token para visualización/impresión masiva
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
BEGIN
    -- 1. Buscar lote inmutable por token
    SELECT * INTO v_lote
    FROM public.resumen_operativo_lotes
    WHERE token = p_token;

    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'error', 'Lote no encontrado o expirado.');
    END IF;

    -- 2. Consultar únicamente las fichas pertenecientes al lote
    SELECT jsonb_agg(
        jsonb_build_object(
            'id', r.id,
            'id_cirugia', r.id_cirugia,
            'paciente', r.paciente,
            'medico', r.medico,
            'lugar_cirugia', r.lugar_cirugia,
            'fecha_cirugia', r.fecha_cirugia,
            'fecha_envio', r.fecha_envio,
            'estado', r.estado,
            'instrumentador', r.instrumentador,
            'instrumentador_completado', r.instrumentador_completado,
            'instrumentador_dni', r.instrumentador_dni,
            'url_firma', r.url_firma,
            'consumo_realizado', r.consumo_realizado,
            'created_at', r.created_at
        )
    ) INTO v_fichas
    FROM public.reportes r
    WHERE r.id = ANY(v_lote.reporte_ids);

    RETURN jsonb_build_object(
        'success', true,
        'lote', jsonb_build_object(
            'token', v_lote.token,
            'semana_key', v_lote.semana_key,
            'periodo_desde', v_lote.periodo_desde,
            'periodo_hasta', v_lote.periodo_hasta,
            'stats', v_lote.stats,
            'created_at', v_lote.created_at
        ),
        'fichas', COALESCE(v_fichas, '[]'::jsonb)
    );
END;
$$;

-- Permisos de Ejecución (Grants para RPCs)
GRANT EXECUTE ON FUNCTION public.generar_o_consultar_lote_semanal TO authenticated, anon, service_role;
GRANT EXECUTE ON FUNCTION public.obtener_lote_por_token TO authenticated, anon, service_role;
