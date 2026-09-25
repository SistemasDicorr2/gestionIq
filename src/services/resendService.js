// src/services/resendService.js
import { supabase } from './supabase';

/**
 * Obtener la información del usuario autenticado activo en Supabase Auth
 */
export async function getCurrentResendUser() {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return null;

  const email = (user.email || '').trim().toLowerCase();
  const appMeta = user.app_metadata || {};
  const userMeta = user.user_metadata || {};

  const senderName = (appMeta.email_sender_name || userMeta.email_sender_name || userMeta.full_name || "DISTRICORR").trim();
  const isDistricorr = email.endsWith('@districorr.com.ar');
  const isEmailEnabled = appMeta.email_enabled === true;
  const isConfirmed = Boolean(user.email_confirmed_at || user.confirmed_at);

  return {
    id: user.id,
    email,
    senderName,
    from: `${senderName} <${email}>`,
    reply_to: email,
    isDistricorr,
    isEmailEnabled,
    isConfirmed,
    isResendReady: isDistricorr && isEmailEnabled && isConfirmed
  };
}

/**
 * Enviar correo a través de la Edge Function 'send-email' (basada en el usuario autenticado activo en Supabase Auth)
 */
export async function sendEmailWithResend({ to, bcc, subject, html, attachments, type, dni }) {
  const recipients = Array.isArray(to) ? to.filter(Boolean) : [to].filter(Boolean);
  if (recipients.length === 0) {
    throw new Error('Debes especificar al menos un correo de destino.');
  }

  const bccRecipients = bcc ? (Array.isArray(bcc) ? bcc.filter(Boolean) : [bcc].filter(Boolean)) : undefined;

  // 1. Intentar invocar la Supabase Edge Function 'send-email' (utiliza el secreto RESEND_APIKEY en el servidor)
  try {
    const { data: edgeData, error: edgeErr } = await supabase.functions.invoke('send-email', {
      body: { to: recipients, bcc: bccRecipients, subject, html, attachments, type, dni }
    });

    if (edgeErr) {
      let msg = edgeErr.message || 'Error al invocar la Edge Function send-email';
      if (edgeErr.status === 403) {
        msg = `403 Forbidden: Tu cuenta no tiene permisos para enviar correos (${msg}).`;
      } else if (edgeErr.status === 401) {
        msg = `401 Unauthorized: Debe iniciar sesión con una cuenta de @districorr.com.ar autorizada.`;
      }
      throw new Error(msg);
    }

    if (edgeData && (edgeData.success || edgeData.id)) {
      return edgeData;
    }

    if (edgeData && edgeData.error) {
      throw new Error(edgeData.error);
    }
  } catch (fnErr) {
    // Si es un error de autorización explícito, relanzar para informar al usuario
    if (fnErr.message && (fnErr.message.includes('403') || fnErr.message.includes('401') || fnErr.message.includes('denegado') || fnErr.message.includes('Unauthorized') || fnErr.message.includes('Forbidden'))) {
      throw fnErr;
    }
    console.warn('[resendService] Edge Function send-email no respondió, intentando fallback directo:', fnErr.message);
  }

  // 2. Fallback con API Key directa si está configurada en variables de entorno locales
  const apiKey = import.meta.env.VITE_RESEND_API_KEY || import.meta.env.RESEND_APIKEY;
  if (!apiKey) {
    throw new Error('Para enviar correos, iniciá sesión con una cuenta de @districorr.com.ar autorizada en la plataforma o configurá VITE_RESEND_API_KEY en el entorno.');
  }

  const activeUser = await getCurrentResendUser();
  const fromAddress = (activeUser && activeUser.from) 
    ? activeUser.from 
    : 'DISTRICORR · Gestión IQ <notificaciones@districorr.com.ar>';
  const replyToAddress = (activeUser && activeUser.email) 
    ? activeUser.email 
    : 'sistemas@districorr.com.ar';

  const endpoint = import.meta.env.DEV ? '/api-resend/emails' : 'https://api.resend.com/emails';

  const resendBody = {
    from: fromAddress,
    reply_to: replyToAddress,
    to: recipients,
    subject: subject,
    html: html
  };

  if (bccRecipients && bccRecipients.length > 0) {
    resendBody.bcc = bccRecipients;
  }

  if (attachments && attachments.length > 0) {
    resendBody.attachments = attachments;
  }

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(resendBody)
  });

  const data = await response.json();

  if (!response.ok) {
    const errorMsg = data.message || data.error || (data.errors && data.errors[0]?.message) || `Error ${response.status} en Resend`;
    throw new Error(errorMsg);
  }

  return {
    success: true,
    id: data.id,
    sender: activeUser?.from || fromAddress,
    reply_to: activeUser?.reply_to || replyToAddress
  };
}
