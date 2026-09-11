// supabase/functions/send-reporte-cajas-sin-ficha/index.ts
// Función Serverless Edge de Supabase INDEPENDIENTE para envío del Reporte de Cirugías con Cajas Devueltas sin Ficha Completada

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.8";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const DEFAULT_EMAILS = [
  "sistemas@districorr.com.ar",
  "logistica@districorr.com.ar",
  "auxiliardeposito@districorr.com.ar"
];

function formatDateOnly(dateStr: string | null): string {
  if (!dateStr) return '-';
  const clean = String(dateStr).split('T')[0];
  const parts = clean.split('-');
  if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
  return dateStr;
}

function formatDateTimeART(isoStr: string | null): string {
  if (!isoStr) return '-';
  try {
    const d = new Date(isoStr);
    return d.toLocaleString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'America/Argentina/Buenos_Aires'
    }) + ' hs';
  } catch {
    return isoStr;
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || Deno.env.get('SUPABASE_ANON_KEY') || '';
    const resendApiKey = Deno.env.get('RESEND_API_KEY') || '';
    const appBaseUrl = Deno.env.get('APP_BASE_URL') || 'https://gestion-iq-districorr.vercel.app';

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY no configuradas.");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const today = new Date();
    const sixtyDaysAgo = new Date(today);
    sixtyDaysAgo.setDate(today.getDate() - 60);
    sixtyDaysAgo.setHours(0, 0, 0, 0);

    // 1. Consultar cirugías en estado PENDIENTE de los últimos 60 días
    const { data: pendingFichasRaw, error: fichasErr } = await supabase
      .from('reportes')
      .select('id, id_cirugia, paciente, medico, lugar_cirugia, fecha_cirugia, estado, instrumentador, instrumentador_completado')
      .eq('estado', 'Pendiente')
      .gte('fecha_cirugia', sixtyDaysAgo.toISOString().split('T')[0])
      .order('fecha_cirugia', { ascending: false });

    if (fichasErr) throw fichasErr;

    const pendingFichas = pendingFichasRaw || [];
    const pendingIds = pendingFichas.map((s: any) => s.id).filter(Boolean);

    let anomalias: any[] = [];
    if (pendingIds.length > 0) {
      // 2. Consultar controles de logística y movimientos en paralelo
      const [controlesRes, movimientosRes] = await Promise.all([
        supabase
          .from('logistica_controles')
          .select('cirugia_id, estado, observaciones, created_at, fecha_retiro')
          .in('cirugia_id', pendingIds),
        supabase
          .from('logistica_informe_movimientos')
          .select('reporte_id, tipo_movimiento, cantidad_cajas, cantidad_bultos, destino, observaciones')
          .in('reporte_id', pendingIds)
      ]);

      const ctrlMap = new Map();
      if (controlesRes.data) {
        controlesRes.data.forEach((c: any) => ctrlMap.set(String(c.cirugia_id), c));
      }

      const movMap = new Map();
      if (movimientosRes.data) {
        movimientosRes.data.forEach((m: any) => {
          if (!movMap.has(String(m.reporte_id))) {
            movMap.set(String(m.reporte_id), []);
          }
          movMap.get(String(m.reporte_id)).push(m);
        });
      }

      anomalias = pendingFichas
        .filter((s: any) => {
          const hasCtrl = ctrlMap.has(String(s.id));
          const movs = movMap.get(String(s.id)) || [];
          const hasEntrega = movs.some((m: any) => m.tipo_movimiento === 'Entrega de cajas');
          const hasRetiro = movs.some((m: any) => ['Retiro de cajas', 'Traslado a Central'].includes(m.tipo_movimiento));
          return hasCtrl || (hasEntrega && hasRetiro);
        })
        .map((s: any) => {
          const ctrl = ctrlMap.get(String(s.id));
          const movs = movMap.get(String(s.id)) || [];
          const rawEst = (ctrl?.estado || '').toLowerCase().trim();
          const d = new Date(`${String(s.fecha_cirugia).split('T')[0]}T00:00:00`);
          const dias = !isNaN(d.getTime())
            ? Math.max(0, Math.floor((today.getTime() - d.getTime()) / (1000 * 60 * 60 * 24)))
            : 0;

          return {
            ...s,
            dias_antiguedad: dias,
            tiene_control: Boolean(ctrl),
            control_estado: rawEst || (ctrl ? 'ok' : 'retiro_chofer'),
            control_observaciones: ctrl?.observaciones || '',
            control_fecha: ctrl?.created_at || ctrl?.fecha_retiro || null,
            movimientos_count: movs.length
          };
        });
    }

    // 3. Ordenar por días de antigüedad
    anomalias.sort((a: any, b: any) => b.dias_antiguedad - a.dias_antiguedad);

    // 4. Obtener destinatarios configurados específicamente para este reporte
    let toEmails: string[] = DEFAULT_EMAILS;
    const { data: configData } = await supabase
      .from('resumen_operativo_config')
      .select('value')
      .eq('key', 'emails_destinatarios_cajas_sin_ficha')
      .maybeSingle();

    if (configData && Array.isArray(configData.value) && configData.value.length > 0) {
      toEmails = configData.value;
    }

    const totalCount = anomalias.length;
    const totalConControlOK = anomalias.filter((s: any) => s.control_estado === 'ok').length;
    const totalConProblemas = anomalias.filter((s: any) => ['problemas', 'revision'].includes(s.control_estado)).length;
    const totalSinTecnico = anomalias.filter((s: any) => !s.instrumentador && !s.instrumentador_completado).length;
    const fechaHoyStr = formatDateOnly(today.toISOString());
    const resumenOperativoUrl = `${appBaseUrl}/admin/resumen-operativo`;

    // 5. Construcción de filas de la tabla
    const rowsHtml = anomalias.map((s: any, idx: number) => {
      const bg = idx % 2 === 0 ? '#ffffff' : '#faf5ff';
      const num = String(idx + 1).padStart(2, '0');
      const fechaCx = formatDateOnly(s.fecha_cirugia);
      const nombreInst = s.instrumentador || s.instrumentador_completado;

      let badgeControl = '';
      if (s.control_estado === 'ok') {
        badgeControl = `<div><strong style="color:#059669;font-size:11px;">🟢 Control OK (Devolución)</strong></div>`;
      } else if (s.control_estado === 'problemas') {
        badgeControl = `<div><span style="color:#dc2626;font-weight:800;background:#fee2e2;padding:2px 6px;border-radius:4px;font-size:10px;">🔴 Con Problemas</span></div>`;
      } else if (s.control_estado === 'revision') {
        badgeControl = `<div><span style="color:#b45309;font-weight:800;background:#fef3c7;padding:2px 6px;border-radius:4px;font-size:10px;">⚠️ En Revisión</span></div>`;
      } else {
        badgeControl = `<div><span style="color:#2563eb;font-weight:700;background:#eff6ff;padding:2px 6px;border-radius:4px;font-size:10px;">📦 Retirada por Chofer</span></div>`;
      }

      if (s.control_observaciones) {
        badgeControl += `<div style="font-size:9px;color:#7e22ce;margin-top:2px;">Obs: ${s.control_observaciones}</div>`;
      }

      const badgeTecnico = nombreInst
        ? `<div><strong style="color:#334155;font-size:11px;">${nombreInst}</strong></div><div style="font-size:9px;color:#d97706;font-weight:700;">⚠️ Ficha no completada</div>`
        : `<span style="color:#7e22ce;font-weight:800;background:#f3e8ff;padding:2px 6px;border-radius:4px;font-size:10px;">❓ No identificado</span>`;

      return `
        <tr bgcolor="${bg}">
          <td align="center" style="padding:10px 6px;border-bottom:1px solid #f3e8ff;font-size:10px;color:#a855f7;font-weight:700;">${num}</td>
          <td style="padding:10px 8px;border-bottom:1px solid #f3e8ff;">
            <div style="font-size:11px;font-weight:800;color:#0f172a;">${s.paciente || 'Sin especificar'}</div>
            <div style="font-size:10px;color:#64748b;margin-top:1px;">Cx: ${fechaCx} · ${s.lugar_cirugia || 'Sanatorio sin especificar'}</div>
          </td>
          <td style="padding:10px 8px;border-bottom:1px solid #f3e8ff;font-size:11px;color:#334155;font-weight:600;">
            ${s.medico || '—'}
          </td>
          <td style="padding:10px 8px;border-bottom:1px solid #f3e8ff;">
            ${badgeControl}
          </td>
          <td style="padding:10px 8px;border-bottom:1px solid #f3e8ff;">
            ${badgeTecnico}
          </td>
          <td align="center" style="padding:10px 8px;border-bottom:1px solid #f3e8ff;">
            <a href="${resumenOperativoUrl}" target="_blank" style="display:inline-block;padding:6px 12px;background:#7e22ce;color:#ffffff;font-size:10px;font-weight:800;text-decoration:none;border-radius:6px;">
              Resolver ➔
            </a>
          </td>
        </tr>
      `;
    }).join('');

    // 6. Construcción del Email HTML
    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Reporte de Cirugías con Cajas Devueltas sin Ficha</title>
      </head>
      <body style="margin:0;padding:0;background-color:#f5f3ff;font-family:Arial,Helvetica,sans-serif;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#f5f3ff;padding:20px 10px;">
          <tr>
            <td align="center">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:720px;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e9d5ff;">
                <tr><td height="4" style="background:#7e22ce;"></td></tr>
                
                <!-- Header -->
                <tr>
                  <td style="padding:24px 28px;border-bottom:1px solid #f3e8ff;">
                    <div style="font-size:12px;font-weight:800;color:#7e22ce;letter-spacing:0.5px;">DISTRICORR · GESTIÓN IQ · TRAZABILIDAD LOGÍSTICA</div>
                    <h1 style="margin:6px 0 0 0;font-size:20px;font-weight:800;color:#581c87;">Reporte de Cajas Devueltas sin Ficha Completada</h1>
                    <p style="margin:4px 0 0 0;font-size:12px;color:#6b21a8;">
                      Cirugías con ciclo logístico completado pero en estado <strong>Pendiente</strong> · Emitido el ${fechaHoyStr}
                    </p>
                  </td>
                </tr>

                <!-- Tarjetas de Resumen -->
                <tr>
                  <td style="padding:20px 28px;background:#faf5ff;border-bottom:1px solid #e9d5ff;">
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                      <tr>
                        <td width="25%" style="padding:10px;background:#ffffff;border:1px solid #e9d5ff;border-radius:12px;text-align:center;">
                          <div style="font-size:20px;font-weight:800;color:#7e22ce;">${totalCount}</div>
                          <div style="font-size:8px;font-weight:700;color:#7e22ce;text-transform:uppercase;margin-top:2px;">TOTAL DETECTADAS</div>
                        </td>
                        <td width="5"></td>
                        <td width="25%" style="padding:10px;background:#ffffff;border:1px solid #bbf7d0;border-radius:12px;text-align:center;">
                          <div style="font-size:20px;font-weight:800;color:#059669;">${totalConControlOK}</div>
                          <div style="font-size:8px;font-weight:700;color:#059669;text-transform:uppercase;margin-top:2px;">CONTROL OK</div>
                        </td>
                        <td width="5"></td>
                        <td width="25%" style="padding:10px;background:#ffffff;border:1px solid #fde68a;border-radius:12px;text-align:center;">
                          <div style="font-size:20px;font-weight:800;color:#b45309;">${totalConProblemas}</div>
                          <div style="font-size:8px;font-weight:700;color:#b45309;text-transform:uppercase;margin-top:2px;">OBSERVADAS</div>
                        </td>
                        <td width="5"></td>
                        <td width="25%" style="padding:10px;background:#ffffff;border:1px solid #e9d5ff;border-radius:12px;text-align:center;">
                          <div style="font-size:20px;font-weight:800;color:#581c87;">${totalSinTecnico}</div>
                          <div style="font-size:8px;font-weight:700;color:#581c87;text-transform:uppercase;margin-top:2px;">SIN TÉCNICO ASIGNADO</div>
                        </td>
                      </tr>
                    </table>

                    <div style="margin-top:16px;text-align:center;">
                      <a href="${resumenOperativoUrl}" target="_blank" style="display:inline-block;padding:12px 28px;background-color:#7e22ce;color:#ffffff;font-size:13px;font-weight:800;text-decoration:none;border-radius:10px;box-shadow:0 4px 12px rgba(126,34,206,0.25);">
                        📦 Abrir Resumen Operativo para Identificar y Regularizar
                      </a>
                    </div>
                  </td>
                </tr>

                <!-- TABLA -->
                <tr>
                  <td style="padding:20px 28px;">
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border-collapse:collapse;border:1px solid #e9d5ff;border-radius:8px;overflow:hidden;">
                      <thead>
                        <tr bgcolor="#581c87" style="color:#ffffff;font-size:9px;text-transform:uppercase;">
                          <th style="padding:8px 6px;text-align:center;">#</th>
                          <th style="padding:8px;text-align:left;">Paciente / Sanatorio</th>
                          <th style="padding:8px;text-align:left;">Médico</th>
                          <th style="padding:8px;text-align:left;">📦 Control Devolución</th>
                          <th style="padding:8px;text-align:left;">Técnico / Ficha</th>
                          <th style="padding:8px;text-align:center;">Acción</th>
                        </tr>
                      </thead>
                      <tbody>
                        ${rowsHtml || '<tr><td colspan="6" align="center" style="padding:15px;font-size:11px;color:#94a3b8;">¡Excelente! No hay cirugías con cajas devueltas pendientes de ficha.</td></tr>'}
                      </tbody>
                    </table>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="padding:14px 28px;background:#1e1b4b;color:#c7d2fe;font-size:10px;text-align:center;">
                    DISTRICORR · Gestión IQ — Reporte Automático de Trazabilidad Logística.
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;

    // 7. Envío por Resend
    let emailResult = null;
    if (resendApiKey) {
      const subject = `📦 Reporte de Cajas Devueltas sin Ficha (${fechaHoyStr}) · ${totalCount} cirugías detectadas`;

      const resendResp = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${resendApiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          from: "DISTRICORR — Trazabilidad Logística <notificaciones@districorr.com.ar>",
          to: toEmails,
          subject,
          html: emailHtml
        })
      });

      emailResult = await resendResp.json();
    }

    return new Response(
      JSON.stringify({
        success: true,
        totalCount,
        totalConControlOK,
        totalConProblemas,
        totalSinTecnico,
        toEmails,
        emailSent: Boolean(resendApiKey && emailResult?.id),
        emailResult
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
