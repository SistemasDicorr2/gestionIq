// src/services/emailComprobanteTemplateService.js
// Generador de plantilla HTML responsive para el Aviso de Liquidación / Comprobante al Instrumentador
// Diseñado siguiendo los estándares de compatibilidad de correo (Gmail, Apple Mail, Outlook, iOS/Android)

/**
 * Genera el HTML completo del correo de aviso de liquidación para el instrumentador
 * @param {Object} data
 * @param {string} data.nombreCompleto Nombre del instrumentador
 * @param {string} data.dni DNI del instrumentador
 * @param {string} data.portalUrl URL directa de acceso al portal (/resumen/:token)
 * @param {string} [data.monto] Monto liquidado opcional (ej: "$ 45.000,00")
 * @param {Array<string>} [data.pacientes] Lista de nombres de pacientes o cirugías abonadas
 * @param {string} [data.fecha] Fecha de liquidación (ej: "25/09/2026")
 * @param {string} [data.numeroOrden] Número o código de orden de pago opcional
 * @returns {string} HTML compilado y optimizado para clientes de correo
 */
export function generateComprobanteEmailHtml({
  nombreCompleto = 'Instrumentador/a',
  dni = '',
  portalUrl = 'https://gestion-iq.districorr.com.ar',
  monto = '',
  pacientes = [],
  fecha = new Date().toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' }),
  numeroOrden = ''
}) {
  const firstName = nombreCompleto ? nombreCompleto.trim().split(' ')[0] : 'Estimado/a';
  const cleanFirstName = firstName.charAt(0).toUpperCase() + firstName.slice(1).toLowerCase();

  // Bloque de pacientes/cirugías si existen
  let pacientesHtml = '';
  if (Array.isArray(pacientes) && pacientes.length > 0) {
    const listItems = pacientes.map(p => `
      <tr style="border-bottom: 1px solid #e2e8f0;">
        <td class="text-body" style="padding: 7px 12px; font-size: 12px; color: #334155; font-weight: 600;">
          • ${p}
        </td>
      </tr>
    `).join('');

    pacientesHtml = `
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-top: 12px; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
        <tr>
          <td style="padding: 8px 12px; background-color: #f1f5f9; font-size: 11px; font-weight: 800; color: #475569; text-transform: uppercase; letter-spacing: 0.5px;">
            Cirugías / Pacientes incluidos:
          </td>
        </tr>
        ${listItems}
      </table>
    `;
  }

  // Bloque de monto si está presente
  let montoHtml = '';
  if (monto) {
    montoHtml = `
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-top: 14px; background-color: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 10px;">
        <tr>
          <td style="padding: 12px 16px; text-align: center;">
            <div style="font-size: 10px; font-weight: 800; color: #065f46; text-transform: uppercase; letter-spacing: 0.5px;">
              Monto Total Liquidado
            </div>
            <div style="font-size: 22px; font-weight: 900; color: #047857; margin-top: 3px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
              ${monto}
            </div>
          </td>
        </tr>
      </table>
    `;
  }

  return `<!DOCTYPE html>
<html lang="es" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="x-apple-disable-message-reformatting">
  <meta name="color-scheme" content="light dark">
  <meta name="supported-color-schemes" content="light dark">
  <title>Nuevo Comprobante de Liquidación · Gestión IQ Districorr</title>
  
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->

  <style type="text/css">
    body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { -ms-interpolation-mode: bicubic; border: 0; outline: none; text-decoration: none; }
    
    @media (prefers-color-scheme: dark) {
      .bg-body { background-color: #0b0f19 !important; }
      .bg-card { background-color: #131b2e !important; border-color: #1e293b !important; }
      .text-title { color: #ffffff !important; }
      .text-body { color: #cbd5e1 !important; }
      .text-muted { color: #94a3b8 !important; }
      .box-info { background-color: #1e293b !important; border-color: #334155 !important; }
      .bg-footer { background-color: #131b2e !important; border-top-color: #1e293b !important; }
      .box-note { background-color: #064e3b !important; border-left-color: #10b981 !important; color: #a7f3d0 !important; }
    }

    @media only screen and (max-width: 600px) {
      .container-table { width: 100% !important; max-width: 100% !important; }
      .mobile-padding { padding-left: 20px !important; padding-right: 20px !important; }
      .btn-action { width: 100% !important; max-width: 280px !important; }
    }
  </style>
</head>

<body class="bg-body" style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
  
  <div style="display: none; font-size: 1px; color: #f1f5f9; line-height: 1px; max-height: 0px; max-width: 0px; opacity: 0; overflow: hidden;">
    Hola ${cleanFirstName}, se ha emitido un nuevo comprobante de liquidación de cirugías a tu nombre en Gestión IQ Districorr.
    &zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;
  </div>

  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" class="bg-body" style="background-color: #f1f5f9; table-layout: fixed;">
    <tr>
      <td align="center" style="padding: 24px 12px;">
        
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" class="container-table bg-card" style="max-width: 580px; background-color: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
          
          <tr>
            <td height="4" style="background: linear-gradient(90deg, #2563eb 0%, #3b82f6 50%, #10b981 100%);"></td>
          </tr>

          <tr>
            <td class="mobile-padding" style="padding: 24px 28px 18px 28px; border-bottom: 1px solid #f1f5f9;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td>
                    <div style="font-size: 11px; font-weight: 900; color: #2563eb; letter-spacing: 1px; text-transform: uppercase;">
                      DISTRICORR
                    </div>
                    <div class="text-title" style="font-size: 18px; font-weight: 900; color: #0f172a; margin-top: 2px;">
                      Gestión IQ
                    </div>
                  </td>
                  <td align="right" valign="middle">
                    <span style="display: inline-block; padding: 4px 10px; background-color: #eff6ff; border: 1px solid #bfdbfe; border-radius: 20px; font-size: 11px; font-weight: 800; color: #1d4ed8;">
                      💳 Liquidación
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td class="mobile-padding" style="padding: 24px 28px 20px 28px;">
              
              <h1 class="text-title" style="margin: 0 0 10px 0; font-size: 19px; font-weight: 800; color: #0f172a; line-height: 1.3;">
                ¡Hola, ${cleanFirstName}! 👋
              </h1>
              
              <p class="text-body" style="margin: 0 0 14px 0; font-size: 14px; color: #334155; line-height: 1.55;">
                Te informamos que desde <strong>Districorr</strong> se ha emitido y registrado un <strong>nuevo comprobante de pago</strong> correspondiente a tus cirugías acompañadas.
              </p>

              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" class="box-info" style="margin: 14px 0; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
                <tr>
                  <td style="padding: 14px 18px;">
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                      <tr>
                        <td style="padding: 4px 0; font-size: 12px; color: #64748b; font-weight: 600;">Fecha de emisión:</td>
                        <td align="right" class="text-title" style="padding: 4px 0; font-size: 13px; color: #0f172a; font-weight: 800;">${fecha}</td>
                      </tr>
                      ${numeroOrden ? `
                      <tr>
                        <td style="padding: 4px 0; font-size: 12px; color: #64748b; font-weight: 600;">Orden de pago:</td>
                        <td align="right" class="text-title" style="padding: 4px 0; font-size: 13px; color: #0f172a; font-weight: 800;">#${numeroOrden}</td>
                      </tr>
                      ` : ''}
                      <tr>
                        <td style="padding: 4px 0; font-size: 12px; color: #64748b; font-weight: 600;">Instrumentador:</td>
                        <td align="right" class="text-title" style="padding: 4px 0; font-size: 13px; color: #0f172a; font-weight: 800;">${nombreCompleto}</td>
                      </tr>
                      ${dni ? `
                      <tr>
                        <td style="padding: 4px 0; font-size: 12px; color: #64748b; font-weight: 600;">DNI de acceso:</td>
                        <td align="right" style="padding: 4px 0; font-size: 13px; color: #2563eb; font-weight: 800;">${dni}</td>
                      </tr>
                      ` : ''}
                      <tr>
                        <td style="padding: 4px 0; font-size: 12px; color: #64748b; font-weight: 600;">Estado:</td>
                        <td align="right" style="padding: 4px 0; font-size: 12px; color: #059669; font-weight: 800;">
                          ● Comprobante disponible
                        </td>
                      </tr>
                    </table>

                    ${pacientesHtml}
                    ${montoHtml}
                  </td>
                </tr>
              </table>

              <!-- Botón de Acción Adaptado y Centrado -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin: 22px 0 14px 0;">
                <tr>
                  <td align="center">
                    <!--[if mso]>
                    <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="${portalUrl}" style="height:44px;v-text-anchor:middle;width:240px;" arcsize="50%" stroke="f" fillcolor="#2563eb">
                      <w:anchorlock/>
                      <center style="color:#ffffff;font-family:sans-serif;font-size:13px;font-weight:bold;">Acceder a mi Portal ➔</center>
                    </v:roundrect>
                    <![endif]-->
                    <!--[if !mso]><!-->
                    <a href="${portalUrl}" target="_blank" class="btn-action" style="display: inline-block; padding: 12px 32px; background-color: #2563eb; color: #ffffff; font-size: 13px; font-weight: 800; text-decoration: none; border-radius: 50px; box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3); text-align: center; letter-spacing: 0.2px;">
                      Acceder a mi Portal ➔
                    </a>
                    <!--<![endif]-->
                  </td>
                </tr>
              </table>

              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" class="box-note" style="margin-top: 16px; background-color: #f0fdf4; border-left: 3px solid #22c55e; border-radius: 0 8px 8px 0;">
                <tr>
                  <td style="padding: 10px 14px; font-size: 12px; color: #166534; line-height: 1.5;">
                    💡 <strong>Acceso directo y seguro:</strong> Al ingresar, validá tu identidad con tu DNI para descargar el PDF de liquidación y consultar tu historial.
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <tr>
            <td class="mobile-padding bg-footer text-muted" style="padding: 20px 28px; background-color: #f8fafc; border-top: 1px solid #f1f5f9; font-size: 11px; color: #64748b; line-height: 1.5; text-align: center;">
              <p style="margin: 0 0 4px 0; font-weight: 700; color: #475569;">
                Districorr S.R.L. · Gestión IQ
              </p>
              <p style="margin: 0 0 6px 0;">
                Este correo fue enviado de forma automática porque estás registrado/a como instrumentador/a en Gestión IQ.
              </p>
              <p style="margin: 0; font-size: 10px; color: #94a3b8;">
                Si tenés alguna consulta administrativa o contable, comunicate por nuestros canales habituales.
              </p>
            </td>
          </tr>

        </table>
        
      </td>
    </tr>
  </table>

</body>
</html>`;
}

/**
 * Genera el HTML del correo de confirmación de suscripción cuando el instrumentador se registra o activa notificaciones por primera vez
 * @param {Object} data
 * @param {string} data.nombreCompleto Nombre del instrumentador
 * @param {string} data.dni DNI del instrumentador
 * @param {string} data.email Correo electrónico registrado
 * @param {string} data.portalUrl URL de acceso permanente al portal
 * @returns {string} HTML compilado y optimizado
 */
export function generateWelcomeEmailHtml({
  nombreCompleto = 'Instrumentador/a',
  dni = '',
  email = '',
  portalUrl = 'https://gestion-iq.districorr.com.ar'
}) {
  const firstName = nombreCompleto ? nombreCompleto.trim().split(' ')[0] : 'Estimado/a';
  const cleanFirstName = firstName.charAt(0).toUpperCase() + firstName.slice(1).toLowerCase();

  return `<!DOCTYPE html>
<html lang="es" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="x-apple-disable-message-reformatting">
  <meta name="color-scheme" content="light dark">
  <meta name="supported-color-schemes" content="light dark">
  <title>¡Ya estás suscrito/a a las notificaciones de Districorr!</title>

  <style type="text/css">
    body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { -ms-interpolation-mode: bicubic; border: 0; outline: none; text-decoration: none; }
    
    @media (prefers-color-scheme: dark) {
      .bg-body { background-color: #0b0f19 !important; }
      .bg-card { background-color: #131b2e !important; border-color: #1e293b !important; }
      .text-title { color: #ffffff !important; }
      .text-body { color: #cbd5e1 !important; }
      .text-muted { color: #94a3b8 !important; }
      .box-info { background-color: #1e293b !important; border-color: #334155 !important; }
      .bg-footer { background-color: #131b2e !important; border-top-color: #1e293b !important; }
      .box-note { background-color: #064e3b !important; border-left-color: #10b981 !important; color: #a7f3d0 !important; }
    }

    @media only screen and (max-width: 600px) {
      .container-table { width: 100% !important; max-width: 100% !important; }
      .mobile-padding { padding-left: 20px !important; padding-right: 20px !important; }
      .btn-action { width: 100% !important; max-width: 280px !important; }
    }
  </style>
</head>

<body class="bg-body" style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
  
  <div style="display: none; font-size: 1px; color: #f1f5f9; line-height: 1px; max-height: 0px; max-width: 0px; opacity: 0; overflow: hidden;">
    Hola ${cleanFirstName}, confirmamos tu suscripción para recibir avisos cuando se emitan tus comprobantes de pago de cirugías en Gestión IQ Districorr.
    &zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;
  </div>

  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" class="bg-body" style="background-color: #f1f5f9; table-layout: fixed;">
    <tr>
      <td align="center" style="padding: 24px 12px;">
        
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" class="container-table bg-card" style="max-width: 580px; background-color: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
          
          <tr>
            <td height="4" style="background: linear-gradient(90deg, #10b981 0%, #3b82f6 50%, #6366f1 100%);"></td>
          </tr>

          <tr>
            <td class="mobile-padding" style="padding: 24px 28px 18px 28px; border-bottom: 1px solid #f1f5f9;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td>
                    <div style="font-size: 11px; font-weight: 900; color: #059669; letter-spacing: 1px; text-transform: uppercase;">
                      DISTRICORR
                    </div>
                    <div class="text-title" style="font-size: 18px; font-weight: 900; color: #0f172a; margin-top: 2px;">
                      Gestión IQ
                    </div>
                  </td>
                  <td align="right" valign="middle">
                    <span style="display: inline-block; padding: 4px 10px; background-color: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 20px; font-size: 11px; font-weight: 800; color: #065f46;">
                      ✓ Suscripción Activa
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td class="mobile-padding" style="padding: 24px 28px 20px 28px;">
              
              <h1 class="text-title" style="margin: 0 0 10px 0; font-size: 19px; font-weight: 800; color: #0f172a; line-height: 1.3;">
                ¡Ya estás suscrito/a a las notificaciones de Districorr! 🎉
              </h1>
              
              <p class="text-body" style="margin: 0 0 14px 0; font-size: 14px; color: #334155; line-height: 1.55;">
                Hola <strong>${cleanFirstName}</strong>, te confirmamos que registraste con éxito tu dirección de correo electrónico para recibir un aviso automático cada vez que <strong>Districorr liquide y suba un comprobante de pago</strong> de tus cirugías acompañadas.
              </p>

              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" class="box-info" style="margin: 14px 0; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
                <tr>
                  <td style="padding: 14px 18px;">
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                      <tr>
                        <td style="padding: 4px 0; font-size: 12px; color: #64748b; font-weight: 600;">Instrumentador:</td>
                        <td align="right" class="text-title" style="padding: 4px 0; font-size: 13px; color: #0f172a; font-weight: 800;">${nombreCompleto}</td>
                      </tr>
                      ${dni ? `
                      <tr>
                        <td style="padding: 4px 0; font-size: 12px; color: #64748b; font-weight: 600;">DNI de acceso:</td>
                        <td align="right" style="padding: 4px 0; font-size: 13px; color: #2563eb; font-weight: 800;">${dni}</td>
                      </tr>
                      ` : ''}
                      ${email ? `
                      <tr>
                        <td style="padding: 4px 0; font-size: 12px; color: #64748b; font-weight: 600;">Correo registrado:</td>
                        <td align="right" class="text-title" style="padding: 4px 0; font-size: 13px; color: #0f172a; font-weight: 800;">${email}</td>
                      </tr>
                      ` : ''}
                      <tr>
                        <td style="padding: 4px 0; font-size: 12px; color: #64748b; font-weight: 600;">Frecuencia:</td>
                        <td align="right" style="padding: 4px 0; font-size: 12px; color: #059669; font-weight: 800;">
                          ● Solo cuando se liquide un pago
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Botón de Acción Adaptado y Centrado -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin: 22px 0 14px 0;">
                <tr>
                  <td align="center">
                    <!--[if mso]>
                    <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="${portalUrl}" style="height:44px;v-text-anchor:middle;width:240px;" arcsize="50%" stroke="f" fillcolor="#059669">
                      <w:anchorlock/>
                      <center style="color:#ffffff;font-family:sans-serif;font-size:13px;font-weight:bold;">Acceder a mi Portal ➔</center>
                    </v:roundrect>
                    <![endif]-->
                    <!--[if !mso]><!-->
                    <a href="${portalUrl}" target="_blank" class="btn-action" style="display: inline-block; padding: 12px 32px; background-color: #059669; color: #ffffff; font-size: 13px; font-weight: 800; text-decoration: none; border-radius: 50px; box-shadow: 0 4px 12px rgba(5, 150, 105, 0.3); text-align: center; letter-spacing: 0.2px;">
                      Acceder a mi Portal ➔
                    </a>
                    <!--<![endif]-->
                  </td>
                </tr>
              </table>

              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" class="box-note" style="margin-top: 16px; background-color: #f0fdf4; border-left: 3px solid #10b981; border-radius: 0 8px 8px 0;">
                <tr>
                  <td style="padding: 10px 14px; font-size: 12px; color: #065f46; line-height: 1.5;">
                    💡 <strong>Control de tus preferencias:</strong> Solo te enviaremos información relevante de liquidaciones. Podés modificar o dar de baja este aviso cuando quieras desde la sección <em>Mis Datos</em> en tu portal.
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <tr>
            <td class="mobile-padding bg-footer text-muted" style="padding: 20px 28px; background-color: #f8fafc; border-top: 1px solid #f1f5f9; font-size: 11px; color: #64748b; line-height: 1.5; text-align: center;">
              <p style="margin: 0 0 4px 0; font-weight: 700; color: #475569;">
                Districorr S.R.L. · Gestión IQ
              </p>
              <p style="margin: 0 0 6px 0;">
                Este correo fue enviado porque confirmaste tu suscripción a notificaciones de liquidación en Gestión IQ.
              </p>
              <p style="margin: 0; font-size: 10px; color: #94a3b8;">
                Districorr S.R.L. · Atención y Soporte a Instrumentadores
              </p>
            </td>
          </tr>

        </table>
        
      </td>
    </tr>
  </table>

</body>
</html>`;
}
