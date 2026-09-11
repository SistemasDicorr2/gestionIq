-- =============================================================================
-- MIGRACIÓN DEFINITIVA: Trazabilidad Entrega -> Retiro con Blindaje Total de Concurrencia
-- Archivo: supabase/migrations/20260910_logistica_entrega_a_retiro.sql
-- =============================================================================

BEGIN;

-- 1. Columnas nuevas aditivas
DO $$ 
BEGIN 
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'logistica_informe_movimientos' 
      AND column_name = 'movimiento_origen_id'
  ) THEN
    ALTER TABLE public.logistica_informe_movimientos ADD COLUMN movimiento_origen_id UUID;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'logistica_informe_movimientos' 
      AND column_name = 'trazabilidad_activa'
  ) THEN
    ALTER TABLE public.logistica_informe_movimientos ADD COLUMN trazabilidad_activa BOOLEAN NOT NULL DEFAULT FALSE;
  END IF;
END $$;

-- 2. Limpieza exhaustiva de cualquier Foreign Key previa sobre movimiento_origen_id (evitar SET NULL residual)
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (
        SELECT tc.constraint_name
        FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage kcu
          ON tc.constraint_name = kcu.constraint_name AND tc.table_schema = kcu.table_schema
        WHERE tc.constraint_type = 'FOREIGN KEY'
          AND tc.table_schema = 'public'
          AND tc.table_name = 'logistica_informe_movimientos'
          AND kcu.column_name = 'movimiento_origen_id'
    ) LOOP
        EXECUTE 'ALTER TABLE public.logistica_informe_movimientos DROP CONSTRAINT IF EXISTS ' || quote_ident(r.constraint_name);
    END LOOP;
END $$;

-- Garantizar constraint ON DELETE RESTRICT incondicional
ALTER TABLE public.logistica_informe_movimientos 
ADD CONSTRAINT fk_logistica_movimiento_origen 
FOREIGN KEY (movimiento_origen_id) 
REFERENCES public.logistica_informe_movimientos(id) 
ON DELETE RESTRICT;

CREATE INDEX IF NOT EXISTS idx_logistica_movimientos_origen 
ON public.logistica_informe_movimientos(movimiento_origen_id);

CREATE INDEX IF NOT EXISTS idx_logistica_movimientos_trazabilidad 
ON public.logistica_informe_movimientos(trazabilidad_activa) 
WHERE tipo_movimiento = 'Entrega de cajas';


-- 3. Limpieza de firmas sobrecargadas anteriores
DROP FUNCTION IF EXISTS public.guardar_borrador_informe_logistica(UUID, DATE, UUID, TEXT, TEXT, TEXT, JSONB, INTEGER);
DROP FUNCTION IF EXISTS public.descartar_borrador_informe_logistica(UUID);
DROP FUNCTION IF EXISTS public.buscar_entregas_para_retiro(TEXT);
DROP FUNCTION IF EXISTS public.buscar_entregas_para_retiro(TEXT, TEXT);


-- 4. RPC: guardar_borrador_informe_logistica
CREATE OR REPLACE FUNCTION public.guardar_borrador_informe_logistica(
    p_informe_id UUID DEFAULT NULL,
    p_fecha DATE DEFAULT CURRENT_DATE,
    p_responsable_user_id UUID DEFAULT NULL,
    p_responsable_nombre TEXT DEFAULT NULL,
    p_zona TEXT DEFAULT 'Formosa',
    p_observacion_general TEXT DEFAULT NULL,
    p_movimientos JSONB DEFAULT '[]'::jsonb,
    p_expected_version INTEGER DEFAULT NULL,
    p_deleted_movement_ids UUID[] DEFAULT ARRAY[]::UUID[]
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    v_user_id UUID := auth.uid();
    v_role TEXT := (auth.jwt() -> 'app_metadata' ->> 'role');
    v_informe RECORD;
    v_target_user_id UUID;
    v_target_nombre TEXT;
    v_res_id UUID;
    v_new_version INTEGER;
    v_res_updated_at TIMESTAMPTZ;
    v_now TIMESTAMPTZ := NOW();
    v_elem JSONB;
    v_elem_id UUID;
    v_existing_informe_id UUID;
    v_origen_id UUID;
    v_origen_tipo TEXT;
    v_origen_estado TEXT;
    v_orden INTEGER := 0;
    v_tipo TEXT;
    v_cajas INTEGER;
    v_bultos INTEGER;
    v_rows_affected INTEGER;
    v_valid_tipos TEXT[] := ARRAY[
        'Entrega de cajas',
        'Retiro de cajas',
        'Esterilización',
        'Devolución de implantes',
        'Entrega o retiro de documentación',
        'Traslado interno',
        'Traslado a Central',
        'Otra gestión',
        'Incidencia'
    ];
BEGIN
    IF v_user_id IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'Usuario no autenticado.');
    END IF;

    IF v_role IS NULL OR v_role NOT IN ('logistica', 'admin') THEN
        RETURN jsonb_build_object('success', false, 'error', 'Acceso denegado: rol autoritativo no válido.');
    END IF;

    IF p_informe_id IS NOT NULL THEN
        SELECT id, estado, responsable_user_id, responsable_nombre, version, updated_at
        INTO v_informe
        FROM public.logistica_informes_diarios
        WHERE id = p_informe_id
        FOR UPDATE;

        IF NOT FOUND THEN
            RETURN jsonb_build_object('success', false, 'error', 'El borrador especificado no existe.');
        END IF;

        IF v_informe.estado <> 'borrador' THEN
            RETURN jsonb_build_object('success', false, 'error', 'Solo pueden modificarse informes en estado "borrador".');
        END IF;

        IF v_informe.responsable_user_id <> v_user_id AND v_role <> 'admin' THEN
            RETURN jsonb_build_object('success', false, 'error', 'No tiene permisos para modificar este borrador.');
        END IF;

        IF p_expected_version IS NULL OR v_informe.version <> p_expected_version THEN
            RETURN jsonb_build_object(
                'success', false,
                'conflict', true,
                'current_version', v_informe.version,
                'message', 'Conflicto de versión: Se requiere la versión esperada para actualizar el borrador.'
            );
        END IF;

        UPDATE public.logistica_informes_diarios
        SET fecha = COALESCE(p_fecha, fecha),
            zona = COALESCE(p_zona, zona),
            observacion_general = p_observacion_general,
            version = COALESCE(version, 1) + 1,
            updated_at = v_now
        WHERE id = p_informe_id
        RETURNING id, version, updated_at INTO v_res_id, v_new_version, v_res_updated_at;

    ELSE
        -- 3. Identificación por responsable y fecha
        IF v_role = 'admin' AND p_responsable_user_id IS NOT NULL THEN
            v_target_user_id := p_responsable_user_id;
            v_target_nombre := COALESCE(p_responsable_nombre, 'Usuario Logística');
        ELSE
            v_target_user_id := v_user_id;
            v_target_nombre := COALESCE(p_responsable_nombre, 'Usuario Logística');
        END IF;

        -- Intentar inserción limpia con ON CONFLICT DO NOTHING
        INSERT INTO public.logistica_informes_diarios (
            fecha,
            responsable_user_id,
            responsable_nombre,
            zona,
            observacion_general,
            estado,
            version,
            created_at,
            updated_at
        ) VALUES (
            p_fecha,
            v_target_user_id,
            v_target_nombre,
            COALESCE(p_zona, 'Formosa'),
            p_observacion_general,
            'borrador',
            1,
            v_now,
            v_now
        )
        ON CONFLICT (fecha, responsable_user_id) DO NOTHING
        RETURNING id, version, updated_at INTO v_res_id, v_new_version, v_res_updated_at;

        -- Si no insertó, significa que ya existía: recuperar bajo FOR UPDATE y exigir expected_version
        IF v_res_id IS NULL THEN
            SELECT id, estado, version, updated_at
            INTO v_informe
            FROM public.logistica_informes_diarios
            WHERE fecha = p_fecha AND responsable_user_id = v_target_user_id
            FOR UPDATE;

            IF v_informe.estado <> 'borrador' THEN
                RETURN jsonb_build_object('success', false, 'error', 'Ya existe un informe enviado para esta fecha.');
            END IF;

            IF p_expected_version IS NULL OR v_informe.version <> p_expected_version THEN
                RETURN jsonb_build_object(
                    'success', false,
                    'conflict', true,
                    'current_version', v_informe.version,
                    'message', 'Conflicto de versión: El borrador de la jornada fue modificado concurrentemente.'
                );
            END IF;

            UPDATE public.logistica_informes_diarios
            SET zona = COALESCE(p_zona, zona),
                observacion_general = p_observacion_general,
                version = COALESCE(version, 1) + 1,
                updated_at = v_now
            WHERE id = v_informe.id
            RETURNING id, version, updated_at INTO v_res_id, v_new_version, v_res_updated_at;
        END IF;
    END IF;

    -- 4. Eliminación explícita controlada
    IF p_deleted_movement_ids IS NOT NULL AND array_length(p_deleted_movement_ids, 1) > 0 THEN
        DELETE FROM public.logistica_informe_movimientos
        WHERE informe_id = v_res_id
          AND id = ANY(p_deleted_movement_ids);
    END IF;

    -- 5. UPSERT de movimientos con validaciones estrictas y verificación de filas afectadas
    IF p_movimientos IS NOT NULL AND jsonb_typeof(p_movimientos) = 'array' AND jsonb_array_length(p_movimientos) > 0 THEN
        FOR v_elem IN SELECT * FROM jsonb_array_elements(p_movimientos)
        LOOP
            IF v_elem ->> 'id' IS NULL OR NULLIF(BTRIM(v_elem ->> 'id'), '') IS NULL THEN
                RAISE EXCEPTION 'Cada movimiento debe poseer un UUID válido generado por el cliente.';
            END IF;

            BEGIN
                v_elem_id := (v_elem ->> 'id')::UUID;
            EXCEPTION WHEN OTHERS THEN
                RAISE EXCEPTION 'El identificador de movimiento "%" no es un UUID válido.', v_elem ->> 'id';
            END;

            -- Validación anti-colisión previa
            SELECT informe_id INTO v_existing_informe_id
            FROM public.logistica_informe_movimientos
            WHERE id = v_elem_id;

            IF FOUND AND v_existing_informe_id <> v_res_id THEN
                RAISE EXCEPTION 'El movimiento % ya pertenece a otro informe diario.', v_elem_id;
            END IF;

            -- Validación de tipo
            v_tipo := v_elem ->> 'tipo_movimiento';
            IF v_tipo IS NULL OR NOT (v_tipo = ANY(v_valid_tipos)) THEN
                RAISE EXCEPTION 'Tipo de movimiento inválido: "%".', COALESCE(v_tipo, 'NULL');
            END IF;

            -- Validación de cantidades
            v_cajas := COALESCE((v_elem ->> 'cantidad_cajas')::INTEGER, 0);
            v_bultos := COALESCE((v_elem ->> 'cantidad_bultos')::INTEGER, 0);
            IF v_cajas < 0 OR v_bultos < 0 THEN
                RAISE EXCEPTION 'Las cantidades de cajas y bultos deben ser mayores o iguales a cero.';
            END IF;

            -- Validación de movimiento_origen_id
            v_origen_id := NULLIF(v_elem ->> 'movimiento_origen_id', '')::UUID;
            IF v_origen_id IS NOT NULL THEN
                IF v_tipo NOT IN ('Retiro de cajas', 'Traslado a Central') THEN
                    RAISE EXCEPTION 'El campo movimiento_origen_id solo está permitido en movimientos de tipo "Retiro de cajas" o "Traslado a Central".';
                END IF;

                SELECT m.tipo_movimiento, inf.estado
                INTO v_origen_tipo, v_origen_estado
                FROM public.logistica_informe_movimientos m
                JOIN public.logistica_informes_diarios inf ON inf.id = m.informe_id
                WHERE m.id = v_origen_id;

                IF NOT FOUND THEN
                    RAISE EXCEPTION 'El movimiento de entrega origen % no existe.', v_origen_id;
                END IF;

                IF v_origen_tipo <> 'Entrega de cajas' THEN
                    RAISE EXCEPTION 'El movimiento de origen debe ser de tipo "Entrega de cajas".';
                END IF;

                IF v_origen_estado <> 'enviado' THEN
                    RAISE EXCEPTION 'Solo pueden vincularse retiros a entregas de informes enviados y confirmados.';
                END IF;
            END IF;

            INSERT INTO public.logistica_informe_movimientos (
                id,
                informe_id,
                movimiento_origen_id,
                trazabilidad_activa,
                reporte_id,
                id_cirugia_snapshot,
                cliente_snapshot,
                paciente_snapshot,
                medico_snapshot,
                institucion_snapshot,
                fecha_cirugia_snapshot,
                tipo_movimiento,
                destino,
                cantidad_cajas,
                cantidad_bultos,
                resultado,
                tiene_pendiente,
                cantidad_pendiente,
                detalle_pendiente,
                motivo_pendiente,
                observaciones,
                orden,
                created_at,
                updated_at
            ) VALUES (
                v_elem_id,
                v_res_id,
                v_origen_id,
                TRUE,
                NULLIF(v_elem ->> 'reporte_id', '')::BIGINT,
                NULLIF(BTRIM(v_elem ->> 'id_cirugia_snapshot'), ''),
                NULLIF(BTRIM(v_elem ->> 'cliente_snapshot'), ''),
                COALESCE(NULLIF(BTRIM(v_elem ->> 'paciente_snapshot'), ''), 'Sin especificar'),
                NULLIF(BTRIM(v_elem ->> 'medico_snapshot'), ''),
                NULLIF(BTRIM(v_elem ->> 'institucion_snapshot'), ''),
                NULLIF(v_elem ->> 'fecha_cirugia_snapshot', '')::DATE,
                v_tipo,
                COALESCE(NULLIF(BTRIM(v_elem ->> 'destino'), ''), 'Central'),
                v_cajas,
                v_bultos,
                NULLIF(BTRIM(v_elem ->> 'resultado'), ''),
                COALESCE((v_elem ->> 'tiene_pendiente')::BOOLEAN, FALSE),
                CASE WHEN COALESCE((v_elem ->> 'tiene_pendiente')::BOOLEAN, FALSE) THEN 1 ELSE 0 END,
                CASE WHEN COALESCE((v_elem ->> 'tiene_pendiente')::BOOLEAN, FALSE) THEN NULLIF(BTRIM(v_elem ->> 'detalle_pendiente'), '') ELSE NULL END,
                CASE WHEN COALESCE((v_elem ->> 'tiene_pendiente')::BOOLEAN, FALSE) THEN NULLIF(BTRIM(v_elem ->> 'motivo_pendiente'), '') ELSE NULL END,
                NULLIF(BTRIM(v_elem ->> 'observaciones'), ''),
                v_orden,
                v_now,
                v_now
            )
            ON CONFLICT (id) DO UPDATE SET
                movimiento_origen_id = EXCLUDED.movimiento_origen_id,
                reporte_id = EXCLUDED.reporte_id,
                id_cirugia_snapshot = EXCLUDED.id_cirugia_snapshot,
                cliente_snapshot = EXCLUDED.cliente_snapshot,
                paciente_snapshot = EXCLUDED.paciente_snapshot,
                medico_snapshot = EXCLUDED.medico_snapshot,
                institucion_snapshot = EXCLUDED.institucion_snapshot,
                fecha_cirugia_snapshot = EXCLUDED.fecha_cirugia_snapshot,
                tipo_movimiento = EXCLUDED.tipo_movimiento,
                destino = EXCLUDED.destino,
                cantidad_cajas = EXCLUDED.cantidad_cajas,
                cantidad_bultos = EXCLUDED.cantidad_bultos,
                resultado = EXCLUDED.resultado,
                tiene_pendiente = EXCLUDED.tiene_pendiente,
                cantidad_pendiente = EXCLUDED.cantidad_pendiente,
                detalle_pendiente = EXCLUDED.detalle_pendiente,
                motivo_pendiente = EXCLUDED.motivo_pendiente,
                observaciones = EXCLUDED.observaciones,
                orden = EXCLUDED.orden,
                updated_at = v_now
            WHERE public.logistica_informe_movimientos.informe_id = v_res_id;

            GET DIAGNOSTICS v_rows_affected = ROW_COUNT;
            IF v_rows_affected = 0 THEN
                RAISE EXCEPTION 'El movimiento % no pertenece a este informe diario o no pudo actualizarse.', v_elem_id;
            END IF;

            v_orden := v_orden + 1;
        END LOOP;
    END IF;

    RETURN jsonb_build_object(
        'success', true,
        'informe_id', v_res_id,
        'version', v_new_version,
        'updated_at', v_res_updated_at
    );
END;
$$;


-- 5. RPC: descartar_borrador_informe_logistica
CREATE OR REPLACE FUNCTION public.descartar_borrador_informe_logistica(p_informe_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    v_user_id UUID := auth.uid();
    v_role TEXT := (auth.jwt() -> 'app_metadata' ->> 'role');
    v_informe RECORD;
BEGIN
    IF v_user_id IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'Usuario no autenticado.');
    END IF;

    IF v_role IS NULL OR v_role NOT IN ('logistica', 'admin') THEN
        RETURN jsonb_build_object('success', false, 'error', 'Acceso denegado: rol autoritativo no válido.');
    END IF;

    SELECT id, estado, responsable_user_id
    INTO v_informe
    FROM public.logistica_informes_diarios
    WHERE id = p_informe_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'error', 'El borrador especificado no existe.');
    END IF;

    IF v_informe.estado <> 'borrador' THEN
        RETURN jsonb_build_object('success', false, 'error', 'Solo pueden descartarse informes en estado "borrador".');
    END IF;

    IF v_informe.responsable_user_id <> v_user_id AND v_role <> 'admin' THEN
        RETURN jsonb_build_object('success', false, 'error', 'No tiene permisos para descartar este borrador.');
    END IF;

    DELETE FROM public.logistica_informe_movimientos
    WHERE informe_id = p_informe_id;

    DELETE FROM public.logistica_informes_diarios
    WHERE id = p_informe_id;

    RETURN jsonb_build_object(
        'success', true,
        'message', 'Borrador descartado correctamente.',
        'informe_id', p_informe_id
    );
END;
$$;


-- 6. RPC: enviar_informe_logistica
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
    v_retiro_agrupado RECORD;
    v_entrega RECORD;
    v_cajas_retiradas_previas INTEGER;
    v_bultos_retirados_previos INTEGER;
    v_cajas_disponibles INTEGER;
    v_bultos_disponibles INTEGER;
BEGIN
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Usuario no autenticado.';
    END IF;

    IF v_role IS NULL OR v_role NOT IN ('logistica', 'admin') THEN
        RAISE EXCEPTION 'Acceso denegado: rol autoritativo no válido.';
    END IF;

    SELECT estado, responsable_user_id
    INTO v_estado, v_responsable_id
    FROM public.logistica_informes_diarios
    WHERE id = p_informe_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'El informe especificado no existe.';
    END IF;

    IF v_estado <> 'borrador' THEN
        RAISE EXCEPTION 'Solo pueden enviarse informes en estado "borrador" (estado actual: "%").', v_estado;
    END IF;

    IF v_responsable_id <> v_user_id AND v_role <> 'admin' THEN
        RAISE EXCEPTION 'No tiene permisos para modificar o enviar este informe.';
    END IF;

    SELECT COUNT(*)
    INTO v_movimientos_count
    FROM public.logistica_informe_movimientos
    WHERE informe_id = p_informe_id;

    IF v_movimientos_count = 0 THEN
        RAISE EXCEPTION 'No se puede enviar un informe sin movimientos cargados.';
    END IF;

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

    -- Bloqueo determinista ordenado por UUID (Anti-Deadlock) y validación agrupada de saldos
    FOR v_retiro_agrupado IN 
        SELECT 
            m.movimiento_origen_id,
            SUM(m.cantidad_cajas)::INTEGER AS suma_cajas_solicitadas,
            SUM(m.cantidad_bultos)::INTEGER AS suma_bultos_solicitados,
            MIN(m.paciente_snapshot) AS paciente_sample,
            MIN(m.id_cirugia_snapshot) AS cx_sample
        FROM public.logistica_informe_movimientos m
        WHERE m.informe_id = p_informe_id
          AND m.tipo_movimiento IN ('Retiro de cajas', 'Traslado a Central')
          AND m.movimiento_origen_id IS NOT NULL
        GROUP BY m.movimiento_origen_id
        ORDER BY m.movimiento_origen_id ASC
    LOOP
        SELECT e.id, e.cantidad_cajas, e.cantidad_bultos, e.trazabilidad_activa, inf.estado
        INTO v_entrega
        FROM public.logistica_informe_movimientos e
        JOIN public.logistica_informes_diarios inf ON inf.id = e.informe_id
        WHERE e.id = v_retiro_agrupado.movimiento_origen_id
        FOR UPDATE;

        IF NOT FOUND OR v_entrega.estado <> 'enviado' THEN
            RAISE EXCEPTION 'La entrega de origen vinculada no existe o no corresponde a un informe enviado.';
        END IF;

        IF v_entrega.trazabilidad_activa THEN
            SELECT 
                COALESCE(SUM(m2.cantidad_cajas), 0)::INTEGER,
                COALESCE(SUM(m2.cantidad_bultos), 0)::INTEGER
            INTO v_cajas_retiradas_previas, v_bultos_retirados_previos
            FROM public.logistica_informe_movimientos m2
            JOIN public.logistica_informes_diarios i2 ON i2.id = m2.informe_id
            WHERE m2.movimiento_origen_id = v_entrega.id
              AND i2.estado = 'enviado'
              AND m2.informe_id <> p_informe_id;

            v_cajas_disponibles := GREATEST(0, v_entrega.cantidad_cajas - v_cajas_retiradas_previas);
            v_bultos_disponibles := GREATEST(0, v_entrega.cantidad_bultos - v_bultos_retirados_previos);

            IF v_retiro_agrupado.suma_cajas_solicitadas > v_cajas_disponibles THEN
                RAISE EXCEPTION 'Conflicto de saldo: La entrega de % (%) solo dispone de % cajas (se intentan retirar % acumuladas en este informe). Ajuste las cantidades antes de enviar.',
                    COALESCE(v_retiro_agrupado.paciente_sample, 'Cirugía'),
                    COALESCE(v_retiro_agrupado.cx_sample, 'Sin código'),
                    v_cajas_disponibles,
                    v_retiro_agrupado.suma_cajas_solicitadas;
            END IF;

            IF v_retiro_agrupado.suma_bultos_solicitados > v_bultos_disponibles THEN
                RAISE EXCEPTION 'Conflicto de saldo: La entrega de % (%) solo dispone de % contenedores/bultos (se intentan retirar % acumulados en este informe). Ajuste las cantidades antes de enviar.',
                    COALESCE(v_retiro_agrupado.paciente_sample, 'Cirugía'),
                    COALESCE(v_retiro_agrupado.cx_sample, 'Sin código'),
                    v_bultos_disponibles,
                    v_retiro_agrupado.suma_bultos_solicitados;
            END IF;
        END IF;
    END LOOP;

    UPDATE public.logistica_informes_diarios
    SET estado = 'enviado',
        enviado_at = v_now,
        updated_at = v_now
    WHERE id = p_informe_id;

    RETURN json_build_object(
        'success', true,
        'message', 'Informe guardado y enviado exitosamente.',
        'informe_id', p_informe_id,
        'enviado_at', v_now
    )::jsonb;
END;
$$;


-- 7. RPC: buscar_entregas_para_retiro
CREATE OR REPLACE FUNCTION public.buscar_entregas_para_retiro(
    p_busqueda TEXT DEFAULT NULL,
    p_zona TEXT DEFAULT NULL
)
RETURNS TABLE (
    id UUID,
    informe_id UUID,
    fecha_informe DATE,
    zona_informe TEXT,
    id_cirugia_snapshot TEXT,
    reporte_id BIGINT,
    paciente_snapshot TEXT,
    cliente_snapshot TEXT,
    medico_snapshot TEXT,
    institucion_snapshot TEXT,
    fecha_cirugia_snapshot DATE,
    cantidad_cajas_entregadas INTEGER,
    cantidad_bultos_entregados INTEGER,
    cajas_ya_retiradas INTEGER,
    bultos_ya_retirados INTEGER,
    saldo_cajas_pendiente INTEGER,
    saldo_bultos_pendiente INTEGER,
    observaciones_entrega TEXT,
    trazabilidad_activa BOOLEAN
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    v_role TEXT := (auth.jwt() -> 'app_metadata' ->> 'role');
    v_clean_search TEXT := NULLIF(BTRIM(p_busqueda), '');
    v_clean_zona TEXT := NULLIF(BTRIM(p_zona), '');
BEGIN
    IF auth.uid() IS NULL OR v_role IS NULL OR v_role NOT IN ('logistica', 'admin') THEN
        RAISE EXCEPTION 'Acceso denegado: rol autoritativo no válido.';
    END IF;

    RETURN QUERY
    WITH retiros_consolidados AS (
        SELECT 
            m.movimiento_origen_id,
            COALESCE(SUM(m.cantidad_cajas), 0)::INTEGER AS total_cajas_retiradas,
            COALESCE(SUM(m.cantidad_bultos), 0)::INTEGER AS total_bultos_retirados
        FROM public.logistica_informe_movimientos m
        JOIN public.logistica_informes_diarios i ON i.id = m.informe_id
        WHERE m.movimiento_origen_id IS NOT NULL
          AND i.estado = 'enviado'
        GROUP BY m.movimiento_origen_id
    )
    SELECT 
        e.id,
        e.informe_id,
        inf.fecha AS fecha_informe,
        inf.zona AS zona_informe,
        e.id_cirugia_snapshot,
        e.reporte_id,
        e.paciente_snapshot,
        e.cliente_snapshot,
        e.medico_snapshot,
        e.institucion_snapshot,
        e.fecha_cirugia_snapshot,
        e.cantidad_cajas AS cantidad_cajas_entregadas,
        e.cantidad_bultos AS cantidad_bultos_entregados,
        COALESCE(r.total_cajas_retiradas, 0)::INTEGER AS cajas_ya_retiradas,
        COALESCE(r.total_bultos_retirados, 0)::INTEGER AS bultos_ya_retirados,
        CASE 
            WHEN e.trazabilidad_activa THEN GREATEST(0, e.cantidad_cajas - COALESCE(r.total_cajas_retiradas, 0))::INTEGER
            ELSE NULL::INTEGER
        END AS saldo_cajas_pendiente,
        CASE 
            WHEN e.trazabilidad_activa THEN GREATEST(0, e.cantidad_bultos - COALESCE(r.total_bultos_retirados, 0))::INTEGER
            ELSE NULL::INTEGER
        END AS saldo_bultos_pendiente,
        e.observaciones AS observaciones_entrega,
        e.trazabilidad_activa
    FROM public.logistica_informe_movimientos e
    JOIN public.logistica_informes_diarios inf ON inf.id = e.informe_id
    LEFT JOIN retiros_consolidados r ON r.movimiento_origen_id = e.id
    WHERE e.tipo_movimiento = 'Entrega de cajas'
      AND inf.estado = 'enviado'
      AND (
          v_clean_zona IS NULL 
          OR inf.zona ILIKE '%' || v_clean_zona || '%'
      )
      AND (
          v_clean_search IS NULL
          OR COALESCE(e.id_cirugia_snapshot, '') ILIKE '%' || v_clean_search || '%'
          OR COALESCE(e.institucion_snapshot, '') ILIKE '%' || v_clean_search || '%'
          OR COALESCE(e.medico_snapshot, '') ILIKE '%' || v_clean_search || '%'
          OR COALESCE(e.paciente_snapshot, '') ILIKE '%' || v_clean_search || '%'
      )
      AND (
          NOT e.trazabilidad_activa 
          OR (e.cantidad_cajas - COALESCE(r.total_cajas_retiradas, 0)) > 0
          OR (e.cantidad_bultos - COALESCE(r.total_bultos_retirados, 0)) > 0
      )
    ORDER BY inf.fecha DESC, e.created_at DESC
    LIMIT 30;
END;
$$;

-- Permisos
REVOKE EXECUTE ON FUNCTION public.guardar_borrador_informe_logistica(UUID, DATE, UUID, TEXT, TEXT, TEXT, JSONB, INTEGER, UUID[]) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.guardar_borrador_informe_logistica(UUID, DATE, UUID, TEXT, TEXT, TEXT, JSONB, INTEGER, UUID[]) TO authenticated;

REVOKE EXECUTE ON FUNCTION public.descartar_borrador_informe_logistica(UUID) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.descartar_borrador_informe_logistica(UUID) TO authenticated;

REVOKE EXECUTE ON FUNCTION public.enviar_informe_logistica(UUID) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.enviar_informe_logistica(UUID) TO authenticated;

REVOKE EXECUTE ON FUNCTION public.buscar_entregas_para_retiro(TEXT, TEXT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.buscar_entregas_para_retiro(TEXT, TEXT) TO authenticated;

COMMIT;
