<!-- src/components/admin/ModalCompartirNotificaciones.vue -->
<template>
  <GlassModal
    :open="show"
    title="Compartir Acceso y Aviso de Notificaciones"
    description="Generá y copiá el mensaje con enlace personalizado para que el instrumentador active sus notificaciones de pago."
    maxWidth="2xl"
    @close="$emit('close')"
  >
    <!-- Template del Título Personalizado -->
    <template #title>
      <div class="flex items-center gap-3">
        <div class="w-11 h-11 rounded-2xl bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 flex items-center justify-center font-bold text-base shrink-0 border border-indigo-200 dark:border-indigo-800 shadow-sm">
          <BellRing class="w-5 h-5 animate-pulse" />
        </div>
        <div>
          <div class="flex items-center gap-2">
            <span class="text-base sm:text-lg font-black text-slate-950 dark:text-white block">
              Compartir Acceso al Instrumentador
            </span>
            <AnimatedBadge variant="indigo" size="xs">
              DNI: {{ instrumentador?.dni || 'N/A' }}
            </AnimatedBadge>
          </div>
          <span class="text-xs text-slate-500 dark:text-slate-400 font-medium block mt-0.5">
            {{ instrumentador?.nombre_completo || 'Profesional seleccionado' }}
          </span>
        </div>
      </div>
    </template>

    <div v-if="instrumentador" class="space-y-4 pt-1 text-slate-900 dark:text-slate-100 text-xs">
      
      <!-- SELECTOR DE PLANTILLA DE MENSAJE -->
      <div class="space-y-1.5">
        <label class="block font-bold text-slate-700 dark:text-slate-300 text-[11px] uppercase tracking-wider">
          Seleccionar Formato de Mensaje:
        </label>
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <button 
            type="button" 
            @click="selectedTemplate = 'notif'"
            :class="[
              'p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between',
              selectedTemplate === 'notif'
                ? 'bg-blue-50 dark:bg-blue-950/60 border-blue-500 text-blue-900 dark:text-blue-200 ring-2 ring-blue-500/20 shadow-xs'
                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
            ]"
          >
            <div class="flex items-center justify-between gap-1 mb-1">
              <span class="font-black text-[11px]">🔔 Activar Notificaciones</span>
              <span v-if="selectedTemplate === 'notif'" class="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
            </div>
            <p class="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">
              Leyenda orientada a habilitar avisos de pagos en el celular.
            </p>
          </button>

          <button 
            type="button" 
            @click="selectedTemplate = 'portal'"
            :class="[
              'p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between',
              selectedTemplate === 'portal'
                ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-500 text-indigo-900 dark:text-indigo-200 ring-2 ring-indigo-500/20 shadow-xs'
                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
            ]"
          >
            <div class="flex items-center justify-between gap-1 mb-1">
              <span class="font-black text-[11px]">📋 Acceso Oficial</span>
              <span v-if="selectedTemplate === 'portal'" class="w-1.5 h-1.5 rounded-full bg-indigo-600"></span>
            </div>
            <p class="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">
              Invitación institucional con link general y DNI.
            </p>
          </button>

          <button 
            type="button" 
            @click="selectedTemplate = 'link'"
            :class="[
              'p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between',
              selectedTemplate === 'link'
                ? 'bg-slate-100 dark:bg-slate-800 border-slate-400 text-slate-900 dark:text-white ring-2 ring-slate-400/20 shadow-xs'
                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
            ]"
          >
            <div class="flex items-center justify-between gap-1 mb-1">
              <span class="font-black text-[11px]">🔗 Solo Enlace</span>
              <span v-if="selectedTemplate === 'link'" class="w-1.5 h-1.5 rounded-full bg-slate-600"></span>
            </div>
            <p class="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">
              Solo la URL directa con parámetro de activación.
            </p>
          </button>
        </div>
      </div>

      <!-- VISTA PREVIA DEL MENSAJE (EDITABLE O LISTO PARA COPIAR) -->
      <GlowCard glowColor="indigo" padding="sm" class="border border-slate-200/80 dark:border-slate-800 space-y-2.5">
        <div class="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
          <div class="flex items-center gap-2">
            <MessageSquare class="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span class="font-black text-[11px] uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Vista Previa del Mensaje
            </span>
          </div>
          <span class="text-[10px] text-slate-400">
            Formateado para WhatsApp / Correo
          </span>
        </div>

        <div class="relative">
          <textarea 
            v-model="customMessage" 
            rows="6"
            class="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-mono text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition leading-relaxed"
          ></textarea>
        </div>
      </GlowCard>

      <!-- CANALES ACTUALES DEL INSTRUMENTADOR -->
      <div class="p-3 bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between text-[11px]">
        <div class="flex items-center gap-3">
          <span class="font-bold text-slate-500">Estado actual del instrumentador:</span>
          <span :class="instrumentador.has_push ? 'text-emerald-600 font-bold' : 'text-slate-400'">
            ● Push: {{ instrumentador.has_push ? 'Activo' : 'No' }}
          </span>
          <span :class="instrumentador.has_email ? 'text-blue-600 font-bold' : 'text-slate-400'">
            ● Email: {{ instrumentador.has_email ? instrumentador.email : 'No' }}
          </span>
        </div>

        <span v-if="instrumentador.telefono" class="text-slate-500 font-mono">
          Tel: {{ instrumentador.telefono }}
        </span>
      </div>

    </div>

    <!-- Footer con Botones de Acción Shimmer -->
    <template #footer>
      <div class="flex flex-wrap items-center justify-between gap-2.5 w-full">
        <ShimmerButton 
          variant="glass" 
          size="sm"
          type="button" 
          @click="$emit('close')"
        >
          Cerrar
        </ShimmerButton>

        <div class="flex items-center gap-2">
          <!-- Vista Previa Email HTML -->
          <button 
            type="button"
            @click="isPreviewEmailOpen = true"
            class="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition cursor-pointer"
            title="Ver diseño del correo y enviar prueba real vía Resend"
          >
            <Mail class="w-3.5 h-3.5 text-blue-600" />
            <span>Vista Previa Email</span>
          </button>

          <!-- WhatsApp Directo -->
          <button 
            type="button"
            @click="sendWhatsApp"
            class="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-black text-white bg-emerald-600 hover:bg-emerald-700 active:scale-95 transition shadow-sm cursor-pointer"
          >
            <Send class="w-3.5 h-3.5" />
            <span>Enviar por WhatsApp</span>
          </button>

          <!-- Copiar Mensaje -->
          <ShimmerButton 
            variant="primary" 
            size="sm"
            @click="copyMessage"
          >
            <CheckIcon v-if="isCopied" class="w-3.5 h-3.5 mr-1 text-white" />
            <Copy v-else class="w-3.5 h-3.5 mr-1" />
            <span>{{ isCopied ? '¡Copiado!' : 'Copiar Leyenda y Link' }}</span>
          </ShimmerButton>
        </div>
      </div>
    </template>
  </GlassModal>

  <!-- Modal de Vista Previa y Prueba de Correo -->
  <EmailComprobantePreviewModal 
    :show="isPreviewEmailOpen" 
    :instrumentador="instrumentador" 
    :token="token" 
    @close="isPreviewEmailOpen = false" 
  />
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { useToast } from 'vue-toastification';
import { 
  BellRing, 
  MessageSquare, 
  Copy, 
  Send, 
  Mail,
  Check as CheckIcon 
} from 'lucide-vue-next';
import { GlassModal, GlowCard, ShimmerButton, AnimatedBadge } from '../ui';
import EmailComprobantePreviewModal from './EmailComprobantePreviewModal.vue';

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  instrumentador: {
    type: Object,
    default: null
  },
  token: {
    type: String,
    default: ''
  }
});

defineEmits(['close']);

const toast = useToast();
const selectedTemplate = ref('notif');
const isCopied = ref(false);
const isPreviewEmailOpen = ref(false);
const customMessage = ref('');

const baseUrl = computed(() => {
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://gestion-iq.districorr.com.ar';
  const targetToken = props.token || props.instrumentador?.activity_token || props.instrumentador?.token || '';
  return targetToken ? `${origin}/resumen/${targetToken}` : `${origin}/`;
});

const generateMessage = () => {
  if (!props.instrumentador) return '';
  const firstName = props.instrumentador.nombre_completo 
    ? props.instrumentador.nombre_completo.split(' ')[0] 
    : 'Estimado/a';
  const url = baseUrl.value;
  const dni = props.instrumentador.dni || '';

  if (selectedTemplate.value === 'notif') {
    return `🔔 *Gestión IQ · Activación de Avisos de Pago*\n\nHola *${firstName}*, desde Districorr habilitamos las notificaciones automáticas para que recibas un aviso en tu celular cada vez que se liquide y cargue un comprobante de pago de tus cirugías.\n\n👉 *Ingresá aquí para activar tus avisos:*\n🔗 ${url}?notif=1\n\n🔒 *Tu DNI de acceso:* ${dni}\n\n_Al entrar, tocá en "Activar notificaciones" y seleccioná "Permitir" en tu navegador._`;
  }

  if (selectedTemplate.value === 'portal') {
    return `Hola *${firstName}*, te compartimos tu enlace oficial de acceso permanente al Portal de Gestión IQ para que puedas consultar tus cirugías, liquidaciones y descargar tus comprobantes de pago:\n\n🔗 Enlace de acceso: ${url}\n🔒 Ingreso con tu DNI: ${dni}\n\n💡 Al ingresar por primera vez, podés activar las notificaciones push o por correo para enterarte en cuanto se suba un comprobante.`;
  }

  if (selectedTemplate.value === 'link') {
    return `${url}?notif=1`;
  }

  return '';
};

watch([() => props.instrumentador, selectedTemplate, baseUrl], () => {
  customMessage.value = generateMessage();
}, { immediate: true });

const copyMessage = async () => {
  if (!customMessage.value) return;
  try {
    await navigator.clipboard.writeText(customMessage.value);
    isCopied.value = true;
    toast.success('¡Leyenda y enlace copiados al portapapeles!');
    setTimeout(() => { isCopied.value = false; }, 2000);
  } catch (err) {
    toast.error('No se pudo copiar el texto al portapapeles.');
  }
};

const sendWhatsApp = () => {
  if (!customMessage.value) return;
  let cleanPhone = (props.instrumentador?.telefono || '').replace(/\D/g, '');
  if (cleanPhone.length > 0 && !cleanPhone.startsWith('54')) {
    cleanPhone = '54' + cleanPhone;
  }
  const waUrl = cleanPhone 
    ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(customMessage.value)}`
    : `https://wa.me/?text=${encodeURIComponent(customMessage.value)}`;
    
  toast.info('Abriendo WhatsApp...');
  window.open(waUrl, '_blank');
};
</script>
