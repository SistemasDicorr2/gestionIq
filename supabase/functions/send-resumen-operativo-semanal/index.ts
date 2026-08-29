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
  // En JS: 0=Dom, 1=Lun, ..., 4=Jue, 6=Sáb
  const currentDay = artNow.getUTCDay();
  const daysSinceSaturday = (currentDay + 1) % 7; // Sábado = 0, Dom = 1, Lun = 2, Jue = 5
  
  const saturdayDate = new Date(artNow);
  saturdayDate.setUTCDate(artNow.getUTCDate() - daysSinceSaturday);
  saturdayDate.setUTCHours(0, 0, 0, 0);

  // El jueves del período (hoy a las 15:00 ART)
  const thursdayDate = new Date(artNow);
  thursdayDate.setUTCHours(15, 0, 0, 0);

  // Convertir ART a UTC ISO (+3h)
  const desdeIso = new Date(saturdayDate.getTime() + 3 * 60 * 60 * 1000).toISOString();
  const hastaIso = new Date(thursdayDate.getTime() + 3 * 60 * 60 * 1000).toISOString();

  // Semana Key para idempotencia (ej: 2026-W35)
  const year = saturdayDate.getUTCFullYear();
  const month = String(saturdayDate.getUTCMonth() + 1).padStart(2, '0');
  const day = String(saturdayDate.getUTCDate()).padStart(2, '0');
  const semanaKey = `${year}-${month}-${day}_W${Math.ceil(saturdayDate.getUTCDate() / 7)}`;

  return { desdeIso, hastaIso, semanaKey, saturdayDate, thursdayDate };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { status: 200, headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || Deno.env.get('SUPABASE_ANON_KEY') || '';
    const resendApiKey = Deno.env.get('RESEND_API_KEY') || '';
    const appBaseUrl = Deno.env.get('APP_BASE_URL') || 'https://gestioniq.districorr.com.ar';

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY no configuradas.");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { desdeIso, hastaIso, semanaKey, saturdayDate, thursdayDate } = getPeriodRange();

    // 1. Invocación Idempotente de RPC para generar o consultar el lote inmutable
    const { data: rpcResult, error: rpcError } = await supabase.rpc('generar_o_consultar_lote_semanal', {
      p_desde: desdeIso,
      p_hasta: hastaIso,
      p_semana_key: semanaKey
    });

    if (rpcError) {
      throw new Error(`Error en RPC generar_o_consultar_lote_semanal: ${rpcError.message}`);
    }

    const token = rpcResult.token;
    const stats = rpcResult.stats || {};
    const totalFichas = stats.total_fichas || 0;
    const totalInst = stats.total_instrumentadores || 0;
    const totalLugares = stats.total_instituciones || 0;

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

    // 3. Consultar fichas del lote para incluir resumen en el mail
    const { data: loteDetalle } = await supabase.rpc('obtener_lote_por_token', { p_token: token });
    const fichas = loteDetalle?.fichas || [];

    const printLoteUrl = `${appBaseUrl}/resumen-operativo/lote/${token}`;

    const fechaDesdeStr = `${String(saturdayDate.getUTCDate()).padStart(2, '0')}/${String(saturdayDate.getUTCMonth() + 1).padStart(2, '0')}/${saturdayDate.getUTCFullYear()}`;
    const fechaHastaStr = `${String(thursdayDate.getUTCDate()).padStart(2, '0')}/${String(thursdayDate.getUTCMonth() + 1).padStart(2, '0')}/${thursdayDate.getUTCFullYear()}`;

    // 4. Construcción del Email HTML Ejecutivo
    const fichasRowsHtml = fichas.map((f: any, idx: number) => {
      const bg = idx % 2 === 0 ? '#ffffff' : '#f8fafc';
      const num = String(idx + 1).padStart(2, '0');
      return `
        <tr bgcolor="${bg}">
          <td align="center" style="padding:10px 6px;border-bottom:1px solid #e2e8f0;font-size:10px;color:#94a3b8;font-weight:700;">${num}</td>
          <td style="padding:10px 8px;border-bottom:1px solid #e2e8f0;font-size:11px;font-weight:800;color:#0f172a;">${f.paciente || 'Sin especificar'}</td>
          <td style="padding:10px 8px;border-bottom:1px solid #e2e8f0;font-size:10px;color:#334155;">${f.medico || '-'}</td>
          <td style="padding:10px 8px;border-bottom:1px solid #e2e8f0;font-size:10px;color:#334155;">${f.lugar_cirugia || '-'}</td>
          <td style="padding:10px 8px;border-bottom:1px solid #e2e8f0;font-size:10px;color:#475569;">${f.instrumentador || '-'}</td>
        </tr>
      `;
    }).join('');

    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Resumen Operativo Semanal</title>
      </head>
      <body style="margin:0;padding:0;background-color:#eef2f7;font-family:Arial,Helvetica,sans-serif;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#eef2f7;padding:20px 10px;">
          <tr>
            <td align="center">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:680px;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #dfe6ef;">
                <tr><td height="4" style="background:#2563eb;"></td></tr>
                <tr>
                  <td style="padding:24px 28px;border-bottom:1px solid #f1f5f9;">
                    <div style="font-size:12px;font-weight:800;color:#2563eb;letter-spacing:0.5px;">DISTRICORR · GESTIÓN IQ</div>
                    <h1 style="margin:6px 0 0 0;font-size:20px;font-weight:800;color:#0f172a;">Resumen Operativo Semanal de Fichas</h1>
                    <p style="margin:4px 0 0 0;font-size:12px;color:#64748b;">
                      Período: <strong>${fechaDesdeStr} 00:00 hs</strong> al <strong>${fechaHastaStr} 15:00 hs</strong>
                    </p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:20px 28px;background:#f8fafc;">
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                      <tr>
                        <td width="33%" style="padding:10px;background:#ffffff;border:1px solid #e2e8f0;border-radius:12px;text-align:center;">
                          <div style="font-size:22px;font-weight:800;color:#2563eb;">${totalFichas}</div>
                          <div style="font-size:9px;font-weight:700;color:#94a3b8;text-transform:uppercase;margin-top:2px;">FICHAS ENVIADAS</div>
                        </td>
                        <td width="5"></td>
                        <td width="33%" style="padding:10px;background:#ffffff;border:1px solid #e2e8f0;border-radius:12px;text-align:center;">
                          <div style="font-size:22px;font-weight:800;color:#4f46e5;">${totalInst}</div>
                          <div style="font-size:9px;font-weight:700;color:#94a3b8;text-transform:uppercase;margin-top:2px;">INSTRUMENTADORES</div>
                        </td>
                        <td width="5"></td>
                        <td width="33%" style="padding:10px;background:#ffffff;border:1px solid #e2e8f0;border-radius:12px;text-align:center;">
                          <div style="font-size:22px;font-weight:800;color:#059669;">${totalLugares}</div>
                          <div style="font-size:9px;font-weight:700;color:#94a3b8;text-transform:uppercase;margin-top:2px;">INSTITUCIONES</div>
                        </td>
                      </tr>
                    </table>

                    <div style="margin-top:20px;text-align:center;">
                      <a href="${printLoteUrl}" target="_blank" style="display:inline-block;padding:14px 28px;background-color:#2563eb;color:#ffffff;font-size:13px;font-weight:800;text-decoration:none;border-radius:10px;box-shadow:0 4px 12px rgba(37,99,235,0.25);">
                        📄 Abrir e Imprimir Todas las Fichas (PDF)
                      </a>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td style="padding:20px 28px;">
                    <div style="font-size:12px;font-weight:800;color:#0f172a;margin-bottom:10px;">Detalle de Fichas del Lote Inmutable</div>
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border-collapse:collapse;border:1px solid #e2e8f0;border-radius:8px;overflow:hidden;">
                      <thead>
                        <tr bgcolor="#142033" style="color:#ffffff;font-size:9px;text-transform:uppercase;">
                          <th style="padding:8px 6px;text-align:center;">#</th>
                          <th style="padding:8px;text-align:left;">Paciente</th>
                          <th style="padding:8px;text-align:left;">Médico</th>
                          <th style="padding:8px;text-align:left;">Institución</th>
                          <th style="padding:8px;text-align:left;">Instrumentador</th>
                        </tr>
                      </thead>
                      <tbody>
                        ${fichasRowsHtml || '<tr><td colspan="5" align="center" style="padding:15px;font-size:11px;color:#94a3b8;">No se registraron fichas enviadas en este período.</td></tr>'}
                      </tbody>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding:14px 28px;background:#0f172a;color:#94a3b8;font-size:10px;text-align:center;">
                    DISTRICORR · Gestión IQ — Reporte Automático Semanal.
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;

    // 5. Envío vía Resend si API Key configurada
    let emailResult = null;
    if (resendApiKey) {
      const resendResp = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${resendApiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          from: "DISTRICORR — Resumen Operativo <notificaciones@districorr.com.ar>",
          to: toEmails,
          subject: `📋 Resumen Operativo Semanal (${fechaDesdeStr} - ${fechaHastaStr})`,
          html: emailHtml
        })
      });

      emailResult = await resendResp.json();
    }

    return new Response(
      JSON.stringify({
        success: true,
        token,
        semanaKey,
        totalFichas,
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
