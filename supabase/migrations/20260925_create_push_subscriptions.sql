-- ======================================================================================
-- Migración: Tabla de Suscripciones Web Push (VAPID) para Instrumentadores
-- Fecha: 2026-09-25
-- Descripción: Almacena las suscripciones Web Push de los navegadores/celulares de los
--              instrumentadores vinculadas a su DNI para el envío remoto en segundo plano.
-- ======================================================================================

CREATE TABLE IF NOT EXISTS public.instrumentador_push_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    instrumentador_dni TEXT NOT NULL,
    endpoint TEXT NOT NULL UNIQUE,
    p256dh TEXT NOT NULL,
    auth TEXT NOT NULL,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Índices de consulta rápida
CREATE INDEX IF NOT EXISTS idx_push_subs_dni ON public.instrumentador_push_subscriptions (instrumentador_dni);
CREATE INDEX IF NOT EXISTS idx_push_subs_endpoint ON public.instrumentador_push_subscriptions (endpoint);

-- Comentarios explicativos
COMMENT ON TABLE public.instrumentador_push_subscriptions IS 'Registra endpoints y claves criptográficas VAPID para notificaciones remotas al celular de instrumentadores.';
COMMENT ON COLUMN public.instrumentador_push_subscriptions.endpoint IS 'URL única del servicio push del navegador (FCM, Apple APNs, Mozilla).';
COMMENT ON COLUMN public.instrumentador_push_subscriptions.p256dh IS 'Clave pública del cliente para el cifrado ECDH.';
COMMENT ON COLUMN public.instrumentador_push_subscriptions.auth IS 'Secreto de autenticación del cliente.';

-- Habilitar RLS
ALTER TABLE public.instrumentador_push_subscriptions ENABLE ROW LEVEL SECURITY;

-- 1. Política de Inserción/Upsert: Permite a los instrumentadores registrar su endpoint
CREATE POLICY "Permitir registrar suscripciones push públicas"
ON public.instrumentador_push_subscriptions
FOR INSERT
WITH CHECK (true);

-- 2. Política de Actualización: Permite actualizar su propia suscripción si cambia
CREATE POLICY "Permitir actualizar suscripciones push"
ON public.instrumentador_push_subscriptions
FOR UPDATE
USING (true)
WITH CHECK (true);

-- 3. Política de Lectura: Solo lectura para usuarios autenticados (Admin / Sistema) o service_role
CREATE POLICY "Lectura de suscripciones para administradores"
ON public.instrumentador_push_subscriptions
FOR SELECT
TO authenticated
USING (true);
