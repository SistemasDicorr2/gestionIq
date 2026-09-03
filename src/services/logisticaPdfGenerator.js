// src/services/logisticaPdfGenerator.js

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

/**
 * Formatea una fecha YYYY-MM-DD a DD/MM/YYYY
 */
const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-');
  return `${d}/${m}/${y}`;
};

/**
 * Formatea una fecha/hora ISO a DD/MM/YYYY HH:mm
 */
const formatDateTime = (dateTimeStr) => {
  if (!dateTimeStr) return '';
  const date = new Date(dateTimeStr);
  return date.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' }) + 
         ' ' + 
         date.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
};

/**
 * Extrae la información limpia de etiquetas y motivos en observaciones
 */
const getMovementDisplayInfo = (mov) => {
  let rawTipo = (mov?.tipo_movimiento || '').trim();
  let obs = (mov?.observaciones || '').trim();
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

    if (restText) {
      cleanObs = restText;
    } else {
      cleanObs = '';
    }
  }

  let displayTitle = tagTitle || rawTipo || 'Otra gestión';
  const tLower = displayTitle.toLowerCase();
  
  if (rawTipo === 'Otra gestión' || tLower.includes('otra gestión') || tLower.includes('otra gestion') || displayTitle.length > 25) {
    displayTitle = 'Otra gestión';
  }

  return { displayTitle, cleanObs, subDetail };
};

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

  // --- 1. BANNER / ENCABEZADO INSTITUCIONAL CORPORATIVO ---
  doc.setFillColor(20, 32, 51); // Slate-900 / #142033
  doc.rect(margin, currentY, pageWidth - (margin * 2), 24, 'F');

  // Acento superior azul
  doc.setFillColor(37, 99, 235); // Blue-600 / #2563eb
  doc.rect(margin, currentY, pageWidth - (margin * 2), 2, 'F');

  // Título Empresa
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text('DISTRICORR · GESTIÓN IQ', margin + 6, currentY + 9);

  // Badge Estado
  doc.setFillColor(220, 252, 231); // Emerald-100
  doc.roundedRect(pageWidth - margin - 32, currentY + 5, 26, 6, 1.5, 1.5, 'F');
  doc.setFontSize(7.5);
  doc.setTextColor(22, 101, 52); // Emerald-800
  doc.text(estadoStr, pageWidth - margin - 19, currentY + 9.2, { align: 'center' });

  // Subtítulo Informe
  doc.setFontSize(10);
  doc.setTextColor(203, 213, 225); // Slate-300
  doc.setFont('helvetica', 'normal');
  doc.text(`Informe Diario de Logística Operativa — ${fechaStr}`, margin + 6, currentY + 16);

  currentY += 28;

  // --- 2. METADATA SECUNDARIA (Responsable / Zona / Fecha Envío) ---
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105); // Slate-600
  doc.setFont('helvetica', 'bold');
  doc.text(`Responsable: `, margin, currentY);
  doc.setFont('helvetica', 'normal');
  doc.text(responsableStr, margin + 22, currentY);

  doc.setFont('helvetica', 'bold');
  doc.text(`Zona: `, margin + 90, currentY);
  doc.setFont('helvetica', 'normal');
  doc.text(zonaStr, margin + 101, currentY);

  doc.setFont('helvetica', 'bold');
  doc.text(`Enviado: `, pageWidth - margin - 50, currentY);
  doc.setFont('helvetica', 'normal');
  doc.text(enviadoTimeStr, pageWidth - margin - 35, currentY);

  currentY += 7;

  // --- 3. CUADROS KPI RESUMEN ---
  const totalMovs = movimientos.length;
  const totalCajas = movimientos.reduce((sum, m) => sum + (m.cantidad_cajas || 0), 0);
  const totalBultos = movimientos.reduce((sum, m) => sum + (m.cantidad_bultos || 0), 0);
  const totalPendientes = movimientos.filter(m => m.tiene_pendiente).length;

  const boxWidth = (pageWidth - (margin * 2) - 9) / 4;
  const boxHeight = 14;

  const kpis = [
    { label: 'MOVIMIENTOS', value: String(totalMovs), color: [37, 99, 235], bg: [240, 246, 255] },
    { label: 'CAJAS / EQUIPOS', value: String(totalCajas), color: [79, 70, 229], bg: [245, 243, 255] },
    { label: 'BULTOS', value: String(totalBultos), color: [8, 145, 178], bg: [236, 254, 255] },
    { label: 'PENDIENTES', value: String(totalPendientes), color: [180, 83, 9], bg: [254, 243, 199] }
  ];

  kpis.forEach((kpi, idx) => {
    const xPos = margin + (idx * (boxWidth + 3));
    
    // Fondo de tarjeta
    doc.setFillColor(kpi.bg[0], kpi.bg[1], kpi.bg[2]);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(xPos, currentY, boxWidth, boxHeight, 2, 2, 'FD');

    // Valor número
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(kpi.color[0], kpi.color[1], kpi.color[2]);
    doc.text(kpi.value, xPos + 5, currentY + 8);

    // Label
    doc.setFontSize(6.5);
    doc.setTextColor(100, 116, 139);
    doc.text(kpi.label, xPos + 5, currentY + 11.8);
  });

  currentY += boxHeight + 6;

  // --- 4. OBSERVACIÓN GENERAL (Si existe) ---
  if (informe?.observacion_general) {
    doc.setFillColor(239, 246, 255); // Blue-50
    doc.setDrawColor(191, 219, 254); // Blue-200
    
    const obsLines = doc.splitTextToSize(informe.observacion_general, pageWidth - (margin * 2) - 12);
    const obsBoxHeight = Math.max(12, (obsLines.length * 4) + 8);

    doc.roundedRect(margin, currentY, pageWidth - (margin * 2), obsBoxHeight, 2, 2, 'FD');

    // Borde izquierdo resaltado azul
    doc.setFillColor(37, 99, 235);
    doc.rect(margin, currentY, 2.5, obsBoxHeight, 'F');

    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 64, 175);
    doc.text('Observación General de la Jornada:', margin + 6, currentY + 5.5);

    doc.setFont('helvetica', 'italic');
    doc.setFontSize(8);
    doc.setTextColor(51, 65, 85);
    doc.text(obsLines, margin + 6, currentY + 9.5);

    currentY += obsBoxHeight + 5;
  }

  // --- 5. TABLA VECTORIAL DE MOVIMIENTOS CON jspdf-autotable ---
  const tableColumns = [
    { header: '#', dataKey: 'idx' },
    { header: 'MOVIMIENTO', dataKey: 'movimiento' },
    { header: 'PACIENTE / CLIENTE', dataKey: 'paciente' },
    { header: 'INSTITUCIÓN / MÉDICO', dataKey: 'institucion' },
    { header: 'OBSERVACIONES / NOVEDAD', dataKey: 'observaciones' },
    { header: 'CAJAS', dataKey: 'cajas' },
    { header: 'BULTOS', dataKey: 'bultos' }
  ];

  const tableBody = movimientos.map((mov, index) => {
    const info = getMovementDisplayInfo(mov);
    
    // Movimiento badge + id cirugia
    let movCell = info.displayTitle;
    if (mov.id_cirugia_snapshot) {
      movCell += `\n[${mov.id_cirugia_snapshot}]`;
    }

    // Paciente / Cliente
    let pacCell = mov.paciente_snapshot || mov.destino || 'Sin especificar';
    if (mov.cliente_snapshot) {
      pacCell += `\nCli: ${mov.cliente_snapshot}`;
    }

    // Institución / Médico
    let instCell = mov.institucion_snapshot || 'Sin especificar';
    if (mov.medico_snapshot) {
      instCell += `\nDr/a: ${mov.medico_snapshot}`;
    }

    // Observaciones / Motivo / Pendiente
    let obsCell = '';
    if (info.subDetail) {
      obsCell += `Motivo: ${info.subDetail}\n`;
    }
    obsCell += info.cleanObs || (!info.subDetail ? 'Sin notas' : '');
    if (mov.tiene_pendiente) {
      obsCell += `\n⚠️ Pendiente: ${mov.detalle_pendiente || ''}`;
    }

    return {
      idx: String(index + 1).padStart(2, '0'),
      movimiento: movCell,
      paciente: pacCell,
      institucion: instCell,
      observaciones: obsCell,
      cajas: String(mov.cantidad_cajas || 0),
      bultos: String(mov.cantidad_bultos || 0)
    };
  });

  autoTable(doc, {
    head: [tableColumns.map(c => c.header)],
    body: tableBody.map(row => tableColumns.map(col => row[col.dataKey])),
    startY: currentY,
    margin: { left: margin, right: margin },
    styles: {
      fontSize: 7.5,
      cellPadding: 2.5,
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
      1: { cellWidth: 28, fontStyle: 'bold' },
      2: { cellWidth: 35 },
      3: { cellWidth: 38 },
      4: { cellWidth: 'auto' },
      5: { halign: 'center', cellWidth: 12, fontStyle: 'bold' },
      6: { halign: 'center', cellWidth: 12, fontStyle: 'bold' }
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252]
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
