Stack tecnico

Framework y build

  - Vue ^3.4.21: confirmado por package.json.
  - Vite ^5.2.11: confirmado por package.json y vite.config.js.
  - Vue Router ^4.5.1: confirmado por src/router/index.js.
  - Tailwind CSS ^3.4.3: confirmado por tailwind.config.js, postcss.config.js y
    src/assets/css/tailwind.css.
  - Supabase JS ^2.57.4: confirmado por src/services/supabase.js.

Dependencias principales

  - @heroicons/vue: iconografia.
  - @vueuse/core: utilidades Vue, usado para storage/dark mode/click outside.
  - chart.js y vue-chartjs: graficos.
  - date-fns: fechas.
  - file-saver y xlsx: exportaciones.
  - html2canvas, jspdf, jspdf-autotable: generacion PDF.
  - signature_pad: firma digital.
  - vue-easy-lightbox: visualizacion de imagenes.
  - vue-toastification: notificaciones UI.
  - uuid: identificadores.
Configuracion Vite

Confirmado por codigo :

  - Alias vue: 'vue/dist/vue.esm-bundler.js'.
  - server.allowedHosts = ['.trycloudflare.com'].
  - Scripts: dev, build, preview.

Variables de entorno usadas

Solo se documentan nombres, no valores.

  - VITE_SUPABASE_URL: confirmado por codigo.
  - VITE_SUPABASE_ANON_KEY: confirmado por codigo.
  - VITE_R2_PUBLIC_URL: confirmado por codigo.
  - VITE_APP_VERSION: confirmado por codigo en Sidebar.vue, no presente en .env;
    pendiente de validar.
  - R2_ACCOUNT_ID: confirmado por Edge Function.
  - R2_ACCESS_KEY_ID: confirmado por Edge Function.
  - R2_SECRET_ACCESS_KEY: confirmado por Edge Function.
  - R2_BUCKET_NAME: confirmado por Edge Function.
Servicios externos

  - Supabase Auth, PostgREST, RPC, Realtime y Storage: confirmado por
    codigo/config.
  - Supabase Edge Functions: confirmado por supabase/functions/b2-presigned-url.
  - PostgreSQL: confirmado por Supabase config, version local major_version
    = 17.
  - Cloudflare R2: confirmado por Edge Function y VITE_R2_PUBLIC_URL.
  - Supabase Storage bucket firmas: confirmado por codigo y auditoria Supabase
    como publico.
  - Supabase Storage bucket documentos: confirmado por auditoria Supabase como
    publico; uso funcional en codigo pendiente de validar.
  - Vercel: inferido por vercel.json, URLs publicas hardcodeadas y nombres de
    links.
  - WhatsApp links: confirmado por codigo en flujos de evidencia/contacto.
Ambiente Supabase

Confirmado por auditoria Supabase :

  - Existe una unica produccion Supabase relevada.
  - No hay staging confirmado.
  - Roles observados o inferidos: anon, authenticated, postgres, service_role,
    PUBLIC.

Cliente Supabase

Confirmado por codigo : src/services/supabase.js crea un cliente con URL y anon
key Vite. No hay cliente server-side local ni service role en frontend.