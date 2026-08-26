// src/composables/useReporteConsolidadoPDF.js
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { normalizeProveedor } from '../utils/logisticaHelpers';

export function useReporteConsolidadoPDF() {
  /**
   * Genera y descarga el reporte PDF consolidado de logística.
   * 
   * @param {Array} data Array de objetos calculados por getMostFrequentDestination
   * @param {string} mode 'consolidado' | 'encomiendas' | 'proveedores'
   * @param {string} fechaRange String indicativo del período del reporte
   */
  const generateConsolidadoPDF = (data = [], mode = 'consolidado', fechaRange = '') => {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const margin = 14;
    const pageWidth = doc.internal.pageSize.getWidth();
    let y = 15;

    // Filtrar según el modo elegido
    let filteredData = [...data];
    let tituloReporte = 'REPORTE CONSOLIDADO COMPLETO DE LOGÍSTICA Y DESPACHOS';

    if (mode === 'encomiendas') {
      tituloReporte = 'REPORTE DE ENVIOS - SOLO ENCOMIENDAS (CUENTA CORRIENTE)';
      filteredData = data.filter(d => normalizeProveedor(d.proveedor) !== 'LOGISTICA CIRUGIA');
    } else if (mode === 'proveedores') {
      tituloReporte = 'REPORTE DE ENVIOS - PROVEEDORES Y LOGISTICA PROPIA';
      filteredData = data.filter(d => normalizeProveedor(d.proveedor) === 'LOGISTICA CIRUGIA');
    }

    // Cabecera institucional
    doc.setFillColor(15, 23, 42); // slate-900
    doc.rect(margin, y, pageWidth - (margin * 2), 22, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(255, 255, 255);
    doc.text('DISTRICORR LOGÍSTICA SALUD', margin + 6, y + 9);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(203, 213, 225); // slate-300
    doc.text(tituloReporte, margin + 6, y + 16);

    // Badge código reporte
    doc.setFillColor(37, 99, 235); // blue-600
    doc.rect(pageWidth - margin - 38, y + 4, 32, 6, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(255, 255, 255);
    doc.text('REG03-LOG-CONS', pageWidth - margin - 22, y + 8, { align: 'center' });

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

    if (fechaRange) {
      doc.text(`Período / Filtro: ${fechaRange}`, pageWidth - margin, y, { align: 'right' });
    }

    y += 6;

    // Resumen numérico rápido
    const totalBultos = filteredData.reduce((acc, d) => acc + (d.bultos || 0), 0);
    const totalProveedores = filteredData.length;

    doc.setFillColor(241, 245, 249); // slate-100
    doc.roundedRect(margin, y, pageWidth - (margin * 2), 12, 2, 2, 'F');

    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text(`Total Bultos / Envíos Registrados: ${totalBultos}`, margin + 6, y + 7.5);
    doc.text(`Empresas / Proveedores Evaluados: ${totalProveedores}`, pageWidth - margin - 6, y + 7.5, { align: 'right' });

    y += 16;

    // Tabla autotable con columna ZONA CONCURRIDA
    const tableHeaders = [
      'EMPRESA / PROVEEDOR',
      'ZONA CONCURRIDA (DESTINO MÁS FRECUENTE)',
      'BULTOS',
      '% PARTIC.',
      'C/C',
      'PAGO DIRECTO'
    ];

    const tableRows = filteredData.map(item => [
      normalizeProveedor(item.proveedor),
      item.zonaConcurrida || 'Sin especificar',
      item.bultos || 0,
      `${item.porcentaje || 0}%`,
      item.cuentaCorriente || 0,
      item.pagoDirecto || 0
    ]);

    autoTable(doc, {
      startY: y,
      head: [tableHeaders],
      body: tableRows,
      theme: 'grid',
      headStyles: {
        fillColor: [30, 41, 59], // slate-800
        textColor: [255, 255, 255],
        fontSize: 8,
        fontStyle: 'bold',
        halign: 'left'
      },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 45 },
        1: { cellWidth: 65, fontStyle: 'normal' },
        2: { halign: 'center', cellWidth: 20, fontStyle: 'bold' },
        3: { halign: 'center', cellWidth: 20 },
        4: { halign: 'center', cellWidth: 15 },
        5: { halign: 'center', cellWidth: 17 }
      },
      styles: {
        fontSize: 8,
        cellPadding: 2.5,
        textColor: [30, 41, 59],
        overflow: 'linebreak'
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252] // slate-50
      },
      margin: { left: margin, right: margin }
    });

    const finalY = doc.lastAutoTable.finalY || (y + 40);

    // Pie de página
    const pageCount = doc.internal.getNumberOfPages();
    const pageHeight = doc.internal.pageSize.getHeight();

    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(148, 163, 184); // slate-400
      doc.line(margin, pageHeight - 12, pageWidth - margin, pageHeight - 12);
      doc.text('DISTRICORR LOGÍSTICA SALUD — SISTEMA GESTIÓN IQ', margin, pageHeight - 7);
      doc.text(`Página ${i} de ${pageCount}`, pageWidth - margin, pageHeight - 7, { align: 'right' });
    }

    const modeTag = mode === 'encomiendas' ? 'Encomiendas' : (mode === 'proveedores' ? 'Proveedores' : 'Completo');
    const filename = `Reporte_Consolidado_Logistica_${modeTag}_${new Date().toISOString().slice(0, 10)}.pdf`;
    doc.save(filename);
  };

  return {
    generateConsolidadoPDF
  };
}
