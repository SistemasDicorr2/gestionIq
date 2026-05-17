<template>
  <div class="min-h-full bg-slate-50 p-4 text-slate-900 dark:bg-slate-900 dark:text-slate-100 sm:p-6 lg:p-8">
    <div class="mx-auto flex max-w-7xl flex-col gap-6">
      <section class="rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800 sm:p-5">
        <div class="grid gap-4 md:grid-cols-[1fr_1fr_180px_auto_auto] md:items-end">
          <label class="filter-field">
            <span>Fecha desde</span>
            <input v-model="draftFilters.from" type="date" class="form-input" />
          </label>
          <label class="filter-field">
            <span>Fecha hasta</span>
            <input v-model="draftFilters.to" type="date" class="form-input" />
          </label>
          <label class="filter-field">
            <span>Estado</span>
            <input value="Pendiente" type="text" class="form-input bg-slate-100 text-slate-500 dark:bg-slate-800" disabled />
          </label>
          <button class="primary-button" :disabled="loading" @click="applyFilters">
            {{ loading ? 'Consultando...' : 'Aplicar filtros' }}
          </button>
          <button class="secondary-button" :disabled="loading" @click="resetFilters">Limpiar filtros</button>
        </div>
      </section>

      <div v-if="error" class="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-200">
        {{ error }}
      </div>

      <CandidateBlock
        title="Fichas digitales pendientes de completar"
        description="Selecciona las cirugias pendientes que queres informar como casos donde la ficha fue compartida o solicitada al tecnico, pero aun no fue completada."
        :rows="pendingRows"
        :visible-rows="visiblePendingRowsForFicha"
        :selected-ids="selectedPendingFichaIds"
        :loading="loading"
        :search="pendingSearch"
        :columns="pendingFichaColumns"
        empty-message="No se encontraron casos para este criterio."
        @update:search="pendingSearch = $event"
        @toggle-row="togglePendingFichaSelection"
        @toggle-visible="toggleAllVisiblePendingFicha"
      />

      <CandidateBlock
        title="Cirugias sin tecnico/instrumentador informado"
        description="Selecciona las cirugias pendientes que queres informar como casos donde aun no se cuenta con informacion clara del tecnico/instrumentador que realizo o realizara la cobertura."
        :rows="pendingRows"
        :visible-rows="visiblePendingRowsForTechnician"
        :selected-ids="selectedWithoutTechnicianIds"
        :loading="loading"
        :search="withoutTechnicianSearch"
        :columns="pendingColumns"
        empty-message="No se encontraron casos para este criterio."
        @update:search="withoutTechnicianSearch = $event"
        @toggle-row="toggleWithoutTechnicianSelection"
        @toggle-visible="toggleAllVisibleWithoutTechnician"
      />

      <section class="rounded-lg border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">
        <div class="flex flex-col gap-3 border-b border-slate-200 p-4 dark:border-slate-700 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 class="text-lg font-semibold">Vista previa del informe</h2>
            <p class="text-sm text-slate-500 dark:text-slate-400">{{ selectedCount }} caso(s) seleccionado(s)</p>
          </div>
          <div class="flex flex-wrap gap-2">
            <button class="secondary-button" :disabled="selectedCount === 0" @click="clearSelections">Limpiar seleccion</button>
            <button class="primary-button" :disabled="selectedCount === 0" @click="copyReport">Copiar informe HTML</button>
          </div>
        </div>
        <div class="p-4">
          <div
            v-if="selectedCount > 0"
            class="rounded border border-slate-200 bg-white p-4 text-slate-900 dark:border-slate-600"
            v-html="reportHtml"
          ></div>
          <p v-else class="rounded border border-dashed border-slate-300 px-4 py-8 text-center text-sm text-slate-500 dark:border-slate-600 dark:text-slate-400">
            Selecciona al menos un caso para generar el informe.
          </p>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { computed, defineComponent, h, inject, markRaw, onMounted, onUnmounted, reactive, ref } from 'vue';
import { useToast } from 'vue-toastification';
import { supabase } from '../services/supabase.js';
import { ClipboardDocumentIcon } from '@heroicons/vue/24/outline';

const REPORT_FIELDS = [
  'id',
  'id_cirugia',
  'paciente',
  'medico',
  'lugar_cirugia',
  'fecha_cirugia',
  'estado',
  'instrumentador',
  'instrumentador_dni',
  'instrumentador_completado',
].join(',');

const pendingFichaColumns = [
  { key: 'fecha', label: 'Fecha CX', class: 'w-28' },
  { key: 'codigo', label: 'Codigo CX', class: 'w-28' },
  { key: 'paciente', label: 'Paciente', class: 'w-48' },
  { key: 'institucion', label: 'Institucion', class: 'w-56' },
  { key: 'medico', label: 'Medico', class: 'w-48' },
  { key: 'tecnico', label: 'Tecnico / Instrumentador', class: 'w-56' },
  { key: 'estado', label: 'Estado', class: 'w-28' },
];

const pendingColumns = pendingFichaColumns;

const toast = useToast();
const headerConfig = inject('header-config', null);

const loading = ref(false);
const error = ref('');
const appliedFilters = ref(getDefaultFilters());
const draftFilters = reactive({ ...appliedFilters.value });
const reports = ref([]);
const pendingSearch = ref('');
const withoutTechnicianSearch = ref('');
const selectedPendingFichaIds = ref(new Set());
const selectedWithoutTechnicianIds = ref(new Set());

const CandidateBlock = defineComponent({
  name: 'CandidateBlock',
  props: {
    title: { type: String, required: true },
    description: { type: String, required: true },
    rows: { type: Array, required: true },
    visibleRows: { type: Array, required: true },
    selectedIds: { type: Set, required: true },
    loading: { type: Boolean, required: true },
    search: { type: String, required: true },
    columns: { type: Array, required: true },
    emptyMessage: { type: String, required: true },
  },
  emits: ['update:search', 'toggle-row', 'toggle-visible'],
  setup(props, { emit }) {
    const allVisibleSelected = computed(() => (
      props.visibleRows.length > 0 && props.visibleRows.every((row) => props.selectedIds.has(row.id))
    ));

    return () => h('section', { class: 'overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800' }, [
      h('div', { class: 'flex flex-col gap-3 border-b border-slate-200 p-3 dark:border-slate-700 lg:flex-row lg:items-center lg:justify-between' }, [
        h('div', [
          h('h2', { class: 'text-base font-semibold' }, props.title),
          h('p', { class: 'mt-1 max-w-3xl text-xs text-slate-600 dark:text-slate-300' }, props.description),
          h('p', { class: 'text-xs text-slate-500 dark:text-slate-400' }, [
            `Pendientes del periodo: ${props.rows.length}`,
            ' | ',
            `Mostrando: ${props.visibleRows.length}`,
            ' | ',
            `Seleccionados para este informe: ${props.selectedIds.size}`,
          ]),
        ]),
        h('div', { class: 'flex flex-col gap-2 sm:flex-row sm:items-center' }, [
          h('input', {
            class: 'form-input min-w-0 sm:w-72',
            value: props.search,
            placeholder: 'Buscar en candidatos...',
            onInput: (event) => emit('update:search', event.target.value),
          }),
          h('label', { class: 'flex items-center gap-2 whitespace-nowrap text-xs text-slate-600 dark:text-slate-300' }, [
            h('input', {
              type: 'checkbox',
              class: 'h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500',
              checked: allVisibleSelected.value,
              disabled: props.visibleRows.length === 0,
              onChange: () => emit('toggle-visible'),
            }),
            'Seleccionar todos los visibles',
          ]),
        ]),
      ]),
      h('div', { class: 'max-h-96 overflow-auto' }, [
        h('table', { class: 'min-w-[980px] table-fixed divide-y divide-slate-200 dark:divide-slate-700' }, [
          h('thead', { class: 'sticky top-0 z-10 bg-slate-50 shadow-sm dark:bg-slate-700' }, [
            h('tr', [
              h('th', { class: 'w-10 px-3 py-2' }),
              ...props.columns.map((column) => h('th', { class: ['table-header', column.class], key: column.key }, column.label)),
            ]),
          ]),
          h('tbody', { class: 'divide-y divide-slate-200 bg-white dark:divide-slate-700 dark:bg-slate-800' }, [
            props.loading
              ? h('tr', [h('td', { class: 'px-4 py-8 text-center text-sm text-slate-500 dark:text-slate-400', colspan: props.columns.length + 1 }, 'Cargando candidatos...')])
              : props.visibleRows.length === 0
                ? h('tr', [h('td', { class: 'px-4 py-8 text-center text-sm text-slate-500 dark:text-slate-400', colspan: props.columns.length + 1 }, props.emptyMessage)])
                : props.visibleRows.map((row) => h('tr', {
                  key: row.id,
                  class: props.selectedIds.has(row.id) ? 'bg-blue-50 dark:bg-blue-950/30' : '',
                }, [
                  h('td', { class: 'px-3 py-2' }, h('input', {
                    type: 'checkbox',
                    class: 'h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500',
                    checked: props.selectedIds.has(row.id),
                    onChange: () => emit('toggle-row', row.id),
                  })),
                  ...props.columns.map((column) => renderBodyCell(row, column)),
                ])),
          ]),
        ]),
      ]),
    ]);
  },
});

const pendingRows = computed(() => reports.value.map(toRow));

const visiblePendingRowsForFicha = computed(() => filterRows(pendingRows.value, pendingSearch.value, ['paciente', 'codigo', 'tecnico', 'medico', 'institucion']));
const visiblePendingRowsForTechnician = computed(() => filterRows(pendingRows.value, withoutTechnicianSearch.value, ['paciente', 'codigo', 'tecnico', 'medico', 'institucion']));

const selectedPendingFichaRows = computed(() => pendingRows.value.filter((row) => selectedPendingFichaIds.value.has(row.id)));
const selectedWithoutTechnicianRows = computed(() => pendingRows.value.filter((row) => selectedWithoutTechnicianIds.value.has(row.id)));
const selectedCount = computed(() => selectedPendingFichaIds.value.size + selectedWithoutTechnicianIds.value.size);

const reportHtml = computed(() => buildReportHtml());
const reportPlainText = computed(() => buildReportPlainText());

onMounted(() => {
  if (headerConfig) {
    headerConfig.value = {
      title: 'Informe Semanal',
      buttons: [
        {
          text: 'Copiar informe',
          action: copyReport,
          class: 'bg-blue-600 text-white font-bold py-2 px-4 rounded-lg shadow hover:bg-blue-700 flex items-center space-x-2 disabled:opacity-50',
          icon: markRaw(ClipboardDocumentIcon),
        },
      ],
    };
  }
  fetchCandidates();
});

onUnmounted(() => {
  if (headerConfig) {
    headerConfig.value = { title: '', buttons: [] };
  }
});

async function fetchCandidates() {
  loading.value = true;
  error.value = '';
  clearSelections();

  try {
    let query = supabase
      .from('reportes')
      .select(REPORT_FIELDS)
      .gte('fecha_cirugia', appliedFilters.value.from)
      .lte('fecha_cirugia', appliedFilters.value.to)
      .eq('estado', 'Pendiente')
      .order('fecha_cirugia', { ascending: true })
      .limit(1000);

    const { data, error: reportsError } = await query;
    if (reportsError) throw reportsError;

    reports.value = data || [];
  } catch (err) {
    console.error('Error al cargar candidatos del informe semanal:', err);
    error.value = 'No se pudieron cargar los candidatos. Intente nuevamente.';
    toast.error(error.value);
  } finally {
    loading.value = false;
  }
}

function applyFilters() {
  appliedFilters.value = { ...draftFilters };
  pendingSearch.value = '';
  withoutTechnicianSearch.value = '';
  fetchCandidates();
}

function resetFilters() {
  const defaults = getDefaultFilters();
  Object.assign(draftFilters, defaults);
  appliedFilters.value = { ...defaults };
  pendingSearch.value = '';
  withoutTechnicianSearch.value = '';
  fetchCandidates();
}

function clearSelections() {
  selectedPendingFichaIds.value = new Set();
  selectedWithoutTechnicianIds.value = new Set();
}

function togglePendingFichaSelection(id) {
  toggleSelection(selectedPendingFichaIds, id);
  removeSelection(selectedWithoutTechnicianIds, id);
}

function toggleWithoutTechnicianSelection(id) {
  toggleSelection(selectedWithoutTechnicianIds, id);
  removeSelection(selectedPendingFichaIds, id);
}

function toggleAllVisiblePendingFicha() {
  toggleVisibleSelection(selectedPendingFichaIds, selectedWithoutTechnicianIds, visiblePendingRowsForFicha);
}

function toggleAllVisibleWithoutTechnician() {
  toggleVisibleSelection(selectedWithoutTechnicianIds, selectedPendingFichaIds, visiblePendingRowsForTechnician);
}

function toggleSelection(selectionRef, id) {
  const next = new Set(selectionRef.value);
  next.has(id) ? next.delete(id) : next.add(id);
  selectionRef.value = next;
}

function removeSelection(selectionRef, id) {
  if (!selectionRef.value.has(id)) return;

  const next = new Set(selectionRef.value);
  next.delete(id);
  selectionRef.value = next;
}

function toggleVisibleSelection(targetSelectionRef, oppositeSelectionRef, visibleRows) {
  const visibleIds = visibleRows.value.map((row) => row.id);
  const next = new Set(targetSelectionRef.value);
  const oppositeNext = new Set(oppositeSelectionRef.value);
  const allSelected = visibleIds.length > 0 && visibleIds.every((id) => next.has(id));

  visibleIds.forEach((id) => {
    if (allSelected) {
      next.delete(id);
    } else {
      next.add(id);
      oppositeNext.delete(id);
    }
  });

  targetSelectionRef.value = next;
  oppositeSelectionRef.value = oppositeNext;
}

async function copyReport() {
  if (selectedCount.value === 0) return;

  try {
    if (navigator.clipboard?.write && window.ClipboardItem) {
      await navigator.clipboard.write([
        new ClipboardItem({
          'text/html': new Blob([reportHtml.value], { type: 'text/html' }),
          'text/plain': new Blob([reportPlainText.value], { type: 'text/plain' }),
        }),
      ]);
    } else {
      await navigator.clipboard.writeText(reportPlainText.value);
    }
    toast.success('Informe copiado al portapapeles.');
  } catch (err) {
    console.error('Error al copiar informe:', err);
    toast.error('No se pudo copiar el informe.');
  }
}

function toRow(report) {
  return {
    id: report.id,
    fecha: formatDate(report.fecha_cirugia),
    codigo: report.id_cirugia || 'N/A',
    paciente: report.paciente || 'N/A',
    institucion: report.lugar_cirugia || 'N/A',
    medico: report.medico || 'N/A',
    tecnico: report.instrumentador_completado || report.instrumentador || report.instrumentador_dni || 'N/A',
    estado: report.estado || 'Pendiente',
  };
}

function filterRows(rows, search, keys) {
  const query = normalize(search);
  if (!query) return rows;

  return rows.filter((row) => keys.some((key) => normalize(row[key]).includes(query)));
}

function buildReportHtml() {
  const period = `${formatDate(appliedFilters.value.from)} al ${formatDate(appliedFilters.value.to)}`;
  const sections = [];

  if (selectedPendingFichaRows.value.length > 0) {
    sections.push(buildHtmlSection('Fichas digitales pendientes de completar', selectedPendingFichaRows.value, pendingFichaColumns));
  }

  if (selectedWithoutTechnicianRows.value.length > 0) {
    sections.push(buildHtmlSection('Cirugias sin tecnico/instrumentador informado', selectedWithoutTechnicianRows.value, pendingColumns));
  }

  return `
    <div style="font-family: Arial, Helvetica, sans-serif; color: #111827; line-height: 1.4;">
      <h1 style="font-size: 22px; margin: 0 0 8px; color: #0f172a;">Informe Semanal - Gestion IQ</h1>
      <p style="margin: 0 0 18px; color: #475569;"><strong>Periodo:</strong> ${escapeHtml(period)}</p>
      ${sections.join('')}
    </div>
  `;
}

function buildHtmlSection(title, rows, columns) {
  return `
    <h2 style="font-size: 16px; margin: 20px 0 8px; color: #1e3a8a;">${escapeHtml(title)}</h2>
    <table style="width: 100%; border-collapse: collapse; font-size: 13px; margin-bottom: 18px;">
      <thead>
        <tr>
          ${columns.map((column) => `<th style="border: 1px solid #cbd5e1; background: #dbeafe; color: #0f172a; padding: 7px; text-align: left;">${escapeHtml(column.label)}</th>`).join('')}
        </tr>
      </thead>
      <tbody>
        ${rows.map((row) => `
          <tr>
            ${columns.map((column) => `<td style="border: 1px solid #cbd5e1; padding: 7px; vertical-align: top;">${escapeHtml(row[column.key])}</td>`).join('')}
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
}

function buildReportPlainText() {
  const lines = [
    'Informe Semanal - Gestion IQ',
    `Periodo: ${formatDate(appliedFilters.value.from)} al ${formatDate(appliedFilters.value.to)}`,
    '',
  ];

  appendPlainSection(lines, 'Fichas digitales pendientes de completar', selectedPendingFichaRows.value, pendingFichaColumns);
  appendPlainSection(lines, 'Cirugias sin tecnico/instrumentador informado', selectedWithoutTechnicianRows.value, pendingColumns);

  return lines.join('\n').trim();
}

function appendPlainSection(lines, title, rows, columns) {
  if (rows.length === 0) return;

  lines.push(title);
  rows.forEach((row) => {
    lines.push(columns.map((column) => `${column.label}: ${row[column.key]}`).join(' | '));
  });
  lines.push('');
}

function renderBodyCell(row, column) {
  const value = row[column.key];
  const title = typeof value === 'string' ? value : '';

  return h('td', { class: ['table-cell', column.class], key: column.key, title }, renderCell(row, column.key));
}

function renderCell(row, key) {
  if (key !== 'estado') return row[key];

  const classes = {
    Pendiente: 'bg-yellow-100 text-yellow-800',
  }[row.estado] || 'bg-slate-100 text-slate-700';

  return h('span', { class: `inline-flex rounded-full px-1.5 py-0.5 text-[11px] font-semibold leading-4 ${classes}` }, row.estado);
}

function getDefaultFilters() {
  const today = new Date();
  const day = today.getDay();
  const mondayOffset = day === 0 ? -6 : 1 - day;
  const monday = addDays(today, mondayOffset);
  const sunday = addDays(monday, 6);

  return {
    from: toInputDate(monday),
    to: toInputDate(sunday),
    status: 'Pendiente',
  };
}

function addDays(date, days) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function toInputDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function formatDate(value) {
  if (!value) return 'N/A';
  const [datePart] = String(value).split('T');
  const [year, month, day] = datePart.split('-');
  if (!year || !month || !day) return value;
  return `${day}/${month}/${year}`;
}

function normalize(value) {
  return String(value || '').trim().toLowerCase();
}

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
</script>

<style scoped>
.filter-field {
  @apply flex flex-col gap-1 text-sm font-medium text-slate-700 dark:text-slate-300;
}

.form-input {
  @apply w-full rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-900 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 dark:focus:ring-blue-950;
}

.primary-button {
  @apply rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50;
}

.secondary-button {
  @apply rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700;
}

.table-header {
  @apply truncate px-3 py-2 text-left text-[11px] font-semibold uppercase text-slate-500 dark:text-slate-300;
}

.table-cell {
  @apply truncate whitespace-nowrap px-3 py-2 text-sm leading-5 text-slate-700 dark:text-slate-200;
}
</style>
