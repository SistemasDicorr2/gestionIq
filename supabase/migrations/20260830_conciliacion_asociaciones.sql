-- Migration: 20260830_conciliacion_asociaciones.sql
-- Tabla para almacenar el aprendizaje de asociaciones bancarias (CUIT/CUIL/CBU -> Instrumentador)

CREATE TABLE IF NOT EXISTS public.conciliacion_asociaciones_bancarias (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cuit_cuil TEXT,
    cbu_alias TEXT,
    titular_nombre TEXT,
    banco TEXT,
    instrumentador_dni TEXT NOT NULL,
    instrumentador_nombre TEXT NOT NULL,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices para búsqueda rápida de coincidencias
CREATE INDEX IF NOT EXISTS idx_conciliacion_asoc_cuit ON public.conciliacion_asociaciones_bancarias(cuit_cuil);
CREATE INDEX IF NOT EXISTS idx_conciliacion_asoc_cbu ON public.conciliacion_asociaciones_bancarias(cbu_alias);
CREATE INDEX IF NOT EXISTS idx_conciliacion_asoc_inst ON public.conciliacion_asociaciones_bancarias(instrumentador_dni);

-- RLS y Políticas de Seguridad (Solo usuarios administradores/autenticados)
ALTER TABLE public.conciliacion_asociaciones_bancarias ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Permitir lectura de asociaciones a autenticados" ON public.conciliacion_asociaciones_bancarias;
CREATE POLICY "Permitir lectura de asociaciones a autenticados"
ON public.conciliacion_asociaciones_bancarias
FOR SELECT TO authenticated
USING (true);

DROP POLICY IF EXISTS "Permitir insercion/actualizacion de asociaciones a administradores" ON public.conciliacion_asociaciones_bancarias;
CREATE POLICY "Permitir insercion/actualizacion de asociaciones a administradores"
ON public.conciliacion_asociaciones_bancarias
FOR ALL TO authenticated
USING (true)
WITH CHECK (true);

GRANT ALL ON TABLE public.conciliacion_asociaciones_bancarias TO authenticated, service_role;
