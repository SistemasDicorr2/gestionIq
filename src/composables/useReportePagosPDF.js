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
      const footerHeight = 8;
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

  // Generar Reporte Consolidado con el Listado Completo de Pagos (Un solo PDF)
  const generarReporteListadoCompletoPagos = ({ ordenesDetalladas, periodoLabel, instrumentadorFiltro = null, download = true }) => {
    if (!ordenesDetalladas || ordenesDetalladas.length === 0) return;

    const doc = new jsPDF('p', 'mm', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth();   // 210 mm
    const pageHeight = doc.internal.pageSize.getHeight(); // 297 mm
    const marginX = 14;
    const contentWidth = pageWidth - (marginX * 2);        // 182 mm

    // Paleta ejecutiva Districorr
    const colorPrimary = [15, 23, 42];    // Slate 900 (Navy)
    const colorAccent = [30, 58, 138];    // Blue 900 (Corporate Blue)
    const colorSubtle = [100, 116, 139];  // Slate 500
    const colorCardBg = [248, 250, 252];  // Slate 50
    const colorBorder = [226, 232, 240];  // Slate 200

    const drawPageHeader = (pageTitle = 'REPORTE OFICIAL DE PAGOS Y CIRUGÍAS') => {
      doc.setFillColor(...colorPrimary);
      doc.rect(0, 0, pageWidth, 26, 'F');

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('DISTRICORR — GESTIÓN IQ', marginX, 12);

      doc.setFontSize(8.5);
      doc.setFont('helvetica', 'normal');
      doc.text(pageTitle, marginX, 19);
      doc.text('www.districorr.com.ar', pageWidth - marginX, 19, { align: 'right' });
    };

    drawPageHeader();

    let yPos = 32;

    // 1. Cabecera Informativa del Período / Filtro
    doc.setFillColor(...colorCardBg);
    doc.roundedRect(marginX, yPos, contentWidth, 22, 3, 3, 'F');
    doc.setDrawColor(...colorBorder);
    doc.roundedRect(marginX, yPos, contentWidth, 22, 3, 3, 'D');

    doc.setTextColor(...colorPrimary);
    doc.setFontSize(10.5);
    doc.setFont('helvetica', 'bold');

    const tituloAlcance = instrumentadorFiltro
      ? `Instrumentador: ${instrumentadorFiltro.nombre || 'Seleccionado'} (DNI: ${instrumentadorFiltro.dni || '-'})`
      : 'Alcance: Todos los instrumentadores quirúrgicos (Listado General)';

    doc.text(tituloAlcance, marginX + 4, yPos + 7);

    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...colorSubtle);
    doc.text(`Período consultado: ${periodoLabel}`, marginX + 4, yPos + 15);
    doc.text(`Fecha de emisión: ${new Date().toLocaleDateString('es-AR')}`, pageWidth - marginX - 4, yPos + 15, { align: 'right' });

    yPos += 27;

    // 2. Extraer todas las liquidaciones y cirugías
    let totalPagosCount = 0;
    let totalCirugiasCount = 0;
    let granTotalMonto = 0;

    // Resumen por instrumentador para la tabla
    const resumenPorInstrumentador = new Map();

    const itemsAplanados = [];

    ordenesDetalladas.forEach(orden => {
      const pagos = orden.pagos_instrumentadores || orden.pagos || [];
      
      // Filtrar si hay instrumentador específico
      const pagosFiltrados = instrumentadorFiltro?.dni && instrumentadorFiltro.dni !== 'todos'
        ? pagos.filter(p => String(p.instrumentador_dni).trim() === String(instrumentadorFiltro.dni).trim())
        : pagos;

      pagosFiltrados.forEach(p => {
        const dniStr = String(p.instrumentador_dni || '').trim();
        const nombreInst = p.instrumentador_nombre || orden.instrumentadores_nombres || 'Instrumentador';
        const cirugias = p.cirugias || p.reportes || [];
        const montoInst = parseFloat(p.monto_total_instrumentador || p.monto_total || 0);

        totalPagosCount += 1;
        totalCirugiasCount += (cirugias.length > 0 ? cirugias.length : 1);
        if (!isNaN(montoInst)) {
          granTotalMonto += montoInst;
        }

        // Agrupar en mapa
        if (!resumenPorInstrumentador.has(dniStr)) {
          resumenPorInstrumentador.set(dniStr, {
            dni: dniStr,
            nombre: nombreInst,
            ordenesCount: 0,
            cirugiasCount: 0,
            totalMonto: 0
          });
        }
        const refInst = resumenPorInstrumentador.get(dniStr);
        refInst.ordenesCount += 1;
        refInst.cirugiasCount += (cirugias.length > 0 ? cirugias.length : 1);
        if (!isNaN(montoInst)) {
          refInst.totalMonto += montoInst;
        }

        // Agregar al listado para cards detalladas
        itemsAplanados.push({
          ordenId: orden.id,
          fechaEmision: orden.fecha_emision,
          instrumentadorNombre: nombreInst,
          instrumentadorDni: dniStr,
          montoTotal: montoInst,
          cirugias: cirugias.map(c => ({
            paciente: c.paciente,
            fecha_cirugia: c.fecha_cirugia,
            monto: c.monto_final !== undefined ? c.monto_final : (c.monto_a_pagar || c.monto || c.honorarios || 0)
          }))
        });
      });
    });

    // 3. KPIs Cards
    const cardKpiWidth = (contentWidth - 8) / 3;

    doc.setFillColor(241, 245, 249);
    doc.roundedRect(marginX, yPos, cardKpiWidth, 15, 2, 2, 'F');
    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...colorSubtle);
    doc.text('TOTAL ÓRDENES / PAGOS', marginX + 4, yPos + 5);
    doc.setFontSize(10.5);
    doc.setTextColor(...colorPrimary);
    doc.text(String(totalPagosCount), marginX + 4, yPos + 11.5);

    doc.setFillColor(241, 245, 249);
    doc.roundedRect(marginX + cardKpiWidth + 4, yPos, cardKpiWidth, 15, 2, 2, 'F');
    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...colorSubtle);
    doc.text('CIRUGÍAS ABONADAS', marginX + cardKpiWidth + 8, yPos + 5);
    doc.setFontSize(10.5);
    doc.setTextColor(...colorPrimary);
    doc.text(String(totalCirugiasCount), marginX + cardKpiWidth + 8, yPos + 11.5);

    doc.setFillColor(241, 245, 249);
    doc.roundedRect(marginX + (cardKpiWidth + 4) * 2, yPos, cardKpiWidth, 15, 2, 2, 'F');
    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...colorSubtle);
    doc.text('MONTO TOTAL LIQUIDADO', marginX + (cardKpiWidth + 4) * 2 + 4, yPos + 5);
    doc.setFontSize(10.5);
    doc.setTextColor(...colorPrimary);
    doc.text(granTotalMonto > 0 ? `$ ${granTotalMonto.toLocaleString('es-AR')}` : 'Procesado', marginX + (cardKpiWidth + 4) * 2 + 4, yPos + 11.5);

    yPos += 22;

    // 4. Si hay múltiples profesionales, imprimir una tabla resumen ejecutiva primero
    if (resumenPorInstrumentador.size > 1 && !instrumentadorFiltro?.dni) {
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...colorAccent);
      doc.text('RESUMEN CONSOLIDADO POR INSTRUMENTADOR', marginX, yPos + 3);
      yPos += 6;

      // Header de la tabla resumen
      doc.setFillColor(...colorPrimary);
      doc.rect(marginX, yPos, contentWidth, 7, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(7.5);
      doc.setFont('helvetica', 'bold');
      doc.text('INSTRUMENTADOR', marginX + 3, yPos + 4.8);
      doc.text('DNI', marginX + 70, yPos + 4.8);
      doc.text('ÓRDENES', marginX + 98, yPos + 4.8);
      doc.text('CIRUGÍAS', marginX + 120, yPos + 4.8);
      doc.text('TOTAL LIQUIDADO', pageWidth - marginX - 3, yPos + 4.8, { align: 'right' });
      yPos += 7;

      let altRow = false;
      Array.from(resumenPorInstrumentador.values()).forEach(inst => {
        if (yPos + 7 > pageHeight - 20) {
          doc.addPage();
          drawPageHeader('REPORTE CONSOLIDADO — RESUMEN POR INSTRUMENTADOR');
          yPos = 32;
        }

        if (altRow) {
          doc.setFillColor(248, 250, 252);
          doc.rect(marginX, yPos, contentWidth, 6, 'F');
        }
        altRow = !altRow;

        doc.setDrawColor(...colorBorder);
        doc.line(marginX, yPos + 6, marginX + contentWidth, yPos + 6);

        doc.setTextColor(...colorPrimary);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'bold');
        doc.text(inst.nombre.substring(0, 32), marginX + 3, yPos + 4.2);

        doc.setFont('helvetica', 'normal');
        doc.setTextColor(...colorSubtle);
        doc.text(inst.dni || '-', marginX + 70, yPos + 4.2);
        doc.text(String(inst.ordenesCount), marginX + 98, yPos + 4.2);
        doc.text(String(inst.cirugiasCount), marginX + 120, yPos + 4.2);

        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...colorPrimary);
        doc.text(`$ ${inst.totalMonto.toLocaleString('es-AR')}`, pageWidth - marginX - 3, yPos + 4.2, { align: 'right' });

        yPos += 6;
      });

      yPos += 6;
    }

    // 5. Título de la sección de Desglose Detallado
    if (yPos + 10 > pageHeight - 20) {
      doc.addPage();
      drawPageHeader('REPORTE CONSOLIDADO — DESGLOSE DETALLADO');
      yPos = 32;
    }

    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...colorAccent);
    doc.text(`DESGLOSE DETALLADO DE PAGOS (${itemsAplanados.length} REGISTROS)`, marginX, yPos + 3);
    yPos += 7;

    // 6. Tarjetas Detalladas por cada Orden / Instrumentador
    itemsAplanados.forEach((item) => {
      let fechaStr = 'No disponible';
      if (item.fechaEmision) {
        const d = new Date(item.fechaEmision);
        if (!isNaN(d.getTime())) {
          fechaStr = d.toLocaleDateString('es-AR', { timeZone: 'UTC' });
        }
      }

      const ordenTitle = `Orden #${item.ordenId} · ${item.instrumentadorNombre}${item.instrumentadorDni ? ` (DNI: ${item.instrumentadorDni})` : ''}`;
      const itemsCirugias = item.cirugias.length > 0 ? item.cirugias : [{ paciente: 'Cirugía liquidada' }];

      const montoTotalStr = item.montoTotal > 0 ? `$ ${item.montoTotal.toLocaleString('es-AR')}` : 'Abonado';

      const headerHeight = 9;
      const rowHeight = 5.5;
      const footerHeight = 8;
      const cardHeight = headerHeight + (itemsCirugias.length * rowHeight) + footerHeight;

      if (yPos + cardHeight > pageHeight - 20) {
        doc.addPage();
        drawPageHeader('REPORTE CONSOLIDADO — DESGLOSE DETALLADO');
        yPos = 32;
      }

      // Caja de la Tarjeta
      doc.setFillColor(255, 255, 255);
      doc.roundedRect(marginX, yPos, contentWidth, cardHeight, 3, 3, 'F');
      doc.setDrawColor(...colorBorder);
      doc.roundedRect(marginX, yPos, contentWidth, cardHeight, 3, 3, 'D');

      // Franja de Cabecera de la Tarjeta
      doc.setFillColor(241, 245, 249);
      doc.roundedRect(marginX, yPos, contentWidth, headerHeight, 3, 3, 'F');
      doc.rect(marginX, yPos + headerHeight - 2, contentWidth, 2, 'F');

      doc.setTextColor(...colorAccent);
      doc.setFontSize(8.5);
      doc.setFont('helvetica', 'bold');
      doc.text(ordenTitle, marginX + 4, yPos + 6);

      doc.setTextColor(...colorSubtle);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.text(`Fecha: ${fechaStr}`, pageWidth - marginX - 4, yPos + 6, { align: 'right' });

      doc.setDrawColor(...colorBorder);
      doc.line(marginX, yPos + headerHeight, marginX + contentWidth, yPos + headerHeight);

      // Listado de Cirugías
      let itemY = yPos + headerHeight + 4.5;
      itemsCirugias.forEach((c) => {
        doc.setFontSize(8);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...colorPrimary);

        const pacienteNombre = c.paciente || 'Paciente no especificado';
        doc.text(`• ${pacienteNombre}`, marginX + 6, itemY);

        if (c.fecha_cirugia) {
          const dCir = new Date(c.fecha_cirugia);
          if (!isNaN(dCir.getTime())) {
            doc.setFontSize(7.5);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(...colorSubtle);
            doc.text(`(Cirugía: ${dCir.toLocaleDateString('es-AR', { timeZone: 'UTC' })})`, marginX + 75, itemY);
          }
        }

        const pMonto = parseFloat(c.monto);
        if (!isNaN(pMonto) && pMonto > 0) {
          doc.setFontSize(8);
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(...colorPrimary);
          doc.text(`$ ${pMonto.toLocaleString('es-AR')}`, pageWidth - marginX - 6, itemY, { align: 'right' });
        }

        itemY += rowHeight;
      });

      // Footer de la Tarjeta
      doc.setDrawColor(...colorBorder);
      doc.line(marginX + 4, yPos + cardHeight - footerHeight, marginX + contentWidth - 4, yPos + cardHeight - footerHeight);

      doc.setFontSize(8.5);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...colorAccent);
      doc.text(`Total Liquidado: ${montoTotalStr}`, pageWidth - marginX - 6, yPos + cardHeight - 2.5, { align: 'right' });

      yPos += cardHeight + 4;
    });

    // 7. Franja Gran Total General
    if (granTotalMonto > 0) {
      if (yPos + 16 > pageHeight - 20) {
        doc.addPage();
        drawPageHeader('REPORTE CONSOLIDADO — TOTAL GENERAL');
        yPos = 32;
      }

      doc.setFillColor(...colorPrimary);
      doc.roundedRect(marginX, yPos, contentWidth, 14, 3, 3, 'F');

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(9.5);
      doc.setFont('helvetica', 'bold');
      doc.text('TOTAL GENERAL LIQUIDADO DEL PERÍODO', marginX + 6, yPos + 9);
      doc.text(`$ ${granTotalMonto.toLocaleString('es-AR')}`, pageWidth - marginX - 6, yPos + 9, { align: 'right' });

      yPos += 18;
    }

    // 8. Pie de página en todas las hojas
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setDrawColor(...colorBorder);
      doc.line(marginX, pageHeight - 14, pageWidth - marginX, pageHeight - 14);

      doc.setFontSize(7.5);
      doc.setTextColor(...colorSubtle);
      doc.setFont('helvetica', 'normal');
      doc.text(
        'Este documento oficial resume la totalidad de los pagos registrados en Gestión IQ para Districorr.',
        marginX,
        pageHeight - 8
      );
      doc.text(`Página ${i} de ${pageCount}`, pageWidth - marginX, pageHeight - 8, { align: 'right' });
    }

    // 9. Guardar PDF con nombre limpio y representativo o retornar Base64
    const labelSanitized = periodoLabel.replace(/[^a-zA-Z0-9]/g, '_');
    const filename = `Reporte_Pagos_Consolidado_${labelSanitized}.pdf`;
    
    if (download !== false) {
      doc.save(filename);
    }

    const dataUri = doc.output('datauristring');
    const base64 = dataUri.split(',')[1] || '';

    return { doc, filename, base64 };
  };

  const generarReporteOrdenIndividual = ({ instrumentador, liquidacion, download = true }) => {
    if (!liquidacion) return;
    const refStr = liquidacion.orden_de_pago_id ? `Orden de Pago #${liquidacion.orden_de_pago_id}` : 'Comprobante Individual de Pago';
    
    // Adaptar estructura al formato de orden detallada
    const mockOrden = {
      id: liquidacion.orden_de_pago_id || 'Individual',
      fecha_emision: liquidacion.fecha_pago,
      monto_total: liquidacion.monto_total,
      pagos_instrumentadores: [
        {
          instrumentador_nombre: instrumentador?.nombre_completo || instrumentador?.nombre || 'Instrumentador Quirúrgico',
          instrumentador_dni: instrumentador?.dni || '-',
          monto_total_instrumentador: liquidacion.monto_total,
          cirugias: liquidacion.cirugias || (liquidacion.pacientes || []).map(p => ({ paciente: p }))
        }
      ]
    };

    return generarReporteListadoCompletoPagos({
      ordenesDetalladas: [mockOrden],
      periodoLabel: refStr,
      instrumentadorFiltro: {
        dni: instrumentador?.dni,
        nombre: instrumentador?.nombre_completo || instrumentador?.nombre
      },
      download
    });
  };

  const generarReporteDesdeDetalleOrden = (detalleOrden, dniFiltro = null, download = true) => {
    if (!detalleOrden) return;
    const pagos = detalleOrden.pagos_instrumentadores || detalleOrden.pagos || [];
    
    let targetInstFiltro = null;
    if (dniFiltro) {
      const matchP = pagos.find(p => String(p.instrumentador_dni).trim() === String(dniFiltro).trim());
      if (matchP) {
        targetInstFiltro = {
          dni: matchP.instrumentador_dni,
          nombre: matchP.instrumentador_nombre
        };
      }
    } else if (pagos.length === 1) {
      targetInstFiltro = {
        dni: pagos[0].instrumentador_dni,
        nombre: pagos[0].instrumentador_nombre
      };
    }

    return generarReporteListadoCompletoPagos({
      ordenesDetalladas: [detalleOrden],
      periodoLabel: `Orden de Pago #${detalleOrden.id}`,
      instrumentadorFiltro: targetInstFiltro,
      download
    });
  };

  const generarReporteConsolidadoPeriodo = ({ instrumentador, liquidaciones, periodoLabel, download = true }) => {
    // Si viene en formato de liquidaciones simples, adaptarlo al motor ejecutivo
    const mockOrdenes = liquidaciones.map((l, idx) => ({
      id: l.orden_de_pago_id || (idx + 1),
      fecha_emision: l.fecha_pago,
      monto_total: l.monto_total,
      pagos_instrumentadores: [
        {
          instrumentador_nombre: instrumentador?.nombre_completo || instrumentador?.nombre || 'Instrumentador Quirúrgico',
          instrumentador_dni: instrumentador?.dni || '-',
          monto_total_instrumentador: l.monto_total,
          cirugias: l.cirugias || (l.pacientes || []).map(p => ({ paciente: p }))
        }
      ]
    }));

    return generarReporteListadoCompletoPagos({
      ordenesDetalladas: mockOrdenes,
      periodoLabel: periodoLabel || 'Período personalizado',
      instrumentadorFiltro: instrumentador ? {
        dni: instrumentador.dni,
        nombre: instrumentador.nombre_completo || instrumentador.nombre
      } : null,
      download
    });
  };

  return {
    generarReportePagos,
    generarReporteOrdenIndividual,
    generarReporteDesdeDetalleOrden,
    generarReporteConsolidadoPeriodo,
    generarReporteListadoCompletoPagos
  };
}

