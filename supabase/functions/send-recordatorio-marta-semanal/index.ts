import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
};

const DEFAULT_EMAILS = [
  "sistemas@districorr.com.ar",
  "contable@districorr.com.ar"
];

function formatDateDisplay(dStr: string | null) {
  if (!dStr) return '-';
  const clean = String(dStr).split('T')[0];
  const parts = clean.split('-');
  return parts.length === 3 ? `${parts[2]}/${parts[1]}/${parts[0]}` : clean;
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const resendApiKey = Deno.env.get('RESEND_API_KEY') || '';

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Variables de entorno SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY no configuradas.');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // 1. Obtener destinatarios configurados
    let toEmails = [...DEFAULT_EMAILS];
    const { data: configEmails } = await supabase
      .from('resumen_operativo_config')
      .select('value')
      .eq('key', 'emails_destinatarios')
      .maybeSingle();

    if (configEmails && Array.isArray(configEmails.value) && configEmails.value.length > 0) {
      toEmails = configEmails.value;
    }

    // 2. Obtener cirugías omitidas si existieran
    const { data: omitidasConfig } = await supabase
      .from('resumen_operativo_config')
      .select('value')
      .eq('key', 'cirugias_omitidas')
      .maybeSingle();

    const omitidosIds = new Set(
      Array.isArray(omitidasConfig?.value)
        ? omitidasConfig.value.map((item: any) => String(item.id || item))
        : []
    );

    // 3. Obtener cirugías pendientes enviadas
    const { data: pendingRaw, error: pendingErr } = await supabase.rpc('get_todas_cirugias_pendientes');
    if (pendingErr) throw pendingErr;

    const allPending = pendingRaw || [];

    // 4. Filtrar cirugías de Marta Brugger pendientes de pago
    const isMartaBrugger = (s: any) => {
      const dni = String(s?.instrumentador_dni || '').trim();
      if (dni === '28584730') return true;
      const nombre = String(s?.instrumentador_nombre || s?.instrumentador || '').toLowerCase();
      return /marta\s*br?ug+er/i.test(nombre);
    };

    const martaSurgeries = allPending.filter((s: any) => {
      if (s.pago_id) return false;
      if (omitidosIds.has(String(s.id))) return false;
      return isMartaBrugger(s);
    });

    const martaIds = martaSurgeries.map((s: any) => s.id).filter(Boolean);
    const codeMap = new Map<string, string>();

    if (martaIds.length > 0) {
      const { data: repData } = await supabase
        .from('reportes')
        .select('id, id_cirugia')
        .in('id', martaIds);

      if (repData) {
        repData.forEach((r: any) => codeMap.set(String(r.id), r.id_cirugia));
      }
    }

    const martaList = martaSurgeries
      .map((s: any) => ({
        ...s,
        codigo_cx: codeMap.get(String(s.id)) || `CX-${Number(s.id) + 1000}`
      }))
      .sort((a: any, b: any) => String(b.fecha_cirugia || '').localeCompare(String(a.fecha_cirugia || '')));

    const count = martaList.length;
    const now = new Date();
    const hoyStr = formatDateDisplay(now.toISOString());
    const pagosUrl = `https://gestioniq.districorr.com.ar/admin/pagos`;

    // 5. Construir HTML sencillo del correo
    const rowsHtml = martaList.map((m: any, idx: number) => `
      <tr bgcolor="${idx % 2 === 0 ? '#ffffff' : '#fffbeb'}">
        <td style="padding:10px 12px;border-bottom:1px solid #fde68a;font-size:12px;font-weight:800;color:#b45309;">${m.codigo_cx}</td>
        <td style="padding:10px 12px;border-bottom:1px solid #fde68a;font-size:12px;font-weight:700;color:#0f172a;">${m.paciente || 'Sin especificar'}</td>
        <td style="padding:10px 12px;border-bottom:1px solid #fde68a;font-size:12px;color:#334155;">${formatDateDisplay(m.fecha_cirugia)}</td>
        <td style="padding:10px 12px;border-bottom:1px solid #fde68a;font-size:11px;color:#475569;">${m.medico || '-'}</td>
        <td style="padding:10px 12px;border-bottom:1px solid #fde68a;font-size:11px;color:#64748b;">${m.lugar || '-'}</td>
      </tr>
    `).join('');

    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head><meta charset="utf-8"><title>Recordatorio Semanal · Cirugías Marta Brugger</title></head>
      <body style="margin:0;padding:20px 10px;background-color:#f8fafc;font-family:Arial,Helvetica,sans-serif;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:620px;margin:0 auto;background:#ffffff;border-radius:14px;overflow:hidden;border:1px solid #e2e8f0;">
          <tr><td height="5" style="background:#d97706;"></td></tr>
          <tr>
            <td style="padding:22px 24px;border-bottom:1px solid #f1f5f9;">
              <div style="font-size:11px;font-weight:800;color:#d97706;letter-spacing:0.5px;">RECORDATORIO SEMANAL AUTOMÁTICO · GESTIÓN IQ</div>
              <h2 style="margin:6px 0 0 0;font-size:18px;font-weight:800;color:#0f172a;">
                Cirugías Impagas de Marta Brugger: ${count}
              </h2>
              <p style="margin:4px 0 0 0;font-size:12px;color:#64748b;">
                Actualizado al ${hoyStr} · Fichas enviadas pendientes de liquidación
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:20px 24px;">
              <div style="background:#fffbeb;border:1px solid #fcd34d;border-radius:12px;padding:14px 16px;margin-bottom:16px;text-align:center;">
                <div style="font-size:30px;font-weight:900;color:#b45309;line-height:1;">${count}</div>
                <div style="font-size:11px;font-weight:800;color:#92400e;text-transform:uppercase;margin-top:4px;">
                  ${count === 1 ? 'Cirugía enviada impaga' : 'Cirugías enviadas impagas'}
                </div>
              </div>
              ${count > 0 ? `
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border-collapse:collapse;border:1px solid #fde68a;border-radius:8px;overflow:hidden;">
                  <thead>
                    <tr bgcolor="#fef3c7" style="color:#92400e;font-size:10px;text-transform:uppercase;">
                      <th style="padding:8px 12px;text-align:left;">Código</th>
                      <th style="padding:8px 12px;text-align:left;">Paciente</th>
                      <th style="padding:8px 12px;text-align:left;">Fecha Cx</th>
                      <th style="padding:8px 12px;text-align:left;">Médico</th>
                      <th style="padding:8px 12px;text-align:left;">Institución</th>
                    </tr>
                  </thead>
                  <tbody>${rowsHtml}</tbody>
                </table>
              ` : `
                <p style="font-size:13px;color:#047857;font-weight:700;text-align:center;">
                  ✅ Marta Brugger no tiene cirugías enviadas pendientes de pago en este momento.
                </p>
              `}
              <div style="margin-top:18px;text-align:center;">
                <a href="${pagosUrl}" target="_blank" style="display:inline-block;padding:10px 22px;background-color:#d97706;color:#ffffff;font-size:12px;font-weight:800;text-decoration:none;border-radius:8px;">
                  Ir a Estación de Pagos ›
                </a>
              </div>
            </td>
          </tr>
          <tr>
            <td style="padding:12px 24px;background:#0f172a;color:#94a3b8;font-size:10px;text-align:center;">
              DISTRICORR · Gestión IQ — Envío Programado Automático
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;

    // 6. Enviar vía Resend
    let resendRespData = null;
    if (resendApiKey) {
      const subject = `📌 Recordatorio Semanal: Marta Brugger tiene ${count} ${count === 1 ? 'cirugía impaga' : 'cirugías impagas'} (${hoyStr})`;
      const resendRes = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${resendApiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          from: "DISTRICORR — Pagos <notificaciones@districorr.com.ar>",
          to: toEmails,
          subject,
          html: emailHtml
        })
      });
      resendRespData = await resendRes.json();
    }

    return new Response(
      JSON.stringify({
        success: true,
        count,
        toEmails,
        emailSent: Boolean(resendApiKey && resendRespData?.id),
        resend: resendRespData
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

