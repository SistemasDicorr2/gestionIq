<!-- src/components/FaqSection.vue -->
<template>
  <div class="space-y-6">
    <GlowCard class="p-6 sm:p-8 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-sm" glow-color="rgba(37, 99, 235, 0.1)">
      <!-- Header -->
      <div class="mb-6">
        <div class="flex items-center gap-2 mb-1">
          <div class="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/60 flex items-center justify-center text-blue-600 dark:text-blue-400 border border-blue-200/60 dark:border-blue-800/60">
            <HelpCircle class="w-4.5 h-4.5" />
          </div>
          <h2 class="text-xl sm:text-2xl font-black text-slate-950 dark:text-white">Preguntas Frecuentes</h2>
        </div>
        <p class="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium">
          Respuestas rápidas sobre pagos, comprobantes y estados de liquidación en Gestión IQ.
        </p>
      </div>

      <!-- FAQ Accordion List -->
      <div class="space-y-3">
        <div
          v-for="item in faqItems"
          :key="item.id"
          class="border border-slate-200/80 dark:border-slate-800 rounded-xl overflow-hidden bg-slate-50/50 dark:bg-slate-950/30 transition-colors"
        >
          <button
            type="button"
            class="w-full flex items-center justify-between gap-3 text-left px-4 py-3.5 hover:bg-slate-100/70 dark:hover:bg-slate-800/40 transition-colors cursor-pointer"
            @click="toggleFaq(item.id)"
            :aria-expanded="openFaqId === item.id"
          >
            <span class="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100">{{ item.q }}</span>
            <ChevronDown
              class="w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200"
              :class="openFaqId === item.id ? 'rotate-180 text-blue-500' : ''"
            />
          </button>

          <div v-show="openFaqId === item.id" class="px-4 pb-3.5 pt-1 border-t border-slate-100 dark:border-slate-800/80">
            <p class="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed" v-html="item.a"></p>
          </div>
        </div>
      </div>

      <!-- Tip Info Box -->
      <div class="mt-6 flex items-start gap-3 p-4 bg-sky-50/80 dark:bg-sky-950/40 border border-sky-200/80 dark:border-sky-800 rounded-xl text-sky-900 dark:text-sky-200 text-xs sm:text-sm">
        <Info class="w-5 h-5 shrink-0 text-sky-600 dark:text-sky-400 mt-0.5" />
        <p class="leading-relaxed font-medium">
          <strong class="font-black text-sky-950 dark:text-sky-100">Información importante:</strong> Si ves “Pendiente de pago”, normalmente es porque falta cerrar circuito: retorno de material al depósito + control técnico + ficha completa y enviada.
        </p>
      </div>

      <!-- WhatsApp Contact Section -->
      <div class="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <p class="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">¿Tenés alguna consulta puntual sobre una liquidación?</p>
          <p class="text-xs text-slate-500 dark:text-slate-400 font-medium">Nuestro equipo de administración te responderá a la brevedad.</p>
        </div>

        <a 
          :href="whatsappLink" 
          target="_blank" 
          rel="noopener noreferrer"
          class="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shrink-0"
        >
          <MessageCircle class="w-4 h-4" />
          <span>Consultar por WhatsApp</span>
        </a>
      </div>
    </GlowCard>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { GlowCard } from './ui';
import { HelpCircle, ChevronDown, Info, MessageCircle } from 'lucide-vue-next';

const whatsappLink = "https://wa.me/5493794007558?text=Hola%20Cesar,%20tengo%20una%20consulta%20sobre%20mis%20pagos.";

const openFaqId = ref(null);
const toggleFaq = (id) => {
  openFaqId.value = openFaqId.value === id ? null : id;
};

const faqItems = ref([
  { id: 'pago-cuando', q: '¿Cuándo se paga una cirugía?', a: `El pago se realiza <strong>dentro de los 10 días hábiles</strong> posteriores a que:<br>• El material regresa al depósito y se controla<br>• La ficha técnica esté <strong>completa y validada</strong>.` },
  { id: 'pendiente-por-que', q: '¿Por qué figura “Pendiente de pago” si ya instrumenté la cirugía?', a: `Porque el pago no se dispara solo por “instrumentar”. Se paga cuando se cierra el circuito: <strong>retorno de material</strong>, <strong>control</strong> y <strong>ficha técnica completa</strong>.` },
  { id: 'sin-ficha', q: '¿Puedo cobrar si no completé la ficha técnica?', a: `No. La ficha técnica es <strong>obligatoria</strong> y forma parte de la política de la empresa. Sin ficha → <strong>no se procesa el pago</strong>.` },
  { id: 'pago-agrupado', q: '¿Qué pasa si me pagaron varias cirugías juntas?', a: `Es normal. Muchas veces se agrupan varias cirugías de una misma semana en <strong>un solo pago</strong> (un solo comprobante).` },
  { id: 'comprobante-donde', q: '¿Dónde veo mi comprobante de pago?', a: `Cuando el estado figura como <strong>“Pagado”</strong>, vas a ver el botón <strong>“Ver comprobante”</strong> disponible en la tarjeta del reporte.` },
  { id: 'por-que-ficha', q: '¿Por qué es tan importante completar la ficha técnica?', a: `Porque permite validar el evento quirúrgico, controlar materiales y registrar observaciones. Es el paso que habilita el cierre del circuito y el pago.` },
  { id: 'no-veo-pago', q: '¿Por qué no veo el estado de pago?', a: `Hasta que la ficha no esté completa y enviada, el sistema puede mostrarte “Completa la ficha…”. Recién con <strong>Enviado</strong> se muestra el estado de pago.` },
  { id: 'estados', q: '¿Qué significa cada estado?', a: `<strong>Pendiente:</strong> falta completar o validar la ficha.<br><strong>Enviado:</strong> ficha cerrada y circuito finalizado.<br><strong>Pagado:</strong> pago realizado y comprobante disponible.` },
  { id: 'dos-tiempos', q: '¿Qué pasa si una cirugía se reprograma o tiene dos tiempos quirúrgicos?', a: `Cada tiempo se gestiona como un <strong>evento logístico distinto</strong>. Eso impacta en materiales, fichas y pagos.` },
]);
</script>