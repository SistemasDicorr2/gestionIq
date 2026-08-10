<!-- src/views/ActivitySummaryView.vue -->
<template>
  <div :class="{ 'dark': isDarkMode }">
    <div class="min-h-screen py-8 transition-colors duration-300 bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 sm:py-12 text-slate-900 dark:text-slate-100">

      <!-- ESTADO 1: PANTALLA DE AUTENTICACIÓN -->
      <div v-if="!isAuthenticated" class="max-w-md px-4 pt-16 mx-auto">
        <div class="p-8 text-center bg-white border shadow-md border-slate-200 dark:bg-slate-900 rounded-3xl dark:border-slate-800">
          <img src="/2.svg" alt="Districorr" class="h-10 mx-auto mb-6 opacity-90">
          <h1 class="text-2xl font-extrabold text-slate-950 dark:text-slate-50 tracking-tight">Resumen de Actividad</h1>
          <p class="mt-2 mb-6 text-sm text-slate-600 dark:text-slate-400">Por favor, ingresá tu DNI para acceder a tu información oficial con <a href="https://www.districorr.com.ar" target="_blank" rel="noopener noreferrer" class="font-bold text-blue-600 dark:text-blue-400 hover:underline">Districorr</a>.</p>
          <form @submit.prevent="authenticate">
            <input v-model="dni" type="text" placeholder="Ingresá tu DNI (con o sin puntos)" class="transition-shadow form-input focus:ring-2 focus:ring-blue-500 focus:outline-none" required />
            <p v-if="error" class="error-message">{{ error }}</p>
            <button type="submit" :disabled="isLoading" class="w-full mt-4 btn-primary focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 dark:focus:ring-offset-slate-900">{{ isLoading ? 'Verificando...' : 'Continuar' }}</button>
          </form>
          
          <div class="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 text-center">
            <a href="https://www.districorr.com.ar" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 transition-colors">
              <span>www.districorr.com.ar</span>
              <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" /></svg>
            </a>
          </div>
        </div>
      </div>

      <!-- ESTADO 2: VISTA DE DATOS -->
      <div v-else class="max-w-6xl px-4 mx-auto sm:px-6 lg:px-8">
        <header class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
          <div>
            <div class="flex items-center gap-3 flex-wrap">
              <h1 class="text-2xl font-extrabold sm:text-3xl text-slate-950 dark:text-white tracking-tight">Mi Actividad Profesional</h1>
              
              <!-- Badge enlace a Districorr sitio oficial -->
              <a 
                href="https://www.districorr.com.ar" 
                target="_blank" 
                rel="noopener noreferrer" 
                class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-blue-600/10 text-blue-700 border border-blue-300/80 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-700/80 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600 dark:hover:text-white transition-all shadow-2xs hover:-translate-y-0.5 cursor-pointer"
                title="Visitar sitio web oficial de Districorr"
              >
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m-9 9a9 9 0 019-9"/></svg>
                <span>www.districorr.com.ar</span>
                <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" /></svg>
              </a>
            </div>

            <p class="mt-1 text-sm sm:text-base text-slate-600 dark:text-slate-300 font-medium">
              Consultá tus cirugías registradas, el estado de tus pagos y tus datos personales.
            </p>
          </div>
          
          <div class="flex items-center gap-3 shrink-0 self-end sm:self-auto">
            <!-- Toggle Modo Oscuro -->
            <button @click="isDarkMode = !isDarkMode" class="shrink-0 p-2.5 text-slate-500 bg-white border border-slate-200 shadow-xs hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700 dark:hover:bg-slate-700 rounded-full transition-all duration-200 hover:-translate-y-0.5 focus:outline-none cursor-pointer" :title="isDarkMode ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'">
              <svg v-if="!isDarkMode" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path></svg>
              <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
            </button>
          </div>
        </header>

        <!-- Tabs de Navegación Nativas Adaptables (Grid Celular / Flex Desktop) -->
        <div class="mb-6 sm:mb-8">
          <nav class="grid grid-cols-4 gap-1 p-1.5 bg-white/95 dark:bg-slate-900/95 border border-slate-200/90 dark:border-slate-800 rounded-2xl shadow-2xs sm:flex sm:items-center sm:gap-2 sm:w-fit">
            <button 
              @click="activeTab = 'resumen'"
              :class="[
                'flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 sm:py-2.5 rounded-xl text-[11px] sm:text-sm font-black transition-all duration-200 cursor-pointer select-none',
                activeTab === 'resumen' 
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 ring-2 ring-blue-500/20' 
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-white'
              ]"
            >
              <span class="text-base sm:text-sm">📊</span>
              <span class="hidden sm:inline">Resumen</span>
              <span class="sm:hidden text-[10px] sm:text-xs">Resumen</span>
            </button>

            <button 
              @click="activeTab = 'pagos'"
              :class="[
                'flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 sm:py-2.5 rounded-xl text-[11px] sm:text-sm font-black transition-all duration-200 cursor-pointer select-none',
                activeTab === 'pagos' 
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 ring-2 ring-blue-500/20' 
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-white'
              ]"
            >
              <span class="text-base sm:text-sm">💳</span>
              <span class="hidden sm:inline">Pagos y Comprobantes</span>
              <span class="sm:hidden text-[10px] sm:text-xs">Pagos</span>
            </button>

            <button 
              @click="activeTab = 'datos'"
              :class="[
                'flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 sm:py-2.5 rounded-xl text-[11px] sm:text-sm font-black transition-all duration-200 cursor-pointer select-none',
                activeTab === 'datos' 
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 ring-2 ring-blue-500/20' 
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-white'
              ]"
            >
              <span class="text-base sm:text-sm">👤</span>
              <span class="hidden sm:inline">Mi Perfil</span>
              <span class="sm:hidden text-[10px] sm:text-xs">Perfil</span>
            </button>

            <button 
              @click="activeTab = 'faq'"
              :class="[
                'flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 sm:py-2.5 rounded-xl text-[11px] sm:text-sm font-black transition-all duration-200 cursor-pointer select-none',
                activeTab === 'faq' 
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 ring-2 ring-blue-500/20' 
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-white'
              ]"
            >
              <span class="text-base sm:text-sm">❓</span>
              <span class="hidden sm:inline">Preguntas Frecuentes</span>
              <span class="sm:hidden text-[10px] sm:text-xs">Ayuda</span>
            </button>
          </nav>
        </div>

        <!-- TAB 1: RESUMEN DE PAGOS -->
        <div v-if="activeTab === 'resumen'">
          
          <!-- KPIs -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8 sm:gap-6 lg:mb-10">
            <div class="p-5 sm:p-6 bg-white border shadow-2xs border-slate-200/80 dark:bg-slate-900 rounded-2xl dark:border-slate-800 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5">
              <h3 class="text-xs font-extrabold tracking-wider uppercase text-slate-400 dark:text-slate-400">Cirugías pendientes de pago por Districorr</h3>
              <p class="mt-2.5 text-3xl font-extrabold sm:text-4xl text-slate-950 dark:text-white">{{ cirugiasPendientesCount }}</p>
            </div>
            <div class="p-5 sm:p-6 bg-white border shadow-2xs border-slate-200/80 dark:bg-slate-900 rounded-2xl dark:border-slate-800 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5">
              <h3 class="text-xs font-extrabold tracking-wider uppercase text-slate-400 dark:text-slate-400">Pagos realizados en el mes en curso</h3>
              <p class="mt-2.5 text-3xl font-extrabold sm:text-4xl text-slate-950 dark:text-white">{{ cirugiasCobradasMesCount }}</p>
            </div>
          </div>

          <div class="grid grid-cols-1 gap-8 lg:gap-10 lg:grid-cols-12">
            
            <!-- MAIN BLOCK: Pendientes -->
            <div class="lg:col-span-7">
              <h2 class="mb-5 text-xl font-extrabold text-slate-950 dark:text-white">Pendientes de liquidación</h2>
              
              <div v-if="pendientes.length > 0" class="space-y-4 sm:space-y-5">
                <div v-for="report in pendientes" :key="report.id" class="p-5 bg-white border shadow-2xs border-slate-200/80 sm:p-6 dark:bg-slate-900 rounded-2xl dark:border-slate-800 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5">
                  <div class="flex items-start justify-between gap-4 mb-3">
                    <div>
                      <p class="font-extrabold text-slate-950 dark:text-white">{{ report.paciente || 'No especificado' }}</p>
                      <p class="text-sm text-slate-600 dark:text-slate-400 mt-0.5">{{ report.fecha_cirugia ? formatDate(report.fecha_cirugia) : 'Fecha no disponible' }}</p>
                    </div>
                    <span class="inline-flex items-center px-3 py-1 text-xs font-bold border rounded-full shrink-0 bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/50">
                      <svg class="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>
                      Pendiente
                    </span>
                  </div>
                  <div class="flex items-start gap-3 p-3.5 mt-4 mb-5 text-sm border rounded-xl bg-sky-50/80 text-sky-900 dark:bg-sky-950/40 dark:text-sky-200 border-sky-200/80 dark:border-sky-800">
                    <svg class="w-5 h-5 shrink-0 text-sky-600 dark:text-sky-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" /></svg>
                    <p class="leading-relaxed text-xs sm:text-sm">Esta cirugía será incluida en una próxima orden de pago cuando se genere la liquidación correspondiente.</p>
                  </div>
                  <button @click="openDetailModal(report, false)" class="inline-flex items-center justify-center px-4 py-2 text-xs font-extrabold transition-all duration-200 rounded-xl text-slate-700 bg-slate-100 hover:bg-slate-200 focus:outline-none dark:text-slate-200 dark:bg-slate-800 dark:border dark:border-slate-700 dark:hover:bg-slate-700 hover:-translate-y-0.5 cursor-pointer">
                    Ver detalle
                  </button>
                </div>
              </div>
              
              <div v-else class="px-6 py-10 text-center bg-white border shadow-2xs border-slate-200/80 dark:bg-slate-900 rounded-2xl dark:border-slate-800 text-slate-500">
                No tenés cirugías pendientes de liquidación.
              </div>
            </div>
            
            <!-- SECONDARY BLOCK: Comprobantes -->
            <div class="lg:col-span-5">
              <h2 class="mb-5 text-xl font-extrabold text-slate-950 dark:text-white">Últimos comprobantes cargados</h2>
              
              <div v-if="visibleComprobantes.length > 0" class="space-y-4 sm:space-y-5">
                <div v-for="comp in visibleComprobantes" :key="comp.key" class="p-5 bg-white border shadow-2xs border-slate-200/80 sm:p-6 dark:bg-slate-900 rounded-2xl dark:border-slate-800 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5">
                  <p class="mb-4 text-sm text-slate-600 dark:text-slate-400">
                    Comprobante de pago cargado el: <span class="font-bold text-slate-950 dark:text-slate-100">{{ comp.fecha_pago ? formatDate(comp.fecha_pago) : 'Fecha no disponible' }}</span>
                  </p>
                  
                  <div class="p-4 mb-5 border rounded-xl bg-slate-50 border-slate-100 dark:border-slate-800 dark:bg-slate-950/50">
                    <p class="mb-2.5 text-xs font-extrabold tracking-wider uppercase text-slate-400 dark:text-slate-500">Pacientes incluidos</p>
                    <ul class="space-y-1.5 text-sm text-slate-700 dark:text-slate-300 font-medium">
                      <li v-for="(paciente, index) in comp.pacientes.slice(0, 3)" :key="index" class="flex items-center gap-2">
                        <span class="w-1.5 h-1.5 rounded-full bg-slate-400 dark:bg-slate-600"></span>
                        {{ paciente }}
                      </li>
                    </ul>
                    <p v-if="comp.pacientes.length > 3" class="mt-3 text-xs font-bold text-slate-500 dark:text-slate-400">
                      + {{ comp.pacientes.length - 3 }} más
                    </p>
                  </div>
                  
                  <a :href="getComprobanteUrl(comp.comprobante_object_key)" target="_blank" rel="noopener noreferrer" class="flex items-center justify-center w-full px-4 py-2.5 text-xs font-extrabold text-blue-700 transition-all duration-200 border border-blue-200 rounded-xl bg-blue-50 hover:bg-blue-100 focus:outline-none dark:bg-blue-950/40 dark:border-blue-800/60 dark:text-blue-300 dark:hover:bg-blue-900/50 hover:-translate-y-0.5">
                    Ver comprobante
                  </a>
                </div>
                
                <div v-if="comprobantesRecientes.length > 3" class="flex flex-col items-center pt-2 pb-4 text-center">
                  <button @click="activeTab = 'pagos'" class="px-5 py-2.5 text-xs font-extrabold text-blue-700 transition-all duration-200 bg-blue-50 border border-blue-200 rounded-xl dark:bg-blue-950/40 dark:border-blue-800/60 dark:text-blue-300 hover:bg-blue-100 hover:-translate-y-0.5 shadow-2xs cursor-pointer">
                    Ir a pagos y comprobantes
                  </button>
                </div>
              </div>
              
              <div v-else class="px-6 py-10 text-center bg-white border shadow-2xs border-slate-200/80 dark:bg-slate-900 rounded-2xl dark:border-slate-800 text-slate-500">
                Todavía no hay comprobantes cargados.
              </div>
            </div>
            
          </div>
        </div>

        <!-- TAB 2: PAGOS Y COMPROBANTES -->
        <div v-else-if="activeTab === 'pagos'" class="space-y-10">
          <!-- HEADER CON BOTÓN OBTENER REPORTE -->
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 lg:mb-8 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-2xs">
            <div>
              <h2 class="text-2xl font-extrabold text-slate-950 dark:text-white">Pagos y comprobantes</h2>
              <p class="max-w-2xl mt-1.5 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Acá podés controlar los pagos realizados por tus cirugías acompañadas, ver los comprobantes cargados y descargar tu reporte en PDF por período.
              </p>
            </div>

            <button 
              @click="isReportModalOpen = true"
              class="shrink-0 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-indigo-900 to-blue-900 hover:from-indigo-800 hover:to-blue-800 text-white font-extrabold text-xs shadow-md transition-all cursor-pointer hover:-translate-y-0.5"
            >
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" /></svg>
              <span>Descargar Reporte de Pagos</span>
            </button>
          </div>

          <!-- BLOQUE: CIRUGÍAS PENDIENTES DE PAGO -->
          <section>
            <h3 class="mb-5 text-xl font-extrabold text-slate-950 dark:text-white">Cirugías pendientes de pago</h3>
            <div v-if="pendientes.length > 0" class="space-y-4">
              <div v-for="report in pendientes" :key="report.id" class="p-5 bg-white border shadow-2xs border-slate-200/80 sm:p-6 dark:bg-slate-900 rounded-2xl dark:border-slate-800 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5">
                <div class="flex items-start justify-between gap-4 mb-3">
                  <div>
                    <p class="font-extrabold text-slate-950 dark:text-white">{{ report.paciente || 'No especificado' }}</p>
                    <p class="text-sm text-slate-600 dark:text-slate-400 mt-0.5">Cirugía realizada el <span class="font-bold text-slate-800 dark:text-slate-200">{{ report.fecha_cirugia ? formatDate(report.fecha_cirugia) : 'Fecha no disponible' }}</span></p>
                  </div>
                  <span class="inline-flex items-center px-3 py-1 text-xs font-bold border rounded-full shrink-0 bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/50">
                    <svg class="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>
                    Pendiente de pago
                  </span>
                </div>
                <div class="flex items-start gap-3 p-3.5 mt-4 mb-2 text-sm border rounded-xl bg-sky-50/80 text-sky-900 dark:bg-sky-950/40 dark:text-sky-200 border-sky-200/80 dark:border-sky-800">
                  <svg class="w-5 h-5 shrink-0 text-sky-600 dark:text-sky-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" /></svg>
                  <p class="leading-relaxed text-xs sm:text-sm">Esta cirugía será incluida en una próxima orden de pago cuando se procese la liquidación correspondiente.</p>
                </div>
              </div>
            </div>
            <div v-else class="px-6 py-10 text-center bg-white border shadow-2xs border-slate-200/80 dark:bg-slate-900 rounded-2xl dark:border-slate-800 text-slate-500">
              No tenés cirugías pendientes de cobro.
            </div>
          </section>

          <!-- BLOQUE: HISTORIAL DE PAGOS -->
          <section>
            <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-5">
              <h3 class="text-xl font-extrabold text-slate-950 dark:text-white">Historial de pagos</h3>
              
              <!-- Buscador Rápido en Historial de Pagos -->
              <div class="relative w-full sm:w-72">
                <input 
                  v-model="searchPagosQuery"
                  type="text"
                  placeholder="Buscar por paciente o N° orden..."
                  class="w-full pl-9 pr-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
                <svg class="w-4 h-4 text-slate-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
              </div>
            </div>

            <div v-if="historialLiquidacionesFiltradas.length > 0" class="space-y-8">
              <div v-for="(liquidaciones, mes) in liquidacionesAgrupadasPorMes" :key="mes" class="space-y-5">
                <h4 class="pb-2 text-lg font-bold border-b text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-700/50">{{ mes }}</h4>
                <div v-for="liq in liquidaciones" :key="liq.id" class="p-5 bg-white border shadow-2xs border-slate-200/80 sm:p-6 dark:bg-slate-900 rounded-2xl dark:border-slate-800 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5">
                
                <div class="flex flex-wrap items-start justify-between gap-4 mb-5">
                  <div>
                    <h4 class="flex items-center gap-2.5 text-lg font-bold text-slate-950 dark:text-white">
                      <svg class="w-5 h-5 text-slate-400 dark:text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V8.25ZM6.75 12h.008v.008H6.75V12Zm0 3h.008v.008H6.75V15Zm0 3h.008v.008H6.75V18Z" /></svg>
                      {{ liq.orden_de_pago_id ? 'Orden de pago #' + liq.orden_de_pago_id : 'Pago registrado' }}
                    </h4>
                    <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">
                      {{ liq.comprobante_object_key ? 'Comprobante subido el:' : 'Emitido el' }} 
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
                    <span class="font-bold text-slate-900 dark:text-slate-200">Pacientes abonados:</span> 
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
                  <button v-if="liq.cirugias.length > 0" @click="openDetailModal(liq, true)" class="inline-flex items-center justify-center px-4 py-2.5 text-xs font-extrabold transition-all duration-200 rounded-xl text-slate-700 bg-slate-100 hover:bg-slate-200 focus:outline-none dark:text-slate-200 dark:bg-slate-800 dark:border dark:border-slate-700 dark:hover:bg-slate-700 hover:-translate-y-0.5 cursor-pointer">
                    Abrir detalle
                  </button>

                  <!-- Botón Descargar PDF de esta orden -->
                  <button 
                    @click="descargarPDFOrdenIndividual(liq)" 
                    class="inline-flex items-center justify-center px-4 py-2.5 text-xs font-extrabold text-indigo-700 bg-indigo-50 border border-indigo-200 rounded-xl hover:bg-indigo-100 dark:bg-indigo-950/40 dark:border-indigo-800/60 dark:text-indigo-300 dark:hover:bg-indigo-900/50 transition-all duration-200 hover:-translate-y-0.5 cursor-pointer"
                    title="Descargar PDF individual de esta orden"
                  >
                    <svg class="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                    PDF Orden
                  </button>

                  <a v-if="liq.comprobante_object_key" :href="getComprobanteUrl(liq.comprobante_object_key)" target="_blank" rel="noopener noreferrer" class="inline-flex items-center justify-center px-4 py-2.5 text-xs font-extrabold text-blue-700 transition-all duration-200 border border-blue-200 rounded-xl bg-blue-50 hover:bg-blue-100 focus:outline-none dark:bg-blue-950/40 dark:border-blue-800/60 dark:text-blue-300 dark:hover:bg-blue-900/50 hover:-translate-y-0.5">
                    <svg class="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                    Ver comprobante
                  </a>
                </div>
              </div>
              </div>
              
              <!-- Cargar Más -->
              <div v-if="hasMoreLiquidaciones" class="flex justify-center pt-2">
                <button @click="cargarMasLiquidaciones" class="px-6 py-2.5 text-xs font-extrabold text-slate-700 bg-white border border-slate-300 rounded-xl shadow-2xs hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700 dark:hover:bg-slate-700 transition-all duration-200 hover:-translate-y-0.5 cursor-pointer">
                  Cargar más pagos
                </button>
              </div>
              <div v-else class="py-4 text-xs font-semibold text-center text-slate-400 dark:text-slate-500">
                No hay más pagos para mostrar.
              </div>
            </div>
            <div v-else class="px-6 py-10 text-center bg-white border shadow-2xs border-slate-200/80 dark:bg-slate-900 rounded-2xl dark:border-slate-800 text-slate-500">
              Todavía no hay pagos registrados que coincidan con la búsqueda.
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

      <!-- Modal de Reporte de Pagos PDF -->
      <ReportePagosModal 
        :show="isReportModalOpen" 
        :instrumentador="instrumentadorInfo" 
        :liquidaciones="historialLiquidaciones" 
        @close="isReportModalOpen = false" 
      />
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
import ReportePagosModal from '../components/ReportePagosModal.vue';
import { useReportePagosPDF } from '../composables/useReportePagosPDF';

const isAuthenticated = ref(false);
const isLoading = ref(false);
const error = ref(null);
const dni = ref('');
const allActivityData = ref([]);
const instrumentadorInfo = ref(null);
const activeTab = ref('resumen');
const isDetailModalOpen = ref(false);
const isReportModalOpen = ref(false);
const selectedLiquidacion = ref(null);
const isDarkMode = ref(false);
const searchPagosQuery = ref('');

const route = useRoute();
const toast = useToast();
const token = route.params.token;
const { generarReporteOrdenIndividual } = useReportePagosPDF();

const descargarPDFOrdenIndividual = (liq) => {
  generarReporteOrdenIndividual({
    instrumentador: instrumentadorInfo.value,
    liquidacion: liq
  });
  toast.success('Generando PDF de la orden...');
};

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