// src/services/logisticaPdfGenerator.js

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import {
  formatDate,
  formatDateTime,
  getMovementDisplayInfo,
  computeLogisticaStats,
  groupMovimientosByEntidad
} from './logisticaReportHelpers';

/**
 * Genera el documento PDF vectorial nativo para un Informe Diario de Logística
 * 
 * @param {Object} informe - Registro principal de logistica_informes_diarios
 * @param {Array} movimientos - Lista de movimientos de logistica_informe_movimientos
 * @param {Object} options - Opciones de salida: { save: true } o base64
 */
export function buildLogisticaInformePDF(informe, movimientos = [], options = {}) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
    compress: true
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;
  let currentY = 14;

  const fechaStr = formatDate(informe?.fecha);
  const zonaStr = informe?.zona || 'Formosa Capital';
  const responsableStr = informe?.responsable_nombre || 'Logística Operativa';
  const estadoStr = (informe?.estado || 'ENVIADO').toUpperCase();
  const enviadoTimeStr = informe?.enviado_at 
    ? formatDateTime(informe.enviado_at) 
    : formatDateTime(new Date().toISOString());

  const stats = computeLogisticaStats(movimientos);
  const entityGroups = groupMovimientosByEntidad(movimientos);

  // --- 1. BANNER / ENCABEZADO INSTITUCIONAL CORPORATIVO ---
  doc.setFillColor(20, 32, 51); // Slate-900 / #142033
  doc.rect(margin, currentY, pageWidth - (margin * 2), 22, 'F');

  // Acento superior azul
  doc.setFillColor(37, 99, 235); // Blue-600 / #2563eb
  doc.rect(margin, currentY, pageWidth - (margin * 2), 2, 'F');

  // Título Empresa
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('DISTRICORR · GESTIÓN IQ', margin + 5, currentY + 8.5);

  // Badge Estado
  doc.setFillColor(220, 252, 231); // Emerald-100
  doc.roundedRect(pageWidth - margin - 30, currentY + 4.5, 25, 5.5, 1.2, 1.2, 'F');
  doc.setFontSize(7);
  doc.setTextColor(22, 101, 52); // Emerald-800
  doc.text(estadoStr, pageWidth - margin - 17.5, currentY + 8.3, { align: 'center' });

  // Subtítulo Informe
  doc.setFontSize(9.5);
  doc.setTextColor(203, 213, 225); // Slate-300
  doc.setFont('helvetica', 'normal');
  doc.text(`Informe Diario de Logística Operativa — ${fechaStr}`, margin + 5, currentY + 15.5);

  currentY += 25;

  // --- 2. METADATA SECUNDARIA (Responsable / Zona / Fecha Envío) ---
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105); // Slate-600
  doc.setFont('helvetica', 'bold');
  doc.text(`Responsable: `, margin, currentY);
  doc.setFont('helvetica', 'normal');
  doc.text(responsableStr, margin + 20, currentY);

  doc.setFont('helvetica', 'bold');
  doc.text(`Zona: `, margin + 85, currentY);
  doc.setFont('helvetica', 'normal');
  doc.text(zonaStr, margin + 95, currentY);

  doc.setFont('helvetica', 'bold');
  doc.text(`Enviado: `, pageWidth - margin - 48, currentY);
  doc.setFont('helvetica', 'normal');
  doc.text(enviadoTimeStr, pageWidth - margin - 34, currentY);

  currentY += 6;

  // --- 3. CUADROS KPI RESUMEN OPERATIVO (6 Tarjetas con prioridad visual) ---
  const boxWidth3 = (pageWidth - (margin * 2) - 6) / 3;
  const boxHeight = 11;

  const kpisRow1 = [
    { label: 'ENTREGAS', value: String(stats.totalEntregas), color: [37, 99, 235], bg: [239, 246, 255] },
    { label: 'RETIROS', value: String(stats.totalRetiros), color: [79, 70, 229], bg: [238, 242, 255] },
    { label: 'PENDIENTES', value: String(stats.totalPendientes), color: [180, 83, 9], bg: [254, 243, 199] }
  ];

  const kpisRow2 = [
    { label: 'MOVIMIENTOS (TOTAL)', value: String(stats.totalMovimientos), color: [15, 23, 42], bg: [248, 250, 252] },
    { label: 'CAJAS / EQUIPOS', value: String(stats.totalCajas), color: [79, 70, 229], bg: [248, 250, 252] },
    { label: 'BULTOS', value: String(stats.totalBultos), color: [8, 145, 178], bg: [248, 250, 252] }
  ];

  // Render Fila 1
  kpisRow1.forEach((kpi, idx) => {
    const xPos = margin + (idx * (boxWidth3 + 3));
    doc.setFillColor(kpi.bg[0], kpi.bg[1], kpi.bg[2]);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(xPos, currentY, boxWidth3, boxHeight, 1.5, 1.5, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(kpi.color[0], kpi.color[1], kpi.color[2]);
    doc.text(kpi.value, xPos + 4, currentY + 6.5);

    doc.setFontSize(6.5);
    doc.setTextColor(100, 116, 139);
    doc.text(kpi.label, xPos + 4, currentY + 9.8);
  });

  currentY += boxHeight + 2;

  // Render Fila 2
  kpisRow2.forEach((kpi, idx) => {
    const xPos = margin + (idx * (boxWidth3 + 3));
    doc.setFillColor(kpi.bg[0], kpi.bg[1], kpi.bg[2]);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(xPos, currentY, boxWidth3, boxHeight, 1.5, 1.5, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(kpi.color[0], kpi.color[1], kpi.color[2]);
    doc.text(kpi.value, xPos + 4, currentY + 6.5);

    doc.setFontSize(6.5);
    doc.setTextColor(100, 116, 139);
    doc.text(kpi.label, xPos + 4, currentY + 9.8);
  });

  currentY += boxHeight + 5;

  // --- 4. OBSERVACIÓN GENERAL (Si existe) ---
  if (informe?.observacion_general) {
    doc.setFillColor(239, 246, 255); // Blue-50
    doc.setDrawColor(191, 219, 254); // Blue-200
    
    const obsLines = doc.splitTextToSize(informe.observacion_general, pageWidth - (margin * 2) - 10);
    const obsBoxHeight = Math.max(10, (obsLines.length * 3.5) + 7);

    doc.roundedRect(margin, currentY, pageWidth - (margin * 2), obsBoxHeight, 1.5, 1.5, 'FD');

    // Borde izquierdo resaltado azul
    doc.setFillColor(37, 99, 235);
    doc.rect(margin, currentY, 2, obsBoxHeight, 'F');

    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 64, 175);
    doc.text('Observación General de la Jornada:', margin + 5, currentY + 4.8);

    doc.setFont('helvetica', 'italic');
    doc.setFontSize(7.5);
    doc.setTextColor(51, 65, 85);
    doc.text(obsLines, margin + 5, currentY + 8.5);

    currentY += obsBoxHeight + 5;
  }

  // --- 5. TABLA DETALLE DE MOVIMIENTOS AGRUPADOS POR ENTIDAD ---
  const tableColumns = [
    { header: '#', dataKey: 'idx' },
    { header: 'MOVIMIENTO', dataKey: 'movimiento' },
    { header: 'PACIENTE / CLIENTE', dataKey: 'paciente' },
    { header: 'MÉDICO / DESTINO', dataKey: 'medico' },
    { header: 'OBSERVACIONES / NOVEDAD', dataKey: 'observaciones' },
    { header: 'CAJAS', dataKey: 'cajas' },
    { header: 'BULTOS', dataKey: 'bultos' }
  ];

  let globalMovIndex = 1;
  const tableRows = [];

  entityGroups.forEach(group => {
    // Fila de encabezado de grupo de institución
    tableRows.push({
      _isGroupHeader: true,
      groupTitle: `INSTITUCIÓN: ${group.entidad.toUpperCase()} (${group.movimientos.length} movs | ${group.entregas} entregas, ${group.retiros} retiros | ${group.cajas} cajas, ${group.bultos} bultos${group.pendientes > 0 ? ` | ⚠️ ${group.pendientes} pend.` : ''})`
    });

    group.movimientos.forEach(mov => {
      const info = getMovementDisplayInfo(mov);
      
      // Movimiento badge + hora + fuera de corte + id cirugia
      let movCell = info.displayTitle;
      if (info.horaInfo?.hora) {
        movCell += ` [${info.horaInfo.hora}]`;
      }
      if (info.horaInfo?.isFueraDeCorte) {
        movCell += `\n*FUERA DE CORTE*`;
      }
      if (mov.id_cirugia_snapshot) {
        movCell += `\n(${mov.id_cirugia_snapshot})`;
      }

      // Paciente / Cliente
      let pacCell = mov.paciente_snapshot || mov.destino || 'Sin especificar';
      if (mov.cliente_snapshot) {
        pacCell += `\nCli: ${mov.cliente_snapshot}`;
      }

      // Médico / Destino
      let medCell = mov.medico_snapshot ? `Dr/a: ${mov.medico_snapshot}` : (mov.destino || '-');

      // Observaciones / Motivo / Pendiente
      let obsCell = '';
      if (info.subDetail) {
        obsCell += `Motivo: ${info.subDetail}\n`;
      }
      obsCell += info.cleanObs || (!info.subDetail ? 'Sin notas' : '');
      if (mov.tiene_pendiente) {
        obsCell += `\n⚠️ Pendiente: ${mov.detalle_pendiente || ''}`;
      }

      tableRows.push({
        _isGroupHeader: false,
        idx: String(globalMovIndex++).padStart(2, '0'),
        movimiento: movCell,
        paciente: pacCell,
        medico: medCell,
        observaciones: obsCell,
        cajas: String(mov.cantidad_cajas || 0),
        bultos: String(mov.cantidad_bultos || 0)
      });
    });
  });

  autoTable(doc, {
    head: [tableColumns.map(c => c.header)],
    body: tableRows.map(row => {
      if (row._isGroupHeader) {
        return [{ content: row.groupTitle, colSpan: 7, styles: { fillColor: [241, 245, 249], textColor: [15, 23, 42], fontStyle: 'bold', fontSize: 7.5 } }];
      }
      return tableColumns.map(col => row[col.dataKey]);
    }),
    startY: currentY,
    margin: { left: margin, right: margin },
    styles: {
      fontSize: 7,
      cellPadding: 2.2,
      valign: 'top',
      textColor: [30, 41, 59],
      overflow: 'linebreak'
    },
    headStyles: {
      fillColor: [20, 32, 51], // Slate-900
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 7.5,
      halign: 'left'
    },
    columnStyles: {
      0: { halign: 'center', cellWidth: 8, fontStyle: 'bold', textColor: [148, 163, 184] },
      1: { cellWidth: 32, fontStyle: 'bold' },
      2: { cellWidth: 34 },
      3: { cellWidth: 30 },
      4: { cellWidth: 'auto' },
      5: { halign: 'center', cellWidth: 12, fontStyle: 'bold' },
      6: { halign: 'center', cellWidth: 12, fontStyle: 'bold' }
    }
  });

  currentY = doc.lastAutoTable.finalY + 8;

  // --- 6. TABLA RESUMEN POR ENTIDAD / INSTITUCIÓN (Colocada al final del reporte) ---
  // Verificar si cabe en la página actual o necesita espacio
  if (currentY > pageHeight - 45) {
    doc.addPage();
    currentY = margin;
  }

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('Resumen de Actividad por Institución', margin, currentY + 3);

  currentY += 5;

  const entitySummaryHead = [['ENTIDAD / INSTITUCIÓN', 'ENTREGAS', 'RETIROS', 'CAJAS', 'BULTOS', 'PENDIENTES']];
  const entitySummaryBody = entityGroups.map(g => [
    g.entidad,
    String(g.entregas),
    String(g.retiros),
    String(g.cajas),
    String(g.bultos),
    g.pendientes > 0 ? `⚠️ ${g.pendientes}` : '0'
  ]);

  // Fila de totales para el resumen por entidad
  entitySummaryBody.push([
    'TOTAL GENERAL',
    String(stats.totalEntregas),
    String(stats.totalRetiros),
    String(stats.totalCajas),
    String(stats.totalBultos),
    stats.totalPendientes > 0 ? `⚠️ ${stats.totalPendientes}` : '0'
  ]);

  autoTable(doc, {
    head: entitySummaryHead,
    body: entitySummaryBody,
    startY: currentY,
    margin: { left: margin, right: margin },
    styles: {
      fontSize: 7,
      cellPadding: 2,
      textColor: [30, 41, 59],
      overflow: 'linebreak'
    },
    headStyles: {
      fillColor: [30, 41, 59], // Slate-800
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 7,
      halign: 'left'
    },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 'auto' },
      1: { halign: 'center', cellWidth: 20, fontStyle: 'bold', textColor: [37, 99, 235] },
      2: { halign: 'center', cellWidth: 20, fontStyle: 'bold', textColor: [79, 70, 229] },
      3: { halign: 'center', cellWidth: 18, fontStyle: 'bold' },
      4: { halign: 'center', cellWidth: 18, fontStyle: 'bold' },
      5: { halign: 'center', cellWidth: 24, fontStyle: 'bold', textColor: [180, 83, 9] }
    },
    didParseCell: (data) => {
      // Resaltar la fila de TOTAL GENERAL
      if (data.row.index === entitySummaryBody.length - 1) {
        data.cell.styles.fillColor = [241, 245, 249];
        data.cell.styles.fontStyle = 'bold';
      }
    },
    didDrawPage: (data) => {
      // PIE DE PÁGINA EN TODAS LAS PÁGINAS
      const totalPages = doc.internal.getNumberOfPages();
      doc.setFontSize(7);
      doc.setTextColor(148, 163, 184); // Slate-400
      doc.setFont('helvetica', 'normal');

      // Línea divisoria superior del pie
      doc.setDrawColor(226, 232, 240);
      doc.line(margin, pageHeight - 12, pageWidth - margin, pageHeight - 12);

      doc.text('DISTRICORR · Gestión IQ · Logística Operativa — Documento Oficial Vectorial', margin, pageHeight - 7);
      doc.text(`Página ${data.pageNumber} de ${totalPages}`, pageWidth - margin, pageHeight - 7, { align: 'right' });
    }
  });

  if (options.save) {
    const dateClean = (informe?.fecha || '').replace(/-/g, '_');
    const filename = `Informe_Logistica_${dateClean || 'districorr'}.pdf`;
    doc.save(filename);
  }

  return doc;
}

/**
 * Genera y descarga el archivo PDF
 */
export function generateLogisticaInformePDF(informe, movimientos) {
  return buildLogisticaInformePDF(informe, movimientos, { save: true });
}

/**
 * Genera y retorna el string Base64 del PDF para adjuntar en correo Resend
 */
export function getLogisticaInformePdfBase64(informe, movimientos) {
  try {
    const doc = buildLogisticaInformePDF(informe, movimientos, { save: false });
    const dataUri = doc.output('datauristring');
    if (dataUri && dataUri.includes(',')) {
      return dataUri.split(',')[1];
    }
    return null;
  } catch (err) {
    console.error('[logisticaPdfGenerator] Error generando Base64:', err);
    return null;
  }
}
