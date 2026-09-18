<!-- src/views/admin/HistorialPagosView.vue -->
<template>
  <div class="p-4 sm:p-6 lg:p-8 bg-slate-100/70 dark:bg-slate-950 min-h-screen">
    <div class="mb-6">
      <h1 class="text-2xl sm:text-3xl font-black tracking-tight text-slate-950 dark:text-white">Auditoría y Historial de Pagos</h1>
      <p class="text-slate-700 dark:text-slate-300 mt-1 text-xs sm:text-sm font-semibold">
        Auditá el historial de pagos, detectá comprobantes faltantes y utilizá las herramientas para corregir de forma masiva o individual.
      </p>
    </div>

    <!-- TARJETAS KPI DE SALUD DE CONCILIACIONES CON ANIMATE UI -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
      <!-- Total Órdenes -->
      <GlowCard class="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-300 dark:border-slate-800 shadow-md flex items-center justify-between" glow-color="rgba(37, 99, 235, 0.12)">
        <div>
          <span class="text-[11px] font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider block">Total Órdenes Registradas</span>
          <span class="text-2xl sm:text-3xl font-black text-slate-950 dark:text-white font-mono mt-1 block">
            <SlidingNumber :value="historial.length" />
          </span>
        </div>
        <div class="w-11 h-11 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 flex items-center justify-center border border-blue-200 dark:border-blue-800 shadow-xs">
          <Receipt class="w-5 h-5" />
        </div>
      </GlowCard>

      <!-- Con Comprobante -->
      <GlowCard class="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-300 dark:border-slate-800 shadow-md flex items-center justify-between" glow-color="rgba(16, 185, 129, 0.12)">
        <div>
          <span class="text-[11px] font-black text-emerald-800 dark:text-emerald-400 uppercase tracking-wider block">Con Comprobante Digital</span>
          <span class="text-2xl sm:text-3xl font-black text-emerald-800 dark:text-emerald-400 font-mono mt-1 block">
            <SlidingNumber :value="totalWithReceipt" />
          </span>
        </div>
        <div class="w-11 h-11 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center border border-emerald-200 dark:border-emerald-800 shadow-xs">
          <CheckCircle2 class="w-5 h-5" />
        </div>
      </GlowCard>

      <!-- Sin Comprobante (Filtro Interactivo) -->
      <GlowCard 
        @click="toggleFilterOnlyMissing" 
        :class="[
          'p-5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between shadow-md select-none',
          filterOnlyMissing 
            ? 'bg-rose-50/90 dark:bg-rose-955/60 border-rose-400 dark:border-rose-700 ring-2 ring-rose-500/30' 
            : 'bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-800 hover:border-rose-400 hover:scale-[1.01]'
        ]"
        glow-color="rgba(244, 63, 94, 0.15)"
      >
        <div>
          <div class="flex items-center gap-1.5 flex-wrap">
            <span class="text-[11px] font-black text-rose-800 dark:text-rose-400 uppercase tracking-wider">Sin Comprobante Adjunto</span>
            <AnimatedBadge v-if="filterOnlyMissing" variant="danger" size="xs" dot pulse>
              Filtro Activo
            </AnimatedBadge>
          </div>
          <span class="text-2xl sm:text-3xl font-black text-rose-800 dark:text-rose-400 font-mono mt-1 block">
            <SlidingNumber :value="totalWithoutReceipt" />
          </span>
        </div>
        <div class="w-11 h-11 rounded-xl bg-rose-50 dark:bg-rose-955 text-rose-700 dark:text-rose-400 flex items-center justify-center border border-rose-200 dark:border-rose-800 shadow-xs">
          <AlertTriangle class="w-5 h-5" />
        </div>
      </GlowCard>
    </div>

    <!-- BANNER DE ALERTA DE ÚLTIMA CONCILIACIÓN CON COMPROBANTES FALTANTES -->
    <div 
      v-if="latestBatchMissingCount > 0 && activeTab === 'historial'" 
      class="mb-6 p-4.5 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-rose-600 text-white shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in"
    >
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-white shrink-0 shadow-inner">
          <AlertTriangle class="w-5 h-5" />
        </div>
        <div>
          <h3 class="text-sm font-black">
            Última Conciliación: {{ latestBatchMissingCount }} {{ latestBatchMissingCount === 1 ? 'orden no tiene comprobante cargado' : 'órdenes no tienen comprobantes cargados' }}
          </h3>
          <p class="text-xs text-amber-100 font-bold">
            Usá el Auto-Matcher masivo para subir todos los comprobantes juntos sin tener que buscarlos uno a uno.
          </p>
        </div>
      </div>

      <button 
        @click="isModalAutoMatcherVisible = true" 
        class="px-4 py-2.5 bg-white text-slate-950 hover:bg-amber-50 font-black text-xs rounded-xl shadow-md transition cursor-pointer self-end sm:self-auto shrink-0 flex items-center gap-1.5 active:scale-95"
      >
        <Sparkles class="w-4 h-4 text-amber-600" />
        <span>Auto-Vincular Comprobantes Masivo ➔</span>
      </button>
    </div>

    <!-- Sistema de Pestañas y Acciones Principales -->
    <div class="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <nav class="p-1.5 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-2xl inline-flex gap-1.5 border border-slate-300 dark:border-slate-800 shadow-sm w-fit">
        <button
          @click="activeTab = 'historial'"
          :class="[
            'px-4 py-2 text-xs sm:text-sm font-black rounded-xl transition-all duration-200 active:scale-95 cursor-pointer',
            activeTab === 'historial'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
              : 'text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
          ]"
        >
          Historial de Órdenes
        </button>
        <button
          @click="activeTab = 'herramientas'"
          :class="[
            'px-4 py-2 text-xs sm:text-sm font-black rounded-xl transition-all duration-200 active:scale-95 cursor-pointer',
            activeTab === 'herramientas'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
              : 'text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
          ]"
        >
          Herramientas de Corrección
        </button>
      </nav>

      <!-- Acciones de Reportes y Automatización -->
      <div class="flex items-center gap-2.5 flex-wrap">
        <button 
          type="button"
          @click="isModalAutoMatcherVisible = true" 
          class="px-4 py-2.5 rounded-xl font-black text-xs sm:text-sm bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white shadow-md shadow-indigo-600/20 transition-all flex items-center gap-1.5 cursor-pointer"
          title="Emparejar y subir múltiples comprobantes bancarios en lote"
        >
          <Sparkles class="w-4 h-4" />
          <span>Auto-Matcher Masivo</span>
        </button>

        <button 
          type="button"
          @click="isModalAutomatizacionVisible = true" 
          class="px-4 py-2.5 rounded-xl font-black text-xs sm:text-sm bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 shadow-sm active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
          title="Configurar día, horario y destinatarios para el envío automático de reportes en PDF"
        >
          <Settings class="w-4 h-4 text-slate-600 dark:text-slate-400" />
          <span>Automatizar Reporte</span>
        </button>

        <!-- Botón de Reporte Ejecutivo por Período -->
        <ShimmerButton 
          type="button"
          @click="isModalPeriodoVisible = true" 
          class="px-4 py-2.5 text-xs sm:text-sm font-black cursor-pointer"
        >
          <FileText class="w-4 h-4" />
          <span>Generar Reporte por Período</span>
        </ShimmerButton>
      </div>
    </div>

    <!-- Contenido de la Pestaña "Historial" -->
    <div v-show="activeTab === 'historial'" class="space-y-6">
      <div v-if="isLoading" class="text-center py-16 bg-white dark:bg-slate-900 rounded-2xl border border-slate-300 dark:border-slate-800 shadow-md">
        <div class="inline-block w-8 h-8 border-4 border-slate-300 dark:border-slate-700 border-t-blue-600 rounded-full animate-spin"></div>
        <p class="text-slate-700 dark:text-slate-300 mt-3 text-sm font-bold">Cargando historial de pagos...</p>
      </div>

      <div v-else-if="error" class="bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 p-4 rounded-xl border border-rose-300 dark:border-rose-800 text-center text-sm font-bold shadow-sm">
        <p>Error al cargar el historial: {{ error }}</p>
      </div>

      <div v-else-if="historial.length === 0" class="text-center py-16 bg-white dark:bg-slate-900 rounded-2xl border border-slate-300 dark:border-slate-800 shadow-md">
        <p class="text-slate-700 dark:text-slate-300 text-sm font-bold">Aún no se han registrado órdenes de pago en el sistema.</p>
      </div>

      <div v-else class="space-y-6">
        <!-- Panel de Filtros Moderno -->
        <div class="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 p-5 rounded-2xl shadow-md space-y-4">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <h3 class="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                <Filter class="w-3.5 h-3.5 text-blue-600" />
                <span>Filtros de Búsqueda</span>
              </h3>
              <AnimatedBadge variant="neutral" size="xs">
                Mostrando {{ filteredHistorial.length }} de {{ historial.length }} {{ historial.length === 1 ? 'orden' : 'órdenes' }}
              </AnimatedBadge>
            </div>
            <button 
              v-if="hasActiveFilters" 
              @click="clearFilters" 
              class="text-xs font-black text-blue-700 dark:text-blue-400 hover:underline transition-colors flex items-center gap-1 cursor-pointer"
            >
              <X class="w-3.5 h-3.5" />
              <span>Limpiar Filtros</span>
            </button>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div class="space-y-1.5">
              <label class="block text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider">Buscar por ID, DNI o Profesional</label>
              <div class="relative rounded-xl border border-slate-300 dark:border-slate-700 overflow-hidden bg-slate-50 dark:bg-slate-950/60 focus-within:border-blue-600 focus-within:ring-2 focus-within:ring-blue-500/20 transition-all shadow-inner">
                <Search class="w-4 h-4 text-slate-500 absolute left-3 top-3.5" />
                <input type="text" v-model="dniFilter" placeholder="Ej: #15, 12345678 o Nombre..." class="w-full pl-9 pr-4 py-2.5 bg-transparent border-none text-slate-950 dark:text-white text-xs sm:text-sm font-bold placeholder:text-slate-400 placeholder:font-normal focus:outline-none"/>
              </div>
            </div>
            
            <div class="space-y-1.5">
              <label for="start-date" class="block text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider">Fecha Desde</label>
              <div class="relative rounded-xl border border-slate-300 dark:border-slate-700 overflow-hidden bg-slate-50 dark:bg-slate-950/60 focus-within:border-blue-600 focus-within:ring-2 focus-within:ring-blue-500/20 transition-all shadow-inner">
                <input id="start-date" type="date" v-model="startDateFilter" class="w-full px-3 py-2.5 bg-transparent border-none text-slate-950 dark:text-white text-xs sm:text-sm font-bold focus:outline-none"/>
              </div>
            </div>
            
            <div class="space-y-1.5">
              <label for="end-date" class="block text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider">Fecha Hasta</label>
              <div class="relative rounded-xl border border-slate-300 dark:border-slate-700 overflow-hidden bg-slate-50 dark:bg-slate-950/60 focus-within:border-blue-600 focus-within:ring-2 focus-within:ring-blue-500/20 transition-all shadow-inner">
                <input id="end-date" type="date" v-model="endDateFilter" class="w-full px-3 py-2.5 bg-transparent border-none text-slate-950 dark:text-white text-xs sm:text-sm font-bold focus:outline-none"/>
              </div>
            </div>
          </div>
        </div>

        <!-- Tabla de Historial Premium -->
        <div v-if="filteredHistorial.length === 0" class="text-center py-16 bg-white dark:bg-slate-900 rounded-2xl border border-slate-300 dark:border-slate-800 shadow-md">
          <p class="text-slate-700 dark:text-slate-300 text-sm font-bold">No se encontraron órdenes de pago que coincidan con los filtros aplicados.</p>
        </div>

        <div v-else class="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 shadow-md rounded-2xl overflow-hidden">
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
              <thead class="bg-slate-50 dark:bg-slate-900 border-b border-slate-300 dark:border-slate-800">
                <tr>
                  <th class="px-5 py-3.5 text-left text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider">ID Orden</th>
                  <th class="px-5 py-3.5 text-left text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider">Fecha de Emisión</th>
                  <th class="px-5 py-3.5 text-left text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider">Monto Total</th>
                  <th class="px-5 py-3.5 text-left text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider">Instrumentador(es)</th>
                  <th class="px-5 py-3.5 text-center text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-200 dark:divide-slate-800/60 bg-white dark:bg-slate-900">
                <tr v-for="orden in filteredHistorial" :key="orden.id" class="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                  <td class="px-5 py-3.5 whitespace-nowrap text-sm font-bold text-slate-900 dark:text-slate-100">
                    <span class="inline-flex items-center px-2.5 py-1 text-xs font-black rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-700 font-mono shadow-xs">
                      #{{ orden.id }}
                    </span>
                  </td>
                  <td class="px-5 py-3.5 whitespace-nowrap text-sm font-bold text-slate-800 dark:text-slate-200">
                    {{ formatDate(orden.fecha_emision) }}
                  </td>
                  <td class="px-5 py-3.5 whitespace-nowrap text-sm font-black text-slate-950 dark:text-white font-mono">
                    {{ formatCurrency(orden.monto_total_general) }}
                  </td>
                  <td class="px-5 py-3.5 text-xs font-bold text-slate-800 dark:text-slate-200 max-w-xs truncate" :title="orden.instrumentadores_nombres">
                    {{ orden.instrumentadores_nombres }}
                  </td>
                  <td class="px-5 py-3.5 whitespace-nowrap text-center">
                    <div class="flex items-center justify-center gap-2">
                      <button @click="verDetalle(orden)" class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black text-slate-900 dark:text-white bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 transition-all shadow-xs cursor-pointer active:scale-95">
                        <Eye class="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                        <span>Ver Detalle</span>
                      </button>

                      <button 
                        @click="descargarPDFOrden(orden)" 
                        :disabled="loadingPdfOrdenId === orden.id"
                        class="p-2 rounded-xl text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800/60 hover:bg-rose-100 transition-all shadow-xs cursor-pointer active:scale-95 disabled:opacity-50"
                        title="Descargar Reporte PDF de la Orden"
                      >
                        <div v-if="loadingPdfOrdenId === orden.id" class="w-4 h-4 border-2 border-rose-600 border-t-transparent rounded-full animate-spin"></div>
                        <FileDown v-else class="w-4 h-4" />
                      </button>

                      <button 
                        @click="abrirCompartir(orden)" 
                        class="p-2 rounded-xl text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800/60 hover:bg-emerald-100 transition-all shadow-xs cursor-pointer active:scale-95" 
                        title="Compartir Enlace"
                      >
                        <Share2 class="w-4 h-4" />
                      </button>

                      <!-- Comprobante Bancario -->
                      <a v-if="orden.comprobante_object_key" 
                         :href="getComprobanteUrl(orden.comprobante_object_key)" 
                         target="_blank" 
                         rel="noopener noreferrer"
                         class="p-2 rounded-xl text-indigo-700 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-300 dark:border-indigo-800/60 hover:bg-indigo-100 transition-all shadow-xs cursor-pointer active:scale-95"
                         title="Ver / Descargar Comprobante Bancario">
                        <Paperclip class="w-4 h-4" />
                      </a>

                      <button v-else 
                              @click="irACorregirComprobante(orden)"
                              class="px-2.5 py-1 rounded-xl text-[11px] font-black text-rose-800 dark:text-rose-300 bg-rose-50 dark:bg-rose-955 border border-rose-300 dark:border-rose-900 hover:bg-rose-100 transition-all cursor-pointer flex items-center gap-1 shadow-xs"
                              title="Sin comprobante bancario adjunto (Haz clic para adjuntar)">
                        <Paperclip class="w-3 h-3" />
                        <span>Adjuntar</span>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <!-- Contenido de la Pestaña "Herramientas" -->
    <div v-show="activeTab === 'herramientas'">
      <CorrectionWorkspace 
        ref="correctionWorkspaceRef" 
        @open-auto-matcher="isModalAutoMatcherVisible = true" 
        @updated="fetchHistorial" 
      />
    </div>

    <!-- Modal Detalle Oficial de la Orden de Pago -->
    <OrdenDePagoDetalleModal
      :is-visible="isModalVisible"
      :show="isModalVisible"
      :orden-id="selectedOrdenId"
      @close="isModalVisible = false"
    />

    <!-- Modal Auto-Matcher Masivo de Comprobantes -->
    <AutoMatcherComprobantesModal
      :show="isModalAutoMatcherVisible"
      :orders="historial"
      @close="isModalAutoMatcherVisible = false"
      @updated="fetchHistorial"
    />

    <!-- Modal Reporte Ejecutivo por Período / Instrumentador -->
    <ModalReportePagosPeriodo
      :show="isModalPeriodoVisible"
      :historial="historial"
      @close="isModalPeriodoVisible = false"
    />

    <!-- Modal Configuración de Automatización Semanal de Pagos -->
    <ConfigurarAutomatizacionPagosModal
      :show="isModalAutomatizacionVisible"
      @close="isModalAutomatizacionVisible = false"
    />

    <!-- Modal Compartir Enlace/Mensaje con GlassModal -->
    <GlassModal
      :show="isShareModalVisible"
      max-width="max-w-lg"
      @close="cerrarCompartir"
    >
      <template #title>
        Compartir Acceso
      </template>
      <template #description>
        Orden #{{ selectedOrdenForShare?.id }} — Enlaces y mensajes para los instrumentadores.
      </template>

      <div class="space-y-4">
        <div v-for="inst in shareInstrumentadores" :key="inst.dni" class="p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-300 dark:border-slate-700 shadow-sm space-y-3">
          <div class="flex justify-between items-center">
            <div>
              <h4 class="text-sm font-black text-slate-900 dark:text-white">{{ inst.nombre }}</h4>
              <p class="text-[10px] text-slate-600 dark:text-slate-400 font-bold uppercase tracking-wider mt-0.5">DNI: {{ inst.dni }}</p>
            </div>
            <div v-if="inst.loading" class="flex items-center gap-1 text-xs text-slate-500 font-bold">
              <div class="w-3.5 h-3.5 border-2 border-slate-300 border-t-indigo-600 rounded-full animate-spin"></div>
              <span>Generando...</span>
            </div>
          </div>

          <div v-if="!inst.loading" class="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2">
            <button 
              @click="copiarTexto(getShareLink(inst), 'Enlace')"
              :disabled="!inst.token"
              class="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 hover:bg-slate-200 cursor-pointer transition shadow-xs disabled:opacity-50"
            >
              <Copy class="w-3.5 h-3.5" />
              <span>Copiar Enlace</span>
            </button>
            <button 
              @click="copiarTexto(getWhatsAppMessage(inst), 'Mensaje de WhatsApp')"
              :disabled="!inst.token"
              class="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 hover:bg-emerald-100 cursor-pointer transition shadow-xs disabled:opacity-50"
            >
              <MessageCircle class="w-3.5 h-3.5" />
              <span>Mensaje WhatsApp</span>
            </button>
            <button 
              @click="descargarPDFInstrumentador(inst)"
              :disabled="loadingPdfInstDni === inst.dni"
              class="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-rose-800 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800 hover:bg-rose-100 cursor-pointer transition shadow-xs disabled:opacity-50"
            >
              <div v-if="loadingPdfInstDni === inst.dni" class="w-3 h-3 border-2 border-rose-500 border-t-transparent rounded-full animate-spin"></div>
              <FileDown v-else class="w-3.5 h-3.5" />
              <span>Descargar PDF</span>
            </button>
          </div>
        </div>
      </div>

      <template #footer>
        <button @click="cerrarCompartir" class="px-4 py-2 text-xs font-bold rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 cursor-pointer">
          Cerrar
        </button>
      </template>
    </GlassModal>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { supabase } from '../../services/supabase';
import { useToasts } from '../../composables/useToasts';
import { useReportePagosPDF } from '../../composables/useReportePagosPDF';
import OrdenDePagoDetalleModal from '../../components/admin/OrdenDePagoDetalleModal.vue';
import ModalReportePagosPeriodo from '../../components/admin/ModalReportePagosPeriodo.vue';
import ConfigurarAutomatizacionPagosModal from '../../components/admin/ConfigurarAutomatizacionPagosModal.vue';
import CorrectionWorkspace from '../../components/admin/corrections/CorrectionWorkspace.vue';
import AutoMatcherComprobantesModal from '../../components/admin/corrections/AutoMatcherComprobantesModal.vue';
import { GlowCard, SlidingNumber, AnimatedBadge, ShimmerButton, GlassModal } from '../../components/ui';
import { 
  Receipt, 
  CheckCircle2, 
  AlertTriangle, 
  Sparkles, 
  Settings, 
  FileText, 
  Filter, 
  X, 
  Search, 
  Eye, 
  FileDown, 
  Share2, 
  Paperclip, 
  Copy, 
  MessageCircle 
} from 'lucide-vue-next';

const { showSuccessToast, showErrorToast } = useToasts();
const { generarReporteDesdeDetalleOrden } = useReportePagosPDF();

const activeTab = ref('historial');
const historial = ref([]);
const isLoading = ref(true);
const error = ref(null);
const isModalVisible = ref(false);
const isModalPeriodoVisible = ref(false);
const isModalAutomatizacionVisible = ref(false);
const isModalAutoMatcherVisible = ref(false);
const correctionWorkspaceRef = ref(null);
const selectedOrdenId = ref(null);
const dniFilter = ref('');
const startDateFilter = ref('');
const endDateFilter = ref('');
const filterOnlyMissing = ref(false);

// Estado de carga para PDFs
const loadingPdfOrdenId = ref(null);
const loadingPdfInstDni = ref(null);

// Compartir
const isShareModalVisible = ref(false);
const selectedOrdenForShare = ref(null);
const shareInstrumentadores = ref([]);

// Métricas de salud de comprobantes
const totalWithReceipt = computed(() => {
  return historial.value.filter(o => Boolean(o.comprobante_object_key)).length;
});

const totalWithoutReceipt = computed(() => {
  return historial.value.filter(o => !o.comprobante_object_key).length;
});

const latestBatchMissingCount = computed(() => {
  if (!historial.value || historial.value.length === 0) return 0;
  const latestDateStr = historial.value[0]?.fecha_emision ? String(historial.value[0].fecha_emision).substring(0, 10) : null;
  if (!latestDateStr) return 0;
  return historial.value.filter(o => String(o.fecha_emision || '').substring(0, 10) === latestDateStr && !o.comprobante_object_key).length;
});

function toggleFilterOnlyMissing() {
  filterOnlyMissing.value = !filterOnlyMissing.value;
}

function irACorregirComprobante(orden) {
  activeTab.value = 'herramientas';
  setTimeout(() => {
    correctionWorkspaceRef.value?.selectOrder(orden);
  }, 100);
}

const hasActiveFilters = computed(() => {
  return Boolean(dniFilter.value.trim() || startDateFilter.value || endDateFilter.value || filterOnlyMissing.value);
});

function clearFilters() {
  dniFilter.value = '';
  startDateFilter.value = '';
  endDateFilter.value = '';
  filterOnlyMissing.value = false;
}

const filteredHistorial = computed(() => {
  let items = historial.value;

  if (dniFilter.value.trim()) {
    const rawSearch = dniFilter.value.trim().toLowerCase();
    const searchWithoutHash = rawSearch.replace(/^#/, '');

    items = items.filter(orden => {
      const matchId = String(orden.id || '').toLowerCase().includes(searchWithoutHash);

      let matchDni = false;
      if (Array.isArray(orden.instrumentadores_dnis)) {
        matchDni = orden.instrumentadores_dnis.some(dni => String(dni).toLowerCase().includes(rawSearch));
      } else if (orden.instrumentadores_dnis) {
        matchDni = String(orden.instrumentadores_dnis).toLowerCase().includes(rawSearch);
      }

      let matchNombre = false;
      if (Array.isArray(orden.instrumentadores_nombres)) {
        matchNombre = orden.instrumentadores_nombres.some(n => String(n).toLowerCase().includes(rawSearch));
      } else if (orden.instrumentadores_nombres) {
        matchNombre = String(orden.instrumentadores_nombres).toLowerCase().includes(rawSearch);
      }

      return matchId || matchDni || matchNombre;
    });
  }

  if (startDateFilter.value) {
    items = items.filter(orden => {
      if (!orden.fecha_emision) return false;
      const fechaStr = String(orden.fecha_emision).substring(0, 10);
      return fechaStr >= startDateFilter.value;
    });
  }

  if (endDateFilter.value) {
    items = items.filter(orden => {
      if (!orden.fecha_emision) return false;
      const fechaStr = String(orden.fecha_emision).substring(0, 10);
      return fechaStr <= endDateFilter.value;
    });
  }

  if (filterOnlyMissing.value) {
    items = items.filter(orden => !orden.comprobante_object_key);
  }

  return items;
});

async function fetchHistorial() {
  try {
    isLoading.value = true;
    const { data, error: rpcError } = await supabase.rpc('obtener_historial_ordenes_pago');
    if (rpcError) throw rpcError;
    historial.value = data || [];
  } catch (err) {
    console.error('Error al obtener el historial de pagos:', err);
    error.value = err.message;
  } finally {
    isLoading.value = false;
  }
}

function verDetalle(orden) {
  selectedOrdenId.value = orden.id;
  isModalVisible.value = true;
}

async function descargarPDFOrden(orden) {
  loadingPdfOrdenId.value = orden.id;
  try {
    const { data, error: rpcError } = await supabase.rpc('obtener_detalle_orden_pago', { p_orden_id: orden.id });
    if (rpcError) throw rpcError;
    if (!data) throw new Error('No se encontraron detalles para esta orden.');

    generarReporteDesdeDetalleOrden(data);
    showSuccessToast(`Reporte oficial de Orden #${orden.id} descargado.`);
  } catch (err) {
    console.error('Error al descargar PDF:', err);
    showErrorToast(err, 'No se pudo generar el reporte PDF.');
  } finally {
    loadingPdfOrdenId.value = null;
  }
}

async function descargarPDFInstrumentador(inst) {
  if (!selectedOrdenForShare.value) return;
  loadingPdfInstDni.value = inst.dni;
  try {
    const { data, error: rpcError } = await supabase.rpc('obtener_detalle_orden_pago', { p_orden_id: selectedOrdenForShare.value.id });
    if (rpcError) throw rpcError;
    if (!data) throw new Error('No se encontraron datos para la orden.');

    // Filtrar la orden solo para el instrumentador seleccionado
    const singleData = {
      ...data,
      pagos_instrumentadores: (data.pagos_instrumentadores || []).filter(p => String(p.instrumentador_dni) === String(inst.dni))
    };

    generarReporteDesdeDetalleOrden(singleData);
    showSuccessToast(`Reporte individual descargado para ${inst.nombre}.`);
  } catch (err) {
    console.error('Error al descargar PDF individual:', err);
    showErrorToast(err, 'No se pudo generar el PDF individual.');
  } finally {
    loadingPdfInstDni.value = null;
  }
}

function getShareLink(inst) {
  if (!inst.token) return '';
  const origin = window.location.origin;
  return `${origin}/resumen/${inst.token}`;
}

function getWhatsAppMessage(inst) {
  const link = getShareLink(inst);
  return `Hola ${inst.nombre}, ya podés consultar el comprobante y detalle de tu liquidación en Gestión IQ ingresando a: ${link}`;
}

async function copiarTexto(texto, label) {
  if (!texto) return;
  try {
    await navigator.clipboard.writeText(texto);
    showSuccessToast(`${label} copiado al portapapeles.`);
  } catch (e) {
    console.error('Error al copiar:', e);
    showErrorToast('No se pudo copiar automáticamente.');
  }
}

async function abrirCompartir(orden) {
  selectedOrdenForShare.value = orden;
  isShareModalVisible.value = true;
  shareInstrumentadores.value = [];

  let dnis = [];
  let nombres = [];

  if (Array.isArray(orden.instrumentadores_dnis)) {
    dnis = orden.instrumentadores_dnis;
  } else if (orden.instrumentadores_dnis) {
    dnis = String(orden.instrumentadores_dnis).split(',').map(s => s.trim());
  }

  if (Array.isArray(orden.instrumentadores_nombres)) {
    nombres = orden.instrumentadores_nombres;
  } else if (orden.instrumentadores_nombres) {
    nombres = String(orden.instrumentadores_nombres).split(',').map(s => s.trim());
  }

  const list = dnis.map((dni, idx) => ({
    dni,
    nombre: nombres[idx] || `Instrumentador (${dni})`,
    token: null,
    loading: true
  }));

  shareInstrumentadores.value = list;

  for (const inst of shareInstrumentadores.value) {
    try {
      const { data, error: rpcError } = await supabase.rpc('generar_token_resumen_instrumentador', {
        p_dni: inst.dni
      });
      if (rpcError) throw rpcError;
      inst.token = data;
    } catch (err) {
      console.error(`Error al generar el token para ${inst.nombre}:`, err);
    } finally {
      inst.loading = false;
    }
  }
}

function cerrarCompartir() {
  isShareModalVisible.value = false;
  selectedOrdenForShare.value = null;
  shareInstrumentadores.value = [];
}

const formatCurrency = (value) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(value || 0);
const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('es-AR', { timeZone: 'UTC' });
};
const getComprobanteUrl = (objectKey) => {
  if (!objectKey) return '#';
  const R2_PUBLIC_URL = import.meta.env.VITE_R2_PUBLIC_URL;
  return `${R2_PUBLIC_URL}/${objectKey}`;
};

onMounted(() => {
  fetchHistorial();
});

watch(activeTab, (newTab) => {
  if (newTab === 'historial') {
    fetchHistorial();
  }
});
</script>