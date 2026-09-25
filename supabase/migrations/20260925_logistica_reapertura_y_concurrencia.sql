-- ==============================================================================
-- Migración: 20260925_logistica_reapertura_y_concurrencia.sql
-- Propósito: 
-- 1. Crear RPC 'reabrir_informe_logistica' para permitir reapertura controlada de jornadas enviadas sin SQL manual.
-- 2. Actualizar RPC 'guardar_borrador_informe_logistica' con parámetro 'p_force_override' para resolver bloqueos de concurrencia.
-- ==============================================================================

-- 1. RPC: reabrir_informe_logistica
CREATE OR REPLACE FUNCTION public.reabrir_informe_logistica(
    p_informe_id UUID,
    p_motivo TEXT DEFAULT NULL
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
    v_now TIMESTAMPTZ := NOW();
    v_obs TEXT;
BEGIN
    IF v_user_id IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'Usuario no autenticado.');
    END IF;

    IF v_role IS NULL OR v_role NOT IN ('logistica', 'admin') THEN
        RETURN jsonb_build_object('success', false, 'error', 'Acceso denegado: rol autoritativo no válido.');
    END IF;

    SELECT id, estado, responsable_user_id, observacion_general, version
    INTO v_informe
    FROM public.logistica_informes_diarios
    WHERE id = p_informe_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'error', 'El informe especificado no existe.');
    END IF;

    -- Solo el responsable del informe o un administrador pueden reabrir
    IF v_informe.responsable_user_id <> v_user_id AND v_role <> 'admin' THEN
        RETURN jsonb_build_object('success', false, 'error', 'No tiene permisos para reabrir este informe.');
    END IF;

    -- Si ya está en borrador, simplemente confirmar éxito
    IF v_informe.estado = 'borrador' THEN
        RETURN jsonb_build_object(
            'success', true, 
            'message', 'El informe ya se encuentra en estado borrador.',
            'informe_id', p_informe_id,
            'version', v_informe.version
        );
    END IF;

    v_obs := v_informe.observacion_general;
    IF p_motivo IS NOT NULL AND BTRIM(p_motivo) <> '' THEN
        v_obs := COALESCE(v_obs || E'\n', '') || '[Reapertura de jornada: ' || BTRIM(p_motivo) || ']';
    END IF;

    UPDATE public.logistica_informes_diarios
    SET estado = 'borrador',
        enviado_at = NULL,
        corregido_at = v_now,
        corregido_por = v_user_id,
        observacion_general = v_obs,
        version = COALESCE(version, 1) + 1,
        updated_at = v_now
    WHERE id = p_informe_id;

    RETURN jsonb_build_object(
        'success', true,
        'message', 'Jornada reabierta exitosamente. Podés continuar editando los movimientos.',
        'informe_id', p_informe_id,
        'version', COALESCE(v_informe.version, 1) + 1
    );
END;
$$;

-- Permisos RPC reabrir
REVOKE EXECUTE ON FUNCTION public.reabrir_informe_logistica(UUID, TEXT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.reabrir_informe_logistica(UUID, TEXT) TO authenticated;


-- 2. RPC: guardar_borrador_informe_logistica (con soporte para p_force_override)
CREATE OR REPLACE FUNCTION public.guardar_borrador_informe_logistica(
    p_informe_id UUID DEFAULT NULL,
    p_fecha DATE DEFAULT CURRENT_DATE,
    p_responsable_user_id UUID DEFAULT NULL,
    p_responsable_nombre TEXT DEFAULT NULL,
    p_zona TEXT DEFAULT 'Formosa',
    p_observacion_general TEXT DEFAULT NULL,
    p_movimientos JSONB DEFAULT '[]'::jsonb,
    p_expected_version INTEGER DEFAULT NULL,
    p_deleted_movement_ids UUID[] DEFAULT ARRAY[]::UUID[],
    p_force_override BOOLEAN DEFAULT FALSE
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

        -- Control de concurrencia optimista (ignorado si p_force_override es true)
        IF NOT COALESCE(p_force_override, false) THEN
            IF p_expected_version IS NOT NULL AND v_informe.version <> p_expected_version THEN
                RETURN jsonb_build_object(
                    'success', false,
                    'conflict', true,
                    'current_version', v_informe.version,
                    'message', 'Conflicto de versión: El borrador fue modificado concurrentemente.'
                );
            END IF;
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
        -- Identificación por responsable y fecha
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

        -- Si no insertó, significa que ya existía: recuperar bajo FOR UPDATE
        IF v_res_id IS NULL THEN
            SELECT id, estado, version, updated_at
            INTO v_informe
            FROM public.logistica_informes_diarios
            WHERE fecha = p_fecha AND responsable_user_id = v_target_user_id
            FOR UPDATE;

            IF v_informe.estado <> 'borrador' THEN
                RETURN jsonb_build_object('success', false, 'error', 'Ya existe un informe enviado para esta fecha. Utilizá la opción de reabrir informe si necesitás agregar movimientos.');
            END IF;

            IF NOT COALESCE(p_force_override, false) THEN
                IF p_expected_version IS NOT NULL AND v_informe.version <> p_expected_version THEN
                    RETURN jsonb_build_object(
                        'success', false,
                        'conflict', true,
                        'current_version', v_informe.version,
                        'message', 'Conflicto de versión: El borrador de la jornada fue modificado concurrentemente.'
                    );
                END IF;
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

    -- Eliminación de movimientos solicitados
    IF p_deleted_movement_ids IS NOT NULL AND ARRAY_LENGTH(p_deleted_movement_ids, 1) > 0 THEN
        DELETE FROM public.logistica_informe_movimientos
        WHERE informe_id = v_res_id
          AND id = ANY(p_deleted_movement_ids);
    END IF;

    -- Upsert de movimientos
    IF p_movimientos IS NOT NULL AND jsonb_array_length(p_movimientos) > 0 THEN
        FOR v_elem IN SELECT * FROM jsonb_array_elements(p_movimientos)
        LOOP
            v_elem_id := (v_elem->>'id')::UUID;
            v_tipo := COALESCE(v_elem->>'tipo_movimiento', 'Otra gestión');
            IF NOT (v_tipo = ANY(v_valid_tipos)) THEN
                v_tipo := 'Otra gestión';
            END IF;

            v_cajas := COALESCE((v_elem->>'cantidad_cajas')::INTEGER, 0);
            v_bultos := COALESCE((v_elem->>'cantidad_bultos')::INTEGER, 0);
            v_origen_id := CASE 
                WHEN v_elem->>'movimiento_origen_id' IS NOT NULL AND BTRIM(v_elem->>'movimiento_origen_id') <> '' 
                THEN (v_elem->>'movimiento_origen_id')::UUID 
                ELSE NULL 
            END;

            IF v_origen_id IS NOT NULL THEN
                SELECT tipo_movimiento, inf.estado 
                INTO v_origen_tipo, v_origen_estado
                FROM public.logistica_informe_movimientos m
                JOIN public.logistica_informes_diarios inf ON inf.id = m.informe_id
                WHERE m.id = v_origen_id;

                IF NOT FOUND OR v_origen_tipo <> 'Entrega de cajas' OR v_origen_estado <> 'enviado' THEN
                    v_origen_id := NULL;
                END IF;
            END IF;

            INSERT INTO public.logistica_informe_movimientos (
                id,
                informe_id,
                movimiento_origen_id,
                reporte_id,
                id_cirugia_snapshot,
                cliente_snapshot,
                tipo_movimiento,
                paciente_snapshot,
                medico_snapshot,
                institucion_snapshot,
                fecha_cirugia_snapshot,
                destino,
                cantidad_cajas,
                cantidad_bultos,
                resultado,
                tiene_pendiente,
                cantidad_pendiente,
                detalle_pendiente,
                motivo_pendiente,
                observaciones,
                trazabilidad_activa,
                orden,
                created_at,
                updated_at
            ) VALUES (
                COALESCE(v_elem_id, gen_random_uuid()),
                v_res_id,
                v_origen_id,
                (v_elem->>'reporte_id')::INTEGER,
                v_elem->>'id_cirugia_snapshot',
                v_elem->>'cliente_snapshot',
                v_tipo,
                COALESCE(v_elem->>'paciente_snapshot', 'Sin especificar'),
                v_elem->>'medico_snapshot',
                v_elem->>'institucion_snapshot',
                (v_elem->>'fecha_cirugia_snapshot')::DATE,
                COALESCE(v_elem->>'destino', 'Central'),
                v_cajas,
                v_bultos,
                v_elem->>'resultado',
                COALESCE((v_elem->>'tiene_pendiente')::BOOLEAN, false),
                CASE WHEN (v_elem->>'tiene_pendiente')::BOOLEAN THEN 1 ELSE 0 END,
                v_elem->>'detalle_pendiente',
                v_elem->>'motivo_pendiente',
                v_elem->>'observaciones',
                (v_tipo = 'Entrega de cajas'),
                v_orden,
                v_now,
                v_now
            )
            ON CONFLICT (id) DO UPDATE SET
                movimiento_origen_id = EXCLUDED.movimiento_origen_id,
                reporte_id = EXCLUDED.reporte_id,
                id_cirugia_snapshot = EXCLUDED.id_cirugia_snapshot,
                cliente_snapshot = EXCLUDED.cliente_snapshot,
                tipo_movimiento = EXCLUDED.tipo_movimiento,
                paciente_snapshot = EXCLUDED.paciente_snapshot,
                medico_snapshot = EXCLUDED.medico_snapshot,
                institucion_snapshot = EXCLUDED.institucion_snapshot,
                fecha_cirugia_snapshot = EXCLUDED.fecha_cirugia_snapshot,
                destino = EXCLUDED.destino,
                cantidad_cajas = EXCLUDED.cantidad_cajas,
                cantidad_bultos = EXCLUDED.cantidad_bultos,
                resultado = EXCLUDED.resultado,
                tiene_pendiente = EXCLUDED.tiene_pendiente,
                cantidad_pendiente = EXCLUDED.cantidad_pendiente,
                detalle_pendiente = EXCLUDED.detalle_pendiente,
                motivo_pendiente = EXCLUDED.motivo_pendiente,
                observaciones = EXCLUDED.observaciones,
                trazabilidad_activa = EXCLUDED.trazabilidad_activa,
                orden = EXCLUDED.orden,
                updated_at = v_now;

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

-- Permisos RPC guardar_borrador
REVOKE EXECUTE ON FUNCTION public.guardar_borrador_informe_logistica(UUID, DATE, UUID, TEXT, TEXT, TEXT, JSONB, INTEGER, UUID[], BOOLEAN) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.guardar_borrador_informe_logistica(UUID, DATE, UUID, TEXT, TEXT, TEXT, JSONB, INTEGER, UUID[], BOOLEAN) TO authenticated;
