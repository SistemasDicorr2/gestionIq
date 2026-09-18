<!-- src/components/MyDataSection.vue -->
<template>
  <div class="space-y-6 sm:space-y-8">
    <!-- Header -->
    <div class="mb-4">
      <h2 class="text-xl sm:text-2xl font-black text-slate-950 dark:text-white">Mi Perfil</h2>
      <p class="max-w-3xl mt-1 text-xs sm:text-sm text-slate-800 dark:text-slate-200 font-bold">
        Resumen de tu información registrada y trayectoria quirúrgica con Districorr.
      </p>
    </div>

    <!-- Card Principal de Perfil -->
    <GlowCard class="p-5 sm:p-6 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-2xl shadow-md" glow-color="rgba(37, 99, 235, 0.12)">
      <div class="flex flex-col gap-5 sm:flex-row sm:items-center">
        <div class="flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 text-xl sm:text-2xl font-black text-blue-700 dark:text-blue-200 border-2 border-blue-300 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/60 rounded-full shadow-inner shrink-0 ring-4 ring-blue-500/10">
          {{ iniciales }}
        </div>
        <div class="flex-1 min-w-0 text-center sm:text-left">
          <h3 class="text-xl sm:text-2xl font-black leading-tight text-slate-950 dark:text-white">{{ info?.nombre_completo || 'No especificado' }}</h3>
          <div class="flex items-center justify-center sm:justify-start gap-2 mt-2">
            <AnimatedBadge variant="info" dot>
              Instrumentador Quirúrgico Registrado
            </AnimatedBadge>
          </div>
        </div>
        <div class="px-4 py-3 text-center border rounded-xl bg-slate-50 border-slate-300 sm:text-right dark:bg-slate-950/50 dark:border-slate-800 shadow-xs">
          <p class="text-[10px] font-black tracking-wider uppercase text-slate-700 dark:text-slate-300">Documento / DNI</p>
          <p class="mt-0.5 text-base font-black tracking-wide text-slate-950 dark:text-white font-mono">{{ info?.dni || 'No especificado' }}</p>
        </div>
      </div>
    </GlowCard>

    <!-- KPIs de Actividad Registrada -->
    <div>
      <h3 class="mb-3 text-sm sm:text-base font-black text-slate-950 dark:text-white flex items-center gap-2">
        <Activity class="w-4 h-4 text-blue-600 dark:text-blue-400" />
        Actividad registrada
      </h3>
      <div class="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
        <GlowCard class="p-4 sm:p-5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-2xl shadow-md" glow-color="rgba(37, 99, 235, 0.1)">
          <div class="flex items-start justify-between gap-2">
            <p class="text-[11px] font-black tracking-wider uppercase text-slate-800 dark:text-slate-200">Cirugías</p>
            <span class="flex items-center justify-center w-8 h-8 rounded-xl bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
              <FileSpreadsheet class="w-4 h-4" />
            </span>
          </div>
          <p class="mt-2 text-2xl sm:text-3xl font-black text-slate-950 dark:text-white">
            <SlidingNumber :value="stats.total || 0" />
          </p>
          <p class="text-[11px] text-slate-700 dark:text-slate-300 mt-0.5 font-bold">Acompañadas</p>
        </GlowCard>

        <GlowCard class="p-4 sm:p-5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-2xl shadow-md" glow-color="rgba(6, 182, 212, 0.1)">
          <div class="flex items-start justify-between gap-2">
            <p class="text-[11px] font-black tracking-wider uppercase text-slate-800 dark:text-slate-200">Médicos</p>
            <span class="flex items-center justify-center w-8 h-8 rounded-xl text-cyan-800 bg-cyan-100 dark:bg-cyan-950/50 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800">
              <UserCheck class="w-4 h-4" />
            </span>
          </div>
          <p v-if="stats.medicosDisponibles" class="mt-2 text-2xl sm:text-3xl font-black text-slate-950 dark:text-white">
            <SlidingNumber :value="stats.medicos || 0" />
          </p>
          <p v-else class="mt-2 text-xs font-black text-slate-600 dark:text-slate-400">Dato pendiente</p>
          <p class="text-[11px] text-slate-700 dark:text-slate-300 mt-0.5 font-bold">Cirujanos</p>
        </GlowCard>

        <GlowCard class="p-4 sm:p-5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-2xl shadow-md" glow-color="rgba(16, 185, 129, 0.1)">
          <div class="flex items-start justify-between gap-2">
            <p class="text-[11px] font-black tracking-wider uppercase text-slate-800 dark:text-slate-200">Procedimientos</p>
            <span class="flex items-center justify-center w-8 h-8 rounded-xl text-emerald-800 bg-emerald-100 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
              <Sparkles class="w-4 h-4" />
            </span>
          </div>
          <p class="mt-2 text-2xl sm:text-3xl font-black text-slate-950 dark:text-white">
            <SlidingNumber :value="stats.tiposCirugia || 0" />
          </p>
          <p class="text-[11px] text-slate-700 dark:text-slate-300 mt-0.5 font-bold">Especialidades</p>
        </GlowCard>

        <GlowCard class="p-4 sm:p-5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-2xl shadow-md" glow-color="rgba(245, 158, 11, 0.1)">
          <div class="flex items-start justify-between gap-2">
            <p class="text-[11px] font-black tracking-wider uppercase text-slate-800 dark:text-slate-200">Instituciones</p>
            <span class="flex items-center justify-center w-8 h-8 rounded-xl text-amber-800 bg-amber-100 dark:bg-amber-950/50 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
              <Building2 class="w-4 h-4" />
            </span>
          </div>
          <p v-if="stats.institucionesDisponibles" class="mt-2 text-2xl sm:text-3xl font-black text-slate-950 dark:text-white">
            <SlidingNumber :value="stats.instituciones || 0" />
          </p>
          <p v-else class="mt-2 text-xs font-black text-slate-600 dark:text-slate-400">Dato pendiente</p>
          <p class="text-[11px] text-slate-700 dark:text-slate-300 mt-0.5 font-bold">Sanatorios / Clínicas</p>
        </GlowCard>
      </div>
    </div>

    <!-- Top 5s de Cirugías -->
    <div class="grid grid-cols-1 gap-6 md:grid-cols-2">
      <!-- Top Tipos de Cirugía -->
      <GlowCard class="p-5 sm:p-6 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-2xl shadow-md" glow-color="rgba(37, 99, 235, 0.1)">
        <div class="flex items-center justify-between gap-3 mb-4">
          <h3 class="text-sm sm:text-base font-black text-slate-950 dark:text-white flex items-center gap-2">
            <Sparkles class="w-4 h-4 text-blue-600 dark:text-blue-400" />
            Cirugías por tipo
          </h3>
          <span class="text-xs font-bold text-slate-700 dark:text-slate-300">Más frecuentes</span>
        </div>
        <div v-if="stats.topTiposCirugia.length > 0" class="space-y-3">
          <div v-for="(item, index) in stats.topTiposCirugia" :key="index" class="p-3 text-xs sm:text-sm font-bold border rounded-xl bg-slate-50 border-slate-300 text-slate-800 dark:bg-slate-950/50 dark:border-slate-800 dark:text-slate-200">
            <div class="flex items-center justify-between gap-3">
              <span class="pr-2 truncate font-black text-slate-900 dark:text-white">{{ item.nombre }}</span>
              <span class="font-black text-slate-950 dark:text-white shrink-0">{{ item.count }}</span>
            </div>
            <div class="h-2 mt-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
              <div
                class="h-full rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 transition-all duration-500"
                :style="{ width: `${Math.round((item.count / stats.maxTipoCirugiaCount) * 100)}%` }"
              ></div>
            </div>
          </div>
          <p v-if="stats.tiposCirugiaRestantes > 0" class="pt-1 text-xs font-black text-slate-700 dark:text-slate-300 text-center">
            + {{ stats.tiposCirugiaRestantes }} tipos más registrados
          </p>
        </div>
        <div v-else class="p-6 text-xs text-center border rounded-xl text-slate-600 border-slate-300 bg-slate-50 dark:bg-slate-950/50 dark:border-slate-800 font-bold">
          Todavía no hay información suficiente para mostrar cirugías por tipo.
        </div>
      </GlowCard>

      <!-- Top Médicos -->
      <GlowCard class="p-5 sm:p-6 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-2xl shadow-md" glow-color="rgba(6, 182, 212, 0.1)">
        <div class="flex items-center justify-between gap-3 mb-4">
          <h3 class="text-sm sm:text-base font-black text-slate-950 dark:text-white flex items-center gap-2">
            <UserCheck class="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
            Cirugías por médico
          </h3>
          <span class="text-xs font-bold text-slate-700 dark:text-slate-300">Cirujanos</span>
        </div>
        <div v-if="stats.topMedicos.length > 0" class="space-y-3">
          <div v-for="(item, index) in stats.topMedicos" :key="index" class="flex items-center justify-between p-3 text-xs sm:text-sm font-bold border rounded-xl bg-slate-50 border-slate-300 text-slate-800 dark:bg-slate-950/50 dark:border-slate-800 dark:text-slate-200">
            <span class="pr-4 truncate font-black text-slate-900 dark:text-white">{{ item.nombre }}</span>
            <span class="font-black text-slate-950 dark:text-white shrink-0 text-xs px-2.5 py-1 rounded-lg bg-cyan-100 dark:bg-cyan-950/50 text-cyan-900 dark:text-cyan-200 border border-cyan-300 dark:border-cyan-800">
              {{ item.count }} {{ item.count === 1 ? 'cirugía' : 'cirugías' }}
            </span>
          </div>
        </div>
        <div v-else class="p-6 text-xs text-center border rounded-xl text-slate-600 border-slate-300 bg-slate-50 dark:bg-slate-950/50 dark:border-slate-800 font-bold">
          Todavía no hay información suficiente para mostrar médicos frecuentes.
        </div>
      </GlowCard>
    </div>

    <!-- Datos Registrados (Personal / Pago) -->
    <div class="grid grid-cols-1 gap-6 md:grid-cols-2">
      <!-- Personal Info -->
      <GlowCard class="p-5 sm:p-6 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-2xl shadow-md" glow-color="rgba(37, 99, 235, 0.08)">
        <div class="flex items-center justify-between gap-3 mb-4">
          <h3 class="text-sm sm:text-base font-black text-slate-950 dark:text-white flex items-center gap-2">
            <User class="w-4 h-4 text-blue-600 dark:text-blue-400" />
            Información personal
          </h3>
        </div>
        <div class="grid gap-3 sm:grid-cols-2 text-xs sm:text-sm">
          <div class="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/50 border border-slate-300 dark:border-slate-800">
            <p class="text-[10px] font-black tracking-wider uppercase text-slate-700 dark:text-slate-300">Nombre completo</p>
            <p class="mt-1 font-black text-slate-950 dark:text-white">{{ info?.nombre_completo || 'No especificado' }}</p>
          </div>
          <div class="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/50 border border-slate-300 dark:border-slate-800">
            <p class="text-[10px] font-black tracking-wider uppercase text-slate-700 dark:text-slate-300">DNI</p>
            <p class="mt-1 font-black font-mono text-slate-950 dark:text-white">{{ info?.dni || 'No especificado' }}</p>
          </div>
          <div class="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/50 border border-slate-300 dark:border-slate-800">
            <p class="text-[10px] font-black tracking-wider uppercase text-slate-700 dark:text-slate-300">CUIT / CUIL</p>
            <p class="mt-1 font-black font-mono text-slate-950 dark:text-white">{{ info?.cuil || 'No especificado' }}</p>
          </div>
          <div class="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/50 border border-slate-300 dark:border-slate-800">
            <p class="text-[10px] font-black tracking-wider uppercase text-slate-700 dark:text-slate-300">Lugar de trabajo</p>
            <p class="mt-1 font-black text-slate-950 dark:text-white">{{ info?.lugar_trabajo || 'No especificado' }}</p>
          </div>
        </div>
      </GlowCard>

      <!-- Payment Info -->
      <GlowCard class="p-5 sm:p-6 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-2xl shadow-md" glow-color="rgba(16, 185, 129, 0.08)">
        <div class="flex items-center justify-between gap-3 mb-4">
          <h3 class="text-sm sm:text-base font-black text-slate-950 dark:text-white flex items-center gap-2">
            <Landmark class="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            Información de cobro
          </h3>
        </div>
        <div class="grid gap-3 sm:grid-cols-2 text-xs sm:text-sm">
          <div class="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/50 border border-slate-300 dark:border-slate-800">
            <p class="text-[10px] font-black tracking-wider uppercase text-slate-700 dark:text-slate-300">Medio de pago</p>
            <p class="mt-1 font-black text-slate-950 dark:text-white">Transferencia bancaria</p>
          </div>
          <div class="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/50 border border-slate-300 dark:border-slate-800">
            <p class="text-[10px] font-black tracking-wider uppercase text-slate-700 dark:text-slate-300">Banco</p>
            <p class="mt-1 font-black text-slate-950 dark:text-white">{{ info?.banco || 'No especificado' }}</p>
          </div>
          <div class="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/50 border border-slate-300 dark:border-slate-800">
            <p class="text-[10px] font-black tracking-wider uppercase text-slate-700 dark:text-slate-300">Alias</p>
            <p class="mt-1 font-black font-mono text-slate-950 dark:text-white">{{ info?.alias_bancario || 'No especificado' }}</p>
          </div>
          <div class="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/50 border border-slate-300 dark:border-slate-800">
            <p class="text-[10px] font-black tracking-wider uppercase text-slate-700 dark:text-slate-300">CBU / CVU</p>
            <p class="mt-1 font-black font-mono break-all text-slate-950 dark:text-white">{{ info?.cbu || 'No especificado' }}</p>
          </div>
        </div>
      </GlowCard>
    </div>

    <!-- Botón de Actualización por WhatsApp -->
    <div class="flex justify-center pt-2 sm:justify-start">
      <a 
        :href="whatsappUrl" 
        target="_blank" 
        rel="noopener noreferrer" 
        class="inline-flex items-center justify-center gap-2 px-6 py-3 text-xs sm:text-sm font-black text-white transition-all duration-200 shadow-md bg-emerald-600 rounded-xl hover:bg-emerald-700 hover:scale-[1.02] active:scale-[0.98] focus:ring-2 focus:ring-emerald-500 focus:outline-none"
      >
        <MessageCircle class="w-4.5 h-4.5" />
        <span>Solicitar actualización de datos por WhatsApp</span>
      </a>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { 
  GlowCard, 
  SlidingNumber, 
  AnimatedBadge 
} from './ui';
import { 
  Activity, 
  FileSpreadsheet, 
  UserCheck, 
  Sparkles, 
  Building2, 
  User, 
  Landmark, 
  MessageCircle 
} from 'lucide-vue-next';

const props = defineProps({
  info: {
    type: Object,
    default: () => ({})
  },
  activity: {
    type: Array,
    default: () => []
  }
});

const emit = defineEmits(['openAccessHistory']);

// Calcula las iniciales para la foto de perfil vacía
const iniciales = computed(() => {
  if (!props.info?.nombre_completo) return '??';
  const parts = props.info.nombre_completo.trim().split(' ');
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return parts[0][0].toUpperCase();
});

// Evalúa la alerta ámbar superior
const datosCompletos = computed(() => {
  const i = props.info;
  if (!i) return false;
  return Boolean(
    i.nombre_completo && 
    i.dni && 
    i.cuil && 
    i.lugar_trabajo && 
    i.banco && 
    i.alias_bancario && 
    i.cbu
  );
});

const normalizeTipoForCompare = (value) => {
  if (!value) return '';
  return String(value)
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/(\d),(\d)/g, '$1.$2')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
    .replace(/\bOSTESINTESIS\b/g, 'OSTEOSINTESIS');
};

const normalizeTipoForDisplay = (value) => {
  const normalized = normalizeTipoForCompare(value);
  if (!normalized) return null;

  if (normalized.startsWith('OSTEOSINTESIS')) {
    return normalized
      .toLowerCase()
      .split(' ')
      .map((part, index) => {
        if (index === 0) return 'Osteosíntesis';
        if (/^\d+(\.\d+)?$/.test(part)) return part;
        return part.charAt(0).toUpperCase() + part.slice(1);
      })
      .join(' ');
  }

  return String(value)
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/(\d),(\d)/g, '$1.$2');
};

// Lógica para extraer estadísticas en frontend utilizando el historial ya cargado
const stats = computed(() => {
  const act = props.activity || [];
  const medicos = new Set();
  const instituciones = new Set();
  const tiposCirugia = new Set();

  const medicosCount = {};
  const tiposCirugiaCount = {};

  act.forEach(r => {
    // Fallbacks robustos para Nombre de Médico devuelto por RPCs Supabase (medico_nombre, medico, doctor, etc)
    const mRaw = r.medico_nombre || r.medico || r.doctor || r.medico_solicitante;
    const m = (mRaw && String(mRaw).trim() !== 'N/A' && String(mRaw).trim() !== 'null') ? String(mRaw).trim() : null;
    if (m) {
      medicos.add(m);
      medicosCount[m] = (medicosCount[m] || 0) + 1;
    }
    
    // Fallbacks robustos para Nombre de Institución (cliente_nombre, institucion, sanatorio, hospital)
    const instRaw = r.cliente_nombre || r.institucion || r.sanatorio || r.hospital;
    const inst = (instRaw && String(instRaw).trim() !== 'N/A' && String(instRaw).trim() !== 'null') ? String(instRaw).trim() : null;
    if (inst) {
      instituciones.add(inst);
    }

    // Fallback unificado: 'tipo_cirugia' (prioridad) o 'patologia' si aplica
    const tipo = r.tipo_cirugia ? r.tipo_cirugia.trim() : (r.patologia ? r.patologia.trim() : null);
    const tipoKey = normalizeTipoForCompare(tipo);
    const tipoNombre = normalizeTipoForDisplay(tipo);
    if (tipoKey && tipoNombre) {
      tiposCirugia.add(tipoKey);
      if (!tiposCirugiaCount[tipoKey]) {
        tiposCirugiaCount[tipoKey] = { nombre: tipoNombre, count: 0 };
      }
      tiposCirugiaCount[tipoKey].count += 1;
    }
  });

  // Top 5 Médicos
  const topMedicos = Object.entries(medicosCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([nombre, count]) => ({ nombre, count }));

  // Top 5 Tipos de Cirugía
  const tiposCirugiaOrdenados = Object.values(tiposCirugiaCount)
    .sort((a, b) => b.count - a.count);

  const topTiposCirugia = tiposCirugiaOrdenados
    .slice(0, 5)
    .map(({ nombre, count }) => ({ nombre, count }));

  return {
    total: act.length || 0,
    medicos: medicos.size || 0,
    instituciones: instituciones.size || 0,
    medicosDisponibles: medicos.size > 0,
    institucionesDisponibles: instituciones.size > 0,
    tiposCirugia: tiposCirugia.size || 0,
    tiposCirugiaRestantes: Math.max(tiposCirugiaOrdenados.length - topTiposCirugia.length, 0),
    maxTipoCirugiaCount: topTiposCirugia[0]?.count || 1,
    topMedicos,
    topTiposCirugia
  };
});

const whatsappUrl = computed(() => {
  const text = encodeURIComponent("Hola, necesito actualizar mis datos registrados en Gestión IQ.");
  // Se quitan los < > del return literal
  return `https://api.whatsapp.com/send?text=${text}`;
});
</script>
