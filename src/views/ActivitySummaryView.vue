<!-- src/views/ActivitySummaryView.vue -->
<template>
  <div :class="{ 'dark': isDarkMode }">
    <div class="min-h-screen py-8 transition-colors duration-300 bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 sm:py-12 text-slate-900 dark:text-slate-100">

      <!-- ESTADO 1: PANTALLA DE AUTENTICACIÓN -->
      <div v-if="!isAuthenticated" class="max-w-md px-4 pt-16 mx-auto">
        <div class="p-8 text-center bg-white border shadow-md border-slate-200 dark:bg-slate-900 rounded-2xl dark:border-slate-800">
          <img src="/2.svg" alt="Districorr" class="h-10 mx-auto mb-6 opacity-80">
          <h1 class="text-2xl font-bold text-slate-900 dark:text-slate-50">Resumen de Actividad</h1>
          <p class="mt-2 mb-6 text-slate-600 dark:text-slate-400">Por favor, ingresá tu DNI para acceder a tu información.</p>
          <form @submit.prevent="authenticate">
            <input v-model="dni" type="text" placeholder="Ingresá tu DNI (con o sin puntos)" class="transition-shadow form-input focus:ring-2 focus:ring-blue-500 focus:outline-none" required />
            <p v-if="error" class="error-message">{{ error }}</p>
            <button type="submit" :disabled="isLoading" class="w-full mt-4 btn-primary focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 dark:focus:ring-offset-slate-900">{{ isLoading ? 'Verificando...' : 'Continuar' }}</button>
          </form>
        </div>
      </div>

      <!-- ESTADO 2: VISTA DE DATOS -->
      <div v-else class="max-w-6xl px-4 mx-auto sm:px-6 lg:px-8">
        <header class="flex items-start justify-between gap-4 mb-8">
          <div>
            <h1 class="text-2xl font-bold sm:text-3xl text-slate-950 dark:text-white">Tu Resumen de Actividad</h1>
            <p class="mt-2 text-sm sm:text-base text-slate-600 dark:text-slate-400">Gestioná tus cirugías, comprobantes y estados de ficha.</p>
          </div>
          <!-- Toggle Modo Oscuro -->
          <button @click="isDarkMode = !isDarkMode" class="shrink-0 p-2.5 text-slate-500 bg-white border border-slate-200 shadow-sm hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700 dark:hover:bg-slate-700 rounded-full transition-all duration-200 hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-slate-300" :title="isDarkMode ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'">
            <svg v-if="!isDarkMode" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path></svg>
            <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
          </button>
        </header>

        <!-- Tabs -->
        <div class="px-4 pb-2 mb-8 -mx-4 overflow-x-auto sm:mx-0 sm:px-0 hide-scrollbar">
          <div class="inline-flex items-center gap-1.5 p-1.5 bg-white border shadow-sm border-slate-200 dark:bg-slate-900 dark:border-slate-800 rounded-2xl">
            <button class="tab-btn" :class="{ 'tab-btn--active': activeTab === 'resumen' }" @click="activeTab = 'resumen'">Resumen</button>
            <button class="tab-btn" :class="{ 'tab-btn--active': activeTab === 'pagos' }" @click="activeTab = 'pagos'">Pagos y Comprobantes</button>
            <button class="tab-btn" :class="{ 'tab-btn--active': activeTab === 'datos' }" @click="activeTab = 'datos'">Mi Perfil</button>
            <button class="tab-btn" :class="{ 'tab-btn--active': activeTab === 'faq' }" @click="activeTab = 'faq'">Preguntas Frecuentes</button>
          </div>
        </div>

        <!-- TAB 1: RESUMEN DE PAGOS -->
        <div v-if="activeTab === 'resumen'">
          
          <!-- KPIs -->
          <div class="grid grid-cols-2 gap-4 mb-8 sm:gap-6 lg:mb-10">
            <div class="p-5 bg-white border shadow-sm border-slate-200 sm:p-6 dark:bg-slate-900 rounded-2xl dark:border-slate-800 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5">
              <h3 class="text-xs font-bold tracking-wider uppercase text-slate-500 dark:text-slate-400">Cirugías pendientes</h3>
              <p class="mt-2 text-3xl font-bold sm:text-4xl text-slate-950 dark:text-white">{{ cirugiasPendientesCount }}</p>
            </div>
            <div class="p-5 bg-white border shadow-sm border-slate-200 sm:p-6 dark:bg-slate-900 rounded-2xl dark:border-slate-800 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5">
              <h3 class="text-xs font-bold tracking-wider uppercase text-slate-500 dark:text-slate-400">Pagos de este mes</h3>
              <p class="mt-2 text-3xl font-bold sm:text-4xl text-slate-950 dark:text-white">{{ cirugiasCobradasMesCount }}</p>
            </div>
          </div>

          <div class="grid grid-cols-1 gap-8 lg:gap-10 lg:grid-cols-12">
            
            <!-- MAIN BLOCK: Pendientes -->
            <div class="lg:col-span-7">
              <h2 class="mb-5 text-xl font-bold text-slate-950 dark:text-white">Pendientes de liquidación</h2>
              
              <div v-if="pendientes.length > 0" class="space-y-4 sm:space-y-5">
                <div v-for="report in pendientes" :key="report.id" class="p-5 bg-white border shadow-sm border-slate-200 sm:p-6 dark:bg-slate-900 rounded-2xl dark:border-slate-800 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5">
                  <div class="flex items-start justify-between gap-4 mb-3">
                    <div>
                      <p class="font-bold text-slate-950 dark:text-white">{{ report.paciente || 'No especificado' }}</p>
                      <p class="text-sm text-slate-600 dark:text-slate-400 mt-0.5">{{ report.fecha_cirugia ? formatDate(report.fecha_cirugia) : 'Fecha no disponible' }}</p>
                    </div>
                    <span class="inline-flex items-center px-3 py-1 text-xs font-bold border rounded-full shrink-0 bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/50">
                      <svg class="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>
                      Pendiente
                    </span>
                  </div>
                  <div class="flex items-start gap-3 p-3.5 mt-4 mb-5 text-sm border rounded-xl bg-sky-50 text-sky-800 dark:bg-sky-950/40 dark:text-sky-200 border-sky-200 dark:border-sky-800">
                    <svg class="w-5 h-5 shrink-0 text-sky-500 dark:text-sky-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" /></svg>
                    <p>Esta cirugía será incluida en una próxima orden de pago cuando se genere la liquidación correspondiente.</p>
                  </div>
                  <button @click="openDetailModal(report, false)" class="inline-flex items-center justify-center px-4 py-2 text-sm font-medium transition-all duration-200 rounded-lg text-slate-700 bg-slate-100 hover:bg-slate-200 focus:ring-2 focus:ring-slate-300 focus:outline-none dark:text-slate-200 dark:bg-slate-800 dark:border dark:border-slate-700 dark:hover:bg-slate-700 hover:-translate-y-0.5">
                    Ver detalle
                  </button>
                </div>
              </div>
              
              <div v-else class="px-6 py-10 text-center bg-white border shadow-sm border-slate-200 dark:bg-slate-900 rounded-2xl dark:border-slate-800 text-slate-500">
                No tenés cirugías pendientes de liquidación.
              </div>
            </div>
            
            <!-- SECONDARY BLOCK: Comprobantes -->
            <div class="lg:col-span-5">
              <h2 class="mb-5 text-xl font-bold text-slate-950 dark:text-white">Últimos comprobantes cargados</h2>
              
              <div v-if="visibleComprobantes.length > 0" class="space-y-4 sm:space-y-5">
                <div v-for="comp in visibleComprobantes" :key="comp.key" class="p-5 bg-white border shadow-sm border-slate-200 sm:p-6 dark:bg-slate-900 rounded-2xl dark:border-slate-800 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5">
                  <p class="mb-4 text-sm text-slate-600 dark:text-slate-400">
                    Comprobante de pago cargado el: <span class="font-bold text-slate-950 dark:text-slate-100">{{ comp.fecha_pago ? formatDate(comp.fecha_pago) : 'Fecha no disponible' }}</span>
                  </p>
                  
                  <div class="p-4 mb-5 border rounded-xl bg-slate-50 border-slate-100 dark:border-slate-800 dark:bg-slate-950/50">
                    <p class="mb-2.5 text-xs font-bold tracking-wider uppercase text-slate-500 dark:text-slate-400">Pacientes incluidos</p>
                    <ul class="space-y-1.5 text-sm text-slate-700 dark:text-slate-300 font-medium">
                      <li v-for="(paciente, index) in comp.pacientes.slice(0, 3)" :key="index" class="flex items-center gap-2">
                        <span class="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-600"></span>
                        {{ paciente }}
                      </li>
                    </ul>
                    <p v-if="comp.pacientes.length > 3" class="mt-3 text-xs font-semibold text-slate-500 dark:text-slate-400">
                      + {{ comp.pacientes.length - 3 }} más
                    </p>
                  </div>
                  
                  <a :href="getComprobanteUrl(comp.comprobante_object_key)" target="_blank" rel="noopener noreferrer" class="flex items-center justify-center w-full px-4 py-2.5 text-sm font-semibold text-blue-700 transition-all duration-200 border border-blue-200 rounded-xl bg-blue-50 hover:bg-blue-100 focus:ring-2 focus:ring-blue-400 focus:outline-none dark:bg-blue-900/30 dark:border-blue-800/50 dark:text-blue-300 dark:hover:bg-blue-900/50 hover:-translate-y-0.5">
                    Ver comprobante
                  </a>
                </div>
                
                <div v-if="comprobantesRecientes.length > 3" class="flex flex-col items-center pt-2 pb-4 text-center">
                  <button @click="activeTab = 'pagos'" class="px-5 py-2.5 text-sm font-bold text-blue-700 transition-all duration-200 bg-blue-50 border border-blue-200 rounded-xl dark:bg-blue-900/30 dark:border-blue-800/50 dark:text-blue-400 hover:bg-blue-100 hover:text-blue-800 dark:hover:bg-blue-900/50 dark:hover:text-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-400 hover:-translate-y-0.5 shadow-sm">
                    Ir a pagos y comprobantes
                  </button>
                </div>
              </div>
              
              <div v-else class="px-6 py-10 text-center bg-white border shadow-sm border-slate-200 dark:bg-slate-900 rounded-2xl dark:border-slate-800 text-slate-500">
                Todavía no hay comprobantes cargados.
              </div>
            </div>
            
          </div>
        </div>

        <!-- TAB 2: PAGOS Y COMPROBANTES -->
        <div v-else-if="activeTab === 'pagos'" class="space-y-10">
          <!-- HEADER -->
          <div class="mb-6 lg:mb-8">
            <h2 class="text-2xl font-bold text-slate-950 dark:text-white">Liquidaciones y comprobantes</h2>
            <p class="max-w-3xl mt-2 text-slate-600 dark:text-slate-400">
              Cada liquidación puede incluir una o más cirugías. Acá podés controlar qué pacientes fueron abonados, qué comprobante se cargó y ver el detalle de montos.
            </p>
          </div>

          <!-- BLOQUE: PENDIENTES DE LIQUIDACIÓN -->
          <section>
            <h3 class="mb-5 text-xl font-bold text-slate-950 dark:text-white">Pendientes de liquidación</h3>
            <div v-if="pendientes.length > 0" class="space-y-4">
              <div v-for="report in pendientes" :key="report.id" class="p-5 bg-white border shadow-sm border-slate-200 sm:p-6 dark:bg-slate-900 rounded-2xl dark:border-slate-800 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5">
                <div class="flex items-start justify-between gap-4 mb-3">
                  <div>
                    <p class="font-bold text-slate-950 dark:text-white">{{ report.paciente || 'No especificado' }}</p>
                    <p class="text-sm text-slate-600 dark:text-slate-400 mt-0.5">Cirugía realizada el <span class="font-bold text-slate-800 dark:text-slate-200">{{ report.fecha_cirugia ? formatDate(report.fecha_cirugia) : 'Fecha no disponible' }}</span></p>
                  </div>
                  <span class="inline-flex items-center px-3 py-1 text-xs font-bold border rounded-full shrink-0 bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/50">
                    <svg class="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>
                    Pendiente
                  </span>
                </div>
                <div class="flex items-start gap-3 p-3.5 mt-4 mb-2 text-sm border rounded-xl bg-sky-50 text-sky-800 dark:bg-sky-950/40 dark:text-sky-200 border-sky-200 dark:border-sky-800">
                  <svg class="w-5 h-5 shrink-0 text-sky-500 dark:text-sky-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" /></svg>
                  <p>Esta cirugía será incluida en una próxima orden de pago cuando se genere la liquidación correspondiente.</p>
                </div>
              </div>
            </div>
            <div v-else class="px-6 py-10 text-center bg-white border shadow-sm border-slate-200 dark:bg-slate-900 rounded-2xl dark:border-slate-800 text-slate-500">
              No tenés cirugías pendientes de liquidación.
            </div>
          </section>

          <!-- BLOQUE: HISTORIAL DE LIQUIDACIONES -->
          <section>
            <h3 class="mb-5 text-xl font-bold text-slate-950 dark:text-white">Historial de liquidaciones</h3>
            <div v-if="historialLiquidaciones.length > 0" class="space-y-8">
              <div v-for="(liquidaciones, mes) in liquidacionesAgrupadasPorMes" :key="mes" class="space-y-5">
                <h4 class="pb-2 text-lg font-bold border-b text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-700/50">{{ mes }}</h4>
                <div v-for="liq in liquidaciones" :key="liq.id" class="p-5 bg-white border shadow-sm border-slate-200 sm:p-6 dark:bg-slate-900 rounded-2xl dark:border-slate-800 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5">
                
                <div class="flex flex-wrap items-start justify-between gap-4 mb-5">
                  <div>
                    <h4 class="flex items-center gap-2.5 text-lg font-bold text-slate-950 dark:text-white">
                      <svg class="w-5 h-5 text-slate-400 dark:text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V8.25ZM6.75 12h.008v.008H6.75V12Zm0 3h.008v.008H6.75V15Zm0 3h.008v.008H6.75V18Z" /></svg>
                      {{ liq.orden_de_pago_id ? 'Orden de pago #' + liq.orden_de_pago_id : 'Liquidación registrada' }}
                    </h4>
                    <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">
                      {{ liq.comprobante_object_key ? 'Comprobante subido el:' : 'Emitida el' }} 
                      <span class="font-bold text-slate-800 dark:text-slate-200">{{ liq.fecha_pago ? formatDate(liq.fecha_pago) : 'Fecha no disponible' }}</span>
                    </p>
                  </div>
                  <span v-if="liq.comprobante_object_key" class="inline-flex items-center px-3 py-1 text-xs font-bold border rounded-full shrink-0 bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/50">
                    <svg class="w-3.5 h-3.5 mr-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path fill-rule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm13.36-1.814a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z" clip-rule="evenodd" /></svg>
                    Comprobante cargado
                  </span>
                  <span v-else class="inline-flex items-center px-3 py-1 text-xs font-bold border rounded-full shrink-0 bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-900/50 dark:text-slate-400 dark:border-slate-800">
                    <svg class="w-3.5 h-3.5 mr-1 text-slate-400 dark:text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>
                    Comprobante pendiente de carga
                  </span>
                </div>

                <div class="p-4 mb-5 border rounded-xl bg-slate-50 border-slate-100 dark:bg-slate-950/50 dark:border-slate-800">
                  <p class="text-sm text-slate-700 dark:text-slate-300">
                    <span class="font-bold text-slate-900 dark:text-slate-200">Pacientes incluidos:</span> 
                    <span class="ml-1 font-medium">{{ liq.pacientes.slice(0, 3).join(', ') }}</span>
                    <span v-if="liq.pacientes.length > 3" class="ml-1 text-xs font-semibold text-slate-500 dark:text-slate-400">+ {{ liq.pacientes.length - 3 }} más</span>
                  </p>
                  <div class="flex flex-wrap gap-5 pt-3 mt-3 border-t border-slate-200 dark:border-slate-700/50">
                    <p class="text-sm text-slate-600 dark:text-slate-400">
                      Cirugías: <span class="font-bold text-slate-950 dark:text-white">{{ liq.cirugias.length }}</span>
                    </p>
                    <p v-if="liq.has_monto" class="text-sm text-slate-600 dark:text-slate-400">
                      Monto total: <span class="font-bold text-slate-950 dark:text-white">${{ liq.monto_total.toLocaleString('es-AR') }}</span>
                    </p>
                  </div>
                </div>

                <div class="flex flex-wrap items-center gap-3">
                  <button v-if="liq.cirugias.length > 0" @click="openDetailModal(liq, true)" class="inline-flex items-center justify-center px-5 py-2.5 text-sm font-medium transition-all duration-200 rounded-lg text-slate-700 bg-slate-100 hover:bg-slate-200 focus:ring-2 focus:ring-slate-300 focus:outline-none dark:text-slate-200 dark:bg-slate-800 dark:border dark:border-slate-700 dark:hover:bg-slate-700 hover:-translate-y-0.5">
                    Abrir detalle
                  </button>
                  <a v-if="liq.comprobante_object_key" :href="getComprobanteUrl(liq.comprobante_object_key)" target="_blank" rel="noopener noreferrer" class="inline-flex items-center justify-center px-5 py-2.5 text-sm font-semibold text-blue-700 transition-all duration-200 border border-blue-200 rounded-lg bg-blue-50 hover:bg-blue-100 focus:ring-2 focus:ring-blue-400 focus:outline-none dark:bg-blue-900/30 dark:border-blue-800/50 dark:text-blue-300 dark:hover:bg-blue-900/50 hover:-translate-y-0.5">
                    <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                    Ver comprobante
                  </a>
                </div>
              </div>
              </div>
              
              <!-- Cargar Más -->
              <div v-if="hasMoreLiquidaciones" class="flex justify-center pt-2">
                <button @click="cargarMasLiquidaciones" class="px-6 py-2.5 text-sm font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg shadow-sm hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700 dark:hover:bg-slate-700 transition-all duration-200 hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-slate-400">
                  Cargar más liquidaciones
                </button>
              </div>
              <div v-else class="py-4 text-sm font-medium text-center text-slate-500 dark:text-slate-400">
                No hay más liquidaciones para mostrar.
              </div>
            </div>
            <div v-else class="px-6 py-10 text-center bg-white border shadow-sm border-slate-200 dark:bg-slate-900 rounded-2xl dark:border-slate-800 text-slate-500">
              Todavía no hay liquidaciones registradas.
            </div>
          </section>
        </div>

        <!-- TAB 3: MIS DATOS -->
        <MyDataSection v-else-if="activeTab === 'datos'" :info="instrumentadorInfo" :activity="allActivityData" />

        <!-- TAB 4: FAQ -->
        <FaqSection v-else />

      </div>

      <!-- Modal de Detalle de liquidación -->
      <PaymentDetailModal :show="isDetailModalOpen" :liquidacion="selectedLiquidacion" @close="isDetailModalOpen = false" />
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRoute } from 'vue-router';
import { supabase } from '../services/supabase';
import { useToast } from 'vue-toastification';
import FaqSection from '../components/FaqSection.vue';
import PaymentDetailModal from '../components/PaymentDetailModal.vue';
import MyDataSection from '../components/MyDataSection.vue';

const isAuthenticated = ref(false);
const isLoading = ref(false);
const error = ref(null);
const dni = ref('');
const allActivityData = ref([]);
const instrumentadorInfo = ref(null);
const activeTab = ref('resumen');
const isDetailModalOpen = ref(false);
const selectedLiquidacion = ref(null);
const isDarkMode = ref(false);

const route = useRoute();
const toast = useToast();
const token = route.params.token;

const authenticate = async () => {
  if (!dni.value.trim()) {
    error.value = "El DNI es requerido.";
    return;
  }
  isLoading.value = true;
  error.value = null;
  try {
    const cleanDni = dni.value.trim();
    const { data, error: rpcError } = await supabase.rpc('autenticar_y_obtener_resumen', { p_token: token, p_dni: cleanDni });
    
    if (rpcError) throw rpcError;

    if (data) {
      instrumentadorInfo.value = data.instrumentador_info;
      allActivityData.value = (data.activity_summary || []).filter(r => r.estado === 'Enviado');
      isAuthenticated.value = true;
      toast.success("Acceso concedido.");
    } else {
      error.value = "Datos incorrectos. Por favor, verificá tu DNI.";
      dni.value = '';
      toast.error("Acceso denegado.");
    }
  } catch (err) {
    console.error("Error en la autenticación o procesamiento:", err);
    error.value = "Ocurrió un error inesperado. Intentá de nuevo.";
    toast.error("Error de conexión o procesamiento de datos.");
  } finally {
    isLoading.value = false;
  }
};

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

const visibleComprobantes = computed(() => {
  return comprobantesRecientes.value.slice(0, 3);
});

// Paginación y Agrupación del historial (Front-end Only)
const limitLiquidaciones = ref(6); // Muestra 6 elementos iniciales

const liquidacionesPaginadas = computed(() => {
  return historialLiquidaciones.value.slice(0, limitLiquidaciones.value);
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

.hide-scrollbar::-webkit-scrollbar { display: none; }
.hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
</style>