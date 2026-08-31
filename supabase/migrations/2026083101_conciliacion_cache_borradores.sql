-- supabase/migrations/2026083101_conciliacion_cache_borradores.sql
-- Tabla para cachear las extracciones estructuradas por hash SHA-256 del comprobante
CREATE TABLE IF NOT EXISTS public.conciliacion_cache_comprobantes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  file_hash TEXT NOT NULL UNIQUE,
  file_name TEXT,
  extracted_data JSONB NOT NULL,
  matched_instrumentador JSONB,
  match_type TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índice para búsquedas ultra-rápidas por hash
CREATE INDEX IF NOT EXISTS idx_conciliacion_cache_file_hash ON public.conciliacion_cache_comprobantes (file_hash);

-- Habilitar RLS en cache
ALTER TABLE public.conciliacion_cache_comprobantes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuarios autenticados pueden consultar cache comprobantes"
  ON public.conciliacion_cache_comprobantes FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Usuarios autenticados pueden insertar cache comprobantes"
  ON public.conciliacion_cache_comprobantes FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Usuarios autenticados pueden actualizar cache comprobantes"
  ON public.conciliacion_cache_comprobantes FOR UPDATE
  TO authenticated
  USING (true);


-- Tabla para borradores persistentes de la conciliación activa
CREATE TABLE IF NOT EXISTS public.conciliacion_borradores (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_key TEXT NOT NULL DEFAULT 'default_draft',
  libro_mayor_filename TEXT,
  libro_mayor_summary JSONB,
  is_libro_mayor_skipped BOOLEAN DEFAULT FALSE,
  files_data JSONB NOT NULL DEFAULT '[]'::jsonb,
  reconciliations_map JSONB NOT NULL DEFAULT '{}'::jsonb,
  active_file_id TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_user_session UNIQUE (user_id, session_key)
);

-- Habilitar RLS en borradores
ALTER TABLE public.conciliacion_borradores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuarios autenticados leen sus propios borradores"
  ON public.conciliacion_borradores FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Usuarios autenticados insertan o actualizan sus borradores"
  ON public.conciliacion_borradores FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

GRANT ALL ON TABLE public.conciliacion_cache_comprobantes TO authenticated;
GRANT ALL ON TABLE public.conciliacion_borradores TO authenticated;
