// src/composables/useConciliacionPDF.js
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export function useConciliacionPDF() {
  /**
   * Genera el reporte impreso en PDF para la Conciliación de Fletes y Remitos.
   * 
   * @param {Object} summary Objeto procesado por buildConciliacionSummary
   * @param {string} filterText Descripción opcional de los filtros aplicados
   */
  const generateConciliacionPDF = (summary = {}, filterText = '') => {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const margin = 14;
    const pageWidth = doc.internal.pageSize.getWidth();
    let y = 15;

    const stats = summary.stats || {};
    const guiasList = summary.guiasDetalle || [];

    // Cabecera Institucional Corporativa
    doc.setFillColor(15, 23, 42); // slate-900
    doc.rect(margin, y, pageWidth - (margin * 2), 22, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(255, 255, 255);
    doc.text('DISTRICORR LOGÍSTICA SALUD', margin + 6, y + 9);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(203, 213, 225); // slate-300
    doc.text('AUDITORÍA Y CONCILIACIÓN DE FLETES, REMITOS Y PACIENTES', margin + 6, y + 16);

    // Badge código documento
    doc.setFillColor(37, 99, 235); // blue-600
    doc.rect(pageWidth - margin - 40, y + 4, 34, 6, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(255, 255, 255);
    doc.text('REG03-LOG-CONC', pageWidth - margin - 23, y + 8, { align: 'center' });

    y += 28;

    // Metadatos
    const fechaActual = new Date().toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });

    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 41, 59);
    doc.text(`Fecha de Emisión: ${fechaActual}`, margin, y);

    if (filterText) {
      doc.text(`Filtros: ${filterText}`, pageWidth - margin, y, { align: 'right' });
    }

    y += 6;

    // Tarjeta de Totales y Resumen Ejecutivo
    doc.setFillColor(241, 245, 249); // slate-100
    doc.roundedRect(margin, y, pageWidth - (margin * 2), 14, 2, 2, 'F');

    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);

    const formatMoney = (val) => `$ ${Number(val || 0).toLocaleString('es-AR', { minimumFractionDigits: 2 })}`;

    doc.text(`Total Guías: ${stats.totalGuias || 0}`, margin + 5, y + 8.5);
    doc.text(`Total Bultos: ${stats.totalBultos || 0}`, margin + 42, y + 8.5);
    doc.text(`Costo Acumulado: ${formatMoney(stats.totalCosto)}`, margin + 85, y + 8.5);
    doc.text(`Conciliado: ${stats.porcentajeConciliado || 0}%`, pageWidth - margin - 5, y + 8.5, { align: 'right' });

    y += 18;

    // Tabla de detalle de Conciliación
    const tableHeaders = [
      'N° GUÍA',
      'FECHA',
      'TRANSPORTE',
      'CLIENTE / OBRA SOCIAL',
      'MÉDICO',
      'BULTOS',
      'COSTO ($)',
      'ESTADO'
    ];

    const tableRows = guiasList.map(g => [
      g.numero_guia || 'Sin N°',
      g.fecha_envio || '-',
      g.transporte || '-',
      g.cliente || 'Sin cliente',
      g.medico || 'Sin médico',
      g.bultos || 1,
      g.costo ? formatMoney(g.costo) : '$ 0.00',
      g.estado || 'Pendiente'
    ]);

    autoTable(doc, {
      startY: y,
      head: [tableHeaders],
      body: tableRows,
      theme: 'grid',
      headStyles: {
        fillColor: [30, 41, 59], // slate-800
        textColor: [255, 255, 255],
        fontSize: 7.5,
        fontStyle: 'bold',
        halign: 'left'
      },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 26 },
        1: { cellWidth: 18 },
        2: { cellWidth: 26, fontStyle: 'bold' },
        3: { cellWidth: 38 },
        4: { cellWidth: 32 },
        5: { halign: 'center', cellWidth: 13 },
        6: { halign: 'right', cellWidth: 20, fontStyle: 'bold' },
        7: { halign: 'center', cellWidth: 19 }
      },
      styles: {
        fontSize: 7.5,
        cellPadding: 2,
        textColor: [30, 41, 59],
        overflow: 'linebreak'
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252] // slate-50
      },
      margin: { left: margin, right: margin }
    });

    // Pie de página
    const pageCount = doc.internal.getNumberOfPages();
    const pageHeight = doc.internal.pageSize.getHeight();

    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(148, 163, 184); // slate-400
      doc.line(margin, pageHeight - 12, pageWidth - margin, pageHeight - 12);
      doc.text('DISTRICORR LOGÍSTICA SALUD — AUDITORÍA GESTIÓN IQ', margin, pageHeight - 7);
      doc.text(`Página ${i} de ${pageCount}`, pageWidth - margin, pageHeight - 7, { align: 'right' });
    }

    const filename = `Conciliacion_Fletes_Districorr_${new Date().toISOString().slice(0, 10)}.pdf`;
    doc.save(filename);
  };

  return {
    generateConciliacionPDF
  };
}
