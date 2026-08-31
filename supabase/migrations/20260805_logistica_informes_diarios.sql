-- =============================================================================
-- MIGRACIÓN SQL FINAL: Módulo Informe Diario de Logística — Gestión IQ
-- Archivo: supabase/migrations/20260805_logistica_informes_diarios.sql
-- =============================================================================

BEGIN;

-- 1. Función específica para timestamp updated_at de Logística
CREATE OR REPLACE FUNCTION public.set_logistica_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

-- 2. Tabla Principal: logistica_informes_diarios
CREATE TABLE IF NOT EXISTS public.logistica_informes_diarios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    fecha DATE NOT NULL DEFAULT CURRENT_DATE,
    responsable_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
    responsable_nombre TEXT NOT NULL,
    zona TEXT DEFAULT 'Formosa',
    observacion_general TEXT,
    estado TEXT NOT NULL DEFAULT 'borrador' CHECK (estado IN ('borrador', 'enviado', 'corregido')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    enviado_at TIMESTAMPTZ,
    corregido_at TIMESTAMPTZ,
    corregido_por UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    CONSTRAINT unique_fecha_responsable UNIQUE (fecha, responsable_user_id)
);

-- Trigger de updated_at para logistica_informes_diarios
DROP TRIGGER IF EXISTS trg_update_logistica_informes_diarios_updated_at ON public.logistica_informes_diarios;
CREATE TRIGGER trg_update_logistica_informes_diarios_updated_at
    BEFORE UPDATE ON public.logistica_informes_diarios
    FOR EACH ROW
    EXECUTE FUNCTION public.set_logistica_updated_at();

-- 3. Tabla Secundaria: logistica_informe_movimientos
CREATE TABLE IF NOT EXISTS public.logistica_informe_movimientos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    informe_id UUID NOT NULL REFERENCES public.logistica_informes_diarios(id) ON DELETE CASCADE,
    reporte_id BIGINT REFERENCES public.reportes(id) ON DELETE SET NULL,
    id_cirugia_snapshot TEXT,
    cliente_snapshot TEXT,
    paciente_snapshot TEXT,
    medico_snapshot TEXT,
    institucion_snapshot TEXT,
    fecha_cirugia_snapshot DATE,
    tipo_movimiento TEXT NOT NULL CHECK (tipo_movimiento IN (
        'Entrega de cajas',
        'Retiro de cajas',
        'Devolución de implantes',
        'Entrega o retiro de documentación',
        'Traslado interno',
        'Otra gestión',
        'Incidencia'
    )),
    destino TEXT,
    cantidad_cajas INTEGER NOT NULL DEFAULT 0 CHECK (cantidad_cajas >= 0),
    cantidad_bultos INTEGER NOT NULL DEFAULT 0 CHECK (cantidad_bultos >= 0),
    resultado TEXT,
    tiene_pendiente BOOLEAN NOT NULL DEFAULT FALSE,
    cantidad_pendiente INTEGER NOT NULL DEFAULT 0 CHECK (cantidad_pendiente >= 0),
    detalle_pendiente TEXT,
    motivo_pendiente TEXT,
    observaciones TEXT,
    orden INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT logistica_movimiento_pendiente_consistente CHECK (
        (
            tiene_pendiente = FALSE
            AND cantidad_pendiente = 0
            AND detalle_pendiente IS NULL
            AND motivo_pendiente IS NULL
        )
        OR
        (
            tiene_pendiente = TRUE
            AND NULLIF(BTRIM(detalle_pendiente), '') IS NOT NULL
        )
    )
);

-- Trigger de updated_at para logistica_informe_movimientos
DROP TRIGGER IF EXISTS trg_update_logistica_informe_movimientos_updated_at ON public.logistica_informe_movimientos;
CREATE TRIGGER trg_update_logistica_informe_movimientos_updated_at
    BEFORE UPDATE ON public.logistica_informe_movimientos
    FOR EACH ROW
    EXECUTE FUNCTION public.set_logistica_updated_at();

-- Índices de rendimiento
CREATE INDEX IF NOT EXISTS idx_logistica_informes_fecha ON public.logistica_informes_diarios(fecha);
CREATE INDEX IF NOT EXISTS idx_logistica_informes_responsable ON public.logistica_informes_diarios(responsable_user_id);
CREATE INDEX IF NOT EXISTS idx_logistica_movimientos_informe ON public.logistica_informe_movimientos(informe_id);
CREATE INDEX IF NOT EXISTS idx_logistica_movimientos_reporte ON public.logistica_informe_movimientos(reporte_id);

-- 4. RPC de Búsqueda Acotada de Cirugías para Logística (Read-Only)
CREATE OR REPLACE FUNCTION public.buscar_cirugias_logistica(p_busqueda TEXT)
RETURNS TABLE (
    id BIGINT,
    id_cirugia TEXT,
    cliente TEXT,
    paciente TEXT,
    medico TEXT,
    institucion TEXT,
    fecha_cirugia DATE
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    v_role TEXT := (auth.jwt() -> 'app_metadata' ->> 'role');
    v_clean_search TEXT := NULLIF(BTRIM(p_busqueda), '');
BEGIN
    IF v_role IS NULL OR v_role NOT IN ('logistica', 'admin') THEN
        RAISE EXCEPTION 'Acceso denegado: rol no autorizado.';
    END IF;

    RETURN QUERY
    SELECT 
        r.id,
        r.id_cirugia,
        NULLIF(BTRIM(r.cliente), '') AS cliente,
        NULLIF(BTRIM(r.paciente), '') AS paciente,
        NULLIF(BTRIM(r.medico), '') AS medico,
        NULLIF(BTRIM(r.lugar_cirugia), '') AS institucion,
        r.fecha_cirugia
    FROM public.reportes r
    WHERE (
        v_clean_search IS NULL
        OR COALESCE(r.paciente, '') ILIKE '%' || v_clean_search || '%'
        OR COALESCE(r.medico, '') ILIKE '%' || v_clean_search || '%'
        OR COALESCE(r.cliente, '') ILIKE '%' || v_clean_search || '%'
        OR COALESCE(r.lugar_cirugia, '') ILIKE '%' || v_clean_search || '%'
        OR COALESCE(r.id_cirugia, '') ILIKE '%' || v_clean_search || '%'
    )
    ORDER BY r.created_at DESC
    LIMIT 30;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.buscar_cirugias_logistica(TEXT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.buscar_cirugias_logistica(TEXT) TO authenticated;

-- 5. RPC de Envío Seguro de Informe de Logística (Soporta Edición y Corrección)
CREATE OR REPLACE FUNCTION public.enviar_informe_logistica(p_informe_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    v_user_id UUID := auth.uid();
    v_role TEXT := (auth.jwt() -> 'app_metadata' ->> 'role');
    v_estado TEXT;
    v_responsable_id UUID;
    v_movimientos_count INTEGER;
    v_now TIMESTAMPTZ := NOW();
BEGIN
    -- 1. Validar usuario autenticado y rol
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Usuario no autenticado.';
    END IF;

    IF v_role IS NULL OR v_role NOT IN ('logistica', 'admin') THEN
        RAISE EXCEPTION 'Acceso denegado: rol no autorizado.';
    END IF;

    -- 2. Obtener informe con bloqueo FOR UPDATE
    SELECT estado, responsable_user_id
    INTO v_estado, v_responsable_id
    FROM public.logistica_informes_diarios
    WHERE id = p_informe_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'El informe especificado no existe.';
    END IF;

    -- 3. Verificar propiedad o rol administrador
    IF v_responsable_id <> v_user_id AND v_role <> 'admin' THEN
        RAISE EXCEPTION 'No tiene permisos para modificar o enviar este informe.';
    END IF;

    -- 4. Comprobar que exista al menos un movimiento
    SELECT COUNT(*)
    INTO v_movimientos_count
    FROM public.logistica_informe_movimientos
    WHERE informe_id = p_informe_id;

    IF v_movimientos_count = 0 THEN
        RAISE EXCEPTION 'No se puede enviar un informe sin movimientos cargados.';
    END IF;

    -- 5. Validar que no existan movimientos incompletos
    IF EXISTS (
        SELECT 1
        FROM public.logistica_informe_movimientos m
        WHERE m.informe_id = p_informe_id
          AND (
              m.tipo_movimiento IS NULL 
              OR BTRIM(m.tipo_movimiento) = ''
              OR (
                  m.reporte_id IS NULL 
                  AND NULLIF(BTRIM(m.destino), '') IS NULL 
                  AND NULLIF(BTRIM(m.observaciones), '') IS NULL
              )
          )
    ) THEN
        RAISE EXCEPTION 'Existen movimientos incompletos. Cada movimiento debe estar vinculado a una cirugía o contar con un destino u observaciones.';
    END IF;

    -- 6. Actualización a estado enviado
    UPDATE public.logistica_informes_diarios
    SET estado = 'enviado',
        enviado_at = v_now
    WHERE id = p_informe_id
      AND (responsable_user_id = v_user_id OR v_role = 'admin');

    IF NOT FOUND THEN
        RAISE EXCEPTION 'No se pudo actualizar el informe.';
    END IF;

    RETURN json_build_object(
        'success', true,
        'message', 'Informe guardado y enviado exitosamente.',
        'informe_id', p_informe_id,
        'enviado_at', v_now
    )::jsonb;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.enviar_informe_logistica(UUID) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.enviar_informe_logistica(UUID) TO authenticated;

-- 6. Habilitación de RLS y permisos
ALTER TABLE public.logistica_informes_diarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.logistica_informe_movimientos ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public.logistica_informes_diarios FROM PUBLIC, anon;
REVOKE ALL ON TABLE public.logistica_informe_movimientos FROM PUBLIC, anon;

GRANT SELECT, INSERT, UPDATE ON TABLE public.logistica_informes_diarios TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.logistica_informe_movimientos TO authenticated;

-- 7. Policies RLS Flexibles para Edición de logistica_informes_diarios
DROP POLICY IF EXISTS "logistica_informes_select_policy" ON public.logistica_informes_diarios;
CREATE POLICY "logistica_informes_select_policy" ON public.logistica_informes_diarios
    FOR SELECT TO authenticated
    USING (
        responsable_user_id = auth.uid()
        OR (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
        OR (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
        OR (auth.jwt() -> 'raw_user_meta_data' ->> 'role') = 'admin'
    );

DROP POLICY IF EXISTS "logistica_informes_insert_policy" ON public.logistica_informes_diarios;
CREATE POLICY "logistica_informes_insert_policy" ON public.logistica_informes_diarios
    FOR INSERT TO authenticated
    WITH CHECK (
        responsable_user_id = auth.uid()
        OR (auth.jwt() -> 'app_metadata' ->> 'role') IN ('logistica', 'admin')
        OR (auth.jwt() -> 'user_metadata' ->> 'role') IN ('logistica', 'admin')
        OR (auth.jwt() -> 'raw_user_meta_data' ->> 'role') IN ('logistica', 'admin')
    );

DROP POLICY IF EXISTS "logistica_informes_update_policy" ON public.logistica_informes_diarios;
CREATE POLICY "logistica_informes_update_policy" ON public.logistica_informes_diarios
    FOR UPDATE TO authenticated
    USING (
        responsable_user_id = auth.uid()
        OR (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
        OR (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
        OR (auth.jwt() -> 'raw_user_meta_data' ->> 'role') = 'admin'
    )
    WITH CHECK (
        responsable_user_id = auth.uid()
        OR (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
        OR (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
        OR (auth.jwt() -> 'raw_user_meta_data' ->> 'role') = 'admin'
    );

-- 8. Policies RLS Flexibles para Edición de logistica_informe_movimientos
DROP POLICY IF EXISTS "logistica_movimientos_select_policy" ON public.logistica_informe_movimientos;
CREATE POLICY "logistica_movimientos_select_policy" ON public.logistica_informe_movimientos
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.logistica_informes_diarios i
            WHERE i.id = informe_id
              AND (
                  i.responsable_user_id = auth.uid() 
                  OR (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
                  OR (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
                  OR (auth.jwt() -> 'raw_user_meta_data' ->> 'role') = 'admin'
              )
        )
    );

DROP POLICY IF EXISTS "logistica_movimientos_insert_policy" ON public.logistica_informe_movimientos;
CREATE POLICY "logistica_movimientos_insert_policy" ON public.logistica_informe_movimientos
    FOR INSERT TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.logistica_informes_diarios i
            WHERE i.id = informe_id
              AND (
                  i.responsable_user_id = auth.uid() 
                  OR (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
                  OR (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
                  OR (auth.jwt() -> 'raw_user_meta_data' ->> 'role') = 'admin'
              )
        )
    );

DROP POLICY IF EXISTS "logistica_movimientos_update_policy" ON public.logistica_informe_movimientos;
CREATE POLICY "logistica_movimientos_update_policy" ON public.logistica_informe_movimientos
    FOR UPDATE TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.logistica_informes_diarios i
            WHERE i.id = informe_id
              AND (
                  i.responsable_user_id = auth.uid() 
                  OR (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
                  OR (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
                  OR (auth.jwt() -> 'raw_user_meta_data' ->> 'role') = 'admin'
              )
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.logistica_informes_diarios i
            WHERE i.id = informe_id
              AND (
                  i.responsable_user_id = auth.uid() 
                  OR (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
                  OR (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
                  OR (auth.jwt() -> 'raw_user_meta_data' ->> 'role') = 'admin'
              )
        )
    );

DROP POLICY IF EXISTS "logistica_movimientos_delete_policy" ON public.logistica_informe_movimientos;
CREATE POLICY "logistica_movimientos_delete_policy" ON public.logistica_informe_movimientos
    FOR DELETE TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.logistica_informes_diarios i
            WHERE i.id = informe_id
              AND (
                  i.responsable_user_id = auth.uid() 
                  OR (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
                  OR (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
                  OR (auth.jwt() -> 'raw_user_meta_data' ->> 'role') = 'admin'
              )
        )
    );

COMMIT;
