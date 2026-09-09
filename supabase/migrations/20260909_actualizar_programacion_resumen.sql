-- Migration: 20260909_actualizar_programacion_resumen.sql
-- Permite guardar la programación del reporte semanal y sincronizar pg_cron dinámicamente desde el frontend.

-- 1. Asegurar la tabla de configuración
CREATE TABLE IF NOT EXISTS public.resumen_operativo_config (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Función RPC para actualizar dinámicamente el cron job de pg_cron
CREATE OR REPLACE FUNCTION public.actualizar_programacion_resumen_semanal(
    p_dia INT,       -- 0=Domingo, 1=Lunes, 2=Martes, 3=Miércoles, 4=Jueves, 5=Viernes, 6=Sábado
    p_hora INT,      -- Hora en Argentina (ART UTC-3), ej: 15
    p_minuto INT,    -- Minutos en Argentina, ej: 0
    p_activo BOOLEAN -- true si el envío automático está activado
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $func$
DECLARE
    v_utc_hora INT;
    v_utc_dia INT;
    v_cron_expr TEXT;
BEGIN
    -- 1. Convertir Hora ART (UTC-3) a UTC (+3 horas)
    v_utc_hora := (p_hora + 3) % 24;
    v_utc_dia := p_dia;
    
    -- Ajustar día de la semana si el cambio de hora cruza la medianoche UTC
    IF (p_hora + 3) >= 24 THEN
        v_utc_dia := (p_dia + 1) % 7;
    END IF;

    -- 2. Formatear expresión cron (Minuto Hora * * DíaSemana)
    v_cron_expr := format('%s %s * * %s', p_minuto, v_utc_hora, v_utc_dia);

    -- 3. Desprogramar cualquier tarea existente previa solo si existe en cron.job
    IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_cron') THEN
        IF EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'send-resumen-operativo-semanal') THEN
            PERFORM cron.unschedule('send-resumen-operativo-semanal');
        END IF;
        
        IF p_activo THEN
            -- Programar la nueva tarea en pg_cron llamando a la Edge Function
            PERFORM cron.schedule(
                'send-resumen-operativo-semanal',
                v_cron_expr,
                $cron$
                SELECT net.http_post(
                    url := 'https://ugznvonyvtjfqskhubbi.supabase.co/functions/v1/send-resumen-operativo-semanal',
                    headers := '{"Content-Type": "application/json"}'::jsonb,
                    body := '{}'::jsonb
                );
                $cron$
            );
        END IF;
    END IF;

    -- 4. Guardar configuración en la tabla resumen_operativo_config
    INSERT INTO public.resumen_operativo_config (key, value, updated_at)
    VALUES (
        'programacion_semanal',
        jsonb_build_object(
            'dia', p_dia,
            'hora', p_hora,
            'minuto', p_minuto,
            'activo', p_activo,
            'cron_utc', v_cron_expr,
            'updated_at', NOW()
        ),
        NOW()
    )
    ON CONFLICT (key) DO UPDATE SET
        value = EXCLUDED.value,
        updated_at = NOW();

    RETURN jsonb_build_object(
        'success', true,
        'cron_utc', v_cron_expr,
        'activo', p_activo
    );
END;
$func$;

-- Permisos de Ejecución
GRANT EXECUTE ON FUNCTION public.actualizar_programacion_resumen_semanal TO authenticated, service_role;
