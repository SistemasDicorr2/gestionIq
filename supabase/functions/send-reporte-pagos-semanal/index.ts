import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { jsPDF } from "https://esm.sh/jspdf@2.5.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE',
};

const DEFAULT_EMAILS = [
  "contable@districorr.com.ar",
  "sistemas@districorr.com.ar"
];

function getPeriodRange() {
  const now = new Date();
  // Ajustar a ART (UTC-3)
  const artNow = new Date(now.getTime() - 3 * 60 * 60 * 1000);
  
  const currentDay = artNow.getUTCDay();
  const daysSinceSaturday = (currentDay + 1) % 7;
  
  const saturdayDate = new Date(artNow);
  saturdayDate.setUTCDate(artNow.getUTCDate() - daysSinceSaturday);
  saturdayDate.setUTCHours(0, 0, 0, 0);

  const desdeIso = new Date(saturdayDate.getTime() + 3 * 60 * 60 * 1000).toISOString().split('T')[0];
  const hastaIso = new Date(artNow.getTime() + 3 * 60 * 60 * 1000).toISOString().split('T')[0];

  const formatDisplay = (dStr: string) => {
    const parts = dStr.split('-');
    return parts.length === 3 ? `${parts[2]}/${parts[1]}/${parts[0]}` : dStr;
  };

  const periodoLabel = `Semana en curso (${formatDisplay(desdeIso)} al ${formatDisplay(hastaIso)})`;
  return { desdeIso, hastaIso, periodoLabel };
}

function generarPdfConsolidadoBase64(ordenesDetalladas: any[], periodoLabel: string) {
  const doc = new jsPDF('p', 'mm', 'a4');
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const marginX = 14;
  const contentWidth = pageWidth - (marginX * 2);

  const colorPrimary: [number, number, number] = [15, 23, 42];
  const colorAccent: [number, number, number] = [30, 58, 138];
  const colorSubtle: [number, number, number] = [100, 116, 139];
  const colorCardBg: [number, number, number] = [248, 250, 252];
  const colorBorder: [number, number, number] = [226, 232, 240];

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

  // 1. Cabecera Informativa
  doc.setFillColor(...colorCardBg);
  doc.roundedRect(marginX, yPos, contentWidth, 22, 3, 3, 'F');
  doc.setDrawColor(...colorBorder);
  doc.roundedRect(marginX, yPos, contentWidth, 22, 3, 3, 'D');

  doc.setTextColor(...colorPrimary);
  doc.setFontSize(10.5);
  doc.setFont('helvetica', 'bold');
  doc.text('Alcance: Todos los instrumentadores quirúrgicos (Consolidado Semanal Automático)', marginX + 4, yPos + 7);

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...colorSubtle);
  doc.text(`Período consultado: ${periodoLabel}`, marginX + 4, yPos + 15);
  doc.text(`Fecha de emisión: ${new Date().toLocaleDateString('es-AR')}`, pageWidth - marginX - 4, yPos + 15, { align: 'right' });

  yPos += 27;

  // 2. Extraer datos y métricas
  let totalPagosCount = 0;
  let totalCirugiasCount = 0;
  let granTotalMonto = 0;
  const resumenPorInstrumentador = new Map();
  const itemsAplanados: any[] = [];

  ordenesDetalladas.forEach(orden => {
    const pagos = orden.pagos_instrumentadores || orden.pagos || [];
    pagos.forEach((p: any) => {
      const dniStr = String(p.instrumentador_dni || '').trim();
      const nombreInst = p.instrumentador_nombre || orden.instrumentadores_nombres || 'Instrumentador';
      const cirugias = p.cirugias || p.reportes || [];
      const montoInst = parseFloat(p.monto_total_instrumentador || p.monto_total || 0);

      totalPagosCount += 1;
      totalCirugiasCount += (cirugias.length > 0 ? cirugias.length : 1);
      if (!isNaN(montoInst)) {
        granTotalMonto += montoInst;
      }

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

      itemsAplanados.push({
        ordenId: orden.id,
        fechaEmision: orden.fecha_emision,
        instrumentadorNombre: nombreInst,
        instrumentadorDni: dniStr,
        montoTotal: montoInst,
        cirugias: cirugias.map((c: any) => ({
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

  // 4. Resumen por Instrumentador
  if (resumenPorInstrumentador.size > 1) {
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...colorAccent);
    doc.text('RESUMEN CONSOLIDADO POR INSTRUMENTADOR', marginX, yPos + 3);
    yPos += 6;

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
    Array.from(resumenPorInstrumentador.values()).forEach((inst: any) => {
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

  // 5. Desglose detallado
  if (itemsAplanados.length > 0) {
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

      doc.setFillColor(255, 255, 255);
      doc.roundedRect(marginX, yPos, contentWidth, cardHeight, 3, 3, 'F');
      doc.setDrawColor(...colorBorder);
      doc.roundedRect(marginX, yPos, contentWidth, cardHeight, 3, 3, 'D');

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

      let itemY = yPos + headerHeight + 4.5;
      itemsCirugias.forEach((c: any) => {
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

      doc.setDrawColor(...colorBorder);
      doc.line(marginX + 4, yPos + cardHeight - footerHeight, marginX + contentWidth - 4, yPos + cardHeight - footerHeight);

      doc.setFontSize(8.5);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...colorAccent);
      doc.text(`Total Liquidado: ${montoTotalStr}`, pageWidth - marginX - 6, yPos + cardHeight - 2.5, { align: 'right' });

      yPos += cardHeight + 4;
    });
  }

  // 6. Gran Total
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
  }

  // 7. Pie de página
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

  const dataUri = doc.output('datauristring');
  const base64 = dataUri.split(',')[1] || '';
  const filename = `Reporte_Pagos_Consolidado_Semana_en_curso.pdf`;

  return { base64, filename, granTotalMonto, totalPagosCount, totalCirugiasCount };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { status: 200, headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || Deno.env.get('SUPABASE_ANON_KEY') || '';
    const resendApiKey = Deno.env.get('RESEND_API_KEY') || Deno.env.get('RESEND_APIKEY') || '';

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY no configuradas.");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { desdeIso, hastaIso, periodoLabel } = getPeriodRange();

    // 1. Obtener órdenes de pago en el rango de la semana
    const { data: ordenesData, error: ordenesError } = await supabase
      .from('ordenes_de_pago')
      .select('id, fecha_emision')
      .gte('fecha_emision', desdeIso)
      .lte('fecha_emision', `${hastaIso}T23:59:59`)
      .order('id', { ascending: false });

    if (ordenesError) {
      throw new Error(`Error al consultar ordenes_de_pago: ${ordenesError.message}`);
    }

    const ordenes = ordenesData || [];
    
    // Obtener detalles de cada orden mediante RPC
    const detailedOrders = await Promise.all(
      ordenes.map(async (o: any) => {
        const { data } = await supabase.rpc('obtener_detalle_orden_pago', { p_orden_id: o.id });
        return data || o;
      })
    );

    // 2. Generar PDF
    const { base64, filename, granTotalMonto, totalPagosCount, totalCirugiasCount } = generarPdfConsolidadoBase64(detailedOrders, periodoLabel);

    // 3. Destinatarios
    let toEmails = DEFAULT_EMAILS;
    const { data: configData } = await supabase
      .from('resumen_operativo_config')
      .select('value')
      .eq('key', 'emails_reporte_pagos')
      .single();

    if (configData && Array.isArray(configData.value) && configData.value.length > 0) {
      toEmails = configData.value;
    }

    // 4. Armar HTML profesional del correo compilado desde MJML
    const montoTotalFormatted = `$ ${granTotalMonto.toLocaleString('es-AR')}`;
    const emailHtml = `<!doctype html><html lang="es" dir="auto" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office"><head><title>Reporte de Pagos — Districorr</title><!--[if !mso]><!--><meta http-equiv="X-UA-Compatible" content="IE=edge"><!--<![endif]--><meta http-equiv="Content-Type" content="text/html; charset=UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style type="text/css">#outlook a{padding:0}body{margin:0;padding:0;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%}table, td{border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt}img{border:0;height:auto;line-height:100%;outline:none;text-decoration:none;-ms-interpolation-mode:bicubic}p{display:block;margin:13px 0}</style><!--[if mso]>
    <noscript>
    <xml>
    <o:OfficeDocumentSettings>
      <o:AllowPNG/>
      <o:PixelsPerInch>96</o:PixelsPerInch>
    </o:OfficeDocumentSettings>
    </xml>
    </noscript>
    <![endif]--><!--[if lte mso 11]>
    <style type="text/css">
      .mj-outlook-group-fix { width:100% !important; }
    </style>
    <![endif]--><!--[if !mso]><!--><link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap" rel="stylesheet" type="text/css"><style type="text/css">@import url(https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap);</style><!--<![endif]--><style type="text/css">@media only screen and (min-width:480px){.mj-column-per-100{width:100%!important;max-width:100%}.mj-column-per-33-33{width:33.33%!important;max-width:33.33%}}</style><style media="screen and (min-width:480px)">.moz-text-html .mj-column-per-100{width:100%!important;max-width:100%}.moz-text-html .mj-column-per-33-33{width:33.33%!important;max-width:33.33%}</style><style type="text/css">@media (prefers-color-scheme: dark){.dark-bg{background-color:#0F172A!important}.dark-card{background-color:#1E293B!important;border-color:#334155!important}.dark-text{color:#F1F5F9!important}.dark-subtext{color:#94A3B8!important}}</style><meta name="color-scheme" content="light dark"><meta name="supported-color-schemes" content="light dark"></head><body style="word-spacing:normal;background-color:#F1F5F9"> <div style="display:none;font-size:1px;color:#ffffff;line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden">Resumen oficial de pagos y liquidaciones · Districorr Gestión IQ</div> <div aria-label="Reporte de Pagos — Districorr" aria-roledescription="email" role="article" lang="es" dir="auto" style="word-spacing:normal;background-color:#F1F5F9"> <!-- Top Accent Line --> <!--[if mso | IE]><table align="center" border="0" cellpadding="0" cellspacing="0" class="" role="presentation" style="width:600px;" width="600" ><tr><td style="line-height:0px;font-size:0px;mso-line-height-rule:exactly;"><![endif]--> <div style="margin:0px auto;max-width:600px"> <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="width:100%"> <tbody> <tr> <td style="direction:ltr;font-size:0px;padding:0px;text-align:center"> <!--[if mso | IE]><table role="presentation" border="0" cellpadding="0" cellspacing="0"><tr><td class="" style="vertical-align:top;width:600px;" ><![endif]--> <div class="mj-column-per-100 mj-outlook-group-fix" style="font-size:0px;text-align:left;direction:ltr;display:inline-block;vertical-align:top;width:100%"> <table border="0" cellpadding="0" cellspacing="0" role="presentation" width="100%"> <tbody> <tr> <td style="vertical-align:top;padding:0px"> <table border="0" cellpadding="0" cellspacing="0" role="presentation" width="100%"> <tbody> <tr> <td align="center" style="font-size:0px;padding:0px;word-break:break-word"> <p style="border-top:solid 4px #2563EB;font-size:1px;margin:0px auto;width:100%"> </p> <!--[if mso | IE]><table align="center" border="0" cellpadding="0" cellspacing="0" style="border-top:solid 4px #2563EB;font-size:1px;margin:0px auto;width:600px;" role="presentation" width="600px" ><tr><td style="height:0;line-height:0;"> &nbsp;
</td></tr></table><![endif]--> </td> </tr> </tbody> </table> </td> </tr> </tbody> </table> </div> <!--[if mso | IE]></td></tr></table><![endif]--> </td> </tr> </tbody> </table> </div> <!--[if mso | IE]></td></tr></table><![endif]--> <!-- Header Section --> <!--[if mso | IE]><table align="center" border="0" cellpadding="0" cellspacing="0" class="" role="presentation" style="width:600px;" width="600" bgcolor="#0F172A" ><tr><td style="line-height:0px;font-size:0px;mso-line-height-rule:exactly;"><![endif]--> <div style="background:#0F172A;background-color:#0F172A;margin:0px auto;max-width:600px"> <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="background:#0F172A;background-color:#0F172A;width:100%"> <tbody> <tr> <td style="direction:ltr;font-size:0px;padding:24px 28px;text-align:center"> <!--[if mso | IE]><table role="presentation" border="0" cellpadding="0" cellspacing="0"><tr><td class="" style="vertical-align:top;width:544px;" ><![endif]--> <div class="mj-column-per-100 mj-outlook-group-fix" style="font-size:0px;text-align:left;direction:ltr;display:inline-block;vertical-align:top;width:100%"> <table border="0" cellpadding="0" cellspacing="0" role="presentation" width="100%"> <tbody> <tr> <td style="vertical-align:top;padding:0px"> <table border="0" cellpadding="0" cellspacing="0" role="presentation" width="100%"> <tbody> <tr> <td align="left" style="font-size:0px;padding:0 0 6px 0;word-break:break-word"> <div style="font-family:Inter,Arial,-apple-system,BlinkMacSystemFont,sans-serif;font-size:11px;font-weight:800;letter-spacing:1px;line-height:1.6;text-align:left;color:#38BDF8">DISTRICORR • GESTIÓN IQ</div> </td> </tr> <tr> <td align="left" style="font-size:0px;padding:0 0 4px 0;word-break:break-word"> <div style="font-family:Inter,Arial,-apple-system,BlinkMacSystemFont,sans-serif;font-size:20px;font-weight:800;line-height:1.6;text-align:left;color:#FFFFFF">Resumen de Pagos y Liquidaciones</div> </td> </tr> <tr> <td align="left" style="font-size:0px;padding:0;word-break:break-word"> <div style="font-family:Inter,Arial,-apple-system,BlinkMacSystemFont,sans-serif;font-size:12px;line-height:1.6;text-align:left;color:#94A3B8">Período: ${periodoLabel}</div> </td> </tr> </tbody> </table> </td> </tr> </tbody> </table> </div> <!--[if mso | IE]></td></tr></table><![endif]--> </td> </tr> </tbody> </table> </div> <!--[if mso | IE]></td></tr></table><![endif]--> <!-- Main Content Card --> <!--[if mso | IE]><table align="center" border="0" cellpadding="0" cellspacing="0" class="" role="presentation" style="width:600px;" width="600" bgcolor="#FFFFFF" ><tr><td style="line-height:0px;font-size:0px;mso-line-height-rule:exactly;"><![endif]--> <div style="background:#FFFFFF;background-color:#FFFFFF;margin:0px auto;max-width:600px"> <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="background:#FFFFFF;background-color:#FFFFFF;width:100%"> <tbody> <tr> <td style="direction:ltr;font-size:0px;padding:28px 28px 20px 28px;text-align:center"> <!--[if mso | IE]><table role="presentation" border="0" cellpadding="0" cellspacing="0"><tr><td class="" style="vertical-align:top;width:544px;" ><![endif]--> <div class="mj-column-per-100 mj-outlook-group-fix" style="font-size:0px;text-align:left;direction:ltr;display:inline-block;vertical-align:top;width:100%"> <table border="0" cellpadding="0" cellspacing="0" role="presentation" width="100%"> <tbody> <tr> <td style="vertical-align:top;padding:0px"> <table border="0" cellpadding="0" cellspacing="0" role="presentation" width="100%"> <tbody> <tr> <td align="left" style="font-size:0px;padding:0 0 12px 0;word-break:break-word"> <div style="font-family:Inter,Arial,-apple-system,BlinkMacSystemFont,sans-serif;font-size:15px;font-weight:600;line-height:1.6;text-align:left;color:#0F172A">Hola equipo,</div> </td> </tr> <tr> <td align="left" style="font-size:0px;padding:0 0 20px 0;word-break:break-word"> <div style="font-family:Inter,Arial,-apple-system,BlinkMacSystemFont,sans-serif;font-size:14px;line-height:1.6;text-align:left;color:#475569">Les compartimos el reporte consolidado de pagos y liquidaciones correspondiente a esta semana. A continuación, el resumen de la actividad registrada:</div> </td> </tr> </tbody> </table> </td> </tr> </tbody> </table> </div> <!--[if mso | IE]></td></tr></table><![endif]--> </td> </tr> </tbody> </table> </div> <!--[if mso | IE]></td></tr></table><![endif]--> <!-- 3 KPI Cards --> <!--[if mso | IE]><table align="center" border="0" cellpadding="0" cellspacing="0" class="" role="presentation" style="width:600px;" width="600" bgcolor="#FFFFFF" ><tr><td style="line-height:0px;font-size:0px;mso-line-height-rule:exactly;"><![endif]--> <div style="background:#FFFFFF;background-color:#FFFFFF;margin:0px auto;max-width:600px"> <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="background:#FFFFFF;background-color:#FFFFFF;width:100%"> <tbody> <tr> <td style="direction:ltr;font-size:0px;padding:0 24px 24px 24px;text-align:center"> <!--[if mso | IE]><table role="presentation" border="0" cellpadding="0" cellspacing="0"><tr><td class="" style="vertical-align:top;width:184px;" ><![endif]--> <div class="mj-column-per-33-33 mj-outlook-group-fix" style="font-size:0px;text-align:left;direction:ltr;display:inline-block;vertical-align:top;width:100%"> <table border="0" cellpadding="0" cellspacing="0" role="presentation" width="100%"> <tbody> <tr> <td style="vertical-align:top;padding:4px"> <table border="0" cellpadding="0" cellspacing="0" role="presentation" width="100%"> <tbody> <tr> <td align="left" style="font-size:0px;padding:0;word-break:break-word"> <table cellpadding="0" cellspacing="0" width="100%" border="0" style="color:#000000;font-family:Inter,Arial,-apple-system,BlinkMacSystemFont,sans-serif;font-size:13px;line-height:22px;table-layout:auto;width:100%;border:none"> <tr> <td class="kpi-box" style="background-color:#F8FAFC;border:1px solid #E2E8F0;border-radius:12px;padding:14px 8px;text-align:center" bgcolor="#F8FAFC" align="center"> <div style="font-size:10px;font-weight:700;color:#64748B;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:4px">TOTAL LIQUIDADO</div> <div style="font-size:17px;font-weight:800;color:#059669">${montoTotalFormatted}</div> </td> </tr> </table> </td> </tr> </tbody> </table> </td> </tr> </tbody> </table> </div> <!--[if mso | IE]></td><td class="" style="vertical-align:top;width:184px;" ><![endif]--> <div class="mj-column-per-33-33 mj-outlook-group-fix" style="font-size:0px;text-align:left;direction:ltr;display:inline-block;vertical-align:top;width:100%"> <table border="0" cellpadding="0" cellspacing="0" role="presentation" width="100%"> <tbody> <tr> <td style="vertical-align:top;padding:4px"> <table border="0" cellpadding="0" cellspacing="0" role="presentation" width="100%"> <tbody> <tr> <td align="left" style="font-size:0px;padding:0;word-break:break-word"> <table cellpadding="0" cellspacing="0" width="100%" border="0" style="color:#000000;font-family:Inter,Arial,-apple-system,BlinkMacSystemFont,sans-serif;font-size:13px;line-height:22px;table-layout:auto;width:100%;border:none"> <tr> <td class="kpi-box" style="background-color:#F8FAFC;border:1px solid #E2E8F0;border-radius:12px;padding:14px 8px;text-align:center" bgcolor="#F8FAFC" align="center"> <div style="font-size:10px;font-weight:700;color:#64748B;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:4px">ÓRDENES</div> <div style="font-size:17px;font-weight:800;color:#0F172A">${totalPagosCount}</div> </td> </tr> </table> </td> </tr> </tbody> </table> </td> </tr> </tbody> </table> </div> <!--[if mso | IE]></td><td class="" style="vertical-align:top;width:184px;" ><![endif]--> <div class="mj-column-per-33-33 mj-outlook-group-fix" style="font-size:0px;text-align:left;direction:ltr;display:inline-block;vertical-align:top;width:100%"> <table border="0" cellpadding="0" cellspacing="0" role="presentation" width="100%"> <tbody> <tr> <td style="vertical-align:top;padding:4px"> <table border="0" cellpadding="0" cellspacing="0" role="presentation" width="100%"> <tbody> <tr> <td align="left" style="font-size:0px;padding:0;word-break:break-word"> <table cellpadding="0" cellspacing="0" width="100%" border="0" style="color:#000000;font-family:Inter,Arial,-apple-system,BlinkMacSystemFont,sans-serif;font-size:13px;line-height:22px;table-layout:auto;width:100%;border:none"> <tr> <td class="kpi-box" style="background-color:#F8FAFC;border:1px solid #E2E8F0;border-radius:12px;padding:14px 8px;text-align:center" bgcolor="#F8FAFC" align="center"> <div style="font-size:10px;font-weight:700;color:#64748B;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:4px">CIRUGÍAS</div> <div style="font-size:17px;font-weight:800;color:#2563EB">${totalCirugiasCount}</div> </td> </tr> </table> </td> </tr> </tbody> </table> </td> </tr> </tbody> </table> </div> <!--[if mso | IE]></td></tr></table><![endif]--> </td> </tr> </tbody> </table> </div> <!--[if mso | IE]></td></tr></table><![endif]--> <!-- Attached PDF Callout --> <!--[if mso | IE]><table align="center" border="0" cellpadding="0" cellspacing="0" class="" role="presentation" style="width:600px;" width="600" bgcolor="#FFFFFF" ><tr><td style="line-height:0px;font-size:0px;mso-line-height-rule:exactly;"><![endif]--> <div style="background:#FFFFFF;background-color:#FFFFFF;margin:0px auto;max-width:600px"> <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="background:#FFFFFF;background-color:#FFFFFF;width:100%"> <tbody> <tr> <td style="direction:ltr;font-size:0px;padding:0 28px 28px 28px;text-align:center"> <!--[if mso | IE]><table role="presentation" border="0" cellpadding="0" cellspacing="0"><tr><td class="" style="vertical-align:top;width:544px;" ><![endif]--> <div class="mj-column-per-100 mj-outlook-group-fix" style="font-size:0px;text-align:left;direction:ltr;display:inline-block;vertical-align:top;width:100%"> <table border="0" cellpadding="0" cellspacing="0" role="presentation" width="100%"> <tbody> <tr> <td style="vertical-align:top;padding:0px"> <table border="0" cellpadding="0" cellspacing="0" role="presentation" width="100%"> <tbody> <tr> <td align="left" style="font-size:0px;padding:0;word-break:break-word"> <table cellpadding="0" cellspacing="0" width="100%" border="0" style="color:#000000;font-family:Inter,Arial,-apple-system,BlinkMacSystemFont,sans-serif;font-size:13px;line-height:22px;table-layout:auto;width:100%;border:none"> <tr> <td class="attach-box" style="background-color:#F8FAFC;border:1px solid #E2E8F0;border-left:4px solid #2563EB;border-radius:8px;padding:12px 16px" bgcolor="#F8FAFC"> <div style="font-size:13px;font-weight:700;color:#0F172A"> 📄 Archivo adjunto: <span style="color:#2563EB">${filename}</span> </div> <div style="font-size:12px;color:#64748B;margin-top:3px"> Incluye el detalle por cada instrumentador, cirugías, pacientes y comprobantes correspondientes. </div> </td> </tr> </table> </td> </tr> <tr> <td align="left" style="font-size:0px;padding:20px 0 0 0;word-break:break-word"> <div style="font-family:Inter,Arial,-apple-system,BlinkMacSystemFont,sans-serif;font-size:13px;line-height:1.6;text-align:left;color:#64748B">Saludos cordiales,<br> <strong style="color:#0F172A">Administración • Districorr</strong></div> </td> </tr> </tbody> </table> </td> </tr> </tbody> </table> </div> <!--[if mso | IE]></td></tr></table><![endif]--> </td> </tr> </tbody> </table> </div> <!--[if mso | IE]></td></tr></table><![endif]--> <!-- Footer --> <!--[if mso | IE]><table align="center" border="0" cellpadding="0" cellspacing="0" class="" role="presentation" style="width:600px;" width="600" bgcolor="#F1F5F9" ><tr><td style="line-height:0px;font-size:0px;mso-line-height-rule:exactly;"><![endif]--> <div style="background:#F1F5F9;background-color:#F1F5F9;margin:0px auto;max-width:600px"> <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="background:#F1F5F9;background-color:#F1F5F9;width:100%"> <tbody> <tr> <td style="direction:ltr;font-size:0px;padding:20px 28px;text-align:center"> <!--[if mso | IE]><table role="presentation" border="0" cellpadding="0" cellspacing="0"><tr><td class="" style="vertical-align:top;width:544px;" ><![endif]--> <div class="mj-column-per-100 mj-outlook-group-fix" style="font-size:0px;text-align:left;direction:ltr;display:inline-block;vertical-align:top;width:100%"> <table border="0" cellpadding="0" cellspacing="0" role="presentation" width="100%"> <tbody> <tr> <td style="vertical-align:top;padding:0px"> <table border="0" cellpadding="0" cellspacing="0" role="presentation" width="100%"> <tbody> <tr> <td align="center" style="font-size:0px;padding:0;word-break:break-word"> <div style="font-family:Inter,Arial,-apple-system,BlinkMacSystemFont,sans-serif;font-size:11px;line-height:1.5;text-align:center;color:#94A3B8">Districorr • Gestión IQ • Sistema de Trazabilidad Quirúrgica<br> Este es un correo automático programado para el área administrativa y contable.</div> </td> </tr> </tbody> </table> </td> </tr> </tbody> </table> </div> <!--[if mso | IE]></td></tr></table><![endif]--> </td> </tr> </tbody> </table> </div> <!--[if mso | IE]></td></tr></table><![endif]--> </div> </body></html>`;

    // 5. Enviar vía Resend si la API Key existe
    let emailSent = false;
    let resendResponseData = null;

    if (resendApiKey) {
      const resendResp = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${resendApiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          from: "DISTRICORR — Reportes <notificaciones@districorr.com.ar>",
          to: toEmails,
          subject: `Reporte Semanal de Pagos · Districorr (${montoTotalFormatted})`,
          html: emailHtml,
          attachments: [
            {
              filename,
              content: base64
            }
          ]
        })
      });

      resendResponseData = await resendResp.json();
      emailSent = resendResp.ok;
    }

    return new Response(
      JSON.stringify({
        success: true,
        periodo: periodoLabel,
        totalOrdenes: totalPagosCount,
        totalCirugias: totalCirugiasCount,
        montoTotal: granTotalMonto,
        destinatarios: toEmails,
        emailSent,
        resendResponseData
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ success: false, error: err.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
