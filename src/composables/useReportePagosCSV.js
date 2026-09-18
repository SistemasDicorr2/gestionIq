// src/composables/useReportePagosCSV.js

/**
 * Utility para exportar reporte completo de pagos y cirugías en formato CSV optimizado para análisis profundo de IA y BI.
 * Genera un archivo CSV estándar RFC 4180 con UTF-8 BOM, incluyendo todas las dimensiones y métricas desagregadas.
 */

// Función auxiliar para escapar valores en formato CSV
function escapeCsvValue(val) {
  if (val === null || val === undefined) return '""';
  const str = String(val);
  // Si contiene comillas, saltos de línea o delimitadores (coma o punto y coma), envolver en comillas dobles y duplicar comillas internas
  if (str.includes('"') || str.includes(',') || str.includes(';') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return `"${str}"`;
}

function formatDateIso(val) {
  if (!val) return '';
  const d = new Date(val);
  if (isNaN(d.getTime())) {
    // Si ya es YYYY-MM-DD
    if (typeof val === 'string' && /^\d{4}-\d{2}-\d{2}/.test(val)) {
      return val.substring(0, 10);
    }
    return String(val);
  }
  return d.toISOString().split('T')[0];
}

function formatDateArg(val) {
  if (!val) return '';
  const parts = String(val).substring(0, 10).split('-');
  if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
  const d = new Date(val);
  if (!isNaN(d.getTime())) {
    return d.toLocaleDateString('es-AR', { timeZone: 'UTC' });
  }
  return String(val);
}

function cleanNumber(val) {
  if (val === null || val === undefined || val === '') return 0;
  const num = parseFloat(val);
  return isNaN(num) ? 0 : Number(num.toFixed(2));
}

export function useReportePagosCSV() {
  /**
   * Genera y descarga el archivo CSV con toda la información detallada de órdenes, instrumentadores y cirugías
   * @param {Object} params
   * @param {Array} params.ordenesDetalladas - Listado de órdenes con estructura detallada (pagos y cirugías)
   * @param {string} params.periodoLabel - Etiqueta del período consultado
   * @param {Object|null} params.instrumentadorFiltro - Filtro aplicado ({ dni, nombre }) o null
   * @param {string} params.generatedBy - Identificador de sistema / usuario
   */
  const exportarReportePagosCSV = ({
    ordenesDetalladas = [],
    periodoLabel = 'Período',
    instrumentadorFiltro = null,
    generatedBy = 'Gestión IQ'
  }) => {
    if (!ordenesDetalladas || ordenesDetalladas.length === 0) {
      throw new Error('No hay órdenes de pago disponibles para exportar.');
    }

    const headers = [
      'orden_id',
      'orden_fecha_emision',
      'orden_fecha_emision_formato_ar',
      'orden_monto_total',
      'orden_notas',
      'orden_tiene_comprobante',
      'orden_comprobante_key',
      'instrumentador_nombre',
      'instrumentador_dni',
      'instrumentador_monto_total_orden',
      'item_numero',
      'cirugia_id',
      'cirugia_fecha',
      'cirugia_fecha_formato_ar',
      'cirugia_paciente',
      'cirugia_medico',
      'cirugia_institucion',
      'cirugia_tipo_procedimiento',
      'cirugia_monto_liquidado',
      'cirugia_observaciones',
      'periodo_consultado',
      'alcance_filtro',
      'fecha_exportacion_iso',
      'sistema_origen'
    ];

    const rows = [];
    const nowIso = new Date().toISOString();
    const alcanceFiltroStr = instrumentadorFiltro?.dni && instrumentadorFiltro.dni !== 'todos'
      ? `${instrumentadorFiltro.nombre || 'Instrumentador'} (DNI: ${instrumentadorFiltro.dni})`
      : 'Todos los instrumentadores';

    ordenesDetalladas.forEach((orden) => {
      const ordenId = orden.id || 'S/N';
      const ordenFechaEmision = formatDateIso(orden.fecha_emision);
      const ordenFechaEmisionAr = formatDateArg(orden.fecha_emision);
      const ordenMontoTotal = cleanNumber(orden.monto_total_general || orden.monto_total || 0);
      const ordenNotas = (orden.notas || '').trim();
      const ordenComprobanteKey = orden.comprobante_object_key || orden.comprobante_url || '';
      const ordenTieneComprobante = ordenComprobanteKey ? 'SI' : 'NO';

      const pagos = orden.pagos_instrumentadores || orden.pagos || [];
      
      // Filtrar por instrumentador si corresponde
      const pagosFiltrados = instrumentadorFiltro?.dni && instrumentadorFiltro.dni !== 'todos'
        ? pagos.filter(p => String(p.instrumentador_dni).trim() === String(instrumentadorFiltro.dni).trim())
        : pagos;

      if (pagosFiltrados.length === 0) {
        // En caso de que no haya desglose de pagos, exportar fila de orden base para no perder datos
        rows.push([
          escapeCsvValue(ordenId),
          escapeCsvValue(ordenFechaEmision),
          escapeCsvValue(ordenFechaEmisionAr),
          escapeCsvValue(ordenMontoTotal),
          escapeCsvValue(ordenNotas),
          escapeCsvValue(ordenTieneComprobante),
          escapeCsvValue(ordenComprobanteKey),
          escapeCsvValue(orden.instrumentadores_nombres || 'No especificado'),
          escapeCsvValue(orden.instrumentadores_dnis || ''),
          escapeCsvValue(ordenMontoTotal),
          escapeCsvValue(1),
          escapeCsvValue(`ORD-${ordenId}`),
          escapeCsvValue(ordenFechaEmision),
          escapeCsvValue(ordenFechaEmisionAr),
          escapeCsvValue('Liquidación Consolidada'),
          escapeCsvValue(''),
          escapeCsvValue(''),
          escapeCsvValue('Liquidación de Actividad Quirúrgica'),
          escapeCsvValue(ordenMontoTotal),
          escapeCsvValue(''),
          escapeCsvValue(periodoLabel),
          escapeCsvValue(alcanceFiltroStr),
          escapeCsvValue(nowIso),
          escapeCsvValue(generatedBy)
        ].join(','));
        return;
      }

      pagosFiltrados.forEach((pago) => {
        const instNombre = (pago.instrumentador_nombre || orden.instrumentadores_nombres || 'Instrumentador').trim();
        const instDni = String(pago.instrumentador_dni || orden.instrumentadores_dnis || '').trim();
        const instMontoTotal = cleanNumber(pago.monto_total_instrumentador || pago.monto_total || ordenMontoTotal);

        const cirugias = pago.cirugias || pago.reportes || [];

        if (cirugias.length === 0) {
          // Si el pago no tiene cirugías anidadas
          rows.push([
            escapeCsvValue(ordenId),
            escapeCsvValue(ordenFechaEmision),
            escapeCsvValue(ordenFechaEmisionAr),
            escapeCsvValue(ordenMontoTotal),
            escapeCsvValue(ordenNotas),
            escapeCsvValue(ordenTieneComprobante),
            escapeCsvValue(ordenComprobanteKey),
            escapeCsvValue(instNombre),
            escapeCsvValue(instDni),
            escapeCsvValue(instMontoTotal),
            escapeCsvValue(1),
            escapeCsvValue(`ORD-${ordenId}`),
            escapeCsvValue(ordenFechaEmision),
            escapeCsvValue(ordenFechaEmisionAr),
            escapeCsvValue('Liquidación directa'),
            escapeCsvValue(''),
            escapeCsvValue(''),
            escapeCsvValue('Honorarios Instrumentación'),
            escapeCsvValue(instMontoTotal),
            escapeCsvValue(''),
            escapeCsvValue(periodoLabel),
            escapeCsvValue(alcanceFiltroStr),
            escapeCsvValue(nowIso),
            escapeCsvValue(generatedBy)
          ].join(','));
          return;
        }

        cirugias.forEach((cirugia, idx) => {
          const cirugiaId = cirugia.id_cirugia || (cirugia.id ? `CX-${cirugia.id}` : `ITEM-${idx + 1}`);
          const cirugiaFecha = formatDateIso(cirugia.fecha_cirugia || orden.fecha_emision);
          const cirugiaFechaAr = formatDateArg(cirugia.fecha_cirugia || orden.fecha_emision);
          const cirugiaPaciente = (cirugia.paciente || 'Paciente no especificado').trim();
          const cirugiaMedico = (cirugia.medico || cirugia.cirujano || '').trim();
          const cirugiaInstitucion = (cirugia.institucion || cirugia.sanatorio || cirugia.lugar_cirugia || cirugia.lugar || '').trim();
          const cirugiaTipo = (cirugia.tipo_cirugia || cirugia.procedimiento || cirugia.tipo || '').trim();
          
          const cirugiaMonto = cleanNumber(
            cirugia.monto_final !== undefined 
              ? cirugia.monto_final 
              : (cirugia.monto_a_pagar || cirugia.monto || cirugia.honorarios || 0)
          );

          const cirugiaObservaciones = (cirugia.observaciones || cirugia.notas || '').trim();

          rows.push([
            escapeCsvValue(ordenId),
            escapeCsvValue(ordenFechaEmision),
            escapeCsvValue(ordenFechaEmisionAr),
            escapeCsvValue(ordenMontoTotal),
            escapeCsvValue(ordenNotas),
            escapeCsvValue(ordenTieneComprobante),
            escapeCsvValue(ordenComprobanteKey),
            escapeCsvValue(instNombre),
            escapeCsvValue(instDni),
            escapeCsvValue(instMontoTotal),
            escapeCsvValue(idx + 1),
            escapeCsvValue(cirugiaId),
            escapeCsvValue(cirugiaFecha),
            escapeCsvValue(cirugiaFechaAr),
            escapeCsvValue(cirugiaPaciente),
            escapeCsvValue(cirugiaMedico),
            escapeCsvValue(cirugiaInstitucion),
            escapeCsvValue(cirugiaTipo),
            escapeCsvValue(cirugiaMonto),
            escapeCsvValue(cirugiaObservaciones),
            escapeCsvValue(periodoLabel),
            escapeCsvValue(alcanceFiltroStr),
            escapeCsvValue(nowIso),
            escapeCsvValue(generatedBy)
          ].join(','));
        });
      });
    });

    // Armar contenido final CSV con BOM UTF-8 (\uFEFF) para compatibilidad total con Excel y herramientas IA
    const csvContent = '\uFEFF' + [headers.map(h => `"${h}"`).join(','), ...rows].join('\r\n');

    // Nombre de archivo sanitizado
    const sanitizedLabel = periodoLabel.replace(/[^a-zA-Z0-9]/g, '_');
    const filename = `Reporte_Pagos_Consolidado_${sanitizedLabel}.csv`;

    // Disparar descarga en navegador
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    return {
      filename,
      totalRows: rows.length,
      csvContent
    };
  };

  return {
    exportarReportePagosCSV
  };
}
