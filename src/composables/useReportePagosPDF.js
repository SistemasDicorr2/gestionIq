// src/composables/useReportePagosPDF.js
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export function useReportePagosPDF() {
  const generarReportePagos = ({ instrumentador, liquidaciones, periodoLabel, incluirComprobantes = false }) => {
    // 1. Crear documento PDF A4 vertical
    const doc = new jsPDF('p', 'mm', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    // Colores corporativos Districorr
    const colorPrimary = [15, 23, 42]; // #0f172a (Deep Navy)
    const colorAccent = [30, 58, 138]; // #1e3a8a (Corporate Blue)
    const colorSubtle = [100, 116, 139]; // #64748b (Slate 500)
    const colorLightBg = [248, 250, 252]; // #f8fafc

    // 2. Encabezado Corporativo Districorr
    doc.setFillColor(...colorPrimary);
    doc.rect(0, 0, pageWidth, 28, 'F');

    // Título Principal
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('DISTRICORR — GESTIÓN IQ', 14, 13);

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text('INFORME HISTÓRICO DE PAGOS Y LIQUIDACIONES', 14, 20);
    doc.text('www.districorr.com.ar', pageWidth - 14, 20, { align: 'right' });

    // 3. Bloque de Información del Instrumentador
    let yPos = 36;

    doc.setFillColor(...colorLightBg);
    doc.roundedRect(14, yPos, pageWidth - 28, 24, 3, 3, 'F');
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(14, yPos, pageWidth - 28, 24, 3, 3, 'D');

    doc.setTextColor(...colorPrimary);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    const nombre = instrumentador?.nombre_completo || instrumentador?.nombre || 'Instrumentador Quirúrgico';
    doc.text(`Instrumentador: ${nombre}`, 18, yPos + 8);

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...colorSubtle);
    doc.text(`DNI: ${instrumentador?.dni || 'N/A'}`, 18, yPos + 16);
    doc.text(`Período consultado: ${periodoLabel}`, pageWidth / 2, yPos + 8);
    doc.text(`Fecha de emisión: ${new Date().toLocaleDateString('es-AR')}`, pageWidth / 2, yPos + 16);

    yPos += 30;

    // 4. Cómputo de Totales
    const totalLiquidaciones = liquidaciones.length;
    const totalCirugias = liquidaciones.reduce((sum, l) => sum + (l.cirugias?.length || l.pacientes?.length || 1), 0);
    const totalMonto = liquidaciones.reduce((sum, l) => sum + (l.monto_total || 0), 0);
    const tieneMontos = liquidaciones.some(l => l.has_monto || l.monto_total > 0);

    // Kpis del Reporte
    doc.setFillColor(241, 245, 249);
    doc.roundedRect(14, yPos, 56, 16, 2, 2, 'F');
    doc.roundedRect(76, yPos, 56, 16, 2, 2, 'F');
    doc.roundedRect(138, yPos, 58, 16, 2, 2, 'F');

    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...colorSubtle);
    doc.text('TOTAL LIQUIDACIONES', 18, yPos + 5);
    doc.text('TOTAL CIRUGÍAS', 80, yPos + 5);
    doc.text('MONTO ESTIMADO', 142, yPos + 5);

    doc.setFontSize(11);
    doc.setTextColor(...colorPrimary);
    doc.text(String(totalLiquidaciones), 18, yPos + 12);
    doc.text(String(totalCirugias), 80, yPos + 12);
    doc.text(tieneMontos ? `$ ${totalMonto.toLocaleString('es-AR')}` : 'Sin datos de monto', 142, yPos + 12);

    yPos += 22;

    // 5. Tabla de Liquidaciones (autoTable)
    const tableBody = liquidaciones.map(liq => {
      const fecha = liq.fecha_pago ? new Date(liq.fecha_pago).toLocaleDateString('es-AR', { timeZone: 'UTC' }) : 'Pendiente';
      const ref = liq.orden_de_pago_id ? `Orden #${liq.orden_de_pago_id}` : 'Liquidación';
      const pacientes = (liq.pacientes || []).join(', ') || 'Cirugía autorizada';
      const cantCirugias = `${liq.cirugias?.length || 1} cirugía(s)`;
      const estado = liq.comprobante_object_key ? 'Comprobante cargado' : 'Abonado';
      const monto = liq.monto_total > 0 ? `$ ${liq.monto_total.toLocaleString('es-AR')}` : '-';

      return [
        fecha,
        ref,
        `${pacientes}\n(${cantCirugias})`,
        estado,
        monto
      ];
    });

    autoTable(doc, {
      startY: yPos,
      head: [['Fecha', 'Referencia', 'Pacientes / Cirugías', 'Estado', 'Monto Total']],
      body: tableBody,
      theme: 'grid',
      headStyles: {
        fillColor: colorAccent,
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 9,
        halign: 'left',
      },
      bodyStyles: {
        fontSize: 8.5,
        textColor: [30, 41, 59],
        cellPadding: 3.5,
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252],
      },
      columnStyles: {
        0: { cellWidth: 26 },
        1: { cellWidth: 32 },
        2: { cellWidth: 'auto' },
        3: { cellWidth: 36 },
        4: { cellWidth: 28, halign: 'right', fontStyle: 'bold' },
      },
      margin: { left: 14, right: 14 },
    });

    // 6. Pie de Página Formal
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setDrawColor(226, 232, 240);
      doc.line(14, pageHeight - 14, pageWidth - 14, pageHeight - 14);

      doc.setFontSize(7.5);
      doc.setTextColor(...colorSubtle);
      doc.setFont('helvetica', 'normal');
      doc.text(
        'Este reporte resume las liquidaciones registradas en el sistema Gestión IQ para Districorr. No reemplaza recibos de sueldo ni documentación fiscal.',
        14,
        pageHeight - 8
      );
      doc.text(`Página ${i} de ${pageCount}`, pageWidth - 14, pageHeight - 8, { align: 'right' });
    }

    // 7. Descargar PDF
    const cleanNombre = nombre.replace(/[^a-zA-Z0-9]/g, '_');
    const filename = `Reporte_Pagos_Districorr_${cleanNombre}.pdf`;
    doc.save(filename);
  };

  return {
    generarReportePagos
  };
}
