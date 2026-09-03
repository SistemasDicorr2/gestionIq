-- Migration: 20260903_cajas_knowledge_seed_historico.sql
-- Carga Inicial Histórica - Cajas & Knowledge (Gestión IQ)
-- Preservación de la memoria histórica de codificación, diccionario y posts de conocimiento.

-- 1. Actualización de Seed previo 'PE' -> 'P' (PEEK) para evitar colisión de código/significado
UPDATE public.cajas_diccionario
SET codigo = 'P', descripcion = 'Polímero PEEK radiolúcido histórico', updated_at = NOW()
WHERE LOWER(grupo) = 'material' AND (codigo = 'PE' OR codigo = 'P');

-- Actualización de Seed previo 'C = Caja Completa' -> 'C = Contenedor' según Knowledge histórico
UPDATE public.cajas_diccionario
SET significado = 'Contenedor', significado_normalizado = 'CONTENEDOR', descripcion = 'Contenedor histórico / caja de instrumental', updated_at = NOW()
WHERE LOWER(grupo) = 'contenido' AND codigo = 'C';

-- 2. Inserción Idempotente del Diccionario Histórico de Componentes
INSERT INTO public.cajas_diccionario (grupo, codigo, significado, significado_normalizado, descripcion)
SELECT g, c, s, sn, d
FROM (VALUES 
    -- Familias históricas conocidas
    ('Familia', 'CO', 'Columna', 'COLUMNA', 'Cajas, implantes e instrumental para cirugía de columna vertebral'),
    ('Familia', 'RR', 'Reemplazo Rodilla', 'REEMPLAZO RODILLA', 'Reemplazo de rodilla / familia histórica JPX'),
    ('Familia', 'RC', 'Reemplazo Cadera Cementada / No Cementada', 'REEMPLAZO CADERA CEMENTADA / NO CEMENTADA', 'Reemplazo de cadera cementado y no cementado histórico'),
    ('Familia', 'RN', 'Reemplazo Cadera No Cementada', 'REEMPLAZO CADERA NO CEMENTADA', 'Reemplazo de cadera no cementado definido históricamente'),
    ('Familia', 'AR', 'Artroscopia', 'ARTROSCOPIA', 'Artroscopia y medicina del deporte'),
    ('Familia', 'TR', 'Tornillo Canulado', 'TORNILLO CANULADO', 'Tornillos canulados y accesorios'),
    ('Familia', 'LC', 'Ligamento Cruzado', 'LIGAMENTO CRUZADO', 'Diccionario histórico ligamento cruzado (también LG)'),
    ('Familia', 'LG', 'Ligamento', 'LIGAMENTO', 'Ligamentos y medicina del deporte'),
    ('Familia', 'CL', 'Clavo Endomedular', 'CLAVO ENDOMEDULAR', 'Clavos endomedulares de fémur, tibia y húmero'),
    ('Familia', 'EX', 'Extracción', 'EXTRACCION', 'Kits y sets de extracción de implantes'),
    ('Familia', 'PC', 'Placa / Clavo', 'PLACA / CLAVO', 'Placa clavo DHS/DCS y tutores AO'),
    ('Familia', 'HE', 'Herbert', 'HERBERT', 'Tornillos Herbert y microherbert'),
    ('Familia', 'RP', 'Reemplazo Parcial / Cúpula', 'REEMPLAZO PARCIAL / CUPULA', 'Reemplazo parcial Thompson / cúpula radial'),
    ('Familia', 'TU', 'Tutor Externo', 'TUTOR EXTERNO', 'Tutores externos'),
    ('Familia', 'GM', 'Gamma', 'GAMMA', 'Clavos gamma históricos'),
    ('Familia', 'RD', 'Reducción Pelvis', 'REDUCCION PELVIS', 'Cajas de reducción para pelvis o platillo tibial'),
    ('Familia', 'MT', 'Motor', 'MOTOR', 'Motores quirúrgicos y accesorios'),
    ('Familia', 'SR', 'Sierra', 'SIERRA', 'Sierras quirúrgicas y reciprocantes'),
    ('Familia', 'MS', 'Motor + Sierra', 'MOTOR + SIERRA', 'Unidad combinada motor y sierra'),
    ('Familia', 'MC', 'Micro Motor', 'MICRO MOTOR', 'Micro motor / micro sierra'),
    ('Familia', 'TL', 'Taladro de Mano', 'TALADRO DE MANO', 'Taladros manuales y accesorios'),

    -- Materiales históricos (Ajustado: P = PEEK, X = Mixto)
    ('Material', 'P', 'PEEK', 'PEEK', 'Polímero PEEK radiolúcido histórico'),
    ('Material', 'X', 'Mixto / No Especificado', 'MIXTO / NO ESPECIFICADO', 'Material no específico o combinación de materiales'),

    -- Medidas / Variantes históricas
    ('Medida', '00', 'Sin Medida Única / Rango', 'SIN MEDIDA UNICA / RANGO', 'Rango de medidas o medida no aplicable'),
    ('Medida', '40', '4,0 mm', '4,0 MM', 'Medida de sistema 4.0 mm'),
    ('Medida', '60', '6,0 mm', '6,0 MM', 'Medida de sistema 6.0 mm'),
    ('Medida', '70', '7,0 mm', '7,0 MM', 'Medida de sistema 7.0 mm'),
    ('Medida', 'I1', 'Izquierda (Histórico)', 'IZQUIERDA (HISTORICO)', 'Variante de lado izquierdo histórica en clavos Expert'),
    ('Medida', 'D2', 'Derecha (Histórico)', 'DERECHA (HISTORICO)', 'Variante de lado derecho histórica en clavos Expert'),

    -- Clasificaciones específicas históricas
    ('Clasificación', 'CO', 'Columna / Fijación Vertebral', 'COLUMNA / FIJACION VERTEBRAL', 'Sistemas de columna, tornillos pediculares y cajas intersomáticas'),
    ('Clasificación', 'TP', 'Tibia Proximal', 'TIBIA PROXIMAL', 'Placas/cajas para tibia proximal (uso histórico con inconsistencias)'),
    ('Clasificación', 'FR', 'Fémur', 'FEMUR', 'Clavos/placas de fémur'),
    ('Clasificación', 'CM', 'Cementado', 'CEMENTADO', 'Prótesis o cotilos cementados'),
    ('Clasificación', 'CN', 'No Cementado', 'NO CEMENTADO', 'Prótesis o cotilos no cementados'),
    ('Clasificación', 'NT', 'Tallo No Cementado', 'TALLO NO CEMENTADO', 'Tallos no cementados'),
    ('Clasificación', 'HD', 'Húmero Distal', 'HUMERO DISTAL', 'Placas para húmero distal'),
    ('Clasificación', 'RT', 'Rótula', 'ROTULA', 'Placas/prótesis de rótula'),
    ('Clasificación', 'TX', 'Tibia Expert', 'TIBIA EXPERT', 'Clavos tibia expert'),
    ('Clasificación', 'FX', 'Fémur Expert', 'FEMUR EXPERT', 'Clavos fémur expert'),
    ('Clasificación', 'TA', 'Tibia con Antibiótico', 'TIBIA CON ANTIBIOTICO', 'Clavos tibia con antibiótico'),
    ('Clasificación', 'CV', 'Clavícula', 'CLAVICULA', 'Placas de clavícula'),
    ('Clasificación', 'RS', 'Reconstrucción', 'RECONSTRUCCION', 'Placas de reconstrucción'),
    ('Clasificación', 'HP', 'Húmero Proximal', 'HUMERO PROXIMAL', 'Placas para húmero proximal'),
    ('Clasificación', 'DT', 'DCP / Tercio Tubo', 'DCP / TERCIO TUBO', 'Placas tercio tubo / DCP (uso histórico con colisión TD/DT)'),
    ('Clasificación', 'PR', 'Peroné', 'PERONE', 'Placas de peroné'),
    ('Clasificación', 'TD', 'Tibia Distal', 'TIBIA DISTAL', 'Placas para tibia distal (uso histórico con colisión DT/TD)'),
    ('Clasificación', 'TL', 'T y L', 'T Y L', 'Placas en T y L'),
    ('Clasificación', 'DA', 'DCP Ancha y Angosta', 'DCP ANCHA Y ANGOSTA', 'Placas DCP anchas y angostas'),
    ('Clasificación', 'SC', 'Supracondílea', 'SUPRACONDILEA', 'Placas supracondíleas'),
    ('Clasificación', 'JK', 'Jockey', 'JOCKEY', 'Placas Jockey'),
    ('Clasificación', 'HB', 'Herbert Barouk', 'HERBERT BAROUK', 'Tornillos Herbert Barouk cónicos'),
    ('Clasificación', 'BT', 'Botón', 'BOTON', 'Botones de suspensión / artroscopia'),
    ('Clasificación', 'AP', 'Arpón', 'ARPON', 'Arpones de titanio o PEEK'),
    ('Clasificación', 'SM', 'Sutura Meniscal', 'SUTURA MENISCAL', 'Guías de sutura meniscal'),
    ('Clasificación', 'MC', 'Microfragmento', 'MICROFRAGMENTO', 'Tornillos e instrumental microfragmento'),
    ('Clasificación', 'TT', 'Tallo Tricónico', 'TALLO TRICONICO', 'Prótesis de tallo tricónico'),
    ('Clasificación', 'DM', 'Doble Movilidad', 'DOBLE MOVILIDAD', 'Cotilos de doble movilidad'),
    ('Clasificación', 'DH', 'DHS', 'DHS', 'Sistema placa clavo DHS'),
    ('Clasificación', 'OL', 'Olécranon', 'OLECRANON', 'Placas de olécranon'),
    ('Clasificación', 'OC', 'Osteosíntesis Clavo / Extracción', 'OSTEOSINTESIS CLAVO / EXTRACCION', 'Sets de extracción de clavos'),
    ('Clasificación', 'HM', 'Herbert Mini', 'HERBERT MINI', 'Microherbert 2.0 / 2.5'),
    ('Clasificación', 'TC', 'Tornillo Canulado', 'TORNILLO CANULADO', 'Tornillos canulados 3.5 / 4.5 / 7.0'),
    ('Clasificación', 'CR', 'Cúpula Radial', 'CUPULA RADIAL', 'Reemplazo cúpula radial'),
    ('Clasificación', 'JT', 'Rodilla Tibial', 'RODILLA TIBIAL', 'Componente tibial rodilla JPX'),
    ('Clasificación', 'JF', 'Rodilla Femoral', 'RODILLA FEMORAL', 'Componente femoral rodilla JPX'),
    ('Clasificación', 'JP', 'Rodilla Patelar', 'RODILLA PATELAR', 'Componente patelar rodilla JPX'),
    ('Clasificación', 'TN', 'Tenodesis', 'TENODESIS', 'Tornillos y guías de tenodesis')
) AS t(g, c, s, sn, d)
WHERE NOT EXISTS (
    SELECT 1 FROM public.cajas_diccionario d
    WHERE LOWER(d.grupo) = LOWER(t.g)
      AND (LOWER(d.codigo) = LOWER(t.c) OR LOWER(COALESCE(d.significado_normalizado, d.significado)) = LOWER(COALESCE(t.sn, t.s)))
);

-- 3. Función RPC Actualizada: Generación Segura de Códigos con Bloqueo Transaccional Real pg_advisory_xact_lock
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
    -- Caso 1: Código Histórico / Manual (si no se proveyó codigo_base ni serie)
    IF p_es_historico IS TRUE AND p_codigo_manual IS NOT NULL AND TRIM(p_codigo_manual) <> '' AND (v_base IS NULL OR v_base = '') THEN
        v_final_code := TRIM(p_codigo_manual);
        v_base := NULL;
        v_next_serie := NULL;
    ELSE
        -- Caso 2: Código Generado o Histórico Canónico descompuesto
        IF v_base IS NULL OR v_base = '' THEN
            RAISE EXCEPTION 'El código base no puede estar vacío para códigos estructurados.';
        END IF;

        -- BLOQUEO TRANSACCIONAL REAL: Adquirir advisory lock exclusivo basado en hashtext del codigo_base
        PERFORM pg_advisory_xact_lock(hashtext(v_base));

        -- Recalcular MAX(serie) de manera aislada y atómica
        SELECT COALESCE(MAX(serie), 0) + 1 INTO v_next_serie
        FROM public.cajas_codigos
        WHERE codigo_base = v_base;

        -- Formato final para nuevos códigos o tomar el manual si es un histórico estructurado
        IF p_es_historico IS TRUE AND p_codigo_manual IS NOT NULL AND TRIM(p_codigo_manual) <> '' THEN
            v_final_code := TRIM(p_codigo_manual);
        ELSE
            v_final_code := v_base || '-' || LPAD(v_next_serie::TEXT, 3, '0');
        END IF;
    END IF;

    -- Inserción garantizada con UNIQUE(codigo)
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

-- 4. Carga Masiva Idempotente de Códigos Históricos (305 registros únicos)
INSERT INTO public.cajas_codigos (
    codigo, codigo_base, serie, familia, material, variante, clasificacion, contenido, marca, nombre, estado, es_historico, observaciones
) VALUES
('CL-T00FRP-001', 'CL-T00FRP', 1, 'CL', 'T', '00', 'FR', 'P', 'BIOPROTECE', 'CAJA FEMUR TITANIO 001', 'historico', true, 'Histórico importado del padrón Districorr. Fuentes: CLAVOS ENDOMEDULARES, IMPLANTES E INSTRUMENTAL QUIRURGICO. Descripciones históricas observadas: CAJA FEMUR TITANIO 001 / CLAVO TITANIO FEMUR IMPLANTES 001.'),
('CL-T00FRI-001', 'CL-T00FRI', 1, 'CL', 'T', '00', 'FR', 'I', 'BIOPROTECE', 'INSTRUMENTAL FEMUR TITANIO 001', 'historico', true, 'Histórico importado del padrón Districorr. Fuentes: CLAVOS ENDOMEDULARES, CAJAS. Descripciones históricas observadas: INSTRUMENTAL FEMUR TITANIO 001 / INSTRUMENTAL CLAVO FEMUR TITANIO 001.'),
('CL-T00FRP-002', 'CL-T00FRP', 2, 'CL', 'T', '00', 'FR', 'P', NULL, 'CAJA FEMUR TITANIO 002', 'historico', true, 'Histórico importado del padrón Districorr. Fuentes: CLAVOS ENDOMEDULARES, CAJAS. Descripciones históricas observadas: CAJA FEMUR TITANIO 002 / IMPLANTES CLAVO FEMUR TITANIO 002.'),
('CL-T00FRI-002', 'CL-T00FRI', 2, 'CL', 'T', '00', 'FR', 'I', NULL, 'INSTRUMENTAL FEMUR TITANIO 002', 'historico', true, 'Histórico importado del padrón Districorr. Fuentes: CLAVOS ENDOMEDULARES, CAJAS. Descripciones históricas observadas: INSTRUMENTAL FEMUR TITANIO 002 / INSTRUMENTAL CLAVO FEMUR TITANIO 002.'),
('CL-A00FRP-001', 'CL-A00FRP', 1, 'CL', 'A', '00', 'FR', 'P', 'BIOPROTECE', 'CAJA FEMUR ACERO 001', 'historico', true, 'Histórico importado del padrón Districorr. Fuentes: CLAVOS ENDOMEDULARES, CAJAS. Descripciones históricas observadas: CAJA FEMUR ACERO 001 / IMPLANTES CLAVO FEMUR ACERO 001.'),
('CL-A00FRI-001', 'CL-A00FRI', 1, 'CL', 'A', '00', 'FR', 'I', NULL, 'INSTRUMENTAL FEMUR ACERO 001', 'historico', true, 'Histórico importado del padrón Districorr. Fuentes: CLAVOS ENDOMEDULARES, CAJAS. Descripciones históricas observadas: INSTRUMENTAL FEMUR ACERO 001 / INSTRUMENTAL CLAVO FEMUR ACERO 001.'),
('CL-T00FXI-001', 'CL-T00FXI', 1, 'CL', 'T', '00', 'FX', 'I', NULL, 'CAJA INSTRUMENTAL EXPERT TITANIO 001', 'historico', true, 'Histórico importado del padrón Districorr. Fuentes: CLAVOS ENDOMEDULARES, IMPLANTES E INSTRUMENTAL QUIRURGICO. Descripciones históricas observadas: CAJA INSTRUMENTAL EXPERT TITANIO 001 / CLAVO TITANIO FEMUR EXPERT INSTRUMENTAL 001.'),
('CL-TI1FXP-001', 'CL-TI1FXP', 1, 'CL', 'T', 'I1', 'FX', 'P', 'BIOPROTECE', 'IMPLANTE IZQUIERDA EXPERT TITANIO 001', 'historico', true, 'Histórico importado del padrón Districorr. Fuentes: CLAVOS ENDOMEDULARES, IMPLANTES E INSTRUMENTAL QUIRURGICO. Descripciones históricas observadas: IMPLANTE IZQUIERDA EXPERT TITANIO 001 / CLAVO TITANIO IZQUIERDA FEMUR EXPERT IMPLANTES 001.'),
('CL-AD2FXP-001', 'CL-AD2FXP', 1, 'CL', 'A', 'D2', 'FX', 'P', NULL, 'IMPLANTE DERECHA EXPERT TITANIO 002', 'historico', true, 'Histórico importado del padrón Districorr. Fuentes: CLAVOS ENDOMEDULARES, MOTORES Y EQUIPOS. Descripciones históricas observadas: IMPLANTE DERECHA EXPERT TITANIO 002 / CLAVOS ENDOMEDULARES.'),
('CL-T00TBP-001', 'CL-T00TBP', 1, 'CL', 'T', '00', 'TB', 'P', NULL, 'CAJA TIBIA TITANIO 001', 'historico', true, 'Histórico importado del padrón Districorr. Fuentes: CLAVOS ENDOMEDULARES, SETS DE IMPLANTES. Descripciones históricas observadas: CAJA TIBIA TITANIO 001 / CLAVO TIBIA TITANIO 001.'),
('CL-T00TBI-001', 'CL-T00TBI', 1, 'CL', 'T', '00', 'TB', 'I', NULL, 'INSTRUMENTAL TIBIA TITANIO 001', 'historico', true, 'Histórico importado del padrón Districorr. Fuentes: CLAVOS ENDOMEDULARES, CAJAS. Descripciones históricas observadas: INSTRUMENTAL TIBIA TITANIO 001 / CLAVO TIBIA INSTRUMENTAL TITANIO 001.'),
('CL-T00TBP-002', 'CL-T00TBP', 2, 'CL', 'T', '00', 'TB', 'P', NULL, 'CAJA TIBIA TITANIO 002', 'historico', true, 'Histórico importado del padrón Districorr. Fuentes: CLAVOS ENDOMEDULARES, SETS DE IMPLANTES. Descripciones históricas observadas: CAJA TIBIA TITANIO 002 / CLAVO TIBIA TITANIO 002.'),
('CL-T00TBI-002', 'CL-T00TBI', 2, 'CL', 'T', '00', 'TB', 'I', NULL, 'INSTRUMENTAL TIBIA TITANIO 002', 'historico', true, 'Histórico importado del padrón Districorr. Fuentes: CLAVOS ENDOMEDULARES, CAJAS. Descripciones históricas observadas: INSTRUMENTAL TIBIA TITANIO 002 / INSTRUMENTAL CLAVO TIBIA TITANIO 002.'),
('CL-T00TXP-001', 'CL-T00TXP', 1, 'CL', 'T', '00', 'TX', 'P', 'BIOPROTECE', 'CAJA TIBIA EXPERT TITANIO 001', 'historico', true, 'Histórico importado del padrón Districorr. Fuentes: CLAVOS ENDOMEDULARES, IMPLANTES E INSTRUMENTAL QUIRURGICO. Descripciones históricas observadas: CAJA TIBIA EXPERT TITANIO 001 / CLAVO TITANIO TIBIA EXPERT IMPLANTES 001.'),
('CL-T00TXI-001', 'CL-T00TXI', 1, 'CL', 'T', '00', 'TX', 'I', NULL, 'INSTRUMENTAL TIBIA EXPERT 001', 'historico', true, 'Histórico importado del padrón Districorr. Fuentes: CLAVOS ENDOMEDULARES, MOTORES Y EQUIPOS. Descripciones históricas observadas: INSTRUMENTAL TIBIA EXPERT 001 / CLAVOS ENDOMEDULARES.'),
('CL-A00TBP-001', 'CL-A00TBP', 1, 'CL', 'A', '00', 'TB', 'P', NULL, 'CAJA TIBIA EXPERT TITANIO 001', 'historico', true, 'Histórico importado del padrón Districorr. Fuentes: CLAVOS ENDOMEDULARES, CAJAS. Descripciones históricas observadas: CAJA TIBIA EXPERT TITANIO 001 / IMPLANTES CLAVO TIBIA ACERO 001.'),
('CL-A00TBI-001', 'CL-A00TBI', 1, 'CL', 'A', '00', 'TB', 'I', NULL, 'INSTRUMENTAL TIBIA ACERO', 'historico', true, 'Histórico importado del padrón Districorr. Fuentes: CLAVOS ENDOMEDULARES, CAJAS. Descripciones históricas observadas: INSTRUMENTAL TIBIA ACERO / INSTRUMENTAL CLAVO TIBIA ACERO 001.'),
('CL-T00TAP-001', 'CL-T00TAP', 1, 'CL', 'T', '00', 'TA', 'P', NULL, 'CAJA TIBIA C/ ANTIBIOTICO MULTIACERROJADO', 'historico', true, 'Histórico importado del padrón Districorr. Fuentes: CLAVOS ENDOMEDULARES, CAJAS. Descripciones históricas observadas: CAJA TIBIA C/ ANTIBIOTICO MULTIACERROJADO / CLAVO TIBIA C/ANTIBIOTICO TITANIO MULTIACERROJADO 001.'),
('CL-T00TAI-001', 'CL-T00TAI', 1, 'CL', 'T', '00', 'TA', 'I', NULL, 'INSTRUMENTAL TIBIA C/ ANTIBIOTICO MULTIACERROJADO', 'historico', true, 'Histórico importado del padrón Districorr. Fuentes: CLAVOS ENDOMEDULARES, MOTORES Y EQUIPOS. Descripciones históricas observadas: INSTRUMENTAL TIBIA C/ ANTIBIOTICO MULTIACERROJADO / CLAVOS ENDOMEDULARES.'),
('CL-T00HGP-001', 'CL-T00HGP', 1, 'CL', 'T', '00', 'HG', 'P', NULL, 'CAJA HUMERO TIPO "G" 001', 'historico', true, 'Histórico importado del padrón Districorr. Fuentes: CLAVOS ENDOMEDULARES, CAJAS. Descripciones históricas observadas: CAJA HUMERO TIPO "G" 001 / CLAVO TITANIO HUMERO TIPO G - 001.'),
('CL-T00HGI-001', 'CL-T00HGI', 1, 'CL', 'T', '00', 'HG', 'I', NULL, 'INSTRUMENTAL HUMERO TIPO "G" 001', 'historico', true, 'Histórico importado del padrón Districorr. Fuentes: CLAVOS ENDOMEDULARES, CAJAS. Descripciones históricas observadas: INSTRUMENTAL HUMERO TIPO "G" 001 / INSTRUMENTAL CLAVO HUMERO TIPO G - 001.'),
('CL-T00HRP-001', 'CL-T00HRP', 1, 'CL', 'T', '00', 'HR', 'P', NULL, 'CAJA HUMERO 001', 'historico', true, 'Histórico importado del padrón Districorr. Fuentes: CLAVOS ENDOMEDULARES, IMPLANTES E INSTRUMENTAL QUIRURGICO. Descripciones históricas observadas: CAJA HUMERO 001 / CLAVO DE HUMERO TITANIO 001.'),
('CL-T00HRI-001', 'CL-T00HRI', 1, 'CL', 'T', '00', 'HR', 'I', NULL, 'INSTRUMENTAL HUMERO TIPO "G" 001', 'historico', true, 'Histórico importado del padrón Districorr. Fuentes: CLAVOS ENDOMEDULARES, IMPLANTES E INSTRUMENTAL QUIRURGICO. Descripciones históricas observadas: INSTRUMENTAL HUMERO TIPO "G" 001 / INSTRUMENTAL TITANIO CLAVO HUMERO 001.'),
('RC-T00GMC-001', 'RC-T00GMC', 1, 'RC', 'T', '00', 'GM', 'C', NULL, 'CONTENEDOR GAMMA TITANIO 001', 'historico', true, 'Histórico importado del padrón Districorr. Fuentes: CLAVOS ENDOMEDULARES, MOTORES Y EQUIPOS. Descripciones históricas observadas: CONTENEDOR GAMMA TITANIO 001 / CLAVOS ENDOMEDULARES.'),
('RC-T00GMI-001', 'RC-T00GMI', 1, 'RC', 'T', '00', 'GM', 'I', NULL, 'INSTRUMENTAL GAMMA TITANIO 001', 'historico', true, 'Histórico importado del padrón Districorr. Fuentes: CLAVOS ENDOMEDULARES, MOTORES Y EQUIPOS. Descripciones históricas observadas: INSTRUMENTAL GAMMA TITANIO 001 / CLAVOS ENDOMEDULARES.'),
('RC-T00GMC-002', 'RC-T00GMC', 2, 'RC', 'T', '00', 'GM', 'C', NULL, 'CONTENEDOR GAMMA TITANIO 002', 'historico', true, 'Histórico importado del padrón Districorr. Fuentes: CLAVOS ENDOMEDULARES, MOTORES Y EQUIPOS. Descripciones históricas observadas: CONTENEDOR GAMMA TITANIO 002 / CLAVOS ENDOMEDULARES.'),
('RC-T00GMI-002', 'RC-T00GMI', 2, 'RC', 'T', '00', 'GM', 'I', NULL, 'INSTRUMENTAL GAMMA TITANIO 002', 'historico', true, 'Histórico importado del padrón Districorr. Fuentes: CLAVOS ENDOMEDULARES, MOTORES Y EQUIPOS. Descripciones históricas observadas: INSTRUMENTAL GAMMA TITANIO 002 / CLAVOS ENDOMEDULARES.'),
('RD-X00PLI-001', 'RD-X00PLI', 1, 'RD', 'X', '00', 'PL', 'I', NULL, 'CAJA DE REDUCCION INSTRUMENTAL PELVIS 001', 'historico', true, 'Histórico importado del padrón Districorr. Fuentes: OSTEOSÍNTESIS, CAJAS.'),
('PC-A00DHU-001', 'PC-A00DHU', 1, 'PC', 'A', '00', 'DH', 'U', 'BIOPROTECE', 'CAJA TUTOR AO ACERO 001', 'historico', true, 'Histórico importado del padrón Districorr. Fuentes: OSTEOSÍNTESIS, CAJAS. Descripciones históricas observadas: CAJA TUTOR AO ACERO 001 / PLACA CLAVO DHS ACERO 001.'),
('OS-T35TPU-001', 'OS-T35TPU', 1, 'OS', 'T', '35', 'TP', 'U', NULL, 'CAJA OSTEOSINTESIS TIBIA DISTAL 3,5', 'historico', true, 'Histórico importado del padrón Districorr. Fuentes: OSTEOSÍNTESIS, MOTORES Y EQUIPOS. Descripciones históricas observadas: CAJA OSTEOSINTESIS TIBIA DISTAL 3,5 / OSTEOSÍNTESIS.'),
('ST-T35TDP-001', 'ST-T35TDP', 1, 'ST', 'T', '35', 'TD', 'P', NULL, 'SET TIBIA DISTAL 3,5', 'historico', true, 'Histórico importado del padrón Districorr. Fuentes: OSTEOSÍNTESIS, MOTORES Y EQUIPOS. Descripciones históricas observadas: SET TIBIA DISTAL 3,5 / OSTEOSÍNTESIS.'),
('MT-SIMTLB-001', 'MT-SIMTLB', 1, 'MT', 'S', 'IM', 'TL', 'B', 'TOTAL', 'MOTOR A BATERIA TOTAL', 'historico', true, 'Histórico importado del padrón Districorr. Fuentes: OSTEOSÍNTESIS, MOTORES Y EQUIPOS. Descripciones históricas observadas: MOTOR A BATERIA TOTAL / MOTOR CANULADO A BATERIA / 2 / MOTORES Y EQUIPOS, OSTEOSÍNTESIS.'),
('OS-T35CLU-002', 'OS-T35CLU', 2, 'OS', 'T', '35', 'CL', 'U', NULL, 'CAJA OSTEOSINTESIS CLAVICULA 3,5', 'historico', true, 'Histórico importado del padrón Districorr. Fuentes: OSTEOSÍNTESIS, CAJAS. Descripciones históricas observadas: CAJA OSTEOSINTESIS CLAVICULA 3,5 / OSTEOSINTESIS 3,5 TITANIO CLAVICULA 002.'),
('ST-T35CLP-002', 'ST-T35CLP', 2, 'ST', 'T', '35', 'CL', 'P', 'BIOPROTECE', 'SET CLAVICULA 3,5', 'historico', true, 'Histórico importado del padrón Districorr. Fuentes: OSTEOSÍNTESIS, SETS DE IMPLANTES. Descripciones históricas observadas: SET CLAVICULA 3,5 / SET PLACA P/ CLAVICULA 3,5 TITANIO 002.'),
('MT-SIMTLB-002', 'MT-SIMTLB', 2, 'MT', 'S', 'IM', 'TL', 'B', 'TOTAL', 'MOTOR A BATERIA TOTAL', 'historico', true, 'Histórico importado del padrón Districorr. Fuentes: OSTEOSÍNTESIS, MOTORES Y EQUIPOS. Descripciones históricas observadas: MOTOR A BATERIA TOTAL / MOTOR CANULADO A BATERIA / 2 / MOTORES Y EQUIPOS, OSTEOSÍNTESIS.'),
('OS-T35VLU-003', 'OS-T35VLU', 3, 'OS', 'T', '35', 'VL', 'U', NULL, 'CAJA OSTEOSINTESIS VOLAR 3,5 003', 'historico', true, 'Histórico importado del padrón Districorr. Fuentes: OSTEOSÍNTESIS, CAJAS. Descripciones históricas observadas: CAJA OSTEOSINTESIS VOLAR 3,5 003 / OSTEOSINTESIS 3,5 TITANIO VOLAR 003.'),
('ST-T35VLP-003', 'ST-T35VLP', 3, 'ST', 'T', '35', 'VL', 'P', NULL, 'SET VOLAR 3,5', 'historico', true, 'Histórico importado del padrón Districorr. Fuentes: OSTEOSÍNTESIS, SETS DE IMPLANTES. Descripciones históricas observadas: SET VOLAR 3,5 / SET DE PLACA VOLAR 3,5 TITANIO 003.'),
('MT-SIMTLB-003', 'MT-SIMTLB', 3, 'MT', 'S', 'IM', 'TL', 'B', 'TOTAL', 'MOTOR A BATERIA TOTAL', 'historico', true, 'Histórico importado del padrón Districorr. Fuentes: OSTEOSÍNTESIS, MOTORES Y EQUIPOS. Descripciones históricas observadas: MOTOR A BATERIA TOTAL / MOTOR CANULADO A BATERIA / 2 / MOTORES Y EQUIPOS, OSTEOSÍNTESIS.'),
('OS-T35VLU-004', 'OS-T35VLU', 4, 'OS', 'T', '35', 'VL', 'U', NULL, 'CAJA OSTEOSINTESIS VOLAR 3,5 004', 'historico', true, 'Histórico importado del padrón Districorr. Fuentes: OSTEOSÍNTESIS, CAJAS. Descripciones históricas observadas: CAJA OSTEOSINTESIS VOLAR 3,5 004 / OSTEOSINTESIS 3.5 TITANIO VOLAR 004.'),
('ST-T35VLP-004', 'ST-T35VLP', 4, 'ST', 'T', '35', 'VL', 'P', NULL, 'SET VOLAR 3,5', 'historico', true, 'Histórico importado del padrón Districorr. Fuentes: OSTEOSÍNTESIS, SETS DE IMPLANTES. Descripciones históricas observadas: SET VOLAR 3,5 / SET PLACA VOLAR 3.5 004.'),
('MT-SIMTLB-004', 'MT-SIMTLB', 4, 'MT', 'S', 'IM', 'TL', 'B', 'TOTAL', 'MOTOR A BATERIA TOTAL', 'historico', true, 'Histórico importado del padrón Districorr. Fuentes: OSTEOSÍNTESIS, MOTORES Y EQUIPOS. Descripciones históricas observadas: MOTOR A BATERIA TOTAL / MOTOR CANULADO A BATERIA / 2 / MOTORES Y EQUIPOS, OSTEOSÍNTESIS.'),
('OS-T35TDU-005', 'OS-T35TDU', 5, 'OS', 'T', '35', 'TD', 'U', NULL, 'OSTEOSINTESIS TIBIA PROXIMAL 3,5', 'historico', true, 'Histórico importado del padrón Districorr. Fuentes: OSTEOSÍNTESIS, CAJAS. Descripciones históricas observadas: OSTEOSINTESIS TIBIA PROXIMAL 3,5 / OSTEOSINTESIS 3,5 TITANIO TIBIA DISTAL 005.'),
('ST-T35TPP-005', 'ST-T35TPP', 5, 'ST', 'T', '35', 'TP', 'P', NULL, 'SET TIBIA PROXIMAL', 'historico', true, 'Histórico importado del padrón Districorr. Fuentes: OSTEOSÍNTESIS, MOTORES Y EQUIPOS. Descripciones históricas observadas: SET TIBIA PROXIMAL / OSTEOSÍNTESIS.'),
('MT-SIMTLB-005', 'MT-SIMTLB', 5, 'MT', 'S', 'IM', 'TL', 'B', 'TOTAL', 'MOTOR A BATERIA TOTAL', 'historico', true, 'Histórico importado del padrón Districorr. Fuentes: OSTEOSÍNTESIS, MOTORES Y EQUIPOS. Descripciones históricas observadas: MOTOR A BATERIA TOTAL / MOTOR CANULADO A BATERIA / 2 / MOTORES Y EQUIPOS, OSTEOSÍNTESIS.'),
('OS-T35DCU-006', 'OS-T35DCU', 6, 'OS', 'T', '35', 'DC', 'U', NULL, 'OSTEOSINTESIS DCP/TERCIOTUBO 3,5', 'historico', true, 'Histórico importado del padrón Districorr. Fuentes: OSTEOSÍNTESIS, MOTORES Y EQUIPOS. Descripciones históricas observadas: OSTEOSINTESIS DCP/TERCIOTUBO 3,5 / OSTEOSÍNTESIS.'),
('ST-T35TDP-006', 'ST-T35TDP', 6, 'ST', 'T', '35', 'TD', 'P', NULL, 'SET DCP/TERCIOTUBO 3,5', 'historico', true, 'Histórico importado del padrón Districorr. Fuentes: OSTEOSÍNTESIS, MOTORES Y EQUIPOS. Descripciones históricas observadas: SET DCP/TERCIOTUBO 3,5 / OSTEOSÍNTESIS.'),
('MT-SIMTLB-006', 'MT-SIMTLB', 6, 'MT', 'S', 'IM', 'TL', 'B', 'TOTAL', 'MOTOR A BATERIA TOTAL', 'historico', true, 'Histórico importado del padrón Districorr. Fuentes: OSTEOSÍNTESIS, MOTORES Y EQUIPOS. Descripciones históricas observadas: MOTOR A BATERIA TOTAL / MOTOR CANULADO A BATERIA / 2 / MOTORES Y EQUIPOS, OSTEOSÍNTESIS.'),
('OS-T35DTU-007', 'OS-T35DTU', 7, 'OS', 'T', '35', 'DT', 'U', NULL, 'OSTEOSINTESIS DCP/TERCIOTUBO 3,5', 'historico', true, 'Histórico importado del padrón Districorr. Fuentes: OSTEOSÍNTESIS, CAJAS. Descripciones históricas observadas: OSTEOSINTESIS DCP/TERCIOTUBO 3,5 / OSTEOSINTESIS 3,5 TITANIO DCP/TERCIOTUBO 007.'),
('ST-T35TDP-007', 'ST-T35TDP', 7, 'ST', 'T', '35', 'TD', 'P', NULL, 'SET DE PLACAS DCP/TERCIOTUBO 3,5', 'historico', true, 'Histórico importado del padrón Districorr. Fuentes: OSTEOSÍNTESIS, MOTORES Y EQUIPOS. Descripciones históricas observadas: SET DE PLACAS DCP/TERCIOTUBO 3,5 / OSTEOSÍNTESIS.'),
('MT-SIMTLB-007', 'MT-SIMTLB', 7, 'MT', 'S', 'IM', 'TL', 'B', 'TOTAL', 'MOTOR A BATERIA TOTAL', 'historico', true, 'Histórico importado del padrón Districorr. Fuentes: OSTEOSÍNTESIS, MOTORES Y EQUIPOS. Descripciones históricas observadas: MOTOR A BATERIA TOTAL / MOTOR CANULADO A BATERIA / 3 / MOTORES Y EQUIPOS, OSTEOSÍNTESIS.'),
('OS-T35DTU-008', 'OS-T35DTU', 8, 'OS', 'T', '35', 'DT', 'U', NULL, 'OSTEOSINTESIS DCP/TERCIOTUBO 3,5', 'historico', true, 'Histórico importado del padrón Districorr. Fuentes: OSTEOSÍNTESIS, CAJAS. Descripciones históricas observadas: OSTEOSINTESIS DCP/TERCIOTUBO 3,5 / OSTEOSINTESIS 3,5 TITANIO DCP/TERCIOTUBO 008.'),
('ST-T35TDP-008', 'ST-T35TDP', 8, 'ST', 'T', '35', 'TD', 'P', NULL, 'SET DE PLACAS DCP/TERCIOTUBO 3,5', 'historico', true, 'Histórico importado del padrón Districorr. Fuentes: OSTEOSÍNTESIS, MOTORES Y EQUIPOS. Descripciones históricas observadas: SET DE PLACAS DCP/TERCIOTUBO 3,5 / OSTEOSÍNTESIS.'),
('OS-T35VLU-009', 'OS-T35VLU', 9, 'OS', 'T', '35', 'VL', 'U', NULL, 'OSTEOSINTESIS VOLAR 3,5', 'historico', true, 'Histórico importado del padrón Districorr. Fuentes: OSTEOSÍNTESIS, CAJAS. Descripciones históricas observadas: OSTEOSINTESIS VOLAR 3,5 / OSTEOSINTESIS 3,5 TITANIO VOLAR 009.'),
('ST-T35VLP-009', 'ST-T35VLP', 9, 'ST', 'T', '35', 'VL', 'P', NULL, 'SET DE PLACAS DCP/TERCIOTUBO 3,5', 'historico', true, 'Histórico importado del padrón Districorr. Fuentes: OSTEOSÍNTESIS, SETS DE IMPLANTES. Descripciones históricas observadas: SET DE PLACAS DCP/TERCIOTUBO 3,5 / SET PLACAS VOLAR 3,5 009.'),
('MT-SIMTLB-009', 'MT-SIMTLB', 9, 'MT', 'S', 'IM', 'TL', 'B', 'TOTAL', 'MOTOR A BATERIA TOTAL', 'historico', true, 'Histórico importado del padrón Districorr. Fuentes: OSTEOSÍNTESIS, MOTORES Y EQUIPOS. Descripciones históricas observadas: MOTOR A BATERIA TOTAL / MOTOR CANULADO A BATERIA / 2 / MOTORES Y EQUIPOS, OSTEOSÍNTESIS.'),
('OS-T35OLU-010', 'OS-T35OLU', 10, 'OS', 'T', '35', 'OL', 'U', NULL, 'OSTEOSINTESIS OLECRANO 3,5', 'historico', true, 'Histórico importado del padrón Districorr. Fuentes: OSTEOSÍNTESIS, CAJAS. Descripciones históricas observadas: OSTEOSINTESIS OLECRANO 3,5 / OSTEOSINTESIS 3.5 TITANIO OLECRANON 010.'),
('ST-T35OLP-010', 'ST-T35OLP', 10, 'ST', 'T', '35', 'OL', 'P', NULL, 'SET PLACA OLECRANON TITANIO 3,5', 'historico', true, 'Histórico importado del padrón Districorr. Fuentes: OSTEOSÍNTESIS, MOTORES Y EQUIPOS. Descripciones históricas observadas: SET PLACA OLECRANON TITANIO 3,5 / OSTEOSÍNTESIS.'),
('ST-T35PYP-010', 'ST-T35PYP', 10, 'ST', 'T', '35', 'PY', 'P', 'BIOPROTECE', 'SET TITANIO 3.5 PLACA EN Y IMPLANTE 010', 'historico', true, 'Histórico importado del padrón Districorr. Fuentes: OSTEOSÍNTESIS, SETS DE IMPLANTES.'),
('MT-SIMTLB-010', 'MT-SIMTLB', 10, 'MT', 'S', 'IM', 'TL', 'B', 'TOTAL', 'MOTOR A BATERIA TOTAL', 'historico', true, 'Histórico importado del padrón Districorr. Fuentes: OSTEOSÍNTESIS, MOTORES Y EQUIPOS. Descripciones históricas observadas: MOTOR A BATERIA TOTAL / MOTOR CANULADO A BATERIA / 2 / MOTORES Y EQUIPOS, OSTEOSÍNTESIS.'),
('OS-T35CPU-011', 'OS-T35CPU', 11, 'OS', 'T', '35', 'CP', 'U', NULL, 'OSTEOSINTESIS CALCANEO/PHILO 3,5', 'historico', true, 'Histórico importado del padrón Districorr. Fuentes: OSTEOSÍNTESIS, CAJAS. Descripciones históricas observadas: OSTEOSINTESIS CALCANEO/PHILO 3,5 / OSTEOSINTESIS TITANIO 3,5 CALCANEO Y PHILO 011.'),
('ST-T35OLP-011', 'ST-T35OLP', 11, 'ST', 'T', '35', 'OL', 'P', NULL, 'SET PLACA OLECRANON TITANIO 3,5', 'historico', true, 'Histórico importado del padrón Districorr. Fuentes: OSTEOSÍNTESIS, MOTORES Y EQUIPOS. Descripciones históricas observadas: SET PLACA OLECRANON TITANIO 3,5 / OSTEOSÍNTESIS.'),
('ST-T35CCP-011', 'ST-T35CCP', 11, 'ST', 'T', '35', 'CC', 'P', NULL, 'SET PLACAS CALCANEO TITANIO 011', 'historico', true, 'Histórico importado del padrón Districorr. Fuentes: OSTEOSÍNTESIS, SETS DE IMPLANTES.'),
('MT-SIMTLB-011', 'MT-SIMTLB', 11, 'MT', 'S', 'IM', 'TL', 'B', 'TOTAL', 'MOTOR A BATERIA TOTAL', 'historico', true, 'Histórico importado del padrón Districorr. Fuentes: OSTEOSÍNTESIS, MOTORES Y EQUIPOS. Descripciones históricas observadas: MOTOR A BATERIA TOTAL / MOTOR CANULADO A BATERIA / 2 / MOTORES Y EQUIPOS, OSTEOSÍNTESIS.'),
('OS-T35CLU-012', 'OS-T35CLU', 12, 'OS', 'T', '35', 'CL', 'U', NULL, 'OSTEOSINTESIS CLAVICULA 3,5', 'historico', true, 'Histórico importado del padrón Districorr. Fuentes: OSTEOSÍNTESIS, CAJAS. Descripciones históricas observadas: OSTEOSINTESIS CLAVICULA 3,5 / OSTEOSINTESIS 3,5 TITANIO CLAVICULA - 012.'),
('ST-T35CLP-012', 'ST-T35CLP', 12, 'ST', 'T', '35', 'CL', 'P', NULL, 'SET PLACA P/ CLAVICULA 3,5 TITANIO 012', 'historico', true, 'Histórico importado del padrón Districorr. Fuentes: OSTEOSÍNTESIS, SETS DE IMPLANTES. Descripciones históricas observadas: SET PLACA P/ CLAVICULA 3,5 TITANIO 012 / SET PLACA P/ CLAVICULA 3,5 TITANIO - 012.'),
('MT-SIMTLB-012', 'MT-SIMTLB', 12, 'MT', 'S', 'IM', 'TL', 'B', 'TOTAL', 'MOTOR A BATERIA TOTAL', 'historico', true, 'Histórico importado del padrón Districorr. Fuentes: OSTEOSÍNTESIS, MOTORES Y EQUIPOS. Descripciones históricas observadas: MOTOR A BATERIA TOTAL / MOTOR CANULADO A BATERIA / 2 / MOTORES Y EQUIPOS, OSTEOSÍNTESIS.'),
('OS-T35DTU-013', 'OS-T35DTU', 13, 'OS', 'T', '35', 'DT', 'U', NULL, 'OSTEOSINTESIS DCP/TERCIOTUBO 3,5', 'historico', true, 'Histórico importado del padrón Districorr. Fuentes: OSTEOSÍNTESIS, CAJAS. Descripciones históricas observadas: OSTEOSINTESIS DCP/TERCIOTUBO 3,5 / OSTEOSINTESIS 3,5 TITANIO DCP/TERCIOTUBO 013.'),
('ST-T35TDP-013', 'ST-T35TDP', 13, 'ST', 'T', '35', 'TD', 'P', NULL, 'SET DE PLACAS DCP/TERCIOTUBO 3,5', 'historico', true, 'Histórico importado del padrón Districorr. Fuentes: OSTEOSÍNTESIS, MOTORES Y EQUIPOS. Descripciones históricas observadas: SET DE PLACAS DCP/TERCIOTUBO 3,5 / OSTEOSÍNTESIS.'),
('MT-SIMTLB-013', 'MT-SIMTLB', 13, 'MT', 'S', 'IM', 'TL', 'B', 'TOTAL', 'MOTOR A BATERIA TOTAL', 'historico', true, 'Histórico importado del padrón Districorr. Fuentes: OSTEOSÍNTESIS, MOTORES Y EQUIPOS. Descripciones históricas observadas: MOTOR A BATERIA TOTAL / MOTOR CANULADO A BATERIA / 2 / MOTORES Y EQUIPOS, OSTEOSÍNTESIS.'),
('OS-A35XXU-001', 'OS-A35XXU', 1, 'OS', 'A', '35', 'XX', 'U', NULL, 'OSTEOSINTESIS 3,5', 'historico', true, 'Histórico importado del padrón Districorr. Fuentes: OSTEOSÍNTESIS, CAJAS. Descripciones históricas observadas: OSTEOSINTESIS 3,5 / CAJA OSTEOSINTESIS ACERO 3.5 001.'),
('OS-A35XXU-002', 'OS-A35XXU', 2, 'OS', 'A', '35', 'XX', 'U', NULL, 'OSTEOSINTESIS 3,5', 'historico', true, 'Histórico importado del padrón Districorr. Fuentes: OSTEOSÍNTESIS, CAJAS. Descripciones históricas observadas: OSTEOSINTESIS 3,5 / CAJA OSTEOSINTESIS ACERO 3,5 002.'),
('OS-A35XXU-003', 'OS-A35XXU', 3, 'OS', 'A', '35', 'XX', 'U', NULL, 'OSTEOSINTESIS 3,5', 'historico', true, 'Histórico importado del padrón Districorr. Fuentes: OSTEOSÍNTESIS, CAJAS. Descripciones históricas observadas: OSTEOSINTESIS 3,5 / CAJA OSTEOSINTESIS ACERO 3,5 003.'),
('OS-T45XXU-001', 'OS-T45XXU', 1, 'OS', 'T', '45', 'XX', 'U', NULL, 'OSTEOSINTESIS 4.5', 'historico', true, 'Histórico importado del padrón Districorr. Fuentes: OSTEOSÍNTESIS, CAJAS. Descripciones históricas observadas: OSTEOSINTESIS 4.5 / CAJA OSTEOSINTESIS TITANIO 4.5 001.'),
('OS-T45XXU-002', 'OS-T45XXU', 2, 'OS', 'T', '45', 'XX', 'U', NULL, 'OSTEOSINTESIS 4.5', 'historico', true, 'Histórico importado del padrón Districorr. Fuentes: OSTEOSÍNTESIS, CAJAS. Descripciones históricas observadas: OSTEOSINTESIS 4.5 / CAJA OSTEOSINTESIS 4.5 TITANIO 002.'),
('OS-A45XXU-001', 'OS-A45XXU', 1, 'OS', 'A', '45', 'XX', 'U', NULL, 'OSTEOSINTESIS 4,5', 'historico', true, 'Histórico importado del padrón Districorr. Fuentes: OSTEOSÍNTESIS, CAJAS. Descripciones históricas observadas: OSTEOSINTESIS 4,5 / CAJA OSTEOSINTESIS ACERO 4,5.'),
('OS-A45XXU-002', 'OS-A45XXU', 2, 'OS', 'A', '45', 'XX', 'U', NULL, 'OSTEOSINTESIS 4,5', 'historico', true, 'Histórico importado del padrón Districorr. Fuentes: OSTEOSÍNTESIS, CAJAS. Descripciones históricas observadas: OSTEOSINTESIS 4,5 / OSTEOSINTESIS ACERO 4.5 002.'),
('PC-A00DHP-001', 'PC-A00DHP', 1, 'PC', 'A', '00', 'DH', 'P', 'BIOPROTECE', 'PLACA/CLAVO', 'historico', true, 'Histórico importado del padrón Districorr. Fuentes: OSTEOSÍNTESIS, SETS DE IMPLANTES. Descripciones históricas observadas: PLACA/CLAVO / SET PLACA CLAVO DHS ACERO 001.'),
('RC-X00CMC-001', 'RC-X00CMC', 1, 'RC', 'X', '00', 'CM', 'C', 'BIOPROTECE', 'REEMPLAZO TOTAL', 'historico', true, 'Histórico importado del padrón Districorr. Fuentes: REEMPLAZOS ARTICULARES, CAJAS. Descripciones históricas observadas: REEMPLAZO TOTAL / REEMPLAZO TOTAL DE CADERA CEMENTADA CONTENEDOR 001.'),
('RC-X00CMC-002', 'RC-X00CMC', 2, 'RC', 'X', '00', 'CM', 'C', 'BIOPROTECE', 'REEMPLAZO TOTAL', 'historico', true, 'Histórico importado del padrón Districorr. Fuentes: REEMPLAZOS ARTICULARES, IMPLANTES E INSTRUMENTAL QUIRURGICO. Descripciones históricas observadas: REEMPLAZO TOTAL / REEMPLAZO TOTAL DE CADERA CEMENTADA CONTENEDOR. 002.'),
('RC-X00CNC-001', 'RC-X00CNC', 1, 'RC', 'X', '00', 'CN', 'C', 'BIOPROTECE', 'REEMPLAZO TOTAL BIO PROTECE', 'historico', true, 'Histórico importado del padrón Districorr. Fuentes: REEMPLAZOS ARTICULARES, CAJAS. Descripciones históricas observadas: REEMPLAZO TOTAL BIO PROTECE / REEMPLAZO TOTAL DE CADERA NO CEMENTADA IMPLANTES 001.'),
('RC-X00CNI-001', 'RC-X00CNI', 1, 'RC', 'X', '00', 'CN', 'I', NULL, 'REEMPLAZO TOTAL BIO PROTECE', 'historico', true, 'Histórico importado del padrón Districorr. Fuentes: REEMPLAZOS ARTICULARES, MOTORES Y EQUIPOS. Descripciones históricas observadas: REEMPLAZO TOTAL BIO PROTECE / REEMPLAZOS ARTICULARES.'),
('RC-X00CNC-002', 'RC-X00CNC', 2, 'RC', 'X', '00', 'CN', 'C', 'OLYMPIA', 'REEMPLAZO TOTAL OLYMPIA', 'historico', true, 'Histórico importado del padrón Districorr. Fuentes: REEMPLAZOS ARTICULARES, CAJAS. Descripciones históricas observadas: REEMPLAZO TOTAL OLYMPIA / REEMPLAZO TOTAL DE CADERA NO CEMENTADA LAYNA IMPLANTES 002.'),
('RC-X00CNI-002', 'RC-X00CNI', 2, 'RC', 'X', '00', 'CN', 'I', NULL, 'REEMPLAZO TOTAL OLYMPIA', 'historico', true, 'Histórico importado del padrón Districorr. Fuentes: REEMPLAZOS ARTICULARES, MOTORES Y EQUIPOS. Descripciones históricas observadas: REEMPLAZO TOTAL OLYMPIA / REEMPLAZOS ARTICULARES.'),
('RC-X00TAC-001', 'RC-X00TAC', 1, 'RC', 'X', '00', 'TA', 'C', 'BIOPROTECE', 'REEMPLAZO TOTAL', 'historico', true, 'Histórico importado del padrón Districorr. Fuentes: REEMPLAZOS ARTICULARES, IMPLANTES E INSTRUMENTAL QUIRURGICO. Descripciones históricas observadas: REEMPLAZO TOTAL / REEMPLAZO TOTAL CADERA CEMENTADA TALLO TRICONICO CONT. 001.'),
('RC-X00DMC-001', 'RC-X00DMC', 1, 'RC', 'X', '00', 'DM', 'C', 'BIOPROTECE', 'REEMPLAZO TOTAL', 'historico', true, 'Histórico importado del padrón Districorr. Fuentes: REEMPLAZOS ARTICULARES, IMPLANTES E INSTRUMENTAL QUIRURGICO. Descripciones históricas observadas: REEMPLAZO TOTAL / REEMPLAZO TOT. DE CADERA CEMENTADA DOBLE MOVIL. CONT. 001.'),
('RP-X00THC-001', 'RP-X00THC', 1, 'RP', 'X', '00', 'TH', 'C', NULL, 'REEMPLAZO PARCIAL', 'historico', true, 'Histórico importado del padrón Districorr. Fuentes: REEMPLAZOS ARTICULARES, IMPLANTES E INSTRUMENTAL QUIRURGICO. Descripciones históricas observadas: REEMPLAZO PARCIAL / REEMPLAZO PARCIAL DE CADERA THOMPSON 001.'),
('RR-X00JFI-001', 'RR-X00JFI', 1, 'RR', 'X', '00', 'JF', 'I', NULL, 'REEMPLAZO TOTAL', 'historico', true, 'Histórico importado del padrón Districorr. Fuentes: REEMPLAZOS ARTICULARES, CAJAS. Descripciones históricas observadas: REEMPLAZO TOTAL / REEMPLAZO TOTAL DE RODILLA JPX FEMORAL 001.'),
('RR-X00JTI-002', 'RR-X00JTI', 2, 'RR', 'X', '00', 'JT', 'I', NULL, 'REEMPLAZO TOTAL', 'historico', true, 'Histórico importado del padrón Districorr. Fuentes: REEMPLAZOS ARTICULARES, CAJAS. Descripciones históricas observadas: REEMPLAZO TOTAL / REEMPLAZO TOTAL DE RODILLA JPX TIBIAL 002.'),
('RR-X00JPI-003', 'RR-X00JPI', 3, 'RR', 'X', '00', 'JP', 'I', NULL, 'REEMPLAZO TOTAL', 'historico', true, 'Histórico importado del padrón Districorr. Fuentes: REEMPLAZOS ARTICULARES, CAJAS. Descripciones históricas observadas: REEMPLAZO TOTAL / REEMPLAZO TOTAL DE RODILLA JPX PATELAR 003.'),
('RR-X00JPM-004', 'RR-X00JPM', 4, 'RR', 'X', '00', 'JP', 'M', 'OLYMPIA', 'REEMPLAZO TOTAL', 'historico', true, 'Histórico importado del padrón Districorr. Fuentes: REEMPLAZOS ARTICULARES, CAJAS. Descripciones históricas observadas: REEMPLAZO TOTAL / REEMPLAZO TOTAL DE RODILLA JPX IMPLANTES 004.'),
('RP-X00CRU-001', 'RP-X00CRU', 1, 'RP', 'X', '00', 'CR', 'U', NULL, 'REEMPLAZO CUPULA', 'historico', true, 'Histórico importado del padrón Districorr. Fuentes: REEMPLAZOS ARTICULARES, MOTORES Y EQUIPOS. Descripciones históricas observadas: REEMPLAZO CUPULA / REEMPLAZOS ARTICULARES.'),
('TR-T00TCU-001', 'TR-T00TCU', 1, 'TR', 'T', '00', 'TC', 'U', NULL, 'TORNILLO', 'historico', true, 'Histórico importado del padrón Districorr. Fuentes: CIRUGÍA MÍNIMAMENTE INVASIVA, CAJAS. Descripciones históricas observadas: TORNILLO / TORNILLERA 4.5/6.5 CANULADO TITANIO 001.'),
('TR-T00TCU-002', 'TR-T00TCU', 2, 'TR', 'T', '00', 'TC', 'U', NULL, 'TORNILLO', 'historico', true, 'Histórico importado del padrón Districorr. Fuentes: CIRUGÍA MÍNIMAMENTE INVASIVA, CAJAS. Descripciones históricas observadas: TORNILLO / TORNILLERA 4.5/6.5 CANULADO TITANIO 002.'),
('TR-T70TCU-001', 'TR-T70TCU', 1, 'TR', 'T', '70', 'TC', 'U', NULL, 'TORNILLO', 'historico', true, 'Histórico importado del padrón Districorr. Fuentes: CIRUGÍA MÍNIMAMENTE INVASIVA, CAJAS. Descripciones históricas observadas: TORNILLO / TORNILLERA 7,0 CANULADO TITANIO 001.'),
('TR-T35TCU-001', 'TR-T35TCU', 1, 'TR', 'T', '35', 'TC', 'U', NULL, 'TORNILLO', 'historico', true, 'Histórico importado del padrón Districorr. Fuentes: CIRUGÍA MÍNIMAMENTE INVASIVA, IMPLANTES E INSTRUMENTAL QUIRURGICO. Descripciones históricas observadas: TORNILLO / CAJA TORNILLO TITANIO 3,5CANULADO 001.'),
('TR-T35TCU-002', 'TR-T35TCU', 2, 'TR', 'T', '35', 'TC', 'U', NULL, 'TORNILLO', 'historico', true, 'Histórico importado del padrón Districorr. Fuentes: CIRUGÍA MÍNIMAMENTE INVASIVA, IMPLANTES E INSTRUMENTAL QUIRURGICO. Descripciones históricas observadas: TORNILLO / CAJA TORNILLO TITANIO 3,5 CANULADO 002.'),
('TR-T35TCU-003', 'TR-T35TCU', 3, 'TR', 'T', '35', 'TC', 'U', 'BIOPROTECE', 'TORNILLO', 'historico', true, 'Histórico importado del padrón Districorr. Fuentes: CIRUGÍA MÍNIMAMENTE INVASIVA, IMPLANTES E INSTRUMENTAL QUIRURGICO. Descripciones históricas observadas: TORNILLO / CAJA TORNILLO TITANIO 3,5 CANULADO 003.'),
('HE-T30CNU-001', 'HE-T30CNU', 1, 'HE', 'T', '30', 'CN', 'U', NULL, 'TORNILLO', 'historico', true, 'Histórico importado del padrón Districorr. Fuentes: CIRUGÍA MÍNIMAMENTE INVASIVA, IMPLANTES E INSTRUMENTAL QUIRURGICO. Descripciones históricas observadas: TORNILLO / SET TORNILLO TITANIO 3.0 CONICO CANULADO 001.'),
('HE-T00HMU-001', 'HE-T00HMU', 1, 'HE', 'T', '00', 'HM', 'U', NULL, 'TORNILLO', 'historico', true, 'Histórico importado del padrón Districorr. Fuentes: CIRUGÍA MÍNIMAMENTE INVASIVA, CAJAS. Descripciones históricas observadas: TORNILLO / TORNILLERA MICROHERBERT 2.0 /2.5 TITANIO 001.'),
('HE-T00HMU-002', 'HE-T00HMU', 2, 'HE', 'T', '00', 'HM', 'U', NULL, 'TORNILLO', 'historico', true, 'Histórico importado del padrón Districorr. Fuentes: CIRUGÍA MÍNIMAMENTE INVASIVA, CAJAS. Descripciones históricas observadas: TORNILLO / TORNILLERA MICROHERBERT 2.0/2.5 TITANIO 002.'),
('OS-T15MCU-002', 'OS-T15MCU', 2, 'OS', 'T', '15', 'MC', 'U', NULL, 'TORNILLO', 'historico', true, 'Histórico importado del padrón Districorr. Fuentes: CIRUGÍA MÍNIMAMENTE INVASIVA, MOTORES Y EQUIPOS. Descripciones históricas observadas: TORNILLO / CIRUGÍA MÍNIMAMENTE INVASIVA.'),
('OS-T25MCU-002', 'OS-T25MCU', 2, 'OS', 'T', '25', 'MC', 'U', NULL, 'TORNILLO', 'historico', true, 'Histórico importado del padrón Districorr. Fuentes: CIRUGÍA MÍNIMAMENTE INVASIVA, MOTORES Y EQUIPOS. Descripciones históricas observadas: TORNILLO / CIRUGÍA MÍNIMAMENTE INVASIVA.'),
('EX-X00OCI-002', 'EX-X00OCI', 2, 'EX', 'X', '00', 'OC', 'I', NULL, 'SET DE EXTRACCION DE CLAVOS 3.5/4.5', 'historico', true, 'Histórico importado del padrón Districorr. Fuentes: EXTRACCIÓN Y REVISIÓN, MOTORES Y EQUIPOS. Descripciones históricas observadas: SET DE EXTRACCION DE CLAVOS 3.5/4.5 / EXTRACCIÓN Y REVISIÓN.'),
('EX-X00OCI-001', 'EX-X00OCI', 1, 'EX', 'X', '00', 'OC', 'I', NULL, 'SET EXTRACCIÓN DE CLAVO', 'historico', true, 'Histórico importado del padrón Districorr. Fuentes: EXTRACCIÓN Y REVISIÓN, CAJAS. Descripciones históricas observadas: SET EXTRACCIÓN DE CLAVO / SET EXTRACCION DE CLAVO 001.'),
('EX-X00MRI-001', 'EX-X00MRI', 1, 'EX', 'X', '00', 'MR', 'I', NULL, 'EXTRACCIÓN MORELAN', 'historico', true, 'Histórico importado del padrón Districorr. Fuentes: EXTRACCIÓN Y REVISIÓN, MOTORES Y EQUIPOS. Descripciones históricas observadas: EXTRACCIÓN MORELAN / EXTRACCIÓN Y REVISIÓN.'),
('ST-X00DSI-001', 'ST-X00DSI', 1, 'ST', 'X', '00', 'DS', 'I', NULL, 'SET DE DESCEMENTACIÓN', 'historico', true, 'Histórico importado del padrón Districorr. Fuentes: EXTRACCIÓN Y REVISIÓN, SETS DE IMPLANTES. Descripciones históricas observadas: SET DE DESCEMENTACIÓN / CAJA SET DESCEMENTACION 001.'),
('RC-X00ECC-001', 'RC-X00ECC', 1, 'RC', 'X', '00', 'EC', 'C', 'SUBITON', 'ESPACIADOR CON GENTAMICINA', 'historico', true, 'Histórico importado del padrón Districorr. Fuentes: EXTRACCIÓN Y REVISIÓN, IMPLANTES E INSTRUMENTAL QUIRURGICO. Descripciones históricas observadas: ESPACIADOR CON GENTAMICINA / CONTENEDOR ESPACIADORES DE CADERA CON GENTAMICINA 001.'),
('AR-X00MCI-001', 'AR-X00MCI', 1, 'AR', 'X', '00', 'MC', 'I', 'MICROMED', 'ARTROSCOPIA', 'historico', true, 'Histórico importado del padrón Districorr. Fuentes: MEDICINA DEL DEPORTE, CAJAS. Descripciones históricas observadas: ARTROSCOPIA / CAJA ARTROSCOPIA MICROMED 001.'),
('AR-X00BTI-001', 'AR-X00BTI', 1, 'AR', 'X', '00', 'BT', 'I', NULL, 'ARTROSCOPIA', 'historico', true, 'Histórico importado del padrón Districorr. Fuentes: MEDICINA DEL DEPORTE, CAJAS. Descripciones históricas observadas: ARTROSCOPIA / CAJA ARTROSCOPIA-BOTON-001.'),
('AR-X00API-001', 'AR-X00API', 1, 'AR', 'X', '00', 'AP', 'I', NULL, 'ARTROSCOPIA', 'historico', true, 'Histórico importado del padrón Districorr. Fuentes: MEDICINA DEL DEPORTE, CAJAS. Descripciones históricas observadas: ARTROSCOPIA / CAJA ARTROSCOPIA ARPON 3.5 / 5.0 001.'),
('AR-X00SMI-001', 'AR-X00SMI', 1, 'AR', 'X', '00', 'SM', 'I', NULL, 'ARTROSCOPIA', 'historico', true, 'Histórico importado del padrón Districorr. Fuentes: MEDICINA DEL DEPORTE, CAJAS. Descripciones históricas observadas: ARTROSCOPIA / CAJA ARTROSCOPIA SUTURA MENS 001.'),
('AR-X00HMP-001', 'AR-X00HMP', 1, 'AR', 'X', '00', 'HM', 'P', NULL, 'ARTROSCOPIA', 'historico', true, 'Histórico importado del padrón Districorr. Fuentes: MEDICINA DEL DEPORTE, MOTORES Y EQUIPOS. Descripciones históricas observadas: ARTROSCOPIA / MEDICINA DEL DEPORTE.'),
('LG-T00PKI-001', 'LG-T00PKI', 1, 'LG', 'T', '00', 'PK', 'I', NULL, 'LCA-LCP', 'historico', true, 'Histórico importado del padrón Districorr. Fuentes: MEDICINA DEL DEPORTE, MOTORES Y EQUIPOS. Descripciones históricas observadas: LCA-LCP / MEDICINA DEL DEPORTE.'),
('LG-T00PKI-002', 'LG-T00PKI', 2, 'LG', 'T', '00', 'PK', 'I', NULL, 'LCA-LCP', 'historico', true, 'Histórico importado del padrón Districorr. Fuentes: MEDICINA DEL DEPORTE, MOTORES Y EQUIPOS. Descripciones históricas observadas: LCA-LCP / MEDICINA DEL DEPORTE.'),
('LG-T00PKI-003', 'LG-T00PKI', 3, 'LG', 'T', '00', 'PK', 'I', NULL, 'LCA-LCP', 'historico', true, 'Histórico importado del padrón Districorr. Fuentes: MEDICINA DEL DEPORTE, MOTORES Y EQUIPOS. Descripciones históricas observadas: LCA-LCP / MEDICINA DEL DEPORTE.'),
('MT-CANDWB-001', 'MT-CANDWB', 1, 'MT', 'C', 'AN', 'DW', 'B', 'DEWALT', 'MOTOR CANULADO A BATERIA', 'historico', true, 'Histórico importado del padrón Districorr. Fuentes: MOTORES Y EQUIPOS. Descripciones históricas observadas: MOTOR CANULADO A BATERIA / MOTORES Y EQUIPOS.'),
('MT-CANDWB-002', 'MT-CANDWB', 2, 'MT', 'C', 'AN', 'DW', 'B', 'DEWALT', 'MOTOR CANULADO A BATERIA', 'historico', true, 'Histórico importado del padrón Districorr. Fuentes: MOTORES Y EQUIPOS. Descripciones históricas observadas: MOTOR CANULADO A BATERIA / MOTORES Y EQUIPOS.'),
('MT-CANDWB-003', 'MT-CANDWB', 3, 'MT', 'C', 'AN', 'DW', 'B', 'DEWALT', 'MOTOR CANULADO A BATERIA', 'historico', true, 'Histórico importado del padrón Districorr. Fuentes: MOTORES Y EQUIPOS. Descripciones históricas observadas: MOTOR CANULADO A BATERIA / MOTORES Y EQUIPOS.'),
('MT-CANDWB-005', 'MT-CANDWB', 5, 'MT', 'C', 'AN', 'DW', 'B', 'DEWALT', 'MOTOR CANULADO A BATERIA', 'historico', true, 'Histórico importado del padrón Districorr. Fuentes: MOTORES Y EQUIPOS. Descripciones históricas observadas: MOTOR CANULADO A BATERIA / MOTORES Y EQUIPOS.'),
('MT-CANDWB-006', 'MT-CANDWB', 6, 'MT', 'C', 'AN', 'DW', 'B', 'DEWALT', 'MOTOR CANULADO A BATERIA', 'historico', true, 'Histórico importado del padrón Districorr. Fuentes: MOTORES Y EQUIPOS. Descripciones históricas observadas: MOTOR CANULADO A BATERIA / MOTORES Y EQUIPOS.'),
('MT-CANDWB-007', 'MT-CANDWB', 7, 'MT', 'C', 'AN', 'DW', 'B', 'DEWALT', 'MOTOR CANULADO A BATERIA', 'historico', true, 'Histórico importado del padrón Districorr. Fuentes: MOTORES Y EQUIPOS. Descripciones históricas observadas: MOTOR CANULADO A BATERIA / MOTORES Y EQUIPOS.'),
('MT-CANDWB-008', 'MT-CANDWB', 8, 'MT', 'C', 'AN', 'DW', 'B', 'DEWALT', 'MOTOR CANULADO A BATERIA', 'historico', true, 'Histórico importado del padrón Districorr. Fuentes: MOTORES Y EQUIPOS. Descripciones históricas observadas: MOTOR CANULADO A BATERIA / MOTORES Y EQUIPOS.'),
('MT-CANDWB-009', 'MT-CANDWB', 9, 'MT', 'C', 'AN', 'DW', 'B', 'DEWALT', 'MOTOR CANULADO A BATERIA', 'historico', true, 'Histórico importado del padrón Districorr. Fuentes: MOTORES Y EQUIPOS. Descripciones históricas observadas: MOTOR CANULADO A BATERIA / MOTORES Y EQUIPOS.'),
('MT-CANDWB-010', 'MT-CANDWB', 10, 'MT', 'C', 'AN', 'DW', 'B', 'DEWALT', 'MOTOR CANULADO A BATERIA', 'historico', true, 'Histórico importado del padrón Districorr. Fuentes: MOTORES Y EQUIPOS. Descripciones históricas observadas: MOTOR CANULADO A BATERIA / MOTORES Y EQUIPOS.'),
('MT-CANMWB-001', 'MT-CANMWB', 1, 'MT', 'C', 'AN', 'MW', 'B', 'MILWAUKEE', 'MOTOR CANULADO A BATERIA', 'historico', true, 'Histórico importado del padrón Districorr. Fuentes: MOTORES Y EQUIPOS. Descripciones históricas observadas: MOTOR CANULADO A BATERIA / MOTORES Y EQUIPOS.'),
('MT-CANMWB-002', 'MT-CANMWB', 2, 'MT', 'C', 'AN', 'MW', 'B', 'MILWAUKEE', 'MOTOR CANULADO A BATERIA', 'historico', true, 'Histórico importado del padrón Districorr. Fuentes: MOTORES Y EQUIPOS. Descripciones históricas observadas: MOTOR CANULADO A BATERIA / MOTORES Y EQUIPOS.'),
('MT-CANMWB-003', 'MT-CANMWB', 3, 'MT', 'C', 'AN', 'MW', 'B', 'MILWAUKEE', 'MOTOR CANULADO A BATERIA', 'historico', true, 'Histórico importado del padrón Districorr. Fuentes: MOTORES Y EQUIPOS. Descripciones históricas observadas: MOTOR CANULADO A BATERIA / MOTORES Y EQUIPOS.'),
('MT-CANMWB-004', 'MT-CANMWB', 4, 'MT', 'C', 'AN', 'MW', 'B', 'MILWAUKEE', 'MOTOR CANULADO A BATERIA', 'historico', true, 'Histórico importado del padrón Districorr. Fuentes: MOTORES Y EQUIPOS. Descripciones históricas observadas: MOTOR CANULADO A BATERIA / MOTORES Y EQUIPOS.'),
('MT-TALMKE-001', 'MT-TALMKE', 1, 'MT', 'T', 'AL', 'MK', 'E', 'MAKITA', 'TALADRO ELECTRICO', 'historico', true, 'Histórico importado del padrón Districorr. Fuentes: MOTORES Y EQUIPOS. Descripciones históricas observadas: TALADRO ELECTRICO / MOTORES Y EQUIPOS.'),
('MT-TALMKE-002', 'MT-TALMKE', 2, 'MT', 'T', 'AL', 'MK', 'E', 'MAKITA', 'TALADRO ELECTRICO', 'historico', true, 'Histórico importado del padrón Districorr. Fuentes: MOTORES Y EQUIPOS. Descripciones históricas observadas: TALADRO ELECTRICO / MOTORES Y EQUIPOS.'),
('MT-TALMKE-003', 'MT-TALMKE', 3, 'MT', 'T', 'AL', 'MK', 'E', 'MAKITA', 'TALADRO ELECTRICO', 'historico', true, 'Histórico importado del padrón Districorr. Fuentes: MOTORES Y EQUIPOS. Descripciones históricas observadas: TALADRO ELECTRICO / MOTORES Y EQUIPOS.'),
('MT-CANMKB-001', 'MT-CANMKB', 1, 'MT', 'C', 'AN', 'MK', 'B', 'MAKITA', 'MOTOR CANULADO A BATERIA', 'historico', true, 'Histórico importado del padrón Districorr. Fuentes: MOTORES Y EQUIPOS. Descripciones históricas observadas: MOTOR CANULADO A BATERIA / MOTORES Y EQUIPOS.'),
('MT-CANMKB-002', 'MT-CANMKB', 2, 'MT', 'C', 'AN', 'MK', 'B', 'MAKITA', 'MOTOR CANULADO A BATERIA', 'historico', true, 'Histórico importado del padrón Districorr. Fuentes: MOTORES Y EQUIPOS. Descripciones históricas observadas: MOTOR CANULADO A BATERIA / MOTORES Y EQUIPOS.'),
('MT-CANMKB-003', 'MT-CANMKB', 3, 'MT', 'C', 'AN', 'MK', 'B', 'MAKITA', 'MOTOR CANULADO A BATERIA', 'historico', true, 'Histórico importado del padrón Districorr. Fuentes: MOTORES Y EQUIPOS. Descripciones históricas observadas: MOTOR CANULADO A BATERIA / MOTORES Y EQUIPOS.'),
('MT-SIMBSB-001', 'MT-SIMBSB', 1, 'MT', 'S', 'IM', 'BS', 'B', 'BOSCH P/CIRUGIAS PEQUEÑO FRAGMENTO', 'MOTOR CANULADO A BATERIA', 'historico', true, 'Histórico importado del padrón Districorr. Fuentes: MOTORES Y EQUIPOS. Descripciones históricas observadas: MOTOR CANULADO A BATERIA / MOTORES Y EQUIPOS.'),
('MT-SIMTLB-008', 'MT-SIMTLB', 8, 'MT', 'S', 'IM', 'TL', 'B', 'TOTAL', 'MOTOR CANULADO A BATERIA', 'historico', true, 'Histórico importado del padrón Districorr. Fuentes: MOTORES Y EQUIPOS. Descripciones históricas observadas: MOTOR CANULADO A BATERIA / MOTORES Y EQUIPOS.'),
('MT-SIMTLB-014', 'MT-SIMTLB', 14, 'MT', 'S', 'IM', 'TL', 'B', 'TOTAL', 'MOTOR CANULADO A BATERIA', 'historico', true, 'Histórico importado del padrón Districorr. Fuentes: MOTORES Y EQUIPOS. Descripciones históricas observadas: MOTOR CANULADO A BATERIA / MOTORES Y EQUIPOS.'),
('MT-SIMTLB-015', 'MT-SIMTLB', 15, 'MT', 'S', 'IM', 'TL', 'B', 'TOTAL', 'MOTOR CANULADO A BATERIA', 'historico', true, 'Histórico importado del padrón Districorr. Fuentes: MOTORES Y EQUIPOS. Descripciones históricas observadas: MOTOR CANULADO A BATERIA / MOTORES Y EQUIPOS.'),
('MT-SIMTLB-016', 'MT-SIMTLB', 16, 'MT', 'S', 'IM', 'TL', 'B', 'TOTAL', 'MOTOR CANULADO A BATERIA', 'historico', true, 'Histórico importado del padrón Districorr. Fuentes: MOTORES Y EQUIPOS. Descripciones históricas observadas: MOTOR CANULADO A BATERIA / MOTORES Y EQUIPOS.'),
('MT-CANEHB-001', 'MT-CANEHB', 1, 'MT', 'C', 'AN', 'EH', 'B', 'EINHELL', 'MOTOR CANULADO A BATERIA', 'historico', true, 'Histórico importado del padrón Districorr. Fuentes: MOTORES Y EQUIPOS. Descripciones históricas observadas: MOTOR CANULADO A BATERIA / MOTORES Y EQUIPOS.'),
('MT-CANEHB-002', 'MT-CANEHB', 2, 'MT', 'C', 'AN', 'EH', 'B', 'EINHELL', 'MOTOR CANULADO A BATERIA', 'historico', true, 'Histórico importado del padrón Districorr. Fuentes: MOTORES Y EQUIPOS. Descripciones históricas observadas: MOTOR CANULADO A BATERIA / MOTORES Y EQUIPOS.'),
('MT-CANEHB-003', 'MT-CANEHB', 3, 'MT', 'C', 'AN', 'EH', 'B', 'EINHELL', 'MOTOR CANULADO A BATERIA', 'historico', true, 'Histórico importado del padrón Districorr. Fuentes: MOTORES Y EQUIPOS. Descripciones históricas observadas: MOTOR CANULADO A BATERIA / MOTORES Y EQUIPOS.'),
('TL-MANDRE-001', 'TL-MANDRE', 1, 'TL', 'M', 'AN', 'DR', 'E', 'DREMEL', 'TALADRO DE MANO DREMEL 001', 'historico', true, 'Histórico importado del padrón Districorr. Fuentes: MOTORES Y EQUIPOS. Descripciones históricas observadas: TALADRO DE MANO DREMEL 001 / MOTORES Y EQUIPOS.'),
('MS-UNIOFB-001', 'MS-UNIOFB', 1, 'MS', 'U', 'NI', 'OF', 'B', 'OVERFIX', 'MOTOR CANULADO/ MICRO SIERRA A BATERIA', 'historico', true, 'Histórico importado del padrón Districorr. Fuentes: MOTORES Y EQUIPOS, MOTORES Y EQUIPOS MÉDICOS. Descripciones históricas observadas: MOTOR CANULADO/ MICRO SIERRA A BATERIA / MOTOR CANULADO - OVERFIX - MICRO SIERRA A BATERIA 001.'),
('MS-UNIOFB-002', 'MS-UNIOFB', 2, 'MS', 'U', 'NI', 'OF', 'B', 'OVERFIX', 'MOTOR CANULADO/ MICRO SIERRA A BATERIA', 'historico', true, 'Histórico importado del padrón Districorr. Fuentes: MOTORES Y EQUIPOS, MOTORES Y EQUIPOS MÉDICOS. Descripciones históricas observadas: MOTOR CANULADO/ MICRO SIERRA A BATERIA / MOTOR CANULADO - OVERFIX - MICRO SIERRA A BATERIA 002.'),
('MS-UNIOFB-003', 'MS-UNIOFB', 3, 'MS', 'U', 'NI', 'OF', 'B', 'OVERFIX', 'MOTOR CANULADO/ MICRO SIERRA A BATERIA', 'historico', true, 'Histórico importado del padrón Districorr. Fuentes: MOTORES Y EQUIPOS, MOTORES Y EQUIPOS MÉDICOS. Descripciones históricas observadas: MOTOR CANULADO/ MICRO SIERRA A BATERIA / MOTOR CANULADO -OVERFIX - MICRO SIERRA A BATERIA 003.'),
('MC-MOTBTM-001', 'MC-MOTBTM', 1, 'MC', 'M', 'OT', 'BT', 'M', 'BTR', 'MICRO MOTOR BTR 2000 + MICRO SIERRA', 'historico', true, 'Histórico importado del padrón Districorr. Fuentes: MOTORES Y EQUIPOS, MOTORES Y EQUIPOS MÉDICOS. Descripciones históricas observadas: MICRO MOTOR BTR 2000 + MICRO SIERRA / MICRO MOTOR BTR 2000 + MICROSIERRA.'),
('MC-MOTBTM-002', 'MC-MOTBTM', 2, 'MC', 'M', 'OT', 'BT', 'M', 'BTR', 'MICRO SIERRA BTR 20000', 'historico', true, 'Histórico importado del padrón Districorr. Fuentes: MOTORES Y EQUIPOS. Descripciones históricas observadas: MICRO SIERRA BTR 20000 / MOTORES Y EQUIPOS.'),
('EQ-SHABTM-001', 'EQ-SHABTM', 1, 'EQ', 'S', 'HA', 'BT', 'M', 'BTR', 'EQUIPO SHAVER BTR 001', 'historico', true, 'Histórico importado del padrón Districorr. Fuentes: MOTORES Y EQUIPOS, MOTORES Y EQUIPOS MÉDICOS. Descripciones históricas observadas: EQUIPO SHAVER BTR 001 / 2.'),
('SR-UNIBTM-001', 'SR-UNIBTM', 1, 'SR', 'U', 'NI', 'BT', 'M', 'BTR', 'SIERRA BTR 2000 1', 'historico', true, 'Histórico importado del padrón Districorr. Fuentes: MOTORES Y EQUIPOS, MOTORES Y EQUIPOS MÉDICOS. Descripciones históricas observadas: SIERRA BTR 2000 1 / SIERRA BTR 2000 N°1.'),
('SR-UNIBTM-002', 'SR-UNIBTM', 2, 'SR', 'U', 'NI', 'BT', 'M', 'BTR', 'SIERRA BTR 2000 2', 'historico', true, 'Histórico importado del padrón Districorr. Fuentes: MOTORES Y EQUIPOS, MOTORES Y EQUIPOS MÉDICOS. Descripciones históricas observadas: SIERRA BTR 2000 2 / SIERRA BTR 2000 N°2.'),
('EQ-SHABTM-002', 'EQ-SHABTM', 2, 'EQ', 'S', 'HA', 'BT', 'M', 'BTR', 'EQUIPO SHAVER BTR 002', 'historico', true, 'Histórico importado del padrón Districorr. Fuentes: MOTORES Y EQUIPOS, MOTORES Y EQUIPOS MÉDICOS.'),
('EQ-RDFCMM-001', 'EQ-RDFCMM', 1, 'EQ', 'R', 'DF', 'CM', 'M', 'CONMED', 'EQUIPO RADIO FRECUENCIA CONMED', 'historico', true, 'Histórico importado del padrón Districorr. Fuentes: MOTORES Y EQUIPOS, MOTORES Y EQUIPOS MÉDICOS.'),
('EQ-BIRCMM-001', 'EQ-BIRCMM', 1, 'EQ', 'B', 'IR', 'CM', 'M', 'CONMED', 'EQUIPO SISTEMA DE GESTION DE IRRIGACION-CONMED (BOMBA)', 'historico', true, 'Histórico importado del padrón Districorr. Fuentes: MOTORES Y EQUIPOS, MOTORES Y EQUIPOS MÉDICOS.'),
('SR-RECSWB-001', 'SR-RECSWB', 1, 'SR', 'R', 'EC', 'SW', 'B', 'SWIPRO', 'SIERRA RECIPROCANTE SWIPRO 001', 'historico', true, 'Histórico importado del padrón Districorr. Fuentes: MOTORES Y EQUIPOS, MOTORES Y EQUIPOS MÉDICOS.'),
('OS-T35DTU-006', 'OS-T35DTU', 6, 'OS', 'T', '35', 'DT', 'U', NULL, 'OSTEOSINTESIS 3,5 TITANIO DCP/TERCIOTUBO 006', 'historico', true, 'Histórico importado del padrón Districorr. Fuentes: CAJAS.'),
('OS-T35TPU-005', 'OS-T35TPU', 5, 'OS', 'T', '35', 'TP', 'U', NULL, 'OSTEOSINTESIS 3.5 TITANIO TIBIA PROXIMAL 001', 'historico', true, 'Histórico importado del padrón Districorr. Fuentes: CAJAS.'),
('RC-X00DMI-001', 'RC-X00DMI', 1, 'RC', 'X', '00', 'DM', 'I', NULL, 'CAJA REEMPLAZO TOTAL CADERA DOBLE MOVILIDAD CEMENTADA INSTRU', 'historico', true, 'Histórico importado del padrón Districorr. Fuentes: CAJAS.'),
('RC-X00TAI-001', 'RC-X00TAI', 1, 'RC', 'X', '00', 'TA', 'I', NULL, 'CAJA REEMPLAZO TOTAL CADERA TALLO TRICONICO 001', 'historico', true, 'Histórico importado del padrón Districorr. Fuentes: CAJAS.'),
('RC-X00CMI-001', 'RC-X00CMI', 1, 'RC', 'X', '00', 'CM', 'I', 'OLYMPIA', 'REEMPLAZO TOTAL DE CADERA CEMENTADA INSTRUMENTAL 001', 'historico', true, 'Histórico importado del padrón Districorr. Fuentes: CAJAS.'),
('RP-X00CRP-001', 'RP-X00CRP', 1, 'RP', 'X', '00', 'CR', 'P', NULL, 'REEMPLAZO DE CUPULA RADIAL 001', 'historico', true, 'Histórico importado del padrón Districorr. Fuentes: CAJAS.'),
('TU-A00AOI-001', 'TU-A00AOI', 1, 'TU', 'A', '00', 'AO', 'I', NULL, 'CAJA TUTOR AO ACERO 001', 'historico', true, 'Histórico importado del padrón Districorr. Fuentes: CAJAS.'),
('CL-T00GMC-001', 'CL-T00GMC', 1, 'CL', 'T', '00', 'GM', 'C', 'BIOPROTECE', 'CONTENEDOR CLAVO TITANIO GAMMA 001', 'historico', true, 'Histórico importado del padrón Districorr. Fuentes: CAJAS.'),
('AR-X00MNI-001', 'AR-X00MNI', 1, 'AR', 'X', '00', 'MN', 'I', NULL, 'CAJA ARTROSCOPIA MENISCOS INSTRUMENTAL 001', 'historico', true, 'Histórico importado del padrón Districorr. Fuentes: CAJAS.'),
('CL-T00GMI-002', 'CL-T00GMI', 2, 'CL', 'T', '00', 'GM', 'I', NULL, 'INSTRUMENTAL CLAVO TITANIO GAMMA 002', 'historico', true, 'Histórico importado del padrón Districorr. Fuentes: CAJAS.'),
('CL-T00GMC-002', 'CL-T00GMC', 2, 'CL', 'T', '00', 'GM', 'C', NULL, 'CONTENEDOR CLAVO TITANIO GAMMA 002', 'historico', true, 'Histórico importado del padrón Districorr. Fuentes: CAJAS.'),
('CL-T00GMI-001', 'CL-T00GMI', 1, 'CL', 'T', '00', 'GM', 'I', NULL, 'INSTRUMENTAL CLAVO TITANIO GAMMA 001', 'historico', true, 'Histórico importado del padrón Districorr. Fuentes: CAJAS.'),
('RP-X00CRI-001', 'RP-X00CRI', 1, 'RP', 'X', '00', 'CR', 'I', NULL, 'REEMPLAZO DE CUPULA RADIAL 001', 'historico', true, 'Histórico importado del padrón Districorr. Fuentes: CAJAS.'),
('RR-X00JPM-005', 'RR-X00JPM', 5, 'RR', 'X', '00', 'JP', 'M', 'OLYMPIA', 'REEMPLAZO TOTAL DE RODILLA JPX IMPLANTES 005', 'historico', true, 'Histórico importado del padrón Districorr. Fuentes: CAJAS.'),
('RR-X00JFI-005', 'RR-X00JFI', 5, 'RR', 'X', '00', 'JF', 'I', 'OLYMPIA', 'REEMPLAZO TOTAL DE RODILLA JPX FEMORAL 005', 'historico', true, 'Histórico importado del padrón Districorr. Fuentes: CAJAS.'),
('RR-X00JTI-005', 'RR-X00JTI', 5, 'RR', 'X', '00', 'JT', 'I', 'OLYMPIA', 'REEMPLAZO TOTAL DE RODILLA JPX TIBIAL 005', 'historico', true, 'Histórico importado del padrón Districorr. Fuentes: CAJAS.'),
('RR-X00JPI-005', 'RR-X00JPI', 5, 'RR', 'X', '00', 'JP', 'I', 'OLYMPIA', 'REEMPLAZO TOTAL DE RODILLA JPX PATELAR 005', 'historico', true, 'Histórico importado del padrón Districorr. Fuentes: CAJAS.'),
('OS-T35CLU0001', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'OSTEOSINTESIS 3,5 TITANIO CLAVICULA - 012', 'historico', true, 'Histórico importado del padrón Districorr. Fuentes: CAJAS. Código en formato legacy / externo.'),
('OS-T35CLU0002', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'OSTEOSINTESIS 3,5 TITANIO CLAVICULA - 012', 'historico', true, 'Histórico importado del padrón Districorr. Fuentes: CAJAS. Código en formato legacy / externo.'),
('OS-T35CLU0003', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'OSTEOSINTESIS 3,5 TITANIO CLAVICULA - 012', 'historico', true, 'Histórico importado del padrón Districorr. Fuentes: CAJAS. Código en formato legacy / externo.'),
('ST-T35TDP-005', 'ST-T35TDP', 5, 'ST', 'T', '35', 'TD', 'P', NULL, 'SET TIBIA DISTAL ANTERIOR 3,5 005', 'historico', true, 'Histórico importado del padrón Districorr. Fuentes: SETS DE IMPLANTES.'),
('ST-T35DCP-002', 'ST-T35DCP', 2, 'ST', 'T', '35', 'DC', 'P', NULL, 'SET PLACA DCP BLOQ 3.5 TIT 002', 'historico', true, 'Histórico importado del padrón Districorr. Fuentes: SETS DE IMPLANTES.'),
('ST-T45TLP-001', 'ST-T45TLP', 1, 'ST', 'T', '45', 'TL', 'P', NULL, 'SET PLACA TITANIO 4.5 T Y L IMPLANTE 001', 'historico', true, 'Histórico importado del padrón Districorr. Fuentes: SETS DE IMPLANTES.'),
('ST-T35TPP-001', 'ST-T35TPP', 1, 'ST', 'T', '35', 'TP', 'P', NULL, 'SET PLACA TIBIA PROXIMAL 3.5 TITANIO 001', 'historico', true, 'Histórico importado del padrón Districorr. Fuentes: SETS DE IMPLANTES.'),
('ST-T35TTP-006', 'ST-T35TTP', 6, 'ST', 'T', '35', 'TT', 'P', NULL, 'SET PLACA 1/3 TUBO 3.5 TITANIO 006', 'historico', true, 'Histórico importado del padrón Districorr. Fuentes: SETS DE IMPLANTES.'),
('ST-T35DCP-006', 'ST-T35DCP', 6, 'ST', 'T', '35', 'DC', 'P', NULL, 'SET PLACA DCP 3.5 TITANIO 006', 'historico', true, 'Histórico importado del padrón Districorr. Fuentes: SETS DE IMPLANTES.'),
('ST-T00TRP-000', 'ST-T00TRP', 0, 'ST', 'T', '00', 'TR', 'P', NULL, 'SET TORNILLERA EXTRA TITANIO', 'historico', true, 'Histórico importado del padrón Districorr. Fuentes: SETS DE IMPLANTES.'),
('ST-T35TTP-008', 'ST-T35TTP', 8, 'ST', 'T', '35', 'TT', 'P', 'BIOPROTECE', 'SET PLACA 1/3 TUBO TITANIO 3.5 008', 'historico', true, 'Histórico importado del padrón Districorr. Fuentes: SETS DE IMPLANTES.'),
('ST-T35HRP-010', 'ST-T35HRP', 10, 'ST', 'T', '35', 'HR', 'P', 'MATRITEC', 'SET PLACA HUMERO DISTAL TITANIO 010', 'historico', true, 'Histórico importado del padrón Districorr. Fuentes: SETS DE IMPLANTES.'),
('ST-T35TTP-013', 'ST-T35TTP', 13, 'ST', 'T', '35', 'TT', 'P', NULL, 'SET PLACA 1/3 TUBO 3,5 TITANIO 013', 'historico', true, 'Histórico importado del padrón Districorr. Fuentes: SETS DE IMPLANTES.'),
('ST-T35DTP-013', 'ST-T35DTP', 13, 'ST', 'T', '35', 'DT', 'P', NULL, 'SET PLACAS DCP 3,5 TITANIO 013', 'historico', true, 'Histórico importado del padrón Districorr. Fuentes: SETS DE IMPLANTES.'),
('ST-T35DCP-007', 'ST-T35DCP', 7, 'ST', 'T', '35', 'DC', 'P', NULL, 'SET PLACAS DCP 3,5 TITANIO 007', 'historico', true, 'Histórico importado del padrón Districorr. Fuentes: SETS DE IMPLANTES.'),
('ST-T35TTP-007', 'ST-T35TTP', 7, 'ST', 'T', '35', 'TT', 'P', NULL, 'SET PLACAS 1/3 TUBO 3,5 TITANIO 007', 'historico', true, 'Histórico importado del padrón Districorr. Fuentes: SETS DE IMPLANTES.'),
('ST-X00ECI-001', 'ST-X00ECI', 1, 'ST', 'X', '00', 'EC', 'I', NULL, 'SET ESCAPACIADOR DE CADERA 001', 'historico', true, 'Histórico importado del padrón Districorr. Fuentes: SETS DE IMPLANTES.'),
('ST-T35PHP-011', 'ST-T35PHP', 11, 'ST', 'T', '35', 'PH', 'P', NULL, 'SET PLACAS PHILO TITANIO 011', 'historico', true, 'Histórico importado del padrón Districorr. Fuentes: SETS DE IMPLANTES.'),
('ST-A45TLP-001', 'ST-A45TLP', 1, 'ST', 'A', '45', 'TL', 'P', NULL, 'SET PLACA ACERO 4.5 T Y L IMPLANTES 001', 'historico', true, 'Histórico importado del padrón Districorr. Fuentes: SETS DE IMPLANTES.'),
('ST-T45JKP-001', 'ST-T45JKP', 1, 'ST', 'T', '45', 'JK', 'P', NULL, 'SET PLACA TITANIO 4.5 JOCKEY IMPLANTES 001', 'historico', true, 'Histórico importado del padrón Districorr. Fuentes: SETS DE IMPLANTES.'),
('ST-T45SCP-001', 'ST-T45SCP', 1, 'ST', 'T', '45', 'SC', 'P', 'BIOPROTECE', 'SET PLACA TITANIO 4.5 SUPRA CONDILIA IMPLANTES 001', 'historico', true, 'Histórico importado del padrón Districorr. Fuentes: SETS DE IMPLANTES.'),
('ST-T45TLP-002', 'ST-T45TLP', 2, 'ST', 'T', '45', 'TL', 'P', NULL, 'SET PLACA TITANIO 4.5 T Y L IMPLANTES 002', 'historico', true, 'Histórico importado del padrón Districorr. Fuentes: SETS DE IMPLANTES.'),
('ST-A35TOP-001', 'ST-A35TOP', 1, 'ST', 'A', '35', 'TO', 'P', NULL, 'SET PLACA ACERO 3.5 TREBOLAR IMPLANTES 001', 'historico', true, 'Histórico importado del padrón Districorr. Fuentes: SETS DE IMPLANTES.'),
('ST-T45DAP-001', 'ST-T45DAP', 1, 'ST', 'T', '45', 'DA', 'P', NULL, 'SET PLACA TITANIO 4.5 DCP ANCHA Y ANGOSTA IMPLANTE 001', 'historico', true, 'Histórico importado del padrón Districorr. Fuentes: SETS DE IMPLANTES.'),
('ST-A35PHP-001', 'ST-A35PHP', 1, 'ST', 'A', '35', 'PH', 'P', NULL, 'SET PLACA ACERO 3.5 PHILO IMPLANTES 001', 'historico', true, 'Histórico importado del padrón Districorr. Fuentes: SETS DE IMPLANTES.'),
('ST-T35PRP-001', 'ST-T35PRP', 1, 'ST', 'T', '35', 'PR', 'P', NULL, 'SET PLACA TITANIO 3.5 PERONE IMPLANTES 001', 'historico', true, 'Histórico importado del padrón Districorr. Fuentes: SETS DE IMPLANTES.'),
('ST-T35TDP-002', 'ST-T35TDP', 2, 'ST', 'T', '35', 'TD', 'P', 'BIOPROTECE', 'SET PLACA TITANIO 3.5 TIBIA DISTAL IMPLANTES 002', 'historico', true, 'Histórico importado del padrón Districorr. Fuentes: SETS DE IMPLANTES.'),
('ST-A35CCP-001', 'ST-A35CCP', 1, 'ST', 'A', '35', 'CC', 'P', 'MATRITEC', 'SET PLACAS ACERO 3.5 CALCANEO IMPLANTES 001', 'historico', true, 'Histórico importado del padrón Districorr. Fuentes: SETS DE IMPLANTES.'),
('ST-T45SCP-002', 'ST-T45SCP', 2, 'ST', 'T', '45', 'SC', 'P', 'BIOPROTECE', 'SET PLACA TITANIO 4.5 SUPRA CONDILIA IMPLANTES 002', 'historico', true, 'Histórico importado del padrón Districorr. Fuentes: SETS DE IMPLANTES.'),
('ST-A45TLP-002', 'ST-A45TLP', 2, 'ST', 'A', '45', 'TL', 'P', NULL, 'SET PLACA ACERO 4.5 T Y L IMPLANTES 002', 'historico', true, 'Histórico importado del padrón Districorr. Fuentes: SETS DE IMPLANTES.'),
('ST-T35HRP-001', 'ST-T35HRP', 1, 'ST', 'T', '35', 'HR', 'P', 'BIOPROTECE', 'SET PLACA P/ HUMERO DISTAL POST. LATERAL TITANIO 001', 'historico', true, 'Histórico importado del padrón Districorr. Fuentes: SETS DE IMPLANTES.'),
('RP-X00THI-001', 'RP-X00THI', 1, 'RP', 'X', '00', 'TH', 'I', NULL, 'REEMPLAZO PARCIAL DE CADERA THOMPSON INSTRUMENTAL 001', 'historico', true, 'Histórico importado del padrón Districorr. Fuentes: IMPLANTES E INSTRUMENTAL QUIRURGICO.'),
('RC-X00BPC-001', 'RC-X00BPC', 1, 'RC', 'X', '00', 'BP', 'C', 'BIOPROTECE', 'REEMPLAZO TOTAL DE CADERA CEMENTADA BIPOLAR CONT. 001', 'historico', true, 'Histórico importado del padrón Districorr. Fuentes: IMPLANTES E INSTRUMENTAL QUIRURGICO.'),
('RC-X00CMI-002', 'RC-X00CMI', 2, 'RC', 'X', '00', 'CM', 'I', 'OLYMPIA', 'REEMPLAZO TOTAL DE CADERA CEMENTADA INSTRUMENTAL 002', 'historico', true, 'Histórico importado del padrón Districorr. Fuentes: IMPLANTES E INSTRUMENTAL QUIRURGICO.'),
('CL-T00TXU-001', 'CL-T00TXU', 1, 'CL', 'T', '00', 'TX', 'U', NULL, 'CLAVO TITANIO TIBIA EXPERT UNIFICADO 001', 'historico', true, 'Histórico importado del padrón Districorr. Fuentes: IMPLANTES E INSTRUMENTAL QUIRURGICO.'),
('CL-TD2FXP-001', 'CL-TD2FXP', 1, 'CL', 'T', 'D2', 'FX', 'P', 'BIOPROTECE', 'CLAVO TITANIO DERECHA FEMUR EXPERT IMPLANTES 001', 'historico', true, 'Histórico importado del padrón Districorr. Fuentes: IMPLANTES E INSTRUMENTAL QUIRURGICO.'),
('OS-T25MCU-001', 'OS-T25MCU', 1, 'OS', 'T', '25', 'MC', 'U', 'BIOPROTECE', 'OSTEOSINTESIS TITANIO 2,5 MICROFRAGMENTO 001', 'historico', true, 'Histórico importado del padrón Districorr. Fuentes: IMPLANTES E INSTRUMENTAL QUIRURGICO.'),
('OS-A35XXP-003', 'OS-A35XXP', 3, 'OS', 'A', '35', 'XX', 'P', NULL, 'SET TORNILLOS EXTRAS OSTEO ACERO 3.5', 'historico', true, 'Histórico importado del padrón Districorr. Fuentes: IMPLANTES E INSTRUMENTAL QUIRURGICO.'),
('ST-A45RCP-001', 'ST-A45RCP', 1, 'ST', 'A', '45', 'RC', 'P', 'BIOPROTECE', 'SET ACERO 4.5 RECONSTRUCCION IMPLANTE 001', 'historico', true, 'Histórico importado del padrón Districorr. Fuentes: IMPLANTES E INSTRUMENTAL QUIRURGICO.'),
('ST-X00BOI-001', 'ST-X00BOI', 1, 'ST', 'X', '00', 'BO', 'I', NULL, 'SET INSTRUMENTAL BIOCOMPUESTO', 'historico', true, 'Histórico importado del padrón Districorr. Fuentes: IMPLANTES E INSTRUMENTAL QUIRURGICO.'),
('ST-A35DTP-001', 'ST-A35DTP', 1, 'ST', 'A', '35', 'DT', 'P', NULL, 'SET ACERO 3,5 PLACAS DCP / TERCIO DE TUBO IMPLANTES 001', 'historico', true, 'Histórico importado del padrón Districorr. Fuentes: IMPLANTES E INSTRUMENTAL QUIRURGICO.'),
('ST-A45DAP-001', 'ST-A45DAP', 1, 'ST', 'A', '45', 'DA', 'P', 'BIOPROTECE', 'SET PLACAS ACERO 4,5 ANCHA Y ANGOSTA IMPLANTES 001', 'historico', true, 'Histórico importado del padrón Districorr. Fuentes: IMPLANTES E INSTRUMENTAL QUIRURGICO.'),
('ST-A45JKP-001', 'ST-A45JKP', 1, 'ST', 'A', '45', 'JK', 'P', 'BIOPROTECE', 'SET PLACA ACERO 4.5 JOCKEY IMPLANTES 001', 'historico', true, 'Histórico importado del padrón Districorr. Fuentes: IMPLANTES E INSTRUMENTAL QUIRURGICO.'),
('ST-A35DTP-002', 'ST-A35DTP', 2, 'ST', 'A', '35', 'DT', 'P', NULL, 'SET ACERO 3,5 PLACAS DCP / TERCIO DE TUBO IMPLANTES 002', 'historico', true, 'Histórico importado del padrón Districorr. Fuentes: IMPLANTES E INSTRUMENTAL QUIRURGICO.'),
('ST-A35TDP-001', 'ST-A35TDP', 1, 'ST', 'A', '35', 'TD', 'P', NULL, 'SET ACERO 3,5 PLACA TIBIA DISTAL IMPLANTES 001', 'historico', true, 'Histórico importado del padrón Districorr. Fuentes: IMPLANTES E INSTRUMENTAL QUIRURGICO.'),
('ST-T35DCP-008', 'ST-T35DCP', 8, 'ST', 'T', '35', 'DC', 'P', 'BIOPROTECE', 'SET PLACA DCP TITANIO 3,5 008', 'historico', true, 'Histórico importado del padrón Districorr. Fuentes: IMPLANTES E INSTRUMENTAL QUIRURGICO.'),
('ST-A35RCP-001', 'ST-A35RCP', 1, 'ST', 'A', '35', 'RC', 'P', 'MATRITEC', 'SET ACERO 3.5 RECONSTRUCCION IMPLANTE 001', 'historico', true, 'Histórico importado del padrón Districorr. Fuentes: IMPLANTES E INSTRUMENTAL QUIRURGICO.'),
('RC-X00DMC-002', 'RC-X00DMC', 2, 'RC', 'X', '00', 'DM', 'C', 'BIOPROTECE', 'REEMPLAZO TOT. DE CADERA CEMENTADA DOBLE MOVIL. CONT. 002', 'historico', true, 'Histórico importado del padrón Districorr. Fuentes: IMPLANTES E INSTRUMENTAL QUIRURGICO.'),
('RP-X00TRC-001', 'RP-X00TRC', 1, 'RP', 'X', '00', 'TR', 'C', 'BIOPROTECE', 'REEMPLAZO TALLO MULLER REVISION CONTENEDOR 001', 'historico', true, 'Histórico importado del padrón Districorr. Fuentes: IMPLANTES E INSTRUMENTAL QUIRURGICO.'),
('LC-T00LGI-001', 'LC-T00LGI', 1, 'LC', 'T', '00', 'LG', 'I', 'BIOPROTECE', 'CAJA INSTRUMENTAL LCA LIGAMENTO 001', 'historico', true, 'Histórico importado del padrón Districorr. Fuentes: IMPLANTES E INSTRUMENTAL QUIRURGICO.'),
('CL-T00TEU-001', 'CL-T00TEU', 1, 'CL', 'T', '00', 'TE', 'U', 'CDH', 'CAJA CLAVO TEN TITANIO IMPLANTES E INSTRUMENTAL 001', 'historico', true, 'Histórico importado del padrón Districorr. Fuentes: IMPLANTES E INSTRUMENTAL QUIRURGICO.'),
('LC-T00LGI-002', 'LC-T00LGI', 2, 'LC', 'T', '00', 'LG', 'I', 'BIOPROTECE', 'CAJA INSTRUMENTAL LCA LIGAMENTO 002', 'historico', true, 'Histórico importado del padrón Districorr. Fuentes: IMPLANTES E INSTRUMENTAL QUIRURGICO.'),
('OS-T35CLU-014', 'OS-T35CLU', 14, 'OS', 'T', '35', 'CL', 'U', 'CDH', 'OSTEOSINTESIS 3,5 TITANIO CLAVICULA CDH 014', 'historico', true, 'Histórico importado del padrón Districorr. Fuentes: IMPLANTES E INSTRUMENTAL QUIRURGICO.'),
('CL-A00TTI-001', 'CL-A00TTI', 1, 'CL', 'A', '00', 'TT', 'I', 'CDH', 'INSTRUMENTAL CLAVO TROCANTERICO ACERO TIPO GAMMA 001', 'historico', true, 'Histórico importado del padrón Districorr. Fuentes: IMPLANTES E INSTRUMENTAL QUIRURGICO.'),
('CL-A00TTP-001', 'CL-A00TTP', 1, 'CL', 'A', '00', 'TT', 'P', 'CDH', 'IMPLANTES CLAVO TROCANTERICO ACERO TIPO GAMMA 001', 'historico', true, 'Histórico importado del padrón Districorr. Fuentes: IMPLANTES E INSTRUMENTAL QUIRURGICO.'),
('ST-T35RCP-001', 'ST-T35RCP', 1, 'ST', 'T', '35', 'RC', 'P', 'BIOPROTECE', 'SET TITANIO 3.5 RECONSTRUCCION IMPLANTE 001', 'historico', true, 'Histórico importado del padrón Districorr. Fuentes: IMPLANTES E INSTRUMENTAL QUIRURGICO.'),
('CL-A00RTI-001', 'CL-A00RTI', 1, 'CL', 'A', '00', 'RT', 'I', 'CDH', 'CLAVO ACERO RETROGRADO DE FEMUR INSTRUMENTAL 001', 'historico', true, 'Histórico importado del padrón Districorr. Fuentes: IMPLANTES E INSTRUMENTAL QUIRURGICO.'),
('CL-A00RTP-001', 'CL-A00RTP', 1, 'CL', 'A', '00', 'RT', 'P', 'CDH', 'CLAVO ACERO RETROGRADO DE FEMUR IMPLANTES 001', 'historico', true, 'Histórico importado del padrón Districorr. Fuentes: IMPLANTES E INSTRUMENTAL QUIRURGICO.'),
('CL-A00HRU-001', 'CL-A00HRU', 1, 'CL', 'A', '00', 'HR', 'U', 'CDH', 'CLAVO ACERO HUMERO IMPLANTES E INSTRUMENTAL 001', 'historico', true, 'Histórico importado del padrón Districorr. Fuentes: IMPLANTES E INSTRUMENTAL QUIRURGICO.'),
('OS-T45PDU-001', 'OS-T45PDU', 1, 'OS', 'T', '45', 'PD', 'U', 'CDH', 'SET TITANIO 4.5 INSTRUMENTAL E IMPLANTES PUDDU 001', 'historico', true, 'Histórico importado del padrón Districorr. Fuentes: IMPLANTES E INSTRUMENTAL QUIRURGICO.'),
('ST-T35OLP-001', 'ST-T35OLP', 1, 'ST', 'T', '35', 'OL', 'P', 'MATRITEC', 'SET PLACA TITANIO 3.5 OLECRANON 001', 'historico', true, 'Histórico importado del padrón Districorr. Fuentes: IMPLANTES E INSTRUMENTAL QUIRURGICO.'),
('OS-T15MCP-001', 'OS-T15MCP', 1, 'OS', 'T', '15', 'MC', 'P', 'BIOPROTECE', 'SET TITANIO 1.5 - 2.0 - MICROFRAGMENTO IMPLANTES 001', 'historico', true, 'Histórico importado del padrón Districorr. Fuentes: IMPLANTES E INSTRUMENTAL QUIRURGICO.'),
('OS-T25MCP-001', 'OS-T25MCP', 1, 'OS', 'T', '25', 'MC', 'P', 'BIOPROTECE', 'SET TITANIO 2.5 MICROFRAGMENTO IMPLANTES 001', 'historico', true, 'Histórico importado del padrón Districorr. Fuentes: IMPLANTES E INSTRUMENTAL QUIRURGICO.'),
('OS-T35VLU-010', 'OS-T35VLU', 10, 'OS', 'T', '35', 'VL', 'U', 'CDH', 'OSTEOSINTESIS 3,5 TITANIO VOLAR 010 CDH', 'historico', true, 'Histórico importado del padrón Districorr. Fuentes: IMPLANTES E INSTRUMENTAL QUIRURGICO.'),
('OS-T35CLU-015', 'OS-T35CLU', 15, 'OS', 'T', '35', 'CL', 'U', 'CDH', 'OSTEOSINTESIS 3,5 TITANIO CLAVICULA CDH 015', 'historico', true, 'Histórico importado del padrón Districorr. Fuentes: IMPLANTES E INSTRUMENTAL QUIRURGICO.'),
('OS-T35VLU-011', 'OS-T35VLU', 11, 'OS', 'T', '35', 'VL', 'U', 'CDH', 'OSTEOSINTESIS 3,5 TITANIO VOLAR 011 CDH', 'historico', true, 'Histórico importado del padrón Districorr. Fuentes: IMPLANTES E INSTRUMENTAL QUIRURGICO.'),
('LG-T00IFP-007', 'LG-T00IFP', 7, 'LG', 'T', '00', 'IF', 'P', 'SOUTH AMERICA IMPLAS', 'SET TORNILLOS INTERFERENCIAL SAI 007', 'historico', true, 'Histórico importado del padrón Districorr. Fuentes: IMPLANTES E INSTRUMENTAL QUIRURGICO.'),
('LG-T00KSP-007', 'LG-T00KSP', 7, 'LG', 'T', '00', 'KS', 'P', 'SOUTH AMERICA IMPLAS', 'SET LCA TORNILLOS KUROSAKA 007', 'historico', true, 'Histórico importado del padrón Districorr. Fuentes: IMPLANTES E INSTRUMENTAL QUIRURGICO.'),
('LG-T00IFP-008', 'LG-T00IFP', 8, 'LG', 'T', '00', 'IF', 'P', 'SOUTH AMERICA IMPLAS', 'SET TORNILLOS INTERFERENCIAL SAI 008', 'historico', true, 'Histórico importado del padrón Districorr. Fuentes: IMPLANTES E INSTRUMENTAL QUIRURGICO.'),
('LC-T00LGI-003', 'LC-T00LGI', 3, 'LC', 'T', '00', 'LG', 'I', 'BIOPROTECE', 'CAJA INSTRUMENTAL LCA LIGAMENTO 003', 'historico', true, 'Histórico importado del padrón Districorr. Fuentes: IMPLANTES E INSTRUMENTAL QUIRURGICO.'),
('LG-T00END-001', 'LG-T00END', 1, 'LG', 'T', '00', 'EN', 'D', 'SOUTH AMERICA IMPLAS', 'SET ENDOBUTTON 001', 'historico', true, 'Histórico importado del padrón Districorr. Fuentes: IMPLANTES E INSTRUMENTAL QUIRURGICO.'),
('LG-T00IFP-009', 'LG-T00IFP', 9, 'LG', 'T', '00', 'IF', 'P', 'SOUTH AMERICA IMPLAS', 'SET TORNILLOS INTERFERENCIAL 009', 'historico', true, 'Histórico importado del padrón Districorr. Fuentes: IMPLANTES E INSTRUMENTAL QUIRURGICO.'),
('LG-T00KSP-008', 'LG-T00KSP', 8, 'LG', 'T', '00', 'KS', 'P', 'SOUTH AMERICA IMPLAS', 'SET LCA TORNILLOS KUROSAKA 008', 'historico', true, 'Histórico importado del padrón Districorr. Fuentes: IMPLANTES E INSTRUMENTAL QUIRURGICO.'),
('LG-T00KSP-009', 'LG-T00KSP', 9, 'LG', 'T', '00', 'KS', 'P', 'SOUTH AMERICA IMPLAS', 'SET LCA TORNILLOS KUROSAKA 009', 'historico', true, 'Histórico importado del padrón Districorr. Fuentes: IMPLANTES E INSTRUMENTAL QUIRURGICO.'),
('LG-T00PKP-004', 'LG-T00PKP', 4, 'LG', 'T', '00', 'PK', 'P', 'SOUTH AMERICA IMPLAS', 'SET LCA TORNILLOS DE PEEK 004', 'historico', true, 'Histórico importado del padrón Districorr. Fuentes: IMPLANTES E INSTRUMENTAL QUIRURGICO.'),
('ST-T35RCP-002', 'ST-T35RCP', 2, 'ST', 'T', '35', 'RC', 'P', 'BIOPROTECE', 'SET TITANIO 3.5 RECONSTRUCCION IMPLANTE 002', 'historico', true, 'Histórico importado del padrón Districorr. Fuentes: IMPLANTES E INSTRUMENTAL QUIRURGICO.'),
('ST-T00TRP-001', 'ST-T00TRP', 1, 'ST', 'T', '00', 'TR', 'P', NULL, 'SET DE TORNILLERA EXTRA TITANIO 001', 'historico', true, 'Histórico importado del padrón Districorr. Fuentes: IMPLANTES E INSTRUMENTAL QUIRURGICO.'),
('ST-T00TRP-002', 'ST-T00TRP', 2, 'ST', 'T', '00', 'TR', 'P', NULL, 'SET DE TORNILLERA EXTRA TITANIO 002', 'historico', true, 'Histórico importado del padrón Districorr. Fuentes: IMPLANTES E INSTRUMENTAL QUIRURGICO.'),
('ST-TR2TRP-001', 'ST-TR2TRP', 1, 'ST', 'T', 'R2', 'TR', 'P', NULL, 'SET DE TORNILLERA LARGA DE TITANIO IMPLANTES 001.', 'historico', true, 'Histórico importado del padrón Districorr. Fuentes: IMPLANTES E INSTRUMENTAL QUIRURGICO.'),
('ST-TR2TRP-002', 'ST-TR2TRP', 2, 'ST', 'T', 'R2', 'TR', 'P', 'BIOPROTECE', 'SET DE TORNILLERA LARGA DE TITANIO IMPLANTES 002', 'historico', true, 'Histórico importado del padrón Districorr. Fuentes: IMPLANTES E INSTRUMENTAL QUIRURGICO.'),
('RC-X00CMI-003', 'RC-X00CMI', 3, 'RC', 'X', '00', 'CM', 'I', 'BIOPROTECE', 'REEMPLAZO TOTAL DE CADERA CEMENTADA INSTRUMENTAL 003', 'historico', true, 'Histórico importado del padrón Districorr. Fuentes: IMPLANTES E INSTRUMENTAL QUIRURGICO.'),
('RC-X00CMI-004', 'RC-X00CMI', 4, 'RC', 'X', '00', 'CM', 'I', 'BIOPROTECE', 'REEMPLAZO TOTAL DE CADERA CEMENTADA INSTRUMENTAL 004', 'historico', true, 'Histórico importado del padrón Districorr. Fuentes: IMPLANTES E INSTRUMENTAL QUIRURGICO.'),
('RP-X00TRC-002', 'RP-X00TRC', 2, 'RP', 'X', '00', 'TR', 'C', 'BIOPROTECE', 'REEMPLAZO TALLO MULLER REVISION CONTENEDOR 002', 'historico', true, 'Histórico importado del padrón Districorr. Fuentes: IMPLANTES E INSTRUMENTAL QUIRURGICO.'),
('RC-X00CMC-003', 'RC-X00CMC', 3, 'RC', 'X', '00', 'CM', 'C', 'BIOPROTECE', 'REEMPLAZO TOTAL DE CADERA CEMENTADA CONTENEDOR. 002', 'historico', true, 'Histórico importado del padrón Districorr. Fuentes: IMPLANTES E INSTRUMENTAL QUIRURGICO.'),
('RP-X00TRC-003', 'RP-X00TRC', 3, 'RP', 'X', '00', 'TR', 'C', 'BIOPROTECE', 'REEMPLAZO TALLO MULLER REVISION CONTENEDOR 003', 'historico', true, 'Histórico importado del padrón Districorr. Fuentes: IMPLANTES E INSTRUMENTAL QUIRURGICO.'),
('RC-X00DMI-002', 'RC-X00DMI', 2, 'RC', 'X', '00', 'DM', 'I', 'BIOPROTECE', 'CAJA REEMPLAZO TOTAL CADERA DOBLE MOVILIDAD CM INST 002', 'historico', true, 'Histórico importado del padrón Districorr. Fuentes: IMPLANTES E INSTRUMENTAL QUIRURGICO.'),
('ST-T35PRP-002', 'ST-T35PRP', 2, 'ST', 'T', '35', 'PR', 'P', 'BIOPROTECE', 'SET PLACA TITANIO 3.5 PERONE IMPLANTES 001', 'historico', true, 'Histórico importado del padrón Districorr. Fuentes: IMPLANTES E INSTRUMENTAL QUIRURGICO.'),
('RC-X00PRC-001', 'RC-X00PRC', 1, 'RC', 'X', '00', 'PR', 'C', 'BIOPROTECE', 'CONTENEDOR ESPACIADORES DE CADERA PRIMARIOS Y REVISION 001', 'historico', true, 'Histórico importado del padrón Districorr. Fuentes: IMPLANTES E INSTRUMENTAL QUIRURGICO.'),
('MC-SRRBTM-002', 'MC-SRRBTM', 2, 'MC', 'S', 'RR', 'BT', 'M', 'BTR', 'MICROSIERRA BTR 200 - N° 002', 'historico', true, 'Histórico importado del padrón Districorr. Fuentes: MOTORES Y EQUIPOS MÉDICOS.'),
('MC-SRRBTM-003', 'MC-SRRBTM', 3, 'MC', 'S', 'RR', 'BT', 'M', 'BTR', 'MICROSIERRA BTR 200 - N° 003', 'historico', true, 'Histórico importado del padrón Districorr. Fuentes: MOTORES Y EQUIPOS MÉDICOS.'),
('MC-SRRBTM-004', 'MC-SRRBTM', 4, 'MC', 'S', 'RR', 'BT', 'M', 'BTR', 'MICROSIERRA BTR 200 - N° 004', 'historico', true, 'Histórico importado del padrón Districorr. Fuentes: MOTORES Y EQUIPOS MÉDICOS.'),
('SR-UNIBTM-003', 'SR-UNIBTM', 3, 'SR', 'U', 'NI', 'BT', 'M', NULL, 'SIERRA BTR 2000 N°3', 'historico', true, 'Histórico importado del padrón Districorr. Fuentes: MOTORES Y EQUIPOS MÉDICOS.'),
('0AP0000PT015', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'SOUTH AMERICA IMPLAS', 'CAJA SAI SUB PEEK / KNOTLESS / SUB PUNCH', 'historico', true, 'Histórico importado del padrón Districorr. Fuentes: SOLO SAI. Código en formato legacy / externo.'),
('0AS0000UT022', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'SOUTH AMERICA IMPLAS', 'CAJA SAI SUB SOFT 1.4 / 1.6 / 2.9', 'historico', true, 'Histórico importado del padrón Districorr. Fuentes: SOLO SAI. Código en formato legacy / externo.'),
('0AHL0000T034', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'SOUTH AMERICA IMPLAS', 'CAJA SAI CONMED', 'historico', true, 'Histórico importado del padrón Districorr. Fuentes: SOLO SAI. Código en formato legacy / externo.'),
('0AH02FP0T026', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'SOUTH AMERICA IMPLAS', 'CAJA ARTRO-HOMBRO SAI', 'historico', true, 'Histórico importado del padrón Districorr. Fuentes: SOLO SAI. Código en formato legacy / externo.'),
('KRP0PRI1XT25', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'SOUTH AMERICA IMPLAS', 'CAJA SAI INSTRUMENTAL PRIMARIO PARA PROTESIS DE RODILLA 1', 'historico', true, 'Histórico importado del padrón Districorr. Fuentes: SOLO SAI. Código en formato legacy / externo.'),
('KRP0PRI2XT25', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'SOUTH AMERICA IMPLAS', 'CAJA SAI INSTRUMENTAL PRIMARIO PARA PROTESIS DE RODILLA 2', 'historico', true, 'Histórico importado del padrón Districorr. Fuentes: SOLO SAI. Código en formato legacy / externo.'),
('KRP0PRI3XT25', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'SOUTH AMERICA IMPLAS', 'CAJA SAI INSTRUMENTAL PRIMARIO PARA PROTESIS DE RODILLA 3', 'historico', true, 'Histórico importado del padrón Districorr. Fuentes: SOLO SAI. Código en formato legacy / externo.'),
('KRP0PRI4XT25', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'SOUTH AMERICA IMPLAS', 'CAJA SAI INSTRUMENTAL PRIMARIO PARA PROTESIS DE RODILLA 4', 'historico', true, 'Histórico importado del padrón Districorr. Fuentes: SOLO SAI. Código en formato legacy / externo.'),
('KRP0PRIAXB28', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'SOUTH AMERICA IMPLAS', 'MALETIN SAI IMPLANTES PRIMARIO PARA PROTESIS DE RODILLA (A)', 'historico', true, 'Histórico importado del padrón Districorr. Fuentes: SOLO SAI. Código en formato legacy / externo.'),
('KRP0PRIBXB28', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'SOUTH AMERICA IMPLAS', 'MALETIN SAI IMPLANTES PRIMARIO PARA PROTESIS DE RODILLA (B)', 'historico', true, 'Histórico importado del padrón Districorr. Fuentes: SOLO SAI. Código en formato legacy / externo.'),
('0NH0000TB011', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'SOUTH AMERICA IMPLAS', 'MALETIN SAI IMPLANTES CLAVOS CAPTOR', 'historico', true, 'Histórico importado del padrón Districorr. Fuentes: SOLO SAI. Código en formato legacy / externo.'),
('0NH0001TT039', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'SOUTH AMERICA IMPLAS', 'CAJA SAI INSTRUMENTAL CLAVO CAPTOR 001', 'historico', true, 'Histórico importado del padrón Districorr. Fuentes: SOLO SAI. Código en formato legacy / externo.'),
('0NH0002TT039', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'SOUTH AMERICA IMPLAS', 'CAJA SAI TORNILLERA Y DESLIZANTES CLAVO CAPTOR', 'historico', true, 'Histórico importado del padrón Districorr. Fuentes: SOLO SAI. Código en formato legacy / externo.'),
('LG-T00PKP-001', 'LG-T00PKP', 1, 'LG', 'T', '00', 'PK', 'P', 'SOUTH AMERICA IMPLAS', 'SET LCA TORNILLOS DE PEEK 001', 'historico', true, 'Histórico importado del padrón Districorr. Fuentes: SOLO SAI.'),
('LG-T00TNP-001', 'LG-T00TNP', 1, 'LG', 'T', '00', 'TN', 'P', 'SOUTH AMERICA IMPLAS', 'SET TORNILLO PARA TENODESIS 001', 'historico', true, 'Histórico importado del padrón Districorr. Fuentes: SOLO SAI.'),
('LG-T00KSP-001', 'LG-T00KSP', 1, 'LG', 'T', '00', 'KS', 'P', 'SOUTH AMERICA IMPLAS', 'SET LCA TORNILLOS KUROSAKA 001', 'historico', true, 'Histórico importado del padrón Districorr. Fuentes: SOLO SAI.'),
('LG-T00KSP-002', 'LG-T00KSP', 2, 'LG', 'T', '00', 'KS', 'P', 'SOUTH AMERICA IMPLAS', 'SET LCA TORNILLOS KUROSAKA 002', 'historico', true, 'Histórico importado del padrón Districorr. Fuentes: SOLO SAI.'),
('LG-T00IFP-002', 'LG-T00IFP', 2, 'LG', 'T', '00', 'IF', 'P', 'SOUTH AMERICA IMPLAS', 'SET TORNILLOS INTERFERENCIAL SAI 002', 'historico', true, 'Histórico importado del padrón Districorr. Fuentes: SOLO SAI.'),
('LG-T00IFP-001', 'LG-T00IFP', 1, 'LG', 'T', '00', 'IF', 'P', 'SOUTH AMERICA IMPLAS', 'SET TORNILLOS INTERFERENCIAL SAI 001', 'historico', true, 'Histórico importado del padrón Districorr. Fuentes: SOLO SAI.'),
('LG-T00PKP-002', 'LG-T00PKP', 2, 'LG', 'T', '00', 'PK', 'P', 'SOUTH AMERICA IMPLAS', 'SET LCA TORNILLOS DE PEEK 002', 'historico', true, 'Histórico importado del padrón Districorr. Fuentes: SOLO SAI.'),
('LG-T00IFP-003', 'LG-T00IFP', 3, 'LG', 'T', '00', 'IF', 'P', 'SOUTH AMERICA IMPLAS', 'SET TORNILLOS INTERFERENCIAL SAI 003', 'historico', true, 'Histórico importado del padrón Districorr. Fuentes: SOLO SAI.'),
('LG-T00KSP-003', 'LG-T00KSP', 3, 'LG', 'T', '00', 'KS', 'P', 'SOUTH AMERICA IMPLAS', 'SET LCA TORNILLOS KUROSAKA 003', 'historico', true, 'Histórico importado del padrón Districorr. Fuentes: SOLO SAI.'),
('LG-T00KSP-004', 'LG-T00KSP', 4, 'LG', 'T', '00', 'KS', 'P', 'SOUTH AMERICA IMPLAS', 'SET LCA TORNILLOS KUROSAKA 004', 'historico', true, 'Histórico importado del padrón Districorr. Fuentes: SOLO SAI.'),
('LG-T00IFP-004', 'LG-T00IFP', 4, 'LG', 'T', '00', 'IF', 'P', 'SOUTH AMERICA IMPLAS', 'SET TORNILLOS INTERFERENCIAL SAI 004', 'historico', true, 'Histórico importado del padrón Districorr. Fuentes: SOLO SAI.'),
('LG-T00IFP-005', 'LG-T00IFP', 5, 'LG', 'T', '00', 'IF', 'P', 'SOUTH AMERICA IMPLAS', 'SET TORNILLOS INTERFERENCIAL SAI 005', 'historico', true, 'Histórico importado del padrón Districorr. Fuentes: SOLO SAI.'),
('LG-T00KSP-005', 'LG-T00KSP', 5, 'LG', 'T', '00', 'KS', 'P', 'SOUTH AMERICA IMPLAS', 'SET LCA TORNILLOS KUROSAKA 005', 'historico', true, 'Histórico importado del padrón Districorr. Fuentes: SOLO SAI.'),
('LG-T00PKP-003', 'LG-T00PKP', 3, 'LG', 'T', '00', 'PK', 'P', 'SOUTH AMERICA IMPLAS', 'SET LCA TORNILLOS DE PEEK 003', 'historico', true, 'Histórico importado del padrón Districorr. Fuentes: SOLO SAI.'),
('LG-T70TVP-001', 'LG-T70TVP', 1, 'LG', 'T', '70', 'TV', 'P', 'SOUTH AMERICA IMPLAS', 'SET TORNILLO 7.0 TRANSVERSAL TITANIO 001', 'historico', true, 'Histórico importado del padrón Districorr. Fuentes: SOLO SAI.'),
('LG-T70TVP-002', 'LG-T70TVP', 2, 'LG', 'T', '70', 'TV', 'P', 'SOUTH AMERICA IMPLAS', 'SET TORNILLO 7.0 TRANSVERSAL TITANIO 002', 'historico', true, 'Histórico importado del padrón Districorr. Fuentes: SOLO SAI.'),
('LG-T70TPP-001', 'LG-T70TPP', 1, 'LG', 'T', '70', 'TP', 'P', 'SOUTH AMERICA IMPLAS', 'SET TORNILLO 7.0 TRANSVERSAL PEEK 001', 'historico', true, 'Histórico importado del padrón Districorr. Fuentes: SOLO SAI.'),
('LG-T00BLP-001', 'LG-T00BLP', 1, 'LG', 'T', '00', 'BL', 'P', 'SOUTH AMERICA IMPLAS', 'SET TORNILLO BUTTON LOOP TITANIO 001', 'historico', true, 'Histórico importado del padrón Districorr. Fuentes: SOLO SAI.'),
('LG-X00BOP-001', 'LG-X00BOP', 1, 'LG', 'X', '00', 'BO', 'P', 'SOUTH AMERICA IMPLAS', 'SET TORNILLO INTERFERENCIAL BIOCOMPUESTO', 'historico', true, 'Histórico importado del padrón Districorr. Fuentes: SOLO SAI.'),
('ST-X00ARP-001', 'ST-X00ARP', 1, 'ST', 'X', '00', 'AR', 'P', 'SOUTH AMERICA IMPLAS', 'SET ACROMIOCLAVICULAR 001', 'historico', true, 'Histórico importado del padrón Districorr. Fuentes: SOLO SAI.'),
('ST-X00ARP-002', 'ST-X00ARP', 2, 'ST', 'X', '00', 'AR', 'P', 'SOUTH AMERICA IMPLAS', 'SET ACROMIOCLAVICULAR 002', 'historico', true, 'Histórico importado del padrón Districorr. Fuentes: SOLO SAI.'),
('LG-T00IFP-006', 'LG-T00IFP', 6, 'LG', 'T', '00', 'IF', 'P', 'SOUTH AMERICA IMPLAS', 'SET TORNILLOS INTERFERENCIAL SAI 006', 'historico', true, 'Histórico importado del padrón Districorr. Fuentes: SOLO SAI.'),
('LG-T00KSP-006', 'LG-T00KSP', 6, 'LG', 'T', '00', 'KS', 'P', 'SOUTH AMERICA IMPLAS', 'SET LCA TORNILLOS KUROSAKA 006', 'historico', true, 'Histórico importado del padrón Districorr. Fuentes: SOLO SAI.'),
('SET-DESC-C', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'SET DESCARTABLES C', 'historico', true, 'Histórico importado del padrón Districorr. Fuentes: DEPARTAMENTO DE DESCATABLES. Código en formato legacy / externo.'),
('SET-DESC-RO', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'SET DESCARTABLES + CEMENTOS', 'historico', true, 'Histórico importado del padrón Districorr. Fuentes: DEPARTAMENTO DE DESCATABLES. Código en formato legacy / externo.'),
('SET-DESC-G', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'SET DESCARTABLES + CEMENTOS CON G', 'historico', true, 'Histórico importado del padrón Districorr. Fuentes: DEPARTAMENTO DE DESCATABLES. Código en formato legacy / externo.'),
('SET-DESC-GN', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'SET DE DESCARTABLES + CEMENTOS GUN', 'historico', true, 'Histórico importado del padrón Districorr. Fuentes: DEPARTAMENTO DE DESCATABLES. Código en formato legacy / externo.'),
('SET-DESC-IO', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'SET DESCARTABLES + IODADO', 'historico', true, 'Histórico importado del padrón Districorr. Fuentes: DEPARTAMENTO DE DESCATABLES. Código en formato legacy / externo.')
ON CONFLICT (codigo) DO NOTHING;

-- 5. Carga Inicial de Posts de Knowledge
INSERT INTO public.cajas_knowledge (titulo, categoria, tags, importancia, estado, contenido)
VALUES
(
    'Modelo operativo: físico ≠ lógico',
    'Cajas',
    ARRAY['cajas', 'sets', 'modelo lógico', 'relación'],
    'Crítico',
    'Vigente',
    '### Modelo Físico vs. Modelo Lógico en Districorr

Una caja física puede contener en la práctica instrumental e implantes sin que esas partes estén permanentemente asignadas entre sí.

- En el sistema, **instrumental/caja** y **set de implantes** se mantienen como entidades lógicas separadas, aunque físicamente estén dentro del mismo contenedor.
- **OS** identifica la familia/categoría de osteosíntesis usada para la caja de instrumental.
- **ST** identifica un set, usado en el modelo actual para los implantes (por ejemplo placas).
- La coincidencia de serie **NO crea una relación 1:1**. OS-T35VLU-004 no pertenece obligatoriamente a ST-T35VLP-004. Los sets pueden mezclarse con cajas compatibles.
- El número de serie identifica una instancia dentro de su código/familia lógica; no debe usarse como clave de emparejamiento físico entre OS y ST.'
),
(
    'Cómo se compone un código Districorr',
    'Codificación',
    ARRAY['codigo', 'estructura', 'serie', 'reglas'],
    'Crítico',
    'Vigente',
    '### Anatomía del Código Canónico Districorr

Forma técnica predominante: AA-XXXXXX-999 (2 caracteres de familia + guion + 6 caracteres semánticos + guion + 3 dígitos de serie).

Ejemplo: **OS-T35VLU-001**
- **OS**: Clasificación general (Osteosíntesis)
- **T**: Material (Titanio)
- **35**: Medida / Variante (3,5 mm)
- **VL**: Clasificación específica (Volar)
- **U**: Contenido histórico (Unificado)
- **001**: Serie autoincremental de la base

Las series históricas existentes se reservan permanentemente. El generador nuevo siempre emitirá MAX(serie) + 1 sin ocupar huecos de series anuladas o históricas.'
),
(
    'Diccionario histórico de codificación',
    'Codificación',
    ARRAY['diccionario', 'abreviaturas', 'historico', 'referencia'],
    'Importante',
    'Vigente',
    '### Diccionario de Abreviaturas Históricas

**Familias:**
- OS: Osteosíntesis (caja/instrumental) | ST: Set de implantes | CL: Clavo endomedular | RC: Reemplazo cadera | RR: Reemplazo rodilla | AR: Artroscopia | EX: Extracción | MT: Motor | EQ: Equipo | SR: Sierra | CO: Columna.

**Materiales:**
- T: Titanio | A: Acero | P: PEEK | X: Mixto / No específico.

**Contenido:**
- I: Instrumental | P: Implante | U: Unificado | M: Maletín | C: Contenedor.'
),
(
    'Motores y equipos — estructura histórica',
    'Equipos',
    ARRAY['motores', 'equipos', 'codificacion', 'marcas'],
    'Normal',
    'Vigente',
    '### Gramática Histórica de Motores y Equipos

Ejemplo: **MT-CANDWB-001**
- **MT**: Motor | **CAN**: Canulado | **DW**: DeWalt | **B**: Batería | **001**: Serie.

Ejemplo: **EQ-SHABTM-001**
- **EQ**: Equipo | **SHA**: Shaver | **BTM**: BTR | **001**: Serie.

La estructura de motores/equipos es específica y no debe forzarse a la gramática clínica.'
),
(
    'Inconsistencias históricas conocidas',
    'Histórico',
    ARRAY['conflictos', 'legacy', 'auditoria', 'inconsistencias'],
    'Crítico',
    'Vigente',
    '### Registro de Inconsistencias Históricas

No se corrigen automáticamente los códigos emitidos en el pasado. Se preservan literalmente y se auditan:

1. **Colisión TD / TP**: Existen códigos en los catálogos donde TD figura como Tibia proximal y TP como Tibia distal. Se conservan tal como fueron ingresados.
2. **Códigos Legacy ERP**: Ejemplos como OS-T35CLU0001 no cumplen el guionado 2-6-3. Se guardan con codigo_base y serie NULL.
3. **Reutilización de Motores**: Códigos como MT-SIMTLB-007 aparecen en múltiples filas por asignación operativa. Se consolida en una sola entrada master.'
),
(
    'Regla para crear códigos nuevos',
    'Procedimientos',
    ARRAY['alta', 'codigo', 'generador', 'reglas'],
    'Crítico',
    'Vigente',
    '### Reglas Obligatorias para la Emisión de Nuevos Códigos

1. **El código no se escribe manualmente**: Se debe utilizar el Generador Controlado seleccionando componentes.
2. **Generación en Backend**: La serie se calcula en PostgreSQL con bloqueo de concurrencia pg_advisory_xact_lock(hashtext(v_base)).
3. **No reutilización**: Nunca se ocupan números anteriores ni anulados. Se aplica siempre MAX(serie) + 1.
4. **Conservación**: Un código que existió en el pasado jamás se elimina físicamente.'
),
(
    'Códigos legacy y externos',
    'Histórico',
    ARRAY['legacy', 'SAI', 'externos', 'proveedores'],
    'Normal',
    'Vigente',
    '### Tratamiento de Códigos Legacy y Proveedores Externos

Los códigos provenientes de proveedores externos (ej. SAI, Bioprotece) o formatos anteriores que no siguen la plantilla AA-XXXXXX-999 se cargan en modo **Histórico / Legacy**.

Se conservan intactos en el campo de codigo, dejando codigo_base y serie en NULL para no alterar las secuencias del generador nuevo.'
)
ON CONFLICT DO NOTHING;
