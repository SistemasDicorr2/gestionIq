// src/services/logisticaReportHelpers.js

/**
 * Formatea una fecha YYYY-MM-DD a DD/MM/YYYY
 */
export const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-');
  return `${d}/${m}/${y}`;
};

/**
 * Formatea una fecha/hora ISO a DD/MM/YYYY HH:mm
 */
export const formatDateTime = (dateTimeStr) => {
  if (!dateTimeStr) return '';
  const date = new Date(dateTimeStr);
  return date.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' }) + 
         ' ' + 
         date.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
};

/**
 * Clasifica si un tipo de movimiento corresponde a una Entrega
 */
export const isEntrega = (tipo = '') => {
  const t = String(tipo).toLowerCase();
  return t.includes('entrega') || t.includes('despacho') || t.includes('envío') || t.includes('envio');
};

/**
 * Clasifica si un tipo de movimiento corresponde a un Retiro
 */
export const isRetiro = (tipo = '') => {
  const t = String(tipo).toLowerCase();
  return t.includes('retiro') || t.includes('devolu') || t.includes('traslado');
};

/**
 * Extrae el horario real de un movimiento únicamente si existe un dato confiable.
 * REGLA: No asume created_at como horario real de entrega/retiro.
 * 
 * @param {Object} mov 
 * @returns {{ hora: string, isFueraDeCorte: boolean } | null}
 */
export const getMovimientoHoraReal = (mov) => {
  if (!mov) return null;

  // 1. Revisar si existe una propiedad explícita de hora en el registro
  const directCandidate = mov.hora_real || mov.hora_movimiento || mov.horario || mov.hora;
  let rawTimeStr = null;

  if (typeof directCandidate === 'string' && directCandidate.trim()) {
    const trimmed = directCandidate.trim();
    // Validar formato HH:mm o HH:mm:ss
    const matchTime = trimmed.match(/^([01]?[0-9]|2[0-3]):([0-5][0-9])/);
    if (matchTime) {
      rawTimeStr = `${matchTime[1].padStart(2, '0')}:${matchTime[2]}`;
    }
  }

  // 2. Si no hay campo directo, buscar patrón explícito en observaciones (ej: "[16:30]", "Hora: 16:30", "16:30 hs", "a las 15:45")
  if (!rawTimeStr && typeof mov.observaciones === 'string' && mov.observaciones.trim()) {
    const obs = mov.observaciones.trim();
    // Patrones específicos de hora escrita por el operador
    const patterns = [
      /(?:\[|\()([01]?[0-9]|2[0-3]):([0-5][0-9])(?:\s*(?:hs|hrs|h))?(?:\]|\))/i,
      /(?:hora|horario|a las|salida|entrega|retiro)\s*[:=]?\s*([01]?[0-9]|2[0-3]):([0-5][0-9])(?:\s*(?:hs|hrs|h))?/i,
      /\b([01]?[0-9]|2[0-3]):([0-5][0-9])\s*(?:hs|hrs|h)\b/i
    ];

    for (const pat of patterns) {
      const match = obs.match(pat);
      if (match) {
        rawTimeStr = `${match[1].padStart(2, '0')}:${match[2]}`;
        break;
      }
    }
  }

  if (!rawTimeStr) return null;

  // Evaluar si es "Fuera de corte" (posterior a las 15:00)
  const [h, m] = rawTimeStr.split(':').map(Number);
  const totalMinutes = (h * 60) + m;
  const isFueraDeCorte = totalMinutes > (15 * 60); // Después de las 15:00

  return {
    hora: rawTimeStr,
    isFueraDeCorte
  };
};

/**
 * Extrae la información limpia de etiquetas y motivos en observaciones, así como estilos visuales
 */
export const getMovementDisplayInfo = (mov) => {
  const rawTipo = (mov?.tipo_movimiento || '').trim();
  const obs = (mov?.observaciones || '').trim();
  let tagTitle = '';
  let subDetail = '';
  let cleanObs = obs;

  const match = obs.match(/^\[(.*?):?\s*(.*?)\]\s*(.*)/s);
  if (match) {
    const bracketHeader = match[1].trim();
    const bracketSub = match[2].trim();
    const restText = match[3].trim();

    if (bracketSub) {
      subDetail = bracketSub;
    }

    if (bracketHeader && bracketHeader.toLowerCase() !== 'otra gestión' && bracketHeader.toLowerCase() !== 'otra gestion') {
      tagTitle = bracketHeader;
    }

    cleanObs = restText || '';
  }

  let displayTitle = tagTitle || rawTipo || 'Otra gestión';
  const tLower = displayTitle.toLowerCase();
  
  if (rawTipo === 'Otra gestión' || tLower.includes('otra gestión') || tLower.includes('otra gestion') || displayTitle.length > 25) {
    displayTitle = 'Otra gestión';
  }

  const t = displayTitle.toLowerCase();

  // Estilos por defecto para "Otra gestión" (Morado/Púrpura)
  let bgClass = 'bg-purple-50 text-purple-800 border-purple-200/80 dark:bg-purple-950/80 dark:text-purple-300 dark:border-purple-800 rounded-md font-extrabold';
  let inlineHtml = 'padding:3px 8px;border-radius:5px;background:#f3e8ff;color:#6b21a8;font-size:10px;line-height:13px;font-weight:800;border:1px solid #d8b4fe;display:inline-block;white-space:nowrap;';
  let pdfBadgeColor = [107, 33, 168]; // Purple-800
  let pdfBadgeBg = [243, 232, 255]; // Purple-100

  if (isEntrega(t)) {
    bgClass = 'bg-blue-50 text-blue-700 border-blue-200/80 dark:bg-blue-950/80 dark:text-blue-300 dark:border-blue-800 rounded-md font-extrabold';
    inlineHtml = 'padding:3px 8px;border-radius:5px;background:#eff6ff;color:#2563eb;font-size:10px;line-height:13px;font-weight:800;border:1px solid #bfdbfe;display:inline-block;white-space:nowrap;';
    pdfBadgeColor = [37, 99, 235];
    pdfBadgeBg = [239, 246, 255];
  } else if (isRetiro(t)) {
    bgClass = 'bg-indigo-50 text-indigo-700 border-indigo-200/80 dark:bg-indigo-950/80 dark:text-indigo-300 dark:border-indigo-800 rounded-md font-extrabold';
    inlineHtml = 'padding:3px 8px;border-radius:5px;background:#eef2ff;color:#4f46e5;font-size:10px;line-height:13px;font-weight:800;border:1px solid #c7d2fe;display:inline-block;white-space:nowrap;';
    pdfBadgeColor = [79, 70, 229];
    pdfBadgeBg = [238, 242, 255];
  } else if (t.includes('esterili')) {
    bgClass = 'bg-emerald-50 text-emerald-700 border-emerald-200/80 dark:bg-emerald-950/80 dark:text-emerald-300 dark:border-emerald-800 rounded-md font-extrabold';
    inlineHtml = 'padding:3px 8px;border-radius:5px;background:#ecfdf5;color:#047857;font-size:10px;line-height:13px;font-weight:800;border:1px solid #a7f3d0;display:inline-block;white-space:nowrap;';
    pdfBadgeColor = [4, 120, 87];
    pdfBadgeBg = [236, 253, 245];
  } else if (t.includes('docu')) {
    bgClass = 'bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200/80 dark:bg-fuchsia-950/80 dark:text-fuchsia-300 dark:border-fuchsia-800 rounded-md font-extrabold';
    inlineHtml = 'padding:3px 8px;border-radius:5px;background:#fdf4ff;color:#a21caf;font-size:10px;line-height:13px;font-weight:800;border:1px solid #f5d0fe;display:inline-block;white-space:nowrap;';
    pdfBadgeColor = [162, 28, 175];
    pdfBadgeBg = [253, 244, 255];
  } else if (t.includes('inciden')) {
    bgClass = 'bg-rose-50 text-rose-700 border-rose-200/80 dark:bg-rose-950/80 dark:text-rose-300 dark:border-rose-800 rounded-md font-extrabold';
    inlineHtml = 'padding:3px 8px;border-radius:5px;background:#fff1f2;color:#be123c;font-size:10px;line-height:13px;font-weight:800;border:1px solid #fecdd3;display:inline-block;white-space:nowrap;';
    pdfBadgeColor = [190, 18, 60];
    pdfBadgeBg = [255, 241, 242];
  }

  const horaInfo = getMovimientoHoraReal(mov);

  return {
    displayTitle,
    cleanObs,
    subDetail,
    bgClass,
    inlineHtml,
    pdfBadgeColor,
    pdfBadgeBg,
    horaInfo
  };
};

/**
 * Calcula las estadísticas agregadas operativas de la lista de movimientos
 */
export const computeLogisticaStats = (movimientos = []) => {
  let totalEntregas = 0;
  let totalRetiros = 0;
  let totalPendientes = 0;
  let totalCajas = 0;
  let totalBultos = 0;

  for (const mov of movimientos) {
    const rawTipo = mov.tipo_movimiento || '';
    if (isEntrega(rawTipo)) totalEntregas++;
    if (isRetiro(rawTipo)) totalRetiros++;
    if (mov.tiene_pendiente) totalPendientes++;
    totalCajas += Number(mov.cantidad_cajas) || 0;
    totalBultos += Number(mov.cantidad_bultos) || 0;
  }

  return {
    totalMovimientos: movimientos.length,
    totalEntregas,
    totalRetiros,
    totalPendientes,
    totalCajas,
    totalBultos
  };
};

/**
 * Agrupa los movimientos por Entidad / Institución y calcula métricas por entidad.
 * Ordena internamente por horario real si existe, sin asumir created_at como hora operativa.
 */
export const groupMovimientosByEntidad = (movimientos = []) => {
  const map = new Map();

  movimientos.forEach((mov, index) => {
    const entidad = (mov.institucion_snapshot || mov.destino || 'Sin Institución Asignada').trim();
    
    if (!map.has(entidad)) {
      map.set(entidad, {
        entidad,
        entregas: 0,
        retiros: 0,
        cajas: 0,
        bultos: 0,
        pendientes: 0,
        movimientos: []
      });
    }

    const group = map.get(entidad);
    const rawTipo = mov.tipo_movimiento || '';
    
    if (isEntrega(rawTipo)) group.entregas++;
    if (isRetiro(rawTipo)) group.retiros++;
    if (mov.tiene_pendiente) group.pendientes++;
    group.cajas += Number(mov.cantidad_cajas) || 0;
    group.bultos += Number(mov.cantidad_bultos) || 0;

    group.movimientos.push({
      ...mov,
      _originalIndex: index,
      _horaInfo: getMovimientoHoraReal(mov)
    });
  });

  const groups = Array.from(map.values());

  // Ordenar entidades alfabéticamente
  groups.sort((a, b) => a.entidad.localeCompare(b.entidad, 'es', { sensitivity: 'base' }));

  // Ordenar movimientos internos por hora real si existe en ambos, o mantener el orden estable original
  groups.forEach(g => {
    g.movimientos.sort((a, b) => {
      const horaA = a._horaInfo?.hora;
      const horaB = b._horaInfo?.hora;

      if (horaA && horaB) {
        return horaA.localeCompare(horaB);
      }
      if (horaA && !horaB) return -1;
      if (!horaA && horaB) return 1;

      return a._originalIndex - b._originalIndex;
    });
  });

  return groups;
};
