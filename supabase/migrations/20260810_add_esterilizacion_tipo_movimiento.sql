-- Archivo: supabase/migrations/20260810_add_esterilizacion_tipo_movimiento.sql
-- Descripción: Agregar 'Esterilización' a los tipos de movimiento permitidos en logistica_informe_movimientos.

DO $$ 
BEGIN 
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'logistica_informe_movimientos') THEN
    ALTER TABLE public.logistica_informe_movimientos 
    DROP CONSTRAINT IF EXISTS logistica_informe_movimientos_tipo_movimiento_check;

    ALTER TABLE public.logistica_informe_movimientos 
    ADD CONSTRAINT logistica_informe_movimientos_tipo_movimiento_check 
    CHECK (tipo_movimiento IN (
        'Entrega de cajas',
        'Retiro de cajas',
        'Esterilización',
        'Devolución de implantes',
        'Entrega o retiro de documentación',
        'Traslado interno',
        'Traslado a Central',
        'Otra gestión',
        'Incidencia'
    ));
  END IF;
END $$;

