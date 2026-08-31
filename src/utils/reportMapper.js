// src/utils/reportMapper.js

/**
 * Normaliza cualquier formato de fecha (cadena YYYY-MM-DD, ISO string, Timestamp)
 * evitando desfasajes de zona horaria.
 */
export const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  
  const str = String(dateString).trim();
  
  // Si la fecha viene estrictamente en formato YYYY-MM-DD sin hora
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
    const [year, month, day] = str.split('-');
    return `${day}/${month}/${year}`;
  }
  
  const date = new Date(str);
  if (isNaN(date.getTime())) return 'N/A';
  
  // Si contiene fecha e indicación UTC (T y Z)
  if (str.includes('T') && str.endsWith('Z')) {
    const userTimezoneOffset = date.getTimezoneOffset() * 60000;
    const adjustedDate = new Date(date.getTime() + userTimezoneOffset);
    return adjustedDate.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
  }
  
  return date.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

/**
 * Normaliza la estructura de datos del reporte/cirugía
 * para que tanto el PDF individual como la vista por lote consuman la misma fuente de verdad.
 */
export const normalizeReport = (raw) => {
  if (!raw) return null;
  
  return {
    ...raw,
    id: raw.id,
    id_cirugia: raw.id_cirugia || (raw.id ? `CX-${raw.id}` : 'N/A'),
    paciente: raw.paciente || raw.nombre_paciente || 'Sin especificar',
    medico: raw.medico || raw.medico_nombre || 'Sin especificar',
    tipo_cirugia: raw.tipo_cirugia || raw.procedimiento || 'Sin especificar',
    fecha_cirugia: raw.fecha_cirugia || raw.fecha || null,
    lugar_cirugia: raw.lugar_cirugia || raw.institucion || 'Sin especificar',
    instrumentador_completado: raw.instrumentador_completado || raw.instrumentador_nombre || 'Sin especificar',
    instrumentador_dni: raw.instrumentador_dni || raw.dni_instrumentador || 'N/A',
    fecha_envio: raw.fecha_envio || raw.created_at || null,
    tipo_logistica: raw.tipo_logistica || 'sin_logistica',
    url_firma: raw.url_firma || raw.firma_url || null,
    set_completo: raw.set_completo ?? null,
    informe_faltante: raw.informe_faltante ?? null,
    rating_puntualidad: raw.rating_puntualidad ?? 0,
    rating_condiciones: raw.rating_condiciones ?? 0,
    rating_asesoramiento: raw.rating_asesoramiento ?? 0,
    rating_evaluacion_general: raw.rating_evaluacion_general ?? 0,
    consumo_realizado: raw.consumo_realizado || '',
    observaciones: raw.observaciones || '',
    representante_ventas: raw.representante_ventas || '',
    duracion_cirugia: raw.duracion_cirugia || '',
    transporte_utilizado: raw.transporte_utilizado || ''
  };
};
