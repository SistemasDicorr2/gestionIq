<!-- src/views/logistica/LogisticaInformesView.vue -->
<template>
  <div class="max-w-4xl mx-auto space-y-5 text-slate-800 dark:text-slate-100 font-sans pb-16 px-3 sm:px-0">
    
    <!-- Top Welcome Banner Mobile-First -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
      <div class="space-y-0.5">
        <h2 class="text-base sm:text-lg font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
          <span>Hola, {{ userName }}</span>
        </h2>
        <p class="text-xs text-slate-500 dark:text-slate-400 capitalize">
          {{ formattedToday }}
        </p>
      </div>

      <div class="self-start sm:self-auto flex items-center gap-2">
        <div v-if="isAdmin" class="flex items-center gap-2">
          <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-purple-50 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300 border border-purple-200/80 dark:border-purple-900/60 shadow-2xs">
            <span class="h-2 w-2 rounded-full bg-purple-500 animate-pulse"></span>
            Supervisión Admin
          </span>

          <select 
            v-model="adminScope" 
            @change="fetchDashboardData" 
            class="px-2.5 py-1 text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none cursor-pointer"
          >
            <option value="all">🌐 Todos los Operarios</option>
            <option value="mine">👤 Solo mis Informes</option>
          </select>
        </div>

        <span 
          v-else
          class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 border border-blue-200/80 dark:border-blue-900/60 shadow-2xs"
        >
          <span class="h-2 w-2 rounded-full bg-blue-500 animate-pulse"></span>
          Mis Informes | 📍 {{ userZona }}
        </span>
      </div>
    </div>

    <!-- MODO OPERADOR LOGÍSTICA / VISTA PERSONAL (SUPERFICIE PRINCIPAL OPERATIVA) -->
    <template v-if="!isAdmin || adminScope === 'mine'">
      
      <!-- CARDS DE BORRADORES ACTIVOS PENDIENTES DEL OPERADOR -->
      <div v-if="activeOperatorDrafts.length > 0" class="bg-amber-50/70 dark:bg-amber-950/30 rounded-2xl border border-amber-300/80 dark:border-amber-800/80 p-4 sm:p-5 shadow-xs space-y-3.5 animate-fadeIn">
        <div class="flex items-center justify-between border-b border-amber-200/60 dark:border-amber-800/60 pb-2.5">
          <div class="flex items-center gap-2">
            <span class="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-amber-500 text-white">
              Borradores Pendientes
            </span>
            <h3 class="text-xs font-extrabold text-amber-950 dark:text-amber-200">
              Tienes {{ activeOperatorDrafts.length }} {{ activeOperatorDrafts.length === 1 ? 'borrador guardado' : 'borradores guardados' }}
            </h3>
          </div>

          <router-link 
            :to="{ name: 'LogisticaNuevoInforme', query: { mode: 'new' } }"
            class="text-xs font-extrabold text-amber-900 dark:text-amber-300 hover:underline"
          >
            + Crear Informe Nuevo
          </router-link>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <div 
            v-for="draft in activeOperatorDrafts" 
            :key="draft.id"
            class="p-3.5 bg-white dark:bg-slate-900 rounded-xl border border-amber-200 dark:border-amber-900/60 space-y-2 flex flex-col justify-between"
          >
            <div class="flex items-center justify-between">
              <span class="text-xs font-extrabold text-slate-900 dark:text-white">
                Informe del {{ formatDate(draft.fecha) }}
              </span>
              <span class="px-2 py-0.5 text-[9px] font-black uppercase bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 rounded-full border border-amber-300 dark:border-amber-800">
                📝 Borrador
              </span>
            </div>

            <div class="text-[11px] text-slate-500 dark:text-slate-400 space-y-1">
              <div class="flex items-center gap-2">
                <span>📍 Zona: <strong>{{ draft.zona || 'Formosa' }}</strong></span>
                <span class="text-slate-400">• Guardado: {{ formatDateTime(draft.updated_at || draft.created_at) }}</span>
              </div>
              <div v-if="draft.observacion_general" class="italic truncate text-slate-600 dark:text-slate-300">
                "{{ draft.observacion_general }}"
              </div>
            </div>

            <!-- Resumen de Borrador con Iconos -->
            <div class="flex flex-wrap items-center gap-1.5 text-[10px] font-mono font-bold pt-1">
              <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/60 text-amber-900 dark:text-amber-200 border border-amber-200/80 dark:border-amber-900/60">
                <Layers class="w-3 h-3 text-amber-600" />
                <span>{{ draft.movimientos?.length || 0 }} mov</span>
              </span>

              <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                <AnimatedPackageIcon customClass="w-3 h-3 text-slate-500" />
                <span>{{ getCajasTotal(draft) }} cajas</span>
              </span>

              <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                <AnimatedBoxIcon customClass="w-3 h-3 text-slate-500" />
                <span>{{ getBultosTotal(draft) }} bultos</span>
              </span>

              <span 
                v-if="getPendientesTotal(draft) > 0" 
                class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-rose-50 text-rose-800 border border-rose-200"
              >
                <AlertTriangle class="w-3 h-3 text-rose-600" />
                <span>{{ getPendientesTotal(draft) }} pend</span>
              </span>
            </div>

            <div class="pt-1 flex items-center justify-between gap-2 border-t border-slate-100 dark:border-slate-800">
              <button 
                type="button" 
                @click="deleteDraft(draft.id)" 
                class="px-2.5 py-1.5 text-[11px] font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-lg transition-colors cursor-pointer"
              >
                Descartar
              </button>

              <router-link 
                :to="{ name: 'LogisticaNuevoInforme', query: { id: draft.id } }"
                class="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-xs rounded-xl shadow-2xs transition-all flex items-center gap-1 active:scale-95 cursor-pointer"
              >
                <span>Continuar Editando</span>
              </router-link>
            </div>
          </div>
        </div>
      </div>

      <!-- Main Today's Control Card -->
      <div class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-4 sm:p-5 shadow-xs space-y-4">
        
        <div class="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div class="space-y-0.5">
            <h3 class="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Estado de tu Jornada de Hoy
            </h3>
            <span class="text-xs font-mono font-bold text-slate-800 dark:text-slate-200 block">
              {{ todayISO }}
            </span>
          </div>

          <span 
            v-if="todayInforme"
            :class="[
              'px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wide border shadow-2xs',
              todayInforme.estado === 'borrador' ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-900' :
              todayInforme.estado === 'enviado' ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900' :
              'bg-slate-100 text-slate-700 border-slate-200'
            ]"
          >
            {{ todayInforme.estado === 'borrador' ? '📝 Borrador Activo' : todayInforme.estado === 'enviado' ? '✓ Enviado' : todayInforme.estado }}
          </span>
          <span v-else class="px-3 py-1 rounded-full text-xs font-extrabold text-slate-500 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            Pendiente de Registro
          </span>
        </div>

        <!-- KPI Summary Grid Mobile-First -->
        <div v-if="todayInforme" class="grid grid-cols-3 gap-2.5 text-center">
          <div class="p-3 bg-slate-50/80 dark:bg-slate-800/50 rounded-xl border border-slate-200/60 dark:border-slate-800">
            <span class="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">Movimientos</span>
            <span class="text-base sm:text-lg font-black font-mono text-slate-900 dark:text-white">{{ todayMovimientosCount }}</span>
          </div>

          <div class="p-3 bg-slate-50/80 dark:bg-slate-800/50 rounded-xl border border-slate-200/60 dark:border-slate-800">
            <span class="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">Cajas</span>
            <span class="text-base sm:text-lg font-black font-mono text-slate-900 dark:text-white">{{ todayCajasCount }}</span>
          </div>

          <div class="p-3 bg-amber-50/60 dark:bg-amber-950/30 rounded-xl border border-amber-200/60 dark:border-amber-900/40">
            <span class="text-[10px] text-amber-700 dark:text-amber-400 font-extrabold uppercase tracking-wider block">Pendientes</span>
            <span class="text-base sm:text-lg font-black font-mono text-amber-900 dark:text-amber-300">{{ todayPendientesCount }}</span>
          </div>
        </div>

        <!-- Descriptive Banner -->
        <div v-if="!todayInforme && activeOperatorDrafts.length === 0" class="p-4 bg-blue-50/60 dark:bg-blue-950/30 rounded-xl border border-blue-100 dark:border-blue-900/40 text-xs text-blue-950 dark:text-blue-300 space-y-1">
          <strong class="font-extrabold text-sm block text-blue-900 dark:text-blue-200">Comienza tu registro diario de logística</strong>
          <p class="text-[11px] text-blue-800/80 dark:text-blue-300/80 leading-relaxed">
            Inicia un nuevo informe diario para ir registrando entregas, retiros de cajas e incidencias a medida que transcurre tu jornada.
          </p>
        </div>

        <!-- Main Action Buttons Touch-Optimized -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
          <router-link 
            v-if="todayInforme && todayInforme.estado === 'borrador'"
            :to="{ name: 'LogisticaNuevoInforme', query: { id: todayInforme.id } }"
            class="py-3.5 px-4 bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-xs rounded-xl shadow-xs flex items-center justify-center gap-2 transition-all active:scale-98 min-h-[44px]"
          >
            <span>Continuar Editando Borrador de Hoy</span>
          </router-link>

          <template v-else-if="todayInforme && todayInforme.estado === 'enviado'">
            <router-link 
              :to="{ name: 'LogisticaDetalleInforme', params: { id: todayInforme.id } }" 
              class="py-3.5 px-4 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-white font-extrabold text-xs rounded-xl flex items-center justify-center gap-2 transition-all min-h-[44px]"
            >
              <span>Ver Informe Enviado de Hoy</span>
            </router-link>

            <button 
              type="button" 
              @click="reabrirTodayInforme"
              class="py-3.5 px-4 bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs rounded-xl shadow-xs flex items-center justify-center gap-2 transition-all active:scale-98 min-h-[44px] cursor-pointer"
            >
              <span>🔓 Reabrir y Agregar Movimientos</span>
            </button>
          </template>

          <router-link 
            v-if="!todayInforme"
            :to="{ name: 'LogisticaNuevoInforme', query: { mode: 'new' } }"
            class="py-3.5 px-4 bg-blue-600 hover:bg-blue-700 text-white sm:col-span-2 font-extrabold text-xs rounded-xl shadow-xs flex items-center justify-center gap-2 transition-all active:scale-98 min-h-[44px]"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4"/></svg>
            <span>Crear Informe Diario Nuevo</span>
          </router-link>
        </div>
      </div>
    </template>

    <!-- MODO ADMINISTRACIÓN / SUPERVISIÓN GENERAL -->
    <template v-else>
      <div class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-4 sm:p-5 shadow-xs space-y-4">
        <div class="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div class="space-y-0.5">
            <h3 class="text-xs font-black uppercase tracking-wider text-slate-400">
              Resumen Operativo — {{ todayISO }}
            </h3>
            <span class="text-xs font-bold text-slate-800 dark:text-slate-200">
              Supervisión de Informes de Logística
            </span>
          </div>

          <span class="px-3 py-1 rounded-full text-xs font-extrabold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
            {{ todayInformesList.length }} {{ todayInformesList.length === 1 ? 'Informe' : 'Informes' }} Hoy
          </span>
        </div>

        <!-- KPI Summary Grid Admin -->
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center">
          <div class="p-3 bg-slate-50/80 dark:bg-slate-800/50 rounded-xl border border-slate-200/60 dark:border-slate-800">
            <span class="text-[10px] text-slate-400 font-extrabold uppercase block">Informes Hoy</span>
            <span class="text-base font-black font-mono text-slate-900 dark:text-white">{{ todayInformesList.length }}</span>
          </div>

          <div class="p-3 bg-slate-50/80 dark:bg-slate-800/50 rounded-xl border border-slate-200/60 dark:border-slate-800">
            <span class="text-[10px] text-slate-400 font-extrabold uppercase block">Total Movimientos</span>
            <span class="text-base font-black font-mono text-slate-900 dark:text-white">{{ todayMovimientosCount }}</span>
          </div>

          <div class="p-3 bg-slate-50/80 dark:bg-slate-800/50 rounded-xl border border-slate-200/60 dark:border-slate-800">
            <span class="text-[10px] text-slate-400 font-extrabold uppercase block">Cajas Movilizadas</span>
            <span class="text-base font-black font-mono text-slate-900 dark:text-white">{{ todayCajasCount }}</span>
          </div>

          <div class="p-3 bg-amber-50/60 dark:bg-amber-950/30 rounded-xl border border-amber-200/60 dark:border-amber-900/40">
            <span class="text-[10px] text-amber-700 dark:text-amber-400 font-extrabold uppercase block">Pendientes</span>
            <span class="text-base font-black font-mono text-amber-900 dark:text-amber-300">{{ todayPendientesCount }}</span>
          </div>
        </div>

        <!-- Lista de Informes de Hoy -->
        <div class="space-y-3 pt-1">
          <h4 class="text-xs font-black uppercase tracking-wider text-slate-400">
            Informes de la Jornada ({{ todayInformesList.length }})
          </h4>

          <div v-if="todayInformesList.length === 0" class="p-5 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200/80 dark:border-slate-800 text-xs text-slate-500 text-center space-y-2">
            <p>Aún no se han registrado informes de logística para la jornada de hoy ({{ todayISO }}).</p>
            <p class="text-[11px] text-slate-400">
              Los envíos y controles anteriores se encuentran resguardados en la sección <router-link :to="{ name: 'LogisticaGuiaEnvio' }" class="text-blue-600 dark:text-blue-400 font-bold hover:underline">Guía Envío</router-link>.
            </p>
          </div>

          <div v-else class="space-y-2.5">
            <div 
              v-for="inf in todayInformesList" 
              :key="inf.id"
              class="p-3.5 sm:p-4 bg-slate-50/70 dark:bg-slate-800/40 rounded-xl border border-slate-200/80 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
            >
              <div class="space-y-2 flex-1 min-w-0">
                <div class="flex flex-wrap items-center gap-2">
                  <div class="flex items-center gap-1.5 font-bold text-xs text-slate-900 dark:text-white">
                    <AnimatedCalendarIcon customClass="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                    <span>Operador: {{ inf.responsable_nombre }}</span>
                  </div>

                  <span class="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                    📍 {{ inf.zona || 'Formosa' }}
                  </span>

                  <span v-if="inf.enviado_at" class="text-[11px] text-slate-400 font-normal">
                    • Enviado: {{ formatTime(inf.enviado_at) }}
                  </span>
                  <span v-else class="text-[11px] text-amber-600 dark:text-amber-400 font-bold">
                    • Borrador activo
                  </span>
                </div>

                <!-- Resumen con Iconos -->
                <div class="flex flex-wrap items-center gap-1.5 text-[11px] font-mono font-bold">
                  <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/60 text-blue-900 dark:text-blue-200 border border-blue-200/80 dark:border-blue-900/60">
                    <Layers class="w-3 h-3 text-blue-600" />
                    <span>{{ inf.movimientos?.length || 0 }} mov</span>
                  </span>

                  <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-700/60 text-slate-800 dark:text-slate-200 border border-slate-200/80 dark:border-slate-700">
                    <AnimatedPackageIcon customClass="w-3 h-3 text-slate-600 dark:text-slate-400" />
                    <span>{{ getCajasTotal(inf) }} cajas</span>
                  </span>

                  <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-700/60 text-slate-800 dark:text-slate-200 border border-slate-200/80 dark:border-slate-700">
                    <AnimatedBoxIcon customClass="w-3 h-3 text-slate-600 dark:text-slate-400" />
                    <span>{{ getBultosTotal(inf) }} bultos</span>
                  </span>

                  <span 
                    v-if="getPendientesTotal(inf) > 0" 
                    class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/60 text-amber-900 dark:text-amber-200 border border-amber-200/80 dark:border-amber-900/60 font-sans"
                  >
                    <AlertTriangle class="w-3 h-3 text-amber-600" />
                    <span>{{ getPendientesTotal(inf) }} pendiente(s)</span>
                  </span>

                  <span v-if="inf.observacion_general" class="text-[11px] text-slate-500 italic truncate max-w-xs font-sans font-normal">
                    💬 "{{ inf.observacion_general }}"
                  </span>
                </div>
              </div>

              <div class="flex items-center gap-2 self-end sm:self-center shrink-0">
                <AnimatedBadge 
                  v-if="inf.estado === 'borrador'" 
                  variant="warning" 
                  size="xs" 
                  ping
                >
                  📝 Borrador
                </AnimatedBadge>

                <AnimatedBadge 
                  v-else-if="inf.estado === 'enviado'" 
                  variant="success" 
                  size="xs" 
                  dot
                >
                  ✓ Enviado
                </AnimatedBadge>

                <AnimatedBadge v-else variant="info" size="xs">
                  {{ inf.estado }}
                </AnimatedBadge>

                <router-link 
                  v-if="inf.estado === 'enviado'"
                  :to="{ name: 'LogisticaDetalleInforme', params: { id: inf.id } }"
                  class="px-3 py-1.5 bg-brand-navy hover:bg-brand-navy-light text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1 active:scale-95"
                >
                  <span>Ver Detalle</span>
                </router-link>

                <router-link 
                  v-else
                  :to="{ name: 'LogisticaNuevoInforme', query: { id: inf.id } }"
                  class="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1 active:scale-95"
                >
                  <span>Ver Borrador</span>
                </router-link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- Recent Reports Section -->
    <div class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-4 sm:p-5 shadow-xs space-y-4">
      <div class="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
        <div class="flex items-center gap-2">
          <div class="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <AnimatedHistoryIcon customClass="w-4 h-4" />
          </div>
          <h3 class="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
            {{ (isAdmin && adminScope === 'all') ? 'Últimos Informes Enviados (Todos)' : 'Historial Reciente de Mis Envíos' }}
          </h3>
        </div>

        <router-link :to="{ name: 'LogisticaHistorial' }" class="text-xs font-extrabold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center gap-1 group">
          <span>Historial Completo</span>
          <AnimatedArrowRightIcon customClass="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </router-link>
      </div>

      <div v-if="loading" class="py-8 text-center text-xs text-slate-400">
        Cargando historial reciente...
      </div>

      <div v-else-if="recentInformes.length === 0" class="py-8 px-4 text-center text-xs text-slate-500 space-y-2">
        <p>No se registran informes diarios de jornadas enviados previamente.</p>
        <p class="text-[11px] text-slate-400">
          Las guías de envío y controles de cirugías anteriores continúan disponibles en <router-link :to="{ name: 'LogisticaGuiaEnvio' }" class="text-blue-600 dark:text-blue-400 font-bold hover:underline">Guía Envío</router-link>.
        </p>
      </div>

      <div v-else class="space-y-2.5">
        <router-link 
          v-for="inf in recentInformes" 
          :key="inf.id"
          :to="{ name: 'LogisticaDetalleInforme', params: { id: inf.id } }"
          class="p-3.5 sm:p-4 bg-slate-50/70 dark:bg-slate-800/40 hover:bg-slate-100/90 dark:hover:bg-slate-800/80 rounded-xl border border-slate-200/70 dark:border-slate-700/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all duration-200 group hover:shadow-xs hover:border-blue-300 dark:hover:border-blue-800"
        >
          <div class="space-y-2 flex-1 min-w-0">
            <!-- Título y Metadatos -->
            <div class="flex flex-wrap items-center gap-2">
              <div class="flex items-center gap-1.5 font-bold text-xs text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                <AnimatedCalendarIcon customClass="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                <span>Informe del {{ formatDate(inf.fecha) }}</span>
              </div>

              <span v-if="isAdmin && adminScope === 'all'" class="text-[11px] font-bold text-slate-600 dark:text-slate-300 bg-slate-200/70 dark:bg-slate-700/60 px-2 py-0.5 rounded-md truncate max-w-[160px]">
                👤 {{ inf.responsable_nombre }}
              </span>

              <span v-if="inf.zona" class="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                📍 {{ inf.zona }}
              </span>

              <span v-if="inf.enviado_at" class="text-[11px] text-slate-400 font-normal">
                • {{ formatTime(inf.enviado_at) }}
              </span>
            </div>

            <!-- Chips de Resumen Operativo con Iconos Animados -->
            <div class="flex flex-wrap items-center gap-1.5 text-[11px] font-mono font-bold">
              <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/60 text-blue-900 dark:text-blue-200 border border-blue-200/80 dark:border-blue-900/60">
                <Layers class="w-3 h-3 text-blue-600" />
                <span>{{ inf.movimientos?.length || 0 }} mov</span>
              </span>

              <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-700/60 text-slate-800 dark:text-slate-200 border border-slate-200/80 dark:border-slate-700">
                <AnimatedPackageIcon customClass="w-3 h-3 text-slate-600 dark:text-slate-400" />
                <span>{{ getCajasTotal(inf) }} cajas</span>
              </span>

              <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-700/60 text-slate-800 dark:text-slate-200 border border-slate-200/80 dark:border-slate-700">
                <AnimatedBoxIcon customClass="w-3 h-3 text-slate-600 dark:text-slate-400" />
                <span>{{ getBultosTotal(inf) }} bultos</span>
              </span>

              <span 
                v-if="getPendientesTotal(inf) > 0" 
                class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/60 text-amber-900 dark:text-amber-200 border border-amber-200/80 dark:border-amber-900/60 font-sans"
              >
                <AlertTriangle class="w-3 h-3 text-amber-600" />
                <span>{{ getPendientesTotal(inf) }} pendiente(s)</span>
              </span>
            </div>
          </div>

          <!-- Badge de Estado y Flecha -->
          <div class="flex items-center gap-2 shrink-0 self-end sm:self-center">
            <AnimatedBadge variant="success" size="xs" dot>
              ✓ Enviado
            </AnimatedBadge>
            <div class="w-7 h-7 rounded-lg bg-white dark:bg-slate-700/60 border border-slate-200/80 dark:border-slate-700 flex items-center justify-center text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 group-hover:border-blue-300 transition-colors">
              <AnimatedArrowRightIcon customClass="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { supabase } from '../../services/supabase';
import { useToast } from 'vue-toastification';
import { Layers, AlertTriangle } from 'lucide-vue-next';
import { 
  AnimatedBadge,
  AnimatedHistoryIcon,
  AnimatedCalendarIcon,
  AnimatedPackageIcon,
  AnimatedBoxIcon,
  AnimatedArrowRightIcon
} from '../../components/ui';

const router = useRouter();
const toast = useToast();
const userName = ref('Usuario Logística');
const userRole = ref('logistica');
const userZona = ref('Formosa');
const adminScope = ref('all'); // 'all' | 'mine'
const loading = ref(true);

const todayISO = new Date().toISOString().split('T')[0];

const isAdmin = computed(() => userRole.value === 'admin');

const formattedToday = computed(() => {
  return new Date().toLocaleDateString('es-AR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
});

const todayInforme = ref(null);
const todayInformesList = ref([]);
const activeOperatorDrafts = ref([]);
const todayMovimientos = ref([]);
const recentInformes = ref([]);

const todayMovimientosCount = computed(() => todayMovimientos.value.length);
const todayCajasCount = computed(() => todayMovimientos.value.reduce((sum, m) => sum + (m.cantidad_cajas || 0), 0));
const todayPendientesCount = computed(() => todayMovimientos.value.filter(m => m.tiene_pendiente).length);

const fetchDashboardData = async () => {
  try {
    loading.value = true;
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return;

    userName.value = session.user.user_metadata?.nombre_completo 
      || session.user.user_metadata?.nombre 
      || session.user.email?.split('@')[0] 
      || 'Usuario Logística';

    userZona.value = session.user.user_metadata?.zona || 'Formosa';

    userRole.value = session.user.app_metadata?.role || session.user.user_metadata?.role || 'logistica';

    if (isAdmin.value && adminScope.value === 'all') {
      // MODO ADMIN: ver informes de hoy de todos los operadores
      const { data: infsToday } = await supabase
        .from('logistica_informes_diarios')
        .select('*, movimientos:logistica_informe_movimientos(id, cantidad_cajas, cantidad_bultos, tiene_pendiente)')
        .eq('fecha', todayISO)
        .order('created_at', { ascending: false });

      todayInformesList.value = infsToday || [];

      if (todayInformesList.value.length > 0) {
        const ids = todayInformesList.value.map(i => i.id);
        const { data: movs } = await supabase
          .from('logistica_informe_movimientos')
          .select('*')
          .in('informe_id', ids);

        todayMovimientos.value = movs || [];
      } else {
        todayMovimientos.value = [];
      }

      const { data: recents } = await supabase
        .from('logistica_informes_diarios')
        .select('*, movimientos:logistica_informe_movimientos(id, cantidad_cajas, cantidad_bultos, tiene_pendiente)')
        .eq('estado', 'enviado')
        .order('fecha', { ascending: false })
        .order('enviado_at', { ascending: false })
        .limit(10);

      recentInformes.value = recents || [];
    } else {
      // 1. Obtener todos los borradores activos del usuario
      const { data: rawDrafts } = await supabase
        .from('logistica_informes_diarios')
        .select('*, movimientos:logistica_informe_movimientos(id, cantidad_cajas, cantidad_bultos, tiene_pendiente)')
        .eq('responsable_user_id', session.user.id)
        .eq('estado', 'borrador')
        .order('created_at', { ascending: false });

      if (rawDrafts && rawDrafts.length > 0) {
        activeOperatorDrafts.value = rawDrafts.filter(draft => {
          const hasMovs = (draft.movimientos?.length || 0) > 0;
          const hasObs = draft.observacion_general && draft.observacion_general.trim().length > 0;
          return hasMovs || hasObs;
        });
      } else {
        activeOperatorDrafts.value = [];
      }

      // 2. Obtener informe de hoy del usuario logueado
      const { data: infToday } = await supabase
        .from('logistica_informes_diarios')
        .select('*, movimientos:logistica_informe_movimientos(id, cantidad_cajas, cantidad_bultos, tiene_pendiente)')
        .eq('responsable_user_id', session.user.id)
        .eq('fecha', todayISO)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      todayInforme.value = infToday;

      if (infToday) {
        const { data: movs } = await supabase
          .from('logistica_informe_movimientos')
          .select('*')
          .eq('informe_id', infToday.id);

        todayMovimientos.value = movs || [];
      } else {
        todayMovimientos.value = [];
      }

      const { data: recents } = await supabase
        .from('logistica_informes_diarios')
        .select('*, movimientos:logistica_informe_movimientos(id, cantidad_cajas, cantidad_bultos, tiene_pendiente)')
        .eq('responsable_user_id', session.user.id)
        .eq('estado', 'enviado')
        .order('fecha', { ascending: false })
        .limit(6);

      recentInformes.value = recents || [];
    }
  } catch (err) {
    toast.error('Error al cargar dashboard: ' + err.message);
  } finally {
    loading.value = false;
  }
};

const getCajasTotal = (inf) => {
  if (!inf || !inf.movimientos || !Array.isArray(inf.movimientos)) return 0;
  return inf.movimientos.reduce((sum, m) => sum + (Number(m.cantidad_cajas) || 0), 0);
};

const getBultosTotal = (inf) => {
  if (!inf || !inf.movimientos || !Array.isArray(inf.movimientos)) return 0;
  return inf.movimientos.reduce((sum, m) => sum + (Number(m.cantidad_bultos) || 0), 0);
};

const getPendientesTotal = (inf) => {
  if (!inf || !inf.movimientos || !Array.isArray(inf.movimientos)) return 0;
  return inf.movimientos.filter(m => m.tiene_pendiente).length;
};

const deleteDraft = async (draftId) => {
  try {
    await supabase.from('logistica_informe_movimientos').delete().eq('informe_id', draftId);
    const { error: deleteErr } = await supabase.from('logistica_informes_diarios').delete().eq('id', draftId);
    if (deleteErr) {
      console.warn('DELETE no permitido por RLS/Grant en logistica_informes_diarios, limpiando borrador:', deleteErr);
      const { error: updateErr } = await supabase
        .from('logistica_informes_diarios')
        .update({ observacion_general: null })
        .eq('id', draftId);
      if (updateErr) console.warn('Error en fallback update:', updateErr);
    }

    toast.success('Borrador eliminado correctamente.');
    await fetchDashboardData();
  } catch (err) {
    toast.error('Error al eliminar borrador: ' + err.message);
  }
};

const reabrirTodayInforme = async () => {
  if (!todayInforme.value?.id) return;
  try {
    const { data: res, error } = await supabase.rpc('reabrir_informe_logistica', {
      p_informe_id: todayInforme.value.id,
      p_motivo: 'Reapertura desde panel de inicio de logística'
    });

    if (error) throw error;
    if (res && !res.success) throw new Error(res.error || 'No se pudo reabrir');

    toast.success('Jornada de hoy reabierta exitosamente.');
    router.push({ name: 'LogisticaNuevoInforme', query: { id: todayInforme.value.id } });
  } catch (err) {
    toast.error('Error al reabrir la jornada: ' + (err.message || 'Error inesperado'));
  }
};

onMounted(fetchDashboardData);

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-');
  return `${d}/${m}/${y}`;
};

const formatTime = (dateTimeStr) => {
  if (!dateTimeStr) return '';
  const date = new Date(dateTimeStr);
  return date.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
};

const formatDateTime = (dateTimeStr) => {
  if (!dateTimeStr) return '';
  const date = new Date(dateTimeStr);
  return date.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' }) + ' ' + date.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
};
</script>

<style scoped>
.animate-fadeIn {
  animation: fadeIn 0.2s ease-out forwards;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-4px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
