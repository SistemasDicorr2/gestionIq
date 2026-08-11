-- Migration: Crear tabla logistica_guias_envio para el generador documental REG03-01-01-C
-- Esta tabla almacena únicamente metadatos livianos de las guías generadas para consulta e historial.

CREATE TABLE IF NOT EXISTS public.logistica_guias_envio (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  created_by_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_by_nombre TEXT,
  reporte_id UUID,
  cliente TEXT,
  medico TEXT,
  paciente TEXT,
  lugar_entrega TEXT,
  fecha_cx DATE,
  fecha_envio DATE DEFAULT CURRENT_DATE,
  transporte TEXT,
  numero_guia TEXT,
  observaciones TEXT,
  cantidad_imagenes INTEGER DEFAULT 0
);

-- Políticas RLS de Seguridad
ALTER TABLE public.logistica_guias_envio ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Permitir lectura de guias a usuarios autenticados" 
  ON public.logistica_guias_envio FOR SELECT 
  TO authenticated 
  USING (true);

CREATE POLICY "Permitir insercion de guias a usuarios autenticados" 
  ON public.logistica_guias_envio FOR INSERT 
  TO authenticated 
  WITH CHECK (true);
