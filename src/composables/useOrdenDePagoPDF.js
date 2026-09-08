// src/composables/useOrdenDePagoPDF.js
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export function useOrdenDePagoPDF() {
  const generatePDF = (ordenDetails, targetDni = null) => {
    if (!ordenDetails) return;

    const doc = new jsPDF();
    const margin = 15;
    const pageWidth = doc.internal.pageSize.getWidth();
    let y = 0;

    // --- DATOS DE LA EMPRESA ---
    const empresa = {
      nombre: "DISTRICORR SRL",
      cuit: "CUIT: 30-71598290-7",
      direccion: "9 de julio 1251, Corrientes Capital",
      contacto: "Email: pagos@districorr.com"
    };

    // Filtrar instrumentadores si se especificó un targetDni
    let pagos = ordenDetails.pagos_instrumentadores || ordenDetails.pagos || [];
    if (targetDni) {
      pagos = pagos.filter(p => String(p.instrumentador_dni) === String(targetDni));
    }

    const totalGeneral = targetDni && pagos.length > 0
      ? pagos.reduce((acc, p) => acc + (Number(p.monto_total_instrumentador) || 0), 0)
      : (ordenDetails.monto_total_general || 0);

    // --- HELPER PARA PIE DE PÁGINA ---
    const addFooter = () => {
      const pageCount = doc.internal.getNumberOfPages();
      const pageHeight = doc.internal.pageSize.getHeight();
      doc.setFontSize(8);
      doc.setTextColor(140);

      const totalCxCount = pagos.reduce((acc, p) => acc + (p.cirugias || p.reportes || []).length, 0);

      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setDrawColor(220);
        doc.line(margin, pageHeight - 20, pageWidth - margin, pageHeight - 25);
        
        const summaryText = `Resumen: ${pagos.length} Instrumentador(es) | ${totalCxCount} Imputación(es) Quirúrgica(s) · Documento no válido como factura`;
        doc.text(summaryText, margin, pageHeight - 14);

        const pageNumText = `Página ${i} de ${pageCount}`;
        doc.text(pageNumText, pageWidth - margin, pageHeight - 14, { align: 'right' });
      }
    };

    // --- BLOQUE 1: CABECERA PROFESIONAL ---
    y = 18;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.setTextColor(15, 23, 42); // slate-900
    doc.text(empresa.nombre, margin, y);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(100);
    doc.text(empresa.cuit, margin, y + 5);
    doc.text(empresa.direccion, margin, y + 9);
    doc.text(empresa.contacto, margin, y + 13);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(20);
    doc.setTextColor(79, 70, 229); // indigo-600
    doc.text('Reporte de Pago e Imputaciones', pageWidth - margin, y, { align: 'right' });
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100);
    doc.text(`Comprobante de Liquidación de Actividad`, pageWidth - margin, y + 6, { align: 'right' });
    y += 22;

    // --- BLOQUE 2: RESUMEN EJECUTIVO ---
    doc.setDrawColor(226, 232, 240);
    doc.line(margin, y, pageWidth - margin, y);
    y += 8;

    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(100);
    doc.text('N° DE ORDEN', margin, y);
    doc.text('FECHA DE EMISIÓN', pageWidth / 2, y, { align: 'center' });
    doc.text('MONTO TOTAL LIQUIDADO', pageWidth - margin, y, { align: 'right' });
    
    y += 6;
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text(`#${ordenDetails.id || 'S/N'}`, margin, y);
    
    const fechaEmisionStr = ordenDetails.fecha_emision 
      ? new Date(ordenDetails.fecha_emision).toLocaleDateString('es-AR', { timeZone: 'UTC', day: '2-digit', month: '2-digit', year: 'numeric' })
      : 'N/A';
    doc.text(fechaEmisionStr, pageWidth / 2, y, { align: 'center' });
    
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(5, 150, 105); // emerald-600
    doc.text(`${new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(totalGeneral)}`, pageWidth - margin, y, { align: 'right' });
    
    y += 12;

    // --- BLOQUE 3: DETALLE POR INSTRUMENTADOR E IMPUTACIONES ---
    pagos.forEach((pago, pIdx) => {
      doc.setDrawColor(203, 213, 225);
      doc.line(margin, y, pageWidth - margin, y);
      y += 8;

      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(30, 41, 59);
      doc.text(`Instrumentador: ${pago.instrumentador_nombre || 'No especificado'}`, margin, y);
      
      if (pago.instrumentador_dni) {
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(100);
        doc.text(`(DNI: ${pago.instrumentador_dni})`, margin + doc.getTextWidth(`Instrumentador: ${pago.instrumentador_nombre} `), y);
      }

      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(79, 70, 229);
      doc.text(`Total Liquidado: ${new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(pago.monto_total_instrumentador || 0)}`, pageWidth - margin, y, { align: 'right' });
      y += 6;

      const cirugiasList = pago.cirugias || pago.reportes || [];
      const body = cirugiasList.map(c => {
        const idCx = c.id_cirugia || (c.id ? `CX-${c.id}` : '-');
        const fechaCx = c.fecha_cirugia 
          ? new Date(c.fecha_cirugia).toLocaleDateString('es-AR', { timeZone: 'UTC', day: '2-digit', month: '2-digit', year: 'numeric' })
          : '-';
        const pacienteDesc = c.medico 
          ? `${c.paciente || 'Paciente sin datos'}\nMédico: ${c.medico}`
          : (c.paciente || 'Paciente sin datos');
        const monto = c.monto_final !== undefined 
          ? c.monto_final 
          : (c.monto_a_pagar !== undefined ? c.monto_a_pagar : 0);

        return [
          idCx,
          fechaCx,
          pacienteDesc,
          new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(monto)
        ];
      });

      autoTable(doc, {
        startY: y,
        head: [['ID Cirugía', 'Fecha CX', 'Paciente / Médico', 'Monto Imputado']],
        body: body,
        theme: 'striped',
        headStyles: { 
          fillColor: [30, 41, 59], // slate-800
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          fontSize: 8.5
        },
        styles: {
          fontSize: 8.5,
          cellPadding: 3,
          textColor: [15, 23, 42]
        },
        columnStyles: {
          0: { cellWidth: 25, fontStyle: 'bold' },
          1: { cellWidth: 25 },
          3: { halign: 'right', fontStyle: 'bold', textColor: [5, 150, 105] }
        }
      });

      y = doc.lastAutoTable.finalY + 12;
    });

    // --- BLOQUE 4: NOTAS ADICIONALES ---
    if (ordenDetails.notas) {
      doc.setDrawColor(226, 232, 240);
      doc.line(margin, y, pageWidth - margin, y);
      y += 8;
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(30, 41, 59);
      doc.text('Notas / Observaciones de la Orden:', margin, y);
      y += 5;
      doc.setFontSize(8.5);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(71, 85, 105);
      const noteLines = doc.splitTextToSize(ordenDetails.notas, pageWidth - (margin * 2));
      doc.text(noteLines, margin, y);
    }

    // --- PIE DE PÁGINA ---
    addFooter();

    const fileNameDni = targetDni ? `_${targetDni}` : '';
    doc.save(`Reporte_Pago_Orden_${ordenDetails.id}${fileNameDni}.pdf`);
  };

  return { generatePDF };
}