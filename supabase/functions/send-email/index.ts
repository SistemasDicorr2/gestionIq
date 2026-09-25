import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE',
};

const REQUIRED_DOMAIN = "@districorr.com.ar";
const DEFAULT_SENDER = "DISTRICORR · Gestión IQ <notificaciones@districorr.com.ar>";
const DEFAULT_REPLY_TO = "sistemas@districorr.com.ar";

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { status: 200, headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') || '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const resendApiKey = Deno.env.get('RESEND_APIKEY') || Deno.env.get('VITE_RESEND_API_KEY');

    if (!supabaseUrl || (!supabaseAnonKey && !supabaseServiceKey)) {
      return new Response(
        JSON.stringify({ error: "Error interno de servidor: Credenciales de Supabase no configuradas." }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!resendApiKey) {
      return new Response(
        JSON.stringify({ error: "No se configuró la API Key de Resend (RESEND_APIKEY) en el entorno de Supabase." }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 1. Extraer Parámetros del Body
    const body = await req.json().catch(() => ({}));
    const { to, bcc, subject, html, attachments, type, dni } = body;

    if (!to || !subject || !html) {
      return new Response(
        JSON.stringify({ error: "Faltan parámetros requeridos en la solicitud (to, subject, html)." }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let fromAddress = DEFAULT_SENDER;
    let replyToAddress = DEFAULT_REPLY_TO;
    let isAuthorized = false;

    // 2. CASO A: Usuario Administrador Autenticado con Supabase Auth (@districorr.com.ar)
    const authHeader = req.headers.get('Authorization');
    if (authHeader && authHeader !== `Bearer ${supabaseAnonKey}`) {
      const supabaseAuthClient = createClient(supabaseUrl, supabaseAnonKey, {
        global: { headers: { Authorization: authHeader } }
      });

      const { data: { user }, error: userError } = await supabaseAuthClient.auth.getUser();

      if (!userError && user) {
        const userEmail = (user.email || '').trim().toLowerCase();
        const isConfirmed = Boolean(user.email_confirmed_at || user.confirmed_at);
        const isDistricorrDomain = userEmail.endsWith(REQUIRED_DOMAIN);
        const appMeta = user.app_metadata || {};
        const isEmailEnabled = appMeta.email_enabled === true;

        if (isConfirmed && isDistricorrDomain && isEmailEnabled) {
          const userMeta = user.user_metadata || {};
          const senderName = (appMeta.email_sender_name || userMeta.email_sender_name || userMeta.full_name || "DISTRICORR").trim();
          fromAddress = `${senderName} <${userEmail}>`;
          replyToAddress = userEmail;
          isAuthorized = true;
        }
      }
    }

    // 3. CASO B: Notificación Transaccional del Sistema (Bienvenida / Suscripción de Instrumentador)
    if (!isAuthorized && (type === 'welcome' || type === 'transactional' || type === 'comprobante')) {
      // Validamos que el destinatario corresponda a un instrumentador o formato válido
      const adminClient = createClient(supabaseUrl, supabaseServiceKey || supabaseAnonKey);
      
      const targetEmail = Array.isArray(to) ? to[0] : to;
      const cleanEmail = String(targetEmail || '').trim().toLowerCase();

      // Verificación opcional por DNI o existencia en la tabla instrumentadores
      if (dni) {
        const cleanDni = String(dni).replace(/\D/g, '');
        const { data: inst } = await adminClient
          .from('instrumentadores')
          .select('dni, email')
          .eq('dni', cleanDni)
          .maybeSingle();

        if (inst) {
          isAuthorized = true;
          // Si el email del instrumentador cambió o no estaba seteado en la BD, sincronizarlo de forma segura con permisos service_role
          if (cleanEmail && inst.email !== cleanEmail) {
            try {
              await adminClient
                .from('instrumentadores')
                .update({ email: cleanEmail })
                .eq('dni', cleanDni);
            } catch (updateErr) {
              console.warn('[send-email] No se pudo persistir email en instrumentadores:', updateErr);
            }
          }
        }
      }

      // Si no hay DNI o es bienvenida por primer registro, validar que sea un email válido
      if (!isAuthorized && cleanEmail.includes('@') && cleanEmail.includes('.')) {
        isAuthorized = true;
      }
    }

    if (!isAuthorized) {
      return new Response(
        JSON.stringify({ error: "Acceso no autorizado: Debe iniciar sesión con una cuenta de @districorr.com.ar o enviar una solicitud transaccional válida." }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 4. Preparar Payload para Resend
    const recipients = Array.isArray(to) ? to.filter(Boolean) : [to].filter(Boolean);
    const bccRecipients = bcc ? (Array.isArray(bcc) ? bcc.filter(Boolean) : [bcc].filter(Boolean)) : undefined;

    const resendPayload: Record<string, any> = {
      from: fromAddress,
      reply_to: replyToAddress,
      to: recipients,
      subject: subject,
      html: html
    };

    if (bccRecipients && bccRecipients.length > 0) {
      resendPayload.bcc = bccRecipients;
    }

    // Soporte para adjuntos (Base64)
    if (attachments && Array.isArray(attachments) && attachments.length > 0) {
      resendPayload.attachments = attachments.map((att: any) => ({
        filename: att.filename || "archivo_adjunto.pdf",
        content: att.content
      }));
    }

    // 5. Envío hacia la API REST de Resend
    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${resendApiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(resendPayload)
    });

    const resendData = await resendResponse.json();

    if (!resendResponse.ok) {
      const errorMessage = resendData.message || resendData.error || (resendData.errors && resendData.errors[0]?.message) || `Error ${resendResponse.status} de la API de Resend`;
      return new Response(
        JSON.stringify({ error: errorMessage }),
        { status: resendResponse.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        id: resendData.id, 
        sender: fromAddress, 
        reply_to: replyToAddress 
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err.message || "Error interno al enviar correo." }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

