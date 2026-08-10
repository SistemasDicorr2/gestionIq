<!-- src/components/MyDataSection.vue -->
<template>
  <div class="space-y-8">
    <!-- Header -->
    <div class="mb-6 lg:mb-8">
      <h2 class="text-2xl font-bold text-slate-950 dark:text-white">Mi Perfil</h2>
      <p class="max-w-3xl mt-2 text-slate-600 dark:text-slate-400">
        Resumen de tu información registrada y actividad con Districorr.
      </p>
    </div>

    <!-- Card Principal de Perfil -->
    <div>
      <div class="flex flex-col gap-5 p-5 transition-all duration-200 bg-white border shadow-2xs border-slate-200/80 sm:flex-row sm:items-center sm:p-6 rounded-2xl dark:bg-slate-900 dark:border-slate-800 hover:shadow-xs">
        <div class="flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 text-xl sm:text-2xl font-black text-blue-700 border-4 border-blue-50 bg-blue-100 rounded-full shadow-inner shrink-0 dark:bg-blue-900/50 dark:text-blue-200 dark:border-blue-950/70">
          {{ iniciales }}
        </div>
        <div class="flex-1 min-w-0 text-center sm:text-left">
          <h3 class="text-xl sm:text-2xl font-black leading-tight text-slate-950 dark:text-white">{{ info?.nombre_completo || 'No especificado' }}</h3>
          <span class="inline-flex items-center gap-1.5 px-3 py-0.5 mt-2 text-xs font-bold border rounded-full bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-900/70">
            <span class="w-1.5 h-1.5 rounded-full bg-blue-500 dark:bg-blue-300"></span>
            Instrumentador Quirúrgico Registrado
          </span>
        </div>
        <div class="px-4 py-2.5 text-center border rounded-xl bg-slate-50 border-slate-100 sm:text-right dark:bg-slate-950/50 dark:border-slate-800">
          <p class="text-[10px] font-bold tracking-wider uppercase text-slate-400 dark:text-slate-500">DNI</p>
          <p class="mt-0.5 text-base font-extrabold tracking-wide text-slate-950 dark:text-slate-100">{{ info?.dni || 'No especificado' }}</p>
        </div>
      </div>
    </div>

    <!-- KPIs de Actividad -->
    <div>
      <h3 class="mb-4 text-lg font-bold text-slate-950 dark:text-white">Actividad registrada</h3>
      <div class="grid grid-cols-2 gap-4 md:grid-cols-4 lg:gap-6">
        <div class="p-4 transition-all duration-200 bg-white border shadow-sm sm:p-5 border-slate-200 rounded-2xl dark:bg-slate-900 dark:border-slate-800 hover:shadow-md hover:-translate-y-0.5">
          <div class="flex items-start justify-between gap-3">
            <p class="text-xs font-bold tracking-wider uppercase text-slate-500 dark:text-slate-400">Cirugías acompañadas</p>
            <span class="flex items-center justify-center w-9 h-9 text-blue-600 rounded-xl bg-blue-50 dark:bg-blue-950/50 dark:text-blue-300">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M9 12h6m-6 4h6M9 8h6M6.75 3.75h10.5A2.25 2.25 0 0 1 19.5 6v12a2.25 2.25 0 0 1-2.25 2.25H6.75A2.25 2.25 0 0 1 4.5 18V6a2.25 2.25 0 0 1 2.25-2.25Z" /></svg>
            </span>
          </div>
          <p class="mt-3 text-3xl font-bold text-slate-950 dark:text-white">{{ stats.total || 0 }}</p>
        </div>
        <div class="p-4 transition-all duration-200 bg-white border shadow-sm sm:p-5 border-slate-200 rounded-2xl dark:bg-slate-900 dark:border-slate-800 hover:shadow-md hover:-translate-y-0.5">
          <div class="flex items-start justify-between gap-3">
            <p class="text-xs font-bold tracking-wider uppercase text-slate-500 dark:text-slate-400">Médicos</p>
            <span class="flex items-center justify-center w-9 h-9 rounded-xl text-cyan-700 bg-cyan-50 dark:bg-cyan-950/50 dark:text-cyan-300">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M15.75 6.75a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.5 20.25a7.5 7.5 0 0 1 15 0" /></svg>
            </span>
          </div>
          <p
            class="mt-3 font-bold text-slate-950 dark:text-white"
            :class="stats.medicosDisponibles ? 'text-3xl' : 'text-sm leading-snug'"
          >
            {{ stats.medicosDisponibles ? stats.medicos : 'Dato pendiente' }}
          </p>
        </div>
        <div class="p-4 transition-all duration-200 bg-white border shadow-sm sm:p-5 border-slate-200 rounded-2xl dark:bg-slate-900 dark:border-slate-800 hover:shadow-md hover:-translate-y-0.5">
          <div class="flex items-start justify-between gap-3">
            <p class="text-xs font-bold tracking-wider uppercase text-slate-500 dark:text-slate-400">Tipos de cirugía</p>
            <span class="flex items-center justify-center w-9 h-9 rounded-xl text-emerald-700 bg-emerald-50 dark:bg-emerald-950/50 dark:text-emerald-300">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M6.75 6.75h.008v.008H6.75V6.75Zm0 5.25h.008v.008H6.75V12Zm0 5.25h.008v.008H6.75v-.008ZM10.5 6.75h6.75M10.5 12h6.75m-6.75 5.25h6.75" /></svg>
            </span>
          </div>
          <p class="mt-3 text-3xl font-bold text-slate-950 dark:text-white">{{ stats.tiposCirugia || 0 }}</p>
        </div>
        <div class="p-4 transition-all duration-200 bg-white border shadow-sm sm:p-5 border-slate-200 rounded-2xl dark:bg-slate-900 dark:border-slate-800 hover:shadow-md hover:-translate-y-0.5">
          <div class="flex items-start justify-between gap-3">
            <p class="text-xs font-bold tracking-wider uppercase text-slate-500 dark:text-slate-400">Instituciones</p>
            <span class="flex items-center justify-center w-9 h-9 rounded-xl text-amber-700 bg-amber-50 dark:bg-amber-950/50 dark:text-amber-300">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M3.75 21h16.5M5.25 21V8.25L12 3l6.75 5.25V21M9 21v-6h6v6" /></svg>
            </span>
          </div>
          <p
            class="mt-3 font-bold text-slate-950 dark:text-white"
            :class="stats.institucionesDisponibles ? 'text-3xl' : 'text-sm leading-snug'"
          >
            {{ stats.institucionesDisponibles ? stats.instituciones : 'Dato pendiente' }}
          </p>
        </div>
      </div>
    </div>

    <!-- Top 5s -->
    <div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:gap-8">
      <!-- Top Tipos de Cirugía -->
      <div class="p-5 transition-all duration-200 bg-white border shadow-sm sm:p-6 border-slate-200 rounded-2xl dark:bg-slate-900 dark:border-slate-800 hover:shadow-md">
        <div class="flex items-center justify-between gap-3 mb-5">
          <h3 class="text-lg font-bold text-slate-950 dark:text-white">Cirugías por tipo</h3>
          <span class="w-10 h-1 rounded-full bg-blue-500/70 dark:bg-blue-400/70"></span>
        </div>
        <div v-if="stats.topTiposCirugia.length > 0" class="space-y-3">
          <div v-for="(item, index) in stats.topTiposCirugia" :key="index" class="p-3 text-sm font-medium border shadow-sm rounded-xl bg-slate-50 border-slate-100 text-slate-700 dark:bg-slate-950/50 dark:border-slate-800 dark:text-slate-300">
            <div class="flex items-center justify-between gap-3">
              <span class="pr-2 truncate">{{ item.nombre }}</span>
              <span class="font-bold text-slate-950 dark:text-white">{{ item.count }}</span>
            </div>
            <div class="h-1.5 mt-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
              <div
                class="h-full rounded-full bg-blue-500/70 dark:bg-blue-400/70"
                :style="{ width: `${Math.round((item.count / stats.maxTipoCirugiaCount) * 100)}%` }"
              ></div>
            </div>
          </div>
          <p v-if="stats.tiposCirugiaRestantes > 0" class="pt-1 text-xs font-semibold text-slate-500 dark:text-slate-400">
            + {{ stats.tiposCirugiaRestantes }} tipos más
          </p>
        </div>
        <div v-else class="p-4 text-sm text-center border rounded-xl text-slate-500 border-slate-100 bg-slate-50 dark:bg-slate-950/50 dark:border-slate-800 dark:text-slate-400">
          Todavía no hay información suficiente para mostrar cirugías por tipo.
        </div>
      </div>

      <!-- Top Médicos -->
      <div class="p-5 transition-all duration-200 bg-white border shadow-sm sm:p-6 border-slate-200 rounded-2xl dark:bg-slate-900 dark:border-slate-800 hover:shadow-md">
        <div class="flex items-center justify-between gap-3 mb-5">
          <h3 class="text-lg font-bold text-slate-950 dark:text-white">Cirugías por médico</h3>
          <span class="w-10 h-1 rounded-full bg-cyan-500/70 dark:bg-cyan-400/70"></span>
        </div>
        <div v-if="stats.topMedicos.length > 0" class="space-y-3">
          <div v-for="(item, index) in stats.topMedicos" :key="index" class="flex items-center justify-between p-3 text-sm font-medium border shadow-sm rounded-xl bg-slate-50 border-slate-100 text-slate-700 dark:bg-slate-950/50 dark:border-slate-800 dark:text-slate-300">
            <span class="pr-4 truncate">{{ item.nombre }}</span>
            <span class="font-bold text-slate-950 dark:text-white">{{ item.count }} {{ item.count === 1 ? 'cirugía' : 'cirugías' }}</span>
          </div>
        </div>
        <div v-else class="p-4 text-sm text-center border rounded-xl text-slate-500 border-slate-100 bg-slate-50 dark:bg-slate-950/50 dark:border-slate-800 dark:text-slate-400">
          Todavía no hay información suficiente para mostrar médicos frecuentes.
        </div>
      </div>
    </div>

    <!-- Datos Registrados (Personal / Pago) -->
    <div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:gap-8">
      <!-- Personal Info -->
      <div class="p-5 transition-all duration-200 bg-white border shadow-sm sm:p-6 border-slate-200 rounded-2xl dark:bg-slate-900 dark:border-slate-800 hover:shadow-md">
        <div class="flex items-center justify-between gap-3 mb-5">
          <h3 class="text-lg font-bold text-slate-950 dark:text-white">Información personal</h3>
          <span class="w-8 h-1 rounded-full bg-slate-300 dark:bg-slate-700"></span>
        </div>
        <div class="grid gap-3 sm:grid-cols-2">
          <div class="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/50">
            <p class="text-xs font-bold tracking-wider uppercase text-slate-500 dark:text-slate-400">Nombre completo</p>
            <p class="mt-1 font-medium text-slate-900 dark:text-slate-200">{{ info?.nombre_completo || 'No especificado' }}</p>
          </div>
          <div class="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/50">
            <p class="text-xs font-bold tracking-wider uppercase text-slate-500 dark:text-slate-400">DNI</p>
            <p class="mt-1 font-medium text-slate-900 dark:text-slate-200">{{ info?.dni || 'No especificado' }}</p>
          </div>
          <div class="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/50">
            <p class="text-xs font-bold tracking-wider uppercase text-slate-500 dark:text-slate-400">CUIT / CUIL</p>
            <p class="mt-1 font-medium text-slate-900 dark:text-slate-200">{{ info?.cuil || 'No especificado' }}</p>
          </div>
          <div class="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/50">
            <p class="text-xs font-bold tracking-wider uppercase text-slate-500 dark:text-slate-400">Lugar de trabajo</p>
            <p class="mt-1 font-medium text-slate-900 dark:text-slate-200">{{ info?.lugar_trabajo || 'No especificado' }}</p>
          </div>
        </div>
      </div>

      <!-- Payment Info -->
      <div class="p-5 transition-all duration-200 bg-white border shadow-sm sm:p-6 border-slate-200 rounded-2xl dark:bg-slate-900 dark:border-slate-800 hover:shadow-md">
        <div class="flex items-center justify-between gap-3 mb-5">
          <h3 class="text-lg font-bold text-slate-950 dark:text-white">Información de pago</h3>
          <span class="w-8 h-1 rounded-full bg-slate-300 dark:bg-slate-700"></span>
        </div>
        <div class="grid gap-3 sm:grid-cols-2">
          <div class="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/50">
            <p class="text-xs font-bold tracking-wider uppercase text-slate-500 dark:text-slate-400">Medio de pago</p>
            <p class="mt-1 font-medium text-slate-900 dark:text-slate-200">Transferencia bancaria</p>
          </div>
          <div class="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/50">
            <p class="text-xs font-bold tracking-wider uppercase text-slate-500 dark:text-slate-400">Banco</p>
            <p class="mt-1 font-medium text-slate-900 dark:text-slate-200">{{ info?.banco || 'No especificado' }}</p>
          </div>
          <div class="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/50">
            <p class="text-xs font-bold tracking-wider uppercase text-slate-500 dark:text-slate-400">Alias</p>
            <p class="mt-1 font-medium text-slate-900 dark:text-slate-200">{{ info?.alias_bancario || 'No especificado' }}</p>
          </div>
          <div class="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/50">
            <p class="text-xs font-bold tracking-wider uppercase text-slate-500 dark:text-slate-400">CBU</p>
            <p class="mt-1 font-medium break-all text-slate-900 dark:text-slate-200">{{ info?.cbu || 'No especificado' }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Action Button -->
    <div class="flex justify-center pt-1 sm:justify-start">
      <a :href="whatsappUrl" target="_blank" rel="noopener noreferrer" class="inline-flex items-center justify-center w-full px-6 py-3 text-sm font-bold text-white transition-all duration-200 shadow-sm sm:w-auto bg-emerald-600 rounded-xl hover:bg-emerald-700 hover:-translate-y-0.5 focus:ring-2 focus:ring-emerald-500 focus:outline-none focus:ring-offset-2 dark:focus:ring-offset-slate-900 hover:shadow-md">
        <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347zM12 22a9.96 9.96 0 01-5.093-1.39l-.365-.216-3.784.992 1.008-3.69-.237-.377A9.957 9.957 0 012 12c0-5.514 4.486-10 10-10s10 4.486 10 10-4.486 10-10 10zm0-18.172C6.41 3.828 1.828 8.41 1.828 14c0 1.776.467 3.51 1.353 5.04l-1.606 5.88 5.992-1.573c1.469.814 3.125 1.244 4.833 1.244 6.59 0 11.172-4.582 11.172-10.172 0-5.59-4.582-10.172-10.172-10.172z"/></svg>
        Solicitar actualización por WhatsApp
      </a>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

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
