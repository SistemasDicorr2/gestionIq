-- Migration: 20261103_cron_recordatorio_marta_semanal.sql
-- Configuración de pg_cron y función para automatizar el envío semanal del Recordatorio de Cirugías Impagas de Marta Brugger vía Resend.

-- 1. Asegurar la tabla de configuración
CREATE TABLE IF NOT EXISTS public.resumen_operativo_config (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Función RPC para actualizar dinámicamente la programación del recordatorio de Marta
CREATE OR REPLACE FUNCTION public.actualizar_programacion_recordatorio_marta_semanal(
    p_dia INT,       -- 0=Domingo, 1=Lunes, 2=Martes, 3=Miércoles, 4=Jueves, 5=Viernes, 6=Sábado (default: 1 = Lunes)
    p_hora INT,      -- Hora en Argentina (ART UTC-3), ej: 9 (09:00 hs ART)
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
    
    -- Si cruza la medianoche UTC, avanza un día
    IF (p_hora + 3) >= 24 THEN
        v_utc_dia := (p_dia + 1) % 7;
    END IF;

    -- 2. Formatear expresión cron (Minuto Hora * * DíaSemana)
    v_cron_expr := format('%s %s * * %s', p_minuto, v_utc_hora, v_utc_dia);

    -- 3. Desprogramar cualquier tarea previa con este nombre en pg_cron
    IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_cron') THEN
        IF EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'send-recordatorio-marta-semanal') THEN
            PERFORM cron.unschedule('send-recordatorio-marta-semanal');
        END IF;
        
        IF p_activo THEN
            -- Programar la nueva tarea en pg_cron invocando la Edge Function
            PERFORM cron.schedule(
                'send-recordatorio-marta-semanal',
                v_cron_expr,
                $cron$
                SELECT net.http_post(
                    url := 'https://ugznvonyvtjfqskhubbi.supabase.co/functions/v1/send-recordatorio-marta-semanal',
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
        'programacion_recordatorio_marta',
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

-- Permisos de ejecución
GRANT EXECUTE ON FUNCTION public.actualizar_programacion_recordatorio_marta_semanal TO authenticated, service_role;

-- 3. Programación inicial por defecto: Todos los Lunes a las 09:00 hs ART (12:00 UTC)
SELECT public.actualizar_programacion_recordatorio_marta_semanal(
    1,     -- Lunes
    9,     -- 09:00 hs ART
    0,     -- 00 min
    true   -- Activo
);

