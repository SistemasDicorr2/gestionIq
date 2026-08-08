// src/composables/useReportePagosPDF.js
import jsPDF from 'jspdf';

export function useReportePagosPDF() {
  const generarReportePagos = ({ instrumentador, liquidaciones, periodoLabel }) => {
    // 1. Crear documento PDF A4 vertical
    const doc = new jsPDF('p', 'mm', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth();   // 210 mm
    const pageHeight = doc.internal.pageSize.getHeight(); // 297 mm
    const marginX = 14;
    const contentWidth = pageWidth - (marginX * 2);        // 182 mm

    // Paleta de colores ejecutiva Districorr
    const colorPrimary = [15, 23, 42];    // Slate 900 (Navy)
    const colorAccent = [30, 58, 138];    // Blue 900 (Corporate Blue)
    const colorSubtle = [100, 116, 139];  // Slate 500
    const colorCardBg = [248, 250, 252];  // Slate 50
    const colorBorder = [226, 232, 240];  // Slate 200

    // Función auxiliar para dibujar encabezado de página
    const drawPageHeader = () => {
      doc.setFillColor(...colorPrimary);
      doc.rect(0, 0, pageWidth, 26, 'F');

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('DISTRICORR — GESTIÓN IQ', marginX, 12);

      doc.setFontSize(8.5);
      doc.setFont('helvetica', 'normal');
      doc.text('REPORTE OFICIAL DE PAGOS Y CIRUGÍAS', marginX, 19);
      doc.text('www.districorr.com.ar', pageWidth - marginX, 19, { align: 'right' });
    };

    // Dibujar encabezado en primera página
    drawPageHeader();

    // 2. Ficha del Instrumentador
    let yPos = 32;

    doc.setFillColor(...colorCardBg);
    doc.roundedRect(marginX, yPos, contentWidth, 22, 3, 3, 'F');
    doc.setDrawColor(...colorBorder);
    doc.roundedRect(marginX, yPos, contentWidth, 22, 3, 3, 'D');

    doc.setTextColor(...colorPrimary);
    doc.setFontSize(10.5);
    doc.setFont('helvetica', 'bold');
    const nombre = instrumentador?.nombre_completo || instrumentador?.nombre || 'Instrumentador Quirúrgico';
    doc.text(`Instrumentador: ${nombre}`, marginX + 4, yPos + 7);

    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...colorSubtle);
    doc.text(`DNI: ${instrumentador?.dni || 'No especificado'}`, marginX + 4, yPos + 15);
    doc.text(`Período consultado: ${periodoLabel}`, pageWidth / 2, yPos + 7);
    doc.text(`Fecha de emisión: ${new Date().toLocaleDateString('es-AR')}`, pageWidth / 2, yPos + 15);

    yPos += 27;

    // 3. Métricas / KPIs del Reporte (Métricas en Tarjetas)
    const totalPagos = liquidaciones.length;
    const totalCirugias = liquidaciones.reduce((sum, l) => sum + (l.cirugias?.length || l.pacientes?.length || 1), 0);

    // Calcular el monto total sumando las órdenes e ítems
    const totalMontoCalculado = liquidaciones.reduce((sum, l) => {
      let lSum = parseFloat(l.monto_total || 0);
      if (isNaN(lSum) || lSum === 0) {
        const items = l.cirugias || [];
        lSum = items.reduce((acc, c) => {
          const val = parseFloat(c.monto || c.monto_liquidado || c.honorarios || c.monto_a_pagar);
          return acc + (!isNaN(val) ? val : 0);
        }, 0);
      }
      return sum + lSum;
    }, 0);

    const cardKpiWidth = (contentWidth - 8) / 3;

    // KPI 1: Órdenes de pago
    doc.setFillColor(241, 245, 249);
    doc.roundedRect(marginX, yPos, cardKpiWidth, 15, 2, 2, 'F');
    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...colorSubtle);
    doc.text('TOTAL ÓRDENES / PAGOS', marginX + 4, yPos + 5);
    doc.setFontSize(10.5);
    doc.setTextColor(...colorPrimary);
    doc.text(String(totalPagos), marginX + 4, yPos + 11.5);

    // KPI 2: Cirugías
    doc.setFillColor(241, 245, 249);
    doc.roundedRect(marginX + cardKpiWidth + 4, yPos, cardKpiWidth, 15, 2, 2, 'F');
    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...colorSubtle);
    doc.text('CIRUGÍAS ABONADAS', marginX + cardKpiWidth + 8, yPos + 5);
    doc.setFontSize(10.5);
    doc.setTextColor(...colorPrimary);
    doc.text(String(totalCirugias), marginX + cardKpiWidth + 8, yPos + 11.5);

    // KPI 3: Monto Total
    doc.setFillColor(241, 245, 249);
    doc.roundedRect(marginX + (cardKpiWidth + 4) * 2, yPos, cardKpiWidth, 15, 2, 2, 'F');
    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...colorSubtle);
    doc.text('MONTO TOTAL LIQUIDADO', marginX + (cardKpiWidth + 4) * 2 + 4, yPos + 5);
    doc.setFontSize(10.5);
    doc.setTextColor(...colorPrimary);
    doc.text(totalMontoCalculado > 0 ? `$ ${totalMontoCalculado.toLocaleString('es-AR')}` : 'Procesado', marginX + (cardKpiWidth + 4) * 2 + 4, yPos + 11.5);

    yPos += 22;

    // 4. Renderizado en Tarjetas (Cards por Orden de Pago)
    liquidaciones.forEach((liq, index) => {
      // Formatear Fecha de Pago
      let fechaStr = 'No disponible';
      if (liq.fecha_pago) {
        const d = new Date(liq.fecha_pago);
        if (!isNaN(d.getTime())) {
          fechaStr = d.toLocaleDateString('es-AR', { timeZone: 'UTC' });
        }
      }

      // Título de la Orden
      const ordenTitle = liq.orden_de_pago_id 
        ? `Orden de pago #${liq.orden_de_pago_id}` 
        : `Pago #${index + 1}`;

      // Obtener lista de cirugías/pacientes
      const itemsCirugias = (liq.cirugias && liq.cirugias.length > 0)
        ? liq.cirugias
        : (liq.pacientes || []).map(p => ({ paciente: p }));

      // Calcular la suma total de esta orden
      let ordenTotal = parseFloat(liq.monto_total || 0);
      if (isNaN(ordenTotal) || ordenTotal === 0) {
        ordenTotal = itemsCirugias.reduce((sum, c) => {
          const val = parseFloat(c.monto || c.monto_liquidado || c.honorarios || c.monto_a_pagar);
          return sum + (!isNaN(val) ? val : 0);
        }, 0);
      }

      const montoTotalStr = ordenTotal > 0 ? `$ ${ordenTotal.toLocaleString('es-AR')}` : 'Abonado';

      // Calcular altura requerida para la tarjeta
      const headerHeight = 9;
      const rowHeight = 5.5;
      const footerHeight = 8; // Siempre mostrar footer con Total de la Orden
      const cardHeight = headerHeight + (itemsCirugias.length * rowHeight) + footerHeight;

      // Verificar si cabe en la página actual o crear nueva página
      if (yPos + cardHeight > pageHeight - 20) {
        doc.addPage();
        drawPageHeader();
        yPos = 32;
      }

      // Dibujar Tarjeta (Card Box)
      doc.setFillColor(255, 255, 255);
      doc.roundedRect(marginX, yPos, contentWidth, cardHeight, 3, 3, 'F');
      doc.setDrawColor(...colorBorder);
      doc.roundedRect(marginX, yPos, contentWidth, cardHeight, 3, 3, 'D');

      // Header de la Tarjeta (Franja de Título)
      doc.setFillColor(241, 245, 249);
      doc.roundedRect(marginX, yPos, contentWidth, headerHeight, 3, 3, 'F');
      // Rectángulo plano para cubrir esquinas inferiores del header
      doc.rect(marginX, yPos + headerHeight - 2, contentWidth, 2, 'F');

      doc.setTextColor(...colorAccent);
      doc.setFontSize(9.5);
      doc.setFont('helvetica', 'bold');
      doc.text(ordenTitle, marginX + 4, yPos + 6);

      doc.setTextColor(...colorSubtle);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.text(`Fecha: ${fechaStr}`, pageWidth - marginX - 4, yPos + 6, { align: 'right' });

      // Línea divisoria bajo el header
      doc.setDrawColor(...colorBorder);
      doc.line(marginX, yPos + headerHeight, marginX + contentWidth, yPos + headerHeight);

      // Cuerpo de la Tarjeta: Listado de Pacientes y Cirugías
      let itemY = yPos + headerHeight + 4.5;

      itemsCirugias.forEach((c) => {
        doc.setFontSize(8.5);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...colorPrimary);

        const pacienteNombre = c.paciente || 'Paciente no especificado';
        doc.text(`• ${pacienteNombre}`, marginX + 6, itemY);

        // Fecha de cirugía si está disponible
        if (c.fecha_cirugia) {
          const dCir = new Date(c.fecha_cirugia);
          if (!isNaN(dCir.getTime())) {
            doc.setFontSize(7.5);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(...colorSubtle);
            doc.text(`(Cirugía: ${dCir.toLocaleDateString('es-AR', { timeZone: 'UTC' })})`, marginX + 75, itemY);
          }
        }

        // Monto individual si está disponible
        const pMonto = parseFloat(c.monto || c.monto_liquidado || c.honorarios || c.monto_a_pagar);
        if (!isNaN(pMonto) && pMonto > 0) {
          doc.setFontSize(8.5);
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(...colorPrimary);
          doc.text(`$ ${pMonto.toLocaleString('es-AR')}`, pageWidth - marginX - 6, itemY, { align: 'right' });
        }

        itemY += rowHeight;
      });

      // Footer de la Tarjeta: Total de la Orden
      doc.setDrawColor(...colorBorder);
      doc.line(marginX + 4, yPos + cardHeight - footerHeight, marginX + contentWidth - 4, yPos + cardHeight - footerHeight);

      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...colorAccent);
      doc.text(`Total Orden: ${montoTotalStr}`, pageWidth - marginX - 6, yPos + cardHeight - 2.5, { align: 'right' });

      yPos += cardHeight + 4; // Espaciado entre tarjetas
    });

    // 5. Franja de Gran Total del Período
    if (totalMontoCalculado > 0) {
      if (yPos + 16 > pageHeight - 20) {
        doc.addPage();
        drawPageHeader();
        yPos = 32;
      }

      doc.setFillColor(...colorPrimary);
      doc.roundedRect(marginX, yPos, contentWidth, 14, 3, 3, 'F');

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(9.5);
      doc.setFont('helvetica', 'bold');
      doc.text('TOTAL GENERAL DEL PERÍODO', marginX + 6, yPos + 9);

      doc.text(`$ ${totalMontoCalculado.toLocaleString('es-AR')}`, pageWidth - marginX - 6, yPos + 9, { align: 'right' });

      yPos += 18;
    }

    // 6. Pie de Página Formal en todas las páginas
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setDrawColor(...colorBorder);
      doc.line(marginX, pageHeight - 14, pageWidth - marginX, pageHeight - 14);

      doc.setFontSize(7.5);
      doc.setTextColor(...colorSubtle);
      doc.setFont('helvetica', 'normal');
      doc.text(
        'Este documento resume los pagos registrados en el sistema Gestión IQ para Districorr.',
        marginX,
        pageHeight - 8
      );
      doc.text(`Página ${i} de ${pageCount}`, pageWidth - marginX, pageHeight - 8, { align: 'right' });
    }

    // 7. Descargar PDF
    const cleanNombre = nombre.replace(/[^a-zA-Z0-9]/g, '_');
    const filename = `Reporte_Pagos_${cleanNombre}.pdf`;
    doc.save(filename);
  };

  return {
    generarReportePagos
  };
}
