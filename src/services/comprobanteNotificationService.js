// src/services/comprobanteNotificationService.js
// Servicio unificado y optimizado de notificaciones para instrumentadores (Resend Email + Web Push + WhatsApp)
// Incorpora guardias anti-cero ($0 / falsos positivos), cache en memoria de tokens/contactos,
// pre-fetching agrupado en batch para lotes (elimina consultas N+1), idempotencia y plantilla responsive oficial.

import { supabase } from './supabase';
import { sendEmailWithResend } from './resendService';
import { showDeviceNotification } from './webPushService';
import { generateComprobanteEmailHtml } from './emailComprobanteTemplateService';

/**
 * Cache de idempotencia en memoria para evitar envíos duplicados en la misma sesión
 */
const recentNotificationsCache = new Set();

/**
 * Cache en memoria de tokens de instrumentadores activos por DNI (reduce latencia a 0ms en llamadas sucesivas)
 */
const tokenCacheByDni = new Map();

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
 * Extrae y sanitiza correos válidos a partir de una cadena que puede contener múltiples direcciones (separadas por coma, punto y coma o espacio)
 * @param {string} rawEmail 
 * @returns {string[]} Lista de emails válidos únicos
 */
export const extractValidEmails = (rawEmail) => {
  if (!rawEmail || typeof rawEmail !== 'string') return [];
  const candidates = rawEmail
    .split(/[,;\s]+/)
    .map(e => e.trim().toLowerCase())
    .filter(Boolean);
  
  const validList = candidates.filter(isValidEmail);
  return [...new Set(validList)];
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
 * Obtiene o genera el token de acceso al resumen del instrumentador por su DNI (con cache en memoria)
 */
export async function getOrGenerateInstrumentadorToken(dni) {
  if (!dni) return null;
  const cleanDni = String(dni).replace(/\D/g, '');
  if (!cleanDni) return null;

  // 1. Revisar cache en memoria
  if (tokenCacheByDni.has(cleanDni)) {
    return tokenCacheByDni.get(cleanDni);
  }

  try {
    // 2. Intentar buscar token activo existente en Supabase
    const { data: existingToken, error: selectErr } = await supabase
      .from('instrumentador_tokens')
      .select('token')
      .eq('instrumentador_dni', cleanDni)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!selectErr && existingToken?.token) {
      tokenCacheByDni.set(cleanDni, existingToken.token);
      return existingToken.token;
    }

    // 3. Si no existe, invocar la RPC para generarlo
    const { data: newToken, error: rpcErr } = await supabase.rpc('generar_activity_token', {
      p_dni: cleanDni
    });

    if (!rpcErr && newToken) {
      tokenCacheByDni.set(cleanDni, newToken);
      return newToken;
    }

    return null;
  } catch (err) {
    console.warn('[NotificationService] Error al obtener token de instrumentador:', err);
    return null;
  }
}

/**
 * Envía la notificación individual al instrumentador por Resend Email y Web Push con protecciones exhaustivas
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
 * @param {string} [payload.prefetchedToken] Token ya precargado en batch
 * @returns {Promise<{ emailSent: boolean, pushSent: boolean, portalUrl: string, instrumentadorNombre: string, reason?: string }>}
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
  forceSend = false,
  prefetchedToken = null
}) {
  const result = { emailSent: false, pushSent: false, portalUrl: '', instrumentadorNombre: '', reason: '' };

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
    console.warn(`[NotificationService] ⚠️ Notificación cancelada para DNI ${cleanDni}: Monto total ($${montoTotal}) es <= 0 o no numérico.`);
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
    let finalEmails = extractValidEmails(instrumentadorEmail);

    if (finalEmails.length === 0 || finalNombre === 'Instrumentador/a') {
      const { data: instData } = await supabase
        .from('instrumentadores')
        .select('nombre_completo, email')
        .eq('dni', cleanDni)
        .maybeSingle();

      if (instData) {
        if (finalEmails.length === 0 && instData.email) {
          finalEmails = extractValidEmails(instData.email);
        }
        if (finalNombre === 'Instrumentador/a' && instData.nombre_completo) {
          finalNombre = sanitizeName(instData.nombre_completo);
        }
      }
    }

    result.instrumentadorNombre = finalNombre;

    // 2. Obtener Token Seguro de Acceso al Portal (usando prefetched si está disponible)
    const token = prefetchedToken || await getOrGenerateInstrumentadorToken(cleanDni);
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://gestion-iq.districorr.com.ar';
    const portalUrl = token ? `${origin}/resumen/${token}` : `${origin}/resumen`;
    result.portalUrl = portalUrl;

    const formattedMonto = formatCurrency(numericMonto);
    const formattedFecha = formatDateStr(fechaEmision);

    // 3. CANAL 1: Email Automático vía Resend con Plantilla Oficial Responsive
    if (finalEmails.length > 0) {
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
          to: finalEmails,
          subject: `💳 Nuevo Comprobante de Liquidación (${formattedMonto}) · Gestión IQ`,
          html: htmlContent,
          type: 'comprobante',
          dni: cleanDni
        });

        result.emailSent = true;
        recentNotificationsCache.add(deduplicationKey);
        console.log(`[NotificationService] ✓ Email de comprobante enviado a: ${finalEmails.join(', ')} (Orden #${ordenId || 'N/A'})`);
      } catch (emailErr) {
        console.warn(`[NotificationService] ✕ Error al enviar correo Resend a ${finalEmails.join(', ')}:`, emailErr);
        result.reason = `ERROR_EMAIL: ${emailErr.message || 'Fallo de entrega'}`;
      }
    } else {
      console.warn(`[NotificationService] ⚠️ Instrumentador DNI ${cleanDni} (${finalNombre}) no tiene un email válido registrado.`);
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
 * Despacho optimizado en batch para múltiples comprobantes (elimina consultas N+1 con pre-fetching único)
 * @param {Array<Object>} items Lista de payloads para notificar
 * @returns {Promise<{ total: number, emailsSent: number, pushSent: number, sinEmail: number, duplicados: number, fallidos: number, resumenText: string }>}
 */
export async function notificarLoteComprobantes(items = []) {
  const summary = {
    total: items.length,
    emailsSent: 0,
    pushSent: 0,
    sinEmail: 0,
    duplicados: 0,
    fallidos: 0,
    resumenText: ''
  };

  if (!Array.isArray(items) || items.length === 0) {
    summary.resumenText = 'No hay items para notificar.';
    return summary;
  }

  try {
    // 1. Recopilar todos los DNIs únicos válidos que requieran pre-fetch
    const dnis = [...new Set(
      items
        .map(it => it.instrumentadorDni ? String(it.instrumentadorDni).replace(/\D/g, '') : '')
        .filter(Boolean)
    )];

    if (dnis.length > 0) {
      // 2. PRE-FETCH 1: Obtener emails y nombres en UNA sola consulta SQL
      const { data: instList } = await supabase
        .from('instrumentadores')
        .select('dni, nombre_completo, email')
        .in('dni', dnis);

      const instMap = new Map();
      if (Array.isArray(instList)) {
        instList.forEach(inst => {
          if (inst?.dni) instMap.set(String(inst.dni), inst);
        });
      }

      // 3. PRE-FETCH 2: Obtener tokens activos en UNA sola consulta SQL
      const dnisSinCache = dnis.filter(d => !tokenCacheByDni.has(d));
      if (dnisSinCache.length > 0) {
        const { data: tokenList } = await supabase
          .from('instrumentador_tokens')
          .select('instrumentador_dni, token')
          .in('instrumentador_dni', dnisSinCache)
          .eq('is_active', true);

        if (Array.isArray(tokenList)) {
          tokenList.forEach(t => {
            if (t?.instrumentador_dni && t?.token) {
              tokenCacheByDni.set(String(t.instrumentador_dni), t.token);
            }
          });
        }
      }

      // 4. Inyectar datos precargados a cada item
      items.forEach(item => {
        const cleanDni = item.instrumentadorDni ? String(item.instrumentadorDni).replace(/\D/g, '') : '';
        const prefetchedInst = instMap.get(cleanDni);
        if (prefetchedInst) {
          if (!item.instrumentadorEmail && prefetchedInst.email) {
            item.instrumentadorEmail = prefetchedInst.email;
          }
          if ((!item.instrumentadorNombre || item.instrumentadorNombre === 'Instrumentador/a') && prefetchedInst.nombre_completo) {
            item.instrumentadorNombre = prefetchedInst.nombre_completo;
          }
        }
        if (cleanDni && tokenCacheByDni.has(cleanDni)) {
          item.prefetchedToken = tokenCacheByDni.get(cleanDni);
        }
      });
    }

    // 5. Despacho concurrente protegido con Promise.allSettled
    const results = await Promise.allSettled(
      items.map(item => notificarComprobanteAInstrumentador(item))
    );

    // 6. Consolidar métricas
    results.forEach(res => {
      if (res.status === 'fulfilled') {
        const r = res.value;
        if (r.emailSent) summary.emailsSent++;
        if (r.pushSent) summary.pushSent++;
        if (r.reason === 'EMAIL_NO_CONFIGURADO') summary.sinEmail++;
        if (r.reason === 'DUPLICADO_PREVENIDO') summary.duplicados++;
        if (r.reason && r.reason.startsWith('ERROR_')) summary.fallidos++;
      } else {
        summary.fallidos++;
      }
    });

    const partes = [];
    if (summary.emailsSent > 0) partes.push(`✓ ${summary.emailsSent} correo(s) enviado(s)`);
    if (summary.sinEmail > 0) partes.push(`⚠️ ${summary.sinEmail} sin email registrado`);
    if (summary.fallidos > 0) partes.push(`✕ ${summary.fallidos} error(es) de envío`);
    summary.resumenText = partes.length > 0 ? partes.join(' · ') : 'Notificaciones procesadas.';

    return summary;
  } catch (err) {
    console.error('[NotificationService] Error al procesar lote de notificaciones:', err);
    summary.resumenText = `Error al notificar lote: ${err.message}`;
    return summary;
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


