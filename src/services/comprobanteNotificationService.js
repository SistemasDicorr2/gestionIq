// src/services/comprobanteNotificationService.js
// Servicio unificado y blindado de notificaciones para instrumentadores (Resend Email + Web Push + WhatsApp)
// Incorpora guardias anti-cero ($0 / falsos positivos), idempotencia, validación de email y plantilla responsive oficial.

import { supabase } from './supabase';
import { sendEmailWithResend } from './resendService';
import { showDeviceNotification } from './webPushService';
import { generateComprobanteEmailHtml } from './emailComprobanteTemplateService';

/**
 * Cache de idempotencia en memoria para evitar envíos duplicados en la misma sesión
 */
const recentNotificationsCache = new Set();

/**
 * Formatea valores numéricos como moneda ARS con separadores correctos
 */
export const formatCurrency = (val) => {
  const num = Number(val);
  if (isNaN(num)) return '$ 0,00';
  return new Intl.NumberFormat('es-AR', { 
    style: 'currency', 
    currency: 'ARS',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(num);
};

/**
 * Formatea fechas ISO a formato legible dd/mm/aaaa
 */
export const formatDateStr = (dateStr) => {
  if (!dateStr) {
    return new Date().toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  }
  try {
    const parts = String(dateStr).split('T')[0].split('-');
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  } catch {
    return String(dateStr);
  }
};

/**
 * Validador estricto de formato de email
 */
export const isValidEmail = (email) => {
  if (!email || typeof email !== 'string') return false;
  const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return re.test(email.trim());
};

/**
 * Sanitiza y formatea nombres a Title Case (ej: "ALEJANDRA TORRES" -> "Alejandra Torres")
 */
export const sanitizeName = (rawName) => {
  if (!rawName || typeof rawName !== 'string') return 'Instrumentador/a';
  return rawName
    .trim()
    .toLowerCase()
    .split(' ')
    .filter(Boolean)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

/**
 * Obtiene o genera el token de acceso al resumen del instrumentador por su DNI
 */
export async function getOrGenerateInstrumentadorToken(dni) {
  if (!dni) return null;
  const cleanDni = String(dni).replace(/\D/g, '');
  if (!cleanDni) return null;

  try {
    // 1. Intentar buscar token activo existente
    const { data: existingToken, error: selectErr } = await supabase
      .from('instrumentador_tokens')
      .select('token')
      .eq('instrumentador_dni', cleanDni)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!selectErr && existingToken?.token) {
      return existingToken.token;
    }

    // 2. Si no existe, invocar la RPC para generarlo
    const { data: newToken, error: rpcErr } = await supabase.rpc('generar_activity_token', {
      p_dni: cleanDni
    });

    if (!rpcErr && newToken) {
      return newToken;
    }

    return null;
  } catch (err) {
    console.warn('[NotificationService] Error al obtener token de instrumentador:', err);
    return null;
  }
}

/**
 * Envía la notificación al instrumentador por Resend Email y Web Push con protecciones exhaustivas
 * @param {Object} payload
 * @param {string} payload.instrumentadorDni
 * @param {string} [payload.instrumentadorNombre]
 * @param {string} [payload.instrumentadorEmail]
 * @param {number|string} payload.montoTotal
 * @param {string} [payload.fechaEmision]
 * @param {number} [payload.cirugiasCount]
 * @param {Array<string>} [payload.pacientes]
 * @param {string|number} [payload.ordenId]
 * @param {string} [payload.comprobanteObjectKey]
 * @param {boolean} [payload.forceSend] Si es true, omite la comprobación de duplicados de sesión
 * @returns {Promise<{ emailSent: boolean, pushSent: boolean, portalUrl: string, reason?: string }>}
 */
export async function notificarComprobanteAInstrumentador({
  instrumentadorDni,
  instrumentadorNombre,
  instrumentadorEmail,
  montoTotal,
  fechaEmision,
  cirugiasCount = 0,
  pacientes = [],
  ordenId,
  comprobanteObjectKey,
  forceSend = false
}) {
  const result = { emailSent: false, pushSent: false, portalUrl: '', reason: '' };

  // GUARDIA 1: Validación de DNI
  const cleanDni = instrumentadorDni ? String(instrumentadorDni).replace(/\D/g, '') : '';
  if (!cleanDni) {
    console.warn('[NotificationService] ⚠️ Notificación cancelada: DNI de instrumentador inválido o ausente.');
    result.reason = 'DNI_INVALIDO';
    return result;
  }

  // GUARDIA 2: Anti-$0 y Anti-Falsos Positivos
  const numericMonto = Number(montoTotal);
  if (isNaN(numericMonto) || numericMonto <= 0) {
    console.warn(`[NotificationService] ⚠️ Notificación cancelada para DNI ${cleanDni}: Monto total ($${montoTotal}) es <= 0 o no numérico. Se evita falso positivo.`);
    result.reason = 'MONTO_CERO_O_INVALIDO';
    return result;
  }

  // GUARDIA 3: Idempotencia en memoria para evitar envíos duplicados por doble clic o bucles
  const deduplicationKey = `${ordenId || 'sin_orden'}_${cleanDni}_${Math.round(numericMonto)}`;
  if (!forceSend && recentNotificationsCache.has(deduplicationKey)) {
    console.info(`[NotificationService] ℹ️ Notificación omitida: Ya fue despachada recientemente para la clave ${deduplicationKey}.`);
    result.reason = 'DUPLICADO_PREVENIDO';
    return result;
  }

  try {
    // 1. Obtener datos actualizados del instrumentador si faltan
    let finalNombre = sanitizeName(instrumentadorNombre);
    let finalEmail = instrumentadorEmail?.trim();

    if (!finalEmail || finalNombre === 'Instrumentador/a') {
      const { data: instData } = await supabase
        .from('instrumentadores')
        .select('nombre_completo, email')
        .eq('dni', cleanDni)
        .maybeSingle();

      if (instData) {
        if (!finalEmail && instData.email) finalEmail = instData.email.trim();
        if (finalNombre === 'Instrumentador/a' && instData.nombre_completo) {
          finalNombre = sanitizeName(instData.nombre_completo);
        }
      }
    }

    // 2. Obtener Token Seguro de Acceso al Portal
    const token = await getOrGenerateInstrumentadorToken(cleanDni);
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://gestion-iq.districorr.com.ar';
    const portalUrl = token ? `${origin}/resumen/${token}` : `${origin}/resumen`;
    result.portalUrl = portalUrl;

    const formattedMonto = formatCurrency(numericMonto);
    const formattedFecha = formatDateStr(fechaEmision);

    // 3. CANAL 1: Email Automático vía Resend con Plantilla Oficial Responsive
    if (isValidEmail(finalEmail)) {
      try {
        const htmlContent = generateComprobanteEmailHtml({
          nombreCompleto: finalNombre,
          dni: cleanDni,
          portalUrl,
          monto: formattedMonto,
          pacientes: Array.isArray(pacientes) ? pacientes : [],
          fecha: formattedFecha,
          numeroOrden: ordenId ? String(ordenId) : ''
        });

        await sendEmailWithResend({
          to: finalEmail,
          subject: `💳 Nuevo Comprobante de Liquidación (${formattedMonto}) · Gestión IQ`,
          html: htmlContent,
          type: 'comprobante',
          dni: cleanDni
        });

        result.emailSent = true;
        recentNotificationsCache.add(deduplicationKey);
        console.log(`[NotificationService] ✓ Email de comprobante enviado a: ${finalEmail} (Orden #${ordenId || 'N/A'})`);
      } catch (emailErr) {
        console.warn(`[NotificationService] ✕ Error al enviar correo Resend a ${finalEmail}:`, emailErr);
        result.reason = `ERROR_EMAIL: ${emailErr.message || 'Fallo de entrega'}`;
      }
    } else {
      console.warn(`[NotificationService] ⚠️ Instrumentador DNI ${cleanDni} (${finalNombre}) no tiene un email válido registrado (${finalEmail || 'vacío'}).`);
      result.reason = 'EMAIL_NO_CONFIGURADO';
    }

    // 4. CANAL 2: Web Push Notification al Dispositivo
    try {
      const pushSuccess = await showDeviceNotification({
        title: '💳 Nuevo Comprobante de Liquidación',
        body: `Hola ${finalNombre}, tu comprobante de liquidación por ${formattedMonto} ya está disponible en tu portal IQ.`,
        url: portalUrl
      });
      result.pushSent = pushSuccess;
    } catch (pushErr) {
      console.warn('[NotificationService] No se pudo emitir Web Push local:', pushErr);
    }

    return result;
  } catch (err) {
    console.error('[NotificationService] Error general al procesar notificación de comprobante:', err);
    result.reason = `ERROR_GENERAL: ${err.message}`;
    return result;
  }
}

/**
 * Genera el enlace directo a WhatsApp con mensaje personalizado para el instrumentador
 */
export function buildComprobanteWhatsAppUrl({
  telefono,
  nombreInstrumentador,
  montoTotal,
  portalUrl
}) {
  if (!telefono) return null;
  const cleanPhone = String(telefono).replace(/[^0-9]/g, '');
  if (!cleanPhone || cleanPhone.length < 8) return null;

  const safeName = sanitizeName(nombreInstrumentador);
  const formattedMonto = formatCurrency(montoTotal);

  const msg = `Hola ${safeName}, desde *Districorr* te informamos que ya se encuentra cargado y disponible el comprobante de pago de tu liquidación (${formattedMonto}).\n\nPodés consultar el detalle de pacientes y ver tu comprobante en tu Portal IQ:\n${portalUrl || 'https://gestion-iq.districorr.com.ar'}`;

  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`;
}

