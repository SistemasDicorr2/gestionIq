<!-- src/views/ActivitySummaryView.vue -->
<template>
  <div :class="{ 'dark': isDarkMode }">
    <div 
      :class="[
        'relative transition-colors duration-300 bg-slate-200/85 dark:bg-slate-950 text-slate-900 dark:text-slate-100 selection:bg-blue-500/20',
        !isAuthenticated ? 'h-[100dvh] min-h-[100dvh] max-h-[100dvh] overflow-hidden' : 'min-h-screen py-6 sm:py-10 overflow-x-hidden'
      ]"
    >

      <!-- ESTADO 1: PANTALLA DE AUTENTICACIÓN ULTRA-MODERNA Y RESPONSIVA (FIT 100vh) -->
      <div v-if="!isAuthenticated" class="relative min-h-[100dvh] flex flex-col justify-between max-w-lg px-4 sm:px-6 mx-auto py-4 sm:py-6 overflow-y-auto">
        
        <!-- Ambient Animated Mesh & Glow Orbs -->
        <div class="fixed inset-0 pointer-events-none overflow-hidden -z-10">
          <div class="absolute -top-10 -left-10 w-72 h-72 sm:w-96 sm:h-96 bg-blue-500/20 dark:bg-blue-600/15 rounded-full blur-3xl animate-blob"></div>
          <div class="absolute -bottom-10 -right-10 w-72 h-72 sm:w-96 sm:h-96 bg-indigo-500/20 dark:bg-indigo-600/15 rounded-full blur-3xl animate-blob [animation-delay:3s]"></div>
          <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-cyan-500/10 dark:bg-cyan-600/10 rounded-full blur-[100px] animate-blob [animation-delay:5s]"></div>
          <div class="absolute inset-0 bg-[radial-gradient(#94a3b8_1px,transparent_1px)] [background-size:24px_24px] dark:bg-[radial-gradient(#334155_1px,transparent_1px)] opacity-40 dark:opacity-20"></div>
        </div>

        <!-- Top Bar Compacta con Branding y Controles -->
        <header class="flex items-center justify-between gap-3 shrink-0 mb-4 animate-fadeIn">
          <div class="flex items-center gap-2 group">
            <img src="/ISologo  (1).svg" alt="Districorr" class="h-8 sm:h-9 w-auto object-contain transition-transform duration-300 group-hover:scale-105">
            <div class="border-l border-slate-300 dark:border-slate-800 pl-2">
              <span class="block text-[11px] sm:text-xs font-black tracking-wider uppercase text-slate-800 dark:text-slate-200">
                Gestión <span class="text-blue-600 dark:text-blue-400">IQ</span>
              </span>
              <span class="block text-[9px] font-medium text-slate-500 dark:text-slate-400 -mt-0.5">
                Portal Profesional
              </span>
            </div>
          </div>

          <div class="flex items-center gap-2">
            <a 
              href="https://wa.me/5493794007558?text=Hola%20tengo%20un%20inconveniente%20para%20ingresar%20mi%20DNI%20al%20portal." 
              target="_blank" 
              rel="noopener noreferrer"
              class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-slate-300/80 dark:border-slate-800/80 text-xs font-bold text-slate-800 dark:text-slate-200 hover:text-emerald-600 dark:hover:text-emerald-400 hover:border-emerald-500/40 shadow-sm transition-all duration-200 hover:scale-105 active:scale-95"
            >
              <MessageCircle class="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Soporte</span>
            </a>

            <!-- Toggle Modo Oscuro -->
            <button 
              @click="isDarkMode = !isDarkMode" 
              class="p-2 text-slate-800 dark:text-slate-200 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-slate-300/80 dark:border-slate-800/80 shadow-sm hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-all duration-200 hover:scale-105 active:scale-95 focus:outline-none cursor-pointer" 
              :title="isDarkMode ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'"
            >
              <Sun v-if="isDarkMode" class="w-4 h-4 text-amber-400 transition-transform rotate-0 hover:rotate-45" />
              <Moon v-else class="w-4 h-4 text-slate-800 transition-transform rotate-0 hover:-rotate-12" />
            </button>
          </div>
        </header>

        <!-- Centro: Tarjeta Hero de Alta Fidelidad -->
        <main class="my-auto py-2 sm:py-4 w-full flex items-center justify-center">
          <div class="relative w-full max-w-sm sm:max-w-md bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl border border-slate-200/90 dark:border-slate-800/90 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-blue-500/10 dark:shadow-black/60 transition-all duration-300 hover:shadow-blue-500/15 overflow-hidden animate-scale-in">
            
            <!-- Acento Superior de Luz Gradiente -->
            <div class="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-[2px] bg-gradient-to-r from-transparent via-blue-500 to-transparent"></div>
            
            <!-- Resplandor sutil de fondo de la tarjeta -->
            <div class="pointer-events-none absolute -top-20 -right-20 w-44 h-44 rounded-full bg-blue-500/10 dark:bg-blue-600/15 blur-3xl"></div>
            <div class="pointer-events-none absolute -bottom-20 -left-20 w-44 h-44 rounded-full bg-indigo-500/10 dark:bg-indigo-600/15 blur-3xl"></div>

            <!-- Cabecera de la Tarjeta con Logo e Indicador -->
            <div class="text-center relative z-10">
              
              <!-- Badge de Seguridad con Pulso -->
              <div class="inline-flex items-center gap-1.5 px-3 py-1 mb-4 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200/80 dark:border-blue-800/60 text-[11px] font-bold text-blue-700 dark:text-blue-300 shadow-xs">
                <span class="relative flex h-2 w-2">
                  <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span class="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span>Portal Oficial del Instrumentador</span>
              </div>

              <!-- Isologo / Icono Districorr con Halo Luminoso -->
              <div class="relative flex justify-center mb-4">
                <div class="relative group cursor-default">
                  <div class="absolute -inset-1.5 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-2xl blur-md opacity-30 group-hover:opacity-50 transition-opacity duration-300"></div>
                  <div class="relative w-16 h-16 sm:w-18 sm:h-18 rounded-2xl bg-gradient-to-b from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 border border-slate-200 dark:border-slate-700 flex items-center justify-center p-3 shadow-md shadow-blue-500/15 transition-transform duration-300 group-hover:scale-105">
                    <img src="/ISologo  (1).svg" alt="Districorr" class="w-full h-full object-contain">
                  </div>
                </div>
              </div>

              <!-- Título Principal y Bajada -->
              <h1 class="text-2xl sm:text-3xl font-black tracking-tight text-slate-950 dark:text-white">
                Ingreso al Portal
              </h1>
              <p class="mt-2 text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-medium max-w-xs mx-auto leading-relaxed">
                Ingresá tu <strong class="text-slate-900 dark:text-white font-bold">DNI</strong> para acceder al registro de tus cirugías y liquidaciones.
              </p>
            </div>

            <!-- Formulario de Acceso -->
            <form @submit.prevent="authenticate()" class="mt-6 space-y-4 max-w-xs sm:max-w-sm mx-auto relative z-10">
              
              <div>
                <label class="block text-left text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                  Documento Nacional de Identidad
                </label>
                <div class="relative group">
                  <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500 group-focus-within:text-blue-600 dark:group-focus-within:text-blue-400 transition-colors duration-200">
                    <Lock class="w-4 h-4" />
                  </div>
                  <input
                    v-model="dni"
                    type="text"
                    inputmode="numeric"
                    pattern="[0-9]*"
                    required
                    placeholder="Ej: 28202551"
                    class="block w-full pl-10 pr-3.5 py-3 text-base sm:text-lg font-bold tracking-wider bg-slate-50 dark:bg-slate-950/80 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-600 dark:focus:border-blue-400 text-slate-950 dark:text-white placeholder:text-slate-400 placeholder:font-normal placeholder:tracking-normal transition-all duration-200 shadow-inner"
                    autocomplete="off"
                    :disabled="isLoading"
                  />
                </div>
              </div>

              <!-- Botón Shimmer Interactivo con Gradiente -->
              <button 
                type="submit" 
                :disabled="isLoading"
                class="w-full relative inline-flex items-center justify-center py-3.5 px-5 text-sm font-extrabold tracking-wide text-white rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:to-indigo-500 active:scale-[0.98] transition-all duration-200 shadow-lg shadow-blue-600/30 hover:shadow-blue-600/40 disabled:opacity-50 disabled:pointer-events-none cursor-pointer overflow-hidden group"
              >
                <!-- Haz de luz Shimmer -->
                <span class="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent animate-shimmer pointer-events-none"></span>

                <span v-if="isLoading" class="flex items-center justify-center gap-2 relative z-10">
                  <svg class="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Validando acceso...</span>
                </span>
                <span v-else class="flex items-center justify-center gap-2 relative z-10">
                  <span>Ingresar al Portal</span>
                  <ArrowRight class="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
                </span>
              </button>
            </form>

            <!-- Error Banner -->
            <div 
              v-if="error" 
              class="mt-4 p-3 bg-rose-50 dark:bg-rose-950/50 border border-rose-300 dark:border-rose-800/80 rounded-xl flex items-center gap-2.5 text-rose-800 dark:text-rose-200 text-xs text-left animate-shake shadow-xs relative z-10"
            >
              <AlertCircle class="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400" />
              <p class="font-bold leading-tight">{{ error }}</p>
            </div>

            <!-- Footer interno de la tarjeta: Información de privacidad -->
            <div class="mt-6 pt-4 border-t border-slate-200/80 dark:border-slate-800/80 flex items-center justify-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 relative z-10">
              <ShieldCheck class="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
              <span>Conexión segura y privada</span>
            </div>

          </div>
        </main>

        <!-- Footer Institucional -->
        <footer class="py-2 text-center shrink-0 animate-fadeIn">
          <p class="text-[11px] sm:text-xs text-slate-600 dark:text-slate-400 font-medium">
            Districorr • Trazabilidad Quirúrgica — 
            <a 
              href="https://www.districorr.com.ar" 
              target="_blank" 
              rel="noopener noreferrer" 
              class="font-bold text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-0.5 ml-0.5"
            >
              <span>districorr.com.ar</span>
              <ExternalLink class="w-2.5 h-2.5" />
            </a>
          </p>
        </footer>

      </div>

      <!-- ESTADO 2: VISTA DE DATOS CON ALTO CONTRASTE -->
      <div v-else class="max-w-6xl px-4 mx-auto sm:px-6 lg:px-8">
        <header class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <div class="flex items-center gap-2.5 flex-wrap">
              <h1 class="text-2xl font-black sm:text-3xl text-slate-950 dark:text-white tracking-tight">Mi Actividad Profesional</h1>
              <span v-if="instrumentadorInfo?.nombre_completo" class="px-3 py-1 rounded-full text-xs font-black bg-blue-100 dark:bg-blue-900/60 text-blue-900 dark:text-blue-200 border border-blue-300 dark:border-blue-700 shadow-xs">
                {{ instrumentadorInfo.nombre_completo }}
              </span>
            </div>
            <p class="mt-1 text-xs sm:text-sm text-slate-800 dark:text-slate-200 font-bold">
              Consultá tus cirugías registradas, el estado de tus pagos y tus datos personales.
            </p>
          </div>
          
          <!-- Toggle Modo Oscuro -->
          <button 
            @click="isDarkMode = !isDarkMode" 
            class="shrink-0 p-2.5 text-slate-800 bg-white border border-slate-300 shadow-md hover:bg-slate-100 dark:bg-slate-900 dark:text-slate-200 dark:border-slate-700 dark:hover:bg-slate-800 rounded-full transition-all duration-200 hover:scale-105 active:scale-95 focus:outline-none cursor-pointer self-end sm:self-auto" 
            :title="isDarkMode ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'"
          >
            <Sun v-if="isDarkMode" class="w-5 h-5 text-amber-400 transition-transform rotate-0 hover:rotate-45" />
            <Moon v-else class="w-5 h-5 text-slate-900 transition-transform rotate-0 hover:-rotate-12" />
          </button>
        </header>

        <!-- BANNER DE NOTIFICACIONES WEB PUSH Y CORREO EN DISPOSITIVO -->
        <div v-if="pushPermissionStatus !== 'granted'" class="mb-5 p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-blue-600/10 via-indigo-600/10 to-blue-500/10 dark:from-blue-950/40 dark:via-indigo-950/40 dark:to-blue-900/30 border border-blue-200 dark:border-blue-800/80 shadow-sm transition-all duration-300">
          <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
            <div class="flex items-start gap-3">
              <div class="p-2.5 rounded-xl bg-blue-600 text-white shadow-md shadow-blue-500/20 shrink-0">
                <BellRing class="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <h3 class="text-sm font-black text-slate-900 dark:text-white">
                  ¿Querés recibir aviso cuando se cargue un nuevo comprobante?
                </h3>
                <p class="text-xs text-slate-600 dark:text-slate-300 mt-0.5 font-medium">
                  Activá las notificaciones push o por correo y te avisaremos en cuanto tu liquidación esté disponible.
                </p>
              </div>
            </div>
            <button 
              @click="isNotificationModalOpen = true" 
              class="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black text-white bg-blue-600 hover:bg-blue-700 active:scale-95 transition-all duration-200 shadow-md shadow-blue-600/25 cursor-pointer shrink-0"
            >
              <Bell class="w-4 h-4" />
              <span>Configurar avisos</span>
            </button>
          </div>
        </div>

        <div v-else class="mb-5 px-4 py-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-300 text-xs font-bold flex items-center justify-between gap-2 shadow-xs">
          <div class="flex items-center gap-2">
            <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>Avisos de comprobantes activos en este dispositivo</span>
          </div>
          <button 
            @click="isNotificationModalOpen = true" 
            class="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 hover:underline cursor-pointer"
            title="Ajustar preferencias de notificación"
          >
            Ajustar avisos
          </button>
        </div>

        <!-- Tabs de Navegación Estilo Animate UI -->
        <div class="mb-6">
          <nav class="grid grid-cols-4 gap-1 p-1.5 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-300 dark:border-slate-800 rounded-2xl shadow-md sm:flex sm:items-center sm:gap-2 sm:w-fit">
            <button 
              @click="activeTab = 'resumen'"
              :class="[
                'flex flex-col sm:flex-row items-center justify-center gap-1.5 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-black transition-all duration-200 cursor-pointer select-none',
                activeTab === 'resumen' 
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 ring-1 ring-blue-500' 
                  : 'text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-950 dark:hover:text-white'
              ]"
            >
              <Activity class="w-4 h-4 shrink-0" />
              <span>Resumen</span>
            </button>

            <button 
              @click="activeTab = 'pagos'"
              :class="[
                'flex flex-col sm:flex-row items-center justify-center gap-1.5 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-black transition-all duration-200 cursor-pointer select-none',
                activeTab === 'pagos' 
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 ring-1 ring-blue-500' 
                  : 'text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-950 dark:hover:text-white'
              ]"
            >
              <Receipt class="w-4 h-4 shrink-0" />
              <span class="hidden sm:inline">Pagos y Comprobantes</span>
              <span class="sm:hidden">Pagos</span>
            </button>

            <button 
              @click="activeTab = 'datos'"
              :class="[
                'flex flex-col sm:flex-row items-center justify-center gap-1.5 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-black transition-all duration-200 cursor-pointer select-none',
                activeTab === 'datos' 
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 ring-1 ring-blue-500' 
                  : 'text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-950 dark:hover:text-white'
              ]"
            >
              <UserCheck class="w-4 h-4 shrink-0" />
              <span class="hidden sm:inline">Mi Perfil</span>
              <span class="sm:hidden">Perfil</span>
            </button>

            <button 
              @click="activeTab = 'faq'"
              :class="[
                'flex flex-col sm:flex-row items-center justify-center gap-1.5 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-black transition-all duration-200 cursor-pointer select-none',
                activeTab === 'faq' 
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 ring-1 ring-blue-500' 
                  : 'text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-950 dark:hover:text-white'
              ]"
            >
              <HelpCircle class="w-4 h-4 shrink-0" />
              <span class="hidden sm:inline">Preguntas Frecuentes</span>
              <span class="sm:hidden">Ayuda</span>
            </button>
          </nav>
        </div>

        <!-- TAB 1: RESUMEN DE ACTIVIDAD CON ALTO CONTRASTE -->
        <div v-if="activeTab === 'resumen'" class="space-y-6">
          
          <!-- KPIs con Bento GlowCards y SlidingNumbers -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <GlowCard class="p-5 sm:p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-300 dark:border-slate-800 shadow-md" glow-color="rgba(245, 158, 11, 0.15)">
              <div class="flex items-center justify-between">
                <h3 class="text-xs font-black tracking-wider uppercase text-slate-900 dark:text-slate-100">Cirugías pendientes de liquidación</h3>
                <div class="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-950/60 flex items-center justify-center text-amber-800 dark:text-amber-400 border border-amber-300 dark:border-amber-800/80 shadow-xs">
                  <Clock class="w-5 h-5" />
                </div>
              </div>
              <div class="mt-3 flex items-baseline gap-2">
                <span class="text-3xl sm:text-4xl font-black text-slate-950 dark:text-white">
                  <SlidingNumber :value="cirugiasPendientesCount" />
                </span>
                <span class="text-xs font-black text-slate-700 dark:text-slate-300">cirugías</span>
              </div>
            </GlowCard>

            <GlowCard class="p-5 sm:p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-300 dark:border-slate-800 shadow-md" glow-color="rgba(16, 185, 129, 0.15)">
              <div class="flex items-center justify-between">
                <h3 class="text-xs font-black tracking-wider uppercase text-slate-900 dark:text-slate-100">Pagos realizados en el mes en curso</h3>
                <div class="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-800 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800/80 shadow-xs">
                  <CheckCircle2 class="w-5 h-5" />
                </div>
              </div>
              <div class="mt-3 flex items-baseline gap-2">
                <span class="text-3xl sm:text-4xl font-black text-slate-950 dark:text-white">
                  <SlidingNumber :value="cirugiasCobradasMesCount" />
                </span>
                <span class="text-xs font-black text-slate-700 dark:text-slate-300">cirugías abonadas</span>
              </div>
            </GlowCard>
          </div>

          <div class="grid grid-cols-1 gap-6 lg:gap-8 lg:grid-cols-12">
            
            <!-- MAIN BLOCK: Pendientes -->
            <div class="lg:col-span-7">
              <div class="flex items-center justify-between mb-4">
                <h2 class="text-lg sm:text-xl font-black text-slate-950 dark:text-white flex items-center gap-2">
                  <span class="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                  Pendientes de liquidación
                </h2>
                <span v-if="pendientes.length > 0" class="text-xs font-black px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/50 text-amber-900 dark:text-amber-200 border border-amber-200 dark:border-amber-800">
                  {{ pendientes.length }} pendientes
                </span>
              </div>
              
              <div v-if="pendientes.length > 0" class="space-y-4">
                <GlowCard v-for="report in pendientes" :key="report.id" class="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-300 dark:border-slate-800 shadow-sm" glow-color="rgba(245, 158, 11, 0.12)">
                  <div class="flex items-start justify-between gap-4 mb-3">
                    <div>
                      <p class="font-black text-slate-950 dark:text-white text-base">{{ report.paciente || 'No especificado' }}</p>
                      <p class="text-xs text-slate-600 dark:text-slate-400 mt-0.5 flex items-center gap-1.5 font-semibold">
                        <Calendar class="w-3.5 h-3.5 text-slate-500" />
                        {{ report.fecha_cirugia ? formatDate(report.fecha_cirugia) : 'Fecha no disponible' }}
                      </p>
                    </div>
                    <AnimatedBadge variant="warning" dot pulse>
                      Pendiente
                    </AnimatedBadge>
                  </div>

                  <div class="flex items-start gap-2.5 p-3 mt-3 mb-4 text-xs border rounded-xl bg-sky-50 dark:bg-sky-950/40 text-sky-950 dark:text-sky-200 border-sky-300 dark:border-sky-800">
                    <Info class="w-4 h-4 shrink-0 text-sky-700 dark:text-sky-400 mt-0.5" />
                    <p class="leading-relaxed font-semibold">Esta cirugía será incluida en una próxima orden de pago cuando se genere la liquidación correspondiente.</p>
                  </div>

                  <button @click="openDetailModal(report, false)" class="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-black transition-all duration-200 rounded-xl text-slate-800 bg-slate-100 hover:bg-slate-200 focus:outline-none dark:text-slate-100 dark:bg-slate-800 dark:border dark:border-slate-700 dark:hover:bg-slate-700 hover:scale-[1.02] active:scale-[0.98] cursor-pointer">
                    <Eye class="w-3.5 h-3.5" />
                    <span>Ver detalle</span>
                  </button>
                </GlowCard>
              </div>
              
              <div v-else class="px-6 py-12 text-center bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-2xl text-slate-600 dark:text-slate-400 shadow-sm">
                <CheckCircle2 class="w-10 h-10 text-emerald-600/70 mx-auto mb-2" />
                <p class="font-black text-sm text-slate-900 dark:text-slate-100">No tenés cirugías pendientes de liquidación.</p>
                <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">Todas tus cirugías registradas han sido procesadas.</p>
              </div>
            </div>
            
            <!-- SECONDARY BLOCK: Comprobantes -->
            <div class="lg:col-span-5">
              <div class="flex items-center justify-between mb-4">
                <h2 class="text-lg sm:text-xl font-black text-slate-950 dark:text-white flex items-center gap-2">
                  <span class="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                  Últimos comprobantes
                </h2>
              </div>
              
              <div v-if="visibleComprobantes.length > 0" class="space-y-4">
                <GlowCard v-for="comp in visibleComprobantes" :key="comp.key" class="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-300 dark:border-slate-800 shadow-sm" glow-color="rgba(16, 185, 129, 0.12)">
                  <div class="flex items-center justify-between gap-2 mb-3">
                    <span class="text-xs text-slate-700 dark:text-slate-300 flex items-center gap-1.5 font-bold">
                      <Calendar class="w-3.5 h-3.5 text-slate-500" />
                      {{ comp.fecha_pago ? formatDate(comp.fecha_pago) : 'Fecha no disponible' }}
                    </span>
                    <div class="flex items-center gap-1.5">
                      <span v-if="isRecent(comp.fecha_pago)" class="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500 text-white shadow-xs animate-pulse">
                        Nuevo
                      </span>
                      <AnimatedBadge variant="success" dot>
                        Abonado
                      </AnimatedBadge>
                    </div>
                  </div>
                  
                  <div class="p-3.5 mb-4 border rounded-xl bg-slate-50 border-slate-200 dark:border-slate-800 dark:bg-slate-950/50">
                    <p class="mb-2 text-[10px] font-black tracking-wider uppercase text-slate-600 dark:text-slate-400">Pacientes incluidos</p>
                    <ul class="space-y-1.5 text-xs text-slate-800 dark:text-slate-200 font-semibold">
                      <li v-for="(paciente, index) in comp.pacientes.slice(0, 3)" :key="index" class="flex items-center gap-2">
                        <span class="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                        <span class="font-bold">{{ paciente }}</span>
                      </li>
                    </ul>
                    <p v-if="comp.pacientes.length > 3" class="mt-2 text-[11px] font-bold text-slate-600 dark:text-slate-400">
                      + {{ comp.pacientes.length - 3 }} más
                    </p>
                  </div>
                  
                  <a :href="getComprobanteUrl(comp.comprobante_object_key)" target="_blank" rel="noopener noreferrer" class="flex items-center justify-center gap-2 w-full px-4 py-2.5 text-xs font-black text-blue-800 dark:text-blue-200 transition-all duration-200 border border-blue-300 dark:border-blue-800/60 rounded-xl bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/40 dark:hover:bg-blue-900/50 hover:scale-[1.02] active:scale-[0.98]">
                    <FileText class="w-3.5 h-3.5" />
                    <span>Ver comprobante</span>
                  </a>
                </GlowCard>
                
                <div v-if="comprobantesRecientes.length > 3" class="flex flex-col items-center pt-1 text-center">
                  <button @click="activeTab = 'pagos'" class="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-black text-blue-800 dark:text-blue-200 transition-all duration-200 bg-blue-50 dark:bg-blue-950/40 border border-blue-300 dark:border-blue-800/60 rounded-xl hover:bg-blue-100 hover:scale-[1.02] active:scale-[0.98] shadow-sm cursor-pointer">
                    <span>Ver todos los pagos</span>
                    <ArrowRight class="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              
              <div v-else class="px-6 py-12 text-center bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-2xl text-slate-600 dark:text-slate-400 shadow-sm">
                <FileText class="w-10 h-10 text-slate-400 dark:text-slate-600 mx-auto mb-2" />
                <p class="font-black text-sm text-slate-900 dark:text-slate-100">Todavía no hay comprobantes cargados.</p>
              </div>
            </div>
            
          </div>
        </div>

        <!-- TAB 2: PAGOS Y COMPROBANTES -->
        <div v-else-if="activeTab === 'pagos'" class="space-y-6 sm:space-y-8">
          
          <!-- ACCIONES RÁPIDAS Y ENCABEZADO DE PAGOS -->
          <div class="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-200/80 dark:border-slate-800">
            <div>
              <h2 class="text-base sm:text-lg font-black text-slate-950 dark:text-white">Pagos y Comprobantes</h2>
              <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Controlá tus cirugías abonadas y pendientes de cobro.</p>
            </div>

            <!-- Botón para reporte PDF -->
            <ShimmerButton 
              @click="isReportModalOpen = true"
              class="px-3.5 py-2 text-xs"
            >
              <FileDown class="w-3.5 h-3.5" />
              <span>Descargar Reporte PDF</span>
            </ShimmerButton>
          </div>

          <!-- BLOQUE: CIRUGÍAS PENDIENTES DE PAGO -->
          <section>
            <h3 class="mb-3 text-sm sm:text-base font-extrabold text-slate-950 dark:text-white flex items-center gap-2">
              <span class="w-2 h-2 rounded-full bg-amber-500"></span>
              Cirugías pendientes de pago
            </h3>
            
            <div v-if="pendientes.length > 0" class="space-y-3">
              <GlowCard v-for="report in pendientes" :key="report.id" class="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-sm" glow-color="rgba(245, 158, 11, 0.12)">
                <div class="flex items-start justify-between gap-3 mb-2">
                  <div>
                    <p class="text-sm font-extrabold text-slate-950 dark:text-white">{{ report.paciente || 'No especificado' }}</p>
                    <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Cirugía realizada el <span class="font-bold text-slate-700 dark:text-slate-300">{{ report.fecha_cirugia ? formatDate(report.fecha_cirugia) : 'Fecha no disponible' }}</span></p>
                  </div>
                  <AnimatedBadge variant="warning" dot pulse>
                    Pendiente de pago
                  </AnimatedBadge>
                </div>
                <div class="flex items-center gap-2 p-2.5 mt-2 text-xs border rounded-lg bg-sky-50/70 text-sky-900 dark:bg-sky-950/30 dark:text-sky-200 border-sky-200/60 dark:border-sky-800/60">
                  <Info class="w-4 h-4 shrink-0 text-sky-600 dark:text-sky-400" />
                  <p class="text-xs font-medium">Inclusión en próxima orden de pago al procesar la liquidación.</p>
                </div>
              </GlowCard>
            </div>
            <div v-else class="px-4 py-8 text-xs text-center bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl text-slate-500 dark:text-slate-400 shadow-sm">
              No tenés cirugías pendientes de cobro.
            </div>
          </section>

          <!-- BLOQUE: HISTORIAL DE PAGOS -->
          <section>
            <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
              <h3 class="text-sm sm:text-base font-extrabold text-slate-950 dark:text-white">Historial de pagos</h3>
              
              <!-- Buscador Rápido -->
              <div class="relative w-full sm:w-64">
                <input 
                  v-model="searchPagosQuery"
                  type="text"
                  placeholder="Buscar paciente o N° orden..."
                  class="w-full pl-8 pr-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 shadow-sm placeholder:text-slate-400"
                />
                <Search class="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              </div>
            </div>

            <div v-if="historialLiquidacionesFiltradas.length > 0" class="space-y-6">
              <div v-for="(liquidaciones, mes) in liquidacionesAgrupadasPorMes" :key="mes" class="space-y-4">
                <h4 class="pb-1.5 text-sm font-extrabold border-b text-slate-700 dark:text-slate-300 border-slate-200/80 dark:border-slate-800">{{ mes }}</h4>
                <GlowCard v-for="liq in liquidaciones" :key="liq.id" class="p-4 sm:p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm" glow-color="rgba(37, 99, 235, 0.1)">
                
                <div class="flex flex-wrap items-start justify-between gap-3 mb-3">
                  <div>
                    <h4 class="flex items-center gap-2 text-base font-bold text-slate-950 dark:text-white">
                      <Receipt class="w-4 h-4 text-blue-500" />
                      {{ liq.orden_de_pago_id ? 'Orden de pago #' + liq.orden_de_pago_id : 'Pago registrado' }}
                    </h4>
                    <p class="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                      {{ liq.comprobante_object_key ? 'Comprobante subido el:' : 'Emitido el' }} 
                      <span class="font-bold text-slate-800 dark:text-slate-200">{{ liq.fecha_pago ? formatDate(liq.fecha_pago) : 'Fecha no disponible' }}</span>
                    </p>
                  </div>
                  <div class="flex items-center gap-1.5">
                    <span v-if="isRecent(liq.fecha_pago)" class="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500 text-white shadow-xs animate-pulse">
                      Nuevo
                    </span>
                    <AnimatedBadge v-if="liq.comprobante_object_key" variant="success" dot>
                      Comprobante cargado
                    </AnimatedBadge>
                    <AnimatedBadge v-else variant="neutral">
                      Comprobante pendiente
                    </AnimatedBadge>
                  </div>
                </div>

                <div class="p-4 mb-4 border rounded-xl bg-slate-50 border-slate-100 dark:bg-slate-950/50 dark:border-slate-800">
                  <p class="text-xs sm:text-sm text-slate-700 dark:text-slate-300">
                    <span class="font-bold text-slate-900 dark:text-slate-200">Pacientes abonados:</span> 
                    <span class="ml-1 font-medium">{{ liq.pacientes.slice(0, 3).join(', ') }}</span>
                    <span v-if="liq.pacientes.length > 3" class="ml-1 text-xs font-semibold text-slate-500 dark:text-slate-400">+ {{ liq.pacientes.length - 3 }} más</span>
                  </p>
                  <div class="flex flex-wrap gap-5 pt-3 mt-3 border-t border-slate-200 dark:border-slate-700/50 text-xs sm:text-sm">
                    <p class="text-slate-600 dark:text-slate-400">
                      Cirugías: <span class="font-bold text-slate-950 dark:text-white">{{ liq.cirugias.length }}</span>
                    </p>
                    <p v-if="liq.has_monto" class="text-slate-600 dark:text-slate-400">
                      Monto total: <span class="font-bold text-slate-950 dark:text-white">${{ liq.monto_total.toLocaleString('es-AR') }}</span>
                    </p>
                  </div>
                </div>

                <div class="flex flex-wrap items-center gap-2.5">
                  <button v-if="liq.cirugias.length > 0" @click="openDetailModal(liq, true)" class="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-bold transition-all duration-200 rounded-xl text-slate-700 bg-slate-100 hover:bg-slate-200 focus:outline-none dark:text-slate-200 dark:bg-slate-800 dark:border dark:border-slate-700 dark:hover:bg-slate-700 hover:scale-[1.02] active:scale-[0.98] cursor-pointer">
                    <Eye class="w-3.5 h-3.5" />
                    <span>Abrir detalle</span>
                  </button>

                  <!-- Botón Descargar PDF de esta orden -->
                  <button 
                    @click="descargarPDFOrdenIndividual(liq)" 
                    class="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 rounded-xl hover:bg-indigo-100 dark:bg-indigo-950/40 dark:border-indigo-800/60 dark:text-indigo-300 dark:hover:bg-indigo-900/50 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] cursor-pointer shadow-sm"
                    title="Descargar PDF individual de esta orden"
                  >
                    <FileDown class="w-3.5 h-3.5" />
                    <span>PDF Orden</span>
                  </button>

                  <a v-if="liq.comprobante_object_key" :href="getComprobanteUrl(liq.comprobante_object_key)" target="_blank" rel="noopener noreferrer" class="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-bold text-blue-700 transition-all duration-200 border border-blue-200 rounded-xl bg-blue-50 hover:bg-blue-100 focus:outline-none dark:bg-blue-950/40 dark:border-blue-800/60 dark:text-blue-300 dark:hover:bg-blue-900/50 hover:scale-[1.02] active:scale-[0.98] shadow-sm">
                    <ExternalLink class="w-3.5 h-3.5" />
                    <span>Ver comprobante</span>
                  </a>
                </div>
              </GlowCard>
              </div>
              
              <!-- Cargar Más -->
              <div v-if="hasMoreLiquidaciones" class="flex justify-center pt-2">
                <button @click="cargarMasLiquidaciones" class="px-6 py-2.5 text-xs font-bold text-slate-700 bg-white border border-slate-300 rounded-xl shadow-sm hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700 dark:hover:bg-slate-700 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] cursor-pointer">
                  Cargar más pagos
                </button>
              </div>
              <div v-else class="py-4 text-xs font-semibold text-center text-slate-400 dark:text-slate-500">
                No hay más pagos para mostrar.
              </div>
            </div>
            <div v-else class="px-6 py-10 text-center bg-white border border-slate-200/80 dark:bg-slate-900 rounded-2xl dark:border-slate-800 text-slate-500 dark:text-slate-400 shadow-sm">
              Todavía no hay pagos registrados que coincidan con la búsqueda.
            </div>
          </section>
        </div>

        <!-- TAB 3: MIS DATOS -->
        <MyDataSection 
          v-else-if="activeTab === 'datos'" 
          :info="instrumentadorInfo" 
          :activity="allActivityData" 
          @openAccessHistory="isAccessModalOpen = true" 
          @openNotificationsModal="isNotificationModalOpen = true"
        />

        <!-- TAB 4: FAQ -->
        <FaqSection v-else />

        <!-- PIE DE PÁGINA SIMPLE CON ENLACE OFICIAL A DISTRICORR -->
        <footer class="mt-12 py-6 border-t border-slate-200/80 dark:border-slate-800 text-center">
          <p class="text-xs text-slate-500 dark:text-slate-400 font-medium">
            Gestión IQ — Sistema oficial en coordinación con 
            <a 
              href="https://www.districorr.com.ar" 
              target="_blank" 
              rel="noopener noreferrer" 
              class="font-bold text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1 ml-1"
            >
              <span>www.districorr.com.ar</span>
              <ExternalLink class="w-3 h-3" />
            </a>
          </p>
        </footer>

      </div>

      <!-- Modal de Detalle de liquidación -->
      <PaymentDetailModal :show="isDetailModalOpen" :liquidacion="selectedLiquidacion" @close="isDetailModalOpen = false" />

      <!-- Modal de Reporte de Pagos PDF -->
      <ReportePagosModal 
        :show="isReportModalOpen" 
        :instrumentador="instrumentadorInfo" 
        :liquidaciones="historialLiquidaciones" 
        @close="isReportModalOpen = false" 
      />

      <!-- Modal Interactivo de Avisos y Notificaciones (Onboarding) -->
      <NotificationOnboardingModal 
        :show="isNotificationModalOpen" 
        :instrumentador="instrumentadorInfo" 
        :dni="dni" 
        @close="isNotificationModalOpen = false" 
        @updated="handleNotificationSettingsUpdated" 
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { supabase } from '../services/supabase';
import { useToast } from 'vue-toastification';
import FaqSection from '../components/FaqSection.vue';
import PaymentDetailModal from '../components/PaymentDetailModal.vue';
import MyDataSection from '../components/MyDataSection.vue';
import ReportePagosModal from '../components/ReportePagosModal.vue';
import NotificationOnboardingModal from '../components/NotificationOnboardingModal.vue';
import { useReportePagosPDF } from '../composables/useReportePagosPDF';
import { 
  GlowCard, 
  ShimmerButton, 
  SlidingNumber, 
  AnimatedBadge 
} from '../components/ui';
import { 
  ShieldCheck, 
  Lock, 
  LogIn, 
  AlertCircle, 
  ExternalLink, 
  Sun, 
  Moon, 
  Activity, 
  Receipt, 
  UserCheck, 
  HelpCircle, 
  Clock, 
  CheckCircle2, 
  Calendar, 
  Info, 
  Eye, 
  FileText, 
  ArrowRight, 
  FileDown, 
  Search,
  MessageCircle,
  Bell,
  BellRing,
  BellOff
} from 'lucide-vue-next';
import { 
  isWebNotificationSupported, 
  getNotificationPermissionStatus, 
  requestWebNotificationPermission, 
  showDeviceNotification 
} from '../services/webPushService';

const isAuthenticated = ref(false);
const isLoading = ref(false);
const error = ref(null);
const dni = ref('');
const allActivityData = ref([]);
const instrumentadorInfo = ref(null);
const activeTab = ref('resumen');
const isDetailModalOpen = ref(false);
const isReportModalOpen = ref(false);
const isNotificationModalOpen = ref(false);
const selectedLiquidacion = ref(null);
const isDarkMode = ref(false);
const searchPagosQuery = ref('');
const formattedPreviousAccess = ref('');
const isFirstAccess = ref(false);
const isPushSupported = ref(isWebNotificationSupported());
const pushPermissionStatus = ref(getNotificationPermissionStatus());

const route = useRoute();
const toast = useToast();
const token = route.params.token;
const { generarReporteOrdenIndividual } = useReportePagosPDF();

const registerAccessLog = async (cleanDni, tokenStr) => {
  if (!cleanDni || !tokenStr) return;
  const storageKey = `gestioniq_last_portal_access_${tokenStr}_${cleanDni}`;
  const nowIso = new Date().toISOString();
  let foundPreviousDate = null;

  try {
    // 1. Consultar el último ingreso guardado en Supabase (tabla ficha_access_logs)
    const { data: dbLogs, error: dbErr } = await supabase
      .from('ficha_access_logs')
      .select('accessed_at')
      .eq('dni', cleanDni)
      .eq('token', tokenStr)
      .order('accessed_at', { ascending: false })
      .limit(1);

    if (!dbErr && dbLogs && dbLogs.length > 0 && dbLogs[0].accessed_at) {
      foundPreviousDate = new Date(dbLogs[0].accessed_at);
    } else {
      // Fallback a localStorage si en la DB aún no había registros anteriores
      const rawPrevious = localStorage.getItem(storageKey);
      if (rawPrevious) {
        const prevDate = new Date(rawPrevious);
        if (!isNaN(prevDate.getTime())) {
          foundPreviousDate = prevDate;
        }
      }
    }

    if (foundPreviousDate && !isNaN(foundPreviousDate.getTime())) {
      const fechaStr = foundPreviousDate.toLocaleDateString('es-AR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
      const horaStr = foundPreviousDate.toLocaleTimeString('es-AR', {
        hour: '2-digit',
        minute: '2-digit'
      });
      formattedPreviousAccess.value = `${fechaStr}, ${horaStr} hs`;
      isFirstAccess.value = false;
    } else {
      formattedPreviousAccess.value = '';
      isFirstAccess.value = true;
    }

    // 2. Guardar el ingreso actual en Supabase (ficha_access_logs)
    await supabase.from('ficha_access_logs').insert({
      token: tokenStr,
      dni: cleanDni,
      accessed_at: nowIso,
      user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown'
    });

    // 3. Respaldar en localStorage para disponibilidad inmediata offline
    localStorage.setItem(storageKey, nowIso);
  } catch (e) {
    console.warn("No se pudo guardar/consultar el registro de ingreso:", e);
  }
};

const descargarPDFOrdenIndividual = (liq) => {
  generarReporteOrdenIndividual({
    instrumentador: instrumentadorInfo.value,
    liquidacion: liq
  });
  toast.success('Generando PDF de la orden...');
};

const authenticate = async (overrideDni = null) => {
  const targetDni = (typeof overrideDni === 'string' && overrideDni) ? overrideDni : dni.value;
  // Limpia cualquier caracter que no sea numero (puntos, espacios, guiones)
  const cleanDni = String(targetDni || '').replace(/[^0-9]/g, '');

  if (!cleanDni) {
    error.value = "Por favor, ingresá un número de DNI válido.";
    return;
  }
  
  isLoading.value = true;
  error.value = null;

  try {
    const { data, error: rpcError } = await supabase.rpc('autenticar_y_obtener_resumen', { 
      p_token: token, 
      p_dni: cleanDni 
    });
    
    if (rpcError) throw rpcError;

    if (data) {
      instrumentadorInfo.value = data.instrumentador_info || {};

      // Vincular directamente el email: sincronización bidireccional inmediata
      try {
        const cachedEmail = localStorage.getItem(`gestioniq_email_${cleanDni}`);
        if (!instrumentadorInfo.value.email && cachedEmail) {
          instrumentadorInfo.value.email = cachedEmail;
        } else if (instrumentadorInfo.value.email) {
          localStorage.setItem(`gestioniq_email_${cleanDni}`, instrumentadorInfo.value.email);
        }
      } catch (e) {
        console.warn("No se pudo sincronizar email local:", e);
      }

      allActivityData.value = (data.activity_summary || []).filter(r => r.estado === 'Enviado');
      isAuthenticated.value = true;
      dni.value = cleanDni;

      // Registrar comprobación de ingreso del usuario a su enlace personal
      await registerAccessLog(cleanDni, token);

      // Guardar en sessionStorage para no pedir DNI en refresco de pagina
      try {
        sessionStorage.setItem(`gestioniq_auth_${token}`, cleanDni);
      } catch (e) {
        console.warn("SessionStorage no disponible:", e);
      }

      toast.success("Acceso concedido.");

      // Verificar si debe mostrarse el modal de onboarding de notificaciones
      try {
        const notifPrompted = localStorage.getItem(`gestioniq_notif_prompted_${cleanDni}`);
        const forceFromUrl = route.query.notif === '1' || route.query.activar === '1';
        if (!notifPrompted || forceFromUrl) {
          setTimeout(() => {
            isNotificationModalOpen.value = true;
          }, 450);
        }
      } catch (e) {
        // Ignore localStorage error
      }
    } else {
      error.value = "Verificá tu DNI. No coincide con la ficha o el enlace expiró.";
      toast.error("Acceso denegado.");
    }
  } catch (err) {
    console.error("Error en la autenticación o procesamiento:", err);
    error.value = "Ocurrió un error inesperado de conexión. Intentá de nuevo.";
    toast.error("Error de verificación.");
  } finally {
    isLoading.value = false;
  }
};

const handleNotificationSettingsUpdated = ({ email, pushEnabled }) => {
  if (instrumentadorInfo.value && email !== undefined) {
    instrumentadorInfo.value.email = email;
  }
  const cleanDni = dni.value || instrumentadorInfo.value?.dni;
  if (cleanDni && email !== undefined) {
    try {
      if (email) {
        localStorage.setItem(`gestioniq_email_${cleanDni}`, email);
      } else {
        localStorage.removeItem(`gestioniq_email_${cleanDni}`);
      }
    } catch (e) {
      // Ignore
    }
  }
  pushPermissionStatus.value = getNotificationPermissionStatus();
};

const login = authenticate;

onMounted(() => {
  // Intentar auto-login transparente si el usuario ya verificó su DNI en esta sesión
  try {
    const savedDni = sessionStorage.getItem(`gestioniq_auth_${token}`);
    if (savedDni) {
      dni.value = savedDni;
      authenticate(savedDni);
    }
  } catch (e) {
    // Ignore error
  }
});

const pendientes = computed(() => allActivityData.value.filter(r => r.estado_pago === 'Pendiente'));

const comprobantesRecientes = computed(() => {
  const conComprobante = allActivityData.value.filter(r => r.estado_pago === 'Pagado' && r.comprobante_object_key);
  
  const groups = {};
  conComprobante.forEach(r => {
    const key = r.comprobante_object_key;
    if (!groups[key]) {
      groups[key] = {
        key: key,
        fecha_pago: r.fecha_pago,
        comprobante_object_key: r.comprobante_object_key,
        pacientes: []
      };
    }
    const patientName = r.paciente || 'No especificado';
    if (!groups[key].pacientes.includes(patientName)) {
      groups[key].pacientes.push(patientName);
    }
  });
  
  const array = Object.values(groups);
  array.sort((a, b) => new Date(b.fecha_pago || 0) - new Date(a.fecha_pago || 0));
  return array;
});

const historialLiquidaciones = computed(() => {
  const pagadas = allActivityData.value.filter(r => r.estado_pago === 'Pagado');
  
  const groups = {};
  pagadas.forEach(r => {
    const key = r.orden_de_pago_id || r.comprobante_object_key || r.fecha_pago || 'sin-ref';
    
    if (!groups[key]) {
      groups[key] = {
        id: key,
        orden_de_pago_id: r.orden_de_pago_id,
        fecha_pago: r.fecha_pago,
        comprobante_object_key: r.comprobante_object_key,
        pacientes: [],
        cirugias: [],
        monto_total: 0,
        has_monto: false
      };
    }
    const patientName = r.paciente || 'No especificado';
    if (!groups[key].pacientes.includes(patientName)) {
      groups[key].pacientes.push(patientName);
    }
    groups[key].cirugias.push(r);
    
    const monto = parseFloat(r.monto || r.monto_liquidado || r.honorarios);
    if (!isNaN(monto) && monto > 0) {
      groups[key].monto_total += monto;
      groups[key].has_monto = true;
    }
  });
  
  return Object.values(groups).sort((a, b) => new Date(b.fecha_pago || 0) - new Date(a.fecha_pago || 0));
});

const historialLiquidacionesFiltradas = computed(() => {
  if (!searchPagosQuery.value.trim()) return historialLiquidaciones.value;
  const q = searchPagosQuery.value.toLowerCase().trim();
  return historialLiquidaciones.value.filter(liq => {
    const matchOrden = liq.orden_de_pago_id && String(liq.orden_de_pago_id).toLowerCase().includes(q);
    const matchPaciente = liq.pacientes && liq.pacientes.some(p => p.toLowerCase().includes(q));
    const matchFecha = liq.fecha_pago && String(liq.fecha_pago).includes(q);
    return matchOrden || matchPaciente || matchFecha;
  });
});

const visibleComprobantes = computed(() => {
  return comprobantesRecientes.value.slice(0, 3);
});

// Paginación y Agrupación del historial (Front-end Only)
const limitLiquidaciones = ref(6);

const liquidacionesPaginadas = computed(() => {
  return historialLiquidacionesFiltradas.value.slice(0, limitLiquidaciones.value);
});

const liquidacionesAgrupadasPorMes = computed(() => {
  const groups = {};
  liquidacionesPaginadas.value.forEach(liq => {
    let mes = 'Fecha no disponible';
    if (liq.fecha_pago) {
      const d = new Date(liq.fecha_pago);
      if (!isNaN(d.getTime())) {
        const m = d.toLocaleString('es-AR', { month: 'long', year: 'numeric', timeZone: 'UTC' });
        mes = m.charAt(0).toUpperCase() + m.slice(1);
      }
    }
    if (!groups[mes]) groups[mes] = [];
    groups[mes].push(liq);
  });
  return groups;
});

const hasMoreLiquidaciones = computed(() => limitLiquidaciones.value < historialLiquidaciones.value.length);
const cargarMasLiquidaciones = () => { limitLiquidaciones.value += 6; };

const cirugiasPendientesCount = computed(() => pendientes.value.length);

const cirugiasCobradasMesCount = computed(() => {
  const currentMonth = new Date().getUTCMonth();
  const currentYear = new Date().getUTCFullYear();
  return allActivityData.value.filter(r => {
    if (r.estado_pago !== 'Pagado' || !r.fecha_pago) return false;
    const paymentDate = new Date(r.fecha_pago);
    return paymentDate.getUTCMonth() === currentMonth && paymentDate.getUTCFullYear() === currentYear;
  }).length;
});

const openDetailModal = (item, isGroup = false) => {
  if (isGroup) {
    selectedLiquidacion.value = item;
  } else {
    const monto = parseFloat(item.monto_a_pagar || item.monto || item.monto_liquidado || item.honorarios);
    const hasMonto = !isNaN(monto) && monto > 0;
    selectedLiquidacion.value = {
      orden_de_pago_id: item.orden_de_pago_id || null,
      fecha_pago: item.fecha_pago || null,
      comprobante_object_key: item.comprobante_object_key || null,
      cirugias: [item],
      monto_total: hasMonto ? monto : 0,
      has_monto: hasMonto,
      is_pendiente: true
    };
  }
  isDetailModalOpen.value = true;
};

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('es-AR', { timeZone: 'UTC' });
};

const isRecent = (dateString) => {
  if (!dateString) return false;
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return false;
  const diffDays = (new Date() - d) / (1000 * 60 * 60 * 24);
  return diffDays >= 0 && diffDays <= 7;
};

const togglePushNotifications = async () => {
  if (!isPushSupported.value) {
    toast.info("Las notificaciones web no están soportadas en este navegador.");
    return;
  }

  const granted = await requestWebNotificationPermission(dni.value);
  pushPermissionStatus.value = getNotificationPermissionStatus();

  if (granted) {
    toast.success("¡Notificaciones activadas en este dispositivo!");
    await showDeviceNotification({
      title: "🔔 ¡Notificaciones activadas!",
      body: "Te avisaremos en cuanto se cargue un nuevo comprobante de liquidación.",
      url: window.location.href
    });
  } else {
    toast.info("No se activaron las notificaciones. Podés habilitarlas desde los permisos del navegador.");
  }
};

const testPushNotification = async () => {
  const sent = await showDeviceNotification({
    title: "💳 Notificación de Prueba",
    body: "¡Tu dispositivo está configurado correctamente para recibir avisos de comprobantes!",
    url: window.location.href
  });
  if (sent) {
    toast.success("Notificación de prueba emitida.");
  } else {
    toast.warning("No se pudo mostrar la notificación. Verificá los permisos del navegador.");
  }
};

const getComprobanteUrl = (objectKey) => {
  if (!objectKey) return '#';
  const R2_PUBLIC_URL = import.meta.env.VITE_R2_PUBLIC_URL;
  return `${R2_PUBLIC_URL}/${objectKey}`;
};
</script>

<style scoped>
.form-input { @apply w-full px-4 py-3 border border-slate-300 rounded-lg text-center text-lg dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100; }
.error-message { @apply text-red-500 text-sm mt-2; }
.btn-primary { @apply w-full bg-blue-600 text-white font-semibold py-3 rounded-lg transition-colors hover:bg-blue-700 disabled:bg-slate-400 disabled:cursor-not-allowed; }

.tab-btn { @apply px-5 py-2.5 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-400 transition-all duration-200 hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-slate-100 whitespace-nowrap; }
.tab-btn--active { @apply bg-slate-900 text-white shadow-md hover:bg-slate-800 dark:bg-slate-700 dark:text-white dark:hover:bg-slate-600; }

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-4px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  20%, 60% { transform: translateX(-6px); }
  40%, 80% { transform: translateX(6px); }
}

.animate-fadeIn {
  animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

.animate-shake {
  animation: shake 0.4s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
}

.hide-scrollbar::-webkit-scrollbar { display: none; }
.hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
</style>