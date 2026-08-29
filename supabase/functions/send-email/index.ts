import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const REQUIRED_DOMAIN = "@districorr.com.ar";

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // 1. Verificación obligatoria de Autenticación Supabase JWT (Authorization Header)
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Acceso no autorizado: No se proporcionó token de sesión (JWT)." }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') || '';

    if (!supabaseUrl || !supabaseAnonKey) {
      return new Response(
        JSON.stringify({ error: "Error interno de servidor: Credenciales de Supabase no configuradas." }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: "Acceso no autorizado: Token de sesión inválido o expirado." }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 2. Validación de Política de Seguridad basada en Supabase Auth
    const userEmail = (user.email || '').trim().toLowerCase();
    const isConfirmed = Boolean(user.email_confirmed_at || user.confirmed_at);
    const isDistricorrDomain = userEmail.endsWith(REQUIRED_DOMAIN);
    
    const appMeta = user.app_metadata || {};
    const isEmailEnabled = appMeta.email_enabled === true;

    if (!userEmail || !isConfirmed) {
      return new Response(
        JSON.stringify({ error: "Acceso denegado: El correo electrónico del usuario no está confirmado." }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!isDistricorrDomain) {
      return new Response(
        JSON.stringify({ error: `Acceso denegado: El correo '${userEmail}' no pertenece al dominio autorizado ${REQUIRED_DOMAIN}.` }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!isEmailEnabled) {
      return new Response(
        JSON.stringify({ error: "Acceso denegado: El usuario no tiene habilitado el envío de correo (app_metadata.email_enabled !== true)." }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 3. Extracción de Parámetros del Body (Ignorando from y reply_to provistos por el frontend)
    const { to, bcc, subject, html } = await req.json();

    if (!to || !subject || !html) {
      return new Response(
        JSON.stringify({ error: "Faltan parámetros requeridos en la solicitud (to, subject, html)." }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 4. Construcción Server-Side Segura del Remitente
    const userMeta = user.user_metadata || {};
    const senderName = (appMeta.email_sender_name || userMeta.email_sender_name || userMeta.full_name || "DISTRICORR").trim();
    
    const fromAddress = `${senderName} <${userEmail}>`;
    const replyToAddress = userEmail;

    const resendApiKey = Deno.env.get('RESEND_APIKEY') || Deno.env.get('VITE_RESEND_API_KEY');
    if (!resendApiKey) {
      return new Response(
        JSON.stringify({ error: "No se configuró la API Key de Resend en el entorno de Supabase." }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

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
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
