# Guía Técnica: Notificaciones Web Push Remotas (VAPID) en Gestión IQ

## 1. Visión General
Esta funcionalidad permite enviar notificaciones nativas a los celulares y computadoras de los instrumentadores **aun cuando tengan el navegador cerrado y la pantalla bloqueada**, cada vez que se emite un comprobante de pago o liquidación.

---

## 2. Claves Criptográficas VAPID de Gestión IQ

* **VAPID Public Key (Frontend):**
  `BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkrxZJjSgSnfckjBJuBkr3qBUYIHBQFLXYp5Nksh8U`
* **VAPID Private Key (Servidor / Edge Function):**
  `UU6VvEa1tTjV5rT62s_d8lR_z48vF_0w-hO71fGzR9c`
* **VAPID Subject / Contact:**
  `mailto:soporte@districorr.com.ar`

---

## 3. Pasos de Instalación en Supabase

### Paso 1: Ejecutar la migración SQL en Supabase Editor
Ejecutar el archivo [`supabase/migrations/20260925_create_push_subscriptions.sql`](file:///g:/GestionIQ%202026%2007/gestionIq/supabase/migrations/20260925_create_push_subscriptions.sql):

```sql
CREATE TABLE IF NOT EXISTS public.instrumentador_push_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    instrumentador_dni TEXT NOT NULL,
    endpoint TEXT NOT NULL UNIQUE,
    p256dh TEXT NOT NULL,
    auth TEXT NOT NULL,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_push_subs_dni ON public.instrumentador_push_subscriptions (instrumentador_dni);
CREATE INDEX IF NOT EXISTS idx_push_subs_endpoint ON public.instrumentador_push_subscriptions (endpoint);

ALTER TABLE public.instrumentador_push_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Permitir registrar suscripciones push públicas"
ON public.instrumentador_push_subscriptions FOR INSERT WITH CHECK (true);

CREATE POLICY "Permitir actualizar suscripciones push"
ON public.instrumentador_push_subscriptions FOR UPDATE USING (true) WITH CHECK (true);

CREATE POLICY "Lectura de suscripciones para administradores"
ON public.instrumentador_push_subscriptions FOR SELECT TO authenticated USING (true);
```

---

### Paso 2: Desplegar la Edge Function
Para desplegar la función de envío remoto en Supabase:

```bash
supabase functions deploy enviar-notificacion-push
```

O agregar las siguientes variables en el dashboard de Supabase (Settings ➔ Edge Functions):
- `VAPID_PUBLIC_KEY`: `BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkrxZJjSgSnfckjBJuBkr3qBUYIHBQFLXYp5Nksh8U`
- `VAPID_PRIVATE_KEY`: `UU6VvEa1tTjV5rT62s_d8lR_z48vF_0w-hO71fGzR9c`
- `VAPID_SUBJECT`: `mailto:soporte@districorr.com.ar`

---

## 4. Flujo del Instrumentador
1. El instrumentador recibe el enlace generado por el administrador:
   `https://gestion-iq.districorr.com.ar/resumen/:token?notif=1`
2. Valida su DNI.
3. El modal interactivo Animated UI le solicita permiso.
4. Al hacer clic en **"Activar Notificaciones Push"**, el navegador genera el token de suscripción y lo envía a la base de datos de Supabase.
5. A partir de ese momento, cualquier pago cargado disparará la notificación directamente a su pantalla de bloqueo.
