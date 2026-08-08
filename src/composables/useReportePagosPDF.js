// src/composables/useReportePagosPDF.js
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export function useReportePagosPDF() {
  const generarReportePagos = ({ instrumentador, liquidaciones, periodoLabel, incluirComprobantes = false }) => {
    // 1. Crear documento PDF A4 vertical
    const doc = new jsPDF('p', 'mm', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    // Paleta de colores ejecutiva Districorr
    const colorPrimary = [15, 23, 42];    // Slate 900 (Deep Navy)
    const colorAccent = [30, 58, 138];    // Blue 900 (Corporate Accent)
    const colorSubtle = [100, 116, 139];  // Slate 500
    const colorLightBg = [248, 250, 252]; // Slate 50

    // 2. Encabezado Ejecutivo
    doc.setFillColor(...colorPrimary);
    doc.rect(0, 0, pageWidth, 28, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(15);
    doc.setFont('helvetica', 'bold');
    doc.text('DISTRICORR — GESTIÓN IQ', 14, 13);

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text('REPORTE HISTÓRICO DE PAGOS Y CIRUGÍAS', 14, 20);
    doc.text('www.districorr.com.ar', pageWidth - 14, 20, { align: 'right' });

    // 3. Ficha de Datos del Instrumentador
    let yPos = 35;

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
    doc.text(`DNI: ${instrumentador?.dni || 'No especificado'}`, 18, yPos + 16);
    doc.text(`Período consultado: ${periodoLabel}`, pageWidth / 2, yPos + 8);
    doc.text(`Fecha de emisión: ${new Date().toLocaleDateString('es-AR')}`, pageWidth / 2, yPos + 16);

    yPos += 30;

    // 4. Métricas / KPIs del Reporte
    const totalPagos = liquidaciones.length;
    const totalCirugias = liquidaciones.reduce((sum, l) => sum + (l.cirugias?.length || l.pacientes?.length || 1), 0);
    const totalMonto = liquidaciones.reduce((sum, l) => sum + (l.monto_total || 0), 0);
    const tieneMontos = liquidaciones.some(l => l.has_monto || l.monto_total > 0);

    const cardWidth = (pageWidth - 28 - 8) / 3;

    // Card 1: Total Pagos
    doc.setFillColor(241, 245, 249);
    doc.roundedRect(14, yPos, cardWidth, 16, 2, 2, 'F');
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...colorSubtle);
    doc.text('TOTAL ÓRDENES / PAGOS', 18, yPos + 5);
    doc.setFontSize(11);
    doc.setTextColor(...colorPrimary);
    doc.text(String(totalPagos), 18, yPos + 12);

    // Card 2: Total Cirugías
    doc.setFillColor(241, 245, 249);
    doc.roundedRect(14 + cardWidth + 4, yPos, cardWidth, 16, 2, 2, 'F');
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...colorSubtle);
    doc.text('CIRUGÍAS ABONADAS', 18 + cardWidth + 4, yPos + 5);
    doc.setFontSize(11);
    doc.setTextColor(...colorPrimary);
    doc.text(String(totalCirugias), 18 + cardWidth + 4, yPos + 12);

    // Card 3: Monto Total
    doc.setFillColor(241, 245, 249);
    doc.roundedRect(14 + (cardWidth + 4) * 2, yPos, cardWidth, 16, 2, 2, 'F');
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...colorSubtle);
    doc.text('MONTO TOTAL LIQUIDADO', 18 + (cardWidth + 4) * 2, yPos + 5);
    doc.setFontSize(11);
    doc.setTextColor(...colorPrimary);
    doc.text(tieneMontos ? `$ ${totalMonto.toLocaleString('es-AR')}` : 'Procesado', 18 + (cardWidth + 4) * 2, yPos + 12);

    yPos += 22;

    // 5. Formatear las filas del reporte de forma limpia y legible
    const tableBody = liquidaciones.map(liq => {
      // Fecha de pago/emisión
      let fechaStr = 'No disponible';
      if (liq.fecha_pago) {
        const d = new Date(liq.fecha_pago);
        if (!isNaN(d.getTime())) {
          fechaStr = d.toLocaleDateString('es-AR', { timeZone: 'UTC' });
        }
      }

      // Orden / Referencia
      const ordenRef = liq.orden_de_pago_id 
        ? `Orden de pago #${liq.orden_de_pago_id}` 
        : 'Pago de honorarios';

      // Lista limpia de pacientes referidos con sus montos individuales
      let pacientesDetalle = '';
      if (liq.cirugias && liq.cirugias.length > 0) {
        pacientesDetalle = liq.cirugias.map(c => {
          const pNombre = c.paciente || 'Paciente no especificado';
          const pMonto = parseFloat(c.monto || c.monto_liquidado || c.honorarios || c.monto_a_pagar);
          const montoStr = (!isNaN(pMonto) && pMonto > 0) ? ` — $ ${pMonto.toLocaleString('es-AR')}` : '';
          return `• ${pNombre}${montoStr}`;
        }).join('\n');
      } else if (liq.pacientes && liq.pacientes.length > 0) {
        pacientesDetalle = liq.pacientes.map(p => `• ${p}`).join('\n');
      } else {
        pacientesDetalle = '• Cirugía autorizada';
      }

      // Estado sin hashes UUID ni strings técnicos
      const estadoComp = liq.comprobante_object_key ? 'Comprobante cargado' : 'Pago verificado';

      // Monto total acumulado de la orden
      const montoStr = (liq.monto_total && liq.monto_total > 0) 
        ? `$ ${liq.monto_total.toLocaleString('es-AR')}` 
        : '-';

      return [
        fechaStr,
        ordenRef,
        pacientesDetalle,
        estadoComp,
        montoStr
      ];
    });

    // 6. Generar Tabla con AutoTable
    autoTable(doc, {
      startY: yPos,
      head: [['Fecha', 'Referencia', 'Pacientes / Cirugías Abonadas', 'Comprobante', 'Monto Total']],
      body: tableBody,
      theme: 'grid',
      headStyles: {
        fillColor: colorAccent,
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 8.5,
        halign: 'left',
      },
      bodyStyles: {
        fontSize: 8,
        textColor: [30, 41, 59],
        cellPadding: 4,
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252],
      },
      columnStyles: {
        0: { cellWidth: 24 },
        1: { cellWidth: 35 },
        2: { cellWidth: 'auto' },
        3: { cellWidth: 34 },
        4: { cellWidth: 26, halign: 'right', fontStyle: 'bold' },
      },
      margin: { left: 14, right: 14 },
    });

    // 7. Pie de Página Formal
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setDrawColor(226, 232, 240);
      doc.line(14, pageHeight - 14, pageWidth - 14, pageHeight - 14);

      doc.setFontSize(7.5);
      doc.setTextColor(...colorSubtle);
      doc.setFont('helvetica', 'normal');
      doc.text(
        'Este documento resume la actividad y pagos registrados en el sistema Gestión IQ para Districorr. No reemplaza comprobantes fiscales oficiales.',
        14,
        pageHeight - 8
      );
      doc.text(`Página ${i} de ${pageCount}`, pageWidth - 14, pageHeight - 8, { align: 'right' });
    }

    // 8. Descargar PDF
    const cleanNombre = nombre.replace(/[^a-zA-Z0-9]/g, '_');
    const filename = `Reporte_Pagos_${cleanNombre}.pdf`;
    doc.save(filename);
  };

  return {
    generarReportePagos
  };
}
