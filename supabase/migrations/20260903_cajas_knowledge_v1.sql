-- Migration: 20260903_cajas_knowledge_v1.sql
-- Módulo independiente Cajas & Knowledge (Gestión IQ)

-- 1. Tabla de Códigos de Cajas / Instrumental / Equipos
CREATE TABLE IF NOT EXISTS public.cajas_codigos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    codigo TEXT UNIQUE NOT NULL,
    codigo_base TEXT,
    serie INTEGER,
    familia TEXT,
    material TEXT,
    variante TEXT,
    clasificacion TEXT,
    contenido TEXT,
    marca TEXT,
    nombre TEXT,
    estado TEXT NOT NULL DEFAULT 'activo', -- 'activo', 'inactivo', 'historico', 'anulado'
    es_historico BOOLEAN NOT NULL DEFAULT false,
    observaciones TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Índices de búsqueda rápida
CREATE INDEX IF NOT EXISTS idx_cajas_codigos_codigo ON public.cajas_codigos(codigo);
CREATE INDEX IF NOT EXISTS idx_cajas_codigos_codigo_base ON public.cajas_codigos(codigo_base);
CREATE INDEX IF NOT EXISTS idx_cajas_codigos_familia ON public.cajas_codigos(familia);
CREATE INDEX IF NOT EXISTS idx_cajas_codigos_estado ON public.cajas_codigos(estado);

-- 2. Tabla del Diccionario de Componentes (Abreviaturas / Aceptaciones)
CREATE TABLE IF NOT EXISTS public.cajas_diccionario (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    grupo TEXT NOT NULL, -- 'Familia', 'Material', 'Medida', 'Clasificación', 'Contenido', 'Marca'
    codigo TEXT NOT NULL, -- Ej: 'OS', 'T', '35', 'VL', 'U'
    significado TEXT NOT NULL, -- Ej: 'Osteosíntesis'
    significado_normalizado TEXT, -- Ej: 'OSTEOSINTESIS'
    descripcion TEXT,
    activo BOOLEAN NOT NULL DEFAULT true,
    historico BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Índices de unicidad y prevención de duplicados
CREATE UNIQUE INDEX IF NOT EXISTS idx_cajas_diccionario_grupo_codigo 
    ON public.cajas_diccionario(LOWER(grupo), LOWER(codigo));

CREATE UNIQUE INDEX IF NOT EXISTS idx_cajas_diccionario_grupo_significado 
    ON public.cajas_diccionario(LOWER(grupo), LOWER(COALESCE(significado_normalizado, significado)));

-- 3. Tabla de Knowledge (Wiki interna)
CREATE TABLE IF NOT EXISTS public.cajas_knowledge (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    titulo TEXT NOT NULL,
    categoria TEXT NOT NULL DEFAULT 'Codificación', -- 'Codificación', 'Cajas', 'Instrumental', 'Sets', 'Equipos', 'Procedimientos', 'Histórico', 'Otros'
    contenido TEXT NOT NULL,
    tags TEXT[] NOT NULL DEFAULT '{}'::TEXT[],
    importancia TEXT NOT NULL DEFAULT 'Normal', -- 'Normal', 'Importante', 'Crítico'
    estado TEXT NOT NULL DEFAULT 'Vigente', -- 'Vigente', 'Histórico', 'En revisión'
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_cajas_knowledge_categoria ON public.cajas_knowledge(categoria);
CREATE INDEX IF NOT EXISTS idx_cajas_knowledge_estado ON public.cajas_knowledge(estado);

-- 4. Habilitar Row Level Security (RLS)
ALTER TABLE public.cajas_codigos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cajas_diccionario ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cajas_knowledge ENABLE ROW LEVEL SECURITY;

-- Políticas de RLS (Acceso autenticado completo)
DROP POLICY IF EXISTS "Permitir lectura de cajas_codigos a autenticados" ON public.cajas_codigos;
CREATE POLICY "Permitir lectura de cajas_codigos a autenticados"
ON public.cajas_codigos FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Permitir escritura de cajas_codigos a autenticados" ON public.cajas_codigos;
CREATE POLICY "Permitir escritura de cajas_codigos a autenticados"
ON public.cajas_codigos FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Permitir lectura de cajas_diccionario a autenticados" ON public.cajas_diccionario;
CREATE POLICY "Permitir lectura de cajas_diccionario a autenticados"
ON public.cajas_diccionario FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Permitir escritura de cajas_diccionario a autenticados" ON public.cajas_diccionario;
CREATE POLICY "Permitir escritura de cajas_diccionario a autenticados"
ON public.cajas_diccionario FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Permitir lectura de cajas_knowledge a autenticados" ON public.cajas_knowledge;
CREATE POLICY "Permitir lectura de cajas_knowledge a autenticados"
ON public.cajas_knowledge FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Permitir escritura de cajas_knowledge a autenticados" ON public.cajas_knowledge;
CREATE POLICY "Permitir escritura de cajas_knowledge a autenticados"
ON public.cajas_knowledge FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Permisos de tabla
GRANT ALL ON TABLE public.cajas_codigos TO authenticated, service_role;
GRANT ALL ON TABLE public.cajas_diccionario TO authenticated, service_role;
GRANT ALL ON TABLE public.cajas_knowledge TO authenticated, service_role;

-- 5. Función RPC: Generación Segura de Códigos con Incremento Concurrente MAX(serie) + 1
CREATE OR REPLACE FUNCTION public.generar_codigo_caja(
    p_codigo_base TEXT,
    p_familia TEXT DEFAULT NULL,
    p_material TEXT DEFAULT NULL,
    p_variante TEXT DEFAULT NULL,
    p_clasificacion TEXT DEFAULT NULL,
    p_contenido TEXT DEFAULT NULL,
    p_marca TEXT DEFAULT NULL,
    p_nombre TEXT DEFAULT NULL,
    p_observaciones TEXT DEFAULT NULL,
    p_es_historico BOOLEAN DEFAULT false,
    p_codigo_manual TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_next_serie INTEGER := NULL;
    v_final_code TEXT;
    v_base TEXT := TRIM(p_codigo_base);
    v_result RECORD;
BEGIN
    -- Caso 1: Código Histórico / Manual
    IF p_es_historico IS TRUE AND p_codigo_manual IS NOT NULL AND TRIM(p_codigo_manual) <> '' THEN
        v_final_code := TRIM(p_codigo_manual);
        v_base := NULL;
        v_next_serie := NULL;
    ELSE
        -- Caso 2: Código Generado Controlado
        IF v_base IS NULL OR v_base = '' THEN
            RAISE EXCEPTION 'El código base no puede estar vacío para códigos generados.';
        END IF;

        -- Bloqueo y cálculo de MAX(serie) para evitar concurrencia duplicada
        SELECT COALESCE(MAX(serie), 0) + 1 INTO v_next_serie
        FROM public.cajas_codigos
        WHERE codigo_base = v_base;

        -- Formato final: BASE-NNN (ej: OS-T35VLU-014)
        v_final_code := v_base || '-' || LPAD(v_next_serie::TEXT, 3, '0');
    END IF;

    -- Inserción con garantía UNIQUE(codigo)
    INSERT INTO public.cajas_codigos (
        codigo,
        codigo_base,
        serie,
        familia,
        material,
        variante,
        clasificacion,
        contenido,
        marca,
        nombre,
        estado,
        es_historico,
        observaciones,
        created_by
    ) VALUES (
        v_final_code,
        v_base,
        v_next_serie,
        p_familia,
        p_material,
        p_variante,
        p_clasificacion,
        p_contenido,
        p_marca,
        p_nombre,
        CASE WHEN p_es_historico THEN 'historico' ELSE 'activo' END,
        p_es_historico,
        p_observaciones,
        auth.uid()
    )
    RETURNING * INTO v_result;

    RETURN to_jsonb(v_result);
END;
$$;

-- 6. Función RPC: Obtener vista previa de siguiente serie
CREATE OR REPLACE FUNCTION public.obtener_siguiente_serie_caja(
    p_codigo_base TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
AS $$
DECLARE
    v_max_serie INTEGER;
    v_next_serie INTEGER;
    v_last_code TEXT := NULL;
    v_next_code TEXT;
    v_base TEXT := TRIM(p_codigo_base);
BEGIN
    IF v_base IS NULL OR v_base = '' THEN
        RETURN jsonb_build_object(
            'siguiente_serie', 1,
            'siguiente_codigo', '',
            'ultimo_codigo', NULL
        );
    END IF;

    SELECT MAX(serie) INTO v_max_serie
    FROM public.cajas_codigos
    WHERE codigo_base = v_base;

    IF v_max_serie IS NULL THEN
        v_next_serie := 1;
    ELSE
        v_next_serie := v_max_serie + 1;
        v_last_code := v_base || '-' || LPAD(v_max_serie::TEXT, 3, '0');
    END IF;

    v_next_code := v_base || '-' || LPAD(v_next_serie::TEXT, 3, '0');

    RETURN jsonb_build_object(
        'codigo_base', v_base,
        'siguiente_serie', v_next_serie,
        'siguiente_codigo', v_next_code,
        'ultimo_codigo', v_last_code
    );
END;
$$;

GRANT EXECUTE ON FUNCTION public.generar_codigo_caja TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.obtener_siguiente_serie_caja TO authenticated, service_role;

-- 7. Seed Inicial del Diccionario de Componentes
INSERT INTO public.cajas_diccionario (grupo, codigo, significado, significado_normalizado, descripcion)
VALUES 
    ('Familia', 'OS', 'Osteosíntesis', 'OSTEOSINTESIS', 'Cajas e instrumental de osteosíntesis'),
    ('Familia', 'ST', 'Set', 'SET', 'Sets de instrumental quirúrgico'),
    ('Familia', 'EQ', 'Equipo', 'EQUIPO', 'Equipos médicos y consolas'),
    ('Familia', 'IN', 'Instrumental', 'INSTRUMENTAL', 'Piezas sueltas o cajas de mano'),
    ('Material', 'T', 'Titanio', 'TITANIO', 'Material titanio biocompatible'),
    ('Material', 'A', 'Acero', 'ACERO', 'Acero quirúrgico inoxidable'),
    ('Material', 'PE', 'PEEK', 'PEEK', 'Polímero PEEK radiolúcido'),
    ('Medida', '27', '2,7 mm', '2,7 MM', 'Medida de sistema 2.7 mm'),
    ('Medida', '35', '3,5 mm', '3,5 MM', 'Medida de sistema 3.5 mm'),
    ('Medida', '45', '4,5 mm', '4,5 MM', 'Medida de sistema 4.5 mm'),
    ('Clasificación', 'VL', 'Volar', 'VOLAR', 'Placas/cajas anatómicas volares'),
    ('Clasificación', 'DR', 'Distal Radio', 'DISTAL RADIO', 'Placas para radio distal'),
    ('Clasificación', 'PL', 'Placa', 'PLACA', 'Placas de reconstrucción / compresión'),
    ('Contenido', 'U', 'Unificado', 'UNIFICADO', 'Implantes e instrumental en una sola caja'),
    ('Contenido', 'I', 'Instrumental', 'INSTRUMENTAL', 'Solo instrumental de colocación'),
    ('Contenido', 'C', 'Caja Completa', 'CAJA COMPLETA', 'Caja completa con bandejas')
ON CONFLICT DO NOTHING;
