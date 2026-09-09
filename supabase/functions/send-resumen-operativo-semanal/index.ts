import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE',
};

const DEFAULT_EMAILS = [
  "sistemas@districorr.com.ar",
  "contable@districorr.com.ar",
  "auxiliardeposito@districorr.com.ar"
];

function getPeriodRange() {
  const now = new Date();
  
  // Ajustar a zona horaria de Argentina (UTC-3)
  const artNow = new Date(now.getTime() - 3 * 60 * 60 * 1000);
  
  // Buscar el sábado anterior (o el mismo día si hoy es sábado)
  const currentDay = artNow.getUTCDay();
  const daysSinceSaturday = (currentDay + 1) % 7;
  
  const saturdayDate = new Date(artNow);
  saturdayDate.setUTCDate(artNow.getUTCDate() - daysSinceSaturday);
  saturdayDate.setUTCHours(0, 0, 0, 0);

  // El miércoles del período (hoy a las 15:00 ART)
  const wednesdayDate = new Date(artNow);
  wednesdayDate.setUTCHours(15, 0, 0, 0);

  // Convertir ART a UTC ISO (+3h)
  const desdeIso = new Date(saturdayDate.getTime() + 3 * 60 * 60 * 1000).toISOString();
  const hastaIso = new Date(wednesdayDate.getTime() + 3 * 60 * 60 * 1000).toISOString();

  // Semana Key para idempotencia (ej: 2026-W35)
  const year = saturdayDate.getUTCFullYear();
  const month = String(saturdayDate.getUTCMonth() + 1).padStart(2, '0');
  const day = String(saturdayDate.getUTCDate()).padStart(2, '0');
  const semanaKey = `${year}-${month}-${day}_W${Math.ceil(saturdayDate.getUTCDate() / 7)}`;

  return { desdeIso, hastaIso, semanaKey, saturdayDate, wednesdayDate };
}

function formatDateTimeART(isoStr: string | null) {
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

function formatDateOnly(dateStr: string | null) {
  if (!dateStr) return '-';
  const clean = String(dateStr).split('T')[0];
  const parts = clean.split('-');
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  return dateStr;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { status: 200, headers: corsHeaders });
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
    const { desdeIso, hastaIso, semanaKey } = getPeriodRange();

    // 1. Invocación Idempotente de RPC para generar o consultar el lote inmutable
    const { data: rpcLoteResult } = await supabase.rpc('generar_o_consultar_lote_semanal', {
      p_desde: desdeIso,
      p_hasta: hastaIso,
      p_semana_key: semanaKey
    });

    const token = rpcLoteResult?.token || '';
    const printLoteUrl = `${appBaseUrl}/resumen-operativo/lote/${token}`;
    const pagosDashboardUrl = `${appBaseUrl}/admin/pagos`;

    // 2. Obtener lista de destinatarios configurables
    let toEmails: string[] = DEFAULT_EMAILS;
    const { data: configData } = await supabase
      .from('resumen_operativo_config')
      .select('value')
      .eq('key', 'emails_destinatarios')
      .single();

    if (configData && Array.isArray(configData.value) && configData.value.length > 0) {
      toEmails = configData.value;
    }

    // 3. Consultar todas las cirugías en estado ENVIADO pendientes de pago
    const { data: pendingSurgeriesRaw, error: rpcError } = await supabase.rpc('get_todas_cirugias_pendientes');
    if (rpcError) {
      throw new Error(`Error en RPC get_todas_cirugias_pendientes: ${rpcError.message}`);
    }

    const allPending = pendingSurgeriesRaw || [];

    // 4. Filtrar cirugías dentro de los últimos 2 meses (60 días)
    const today = new Date();
    const sixtyDaysAgo = new Date(today);
    sixtyDaysAgo.setDate(today.getDate() - 60);
    sixtyDaysAgo.setHours(0, 0, 0, 0);

    const pending60Days = allPending.filter((s: any) => {
      if (!s.fecha_cirugia) return false;
      const d = new Date(`${String(s.fecha_cirugia).split('T')[0]}T00:00:00`);
      return !isNaN(d.getTime()) && d >= sixtyDaysAgo;
    });

    const surgeryIds = pending60Days.map((s: any) => s.id).filter(Boolean);

    // 5. Consultar en lote los controles de logística con estado y observaciones
    const controlMap = new Map();
    if (surgeryIds.length > 0) {
      const { data: controlesData } = await supabase
        .from('logistica_controles')
        .select('cirugia_id, estado, observaciones, created_at')
        .in('cirugia_id', surgeryIds);

      if (controlesData) {
        controlesData.forEach((c: any) => {
          controlMap.set(String(c.cirugia_id), c);
        });
      }
    }

    // 6. Enriquecer con cálculo de antigüedad, estado de control y problemas
    const enrichedSurgeries = pending60Days.map((s: any) => {
      const d = new Date(`${String(s.fecha_cirugia).split('T')[0]}T00:00:00`);
      const diasAntiguedad = !isNaN(d.getTime())
        ? Math.max(0, Math.floor((today.getTime() - d.getTime()) / (1000 * 60 * 60 * 24)))
        : 0;

      const control = controlMap.get(String(s.id));
      const tieneControl = Boolean(control);
      const rawEstado = (control?.estado || '').toLowerCase().trim();
      const controlEstado = control?.estado || (tieneControl ? 'OK' : null);
      const controlObservaciones = control?.observaciones || '';
      const controlFecha = control?.created_at || null;

      const esOk = tieneControl && (rawEstado === 'ok' || rawEstado === 'correcto');
      const tieneProblemas = tieneControl && (rawEstado === 'problemas' || rawEstado === 'con problemas' || rawEstado === 'error');
      const necesitaRevision = tieneControl && (rawEstado === 'revision' || rawEstado === 'necesita revision');

      return {
        ...s,
        dias_antiguedad: diasAntiguedad,
        tiene_control: tieneControl,
        control_estado: controlEstado,
        control_observaciones: controlObservaciones,
        control_fecha: controlFecha,
        es_ok: esOk,
        tiene_problemas: tieneProblemas,
        necesita_revision: necesitaRevision,
        apto_para_pago: esOk
      };
    });

    // Ordenar: primero las OK (listas para pago), luego las con problemas/revisión, y al final las sin control
    enrichedSurgeries.sort((a: any, b: any) => {
      const score = (item: any) => item.es_ok ? 3 : (item.tiene_problemas || item.necesita_revision) ? 2 : 1;
      if (score(b) !== score(a)) return score(b) - score(a);
      return b.dias_antiguedad - a.dias_antiguedad;
    });

    // Métricas de resumen
    const totalCount = enrichedSurgeries.length;
    const totalListasParaPago = enrichedSurgeries.filter((s: any) => s.es_ok).length;
    const totalProblemas = enrichedSurgeries.filter((s: any) => s.tiene_problemas).length;
    const totalFaltaControl = enrichedSurgeries.filter((s: any) => !s.tiene_control).length;
    const totalInst = new Set(enrichedSurgeries.map((s: any) => s.instrumentador_nombre || s.instrumentador).filter(Boolean)).size;

    const fechaHoyStr = formatDateOnly(today.toISOString());

    // 7. Construcción de filas de la Tabla Única Unificada
    const rowsHtml = enrichedSurgeries.map((s: any, idx: number) => {
      const bg = idx % 2 === 0 ? '#ffffff' : '#f8fafc';
      const num = String(idx + 1).padStart(2, '0');
      const nombreInst = s.instrumentador_nombre || s.instrumentador || '-';
      const fechaCx = formatDateOnly(s.fecha_cirugia);

      // Badge de Antigüedad
      const badgeAntiguedad = s.dias_antiguedad >= 21
        ? `<span style="color:#b91c1c;font-weight:800;background:#fee2e2;padding:2px 6px;border-radius:4px;font-size:10px;">${s.dias_antiguedad}d</span>`
        : s.dias_antiguedad >= 14
        ? `<span style="color:#b45309;font-weight:700;background:#fef3c7;padding:2px 6px;border-radius:4px;font-size:10px;">${s.dias_antiguedad}d</span>`
        : `<span style="color:#475569;background:#f1f5f9;padding:2px 6px;border-radius:4px;font-size:10px;">${s.dias_antiguedad}d</span>`;

      // Badge y detalle de Control de Logística
      let badgeControl = '';
      if (s.es_ok) {
        badgeControl = `
          <div><strong style="color:#059669;font-size:11px;">🟢 OK (Devolución)</strong></div>
          <div style="font-size:9px;color:#64748b;margin-top:1px;">${formatDateTimeART(s.control_fecha)}</div>
        `;
      } else if (s.tiene_problemas) {
        badgeControl = `
          <div><span style="color:#dc2626;font-weight:800;background:#fee2e2;border:1px solid #fecaca;padding:2px 6px;border-radius:4px;font-size:10px;">🔴 Con Problemas</span></div>
          ${s.control_observaciones ? `<div style="font-size:9px;color:#b91c1c;margin-top:2px;font-weight:600;">Obs: ${s.control_observaciones}</div>` : ''}
          <div style="font-size:9px;color:#64748b;margin-top:1px;">${formatDateTimeART(s.control_fecha)}</div>
        `;
      } else if (s.necesita_revision) {
        badgeControl = `
          <div><span style="color:#b45309;font-weight:800;background:#fef3c7;border:1px solid #fde68a;padding:2px 6px;border-radius:4px;font-size:10px;">⚠️ En Revisión</span></div>
          ${s.control_observaciones ? `<div style="font-size:9px;color:#92400e;margin-top:2px;font-weight:600;">Obs: ${s.control_observaciones}</div>` : ''}
          <div style="font-size:9px;color:#64748b;margin-top:1px;">${formatDateTimeART(s.control_fecha)}</div>
        `;
      } else {
        badgeControl = `<span style="color:#b45309;font-weight:700;background:#fffbeb;border:1px solid #fde68a;padding:2px 6px;border-radius:4px;font-size:10px;">⏳ Falta control</span>`;
      }

      // Estado de Pago
      let badgeEstadoPago = '';
      if (s.es_ok || s.tiene_problemas || s.necesita_revision) {
        badgeEstadoPago = `<span style="color:#047857;font-weight:800;background:#d1fae5;padding:2px 6px;border-radius:4px;font-size:10px;">✅ Listo para pago</span>`;
      } else {
        badgeEstadoPago = `<span style="color:#b45309;font-weight:700;background:#fef3c7;padding:2px 6px;border-radius:4px;font-size:10px;">⏳ Falta control</span>`;
      }

      return `
        <tr bgcolor="${bg}">
          <td align="center" style="padding:10px 6px;border-bottom:1px solid #e2e8f0;font-size:10px;color:#94a3b8;font-weight:700;">${num}</td>
          <td style="padding:10px 8px;border-bottom:1px solid #e2e8f0;">
            <div style="font-size:11px;font-weight:800;color:#0f172a;">${s.paciente || 'Sin especificar'}</div>
            <div style="font-size:10px;color:#64748b;margin-top:1px;">Cx: ${fechaCx}</div>
          </td>
          <td style="padding:10px 8px;border-bottom:1px solid #e2e8f0;font-size:11px;color:#334155;font-weight:600;">
            ${nombreInst}
          </td>
          <td style="padding:10px 8px;border-bottom:1px solid #e2e8f0;">
            ${badgeControl}
          </td>
          <td align="center" style="padding:10px 6px;border-bottom:1px solid #e2e8f0;">
            ${badgeAntiguedad}
          </td>
          <td align="center" style="padding:10px 8px;border-bottom:1px solid #e2e8f0;">
            ${badgeEstadoPago}
          </td>
        </tr>
      `;
    }).join('');

    // 8. Construcción del Email HTML Ejecutivo Unificado
    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Reporte de Cirugías Enviadas Pendientes de Pago</title>
      </head>
      <body style="margin:0;padding:0;background-color:#eef2f7;font-family:Arial,Helvetica,sans-serif;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#eef2f7;padding:20px 10px;">
          <tr>
            <td align="center">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:720px;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #dfe6ef;">
                <tr><td height="4" style="background:#2563eb;"></td></tr>
                
                <!-- Header -->
                <tr>
                  <td style="padding:24px 28px;border-bottom:1px solid #f1f5f9;">
                    <div style="font-size:12px;font-weight:800;color:#2563eb;letter-spacing:0.5px;">DISTRICORR · GESTIÓN IQ</div>
                    <h1 style="margin:6px 0 0 0;font-size:20px;font-weight:800;color:#0f172a;">Reporte Semanal de Pagos Pendientes</h1>
                    <p style="margin:4px 0 0 0;font-size:12px;color:#64748b;">
                      Período evaluado: <strong>Últimos 2 Meses (60 días)</strong> · Emitido el ${fechaHoyStr} a las 15:00 hs
                    </p>
                  </td>
                </tr>

                <!-- Tarjetas de Resumen Ejecutivo -->
                <tr>
                  <td style="padding:20px 28px;background:#f8fafc;border-bottom:1px solid #e2e8f0;">
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                      <tr>
                        <td width="25%" style="padding:10px;background:#ffffff;border:1px solid #e2e8f0;border-radius:12px;text-align:center;">
                          <div style="font-size:20px;font-weight:800;color:#2563eb;">${totalCount}</div>
                          <div style="font-size:8px;font-weight:700;color:#94a3b8;text-transform:uppercase;margin-top:2px;">TOTAL ENVIADAS</div>
                        </td>
                        <td width="5"></td>
                        <td width="25%" style="padding:10px;background:#ffffff;border:1px solid #bbf7d0;border-radius:12px;text-align:center;">
                          <div style="font-size:20px;font-weight:800;color:#059669;">${totalListasParaPago}</div>
                          <div style="font-size:8px;font-weight:700;color:#059669;text-transform:uppercase;margin-top:2px;">LISTAS PARA PAGO</div>
                        </td>
                        <td width="5"></td>
                        <td width="25%" style="padding:10px;background:#ffffff;border:1px solid ${totalProblemas > 0 ? '#fecaca' : '#fde68a'};border-radius:12px;text-align:center;">
                          <div style="font-size:20px;font-weight:800;color:${totalProblemas > 0 ? '#dc2626' : '#b45309'};">${totalProblemas > 0 ? totalProblemas : totalFaltaControl}</div>
                          <div style="font-size:8px;font-weight:700;color:${totalProblemas > 0 ? '#b91c1c' : '#b45309'};text-transform:uppercase;margin-top:2px;">${totalProblemas > 0 ? 'CON PROBLEMAS' : 'FALTA CONTROL'}</div>
                        </td>
                        <td width="5"></td>
                        <td width="25%" style="padding:10px;background:#ffffff;border:1px solid #e2e8f0;border-radius:12px;text-align:center;">
                          <div style="font-size:20px;font-weight:800;color:#4f46e5;">${totalInst}</div>
                          <div style="font-size:8px;font-weight:700;color:#94a3b8;text-transform:uppercase;margin-top:2px;">PROFESIONALES</div>
                        </td>
                      </tr>
                    </table>

                    <!-- Botón Principal: Abrir e Imprimir Fichas Público -->
                    <div style="margin-top:16px;text-align:center;">
                      <a href="${printLoteUrl}" target="_blank" style="display:inline-block;padding:12px 28px;background-color:#2563eb;color:#ffffff;font-size:13px;font-weight:800;text-decoration:none;border-radius:10px;box-shadow:0 4px 12px rgba(37,99,235,0.25);">
                        📄 Abrir e Imprimir Fichas de Cirugía (PDF)
                      </a>
                    </div>

                    <div style="margin-top:8px;text-align:center;">
                      <a href="${pagosDashboardUrl}" target="_blank" style="font-size:11px;color:#64748b;text-decoration:underline;">
                        O ingresar a la Estación de Pagos Rápidos ›
                      </a>
                    </div>
                  </td>
                </tr>

                <!-- TABLA ÚNICA UNIFICADA -->
                <tr>
                  <td style="padding:20px 28px;">
                    <div style="font-size:12px;font-weight:800;color:#0f172a;margin-bottom:10px;">
                      📋 Detalle de Cirugías Enviadas Pendientes de Pago
                    </div>
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border-collapse:collapse;border:1px solid #e2e8f0;border-radius:8px;overflow:hidden;">
                      <thead>
                        <tr bgcolor="#142033" style="color:#ffffff;font-size:9px;text-transform:uppercase;">
                          <th style="padding:8px 6px;text-align:center;">#</th>
                          <th style="padding:8px;text-align:left;">Paciente / Fecha Cx</th>
                          <th style="padding:8px;text-align:left;">Instrumentador</th>
                          <th style="padding:8px;text-align:left;">📦 Control Devolución</th>
                          <th style="padding:8px 6px;text-align:center;">Antigüedad</th>
                          <th style="padding:8px;text-align:center;">Estado</th>
                        </tr>
                      </thead>
                      <tbody>
                        ${rowsHtml || '<tr><td colspan="6" align="center" style="padding:15px;font-size:11px;color:#94a3b8;">¡Excelente! No hay cirugías enviadas pendientes de pago en los últimos 2 meses.</td></tr>'}
                      </tbody>
                    </table>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="padding:14px 28px;background:#0f172a;color:#94a3b8;font-size:10px;text-align:center;">
                    DISTRICORR · Gestión IQ — Reporte Automático Semanal Unificado.
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;

    // 9. Envío vía Resend si API Key configurada
    let emailResult = null;
    if (resendApiKey) {
      const subject = `📋 Reporte Semanal de Pagos Pendientes (${fechaHoyStr}) · ${totalCount} cirugías (${totalListasParaPago} listas para pago)`;

      const resendResp = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${resendApiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          from: "DISTRICORR — Resumen Operativo <notificaciones@districorr.com.ar>",
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
        token,
        printLoteUrl,
        totalCount,
        totalListasParaPago,
        totalProblemas,
        totalFaltaControl,
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
