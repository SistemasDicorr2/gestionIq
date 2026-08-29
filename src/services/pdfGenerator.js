// src/services/pdfGenerator.js

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export function generateIncidencesPDF(incidencias) {
  const doc = new jsPDF('p', 'mm', 'a4');

  const columns = [
    { header: 'Fecha', dataKey: 'fecha' },
    { header: 'Tipo', dataKey: 'tipo' },
    { header: 'Instrumentador', dataKey: 'instrumentador' },
    { header: 'Estado', dataKey: 'estado' },
    { header: 'Reportado Por', dataKey: 'reportado_por' },
  ];

  const body = incidencias.map(inc => ({
    fecha: new Date(inc.created_at).toLocaleDateString(),
    tipo: inc.tipo,
    instrumentador: inc.instrumentadores?.nombre_completo || 'N/A',
    estado: inc.estado,
    reportado_por: inc.reportado_por || 'N/A',
    // --- NUEVO ---
    // Añadimos la descripción a nuestros datos procesados.
    descripcion: inc.descripcion || 'Sin descripción.',
  }));

  doc.setFontSize(16);
  doc.text('Reporte de Incidencias', 14, 15);

  autoTable(doc, {
    head: [columns.map(c => c.header)],
    // El body ahora solo contiene los datos de las columnas principales.
    body: body.map(row => columns.map(col => row[col.dataKey])),
    startY: 20,
    styles: {
      fontSize: 8,
    },
    headStyles: {
      fillColor: [41, 128, 185], // Un azul más corporativo
      fontSize: 9,
    },
    // --- LA MAGIA OCURRE AQUÍ ---
    // 'didDrawCell' es una función que se ejecuta después de dibujar cada celda.
    // La usaremos para añadir la descripción debajo de cada fila.
    didDrawPage: (data) => {
      // Esto asegura que el título se repita en cada nueva página si la tabla es muy larga.
      doc.setFontSize(16);
      doc.text('Reporte de Incidencias', 14, 15);
    },
    didParseCell: function (data) {
      // Si la celda es la primera de la fila ('Fecha'), añadimos un margen inferior
      // para dar espacio a la descripción que vamos a dibujar.
      if (data.column.dataKey === 'fecha') {
        data.cell.styles.cellPadding = { top: 2, right: 2, bottom: 10, left: 2 };
      }
    },
    didDrawCell: function (data) {
      // Solo actuamos sobre la primera celda de cada fila y no en la cabecera.
      if (data.section === 'body' && data.column.index === 0) {
        // Obtenemos la descripción completa de la fila actual.
        const descripcion = body[data.row.index].descripcion;
        
        // Configuramos el estilo para el texto de la descripción.
        doc.setFontSize(7);
        doc.setTextColor(120); // Un gris suave

        // Usamos 'splitTextToSize' para manejar textos largos y que se ajusten al ancho de la tabla.
        const textLines = doc.splitTextToSize(
          `Descripción: ${descripcion}`,
          doc.internal.pageSize.width - data.cell.x * 2 // Ancho de la página menos los márgenes
        );

        // Dibujamos el texto debajo de la celda actual.
        doc.text(textLines, data.cell.x, data.cell.y + 8);

        // Restauramos el color del texto para el resto de la tabla.
        doc.setTextColor(40);
      }
    },
  });

  doc.save(`reporte_incidencias_${new Date().toISOString().slice(0, 10)}.pdf`);
}

/**
 * Genera un PDF ejecutivo con el Ranking de Rendimiento de Instrumentadores
 * e incluye el cuadro explicativo de KPIs y métricas evaluadas.
 * 
 * @param {Array} rankingData - Lista de instrumentadores con KPIs
 * @param {Object} options - Parámetros: { startDate, endDate, limit }
 */
export function generateRankingPDF(rankingData, options = {}) {
  const { startDate, endDate, limit = 'all' } = options;
  const doc = new jsPDF('p', 'mm', 'a4');
  const pageWidth = doc.internal.pageSize.width || doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.height || doc.internal.pageSize.getHeight();
  let currentY = 15;

  // Filtrar según el límite seleccionado (Top 10, Top 20, Top 30 o Todos)
  const itemsToExport = (limit === 'all' || !limit)
    ? [...rankingData]
    : rankingData.slice(0, parseInt(limit, 10));

  // --- 1. Encabezado Principal ---
  doc.setFillColor(30, 58, 138); // Azul oscuro corporativo (slate-900 / blue-900)
  doc.rect(14, currentY, pageWidth - 28, 22, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont(undefined, 'bold');
  doc.text("GESTIÓN IQ — DISTRICORR", 20, currentY + 9);

  doc.setFontSize(10);
  doc.setFont(undefined, 'normal');
  doc.text("Informe Ejecutivo IVO 2.0 — Rendimiento Profesional de Instrumentadores", 20, currentY + 16);
  currentY += 28;

  // Metadata del Informe
  doc.setTextColor(51, 65, 85); // slate-700
  doc.setFontSize(9);
  doc.setFont(undefined, 'bold');
  const fechaHoy = new Date().toLocaleDateString('es-AR');
  const periodoTexto = (startDate && endDate) 
    ? `${new Date(startDate).toLocaleDateString('es-AR')} al ${new Date(endDate).toLocaleDateString('es-AR')}`
    : 'Período Completo';

  doc.text(`Período Evaluado: ${periodoTexto}`, 14, currentY);
  doc.text(`Fecha de Emisión: ${fechaHoy}`, pageWidth - 14, currentY, { align: 'right' });
  doc.text(`Registros Incluidos: ${itemsToExport.length} instrumentadores`, 14, currentY + 5);
  currentY += 12;

  // --- 2. Cuadro Explicativo de KPIs Evaluados (Ponderación IVO 2.0) ---
  const boxHeight = 56;
  doc.setFillColor(241, 245, 249); // slate-100
  doc.setDrawColor(203, 213, 225); // slate-300
  doc.roundedRect(14, currentY, pageWidth - 28, boxHeight, 3, 3, 'FD');

  doc.setTextColor(15, 23, 42); // slate-900
  doc.setFontSize(9.5);
  doc.setFont(undefined, 'bold');
  doc.text("Fórmula y Ponderación del Score IVO (Cálculo de Puntos):", 18, currentY + 7);

  const leftKpis = [
    { label: 'Calidad de Ficha (Base)', desc: 'Suma hasta 5.00 pts (promedio de la nota asignada a cada reporte enviado).' },
    { label: 'Cirugías Acompañadas', desc: 'Suma +0.15 pts adicionales por cada cirugía asistida en el período.' },
    { label: 'Evidencia Fotográfica', desc: 'Suma +0.05 pts adicionales por cada foto de trazabilidad subida por el IQ.' }
  ];

  const rightKpis = [
    { label: 'Tiempo de Cierre (hs)', desc: 'Promedio de horas transcurridas desde la cirugía hasta el envío de la ficha.' },
    { label: 'Demora (>48hs)', desc: '% de fichas entregadas fuera del plazo operativo de 48 horas.' },
    { label: 'Puntos Manuales / Ajustes', desc: 'Puntos de bonificación o corrección otorgados por supervisión.' }
  ];

  doc.setFontSize(7.5);

  leftKpis.forEach((kpi, idx) => {
    const itemY = currentY + 14 + (idx * 13);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(30, 58, 138);
    doc.text(`• ${kpi.label}:`, 18, itemY);
    doc.setFont(undefined, 'normal');
    doc.setTextColor(51, 65, 85);
    const textLines = doc.splitTextToSize(kpi.desc, 80);
    doc.text(textLines, 18, itemY + 3.5);
  });

  rightKpis.forEach((kpi, idx) => {
    const itemY = currentY + 14 + (idx * 13);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(30, 58, 138);
    doc.text(`• ${kpi.label}:`, 110, itemY);
    doc.setFont(undefined, 'normal');
    doc.setTextColor(51, 65, 85);
    const textLines = doc.splitTextToSize(kpi.desc, 80);
    doc.text(textLines, 110, itemY + 3.5);
  });

  currentY += boxHeight + 6;

  // --- 3. Tabla del Ranking IVO 2.0 ---
  const columns = [
    { header: 'Pos.', dataKey: 'pos' },
    { header: 'Instrumentador', dataKey: 'nombre' },
    { header: 'DNI', dataKey: 'dni' },
    { header: 'Score IVO 2.0', dataKey: 'score' },
    { header: 'Cirugías', dataKey: 'cirugias' },
    { header: 'Fotos', dataKey: 'fotos' },
    { header: 'Cierre (hs)', dataKey: 'cierre' },
    { header: 'Obs. (chars)', dataKey: 'obs' },
    { header: 'Demora (%)', dataKey: 'demora' },
  ];

  const body = itemsToExport.map((iq, index) => {
    // Usar el Score IVO real exacto
    let rawScore = iq.ivo_score_v2 !== undefined && iq.ivo_score_v2 !== null
      ? parseFloat(iq.ivo_score_v2)
      : (iq.puntaje_iq_promedio ? parseFloat(iq.puntaje_iq_promedio) : 0);

    const demoraVal = (iq.tasa_informes_demorados !== undefined && iq.tasa_informes_demorados !== null)
      ? parseFloat(iq.tasa_informes_demorados)
      : ((iq.tasa_informe_faltante !== undefined && iq.tasa_informe_faltante !== null) ? parseFloat(iq.tasa_informe_faltante) : 0);

    return {
      pos: `${index + 1}º`,
      nombre: iq.nombre_completo ? iq.nombre_completo.replace(/\b\w/g, l => l.toUpperCase()) : 'N/A',
      dni: iq.instrumentador_dni || iq.dni || 'N/A',
      score: `${rawScore.toFixed(2)} pts`,
      cirugias: String(iq.total_cirugias || 0),
      fotos: String(iq.total_fotos_subidas || 0),
      cierre: (iq.tiempo_cierre_promedio_horas !== null && iq.tiempo_cierre_promedio_horas !== undefined) ? `${iq.tiempo_cierre_promedio_horas} hs` : 'N/A',
      obs: String(iq.observaciones_promedio_chars || 0),
      demora: `${demoraVal.toFixed(0)}%`
    };
  });

  autoTable(doc, {
    head: [columns.map(c => c.header)],
    body: body.map(row => columns.map(col => row[col.dataKey])),
    startY: currentY,
    styles: {
      fontSize: 8,
      cellPadding: 3,
      valign: 'middle'
    },
    headStyles: {
      fillColor: [30, 64, 175], // Blue-700
      textColor: 255,
      fontStyle: 'bold',
      halign: 'center'
    },
    columnStyles: {
      0: { halign: 'center', fontStyle: 'bold' },
      1: { fontStyle: 'bold' },
      2: { halign: 'center' },
      3: { halign: 'center', fontStyle: 'bold' },
      4: { halign: 'center' },
      5: { halign: 'center' },
      6: { halign: 'center' },
      7: { halign: 'center' },
      8: { halign: 'center' },
    },
    didParseCell: (data) => {
      // Destacar el Top 3 con fondo suave
      if (data.section === 'body') {
        if (data.row.index === 0) {
          data.cell.styles.fillColor = [254, 243, 199]; // Amber-100 para 1er puesto
        } else if (data.row.index === 1) {
          data.cell.styles.fillColor = [241, 245, 249]; // Slate-100 para 2do puesto
        } else if (data.row.index === 2) {
          data.cell.styles.fillColor = [255, 237, 213]; // Orange-100 para 3er puesto
        }
      }
    },
    didDrawPage: (data) => {
      // Pie de Página Institucional (regla AGENTS.md)
      doc.setFontSize(7);
      doc.setTextColor(148, 163, 184); // slate-400
      
      const notaLegal = "Este documento resume el desempeño registrado con Districorr en el sistema Gestión IQ. No reemplaza certificados oficiales ni documentación laboral formal.";
      doc.text(notaLegal, 14, pageHeight - 8);

      const totalPages = doc.internal.getNumberOfPages();
      doc.text(`Página ${data.pageNumber} de ${totalPages}`, pageWidth - 14, pageHeight - 8, { align: 'right' });
    }
  });

  const limitSuffix = (limit === 'all' || !limit) ? 'Completo' : `Top_${limit}`;
  doc.save(`Ranking_Instrumentadores_${limitSuffix}_${new Date().toISOString().slice(0, 10)}.pdf`);
}