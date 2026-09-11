<!-- src/views/logistica/LogisticaNuevoInformeView.vue -->
<template>
  <div class="max-w-2xl mx-auto space-y-5 pb-52 md:pb-28 text-slate-800 dark:text-slate-100 font-sans px-3.5 sm:px-0">
    
    <!-- Top Header Unificado Mobile-First -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 pb-3 border-b border-slate-200/80 dark:border-slate-800">
      <div class="space-y-1">
        <div class="flex items-center gap-2 flex-wrap">
          <span 
            :class="[
              'inline-flex items-center px-2.5 py-0.5 rounded-md text-[10px] sm:text-[11px] font-extrabold tracking-wider uppercase',
              informe.id ? 'bg-amber-100 text-amber-900 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-300 dark:border-amber-800' : 'bg-blue-100 text-blue-900 dark:bg-blue-950/80 dark:text-blue-300 border border-blue-300 dark:border-blue-800'
            ]"
          >
            {{ informe.id ? 'Borrador en Edición' : 'Nuevo Informe' }}
          </span>

          <h1 class="text-base sm:text-lg font-black tracking-tight text-slate-900 dark:text-white">
            {{ informe.id ? 'Editar Informe Diario' : 'Cargar Informe Diario' }}
          </h1>
        </div>

        <!-- Sublínea Integrada: Selector de Borradores, Indicador de Autoguardado e Iniciar Nuevo -->
        <div class="flex items-center gap-2 text-xs flex-wrap pt-0.5">
          <span class="text-slate-500 dark:text-slate-400">
            {{ userDrafts.length > 0 ? `${userDrafts.length} ${userDrafts.length === 1 ? 'borrador activo' : 'borradores activos'}` : 'Registro táctil de operaciones diarias' }}
          </span>

          <!-- Badge de Estado de Autoguardado en Vivo -->
          <span 
            :class="[
              'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[10px] font-extrabold border transition-all shadow-2xs',
              autoSaveStatus === 'saving' ? 'bg-blue-50 text-blue-800 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-900 animate-pulse' :
              autoSaveStatus === 'saved' ? 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-900' :
              autoSaveStatus === 'error' ? 'bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-950 dark:text-rose-300 dark:border-rose-900' :
              'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700'
            ]"
          >
            <span :class="['w-1.5 h-1.5 rounded-full', autoSaveStatus === 'saving' ? 'bg-blue-500 animate-ping' : autoSaveStatus === 'saved' ? 'bg-emerald-500' : autoSaveStatus === 'error' ? 'bg-rose-500' : 'bg-slate-400']"></span>
            <span>{{ autoSaveMessage }}</span>
          </span>

          <button 
            v-if="userDrafts.length > 0"
            type="button" 
            @click="toggleShowDraftSelector" 
            class="text-[11px] font-extrabold text-amber-800 dark:text-amber-300 bg-amber-100/90 dark:bg-amber-950/80 hover:bg-amber-200 dark:hover:bg-amber-900 px-2.5 py-1 rounded-lg border border-amber-300 dark:border-amber-800 transition-all flex items-center gap-1 cursor-pointer active:scale-95 shadow-2xs"
          >
            <span>Cambiar Borrador ({{ userDrafts.length }})</span>
            <svg class="w-3.5 h-3.5 transition-transform" :class="{ 'rotate-180': showDraftSelector }" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
          </button>

          <button 
            v-if="informe.id || userDrafts.length > 0"
            type="button" 
            @click="handleNewReportClick" 
            class="text-[11px] font-extrabold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/70 hover:bg-blue-100 dark:hover:bg-blue-900 px-2.5 py-1 rounded-lg border border-blue-200 dark:border-blue-800 transition-all flex items-center gap-1 cursor-pointer active:scale-95 shadow-2xs"
          >
            + Nuevo
          </button>
        </div>
      </div>

      <!-- Acciones Principales Header -->
      <div class="flex items-center gap-2 self-stretch sm:self-auto justify-between sm:justify-end">
        <button 
          v-if="informe.id"
          type="button" 
          @click="showDeleteDraftModal = true"
          class="px-3 py-2 text-xs font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/50 hover:bg-rose-100 rounded-xl border border-rose-200 dark:border-rose-900 transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 min-h-[38px]"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
          <span>Descartar Borrador</span>
        </button>

        <router-link 
          :to="{ name: 'LogisticaHistorial' }" 
          class="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-all shadow-2xs min-h-[38px]"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
          <span>Volver</span>
        </router-link>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="py-20 flex flex-col items-center justify-center space-y-3 text-slate-400">
      <div class="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      <span class="text-xs font-semibold tracking-wide">Cargando informe diario...</span>
    </div>

    <template v-else>
      <!-- Banner de Modo Supervisión para Administradores -->
      <div 
        v-if="isAdminViewingOtherDraft" 
        class="p-4 rounded-2xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs animate-fadeIn"
        :class="adminEditEnabled ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800' : 'bg-indigo-50/90 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-800'"
      >
        <div class="flex items-center gap-3">
          <span class="text-xl">{{ adminEditEnabled ? '⚠️' : '👁️' }}</span>
          <div>
            <h3 class="text-xs font-black uppercase tracking-wider" :class="adminEditEnabled ? 'text-amber-900 dark:text-amber-300' : 'text-indigo-900 dark:text-indigo-300'">
              {{ adminEditEnabled ? 'Edición Administrativa Habilitada' : 'Modo Supervisión (Solo Lectura)' }}
            </h3>
            <p class="text-[11px]" :class="adminEditEnabled ? 'text-amber-800/90 dark:text-amber-400' : 'text-indigo-800/90 dark:text-indigo-400'">
              {{ adminEditEnabled ? `Estás editando el borrador de ${informe.responsable_nombre}. Los cambios se sincronizarán en la base de datos.` : `Visualizando el borrador de ${informe.responsable_nombre}. El autoguardado está desactivado para no interferir con la sesión del operario.` }}
            </p>
          </div>
        </div>

        <button 
          type="button" 
          @click="toggleAdminEdit"
          class="px-3 py-1.5 rounded-xl text-xs font-extrabold border transition-all cursor-pointer shadow-2xs active:scale-95 shrink-0"
          :class="adminEditEnabled ? 'bg-white dark:bg-slate-900 text-amber-800 border-amber-300 hover:bg-amber-100' : 'bg-indigo-600 hover:bg-indigo-700 text-white border-transparent'"
        >
          {{ adminEditEnabled ? 'Volver a Solo Lectura' : 'Habilitar Edición' }}
        </button>
      </div>

      <!-- Banner de Conflicto de Versiones / Sesiones Concurrentes -->
      <div 
        v-if="hydrationState === 'conflict'" 
        class="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-300 dark:border-rose-800 shadow-sm space-y-3 animate-fadeIn"
      >
        <div class="flex items-start gap-3">
          <span class="text-2xl">⚠️</span>
          <div class="space-y-1">
            <div class="flex items-center gap-2">
              <h3 class="text-xs font-black uppercase tracking-wider text-rose-900 dark:text-rose-200">
                Conflicto de Concurrencia de Borrador
              </h3>
              <span class="px-2 py-0.5 rounded text-[10px] font-extrabold bg-rose-200 dark:bg-rose-900 text-rose-900 dark:text-rose-200">
                Autoguardado Pausado
              </span>
            </div>
            <p class="text-xs text-rose-800/90 dark:text-rose-300 leading-relaxed">
              Este borrador fue modificado en otra sesión (Versión del servidor: <strong>v{{ remoteVersion || '?' }}</strong>, Versión local en tu navegador: <strong>v{{ baseVersion || '?' }}</strong>). Para proteger tus datos y evitar sobreescrituras accidentales, el autoguardado está detenido.
            </p>
          </div>
        </div>

        <div class="flex flex-wrap items-center justify-end gap-2 pt-1 border-t border-rose-200/80 dark:border-rose-900/60">
          <button 
            type="button" 
            @click="resolveConflictKeepRemote" 
            class="px-3.5 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl border border-slate-300 dark:border-slate-600 transition-all cursor-pointer shadow-2xs active:scale-95"
          >
            Usar versión del Servidor
          </button>
          <button 
            v-if="hasLocalBackupToRestore" 
            type="button" 
            @click="resolveConflictUseLocal" 
            class="px-3.5 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition-all cursor-pointer shadow-2xs active:scale-95"
          >
            Sobrescribir con mi copia Local
          </button>
        </div>
      </div>

      <!-- Banner de Respaldo Local Recuperado Pendiente de Sincronización -->
      <div 
        v-if="hasPendingLocalSync && hydrationState === 'ready'" 
        class="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-fadeIn"
      >
        <div class="flex items-center gap-3">
          <span class="text-xl">📁</span>
          <div class="space-y-0.5">
            <div class="flex items-center gap-2">
              <h3 class="text-xs font-black uppercase tracking-wider text-amber-900 dark:text-amber-300">
                Copia local recuperada
              </h3>
              <span class="px-2 py-0.5 rounded text-[10px] font-extrabold bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-200">
                Pendiente de sincronizar
              </span>
            </div>
            <p class="text-xs text-amber-800/90 dark:text-amber-400">
              Se recuperaron cambios no sincronizados guardados en este dispositivo (v{{ baseVersion }}).
            </p>
          </div>
        </div>

        <button 
          type="button" 
          @click="syncPendingLocalBackupNow" 
          :disabled="isSaving"
          class="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs rounded-xl shadow-2xs transition-all cursor-pointer active:scale-95 disabled:opacity-50 shrink-0"
        >
          {{ isSaving ? 'Sincronizando...' : 'Sincronizar ahora' }}
        </button>
      </div>

      <!-- PANEL DESPLEGABLE DE BORRADORES (SE MUESTRA SOLO AL SOLICITAR CAMBIAR BORRADOR) -->
      <div 
        v-if="showDraftSelector && userDrafts.length > 0" 
        class="p-3.5 bg-amber-50/90 dark:bg-amber-950/40 border border-amber-300/80 dark:border-amber-800/80 rounded-2xl space-y-2.5 animate-fadeIn shadow-xs"
      >
        <div class="flex items-center justify-between">
          <span class="text-[11px] font-black uppercase tracking-wider text-amber-900 dark:text-amber-300">
            Borradores Disponibles ({{ userDrafts.length }})
          </span>
          <button type="button" @click="showDraftSelector = false" class="text-[10px] font-bold text-amber-700 dark:text-amber-400 hover:underline cursor-pointer">
            Cerrar
          </button>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <div 
            v-for="d in userDrafts" 
            :key="d.id"
            @click="switchDraft(d.id)"
            :class="[
              'p-3 rounded-xl border transition-all cursor-pointer flex flex-col justify-between gap-1.5 min-h-[60px]',
              informe.id === d.id 
                ? 'bg-amber-100 dark:bg-amber-900/60 border-amber-400 dark:border-amber-600 shadow-xs ring-2 ring-amber-500/20' 
                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:bg-amber-50 dark:hover:bg-amber-950/40'
            ]"
          >
            <div class="flex items-center justify-between">
              <span class="text-xs font-extrabold text-slate-900 dark:text-white">
                Fecha: {{ formatDate(d.fecha) }}
              </span>
              <span v-if="informe.id === d.id" class="px-2 py-0.5 text-[9px] font-black uppercase bg-amber-500 text-white rounded-full">
                En edición
              </span>
            </div>

            <div class="flex items-center justify-between text-[11px] text-slate-600 dark:text-slate-400">
              <span>Zona: {{ d.zona || 'Formosa' }}</span>
              <span>Guardado: {{ formatTime(d.updated_at || d.created_at) }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Datos de la Jornada -->
      <div class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-4 sm:p-5 shadow-xs space-y-4">
        <div class="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div class="flex items-center gap-2">
            <span class="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></span>
            <h2 class="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Datos de la Jornada
            </h2>
          </div>
          <span class="text-xs font-mono font-bold px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
            {{ informe.responsable_nombre }}
          </span>
        </div>

        <!-- ESTADO COLAPSADO DE LA JORNADA -->
        <div v-if="isJornadaCollapsed && informe.fecha" class="p-3.5 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between animate-fadeIn gap-3">
          <div class="flex items-center gap-3 text-xs flex-wrap">
            <span class="font-extrabold text-slate-900 dark:text-white">📅 Jornada: {{ formatDate(informe.fecha) }}</span>
            <span class="font-bold text-slate-600 dark:text-slate-300">📍 Zona: {{ informe.zona || 'Formosa' }}</span>
          </div>
          <button 
            type="button" 
            @click="isJornadaCollapsed = false" 
            class="px-3.5 py-1.5 text-xs font-extrabold text-blue-600 dark:text-blue-400 bg-white dark:bg-slate-900 border border-blue-200 dark:border-blue-800 rounded-lg hover:bg-blue-50 transition-all cursor-pointer active:scale-95 flex-shrink-0"
          >
            Cambiar
          </button>
        </div>

        <!-- ESTADO EDICIÓN / DESPLEGADO DE LA JORNADA -->
        <div v-else class="space-y-3 animate-fadeIn">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Fecha de la Jornada *
              </label>
              <input 
                v-model="informe.fecha" 
                type="date" 
                class="w-full px-3.5 py-3 sm:py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none dark:text-white transition-all text-xs min-h-[44px]"
              />
            </div>

            <div>
              <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Zona / Sector Operativo
              </label>
              <input 
                v-model="informe.zona" 
                type="text" 
                placeholder="Ej: Formosa Capital / Sanatorios" 
                class="w-full px-3.5 py-3 sm:py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none dark:text-white transition-all text-xs min-h-[44px]"
              />
            </div>
          </div>

          <div class="flex justify-end">
            <button 
              type="button" 
              @click="isJornadaCollapsed = true" 
              class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl transition-all cursor-pointer shadow-2xs active:scale-95"
            >
              ✓ Confirmar Jornada
            </button>
          </div>

          <!-- BANNER ADVERTENCIA JORNADA YA ENVIADA -->
          <div v-if="enviadoExistente" class="p-3 bg-amber-50 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-800 rounded-xl text-xs text-amber-900 dark:text-amber-200 flex items-start gap-2 animate-fadeIn mt-1">
            <svg class="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
            <div class="space-y-0.5">
              <span class="font-extrabold block text-xs">⚠️ Atención: Jornada ya enviada</span>
              <p class="text-[11px] leading-relaxed opacity-90">
                Ya existe un informe formal enviado para la fecha {{ formatDate(enviadoExistente.fecha) }}. Este borrador se guardará como un informe diario adicional.
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- SECCIÓN PRINCIPAL DE CARGA DE ÍTENS -->
      <div class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-4 sm:p-5 shadow-xs space-y-5">
        
        <div class="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div class="flex items-center gap-2">
            <span 
              :class="[
                'w-7 h-7 rounded-xl flex items-center justify-center font-bold text-sm',
                editingIndex !== null ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' : 'bg-blue-50 dark:bg-blue-950/70 text-blue-600 dark:text-blue-400'
              ]"
            >
              {{ editingIndex !== null ? '✏️' : '+' }}
            </span>
            <h3 class="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
              {{ editingIndex !== null ? 'Modificando Movimiento' : 'Cargar Nuevo Movimiento' }}
            </h3>
          </div>
          
          <button 
            v-if="editingIndex !== null" 
            type="button" 
            @click="cancelEditMovement"
            class="text-[11px] font-bold text-rose-600 hover:underline cursor-pointer"
          >
            Cancelar Edición
          </button>
          <span v-else class="text-[11px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2.5 py-0.5 rounded-lg">
            Paso a Paso
          </span>
        </div>

        <!-- CONSTRUCTOR DE MOVIMIENTO -->
        <div 
          :class="[
            'p-4 sm:p-5 rounded-2xl border space-y-4 transition-all',
            editingIndex !== null ? 'bg-amber-50/70 dark:bg-amber-950/30 border-amber-300 dark:border-amber-800 ring-2 ring-amber-400/20' : 'bg-slate-50/80 dark:bg-slate-800/40 border-slate-200/80 dark:border-slate-700/80'
          ]"
        >
          
          <!-- PASO 1: CHIPS TÁCTILES MOBILE-FIRST (COLAPSABLE) -->
          <div class="space-y-2">
            <label class="block text-xs font-bold text-slate-800 dark:text-slate-200">
              1. Tipo de Gestión *
            </label>

            <!-- ESTADO COLAPSADO -->
            <div 
              v-if="isTipoCollapsed && builder.tipo_movimiento" 
              class="p-3 bg-blue-50/90 dark:bg-blue-950/40 rounded-xl border border-blue-200 dark:border-blue-900 flex items-center justify-between animate-fadeIn"
            >
              <div class="flex items-center gap-2">
                <span class="text-xs font-bold text-slate-600 dark:text-slate-400">Tipo:</span>
                <span class="px-3 py-1 text-xs font-black rounded-lg bg-blue-600 text-white shadow-2xs">
                  {{ builder.tipo_movimiento }}
                </span>
              </div>
              <button 
                type="button" 
                @click="isTipoCollapsed = false" 
                class="px-3.5 py-1.5 text-xs font-extrabold text-blue-600 dark:text-blue-400 bg-white dark:bg-slate-800 border border-blue-200 dark:border-blue-800 rounded-lg hover:bg-blue-100 transition-all cursor-pointer active:scale-95"
              >
                Cambiar
              </button>
            </div>

            <!-- ESTADO DESPLEGADO -->
            <div v-else class="grid grid-cols-2 sm:flex sm:flex-wrap gap-2 animate-fadeIn">
              <button 
                v-for="chip in tipoChips" 
                :key="chip.value"
                type="button"
                @click="selectTipoMovimiento(chip.value)"
                :class="[
                  'px-3 py-2.5 sm:px-3.5 sm:py-2 text-xs font-bold rounded-xl border transition-all flex items-center justify-center sm:justify-start gap-1.5 cursor-pointer shadow-2xs active:scale-95 min-h-[44px]',
                  builder.tipo_movimiento === chip.value 
                    ? 'bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-500/20 scale-[1.02]' 
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                ]"
              >
                <span class="text-center">{{ chip.label }}</span>
              </button>
            </div>
          </div>

          <!-- CAMPO DINÁMICO SI SE SELECCIONA INCIDENCIA U OTRA GESTIÓN -->
          <div 
            v-if="builder.tipo_movimiento === 'Incidencia' || builder.tipo_movimiento === 'Otra gestión'" 
            class="p-3.5 bg-amber-50/90 dark:bg-amber-950/40 rounded-xl border border-amber-300 dark:border-amber-800/80 space-y-2 animate-fadeIn"
          >
            <label class="block text-xs font-extrabold text-amber-900 dark:text-amber-300">
              {{ builder.tipo_movimiento === 'Incidencia' ? 'Detalle Obligatorio de la Incidencia *' : 'Detalle de la Gestión *' }}
            </label>
            <input 
              v-model="builder.detalle_incidencia_o_gestion" 
              type="text" 
              :placeholder="builder.tipo_movimiento === 'Incidencia' ? 'Ej: Transporte demorado por lluvia...' : 'Ej: Documentación en dirección...'"
              class="w-full px-3.5 py-3 sm:py-2 text-xs bg-white dark:bg-slate-900 border border-amber-300 dark:border-amber-800 rounded-xl font-medium focus:ring-2 focus:ring-amber-500/20 focus:outline-none dark:text-white min-h-[42px]"
            />
          </div>

          <!-- TOGGLE RÁPIDO RETIRO -->
          <div 
            v-if="builder.tipo_movimiento === 'Retiro de cajas'" 
            class="p-3.5 bg-blue-50/90 dark:bg-blue-950/40 rounded-xl border border-blue-200 dark:border-blue-900/60 flex items-center justify-between animate-fadeIn gap-3"
          >
            <div class="space-y-0.5">
              <span class="text-xs font-bold text-blue-900 dark:text-blue-200 block">
                ¿Trasladado a Central en el mismo día?
              </span>
              <p class="text-[11px] text-blue-700 dark:text-blue-300">
                Registra el retiro del sanatorio y el envío a central en 1 paso.
              </p>
            </div>
            <label class="relative inline-flex items-center cursor-pointer flex-shrink-0">
              <input type="checkbox" v-model="builder.trasladado_a_central" class="sr-only peer" />
              <div class="w-10 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:after:border-slate-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <!-- PASO 2: BÚSQUEDA PACIENTE / CIRUGÍA -->
          <div class="space-y-2 relative">
            <div class="flex items-center justify-between">
              <label class="block text-xs font-bold text-slate-800 dark:text-slate-200">
                2. Buscar Paciente / Cirugía Asignada *
              </label>

              <!-- ACCIÓN CONTEXTUAL ÚNICA: TRAER DESDE UNA ENTREGA -->
              <button 
                v-if="builder.tipo_movimiento === 'Retiro de cajas' && !selectedCirugia" 
                type="button" 
                @click="openBuscarEntregasModal" 
                class="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-extrabold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/70 hover:bg-blue-100 dark:hover:bg-blue-900 rounded-lg border border-blue-200 dark:border-blue-800 transition-all cursor-pointer active:scale-95 shadow-2xs"
              >
                <span>📦 Traer desde una entrega</span>
              </button>
            </div>

            <!-- Badge Informativo de Entrega Vinculada -->
            <div 
              v-if="builder.entrega_origen_info" 
              class="p-3 bg-blue-50/90 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-xl text-xs space-y-1.5 animate-fadeIn"
            >
              <div class="flex items-center justify-between">
                <span class="font-extrabold text-blue-950 dark:text-blue-100 flex items-center gap-1.5">
                  <span>🔗</span> Vinculado a Entrega Previa
                </span>
                <button type="button" @click="clearEntregaOrigen" class="text-[11px] font-bold text-rose-600 hover:underline cursor-pointer">
                  Desvincular
                </button>
              </div>
              <div class="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-blue-800 dark:text-blue-300">
                <span>Entregado: <strong>{{ builder.entrega_origen_info.cantidad_cajas }} cajas, {{ builder.entrega_origen_info.cantidad_bultos }} bultos</strong></span>
                <span v-if="builder.entrega_origen_info.fecha">Fecha: {{ formatDate(builder.entrega_origen_info.fecha) }}</span>
                <span v-if="builder.entrega_origen_info.trazabilidad_activa && builder.entrega_origen_info.saldo_cajas !== null" class="font-bold text-emerald-700 dark:text-emerald-400">
                  Saldo disponible: {{ builder.entrega_origen_info.saldo_cajas }} cajas
                </span>
                <span v-else class="text-slate-500 dark:text-slate-400 font-medium">
                  (Antecedente de referencia)
                </span>
              </div>
            </div>
            
            <!-- Cirugía Seleccionada -->
            <div v-if="selectedCirugia" class="flex items-center justify-between p-3.5 bg-blue-50/90 dark:bg-blue-950/60 rounded-xl border border-blue-200 dark:border-blue-800 text-xs">
              <div class="space-y-1">
                <div class="flex items-center gap-2">
                  <span class="font-extrabold text-blue-950 dark:text-blue-100 text-sm">{{ selectedCirugia.paciente }}</span>
                  <span class="font-mono text-[10px] px-2 py-0.5 rounded-md bg-blue-200 dark:bg-blue-900 text-blue-900 dark:text-blue-100 font-bold">
                    {{ selectedCirugia.id_cirugia }}
                  </span>
                </div>
                <div class="flex gap-3 text-[11px] text-blue-800 dark:text-blue-300 flex-wrap">
                  <span v-if="selectedCirugia.cliente">Cliente: <strong>{{ selectedCirugia.cliente }}</strong></span>
                  <span v-if="selectedCirugia.medico">Médico: <strong>{{ selectedCirugia.medico }}</strong></span>
                  <span v-if="selectedCirugia.institucion">Lugar: <strong>{{ selectedCirugia.institucion }}</strong></span>
                </div>
              </div>

              <button 
                type="button" 
                @click="clearSelectedCirugia" 
                class="px-3 py-2 text-xs font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 rounded-xl transition-colors border border-rose-200 dark:border-rose-900 cursor-pointer min-h-[38px]"
              >
                Cambiar
              </button>
            </div>

            <!-- Input de Búsqueda (Se oculta en Carga Manual) -->
            <div v-else-if="!showManualForm" class="relative">
              <div class="relative">
                <input 
                  v-model="searchQuery" 
                  type="text" 
                  placeholder="Buscar por paciente, médico, código (CX-) o clínica..." 
                  @input="onSearchInput"
                  @focus="showDropdown = true"
                  class="w-full pl-9 pr-4 py-3 sm:py-2.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none dark:text-white placeholder:text-slate-400 min-h-[44px]"
                />
                <svg class="w-4 h-4 text-slate-400 absolute left-3 top-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
              </div>

              <!-- Dropdown de Resultados Unificado (Entregas Previas + Cirugías) -->
              <div 
                v-if="showDropdown && (isSearching || searchResults.length > 0 || searchEntregaResults.length > 0)" 
                class="absolute z-30 left-0 right-0 top-full mt-1 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xl max-h-72 overflow-y-auto p-1.5 space-y-2 animate-fadeIn"
              >
                <div v-if="isSearching" class="p-3 text-center text-xs text-slate-400">
                  Buscando en la base de datos...
                </div>

                <template v-else>
                  <!-- SECCIÓN 1: Entregas Previas Encontradas (Ideal para Retiros) -->
                  <div v-if="searchEntregaResults.length > 0" class="space-y-1">
                    <div class="px-2 py-1 text-[10px] font-black uppercase tracking-wider text-blue-700 dark:text-blue-300 bg-blue-50/80 dark:bg-blue-950/60 rounded flex items-center justify-between">
                      <span class="flex items-center gap-1">📦 Entregas Previas Registradas</span>
                      <span class="text-[9px] font-bold">Vincular entrega</span>
                    </div>

                    <div 
                      v-for="e in searchEntregaResults" 
                      :key="'ent-' + e.id"
                      @click="selectEntregaParaRetiro(e)"
                      class="p-2.5 rounded-lg bg-blue-50/40 hover:bg-blue-100/70 dark:bg-blue-950/30 dark:hover:bg-blue-900/50 cursor-pointer transition-colors space-y-1 border border-blue-200/60 dark:border-blue-800/60"
                    >
                      <div class="flex items-center justify-between text-xs font-bold text-slate-900 dark:text-white">
                        <span>{{ e.paciente_snapshot || 'Paciente sin nombre' }}</span>
                        <span v-if="e.id_cirugia_snapshot" class="font-mono text-[10px] px-1.5 py-0.5 rounded bg-blue-200 dark:bg-blue-900 text-blue-900 dark:text-blue-100 font-bold">
                          {{ e.id_cirugia_snapshot }}
                        </span>
                      </div>
                      <div class="flex gap-2 text-[11px] text-slate-600 dark:text-slate-300 flex-wrap">
                        <span v-if="e.institucion_snapshot">📍 {{ e.institucion_snapshot }}</span>
                        <span v-if="e.medico_snapshot">👨‍⚕️ {{ e.medico_snapshot }}</span>
                        <span v-if="e.fecha_informe">📅 {{ formatDate(e.fecha_informe) }}</span>
                      </div>
                      <div class="flex items-center justify-between text-[11px] text-blue-800 dark:text-blue-300 pt-0.5 font-semibold">
                        <span>Entregadas: {{ e.cantidad_cajas_entregadas || e.cantidad_cajas || 1 }} cajas</span>
                        <span v-if="e.saldo_cajas_pendiente !== null && e.saldo_cajas_pendiente !== undefined" class="text-emerald-700 dark:text-emerald-400 font-bold">
                          Saldo: {{ e.saldo_cajas_pendiente }} cajas
                        </span>
                      </div>
                    </div>
                  </div>

                  <!-- SECCIÓN 2: Cirugías Programadas -->
                  <div v-if="searchResults.length > 0" class="space-y-1">
                    <div v-if="searchEntregaResults.length > 0" class="px-2 py-1 text-[10px] font-black uppercase tracking-wider text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/80 rounded flex items-center gap-1">
                      <span>🏥 Cirugías Programadas</span>
                    </div>

                    <div 
                      v-for="item in searchResults" 
                      :key="'cx-' + item.id"
                      @click="selectCirugia(item)"
                      class="p-2.5 rounded-lg hover:bg-blue-50 dark:hover:bg-slate-700 cursor-pointer transition-colors space-y-1 border border-transparent hover:border-blue-200 dark:hover:border-slate-600"
                    >
                      <div class="flex items-center justify-between text-xs font-bold text-slate-900 dark:text-white">
                        <span>{{ item.paciente || 'Paciente sin nombre' }}</span>
                        <span class="font-mono text-[10px] px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 font-bold">
                          {{ item.id_cirugia }}
                        </span>
                      </div>
                      <div class="flex gap-2 text-[11px] text-slate-500 dark:text-slate-400 flex-wrap">
                        <span v-if="item.cliente">Cliente: {{ item.cliente }}</span>
                        <span v-if="item.medico">Médico: {{ item.medico }}</span>
                        <span v-if="item.institucion">Lugar: {{ item.institucion }}</span>
                      </div>
                    </div>
                  </div>
                </template>
              </div>
            </div>

            <!-- CARGA MANUAL SI LA CX NO FIGURA -->
            <div 
              v-if="!selectedCirugia && !showManualForm" 
              class="p-3.5 bg-slate-100/90 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
            >
              <div class="text-xs text-slate-600 dark:text-slate-300">
                <span class="font-bold text-slate-900 dark:text-white block">¿La cirugía no figura en la lista?</span>
                <p class="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Ingresa los datos manualmente para registrar el movimiento.</p>
              </div>

              <button 
                type="button" 
                @click="openManualForm" 
                class="px-3.5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl shadow-2xs transition-all w-full sm:w-auto text-center cursor-pointer active:scale-95 min-h-[42px]"
              >
                + Cargar Manualmente
              </button>
            </div>

            <!-- FORMULARIO DE CARGA MANUAL CON BOTÓN CONFIRMAR DATOS -->
            <div 
              v-if="showManualForm && !selectedCirugia" 
              class="p-4 bg-white dark:bg-slate-900 rounded-xl border-2 border-blue-400 dark:border-blue-600 space-y-3 animate-fadeIn shadow-md"
            >
              <div class="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                <h4 class="text-xs font-extrabold text-slate-900 dark:text-white">
                  Carga Manual de Paciente / Cirugía
                </h4>
                <button type="button" @click="closeManualForm" class="text-xs font-bold text-rose-500 hover:underline">
                  Cancelar
                </button>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div class="sm:col-span-2">
                  <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">Nombre Completo del Paciente *</label>
                  <input v-model="manualForm.paciente" type="text" placeholder="Ej: Juan Pérez" class="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:outline-none dark:text-white" />
                </div>

                <div>
                  <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">Médico Cirujano</label>
                  <input v-model="manualForm.medico" type="text" placeholder="Ej: Dr. González" class="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:outline-none dark:text-white" />
                </div>

                <div>
                  <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">Fecha de la Cirugía</label>
                  <input v-model="manualForm.fecha_cirugia" type="date" class="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none dark:text-white" />
                </div>

                <div>
                  <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">Sanatorio / Institución</label>
                  <input v-model="manualForm.institucion" type="text" placeholder="Ej: Sanatorio Vinto" class="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:outline-none dark:text-white" />
                </div>

                <div>
                  <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">Cliente / Obra Social</label>
                  <input v-model="manualForm.cliente" type="text" placeholder="Ej: OSDE / Swiss Medical" class="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:outline-none dark:text-white" />
                </div>
              </div>

              <div class="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button 
                  type="button" 
                  @click="closeManualForm" 
                  class="px-3.5 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all cursor-pointer"
                >
                  Cancelar
                </button>

                <button 
                  type="button" 
                  @click="confirmManualForm" 
                  class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl shadow-2xs transition-all cursor-pointer active:scale-95"
                >
                  ✓ Confirmar Datos
                </button>
              </div>
            </div>
          </div>

          <!-- PASO 3: CONTADORES CAJAS Y BULTOS (TOUCH TARGET 48px) -->
          <div class="grid grid-cols-2 gap-3 pt-1">
            <div>
              <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Cantidad de Cajas y/o Equipos</label>
              <div class="flex items-center gap-1 bg-white dark:bg-slate-900 p-1 border border-slate-200 dark:border-slate-700 rounded-xl">
                <button type="button" @click="builder.cantidad_cajas = Math.max(0, builder.cantidad_cajas - 1)" class="w-10 h-10 flex items-center justify-center font-black text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-lg cursor-pointer active:scale-95">-</button>
                <input v-model.number="builder.cantidad_cajas" type="number" min="0" class="w-full text-center font-mono font-bold text-base bg-transparent focus:outline-none dark:text-white" />
                <button type="button" @click="builder.cantidad_cajas++" class="w-10 h-10 flex items-center justify-center font-black text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-lg cursor-pointer active:scale-95">+</button>
              </div>
            </div>

            <div>
              <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Cantidad de Contenedores</label>
              <div class="flex items-center gap-1 bg-white dark:bg-slate-900 p-1 border border-slate-200 dark:border-slate-700 rounded-xl">
                <button type="button" @click="builder.cantidad_bultos = Math.max(0, builder.cantidad_bultos - 1)" class="w-10 h-10 flex items-center justify-center font-black text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-base cursor-pointer active:scale-95">-</button>
                <input v-model.number="builder.cantidad_bultos" type="number" min="0" class="w-full text-center font-mono font-bold text-base bg-transparent focus:outline-none dark:text-white" />
                <button type="button" @click="builder.cantidad_bultos++" class="w-10 h-10 flex items-center justify-center font-black text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-base cursor-pointer active:scale-95">+</button>
              </div>
            </div>
          </div>

          <!-- PASO 4: OBSERVACIONES Y PENDIENTES -->
          <div class="space-y-3 pt-1">
            <div>
              <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Observaciones / Notas Específicas</label>
              <input 
                v-model="builder.observaciones" 
                type="text" 
                placeholder="Detalles sobre esta entrega o retiro (opcional)..." 
                @keyup.enter="addMovementToList"
                class="w-full px-3.5 py-3 sm:py-2.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none dark:text-white placeholder:text-slate-400 min-h-[44px]"
              />
            </div>

            <!-- Toggle Pendiente -->
            <div class="p-3.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <span class="text-xs font-bold text-amber-800 dark:text-amber-400">¿Quedó algún ítem o bulto pendiente?</span>
              <label class="relative inline-flex items-center cursor-pointer flex-shrink-0">
                <input type="checkbox" v-model="builder.tiene_pendiente" class="sr-only peer" />
                <div class="w-10 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:after:border-slate-600 peer-checked:bg-amber-500"></div>
              </label>
            </div>

            <div v-if="builder.tiene_pendiente" class="p-3.5 bg-amber-50/90 dark:bg-amber-950/40 rounded-xl border border-amber-200 dark:border-amber-900/60 space-y-2 animate-fadeIn">
              <label class="block text-xs font-bold text-amber-900 dark:text-amber-300">Detalle del Pendiente *</label>
              <input v-model="builder.detalle_pendiente" type="text" placeholder="Ej: 1 caja pendiente de retiro por quirófano ocupado" class="w-full px-3 py-2.5 text-xs bg-white dark:bg-slate-900 border border-amber-300 dark:border-amber-800 rounded-lg focus:outline-none dark:text-white" />
            </div>
          </div>

          <!-- BOTÓN PRINCIPAL DE AÑADIR / GUARDAR CAMBIOS DE MOVIMIENTO -->
          <button 
            type="button" 
            @click="addMovementToList" 
            :class="[
              'w-full py-3.5 font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 active:scale-98 cursor-pointer min-h-[46px]',
              editingIndex !== null ? 'bg-amber-600 hover:bg-amber-700 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'
            ]"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4"/></svg>
            <span>{{ editingIndex !== null ? 'Guardar Cambios del Movimiento' : 'Añadir Movimiento al Informe' }}</span>
          </button>
        </div>

        <!-- LISTA DE MOVIMIENTOS CARGADOS CON FILTROS Y REORDENAMIENTO -->
        <div class="space-y-3 pt-3">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
            <h4 class="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">
              Movimientos Registrados ({{ movimientos.length }})
            </h4>

            <!-- CHIPS DE FILTRO DE MOVIMIENTOS -->
            <div v-if="movimientos.length > 0" class="flex items-center gap-1 flex-wrap text-[11px]">
              <button 
                type="button"
                @click="movimientoFilter = 'todos'"
                :class="['px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer min-h-[30px]', movimientoFilter === 'todos' ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200']"
              >
                Todos ({{ filterCounts.total }})
              </button>
              <button 
                v-if="filterCounts.entregas > 0"
                type="button"
                @click="movimientoFilter = 'entrega'"
                :class="['px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer min-h-[30px]', movimientoFilter === 'entrega' ? 'bg-blue-600 text-white' : 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 hover:bg-blue-100']"
              >
                Entregas ({{ filterCounts.entregas }})
              </button>
              <button 
                v-if="filterCounts.retiros > 0"
                type="button"
                @click="movimientoFilter = 'retiro'"
                :class="['px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer min-h-[30px]', movimientoFilter === 'retiro' ? 'bg-emerald-600 text-white' : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100']"
              >
                Retiros ({{ filterCounts.retiros }})
              </button>
              <button 
                v-if="filterCounts.incidencias > 0"
                type="button"
                @click="movimientoFilter = 'incidencia'"
                :class="['px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer min-h-[30px]', movimientoFilter === 'incidencia' ? 'bg-rose-600 text-white' : 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 hover:bg-rose-100']"
              >
                Incidencias ({{ filterCounts.incidencias }})
              </button>
              <button 
                v-if="filterCounts.otros > 0"
                type="button"
                @click="movimientoFilter = 'otros'"
                :class="['px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer min-h-[30px]', movimientoFilter === 'otros' ? 'bg-purple-600 text-white' : 'bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 hover:bg-purple-100']"
              >
                Otros ({{ filterCounts.otros }})
              </button>
            </div>
          </div>

          <!-- Empty State -->
          <div v-if="movimientos.length === 0" class="py-10 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl text-xs text-slate-400 space-y-1">
            <p class="font-medium text-slate-500 dark:text-slate-400">Aún no has agregado movimientos a este informe.</p>
            <p class="text-[11px] text-slate-400">Completa los pasos arriba y presiona "Añadir Movimiento al Informe".</p>
          </div>

          <div v-else-if="filteredMovimientos.length === 0" class="py-6 text-center text-xs text-slate-400">
            No hay movimientos registrados para el filtro seleccionado.
          </div>

          <!-- Lista de Ítems Filtrados -->
          <div v-else class="space-y-2.5">
            <TransitionGroup name="list">
              <div 
                v-for="(mov, index) in filteredMovimientos" 
                :key="mov.tempId || index"
                :class="[
                  'p-3.5 sm:p-4 rounded-xl border transition-all flex items-start justify-between gap-3 shadow-2xs',
                  editingIndex === movimientos.indexOf(mov) 
                    ? 'bg-amber-50/90 dark:bg-amber-950/60 border-amber-400 dark:border-amber-600 ring-2 ring-amber-500/20' 
                    : 'bg-slate-50/70 dark:bg-slate-800/50 hover:bg-slate-100/90 dark:hover:bg-slate-800 border-slate-200/80 dark:border-slate-700'
                ]"
              >
                <div class="space-y-1.5 flex-1 min-w-0">
                  <div class="flex items-center gap-2 flex-wrap">
                    <span class="px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-blue-100 text-blue-900 dark:bg-blue-950 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                      {{ mov.tipo_movimiento }}
                    </span>

                    <span v-if="mov.id_cirugia_snapshot" class="font-mono text-[10px] px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold">
                      {{ mov.id_cirugia_snapshot }}
                    </span>

                    <span v-if="mov.cliente_snapshot" class="text-[11px] text-slate-600 dark:text-slate-400 font-medium">
                      Cliente: {{ mov.cliente_snapshot }}
                    </span>
                  </div>

                  <h5 class="text-xs font-extrabold text-slate-900 dark:text-white truncate">
                    Paciente: {{ mov.paciente_snapshot || mov.destino || mov.institucion_snapshot || 'Gestión Sin Nombre' }}
                  </h5>

                  <div class="flex items-center gap-3 text-[11px] text-slate-600 dark:text-slate-400 flex-wrap">
                    <span v-if="mov.medico_snapshot">Médico: <strong>{{ mov.medico_snapshot }}</strong></span>
                    <span v-if="mov.institucion_snapshot">Lugar: <strong>{{ mov.institucion_snapshot }}</strong></span>
                    <span>Cajas: <strong>{{ mov.cantidad_cajas || 0 }}</strong></span>
                    <span>Bultos: <strong>{{ mov.cantidad_bultos || 0 }}</strong></span>
                  </div>

                  <div v-if="mov.observaciones" class="text-[11px] text-slate-600 dark:text-slate-400 italic">
                    Notas: {{ mov.observaciones }}
                  </div>

                  <div v-if="mov.tiene_pendiente" class="mt-1 px-3 py-1.5 rounded-lg bg-amber-100/80 dark:bg-amber-950/70 text-[11px] text-amber-950 dark:text-amber-200 font-bold border border-amber-200 dark:border-amber-900">
                    Pendiente Registrado: {{ mov.detalle_pendiente }}
                  </div>
                </div>

                <!-- ACCIONES REORDENAR / EDICIÓN / BORRADO (TÁCTILES MOBILE) -->
                <div class="flex items-center gap-1 self-center">
                  <!-- Botones de Reordenamiento Subir/Bajar -->
                  <div class="flex flex-col gap-0.5 mr-1 border-r border-slate-200 dark:border-slate-700 pr-1.5">
                    <button 
                      type="button" 
                      @click="moveMovementUp(movimientos.indexOf(mov))" 
                      :disabled="movimientos.indexOf(mov) === 0"
                      class="p-1 text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 disabled:opacity-20 cursor-pointer disabled:cursor-not-allowed transition-all active:scale-95"
                      title="Subir posición"
                    >
                      <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 15l7-7 7 7"/></svg>
                    </button>

                    <button 
                      type="button" 
                      @click="moveMovementDown(movimientos.indexOf(mov))" 
                      :disabled="movimientos.indexOf(mov) === movimientos.length - 1"
                      class="p-1 text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 disabled:opacity-20 cursor-pointer disabled:cursor-not-allowed transition-all active:scale-95"
                      title="Bajar posición"
                    >
                      <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 9l-7 7-7-7"/></svg>
                    </button>
                  </div>

                  <button 
                    type="button" 
                    @click="editMovement(movimientos.indexOf(mov))" 
                    class="p-2 rounded-lg text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-950/50 transition-all cursor-pointer min-h-[38px] min-w-[38px] flex items-center justify-center"
                    title="Editar ítem"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/></svg>
                  </button>

                  <button 
                    type="button" 
                    @click="deleteMovimiento(movimientos.indexOf(mov))" 
                    class="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-all cursor-pointer min-h-[38px] min-w-[38px] flex items-center justify-center"
                    title="Eliminar de la lista"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                  </button>
                </div>
              </div>
            </TransitionGroup>
          </div>
        </div>

        <!-- Observaciones Generales -->
        <div class="pt-2">
          <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
            Observaciones Generales del Informe (Opcional)
          </label>
          <input 
            v-model="informe.observacion_general" 
            type="text" 
            placeholder="Aclaraciones generales para la jornada..." 
            class="w-full px-3.5 py-3 sm:py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none dark:text-white min-h-[44px]"
          />
        </div>

        <!-- TARJETA LIMPIA DE CIERRE DE JORNADA AL FINAL DEL CONTENIDO -->
        <div class="pt-4 mt-6 border-t border-slate-200 dark:border-slate-800 space-y-3">
          
          <!-- Banner de Bloqueo si hay Edición Activa -->
          <div 
            v-if="editingIndex !== null" 
            class="p-3 bg-amber-50 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-800 rounded-xl text-xs font-bold text-amber-900 dark:text-amber-200 flex items-center gap-2 animate-fadeIn"
          >
            <svg class="w-4 h-4 text-amber-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
            <span>Estás editando el movimiento #{{ editingIndex + 1 }}. Guardá o cancelá los cambios antes de finalizar el informe.</span>
          </div>

          <div class="p-4 sm:p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
            <div class="space-y-0.5 text-center sm:text-left">
              <h4 class="text-sm font-black text-slate-900 dark:text-white">
                Todo listo para cerrar la jornada
              </h4>
              <p class="text-xs text-slate-500 dark:text-slate-400">
                Revisá el resumen final y enviá el informe formal por correo.
              </p>
            </div>

            <div class="flex items-center gap-2 w-full sm:w-auto justify-end">
              <button 
                type="button" 
                @click="saveDraftManual" 
                :disabled="isSaving || isSending || editingIndex !== null || (isAdminViewingOtherDraft && !adminEditEnabled)"
                class="px-4 py-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-extrabold text-xs rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-1 cursor-pointer min-h-[44px]"
              >
                <span>{{ (isAdminViewingOtherDraft && !adminEditEnabled) ? 'Supervisión Activa' : 'Guardar Borrador' }}</span>
              </button>

              <button 
                type="button" 
                @click="openResumenModal" 
                :disabled="movimientos.length === 0 || isSending || editingIndex !== null || (isAdminViewingOtherDraft && !adminEditEnabled)"
                class="px-5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-md transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer active:scale-95 min-h-[44px]"
              >
                <span>Finalizar Informe</span>
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- Modal Confirmación Eliminar Borrador -->
    <div v-if="showDeleteDraftModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-fadeIn">
      <div class="bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-2xl max-w-sm w-full border border-slate-200 dark:border-slate-800 space-y-4">
        <div class="space-y-1">
          <h3 class="text-sm font-extrabold text-slate-900 dark:text-white">
            ¿Descartar este borrador?
          </h3>
          <p class="text-xs text-slate-500 dark:text-slate-400">
            Se eliminarán los movimientos registrados en este borrador y no podrán recuperarse.
          </p>
        </div>

        <div class="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          <button type="button" @click="showDeleteDraftModal = false" class="px-3.5 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 rounded-xl">
            Cancelar
          </button>
          <button type="button" @click="deleteCurrentDraft" class="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs">
            Confirmar Descarte
          </button>
        </div>
      </div>
    </div>

    <!-- Modal Resumen Envío -->
    <ResumenEnvioModal 
      :show="showResumenModal"
      :stats="summaryStats"
      :observacion="informe.observacion_general"
      :is-sending="isSending"
      @close="showResumenModal = false"
      @confirm="submitInformeFinal"
    />

    <!-- Modal Opciones de Borrador Activo -->
    <DraftOptionsModal 
      :show="showDraftOptionsModal"
      :draft="informe"
      :movimientos-count="movimientos.length"
      @close="showDraftOptionsModal = false"
      @continue="showDraftOptionsModal = false"
      @start-new="startNewCleanReport"
    />

    <!-- Modal Buscar Entregas para Retiro -->
    <div v-if="showBuscarEntregasModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-fadeIn">
      <div class="bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-2xl max-w-lg w-full border border-slate-200 dark:border-slate-800 space-y-4 max-h-[85vh] flex flex-col">
        <div class="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div class="space-y-0.5">
            <h3 class="text-sm font-black text-slate-900 dark:text-white flex items-center gap-1.5">
              <span>📦</span> Seleccionar Entrega Previa para Retiro
            </h3>
            <p class="text-[11px] text-slate-500 dark:text-slate-400">
              Prioriza por código de cirugía / remito o sanatorio
            </p>
          </div>
          <button type="button" @click="showBuscarEntregasModal = false" class="text-slate-400 hover:text-slate-600 text-lg leading-none cursor-pointer">
            ✕
          </button>
        </div>

        <div class="relative">
          <input 
            v-model="entregaSearchQuery" 
            type="text" 
            placeholder="Buscar por código CX-, remito, sanatorio o paciente..." 
            @input="onEntregaSearchInput"
            class="w-full pl-9 pr-4 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:outline-none dark:text-white"
          />
          <svg class="w-4 h-4 text-slate-400 absolute left-3 top-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
        </div>

        <div class="flex-1 overflow-y-auto space-y-2 pr-1 min-h-[180px]">
          <div v-if="isSearchingEntregas" class="py-8 text-center text-xs text-slate-400 animate-pulse">
            Buscando entregas registradas...
          </div>
          <div v-else-if="entregasResults.length === 0" class="py-8 text-center text-xs text-slate-400">
            No se encontraron entregas con el criterio ingresado.
          </div>
          <div 
            v-else 
            v-for="e in entregasResults" 
            :key="e.id"
            @click="selectEntregaParaRetiro(e)"
            class="p-3 bg-slate-50 dark:bg-slate-800/60 hover:bg-blue-50 dark:hover:bg-blue-950/40 border border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-700 rounded-xl cursor-pointer transition-all space-y-1.5"
          >
            <div class="flex items-center justify-between text-xs font-bold">
              <span class="text-slate-900 dark:text-white">{{ e.paciente_snapshot || 'Paciente sin nombre' }}</span>
              <span v-if="e.id_cirugia_snapshot" class="font-mono text-[10px] px-2 py-0.5 rounded bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                {{ e.id_cirugia_snapshot }}
              </span>
            </div>
            <div class="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
              <span>📍 {{ e.institucion_snapshot || 'Lugar no especificado' }}</span>
              <span>📅 {{ formatDate(e.fecha_informe) }}</span>
            </div>
            <div class="flex items-center justify-between text-[11px] pt-1 border-t border-slate-200/60 dark:border-slate-700/60">
              <span>Entregado: <strong>{{ e.cantidad_cajas_entregadas }} cajas, {{ e.cantidad_bultos_entregados }} bultos</strong></span>
              <span v-if="e.trazabilidad_activa && e.saldo_cajas_pendiente !== null" class="font-bold text-emerald-700 dark:text-emerald-400">
                Saldo: {{ e.saldo_cajas_pendiente }} cajas
              </span>
              <span v-else class="text-slate-400">
                (Antecedente)
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted, onUnmounted } from 'vue';
import { useRouter, useRoute, onBeforeRouteLeave } from 'vue-router';
import { supabase } from '../../services/supabase';
import { useToast } from 'vue-toastification';
import ResumenEnvioModal from '../../components/logistica/ResumenEnvioModal.vue';
import DraftOptionsModal from '../../components/logistica/DraftOptionsModal.vue';

const router = useRouter();
const route = useRoute();
const toast = useToast();

const loading = ref(true);
const isSaving = ref(false);
const isSending = ref(false);
const isDeletingDraft = ref(false);
const showResumenModal = ref(false);
const showDeleteDraftModal = ref(false);
const showDraftOptionsModal = ref(false);

// --- ESTADOS DE CONTROL DE CONCURRENCIA, HIDRATACIÓN Y TRAZABILIDAD ---
const hydrationState = ref('pending'); // 'pending' | 'hydrating' | 'ready' | 'conflict'
const stateSource = ref('nuevo'); // 'remoto' | 'local_restored' | 'nuevo'
const baseVersion = ref(1); // Versión base local con la que se están registrando cambios
const remoteVersion = ref(null); // Última versión confirmada en el servidor
const conflictData = ref(null); // Datos del conflicto si ocurre
const hasLocalBackupToRestore = computed(() => !!conflictData.value?.local);
const hasPendingLocalSync = ref(false); // Indica si hay una copia local restaurada pendiente de subir
const saveTriggerReason = ref('');

const deletedMovementIds = ref([]); // Cola de IDs eliminados para sincronización explícita
const showBuscarEntregasModal = ref(false);
const entregasResults = ref([]);
const isSearchingEntregas = ref(false);
const entregaSearchQuery = ref('');

const currentSessionUserId = ref('');
const currentUserRole = ref('logistica');

const isAdminViewingOtherDraft = computed(() => {
  return currentUserRole.value === 'admin' && !!informe.responsable_user_id && informe.responsable_user_id !== currentSessionUserId.value;
});
const adminEditEnabled = ref(false);

const toggleAdminEdit = () => {
  adminEditEnabled.value = !adminEditEnabled.value;
  if (adminEditEnabled.value) {
    toast.warning('Edición administrativa habilitada. Tené precaución al modificar datos del operario.');
  } else {
    toast.info('Modo supervisión activado (Solo Lectura).');
  }
};

// Logger estructurado para auditoría temporal de ciclos de vida y guardados
const logDraftTrace = (action, details = {}) => {
  const trace = {
    action,
    timestamp: new Date().toISOString(),
    stateSource: stateSource.value,
    hydrationState: hydrationState.value,
    informe_id: informe.id,
    baseVersion: baseVersion.value,
    remoteVersion: remoteVersion.value,
    movimientosCount: movimientos.value.length,
    saveTriggerReason: saveTriggerReason.value,
    ...details
  };
  console.log(`%c[Logística Draft Trace] ${action}`, 'color: #0284c7; font-weight: bold;', trace);
};

const enviadoExistente = ref(null);
const movimientoFilter = ref('todos');

const handleNewReportClick = () => {
  if (userDrafts.value.length > 0 || informe.id || movimientos.value.length > 0) {
    showDraftOptionsModal.value = true;
  } else {
    startNewCleanReport();
  }
};

const autoSaveStatus = ref('idle'); // 'idle' | 'saving' | 'saved' | 'error'
const lastSaveTime = ref('');

const autoSaveMessage = computed(() => {
  if (hydrationState.value === 'conflict') return 'Pausado por Conflicto';
  if (isAdminViewingOtherDraft.value && !adminEditEnabled.value) return 'Supervisión (Solo Lectura)';
  if (autoSaveStatus.value === 'saving') return 'Sincronizando borrador...';
  if (autoSaveStatus.value === 'saved') return lastSaveTime.value ? `Autoguardado ${lastSaveTime.value}` : 'Autoguardado OK';
  if (autoSaveStatus.value === 'error') return 'Error de sincronización';
  return 'Borrador sin cambios';
});

const todayISO = new Date().toISOString().split('T')[0];

const informe = reactive({
  id: null,
  fecha: todayISO,
  responsable_user_id: '',
  responsable_nombre: '',
  zona: 'Formosa',
  observacion_general: '',
  estado: 'borrador',
  version: 1
});

const movimientos = ref([]);
const userDrafts = ref([]);
const showDraftSelector = ref(false);
const editingIndex = ref(null);

const checkEnviadoForDate = async (fecha) => {
  if (!informe.responsable_user_id || !fecha) {
    enviadoExistente.value = null;
    return;
  }
  try {
    const { data } = await supabase
      .from('logistica_informes_diarios')
      .select('id, fecha, enviado_at')
      .eq('responsable_user_id', informe.responsable_user_id)
      .eq('fecha', fecha)
      .eq('estado', 'enviado')
      .maybeSingle();

    enviadoExistente.value = data || null;
  } catch (err) {
    console.error('Error al verificar informe enviado en la fecha:', err);
  }
};

const moveMovementUp = (idx) => {
  if (idx <= 0) return;
  const temp = movimientos.value[idx];
  movimientos.value[idx] = movimientos.value[idx - 1];
  movimientos.value[idx - 1] = temp;
  if (editingIndex.value === idx) editingIndex.value = idx - 1;
  else if (editingIndex.value === idx - 1) editingIndex.value = idx;
  scheduleAutoSave(1200, 'reorder_movement');
};

const moveMovementDown = (idx) => {
  if (idx < 0 || idx >= movimientos.value.length - 1) return;
  const temp = movimientos.value[idx];
  movimientos.value[idx] = movimientos.value[idx + 1];
  movimientos.value[idx + 1] = temp;
  if (editingIndex.value === idx) editingIndex.value = idx + 1;
  else if (editingIndex.value === idx + 1) editingIndex.value = idx;
  scheduleAutoSave(1200, 'reorder_movement');
};

const filteredMovimientos = computed(() => {
  if (movimientoFilter.value === 'todos') return movimientos.value;
  if (movimientoFilter.value === 'entrega') return movimientos.value.filter(m => m.tipo_movimiento === 'Entrega de cajas');
  if (movimientoFilter.value === 'retiro') return movimientos.value.filter(m => m.tipo_movimiento === 'Retiro de cajas');
  if (movimientoFilter.value === 'incidencia') return movimientos.value.filter(m => m.tipo_movimiento === 'Incidencia');
  if (movimientoFilter.value === 'otros') return movimientos.value.filter(m => !['Entrega de cajas', 'Retiro de cajas', 'Incidencia'].includes(m.tipo_movimiento));
  return movimientos.value;
});

const filterCounts = computed(() => {
  const total = movimientos.value.length;
  const entregas = movimientos.value.filter(m => m.tipo_movimiento === 'Entrega de cajas').length;
  const retiros = movimientos.value.filter(m => m.tipo_movimiento === 'Retiro de cajas').length;
  const incidencias = movimientos.value.filter(m => m.tipo_movimiento === 'Incidencia').length;
  const otros = total - entregas - retiros - incidencias;
  return { total, entregas, retiros, incidencias, otros };
});

// --- RESPALDO Y RECUPERACIÓN LOCAL (localStorage) CON BASE_VERSION Y DELETED_IDS ---
const saveLocalBackup = () => {
  if (loading.value || hydrationState.value !== 'ready' || !informe.responsable_user_id || informe.estado === 'enviado') return;
  if (isAdminViewingOtherDraft.value && !adminEditEnabled.value) return;
  try {
    const backupKey = `logistica_draft_backup_${informe.responsable_user_id}_${informe.fecha}`;
    const payload = {
      informe_id: informe.id,
      baseVersion: baseVersion.value,
      informe: { ...informe },
      movimientos: movimientos.value,
      deletedMovementIds: deletedMovementIds.value,
      updatedAt: Date.now()
    };
    localStorage.setItem(backupKey, JSON.stringify(payload));
    logDraftTrace('saveLocalBackup', { baseVersion: baseVersion.value, count: movimientos.value.length, deletedCount: deletedMovementIds.value.length });
  } catch (err) {
    console.warn('No se pudo escribir el respaldo local:', err);
  }
};

const clearLocalBackup = () => {
  if (!informe.responsable_user_id || !informe.fecha) return;
  try {
    deletedMovementIds.value = [];
    const backupKey = `logistica_draft_backup_${informe.responsable_user_id}_${informe.fecha}`;
    localStorage.removeItem(backupKey);
    logDraftTrace('clearLocalBackup', { key: backupKey });
  } catch (err) {
    console.warn('Error al limpiar respaldo local:', err);
  }
};

const readLocalBackup = (userId, fecha) => {
  if (!userId || !fecha) return null;
  try {
    const backupKey = `logistica_draft_backup_${userId}_${fecha}`;
    const raw = localStorage.getItem(backupKey);
    if (!raw) return null;
    const backup = JSON.parse(raw);
    if (!backup || !Array.isArray(backup.movimientos)) return null;
    if (backup.deletedMovementIds && Array.isArray(backup.deletedMovementIds)) {
      deletedMovementIds.value = [...backup.deletedMovementIds];
    }
    return backup;
  } catch (err) {
    console.warn('Error al leer respaldo local:', err);
    return null;
  }
};

// Resoluciones de conflicto por el usuario
const resolveConflictKeepRemote = () => {
  baseVersion.value = remoteVersion.value || 1;
  conflictData.value = null;
  hydrationState.value = 'ready';
  autoSaveStatus.value = 'saved';
  saveLocalBackup();
  toast.success('Se adoptó la versión del servidor.');
  logDraftTrace('conflict_resolved_keep_remote', { baseVersion: baseVersion.value });
};

const resolveConflictUseLocal = async () => {
  if (!conflictData.value?.local) return;
  const loc = conflictData.value.local;
  movimientos.value = loc.movimientos || [];
  if (loc.informe?.observacion_general) {
    informe.observacion_general = loc.informe.observacion_general;
  }
  conflictData.value = null;
  hydrationState.value = 'ready';
  toast.info('Sincronizando copia local al servidor...');
  logDraftTrace('conflict_resolved_use_local_force');
  await saveDraftInternal(false, 'conflict_override_local', true);
};

const syncPendingLocalBackupNow = async () => {
  clearTimeout(autoSaveTimer);
  logDraftTrace('manual_sync_local_restored_requested', { baseVersion: baseVersion.value });
  const success = await saveDraftInternal(false, 'manual_sync_local_restored');
  if (success) {
    hasPendingLocalSync.value = false;
    stateSource.value = 'remoto';
  }
};

onBeforeRouteLeave(async (to, from, next) => {
  if (informe.estado === 'enviado' || isSending.value || isDeletingDraft.value || (isAdminViewingOtherDraft.value && !adminEditEnabled.value)) {
    next();
    return;
  }

  // 1. Guardar siempre respaldo local de inmediato antes de cualquier delay o red
  saveLocalBackup();
  clearTimeout(autoSaveTimer);

  // 2. Si hay un guardado en curso, esperar un máximo de 1000ms
  let waitCount = 0;
  while (isSavingInternal && waitCount < 10) {
    await new Promise(r => setTimeout(r, 100));
    waitCount++;
  }

  // 3. Si está listo y tiene contenido, sincronizar con límite estricto de 2000ms
  if (hydrationState.value === 'ready' && (movimientos.value.length > 0 || informe.observacion_general.trim())) {
    try {
      const savePromise = saveDraftInternal(true, 'route_leave');
      const timeoutPromise = new Promise(resolve => setTimeout(() => resolve('timeout'), 2000));
      const res = await Promise.race([savePromise, timeoutPromise]);
      if (res === 'timeout') {
        console.warn('onBeforeRouteLeave superó el límite de 2000ms. La navegación continúa conservando el respaldo local intacto.');
        saveLocalBackup();
      }
    } catch (err) {
      console.warn('Sincronización en salida de ruta falló o fue interrumpida:', err);
      saveLocalBackup();
    }
  }
  next();
});

const handleVisibilityChange = () => {
  if (document.visibilityState === 'hidden') {
    saveLocalBackup();
    if (!loading.value && hydrationState.value === 'ready' && informe.responsable_user_id && informe.estado !== 'enviado') {
      if (!isAdminViewingOtherDraft.value || adminEditEnabled.value) {
        if (movimientos.value.length > 0 || informe.observacion_general.trim()) {
          saveDraftInternal(true, 'visibility_hidden');
        }
      }
    }
  }
};

const handleBeforeUnload = () => {
  saveLocalBackup();
};

// Mutex Lock y Cola de Concurrencia de Autoguardado
let isSavingInternal = false;
let hasPendingSave = false;
let autoSaveTimer = null;

const scheduleAutoSave = (delayMs = 1200, reason = 'user_mutation') => {
  // Guardia estricta: Autoguardado completamente desactivado durante hidratación o conflicto
  if (loading.value || hydrationState.value !== 'ready' || isSending.value || isDeletingDraft.value || informe.estado === 'enviado' || !informe.responsable_user_id) return;
  if (isAdminViewingOtherDraft.value && !adminEditEnabled.value) return;

  // 1. Respaldo local ultra-rápido en dispositivo (0ms)
  saveLocalBackup();

  // No programar autoguardado de un informe nuevo limpio sin movimientos ni observaciones
  if (!informe.id && movimientos.value.length === 0 && !informe.observacion_general.trim()) return;

  autoSaveStatus.value = 'saving';
  saveTriggerReason.value = reason;
  clearTimeout(autoSaveTimer);
  autoSaveTimer = setTimeout(async () => {
    await saveDraftInternal(true, reason);
  }, delayMs);
};

// Watcher reactivo profundo: solo se activa tras finalizar la hidratación
watch(
  [
    () => informe.fecha,
    () => informe.zona,
    () => informe.observacion_general,
    () => movimientos.value
  ],
  ([newFecha], [oldFecha]) => {
    if (hydrationState.value !== 'ready') return;
    if (newFecha && oldFecha && newFecha !== oldFecha) {
      checkEnviadoForDate(newFecha);
    }
    scheduleAutoSave(1200, 'watcher_mutation');
  },
  { deep: true }
);

const isTipoCollapsed = ref(true);

const tipoChips = [
  { label: 'Entrega de Cajas', value: 'Entrega de cajas' },
  { label: 'Retiro de Cajas', value: 'Retiro de cajas' },
  { label: 'Esterilización', value: 'Esterilización' },
  { label: 'Traslado a Central', value: 'Traslado a Central' },
  { label: 'Documentación', value: 'Documentación' },
  { label: 'Otra Gestión', value: 'Otra gestión' },
  { label: 'Incidencia', value: 'Incidencia' }
];

const searchQuery = ref('');
const searchResults = ref([]);
const searchEntregaResults = ref([]);
const isSearching = ref(false);
const showDropdown = ref(false);
const selectedCirugia = ref(null);

const showManualForm = ref(false);
const manualForm = reactive({
  paciente: '',
  medico: '',
  fecha_cirugia: '',
  institucion: '',
  cliente: ''
});

const builder = reactive({
  tipo_movimiento: 'Entrega de cajas',
  detalle_incidencia_o_gestion: '',
  trasladado_a_central: false,
  cantidad_cajas: 1,
  cantidad_bultos: 1,
  observaciones: '',
  tiene_pendiente: false,
  detalle_pendiente: '',
  movimiento_origen_id: null,
  entrega_origen_info: null
});

const selectTipoMovimiento = (val) => {
  builder.tipo_movimiento = val;
  builder.detalle_incidencia_o_gestion = '';
  if (val !== 'Retiro de cajas') {
    builder.movimiento_origen_id = null;
    builder.entrega_origen_info = null;
    searchEntregaResults.value = [];
  }
  isTipoCollapsed.value = true;
};

// --- MÉTODOS DE BÚSQUEDA Y VINCULACIÓN ENTREGA -> RETIRO ---
let entregaSearchTimeout = null;
const openBuscarEntregasModal = () => {
  showBuscarEntregasModal.value = true;
  entregaSearchQuery.value = '';
  searchEntregasPendientes('');
};

const onEntregaSearchInput = () => {
  clearTimeout(entregaSearchTimeout);
  entregaSearchTimeout = setTimeout(() => {
    searchEntregasPendientes(entregaSearchQuery.value);
  }, 250);
};

const searchEntregasPendientes = async (query = '') => {
  try {
    isSearchingEntregas.value = true;
    const { data, error } = await supabase.rpc('buscar_entregas_para_retiro', {
      p_busqueda: query.trim() || null,
      p_zona: null // Búsqueda amplia sin restringir por zona para encontrar cualquier entrega
    });
    if (error) {
      // Fallback directo sobre logistica_informe_movimientos
      const { data: fbEntregas } = await supabase
        .from('logistica_informe_movimientos')
        .select('id, informe_id, id_cirugia_snapshot, paciente_snapshot, medico_snapshot, institucion_snapshot, cantidad_cajas, cantidad_bultos, trazabilidad_activa, created_at, logistica_informes_diarios(fecha, estado, zona)')
        .eq('tipo_movimiento', 'Entrega de cajas')
        .ilike('paciente_snapshot', `%${query.trim()}%`)
        .limit(20);

      entregasResults.value = (fbEntregas || []).map(e => ({
        id: e.id,
        informe_id: e.informe_id,
        fecha_informe: e.logistica_informes_diarios?.fecha,
        zona_informe: e.logistica_informes_diarios?.zona,
        id_cirugia_snapshot: e.id_cirugia_snapshot,
        paciente_snapshot: e.paciente_snapshot,
        medico_snapshot: e.medico_snapshot,
        institucion_snapshot: e.institucion_snapshot,
        cantidad_cajas_entregadas: e.cantidad_cajas,
        cantidad_bultos_entregados: e.cantidad_bultos,
        saldo_cajas_pendiente: e.cantidad_cajas,
        saldo_bultos_pendiente: e.cantidad_bultos,
        trazabilidad_activa: e.trazabilidad_activa
      }));
    } else {
      entregasResults.value = data || [];
    }
  } catch (err) {
    console.error('Error al buscar entregas previas:', err);
    toast.error('Error al buscar entregas: ' + (err.message || 'Error inesperado'));
  } finally {
    isSearchingEntregas.value = false;
  }
};

const selectEntregaParaRetiro = (entrega) => {
  if (!entrega) return;
  selectedCirugia.value = {
    id: entrega.reporte_id || null,
    id_cirugia: entrega.id_cirugia_snapshot || 'CX-ENTREGA',
    paciente: entrega.paciente_snapshot || '',
    medico: entrega.medico_snapshot || '',
    institucion: entrega.institucion_snapshot || '',
    cliente: entrega.cliente_snapshot || '',
    fecha_cirugia: entrega.fecha_cirugia_snapshot || null
  };

  builder.movimiento_origen_id = entrega.id;
  builder.entrega_origen_info = {
    id: entrega.id,
    cantidad_cajas: entrega.cantidad_cajas_entregadas || entrega.cantidad_cajas || 1,
    cantidad_bultos: entrega.cantidad_bultos_entregados || entrega.cantidad_bultos || 0,
    saldo_cajas: entrega.saldo_cajas_pendiente,
    saldo_bultos: entrega.saldo_bultos_pendiente,
    fecha: entrega.fecha_informe,
    trazabilidad_activa: entrega.trazabilidad_activa
  };

  if (entrega.trazabilidad_activa && entrega.saldo_cajas_pendiente !== null && entrega.saldo_cajas_pendiente !== undefined) {
    builder.cantidad_cajas = entrega.saldo_cajas_pendiente;
    builder.cantidad_bultos = entrega.saldo_bultos_pendiente ?? 1;
  } else {
    builder.cantidad_cajas = entrega.cantidad_cajas_entregadas || entrega.cantidad_cajas || 1;
    builder.cantidad_bultos = entrega.cantidad_bultos_entregados || entrega.cantidad_bultos || 1;
  }

  if (entrega.observaciones_entrega) {
    builder.observaciones = `[Retiro de entrega: ${entrega.observaciones_entrega}]`;
  }

  showBuscarEntregasModal.value = false;
  showDropdown.value = false;
  searchEntregaResults.value = [];
  toast.success('Datos de la entrega cargados. Ajustá cantidades de cajas/bultos si el retiro es parcial.');
};

const clearEntregaOrigen = () => {
  builder.movimiento_origen_id = null;
  builder.entrega_origen_info = null;
  searchEntregaResults.value = [];
  clearSelectedCirugia();
};

let searchTimeout = null;
const onSearchInput = () => {
  showDropdown.value = true;
  clearTimeout(searchTimeout);
  const query = searchQuery.value.trim();
  if (!query) {
    searchResults.value = [];
    searchEntregaResults.value = [];
    return;
  }

  searchTimeout = setTimeout(async () => {
    try {
      isSearching.value = true;

      // 1. Buscar cirugías programadas (reportes)
      const cirugiaPromise = (async () => {
        try {
          const { data, error } = await supabase.rpc('buscar_cirugias_logistica', { p_busqueda: query });
          if (!error && data) return data;
        } catch (_) {}

        const { data: fbData } = await supabase
          .from('reportes')
          .select('id, id_cirugia, cliente, paciente, medico, lugar_cirugia, fecha_cirugia')
          .or(`paciente.ilike.%${query}%,medico.ilike.%${query}%,cliente.ilike.%${query}%,id_cirugia.ilike.%${query}%`)
          .limit(10);

        return (fbData || []).map(r => ({
          id: r.id,
          id_cirugia: r.id_cirugia,
          cliente: r.cliente,
          paciente: r.paciente,
          medico: r.medico,
          institucion: r.lugar_cirugia,
          fecha_cirugia: r.fecha_cirugia
        }));
      })();

      // 2. Si es Retiro de Cajas, buscar concurrentemente entregas previas para retiro
      const entregasPromise = (async () => {
        if (builder.tipo_movimiento !== 'Retiro de cajas') return [];
        try {
          const { data, error } = await supabase.rpc('buscar_entregas_para_retiro', {
            p_busqueda: query,
            p_zona: null
          });
          if (!error && data && data.length > 0) return data;
        } catch (_) {}

        // Fallback directo sobre entregas de movimientos
        const { data: fbEntregas } = await supabase
          .from('logistica_informe_movimientos')
          .select('id, informe_id, id_cirugia_snapshot, paciente_snapshot, medico_snapshot, institucion_snapshot, cantidad_cajas, cantidad_bultos, trazabilidad_activa, created_at, logistica_informes_diarios(fecha, estado, zona)')
          .eq('tipo_movimiento', 'Entrega de cajas')
          .or(`paciente_snapshot.ilike.%${query}%,medico_snapshot.ilike.%${query}%,id_cirugia_snapshot.ilike.%${query}%,institucion_snapshot.ilike.%${query}%`)
          .limit(10);

        return (fbEntregas || []).map(e => ({
          id: e.id,
          informe_id: e.informe_id,
          fecha_informe: e.logistica_informes_diarios?.fecha,
          zona_informe: e.logistica_informes_diarios?.zona,
          id_cirugia_snapshot: e.id_cirugia_snapshot,
          paciente_snapshot: e.paciente_snapshot,
          medico_snapshot: e.medico_snapshot,
          institucion_snapshot: e.institucion_snapshot,
          cantidad_cajas_entregadas: e.cantidad_cajas,
          cantidad_bultos_entregados: e.cantidad_bultos,
          saldo_cajas_pendiente: e.cantidad_cajas,
          saldo_bultos_pendiente: e.cantidad_bultos,
          trazabilidad_activa: e.trazabilidad_activa
        }));
      })();

      const [cxRes, entRes] = await Promise.all([cirugiaPromise, entregasPromise]);
      searchResults.value = cxRes || [];
      searchEntregaResults.value = entRes || [];
    } catch (err) {
      console.error('Error en búsqueda de paciente:', err);
    } finally {
      isSearching.value = false;
    }
  }, 200);
};

const selectCirugia = (cirugia) => {
  selectedCirugia.value = cirugia;
  searchQuery.value = cirugia.paciente || cirugia.id_cirugia || '';
  showDropdown.value = false;
  showManualForm.value = false;
};

const clearSelectedCirugia = () => {
  selectedCirugia.value = null;
  searchQuery.value = '';
};

const isJornadaCollapsed = ref(true);

const openManualForm = () => {
  showManualForm.value = true;
  if (searchQuery.value.trim()) {
    manualForm.paciente = searchQuery.value.trim();
  }
};

const closeManualForm = () => {
  showManualForm.value = false;
};

const confirmManualForm = () => {
  if (!manualForm.paciente.trim()) {
    toast.error('Por favor ingresa el nombre del paciente.');
    return;
  }
  selectedCirugia.value = {
    id_cirugia: 'CX-MANUAL',
    paciente: manualForm.paciente.trim(),
    medico: manualForm.medico.trim() || null,
    institucion: manualForm.institucion.trim() || null,
    cliente: manualForm.cliente.trim() || null,
    fecha_cirugia: manualForm.fecha_cirugia || null
  };
  showManualForm.value = false;
  toast.success('Cirugía confirmada para el movimiento.');
};

const addMovementToList = () => {
  if ((builder.tipo_movimiento === 'Incidencia' || builder.tipo_movimiento === 'Otra gestión') && !builder.detalle_incidencia_o_gestion.trim()) {
    toast.error(`Ingresa el detalle de la ${builder.tipo_movimiento.toLowerCase()}.`);
    return;
  }

  let pacienteVal = '';
  let medicoVal = '';
  let fechaCirugiaVal = '';
  let institucionVal = '';
  let clienteVal = '';
  let reporteIdVal = null;
  let idCirugiaSnapVal = null;

  if (selectedCirugia.value) {
    pacienteVal = selectedCirugia.value.paciente;
    medicoVal = selectedCirugia.value.medico;
    fechaCirugiaVal = selectedCirugia.value.fecha_cirugia;
    institucionVal = selectedCirugia.value.institucion;
    clienteVal = selectedCirugia.value.cliente;
    reporteIdVal = selectedCirugia.value.id;
    idCirugiaSnapVal = selectedCirugia.value.id_cirugia;
  } else if (showManualForm.value && manualForm.paciente.trim()) {
    pacienteVal = manualForm.paciente.trim();
    medicoVal = manualForm.medico.trim();
    fechaCirugiaVal = manualForm.fecha_cirugia;
    institucionVal = manualForm.institucion.trim();
    clienteVal = manualForm.cliente.trim();
  } else if (searchQuery.value.trim()) {
    pacienteVal = searchQuery.value.trim();
  } else {
    toast.error('Por favor ingresa o busca un paciente o cirugía.');
    return;
  }

  if (builder.tiene_pendiente && !builder.detalle_pendiente.trim()) {
    toast.error('Indique el detalle del pendiente.');
    return;
  }

  let finalObs = builder.observaciones.trim();
  if (builder.tipo_movimiento === 'Retiro de cajas' && builder.trasladado_a_central) {
    finalObs = finalObs 
      ? `[Trasladado a Central en el día] ${finalObs}`
      : `[Trasladado a Central en el día]`;
  }
  if (builder.detalle_incidencia_o_gestion.trim()) {
    finalObs = finalObs 
      ? `[${builder.tipo_movimiento}: ${builder.detalle_incidencia_o_gestion.trim()}] ${finalObs}`
      : `[${builder.tipo_movimiento}: ${builder.detalle_incidencia_o_gestion.trim()}]`;
  }

  const movementId = (editingIndex.value !== null && movimientos.value[editingIndex.value]?.id)
    ? movimientos.value[editingIndex.value].id
    : crypto.randomUUID();

  const movItem = {
    id: movementId,
    tempId: movementId,
    movimiento_origen_id: (builder.tipo_movimiento === 'Retiro de cajas' && builder.movimiento_origen_id) ? builder.movimiento_origen_id : null,
    entrega_origen_info: (builder.tipo_movimiento === 'Retiro de cajas' && builder.entrega_origen_info) ? { ...builder.entrega_origen_info } : null,
    tipo_movimiento: builder.tipo_movimiento,
    reporte_id: reporteIdVal,
    id_cirugia_snapshot: idCirugiaSnapVal,
    cliente_snapshot: clienteVal || null,
    paciente_snapshot: pacienteVal,
    medico_snapshot: medicoVal || null,
    institucion_snapshot: institucionVal || null,
    fecha_cirugia_snapshot: fechaCirugiaVal || null,
    destino: (builder.tipo_movimiento === 'Retiro de cajas' && builder.trasladado_a_central) ? 'Central' : pacienteVal,
    cantidad_cajas: builder.cantidad_cajas || 0,
    cantidad_bultos: builder.cantidad_bultos || 0,
    observaciones: finalObs || null,
    tiene_pendiente: builder.tiene_pendiente,
    cantidad_pendiente: builder.tiene_pendiente ? 1 : 0,
    detalle_pendiente: builder.tiene_pendiente ? builder.detalle_pendiente.trim() : null
  };

  if (editingIndex.value !== null) {
    movimientos.value[editingIndex.value] = movItem;
    toast.success(`Modificado: ${movItem.tipo_movimiento}`);
    editingIndex.value = null;
  } else {
    movimientos.value.push(movItem);
    toast.success(`Añadido: ${movItem.tipo_movimiento}`);
  }

  clearSelectedCirugia();
  showManualForm.value = false;
  Object.assign(manualForm, { paciente: '', medico: '', fecha_cirugia: '', institucion: '', cliente: '' });
  builder.cantidad_cajas = 1;
  builder.cantidad_bultos = 1;
  builder.observaciones = '';
  builder.detalle_incidencia_o_gestion = '';
  builder.trasladado_a_central = false;
  builder.tiene_pendiente = false;
  builder.detalle_pendiente = '';
  builder.movimiento_origen_id = null;
  builder.entrega_origen_info = null;

  scheduleAutoSave(1200, 'add_movement');
};

const editMovement = (index) => {
  const mov = movimientos.value[index];
  if (!mov) return;

  editingIndex.value = index;
  builder.tipo_movimiento = mov.tipo_movimiento || 'Entrega de cajas';
  builder.cantidad_cajas = mov.cantidad_cajas || 0;
  builder.cantidad_bultos = mov.cantidad_bultos || 0;
  builder.observaciones = mov.observaciones || '';
  builder.tiene_pendiente = !!mov.tiene_pendiente;
  builder.detalle_pendiente = mov.detalle_pendiente || '';
  builder.movimiento_origen_id = mov.movimiento_origen_id || null;
  builder.entrega_origen_info = mov.entrega_origen_info || null;

  if (mov.reporte_id || mov.id_cirugia_snapshot) {
    selectedCirugia.value = {
      id: mov.reporte_id,
      id_cirugia: mov.id_cirugia_snapshot,
      paciente: mov.paciente_snapshot,
      medico: mov.medico_snapshot,
      institucion: mov.institucion_snapshot,
      cliente: mov.cliente_snapshot
    };
  } else if (mov.paciente_snapshot) {
    searchQuery.value = mov.paciente_snapshot;
  }

  window.scrollTo({ top: 180, behavior: 'smooth' });
};

const cancelEditMovement = () => {
  editingIndex.value = null;
  clearSelectedCirugia();
  builder.cantidad_cajas = 1;
  builder.cantidad_bultos = 1;
  builder.observaciones = '';
  builder.detalle_incidencia_o_gestion = '';
  builder.tiene_pendiente = false;
  builder.detalle_pendiente = '';
  builder.movimiento_origen_id = null;
  builder.entrega_origen_info = null;
};

const deleteMovimiento = (index) => {
  if (editingIndex.value === index) {
    cancelEditMovement();
  }
  const mov = movimientos.value[index];
  if (mov && mov.id) {
    if (!deletedMovementIds.value.includes(mov.id)) {
      deletedMovementIds.value.push(mov.id);
    }
  }
  movimientos.value.splice(index, 1);
  saveLocalBackup();
  scheduleAutoSave(1200, 'delete_movement');
};

const summaryStats = computed(() => ({
  totalMovimientos: movimientos.value.length,
  totalCajas: movimientos.value.reduce((sum, m) => sum + (m.cantidad_cajas || 0), 0),
  totalBultos: movimientos.value.reduce((sum, m) => sum + (m.cantidad_bultos || 0), 0),
  totalPendientes: movimientos.value.filter(m => m.tiene_pendiente).length
}));

const toggleShowDraftSelector = () => {
  showDraftSelector.value = !showDraftSelector.value;
};

const fetchUserDrafts = async (userId) => {
  if (!userId) return;
  try {
    const { data: rawDrafts } = await supabase
      .from('logistica_informes_diarios')
      .select('id, fecha, zona, observacion_general, version, created_at, updated_at')
      .eq('responsable_user_id', userId)
      .eq('estado', 'borrador')
      .order('created_at', { ascending: false });

    if (!rawDrafts || rawDrafts.length === 0) {
      userDrafts.value = [];
      return;
    }

    const activeDrafts = [];
    for (const draft of rawDrafts) {
      const { count } = await supabase
        .from('logistica_informe_movimientos')
        .select('id', { count: 'exact', head: true })
        .eq('informe_id', draft.id);

      const hasMovs = (count || 0) > 0;
      const hasObs = draft.observacion_general && draft.observacion_general.trim().length > 0;

      if (hasMovs || hasObs) {
        activeDrafts.push(draft);
      }
    }

    userDrafts.value = activeDrafts;
  } catch (err) {
    console.error('Error al obtener borradores activos:', err);
  }
};

const loadDraftData = async (draftId) => {
  clearTimeout(autoSaveTimer);
  const { data: existing, error } = await supabase
    .from('logistica_informes_diarios')
    .select('*')
    .eq('id', draftId)
    .single();

  if (error || !existing) throw new Error('No se encontró el borrador especificado.');

  Object.assign(informe, existing);
  informe.version = existing.version || 1;
  baseVersion.value = existing.version || 1;
  remoteVersion.value = existing.version || 1;

  const { data: movs } = await supabase
    .from('logistica_informe_movimientos')
    .select('*')
    .eq('informe_id', existing.id)
    .order('orden', { ascending: true });

  movimientos.value = (movs || []).map(m => ({
    ...m,
    id: m.id,
    tempId: m.id
  }));
  autoSaveStatus.value = 'saved';
  stateSource.value = 'remoto';
  hasPendingLocalSync.value = false;
  hydrationState.value = 'ready';

  if (!isAdminViewingOtherDraft.value || adminEditEnabled.value) {
    saveLocalBackup();
  }
  logDraftTrace('loadDraftData_completed', { version: baseVersion.value, count: movimientos.value.length });
};

const switchDraft = async (draftId) => {
  if (informe.id === draftId) return;
  try {
    loading.value = true;
    hydrationState.value = 'hydrating';
    editingIndex.value = null;
    await loadDraftData(draftId);
    toast.info('Borrador cargado correctamente.');
    showDraftSelector.value = false;
  } catch (err) {
    toast.error('Error al cambiar de borrador: ' + err.message);
  } finally {
    loading.value = false;
  }
};

const startNewCleanReport = () => {
  clearTimeout(autoSaveTimer);
  clearLocalBackup();
  editingIndex.value = null;
  informe.id = null;
  informe.fecha = todayISO;
  informe.observacion_general = '';
  informe.zona = 'Formosa';
  informe.estado = 'borrador';
  informe.version = 1;
  baseVersion.value = 1;
  remoteVersion.value = null;
  movimientos.value = [];
  deletedMovementIds.value = [];
  autoSaveStatus.value = 'idle';
  stateSource.value = 'nuevo';
  hasPendingLocalSync.value = false;
  hydrationState.value = 'ready';
  conflictData.value = null;
  showDraftSelector.value = false;
  showDraftOptionsModal.value = false;
  clearSelectedCirugia();
  showManualForm.value = false;
  clearTimeout(autoSaveTimer);
  logDraftTrace('startNewCleanReport');
};

const deleteCurrentDraft = async () => {
  if (!informe.id) return;
  try {
    isDeletingDraft.value = true;
    clearTimeout(autoSaveTimer);
    clearLocalBackup();
    const draftIdToDelete = informe.id;

    // 1. Descarte atómico mediante RPC sin requerir escrituras directas sobre tablas
    const { data: rpcRes, error: rpcErr } = await supabase.rpc('descartar_borrador_informe_logistica', {
      p_informe_id: draftIdToDelete
    });

    if (rpcErr) {
      // Fallback transitorio si la RPC no estuviese aún disponible en cache
      console.warn('RPC descartar_borrador_informe_logistica no disponible, intentando fallback:', rpcErr);
      await supabase.from('logistica_informe_movimientos').delete().eq('informe_id', draftIdToDelete);
      await supabase.from('logistica_informes_diarios').delete().eq('id', draftIdToDelete);
    }

    toast.success('Borrador descartado correctamente.');
    showDeleteDraftModal.value = false;
    
    // 2. Actualizar la lista de borradores activos del usuario
    await fetchUserDrafts(informe.responsable_user_id);
    
    // 3. Cambiar al siguiente borrador válido o iniciar un reporte nuevo y limpio
    if (userDrafts.value.length > 0) {
      await loadDraftData(userDrafts.value[0].id);
    } else {
      startNewCleanReport();
    }
  } catch (err) {
    toast.error('Error al descartar el borrador: ' + (err.message || 'Error inesperado'));
  } finally {
    isDeletingDraft.value = false;
  }
};

// Reconciliación de identidad para respaldos antiguos con el servidor
const isValidUUID = (val) => {
  return typeof val === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(val);
};

// Reconciliación estricta de identidad para respaldos antiguos
// Reglas:
// 1. Conserva incondicionalmente todo UUID válido existente.
// 2. Prohibido vincular por índice de array.
// 3. Prohibido vincular por coincidencia de campos ausentes/nulos iguales.
// 4. Prohibido vincular únicamente por (paciente + tipo).
// 5. Permite vincular ítems sin UUID únicamente si existe un identificador estructural fuerte e inequívoco (reporte_id o id_cirugia_snapshot no genérico con coincidencia 1 a 1 única).
// 6. Si existe ambigüedad (movimientos repetidos, sin código o IDs dudosos), marca hasAmbiguousIdentity = true, protege los datos en memoria y pausa la sincronización para resolución del usuario.
const reconcileLocalWithRemoteMovements = (localMovs = [], remoteMovs = []) => {
  const resolved = [];
  const remoteUsedIds = new Set();
  const localSeenIds = new Set();
  let hasAmbiguity = false;

  for (let i = 0; i < localMovs.length; i++) {
    const loc = localMovs[i];

    // Regla 1: Conservar UUID válido existente verificando ausencia de duplicación interna
    if (isValidUUID(loc.id)) {
      if (localSeenIds.has(loc.id)) {
        // UUID duplicado detectado en el respaldo local: generar nuevo UUID y marcar ambigüedad
        hasAmbiguity = true;
        const freshId = crypto.randomUUID();
        resolved.push({
          ...loc,
          id: freshId,
          tempId: freshId
        });
        continue;
      }
      localSeenIds.add(loc.id);
      const matchedRemote = remoteMovs.find(r => r.id === loc.id);
      if (matchedRemote) {
        remoteUsedIds.add(matchedRemote.id);
      }
      resolved.push({
        ...loc,
        id: loc.id,
        tempId: loc.id
      });
      continue;
    }

    // Si no tiene UUID válido:
    // Buscar si existe un identificador estructural fuerte e inequívoco
    const hasUniqueReporteId = loc.reporte_id && Number(loc.reporte_id) > 0;
    const hasUniqueCirugiaCode = loc.id_cirugia_snapshot && 
      typeof loc.id_cirugia_snapshot === 'string' && 
      loc.id_cirugia_snapshot.trim() !== '' && 
      loc.id_cirugia_snapshot !== 'CX-MANUAL' && 
      loc.id_cirugia_snapshot !== 'CX-ENTREGA';

    let matchedRemote = null;

    if (hasUniqueReporteId || hasUniqueCirugiaCode) {
      const candidates = remoteMovs.filter(r => {
        if (remoteUsedIds.has(r.id)) return false;
        if (hasUniqueReporteId && r.reporte_id && Number(r.reporte_id) === Number(loc.reporte_id)) return true;
        if (hasUniqueCirugiaCode && r.id_cirugia_snapshot && r.id_cirugia_snapshot.trim() === loc.id_cirugia_snapshot.trim()) return true;
        return false;
      });

      const localDuplicates = localMovs.filter(l => {
        if (hasUniqueReporteId && l.reporte_id && Number(l.reporte_id) === Number(loc.reporte_id)) return true;
        if (hasUniqueCirugiaCode && l.id_cirugia_snapshot && l.id_cirugia_snapshot.trim() === loc.id_cirugia_snapshot.trim()) return true;
        return false;
      });

      // Solo vincular si la correspondencia es 1 a 1 inequívoca y del mismo tipo de movimiento
      if (candidates.length === 1 && localDuplicates.length === 1 && candidates[0].tipo_movimiento === loc.tipo_movimiento) {
        matchedRemote = candidates[0];
      } else if (candidates.length > 1 || localDuplicates.length > 1) {
        // Múltiples movimientos distintos de una misma cirugía: NO vincular a ciegas, proteger y pausar
        hasAmbiguity = true;
      }
    }

    if (matchedRemote) {
      remoteUsedIds.add(matchedRemote.id);
      resolved.push({
        ...loc,
        id: matchedRemote.id,
        tempId: matchedRemote.id
      });
    } else {
      if (remoteMovs.length > 0) {
        hasAmbiguity = true;
      }
      const stableId = crypto.randomUUID();
      resolved.push({
        ...loc,
        id: stableId,
        tempId: stableId
      });
    }
  }

  return {
    movimientos: resolved,
    hasAmbiguousIdentity: hasAmbiguity
  };
};

onMounted(async () => {
  try {
    loading.value = true;
    hydrationState.value = 'hydrating';
    window.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);

    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return;

    currentSessionUserId.value = session.user.id;
    currentUserRole.value = session.user.app_metadata?.role || session.user.user_metadata?.role || 'logistica';

    informe.responsable_user_id = session.user.id;
    informe.responsable_nombre = session.user.user_metadata?.nombre_completo 
      || session.user.user_metadata?.nombre 
      || session.user.email?.split('@')[0] 
      || 'Usuario Logística';

    if (session.user.user_metadata?.zona) {
      informe.zona = session.user.user_metadata.zona;
    }

    await fetchUserDrafts(session.user.id);

    const targetInformeId = route.params.id || route.query.id;
    const isExplicitNew = route.query.mode === 'new';

    let draftToLoadId = null;
    if (targetInformeId) {
      draftToLoadId = targetInformeId;
    } else if (!isExplicitNew && userDrafts.value.length > 0) {
      draftToLoadId = userDrafts.value[0].id;
    }

    let remoteDraft = null;
    let remoteMovs = [];

    if (draftToLoadId) {
      const { data: existing, error } = await supabase
        .from('logistica_informes_diarios')
        .select('*')
        .eq('id', draftToLoadId)
        .maybeSingle();

      if (existing && !error) {
        remoteDraft = existing;
        const { data: movs } = await supabase
          .from('logistica_informe_movimientos')
          .select('*')
          .eq('informe_id', existing.id)
          .order('orden', { ascending: true });
        remoteMovs = (movs || []).map(m => ({ ...m, tempId: m.id, id: m.id }));
      }
    }

    // Leer respaldo local
    const localBackup = (!isAdminViewingOtherDraft.value && !isExplicitNew)
      ? readLocalBackup(session.user.id, remoteDraft?.fecha || informe.fecha)
      : null;

    logDraftTrace('hydration_inspecting', {
      hasRemote: !!remoteDraft,
      remoteVersion: remoteDraft?.version,
      hasLocal: !!localBackup,
      localBaseVersion: localBackup?.baseVersion
    });

    // --- ÁRBOL DE DECISIÓN DE HIDRATACIÓN ---
    if (!remoteDraft && !localBackup) {
      // Caso 1: Nuevo borrador limpio
      stateSource.value = 'nuevo';
      baseVersion.value = 1;
      remoteVersion.value = null;
      hydrationState.value = 'ready';
      logDraftTrace('hydration_resolved', { resolution: 'nuevo_limpio' });
    } else if (remoteDraft && !localBackup) {
      // Caso 2: Solo servidor remoto
      Object.assign(informe, remoteDraft);
      informe.version = remoteDraft.version || 1;
      baseVersion.value = remoteDraft.version || 1;
      remoteVersion.value = remoteDraft.version || 1;
      movimientos.value = remoteMovs;
      stateSource.value = 'remoto';
      autoSaveStatus.value = 'saved';
      hydrationState.value = 'ready';
      saveLocalBackup();
      logDraftTrace('hydration_resolved', { resolution: 'solo_remoto' });
    } else if (!remoteDraft && localBackup) {
      // Caso 3: Respaldo local huérfano sin registro en servidor
      if (localBackup.movimientos.length > 0 || localBackup.informe?.observacion_general?.trim()) {
        const reconResult = reconcileLocalWithRemoteMovements(localBackup.movimientos, []);
        movimientos.value = reconResult.movimientos;
        if (localBackup.informe?.observacion_general) {
          informe.observacion_general = localBackup.informe.observacion_general;
        }
        if (localBackup.informe?.zona) {
          informe.zona = localBackup.informe.zona;
        }
        baseVersion.value = localBackup.baseVersion || 1;
        remoteVersion.value = null;
        stateSource.value = 'local_restored';
        hasPendingLocalSync.value = true;
        autoSaveStatus.value = 'saved';
        lastSaveTime.value = 'Dispositivo';
        hydrationState.value = 'ready';
        toast.info('📁 Se restauró tu borrador no sincronizado desde este dispositivo.', { timeout: 3500 });
        logDraftTrace('hydration_resolved', { resolution: 'local_huerfano' });
      } else {
        stateSource.value = 'nuevo';
        hasPendingLocalSync.value = false;
        baseVersion.value = 1;
        remoteVersion.value = null;
        hydrationState.value = 'ready';
      }
    } else {
      // Caso 4: Existen ambos (Remoto y Local)
      const remVer = remoteDraft.version || 1;
      const locVer = localBackup.baseVersion || 1;
      remoteVersion.value = remVer;

      if (locVer === remVer) {
        const dbTime = remoteDraft.updated_at ? new Date(remoteDraft.updated_at).getTime() : 0;
        const locTime = localBackup.updatedAt || 0;

        if (locTime > dbTime + 3000 && localBackup.movimientos.length >= remoteMovs.length) {
          Object.assign(informe, remoteDraft);
          const reconResult = reconcileLocalWithRemoteMovements(localBackup.movimientos, remoteMovs);
          movimientos.value = reconResult.movimientos;

          if (localBackup.informe?.observacion_general) {
            informe.observacion_general = localBackup.informe.observacion_general;
          }
          baseVersion.value = locVer;
          stateSource.value = 'local_restored';

          if (reconResult.hasAmbiguousIdentity) {
            hasPendingLocalSync.value = false;
            hydrationState.value = 'conflict';
            conflictData.value = { local: localBackup, remote: remoteDraft, reason: 'ambiguous_identity' };
            autoSaveStatus.value = 'error';
            toast.warning('⚠️ Identidad de movimientos ambigua en el respaldo local. Autoguardado pausado para evitar duplicados.', { timeout: 8000 });
            logDraftTrace('hydration_resolved', { resolution: 'local_ambiguous_paused' });
          } else {
            hasPendingLocalSync.value = true;
            autoSaveStatus.value = 'saved';
            lastSaveTime.value = 'Dispositivo';
            hydrationState.value = 'ready';
            toast.info('📁 Se restauraron cambios locales pendientes de sincronizar.', { timeout: 3500 });
            logDraftTrace('hydration_resolved', { resolution: 'local_mismo_version_mas_reciente' });
          }
        } else {
          Object.assign(informe, remoteDraft);
          movimientos.value = remoteMovs;
          baseVersion.value = remVer;
          stateSource.value = 'remoto';
          hasPendingLocalSync.value = false;
          autoSaveStatus.value = 'saved';
          hydrationState.value = 'ready';
          saveLocalBackup();
          logDraftTrace('hydration_resolved', { resolution: 'remoto_prevalece' });
        }
      } else {
        // Conflicto de versiones: el servidor avanzó o el local quedó en una versión vieja
        Object.assign(informe, remoteDraft);
        movimientos.value = remoteMovs;
        baseVersion.value = locVer;
        remoteVersion.value = remVer;
        stateSource.value = 'remoto';
        hasPendingLocalSync.value = false;
        hydrationState.value = 'conflict';
        conflictData.value = { local: localBackup, remote: remoteDraft };
        logDraftTrace('hydration_conflict_detected', { localVersion: locVer, remoteVersion: remVer });
      }
    }

    await checkEnviadoForDate(informe.fecha);

    // Si se restauró una copia local más reciente y no hay conflicto de ambigüedad, realizar intento controlado
    if (stateSource.value === 'local_restored' && hydrationState.value === 'ready' && (!isAdminViewingOtherDraft.value || adminEditEnabled.value)) {
      logDraftTrace('hydration_controlled_sync_attempt', { baseVersion: baseVersion.value });
      try {
        const synced = await saveDraftInternal(true, 'hydration_local_restored_sync');
        if (synced) {
          hasPendingLocalSync.value = false;
          stateSource.value = 'remoto';
        }
      } catch (syncErr) {
        console.warn('Intento controlado de sincronización post-hidratación:', syncErr);
      }
    }
  } catch (err) {
    toast.error('Error al inicializar el informe: ' + err.message);
  } finally {
    loading.value = false;
  }
});

onUnmounted(() => {
  clearTimeout(autoSaveTimer);
  window.removeEventListener('visibilitychange', handleVisibilityChange);
  window.removeEventListener('beforeunload', handleBeforeUnload);
  saveLocalBackup();
});

// Guardado seguro con bloqueo mutex, cola de reintento, respaldo local y RPC atómica
const saveDraftInternal = async (isSilent = false, reason = 'user_mutation', forceOverride = false) => {
  // Guardia estricta: No guardar si la hidratación no está lista o si hay conflicto activo
  if (hydrationState.value !== 'ready') {
    logDraftTrace('saveDraftInternal_aborted_not_ready', { hydrationState: hydrationState.value, reason });
    if (!isSilent) {
      toast.warning('Hay un conflicto de versión o sincronización pendiente. Resolvé el estado antes de guardar.');
    }
    return false;
  }
  if (!informe.responsable_user_id) return false;
  if (isAdminViewingOtherDraft.value && !adminEditEnabled.value) return false;

  // Nunca sincronizar un estado vacío inicial sin ID, sin movimientos y sin observaciones
  if (!informe.id && movimientos.value.length === 0 && !informe.observacion_general.trim()) {
    logDraftTrace('saveDraftInternal_aborted_empty_state', { reason });
    return false;
  }

  if (isSavingInternal) {
    hasPendingSave = true;
    return true;
  }

  try {
    isSavingInternal = true;
    isSaving.value = true;
    autoSaveStatus.value = 'saving';
    saveTriggerReason.value = reason;
    saveLocalBackup();

    logDraftTrace('saveDraftInternal_invoking_rpc', {
      reason,
      p_expected_version: forceOverride ? null : baseVersion.value,
      movimientosCount: movimientos.value.length
    });

    const validDbTipos = [
      'Entrega de cajas',
      'Retiro de cajas',
      'Esterilización',
      'Devolución de implantes',
      'Entrega o retiro de documentación',
      'Traslado interno',
      'Traslado a Central',
      'Otra gestión',
      'Incidencia'
    ];

    const deletedIdsToSend = [...deletedMovementIds.value];

    const movimientosPayload = movimientos.value.map((m, idx) => {
      let rawTipo = m.tipo_movimiento || 'Otra gestión';
      let safeTipo = validDbTipos.includes(rawTipo) ? rawTipo : 'Otra gestión';
      let safeObs = m.observaciones || '';

      if (!validDbTipos.includes(rawTipo)) {
        if (!safeObs.includes(`[${rawTipo}]`)) {
          safeObs = safeObs ? `[${rawTipo}] ${safeObs}` : `[${rawTipo}]`;
        }
      }

      const stableId = (m.id && typeof m.id === 'string' && m.id.length > 20) ? m.id : crypto.randomUUID();
      m.id = stableId;
      m.tempId = stableId;

      return {
        id: stableId,
        movimiento_origen_id: (m.tipo_movimiento === 'Retiro de cajas' && m.movimiento_origen_id) ? m.movimiento_origen_id : null,
        reporte_id: (m.reporte_id && String(m.reporte_id).trim() !== '') ? m.reporte_id : null,
        id_cirugia_snapshot: (m.id_cirugia_snapshot && String(m.id_cirugia_snapshot).trim() !== '') ? m.id_cirugia_snapshot : null,
        cliente_snapshot: (m.cliente_snapshot && String(m.cliente_snapshot).trim() !== '') ? m.cliente_snapshot : null,
        tipo_movimiento: safeTipo,
        paciente_snapshot: m.paciente_snapshot || 'Sin especificar',
        medico_snapshot: (m.medico_snapshot && String(m.medico_snapshot).trim() !== '') ? m.medico_snapshot : null,
        institucion_snapshot: (m.institucion_snapshot && String(m.institucion_snapshot).trim() !== '') ? m.institucion_snapshot : null,
        fecha_cirugia_snapshot: (m.fecha_cirugia_snapshot && String(m.fecha_cirugia_snapshot).trim() !== '') ? m.fecha_cirugia_snapshot : null,
        destino: m.destino || m.paciente_snapshot || 'Central',
        cantidad_cajas: Number(m.cantidad_cajas) || 0,
        cantidad_bultos: Number(m.cantidad_bultos) || 0,
        resultado: m.resultado || null,
        tiene_pendiente: !!m.tiene_pendiente,
        cantidad_pendiente: m.tiene_pendiente ? 1 : 0,
        detalle_pendiente: m.tiene_pendiente ? (m.detalle_pendiente || null) : null,
        motivo_pendiente: m.motivo_pendiente || null,
        observaciones: safeObs || null,
        orden: idx
      };
    });

    const { data: result, error: rpcErr } = await supabase.rpc('guardar_borrador_informe_logistica', {
      p_informe_id: informe.id || null,
      p_fecha: informe.fecha,
      p_responsable_user_id: informe.responsable_user_id,
      p_responsable_nombre: informe.responsable_nombre,
      p_zona: informe.zona || 'Formosa',
      p_observacion_general: informe.observacion_general || null,
      p_movimientos: movimientosPayload,
      p_expected_version: forceOverride ? null : (baseVersion.value || null),
      p_deleted_movement_ids: deletedIdsToSend
    });

    if (rpcErr) throw rpcErr;

    if (result) {
      if (result.conflict) {
        autoSaveStatus.value = 'error';
        hydrationState.value = 'conflict';
        remoteVersion.value = result.current_version;
        conflictData.value = { remoteVersion: result.current_version };
        toast.error(`⚠️ Conflicto: Este borrador fue modificado en otra sesión (Servidor en v${result.current_version}). Autoguardado pausado.`, { timeout: 7000 });
        logDraftTrace('saveDraftInternal_conflict_returned', { current_version: result.current_version });
        return false;
      }
      if (!result.success) {
        throw new Error(result.error || 'Error al guardar borrador');
      }

      informe.id = result.informe_id;
      informe.version = result.version;
      baseVersion.value = result.version;
      remoteVersion.value = result.version;
      hasPendingLocalSync.value = false;
      stateSource.value = 'remoto';

      // Retirar de la cola ÚNICAMENTE los IDs confirmados en esta solicitud
      deletedMovementIds.value = deletedMovementIds.value.filter(id => !deletedIdsToSend.includes(id));
      saveLocalBackup();
      logDraftTrace('saveDraftInternal_success', { version: result.version });
    }

    await fetchUserDrafts(informe.responsable_user_id);

    if (isSilent) {
      toast.info(`✓ Borrador sincronizado (v${baseVersion.value || 1})`, { timeout: 1500 });
    } else {
      toast.success('Borrador guardado exitosamente.');
    }
    autoSaveStatus.value = 'saved';
    const now = new Date();
    lastSaveTime.value = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    return true;
  } catch (err) {
    if (!isSilent) {
      toast.error('Error al guardar borrador: ' + (err.message || 'Error inesperado'));
    }
    autoSaveStatus.value = 'error';
    logDraftTrace('saveDraftInternal_error', { error: err.message });
    return false;
  } finally {
    isSaving.value = false;
    isSavingInternal = false;
    if (hasPendingSave) {
      hasPendingSave = false;
      scheduleAutoSave(300, 'pending_queue');
    }
  }
};

const saveDraftManual = async () => {
  clearTimeout(autoSaveTimer);
  if (hydrationState.value === 'conflict') {
    toast.error('No se puede guardar: hay un conflicto de concurrencia pendiente de resolver.');
    return;
  }
  await saveDraftInternal(false, 'manual_click');
};

const openResumenModal = async () => {
  if (hydrationState.value === 'conflict') {
    toast.error('Hay un conflicto de concurrencia activo. Seleccioná una versión antes de continuar.');
    return;
  }
  if (editingIndex.value !== null) {
    toast.error(`Estás editando el movimiento #${editingIndex.value + 1}. Guardá o cancelá los cambios antes de finalizar.`);
    return;
  }
  if (movimientos.value.length === 0) {
    toast.error('Cargá al menos un movimiento antes de finalizar el informe diario.');
    return;
  }
  const movIncompleto = movimientos.value.find(m => m.tiene_pendiente && (!m.detalle_pendiente || !m.detalle_pendiente.trim()));
  if (movIncompleto) {
    toast.error(`Ingresá el detalle del pendiente declarado para: ${movIncompleto.paciente_snapshot || movIncompleto.tipo_movimiento}.`);
    return;
  }

  clearTimeout(autoSaveTimer);
  const saved = await saveDraftInternal(true, 'open_resumen_modal');
  if (saved && informe.id) {
    showResumenModal.value = true;
  }
};

const submitInformeFinal = async () => {
  try {
    clearTimeout(autoSaveTimer);
    isSending.value = true;

    // Asegurar que la versión más reciente quede guardada
    const saved = await saveDraftInternal(true, 'submit_final_check');
    if (!saved || !informe.id) {
      throw new Error('No se pudo verificar el borrador en la base de datos antes de enviar.');
    }

    const { error } = await supabase.rpc('enviar_informe_logistica', {
      p_informe_id: informe.id
    });

    if (error) throw error;

    toast.success('¡Informe diario guardado y enviado exitosamente!');
    clearLocalBackup();
    showResumenModal.value = false;
    router.replace({ name: 'LogisticaDetalleInforme', params: { id: informe.id } });
  } catch (err) {
    toast.error('Error al enviar el informe: ' + (err.message || err.details || 'Compruebe los movimientos'));
  } finally {
    isSending.value = false;
  }
};

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
</script>

<style scoped>
.list-enter-active,
.list-leave-active {
  transition: all 0.25s ease;
}
.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}
.animate-fadeIn {
  animation: fadeIn 0.2s ease-out forwards;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-4px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
