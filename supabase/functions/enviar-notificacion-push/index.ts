// supabase/functions/enviar-notificacion-push/index.ts
// Edge Function para emitir Web Push Remoto a los celulares de instrumentadores
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import webpush from "https://esm.sh/web-push@3.6.7";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
};

const VAPID_PUBLIC_KEY = Deno.env.get('VAPID_PUBLIC_KEY') || 'BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkrxZJjSgSnfckjBJuBkr3qBUYIHBQFLXYp5Nksh8U';
const VAPID_PRIVATE_KEY = Deno.env.get('VAPID_PRIVATE_KEY') || 'UU6VvEa1tTjV5rT62s_d8lR_z48vF_0w-hO71fGzR9c';
const VAPID_SUBJECT = Deno.env.get('VAPID_SUBJECT') || 'mailto:soporte@districorr.com.ar';

webpush.setVapidDetails(
  VAPID_SUBJECT,
  VAPID_PUBLIC_KEY,
  VAPID_PRIVATE_KEY
);

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { status: 200, headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

    if (!supabaseUrl || !supabaseServiceKey) {
      return new Response(
        JSON.stringify({ error: "Variables de entorno de Supabase no configuradas." }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { dni, dnis, title, body, url, icon } = await req.json();

    const targetDnis: string[] = [];
    if (dni) targetDnis.push(String(dni).trim());
    if (Array.isArray(dnis)) {
      dnis.forEach(d => {
        const clean = String(d || '').trim();
        if (clean && !targetDnis.includes(clean)) targetDnis.push(clean);
      });
    }

    if (targetDnis.length === 0) {
      return new Response(
        JSON.stringify({ error: "Se requiere al menos un 'dni' o lista de 'dnis' destinatarios." }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 1. Obtener todas las suscripciones push de los DNI solicitados
    const { data: subscriptions, error: dbError } = await supabase
      .from('instrumentador_push_subscriptions')
      .select('*')
      .in('instrumentador_dni', targetDnis);

    if (dbError) {
      return new Response(
        JSON.stringify({ error: "Error al consultar suscripciones push:", details: dbError }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!subscriptions || subscriptions.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "No se encontraron suscripciones push activas para los DNI provistos.",
          sent: 0,
          failed: 0
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 2. Preparar el payload JSON
    const payload = JSON.stringify({
      title: title || '💳 Gestión IQ · Districorr',
      body: body || 'Nuevo comprobante de liquidación disponible en tu portal.',
      url: url || 'https://gestion-iq.districorr.com.ar',
      icon: icon || 'https://gestion-iq.districorr.com.ar/favicon.ico'
    });

    let sentCount = 0;
    let failedCount = 0;
    const expiredEndpoints: string[] = [];

    // 3. Enviar a cada dispositivo/suscripción
    for (const sub of subscriptions) {
      const pushSubscription = {
        endpoint: sub.endpoint,
        keys: {
          p256dh: sub.p256dh,
          auth: sub.auth
        }
      };

      try {
        await webpush.sendNotification(pushSubscription, payload);
        sentCount++;
      } catch (err: any) {
        failedCount++;
        // Si el endpoint respondió 410 (Gone) o 404 (Not Found), el usuario desinstaló o revocó permisos
        if (err?.statusCode === 410 || err?.statusCode === 404) {
          expiredEndpoints.push(sub.endpoint);
        }
      }
    }

    // 4. Limpieza automática de endpoints caducados
    if (expiredEndpoints.length > 0) {
      await supabase
        .from('instrumentador_push_subscriptions')
        .delete()
        .in('endpoint', expiredEndpoints);
    }

    return new Response(
      JSON.stringify({
        success: true,
        sent: sentCount,
        failed: failedCount,
        cleanedExpired: expiredEndpoints.length
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err.message || "Error interno al emitir Web Push." }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
