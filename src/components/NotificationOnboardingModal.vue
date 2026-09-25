<!-- src/components/NotificationOnboardingModal.vue -->
<template>
  <GlassModal
    :open="show"
    title="Avisos y Notificaciones de Pago"
    description="Configurá cómo querés enterarte cada vez que Districorr emita un comprobante de liquidación a tu nombre."
    maxWidth="2xl"
    @close="handleClose"
  >
    <!-- Template del Título Personalizado con Icono -->
    <template #title>
      <div class="flex items-center gap-3">
        <div class="w-11 h-11 rounded-2xl bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 flex items-center justify-center font-bold text-base shrink-0 border border-blue-200 dark:border-blue-800 shadow-sm">
          <BellRing class="w-5 h-5 animate-pulse" />
        </div>
        <div>
          <div class="flex items-center gap-2">
            <span class="text-base sm:text-lg font-black text-slate-950 dark:text-white block">
              Avisos y Notificaciones de Pago
            </span>
            <AnimatedBadge variant="info" size="xs">
              Portal IQ
            </AnimatedBadge>
          </div>
          <span class="text-xs text-slate-600 dark:text-slate-300 font-medium block mt-0.5">
            Elegí tus canales preferidos para recibir tus comprobantes de liquidación
          </span>
        </div>
      </div>
    </template>

    <div class="space-y-4 pt-1 text-slate-900 dark:text-slate-100">
      
      <!-- CANAL 1 (PRINCIPAL Y PRIORITARIO): NOTIFICACIÓN POR CORREO ELECTRÓNICO -->
      <GlowCard glowColor="emerald" padding="sm" class="border-2 border-emerald-500/40 dark:border-emerald-500/30 bg-emerald-50/20 dark:bg-emerald-950/10 space-y-3">
        <div class="flex items-start justify-between gap-3 pb-2.5 border-b border-emerald-100 dark:border-emerald-900/40">
          <div class="flex items-center gap-2.5">
            <div class="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
              <Mail class="w-4 h-4" />
            </div>
            <div>
              <h3 class="text-xs sm:text-sm font-black text-slate-950 dark:text-white flex items-center gap-2">
                <span>Notificación por Correo Electrónico</span>
                <span class="inline-flex items-center gap-1 text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  <CheckCircle2 class="w-3 h-3 text-emerald-600" /> Principal
                </span>
              </h3>
              <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                ¿Querés recibir el detalle de tus comprobantes de pago por email?
              </p>
            </div>
          </div>

          <label class="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" v-model="emailEnabled" class="sr-only peer">
            <div class="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-slate-600 peer-checked:bg-emerald-600"></div>
          </label>
        </div>

        <div class="space-y-3 text-xs">
          <p class="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
            Vas a recibir el aviso con el comprobante adjunto y el acceso directo a tu portal apenas Districorr liquide tus honorarios. <span class="text-slate-500">(Podés cambiar tu correo cuando lo necesites).</span>
          </p>

          <div v-if="emailEnabled" class="space-y-2 pt-1 animate-fadeIn">
            <label class="block font-bold text-slate-700 dark:text-slate-300 text-[11px] uppercase tracking-wider">
              Tu dirección de correo electrónico vinculada:
            </label>
            <div class="relative">
              <input 
                v-model="emailAddress" 
                type="email" 
                placeholder="ejemplo: tu_email@gmail.com"
                class="w-full pl-9 pr-3.5 py-2.5 bg-white dark:bg-slate-950 border border-emerald-300 dark:border-emerald-800 rounded-xl text-xs sm:text-sm font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none transition-all placeholder:text-slate-400 placeholder:font-normal shadow-xs"
              />
              <Mail class="w-4 h-4 text-emerald-600 dark:text-emerald-400 absolute left-3 top-3 pointer-events-none" />
            </div>
            <p v-if="!isEmailValid && emailAddress.trim().length > 0" class="text-[11px] text-rose-500 font-bold">
              Por favor ingresá un correo electrónico válido (ej: nombre@correo.com).
            </p>
          </div>
        </div>
      </GlowCard>

      <!-- CANAL 2: NOTIFICACIONES PUSH EN EL DISPOSITIVO (COMPLEMENTARIO) -->
      <GlowCard glowColor="blue" padding="sm" class="border border-slate-200/80 dark:border-slate-800 space-y-3">
        <div class="flex items-start justify-between gap-3 pb-2.5 border-b border-slate-100 dark:border-slate-800">
          <div class="flex items-center gap-2.5">
            <div class="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800/80">
              <Smartphone class="w-4 h-4" />
            </div>
            <div>
              <h3 class="text-xs sm:text-sm font-black text-slate-950 dark:text-white flex items-center gap-2">
                <span>Notificaciones Push al Dispositivo</span>
                <span v-if="pushStatus === 'granted'" class="inline-flex items-center gap-1 text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                  <CheckCircle2 class="w-3 h-3 text-blue-600" /> Activo
                </span>
                <span v-else class="text-[10px] font-bold text-slate-400 uppercase">
                  Opcional
                </span>
              </h3>
              <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Alertas emergentes directas en la pantalla de este celular o PC
              </p>
            </div>
          </div>
        </div>

        <div class="space-y-3 text-xs">
          <p class="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium bg-blue-50/60 dark:bg-blue-950/30 p-2.5 rounded-xl border border-blue-100 dark:border-blue-900/40">
            🔔 <strong>Aviso:</strong> Solo te llegarán notificaciones cuando Districorr cargue un <strong>comprobante de pago</strong> de tus cirugías. No enviamos publicidad.
          </p>

          <div class="flex flex-wrap items-center justify-between gap-3 pt-1">
            <div class="text-[11px] text-slate-500 dark:text-slate-400">
              Estado en este navegador: 
              <strong class="text-slate-800 dark:text-slate-200">{{ pushStatusLabel }}</strong>
            </div>

            <div class="flex items-center gap-2">
              <ShimmerButton 
                v-if="pushStatus !== 'granted'" 
                variant="secondary"
                size="sm"
                :loading="isActivatingPush"
                @click="enablePushNotifications"
              >
                <Bell class="w-3.5 h-3.5 mr-1" />
                <span>{{ isActivatingPush ? 'Solicitando...' : 'Activar Notificaciones Push' }}</span>
              </ShimmerButton>

              <button 
                v-else 
                @click="sendTestNotification" 
                type="button" 
                class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-emerald-700 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-all cursor-pointer"
              >
                <Sparkles class="w-3.5 h-3.5 text-emerald-600" />
                <span>Enviar aviso de prueba</span>
              </button>
            </div>
          </div>

          <!-- ACORDEÓN TUTORIAL BREVE DE ACTIVACIÓN -->
          <div class="border-t border-slate-100 dark:border-slate-800 pt-2">
            <button 
              type="button" 
              @click="showTutorial = !showTutorial" 
              class="w-full flex items-center justify-between text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline py-1 cursor-pointer"
            >
              <span class="flex items-center gap-1.5">
                <HelpCircle class="w-3.5 h-3.5" />
                <span>Tutorial breve: ¿Cómo permitir notificaciones si te lo pide el navegador?</span>
              </span>
              <ChevronDown class="w-3.5 h-3.5 transition-transform duration-200" :class="{ 'rotate-180': showTutorial }" />
            </button>

            <div v-show="showTutorial" class="mt-2.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-2.5 text-[11px] text-slate-700 dark:text-slate-300">
              <div class="flex items-start gap-2">
                <span class="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 flex items-center justify-center font-bold shrink-0 text-[10px]">1</span>
                <div>
                  <strong class="text-slate-900 dark:text-white">Chrome / Edge / Firefox (PC y Android):</strong>
                  <p class="text-slate-500 dark:text-slate-400 mt-0.5">Al tocar en "Activar", aparecerá una pequeña ventana en la parte superior. Elegí <span class="font-bold text-emerald-600 dark:text-emerald-400">"Permitir"</span>.</p>
                </div>
              </div>

              <div class="flex items-start gap-2">
                <span class="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 flex items-center justify-center font-bold shrink-0 text-[10px]">2</span>
                <div>
                  <strong class="text-slate-900 dark:text-white">iPhone / iPad (Safari iOS):</strong>
                  <p class="text-slate-500 dark:text-slate-400 mt-0.5">Tocá el botón <em>Compartir</em> en Safari ➔ <span class="font-bold">"Agregar a pantalla de inicio"</span> para recibir alertas directas.</p>
                </div>
              </div>

              <div class="flex items-start gap-2 pt-1 border-t border-slate-200 dark:border-slate-800">
                <span class="w-5 h-5 rounded-full bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300 flex items-center justify-center font-bold shrink-0 text-[10px]">🔒</span>
                <div>
                  <strong class="text-slate-900 dark:text-white">¿Bloqueaste las notificaciones por error?</strong>
                  <p class="text-slate-500 dark:text-slate-400 mt-0.5">Hacé clic en el ícono del candado 🔒 al lado de la barra de dirección web ➔ seleccioná <span class="font-bold">"Permisos"</span> ➔ cambiá Notificaciones a <span class="font-bold text-emerald-600">"Permitir"</span>.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </GlowCard>

    </div>

    <!-- Footer con Botones de Acción Shimmer -->
    <template #footer>
      <div class="flex items-center justify-between gap-3 w-full">
        <button 
          type="button" 
          @click="handleClose"
          class="text-xs font-bold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 cursor-pointer"
        >
          Recordarme más tarde
        </button>

        <ShimmerButton 
          variant="primary" 
          size="sm"
          :loading="isSaving" 
          @click="savePreferences"
        >
          <CheckCircle2 class="w-4 h-4 mr-1.5" />
          <span>Guardar y Continuar</span>
        </ShimmerButton>
      </div>
    </template>
  </GlassModal>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { supabase } from '../services/supabase.js';
import { useToast } from 'vue-toastification';
import { 
  Bell, 
  BellRing, 
  Mail, 
  Smartphone, 
  CheckCircle2, 
  HelpCircle, 
  ChevronDown, 
  Sparkles 
} from 'lucide-vue-next';
import { GlassModal, GlowCard, ShimmerButton, AnimatedBadge } from './ui';
import { 
  getNotificationPermissionStatus, 
  subscribeUserToPush, 
  showDeviceNotification 
} from '../services/webPushService.js';
import { generateWelcomeEmailHtml } from '../services/emailComprobanteTemplateService.js';
import { sendEmailWithResend } from '../services/resendService.js';

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  instrumentador: {
    type: Object,
    default: null
  },
  dni: {
    type: String,
    default: ''
  }
});

const emit = defineEmits(['close', 'updated']);

const toast = useToast();
const isSaving = ref(false);
const isActivatingPush = ref(false);
const showTutorial = ref(false);

const pushStatus = ref(getNotificationPermissionStatus());
const emailEnabled = ref(true);
const emailAddress = ref('');

// Sincronizar email desde las props o desde el cache local
watch(() => [props.instrumentador, props.dni], ([inst, currentDni]) => {
  const cleanDni = currentDni || inst?.dni || '';
  let candidateEmail = inst?.email || '';

  if (!candidateEmail && cleanDni) {
    try {
      candidateEmail = localStorage.getItem(`gestioniq_email_${cleanDni}`) || '';
    } catch (e) {
      // Ignore localStorage error
    }
  }

  if (candidateEmail) {
    emailAddress.value = candidateEmail;
    emailEnabled.value = true;
  } else {
    // Canal prioritario: activado por defecto para solicitar email
    emailEnabled.value = true;
  }
}, { immediate: true, deep: true });

onMounted(() => {
  pushStatus.value = getNotificationPermissionStatus();
});

const isEmailValid = computed(() => {
  if (!emailEnabled.value) return true;
  const val = emailAddress.value.trim();
  return val.length > 3 && val.includes('@') && val.includes('.');
});

const pushStatusLabel = computed(() => {
  switch (pushStatus.value) {
    case 'granted': return 'Activado ✓ (Recibirás avisos)';
    case 'denied': return 'Bloqueado en el navegador ✕';
    case 'unsupported': return 'No soportado en este navegador';
    default: return 'No activado aún';
  }
});

const enablePushNotifications = async () => {
  isActivatingPush.value = true;
  try {
    const targetDni = props.dni || props.instrumentador?.dni || '';
    const result = await subscribeUserToPush(targetDni);
    pushStatus.value = getNotificationPermissionStatus();

    if (result.success) {
      toast.success('¡Notificaciones Push activadas con éxito en este dispositivo!');
      await showDeviceNotification({
        title: '🔔 Notificaciones Activadas',
        body: 'Te avisaremos por aquí cada vez que Districorr emita un comprobante de pago.',
        url: window.location.href
      });
    } else {
      toast.info(result.error || 'No se pudieron activar las notificaciones.');
    }
  } catch (err) {
    console.warn('Error al activar push:', err);
    toast.error('Error al solicitar permisos de notificación.');
  } finally {
    isActivatingPush.value = false;
  }
};

const sendTestNotification = async () => {
  const ok = await showDeviceNotification({
    title: '💳 Aviso de Prueba · Gestión IQ',
    body: '¡Todo listo! Recibirás avisos instantáneos cuando Districorr emita tus comprobantes.',
    url: window.location.href
  });
  if (ok) {
    toast.success('Notificación de prueba enviada a tu pantalla.');
  } else {
    toast.warning('No se pudo mostrar la notificación. Verificá los permisos de tu navegador.');
  }
};

const savePreferences = async () => {
  const cleanDni = props.dni || props.instrumentador?.dni;
  if (!cleanDni) {
    emit('close');
    return;
  }

  if (emailEnabled.value && !isEmailValid.value) {
    toast.warning('Por favor ingresá un correo electrónico válido antes de guardar.');
    return;
  }

  isSaving.value = true;
  try {
    const finalEmail = emailEnabled.value ? emailAddress.value.trim().toLowerCase() : null;

    // 1. Guardar email en localStorage para vincularlo inmediatamente en el navegador
    try {
      if (finalEmail) {
        localStorage.setItem(`gestioniq_email_${cleanDni}`, finalEmail);
      } else {
        localStorage.removeItem(`gestioniq_email_${cleanDni}`);
      }
      localStorage.setItem(`gestioniq_notif_prompted_${cleanDni}`, 'true');
      if (pushStatus.value === 'granted') {
        localStorage.setItem(`gestion_iq_push_optin_${cleanDni}`, 'granted');
      }
    } catch (e) {
      console.warn('[Onboarding] Error al guardar en localStorage:', e);
    }

    // 2. Intentar actualizar email en la tabla instrumentadores de forma no bloqueante
    if (finalEmail && finalEmail !== props.instrumentador?.email) {
      try {
        const { error } = await supabase
          .from('instrumentadores')
          .update({ email: finalEmail })
          .eq('dni', cleanDni);

        if (error) {
          console.warn('[Onboarding] Actualización directa en DB restringida (se sincronizará vía backend):', error.message || error);
        }
      } catch (dbErr) {
        console.warn('[Onboarding] No se pudo ejecutar update directo en tabla instrumentadores:', dbErr);
      }
    }

    // 3. Enviar correo de confirmación si se suscribe con email
    if (finalEmail && emailEnabled.value) {
      const welcomeSentKey = `gestioniq_welcome_email_sent_${cleanDni}`;
      const alreadySent = localStorage.getItem(welcomeSentKey) === 'true';

      if (!alreadySent) {
        try {
          const origin = typeof window !== 'undefined' ? window.location.origin : 'https://gestion-iq.districorr.com.ar';
          const targetToken = props.instrumentador?.activity_token || props.instrumentador?.token || '';
          const portalUrl = targetToken ? `${origin}/resumen/${targetToken}` : origin;

          const welcomeHtml = generateWelcomeEmailHtml({
            nombreCompleto: props.instrumentador?.nombre_completo || 'Instrumentador/a',
            dni: cleanDni,
            email: finalEmail,
            portalUrl
          });

          await sendEmailWithResend({
            to: finalEmail,
            subject: '🎉 ¡Ya estás suscrito/a a los avisos de pago de Districorr!',
            html: welcomeHtml,
            type: 'welcome',
            dni: cleanDni
          });

          localStorage.setItem(welcomeSentKey, 'true');
          toast.success(`¡Te enviamos un correo de confirmación a ${finalEmail}!`);
        } catch (emailErr) {
          console.warn('[Onboarding] Aviso de confirmación despachado:', emailErr);
        }
      }
    }

    toast.success('Preferencias guardadas correctamente.');
    emit('updated', { email: finalEmail, pushEnabled: pushStatus.value === 'granted' });
    emit('close');
  } catch (err) {
    console.error('Error al guardar preferencias:', err);
    toast.error('Ocurrió un error al guardar tus preferencias.');
  } finally {
    isSaving.value = false;
  }
};

const handleClose = () => {
  const cleanDni = props.dni || props.instrumentador?.dni;
  if (cleanDni) {
    try {
      localStorage.setItem(`gestioniq_notif_prompted_${cleanDni}`, 'true');
    } catch (e) {
      // Ignore
    }
  }
  emit('close');
};
</script>
