<!-- src/components/admin/EmailComprobantePreviewModal.vue -->
<template>
  <GlassModal
    :open="show"
    title="Vista Previa y Prueba de Correos"
    description="Inspeccioná el diseño responsive de los correos automáticos y enviá pruebas reales vía Resend."
    maxWidth="4xl"
    @close="$emit('close')"
  >
    <template #title>
      <div class="flex items-center justify-between w-full">
        <div class="flex items-center gap-3">
          <div class="w-11 h-11 rounded-2xl bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 flex items-center justify-center font-bold text-base shrink-0 border border-blue-200 dark:border-blue-800 shadow-sm">
            <Mail class="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <div class="flex items-center gap-2">
              <span class="text-base sm:text-lg font-black text-slate-950 dark:text-white block">
                Plantillas de Correo para Instrumentadores
              </span>
              <AnimatedBadge variant="info" size="xs">
                HTML Responsive
              </AnimatedBadge>
            </div>
            <span class="text-xs text-slate-500 dark:text-slate-400 font-medium block mt-0.5">
              Formato compatible con Gmail, Apple Mail, Outlook y Móviles
            </span>
          </div>
        </div>

        <!-- Switcher de Dispositivo en Cabecera -->
        <div class="hidden sm:flex items-center gap-2 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
          <button 
            type="button" 
            @click="previewDevice = 'desktop'"
            :class="[
              'px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer',
              previewDevice === 'desktop' 
                ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-300 shadow-xs' 
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            ]"
          >
            <Monitor class="w-3.5 h-3.5" />
            <span>Desktop</span>
          </button>
          <button 
            type="button" 
            @click="previewDevice = 'mobile'"
            :class="[
              'px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer',
              previewDevice === 'mobile' 
                ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-300 shadow-xs' 
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            ]"
          >
            <Smartphone class="w-3.5 h-3.5" />
            <span>Móvil</span>
          </button>
        </div>
      </div>
    </template>

    <div class="grid grid-cols-1 lg:grid-cols-12 gap-5 pt-1">
      
      <!-- COLUMNA IZQUIERDA: CONFIGURADOR Y SELECTOR DE PLANTILLA (4 cols) -->
      <div class="lg:col-span-4 space-y-3 text-xs">
        
        <!-- SELECTOR DE PLANTILLA -->
        <div class="space-y-1.5">
          <label class="block font-bold text-slate-700 dark:text-slate-300 text-[11px] uppercase tracking-wider">
            Plantilla a previsualizar:
          </label>
          <div class="grid grid-cols-2 gap-2">
            <button 
              type="button" 
              @click="templateType = 'comprobante'"
              :class="[
                'p-2 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between',
                templateType === 'comprobante'
                  ? 'bg-blue-50 dark:bg-blue-950/60 border-blue-500 text-blue-900 dark:text-blue-200 ring-2 ring-blue-500/20 shadow-xs'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
              ]"
            >
              <span class="font-black text-[11px] leading-tight">💳 Comprobante</span>
              <span class="text-[9px] text-slate-500 dark:text-slate-400 mt-1">Aviso de pago</span>
            </button>

            <button 
              type="button" 
              @click="templateType = 'welcome'"
              :class="[
                'p-2 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between',
                templateType === 'welcome'
                  ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 text-emerald-900 dark:text-emerald-200 ring-2 ring-emerald-500/20 shadow-xs'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
              ]"
            >
              <span class="font-black text-[11px] leading-tight">🎉 Bienvenida</span>
              <span class="text-[9px] text-slate-500 dark:text-slate-400 mt-1">Suscripción</span>
            </button>
          </div>
        </div>

        <GlowCard glowColor="blue" padding="sm" class="border border-slate-200/80 dark:border-slate-800 space-y-2.5">
          <div class="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-1.5">
            <span class="font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider text-[11px]">
              Datos de Prueba
            </span>
            <span class="text-[10px] text-slate-400">Edición en vivo</span>
          </div>

          <div class="space-y-2">
            <div>
              <label class="block font-bold text-slate-700 dark:text-slate-300 text-[11px] mb-1">
                Nombre del Instrumentador:
              </label>
              <input 
                v-model="testData.nombreCompleto" 
                type="text" 
                class="w-full px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-medium text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div class="grid grid-cols-2 gap-2">
              <div>
                <label class="block font-bold text-slate-700 dark:text-slate-300 text-[11px] mb-1">
                  DNI:
                </label>
                <input 
                  v-model="testData.dni" 
                  type="text" 
                  class="w-full px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-medium text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
              <div v-if="templateType === 'comprobante'">
                <label class="block font-bold text-slate-700 dark:text-slate-300 text-[11px] mb-1">
                  Monto:
                </label>
                <input 
                  v-model="testData.monto" 
                  type="text" 
                  placeholder="$ 45.000,00"
                  class="w-full px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-medium text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
              <div v-else>
                <label class="block font-bold text-slate-700 dark:text-slate-300 text-[11px] mb-1">
                  Email Instrumentador:
                </label>
                <input 
                  v-model="testData.email" 
                  type="text" 
                  placeholder="atorres@gmail.com"
                  class="w-full px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-medium text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <div v-if="templateType === 'comprobante'">
              <label class="block font-bold text-slate-700 dark:text-slate-300 text-[11px] mb-1">
                Pacientes / Cirugías (separados por coma):
              </label>
              <textarea 
                v-model="rawPacientes" 
                rows="2"
                class="w-full px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-medium text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
              ></textarea>
            </div>
          </div>
        </GlowCard>

        <!-- SECCIÓN DE ENVÍO DE PRUEBA REAL VÍA RESEND -->
        <GlowCard glowColor="emerald" padding="sm" class="border border-slate-200/80 dark:border-slate-800 space-y-2.5">
          <div class="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-1.5">
            <Send class="w-3.5 h-3.5 text-emerald-600" />
            <span class="font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider text-[11px]">
              Enviar Prueba Real
            </span>
          </div>

          <div class="space-y-2">
            <div>
              <label class="block font-bold text-slate-700 dark:text-slate-300 text-[11px] mb-1">
                Correo destinatario de prueba:
              </label>
              <input 
                v-model="testEmailRecipient" 
                type="email" 
                placeholder="tu-correo@districorr.com.ar"
                class="w-full px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-medium text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <ShimmerButton 
              variant="primary" 
              size="sm"
              class="w-full justify-center !bg-emerald-600 hover:!bg-emerald-700"
              :loading="isSendingTest"
              @click="handleSendTestEmail"
            >
              <Send class="w-3.5 h-3.5 mr-1.5" />
              <span>Enviar Prueba ({{ templateType === 'comprobante' ? 'Comprobante' : 'Bienvenida' }})</span>
            </ShimmerButton>
          </div>
        </GlowCard>
      </div>

      <!-- COLUMNA DERECHA: VISOR IFRAME RESPONSIVE (8 cols) -->
      <div class="lg:col-span-8 flex flex-col items-center bg-slate-100 dark:bg-slate-950/80 p-3 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 min-h-[460px]">
        
        <div 
          :style="{ width: previewDevice === 'mobile' ? '375px' : '100%', maxWidth: previewDevice === 'mobile' ? '375px' : '620px' }"
          class="transition-all duration-300 bg-white shadow-lg rounded-xl overflow-hidden border border-slate-200 flex-1 flex flex-col"
        >
          <div class="bg-slate-100 dark:bg-slate-800 px-3 py-1.5 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between text-[10px] text-slate-500 font-mono">
            <span class="truncate">
              {{ templateType === 'comprobante' ? 'Asunto: Nuevo Comprobante de Liquidación · Gestión IQ' : 'Asunto: 🎉 ¡Ya estás suscrito/a a los avisos de Districorr!' }}
            </span>
            <span class="font-bold shrink-0">{{ previewDevice === 'mobile' ? '375px' : '600px' }}</span>
          </div>

          <iframe 
            :srcdoc="compiledHtml" 
            class="w-full flex-1 border-0 min-h-[420px]"
            title="Vista Previa de Correo"
          ></iframe>
        </div>
      </div>

    </div>

    <template #footer>
      <div class="flex items-center justify-between w-full">
        <button 
          type="button" 
          @click="$emit('close')"
          class="text-xs font-bold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 cursor-pointer"
        >
          Cerrar
        </button>

        <div class="flex items-center gap-2">
          <button 
            type="button" 
            @click="copyHtmlSource"
            class="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <CheckIcon v-if="copiedHtml" class="w-3.5 h-3.5 text-emerald-600" />
            <Copy v-else class="w-3.5 h-3.5" />
            <span>{{ copiedHtml ? '¡HTML Copiado!' : 'Copiar Código HTML' }}</span>
          </button>
        </div>
      </div>
    </template>
  </GlassModal>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue';
import { useToast } from 'vue-toastification';
import { 
  Mail, 
  Send, 
  Monitor, 
  Smartphone, 
  Copy, 
  Check as CheckIcon 
} from 'lucide-vue-next';
import { GlassModal, GlowCard, ShimmerButton, AnimatedBadge } from '../ui';
import { 
  generateComprobanteEmailHtml, 
  generateWelcomeEmailHtml 
} from '../../services/emailComprobanteTemplateService.js';
import { sendEmailWithResend } from '../../services/resendService.js';

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
const templateType = ref('comprobante');
const previewDevice = ref('desktop');
const isSendingTest = ref(false);
const copiedHtml = ref(false);
const testEmailRecipient = ref('');

const testData = reactive({
  nombreCompleto: 'Alejandra Torres',
  dni: '41516269',
  email: 'atorres@gmail.com',
  monto: '$ 52.500,00',
  numeroOrden: 'OP-2026-084'
});

const rawPacientes = ref('Gómez Claudia (Sanatorio del Norte), Benítez Marcelo (Clínica Santa Clara)');

watch(() => props.instrumentador, (inst) => {
  if (inst) {
    testData.nombreCompleto = inst.nombre_completo || 'Alejandra Torres';
    testData.dni = inst.dni || '41516269';
    testData.email = inst.email || 'atorres@gmail.com';
  }
}, { immediate: true });

const pacientesList = computed(() => {
  if (!rawPacientes.value) return [];
  return rawPacientes.value.split(',').map(p => p.trim()).filter(Boolean);
});

const compiledHtml = computed(() => {
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://gestion-iq.districorr.com.ar';
  const targetToken = props.token || props.instrumentador?.activity_token || props.instrumentador?.token || 'DEMO_TOKEN';
  const portalUrl = `${origin}/resumen/${targetToken}`;

  if (templateType.value === 'welcome') {
    return generateWelcomeEmailHtml({
      nombreCompleto: testData.nombreCompleto,
      dni: testData.dni,
      email: testData.email,
      portalUrl
    });
  }

  return generateComprobanteEmailHtml({
    nombreCompleto: testData.nombreCompleto,
    dni: testData.dni,
    portalUrl,
    monto: testData.monto,
    pacientes: pacientesList.value,
    numeroOrden: testData.numeroOrden
  });
});

const handleSendTestEmail = async () => {
  const recipient = testEmailRecipient.value.trim();
  if (!recipient || !recipient.includes('@')) {
    toast.warning('Por favor ingresá un correo electrónico válido para la prueba.');
    return;
  }

  isSendingTest.value = true;
  try {
    const subject = templateType.value === 'welcome'
      ? `[PRUEBA] 🎉 ¡Ya estás suscrito/a a los avisos de pago de Districorr! (${testData.nombreCompleto})`
      : `[PRUEBA] Nuevo Comprobante de Liquidación · Gestión IQ (${testData.nombreCompleto})`;

    await sendEmailWithResend({
      to: recipient,
      subject,
      html: compiledHtml.value
    });
    toast.success(`¡Email de prueba enviado exitosamente a ${recipient}!`);
  } catch (err) {
    console.error('Error al enviar prueba:', err);
    toast.error(`Error al enviar correo de prueba: ${err.message}`);
  } finally {
    isSendingTest.value = false;
  }
};

const copyHtmlSource = async () => {
  try {
    await navigator.clipboard.writeText(compiledHtml.value);
    copiedHtml.value = true;
    toast.success('¡Código HTML del correo copiado al portapapeles!');
    setTimeout(() => { copiedHtml.value = false; }, 2000);
  } catch (err) {
    toast.error('No se pudo copiar el código HTML.');
  }
};
</script>
